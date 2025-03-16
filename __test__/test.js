import PositionObserver from "../lib/position-observer.js";

const { input } = document.form;
const [inputX, inputY] = document.querySelectorAll('.range');
const innerObserverRect = document.querySelector('.inner-observer');
const outerObserverRect = document.querySelector('.outer-observer');
const intersectionRatio = document.querySelector('[name="intersectionRatio"]');

function changePos(e) {
  const { target } = e;

  if (target === inputX) {
    input.style.left = `${target.value}px`;
  }
  
  if (target === inputY) {
    input.style.top = `${target.value}px`;
  }
}

inputX.addEventListener('input', changePos);
inputY.addEventListener('input', changePos);

const { left: initX, top: initY } = innerObserverRect.getBoundingClientRect();
const observer = PositionObserver((target, targetRect, isVisible) => {
  const { left, top, width, height } = targetRect;

  console.log(isVisible)

  if (isVisible) {
    // innerObserverRect.style.left = `${left}px`;
    // innerObserverRect.style.top = `${top}px`;
    innerObserverRect.style.transform = `translate(${left - initX - width}px, ${top - initY - height}px)`;
    innerObserverRect.style.width = `${width}px`;
    innerObserverRect.style.height = `${height}px`;
    innerObserverRect.style.display = `block`;
  }
  else {
    innerObserverRect.style.display = `none`;
  }

});

observer.observe(input);