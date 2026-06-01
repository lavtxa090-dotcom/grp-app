const CACHE_NAME = 'grp-brigade-v10';
const urlsToCache = [
  '/grp-app/',
  '/grp-app/index.html',
  '/grp-app/manifest.json',
  '/grp-app/icon-192.png',
  '/grp-app/icon-512.png',
  '/grp-app/icon.png',
];

self.addEventListener('install', event => {
  self.skipWaiting(); // Activate immediately
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .catch(err => console.log('Cache install error:', err))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    )).then(() => self.clients.claim()) // Take control immediately
  );
});

self.addEventListener('fetch', event => {
  const url = event.request.url;
  // Never cache Firebase/Google requests
  if (url.includes('firebase') || url.includes('googleapis') || 
      url.includes('gstatic') || url.includes('identitytoolkit')) {
    return fetch(event.request);
  }
  // For HTML files - always fetch from network first (cache-busting)
  if (url.endsWith('.html') || url.endsWith('/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }
  // For other assets - cache first
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
      .catch(() => caches.match('/grp-app/index.html'))
  );
});
