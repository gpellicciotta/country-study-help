const CACHE_NAME = 'v3';
const urlsToCache = [
  '/data/world-countries.csv',
  '/data/world-countries.json',
  // All images:
  '/img/world-map.ico',
  '/img/world-map.svg' 
];

const languageCodes = ["ad", "ae", "af", "ag", "ai", "al", "am", "ao", "aq", "ar", "arab", "as", "asean", "at", "au", "aw", "ax", "az", "ba", "bb", "bd", "be", "bf", "bg", "bh", "bi", "bj", "bl", "bm", "bn", "bo", "bq", "br", "bs", "bt", "bv", "bw", "by", "bz", "ca", "cc", "cd", "cefta", "cf", "cg", "ch", "ci", "ck", "cl", "cm", "cn", "co", "cp", "cr", "cu", "cv", "cw", "cx", "cy", "cz", "de", "dg", "dj", "dk", "dm", "do", "dz", "eac", "ec", "ee", "eg", "eh", "er", "es-ct", "es-ga", "es-pv", "es", "et", "eu", "fi", "fj", "fk", "fm", "fo", "fr", "ga", "gb-eng", "gb-nir", "gb-sct", "gb-wls", "gb", "gd", "ge", "gf", "gg", "gh", "gi", "gl", "gm", "gn", "gp", "gq", "gr", "gs", "gt", "gu", "gw", "gy", "hk", "hm", "hn", "hr", "ht", "hu", "ic", "id", "ie", "il", "im", "in", "io", "iq", "ir", "is", "it", "je", "jm", "jo", "jp", "ke", "kg", "kh", "ki", "km", "kn", "kp", "kr", "kw", "ky", "kz", "la", "lb", "lc", "li", "lk", "lr", "ls", "lt", "lu", "lv", "ly", "ma", "mc", "md", "me", "mf", "mg", "mh", "mk", "ml", "mm", "mn", "mo", "mp", "mq", "mr", "ms", "mt", "mu", "mv", "mw", "mx", "my", "mz", "na", "nc", "ne", "nf", "ng", "ni", "nl", "no", "np", "nr", "nu", "nz", "om", "pa", "pc", "pe", "pf", "pg", "ph", "pk", "pl", "pm", "pn", "pr", "ps", "pt", "pw", "py", "qa", "re", "ro", "rs", "ru", "rw", "sa", "sb", "sc", "sd", "se", "sg", "sh-ac", "sh-hl", "sh-ta", "sh", "si", "sj", "sk", "sl", "sm", "sn", "so", "sr", "ss", "st", "sv", "sx", "sy", "sz", "tc", "td", "tf", "tg", "th", "tj", "tk", "tl", "tm", "tn", "to", "tr", "tt", "tv", "tw", "tz", "ua", "ug", "um", "un", "us", "uy", "uz", "va", "vc", "ve", "vg", "vi", "vn", "vu", "wf", "ws", "xk", "xx", "ye", "yt", "za", "zm", "zw"];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        const cachePromises = urlsToCache.map(url => {
          return fetch(url)
            .then(response => {
              if (!response.ok) {
                throw new TypeError('Bad response status');
              }
              return cache.put(url, response);
            })
            .catch(error => {
              console.error(`Failed to cache ${url}`);
            });
        });

        languageCodes.forEach(code => {
          const flagUrls = [
            `/img/flags/4x3/${code}.svg`,
            `/img/flags/1x1/${code}.svg`,
            `/img/maps/${code}.svg`,
            `/img/maps/${code}.png`,
            `/img/maps/${code}.jpg`
          ];

          flagUrls.forEach(url => {
            cachePromises.push(
              fetch(url)
                .then(response => {
                  if (!response.ok) {
                    throw new TypeError('Bad response status');
                  }
                  return cache.put(url, response);
                })
                .catch(error => {
                  console.warn(`Failed to cache ${url}`);
                })
            );
          });
        });

        return Promise.all(cachePromises);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response; // Return the cached response if found
        }
        return fetch(event.request); // Fetch from network if not in cache
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName); // Delete old caches
          }
        })
      );
    })
  );
});
