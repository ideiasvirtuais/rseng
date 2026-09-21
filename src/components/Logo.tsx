import { useCallback, useState } from "react";
import { Link } from "@tanstack/react-router";
import { publicUrl } from "@/lib/images";
import logoBundled from "@/assets/logomarca-rs-1024x253.png";
import type { SegmentRoute } from "./segments";

/**
 * Logo oficial da Rezende Saback — componente blindado (v5).
 *
 * Sem caixa/fundo atrás da logo: wrapper 100% transparente
 * (`bg-transparent`, sem `bg-[#2E3192]`, sem sombra/ring),
 * conforme solicitado — logo direta sobre o header.
 * Cadeia local e idempotente, sem cache global `image-health`:
 * bundle Vite (hash, base correta) → public/ nova marca →
 * public/ legada → SVG inline (data URI — nunca quebra).
 */

export const LOGO_WIDTH = 1024;
export const LOGO_HEIGHT = 253;

const LOGO_INLINE_SVG =
  `<svg xmlns='http://www.w3.org/2000/svg' width='${LOGO_WIDTH}' height='${LOGO_HEIGHT}' viewBox='0 0 1024 253'>` +
  `<rect width='1024' height='253' rx='24' fill='#2E3192'/>` +
  `<rect x='0' y='148' width='1024' height='10' fill='#FFED00'/>` +
  `<text x='120' y='130' text-anchor='middle' font-family='Georgia,serif' font-style='italic' font-weight='bold' font-size='110' fill='#ffffff'>RS</text>` +
  `<text x='600' y='110' text-anchor='middle' font-family='Arial,sans-serif' font-weight='bold' font-size='52' fill='#ffffff' letter-spacing='4'>REZENDE SABACK</text>` +
  `<text x='600' y='205' text-anchor='middle' font-family='Arial,sans-serif' font-weight='bold' font-size='30' fill='#FFED00' letter-spacing='4'>CONSTRUTORA E INCORPORADORA</text>` +
  `</svg>`;

export const LOGO_INLINE_DATA_URI = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(LOGO_INLINE_SVG)}`;

type LogoProps = {
  variant?: "dark" | "light";
  to?: "/" | SegmentRoute;
  className?: string;
  imgClassName?: string;
};

function buildChain(): string[] {
  const out: string[] = [];
  const push = (u: string) => {
    if (u && !out.includes(u)) out.push(u);
  };
  // 1. Bundle Vite — URL com hash, sempre com base correta.
  if (typeof logoBundled === "string" && logoBundled) push(logoBundled);
  // 2. public/ — marca nova, depois legada.
  push(publicUrl("/LOGOMARCA-RS-1024x253.png"));
  push(publicUrl("/logo-rezende-saback.png"));
  return out;
}

export function Logo({ variant = "dark", to = "/", className, imgClassName }: LogoProps) {
  void variant;
  const [step, setStep] = useState(0);

  // Cadeia estática por montagem — sem cache global que envenene retries.
  const [chain] = useState<string[]>(() => buildChain());
  const src = step < chain.length ? (chain[step] ?? LOGO_INLINE_DATA_URI) : LOGO_INLINE_DATA_URI;
  const isInline = step >= chain.length;

  const handleError = useCallback(() => {
    setStep((s) => (s <= chain.length ? s + 1 : s));
  }, [chain.length]);

  return (
    <Link
      to={to}
      aria-label="Rezende Saback Construtora — início"
      className={`inline-flex shrink-0 items-center bg-transparent transition-transform duration-200 hover:scale-[1.02] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${
        className ?? ""
      }`}
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
