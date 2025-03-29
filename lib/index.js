import IntersectionObserverHF from './intersection-observer-hf.js';
import RequestAnimationFrameLoop from 'request-animation-frame-loop';

// initial viewport rect
const viewportRect = await new Promise((res) => {
  const observer = new IntersectionObserver(
    (entries) => {
      res(entries[0].rootBounds);
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

  static #widthDiff = viewportWidth - innerWidth;
  static #heightDiff = viewportHeight - innerHeight;

  /** @type {IntersectionObserverInit} */
  static #options = {
    rootMargin: undefined,
    threshold: Array.from({ length: 100 }, (_, idx) => idx * 0.001),
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
  static #observe(ctx) {
    const { observers, target } = ctx;

    observers.top.observe(target);
    observers.right.observe(target);
    observers.bottom.observe(target);
    observers.left.observe(target);
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
   * @param {HTMLElement} target
   * @param {DOMRect} targetRect
   * @param {"top" | "right" | "bottom" | "left"} side
   * @param {FourSideObserver} observers
   * @param {PositionObserver} self
   */
  static #createObserver(target, targetRect, side, observers, self) {
    const cb = self.#observerCallback;
    const { top, right, bottom, left } = targetRect;

    const viewportWidth = innerWidth + this.#widthDiff;
    const viewportHeight = innerHeight + this.#heightDiff;
    const IntersectionObserverHF = this.#IntersectionObserverHF;
    const options = this.#options;

    if (side === 'top') {
      // recreate the top observer
      options.rootMargin = `0px 0px ${-(viewportHeight - top - 2)}px 0px`;
      if (observers.top) observers.top.unobserve(target);
      observers.top = new IntersectionObserverHF(cb, options, self);
      observers.top.observe(target);
    }

    if (side === 'right') {
      // recreate the right observer
      options.rootMargin = `0px 0px 0px ${-(right - 2)}px`;
      if (observers.right) observers.right.unobserve(target);
      observers.right = new IntersectionObserverHF(cb, options, self);
      observers.right.observe(target);
    }

    if (side === 'bottom') {
      // recreate the bottom observer
      options.rootMargin = `${-(bottom - 2)}px 0px 0px 0px`;
      if (observers.bottom) observers.bottom.unobserve(target);
      observers.bottom = new IntersectionObserverHF(cb, options, self);
      observers.bottom.observe(target);
    }

    if (side === 'left') {
      // recreate the left observer
      options.rootMargin = `0px ${-(viewportWidth - left - 2)}px 0px 0px`;
      if (observers.left) observers.left.unobserve(target);
      observers.left = new IntersectionObserverHF(cb, options, self);
      observers.left.observe(target);
    }
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
   * @param {PositionObserver} self
   */
  #observerCallback(entries, self) {
    // the "this" here is an instance of IntersectionObserverHF

    const { target, boundingClientRect, rootBounds } =
      entries[entries.length - 1];

    const observers = self.#observers.get(target);

    const {
      top: targetTop,
      right: targetRight,
      bottom: targetBottom,
      left: targetLeft,
    } = boundingClientRect;

    const {
      top: rootTop,
      right: rootRight,
      bottom: rootBottom,
      left: rootLeft,
    } = rootBounds;

    if (this === observers.top) {
      const intersectionHeight = rootBottom - targetTop;

      if (!(1 < intersectionHeight && intersectionHeight < 2)) {
        if (this.isFirstCall(target)) {
          PositionObserver.#createObserver(
            target,
            boundingClientRect,
            'top',
            observers,
            self,
          );
        } else {
          self.#rafLoops.get(target).start();
        }
        return;
      }
    }

    if (this === observers.right) {
      const intersectionWidth = targetRight - rootLeft;

      if (!(1 < intersectionWidth && intersectionWidth < 2)) {
        if (this.isFirstCall(target)) {
          PositionObserver.#createObserver(
            target,
            boundingClientRect,
            'right',
            observers,
            self,
          );
        } else {
          self.#rafLoops.get(target).start();
        }
        return;
      }
    }

    if (this === observers.bottom) {
      const intersectionHeight = targetBottom - rootTop;

      if (!(1 < intersectionHeight && intersectionHeight < 2)) {
        if (this.isFirstCall(target)) {
          PositionObserver.#createObserver(
            target,
            boundingClientRect,
            'bottom',
            observers,
            self,
          );
        } else {
          self.#rafLoops.get(target).start();
        }
        return;
      }
    }

    if (this === observers.left) {
      const intersectionWidth = rootRight - targetLeft;

      if (!(1 < intersectionWidth && intersectionWidth < 2)) {
        if (this.isFirstCall(target)) {
          PositionObserver.#createObserver(
            target,
            boundingClientRect,
            'left',
            observers,
            self,
          );
        } else {
          self.#rafLoops.get(target).start();
        }
        return;
      }
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
    };

    const rafLoop = new PositionObserver.#RequestAnimationFrameLoop(ctx)
      .started(PositionObserver.#unobserve)
      .each(PositionObserver.#positionChanging)
      .stopped(PositionObserver.#observe);

    PositionObserver.#createObserver(
      target,
      targetRect,
      'top',
      observers,
      this,
    );
    PositionObserver.#createObserver(
      target,
      targetRect,
      'right',
      observers,
      this,
    );
    PositionObserver.#createObserver(
      target,
      targetRect,
      'bottom',
      observers,
      this,
    );
    PositionObserver.#createObserver(
      target,
      targetRect,
      'left',
      observers,
      this,
    );

    this.#observers.set(target, observers);
    this.#rafLoops.set(target, rafLoop);
    this.#rafCtxs.set(target, ctx);

    this.#callback(target, targetRect, this.#ctx); // initial callback invokation
  }

  /**
   * @param {HTMLElement} target
   */
  unobserve(target) {
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
}
