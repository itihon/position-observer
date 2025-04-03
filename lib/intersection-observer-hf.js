/**
 * A wrapper for intersection observer
 * needed to have access to more than one context inside a callback
 */

/**
 * @callback IntersectionObserverHFCallback
 * @param {Array<IntersectionObserverEntry>} entries
 * @returns {void}
 */
export default class IntersectionObserverHF extends IntersectionObserver {
  /**
   * @param {IntersectionObserverHFCallback} callback
   * @param {IntersectionObserverInit} options
   * @param {*} ctx
   */
  constructor(callback, options, ctx) {
    super(callback, options);
    this.ctx = ctx;
  }
}
