#!/usr/bin/env node
/**
 * verify-live.mjs — compara o build local (dist/client) com a produção.
 * Uso: node scripts/verify-live.mjs [url]
 * Saída: tamanhos, bundles JS, Last-Modified e diagnóstico atualizado/defasado.
 */
import { readFileSync } from "node:fs";

const url = (process.argv[2] ?? "https://rsengenharia.eng.br/").replace(/\/+$/, "") + "/";

function bundles(html) {
  return [...new Set(html.match(/assets\/[^"']+\.js/g) ?? [])];
}

const localHtml = readFileSync("dist/client/index.html", "utf8");
const res = await fetch(url, { headers: { "User-Agent": "rseng-verify/1.0" } });
const liveHtml = await res.text();

const localBundles = bundles(localHtml);
const liveBundles = bundles(liveHtml);
const localMain = localBundles[0] ?? "(nenhum)";
const liveMain = liveBundles[0] ?? "(nenhum)";

console.log(`URL:              ${url}`);
console.log(`HTTP:             ${res.status} ${res.statusText}`);
console.log(`Last-Modified:    ${res.headers.get("last-modified") ?? "(ausente)"}`);
console.log(`Server:           ${res.headers.get("server") ?? "(ausente)"}`);
console.log(`Local index.html: ${localHtml.length} bytes — main ${localMain}`);
console.log(`Live  index.html: ${liveHtml.length} bytes — main ${liveMain}`);
console.log(`Bundles locais:   ${localBundles.slice(0, 8).join(", ")}`);
console.log(`Bundles ao vivo:  ${liveBundles.slice(0, 8).join(", ")}`);

if (localMain === liveMain && localHtml.length === liveHtml.length) {
  console.log("\n✓ ATUALIZADO — produção idêntica ao build local.");
  process.exit(0);
} else {
  console.log("\n✗ DESATUALIZADO — hashes de bundle/tamanho divergem da produção.");
  console.log("  Push na main publica só em staging; produção exige workflow_dispatch");
  console.log("  (environment=production) + credenciais FTP KingHost válidas (erro 530 atual).");
  process.exit(2);
}
