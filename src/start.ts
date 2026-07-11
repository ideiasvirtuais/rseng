import { createStart, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";
import { describeRequest, logServerError, newErrorId } from "./lib/error-log";

const errorMiddleware = createMiddleware().server(async ({ next, request }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    const errorId = newErrorId();
    logServerError(errorId, error, {
      kind: "request_middleware_throw",
      ...describeRequest(request),
    });
    return new Response(renderErrorPage(errorId), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8", "x-error-id": errorId },
    });
  }
});

export const startInstance = createStart(() => ({
  requestMiddleware: [errorMiddleware],
}));
