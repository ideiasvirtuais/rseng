#!/usr/bin/env node
/**
 * Valida o pacote estático UNIVERSAL (qualquer hospedagem).
 * Mais tolerante que verify-prerender (que é específico do FTP/KingHost):
 * aceita dist/client/ OU dist/ como raiz e exige apenas o mínimo portátil.
 *
 * Uso: node scripts/verify-static.mjs
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = process.cwd();
const CANDIDATES = [
  resolve(ROOT, process.env.STATIC_OUT_DIR || "dist/client"),
  resolve(ROOT, "dist"),
];
const DIST = CANDIDATES.find((d) => existsSync(resolve(d, "index.html"))) ?? CANDIDATES[0];

const errors = [];
const warnings = [];
const ok = (m) => console.log(`✓ ${m}`);

function need(rel, minBytes = 500) {
  const f = resolve(DIST, rel);
  if (!existsSync(f)) {
    errors.push(`Ausente: ${rel}`);
    return null;
  }
  if (statSync(f).size < minBytes) {
    errors.push(`Muito pequeno (${statSync(f).size}b): ${rel}`);
    return null;
  }
  return f;
}

console.log(`→ Validando pacote em ${DIST}\n`);

const index = need("index.html");
if (index) {
  const html = readFileSync(index, "utf8");
  if (!html.includes("assets/") && !html.includes("/assets")) warnings.push("index.html sem referência a assets/");
  else ok("index.html com bundle");
}

const assetsDir = resolve(DIST, "assets");
if (!existsSync(assetsDir)) errors.push("Ausente: assets/");
else {
  const files = readdirSync(assetsDir);
  if (!files.some((f) => f.endsWith(".js"))) errors.push("Nenhum .js em assets/");
  else ok(`assets/ (${files.length} arquivos, JS+CSS com hash)`);
  if (!files.some((f) => f.endsWith(".css"))) warnings.push("Nenhum .css em assets/");
}

// SPA fallbacks — pelo menos UM precisa existir
const fallbacks = ["_shell.html", "404.html"].filter((f) => existsSync(resolve(DIST, f)));
if (fallbacks.length === 0) errors.push("Sem fallback SPA (nem _shell.html nem 404.html)");
else ok(`fallback SPA: ${fallbacks.join(", ")}`);

// Adaptadores universais
for (const f of ["_redirects", "_headers", ".nojekyll", "web.config", "health.json", "robots.txt", "sitemap.xml"]) {
  if (!existsSync(resolve(DIST, f))) warnings.push(`${f} ausente — rode node scripts/generate-universal.mjs`);
  else ok(f);
}
if (!existsSync(resolve(DIST, ".htaccess"))) warnings.push(".htaccess ausente (Apache/KingHost) — rode node scripts/generate-htaccess.mjs");

// Rotas prerenderizadas (fonte única)
try {
  const { PRERENDER_ROUTES } = await import("./prerender-routes.mjs");
  let missing = 0;
  for (const route of PRERENDER_ROUTES) {
    const file = route === "/" ? resolve(DIST, "index.html") : resolve(DIST, `.${route}/index.html`);
    if (!existsSync(file)) {
      // /deploy e /health são opcionais no pacote universal (noindex/utilitárias)
      if (route === "/deploy" || route === "/health") warnings.push(`Rota opcional não prerenderizada: ${route}`);
      else {
        errors.push(`Rota não prerenderizada: ${route}`);
        missing++;
      }
    }
  }
  if (missing === 0) ok(`${PRERENDER_ROUTES.length} rotas verificadas`);
} catch {
  warnings.push("prerender-routes.mjs ilegível — pulando checagem de rotas");
}

if (errors.length) {
  console.error("\n✗ Pacote universal INVÁLIDO:");
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
for (const w of warnings) console.warn(`  ! ${w}`);
console.log(`\n✓ Pacote portátil válido em ${DIST} — pronto para qualquer hospedagem.`);
