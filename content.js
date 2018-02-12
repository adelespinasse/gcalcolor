// Content script for the extension. Does all the work.

"use strict";

// Colorizes an event element. Finds the colored dot, then sets the
// overall color to that dot's color (which is its borderColor; the
// dot is just an empty 0x0 element with a circular border). Also
// hides the dot, since it is no longer needed to show the color, and
// reduces padding to help line up events and let you see more of
// their names.
function colorizeEvent(eventEl) {
  let success = true;
  // first try layout for all calendar views except Schedule (Agenda)
  let dotEl = eventEl;
  for (let i=0; i<3; i++) {
    dotEl = dotEl.firstChild;
    if (!dotEl) {
      success = false;
      break;
    }
  }
  if (success) {
    let color = dotEl.style.borderColor;
    if (!color) {
      success = false;  // Probably not a timed event
    }
    else {
      eventEl.firstChild.style.color = color;
      eventEl.firstChild.style.padding = '0';
      dotEl.style.display = 'none';
    }
  }

  // if the above failed, try the Schedule (Agenda) layout
  if (!success) {
    let timeEl = eventEl.firstChild;
    if (!timeEl) {
      return;
    }
    let detailsEl = timeEl.nextSibling;
    if (!detailsEl) {
      return;
    }
    let dotContainer1El = detailsEl.nextSibling;
    if (!dotContainer1El) {
      return;
    }
    let dotContainer2El = dotContainer1El.firstChild;
    if (!dotContainer2El) {
      return;
    }
    let dotEl = dotContainer2El.firstChild;
    if (!dotEl) {
      return;
    }
    let color = dotEl.style.borderColor;
    if (!color) {
      return;
    }
    else {
      detailsEl.style.color = color;
      dotContainer1El.style.display = 'none';
    }
  }
}

// Colorizes all visible events.
function colorizeAll() {
  let eventElements = document.querySelectorAll('[data-eventid]');
  for (let eventElement of eventElements) {
    colorizeEvent(eventElement);
  }
}


// We don't have a precise way to know when Google Calendar has drawn
// some new events on the screen. Instead we use a MutationObserver to
// watch for DOM changes anywhere on the page. It would be really
// inefficient to run colorizeAll every time we got an observer
// callback, so instead we wait for a short delay to see if any more
// callbacks happen. If so, we reset the timer and wait again. We call
// colorizeAll only when the timer completes without another callback.
//
// Because there are a lot of irregularly timed screen updates when
// the page is first being loaded, we set the delay to a quarter second
// at first. After five seconds, we set it to 20 milliseconds for a
// faster response to small updates.

let timeoutId = null;
let observerDelay = 250;
setTimeout(() => { observerDelay = 20; }, 5000);

function postObserverCallbacks() {
  timeoutId = null;
  colorizeAll();
}

function observerCallback(mutationList) {
  if (timeoutId)
    clearTimeout(timeoutId);
  timeoutId = setTimeout(postObserverCallbacks, observerDelay);
}

let observer = new MutationObserver(observerCallback);
observer.observe(
  document.body,
  {
    childList: true,
    attributes: true,
    subtree: true
  }
);
