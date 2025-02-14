// Script to generate a CSV file with the English, Dutch, and Italian names of countries and their capitals.
// Since the data is based on https://restcountries.com, the script fetches the data from the API and then translates the names using the Google Translate API.
// It also stores the raw data as countries-and-capitals.json.

import fetch from 'node-fetch';
import fs from 'fs';
import dotenv from 'dotenv';
import { join } from 'path';
import { load } from 'cheerio';

dotenv.config();

const COUNTRY_DATA_URL = 'https://restcountries.com/v3.1/all';
const GOOGLE_TRANSLATE_URL = 'https://translation.googleapis.com/language/translate/v2?key=' + process.env.GOOGLE_TRANSLATE_API_KEY;

// Logging:

const logLevels = {
  'off'  :    0,	
  'debug':  100,
  'info' :  400,
  'warn' :  800,
  'error': 1000,
  'all'  : 9999
};

const logger = {
  setLogLevel: (level) => {
    if (logLevels[level] !== undefined) {
      console.currentLogLevel = logLevels[level];
    } else {
      console.warn(`Unknown log level: ${level}`);
    }
  },
  debug: (...args) => {
    if (logLevels.debug >= console.currentLogLevel) {
      console.debug('[debug] ' + args[0], ...args.slice(1));
    }
  },
  info: (...args) => {
    if (logLevels.info >= console.currentLogLevel) {
      console.info(...args);
    }
  },
  warn: (...args) => {
    if (logLevels.warn >= console.currentLogLevel) {
      console.warn('[warning] ' + args[0], ...args.slice(1));
    }
  },
  error: (...args) => {
    if (logLevels.error >= console.currentLogLevel) {
      console.error('[error] ' + args[0], ...args.slice(1));
    }
  },
  log: (...args) => {
    console.log(...args);
  }
};

// Utilities:

async function fetchCountryData() {
  const response = await fetch(COUNTRY_DATA_URL);
  const countries = await response.json();
  return countries;
}

async function loadCountryData(fileName) {
  return new Promise((resolve, reject) => {
    fs.readFile(fileName, 'utf8', (err, data) => {
      if (err) reject(err);
      else resolve(JSON.parse(data));
    });
  });
}

async function translateCountry(countryName, targetLanguage) {
  const translation = await translateText("country:" + countryName, targetLanguage);
  return translation.replace(/^.*:/, '');
}

async function translateCapital(countryName, targetLanguage) {
  const translation = await translateText("capital:" + countryName, targetLanguage);
  return translation.replace(/^.*:/, '');
}

async function translateText(text, targetLanguage) {
  const response = await fetch(GOOGLE_TRANSLATE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      q: text,
      source: 'en',
      target: targetLanguage
    })
  });
  const data = await response.json();
  const translation = data?.data?.translations[0]?.translatedText;
  //logger.log("Translation of " + text + " to " + targetLanguage + ":", translation);  
  return translation;
}

async function enrichCountryData() {
  const countries = await fetchCountryData();

  const enrichedCountries = await Promise.all(countries.map(async country => {
    logger.debug(`Adding information for '${country.name.common}'...`);
    const englishName = country.name.common;
    const dutchName = country.translations?.nld?.common || await translateCountry(englishName, 'nl');
    const italianName = country.translations?.ita?.common || await translateCountry(englishName, 'it');
    const englishCapitalName = country.capital ? country.capital[0] : '';
    const dutchCapitalName = country.capital ? await translateCapital(englishCapitalName, 'nl') : '';
    const italianCapitalName = country.capital ? await translateCapital(englishCapitalName, 'it') : '';
    const newTranslations = {
      nld: {
        common: country.translations?.nld?.common || dutchName,
        official: country.translations?.nld?.official || dutchName,
        capital: dutchCapitalName
      },
      ita: {
        common: country.translations?.ita?.common || italianName,
        official: country.translations?.ita?.official || italianName,
        capital: italianCapitalName
      },
    };
    country.cca2 = country.cca2.toLowerCase();
    country.translations = newTranslations;
    country.wikipedia = { 
      eng: 'https://en.wikipedia.org/wiki/' + encodeURIComponent(englishName),
      nld: 'https://nl.wikipedia.org/wiki/' + encodeURIComponent(dutchName),
      ita: 'https://it.wikipedia.org/wiki/' + encodeURIComponent(italianName)
    }
    return country;
  }));

  enrichedCountries.push({
    cca2: 'xx',
    name: { common: 'Not found' },
    capital: ['Not found'],
    translations: { 
      nld: { common: 'Niet gevonden', capital: 'Niet gevonden' }, 
      ita: { common: 'Non trovato', capital: 'Non trovato' } },
    wikipedia: { eng: 'https://en.wikipedia.org/wiki/Utopia', nld: 'https://nl.wikipedia.org/wiki/Utopia', ita: 'https://it.wikipedia.org/wiki/Utopia' }
  }); // Add an built-in 'not found' object to the end of the array
  
  return enrichedCountries;
}

async function getCountryCodes(countries) {
  let countryCodes = { };
  countries.forEach(country => {
    countryCodes[country.cca2] = country.name.official;
  });
  return countryCodes;
}

async function generateCsvData(countries) {
  const headers = [
    "Country flag",
    "Country (English)",
    "Capital (English)",
    "Wikipedia (English)",
    "Country (Dutch)",
    "Capital (Dutch)",
    "Wikipedia (Dutch)",
    "Country (Italian)",
    "Capital (Italian)",
    "Wikipedia (Italian)"
  ];

  const rows = await Promise.all(countries.map(async country => {
    logger.debug(`Getting information for '${country.name.common}'...`);
    return [
      `${country.cca2.toLowerCase()}`,
      country.name.common,
      country.capital ? country.capital[0] : '',
      country.wikipedia.eng,
      country.translations.nld.common,
      country.translations.nld.capital,
      country.wikipedia.nld,
      country.translations.ita.common,
      country.translations.ita.capital,
      country.wikipedia.ita
    ];
  }));

  // Sort rows by the English name (second element in each row)
  rows.sort((a, b) => a[1].localeCompare(b[1]));
  
  const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
  return csvContent;
}

async function getCountryMap(countryCode) {
  const url = `https://nominatim.openstreetmap.org/search?country=${countryCode}&format=json&polygon_geojson=1`;
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

async function fetchWebPage(url) {
  const response = await fetch(url);
  const html = await response.text();
  if (html) {
    logger.debug(`Downloaded HTML page '${url}'`);
  }
  else {
    logger.error(`Failed to fetch HTML page '${url}`);
  }
  return html;
}

async function findCountryImagePageLink(html, countryName) {
  const $ = load(html);
  let imageUrl = null;
  let backupImageUrl = null;

  $('a').each((index, element) => {
    const img = $(element).find('img');
    const srcText = img.attr('src');
    const altText = img.attr('alt') || '';
    const href = $(element).attr('href');
    if (srcText && href) {
      // Find the href link of an <a> element that has as child an <img> with a src attribute that contains the text "orthographic_projection"
      if ((srcText.toLowerCase().includes('orthographic') || srcText.toLowerCase().includes('on_the_globe')) && 
          href.endsWith('.svg')) {
        imageUrl = href;
        return false; // Break the loop
      }
      // Now do a second round, and be content with more images:  
      if ((altText.toLowerCase().includes('location') || srcText.toLowerCase().includes('location')) && 
          href.includes('/wiki/File:')) {
        backupImageUrl = href;
      }
    }
  });
  if (!imageUrl) {
    imageUrl = backupImageUrl;
  }

  if (imageUrl) {
    logger.debug(`Found image for country '${countryName}': 'https://en.wikipedia.org${imageUrl}'`);
  }
  else {
    logger.error(`Failed to determine image for country '${countryName}'`);
  }
  return imageUrl ? `https://en.wikipedia.org${imageUrl}` : null;
}

async function findCountryImage(html, countryName) {
    const $ = load(html);
    let imageUrl = null;

    // Find the href link of an <a> element with text "Original file"
    $('a').each((index, element) => {
        const linkText = $(element).text().trim();
        const href = $(element).attr('href');
        if (linkText === 'Original file' && href) {
            imageUrl = href;
            return false; // Break the loop
        }
    });
    if (imageUrl) {
        if (imageUrl.startsWith("//")) {
            imageUrl = `https:${imageUrl}`;
        }
        logger.debug(`Found image for country '${countryName}': '${imageUrl}'`);
    }
    else {
        logger.error(`Failed to find image for country '${countryName}'`);
    }
    return imageUrl ? `${imageUrl}` : null;
}

async function downloadImage(url, filename) {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  fs.writeFileSync(filename, buffer);
  logger.debug(`Image saved to '${filename}'`);
}

async function downloadCountryMap(countryCode, countryName, outputDir) {
  try {
    logger.info(`Searching country map for '${countryCode}' - '${countryName}'...`);
    const html = await fetchWebPage(`https://en.wikipedia.org/wiki/${encodeURIComponent(countryName)}`);
    const imagePageUrl = await findCountryImagePageLink(html, countryName);
    const imagePageHtml = await fetchWebPage(imagePageUrl);
    const imageUrl = await findCountryImage(imagePageHtml, countryName);
    if (imageUrl) {
      logger.debug(`Image URL for ${countryName}: ${imageUrl}`);
      const extension = imageUrl.split('.').pop();
      const filename = `${outputDir}/${countryCode.toLowerCase()}.${extension}`;
      await downloadImage(imageUrl, filename);
      logger.info(`Country map for '${countryCode}' - '${countryName}' downloaded and saved to '${filename}'`);
      return true;
    } 
    else {
      logger.warn(`No image found for '${countryCode}' - '${countryName}'`);
    }
  } 
  catch (error) {
    logger.error('Error fetching country image:', error);
  }  
  return false;
}

// ========================================
// Main script:

const DEFAULT_OUTPUT_DIR = 'data';
const DEFAULT_BASE_NAME = 'countries';
const DEFAULT_LOG_LEVEL = 'info';

function showHelp() {
  logger.log(`
Usage: node geo-tools.js <command> [--output-dir <dir-name>] [--base-name <file-name>] [--log-level <level>]

Defaults:
  output-dir: '${DEFAULT_OUTPUT_DIR}'
  base-name : '${DEFAULT_BASE_NAME}'
  log-level : '${DEFAULT_LOG_LEVEL}'

Commands:
  help                   
    Show this help message

  get-country-data [--output-dir <output-dir>] [--base-name <base-name>]
    Download country data from '${COUNTRY_DATA_URL}' 
    Store to '<output-dir>/<base-name>.json' and '<output-dir>/<base-name>-codes.json'

  enrich-country-data [--output-dir <output-dir>] [--base-name <base-name>]   
    Enrich previously downloaded country data with translations and Wikipedia links
    Load from '<output-dir>/<base-name>.json' 
    and store in '<output-dir>/<base-name>-enriched.json',
                 '<output-dir>/<base-name>.csv' and '
                 '<output-dir>/<base-name>-codes.json'
  
  get-country-maps [--output-dir <output-dir>]
    Download country maps for all countries and store in '<output-dir>/<cc>.svg' files
  
  get-country-map <2-letter-country-code> --output-dir <output-dir> --base-name <base-name>
    Download country map for a specifc country and store in '<output-dir>/<cc>.svg' file
      
  `);
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  const outputDirIndex = args.indexOf('--output-dir');
  const outputDirName = outputDirIndex !== -1 ? args[outputDirIndex + 1] : DEFAULT_OUTPUT_DIR;  

  const baseNameIndex = args.indexOf('--base-name');
  const baseFileName = baseNameIndex !== -1 ? args[baseNameIndex + 1] : DEFAULT_BASE_NAME;

  const logLevelArgIndex = args.indexOf('--log-level');
  let currentLogLevel = logLevelArgIndex !== -1 ? args[logLevelArgIndex + 1] : DEFAULT_LOG_LEVEL;
  logger.setLogLevel(currentLogLevel);

  switch (command) {
    case 'help':
      showHelp();
      break;

    case 'get-country-data':
      const countries = await fetchCountryData();
      fs.writeFileSync(`${outputDirName}/${baseFileName}.json`, JSON.stringify(countries, null, 2));
      logger.info(`Country data downloaded and saved to '${outputDirName}/${baseFileName}.json'`);
      break;

    case 'enrich-country-data':
      const rawCountries = JSON.parse(fs.readFileSync(`${outputDirName}/${baseFileName}.json`));
      const enrichedCountries = await enrichCountryData(rawCountries);
      fs.writeFileSync(`${outputDirName}/${baseFileName}-enriched.json`, JSON.stringify(enrichedCountries, null, 2));
      const csvData = await generateCsvData(enrichedCountries);
      fs.writeFileSync(`${outputDirName}/${baseFileName}.csv`, csvData);
      const countryCodes = await getCountryCodes(enrichedCountries);
      fs.writeFileSync(`${outputDirName}/${baseFileName}-codes.json`, JSON.stringify(countryCodes, null, 2));
      logger.info(`Country data enriched and saved to '${outputDirName}/${baseFileName}-enriched.json', '${outputDirName}/${baseFileName}-codes.json' and '${outputDirName}/${baseFileName}.csv'`);
      break;

    case 'get-country-maps':
      const allCountryCodesData = JSON.parse(fs.readFileSync(`${outputDirName}/${baseFileName}-codes.json`));
      let succeeded = 0;
      let failed = 0;
      for (const cc of Object.keys(allCountryCodesData)) {
        try {
          let result = await downloadCountryMap(cc, allCountryCodesData[cc], outputDirName);
          if (result) { succeeded++; } else { failed++; }
        } 
        catch (error) {
          logger.error(`Error downloading map for country code '${cc}':`, error);
          failed++;
        }
      }
      logger.info(`${succeeded} (out of ${succeeded+failed}: ${failed} failed to download) country maps downloaded and saved to '${outputDirName}'`);
      break;

    case 'get-country-map':
      const cc = args[1] || 'xx';
      const countryCodesData = JSON.parse(fs.readFileSync(`${outputDirName}/${baseFileName}-codes.json`));
      const countryName = countryCodesData[cc];
      await downloadCountryMap(cc, countryName, outputDirName);
      break;      

    default:
      logger.error('Unknown command:', command);
      showHelp();
      process.exit(1);
  }
}

main();
