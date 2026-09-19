#!/usr/bin/env node
/**
 * Publica SOMENTE a logomarca (e favicons) no FTP — sem reenviar o site todo.
 *
 * Arquivos enviados (origem: dist/client/ se existir, senão public/):
 *   - logo-rezende-saback.png                          (raiz → /www/logo-rezende-saback.png)
 *   - __l5e/assets-v1/be9bf3cd-9321-41a5-b79d-f2a010d07cfb/logo-rezende-saback.png
 *   - favicon.png
 *   - apple-touch-icon.png
 *
 * Uso:
 *   node scripts/publish-logo.mjs                      # publica em produção (/www)
 *   node scripts/publish-logo.mjs --dry-run            # só valida local + mostra o que faria
 *   node scripts/publish-logo.mjs --env=staging        # publica em /www/staging
 *   node scripts/publish-logo.mjs --env=production --dry-run
 *
 * Credenciais (primeira que existir vence):
 *   1. variáveis de ambiente FTP_* já exportadas
 *   2. .env.ftp.production / .env.ftp.staging
 *   3. .env.ftp (compartilhado)
 *
 * Saída: log colorido + verificação remota (list + tamanho) + URL pública.
 */
import { existsSync, readFileSync, statSync, openSync, readSync, closeSync } from "node:fs";
import { resolve, join } from "node:path";
import { Client } from "basic-ftp";

const ROOT = process.cwd();

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
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

function argValue(name) {
  const eq = process.argv.find((a) => a.startsWith(`--${name}=`));
  if (eq) return eq.slice(name.length + 3);
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 ? process.argv[i + 1] : undefined;
}

const ENV_ARG = (argValue("env") ?? process.env.DEPLOY_ENV ?? "production").toLowerCase();
const TARGET = ["staging", "stage", "homolog"].includes(ENV_ARG) ? "staging" : "production";
const IS_STAGING = TARGET === "staging";
const DRY_RUN =
  process.argv.includes("--dry-run") ||
  process.env.FTP_DRY_RUN === "true" ||
  process.env.FTP_DRY_RUN === "1";

const shared = parseEnvFile(resolve(ROOT, ".env.ftp"));
const specific = parseEnvFile(resolve(ROOT, `.env.ftp.${TARGET}`));
const fileEnv = { ...shared, ...specific };
const env = { ...fileEnv, ...process.env };

// Prefixos STAGING_FTP_* / PROD_FTP_* sobrescrevem FTP_*.
const PREFIX = IS_STAGING ? "STAGING_" : "PROD_";
for (const key of ["FTP_HOST", "FTP_USER", "FTP_PASSWORD", "FTP_PORT", "FTP_SECURE", "FTP_REMOTE_DIR"]) {
  const v = process.env[PREFIX + key] ?? fileEnv[PREFIX + key];
  if (v != null && v !== "") env[key] = v;
}

const HOST = env.FTP_HOST;
const USER = env.FTP_USER;
const PASSWORD = env.FTP_PASSWORD;
const PORT = Number(env.FTP_PORT ?? 21);
const SECURE = env.FTP_SECURE === "true" ? true : env.FTP_SECURE === "implicit" ? "implicit" : false;
const baseRemote = (env.FTP_REMOTE_DIR || "/www").replace(/\/+$/, "") || "/www";
const REMOTE_DIR = IS_STAGING && !/staging$/i.test(baseRemote) ? `${baseRemote}/staging` : baseRemote;

const c = { reset: "\x1b[0m", dim: "\x1b[2m", green: "\x1b[32m", red: "\x1b[31m", yellow: "\x1b[33m", cyan: "\x1b[36m", bold: "\x1b[1m" };

const VENDOR_DIR = "__l5e/assets-v1/be9bf3cd-9321-41a5-b79d-f2a010d07cfb";
const FILES = [
  "logo-rezende-saback.png",
  `${VENDOR_DIR}/logo-rezende-saback.png`,
  "favicon.png",
  "apple-touch-icon.png",
];

function pickBase() {
  const dist = resolve(ROOT, "dist/client");
  const pub = resolve(ROOT, "public");
  // Prefere o pacote de deploy (o que o Apache realmente serve).
  const distHits = FILES.filter((f) => existsSync(join(dist, ...f.split("/")))).length;
  if (existsSync(dist) && distHits >= 2) return { base: dist, label: "dist/client" };
  return { base: pub, label: "public" };
}

function isPng(file) {
  try {
    const fd = openSync(file, "r");
    const buf = Buffer.alloc(8);
    readSync(fd, buf, 0, 8, 0);
    closeSync(fd);
    return buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47;
  } catch {
    return false;
  }
}

// ── validação local ──────────────────────────────────────────────────────────
const { base: LOCAL_BASE, label: LOCAL_LABEL } = pickBase();
console.log(`${c.cyan}→${c.reset} Logomarca — origem local: ${c.bold}${LOCAL_LABEL}/${c.reset} → ${c.bold}${HOST ?? "(sem host)"}${REMOTE_DIR}${c.reset} ${c.dim}(${TARGET}${DRY_RUN ? ", dry-run" : ""})${c.reset}\n`);

const ready = [];
let hasError = false;
for (const rel of FILES) {
  const full = join(LOCAL_BASE, ...rel.split("/"));
  if (!existsSync(full)) {
    console.log(`  ${c.yellow}!${c.reset} ausente em ${LOCAL_LABEL}/: ${rel} ${c.dim}(pulado)${c.reset}`);
    continue;
  }
  const size = statSync(full).size;
  if (size < 500) {
    console.log(`  ${c.red}✗${c.reset} suspeito (<500B): ${rel}`);
    hasError = true;
    continue;
  }
  const tag = rel.endsWith(".png") ? (isPng(full) ? "PNG ok" : "MAGIC inválido") : "ok";
  if (tag === "MAGIC inválido") {
    console.log(`  ${c.red}✗${c.reset} ${rel} — bytes não conferem com .png`);
    hasError = true;
    continue;
  }
  console.log(`  ${c.green}✓${c.reset} ${rel} ${c.dim}(${(size / 1024).toFixed(1)} KB, ${tag})${c.reset}`);
  ready.push({ rel, full, size });
}

if (!ready.length || hasError) {
  console.error(`\n${c.red}✗ Nada a publicar: valide os arquivos acima.${c.reset}`);
  process.exit(1);
}

if (DRY_RUN || !HOST || !USER || !PASSWORD) {
  if (!DRY_RUN) console.log(`\n${c.yellow}⚠ Sem credenciais completas — modo simulação.${c.reset}`);
  console.log(`${c.yellow}⚠ DRY-RUN${c.reset} — nada será enviado. Arquivos prontos:`);
  for (const f of ready) console.log(`  ${c.dim}↑${c.reset} ${f.rel} → ${REMOTE_DIR}/${f.rel}`);
  console.log(`\n${c.dim}Para publicar de verdade: node scripts/publish-logo.mjs --env=${TARGET}${c.reset}`);
  process.exit(0);
}

// Login FTP nunca contém espaços — "rs engenharia" é o nome da conta no
// painel, não o login FTP. Barrar aqui evita o 530 genérico do servidor.
if (/\s/.test(USER)) {
  console.error(`\n${c.red}✗ FTP_USER inválido: "${USER}" contém espaço.${c.reset}`);
  console.error(`  No painel KingHost, copie o 'Usuário FTP' exato e atualize o .env.ftp.`);
  console.error(`  Simulação disponível: node scripts/publish-logo.mjs --dry-run`);
  process.exit(1);
}

// ── upload ───────────────────────────────────────────────────────────────────
const client = new Client(20_000);
try {
  await client.access({ host: HOST, port: PORT, user: USER, password: PASSWORD, secure: SECURE });
  console.log(`\n${c.green}✓${c.reset} Conectado a ${HOST}:${PORT} como ${USER}`);
  await client.ensureDir(REMOTE_DIR);
  await client.cd("/");

  for (const f of ready) {
    const remotePath = `${REMOTE_DIR}/${f.rel}`;
    const parent = remotePath.split("/").slice(0, -1).join("/") || REMOTE_DIR;
    await client.ensureDir(parent);
    await client.cd("/");
    await client.uploadFrom(f.full, remotePath);
    console.log(`  ${c.green}✓ ↑${c.reset} ${f.rel} ${c.dim}(${(f.size / 1024).toFixed(1)} KB)${c.reset}`);
  }

  // Verificação remota: lista e confere tamanhos.
  console.log(`\n${c.cyan}→${c.reset} Verificando no servidor…`);
  let okAll = true;
  for (const f of ready) {
    const parts = f.rel.split("/");
    const dir = parts.length > 1 ? `${REMOTE_DIR}/${parts.slice(0, -1).join("/")}` : REMOTE_DIR;
    const name = parts[parts.length - 1];
    try {
      const list = await client.list(dir);
      const hit = list.find((e) => e.name === name);
      if (!hit) {
        console.log(`  ${c.red}✗${c.reset} ${f.rel} — não encontrado em ${dir}`);
        okAll = false;
      } else {
        const size = hit.size ?? 0;
        const match = Math.abs(size - f.size) < 2 ? "confere" : `DIVERGE (remoto ${size}B x local ${f.size}B)`;
        if (match !== "confere") okAll = false;
        console.log(`  ${hit ? c.green + "✓" + c.reset : c.red + "✗" + c.reset} ${f.rel} — remoto ${size}B (${match})`);
      }
    } catch (err) {
      console.log(`  ${c.yellow}!${c.reset} ${f.rel} — falha ao listar: ${err?.message ?? err}`);
      okAll = false;
    }
  }

  const siteBase = "https://rsengenharia.eng.br";
  console.log(`\n${c.dim}URLs públicas para conferir no navegador:${c.reset}`);
  console.log(`  ${siteBase}/logo-rezende-saback.png`);
  console.log(`  ${siteBase}/favicon.png`);
  if (okAll) console.log(`\n${c.green}✓ Logomarca publicada e verificada no FTP.${c.reset}`);
  else {
    console.log(`\n${c.yellow}⚠ Upload feito, mas a verificação remota divergiu — confira os itens acima.${c.reset}`);
    process.exit(2);
  }
} catch (err) {
  const msg = err?.message ?? String(err);
  console.error(`\n${c.red}✗ Falha ao publicar logomarca:${c.reset} ${msg}`);
  if (/530|Login|authentication|password|user/i.test(msg)) {
    console.error(`\n  Causa provável (530 = usuário/senha recusados pelo servidor):`);
    console.error(`  1. Confira FTP_USER e FTP_PASSWORD no arquivo .env.ftp (sem aspas extras nem espaços).`);
    console.error(`  2. No painel KingHost, confirme que o usuário FTP existe e a senha está atualizada.`);
    console.error(`  3. Se a hospedagem exigir FTPS, defina FTP_SECURE=true no .env.ftp e tente de novo.`);
    console.error(`  4. Teste com: node scripts/test-ftp-connection.mjs`);
  }
  process.exit(1);
} finally {
  client.close();
}
