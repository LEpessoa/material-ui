import keycode from 'keycode';
import warning from 'warning';
import ownerDocument from '../utils/ownerDocument';

const internal = {
  focusKeyPressed: false,
  keyUpEventTimeout: -1,
};

function findActiveElement(doc) {
  let activeElement = doc.activeElement;
  while (activeElement && activeElement.shadowRoot && activeElement.shadowRoot.activeElement) {
    activeElement = activeElement.shadowRoot.activeElement;
  }
  return activeElement;
}

export function detectFocusVisible(instance, element, callback, attempt = 1) {
  warning(instance.focusVisibleCheckTime, 'Material-UI: missing instance.focusVisibleCheckTime.');
  warning(
    instance.focusVisibleMaxCheckTimes,
    'Material-UI: missing instance.focusVisibleMaxCheckTimes.',
  );

  instance.focusVisibleTimeout = setTimeout(() => {
    const doc = ownerDocument(element);
    const activeElement = findActiveElement(doc);

    if (
      internal.focusKeyPressed &&
      (activeElement === element || element.contains(activeElement))
    ) {
      callback();
    } else if (attempt < instance.focusVisibleMaxCheckTimes) {
      detectFocusVisible(instance, element, callback, attempt + 1);
    }
  }, instance.focusVisibleCheckTime);
}

const FOCUS_KEYS = ['tab', 'enter', 'space', 'esc', 'up', 'down', 'left', 'right'];

function isFocusKey(event) {
  return FOCUS_KEYS.indexOf(keycode(event)) > -1;
}

const handleKeyUpEvent = event => {
  if (isFocusKey(event)) {
    internal.focusKeyPressed = true;

    // Let's consider that the user is using a keyboard during a window frame of 1s.
    clearTimeout(internal.keyUpEventTimeout);
    internal.keyUpEventTimeout = setTimeout(() => {
      internal.focusKeyPressed = false;
    }, 1e3);
  }
};

export function listenForFocusKeys(win) {
  // The event listener will only be added once per window.
  // Duplicate event listeners will be ignored by addEventListener.
  // Also, this logic is client side only, we don't need a teardown.
  win.addEventListener('keyup', handleKeyUpEvent);
}
