/**
 * Solar-field plate: the background artwork for the homepage.
 *
 * Drawn from the physics it is meant to evoke — a spectropolarimetric
 * magnetogram (blue and red are the two signs of the line-of-sight field), the
 * limb of the solar disk with a plate scale, and a Stokes V profile under a
 * spectral line. No raster, no text, deterministic (fixed seed), so the page
 * never shifts under the owner's feet.
 *
 *   node art/magnetogram.mjs
 *
 * Writes art/solar-field.svg (the hero plate) and art/field-tile.svg (a small
 * seamless speckle used as the page-wide paper stock).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));

const BLUE = '#234a78';
const RED = '#98291f';
const INK = '#171310';

function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ================================================================ the plate */
const W = 2000;
const H = 1200;
const rand = mulberry32(20260105);
const rnd = (a, b) => a + rand() * (b - a);
const gauss = () => {
  let u = 0;
  let v = 0;
  while (u === 0) u = rand();
  while (v === 0) v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};

// Centre deliberately outside the canvas: only a broad arc of the disk shows,
// sweeping across the right half so the type column stays quiet.
const CX = 1450;
const CY = -540;
const R = 1420;

const inside = (x, y, pad = 0) => Math.hypot(x - CX, y - CY) < R - pad;

const buckets = new Map();
function mark(x, y, len, ang, colour, opacity) {
  const key = `${colour}|${opacity}`;
  if (!buckets.has(key)) buckets.set(key, []);
  const dx = (Math.cos(ang) * len) / 2;
  const dy = (Math.sin(ang) * len) / 2;
  buckets.get(key).push(`${(x - dx).toFixed(1)} ${(y - dy).toFixed(1)}L${(x + dx).toFixed(1)} ${(y + dy).toFixed(1)}`);
}

// Quiet Sun: salt and pepper. Density is high enough to read as a plate, not
// as dust, but every mark is faint and small.
for (let i = 0; i < 6000; i += 1) {
  const x = rnd(-40, W + 20);
  const y = rnd(-40, H + 20);
  if (!inside(x, y, 4)) continue;
  const colour = rand() < 0.5 ? BLUE : RED;
  const len = rnd(2.4, 5.6);
  mark(x, y, len, rnd(0, Math.PI), colour, rand() < 0.7 ? 0.2 : 0.32);
}

// Active regions: bipolar pairs, marks leaning across the polarity axis the way
// fibrils lie along the loops.
const regions = [
  [520, 300, 0.45],
  [980, 150, 0.7],
  [1390, 330, 0.2],
  [1620, 90, 1.9],
  [1770, 430, 2.4],
  [1180, 620, 0.9],
  [700, 640, 1.2],
  [260, 640, 2.1],
];
for (const [rx, ry, pa] of regions) {
  const sep = rnd(90, 150);
  const span = rnd(52, 88);
  for (let s = 0; s < 2; s += 1) {
    const polarity = s === 0 ? BLUE : RED;
    const ox = Math.cos(pa) * sep * (s === 0 ? -1 : 1);
    const oy = Math.sin(pa) * sep * (s === 0 ? -1 : 1);
    for (let i = 0; i < 560; i += 1) {
      const gx = gauss() * span + ox;
      const gy = gauss() * span * 0.82 + oy;
      const x = rx + gx - gy * 0.35;
      const y = ry + gx * 0.35 + gy;
      if (!inside(x, y, 6)) continue;
      const d = Math.hypot(gx, gy) / span;
      const len = rnd(4.2, 9.5) * (1.15 - Math.min(d, 1) * 0.35);
      const ang = pa + Math.PI / 2 + gauss() * 0.32;
      mark(x, y, len, ang, polarity, d < 0.55 ? 0.62 : 0.48);
    }
  }
}

// Polar-cap band near the top of the disk: one polarity dominates.
for (let i = 0; i < 2600; i += 1) {
  const y = rnd(-40, 150);
  const x = rnd(0, W);
  if (!inside(x, y, 10)) continue;
  mark(x, y, rnd(1.6, 3.2), Math.PI / 2 + gauss() * 0.5, BLUE, rand() < 0.7 ? 0.1 : 0.17);
}

/* -------------------------------------------------------------- assembly --- */
const groups = [];
for (const [key, segs] of buckets) {
  const [colour, op] = key.split('|');
  groups.push(
    `<path d="M${segs.join('M')}" stroke="${colour}" stroke-opacity="${op}" stroke-width="1.25" stroke-linecap="round" fill="none"/>`
  );
}

const plate = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Schematic magnetogram of the solar disk with a spectral line profile and its Stokes V signature">
<defs>
  <clipPath id="disk"><circle cx="${CX}" cy="${CY}" r="${R - 2}"/></clipPath>
  <linearGradient id="leftfade" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#fff" stop-opacity="0.15"/>
    <stop offset="0.42" stop-color="#fff" stop-opacity="0.85"/>
    <stop offset="1" stop-color="#fff" stop-opacity="1"/>
  </linearGradient>
  <mask id="fade"><rect x="0" y="0" width="${W}" height="${H}" fill="url(#leftfade)"/></mask>
</defs>
<g mask="url(#fade)">
  <g clip-path="url(#disk)">
${groups.join('\n')}
  </g>
</g>
</svg>`;

/* ================================================================ the tile */
// A 320 px square of quiet-Sun speckle, used as the page-wide paper stock.
const rand2 = mulberry32(77113);
const rnd2 = (a, b) => a + rand2() * (b - a);
let tilePaths = { blue: [], red: [] };
for (let i = 0; i < 420; i += 1) {
  const x = +rnd2(2, 318).toFixed(1);
  const y = +rnd2(2, 318).toFixed(1);
  const a = rnd2(0, Math.PI);
  const l = rnd2(0.9, 2.2);
  const dx = (Math.cos(a) * l) / 2;
  const dy = (Math.sin(a) * l) / 2;
  const seg = `M${(x - dx).toFixed(1)} ${(y - dy).toFixed(1)}L${(x + dx).toFixed(1)} ${(y + dy).toFixed(1)}`;
  (rand2() < 0.5 ? tilePaths.blue : tilePaths.red).push(seg);
}
const tile = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320" width="320" height="320">
<g stroke-width="1.25" stroke-linecap="round" fill="none">
  <path d="${tilePaths.blue.join('')}" stroke="${BLUE}" stroke-opacity="0.16"/>
  <path d="${tilePaths.red.join('')}" stroke="${RED}" stroke-opacity="0.16"/>
</g>
</svg>`;

fs.writeFileSync(path.join(here, 'solar-field.svg'), plate, 'utf8');
fs.writeFileSync(path.join(here, 'field-tile.svg'), tile, 'utf8');

for (const f of ['solar-field.svg', 'field-tile.svg']) {
  const p = path.join(here, f);
  const bytes = fs.statSync(p).size;
  const els = (fs.readFileSync(p, 'utf8').match(/<(path|circle|rect|g|defs|mask|clipPath|radialGradient|linearGradient|stop)\b/g) || []).length;
  console.log(`${f}: ${(bytes / 1024).toFixed(1)} KB, ${els} elements`);
}
console.log(`marks: ${[...buckets.values()].reduce((n, a) => n + a.length, 0)}`);
