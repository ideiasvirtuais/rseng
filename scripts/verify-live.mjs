#!/usr/bin/env node
/**
 * verify-live.mjs — compara o build local (dist/client) com o que está no ar.
 *
 * Uso:
 *   node scripts/verify-live.mjs                 # usa https://rsengenharia.eng.br
 *   node scripts/verify-live.mjs https://outro.dominio
 *   node scripts/verify-live.mjs --quiet         # só o resumo final
 *
 * Para cada página prerenderizada compara: HTTP status, tamanho do HTML e o
 * bundle principal (assets/index-*.js). Também confere robots.txt e sitemap.xml.
 * Sai com código 2 se algo estiver defasado — serve para saber se o deploy FTP
 * realmente chegou ao domínio.
 */
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { PRERENDER_ROUTES } from "./prerender-routes.mjs";

const args = process.argv.slice(2);
const QUIET = args.includes("--quiet");
const target = args.find((a) => !a.startsWith("--"));
const BASE = (target ?? process.env.SITE_URL ?? "https://rsengenharia.eng.br").replace(/\/+$/, "");
const TIMEOUT_MS = Number(process.env.VERIFY_TIMEOUT_MS ?? 30_000);
const DIST = resolve(process.cwd(), "dist/client");

const c = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  bold: "\x1b[1m",
};

function bundles(html) {
  return [...new Set(html.match(/assets\/[^"']+\.(?:js|css)/g) ?? [])];
}

function mainBundle(html) {
  return (
    html.match(/assets\/index-[^"']+\.js/)?.[0] ??
    bundles(html).find((a) => a.endsWith(".js")) ??
    "(nenhum)"
  );
}

function localPathFor(route) {
  return route === "/"
    ? join(DIST, "index.html")
    : join(DIST, route.replace(/^\//, ""), "index.html");
}

function liveUrlFor(route) {
  return route === "/" ? `${BASE}/` : `${BASE}${route}`;
}

async function fetchPage(url) {
  const res = await fetch(url, {
    redirect: "follow",
    headers: { "User-Agent": "rseng-verify/1.0", "Cache-Control": "no-cache" },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const body = await res.text();
  return { res, body };
}

if (!existsSync(join(DIST, "index.html"))) {
  console.error(
    "\n✗ Build local ausente em dist/client/. Rode `bun run build:ftp` antes de verificar.\n",
  );
  process.exit(1);
}

const routes = [...new Set(["/", ...PRERENDER_ROUTES])];

console.log(`${c.bold}Verificando ${BASE}${c.reset}`);
console.log(`${c.dim}comparando com ${DIST} — ${routes.length} página(s)${c.reset}\n`);

let failed = false;
const rows = [];

for (const route of routes) {
  const localFile = localPathFor(route);
  const url = liveUrlFor(route);

  if (!existsSync(localFile)) {
    failed = true;
    rows.push({ route, ok: false, note: "ausente no build local" });
    continue;
  }

  try {
    const localHtml = readFileSync(localFile, "utf8");
    const { res, body: liveHtml } = await fetchPage(url);
    const localMain = mainBundle(localHtml);
    const liveMain = mainBundle(liveHtml);
    const sameSize = localHtml.length === liveHtml.length;
    const sameBundle = localMain === liveMain;
    const ok = res.status === 200 && sameSize && sameBundle;
    if (!ok) failed = true;

    rows.push({
      route,
      ok,
      status: res.status,
      localBytes: localHtml.length,
      liveBytes: liveHtml.length,
      localMain,
      liveMain,
      lastModified: res.headers.get("last-modified") ?? "(ausente)",
      note: ok
        ? ""
        : res.status !== 200
          ? `HTTP ${res.status}`
          : !sameBundle
            ? "bundle diferente do build local"
            : "tamanho do HTML diferente do build local",
    });
  } catch (err) {
    failed = true;
    rows.push({ route, ok: false, note: `falha: ${err?.message ?? err}` });
  }
}

for (const r of rows) {
  const mark = r.ok ? `${c.green}✓${c.reset}` : `${c.red}✗${c.reset}`;
  const name = r.route.padEnd(30);

  if (r.status == null) {
    console.log(`${mark} ${name} ${c.red}${r.note}${c.reset}`);
    continue;
  }

  console.log(
    `${mark} ${name} HTTP ${r.status}  local ${String(r.localBytes).padStart(6)} B  ` +
      `live ${String(r.liveBytes).padStart(6)} B`,
  );

  if (!QUIET && !r.ok) {
    console.log(`${c.dim}    local: ${r.localMain}${c.reset}`);
    console.log(`${c.dim}    live:  ${r.liveMain} · Last-Modified: ${r.lastModified}${c.reset}`);
  }
  if (r.note) console.log(`    ${c.red}${r.note}${c.reset}`);
}

// ── arquivos estáticos críticos ─────────────────────────────────────────────
console.log(`\n${c.bold}Arquivos estáticos${c.reset}`);

for (const name of ["robots.txt", "sitemap.xml"]) {
  const localFile = join(DIST, name);
  const mark = (ok) => (ok ? `${c.green}✓${c.reset}` : `${c.red}✗${c.reset}`);

  if (!existsSync(localFile)) {
    failed = true;
    console.log(`${mark(false)} ${name.padEnd(30)} ausente no build local`);
    continue;
  }

  try {
    const { res, body } = await fetchPage(`${BASE}/${name}`);
    const ok =
      res.status === 200 &&
      (name === "sitemap.xml" ? body.includes(BASE) : /Allow: \//.test(body));
    if (!ok) failed = true;
    console.log(
      `${mark(ok)} ${name.padEnd(30)} HTTP ${res.status}  ${body.length} B  ` +
        `${ok ? "conteúdo correto" : "conteúdo divergente do domínio"}`,
    );
  } catch (err) {
    failed = true;
    console.log(`${mark(false)} ${name.padEnd(30)} falha: ${err?.message ?? err}`);
  }
}

// ── veredito ────────────────────────────────────────────────────────────────
console.log("");
const pages = rows.length;
const okPages = rows.filter((r) => r.ok).length;

if (!failed) {
  console.log(
    `${c.green}${c.bold}✓ ATUALIZADO${c.reset} — ${okPages}/${pages} página(s) idênticas ao build local.`,
  );
  console.log(`${c.dim}Produção está servindo exatamente este pacote.${c.reset}`);
  process.exit(0);
}

console.log(
  `${c.red}${c.bold}✗ DESATUALIZADO${c.reset} — ${pages - okPages} de ${pages} página(s) divergem da produção.`,
);
console.log(
  `${c.dim}O pacote local só chega ao ar quando o deploy FTP conclui: confira o run de${c.reset}`,
);
console.log(
  `${c.dim}.github/workflows/lovable-deploy.yml e as credenciais FTP no servidor.${c.reset}`,
);
process.exit(2);
