import log from './logging.mjs';
import countries from './countries.mjs';
import { Quiz } from './quiz.mjs';

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

log.setLogLevel(log.INFO);

window.addEventListener("load", fireDomReady, false);

function fireDomReady() {
  log.info("DOM is ready.");

  // navigator.serviceWorker
  //          .register('/service-worker.js')
  //          .then(registration => {
  //            log.debug('ServiceWorker registration successful with scope: ', registration.scope);
  //          }, err => {
  //            log.debug('ServiceWorker registration failed: ', err);
  //          });
          
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
  countries.loadCountryData()
    .then((cnt) => { 
       log.info(`${cnt} countries loaded.`); 
       // Fill lookup data
       fillLookUpData();
       // Check the URL for a country name
       checkUrlForCountry();
    });

  // Listen for popstate events
  window.addEventListener('popstate', checkUrlForCountry);
}

function checkUrlForCountry(e) {
  const searchString = window.location.hash.substring(1); // Remove leading '#'
  if (searchString) {
    const countryName = decodeURIComponent(searchString.replace(/\+/g, ' '));
    searchBoxInput.value = countryName;
    log.info(`Searching for country in URL: '${countryName}'`);	
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

function createOptionElement(value) {
  let option = document.createElement('option');
  option.value = value;
  return option;
}

function fillLookUpData() {
  searchBoxDataList.innerHTML = '';
  countries.getCountryLookupNames().forEach(name => {
    searchBoxDataList.appendChild(createOptionElement(name));
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
  log.debug("Showing random country");
  let countryCodes = countries.getCountrySet("all").codes;
  let randomIndex = Math.floor(Math.random() * countryCodes.length);
  let countryCode = countryCodes[randomIndex];
  let country = countries.getCountryByCode(countryCode);
  changeToInitialMode();
  searchBoxInput.value = "";
  showCountryInfo(country);
}

function showCountryInfo(country) {
  log.debug("Showing info for '" + country.english_country_name + "'");
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
  if (!window.location.hash) {
    log.info(`Replacing initial state for country: ${country.english_country_name}`);	
    history.replaceState({ country: country.english_country_name }, '', newUrl);
  }
  else if (window.location.hash !== `#${urlHash}`) {
    history.pushState({ country: country.english_country_name }, '', newUrl);
  }
}

function searchCountry(e) {
  let countryCode = countries.getCountryCode(searchBoxInput.value);
  let country = countries.getCountryByCode(countryCode);
  // Fill results:
  showCountryInfo(country);
  changeToInitialMode();
  // Reset search:
  searchBoxInput.value = "";
  //searchCountryButton.focus();
}
