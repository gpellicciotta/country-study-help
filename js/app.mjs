import log from './logging.mjs';
import countries from './countries.mjs';
import utils from './utils.mjs';
import { Settings } from './settings.mjs';
import { QuizStats } from './quiz-stats.mjs';
import { AppView } from './app-view.mjs';

const STORAGE_KEY = 'com.pellicciotta.countries.app';
const DEFAULT_APP = {
  name: 'Country Study Help',	
  version: '0.0.1-unversioned+' + utils.toDateTimeStr(),
};

// Set up logging:
log.setLogLevel(log.INFO);

// Set up application view:
window.addEventListener("load", fireDomReady, false);

async function fireDomReady() {
  log.info("DOM is ready.");

  // Register service worker
  registerServiceWorker();

  let settings = new Settings();
  settings.loadSettings();
  log.info("App settings have been loaded:", settings);
  log.setLogLevel(settings.getSetting('log-level', log.INFO));
    
  let results = new QuizStats();
  results.loadResults();
  log.info("Quiz results have been loaded:", results);

  // Load country data
  let cnt = await countries.loadCountryData();
  log.info(`Country data has loaded: ${cnt} countries are known`); 

  // Get app manifest 
  let manifest = await utils.getAppManifest();
  let app = JSON.parse(localStorage.getItem(STORAGE_KEY)) || DEFAULT_APP;
  if (manifest) {
    log.info("App manifest has been loaded:", manifest);    
    app.name = manifest.name;
    app.version = manifest.version;
    app["last-activation-time"] = utils.toDateTimeStr();
  } 
  else {
    log.error("App manifest could not be loaded:", manifest);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(app));
  log.info(`App '${app.name}' version ${app.version} is initializing...`);

  // Initialize the application view
  let appView = new AppView(settings, results);
  appView.attach(document.body);
  log.info("App UI has been initialized");
}

async function registerServiceWorker() {
  navigator.serviceWorker
    .register('/service-worker.js', { type: 'module' })
    .then(registration => {
        log.debug('Service worker registration successful with scope: ', registration.scope);
     }, err => {
        log.debug('Service worker registration failed: ', err);
     });
}