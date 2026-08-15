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

/** Détecte une bannière (nom de fichier `banner-*`, hash de build inclus). */
const isBannerUrl = (url) => /\/banner-[^/]*\.(?:jpg|jpeg|png|webp|avif)$/i.test(new URL(url).pathname);

/**
 * Invalidation : supprime du cache toutes les bannières dont l'URL (donc le hash
 * de build) ne fait plus partie de la version courante de l'app.
 */
const syncBanners = async (urls) => {
  const cache = await caches.open(CACHE_NAME);
  const keep = new Set(urls.map((u) => new URL(u, self.location.origin).href));
  const keys = await cache.keys();
  await Promise.all(
    keys
      .filter((req) => isBannerUrl(req.url) && !keep.has(req.url))
      .map((req) => cache.delete(req)),
  );
};

self.addEventListener("message", (event) => {
  const data = event.data;
  if (!data) return;

  if (data.type === "SYNC_BANNERS" && Array.isArray(data.urls)) {
    event.waitUntil(syncBanners(data.urls));
    return;
  }

  if (data.type === "PURGE_IMAGES") {
    event.waitUntil(caches.delete(CACHE_NAME));
    return;
  }

  if (data.type !== "CACHE_IMAGES" || !Array.isArray(data.urls)) return;
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
