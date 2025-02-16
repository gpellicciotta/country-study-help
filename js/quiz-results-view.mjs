import log from './logging.mjs';
import countries from './countries.mjs';
import { Quiz } from './quiz.mjs';

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

    // Get UI elements:
    this.quizResultsRemarks = this.parent.querySelector("#results-quiz-remarks");
    this.quizQuestionsAnsweredNumber = this.parent.querySelector("#results-quiz-questions-answered");
    this.quizGoodAnswersNumber = this.parent.querySelector("#results-quiz-good-answers");
    this.quizBadAnswersNumber = this.parent.querySelector("#results-quiz-bad-answers");
    this.quizScoreText = this.parent.querySelector("#results-quiz-score");
  }

  activate(quizResults) {
    this._updateUrl('quiz', 'results');

    this.quizResults = quizResults;
    let questionsAnswered = quizResults.goodAnswers + quizResults.badAnswers;
    this.quizQuestionsAnsweredNumber.value = questionsAnswered;
    this.quizGoodAnswersNumber.value = quizResults.goodAnswers;
    this.quizBadAnswersNumber.value = quizResults.badAnswers;
    let score = "No score"
    if (questionsAnswered) {
      score = (quizResults.goodAnswers / questionsAnswered * 100).toFixed(0) + '%';
    }
    this.quizScoreText.value = score;
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

}