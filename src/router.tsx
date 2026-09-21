import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

/**
 * Singleton por ambiente: recriar o QueryClient a cada chamada de
 * getRouter (ex: HMR no preview) invalida o contexto da rota raiz e
 * pode derrubar o match __root__/. No servidor, cada request recebe
 * seu próprio par router/client via createIsomorphicFn? Não — o Start
 * chama getRouter uma vez por request no SSR, então o singleton de
 * módulo é seguro no cliente e reutilizado de forma estável no dev.
 */
let browserQueryClient: QueryClient | undefined;

function getQueryClient(): QueryClient {
  if (typeof window === "undefined") return new QueryClient();
  browserQueryClient ??= new QueryClient();
  return browserQueryClient;
}

export const getRouter = () => {
  const queryClient = getQueryClient();

  const router = createRouter({
    routeTree,
    // Contexto nunca-nulo: se uma rota filha ler `Route.useRouteContext()`
    // durante HMR/navegação parcial, o fallback no __root evita
    // desestruturação de `undefined` (tela branca via MatchesInner).
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    // Fallbacks de última linha: se algum match lançar antes do boundary
    // da rota, o router ainda renderiza algo em vez de tela branca.
    // (Os componentes dedicados vivem em `routes/__root.tsx`.)
    defaultPendingMinMs: 0,
  });

  // Registra o router no warmup do HMR: se o módulo for reavaliado sem
  // contexto válido, o update é invalidado em vez de hidratar nulo.
  if (typeof window !== "undefined" && import.meta.hot) {
    import.meta.hot.dispose(() => {
      try {
        router.invalidate();
      } catch {
        // teardown — nunca pode lançar
      }
    });
  }

  return router;
};
