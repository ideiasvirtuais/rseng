# Adaptadores de hospedagem — um pacote, todos os destinos

O build (`npm run build:static`) gera em `dist/client/` os adaptadores
abaixo. O **mesmo .zip** (`dist/rseng-static.zip`) sobe em qualquer lugar —
GitHub e FTP Napoleon são **apenas 2 das 10 opções**.

| Arquivo nesta pasta / no pacote | Host | O que faz |
|---|---|---|
| `.htaccess` (gerado) | Apache / cPanel / KingHost | SPA fallback + cache + gzip |
| `hosting/nginx.conf` | VPS / Nginx | `try_files … /_shell.html` + cache |
| `hosting/docker-nginx.conf` | Docker (`Dockerfile`) | Config da imagem independente |
| `_redirects` + `_headers` | Netlify / Cloudflare Pages | SPA 200 + cache/segurança |
| `web.config` | IIS / Windows | Rewrite p/ `_shell.html` |
| `.nojekyll` + `404.html` | GitHub Pages (OPCIONAL) | Bypass Jekyll + fallback |
| `hosting/cloudflare-pages.json` | Cloudflare Pages | Nota de build/output |
| `hosting/cpanel-NOTA.txt` | cPanel genérico | Onde descompactar o .zip |
| `netlify.toml` / `vercel.json` (raiz) | Netlify / Vercel | Build + redirects declarativos |

Subpasta (`BASE_PATH=/pasta/`) e domínio próprio (`SITE_URL=`) funcionam
em todos os destinos sem trocar código — veja `docs/PUBLISH-ANYWHERE.md`.
