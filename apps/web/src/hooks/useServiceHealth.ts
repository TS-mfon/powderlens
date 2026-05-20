import { useEffect, useState } from "react";

import type { ServiceHealth } from "../types";

const apiBase = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || "";

const unavailableMessage =
  "Sorry for the inconvenience, our backend service is currently down. On-chain operations remain active.";

export function useServiceHealth() {
  const [health, setHealth] = useState<ServiceHealth>({
    backendAvailable: false,
    lastCheckedAt: null,
    message: unavailableMessage,
    runtimeOrigin: null,
    backendRole: null
  });

  useEffect(() => {
    let active = true;

    const check = async () => {
      if (!apiBase) {
        if (active) {
          setHealth({
            backendAvailable: false,
            lastCheckedAt: new Date().toISOString(),
            message: unavailableMessage,
            runtimeOrigin: null,
            backendRole: null
          });
        }
        return;
      }

      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 1800);

      try {
        const response = await fetch(`${apiBase}/health`, { signal: controller.signal });
        const payload = response.ok
          ? ((await response.json()) as {
              status?: string;
              runtimeOrigin?: "vps" | "render";
              backendRole?: "primary" | "fallback";
            })
          : null;

        if (active) {
          const backendAvailable = Boolean(response.ok && payload?.status === "ok");
          const runtimeOrigin =
            payload?.runtimeOrigin ??
            ((response.headers.get("x-runtime-origin") as "vps" | "render" | null) ?? null);
          const backendRole =
            payload?.backendRole ??
            ((response.headers.get("x-backend-role") as "primary" | "fallback" | null) ?? null);
          setHealth({
            backendAvailable,
            lastCheckedAt: new Date().toISOString(),
            message: backendAvailable
              ? runtimeOrigin === "render"
                ? "Render fallback is currently serving backend traffic."
                : "Primary backend services are healthy."
              : unavailableMessage,
            runtimeOrigin,
            backendRole
          });
        }
      } catch {
        if (active) {
          setHealth({
            backendAvailable: false,
            lastCheckedAt: new Date().toISOString(),
            message: unavailableMessage,
            runtimeOrigin: null,
            backendRole: null
          });
        }
      } finally {
        window.clearTimeout(timeout);
      }
    };

    void check();
    const timer = window.setInterval(() => {
      void check();
    }, 15000);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  return health;
}
