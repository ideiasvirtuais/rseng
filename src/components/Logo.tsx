import { useCallback, useState } from "react";
import { Link } from "@tanstack/react-router";
import { logoChain } from "@/lib/images";
import type { SegmentRoute } from "./segments";

/**
 * Logo oficial da Rezende Saback — componente blindado (v6).
 *
 * Correção definitiva da regressão "estava certa, voltou a dar erro":
 * a v5 importava o PNG via bundle do Vite
 * (`import logoBundled from "@/assets/logomarca-rs-1024x253.png"`).
 * Esse import estático é frágil por natureza — a cada rebuild o hash muda,
 * o cache do preview/SSR pode servir o bundle antigo e o build quebra com
 * "Failed to resolve import" sempre que o arquivo/cache muda. Por isso o
 * erro ia e voltava.
 *
 * A v6 NÃO tem nenhum import estático de imagem: a cadeia é resolvida em
 * tempo de render via `logoChain()` (respeita o BASE_URL vigente) e termina
 * sempre num SVG inline (data URI) que nunca faz requisição de rede.
 *
 * Ordem: public/ nova marca → public/ legada → vendorada `__l5e`
 * (pasta versionada, sobrevive a deploy parcial) → SVG inline.
 *
 * Wrapper 100% transparente (`bg-transparent`, sem fundo/caixa/sombra),
 * conforme solicitado — logo direta sobre o header.
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

export function Logo({ variant = "dark", to = "/", className, imgClassName }: LogoProps) {
  void variant;
  const [step, setStep] = useState(0);

  // Cadeia resolvida por montagem (não no import do módulo): respeita o
  // BASE_URL do bundle que está servindo a página — sem cache global que
  // envenene retries entre preview / dev / FTP.
  const [chain] = useState<string[]>(() => logoChain());
  const src = step < chain.length ? (chain[step] ?? LOGO_INLINE_DATA_URI) : LOGO_INLINE_DATA_URI;
  const isInline = step >= chain.length;

  const handleError = useCallback(() => {
    // Teto rígido: avança no máximo até o SVG inline. Nunca faz loop —
    // o <img> do SVG não tem onError, então a cadeia sempre termina.
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
