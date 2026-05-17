import { appConfig } from "./config";
import type { AlertRule, Review, Signal } from "./types";

const apiBase = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || "";
const alertStorageKey = `${appConfig.slug}:alerts`;

const timeoutFetch = async <T>(path: string, init?: RequestInit): Promise<T | null> => {
  if (!apiBase) {
    return null;
  }

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 1500);

  try {
    const response = await fetch(`${apiBase}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {})
      },
      signal: controller.signal
    });

    if (!response.ok) {
      return null;
    }

    return response.json() as Promise<T>;
  } catch {
    return null;
  } finally {
    window.clearTimeout(timeout);
  }
};

const loadAlerts = (): AlertRule[] => {
  if (typeof window === "undefined") {
    return appConfig.defaultAlerts;
  }

  const raw = window.localStorage.getItem(alertStorageKey);
  if (!raw) {
    window.localStorage.setItem(alertStorageKey, JSON.stringify(appConfig.defaultAlerts));
    return appConfig.defaultAlerts;
  }

  try {
    return JSON.parse(raw) as AlertRule[];
  } catch {
    return appConfig.defaultAlerts;
  }
};

const saveAlerts = (alerts: AlertRule[]) => {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(alertStorageKey, JSON.stringify(alerts));
  }
};

const toReviews = (signals: Signal[]): Review[] =>
  signals.map((signal) => ({
    id: signal.id,
    headline: signal.headline,
    confidence: signal.confidence,
    severity: signal.severity,
    status: signal.confidence >= 85 ? "escalated" : "queued"
  }));

export async function getJson<T>(path: string): Promise<T> {
  const remote = await timeoutFetch<T>(path);
  if (remote !== null) {
    return remote;
  }

  switch (path) {
    case "/signals":
      return appConfig.fallbackSignals as T;
    case "/alerts":
      return loadAlerts() as T;
    case "/admin/reviews":
      return toReviews(appConfig.fallbackSignals) as T;
    default:
      throw new Error(`No fallback data configured for ${path}`);
  }
}

export async function postJson<T>(path: string, body: unknown): Promise<T> {
  const remote = await timeoutFetch<T>(path, {
    method: "POST",
    body: JSON.stringify(body)
  });

  if (remote !== null) {
    return remote;
  }

  if (path === "/alerts") {
    const payload = body as { channel: string; condition: string };
    const created: AlertRule = {
      id: `${appConfig.slug}-${Date.now()}`,
      channel: payload.channel,
      condition: payload.condition,
      isEnabled: true,
      createdAt: new Date().toISOString()
    };

    const next = [created, ...loadAlerts()];
    saveAlerts(next);
    return created as T;
  }

  throw new Error(`No fallback mutation configured for ${path}`);
}
