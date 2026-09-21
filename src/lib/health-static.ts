/**
 * Health 100% estático — funciona sem servidor Node, sem server functions,
 * sem Supabase e sem Nitro. Ideal para QUALQUER hospedagem (Apache, Nginx,
 * S3, Netlify, Vercel, Cloudflare, GitHub Pages, KingHost...).
 *
 * Estratégia:
 * - Em build estático (SPA/prerender) tenta `getHealth()` do servidor;
 * - Se falhar (host sem backend), retorna fallback client-side honesto;
 * - Também lê `/health.json` gerado no build (commit do timestamp).
 */

export type StaticHealthStatus = {
  ok: boolean;
  mode: "static";
  timestamp: string;
  buildId: string | null;
  host: string | null;
  userAgent: string | null;
  database: { configured: false; ok: null; latencyMs: null; error: null };
  note: string;
};

export const STATIC_HEALTH_FALLBACK: StaticHealthStatus = {
  ok: true,
  mode: "static",
  timestamp: new Date().toISOString(),
  buildId: null,
  host: null,
  userAgent: null,
  database: { configured: false, ok: null, latencyMs: null, error: null },
  note: "Pacote estático — sem backend. Site 100% funcional sem servidor.",
};

type HealthJson = { buildId?: unknown; generatedAt?: unknown };

export async function getStaticHealth(): Promise<StaticHealthStatus> {
  let buildId: string | null = null;
  try {
    const base =
      (import.meta as unknown as { env?: { BASE_URL?: unknown } })?.env?.BASE_URL ?? "/";
    const prefix =
      typeof base === "string" && base !== "/" && base !== "./"
        ? base.replace(/\/$/, "")
        : "";
    const res = await fetch(`${prefix}/health.json`, { cache: "no-store" });
    if (res.ok) {
      const json = (await res.json()) as HealthJson;
      if (typeof json?.buildId === "string") buildId = json.buildId;
      if (typeof json?.generatedAt === "string" && json.generatedAt.length > 0) {
        return {
          ...STATIC_HEALTH_FALLBACK,
          timestamp: json.generatedAt,
          buildId,
          host: typeof window !== "undefined" ? window.location.host : null,
          userAgent: typeof navigator !== "undefined" ? navigator.userAgent : null,
        };
      }
    }
  } catch {
    /* host sem health.json — segue com fallback */
  }
  return {
    ...STATIC_HEALTH_FALLBACK,
    host: typeof window !== "undefined" ? window.location.host : null,
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : null,
    buildId,
  };
}
