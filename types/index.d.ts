/**
 * @callback PositionObserverCallback
 * @param {HTMLElement} target
 * @param {DOMRect} targetRect
 * @param {*} ctx
 * @returns {void}
 */
/**
 * @typedef RAFLContext
 * @property {HTMLElement} target
 * @property {FourSideObserver} observers
 * @property {DOMRect} rect
 * @property {DOMRect} initialRect
 * @property {PositionObserverCallback} callback
 * @property {PositionObserver} self
 * @property {typeof PositionObserver} staticSelf
 */
/**
 * @callback RAFLCallback
 * @param {RAFLContext} ctx
 * @param {RequestAnimationFrameLoop} loop
 * @param {number} timestamp
 * @returns {void}
 */
/**
 * @typedef FourSideObserver
 * @property {IntersectionObserverHF} top
 * @property {IntersectionObserverHF} right
 * @property {IntersectionObserverHF} bottom
 * @property {IntersectionObserverHF} left
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
}
export type PositionObserverCallback = (target: HTMLElement, targetRect: DOMRect, ctx: any) => void;
export type RAFLContext = {
    target: HTMLElement;
    observers: FourSideObserver;
    rect: DOMRect;
    initialRect: DOMRect;
    callback: PositionObserverCallback;
    self: PositionObserver;
    staticSelf: typeof PositionObserver;
};
export type RAFLCallback = (ctx: RAFLContext, loop: RequestAnimationFrameLoop, timestamp: number) => void;
export type FourSideObserver = {
    top: IntersectionObserverHF;
    right: IntersectionObserverHF;
    bottom: IntersectionObserverHF;
    left: IntersectionObserverHF;
};
import IntersectionObserverHF from './intersection-observer-hf.js';
