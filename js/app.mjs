import log from './logging.mjs';
import countries from './countries.mjs';
import utils from './utils.mjs';
import constants from './constants.mjs';
import { Settings } from './settings.mjs';
import { QuizStats } from './quiz-stats.mjs';
import { AppView } from './app-view.mjs';

// Set up logging:
log.setLogLevel(log.INFO);
log.setLogMessagePrefixFormat("app: ${log-level}");

// Set up application view:
window.addEventListener("load", fireDomReady, false);

async function fireDomReady() {
  log.info("DOM is ready");

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
  let updateServiceWorker = false;
  const installedApp = JSON.parse(localStorage.getItem(constants.APP_STORAGE_KEY));
  let app = JSON.parse(localStorage.getItem(constants.APP_STORAGE_KEY)) || { name: constants.APP_NAME, version: constants.APP_VERSION };
  if (manifest) {
    log.info("App manifest has been loaded:", manifest);    
    if (manifest.name) {
      app.name = manifest.name;
    }
    if (manifest.version) {
      app.version = manifest.version;
    }
    app["last-activation-time"] = utils.toDateTimeStr();
    if (installedApp && (installedApp.version !== app.version)) {
      updateServiceWorker = true;
    }
  } 
  else {
    log.error("App manifest could not be loaded:", manifest);
    if (installedApp) {
      app = installedApp;
    }
  }
  localStorage.setItem(constants.APP_STORAGE_KEY, JSON.stringify(app));
  log.info(`App '${app.name}' version ${app.version} is initializing...`);

  // Register service worker
  await registerServiceWorker().then(() => {
    if (updateServiceWorker) {
      navigator.serviceWorker.controller.postMessage({ type: 'reload-caches', data: 'all' });
    }
  });
  
  // Initialize the application view
  let appView = new AppView(settings, results);
  appView.attach(document.body);
  log.info("App UI has been initialized");
}

async function registerServiceWorker() {
  return navigator.serviceWorker
    .register('/service-worker.js', { type: 'module' })
    .then(registration => {
        log.debug('Service worker registration successful with scope: ', registration.scope);
     }, err => {
        log.debug('Service worker registration failed: ', err);
     });
}