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
    const blob = new Blob([body], { type: "application/json" });
    if (navigator.sendBeacon && navigator.sendBeacon(ENDPOINT, blob)) return;
    void fetch(ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // last-resort no-op
  }
}

export function reportClientError(
  error: unknown,
  kind: ReportPayload["kind"] = "manual",
  extra?: Record<string, unknown>,
) {
  if (typeof window === "undefined") return;
  const err =
    error instanceof Error
      ? error
      : new Error(typeof error === "string" ? error : JSON.stringify(error));
  send({
    kind,
    message: err.message,
    stack: err.stack,
    url: window.location.href,
    userAgent: navigator.userAgent,
    extra,
  });
}

let installed = false;
export function installClientErrorReporter() {
  if (typeof window === "undefined" || installed) return;
  installed = true;

  window.addEventListener("error", (event) => {
    send({
      kind: "onerror",
      message: event.message || "window error",
      stack: event.error instanceof Error ? event.error.stack : undefined,
      source: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      url: window.location.href,
      userAgent: navigator.userAgent,
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason;
    const err = reason instanceof Error ? reason : new Error(String(reason));
    send({
      kind: "unhandledrejection",
      message: err.message,
      stack: err.stack,
      url: window.location.href,
      userAgent: navigator.userAgent,
    });
  });
}
