# Country Study Help

A web-site helping to memorize countries, capitals and flags.

The intention is to make it super-simple to:
- Search for a country, and get all information
- Do a quiz based on flag, country or capital

## Simple UI

The interface will simply be a web-page with:
- A text-box allowing to enter a name (of a country or capital): 
  auto-complete will help and when there is a result, the info of that country will be shown 
- Three quiz-buttons: "Random Flag", "Random Country", "Random Capital", with also "Show Answer" and "Good|Bad Answer" evaluation buttons
- A button to just show a random country with all info

## Architecture

The whole will be a single-page application with no back-end (except the internet as a whole acting as data).
No logging in, but also no remembering of countries previously searched (beyond possibly on a specific device).

## Data Sources
The basic information about countries comes from: https://restcountries.com/v3.1/all

## What works, and what doesn't

Works:
- Simple country selection works
- The quiz buttons work
- The UI is responsive
- Countries have correct translations yet (to Dutch and Italian)

Doesn't work:
- Evaluation doesn't work yet: need to keep track of score/stats (and allow resetting score/stats)
- Capitals don't have correct translations yet (to Dutch and Italian)
