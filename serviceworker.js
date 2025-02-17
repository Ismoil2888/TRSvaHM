const CACHE_NAME = 'site-cache-v1';
const urlsToCache = [
  '/',
  'index.html',
  'offline.html',
  'index.js',
  'index.css',
  'App.js',
  'App.css'
  // Добавьте сюда другие файлы, которые вы хотите кэшировать
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
  event.respondWith(
    caches.match(event.request)
     .then(() => {
        return fetch(event.request)
        .catch(() => caches.match('offline.html'))
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
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});