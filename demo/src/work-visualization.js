import PositionObserver from '../../dist/debug/esm/index.js';

const input = document.querySelector('.observed-element');
const tooltip = document.querySelector('.tooltip');
const { height: tooltipHeight } = tooltip.getBoundingClientRect();

const ctx = {
  tooltip,
  tooltipHeight,
};

function callback(target, targetRect, ctx) {
  const { tooltip, tooltipHeight } = ctx;
  const { left, top } = targetRect;
  const { scrollLeft, scrollTop } = document.documentElement;
  const offsetCorner = 90;

  const x = left - offsetCorner + scrollLeft;
  const y = top - tooltipHeight + scrollTop;

  tooltip.style.transform = `translate(${x}px, ${y}px)`;
}

const positionObserver = new PositionObserver(callback, ctx);

positionObserver.observe(input);
