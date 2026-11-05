# Guoyin Chen — academic site

A hand-written, framework-free academic homepage: solar physics, spectropolarimetric
inversion, magnetic-field extrapolation. The design language is a printed observatory
plate book — bone paper, ink, hairlines, plate numbers, and the blue/red of a Stokes
magnetogram as the only chroma.

Four pages (English + Chinese), one build script, no dependencies.

```
.
├── index.html            ← built: front page (EN)
├── publications.html     ← built: full record (EN)
├── zh/
│   ├── index.html        ← built: front page (中文)
│   └── publications.html ← built: full record (中文)
├── 404.html              ← static, GitHub Pages serves it automatically
├── publications.bib      ← generated: the whole record as one BibTeX file
├── DESIGN.md             ← design system: tokens, type ramp, components, do's and don'ts
├── src/
│   ├── index.html        ← template (edit this, not index.html)
│   ├── publications.html ← template
│   ├── index.zh.html     ← 中文 template
│   └── publications.zh.html
├── build.mjs             ← zero-dependency generator: src/*.html + data → *.html
├── assets/
│   ├── css/site.css      ← the whole design system
│   ├── js/site.js        ← reveal, sticky masthead, filters, BibTeX copy
│   ├── fonts/            ← Spectral + Fragment Mono, self-hosted woff2 (latin subset)
│   └── img/              ← portrait, Stokes plate, favicon, og card
└── data/
    ├── publications.raw.json  ← ORCID record + Crossref enrichment (source of truth)
    ├── projects.raw.json      ← GitHub metadata for the six pinned repositories
    └── _tmp/                  ← working files, not shipped (ignored by git)
```

## Rebuild

```sh
node build.mjs
```

`build.mjs` reads the four templates, fills the publication list, the year/topic filter
chips, the abstract and BibTeX blocks, the four section rules (each is a measured
Stokes-V profile drawn as SVG), and writes the four pages above. It also writes
`publications.bib`, the same record as one importable file. Nothing is minified;
the output is meant to be read.

The Chinese pages live one directory down, so the build rewrites every `assets/…`
reference to `../assets/…`. Keep the templates using root-relative asset paths and let
the build do the rewrite; do not hand-edit `zh/*.html`.

## Editing

- **Prose** — `src/*.html`. Anything in `{{DOUBLE_BRACES}}` is replaced at build time;
  leave the tokens alone unless you also edit `build.mjs`. The English and Chinese
  templates are separate files: change one, change the other, or the two editions drift.
- **Publication data** — `data/publications.raw.json`. Each entry carries the authors,
  journal, volume, page, DOI, arXiv id, abstract, author position, topic tags and a
  ready-made BibTeX string. Add a paper there and it appears in all four pages on rebuild.
  The erratum is folded into its parent entry via `type: "erratum"` + `erratumFor`.
  Entries in `candidates` (no DOI yet) are rendered in the separate *Preprints /
  预印本与已接收* block, because ORCID only holds works that have a DOI.
- **Chinese labels** — `LABELS` and `TAG_LABELS_ZH` at the top of `build.mjs`
  (abstract, first author, erratum, preprint badges, filter chips).
- **Software cards** — written by hand in both `src/index*.html` §03; `data/projects.raw.json`
  holds the verified metadata (stars, license, latest release) used to check them.
- **Design tokens** — the `:root` block at the top of `assets/css/site.css`; every
  colour, type step, gutter and rule weight is declared there once. `DESIGN.md` documents
  why each value exists; read it before changing a token.

## Deploy (GitHub Pages)

The site is static and needs no build step on the server: the built HTML is committed
as-is, so Pages serves the repository verbatim.

**Choosing the repository name decides the URL.**

| Repository | URL | Note |
| --- | --- | --- |
| `gychen-NJU.github.io` | `https://gychen-nju.github.io/` | user site: cleanest address, one per account |
| `myweb` (or any name) | `https://gychen-nju.github.io/myweb/` | project site, same content, longer address |

All links are relative, so both work unchanged. For a custom domain, add `CNAME`.

**Visibility versus Pages.** On a GitHub Free account, Pages only publishes from a
*public* repository; private repositories need GitHub Pro/Team/Enterprise. And a Pages
site has no access control — publishing from a private repository still makes the site
publicly readable. So "private source + public site" needs a different host (Cloudflare
Pages or Netlify can build from a private repository), not GitHub Pages.

Steps, public route:

```sh
# from the repository root; the site files are already at the top level
gh repo create gychen-NJU.github.io --public --source . --remote origin --push
# then: Settings → Pages → Deploy from a branch → main → / (root)
```

Private-source route (Cloudflare Pages): create a private repository, push, connect it
to Cloudflare Pages with build command `node build.mjs` and output directory `/` — the
site is then public while the repository stays private.

`.nojekyll` is included so GitHub Pages serves the directory verbatim.

Two things to fix once the domain is known:

- `og:image` in every `<head>` is a relative path; social platforms need an absolute URL
  (`https://your.domain/assets/img/og-cover.jpg`).
- `hreflang` alternates are relative too; make them absolute for search engines.

## What is verified, and what is not

- Every paper, author, volume, page, DOI and arXiv id comes from the ORCID record
  (public API) and was cross-checked against Crossref. The two preprints come from arXiv
  and are labelled as such.
- Citation counts are deliberately not shown: Crossref counts are a floor, not ADS.
- The six software cards describe the pinned repositories; licence badges are only shown
  where the repository actually declares one (SPOT and CuSP do not).
- The portrait is the official University of Oslo photograph
  (`mn.uio.no`), used at its published 3:4 crop.
- The Chinese edition is a translation of the English copy. Institution names stay
  recognisable; paper titles stay in their published English form.
- Open questions left to the site's owner: Chinese name characters, PhD thesis,
  talks/CV, and whether to publish a Google Scholar link.
