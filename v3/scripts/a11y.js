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
    for (const [w, h] of [[1440, 900], [1024, 768], [768, 1024], [360, 740]]) {
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
      {
        const over = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
        if (over > 0) {
          const culprits = await page.evaluate(() => [...document.querySelectorAll("body *")].filter(e => e.getBoundingClientRect().right > innerWidth + 1 && !e.closest(".tablewrap,.cmp__table,.rail__track,.reel__track,[data-overflow-ok]")).slice(0, 4).map(e => e.tagName.toLowerCase() + (e.className && typeof e.className === "string" ? "." + e.className.split(" ")[0] : "")));
          out.push(`layout: page is ${over}px wider than ${w}px (${culprits.join(", ")})`);
        }
      }
      await page.addScriptTag({ content: AXE });
      const res = await page.evaluate(() => axe.run(document, { runOnly: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"] }));
      res.violations.forEach(v => out.push(`axe ${v.id} (${v.impact}) x${v.nodes.length}: ${v.nodes.slice(0, 3).map(n => n.target.join(" ")).join(" | ")}`));
      if (out.length) { problems += out.length; console.log(`${route} @${w}px`); out.forEach(o => console.log("  " + o)); }
      await page.close();
    }
  }
  /* ---------- interactive states: open panels and drive the new controls, then run axe again ---------- */
  const SCENARIOS = [
    ["/", "Ask panel (Ctrl+K)", async p => { await p.keyboard.press("Control+k"); await p.waitForSelector("[data-askp]:not([hidden])"); await p.fill("#askp-q", "B.Tech under 3 lakh at Kattankulathur"); await p.press("#askp-q", "Enter"); await p.waitForSelector(".askp .intent"); }],
    ["/", "Ask panel, cited answer", async p => { await p.click("[data-ask-open]"); await p.fill("#askp-q", "How do I book a hostel?"); await p.press("#askp-q", "Enter"); await p.waitForSelector(".askp .ai__quote"); }],
    ["/", "Hero programme search", async p => { await p.fill("#hero-q", "MBA at Kattankulathur"); await p.press("#hero-q", "Enter"); await p.waitForSelector("[data-ai] .intent"); }],
    ["/about/", "Reading preferences", async p => { await p.click("[data-prefs-open]"); await p.check('input[name="pref-size"][value="2"]'); await p.check('[data-pref="contrast"]'); await p.check('[data-pref="dyslexia"]'); }],
    ["/about/", "Dropdown open", async p => { await p.hover('[data-dd] .nav__top >> nth=0'); await p.waitForSelector(".nav__panel:not([hidden])"); }],
    ["/programs/", "Compare tray and table", async p => { const b = await p.$$("[data-compare]"); await b[0].click(); await b[1].click(); await p.waitForSelector("[data-ctray]:not([hidden])"); }],
    ["/programs/", "Saved drawer", async p => { const h = await p.$$("[data-save]"); await h[0].click(); await h[1].click(); await p.click("[data-saved-open]"); await p.waitForSelector("[data-saved]:not([hidden])"); }],
    ["/admissions/", "Route selector result", async p => { await p.click('.optcard:has(input[value="india"])'); await p.click('.optcard:has(input[value="UG"])'); await p.click('.optcard:has(input[value="engineering"])'); await p.waitForSelector(".route__res"); }],
    ["/admissions/scholarships/", "Estimator result", async p => { await p.selectOption("[data-est-prog]", "b-tech-computer-science-and-engineering"); await p.fill("[data-est-rank]", "180"); await p.waitForTimeout(100); }],
    ["/contact/", "Office picker", async p => { await p.click('.optcard:has(input[value="hostels"])'); }],
    ["/academics/departments/", "Research centres tab", async p => { await p.click("#dx-t2"); await p.fill("[data-dx-q]", "centre"); }]
  ];
  for (const [route, label, act] of SCENARIOS) {
    for (const [w, h] of (/Dropdown/.test(label) ? [[1440, 900], [1024, 768]] : [[1440, 900], [360, 740]])) {
      const page = await browser.newPage({ viewport: { width: w, height: h } });
      const errors = [];
      page.on("pageerror", e => errors.push(e.message));
      page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
      await page.addInitScript(() => { try { sessionStorage.setItem("srm-intro", "1"); } catch (e) {} });
      await page.goto(base + route, { waitUntil: "load" });
      await page.waitForTimeout(250);
      const out = [];
      try { await act(page); await page.waitForTimeout(300); } catch (e) { out.push("interaction failed: " + e.message.split("\n")[0]); }
      errors.forEach(e => out.push("console: " + e));
      const over = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      if (over > 0) out.push(`layout: page is ${over}px wider than ${w}px`);
      await page.addScriptTag({ content: AXE });
      const res = await page.evaluate(() => axe.run(document, { runOnly: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"] }));
      res.violations.forEach(v => out.push(`axe ${v.id} (${v.impact}) x${v.nodes.length}: ${v.nodes.slice(0, 3).map(n => n.target.join(" ")).join(" | ")}`));
      if (out.length) { problems += out.length; console.log(`${route} [${label}] @${w}px`); out.forEach(o => console.log("  " + o)); }
      await page.close();
    }
  }
  await browser.close(); server.close();
  console.log(`Checked ${pages.length} pages at 1440, 1024, 768 and 360px, plus interactive states: ${problems ? problems + " problem(s)" : "no problems"}.`);
  process.exit(problems ? 1 : 0);
})().catch(e => { console.error(e); server.close(); process.exit(1); });
