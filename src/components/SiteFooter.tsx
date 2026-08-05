import { ArrowUpRight, Facebook, Instagram } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { Logo, segmentNav } from "./SiteHeader";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-primary text-primary-foreground">
      <div className="container-x pt-16 pb-10">
        <div className="grid gap-10 border-b border-primary-foreground/15 pb-12 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-accent">Siga-nos</div>
            <h2 className="mt-3 text-3xl font-semibold text-primary-foreground sm:text-4xl">
              Acompanhe cada etapa das nossas obras.
            </h2>
            <p className="mt-4 max-w-md text-primary-foreground/90">
              Bastidores do canteiro, lançamentos e detalhes de acabamento — publicamos primeiro nas nossas redes.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <a
              href="https://www.instagram.com/rezendesabackengenharia/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Seguir a Rezende Saback no Instagram (abre em nova aba)"
              className="group flex items-center gap-4 rounded-2xl border border-primary-foreground/15 bg-primary-foreground/5 p-5 transition hover:border-accent hover:bg-primary-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
            >
              <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent text-primary transition group-hover:scale-105">
                <Instagram aria-hidden="true" focusable="false" className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs uppercase tracking-[0.2em] text-primary-foreground/60">Instagram</span>
                <span className="mt-1 block truncate text-base font-semibold text-primary-foreground">@rezendesabackengenharia</span>
              </span>
              <ArrowUpRight aria-hidden="true" focusable="false" className="h-5 w-5 shrink-0 text-primary-foreground/90 transition group-hover:text-accent" />
            </a>
            <a
              href="https://www.facebook.com/rezendesaback"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Seguir a Rezende Saback no Facebook (abre em nova aba)"
              className="group flex items-center gap-4 rounded-2xl border border-primary-foreground/15 bg-primary-foreground/5 p-5 transition hover:border-accent hover:bg-primary-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
            >
              <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent text-primary transition group-hover:scale-105">
                <Facebook aria-hidden="true" focusable="false" className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs uppercase tracking-[0.2em] text-primary-foreground/60">Facebook</span>
                <span className="mt-1 block truncate text-base font-semibold text-primary-foreground">/rezendesaback</span>
              </span>
              <ArrowUpRight aria-hidden="true" focusable="false" className="h-5 w-5 shrink-0 text-primary-foreground/90 transition group-hover:text-accent" />
            </a>
          </div>
        </div>

        <nav className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-primary-foreground/90">
          {segmentNav.map((l) => (
            <Link key={l.to} to={l.to} className="hover:text-accent">
              {l.label}
            </Link>
          ))}
          <a href="/#contato" className="hover:text-accent">Contato</a>
        </nav>

        <div className="mt-8 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <Logo variant="light" />
          <div className="text-xs text-primary-foreground/60">
            © {new Date().getFullYear()} Rezende Saback Construtora e Incorporadora. Todos os direitos reservados.
          </div>
        </div>
      </div>
    </footer>
  );
}
