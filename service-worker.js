import log from './js/logging.mjs';
import constants from './js/constants.mjs';

// Set up logging:
log.setLogLevel(log.DEBUG);
log.setLogMessagePrefixFormat("service-worker: ${log-level}");

self.addEventListener('install', event => {
  self.skipWaiting(); // Activate service worker immediately
  event.waitUntil(
    caches.open(constants.APP_VERSION)
      .then(cache => {
        console.log(`Opened cache ${constants.APP_VERSION}`);
        const urlsToCache = [...constants.STATIC_CACHE_DATA, ...constants.GENERATED_CACHE_DATA];
        const cachePromises = urlsToCache.map(async url => {
          try {
            const response = await fetch(url);
            if (!response.ok) {
              throw new TypeError('Bad response status');
            }
            log.debug(`Cached '${url}'`);
            return await cache.put(url, response);
          } 
          catch (error) {
            log.error(`Failed to cache '${url}'`);
          }
        });

        return Promise.all(cachePromises);
      })
  );
});

self.addEventListener('fetch', event => {
  // Return the cached response if found, but fetch from network if not cached
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          log.debug(`Found '${event.request.url}' in cache`);
          return response; 
        }
        log.debug(`Did not find '${event.request.url}' in cache: fetching from network instead`);
        return fetch(event.request); // Fetch from network if not in cache
      })
  );
});

self.addEventListener('activate', event => {
  log.info('Service worker activated');
  const cacheWhitelist = [constants.APP_VERSION];
  event.waitUntil(
    // Delete old caches
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName); 
          }
        })
      );
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'reload-caches') {
    log.info("Reloading all caches afte receiving following message:", event);
    event.waitUntil(
      caches.open(constants.APP_VERSION)
        .then(cache => {
          console.log(`Opened cache ${constants.APP_VERSION}`);
          const urlsToCache = [...constants.STATIC_CACHE_DATA, ...constants.GENERATED_CACHE_DATA];
          const cachePromises = urlsToCache.map(async url => {
            try {
              const response = await fetch(url);
              if (!response.ok) {
                throw new TypeError('Bad response status');
              }
              log.debug(`Cached '${url}'`);
              return await cache.put(url, response);
            } 
            catch (error) {
              log.error(`Failed to cache '${url}'`);
            }
          });
          return Promise.all(cachePromises);
        })
    );
  }
});