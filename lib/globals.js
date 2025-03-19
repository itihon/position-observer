const callbackRegistry = new Map();
const observerRegistry = new Map();
const preventCall = new Set();

export { observerRegistry, callbackRegistry, preventCall };
