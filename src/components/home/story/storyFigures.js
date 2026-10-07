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
 * test), and the design path follows the idea-sprint case study's table of how
 * a design is made.
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
/* 3. idea-sprint: a plan checked in code, then a spec checked against it */
/* ------------------------------------------------------------------ */
// The design path of specs before code, as its case study's "How a design is
// made" table has it: the model writes the plan (the ledger, seven typed
// fields); parser rules check it and send findings back by field, up to two
// revisions; one writer writes the spec from the plan; code checks the spec
// against it, one revision; the status is set in code.
const LEDGER = ['numbers', 'workloads', 'decisions', 'data access', 'capacity', 'promises', 'replicated state'];
const FIND_ROW = 2; // the decisions row: where the drawn finding lands
const SPEC = ['requirements', 'estimates', 'core decision', 'architecture', 'APIs', 'data model', 'promises', 'failure modes', 'tests', 'open questions'];
const L3 = { x: 156, w: 196, y: 100, rh: 38 };
const D3 = { x: 404, w: 212, y: 150, rh: 25 };

const vizPlan = () => {
  let g = '';
  [['brief', 70], ['plan', L3.x + L3.w / 2], ['spec', D3.x + D3.w / 2]].forEach(([nm, x], k) => {
    g += `<g class="c3-phase">${tx(x, 60, nm, { size: 10.5, anchor: 'middle', fill: C.moon, weight: 600 })}${tx(x, 76, ['one line in', 'model writes, code checks', 'written once, then checked'][k], { size: 10, anchor: 'middle' })}</g>`;
  });
  // The brief: a one-line idea.
  g += `<g class="c3-brief"><rect x="22" y="112" width="96" height="64" fill="${C.paperHi}" stroke="${C.paperRule}"/>` +
    `<text class="serif" x="34" y="138" font-size="17" fill="${C.ink}">an idea</text>` +
    '<rect x="34" y="150" width="70" height="5" rx="1" fill="#AEB7C2"/><rect x="34" y="161" width="52" height="5" rx="1" fill="#AEB7C2"/></g>';
  g += `<path class="c3-edge" data-set="in" d="M 120 144 L ${L3.x - 6} 144" fill="none" stroke="${C.moon2}" stroke-width="1.3"/>`;
  // The ledger: seven typed fields, each ticked once the parser rules pass.
  const lh = L3.rh * LEDGER.length + 34;
  g += `<g class="c3-ledger"><rect x="${L3.x}" y="${L3.y}" width="${L3.w}" height="${lh}" rx="3" fill="${C.night2}" stroke="${C.moon2}" stroke-width="1.3"/>` +
    tx(L3.x + 14, L3.y + 22, 'LEDGER', { size: 10.5, fill: C.moon, weight: 600, ls: 1.5 }) + '</g>';
  LEDGER.forEach((f, k) => {
    const y = L3.y + 48 + k * L3.rh;
    g += `<g class="c3-field">${tx(L3.x + 14, y + 4, f, { size: 11, fill: C.moon })}<rect x="${L3.x + 14}" y="${y + 11}" width="${[96, 120, 84, 108, 90, 116, 72][k]}" height="4" rx="1" fill="${C.rule}"/></g>` +
      `<g class="c3-tick"><circle cx="${L3.x + L3.w - 20}" cy="${y}" r="7" fill="${C.hl}"/><path d="M${L3.x + L3.w - 23.5} ${y} l2.5 2.6 l4.5 -5" fill="none" stroke="${C.ink}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></g>`;
  });
  // The finding the rules send back, by field name. Shown only while the
  // timeline plays it: in the final state the revision has resolved it.
  const fy = L3.y + 48 + FIND_ROW * L3.rh;
  g += `<g class="c3-find" opacity="0"><rect x="${L3.x + 64}" y="${fy - 11}" width="106" height="20" rx="2" fill="#3A1520" stroke="${C.red}" stroke-width="1.5"/>` +
    tx(L3.x + 117, fy + 3, 'decision_no_cost', { size: 9.5, anchor: 'middle', fill: C.redLight, weight: 600 }) + '</g>';
  // Findings go back to the model: up to two revisions.
  g += `<path class="c3-loop" d="M ${L3.x + 40} ${L3.y + lh + 6} C ${L3.x + 40} ${L3.y + lh + 46}, ${L3.x + L3.w - 40} ${L3.y + lh + 46}, ${L3.x + L3.w - 40} ${L3.y + lh + 10}" fill="none" stroke="${C.redLight}" stroke-width="1.6"/>` +
    `<path class="c3-loophead" d="M${L3.x + L3.w - 40} ${L3.y + lh + 8} l-4.6 8.4 l9.2 0 Z" fill="${C.redLight}"/>` +
    tx(L3.x + L3.w / 2, L3.y + lh + 60, 'findings go back by field, up to 2 revisions', { size: 10, anchor: 'middle', fill: C.redLight, cls: 'c3-looplab' });
  g += `<path class="c3-edge" data-set="out" d="M ${L3.x + L3.w + 4} 244 L ${D3.x - 6} 244" fill="none" stroke="${C.moon2}" stroke-width="1.3"/>`;
  // The spec: ten required sections, each checked against the plan.
  const dh = D3.rh * SPEC.length + 66;
  g += `<g class="c3-doc"><rect x="${D3.x}" y="100" width="${D3.w}" height="${dh}" fill="${C.paperHi}" stroke="${C.paperRule}"/>` +
    `<text class="serif" x="${D3.x + 16}" y="134" font-size="24" fill="${C.ink}">Design spec</text></g>`;
  SPEC.forEach((sec, k) => {
    const y = D3.y + 8 + k * D3.rh;
    g += `<g class="c3-part">${tx(D3.x + 16, y, sec, { size: 9.5, fill: C.graphite, weight: 600 })}<rect x="${D3.x + 16}" y="${y + 5}" width="${[150, 120, 96, 142, 110, 128, 100, 136, 90, 118][k]}" height="4" rx="1" fill="#AEB7C2"/></g>` +
      `<path class="c3-dtick" d="M${D3.x + D3.w - 26} ${y - 3} l3 3.2 l6 -7" fill="none" stroke="${C.graphite}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`;
  });
  g += tx(D3.x + D3.w / 2, 100 + dh + 18, 'checked against the plan, 1 revision', { size: 10, anchor: 'middle', fill: C.moon2, cls: 'c3-doclab' });
  // The status, set in code.
  g += '<g transform="translate(486 486) rotate(-4)"><g class="c3-approve">' +
    `<rect x="-124" y="-20" width="248" height="40" rx="3" fill="rgba(11,18,32,.92)" stroke="${C.hl}" stroke-width="2.5"/>` +
    `<path d="M-110 0 l6 6 l11 -12" fill="none" stroke="${C.hl}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>` +
    `${tx(-86, 5, 'CHECKED AGAINST ITS PLAN', { size: 11.5, fill: C.hl, weight: 600, ls: 0.6 })}</g></g>`;
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

const tlPlan = (fig) => {
  const q = (s) => $$(s, fig);
  const tl = newTL();
  if (!tl) return null;
  const phases = q('.c3-phase');
  const edges = q('.c3-edge');
  const edgeSet = (s) => edges.filter((e) => e.getAttribute('data-set') === s);
  const ticks = q('.c3-tick');
  const pop = { scale: 0, opacity: 0, transformOrigin: '50% 50%' };
  // 1. The model writes the plan, field by field.
  draw(tl, edgeSet('in'), 0.02, 0.06);
  tl.fromTo(phases[1], { opacity: 0 }, { opacity: 1, duration: 0.04 }, 0.04);
  tl.fromTo(q('.c3-ledger'), { opacity: 0 }, { opacity: 1, duration: 0.04 }, 0.06);
  tl.fromTo(q('.c3-field'), { x: -18, opacity: 0 }, { x: 0, opacity: 1, duration: 0.04, stagger: 0.025 }, 0.08);
  // 2. Code checks it: the rows pass, one finding goes back by name and is revised.
  ticks.forEach((t, k) => {
    const at = k === FIND_ROW ? 0.5 : 0.3 + k * 0.022;
    tl.fromTo(t, pop, { scale: 1, opacity: 1, duration: 0.03, ease: 'back.out(2.2)' }, at);
  });
  tl.fromTo(q('.c3-find'), { opacity: 0, scale: 1.4, transformOrigin: '50% 50%' }, { opacity: 1, scale: 1, duration: 0.03 }, 0.33);
  draw(tl, q('.c3-loop'), 0.37, 0.08);
  tl.fromTo(q('.c3-loophead, .c3-looplab'), { opacity: 0 }, { opacity: 1, duration: 0.03 }, 0.43);
  tl.to(q('.c3-find'), { opacity: 0, duration: 0.03 }, 0.47);
  // 3. One writer writes the spec, and code checks it against the plan.
  draw(tl, edgeSet('out'), 0.56, 0.05);
  tl.fromTo(phases[2], { opacity: 0 }, { opacity: 1, duration: 0.04 }, 0.58);
  tl.fromTo(q('.c3-doc'), { scaleY: 0.02, opacity: 0, transformOrigin: '50% 0%' }, { scaleY: 1, opacity: 1, duration: 0.06 }, 0.6);
  tl.fromTo(q('.c3-part'), { x: -20, opacity: 0 }, { x: 0, opacity: 1, duration: 0.04, stagger: 0.014 }, 0.65);
  draw(tl, q('.c3-dtick'), 0.8, 0.03, 0.006);
  tl.fromTo(q('.c3-doclab'), { opacity: 0 }, { opacity: 1, duration: 0.03 }, 0.86);
  tl.fromTo(q('.c3-approve'), { scale: 2.2, opacity: 0, transformOrigin: '50% 50%' }, { scale: 1, opacity: 1, duration: 0.07, ease: 'power3.in' }, 0.9);
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
      short: 'Specs',
      title: 'The model proposes, code decides',
      body: [pIS.highlight],
      steps: ['The model writes the plan in seven typed fields', 'Code checks it and sends findings back by field', 'One writer writes the spec, checked against the plan'],
      bounds: [0.3, 0.56],
      figure: () => vizPlan(),
      timeline: (fig) => tlPlan(fig),
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
