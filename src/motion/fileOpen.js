/**
 * The file opens: going from a project row to its case study,
 * the row's screenshot travels and grows into the case study's taped-down
 * screenshot, and its title grows into the page title, while the rest of the
 * page slides up like the next sheet. Back closes it the same way, onto the
 * row it came from.
 *
 * Built on the browser's View Transitions (document.startViewTransition). The
 * browser photographs the page, the route changes underneath, and it animates
 * between the two photographs; elements that share a view-transition-name on
 * both sides travel between their two boxes. A browser without it, or a
 * visitor with motion off, just changes page as before.
 *
 * The routes are lazy, so the new page may take a moment to draw: the helper
 * waits for it (up to WAIT_MS) before the browser takes the second photograph.
 * Until then the old page stays on screen, frozen, which reads as a beat.
 */

const WAIT_MS = 1500;
const SHOT = 'file-shot';
const TITLE = 'file-title';

let active = false;
/** Which transition is the latest; an earlier one finishing late must not undo a newer one's names. */
let latest = 0;
/** True while a file is opening or closing: page-level entrances hold off so they don't fight it. */
export const isFileTransition = () => active;

export const fileTransitionsSupported = () =>
  typeof document !== 'undefined' && typeof document.startViewTransition === 'function';

/*
 * While the browser waits for the new page it suppresses rendering, and with
 * it requestAnimationFrame: waiting on frames here would never end (the
 * browser aborts after about four seconds). Timers still run.
 */
const tick = () => new Promise((r) => setTimeout(r, 16));
const waitFor = async (find) => {
  const end = performance.now() + WAIT_MS;
  while (performance.now() < end) {
    const el = find();
    if (el) return el;
    await tick();
  }
  return null;
};
/** The home page's stashed scroll (see links.jsx), read before it is consumed. */
const stashedScroll = () => {
  try {
    const v = Number(sessionStorage.getItem('projectsScrollY'));
    return Number.isFinite(v) && sessionStorage.getItem('projectsScrollY') !== null ? v : null;
  } catch {
    return null;
  }
};
const setName = (el, name) => {
  if (el) el.style.viewTransitionName = name;
};
const clearNames = (els) =>
  els.forEach((el) => {
    if (el) el.style.viewTransitionName = '';
  });
/** A screenshot that has not decoded yet would be photographed blank. */
const decoded = (img) =>
  img?.decode ? Promise.race([img.decode().catch(() => {}), new Promise((r) => setTimeout(r, 400))]) : Promise.resolve();
const inView = (el) => {
  if (!el) return false;
  const r = el.getBoundingClientRect();
  return r.bottom > 0 && r.top < window.innerHeight && r.width > 0;
};

const run = ({ direction, from, go, to }) => {
  const html = document.documentElement;
  const id = ++latest;
  active = true;
  html.dataset.fileTransition = direction;
  setName(from.shot, SHOT);
  setName(from.title, TITLE);
  let named = [];

  const vt = document.startViewTransition(async () => {
    // The old page has been photographed; free its names for the new one.
    clearNames([from.shot, from.title]);
    go();
    const target = await to();
    if (target) {
      // Only travel what exists, and is on screen, on both sides (on a phone a
      // case study's screenshot is below the fold): anything else just fades
      // with the page.
      if (inView(from.shot) && inView(target.shot)) setName(target.shot, SHOT);
      if (inView(from.title) && inView(target.title)) setName(target.title, TITLE);
      named = [target.shot, target.title];
      await decoded(target.shot?.tagName === 'IMG' ? target.shot : target.shot?.querySelector('img'));
    }
  });
  vt.finished
    .catch(() => {})
    .finally(() => {
      if (id !== latest) return;
      clearNames(named);
      active = false;
      delete html.dataset.fileTransition;
    });
};

/**
 * Open a case study. `link` is the clicked anchor: the screenshot and title
 * that travel are the ones in its project row, when it has one.
 */
export const openFile = ({ link, go }) => {
  const row = link?.closest('.ix-row');
  run({
    direction: 'open',
    from: { shot: row?.querySelector('.ix-thumb'), title: row?.querySelector('.ix-title') },
    go,
    to: async () => {
      const head = await waitFor(() => document.querySelector('.case-head'));
      if (!head) return null;
      // Let the page's own scroll-to-top (an effect) run before the photograph.
      await tick();
      return { shot: head.querySelector('.case-shot img'), title: head.querySelector('.case-title') };
    },
  });
};

/**
 * Close a case study, back onto the row it was opened from. The row is found
 * by its link once the previous page has drawn and put its scroll back.
 * `follow: false` closes without travelling (for "Back to all projects",
 * which scrolls smoothly to the index after it lands).
 */
export const closeFile = ({ projectId, go, follow = true }) => {
  const head = document.querySelector('.case-head');
  const sel = `.ix-row a[href="/projects/${projectId}"]`;
  const y = follow ? stashedScroll() : null;
  run({
    direction: 'close',
    from: { shot: head?.querySelector('.case-shot img'), title: head?.querySelector('.case-title') },
    go,
    to: async () => {
      const found = await waitFor(() => !document.querySelector('.case-head') && document.querySelector(sel));
      if (!found || !follow) return null;
      // The home page puts the reader's scroll back on its next frame, which
      // will not come until this transition has its photograph: do it now.
      await tick();
      if (y !== null) window.scrollTo({ top: y, left: 0, behavior: 'instant' });
      const row = [...document.querySelectorAll(sel)].map((a) => a.closest('.ix-row')).find(inView);
      return row ? { shot: row.querySelector('.ix-thumb'), title: row.querySelector('.ix-title') } : {};
    },
  });
};
