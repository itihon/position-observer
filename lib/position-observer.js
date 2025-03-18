import createObserver from './create-observer.js';
import elementObserverCallback from './position-change-started.js';
import {
  viewportObserver,
  observerRegistry,
  callbackRegistry,
} from './globals.js';

export default function PositionObserver(callback = () => {}) {
  return {
    observe(target) {
      if (!observerRegistry.has(target)) {
        const rect = target.getBoundingClientRect();
        const elementObserver = createObserver(rect, elementObserverCallback);

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
