const CACHE_NAME = 'smartstay-luxe-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/smartstay_app_icon_final_1775112894688.png'
];

// 1. Install & Cache Static Shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// 2. Activate & Clean Old Caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)));
    })
  );
});

// 3. Smart Fetching: Network-First for API/Doc, Cache-First for Images
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // For Images, use Cache-First
  if (request.destination === 'image') {
    event.respondWith(
      caches.match(request).then((cached) => {
        return cached || fetch(request).then((response) => {
          const cloned = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, cloned));
          return response;
        });
      })
    );
  } else {
    // For others, Network-First
    event.respondWith(
      fetch(request).catch(() => caches.match(request))
    );
  }
});
