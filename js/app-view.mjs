import log from './logging.mjs';
import countries from './countries.mjs';
import { Quiz } from './quiz.mjs';
import { CountryView } from './country-view.mjs';
import { EventTargetMixin } from './event-target-mixin.mjs';

/**
 *  The main application view.
 */
export class AppView extends EventTargetMixin(Object) {
  constructor(parentElement) {
    super();
    if (parentElement) {
      this.attach(parentElement);
    } 
  }

  attach(parentElement) {
    this.parent = parentElement;
    this.countryCodes = countries.getCountrySet('europe').codes;
    this.quiz = new Quiz(this.countryCodes);
    // Find all elements:
    this.searchBoxInput = this.parent.querySelector('#country-box');
    this.searchList = this.parent.querySelector('#search-list');
    this.randomCountryButton = this.parent.querySelector('#random-country');
    this.countryPanel = this.parent.querySelector('#results');
    this.countryView = new CountryView(this.countryPanel);
    // Attach event handlers:
    this.searchBoxInput.addEventListener('input', this.onSearchBoxInput.bind(this));
    this.randomCountryButton.addEventListener('click', this.onSelectRandomCountry.bind(this));
    // Attach auto-complete data:
    this.searchList.innerHTML = '';
    for (let cc of this.countryCodes) {
      let country = countries.getCountryByCode(cc);
      this.searchList.appendChild(this._createOptionElement(country.dutch_country_name));
      this.searchList.appendChild(this._createOptionElement(country.dutch_capital_name));
      this.searchList.appendChild(this._createOptionElement(country.italian_country_name));
      this.searchList.appendChild(this._createOptionElement(country.italian_capital_name));    
      this.searchList.appendChild(this._createOptionElement(country.name.common));
      this.searchList.appendChild(this._createOptionElement(country.name.official));
      for (let capital of country.capital) {
        this.searchList.appendChild(this._createOptionElement(capital));
      }
      this.searchList.appendChild(this._createOptionElement(country.cca2));
      this.searchList.appendChild(this._createOptionElement(country.cca3));
      this.searchList.appendChild(this._createOptionElement(country.ccn3));
    }
  }

  _createOptionElement(value) {
    let option = document.createElement('option');
    option.value = value;
    return option;
  }  

  detach() {
    this.parent = null;
    this.country = null;
  }

  // Actions:

  showCountry(countryCode) {
    this.country = countries.getCountryByCode(countryCode);
    this.countryView.render(this.country);
    
    const event = new CustomEvent('countryChange', { detail: this.country });
    this.dispatchEvent(event);
  }

  tryToShowCountry(countryQuery) {
    let cc = countries.getCountryCode(countryQuery);
    if (cc) {
      this.showCountry(cc);
      return true;
    }
    else {
      return false;
    }
  }

  // Event handlers:

  onSelectRandomCountry(event) {
    log.debug('Random country button clicked.');
    let cc = this.quiz.getNextQuestion();
    if (!cc) {
      this.quiz.resetQuiz();
      cc = this.quiz.getNextQuestion();  
    }
    log.debug('Random country selected:', cc); 
    this.showCountry(cc);
  }

  onSearchBoxInput(event) {
    log.debug('Input event fired:', event.target.value);
    // Handle input value changes
    let cc = countries.getCountryCode(event.target.value);
    if (cc) {
      this.searchBoxInput.classList.remove('not-found');
      log.debug("Country code found:", cc);
      this.showCountry(cc);
    }
    else {
      this.searchBoxInput.classList.add('not-found');
      log.debug("No country found for:", event.target.value);
    }
  }
}