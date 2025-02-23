import log from './logging.mjs';
import utils from './utils.mjs';

const STORAGE_KEY = 'com.pellicciotta.countries.settings';
const DEFAULT_FILE_NAME = 'country-study-help-settings.json';

export const DEFAULT_SETTINGS = {
  // Global app settings:
  "display-language": "en",
  "info-languages": [ "en", "nl", "it" ],	
  "log-level": "info",
  // Search settings:
  "search-country-set": "oceania",
  // Carousel settings:
  "carousel-country-set": "americas",
  "carousel-reveal-time": "00:00:04",
  "carousel-switch-time": "00:00:08",
  "carousel-show-type": "flag",
  // Quiz settings:
  "default-quiz-type": "guess-country-by-map",
  "default-quiz-country-set": "africa",
  "default-quiz-length": "10"
};

export const DISPLAY_LANGUAGES = [ 
  { name: 'en',               description: 'English',        flag: '/img/flags/1x1/gb-eng.svg' },
  { name: 'nl',               description: 'Nederlands',     flag: '/img/flags/1x1/nl.svg' },
  { name: 'it',               description: 'Italiano',       flag: '/img/flags/1x1/it.svg' }
 ];

export const COUNTRY_SETS = [ 
  { name: 'all',              description: 'All known countries' },
  { name: 'europe',           description: 'European countries' },
  { name: 'asia',             description: 'Asian countries' },
  { name: 'oceania',          description: 'Oceanian countries' },	
  { name: 'americas',         description: 'American countries' },
  { name: 'africa',           description: 'African countries' },
  { name: 'un-members',       description: 'UN member countries' }
 ];

export const SHOW_TYPES = [
  { name: 'all',              description: 'Show everything' },
  { name: 'name',             description: 'Show country name' },
  { name: 'capital',          description: 'Show capital name' },
  { name: 'flag',             description: 'Show flag' },
  { name: 'map',              description: 'Show map' },
  { name: 'flag-map',         description: 'Show flag and map' },
  { name: 'name-flag-map',    description: 'Show country name, flag and map' },
  { name: 'capital-flag-map', description: 'Show capital name, flag and map' }
];

export const QUIZ_LENGTHS = [
  { name: 'all',              description: 'All' },
  { name: '5',                description: '5' },
  { name: '10',               description: '10' },
  { name: '20',               description: '20' },
  { name: '30',               description: '30' },
  { name: '40',               description: '40' },
  { name: '50',               description: '50' },
  { name: '100',              description: '100' }
];

export const QUIZ_TYPES = [
  { name: 'guess-capital',            description: 'Guess Capital / Provide Name, Flag and Map' },
  { name: 'guess-country-by-capital', description: 'Guess Country / Provide Capital' },
  { name: 'guess-country-by-flag',    description: 'Guess Country and Capital / Provide Flag' },
  { name: 'guess-country-by-map',     description: 'Guess Country and Capital / Provide Map' }
];

export class Settings {
  constructor() {
    this.settingsKey = STORAGE_KEY;
    this.settings = this._normalizeSettings(DEFAULT_SETTINGS);
  }

  /**
   * Load settings from local storage.
   */
  loadSettings() {
    let loadedSettings = localStorage.getItem(this.settingsKey);
    if (loadedSettings) {
      try {
        loadedSettings = JSON.parse(loadedSettings);
        this.settings = this._normalizeSettings(loadedSettings);
        log.info(`Settings loaded successfully from local storage`);        
      }
      catch (error) {
        log.error('Error parsing settings from local storage:', error);
      }
    }
    else {
      this.settings = DEFAULT_SETTINGS;
    }
  }

  /**
   * Import settings from a file.
   */
  async importSettings(file) {
    try {
      const settings = await this._readFileAsText(file);
      this.settings = this._normalizeSettings(JSON.parse(settings));
      log.info(`Settings imported successfully from '${file.name}'`);
      return this.settings;
    } 
    catch (error) {
      log.error(`Error parsing settings from '${file.name}':`, error);
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
   * Save settings to local storage.
   */
  saveSettings() {
    try {
      localStorage.setItem(this.settingsKey, JSON.stringify(this.settings));
      log.info('Settings saved successfully to local storage');
    } 
    catch (error) {
      log.error('Error saving settings to local storage:', error);
    }
  }

  /**
   * Export settings to a file.
   */
  exportSettings(fileName = DEFAULT_FILE_NAME) {
    const blob = new Blob([JSON.stringify(this.settings)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    log.info(`Settings exported successfully to '${fileName}'`);
  }

  getSettingNames() {
    return Object.keys(this.settings);
  }

  getSetting(key, defaultValue = null) {
    key = utils.normalizeName(key);
    return this.settings[key] !== undefined ? this.settings[key] : defaultValue;
  }

  setSetting(key, value) {
    key = utils.normalizeName(key);
    this.settings[utils.normalizeName(key)] = value;
  }

  _normalizeSettings(settings) {
    let normalizedSettings = { ... DEFAULT_SETTINGS };
    for (const key of Object.keys(settings)) {
      normalizedSettings[utils.normalizeName(key)] = settings[key];
    }
    return normalizedSettings;
  }
}