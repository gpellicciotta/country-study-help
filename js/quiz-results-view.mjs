import log from './logging.mjs';
import countries from './countries.mjs';
import { Quiz } from './quiz.mjs';
import utils from './utils.mjs';

/**
 *  The quiz results view.
 */
export class QuizResultsView {
  constructor(parentElement, app) {
    if (parentElement && app) {
      this.attach(parentElement, app);
    }
  }

  attach(parentElement, app) {
    this.app = app;
    this.parent = parentElement; 
    this.quizResults = null;
    this.maxScore = 0;

    // Get UI elements:
    this.saveQuizResultsButton = this.parent.querySelector("#save-quiz-results");

    this.quizResultsRemarks = this.parent.querySelector("#results-quiz-remarks");
    this.quizElapsedTime = this.parent.querySelector("#results-quiz-elapsed-time");
    this.quizTotalQuestionsNumber = this.parent.querySelector("#results-quiz-total-questions");
    this.quizQuestionsAnsweredNumber = this.parent.querySelector("#results-quiz-questions-answered");
    this.quizGoodAnswersNumber = this.parent.querySelector("#results-quiz-good-answers");
    this.quizBadAnswersNumber = this.parent.querySelector("#results-quiz-bad-answers");
    this.quizScoreText = this.parent.querySelector("#results-quiz-score");

    // Event handlers:
    this.saveQuizResultsButton.addEventListener('click', this.onSaveQuizResults.bind(this));
  }

  activate(quizResults) {
    this._updateUrl('quiz', 'results');

    this.quizResults = quizResults;
    this.saveQuizResultsButton.removeAttribute('disabled');
    this.parent.classList.remove("pr");

    this.quizResultsRemarks.value = `Quiz with ${quizResults.questions.length} questions.`;
    this.quizElapsedTime.value = utils.toDurationStr(quizResults.duration);
    this.quizTotalQuestionsNumber.value = quizResults.questions.length;
    let questionsAnswered = quizResults["correct-answers"].length + quizResults["incorrect-answers"].length;
    this.quizQuestionsAnsweredNumber.value = questionsAnswered;
    this.quizGoodAnswersNumber.value = quizResults["correct-answers"].length;
    this.quizBadAnswersNumber.value = quizResults["incorrect-answers"].length;
    let score = 0.0;
    if (questionsAnswered) {
      score = (quizResults["correct-answers"].length / quizResults.questions.length);
    }
    this.quizScoreText.value = score ? `${(score * 100).toFixed(0)}%` : "No score";
    if (score > this.maxScore) {
      this.maxScore = score;
      this.quizResults.pr = true;
      this.parent.classList.add("pr");
    }
    else {
      this.quizResults.pr = false;
      this.parent.classList.remove("pr");
    }
  }

  deactivate() {
    
  }

  detach() {
    this.parent = null;
    this.app = null;
    this.quizResults = null;
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

  onSaveQuizResults(event) {
    log.info('Saving quiz results:', this.quizResults);
    this.app._saveQuizResults(this.quizResults);
    this.saveQuizResultsButton.setAttribute('disabled', 'disabled');
    this.app.switchToView('quiz-stats');
  }
}