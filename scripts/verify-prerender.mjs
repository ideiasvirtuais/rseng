#!/usr/bin/env node
/**
 * Postbuild guard: falha se o build não gerou o pacote estático mínimo
 * para FTP/Apache. Roda automaticamente após `vite build` via npm `postbuild`.
 */
import { existsSync, readdirSync, statSync } from "node:fs";
import { resolve } from "node:path";

const DIST = resolve(process.cwd(), "dist/client");
const SHELL = resolve(DIST, "_shell.html");
const ASSETS = resolve(DIST, "assets");
const MIN_BYTES = 500; // HTML muito pequeno provavelmente é shell vazio/erro.

const errors = [];

if (!existsSync(DIST)) errors.push("Diretório obrigatório ausente: dist/client/");
if (!existsSync(SHELL)) {
  errors.push("Arquivo obrigatório ausente: dist/client/_shell.html");
} else if (statSync(SHELL).size < MIN_BYTES) {
  errors.push(`_shell.html muito pequeno (${statSync(SHELL).size} bytes)`);
}
if (!existsSync(ASSETS)) {
  errors.push("Pasta obrigatória ausente: dist/client/assets/");
} else {
  const assets = readdirSync(ASSETS);
  if (!assets.some((name) => name.endsWith(".js"))) {
    errors.push("Nenhum bundle .js encontrado em dist/client/assets/");
  }
  if (!assets.some((name) => name.endsWith(".css"))) {
    errors.push("Nenhum bundle .css encontrado em dist/client/assets/");
  }
}

if (errors.length === 0) {
  console.log("✓ build FTP ok — dist/client contém _shell.html e assets JS/CSS");
  process.exit(0);
}

console.error("\n✗ Verificação do build FTP FALHOU\n");
for (const error of errors) console.error(`  - ${error}`);
console.error("\n  Rode bun run build e confira se dist/client/ contém _shell.html, index.html, assets/ e .htaccess.\n");
process.exit(1);
