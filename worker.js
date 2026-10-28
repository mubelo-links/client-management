
const ALLOWED_ORIGIN = "https://mubelo-links.github.io";

function jsonResponse(data, status) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Vary": "Origin"
    }
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "";

    if (url.pathname.startsWith("/api/")) {
      if (origin && origin !== ALLOWED_ORIGIN) {
        return new Response("Forbidden", { status: 403 });
      }

      if (request.method === "OPTIONS") {
        return new Response(null, {
          status: 204,
          headers: {
            "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Max-Age": "86400",
            "Vary": "Origin"
          }
        });
      }

      if (url.pathname === "/api/health" && request.method === "GET") {
        return jsonResponse({
          ok: true,
          service: "mubelo-solar-api",
          backendConnected: false
        }, 200);
      }

      if (url.pathname === "/api/submit" && request.method === "POST") {
        return jsonResponse({
          ok: false,
          error: "Submission is not configured. No data was saved."
        }, 503);
      }

      return jsonResponse({ error: "Not found" }, 404);
    }

    return env.ASSETS.fetch(request);
  }
};

    // Preserve normal static-asset serving for non-API requests.
    return env.ASSETS.fetch(request);
  }
};
