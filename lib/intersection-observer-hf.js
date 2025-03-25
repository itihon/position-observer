/**
 * A human friendly intersection observer
 */

/**
 * @callback IntersectionObserverHFCallback
 * @param {Array<IntersectionObserverEntry>} entries
 * @param {*} ctx
 * @returns {void}
 */
export default class IntersectionObserverHF extends IntersectionObserver {
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
