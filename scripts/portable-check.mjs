#!/usr/bin/env node
/**
 * Checklist portátil unificado — valida o pacote independente ANTES
 * de publicar em QUALQUER hospedagem.
 *
 * Espelho Node de `src/lib/portability.ts` (PORTABLE_CHECKLIST).
 * Não exige FTP, GitHub, Lovable ou backend — só o diretório do pacote.
 *
 * Uso:
 *   node scripts/portable-check.mjs
 *   node scripts/portable-check.mjs --dir dist/client --url https://meudominio.com
 *   npm run portable:check
 */
import { existsSync, statSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const args = process.argv.slice(2);
const get = (name, fallback) => {
  const i = args.findIndex((a) => a === `--${name}`);
  if (i >= 0 && args[i + 1]) return args[i + 1];
  const eq = args.find((a) => a.startsWith(`--${name}=`));
  if (eq) return eq.split("=").slice(1).join("=");
  return fallback;
};

const ROOT = process.cwd();
const DIR = resolve(ROOT, get("dir", process.env.STATIC_OUT_DIR || "dist/client"));
const BASE_URL = (get("url", process.env.SITE_URL || "") || "").replace(/\/+$/, "");

let pass = 0;
let fail = 0;
const ok = (m) => { pass++; console.log(`✓ ${m}`); };
const bad = (m) => { fail++; console.error(`✗ ${m}`); };
const info = (m) => console.log(`  · ${m}`);

console.log(`→ Checklist portátil em ${DIR}\n`);

const need = (rel, min = 100) => {
  const f = resolve(DIR, rel);
  if (!existsSync(f)) { bad(`ausente: ${rel}`); return null; }
  if (statSync(f).size < min) { bad(`muito pequeno: ${rel}`); return null; }
  return f;
};

const index = need("index.html", 800);
if (index) {
  const html = readFileSync(index, "utf8");
  if (html.includes("assets/")) ok("index.html referencia assets/ (JS/CSS)");
  else bad("index.html sem referência a assets/");
  if (/<div[^>]*id=["']root["']/.test(html) || html.includes('id="root"')) ok("index.html tem #root (SPA monta)");
  else info("index.html sem #root visível — prerender puro, ok se houver conteúdo");
}

if (existsSync(resolve(DIR, "assets"))) {
  const { readdirSync } = await import("node:fs");
  const files = readdirSync(resolve(DIR, "assets"));
  if (files.some((f) => f.endsWith(".js"))) ok(`assets/ com JS (${files.length} arquivos)`);
  else bad("assets/ sem .js");
} else bad("ausente: assets/");

const fb = ["_shell.html", "404.html"].filter((f) => existsSync(resolve(DIR, f)));
if (!fb.length) bad("sem fallback SPA (_shell.html / 404.html)");
else ok(`fallback SPA: ${fb.join(", ")}`);

for (const f of ["_redirects", "_headers", ".nojekyll", "web.config", "nginx.conf", ".htaccess", "health.json", "robots.txt", "sitemap.xml", "manifest.webmanifest"]) {
  if (existsSync(resolve(DIR, f))) ok(f);
  else info(`${f} ausente (adaptador opcional do host correspondente)`);
}

try {
  const { PRERENDER_ROUTES } = await import("./prerender-routes.mjs");
  let missing = 0;
  for (const r of PRERENDER_ROUTES) {
    const f = r === "/" ? resolve(DIR, "index.html") : resolve(DIR, `.${r}/index.html`);
    if (!existsSync(f) && r !== "/deploy" && r !== "/health") { bad(`rota não prerenderizada: ${r}`); missing++; }
  }
  if (!missing) ok(`${PRERENDER_ROUTES.length} rotas verificadas`);
} catch { info("prerender-routes.mjs ilegível — rotas puladas"); }

if (BASE_URL) {
  info(`Validando URLs remotas em ${BASE_URL} (requer rede)…`);
  const paths = ["/", "/obras/golden-mall-rosario", "/robots.txt", "/sitemap.xml", "/health.json"];
  for (const p of paths) {
    try {
      const r = await fetch(`${BASE_URL}${p}`, { redirect: "follow" });
      if (r.ok) ok(`GET ${p} → ${r.status}`);
      else bad(`GET ${p} → ${r.status}`);
    } catch (e) { bad(`GET ${p} falhou: ${String(e).slice(0, 120)}`); }
  }
} else {
  info("sem --url: checagem remota pulada (rode com --url https://meudominio.com pós-deploy)");
}

console.log(`\n${fail === 0 ? "✓ PACOTE PORTÁTIL VÁLIDO" : "✗ PACOTE COM PENDÊNCIAS"} — ${pass} ok, ${fail} falhas.`);
console.log("GitHub e FTP Napoleon são apenas opções — este pacote sobe em qualquer host.\n");
process.exit(fail === 0 ? 0 : 1);
