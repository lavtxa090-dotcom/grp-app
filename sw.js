const CACHE_NAME = 'grp-brigade-v1';
const urlsToCache = [
  '/grp-app/',
  '/grp-app/index.html',
  '/grp-app/manifest.json',
  '/grp-app/icon-192.png',
  '/grp-app/icon-512.png',
  '/grp-app/icon.png',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Firebase запросы не кешируем
  if (event.request.url.includes('firebase') || 
      event.request.url.includes('googleapis') ||
      event.request.url.includes('gstatic')) {
    return;
  }
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).catch(() => {
        return caches.match('/grp-app/index.html');
      });
    })
  );
});
