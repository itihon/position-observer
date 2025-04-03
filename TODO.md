- How it works
  - [ ] resize buttons for each corner of the observed element



## Article

- Existing solutions
  - crop rootBounds to the element's bounds
  - hybrid approach with scroll and resize events


- Promlems
  - Resizing of the target
  - Resizing of the viewport
  - Consistent way of getting viewport size on mobile and desktop screens
    - the reason not to use visualViewport (skipped values)
  - Partial overlapping by a parent scrollable container
    - why not to rely on intersectionRect
  - Changing target's position in between starting observation and the first observer callback call

- Alternative approach (without IntersectionObserver, and even without scroll, and resize)