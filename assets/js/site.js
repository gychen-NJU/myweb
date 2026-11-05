// tiny, dependency-free interactions
const root = document.documentElement;
root.classList.add('js');

/* reveal on scroll ------------------------------------------------------- */
const revealTargets = document.querySelectorAll('.fade-up, .profile-rule');
if ('IntersectionObserver' in window && revealTargets.length) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      }
    },
    { rootMargin: '0px 0px -6% 0px', threshold: 0.01 }
  );
  revealTargets.forEach((el) => io.observe(el));
} else {
  revealTargets.forEach((el) => el.classList.add('is-in'));
}

/* masthead --------------------------------------------------------------- */
const header = document.querySelector('[data-header]');
if (header) {
  const onScroll = () => header.classList.toggle('is-stuck', window.scrollY > 4);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* copy BibTeX ------------------------------------------------------------ */
document.addEventListener('click', async (event) => {
  const button = event.target.closest('[data-copy]');
  if (!button) return;
  const source = document.getElementById(button.dataset.copy);
  if (!source) return;
  const text = source.textContent.trim();
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const field = document.createElement('textarea');
    field.value = text;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.opacity = '0';
    document.body.append(field);
    field.select();
    document.execCommand('copy');
    field.remove();
  }
  const label = button.textContent;
  button.textContent = button.dataset.done || 'Copied';
  button.classList.add('is-done');
  window.setTimeout(() => {
    button.textContent = label;
    button.classList.remove('is-done');
  }, 1600);
});

/* filter disclosure: closed on narrow screens, where the chips would
   otherwise push the first paper below the fold ---------------------------- */
const filtersBlock = document.querySelector('[data-filters-block]');
if (filtersBlock) {
  const narrow = window.matchMedia('(max-width: 720px)');
  const sync = () => {
    if (narrow.matches) filtersBlock.removeAttribute('open');
    else filtersBlock.setAttribute('open', '');
  };
  sync();
  if (narrow.addEventListener) narrow.addEventListener('change', sync);
}

/* publication filters ---------------------------------------------------- */
const filterRoot = document.querySelector('[data-filters]');
if (filterRoot) {
  const entries = [...document.querySelectorAll('[data-pub]')];
  const years = document.querySelector('[data-filter="year"]');
  const tags = document.querySelector('[data-filter="tag"]');
  const search = document.querySelector('[data-search]');
  const count = document.querySelector('[data-count]');
  const empty = document.querySelector('[data-empty]');
  const yearBlocks = [...document.querySelectorAll('[data-year-block]')];
  const preprints = document.querySelector('[data-preprints]');
  const state = { year: 'all', tag: 'all', query: '' };

  const apply = () => {
    let shown = 0;
    for (const entry of entries) {
      const okYear = state.year === 'all' || entry.dataset.year === state.year;
      const entryTags = (entry.dataset.tags || '').split(' ');
      const okTag = state.tag === 'all' || entryTags.includes(state.tag);
      const haystack = (entry.dataset.text || '').toLowerCase();
      const okQuery = state.query === '' || haystack.includes(state.query);
      const visible = okYear && okTag && okQuery;
      entry.hidden = !visible;
      if (visible) shown += 1;
    }
    for (const block of yearBlocks) {
      const anyVisible = [...block.querySelectorAll('[data-pub]')].some((el) => !el.hidden);
      block.hidden = !anyVisible;
    }
    if (count) {
      const template = count.dataset.format || '{shown} of {total}';
      count.textContent = template
        .replace('{shown}', String(shown))
        .replace('{total}', String(entries.length));
    }
    if (empty) empty.hidden = shown !== 0;
    if (preprints) {
      preprints.hidden = !(state.year === 'all' && state.tag === 'all' && state.query === '');
    }
  };

  const group = (container, key) => {
    if (!container) return;
    container.addEventListener('click', (event) => {
      const chip = event.target.closest('[data-value]');
      if (!chip) return;
      container.querySelectorAll('[data-value]').forEach((c) => c.setAttribute('aria-pressed', 'false'));
      chip.setAttribute('aria-pressed', 'true');
      state[key] = chip.dataset.value;
      apply();
    });
  };

  group(years, 'year');
  group(tags, 'tag');

  if (search) {
    let timer;
    search.addEventListener('input', () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        state.query = search.value.trim().toLowerCase();
        apply();
      }, 90);
    });
  }

  apply();
}
