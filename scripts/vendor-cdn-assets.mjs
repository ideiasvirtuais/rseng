/**
 * Vendorisa os assets do CDN Lovable (src/assets/**/*.asset.json)
 * para public/__l5e/... de modo que as imagens funcionem em
 * qualquer ambiente: `vite dev`, preview, build estático e FTP.
 *
 * Uso: node scripts/vendor-cdn-assets.mjs
 *      (ou: CDN_SOURCE_BASE=https://xxx.lovable.app node scripts/vendor-cdn-assets.mjs)
 */
import { readdirSync, statSync, readFileSync, mkdirSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname, join } from "node:path";

const SRC_DIR = resolve(process.cwd(), "src/assets");
const PUBLIC_DIR = resolve(process.cwd(), "public");
const SOURCES = [process.env.CDN_SOURCE_BASE, "http://localhost:8080", "https://rseng.lovable.app"].filter(
  Boolean,
);

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
      if (res.ok && !type.includes("text/html")) return Buffer.from(await res.arrayBuffer());
      lastError = new Error(`${res.status} ${type} em ${base}`);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError ?? new Error("nenhuma origem disponível");
}

const pointers = walk(SRC_DIR);
let ok = 0;
const failures = [];

for (const file of pointers) {
  const { url } = JSON.parse(readFileSync(file, "utf8"));
  if (!url?.startsWith("/")) continue;
  const target = join(PUBLIC_DIR, url);
  if (existsSync(target)) {
    ok += 1;
    continue;
  }
  try {
    const buffer = await download(url);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, buffer);
    ok += 1;
    console.log(`✓ ${url} (${(buffer.length / 1024).toFixed(0)} KB)`);
  } catch (error) {
    failures.push(`${url} — ${error.message}`);
  }
}

console.log(`\n${ok}/${pointers.length} assets vendorados em public/.`);
if (failures.length) {
  console.error("✗ Falhas:\n  " + failures.join("\n  "));
  process.exit(1);
}
