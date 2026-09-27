// Service Worker for 魔方小勇士 PWA
const CACHE_NAME = 'rubik-kids-v12';
const ASSETS_TO_CACHE = [
  './',
  'cube-state.js',
  'validate-facelets.js',
  'near-solver.js',
  'solver-bridge.js',
  'solver-worker.js',
  'cross-solver.js',
  'layer1-solver.js',
  'middle-solver.js',
  'yellow-cross-solver.js',
  'yellow-face-solver.js',
  'top-corners-solver.js',
  'top-edges-solver.js',
  'vendor/cubejs/cube.js',
  'vendor/cubejs/solve.js',
  'manifest.json',
  'icon-192.png',
  'icon-512.png',
  'icon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(
        ASSETS_TO_CACHE.map((asset) => cache.add(asset))
      );
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Network first, falling back to cache
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  // Only handle requests to the same origin
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          if (event.request.headers.get('accept')?.includes('text/html')) {
            return caches.match('./');
          }
        });
      })
  );
});
