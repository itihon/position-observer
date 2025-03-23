import IntersectionObserverHF from './intersection-observer-hf.js';
import { showObservingArea, showCapturedArea } from '../__test__/debug.js';
import RequestAnimationFrameLoop from './request-animation-frame-loop.js';
import VisibilityChecker from './visibility-checker.js';
import * as helpers from './helpers.js';

/**
 * @callback PositionObserverCallback
 */

/**
 * @typedef RAFLContext
 * @property {HTMLElement} target
 * @property {IntersectionObserverHF} observer
 * @property {DOMRect} rect
 * @property {PositionObserverCallback} callback
 */

export default class PositionObserver {
  /* dependencies */
  static #IntersectionObserverHF = IntersectionObserverHF;
  static #RequestAnimationFrameLoop = RequestAnimationFrameLoop;
  static #visibilityChecker = VisibilityChecker;
  static #unobserve = helpers.unobserve;
  static #observe = helpers.observe;
  static #positionChanging = helpers.positionChanging;
  static #makeCapturedRect = helpers.makeCapturedRect;
  static #isViewportObserver = helpers.isViewportObserver;

  /** @type {IntersectionObserverInit} */
  static #options = {
    rootMargin: undefined,
    threshold: Array.from({ length: 1001 }, (_, idx) => idx * 0.001),
    root: document, // without this a parent element was considered as root in VSCode's preview extension
  };

  /**
   * @param {DOMRect} rect
   * @param {import('./intersection-observer-hf.js').IntersectionObserverHFCallback} cb
   * @param {PositionObserver} self
   * @returns {IntersectionObserverHF}
   */
  static #createObserver(rect, cb, self) {
    const IntersectionObserverHF = this.#IntersectionObserverHF;
    const options = this.#options;
    const { width, height } = this.#visibilityChecker.getLastViewportRect();

    if (rect) {
      options.rootMargin = IntersectionObserverHF.rectToMargin(
        rect,
        width,
        height,
      );
    } else {
      options.rootMargin = undefined;
    }

    return new IntersectionObserverHF(cb, options, self);
  }

  #callback;
  #ctx;

  /** @type {Map<HTMLElement, IntersectionObserverHF>} */
  #observers = new Map();

  /** @type {Map<HTMLElement, RequestAnimationFrameLoop>} */
  #rafLoops = new Map();

  /** @type {Map<HTMLElement, RAFLContext>} */
  #rafCtxs = new Map();

  #handleEvent() {
    const { self } = this;

    // !!! refactor it in order to get rid of arrow function and parent scope access
    requestAnimationFrame(() => {
      for (let [target, currentObserver] of self.#observers) {
        const boundingClientRect = target.getBoundingClientRect();

        const newObserver = PositionObserver.#createObserver(
          boundingClientRect,
          self.#elementObserverCallback,
          self,
        );

        self.#updateReferences(currentObserver, newObserver, target);
        self.#rafLoops.get(target).start();
      }
    });
  }

  #resizeEventHandler = {
    self: this,
    handleEvent: this.#handleEvent,
  };

  /**
   * @param {IntersectionObserverHF} oldObserver
   * @param {IntersectionObserverHF} newObserver
   * @param {HTMLElement} target
   */
  #updateReferences(oldObserver, newObserver, target) {
    oldObserver.unobserve(target);
    this.#observers.set(target, newObserver);
    this.#rafCtxs.get(target).observer = newObserver;
    newObserver.observe(target);
  }

  /**
   * @param {IntersectionObserverEntry} entry
   * @returns {boolean}
   */
  #detectPositionChange(entry) {
    const { intersectionRatio, target } = entry;

    // position change detected, start a request animation frame loop
    if (intersectionRatio < 1) {
      this.#rafLoops.get(target).start();
      return true;
    }
  }

  /**
   * @param {IntersectionObserverEntry} entry
   * @param {IntersectionObserverHF} currentObserver
   * @returns {boolean}
   */
  #detectOverlap(entry, currentObserver) {
    const { isIntersecting, target, boundingClientRect } = entry;

    if (PositionObserver.#isViewportObserver(currentObserver)) {
      if (isIntersecting) {
        const visibilityState =
          PositionObserver.#visibilityChecker.getVisibilityState(target);

        // recreate the observer with new target's bounds
        if (visibilityState === 'FULLY_VISIBLE') {
          const newObserver = PositionObserver.#createObserver(
            boundingClientRect,
            this.#elementObserverCallback,
            this,
          );

          this.#updateReferences(currentObserver, newObserver, target);

          return true;
        }

        // partial target overlap detected, recreate the observer captured in the overlapping container's boundaries
        if (visibilityState === 'PARTLY_VISIBLE') {
          const { intersectionRect, boundingClientRect } =
            PositionObserver.#visibilityChecker.getLastRecord(target);

          const capturedRect = PositionObserver.#makeCapturedRect(
            boundingClientRect,
            intersectionRect,
          );

          const newObserver = PositionObserver.#createObserver(
            capturedRect,
            this.#elementObserverCallback,
            this,
          );

          this.#updateReferences(currentObserver, newObserver, target);

          return true;
        }
      }
    } else {
      if (!isIntersecting) {
        const visibilityState =
          PositionObserver.#visibilityChecker.getVisibilityState(target);

        // recreate the observer with new target's bounds
        if (visibilityState === 'FULLY_VISIBLE') {
          const newObserver = PositionObserver.#createObserver(
            boundingClientRect,
            this.#elementObserverCallback,
            this,
          );

          this.#updateReferences(currentObserver, newObserver, target);

          return true;
        }

        // partial target overlap detected, recreate the observer captured in the overlapping container's boundaries
        if (visibilityState === 'PARTLY_VISIBLE') {
          const { intersectionRect, boundingClientRect } =
            PositionObserver.#visibilityChecker.getLastRecord(target);

          const capturedRect = PositionObserver.#makeCapturedRect(
            boundingClientRect,
            intersectionRect,
          );

          /* DEBUG */
          showCapturedArea({ rootBounds: capturedRect });
          /* END OF DEBUG */

          const newObserver = PositionObserver.#createObserver(
            capturedRect,
            this.#elementObserverCallback,
            this,
          );

          this.#updateReferences(currentObserver, newObserver, target);

          return true;
        }

        // recreate the observer with the screen viewport bounds
        if (visibilityState === 'INVISIBLE') {
          const newObserver = PositionObserver.#createObserver(
            undefined,
            this.#elementObserverCallback,
            this,
          );

          this.#updateReferences(currentObserver, newObserver, target);

          return true;
        }
      }
    }
  }

  /**
   * @param {Array<IntersectionObserverEntry>} entries
   * @param {PositionObserver} self
   */
  #elementObserverCallback(entries, self) {
    // the "this" here is an instance of IntersectionObserverHF

    /* DEBUG */
    entries.forEach(showObservingArea);
    console.log(this);
    console.log(
      PositionObserver.#visibilityChecker.getVisibilityState(entries[0].target),
    );
    /* END OF DEBUG */

    if (!this.isFirstCall(entries[0].target)) {
      for (let i = 0; i < entries.length; i++) {
        if (self.#detectPositionChange(entries[i])) return;
      }
    } else {
      for (let i = 0; i < entries.length; i++) {
        if (self.#detectOverlap(entries[i], this)) return;
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
    addEventListener('resize', this.#resizeEventHandler);
  }

  /**
   * @param {HTMLElement} target
   */
  observe(target) {
    const rect = target.getBoundingClientRect();

    const observer = PositionObserver.#createObserver(
      rect,
      this.#elementObserverCallback,
      this,
    );

    const ctx = {
      target,
      observer,
      rect: { ...new DOMRect() },
      callback: this.#callback,
      ctx: this.#ctx,
    };

    const rafLoop = new PositionObserver.#RequestAnimationFrameLoop(ctx)
      .started(PositionObserver.#unobserve)
      .each(PositionObserver.#positionChanging)
      .stopped(PositionObserver.#observe);

    this.#observers.set(target, observer);
    this.#rafLoops.set(target, rafLoop);
    this.#rafCtxs.set(target, ctx);

    observer.observe(target);
    PositionObserver.#visibilityChecker.observe(target);
  }

  /**
   * @param {HTMLElement} target
   */
  unobserve(target) {
    this.#observers.get(target).unobserve(target);
    PositionObserver.#visibilityChecker.unobserve(target);
    this.#observers.delete(target);
    this.#rafLoops.delete(target);
    this.#rafCtxs.delete(target);
  }

  disconnect() {
    this.#observers.forEach((_, target) => this.unobserve(target));
  }
}
