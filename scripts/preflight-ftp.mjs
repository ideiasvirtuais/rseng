#!/usr/bin/env node
/**
 * Preflight check: valida se dist/client/ está pronto para upload via FTP.
 * Roda automaticamente antes de `bun run deploy:ftp` (script `predeploy:ftp`)
 * e no CI (`bun run verify:ftp`).
 *
 * Confere:
 *   - dist/client/_shell.html (não vazio)
 *   - dist/client/index.html (não vazio, referencia assets/, contém Golden Mall)
 *   - todas as rotas de scripts/prerender-routes.mjs prerenderizadas
 *   - dist/client/.htaccess (com RewriteRule e DirectoryIndex)
 *   - dist/client/assets/ com pelo menos 1 .js e 1 .css
 *   - dist/client/favicon.png
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { resolve, join } from "node:path";
import { PRERENDER_ROUTES } from "./prerender-routes.mjs";

const DIST = resolve(process.cwd(), "dist/client");
const MIN_HTML = 500;

const errors = [];
const warnings = [];

function must(path, label) {
  const full = join(DIST, path);
  if (!existsSync(full)) {
    errors.push(`Ausente: ${path} (${label})`);
    return null;
  }
  return full;
}

if (!existsSync(DIST)) {
  console.error(`\n✗ dist/client/ não existe. Rode \`bun run build\` primeiro.\n`);
  process.exit(1);
}

const shell = must("_shell.html", "SPA fallback do TanStack Start");
if (shell && statSync(shell).size < MIN_HTML) {
  errors.push(`_shell.html suspeito (${statSync(shell).size} bytes < ${MIN_HTML})`);
}

const index = must("index.html", "página inicial servida pelo Apache");
if (index) {
  const size = statSync(index).size;
  if (size < MIN_HTML) errors.push(`index.html suspeito (${size} bytes < ${MIN_HTML})`);
  const html = readFileSync(index, "utf8");
  if (!/\/assets\//.test(html)) warnings.push("index.html não referencia /assets/ (bundle pode não carregar)");
  if (!html.includes("Golden Mall")) {
    errors.push("index.html sem 'Golden Mall' — home desatualizada; regenere com `bun run build:ftp`");
  }
}

for (const route of PRERENDER_ROUTES) {
  const rel = route === "/" ? "index.html" : `${route.replace(/^\//, "")}/index.html`;
  const full = join(DIST, rel);
  if (!existsSync(full)) {
    errors.push(`Rota não prerenderizada: ${route} (esperado ${rel})`);
  } else if (statSync(full).size < MIN_HTML) {
    errors.push(`HTML suspeito em ${route} (${statSync(full).size} bytes < ${MIN_HTML})`);
  }
}

const htaccess = must(".htaccess", "regras de reescrita para Apache/KingHost");
if (htaccess) {
  const body = readFileSync(htaccess, "utf8");
  if (!/RewriteRule\s+\^\s+_shell\.html/i.test(body)) errors.push(".htaccess sem SPA fallback (RewriteRule ^ _shell.html)");
  if (!/DirectoryIndex/i.test(body)) errors.push(".htaccess sem diretiva DirectoryIndex");
  if (!/index\.html/.test(body.split("\n").find((l) => /DirectoryIndex/i.test(l)) ?? "")) {
    warnings.push("DirectoryIndex não prioriza index.html — Apache pode cair em index.php do WordPress antigo");
  }
  if (!/AddType\s+image\/webp/i.test(body)) {
    errors.push(".htaccess sem AddType image/webp — regenere com `node scripts/generate-htaccess.mjs` (webp quebra no Apache antigo)");
  }
  if (!/R=404/.test(body)) {
    errors.push(".htaccess sem regra R=404 para mídia — imagem ausente voltaria como _shell.html e 'daria erro de carregamento'");
  }
  const mediaRuleIndex = body.indexOf("RewriteRule \\\\.(?:png|jpe?g|webp|avif|gif|svg|ico|woff2?)$ - [R=404,L]");
  const mediaRulePrefix = mediaRuleIndex >= 0 ? body.slice(Math.max(0, mediaRuleIndex - 100), mediaRuleIndex) : "";
  if (mediaRuleIndex < 0 || !/RewriteCond %\{REQUEST_FILENAME\} !-f\s*$/m.test(mediaRulePrefix)) {
    errors.push(".htaccess bloqueia imagens existentes — falta a condição !-f antes da regra R=404 de mídia");
  }
}

const assetsDir = must("assets", "bundles JS/CSS gerados pelo Vite");
if (assetsDir) {
  const files = readdirSync(assetsDir);
  const jsCount = files.filter((f) => f.endsWith(".js")).length;
  const cssCount = files.filter((f) => f.endsWith(".css")).length;
  if (jsCount === 0) errors.push("assets/ não contém nenhum bundle .js");
  if (cssCount === 0) errors.push("assets/ não contém nenhum bundle .css");
  console.log(`  · assets/: ${jsCount} .js, ${cssCount} .css`);
}

must("favicon.png", "ícone do site");

// ── Sincronização com https://rsengenharia.eng.br ──
const SITE_URL = (process.env.SITE_URL || "https://rsengenharia.eng.br").replace(/\/+$/, "");
const robotsFile = must("robots.txt", "robots.txt canônico do domínio");
if (robotsFile) {
  const body = readFileSync(robotsFile, "utf8");
  if (!body.includes("Allow: /")) errors.push("robots.txt sem 'Allow: /' — regenere com `node scripts/generate-seo.mjs`");
  if (!body.includes(`${SITE_URL}/sitemap.xml`)) errors.push(`robots.txt sem Sitemap ${SITE_URL}/sitemap.xml — regenere com generate-seo`);
}
const sitemapFile = must("sitemap.xml", "sitemap.xml do domínio");
if (sitemapFile) {
  const body = readFileSync(sitemapFile, "utf8");
  if (!body.includes(SITE_URL)) errors.push(`sitemap.xml sem URLs ${SITE_URL} — regenere com generate-seo`);
  if (!body.includes("/obras/golden-mall-rosario")) warnings.push("sitemap.xml sem Golden Mall — confira scripts/prerender-routes.mjs");
}
const cnameFile = join(DIST, "CNAME");
if (!existsSync(cnameFile)) {
  warnings.push("CNAME ausente em dist/client/ — regenere com `node scripts/generate-seo.mjs` (rsengenharia.eng.br)");
} else {
  const cname = readFileSync(cnameFile, "utf8").trim();
  if (cname !== "rsengenharia.eng.br") warnings.push(`CNAME inesperado ("${cname}") — esperado rsengenharia.eng.br`);
}
if (htaccess) {
  const body = readFileSync(htaccess, "utf8");
  if (!/RewriteCond %\{HTTPS\} off/i.test(body)) errors.push(".htaccess sem redirect HTTP→HTTPS — regenere com generate-htaccess");
  if (!/www/i.test(body) || !/R=301/i.test(body)) warnings.push(".htaccess sem redirect www→apex 301 — confira generate-htaccess");
}

if (errors.length) {
  console.error("\n✗ dist/client/ NÃO está pronto para upload:\n");
  for (const e of errors) console.error(`  - ${e}`);
  if (warnings.length) {
    console.error("\n  Avisos:");
    for (const w of warnings) console.error(`    · ${w}`);
  }
  console.error("\n  Rode `bun run build` novamente para regenerar o pacote.\n");
  process.exit(1);
}

console.log("✓ dist/client/ pronto para upload FTP");
if (warnings.length) {
  console.log("\n  Avisos (não bloqueiam):");
  for (const w of warnings) console.log(`    · ${w}`);
}
