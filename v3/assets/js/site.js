/* SRM concept v3. Navigation and content remain usable without JavaScript. */
(() => {
  "use strict";
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));
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
