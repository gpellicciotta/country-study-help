export function normalizeName(name) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')         // fooBar -> foo-Bar
    .toLowerCase()                                  // FOO -> foo
    .normalize('NFD')                               // é -> e
    .replace(/[\u0300-\u036f]/g, '')                // é -> e 
    .replace('%20', '-')                            // foo%20bar -> foo-bar
    .replace(/[+ ]/g, '-');                         // foo+bar -> foo-bar, foo bar -> foo-bar
}

export function capitalize(str) {
  if (typeof str !== 'string' || str.length === 0) {
    return '';
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function createOptionElement(value, innerHTML) {
  let option = document.createElement('option');
  option.value = value;
  option.innerHTML = innerHTML || value;
  return option;
}

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

export function formatDuration(milliseconds) {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const formattedHours = hours > 0 ? `${hours}h ` : '';
  const formattedMinutes = minutes > 0 ? `${minutes}m ` : '';
  const formattedSeconds = `${seconds}s`;

  return `${formattedHours}${formattedMinutes}${formattedSeconds}`;
}


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

export default {
  /* Utility functions */
  normalizeName,
  isNumber,
  getMillisFromElapsedTimeStr,
  fromMillisToElapsedTimeStr,
  capitalize,
  createLink,
  createOptionElement,
  formatDuration
}