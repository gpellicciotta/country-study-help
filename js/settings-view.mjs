import log from './logging.mjs';
import countries from './countries.mjs';
import { Quiz } from './quiz.mjs';
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
    this.quizResults = null;
    this.maxScore = 0;

    // Get UI elements:
    this.saveSettingsButton = this.parent.querySelector("#save-settings");
    this.importSettingsButton = this.parent.querySelector("#import-settings");
    this.exportSettingsButton = this.parent.querySelector("#export-settings");

    this.settingsImportFileInput = this.parent.querySelector("#settings-import-file");

    // Event handlers:
    this.saveSettingsButton.addEventListener('click', this.onSaveSettings.bind(this));
    this.importSettingsButton.addEventListener('click', this.onImportSettings.bind(this));
    this.exportSettingsButton.addEventListener('click', this.onExportSettings.bind(this));

    this.settingsImportFileInput.addEventListener('change', this.onSettingsImportFileChange.bind(this));
  }

  activate() {
    this._updateUrl('settings', null);

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

  // Event Handlers:

  onImportSettings(event) {
    log.info('Importing settings');
    this.importSettingsButton.removeAttribute('disabled');
  }

  onSaveSettings(event) {
    log.info('Saving settings:', this.quizResults);
    this.app._saveQuizResults(this.quizResults);
    this.saveQuizResultsButton.setAttribute('disabled', 'disabled');
  }

  onExportSettings(event) {
    log.info('Exporting settings');
    const settings = localStorage.getItem('com.pellicciotta.countries');
    if (settings) {
      const blob = new Blob([settings], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'countries-settings.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      log.info('Settings exported successfully');
    } 
    else {
      log.error('No settings found in local storage');
    }
  }

  onSettingsImportFileChange(event) {
    log.info('Settings import file changed');
    this.importSettingsButton.setAttribute('disabled', 'disabled');
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const settings = JSON.parse(e.target.result);
          log.info('Settings imported:', settings);
          this.importSettingsButton.removeAttribute('disabled');
          this.importedSettings = settings;
          // You can now use the settings object as needed
        } 
        catch (error) {
          log.error('Error parsing settings file:', error);
        }
      };
      reader.readAsText(file);
    }
  }
}