import { useCallback, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { logoChain } from "@/lib/images";
import { clearFailure, didFail, markFailed } from "@/lib/image-health";
import logoBundled from "@/assets/logomarca-rs-1024x253.png";
import type { SegmentRoute } from "./segments";

/**
 * Logo oficial da Rezende Saback — componente blindado (v3).
 *
 * Marca aplicada no topo: `LOGOMARCA-RS-1024x253.png` (1024×253).
 * - 1ª tentativa: asset do BUNDLE Vite (`src/assets/logomarca-...png`):
 *   URL com hash + base correta em qualquer ambiente (dev, preview,
 *   prerender, FTP). Depois: public/ nova marca → public/ legada →
 *   vendorada `__l5e` → marca SVG inline (data URI — nunca quebra).
 * - A arte já contém o fundo azul-marinho + faixa amarela, por isso o
 *   wrapper é TRANSPARENTE (sem pílula `bg-primary` — ela duplicaria o fundo).
 * - Dimensões intrínsecas 1024×253 (sem CLS). Render imediato, sem skeleton.
 */

export const LOGO_WIDTH = 1024;
export const LOGO_HEIGHT = 253;

/**
 * Marca tipográfica "RS" nas cores oficiais — último recurso, sempre pinta.
 * Versão "header" (pílula navy): legível sobre fundos CLAROS.
 * Versão "footer" (transparente): legível sobre fundos ESCUROS.
 */
const LOGO_INLINE_SVG_DARK_BG =
  `<svg xmlns='http://www.w3.org/2000/svg' width='${LOGO_WIDTH}' height='${LOGO_HEIGHT}' viewBox='0 0 1024 253'>` +
  `<path d='M0 20 L420 20 L1024 130 L1024 155 L200 155 L60 253 L0 230 Z' fill='#2E3192'/>` +
  `<rect x='200' y='148' width='824' height='10' fill='#FFED00'/>` +
  `<text x='120' y='130' text-anchor='middle' font-family='Georgia,serif' font-style='italic' font-weight='bold' font-size='110' fill='#ffffff'>RS</text>` +
  `<text x='600' y='110' text-anchor='middle' font-family='Arial,sans-serif' font-weight='bold' font-size='52' fill='#ffffff' letter-spacing='4'>REZENDE SABACK</text>` +
  `<text x='600' y='200' text-anchor='middle' font-family='Arial,sans-serif' font-weight='bold' font-size='30' fill='#2E3192' letter-spacing='4'>CONSTRUTORA E INCORPORADORA</text>` +
  `</svg>`;

const LOGO_INLINE_SVG_TRANSPARENT =
  `<svg xmlns='http://www.w3.org/2000/svg' width='${LOGO_WIDTH}' height='${LOGO_HEIGHT}' viewBox='0 0 1024 253'>` +
  `<path d='M0 20 L420 20 L1024 130 L1024 155 L200 155 L60 253 L0 230 Z' fill='#2E3192'/>` +
  `<rect x='200' y='148' width='824' height='10' fill='#FFED00'/>` +
  `<text x='120' y='130' text-anchor='middle' font-family='Georgia,serif' font-style='italic' font-weight='bold' font-size='110' fill='#ffffff'>RS</text>` +
  `<text x='600' y='110' text-anchor='middle' font-family='Arial,sans-serif' font-weight='bold' font-size='52' fill='#ffffff' letter-spacing='4'>REZENDE SABACK</text>` +
  `<text x='600' y='200' text-anchor='middle' font-family='Arial,sans-serif' font-weight='bold' font-size='30' fill='#ffffff' letter-spacing='4'>CONSTRUTORA E INCORPORADORA</text>` +
  `</svg>`;

export const LOGO_INLINE_DATA_URI = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(LOGO_INLINE_SVG_DARK_BG)}`;
export const LOGO_INLINE_DATA_URI_LIGHT = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(LOGO_INLINE_SVG_TRANSPARENT)}`;

type LogoProps = {
  variant?: "dark" | "light";
  to?: "/" | SegmentRoute;
  className?: string;
  imgClassName?: string;
};

export function Logo({ variant = "dark", to = "/", className, imgClassName }: LogoProps) {
  const onDarkBackground: boolean = variant === "light";
  const inlineFallback = onDarkBackground ? LOGO_INLINE_DATA_URI_LIGHT : LOGO_INLINE_DATA_URI;
  const [step, setStep] = useState(0);

  // Cadeia resolvida a cada render (base vigente) + pula 404 já conhecido.
  const chain = useMemo(() => {
    try {
      const full = logoChain(logoBundled);
      const fresh = full.filter((u) => !didFail(u));
      return fresh.length > 0 ? fresh : full.slice(0, 1);
    } catch {
      return logoChain(logoBundled);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const src = step < chain.length ? (chain[step] ?? inlineFallback) : inlineFallback;
  const isInline = step >= chain.length;

  const handleError = useCallback(() => {
    setStep((s) => {
      const len = chain.length;
      if (s < len) {
        try {
          markFailed(chain[s] ?? "");
        } catch {
          // cache nunca quebra o header
        }
        return s + 1;
      }
      return s;
    });
  }, [chain]);

  const handleLoad = useCallback(() => {
    try {
      if (!isInline && src) clearFailure(src);
    } catch {
      // no-op
    }
  }, [isInline, src]);

  return (
    <Link
      to={to}
      aria-label="Rezende Saback Construtora — início"
      className={`inline-flex shrink-0 items-center rounded-xl bg-transparent transition-transform duration-200 hover:scale-[1.02] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${
        onDarkBackground
          ? "rounded-xl bg-white/95 px-3 py-1.5 shadow-[0_8px_24px_-10px_rgba(0,0,0,0.5)] ring-1 ring-white/20"
          : "drop-shadow-[0_6px_16px_rgba(46,49,146,0.25)]"
      } ${className ?? ""}`}
    >
      <img
        key={isInline ? `logo-inline-${variant}` : src}
        src={src}
        alt="Rezende Saback — Construtora e Incorporadora"
        width={LOGO_WIDTH}
        height={LOGO_HEIGHT}
        loading="eager"
        decoding="async"
        fetchPriority="high"
        draggable={false}
        onError={isInline ? undefined : handleError}
        onLoad={handleLoad}
        className={
          imgClassName ??
          "h-12 w-auto max-w-[240px] object-contain sm:h-14 sm:max-w-[280px] md:h-16 md:max-w-[320px]"
        }
        style={{ aspectRatio: `${LOGO_WIDTH} / ${LOGO_HEIGHT}` }}
      />
    </Link>
  );
}
