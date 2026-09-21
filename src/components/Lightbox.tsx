import { useCallback, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { SmartImage } from "@/components/SmartImage";
import { cn } from "@/lib/utils";

export type LightboxPhoto = {
  src: string;
  alt: string;
  eyebrow?: string;
  title?: string;
};

type LightboxProps = {
  /** Lista filtrada que está sendo exibida no grid. */
  photos: LightboxPhoto[];
  /** Índice ativo. `null` = fechado. */
  index: number | null;
  onClose: () => void;
  onNavigate: (nextIndex: number) => void;
  /** Variante de fundo. Padrão: escuro elegante. */
  tone?: "dark" | "brand";
};

function clampIndex(index: number, length: number): number | null {
  if (!Number.isFinite(index) || length <= 0) return null;
  if (index < 0) return 0;
  if (index >= length) return length - 1;
  return index;
}

/**
 * Lightbox global das galerias — setas laterais de navegação.
 *
 * - Setas ← → nas laterais (desktop) + botões compactos no mobile.
 * - Teclado: ArrowLeft / ArrowRight / Escape.
 * - Swipe horizontal no touch.
 * - Loop circular (última → primeira) para nunca travar.
 * - Trava o scroll do body + pré-carrega vizinhas.
 */
export function Lightbox({ photos, index, onClose, onNavigate, tone = "dark" }: LightboxProps) {
  const safeIndex = index === null ? null : clampIndex(index, photos.length);
  const open = safeIndex !== null;
  const active = safeIndex !== null ? (photos[safeIndex] ?? null) : null;
  const touchX = useRef<number | null>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  const goPrev = useCallback(() => {
    if (safeIndex === null || photos.length === 0) return;
    const prev = (safeIndex - 1 + photos.length) % photos.length;
    onNavigate(prev);
  }, [safeIndex, photos.length, onNavigate]);

  const goNext = useCallback(() => {
    if (safeIndex === null || photos.length === 0) return;
    const next = (safeIndex + 1) % photos.length;
    onNavigate(next);
  }, [safeIndex, photos.length, onNavigate]);

  // Teclado + trava de scroll enquanto aberto.
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeRef.current();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, goPrev, goNext]);

  // Pré-carrega anterior/próxima para a troca parecer instantânea.
  useEffect(() => {
    if (!open || safeIndex === null || photos.length < 2) return;
    try {
      const neighbours = [
        photos[(safeIndex + 1) % photos.length]?.src,
        photos[(safeIndex - 1 + photos.length) % photos.length]?.src,
      ].filter(Boolean) as string[];
      for (const src of neighbours) {
        const img = new Image();
        img.decoding = "async";
        img.src = src;
      }
    } catch {
      // preload nunca quebra o render
    }
  }, [open, safeIndex, photos]);

  if (!open || !active) return null;

  const isBrand = tone === "brand";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={active.alt || "Foto ampliada"}
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm sm:p-8",
        isBrand ? "bg-primary/95" : "bg-black/90"
      )}
      onClick={onClose}
    >
      {/* Fechar */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-label="Fechar visualização (Esc)"
        autoFocus
        className="absolute right-4 top-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-md transition hover:scale-105 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <X className="h-5 w-5" aria-hidden="true" />
      </button>

      {/* Contador */}
      <div
        aria-live="polite"
        className="absolute left-1/2 top-4 z-10 -translate-x-1/2 rounded-full border border-white/20 bg-black/50 px-4 py-1.5 text-xs font-medium tabular-nums text-white backdrop-blur-md"
      >
        {(safeIndex ?? 0) + 1} de {photos.length}
      </div>

      {/* Seta esquerda — lateral, sempre visível */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          goPrev();
        }}
        aria-label="Foto anterior (seta esquerda)"
        title="Foto anterior"
        className="absolute left-2 top-1/2 z-10 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/50 text-white shadow-xl backdrop-blur-md transition hover:scale-110 hover:bg-accent hover:text-primary hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent active:scale-95 sm:left-6 sm:h-14 sm:w-14"
      >
        <ChevronLeft className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden="true" />
      </button>

      {/* Seta direita — lateral, sempre visível */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          goNext();
        }}
        aria-label="Próxima foto (seta direita)"
        title="Próxima foto"
        className="absolute right-2 top-1/2 z-10 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/50 text-white shadow-xl backdrop-blur-md transition hover:scale-110 hover:bg-accent hover:text-primary hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent active:scale-95 sm:right-6 sm:h-14 sm:w-14"
      >
        <ChevronRight className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden="true" />
      </button>

      {/* Foto */}
      <figure
        className="max-h-full w-full max-w-5xl px-12 sm:px-16"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => {
          touchX.current = e.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={(e) => {
          if (touchX.current === null) return;
          const dx = (e.changedTouches[0]?.clientX ?? 0) - touchX.current;
          touchX.current = null;
          if (Math.abs(dx) < 40) return;
          if (dx > 0) goPrev();
          else goNext();
        }}
      >
        <div className="flex justify-center">
          <SmartImage
            key={active.src}
            src={active.src}
            alt={active.alt}
            wrapperClassName="block max-w-full"
            className="max-h-[74vh] w-auto rounded-2xl object-contain shadow-2xl ring-1 ring-white/15"
            loading="eager"
          />
        </div>
        <figcaption className="mt-4 text-center text-sm text-white/90">
          {active.eyebrow || active.title ? (
            <>
              {active.eyebrow ? <span className="font-medium uppercase tracking-[0.18em] text-accent text-[11px]">{active.eyebrow}</span> : null}
              {active.eyebrow && active.title ? <span className="mx-2 opacity-40">·</span> : null}
              {active.title ? <span>{active.title}</span> : null}
            </>
          ) : (
            <span>{active.alt}</span>
          )}
          <span className="mt-2 hidden text-xs text-white/50 sm:block">
            Use as setas ← → do teclado ou deslize o dedo para navegar
          </span>
        </figcaption>

        {/* Controles inferiores (acessibilidade + mobile) */}
        <div className="mt-3 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={goPrev}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/5 px-4 py-2 text-xs font-medium text-white backdrop-blur-md transition hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" /> Anterior
          </button>
          <div className="flex items-center gap-1.5 px-2" aria-hidden="true">
            {photos.length <= 12
              ? photos.map((_, i) => (
                  <span
                    key={i}
                    className={cn(
                      "h-1.5 rounded-full transition-all",
                      i === safeIndex ? "w-6 bg-accent" : "w-1.5 bg-white/30"
                    )}
                  />
                ))
              : null}
          </div>
          <button
            type="button"
            onClick={goNext}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/5 px-4 py-2 text-xs font-medium text-white backdrop-blur-md transition hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Próxima <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </figure>
    </div>
  );
}
