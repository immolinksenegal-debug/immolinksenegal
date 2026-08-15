/**
 * Cache persistant des images (CacheStorage via service worker).
 * Complète le cache HTTP du navigateur : les bannières restent disponibles
 * d'une session à l'autre, même après fermeture de l'onglet.
 */

let registration: ServiceWorkerRegistration | null = null;
const pending: string[] = [];

const flush = () => {
  const worker = registration?.active ?? navigator.serviceWorker?.controller;
  if (!worker || pending.length === 0) return;
  worker.postMessage({ type: "CACHE_IMAGES", urls: pending.splice(0, pending.length) });
};

export const registerImageCache = () => {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((reg) => {
        registration = reg;
        if (reg.active) flush();
        else reg.addEventListener("updatefound", () => {
          reg.installing?.addEventListener("statechange", (e) => {
            if ((e.target as ServiceWorker).state === "activated") flush();
          });
        });
      })
      .catch(() => {
        /* service worker indisponible : le cache HTTP prend le relais */
      });
  });
};

/** Demande la mise en cache persistante d'une liste d'images. */
export const persistImages = (urls: string[]) => {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  pending.push(...urls);
  flush();
};
