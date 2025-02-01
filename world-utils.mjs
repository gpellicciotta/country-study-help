const COUNTRIES_DATA_FILE = "world-countries.csv";

const DEFAULT_COUNTRY_DATA = {
  'code': '__',
  'english_country_name': 'Not Found',
  'english_capital_name': 'Not Found',
  'english_wikipedia': 'https://en.wikipedia.org/wiki/Utopia',
  'dutch_country_name': 'Niet Gevonden',
  'dutch_capital_name': 'Niet Gevonden',
  'dutch_wikipedia': 'https://nl.wikipedia.org/wiki/Utopia',
  'italian_country_name': 'Non Trovato',
  'italian_capital_name': 'Non Trovato',
  'italian_wikipedia': 'https://it.wikipedia.org/wiki/Utopia'
}

let searchBoxInput;

let randomCountryButton;
let randomCapitalButton;
let randomFlagButton;

let flagImage;
let englishCountryNameEl; 
let englishCapitalNameEl; 
let englishWikipediaLinkEl; 
let dutchCountryNameEl;   
let dutchCapitalNameEl;   
let dutchWikipediaLinkEl; 
let italianCountryNameEl; 
let italianCapitalNameEl; 
let italianWikipediaLinkEl;


window.addEventListener("load", fireDomReady, false);  

function fireDomReady() { 
  // UI elements + handlers:
  searchBoxInput = document.getElementById("country-box");  
  searchBoxInput.addEventListener("keydown", searchCountry);
  searchBoxInput.value = "Belgium";
  searchBoxInput.focus();
  searchBoxInput.select(); // Select all
  //
  randomCountryButton = document.getElementById("random-country");
  randomCountryButton.addEventListener("click", pickRandomCountry);

  randomCapitalButton = document.getElementById("random-capital");
  randomCapitalButton.addEventListener("click", pickRandomCapital);

  randomFlagButton = document.getElementById("random-flag");
  randomFlagButton.addEventListener("click", pickRandomFlag);
  //
  flagImage = document.getElementById("flag");
  englishCountryNameEl = document.getElementById("english_country_name");
  englishCapitalNameEl = document.getElementById("english_capital_name");
  englishWikipediaLinkEl = document.getElementById("english_wikipedia");
  dutchCountryNameEl = document.getElementById("dutch_country_name");
  dutchCapitalNameEl = document.getElementById("dutch_capital_name");
  dutchWikipediaLinkEl = document.getElementById("dutch_wikipedia");
  italianCountryNameEl = document.getElementById("italian_country_name");
  italianCapitalNameEl = document.getElementById("italian_capital_name");
  italianWikipediaLinkEl = document.getElementById("italian_wikipedia");
  // Load country data
  loadCountryData();
}

let countryCodes = [];
let countryByCode = {};
let countryCodeByCountryName = {};
let countryCodeByCapitalName = {};

function loadCountryData() {
  fetch(COUNTRIES_DATA_FILE)
    .then(response => response.text())
    .then(csvText => {
      const countries = parseCountryCsv(csvText);
      console.log(countries);
      countries.forEach(country => {
        countryCodes.push(country.code);
        countryByCode[country.code] = country;
        console.log("Keeping track of: ", country);
        countryCodeByCountryName[normalizeName(country.english_country_name)] = country.code;
        countryCodeByCapitalName[normalizeName(country.english_capital_name)] = country.code;
        countryCodeByCountryName[normalizeName(country.dutch_country_name)] = country.code;
        countryCodeByCapitalName[normalizeName(country.dutch_capital_name)] = country.code;
        countryCodeByCountryName[normalizeName(country.italian_country_name)] = country.code;
        countryCodeByCapitalName[normalizeName(country.italian_capital_name)] = country.code;        
      });
    })
    .catch(error => {
      console.error('Error loading country data:', error);

      countryCodeByCountryName = {};
      countryCodeByCapitalName = {};
      countryByCode = [DEFAULT_COUNTRY_DATA.code];
      countryCodeByCountryName[DEFAULT_COUNTRY_DATA.english_country_name] = DEFAULT_COUNTRY_DATA.code;
      countryCodeByCapitalName[DEFAULT_COUNTRY_DATA.english_capital_name] = DEFAULT_COUNTRY_DATA.code;
      countryCodeByCountryName[DEFAULT_COUNTRY_DATA.dutch_country_name] = DEFAULT_COUNTRY_DATA.code;
      countryCodeByCapitalName[DEFAULT_COUNTRY_DATA.dutch_capital_name] = DEFAULT_COUNTRY_DATA.code;
      countryCodeByCountryName[DEFAULT_COUNTRY_DATA.italian_country_name] = DEFAULT_COUNTRY_DATA.code;
      countryCodeByCapitalName[DEFAULT_COUNTRY_DATA.italian_capital_name] = DEFAULT_COUNTRY_DATA.code;
    });
}

function pickRandomCapital() {
  let randomIndex = Math.floor(Math.random() * countryCodes.length);
  let countryCode = countryCodes[randomIndex];
  let country = countryByCode[countryCode];
  showCountryInfo(country, { name: false, flag: false, capital: true, link: true });
}

function pickRandomFlag() {
  let randomIndex = Math.floor(Math.random() * countryCodes.length);
  let countryCode = countryCodes[randomIndex];
  let country = countryByCode[countryCode];
  showCountryInfo(country, { name: false, flag: true, capital: false, link: true });
}

function pickRandomCountry() {
  let randomIndex = Math.floor(Math.random() * countryCodes.length);
  let countryCode = countryCodes[randomIndex];
  let country = countryByCode[countryCode];
  showCountryInfo(country, { name: true, flag: false, capital: false, link: true });
}

function showCountryInfo(country, options) {
  options = options || { name: true, flag: true, capital: true, link: true };
  // Fill results:
  flagImage.src = `img/flags/4x3/${country.code}.svg`;
  flagImage.alt = `Flag of ${country.english_country_name}`;
  englishCountryNameEl.textContent = country.english_country_name;
  englishCapitalNameEl.textContent = country.english_capital_name;
  englishWikipediaLinkEl.href = `https://en.wikipedia.org/wiki/${country.english_country_name}`;
  dutchCountryNameEl.textContent = country.dutch_country_name;
  dutchCapitalNameEl.textContent = country.dutch_capital_name;
  dutchWikipediaLinkEl.href = `https://en.wikipedia.org/wiki/${country.dutch_country_name}`;
  italianCountryNameEl.textContent = country.italian_country_name;
  italianCapitalNameEl.textContent = country.italian_capital_name;
  italianWikipediaLinkEl.href = `https://en.wikipedia.org/wiki/${country.italian_country_name}`;
}

function searchCountry(e) {
  if (e.which !== 13) { return ; }

  let countryToSearch = normalizeName(searchBoxInput.value); 
  // TODO: search in list of countries
  let country = countryCodeByCountryName[countryToSearch] || countryCodeByCapitalName[countryToSearch] || DEFAULT_COUNTRY_DATA;
  // Fill results:
  showCountryInfo(country);
  // Reset search:
  searchBoxInput.value = "";
  wikipediaLink.focus();
}

// Utilities:

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

function normalizeName(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ /g, '_');
}

function capitalize(str) {
  if (typeof str !== 'string' || str.length === 0) {
    return '';
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function parseCountryCsv(csvText) {
  const lines = csvText.split('\r\n');
  const headers = lines[0].split(',');
  const headerNames = {
    'Country Code': 'code',
    'Country (English)': 'english_country_name',
    'Capital (English)': 'english_capital_name',	
    'Wikipedia (English)': 'english_wikipedia',	
    'Country (Dutch)': 'dutch_country_name',	
    'Capital (Dutch)': 'dutch_capital_name',	
    'Wikipedia (Dutch)': 'dutch_wikipedia',	
    'Country (Italian)': 'italian_country_name',	
    'Capital (Italian)': 'italian_capital_name',	
    'Wikipedia (Italian)': 'italian_wikipedia'
  }
  const data = lines.slice(1)
                    .filter(line => (line.trim() !== '') && !line.trim().startsWith('#'))
                    .map(line => {
    const values = line.split(',');
    return headers.reduce((obj, header, index) => {
      const propName = headerNames[header] || header.toLowerCase().replace(/ /g, '_');
      obj[propName] = values[index];
      return obj;
    }, {});
  });
  return data;
}
