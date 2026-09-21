import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Instagram, Menu, X } from "lucide-react";
import { Logo } from "./Logo";
import { segmentNav } from "./segments";
import { COMPANY } from "@/data/company";

// Re-export de compatibilidade (type-only → apagado em compilação,
// sem binding de runtime; não confunde o code-splitter do TanStack).
export type { SegmentRoute } from "./segments";

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  // Item fixo do menu: Lançamento (#lancamento na home). Usa "/#..." para
  // funcionar a partir de qualquer rota (/obras, /galeria, segmentos).
  const hashLinks = [
    { href: "/#lancamento", label: "Lançamento", highlight: true },
    { href: "/galeria", label: "Todas as imagens" },
    { href: "/#sobre", label: "Sobre" },
    { href: "/#contato", label: "Contato" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/95 shadow-[0_8px_30px_-18px_rgba(46,49,146,0.45)] backdrop-blur">
      <div className="container-x grid h-24 grid-cols-[minmax(0,1fr)_auto] items-center gap-4 md:flex md:h-24 md:justify-between">
        <div className="min-w-0">
          <Logo />
        </div>
        <nav aria-label="Navegação principal" className="hidden shrink-0 items-center gap-5 text-sm font-medium text-primary/80 lg:flex xl:gap-6">
          <Link
            to="/"
            activeProps={{ className: "text-primary font-semibold" }}
            activeOptions={{ exact: true }}
            className="shrink-0 whitespace-nowrap hover:text-primary"
          >
            Início
          </Link>
          {segmentNav.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeProps={{ className: "text-primary font-semibold" }}
              className="shrink-0 whitespace-nowrap hover:text-primary"
            >
              {l.label}
            </Link>
          ))}
          {hashLinks.map((l) =>
            (l as { highlight?: boolean }).highlight ? (
              <a
                key={l.href}
                href={l.href}
                className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-accent/60 bg-accent/15 px-4 py-1.5 font-semibold text-primary transition hover:-translate-y-px hover:bg-accent hover:shadow-md"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
                {l.label}
              </a>
            ) : (
              <a key={l.href} href={l.href} className="shrink-0 whitespace-nowrap hover:text-primary">
                {l.label}
              </a>
            ),
          )}
        </nav>
        <div className="flex items-center gap-2">
          <a
            href={COMPANY.social.instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram da Rezende Saback (abre em nova janela)"
            title="Siga-nos no Instagram"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-primary transition hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary hover:text-primary-foreground hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Instagram className="h-4 w-4" aria-hidden="true" />
          </a>
          <a
            href="/#contato"
            className="hidden sm:inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
          >
            Central de vendas <ArrowUpRight className="h-4 w-4" />
          </a>
          <button
            type="button"
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-background text-primary transition hover:bg-secondary lg:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div
        className={`lg:hidden overflow-hidden border-t border-border/60 bg-background transition-[max-height,opacity] duration-300 ${
          menuOpen ? "max-h-[32rem] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="container-x flex flex-col py-4 text-sm font-medium text-primary">
          <Link
            to="/"
            onClick={() => setMenuOpen(false)}
            activeProps={{ className: "font-semibold" }}
            activeOptions={{ exact: true }}
            className="border-b border-border/60 py-3 hover:text-primary/70"
          >
            Início
          </Link>
          {segmentNav.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setMenuOpen(false)}
              className="border-b border-border/60 py-3 hover:text-primary/70"
            >
              {l.label}
            </Link>
          ))}
          {hashLinks.map((l) =>
            (l as { highlight?: boolean }).highlight ? (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-full border border-accent/60 bg-accent/15 px-5 py-3 font-semibold text-primary"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
                {l.label} — Golden Mall Rosário
              </a>
            ) : (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="border-b border-border/60 py-3 hover:text-primary/70"
              >
                {l.label}
              </a>
            ),
          )}
          <a
            href={COMPANY.social.instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 border-b border-border/60 py-3 hover:text-primary/70"
          >
            <Instagram className="h-4 w-4" aria-hidden="true" /> Instagram
          </a>
          <a
            href="/#contato"
            onClick={() => setMenuOpen(false)}
            className="mt-3 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground sm:hidden"
          >
            Central de vendas <ArrowUpRight className="h-4 w-4" />
          </a>
        </nav>
      </div>
    </header>
  );
}
