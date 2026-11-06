/* Site-wide features: Ask SRM (hero + panel), programme intent, reading preferences,
   desktop dropdowns, mobile action bar, audience switcher, copy buttons.
   Plain JS. Everything degrades to ordinary links and forms without it. */
(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const root = document.documentElement;
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  const calm = () => root.classList.contains("pref-motion") || matchMedia("(prefers-reduced-motion: reduce)").matches;
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  const anchor = (href, text, ext) => {
    const a = el("a", null, text); a.href = href;
    if (ext) { a.target = "_blank"; a.rel = "noopener noreferrer"; a.dataset.ext = ""; a.append(el("span", "sr-only", " (opens the original SRMIST site)")); }
    return a;
  };
  const inr = n => "₹" + Number(n).toLocaleString("en-IN");

  /* ======================================================================
     Programme data + filter (shared with the Program Finder in inner.js)
     ====================================================================== */
  let progP = null;
  const loadPrograms = () => progP || (progP = fetch("/assets/data/programs.json").then(r => r.json()));
  const filterPrograms = (data, f) => data.rows.filter(p => {
    const text = (p.name + " " + p.department + " " + data.colleges[p.college_idx]).toLowerCase();
    const words = (f.q || "").toLowerCase().split(/\s+/).filter(Boolean);
    return (!f.level || p.level === f.level) && (f.college === "" || f.college == null || String(p.college_idx) === String(f.college)) &&
      (!f.campus || p.campus === f.campus) && (!f.duration || String(p.duration) === String(f.duration)) &&
      (!f.maxfee || (p.fee && p.fee <= Number(f.maxfee))) && words.every(w => text.includes(w));
  });

  /* Rule-based programme intent: no model, only patterns */
  const parseIntent = (q, data) => {
    const s = " " + q.toLowerCase().replace(/[’']/g, "") + " ";
    const f = {}; let hits = 0;
    const DEG = [["b\\.?\\s?tech", "b.tech", "U"], ["m\\.?\\s?tech", "m.tech", "P"], ["b\\.?\\s?arch", "b.arch", "U"], ["b\\.?\\s?des(ign)?", "b.des", "U"], ["bba", "bba", "U"], ["mba", "mba", "P"], ["bca", "b.c.a", "U"],
      ["b\\.?\\s?com", "b.com", "U"], ["b\\.?\\s?sc", "b.sc", "U"], ["m\\.?\\s?sc", "m.sc", "P"], ["b\\.?\\s?pharm", "b.pharm", "U"], ["llb", "llb", "U"], ["llm", "llm", "P"], ["b\\.?\\s?a\\b", "b.a", "U"], ["m\\.?\\s?a\\b", "m.a", "P"]];
    for (const [re, word, lvl] of DEG) if (new RegExp("[\\s(]" + re + "[\\s.,)]").test(s)) { f.q = word; f.level = lvl; hits++; break; }
    if (!f.level) {
      if (/\b(ug|undergrad\w*|bachelor\w*)\b/.test(s)) { f.level = "U"; hits++; }
      else if (/\b(pg|postgrad\w*|post graduate|master\w*)\b/.test(s)) { f.level = "P"; hits++; }
      else if (/\bdiploma\w*\b/.test(s)) { f.level = "Dp"; hits++; }
    }
    const COL = [[/\bengineer\w*|\btechnology\b/, 0], [/\bliberal arts|\bhumanities|\bcommerce\b|\bjournalism|\benglish\b/, 1], [/\bmanagement\b|\bbusiness\b/, 2], [/\bmedic\w*|\bhealth\b|\bnursing|\bpharm\w*|\bphysio\w*/, 3], [/\blaw\b|\blegal\b/, 4], [/\bagri\w*|\bhorticult\w*/, 5]];
    for (const [re, i] of COL) if (re.test(s) && i < data.colleges.length) { f.college = String(i); hits++; break; }
    if (/kattankulathur|\bktr\b/.test(s)) { f.campus = "K"; hits++; }
    else if (/baburayan\w*|acharapakkam/.test(s)) { f.campus = "B"; hits++; }
    const fee = s.match(/(?:under|below|less than|within|upto|up to|max(?:imum)?|budget(?: of)?|<)\s*(?:rs\.?|inr|₹)?\s*([\d.,]+)\s*(lakhs?|lacs?|l\b|k\b|thousand)?/);
    if (fee) {
      let n = parseFloat(fee[1].replace(/,/g, "")); const u = (fee[2] || "").trim();
      if (/^l/.test(u)) n *= 100000; else if (/^(k|thousand)/.test(u)) n *= 1000; else if (n < 100) n *= 100000;
      if (n > 0) { f.maxfee = String(Math.round(n)); hits++; }
    }
    const dur = s.match(/(\d)\s*-?\s*(?:years?|yrs?)\b/);
    if (dur) { f.duration = dur[1]; hits++; }
    return hits ? f : null;
  };
  const finderUrl = f => "/programs/?" + new URLSearchParams(Object.entries(f).filter(([, v]) => v !== "" && v != null)).toString();
  window.SRM = { loadPrograms, filterPrograms, parseIntent, finderUrl, store };

  const intentCard = (f, data) => {
    const list = filterPrograms(data, f);
    const box = el("div", "intent");
    const cnt = el("p", "intent__count"); cnt.append(el("b", null, String(list.length)), list.length === 1 ? " programme in this Program Finder matches." : " programmes in this Program Finder match.");
    box.append(cnt);
    if (list.length) {
      const ul = el("ul", "intent__list");
      list.slice(0, 3).forEach(p => {
        const li = el("li"); li.append(anchor(p.href, p.name, !p.href.startsWith("/")));
        const bits = [data.levels[p.level], data.campuses[p.campus], p.duration ? p.duration + " years" : "", p.fee ? p.feeLabel + " " + inr(p.fee) : ""].filter(Boolean).join(", ");
        li.append(el("span", "intent__meta", bits)); ul.append(li);
      });
      box.append(ul);
    }
    const acts = el("p", "intent__acts");
    const open = anchor(finderUrl(f), "Open in Program Finder"); open.className = "pill pill--blue"; acts.append(open);
    const full = anchor(data.full, "Full programme list", true); full.className = "more"; acts.append(" ", full);
    box.append(acts);
    return box;
  };

  /* ======================================================================
     Ask SRM: retrieval over this site's content (BM25, quoted, cited)
     ====================================================================== */
  const STOP = new Set("a an and are as at be by can do does for from has have how i in is it its me my of on or our the their there this to was what when where which who why will with you your about into than that them these they".split(" "));
  const tok = s => String(s).toLowerCase().normalize("NFKD").replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter(w => w && !STOP.has(w)).map(w => w.length > 4 ? w.replace(/(ies|es|s)$/, "") : w);
  let idxP = null;
  const loadIndex = () => idxP || (idxP = fetch("/assets/data/ask-index.json").then(r => r.json()).then(chunks => {
    const docs = chunks.map(c => { const toks = tok(c.h + " " + c.h + " " + c.t); const tf = new Map(); toks.forEach(t => tf.set(t, (tf.get(t) || 0) + 1)); return { c, tf, len: toks.length }; });
    const df = new Map(); docs.forEach(d => d.tf.forEach((_, t) => df.set(t, (df.get(t) || 0) + 1)));
    const avg = docs.reduce((s, d) => s + d.len, 0) / docs.length;
    return { docs, df, avg, N: docs.length };
  }));
  const bm25 = (ix, q) => {
    const k1 = 1.4, b = 0.75, terms = [...new Set(tok(q))];
    return ix.docs.map(d => {
      let s = 0, hit = 0;
      terms.forEach(t => { const f = d.tf.get(t); if (!f) return; hit++; const n = ix.df.get(t); const idf = Math.log(1 + (ix.N - n + 0.5) / (n + 0.5)); s += idf * (f * (k1 + 1)) / (f + k1 * (1 - b + b * d.len / ix.avg)); });
      return { d, s: s * (hit / Math.max(terms.length, 1)), hit };
    }).filter(x => x.s > 0).sort((a, b) => b.s - a.s);
  };
  const quote = (text, q) => {
    const terms = new Set(tok(q));
    const sents = text.split(/(?<!\b(?:[A-Z]|Dr|No|St|Mr|Ms|Prof|Sec|Ltd|Pvt|Govt|viz|etc))(?<=[.!?])\s+(?=[A-Z0-9“"(])/).filter(Boolean);
    if (sents.length === 1 && text.length > 420) {
      const words = text.split(/\s+/), hit = Math.max(0, words.findIndex(w => terms.has(tok(w)[0])));
      const from = Math.max(0, hit - 12);
      return (from ? "…" : "") + words.slice(from, from + 60).join(" ") + (from + 60 < words.length ? "…" : "");
    }
    const ranked = sents.map((s, i) => ({ s: s.trim(), i, n: tok(s).filter(w => terms.has(w)).length })).filter(x => x.n > 0).sort((a, b) => b.n - a.n || a.i - b.i);
    const pick = (ranked.length ? ranked.slice(0, 2) : [{ s: sents[0].trim(), i: 0 }]).sort((a, b) => a.i - b.i).map(x => x.s).join(" ");
    return pick.length > 420 ? pick.slice(0, 417).replace(/\s+\S*$/, "") + "…" : pick;
  };
  /* inClaude(q, out, links): inside a claude.ai artifact, Claude answers, grounded in this site's best-matching passages */
  let sampleP = null;
  const inClaude = async (q, out, links) => {
    if (!(window.claude && typeof window.claude.use === "function")) return false;
    const sample = await (sampleP || (sampleP = window.claude.use("sample").catch(() => null)));
    if (!sample) return false;
    const ix = await loadIndex().catch(() => null);
    const seen = new Set();
    const ctx = ix ? bm25(ix, q).filter(x => !seen.has(x.d.c.u) && seen.add(x.d.c.u)).slice(0, 5).map(x => x.d.c) : [];
    const prompt = "You answer questions from prospective students and parents about SRM Institute of Science and Technology (SRMIST), Kattankulathur, Chennai, on a redesign of its website.\n" +
      "Use the site passages below first. You may add what you reliably know about SRMIST. Only give a fee, date, cut-off or other figure if a passage states it; otherwise say to confirm it on srmist.edu.in. " +
      "If you are unsure, say so. Write at most 120 words of plain text, no markdown, no lists.\n\nSite passages:\n" +
      (ctx.length ? ctx.map((c, i) => `[${i + 1}] ${c.p}${c.h && c.h !== c.p ? " > " + c.h : ""}: ${c.t.slice(0, 700)}`).join("\n") : "(none matched)") +
      "\n\nQuestion: " + q;
    const p = el("p", "ai__text", "Thinking…"); out.append(p);
    try {
      const r = await sample(prompt, { onText: ({ text }) => { p.textContent = text; }, modelTier: "quick" });
      p.textContent = r.text.replace(/\*\*/g, "").trim();
    } catch (e) { p.remove(); return false; }
    if (ctx.length) {
      const ul = links || el("ul", "ai__links");
      ctx.slice(0, 3).forEach(c => { const li = el("li"); li.append(anchor(c.u, c.p + (c.h && c.h !== c.p ? " › " + c.h : ""))); ul.append(li); });
      if (!links) { out.append(el("p", "ai__cite", "Related pages on this site:")); out.append(ul); }
    }
    out.append(el("p", "ai__cite", "Answered by Claude using this site’s pages. Check fees and dates on srmist.edu.in before you apply."));
    return true;
  };
  /* online(q, out, links): live web answer from /api/ask (Gemini with Google Search); false when unavailable */
  const online = async (q, out, links) => {
    if (!/^https?:$/.test(location.protocol)) return false;
    const wait = el("p", "ai__wait", "Searching the web…"); out.append(wait);
    let d = null;
    try {
      const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 20000);
      const r = await fetch("/api/ask/", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question: q }), signal: ctl.signal });
      clearTimeout(t);
      if (r.ok) d = await r.json();
    } catch (e) { d = null; }
    wait.remove();
    if (!d || typeof d.answer !== "string" || !d.answer.trim()) return false;
    d.answer.trim().split(/\n{2,}/).forEach(para => out.append(el("p", "ai__text", para.trim())));
    const src = (d.sources || []).filter(x => x && /^https:\/\//.test(x.url));
    if (src.length) {
      const ul = links || el("ul", "ai__links");
      src.forEach(x => { const li = el("li"); const a = anchor(x.url, x.title, true); a.lastChild.textContent = " (opens in a new tab)"; li.append(a); ul.append(li); });
      if (!links) { out.append(el("p", "ai__cite", d.online ? "Sources from a live web search:" : "More on the official site:")); out.append(ul); }
    }
    out.append(el("p", "ai__cite", d.online ? "Answered from a live web search. Check fees and dates on srmist.edu.in before you apply." : "Web search is unavailable, so this answer has no live sources."));
    return true;
  };
  const THRESHOLD = 2.2;
  /* answer(q, out, links): programme intent first, otherwise cited passages */
  const answer = async (q, out, links) => {
    out.replaceChildren(); if (links) links.replaceChildren();
    const data = await loadPrograms().catch(() => null);
    const f = data && parseIntent(q, data);
    if (f) { out.append(intentCard(f, data)); return; }
    if (await inClaude(q, out, links)) return;
    if (!window.claude && await online(q, out, links)) return;
    const ix = await loadIndex();
    const top = bm25(ix, q).filter(x => x.s >= THRESHOLD);
    const linkBox = links || out;
    if (!top.length) {
      out.append(el("p", null, "This site does not have an answer to that."));
      const ul = links ? linkBox : el("ul", "ai__links");
      [["/contact/", "Contact SRMIST"], ["/programs/?q=" + encodeURIComponent(q), "Search programmes for “" + q + "”"]].forEach(([h, t]) => { const li = el("li"); li.append(anchor(h, t)); ul.append(li); });
      if (!links) out.append(ul);
      return;
    }
    const seen = new Set();
    top.filter(x => !seen.has(x.d.c.u) && seen.add(x.d.c.u)).slice(0, 3).forEach(x => {
      const bq = el("blockquote", "ai__quote");
      bq.append(el("p", null, "“" + quote(x.d.c.t, q) + "”"));
      const cite = el("p", "ai__cite"); cite.append("Source: ", anchor(x.d.c.u, x.d.c.p + (x.d.c.h && x.d.c.h !== x.d.c.p ? " › " + x.d.c.h : "")));
      bq.append(cite); out.append(bq);
    });
  };

  /* hero search (home page) */
  const ai = $("[data-ai]"), aiForm = $(".hero__find");
  if (ai && aiForm) {
    const input = $("input", aiForm), qEl = $("[data-ai-q]", ai), aEl = $("[data-ai-a]", ai), linksEl = $("[data-ai-links]", ai);
    aiForm.addEventListener("submit", async e => {
      const q = input.value.trim(); if (!q) return;
      e.preventDefault();
      ai.hidden = false; ai.setAttribute("aria-busy", "true"); qEl.textContent = q;
      try { await answer(q, aEl, linksEl); }
      catch (err) { aEl.textContent = "Search is not available right now."; linksEl.replaceChildren(); const l = el("li"); l.append(anchor("/contact/", "Contact SRMIST")); linksEl.append(l); }
      finally { ai.setAttribute("aria-busy", "false"); }
    });
  }

  /* ======================================================================
     Ask SRM panel: header button, Ctrl+K / Cmd+K, Esc, focus return
     ====================================================================== */
  const panel = $("[data-askp]");
  let lastOpener = null;
  const trap = (box, e) => {
    if (e.key !== "Tab") return;
    const f = $$('a[href], button:not([disabled]), input:not([disabled]), select, [tabindex="0"]', box).filter(x => x.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };
  if (panel) {
    const form = $("[data-askp-form]", panel), input = $("#askp-q", panel), out = $("[data-askp-out]", panel);
    const openBtn = $("[data-ask-open]");
    const open = opener => {
      lastOpener = opener || openBtn; panel.hidden = false; root.classList.add("has-overlay");
      requestAnimationFrame(() => input.focus());
    };
    const close = () => { panel.hidden = true; root.classList.remove("has-overlay"); (lastOpener || openBtn).focus(); };
    $$("[data-ask-open]").forEach(b => b.addEventListener("click", () => open(b)));
    $("[data-askp-close]", panel).addEventListener("click", close);
    panel.addEventListener("click", e => { if (e.target === panel) close(); });
    panel.addEventListener("keydown", e => { if (e.key === "Escape") { e.preventDefault(); close(); } trap(panel, e); });
    document.addEventListener("keydown", e => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); panel.hidden ? open(openBtn) : close(); }
    });
    const run = async q => {
      out.setAttribute("aria-busy", "true");
      try { await answer(q, out, null); } catch (err) { out.textContent = "Search is not available right now."; }
      finally { out.setAttribute("aria-busy", "false"); }
    };
    form.addEventListener("submit", e => { e.preventDefault(); const q = input.value.trim(); if (q) run(q); });
    $$("[data-ask-chip]", panel).forEach(b => b.addEventListener("click", () => { input.value = b.textContent; run(b.textContent); }));
    if (/Mac|iPhone|iPad/.test(navigator.platform || "")) $$(".hdr-kbd").forEach(k => (k.textContent = "⌘K"));
  }

  /* ======================================================================
     Reading preferences
     ====================================================================== */
  const prefs = $("[data-prefs]"), prefsBtn = $("[data-prefs-open]");
  if (prefs && prefsBtn) {
    const status = $("[data-prefs-status]", prefs);
    const read = () => store.get("srm-prefs", {});
    const apply = p => {
      [0, 1, 2].forEach(i => root.classList.toggle("pref-size-" + i, p.size === i && i > 0));
      root.classList.toggle("pref-contrast", !!p.contrast);
      root.classList.toggle("pref-dyslexia", !!p.dyslexia);
      root.classList.toggle("pref-motion", !!p.motion);
    };
    const sync = () => {
      const p = read();
      $$('input[name="pref-size"]', prefs).forEach(r => (r.checked = Number(r.value) === (p.size || 0)));
      $$("[data-pref]", prefs).forEach(c => (c.checked = !!p[c.dataset.pref]));
    };
    const save = p => { store.set("srm-prefs", p); apply(p); };
    const toggle = show => {
      prefs.hidden = !show; prefsBtn.setAttribute("aria-expanded", String(show));
      if (show) { sync(); $('input[name="pref-size"]:checked', prefs).focus(); } else prefsBtn.focus();
    };
    prefsBtn.addEventListener("click", () => toggle(prefs.hidden));
    $("[data-prefs-close]", prefs).addEventListener("click", () => toggle(false));
    prefs.addEventListener("keydown", e => { if (e.key === "Escape") { e.preventDefault(); toggle(false); } });
    document.addEventListener("click", e => { if (!prefs.hidden && !prefs.contains(e.target) && !prefsBtn.contains(e.target)) { prefs.hidden = true; prefsBtn.setAttribute("aria-expanded", "false"); } });
    prefs.addEventListener("change", e => {
      const p = read();
      if (e.target.name === "pref-size") p.size = Number(e.target.value);
      if (e.target.dataset.pref) p[e.target.dataset.pref] = e.target.checked;
      save(p); status.textContent = "Preference saved.";
    });
    $("[data-prefs-reset]", prefs).addEventListener("click", () => { save({}); sync(); status.textContent = "Preferences reset."; });
  }

  /* ======================================================================
     Desktop dropdowns (1024px and up): hover, focus, Enter, Esc, arrows
     ====================================================================== */
  const wide = matchMedia("(min-width: 1024px)");
  const dds = $$("[data-dd]");
  const closeAll = except => dds.forEach(d => { if (d !== except) { $(".nav__panel", d).hidden = true; $(".nav__caret", d).setAttribute("aria-expanded", "false"); } });
  dds.forEach(d => {
    const btn = $(".nav__caret", d), pnl = $(".nav__panel", d), top = $(".nav__top", d);
    const show = () => { closeAll(d); pnl.hidden = false; btn.setAttribute("aria-expanded", "true"); };
    const hide = () => { pnl.hidden = true; btn.setAttribute("aria-expanded", "false"); };
    let t = null;
    d.addEventListener("mouseenter", () => { if (!wide.matches) return; clearTimeout(t); show(); });
    d.addEventListener("mouseleave", () => { if (!wide.matches) return; t = setTimeout(hide, 120); });
    btn.addEventListener("click", () => (pnl.hidden ? show() : hide()));
    d.addEventListener("focusout", e => { if (!d.contains(e.relatedTarget)) hide(); });
    d.addEventListener("keydown", e => {
      const items = [top, ...$$("a", pnl)].filter(x => x.offsetParent !== null);
      const i = items.indexOf(document.activeElement);
      if (e.key === "Escape" && !pnl.hidden) { e.preventDefault(); hide(); btn.focus(); }
      else if (e.key === "ArrowDown") { e.preventDefault(); if (pnl.hidden) show(); requestAnimationFrame(() => { const its = [top, ...$$("a", pnl)]; its[Math.min(its.length - 1, i + 1 || 1)].focus(); }); }
      else if (e.key === "ArrowUp" && i > 0) { e.preventDefault(); items[i - 1].focus(); }
      else if ((e.key === "ArrowRight" || e.key === "ArrowLeft") && (document.activeElement === top || document.activeElement === btn)) {
        e.preventDefault();
        const tops = $$(".nav__top, .nav__caret", $("[data-nav]"));
        const k = tops.indexOf(document.activeElement) + (e.key === "ArrowRight" ? 1 : -1);
        if (tops[k]) tops[k].focus();
      }
    });
  });
  document.addEventListener("click", e => { if (!e.target.closest("[data-dd]")) closeAll(); });

  /* ======================================================================
     Mobile action bar: hidden while the full-screen menu or a dialog is open
     ====================================================================== */
  const menu = $("[data-menu]");
  if (menu) new MutationObserver(() => root.classList.toggle("has-menu", !menu.hidden)).observe(menu, { attributes: true, attributeFilter: ["hidden"] });

  /* ======================================================================
     Audience switcher (home page)
     ====================================================================== */
  const aud = $("[data-aud]"), audData = $("#aud-data");
  if (aud && audData) {
    const map = JSON.parse(audData.textContent), list = $("[data-aud-list]"), title = $("[data-aud-title]");
    const TITLES = { student: "Popular with students", parent: "Popular with parents", international: "Popular with international students", researcher: "Popular with researchers" };
    const items = $$("[data-aud-item]", list);
    const show = who => {
      const order = map[who] || map.student;
      const ranked = [...items].sort((a, b) => {
        const ia = order.indexOf(a.dataset.audItem), ib = order.indexOf(b.dataset.audItem);
        return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
      });
      ranked.forEach(li => list.append(li));
      title.textContent = TITLES[who] || TITLES.student;
      const r = $(`input[value="${who}"]`, aud); if (r) r.checked = true;
    };
    aud.addEventListener("change", e => { if (e.target.name === "aud") { store.set("srm-audience", e.target.value); show(e.target.value); } });
    const saved = store.get("srm-audience", "student");
    if (saved !== "student") show(saved);
  }

  /* ======================================================================
     Copy buttons (contact details)
     ====================================================================== */
  document.addEventListener("click", async e => {
    const b = e.target.closest("[data-copy]"); if (!b) return;
    const v = b.dataset.copy, status = (b.closest("[data-office], main") || document).querySelector("[data-copy-status]");
    let ok = false;
    try { await navigator.clipboard.writeText(v); ok = true; } catch (err) {
      const t = el("textarea"); t.value = v; t.setAttribute("readonly", ""); t.style.position = "fixed"; t.style.opacity = "0"; document.body.append(t); t.select();
      try { ok = document.execCommand("copy"); } catch (x) {} t.remove();
    }
    if (status) status.textContent = ok ? "Copied " + v : "Copy failed. Select the text instead.";
    const lbl = b.firstChild; const prev = lbl.textContent; lbl.textContent = ok ? "Copied" : "Copy"; setTimeout(() => (lbl.textContent = prev), 1600);
  });
})();
