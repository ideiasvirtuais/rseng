import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowUpRight, Diamond, Facebook, Instagram, Mail, MapPin, Menu, Phone, X, ZoomIn } from "lucide-react";

import heroBuilding from "@/assets/hero-building.jpg";
import interiorCustom from "@/assets/interior-custom.jpg";
import ogCover from "@/assets/og-cover.jpg";
import logoAsset from "@/assets/logo-rezende-saback.png.asset.json";
import { galleryCategories, galleryItems, projects, type GalleryFilter } from "@/data/projects";
import { ContactForm } from "@/components/ContactForm";

const LOGO_URL = logoAsset.url;

const SITE_URL = "https://rsengenharia.eng.br";
const OG_IMAGE = `${SITE_URL}${ogCover}`;
const OG_TITLE = "Rezende Saback Construtora — Empreendimentos em Betim/MG";
const OG_DESCRIPTION =
  "Construtora e incorporadora em Betim desde 1988. Lançamentos, imóveis prontos para morar e personalização de plantas com acabamento diferenciado.";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: OG_TITLE },
      { name: "description", content: OG_DESCRIPTION },
      { property: "og:title", content: OG_TITLE },
      { property: "og:description", content: OG_DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Rezende Saback Construtora" },
      { property: "og:locale", content: "pt_BR" },
      { property: "og:url", content: `${SITE_URL}/` },
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
    links: [{ rel: "canonical", href: `${SITE_URL}/` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ImageGallery",
          name: "Galeria de obras — Rezende Saback",
          description:
            "Fachadas, áreas comuns e interiores dos empreendimentos entregues e em construção pela Rezende Saback em Betim/MG.",
          url: `${SITE_URL}/#galeria`,
          about: {
            "@type": "Organization",
            name: "Rezende Saback Construtora",
            url: SITE_URL,
          },
          image: galleryItems.map((g) => ({
            "@type": "ImageObject",
            contentUrl: `${SITE_URL}${g.src}`,
            description: g.alt,
            keywords: g.category,
            representativeOfPage: false,
            creditText: `${g.project} — Rezende Saback`,
          })),
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Empreendimentos Rezende Saback",
          itemListElement: projects.map((p, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: `${SITE_URL}/obras/${p.slug}`,
            name: p.name,
          })),
        }),
      },
    ],
  }),
});


const stats = [
  { n: "35+", l: "Anos de história" },
  { n: "40+", l: "Obras entregues" },
  { n: "1.200+", l: "Famílias atendidas" },
  { n: "5", l: "Empreendimentos ativos" },
];

const perks = [
  "Planta adaptável antes da obra",
  "Acabamentos premium à sua escolha",
  "Instalações elétricas customizadas",
  "Acompanhamento técnico contínuo",
];


function Logo({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const isLight = variant === "light";

  return (
    <a
      href="#top"
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
    </a>
  );
}

function Index() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [galleryFilter, setGalleryFilter] = useState<GalleryFilter>("Todas");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const filteredGallery = useMemo(
    () => (galleryFilter === "Todas" ? galleryItems : galleryItems.filter((g) => g.category === galleryFilter)),
    [galleryFilter],
  );

  const navLinks = [
    { href: "#empreendimentos", label: "Empreendimentos" },
    { href: "#galeria", label: "Galeria" },

    { href: "#personalizacao", label: "Personalização" },
    { href: "#sobre", label: "Sobre" },
    { href: "#instagram", label: "Instagram" },
    { href: "#contato", label: "Contato" },
  ];

  return (
    <div id="top" className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur">
        <div className="container-x grid h-20 grid-cols-[minmax(0,1fr)_auto] items-center gap-4 md:flex md:justify-between">
          <div className="min-w-0">
            <Logo />
          </div>
          <nav className="hidden items-center gap-8 text-sm font-medium text-primary/80 md:flex">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} className="hover:text-primary">{l.label}</a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
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
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-background text-primary transition hover:bg-secondary md:hidden"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {/* Mobile menu */}
        <div
          className={`md:hidden overflow-hidden border-t border-border/60 bg-background transition-[max-height,opacity] duration-300 ${
            menuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <nav className="container-x flex flex-col py-4 text-sm font-medium text-primary">
            {navLinks.map((l) => (
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
          <img
            src={heroBuilding}
            alt="Fachada residencial ao entardecer"
            width={1920}
            height={1280}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/40 via-primary/30 to-background" />
          <div className="container-x relative flex h-full flex-col justify-end pb-16 pt-32">
            <div className="max-w-3xl text-primary-foreground">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-foreground/30 bg-primary-foreground/10 px-4 py-1.5 text-xs uppercase tracking-[0.2em] backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                Desde 1988 · Betim, Minas Gerais
              </div>
              <h1>
                A cidade que <span className="text-accent">cresce</span> com quem constrói para durar.
              </h1>
              <p className="mt-6 max-w-xl text-lg text-primary-foreground/85">
                Empreendimentos residenciais e comerciais projetados com acabamento diferenciado, planta customizável e a assinatura de mais de três décadas de engenharia.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#empreendimentos" className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-primary transition hover:brightness-105">
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
                <div className="mt-2 text-xl font-semibold text-primary-foreground">Edifício Rosário</div>
                <div className="mt-1 text-sm text-primary-foreground/75">Business & Home · Angola</div>
                <a href="#empreendimentos" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent">
                  Conheça o empreendimento <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="container-x -mt-16 relative z-10">
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border shadow-xl lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.l} className="bg-card p-8">
                <div className="text-4xl font-semibold text-primary tracking-tight">{s.n}</div>
                <div className="mt-2 text-sm text-muted-foreground">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Empreendimentos */}
      <section id="empreendimentos" className="container-x section-y">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-end">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Portfólio</div>
            <h2 className="mt-4">
              Empreendimentos que formam <span className="text-primary/70">bairros inteiros</span>.
            </h2>
          </div>
          <p className="text-muted-foreground">
            De lançamentos a imóveis prontos para morar. Cada projeto assinado pela Rezende Saback carrega o mesmo padrão de acabamento e a mesma preocupação com a vizinhança.
          </p>
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <Link
              key={p.slug}
              to="/obras/$slug"
              params={{ slug: p.slug }}
              aria-label={`Ver detalhes de ${p.name}`}
              className="group overflow-hidden rounded-2xl border border-border bg-card transition hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            >
              <article>
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={p.img}
                    alt={p.name}
                    width={1200}
                    height={900}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                  <span className="absolute left-4 top-4 rounded-full bg-background/95 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-primary">
                    {p.tag}
                  </span>
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-xl font-semibold text-primary">{p.name}</h3>
                    <ArrowUpRight className="mt-1 h-5 w-5 flex-none text-muted-foreground transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" aria-hidden="true" />
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">{p.type}</div>
                  <div className="mt-4 flex items-start justify-between gap-4 border-t border-border pt-4 text-sm">
                    <span className="text-muted-foreground">{p.address}</span>
                    <span className="font-medium text-primary">— {p.year}</span>
                  </div>
                  <div className="mt-4 text-xs font-medium uppercase tracking-[0.2em] text-accent">
                    Ver detalhes
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </section>

      {/* Personalização */}
      <section id="personalizacao" className="bg-primary text-primary-foreground">
        <div className="container-x grid gap-16 section-y lg:grid-cols-2 lg:items-center">
          <div className="relative overflow-hidden rounded-2xl">
            <img
              src={interiorCustom}
              alt="Interior de apartamento personalizado"
              width={1400}
              height={1000}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-accent">Feito para você</div>
            <h2 className="mt-4">
              Receba as chaves com o seu imóvel <span className="text-accent">já pronto</span>.
            </h2>
            <p className="mt-6 text-primary-foreground/80">
              Planta customizada, instalações elétricas e hidráulicas sob medida e acabamentos diferenciados escolhidos antes mesmo da mudança. Você entra em um apartamento pensado exatamente do jeito que sempre quis.
            </p>
            <ul className="mt-8 space-y-4">
              {perks.map((perk) => (
                <li key={perk} className="flex items-start gap-3">
                  <Diamond className="mt-0.5 h-4 w-4 flex-none fill-accent text-accent" />
                  <span className="text-primary-foreground/90">{perk}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Galeria */}
      <section id="galeria" className="container-x section-y">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-end">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Galeria de obras</div>
            <h2 className="mt-4">
              Detalhes que só a <span className="text-primary/70">obra pronta</span> revela.
            </h2>
          </div>
          <p className="text-muted-foreground">
            Fachadas, áreas comuns e interiores dos nossos empreendimentos em Betim. Filtre por categoria para explorar cada aspecto do nosso padrão construtivo.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap gap-2">
          {galleryCategories.map((cat) => {
            const active = galleryFilter === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setGalleryFilter(cat)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-primary hover:border-primary/50 hover:bg-secondary"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredGallery.map((item, i) => (
            <button
              key={`${item.src}-${i}`}
              type="button"
              onClick={() => setLightboxIndex(i)}
              className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-card text-left"
              aria-label={`Ampliar ${item.alt}`}
            >
              <img
                src={item.src}
                alt={item.alt}
                loading="lazy"
                className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/10 to-transparent opacity-0 transition group-hover:opacity-100" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 text-primary-foreground opacity-0 transition group-hover:opacity-100">
                <div className="min-w-0">
                  <div className="text-[11px] uppercase tracking-[0.2em] text-accent">{item.category}</div>
                  <div className="truncate text-sm font-semibold">{item.project}</div>
                </div>
                <ZoomIn className="h-5 w-5 shrink-0" />
              </div>
            </button>
          ))}
        </div>

        {filteredGallery.length === 0 && (
          <div className="mt-10 rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            Nenhuma foto nesta categoria ainda.
          </div>
        )}
      </section>

      {/* Lightbox */}
      {lightboxIndex !== null && filteredGallery[lightboxIndex] && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Visualização ampliada"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-primary/95 p-4 backdrop-blur-sm"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            type="button"
            aria-label="Fechar"
            className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full border border-primary-foreground/30 text-primary-foreground transition hover:bg-primary-foreground/10"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex(null);
            }}
          >
            <X className="h-5 w-5" />
          </button>
          <figure className="max-h-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <img
              src={filteredGallery[lightboxIndex].src}
              alt={filteredGallery[lightboxIndex].alt}
              className="max-h-[80vh] w-auto rounded-2xl object-contain shadow-2xl"
            />
            <figcaption className="mt-4 text-center text-sm text-primary-foreground/90">
              <span className="text-accent">{filteredGallery[lightboxIndex].category}</span> · {filteredGallery[lightboxIndex].project}
            </figcaption>
          </figure>
        </div>
      )}

      {/* Sobre */}
      <section id="sobre" className="container-x section-y">

        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Sobre a construtora</div>
            <h2 className="mt-4">
              Três décadas construindo o skyline de Betim — um empreendimento sólido de cada vez.
            </h2>
          </div>
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

      {/* Instagram */}
      <section id="instagram" className="border-y border-border bg-secondary">
        <div className="container-x section-y text-center">
          <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Nas redes</div>
          <h2 className="mt-4">
            Acompanhe as obras no nosso <span className="text-primary/70">Instagram</span>.
          </h2>
          <a
            href="https://www.instagram.com/rezendesabackengenharia/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Abrir o perfil @rezendesabackengenharia no Instagram (nova aba)"
            className="mt-6 inline-flex items-center gap-2 text-primary hover:underline"
          >
            <Instagram aria-hidden="true" focusable="false" className="h-4 w-4" /> @rezendesabackengenharia
          </a>
          <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-dashed border-border bg-card/60 p-8 text-sm text-muted-foreground">
            <div className="font-medium text-primary">Feed do Instagram em configuração</div>
            <p className="mt-2">
              Para exibir as postagens do perfil aqui automaticamente, conecte um widget do Instagram e insira o ID no arquivo <code className="rounded bg-muted px-1.5 py-0.5">src/routes/index.tsx</code>.
            </p>
            <a
              href="https://www.instagram.com/rezendesabackengenharia/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Ver o perfil da Rezende Saback no Instagram (nova aba)"
              className="mt-4 inline-flex items-center gap-1 font-medium text-primary hover:underline"
            >
              Ver perfil enquanto isso <ArrowUpRight aria-hidden="true" focusable="false" className="h-4 w-4" />
            </a>
          </div>

        </div>
      </section>

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
                { icon: Phone, label: "31 3531 1342", href: "tel:+553135311342" },
                { icon: Phone, label: "31 3531 1384", href: "tel:+553135311384" },
                { icon: Phone, label: "31 99304 0342", href: "tel:+5531993040342" },
                { icon: Mail, label: "contato@rsengenharia.eng.br", href: "mailto:contato@rsengenharia.eng.br" },
              ].map((c) => (
                <a key={c.label} href={c.href} className="flex items-center gap-3 text-primary hover:underline">
                  <c.icon className="h-4 w-4" /> {c.label}
                </a>
              ))}
              <div className="flex items-start gap-3 pt-4 text-muted-foreground">
                <MapPin className="mt-0.5 h-4 w-4 flex-none text-primary" />
                <div>
                  Av. Teotônio Parreira Coelho, 613, 6º andar<br />
                  Jardim da Cidade, Betim · CEP 32604275
                </div>
              </div>
            </div>
          </div>

          <ContactForm />

        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-primary text-primary-foreground">
        <div className="container-x pt-16 pb-10">
          {/* Siga-nos */}
          <div className="grid gap-10 border-b border-primary-foreground/15 pb-12 lg:grid-cols-[1fr_1.2fr] lg:items-center">
            <div>
              <div className="text-xs uppercase tracking-[0.25em] text-accent">Siga-nos</div>
              <h2 className="mt-3 text-3xl font-semibold text-primary-foreground sm:text-4xl">
                Acompanhe cada etapa das nossas obras.
              </h2>
              <p className="mt-4 max-w-md text-primary-foreground/75">
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
                <ArrowUpRight aria-hidden="true" focusable="false" className="h-5 w-5 shrink-0 text-primary-foreground/70 transition group-hover:text-accent" />
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
                <ArrowUpRight aria-hidden="true" focusable="false" className="h-5 w-5 shrink-0 text-primary-foreground/70 transition group-hover:text-accent" />
              </a>
            </div>
          </div>

          {/* Bottom row */}
          <div className="mt-8 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <Logo variant="light" />
            <div className="text-xs text-primary-foreground/60">
              © {new Date().getFullYear()} Rezende Saback Construtora e Incorporadora. Todos os direitos reservados.
            </div>
          </div>
        </div>
      </footer>


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

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
        {required && <span className="text-accent"> *</span>}
      </span>
      {children}
    </label>
  );
}
