#!/usr/bin/env node
/**
 * Empacota dist/client/ em dist/rseng-static.zip — o artefato INDEPENDENTE.
 *
 * O .zip contém exatamente o que vai para o ar: HTML prerenderizado,
 * assets com hash, imagens, _redirects/_headers/.htaccess/web.config,
 * 404.html, sitemap, robots, health.json.
 *
 * Publicação manual em qualquer hospedagem:
 *   1. `npm run package` (ou `bun run package`)
 *   2. Descompacte o .zip NA RAIZ do domínio (ou subpasta)
 *   3. Pronto — sem build no servidor, sem Node, sem banco.
 *
 * Uso:
 *   node scripts/package-static.mjs
 *   STATIC_OUT_DIR=dist/client STATIC_ZIP=dist/rseng-static.zip node scripts/package-static.mjs
 */
import { existsSync, mkdirSync, statSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { execSync } from "node:child_process";

const ROOT = process.cwd();
const OUT_DIR = resolve(ROOT, process.env.STATIC_OUT_DIR || "dist/client");
const ZIP = resolve(ROOT, process.env.STATIC_ZIP || "dist/rseng-static.zip");

if (!existsSync(OUT_DIR)) {
  console.error(`✗ Diretório não existe: ${OUT_DIR}\n  Rode \`npm run build:static\` primeiro.`);
  process.exit(1);
}
if (!existsSync(resolve(OUT_DIR, "index.html"))) {
  console.error(`✗ ${OUT_DIR}/index.html ausente — build incompleto. Rode \`npm run build:static\`.`);
  process.exit(1);
}

mkdirSync(dirname(ZIP), { recursive: true });

try {
  if (process.platform === "win32") {
    execSync(
      `powershell -NoProfile -Command "Compress-Archive -Path '${OUT_DIR}\\*' -DestinationPath '${ZIP}' -Force"`,
      { stdio: "inherit" },
    );
  } else {
    execSync(`cd "${OUT_DIR}" && zip -qr "${ZIP}" . -x "*.map"`, { stdio: "inherit" });
  }
} catch (err) {
  console.error(`✗ Falha ao compactar: ${err.message}`);
  process.exit(1);
}

const bytes = statSync(ZIP).size;
const mb = (bytes / 1024 / 1024).toFixed(2);
console.log(`\n✓ ${ZIP} (${mb} MB) — descompacte na raiz de QUALQUER hospedagem.`);

// Manifesto legível ao lado do zip
writeFileSync(
  resolve(ROOT, "dist/rseng-static.INFO.txt"),
  [
    `RS Engenharia — pacote estático universal`,
    `Gerado em: ${new Date().toISOString()}`,
    `Origem: ${OUT_DIR}`,
    `Artefato: ${ZIP} (${mb} MB)`,
    ``,
    `Como publicar (qualquer hospedagem):`,
    `  1. Descompacte o .zip na raiz do domínio (public_html, www, /www, htdocs...)`,
    `  2. Se for Apache: o .htaccess já vai junto (SPA fallback + cache + gzip)`,
    `  3. Se for Netlify/Cloudflare: _redirects + _headers já vão juntos`,
    `  4. Se for IIS: web.config já vai junto`,
    `  5. Se for Nginx/VPS: use o nginx.conf como referência`,
    `  6. Subpasta? Configure BASE_PATH/VITE_BASE_PATH no build e publique na pasta`,
    ``,
    `GitHub e KingHost são apenas DUAS opções entre muitas — veja docs/PUBLISH-ANYWHERE.md.`,
    ``,
  ].join("\n"),
  "utf8",
);
console.log("✓ dist/rseng-static.INFO.txt");
