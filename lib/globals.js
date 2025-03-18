import createObserver from './create-observer.js';

const viewportObserver = createObserver(undefined, console.log, [0.01, 0.99]);
const callbackRegistry = new Map();
const observerRegistry = new Map();
const preventCall = new Set();

export { viewportObserver, observerRegistry, callbackRegistry, preventCall };
