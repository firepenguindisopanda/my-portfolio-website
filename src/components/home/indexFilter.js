/**
 * A skill picked in Skills, sent to the index above it: the index shows the
 * projects that use it and marks them. A tiny emitter, like the panda's bus,
 * so neither section has to own the other's state.
 */
const listeners = new Set();

export const showSkillInIndex = (skill) => listeners.forEach((l) => l(skill));

export const onSkillPicked = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
