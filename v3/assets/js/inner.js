/* Inner pages: Program Finder, course quiz, compare, international checklist, scholarship campus filter. */
(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const inr = n => "₹" + Number(n).toLocaleString("en-IN");
  const EXT = '<span class="sr-only"> (opens the original SRMIST site)</span>';
  const progLink = (p, cls = "") => p.href.startsWith("/")
    ? `<a${cls ? ` class="${cls}"` : ""} href="${p.href}">${esc(p.name)}</a>`
    : `<a${cls ? ` class="${cls}"` : ""} href="${esc(p.href)}" target="_blank" rel="noopener noreferrer" data-ext>${esc(p.name)}${EXT}</a>`;

  const dataEl = $("#programs-data");
  const DATA = dataEl ? JSON.parse(dataEl.textContent) : null;

  /* ---------- Program Finder ---------- */
  const form = $("[data-finder]");
  if (form && DATA) {
    const cards = $$("[data-prog]");
    const count = $("[data-count]"), empty = $("[data-empty]"), list = $("[data-proglist]");
    const params = new URLSearchParams(location.search);
    if (params.get("college") && form.college) form.college.value = params.get("college");
    if (params.get("q") && form.q) form.q.value = params.get("q");
    const apply = () => {
      const q = form.q.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
      const lv = form.level.value, col = form.college.value, cam = form.campus.value, dur = form.duration.value, fee = form.fee.value;
      const [lo, hi] = fee ? fee.split("-").map(Number) : [null, null];
      let n = 0;
      cards.forEach(c => {
        const d = c.dataset;
        const ok = (!lv || d.level === lv) && (!col || d.college === col) && (!cam || d.campus === cam) &&
          (!dur || d.duration === dur) && (!fee || (d.fee && +d.fee >= lo && +d.fee <= hi)) &&
          q.every(w => d.text.includes(w));
        c.hidden = !ok; if (ok) n++;
      });
      count.textContent = n === 1 ? "1 programme" : `${n} programmes`;
      empty.hidden = n > 0; list.hidden = n === 0;
    };
    form.addEventListener("input", apply); form.addEventListener("change", apply);
    $$("[data-clear]").forEach(b => b.addEventListener("click", () => { form.reset(); apply(); form.q.focus(); }));
    apply();

    /* ---------- Compare ---------- */
    const panel = $("[data-compare-panel]"), table = $("[data-cmp-table]"), hint = $("[data-cmp-hint]"), clearBtn = $("[data-cmp-clear]");
    const bySlug = Object.fromEntries(DATA.rows.map(r => [r.slug, r]));
    const boxes = $$("[data-compare]");
    const drawCompare = () => {
      const picked = boxes.filter(b => b.checked).map(b => bySlug[b.value]);
      boxes.forEach(b => { b.disabled = !b.checked && picked.length >= 3; });
      if (picked.length < 2) {
        table.hidden = true; clearBtn.hidden = picked.length === 0;
        hint.textContent = picked.length === 1 ? "Pick one or two more programmes to compare." : "Tick “Compare” on two or three programmes in the finder above.";
        return;
      }
      hint.textContent = `Comparing ${picked.length} programmes.`;
      const row = (label, f) => `<tr><th scope="row">${label}</th>${picked.map(p => `<td>${f(p)}</td>`).join("")}</tr>`;
      table.innerHTML = `<table class="dtable"><caption class="sr-only">Programme comparison</caption><thead><tr><th scope="col"><span class="sr-only">Field</span></th>${picked.map(p => `<th scope="col">${progLink(p)}</th>`).join("")}</tr></thead><tbody>
        ${row("Level", p => esc(DATA.levels[p.level]))}
        ${row("College", p => esc(DATA.colleges[p.college_idx]))}
        ${row("Department", p => esc(p.department))}
        ${row("Campus", p => esc(DATA.campuses[p.campus]))}
        ${row("Duration", p => (p.duration ? p.duration + " years" : "Not listed"))}
        ${row("Annual fee", p => (p.fee ? inr(p.fee) : "Not listed"))}
        ${row("Intake", p => (p.intake ? p.intake : "Not listed"))}
      </tbody></table>`;
      table.hidden = false; clearBtn.hidden = false;
    };
    boxes.forEach(b => b.addEventListener("change", drawCompare));
    clearBtn.addEventListener("click", () => { boxes.forEach(b => (b.checked = false)); drawCompare(); });
    drawCompare();
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

  /* ---------- International admission checklist ---------- */
  const cl = $("[data-checklist]");
  if (cl) {
    const KEY = "srm-checklist-" + cl.dataset.checklist;
    const checks = $$("[data-cl-check]", cl), countEl = $("[data-cl-count]", cl), bar = $("[data-cl-bar]", cl);
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) { saved = {}; }
    const sync = () => {
      const done = checks.filter(c => c.checked).length;
      countEl.textContent = `${done} of ${checks.length} steps done`;
      bar.style.width = (done / checks.length) * 100 + "%";
      checks.forEach(c => c.closest("[data-cl-step]").classList.toggle("is-done", c.checked));
      try { localStorage.setItem(KEY, JSON.stringify(Object.fromEntries(checks.map(c => [c.dataset.clCheck, c.checked])))); } catch (e) {}
    };
    checks.forEach(c => { c.checked = !!saved[c.dataset.clCheck]; c.addEventListener("change", sync); });
    $("[data-cl-reset]", cl).addEventListener("click", () => { checks.forEach(c => (c.checked = false)); sync(); });
    sync();
  }

  /* ---------- Scholarship table: one campus at a time ---------- */
  const sel = $("[data-campus-select]");
  if (sel) {
    const rows = $$("tr[data-campus]");
    const show = () => rows.forEach(r => (r.hidden = r.dataset.campus !== sel.value));
    sel.addEventListener("change", show); show();
  }

  /* ---------- Simple list filter (departments) ---------- */
  $$("[data-filter]").forEach(input => {
    if (input.closest("[data-finder]")) return;
    const items = $$(input.dataset.filter), empty = document.getElementById(input.dataset.filterEmpty);
    input.addEventListener("input", () => {
      const q = input.value.trim().toLowerCase(); let n = 0;
      items.forEach(i => { const ok = i.textContent.toLowerCase().includes(q); i.hidden = !ok; if (ok) n++; });
      if (empty) empty.hidden = n > 0;
    });
  });
})();
