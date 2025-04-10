import PositionObserver from './index.js';

let timeout;
let delay = 500;

export default class PositionObserverDebug extends PositionObserver {
  constructor(...args) {
    super(...args);
    console.warn('PositionObserver is in debug mode');
  }
}

const originalFn = PositionObserver.prototype.__observerCallback;

const observerTopRect = document.querySelector('.observer-top');
const observerRightRect = document.querySelector('.observer-right');
const observerBottomRect = document.querySelector('.observer-bottom');
const observerLeftRect = document.querySelector('.observer-left');

const flashed = () => {
  observerTopRect.classList.remove('recreated');
  observerRightRect.classList.remove('recreated');
  observerBottomRect.classList.remove('recreated');
  observerLeftRect.classList.remove('recreated');
};

const resizeObserverRect = (observerRectElement, rect) => {
  const { left, top, width, height } = rect;
  const { scrollLeft, scrollTop } = document.documentElement;
  const { style, classList } = observerRectElement;

  style.transform = `translate(${left + scrollLeft}px, ${top + scrollTop}px)`;
  style.height = `${height}px`;
  if (left) {
    style.right = `${left}px`;
  } else {
    style.width = `${width}px`;
  }
  classList.add('recreated');
};

const runIfNew = (
  (instances = new Map()) =>
  (key, value, fn, ...args) => {
    if (instances.get(key) !== value) {
      fn(...args);
      instances.set(key, value);
    }
  }
)();

PositionObserverDebug.prototype.__observerCallback = function debug(entries) {
  const self = this.ctx;
  const entry = entries[entries.length - 1];
  const { target } = entry;
  const observers = self.__observers.get(target);

  const takeTopRecords = observers.top.takeRecords;
  const takeRightRecords = observers.right.takeRecords;
  const takeBottomRecords = observers.bottom.takeRecords;
  const takeLeftRecords = observers.left.takeRecords;

  let topRecords;
  let rightRecords;
  let bottomRecords;
  let leftRecords;

  if (this === observers.top) {
    runIfNew(
      'top',
      observers.top,
      resizeObserverRect,
      observerTopRect,
      entry.rootBounds,
    );
  }

  if (this === observers.right) {
    runIfNew(
      'right',
      observers.right,
      resizeObserverRect,
      observerRightRect,
      entry.rootBounds,
    );
  }

  if (this === observers.bottom) {
    runIfNew(
      'bottom',
      observers.bottom,
      resizeObserverRect,
      observerBottomRect,
      entry.rootBounds,
    );
  }

  if (this === observers.left) {
    runIfNew(
      'left',
      observers.left,
      resizeObserverRect,
      observerLeftRect,
      entry.rootBounds,
    );
  }

  observers.top.takeRecords = () => {
    topRecords = takeTopRecords.call(observers.top);
    if (topRecords.length) {
      runIfNew(
        'top',
        observers.top,
        resizeObserverRect,
        observerTopRect,
        topRecords[topRecords.length - 1].rootBounds,
      );
    }
    return topRecords;
  };

  observers.right.takeRecords = () => {
    rightRecords = takeRightRecords.call(observers.right);
    if (rightRecords.length) {
      runIfNew(
        'right',
        observers.right,
        resizeObserverRect,
        observerRightRect,
        rightRecords[rightRecords.length - 1].rootBounds,
      );
    }
    return rightRecords;
  };

  observers.bottom.takeRecords = () => {
    bottomRecords = takeBottomRecords.call(observers.bottom);
    if (bottomRecords.length) {
      runIfNew(
        'bottom',
        observers.bottom,
        resizeObserverRect,
        observerBottomRect,
        bottomRecords[bottomRecords.length - 1].rootBounds,
      );
    }
    return bottomRecords;
  };

  observers.left.takeRecords = () => {
    leftRecords = takeLeftRecords.call(observers.left);
    if (leftRecords.length) {
      runIfNew(
        'left',
        observers.left,
        resizeObserverRect,
        observerLeftRect,
        leftRecords[leftRecords.length - 1].rootBounds,
      );
    }
    return leftRecords;
  };

  clearTimeout(timeout);
  timeout = setTimeout(flashed, delay);

  originalFn.call(this, entries, self);
};
