const CACHE_NAME = 'genz-v3';

// Offline'da da çalışsın diye cache'lenecek dosyalar
const STATIC_ASSETS = [
  '/gen-z.html',
  '/magaza.html',
  '/profile.html',
  '/ustam.html',
  '/404.html',
  '/manifest.json',
  '/favicon-192x192.png',
  '/favicon.svg',
  '/categories.js',
  '/firebase-config.js',
  '/firebase-store.js',
  '/firebase-sync.js'
];

// Kurulum
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {});
    })
  );
  self.skipWaiting();
});

// Aktivasyon — eski cache'leri temizle
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network isteği — önce network, yoksa cache
self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  // Firebase, dış kaynaklar ve POST isteklerini pass et
  if (!url.startsWith(self.location.origin)) return;
  if (event.request.method !== 'GET') return;
  if (url.includes('chrome-extension')) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Başarılı yanıtı cache'e de yaz (sadece 200 OK)
        if (response && response.status === 200 && response.type !== 'opaque') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => {
        // Network yoksa cache'den sun, yoksa 404 sayfasına düş
        return caches.match(event.request)
          || caches.match('/404.html');
      })
  );
});

