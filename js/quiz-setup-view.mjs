import log from './logging.mjs';
import countries from './countries.mjs';
import { Quiz } from './quiz.mjs';

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

    // Fill country sets available:
    this.quizCountrySetSelect.innerHTML = '';
    let sets = Object.values(countries.getCountrySets());
    sets.sort((cs1, cs2) => cs1.name === "all" ? -1 : cs2.name === "all" ? +1 : cs1.name.localeCompare(cs2.name));
    sets.forEach((cs) => {
      let option = document.createElement("option");
      option.value = cs.name;
      option.textContent = cs.description;
      this.quizCountrySetSelect.appendChild(option);
    });
  }

  activate() {
    this._updateUrl('quiz', 'setup');
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
    this.app._startQuiz({
      'type': quizType,
      'limit': quizLength,
      'set': {
        'id': quizCountrySetId,
        'description': quizCountrySetDescription
       }
    });
  }
}