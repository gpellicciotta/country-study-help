import log from './logging.mjs';

/**
 *  The view of a single country.
 */
export class CountryView {
  constructor(parentElement, country) {
    this.element = null;
    if (parentElement) {
      this.attach(parentElement);
      if (country) {
        this.render(country);
      }
    }
  }

  attach(parentElement) {
    this.parent = parentElement; 

    this.flagImage = this.parent.querySelector("#flag");
    this.englishCountryNameEl = this.parent.querySelector("#english_country_name");
    this.englishCapitalNameEl = this.parent.querySelector("#english_capital_name");
    this.englishWikipediaLinkEl = this.parent.querySelector("#english_wikipedia");
    this.dutchCountryNameEl = this.parent.querySelector("#dutch_country_name");
    this.dutchCapitalNameEl = this.parent.querySelector("#dutch_capital_name");
    this.dutchWikipediaLinkEl = this.parent.querySelector("#dutch_wikipedia");
    this.italianCountryNameEl = this.parent.querySelector("#italian_country_name");
    this.italianCapitalNameEl = this.parent.querySelector("#italian_capital_name");
    this.italianWikipediaLinkEl = this.parent.querySelector("#italian_wikipedia");
    this.mapEl = this.parent.querySelector("#map");
  }

  detach() {
    this.parent.removeChild(this.element);
    this.parent = null;
  }

  // Actions: 

  render(country) {
    log.info(`Showing country ${country.cca2}:`, country);
    this.country = country;

    this.flagImage.src = `img/flags/4x3/${country.code}.svg`;
    this.flagImage.alt = `Flag of ${country.english_country_name}`;
    this.englishCountryNameEl.textContent = country.english_country_name;
    this.englishCapitalNameEl.textContent = country.english_capital_name;
    this.englishWikipediaLinkEl.href = `https://en.wikipedia.org/wiki/${encodeURIComponent(country.english_country_name)}`;
    this.dutchCountryNameEl.textContent = country.dutch_country_name;
    this.dutchCapitalNameEl.textContent = country.dutch_capital_name;
    this.dutchWikipediaLinkEl.href = `https://nl.wikipedia.org/wiki/${encodeURIComponent(country.dutch_country_name)}`;
    this.italianCountryNameEl.textContent = country.italian_country_name;
    this.italianCapitalNameEl.textContent = country.italian_capital_name;
    this.italianWikipediaLinkEl.href = `https://it.wikipedia.org/wiki/${encodeURIComponent(country.italian_country_name)}`;
    this.mapEl.src = `img/maps/${country.code}.svg`;
  }

  setInfoLanguages(languages) {
    this.parent.classList.forEach((className) => {
      if (className.startsWith('lang-')) {
        this.parent.classList.remove(className);
      }
    });
    languages.forEach((lang) => {
      this.parent.classList.add(`lang-${lang}`);
    });
    this.parent.setAttribute('data-info-languages', languages.join(' '));
    this.parent.setAttribute('data-info-languages-count', languages.length);
  }

  hideAll() {
   this.hide(['name', 'capital', 'flag', 'map']);
  }
  
  showAll() {
    this.show(['name', 'capital', 'flag', 'map']);
  }

  hide(options) {
    options.forEach((option) => {
      this.parent.classList.add(`hide-${option}`);
    }); 
  }

  show(options) {
    options.forEach((option) => {
      this.parent.classList.remove(`hide-${option}`);
    });
  }

  // Event Handlers:
}