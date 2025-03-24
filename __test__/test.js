import PositionObserver from "../dist/esm/index.js";
// import { PositionObserver } from '../position-observer.js';
import { showCapturedArea, showObservingArea } from "./debug.js";

const { input } = document.form;
const [inputX, inputY] = document.querySelectorAll('.range');
const innerObserverRect = document.querySelector('.inner-observer');
const outerObserverRect = document.querySelector('.outer-observer');

function changePos(e) {
  const { target } = e;
  const targetRect = input.getBoundingClientRect();
  const entry = { rootBounds: targetRect };

  if (target === inputX) {
    input.style.left = `${target.value}px`;
  }
  
  if (target === inputY) {
    input.style.top = `${target.value}px`;
  }
  
// showObservingArea(entry);
// 
// if (vc.getVisibilityState(input) === 'PARTLY_VISIBLE') {
//   const { intersectionRect } = vc.getLastRecord(input);
//   const capturedRect = makeCapturedRect(targetRect, intersectionRect);
//   const entry = { rootBounds: capturedRect };
// 
//   console.log(targetRect, capturedRect);
//   showCapturedArea(entry);
// }
}

inputX.addEventListener('input', changePos);
inputY.addEventListener('input', changePos);

const context = {
  innerObserverRect,
};

const observer = new PositionObserver((target, targetRect, ctx, isVisible = true) => {
  const { left, top, width, height } = targetRect;
  const { style: elementStyle } = ctx.innerObserverRect;
  const { scrollLeft, scrollTop } = document.documentElement;

  // console.log(targetRect);

  if (isVisible) {
    elementStyle.transform = `translate(${left - width + scrollLeft}px, ${top - height + scrollTop}px)`;
    elementStyle.width = `${width}px`;
    elementStyle.height = `${height}px`;
    elementStyle.display = `block`;
  }
  else {
    elementStyle.display = `none`;
  }

}, context);

// const observer = new PositionObserver((data, isVisible = true) => {
//   const { left, top, width, height } = data.rootBounds;
//   const { style: elementStyle } = innerObserverRect;
//   const { scrollLeft, scrollTop } = document.documentElement;
// 
//   // console.log(targetRect);
// 
//   if (isVisible) {
//     elementStyle.transform = `translate(${left + scrollLeft}px, ${top + scrollTop}px)`;
//     elementStyle.width = `${width}px`;
//     elementStyle.height = `${height}px`;
//     elementStyle.display = `block`;
//   }
//   else {
//     elementStyle.display = `none`;
//   }
// 
// });

observer.observe(input);

// const viewportRect = await new Promise((res) => {
//   const observer = new IntersectionObserver((entries) => {
//     res(entries[0].rootBounds);
// 
//     const { width: preciseWidth, height: preciseHeight } = entries[0].rootBounds;
//     const { width: boundingHtmlWidth, height: boundingHtmlHeight } = document.documentElement.getBoundingClientRect();
//     const { innerWidth, innerHeight } = window;
//     const { clientWidth, clientHeight, offsetWidth, offsetHeight, scrollWidth, scrollHeight } = document.documentElement;
//     const { width: screenWidth, height: screenHeight, availWidth, availHeight } = window.screen;
// 
//     console.table({
//       preciseWidth, preciseHeight,
//       boundingHtmlWidth, boundingHtmlHeight,
//       innerWidth, innerHeight,
//       clientWidth, clientHeight,
//       offsetWidth, offsetHeight,
//       scrollWidth, scrollHeight,
//       screenWidth, screenHeight,
//       availWidth, availHeight,
//     });
// 
//   }, { root: document });
//   observer.observe(document.documentElement);
// });
// 
// const { left, top, width, height, right, bottom } = input.getBoundingClientRect();
// 
// const marginTop = top;
// const marginRight = viewportRect.width - right;
// const marginBottom = viewportRect.height - bottom;
// const marginLeft = left;
// 
// const options = {
//   root: document,
//   rootMargin: `${-marginTop}px ${-marginRight}px ${-marginBottom}px ${-marginLeft}px`,
// };
// 
// const obs = new IntersectionObserver((entries) => {
//   const entry = entries[0];
//   const { left, top, width, height } = entry.rootBounds;
//   const { scrollLeft, scrollTop } = document.documentElement;
// 
//   outerObserverRect.style.transform = `translate(${left + scrollLeft}px, ${top + scrollTop}px)`;
//   outerObserverRect.style.width = `${width}px`;
//   outerObserverRect.style.height = `${height}px`;
//   outerObserverRect.style.display = `block`;
// 
// }, options);
// 
// obs.observe(input);