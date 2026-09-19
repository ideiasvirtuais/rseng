import { ArrowUpRight, Code2, ExternalLink, Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { COMPANY, DEVELOPER } from "@/data/company";
import { Logo } from "./Logo";
import { segmentNav } from "./segments";

function ExternalCard({
  eyebrow,
  title,
  href,
  label,
  Icon,
}: {
  eyebrow: string;
  title: string;
  href: string;
  label: string;
  Icon: typeof Instagram;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${label} (abre em nova janela)`}
      title={`${label} — abre em nova janela`}
      className="group flex items-center gap-4 rounded-2xl border border-white/15 bg-white/5 p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/70 hover:bg-white/10 hover:shadow-[0_16px_40px_-16px_rgba(0,0,0,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
    >
      <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent text-primary shadow-lg transition-transform duration-300 group-hover:scale-105 group-active:scale-95">
        <Icon aria-hidden="true" focusable="false" className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] font-medium uppercase tracking-[0.2em] text-primary-foreground/60">
          {eyebrow}
        </span>
        <span className="mt-1 block truncate text-base font-semibold text-primary-foreground">
          {title}
        </span>
      </span>
      <ArrowUpRight
        aria-hidden="true"
        focusable="false"
        className="h-5 w-5 shrink-0 text-primary-foreground/70 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent"
      />
    </a>
  );
}

export function SiteFooter() {
  const currentYear = new Date().getFullYear();
  const devYear = (DEVELOPER as { year?: unknown } | undefined)?.year;
  const devName = (DEVELOPER as { name?: unknown } | undefined)?.name;
  const devUrl = (DEVELOPER as { url?: unknown } | undefined)?.url;
  const safeDevYear = typeof devYear === "number" ? devYear : 2026;
  const safeDevName = typeof devName === "string" && devName ? devName : "IDEIAS VIRTUAIS";
  const safeDevUrl = typeof devUrl === "string" && devUrl ? devUrl : "http://www.ideiasvirtuais.com.br/";
  const displayYear = Math.max(currentYear, safeDevYear);

  const company = (COMPANY ?? {}) as {
    name?: unknown;
    hours?: unknown;
    address?: { street?: unknown; district?: unknown; city?: unknown; state?: unknown; cep?: unknown; mapsUrl?: unknown };
    phones?: unknown;
    whatsapp?: { url?: unknown; display?: unknown };
    email?: { href?: unknown; address?: unknown };
    social?: { instagram?: { handle?: unknown; url?: unknown }; facebook?: { handle?: unknown; url?: unknown } };
  };
  const companyName = typeof company.name === "string" && company.name ? company.name : "Rezende Saback";
  const companyHours = typeof company.hours === "string" ? company.hours : "Seg–Sex, 9h às 18h";
  const address = company.address ?? {};
  const street = typeof address.street === "string" ? address.street : "";
  const district = typeof address.district === "string" ? address.district : "";
  const addrCity = typeof address.city === "string" ? address.city : "Betim";
  const addrState = typeof address.state === "string" ? address.state : "MG";
  const cep = typeof address.cep === "string" ? address.cep : "";
  const mapsUrl = typeof address.mapsUrl === "string" && address.mapsUrl ? address.mapsUrl : undefined;
  const phones = Array.isArray(company.phones)
    ? (company.phones as { label?: unknown; href?: unknown }[]).filter(
        (p) => p && typeof p.label === "string" && typeof p.href === "string",
      ) as { label: string; href: string }[]
    : [];
  const waUrl = typeof company.whatsapp?.url === "string" && company.whatsapp.url ? company.whatsapp.url : "https://wa.me/5531993040342";
  const waDisplay = typeof company.whatsapp?.display === "string" ? company.whatsapp.display : "(31) 99304-0342";
  const emailHref = typeof company.email?.href === "string" && company.email.href ? company.email.href : "mailto:contato@rsengenharia.eng.br";
  const emailAddress = typeof company.email?.address === "string" ? company.email.address : "contato@rsengenharia.eng.br";
  const instaHandle = typeof company.social?.instagram?.handle === "string" ? company.social.instagram.handle : "@rezendesabackengenharia";
  const instaUrl = typeof company.social?.instagram?.url === "string" && company.social.instagram.url ? company.social.instagram.url : "https://www.instagram.com/rezendesabackengenharia/";
  const fbHandle = typeof company.social?.facebook?.handle === "string" ? company.social.facebook.handle : "/rezendesaback";
  const fbUrl = typeof company.social?.facebook?.url === "string" && company.social.facebook.url ? company.social.facebook.url : "https://www.facebook.com/rezendesaback";

  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-primary text-primary-foreground">
      {/* Glow decorativo sutil */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 left-1/2 h-64 w-[42rem] -translate-x-1/2 rounded-full bg-accent/15 blur-[100px]"
      />

      <div className="container-x relative pt-16 pb-0">
        {/* Siga-nos */}
        <div className="grid gap-10 border-b border-white/15 pb-12 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-accent">
              Siga-nos
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-primary-foreground sm:text-4xl">
              Acompanhe cada etapa das nossas obras.
            </h2>
            <p className="mt-4 max-w-md leading-relaxed text-primary-foreground/85">
              Bastidores do canteiro, lançamentos e detalhes de acabamento — publicamos
              primeiro nas nossas redes.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <ExternalCard
              eyebrow="Instagram"
              title={instaHandle}
              href={instaUrl}
              label="Seguir a Rezende Saback no Instagram"
              Icon={Instagram}
            />
            <ExternalCard
              eyebrow="Facebook"
              title={fbHandle}
              href={fbUrl}
              label="Seguir a Rezende Saback no Facebook"
              Icon={Facebook}
            />
          </div>
        </div>

        {/* Contato */}
        <div className="mt-8 grid gap-6 border-b border-white/15 pb-8 text-sm text-primary-foreground/85 md:grid-cols-3">
          {mapsUrl ? (
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Ver endereço no Google Maps — abre em nova janela"
            className="group flex items-start gap-2.5 rounded-lg transition hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent/90 transition group-hover:scale-110" />
            <span>
              {street}{street && district ? `, ${district}` : district},{" "}
              {addrCity}/{addrState}{cep ? ` · CEP ${cep}` : ""}
            </span>
          </a>
          ) : (
          <p className="flex items-start gap-2.5">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent/90" />
            <span>
              {street}{street && district ? `, ${district}` : district},{" "}
              {addrCity}/{addrState}{cep ? ` · CEP ${cep}` : ""}
            </span>
          </p>
          )}
          <div className="flex flex-col gap-2">
            {phones.map((p) => (
              <a
                key={p.href}
                href={p.href}
                className="inline-flex w-fit items-center gap-2 rounded-lg transition hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <Phone className="h-4 w-4 shrink-0" /> {p.label}
              </a>
            ))}
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Conversar no WhatsApp — abre em nova janela"
              className="inline-flex w-fit items-center gap-2 rounded-lg transition hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Phone className="h-4 w-4 shrink-0" /> {waDisplay} (WhatsApp)
              <ExternalLink className="h-3.5 w-3.5 opacity-60" aria-hidden="true" />
            </a>
          </div>
          <a
            href={emailHref}
            className="inline-flex h-fit items-start gap-2.5 rounded-lg break-all transition hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Mail className="mt-0.5 h-4 w-4 shrink-0" /> {emailAddress}
          </a>
        </div>

        {/* Navegação */}
        <nav
          aria-label="Navegação do rodapé"
          className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium text-primary-foreground/90"
        >
          {segmentNav.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="relative transition hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {l.label}
            </Link>
          ))}
          <a href="/#contato" className="transition hover:text-accent">
            Contato
          </a>
        </nav>

        {/* Marca + copyright */}
        <div className="mt-8 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <Logo variant="light" />
          <p className="max-w-xl text-xs leading-relaxed text-primary-foreground/60">
            © {displayYear} {companyName} e Incorporadora · {companyHours}. Todos os
            direitos reservados.
          </p>
        </div>

        {/* Barra de crédito IDEIAS VIRTUAIS */}
        <div className="mt-8 border-t border-white/10 py-5">
          <div className="flex flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
            <p className="inline-flex flex-wrap items-center justify-center gap-1.5 text-xs tracking-wide text-primary-foreground/70">
              <Code2 className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
              <span>
                Site desenvolvido por{" "}
                <a
                  href={safeDevUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="IDEIAS VIRTUAIS — abre em nova janela"
                  aria-label="Site desenvolvido por IDEIAS VIRTUAIS (abre em nova janela)"
                  className="group inline-flex items-center gap-1 font-bold uppercase tracking-[0.14em] text-primary-foreground underline decoration-accent/60 decoration-1 underline-offset-4 transition hover:text-accent hover:decoration-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
                >
                  {safeDevName}
                  <ExternalLink
                    className="h-3 w-3 opacity-70 transition-transform duration-200 group-hover:translate-x-px group-hover:-translate-y-px group-hover:opacity-100"
                    aria-hidden="true"
                  />
                </a>{" "}
                <span className="text-primary-foreground/50">·</span> {safeDevYear}
              </span>
            </p>
            <p className="text-[11px] text-primary-foreground/40">
              Todos os links externos abrem em nova janela.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
