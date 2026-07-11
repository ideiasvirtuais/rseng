import { createFileRoute } from "@tanstack/react-router";
import { newErrorId, logServerError, describeRequest } from "@/lib/error-log";

type ClientErrorPayload = {
  message?: string;
  stack?: string;
  source?: string;
  lineno?: number;
  colno?: number;
  url?: string;
  userAgent?: string;
  kind?: string;
  extra?: Record<string, unknown>;
};

export const Route = createFileRoute("/api/public/client-error")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let payload: ClientErrorPayload = {};
        try {
          payload = (await request.json()) as ClientErrorPayload;
        } catch {
          // ignore malformed body
        }
        const errorId = newErrorId();
        const err = new Error(payload.message || "client error");
        if (typeof payload.stack === "string") err.stack = payload.stack;
        logServerError(errorId, err, {
          kind: `client:${payload.kind ?? "unknown"}`,
          clientUrl: payload.url,
          clientUA: payload.userAgent,
          source: payload.source,
          lineno: payload.lineno,
          colno: payload.colno,
          extra: payload.extra,
          ...describeRequest(request),
        });
        return Response.json({ ok: true, errorId });
      },
      OPTIONS: async () =>
        new Response(null, {
          status: 204,
          headers: {
            "access-control-allow-origin": "*",
            "access-control-allow-methods": "POST, OPTIONS",
            "access-control-allow-headers": "content-type",
          },
        }),
    },
  },
});
