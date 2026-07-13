#!/usr/bin/env node
/**
 * Preflight check: valida se dist/client/ está pronto para upload via FTP.
 * Roda automaticamente antes de `bun run deploy:ftp` (script `predeploy:ftp`).
 *
 * Confere:
 *   - dist/client/_shell.html (não vazio)
 *   - dist/client/index.html (não vazio, referencia assets/)
 *   - dist/client/.htaccess (com RewriteRule e DirectoryIndex)
 *   - dist/client/assets/ com pelo menos 1 .js e 1 .css
 *   - dist/client/favicon.png
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { resolve, join } from "node:path";

const DIST = resolve(process.cwd(), "dist/client");
const MIN_HTML = 500;

const errors = [];
const warnings = [];

function must(path, label) {
  const full = join(DIST, path);
  if (!existsSync(full)) {
    errors.push(`Ausente: ${path} (${label})`);
    return null;
  }
  return full;
}

if (!existsSync(DIST)) {
  console.error(`\n✗ dist/client/ não existe. Rode \`bun run build\` primeiro.\n`);
  process.exit(1);
}

const shell = must("_shell.html", "SPA fallback do TanStack Start");
if (shell && statSync(shell).size < MIN_HTML) {
  errors.push(`_shell.html suspeito (${statSync(shell).size} bytes < ${MIN_HTML})`);
}

const index = must("index.html", "página inicial servida pelo Apache");
if (index) {
  const size = statSync(index).size;
  if (size < MIN_HTML) errors.push(`index.html suspeito (${size} bytes < ${MIN_HTML})`);
  const html = readFileSync(index, "utf8");
  if (!/\/assets\//.test(html)) warnings.push("index.html não referencia /assets/ (bundle pode não carregar)");
}

const htaccess = must(".htaccess", "regras de reescrita para Apache/KingHost");
if (htaccess) {
  const body = readFileSync(htaccess, "utf8");
  if (!/RewriteRule\s+\^\s+_shell\.html/i.test(body)) errors.push(".htaccess sem SPA fallback (RewriteRule ^ _shell.html)");
  if (!/DirectoryIndex/i.test(body)) errors.push(".htaccess sem diretiva DirectoryIndex");
  if (!/index\.html/.test(body.split("\n").find((l) => /DirectoryIndex/i.test(l)) ?? "")) {
    warnings.push("DirectoryIndex não prioriza index.html — Apache pode cair em index.php do WordPress antigo");
  }
}

const assetsDir = must("assets", "bundles JS/CSS gerados pelo Vite");
if (assetsDir) {
  const files = readdirSync(assetsDir);
  const jsCount = files.filter((f) => f.endsWith(".js")).length;
  const cssCount = files.filter((f) => f.endsWith(".css")).length;
  if (jsCount === 0) errors.push("assets/ não contém nenhum bundle .js");
  if (cssCount === 0) errors.push("assets/ não contém nenhum bundle .css");
  console.log(`  · assets/: ${jsCount} .js, ${cssCount} .css`);
}

must("favicon.png", "ícone do site");

if (errors.length) {
  console.error("\n✗ dist/client/ NÃO está pronto para upload:\n");
  for (const e of errors) console.error(`  - ${e}`);
  if (warnings.length) {
    console.error("\n  Avisos:");
    for (const w of warnings) console.error(`    · ${w}`);
  }
  console.error("\n  Rode `bun run build` novamente para regenerar o pacote.\n");
  process.exit(1);
}

console.log("✓ dist/client/ pronto para upload FTP");
if (warnings.length) {
  console.log("\n  Avisos (não bloqueiam):");
  for (const w of warnings) console.log(`    · ${w}`);
}
