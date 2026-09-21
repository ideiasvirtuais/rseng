import { createFileRoute, Link } from "@tanstack/react-router";
import { Component, useState, type ReactNode } from "react";
import { ArrowUpRight, Instagram, Mail, MapPin, Menu, Phone, X } from "lucide-react";

import sedePhoto from "@/assets/sede-rezende-saback.webp.asset.json";
import { COMPANY, COMPANY_YEARS, SITE_URL } from "@/data/company";
import { HERO_FALLBACK_URL, HERO_URL, type AssetJson } from "@/lib/images";
import { projects } from "@/data/projects";
import { ContactForm } from "@/components/ContactForm";
import { GoldenMallSpotlight } from "@/components/GoldenMallSpotlight";
import { HeroBackground } from "@/components/HeroBackground";
// Galeria de obras desabilitada por solicitação (título "Detalhes que só a obra pronta revela").
// Componente preservado em `src/components/HomeGallery.tsx` para reativação futura.
// import { HomeGallery } from "@/components/HomeGallery";
// Galeria "Todas as imagens" removida da home por solicitação (50 fotos pesavam o LCP).
// Catálogo completo segue disponível em `/galeria` via `src/components/AllImagesGallery.tsx`.
// import { AllImagesGallery } from "@/components/AllImagesGallery";
import { HomeInstagram } from "@/components/HomeInstagram";
import { SmartImage } from "@/components/SmartImage";
import { Logo } from "@/components/Logo";
import { segmentNav, type SegmentRoute } from "@/components/segments";
import { SiteFooter } from "@/components/SiteFooter";
import { segments, type SegmentSlug } from "@/data/segments";

/**
 * Mapa slug → rota literal. O <Link> do TanStack Router valida o `to`
 * em runtime: interpolar string dinâmica (`/${slug}`) contorna a checagem
 * de tipos e um slug inesperado lança "Error in route match". O mapa
 * mantém tipos literais e um fallback seguro para a home.
 */
const SEGMENT_ROUTES: Record<SegmentSlug, SegmentRoute> = {
  "edificios-residenciais": "/edificios-residenciais",
  "edificios-comerciais": "/edificios-comerciais",
  "casas-de-alto-padrao": "/casas-de-alto-padrao",
};

function segmentRouteOf(slug: string): SegmentRoute | "/" {
  return (SEGMENT_ROUTES as Record<string, SegmentRoute>)[slug] ?? "/";
}

/** URL da foto da sede com acesso defensivo (import pode falhar em HMR). */
function sedePhotoUrl(): string {
  const maybe = sedePhoto as AssetJson | { default?: unknown } | undefined | null;
  if (!maybe) return "";
  if (typeof (maybe as AssetJson).url === "string") return (maybe as AssetJson).url;
  return "";
}


/**
 * OG usa o arquivo estável de public/ (nunca o hash do Vite):
 * o hash muda a cada build e crawlers/WhatsApp cacheiam a URL antiga → 404.
 * Constantes defensivas: acesso via optional chaining para nunca lançar
 * em module evaluation (derrubaria o match __root__/).
 */
const _companyName = (COMPANY as { name?: unknown } | undefined)?.name;
const _tagline = (COMPANY as { tagline?: unknown } | undefined)?.tagline;
const _founded = (COMPANY as { foundedYear?: unknown } | undefined)?.foundedYear;
const _siteUrl = typeof SITE_URL === "string" && SITE_URL ? SITE_URL : "https://rsengenharia.eng.br";
const OG_IMAGE = `${_siteUrl}/og-cover.jpg`;
const OG_TITLE = `${typeof _companyName === "string" && _companyName ? _companyName : "Rezende Saback"} — ${typeof _tagline === "string" && _tagline ? _tagline : "Empreendimentos em Betim/MG"}`;
const OG_DESCRIPTION =
  `Construtora e incorporadora em Betim desde ${typeof _founded === "number" ? _founded : 1988}. Lançamento Golden Mall Rosário com planta customizada e acabamento premium, além de imóveis prontos para morar.`;

export const Route = createFileRoute("/")({
  component: Index,
  head: () => {
    try {
      const companyName = (COMPANY as { name?: unknown } | undefined)?.name;
      const safeName = typeof companyName === "string" && companyName ? companyName : "Rezende Saback";
      const safeSiteUrl = typeof SITE_URL === "string" && SITE_URL ? SITE_URL : "https://rsengenharia.eng.br";
      const list = Array.isArray(projects) ? projects : [];
      const items = list
        .filter((p) => p && typeof (p as { slug?: unknown }).slug === "string" && typeof (p as { name?: unknown }).name === "string")
        .map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: `${safeSiteUrl}/obras/${(p as { slug: string }).slug}`,
          name: (p as { name: string }).name,
        }));
      return {
        meta: [
          { title: OG_TITLE },
          { name: "description", content: OG_DESCRIPTION },
          { property: "og:title", content: OG_TITLE },
          { property: "og:description", content: OG_DESCRIPTION },
          { property: "og:type", content: "website" },
          { property: "og:site_name", content: safeName },
          { property: "og:locale", content: "pt_BR" },
          { property: "og:url", content: `${safeSiteUrl}/` },
          { property: "og:image", content: OG_IMAGE },
          { property: "og:image:secure_url", content: OG_IMAGE },
          { property: "og:image:type", content: "image/jpeg" },
          { property: "og:image:width", content: "1200" },
          { property: "og:image:height", content: "630" },
          { property: "og:image:alt", content: "Fachada de empreendimento residencial da Rezende Saback ao entardecer, em Betim/MG" },
          { name: "twitter:card", content: "summary_large_image" },
          { name: "twitter:title", content: OG_TITLE },
          { name: "twitter:description", content: OG_DESCRIPTION },
          { name: "twitter:image", content: OG_IMAGE },
          { name: "twitter:image:alt", content: "Fachada de empreendimento residencial da Rezende Saback ao entardecer, em Betim/MG" },
        ],
        links: [
          { rel: "canonical", href: `${safeSiteUrl}/` },
        ],
        scripts: [
          {
            type: "application/ld+json",
            children: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ItemList",
              name: `Empreendimentos ${safeName}`,
              itemListElement: items,
            }),
          },
        ],
      };
    } catch {
      return { meta: [{ title: "Rezende Saback — Empreendimentos em Betim/MG" }] };
    }
  },
});


const stats = [
  { n: `${COMPANY_YEARS}+`, l: "Anos de história em Betim" },
  { n: "200+", l: "Obras entregues" },
  { n: "1.000+", l: "Famílias atendidas" },
];

/**
 * Boundary local por seção: se um widget da home lançar (ex: dados
 * parciais em HMR, imagem inválida), apenas a seção some — a rota
 * continua renderizando em vez de cair em "Error in route match".
 */
class SectionGuard extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    try {
      console.error("[SectionGuard]", error);
    } catch {
      // no-op
    }
  }
  render() {
    if (this.state.failed) return null;
    try {
      return this.props.children;
    } catch {
      return null;
    }
  }
}


function Index() {
  const [menuOpen, setMenuOpen] = useState(false);
  // Home leve: sem pré-carregamento das 50 fotos (só hero + covers via lazy).
  // O catálogo completo carrega apenas em `/galeria`.

  const navLinks = [
    { href: "#personalizacao", label: "Lançamento" },
    { href: "#sobre", label: "Sobre" },
    { href: "#contato", label: "Contato" },
  ];

  // Acessos defensivos: COMPANY pode chegar undefined em HMR/navegação
  // parcial — sem optional chaining, o render lançava (tela branca).
  const foundedYear = COMPANY?.foundedYear ?? 1988;
  const city = COMPANY?.city ?? "Betim";
  const phones = COMPANY?.phones ?? [];
  const whatsappUrl = COMPANY?.whatsapp?.url ?? "#contato";
  const whatsappDisplay = COMPANY?.whatsapp?.display ?? "";
  const emailHref = COMPANY?.email?.href ?? "mailto:";
  const emailAddress = COMPANY?.email?.address ?? "";
  const address = COMPANY?.address;
  const hours = (COMPANY as { hours?: string } | undefined)?.hours ?? "";
  const heroSrc = typeof HERO_URL === "string" ? HERO_URL : "";
  const heroFallback = typeof HERO_FALLBACK_URL === "string" ? HERO_FALLBACK_URL : "";


  return (
    <div id="top" className="min-h-screen bg-background text-foreground">
      {/* Header — logomarca oficial LOGOMARCA-RS-1024x253.png no topo */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/95 shadow-[0_8px_30px_-18px_rgba(46,49,146,0.45)] backdrop-blur">
        <div className="container-x grid h-24 grid-cols-[minmax(0,1fr)_auto] items-center gap-4 md:flex md:h-24 md:justify-between">
          <div className="min-w-0">
            <Logo />
          </div>
          <nav className="hidden items-center gap-6 text-sm font-medium text-primary/80 lg:flex">
            <Link to="/" activeOptions={{ exact: true }} activeProps={{ className: "text-primary font-semibold" }} className="hover:text-primary">Início</Link>
            {segmentNav.map((l) => (
              <Link key={l.to} to={l.to} className="hover:text-primary">{l.label}</Link>
            ))}
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} className="hover:text-primary">{l.label}</a>
            ))}
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
              href="#contato"
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
        {/* Mobile menu */}
        <div
          className={`lg:hidden overflow-hidden border-t border-border/60 bg-background transition-[max-height,opacity] duration-300 ${
            menuOpen ? "max-h-[36rem] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <nav className="container-x flex flex-col py-4 text-sm font-medium text-primary">
            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
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
            {navLinks.map((l) => (

              <a
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="border-b border-border/60 py-3 hover:text-primary/70"
              >
                {l.label}
              </a>
            ))}
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
              href="#contato"
              onClick={() => setMenuOpen(false)}
              className="mt-3 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground sm:hidden"
            >
              Central de vendas <ArrowUpRight className="h-4 w-4" />
            </a>
          </nav>
        </div>
      </header>


      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="relative h-[92vh] min-h-[640px] w-full">
          <HeroBackground
            src={heroSrc}
            fallbackSrc={heroFallback}
            alt="Empreendimento da Rezende Saback no bairro Angola, Betim/MG — foto oficial atualizada"
          />
          {/* Overlay de legibilidade: escurece o topo para o texto e faz a
              transição suave para o fundo da página na base — sem cobrir a
              foto com véu sólido (era `to-background`, que apagava a imagem). */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/70 via-primary/30 to-primary/80" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />

          <div className="container-x relative flex h-full flex-col justify-end pb-16 pt-32">
            <div className="max-w-3xl text-primary-foreground">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-foreground/30 bg-primary-foreground/10 px-4 py-1.5 text-xs uppercase tracking-[0.2em] backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                Desde {foundedYear} · {city}, Minas Gerais
              </div>
              <h1>
                A cidade que <span className="text-accent">cresce</span> com quem constrói para durar.
              </h1>
              <p className="mt-6 max-w-xl text-lg text-primary-foreground/85">
                Empreendimentos residenciais e comerciais projetados com acabamento diferenciado, planta customizável e a assinatura de mais de três décadas de engenharia.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#segmentos" className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-primary transition hover:brightness-105">
                  Ver empreendimentos <ArrowUpRight className="h-4 w-4" />
                </a>
                <a href="#contato" className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/40 px-6 py-3 text-sm font-medium text-primary-foreground backdrop-blur hover:bg-primary-foreground/10">
                  Falar com um consultor
                </a>
              </div>
            </div>

            {/* Feature card */}
            <div className="mt-14 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
              <div className="rounded-2xl border border-primary-foreground/20 bg-primary-foreground/10 p-6 backdrop-blur-md lg:max-w-md">
                <div className="text-xs uppercase tracking-[0.2em] text-accent">Lançamento</div>
                <div className="mt-2 text-xl font-semibold text-primary-foreground">Golden Mall – Rosário</div>
                <div className="mt-1 text-sm text-primary-foreground/90">12 lojas · Módulos de 90 m² a 140 m² · Angola</div>
                <Link
                  to="/obras/$slug"
                  params={{ slug: "golden-mall-rosario" }}
                  className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent"
                >
                  Conheça o empreendimento <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="container-x -mt-16 relative z-10">
          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border shadow-xl sm:grid-cols-3">
            {stats.map((s) => (
              <div key={s.l} className="bg-card p-8">
                <div className="text-4xl font-semibold text-primary tracking-tight">{s.n}</div>
                <div className="mt-2 text-sm text-muted-foreground">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Segmentos */}
      <section id="segmentos" className="container-x section-y">
        <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Segmentos</div>
        <h2 className="mt-4 max-w-2xl">Portfólio.</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {(Array.isArray(segments) ? segments : []).map((s) => {
            const slug = (s as { slug?: unknown })?.slug;
            const cover = (s as { cover?: unknown })?.cover;
            const coverAlt = (s as { coverAlt?: unknown })?.coverAlt;
            const label = (s as { label?: unknown })?.label;
            const summary = (s as { summary?: unknown })?.summary;
            if (typeof slug !== "string" || !slug) return null;
            return (
            <Link
              key={slug}
              to={segmentRouteOf(slug)}
              className="group overflow-hidden rounded-2xl border border-border bg-card transition hover:shadow-xl"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <SmartImage
                  src={typeof cover === "string" ? cover : ""}
                  alt={typeof coverAlt === "string" ? coverAlt : typeof label === "string" ? label : "Empreendimento"}
                  wrapperClassName="h-full w-full"
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
              </div>
              <div className="p-6">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-xl font-semibold text-primary">{typeof label === "string" ? label : ""}</h3>
                  <ArrowUpRight className="mt-1 h-5 w-5 flex-none text-muted-foreground transition group-hover:text-primary" aria-hidden="true" />
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{typeof summary === "string" ? summary : ""}</p>
              </div>
            </Link>
            );
          })}
        </div>
      </section>


      {/* Feito para você — Destaque lançamento Golden Mall Rosário */}
      <SectionGuard>
        <GoldenMallSpotlight />
      </SectionGuard>

      {/* Galeria de obras desabilitada por solicitação — seção "Detalhes que só a obra pronta revela" removida da home.
          Âncora vazia preservada: rotas /obras/$slug linkam para /#galeria; sem o id esses links caíam no topo.
          Componente mantido em src/components/HomeGallery.tsx para reativação futura. */}
      <span id="galeria" aria-hidden="true" className="block h-0 w-0 overflow-hidden" />

      {/* Galeria completa removida da home por solicitação (50 fotos).
          Acesso preservado via CTA leve para `/galeria` — home não baixa mais
          todas as imagens, apenas hero + covers sob demanda. */}
      <section aria-label="Ver todas as fotos" className="container-x pb-4">
        <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm sm:flex-row sm:items-center">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Galeria completa</div>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Quer ver todas as fotos dos empreendimentos? Abra a galeria completa em uma página dedicada.
            </p>
          </div>
          <Link
            to="/galeria"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
          >
            Abrir galeria completa <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* Sobre */}
      <section id="sobre" className="container-x section-y">

        <div className="mx-auto max-w-3xl text-center">
          <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Sobre a construtora</div>
          <h2 className="mt-4">
            Desde {foundedYear} construindo o skyline de Betim — um empreendimento sólido de cada vez.
          </h2>
        </div>

        <div className="mt-14 grid items-center gap-12 lg:grid-cols-2">
          <figure className="overflow-hidden rounded-2xl border border-border bg-card">
            <SmartImage
              src={sedePhotoUrl()}
              alt="Sede da Rezende Saback Construtora — Edifício Londres, fachada em pastilha azul e branca em Betim/MG"
              wrapperClassName="block w-full"
              className="h-full w-full object-cover"
            />
            <figcaption className="px-5 py-3 text-sm text-muted-foreground">
              Sede da Rezende Saback — Edifício Londres, Betim/MG.
            </figcaption>
          </figure>

          <div className="space-y-6 text-lg text-muted-foreground">
            <p>
              A Rezende Saback nasceu com o compromisso de entregar residências duráveis, com técnica apurada e acabamento honesto. Trabalhamos com equipe própria, fornecedores auditados e um padrão de qualidade que se vê no detalhe.
            </p>
            <p>
              Nosso portfólio combina lançamentos comerciais e residenciais, sempre em localizações estratégicas. Cada projeto é acompanhado da concepção à entrega das chaves, e continua com o cliente através da nossa assistência pós-obra.
            </p>
          </div>
        </div>

      </section>


      {/* Nas redes — feed do Instagram (em configuração) */}
      <SectionGuard>
        <HomeInstagram />
      </SectionGuard>

      {/* Contato */}
      <section id="contato" className="container-x section-y">
        <div className="grid gap-16 lg:grid-cols-2">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Central de vendas</div>
            <h2 className="mt-4">
              Cadastre-se e receba <span className="text-primary/70">os próximos lançamentos</span>.
            </h2>
            <p className="mt-6 text-muted-foreground">
              Deixe seus dados abaixo ou fale diretamente com um consultor. Retornamos em até um dia útil.
            </p>

            <div className="mt-10 space-y-4">
              {[
                ...(phones ?? []).map((p) => ({ icon: Phone, label: p?.label ?? "", href: p?.href ?? "#contato" })),
                { icon: Phone, label: `${whatsappDisplay} (WhatsApp)`, href: whatsappUrl },
                { icon: Mail, label: emailAddress, href: emailHref },
              ].filter((c) => c?.label && c?.href).map((c) => (
                <a key={c.label} href={c.href} target={c.href?.startsWith?.("https") ? "_blank" : undefined} rel={c.href?.startsWith?.("https") ? "noopener noreferrer" : undefined} className="flex items-center gap-3 text-primary hover:underline">
                  <c.icon className="h-4 w-4" /> {c.label}
                </a>
              ))}
              {address?.mapsUrl ? (
              <a href={address.mapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 pt-4 text-muted-foreground hover:text-primary">
                <MapPin className="mt-0.5 h-4 w-4 flex-none text-primary" />
                <div>
                  {address?.street ?? ""}<br />
                  {address?.district ?? ""}, {address?.city ?? ""} · CEP {address?.cep ?? ""}
                  {hours ? <span className="mt-1 block text-xs uppercase tracking-wider">{hours}</span> : null}
                </div>
              </a>
              ) : null}
            </div>
          </div>

          <SectionGuard>
            <ContactForm />
          </SectionGuard>

        </div>
      </section>

      {/* Rodapé institucional único — inclui crédito IDEIAS VIRTUAIS + links em nova janela */}
      <SectionGuard>
        <SiteFooter />
      </SectionGuard>


      <style>{`
        .input {
          width: 100%;
          border: 1px solid var(--color-border);
          background: var(--color-background);
          border-radius: 0.5rem;
          padding: 0.65rem 0.9rem;
          font-size: 0.9rem;
          color: var(--color-foreground);
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .input:focus {
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px color-mix(in oklab, var(--color-primary) 15%, transparent);
        }
      `}</style>
    </div>
  );
}
