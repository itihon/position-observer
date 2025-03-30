## Position observer

See [Position observer](https://itihon.github.io/position-observer/) demo page.

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

```