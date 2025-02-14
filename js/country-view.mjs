import log from './logging.mjs';
import countries from './countries.mjs';
import { Quiz } from './quiz.mjs';

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

    this.flagImage = parentElement.querySelector("#flag");
    this.englishCountryNameEl = parentElement.querySelector("#english_country_name");
    this.englishCapitalNameEl = parentElement.querySelector("#english_capital_name");
    this.englishWikipediaLinkEl = parentElement.querySelector("#english_wikipedia");
    this.dutchCountryNameEl = parentElement.querySelector("#dutch_country_name");
    this.dutchCapitalNameEl = parentElement.querySelector("#dutch_capital_name");
    this.dutchWikipediaLinkEl = parentElement.querySelector("#dutch_wikipedia");
    this.italianCountryNameEl = parentElement.querySelector("#italian_country_name");
    this.italianCapitalNameEl = parentElement.querySelector("#italian_capital_name");
    this.italianWikipediaLinkEl = parentElement.querySelector("#italian_wikipedia");
    this.mapEl = parentElement.querySelector("#map");
  }

  detach() {
    this.parent.removeChild(this.element);
    this.parent = null;
  }

  // Actions: 

  render(country) {
    log.info(`Showing country ${country.cca2}:`, this.country);
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

  // Event Handlers:
}