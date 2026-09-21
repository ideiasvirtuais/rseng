# Status de publicação — GitHub + FTP

Data: 2026-09-21 (preview aprovado pelo usuário — envio total ao GitHub)
Commit local: `7fa3da0` — "chore: publicar projeto via Code In"
Branch: `main` (com 4 arquivos modificados pendentes de push)
Build FTP: OK — `dist/client/` regenerado em 2026-09-19 (107 arquivos, 26.13 MB, prerender de 16 páginas) e validado por `preflight-ftp.mjs`.
Dry-run: OK — v2026.09.19-1 (build #12), 107 a enviar, 0 pulados — relatório em `dist/deploy-report.md`.
Pendente de push (preview OK): `src/components/Logo.tsx` (v5, wrapper transparente),
`vite.config.ts` (fix `rolldown-runtime` / tela branca no preview),
`scripts/publish-logo.mjs` (+ `LOGOMARCA-RS-1024x253.png`), `DEPLOY-STATUS.md`.

## Verificação 2026-09-21 — https://rsengenharia.eng.br/ DESATUALIZADO

Verificado em 2026-09-21 01:02 BRT (04:02 UTC):

- GitHub `origin/main`: OK — `c62c114` (2026-09-21), working tree clean, branch em dia.
- Build local `dist/client/index.html`: 67.917 bytes, bundle `assets/index-58s_7DMl.js`
  (`routes-BV-1_NZC`, `SiteFooter-C7kRl4PO`, `projects-LI29Ony5`).
- Produção ao vivo: 64.311 bytes, bundle `assets/index-D5nMMMw7.js`
  (`routes-BVCGmjac`, `SiteFooter-rGHMrWXR`), header
  `Last-Modified: Fri, 18 Sep 2026 22:31:35 GMT` (LiteSpeed).
- Conclusão: produção está ~3 dias defasada (último FTP ok: v2026.09.18-4).
  Título/meta iguais, mas JS/CSS com hashes diferentes = código antigo no ar.

Causas:

1. Workflow `lovable-deploy.yml`: push na `main` publica só em **staging**;
   produção exige `workflow_dispatch` manual com `environment: production`.
2. FTP KingHost segue com `530 Login authentication failed`
   (`ftp.rsengenharia.eng.br:21`, user `rsengenharia`, `/www`).
   Conferir usuário/senha no painel KingHost antes de qualquer retry.

Para publicar após corrigir credenciais: rode o `workflow_dispatch`
com `production` ou o deploy manual documentado abaixo.

## GitHub — SINCRONIZADO (2026-09-21)

O remote tinha um token embutido expirado (`remote: Invalid username or token`).
O token foi removido do remote (agora `https://github.com/ideiasvirtuais/rseng.git`),
mas não há credencial válida no Gerenciador de Credenciais do Windows.

Para destravar, rode (vai pedir login/token uma vez e o Windows guarda):

```powershell
git push origin main
```

Use um **Personal Access Token (classic)** com escopo `repo` como senha.
Gere em: GitHub → Settings → Developer settings → Personal access tokens.

## FTP KingHost — BLOQUEADO (530 Login authentication failed — tentativa em 2026-09-19)

Correção aplicada neste ciclo: `FTP_USER` sanitizado de `rs engenharia` → `rsengenharia`
(espaço removido; login FTP nunca tem espaço). Reteste executado:

- `node scripts/test-ftp-connection.mjs` → `530 Login authentication failed`
- `node scripts/deploy-ftp.mjs --delete` (com env de `.env.ftp`) → `530 Login authentication failed`
  como `rsengenharia@ftp.rsengenharia.eng.br:21`

Conclusão: usuário normalizado, mas servidor rejeitou usuário+senha atuais.
Problemas no `.env.ftp` (arquivo local, não versionado):

1. `FTP_USER=rs engenharia` — contém um espaço; usuário FTP nunca tem espaço.
   Tentado também como `rsengenharia` → mesmo erro 530.
2. Logo, a senha atual também foi rejeitada pelo servidor `ftp.rsengenharia.eng.br:21`.

Ação necessária: confira no painel KingHost o usuário FTP correto e redefina a senha.
Depois atualize apenas estas 2 linhas do `.env.ftp`:

```ini
FTP_USER=usuario_correto_sem_espacos
FTP_PASSWORD=nova_senha
```

E rode o deploy completo:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
npx vite build --mode ftp
node scripts/bundle-cdn-assets.mjs
node scripts/verify-images.mjs
node scripts/verify-prerender.mjs
node scripts/generate-seo.mjs
node scripts/generate-htaccess.mjs
node scripts/preflight-ftp.mjs
Get-Content .env.ftp | Where-Object { $_ -match '=' -and $_ -notmatch '^\s*#' } | ForEach-Object { $i = $_.IndexOf('='); $k = $_.Substring(0,$i).Trim(); $v = $_.Substring($i+1).Trim(); Set-Item -Path ('env:' + $k) -Value $v }
node scripts/deploy-ftp.mjs --delete
```

Simulação sem credenciais (gera relatório do que seria enviado):

```powershell
node scripts/deploy-ftp.mjs --dry-run --delete
```
