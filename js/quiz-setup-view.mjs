import log from './logging.mjs';
import countries from './countries.mjs';
import { Quiz } from './quiz.mjs';
import { QUIZ_TYPES, QUIZ_LENGTHS, COUNTRY_SETS } from './settings.mjs';
import utils from './utils.mjs';

/**
 *  The quiz setup view.
 */
export class QuizSetupView {
  constructor(parentElement, app) {
    if (parentElement && app) {
      this.attach(parentElement, app);
    }
  }

  attach(parentElement, app) {
    this.app = app;
    this.parent = parentElement; 

    // Get UI elements:
    this.startQuizButton = this.parent.querySelector("#start-quiz");
    this.quizTypeSelect = this.parent.querySelector("#quiz-type");
    this.quizCountrySetSelect = this.parent.querySelector("#quiz-country-set");
    this.quizLengthSelect = this.parent.querySelector("#quiz-length");

    // Attach event handlers:
    this.startQuizButton.addEventListener('click', this.onStartQuiz.bind(this));

    // Fill quiz type options:
    this.quizTypeSelect.innerHTML = '';
    for (let qt of QUIZ_TYPES) {
      this.quizTypeSelect.appendChild(utils.createOptionElement(qt.name, qt.description));
    }
    // Fill country sets available:
    this.quizCountrySetSelect.innerHTML = '';
    for (let cs of COUNTRY_SETS) {
      this.quizCountrySetSelect.appendChild(utils.createOptionElement(cs.name, cs.description));
    }
    // Fill quiz length options:
    this.quizLengthSelect.innerHTML = '';
    for (let ql of QUIZ_LENGTHS) {
      this.quizLengthSelect.appendChild(utils.createOptionElement(ql.name, ql.description));
    }
  }

  activate() {
    this._updateUrl('quiz', 'setup');
    this.quizTypeSelect.value = this.app.settings.getSetting('default-quiz-type', QUIZ_TYPES[0].name);
    this.quizCountrySetSelect.value = this.app.settings.getSetting('default-quiz-country-set', COUNTRY_SETS[0].name);
    this.quizLengthSelect.value = this.app.settings.getSetting('default-quiz-length', QUIZ_LENGTHS[0].name);    
  }

  deactivate() {
    
  }

  detach() {
    this.parent = null;
    this.app = null;
  }

  // Actions: 

  _updateUrl(view, state) {
    let newUrl = `${window.location.origin}/${view}`
    if (state) {
       newUrl += `#${state.replace(/ /g, '+')}`;
    }
    if (newUrl !== window.location.href) {
      history.pushState({ view: view, state: state }, '', newUrl);
    }
  }

  // Event Handlers:

  onStartQuiz(event) {
    let quizType = this.quizTypeSelect.value;
    let quizCountrySetId = this.quizCountrySetSelect.value;
    let quizCountrySetDescription = this.quizCountrySetSelect.options[this.quizCountrySetSelect.selectedIndex].textContent;
    let quizLength = this.quizLengthSelect.value;
    log.info(`Starting quiz with type '${quizType}', set '${quizCountrySetId}' and length '${quizLength}'`);
    const quizOptions = {
      'type': quizType,
      'limit': quizLength,
      'set': {
        'id': quizCountrySetId,
        'description': quizCountrySetDescription
       }
    };
    this.app.switchToView('quiz-play', quizOptions);
  }
}