import PositionObserver from "@itihon/position-observer";

let observerTop; 
let observerRight;
let observerBottom;
let observerLeft;
let timeout;
let delay = 1000;

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

  const margins = this.rootMargin.split(' ');
  const entry = entries[entries.length - 1];
  const { target } = entry;
  
  if (this.isFirstCall(target)) {
    for (let idx = 0; idx < margins.length; idx ++) {
      if (margins[idx] !== '0px' && idx === 0) {
        if (this !== observerBottom) {
          observerBottom = this;
          resizeObserverRect(observerBottomRect, entry.rootBounds);
          clearTimeout(timeout);
          setTimeout(flashed, delay);
        }
        break;
      } 

      if (margins[idx] !== '0px' && idx === 1) {
        if (this !== observerLeft) {
          observerLeft = this;
          resizeObserverRect(observerLeftRect, entry.rootBounds);
          clearTimeout(timeout);
          setTimeout(flashed, delay);
        }
        break;
      }

      if (margins[idx] !== '0px' && idx === 2) {
        if (this !== observerTop) {
          observerTop = this;
          resizeObserverRect(observerTopRect, entry.rootBounds);
          clearTimeout(timeout);
          setTimeout(flashed, delay);
        }
        break;
      }

      if (margins[idx] !== '0px' && idx === 3) {
        if (this !== observerRight) {
          observerRight = this;
          resizeObserverRect(observerRightRect, entry.rootBounds);
          clearTimeout(timeout);
          setTimeout(flashed, delay);
        }
        break;
      }
    }
  }
  
  originalFn.call(this, entries, self);
};

import('./input-position-observer.js');