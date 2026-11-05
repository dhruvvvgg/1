/* Page-specific enhancements. All guide and directory content also exists in HTML. */
(() => {
  "use strict";
  document.querySelectorAll('[data-directory]').forEach(directory => {
    const form = directory.querySelector('[data-filter-form]');
    const items = [...directory.querySelectorAll('[data-filter-item]')];
    const count = directory.querySelector('[data-filter-count]');
    const empty = directory.querySelector('[data-filter-empty]');
    const search = form.elements.q;
    const interest = form.elements.interest;
    const params = new URLSearchParams(location.search);
    const normalize = text => text.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
    search.value = params.get('q') || '';
    if (interest && [...interest.options].some(o => o.value === params.get('interest'))) interest.value = params.get('interest');
    const apply = (persist = true) => {
      const query = normalize(search.value);
      let visible = 0;
      items.forEach(item => {
        const matches = normalize(item.dataset.search).includes(query) && (!interest || !interest.value || item.dataset.interest === interest.value);
        item.hidden = !matches;
        if (matches) visible++;
      });
      count.textContent = `${visible} ${visible === 1 ? directory.dataset.singular : directory.dataset.noun} shown`;
      empty.hidden = visible > 0;
      if (persist) {
        const url = new URL(location.href);
        search.value.trim() ? url.searchParams.set('q', search.value.trim()) : url.searchParams.delete('q');
        if (interest) interest.value ? url.searchParams.set('interest', interest.value) : url.searchParams.delete('interest');
        history.replaceState(null, '', url);
      }
    };
    form.hidden = false;
    form.addEventListener('submit', e => { e.preventDefault(); apply(); });
    form.addEventListener('input', () => apply());
    form.addEventListener('change', () => apply());
    form.addEventListener('reset', () => queueMicrotask(() => apply()));
    directory.querySelector('[data-filter-reset]').addEventListener('click', () => { form.reset(); search.focus(); });
    apply(false);
  });

  const route = document.querySelector('[data-route-form]');
  if (route) {
    const result = document.querySelector('[data-route-result]');
    const title = result.querySelector('[data-route-title]');
    const copy = result.querySelector('[data-route-copy]');
    const link = result.querySelector('[data-route-link]');
    const params = new URLSearchParams(location.search);
    ['level', 'area'].forEach(name => {
      const value = params.get(name);
      if ([...route.elements[name].options].some(o => o.value === value)) route.elements[name].value = value;
    });
    const render = () => {
      const level = route.elements.level.value, area = route.elements.area.value;
      link.href = '#application'; link.textContent = 'See application steps';
      if (level === 'doctoral') {
        title.textContent = 'Your route: doctoral research';
        copy.textContent = 'Start with your research interest, academic fit and potential supervision. Discuss current eligibility and selection requirements with admissions and the relevant academic team.';
        link.href = 'research.html#doctoral'; link.textContent = 'Explore doctoral study';
      } else if (level === 'undergraduate' && area === 'engineering') {
        title.textContent = 'Your route: undergraduate engineering';
        copy.textContent = 'SRMJEEE is the entrance route for undergraduate engineering. Confirm the current eligibility, application schedule and selection process for your chosen programme with admissions.';
      } else if (level === 'undergraduate' && area === 'medicine') {
        title.textContent = 'Your route: medicine or dentistry';
        copy.textContent = 'Undergraduate medical and dental admission follows the relevant NEET process. Confirm eligibility, counselling requirements and the current schedule for your chosen qualification.';
      } else {
        title.textContent = `Your route: ${level === 'postgraduate' ? 'postgraduate' : 'undergraduate'} study`;
        copy.textContent = 'Your route is programme-specific. Confirm the required qualification, any entrance or selection process, the current schedule and fees with the admissions team before applying.';
      }
      result.hidden = false;
    };
    route.hidden = false; render();
    route.addEventListener('submit', e => {
      e.preventDefault(); render();
      const url = new URL(location.href);
      url.searchParams.set('level', route.elements.level.value); url.searchParams.set('area', route.elements.area.value);
      history.replaceState(null, '', url);
    });
  }
})();
