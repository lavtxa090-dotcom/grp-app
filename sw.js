const CACHE_NAME = 'grp-brigade-v2';
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
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .catch(err => console.log('Cache install error:', err))
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
  // Don't cache Firebase/Google requests
  const url = event.request.url;
  if (url.includes('firebase') || url.includes('googleapis') || 
      url.includes('gstatic') || url.includes('identitytoolkit')) {
    return;
  }
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
      .catch(() => caches.match('/grp-app/index.html'))
  );
});
