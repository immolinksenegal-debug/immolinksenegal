/* Service worker: cache persistant (cross-session) pour les images de bannières.
   Stratégie: cache-first + revalidation en arrière-plan (stale-while-revalidate).
   Seules les requêtes d'images GET same-origin sont interceptées. */

const CACHE_NAME = "immolink-images-v1";
const MAX_ENTRIES = 60;

const isImageRequest = (request) => {
  if (request.method !== "GET") return false;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return false;
  if (request.destination === "image") return true;
  return /\.(?:jpg|jpeg|png|webp|avif|gif|svg)$/i.test(url.pathname);
};

const trim = async (cache) => {
  const keys = await cache.keys();
  if (keys.length <= MAX_ENTRIES) return;
  await Promise.all(keys.slice(0, keys.length - MAX_ENTRIES).map((k) => cache.delete(k)));
};

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("message", (event) => {
  const data = event.data;
  if (!data || data.type !== "CACHE_IMAGES" || !Array.isArray(data.urls)) return;
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await Promise.all(
        data.urls.map(async (url) => {
          try {
            if (await cache.match(url)) return;
            const response = await fetch(url, { credentials: "same-origin" });
            if (response.ok) await cache.put(url, response.clone());
          } catch {
            /* réseau indisponible: on réessaiera à la prochaine session */
          }
        }),
      );
      await trim(cache);
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (!isImageRequest(request)) return;

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(request);

      const network = fetch(request)
        .then(async (response) => {
          if (response && response.ok) {
            await cache.put(request, response.clone());
            trim(cache);
          }
          return response;
        })
        .catch(() => cached);

      return cached || network;
    })(),
  );
});
