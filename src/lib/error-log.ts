// Shared helpers to produce richer, correlatable error logs on the server.

export function newErrorId(): string {
  const rand = Math.random().toString(36).slice(2, 8);
  return `err_${Date.now().toString(36)}_${rand}`;
}

export function describeRequest(request: Request): Record<string, string> {
  try {
    const url = new URL(request.url);
    return {
      method: request.method,
      url: request.url,
      path: url.pathname + url.search,
      ua: request.headers.get("user-agent") ?? "",
      referer: request.headers.get("referer") ?? "",
      ip:
        request.headers.get("cf-connecting-ip") ??
        request.headers.get("x-forwarded-for") ??
        "",
    };
  } catch {
    return { method: request.method, url: String(request.url) };
  }
}

export function logServerError(
  errorId: string,
  error: unknown,
  extra: Record<string, unknown> = {},
): void {
  const at = new Date().toISOString();
  const err =
    error instanceof Error
      ? error
      : new Error(typeof error === "string" ? error : JSON.stringify(error));
  // Log the Error object separately to preserve `.stack` in Server Logs.
  console.error(`[SSR ERROR ${errorId}] ${at}`, { errorId, at, ...extra }, err);
}
