import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Diamond, X, ZoomIn } from "lucide-react";

import { SiteHeader, segmentNav } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { ContactForm } from "./ContactForm";
import type { Segment } from "@/data/segments";

export function SegmentPage({ segment }: { segment: Segment }) {
  const [photoIndex, setPhotoIndex] = useState<number | null>(null);
  const photo = photoIndex !== null ? segment.photos[photoIndex] : null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="relative min-h-[52vh] w-full">
          {segment.cover && (
            <img
              src={segment.cover}
              alt={segment.coverAlt}
              className="absolute inset-0 h-full w-full object-cover"
              loading="eager"
              decoding="async"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/85 via-primary/70 to-primary/90" />
          <div className="container-x relative flex min-h-[52vh] flex-col justify-end pb-14 pt-24 text-primary-foreground">
            <nav aria-label="Trilha de navegação" className="mb-6 text-xs text-primary-foreground/70">
              <Link to="/" className="hover:text-accent">Início</Link>
              <span className="mx-2">/</span>
              <span className="text-primary-foreground">{segment.label}</span>
            </nav>
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary-foreground/30 bg-primary-foreground/10 px-4 py-1.5 text-xs uppercase tracking-[0.2em] backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              {segment.eyebrow}
            </div>
            <h1 className="mt-6 max-w-3xl">
              {segment.headline} <span className="text-accent">{segment.headlineAccent}</span>.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-primary-foreground/85">{segment.summary}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#fotos"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-primary transition hover:brightness-105"
              >
                Ver fotos <ArrowUpRight className="h-4 w-4" />
              </a>
              <a
                href="#contato"
                className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/40 px-6 py-3 text-sm font-medium text-primary-foreground backdrop-blur hover:bg-primary-foreground/10"
              >
                Falar com um consultor
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Intro + diferenciais */}
      <section className="container-x section-y">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-6 text-lg text-muted-foreground">
            {segment.intro.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <ul className="space-y-4 rounded-2xl border border-border bg-card p-8">
            <li className="text-xs uppercase tracking-[0.25em] text-muted-foreground">O que entregamos</li>
            {segment.features.map((f) => (
              <li key={f} className="flex items-start gap-3">
                <Diamond className="mt-1 h-4 w-4 flex-none fill-accent text-accent" />
                <span className="text-primary">{f}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Empreendimentos do segmento */}
      {segment.projects.length > 0 && (
        <section id="empreendimentos" className="border-y border-border bg-secondary">
          <div className="container-x section-y">
            <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Empreendimentos</div>
            <h2 className="mt-4 max-w-2xl">Obras deste segmento.</h2>

            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {segment.projects.map((p) => (
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
                        <ArrowUpRight className="mt-1 h-5 w-5 flex-none text-muted-foreground transition group-hover:text-primary" aria-hidden="true" />
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">{p.type}</div>
                      <div className="mt-4 flex items-start justify-between gap-4 border-t border-border pt-4 text-sm">
                        <span className="text-muted-foreground">{p.address}</span>
                        <span className="font-medium text-primary">— {p.year}</span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Galeria de fotos do segmento */}
      <section id="fotos" className="container-x section-y">
        <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Galeria</div>
        <h2 className="mt-4 max-w-2xl">Fotos de {segment.label.toLowerCase()}.</h2>

        {segment.photos.length > 0 ? (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {segment.photos.map((item, i) => (
              <button
                key={`${item.src}-${i}`}
                type="button"
                onClick={() => setPhotoIndex(i)}
                className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-card text-left"
                aria-label={`Ampliar ${item.alt}`}
              >
                <img
                  src={item.src}
                  alt={item.alt}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/15 to-transparent opacity-0 transition group-hover:opacity-100" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 text-primary-foreground opacity-0 transition group-hover:opacity-100">
                  <div className="min-w-0">
                    <div className="text-[11px] uppercase tracking-[0.2em] text-accent">{item.caption}</div>
                    <div className="truncate text-sm font-semibold">{item.title}</div>
                  </div>
                  <ZoomIn className="h-5 w-5 shrink-0" />
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            Fotos deste segmento em atualização.
          </div>
        )}
      </section>

      {photo && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Visualização ampliada"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-primary/95 p-4 backdrop-blur-sm"
          onClick={() => setPhotoIndex(null)}
        >
          <button
            type="button"
            aria-label="Fechar"
            className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full border border-primary-foreground/30 text-primary-foreground transition hover:bg-primary-foreground/10"
            onClick={(e) => {
              e.stopPropagation();
              setPhotoIndex(null);
            }}
          >
            <X className="h-5 w-5" />
          </button>
          <figure className="max-h-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <img src={photo.src} alt={photo.alt} className="max-h-[80vh] w-auto rounded-2xl object-contain shadow-2xl" />
            <figcaption className="mt-4 text-center text-sm text-primary-foreground/90">
              <span className="text-accent">{photo.caption}</span> · {photo.title}
            </figcaption>
          </figure>
        </div>
      )}

      {/* Outros segmentos */}
      <section className="border-y border-border bg-secondary">
        <div className="container-x section-y">
          <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Outros segmentos</div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {segmentNav
              .filter((s) => !s.to.endsWith(segment.slug))
              .map((s) => (
                <Link
                  key={s.to}
                  to={s.to}
                  className="group flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-6 transition hover:border-primary/40 hover:shadow-lg"
                >
                  <span className="text-lg font-semibold text-primary">{s.label}</span>
                  <ArrowUpRight className="h-5 w-5 text-muted-foreground transition group-hover:text-primary" aria-hidden="true" />
                </Link>
              ))}
          </div>
        </div>
      </section>

      {/* Contato */}
      <section id="contato" className="container-x section-y">
        <div className="grid gap-16 lg:grid-cols-2">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Central de vendas</div>
            <h2 className="mt-4">
              Tem interesse em <span className="text-primary/70">{segment.label.toLowerCase()}</span>?
            </h2>
            <p className="mt-6 text-muted-foreground">
              Deixe seus dados e um consultor da Rezende Saback retorna em até um dia útil com disponibilidade, plantas e condições.
            </p>
          </div>
          <ContactForm />
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
