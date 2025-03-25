/**
 * @callback RequestAnimationFrameStateCallback
 * @param {*} ctx
 * @param {RequestAnimationFrameLoop} loop
 * @param {number} timestamp
 */

class RequestAnimationFrameLoop {
  #loopID;
  #ctx;
  #startedCB = Function.prototype;
  #eachCB = Function.prototype;
  #stoppedCB = Function.prototype;

  #rAFCallback = (timestamp) => {
    this.#loopID = requestAnimationFrame(this.#rAFCallback);
    this.#eachCB(this.#ctx, this, timestamp);
  };

  constructor(ctx) {
    this.#ctx = ctx;
  }

  /**
   * @param {RequestAnimationFrameStateCallback} cb
   * @returns {RequestAnimationFrameLoop}
   */
  started(cb) {
    this.#startedCB = cb;
    return this;
  }

  /**
   * @param {RequestAnimationFrameStateCallback} cb
   * @returns {RequestAnimationFrameLoop}
   */
  each(cb) {
    this.#eachCB = cb;
    return this;
  }

  /**
   * @param {RequestAnimationFrameStateCallback} cb
   * @returns {RequestAnimationFrameLoop}
   */
  stopped(cb) {
    this.#stoppedCB = cb;
    return this;
  }

  start() {
    if (this.#loopID === undefined) {
      this.#loopID = requestAnimationFrame(this.#rAFCallback);
      this.#startedCB(this.#ctx, this, 0);
    }
  }

  stop() {
    cancelAnimationFrame(this.#loopID);
    this.#stoppedCB(this.#ctx, this, 0);
    this.#loopID = undefined;
  }
}

/**
 * A human friendly intersection observer
 */

/**
 * @callback IntersectionObserverHFCallback
 * @param {Array<IntersectionObserverEntry>} entries
 * @param {*} ctx
 * @returns {void}
 */
class IntersectionObserverHF extends IntersectionObserver {
  #firstCBCallSet = new Set();
  #callback;

  /**
   * @param {IntersectionObserverHFCallback} callback
   * @param {IntersectionObserverInit} options
   * @param {*} ctx
   */
  constructor(callback, options, ctx) {
    function callbackWrapper(entries) {
      this.#callback(entries, ctx);

      for (let i = 0; i < entries.length; i++) {
        this.#firstCBCallSet.delete(entries[i].target);
      }
    }

    super(callbackWrapper, options);

    this.#callback = callback;
  }

  /**
   * @param {HTMLElement} target
   * @returns {boolean}
   */
  isFirstCall(target) {
    return this.#firstCBCallSet.has(target);
  }

  /**
   * @param {HTMLElement} target
   */
  observe(target) {
    this.#firstCBCallSet.add(target);
    super.observe(target);
  }

  /**
   * @param {IntersectionObserverCallback} cb
   */
  setCallback(cb) {
    this.#callback = cb;
  }
}

/**
 * @type {import(".").RAFLCallback}
 */
const unobserve = (ctx) => {
  const { observers, target } = ctx;

  observers.top.unobserve(target);
  observers.right.unobserve(target);
  observers.bottom.unobserve(target);
  observers.left.unobserve(target);
};

/**
 * @type {import(".").RAFLCallback}
 */
const positionChanging = (ctx, loop) => {
  const { target, rect } = ctx;

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

    ctx.callback(target, targetRect, ctx.ctx);
  }
};

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

class PositionObserver {
  /* dependencies */
  static #IntersectionObserverHF = IntersectionObserverHF;
  static #RequestAnimationFrameLoop = RequestAnimationFrameLoop;
  static #unobserve = unobserve;
  static #positionChanging = positionChanging;

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
