# Status de publicação — GitHub + FTP

## Remoção 2026-09-21 — menu "Todas as imagens" removido + push GitHub

- **Solicitação do cliente:** "este menu - todas as imagens não tem que existir"
  + "enviar a última atualização pro GitHub ou por FTP pra ficar certo".
- **Alteração aplicada neste ciclo (código):**
  1. `src/components/SiteHeader.tsx` — item `{ href: "/galeria", label: "Todas as imagens" }`
     removido do array `hashLinks` (vale para header desktop E mobile). Menu agora:
     Início, Residenciais, Comerciais, Casas, Lançamento (pill), Sobre, Contato.
  2. `src/routes/index.tsx` — CTA "Abrir galeria completa" (/galeria) removido da home.
  3. `src/components/HomeGallery.tsx` — CTA "Carregar todas as imagens" (/galeria)
     removido + imports mortos (`Link`, `ArrowUpRight`) limpos.
  4. Rota `/galeria` (`src/routes/galeria.tsx` + `AllImagesGallery.tsx`) PRESERVADA
     sem nenhum link na UI — acesso só via URL direta, sem 404 em bots/URLs antigas.
- **Publicação:** `git add -A + commit + git push origin main` neste ciclo.
  O push na `main` dispara `.github/workflows/lovable-deploy.yml` (production),
  que faz build + FTP automaticamente. FTP manual continua bloqueado até as
  credenciais KingHost (`FTP_USER`/`FTP_PASSWORD`) serem corrigidas — servidor
  retorna `530 Login authentication failed`.

## Resposta 2026-09-21 — "publicou github? ou ftp" — NÃO, ambos pendentes

- **GitHub (`origin/main`): NÃO publicado o estado atual.** `HEAD` = `a5a0ad9`
  em dia com `origin/main` (`rev-list 0 0`), porém working tree sujo:
  19 arquivos modificados + 33 não rastreados (inclui `public/instagram-rs.jpg`
  renomeado, `Logo.tsx`, `images.ts`, `vite.config.ts`, rota `publicar.tsx`,
  `vercel.json`/`netlify.toml`). Precisa `git add -A + commit + git push origin main`.
- **FTP KingHost (`ftp.rsengenharia.eng.br/www`): NÃO publicado.**
  Último envio OK foi `v2026.09.18-4` (18/09). Produção segue no bundle
  `index-D5nMMMw7.js` de 18/09. Tentativas atuais retornam
  `530 Login authentication failed`. Precisa corrigir `FTP_USER`/`FTP_PASSWORD`
  no painel KingHost + Secrets e rodar `deploy-ftp.mjs --delete`.
- **Como publicar (após credenciais):** `git push origin main` dispara
  `.github/workflows/lovable-deploy.yml` (push na main = production) que faz
  build + FTP automaticamente.

## Verificação 2026-09-21 — instabilidade logo/imagens + atualização não efetivada (causas-raiz corrigidas no código)

Diagnóstico deste ciclo (build local Windows OK × produção CI Linux 404):

1. `public/instagram-rs.JPG` (extensão UPPERCASE) × código pedindo
   `/instagram-rs.jpg` (lowercase) em `HomeInstagram.tsx` e `all-images.ts`.
   No Windows/dev resolve; no Apache/Linux (build do CI) dá 404 e o
   SmartImage cai para placeholder — parecia "imagem instável".
   Correção: `git mv public/instagram-rs.JPG → public/instagram-rs.jpg`
   (canônico lowercase) + `instagram-rs.jpg` no REQUIRED do
   `verify-images.mjs` + guarda que falha se `.JPG/.JPEG/.PNG` ressurgir.
2. Cadeia da logo pedia `/logomarca-rs-1024x253.png` (lowercase) via
   `public/`, mas esse arquivo NÃO existe em disco (só
   `public/LOGOMARCA-RS-1024x253.png` UPPERCASE; repo Windows com
   `core.ignorecase=true` nem permite as duas casas no git). 404 garantido
   por page-view no Linux + warm desnecessário. Correção: removido o alias
   fantasma de `logoChain()`/`LOGO_CHAIN` (`src/lib/images.ts`), do
   `warmCriticalImage` (`src/routes/__root.tsx`) e atualizado o docblock da
   `Logo.tsx` (v8). Cadeia agora: bundle hash → UPPERCASE → legada →
   vendorada `__l5e` → SVG inline.
3. `.htaccess` marcava TODA imagem como `immutable 1 ano`, mas arquivos de
   `public/` (logo, hero, instagram, og-cover, favicons) NÃO têm hash no
   nome — visitante travava na logo/hero antiga ("atualização não
   efetivada"). Correção (`scripts/generate-htaccess.mjs` + `dist/`):
   `immutable 1 ano` só para `js/css/woff`; imagens passam a
   `max-age=86400, must-revalidate`. HTML segue `no-cache`.
4. Remote git continha token expirado embutido
   (`https://x-access-token:gho_…@github.com/…`) → `git ls-remote/push`
   falhava com `Invalid username or token`, o workflow nunca rodava e a
   produção ficava congelada no bundle de 18/09. Correção: remote saneado
   para `https://github.com/ideiasvirtuais/rseng.git` (sem segredo).
   Credencial nunca mais deve ir para a URL do remote.
5. `ROOT_ALLOWLIST` do `deploy-ftp.mjs` agora inclui `instagram-rs.jpg` e o
   fantasma `instagram-rs.JPG` (limpeza com `--delete` remove o obsoleto).

Validado neste ciclo: `tsc --noEmit` limpo, `verify-images.mjs` OK (8/8
public, 46/46 vendorados, 13/13 vite), `.htaccess` regenerado,
`preflight-ftp.mjs` OK.

Pendente (fora do alcance do código — exige ação manual):

1. `git push origin main` (vai pedir login + Personal Access Token com
   escopo `repo`; o Windows guarda depois) — dispara o workflow, que agora
   publica em produção automaticamente.
2. Credenciais FTP KingHost válidas nos Secrets do GitHub (`FTP_HOST`,
   `FTP_USER`, `FTP_PASSWORD`, …). Servidor ainda retorna `530 Login
   authentication failed`; sem isso nem CI nem deploy manual enviam.

## Verificação 2026-09-21 — https://rsengenharia.eng.br/ AINDA DESATUALIZADO (causa-raiz corrigida)

Verificado em 2026-09-21 (novo build local + `verify-live.mjs`):

- Build local regenerado: `dist/client/index.html` 68.031 bytes, bundle
  `assets/index-YpALiY5q.js` — 16 páginas prerenderizadas, preflight FTP OK.
- Produção ao vivo: 64.311 bytes, bundle `assets/index-D5nMMMw7.js`,
  `Last-Modified: Fri, 18 Sep 2026 22:31:35 GMT` (LiteSpeed).
- Conclusão: produção segue servindo o bundle de 18/09. O código local está
  pronto; falta apenas o deploy chegar ao FTP.

Correção aplicada neste ciclo (por que "não atualizou"):

1. Workflow `.github/workflows/lovable-deploy.yml`: push na `main` publicava
   só em **staging**; produção exigia `workflow_dispatch` manual. Alterado:
   push na `main` agora publica em **production** (staging segue via manual).
   O espelho `stable-website` também passa a rodar no push.
2. `scripts/verify-live.mjs`: mensagem de diagnóstico atualizada para a nova
   regra do workflow.
3. Build FTP regenerado do zero e validado (`bundle-cdn-assets`,
   `verify-images`, `verify-prerender`, `generate-seo`, `generate-htaccess`,
   `preflight-ftp` — tudo OK).

Para atualizar o site, falta APENAS (fora do alcance do código):

1. `git push origin main` — dispara o workflow, que agora faz build + deploy
   em produção automaticamente.
2. Credenciais FTP KingHost válidas nos Secrets do GitHub (`FTP_HOST`,
   `FTP_USER`, `FTP_PASSWORD`, ...). O servidor ainda retorna
   `530 Login authentication failed` — confira usuário/senha no painel
   KingHost e atualize os Secrets; sem isso nem o CI nem o deploy manual
   conseguem enviar.

## Histórico anterior (2026-09-21 01:02 BRT)

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
