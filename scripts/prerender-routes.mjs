#!/usr/bin/env node
/**
 * Fonte única das rotas estáticas prerenderizadas no build FTP/Apache.
 *
 * Mantida em sincronia manual com:
 * - `src/data/projects.ts` (slugs em `projects[].slug`)
 * - `src/routeTree.gen.ts` (rotas estáticas de `src/routes/`)
 *
 * Consumida por:
 * - `vite.config.ts` → `tanstackStart({ pages, prerender })`
 * - `scripts/verify-prerender.mjs` → valida cada `index.html` gerado
 */

export const STATIC_ROUTES = [
  "/",
  "/galeria",
  "/edificios-residenciais",
  "/edificios-comerciais",
  "/casas-de-alto-padrao",
  "/publicar",
  "/health",
  "/deploy",
];

// Slugs de `src/data/projects.ts` — included Golden Mall (lançamento).
export const OBRA_SLUGS = [
  "golden-mall-rosario",
  "edificio-rosario",
  "edificio-iris",
  "edificio-jo-pena-duarte",
  "edificio-malbec",
  "edificio-santorini",
];

export const OBRA_ROUTES = OBRA_SLUGS.map((slug) => `/obras/${slug}`);

export const PRERENDER_ROUTES = [...STATIC_ROUTES, ...OBRA_ROUTES];
