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
    /**
     * @param {IntersectionObserverHFCallback} callback
     * @param {IntersectionObserverInit} options
     * @param {*} ctx
     */
    constructor(callback: IntersectionObserverHFCallback, options: IntersectionObserverInit, ctx: any);
    /**
     * @param {HTMLElement} target
     * @returns {boolean}
     */
    isFirstCall(target: HTMLElement): boolean;
    /**
     * @param {HTMLElement} target
     */
    observe(target: HTMLElement): void;
    /**
     * @param {IntersectionObserverCallback} cb
     */
    setCallback(cb: IntersectionObserverCallback): void;
    #private;
}
export type IntersectionObserverHFCallback = (entries: Array<IntersectionObserverEntry>, ctx: any) => void;
