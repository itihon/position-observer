import IntersectionObserverHF from './intersection-observer-hf.js';
import RequestAnimationFrameLoop from 'request-animation-frame-loop';
import * as helpers from './helpers.js';

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
 * @property {DOMRect} initialRect
 * @property {PositionObserverCallback} callback
 * @property {PositionObserver} self
 * @property {typeof PositionObserver} staticSelf
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
  static #unobserve = helpers.unobserve;
  static #positionChanging = helpers.positionChanging;

  static #widthDiff = viewportWidth - innerWidth;
  static #heightDiff = viewportHeight - innerHeight;

  /** @type {IntersectionObserverInit} */
  static #options = {
    rootMargin: undefined,
    threshold: Array.from({ length: 100 }, (_, idx) => idx * 0.001),
    root: document,
  };

  /**
   * @param {RAFLContext} ctx
   */
  static #repopulateObservers(ctx) {
    const { target, initialRect, rect, observers, self, staticSelf } = ctx;
    const cb = self.#observerCallback;

    const {
      top: oldTop,
      right: oldRight,
      bottom: oldBottom,
      left: oldLeft,
    } = initialRect;

    const {
      top: newTop,
      right: newRight,
      bottom: newBottom,
      left: newLeft,
    } = rect;

    const viewportWidth = innerWidth + staticSelf.#widthDiff;
    const viewportHeight = innerHeight + staticSelf.#heightDiff;

    const IntersectionObserverHF = staticSelf.#IntersectionObserverHF;
    const options = staticSelf.#options;

    if (oldTop !== newTop) {
      // recreate the top observer
      options.rootMargin = `0px 0px ${-(viewportHeight - newTop - 2)}px 0px`;
      observers.top = new IntersectionObserverHF(cb, options, self);
    }

    if (oldRight !== newRight) {
      // recreate the right observer
      options.rootMargin = `0px 0px 0px ${-(newRight - 2)}px`;
      observers.right = new IntersectionObserverHF(cb, options, self);
    }

    if (oldBottom !== newBottom) {
      // recreate the bottom observer
      options.rootMargin = `${-(newBottom - 2)}px 0px 0px 0px`;
      observers.bottom = new IntersectionObserverHF(cb, options, self);
    }

    if (oldLeft !== newLeft) {
      // recreate the left observer
      options.rootMargin = `0px ${-(viewportWidth - newLeft - 2)}px 0px 0px`;
      observers.left = new IntersectionObserverHF(cb, options, self);
    }

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
   * @param {PositionObserver} self
   */
  #observerCallback(entries, self) {
    // the "this" here is an instance of IntersectionObserverHF

    const { target, boundingClientRect } = entries[0];

    if (!this.isFirstCall(target)) {
      self.#rafLoops.get(target).start();
    } else {
      self.#rafCtxs.get(target).initialRect = boundingClientRect;
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
      initialRect: { top: 0, right: 0, bottom: 0, left: 0 },
      rect: {
        top: targetRect.top,
        right: targetRect.right,
        bottom: targetRect.bottom,
        left: targetRect.left,
      },
      callback: this.#callback,
      ctx: this.#ctx,
      self: this,
      staticSelf: PositionObserver,
    };

    PositionObserver.#repopulateObservers(ctx);

    const rafLoop = new PositionObserver.#RequestAnimationFrameLoop(ctx)
      .started(PositionObserver.#unobserve)
      .each(PositionObserver.#positionChanging)
      .stopped(PositionObserver.#repopulateObservers);

    this.#observers.set(target, observers);
    this.#rafLoops.set(target, rafLoop);
    this.#rafCtxs.set(target, ctx);
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
