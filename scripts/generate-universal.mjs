#!/usr/bin/env node
/**
 * PORTABILIDADE MÁXIMA — pacote estático universal.
 *
 * Gera em dist/client/ (ou $STATIC_OUT_DIR) todos os adaptadores para
 * publicar o MESMO build em QUALQUER hospedagem, sem depender de
 * GitHub ou KingHost:
 *
 *  - 404.html            (SPA fallback p/ GitHub Pages, S3, cPanel, IIS...)
 *  - _redirects          (Netlify / Cloudflare Pages)
 *  - _headers            (Netlify / Cloudflare — cache + segurança)
 *  - .nojekyll           (GitHub Pages — não ignorar _assets/_shell)
 *  - web.config          (IIS / Windows Server — SPA rewrite)
 *  - nginx.conf          (snippet pronto p/ VPS / Nginx)
 *  - health.json         (build id + timestamp p/ /health estático)
 *  - manifest.webmanifest (PWA mínima — instalável offline)
 *  - .htaccess           (delegado p/ generate-htaccess.mjs, Apache/KingHost)
 *
 * Uso:
 *   node scripts/generate-universal.mjs
 *   SITE_URL=https://meudominio.com BASE_PATH=/subpasta/ node scripts/generate-universal.mjs
 *   STATIC_OUT_DIR=dist/client node scripts/generate-universal.mjs
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createHash, randomUUID } from "node:crypto";

const ROOT = process.cwd();
const OUT_DIR = resolve(ROOT, process.env.STATIC_OUT_DIR || "dist/client");
const SITE_URL = (process.env.SITE_URL || process.env.VITE_SITE_URL || "https://rsengenharia.eng.br").replace(/\/+$/, "");
const BASE_PATH = (() => {
  const raw = process.env.BASE_PATH || process.env.VITE_BASE_PATH || "/";
  const withLeading = raw.startsWith("/") ? raw : `/${raw}`;
  return withLeading.endsWith("/") ? withLeading : `${withLeading}/`;
})();
const PREFIX = BASE_PATH === "/" ? "" : BASE_PATH.replace(/\/$/, "");

mkdirSync(OUT_DIR, { recursive: true });
const log = (m) => console.log(m);

// ── 1. health.json ─────────────────────────────────────────────
const buildId = (() => {
  try {
    const pkg = JSON.parse(readFileSync(resolve(ROOT, "package.json"), "utf8"));
    return `${pkg.name ?? "rseng"}-${new Date().toISOString().slice(0, 10)}-${randomUUID().slice(0, 8)}`;
  } catch {
    return `rseng-${Date.now()}`;
  }
})();
writeFileSync(
  resolve(OUT_DIR, "health.json"),
  JSON.stringify({ ok: true, mode: "static", buildId, generatedAt: new Date().toISOString(), siteUrl: SITE_URL, basePath: BASE_PATH }, null, 2),
  "utf8",
);
log("✓ health.json");

// ── 2. 404.html (fallback SPA universal) ───────────────────────
const shell = resolve(OUT_DIR, "_shell.html");
const index = resolve(OUT_DIR, "index.html");
const notFound = resolve(OUT_DIR, "404.html");
if (!existsSync(index) && existsSync(shell)) {
  copyFileSync(shell, index);
  log("✓ index.html (copiado do prerender da rota inicial)");
}
if (!existsSync(notFound)) {
  const src = existsSync(shell) ? shell : existsSync(index) ? index : null;
  if (src) {
    copyFileSync(src, notFound);
    log(`✓ 404.html (copiado de ${src === shell ? "_shell.html" : "index.html"})`);
  } else {
    writeFileSync(notFound, `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=${PREFIX}/"><title>Redirecionando…</title></head><body><a href="${PREFIX}/">Voltar ao início</a></body></html>`, "utf8");
    log("✓ 404.html (redirect mínimo — build ainda não rodou)");
  }
} else {
  log("✓ 404.html (já existe)");
}

// ── 3. _redirects (Netlify / Cloudflare Pages) ─────────────────
writeFileSync(
  resolve(OUT_DIR, "_redirects"),
  `# Pacote estático universal — SPA fallback\n# Netlify + Cloudflare Pages. Apache/IIS usam .htaccess/web.config próprios.\n${PREFIX}/*  ${PREFIX}/index.html  200\n`,
  "utf8",
);
log("✓ _redirects");

// ── 4. _headers (cache + segurança) ────────────────────────────
writeFileSync(
  resolve(OUT_DIR, "_headers"),
  `# Cache + segurança p/ Netlify/Cloudflare Pages (espelha .htaccess do Apache)\n/index.html\n  Cache-Control: no-cache, no-store, must-revalidate\n/_shell.html\n  Cache-Control: no-cache, no-store, must-revalidate\n/404.html\n  Cache-Control: no-cache, no-store, must-revalidate\n/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n/*.js\n  Cache-Control: public, max-age=31536000, immutable\n/*.css\n  Cache-Control: public, max-age=31536000, immutable\n/*.png\n  Cache-Control: public, max-age=86400, must-revalidate\n/*.jpg\n  Cache-Control: public, max-age=86400, must-revalidate\n/*.webp\n  Cache-Control: public, max-age=86400, must-revalidate\n/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n`,
  "utf8",
);
log("✓ _headers");

// ── 5. .nojekyll (GitHub Pages) ────────────────────────────────
writeFileSync(resolve(OUT_DIR, ".nojekyll"), "", "utf8");
log("✓ .nojekyll");

// ── 6. web.config (IIS) ────────────────────────────────────────
writeFileSync(
  resolve(OUT_DIR, "web.config"),
  `<?xml version="1.0" encoding="utf-8"?>\n<configuration>\n  <system.webServer>\n    <staticContent>\n      <remove fileExtension=".webp" />\n      <mimeMap fileExtension=".webp" mimeType="image/webp" />\n      <remove fileExtension=".avif" />\n      <mimeMap fileExtension=".avif" mimeType="image/avif" />\n      <remove fileExtension=".woff2" />\n      <mimeMap fileExtension=".woff2" mimeType="font/woff2" />\n    </staticContent>\n    <rewrite>\n      <rules>\n        <rule name="SPA Fallback" stopProcessing="true">\n          <match url=".*" />\n          <conditions logicalGrouping="MatchAll">\n            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />\n            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />\n            <add input="{REQUEST_URI}" pattern="\\\\.(png|jpe?g|webp|avif|gif|svg|ico|woff2?|js|css|json|xml|txt)$" negate="true" />\n          </conditions>\n          <action type="Rewrite" url="_shell.html" />\n        </rule>\n      </rules>\n    </rewrite>\n  </system.webServer>\n</configuration>\n`,
  "utf8",
);
log("✓ web.config (IIS)");

// ── 7. nginx.conf (snippet) ────────────────────────────────────
writeFileSync(
  resolve(OUT_DIR, "nginx.conf"),
  `# Snippet Nginx — inclua no server { } do seu domínio.\n# Funciona em VPS, Coolify, Dokku, cPanel/EasyApache (via include).\nlocation / {\n  try_files $uri $uri/ /_shell.html;\n  add_header Cache-Control "no-cache, no-store, must-revalidate" always;\n}\nlocation /assets/ {\n  expires 1y;\n  add_header Cache-Control "public, immutable" always;\n}\nlocation ~* \\\\.(png|jpe?g|webp|avif|gif|svg|ico)$ {\n  expires 1d;\n  add_header Cache-Control "public, must-revalidate" always;\n}\n`,
  "utf8",
);
log("✓ nginx.conf (snippet)");

// ── 8. manifest.webmanifest ────────────────────────────────────
const manifestPath = resolve(OUT_DIR, "manifest.webmanifest");
if (!existsSync(manifestPath)) {
  writeFileSync(
    manifestPath,
    JSON.stringify({ name: "Rezende Saback Engenharia", short_name: "RS Engenharia", start_url: `${PREFIX}/`, scope: `${PREFIX}/`, display: "standalone", lang: "pt-BR", background_color: "#ffffff", theme_color: "#2E3192", icons: [{ src: `${PREFIX}/favicon.png`, sizes: "512x512", type: "image/png" }] }, null, 2),
    "utf8",
  );
  log("✓ manifest.webmanifest");
}

// ── 9. robots/sitemap/CNAME respeitam SITE_URL ─────────────────
{
  const today = new Date().toISOString().slice(0, 10);
  let routes = ["/", "/galeria", "/edificios-residenciais", "/edificios-comerciais", "/casas-de-alto-padrao", "/publicar"];
  try {
    const mod = await import("./prerender-routes.mjs");
    if (Array.isArray(mod.PRERENDER_ROUTES)) {
      routes = mod.PRERENDER_ROUTES.filter((r) => r !== "/health" && r !== "/deploy");
      if (!routes.includes("/publicar")) routes.push("/publicar");
    }
  } catch { /* mantém lista mínima */ }
  const urls = routes.map((r) => `  <url><loc>${SITE_URL}${r === "/" ? "/" : r}</loc><lastmod>${today}</lastmod></url>`).join("\n");
  writeFileSync(resolve(OUT_DIR, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`, "utf8");
  writeFileSync(resolve(OUT_DIR, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`, "utf8");
  const host = SITE_URL.replace(/^https?:\/\//, "");
  const isDefaultHost = host === "rsengenharia.eng.br";
  // CNAME só faz sentido no domínio oficial/GitHub Pages espelho — em host
  // genérico ele quebraria o deploy. Gera apenas quando SITE_URL é o oficial.
  if (isDefaultHost) {
    writeFileSync(resolve(OUT_DIR, "CNAME"), `${host}\n`, "utf8");
    log("✓ sitemap.xml + robots.txt + CNAME");
  } else {
    log(`✓ sitemap.xml + robots.txt (${SITE_URL} — CNAME omitido fora do domínio oficial)`);
  }
}

// ── 10. SHA-256 do pacote (auditoria) ──────────────────────────
{
  const { readdirSync, statSync } = await import("node:fs");
  const { join, relative } = await import("node:path");
  const files = [];
  const walk = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const abs = join(dir, e.name);
      if (e.isDirectory()) walk(abs);
      else if (e.isFile() && !e.name.endsWith(".map")) files.push(abs);
    }
  };
  walk(OUT_DIR);
  const hash = createHash("sha256");
  files.sort();
  for (const f of files) {
    hash.update(relative(OUT_DIR, f));
    hash.update(String(statSync(f).size));
  }
  writeFileSync(resolve(OUT_DIR, "package.sha256.txt"), `${hash.digest("hex")}  universal-package  (${files.length} arquivos, ${new Date().toISOString()})\n`, "utf8");
  log(`✓ package.sha256.txt (${files.length} arquivos)`);
}

console.log(`\n✓ Pacote universal pronto em ${OUT_DIR} — publicável em QUALQUER hospedagem estática.`);
