"use strict";

// Colorizes an event element. Finds the colored dot, then sets the
// overall color to that dot's color (which is its borderColor; the
// dot is just an empty 0x0 element with a circular border).
function colorizeEvent(eventEl) {
  let dotEl = eventEl;
  for (let i=0; i<3; i++) {
    dotEl = dotEl.firstChild;
    if (!dotEl)
      return;
  }
  let color = dotEl.style.borderColor;
  if (!color)
    return;
  eventEl.firstChild.style.color = color;
}

// Colorizes all visible events.
function colorizeAll() {
  let eventElements = document.querySelectorAll('[data-eventid]');
  for (let eventElement of eventElements) {
    colorizeEvent(eventElement);
  }
}

// Colorizes all visible events multiple times, after different
// amounts of delay. This is because we don't have a good way to
// intercept Google's redraw events. We have to just intercept user
// input events that might trigger UI updates, and then update a few
// times after that.
function colorizeAfterThis(event) {
  for (let delay of [1, 250, 1000, 3000, 10000])
    setTimeout(colorizeAll, delay);
}

// Colorize after loading the page.
colorizeAfterThis();

// Colorize whenever the user does anything that might trigger an update.
document.body.addEventListener('mouseup', colorizeAfterThis, true);
document.body.addEventListener('keyup', colorizeAfterThis, true);
document.body.addEventListener('wheel', colorizeAfterThis, true);
