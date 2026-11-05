/* SRMIST homepage: progressive enhancement only. Every link and form works without this file. */
(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

  /* ---------- Disclosure menus (mega menus + campus dropdown) ---------- */
  const menus = [];
  function makeMenu(root, panelSel) {
    const btn = $("button[aria-controls]", root);
    const panel = $(panelSel, root);
    if (!btn || !panel) return;
    const m = {
      root, btn, panel,
      open() { menus.forEach(o => o !== m && o.close()); btn.setAttribute("aria-expanded", "true"); panel.classList.add("is-open"); },
      close() { btn.setAttribute("aria-expanded", "false"); panel.classList.remove("is-open"); },
      isOpen() { return btn.getAttribute("aria-expanded") === "true"; }
    };
    btn.addEventListener("click", () => (m.isOpen() ? m.close() : m.open()));
    // Hover intent on mouse devices only, with a short delay so menus don't flash while the pointer passes over.
    let t;
    root.addEventListener("pointerenter", e => { if (e.pointerType !== "mouse" || !finePointer.matches) return; clearTimeout(t); t = setTimeout(m.open, 120); });
    root.addEventListener("pointerleave", e => { if (e.pointerType !== "mouse" || !finePointer.matches) return; clearTimeout(t); t = setTimeout(m.close, 180); });
    root.addEventListener("focusout", e => { if (!root.contains(e.relatedTarget)) m.close(); });
    menus.push(m);
  }
  $$("[data-mega]").forEach(el => makeMenu(el, ".mega__panel"));
  $$("[data-dropdown]").forEach(el => makeMenu(el, ".dropdown__panel"));

  document.addEventListener("keydown", e => {
    if (e.key !== "Escape") return;
    const open = menus.find(m => m.isOpen());
    if (open) { open.close(); open.btn.focus(); }
  });
  document.addEventListener("click", e => { menus.forEach(m => { if (!m.root.contains(e.target)) m.close(); }); });

  /* ---------- Mobile drawer: built from the desktop nav so links never drift apart ---------- */
  const drawer = $("[data-drawer]");
  const drawerBody = $("[data-drawer-body]");
  const toggle = $("[data-nav-toggle]");
  if (drawer && drawerBody && toggle) {
    const frag = document.createDocumentFragment();
    $$(".primary-nav [data-mega]").forEach((item, i) => {
      const label = $(".primary-nav__link", item).textContent.trim();
      const acc = document.createElement("div");
      acc.className = "acc";
      const id = `acc-${i}`;
      acc.innerHTML = `<button type="button" aria-expanded="false" aria-controls="${id}">${label}<svg class="icon chev" aria-hidden="true"><use href="#i-chevron"/></svg></button><div class="acc__panel" id="${id}" hidden></div>`;
      const panel = $(".acc__panel", acc);
      $$(".mega__col", item).forEach(col => {
        const h = document.createElement("h3");
        h.textContent = $(".mega__heading", col).textContent;
        panel.append(h, $("ul", col).cloneNode(true));
      });
      const feature = $(".mega__feature", item);
      if (feature) {
        const ul = document.createElement("ul");
        ul.innerHTML = `<li><a href="${feature.href}">${$(".mega__feature-title", feature).textContent}</a></li>`;
        panel.append(ul);
      }
      const b = $("button", acc);
      b.addEventListener("click", () => {
        const open = b.getAttribute("aria-expanded") === "true";
        b.setAttribute("aria-expanded", String(!open));
        panel.hidden = open;
      });
      frag.append(acc);
    });
    const quick = document.createElement("ul");
    quick.className = "drawer__quick";
    $$(".utility__audiences a, .utility__tools > li > a").forEach(a => {
      const li = document.createElement("li");
      li.append(a.cloneNode(true));
      quick.append(li);
    });
    const cta = document.createElement("a");
    cta.className = "btn btn--gold drawer__cta";
    cta.href = "https://www.srmist.edu.in/admissions/";
    cta.textContent = "Apply for 2027";
    frag.append(quick, cta);
    drawerBody.append(frag);

    let lastFocus;
    const openDrawer = () => {
      lastFocus = document.activeElement;
      drawer.hidden = false;
      toggle.setAttribute("aria-expanded", "true");
      document.documentElement.style.overflow = "hidden";
      $("[data-nav-close]", drawer).focus();
    };
    const closeDrawer = () => {
      drawer.hidden = true;
      toggle.setAttribute("aria-expanded", "false");
      document.documentElement.style.overflow = "";
      (lastFocus || toggle).focus();
    };
    toggle.addEventListener("click", openDrawer);
    $("[data-nav-close]", drawer).addEventListener("click", closeDrawer);
    drawer.addEventListener("keydown", e => {
      if (e.key === "Escape") closeDrawer();
      if (e.key !== "Tab") return;
      const f = $$("a, button", drawer).filter(el => el.offsetParent !== null);
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    window.matchMedia("(min-width: 1181px)").addEventListener("change", e => { if (e.matches && !drawer.hidden) closeDrawer(); });
  }

  /* ---------- Dialogs: search + campus film ---------- */
  const lightDismiss = d => d.addEventListener("click", e => { if (e.target === d) d.close(); });

  const searchDialog = $("[data-search-dialog]");
  if (searchDialog) {
    lightDismiss(searchDialog);
    $("[data-open-search]").addEventListener("click", () => { searchDialog.showModal(); $("input", searchDialog).focus(); });
    $("[data-close-search]").addEventListener("click", () => searchDialog.close());
    document.addEventListener("keydown", e => {
      const typing = /input|textarea|select/i.test(document.activeElement.tagName);
      if (e.key === "/" && !typing && !searchDialog.open) { e.preventDefault(); searchDialog.showModal(); }
    });
  }

  /* Preview build (data-env="preview"): pages there can't submit forms to other sites
     or embed video, so the finder and search hand over a link instead. */
  const isPreview = document.documentElement.dataset.env === "preview";
  const handOff = (form, out, text) => {
    const url = (form.dataset.action || form.action) + "?" + new URLSearchParams(new FormData(form)).toString();
    out.hidden = false;
    out.textContent = "";
    const a = document.createElement("a");
    a.href = url; a.target = "_blank"; a.rel = "noopener"; a.textContent = text;
    out.append(a);
    a.focus();
  };
  const finder = $("[data-finder]");
  if (finder && isPreview) finder.addEventListener("submit", e => {
    e.preventDefault();
    const q = $("#finder-q").value.trim();
    handOff(finder, $("[data-finder-out]"), q ? `See programmes matching “${q}” on srmist.edu.in` : "See all programmes on srmist.edu.in");
  });
  const searchForm = $(".search-dialog__form");
  if (searchForm && isPreview) {
    const out = document.createElement("p");
    out.className = "search-dialog__hint"; out.hidden = true;
    searchForm.append(out);
    searchForm.addEventListener("submit", e => { e.preventDefault(); handOff(searchForm, out, `Search srmist.edu.in for “${$("#search-q").value.trim()}”`); });
  }

  /* ---------- Hero campus film: muted background loop, loaded after the page, with a pause control ---------- */
  const heroVideo = $("[data-hero-video]");
  const filmToggle = $("[data-film-toggle]");
  const filmLink = $(".film-link");
  const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const saveData = navigator.connection && navigator.connection.saveData;
  if (heroVideo && filmToggle && !isPreview && !calm && !saveData && window.innerWidth >= 900) {
    window.addEventListener("load", () => {
      const id = heroVideo.dataset.video;
      const iframe = document.createElement("iframe");
      iframe.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&playsinline=1&rel=0&enablejsapi=1`;
      iframe.title = "SRM campus film (muted background)";
      iframe.tabIndex = -1;
      iframe.allow = "autoplay; encrypted-media";
      iframe.addEventListener("load", () => {
        heroVideo.classList.add("is-playing");
        filmToggle.hidden = false;
        if (filmLink) filmLink.hidden = true;
      });
      heroVideo.append(iframe);
      let paused = false;
      filmToggle.addEventListener("click", () => {
        paused = !paused;
        iframe.contentWindow.postMessage(JSON.stringify({ event: "command", func: paused ? "pauseVideo" : "playVideo", args: [] }), "*");
        filmToggle.setAttribute("aria-pressed", String(paused));
        $("[data-film-label]", filmToggle).textContent = paused ? "Play campus film" : "Pause campus film";
        $("use", filmToggle).setAttribute("href", paused ? "#i-play" : "#i-pause");
      });
    }, { once: true });
  }
  if (filmLink) { filmLink.target = "_blank"; filmLink.rel = "noopener"; }

  /* ---------- College index: hovering or focusing a college swaps the preview photo ---------- */
  const colleges = $("[data-colleges]");
  if (colleges) {
    const img = $("[data-colleges-img]", colleges);
    const links = $$(".colleges__list a", colleges);
    const show = a => {
      links.forEach(l => l.classList.toggle("is-active", l === a));
      const src = a.dataset.img;
      if (!src || img.getAttribute("src") === src) return;
      img.classList.add("is-swapping");
      const next = new Image();
      next.onload = next.onerror = () => { img.src = src; img.classList.remove("is-swapping"); };
      next.src = src;
    };
    links.forEach(a => { a.addEventListener("pointerenter", () => show(a)); a.addEventListener("focus", () => show(a)); });
    if (links[0]) links[0].classList.add("is-active");
  }

  /* ---------- Tabs (WAI-ARIA tabs pattern, automatic activation) ---------- */
  $$("[data-tabs]").forEach(root => {
    const tabs = $$('[role="tab"]', root);
    const select = tab => {
      tabs.forEach(t => {
        const on = t === tab;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
      });
    };
    tabs.forEach((t, i) => {
      t.addEventListener("click", () => select(t));
      t.addEventListener("keydown", e => {
        let n = null;
        if (e.key === "ArrowRight") n = tabs[(i + 1) % tabs.length];
        if (e.key === "ArrowLeft") n = tabs[(i - 1 + tabs.length) % tabs.length];
        if (e.key === "Home") n = tabs[0];
        if (e.key === "End") n = tabs[tabs.length - 1];
        if (n) { e.preventDefault(); select(n); n.focus(); }
      });
    });
    // Deep links such as #international open the matching tab.
    const map = { "#international": "tab-intl", "#medicine": "tab-med", "#phd": "tab-phd" };
    if (map[location.hash]) select(document.getElementById(map[location.hash]));
  });

  /* ---------- Events: drop anything that has already ended ---------- */
  const list = $("[data-events]");
  if (list) {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    $$("[data-end]", list).forEach(li => {
      const end = new Date(li.dataset.end + "T23:59:59");
      if (end < today) li.remove();
    });
    if (!list.children.length) $("[data-events-empty]").hidden = false;
  }

  /* ---------- Alumni rail ---------- */
  $$("[data-rail]").forEach(rail => {
    const track = $(".rail__track", rail);
    const prev = $("[data-rail-prev]", rail);
    const next = $("[data-rail-next]", rail);
    const step = () => track.clientWidth * 0.8;
    const sync = () => {
      prev.disabled = track.scrollLeft < 4;
      next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
    };
    prev.addEventListener("click", () => track.scrollBy({ left: -step(), behavior: "smooth" }));
    next.addEventListener("click", () => track.scrollBy({ left: step(), behavior: "smooth" }));
    track.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    sync();
  });

  /* ---------- Image fallback: keep the brand-tinted frame instead of a broken icon ---------- */
  $$("[data-logo]").forEach(img => {
    const fail = () => img.closest(".brand").classList.add("logo-missing");
    if (img.complete && img.naturalWidth === 0) fail(); else img.addEventListener("error", fail, { once: true });
  });
  $$("img:not([data-logo])").forEach(img => {
    const fail = () => img.classList.add("img-missing");
    if (img.complete && img.naturalWidth === 0 && img.getAttribute("src")) fail();
    else img.addEventListener("error", fail, { once: true });
  });
})();
