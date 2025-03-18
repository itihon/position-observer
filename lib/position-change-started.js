import positionChanging from './position-changing.js';
import createObserver from './create-observer.js';
import { observerRegistry, preventCall } from './globals.js';

const positionChangeStarted = (entries) => {
  const entry = entries[entries.length - 1];
  const { target, intersectionRatio, isIntersecting } = entry;
  const observer = observerRegistry.get(target);

  // position change detected by the target's bounding observer
  if (isIntersecting && intersectionRatio < 1) {
    if (!preventCall.has(target)) {
      positionChanging(observer, target, isIntersecting);
    } else {
      preventCall.delete(target);
    }
    return;
  }

  // the target is out of its bounding observer, recreate the observer with a new margin rect
  if (!isIntersecting) {
    observerRegistry.get(target).unobserve(target);

    const elementObserver = createObserver(
      entry.boundingClientRect,
      positionChangeStarted,
    );

    elementObserver.observe(target);
    observerRegistry.set(target, elementObserver);

    return;
  }
};

export default positionChangeStarted;
