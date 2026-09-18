import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    // Guard SSR/HMR: effects não rodam no servidor, mas o módulo pode ser
    // avaliado em ambiente sem `window` (testes, prerender parcial).
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      try {
        setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
      } catch {
        // estado anterior preservado — nunca quebra a tela
      }
    };
    try {
      mql.addEventListener("change", onChange);
    } catch {
      // Safari antigo: fallback silencioso
      try {
        (mql as unknown as { addListener: (fn: () => void) => void }).addListener(onChange);
      } catch {
        return;
      }
    }
    onChange();
    return () => {
      try {
        mql.removeEventListener("change", onChange);
      } catch {
        try {
          (mql as unknown as { removeListener: (fn: () => void) => void }).removeListener(onChange);
        } catch {
          // no-op
        }
      }
    };
  }, []);

  return !!isMobile;
}
