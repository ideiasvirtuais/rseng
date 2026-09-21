# Projeto independente — sem lock-in

Este repositório gera um **pacote estático autossuficiente**.
Nada aqui EXIGE GitHub, Lovable, KingHost/Napoleon, Node em produção,
banco de dados ou qualquer provedor específico.

## O que é independente

- **Build local:** `npm install && npm run build:static` — sem conta, sem CI.
- **Preview local:** `npm run portable:serve` (Node puro, sem Vite) ou
  `npm run preview:static` — valida o pacote como qualquer hospedagem vê.
- **Distribuição:** `npm run package` → `dist/rseng-static.zip` — arraste
  para cPanel, Netlify, S3, VPS, IIS, Docker…
- **Self-hosted:** `docker compose -f docker-compose.portable.yml up -d --build`.
- **Health sem backend:** `/health` + `/health.json` funcionam em host
  100% estático (fallback honesto, nunca tela branca).
- **SEO portátil:** `SITE_URL`/`BASE_PATH` via env — sem hardcode.

## O que é OPCIONAL (desligável sem quebrar o build)

| Recurso | Como é opcional | Como desligar |
|---|---|---|
| GitHub Actions + Pages | Workflow `static-portable.yml` só publica se ativado | Apague `.github/workflows/static-portable.yml` |
| Espelho `stable-website` / Lovable | Só o workflow `lovable-deploy.yml` usa | Apague `.github/workflows/lovable-deploy.yml` |
| FTP Napoleon/KingHost | Scripts `deploy:*` só rodam sob demanda com `.env.ftp` | Não crie `.env.ftp` — o build não pede credencial |
| Preview Lovable | URL em `README.md` é referência | Ignore — `npm run dev` é local |
| Supabase / Nitro / server-fn | Health degrada com fallback | Não configure — a UI segue 100% funcional |

## Do zero em 5 minutos (sem nenhuma conta)

```bash
npm install
npm run build:static
npm run portable:check
npm run portable:serve   # http://localhost:4173
```

Para publicar, escolha UMA linha em `docs/PUBLISH-ANYWHERE.md`
ou abra `/publicar` no próprio site.
