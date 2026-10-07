import { useNavigate } from 'react-router-dom';
import { useMotion } from './Motion';
import { fileTransitionsSupported, openFile } from './fileOpen';

/** A plain left click, which the page may take over; anything else (new tab, new window) stays the browser's. */
const plainClick = (e) => e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;

/**
 * An onClick for a link to a case study: with motion on, in a browser that
 * has view transitions, it opens the file (see fileOpen.js) instead of a
 * plain route change. Call it after the link's own analytics.
 */
const useOpenFile = (to) => {
  const navigate = useNavigate();
  const { motionOn } = useMotion();
  return (e) => {
    if (!motionOn || !fileTransitionsSupported() || !plainClick(e) || e.defaultPrevented) return;
    e.preventDefault();
    openFile({ link: e.currentTarget, go: () => navigate(to) });
  };
};

export default useOpenFile;
