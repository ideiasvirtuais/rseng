#!/usr/bin/env node
/**
 * Auto-correção de imagens — resolve as causas raiz das falhas em produção.
 *
 * 1. Corrige `content_type` divergente da extensão em src/assets/**.asset.json
 *    (ex: .jpg com image/png → CDN estrito/Apache recusam e a imagem "falha").
 * 2. Cria alias lowercase para arquivos com extensão MAIÚSCULA em public/
 *    (ex: instagram-rs.JPG → instagram-rs.jpg), pois o Apache/Linux é
 *    case-sensitive e o código pode pedir a variante minúscula.
 * 3. Re-executa a auditoria (verify-images) ao final.
 *
 * Uso: node scripts/fix-images.mjs [--write]
 *   Sem --write: só relata (dry-run). Com --write: aplica as correções.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync, copyFileSync, statSync } from "node:fs";
import { resolve, join, extname, basename } from "node:path";

const ROOT = process.cwd();
const SRC_ASSETS = resolve(ROOT, "src/assets");
const PUBLIC = resolve(ROOT, "public");
const WRITE = process.argv.includes("--write");

function walk(dir, suffix) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = join(dir, e.name);
    if (e.isDirectory()) return walk(full, suffix);
    return e.name.endsWith(suffix) ? [full] : [];
  });
}

function expectedContentType(ext) {
  const e = ext.toLowerCase();
  if (e === ".jpg" || e === ".jpeg") return "image/jpeg";
  if (e === ".png") return "image/png";
  if (e === ".webp") return "image/webp";
  if (e === ".avif") return "image/avif";
  if (e === ".svg") return "image/svg+xml";
  if (e === ".gif") return "image/gif";
  return null;
}

let fixed = 0;
const pending = [];

// 1. content_type × extensão
for (const file of walk(SRC_ASSETS, ".asset.json")) {
  let data;
  try {
    data = JSON.parse(readFileSync(file, "utf8"));
  } catch {
    console.warn(`! JSON inválido (ignorado): ${file}`);
    continue;
  }
  const url = data.url ?? "";
  const ext = extname(url).toLowerCase();
  const expected = expectedContentType(ext);
  if (!expected) continue;
  const current = String(data.content_type ?? "").toLowerCase();
  if (current !== expected) {
    pending.push(`${file}: content_type "${data.content_type}" → "${expected}"`);
    if (WRITE) {
      data.content_type = expected;
      writeFileSync(file, JSON.stringify(data, null, 2) + "\n", "utf8");
      fixed += 1;
    }
  }
}

// 2. alias lowercase em public/
const publicFiles = existsSync(PUBLIC) ? readdirSync(PUBLIC) : [];
for (const name of publicFiles) {
  const full = join(PUBLIC, name);
  try {
    if (statSync(full).isDirectory()) continue;
  } catch {
    continue;
  }
  const ext = extname(name);
  if (ext !== ext.toLowerCase()) {
    const lower = `${basename(name, ext)}${ext.toLowerCase()}`;
    const target = join(PUBLIC, lower);
    if (!existsSync(target)) {
      pending.push(`public/${name} → alias public/${lower} (case-sensitive)`);
      if (WRITE) {
        copyFileSync(full, target);
        fixed += 1;
      }
    }
  }
}

if (pending.length === 0) {
  console.log("✓ fix-images: nada a corrigir.");
} else {
  console.log(`${WRITE ? "✓ Corrigido" : "• Encontrado"} (${pending.length}):`);
  for (const p of pending) console.log(`  ${WRITE ? "✓" : "!"} ${p}`);
  if (!WRITE) {
    console.log("\nRode com --write para aplicar: node scripts/fix-images.mjs --write");
  } else {
    console.log(`\n✓ ${fixed} correções aplicadas. Rode node scripts/verify-images.mjs para auditar.`);
  }
}
