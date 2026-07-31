/**
 * Changelog / versionamento de deploys FTP.
 *
 * Responsável por:
 *   - calcular o diff do build (adicionados / modificados / removidos)
 *   - gerar um número de versão incremental (AAAA.MM.DD-N)
 *   - manter o histórico dentro do manifesto remoto (`history`)
 *   - escrever CHANGELOG-DEPLOY.md (raiz) e dist/deploy-changelog.json
 */
import { writeFileSync, mkdirSync, existsSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { execFileSync } from "node:child_process";

export const CHANGELOG_MD = "CHANGELOG-DEPLOY.md";
export const CHANGELOG_JSON = "dist/deploy-changelog.json";
const HISTORY_LIMIT = 50;

function fmtBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

function git(args) {
  try {
    return execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return null;
  }
}

export function gitInfo() {
  const commit = git(["rev-parse", "--short", "HEAD"]);
  if (!commit) return null;
  return {
    commit,
    branch: git(["rev-parse", "--abbrev-ref", "HEAD"]),
    subject: git(["log", "-1", "--pretty=%s"]),
    author: git(["log", "-1", "--pretty=%an"]),
    committedAt: git(["log", "-1", "--pretty=%cI"]),
  };
}

/** Próxima versão no formato AAAA.MM.DD-N, considerando o histórico anterior. */
export function nextVersion(history, now = new Date()) {
  const day = now.toISOString().slice(0, 10).replace(/-/g, ".");
  const sameDay = history.filter((h) => typeof h.version === "string" && h.version.startsWith(`${day}-`));
  const maxSeq = sameDay.reduce((max, h) => {
    const n = Number.parseInt(String(h.version).split("-").pop(), 10);
    return Number.isFinite(n) && n > max ? n : max;
  }, 0);
  return {
    version: `${day}-${maxSeq + 1}`,
    build: history.length + 1,
  };
}

/**
 * Diff entre o manifesto remoto anterior e o build local.
 * @param {Record<string,{sha256:string,bytes:number}>} previousFiles
 * @param {Map<string,string>} hashes rel → sha256 local
 * @param {{rel:string,bytes:number}[]} localFiles
 * @param {string[]} deletedRels
 */
export function computeDiff(previousFiles, hashes, localFiles, deletedRels = []) {
  const added = [];
  const modified = [];
  const unchanged = [];
  const knownPrevious = previousFiles && Object.keys(previousFiles).length > 0;

  for (const f of localFiles) {
    const sha = hashes.get(f.rel);
    const prev = previousFiles?.[f.rel];
    if (!knownPrevious) {
      added.push({ rel: f.rel, bytes: f.bytes });
    } else if (!prev) {
      added.push({ rel: f.rel, bytes: f.bytes });
    } else if (prev.sha256 !== sha) {
      modified.push({ rel: f.rel, bytes: f.bytes, bytesBefore: prev.bytes ?? null });
    } else {
      unchanged.push({ rel: f.rel, bytes: f.bytes });
    }
  }

  const localRels = new Set(localFiles.map((f) => f.rel));
  const removedSet = new Set(deletedRels);
  for (const rel of Object.keys(previousFiles ?? {})) {
    if (!localRels.has(rel)) removedSet.add(rel);
  }
  const removed = [...removedSet].sort();

  return {
    firstDeploy: !knownPrevious,
    added: added.sort((a, b) => a.rel.localeCompare(b.rel)),
    modified: modified.sort((a, b) => a.rel.localeCompare(b.rel)),
    removed,
    unchanged: unchanged.length,
  };
}

/** Entrada de changelog pronta para o histórico. */
export function buildEntry({ diff, history, mode, target, totals, now = new Date() }) {
  const { version, build } = nextVersion(history, now);
  return {
    version,
    build,
    mode,
    date: now.toISOString(),
    git: gitInfo(),
    target: { host: target.host, remoteDir: target.remoteDir },
    summary: {
      added: diff.added.length,
      modified: diff.modified.length,
      removed: diff.removed.length,
      unchanged: diff.unchanged,
      bytesUploaded: totals.bytesUploaded ?? 0,
      firstDeploy: diff.firstDeploy,
    },
    changes: {
      added: diff.added.map((f) => f.rel),
      modified: diff.modified.map((f) => f.rel),
      removed: diff.removed,
    },
    files: { added: diff.added, modified: diff.modified },
  };
}

function renderEntry(entry) {
  const lines = [];
  const dry = entry.mode === "dry-run" ? " _(simulação)_" : "";
  lines.push(`## v${entry.version} — ${entry.date}${dry}`);
  lines.push("");
  if (entry.git?.commit) {
    lines.push(
      `- **Commit:** \`${entry.git.commit}\` (${entry.git.branch ?? "?"}) — ${entry.git.subject ?? ""}`.trimEnd(),
    );
  }
  lines.push(`- **Destino:** \`${entry.target.host ?? "?"}${entry.target.remoteDir}\``);
  lines.push(
    `- **Resumo:** ${entry.summary.added} novo(s), ${entry.summary.modified} alterado(s), ` +
      `${entry.summary.removed} removido(s), ${entry.summary.unchanged} inalterado(s) — ` +
      `${fmtBytes(entry.summary.bytesUploaded)} enviados`,
  );
  if (entry.summary.firstDeploy) lines.push(`- **Primeiro deploy** (sem manifesto anterior)`);
  lines.push("");
  const section = (title, items) => {
    if (!items.length) return;
    lines.push(`**${title} (${items.length})**`);
    lines.push("");
    for (const rel of items.slice(0, 200)) lines.push(`- \`${rel}\``);
    if (items.length > 200) lines.push(`- … +${items.length - 200} arquivo(s)`);
    lines.push("");
  };
  section("Adicionados", entry.changes.added);
  section("Modificados", entry.changes.modified);
  section("Removidos", entry.changes.removed);
  if (!entry.changes.added.length && !entry.changes.modified.length && !entry.changes.removed.length) {
    lines.push("_Nenhuma mudança de arquivo neste deploy._");
    lines.push("");
  }
  return lines.join("\n");
}

/** Escreve CHANGELOG-DEPLOY.md e dist/deploy-changelog.json a partir do histórico. */
export function writeChangelog(entry, history, cwd = process.cwd()) {
  const full = [entry, ...history].slice(0, HISTORY_LIMIT);

  const mdPath = resolve(cwd, CHANGELOG_MD);
  const header = [
    "# Changelog de Deploy — Rezende Saback",
    "",
    "Gerado automaticamente por `bun run deploy:ftp`. Cada versão lista o que mudou no build enviado por FTP.",
    "",
  ].join("\n");
  writeFileSync(mdPath, `${header}${full.map(renderEntry).join("\n---\n\n")}\n`);

  const jsonPath = resolve(cwd, CHANGELOG_JSON);
  mkdirSync(dirname(jsonPath), { recursive: true });
  writeFileSync(jsonPath, JSON.stringify({ current: entry, history: full }, null, 2));

  return { mdPath, jsonPath, history: full, markdown: renderEntry(entry) };
}

/** Histórico local de fallback quando o manifesto remoto não tem histórico. */
export function readLocalHistory(cwd = process.cwd()) {
  const jsonPath = resolve(cwd, CHANGELOG_JSON);
  if (!existsSync(jsonPath)) return [];
  try {
    const parsed = JSON.parse(readFileSync(jsonPath, "utf8"));
    return Array.isArray(parsed?.history) ? parsed.history : [];
  } catch {
    return [];
  }
}
