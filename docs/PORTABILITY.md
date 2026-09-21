# Portabilidade — arquitetura do pacote independente

## Princípio

**Zero lock-in.** O site é HTML+CSS+JS estático. Nenhum servidor Node, banco,
server function ou provedor é obrigatório em produção:

- `src/lib/site-url.ts` — origem/SEO resolvidos em runtime (`window.location.origin`),
  com override opcional via `VITE_SITE_URL` / `SITE_URL`.
- `src/lib/health-static.ts` — `/health` funciona sem backend (lê `health.json`
  do build; se ausente, retorna fallback honesto — nunca tela branca).
- `scripts/generate-universal.mjs` — adaptadores para todos os hosts no mesmo build.
- `scripts/verify-static.mjs` — validação tolerante (aceita `dist/client/` ou `dist/`).
- `scripts/package-static.mjs` — artefato único `dist/rseng-static.zip`.

## O que é OPCIONAL (não exigido)

| Antes (acoplado) | Agora |
|---|---|
| Lovable (preview/publish) | Opcional — build local com `npm run build:static` não precisa de conta |
| GitHub Actions + branch `stable-website` | Opcional — workflow `static-portable.yml` publica em Pages **só se ativado** |
| KingHost FTP (`.env.ftp`, `deploy-ftp.mjs`) | Opcional — um dos 10+ destinos; `deploy:*` só roda sob demanda |
| TanStack Start server/Nitro | Desligado no build estático (`BUILD_TARGET=static` → `nitro:false`, `spa.enabled`) |
| Supabase | Opcional — health degradado nunca quebra a página |

## Variáveis de ambiente (todas opcionais)

| Var | Default | Efeito |
|---|---|---|
| `SITE_URL` / `VITE_SITE_URL` | `https://rsengenharia.eng.br` | SEO (sitemap, robots, OG). Fora do oficial, `CNAME` é omitido. |
| `BASE_PATH` / `VITE_BASE_PATH` | `/` | Publicação em subpasta. Vira `base` do Vite + prefixo de assets. |
| `STATIC_OUT_DIR` | `dist/client` | Raiz do pacote validado. |
| `STATIC_ZIP` | `dist/rseng-static.zip` | Artefato de distribuição. |
| `BUILD_TARGET=static\|ftp` | `static` | `ftp` mantém compat legada (mesmo pacote + manifest FTP). |
| `FTP_*` | — | Só usados pelos scripts `deploy:*`. Ausentes = deploy FTP apenas pulado. |

## Scripts

| Script | O que faz |
|---|---|
| `npm run build:static` | Build Vite SPA + prerender + SEO + `.htaccess` + universal + `verify-static` |
| `npm run build:ftp` | Alias legado (mesmo pacote; mantém CI KingHost funcionando) |
| `npm run verify:static` | Validação portátil do pacote |
| `npm run package` | Gera `dist/rseng-static.zip` + `INFO.txt` |
| `npm run preview:static` | Serve o pacote localmente (`vite preview` em `dist/client/`) |
| `npm run deploy:ftp` etc. | OPCIONAIS — só com credenciais FTP |
