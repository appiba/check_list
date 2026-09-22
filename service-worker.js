const CACHE_NAME = "expo12h-control-center-v10";
const APP_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./assets/expo12h-logo-alt.png",
  "./assets/expo12h-logo-primary.png",
  "./assets/icon.svg",
  "./assets/parque-centrica-map.png",
  "./css/styles.css",
  "./js/activations.js",
  "./js/app.js",
  "./js/broadcast.js",
  "./js/checklist.js",
  "./js/config.js",
  "./js/dashboard.js",
  "./js/data.js",
  "./js/incidents.js",
  "./js/map.js",
  "./js/metrics.js",
  "./js/storage.js",
  "./js/sync.js",
  "./js/team.js",
  "./js/timeline.js",
  "./js/utils.js",
  "./js/vehicles.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
