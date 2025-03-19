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
 * @param {IntersectionObserverHF} observer
 * @param {IntersectionObserverHFPredicate} isFirstCall
 */
export default class IntersectionObserverHF extends IntersectionObserver {
  #firstCBCallSet = new Set();
  #callback;

  /**
   * @param {HTMLElement} target
   */
  #isFirstCall = (target) => {
    return this.#firstCBCallSet.has(target);
  };

  /**
   * @param {DOMRect} rect
   * @returns {string}
   */
  static rectToMargin(rect) {
    const { left = 0, top = 0, right = 0, bottom = 0 } = rect;
    const { clientWidth, clientHeight } = document.documentElement;

    const marginTop = top - 1;
    const marginRight = clientWidth - (right + 2);
    const marginBottom = clientHeight - (bottom + 2);
    const marginLeft = left - 1;

    return `${-marginTop}px ${-marginRight}px ${-marginBottom}px ${-marginLeft}px `;
  }

  /**
   * @param {IntersectionObserverHFCallback} callback
   * @param {IntersectionObserverInit} options
   */
  constructor(callback, options) {
    const callbackWrapper = (entries) => {
      this.#callback(entries, this, this.#isFirstCall);
      entries.forEach((entry) => this.#firstCBCallSet.delete(entry.target));
    };

    super(callbackWrapper, options);

    this.#callback = callback;
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
