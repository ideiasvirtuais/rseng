#!/usr/bin/env node
/**
 * Gera .htaccess dentro de dist/client/ para deploy manual via FTP
 * em hospedagens Apache (KingHost / Napoleon).
 *
 * Conteúdo idêntico ao gerado pelo workflow .github/workflows/lovable-deploy.yml
 * — mantenha os dois em sincronia se editar algum.
 *
 * Roda automaticamente após `bun run build` via npm `postbuild`.
 */
import { writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";

const OUT_DIR = resolve(process.cwd(), "dist/client");
const OUT_FILE = resolve(OUT_DIR, ".htaccess");

const HTACCESS = `# TanStack Start SPA hospedado em Apache (KingHost / Napoleon)
DirectoryIndex index.html _shell.html

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

writeFileSync(OUT_FILE, HTACCESS, "utf8");
console.log(`✓ .htaccess gerado em ${OUT_FILE}`);
