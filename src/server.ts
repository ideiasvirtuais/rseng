import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { describeRequest, logServerError, newErrorId } from "./lib/error-log";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

async function normalizeCatastrophicSsrResponse(
  request: Request,
  response: Response,
): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  const errorId = newErrorId();
  const original = consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`);
  logServerError(errorId, original, {
    kind: "h3_swallowed_500",
    ...describeRequest(request),
    body,
  });
  return new Response(renderErrorPage(errorId), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8", "x-error-id": errorId },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(request, response);
    } catch (error) {
      const errorId = newErrorId();
      logServerError(errorId, error, {
        kind: "server_entry_throw",
        ...describeRequest(request),
      });
      return new Response(renderErrorPage(errorId), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8", "x-error-id": errorId },
      });
    }
  },
};
