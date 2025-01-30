# Country Study Help

A web-site helping to memorize countries, capitals and flags.

The intention is to make it super-simple to:
- Search for a country, and get all information
- Do a quiz based on flag, country or capital

## Simple UI

The interface will simply be a web-page with:
- A drop-down, allowing to select the language of interest (the choice will be remembered locally)
- A text-box allowing to enter a word 

The output will then be links to the information found

## Architecture

The whole will be a single-page application with no back-end (except the internet as a whole acting as data).
No logging in, but also no remembering of countries previously searched (beyond possibly on a specific device).

## What works, and what doesn't

- Once opened, tabs/windows will get re-used
- No language selection yet: it is hardcoded to Italian for now
- No image search yet
- Pronunciation link works by linking to https://forvo.com
- Dictionary link works by linking to https://www.thefreedictionary.org
- Use links work by linking to https://context.reverso.net