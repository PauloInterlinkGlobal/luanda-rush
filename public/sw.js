const CACHE_NAME = "lotador-offline-v3";
const CORE_ASSETS = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/favicon.png",
  "/favicon.ico",
  "/player_sheet.png",
  "/lotador_sprites.png",
  "/lotador_atlas_clean.png",
  "/npcs_people.png",
  "/props_street.png",
  "/taxi_blue.png",
  "/taxi_green.png",
  "/taxi_red.png",
  "/taxi_yellow.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS).catch(() => undefined)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== self.location.origin) return;
  const request = event.request;
  const url = new URL(request.url);
  const staticAsset = /\.(png|jpg|jpeg|webp|svg|ico|mp3|wav|ogg|woff2?)$/i.test(url.pathname);
  const codeAsset = /\.(js|css)$/i.test(url.pathname);
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).then((response) => {
      const copy = response.clone();
      void caches.open(CACHE_NAME).then((cache) => cache.put("/index.html", copy));
      return response;
    }).catch(() => caches.match("/index.html").then((response) => response || caches.match("/"))));
    return;
  }
  if (staticAsset) {
    event.respondWith(caches.match(request).then((cached) => cached || fetch(request).then((response) => {
      const copy = response.clone();
      void caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
      return response;
    })));
    return;
  }
  if (codeAsset) {
    event.respondWith(caches.match(request).then((cached) => {
      const network = fetch(request).then((response) => {
        const copy = response.clone();
        void caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        return response;
      });
      return cached || network;
    }));
  }
});
