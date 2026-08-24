import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

/**
 * One registration point for GSAP plugins. Components import gsap from here
 * rather than from 'gsap', so plugin registration cannot be forgotten and the
 * test environment (jsdom) only has to survive this file once.
 */
gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * jsdom has no real animation frame loop, so a `from` tween would leave
 * content stuck at its hidden start state. Components check this before
 * animating; under Vitest the page simply renders finished.
 */
export const gsapEnabled = typeof window !== 'undefined' && !import.meta.env?.TEST;

export { gsap, ScrollTrigger, useGSAP };
