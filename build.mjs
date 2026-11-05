// Build the pages from data/publications.raw.json + src/*.html templates.
// No dependencies, no runtime: output is plain static HTML for GitHub Pages.
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname);
const read = (p) => fs.readFile(path.join(ROOT, p), 'utf8');
const write = (p, s) => fs.writeFile(path.join(ROOT, p), s, 'utf8');

const data = JSON.parse((await read('data/publications.raw.json')).replace(/^\uFEFF/, ''));
const all = data.publications;
const works = all.filter((w) => w.type !== 'erratum');
const errata = new Map(
  all.filter((w) => w.type === 'erratum').map((w) => [w.erratumFor, w])
);
const preprints = data.candidates || [];

/* ---------------- helpers ---------------- */

const esc = (s = '') =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const isMe = (a) =>
  a.family === 'Chen' && /^(Guoyin|Guo-?Yin|G\.\s*Y\.?)$/i.test((a.given || '').trim());

const TAG_LABELS = {
  inversion: 'Inversion',
  spectropolarimetry: 'Spectropolarimetry',
  'deep-learning': 'Deep learning',
  magnetohydrodynamics: 'MHD',
  'magnetic-field-extrapolation': 'Extrapolation',
  'magneto-seismology': 'Seismology',
  'gamma-ray-burst': 'Gamma-ray bursts',
};

const FILTER_TAGS = Object.keys(TAG_LABELS);

const year = (w) => w.year;

const authorLine = (w) => {
  const list = w.authors || [];
  const shown = list.length <= 12 ? list : list.slice(0, 8);
  const html = shown
    .map((a) => (isMe(a) ? `<span class="au"><b>${esc(a.name)}</b></span>` : `<span class="au">${esc(a.name)}</span>`))
    .join(', ');
  if (list.length <= 12) return html;
  return `${html}, <span class="et-al">et al.</span> <span class="et-al">(${list.length} authors)</span>`;
};

// house style for journal names: the abbreviation astronomers actually cite
const ABBREV = [
  [/^Res\.?\s*Astron\.?\s*Astrophys\.?$/i, 'RAA'],
  [/^Research in Astronomy and Astrophysics$/i, 'RAA'],
  [/^Astronomy (?:&|and) Astrophysics$/i, 'A&A'],
  [/^The Astrophysical Journal( Letters)?$/i, (m) => (m[1] ? 'ApJL' : 'ApJ')],
  [/^Monthly Notices of the Royal Astronomical Society$/i, 'MNRAS'],
];

const journalName = (w) => {
  const raw = (w.journalAbbrev || w.journal || '').trim();
  for (const [re, out] of ABBREV) {
    const m = re.exec(raw);
    if (m) return typeof out === 'function' ? out(m) : out;
  }
  return raw;
};

const pageRange = (page) => {
  const p = String(page || '').trim();
  return /^\d+-\d+$/.test(p) ? p.replace('-', '–') : p;
};

const venue = (w) => {
  const bits = [journalName(w)];
  if (w.volume) bits.push(esc(w.volume));
  const page = pageRange(w.page);
  return `<span class="jrnl">${esc(bits.join(' '))}${page ? `, ${esc(page)}` : ''}</span>`;
};

const links = (w) => {
  const out = [];
  if (w.doi)
    out.push(
      `<a class="doi" href="${esc(w.doiUrl || 'https://doi.org/' + w.doi)}" title="doi:${esc(w.doi)}"><span class="lbl">doi</span><span class="id">${esc(w.doi)}</span></a>`
    );
  if (w.arxivId)
    out.push(
      `<a class="arxiv" href="${esc(w.arxivUrl || 'https://arxiv.org/abs/' + w.arxivId)}" title="arXiv:${esc(w.arxivId)}"><span class="lbl">arXiv</span><span class="id">${esc(w.arxivId)}</span></a>`
    );
  return out.join('\n          ');
};

const bitkey = (w) => {
  const m = /^@\w+\{([^,]+),/.exec(w.bibtex || '');
  return m ? m[1] : w.id;
};

const LABELS = {
  en: {
    first: 'First author',
    position: (n, total) => `${n}${suffix(n)} of ${total}`,
    abstract: 'Abstract',
    copy: 'Copy',
    copied: 'Copied',
    erratum: 'Erratum',
    accepted: 'Accepted for publication in ApJ Letters',
    preprint: 'Preprint, not yet refereed',
    all: 'All',
    any: 'Any',
  },
  zh: {
    first: '第一作者',
    position: (n, total) => `第 ${n} 作者 · 共 ${total} 位`,
    abstract: '摘要',
    copy: '复制',
    copied: '已复制',
    erratum: '勘误',
    accepted: '已被 ApJL 接收',
    preprint: '预印本，尚未送审',
    all: '全部',
    any: '不限',
  },
};

const flags = (w, lang = 'en') => {
  const t = LABELS[lang];
  const out = [];
  if (w.authorPosition === 1) out.push(`<span class="flag flag--first">${t.first}</span>`);
  else if (w.authorPosition) out.push(`<span class="flag flag--co">${t.position(w.authorPosition, w.totalAuthors)}</span>`);
  return out.join('\n          ');
};

const suffix = (n) => {
  const m = n % 100;
  if (m >= 11 && m <= 13) return 'th';
  return ['th', 'st', 'nd', 'rd'][n % 10] || 'th';
};

const errataNote = (w, lang = 'en') => {
  const e = errata.get(w.doi);
  if (!e) return '';
  return `<p class="pub__errata mono">${LABELS[lang].erratum}: ${esc(e.journalAbbrev)} ${esc(e.volume)}, ${esc(e.page)} (${e.year}) · <a href="${esc(e.doiUrl)}">doi:${esc(e.doi)}</a></p>`;
};

const byYear = () => {
  const map = new Map();
  for (const w of works) {
    if (!map.has(year(w))) map.set(year(w), []);
    map.get(year(w)).push(w);
  }
  return [...map.entries()].sort((a, b) => b[0] - a[0]);
};

/* ---------------- renderers ---------------- */

const renderFull = (lang = 'en') => {
  let n = 0;
  return byYear()
    .map(([y, list]) => {
      const rows = list
        .map((w) => {
          n += 1;
          const key = bitkey(w);
          const id = `bib-${key}`;
          const tags = (w.topicTags || []).join(' ');
          const searchText = [
            w.title,
            (w.authors || []).map((a) => `${a.given} ${a.family}`).join(' '),
            w.journal,
            w.journalAbbrev,
            String(w.year),
            ...(w.topicTags || []).map((t) => TAG_LABELS[t] || t),
          ].join(' ');
          return `<article class="pub" id="pub-${key}" data-pub data-year="${w.year}" data-tags="${esc(tags)}" data-text="${esc(searchText)}">
          <h3 class="pub__title"><a href="${esc(w.doiUrl || '#')}">${esc(w.title)}</a></h3>
          <p class="pub__authors">${authorLine(w)}</p>
          <div class="pub__venue mono">
            ${venue(w)}
            ${links(w)}
          </div>
          ${flags(w, lang) ? `<div class="pub__flags">\n            ${flags(w, lang)}\n          </div>` : ''}
          <div class="pub__tools">
          ${w.abstract ? `<details class="pub__more"><summary>${LABELS[lang].abstract}</summary><div class="pub__abstract"><p>${esc(w.abstract)}</p></div></details>` : ''}
          <details class="pub__more"><summary>BibTeX</summary><div class="bibtex"><pre id="${id}">${esc(w.bibtex)}</pre><button class="copy" type="button" data-copy="${id}" data-done="${LABELS[lang].copied}">${LABELS[lang].copy}</button></div></details>
          </div>
          ${errataNote(w, lang)}
        </article>`;
        })
        .join('\n\n');
      return `<section class="year-block" data-year-block>
        <div class="year-head"><h2>${y}</h2></div>

${rows}
      </section>`;
    })
    .join('\n\n');
};

const renderCompact = (dois) =>
  dois
    .map((doi) => works.find((w) => w.doi === doi))
    .filter(Boolean)
    .map(
      (w) => `        <article class="pub">
          <h3 class="pub__title"><a href="${esc(w.doiUrl || '#')}">${esc(w.title)}</a></h3>
          <p class="pub__authors">${authorLine(w)}</p>
          <div class="pub__venue mono">
            ${venue(w)}
            ${links(w)}
          </div>
        </article>`
    )
    .join('\n');

const renderPreprints = (lang = 'en') => {
  if (!preprints.length) return '';
  return preprints
    .map((c) => {
      const status =
        c.status && /accepted/i.test(c.status)
          ? LABELS[lang].accepted
          : LABELS[lang].preprint;
      return `<article class="pub pub--pre" id="pub-${esc(c.id)}">
          <h3 class="pub__title"><a href="${esc(c.arxivUrl)}">${esc(c.title)}</a></h3>
          <p class="pub__authors">${authorLine(c)}</p>
          <div class="pub__venue mono">
            <span class="jrnl">arXiv:${esc(c.arxivId)} [${esc(c.arxivPrimaryClass || 'astro-ph.SR')}]</span>
          </div>
          <div class="pub__flags"><span class="flag">${esc(status)}</span></div>
          <div class="pub__tools">
          ${c.abstract ? `<details class="pub__more"><summary>${LABELS[lang].abstract}</summary><div class="pub__abstract"><p>${esc(c.abstract)}</p></div></details>` : ''}
          </div>
        </article>`;
    })
    .join('\n\n');
};

/* ---------------- spectral dividers ---------------- */

const mulberry32 = (a) => () => {
  a |= 0;
  a = (a + 0x6d2b79f5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

// A section divider that is a measurement, not a rule: Stokes V across a small sunspot.
// Antisymmetric lobes — blue above the axis, red below, the sign code of the magnetogram —
// riding on the noise the real data always carries.
const profileSvg = (seed, { className = 'profile-rule' } = {}) => {
  const rand = mulberry32(seed);
  const W = 600;
  const H = 76;
  const mid = H / 2;
  const count = 3 + (rand() < 0.5 ? 0 : 1);
  const features = [];
  let cursor = 45 + rand() * 70;
  for (let i = 0; i < count; i += 1) {
    features.push({
      c: cursor,
      w: 3 + rand() * 3.4,
      a: 16 + rand() * 11,
    });
    cursor += 105 + rand() * 155;
  }

  const p1 = rand() * 6.283;
  const p2 = rand() * 6.283;

  const profile = (x) => {
    let off = 0;
    for (const f of features) {
      const u = (x - f.c) / f.w;
      off += f.a * u * Math.exp(-0.5 * Math.abs(u) ** 1.45);
    }
    // detector noise, deterministic: one slow undulation and one medium
    off += 0.7 * Math.sin(x * 0.045 + p1) + 0.45 * Math.sin(x * 0.17 + p2);
    return off;
  };

  // sample densely across each line profile, sparsely along the continuum
  const xs = new Set();
  for (let x = 0; x <= W; x += 10) xs.add(Math.round(x));
  for (const f of features) {
    for (let x = f.c - 4.4 * f.w; x <= f.c + 4.4 * f.w; x += 0.9) {
      const v = Math.round(x);
      if (v >= 0 && v <= W) xs.add(v);
    }
  }

  const pts = [...xs].sort((a, b) => a - b).map((x, i) => `${i === 0 ? 'M' : 'L'}${x} ${(mid - profile(x)).toFixed(1)}`);
  const d = pts.join('');

  const ticks = [];
  for (let x = 20; x < W; x += 40) {
    ticks.push(`<line x1="${x}" y1="${mid + 3}" x2="${x}" y2="${mid + 6}"/>`);
  }

  const id = `sv${seed}`;
  // one path in defs, used twice with opposite clips: half the bytes, same drawing
  return `<div class="rule-wrap"><svg class="${className}" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <defs>
          <path id="${id}-d" d="${d}" pathLength="1"/>
          <clipPath id="${id}-up"><rect x="0" y="0" width="${W}" height="${mid}"/></clipPath>
          <clipPath id="${id}-dn"><rect x="0" y="${mid}" width="${W}" height="${mid}"/></clipPath>
        </defs>
        <g class="ticks">${ticks.join('')}</g>
        <line class="axis" x1="0" y1="${mid}" x2="${W}" y2="${mid}"/>
        <use class="trace trace--blue" href="#${id}-d" clip-path="url(#${id}-up)"/>
        <use class="trace trace--red" href="#${id}-d" clip-path="url(#${id}-dn)"/>
      </svg></div>`;
};

/* ---------------- page assembly ---------------- */

const yearsAvailable = [...new Set(works.map(year))].sort((a, b) => b - a);
const firstAuthorCount = works.filter((w) => w.authorPosition === 1).length;
const span = `${Math.min(...works.map(year))}–${Math.max(...works.map(year))}`;

const TAG_LABELS_ZH = {
  inversion: '反演',
  spectropolarimetry: '偏振测量',
  'deep-learning': '深度学习',
  magnetohydrodynamics: '磁流体',
  'magnetic-field-extrapolation': '磁场外推',
  'magneto-seismology': '日冕地震学',
  'gamma-ray-burst': '伽马暴',
};

const chipRow = (values, label, lang) =>
  values
    .map((v) => {
      const isAll = v === 'all';
      const text = isAll ? label.all : label.of(v);
      return `<button class="chip" type="button" data-value="${v}" aria-pressed="${isAll}">${text}</button>`;
    })
    .join('\n            ');

const yearsOf = (lang) => chipRow(['all', ...yearsAvailable], { all: LABELS[lang].all, of: (y) => y }, lang);
const tagsOf = (lang) =>
  chipRow(['all', ...FILTER_TAGS], {
    all: LABELS[lang].any,
    of: (t) => (lang === 'zh' ? TAG_LABELS_ZH[t] || TAG_LABELS[t] || t : TAG_LABELS[t] || t),
  }, lang);

const tokens = {
  PUBS_FULL: renderFull('en'),
  PUBS_FULL_ZH: renderFull('zh'),
  PUBS_COMPACT: renderCompact([
    '10.1051/0004-6361/202659270',
    '10.3847/1538-4357/ae5108',
    '10.3847/1538-4357/ae27d1',
    '10.1051/0004-6361/202346393',
    '10.1051/0004-6361/202142711',
  ]),
  PREPRINTS: renderPreprints('en'),
  PREPRINTS_ZH: renderPreprints('zh'),
  PREPRINT_COUNT: String(preprints.length),
  PROFILE_1: profileSvg(11),
  PROFILE_2: profileSvg(47),
  PROFILE_3: profileSvg(92, { ticks: false }),
  PROFILE_4: profileSvg(133),
  YEAR: String(new Date().getFullYear()),
  PUB_COUNT: String(works.length),
  FIRST_COUNT: String(firstAuthorCount),
  SPAN: span,
  YEARS: yearsOf('en'),
  TAGS: tagsOf('en'),
  YEARS_ZH: yearsOf('zh'),
  TAGS_ZH: tagsOf('zh'),
  BUILT: new Date().toISOString().slice(0, 10),
};

// NOTE: the replacer must be a function — the generated HTML contains `$` (H$_2$,
// $_{\odot}$) and string replacements would read those as $& / $` / $' patterns.
const fill = (template) =>
  template.replace(/\{\{([A-Z0-9_]+)\}\}/g, (m, name) => (name in tokens ? tokens[name] : m));

// The Chinese pages live in zh/, one directory down, so every asset URL gains a
// ../ prefix. Same-directory links (index.html, publications.html) keep working.
const toSubdir = (html) =>
  html
    .replace(/(["'\s(])assets\//g, '$1../assets/')
    .replace(/href="publications\.bib"/g, 'href="../publications.bib"');

// Social cards and hreflang need absolute URLs, which cannot be known until the
// site has an address. Set SITE_URL=https://gychen-nju.github.io at build time and
// every such URL is resolved against it; leave it unset for local preview.
const SITE_URL = (process.env.SITE_URL || '').replace(/\/+$/, '');

const absolutize = (html, out) => {
  const dir = out.includes('/') ? out.slice(0, out.lastIndexOf('/') + 1) : '';
  const base = `${SITE_URL}/${dir}`;
  const abs = (href) => new URL(href, base).href;
  const self = out.endsWith('/index.html') || out === 'index.html'
    ? base
    : abs(out.slice(dir.length));
  let next = html
    .replace(/<meta property="og:image" content="([^"]+)">/, (m, href) =>
      `<meta property="og:image" content="${abs(href)}">`)
    .replace(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)">/g, (m, lang, href) =>
      `<link rel="alternate" hreflang="${lang}" href="${abs(href)}">`);
  // A canonical URL keeps the two editions from competing in search results.
  if (!/rel="canonical"/.test(next)) {
    next = next.replace('</head>', `  <link rel="canonical" href="${self}">\n</head>`);
  }
  return next;
};

fs.mkdir(path.join(ROOT, 'zh'), { recursive: true });

for (const page of [
  { src: 'index', out: 'index.html' },
  { src: 'publications', out: 'publications.html' },
  { src: 'index.zh', out: 'zh/index.html', subdir: true },
  { src: 'publications.zh', out: 'zh/publications.html', subdir: true },
]) {
  const template = await read(`src/${page.src}.html`);
  let html = fill(template);
  if (page.subdir) html = toSubdir(html);
  if (SITE_URL) html = absolutize(html, page.out);
  await write(page.out, html);
}

// One machine-readable file for the whole record: every entry's BibTeX, and a
// @misc stub for each preprint (no DOI, so no bibliography entry exists yet).
const preprintBib = (c) => {
  const key = `${c.authors[0].family.toLowerCase()}${c.year}${(c.title.match(/[A-Za-z]+/g) || []).slice(0, 2).join('').toLowerCase()}`;
  const authors = c.authors.map((a) => `${a.family}, ${a.given}`).join(' and ');
  return [
    `@misc{${key},`,
    `  author        = {${authors}},`,
    `  title         = {{${c.title}}},`,
    `  year          = {${c.year}},`,
    `  eprint        = {${c.arxivId}},`,
    `  archivePrefix = {arXiv},`,
    `  primaryClass  = {${c.arxivPrimaryClass || 'astro-ph.SR'}},`,
    `  note          = {${/^accepted/i.test(c.status || '') ? 'Accepted for publication in ApJ Letters' : 'Preprint, not yet refereed'}},`,
    `  url           = {${c.arxivUrl}},`,
    `}`,
  ].join('\n');
};

const bibFile = [
  '% Guoyin Chen — publications',
  `% Generated ${new Date().toISOString().slice(0, 10)} from data/publications.raw.json (ORCID + Crossref).`,
  '% Author order, volume, pages and DOIs are as published.',
  '',
  ...works.map((w) => w.bibtex.trim()),
  '',
  ...all.filter((w) => w.type === 'erratum').map((w) => w.bibtex.trim()),
  '',
  ...preprints.map(preprintBib),
  '',
].join('\n\n');
await write('publications.bib', bibFile);

console.log(
  `built index.html, publications.html, zh/ (2 pages), publications.bib — ${works.length} papers (${firstAuthorCount} first-author), 1 erratum, ${preprints.length} preprints, ${span}`
);
