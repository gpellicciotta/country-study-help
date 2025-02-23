import log from './logging.mjs';
import { Quiz } from './quiz.mjs';
import { QuizStats } from './quiz-stats.mjs';
import { DISPLAY_LANGUAGES, COUNTRY_SETS, QUIZ_TYPES, QUIZ_LENGTHS } from './settings.mjs';
import utils from './utils.mjs';

/**
 *  The quiz stats view.
 */
export class QuizStatsView {
  constructor(parentElement, app) {
    if (parentElement && app) {
      this.attach(parentElement, app);
    }
  }

  attach(parentElement, app) {
    this.app = app;
    this.parent = parentElement;

    // Get UI elements:
    this.lastPlayedInput = this.parent.querySelector("#quiz-stats-last-played");
    this.totalPlayedInput = this.parent.querySelector("#quiz-stats-total-played");
    this.totalAnsweredInput = this.parent.querySelector("#quiz-stats-total-answered");
    this.averageDurationInput = this.parent.querySelector("#quiz-stats-average-duration");
    this.averageScoreInput = this.parent.querySelector("#quiz-stats-average-score");
    this.topScoreUnder20Input = this.parent.querySelector("#quiz-stats-top-under20-score");
    this.topScoreUnder20DateInput = this.parent.querySelector("#quiz-stats-top-under20-score-date");
    this.topScoreFrom20To50Input = this.parent.querySelector("#quiz-stats-top-score-from20to50");
    this.topScoreFrom20To50DateInput = this.parent.querySelector("#quiz-stats-top-score-from20to50-date");
    this.topScoreFrom50To100Input = this.parent.querySelector("#quiz-stats-top-score-from50to100");
    this.topScoreFrom50To100DateInput = this.parent.querySelector("#quiz-stats-top-score-from50to100-date");    
    this.topScoreOver100Input = this.parent.querySelector("#quiz-stats-top-score-over100");
    this.topScoreOver100DateInput = this.parent.querySelector("#quiz-stats-top-score-over100-date");    
    this.importFileInput = this.parent.querySelector("#quiz-stats-import-file");
    this.importButton = this.parent.querySelector("#quiz-stats-import");
    this.exportButton = this.parent.querySelector("#quiz-stats-export");

    // Event handlers:
    this.importFileInput.addEventListener('change', this.onResultsImportFileChange.bind(this));
    this.importButton.addEventListener('click', this.onImportResults.bind(this));
    this.exportButton.addEventListener('click', this.onExportResults.bind(this));
  }

  activate() {
    this._updateUrl('quiz-stats', null);

    this._updateStats();

    this.importFileInput.removeAttribute('disabled');	
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

  _updateStats() {
    // TODO: based on stats
    this.lastPlayedInput.value = utils.toDateTimeStr(this.app.results.lastPlayTime);
    this.totalPlayedInput.value = this.app.results.plays.length;
    this.totalAnsweredInput.value = this.app.results.totalAnswered;
    this.averageDurationInput.value = utils.toDurationStr(this.app.results.averageDuration);
    this.averageScoreInput.value = utils.toPercentageStr(this.app.results.averageScore);
    this.topScoreUnder20Input.value = utils.toPercentageStr(this.app.results.maxScores["[1, 20] answers"]?.score);    
    this.topScoreUnder20DateInput.value = utils.toDateTimeStr(this.app.results.maxScores["[1, 20] answers"]?.date);
    this.topScoreFrom20To50Input.value = utils.toPercentageStr(this.app.results.maxScores["[21, 50] answers"]?.score);    
    this.topScoreFrom20To50DateInput.value = utils.toDateTimeStr(this.app.results.maxScores["[21, 50] answers"]?.date);
    this.topScoreFrom50To100Input.value = utils.toPercentageStr(this.app.results.maxScores["[51, 100] answers"]?.score);  
    this.topScoreFrom50To100DateInput.value = utils.toDateTimeStr(this.app.results.maxScores["[51, 100] answers"]?.date);
    this.topScoreOver100Input.value = utils.toPercentageStr(this.app.results.maxScores["> 101 answers"]?.score);
    this.topScoreOver100DateInput.value = utils.toDateTimeStr(this.app.results.maxScores["> 101 answers"]?.date);
  }

  // Event Handlers:

  onImportResults(event) {
    log.info('Importing quiz results');
    const file = this.importFileInput.files[0];
    if (file) {
      this.app.results.importResults(file).then(() => {
        this.app.results.saveResults();
        this._updateStats();
        this.importButton.removeAttribute('disabled');
      });
    }
    else {
      this.importButton.setAttribute('disabled', 'disabled');
    }
  }

  onResultsImportFileChange(event) {
    log.info('Quiz results import file changed');
    this.importButton.setAttribute('disabled', 'disabled');
    const file = event.target.files[0];
    if (file) {
      this.importButton.removeAttribute('disabled');
    }
  }

  onExportResults(event) {
    log.info('Exporting quiz results');
    this.app.results.exportResults();
  }
}