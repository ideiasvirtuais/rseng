#!/usr/bin/env node
/**
 * Faz upload de dist/client/ para a raiz do domínio via FTP/FTPS.
 *
 * Variáveis de ambiente:
 *   FTP_HOST             (obrigatório)  ex.: ftp.rsengenharia.eng.br
 *   FTP_USER             (obrigatório)
 *   FTP_PASSWORD         (obrigatório)
 *   FTP_PORT             (opcional, default 21)
 *   FTP_SECURE           (opcional: "true" | "false" | "implicit", default "false")
 *   FTP_REMOTE_DIR       (opcional, default "/www")
 *   FTP_LOCAL_DIR        (opcional, default "dist/client")
 *   FTP_LOG_FILE         (opcional, default "dist/deploy-ftp.log")
 *   FTP_DRY_RUN          (opcional: "true" para simular sem enviar nada)
 *   FTP_DELETE_OBSOLETE  (opcional: "true" para remover obsoletos)
 *   FTP_CONCURRENCY      (opcional, default 3)  — conexões paralelas
 *   FTP_MAX_RETRIES      (opcional, default 3)  — tentativas por arquivo
 *   FTP_RETRY_DELAY_MS   (opcional, default 1000) — base do backoff exponencial
 *
 * Flags CLI:
 *   --dry-run              Simula sem alterar o FTP.
 *   --delete               Remove no remoto o que não existe mais local.
 *   --concurrency=N        Igual a FTP_CONCURRENCY=N.
 *   --retries=N            Igual a FTP_MAX_RETRIES=N.
 *
 * Uso:
 *   bun run deploy:ftp
 *   bun run deploy:ftp -- --dry-run --delete
 *   bun run deploy:ftp -- --concurrency=5 --retries=5
 */
import {
  existsSync,
  mkdirSync,
  writeFileSync,
  appendFileSync,
  statSync,
  readdirSync,
} from "node:fs";
import { resolve, dirname, relative } from "node:path";
import { Client } from "basic-ftp";

// ── env & flags ──────────────────────────────────────────────────────────────
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

function flagValue(name) {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : undefined;
}
function intEnv(name, fallback, cliName) {
  const raw = flagValue(cliName ?? name) ?? process.env[name];
  const n = raw != null ? Number.parseInt(String(raw), 10) : NaN;
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

const DRY_RUN =
  process.argv.includes("--dry-run") ||
  process.env.FTP_DRY_RUN === "true" ||
  process.env.FTP_DRY_RUN === "1";

const DELETE_OBSOLETE =
  process.argv.includes("--delete") ||
  process.env.FTP_DELETE_OBSOLETE === "true" ||
  process.env.FTP_DELETE_OBSOLETE === "1";

const CONCURRENCY = intEnv("FTP_CONCURRENCY", 3, "concurrency");
const MAX_RETRIES = intEnv("FTP_MAX_RETRIES", 3, "retries");
const RETRY_DELAY_MS = intEnv("FTP_RETRY_DELAY_MS", 1000);

// Nomes na raiz remota que podemos remover se sumirem do build local.
// Fora dessa lista, raiz não é tocada (protege index.php, wp-*, cgi-bin etc.).
const ROOT_ALLOWLIST = new Set([
  ".htaccess",
  "_shell.html",
  "index.html",
  "favicon.png",
  "favicon.ico",
  "_headers",
  "robots.txt",
  "sitemap.xml",
]);

// ── validação básica ─────────────────────────────────────────────────────────
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
writeFileSync(
  LOG_PATH,
  `# Deploy FTP — ${new Date().toISOString()}\n` +
    `# ${FTP_USER}@${FTP_HOST}:${FTP_PORT} → ${FTP_REMOTE_DIR}\n` +
    `# concurrency=${CONCURRENCY} retries=${MAX_RETRIES} retryDelayMs=${RETRY_DELAY_MS}\n\n`,
);
const log = (line) => appendFileSync(LOG_PATH, line + "\n");

const secure =
  FTP_SECURE === "true" ? true : FTP_SECURE === "implicit" ? "implicit" : false;

// ── utilidades ───────────────────────────────────────────────────────────────
const c = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
};

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
    if (entry.isDirectory()) out.push(...walk(abs));
    else if (entry.isFile())
      out.push({ abs, rel: relative(LOCAL, abs).split(/[\\/]/).join("/"), bytes: statSync(abs).size });
  }
  return out;
}

function localIndex() {
  const list = walk(LOCAL);
  const files = new Set(list.map((f) => f.rel));
  const managed = new Set();
  for (const rel of files) {
    const parts = rel.split("/");
    for (let i = 1; i < parts.length; i++) managed.add(parts.slice(0, i).join("/"));
  }
  return { list, files, managed };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── pool de conexões FTP ─────────────────────────────────────────────────────
async function makeClient() {
  const cli = new Client(30_000);
  cli.ftp.verbose = false;
  await cli.access({
    host: FTP_HOST,
    port: Number(FTP_PORT),
    user: FTP_USER,
    password: FTP_PASSWORD,
    secure,
  });
  await cli.ensureDir(FTP_REMOTE_DIR);
  // Voltar à raiz remota para tornar caminhos absolutos previsíveis.
  await cli.cd("/");
  return cli;
}

/**
 * Executa `task(client)` com um cliente do pool, retomando em outro caso o
 * socket morra. Cada tentativa recria o cliente que falhou.
 */
function createPool(size) {
  /** @type {Client[]} */
  const idle = [];
  /** @type {((c: Client) => void)[]} */
  const waiters = [];
  let created = 0;
  let closed = false;

  async function acquire() {
    if (idle.length) return idle.pop();
    if (created < size) {
      created++;
      try {
        return await makeClient();
      } catch (err) {
        created--;
        throw err;
      }
    }
    return new Promise((res) => waiters.push(res));
  }

  function release(cli) {
    if (closed) {
      cli.close();
      return;
    }
    const w = waiters.shift();
    if (w) w(cli);
    else idle.push(cli);
  }

  function drop(cli) {
    // Cliente morto: não devolve ao pool, abre espaço para outro.
    try { cli.close(); } catch { /* ignore */ }
    created--;
    const w = waiters.shift();
    if (w) {
      // Alguém está esperando: criar um novo sob demanda.
      created++;
      makeClient()
        .then((fresh) => w(fresh))
        .catch(() => {
          created--;
          // devolve a espera para a próxima release
          waiters.unshift(w);
        });
    }
  }

  async function closeAll() {
    closed = true;
    while (idle.length) {
      try { idle.pop().close(); } catch { /* ignore */ }
    }
  }

  return { acquire, release, drop, closeAll, get size() { return created; } };
}

async function withRetry(label, fn) {
  let attempt = 0;
  let lastErr;
  while (attempt < MAX_RETRIES) {
    attempt++;
    try {
      return await fn(attempt);
    } catch (err) {
      lastErr = err;
      const msg = err?.message || String(err);
      if (attempt >= MAX_RETRIES) {
        log(`  ! ${label} — falhou após ${attempt} tentativas: ${msg}`);
        throw err;
      }
      const wait = RETRY_DELAY_MS * 2 ** (attempt - 1);
      log(`  … ${label} — tentativa ${attempt} falhou (${msg}); nova em ${wait}ms`);
      await sleep(wait);
    }
  }
  throw lastErr;
}

// ── operação: upload paralelo com retry ──────────────────────────────────────
async function uploadFiles(pool, files) {
  /** @type {{rel: string, bytes: number}[]} */
  const uploaded = [];
  /** @type {{rel: string, error: string}[]} */
  const failed = [];
  let totalBytes = 0;
  let done = 0;
  const total = files.length;

  await Promise.all(
    files.map((f) =>
      (async () => {
        try {
          await withRetry(`↑ ${f.rel}`, async () => {
            let cli = await pool.acquire();
            try {
              const remotePath = `${FTP_REMOTE_DIR}/${f.rel}`;
              const parent = dirname(remotePath);
              try {
                await cli.ensureDir(parent);
                await cli.cd("/");
                await cli.uploadFrom(f.abs, remotePath);
              } catch (err) {
                pool.drop(cli);
                cli = null;
                throw err;
              }
              pool.release(cli);
            } catch (err) {
              if (cli) pool.drop(cli);
              throw err;
            }
          });
          uploaded.push({ rel: f.rel, bytes: f.bytes });
          totalBytes += f.bytes;
          done++;
          const line = `  ${c.green}✓${c.reset} [${done}/${total}] ${f.rel} ${c.dim}(${fmtBytes(f.bytes)})${c.reset}`;
          console.log(line);
          log(`  ✓ ${f.rel} (${f.bytes} bytes)`);
        } catch (err) {
          const msg = err?.message || String(err);
          failed.push({ rel: f.rel, error: msg });
          done++;
          console.log(`  ${c.red}✗ [${done}/${total}] ${f.rel} — ${msg}${c.reset}`);
          log(`  ✗ ${f.rel} — ${msg}`);
        }
      })(),
    ),
  );

  return { uploaded, failed, totalBytes };
}

// ── listagem remota (uma conexão só, para simplificar) ───────────────────────
async function listRemoteManaged(cli, remoteBase, managedDirs) {
  /** @type {{rel: string, dir: string, name: string}[]} */
  const out = [];
  async function recur(relDir) {
    const remotePath = relDir ? `${remoteBase}/${relDir}` : remoteBase;
    let entries;
    try { entries = await cli.list(remotePath); } catch { return; }
    for (const e of entries) {
      if (e.name === "." || e.name === "..") continue;
      const childRel = relDir ? `${relDir}/${e.name}` : e.name;
      if (e.isDirectory) {
        if (managedDirs.has(childRel)) await recur(childRel);
      } else if (e.isFile) {
        out.push({ rel: childRel, dir: relDir, name: e.name });
      }
    }
  }
  await recur("");
  return out;
}

function pickObsolete(remoteFiles, localFiles) {
  return remoteFiles.filter((r) => {
    if (localFiles.has(r.rel)) return false;
    if (r.dir === "") return ROOT_ALLOWLIST.has(r.name);
    return true;
  });
}

async function deleteFiles(pool, obsolete) {
  const deleted = [];
  const failed = [];
  let done = 0;
  const total = obsolete.length;
  await Promise.all(
    obsolete.map((o) =>
      (async () => {
        try {
          await withRetry(`✗ ${o.rel}`, async () => {
            let cli = await pool.acquire();
            try {
              await cli.remove(`${FTP_REMOTE_DIR}/${o.rel}`);
              pool.release(cli);
            } catch (err) {
              pool.drop(cli);
              throw err;
            }
          });
          deleted.push(o.rel);
          done++;
          console.log(`  ${c.red}✗${c.reset} [${done}/${total}] ${o.rel} ${c.dim}(removido)${c.reset}`);
          log(`  ✗ removido: ${o.rel}`);
        } catch (err) {
          const msg = err?.message || String(err);
          failed.push({ rel: o.rel, error: msg });
          done++;
          console.log(`  ${c.red}! [${done}/${total}] falha ao remover ${o.rel} — ${msg}${c.reset}`);
          log(`  ! falha ao remover ${o.rel} — ${msg}`);
        }
      })(),
    ),
  );
  return { deleted, failed };
}

// ── modos ────────────────────────────────────────────────────────────────────
async function dryRun() {
  const started = Date.now();
  console.log(`${c.yellow}${c.bold}⚠ DRY-RUN${c.reset} — nada será alterado no FTP.`);
  console.log(
    `${c.dim}(concurrency=${CONCURRENCY}, retries=${MAX_RETRIES}, backoff=${RETRY_DELAY_MS}ms)${c.reset}\n`,
  );
  log(`⚠ DRY-RUN — concurrency=${CONCURRENCY} retries=${MAX_RETRIES}`);
  console.log(
    `${c.cyan}→${c.reset} Simulando envio de ${c.bold}${LOCAL}${c.reset} → ` +
      `${c.bold}${FTP_HOST ?? "<FTP_HOST>"}:${FTP_PORT}${FTP_REMOTE_DIR}${c.reset}\n`,
  );

  const { list, files, managed } = localIndex();
  const sorted = [...list].sort((a, b) => a.rel.localeCompare(b.rel));
  let totalBytes = 0;
  for (const f of sorted) {
    totalBytes += f.bytes;
    console.log(`  ${c.dim}↑${c.reset} ${f.rel} ${c.dim}(${fmtBytes(f.bytes)})${c.reset}`);
    log(`  ↑ ${f.rel} (${f.bytes} bytes)`);
  }

  let obsoleteCount = 0;
  if (DELETE_OBSOLETE) {
    if (!FTP_HOST || !FTP_USER || !FTP_PASSWORD) {
      console.log(`\n${c.yellow}⚠ --delete em dry-run sem credenciais: pulando varredura remota.${c.reset}`);
    } else {
      console.log(`\n${c.cyan}→${c.reset} Conectando para inspecionar remoto…`);
      const cli = await makeClient();
      try {
        const remoteFiles = await listRemoteManaged(cli, FTP_REMOTE_DIR, managed);
        const obsolete = pickObsolete(remoteFiles, files);
        obsoleteCount = obsolete.length;
        if (!obsolete.length) console.log(`  ${c.dim}nada a remover${c.reset}`);
        else {
          console.log(`  ${c.yellow}Seriam removidos ${obsolete.length} arquivos:${c.reset}`);
          for (const o of obsolete) console.log(`  ${c.red}✗${c.reset} ${o.rel}`);
        }
      } finally {
        cli.close();
      }
    }
  }

  const elapsed = ((Date.now() - started) / 1000).toFixed(1);
  console.log(
    `\n${c.bold}Resumo (dry-run):${c.reset} ${c.yellow}${sorted.length} arquivos${c.reset}` +
      (DELETE_OBSOLETE ? `, ${c.red}${obsoleteCount} obsoletos${c.reset}` : "") +
      ` — ${fmtBytes(totalBytes)} em ${elapsed}s`,
  );
  console.log(`${c.dim}Log completo: ${LOG_PATH}${c.reset}`);
}

async function runDeploy() {
  const started = Date.now();
  console.log(
    `${c.cyan}→${c.reset} Conectando em ${c.bold}${FTP_HOST}:${FTP_PORT}${c.reset} ` +
      `(secure=${FTP_SECURE}) como ${FTP_USER}`,
  );
  console.log(
    `${c.dim}(concurrency=${CONCURRENCY}, retries=${MAX_RETRIES}, backoff=${RETRY_DELAY_MS}ms)${c.reset}`,
  );
  log(`→ Conectando concurrency=${CONCURRENCY} retries=${MAX_RETRIES}`);

  const pool = createPool(CONCURRENCY);
  const { list, files: localFiles, managed } = localIndex();
  const sorted = [...list].sort((a, b) => a.rel.localeCompare(b.rel));

  console.log(
    `${c.cyan}→${c.reset} Enviando ${c.bold}${sorted.length}${c.reset} arquivos ` +
      `${c.bold}${LOCAL}${c.reset} → ${c.bold}${FTP_REMOTE_DIR}${c.reset}\n`,
  );

  const { uploaded, failed, totalBytes } = await uploadFiles(pool, sorted);

  let deleted = [];
  let deleteFailed = [];
  if (DELETE_OBSOLETE) {
    console.log(`\n${c.cyan}→${c.reset} Procurando arquivos obsoletos no remoto…`);
    const cli = await pool.acquire();
    let remoteFiles;
    try {
      remoteFiles = await listRemoteManaged(cli, FTP_REMOTE_DIR, managed);
      pool.release(cli);
    } catch (err) {
      pool.drop(cli);
      throw err;
    }
    const obsolete = pickObsolete(remoteFiles, localFiles);
    if (!obsolete.length) {
      console.log(`  ${c.dim}nada a remover${c.reset}`);
    } else {
      const res = await deleteFiles(pool, obsolete);
      deleted = res.deleted;
      deleteFailed = res.failed;
    }
  }

  await pool.closeAll();

  const elapsed = ((Date.now() - started) / 1000).toFixed(1);
  console.log(
    `\n${c.bold}Resumo:${c.reset} ` +
      `${c.green}${uploaded.length} enviados${c.reset}` +
      (failed.length ? `, ${c.red}${failed.length} falharam${c.reset}` : "") +
      (DELETE_OBSOLETE ? `, ${c.red}${deleted.length} removidos${c.reset}` : "") +
      (deleteFailed.length ? `, ${c.red}${deleteFailed.length} rem. falharam${c.reset}` : "") +
      ` — ${fmtBytes(totalBytes)} em ${elapsed}s`,
  );
  log(
    `\nResumo: ${uploaded.length} enviados, ${failed.length} falharam` +
      (DELETE_OBSOLETE ? `, ${deleted.length} removidos, ${deleteFailed.length} rem. falharam` : "") +
      ` — ${totalBytes} bytes em ${elapsed}s`,
  );

  if (failed.length) {
    console.log(`\n${c.red}${c.bold}Falhas de upload:${c.reset}`);
    for (const f of failed) console.log(`  ${c.red}✗${c.reset} ${f.rel} — ${f.error}`);
  }
  if (deleteFailed.length) {
    console.log(`\n${c.red}${c.bold}Falhas de remoção:${c.reset}`);
    for (const f of deleteFailed) console.log(`  ${c.red}!${c.reset} ${f.rel} — ${f.error}`);
  }

  console.log(`${c.dim}Log completo: ${LOG_PATH}${c.reset}`);
  if (failed.length || deleteFailed.length) process.exit(2);
  console.log(`${c.green}✓ Deploy concluído com sucesso.${c.reset}`);
}

// ── entrypoint ───────────────────────────────────────────────────────────────
(DRY_RUN ? dryRun() : runDeploy()).catch((err) => {
  const msg = err?.message || String(err);
  console.error(`\n${c.red}✗ Falha no deploy FTP:${c.reset} ${msg}`);
  log(`\n✗ Falha no deploy FTP: ${msg}`);
  console.error(`${c.dim}Log completo: ${LOG_PATH}${c.reset}`);
  process.exit(1);
});
