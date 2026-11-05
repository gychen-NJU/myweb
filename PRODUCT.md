# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

delegated: hand-authored static HTML + CSS + ES modules, no build step, deployable to GitHub Pages as-is. Reason: the owner will edit text and add papers by hand for years, the page must survive toolchain rot, and a zero-install repo keeps the site editable from any machine. No framework, no bundler, no runtime dependencies.

## Users

- **Hiring and selection committees** (PhD/postdoc/faculty search, fellowship panels) who land here from a paper, a talk, or an application and need, within a minute: who this person is, what they work on, how strong and how current the record is.
- **Solar-physics collaborators** (spectropolarimetry, MHD, ML-for-physics) checking a specific paper, method, or whether a code is usable for their own data.
- **Students and early-career readers** who found a paper through ADS/arXiv/Scholar and want the PDF, the DOI, the code, and a way to write to the author.

## Product Purpose

This is the canonical public record of Guoyin Chen's research: identity and affiliation, research programme, a complete and correctly formatted publication list, the open-source tools that implement the methods, and a reliable way to make contact. Success means a visitor can name his research focus, open the PDF of any paper in one click, and copy a BibTeX entry without leaving the page.

## Positioning

A neighbouring academic homepage lists publications as a bibliography and describes the person as "a researcher interested in X". This site is built on the opposite claim: his research inverts light into magnetic field — a measured Stokes spectrum goes in, a physical vector field comes out — and the page demonstrates that inversion rather than asserting it, with real line profiles, response maps, field lines, and the actual codes that perform each step. The record is the argument.

## Operating Context

- Visitors arrive from Google Scholar, ADS, arXiv, ORCID, ResearchGate, GitHub, LinkedIn, a conference page, or an email signature; most look at one screen on a phone.
- The publication record is maintained in ORCID (0000-0001-9610-0433) and ResearchGate; GitHub pinned repositories carry the software.
- Readers frequently need: PDF/DOI/arXiv links, one-click BibTeX, the code repository behind a method, and an email address they can copy.
- Official institutional page exists (UiO/RoCS) and holds the formal affiliation wording; it is a directory entry, not a narrative.
- Institutional press photo is an official asset supplied by the department.

## Capabilities and Constraints

- Static, single-repo, no backend. Content lives in HTML plus small JSON data files so papers can be added by editing one array.
- Publication data is verified against ORCID + Crossref; a paper may be added from ORCID alone. **Constraint: never invent a paper, author, page number, DOI, citation count, or award.**
- Six pinned GitHub repositories exist (SPOT, CuSP, arxiv-checkup, dsh-overleaf, zotnote, PF2nlfff); star counts and languages come from the GitHub API at build time and must be treated as a snapshot, not live claims.
- Explicitly undecided / not yet supplied: exact current job title and start date, PhD thesis title and defence date, talks and teaching record, a CV PDF, a Google Scholar profile URL, awards, and preferred Chinese name form. Absence is honest: the site omits these rather than filling them with plausible text.
- Language: two editions. English is the scholarly edition (paper titles, journals and identifiers stay in their published form); Chinese is a full translation at /zh/ reached by a masthead switch, for the audience that arrives from a Chinese search or a Chinese-speaking department. The owner asked for the toggle, so it ships in the first release.

## Brand Commitments

- Name: **Guoyin Chen** (陈国印 — pending confirmation of the preferred Chinese characters before publishing them).
- Affiliations as published by the institutions: Guest Researcher, Rosseland Centre for Solar Physics (RoCS), Institute of Theoretical Astrophysics, University of Oslo; Nanjing University (B.Sc. Astronomy, and research collaboration).
- Contact: guoyin.chen@astro.uio.no; GitHub gychen-NJU; ORCID; ResearchGate.
- Portrait: official UiO photograph (`data/guoyin.jpg`). Must not be distorted, recoloured beyond crop, or replaced with generated imagery of a person.
- Voice: first person, plain, specific, unfussy. No marketing adjectives about himself; no "passionate", "dedicated", "cutting-edge".

## Evidence on Hand

- Official portrait, 4160×5082 JPEG: `data/guoyin.jpg`.
- ORCID record with 11 publication entries and DOIs: `data/orcid-works.json`; Crossref slice: `data/crossref-works.json`; enriched merge being written to `data/publications.raw.json`.
- GitHub profile with 6 pinned repositories: `data/github-pinned.json`; enriched metadata `data/projects.raw.json`.
- UiO profile wording (role, address, five research interests) captured from the live page.
- Author-side paper package for the SPOT / spectropolarimetric-inversion work at `E:\GalaxyC\my_papers\2026.SPOT\` — manuscript, `figures/*.pdf`, and documentation; legitimate source of real figures authored by the subject.
- Absent: talks list, teaching, awards, CV, press coverage, student supervision record, any quantitative performance metric (no h-index or citation-total claim may be published without a dated, attributable source).

## Product Principles

1. **Show the inversion, don't describe it.** Every strong claim on this site is backed by a real figure, a real number, or a real link; nothing is asserted with an adjective that could have been proved with evidence.
2. **The person in ten seconds, the work in sixty.** A visitor with one minute must leave knowing the field, the method, and the strongest three papers.
3. **One click to the artifact.** Each paper exposes PDF/DOI/arXiv/BibTeX at the surface; each project exposes a clone/readme path; the email is copyable.
4. **The record is complete and correctly formatted.** Author order, journal, volume, article number, year — as published, consistently, with no orphan entries and no invented metadata.
5. **Built to be maintained by one person.** Adding a paper or a project is a single edit in one data file; nothing else on the site needs to change.

## Accessibility & Inclusion

WCAG 2.2 AA: body text ≥ 4.5:1 contrast in both themes, visible focus rings, full keyboard operation (nav, filters, copy buttons, theme switch), semantic landmarks and headings, figures with meaningful alternative text, and all motion gated behind `prefers-reduced-motion`.
