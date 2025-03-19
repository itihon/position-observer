import positionChanging from './position-changing.js';
import createObserver from './create-observer.js';
import { observerRegistry, preventCall } from './globals.js';

const elementObserverCallback = (idx) => (entries) => {
  const entry = entries[entries.length - 1];
  const { target, intersectionRatio, isIntersecting } = entry;
  const observer = observerRegistry.get(target);

  /* DEBUG */
  {
    const outerObserverRect = document.querySelector('.outer-observer');
    const { left, top, width, height } = entry.rootBounds;
    outerObserverRect.style.left = `${left}px`;
    outerObserverRect.style.top = `${top}px`;
    outerObserverRect.style.width = `${width}px`;
    outerObserverRect.style.height = `${height}px`;
    console.log(idx);
  }
  /* END OF DEBUG */

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
    if (!preventCall.has(target)) {
      console.log('elementObserverCallback: recreating observer');
      observerRegistry.get(target).unobserve(target);
      observerRegistry.delete(target);

      const elementObserver = createObserver(
        entry.boundingClientRect,
        elementObserverCallback(++elementObserverCallback.idx),
      );

      preventCall.add(target);
      elementObserver.observe(target);
      observerRegistry.set(target, elementObserver);
    } else {
      preventCall.delete(target);
    }
    return;
  }
};

export default elementObserverCallback;

elementObserverCallback.idx = 0;
