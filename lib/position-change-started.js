import positionChanging from './position-changing.js';
import createObserver from './create-observer.js';
import { viewportObserver, observerRegistry, preventCall } from './globals.js';

const positionChangeStarted = (observer) => {
  const handleEntry = (entry) => {
    const { target, intersectionRatio, isIntersecting } = entry;

    if (observer === viewportObserver) {
      // position change detected by the viewport observer
      if (isIntersecting && intersectionRatio < 1) {
        observerRegistry.get(target).unobserve(target);

        if (!preventCall.has(target)) {
          positionChanging(observer, target, isIntersecting);
        } else {
          preventCall.delete(target);
        }
        return true;
      }

      // the target is fully visible in viewport, pass control to its bounding observer
      if (intersectionRatio === 1) {
        observerRegistry.get(target).observe(target);
        return true;
      }
    } else {
      // position change detected by the target's bounding observer
      if (isIntersecting && intersectionRatio < 1) {
        if (!preventCall.has(target)) {
          positionChanging(observer, target, isIntersecting);
        } else {
          preventCall.delete(target);
        }
        return true;
      }

      // the target is out of its bounding observer, recreate the observer with a new margin rect
      if (!isIntersecting) {
        observerRegistry.get(target).unobserve(target);

        const [elementObserver, setElementCallback] = createObserver(
          entry.boundingClientRect,
        );
        setElementCallback(positionChangeStarted(elementObserver));
        elementObserver.observe(target);
        observerRegistry.set(target, elementObserver);

        return true;
      }
    }
  };

  return (entries) => {
    entries.some(handleEntry);
  };
};

export default positionChangeStarted;
