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
    const credit = $("[data-wordmark-credit]");
    const toggle = $("[data-wordmark-toggle]");
    fills.forEach(f => {
      const img = new Image();
      img.onload = () => { f.style.backgroundImage = `url("${f.dataset.img}")`; f.classList.add("has-img"); };
      img.src = f.dataset.img;
    });
    let i = 0, timer = null;
    const show = n => {
      fills.forEach((f, k) => f.classList.toggle("is-on", k === n));
      if (credit) credit.textContent = fills[n].dataset.credit;
    };
    const play = () => { timer = setInterval(() => { i = (i + 1) % fills.length; show(i); }, 5000); };
    const stop = () => { clearInterval(timer); timer = null; };
    if (!calm && fills.length > 1) play();
    if (toggle) {
      if (calm) toggle.hidden = true;
      toggle.addEventListener("click", () => {
        const paused = !!timer;
        paused ? stop() : play();
        toggle.setAttribute("aria-pressed", String(paused));
        $("span", toggle).textContent = paused ? "Play photos" : "Pause photos";
      });
    }
  }

  /* ---------- Scroll chapters: the card in view sets the backdrop and headline ---------- */
  const chapters = $("[data-chapters]");
  if (chapters && !calm && "IntersectionObserver" in window) {
    const bgs = $$(".stage__bg img", chapters);
    const words = $$(".stage__title span", chapters);
    const count = $("[data-stage-count]", chapters);
    const credit = $("[data-stage-credit]", chapters);
    const cards = $$("[data-chapter]", chapters);
    let current = 0;
    const set = n => {
      if (n === current) return;
      current = n;
      bgs.forEach((b, k) => b.classList.toggle("is-on", k === n));
      words.forEach((w, k) => w.classList.toggle("is-on", k === n));
      count.textContent = `${String(n + 1).padStart(2, "0")} / ${String(cards.length).padStart(2, "0")}`;
      credit.textContent = cards[n].dataset.credit;
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

  /* ---------- Footer: accordions collapse on small screens ---------- */
  const small = window.matchMedia("(max-width: 560px)");
  const syncAcc = () => $$("[data-acc]").forEach(d => (d.open = !small.matches));
  syncAcc(); small.addEventListener("change", syncAcc);

  /* ---------- Live IST clock + sky that follows the time in Kattankulathur ---------- */
  const clock = $("[data-clock]");
  const fmt = new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: false });
  const istHour = () => {
    const p = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
    const h = Number(p.find(x => x.type === "hour").value) % 24, m = Number(p.find(x => x.type === "minute").value);
    return h + m / 60;
  };

  const sky = $("[data-skyline]");
  const NS = "http://www.w3.org/2000/svg";
  if (sky) {
    // Generate the window grids for both buildings.
    $$("[data-wins]", sky).forEach(g => {
      const d = g.dataset;
      for (let r = 0; r < +d.rows; r++) for (let c = 0; c < +d.cols; c++) {
        const w = document.createElementNS(NS, "rect");
        w.setAttribute("x", +d.x + c * (+d.w + +d.gx)); w.setAttribute("y", +d.y + r * (+d.h + +d.gy));
        w.setAttribute("width", d.w); w.setAttribute("height", d.h);
        w.setAttribute("class", "win");
        w.dataset.seed = String(((r * 7 + c * 13) % 10) / 10); // fixed pattern: same windows light up every evening
        g.append(w);
      }
    });
  }
  const paintSky = () => {
    if (clock) { clock.textContent = fmt.format(new Date()); clock.setAttribute("datetime", new Date().toISOString()); }
    if (!sky) return;
    const h = istHour();
    // 0 = day, 1 = full night. Dusk ramps 17:00–19:30, dawn 5:00–6:30.
    let night = 0;
    if (h >= 19.5 || h < 5) night = 1;
    else if (h >= 17) night = (h - 17) / 2.5;
    else if (h < 6.5) night = 1 - (h - 5) / 1.5;
    const mix = (a, b, t) => "#" + [0, 2, 4].map(i => Math.round(parseInt(a.slice(1 + i, 3 + i), 16) * (1 - t) + parseInt(b.slice(1 + i, 3 + i), 16) * t).toString(16).padStart(2, "0")).join("");
    const skyCol = night < 0.5 ? mix("#9cc3e4", "#e59a5b", night * 2) : mix("#e59a5b", "#0e1b33", (night - 0.5) * 2);
    $("[data-sky]", sky).setAttribute("fill", skyCol);
    const sun = $("[data-sun]", sky);
    sun.setAttribute("fill", night > 0.75 ? "#e9edf5" : "#f5d55a");
    sun.setAttribute("cy", String(90 + night * 30));
    $$(".win", sky).forEach(w => {
      const lit = night > +w.dataset.seed * 0.9 + 0.1;
      const tp2 = w.parentNode.dataset.wins === "tp2";
      w.setAttribute("fill", lit ? "#ffd766" : tp2 ? "#2b5aa8" : "#1c3f7a");
    });
  };
  paintSky(); setInterval(paintSky, 30000);

  /* Gentle parallax as the footer comes into view */
  if (sky && !calm) {
    const layers = $$(".layer", sky);
    let ticking = false;
    const onScroll = () => {
      if (ticking) return; ticking = true;
      requestAnimationFrame(() => {
        const r = sky.getBoundingClientRect();
        const p = Math.max(0, Math.min(1, (window.innerHeight - r.top) / (window.innerHeight + r.height)));
        layers.forEach(l => (l.style.transform = `translateY(${(1 - p) * 40 * +l.dataset.depth}px)`));
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  }
})();
