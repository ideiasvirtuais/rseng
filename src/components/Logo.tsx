import { useCallback, useState } from "react";
import { Link } from "@tanstack/react-router";
import { LOGO_CHAIN } from "@/lib/images";
import type { SegmentRoute } from "./segments";

/**
 * Logo oficial da Rezende Saback — componente blindado.
 *
 * Por que um <img> puro em vez do SmartImage aqui:
 * - A logo é o ativo crítico do header: ela precisa pintar no primeiro
 *   HTML (SSR/prerender) e continuar visível mesmo antes da hidratação.
 *   O SmartImage inicia com `opacity-0` + skeleton e depende de JS
 *   (onLoad / watchdog / sessionStorage) — se qualquer etapa falhar,
 *   o header fica sem marca e parece que "a logo não carrega".
 * - Este componente renderiza <img> visível de imediato, com
 *   width/height intrínsecos (470×114, sem CLS) e cadeia de fallback:
 *   `/logo-rezende-saback.png` → URL vendorada `__l5e` → marca SVG
 *   inline embutida (data URI — funciona até offline, nunca quebra).
 */

export const LOGO_WIDTH = 470;
export const LOGO_HEIGHT = 114;

/** Marca tipográfica "RS" nas cores oficiais — último recurso, sempre pinta. */
const LOGO_INLINE_SVG =
  `<svg xmlns='http://www.w3.org/2000/svg' width='${LOGO_WIDTH}' height='${LOGO_HEIGHT}' viewBox='0 0 470 114'>` +
  `<rect width='470' height='114' rx='10' fill='#2E3192'/>` +
  `<rect x='0' y='96' width='470' height='8' fill='#FFED00'/>` +
  `<text x='235' y='62' text-anchor='middle' font-family='Georgia,serif' font-weight='bold' font-size='44' fill='#ffffff' letter-spacing='2'>RS</text>` +
  `<text x='235' y='86' text-anchor='middle' font-family='Arial,sans-serif' font-size='13' fill='#ffffff' opacity='0.9' letter-spacing='3'>REZENDE SABACK</text>` +
  `</svg>`;

export const LOGO_INLINE_DATA_URI = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(LOGO_INLINE_SVG)}`;

type LogoProps = {
  variant?: "dark" | "light";
  to?: "/" | SegmentRoute;
  className?: string;
};

export function Logo({ variant = "dark", to = "/", className }: LogoProps) {
  const isLight = variant === "light";
  const [step, setStep] = useState(0);

  const chain = LOGO_CHAIN.length > 0 ? LOGO_CHAIN : [];
  const src = step < chain.length ? chain[step] : LOGO_INLINE_DATA_URI;
  const isInline = step >= chain.length;

  const handleError = useCallback(() => {
    setStep((s) => (s <= chain.length ? s + 1 : s));
  }, [chain.length]);

  return (
    <Link
      to={to}
      aria-label="Rezende Saback Construtora — início"
      className={`inline-flex shrink-0 items-center ${isLight ? "rounded-md bg-primary-foreground/95 px-3 py-2" : ""} ${className ?? ""}`}
    >
      <img
        src={src}
        alt="Rezende Saback Construtora"
        width={LOGO_WIDTH}
        height={LOGO_HEIGHT}
        loading="eager"
        decoding="async"
        fetchPriority="high"
        draggable={false}
        onError={isInline ? undefined : handleError}
        className="h-10 w-auto md:h-12"
      />
    </Link>
  );
}
