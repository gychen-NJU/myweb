---
name: Guoyin Chen — observatory edition
version: 1.0.0
description: A printed observatory plate book for a solar physicist: warm paper with grain, ink, hairlines, plate numbers, a near-black corona plate, and the blue/red of a Stokes magnetogram as the only chroma.
colors:
  paper: "#f4eee3"
  paper-raised: "#faf6eb"
  paper-sunk: "#eae1d0"
  ink: "#171310"
  ink-secondary: "#4b433b"
  ink-tertiary: "#655b50"
  link-rule: "#8d8171"
  rule: "#ded3bf"
  rule-strong: "#bdb09a"
  polarity-blue: "#234a78"
  polarity-blue-light: "#2f6098"
  polarity-red: "#98291f"
typography:
  display:
    fontFamily: Spectral
    fontWeight: 400
    fontSize: clamp(3.1rem, 6.1vw, 5.35rem)
    lineHeight: 0.98
    letterSpacing: -0.02em
  heading:
    fontFamily: Spectral
    fontWeight: 400
    fontSize: clamp(1.9rem, 2.75vw, 2.6rem)
    lineHeight: 1.12
    letterSpacing: -0.01em
  subheading:
    fontFamily: Spectral
    fontWeight: 500
    fontSize: clamp(1.18rem, 1.45vw, 1.42rem)
    lineHeight: 1.3
    letterSpacing: -0.005em
  lead:
    fontFamily: Spectral
    fontWeight: 400
    fontSize: clamp(1.12rem, 1.33vw, 1.32rem)
    lineHeight: 1.5
    letterSpacing: 0em
  body:
    fontFamily: Spectral
    fontWeight: 400
    fontSize: 1rem
    lineHeight: 1.62
    letterSpacing: 0em
  label:
    fontFamily: Fragment Mono
    fontWeight: 400
    fontSize: 0.6875rem
    lineHeight: 1.5
    letterSpacing: 0.09em
  micro:
    fontFamily: Fragment Mono
    fontWeight: 400
    fontSize: 0.6875rem
    lineHeight: 1.5
    letterSpacing: 0.09em
spacing:
  xs: 0.35rem
  sm: 0.55rem
  md: 1rem
  lg: clamp(1.7rem, 2.7vw, 2.5rem)
  xl: clamp(4.5rem, 8.5vw, 8.5rem)
  wrap: 1320px
  gutter: clamp(1.25rem, 3.4vw, 3.5rem)
rounded:
  default: 0
components:
  button:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.default}"
    padding: 0.7rem 0.95rem
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.default}"
    padding: 0.7rem 0.95rem
  plate:
    backgroundColor: "{colors.paper-raised}"
    textColor: "{colors.ink-secondary}"
    typography: "{typography.micro}"
    rounded: "{rounded.default}"
    padding: 0.5rem
  chip:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink-secondary}"
    typography: "{typography.micro}"
    rounded: "{rounded.default}"
    padding: 0.25rem 0.45rem
  publication:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.default}"
    padding: 1.4rem 0
---

## Overview

The site is a plate book, not a landing page. Its world is the printed edition a
solar observatory might publish: bone paper, a single ink, hairline rules, numbered
plates, mono captions set small, and — the only colour — the two polarities of a
magnetogram. The design's job is to make the research method visible: light in,
magnetic field out.

Every plate, rule and caption exists to carry evidence: the portrait is Plate I, the
Stokes map matrix is Plate II, section breaks are drawn as measured Stokes-V profiles
with the blue lobe above the axis and the red below.

## Colors

**Paper.** `paper`, `paper-raised`, `paper-sunk` are the three grounds: the page, the
inset of a plate frame, and the recessed chip. They sit within 6% of each other; do not
add a fourth.

**Ink.** `ink` for anything read as a statement — names, headings, publication titles,
emails. `ink-secondary` for running prose (body copy is deliberately not pure ink).
`ink-tertiary` for captions, marginalia, labels and disabled states. It is the darkest value that still reads as a third tone: 5.0:1 on paper. Do not lighten it for elegance — `#6b7176` measures 4.37:1 and fails AA.

**Rules.** `rule` for 1px separators, `rule-strong` for plate frames and chip borders.
Rules are always 1px; a 2px rule reads as a browser default, not a printed one.
`link-rule` is the underline colour on links: 3.0:1 against paper, so an underline is
legible as a cue without competing with the separators. Never underline in `rule` (1.8:1).

**Polarity.** `polarity-blue` and `polarity-red` are data, not decoration. Use them only
where a sign means something: the line-profile traces, the magnetogram, the first-author
mark. Never for links, never for backgrounds, never as a pair on a button.

## Typography

Two faces, both self-hosted as latin-subset woff2.

**Spectral** carries all reading: display, headings, prose, publication titles. It is a
screen-reading serif with a low-contrast, slightly condensed feel that survives being
set small.

**Fragment Mono** is the machine voice: labels, kickers, captions, venue lines, DOI and
arXiv identifiers, buttons, chips, the colophon. Always uppercase for labels at
`letter-spacing: 0.09–0.11em`; never uppercase a sentence or an abstract.

Rules of the house:

- Display type is weight 400 only. Bold serif is not part of the system; emphasis in
  running prose is italic.
- Body measure stays between 55 and 70 characters; captions 60–80.
- Mono is never used for prose, only for things that are code-like: identifiers,
  numbers, labels, keyboard hints.
- Numbers in the publication rail align by virtue of the mono face — do not add
  `font-variant-numeric` overrides.

### Chinese edition

`zh/` pages carry `lang="zh-CN"`, which swaps the CJK fallbacks: headlines fall through
Spectral to a Song face (`Songti SC`, `Noto Serif SC`, `SimSun`), running text to a Hei
face (`PingFang SC`, `Microsoft YaHei`, `Noto Sans SC`). Latin words inside Chinese
sentences still resolve to Spectral first, so the two editions share a voice.

Three consequences, applied in CSS rather than by hand:

- Leading rises to 1.85–1.92; the Chinese body measure is capped at 30–31em (about
  32 characters) instead of 58ch.
- The drop cap is switched off. It is a Latin device: on 我 it reads as a mistake.
- Letter-spacing on labels drops to 0.03em; tracking a Han character looks like a
  rendering bug, not typographic care.

## Layout

A 12-column grid on a 1320px wrap with a fluid gutter. Sections use a three-part
structure: a 3-column aside for the section number and label, a title block, and a body
that spans 5–12 columns. This asymmetry is the page's rhythm — do not centre sections.

Reading widths are capped in `ch`, not `px`, so the measure survives a type-size change:
40ch for the hero statement, 58–62ch for thread bodies, 46ch for publication titles,
26ch for marginal notes.

Breakpoints: 1080 (grid narrows), 900 (single column, portrait moves below the name),
720 (threads and plates stack), 520 (square portrait, masthead sheds its sub-label),
380 (wordmark text drops). Below 860 the masthead keeps only the language switch, so
the two editions are always one tap apart.

## Elevation & Depth

There is none. No shadows, no blur, no translucency, no cards floating over a page. Depth
is expressed the way a printed sheet expresses it: a hairline, a paper change of 3%, an
inset frame with 8px of gutter around a plate.

The one compositing trick is `mix-blend-mode: multiply` on the Stokes plate, so the white
of the matplotlib figure disappears into the paper. Any new figure should get the same
treatment rather than a white box.

## Shapes

Nothing is rounded (`border-radius: 0` everywhere). Circles appear only where the artefact
is circular: the favicon disc, the disclosure marker is a `+`/`−`, not a bullet. Borders
are 1px; the plate frame is 1px + 8px padding + a hairline caption rule.

## Components

**Masthead.** Sticky, 1px bottom rule when stuck, wordmark (disc, name, slash, subject),
three-part nav in mono uppercase, external ORCID/GitHub at the far right. The active page
is marked with `aria-current` and a blue underline.

**Hero.** Name, then the one-sentence statement, then a hairline, then the affiliation block
(role, institute, school, email) in mono sentence case, then the actions pushed to the foot of
the column. No eyebrow above the name: the name is the first thing on the page and the
statement is the second. The portrait plate holds the right five columns and its caption
aligns with the buttons.

**Plate.** Figure + frame + `.plate__no` label (`Plate II / Stokes maps`) + caption. The
label and caption may sit in a two-column footer; on narrow screens they stack. Captions
state provenance, never a description of what you can see.

**Section rule.** An inline SVG Stokes-V profile: baseline noise, three or four
antisymmetric lobes at irregular positions, faint wavelength ticks, one `<path>` reused
twice under complementary clip paths. It is generated by `build.mjs`, not drawn by hand.

**Publication entry.** Two columns: title + author line + disclosure row on the left, a
15rem mono rail on the right holding journal/volume/page, DOI, arXiv and the author-position
flag. First author gets a blue 1px box; co-authorship is plain mono text. Abstracts and
BibTeX open in place.

**Chip.** 1px border, mono caps at 11px, `aria-pressed` carries the selected state; selected
chips invert to ink and keep paper text on hover.

**Hover.** Interactive text goes to ink with an underline; blue and red never mark a hover
state, only a sign in the data. Functional text never drops below 11px.

**Buttons.** Two levels: ink-filled primary with a paper label, and outlined ghost. Both
mono uppercase with an arrow glyph inside the border.

## Do's and Don'ts

- Do put a plate number and a provenance caption on any image.
- Do let white space hold a section open; do not fill it with a card.
- Do keep the blue/red reserved for data signs.
- Do set every label in mono uppercase and every sentence in Spectral.
- Don't introduce a third face, a shadow, a gradient, a rounded corner or a second accent.
- Don't uppercase an abstract, a title or a sentence.
- Don't use colour to mean "interactive"; use the rule weight and the arrow.
- Don't centre-align body copy or section headings.
- Don't add a dark theme by inverting the tokens: the world is paper, and a night edition
  would need its own palette, not a flip.
## Warm ground and the corona plate

Added 2026-11-05 at the owner's request ("现在网页背景整体都是白色，比较朴素了").

- The ground is **warm paper** (`#f4eee3`), not white, and carries a fixed
  0.42-opacity `feTurbulence` grain overlay at `z-index: 40`, `mix-blend-mode:
  multiply`, `pointer-events: none`. The grain is the difference between a
  screen and a sheet; it must stay below the threshold where text looks dirty.
- The hero photograph **bleeds to the window edge** at ≥1000px. The overhang is
  `calc(-1 * (var(--gutter) + max(0px, (100vw - var(--sbw) - var(--wrap)) / 2)))`;
  `--sbw` is published by `assets/js/site.js` because `100vw` includes the
  scrollbar and without it the bleed overshoots and creates horizontal scroll.
- **Plate III, the corona plate**, sits between §02 and §03: a full-bleed
  `#0a0b0d` band, artwork `assets/img/field-lines.svg` (procedural: arched
  field lines standing on a limb, generated by `data/_tmp/field.mjs`, no
  external image model), a left-to-right scrim
  `rgba(6,7,9,.9) → transparent` so the caption holds contrast while the loops
  stay visible on the right, and a mono caption that says **schematic, not an
  observation**. The plate is the page's only dark surface; keep it that way.
- The caption must never imply the loops are measured data. If the drawing is
  ever replaced by a real extrapolation, the word "schematic" comes out and the
  provenance line goes in.
