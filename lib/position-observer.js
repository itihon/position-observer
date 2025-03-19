import createObserver from './create-observer.js';
import elementObserverCallback from './element-observer-callback.js';
import viewportObserverCallback from './viewport-observer-callback.js';
import { observerRegistry, callbackRegistry } from './globals.js';

const viewportObserver = createObserver(
  undefined,
  viewportObserverCallback,
  [0.01, 0.99],
);

export default function PositionObserver(callback = () => {}) {
  return {
    observe(target) {
      if (!observerRegistry.has(target)) {
        const rect = target.getBoundingClientRect();
        const elementObserver = createObserver(
          rect,
          elementObserverCallback(++elementObserverCallback.idx),
        );

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
