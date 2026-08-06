import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Menu, X } from "lucide-react";

const LOGO_URL = "/logo-rezende-saback.png";

export function Logo({ variant = "dark", to = "/" }: { variant?: "dark" | "light"; to?: string }) {
  const isLight = variant === "light";
  return (
    <Link
      to={to}
      aria-label="Rezende Saback Construtora — início"
      className={`inline-flex items-center ${isLight ? "rounded-md bg-primary-foreground/95 px-3 py-2" : ""}`}
    >
      <img
        src={LOGO_URL}
        alt="Rezende Saback Construtora"
        width={470}
        height={114}
        className="h-10 w-auto md:h-12"
        loading="eager"
        decoding="async"
      />
    </Link>
  );
}

export const segmentNav = [
  { to: "/edificios-residenciais", label: "Residenciais" },
  { to: "/edificios-comerciais", label: "Comerciais" },
  { to: "/casas-de-alto-padrao", label: "Casas" },
];

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  const hashLinks = [
    
    { href: "/#galeria", label: "Galeria" },
    { href: "/#sobre", label: "Sobre" },
    { href: "/#contato", label: "Contato" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur">
      <div className="container-x grid h-20 grid-cols-[minmax(0,1fr)_auto] items-center gap-4 md:flex md:justify-between">
        <div className="min-w-0">
          <Logo />
        </div>
        <nav className="hidden items-center gap-6 text-sm font-medium text-primary/80 lg:flex">
          {segmentNav.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeProps={{ className: "text-primary font-semibold" }}
              className="hover:text-primary"
            >
              {l.label}
            </Link>
          ))}
          {hashLinks.map((l) => (
            <a key={l.href} href={l.href} className="hover:text-primary">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
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
          {hashLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="border-b border-border/60 py-3 last:border-0 hover:text-primary/70"
            >
              {l.label}
            </a>
          ))}
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
