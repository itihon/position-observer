export default class VisibilityChecker extends IntersectionObserver {
  /** @type {Map<HTMLElement, "FULLY_VISIBLE" | "PARTLY_VISIBLE" | "INVISIBLE">} */
  #states = new Map();

  // /** @type {Map<HTMLElement, IntersectionObserverEntry>} */
  // #records = new Map();

  /**
   * @param {IntersectionObserverEntry} entry
   */
  #handleEntry = (entry) => {
    const { target, isIntersecting, intersectionRatio } = entry;

    // this.#records.set(target, entry);

    if (isIntersecting) {
      if (intersectionRatio === 1) {
        this.#states.set(target, 'FULLY_VISIBLE');
        return;
      }

      if (intersectionRatio < 1) {
        this.#states.set(target, 'PARTLY_VISIBLE');
        return;
      }
    } else {
      this.#states.set(target, 'INVISIBLE');
      return;
    }
  };

  #updateStates() {
    this.takeRecords().forEach(this.#handleEntry);
  }

  constructor() {
    /** @type {IntersectionObserverCallback}  */
    const updateStatesCB = (entries) => {
      entries.forEach(this.#handleEntry);
    };

    super(updateStatesCB, { root: document, threshold: [0, 1] });
  }

  /**
   * @param {HTMLElement} target
   * @returns {"FULLY_VISIBLE" | "PARTLY_VISIBLE" | "INVISIBLE"}
   */
  getVisibilityState(target) {
    this.#updateStates();
    return this.#states.get(target);
  }

  // /**
  //  * @param {HTMLElement} target
  //  * @returns {IntersectionObserverEntry}
  //  */
  // getLastRecord(target) {
  //   this.#updateStates();
  //   return this.#records.get(target);
  // }

  /**
   * @param {HTMLElement} target
   * @returns {boolean}
   */
  isFullyVisible(target) {
    this.#updateStates();
    return this.#states.get(target) === 'FULLY_VISIBLE';
  }

  /**
   * @param {HTMLElement} target
   * @returns {boolean}
   */
  isPartlyVisible(target) {
    this.#updateStates();
    return this.#states.get(target) === 'PARTLY_VISIBLE';
  }

  /**
   * @param {HTMLElement} target
   * @returns {boolean}
   */
  isInvisible(target) {
    this.#updateStates();
    return this.#states.get(target) === 'INVISIBLE';
  }

  /**
   * @param {HTMLElement} target
   */
  unobserve(target) {
    this.#states.delete(target);
    // this.#records.delete(target);
    super.unobserve(target);
  }

  disconnect() {
    this.#states.clear();
    // this.#records.clear();
    super.disconnect();
  }
}
