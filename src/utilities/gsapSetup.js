import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Flip } from 'gsap/Flip';
import { useGSAP } from '@gsap/react';

/**
 * One registration point for GSAP plugins. Components import gsap from here
 * rather than from 'gsap', so plugin registration cannot be forgotten and the
 * test environment (jsdom) only has to survive this file once.
 *
 * Flip is here for one job: when the project filter changes, cards that stay
 * visible travel to their new cells instead of jumping there.
 */
gsap.registerPlugin(ScrollTrigger, Flip, useGSAP);

/**
 * jsdom has no real animation frame loop, so a `from` tween would leave
 * content stuck at its hidden start state. Components check this before
 * animating; under Vitest the page simply renders finished.
 */
export const gsapEnabled = typeof window !== 'undefined' && !import.meta.env?.TEST;

/**
 * Whether the primary input can hover. Pointer-driven effects (tilt, magnetic
 * buttons, the hero field reacting) are for a mouse or trackpad: on a phone
 * there is no pointer to follow, and a tap that also leans the card under the
 * finger reads as a glitch.
 */
export const canHover = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(hover: hover) and (pointer: fine)').matches;

export { gsap, ScrollTrigger, Flip, useGSAP };
