/**
 * A human friendly intersection observer
 */

/**
 * @callback IntersectionObserverHFPredicate
 * @param {HTMLElement} target
 */

/**
 * @callback IntersectionObserverHFCallback
 * @param {Array<IntersectionObserverEntry>} entries
 * @param {*} ctx
 */
export default class IntersectionObserverHF extends IntersectionObserver {
  #firstCBCallSet = new Set();
  #callback;

  /**
   * @param {DOMRect} rect
   * @param {number} viewportWidth
   * @param {number} viewportHeight
   * @returns {string}
   */
  static rectToMargin(
    rect = {},
    viewportWidth = innerWidth,
    viewportHeight = innerHeight,
  ) {
    const { left = 0, top = 0, right = 0, bottom = 0 } = rect;

    // for document.documentElement as a root
    // const marginTop = top + scrollTop;
    // const marginRight = offsetWidth - scrollLeft - right;
    // const marginBottom = offsetHeight - scrollTop - bottom;
    // const marginLeft = left + scrollLeft;

    const marginTop = top;
    const marginRight = viewportWidth - right;
    const marginBottom = viewportHeight - bottom;
    const marginLeft = left;

    return `${-marginTop}px ${-marginRight}px ${-marginBottom}px ${-marginLeft}px `;
  }

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
