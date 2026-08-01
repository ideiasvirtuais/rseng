# RS Engenharia — Site institucional

Site em TanStack Start (SPA mode com prerender via Vite) hospedado na **KingHost** através da **Ideias Virtuais**, com deploy automático a partir do GitHub Actions para a branch `stable-website`.

- **Domínio:** https://rsengenharia.eng.br/
- **DNS:** `ns1.ideiasvirtuais.blog.br`
- **Preview Lovable:** https://id-preview--26dd9025-0687-4cac-b168-992e9f045114.lovable.app
- **Published Lovable:** https://rseng.lovable.app

---

## Deploy: como o workflow funciona

Arquivo: `.github/workflows/lovable-deploy.yml`

Fluxo em ordem:

1. **Checkout do repositório**
2. **Setup Node 22** — versão exigida pelas versões beta do TanStack/Vite
3. **Setup Bun (latest)** — o projeto usa `bun.lock`; `npm install` falha por conflitos de peer deps
4. **`bun install --frozen-lockfile`**
5. **`bun run build:ftp`** — roda `vite build --mode ftp` + `postbuild:ftp`
6. **Localizar shell do TanStack Start** — descobre onde está o `_shell.html`
7. **Validar artefatos do build** — abortar cedo se algo essencial faltar
8. **Gerar `.htaccess`** — `DirectoryIndex`, SPA fallback, cache e gzip para Apache/KingHost
9. **Deploy para a branch `stable-website`** via `JamesIves/github-pages-deploy-action`

A KingHost puxa automaticamente da branch `stable-website`.

---

## Estrutura esperada de `dist/`

O workflow aceita **duas** estruturas possíveis (o TanStack Start pode emitir em qualquer uma delas dependendo da versão do plugin):

### Layout A — `dist/client/` (mais comum nas versões recentes)

```text
dist/
└── client/
    ├── _shell.html          ← shell SPA (fallback para rotas dinâmicas)
    ├── index.html           ← home prerendered
    ├── obras/
    │   └── <slug>/index.html
    ├── assets/
    │   ├── *.js             ← bundles JS com hash
    │   └── *.css            ← estilos com hash
    └── favicon.ico, robots.txt, etc.
```

### Layout B — `dist/` (raiz)

```text
dist/
├── _shell.html
├── index.html
├── assets/
│   ├── *.js
│   └── *.css
└── ...
```

O workflow procura `_shell.html` primeiro em `dist/client/`, depois em `dist/`, e usa o diretório encontrado como `deploy_dir`.

---

## O que a etapa "Validar artefatos do build" checa

| Item | Obrigatório? | Motivo |
|---|---|---|
| `index.html` | Sim | Página inicial prerendered — sem ela, a raiz do domínio não abre |
| `assets/` (pasta) | Sim | Contém os bundles JS/CSS gerados pelo Vite |
| Pelo menos 1 arquivo `.js` em `assets/` | Sim | Se não há JS, o Vite quebrou silenciosamente |
| `_shell.html` não-vazio | Opcional, mas se existir precisa ter conteúdo | É o SPA fallback; vazio serve página em branco |
| `index.html` referencia `assets/` | Warning | Sem essa referência os bundles não carregam |

---

## Guia de mensagens de erro

### ✅ Sucesso

```
✓ index.html (página inicial prerendered)
✓ assets (bundle JS/CSS gerado pelo Vite)
✓ _shell.html presente e não-vazio (SPA fallback)
✅ Todos os artefatos essenciais estão presentes. Pronto para deploy.
```

Tudo certo — o deploy segue.

---

### ❌ `_shell.html não encontrado`

> O build terminou mas não gerou o shell SPA do TanStack Start.

**Causas mais prováveis:**

1. **SPA mode desligado em `vite.config.ts`.**  
   Confirme:
   ```ts
   tanstackStart({ spa: { enabled: true, prerender: { enabled: true } } })
   ```
2. **O build falhou antes de emitir o cliente.**  
   Revise as linhas acima do step "Rodar Build" procurando `error` ou `ELIFECYCLE`. Frequentemente é o `postbuild` (`scripts/verify-prerender.mjs`) que aborta.
3. **Estrutura de saída mudou** (ex.: `dist/spa`, `dist/static`).  
   Rode `bun run build` localmente, veja onde o `_shell.html` foi parar e ajuste o step "Localizar shell".

O log inclui um `find . -name '_shell.html'` para ajudar a localizar.

---

### ❌ `Diretório de deploy inválido`

> `'<caminho>' não existe ou não foi definido pelo step anterior.

O step "Localizar shell" não conseguiu setar `deploy_dir`. Normalmente significa que o build falhou antes. Verifique o step 5 (Rodar Build).

---

### ❌ `Arquivo obrigatório ausente: index.html`

O prerender da home não rodou. Causas comuns:

- `src/routes/index.tsx` foi apagado ou está com erro
- `postbuild` (`verify-prerender.mjs`) abortou antes de gerar o `index.html`
- Prerender desligado em `vite.config.ts`

---

### ❌ `Arquivo obrigatório ausente: assets`

Vite não emitiu a pasta de bundles. Provavelmente erro de build/transform. Rode localmente:

```bash
bun run build
ls -la dist/client/assets  # ou dist/assets
```

---

### ❌ `Nenhum JS em assets/`

> O build não gerou nenhum bundle JavaScript — algo quebrou no Vite.

Import quebrado, erro de TypeScript strict, ou dependência faltando. Rode `bun run build` localmente para ver o erro real.

---

### ❌ `_shell.html vazio`

> O shell SPA existe mas está vazio — o SPA fallback vai servir uma página em branco.

Bug no plugin do TanStack Start ou build interrompido no meio. Delete `dist/` e refaça `bun run build`.

---

### ⚠️ `index.html sem referência a assets`

Warning (não aborta). A página inicial foi gerada mas não carrega nenhum bundle — o HTML pode aparecer sem estilo/JS. Verifique se o Vite emitiu links `<script>` e `<link>` corretos no HTML final.

---

## `.htaccess` gerado

O workflow escreve este `.htaccess` dentro do `deploy_dir` para funcionar no Apache da KingHost:

- `DirectoryIndex index.html _shell.html` — prioriza a home prerendered, cai no shell SPA se não houver
- **SPA fallback** — rotas que não batem em arquivo/pasta caem em `_shell.html`
- **Cache** — `no-cache` para `_shell.html`, `max-age=1 ano` para JS/CSS/fontes/imagens
- **Gzip** para HTML, CSS, JS, JSON e SVG

---

## Rodando localmente

```bash
bun install
bun run dev           # servidor de desenvolvimento
bun run build         # build de produção (mesmo comando que o CI roda)
bun run preview       # servir o build localmente
```

Para simular o que o CI vê:

```bash
bun run build
ls -la dist/client/   # deve conter index.html, _shell.html, assets/, .htaccess
```

---

## Build e deploy manual via FTP

### `bun run build`

Gera o build padrão para publicação pelo Lovable. Use este comando para validar o canal `.lovable.app`.

### `bun run build:ftp`

Gera o build estático para FTP/Apache em `dist/client/`. Executa em ordem:

1. `vite build --mode ftp` — compila a aplicação em SPA mode e prerenderiza as rotas
2. `postbuild:ftp` (automático):
   - `scripts/verify-prerender.mjs` — valida que todas as páginas esperadas foram geradas
   - `scripts/generate-htaccess.mjs` — **cria o `.htaccess`** em `dist/client/.htaccess` com regras de SPA fallback, cache e gzip para o Apache da KingHost

Resultado esperado em `dist/client/`:

```text
dist/client/
├── .htaccess          ← gerado pelo postbuild (regras Apache)
├── _shell.html        ← SPA fallback
├── index.html         ← home prerendered
├── obras/<slug>/index.html
├── assets/*.js|css
└── favicon.ico, robots.txt, ...
```

Depois do build, os comandos disponíveis são:

```bash
bun run verify:ftp        # confere se dist/client/ está pronto (shell, htaccess, assets)
bun run deploy:ftp        # envia dist/client/ via FTP (usa .env.ftp)
bun run deploy:ftp:full   # build + deploy em um único comando
```

O log detalhado do upload (arquivos enviados e falhas destacadas) fica em `dist/deploy-ftp.log`.

### Onde encontrar o `.htaccess`

Sempre em **`dist/client/.htaccess`** após qualquer `bun run build` ou `bun run build:ftp`. Ele deve ser enviado para a **raiz do domínio** (mesmo diretório do `index.html`) — o `deploy:ftp` já faz isso automaticamente. No envio manual pelo cliente FTP, habilite a exibição de arquivos ocultos (começando com `.`) para não esquecê-lo.

---

## Ambientes: staging e produção

O mesmo build (`dist/client/`) pode ser publicado em dois destinos FTP distintos:

| Ambiente | Comando | Destino padrão | Manifesto / relatórios |
|---|---|---|---|
| **Staging** | `bun run deploy:staging` | `/www/staging` | `.deploy-manifest-staging.json`, `dist/deploy-report-staging.md`, `CHANGELOG-DEPLOY-STAGING.md` |
| **Produção** | `bun run deploy:prod` | `/www` | `.deploy-manifest.json`, `dist/deploy-report.md`, `CHANGELOG-DEPLOY.md` |

```bash
bun run deploy:staging:full            # build + envio para staging
bun run deploy:staging -- --dry-run    # simula o envio para staging
bun run deploy:prod -- --delete        # publica em produção e limpa obsoletos
```

Como cada ambiente tem manifesto próprio, um deploy de staging **nunca** invalida o cache de checksum da produção.

Staging recebe automaticamente `robots.txt` com `Disallow: /` e o cabeçalho `X-Robots-Tag: noindex` no `.htaccess`, evitando indexação pelo Google. O deploy de produção reverte ambos.

### Credenciais por ambiente

Ordem de resolução (a primeira que existir vence):

1. Variáveis com prefixo: `STAGING_FTP_*` / `PROD_FTP_*`
2. Arquivo `.env.ftp.staging` ou `.env.ftp.production`
3. Arquivo `.env.ftp` compartilhado / variáveis `FTP_*` já exportadas

Se o servidor de staging for o mesmo da produção, basta definir `STAGING_FTP_REMOTE_DIR=/www/staging` (ou nem isso — é o default).

### No GitHub Actions

- **Push na `main`** → deploy automático em **staging**
- **Run workflow (manual)** → escolha `staging` ou `production` no dropdown

O espelho na branch `stable-website` só é atualizado em deploys de produção.
