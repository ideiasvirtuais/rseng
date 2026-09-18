// Sends unhandled client-side errors to the server so they land in Server Logs.

type ReportPayload = {
  message: string;
  stack?: string;
  source?: string;
  lineno?: number;
  colno?: number;
  url: string;
  userAgent: string;
  kind: "onerror" | "unhandledrejection" | "manual" | "react_error_boundary";
  extra?: Record<string, unknown>;
};

const ENDPOINT = "/api/public/client-error";
const seen = new Set<string>();

function send(payload: ReportPayload) {
  const key = `${payload.kind}|${payload.message}|${payload.source ?? ""}|${payload.lineno ?? 0}`;
  if (seen.has(key)) return;
  seen.add(key);
  if (seen.size > 50) seen.clear();

  try {
    const body = JSON.stringify(payload);
    // `navigator` pode não existir (SSR/worker/teste): typeof guard,
    // pois `navigator?.` sozinho lança ReferenceError se não declarado.
    const nav =
      typeof navigator !== "undefined" ? (navigator as Navigator | undefined) : undefined;
    try {
      const blob = new Blob([body], { type: "application/json" });
      if (nav?.sendBeacon?.(ENDPOINT, blob)) return;
    } catch {
      // segue para fetch keepalive
    }
    if (typeof fetch === "function") {
      void fetch(ENDPOINT, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body,
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    // last-resort no-op
  }
}

/** JSON.stringify à prova de referências circulares / BigInt. */
function safeStringify(value: unknown): string {
  try {
    return JSON.stringify(value) ?? String(value);
  } catch {
    try {
      const seen = new WeakSet();
      return (
        JSON.stringify(value, (_key, v) => {
          if (typeof v === "bigint") return `${v}n`;
          if (typeof v === "object" && v !== null) {
            if (seen.has(v)) return "[Circular]";
            seen.add(v);
          }
          return v;
        }) ?? String(value)
      );
    } catch {
      return String(value);
    }
  }
}

export function reportClientError(
  error: unknown,
  kind: ReportPayload["kind"] = "manual",
  extra?: Record<string, unknown>,
) {
  if (typeof window === "undefined") return;
  // O reporte roda dentro do boundary de erro: ele NUNCA pode lançar
  // (um stringify circular aqui gerava loop de erro → tela branca).
  let err: Error;
  try {
    err =
      error instanceof Error
        ? error
        : new Error(typeof error === "string" ? error : safeStringify(error));
  } catch {
    return;
  }
  try {
    const loc = typeof window !== "undefined" ? window.location : undefined;
    const nav = typeof navigator !== "undefined" ? (navigator as Navigator | undefined) : undefined;
    send({
      kind,
      message: err.message,
      stack: err.stack,
      url: loc?.href ?? "unknown",
      userAgent: nav?.userAgent ?? "unknown",
      extra,
    });
  } catch {
    // no-op: telemetria nunca quebra a aplicação
  }
}

let installed = false;
export function installClientErrorReporter() {
  if (typeof window === "undefined" || installed) return;
  installed = true;

  window.addEventListener("error", (event) => {
    try {
      const nav =
        typeof navigator !== "undefined" ? (navigator as Navigator | undefined) : undefined;
      send({
        kind: "onerror",
        message: (event as ErrorEvent)?.message || "window error",
        stack: (event as ErrorEvent)?.error instanceof Error ? (event as ErrorEvent).error.stack : undefined,
        source: (event as ErrorEvent)?.filename,
        lineno: (event as ErrorEvent)?.lineno,
        colno: (event as ErrorEvent)?.colno,
        url: window.location?.href ?? "unknown",
        userAgent: nav?.userAgent ?? "unknown",
      });
    } catch {
      // telemetria nunca quebra a aplicação
    }
  });

  window.addEventListener("unhandledrejection", (event) => {
    try {
      const nav =
        typeof navigator !== "undefined" ? (navigator as Navigator | undefined) : undefined;
      const reason = (event as PromiseRejectionEvent)?.reason;
      const err = reason instanceof Error ? reason : new Error(String(reason));
      send({
        kind: "unhandledrejection",
        message: err.message,
        stack: err.stack,
        url: window.location?.href ?? "unknown",
        userAgent: nav?.userAgent ?? "unknown",
      });
    } catch {
      // telemetria nunca quebra a aplicação
    }
  });
}
