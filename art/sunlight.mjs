/**
 * Solar-field light: the homepage backdrop.
 *
 * The page is lit from the upper right: a soft solar disk whose centre sits
 * outside the canvas, faint field lines rising from its limb in the two
 * polarities of a magnetogram, and a couple of sunspot cores near the edge of
 * the frame. Nothing here is an observation — it is a plate drawn from the
 * geometry of the thing the site is about.
 *
 *   node art/sunlight.mjs
 *
 * Writes assets/img/hero-field.svg
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(here, '..', 'assets', 'img', 'hero-field.svg');

const W = 1800;
const H = 1200;
const CX = 1520;
const CY = -260;
const R = 1180;

const INK = '#171310';
const BLUE = '#234a78';
const RED = '#98291f';
const PAPER = '#f4eee3';

function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(4242);
const rnd = (a, b) => a + rand() * (b - a);

/* Field lines: loops that rise from the limb and come back, drawn as cubic
   arcs so the density gathers where the field is strong. */
let loops = '';
for (let i = 0; i < 34; i += 1) {
  const a0 = rnd(-0.42, 0.62); // angle on the limb, radians, measured from -y
  const p0 = [CX + Math.sin(a0) * R, CY + Math.cos(a0) * R];
  const h = rnd(90, 330); // how far the loop reaches
  const w = rnd(60, 200);
  const lean = rnd(-0.5, 0.5);
  const p1 = [p0[0] - w * (1 + lean), p0[1] - h * 0.85];
  const p2 = [p0[0] + w * (1 - lean), p0[1] - h * 0.9];
  const p3 = [p0[0] + rnd(20, 90), p0[1] - rnd(-10, 12)];
  const colour = rand() < 0.5 ? BLUE : RED;
  loops += `<path d="M${p0[0].toFixed(0)} ${p0[1].toFixed(0)}C${p1[0].toFixed(0)} ${p1[1].toFixed(0)} ${p2[0].toFixed(0)} ${p2[1].toFixed(0)} ${p3[0].toFixed(0)} ${p3[1].toFixed(0)}" stroke="${colour}" stroke-opacity="${rnd(0.1, 0.26).toFixed(2)}" stroke-width="${rnd(0.8, 1.5).toFixed(1)}" fill="none"/>`;
}

/* Sunspots: a dark umbra with a softer penumbra, sitting near the limb where
   the frame can still see them. */
let spots = '';
const spotsAt = [
  [1180, 250, 46],
  [1330, 330, 30],
  [1010, 120, 26],
];
for (const [x, y, r] of spotsAt) {
  spots += `<circle cx="${x}" cy="${y}" r="${r * 2.3}" fill="${INK}" opacity="0.05"/>`;
  spots += `<circle cx="${x}" cy="${y}" r="${r * 1.45}" fill="${INK}" opacity="0.07"/>`;
  spots += `<circle cx="${x}" cy="${y}" r="${r * 0.62}" fill="${INK}" opacity="0.13"/>`;
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" aria-hidden="true">
<defs>
  <radialGradient id="disc" cx="${CX}" cy="${CY}" r="${R}" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="#fffaf0" stop-opacity="0.95"/>
    <stop offset="0.55" stop-color="#fdf3e1" stop-opacity="0.8"/>
    <stop offset="0.86" stop-color="#f8e7cd" stop-opacity="0.55"/>
    <stop offset="0.96" stop-color="#efd9bb" stop-opacity="0.25"/>
    <stop offset="1" stop-color="${PAPER}" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="glow" cx="${CX}" cy="${CY}" r="${R * 1.9}" gradientUnits="userSpaceOnUse">
    <stop offset="0.52" stop-color="#fff6e6" stop-opacity="0.55"/>
    <stop offset="0.78" stop-color="#fff6e6" stop-opacity="0.18"/>
    <stop offset="1" stop-color="#fff6e6" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#000" stop-opacity="1"/>
    <stop offset="0.72" stop-color="#000" stop-opacity="0.55"/>
    <stop offset="1" stop-color="#000" stop-opacity="0"/>
  </linearGradient>
  <mask id="bottomfade"><rect x="0" y="0" width="${W}" height="${H}" fill="url(#fade)"/></mask>
</defs>
<g mask="url(#bottomfade)">
  <circle cx="${CX}" cy="${CY}" r="${R * 1.9}" fill="url(#glow)"/>
  <circle cx="${CX}" cy="${CY}" r="${R}" fill="url(#disc)"/>
  <circle cx="${CX}" cy="${CY}" r="${R - 1}" fill="none" stroke="${INK}" stroke-opacity="0.08" stroke-width="1.4"/>
  <circle cx="${CX}" cy="${CY}" r="${R - 26}" fill="none" stroke="${INK}" stroke-opacity="0.04" stroke-width="1"/>
  ${spots}
  ${loops}
</g>
</svg>`;

fs.writeFileSync(OUT, svg, 'utf8');
console.log(`${path.relative(process.cwd(), OUT)} — ${(fs.statSync(OUT).size / 1024).toFixed(1)} KB`);
