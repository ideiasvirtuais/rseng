#!/usr/bin/env node
/**
 * Testa a conexão FTP sem enviar nada.
 *
 * Lê as credenciais na ordem:
 *   1. variáveis de ambiente FTP_* já exportadas
 *   2. arquivo `.env.ftp` (local, gitignored)
 *
 * Uso:
 *   node scripts/test-ftp-connection.mjs
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Client } from "basic-ftp";

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

const fileEnv = parseEnvFile(resolve(process.cwd(), ".env.ftp"));
const env = { ...fileEnv, ...process.env };

const HOST = env.FTP_HOST;
const USER = env.FTP_USER;
const PASSWORD = env.FTP_PASSWORD;
const PORT = Number(env.FTP_PORT ?? 21);
const REMOTE_DIR = env.FTP_REMOTE_DIR ?? "/www";
const SECURE =
  env.FTP_SECURE === "true" ? true : env.FTP_SECURE === "implicit" ? "implicit" : false;

if (!HOST || !USER || !PASSWORD) {
  console.error("\n✗ Credenciais incompletas. Defina FTP_HOST, FTP_USER e FTP_PASSWORD");
  console.error("  via ambiente ou arquivo .env.ftp (veja .env.ftp.example).\n");
  process.exit(1);
}

// Validação antecipada: login FTP nunca contém espaços — "rs engenharia"
// é o nome da conta no painel, não o login FTP (ex.: rsengenharia). Sem
// isso o servidor responde apenas 530 e parece "senha errada".
if (/\s/.test(USER)) {
  console.error(`\n✗ FTP_USER inválido: "${USER}" contém espaço.`);
  console.error("  O login FTP não tem espaços (é diferente do nome da conta).");
  console.error("  No painel KingHost, copie o 'Usuário FTP' exato (ex.: rsengenharia)");
  console.error("  e atualize a linha FTP_USER no arquivo .env.ftp.\n");
  process.exit(1);
}

const client = new Client(20_000);
try {
  await client.access({ host: HOST, port: PORT, user: USER, password: PASSWORD, secure: SECURE });
  console.log(`✓ Conectado a ${HOST}:${PORT} como ${USER} (secure=${env.FTP_SECURE ?? "false"})`);
  const list = await client.list(REMOTE_DIR);
  console.log(`✓ ${REMOTE_DIR} acessível — ${list.length} item(ns)`);
  for (const e of list.slice(0, 15)) {
    console.log(`  ${e.isDirectory ? "DIR " : "FILE"} ${e.name}`);
  }
  console.log("\n✓ Conexão FTP pronta para deploy.");
} catch (err) {
  console.error(`\n✗ Falha na conexão FTP: ${err?.message ?? err}\n`);
  process.exit(1);
} finally {
  client.close();
}
