#!/usr/bin/env node
/**
 * Sincroniza o pacote estático com o domínio oficial:
 * https://rsengenharia.eng.br/
 *
 * Gera em dist/client/:
 *  - robots.txt  (Allow + Sitemap canônico)
 *  - sitemap.xml (a partir de scripts/prerender-routes.mjs)
 *  - CNAME       (rsengenharia.eng.br — espelho stable-website / GitHub Pages)
 *
 * Também garante public/robots.txt, public/sitemap.xml e public/CNAME
 * para que o Vite copie automaticamente no próximo build.
 *
 * Uso:
 *   node scripts/generate-seo.mjs
 *   SITE_URL=https://rsengenharia.eng.br node scripts/generate-seo.mjs
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { PRERENDER_ROUTES } from "./prerender-routes.mjs";

const SITE_URL = (process.env.SITE_URL || "https://rsengenharia.eng.br").replace(/\/+$/, "");
const SITE_HOST = SITE_URL.replace(/^https?:\/\//, "");
const ROOT = process.cwd();
const PUBLIC_DIR = resolve(ROOT, "public");
const OUT_DIR = resolve(ROOT, "dist/client");

const today = new Date().toISOString().slice(0, 10);

function priorityFor(route) {
  if (route === "/") return { priority: "1.0", changefreq: "weekly" };
  if (route === "/galeria") return { priority: "0.9", changefreq: "weekly" };
  if (route === "/obras/golden-mall-rosario") return { priority: "0.9", changefreq: "weekly" };
  if (route.startsWith("/obras/")) return { priority: "0.8", changefreq: "monthly" };
  if (route === "/health" || route === "/deploy") return { priority: "0.3", changefreq: "yearly" };
  return { priority: "0.9", changefreq: "weekly" };
}

// /health e /deploy são utilitárias (noindex) — fora do sitemap público.
const SITEMAP_ROUTES = PRERENDER_ROUTES.filter((r) => r !== "/health" && r !== "/deploy");

const urls = SITEMAP_ROUTES.map((route) => {
  const loc = route === "/" ? `${SITE_URL}/` : `${SITE_URL}${route}`;
  const { priority, changefreq } = priorityFor(route);
  return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}).join("\n");

const SITEMAP = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

const ROBOTS = `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`;

const CNAME = `${SITE_HOST}\n`;

mkdirSync(PUBLIC_DIR, { recursive: true });
writeFileSync(resolve(PUBLIC_DIR, "robots.txt"), ROBOTS, "utf8");
writeFileSync(resolve(PUBLIC_DIR, "sitemap.xml"), SITEMAP, "utf8");
writeFileSync(resolve(PUBLIC_DIR, "CNAME"), CNAME, "utf8");
console.log(`✓ public/robots.txt + sitemap.xml (${SITEMAP_ROUTES.length} URLs) + CNAME sincronizados com ${SITE_URL}`);

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(resolve(OUT_DIR, "robots.txt"), ROBOTS, "utf8");
writeFileSync(resolve(OUT_DIR, "sitemap.xml"), SITEMAP, "utf8");
writeFileSync(resolve(OUT_DIR, "CNAME"), CNAME, "utf8");
console.log(`✓ dist/client/robots.txt + sitemap.xml + CNAME gerados para ${SITE_URL}`);
