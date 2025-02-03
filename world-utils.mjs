const COUNTRIES_CSV_DATA_FILE = "data/world-countries.csv";
const COUNTRIES_JSON_DATA_FILE = "data/world-countries.json";

const DEFAULT_COUNTRY_DATA = {
  'code': 'no-country',
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

let bodyEl;

let searchBoxInput;
let searchBoxDataList;
let searchCountryButton;


let showCountryNameCheckbox;
let showCapitalNameCheckbox;
let showFlagCheckbox;
let quizTypeEl;

let randomCountryButton;

let showAnswerButton;

let goodAnswerButton;
let badAnswerButton;

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

let goodAnswers = 0;
let badAnswers = 0;

window.addEventListener("load", fireDomReady, false);

function fireDomReady() {
  bodyEl = document.getElementsByTagName("body")[0];

  // UI elements + handlers:
  // Search portion:
  searchBoxInput = document.getElementById("country-box");
  searchBoxInput.addEventListener("keydown", (e) => {
    if (e.which !== 13) { return ; }
    searchCountry();
  });
  searchBoxInput.value = "Belgium";
  searchBoxInput.focus();
  searchBoxInput.select(); // Select all

  searchBoxDataList = document.getElementById("name-list");

  searchCountryButton = document.getElementById("search-country");
  searchCountryButton.addEventListener("click", searchCountry);
  randomCountryButton = document.getElementById("random-country");
  randomCountryButton.addEventListener("click", showRandomCountry);
  // Quiz portion:
  showCountryNameCheckbox = document.getElementById("show-country");
  showCountryNameCheckbox.addEventListener("click", showCountryName);
  showCapitalNameCheckbox = document.getElementById("show-capital");
  showCapitalNameCheckbox.addEventListener("click", showCapitalName);
  showFlagCheckbox = document.getElementById("show-flag");
  showFlagCheckbox.addEventListener("click", showFlag);
  quizTypeEl = document.getElementById("quiz-type");
  showAnswerButton = document.getElementById("show-answer");
  showAnswerButton.addEventListener("click", showAllCountryInfo);
  goodAnswerButton = document.getElementById("good-answer");
  goodAnswerButton.addEventListener("click", goodAnswer);
  badAnswerButton = document.getElementById("bad-answer");
  badAnswerButton.addEventListener("click", badAnswer);
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
  loadCountryDataFromJSON();
}

let countryCodes = [];
let countryByCode = {};
let countryCodeByCountryName = {};
let countryCodeByCapitalName = {};

function createOptionElement(value) {
  let option = document.createElement('option');
  option.value = value;
  return option;
}

function translateCountryOrCityName(name, lang) {
  // TODO:
  return name;
}

function loadCountryDataFromJSON() {
  console.log("Loading JSON country data...");
  fetch(COUNTRIES_JSON_DATA_FILE)
    .then(response => response.json())
    .then(countries => {
      //console.log("JSON data: ", countries)
      const distinctNames = new Set();
      searchBoxDataList.innerHTML = '';
      countries.forEach(country => {
        //console.log("Keeping track of: ", country);
        
        country.code = country.cca2.toLowerCase();
        country.english_country_name = country.name.common;
        country.english_capital_name = (country.capital || []).join(', ');	
        country.dutch_country_name = country.translations.nld.common || translateCountryOrCityName(country.english_country_name, 'nl'); 
        country.dutch_capital_name = translateCountryOrCityName(country.english_capital_name, 'nl');	
        country.italian_country_name = country.translations.ita.common || translateCountryOrCityName(country.english_country_name, 'it');
        country.italian_capital_name = translateCountryOrCityName(country.english_capital_name, 'it');	

        countryCodes.push(country.code);
        // For lookup:
        countryByCode[country.code] = country;
        countryCodeByCountryName[normalizeName(country.english_country_name)] = country.code;
        countryCodeByCapitalName[normalizeName(country.english_capital_name)] = country.code;
        countryCodeByCountryName[normalizeName(country.dutch_country_name)] = country.code;
        countryCodeByCapitalName[normalizeName(country.dutch_capital_name)] = country.code;
        countryCodeByCountryName[normalizeName(country.italian_country_name)] = country.code;
        countryCodeByCapitalName[normalizeName(country.italian_capital_name)] = country.code;
        // For auto-complete:
        if (!distinctNames.has(country.code)) {
          searchBoxDataList.appendChild(createOptionElement(country.code));
          distinctNames.add(country.code);
        }
        if (!distinctNames.has(country.english_country_name)) {
          searchBoxDataList.appendChild(createOptionElement(country.english_country_name));
          distinctNames.add(country.english_country_name);
        }
        if (!distinctNames.has(country.english_capital_name)) {
          searchBoxDataList.appendChild(createOptionElement(country.english_capital_name));
          distinctNames.add(country.english_capital_name);
        }
        if (!distinctNames.has(country.dutch_country_name)) {
          searchBoxDataList.appendChild(createOptionElement(country.dutch_country_name));
          distinctNames.add(country.dutch_country_name);
        }
        if (!distinctNames.has(country.dutch_capital_name)) {
          searchBoxDataList.appendChild(createOptionElement(country.dutch_capital_name));
          distinctNames.add(country.dutch_capital_name);
        }
        if (!distinctNames.has(country.italian_country_name)) {
          searchBoxDataList.appendChild(createOptionElement(country.italian_country_name));
          distinctNames.add(country.italian_country_name);
        }
        if (!distinctNames.has(country.italian_capital_name)) {
          searchBoxDataList.appendChild(createOptionElement(country.italian_capital_name));
          distinctNames.add(country.italian_capital_name);
        }
      });
      console.log("Country data loaded completely.");
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

function loadCountryDataFromCsv() {
  console.log("Loading CSV country data...");
  fetch(COUNTRIES_CSV_DATA_FILE)
    .then(response => response.text())
    .then(csvText => {
      //console.log("CSV data: ", csvText)
      const countries = parseCountryCsv(csvText);
      const distinctNames = new Set();
      searchBoxDataList.innerHTML = '';
      countries.forEach(country => {
        //console.log("Keeping track of: ", country);
        countryCodes.push(country.code);
        // For lookup:
        countryByCode[country.code] = country;
        countryCodeByCountryName[normalizeName(country.english_country_name)] = country.code;
        countryCodeByCapitalName[normalizeName(country.english_capital_name)] = country.code;
        countryCodeByCountryName[normalizeName(country.dutch_country_name)] = country.code;
        countryCodeByCapitalName[normalizeName(country.dutch_capital_name)] = country.code;
        countryCodeByCountryName[normalizeName(country.italian_country_name)] = country.code;
        countryCodeByCapitalName[normalizeName(country.italian_capital_name)] = country.code;
        // For auto-complete:
        if (!distinctNames.has(country.code)) {
          searchBoxDataList.appendChild(createOptionElement(country.code));
          distinctNames.add(country.code);
        }
        if (!distinctNames.has(country.english_country_name)) {
          searchBoxDataList.appendChild(createOptionElement(country.english_country_name));
          distinctNames.add(country.english_country_name);
        }
        if (!distinctNames.has(country.english_capital_name)) {
          searchBoxDataList.appendChild(createOptionElement(country.english_capital_name));
          distinctNames.add(country.english_capital_name);
        }
        if (!distinctNames.has(country.dutch_country_name)) {
          searchBoxDataList.appendChild(createOptionElement(country.dutch_country_name));
          distinctNames.add(country.dutch_country_name);
        }
        if (!distinctNames.has(country.dutch_capital_name)) {
          searchBoxDataList.appendChild(createOptionElement(country.dutch_capital_name));
          distinctNames.add(country.dutch_capital_name);
        }
        if (!distinctNames.has(country.italian_country_name)) {
          searchBoxDataList.appendChild(createOptionElement(country.italian_country_name));
          distinctNames.add(country.italian_country_name);
        }
        if (!distinctNames.has(country.italian_capital_name)) {
          searchBoxDataList.appendChild(createOptionElement(country.italian_capital_name));
          distinctNames.add(country.italian_capital_name);
        }
      });
      console.log("Country data loaded completely.");
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

function changeToInitialMode() {
  bodyEl.classList.remove('quiz-mode');
  bodyEl.classList.remove('evaluation-mode');
  bodyEl.classList.add('initial-mode');
}

function changeToQuizMode() {
  bodyEl.classList.remove('evaluation-mode');
  bodyEl.classList.remove('initial-mode');
  bodyEl.classList.add('quiz-mode');
  if (showCountryNameCheckbox.checked) {
    bodyEl.classList.remove('hide-country-name');
  }
  else {
    bodyEl.classList.add('hide-country-name');
  }
  if (showCapitalNameCheckbox.checked) {
    bodyEl.classList.remove('hide-capital-name');
  }
  else {
    bodyEl.classList.add('hide-capital-name');
  }
  if (showFlagCheckbox.checked) {
    bodyEl.classList.remove('hide-flag');
  }
  else {
    bodyEl.classList.add('hide-flag');
  }
}

function changeToEvaluationMode() {
  bodyEl.classList.remove('initial-mode');
  bodyEl.classList.remove('quiz-mode');
  bodyEl.classList.add('evaluation-mode');
}

function showAllCountryInfo() {
  bodyEl.classList.remove('hide-flag');
  bodyEl.classList.remove('hide-country-name');
  bodyEl.classList.remove('hide-capital-name');
  changeToEvaluationMode();
}

function goodAnswer() {
  goodAnswers++;
  changeToInitialMode();
}

function badAnswer() {
  badAnswers++;
  changeToInitialMode();
}

function showCapitalName() {
  if (showCapitalNameCheckbox.checked) {
    bodyEl.classList.remove('hide-capital-name');
  }
  else {
    bodyEl.classList.add('hide-capital-name');
    if (!showCountryNameCheckbox.checked && !showFlagCheckbox.checked) {
      showFlagCheckbox.checked = true;
      bodyEl.classList.remove('hide-flag');
    }
  } 
}

function showFlag() {
  if (showFlagCheckbox.checked) {
    bodyEl.classList.remove('hide-flag');
  }
  else {
    bodyEl.classList.add('hide-flag');
    if (!showCapitalNameCheckbox.checked && !showCountryNameCheckbox.checked) {
      showCountryNameCheckbox.checked = true;
      bodyEl.classList.remove('hide-country-name');
    }
  } 
}

function showCountryName() {
  if (showCountryNameCheckbox.checked) {
    bodyEl.classList.remove('hide-country-name');
  }
  else {
    bodyEl.classList.add('hide-country-name');
    if (!showCapitalNameCheckbox.checked && !showFlagCheckbox.checked) {
      showFlagCheckbox.checked = true;
      bodyEl.classList.remove('hide-flag');
    }
  } 
}

function showRandomCountry() {
  let randomIndex = Math.floor(Math.random() * countryCodes.length);
  let countryCode = countryCodes[randomIndex];
  let country = countryByCode[countryCode];
  changeToQuizMode();
  showCountryInfo(country);
}

function showCountryInfo(country) {
  flagImage.src = `img/flags/4x3/${country.code}.svg`;
  flagImage.alt = `Flag of ${country.english_country_name}`;
  englishCountryNameEl.textContent = country.english_country_name;
  englishCapitalNameEl.textContent = country.english_capital_name;
  englishWikipediaLinkEl.href = `https://en.wikipedia.org/wiki/${encodeURIComponent(country.english_country_name)}`;
  dutchCountryNameEl.textContent = country.dutch_country_name;
  dutchCapitalNameEl.textContent = country.dutch_capital_name;
  dutchWikipediaLinkEl.href = `https://nl.wikipedia.org/wiki/${encodeURIComponent(country.dutch_country_name)}`;
  italianCountryNameEl.textContent = country.italian_country_name;
  italianCapitalNameEl.textContent = country.italian_capital_name;
  italianWikipediaLinkEl.href = `https://it.wikipedia.org/wiki/${encodeURIComponent(country.italian_country_name)}`;
}

function searchCountry(e) {
  let countryToSearch = normalizeName(searchBoxInput.value);
  let countryCode = countryCodeByCountryName[countryToSearch] || countryCodeByCapitalName[countryToSearch] || 'no-country';
  let country = countryByCode[countryCode];
  // Fill results:
  showCountryInfo(country);
  changeToInitialMode();
  showCountryNameCheckbox.checked = true;
  showCapitalNameCheckbox.checked = true;
  showFlagCheckbox.checked = true;  
  bodyEl.classList.remove('hide-country-name');
  bodyEl.classList.remove('hide-capital-name');
  bodyEl.classList.remove('hide-flag');
  // Reset search:
  searchBoxInput.value = "";
  searchBoxInput.focus();
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
  const lines = csvText.split(/\r?\n/);
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
