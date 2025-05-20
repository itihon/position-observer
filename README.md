## Position observer

Runs a callback function when position or size of an observed element changes as a result of scroll or resize of a parent container or window, zooming in and out the page, or setting left and top coordinates of an observed element.
Uses `IntersectionObserver` to detect position change.
When position change detected, stops observing the element and starts a [`requestAnimationFrame` loop](https://github.com/itihon/request-animation-frame-loop/) in which the callback will be invoked.
When position stops changing, it stops the `requestAnimationFrame` loop and returns to observing the element.

![position observer flow chart](./position_observer_flow_chart.svg)

 - **It doesn't run anything in the background when the observed element's bounding box doesn't change.**
 - **It doesn't listen to scroll or resize events.**

> **See [Position observer](https://itihon.github.io/position-observer/) demo page.**

Also, for more details see [Detecting size and position change of a DOM element as a result of scroll, resize or zoom with IntersectionObserver.](https://dev.to/itihon/detecting-size-and-position-change-of-a-dom-element-as-a-result-of-scroll-resize-or-zoom-with-29ai).

### Installation

```sh
npm install @itihon/position-observer
```

### Usage

```js
  import PositionObserver from '@itihon/position-observer';

  const ctx = {
    // a context to be passed in the callback
  };

  function callback(target, targetRect, ctx) {
    // do something when position change of the target is detected
  }

  const positionObserver = new PositionObserver(callback, ctx);

  // ... 
  // ... 

  // start observing target's position change
  positionObserver.observe(target);

  // ... 
  // ... 
  
  // stop observing target's position change
  positionObserver.unobserve(target);

  // ... 
  // ... 
  
  // stop observing all targets' position change
  positionObserver.disconnect();

  // ... 
  // ... 
  
  // get an iterator of currently observed target elements
  positionObserver.getTargets();

```

### Debugging

If you encountered a situation in which for some reason it doesn't behave as you expected, you can change import of `PositionObserver` to debug subfolder. It will be displaying actual observed areas of each side observer as it is demonstrated on this page [How it works?](https://itihon.github.io/position-observer/how-it-works.html). In order to see them, you may need to temporarily make all document's body children half-transparent `opacity: .5;`.

```js 
import PositionObserver from '@itihon/position-observer/debug';
```