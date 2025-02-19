import log from './logging.mjs';
import countries from './countries.mjs';
import utils from './utils.mjs';
import { EventTargetMixin } from './event-target-mixin.mjs';
import { CountryView } from './country-view.mjs';
import { Quiz } from './quiz.mjs';

/**
 *  The quiz (execution) view.
 */
export class QuizView extends EventTargetMixin(Object) {
  constructor(parentElement, app) {
    super();
    if (parentElement && app) {
      this.attach(parentElement, app);
    }
  }

  attach(parentElement, app, options) {
    log.debug("Attaching quiz view to parent element", parentElement);	

    this.app = app;
    this.parent = parentElement; 

    // Model/data elements:
    this.quiz = null;
    this.stage = 'ask'; // 'show', 'eval', 'done'

    // Get UI control elements:
    this.showAnswerButton = this.parent.querySelector('#show-answer');
    this.goodAnswerButton = this.parent.querySelector('#good-answer');
    this.badAnswerButton = this.parent.querySelector('#bad-answer');
    this.stopQuizButton = this.parent.querySelector('#stop-quiz');
    
    // Get UI display elements:
    this.countryPanel = this.parent.querySelector('#results');
    this.countryView = new CountryView(this.countryPanel);
    this.goodAnswersCounter = this.parent.querySelector('#good-answers');
    this.badAnswersCounter = this.parent.querySelector('#bad-answers');
    this.scorePercentage = this.parent.querySelector('#score-percentage');

    // Attach event handlers:
    this.showAnswerButton.addEventListener('click', this.onShowAnswer.bind(this));
    this.goodAnswerButton.addEventListener('click', this.onGoodAnswer.bind(this));
    this.badAnswerButton.addEventListener('click', this.onBadAnswer.bind(this));
    this.stopQuizButton.addEventListener('click', this.onStopQuiz.bind(this));
  }

  activate(quizOptions) {
    this._updateUrl('quiz', quizOptions);

    const countrySet = countries.getCountrySet(quizOptions.set.id);
    this.quizOptions = quizOptions;
    this.selectedCountries = countrySet.codes.sort(() => 0.5 - Math.random());
    if (utils.isNumber(quizOptions.limit)) {
      this.selectedCountries = this.selectedCountries.slice(0, +quizOptions.limit);
    }
    this.quiz = new Quiz(this.selectedCountries);

    this.countryPanel.classList.remove("not-found");
    this.countryView.setInfoLanguages(this.app.settings.getSetting('info-languages', []));
    this.askNextQuestion();
  }

  deactivate() {
    
  }

  detach() {
    this.parent.removeChild(this.element);
    this.parent = null;
    this.app = null;
  }

  // Actions: 

  askNextQuestion() {
    let countryCode = this.quiz.getNextQuestion();
    if (!countryCode) {
      this.stopQuiz();
      return ;
    }
    this.stage = 'ask';
    this.showAnswerButton.disabled = false;
    this.goodAnswerButton.disabled = true;
    this.badAnswerButton.disabled = true;
    this.activeCountry = countries.getCountryByCode(countryCode);
    switch (this.quizOptions.type) {
      case 'guess-capital':
        this.countryView.hide(['capital']);	
        break;
      case 'guess-country-by-capital':
        this.countryView.hide(['name', 'flag', 'map']);
        break;
      case 'guess-country-by-flag':
        this.countryView.hide(['name', 'capital', 'map']);
        break;
      case 'guess-country-by-map':
        this.countryView.hide(['name', 'capital', 'flag']);
        break;
      default:
        this.countryView.hide(['name']);
        break;
    }
    this.countryView.render(this.activeCountry); 
  }

  showAnswer() {
    this.stage = 'evaluate';
    this.parent.setAttribute("data-quiz-state", this.stage);
    this.showAnswerButton.disabled = true;
    this.goodAnswerButton.disabled = false;
    this.badAnswerButton.disabled = false;
    this.countryView.showAll();
  }

  evaluateAnswer(isCorrect) {
    let progress = this.quiz.recordAnswer(isCorrect);
    this.goodAnswersCounter.textContent = progress.goodAnswers;
    this.badAnswersCounter.textContent = progress.badAnswers;
    this.scorePercentage.textContent = (progress.goodAnswers / (progress.goodAnswers + progress.badAnswers) * 100).toFixed(0);
    this.askNextQuestion();
  }

  stopQuiz() {
    this.stage = 'done';
    this.parent.setAttribute("data-quiz-state", this.stage);
    this.dispatchEvent(new CustomEvent('quiz-done', { detail: { goodAnswers: this.quiz.getGoodAnswers(), badAnswers: this.quiz.getBadAnswers() } }));
    let results = this.quiz.getProgress();
    results.options = this.quizOptions;
    this.app._stopQuiz(results);
  }

  _updateUrl(view, quizOptions) {
    let newUrl = `${window.location.origin}/${view}`
    if (quizOptions) {
       newUrl += `?type=${encodeURIComponent(quizOptions.type)}`;
       newUrl += `&set=${encodeURIComponent(quizOptions.set.id)}`;
       newUrl += `&limit=${encodeURIComponent(quizOptions.limit)}`;
    }
    if (newUrl !== window.location.href) {
      history.pushState({ view: view, state: quizOptions }, '', newUrl);
    }
  }

  // Event Handlers:

  onShowAnswer(event) {
    this.showAnswer();
  }

  onGoodAnswer(event) {
    this.evaluateAnswer(true);
  }

  onBadAnswer(event) {
    this.evaluateAnswer(false);
  }

  onStopQuiz(event) {
    this.stopQuiz();
  }
}