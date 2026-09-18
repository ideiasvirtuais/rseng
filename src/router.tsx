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
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
