import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, ZoomIn } from "lucide-react";

import { SmartImage } from "@/components/SmartImage";
import { Lightbox, type LightboxPhoto } from "@/components/Lightbox";
import { galleryCategories, galleryItems, type GalleryFilter } from "@/data/projects";
import { preloadImages } from "@/lib/image-health";

/**
 * Galeria de obras da home — paridade com https://rsengenharia.eng.br/#galeria.
 *
 * Âncora `id="galeria"`: as páginas de obra (`/obras/$slug`) e de segmento
 * linkam para `/#galeria`; sem este id esses links caíam no topo da home.
 * Filtros 1:1 com a produção: Todas, Lançamentos, Residenciais, Comerciais, Casas.
 */
export function HomeGallery() {
  const [filter, setFilter] = useState<GalleryFilter>("Todas");
  const [lightbox, setLightbox] = useState<number | null>(null);

  const filtered = useMemo(() => {
    if (filter === "Todas") return galleryItems;
    return galleryItems.filter((item) => item.category === filter);
  }, [filter]);

  const photos = useMemo<LightboxPhoto[]>(
    () =>
      filtered.map((item, i) => ({
        src: typeof item?.src === "string" ? item.src : "",
        alt: typeof item?.alt === "string" && item.alt ? item.alt : (typeof item?.project === "string" ? item.project : `Foto ${i + 1}`),
        eyebrow: typeof item?.category === "string" ? item.category : "",
        title: typeof item?.project === "string" ? item.project : "",
      })),
    [filtered]
  );

  // Carrega TODAS as fotos da galeria em 2º plano (idle): ao trocar de
  // filtro, a imagem já está no cache — parece instantâneo.
  useEffect(() => {
    try {
      const urls = galleryItems.map((i) => (typeof i?.src === "string" ? i.src : "")).filter(Boolean);
      if (urls.length > 0) void preloadImages(urls);
    } catch {
      // preload nunca quebra o render
    }
  }, []);

  return (
    <section id="galeria" aria-labelledby="galeria-title" className="container-x section-y scroll-mt-20">
      <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Galeria de obras</div>
      <h2 id="galeria-title" className="mt-4 max-w-2xl">
        Detalhes que só a obra pronta revela.
      </h2>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        Fachadas, áreas comuns e interiores dos nossos empreendimentos em Betim. Filtre por categoria para
        explorar cada aspecto do nosso padrão construtivo.
      </p>

      <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Filtrar galeria por categoria">
        {galleryCategories.map((category) => {
          const active = filter === category;
          return (
            <button
              key={category}
              type="button"
              onClick={() => {
                setFilter(category);
                setLightbox(null);
              }}
              aria-pressed={active}
              className={`rounded-full border px-4 py-2 text-sm transition ${
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:border-primary hover:text-primary"
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>

      {filtered.length > 0 ? (
        <ul className="mt-8 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item, index) => {
            const src = typeof item?.src === "string" ? item.src : "";
            const project = typeof item?.project === "string" ? item.project : `obra-${index}`;
            const category = typeof item?.category === "string" ? item.category : "";
            const alt = typeof item?.alt === "string" ? item.alt : project;
            if (!src) return null;
            return (
            <li
              key={`${project}-${category}-${src}-${index}`}
              className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-card"
            >
              <button
                type="button"
                onClick={() => setLightbox(index)}
                aria-label={`Ampliar foto: ${alt}`}
                className="absolute inset-0 h-full w-full cursor-zoom-in text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset"
              >
                <SmartImage
                  src={src}
                  alt={alt}
                  retryable={false}
                  wrapperClassName="absolute inset-0"
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  loading={index < 6 ? "eager" : "lazy"}
                />
              </button>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/10 to-transparent opacity-90 transition group-hover:opacity-100" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 text-primary-foreground">
                <div className="min-w-0">
                  <div className="text-[11px] font-medium uppercase tracking-[0.2em] text-accent">
                    {category}
                  </div>
                  <div className="truncate text-sm font-semibold">{project}</div>
                </div>
                <ZoomIn className="h-5 w-5 shrink-0 opacity-70" aria-hidden="true" />
              </div>
            </li>
            );
          })}
        </ul>
      ) : (
        <div className="mt-8 rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          Nenhuma foto nesta categoria ainda.
        </div>
      )}

      <div className="mt-8 flex justify-center">
        <Link
          to="/galeria"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
        >
          Carregar todas as imagens <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      <Lightbox
        photos={photos}
        index={lightbox}
        onClose={() => setLightbox(null)}
        onNavigate={setLightbox}
      />
    </section>
  );
}
