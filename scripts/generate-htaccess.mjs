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

const HTACCESS = `# TanStack Start SPA hospedado em Apache (KingHost / Napoleon)
# index.html deve vir antes de index.php para não cair no WordPress antigo.
DirectoryIndex index.html _shell.html index.php

RewriteEngine On

# SPA fallback: rotas inexistentes caem no _shell.html
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
  <FilesMatch "\\.(?:js|css|woff2|woff|svg|png|jpg|jpeg|webp|gif|ico)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>
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
