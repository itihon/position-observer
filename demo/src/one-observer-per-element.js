import PositionObserver from '@itihon/position-observer';

const input = document.querySelector('.observed-element');
const tooltip = document.querySelector('.tooltip');
const { height: tooltipHeight } = tooltip.getBoundingClientRect();

const container = input.parentNode;
let containerRect = container.getBoundingClientRect();

input.remove();
tooltip.remove();

function callback(target, targetRect, ctx) {
  const { containerRect, tooltip, tooltipHeight, scrollLeft, scrollTop } = ctx;
  const { left, top } = targetRect;
  const offsetCorner = 25;
  const {
    top: containerTop,
    right: containerRight,
    bottom: containerBottom,
    left: containerLeft,
  } = containerRect;

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
    scrollTop: 0,
    scrollLeft: 0,
    containerRect,
    tooltip: clonedTooltip,
    tooltipHeight,
  };

  const positionObserver = new PositionObserver(callback, ctx);

  new ResizeObserver(() => {
    ctx.containerRect = container.getBoundingClientRect();
  }).observe(container);

  document.addEventListener('scroll', () => {
    const { scrollLeft, scrollTop } = document.documentElement;
    ctx.scrollLeft = scrollLeft;
    ctx.scrollTop = scrollTop;
  });

  positionObserver.observe(clonedInput);
}
