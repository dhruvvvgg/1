#!/usr/bin/env node
/* Crawls the built site from the home page and checks:
   - every internal link resolves to a built file, and every #anchor exists on its target page
   - every external link opens in a new tab with rel="noopener noreferrer", the marker icon and hidden text
   - every page has a noindex robots meta, one <h1> and a unique <title>
   Usage (from v3/): node scripts/check-links.js   -> exits 1 on any failure */
"use strict";
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");

const fileFor = urlPath => {
  let p = decodeURIComponent(urlPath.split(/[?#]/)[0]);
  if (p.endsWith("/")) p += "index.html";
  const f = path.join(ROOT, p);
  if (fs.existsSync(f) && fs.statSync(f).isFile()) return f;
  if (fs.existsSync(f) && fs.statSync(f).isDirectory() && fs.existsSync(path.join(f, "index.html"))) return path.join(f, "index.html");
  return null;
};
const idsOf = html => new Set([...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]));
const failures = [];
const fail = (page, msg) => failures.push(`${page}: ${msg}`);

const queue = ["/"], seen = new Set(), titles = new Map();
const pages = new Map();
while (queue.length) {
  const route = queue.shift();
  if (seen.has(route)) continue;
  seen.add(route);
  const file = fileFor(route);
  if (!file) { fail(route, "page not found"); continue; }
  const html = fs.readFileSync(file, "utf8");
  pages.set(route, html);

  if (!/<meta name="robots" content="noindex, nofollow">/.test(html)) fail(route, "missing noindex robots meta");
  const h1s = (html.match(/<h1\b/g) || []).length;
  if (h1s !== 1) fail(route, `expected one <h1>, found ${h1s}`);
  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1];
  if (!title) fail(route, "missing <title>");
  else if (titles.has(title)) fail(route, `duplicate <title> also used on ${titles.get(title)}`);
  else titles.set(title, route);
  if (/\b(concept|prototype)\b/i.test(html.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<!-- build:strip -->[\s\S]*?<!-- \/build:strip -->/g, "").replace(/<!--[\s\S]*?-->/g, "").replace(/<[^>]+>/g, " "))) fail(route, "visible text mentions concept or prototype");

  for (const m of html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)) {
    const attrs = m[1], inner = m[2];
    const href = (attrs.match(/\bhref="([^"]*)"/) || [])[1];
    if (href == null) continue;
    if (/^(mailto:|tel:)/.test(href)) continue;
    if (/^https?:\/\//.test(href)) {
      if (!/\btarget="_blank"/.test(attrs)) fail(route, `external link without target="_blank": ${href}`);
      const rel = (attrs.match(/\brel="([^"]*)"/) || [])[1] || "";
      if (!/\bnoopener\b/.test(rel) || !/\bnoreferrer\b/.test(rel)) fail(route, `external link without rel="noopener noreferrer": ${href}`);
      if (!/\bdata-ext\b/.test(attrs)) fail(route, `external link without the external arrow marker (data-ext): ${href}`);
      if (!/<span class="sr-only">\s*\(opens [^<]+\)<\/span>/.test(inner)) fail(route, `external link without hidden "(opens …)" text: ${href}`);
      continue;
    }
    if (href.startsWith("#")) {
      if (href.length > 1 && !idsOf(html).has(href.slice(1))) fail(route, `missing anchor ${href}`);
      continue;
    }
    if (!href.startsWith("/")) { fail(route, `relative internal link (use a root path): ${href}`); continue; }
    const [p, hash] = href.split("#");
    const target = fileFor(p);
    if (!target) { fail(route, `broken internal link ${href}`); continue; }
    if (hash && !idsOf(fs.readFileSync(target, "utf8")).has(hash)) fail(route, `missing anchor ${href}`);
    if (target.endsWith(".html")) {
      const r = p.split("?")[0];
      queue.push(r.endsWith("/") || r.endsWith(".html") ? r : r + "/");
    }
  }
}
if (!fs.existsSync(path.join(ROOT, "robots.txt")) || !/Disallow: \//.test(fs.readFileSync(path.join(ROOT, "robots.txt"), "utf8"))) fail("/robots.txt", "missing or does not disallow all");

console.log(`Checked ${pages.size} pages.`);
if (failures.length) {
  console.log(`${failures.length} problem(s):`);
  failures.forEach(f => console.log("  " + f));
  process.exit(1);
}
console.log("No link problems.");
fs.writeFileSync(path.join(__dirname, ".pages.json"), JSON.stringify([...pages.keys()]));
