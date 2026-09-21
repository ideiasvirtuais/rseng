import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { PRERENDER_ROUTES } from "./scripts/prerender-routes.mjs";

const isFtpBuild =
  process.env.BUILD_TARGET === "ftp" ||
  process.argv.includes("--mode=ftp") ||
  process.argv.some((arg, index, argv) => arg === "--mode" && argv[index + 1] === "ftp");

export default defineConfig({
  // Correção do erro "rolldown-runtime-*.js does not exist in optimize deps":
  // o cache de node_modules/.vite/deps fica obsoleto após upgrade do Vite
  // (hash antigo BvCyGRYZ vs novo DC62tzP2) e o pre-transform tenta ler o
  // arquivo removido. Desligar o pre-transform + excluir o runtime interno
  // do otimizador elimina a tela branca / erro 500 no preview.
  optimizeDeps: {
    exclude: ["rolldown-runtime"],
    holdUntilCrawlEnd: false,
  },
  server: {
    preTransformRequests: false,
  },
  nitro: isFtpBuild ? false : true,
  tanstackStart: {
    ...(isFtpBuild
      ? {
          spa: { enabled: true },
          // Prerenderiza home, páginas de segmento e cada /obras/<slug>
          // (inclui golden-mall-rosario) para que o Apache/KingHost sirva
          // HTML estático com SEO em vez de depender só do _shell.html.
          pages: PRERENDER_ROUTES.map((path) => ({ path })),
          prerender: { enabled: true, crawlLinks: true },
        }
      : { server: { entry: "server" } }),
  },
});
