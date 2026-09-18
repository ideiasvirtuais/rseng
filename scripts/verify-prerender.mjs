#!/usr/bin/env node
/**
 * Postbuild guard: falha se o build não gerou o pacote estático mínimo
 * para FTP/Apache. Roda automaticamente após `vite build` via npm `postbuild`.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { PRERENDER_ROUTES } from "./prerender-routes.mjs";

const DIST = resolve(process.cwd(), "dist/client");
const SHELL = resolve(DIST, "_shell.html");
const INDEX = resolve(DIST, "index.html");
const ASSETS = resolve(DIST, "assets");
const MIN_BYTES = 500; // HTML muito pequeno provavelmente é shell vazio/erro.

const errors = [];
const warnings = [];

function routeToFile(route) {
  if (route === "/") return resolve(DIST, "index.html");
  return resolve(DIST, `.${route}/index.html`);
}

if (!existsSync(DIST)) errors.push("Diretório obrigatório ausente: dist/client/");
if (!existsSync(SHELL)) {
  errors.push("Arquivo obrigatório ausente: dist/client/_shell.html");
} else if (statSync(SHELL).size < MIN_BYTES) {
  errors.push(`_shell.html muito pequeno (${statSync(SHELL).size} bytes)`);
}
if (!existsSync(INDEX)) {
  errors.push("Arquivo obrigatório ausente: dist/client/index.html (home prerendered)");
} else if (statSync(INDEX).size < MIN_BYTES) {
  errors.push(`index.html muito pequeno (${statSync(INDEX).size} bytes)`);
} else {
  const home = readFileSync(INDEX, "utf8");
  if (!home.includes("Golden Mall")) {
    errors.push("index.html não contém 'Golden Mall' — home desatualizada ou prerender falhou");
  }
  if (!home.includes("assets/")) {
    warnings.push("index.html sem referência a assets/ — bundles podem não carregar");
  }
}
for (const route of PRERENDER_ROUTES) {
  const file = routeToFile(route);
  if (!existsSync(file)) {
    errors.push(`Rota não prerenderizada: ${route} (esperado ${file})`);
  } else if (statSync(file).size < MIN_BYTES) {
    errors.push(`HTML muito pequeno em ${route} (${statSync(file).size} bytes)`);
  }
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
  console.log(
    `✓ build FTP ok — dist/client contém _shell.html, index.html e assets JS/CSS (${PRERENDER_ROUTES.length} rotas prerenderizadas, home com Golden Mall)`,
  );
  for (const warning of warnings) console.warn(`  ! ${warning}`);
  process.exit(0);
}

console.error("\n✗ Verificação do build FTP FALHOU\n");
for (const error of errors) console.error(`  - ${error}`);
console.error("\n  Rode bun run build e confira se dist/client/ contém _shell.html, index.html, assets/ e .htaccess.\n");
process.exit(1);
