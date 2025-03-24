  /* DEBUG */
  export function showObservingArea(entry, pos) {
    const outerObserverRect = document.createElement('div');
    const { left, top, width, height } = entry.rootBounds;
    const { scrollLeft, scrollTop } = document.documentElement;

    

    outerObserverRect.classList.add('outer-observer');
    outerObserverRect.style.transform = `translate(${left + scrollLeft}px, ${top + scrollTop}px)`;
    outerObserverRect.style.width = `${width}px`;
    outerObserverRect.style.height = `${height}px`;

    if (window[pos]) {
      console.log('removing', window[pos]);
      window[pos].remove();
    }

    document.body.appendChild(outerObserverRect);
    window[pos] = outerObserverRect;

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