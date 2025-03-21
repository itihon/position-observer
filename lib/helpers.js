export const unobserve = (ctx) => ctx.observer.unobserve(ctx.target);

export const observe = (ctx) => ctx.observer.observe(ctx.target);

export const positionChanging = (ctx, loop) => {
  const { target, rect } = ctx;

  const targetRect = target.getBoundingClientRect();
  const { left, top, right, bottom } = targetRect;

  if (
    left === rect.left &&
    top === rect.top &&
    right === rect.right &&
    bottom === rect.bottom
  ) {
    loop.stop();
  } else {
    rect.left = left;
    rect.top = top;
    rect.right = right;
    rect.bottom = bottom;

    ctx.callback(target, targetRect, ctx.ctx);
  }
};

/**
 * @param {DOMRect} boundingClientRect
 * @param {DOMRect} intersectionRect
 * @returns {DOMRect}
 */
export const makeCapturedRect = (boundingClientRect, intersectionRect) => {
  const {
    right: targetRight,
    bottom: targetBottom,
    width: targetWidth,
    height: targetHeight,
  } = boundingClientRect;

  const {
    right: intersectionRight,
    top: intersectionTop,
    bottom: intersectionBottom,
    left: intersectionLeft,
  } = intersectionRect;

  const observerLeft = intersectionLeft - (targetRight - intersectionRight);
  const observerTop = intersectionTop - (targetBottom - intersectionBottom);

  return new DOMRect(observerLeft, observerTop, targetWidth, targetHeight);
};

/**
 * @param {IntersectionObserverHF} observer
 */
export const isViewportObserver = (observer) =>
  observer.root === document && observer.rootMargin === '0px 0px 0px 0px';
