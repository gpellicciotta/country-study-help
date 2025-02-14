import log from './logging.mjs';
import countries from './countries.mjs';
import { AppView } from './app-view.mjs';

// Set up logging:
log.setLogLevel(log.INFO);

// Set up application view:
window.addEventListener("load", fireDomReady, false);

function fireDomReady() {
  log.info("DOM is ready.");

  // navigator.serviceWorker
  //          .register('/service-worker.js')
  //          .then(registration => {
  //            log.debug('ServiceWorker registration successful with scope: ', registration.scope);
  //          }, err => {
  //            log.debug('ServiceWorker registration failed: ', err);
  //          });

  // Listen for resize events
  window.addEventListener('resize', onWindowResize);
  onWindowResize();  
  
  // Load country data
  countries.loadCountryData().then((cnt) => { 
    log.info(`Country data has loaded: ${cnt} countries are known`); 
    
    let appView = new AppView();
    appView.attach(document.body);
    log.info("App UI has been initialized");

    // Listen for popstate events: check URL for country 
    let boundOnPopState = onPopState.bind(window, appView);
    window.addEventListener('popstate', boundOnPopState);
    boundOnPopState();

    // Listen for country changes
    appView.addEventListener('countryChange', (event) => {
      log.info("Country change event:", event.detail);
      let country = event.detail;
      // Update the URL
      const urlHash = encodeURIComponent(country.english_country_name.replace(/ /g, '+'));
      const newUrl = `${window.location.origin}${window.location.pathname}#${urlHash}`;
      if (!window.location.hash) {
        log.info(`Replacing initial state for country: ${country.english_country_name}`);	
        history.replaceState({ country: country.english_country_name }, '', newUrl);
      }
      else if (window.location.hash !== `#${urlHash}`) {
        history.pushState({ country: country.english_country_name }, '', newUrl);
      }
    });
  });
}

function onPopState(appView, event) {
  const searchString = window.location.hash.substring(1); // Remove leading '#'
  if (searchString) {
    const countryName = decodeURIComponent(searchString).replace(/\+/g, ' ');
    log.info(`Searching for country in URL: '${countryName}'`);	
    appView.tryToShowCountry(countryName);
  }
}

function onWindowResize(event) {
  if (window.innerWidth < 800) {
    document.body.classList.add('mobile');
  } 
  else {
    document.body.classList.remove('mobile');
  }
}
