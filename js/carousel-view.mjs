import log from './logging.mjs';
import countries from './countries.mjs';
import utils from './utils.mjs';
import { EventTargetMixin } from './event-target-mixin.mjs';
import { CountryView } from './country-view.mjs';
import { Settings } from './settings.mjs';
import { Quiz } from './quiz.mjs';

/**
 *  The carousel view.
 */
export class CarouselView extends EventTargetMixin(Object) {
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
    const carouselCountrySet = this.app.settings.getSetting('carousel-country-set', 'all');
    this.carouselCountryCodes = countries.getCountrySet(carouselCountrySet).codes;
    this.carouselCountryCodes = this.carouselCountryCodes.sort(() => 0.5 - Math.random());
    const carouselCountryLimit = this.app.settings.getSetting('carousel-limit', 'all');
    if (utils.isNumber(carouselCountryLimit)) {
      this.carouselCountryCodes = this.carouselCountryCodes.slice(0, +carouselCountryLimit);
    }
    this.carouselInRandomOrder = new Quiz(this.carouselCountryCodes);
    this.carouselShowType = this.app.settings.getSetting('carousel-show-type', 'all');
    this.carouselSwitchTimeMillis = this.app.settings.getSetting('carousel-switch-time', 5000);
    this.carouselRevealTimeMillis = this.app.settings.getSetting('carousel-reveal-time', 3000);
    this.activeCountry = null;
    this.carouselSwitchTimer = null;
    this.carouselRevealTimer = null;

    // Get UI control elements:
    this.startCarouselButton = this.parent.querySelector('#start-carousel');
    this.pauseCarouselButton = this.parent.querySelector('#pause-carousel');
    this.countryPanel = this.parent.querySelector('#results');
    this.shownCountriesSpan = this.parent.querySelector('#shown-countries');
    this.totalCountriesSpan = this.parent.querySelector('#total-countries');  
    this.progressPercentageSpan = this.parent.querySelector('#progress-percentage');

    // Get UI display elements:
    this.countryView = new CountryView(this.countryPanel);

    // Attach event handlers:
    this.startCarouselButton.addEventListener('click', this.onStartCarousel.bind(this));
    this.pauseCarouselButton.addEventListener('click', this.onPauseCarousel.bind(this));
  }

  activate() {
    this._updateUrl('carousel', null);
    this.countryPanel.classList.add('carousel-paused');
    this.countryPanel.classList.remove('no-country-found');
    this.countryView.setInfoLanguages(this.app.settings.getSetting('info-languages', []));
    this.startCarouselButton.removeAttribute('disabled');
    this.pauseCarouselButton.setAttribute('disabled', 'disabled');
    this.onStartCarousel();
  }

  deactivate() {
    if (this.carouselRevealTimer) {
      clearTimeout(this.carouselRevealTimer);
      this.carouselRevealTimer = null;
    }
    if (this.carouselSwitchTimer) {
      clearInterval(this.carouselSwitchTimer);
      this.carouselSwitchTimer = null;
    } 
  }

  detach() {
    this.deactivate();
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

  showNextCountry() {
    let cc = this.carouselInRandomOrder.getNextQuestion();
    if (!cc) {
      this.carouselInRandomOrder.resetQuiz();
      cc = this.carouselInRandomOrder.getNextQuestion();
    }
    log.debug('Next country selected:', cc);
    const progress = this.carouselInRandomOrder.getProgress();
    this.activeCountry = countries.getCountryByCode(cc);
    // Country:
    switch (this.carouselShowType.name) {
      case 'all':  
        this.countryView.showAll();
        break;
      default:
        this.countryView.hide(this.carouselShowType.split('-'));
        this.countryView.hide(['name', 'capital', 'flag']);
        break;
    }
    this.countryView.render(this.activeCountry);
    if (this.carouselRevealTimeMillis < this.carouselSwitchTimeMillis) {
      setTimeout(() => { 
        if (this.activeCountry?.cca2?.toLowerCase() === cc) { // Still same country
          this.countryView.showAll(); 
        }
      }, this.carouselRevealTimeMillis);
    }
    // Progress:
    const availableQuestions = progress.questions.length;
    const answersGiven = progress.correctAnswers.length + progress.incorrectAnswers.length;
    this.shownCountriesSpan.textContent = answersGiven;
    this.totalCountriesSpan.textContent = availableQuestions;
    this.progressPercentageSpan.textContent = ' ('+ (answersGiven / availableQuestions * 100).toFixed(0) + '%)';
  }

  // Event Handlers:

  onStartCarousel(event) {
    log.debug('Start carousel button clicked.');
    this.pauseCarouselButton.removeAttribute('disabled');
    this.startCarouselButton.setAttribute('disabled', 'disabled');
    // Start carousel
    if (this.carouselSwitchTimer) {
      clearInterval(this.carouselSwitchTimer);
      this.carouselSwitchTimer = null;
    }
    this.carouselSwitchTimer = setInterval(() => { this.showNextCountry(); }, this.carouselSwitchTimeMillis);
  }

  onPauseCarousel(event) {
    log.debug('Pause carousel button clicked.');
    // Pause carousel
    if (this.carouselSwitchTimer) {
      clearInterval(this.carouselSwitchTimer);
      this.carouselSwitchTimer = null;
    }
    this.startCarouselButton.removeAttribute('disabled');
    this.pauseCarouselButton.setAttribute('disabled', 'disabled');    
  }
}