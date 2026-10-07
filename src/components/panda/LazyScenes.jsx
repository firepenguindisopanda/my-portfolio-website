import React, { Suspense, lazy } from 'react';

/**
 * The panda's scenes (PandaScenes), kept off the first load: the page renders
 * without them and each appears when their one shared chunk arrives. They are
 * decorative, so there is nothing to show while it loads.
 */

const load = () => import('./PandaScenes');

const lazyScene = (name) => {
  const Scene = lazy(() => load().then((m) => ({ default: m[name] })));
  const Loaded = () => (
    <Suspense fallback={null}>
      <Scene />
    </Suspense>
  );
  Loaded.displayName = `Lazy${name}`;
  return Loaded;
};

export const HeroPeek = lazyScene('HeroPeek');
export const StoryClerk = lazyScene('StoryClerk');
export const TryItNap = lazyScene('TryItNap');
export const FooterNap = lazyScene('FooterNap');
