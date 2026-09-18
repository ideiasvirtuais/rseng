import { ArrowUpRight, Instagram } from "lucide-react";

import { COMPANY } from "@/data/company";

/**
 * Bloco "Nas redes" da home — paridade com https://rsengenharia.eng.br/.
 *
 * O feed automático do Instagram ainda está em configuração (o widget
 * oficial será ligado via embed quando o ID for fornecido); enquanto isso,
 * exibimos o estado de fallback 1:1 com a produção + CTA para o perfil.
 */
export function HomeInstagram() {
  return (
    <section aria-labelledby="instagram-title" className="border-y border-border bg-secondary">
      <div className="container-x section-y grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Nas redes</div>
          <h2 id="instagram-title" className="mt-4">
            Acompanhe as obras no nosso Instagram.
          </h2>
          <a
            href={COMPANY.social.instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-2 font-medium text-primary hover:underline"
          >
            <Instagram className="h-4 w-4" aria-hidden="true" />
            {COMPANY.social.instagram.handle}
          </a>
          <div className="mt-8 rounded-2xl border border-dashed border-border bg-card p-8 text-center">
            <p className="text-sm font-medium text-primary">Feed do Instagram em configuração</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Para exibir as postagens do perfil aqui automaticamente, conecte um widget do Instagram e
              insira o ID no arquivo <code className="font-mono">src/routes/index.tsx</code>.
            </p>
            <a
              href={COMPANY.social.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
            >
              Ver perfil enquanto isso <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </div>
        <aside className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="flex items-center gap-3 border-b border-border p-5">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Instagram className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-primary">{COMPANY.social.instagram.handle}</p>
              <p className="text-xs text-muted-foreground">Bastidores, lançamentos e acabamentos</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-px bg-border" aria-hidden="true">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-square animate-pulse bg-card" />
            ))}
          </div>
          <p className="p-5 text-xs text-muted-foreground">
            Publicamos primeiro nas nossas redes — siga o perfil para ver cada etapa das obras.
          </p>
        </aside>
      </div>
    </section>
  );
}
