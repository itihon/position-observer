import createObserver from './create-observer.js';

const [viewportObserver, setViewportCallback] = createObserver();
const callbackRegistry = new Map();
const observerRegistry = new Map();
const preventCall = new Set();

export {
  viewportObserver,
  setViewportCallback,
  observerRegistry,
  callbackRegistry,
  preventCall,
};
