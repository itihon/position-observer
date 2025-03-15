import createObserver from './create-observer.js';
import positionChangeStarted from './position-change-started.js';
import {
  viewportObserver,
  setViewportCallback,
  observerRegistry,
  callbackRegistry,
} from './globals.js';

setViewportCallback(positionChangeStarted(viewportObserver));

export default function PositionObserver(callback = () => {}) {
  return {
    observe(target) {
      if (!observerRegistry.has(target)) {
        const rect = target.getBoundingClientRect();
        const [elementObserver, setElementCallback] = createObserver(rect);

        setElementCallback(positionChangeStarted(elementObserver));

        elementObserver.observe(target);
        viewportObserver.observe(target);

        observerRegistry.set(target, elementObserver);
        callbackRegistry.set(target, callback);
      } else {
        console.warn(`The target ${target} is already being observed.`);
      }
    },

    unobserve(target) {
      if (observerRegistry.has(target)) {
        observerRegistry.get(target).unobserve(target);
        viewportObserver.unobserve(target);

        observerRegistry.delete(target);
        callbackRegistry.delete(target);
      }
    },

    disconnect() {
      observerRegistry.forEach((elementObserver, target) => {
        elementObserver.unobserve(target);
        viewportObserver.unobserve(target);

        observerRegistry.delete(target);
        callbackRegistry.delete(target);
      });
    },
  };
}
