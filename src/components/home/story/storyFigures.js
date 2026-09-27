import { gsap, gsapEnabled } from '../../../utilities/gsapSetup';

/**
 * The four case figures on the story stage, and the scrubbed timelines that
 * play them.
 *
 * Every figure is drawn in its FINAL state - the checked output - so with
 * motion off, or before a timeline exists, the page shows the answer. A
 * timeline then runs from progress 0 (raw input) to 1 (that final state) as
 * the reader scrolls a pinned chapter.
 *
 * The figures are SVG markup built from strings, because the timelines address
 * their parts by class and there are hundreds of them. Every value that enters
 * the markup comes from the site's own data and goes through `esc`.
 *
 * Numbers are real and come from data, never retyped: the timetable sessions
 * are the ones in the timetable-builder screenshot, the fraud figures are
 * data/workedExample.js (itself checked against the analysis artifact by a
 * test), and the agent graph follows the idea-sprint case study's phase table.
 */

export const C = {
  night: '#0B1220', night2: '#131C2E', rule: '#27334A', moon: '#E6EAF0', moon2: '#A3AEBF', white: '#F7F9FB',
  hl: '#FFD23F', red: '#D7263D', redLight: '#FF6B7D', paper: '#E9ECEF', paperHi: '#F3F5F7', ink: '#0F1720',
  graphite: '#4A5563', paperRule: '#C3CAD2',
};

const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const nf = new Intl.NumberFormat('en-US');
export const money = (v) => `$${nf.format(Math.round(v))}`;
const pad2 = (n) => (n < 10 ? '0' : '') + n;
const $$ = (s, r) => Array.prototype.slice.call(r.querySelectorAll(s));

const tx = (x, y, s, o = {}) =>
  `<text x="${x}" y="${y}" font-size="${o.size || 11}" fill="${o.fill || C.moon2}"` +
  (o.anchor ? ` text-anchor="${o.anchor}"` : '') +
  (o.weight ? ` font-weight="${o.weight}"` : '') +
  (o.cls ? ` class="${o.cls}"` : '') +
  (o.ls ? ` letter-spacing="${o.ls}"` : '') +
  (o.op != null ? ` opacity="${o.op}"` : '') +
  `>${esc(s)}</text>`;

const VB = 'viewBox="0 0 640 520" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false"';
const svg = (g) => `<svg ${VB}>${g}</svg>`;

/* ------------------------------------------------------------------ */
/* 1. timetable-builder: sessions taken from the real screenshot        */
/* ------------------------------------------------------------------ */
const SESS = [
  { code: 'COMP 3603', type: 'Tutorial', day: 1, s: 8, e: 9, room: 'FST CSL 2' },
  { code: 'COMP 3602', type: 'Lecture', day: 1, s: 9, e: 10, room: 'FST 113' },
  { code: 'INFO 3600', type: 'Lab', day: 1, s: 10, e: 12, room: 'FST CSL1' },
  { code: 'COMP 3605', type: 'Lecture', day: 0, s: 11, e: 13, room: 'TCB 22' },
  { code: 'COMP 3603', type: 'Lecture', day: 1, s: 12, e: 13, room: 'JFK LT' },
  { code: 'INFO 3600', type: 'Lecture', day: 3, s: 8, e: 10, room: 'FST C1' },
  { code: 'COMP 3602', type: 'Tutorial', day: 2, s: 14, e: 15, room: 'TCB 33' },
];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const G1 = { x: 90, cw: 104, y: 80, rh: 50 };
/** The one session confirmed by a single PDF - about 7% of sessions are. */
const FLAG_I = 6;
const sessLine = (s) => `${s.code} ${DAYS[s.day]} ${pad2(s.s)}:00-${pad2(s.e)}:00 ${s.room}`;
const blockBox = (s) => ({ x: G1.x + s.day * G1.cw + 3, y: G1.y + (s.s - 8) * G1.rh + 2, w: G1.cw - 6, h: (s.e - s.s) * G1.rh - 4 });

const vizTimetable = ({ pdfCount }) => {
  let g = '<g class="c1-grid">';
  for (let i = 0; i <= 8; i += 1) {
    const yy = G1.y + i * G1.rh;
    g += `<line x1="${G1.x}" x2="${G1.x + 5 * G1.cw}" y1="${yy}" y2="${yy}" stroke="${C.rule}"/>` + tx(G1.x - 10, yy + 4, `${pad2(8 + i)}:00`, { size: 10, anchor: 'end' });
  }
  for (let i = 0; i <= 5; i += 1) g += `<line x1="${G1.x + i * G1.cw}" x2="${G1.x + i * G1.cw}" y1="${G1.y}" y2="${G1.y + 8 * G1.rh}" stroke="${C.rule}"/>`;
  DAYS.forEach((d, k) => { g += tx(G1.x + k * G1.cw + G1.cw / 2, 66, d, { size: 11.5, anchor: 'middle', fill: C.moon }); });
  g += '</g>';
  g += '<g class="c1-pdf" opacity="0">' +
    '<rect x="52" y="62" width="250" height="330" fill="#B9C2CD"/><rect x="46" y="56" width="250" height="330" fill="#D3D9E0"/>' +
    `<rect x="40" y="50" width="250" height="330" fill="${C.paperHi}"/>` +
    '<rect x="56" y="68" width="130" height="8" fill="#9AA4B1"/><rect x="56" y="84" width="84" height="5" fill="#C3CAD2"/>' +
    tx(274, 368, 'p. 1', { size: 10, fill: C.graphite, anchor: 'end' }) +
    tx(171, 418, `one of about ${pdfCount} PDFs`, { size: 11.5, anchor: 'middle', fill: C.moon }) + '</g>';
  g += `<g class="c1-table" opacity="0">${tx(324, 88, 'current_sessions', { size: 11.5, fill: C.hl, weight: 600 })}<line x1="318" x2="620" y1="96" y2="96" stroke="${C.moon2}"/></g>`;
  g += '<g class="c1-blocks">';
  SESS.forEach((s) => {
    const b = blockBox(s);
    g += `<g class="c1-blk"><rect class="c1-blk-rect" x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" fill="${C.paperHi}" stroke="${C.paperRule}"/>` +
      `<g class="c1-blk-t">${tx(b.x + 7, b.y + 16, s.code, { size: 11, fill: C.ink, weight: 600 })}${tx(b.x + 7, b.y + 30, s.type, { size: 9.5, fill: C.graphite })}</g></g>`;
  });
  g += '</g><g class="c1-lines">';
  SESS.forEach((s, k) => {
    g += `<g class="c1-line" opacity="0"><rect class="c1-rowbg" x="-6" y="${104 + k * 30}" width="226" height="24" fill="${C.paperHi}" stroke="${C.paperRule}" opacity="0"/>` +
      `${tx(0, 120 + k * 30, sessLine(s), { size: 10, fill: C.ink })}</g>`;
  });
  g += '</g>';
  SESS.forEach((s, k) => {
    if (k === FLAG_I) return;
    const b = blockBox(s);
    const cx = b.x + b.w - 11;
    const cy = b.y + 11;
    g += `<g class="c1-tick"><circle cx="${cx}" cy="${cy}" r="7" fill="${C.hl}"/><path d="M${cx - 3.5} ${cy} l2.5 2.6 l4.5 -5" fill="none" stroke="${C.ink}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></g>`;
  });
  const fb = blockBox(SESS[FLAG_I]);
  g += `<g class="c1-flag"><rect x="${fb.x - 1}" y="${fb.y - 1}" width="${fb.w + 2}" height="${fb.h + 2}" fill="none" stroke="${C.red}" stroke-width="2.5"/>` +
    `${tx(fb.x + fb.w - 6, fb.y + 30, '1 PDF', { size: 9.5, fill: '#B01E33', anchor: 'end', weight: 600 })}</g>`;
  g += '<g transform="translate(516 432) rotate(-7)"><g class="c1-stamp">' +
    `<rect x="-94" y="-30" width="188" height="60" rx="3" fill="rgba(11,18,32,.9)" stroke="${C.hl}" stroke-width="2.5"/>` +
    `<rect x="-89" y="-25" width="178" height="50" rx="2" fill="none" stroke="${C.hl}" stroke-width="1" opacity=".55"/>` +
    `<path d="M-74 -1 l7 7 l13 -15" fill="none" stroke="${C.hl}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>` +
    tx(-44, -4, 'CONFIRMED BY', { size: 12.5, fill: C.hl, weight: 600, ls: 1.5 }) +
    tx(-44, 13, '2+ PDFS', { size: 12.5, fill: C.hl, weight: 600, ls: 1.5 }) + '</g></g>';
  return svg(g);
};

/* ------------------------------------------------------------------ */
/* 2. fraud-detection: real workedExample numbers, one linear scale     */
/* ------------------------------------------------------------------ */
const G2 = { cx: 160, cy: 210, r: 118 };
const ARC_D = `M ${G2.cx - G2.r} ${G2.cy} A ${G2.r} ${G2.r} 0 0 1 ${G2.cx + G2.r} ${G2.cy}`;
const ARC_L = Math.PI * G2.r;
const BAR = { base: 420, hmax: 280, x0: 380, step: 95 };

const vizFraud = ({ accPct, caught, frauds, datasets }) => {
  let g = '<g class="c2-gauge">' +
    `<path d="${ARC_D}" fill="none" stroke="${C.rule}" stroke-width="16"/>` +
    `<path class="c2-arc" d="${ARC_D}" fill="none" stroke="${C.moon}" stroke-width="16" stroke-dasharray="${ARC_L.toFixed(2)}" stroke-dashoffset="${(ARC_L * (1 - accPct / 100)).toFixed(2)}"/>` +
    tx(G2.cx - G2.r, G2.cy + 22, '0%', { size: 10, anchor: 'middle' }) + tx(G2.cx + G2.r, G2.cy + 22, '100%', { size: 10, anchor: 'middle' }) +
    `<text class="c2-num serif" x="${G2.cx}" y="206" font-size="50" text-anchor="middle" fill="${C.white}">${accPct.toFixed(2)}%</text>` +
    tx(G2.cx, 232, 'accuracy', { size: 11, anchor: 'middle' });
  for (let i = 0; i < frauds; i += 1) {
    const c = i % 14;
    const r = Math.floor(i / 14);
    g += `<circle class="c2-dot" cx="${62.5 + c * 15}" cy="${264 + r * 14}" r="4" fill="none" stroke="${C.redLight}" stroke-width="1.4"/>`;
  }
  const rows = Math.ceil(frauds / 14);
  g += tx(G2.cx, 264 + rows * 14 + 16, `caught ${caught} of ${frauds} frauds`, { size: 13, anchor: 'middle', fill: C.redLight, weight: 600, cls: 'c2-caught' });
  g += `<g transform="translate(${G2.cx} 132) rotate(-9)"><g class="c2-stamp">` +
    `<rect x="-98" y="-23" width="196" height="46" rx="3" fill="rgba(11,18,32,.78)" stroke="${C.red}" stroke-width="3"/>` +
    `${tx(0, 8, 'MISLEADING', { size: 21, anchor: 'middle', fill: C.redLight, weight: 600, ls: 4 })}</g></g>`;
  g += '</g>';
  const max = Math.max(...datasets.map((d) => d.doingNothing));
  const k = BAR.hmax / max;
  g += `<g class="c2-bars-head">${tx(326, 62, 'Modelled loss, one linear scale', { size: 11, fill: C.moon })}` +
    `<rect x="326" y="78" width="14" height="10" fill="rgba(215,38,61,.15)" stroke="${C.red}" stroke-dasharray="3 2"/>${tx(346, 87, 'no model', { size: 10.5 })}` +
    `<rect x="430" y="78" width="14" height="10" fill="${C.hl}"/>${tx(450, 87, 'cost-chosen threshold', { size: 10.5 })}` +
    `<line x1="326" x2="620" y1="${BAR.base + 0.5}" y2="${BAR.base + 0.5}" stroke="${C.moon2}"/></g>`;
  datasets.forEach((d, j) => {
    const cx = BAR.x0 + j * BAR.step;
    const hN = d.doingNothing * k;
    const hT = d.atThreshold * k;
    g += `<rect class="c2-ghost" x="${cx - 26}" y="${(BAR.base - hN).toFixed(2)}" width="52" height="${hN.toFixed(2)}" fill="rgba(215,38,61,.14)" stroke="${C.red}" stroke-width="1.5" stroke-dasharray="4 3"/>`;
    g += `<rect class="c2-solid" data-ratio="${(hN / hT).toFixed(4)}" x="${cx - 16}" y="${(BAR.base - hT).toFixed(2)}" width="32" height="${hT.toFixed(2)}" fill="${C.hl}"/>`;
    g += `<g class="c2-lab">${tx(cx, 440, d.label, { size: 11, anchor: 'middle', fill: C.moon })}${tx(cx, 457, `was ${money(d.doingNothing)}`, { size: 11, anchor: 'middle', fill: C.redLight })}</g>`;
    g += `<text class="c2-now" data-from="${d.doingNothing}" data-to="${d.atThreshold}" x="${cx}" y="474" font-size="11.5" font-weight="600" text-anchor="middle" fill="${C.hl}">now ${money(d.atThreshold)}</text>`;
    g += `<g class="c2-red">${tx(cx, 491, `t = ${d.threshold}`, { size: 10.5, anchor: 'middle' })}${tx(cx, 507, `−${d.reductionPct}%`, { size: 11, anchor: 'middle', fill: C.hl, weight: 600 })}</g>`;
  });
  return svg(g);
};

/* ------------------------------------------------------------------ */
/* 3. idea-sprint: the case study's phase table, a skeptic, an ADR      */
/* ------------------------------------------------------------------ */
// Project Refiner -> Product Owner, then five architecture and four contract
// specialists fanned out in parallel - eleven in all. The skeptic is not one
// of them: it is an auxiliary agent that argues against the Solution
// Architect's (index 3) recommendation, so it is drawn apart, as node 11.
const N3 = [[70, 210], [70, 330], [190, 110], [190, 190], [190, 270], [190, 350], [190, 430], [310, 130], [310, 220], [310, 310], [310, 400], [262, 262]];
const PH = [[0, 1], [2, 3, 4, 5, 6], [7, 8, 9, 10]];
const SKEP = 11;
const E3 = [[0, 1, 'p1'], [1, 2, 'fan'], [1, 3, 'fan'], [1, 4, 'fan'], [1, 5, 'fan'], [1, 6, 'fan'], [2, 7, 'p23'], [3, 8, 'p23'], [5, 9, 'p23'], [6, 10, 'p23']];
const trimSeg = (x1, y1, x2, y2, a, b) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const L = Math.sqrt(dx * dx + dy * dy);
  const ux = dx / L;
  const uy = dy / L;
  return [x1 + ux * a, y1 + uy * a, x2 - ux * b, y2 - uy * b];
};
const lineEl = (s, set, stroke, w, op) =>
  `<line class="c3-edge" data-set="${set}" x1="${s[0].toFixed(1)}" y1="${s[1].toFixed(1)}" x2="${s[2].toFixed(1)}" y2="${s[3].toFixed(1)}" stroke="${stroke}" stroke-width="${w}"${op ? ` opacity="${op}"` : ''}/>`;

const vizAgents = () => {
  let g = '';
  ['foundation', 'architecture', 'contracts'].forEach((nm, k) => {
    const x = N3[PH[k][0]][0];
    g += `<g class="c3-phase">${tx(x, 60, `phase ${k + 1}`, { size: 10.5, anchor: 'middle', fill: C.moon, weight: 600 })}${tx(x, 76, nm, { size: 10, anchor: 'middle' })}</g>`;
  });
  g += tx(616, 60, `${N3.length - 1} agents + skeptic`, { size: 10.5, anchor: 'end', fill: C.moon });
  E3.forEach((e) => {
    const a = N3[e[0]];
    const b = N3[e[1]];
    g += lineEl(trimSeg(a[0], a[1], b[0], b[1], 15, 15), e[2], C.moon2, 1.3, 0.8);
  });
  PH[2].forEach((n, k) => {
    const a = N3[n];
    g += lineEl(trimSeg(a[0], a[1], 440, 170 + k * 60, 15, 0), 'adr', C.hl, 1.2, 0.7);
  });
  g += `<path class="c3-obj" d="M 256 250 C 250 226, 230 206, 204 196" fill="none" stroke="${C.red}" stroke-width="2"/>` +
    `<path class="c3-objhead" d="M204 196 L213.2 193.6 L210.6 201.2 Z" fill="${C.red}"/>` +
    tx(268, 236, 'objection', { size: 10.5, fill: C.redLight, weight: 600, cls: 'c3-objlab' });
  N3.forEach((n, k) => {
    const sk = k === SKEP;
    g += `<g class="c3-node"><circle class="c3-ring" cx="${n[0]}" cy="${n[1]}" r="13" fill="${sk ? '#3A1520' : C.night2}" stroke="${sk ? C.red : C.hl}" stroke-width="2"/>` +
      `<circle class="c3-core" cx="${n[0]}" cy="${n[1]}" r="4" fill="${sk ? C.redLight : C.moon}"/></g>`;
  });
  g += `<g class="c3-lab">${tx(190, 226, 'recommender', { size: 10.5, anchor: 'middle', fill: C.moon })}${tx(262, 294, 'skeptic', { size: 10.5, anchor: 'middle', fill: C.redLight, weight: 600 })}</g>`;
  g += `<g class="c3-sweep" opacity="0"><rect x="-4" y="92" width="8" height="356" fill="${C.hl}" opacity=".12"/><line x1="0" x2="0" y1="92" y2="448" stroke="${C.hl}" stroke-width="2"/>${tx(6, 104, 'validator', { size: 10.5, fill: C.hl, weight: 600 })}</g>`;
  g += `<g class="c3-doc"><rect x="440" y="100" width="176" height="300" fill="${C.paperHi}" stroke="${C.paperRule}"/>` +
    `<text class="serif" x="458" y="142" font-size="30" fill="${C.ink}">ADR</text>${tx(458, 160, 'decision record', { size: 9.5, fill: C.graphite })}</g>`;
  ['context', 'decision', 'consequences'].forEach((s, k) => {
    const y0 = 190 + k * 66;
    const w = [[138, 116, 82], [120, 140, 66], [142, 98, 124]][k];
    g += `<g class="c3-part">${tx(458, y0, s, { size: 9.5, fill: C.graphite, weight: 600 })}${w.map((ww, j) => `<rect x="458" y="${y0 + 9 + j * 11}" width="${ww}" height="5" rx="1" fill="#AEB7C2"/>`).join('')}</g>`;
  });
  g += '<g transform="translate(528 452) rotate(-5)"><g class="c3-approve">' +
    `<rect x="-86" y="-20" width="172" height="40" rx="3" fill="rgba(11,18,32,.92)" stroke="${C.hl}" stroke-width="2.5"/>` +
    `<path d="M-72 0 l6 6 l11 -12" fill="none" stroke="${C.hl}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>` +
    `${tx(-48, 5, 'APPROVED BY YOU', { size: 12.5, fill: C.hl, weight: 600, ls: 1 })}</g></g>`;
  return svg(g);
};

/* ------------------------------------------------------------------ */
/* 4. link-tracker: tabs sorted into lanes, the queue shrinks, the app  */
/* ------------------------------------------------------------------ */
const LANES = [
  { name: 'Queue', y: 36, color: C.hl, text: C.hl },
  { name: 'Reference', y: 72, color: C.moon2, text: C.moon },
  { name: 'Drop', y: 108, color: C.red, text: C.redLight },
];
const TAB_H = 20;
const SLOT0 = 132;
const SLOT = 52;
const TAB_PATH = 'M0 20 L0 6 Q0 0 6 0 L40 0 Q46 0 46 6 L46 20 Z';
const TABS = (() => {
  const out = [];
  let seed = 11;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  for (let i = 0; i < 9; i += 1) out.push({ lane: 0, mid: i, fin: i < 6 ? i : i - 6, out: i < 6 });
  for (let i = 0; i < 5; i += 1) out.push({ lane: 1, mid: i, fin: i, out: false });
  for (let i = 0; i < 7; i += 1) out.push({ lane: 2, mid: i, fin: i, out: true });
  out.forEach((tb) => {
    tb.cx = 30 + rnd() * 540;
    tb.cy = -126 + rnd() * 320;
    tb.rot = -28 + rnd() * 56;
  });
  return out;
})();
const QUEUE_START = TABS.filter((t) => t.lane === 0).length;
const QUEUE_END = TABS.filter((t) => t.lane === 0 && !t.out).length;

const vizTabs = ({ tabCount, image, imageName }) => {
  let g = '<g class="c4-lanes">';
  LANES.forEach((l) => {
    g += `<rect x="122" y="${l.y - 15}" width="498" height="30" rx="3" fill="rgba(230,234,240,.03)" stroke="${C.rule}"/>${tx(24, l.y + 4, l.name, { size: 12, fill: l.text, weight: 600 })}`;
  });
  g += `<text class="c4-count" x="104" y="40" font-size="12" text-anchor="end" font-weight="600" fill="${C.hl}">${QUEUE_END}</text>`;
  g += `<line class="c4-strike" x1="122" x2="620" y1="108" y2="108" stroke="${C.red}" stroke-width="2" opacity="0"/>`;
  g += '</g><g class="c4-tabs">';
  TABS.forEach((tb) => {
    const fx = SLOT0 + tb.fin * SLOT;
    const fy = LANES[tb.lane].y - TAB_H / 2;
    g += `<g class="c4-tab" transform="translate(${fx} ${fy})"${tb.out ? ' opacity="0"' : ''}>` +
      `<path class="c4-shape" d="${TAB_PATH}" fill="#1E2A3F" stroke="${LANES[tb.lane].color}" stroke-width="1.4"/>` +
      `<circle cx="9" cy="10" r="3" fill="${C.moon2}"/><rect x="16" y="8" width="23" height="4" rx="2" fill="#56657E"/></g>`;
  });
  g += `</g>${tx(320, 504, `${tabCount} tabs open`, { size: 13, anchor: 'middle', fill: C.moon, weight: 600, cls: 'c4-cloudlab', op: 0 })}`;
  return `${svg(g)}<div class="c4-shot"><img src="${esc(image)}" alt="Screenshot of the Link Tracker desktop app: the Queue view" loading="lazy" decoding="async"><span class="cap" aria-hidden="true">${esc(imageName)}</span></div>`;
};

/* ------------------------------------------------------------------ */
/* Scrubbed timelines: progress 0 = raw input, 1 = checked output       */
/* ------------------------------------------------------------------ */
const newTL = () => {
  // Timelines exist only when GSAP can run (never under Vitest) and the
  // caller has checked the visitor's motion preference.
  if (!gsapEnabled) return null;
  return gsap.timeline({ paused: true, defaults: { ease: 'power1.inOut', duration: 0.1 } });
};
const counter = (tl, el, from, to, pos, dur, fmt) => {
  const o = { v: from };
  el.textContent = fmt(from);
  tl.fromTo(o, { v: from }, { v: to, duration: dur, ease: 'none', onUpdate: () => { el.textContent = fmt(o.v); } }, pos);
};
const lenOf = (el) => {
  try {
    return el.getTotalLength();
  } catch {
    return 400;
  }
};
const draw = (tl, els, pos, dur, stag) => {
  if (!els.length) return;
  els.forEach((el) => {
    const L = lenOf(el);
    gsap.set(el, { strokeDasharray: `${L} ${L}` });
  });
  tl.fromTo(els, { strokeDashoffset: (i, el) => lenOf(el) }, { strokeDashoffset: 0, duration: dur, stagger: stag || 0 }, pos);
};

const tlTimetable = (fig) => {
  const q = (s) => $$(s, fig);
  const tl = newTL();
  if (!tl) return null;
  const lines = q('.c1-line');
  tl.fromTo(q('.c1-pdf'), { opacity: 1 }, { opacity: 0, duration: 0.1 }, 0.28);
  tl.fromTo(lines, { x: 56, y: 0, opacity: 1 }, { x: 56, y: -12, opacity: 1, duration: 0.07, stagger: 0.012 }, 0.02);
  tl.fromTo(q('.c1-rowbg'), { opacity: 0 }, { opacity: 1, duration: 0.05, stagger: 0.012 }, 0.02);
  tl.to(lines, { x: 330, y: 0, duration: 0.14, stagger: 0.012 }, 0.1);
  tl.fromTo(q('.c1-table'), { opacity: 0 }, { opacity: 1, duration: 0.08 }, 0.12);
  tl.to(q('.c1-table'), { opacity: 0, duration: 0.06 }, 0.44);
  tl.fromTo(q('.c1-grid'), { opacity: 0 }, { opacity: 1, duration: 0.12 }, 0.36);
  q('.c1-blk').forEach((blk, k) => {
    const b = blockBox(SESS[k]);
    const at = 0.4 + k * 0.022;
    tl.fromTo(blk, { x: 324 - b.x, y: 104 + k * 30 - b.y }, { x: 0, y: 0, duration: 0.2 }, at);
    tl.fromTo(blk, { opacity: 0 }, { opacity: 1, duration: 0.03 }, at);
    tl.fromTo(blk.querySelector('.c1-blk-rect'), { attr: { width: 226, height: 24 } }, { attr: { width: b.w, height: b.h }, duration: 0.2 }, at);
    tl.to(lines[k], { opacity: 0, duration: 0.035 }, at);
  });
  tl.fromTo(q('.c1-blk-t'), { opacity: 0 }, { opacity: 1, duration: 0.06, stagger: 0.01 }, 0.62);
  tl.fromTo(q('.c1-tick'), { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.06, stagger: 0.02, ease: 'back.out(2)' }, 0.74);
  tl.fromTo(q('.c1-flag'), { opacity: 0 }, { opacity: 1, duration: 0.06 }, 0.82);
  tl.fromTo(q('.c1-stamp'), { scale: 2.2, opacity: 0, transformOrigin: '50% 50%' }, { scale: 1, opacity: 1, duration: 0.1, ease: 'power3.in' }, 0.86);
  tl.to({}, { duration: 0.02 }, 0.98);
  return tl;
};

const tlFraud = (fig, { accPct }) => {
  const q = (s) => $$(s, fig);
  const tl = newTL();
  if (!tl) return null;
  const gauge = q('.c2-gauge')[0];
  gsap.set(gauge, { svgOrigin: `${G2.cx} ${G2.cy}` });
  tl.fromTo(q('.c2-arc'), { strokeDashoffset: ARC_L }, { strokeDashoffset: ARC_L * (1 - accPct / 100), duration: 0.2 }, 0);
  counter(tl, q('.c2-num')[0], 0, accPct, 0, 0.2, (v) => `${v.toFixed(2)}%`);
  tl.fromTo(q('.c2-dot'), { opacity: 0, scale: 0, transformOrigin: '50% 50%' }, { opacity: 1, scale: 1, duration: 0.05, stagger: 0.0013 }, 0.2);
  tl.fromTo(q('.c2-caught'), { opacity: 0 }, { opacity: 1, duration: 0.05 }, 0.3);
  tl.fromTo(q('.c2-stamp'), { scale: 2.4, opacity: 0, transformOrigin: '50% 50%' }, { scale: 1, opacity: 1, duration: 0.08, ease: 'power3.in' }, 0.41);
  tl.fromTo(gauge, { x: 160, y: 8, scale: 1.18 }, { x: 0, y: 0, scale: 1, duration: 0.14 }, 0.5);
  tl.fromTo(q('.c2-bars-head'), { opacity: 0 }, { opacity: 1, duration: 0.06 }, 0.58);
  tl.fromTo(q('.c2-ghost'), { scaleY: 0, transformOrigin: '50% 100%' }, { scaleY: 1, duration: 0.12, stagger: 0.015 }, 0.6);
  tl.fromTo(q('.c2-lab'), { opacity: 0 }, { opacity: 1, duration: 0.06, stagger: 0.015 }, 0.62);
  q('.c2-solid').forEach((r, j) => {
    const ratio = parseFloat(r.getAttribute('data-ratio')) || 1;
    tl.fromTo(r, { scaleY: 0, transformOrigin: '50% 100%' }, { scaleY: ratio, duration: 0.12 }, 0.6 + j * 0.015);
    tl.to(r, { scaleY: 1, duration: 0.18, ease: 'power2.in' }, 0.78 + j * 0.01);
  });
  q('.c2-now').forEach((el, j) => {
    tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.03 }, 0.75);
    counter(tl, el, +el.getAttribute('data-from'), +el.getAttribute('data-to'), 0.78 + j * 0.01, 0.18, (v) => `now ${money(v)}`);
  });
  tl.fromTo(q('.c2-red'), { opacity: 0 }, { opacity: 1, duration: 0.04 }, 0.94);
  tl.to({}, { duration: 0.02 }, 0.98);
  return tl;
};

const tlAgents = (fig) => {
  const q = (s) => $$(s, fig);
  const tl = newTL();
  if (!tl) return null;
  const nodes = q('.c3-node');
  const rings = q('.c3-ring');
  const phases = q('.c3-phase');
  const edges = q('.c3-edge');
  const edgeSet = (s) => edges.filter((e) => e.getAttribute('data-set') === s);
  const pick = (idx) => idx.map((k) => nodes[k]);
  const pop = { scale: 0, opacity: 0, transformOrigin: '50% 50%' };
  const popTo = { scale: 1, opacity: 1, duration: 0.05, stagger: 0.015, ease: 'back.out(2.2)' };
  rings.forEach((r, k) => {
    if (k === SKEP) return;
    tl.fromTo(r, { attr: { stroke: C.moon2 } }, { attr: { stroke: C.hl }, duration: 0.02 }, 0.56 + ((N3[k][0] - 36) / 308) * 0.12);
  });
  draw(tl, edgeSet('p1'), 0.02, 0.07, 0.03);
  tl.fromTo(phases[1], { opacity: 0 }, { opacity: 1, duration: 0.04 }, 0.1);
  tl.fromTo(pick(PH[1]), pop, popTo, 0.1);
  tl.fromTo(q('.c3-lab'), { opacity: 0 }, { opacity: 1, duration: 0.04 }, 0.15);
  draw(tl, edgeSet('fan'), 0.14, 0.08, 0.02);
  tl.fromTo(phases[2], { opacity: 0 }, { opacity: 1, duration: 0.04 }, 0.22);
  tl.fromTo(pick(PH[2]), pop, popTo, 0.22);
  draw(tl, edgeSet('p23'), 0.26, 0.07, 0.015);
  tl.fromTo(nodes[SKEP], pop, popTo, 0.34);
  tl.fromTo(rings[SKEP], { attr: { stroke: C.moon2, fill: C.night2 } }, { attr: { stroke: C.red, fill: '#3A1520' }, duration: 0.04 }, 0.38);
  tl.fromTo(nodes[SKEP].querySelector('.c3-core'), { attr: { fill: C.moon } }, { attr: { fill: C.redLight }, duration: 0.04 }, 0.38);
  tl.fromTo(nodes[SKEP], { scale: 1 }, { scale: 1.3, duration: 0.04, transformOrigin: '50% 50%', immediateRender: false }, 0.38);
  tl.to(nodes[SKEP], { scale: 1, duration: 0.05 }, 0.43);
  draw(tl, q('.c3-obj'), 0.44, 0.09);
  tl.fromTo(q('.c3-objhead, .c3-objlab'), { opacity: 0 }, { opacity: 1, duration: 0.04 }, 0.5);
  const sweep = q('.c3-sweep');
  tl.fromTo(sweep, { x: 36 }, { x: 344, duration: 0.12, ease: 'none' }, 0.56);
  tl.fromTo(sweep, { opacity: 0 }, { opacity: 1, duration: 0.015 }, 0.56);
  tl.to(sweep, { opacity: 0, duration: 0.02 }, 0.68);
  tl.fromTo(q('.c3-approve'), { scale: 2.2, opacity: 0, transformOrigin: '50% 50%' }, { scale: 1, opacity: 1, duration: 0.07, ease: 'power3.in' }, 0.7);
  tl.fromTo(q('.c3-doc'), { scaleY: 0.02, opacity: 0, transformOrigin: '50% 0%' }, { scaleY: 1, opacity: 1, duration: 0.07 }, 0.79);
  tl.fromTo(q('.c3-part'), { x: -26, opacity: 0 }, { x: 0, opacity: 1, duration: 0.06, stagger: 0.035 }, 0.85);
  draw(tl, edgeSet('adr'), 0.8, 0.08, 0.015);
  tl.to({}, { duration: 0.02 }, 0.98);
  return tl;
};

const tlTabs = (fig) => {
  const q = (s) => $$(s, fig);
  const tl = newTL();
  if (!tl) return null;
  const lanes = q('.c4-lanes');
  const tabs = q('.c4-tab');
  const shapes = q('.c4-shape');
  tl.fromTo(lanes.concat(q('.c4-tabs')), { y: 170 }, { y: 0, duration: 0.18 }, 0.76);
  tl.fromTo(lanes, { opacity: 0 }, { opacity: 1, duration: 0.08 }, 0.08);
  tl.fromTo(q('.c4-cloudlab'), { opacity: 1 }, { opacity: 0, duration: 0.06 }, 0.14);
  tabs.forEach((el, k) => {
    const tb = TABS[k];
    const mx = SLOT0 + tb.mid * SLOT;
    const my = LANES[tb.lane].y - TAB_H / 2;
    const at = 0.1 + (k % 7) * 0.02 + Math.floor(k / 7) * 0.012;
    tl.fromTo(el, { x: tb.cx, y: tb.cy, rotation: tb.rot, opacity: 1, transformOrigin: '50% 50%' }, { x: mx, y: my, rotation: 0, opacity: 1, duration: 0.16 }, at);
    tl.fromTo(shapes[k], { attr: { stroke: '#3B4B66' } }, { attr: { stroke: LANES[tb.lane].color }, duration: 0.04 }, at + 0.12);
  });
  const strike = q('.c4-strike');
  tl.fromTo(strike, { opacity: 1, strokeDasharray: 500, strokeDashoffset: 500 }, { opacity: 1, strokeDasharray: 500, strokeDashoffset: 0, duration: 0.06 }, 0.46);
  tl.to(strike, { opacity: 0, duration: 0.05 }, 0.56);
  tl.to(tabs.filter((el, k) => TABS[k].lane === 2), { opacity: 0, y: '+=14', duration: 0.07, stagger: 0.008 }, 0.5);
  let qi = 0;
  tabs.forEach((el, k) => {
    const tb = TABS[k];
    if (tb.lane !== 0) return;
    if (tb.out) tl.to(el, { x: '-=34', opacity: 0, duration: 0.04 }, 0.6 + qi * 0.016);
    else tl.to(el, { x: SLOT0 + tb.fin * SLOT, duration: 0.07 }, 0.7 + tb.fin * 0.01);
    qi += 1;
  });
  counter(tl, q('.c4-count')[0], QUEUE_START, QUEUE_END, 0.6, 0.1, (v) => String(Math.round(v)));
  tl.fromTo(q('.c4-shot'), { opacity: 0, y: 50, rotation: -1.5 }, { opacity: 1, y: 0, rotation: 0, duration: 0.18 }, 0.8);
  tl.to({}, { duration: 0.02 }, 0.98);
  return tl;
};

/* ------------------------------------------------------------------ */
/* The four chapters                                                  */
/* ------------------------------------------------------------------ */
const pick = (re, s, fallback) => {
  const m = re.exec(s || '');
  return m ? m[1] : fallback;
};

/**
 * Builds the chapter list from the site's data. `bounds` are the timeline
 * progress points at which the step list moves to its second and third step.
 */
export const buildChapters = ({ projects, worked, linkTrackerImage }) => {
  const byId = (id) => projects.find((p) => p.id === id);
  const pTT = byId('timetable-builder');
  const pFD = byId('fraud-detection');
  const pIS = byId('idea-sprint');
  const pLT = byId('link-tracker');
  const { DATASETS, NULL_MODEL, COST_MODEL, SOURCE } = worked;

  const accPct = NULL_MODEL.accuracyPct;
  const caught = NULL_MODEL.fraudCaught;
  const frauds = NULL_MODEL.fraudPresent;
  const pdfCount = pick(/about\s+([\d,]+)/i, pTT.highlight, '1,600');
  const agentWord = pick(/^(\w+)\s+specialist agents/i, pIS.highlight, 'Eleven');
  const tabCount = pick(/(\d+\+)\s+(?:hoarded\s+)?browser tabs/i, pLT.highlight, '100+');
  const fraudIntro =
    `A classifier that always answers "not fraud" scores ${accPct}% accuracy on this data and catches ${caught} of the ${frauds} frauds in the test split. ` +
    'So the threshold that raises an alert is chosen by minimising cost instead.';

  return [
    {
      project: pTT,
      short: 'Timetables',
      title: `About ${pdfCount} timetable PDFs`,
      body: [pTT.highlight],
      steps: ['Lines of PDF text are lifted out by their geometry', 'Each line becomes a session row in Postgres', 'Sessions land on the week, counted by how many PDFs confirm them'],
      bounds: [0.12, 0.4],
      figure: () => vizTimetable({ pdfCount }),
      timeline: (fig) => tlTimetable(fig),
    },
    {
      project: pFD,
      short: 'Fraud',
      title: `${Math.floor(accPct * 10) / 10}% accurate, ${caught} of ${frauds} frauds caught`,
      body: [fraudIntro],
      fraud: { costModel: COST_MODEL.formula, source: SOURCE, datasets: DATASETS, title: 'A model can be 99.8% accurate and catch nothing' },
      steps: [
        `A model that always says “not fraud” scores ${accPct.toFixed(2)}%`,
        `It catches ${caught} of ${frauds} frauds, so the score is stamped misleading`,
        'A threshold chosen by cost cuts modelled loss on all three datasets',
      ],
      bounds: [0.2, 0.56],
      figure: () => vizFraud({ accPct, caught, frauds, datasets: DATASETS }),
      timeline: (fig) => tlFraud(fig, { accPct }),
    },
    {
      project: pIS,
      short: 'Agents',
      title: `${agentWord} agents argue a spec`,
      body: [pIS.highlight],
      steps: [`${agentWord} agents work through three phases`, 'A skeptic builds the case against the recommendation', 'You contest or accept it, then the ADR is drafted'],
      bounds: [0.36, 0.69],
      figure: () => vizAgents(),
      timeline: (fig) => tlAgents(fig),
    },
    {
      project: pLT,
      short: 'Tabs',
      title: `${tabCount} tabs into a queue that shrinks`,
      body: [pLT.highlight],
      steps: ['Saved tabs arrive as one pile of links', 'Every link gets a decision', 'The queue gets shorter, in one local SQLite file'],
      bounds: [0.1, 0.58],
      figure: () => vizTabs({ tabCount, image: linkTrackerImage, imageName: 'link-tracker.webp' }),
      timeline: (fig) => tlTabs(fig),
    },
  ];
};
