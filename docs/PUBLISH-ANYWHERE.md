# Publicar em QUALQUER hospedagem — guia de 5 minutos

O build gera um **pacote estático independente** (`dist/client/` + `dist/rseng-static.zip`).
GitHub e KingHost são apenas **duas opções** — o mesmo .zip sobe em qualquer lugar.

## 1. Gerar o pacote

```bash
npm install
npm run build:static   # build + SEO + .htaccess + adaptadores universais + validação
npm run package        # gera dist/rseng-static.zip
```

Resultado:

```text
dist/client/
├── index.html            ← home prerenderizada (SEO)
├── 404.html              ← fallback SPA (GitHub Pages, S3, IIS...)
├── _shell.html           ← fallback SPA (Apache/Nginx)
├── _redirects            ← Netlify / Cloudflare Pages
├── _headers              ← cache + segurança (Netlify/Cloudflare)
├── .htaccess             ← Apache (KingHost, cPanel, HostGator...)
├── web.config            ← IIS / Windows Server
├── nginx.conf            ← snippet p/ VPS
├── .nojekyll             ← GitHub Pages
├── robots.txt / sitemap.xml / health.json / manifest.webmanifest
└── assets/*.js|css       ← bundles com hash
```

## 2. Publicar — escolha UMA opção

| Hospedagem | Como |
|---|---|
| **Qualquer cPanel** (HostGator, Hostinger, Locaweb, KingHost...) | Descompacte o .zip em `public_html/` (ou subpasta). O `.htaccess` já vai junto. |
| **KingHost (FTP)** — opcional | `npm run deploy:ftp:full` (usa `.env.ftp`; veja `.env.ftp.example`) |
| **Netlify** | Arraste `dist/client/` no dashboard **ou** `netlify deploy --dir dist/client --prod` |
| **Cloudflare Pages** | `npx wrangler pages deploy dist/client` |
| **Vercel** | `npx vercel --prod` com `outputDirectory: dist/client` (ou arraste a pasta) |
| **GitHub Pages** — opcional | Push na `main` com o workflow `static-portable.yml` ativo (usa `.nojekyll` + `404.html`) |
| **S3 + CloudFront** | `aws s3 sync dist/client/ s3://bucket --delete` + error document = `/404.html` |
| **VPS / Nginx** | Copie via `rsync` e aplique `hosting/nginx.conf` |
| **IIS** | Copie a pasta; o `web.config` já resolve o SPA fallback |
| **Preview local** | `npm run preview:static` (serve `dist/client/` em http://localhost:4173) |

## 3. Domínio próprio / subpasta

```bash
# Domínio próprio (SEO canônico acompanha)
SITE_URL=https://meudominio.com npm run build:static

# Subpasta (ex: meudominio.com/minha-pasta/ ou user.github.io/repo/)
BASE_PATH=/minha-pasta/ VITE_BASE_PATH=/minha-pasta/ npm run build:static
```

## 4. Checklist pós-deploy

- [ ] `/` abre com layout completo (sem tela branca)
- [ ] `/obras/golden-mall-rosario` abre direto (testa o SPA fallback)
- [ ] URL inexistente cai no layout 404 (não erro do servidor)
- [ ] `robots.txt` e `sitemap.xml` acessíveis
- [ ] `/health.json` retorna `{"ok":true,"mode":"static"}`
