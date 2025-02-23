import log from './logging.mjs';
import utils from './utils.mjs';

const STORAGE_KEY = 'com.pellicciotta.countries.results';
const DEFAULT_FILE_NAME = 'country-study-help-results.json';

export const DEFAULT_RESULTS = {
  // Global app settings:
  "last-play-time": null,
  "times-played": 0,	
  "max-scores": { 
    "[1, 20] answers": 0.0,
    "[21, 50] answers": 0.0,
    "[51, 100] answers": 0.0,
    "> 101 answers": 0.0,		
  },
  // Plays:
  "plays": [ ],
  "play-data": { },
  // Country data:
  "country-data": { }	
};

export class QuizStats {
  constructor() {
    this.resultsKey = STORAGE_KEY;
    this.lastPlayTime = null;
    this.timesPlayed = 0;
    this.averageDuration = 0;
    this.averageScore = 0.0;
    this.maxScores = { 
      "[1, 20] answers": { score: 0.0, date: null },
      "[21, 50] answers": { score: 0.0, date: null },
      "[51, 100] answers": { score: 0.0, date: null },
      "> 101 answers": { score: 0.0, date: null }
    };
    this.plays = [];
    this.playData = {};
    this.countryData = {};
  }

  _updateStats() {
    let totalPlays = 0;
    let totalDuration = 0;
    let totalAnswers = 0;
    let totalGoodAnswers = 0;
    let maxScores = {
      "[1, 20] answers":   { score: 0, date: null },
      "[21, 50] answers":  { score: 0, date: null },
      "[51, 100] answers": { score: 0, date: null },
      "> 101 answers":     { score: 0, date: null }
    };
    let countries = { };

    this.plays.forEach(playDate => {
      let play = this.playData[playDate];
      let playGoodAnswers = play["correct-answers"].length
      let playAnswers = playGoodAnswers + play["incorrect-answers"].length;
      let score = play["correct-answers"].length / playAnswers;
      let maxScoreBucket = null;
      if      (playAnswers <= 20)  { maxScoreBucket = "[1, 20] answers"; }
      else if (playAnswers <= 50)  { maxScoreBucket = "[21, 50] answers"; }
      else if (playAnswers <= 100) { maxScoreBucket = "[51, 100] answers"; }
      else                         { maxScoreBucket = "> 101 answers"; }     
      
      totalPlays += 1;
      totalAnswers += playAnswers;
      totalGoodAnswers += playGoodAnswers;
      totalDuration += (play["duration"] ? +play["duration"] : 0);

      if (score > maxScores[maxScoreBucket].score) {
        maxScores[maxScoreBucket].score = score;
        maxScores[maxScoreBucket].date = playDate;
      }

      play["correct-answers"].forEach(answer => {
        let country = countries[answer] || { "correct": 0, "incorrect": 0 };
        country.correct += 1;
        countries[answer] = country;
      });
      play["incorrect-answers"].forEach(answer => {
        let country = countries[answer] || { "correct": 0, "incorrect": 0 };
        country.incorrect += 1;
        countries[answer] = country;
      });
    });
      
    this.timesPlayed = totalPlays;
    this.totalAnswered = totalAnswers;
    this.maxScores = maxScores;
    this.lastPlayTime = this.plays[0];
    this.averageDuration = totalPlays ? totalDuration / totalPlays : 0;
    this.averageScore = totalAnswers ? totalGoodAnswers / totalAnswers : 0.0;
    this.countryData = countries;
  }

  /**
   *  Load results and stats from local storage.
   */
  loadResults() {
    let results = localStorage.getItem(this.resultsKey);
    if (results) {
      try {
        results = JSON.parse(results);
        results = this._normalizeResults(results);
        this.lastPlayTime = results['last-play-time'];
        this.timesPlayed = results['times-played'];
        this.maxScores = results['max-scores'];        
        this.plays = results['plays'];
        this.playData = results['play-data'];
        log.info(`Results loaded successfully from local storage`);        
      }
      catch (error) {
        log.error('Error parsing results from local storage:', error);
      }
    }
    else {
      this.lastPlayTime = null;
      this.timesPlayed = 0;
      this.maxScores = { 
        "[1, 20] answers": { score: 0.0, date: null },
        "[21, 50] answers": { score: 0.0, date: null },
        "[51, 100] answers": { score: 0.0, date: null },
        "> 101 answers": { score: 0.0, date: null }
      };
      this.plays = [];
      this.playData = {};
      this.countryData = {};
    }
    this._updateStats();
  }

  /**
   * Add new result + recalculate new stats to local storage.
   */
  addNewResult(result) {
    const playId = result["start-time"].toISOString();
    this.plays.unshift(playId);
    this.playData[playId] = result;
    this._updateStats();
    this.saveResults();
  }
  
  /**
   * Save results to local storage.
   */
  saveResults() {
    try {
      const results = {
        'last-play-time': this.lastPlayTime,
        'times-played': this.timesPlayed,
        'max-scores': this.maxScores,
        'plays': this.plays,
        'play-data': this.playData,
        'country-data': this.countryData,
      };
      localStorage.setItem(this.resultsKey, JSON.stringify(results));
      log.info('Results saved successfully to local storage');
    } 
    catch (error) {
      log.error('Error saving results to local storage:', error);
    }
  }

  /**
   * Import results from a file.
   */
  async importResults(file) {
    try {
      let results = await this._readFileAsText(file);
      results = this._normalizeResults(JSON.parse(results));
      this.lastPlayTime = results['last-play-time'];
      this.timesPlayed = results['times-played'];
      this.maxScores = results['max-scores'];
      this.plays = results['plays'];
      this.playData = results['play-data'];
      this._updateStats();
      log.info(`Results imported successfully from '${file.name}'`);
      return results;
    } 
    catch (error) {
      log.error(`Error parsing results from '${file.name}':`, error);
      throw error;
    }
  }

  _readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  }

  /**
   * Export results o a file.
   */
  exportResults(fileName = DEFAULT_FILE_NAME) {
    const results = {
      'last-play-time': this.lastPlayTime,
      'times-played': this.timesPlayed,
      'max-scores': this.maxScores,
      'plays': this.plays,
      'play-data': this.playData,
      'country-data': this.countryData,
    };    
    const blob = new Blob([JSON.stringify(results)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    log.info(`Results exported successfully to '${fileName}'`);
  }

  _normalizeResults(settings) {
    let normalizedSettings = {  };
    for (const key of Object.keys(settings)) {
      normalizedSettings[utils.normalizeName(key)] = settings[key];
    }
    return normalizedSettings;
  }

  /**
   *  Save the quiz results to local storage.
   */
  saveResult(result) {
    let stats = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    let key = this.startTime.toISOString();
    stats[key] = result;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  }

}
