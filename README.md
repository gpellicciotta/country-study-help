# Country Study Help

A web-site helping to memorize countries, capitals, locations and flags.

The intention is to make it super-simple to:
- Search for a country, and get all information
- Do a quiz based on flag, location, country or capital

## Architecture

The whole will be a single-page application with no back-end.

All country data is static and will be cached locally on first use.

No logging in.

Only local storage of quiz statistics, with an option to import/export from/to JSON file however.

## UI Choices

The UI will be mobile first and as simple as possible.

The interface will simply be a web-page with following pages:

- The `Browse` page shows a `Search` text-box allowing to enter a name of a country or capital or country-code:
  auto-complete will help and when there is a result, the info of that country will be shown.
  ```
  +-------------------------------+
  | Browse               [sq][hm] |    [hm] = hamburger menu, [sq] = start or stop quiz
  +-------------------------------+
  | [flag                       ] |
  | [data     ]  [           map] |
  +-------------------------------+
  | [search box             ][rp] |    [rp] = pick random country
  +-------------------------------+
  ```

- A `Pick Random` button to just show a random country with all info
  When searching or picking a country, the URL will change too, so that URLs can be copy-pasted.
  The URL will be `{base URL}/{cca3}
  When the app starts/loads for the first time, the URL will be inspected to go to that country initially.

- A `Start|Stop Quiz` button to start (or end) a quiz.
  Starting the quiz first leads to a `Quiz Setup` page:
  ```
  +-------------------------------+
  | Quiz Setup                [x] |    [x] = close button to go back to `Browse` page
  +-------------------------------+
  | Length:      [num]            |
  | Country set: [cs-dropdown]    |
  | Quiz mode:   [qm-dropdown]    |
  ...                           ...
  |           [start]             |    [start] leads to the `Quiz` page
  |                               |
  +-------------------------------+
  ```
- Ending the quiz shows the `Quiz Results` page:  
  ```
  +-------------------------------+
  | Quiz Results              [x] |    [x] = close button to discard results and go back to `Browse` page
  +-------------------------------+
  | Quiz time: 15 min 23 sec      |
  | Score    : 15/30 (50%)        |
  | Rank     : 1 [pr]             |
  ...                           ...
  |       [save] [discard]        |    [save] = save quiz stats, [discard] = discard stats
  |                               |    Both buttons lead to going to `Browse` mode/startup screen again
  +-------------------------------+
  ```

- When starting a quiz, the quiz specific settings (length of quiz, country-set and quiz-mode) can be chosen,
  and from then on there are three repeating stages, either until
  the chosen number of countries has been shown, or the user forcefully ends the quiz:
  1. Show country info (e.g. flag, and/or map, and/or capital, and/or name) depending on quiz-mode
  2. Show rest of info once `Show Answer` button is clicked
     and now show also evaluation buttons: `Good Answer` and `Bad Answer`. 
  3. After evaluation, a new country is shown (or the quiz ends).

- The `Quiz` page UI:
   ```
   +-------------------------------+
   | Quiz                     [sq] |    [sq] = stop quiz button, leading to 'Quiz Results' page
   +-------------------------------+
   |  [flag]                       |
   |  [data]           [      map] |
   +-------------------------------+    [sa] = 'Show Answer' button where rest of info is shown, and the 'Good|Bad Answer' 
   | [sa]     [ga] [stats] [ba]    |            buttons get enabled.
   +-------------------------------+    [ga][ba] = 'Good|Bad Answer' buttons leading to a score update and selecting 
                                                    either a next country, or ending the quiz via the 'Quiz Results' page
   ```                                                     

- The hamburger menu UI:
   ```
   +------------------+
   | Home             | -> Go to home (= `Browse`) page
   | Start|Stop Quiz  | -> Start or stop quiz
   | Quiz Stats       | -> Show stats overview
   +------------------+
   | About            | -> Version info and credits
   +------------------+
   ```

- The `Quiz Stats` page:  
  ```
  +-------------------------------+
  | Quiz Stats                [x] |    [x] = close button to discard results and go back to `Browse` page
  +-------------------------------+
  | Quizzes played: 25            |
  | Total score:    50%           |
  | Top-10 difficult countries:   |
  ...                           ...
  |      [export] [import]        |    [export] = download stats as JSON
  |                               |    [import] = show file dialog to import stats from JSON
  +-------------------------------+
  ```

- The `About` page:  
  ```
  +-------------------------------+
  | About                     [x] |    [x] = close button to discard results and go back to `Browse` page
  +-------------------------------+
  | Country Help {version}        |
  | Last update: xxx              |
  | Author: xxx                   |
  | Credits: xxx                  |
  +-------------------------------+
  ```  

- The buttons:
  - <i class="fa-solid fa-globe"></i> Globe Button
  - <i class="fa-solid fa-circle-play"></i> Start Quiz Button
  - <i class="fa-solid fa-circle-stop"></i> Stop Quiz Button
  - <i class="fa-solid fa-xmark"></i> Close Button
  - <i class="fa-solid fa-thumbs-up"></i> Good Answer Button
  - <i class="fa-solid fa-thumbs-down"></i> Bad Answer Button
  - <i class="fa-solid fa-file-import"></i> Import Stats Button
  - <i class="fa-solid fa-file-export"></i> Export Stats Button
  - <i class="fa-solid fa-circle-info"></i> About Button
  - <i class="fa-solid fa-eye"></i> Show Button
  - <i class="fa-solid fa-eye-slash"></i> Hide Button
  - <i class="fa-solid fa-bars"></i> Menu Button
  - <i class="fa-solid fa-dice"></i> Dice Button

### File Format Choices

- `world-countries.json`: One full, static set of country info, as JSON array of following objects:
   ```json
   {
     "name": {
         "common": "Tajikistan",
         "official": "Republic of Tajikistan",
     },
     "tld": [".tj" ],
     "cca2": "TJ",
     "ccn3": "762",
     "cca3": "TJK",
     "cioc": "TJK",
     "independent": true,
     "status": "officially-assigned",
     "unMember": true,
     "capital": [ "Dushanbe" ],
     "region": "Asia",
     "subregion": "Central Asia",
     "languages": {
       "rus": "Russian",
       "tgk": "Tajik"
     },
     "translations": {
       "nld": {
         "common": "Tadzjikistan",
         "official": "Tadzjikistan",
         "capital": " Dushanbe"
       },
       "ita": {
         "common": "Tagikistan",
         "official": "Repubblica del Tajikistan",
         "capital": "Dushanbe"
       }
     },
     "latlng": [ 39, 71 ],
     "maps": {
       "googleMaps": "https://goo.gl/maps/8rQgW88jEXijhVb58",
       "openStreetMaps": "https://www.openstreetmap.org/relation/214626"
     },
     "timezones": [ "UTC+05:00" ],
     "continents": [ "Asia" ],
     "flags": {
       "png": "https://flagcdn.com/w320/tj.png",
       "svg": "https://flagcdn.com/tj.svg",
       "alt": "The flag of Tajikistan is composed of three horizontal bands of red, white and green in the ratio of 2:3:2. A    golden-yellow crown surmounted by an arc of seven five-pointed golden-yellow stars is centered in the white band."
     },
     "wikipedia": {
       "eng": "https://en.wikipedia.org/wiki/Tajikistan",
       "nld": "https://nl.wikipedia.org/wiki/Tadzjikistan",
       "ita": "https://it.wikipedia.org/wiki/Tagikistan"
     }
   }
   ```
   This data set comes originally from https://restcountries.com/v3.1/all but is enriched with additional "wikipedia" links,
   map and flag links and also "capital" translations in Dutch and Italian. All these come from https://en.wikipedia.org. 

- `quiz-stats.json`: Quiz statistics, kept locally on device, can be exported/imported as JSON array of following objects:
  ```json
  {
    "start-time": "2025-01-22T13:55:66Z",
    "quiz-time-in-seconds": 12565,
    "quiz-settings": {
      "country-count": 100,
      "country-set": "world",          // alternatives: "All", 
                                       //               "Europe", 
                                       //               "Asia", 
                                       //               "Americas", 
                                       //               "Oceania",
                                       //               "Caribbean", 
                                       //               "UN", 
                                       //               "Contested"
      "quiz-mode": "capital"           // alternatives: "country", 
                                       //               "country (from capital only)", 
                                       //               "country (from map only)", 
                                       //               "country (from flag only)" 
    },
    "correct-answers": [ "be", "it", ... ],
    "incorrect-answers": [ "tj", "gm", ... ]
  }
  ```
  When importing quiz-stats, existing stats will completely be replaced by the incoming data.

## Data Sources
The basic information about countries comes from: https://restcountries.com/v3.1/all  
Other country information from: https://en.wikipedia.org

## What works, and what doesn't

Works:
- Simple country selection works
- Picking a random country works
- The UI is mobile friendly and responsive
- Countries and capitals have correct translations now (in Italian and Dutch)
- Using wikipedia maps to show for countries

Still todo:
- Make a real quiz mode
- Create `Browse` page
- Create `Quiz Setup` page
- Create `Quiz Results` page
- Create `Quiz Stats` page
- Create hamburger menu
- Create `About` page
- Keep track of quiz results
- Keep track of quiz stats in browser storage
- Allow importing/exporting quiz stats
- Add world/google map of all countries

