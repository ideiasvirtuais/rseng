import { createServerFn } from "@tanstack/react-start";

export type HealthStatus = {
  ok: boolean;
  timestamp: string;
  uptimeSeconds: number | null;
  runtime: {
    name: string;
    nodeVersion: string | null;
  };
  request: {
    host: string | null;
    userAgent: string | null;
  };
  env: {
    mode: string;
    hasSupabaseUrl: boolean;
    hasSupabasePublishableKey: boolean;
    hasSupabaseServiceRole: boolean;
  };
  database: {
    configured: boolean;
    ok: boolean | null;
    latencyMs: number | null;
    error: string | null;
  };
};

export const getHealth = createServerFn({ method: "GET" }).handler(
  async (): Promise<HealthStatus> => {
    const { getRequestHeader, getRequestHost } = await import(
      "@tanstack/react-start/server"
    );

    const host = (() => {
      try {
        return getRequestHost();
      } catch {
        return null;
      }
    })();
    const userAgent = (() => {
      try {
        return getRequestHeader("user-agent") ?? null;
      } catch {
        return null;
      }
    })();

    const hasSupabaseUrl = Boolean(process.env.SUPABASE_URL);
    const hasSupabasePublishableKey = Boolean(
      process.env.SUPABASE_PUBLISHABLE_KEY,
    );
    const hasSupabaseServiceRole = Boolean(
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    );

    const database: HealthStatus["database"] = {
      configured: hasSupabaseUrl && hasSupabasePublishableKey,
      ok: null,
      latencyMs: null,
      error: null,
    };

    if (database.configured) {
      const start = Date.now();
      try {
        const res = await fetch(
          `${process.env.SUPABASE_URL}/auth/v1/health`,
          {
            headers: {
              apikey: process.env.SUPABASE_PUBLISHABLE_KEY!,
            },
            signal: AbortSignal.timeout(3000),
          },
        );
        database.latencyMs = Date.now() - start;
        database.ok = res.ok;
        if (!res.ok) database.error = `HTTP ${res.status}`;
      } catch (err) {
        database.latencyMs = Date.now() - start;
        database.ok = false;
        database.error = err instanceof Error ? err.message : String(err);
      }
    }

    const uptimeSeconds =
      typeof process.uptime === "function" ? Math.round(process.uptime()) : null;

    return {
      ok: database.configured ? database.ok === true : true,
      timestamp: new Date().toISOString(),
      uptimeSeconds,
      runtime: {
        name:
          typeof navigator !== "undefined" && "userAgent" in navigator
            ? (navigator as { userAgent: string }).userAgent
            : "node",
        nodeVersion: process.versions?.node ?? null,
      },
      request: { host, userAgent },
      env: {
        mode: process.env.NODE_ENV ?? "unknown",
        hasSupabaseUrl,
        hasSupabasePublishableKey,
        hasSupabaseServiceRole,
      },
      database,
    };
  },
);
