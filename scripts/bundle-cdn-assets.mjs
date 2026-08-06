/**
 * Copia os assets do CDN (src/assets/**\/*.asset.json) para dentro de dist/client,
 * preservando o mesmo caminho da URL (/__l5e/assets-v1/<id>/<arquivo>).
 *
 * Necessário para hospedagens estáticas (Apache/KingHost), onde o CDN do Lovable
 * não existe e as imagens cairiam no fallback do index.html.
 */
import { readdirSync, statSync, readFileSync, mkdirSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname, join } from "node:path";

const SRC_DIR = resolve(process.cwd(), "src/assets");
const OUT_DIR = resolve(process.cwd(), "dist/client");
const SOURCES = [
  process.env.CDN_SOURCE_BASE,
  "http://localhost:8080",
  "https://rseng.lovable.app",
].filter(Boolean);

function walk(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return walk(full);
    return full.endsWith(".asset.json") ? [full] : [];
  });
}

async function download(url) {
  let lastError;
  for (const base of SOURCES) {
    try {
      const res = await fetch(base + url);
      const type = res.headers.get("content-type") || "";
      if (res.ok && !type.includes("text/html")) {
        return Buffer.from(await res.arrayBuffer());
      }
      lastError = new Error(`${res.status} ${type} em ${base}`);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError ?? new Error("nenhuma origem disponível");
}

const pointers = walk(SRC_DIR);
if (!existsSync(OUT_DIR)) {
  console.error("✗ dist/client não existe — rode o build antes.");
  process.exit(1);
}

let copied = 0;
const failures = [];

for (const file of pointers) {
  const { url } = JSON.parse(readFileSync(file, "utf8"));
  if (!url || !url.startsWith("/")) continue;
  const target = join(OUT_DIR, url);
  if (existsSync(target)) {
    copied += 1;
    continue;
  }
  try {
    const buffer = await download(url);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, buffer);
    copied += 1;
    console.log(`✓ ${url} (${(buffer.length / 1024).toFixed(0)} KB)`);
  } catch (error) {
    failures.push(`${url} — ${error.message}`);
  }
}

console.log(`\n${copied}/${pointers.length} assets do CDN incluídos no build.`);
if (failures.length) {
  console.error("✗ Falhas:\n  " + failures.join("\n  "));
  process.exit(1);
}
