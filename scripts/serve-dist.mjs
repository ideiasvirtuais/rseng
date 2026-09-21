#!/usr/bin/env node
/**
 * Servidor estático ZERO-dependência para o pacote independente.
 *
 * Prova de portabilidade: serve `dist/client/` (ou $STATIC_OUT_DIR) com
 * SPA fallback, MIME corretos e cache — sem Vite, sem Node framework,
 * sem GitHub, sem FTP. Qualquer máquina com Node >= 18 consegue validar
 * o pacote antes de subir para a hospedagem real.
 *
 * Uso:
 *   node scripts/serve-dist.mjs
 *   node scripts/serve-dist.mjs --dir dist/client --port 4173 --base /minha-pasta/
 *   npm run portable:serve
 */
import { createServer } from "node:http";
import { existsSync, statSync, readFileSync } from "node:fs";
import { resolve, join, extname, normalize } from "node:path";

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
const PORT = Number(get("port", process.env.PORT || "4173")) || 4173;
const BASE = (() => {
  const raw = get("base", process.env.BASE_PATH || "/");
  const l = raw.startsWith("/") ? raw : `/${raw}`;
  return l.endsWith("/") ? l : `${l}/`;
})();

if (!existsSync(DIR) || !existsSync(join(DIR, "index.html"))) {
  console.error(`✗ Pacote não encontrado em ${DIR}\n  Rode \`npm run build:static\` primeiro.`);
  process.exit(1);
}

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".webmanifest": "application/manifest+json",
  ".map": "application/json; charset=utf-8",
};

function send(res, code, body, type, cache) {
  res.writeHead(code, {
    "Content-Type": type,
    "Content-Length": Buffer.byteLength(body),
    "Cache-Control": cache,
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
  });
  res.end(body);
}

function serveFile(res, abs) {
  const ext = extname(abs).toLowerCase();
  const type = MIME[ext] || "application/octet-stream";
  const cache = abs.endsWith(".html")
    ? "no-cache, no-store, must-revalidate"
    : abs.includes(`${DIR}/assets/`) || abs.includes(`${DIR}\\assets\\`)
      ? "public, max-age=31536000, immutable"
      : "public, max-age=86400, must-revalidate";
  try {
    const buf = readFileSync(abs);
    res.writeHead(200, {
      "Content-Type": type,
      "Content-Length": buf.length,
      "Cache-Control": cache,
      "X-Content-Type-Options": "nosniff",
    });
    res.end(buf);
  } catch {
    send(res, 500, "read error", "text/plain; charset=utf-8", "no-store");
  }
}

const server = createServer((req, res) => {
  try {
    const url = new URL(req.url || "/", "http://localhost");
    let path = decodeURIComponent(url.pathname);
    if (BASE !== "/" && path.startsWith(BASE.replace(/\/$/, ""))) {
      path = path.slice(BASE.replace(/\/$/, "").length) || "/";
    }
    const safe = normalize(path).replace(/^(\.\.[/\\])+/, "");
    const rel = safe.replace(/^\//, "");
    const abs = join(DIR, rel);

    if (existsSync(abs) && statSync(abs).isFile()) return serveFile(res, abs);
    if (existsSync(abs) && statSync(abs).isDirectory()) {
      const idx = join(abs, "index.html");
      if (existsSync(idx)) return serveFile(res, idx);
    }
    // SPA fallback: rota profunda -> _shell.html -> 404.html -> index.html
    for (const f of ["_shell.html", "404.html", "index.html"]) {
      const fb = join(DIR, f);
      if (existsSync(fb)) return serveFile(res, fb);
    }
    send(res, 404, "not found", "text/plain; charset=utf-8", "no-store");
  } catch {
    send(res, 500, "server error", "text/plain; charset=utf-8", "no-store");
  }
});

server.listen(PORT, () => {
  console.log(`\n✓ Pacote independente servido em http://localhost:${PORT}${BASE}`);
  console.log(`  dir:  ${DIR}`);
  console.log(`  base: ${BASE}`);
  console.log(`  Teste: /obras/golden-mall-rosario  /health.json  /robots.txt`);
  console.log(`  (Ctrl+C para parar — GitHub e FTP não são necessários aqui)\n`);
});
