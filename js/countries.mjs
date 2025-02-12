import log from './logging.mjs';
import { normalizeName } from './utils.mjs';

const COUNTRIES_CSV_DATA_FILE = "../data/world-countries.csv";
const COUNTRIES_JSON_DATA_FILE = "../data/world-countries.json";

const DEFAULT_COUNTRY_DATA = {
  'code': 'xx',
  'english_country_name': 'Not Found',
  'english_capital_name': 'Not Found',
  'english_wikipedia': 'https://en.wikipedia.org/wiki/Utopia',
  'dutch_country_name': 'Niet Gevonden',
  'dutch_capital_name': 'Niet Gevonden',
  'dutch_wikipedia': 'https://nl.wikipedia.org/wiki/Utopia',
  'italian_country_name': 'Non Trovato',
  'italian_capital_name': 'Non Trovato',
  'italian_wikipedia': 'https://it.wikipedia.org/wiki/Utopia'
}

let countryCodes = [];        // All available codes
let countryCodeByName = {};   // All names under which countries can be found
let countryByCode = {};       // Full country data
let countrySets = {};         // Alternative sets of country codes

/**
 *  Load all available country data.
 * 
 *  @param {string} fileToLoadFrom The URL of the JSON or CSV file with country data to load. Optional.
 *  @returns {Promise} A promise that resolves when the country data has been loaded and gives the number of countries loaded.
 */
export async function loadCountryData(fileToLoadFrom) {  
  // Reset
  countryCodes = [DEFAULT_COUNTRY_DATA.code];
  countryCodeByName = {};
  countryByCode = { };
  countryByCode[DEFAULT_COUNTRY_DATA.code] = DEFAULT_COUNTRY_DATA;      
  countryCodeByName[DEFAULT_COUNTRY_DATA.dutch_capital_name] = DEFAULT_COUNTRY_DATA.code;
  countryCodeByName[DEFAULT_COUNTRY_DATA.dutch_country_name] = DEFAULT_COUNTRY_DATA.code;  
  countryCodeByName[DEFAULT_COUNTRY_DATA.italian_capital_name] = DEFAULT_COUNTRY_DATA.code;
  countryCodeByName[DEFAULT_COUNTRY_DATA.italian_country_name] = DEFAULT_COUNTRY_DATA.code;
  countryCodeByName[DEFAULT_COUNTRY_DATA.english_capital_name] = DEFAULT_COUNTRY_DATA.code;
  countryCodeByName[DEFAULT_COUNTRY_DATA.english_country_name] = DEFAULT_COUNTRY_DATA.code;
  countryCodeByName[DEFAULT_COUNTRY_DATA.code] = DEFAULT_COUNTRY_DATA.code;
  countrySets = {};

  // Load new data
  let loadData;
  if (fileToLoadFrom && fileToLoadFrom.endsWith('.csv')) {
    loadData = loadCountryDataFromCSV(fileToLoadFrom || COUNTRIES_CSV_DATA_FILE);
  }
  else {
    loadData = loadCountryDataFromJSON(fileToLoadFrom || COUNTRIES_JSON_DATA_FILE);
  }
  return loadData.then((countries) => {
    // Create memory representation:
    log.debug("Country data loaded completely.");

    countries.forEach(country => {
      log.debug("Keeping track of: ", country);
      countryCodes.push(country.code);
      // For lookup:
      countryByCode[country.code] = country;      
      countryCodeByName[normalizeName(country.dutch_country_name)] = country.code;
      countryCodeByName[normalizeName(country.dutch_capital_name)] = country.code;
      countryCodeByName[normalizeName(country.italian_capital_name)] = country.code;    
      countryCodeByName[normalizeName(country.italian_country_name)] = country.code;
      countryCodeByName[normalizeName(country.english_capital_name)] = country.code;
      countryCodeByName[normalizeName(country.english_country_name)] = country.code;      
      countryCodeByName[country.code] = country.code;
    });
    // Create sets:
    countrySets['all'] = {
      name: 'all',
      description: 'All countries',
      codes: countryCodes
    };
    countrySets['europe'] = {
      name: 'europe',
      description: 'European countries',
      codes: countryCodes.filter(code => countryByCode[code].region === 'Europe')
    };
    countrySets['asia'] = { 
      name: 'asia',
      description: 'Asian countries',
      codes: countryCodes.filter(code => countryByCode[code].region === 'Asia')
    };
    countrySets['oceania'] = {
      name: 'oceania',
      description: 'Oceanian countries',
      codes: countryCodes.filter(code => countryByCode[code].region === 'Oceania')
    };
    countrySets['americas'] = {
      name: 'americas',
      description: 'American countries',
      codes: countryCodes.filter(code => countryByCode[code].region === 'Americas')
    };
    countrySets['africa'] = { 
      name: 'africa',
      description: 'African countries',
      codes: countryCodes.filter(code => countryByCode[code].region === 'Africa')
    };
    countrySets['un-members'] = {
      name: 'un-members',
      description: 'UN member countries',
      codes: countryCodes.filter(code => countryByCode[code].unMember)
    };
    return countries.length;
  });
}

async function loadCountryDataFromJSON(jsonResource) {
  log.debug(`Loading JSON country data from '${jsonResource}'...`);
  return fetch(jsonResource)
     .then(response => response.json())
     .then(countries => {
        countries.forEach(country => {
          country.code = country.cca2.toLowerCase();
          country.english_country_name = country.name.common;
          country.english_capital_name = (country.capital || []).join(', ');
          country.dutch_country_name = country.translations.nld.common;
          country.dutch_capital_name = country.translations.nld.capital;
          country.italian_country_name = country.translations.ita.common;
          country.italian_capital_name = country.translations.ita.capital;
        });
        return countries;
      });
}

async function loadCountryDataFromCSV(csvResource) {
  log.debug(`Loading CSV country data from '${csvResource}'...`);
  return fetch(csvResource)
    .then(response => response.text())
    .then(csvText => {
      const countries = parseCountryCsv(csvText);
      return countries;
    });
}    

export function getCountryCode(countryNameOrCode) {
  return countryCodeByName[normalizeName(countryNameOrCode)] || 'xx';
}

export function getCountryByCode(countryCode) {
  return countryByCode[countryCode];
}

export function getCountryLookupNames() {
  return Object.keys(countryCodeByName);
}

export function getCountrySetNames() {
  return Object.keys(countrySets);
}

export function getCountrySets() {
  return JSON.parse(JSON.stringify(countrySets)); // Returning a copy
}

export function getCountrySet(setName) {
  return JSON.parse(JSON.stringify(countrySets[setName] || []));
}

// Utilities:

function parseCountryCsv(csvText) {
  const lines = csvText.split(/\r?\n/);
  const headers = lines[0].split(',');
  const headerNames = {
    'Country Code': 'code',
    'Country (English)': 'english_country_name',
    'Capital (English)': 'english_capital_name',
    'Wikipedia (English)': 'english_wikipedia',
    'Country (Dutch)': 'dutch_country_name',
    'Capital (Dutch)': 'dutch_capital_name',
    'Wikipedia (Dutch)': 'dutch_wikipedia',
    'Country (Italian)': 'italian_country_name',
    'Capital (Italian)': 'italian_capital_name',
    'Wikipedia (Italian)': 'italian_wikipedia'
  }
  const data = lines.slice(1)
                    .filter(line => (line.trim() !== '') && !line.trim().startsWith('#'))
                    .map(line => {
    const values = line.split(',');
    return headers.reduce((obj, header, index) => {
      const propName = headerNames[header] || header.toLowerCase().replace(/ /g, '_');
      obj[propName] = values[index];
      return obj;
    }, {});
  });
  return data;
}

export default {
  /* Country functions */
  loadCountryData,
  getCountryCode,
  getCountryByCode,
  getCountryLookupNames,
  getCountrySetNames,
  getCountrySets,
  getCountrySet
}