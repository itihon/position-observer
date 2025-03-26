import './input-position-observer.js';

const resizeBtn = document.querySelector('[name="resizeBtn"]');
const container = resizeBtn.parentNode.firstElementChild;
const { width, height } = container.getBoundingClientRect();

container.scroll({ behavior: 'smooth', left: container.scrollWidth / 2 - width / 2, top: container.scrollHeight / 2 - height / 2});

let containerRect;
let event;

function resizing(e) {
  event = e;
  requestAnimationFrame(resize);
};

function resize() {
  const { scrollLeft, scrollTop } = document.documentElement;
  containerRect = container.getBoundingClientRect(); 

  container.style.width = `${event.x - containerRect.left + 48 + scrollLeft}px`;
  container.style.height = `${event.y - containerRect.top + 48 + scrollTop}px`;
}

resizeBtn.addEventListener('pointerdown', (e) => {
  resizeBtn.onpointermove = resizing;
  resizeBtn.setPointerCapture(e.pointerId);
});

resizeBtn.addEventListener('pointerup', (e) => {
  resizeBtn.onpointermove = null;
  resizeBtn.releasePointerCapture(e.pointerId);
});

