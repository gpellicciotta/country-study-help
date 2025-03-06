import log from './logging.mjs';
import countries from './countries.mjs';
import { Settings } from './settings.mjs';
import { QuizStats } from './quiz-stats.mjs';
import { AppView } from './app-view.mjs';

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