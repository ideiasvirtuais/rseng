import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import logoBundled from "@/assets/logo-rezende-saback.png";
import { logoChain } from "@/lib/images";
import type { SegmentRoute } from "./segments";

/**
 * Logo oficial da Rezende Saback — versão 9.
 *
 * Cadeia determinística por build: o primeiro item é o bundle (vai junto com
 * o JS, mesma base, mesmo deploy) e é idêntico no SSR/prerender e no cliente.
 * O fallback final é SVG inline — nunca faz rede, nunca fica em branco.
 */

export const LOGO_WIDTH = 480;
export const LOGO_HEIGHT = 144;

/** Fallback final: releitura fiel da marca em SVG inline (nunca faz rede). */
const LOGO_INLINE_SVG =
  `<svg xmlns='http://www.w3.org/2000/svg' width='${LOGO_WIDTH}' height='${LOGO_HEIGHT}' viewBox='0 0 480 144'>` +
  `<rect width='480' height='144' rx='10' fill='#23256e'/>` +
  `<path d='M0 14 L88 14 L70 130 L0 116 Z' fill='#3b3f9f'/>` +
  `<text x='40' y='92' text-anchor='middle' font-family='Georgia,serif' font-style='italic' font-weight='bold' font-size='62' fill='#ffffff'>RS</text>` +
  `<rect x='88' y='24' width='388' height='60' fill='#2E3192'/>` +
  `<text x='282' y='66' text-anchor='middle' font-family='Arial,sans-serif' font-weight='bold' font-size='30' fill='#ffffff' letter-spacing='3'>REZENDE SABACK</text>` +
  `<rect x='88' y='84' width='388' height='6' fill='#FFED00'/>` +
  `<text x='282' y='116' text-anchor='middle' font-family='Arial,sans-serif' font-weight='bold' font-size='18' fill='#FFE95A' letter-spacing='3'>CONSTRUTORA E INCORPORADORA</text>` +
  `</svg>`;

export const LOGO_INLINE_DATA_URI = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(LOGO_INLINE_SVG)}`;

type LogoProps = {
  /** "dark" = sobre fundo claro (header). "light" = sobre fundo escuro (rodapé). */
  variant?: "dark" | "light";
  to?: "/" | SegmentRoute;
  className?: string;
  imgClassName?: string;
};

export function Logo({ variant = "dark", to = "/", className, imgClassName }: LogoProps) {
  const [step, setStep] = useState(0);

  const chain = useMemo<string[]>(() => logoChain(logoBundled), []);

  const chainKey = chain.join("|");
  useEffect(() => {
    setStep(0);
  }, [chainKey]);

  const src = step < chain.length ? (chain[step] ?? LOGO_INLINE_DATA_URI) : LOGO_INLINE_DATA_URI;
  const isInline = step >= chain.length;

  const handleError = useCallback(() => {
    setStep((s) => (s <= chain.length ? s + 1 : s));
  }, [chain.length]);

  const isLight = variant === "light";

  return (
    <Link
      to={to}
      aria-label="Rezende Saback Construtora — início"
      className={`inline-flex shrink-0 items-center transition-transform duration-200 hover:scale-[1.02] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${
        isLight ? "rounded-xl bg-white px-3 py-1.5 shadow-md" : "bg-transparent"
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
        className={
          imgClassName ??
          "h-11 w-auto max-w-[240px] object-contain sm:h-12 sm:max-w-[280px] md:h-14 md:max-w-[320px]"
        }
      />
    </Link>
  );
}
