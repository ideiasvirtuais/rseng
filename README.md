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
5. **`bun run build`** — roda `vite build` + `postbuild: node scripts/verify-prerender.mjs`
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
ls -la dist/client/   # deve conter index.html, _shell.html, assets/
```
