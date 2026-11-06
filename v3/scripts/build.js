#!/usr/bin/env node
/* Builds the inner pages of the SRMIST site from /content/*.json.
   Usage (from v3/): node scripts/build.js
   Writes <route>/index.html for every page, rewires the home page header/footer,
   and writes assets/data/ask-index.json for the home page search. */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const C = name => JSON.parse(fs.readFileSync(path.join(ROOT, "content", name + ".json"), "utf8"));
const SIZES = JSON.parse(fs.readFileSync(path.join(__dirname, "img-sizes.json"), "utf8"));
const ORIGIN = "https://www.srmist.edu.in";
const nav = C("nav"), urlMap = C("url-map"), P = C("programs");

/* ---------- small helpers ---------- */
const esc = s => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const slug = s => String(s).toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const strip = h => String(h).replace(/<span class="sr-only">[^<]*<\/span>/g, " ").replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").replace(/&[a-z]+;/g, " ").replace(/\s+/g, " ").trim();
const inr = n => "₹" + Number(n).toLocaleString("en-IN");
const local = p => (p === "/" ? "/" : p.replace(/\/?$/, "/"));

/* original URL -> local route, exact matches only */
const toLocal = new Map();
for (const [loc, orig] of Object.entries(urlMap)) {
  if (loc.startsWith("_") || loc.includes("<")) continue;
  toLocal.set(orig.replace(/\/$/, "").toLowerCase(), local(loc));
}
const absUrl = h => (/^https?:\/\//.test(h) ? h : h.startsWith("/") ? ORIGIN + h : h);
const mapped = h => toLocal.get(absUrl(h).replace(/[#?].*$/, "").replace(/\/$/, "").replace(/^http:/, "https:").toLowerCase());

const EXT_ICON = ""; // the visible arrow comes from the site's a[data-ext]::after rule
const srText = href => /(^|\.)srmist\.edu\.in$/.test(new URL(href).hostname)
  ? " (opens the original SRMIST site)" : " (opens an external site in a new tab)";
/* external link: always new tab, marker icon and hidden text; never rewritten */
const ext = (href, text, cls = "") => {
  const h = absUrl(href);
  return `<a${cls ? ` class="${cls}"` : ""} href="${esc(h)}" target="_blank" rel="noopener noreferrer" data-ext>${text}${EXT_ICON}<span class="sr-only">${srText(h)}</span></a>`;
};
/* content link: local page if built (item.local or exact url-map match), otherwise external */
const link = (item, cls = "") => {
  const text = esc(item.text || item.label || item.name || item.title);
  const loc = item.local ? local(item.local) : item.href ? mapped(item.href) : null;
  if (loc) return `<a${cls ? ` class="${cls}"` : ""} href="${loc}">${text}</a>`;
  if (item.ext || item.href) return ext(item.ext || item.href, text, cls);
  return text;
};
const img = (src, alt, cls = "", eager = false) => {
  const key = src.replace(/^\//, "");
  const [w, h] = SIZES[key] || [1600, 1000];
  return `<img${cls ? ` class="${cls}"` : ""} src="${src}" alt="${esc(alt)}" width="${w}" height="${h}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;
};

/* ---------- search index for Ask SRM ---------- */
const askChunks = [];
let current = null; // { route, title }
const record = (id, heading, html) => {
  const text = strip(html);
  if (current && text.length > 30) askChunks.push({ u: current.route + (id ? "#" + id : ""), p: current.title, h: heading, t: text });
};

/* ---------- building blocks ---------- */
const para = arr => (arr || []).map(p => `<p>${esc(p)}</p>`).join("");
const bullets = (arr, cls = "bullets") => (arr && arr.length ? `<ul class="${cls}">${arr.map(x => `<li>${typeof x === "string" ? esc(x) : link(x)}</li>`).join("")}</ul>` : "");
const linkList = arr => (arr && arr.length ? `<ul class="linklist">${arr.map(x => `<li>${link(x)}</li>`).join("")}</ul>` : "");
/* ---------- photos, by topic (files already in assets/img) ---------- */
const PHOTO = {
  lab: ["/assets/img/bg/lab-research.webp", "A researcher at a microscope workstation in a laboratory"],
  ideathon: ["/assets/img/bg/ideathon.webp", "Student winners holding a certificate on stage at an ideathon"],
  biotech: ["/assets/img/bg/biotech-block-1.webp", "The Biotech Block, a glass-fronted building on campus"],
  milanStage: ["/assets/img/bg/milan-stage.webp", "Performers gathered on the stage at Milan, the campus cultural festival"],
  milanDance: ["/assets/img/bg/milan-dance.webp", "Dancers in green performing at Milan"],
  hostelK: ["/assets/img/bg/hostel-kalpana.webp", "The Kalpana Chawla hostel block among trees"],
  hostelOff: ["/assets/img/srmist-hostel-official.webp", "Hostel buildings with lawns in front"],
  sports: ["/assets/img/srmist-sports-official.webp", "A women's sports team lined up on a court"],
  aerial: ["/assets/img/srmist-aerial-official.webp", "Aerial view of the Kattankulathur campus"],
  convocation: ["/assets/img/bg/off-convocation.webp", "Graduates and dignitaries on stage at the 22nd Convocation"],
  admissions: ["/assets/img/bg/off-admissions.webp", "A group of students standing together on campus"],
  ub: ["/assets/img/bg/srm-university-auditorium.webp", "The colonnaded University Building at dusk"],
  grounds: ["/assets/img/bg/srm-university-campus-chennai-tamil-nadu.webp", "Campus lawns and roads seen from a height"],
  formula: ["/assets/img/bg/off-formula-bharat.webp", "The student Formula Bharat team with their race car"],
  techpark: ["/assets/img/bg/tech-park.webp", "The SRM Tech Park building with its yellow and blue facade"],
  lecture: ["/assets/img/hero/learn.webp", "Students in a lecture hall during a talk"],
  medicine: ["/assets/img/bg/off-medicine-lab.webp", "Medical students in white coats with anatomy specimens"],
  dentistry: ["/assets/img/bg/off-dentistry.webp", "A dental student at work in a dental clinic"],
  management: ["/assets/img/bg/off-management.webp", "Management students in a classroom"],
  law: ["/assets/img/bg/off-law-students.webp", "Law students in blazers outside a campus building"],
  agriculture: ["/assets/img/bg/off-agriculture.webp", "Students tending plants in a greenhouse"],
  architecture: ["/assets/img/bg/off-architecture.webp", "Architecture students working on a scale model"]
};
const collegePhoto = name => {
  const n = String(name).toLowerCase();
  if (/dent/.test(n)) return "dentistry";
  if (/medic|health|nursing|pharm/.test(n)) return "medicine";
  if (/architect|design/.test(n)) return "architecture";
  if (/agri/.test(n)) return "agriculture";
  if (/law/.test(n)) return "law";
  if (/management|business|commerce/.test(n)) return "management";
  if (/engineer/.test(n)) return "techpark";
  if (/science|humanities|liberal/.test(n)) return "lecture";
  return null;
};
const photo = (key, cls = "", eager = false) => { const [src, alt] = PHOTO[key]; return img(src, alt, cls, eager); };
const frame = key => `<figure class="frame">${photo(key, "frame__img")}</figure>`;

/* ---------- sections: one layout variant each, never three of the same in a row ---------- */
let variantRun = [];
let splitFlip = false;
const sec = (id, heading, intro, body, opts = {}) => {
  if (typeof opts === "string") opts = {};
  const v = opts.v || "list";
  variantRun.push(v);
  const n = variantRun.length;
  if (n >= 3 && variantRun[n - 1] === variantRun[n - 2] && variantRun[n - 2] === variantRun[n - 3])
    console.warn(`layout: three "${v}" sections in a row on ${current && current.route} (at #${id})`);
  const head = `<div class="s-head"><h2 id="${id}-h">${esc(heading)}</h2>${intro ? `<p>${esc(intro)}</p>` : ""}</div>`;
  let html;
  if (v === "split") {
    splitFlip = !splitFlip;
    html = `<section class="sec sec--split${splitFlip ? "" : " sec--flip"}" id="${id}" aria-labelledby="${id}-h">
  <div class="wrap sec-split"><div class="sec-split__text">${head}${body}</div>${frame(opts.img)}</div>
</section>`;
  } else if (v === "band") {
    html = `<section class="sec sec--band" id="${id}" aria-labelledby="${id}-h">
  <div class="wrap band"><div class="band__head"><h2 id="${id}-h">${esc(heading)}</h2>${intro ? `<p>${esc(intro)}</p>` : ""}</div><div class="band__body">${body}</div></div>
</section>`;
  } else {
    html = `<section class="sec sec--${v} section section--tight wrap" id="${id}" aria-labelledby="${id}-h">
  ${head}
  ${body}
</section>`;
  }
  record(id, heading, (intro || "") + " " + body);
  return html;
};
/* numbers that appear word for word in the content, each with its own label */
const statRow = items => `<dl class="statrow">${items.map(([n, l]) => `<div><dt>${esc(l)}</dt><dd>${esc(n)}</dd></div>`).join("")}</dl>`;
/* mission, values and recognition: numbered cards */
const numCards = arr => (arr && arr.length ? `<ol class="numcards">${arr.map(x => `<li><p>${esc(x)}</p></li>`).join("")}</ol>` : "");
const pull = text => `<blockquote class="pull"><p>${esc(text)}</p></blockquote>`;
const pullMany = arr => `<blockquote class="pull">${(arr || []).map(t => `<p>${esc(t)}</p>`).join("")}</blockquote>`;
/* a card with a photo on top when the item is a place or a college */
const placeCard = (title, inner, key) => `<li class="ccard${key ? " ccard--img" : ""}">${key ? photo(key, "ccard__img") : ""}<div class="ccard__in"><h3>${title}</h3>${inner}</div></li>`;
const person = (p, extra = "") => `<div class="person-card">
  <p class="person-card__name">${esc(p.name)}</p>${p.role ? `<p class="person-card__role">${esc(p.role)}</p>` : ""}
  ${p.office ? `<p>${esc(p.office)}</p>` : ""}
  <ul class="contact-list">${p.email ? `<li><span>Email</span><a href="mailto:${esc(p.email)}">${esc(p.email)}</a></li>` : ""}${p.phone ? `<li><span>Phone</span>${esc(p.phone)}</li>` : ""}</ul>${extra}
</div>`;
const cards = items => `<ul class="cardgrid">${items.map(c => `<li class="ccard">
  <h3>${c.title}</h3>${c.text ? `<p>${esc(c.text)}</p>` : ""}${c.links ? `<div class="ccard__links">${c.links}</div>` : ""}</li>`).join("")}</ul>`;

/* ---------- shared chrome ---------- */
const navLink = it => (it.local ? `<a href="${local(it.local)}">${esc(it.label)}</a>` : ext(it.ext, esc(it.label)));
/* aria-current for the page itself ("page") and for its section ("true") */
const curAttr = loc => {
  const r = current ? current.route : "/", l = local(loc);
  if (r === l) return ' aria-current="page"';
  if (l !== "/" && r.startsWith(l)) return ' aria-current="true"';
  return "";
};
const navItem = p => {
  if (!p.children) return `<a class="nav__top" href="${local(p.local)}"${curAttr(p.local)}>${esc(p.label)}</a>`;
  const id = "dd-" + slug(p.label);
  return `<div class="nav__item" data-dd>
        <a class="nav__top" href="${local(p.local)}"${curAttr(p.local)}>${esc(p.label)}</a>
        <button class="nav__caret" type="button" aria-expanded="false" aria-controls="${id}"><span class="sr-only">${esc(p.label)} pages</span><svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 4.5 6 8l3.5-3.5"/></svg></button>
        <div class="nav__panel" id="${id}" hidden><ul>
          <li><a href="${local(p.local)}"${curAttr(p.local) && current.route === local(p.local) ? ' aria-current="page"' : ""}>${esc(p.label)} overview</a></li>
          ${p.children.map(c => `<li>${c.local ? `<a href="${local(c.local)}"${curAttr(c.local)}>${esc(c.label)}</a>` : ext(c.ext, esc(c.label))}</li>`).join("")}
        </ul></div>
      </div>`;
};
const SUGGESTED = ["How do I book a hostel?", "What scholarships are there for engineering?", "How do international students apply?", "Who do I contact at the Career Centre?"];
const PROG_CHIPS = ["B.Tech under 3 lakh at Kattankulathur", "Law programmes", "MBA at Kattankulathur", "Diploma programmes", "Undergraduate under 1 lakh", "Agriculture programmes"];
const MAIN_PHONE = C("contact").phones[0];
const header = () => `<!-- build:header -->
<header class="header">
  <div class="wrap">
    <a class="brand" href="/"><img src="/assets/img/srm-logo.svg" alt="SRM Institute of Science and Technology, home" width="156" height="52"></a>
    <nav class="nav" aria-label="Main" data-nav>
      ${nav.primary.map(p => `<a href="${local(p.local)}">${esc(p.label)}</a>`).join("\n      ")}
    </nav>
    <a class="pill pill--accent header__apply" href="${esc(nav.cta.apply.ext)}" target="_blank" rel="noopener noreferrer" data-ext>${esc(nav.cta.apply.label)}${EXT_ICON}<span class="sr-only"> (opens the original SRMIST site)</span></a>
    <button class="menu-btn" type="button" aria-expanded="false" aria-controls="menu" data-menu-open>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h16M4 16h16"/></svg>
      <span class="sr-only">Open menu</span>
    </button>
  </div>
</header>

<div class="menu" id="menu" role="dialog" aria-modal="true" aria-label="Site menu" hidden data-menu>
  <div class="wrap">
    <div class="menu__top">
      <a class="brand" href="/"><img src="/assets/img/srm-logo.svg" alt="SRM Institute of Science and Technology, home" width="156" height="52"></a>
      <button class="menu-btn" type="button" data-menu-close>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>
        <span class="sr-only">Close menu</span>
      </button>
    </div>
    <div class="menu__grid ui">
      ${nav.primary.filter(p => p.label !== "International").map(p => `<div><h2><a href="${local(p.local)}">${esc(p.label)}</a></h2><ul>${(p.children || []).map(c => `<li>${navLink(c)}</li>`).join("")}</ul></div>`).join("\n      ")}
    </div>
    <ul class="menu__secondary ui">${nav.secondary_bar.map(s => `<li>${navLink(s)}</li>`).join("")}</ul>
    <ul class="menu__campuses ui" aria-label="Campuses">${nav.campuses.map(c => `<li>${ext(c.ext, esc(c.name))}</li>`).join("")}</ul>
  </div>
</div>

<div class="askp" id="ask-panel" role="dialog" aria-modal="true" aria-labelledby="askp-title" hidden data-askp>
  <div class="askp__box">
    <div class="askp__top"><h2 id="askp-title" class="askp__title">Ask SRM</h2>
      <button class="iconbtn" type="button" data-askp-close><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg><span class="sr-only">Close Ask SRM</span></button></div>
    <form class="askp__form" role="search" data-askp-form>
      <label class="sr-only" for="askp-q">Ask a question or describe a programme</label>
      <input id="askp-q" type="search" autocomplete="off" placeholder="Ask a question, or try “B.Tech under 3 lakh”">
      <button class="pill pill--ink" type="submit">Ask</button>
    </form>
    <div class="askp__chips">
      <p class="askp__label" id="askp-sq">Suggested questions</p>
      <ul class="chipbtns" aria-labelledby="askp-sq">${SUGGESTED.map(q => `<li><button type="button" class="chipbtn" data-ask-chip>${esc(q)}</button></li>`).join("")}</ul>
      <p class="askp__label" id="askp-pq">Find programmes</p>
      <ul class="chipbtns" aria-labelledby="askp-pq">${PROG_CHIPS.map(q => `<li><button type="button" class="chipbtn" data-ask-chip>${esc(q)}</button></li>`).join("")}</ul>
    </div>
    <div class="askp__out" aria-live="polite" data-askp-out></div>
    <p class="ai__note">Answers come from a live web search with links to the sources, or from this site’s pages when search is unavailable.</p>
  </div>
</div>

<nav class="mbar" aria-label="Quick actions" data-mbar>
  <a class="mbar__item" href="/programs/"${curAttr("/programs")}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h10"/></svg><span>Programs</span></a>
  <a class="mbar__item" href="/admissions/scholarships/#estimate"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4h10M7 8h10M7 4c5 0 5 8 0 8l8 8"/></svg><span>Fees</span></a>
  <a class="mbar__item" href="tel:${MAIN_PHONE.replace(/[^+\d]/g, "")}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg><span>Call</span></a>
  <a class="mbar__item mbar__item--apply" href="${esc(nav.cta.apply.ext)}" target="_blank" rel="noopener noreferrer" data-ext>${esc(nav.cta.apply.label.replace(/ now$/i, ""))}<span class="sr-only"> (opens the original SRMIST site)</span></a>
</nav>
<!-- /build:header -->`;

const STRIP = `<!-- build:strip --><aside class="concept-strip" aria-label="About this site"><div class="wrap"><span>Concept redesign entered in the SRM Website Design Challenge 2026. This is not the official SRMIST website.</span>${ext("https://www.srmist.edu.in/", "Go to the official site, srmist.edu.in")}</div></aside><!-- /build:strip -->`;
/* reading preferences are applied before first paint, so there is no flash */
const PREPAINT = `<script>
(function () { try {
  var p = JSON.parse(localStorage.getItem("srm-prefs") || "{}"), c = document.documentElement.classList;
  if (p.size) c.add("pref-size-" + p.size);
  if (p.contrast) c.add("pref-contrast");
  if (p.dyslexia) c.add("pref-dyslexia");
  if (p.motion) c.add("pref-motion");
} catch (e) {} })();
</script>`;

const audienceBar = () => `<!-- build:audience -->
<nav class="iam" aria-label="Information for"><div class="wrap"><span class="iam__label">For</span><ul>
  ${nav.audience_bar.map(a => { const h = nav.audience_ext[a]; return `<li>${h.startsWith("/") ? `<a href="${local(h)}">${esc(a)}</a>` : ext(h, esc(a))}</li>`; }).join("\n  ")}
</ul></div></nav>
<!-- /build:audience -->`;

const footer = () => `<!-- build:footer -->
<footer class="footer" id="footer">
  <div class="footer__frame">
  <div class="footer__top">
    <div>
      <a class="footer__logo" href="/"><img src="/assets/img/srm-logo.svg" alt="SRM Institute of Science and Technology" width="168" height="56" loading="lazy"></a>
      <address>${esc(C("contact").address)}<br>${C("contact").phones.map(esc).join(", ")}</address>
    </div>
    ${nav.primary.filter(p => p.children).slice(0, 4).map(p => `<details data-acc open><summary>${esc(p.label)}</summary><ul><li><a href="${local(p.local)}">${esc(p.label)} overview</a></li>${p.children.slice(0, 4).map(c => `<li>${navLink(c)}</li>`).join("")}</ul></details>`).join("\n    ")}
  </div>
  <div class="footer__bar">
    <ul class="social" aria-label="Social media">
      <li>${ext("https://www.instagram.com/SRMUniversityOfficial/", '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="f" d="M12 7.2a4.8 4.8 0 1 0 0 9.6 4.8 4.8 0 0 0 0-9.6zm0 7.9a3.1 3.1 0 1 1 0-6.2 3.1 3.1 0 0 1 0 6.2zM17 5.8a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2zM12 3c-2.4 0-2.7 0-3.7.1C4.9 3.2 3.2 4.9 3.1 8.3 3 9.3 3 9.6 3 12s0 2.7.1 3.7c.1 3.4 1.8 5.1 5.2 5.2 1 .1 1.3.1 3.7.1s2.7 0 3.7-.1c3.4-.1 5.1-1.8 5.2-5.2.1-1 .1-1.3.1-3.7s0-2.7-.1-3.7c-.1-3.4-1.8-5.1-5.2-5.2C14.7 3 14.4 3 12 3zm0 1.6c2.4 0 2.6 0 3.6.1 2.4.1 3.6 1.3 3.7 3.7.1.9.1 1.2.1 3.6s0 2.7-.1 3.6c-.1 2.4-1.3 3.6-3.7 3.7-.9.1-1.2.1-3.6.1s-2.7 0-3.6-.1c-2.4-.1-3.6-1.3-3.7-3.7-.1-.9-.1-1.2-.1-3.6s0-2.7.1-3.6c.1-2.4 1.3-3.6 3.7-3.7.9-.1 1.2-.1 3.6-.1z"/></svg><span class="sr-only">Instagram</span>')}</li>
      <li>${ext("https://www.linkedin.com/company/srm-ist-chennai", '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="f" d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.5h4v11H3zM9.5 9.5h3.8v1.5h.1c.5-1 1.8-1.8 3.7-1.8 4 0 4.7 2.6 4.7 6v6.3h-4v-5.6c0-1.3 0-3-1.9-3s-2.1 1.4-2.1 2.9v5.7h-4z"/></svg><span class="sr-only">LinkedIn</span>')}</li>
      <li>${ext("https://www.youtube.com/user/SRMeducation", '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="f" d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2C2 8.8 2 12 2 12s0 3.2.4 4.8a2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8c.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8zM10 15V9l5.2 3z"/></svg><span class="sr-only">YouTube</span>')}</li>
      <li>${ext("https://twitter.com/SRM_Univ", '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="f" d="M17.7 3h3.1l-6.8 7.7L22 21h-6.3l-4.9-6.4L5.2 21H2.1l7.3-8.3L2 3h6.4l4.4 5.9zm-1.1 16.2h1.7L7.5 4.7H5.7z"/></svg><span class="sr-only">X</span>')}</li>
    </ul>
    <p class="footer__copyright">© 2026 SRM Institute of Science and Technology.<br><span class="footer__proposal">Redesign proposal for SRMIST</span></p>
  </div>
  <div class="footer__legal">
    <ul><li><a href="/contact/">Contact</a></li><li><a href="/parents/">Parents</a></li><li>${ext("https://www.srmist.edu.in/privacy-policy/", "Privacy")}</li><li>${ext("https://www.srmist.edu.in/terms-and-conditions/", "Terms")}</li><li>${ext("https://www.srmist.edu.in/iqac/public-disclosure/", "Mandatory disclosures")}</li></ul>
  </div>
  </div>
  <figure class="campus-ending">
    <img class="campus-ending__art" src="/assets/img/ub-lakeside-footer.webp" alt="Illustrated lakeside view of SRM’s University Building, with its sandstone tower, teal arched windows and lower right wing behind campus trees" width="1860" height="846" loading="lazy" decoding="async">
  </figure>
</footer>
<!-- /build:footer -->`;

const HEAD_COMMON = `<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#fafafa">
<link rel="icon" href="data:,">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400&display=swap">`;

/* ---------- the seven templates ---------- */
const crumbs = trail => `<nav class="crumbs wrap" aria-label="Breadcrumb"><ol>${trail.map((t, i) => i === trail.length - 1 ? `<li aria-current="page">${esc(t[0])}</li>` : `<li><a href="${t[1]}">${esc(t[0])}</a></li>`).join("")}</ol></nav>`;
const pageHero = (title, lead, bg) => `<section class="bgsec bgsec--hero bgsec--inner" aria-labelledby="page-h1">
    ${img(bg, "", "bgsec__img", true)}
    <div class="wrap bgsec__in">
      <h1 id="page-h1">${esc(title)}</h1>
      ${lead ? `<p>${esc(lead)}</p>` : ""}
    </div>
  </section>`;
const toc = items => `<nav class="toc wrap" aria-label="On this page"><ul>${items.map(([id, t]) => `<li><a href="#${id}">${esc(t)}</a></li>`).join("")}</ul></nav>`;

function render(page) {
  current = { route: local(page.route), title: page.title };
  if (page.lead) askChunks.push({ u: current.route, p: page.title, h: page.title, t: page.lead });
  variantRun = []; splitFlip = false;
  let body = page.body(); // records Ask chunks as sections render
  body = body.replace(/<p>(?![\s\S]*?<p class="lead">)/, '<p class="lead">');
  const trail = [["Home", "/"], ...(page.parent ? [page.parent] : []), [page.crumb || page.title, current.route]];
  const html = `<!doctype html>
<html lang="en-IN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(page.title)} | SRM Institute of Science and Technology</title>
<meta name="description" content="${esc(page.description || page.lead || page.title)}">
${HEAD_COMMON}
<link rel="stylesheet" href="/assets/css/site.css">
<link rel="stylesheet" href="/assets/css/inner.css">
</head>
<body class="inner inner--${page.template}">
<a class="skip" href="#main">Skip to main content</a>
${STRIP}
${header()}
${audienceBar()}
<main id="main">
  ${pageHero(page.h1 || page.title, page.lead, page.bg)}
  ${crumbs(trail)}
  ${page.toc ? toc(page.toc) : ""}
${body}
</main>
${footer()}
<script src="/assets/js/site.js" defer></script>
<script src="/assets/js/features.js" defer></script>
<script src="/assets/js/inner.js" defer></script>
</body>
</html>
`;
  const out = path.join(ROOT, page.route.replace(/^\//, ""), "index.html");
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, html);
  return out;
}
/* Template names used by the pages below: hub, listing, detail, college, news-events, content, contact. */

/* ---------- programme helpers ---------- */
const COLS = P.columns;
const progs = P.rows.map(r => Object.fromEntries(COLS.map((c, i) => [c, r[i]])));
const CSE = "b-tech-computer-science-and-engineering";
const LEVEL = P.levels, CAMPUS = P.campuses;
const shown = p => ({
  duration: p.duration_years && !(p.slug.includes("blockchain") && p.duration_years === 2) ? p.duration_years : null,
  fee: p.annual_fee_inr || null,
  intake: p.intake && p.intake > 1 ? p.intake : null
});
const progHref = p => (p.slug === CSE ? "/programs/btech-cse/" : `https://www.srmist.edu.in/program/${p.slug}/`);
const progLink = (p, text, cls) => (p.slug === CSE ? `<a${cls ? ` class="${cls}"` : ""} href="/programs/btech-cse/">${text}</a>` : ext(progHref(p), text, cls));
const feeLabel = p => (p.level === "D" ? "Initial semester fee" : "Annual fee");

/* =====================================================================
   FEATURE BUILDERS (data comes only from /content)
   ===================================================================== */
const jsonData = (id, obj) => `<script type="application/json" id="${id}">${JSON.stringify(obj).replace(/</g, "\\u003c")}</script>`;
const CT = C("contact");
const telHref = n => "tel:" + String(n).replace(/[^+\d]/g, "").replace(/^0/, "+910").replace(/^\+910(\d{2})/, "+91$1");
const contactRow = (label, value, kind) => {
  const href = kind === "tel" ? telHref(value) : "mailto:" + value;
  return `<li class="crow"><span class="crow__label">${esc(label)}</span><a class="crow__val" href="${href}">${esc(value)}</a><button class="copybtn" type="button" data-copy="${esc(value)}">Copy<span class="sr-only"> ${esc(label)}</span></button></li>`;
};
const DISCIPLINES = [
  { id: "engineering", label: "Engineering", india: "Engineering & Technology", intl: "Engineering & Technology", phone: 0 },
  { id: "law", label: "Law", india: "Law", intl: "Law", phone: 1 },
  { id: "management", label: "Management", india: "Management", intl: "Management", phone: 1 },
  { id: "medicine", label: "Medicine and Health", india: "Medicine & Health Sciences", intl: "Medical & Health Sciences", phone: 1 },
  { id: "agriculture", label: "Agriculture", india: "Agricultural Sciences", intl: "Agricultural Sciences", phone: 0 },
  { id: "liberal", label: "Liberal Arts and Business", india: "Liberal Arts and Business Studies", intl: "Liberal Arts and Business Studies", phone: 1 },
  { id: "architecture", label: "Architecture and Design", india: "Engineering & Technology", intl: "Engineering & Technology", phone: 0, only: "arch|design" }
];
const intlEmail = CT.emails.find(e => /International/.test(e.label));
const indiaEmail = CT.emails.find(e => /Admissions/.test(e.label));

/* /admissions: route selector, with a plain link list for no-JS */
const routeSelector = () => {
  const ai = C("admissions-india"), aii = C("admissions-international");
  const plain = `<div class="route__plain" data-route-plain>
    <h3 class="sub">Apply in India</h3>${linkList(ai.colleges.flatMap(c => (c.apply || []).map(a => ({ text: c.name + ": " + a.text, href: a.href }))))}
    <h3 class="sub">Apply as an international student</h3>${linkList([{ text: "International application form 2027", href: aii.apply_portal }])}
  </div>`;
  const step = (n, legend, name, opts) => `<fieldset class="route__step" data-route-step="${n}"${n > 1 ? " hidden" : ""}><legend><span class="route__n">Step ${n} of 3</span> ${legend}</legend>
    <div class="route__opts">${opts.map(([v, t]) => `<label class="optcard"><input type="radio" name="${name}" value="${v}"><span>${esc(t)}</span></label>`).join("")}</div></fieldset>`;
  const widget = `<form class="route" data-route hidden aria-labelledby="route-h">
    ${step(1, "Where are you applying from?", "r-where", [["india", "India"], ["intl", "International"]])}
    ${step(2, "Which level?", "r-level", [["UG", "Undergraduate"], ["PG", "Postgraduate"], ["PhD", "PhD"], ["Diploma", "Diploma"]])}
    ${step(3, "Which discipline?", "r-disc", DISCIPLINES.map(d => [d.id, d.label]))}
    <div class="route__nav"><button class="pill" type="button" data-route-back hidden>Back</button><button class="pill" type="button" data-route-restart hidden>Start again</button></div>
    <div class="route__out" data-route-out aria-live="polite"></div>
  </form>`;
  return sec("route", "Find your admission route", null, widget + plain, { v: "cards" }) +
    jsonData("route-data", {
      india: ai.colleges, intl: aii.programs, intlPortal: aii.apply_portal, waivers: aii.fee_waivers, disciplines: DISCIPLINES,
      contacts: { india: indiaEmail, intl: intlEmail, phones: CT.admissions_information_centre }
    });
};

/* /admissions/india: journey tracker */
const indiaTracker = () => {
  const a = C("admissions-india");
  const steps = [
    ["advisory", "Read the public advisory", `<p>Use only the official website and contacts. <a href="#advisory">Public Advisory</a></p>`],
    ["college", "Choose your college", `<ul class="chips">${a.colleges.map(c => `<li><a href="#${slug(c.name)}">${esc(c.name)}</a></li>`).join("")}</ul>`],
    ["download", "Download the prospectus and dates", `<ul class="trk__grp">${a.colleges.filter(c => c.downloads && c.downloads.length).map(c => `<li><p class="trk__who">${esc(c.name)}</p>${linkList(c.downloads)}</li>`).join("")}</ul>`],
    ["scholarship", "Check scholarships and fees", `<p><a class="more" href="/admissions/scholarships/#estimate">Estimate your fees and scholarship</a></p>`],
    ["hostel", "Plan your hostel", `<p><a class="more" href="/campus-life/hostels/">SRM Hostels</a></p>`],
    ["contact", "Contact admissions with questions", `<ul class="crows">${contactRow(indiaEmail.label, indiaEmail.value, "mail")}${CT.admissions_information_centre.map(x => contactRow(x.programs, x.phone, "tel")).join("")}</ul>`]
  ];
  return `<div class="checklist" data-checklist="india-2027">
      <div class="checklist__progress"><p data-cl-count aria-live="polite">0 of ${steps.length} steps done</p><div class="checklist__bar" aria-hidden="true"><span data-cl-bar></span></div></div>
      <ol class="checklist__steps">${steps.map(([id, t, b], i) => `<li class="clstep" data-cl-step="${id}">
        <div class="clstep__head"><input type="checkbox" id="cli-${id}" data-cl-check="${id}"><label for="cli-${id}"><span class="clstep__n">Step ${i + 1}</span> ${esc(t)}</label></div>
        <div class="clstep__body">${b}</div></li>`).join("")}</ol>
      <div class="cl-reset"><button class="pill" type="button" data-cl-reset>Reset tracker</button>
        <span class="cl-confirm" data-cl-confirm hidden>Clear all ticks? <button class="pill pill--blue" type="button" data-cl-yes>Yes, reset</button> <button class="pill" type="button" data-cl-no>Keep them</button></span></div>
    </div>`;
};

/* /admissions/scholarships: cost and scholarship estimator */
const estimator = () => {
  const s = C("admissions-scholarships"), t = s.rank_table;
  const campuses = [...new Set(t.rows.map(r => r[0]))];
  const progOpts = progs.map(p => `<option value="${esc(p.slug)}">${esc(p.name)}</option>`).join("");
  const ui = `<form class="est" data-est onsubmit="return false">
    <div class="est__in">
      <div class="pf__field"><label for="est-find">Find a programme</label><input id="est-find" type="search" placeholder="Type to narrow the list" autocomplete="off" data-est-find></div>
      <div class="pf__field"><label for="est-prog">Programme</label><select id="est-prog" data-est-prog><option value="">Choose a programme</option>${progOpts}</select></div>
      <div class="pf__field"><label for="est-rank">Entrance rank</label><input id="est-rank" type="number" inputmode="numeric" min="1" step="1" placeholder="For example 180" data-est-rank></div>
      <div class="pf__field"><label for="est-campus">Campus for the scholarship table</label><select id="est-campus" data-est-campus>${campuses.map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join("")}</select></div>
    </div>
    <div class="est__out" data-est-out aria-live="polite"><p>Choose a programme to see its fee.</p></div>
    <p class="est__note">Indicative. Confirm with the admissions office. <a href="/contact/">Contact us</a></p>
  </form>`;
  return sec("estimate", "Estimate your fees and scholarship", "Programmes and fees come from this Program Finder; scholarship tiers come from the table on this page.", ui + `<p class="pf__subset">Fees shown are for programmes in this Program Finder. ${ext(P.full_list_link, "See the full programme list")}</p>`, { v: "cards" }) +
    jsonData("est-data", { rows: progs.map(p => ({ slug: p.slug, name: p.name, college: P.colleges[p.college_idx], cidx: p.college_idx, fee: shown(p).fee, duration: shown(p).duration, level: p.level })), table: t.rows, columns: t.columns, heading: s.heading });
};

/* /academics/departments: tabs, search, count */
const deptExplorer = () => {
  const e = C("academics-engineering");
  const list = (items, kind) => `<ul class="dx__list" data-dx-list="${kind}">${items.map(d => `<li data-dx-item>${kind === "dept" ? ext("https://www.srmist.edu.in/departments/", esc(d)) : esc(d)}</li>`).join("")}</ul>`;
  return `<div class="dx" data-dx>
    <div class="pf__field dx__search"><label for="dx-q">Search departments and centres</label><input id="dx-q" type="search" autocomplete="off" placeholder="Try civil, data or heritage" data-dx-q></div>
    <div class="tabs" role="tablist" aria-label="Lists">
      <button class="tab" role="tab" id="dx-t1" aria-selected="true" aria-controls="dx-p1" data-dx-tab="dept">Departments (${e.departments.length})</button>
      <button class="tab" role="tab" id="dx-t2" aria-selected="false" aria-controls="dx-p2" tabindex="-1" data-dx-tab="centre">Research centres (${e.centres.length})</button>
    </div>
    <p class="dx__count" data-dx-count aria-live="polite">${e.departments.length} departments</p>
    <div role="tabpanel" id="dx-p1" aria-labelledby="dx-t1" data-dx-panel="dept">${list(e.departments, "dept")}</div>
    <div role="tabpanel" id="dx-p2" aria-labelledby="dx-t2" data-dx-panel="centre" hidden>${list(e.centres, "centre")}</div>
    <p class="finder__empty" data-dx-empty hidden>Nothing matches that search.</p>
    <p class="dx__note">Faculty of Engineering &amp; Technology. ${ext("https://www.srmist.edu.in/departments/", "All SRMIST departments")}</p>
  </div>`;
};

/* /contact: contact the right office */
const OFFICES = [
  { id: "india", label: "Admissions India", rows: [[indiaEmail.label, indiaEmail.value, "mail"], ...CT.admissions_information_centre.map(x => [x.programs, x.phone, "tel"])] },
  { id: "intl", label: "International admissions", rows: [[intlEmail.label, intlEmail.value, "mail"]] },
  { id: "placements", label: "Placements", rows: [[CT.emails.find(e => /Placement/.test(e.label)).label, CT.emails.find(e => /Placement/.test(e.label)).value, "mail"]] },
  { id: "research", label: "Research", rows: [[CT.emails.find(e => /Research/.test(e.label)).label, CT.emails.find(e => /Research/.test(e.label)).value, "mail"]] },
  { id: "hostels", label: "Hostels", rows: [[CT.emails.find(e => /Hostel/.test(e.label)).label, CT.emails.find(e => /Hostel/.test(e.label)).value, "mail"]] },
  { id: "other", label: "Something else", rows: [...CT.phones.map(p => ["Main line", p, "tel"]), ["Helpline", CT.helpline, "tel"], ...CT.enquiry_numbers.map(p => ["Enquiries", p, "tel"])] }
];
const officePicker = () => `<div class="office" data-office>
    <fieldset class="office__pick"><legend class="sr-only">Which office do you need?</legend>
      <div class="route__opts">${OFFICES.map((o, i) => `<label class="optcard"><input type="radio" name="office" value="${o.id}"${i === 0 ? " checked" : ""}><span>${esc(o.label)}</span></label>`).join("")}</div>
    </fieldset>
    ${OFFICES.map((o, i) => `<div class="office__card" data-office-card="${o.id}"${i === 0 ? "" : " data-office-rest"}><h3 class="sub">${esc(o.label)}</h3><ul class="crows">${o.rows.map(r => contactRow(r[0], r[1], r[2])).join("")}</ul></div>`).join("")}
    <p class="sr-only" aria-live="polite" data-copy-status></p>
  </div>`;

/* /academics: choose your campus (counts only from programs.json) */
const campusChooser = () => {
  const camps = CT.campuses.map(c => {
    const code = Object.keys(CAMPUS).find(k => c.name.toLowerCase().includes(CAMPUS[k].split(" ")[0].toLowerCase()));
    const list = code ? progs.filter(p => p.campus === code) : [];
    const mix = Object.entries(LEVEL).map(([k, v]) => [v, list.filter(p => p.level === k).length]).filter(x => x[1]);
    return { name: c.name, href: c.href, code, n: list.length, mix, colleges: [...new Set(list.map(p => P.colleges[p.college_idx]))] };
  });
  const card = c => `<li class="ccard camp">
      <h3>${esc(c.name)}</h3>
      ${c.n ? `<p class="camp__n"><b>${c.n}</b> programmes in this Program Finder</p><ul class="chips">${c.mix.map(([l, n]) => `<li>${esc(l)}: ${n}</li>`).join("")}</ul><div class="ccard__links"><a class="more" href="/programs/?campus=${c.code}">See these programmes</a></div>`
        : `<div class="ccard__links">${ext(c.href, "See programmes on the campus site", "more")}</div>`}
    </li>`;
  const inData = camps.filter(c => c.n);
  const sel = (id, i) => `<div class="pf__field"><label for="${id}">Campus ${i + 1}</label><select id="${id}" data-cc-sel>${inData.map((c, k) => `<option value="${k}"${k === i ? " selected" : ""}>${esc(c.name)}</option>`).join("")}</select></div>`;
  const compare = inData.length >= 2 ? `<div class="cc" data-cc><h3 class="sub">Compare two campuses</h3><div class="cc__sel">${sel("cc-a", 0)}${sel("cc-b", 1)}</div>
      <div class="tablewrap" tabindex="0" role="region" aria-label="Campus comparison" data-cc-out></div>
      <p class="pf__subset">Counts are for programmes in this Program Finder. ${ext(P.full_list_link, "See the full programme list")}</p></div>` + jsonData("cc-data", inData) : "";
  return sec("campus", "Choose your campus", null, `<ul class="cardgrid">${camps.map(card).join("")}</ul>${compare}`, { v: "cards" });
};

/* =====================================================================
   PAGES
   ===================================================================== */
const pages = [];
const BG = n => `/assets/img/bg/${n}.webp`;

/* ---- hub: /academics ---- */
pages.push({
  route: "/academics", template: "hub", title: "Academics", bg: BG("off-architecture"),
  lead: C("academics-engineering").other_colleges_note ? "Programmes, colleges and departments across SRMIST." : "",
  body: () => {
    const prim = nav.primary.find(p => p.label === "Academics");
    const colleges = P.colleges.map((c, i) => {
      const n = progs.filter(p => p.college_idx === i).length;
      return { title: esc(c), n, i };
    });
    return sec("explore", "Explore", null, linkList(prim.children.map(c => ({ label: c.label, local: c.local, ext: c.ext })))) +
      sec("colleges", "Colleges in the Program Finder", P.source.split(" - ")[1] || null, `<ul class="cardgrid cardgrid--img">${colleges.map(c => placeCard(c.title, `<div class="ccard__links"><a class="more" href="/programs/?college=${c.i}">${c.n} programmes in this list</a></div>`, collegePhoto(c.title))).join("")}</ul>`, { v: "cards" }) +
      sec("engineering", C("academics-engineering").title, C("academics-engineering").meta_description,
        `<a class="more" href="/academics/engineering-technology/">${esc(C("academics-engineering").title)}</a>`, { v: "split", img: "formula" }) +
      campusChooser() +
      sec("minors", "Minors in engineering", null, bullets(P.minors_in_engineering, "chips"));
  }
});
/* override the lead with real content only */
pages[pages.length - 1].lead = "";

/* ---- listing: /programs ---- */
pages.push({
  route: "/programs", template: "listing", title: "Programs", h1: "Find a programme", bg: BG("off-formula-bharat"),
  parent: ["Academics", "/academics/"],
  lead: "",
  toc: [["finder", "Program Finder"], ["quiz", "Which course fits me"], ["compare", "Compare programmes"]],
  body: () => {
    const colleges = P.colleges.map((c, i) => `<option value="${i}">${esc(c)}</option>`).join("");
    const levels = Object.entries(LEVEL).filter(([k]) => progs.some(p => p.level === k)).map(([k, v]) => `<option value="${k}">${esc(v)}</option>`).join("");
    const campuses = Object.entries(CAMPUS).filter(([k]) => progs.some(p => p.campus === k)).map(([k, v]) => `<option value="${k}">${esc(v)}</option>`).join("");
    const durs = [...new Set(progs.map(p => shown(p).duration).filter(Boolean))].sort((a, b) => a - b).map(d => `<option value="${d}">${d} years</option>`).join("");
    const card = p => {
      const s = shown(p);
      return `<li class="prog" data-prog data-slug="${esc(p.slug)}" data-level="${p.level}" data-college="${p.college_idx}" data-campus="${p.campus}" data-duration="${s.duration || ""}" data-fee="${s.fee || ""}" data-text="${esc((p.name + " " + p.department + " " + P.colleges[p.college_idx]).toLowerCase())}">
        <h3 class="prog__name">${progLink(p, esc(p.name))}</h3>
        <dl class="prog__row">
          <div><dt>Level</dt><dd>${esc(LEVEL[p.level])}</dd></div>
          <div><dt>College</dt><dd>${esc(P.colleges[p.college_idx])}</dd></div>
          <div><dt>Campus</dt><dd>${esc(CAMPUS[p.campus])}</dd></div>
          ${s.duration ? `<div><dt>Duration</dt><dd>${s.duration} years</dd></div>` : ""}
          ${s.fee ? `<div><dt>${feeLabel(p)}</dt><dd>${inr(s.fee)}</dd></div>` : ""}
          ${s.intake ? `<div><dt>Intake</dt><dd>${s.intake}</dd></div>` : ""}
        </dl>
        <div class="prog__acts">
          <button class="tgl" type="button" aria-pressed="false" data-compare="${esc(p.slug)}"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 5h5v10H4zM11 5h5v10h-5z"/></svg><span>Compare</span><span class="sr-only"> ${esc(p.name)}</span></button>
          <button class="tgl tgl--heart" type="button" aria-pressed="false" data-save="${esc(p.slug)}"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 17s-6-3.8-6-8.2A3.3 3.3 0 0 1 10 6a3.3 3.3 0 0 1 6 2.8C16 13.2 10 17 10 17z"/></svg><span>Save</span><span class="sr-only"> ${esc(p.name)}</span></button>
        </div>
      </li>`;
    };
    const finder = `<form class="pf" data-finder role="search" aria-label="Program Finder" onsubmit="return false">
      <div class="pf__row">
        <div class="pf__field pf__field--q"><label for="pf-q">Search programmes</label><input id="pf-q" type="search" name="q" placeholder="Try computer science, law or nursing" autocomplete="off"></div>
        <div class="pf__field"><label for="pf-level">Level</label><select id="pf-level" name="level"><option value="">All levels</option>${levels}</select></div>
        <div class="pf__field"><label for="pf-college">College</label><select id="pf-college" name="college"><option value="">All colleges</option>${colleges}</select></div>
        <div class="pf__field"><label for="pf-campus">Campus</label><select id="pf-campus" name="campus"><option value="">All campuses</option>${campuses}</select></div>
        <div class="pf__field"><label for="pf-duration">Duration</label><select id="pf-duration" name="duration"><option value="">Any duration</option>${durs}</select></div>
        <div class="pf__field"><label for="pf-fee">Annual fee up to</label><select id="pf-fee" name="maxfee"><option value="">Any fee</option><option value="100000">₹1,00,000</option><option value="250000">₹2,50,000</option><option value="300000">₹3,00,000</option><option value="450000">₹4,50,000</option></select></div>
      </div>
      <div class="pf__bar"><p class="pf__count" data-count aria-live="polite">${progs.length} programmes in this Program Finder</p>
        <div class="pf__btns"><button class="pill" type="button" data-saved-open aria-haspopup="dialog" aria-controls="saved-drawer">Saved (<span data-saved-count>0</span>)</button><button class="pill" type="button" data-clear>Clear all</button></div></div>
      <p class="pf__subset">This Program Finder lists ${progs.length} selected programmes. ${ext(P.full_list_link, "See the full programme list")}</p>
    </form>
    <ul class="proglist" data-proglist>${progs.map(card).join("")}</ul>
    <div class="pf__empty" data-empty hidden><p>No programme in this Program Finder matches those filters.</p><button class="pill" type="button" data-clear>Clear all</button> ${ext(P.full_list_link, "Search the full programme list", "more")}</div>
    <div class="ctray" data-ctray hidden><p class="ctray__txt" data-ctray-txt aria-live="polite"></p><a class="pill pill--blue" href="#compare" data-ctray-go>Compare (<span data-ctray-n>0</span>)</a><button class="pill" type="button" data-cmp-clear>Clear</button></div>
    <div class="drawer" id="saved-drawer" role="dialog" aria-modal="true" aria-labelledby="saved-title" hidden data-saved>
      <div class="drawer__box">
        <div class="drawer__top"><h2 id="saved-title" class="drawer__title">Saved programmes</h2><button class="iconbtn" type="button" data-saved-close><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg><span class="sr-only">Close saved programmes</span></button></div>
        <ul class="saved__list" data-saved-list></ul>
        <p class="saved__empty" data-saved-empty>Nothing saved yet. Use the heart on a programme to save it here.</p>
        <div class="drawer__acts"><button class="pill pill--blue" type="button" data-saved-compare>Compare saved</button><button class="pill" type="button" data-saved-print>Print list</button></div>
      </div>
    </div>`;
    record("finder", "Program Finder", progs.map(p => p.name + " " + p.department).join(". "));
    const q = (name, legend, opts) => `<fieldset class="quiz__q"><legend>${legend}</legend>${opts.map(([v, t], i) => `<label><input type="radio" name="${name}" value="${v}"${i === 0 ? " required" : ""}> ${t}</label>`).join("")}</fieldset>`;
    const quiz = `<form class="quiz" data-quiz>
      ${q("interest", "1. What do you enjoy most?", [["computing", "Computers, code and data"], ["engineering", "Machines, electronics and building things"], ["health", "Health, medicine and the human body"], ["business", "Business, management and commerce"], ["law", "Law, policy and society"], ["arts", "Writing, media, design and the arts"], ["life", "Plants, biology and the environment"]])}
      ${q("strength", "2. Which subject is your strongest?", [["maths", "Mathematics"], ["biology", "Biology"], ["language", "Languages and writing"], ["people", "Working with people"]])}
      ${q("level", "3. What level are you applying for?", [["U", "Undergraduate"], ["P", "Postgraduate"], ["Dp", "Diploma"], ["", "Not sure yet"]])}
      ${q("budget", "4. What annual fee band suits you?", [["100000", "Up to ₹1,00,000"], ["250000", "Up to ₹2,50,000"], ["450000", "Up to ₹4,50,000"], ["", "Any"]])}
      ${q("campus", "5. Where would you like to study?", [["K", esc(CAMPUS.K)], ["B", esc(CAMPUS.B)], ["", "Either"]])}
      <button class="pill pill--accent" type="submit">Show my top 3</button>
    </form>
    <div class="quiz__out" data-quiz-out aria-live="polite"></div>`;
    const compare = `<div class="cmp" data-compare-panel>
      <p class="cmp__hint" data-cmp-hint aria-live="polite">Press “Compare” on two or three programmes in the finder above.</p>
      <div class="cmp__table" data-cmp-table hidden tabindex="0" role="region" aria-label="Programme comparison"></div>
    </div>`;
    return sec("finder", "Program Finder", null, finder) +
      sec("quiz", "Which course fits me", "Answer five questions to see the three programmes in this list that match you best.", quiz, { v: "cards" }) +
      sec("compare", "Compare programmes", null, compare) +
      `<script type="application/json" id="programs-data">${JSON.stringify({ colleges: P.colleges, levels: LEVEL, campuses: CAMPUS, rows: progs.map(p => ({ ...p, ...shown(p), href: progHref(p), feeLabel: feeLabel(p) })) }).replace(/</g, "\\u003c")}</script>`;
  }
});

/* ---- detail: /programs/btech-cse ---- */
pages.push({
  route: "/programs/btech-cse", template: "detail", bg: BG("tech-park"), parent: ["Programs", "/programs/"],
  title: progs.find(p => p.slug === CSE).name, crumb: "B.Tech CSE",
  lead: "",
  body: () => {
    const p = progs.find(x => x.slug === CSE), s = shown(p), eng = C("academics-engineering"), ai = C("admissions-india"), ab = C("about");
    const accr = ab.accreditations.filter(a => a.programs.some(x => x.startsWith("B.Tech Computer Science and Engineering")));
    const cet = ai.colleges.find(c => c.name === "Engineering & Technology");
    const facts = `<dl class="factgrid">
      <div><dt>Level</dt><dd>${esc(LEVEL[p.level])}</dd></div>
      <div><dt>College</dt><dd>${esc(P.colleges[p.college_idx])}</dd></div>
      <div><dt>Department</dt><dd>${esc(p.department)}</dd></div>
      <div><dt>Campus</dt><dd>${esc(CAMPUS[p.campus])}</dd></div>
      ${s.duration ? `<div><dt>Duration</dt><dd>${s.duration} years</dd></div>` : ""}
      ${s.fee ? `<div><dt>Annual fee</dt><dd>${inr(s.fee)}</dd></div>` : ""}
      ${s.intake ? `<div><dt>Intake</dt><dd>${s.intake}</dd></div>` : ""}
    </dl>`;
    return sec("facts", "Programme at a glance", null, facts + `<p class="actions">${ext(cet.apply[0].href, "Apply: " + esc(cet.apply[0].text), "pill pill--accent")} ${ext(progHref(p), "Full programme details", "pill")}</p>`, { v: "stats" }) +
      (accr.length ? sec("accreditation", "Accreditation", null, `<ul class="bullets">${accr.map(a => `<li>${esc(a.body)}: ${esc(a.programs.find(x => x.startsWith("B.Tech Computer Science and Engineering")))}</li>`).join("")}</ul><a class="more" href="/about/accreditations-rankings/">Accreditations & Rankings</a>`, { v: "split", img: "techpark" }) : "") +
      sec("pathways", "Pathways", null, pull(eng.pathways_text), { v: "band" }) +
      sec("minors", "Minors in engineering", null, bullets(P.minors_in_engineering, "chips")) +
      sec("admission", "Admission", null, `${linkList(cet.downloads)}<a class="more" href="/admissions/scholarships/">Scholarships</a>`) +
      sec("college", "College", null, `<p>${esc(eng.title)}, ${esc(eng.campus)}.</p>${person(eng.dean)}<a class="more" href="/academics/engineering-technology/">${esc(eng.title)}</a>`, { v: "split", img: "formula" });
  }
});

/* ---- college: /academics/engineering-technology ---- */
pages.push({
  route: "/academics/engineering-technology", template: "college", bg: BG("off-formula-bharat"), parent: ["Academics", "/academics/"],
  title: C("academics-engineering").title, description: C("academics-engineering").meta_description,
  lead: C("academics-engineering").meta_description,
  toc: [["words", "Founder's words"], ["dean", "Dean's message"], ["structure", "Schools and departments"], ["centres", "Centres"], ["programs", "Programmes"]],
  body: () => {
    const e = C("academics-engineering");
    const engProgs = progs.filter(p => p.college_idx === 0);
    return sec("words", "Founder's words", null, pullMany(e.founder_words), { v: "band" }) +
      sec("dean", "Dean's message", null, `<div class="split2"><div class="prose">${para(e.deans_message)}</div>${person(e.dean)}</div>`) +
      sec("structure", "Schools and departments", e.structure_text, statRow([["7", "Schools"], ["22", "Departments"]]) + `<ul class="cardgrid cardgrid--tight">${e.departments.map(d => `<li class="ccard"><h3>${ext("https://www.srmist.edu.in/departments/", esc(d))}</h3></li>`).join("")}</ul><a class="more" href="/academics/departments/">Find a department</a>`, { v: "stats" }) +
      sec("pathways", "Pathways", null, pull(e.pathways_text), { v: "band" }) +
      sec("centres", "Centres", null, bullets(e.centres, "chips")) +
      sec("programs", "Programmes", null, `<ul class="linklist linklist--cols">${engProgs.map(p => `<li>${progLink(p, esc(p.name))}</li>`).join("")}</ul><a class="more" href="/programs/?college=0">Filter engineering programmes</a>`, { v: "split", img: "techpark" }) +
      sec("other", "Other colleges", null, linkList(nav.primary.find(p => p.label === "Academics").children.filter(c => c.ext).map(c => ({ label: c.label, ext: c.ext }))));
  }
});

/* ---- listing: /academics/departments ---- */
pages.push({
  route: "/academics/departments", template: "listing", bg: BG("biotech-block-1"), parent: ["Academics", "/academics/"],
  title: "Faculty of Engineering & Technology departments", crumb: "Departments", description: C("academics-departments").meta_description,
  lead: C("academics-departments").meta_description,
  body: () => {
    const e = C("academics-engineering");
    return sec("list", "Departments and research centres", null, deptExplorer());
  }
});

/* ---- hub: /admissions ---- */
const ADM_LAYOUT = {
  pathways: { v: "cards" },
  about: { v: "stats", stats: [["50000+", "Students"], ["6", "Campuses"]] },
  recognition: { v: "cards", numbered: true },
  global: { v: "band" },
  tour: { v: "split", img: "aerial" }
};
const genericSection = s => {
  const id = s.id || slug(s.heading), L = ADM_LAYOUT[id] || {};
  const items = s.items ? `<ul class="cardgrid cardgrid--img">${s.items.map((i, k) => placeCard(link(i), i.desc ? `<p>${esc(i.desc)}</p>` : "", k === 0 ? "admissions" : "aerial")).join("")}</ul>` : "";
  const text = L.numbered ? numCards(s.paragraphs) : L.v === "band" ? pullMany(s.paragraphs) : para(s.paragraphs);
  return sec(id, s.heading, null, (L.stats ? statRow(L.stats) : "") + text + (s.text ? `<p>${esc(s.text)}</p>` : "") + bullets(s.bullets || s.list) + items + linkList(s.links), L);
};
pages.push({
  route: "/admissions", template: "hub", bg: BG("off-admissions"), title: C("admissions").title, lead: C("admissions").description,
  body: () => routeSelector() + C("admissions").sections.map(genericSection).join("") +
    sec("more", "More in Admissions", null, linkList(nav.primary.find(p => p.label === "Admissions").children.map(c => ({ label: c.label, local: c.local }))))
});

/* ---- content: /admissions/india ---- */
pages.push({
  route: "/admissions/india", template: "content", bg: BG("off-admissions"), parent: ["Admissions", "/admissions/"],
  title: C("admissions-india").title, lead: C("admissions-india").description,
  body: () => {
    const a = C("admissions-india");
    return sec("colleges", "Apply by college", null, `<ul class="cardgrid cardgrid--img">${a.colleges.map(c => `<li class="ccard${collegePhoto(c.name) ? " ccard--img" : ""}" id="${slug(c.name)}">${collegePhoto(c.name) ? photo(collegePhoto(c.name), "ccard__img") : ""}<div class="ccard__in">
        <h3>${esc(c.name)}</h3>
        ${c.apply && c.apply.length ? `<p class="ccard__label">Apply online</p>${linkList(c.apply)}` : ""}
        ${c.also && c.also.length ? `<p class="ccard__label">Also offered</p>${bullets(c.also)}` : ""}
        ${c.downloads && c.downloads.length ? `<p class="ccard__label">Downloads</p>${linkList(c.downloads)}` : ""}
        ${c.details ? `<div class="ccard__links">${ext(c.details, "Program | Fees | Eligibility | Criteria", "more")}</div>` : ""}
      </div></li>`).join("")}</ul>`, { v: "cards" }) +
      sec("advisory", a.public_advisory.heading, null, `<div class="notice-box" role="note">
        <ul class="contact-list"><li><span>Admissions</span><a href="mailto:admissions.india@srmist.edu.in">admissions.india@srmist.edu.in</a></li><li><span>Report unofficial sites</span><a href="mailto:cyberwatchdog@srmist.edu.in">cyberwatchdog@srmist.edu.in</a></li><li><span>Official website</span>${ext("https://www.srmist.edu.in/", "www.srmist.edu.in")}</li></ul></div>`, { v: "band" }) +
      sec("scholarships", "Scholarships", null, `<a class="more" href="/admissions/scholarships/">Scholarships</a>`) +
      sec("journey", "Your admission journey", "Tick each step as you finish it. Your progress stays in this browser.", indiaTracker(), { v: "list" });
  }
});

/* ---- content: /admissions/international (with the checklist) ---- */
pages.push({
  route: "/admissions/international", template: "content", bg: BG("tech-park"), parent: ["Admissions", "/admissions/"],
  title: C("admissions-international").title, h1: C("admissions-international").heading, lead: C("admissions-international").description,
  toc: [["waivers", "Fee waivers"], ["programs", "Programmes"], ["resources", "Resources"], ["checklist", "Your checklist"]],
  body: () => {
    const a = C("admissions-international");
    const steps = [
      ["waiver", "Check your fee waiver", `<ul class="bullets">${a.fee_waivers.map(f => `<li><strong>${esc(f.group)}:</strong> ${esc(f.text)}</li>`).join("")}</ul><a class="more" href="/admissions/scholarships/">Scholarships</a>`],
      ["program", "Choose your programme", `<ul class="bullets">${a.programs.map(p => `<li><strong>${esc(p.college)}:</strong> ${esc((p.programs || []).join(", "))}</li>`).join("")}</ul>`],
      ["resources", "Read the application resources", linkList(a.resources)],
      ["apply", "Apply online", `<p>${ext(a.apply_portal, "International application form 2027", "pill pill--accent")}</p>`],
      ["tour", "Take the virtual tour", `<p>${ext(a.tour, "Virtual campus tour", "more")}</p>`]
    ];
    const checklist = `<div class="checklist" data-checklist="intl-2027">
      <div class="checklist__progress"><p data-cl-count aria-live="polite">0 of ${steps.length} steps done</p><div class="checklist__bar" aria-hidden="true"><span data-cl-bar></span></div></div>
      <ol class="checklist__steps">${steps.map(([id, t, b], i) => `<li class="clstep" data-cl-step="${id}">
        <div class="clstep__head"><input type="checkbox" id="cl-${id}" data-cl-check="${id}"><label for="cl-${id}"><span class="clstep__n">Step ${i + 1}</span> ${esc(t)}</label></div>
        <div class="clstep__body">${b}</div></li>`).join("")}</ol>
      <button class="pill" type="button" data-cl-reset>Reset checklist</button>
    </div>`;
    return sec("waivers", "Fee waivers", null, statRow(a.fee_waivers.map(f => [(f.text.match(/\d+%/) || [""])[0], f.group]).filter(x => x[0])) + `<ul class="cardgrid">${a.fee_waivers.map(f => `<li class="ccard"><h3>${esc(f.group)}</h3><p>${esc(f.text)}</p></li>`).join("")}</ul>`, { v: "stats" }) +
      sec("programs", "Programmes", null, `<ul class="cardgrid cardgrid--img">${a.programs.map(p => placeCard(esc(p.college), `${bullets(p.programs)}<div class="ccard__links">${p.details ? ext(p.details, "Details", "more") : ""} ${p.prospectus ? ext(p.prospectus, "Prospectus (PDF)", "more") : ""}</div>`, collegePhoto(p.college))).join("")}</ul>`, { v: "cards" }) +
      sec("resources", "Resources", null, linkList(a.resources)) +
      sec("recognition", "Recognition", null, numCards(a.recognition), { v: "cards" }) +
      sec("global", "Global outlook", null, pull(a.global), { v: "band" }) +
      sec("checklist", "Your checklist", "Tick each step as you finish it. Your progress stays in this browser.", checklist);
  }
});

/* ---- content: /admissions/scholarships ---- */
pages.push({
  route: "/admissions/scholarships", template: "content", bg: BG("off-convocation"), parent: ["Admissions", "/admissions/"],
  title: C("admissions-scholarships").title, crumb: "Scholarships", h1: C("admissions-scholarships").heading, lead: C("admissions-scholarships").description,
  body: () => {
    const s = C("admissions-scholarships"), t = s.rank_table;
    const camps = [...new Set(t.rows.map(r => r[0]))];
    const table = `<div class="tablectl"><label for="sch-campus">Campus</label><select id="sch-campus" data-campus-select>${camps.map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join("")}</select> ${ext(s.source || "https://www.srmist.edu.in/admission-india/engineering/scholarships/", "All campuses", "more")}</div>
      <div class="tablewrap" tabindex="0" role="region" aria-label="Scholarship table"><table class="dtable"><caption class="sr-only">Scholarships by campus</caption><thead><tr>${t.columns.map(c => `<th scope="col">${esc(c)}</th>`).join("")}</tr></thead>
      <tbody>${t.rows.map(r => `<tr data-campus="${esc(r[0])}">${r.map(c => `<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
    return estimator() + sec("table", "Scholarships by campus", null, table) +
      sec("notes", "Notes", null, bullets(s.notes)) +
      sec("categories", "Scholarship categories", null, numCards(s.categories), { v: "cards" }) +
      sec("annexure", s.annexure_a.heading, null, bullets(s.annexure_a.items)) +
      sec("boards", s.boards.heading, s.boards.text, bullets(s.boards.list, "chips"), { v: "split", img: "convocation" }) +
      sec("links", "Documents", null, linkList(s.links));
  }
});

/* ---- hub: /research ---- */
pages.push({
  route: "/research", template: "hub", bg: BG("lab-research"), title: C("research").title, lead: C("research").description,
  body: () => {
    const r = C("research");
    return sec("overview", r.overview.heading, null, para(r.overview.paragraphs) + bullets(r.overview.bullets), { v: "split", img: "lab" }) +
      sec("mission", "Mission", null, numCards(r.mission), { v: "cards" }) +
      sec("dean", "Dean (Research)", null, person(r.dean, `<div class="ccard__links">${ext(r.dean.href, "Profile", "more")}</div>`)) +
      sec("directorate", r.directorate.heading, r.directorate.paragraph, linkList(r.directorate.links), { v: "split", img: "biotech" }) +
      sec("academic", "Academic research", null, pullMany(r.academic_research.paragraphs) + ext(r.academic_research.href, "Academic research", "more"), { v: "band" }) +
      sec("funded", "Funded research", null, `<ul class="cardgrid">${r.funded_research.map(f => `<li class="ccard"><h3>${link({ text: f.title, href: f.href })}</h3>${f.text ? `<p>${esc(f.text)}</p>` : ""}</li>`).join("")}</ul>`, { v: "cards" }) +
      sec("facilities", "Central research facilities", null, `<ul class="cardgrid">${r.central_facilities.map(f => `<li class="ccard"><h3>${link({ text: f.name, href: f.href })}</h3><p class="ccard__label">${esc(f.full)}</p>${f.text ? `<p>${esc(f.text)}</p>` : ""}</li>`).join("")}</ul>`, { v: "cards" }) +
      sec("innovation", "Innovation & Incubation", C("research-innovation").description, `<a class="more" href="/research/innovation-incubation/">Innovation & Incubation</a>`, { v: "split", img: "ideathon" }) +
      sec("policies", "Policies", null, linkList(r.policies)) +
      sec("news", "Research news", null, linkList(r.news_headlines.map(n => ({ text: n.title, href: n.href }))));
  }
});

/* ---- content: /research/innovation-incubation ---- */
pages.push({
  route: "/research/innovation-incubation", template: "content", bg: BG("ideathon"), parent: ["Research", "/research/"],
  title: C("research-innovation").title, lead: C("research-innovation").description,
  body: () => {
    const r = C("research-innovation");
    return sec("about", "About the centre", null, `<p>${esc(r.intro)}</p>`, { v: "split", img: "ideathon" }) +
      sec("vision", "Vision", null, pull(r.vision), { v: "band" }) +
      sec("mission", "Mission", null, numCards(r.mission), { v: "cards" }) +
      sec("units", "Units", null, `<ul class="cardgrid">${r.units.map(u => `<li class="ccard"><h3>${ext(u.href, esc(u.name))}</h3>${u.text ? `<p>${esc(u.text)}</p>` : ""}</li>`).join("")}</ul>`, { v: "cards" }) +
      sec("policies", "Policies", null, linkList(r.policies));
  }
});

/* ---- hub: /campus-life ---- */
pages.push({
  route: "/campus-life", template: "hub", bg: BG("milan-stage"), title: C("campus-life").title, lead: C("campus-life").meta_description,
  body: () => {
    const c = C("campus-life");
    return sec("activities", c.intro_heading, c.intro, bullets(c.tiles, "chips"), { v: "split", img: "milanStage" }) +
      sec("hostels", "Hostels", C("campus-hostels").description, `<a class="more" href="/campus-life/hostels/">SRM Hostels</a>`, { v: "split", img: "hostelK" }) +
      sec("safety", c.safety.heading, null, pull(c.safety.text), { v: "band" }) +
      sec("care", c.care.heading, null, `<p>${esc(c.care.text)}</p>` + bullets(c.support_links, "chips"), { v: "split", img: "milanDance" }) +
      sec("more", "More on campus", null, linkList(nav.primary.find(p => p.label === "Campus Life").children.filter(x => x.ext).map(x => ({ label: x.label, ext: x.ext })).concat([{ label: "Campus tour", ext: c.related_original[2] }])));
  }
});

/* ---- content: /campus-life/hostels ---- */
pages.push({
  route: "/campus-life/hostels", template: "content", bg: BG("hostel-kalpana"), parent: ["Campus Life", "/campus-life/"],
  title: C("campus-hostels").title, h1: C("campus-hostels").title, lead: C("campus-hostels").heading,
  toc: [["about", "About"], ["director", "Director"], ["booking", "Fees and booking"], ["apply", "How to apply"], ["contacts", "Contacts"]],
  body: () => {
    const h = C("campus-hostels");
    return sec("about", h.heading, null, para(h.intro), { v: "split", img: "hostelK" }) +
      sec("director", "From the Director", null, `<div class="split2"><div class="prose">${para(h.director.message)}</div>${person(h.director)}</div>`) +
      sec("vision", "Vision", null, numCards(h.vision), { v: "cards" }) +
      sec("hostels", "Hostels", null, `<ul class="cardgrid cardgrid--img">${h.hostels.map((x, k) => placeCard(link(x), "", k === 1 ? "hostelK" : "hostelOff")).join("")}</ul>` + linkList(h.links), { v: "cards" }) +
      sec("booking", h.fees_and_booking_heading, null, bullets(h.booking_groups)) +
      sec("apply", "How to apply", null, `<ol class="steps">${h.how_to_apply.map(x => `<li>${esc(x)}</li>`).join("")}</ol>`, { v: "band" }) +
      sec("eligibility", "Who can apply", null, `<div class="split2"><div><h3 class="sub">Eligible</h3>${bullets(h.who_can_apply.eligible)}</div><div><h3 class="sub">Not eligible</h3>${bullets(h.who_can_apply.not_eligible)}</div></div>`) +
      sec("contacts", "Contacts", null, `<ul class="cardgrid">${h.contacts.map(c => `<li class="ccard"><h3>${esc(c.group)}</h3><ul class="contact-list">
          ${c.email ? `<li><span>Email</span><a href="mailto:${esc(c.email)}">${esc(c.email)}</a></li>` : ""}
          ${c.warden_email ? `<li><span>Warden</span><a href="mailto:${esc(c.warden_email)}">${esc(c.warden_email)}</a></li>` : ""}
          ${c.phones ? `<li><span>Phone</span>${c.phones.map(esc).join(", ")}</li>` : ""}
          ${c.mobile ? `<li><span>Mobile</span>${esc(c.mobile)}</li>` : ""}${c.warden_mobile ? `<li><span>Warden mobile</span>${esc(c.warden_mobile)}</li>` : ""}
          ${c.accounts_office ? `<li><span>Accounts office</span>${esc(c.accounts_office)}</li>` : ""}</ul></li>`).join("")}</ul>`, { v: "cards" });
  }
});

const PLACE_STATS = `<div class="pstats"><p class="eyebrow">Global skills for global placements, 2026</p>
<p class="bigstat"><span class="bigstat__n">10,969+</span> <span class="bigstat__l">total offers</span></p>` +
  statRow([["1701", "Number of roles"], ["5499+", "High-paying offers"], ["60 LPA", "Highest CTC"], ["7.47 LPA", "Average CTC"]]) +
  `<p class="note">2026 batch, as on 9 September 2026. LPA is lakh per annum.</p></div>`;
/* ---- hub: /placements ---- */
const PARTNER = { "abb": "ABB", "accenture": "Accenture", "accolite": "Accolite", "aditya-birla": "Aditya Birla Group", "amazon": "Amazon", "capgemini": "Capgemini", "cognizant": "Cognizant", "deloitte": "Deloitte", "ey": "EY", "ford": "Ford", "hcl": "HCL", "hitachi": "Hitachi", "honeywell": "Honeywell", "hsbc": "HSBC", "hyundai": "Hyundai", "ibm": "IBM", "infosys": "Infosys", "intel": "Intel", "jp_morgan": "J.P. Morgan", "ltimindtree": "LTIMindtree", "maersk": "Maersk", "maruthi": "Maruti Suzuki", "mckinley_rice": "McKinley Rice", "microsoft": "Microsoft", "mu_sigma": "Mu Sigma", "nokia": "Nokia", "pwc": "PwC", "sap": "SAP", "siemens": "Siemens", "tcs": "TCS", "wipro": "Wipro", "Afcons": "Afcons", "Affinsys": "Affinsys", "Shell": "Shell" };
const logos = () => `<ul class="logowall">${Object.keys(SIZES).filter(k => k.includes("/partners/")).map(k => {
  const n = path.basename(k).replace(/\.[a-z]+$/, "");
  return `<li>${img("/" + k, (PARTNER[n] || n) + " logo")}</li>`;
}).join("")}</ul>`;
pages.push({
  route: "/placements", template: "hub", bg: BG("off-convocation"), title: C("placements").title, h1: C("placements").heading, lead: C("placements").description,
  body: () => {
    const p = C("placements");
    return sec("about", p.title, null, `<p>${esc(p.intro)}</p>`, { v: "split", img: "convocation" }) +
      sec("statistics", "Placement statistics", "2026 batch", PLACE_STATS + `<a class="more" href="/placements/statistics/">Placement statistics</a>`, { v: "band" }) +
      sec("director", "From the Director", null, `<div class="split2"><div class="prose">${para(p.director.message)}</div>${person(p.director)}</div>`) +
      sec("why", "Why choose the Career Centre", null, numCards(p.why_choose), { v: "cards" }) +
      sec("sections", "More from the Career Centre", null, linkList(p.sections)) +
      sec("recruiters", "Recruiters", null, logos(), { v: "cards" }) +
      sec("contact", "Contact the Career Centre", null, `<ul class="contact-list"><li><span>Address</span>${esc(p.contact.address)}</li><li><span>Email</span><a href="mailto:${esc(p.contact.email)}">${esc(p.contact.email)}</a></li></ul>`);
  }
});

/* ---- content: /placements/statistics ---- */
pages.push({
  route: "/placements/statistics", template: "content", bg: BG("off-convocation"), parent: ["Placements", "/placements/"],
  title: "Placement Statistics", lead: "Offers, roles and salaries for the 2026 batch.",
  body: () => sec("stats", "2026 batch", null, PLACE_STATS + `<p class="actions">${ext("https://www.srmist.edu.in/placements/placement-statistics/", "Statistics on srmist.edu.in", "pill pill--accent")}</p>`, { v: "band" }) +
    sec("recruiters", "Recruiters", null, logos(), { v: "cards" })
});

/* ---- hub: /international ---- */
pages.push({
  route: "/international", template: "hub", bg: BG("srm-university-campus-chennai-tamil-nadu"), title: C("international").title, lead: C("international").description,
  body: () => {
    const i = C("international");
    return sec("vision", "Vision", null, pull(i.vision), { v: "band" }) +
      sec("mission", "Mission", null, numCards(i.mission), { v: "cards" }) +
      sec("activities", "What we do", null, `<ul class="cardgrid">${i.activities.map(g => `<li class="ccard"><h3>${esc(g.group)}</h3>${bullets(g.items)}</li>`).join("")}</ul>`, { v: "cards" }) +
      sec("board", "International Advisory Board", null, statRow([["2003", "Board set up"], ["31", "Founding members"], ["50+", "Members now"]]) + `<p>${esc(i.advisory_board)}</p>`, { v: "stats" }) +
      sec("partnership", "Global partnership", null, statRow([["100+", "Universities and research centres"]]) + `<p>${esc(i.global_partnership)}</p>`, { v: "split", img: "grounds" }) +
      sec("memberships", "Memberships", null, bullets(i.memberships)) +
      sec("highlights", "Highlights", null, bullets(i.highlights)) +
      sec("voices", "Student voices", null, `<div class="voices">${i.testimonials.map(t => `<blockquote class="pull pull--sm"><p>${esc(t)}</p></blockquote>`).join("")}</div>`, { v: "band" }) +
      sec("contact", "Contact", null, `<div class="split2"><ul class="contact-list"><li><span>Office</span>${esc(i.contact.office)}</li><li><span>Director</span><a href="mailto:${esc(i.contact.director_email)}">${esc(i.contact.director_email)}</a></li><li><span>Phone</span>${esc(i.contact.phone)}</li></ul>${person(i.contact.assistant_director)}</div><p class="actions">${link(i.cta, "pill pill--accent")}</p>`);
  }
});

/* ---- hub: /about ---- */
pages.push({
  route: "/about", template: "hub", bg: BG("srm-university-auditorium"), title: C("about").title, lead: "", description: C("about").description,
  body: () => {
    const a = C("about");
    return sec("focus", "SRM in focus", null, statRow([["60000+", "Full time students"], ["4460+", "Faculty"]]) + `<p>${esc(a.in_focus)}</p>`, { v: "stats" }) +
      sec("vision", "Vision", null, pull(a.vision), { v: "band" }) +
      sec("mission", "Mission", null, numCards(a.mission), { v: "cards" }) +
      sec("values", "Core values", null, numCards(a.core_values), { v: "cards" }) +
      sec("history", "History", null, `<ol class="tline">${a.history.map((h, k) => `<li class="tline__row"><b class="tline__year">${esc(h.year)}</b><p class="tline__text">${esc(h.text)}</p>${k === 0 ? frame("ub") : k === a.history.length - 1 ? frame("aerial") : ""}</li>`).join("")}</ol>${ext(a.history_href, "Full history", "more")}`, { v: "timeline" }) +
      sec("recognition", "Recognition", null, numCards(a.recognition), { v: "cards" }) +
      sec("accreditation", "Programme accreditation", null, `<ul class="cardgrid">${a.accreditations.map(x => `<li class="ccard"><h3>${esc(x.body)}</h3>${bullets(x.programs)}</li>`).join("")}</ul><a class="more" href="/about/accreditations-rankings/">Accreditations & Rankings</a>`, { v: "cards" }) +
      sec("campus", "The campus", null, statRow([["42", "Blocks"], ["250", "Acres"]]) + `<p>${esc(a.campus)}</p>`, { v: "split", img: "grounds" }) +
      sec("achievements", "Student achievements", null, bullets(a.student_achievements)) +
      sec("more", "More about SRM", null, linkList(a.links.concat([{ text: "News & Events", local: "/news-events" }])));
  }
});

/* ---- content: /about/accreditations-rankings ---- */
pages.push({
  route: "/about/accreditations-rankings", template: "content", bg: BG("srm-university-auditorium"), parent: ["About", "/about/"],
  title: C("about-accreditations").title, lead: "",
  body: () => {
    const a = C("about-accreditations");
    const clean = t => String(t).replace(/\s*\(?\s*Till 2022\s*\)?\.?/gi, "").trim();
    return sec("accreditations", "Accreditations", null, `<ul class="cardgrid">${a.accreditations.map(x => `<li class="ccard"><h3>${esc(x.body)}</h3>${x.text ? `<p>${esc(clean(x.text))}</p>` : ""}${bullets(x.programs)}</li>`).join("")}</ul>`, { v: "cards" }) +
      sec("rankings", "Rankings", null, `<ul class="cardgrid cardgrid--tight">${a.rankings.families.map(f => `<li class="ccard"><h3>${esc(f)}</h3></li>`).join("")}</ul>
        <h3 class="sub">Published bands</h3>${bullets(a.rankings.published_bands.map(b => b.replace(/\s*\(as shown on the page\)/g, "")))}
        <p class="actions">${ext("https://www.srmist.edu.in/about-us/accreditations-and-rankings/", "See full rankings", "pill")}</p>`, { v: "split", img: "ub" });
  }
});

/* ---- news-events ---- */
pages.push({
  route: "/news-events", template: "news-events", bg: BG("milan-dance"), parent: ["About", "/about/"], title: C("news-events").title, lead: "",
  body: () => {
    const n = C("news-events");
    return sec("news", "News", null, `<ul class="newslist">${n.news.map(x => `<li>${link({ text: x.title, href: x.href })}</li>`).join("")}</ul>`) +
      sec("featured", "Featured events", null, `<ul class="cardgrid">${n.events.featured.map(f => `<li class="ccard"><h3>${esc(f)}</h3><div class="ccard__links">${ext("/events", "All events", "more")}</div></li>`).join("")}</ul>`, { v: "band" }) +
      sec("upcoming", "Upcoming events", null, `<ul class="newslist">${n.events.upcoming.map(x => `<li>${link({ text: x.title, href: x.href })}</li>`).join("")}</ul>`) +
      sec("more", "More", null, linkList(n.list_links));
  }
});

/* ---- contact ---- */
pages.push({
  route: "/contact", template: "contact", bg: BG("srm-university-campus-chennai-tamil-nadu"), title: C("contact").title, lead: C("contact").description,
  body: () => {
    const c = C("contact");
    return sec("office", "Contact the right office", null, officePicker(), { v: "cards" }) +
      sec("reach", "Reach us", null, `<div class="split2"><ul class="contact-list">
        <li><span>Address</span>${esc(c.address)}</li>
        <li><span>Phone</span>${c.phones.map(esc).join(", ")}</li>
        <li><span>Enquiries</span>${c.enquiry_numbers.map(esc).join(", ")}</li>
        <li><span>Helpline</span>${esc(c.helpline)}</li></ul>
        <ul class="contact-list">${c.emails.map(e => `<li><span>${esc(e.label)}</span><a href="mailto:${esc(e.value)}">${esc(e.value)}</a></li>`).join("")}</ul></div>`) +
      sec("admissions", "Admissions information centre", null, `<ul class="cardgrid">${c.admissions_information_centre.map(a => `<li class="ccard"><h3>${esc(a.phone)}</h3><p>${esc(a.programs)}</p></li>`).join("")}</ul>`, { v: "cards" }) +
      sec("visit", "Visit", null, `<p class="actions">${ext(c.visitors.how_to_reach, "How to reach", "pill")} ${ext(c.visitors.virtual_tour, "Virtual tour", "pill")}</p>`, { v: "split", img: "aerial" }) +
      sec("campuses", "Campuses", null, linkList(c.campuses.map(x => ({ text: x.name, href: x.href }))));
  }
});

/* ---- content: /parents (only facts from campus-life.json and campus-hostels.json) ---- */
pages.push({
  route: "/parents", template: "content", bg: BG("hostel-kalpana"), title: "For parents", lead: "",
  description: "Safety, hostels, student care, fees and contacts for parents of SRMIST students.",
  toc: [["safety", "Safety"], ["hostels", "Hostels and food"], ["care", "Student care"], ["fees", "Fees"], ["contacts", "Who to contact"]],
  body: () => {
    const c = C("campus-life"), h = C("campus-hostels");
    return sec("safety", "Safety and 24-hour emergency", null, `<p>${esc(c.safety.text)}</p>`, { v: "split", img: "grounds" }) +
      sec("hostels", "Hostels and food", null, para(h.intro.slice(0, 3)) + `<a class="more" href="/campus-life/hostels/">SRM Hostels</a>`, { v: "split", img: "hostelK" }) +
      sec("care", "Anti-ragging and student care", null, pull(c.care.text) + bullets(c.support_links, "chips"), { v: "band" }) +
      sec("fees", "Fees and scholarships", null, `<p>${esc(h.fees_and_booking_heading)}</p><p class="actions"><a class="pill pill--blue" href="/admissions/scholarships/#estimate">Estimate fees and scholarship</a> <a class="pill" href="/admissions/scholarships/">Scholarships</a></p>`, { v: "list" }) +
      sec("contacts", "Who to contact", null, `<ul class="cardgrid">
        <li class="ccard"><h3>${esc(h.director.role)}</h3><p>${esc(h.director.name)}</p><ul class="crows">${contactRow("Email", h.director.email, "mail")}${contactRow("Phone", h.director.phone, "tel")}</ul></li>
        ${h.contacts.map(x => `<li class="ccard"><h3>${esc(x.group)}</h3><ul class="crows">${x.email ? contactRow("Email", x.email, "mail") : ""}${x.warden_email ? contactRow("Warden", x.warden_email, "mail") : ""}${(x.phones || []).slice(0, 2).map(ph => contactRow("Phone", ph, "tel")).join("")}${x.mobile ? contactRow("Mobile", x.mobile, "tel") : ""}${x.warden_mobile ? contactRow("Warden mobile", x.warden_mobile, "tel") : ""}</ul></li>`).join("")}
        <li class="ccard"><h3>University</h3><ul class="crows">${CT.phones.map(ph => contactRow("Main line", ph, "tel")).join("")}${contactRow("Helpline", CT.helpline, "tel")}</ul></li>
      </ul><p class="sr-only" aria-live="polite" data-copy-status></p>`, { v: "cards" });
  }
});

/* ---------- programme data for Ask SRM's programme search (every page) ---------- */
fs.mkdirSync(path.join(ROOT, "assets/data"), { recursive: true });
fs.writeFileSync(path.join(ROOT, "assets/data/programs.json"), JSON.stringify({ colleges: P.colleges, levels: LEVEL, campuses: CAMPUS, full: P.full_list_link,
  rows: progs.map(p => ({ slug: p.slug, name: p.name, level: p.level, college_idx: p.college_idx, department: p.department, campus: p.campus, duration: shown(p).duration, fee: shown(p).fee, intake: shown(p).intake, href: progHref(p), feeLabel: feeLabel(p) })) }));

/* ---------- write pages ---------- */
for (const p of pages) render(p);

/* ---------- home page: header, audience bar, footer and Ask wiring from the same sources ---------- */
const homeFile = path.join(ROOT, "index.html");
let home = fs.readFileSync(homeFile, "utf8");
const swap = (src, name, startRe, endStr, html) => {
  const m = src.indexOf(`<!-- build:${name} -->`);
  if (m >= 0) { const e = src.indexOf(`<!-- /build:${name} -->`) + `<!-- /build:${name} -->`.length; return src.slice(0, m) + html + src.slice(e); }
  const s = src.search(startRe); if (s < 0) throw new Error("home: cannot find " + name);
  const e = src.indexOf(endStr, s) + endStr.length;
  return src.slice(0, s) + html + src.slice(e);
};
current = { route: "/", title: "Home" };
if (home.includes("<!-- build:strip -->")) home = home.replace(/<!-- build:strip -->[\s\S]*?<!-- \/build:strip -->/, STRIP);
else home = home.replace('<a class="skip" href="#main">Skip to main content</a>', '<a class="skip" href="#main">Skip to main content</a>\n' + STRIP);
home = swap(home, "header", /<header class="header">/, "</div>\n</div>\n", header() + "\n");
home = swap(home, "audience", /<nav class="iam"/, "</ul></div></nav>", audienceBar());
/* shortcut cards (links only from nav.json) with the audience switcher above them */
const navFind = label => { for (const p of nav.primary) { if (p.label === label) return { label: p.label, href: local(p.local) }; for (const c of p.children || []) if (c.label === label) return c.local ? { label: c.label, href: local(c.local) } : null; } const s2 = nav.secondary_bar.find(x => x.label === label); return s2 && s2.local ? { label: s2.label, href: local(s2.local) } : null; };
const SHORT = ["Programs", "Admission India", "Admission International", "Scholarships", "Hostels", "Campus Life", "Placement Statistics", "International", "Research", "Innovation & Incubation", "Departments", "Accreditations & Rankings", "Contact"].map(navFind).filter(Boolean);
SHORT.splice(1, 0, { label: "Parents", href: local(nav.audience_ext.Parents) });
const AUDIENCES = {
  student: ["Programs", "Admission India", "Scholarships", "Hostels", "Campus Life", "Placement Statistics"],
  parent: ["Parents", "Hostels", "Scholarships", "Admission India", "Contact", "Placement Statistics"],
  international: ["Admission International", "International", "Programs", "Hostels", "Scholarships", "Contact"],
  researcher: ["Research", "Innovation & Incubation", "Departments", "Accreditations & Rankings", "Programs", "Contact"]
};
const studentOrder = [...AUDIENCES.student, ...SHORT.map(x => x.label).filter(l => !AUDIENCES.student.includes(l))];
const shortcuts = `<!-- build:shortcuts -->
<section class="shortcuts wrap" aria-labelledby="shortcuts-title" data-shortcuts>
  <div class="aud" role="radiogroup" aria-labelledby="aud-label" data-aud><span class="aud__label" id="aud-label">I am a</span>
    ${[["student", "Student"], ["parent", "Parent"], ["international", "International"], ["researcher", "Researcher"]].map(([v, t], i) => `<label class="aud__opt"><input type="radio" name="aud" value="${v}"${i === 0 ? " checked" : ""}><span>${t}</span></label>`).join("")}
  </div>
  <h2 class="shortcuts__title" id="shortcuts-title" data-aud-title>Popular with students</h2>
  <ul class="shortcuts__list" data-aud-list>${studentOrder.map(l => SHORT.find(x => x.label === l)).map(x => `<li data-aud-item="${esc(x.label)}"><a class="shortcut" href="${x.href}">${esc(x.label)}</a></li>`).join("")}</ul>
  ${jsonData("aud-data", AUDIENCES)}
</section>
<!-- /build:shortcuts -->`;
if (home.includes("<!-- build:shortcuts -->")) home = swap(home, "shortcuts", /x^/, "", shortcuts);
else home = home.replace("<!-- /build:audience -->", "<!-- /build:audience -->\n" + shortcuts);
home = home.replace(PREPAINT + "\n", "").replace(PREPAINT, "");
if (!home.includes("/assets/js/features.js")) home = home.replace('<script src="assets/js/site.js" defer></script>', '<script src="assets/js/site.js" defer></script>\n<script src="/assets/js/features.js" defer></script>');
home = swap(home, "footer", /<!-- Footer:[^\n]*\n<footer|<footer class="footer"/, "</footer>", footer());
home = home
  .replace(/<title>[^<]*<\/title>/, "<title>SRM Institute of Science and Technology | Kattankulathur, Chennai</title>")
  .replace(/<meta name="description" content="[^"]*">/, '<meta name="description" content="SRM Institute of Science and Technology, Kattankulathur, Chennai: programmes, admissions, research, campus life and placements.">')
  .replace(/\n<meta name="srm-ai-endpoint"[^>]*>/, "")
  .replace(/\n<meta name="claude:viewport-fit-sides"[^>]*>/, "")
  .replace(/<meta name="robots"[^>]*>\n?/, "")
  .replace(/(<meta name="viewport"[^>]*>)/, '$1\n<meta name="robots" content="noindex, nofollow">')
  .replace(/<link rel="stylesheet" href="assets\/css\/site.css">(\n<link rel="stylesheet" href="\/assets\/css\/inner.css">)?/, '<link rel="stylesheet" href="assets/css/site.css">\n<link rel="stylesheet" href="/assets/css/inner.css">')
  .replace(/<form class="hero__find" action="[^"]*"/, '<form class="hero__find" action="/programs/"')
  .replace(/<p class="ai__note">[\s\S]*?<\/p>/, '<p class="ai__note">Answers come from a live web search with links to the sources, or from this site’s pages when search is unavailable.</p>');
/* legacy flat page links on the home page -> built routes */
const LEGACY = { "academics.html": "/academics/", "admissions.html": "/admissions/", "research.html": "/research/", "placements.html": "/placements/", "campus-life.html": "/campus-life/", "page.html": "/about/" };
home = home.replace(/href="(academics|admissions|research|placements|campus-life|page)\.html(#[^"]*)?"/g, (m, f) => `href="${LEGACY[f + ".html"]}"`);
/* home body: exact url-map rewrites, and the external marker on every remaining external link */
home = home.replace(/<a\b([^>]*)>([\s\S]*?)<\/a>/g, (m, attrs, inner) => {
  const hm = attrs.match(/href="([^"]+)"/); if (!hm) return m;
  const href = hm[1];
  if (!/^https?:\/\//.test(href)) return m;
  if (/<span class="sr-only">\s*\(opens /.test(inner)) return m; // already marked by the builder
  const loc = mapped(href);
  if (loc) return `<a${attrs.replace(/\s*data-ext\b/, "").replace(/\s*target="[^"]*"/, "").replace(/\s*rel="[^"]*"/, "").replace(/href="[^"]+"/, `href="${loc}"`)}>${inner}</a>`;
  const clean = attrs.replace(/\s*target="[^"]*"/, "").replace(/\s*rel="[^"]*"/, "").replace(/\s*data-ext\b/, "");
  return `<a${clean} target="_blank" rel="noopener noreferrer" data-ext>${inner}${EXT_ICON}<span class="sr-only">${srText(href)}</span></a>`;
});
fs.writeFileSync(homeFile, home);

/* home page text for Ask */
current = { route: "/", title: "Home" };
const homeMain = home.slice(home.indexOf('<main id="main">'), home.indexOf("</main>"));
homeMain.split(/<section\b/).slice(1).forEach(s => {
  const h = (s.match(/<h2[^>]*>([\s\S]*?)<\/h2>/) || [])[1];
  const id = (s.match(/^[^>]*\sid="([^"]+)"/) || [])[1];
  if (h) record(id || "", strip(h), s.replace(/<script[\s\S]*?<\/script>/g, ""));
});

/* ---------- Ask index ---------- */
fs.mkdirSync(path.join(ROOT, "assets/data"), { recursive: true });
fs.writeFileSync(path.join(ROOT, "assets/data/ask-index.json"), JSON.stringify(askChunks));

/* ---------- robots ---------- */
fs.writeFileSync(path.join(ROOT, "robots.txt"), "User-agent: *\nDisallow: /\n");

console.log(`built ${pages.length} pages + home, ${askChunks.length} Ask passages`);
