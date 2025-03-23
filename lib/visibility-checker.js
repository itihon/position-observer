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

export default new (class VisibilityChecker extends IntersectionObserver {
  #initialViewportRect = viewportRect;
  #lastViewportRect;

  /** @type {Map<HTMLElement, "FULLY_VISIBLE" | "PARTLY_VISIBLE" | "INVISIBLE">} */
  #states = new Map();

  /** @type {Map<HTMLElement, IntersectionObserverEntry>} */
  #records = new Map();

  /**
   * @param {IntersectionObserverEntry} entry
   */
  #handleEntry(entry) {
    const { target, isIntersecting, intersectionRatio, rootBounds } = entry;

    this.#lastViewportRect = rootBounds;
    this.#records.set(target, entry);

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
  }

  #updateStates() {
    const entries = this.takeRecords();
    for (let i = 0; i < entries.length; i++) {
      this.#handleEntry(entries[i]);
    }
  }

  constructor() {
    /** @type {IntersectionObserverCallback}  */
    function updateStatesCB(entries) {
      for (let i = 0; i < entries.length; i++) {
        this.#handleEntry(entries[i]);
      }
    }

    super(updateStatesCB, { root: document, threshold: [0, 1] });
    this.observe(document.documentElement);
  }

  /**
   * @param {HTMLElement} target
   * @returns {"FULLY_VISIBLE" | "PARTLY_VISIBLE" | "INVISIBLE"}
   */
  getVisibilityState(target) {
    this.#updateStates();
    return this.#states.get(target);
  }

  /**
   * @param {HTMLElement} target
   * @returns {IntersectionObserverEntry}
   */
  getLastRecord(target) {
    this.#updateStates();
    const lastRecord = this.#records.get(target);
    this.unobserve(target);
    this.observe(target);
    return lastRecord;
  }

  /**
   * @returns {DOMRect}
   */
  getLastViewportRect() {
    this.#updateStates();
    const lastViewportRect =
      this.#lastViewportRect || this.#initialViewportRect;
    this.unobserve(document.documentElement);
    this.observe(document.documentElement);
    return lastViewportRect;
  }

  /**
   * @param {HTMLElement} target
   */
  unobserve(target) {
    this.#states.delete(target);
    this.#records.delete(target);
    super.unobserve(target);
  }

  disconnect() {
    this.#states.clear();
    this.#records.clear();
    super.disconnect();
  }
})();
