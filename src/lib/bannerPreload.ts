import bannerAbout from "@/assets/banner-about.jpg";
import bannerArticles from "@/assets/banner-articles.jpg";
import bannerContact from "@/assets/banner-contact.jpg";
import bannerEstimation from "@/assets/banner-estimation.jpg";
import bannerHowItWorks from "@/assets/banner-how-it-works.jpg";
import bannerLegal from "@/assets/banner-legal.jpg";
import bannerProperties from "@/assets/banner-properties.jpg";
import { persistImages } from "@/lib/imageCache";

/** Toutes les bannières du site, préchargées puis mises en cache par le navigateur. */
export const BANNER_IMAGES = [
  bannerProperties,
  bannerArticles,
  bannerAbout,
  bannerContact,
  bannerHowItWorks,
  bannerEstimation,
  bannerLegal,
];

const preloaded = new Set<string>();

const addLink = (href: string, rel: "preload" | "prefetch") => {
  if (preloaded.has(href)) return;
  preloaded.add(href);
  const link = document.createElement("link");
  link.rel = rel;
  link.as = "image";
  link.href = href;
  document.head.appendChild(link);
};

/** Précharge immédiatement une bannière (image LCP de la page courante). */
export const preloadBanner = (href: string) => {
  addLink(href, "preload");
  persistImages([href]);
};

/**
 * Précharge en tâche de fond (idle) toutes les bannières pour que la navigation
 * entre pages n'attende plus le téléchargement des images.
 */
export const prefetchBanners = () => {
  if (typeof window === "undefined") return;
  const run = () => {
    BANNER_IMAGES.forEach((src) => addLink(src, "prefetch"));
    // Cache persistant (survit à la fermeture de l'onglet)
    persistImages(BANNER_IMAGES);
  };
  const ric = (window as unknown as {
    requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
  }).requestIdleCallback;
  if (ric) ric(run, { timeout: 3000 });
  else window.setTimeout(run, 1500);
};
