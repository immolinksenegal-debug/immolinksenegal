/**
 * Cache persistant des images (CacheStorage via service worker)
 * + stratégie d'invalidation lors des mises à jour du site.
 *
 * Les images buildées portent un hash dans leur nom : à chaque mise à jour
 * d'une bannière, son URL change. On informe donc le service worker de la
 * liste courante pour qu'il supprime les versions obsolètes, et on purge
 * totalement le cache quand la version de build change.
 */

const VERSION_KEY = "immolink:image-cache-version";
/** Version du cache : dérivée des URLs (hashées au build) des bannières. */
let cacheVersion = "";

let registration: ServiceWorkerRegistration | null = null;
const pendingCache: string[] = [];
let pendingSync: string[] | null = null;
let pendingPurge = false;

const worker = () => registration?.active ?? navigator.serviceWorker?.controller ?? null;

const flush = () => {
  const sw = worker();
  if (!sw) return;
  if (pendingPurge) {
    pendingPurge = false;
    sw.postMessage({ type: "PURGE_IMAGES" });
  }
  if (pendingSync) {
    sw.postMessage({ type: "SYNC_BANNERS", urls: pendingSync });
    pendingSync = null;
  }
  if (pendingCache.length) {
    sw.postMessage({ type: "CACHE_IMAGES", urls: pendingCache.splice(0, pendingCache.length) });
  }
};

const onReady = (reg: ServiceWorkerRegistration) => {
  registration = reg;
  if (reg.active) {
    flush();
    return;
  }
  reg.addEventListener("updatefound", () => {
    reg.installing?.addEventListener("statechange", (e) => {
      if ((e.target as ServiceWorker).state === "activated") flush();
    });
  });
};

export const registerImageCache = () => {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

  // Nouvelle version du site → on invalide entièrement le cache d'images.
  try {
    if (localStorage.getItem(VERSION_KEY) !== BUILD_VERSION) {
      pendingPurge = true;
      localStorage.setItem(VERSION_KEY, BUILD_VERSION);
    }
  } catch {
    /* stockage indisponible : on garde la synchro par URL */
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .then((reg) => {
        onReady(reg);
        // Vérifie la présence d'un nouveau service worker à chaque session.
        reg.update().catch(() => undefined);
      })
      .catch(() => {
        /* service worker indisponible : le cache HTTP prend le relais */
      });
  });

  navigator.serviceWorker.addEventListener("controllerchange", flush);
};

/** Demande la mise en cache persistante d'une liste d'images. */
export const persistImages = (urls: string[]) => {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  pendingCache.push(...urls);
  flush();
};

/**
 * Déclare la liste des bannières de la version courante : le service worker
 * supprime toutes les bannières en cache qui n'en font plus partie.
 */
export const syncBannerCache = (urls: string[]) => {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  pendingSync = urls;
  flush();
};
