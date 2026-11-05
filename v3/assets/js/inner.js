/* Inner pages: Program Finder (URL sync, compare tray, saved drawer), course quiz, checklists,
   admissions route selector, cost estimator, department explorer, campus compare, office picker. */
(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const inr = n => "₹" + Number(n).toLocaleString("en-IN");
  const EXT = '<span class="sr-only"> (opens the original SRMIST site)</span>';
  const extA = (href, text, cls = "") => `<a${cls ? ` class="${cls}"` : ""} href="${esc(href)}" target="_blank" rel="noopener noreferrer" data-ext>${esc(text)}${EXT}</a>`;
  const progLink = (p, cls = "") => !/^https?:/.test(p.href)
    ? `<a${cls ? ` class="${cls}"` : ""} href="${p.href}">${esc(p.name)}</a>`
    : `<a${cls ? ` class="${cls}"` : ""} href="${esc(p.href)}" target="_blank" rel="noopener noreferrer" data-ext>${esc(p.name)}${EXT}</a>`;
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  const json = id => { const n = document.getElementById(id); return n ? JSON.parse(n.textContent) : null; };

  const DATA = json("programs-data");

  /* ---------- Program Finder ---------- */
  const form = $("[data-finder]");
  if (form && DATA) {
    const cards = $$("[data-prog]");
    const count = $("[data-count]"), empty = $("[data-empty]"), list = $("[data-proglist]");
    const KEYS = ["q", "level", "college", "campus", "duration", "maxfee"];
    const params = new URLSearchParams(location.search);
    KEYS.forEach(k => { const v = params.get(k); const f = form.elements[k]; if (v != null && f) { f.value = v; if (f.tagName === "SELECT" && f.value !== v) f.value = ""; } });
    const apply = () => {
      const f = Object.fromEntries(KEYS.map(k => [k, form.elements[k] ? form.elements[k].value.trim() : ""]));
      const words = f.q.toLowerCase().split(/\s+/).filter(Boolean);
      let n = 0;
      cards.forEach(c => {
        const d = c.dataset;
        const ok = (!f.level || d.level === f.level) && (!f.college || d.college === f.college) && (!f.campus || d.campus === f.campus) &&
          (!f.duration || d.duration === f.duration) && (!f.maxfee || (d.fee && +d.fee <= +f.maxfee)) && words.every(w => d.text.includes(w));
        c.hidden = !ok; if (ok) n++;
      });
      count.textContent = `${n} ${n === 1 ? "programme" : "programmes"} in this Program Finder`;
      empty.hidden = n > 0; list.hidden = n === 0;
      const u = new URLSearchParams(); KEYS.forEach(k => { if (f[k]) u.set(k, f[k]); });
      try { history.replaceState(null, "", location.pathname + (u.toString() ? "?" + u : "") + location.hash); } catch (e) {}
    };
    form.addEventListener("input", apply); form.addEventListener("change", apply);
    $$("[data-clear]").forEach(b => b.addEventListener("click", () => { form.reset(); apply(); form.elements.q.focus(); }));
    apply();

    /* ---------- Compare: toggle buttons, tray, table ---------- */
    const bySlug = Object.fromEntries(DATA.rows.map(r => [r.slug, r]));
    const btns = $$("[data-compare]");
    const tray = $("[data-ctray]"), trayN = $("[data-ctray-n]"), trayTxt = $("[data-ctray-txt]");
    const table = $("[data-cmp-table]"), hint = $("[data-cmp-hint]");
    let picked = [];
    const draw = () => {
      btns.forEach(b => {
        const on = picked.includes(b.dataset.compare);
        b.setAttribute("aria-pressed", String(on));
        b.disabled = !on && picked.length >= 3;
      });
      tray.hidden = picked.length === 0; trayN.textContent = picked.length;
      trayTxt.textContent = picked.length >= 3 ? "Three picked. That is the most you can compare." : picked.length === 1 ? "Pick one or two more." : `${picked.length} picked.`;
      document.documentElement.classList.toggle("has-tray", picked.length > 0);
      const rows = picked.map(s => bySlug[s]);
      if (rows.length < 2) { table.hidden = true; hint.textContent = rows.length === 1 ? "Pick one or two more programmes to compare." : "Press “Compare” on two or three programmes in the finder above."; return; }
      hint.textContent = `Comparing ${rows.length} programmes.`;
      const row = (label, f) => `<tr><th scope="row">${label}</th>${rows.map(p => `<td>${f(p)}</td>`).join("")}</tr>`;
      table.innerHTML = `<table class="dtable"><caption class="sr-only">Programme comparison</caption><thead><tr><th scope="col"><span class="sr-only">Field</span></th>${rows.map(p => `<th scope="col">${progLink(p)}</th>`).join("")}</tr></thead><tbody>
        ${row("Level", p => esc(DATA.levels[p.level]))}
        ${row("College", p => esc(DATA.colleges[p.college_idx]))}
        ${row("Department", p => esc(p.department))}
        ${row("Campus", p => esc(DATA.campuses[p.campus]))}
        ${row("Duration", p => (p.duration ? p.duration + " years" : "Not listed"))}
        ${row("Annual fee", p => (p.fee ? inr(p.fee) : "Not listed"))}
        ${row("Intake", p => (p.intake ? p.intake : "Not listed"))}
      </tbody></table>`;
      table.hidden = false;
    };
    const setPicked = arr => { picked = arr.filter(s => bySlug[s]).slice(0, 3); draw(); };
    btns.forEach(b => b.addEventListener("click", () => {
      const s = b.dataset.compare;
      setPicked(picked.includes(s) ? picked.filter(x => x !== s) : [...picked, s]);
    }));
    $$("[data-cmp-clear]").forEach(b => b.addEventListener("click", () => setPicked([])));
    draw();

    /* ---------- Saved programmes (localStorage when available) ---------- */
    const hearts = $$("[data-save]");
    const drawer = $("[data-saved]"), dList = $("[data-saved-list]"), dEmpty = $("[data-saved-empty]"), countEl = $("[data-saved-count]");
    const openBtn = $("[data-saved-open]");
    let saved = store.get("srm-saved", []).filter(s => bySlug[s]);
    const drawSaved = () => {
      hearts.forEach(h => h.setAttribute("aria-pressed", String(saved.includes(h.dataset.save))));
      countEl.textContent = saved.length;
      dEmpty.hidden = saved.length > 0;
      dList.innerHTML = saved.map(s => { const p = bySlug[s]; return `<li class="saved__item"><div>${progLink(p)}<p class="saved__meta">${esc([DATA.levels[p.level], DATA.campuses[p.campus], p.duration ? p.duration + " years" : "", p.fee ? "Annual fee " + inr(p.fee) : ""].filter(Boolean).join(" · "))}</p></div><button class="pill" type="button" data-unsave="${esc(s)}">Remove<span class="sr-only"> ${esc(p.name)}</span></button></li>`; }).join("");
      $("[data-saved-compare]").disabled = saved.length < 2;
    };
    const setSaved = arr => { saved = arr; store.set("srm-saved", saved); drawSaved(); };
    hearts.forEach(h => h.addEventListener("click", () => { const s = h.dataset.save; setSaved(saved.includes(s) ? saved.filter(x => x !== s) : [...saved, s]); }));
    dList.addEventListener("click", e => { const b = e.target.closest("[data-unsave]"); if (b) { setSaved(saved.filter(x => x !== b.dataset.unsave)); (dList.querySelector("button") || $("[data-saved-close]")).focus(); } });
    const openD = () => { drawer.hidden = false; document.documentElement.classList.add("has-overlay"); $("[data-saved-close]").focus(); };
    const closeD = () => { drawer.hidden = true; document.documentElement.classList.remove("has-overlay"); openBtn.focus(); };
    openBtn.addEventListener("click", openD);
    $("[data-saved-close]").addEventListener("click", closeD);
    drawer.addEventListener("click", e => { if (e.target === drawer) closeD(); });
    drawer.addEventListener("keydown", e => {
      if (e.key === "Escape") { e.preventDefault(); closeD(); }
      if (e.key === "Tab") { const f = $$("a, button:not([disabled])", drawer); const a = f[0], z = f[f.length - 1]; if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); } }
    });
    $("[data-saved-compare]").addEventListener("click", () => { setPicked(saved.slice(0, 3)); closeD(); document.getElementById("compare").scrollIntoView(); $("[data-cmp-hint]").focus && hint.setAttribute("tabindex", "-1"); hint.focus(); });
    $("[data-saved-print]").addEventListener("click", () => { document.documentElement.classList.add("print-saved"); window.print(); setTimeout(() => document.documentElement.classList.remove("print-saved"), 500); });
    drawSaved();
  }

  /* ---------- Which course fits me ---------- */
  const quiz = $("[data-quiz]");
  if (quiz && DATA) {
    const out = $("[data-quiz-out]");
    const INTEREST = {
      computing: { words: ["computer", "data", "software", "ai", "artificial", "cyber", "computing", "information", "cloud", "blockchain", "devsecops", "networking"], why: "it is a computing programme" },
      engineering: { words: ["mechanical", "electrical", "electronics", "civil", "aerospace", "automobile", "mechatronics", "robotics", "instrumentation", "chemical", "engineering", "nanotechnology"], why: "it is an engineering programme" },
      health: { words: ["medic", "health", "nursing", "pharm", "physio", "clinical", "dental", "biomedical", "occupational", "optometry", "radiology"], why: "it is in health sciences" },
      business: { words: ["business", "management", "commerce", "bba", "mba", "finance", "accounting", "economics", "b.com"], why: "it is a business or commerce programme" },
      law: { words: ["law", "legal", "criminology", "policy", "llb"], why: "it is a law or policy programme" },
      arts: { words: ["english", "journalism", "media", "design", "architecture", "visual", "communication", "fashion", "psychology"], why: "it is in the arts, media or design" },
      life: { words: ["agricult", "biotech", "bio", "horticulture", "environment", "food", "genetic"], why: "it is in the life or agricultural sciences" }
    };
    const STRENGTH = {
      maths: { words: ["computer", "data", "engineering", "physics", "mathematics", "commerce", "economics", "statistics"], why: "it suits a strength in mathematics" },
      biology: { words: ["bio", "medic", "health", "pharm", "nursing", "agricult", "physio", "genetic"], why: "it suits a strength in biology" },
      language: { words: ["english", "journalism", "law", "media", "communication", "psychology"], why: "it suits a strength in languages and writing" },
      people: { words: ["management", "business", "law", "nursing", "psychology", "hotel", "physio", "bba"], why: "it suits working with people" }
    };
    quiz.addEventListener("submit", e => {
      e.preventDefault();
      const f = new FormData(quiz);
      const interest = INTEREST[f.get("interest")], strength = STRENGTH[f.get("strength")];
      const level = f.get("level"), budget = Number(f.get("budget")) || 0, campus = f.get("campus");
      const scored = DATA.rows.map(p => {
        const text = (p.name + " " + p.department + " " + DATA.colleges[p.college_idx]).toLowerCase();
        let score = 0; const why = [];
        if (interest && interest.words.some(w => text.includes(w))) { score += 5; why.push(interest.why); }
        if (strength && strength.words.some(w => text.includes(w))) { score += 2; why.push(strength.why); }
        if (level) { if (p.level === level) { score += 3; why.push(`it is ${DATA.levels[p.level]}`); } else score -= 4; }
        if (budget) { if (p.fee && p.fee <= budget) { score += 2; why.push(`its annual fee is ${inr(p.fee)}, inside your band`); } else if (p.fee) score -= 3; }
        if (campus) { if (p.campus === campus) { score += 1; why.push(`it is taught at ${DATA.campuses[p.campus]}`); } else score -= 2; }
        return { p, score, why };
      }).filter(x => x.score > 0).sort((a, b) => b.score - a.score || a.p.name.localeCompare(b.p.name)).slice(0, 3);
      if (!scored.length) {
        out.innerHTML = `<p>No programme in this list matches all of your answers. Try a wider fee band or level, or use the Program Finder above.</p>`;
      } else {
        out.innerHTML = `<h3 class="sub">Your top ${scored.length}</h3><ol class="quiz__results">${scored.map(x => `<li><p class="quiz__name">${progLink(x.p)}</p><p>Matched because ${esc(x.why.join("; "))}.</p></li>`).join("")}</ol>`;
      }
      out.focus && out.setAttribute("tabindex", "-1"); out.focus();
    });
  }

  /* ---------- Checklists (international, India tracker): progress saved when storage allows ---------- */
  $$("[data-checklist]").forEach(cl => {
    const KEY = "srm-checklist-" + cl.dataset.checklist;
    const checks = $$("[data-cl-check]", cl), countEl = $("[data-cl-count]", cl), bar = $("[data-cl-bar]", cl);
    const saved = store.get(KEY, {}) || {};
    const sync = () => {
      const done = checks.filter(c => c.checked).length;
      countEl.textContent = `${done} of ${checks.length} steps done`;
      bar.style.width = (done / checks.length) * 100 + "%";
      checks.forEach(c => c.closest("[data-cl-step]").classList.toggle("is-done", c.checked));
      store.set(KEY, Object.fromEntries(checks.map(c => [c.dataset.clCheck, c.checked])));
    };
    checks.forEach(c => { c.checked = !!saved[c.dataset.clCheck]; c.addEventListener("change", sync); });
    const reset = $("[data-cl-reset]", cl), confirm = $("[data-cl-confirm]", cl);
    if (confirm) {
      reset.addEventListener("click", () => { confirm.hidden = false; reset.hidden = true; $("[data-cl-no]", cl).focus(); });
      $("[data-cl-yes]", cl).addEventListener("click", () => { checks.forEach(c => (c.checked = false)); sync(); confirm.hidden = true; reset.hidden = false; reset.focus(); });
      $("[data-cl-no]", cl).addEventListener("click", () => { confirm.hidden = true; reset.hidden = false; reset.focus(); });
    } else reset.addEventListener("click", () => { checks.forEach(c => (c.checked = false)); sync(); });
    sync();
  });

  /* ---------- Scholarship table: one campus at a time ---------- */
  const sel = $("[data-campus-select]");
  if (sel) {
    const rows = $$("tr[data-campus]");
    const show = () => rows.forEach(r => (r.hidden = r.dataset.campus !== sel.value));
    sel.addEventListener("change", show); show();
  }

  /* ---------- Admissions route selector (only what admissions-*.json holds) ---------- */
  const route = $("[data-route]"), RD = json("route-data");
  if (route && RD) {
    $("[data-route-plain]").hidden = true; route.hidden = false;
    const steps = $$("[data-route-step]", route), out = $("[data-route-out]", route);
    const back = $("[data-route-back]", route), restart = $("[data-route-restart]", route);
    let at = 1;
    const val = n => { const r = $(`input[name="${n}"]:checked`, route); return r ? r.value : ""; };
    const LEVEL_RE = { UG: /\bB\.|\bBBA\b|\bBA\b|\bUG\b|Under ?Graduate|LLB|Integrated/i, PG: /\bM\.|\bMBA\b|\bPG\b|Post ?Graduate|LLM|\bMD\b|\bMS\b/i, PhD: /Ph\.?\s?D/i, Diploma: /Diploma/i };
    const show = n => {
      at = n;
      steps.forEach(s => (s.hidden = Number(s.dataset.routeStep) !== n));
      back.hidden = n === 1; restart.hidden = n === 1;
      if (n <= 3) { out.innerHTML = ""; const f = $(`[data-route-step="${n}"] input`, route); if (f) f.focus(); }
    };
    const contactHtml = (where, d) => {
      const rows = [];
      const c = where === "india" ? RD.contacts.india : RD.contacts.intl;
      if (c) rows.push(`<li class="crow"><span class="crow__label">${esc(c.label)}</span><a class="crow__val" href="mailto:${esc(c.value)}">${esc(c.value)}</a></li>`);
      if (where === "india" && RD.contacts.phones[d.phone]) { const ph = RD.contacts.phones[d.phone]; rows.push(`<li class="crow"><span class="crow__label">${esc(ph.programs)}</span><a class="crow__val" href="tel:${esc(ph.phone.replace(/[^+\d]/g, ""))}">${esc(ph.phone)}</a></li>`); }
      return `<h4 class="sub">Who to contact</h4><ul class="crows">${rows.join("")}</ul>`;
    };
    const result = () => {
      const where = val("r-where"), level = val("r-level"), d = RD.disciplines.find(x => x.id === val("r-disc"));
      steps.forEach(s => (s.hidden = true)); back.hidden = false; restart.hidden = false; at = 4;
      let html = "";
      if (where === "india") {
        const col = RD.india.find(c => c.name === d.india);
        let apply = (col && col.apply) || [];
        if (d.only) apply = apply.filter(a => new RegExp(d.only, "i").test(a.text));
        const forLevel = apply.filter(a => LEVEL_RE[level].test(a.text));
        const phd = level === "PhD" ? RD.india.find(c => /Ph\.D/.test(c.name)) : null;
        const use = phd ? phd.apply : forLevel;
        html += `<h3 class="sub">${esc(d.label)}, ${esc(level)}, India</h3>`;
        if (use && use.length) html += `<p>Apply online:</p><ul class="linklist">${use.map(a => `<li>${extA(a.href, a.text)}</li>`).join("")}</ul>`;
        else html += `<p>This site has no separate application link for this level. See the general admissions page for this college.</p>`;
        if (col && col.also && col.also.length && !phd) html += `<p>Also offered:</p><ul class="bullets">${col.also.map(x => `<li>${esc(x)}</li>`).join("")}</ul>`;
        if (col && col.downloads && col.downloads.length && !phd) html += `<p>Requirements and dates:</p><ul class="linklist">${col.downloads.map(a => `<li>${extA(a.href, a.text)}</li>`).join("")}</ul>`;
        if (col && col.details) html += `<p>${extA(/^https?:/.test(col.details) ? col.details : "https://www.srmist.edu.in" + col.details, "Program | Fees | Eligibility | Criteria", "more")}</p>`;
      } else {
        const col = RD.intl.find(c => c.college === d.intl);
        const progs = col && col.programs ? (d.only ? col.programs.filter(p => new RegExp(d.only, "i").test(p)) : col.programs) : [];
        html += `<h3 class="sub">${esc(d.label)}, ${esc(level)}, International</h3>`;
        if (progs.length) html += `<p>Programmes open to international students:</p><ul class="bullets">${progs.map(p => `<li>${esc(p)}</li>`).join("")}</ul>`;
        html += `<p>Fee waivers:</p><ul class="bullets">${RD.waivers.map(w => `<li><strong>${esc(w.group)}:</strong> ${esc(w.text)}</li>`).join("")}</ul>`;
        html += `<p>${extA(RD.intlPortal, "International application form 2027", "pill pill--blue")}</p>`;
        if (col && col.prospectus) html += `<p>${extA(col.prospectus, "Prospectus (PDF)", "more")}</p>`;
      }
      html += `<p><a class="more" href="/admissions/">Admissions overview</a></p>` + contactHtml(where, d);
      out.innerHTML = `<div class="route__res">${html}</div>`;
    };
    route.addEventListener("change", e => {
      if (e.target.name === "r-where") show(2);
      else if (e.target.name === "r-level") show(3);
      else if (e.target.name === "r-disc") result();
    });
    back.addEventListener("click", () => show(Math.max(1, (at > 3 ? 3 : at - 1))));
    restart.addEventListener("click", () => { route.reset(); show(1); });
  }

  /* ---------- Cost and scholarship estimator ---------- */
  const est = $("[data-est]"), ED = json("est-data");
  if (est && ED) {
    const find = $("[data-est-find]", est), sel = $("[data-est-prog]", est), rank = $("[data-est-rank]", est), camp = $("[data-est-campus]", est), out = $("[data-est-out]", est);
    const opts = $$("option", sel).slice(1);
    find.addEventListener("input", () => {
      const q = find.value.trim().toLowerCase();
      opts.forEach(o => (o.hidden = q && !o.textContent.toLowerCase().includes(q)));
      const first = opts.find(o => !o.hidden); if (q && first && sel.selectedOptions[0] && sel.selectedOptions[0].hidden) sel.value = first.value;
    });
    const range = s => { const m = String(s).match(/(\d+)\s*-\s*(\d+)/); return m ? [Number(m[1]), Number(m[2])] : null; };
    const calc = () => {
      const p = ED.rows.find(r => r.slug === sel.value);
      if (!p) { out.innerHTML = "<p>Choose a programme to see its fee.</p>"; return; }
      let html = `<h3 class="sub">${esc(p.name)}</h3><dl class="factgrid">`;
      if (!p.fee) { out.innerHTML = html + `</dl><p>Fee not listed. Ask Admissions.</p>`; return; }
      html += `<div><dt>Annual fee</dt><dd>${inr(p.fee)}</dd></div>`;
      if (p.duration) html += `<div><dt>Course length</dt><dd>${p.duration} years</dd></div><div><dt>Total over ${p.duration} years</dt><dd>${inr(p.fee * p.duration)}</dd></div>`;
      html += `</dl>`;
      const r = Number(rank.value);
      if (rank.value) {
        if (p.cidx !== 0) html += `<p>The rank table on this page covers ${esc(ED.heading)} (Engineering and Technology) only, so no scholarship tier is shown for this programme.</p>`;
        else {
          const tier = ED.table.find(row => row[0] === camp.value && (rg => rg && r >= rg[0] && r <= rg[1])(range(row[4])));
          if (!tier) html += `<p>Rank ${r} matches no tier in the table for ${esc(camp.value)}.</p>`;
          else {
            const pct = (tier[2].match(/(\d+)\s*%/) || [])[1];
            html += `<p>Matching tier: <strong>${esc(tier[1])}</strong>, ${esc(tier[2])} (${esc(ED.columns[4])} ${esc(tier[4])}, ${esc(tier[3])}).</p>`;
            if (pct) html += `<p>Net first year: <strong>${inr(Math.round(p.fee * (1 - pct / 100)))}</strong> (${inr(p.fee)} less ${pct}%).</p>`;
          }
        }
      }
      out.innerHTML = html;
    };
    [sel, rank, camp].forEach(x => { x.addEventListener("input", calc); x.addEventListener("change", calc); });
  }

  /* ---------- Departments and research centres ---------- */
  const dx = $("[data-dx]");
  if (dx) {
    const q = $("[data-dx-q]", dx), tabs = $$("[data-dx-tab]", dx), countEl = $("[data-dx-count]", dx), empty = $("[data-dx-empty]", dx);
    let tab = "dept";
    const NAME = { dept: ["department", "departments"], centre: ["research centre", "research centres"] };
    const run = () => {
      const w = q.value.trim().toLowerCase(); let n = 0;
      $$(`[data-dx-panel="${tab}"] [data-dx-item]`, dx).forEach(li => { const ok = !w || li.textContent.toLowerCase().includes(w); li.hidden = !ok; if (ok) n++; });
      countEl.textContent = `${n} ${NAME[tab][n === 1 ? 0 : 1]}`; empty.hidden = n > 0;
    };
    const pick = (t, focus) => {
      tab = t.dataset.dxTab;
      tabs.forEach(x => { const on = x === t; x.setAttribute("aria-selected", String(on)); x.tabIndex = on ? 0 : -1; });
      $$("[data-dx-panel]", dx).forEach(p => (p.hidden = p.dataset.dxPanel !== tab));
      if (focus) t.focus(); run();
    };
    tabs.forEach((t, i) => {
      t.addEventListener("click", () => pick(t));
      t.addEventListener("keydown", e => { if (e.key === "ArrowRight" || e.key === "ArrowLeft") { e.preventDefault(); pick(tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length], true); } });
    });
    q.addEventListener("input", run); run();
  }

  /* ---------- Campus compare ---------- */
  const cc = $("[data-cc]"), CC = json("cc-data");
  if (cc && CC) {
    const sels = $$("[data-cc-sel]", cc), outEl = $("[data-cc-out]", cc);
    const draw = () => {
      const pair = sels.map(s => CC[Number(s.value)]);
      const levels = [...new Set(pair.flatMap(c => c.mix.map(m => m[0])))];
      const row = (label, f) => `<tr><th scope="row">${esc(label)}</th>${pair.map(c => `<td>${f(c)}</td>`).join("")}</tr>`;
      outEl.innerHTML = `<table class="dtable"><caption class="sr-only">Campus comparison</caption><thead><tr><th scope="col"><span class="sr-only">Field</span></th>${pair.map(c => `<th scope="col">${esc(c.name)}</th>`).join("")}</tr></thead><tbody>
        ${row("Programmes in this Program Finder", c => c.n)}
        ${levels.map(l => row(l, c => (c.mix.find(m => m[0] === l) || [, 0])[1])).join("")}
        ${row("Colleges", c => esc(c.colleges.join(", ")))}
      </tbody></table>`;
    };
    sels.forEach(s => s.addEventListener("change", draw)); draw();
  }

  /* ---------- Contact the right office ---------- */
  const office = $("[data-office]");
  if (office) {
    const cardsO = $$("[data-office-card]", office);
    cardsO.forEach(c => { if (c.hasAttribute("data-office-rest")) c.hidden = true; });
    office.addEventListener("change", e => { if (e.target.name === "office") cardsO.forEach(c => (c.hidden = c.dataset.officeCard !== e.target.value)); });
  }

  /* ---------- One reveal per section; the class is added here so content shows without JS ---------- */
  if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const io = new IntersectionObserver((es, o) => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("is-in"); o.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" });
    $$("main > .sec").forEach(sec => {
      if (sec.getBoundingClientRect().top < innerHeight) return; // already on screen at load: leave it alone
      sec.classList.add("reveal"); io.observe(sec);
    });
  }
})();
