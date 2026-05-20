const PRIMARY_API_ORIGIN =
  (process.env.PRIMARY_API_ORIGIN || process.env.VPS_API_ORIGIN || "http://172.236.110.179:4410").replace(/\/$/, "");
const FALLBACK_API_ORIGIN =
  (process.env.FALLBACK_API_ORIGIN || process.env.RENDER_API_ORIGIN || "https://powderlens-api-fallback.onrender.com").replace(/\/$/, "");

const PRIMARY_TIMEOUT_MS = Number(process.env.PRIMARY_HEALTH_TIMEOUT_MS || 1200);
const REQUEST_TIMEOUT_MS = Number(process.env.BACKEND_REQUEST_TIMEOUT_MS || 4500);
const HEALTH_CACHE_TTL_MS = Number(process.env.HEALTH_CACHE_TTL_MS || 10000);

let cachedPrimaryHealthy = null;
let cachedAt = 0;

const hopByHopHeaders = new Set([
  "connection",
  "content-length",
  "host",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade"
]);

async function readBody(req) {
  if (req.method === "GET" || req.method === "HEAD") {
    return undefined;
  }

  if (typeof req.body === "string" || Buffer.isBuffer(req.body)) {
    return req.body;
  }

  if (req.body && typeof req.body === "object") {
    return JSON.stringify(req.body);
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  return chunks.length > 0 ? Buffer.concat(chunks) : undefined;
}

function buildPath(req) {
  const parsed = new URL(req.url || "/", "https://local-gateway.vercel.app");
  const pathname = parsed.pathname.replace(/^\/(?:api\/)?backend\/?/, "/");
  const normalizedPath = pathname === "/" ? "/health" : pathname;
  return `${normalizedPath}${parsed.search}`;
}

function copyRequestHeaders(req) {
  const headers = new Headers();

  for (const [key, value] of Object.entries(req.headers)) {
    if (!value || hopByHopHeaders.has(key.toLowerCase())) {
      continue;
    }

    if (Array.isArray(value)) {
      headers.set(key, value.join(", "));
    } else {
      headers.set(key, value);
    }
  }

  return headers;
}

async function proxy(origin, req, body, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(`${origin}${buildPath(req)}`, {
      method: req.method,
      headers: copyRequestHeaders(req),
      body,
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function isPrimaryHealthy() {
  if (cachedPrimaryHealthy !== null && Date.now() - cachedAt < HEALTH_CACHE_TTL_MS) {
    return cachedPrimaryHealthy;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PRIMARY_TIMEOUT_MS);

  try {
    const response = await fetch(`${PRIMARY_API_ORIGIN}/health`, {
      headers: { accept: "application/json" },
      signal: controller.signal
    });
    cachedPrimaryHealthy = response.ok;
  } catch {
    cachedPrimaryHealthy = false;
  } finally {
    cachedAt = Date.now();
    clearTimeout(timeout);
  }

  return cachedPrimaryHealthy;
}

async function sendProxyResponse(res, response, runtimeOrigin) {
  res.statusCode = response.status;

  response.headers.forEach((value, key) => {
    if (!hopByHopHeaders.has(key.toLowerCase())) {
      res.setHeader(key, value);
    }
  });

  res.setHeader("x-runtime-origin", runtimeOrigin);
  const body = Buffer.from(await response.arrayBuffer());
  res.send(body);
}

export default async function handler(req, res) {
  const body = await readBody(req);
  const preferPrimary = await isPrimaryHealthy();
  const order = preferPrimary
    ? [
        { origin: PRIMARY_API_ORIGIN, runtimeOrigin: "vps" },
        { origin: FALLBACK_API_ORIGIN, runtimeOrigin: "render" }
      ]
    : [
        { origin: FALLBACK_API_ORIGIN, runtimeOrigin: "render" },
        { origin: PRIMARY_API_ORIGIN, runtimeOrigin: "vps" }
      ];

  for (const target of order) {
    try {
      const response = await proxy(target.origin, req, body, REQUEST_TIMEOUT_MS);
      if (target.runtimeOrigin === "vps") {
        cachedPrimaryHealthy = response.ok;
        cachedAt = Date.now();
      }
      await sendProxyResponse(res, response, target.runtimeOrigin);
      return;
    } catch {
      if (target.runtimeOrigin === "vps") {
        cachedPrimaryHealthy = false;
        cachedAt = Date.now();
      }
    }
  }

  res.status(503).json({
    status: "degraded",
    message: "Sorry for the inconvenience, our backend service is currently down. On-chain operations remain active.",
    runtimeOrigin: "unavailable",
    backendRole: "unavailable"
  });
}
