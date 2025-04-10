import PositionObserver from './index.js';

let timeout;
let delay = 500;

export default class PositionObserverDebug extends PositionObserver {
  observerTopRect;
  observerRightRect;
  observerBottomRect;
  observerLeftRect;

  constructor(...args) {
    super(...args);
    console.warn('PositionObserver is in debug mode');

    this.observerTopRect = document.createElement('div');
    this.observerRightRect = document.createElement('div');
    this.observerBottomRect = document.createElement('div');
    this.observerLeftRect = document.createElement('div');

    this.observerTopRect.classList.add('observer-bounds', 'observer-top');
    this.observerRightRect.classList.add('observer-bounds', 'observer-right');
    this.observerBottomRect.classList.add('observer-bounds', 'observer-bottom');
    this.observerLeftRect.classList.add('observer-bounds', 'observer-left');

    document.body.append(
      this.observerTopRect,
      this.observerRightRect,
      this.observerBottomRect,
      this.observerLeftRect,
    );
  }
}

const originalFn = PositionObserver.prototype.__observerCallback;

const flashed = (ctx) => {
  ctx.observerTopRect.classList.remove('recreated');
  ctx.observerRightRect.classList.remove('recreated');
  ctx.observerBottomRect.classList.remove('recreated');
  ctx.observerLeftRect.classList.remove('recreated');
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
      self.observerTopRect,
      entry.rootBounds,
    );
  }

  if (this === observers.right) {
    runIfNew(
      'right',
      observers.right,
      resizeObserverRect,
      self.observerRightRect,
      entry.rootBounds,
    );
  }

  if (this === observers.bottom) {
    runIfNew(
      'bottom',
      observers.bottom,
      resizeObserverRect,
      self.observerBottomRect,
      entry.rootBounds,
    );
  }

  if (this === observers.left) {
    runIfNew(
      'left',
      observers.left,
      resizeObserverRect,
      self.observerLeftRect,
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
        self.observerTopRect,
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
        self.observerRightRect,
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
        self.observerBottomRect,
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
        self.observerLeftRect,
        leftRecords[leftRecords.length - 1].rootBounds,
      );
    }
    return leftRecords;
  };

  clearTimeout(timeout);
  timeout = setTimeout(flashed, delay, self);

  originalFn.call(this, entries, self);
};
