/**
 * @callback RequestAnimationFrameStateCallback
 * @param {*} ctx
 * @param {RequestAnimationFrameLoop} loop
 * @param {number} timestamp
 */

export default class RequestAnimationFrameLoop {
  #loopID;
  #ctx;
  #startedCB = Function.prototype;
  #each = Function.prototype;
  #stoppedCB = Function.prototype;

  #rAFCallback = (timestamp) => {
    this.#loopID = requestAnimationFrame(this.#rAFCallback);
    this.#each(this.#ctx, this, timestamp);
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
    this.#each = cb;
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
