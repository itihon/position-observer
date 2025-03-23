  /* DEBUG */
  export function showObservingArea(entry) {
    const outerObserverRect = document.querySelector('.outer-observer');
    const { left, top, width, height } = entry.rootBounds;
    const { scrollLeft, scrollTop } = document.documentElement;
    outerObserverRect.style.transform = `translate(${left + scrollLeft}px, ${top + scrollTop}px)`;
    outerObserverRect.style.width = `${width}px`;
    outerObserverRect.style.height = `${height}px`;
    console.log(entry.rootBounds)
  }
  
  export function showCapturedArea(entry) {
    const outerObserverRect = document.querySelector('.captured-rect');
    const { left, top, width, height } = entry.rootBounds;
    outerObserverRect.style.left = `${left}px`;
    outerObserverRect.style.top = `${top}px`;
    outerObserverRect.style.width = `${width}px`;
    outerObserverRect.style.height = `${height}px`;
    outerObserverRect.style.backgroundColor = 'rgba(0, 255, 0, .3)';
  }
  /* END OF DEBUG */