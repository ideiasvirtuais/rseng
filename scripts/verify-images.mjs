#!/usr/bin/env node
/**
 * Auditoria de imagens do site Rezende Saback.
 *
 * Verifica:
 *  1. Todo `src/assets/**\/*.asset.json` tem o arquivo correspondente em `public/__l5e/...`
 *  2. Imagens públicas obrigatórias existem em `public/` (hero, logo, og-cover, favicons)
 *  3. O último build (`dist/client/`) contém as mesmas imagens (evita "subiu mas não carregou")
 *
 * Uso:
 *   node scripts/verify-images.mjs
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { resolve, join } from "node:path";

const ROOT = process.cwd();
const SRC_ASSETS = resolve(ROOT, "src/assets");
const PUBLIC = resolve(ROOT, "public");
const DIST = resolve(ROOT, "dist/client");

function walkAssetJson(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = join(dir, e.name);
    if (e.isDirectory()) return walkAssetJson(full);
    return e.name.endsWith(".asset.json") ? [full] : [];
  });
}

const errors = [];
const warnings = [];

// 1. asset.json → public/__l5e
const pointers = walkAssetJson(SRC_ASSETS);
let okVendor = 0;
for (const file of pointers) {
  let url;
  try {
    url = JSON.parse(readFileSync(file, "utf8")).url;
  } catch {
    errors.push(`JSON inválido: ${file}`);
    continue;
  }
  if (!url || !url.startsWith("/")) {
    warnings.push(`${file}: url ausente ou relativa (${url})`);
    continue;
  }
  const local = join(PUBLIC, ...url.split("/").filter(Boolean));
  if (!existsSync(local)) {
    errors.push(`Faltando em public/: ${url} (ref ${file})`);
  } else if (statSync(local).size < 500) {
    warnings.push(`Arquivo suspeito (<500B): ${url}`);
  } else {
    okVendor += 1;
  }
}
console.log(`✓ vendorados: ${okVendor}/${pointers.length} assets __l5e presentes em public/`);

// 2. Imagens públicas obrigatórias
const REQUIRED = [
  "hero-rosario.jpg",
  "hero-rosario.webp",
  "logo-rezende-saback.png",
  "og-cover.jpg",
  "favicon.png",
  "apple-touch-icon.png",
];
for (const img of REQUIRED) {
  const f = join(PUBLIC, img);
  if (!existsSync(f)) errors.push(`Faltando em public/: ${img}`);
  else if (statSync(f).size < 500) errors.push(`Imagem suspeita (<500B) em public/: ${img}`);
}
console.log(`✓ public/: ${REQUIRED.filter((i) => existsSync(join(PUBLIC, i))).length}/${REQUIRED.length} obrigatórias`);

// 3. Espelho no dist/client (pós-build)
if (!existsSync(DIST)) {
  warnings.push("dist/client não existe — rode o build para conferir o pacote de deploy.");
} else {
  for (const img of REQUIRED) {
    const f = join(DIST, img);
    if (!existsSync(f)) errors.push(`Faltando no build: dist/client/${img} (rode o build após adicionar em public/)`);
  }
  const l5e = join(DIST, "__l5e/assets-v1");
  if (!existsSync(l5e)) {
    errors.push("Faltando no build: dist/client/__l5e/assets-v1/");
  } else {
    const groups = readdirSync(l5e);
    console.log(`✓ build: __l5e com ${groups.length} grupos em dist/client/`);
    if (groups.length < 40) warnings.push(`__l5e no build com só ${groups.length} grupos (esperado 40+)`);
  }
}

if (warnings.length) {
  console.warn("\nAvisos:");
  for (const w of warnings) console.warn(`  ! ${w}`);
}
if (errors.length) {
  console.error("\n✗ Auditoria de imagens FALHOU:");
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log("\n✓ Auditoria de imagens OK — todas as imagens subiram e estão no build.");
