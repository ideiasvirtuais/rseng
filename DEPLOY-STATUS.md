# Status de publicação — GitHub + FTP

Data: 2026-09-19
Commit local: `83aff84` — "feat: galeria completa, Logo desacoplado, SEO/canonical e pipeline FTP estavel"
Branch: `main` (1 commit à frente de `origin/main`)
Build FTP: OK — `dist/client/` gerado (105 arquivos, prerender de 13 rotas + `/galeria`) e validado por `preflight-ftp.mjs`.

## GitHub — BLOQUEADO (token expirado)

O remote tinha um token embutido expirado (`remote: Invalid username or token`).
O token foi removido do remote (agora `https://github.com/ideiasvirtuais/rseng.git`),
mas não há credencial válida no Gerenciador de Credenciais do Windows.

Para destravar, rode (vai pedir login/token uma vez e o Windows guarda):

```powershell
git push origin main
```

Use um **Personal Access Token (classic)** com escopo `repo` como senha.
Gere em: GitHub → Settings → Developer settings → Personal access tokens.

## FTP KingHost — BLOQUEADO (530 Login authentication failed)

Problemas encontrados no `.env.ftp` (arquivo local, não versionado):

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
