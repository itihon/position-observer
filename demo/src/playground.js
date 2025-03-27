const resizeBtn = document.querySelector('[name="resizeBtn"]');
const undoBtn = document.querySelector('[name="undoBtn"]');
const container = resizeBtn.parentNode.firstElementChild;
const { width, height } = container.getBoundingClientRect();

container.scroll({ 
  behavior: 'smooth', 
  left: container.scrollWidth / 2 - width / 2, 
  top: container.scrollHeight / 2 - height / 2
});

let containerRect;
let event;

function resizing(e) {
  event = e;
  requestAnimationFrame(resize);
};

function resize() {
  resizeBtn.classList.remove('title-visible');

  containerRect = container.getBoundingClientRect(); 
  container.style.width = `${event.x - containerRect.left + 48}px`;
  container.style.height = `${event.y - containerRect.top + 48}px`;
}

resizeBtn.addEventListener('pointerdown', (e) => {
  resizeBtn.classList.add('title-visible');
  resizeBtn.onpointermove = resizing;
  resizeBtn.setPointerCapture(e.pointerId);
});

resizeBtn.addEventListener('pointerup', (e) => {
  resizeBtn.classList.remove('title-visible');
  resizeBtn.onpointermove = null;
  resizeBtn.releasePointerCapture(e.pointerId);
});

undoBtn.addEventListener('click', () => {
  const originalWidth = getComputedStyle(
    document.documentElement
  ).getPropertyValue('--playground-width');

  const originalHeight = getComputedStyle(
    document.documentElement
  ).getPropertyValue('--playground-height');

  container.style.width = originalWidth;
  container.style.height = originalHeight;

  container.scroll({ 
    behavior: 'smooth', 
    left: container.scrollWidth / 2 - width / 2, 
    top: container.scrollHeight / 2 - height / 2
  });
});