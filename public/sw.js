const CACHE_NAME = "lotador-offline-v2";
const CORE_ASSETS = [
  "/",
  "/manifest.webmanifest",
  "/favicon.png",
  "/lotador_atlas_clean.png",
  "/player_sheet.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
      ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== self.location.origin)
    return;
  const url = new URL(event.request.url);
  const isAppModule =
    event.request.destination === "script" ||
    url.pathname.startsWith("/src/") ||
    url.pathname.includes("/@vite/") ||
    url.pathname.includes("node_modules/");

  // Nunca persista módulos do Vite: uma versão antiga pode impedir imports
  // dinâmicos e deixar o jogo preso em um chunk inválido após HMR/deploy.
  if (isAppModule) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request).then(
      (cached) =>
        cached ||
        fetch(event.request)
          .then((response) => {
            if (response.ok && CORE_ASSETS.includes(url.pathname)) {
              const copy = response.clone();
              void caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
            }
            return response;
          })
          .catch(() => caches.match("/")),
    ),
  );
});
