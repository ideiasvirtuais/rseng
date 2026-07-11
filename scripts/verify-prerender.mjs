#!/usr/bin/env node
/**
 * Postbuild guard: falha se o prerender não gerou os HTMLs esperados.
 * Roda automaticamente após `vite build` via npm `postbuild`.
 *
 * Para adicionar/remover páginas, edite EXPECTED_PATHS abaixo ou
 * derive dinamicamente (ver lista de obras).
 */
import { existsSync, statSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const DIST = resolve(process.cwd(), "dist/client");

// Deriva os slugs das obras a partir do arquivo de dados (sem executar o TS).
function readObrasSlugs() {
  try {
    const src = readFileSync(resolve("src/data/projects.ts"), "utf8");
    const slugs = [...src.matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1]);
    // Descarta a primeira ocorrência se vier da definição de tipo.
    return slugs.filter((s) => s && !s.includes(":"));
  } catch {
    return [];
  }
}

const EXPECTED_PATHS = [
  "/",
  ...readObrasSlugs().map((s) => `/obras/${s}`),
];

const MIN_BYTES = 500; // HTML muito pequeno provavelmente é shell vazio/erro.

const missing = [];
const tooSmall = [];

for (const p of EXPECTED_PATHS) {
  const rel = p === "/" ? "index.html" : `${p.replace(/^\//, "")}/index.html`;
  const full = join(DIST, rel);
  if (!existsSync(full)) {
    missing.push(rel);
    continue;
  }
  const size = statSync(full).size;
  if (size < MIN_BYTES) tooSmall.push(`${rel} (${size} bytes)`);
}

if (missing.length === 0 && tooSmall.length === 0) {
  console.log(
    `✓ prerender ok — ${EXPECTED_PATHS.length} página(s) geradas em dist/client/`,
  );
  process.exit(0);
}

console.error("\n✗ Verificação de prerender FALHOU\n");
if (missing.length) {
  console.error("  Páginas esperadas mas não geradas:");
  for (const m of missing) console.error(`    - ${m}`);
}
if (tooSmall.length) {
  console.error("  Páginas geradas mas com HTML suspeito (muito pequeno):");
  for (const t of tooSmall) console.error(`    - ${t}`);
}
console.error(
  "\n  Verifique a config de prerender em vite.config.ts (spa.prerender / pages).\n",
);
process.exit(1);
