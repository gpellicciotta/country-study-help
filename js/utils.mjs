// General purpose utility functions

/**
 *  Normalizes a name by converting it to lowercase, replacing spaces with hyphens
 *  and removing diacritics.
 * 
 *  @param {*} name The name to normalize.
 *  @returns The normalized name.
 */
export function normalizeName(name) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')         // fooBar -> foo-Bar
    .toLowerCase()                                  // FOO -> foo
    .normalize('NFD')                               // é -> e
    .replace(/[\u0300-\u036f]/g, '')                // é -> e 
    .replace('%20', '-')                            // foo%20bar -> foo-bar
    .replace(/[+ ]/g, '-');                         // foo+bar -> foo-bar, foo bar -> foo-bar
}

/**
 *  Capitalizes the first letter of a string.
 * 
 *  @param {*} str The string to capitalize.
 *  @returns The capitalized string.
 */
export function capitalize(str) {
  if (typeof str !== 'string' || str.length === 0) {
    return '';
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 *  Creates an option element with the given value and innerHTML.
 * 
 *  @param {*} value The value of the option.
 *  @param {*} innerHTML The inner HTML of the option.   
 *  @returns The created option element. 
 */
export function createOptionElement(value, innerHTML) {
  let option = document.createElement('option');
  option.value = value;
  option.innerHTML = innerHTML || value;
  return option;
}

/**
 *  Creates an anchor element with the given href, text and target.
 * 
 *  @param {string} href The URL of the link.
 *  @param {string} text The text of the link.
 *  @param {string} target The target of the link.
 *  @returns The created anchor element.
 */ 
export function createLink(href, text, target = null) {
  let a = Object.assign(document.createElement("a"), {
    href: href,
    textContent: capitalize(text)
  });
  if (target) {
    a.target = target;
    a.onclick = function(event) {
      event.preventDefault();
      if (openTabs[target]) {
        openTabs[target].close();
      }
      let newWindow = window.open(href, target);
      if (newWindow) {
        openTabs[target] = newWindow;
        newWindow.addEventListener('load', function() {
          newWindow.document.title = windowTitle;
        });
        newWindow.focus();
      }
    };
  }
  return a;
}

/**
 *  Converts milliseconds to a duration string representation.
 *  @param {*} milliseconds The duration in milliseconds.  
 *  @returns A string representation of the duration in the formats 
 *           hh'h' mm'm' ss's', mm'm' ss's' or ss's'. 
 */
export function toDurationStr(milliseconds) {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const formattedHours = hours > 0 ? `${hours}h ` : '';
  const formattedMinutes = minutes > 0 ? `${minutes}m ` : '';
  const formattedSeconds = `${seconds}s`;

  return `${formattedHours}${formattedMinutes}${formattedSeconds}`;
}


/**
 *  Checks if a value is a number.
 * 
 *  @param {*} value The value to check.
 *  @returns True if the value is a number, false otherwise.
 */
export function isNumber(value) {
  value = +value;
  return typeof value === 'number' && isFinite(value);
}

/**
 *  Converts a time string in the formats 'hh:mm', 'hh:mm:ss' or 'ss' to milliseconds.
 * 
 *  @param {*} timeStr The time string in the format 'hh:mm:ss'.
 *  @returns The time in milliseconds.
 */
export function getMillisFromElapsedTimeStr(timeStr) {
  let [hours, minutes, seconds] = timeStr.split(':').map(Number);
  if (seconds === undefined) {
    seconds = minutes;
    minutes = hours;
    hours = 0;
  }
  if (seconds === undefined) {
    seconds = minutes;
    minutes = 0;
  }
  return (hours * 3600 + minutes * 60 + seconds) * 1000;
}

/**
 *  Converts milliseconds to a time string in the format 'hh:mm:ss'.
 * 
 *  @param {*} millis The time in milliseconds.
 *  @returns The time string in the format 'hh:mm:ss'.
 */
export function fromMillisToElapsedTimeStr(millis) {
  const totalSeconds = Math.floor(millis / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 *  Converts a value to a relative time string representation.
 * 
 *  @param {*} value A date value.
 *  @returns A string representation of the relative time from now.
 */
export function toRelativeTimeStr(value) {
  const now = new Date();
  const diff = now - new Date(value);

  if (diff < 1000) {
    return 'just now';
  }
  if (diff < 60 * 1000) {
    return `${Math.floor(diff / 1000)} seconds ago`;
  }
  if (diff < 60 * 60 * 1000) {
    return `${Math.floor(diff / (60 * 1000))} minutes ago`;
  }
  if (diff < 24 * 60 * 60 * 1000) {
    return `${Math.floor(diff / (60 * 60 * 1000))} hours ago`;
  }
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    return `${Math.floor(diff / (24 * 60 * 60 * 1000))} days ago`;
  }
  if (diff < 30 * 24 * 60 * 60 * 1000) {
    return `${Math.floor(diff / (7 * 24 * 60 * 60 * 1000))} weeks ago`;
  }
  if (diff < 365 * 24 * 60 * 60 * 1000) {
    return `${Math.floor(diff / (30 * 24 * 60 * 60 * 1000))} months ago`;
  }
  return `${Math.floor(diff / (365 * 24 * 60 * 60 * 1000))} years ago`;
}

/**
 *  Converts a value to a percentage string representation.
 * 
 *  @param {*} value A value.
 *  @returns A percentage string representation of the value, with two decimal digits.
 */
export function toPercentageStr(value) {
  return `${Math.round(value * 100).toFixed(2)}%`;
}

export function toDateTimeStr(value) {
  if (!value) {
    return '?';
  }
  let date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
}

export default {
  /* Utility functions */
  normalizeName,
  isNumber,
  getMillisFromElapsedTimeStr,
  fromMillisToElapsedTimeStr,
  capitalize,
  createLink,
  createOptionElement,
  toDurationStr,
  toRelativeTimeStr,
  toPercentageStr,
  toDateTimeStr
}