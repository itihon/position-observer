import { callbackRegistry, preventCall } from './globals.js';

const positionChanging = (observer, target, isVisible) => {
  observer.unobserve(target);

  let prevLeft = Infinity;
  let prevTop = Infinity;
  let prevRight = Infinity;
  let prevBottom = Infinity;

  const rAF = () => {
    const targetRect = target.getBoundingClientRect();
    const { left, top, right, bottom } = targetRect;

    if (
      left === prevLeft &&
      top === prevTop &&
      right === prevRight &&
      bottom === prevBottom
    ) {
      // position changing stopped
      preventCall.add(target);
      observer.observe(target);
    } else {
      prevLeft = left;
      prevTop = top;
      prevRight = right;
      prevBottom = bottom;

      callbackRegistry.get(target)(target, targetRect, isVisible);

      requestAnimationFrame(rAF);
    }
  };

  requestAnimationFrame(rAF);
};

export default positionChanging;
