import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ImageOff, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  fallbackChain,
  placeholderImage,
  resolveImage,
  withRetryBuster,
  type ImageInput,
} from "@/lib/images";
import {
  STALLED_TIMEOUT_MS,
  clearFailure,
  didFail,
  markFailed,
  skipKnownFailures,
} from "@/lib/image-health";
import { reportClientError } from "@/lib/client-error-reporter";

type SmartImageProps = Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  "src" | "srcSet" | "fetchPriority"
> & {
  src: ImageInput;
  alt: string;
  /** Classes do wrapper (posicionamento / proporção). Por padrão ocupa o bloco. */
  wrapperClassName?: string;
  /** Proporção do skeleton enquanto carrega (ex: "aspect-[4/3]"). Vazio = sem reserva de espaço. */
  skeletonClassName?: string;
  fallbackLabel?: string;
  /** Segunda tentativa com outra URL (ex: webp → jpg, cdn → local). */
  fallbackSrc?: ImageInput;
  /** Mostra botão "tentar de novo" no fallback. Padrão: true */
  retryable?: boolean;
  /** srcSet responsivo (opcional). Quando omitido, usa a URL única. */
  srcSet?: string;
  sizes?: string;
  /** Prioridade de fetch do browser ("high" para hero/LCP). */
  fetchPriority?: "high" | "low" | "auto";
  /** Timeout (ms) para considerar a carga "travada" e avançar o fallback. */
  stalledTimeoutMs?: number;
};

/**
 * Imagem resiliente com skeleton (shimmer) + fallback elegante + retry.
 * - Resolve o base path automaticamente (funciona em dev, preview e FTP/subpasta).
 * - Reseta o estado sempre que `src` muda (corrige galeria/filtros).
 * - Tenta a cadeia: primary → fallbackSrc → webp<->jpg automáticos →
 *   variações de caixa (.JPG↔.jpg) → placeholder SVG.
 * - Watchdog anti-travamento: se o servidor não responder em N ms, avança
 *   sozinho para o próximo candidato (o <img> sozinho nunca daria onError).
 * - Cache global de falhas: URL que já deu 404 nesta sessão é pulada
 *   direto, sem piscar nem gerar nova requisição.
 * - Nunca quebra o layout e reporta falhas para /api/public/client-error.
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
  srcSet,
  sizes,
  fetchPriority,
  stalledTimeoutMs = STALLED_TIMEOUT_MS,
  referrerPolicy = "strict-origin-when-cross-origin",
  onLoad,
  onError,
  ...rest
}: SmartImageProps) {
  const fullChain = useMemo(
    () => fallbackChain(rawSrc, rawFallback),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [resolveImage(rawSrc), resolveImage(rawFallback)],
  );
  // Pula URLs que já falharam nesta sessão — exceto em retry manual.
  const [retryTick, setRetryTick] = useState(0);
  const chain = useMemo(
    () => (retryTick > 0 ? fullChain : skipKnownFailures(fullChain)),
    [fullChain, retryTick],
  );
  const primary = chain[0] ?? "";

  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [exhausted, setExhausted] = useState(false);
  const reportedRef = useRef<Set<string>>(new Set());
  const watchdogRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const current = exhausted ? placeholderImage(alt) : (chain[index] ?? "");
  const isPlaceholder = exhausted;

  // Sempre que a imagem pedida mudar, recomeça o ciclo de carga.
  useEffect(() => {
    setIndex(0);
    setLoaded(false);
    setExhausted(false);
  }, [primary, chain.join("|")]);

  // Limpa o watchdog ao desmontar / trocar de candidato.
  useEffect(() => {
    return () => {
      if (watchdogRef.current) clearTimeout(watchdogRef.current);
    };
  }, []);

  const clearWatchdog = useCallback(() => {
    if (watchdogRef.current) {
      clearTimeout(watchdogRef.current);
      watchdogRef.current = null;
    }
  }, []);

  const reportFailure = useCallback(
    (failedUrl: string) => {
      if (!failedUrl || reportedRef.current.has(failedUrl)) return;
      reportedRef.current.add(failedUrl);
      try {
        markFailed(failedUrl);
      } catch {
        // cache nunca quebra render
      }
      try {
        reportClientError(new Error(`[SmartImage] falha ao carregar: ${failedUrl}`), "manual", {
          alt,
          chain,
          failedUrl,
        });
      } catch {
        // telemetria nunca quebra render
      }
      if (import.meta.env?.DEV) {
        // eslint-disable-next-line no-console
        console.warn(`[SmartImage] falha ao carregar: ${failedUrl} (alt: ${alt})`);
      }
    },
    [alt, chain],
  );

  const advance = useCallback(
    (failedUrl: string, e?: React.SyntheticEvent<HTMLImageElement, Event>) => {
      reportFailure(failedUrl);
      clearWatchdog();
      if (index + 1 < chain.length) {
        setIndex((i) => i + 1);
        setLoaded(false);
        return;
      }
      setExhausted(true);
      setLoaded(true);
      if (e && onError) {
        onError?.(e as unknown as React.SyntheticEvent<HTMLImageElement, Event> & { target: EventTarget });
      }
    },
    [chain, index, reportFailure, clearWatchdog, onError],
  );

  const handleError = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      const failedUrl = chain[index] ?? current;
      advance(failedUrl, e);
    },
    [chain, index, current, advance],
  );

  // Watchdog anti-travamento: se `current` não carregar nem falhar em N ms,
  // considera stalled e avança para o próximo candidato.
  useEffect(() => {
    if (isPlaceholder || !current || loaded) return;
    clearWatchdog();
    watchdogRef.current = setTimeout(() => {
      // Se a URL já está no cache global de falhas, avança sem reportar de novo.
      if (didFail(current)) {
        if (index + 1 < chain.length) {
          setIndex((i) => i + 1);
          setLoaded(false);
        } else {
          setExhausted(true);
          setLoaded(true);
        }
        return;
      }
      advance(current);
    }, stalledTimeoutMs);
    return clearWatchdog;
  }, [current, loaded, isPlaceholder, index, chain.length, stalledTimeoutMs, advance, clearWatchdog]);

  const handleRetry = useCallback(() => {
    reportedRef.current.clear();
    try {
      for (const u of fullChain) clearFailure(u);
    } catch {
      // no-op
    }
    setExhausted(false);
    setLoaded(false);
    setIndex(0);
    setRetryTick((t) => t + 1);
  }, [fullChain]);

  const displaySrc =
    !isPlaceholder && retryTick > 0 && index === 0 ? withRetryBuster(current) : current;

  if (!displaySrc) {
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
      </div>
    );
  }

  // Placeholder final: renderiza direto (sem skeleton, sem retry loop).
  if (isPlaceholder) {
    return (
      <span className={cn("relative block overflow-hidden", skeletonClassName, wrapperClassName)}>
        <img
          src={displaySrc}
          alt={alt}
          loading={loading}
          decoding={decoding}
          draggable={false}
          referrerPolicy={referrerPolicy}
          className={cn("opacity-100", className)}
          {...rest}
        />
        {retryable && (
          <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 bg-gradient-to-t from-black/70 to-transparent p-3">
            <button
              type="button"
              onClick={handleRetry}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/30 px-3 py-1.5 text-[11px] font-medium text-white transition hover:bg-white/10"
            >
              <RefreshCw className="h-3 w-3" aria-hidden="true" />
              Tentar carregar de novo
            </button>
          </span>
        )}
      </span>
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
        src={displaySrc}
        alt={alt}
        loading={loading}
        decoding={decoding}
        draggable={false}
        referrerPolicy={referrerPolicy}
        srcSet={srcSet}
        sizes={sizes}
        {...(fetchPriority ? { fetchPriority } : {})}
        onLoad={(e) => {
          clearWatchdog();
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
