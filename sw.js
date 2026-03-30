const CACHE_NAME = 'genz-v1';

// Offline'da da çalışsın diye cache'lenecek dosyalar
const STATIC_ASSETS = [
  '/gen-z.html',
  '/magaza.html',
  '/profile.html',
  '/manifest.json',
  '/favicon-192x192.png',
  '/favicon.svg',
  '/tema-loader.js',
  '/categories.js'
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
  // Firebase ve dış istekleri pass et
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Başarılı yanıtı cache'e de yaz
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => {
        // Network yoksa cache'den sun
        return caches.match(event.request);
      })
  );
});
