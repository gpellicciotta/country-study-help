import log from './logging.mjs';
import countries from './countries.mjs';
import { Settings } from './settings.mjs';
import { AppView } from './app-view.mjs';

// Set up logging:
log.setLogLevel(log.INFO);

// Set up application view:
window.addEventListener("load", fireDomReady, false);

async function fireDomReady() {
  log.info("DOM is ready.");

  // Register service worker
  registerServiceWorker();

  // Load country data
  let cnt = await countries.loadCountryData();
  log.info(`Country data has loaded: ${cnt} countries are known`); 

  let settings = new Settings();
  settings.loadSettings();
  log.info("App settings have been loaded:", settings);
  log.setLogLevel(settings.getSetting('log-level', log.INFO));
    
  // Initialize the application view
  let appView = new AppView(settings);
  appView.attach(document.body);
  log.info("App UI has been initialized");
}

async function registerServiceWorker() {
  navigator.serviceWorker
    .register('/service-worker.js')
    .then(registration => {
        log.debug('Service worker registration successful with scope: ', registration.scope);
     }, err => {
        log.debug('Service worker registration failed: ', err);
     });
}