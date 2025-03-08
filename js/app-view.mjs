import log from './logging.mjs';
import countries from './countries.mjs';

import { EventTargetMixin } from './event-target-mixin.mjs';
import { SearchView } from './search-view.mjs';
import { CarouselView } from './carousel-view.mjs';
import { AboutView } from './about-view.mjs';
import { SettingsView } from './settings-view.mjs';
import { QuizView } from './quiz-view.mjs';
import { QuizSetupView } from './quiz-setup-view.mjs';
import { QuizResultsView } from './quiz-results-view.mjs';
import { QuizStatsView } from './quiz-stats-view.mjs';

/**
 *  The main application view.
 */
export class AppView extends EventTargetMixin(Object) {
  constructor(settings, results) {
    super();
    this.settings = settings;
    this.results = results;
  }

  attach(parentElement) {
    this.parent = parentElement;

    // Model/data elements:
    this.activeViewMode = 'initial';

    // View elements:
    this.aboutView = new AboutView(this.parent, this);
    this.searchView = new SearchView(this.parent, this);
    this.carouselView = new CarouselView(this.parent, this);
    this.settingsView = new SettingsView(this.parent, this);
    this.quizView = new QuizView(this.parent, this);
    this.quizSetupView = new QuizSetupView(this.parent, this);
    this.quizResultsView = new QuizResultsView(this.parent, this);
    this.quizStatsView = new QuizStatsView(this.parent, this);

    this.activeView = this.searchView;

    // Find all elements:
    this.modeSwitch = this.parent.querySelector('#mode-switch');
    this.modeSwitchButton = this.parent.querySelector('#mode-switch > .dropdown-button');
    this.modeSwitchContent = this.parent.querySelector('#mode-switch > .dropdown-content');

    // Attach event handlers:
    this.modeSwitch.addEventListener('mouseleave', this.onModeSwitchChange.bind(this));
    this.modeSwitchButton.addEventListener('click', this.onModeSwitchChange.bind(this));
    this.modeSwitchContent.addEventListener('click', this.onModeSwitchChange.bind(this));

    window.addEventListener('popstate', this.onSwitchView.bind(this));
    window.addEventListener('resize', this.onWindowResize.bind(this));

    // Set display language
    const displayLanguage = this.settings.getSetting('display-language', 'en');
    this.parent.setAttribute('lang', displayLanguage);
    
    // Activate correct, initial view
    const [ initialView, initialData ] = this.#getInitialView();
    history.replaceState({ view: initialView, country: initialData }, '', `${window.location.origin}/search`);    
    this.switchToView(initialView, initialData);
  }

  #getInitialView() {
    if (document.referrer) {
      log.info("Redirected from: ", document.referrer);
      const url = new URL(document.referrer);
      const view = url.pathname?.replaceAll('/', '') || 'about';
      const data = url.hash?.substring(1); // Remove leading '#'
      return [ view, data ]
    }
    else {
      const view = window.location.pathname?.replaceAll('/', '') || 'about';
      const data = window.location.hash?.substring(1); // Remove leading '#'
      return [ view, data ];
    }
  }

  detach() {
    this.parent = null;
    this.activeViewMode = 'initial';
  }

  // Actions:

  _saveQuizResults(quizResults) {
    this.results.addNewResult(quizResults);
  }

  switchToView(view, data) {
    log.info("Switching to view:", view, "with data:", data);
    let event = null
    if (view !== this.activeViewMode) {
      this.activeView.deactivate();
      this.activeViewMode = view;
      this.parent.setAttribute("data-mode", view);
      event = new CustomEvent('viewChange', { detail: view });
    }
    if (this.activeViewMode === 'search') {
      this.activeView = this.searchView;
    }
    else if (this.activeViewMode === 'carousel') {
      this.activeView = this.carouselView;
    }
    else if (this.activeViewMode === 'quiz-setup') {
      this.activeView = this.quizSetupView;
    }
    else if (this.activeViewMode === 'quiz-play') {
      this.activeView = this.quizView;
    }
    else if (this.activeViewMode === 'quiz-results') {
      this.activeView = this.quizResultsView;
    }
    else if (this.activeViewMode === 'quiz-stats') {
      this.activeView = this.quizStatsView;
    }
    else if (this.activeViewMode === 'settings') {
      this.activeView = this.settingsView;
    }
    else if (this.activeViewMode === 'about') {
      this.activeView = this.aboutView;
    }
    this.activeView.activate(data);
    if (event) {
      this.dispatchEvent(event);
    }
  }

  // Event handlers:

  onWindowResize(event) {
    if (window.innerWidth < 800) {
      this.parent.classList.add('mobile');
    }
    else {
      this.parent.classList.remove('mobile');
    }
  }

  onSwitchView(event) {
    const view = window.location.pathname?.replaceAll('/', '');
    const country = window.location.hash?.substring(1); // Remove leading '#'
    log.info('Switching to view:', view, 'for country:', country);
    this.switchToView(view, country);
  }

  onModeSwitchChange(event) {
    // Focus outside switch area
    if (event.type === 'mouseleave') {
      this.modeSwitch.classList.remove('open'); // Close the drop-down
      return;
    }

    // Check drop-down button clicked
    const switchButton = event.target.closest('button.dropdown-button');
    if (switchButton) {
      this.modeSwitch.classList.toggle('open'); // Open or close the drop-down
      return ;
    }
    // Check mode button clicked
    const modeButton = event.target.closest('button.option-button');
    if (modeButton) {
      this.switchToView(modeButton.dataset.mode);
      this.modeSwitch.classList.remove('open'); // Close the drop-down again
      return ;
    }
  }
}