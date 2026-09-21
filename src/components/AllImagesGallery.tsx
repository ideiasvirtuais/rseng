import { useMemo, useState } from "react";
import { CheckCircle2, Images, Loader2, RefreshCw, ZoomIn } from "lucide-react";
import { SmartImage } from "@/components/SmartImage";
import { Lightbox, type LightboxPhoto } from "@/components/Lightbox";
import { getAllImages, type CatalogImage } from "@/lib/all-images";
import { usePreloadAllImages } from "@/hooks/usePreloadAllImages";
import { clearAllFailures } from "@/lib/image-health";
import { cn } from "@/lib/utils";

const FILTERS = ["Todas", "Hero", "Lançamentos", "Residenciais", "Comerciais", "Casas", "Institucional", "Segmentos"] as const;
export type AllImagesFilter = (typeof FILTERS)[number];

function isLogoSrc(src: string): boolean {
  return /logo-rezende/i.test(src ?? "");
}

type GalleryCardProps = {
  item: CatalogImage;
  index: number;
  cardKey: string;
  onOpen: (index: number) => void;
};

function GalleryCard({ item, index, cardKey, onOpen }: GalleryCardProps) {
  const isLogo = isLogoSrc(item.src);
  return (
    <li
      key={cardKey}
      className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-card"
    >
      <button
        type="button"
        onClick={() => onOpen(index)}
        className="absolute inset-0 h-full w-full cursor-zoom-in text-left"
        aria-label={`Ampliar ${item.alt}`}
      >
        <SmartImage
          src={item.src}
          alt={item.alt}
          wrapperClassName={cn("absolute inset-0", isLogo && "bg-white p-8")}
          className={cn(
            "h-full w-full transition duration-700 group-hover:scale-105",
            isLogo ? "object-contain" : "object-cover"
          )}
          loading={index < 6 ? "eager" : "lazy"}
          decoding="async"
        />
      </button>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/10 to-transparent opacity-90 transition group-hover:opacity-100" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 text-primary-foreground">
        <div className="min-w-0">
          <div className="text-[11px] font-medium uppercase tracking-[0.2em] text-accent">{item.group}</div>
          <div className="truncate text-sm font-semibold">{item.title}</div>
        </div>
        <ZoomIn className="h-5 w-5 shrink-0 opacity-70" aria-hidden="true" />
      </div>
    </li>
  );
}

/**
 * Galeria "Carregar todas as imagens": exibe o catálogo completo com
 * pré-carregamento real em background + barra de progresso + lightbox.
 * Cada foto usa SmartImage (skeleton + fallback + retry) — nunca quebra.
 */
export function AllImagesGallery({ eager = true }: { eager?: boolean }) {
  const images = useMemo<CatalogImage[]>(() => {
    try {
      return getAllImages();
    } catch {
      return [];
    }
  }, []);

  const [filter, setFilter] = useState<AllImagesFilter>("Todas");
  const [lightbox, setLightbox] = useState<number | null>(null);
  const { status, total, loaded, progress, start } = usePreloadAllImages(eager);

  const filtered = useMemo(() => {
    if (filter === "Todas") return images;
    return images.filter((i) => i.group === filter);
  }, [images, filter]);

  const photos = useMemo<LightboxPhoto[]>(
    () =>
      filtered.map((i) => ({
        src: typeof i?.src === "string" ? i.src : "",
        alt: typeof i?.alt === "string" && i.alt ? i.alt : (typeof i?.title === "string" ? i.title : "Foto"),
        eyebrow: typeof i?.group === "string" ? i.group : "",
        title: typeof i?.title === "string" ? i.title : "",
      })),
    [filtered]
  );

  const handleRetryAll = () => {
    try {
      clearAllFailures();
    } catch {
      // no-op
    }
    window.location.reload();
  };

  const handleOpen = (index: number) => {
    setLightbox(index);
  };

  const countFor = (f: AllImagesFilter): number => {
    if (f === "Todas") return images.length;
    return images.filter((i) => i.group === f).length;
  };

  return (
    <section id="todas-imagens" aria-labelledby="todas-imagens-title" className="container-x section-y scroll-mt-20">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            <Images className="h-3.5 w-3.5" aria-hidden="true" />
            Todas as imagens · {images.length} fotos
          </div>
          <h2 id="todas-imagens-title" className="mt-4">
            Carregando todas as imagens do site.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Pré-carregamento inteligente em segundo plano: o hero abre primeiro e o restante carrega
            sem travar a página. Filtre por grupo ou amplie qualquer foto.
          </p>
        </div>

        <div className="min-w-[240px] flex-1 max-w-sm rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="font-medium text-primary">
              {status === "done" ? "Tudo carregado" : status === "loading" ? "Carregando…" : "Pronto"}
            </span>
            <span className="tabular-nums text-muted-foreground">
              {loaded}/{total}
            </span>
          </div>
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={total}
            aria-valuenow={loaded}
            aria-label="Progresso do carregamento das imagens"
            className="mt-3 h-2 overflow-hidden rounded-full bg-secondary"
          >
            <div
              className={cn("h-full rounded-full bg-gradient-to-r from-primary to-accent transition-[width] duration-300")}
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            {status === "done" ? (
              <span className="inline-flex items-center gap-1.5 text-primary">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> Cache aquecido
              </span>
            ) : status === "loading" ? (
              <span className="inline-flex items-center gap-1.5">
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> Baixando em 2º plano…
              </span>
            ) : (
              <button type="button" onClick={start} className="font-medium text-primary hover:underline">
                Iniciar carregamento
              </button>
            )}
            <span className="mx-1">·</span>
            <button type="button" onClick={handleRetryAll} className="inline-flex items-center gap-1 hover:text-primary">
              <RefreshCw className="h-3 w-3" aria-hidden="true" /> Recarregar
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Filtrar todas as imagens por grupo">
        {FILTERS.map((f) => {
          const active = filter === f;
          const count = countFor(f);
          if (f !== "Todas" && count === 0) return null;
          return (
            <button
              key={f}
              type="button"
              onClick={() => {
                setFilter(f);
                setLightbox(null);
              }}
              aria-pressed={active}
              className={cn(
                "rounded-full border px-4 py-2 text-sm transition",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:border-primary hover:text-primary"
              )}
            >
              {f} <span className="ml-1 tabular-nums opacity-70">{count}</span>
            </button>
          );
        })}
      </div>

      {filtered.length > 0 ? (
        <ul className="mt-8 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item, index) => (
            <GalleryCard
              key={`${item.group}-${item.src}-${index}`}
              cardKey={`${item.group}-${item.src}-${index}`}
              item={item}
              index={index}
              onOpen={handleOpen}
            />
          ))}
        </ul>
      ) : (
        <div className="mt-8 rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          Nenhuma imagem neste grupo ainda.
        </div>
      )}

      <Lightbox
        photos={photos}
        index={lightbox}
        onClose={() => setLightbox(null)}
        onNavigate={setLightbox}
        tone="brand"
      />
    </section>
  );
}
