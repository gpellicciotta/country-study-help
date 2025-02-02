const COUNTRIES_DATA_FILE = "data/world-countries.csv";

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

let bodyEl;

let searchBoxInput;

let quizCountryButton;
let quizCapitalButton;
let quizFlagButton;
let quizTypeEl;
let showAnswerButton;
let goodAnswerButton;
let badAnswerButton;

let randomCountryButton;

let resultsEl;

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
  searchBoxInput = document.getElementById("country-box");
  searchBoxInput.addEventListener("keydown", searchCountry);
  searchBoxInput.value = "Belgium";
  searchBoxInput.focus();
  searchBoxInput.select(); // Select all
  //
  quizCountryButton = document.getElementById("quiz-country");
  quizCountryButton.addEventListener("click", quizRandomCountry);

  quizCapitalButton = document.getElementById("quiz-capital");
  quizCapitalButton.addEventListener("click", quizRandomCapital);

  quizFlagButton = document.getElementById("quiz-flag");
  quizFlagButton.addEventListener("click", quizRandomFlag);

  quizTypeEl = document.getElementById("quiz-type");

  randomCountryButton = document.getElementById("random-country");
  randomCountryButton.addEventListener("click", showRandomCountry);

  showAnswerButton = document.getElementById("show-answer");
  showAnswerButton.addEventListener("click", showAllCountryInfo);
  goodAnswerButton = document.getElementById("good-answer");
  goodAnswerButton.addEventListener("click", goodAnswer);
  badAnswerButton = document.getElementById("bad-answer");
  badAnswerButton.addEventListener("click", badAnswer);
  //
  resultsEl = document.getElementById("results");
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
  console.log("Loading country data...");
  fetch(COUNTRIES_DATA_FILE)
    .then(response => response.text())
    .then(csvText => {
      const countries = parseCountryCsv(csvText);
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

function quizRandomCapital() {
  let randomIndex = Math.floor(Math.random() * countryCodes.length);
  let countryCode = countryCodes[randomIndex];
  let country = countryByCode[countryCode];
  showCountryInfo(country);
  quizTypeEl.textContent = "Guess the country with this capital";
  changeToQuizMode();
  bodyEl.classList.remove('hide-flag');
  bodyEl.classList.add('hide-country-name');
  bodyEl.classList.remove('hide-capital-name');
}

function quizRandomFlag() {
  let randomIndex = Math.floor(Math.random() * countryCodes.length);
  let countryCode = countryCodes[randomIndex];
  let country = countryByCode[countryCode];
  showCountryInfo(country);
  quizTypeEl.textContent = "Guess the country with this flag";
  changeToQuizMode();
  bodyEl.classList.remove('hide-flag');
  bodyEl.classList.add('hide-country-name');
  bodyEl.classList.add('hide-capital-name');
}

function quizRandomCountry() {
  let randomIndex = Math.floor(Math.random() * countryCodes.length);
  let countryCode = countryCodes[randomIndex];
  let country = countryByCode[countryCode];
  showCountryInfo(country);
  quizTypeEl.textContent = "Guess the capital of this country";
  changeToQuizMode();
  bodyEl.classList.remove('hide-flag');
  bodyEl.classList.remove('hide-country-name');
  bodyEl.classList.add('hide-capital-name');
}

function showRandomCountry() {
  let randomIndex = Math.floor(Math.random() * countryCodes.length);
  let countryCode = countryCodes[randomIndex];
  let country = countryByCode[countryCode];
  showCountryInfo(country);
  changeToInitialMode();
  bodyEl.classList.remove('hide-flag');
  bodyEl.classList.remove('hide-country-name');
  bodyEl.classList.remove('hide-capital-name');
}

function showCountryInfo(country) {
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
  let countryCode = countryCodeByCountryName[countryToSearch] || countryCodeByCapitalName[countryToSearch] || '__';
  let country = countryByCode[countryCode];
  // Fill results:
  showCountryInfo(country);
  changeToInitialMode();
  bodyEl.classList.remove('hide-flag');
  bodyEl.classList.remove('hide-country-name');
  bodyEl.classList.remove('hide-capital-name');
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
