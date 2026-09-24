import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { SmartImage } from "@/components/SmartImage";
import { Lightbox } from "@/components/Lightbox";
import type { Project } from "@/data/projects";
import type { Segment, SegmentPhoto } from "@/data/segments";

type SegmentPageProps = { segment: Segment };

export function SegmentPage({ segment }: SegmentPageProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Dedupe defensivo: garante que cada foto do array é única por `src`,
  // mesmo se algum `flatMap` em projects.ts repetir.
  const uniquePhotos = useMemo(() => {
    try {
      const seen = new Set<string>();
      const out: SegmentPhoto[] = [];
      for (const p of segment?.photos ?? []) {
        const src = typeof p?.src === "string" ? p.src : "";
        if (!src || seen.has(src)) continue;
        seen.add(src);
        out.push(p);
      }
      return out;
    } catch {
      return segment?.photos ?? [];
    }
  }, [segment?.photos, segment?.slug]);

  // Reset lightbox quando o segmento muda (navegação entre páginas).
  useEffect(() => {
    setLightboxIndex(null);
  }, [segment?.slug]);

  return (
    <main className="bg-background pb-24 pt-12 md:pt-16">
      {/* Cabeçalho */}
      <section className="container-x">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/70">
          {segment?.eyebrow ?? "Segmento"}
        </p>
        <h1 className="mt-3 text-3xl font-bold leading-tight text-primary md:text-5xl">
          {segment?.headline ?? "Conheça nosso portfólio"}{" "}
          <span className="text-accent">{segment?.headlineAccent ?? ""}</span>
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-relaxed text-foreground/80 md:text-lg">
          {segment?.summary ?? ""}
        </p>
      </section>

      {/* Cover */}
      {segment?.cover ? (
        <section className="container-x mt-10">
          <div className="overflow-hidden rounded-2xl border border-border/60 shadow-sm">
            <SmartImage
              src={segment.cover}
              alt={segment.coverAlt ?? segment.label ?? ""}
              wrapperClassName="block"
              skeletonClassName="aspect-[16/8]"
              className="h-full w-full object-cover"
              loading="eager"
              fetchPriority="high"
            />
          </div>
        </section>
      ) : null}

      {/* Introdução + diferenciais */}
      <section className="container-x mt-12 grid gap-10 md:grid-cols-[2fr,1fr]">
        <div className="space-y-5 text-base leading-relaxed text-foreground/80">
          {(segment?.intro ?? []).map((p, i) => (
            <p key={`${segment?.slug ?? "seg"}-intro-${i}`}>{p}</p>
          ))}
        </div>
        <aside className="rounded-2xl border border-border/60 bg-secondary/40 p-6">
          <h2 className="text-lg font-semibold text-primary">Diferenciais</h2>
          <ul className="mt-4 space-y-3 text-sm text-foreground/80">
            {(segment?.features ?? []).map((f) => (
              <li key={f} className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </aside>
      </section>

      {/* Projetos em destaque */}
      {segment?.projects && segment.projects.length > 0 ? (
        <section className="container-x mt-16">
          <header className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/70">Empreendimentos</p>
              <h2 className="mt-2 text-2xl font-bold text-primary md:text-3xl">Obras em destaque</h2>
            </div>
          </header>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {segment.projects.map((p: Project) => (
              <Link
                key={p.slug}
                to="/obras/$slug"
                params={{ slug: p.slug }}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <SmartImage
                  src={p.img}
                  alt={p.name}
                  wrapperClassName="block"
                  skeletonClassName="aspect-[4/3]"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <div className="flex flex-1 flex-col gap-2 p-5">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-accent/20 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                      {p.tag}
                    </span>
                    <span className="text-xs text-muted-foreground">{p.year}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-primary">{p.name}</h3>
                  <p className="text-sm leading-relaxed text-foreground/75">{p.summary}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
                    Ver detalhes <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* Galeria de fotos */}
      {uniquePhotos.length > 0 ? (
        <section className="container-x mt-16">
          <header className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/70">Galeria</p>
            <h2 className="mt-2 text-2xl font-bold text-primary md:text-3xl">Trabalhos selecionados</h2>
          </header>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {uniquePhotos.map((photo: SegmentPhoto, photoIdx: number) => (
              <button
                key={`${segment?.slug ?? "seg"}-photo-${photoIdx}-${photo.src}`}
                type="button"
                onClick={() => setLightboxIndex(photoIdx)}
                className="group block overflow-hidden rounded-2xl border border-border/60 bg-card text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <SmartImage
                  src={photo.src}
                  alt={photo.alt}
                  wrapperClassName="block"
                  skeletonClassName="aspect-[4/3]"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <div className="p-4">
                  <p className="text-sm font-semibold text-primary">{photo.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{photo.caption}</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {/* Lightbox */}
      {lightboxIndex !== null && uniquePhotos[lightboxIndex] ? (
        <Lightbox
          items={uniquePhotos.map((p: SegmentPhoto) => ({ src: p.src, alt: p.alt }))}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={(newIdx: number) => setLightboxIndex(newIdx)}
        />
      ) : null}
    </main>
  );
}
