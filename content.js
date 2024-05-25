// Content script for the extension. Does all the work.

"use strict";

// Colorizes a normal calendar event element. Finds the colored dot, then sets
// the overall color to that dot's color (which is its borderColor; the dot is
// just an empty 0x0 element with a circular border). Also hides the dot, since
// it is no longer needed to show the color. Verifies that the elements are
// laid out as expected for a normal event, and returns true if so, false if
// not.
function colorizeNormalEvent(eventEl) {
  const eventButton = eventEl.firstChild;
  if (!eventButton) {
    return false;
  }
  const dotContainer = eventButton.firstChild;
  if (!dotContainer) {
    return false;
  }
  const dotEl = dotContainer.firstChild;
  if (!dotEl) {
    return false;
  }
  const eventText = dotContainer.nextSibling;
  if (!eventText) {
    return false;
  }
  const color = dotEl.style.borderColor;
  if (!color) {
    return false;
  }
  eventText.style.color = color;
  eventText.style.padding = '0';
  eventText.style.opacity = '1.0';
  eventButton.style.marginLeft = '0';
  dotEl.style.display = 'none';
  return true;
}

// Colorizes an agenda/schedule event element, similarly to colorizeNormalEvent
// above.
function colorizeAgendaEvent(eventEl) {
  const timeEl = eventEl.firstChild;
  if (!timeEl) {
    return;
  }
  const detailsEl = timeEl.nextSibling;
  if (!detailsEl) {
    return;
  }
  const dotContainer1El = detailsEl.nextSibling;
  if (!dotContainer1El) {
    return;
  }
  const dotContainer2El = dotContainer1El.firstChild;
  if (!dotContainer2El) {
    return;
  }
  const dotEl = dotContainer2El.firstChild;
  if (!dotEl) {
    return;
  }
  const color = dotEl.style.borderColor;
  if (!color) {
    return;
  }
  else {
    detailsEl.style.color = color;
    eventEl.style.height = '28px';
    eventEl.style.opacity = '1.0';
    dotContainer1El.style.display = 'none';
  }
}

// Colorizes a single event element.
function colorizeEvent(eventEl) {
  if (!colorizeNormalEvent(eventEl)) {
    colorizeAgendaEvent(eventEl);
  }
}

// Colorizes all visible events.
function colorizeAll() {
  const eventElements = document.querySelectorAll('[data-eventid]');
  for (const eventElement of eventElements) {
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

const observer = new MutationObserver(observerCallback);
observer.observe(
  document.body,
  {
    childList: true,
    attributes: true,
    subtree: true
  }
);
