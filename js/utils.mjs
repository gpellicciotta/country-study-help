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

export default {
  /* Utility functions */
  normalizeName,
  capitalize,
  createLink,
  createOptionElement,
  formatDuration
}