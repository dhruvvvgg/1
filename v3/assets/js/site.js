/* SRM concept v3. Navigation and content remain usable without JavaScript. */
(() => {
  "use strict";
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));
  const calm = window.matchMedia("(prefers-reduced-motion: reduce)");
  document.documentElement.classList.add("has-js");

  /* Native modal: background inertness, Escape, and focus containment are built in. */
  const menu = $("[data-menu]");
  const openBtn = $("[data-menu-open]");
  if (menu && openBtn && typeof menu.showModal === "function") {
    document.documentElement.classList.add("has-menu");
    openBtn.hidden = false;
    let previousOverflow = "";
    openBtn.addEventListener("click", () => {
      previousOverflow = document.documentElement.style.overflow;
      menu.showModal();
      openBtn.setAttribute("aria-expanded", "true");
      document.documentElement.style.overflow = "hidden";
      $("[data-menu-close]", menu).focus();
    });
    $("[data-menu-close]", menu).addEventListener("click", () => menu.close());
    $$("a", menu).forEach(a => a.addEventListener("click", () => menu.close()));
    menu.addEventListener("close", () => {
      openBtn.setAttribute("aria-expanded", "false");
      document.documentElement.style.overflow = previousOverflow;
      openBtn.focus();
    });
  }

  /* Only loaded photos enter the rotation. Pause when offscreen, hidden, or focused. */
  const mark = $("[data-wordmark]");
  if (mark) {
    const fills = $$(".wordmark__fill", mark);
    const hero = mark.closest(".hero");
    const credit = $("[data-wordmark-credit]");
    const toggle = $("[data-wordmark-toggle]");
    let loaded = [], current = fills[0], timer = null;
    let paused = false, inView = true, focusPaused = false;
    const show = slide => {
      current = slide;
      fills.forEach(f => f.classList.toggle("is-on", f === slide));
      if (credit) credit.textContent = slide.dataset.credit;
    };
    const sync = () => {
      clearInterval(timer);
      timer = null;
      if (toggle) {
        toggle.hidden = loaded.length < 2 || calm.matches;
        toggle.setAttribute("aria-pressed", String(paused));
        $("span", toggle).textContent = paused ? "Play photos" : "Pause photos";
        $("path", toggle).setAttribute("d", paused ? "M3 1.5 12 7 3 12.5z" : "M3 2h3v10H3zM8 2h3v10H8z");
      }
      if (loaded.length > 1 && !paused && !calm.matches && inView && !focusPaused && !document.hidden) {
        timer = setInterval(() => show(loaded[(loaded.indexOf(current) + 1) % loaded.length]), 5000);
      }
    };
    fills.forEach(f => {
      const img = new Image();
      img.onload = () => {
        f.style.backgroundImage = `url("${f.dataset.img}")`;
        f.classList.add("has-img");
        loaded = fills.filter(slide => slide.classList.contains("has-img"));
        if (!current.classList.contains("has-img")) show(loaded[0]);
        sync();
      };
      // A failed photo stays out of the rotation; the first slide retains a text fallback.
      img.onerror = () => { if (!loaded.length && credit) credit.textContent = "SRM Institute of Science and Technology"; };
      img.src = f.dataset.img;
    });
    if (toggle) toggle.addEventListener("click", () => { paused = !paused; focusPaused = false; sync(); });
    hero.addEventListener("focusin", () => { focusPaused = true; sync(); });
    hero.addEventListener("focusout", e => { if (!hero.contains(e.relatedTarget)) { focusPaused = false; sync(); } });
    document.addEventListener("visibilitychange", sync);
    calm.addEventListener("change", sync);
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(entries => { inView = entries[0].isIntersecting; sync(); }).observe(hero);
    }
  }

  /* Desktop scroll chapters; phones and reduced-motion mode use ordinary image sections. */
  const chapters = $("[data-chapters]");
  const cinematic = window.matchMedia("(min-width: 801px) and (prefers-reduced-motion: no-preference)");
  if (chapters && "IntersectionObserver" in window) {
    const bgs = $$(".stage__bg img", chapters);
    const words = $$(".stage__title span", chapters);
    const cards = $$("[data-chapter]", chapters);
    let observers = [];
    const setup = () => {
      observers.forEach(o => o.disconnect());
      observers = [];
      if (!cinematic.matches) return;
      let current = -1;
      const set = n => {
        if (n === current) return;
        current = n;
        bgs.forEach((b, k) => b.classList.toggle("is-on", k === n));
        words.forEach((w, k) => w.classList.toggle("is-on", k === n));
        $("[data-stage-count]", chapters).textContent = `${String(n + 1).padStart(2, "0")} / ${String(cards.length).padStart(2, "0")}`;
        $("[data-stage-credit]", chapters).textContent = cards[n].dataset.credit;
      };
      const preload = new IntersectionObserver((entries, observer) => {
        if (entries.some(e => e.isIntersecting)) { bgs.forEach(b => { b.loading = "eager"; }); observer.disconnect(); }
      }, { rootMargin: "600px" });
      preload.observe(chapters);
      const follow = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) set(Number(e.target.dataset.chapter)); });
      }, { rootMargin: "-45% 0px -45% 0px" });
      cards.forEach(c => follow.observe(c));
      observers = [preload, follow];
    };
    setup();
    cinematic.addEventListener("change", setup);
  }

  const header = $(".header");
  if (header) {
    const syncHeader = () => header.classList.toggle("is-stuck", window.scrollY > 8);
    syncHeader();
    addEventListener("scroll", syncHeader, { passive: true });
  }

  /* Native details stay open without JS; compact screens get collapsible groups. */
  const small = window.matchMedia("(max-width: 560px)");
  const syncAcc = () => $$("[data-acc]").forEach(d => { d.open = !small.matches; });
  syncAcc();
  small.addEventListener("change", syncAcc);

  const clock = $("[data-clock]");
  if (clock) {
    const fmt = new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: false });
    const tick = () => {
      const now = new Date();
      clock.textContent = fmt.format(now);
      clock.setAttribute("datetime", now.toISOString());
    };
    tick();
    setInterval(tick, 30000);
  }
})();
