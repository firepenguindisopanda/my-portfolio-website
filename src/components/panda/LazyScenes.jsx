import React, { Suspense, lazy } from 'react';

/**
 * The 404's digging panda, kept off the first load: the page renders without
 * it and the scene appears when its chunk arrives. It is decorative, so there
 * is nothing to show while it loads.
 */

const lazyScene = (name, from) => {
  const Scene = lazy(() => from().then((m) => ({ default: m[name] })));
  const Loaded = () => (
    <Suspense fallback={null}>
      <Scene />
    </Suspense>
  );
  Loaded.displayName = `Lazy${name}`;
  return Loaded;
};

export const DiggingPanda = lazyScene('DiggingPanda', () => import('./DiggingPanda'));
