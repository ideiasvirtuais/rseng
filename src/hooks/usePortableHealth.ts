import { useCallback, useEffect, useState } from "react";
import { getStaticHealth, type StaticHealthStatus } from "@/lib/health-static";

export type PortableHealthState =
  | { status: "loading"; data: null; error: null }
  | { status: "ready"; data: StaticHealthStatus; error: null }
  | { status: "error"; data: StaticHealthStatus; error: string };

/**
 * Hook portátil de health — 100% client-side, sem backend obrigatório.
 * Lê `/health.json` do pacote estático (com BASE_PATH) e nunca quebra
 * a renderização: em falha retorna fallback honesto.
 */
export function usePortableHealth(pollMs = 0): PortableHealthState & { refresh: () => void } {
  const [data, setData] = useState<StaticHealthStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  const refresh = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const next = await getStaticHealth();
        if (!cancelled) {
          setData(next);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "health indisponível");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [nonce]);

  useEffect(() => {
    if (!pollMs || pollMs < 5000) return;
    const t = setInterval(() => setNonce((n) => n + 1), pollMs);
    return () => clearInterval(t);
  }, [pollMs]);

  if (data) return { status: "ready", data, error: null, refresh };
  if (error) {
    return {
      status: "error",
      data: {
        ok: true,
        mode: "static",
        timestamp: new Date().toISOString(),
        buildId: null,
        host: typeof window !== "undefined" ? window.location.host : null,
        userAgent: null,
        database: { configured: false, ok: null, latencyMs: null, error: null },
        note: "Pacote estático — sem backend. Site 100% funcional sem servidor.",
      },
      error,
      refresh,
    };
  }
  return { status: "loading", data: null, error: null, refresh };
}
