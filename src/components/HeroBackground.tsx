import { useCallback, useEffect, useRef, useState } from "react";

import { resolveImage, type ImageInput } from "@/lib/images";

type HeroBackgroundProps = {
  src: ImageInput;
  fallbackSrc?: ImageInput;
  alt: string;
  /** Classes extras do container (posicionamento). */
  className?: string;
  /** Classes extras do <img> (ex: object-position). */
  imgClassName?: string;
};

/**
 * Fundo do hero da home — substitui o SmartImage genérico neste ponto crítico.
 *
 * Causa raiz do "erro na imagem inicial de fundo":
 * 1. O SmartImage renderiza o <img> com `opacity-0` no HTML estático
 *    (prerender) e só revela após hidratação + evento onLoad. Sem JS,
 *    com hidratação lenta ou com onLoad perdido, o hero ficava invisível
 *    (só o gradiente) — parecia imagem quebrada.
 * 2. O wrapper misturava `relative` + `absolute` no tailwind-merge.
 *
 * Este componente:
 * - Renderiza o <img> VISÍVEL por padrão (opacity-100), inclusive no SSR —
 *   sem JS a foto ainda aparece. O fade-in é progressivo via animação CSS.
 * - Fundo sólido primário + skeleton que some no onLoad (nunca tela branca).
 * - Cadeia de fallback jpg ↔ webp no onError; se tudo falhar, esconde o
 *   <img> com elegância e mantém o gradiente institucional (sem ícone quebrado).
 * - Não emite <link rel="preload"> manual — o React 19 já gera o preload
 *   SSR automaticamente com o mesmo href; duplicar causaria warning
 *   "preloaded but not used" no preview.
 */
export function HeroBackground({
  src: rawSrc,
  fallbackSrc: rawFallback,
  alt,
  className,
  imgClassName,
}: HeroBackgroundProps) {
  const primary = (() => {
    try {
      return resolveImage(rawSrc) || "";
    } catch {
      return "";
    }
  })();
  const fallback = (() => {
    try {
      return resolveImage(rawFallback) || "";
    } catch {
      return "";
    }
  })();
  const safeAlt = typeof alt === "string" && alt ? alt : "Empreendimento Rezende Saback";

  const chain = [primary, fallback].filter((u, i, arr) => u && arr.indexOf(u) === i);

  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const current = failed ? "" : (chain[index] ?? "");

  // Se a URL pedida mudar, recomeça o ciclo.
  useEffect(() => {
    setIndex(0);
    setFailed(false);
    setRevealed(false);
  }, [primary, fallback]);

  // Rede de segurança: se o browser já tem a imagem (cache) mas o onLoad
  // foi perdido na hidratação, revela pelo estado `complete`.
  useEffect(() => {
    if (!current || failed) return;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const check = () => {
      try {
        const el = imgRef.current;
        if (el && el.complete && el.naturalWidth > 0) {
          setRevealed(true);
          return true;
        }
      } catch {
        // nunca quebra o hero
      }
      return false;
    };
    if (check()) return;
    timer = setTimeout(() => {
      if (!check()) {
        // Último recurso: revela de qualquer forma para nunca deixar o
        // hero vazio — se a imagem estiver quebrada o onError já terá
        // avançado a cadeia / escondido o <img>.
        try {
          const el = imgRef.current;
          if (el && el.complete) setRevealed(true);
        } catch {
          // no-op
        }
      }
    }, 2500);
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [current, failed]);

  const handleError = useCallback(() => {
    if (index + 1 < chain.length) {
      setIndex((i) => i + 1);
      setRevealed(false);
      return;
    }
    // Cadeia esgotada: esconde o <img>, mantém o fundo institucional.
    setFailed(true);
  }, [index, chain.length]);

  return (
    <div
      aria-hidden={false}
      className={[
        "absolute inset-0 overflow-hidden bg-primary",
        className ?? "",
      ].join(" ")}
    >
      {/* Base institucional — visível mesmo antes/depois da foto */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-[#1a1c5e]" />

      {current ? (
        <img
          ref={imgRef}
          src={current}
          alt={safeAlt}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          draggable={false}
          onLoad={() => setRevealed(true)}
          onError={handleError}
          className={[
            "absolute inset-0 h-full w-full object-cover",
            "transition-opacity duration-700",
            revealed ? "opacity-100" : "opacity-100",
            imgClassName ?? "",
          ].join(" ")}
          style={revealed ? undefined : { animation: "hero-fade-in 0.9s ease-out" }}
        />
      ) : null}

      {/* Véu de carregamento: some assim que a foto revela */}
      <div
        aria-hidden="true"
        className={[
          "pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/60 via-primary/40 to-primary/70",
          "transition-opacity duration-700",
          revealed ? "opacity-0" : "animate-pulse opacity-100",
        ].join(" ")}
      />

      <style>{`
        @keyframes hero-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
