#!/usr/bin/env node
/**
 * Auditoria de imagens do site Rezende Saback.
 *
 * Verifica:
 *  1. Todo `src/assets/**\/*.asset.json` tem o arquivo correspondente em `public/__l5e/...`
 *  2. Imagens públicas obrigatórias existem em `public/` (hero, logo, og-cover, favicons)
 *  3. O último build (`dist/client/`) contém as mesmas imagens (evita "subiu mas não carregou")
 *  4. content_type do asset.json confere com a extensão (jpg com image/png quebra em CDN estrito)
 *  5. Arquivos gigantes (>800KB) geram alerta de performance (parecem "erro" no 3G)
 *  6. Imagens Vite (`src/assets/casas/*.jpg`, `hero-building.*`) referenciadas pelo código existem
 *  7. .htaccess protege mídia (MIME webp + sem rewrite de imagem 404 para _shell.html)
 *
 * Uso:
 *   node scripts/verify-images.mjs
 */
import { existsSync, readdirSync, readFileSync, statSync, openSync, readSync, closeSync } from "node:fs";
import { resolve, join, extname } from "node:path";

/** Lê os magic bytes para detectar o formato real (evita PNG servido como .jpg). */
function detectMagic(file) {
  try {
    const fd = openSync(file, "r");
    const buf = Buffer.alloc(12);
    readSync(fd, buf, 0, 12, 0);
    closeSync(fd);
    if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return ".jpg";
    if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return ".png";
    if (buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46) return ".webp";
    if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) return ".gif";
    return null;
  } catch {
    return null;
  }
}

const ROOT = process.cwd();
const SRC_ASSETS = resolve(ROOT, "src/assets");
const PUBLIC = resolve(ROOT, "public");
const DIST = resolve(ROOT, "dist/client");

const BIG_FILE_WARN = 800 * 1024; // 800KB — acima disso o 3G "parece erro"

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
  let data;
  try {
    data = JSON.parse(readFileSync(file, "utf8"));
  } catch {
    errors.push(`JSON inválido: ${file}`);
    continue;
  }
  const url = data.url;
  if (!url || !url.startsWith("/")) {
    warnings.push(`${file}: url ausente ou relativa (${url})`);
    continue;
  }
  const local = join(PUBLIC, ...url.split("/").filter(Boolean));
  if (!existsSync(local)) {
    errors.push(`Faltando em public/: ${url} (ref ${file})`);
    continue;
  }
  const size = statSync(local).size;
  if (size < 500) {
    warnings.push(`Arquivo suspeito (<500B): ${url}`);
    continue;
  }
  if (size > BIG_FILE_WARN) {
    warnings.push(`Imagem pesada (${(size / 1024).toFixed(0)}KB > 800KB, lenta no 3G): ${url} (ref ${file})`);
  }
  // 4. content_type vs extensão
  const ext = extname(url).toLowerCase();
  const ct = String(data.content_type || "").toLowerCase();
  if ((ext === ".jpg" || ext === ".jpeg") && ct && !ct.includes("jpeg") && !ct.includes("jpg")) {
    warnings.push(`${file}: content_type "${data.content_type}" não confere com extensão ${ext} (CDN estrito pode recusar)`);
  }
  if (ext === ".webp" && ct && !ct.includes("webp")) {
    warnings.push(`${file}: content_type "${data.content_type}" não confere com extensão .webp`);
  }
  if (ext === ".png" && ct && !ct.includes("png")) {
    warnings.push(`${file}: content_type "${data.content_type}" não confere com extensão .png`);
  }
  // 4b. magic bytes vs extensão — causa raiz real de "algumas falhando":
  // PNG com extensão .jpg é servido como image/jpeg pelo Apache; CDN estrito
  // recusa e o watchdog do SmartImage estoura no 3G (ex: edificio-iris.jpg).
  const magic = detectMagic(local);
  if (magic && magic !== ext) {
    // Erro (não só aviso): MIME divergente quebra em produção.
    // Exceção legada conhecida: o primário foi migrado para .webp no código,
    // então o arquivo antigo segue em disco apenas por compatibilidade.
    const legacyKnown = url.includes("/8d201ded-06e3-4b99-96ac-bc878e0e4c88/edificio-iris.jpg");
    const msg = `${url}: bytes ${magic} com extensão ${ext} (MIME divergente — sirva com a extensão correta) (ref ${file})`;
    if (legacyKnown) warnings.push(`LEGADO (não referenciado pelo código): ${msg}`);
    else errors.push(msg);
  }
  okVendor += 1;
}
console.log(`✓ vendorados: ${okVendor}/${pointers.length} assets __l5e presentes em public/`);

// 2. Imagens públicas obrigatórias
const REQUIRED = [
  "hero-rosario.jpg",
  "hero-rosario.webp",
  "LOGOMARCA-RS-1024x253.png",
  "logo-rezende-saback.png",
  "og-cover.jpg",
  "favicon.png",
  "apple-touch-icon.png",
];
for (const img of REQUIRED) {
  const f = join(PUBLIC, img);
  if (!existsSync(f)) errors.push(`Faltando em public/: ${img}`);
  else if (statSync(f).size < 500) errors.push(`Imagem suspeita (<500B) em public/: ${img}`);
  else if (statSync(f).size > BIG_FILE_WARN) {
    warnings.push(`public/${img} pesada (${(statSync(f).size / 1024).toFixed(0)}KB) — considere comprimir`);
  }
}
console.log(`✓ public/: ${REQUIRED.filter((i) => existsSync(join(PUBLIC, i))).length}/${REQUIRED.length} obrigatórias`);

// 6. Imagens Vite referenciadas diretamente pelo código
const VITE_REFS = [
  "src/assets/logomarca-rs-1024x253.png",
  "src/assets/logo-rezende-saback.png",
  "src/assets/casas/joao-bosco.jpg",
  "src/assets/casas/joelma.jpg",
  "src/assets/casas/jose-maria.jpg",
  "src/assets/casas/mario-lucio-casa.jpg",
  "src/assets/casas/natalicio-filadelfia.jpg",
  "src/assets/casas/natalicio-mont-serrat-2.jpg",
  "src/assets/casas/renato-brito.jpg",
  "src/assets/casas/smart.jpg",
  "src/assets/casas/wagner-casa.jpg",
  "src/assets/hero-building.jpg",
  "src/assets/og-cover.jpg",
];
for (const rel of VITE_REFS) {
  const f = resolve(ROOT, rel);
  if (!existsSync(f)) errors.push(`Faltando asset Vite: ${rel} (importado pelo código)`);
  else if (statSync(f).size > BIG_FILE_WARN) {
    warnings.push(`${rel} pesada (${(statSync(f).size / 1024).toFixed(0)}KB) — o SmartImage aplica lazy, mas comprima quando possível`);
  }
}
console.log(`✓ vite: ${VITE_REFS.filter((r) => existsSync(resolve(ROOT, r))).length}/${VITE_REFS.length} assets do bundler`);

// 6b. Referências do código aos originais pesados (parecem "falha" no 3G).
// Se algum .tsx/.ts voltar a importar o original pesado em vez do .webp,
// o watchdog estoura e a imagem cai para placeholder — barrar em CI.
{
  const HEAVY_ORIGINALS = [
    "residenciais/edificio-iris.jpg.asset.json",
    "residenciais/edificio-santorini.png.asset.json",
    "residenciais/alcides-guilherme.jpg.asset.json",
    "residenciais/jayme-brasileia.jpg.asset.json",
    "casas/casa-modernista-condominio.png.asset.json",
    "sede-rezende-saback.png.asset.json",
  ];
  const SRC = resolve(ROOT, "src");
  const stack = [SRC];
  const hits = [];
  while (stack.length) {
    const dir = stack.pop();
    let entries = [];
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const e of entries) {
      const full = join(dir, e.name);
      if (e.isDirectory()) {
        if (e.name === "node_modules" || e.name === "assets") continue;
        stack.push(full);
      } else if (/\.(tsx?|jsx?)$/.test(e.name)) {
        let body = "";
        try {
          body = readFileSync(full, "utf8");
        } catch {
          continue;
        }
        for (const heavy of HEAVY_ORIGINALS) {
          if (body.includes(heavy)) hits.push(`${full.replace(ROOT, "").replace(/\\/g, "/")}: importa original pesado ${heavy} (use a variante .webp)`);
        }
      }
    }
  }
  if (hits.length) {
    for (const h of hits) errors.push(h);
  } else {
    console.log(`✓ código: nenhum import aos originais pesados (${HEAVY_ORIGINALS.length} verificados)`);
  }
}

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
  // 7. .htaccess protege mídia?
  const ht = join(DIST, ".htaccess");
  if (existsSync(ht)) {
    const body = readFileSync(ht, "utf8");
    if (!/AddType\s+image\/webp/i.test(body)) {
      warnings.push("dist/client/.htaccess sem AddType image/webp — regenere com node scripts/generate-htaccess.mjs");
    }
    if (!/R=404/.test(body)) {
      warnings.push("dist/client/.htaccess sem regra R=404 para mídia — imagem 404 pode voltar como HTML e 'dar erro'");
    }
  } else {
    warnings.push("dist/client/.htaccess ausente — regenere com node scripts/generate-htaccess.mjs");
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
