  /* DEBUG */
  export function showObservingArea(entry, pos) {
    const outerObserverRect = document.createElement('div');
    const { left, top, width, height } = entry.rootBounds;
    const { scrollLeft, scrollTop } = document.documentElement;

    // in observerCallback
    // /* DEBUG */
    // let pos;
    // this.rootMargin.split(' ').forEach((value, idx) => {
    //   if (value !== '0px' && idx === 0) pos = '$TOP';
    //   if (value !== '0px' && idx === 1) pos = '$RIGHT';
    //   if (value !== '0px' && idx === 2) pos = '$BOTTOM';
    //   if (value !== '0px' && idx === 3) pos = '$LEFT';
    // });

    // const entry = entries[0];
    // showObservingArea(entry, pos);
    // console.log('observer callback', this);
    // /* END OF DEBUG */

    outerObserverRect.classList.add('outer-observer');
    outerObserverRect.style.transform = `translate(${left + scrollLeft}px, ${top + scrollTop}px)`;
    outerObserverRect.style.width = `${width}px`;
    outerObserverRect.style.height = `${height}px`;

    if (window[pos]) {
      window[pos].remove();
    }

    document.body.appendChild(outerObserverRect);
    window[pos] = outerObserverRect;
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