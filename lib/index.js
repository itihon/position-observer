import IntersectionObserverHF from './intersection-observer-hf.js';
import RequestAnimationFrameLoop from 'request-animation-frame-loop';

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

  static #vw = window.innerWidth;
  static #vh = window.innerHeight;
  static #scaleFactor = 1;

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

    /*
      +--------------------+-------------------------+-------------------------+
      | Browser / Platform | visualViewport.height   | rootBounds.height       |
      +--------------------+-------------------------+-------------------------+
      | Desktop — Chrome   |            +            |            +            |
      +--------------------+-------------------------+-------------------------+
      | Desktop — Firefox  |            +            |            +            |
      +--------------------+-------------------------+-------------------------+
      | Desktop — Epiphany |            +            |            -            | - needed scale factor calculation for Epiphany
      +--------------------+-------------------------+-------------------------+
      | Mobile — Chrome    |            -            |            +            | - mismatches when elements larger than viewport are attached to the DOM
      +--------------------+-------------------------+-------------------------+
      | Mobile — Firefox   |            +            |            +            |
      +--------------------+-------------------------+-------------------------+

      WebKit based browsers (Epiphany in particular) report IntersectionObserver rootBounds unscaled coordinates.
      Here top and left margins are used to determine scale factor.
    */

    if (recreationList.has('top')) {
      // recreate the top observer
      options.rootMargin = `-1px 0px ${-(staticSelf.#vh - top - 4)}px 0px`;
      if (observers.top) observers.top.unobserve(target);
      observers.top = new IntersectionObserverHF(cb, options, self);
    }

    if (recreationList.has('right')) {
      // recreate the right observer
      options.rootMargin = `0px 0px 0px ${-(right - 4)}px`;
      if (observers.right) observers.right.unobserve(target);
      observers.right = new IntersectionObserverHF(cb, options, self);
    }

    if (recreationList.has('bottom')) {
      // recreate the bottom observer
      options.rootMargin = `${-(bottom - 4)}px 0px 0px 0px`;
      if (observers.bottom) observers.bottom.unobserve(target);
      observers.bottom = new IntersectionObserverHF(cb, options, self);
    }

    if (recreationList.has('left')) {
      // recreate the left observer
      options.rootMargin = `0px ${-(staticSelf.#vw - left - 4)}px 0px -1px`;
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
      const {
        top: scaleFactor,
        bottom: rootBottom,
        width: rootWidth,
      } = topRecords[topRecords.length - 1].rootBounds;

      PositionObserver.#scaleFactor = scaleFactor;
      PositionObserver.#vw = rootWidth / scaleFactor;

      const intersectionHeight = rootBottom / scaleFactor - targetTop;

      if (!(0.1 < intersectionHeight && intersectionHeight < 5)) {
        if (targetTop >= 0) {
          recreationList.add('top');
          // console.log('top', topRecords[topRecords.length - 1].isIntersecting)
        }
      }
    }

    if (rightRecords.length) {
      const {
        right: rootRight,
        left: rootLeft,
        height: rootHeight,
      } = rightRecords[rightRecords.length - 1].rootBounds;

      const scaleFactor = PositionObserver.#scaleFactor;

      PositionObserver.#vh = rootHeight / scaleFactor;
      PositionObserver.#vw = rootRight / scaleFactor;

      const intersectionWidth = targetRight - rootLeft / scaleFactor;
      const isNotOutOfRightViewportBoundary =
        targetRight < document.documentElement.clientWidth;

      if (
        !(0.1 < intersectionWidth && intersectionWidth < 5) &&
        isNotOutOfRightViewportBoundary
      ) {
        if (targetRight <= rootRight) {
          recreationList.add('right');
          // console.log('right', rightRecords[rightRecords.length - 1].isIntersecting)
        }
      }
    }

    if (bottomRecords.length) {
      const {
        top: rootTop,
        bottom: rootBottom,
        width: rootWidth,
      } = bottomRecords[bottomRecords.length - 1].rootBounds;

      const scaleFactor = PositionObserver.#scaleFactor;

      PositionObserver.#vw = rootWidth / scaleFactor;
      PositionObserver.#vh = rootBottom / scaleFactor;

      const intersectionHeight = targetBottom - rootTop / scaleFactor;
      const isNotOutOfBottomViewportBoundary =
        targetBottom < document.documentElement.clientHeight;

      if (
        !(0.1 < intersectionHeight && intersectionHeight < 5) &&
        isNotOutOfBottomViewportBoundary
      ) {
        if (targetBottom <= rootBottom) {
          recreationList.add('bottom');
          // console.log('bottom', bottomRecords[bottomRecords.length - 1].isIntersecting)
        }
      }
    }

    if (leftRecords.length) {
      const {
        left: scaleFactor,
        right: rootRight,
        height: rootHeight,
      } = leftRecords[leftRecords.length - 1].rootBounds;

      PositionObserver.#scaleFactor = scaleFactor;
      PositionObserver.#vh = rootHeight / scaleFactor;

      const intersectionWidth = rootRight / scaleFactor - targetLeft;

      if (!(0.1 < intersectionWidth && intersectionWidth < 5)) {
        if (targetLeft >= 0) {
          recreationList.add('left');
          // console.log('left', leftRecords[leftRecords.length - 1].isIntersecting)
        }
      }
    }

    console.log('scaleFactor:', PositionObserver.#scaleFactor);

    // display: none;
    if (!target.offsetParent) {
      self.#callback(target, boundingClientRect, self.#ctx);
      return; // protection against an infinite loop
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
