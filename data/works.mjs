// Build data/publications.json from ORCID (canonical set) + Crossref (venue/abstract) + arXiv (preprint links).
// Cached fetches live in data/cache/ so re-runs are cheap.
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname);
const CACHE = path.join(ROOT, 'cache');
const ORCID = '0000-0001-9610-0433';
const UA = 'guoyin-chen-website/1.0 (academic homepage build)';

const readJson = async (p) => JSON.parse((await fs.readFile(p, 'utf8')).replace(/^\uFEFF/, ''));
const exists = async (p) => { try { await fs.access(p); return true; } catch { return false; } };

async function cached(name, fn) {
  const file = path.join(CACHE, name + '.json');
  if (await exists(file)) return readJson(file);
  const value = await fn();
  await fs.mkdir(CACHE, { recursive: true });
  await fs.writeFile(file, JSON.stringify(value, null, 1), 'utf8');
  return value;
}

const getJson = async (url, headers = {}) => {
  const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json', ...headers } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  return res.json();
};

const getText = async (url, headers = {}) => {
  const res = await fetch(url, { headers: { 'User-Agent': UA, ...headers } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  return res.text();
};

/* ---------------- helpers ---------------- */

const decode = (s) =>
  s == null ? null : s
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ').trim();

const cleanAbstract = (html) =>
  decode(html.replace(/<jats:title>[\s\S]*?<\/jats:title>/g, ' ').replace(/<[^>]+>/g, ' '));

const JOURNAL_SHORT = new Map([
  ['The Astrophysical Journal', 'ApJ'],
  ['The Astrophysical Journal Letters', 'ApJL'],
  ['Astronomy & Astrophysics', 'A&A'],
  ['Monthly Notices of the Royal Astronomical Society', 'MNRAS'],
  ['Research in Astronomy and Astrophysics', 'RAA'],
  ['Nature Astronomy', 'Nat. Astron.'],
  ['The Astronomical Journal', 'AJ'],
]);

const isMe = (name) => {
  const s = (name || '').trim();
  return (
    /^Guoyin\s+Chen$/i.test(s) ||
    /^G\.\s*Y\.\s*Chen$/i.test(s) ||
    /^G\.Y\.\s*Chen$/i.test(s) ||
    /^Guo-?Yin\s+Chen$/i.test(s) ||
    /^Chen,?\s*G(uoyin|uo-?Yin)?\b/i.test(s)
  );
};

const normalizeTitle = (t) =>
  (t || '')
    .toLowerCase()
    .replace(/\$[^$]*\$/g, (m) => m.replace(/[$_{}^\\]/g, ''))
    .replace(/<[^>]+>/g, ' ')
    .replace(/[^a-z0-9α-ω]+/g, ' ')
    .trim();

const overlap = (a, b) => {
  const A = new Set(a.split(' ').filter(Boolean));
  const B = new Set(b.split(' ').filter(Boolean));
  if (!A.size || !B.size) return 0;
  return [...A].filter((x) => B.has(x)).length / Math.max(A.size, B.size);
};

/* ---------------- 1. ORCID ---------------- */

const orcidWorks = await cached('orcid-works', () =>
  getJson(`https://pub.orcid.org/v3.0/${ORCID}/works`, { Accept: 'application/json' })
);

const summaries = [];
for (const group of orcidWorks.group ?? []) for (const s of group['work-summary'] ?? []) summaries.push(s);

const details = [];
for (const s of summaries) {
  const put = s['put-code'];
  details.push(
    await cached(`orcid-work-${put}`, () =>
      getJson(`https://pub.orcid.org/v3.0/${ORCID}/work/${put}`, { Accept: 'application/json' })
    )
  );
}

/* ---------------- 2. Crossref ---------------- */

const crossrefByDoi = async (doi) =>
  cached(`crossref-${doi.replace(/[^a-z0-9]+/gi, '_')}`, async () => {
    const j = await getJson(`https://api.crossref.org/works/${encodeURIComponent(doi)}`);
    return j.message;
  });

/* ---------------- 3. arXiv (one author listing) ---------------- */

const arxivListing = await cached('arxiv-author-listing', async () => {
  const t = await getText(
    `http://export.arxiv.org/api/query?search_query=${encodeURIComponent('au:"Guoyin Chen"')}&start=0&max_results=100`
  );
  return [...t.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map((m) => {
    const e = m[1];
    return {
      title: decode((e.match(/<title>([\s\S]*?)<\/title>/) ?? [])[1] ?? ''),
      id: (((e.match(/<id>([\s\S]*?)<\/id>/) ?? [])[1] ?? '').match(/abs\/([^v]+)/) ?? [])[1] ?? null,
      published: ((e.match(/<published>([\s\S]*?)<\/published>/) ?? [])[1] ?? '').slice(0, 10),
      authors: [...e.matchAll(/<name>([\s\S]*?)<\/name>/g)].map((x) => x[1].trim()),
    };
  });
});

const arxivFor = (title) => {
  const target = normalizeTitle(title);
  const scored = arxivListing
    .map((a) => ({ ...a, s: overlap(target, normalizeTitle(a.title)) }))
    .sort((x, y) => y.s - x.s);
  const best = scored[0];
  return best && best.s >= 0.9 && best.authors.includes('Guoyin Chen') ? best : null;
};

/* ---------------- 4. Merge ---------------- */

const works = [];
for (const d of details) {
  const ids = d['external-ids']?.['external-id'] ?? [];
  const doi = ids.find((e) => e['external-id-type'] === 'doi' && e['external-id-relationship'] === 'self')
    ?.['external-id-value'] ?? null;
  const arxivIdFromOrcid = ids.find((e) => e['external-id-type'] === 'arxiv')
    ?.['external-id-value'] ?? null;

  const contributors = (d.contributors?.contributor ?? []).map((c) => ({
    name: decode(c['credit-name']?.value ?? ''),
    orcid: c['contributor-orcid']?.path ?? null,
  })).filter((c) => c.name);

  const year = Number(d['publication-date']?.year?.value ?? 0);
  const month = Number(d['publication-date']?.month?.value ?? 0);
  const title = decode(d.title?.title?.value ?? '');
  const journalFull = decode(d['journal-title']?.value ?? '');

  const cr = doi ? await crossrefByDoi(doi).catch(() => null) : null;

  works.push({
    title,
    year,
    month,
    doi,
    journal: journalFull || null,
    journalShort: JOURNAL_SHORT.get(journalFull) ?? (journalFull || null),
    volume: cr?.volume ?? d.volume ?? null,
    issue: cr?.issue ?? d.issue ?? null,
    page: cr?.page ?? d.page ?? null,
    articleNumber: cr?.['article-number'] ?? null,
    type: d.type,
    isErratum: /^erratum/i.test(title),
    url: d.url?.value ?? (doi ? `https://doi.org/${doi}` : null),
    contributors,
    meIndex: contributors.findIndex((c) => isMe(c.name)),
    abstract: cr?.abstract
      ? cleanAbstract(cr.abstract)
      : d['short-description'] ? decode(d['short-description']) : null,
    arxiv: arxivIdFromOrcid ? { id: arxivIdFromOrcid, published: null } : null,
    citedBy: cr?.['is-referenced-by-count'] ?? null,
  });
}

// One work can appear in several ORCID groups (self-asserted + Crossref-sourced).
const byDoi = new Map();
for (const w of works) {
  const key = w.doi ? w.doi.toLowerCase() : w.title.toLowerCase();
  const prev = byDoi.get(key);
  const score = (x) => x.contributors.length * 10 + (x.abstract ? 5 : 0) + (x.volume ? 2 : 0);
  if (!prev || score(w) > score(prev)) byDoi.set(key, w);
}

let unique = [...byDoi.values()].sort((a, b) => b.year - a.year || (b.month || 0) - (a.month || 0));

for (const w of unique) if (!w.arxiv) w.arxiv = arxivFor(w.title);

// Fold errata into the work they correct.
const errata = unique.filter((w) => w.isErratum);
const main = unique.filter((w) => !w.isErratum);
for (const e of errata) {
  const base = e.title.replace(/^erratum[:\s]*/i, '').replace(/[“”]/g, '').trim();
  let hit = null;
  let best = 0;
  for (const w of main) {
    const s = overlap(normalizeTitle(base), normalizeTitle(w.title));
    if (s > best) { best = s; hit = w; }
  }
  if (hit && best > 0.6) hit.erratum = { title: e.title, journalShort: e.journalShort, volume: e.volume, page: e.page, year: e.year, doi: e.doi };
  else main.push(e);
}
unique = main;

await fs.writeFile(
  path.join(ROOT, 'publications.json'),
  JSON.stringify({ orcid: ORCID, generated: new Date().toISOString(), works: unique }, null, 1),
  'utf8'
);

console.log(
  unique.map((w) => [
    w.year, w.journalShort, `v${w.volume ?? '—'}`, w.page ?? w.articleNumber ?? '—',
    `${w.contributors.length}au`, w.meIndex === 0 ? 'FIRST' : `#${w.meIndex + 1}`,
    w.abstract ? 'abs' : 'NO-ABS', w.arxiv ? 'arXiv:' + w.arxiv.id : '—',
    w.erratum ? 'errata' : '',
    w.title.slice(0, 48),
  ].join(' | ')).join('\n')
);
