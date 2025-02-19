import log from './logging.mjs';
import { DISPLAY_LANGUAGES, COUNTRY_SETS, QUIZ_TYPES, QUIZ_LENGTHS } from './settings.mjs';
import utils from './utils.mjs';

/**
 *  The settings view.
 */
export class SettingsView {
  constructor(parentElement, app) {
    if (parentElement && app) {
      this.attach(parentElement, app);
    }
  }

  attach(parentElement, app) {
    this.app = app;
    this.parent = parentElement;

    // Get UI elements:
    this.displayLanguageSelect = this.parent.querySelector("#setting-display-language");
    this.enInfoLanguageCheck = this.parent.querySelector("#setting-info-language-en");
    this.nlInfoLanguageCheck = this.parent.querySelector("#setting-info-language-nl");  
    this.itInfoLanguageCheck = this.parent.querySelector("#setting-info-language-it");
    this.searchCountrySetSelect = this.parent.querySelector("#setting-search-country-set");
    this.carouselCountrySetSelect = this.parent.querySelector("#setting-carousel-country-set");
    this.carouselSwitchTimeInput = this.parent.querySelector("#setting-carousel-switch-time");
    this.carouselRevealTimeInput = this.parent.querySelector("#setting-carousel-reveal-time");
    this.carouselShowTypeSelect = this.parent.querySelector("#setting-carousel-show-type");
    this.quizTypeSelect = this.parent.querySelector("#setting-quiz-type");
    this.quizCountrySetSelect = this.parent.querySelector("#setting-quiz-country-set");
    this.quizLengthSelect = this.parent.querySelector("#setting-quiz-length");
    this.saveSettingsButton = this.parent.querySelector("#save-settings");
    this.importSettingsButton = this.parent.querySelector("#import-settings");
    this.exportSettingsButton = this.parent.querySelector("#export-settings");
    this.settingsImportFileInput = this.parent.querySelector("#settings-import-file");

    // Add select options:
    this.displayLanguageSelect.innerHTML = '';
    for (let lang of DISPLAY_LANGUAGES) {
      this.displayLanguageSelect.appendChild(utils.createOptionElement(lang.name, `<img src="${lang.flag}" class="language">${lang.description}`));
    }
    this.searchCountrySetSelect.innerHTML = '';
    for (let cs of COUNTRY_SETS) {
      this.searchCountrySetSelect.appendChild(utils.createOptionElement(cs.name, cs.description));
    }
    this.carouselCountrySetSelect.innerHTML = '';
    for (let cs of COUNTRY_SETS) {
      this.carouselCountrySetSelect.appendChild(utils.createOptionElement(cs.name, cs.description));
    }
    this.quizTypeSelect.innerHTML = '';
    for (let qt of QUIZ_TYPES) {
      this.quizTypeSelect.appendChild(utils.createOptionElement(qt.name, qt.description));
    }
    this.quizCountrySetSelect.innerHTML = '';
    for (let cs of COUNTRY_SETS) {
      this.quizCountrySetSelect.appendChild(utils.createOptionElement(cs.name, cs.description));
    }
    this.quizLengthSelect.innerHTML = '';
    for (let ql of QUIZ_LENGTHS) {
      this.quizLengthSelect.appendChild(utils.createOptionElement(ql.name, ql.description));
    }

    // Event handlers:
    this.saveSettingsButton.addEventListener('click', this.onSaveSettings.bind(this));
    this.importSettingsButton.addEventListener('click', this.onImportSettings.bind(this));
    this.exportSettingsButton.addEventListener('click', this.onExportSettings.bind(this));
    this.settingsImportFileInput.addEventListener('change', this.onSettingsImportFileChange.bind(this));
  }

  activate() {
    this._updateUrl('settings', null);

    this._updateSettings();

    this.importSettingsButton.setAttribute('disabled', 'disabled');	
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

  _updateSettings() {
    this.displayLanguageSelect.value = this.app.settings.getSetting('display-language', 'en');
    this.enInfoLanguageCheck.checked = this.app.settings.getSetting('info-languages', []).includes('en');
    this.nlInfoLanguageCheck.checked = this.app.settings.getSetting('info-languages', []).includes('nl');
    this.itInfoLanguageCheck.checked = this.app.settings.getSetting('info-languages', []).includes('it');
    this.searchCountrySetSelect.value = this.app.settings.getSetting('search-country-set', 'all');
    this.carouselCountrySetSelect.value = this.app.settings.getSetting('carousel-country-set', 'all');
    this.carouselSwitchTimeInput.value = utils.fromMillisToElapsedTimeStr(this.app.settings.getSetting('carousel-switch-time', 5000));
    this.carouselRevealTimeInput.value = utils.fromMillisToElapsedTimeStr(this.app.settings.getSetting('carousel-reveal-time', 10000));
    this.carouselShowTypeSelect.value = this.app.settings.getSetting('carousel-show-type', 'all');
    this.quizTypeSelect.value = this.app.settings.getSetting('default-quiz-type', 'guess-capital');
    this.quizCountrySetSelect.value = this.app.settings.getSetting('default-quiz-country-set', 'none');
    this.quizLengthSelect.value = this.app.settings.getSetting('default-quiz-length', '10');
  }

  // Event Handlers:

  onImportSettings(event) {
    log.info('Importing settings');
    const file = this.settingsImportFileInput.files[0];
    if (file) {
      this.app.settings.importSettings(file).then(() => {
        this._updateSettings();
        this.importSettingsButton.removeAttribute('disabled');
      });
    }
  }

  onSaveSettings(event) {
    log.info('Saving settings:', this.quizResults);
    this.app.settings.setSetting('display-language', this.displayLanguageSelect.value);
    let infoLanguages = [];
    if (this.enInfoLanguageCheck.checked) {
      infoLanguages.push('en');
    }
    if (this.nlInfoLanguageCheck.checked) {
      infoLanguages.push('nl');
    }
    if (this.itInfoLanguageCheck.checked) {
      infoLanguages.push('it');
    }
    this.app.settings.setSetting('info-languages', infoLanguages);
    this.app.settings.setSetting('search-country-set', this.searchCountrySetSelect.value);
    this.app.settings.setSetting('carousel-country-set', this.carouselCountrySetSelect.value);
    this.app.settings.setSetting('carousel-switch-time', utils.getMillisFromElapsedTimeStr(this.carouselSwitchTimeInput.value));
    this.app.settings.setSetting('carousel-reveal-time', utils.getMillisFromElapsedTimeStr(this.carouselRevealTimeInput.value));
    this.app.settings.setSetting('carousel-show-type', this.carouselShowTypeSelect.value);
    this.app.settings.setSetting('default-quiz-type', this.quizTypeSelect.value);
    this.app.settings.setSetting('default-quiz-country-set', this.quizCountrySetSelect.value);
    this.app.settings.setSetting('default-quiz-length', this.quizLengthSelect.value);
 
    this.app.settings.saveSettings();
  }

  onExportSettings(event) {
    log.info('Exporting settings');
    this.app.settings.exportSettings();
  }

  onSettingsImportFileChange(event) {
    log.info('Settings import file changed');
    this.importSettingsButton.setAttribute('disabled', 'disabled');
    const file = event.target.files[0];
    if (file) {
      this.app.settings.importSettings(file);
      this.importSettingsButton.removeAttribute('disabled');
    }
  }
}