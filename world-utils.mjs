const COUNTRIES_CSV_DATA_FILE = "data/world-countries.csv";
const COUNTRIES_JSON_DATA_FILE = "data/world-countries.json";

const DEFAULT_COUNTRY_DATA = {
  'code': 'xx',
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
let mapEl;

let goodAnswers = 0;
let goodAnswersEl;
let badAnswersEl;
let scorePercentageEl;
let badAnswers = 0;

window.addEventListener("load", fireDomReady, false);

function fireDomReady() {
  navigator.serviceWorker
           .register('/service-worker.js')
           .then(registration => {
             console.log('ServiceWorker registration successful with scope: ', registration.scope);
           }, err => {
             console.log('ServiceWorker registration failed: ', err);
           });
          
  // UI elements + handlers:
  bodyEl = document.getElementsByTagName("body")[0];

  // Initial check
  updateBodyClass();  
  // Listen for resize events
  window.addEventListener('resize', updateBodyClass);

  // Search portion:
  searchBoxInput = document.getElementById("country-box");
  searchBoxInput.addEventListener("keydown", (e) => {
    if (e.which !== 13) { return ; }
    e.preventDefault();
    searchCountry();
  });
  searchBoxInput.value = "";

  searchBoxDataList = document.getElementById("name-list");

  //searchCountryButton = document.getElementById("search-country");
  //searchCountryButton.addEventListener("click", searchCountry);
  randomCountryButton = document.getElementById("random-country");
  randomCountryButton.addEventListener("click", showRandomCountry);
  // Quiz portion:
  showCountryNameCheckbox = document.getElementById("show-country");
  showCountryNameCheckbox.addEventListener("click", showCountryName);
  showCapitalNameCheckbox = document.getElementById("show-capital");
  showCapitalNameCheckbox.addEventListener("click", showCapitalName);
  showFlagCheckbox = document.getElementById("show-flag");
  showFlagCheckbox.addEventListener("click", showFlag);
  showAnswerButton = document.getElementById("show-answer");
  showAnswerButton.addEventListener("click", showAnswer);
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
  mapEl = document.getElementById("map");
  //
  goodAnswersEl = document.getElementById("good-answers");
  badAnswersEl = document.getElementById("bad-answers");
  scorePercentageEl = document.getElementById("score-percentage");

  // Load country data
  loadCountryDataFromJSON();

  // Check the URL for a country name
  checkUrlForCountry();

  // Listen for popstate events
  window.addEventListener('popstate', checkUrlForCountry);
}

function checkUrlForCountry(e) {
  const searchString = window.location.hash.substring(1); // Remove leading '#'
  if (searchString) {
    const countryName = decodeURIComponent(searchString.replace(/\+/g, ' '));
    searchBoxInput.value = countryName;
    console.log("Searching for country in URL: ", countryName);	
    searchCountry();
  }
}

function showCountryMap(countryCode, countryName) {
  fetch(`img/maps/${countryCode}.svg`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`SVG map for ${countryName} not found at 'img/maps/${countryCode}.svg'`);
      }
      return response.blob();
    })
    .then(blob => {
      map.src = URL.createObjectURL(blob);
    })
    .catch(() => {
      map.src = `img/maps/${countryCode}.png`;
    });
  map.alt = `Map of ${countryName}`;
}

function updateBodyClass() {
  if (window.innerWidth < 800) {
    document.body.classList.add('mobile');
  } 
  else {
    document.body.classList.remove('mobile');
  }
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

function loadCountryDataFromJSON() {
  console.log("Loading JSON country data...");
  fetch(COUNTRIES_JSON_DATA_FILE)
    .then(response => response.json())
    .then(countries => {
      //console.log("JSON data: ", countries)
      const distinctNames = new Set();
      searchBoxDataList.innerHTML = '';
      countries.forEach(country => {
        console.log("Keeping track of: ", country);

        country.code = country.cca2.toLowerCase();
        country.english_country_name = country.name.common;
        country.english_capital_name = (country.capital || []).join(', ');
        country.dutch_country_name = country.translations.nld.common;
        country.dutch_capital_name = country.translations.nld.capital;
        country.italian_country_name = country.translations.ita.common;
        country.italian_capital_name = country.translations.ita.capital;

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

  randomCountryButton.disabled = false;
  showAnswerButton.disabled = true;
  goodAnswerButton.disabled = true;
  badAnswerButton.disabled = true;
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

  randomCountryButton.disabled = true;
  showAnswerButton.disabled = false;
  goodAnswerButton.disabled = true;
  badAnswerButton.disabled = true;
}

function changeToEvaluationMode() {
  bodyEl.classList.remove('initial-mode');
  bodyEl.classList.remove('quiz-mode');
  bodyEl.classList.add('evaluation-mode');

  randomCountryButton.disabled = true;
  showAnswerButton.disabled = true;
  goodAnswerButton.disabled = false;
  badAnswerButton.disabled = false;
}

function showAnswer() {
  changeToEvaluationMode();
}

function goodAnswer() {
  goodAnswers++;
  goodAnswersEl.textContent = "" + goodAnswers;
  scorePercentageEl.textContent = Math.round((goodAnswers / (goodAnswers + badAnswers)) * 100) + "%";
  showRandomCountry();

}

function badAnswer() {
  badAnswers++;
  badAnswersEl.textContent = "" + badAnswers;
  scorePercentageEl.textContent = Math.round((goodAnswers / (goodAnswers + badAnswers)) * 100) + "%";
  showRandomCountry();
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
  console.log("Showing random country");
  let randomIndex = Math.floor(Math.random() * countryCodes.length);
  let countryCode = countryCodes[randomIndex];
  let country = countryByCode[countryCode];
  changeToInitialMode();
  searchBoxInput.value = "";
  showCountryInfo(country);
}

function showCountryInfo(country) {
  console.log("Showing info for '" + country.english_country_name + "'");
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

  showCountryMap(country.code, country.english_country_name);

  // Update the URL
  const urlHash = encodeURIComponent(country.english_country_name.replace(/ /g, '+'));
  const newUrl = `${window.location.origin}${window.location.pathname}#${urlHash}`;
  if (window.location.hash !== `#${urlHash}`) {
    history.pushState({ country: country.english_country_name }, '', newUrl);
  }
}

function searchCountry(e) {
  let countryToSearch = normalizeName(searchBoxInput.value);
  let countryCode = 'xx';
  if (!countryToSearch) {
    let randomIndex = Math.floor(Math.random() * countryCodes.length);
    countryCode = countryCodes[randomIndex];
  }
  else if (countryToSearch.length === 2) {
    countryCode = countryToSearch;
  }
  else {
    countryCode = countryCodeByCountryName[countryToSearch] || countryCodeByCapitalName[countryToSearch] || 'xx';
  }
  let country = countryByCode[countryCode];
  if (!country) {
    country = DEFAULT_COUNTRY_DATA;
  }
  // Fill results:
  showCountryInfo(country);
  changeToInitialMode();
  // Reset search:
  searchBoxInput.value = "";
  //searchCountryButton.focus();
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
