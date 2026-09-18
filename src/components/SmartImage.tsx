import { useCallback, useEffect, useState } from "react";
import { ImageOff, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { resolveImage } from "@/lib/images";

type SmartImageProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  src: string | { url: string } | undefined | null;
  alt: string;
  /** Classes do wrapper (posicionamento / proporção). Por padrão ocupa o bloco. */
  wrapperClassName?: string;
  /** Proporção do skeleton enquanto carrega (ex: "aspect-[4/3]"). Vazio = sem reserva de espaço. */
  skeletonClassName?: string;
  fallbackLabel?: string;
  /** Segunda tentativa com outra URL (ex: webp → png, cdn → local). */
  fallbackSrc?: string | { url: string };
  /** Mostra botão "tentar de novo" no fallback. Padrão: true */
  retryable?: boolean;
};

/**
 * Imagem resiliente com skeleton (shimmer) + fallback elegante + retry.
 * - Resolve o base path automaticamente (funciona em dev, preview e FTP/subpasta).
 * - Reseta o estado sempre que `src` muda (corrige galeria/filtros).
 * - Tenta `fallbackSrc` antes de desistir.
 * - Nunca quebra o layout.
 */
export function SmartImage({
  src: rawSrc,
  fallbackSrc: rawFallback,
  alt,
  className,
  wrapperClassName,
  skeletonClassName,
  fallbackLabel,
  retryable = true,
  loading = "lazy",
  decoding = "async",
  onLoad,
  onError,
  ...rest
}: SmartImageProps) {
  const primary = resolveImage(rawSrc);
  const fallback = resolveImage(rawFallback);

  const [current, setCurrent] = useState(primary);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [triedFallback, setTriedFallback] = useState(false);

  // Sempre que a imagem pedida mudar, recomeça o ciclo de carga.
  useEffect(() => {
    setCurrent(primary);
    setLoaded(false);
    setFailed(false);
    setTriedFallback(false);
  }, [primary]);

  const handleError = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      // 1ª falha → tenta o fallbackSrc (se houver e ainda não tentou).
      if (fallback && !triedFallback && current !== fallback) {
        setTriedFallback(true);
        setCurrent(fallback);
        setLoaded(false);
        return;
      }
      setFailed(true);
      onError?.(e as unknown as React.SyntheticEvent<HTMLImageElement, Event> & { target: EventTarget });
      if (import.meta.env?.DEV) {
        // eslint-disable-next-line no-console
        console.warn(`[SmartImage] falha ao carregar: ${current} (alt: ${alt})`);
      }
    },
    [fallback, triedFallback, current, onError, alt],
  );

  const handleRetry = useCallback(() => {
    // Força reload com cache-buster; data:/blob: não aceitam query.
    setFailed(false);
    setLoaded(false);
    setTriedFallback(false);
    if (!primary || /^(data:|blob:)/i.test(primary)) {
      setCurrent(primary);
      return;
    }
    try {
      if (/^https?:\/\//i.test(primary)) {
        const url = new URL(primary);
        url.searchParams.set("retry", String(Date.now()));
        setCurrent(url.toString());
      } else {
        const url = new URL(primary, "http://retry.local");
        url.searchParams.set("retry", String(Date.now()));
        const path = `${url.pathname}${url.search}`;
        setCurrent(primary.startsWith("/") ? path : path.replace(/^\//, ""));
      }
    } catch {
      setCurrent(primary);
    }
  }, [primary]);

  if (failed || !current) {
    return (
      <div
        role="img"
        aria-label={fallbackLabel ?? alt}
        className={cn(
          "flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-primary/90 via-primary to-primary/70 p-6 text-center text-primary-foreground",
          skeletonClassName,
          wrapperClassName,
          className,
        )}
      >
        <ImageOff className="h-6 w-6 opacity-70" aria-hidden="true" />
        <span className="max-w-[26ch] text-xs font-medium leading-relaxed opacity-80">
          {fallbackLabel ?? alt}
        </span>
        {retryable && current && (
          <button
            type="button"
            onClick={handleRetry}
            className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-primary-foreground/30 px-3 py-1.5 text-[11px] font-medium text-primary-foreground/90 transition hover:bg-primary-foreground/10"
          >
            <RefreshCw className="h-3 w-3" aria-hidden="true" />
            Tentar carregar de novo
          </button>
        )}
      </div>
    );
  }

  return (
    <span className={cn("relative block overflow-hidden", skeletonClassName, wrapperClassName)}>
      {!loaded && (
        <span
          aria-hidden="true"
          className={cn(
            "absolute inset-0 animate-pulse bg-gradient-to-br from-secondary via-muted to-secondary",
          )}
        />
      )}
      <img
        src={current}
        alt={alt}
        loading={loading}
        decoding={decoding}
        draggable={false}
        onLoad={(e) => {
          setLoaded(true);
          onLoad?.(e);
        }}
        onError={handleError}
        className={cn(
          "transition-opacity duration-500",
          loaded ? "opacity-100" : "opacity-0",
          className,
        )}
        {...rest}
      />
    </span>
  );
}
