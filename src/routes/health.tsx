import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState, useTransition } from "react";
import { getStaticHealth } from "@/lib/health-static";

type UiHealth = {
  ok: boolean;
  timestamp: string;
  uptimeSeconds: number | null;
  runtime: { name: string; nodeVersion: string | null };
  request: { host: string | null; userAgent: string | null };
  env: { mode: string };
  database: { configured: boolean; ok: boolean | null; latencyMs: number | null; error: string | null };
  note?: string;
};

/** Loader portátil: tenta o server-fn; em host 100% estático cai no /health.json. */
async function loadHealthPortable(): Promise<UiHealth> {
  try {
    const mod = await import("@/lib/health.functions");
    const server = await (mod.getHealth() as unknown as Promise<UiHealth>);
    if (server && typeof server === "object" && "ok" in server) return server;
  } catch {
    /* host sem backend (Netlify/S3/cPanel...) — segue para modo estático */
  }
  const s = await getStaticHealth();
  return {
    ok: s.ok,
    timestamp: s.timestamp,
    uptimeSeconds: null,
    runtime: { name: "static", nodeVersion: null },
    request: { host: s.host, userAgent: s.userAgent },
    env: { mode: "static" },
    database: s.database,
    note: s.note,
  };
}

export const Route = createFileRoute("/health")({
  head: () => ({
    meta: [
      { title: "Health — status do servidor" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  loader: () => loadHealthPortable(),
  component: HealthPage,
});

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-neutral-200 py-2 text-sm">
      <span className="text-neutral-500">{label}</span>
      <span className="font-mono text-neutral-900 text-right break-all">
        {value}
      </span>
    </div>
  );
}

function Dot({ ok }: { ok: boolean | null }) {
  const color =
    ok === true ? "bg-green-500" : ok === false ? "bg-red-500" : "bg-neutral-400";
  return <span className={`inline-block h-2.5 w-2.5 rounded-full ${color}`} />;
}

const HEALTH_FALLBACK: UiHealth = {
  ok: true,
  timestamp: new Date().toISOString(),
  uptimeSeconds: null,
  runtime: { name: "static", nodeVersion: null },
  request: { host: null, userAgent: null },
  env: { mode: "static" },
  database: { configured: false, ok: null, latencyMs: null, error: null },
  note: "Pacote estático — sem backend.",
};

function HealthPage() {
  const loaded = Route.useLoaderData() as UiHealth | undefined;
  const initial = loaded ?? HEALTH_FALLBACK;
  let router: ReturnType<typeof useRouter> | undefined;
  try {
    router = useRouter();
  } catch {
    router = undefined;
  }
  const [pending, startTransition] = useTransition();
  const [data, setData] = useState(initial);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = async () => {
    setRefreshing(true);
    try {
      const next = await loadHealthPortable();
      setData(next ?? HEALTH_FALLBACK);
      startTransition(() => {
        try {
          router?.invalidate();
        } catch {
          // invalidação opcional — o estado local já foi atualizado
        }
      });
    } catch {
      // mantém os dados atuais se a atualização falhar
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-10 font-sans">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold flex items-center gap-3">
          <Dot ok={data?.ok ?? null} />
          Health
        </h1>
        <button
          onClick={refresh}
          disabled={refreshing || pending}
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50 disabled:opacity-50"
        >
          {refreshing ? "Atualizando…" : "Atualizar"}
        </button>
      </div>

      <section className="mb-8">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">
          Servidor
        </h2>
        <Row label="Status" value={data?.ok ? "OK" : "DEGRADED"} />
        <Row label="Timestamp" value={data?.timestamp ?? "—"} />
        <Row
          label="Uptime"
          value={data?.uptimeSeconds != null ? `${data.uptimeSeconds}s` : "—"}
        />
        <Row label="Node" value={data?.runtime?.nodeVersion ?? "—"} />
        <Row label="Modo" value={data?.env?.mode ?? "—"} />
        <Row label="Host" value={data?.request?.host ?? "—"} />
      </section>

      <section className="mb-8">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">
          Banco de dados
        </h2>
        {data?.database?.configured ? (
          <>
            <Row
              label="Status"
              value={
                <span className="inline-flex items-center gap-2">
                  <Dot ok={data.database.ok ?? null} />
                  {data.database.ok ? "conectado" : "falha"}
                </span>
              }
            />
            <Row
              label="Latência"
              value={
                data.database.latencyMs != null
                  ? `${data.database.latencyMs} ms`
                  : "—"
              }
            />
            {data.database.error && (
              <Row label="Erro" value={data.database.error} />
            )}
          </>
        ) : (
          <p className="text-sm text-neutral-500 py-2">
            Nenhum banco configurado neste projeto.
          </p>
        )}
      </section>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">
          Pacote
        </h2>
        <Row label="Modo" value={data?.env?.mode ?? "static"} />
        <Row label="Nota" value={data?.note ?? "Site estático — sem backend obrigatório."} />
      </section>
    </div>
  );
}
