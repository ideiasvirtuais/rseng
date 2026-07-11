import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, MapPin, Phone, ZoomIn, X, Diamond } from "lucide-react";

import { getProjectBySlug, projects, type GalleryCategory } from "@/data/projects";

const SITE_URL = "https://rseng.lovable.app";

export const Route = createFileRoute("/obras/$slug")({
  loader: ({ params }) => {
    const project = getProjectBySlug(params.slug);
    if (!project) throw notFound();
    return { slug: project.slug };
  },
  head: ({ params }) => {
    const project = getProjectBySlug(params.slug);
    if (!project) {
      return { meta: [{ title: "Obra não encontrada — Rezende Saback" }, { name: "robots", content: "noindex" }] };
    }
    const title = `${project.name} — Rezende Saback Construtora`;
    const description = project.summary;
    const url = `${SITE_URL}/obras/${project.slug}`;
    const image = `${SITE_URL}${project.img}`;
    const statusInfo = project.info.find((i) => i.label === "Status")?.value ?? "";
    const yearInfo = project.info.find((i) => i.label.startsWith("Entrega"))?.value ?? project.year;

    const residenceJsonLd = {
      "@context": "https://schema.org",
      "@type": "Residence",
      name: project.name,
      description,
      url,
      image: [image, ...project.gallery.map((g) => `${SITE_URL}${g.src}`)],
      address: {
        "@type": "PostalAddress",
        streetAddress: project.address,
        addressLocality: "Betim",
        addressRegion: "MG",
        addressCountry: "BR",
      },
      additionalProperty: [
        { "@type": "PropertyValue", name: "Tipologia", value: project.type },
        { "@type": "PropertyValue", name: "Status", value: statusInfo },
        { "@type": "PropertyValue", name: "Entrega", value: yearInfo },
      ],
      amenityFeature: project.highlights.map((h) => ({
        "@type": "LocationFeatureSpecification",
        name: h,
      })),
      provider: {
        "@type": "Organization",
        name: "Rezende Saback Construtora",
        url: SITE_URL,
      },
    };

    const breadcrumbJsonLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Início", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "Empreendimentos", item: `${SITE_URL}/#empreendimentos` },
        { "@type": "ListItem", position: 3, name: project.name, item: url },
      ],
    };

    const gallerySchemaImages = project.gallery.map((g) => ({
      "@type": "ImageObject",
      contentUrl: `${SITE_URL}${g.src}`,
      description: g.alt,
      keywords: g.category,
    }));

    const galleryJsonLd = gallerySchemaImages.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ImageGallery",
          name: `Galeria — ${project.name}`,
          description: `Fotos de ${project.name} organizadas por categoria: ${project.categories.join(", ")}.`,
          url: `${url}#galeria`,
          image: gallerySchemaImages,
        }
      : null;

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:site_name", content: "Rezende Saback Construtora" },
        { property: "og:locale", content: "pt_BR" },
        { property: "og:url", content: url },
        { property: "og:image", content: image },
        { property: "og:image:alt", content: `${project.name} — ${project.type}` },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: image },
        { name: "keywords", content: `${project.name}, ${project.type}, imóveis em Betim, ${project.categories.join(", ")}, Rezende Saback` },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        { type: "application/ld+json", children: JSON.stringify(residenceJsonLd) },
        { type: "application/ld+json", children: JSON.stringify(breadcrumbJsonLd) },
        ...(galleryJsonLd ? [{ type: "application/ld+json", children: JSON.stringify(galleryJsonLd) }] : []),
      ],
    };
  },
  component: ProjectDetail,
  notFoundComponent: ProjectNotFound,
  errorComponent: ProjectError,
});

function ProjectDetail() {
  const { slug } = Route.useLoaderData();
  const project = getProjectBySlug(slug)!;

  const filters = useMemo(
    () => ["Todas", ...project.categories] as ("Todas" | GalleryCategory)[],
    [project.categories],
  );
  const [filter, setFilter] = useState<"Todas" | GalleryCategory>("Todas");
  const [lightbox, setLightbox] = useState<number | null>(null);

  const filteredGallery = useMemo(
    () => (filter === "Todas" ? project.gallery : project.gallery.filter((g) => g.category === filter)),
    [filter, project.gallery],
  );

  const related = projects.filter((p) => p.slug !== project.slug).slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="border-b border-border bg-background">
        <div className="container-x flex items-center justify-between py-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary transition hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Voltar para a página inicial
          </Link>
          <Link to="/" hash="empreendimentos" className="hidden text-sm text-muted-foreground hover:text-primary md:inline">
            Todos os empreendimentos
          </Link>
        </div>
      </div>

      {/* Hero */}
      <section className="container-x pt-10 lg:pt-16">
        <nav aria-label="Navegação estrutural" className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
          <Link to="/" className="hover:text-primary">Início</Link>
          <span className="mx-2">/</span>
          <Link to="/" hash="empreendimentos" className="hover:text-primary">Empreendimentos</Link>
          <span className="mx-2">/</span>
          <span className="text-primary">{project.name}</span>
        </nav>

        <div className="mt-6 grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-start">
          <div>
            <span className="inline-block rounded-full bg-primary px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-primary-foreground">
              {project.tag}
            </span>
            <h1 className="mt-4 text-4xl font-semibold text-primary md:text-5xl">{project.name}</h1>
            <div className="mt-4 flex items-start gap-2 text-muted-foreground">
              <MapPin className="mt-0.5 h-4 w-4 flex-none" aria-hidden="true" />
              <span>{project.address}</span>
            </div>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground">{project.summary}</p>
          </div>

          <aside className="rounded-2xl border border-border bg-card p-6">
            <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Ficha técnica</div>
            <dl className="mt-4 divide-y divide-border">
              {project.info.map((item) => (
                <div key={item.label} className="flex items-start justify-between gap-4 py-3 text-sm">
                  <dt className="text-muted-foreground">{item.label}</dt>
                  <dd className="text-right font-medium text-primary">{item.value}</dd>
                </div>
              ))}
            </dl>
            <a
              href="#contato"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              Falar com o time de vendas
            </a>
          </aside>
        </div>
      </section>

      {/* Cover */}
      <section className="container-x mt-12">
        <div className="overflow-hidden rounded-2xl border border-border">
          <img
            src={project.img}
            alt={`Imagem principal do ${project.name}`}
            width={1600}
            height={1000}
            className="h-full w-full object-cover"
          />
        </div>
      </section>

      {/* Sobre + destaques */}
      <section className="container-x section-y grid gap-12 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Sobre a obra</div>
          <h2 className="mt-4">Um projeto pensado no <span className="text-primary/70">detalhe</span>.</h2>
          <div className="mt-6 space-y-4 text-muted-foreground">
            {project.description.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </div>

        <aside className="rounded-2xl bg-primary p-8 text-primary-foreground">
          <div className="text-xs uppercase tracking-[0.25em] text-accent">Destaques</div>
          <h3 className="mt-3 text-2xl font-semibold">O que este empreendimento entrega</h3>
          <ul className="mt-6 space-y-4">
            {project.highlights.map((h) => (
              <li key={h} className="flex items-start gap-3">
                <Diamond className="mt-0.5 h-4 w-4 flex-none fill-accent text-accent" aria-hidden="true" />
                <span className="text-primary-foreground/90">{h}</span>
              </li>
            ))}
          </ul>
        </aside>
      </section>

      {/* Galeria */}
      <section className="container-x section-y">
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-end">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Galeria</div>
            <h2 className="mt-4">Explore por <span className="text-primary/70">categoria</span>.</h2>
          </div>
          <p className="text-muted-foreground">
            Fotos reais de fachadas, interiores e áreas comuns do {project.name}. Clique em qualquer imagem para ampliar.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          {filters.map((cat) => {
            const active = filter === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setFilter(cat)}
                aria-pressed={active}
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:border-primary hover:text-primary"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredGallery.map((item, i) => (
            <button
              key={`${item.src}-${i}`}
              type="button"
              onClick={() => setLightbox(i)}
              className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-card text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              aria-label={`Ampliar: ${item.alt}`}
            >
              <img
                src={item.src}
                alt={item.alt}
                loading="lazy"
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="pointer-events-none absolute inset-0 flex items-end justify-between gap-2 bg-gradient-to-t from-black/70 via-black/10 to-transparent p-3 text-primary-foreground opacity-0 transition group-hover:opacity-100">
                <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-accent">{item.category}</span>
                <ZoomIn className="h-5 w-5" aria-hidden="true" />
              </div>
            </button>
          ))}
        </div>

        {filteredGallery.length === 0 && (
          <div className="mt-8 rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Nenhuma foto nesta categoria ainda.
          </div>
        )}
      </section>

      {lightbox !== null && filteredGallery[lightbox] && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={filteredGallery[lightbox].alt}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setLightbox(null);
            }}
            aria-label="Fechar imagem"
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
          <figure className="max-h-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <img
              src={filteredGallery[lightbox].src}
              alt={filteredGallery[lightbox].alt}
              className="max-h-[80vh] w-auto rounded-xl object-contain"
            />
            <figcaption className="mt-3 text-center text-sm text-white/80">
              <span className="text-accent">{filteredGallery[lightbox].category}</span> · {filteredGallery[lightbox].alt}
            </figcaption>
          </figure>
        </div>
      )}

      {/* CTA + relacionados */}
      <section id="contato" className="bg-primary text-primary-foreground">
        <div className="container-x section-y grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-accent">Quer conhecer de perto?</div>
            <h2 className="mt-4">
              Agende uma visita ao <span className="text-accent">{project.name}</span>.
            </h2>
            <p className="mt-4 max-w-xl text-primary-foreground/80">
              Nosso time comercial acompanha você em cada etapa — do primeiro contato à entrega das chaves.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
            <Link
              to="/"
              hash="contato"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-primary transition hover:bg-accent/90"
            >
              Fale com um consultor
            </Link>
            <Link
              to="/"
              hash="empreendimentos"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-primary-foreground/30 px-6 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary-foreground/10"
            >
              Ver outros empreendimentos
            </Link>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="container-x section-y">
          <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Outras obras</div>
          <h2 className="mt-4">Continue explorando o portfólio</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <Link
                key={r.slug}
                to="/obras/$slug"
                params={{ slug: r.slug }}
                className="group overflow-hidden rounded-2xl border border-border bg-card transition hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={r.img}
                    alt={r.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <div className="text-[11px] font-medium uppercase tracking-wider text-accent">{r.tag}</div>
                  <div className="mt-1 text-lg font-semibold text-primary">{r.name}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{r.address}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function ProjectNotFound() {
  const { slug } = Route.useParams();
  return (
    <div className="container-x section-y text-center">
      <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">404</div>
      <h1 className="mt-4">Obra não encontrada</h1>
      <p className="mt-3 text-muted-foreground">
        Não encontramos uma obra com o identificador <span className="font-mono">{slug}</span>.
      </p>
      <Link
        to="/"
        hash="empreendimentos"
        className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
      >
        Ver todos os empreendimentos
      </Link>
    </div>
  );
}

function ProjectError({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  return (
    <div className="container-x section-y text-center">
      <h1>Não foi possível carregar esta obra</h1>
      <p className="mt-3 text-muted-foreground">Tente novamente em instantes.</p>
      <button
        type="button"
        onClick={() => {
          reset();
        }}
        className="mt-6 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
      >
        Tentar novamente
      </button>
    </div>
  );
}
