import PositionObserver from "../dist/esm/index.js";

const input = document.querySelector('.observed-element');
const tooltip = document.querySelector('.tooltip');
const { height: tooltipHeight } = tooltip.getBoundingClientRect();

const ctx = {
  tooltip,
  tooltipHeight
};

const callback = (target, targetRect, ctx) => {
  const { tooltip, tooltipHeight } = ctx;
  const { style } = tooltip;
  const { left, top } = targetRect;
  const { scrollLeft, scrollTop } = document.documentElement;
  const offsetCorner = 90;

  style.transform = `translate(${left - offsetCorner + scrollLeft}px, ${top - tooltipHeight + scrollTop}px)`;
};

const positionObserver = new PositionObserver(callback, ctx);

positionObserver.observe(input);