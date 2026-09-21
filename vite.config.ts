import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { PRERENDER_ROUTES } from "./scripts/prerender-routes.mjs";

const isFtpBuild =
  process.env.BUILD_TARGET === "ftp" ||
  process.argv.includes("--mode=ftp") ||
  process.argv.some((arg, index, argv) => arg === "--mode" && argv[index + 1] === "ftp");

// PORTABILIDADE MÁXIMA: o mesmo build publica em qualquer hospedagem.
// - BUILD_TARGET=static (default, `npm run build:static`) ou ftp (legado KingHost)
// - BASE_PATH / VITE_BASE_PATH permite publicar em subpasta (GitHub Pages de
//   projeto, /staging, addon de cPanel...) sem trocar código.
// - SITE_URL / VITE_SITE_URL define o canônico do SEO sem travar no oficial.
const isStaticBuild =
  process.env.BUILD_TARGET === "static" || process.env.BUILD_TARGET === undefined || isFtpBuild;

const basePath = (() => {
  const raw = process.env.BASE_PATH ?? process.env.VITE_BASE_PATH ?? "/";
  const withLeading = raw.startsWith("/") ? raw : `/${raw}`;
  const normalized = withLeading.endsWith("/") ? withLeading : `${withLeading}/`;
  return normalized.replace(/\/\//g, "/");
})();

export default defineConfig({
  vite: {
    // `base` portátil: raiz por default, subpasta via BASE_PATH.
    base: basePath,
    // Correção do erro "rolldown-runtime-*.js does not exist in optimize deps":
    // o cache de node_modules/.vite/deps fica obsoleto após upgrade do Vite
    // e o pre-transform tenta ler o arquivo removido. Desligar o
    // pre-transform + excluir o runtime interno do otimizador elimina a
    // tela branca / erro 500 no preview.
    optimizeDeps: {
      exclude: ["rolldown-runtime"],
      // Garante UMA única cópia do React no grafo do Vite (dev + preview).
      // Sem isso, o TanStack Router pode resolver um namespace `react` nulo/
      // duplicado e qualquer `React.useContext` lança
      // "Cannot read properties of null (reading 'useContext')", que o
      // CatchBoundary global reporta em Matches.js como tela branca.
      include: ["react", "react-dom", "react/jsx-runtime", "@tanstack/react-router"],
      holdUntilCrawlEnd: false,
    },
    resolve: {
      // Deduplica o React em todo o grafo (incl. deps linkadas do Lovable).
      dedupe: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "@tanstack/react-router",
        "@tanstack/react-query",
      ],
    },
    server: {
      preTransformRequests: false,
    },
  },
  nitro: isStaticBuild ? false : true,
  tanstackStart: {
    ...(isStaticBuild
      ? {
          spa: { enabled: true },
          // Prerenderiza home, páginas de segmento e cada /obras/<slug>
          // (inclui golden-mall-rosario) + /publicar para que QUALQUER
          // hospedagem estática (Apache, Nginx, S3, Netlify, IIS...)
          // sirva HTML com SEO em vez de depender só do _shell.html.
          pages: PRERENDER_ROUTES.map((path) => ({ path })),
          prerender: { enabled: true, crawlLinks: true },
        }
      : { server: { entry: "server" } }),
  },
});
