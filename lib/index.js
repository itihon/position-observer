import IntersectionObserverHF from './intersection-observer-hf.js';
import RequestAnimationFrameLoop from 'request-animation-frame-loop';

// initial viewport rect
const viewportRect = await new Promise((res) => {
  const observer = new IntersectionObserver(
    (entries) => {
      res(entries[0].rootBounds);
      observer.unobserve(document.documentElement);
    },
    { root: document },
  );
  observer.observe(document.documentElement);
});

const { width: viewportWidth, height: viewportHeight } = viewportRect;

/**
 * @callback PositionObserverCallback
 * @param {HTMLElement} target
 * @param {DOMRect} targetRect
 * @param {*} ctx
 * @returns {void}
 */

/**
 * @typedef RAFLContext
 * @property {HTMLElement} target
 * @property {FourSideObserver} observers
 * @property {DOMRect} rect
 * @property {PositionObserver} self
 * @property {typeof PositionObserver} staticSelf
 * @property {Set<"top" | "right" | "bottom" | "left">} recreationList
 */

/**
 * @callback RAFLCallback
 * @param {RAFLContext} ctx
 * @param {RequestAnimationFrameLoop} loop
 * @param {number} timestamp
 * @returns {void}
 */

/**
 * @typedef FourSideObserver
 * @property {IntersectionObserverHF} top
 * @property {IntersectionObserverHF} right
 * @property {IntersectionObserverHF} bottom
 * @property {IntersectionObserverHF} left
 */

export default class PositionObserver {
  /* dependencies */
  static #IntersectionObserverHF = IntersectionObserverHF;
  static #RequestAnimationFrameLoop = RequestAnimationFrameLoop;

  static #vw = viewportWidth;
  static #vh = viewportHeight;

  /** @type {IntersectionObserverInit} */
  static #options = {
    rootMargin: undefined,
    threshold: Array.from({ length: 101 }, (_, idx) => idx * 0.01),
    root: document,
  };

  /**
   * @type {RAFLCallback}
   */
  static #unobserve(ctx) {
    const { observers, target } = ctx;

    observers.top.unobserve(target);
    observers.right.unobserve(target);
    observers.bottom.unobserve(target);
    observers.left.unobserve(target);
  }

  /**
   * @type {RAFLCallback}
   */
  static #positionChanging(ctx, loop) {
    const { target, rect, self } = ctx;

    const targetRect = target.getBoundingClientRect();
    const { left, top, right, bottom } = targetRect;

    if (
      left === rect.left &&
      top === rect.top &&
      right === rect.right &&
      bottom === rect.bottom
    ) {
      loop.stop();
    } else {
      rect.left = left;
      rect.top = top;
      rect.right = right;
      rect.bottom = bottom;

      self.#callback(target, targetRect, self.#ctx);
    }
  }

  /**
   * @type {RAFLCallback}
   */
  static #createObserver(ctx) {
    const { target, rect, observers, self, staticSelf, recreationList } = ctx;
    const cb = self.#observerCallback;
    const { top, right, bottom, left } = rect;

    const IntersectionObserverHF = staticSelf.#IntersectionObserverHF;
    const options = staticSelf.#options;

    if (recreationList.has('top')) {
      // recreate the top observer
      options.rootMargin = `0px 0px ${-(staticSelf.#vh - top - 2)}px 0px`;
      if (observers.top) observers.top.unobserve(target);
      observers.top = new IntersectionObserverHF(cb, options, self);
    }

    if (recreationList.has('right')) {
      // recreate the right observer
      options.rootMargin = `0px 0px 0px ${-(right - 2)}px`;
      if (observers.right) observers.right.unobserve(target);
      observers.right = new IntersectionObserverHF(cb, options, self);
    }

    if (recreationList.has('bottom')) {
      // recreate the bottom observer
      options.rootMargin = `${-(bottom - 2)}px 0px 0px 0px`;
      if (observers.bottom) observers.bottom.unobserve(target);
      observers.bottom = new IntersectionObserverHF(cb, options, self);
    }

    if (recreationList.has('left')) {
      // recreate the left observer
      options.rootMargin = `0px ${-(staticSelf.#vw - left - 2)}px 0px 0px`;
      if (observers.left) observers.left.unobserve(target);
      observers.left = new IntersectionObserverHF(cb, options, self);
    }

    recreationList.clear();
    observers.top.observe(target);
    observers.right.observe(target);
    observers.bottom.observe(target);
    observers.left.observe(target);
  }

  #callback;
  #ctx;

  /** @type {Map<HTMLElement, FourSideObserver>} */
  #observers = new Map();

  /** @type {Map<HTMLElement, RequestAnimationFrameLoop>} */
  #rafLoops = new Map();

  /** @type {Map<HTMLElement, RAFLContext>} */
  #rafCtxs = new Map();

  /**
   * @param {Array<IntersectionObserverEntry>} entries
   */
  #observerCallback(entries) {
    // the "this" here is an instance of IntersectionObserverHF

    /**
     * @type {PositionObserver}
     */
    const self = this.ctx;
    const { target, boundingClientRect } = entries[entries.length - 1];

    const {
      top: targetTop,
      right: targetRight,
      bottom: targetBottom,
      left: targetLeft,
    } = boundingClientRect;

    const observers = self.#observers.get(target);
    const recreationList = self.#rafCtxs.get(target).recreationList;

    const topRecords =
      this === observers.top ? entries : observers.top.takeRecords();
    const rightRecords =
      this === observers.right ? entries : observers.right.takeRecords();
    const bottomRecords =
      this === observers.bottom ? entries : observers.bottom.takeRecords();
    const leftRecords =
      this === observers.left ? entries : observers.left.takeRecords();

    if (topRecords.length) {
      const { bottom: rootBottom, width: rootWidth } =
        topRecords[topRecords.length - 1].rootBounds;

      PositionObserver.#vw = rootWidth;

      const intersectionHeight = rootBottom - targetTop;

      if (!(1 < intersectionHeight && intersectionHeight < 3)) {
        if (targetTop >= 0) {
          recreationList.add('top');
        }
      }
    }

    if (rightRecords.length) {
      const {
        right: rootRight,
        left: rootLeft,
        height: rootHeight,
      } = rightRecords[rightRecords.length - 1].rootBounds;

      PositionObserver.#vh = rootHeight;
      PositionObserver.#vw = rootRight;

      const intersectionWidth = targetRight - rootLeft;

      if (!(1 < intersectionWidth && intersectionWidth < 3)) {
        if (targetRight <= rootRight) {
          recreationList.add('right');
        }
      }
    }

    if (bottomRecords.length) {
      const {
        top: rootTop,
        bottom: rootBottom,
        width: rootWidth,
      } = bottomRecords[bottomRecords.length - 1].rootBounds;

      PositionObserver.#vw = rootWidth;
      PositionObserver.#vh = rootBottom;

      const intersectionHeight = targetBottom - rootTop;

      if (!(1 < intersectionHeight && intersectionHeight < 3)) {
        if (targetBottom <= rootBottom) {
          recreationList.add('bottom');
        }
      }
    }

    if (leftRecords.length) {
      const { right: rootRight, height: rootHeight } =
        leftRecords[leftRecords.length - 1].rootBounds;

      PositionObserver.#vh = rootHeight;

      const intersectionWidth = rootRight - targetLeft;

      if (!(1 < intersectionWidth && intersectionWidth < 3)) {
        if (targetLeft >= 0) {
          recreationList.add('left');
        }
      }
    }

    if (recreationList.size) {
      self.#callback(target, boundingClientRect, self.#ctx);
      self.#rafLoops.get(target).start();
    }
  }

  /**
   * @param {PositionObserverCallback} callback
   * @param {*} ctx
   */
  constructor(callback, ctx) {
    this.#callback = callback;
    this.#ctx = ctx;
  }

  /**
   * @param {HTMLElement} target
   */
  observe(target) {
    if (this.#observers.has(target)) return;

    const observers = { top: null, right: null, bottom: null, left: null };
    const targetRect = target.getBoundingClientRect();

    /**
     * @type {RAFLContext}
     */
    const ctx = {
      target,
      observers,
      rect: {
        top: targetRect.top,
        right: targetRect.right,
        bottom: targetRect.bottom,
        left: targetRect.left,
      },
      self: this,
      staticSelf: PositionObserver,
      recreationList: new Set(['top', 'right', 'bottom', 'left']),
    };

    const rafLoop = new PositionObserver.#RequestAnimationFrameLoop(ctx)
      .started(PositionObserver.#unobserve)
      .each(PositionObserver.#positionChanging)
      .stopped(PositionObserver.#createObserver);

    PositionObserver.#createObserver(ctx);

    this.#observers.set(target, observers);
    this.#rafLoops.set(target, rafLoop);
    this.#rafCtxs.set(target, ctx);

    this.#callback(target, targetRect, this.#ctx); // initial callback invokation
  }

  /**
   * @param {HTMLElement} target
   */
  unobserve(target) {
    if (!this.#observers.has(target)) return;

    const observers = this.#observers.get(target);
    const ctx = { target, observers };

    PositionObserver.#unobserve(ctx);

    this.#observers.delete(target);
    this.#rafLoops.delete(target);
    this.#rafCtxs.delete(target);
  }

  disconnect() {
    this.#observers.forEach((_, target) => this.unobserve(target));
  }

  /**
   * @returns {MapIterator<HTMLElement>}
   */
  getTargets() {
    return this.#observers.keys();
  }
}
