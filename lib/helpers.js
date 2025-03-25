/**
 * @type {import(".").RAFLCallback}
 */
export const unobserve = (ctx) => {
  const { observers, target } = ctx;

  observers.top.unobserve(target);
  observers.right.unobserve(target);
  observers.bottom.unobserve(target);
  observers.left.unobserve(target);
};

/**
 * @type {import(".").RAFLCallback}
 */
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
