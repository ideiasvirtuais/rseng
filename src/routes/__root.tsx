import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Component, useEffect, useMemo, useState, type ReactNode } from "react";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";
import { COMPANY, OG_IMAGE, SITE_URL } from "../data/company";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { installClientErrorReporter, reportClientError } from "../lib/client-error-reporter";
import { WhatsAppFloat } from "../components/WhatsAppFloat";
import { SiteNotice } from "../components/SiteNotice";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: unknown; reset: () => void }) {
  console.error(error);
  // Normalizado com useMemo: sem isso, um erro não-Error geraria um novo
  // objeto a cada render, religando o efeito de reporte em loop.
  const normalized = useMemo(
    () =>
      error instanceof Error
        ? error
        : new Error(
            typeof error === "string" && error.length > 0
              ? error
              : "Erro desconhecido ao carregar a página",
          ),
    [error],
  );
  // useRouter pode lançar se o próprio contexto do roteador estiver
  // comprometido — nesse caso o fallback é o reload da página.
  let router: ReturnType<typeof useRouter> | undefined;
  try {
    router = useRouter();
  } catch {
    router = undefined;
  }
  useEffect(() => {
    try {
      reportLovableError(normalized, { boundary: "tanstack_root_error_component" });
    } catch {
      // reporte nunca pode quebrar a tela de erro
    }
    try {
      reportClientError(normalized, "react_error_boundary", { boundary: "tanstack_root_error_component" });
    } catch {
      // reporte nunca pode quebrar a tela de erro
    }
  }, [normalized]);

  const handleRetry = () => {
    try {
      router?.invalidate();
    } catch {
      // segue para o reset mesmo se a invalidação falhar
    }
    try {
      reset();
    } catch {
      window.location.reload();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={handleRetry}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: `${COMPANY.name} — ${COMPANY.tagline}` },
      { name: "description", content: `Desde ${COMPANY.foundedYear}, a ${COMPANY.name} constrói empreendimentos residenciais e comerciais em ${COMPANY.city}/${COMPANY.state} com acabamento diferenciado e planta customizável.` },
      { name: "author", content: "Rezende Saback Engenharia" },
      { name: "theme-color", content: "#2E3192" },
      { property: "og:site_name", content: COMPANY.name },
      { property: "og:title", content: `${COMPANY.name} — ${COMPANY.tagline}` },
      { property: "og:description", content: `Desde ${COMPANY.foundedYear}, a ${COMPANY.name} constrói empreendimentos residenciais e comerciais em ${COMPANY.city}/${COMPANY.state} com acabamento diferenciado e planta customizável.` },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "pt_BR" },
      { property: "og:url", content: `${SITE_URL}/` },
      { property: "og:image", content: `${SITE_URL}${OG_IMAGE}` },
      { property: "og:image:secure_url", content: `${SITE_URL}${OG_IMAGE}` },
      { property: "og:image:type", content: "image/jpeg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: `${SITE_URL}${OG_IMAGE}` },
      { name: "twitter:title", content: `${COMPANY.name} — ${COMPANY.tagline}` },
      { name: "twitter:description", content: `Desde ${COMPANY.foundedYear}, a ${COMPANY.name} constrói empreendimentos residenciais e comerciais em ${COMPANY.city}/${COMPANY.state} com acabamento diferenciado e planta customizável.` },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: `${import.meta.env.BASE_URL}favicon.png`.replace(/\/\//g, "/"), type: "image/png" },
      { rel: "apple-touch-icon", href: `${import.meta.env.BASE_URL}apple-touch-icon.png`.replace(/\/\//g, "/") },
      { rel: "preload", href: `${import.meta.env.BASE_URL}hero-rosario.jpg`.replace(/\/\//g, "/"), as: "image", fetchPriority: "high" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

/**
 * Boundary de classe para widgets auxiliares do shell.
 * O shellComponent do TanStack Router fica FORA do CatchBoundary da rota:
 * se um widget não-essencial (aviso, flutuante, toasts) lançar, nada o
 * captura e o resultado é tela branca. Com este guard, o widget defeituoso
 * é descartado em silêncio e a página continua renderizando.
 */
class ShellGuard extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error("[ShellGuard]", error);
  }

  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        <ShellGuard>
          <SiteNotice />
        </ShellGuard>
        {children}
        <ShellGuard>
          <WhatsAppFloat />
        </ShellGuard>
        <ShellGuard>
          <Toaster richColors position="top-right" />
        </ShellGuard>
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  // Cliente de fallback para o caso extremo de o contexto do roteador
  // chegar vazio (ex: HMR recriando o router). Sem isso, a
  // desestruturação lançaria e derrubaria todas as rotas filhas.
  const [fallbackClient] = useState(() => new QueryClient());
  let contextClient: QueryClient | undefined;
  try {
    contextClient = Route.useRouteContext()?.queryClient;
  } catch {
    contextClient = undefined;
  }
  const queryClient = contextClient ?? fallbackClient;

  useEffect(() => {
    try {
      installClientErrorReporter();
    } catch {
      // telemetria opcional — nunca pode impedir a renderização
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
    </QueryClientProvider>
  );
}
