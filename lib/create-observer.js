const thresholds = Array.from({ length: 1001 }, (_, idx) => idx * 0.001);

const createObserver = (
  rect,
  callback = Function.prototype,
  threshold = thresholds,
) => {
  const config = {
    rootMargin: undefined,
    threshold,
    root: document, // without this a parent element was considered as root in VSCode
  };

  if (rect) {
    const { left = 0, top = 0, right = 0, bottom = 0 } = rect;
    const { clientWidth, clientHeight } = document.documentElement;

    const marginTop = top - 1;
    const marginRight = clientWidth - (right + 2);
    const marginBottom = clientHeight - (bottom + 2);
    const marginLeft = left - 1;

    config.rootMargin = `${-marginTop}px ${-marginRight}px ${-marginBottom}px ${-marginLeft}px `;
  }

  return new IntersectionObserver(callback, config);
};

export default createObserver;
