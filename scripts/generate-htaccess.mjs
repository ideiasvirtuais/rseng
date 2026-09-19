#!/usr/bin/env node
/**
 * Prepara dist/client/ para deploy manual via FTP em hospedagens Apache
 * (KingHost / Napoleon): garante index.html e gera .htaccess.
 *
 * Conteúdo idêntico ao gerado pelo workflow .github/workflows/lovable-deploy.yml
 * — mantenha os dois em sincronia se editar algum.
 *
 * Roda automaticamente após `bun run build` via npm `postbuild`.
 */
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";

const OUT_DIR = resolve(process.cwd(), "dist/client");
const OUT_FILE = resolve(OUT_DIR, ".htaccess");
const SHELL_FILE = resolve(OUT_DIR, "_shell.html");
const INDEX_FILE = resolve(OUT_DIR, "index.html");

const SITE_URL = (process.env.SITE_URL || "https://rsengenharia.eng.br").replace(/\/+$/, "");
const SITE_HOST = SITE_URL.replace(/^https?:\/\//, "");

const HTACCESS = `# TanStack Start SPA hospedado em Apache (KingHost / Napoleon)
# Dominio canonico: ${SITE_URL}
# index.html deve vir antes de index.php para nao cair no WordPress antigo.
DirectoryIndex index.html _shell.html index.php

# MIME moderno: Apaches antigos da KingHost servem .webp/.avif como
# application/octet-stream ou text/plain - o browser falha ao decodificar
# e a imagem "da erro de carregamento". Declaracao explicita corrige.
<IfModule mod_mime.c>
  AddType image/webp .webp
  AddType image/avif .avif
  AddType image/svg+xml .svg
  AddType font/woff2 .woff2
</IfModule>

RewriteEngine On

# -- Dominio canonico https://rsengenharia.eng.br --
# 1) HTTP -> HTTPS (preserva path + query)
RewriteCond %{HTTPS} off
RewriteRule ^ https://${SITE_HOST}%{REQUEST_URI} [R=301,L,NE]

# 2) www.rsengenharia.eng.br -> rsengenharia.eng.br (consolida SEO no apex)
RewriteCond %{HTTP_HOST} ^www\\.${SITE_HOST.replace(/\./g, "\\.")}$ [NC]
RewriteRule ^ https://${SITE_HOST}%{REQUEST_URI} [R=301,L,NE]

# NUNCA reescreva midia ausente para o _shell.html:
# sem isso, uma imagem 404 retornava HTML (text/html, status 200) e o
# browser tentava decodificar HTML como imagem -> erro silencioso de carga.
# Com a regra abaixo, midia ausente responde 404 de verdade e o
# SmartImage consegue cair para o fallback local em vez de quebrar.
RewriteRule \\.(?:png|jpe?g|webp|avif|gif|svg|ico|woff2?)$ - [R=404,L]

# SPA fallback: rotas inexistentes caem no _shell.html (exceto arquivos reais)
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ _shell.html [L]

<IfModule mod_headers.c>
  <FilesMatch "_shell\\.html$">
    Header set Cache-Control "no-cache, no-store, must-revalidate"
  </FilesMatch>
  <FilesMatch "index\\.html$">
    Header set Cache-Control "no-cache, no-store, must-revalidate"
  </FilesMatch>
  <FilesMatch "\\.(?:js|css|woff2|woff|svg|png|jpg|jpeg|webp|avif|gif|ico)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>
</IfModule>

<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType image/avif "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>

<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css application/javascript application/json image/svg+xml
</IfModule>
`;

if (!existsSync(OUT_DIR)) {
  mkdirSync(dirname(OUT_FILE), { recursive: true });
}

if (!existsSync(INDEX_FILE)) {
  if (!existsSync(SHELL_FILE)) {
    console.error("✗ Não foi possível gerar index.html: dist/client/_shell.html não existe.");
    process.exit(1);
  }
  copyFileSync(SHELL_FILE, INDEX_FILE);
  console.log(`✓ index.html gerado a partir de ${SHELL_FILE}`);
}

writeFileSync(OUT_FILE, HTACCESS, "utf8");
console.log(`✓ .htaccess gerado em ${OUT_FILE}`);
