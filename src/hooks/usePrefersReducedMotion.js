import { useMotion } from '../motion/Motion';

/**
 * Whether this page should hold still.
 *
 * True when the visitor's system asks for reduced motion and they have not
 * switched motion on in the header - or when they switched it off. Every
 * component that starts a GSAP tween checks this first; performance.test.js
 * fails any file that tweens without the guard.
 */
const usePrefersReducedMotion = () => !useMotion().motionOn;

export default usePrefersReducedMotion;
