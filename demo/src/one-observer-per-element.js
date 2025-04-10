import PositionObserver from '../../dist/esm/index.js';

const input = document.querySelector('.observed-element');
const tooltip = document.querySelector('.tooltip');
const { height: tooltipHeight } = tooltip.getBoundingClientRect();

const container = input.parentNode;

input.remove();
tooltip.remove();

function callback(target, targetRect, ctx) {
  const { container, tooltip, tooltipHeight } = ctx;
  const { left, top } = targetRect;
  const { scrollLeft, scrollTop } = document.documentElement;
  const offsetCorner = 60;
  const {
    top: containerTop,
    right: containerRight,
    bottom: containerBottom,
    left: containerLeft,
  } = container.getBoundingClientRect();

  const x = left - offsetCorner + scrollLeft;
  const y = top - tooltipHeight + scrollTop;

  tooltip.style.transform = `translate(${x}px, ${y}px)`;

  if (
    left < containerLeft ||
    left > containerRight ||
    top < containerTop ||
    top > containerBottom
  ) {
    tooltip.style.display = 'none';
  } else {
    tooltip.style.display = 'block';
  }
}

for (let i = 0; i < 100; i++) {
  const clonedInput = input.cloneNode();
  const clonedTooltip = tooltip.cloneNode(true);

  container.appendChild(clonedInput);
  document.body.appendChild(clonedTooltip);

  const ctx = {
    container,
    tooltip: clonedTooltip,
    tooltipHeight,
  };

  const positionObserver = new PositionObserver(callback, ctx);

  positionObserver.observe(clonedInput);
}
