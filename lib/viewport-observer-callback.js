import createObserver from './create-observer.js';
import elementObserverCallback from './element-observer-callback.js';
import { observerRegistry } from './globals.js';

const viewportObserverCallback = (entries) => {
  const entry = entries[entries.length - 1];
  const { target, boundingClientRect, intersectionRect, intersectionRatio } =
    entry;

  if (intersectionRatio === 1) return;

  console.log('viewportObserverCallback: recreating observer');

  const {
    right: targetRight,
    bottom: targetBottom,
    width: targetWidth,
    height: targetHeight,
  } = boundingClientRect;

  const {
    right: intersectionRight,
    top: intersectionTop,
    bottom: intersectionBottom,
    left: intersectionLeft,
  } = intersectionRect;

  const observerLeft = intersectionLeft - (targetRight - intersectionRight);
  const observerTop = intersectionTop - (targetBottom - intersectionBottom);

  const observerRect = new DOMRect(
    observerLeft,
    observerTop,
    targetWidth,
    targetHeight,
  );

  observerRegistry.get(target).unobserve(target);
  observerRegistry.delete(target);

  const elementObserver = createObserver(
    observerRect,
    elementObserverCallback(++elementObserverCallback.idx),
  );

  elementObserver.observe(target);
  observerRegistry.set(target, elementObserver);
};

export default viewportObserverCallback;
