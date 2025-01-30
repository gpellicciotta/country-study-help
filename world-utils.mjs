loadCountryData();
window.addEventListener("load", fireDomReady, false);

let knownCountries = [];

function fireDomReady() {
  
  let countryBox = document.getElementById("country-box");  
  countryBox.addEventListener("keydown", searchCountry);
  countryBox.value = "Belgium";
  countryBox.focus();
  countryBox.select(); // Select all
}

let openTabs = { };

function createLink(href, text, target = null) {
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

function capitalize(str) {
  if (typeof str !== 'string' || str.length === 0) {
    return '';
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function searchCountry(e) {
  if (e.which !== 13) { return ; }

  let countryBox = document.getElementById("country-box");
  let country = countryBox.value; 
  let countryEl = document.getElementById("country");
  countryEl.innerHTML = country;

  let wikipedia = document.getElementById("wikipedia");
  let wikiLink = "https://www.wikipedia.org/wiki/" + country;
  wikipedia.innerHTML = "";
  wikipedia.appendChild(createLink(wikiLink, "wikipedia", "Wikipedia"));
  countryBox.value = "";
}

function parseCountryCsv(csvText) {
  const lines = csvText.split('\n');
  const headers = lines[0].split(',');
  const data = lines.slice(1).map(line => {
    const values = line.split(',');
    return headers.reduce((obj, header, index) => {
      obj[header] = values[index];
      return obj;
    }, {});
  });
  return data;
}

function loadCountryData() {
  let file = "world-countries.csv";
  fetch(file)
    .then(response => response.text())
    .then(csvText => {
      const countries = parseCountryCsv(csvText);
      console.log(countries);
      knownCountries = countries;
    })
    .catch(error => {
      console.error('Error loading country data:', error);
      knownCountries = [];
    });
}