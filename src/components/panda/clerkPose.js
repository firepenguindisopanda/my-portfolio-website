import { POSES } from './PandaRig';

/*
 * The Four cases clerk's pose, as a plain function of scroll progress: kept
 * out of PandaScenes so that file exports only components (Fast Refresh).
 */

const clamp01 = (v) => Math.max(0, Math.min(1, v));
const mix = (a, b, t) => {
  const out = {};
  Object.keys(a).forEach((k) => { out[k] = a[k] + ((b[k] ?? a[k]) - a[k]) * t; });
  return out;
};
const smooth = (t) => t * t * (3 - 2 * t);

/** The clerk's pose for how far into a case's figure the reader is (0 to 1). */
export const clerkPose = (p) => {
  // Eyes on the case the whole time.
  const idle = { ...POSES.sit, look: 1 };
  const up = { ...POSES.stampUp, look: 1 };
  const down = { ...POSES.stampDown, look: 1 };
  if (p < 0.6) return idle;
  if (p < 0.76) return mix(idle, up, smooth((p - 0.6) / 0.16));
  if (p < 0.84) return mix(up, down, smooth((p - 0.76) / 0.08));
  return mix(down, idle, smooth(clamp01((p - 0.9) / 0.1)));
};
