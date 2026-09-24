const CACHE_NAME = "expo12h-control-center-v24";
const ASSET_VERSION = "20260924-map-v2";
const APP_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./assets/expo12h-logo-alt.png",
  "./assets/expo12h-logo-primary.png",
  "./assets/icon.svg",
  "./assets/parque-centrica-map.png",
  `./css/styles.css?v=${ASSET_VERSION}`,
  `./js/activations.js?v=${ASSET_VERSION}`,
  `./js/app.js?v=${ASSET_VERSION}`,
  `./js/broadcast.js?v=${ASSET_VERSION}`,
  `./js/checklist.js?v=${ASSET_VERSION}`,
  `./js/config.js?v=${ASSET_VERSION}`,
  `./js/dashboard.js?v=${ASSET_VERSION}`,
  `./js/data.js?v=${ASSET_VERSION}`,
  `./js/incidents.js?v=${ASSET_VERSION}`,
  `./js/map.js?v=${ASSET_VERSION}`,
  `./js/metrics.js?v=${ASSET_VERSION}`,
  `./js/storage.js?v=${ASSET_VERSION}`,
  `./js/sync.js?v=${ASSET_VERSION}`,
  `./js/team.js?v=${ASSET_VERSION}`,
  `./js/timeline.js?v=${ASSET_VERSION}`,
  `./js/utils.js?v=${ASSET_VERSION}`,
  `./js/vehicles.js?v=${ASSET_VERSION}`
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
