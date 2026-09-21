import { usePortableHealth } from "@/hooks/usePortableHealth";

/**
 * Selo de status do pacote independente — prova viva de portabilidade.
 * Funciona em qualquer hospedagem (lê /health.json local, com fallback).
 * Nunca quebra a página: em erro mostra estado degradado honesto.
 */
export function PortableStatusBadge({ className = "" }: { className?: string }) {
  let health: ReturnType<typeof usePortableHealth>;
  try {
    health = usePortableHealth();
  } catch {
    return null;
  }
  const dot =
    health.status === "ready" ? "bg-emerald-400" : health.status === "loading" ? "bg-amber-300" : "bg-red-400";
  const label =
    health.status === "ready"
      ? `Estático · ok${health.data.buildId ? ` · ${health.data.buildId.slice(0, 13)}` : ""}`
      : health.status === "loading"
        ? "Verificando pacote…"
        : "Modo estático (sem backend)";
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs backdrop-blur ${className}`}
      role="status"
      aria-live="polite"
      title="Health do pacote estático — sem servidor obrigatório"
    >
      <span className={`h-2 w-2 rounded-full ${dot}`} aria-hidden="true" />
      {label}
    </span>
  );
}
