import PositionObserver from '../../lib/index.js';

let observerTop; 
let observerRight;
let observerBottom;
let observerLeft;
let timeout;
let delay = 500;

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
  style.width = `${width}px`;
  style.height = `${height}px`;
  classList.add('recreated');
};

PositionObserver.prototype.__observerCallback = function (entries, self) {

  const entry = entries[entries.length - 1];
  const { target } = entry;
  const observers = self.__observers.get(target);
  
  if (this.isFirstCall(target)) {
    if (this === observers.bottom) {
      if (this !== observerBottom) {
        observerBottom = this;
        resizeObserverRect(observerBottomRect, entry.rootBounds);
      }
    } 

    if (this === observers.left) {
      if (this !== observerLeft) {
        observerLeft = this;
        resizeObserverRect(observerLeftRect, entry.rootBounds);
      }
    }

    if (this === observers.top) {
      if (this !== observerTop) {
        observerTop = this;
        resizeObserverRect(observerTopRect, entry.rootBounds);
      }
    }

    if (this === observers.right) {
      if (this !== observerRight) {
        observerRight = this;
        resizeObserverRect(observerRightRect, entry.rootBounds);
      }
    }
  }

  clearTimeout(timeout);
  timeout = setTimeout(flashed, delay);
  
  originalFn.call(this, entries, self);
};

import('./input-position-observer.js');