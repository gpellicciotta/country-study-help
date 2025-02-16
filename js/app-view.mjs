import log from './logging.mjs';
import countries from './countries.mjs';

import { EventTargetMixin } from './event-target-mixin.mjs';
import { SearchView } from './search-view.mjs';
import { AboutView } from './about-view.mjs';
import { QuizView } from './quiz-view.mjs';
import { QuizSetupView } from './quiz-setup-view.mjs';
import { QuizResultsView } from './quiz-results-view.mjs';

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

    // Model/data elements:
    this.activeViewMode = 'initial';

    // View elements:
    this.aboutView = new AboutView(this.parent, this);
    this.searchView = new SearchView(this.parent, this);
    this.quizView = new QuizView(this.parent, this);
    this.quizSetupView = new QuizSetupView(this.parent, this);
    this.quizResultsView = new QuizResultsView(this.parent, this);

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

    // Activate correct, initial view
    history.replaceState({ view: 'search', country: null }, '', `${window.location.origin}/search`);    
    this.switchToView(window.location.pathname?.replaceAll('/', '') || 'search', window.location.hash?.substring(1));
  }

  detach() {
    this.parent = null;
    this.country = null;
    this.activeViewMode = 'initial';
  }

  // Actions:

  _startQuiz(quizOptions) {
    log.info('Starting quiz', quizOptions);
    this.activeViewMode = 'quiz-play';
    this.parent.setAttribute("data-mode", 'quiz-play');
    this.activeView = this.quizView;
    this.activeView.activate(quizOptions);
  }

  _stopQuiz(quizResults) {
    log.info('Stopping quiz with results:', quizResults);
    this.activeViewMode = 'quiz-results';
    this.parent.setAttribute("data-mode", 'quiz-results');
    this.activeView = this.quizResultsView;
    this.activeView.activate(quizResults);
  }

  switchToView(view, data) {
    let event = null
    if (view !== this.activeViewMode) {
      this.activeViewMode = view;
      this.parent.setAttribute("data-mode", view);
      event = new CustomEvent('viewChange', { detail: view });
    }
    if (this.activeViewMode === 'search') {
      this.activeView = this.searchView;
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