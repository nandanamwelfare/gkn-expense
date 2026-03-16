// Nandanam Expenses — Service Worker v20.1
// Network-first strategy: always fetches fresh on deploy, falls back to cache offline

const CACHE_NAME = 'nandanam-v20';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// Install: pre-cache static shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting(); // activate immediately
});

// Activate: wipe ALL old caches so stale files are never served
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim(); // take control of all open tabs immediately
});

// Fetch: NETWORK-FIRST for everything
// Always tries network; only falls back to cache when offline
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Never intercept Google Apps Script / Drive API calls
  if (url.hostname.includes('script.google.com') ||
      url.hostname.includes('googleapis.com') ||
      url.hostname.includes('drive.google.com')) return;

  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Fresh response from network — update cache and return
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => {
        // Offline — fall back to cache
        return caches.match(event.request).then((cached) => {
          if (cached) return cached;
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });
      })
  );
});
