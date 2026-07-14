#!/usr/bin/env node
/**
 * Faz upload de dist/client/ para a raiz do domínio via FTP/FTPS.
 *
 * Variáveis de ambiente:
 *   FTP_HOST         (obrigatório)  ex.: ftp.rsengenharia.eng.br
 *   FTP_USER         (obrigatório)
 *   FTP_PASSWORD     (obrigatório)
 *   FTP_PORT         (opcional, default 21)
 *   FTP_SECURE       (opcional: "true" | "false" | "implicit", default "false")
 *   FTP_REMOTE_DIR   (opcional, default "/www"). Ex.: "/www", "/public_html", "/"
 *   FTP_LOCAL_DIR    (opcional, default "dist/client")
 *   FTP_LOG_FILE     (opcional, default "dist/deploy-ftp.log")
 *   FTP_DRY_RUN      (opcional: "true" para simular sem enviar nada)
 *
 * Flags:
 *   --dry-run        Lista o que seria enviado (sem conectar ao FTP).
 *
 * Uso:
 *   FTP_HOST=... FTP_USER=... FTP_PASSWORD=... bun run deploy:ftp
 *   bun run deploy:ftp -- --dry-run
 */
import { readdirSync } from "node:fs";
import { existsSync, mkdirSync, writeFileSync, appendFileSync, statSync } from "node:fs";
import { resolve, dirname, relative } from "node:path";
import { Client } from "basic-ftp";

const {
  FTP_HOST,
  FTP_USER,
  FTP_PASSWORD,
  FTP_PORT = "21",
  FTP_SECURE = "false",
  FTP_REMOTE_DIR = "/www",
  FTP_LOCAL_DIR = "dist/client",
  FTP_LOG_FILE = "dist/deploy-ftp.log",
} = process.env;

const DRY_RUN =
  process.argv.includes("--dry-run") ||
  process.env.FTP_DRY_RUN === "true" ||
  process.env.FTP_DRY_RUN === "1";

const missing = DRY_RUN
  ? []
  : ["FTP_HOST", "FTP_USER", "FTP_PASSWORD"].filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`\n✗ Variáveis de ambiente ausentes: ${missing.join(", ")}\n`);
  console.error("  Configure antes de rodar. Exemplo:");
  console.error("    export FTP_HOST=ftp.rsengenharia.eng.br");
  console.error("    export FTP_USER=seu_usuario");
  console.error("    export FTP_PASSWORD='sua_senha'");
  console.error("    bun run deploy:ftp");
  console.error("  Ou simule sem credenciais: bun run deploy:ftp -- --dry-run\n");
  process.exit(1);
}

const LOCAL = resolve(process.cwd(), FTP_LOCAL_DIR);
if (!existsSync(LOCAL)) {
  console.error(`\n✗ Diretório local não existe: ${LOCAL}`);
  console.error("  Rode `bun run build` primeiro.\n");
  process.exit(1);
}

const LOG_PATH = resolve(process.cwd(), FTP_LOG_FILE);
mkdirSync(dirname(LOG_PATH), { recursive: true });
writeFileSync(LOG_PATH, `# Deploy FTP — ${new Date().toISOString()}\n# ${FTP_USER}@${FTP_HOST}:${FTP_PORT} → ${FTP_REMOTE_DIR}\n\n`);

const log = (line) => {
  appendFileSync(LOG_PATH, line + "\n");
};

const secure =
  FTP_SECURE === "true" ? true : FTP_SECURE === "implicit" ? "implicit" : false;

const client = new Client(30_000);
client.ftp.verbose = false;

// ANSI helpers
const c = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
};

/** @type {{name: string, bytes: number}[]} */
const uploaded = [];
/** @type {{name: string, error: string}[]} */
const failed = [];
const seen = new Set();
let currentFile = null;
let totalBytes = 0;

function fmtBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

function walk(dir) {
  /** @type {{abs: string, rel: string, bytes: number}[]} */
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const abs = resolve(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walk(abs));
    } else if (entry.isFile()) {
      out.push({ abs, rel: relative(LOCAL, abs), bytes: statSync(abs).size });
    }
  }
  return out;
}

async function dryRun() {
  const started = Date.now();
  console.log(`${c.yellow}${c.bold}⚠ DRY-RUN${c.reset} — nada será enviado ao FTP.\n`);
  log(`⚠ DRY-RUN — nada será enviado ao FTP.`);
  console.log(
    `${c.cyan}→${c.reset} Simulando envio de ${c.bold}${LOCAL}${c.reset} → ` +
      `${c.bold}${FTP_HOST ?? "<FTP_HOST>"}:${FTP_PORT}${FTP_REMOTE_DIR}${c.reset}\n`,
  );
  log(`→ Simulando envio de ${LOCAL} → ${FTP_HOST ?? "<FTP_HOST>"}:${FTP_PORT}${FTP_REMOTE_DIR}`);

  const files = walk(LOCAL).sort((a, b) => a.rel.localeCompare(b.rel));
  for (const f of files) {
    totalBytes += f.bytes;
    console.log(`  ${c.dim}↑${c.reset} ${f.rel} ${c.dim}(${fmtBytes(f.bytes)})${c.reset}`);
    log(`  ↑ ${f.rel} (${f.bytes} bytes)`);
  }

  const elapsed = ((Date.now() - started) / 1000).toFixed(1);
  console.log(
    `\n${c.bold}Resumo (dry-run):${c.reset} ${c.yellow}${files.length} arquivos${c.reset}` +
      ` — ${fmtBytes(totalBytes)} em ${elapsed}s`,
  );
  log(`\nResumo (dry-run): ${files.length} arquivos — ${totalBytes} bytes em ${elapsed}s`);
  console.log(`${c.dim}Log completo: ${LOG_PATH}${c.reset}`);
}

async function main() {
  if (DRY_RUN) return dryRun();
  const started = Date.now();
  console.log(`${c.cyan}→${c.reset} Conectando em ${c.bold}${FTP_HOST}:${FTP_PORT}${c.reset} (secure=${FTP_SECURE}) como ${FTP_USER}`);
  log(`→ Conectando em ${FTP_HOST}:${FTP_PORT} (secure=${FTP_SECURE}) como ${FTP_USER}`);

  await client.access({
    host: FTP_HOST,
    port: Number(FTP_PORT),
    user: FTP_USER,
    password: FTP_PASSWORD,
    secure,
  });

  console.log(`${c.cyan}→${c.reset} Entrando em ${c.bold}${FTP_REMOTE_DIR}${c.reset}`);
  log(`→ Entrando em ${FTP_REMOTE_DIR}`);
  await client.ensureDir(FTP_REMOTE_DIR);

  client.trackProgress((info) => {
    if (!info.name) return;
    if (info.name !== currentFile) {
      // Novo arquivo iniciando
      if (currentFile && !seen.has(currentFile)) {
        // fechar linha anterior
        process.stdout.write("\n");
      }
      currentFile = info.name;
    }
    process.stdout.write(
      `  ${c.dim}↑${c.reset} ${info.name} ${c.dim}(${fmtBytes(info.bytes)})${c.reset}   \r`
    );
  });

  // Wrap uploadFrom para capturar sucesso/falha por arquivo
  const origUpload = client.uploadFrom.bind(client);
  client.uploadFrom = async (source, remotePath, options) => {
    const name = typeof remotePath === "string" ? remotePath : String(remotePath);
    let size = 0;
    try {
      if (typeof source === "string" && existsSync(source)) {
        size = statSync(source).size;
      }
    } catch { /* ignore */ }
    try {
      const res = await origUpload(source, remotePath, options);
      const rel = typeof source === "string" ? relative(LOCAL, source) : name;
      uploaded.push({ name: rel, bytes: size });
      totalBytes += size;
      seen.add(name);
      process.stdout.write(
        `  ${c.green}✓${c.reset} ${rel} ${c.dim}(${fmtBytes(size)})${c.reset}                    \n`
      );
      log(`  ✓ ${rel} (${size} bytes)`);
      return res;
    } catch (err) {
      const rel = typeof source === "string" ? relative(LOCAL, source) : name;
      const msg = err?.message || String(err);
      failed.push({ name: rel, error: msg });
      process.stdout.write(
        `  ${c.red}✗ ${rel}${c.reset} ${c.red}— ${msg}${c.reset}                    \n`
      );
      log(`  ✗ ${rel} — ${msg}`);
      throw err;
    }
  };

  console.log(`${c.cyan}→${c.reset} Enviando ${c.bold}${LOCAL}${c.reset} → ${c.bold}${FTP_REMOTE_DIR}${c.reset}\n`);
  log(`→ Enviando ${LOCAL} → ${FTP_REMOTE_DIR}`);

  try {
    await client.uploadFromDir(LOCAL);
  } finally {
    client.trackProgress();
  }

  const elapsed = ((Date.now() - started) / 1000).toFixed(1);
  const summary =
    `\n${c.bold}Resumo:${c.reset} ` +
    `${c.green}${uploaded.length} enviados${c.reset}` +
    (failed.length ? `, ${c.red}${failed.length} falharam${c.reset}` : "") +
    ` — ${fmtBytes(totalBytes)} em ${elapsed}s`;
  console.log(summary);
  log(`\nResumo: ${uploaded.length} enviados, ${failed.length} falharam — ${totalBytes} bytes em ${elapsed}s`);

  if (failed.length) {
    console.log(`\n${c.red}${c.bold}Falhas:${c.reset}`);
    for (const f of failed) console.log(`  ${c.red}✗${c.reset} ${f.name} — ${f.error}`);
    console.log(`\n${c.dim}Log completo: ${LOG_PATH}${c.reset}`);
    process.exit(2);
  }

  console.log(`${c.green}✓ Upload concluído com sucesso.${c.reset}`);
  console.log(`${c.dim}Log completo: ${LOG_PATH}${c.reset}`);
}

main()
  .catch((err) => {
    const msg = err?.message || String(err);
    console.error(`\n${c.red}✗ Falha no deploy FTP:${c.reset} ${msg}`);
    log(`\n✗ Falha no deploy FTP: ${msg}`);
    if (uploaded.length || failed.length) {
      console.error(
        `  ${c.green}${uploaded.length} enviados${c.reset} antes da falha` +
          (failed.length ? `, ${c.red}${failed.length} com erro${c.reset}` : "")
      );
    }
    console.error(`${c.dim}Log completo: ${LOG_PATH}${c.reset}`);
    process.exit(1);
  })
  .finally(() => client.close());
