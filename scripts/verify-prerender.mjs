#!/usr/bin/env node
/**
 * Postbuild guard: falha se o build não gerou o pacote estático mínimo
 * para FTP/Apache. Roda automaticamente após `vite build` via npm `postbuild`.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { PRERENDER_ROUTES } from "./prerender-routes.mjs";

const DIST = resolve(process.cwd(), "dist/client");
const SHELL = resolve(DIST, "_shell.html");
const INDEX = resolve(DIST, "index.html");
const ASSETS = resolve(DIST, "assets");
const MIN_BYTES = 500; // HTML muito pequeno provavelmente é shell vazio/erro.

const errors = [];
const warnings = [];

function routeToFile(route) {
  if (route === "/") return resolve(DIST, "index.html");
  return resolve(DIST, `.${route}/index.html`);
}

if (!existsSync(DIST)) errors.push("Diretório obrigatório ausente: dist/client/");
if (!existsSync(SHELL)) {
  errors.push("Arquivo obrigatório ausente: dist/client/_shell.html");
} else if (statSync(SHELL).size < MIN_BYTES) {
  errors.push(`_shell.html muito pequeno (${statSync(SHELL).size} bytes)`);
}
if (!existsSync(INDEX)) {
  errors.push("Arquivo obrigatório ausente: dist/client/index.html (home prerendered)");
} else if (statSync(INDEX).size < MIN_BYTES) {
  errors.push(`index.html muito pequeno (${statSync(INDEX).size} bytes)`);
} else {
  const home = readFileSync(INDEX, "utf8");
  if (!home.includes("Golden Mall")) {
    errors.push("index.html não contém 'Golden Mall' — home desatualizada ou prerender falhou");
  }
  if (!home.includes("assets/")) {
    warnings.push("index.html sem referência a assets/ — bundles podem não carregar");
  }
}
for (const route of PRERENDER_ROUTES) {
  const file = routeToFile(route);
  if (!existsSync(file)) {
    errors.push(`Rota não prerenderizada: ${route} (esperado ${file})`);
  } else if (statSync(file).size < MIN_BYTES) {
    errors.push(`HTML muito pequeno em ${route} (${statSync(file).size} bytes)`);
  }
}
if (!existsSync(ASSETS)) {
  errors.push("Pasta obrigatória ausente: dist/client/assets/");
} else {
  const assets = readdirSync(ASSETS);
  if (!assets.some((name) => name.endsWith(".js"))) {
    errors.push("Nenhum bundle .js encontrado em dist/client/assets/");
  }
  if (!assets.some((name) => name.endsWith(".css"))) {
    errors.push("Nenhum bundle .css encontrado em dist/client/assets/");
  }
}

// ── Imagens públicas (hero, logo, og-cover, favicons) ────────────────────────
const REQUIRED_PUBLIC_IMAGES = [
  "hero-rosario.jpg",
  "hero-rosario.webp",
  "logo-rezende-saback.png",
  "og-cover.jpg",
  "favicon.png",
  "apple-touch-icon.png",
];
for (const img of REQUIRED_PUBLIC_IMAGES) {
  const file = resolve(DIST, img);
  if (!existsSync(file)) {
    errors.push(`Imagem pública ausente no build: dist/client/${img}`);
  } else if (statSync(file).size < 500) {
    errors.push(`Imagem pública suspeita (muito pequena): dist/client/${img}`);
  }
}

// ── SEO canônico https://rsengenharia.eng.br ───────────────────────────────
const SITE_URL = (process.env.SITE_URL || "https://rsengenharia.eng.br").replace(/\/+$/, "");
for (const seo of ["robots.txt", "sitemap.xml", "CNAME"]) {
  const file = resolve(DIST, seo);
  if (!existsSync(file)) {
    warnings.push(`${seo} ausente em dist/client/ — rode node scripts/generate-seo.mjs`);
  }
}
{
  const robots = resolve(DIST, "robots.txt");
  if (existsSync(robots)) {
    const body = readFileSync(robots, "utf8");
    if (!body.includes(`${SITE_URL}/sitemap.xml`)) errors.push(`robots.txt sem Sitemap ${SITE_URL}/sitemap.xml`);
  }
  const sitemap = resolve(DIST, "sitemap.xml");
  if (existsSync(sitemap)) {
    const body = readFileSync(sitemap, "utf8");
    if (!body.includes(SITE_URL)) errors.push(`sitemap.xml sem URLs ${SITE_URL}`);
    if (!body.includes("/obras/golden-mall-rosario")) errors.push("sitemap.xml sem /obras/golden-mall-rosario");
  }
  const htaccess = resolve(DIST, ".htaccess");
  if (existsSync(htaccess)) {
    const body = readFileSync(htaccess, "utf8");
    if (!/RewriteCond %\{HTTPS\} off/i.test(body)) warnings.push(".htaccess sem redirect HTTP→HTTPS (generate-htaccess desatualizado?)");
  }
}

// ── Assets do CDN vendorados em __l5e ────────────────────────────────────────
const L5E_DIR = resolve(DIST, "__l5e/assets-v1");
if (!existsSync(L5E_DIR)) {
  errors.push("Pasta obrigatória ausente: dist/client/__l5e/assets-v1/ (imagens do CDN)");
} else {
  const groups = readdirSync(L5E_DIR).filter((n) => !n.startsWith("."));
  if (groups.length < 40) {
    warnings.push(`__l5e/assets-v1 com apenas ${groups.length} grupos — esperado 40+ (alguma imagem pode não ter subido)`);
  }
  let files = 0;
  for (const g of groups) {
    try {
      files += readdirSync(resolve(L5E_DIR, g)).length;
    } catch { /* ignore */ }
  }
  if (files < 40) {
    errors.push(`__l5e/assets-v1 com apenas ${files} arquivos — esperado 40+`);
  } else {
    console.log(`✓ imagens __l5e ok — ${files} arquivos em ${groups.length} grupos`);
  }
}

if (errors.length === 0) {
  console.log(
    `✓ build FTP ok — dist/client contém _shell.html, index.html e assets JS/CSS (${PRERENDER_ROUTES.length} rotas prerenderizadas, home com Golden Mall)`,
  );
  for (const warning of warnings) console.warn(`  ! ${warning}`);
  process.exit(0);
}

console.error("\n✗ Verificação do build FTP FALHOU\n");
for (const error of errors) console.error(`  - ${error}`);
console.error("\n  Rode bun run build e confira se dist/client/ contém _shell.html, index.html, assets/ e .htaccess.\n");
process.exit(1);
