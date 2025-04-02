/**
 * A human friendly intersection observer
 * needed to have access to more than one context inside a callback
 */

/**
 * @callback IntersectionObserverHFCallback
 * @param {Array<IntersectionObserverEntry>} entries
 * @param {*} ctx
 * @returns {void}
 */
export default class IntersectionObserverHF extends IntersectionObserver {
  #callback;

  /**
   * @param {IntersectionObserverHFCallback} callback
   * @param {IntersectionObserverInit} options
   * @param {*} ctx
   */
  constructor(callback, options, ctx) {
    function callbackWrapper(entries) {
      this.#callback(entries, ctx);
    }

    super(callbackWrapper, options);

    this.#callback = callback;
  }
}
