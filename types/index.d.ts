/**
 * @callback PositionObserverCallback
 * @param {HTMLElement} target
 * @param {DOMRect} targetRect
 * @param {*} ctx
 * @returns {void}
 */

export default class PositionObserver {
    /**
     * @param {PositionObserverCallback} callback
     * @param {*} ctx
     */
    constructor(callback: PositionObserverCallback, ctx: any);
    /**
     * @param {HTMLElement} target
     */
    observe(target: HTMLElement): void;
    /**
     * @param {HTMLElement} target
     */
    unobserve(target: HTMLElement): void;
    disconnect(): void;
    #private;
}
export type PositionObserverCallback = (target: HTMLElement, targetRect: DOMRect, ctx: any) => void;
