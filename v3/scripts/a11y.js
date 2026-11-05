#!/usr/bin/env node
/* Runs axe-core (WCAG 2.1 A/AA + best practice) over every built page at desktop and 360px,
   and reports console errors and horizontal overflow at 360px.
   Usage (from v3/): npm install && node scripts/a11y.js   -> exits 1 on any problem */
"use strict";
const fs = require("fs");
const path = require("path");
const http = require("http");
const { chromium } = require("playwright");
const ROOT = path.resolve(__dirname, "..");
const AXE = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");

/* every built page: home plus each <route>/index.html */
const pages = ["/"];
(function walk(dir) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    if (["node_modules", "assets", "scripts", "content", "api", "tools", ".git", "artifact"].includes(f.name)) continue;
    const p = path.join(dir, f.name);
    if (f.isDirectory()) walk(p);
    else if (f.name === "index.html" && dir !== ROOT) pages.push("/" + path.relative(ROOT, dir).split(path.sep).join("/") + "/");
  }
})(ROOT);

const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".json": "application/json", ".svg": "image/svg+xml", ".webp": "image/webp", ".jpg": "image/jpeg", ".png": "image/png", ".txt": "text/plain" };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  if (p.endsWith("/")) p += "index.html";
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end("not found"); }
  res.writeHead(200, { "Content-Type": TYPES[path.extname(f)] || "application/octet-stream" });
  fs.createReadStream(f).pipe(res);
});

(async () => {
  await new Promise(r => server.listen(0, r));
  const base = `http://localhost:${server.address().port}`;
  const browser = await chromium.launch();
  let problems = 0;
  for (const route of pages) {
    for (const [w, h] of [[1280, 800], [360, 740]]) {
      const page = await browser.newPage({ viewport: { width: w, height: h } });
      const errors = [];
      page.on("pageerror", e => errors.push(e.message));
      page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
      page.on("requestfailed", r => { if (r.url().startsWith(base)) errors.push("failed to load " + r.url().replace(base, "")); });
      page.on("response", r => { if (r.url().startsWith(base) && r.status() >= 400) errors.push(`${r.status()} ${r.url().replace(base, "")}`); });
      // skip the once-per-session opening animation so the page is checked as a returning visitor sees it
      await page.addInitScript(() => { try { sessionStorage.setItem("srm-intro", "1"); } catch (e) {} });
      await page.goto(base + route, { waitUntil: "load" });
      // scroll through so scroll-revealed headings reach their resting state, as a reader would see them
      await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { scrollTo(0, y); await new Promise(r => setTimeout(r, 40)); } scrollTo(0, 0); });
      await page.waitForTimeout(1000);
      const out = [];
      errors.forEach(e => out.push("console: " + e));
      if (w === 360) {
        const over = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
        if (over > 0) {
          const culprits = await page.evaluate(() => [...document.querySelectorAll("body *")].filter(e => e.getBoundingClientRect().right > innerWidth + 1 && !e.closest(".tablewrap,.cmp__table,.rail__track,.reel__track,[data-overflow-ok]")).slice(0, 4).map(e => e.tagName.toLowerCase() + (e.className && typeof e.className === "string" ? "." + e.className.split(" ")[0] : "")));
          out.push(`layout: page is ${over}px wider than 360px (${culprits.join(", ")})`);
        }
      }
      await page.addScriptTag({ content: AXE });
      const res = await page.evaluate(() => axe.run(document, { runOnly: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"] }));
      res.violations.forEach(v => out.push(`axe ${v.id} (${v.impact}) x${v.nodes.length}: ${v.nodes.slice(0, 3).map(n => n.target.join(" ")).join(" | ")}`));
      if (out.length) { problems += out.length; console.log(`${route} @${w}px`); out.forEach(o => console.log("  " + o)); }
      await page.close();
    }
  }
  await browser.close(); server.close();
  console.log(`Checked ${pages.length} pages at 1280px and 360px: ${problems ? problems + " problem(s)" : "no problems"}.`);
  process.exit(problems ? 1 : 0);
})().catch(e => { console.error(e); server.close(); process.exit(1); });
