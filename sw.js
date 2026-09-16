// Service Worker SkorDuel — Cache offline
const CACHE_NAME = 'skorduel-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install — cache aset
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate — hapus cache lama
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch — network first, fallback cache
self.addEventListener('fetch', (e) => {
  // Skip non-GET & external API
  if (e.request.method !== 'GET') return;
  if (e.request.url.includes('workers.dev')) return;
  if (e.request.url.includes('football-data.org')) return;
  if (e.request.url.includes('thesportsdb.com')) return;
  if (e.request.url.includes('i.ibb.co')) return;

  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request).then((res) => res || caches.match('/index.html')))
  );
});
