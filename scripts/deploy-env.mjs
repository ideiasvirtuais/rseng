#!/usr/bin/env node
/**
 * Wrapper de ambiente para o deploy FTP.
 *
 * Permite publicar o MESMO build em dois destinos:
 *
 *   staging     → área de testes (default: <FTP_REMOTE_DIR>/staging)
 *   production  → domínio final (default: /www)
 *
 * Uso:
 *   bun run deploy:staging                 # envia dist/client para staging
 *   bun run deploy:staging -- --dry-run
 *   bun run deploy:prod                    # envia para produção
 *   bun run deploy:prod -- --delete
 *
 * Como as credenciais são resolvidas (a primeira que existir vence):
 *   1. Variáveis já presentes no ambiente com prefixo do alvo:
 *        STAGING_FTP_HOST / STAGING_FTP_USER / STAGING_FTP_PASSWORD / STAGING_FTP_REMOTE_DIR
 *        PROD_FTP_HOST    / PROD_FTP_USER    / PROD_FTP_PASSWORD    / PROD_FTP_REMOTE_DIR
 *   2. Arquivo `.env.ftp.<alvo>` (ex.: .env.ftp.staging)
 *   3. Arquivo `.env.ftp` (compartilhado) e variáveis FTP_* já exportadas
 *
 * Cada alvo usa seu próprio manifesto de checksum, log, relatório e changelog,
 * então um deploy de staging nunca invalida o cache do deploy de produção.
 *
 * Staging recebe automaticamente robots.txt `Disallow: /` e cabeçalho
 * `X-Robots-Tag: noindex` no .htaccess para não ser indexado pelo Google.
 */
import { existsSync, readFileSync, writeFileSync, appendFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const ROOT = process.cwd();

// ── alvo ─────────────────────────────────────────────────────────────────────
function argValue(name) {
  const eq = process.argv.find((a) => a.startsWith(`--${name}=`));
  if (eq) return eq.slice(name.length + 3);
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 ? process.argv[i + 1] : undefined;
}

const raw = (argValue("env") ?? process.env.DEPLOY_ENV ?? "production").toLowerCase();
const TARGET = ["staging", "stage", "homolog"].includes(raw)
  ? "staging"
  : ["production", "prod", "producao"].includes(raw)
    ? "production"
    : null;

if (!TARGET) {
  console.error(`\n✗ Ambiente inválido: "${raw}". Use --env=staging ou --env=production.\n`);
  process.exit(1);
}

const IS_STAGING = TARGET === "staging";
const PREFIX = IS_STAGING ? "STAGING_" : "PROD_";

// ── .env files ───────────────────────────────────────────────────────────────
function parseEnvFile(file) {
  const out = {};
  if (!existsSync(file)) return out;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

const shared = parseEnvFile(resolve(ROOT, ".env.ftp"));
const specific = parseEnvFile(resolve(ROOT, `.env.ftp.${TARGET}`));
const fileEnv = { ...shared, ...specific };

const env = { ...process.env };
for (const [k, v] of Object.entries(fileEnv)) {
  if (env[k] == null || env[k] === "") env[k] = v;
}

// Overrides com prefixo do alvo (ambiente real ou arquivos .env.ftp*)
const OVERRIDABLE = [
  "FTP_HOST",
  "FTP_USER",
  "FTP_PASSWORD",
  "FTP_PORT",
  "FTP_SECURE",
  "FTP_REMOTE_DIR",
  "FTP_CONCURRENCY",
  "FTP_MAX_RETRIES",
];
for (const key of OVERRIDABLE) {
  const value = process.env[PREFIX + key] ?? fileEnv[PREFIX + key];
  if (value != null && value !== "") env[key] = value;
}

// ── defaults por alvo ────────────────────────────────────────────────────────
const baseRemote = (env.FTP_REMOTE_DIR || "/www").replace(/\/+$/, "") || "/www";
if (IS_STAGING && !process.env.STAGING_FTP_REMOTE_DIR && !fileEnv.STAGING_FTP_REMOTE_DIR) {
  env.FTP_REMOTE_DIR = `${baseRemote}/staging`;
} else {
  env.FTP_REMOTE_DIR = baseRemote;
}

const suffix = IS_STAGING ? "-staging" : "";
env.FTP_MANIFEST_NAME = env.FTP_MANIFEST_NAME_OVERRIDE ?? `.deploy-manifest${suffix}.json`;
env.FTP_LOG_FILE = `dist/deploy-ftp${suffix}.log`;
env.FTP_REPORT_FILE = `dist/deploy-report${suffix}.json`;
env.FTP_REPORT_MD = `dist/deploy-report${suffix}.md`;
env.DEPLOY_ENV = TARGET;

// ── ajustes de indexação no pacote local ─────────────────────────────────────
const DIST = resolve(ROOT, env.FTP_LOCAL_DIR || "dist/client");
const NOINDEX_BLOCK = `
# --- staging: bloquear indexação ---
<IfModule mod_headers.c>
  Header set X-Robots-Tag "noindex, nofollow, noarchive"
</IfModule>
`;

function applyIndexingPolicy() {
  const robots = resolve(DIST, "robots.txt");
  const htaccess = resolve(DIST, ".htaccess");
  if (!existsSync(DIST)) return;

  if (IS_STAGING) {
    writeFileSync(robots, "User-agent: *\nDisallow: /\n", "utf8");
    if (existsSync(htaccess)) {
      const body = readFileSync(htaccess, "utf8");
      if (!body.includes("X-Robots-Tag")) appendFileSync(htaccess, NOINDEX_BLOCK, "utf8");
    }
    console.log("· staging: robots.txt Disallow + X-Robots-Tag noindex aplicados");
  } else {
    writeFileSync(robots, "User-agent: *\nAllow: /\n", "utf8");
    if (existsSync(htaccess)) {
      const body = readFileSync(htaccess, "utf8");
      if (body.includes("X-Robots-Tag")) {
        writeFileSync(htaccess, body.replace(NOINDEX_BLOCK, ""), "utf8");
      }
    }
  }
}

applyIndexingPolicy();

// ── executa o deploy ─────────────────────────────────────────────────────────
const passthrough = process.argv
  .slice(2)
  .filter((a) => a !== "--env" && !a.startsWith("--env="))
  .filter((a, i, arr) => !(arr[i - 1] === "--env"));

console.log(`\n▶ Deploy FTP — ambiente: ${TARGET.toUpperCase()}`);
console.log(`  host:   ${env.FTP_HOST ?? "(não definido)"}`);
console.log(`  destino: ${env.FTP_REMOTE_DIR}`);
console.log(`  manifesto: ${env.FTP_MANIFEST_NAME}\n`);

const result = spawnSync(
  process.execPath,
  [resolve(ROOT, "scripts/deploy-ftp.mjs"), ...passthrough],
  { stdio: "inherit", env },
);

process.exit(result.status ?? 1);
