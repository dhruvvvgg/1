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

  /* ---------- Header gains a soft shadow once the page scrolls ---------- */
  const header = $(".header");
  if (header) { const f = () => header.classList.toggle("is-stuck", window.scrollY > 8); f(); addEventListener("scroll", f, { passive: true }); }

  /* ---------- Footer: accordions collapse on small screens ---------- */
  const small = window.matchMedia("(max-width: 560px)");
  const syncAcc = () => $$("[data-acc]").forEach(d => (d.open = !small.matches));
  syncAcc(); small.addEventListener("change", syncAcc);

  /* ---------- Live IST clock in the footer ---------- */
  const clock = $("[data-clock]");
  if (clock) {
    const fmt = new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: false });
    const tick = () => { const d = new Date(); clock.textContent = fmt.format(d); clock.setAttribute("datetime", d.toISOString()); };
    tick(); setInterval(tick, 30000);
  }
})();
