import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import logoBundled from "@/assets/logomarca-rs-1024x253.png";
import { logoChain } from "@/lib/images";
import type { SegmentRoute } from "./segments";

/**
 * Logo oficial da Rezende Saback — componente blindado (v8).
 *
 * Causas-raiz da falha "logo quebra em algumas páginas", corrigidas aqui:
 *
 * 1. DESSINCRONIA BUILD × FONTE — o HTML prerenderizado em `dist/` referenciava
 *    o asset do bundle (`/assets/logomarca-rs-HASH.png`, import estático da v5),
 *    enquanto a v6 resolveu tudo via `public/` em runtime. Deploy parcial de FTP
 *    (pasta `assets/` nova + `public/` antiga, ou vice-versa) ou HTML em cache
 *    com hash antigo ⇒ 404 só nas páginas servidas daquele HTML. A v7/v8 usa UMA
 *    cadeia determinística: o bundle (viaja junto com o JS, mesma base, mesmo
 *    deploy) é o PRIMÁRIO — idêntico no SSR/prerender e no cliente, sem
 *    hydration mismatch — e `public/` entra como fallback.
 * 2. CASE-SENSITIVITY LINUX — `public/LOGOMARCA-RS-1024x253.png` (maiúscula) é o
 *    arquivo canônico; `src/assets/logomarca-rs-1024x253.png` (minúscula) é só
 *    o import do Vite (vira `/assets/logomarca-rs-HASH.png` no bundle). A v7
 *    tentava ainda um alias lowercase via `public/` que NÃO existe em disco
 *    (repo Windows com `core.ignorecase=true` nem permite as duas casas no
 *    git) — no Apache/Linux esse pedido dava 404 garantido, com flicker e
 *    delay do watchdog a cada carregamento. A v8 remove o alias fantasma: a
 *    cadeia pede apenas URLs que existem de verdade.
 * 3. VARIANTE LIGHT IGNORADA — a v6 fazia `void variant`: no rodapé azul-escuro
 *    (`bg-primary`) a logomarca nova (subtítulo azul + banner azul) ficava
 *    camuflada/invisível, parecendo "logo quebrada". A v7 envolve a variante
 *    `light` num pill branco, garantindo contraste em fundo escuro.
 * 4. FALLBACK GENÉRICO — o SVG inline final foi redesenhado fiel à marca
 *    (banner azul, "RS" branco, faixa amarela), legível em fundo claro E escuro,
 *    então mesmo no pior caso nunca há <img> quebrado nem mancha estranha.
 *
 * Ordem da cadeia: bundle Vite (hash, base correta) → public/ nova marca
 * (UPPERCASE canônica) → public/ legada → vendorada `__l5e`
 * → SVG inline (data URI, zero rede). Teto rígido, sem loops.
 */

export const LOGO_WIDTH = 1024;
export const LOGO_HEIGHT = 253;

/** Fallback final: releitura fiel da marca em SVG inline (nunca faz rede). */
const LOGO_INLINE_SVG =
  `<svg xmlns='http://www.w3.org/2000/svg' width='${LOGO_WIDTH}' height='${LOGO_HEIGHT}' viewBox='0 0 1024 253'>` +
  `<rect width='1024' height='253' rx='28' fill='#23256e'/>` +
  `<path d='M0 26 L150 26 L120 227 L0 200 Z' fill='#2E3192'/>` +
  `<text x='72' y='150' text-anchor='middle' font-family='Georgia,serif' font-style='italic' font-weight='bold' font-size='118' fill='#ffffff'>RS</text>` +
  `<rect x='150' y='40' width='820' height='110' rx='6' fill='#2E3192'/>` +
  `<text x='560' y='118' text-anchor='middle' font-family='Arial,sans-serif' font-weight='bold' font-size='56' fill='#ffffff' letter-spacing='6'>REZENDE SABACK</text>` +
  `<rect x='150' y='150' width='820' height='10' fill='#FFED00'/>` +
  `<text x='560' y='205' text-anchor='middle' font-family='Arial,sans-serif' font-weight='bold' font-size='32' fill='#FFE95A' letter-spacing='4'>CONSTRUTORA E INCORPORADORA</text>` +
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

  // Cadeia determinística por build: o primeiro item (bundle) é uma string
  // estática — idêntica no prerender (SSR) e no cliente, sem mismatch de
  // hidratação. `logoChain()` completa com os fallbacks de `public/` usando a
  // BASE_URL do bundle que está servindo a página.
  const chain = useMemo<string[]>(() => logoChain(logoBundled), []);

  // Defesa: se a cadeia mudar (ex: HMR reavaliando o módulo), recomeça do
  // primário em vez de manter um índice obsoleto que pularia o bundle.
  const chainKey = chain.join("|");
  useEffect(() => {
    setStep(0);
  }, [chainKey]);

  const src = step < chain.length ? (chain[step] ?? LOGO_INLINE_DATA_URI) : LOGO_INLINE_DATA_URI;
  const isInline = step >= chain.length;

  const handleError = useCallback(() => {
    // Teto rígido: avança no máximo até o SVG inline. Nunca faz loop —
    // o <img> do SVG não tem onError, então a cadeia sempre termina.
    setStep((s) => (s <= chain.length ? s + 1 : s));
  }, [chain.length]);

  const isLight = variant === "light";

  return (
    <Link
      to={to}
      aria-label="Rezende Saback Construtora — início"
      className={`inline-flex shrink-0 items-center transition-transform duration-200 hover:scale-[1.02] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${
        // Variante light (rodapé escuro): pill branco garante contraste do
        // subtítulo azul da marca. Variante dark (header claro): transparente,
        // logo direta sobre o header, sem fundo/caixa/sombra.
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
