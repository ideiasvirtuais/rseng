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
 *   FTP_FORCE            (opcional: "true" ignora checksum e reenvia tudo)
 *   FTP_MANIFEST_NAME    (opcional, default ".deploy-manifest.json")
 *
 * Flags CLI:
 *   --dry-run              Simula sem alterar o FTP.
 *   --delete               Remove no remoto o que não existe mais local.
 *   --concurrency=N        Igual a FTP_CONCURRENCY=N.
 *   --retries=N            Igual a FTP_MAX_RETRIES=N.
 *   --force                Ignora checksums e reenvia todos os arquivos.
 *
 * Verificação por checksum:
 *   O script mantém um manifesto (`.deploy-manifest.json`) na raiz remota
 *   com SHA-256 de cada arquivo enviado. Antes de subir, baixa o manifesto,
 *   calcula os hashes locais e pula arquivos idênticos. Após o upload, envia
 *   o manifesto atualizado. Use `--force` para ignorar o cache.
 *
 * Uso:
 *   bun run deploy:ftp
 *   bun run deploy:ftp -- --dry-run --delete
 *   bun run deploy:ftp -- --concurrency=5 --retries=5
 *   bun run deploy:ftp -- --force
 */
import {
  existsSync,
  mkdirSync,
  writeFileSync,
  appendFileSync,
  statSync,
  readdirSync,
  createReadStream,
  unlinkSync,
} from "node:fs";
import { resolve, dirname, relative } from "node:path";
import { tmpdir } from "node:os";
import { createHash } from "node:crypto";
import { Readable } from "node:stream";
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
  FTP_MANIFEST_NAME = ".deploy-manifest.json",
  FTP_REPORT_FILE = "dist/deploy-report.json",
  FTP_REPORT_MD = "dist/deploy-report.md",
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

const FORCE =
  process.argv.includes("--force") ||
  process.env.FTP_FORCE === "true" ||
  process.env.FTP_FORCE === "1";

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

// O manifesto é gerenciado pelo script — nunca conta como obsoleto nem como
// arquivo local a enviar.
const MANIFEST_REMOTE_PATH = `${FTP_REMOTE_DIR}/${FTP_MANIFEST_NAME}`;

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
    `# concurrency=${CONCURRENCY} retries=${MAX_RETRIES} retryDelayMs=${RETRY_DELAY_MS} force=${FORCE}\n\n`,
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

function writeReport(report) {
  const jsonPath = resolve(process.cwd(), FTP_REPORT_FILE);
  const mdPath = resolve(process.cwd(), FTP_REPORT_MD);
  mkdirSync(dirname(jsonPath), { recursive: true });
  mkdirSync(dirname(mdPath), { recursive: true });
  writeFileSync(jsonPath, JSON.stringify(report, null, 2));

  const lines = [];
  lines.push(`# Relatório de Deploy FTP`);
  lines.push("");
  lines.push(`- **Modo:** ${report.mode}`);
  lines.push(`- **Data:** ${report.finishedAt}`);
  lines.push(`- **Duração:** ${report.durationSec}s`);
  lines.push(`- **Destino:** \`${report.target.user}@${report.target.host}:${report.target.port}${report.target.remoteDir}\``);
  lines.push(`- **Origem:** \`${report.target.localDir}\``);
  lines.push(`- **Configuração:** concurrency=${report.config.concurrency}, retries=${report.config.retries}, force=${report.config.force}, delete=${report.config.delete}`);
  lines.push("");
  lines.push(`## Totais`);
  lines.push("");
  lines.push(`| Métrica | Valor |`);
  lines.push(`| --- | ---: |`);
  lines.push(`| Arquivos locais | ${report.totals.localFiles} |`);
  lines.push(`| Enviados | ${report.totals.uploaded} |`);
  lines.push(`| Inalterados (checksum) | ${report.totals.skipped} |`);
  lines.push(`| Falhas de upload | ${report.totals.uploadFailed} |`);
  lines.push(`| Removidos | ${report.totals.deleted} |`);
  lines.push(`| Falhas de remoção | ${report.totals.deleteFailed} |`);
  lines.push(`| Bytes enviados | ${fmtBytes(report.totals.bytesUploaded)} (${report.totals.bytesUploaded}) |`);
  lines.push("");
  if (report.uploaded?.length) {
    lines.push(`## Enviados (${report.uploaded.length})`);
    lines.push("");
    for (const u of report.uploaded) lines.push(`- \`${u.rel}\` — ${fmtBytes(u.bytes)}`);
    lines.push("");
  }
  if (report.deleted?.length) {
    lines.push(`## Removidos (${report.deleted.length})`);
    lines.push("");
    for (const d of report.deleted) lines.push(`- \`${d}\``);
    lines.push("");
  }
  if (report.uploadFailed?.length) {
    lines.push(`## Falhas de upload (${report.uploadFailed.length})`);
    lines.push("");
    for (const f of report.uploadFailed) lines.push(`- \`${f.rel}\` — ${f.error}`);
    lines.push("");
  }
  if (report.deleteFailed?.length) {
    lines.push(`## Falhas de remoção (${report.deleteFailed.length})`);
    lines.push("");
    for (const f of report.deleteFailed) lines.push(`- \`${f.rel}\` — ${f.error}`);
    lines.push("");
  }
  writeFileSync(mdPath, lines.join("\n"));
  return { jsonPath, mdPath };
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

function sha256File(abs) {
  return new Promise((res, rej) => {
    const hash = createHash("sha256");
    const s = createReadStream(abs);
    s.on("error", rej);
    s.on("data", (chunk) => hash.update(chunk));
    s.on("end", () => res(hash.digest("hex")));
  });
}

async function hashAll(files, parallel = 8) {
  /** @type {Map<string,string>} */
  const out = new Map();
  let i = 0;
  async function worker() {
    while (i < files.length) {
      const idx = i++;
      const f = files[idx];
      out.set(f.rel, await sha256File(f.abs));
    }
  }
  await Promise.all(Array.from({ length: Math.min(parallel, files.length) }, worker));
  return out;
}

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
  await cli.cd("/");
  return cli;
}

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
    try { cli.close(); } catch { /* ignore */ }
    created--;
    const w = waiters.shift();
    if (w) {
      created++;
      makeClient()
        .then((fresh) => w(fresh))
        .catch(() => {
          created--;
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

// ── manifesto remoto (checksums) ─────────────────────────────────────────────
async function downloadRemoteManifest(cli) {
  const tmpPath = resolve(tmpdir(), `deploy-manifest-${process.pid}-${Date.now()}.json`);
  try {
    await cli.downloadTo(tmpPath, MANIFEST_REMOTE_PATH);
  } catch (err) {
    // Sem manifesto remoto (primeiro deploy ou removido) — não é erro.
    const code = err?.code ?? err?.info?.code;
    log(`  · manifesto remoto indisponível (${code ?? err?.message}) — sem cache de checksum`);
    try { if (existsSync(tmpPath)) unlinkSync(tmpPath); } catch { /* ignore */ }
    return null;
  }
  try {
    const raw = await import("node:fs/promises").then((m) => m.readFile(tmpPath, "utf8"));
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && parsed.files && typeof parsed.files === "object") {
      return parsed;
    }
    log(`  · manifesto remoto ignorado: formato inesperado`);
    return null;
  } catch (err) {
    log(`  · manifesto remoto ignorado: ${err?.message ?? err}`);
    return null;
  } finally {
    try { unlinkSync(tmpPath); } catch { /* ignore */ }
  }
}

async function uploadManifest(cli, manifest) {
  const body = Buffer.from(JSON.stringify(manifest, null, 2), "utf8");
  await cli.uploadFrom(Readable.from(body), MANIFEST_REMOTE_PATH);
}

function buildManifest(hashes, files) {
  const bySize = new Map(files.map((f) => [f.rel, f.bytes]));
  /** @type {Record<string,{sha256:string,bytes:number}>} */
  const out = {};
  for (const [rel, sha] of hashes.entries()) {
    out[rel] = { sha256: sha, bytes: bySize.get(rel) ?? 0 };
  }
  return { generatedAt: new Date().toISOString(), files: out };
}

// ── upload paralelo ──────────────────────────────────────────────────────────
async function uploadFiles(pool, files) {
  const uploaded = [];
  const failed = [];
  let totalBytes = 0;
  let done = 0;
  const total = files.length;
  if (total === 0) return { uploaded, failed, totalBytes };

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
          console.log(`  ${c.green}✓${c.reset} [${done}/${total}] ${f.rel} ${c.dim}(${fmtBytes(f.bytes)})${c.reset}`);
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

// ── listagem remota ──────────────────────────────────────────────────────────
async function listRemoteManaged(cli, remoteBase, managedDirs) {
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
    if (r.rel === FTP_MANIFEST_NAME) return false; // nunca remover o manifesto
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
    `${c.dim}(concurrency=${CONCURRENCY}, retries=${MAX_RETRIES}, backoff=${RETRY_DELAY_MS}ms, force=${FORCE})${c.reset}\n`,
  );
  log(`⚠ DRY-RUN — concurrency=${CONCURRENCY} retries=${MAX_RETRIES} force=${FORCE}`);
  console.log(
    `${c.cyan}→${c.reset} Simulando envio de ${c.bold}${LOCAL}${c.reset} → ` +
      `${c.bold}${FTP_HOST ?? "<FTP_HOST>"}:${FTP_PORT}${FTP_REMOTE_DIR}${c.reset}\n`,
  );

  const { list, files, managed } = localIndex();
  const sorted = [...list].sort((a, b) => a.rel.localeCompare(b.rel));

  console.log(`${c.cyan}→${c.reset} Calculando SHA-256 de ${sorted.length} arquivos locais…`);
  const hashes = await hashAll(sorted);

  /** @type {Record<string,{sha256:string,bytes:number}>} */
  let remoteFiles = {};
  let manifestFound = false;
  if (!FORCE && FTP_HOST && FTP_USER && FTP_PASSWORD) {
    console.log(`${c.cyan}→${c.reset} Baixando manifesto remoto para comparar checksums…`);
    const cli = await makeClient();
    try {
      const manifest = await downloadRemoteManifest(cli);
      if (manifest) {
        remoteFiles = manifest.files;
        manifestFound = true;
      }
    } finally {
      cli.close();
    }
  } else if (FORCE) {
    console.log(`${c.yellow}⚠ --force ativo: ignorando manifesto e reenviando tudo.${c.reset}`);
  } else {
    console.log(`${c.yellow}⚠ Sem credenciais: pulando comparação de checksums.${c.reset}`);
  }

  const toUpload = [];
  const skipped = [];
  for (const f of sorted) {
    const localHash = hashes.get(f.rel);
    const remote = remoteFiles[f.rel];
    if (!FORCE && manifestFound && remote && remote.sha256 === localHash) {
      skipped.push(f);
    } else {
      toUpload.push(f);
    }
  }

  let totalBytes = 0;
  for (const f of toUpload) {
    totalBytes += f.bytes;
    console.log(`  ${c.dim}↑${c.reset} ${f.rel} ${c.dim}(${fmtBytes(f.bytes)})${c.reset}`);
    log(`  ↑ ${f.rel} (${f.bytes} bytes)`);
  }
  if (skipped.length) {
    console.log(`  ${c.dim}${skipped.length} arquivo(s) idênticos ao remoto — pulados.${c.reset}`);
    log(`  · ${skipped.length} pulados por checksum`);
  }

  let obsoleteCount = 0;
  let obsoleteList = [];
  if (DELETE_OBSOLETE) {
    if (!FTP_HOST || !FTP_USER || !FTP_PASSWORD) {
      console.log(`\n${c.yellow}⚠ --delete em dry-run sem credenciais: pulando varredura remota.${c.reset}`);
    } else {
      console.log(`\n${c.cyan}→${c.reset} Conectando para inspecionar remoto…`);
      const cli = await makeClient();
      try {
        const remoteList = await listRemoteManaged(cli, FTP_REMOTE_DIR, managed);
        const obsolete = pickObsolete(remoteList, files);
        obsoleteCount = obsolete.length;
        obsoleteList = obsolete.map((o) => o.rel);
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
    `\n${c.bold}Resumo (dry-run):${c.reset} ${c.yellow}${toUpload.length} a enviar${c.reset}` +
      `, ${c.dim}${skipped.length} pulados${c.reset}` +
      (DELETE_OBSOLETE ? `, ${c.red}${obsoleteCount} obsoletos${c.reset}` : "") +
      ` — ${fmtBytes(totalBytes)} em ${elapsed}s`,
  );
  const report = {
    mode: "dry-run",
    startedAt: new Date(started).toISOString(),
    finishedAt: new Date().toISOString(),
    durationSec: Number(elapsed),
    target: {
      host: FTP_HOST ?? null,
      port: Number(FTP_PORT),
      user: FTP_USER ?? null,
      remoteDir: FTP_REMOTE_DIR,
      localDir: LOCAL,
    },
    config: {
      concurrency: CONCURRENCY,
      retries: MAX_RETRIES,
      retryDelayMs: RETRY_DELAY_MS,
      force: FORCE,
      delete: DELETE_OBSOLETE,
      manifestFound,
    },
    totals: {
      localFiles: sorted.length,
      uploaded: 0,
      skipped: skipped.length,
      wouldUpload: toUpload.length,
      uploadFailed: 0,
      deleted: 0,
      wouldDelete: obsoleteCount,
      deleteFailed: 0,
      bytesUploaded: 0,
      bytesToUpload: totalBytes,
    },
    wouldUpload: toUpload.map((f) => ({ rel: f.rel, bytes: f.bytes })),
    wouldDelete: obsoleteList,
    uploaded: [],
    deleted: [],
    uploadFailed: [],
    deleteFailed: [],
  };
  const paths = writeReport(report);
  console.log(`${c.dim}Relatório: ${paths.jsonPath} e ${paths.mdPath}${c.reset}`);
  console.log(`${c.dim}Log completo: ${LOG_PATH}${c.reset}`);
}

async function runDeploy() {
  const started = Date.now();
  console.log(
    `${c.cyan}→${c.reset} Conectando em ${c.bold}${FTP_HOST}:${FTP_PORT}${c.reset} ` +
      `(secure=${FTP_SECURE}) como ${FTP_USER}`,
  );
  console.log(
    `${c.dim}(concurrency=${CONCURRENCY}, retries=${MAX_RETRIES}, backoff=${RETRY_DELAY_MS}ms, force=${FORCE})${c.reset}`,
  );
  log(`→ Conectando concurrency=${CONCURRENCY} retries=${MAX_RETRIES} force=${FORCE}`);

  const pool = createPool(CONCURRENCY);
  const { list, files: localFiles, managed } = localIndex();
  const sorted = [...list].sort((a, b) => a.rel.localeCompare(b.rel));

  console.log(`${c.cyan}→${c.reset} Calculando SHA-256 de ${sorted.length} arquivos locais…`);
  const hashes = await hashAll(sorted);

  /** @type {Record<string,{sha256:string,bytes:number}>} */
  let remoteFiles = {};
  let manifestFound = false;
  if (!FORCE) {
    const cli = await pool.acquire();
    try {
      const manifest = await downloadRemoteManifest(cli);
      pool.release(cli);
      if (manifest) {
        remoteFiles = manifest.files;
        manifestFound = true;
        console.log(`  ${c.dim}manifesto remoto encontrado (${Object.keys(remoteFiles).length} entradas).${c.reset}`);
      } else {
        console.log(`  ${c.dim}sem manifesto remoto — enviando todos os arquivos.${c.reset}`);
      }
    } catch (err) {
      pool.drop(cli);
      throw err;
    }
  } else {
    console.log(`  ${c.yellow}⚠ --force ativo: ignorando manifesto e reenviando tudo.${c.reset}`);
  }

  const toUpload = [];
  const skipped = [];
  for (const f of sorted) {
    const localHash = hashes.get(f.rel);
    const remote = remoteFiles[f.rel];
    if (!FORCE && manifestFound && remote && remote.sha256 === localHash) {
      skipped.push(f);
    } else {
      toUpload.push(f);
    }
  }

  console.log(
    `${c.cyan}→${c.reset} ${c.bold}${toUpload.length}${c.reset} a enviar, ` +
      `${c.dim}${skipped.length} inalterados${c.reset} ` +
      `→ ${c.bold}${FTP_REMOTE_DIR}${c.reset}\n`,
  );
  if (skipped.length) log(`  · ${skipped.length} pulados por checksum`);

  const { uploaded, failed, totalBytes } = await uploadFiles(pool, toUpload);

  // Atualizar manifesto remoto sempre que houver algo enviado com sucesso
  // (mesmo com falhas parciais registramos o estado desejado com base no
  // conjunto local — remotos que falharam serão re-tentados no próximo run
  // porque seu hash local não bate com o registro anterior).
  const nextManifestFiles = { ...remoteFiles };
  for (const u of uploaded) {
    nextManifestFiles[u.rel] = { sha256: hashes.get(u.rel), bytes: u.bytes };
  }
  // Também registra arquivos pulados (garante consistência caso o manifesto
  // remoto tenha entradas obsoletas para arquivos que já apagamos abaixo).
  for (const s of skipped) {
    nextManifestFiles[s.rel] = { sha256: hashes.get(s.rel), bytes: s.bytes };
  }

  let deleted = [];
  let deleteFailed = [];
  if (DELETE_OBSOLETE) {
    console.log(`\n${c.cyan}→${c.reset} Procurando arquivos obsoletos no remoto…`);
    const cli = await pool.acquire();
    let remoteList;
    try {
      remoteList = await listRemoteManaged(cli, FTP_REMOTE_DIR, managed);
      pool.release(cli);
    } catch (err) {
      pool.drop(cli);
      throw err;
    }
    const obsolete = pickObsolete(remoteList, localFiles);
    if (!obsolete.length) {
      console.log(`  ${c.dim}nada a remover${c.reset}`);
    } else {
      const res = await deleteFiles(pool, obsolete);
      deleted = res.deleted;
      deleteFailed = res.failed;
      for (const rel of deleted) delete nextManifestFiles[rel];
    }
  }

  // Envia o manifesto atualizado apenas se houve alguma mudança.
  const manifestChanged =
    uploaded.length > 0 || deleted.length > 0 || !manifestFound;
  if (manifestChanged && failed.length === 0) {
    try {
      const cli = await pool.acquire();
      try {
        await uploadManifest(cli, {
          generatedAt: new Date().toISOString(),
          files: nextManifestFiles,
        });
        pool.release(cli);
        console.log(`  ${c.dim}manifesto atualizado (${Object.keys(nextManifestFiles).length} entradas).${c.reset}`);
        log(`  · manifesto atualizado`);
      } catch (err) {
        pool.drop(cli);
        throw err;
      }
    } catch (err) {
      console.log(`  ${c.yellow}⚠ falha ao gravar manifesto: ${err?.message ?? err}${c.reset}`);
      log(`  ! falha ao gravar manifesto: ${err?.message ?? err}`);
    }
  } else if (failed.length > 0) {
    console.log(`  ${c.yellow}⚠ manifesto não atualizado (uploads falharam).${c.reset}`);
  }

  await pool.closeAll();

  const elapsed = ((Date.now() - started) / 1000).toFixed(1);
  console.log(
    `\n${c.bold}Resumo:${c.reset} ` +
      `${c.green}${uploaded.length} enviados${c.reset}` +
      `, ${c.dim}${skipped.length} inalterados${c.reset}` +
      (failed.length ? `, ${c.red}${failed.length} falharam${c.reset}` : "") +
      (DELETE_OBSOLETE ? `, ${c.red}${deleted.length} removidos${c.reset}` : "") +
      (deleteFailed.length ? `, ${c.red}${deleteFailed.length} rem. falharam${c.reset}` : "") +
      ` — ${fmtBytes(totalBytes)} em ${elapsed}s`,
  );
  log(
    `\nResumo: ${uploaded.length} enviados, ${skipped.length} inalterados, ${failed.length} falharam` +
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

  const report = {
    mode: "deploy",
    startedAt: new Date(started).toISOString(),
    finishedAt: new Date().toISOString(),
    durationSec: Number(elapsed),
    target: {
      host: FTP_HOST,
      port: Number(FTP_PORT),
      user: FTP_USER,
      remoteDir: FTP_REMOTE_DIR,
      localDir: LOCAL,
    },
    config: {
      concurrency: CONCURRENCY,
      retries: MAX_RETRIES,
      retryDelayMs: RETRY_DELAY_MS,
      force: FORCE,
      delete: DELETE_OBSOLETE,
      manifestFound,
    },
    totals: {
      localFiles: sorted.length,
      uploaded: uploaded.length,
      skipped: skipped.length,
      uploadFailed: failed.length,
      deleted: deleted.length,
      deleteFailed: deleteFailed.length,
      bytesUploaded: totalBytes,
    },
    uploaded,
    deleted,
    uploadFailed: failed,
    deleteFailed,
  };
  const paths = writeReport(report);
  console.log(`${c.dim}Relatório: ${paths.jsonPath} e ${paths.mdPath}${c.reset}`);
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
