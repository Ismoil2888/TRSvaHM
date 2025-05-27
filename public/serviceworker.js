const CACHE_NAME = 'site-cache-v2';
const urlsToCache = [
  '/', 
  '/index.html',
  '/static/js/main.abcdef12.js',    // взять из build
  '/static/css/main.3456abcd.css',  // и т.д.
  '/offline.html'
];

fetch('cacheList.json')
  .then(response => response.json())
  .then(images => {
    urlsToCache.push(...images);
  });

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache')
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);

  // 1) Если запрос не к нашему origin, просто пропускаем его в сеть
  if (requestUrl.origin !== self.location.origin) {
    return event.respondWith(fetch(event.request));
  }

  // 2) Если это навигация (переход на маршрут SPA), отдать index.html из кэша или сеть
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match('/index.html').then(cached => {
        return cached || fetch('/index.html');
      })
    );
    return;
  }

  // 3) Для остальных «своих» ресурсов пробуем отдать из кэша, иначе — из сети
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request);
    })
  );
});

// self.addEventListener('fetch', event => {
//   event.respondWith(
//     caches.match(event.request)
//      .then(() => {
//         return fetch(event.request)
//         .catch(() => caches.match('offline.html'))
//     })
//   );
// });

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
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