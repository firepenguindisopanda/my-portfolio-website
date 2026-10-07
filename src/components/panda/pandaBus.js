/**
 * How the page tells the panda what is happening, without the page depending
 * on the panda: the story reports how far into the current case the reader is,
 * so the Four cases clerk can raise and press its stamp in step.
 * With no panda listening, an emit is a no-op.
 */
const listeners = new Map();

export const onPanda = (type, fn) => {
  if (!listeners.has(type)) listeners.set(type, new Set());
  listeners.get(type).add(fn);
  return () => listeners.get(type).delete(fn);
};

export const emitPanda = (type, detail) => {
  listeners.get(type)?.forEach((fn) => fn(detail));
};
