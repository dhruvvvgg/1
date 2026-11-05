/* SRM concept v3. Progressive enhancement: the page reads fine without this file. */
(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Full-screen menu ---------- */
  const menu = $("[data-menu]");
  const openBtn = $("[data-menu-open]");
  if (menu && openBtn) {
    const close = () => { menu.hidden = true; openBtn.setAttribute("aria-expanded", "false"); document.documentElement.style.overflow = ""; openBtn.focus(); };
    openBtn.addEventListener("click", () => {
      menu.hidden = false; openBtn.setAttribute("aria-expanded", "true");
      document.documentElement.style.overflow = "hidden";
      $("[data-menu-close]", menu).focus();
    });
    $("[data-menu-close]", menu).addEventListener("click", close);
    $$("a", menu).forEach(a => a.addEventListener("click", () => { if (a.hash) close(); }));
    menu.addEventListener("keydown", e => {
      if (e.key === "Escape") close();
      if (e.key !== "Tab") return;
      const f = $$("a, button", menu); const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  /* ---------- Hero: photos inside the wordmark, slow cross-fade, pausable ---------- */
  const mark = $("[data-wordmark]");
  if (mark) {
    const fills = $$(".wordmark__fill", mark);
    const toggle = $("[data-wordmark-toggle]");
    const phone = matchMedia("(max-width: 560px)");
    const paint = () => fills.forEach(f => {
      const src = phone.matches && f.dataset.imgM ? f.dataset.imgM : f.dataset.img;
      const img = new Image();
      img.onload = () => { f.style.backgroundImage = `url("${src}")`; f.classList.add("has-img"); };
      img.src = src;
    });
    paint();
    if (phone.addEventListener) phone.addEventListener("change", paint); else if (phone.addListener) phone.addListener(paint);
    let i = 0, timer = null;
    const show = n => {
      fills.forEach((f, k) => f.classList.toggle("is-on", k === n));
    };
    const play = () => { timer = setInterval(() => { i = (i + 1) % fills.length; show(i); }, 5000); };
    const stop = () => { clearInterval(timer); timer = null; };
    if (!calm && fills.length > 1) play();
    if (toggle) {
      if (calm) toggle.hidden = true;
      const PAUSE = "M3 2h3v10H3zM8 2h3v10H8z", PLAY = "M4 2l8 5-8 5z";
      toggle.addEventListener("click", () => {
        const pausing = !!timer;
        if (pausing) stop(); else { i = (i + 1) % fills.length; show(i); play(); } // resuming moves on at once, so the press is visible
        mark.classList.toggle("is-paused", pausing); // freezes the slow pan inside the letters as well
        toggle.setAttribute("aria-pressed", String(pausing));
        $("path", toggle).setAttribute("d", pausing ? PLAY : PAUSE);
        $("span", toggle).textContent = pausing ? "Play photos" : "Pause photos";
      });
    }
  }

  /* ---------- Scroll chapters: the card in view sets the backdrop and headline ---------- */
  const chapters = $("[data-chapters]");
  if (chapters && !calm && "IntersectionObserver" in window) {
    const bgs = $$(".stage__bg img", chapters);
    const words = $$(".stage__title span", chapters);
    const count = $("[data-stage-count]", chapters);
    const cards = $$("[data-chapter]", chapters);
    let current = 0;
    const set = n => {
      if (n === current) return;
      current = n;
      bgs.forEach((b, k) => b.classList.toggle("is-on", k === n));
      words.forEach((w, k) => w.classList.toggle("is-on", k === n));
      count.textContent = `${String(n + 1).padStart(2, "0")} / ${String(cards.length).padStart(2, "0")}`;
    };
    // Load backdrops eagerly once the section is near, so the cross-fade never shows an empty frame.
    new IntersectionObserver((entries, obs) => {
      if (entries.some(e => e.isIntersecting)) { bgs.forEach(b => (b.loading = "eager")); obs.disconnect(); }
    }, { rootMargin: "600px" }).observe(chapters);
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) set(Number(e.target.dataset.chapter)); });
    }, { rootMargin: "-45% 0px -45% 0px" });
    cards.forEach(c => io.observe(c));
  }

  /* ---------- Header gains a soft shadow once the page scrolls ---------- */
  const header = $(".header");
  if (header) { const f = () => header.classList.toggle("is-stuck", window.scrollY > 8); f(); addEventListener("scroll", f, { passive: true }); }

  /* ---------- Footer: accordions collapse on small screens ---------- */
  const small = window.matchMedia("(max-width: 560px)");
  const syncAcc = () => $$("[data-acc]").forEach(d => (d.open = !small.matches));
  syncAcc(); if (small.addEventListener) small.addEventListener("change", syncAcc); else if (small.addListener) small.addListener(syncAcc);

  /* ---------- Work from SRM: one full-bleed slide at a time (native scroll-snap does the work) ---------- */
  const reel = $("[data-reel]");
  if (reel) {
    const items = $$(".slide", reel);
    const countEl = $("[data-reel-count]");
    const current = () => Math.round(reel.scrollLeft / reel.clientWidth);
    const go = n => reel.scrollTo({ left: Math.max(0, Math.min(items.length - 1, n)) * reel.clientWidth, behavior: calm ? "auto" : "smooth" });
    $("[data-reel-prev]").addEventListener("click", () => go(current() - 1));
    $("[data-reel-next]").addEventListener("click", () => go(current() + 1));
    const upd = () => { countEl.textContent = `${current() + 1} / ${items.length}`; };
    reel.addEventListener("scroll", () => requestAnimationFrame(upd), { passive: true });
    reel.addEventListener("keydown", e => { if (e.key === "ArrowRight") { e.preventDefault(); go(current() + 1); } if (e.key === "ArrowLeft") { e.preventDefault(); go(current() - 1); } });
    upd();
  }

  /* ---------- Chapter and heritage figures count up without moving the layout ---------- */
  const counts = $$("[data-count]");
  if (counts.length && !calm && "IntersectionObserver" in window) {
    const nf = new Intl.NumberFormat("en-IN");
    const roll = el => {
      const end = Number(el.dataset.count), plus = el.textContent.trim().endsWith("+") ? "+" : "";
      const final = el.textContent;
      el.setAttribute("aria-label", nf.format(end) + plus);
      el.style.display = "inline-block"; el.style.minWidth = el.getBoundingClientRect().width + "px"; // width of the final value, held while counting
      const t0 = performance.now(), dur = 900;
      const tick = now => {
        const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
        el.textContent = k < 1 ? nf.format(Math.round(end * e)) + plus : final;
        if (k < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const seen = new IntersectionObserver((entries, o) => entries.forEach(e => { if (e.isIntersecting) { roll(e.target); o.unobserve(e.target); } }), { rootMargin: "0px 0px -20% 0px" });
    counts.forEach(c => seen.observe(c));
  }


  /* ---------- Finder: filter a list as the visitor types (and honour ?q= from the home page) ---------- */
  $$("[data-filter]").forEach(input => {
    const items = $$(input.dataset.filter), empty = document.getElementById(input.dataset.filterEmpty);
    const groups = input.dataset.filterGroup ? $$(input.dataset.filterGroup) : [];
    const apply = () => {
      const q = input.value.trim().toLowerCase();
      let shown = 0;
      items.forEach(li => { const hit = !q || li.textContent.replace(" (opens the official SRMIST site)", "").toLowerCase().includes(q); li.hidden = !hit; if (hit) shown++; });
      groups.forEach(g => { g.hidden = !$$(input.dataset.filter, g).some(li => !li.hidden); });
      if (empty) empty.hidden = shown > 0;
    };
    input.addEventListener("input", apply);
    const q0 = new URLSearchParams(location.search).get("q");
    if (q0) { input.value = q0; apply(); }
  });

  /* ---------- v4: external-link announcements, heading reveals, slow parallax ---------- */
  $$("a[data-ext]").forEach(a => { if (!$(".sr-only", a)) { const s = document.createElement("span"); s.className = "sr-only"; s.textContent = " (opens the official SRMIST site)"; a.append(s); } });

  if (!calm && "IntersectionObserver" in window) {
    const heads = $$(".s-head h2, .bgsec--band h2, .stat-band h2, .heritage h2, .ways-head h2, .closer h2, .bgsec--hero h1, .page-hero h1");
    const rv = new IntersectionObserver((es, o) => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("is-in"); o.unobserve(e.target); } }), { rootMargin: "0px 0px -12% 0px" });
    heads.forEach(h => { h.classList.add("js-rv"); rv.observe(h); });

    const pars = $$(".bgsec").filter(b => $(".bgsec__img", b));
    pars.forEach(b => b.classList.add("is-par"));
    let tick = false;
    const run = () => {
      pars.forEach(b => {
        const r = b.getBoundingClientRect();
        if (r.bottom < -100 || r.top > innerHeight + 100) return;
        const k = (r.top + r.height / 2 - innerHeight / 2) / innerHeight; // -1..1 around the viewport centre
        $(".bgsec__img", b).style.setProperty("--py", `${Math.max(-1, Math.min(1, k)) * -36}px`);
      });
      tick = false;
    };
    addEventListener("scroll", () => { if (!tick) { tick = true; requestAnimationFrame(run); } }, { passive: true }); run();
  }

  /* ---------- Ask SRM: client-side retrieval over this site's own content ----------
     Passages come from /assets/data/ask-index.json (built from /content by scripts/build.js).
     Ranking is BM25. The answer is the top passages quoted word for word, each with a link
     to the page it came from. Nothing is generated. */
  const ai = $("[data-ai]"), aiForm = $(".hero__find");
  if (ai && aiForm) {
    const input = $("input", aiForm), qEl = $("[data-ai-q]", ai), aEl = $("[data-ai-a]", ai), linksEl = $("[data-ai-links]", ai);
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
    /* quote the sentences that carry the most query terms, word for word */
    const quote = (text, q) => {
      const terms = new Set(tok(q));
      const sents = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text];
      const ranked = sents.map((s, i) => ({ s: s.trim(), i, n: tok(s).filter(w => terms.has(w)).length })).filter(x => x.n > 0).sort((a, b) => b.n - a.n || a.i - b.i);
      const pick = (ranked.length ? ranked.slice(0, 2) : [{ s: sents[0].trim(), i: 0 }]).sort((a, b) => a.i - b.i).map(x => x.s).join(" ");
      return pick.length > 420 ? pick.slice(0, 417).replace(/\s+\S*$/, "") + "…" : pick;
    };
    const THRESHOLD = 2.2;
    const li = (child) => { const l = document.createElement("li"); l.append(child); return l; };
    const anchor = (href, text) => { const a = document.createElement("a"); a.href = href; a.textContent = text; return a; };
    aiForm.addEventListener("submit", async e => {
      const q = input.value.trim();
      if (!q) return;
      e.preventDefault();
      ai.hidden = false; ai.setAttribute("aria-busy", "true"); qEl.textContent = q; aEl.replaceChildren(); linksEl.replaceChildren();
      try {
        const ix = await loadIndex();
        const top = bm25(ix, q).filter(x => x.s >= THRESHOLD);
        if (!top.length) {
          aEl.textContent = "This site does not have an answer to that.";
          linksEl.append(li(anchor("/contact/", "Contact SRMIST")), li(anchor("/programs/?q=" + encodeURIComponent(q), "Search programmes for “" + q + "”")));
        } else {
          const seen = new Set();
          top.filter(x => !seen.has(x.d.c.u) && seen.add(x.d.c.u)).slice(0, 3).forEach(x => {
            const bq = document.createElement("blockquote"); bq.className = "ai__quote";
            const p = document.createElement("p"); p.textContent = "“" + quote(x.d.c.t, q) + "”";
            const cite = document.createElement("p"); cite.className = "ai__cite";
            cite.append("Source: ", anchor(x.d.c.u, x.d.c.p + (x.d.c.h && x.d.c.h !== x.d.c.p ? " › " + x.d.c.h : "")));
            bq.append(p, cite); aEl.append(bq);
          });
        }
      } catch (err) {
        aEl.textContent = "Search is not available right now.";
        linksEl.append(li(anchor("/contact/", "Contact SRMIST")));
      } finally { ai.setAttribute("aria-busy", "false"); }
    });
  }

  /* ---------- Every page opens at its top ---------- */
  try { history.scrollRestoration = "manual"; } catch (e) {}
  scrollTo(0, 0);
  addEventListener("pageshow", () => scrollTo(0, 0));

  /* Opening seal: preserve the emblem centre throughout the zoom. */
  const intro = $("[data-intro]"), root = document.documentElement;
  if (intro) {
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let done = false, frame = 0, safety = 0, started = null;
    const scene = $(".intro__scene", intro);
    const seal = $("[data-intro-seal]", intro);
    const windows = $("[data-intro-windows]", intro);
    const background = [...document.body.children].filter(el => el !== intro && !["SCRIPT", "STYLE"].includes(el.tagName));
    const previousInert = background.map(el => el.inert);
    const finish = () => {
      if (done) return;
      done = true;
      cancelAnimationFrame(frame); clearTimeout(safety);
      root.classList.remove("intro-on", "intro-hold"); root.classList.add("intro-skip");
      background.forEach((el, i) => { el.inert = previousInert[i]; });
      removeEventListener("keydown", onKey);
      motion.removeEventListener("change", onMotion);
      try { sessionStorage.setItem("srm-intro", "1"); } catch (e) {}
      intro.remove();
    };
    const onKey = e => { if (e.key === "Escape") finish(); };
    const onMotion = () => { if (motion.matches) finish(); };
    const paint = progress => {
      const width = innerWidth, height = innerHeight;
      scene.setAttribute("viewBox", `0 0 ${width} ${height}`);
      const initial = Math.min(width, height) * 0.34 / 178;
      const base = Math.min(initial, 260 / 178);
      const zoom = Math.max(0, Math.min(1, (progress - 0.34) / 0.66));
      // Scale around the seal centre. Never pan towards an individual opening.
      const travel = zoom * zoom * zoom;
      const scale = base * Math.pow((Math.hypot(width, height) / 0.25) / base, travel);
      const focusX = 89, focusY = 89;
      const transform = `translate(${width / 2} ${height / 2}) scale(${scale}) translate(${-focusX} ${-focusY})`;
      seal.setAttribute("transform", transform);
      windows.setAttribute("transform", transform);
      // Ease the solid tree aperture open: the original blue details blend away
      // with the white tree rather than switching to a different drawing.
      const opening = Math.max(0, Math.min(1, (progress - 0.34) / 0.15));
      windows.setAttribute("opacity", String(opening * opening * (3 - 2 * opening)));
      if (progress > 0.65) root.classList.remove("intro-hold");
    };
    if (!root.classList.contains("intro-on") || motion.matches) intro.remove();
    else {
      background.forEach(el => { el.inert = true; });
      paint(0); intro.classList.add("is-ready");
      const tick = time => {
        if (started === null) started = time;
        const progress = Math.min(1, (time - started) / 3300);
        paint(progress);
        if (progress === 1) finish(); else frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
      $("[data-intro-skip]", intro).addEventListener("click", finish);
      addEventListener("keydown", onKey);
      motion.addEventListener("change", onMotion);
      safety = setTimeout(finish, 5500);
    }
  }
})();
