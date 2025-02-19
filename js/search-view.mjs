import log from './logging.mjs';
import countries from './countries.mjs';
import utils from './utils.mjs';
import { EventTargetMixin } from './event-target-mixin.mjs';
import { CountryView } from './country-view.mjs';
import { Settings } from './settings.mjs';
import { Quiz } from './quiz.mjs';

/**
 *  The search view.
 */
export class SearchView extends EventTargetMixin(Object) {
  constructor(parentElement, app) {
    super();
    if (parentElement && app) {
      this.attach(parentElement, app);
    }
  }

  attach(parentElement, app) {
    log.debug("Attaching search view to parent element", parentElement);	

    this.app = app;
    this.parent = parentElement; 

    // Model/data elements:
    const searchCountrySet = this.app.settings.getSetting('search-country-set', 'all');
    this.searchCountryCodes = countries.getCountrySet(searchCountrySet).codes;
    this.searchInRandomOrder = new Quiz(this.searchCountryCodes);
    this.activeCountry = null;

    // Get UI control elements:
    this.searchBoxInput = this.parent.querySelector('#country-box');
    this.searchList = this.parent.querySelector('#search-list');
    this.searchCountryButton = this.parent.querySelector('#search-country');
    this.randomCountryButton = this.parent.querySelector('#random-country');
    this.countryPanel = this.parent.querySelector('#results');
    
    // Get UI display elements:
    this.countryView = new CountryView(this.countryPanel);

    // Attach event handlers:
    this.searchBoxInput.addEventListener('input', this.onSearchBoxInput.bind(this));
    this.searchBoxInput.addEventListener('keydown', this.onSearchBoxKeyDown.bind(this)); // Add keydown event listener
    this.searchCountryButton.addEventListener('click', this.onSearchCountry.bind(this));
    this.randomCountryButton.addEventListener('click', this.onSelectRandomCountry.bind(this));
    
    // Attach auto-complete data:
    this.searchList.innerHTML = '';
    let searchTerms = new Set();
    for (let cc of this.searchCountryCodes) {
      let country = countries.getCountryByCode(cc);
      log.debug(`Adding search items for country with code '${cc}'`, country);
      searchTerms.add(country.dutch_country_name);
      searchTerms.add(country.dutch_capital_name);
      searchTerms.add(country.italian_country_name);
      searchTerms.add(country.italian_capital_name);
      searchTerms.add(country.name.common);
      searchTerms.add(country.name.official);
      if (country.capital) {
        for (let capital of country.capital) {
          searchTerms.add(capital);
        }
      }
      if (country.cca2) {
        searchTerms.add(country.cca2);
      }
      if (country.cca3) {
        searchTerms.add(country.cca3);
      }
      if (country.ccn3) {
        searchTerms.add(country.ccn3);
      }
    }
    searchTerms = Array.from(searchTerms).sort();
    for (let st of searchTerms) {
      this.searchList.appendChild(utils.createOptionElement(st));
    }
  }

  activate(country) {
    if (!country && this.activeCountry) {
      country = this.activeCountry.english_country_name;
    }
    if (!country || !this.tryToShowCountry(country)) {
      this._updateUrl('search', null);
      this.countryPanel.classList.add('no-country-found');
    }
    else {
      this.countryPanel.classList.remove('no-country-found');
    }
    this.countryView.setInfoLanguages(this.app.settings.getSetting('info-languages', []));
    this.countryView.showAll();
    this.searchBoxInput.value = '';
    this.searchBoxInput.classList.remove('not-found');
    this.searchBoxInput.removeAttribute('disabled');
    this.searchCountryButton.removeAttribute('disabled');
    this.randomCountryButton.removeAttribute('disabled');	
  }

  deactivate() {
    
  }

  detach() {
    this.parent.removeChild(this.element);
    this.parent = null;
    this.app = null;
  }

  // Actions: 

  _updateUrl(view, country) {
    let newUrl = `${window.location.origin}/${view}`
    if (country) {
       newUrl += `#${country.replace(/ /g, '+')}`;
    }
    if (newUrl !== window.location.href) {
      history.pushState({ view: view, country: country }, '', newUrl);
    }
  }

  showCountry(countryCode) {
    if (countryCode === this.activeCountry?.cca2) {
      return;
    }
    this.activeCountry = countries.getCountryByCode(countryCode);

    this.countryView.setInfoLanguages(this.app.settings.getSetting('info-languages', []));
    this.countryView.showAll();
    this.countryView.render(this.activeCountry);

    this.countryPanel.classList.remove('no-country-found');

    const event = new CustomEvent('countryChange', { detail: this.activeCountry });
    this.dispatchEvent(event);

    this._updateUrl('search', this.activeCountry.english_country_name);
  }

  tryToShowCountry(countryQuery) {
    let cc = countries.getCountryCode(countryQuery);
    if (cc) {
      this.showCountry(cc);
      return true;
    }
    else {
      this.countryPanel.classList.add('not-found');
      return false;
    }
  }

  showRandomCountry() {
    let cc = this.searchInRandomOrder.getNextQuestion();
    if (!cc) {
      this.searchInRandomOrder.resetQuiz();
      cc = this.searchInRandomOrder.getNextQuestion();
    }
    log.debug('Random country selected:', cc);
    this.showCountry(cc);
  }

  // Event Handlers:

  onSelectRandomCountry(event) {
    log.debug('Random country button clicked.');
    this.showRandomCountry();
    this.randomCountryButton.blur(); // Remove hover state on mobile
  }

  onSearchCountry(event) {
    let searchValue = this.searchBoxInput.value;
    log.debug(`Search country for search term '${searchValue}'`);
    // Handle input value changes
    let cc = countries.getCountryCode(searchValue);
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

  onSearchBoxInput(event) {
    let searchValue = this.searchBoxInput.value;
    log.debug('Input box event fired:', event.target.value);
    // Handle input value changes
    let cc = countries.getCountryCode(searchValue);
    if (cc) {
      this.searchBoxInput.classList.remove('not-found');
      log.debug("Country code found:", cc);
    }
    else {
      this.searchBoxInput.classList.add('not-found');
      log.debug("No country found for:", event.target.value);
    }
  }

  onSearchBoxKeyDown(event) {
    if (event.key === 'Enter') {
      log.debug('Input box ENTER event fired:', event);
      this.onSearchCountry(event);
    }
  }  
}