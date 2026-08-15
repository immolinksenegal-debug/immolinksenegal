// Runs before `vite dev` and `vite build` (predev/prebuild hooks); writes public/sitemap.xml.

import { writeFileSync } from "fs";
import { resolve } from "path";

const BASE_URL = "https://immolinksenegal.lovable.app";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

const staticEntries: SitemapEntry[] = [
  { path: "/", changefreq: "daily", priority: "1.0" },
  { path: "/properties", changefreq: "daily", priority: "0.9" },
  { path: "/articles", changefreq: "weekly", priority: "0.8" },
  { path: "/estimation-gratuite", changefreq: "monthly", priority: "0.8" },
  { path: "/a-propos", changefreq: "monthly", priority: "0.6" },
  { path: "/comment-ca-marche", changefreq: "monthly", priority: "0.6" },
  { path: "/contact", changefreq: "monthly", priority: "0.6" },
  { path: "/conditions", changefreq: "yearly", priority: "0.3" },
  { path: "/confidentialite", changefreq: "yearly", priority: "0.3" },
];

async function fetchRows(table: string, query: string): Promise<any[]> {
  if (!SUPABASE_URL || !SUPABASE_KEY) return [];
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    });
    if (!res.ok) return [];
    return (await res.json()) as any[];
  } catch {
    return [];
  }
}

function generateSitemap(entries: SitemapEntry[]) {
  const urls = entries.map((e) =>
    [
      `  <url>`,
      `    <loc>${BASE_URL}${e.path}</loc>`,
      e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      `  </url>`,
    ]
      .filter(Boolean)
      .join("\n"),
  );

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
  ].join("\n");
}

async function main() {
  const entries = [...staticEntries];

  const properties = await fetchRows(
    "properties",
    "select=id,updated_at&status=eq.active&limit=5000",
  );
  for (const p of properties) {
    entries.push({
      path: `/property/${p.id}`,
      lastmod: p.updated_at ? String(p.updated_at).slice(0, 10) : undefined,
      changefreq: "weekly",
      priority: "0.7",
    });
  }

  const articles = await fetchRows(
    "articles",
    "select=slug,updated_at&status=eq.published&limit=5000",
  );
  for (const a of articles) {
    if (!a.slug) continue;
    entries.push({
      path: `/articles/${a.slug}`,
      lastmod: a.updated_at ? String(a.updated_at).slice(0, 10) : undefined,
      changefreq: "monthly",
      priority: "0.6",
    });
  }

  writeFileSync(resolve("public/sitemap.xml"), generateSitemap(entries));
  console.log(`sitemap.xml written (${entries.length} entries)`);
}

main();
