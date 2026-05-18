import { useEffect, useState } from "react";

import type { ServiceHealth } from "../types";

const apiBase = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || "";

const unavailableMessage =
  "Sorry for the inconvenience, our backend service is currently down. On-chain operations remain active.";

export function useServiceHealth() {
  const [health, setHealth] = useState<ServiceHealth>({
    backendAvailable: false,
    lastCheckedAt: null,
    message: unavailableMessage
  });

  useEffect(() => {
    let active = true;

    const check = async () => {
      if (!apiBase) {
        if (active) {
          setHealth({
            backendAvailable: false,
            lastCheckedAt: new Date().toISOString(),
            message: unavailableMessage
          });
        }
        return;
      }

      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 1800);

      try {
        const response = await fetch(`${apiBase}/health`, { signal: controller.signal });
        const payload = response.ok ? ((await response.json()) as { status?: string }) : null;

        if (active) {
          setHealth({
            backendAvailable: Boolean(response.ok && payload?.status === "ok"),
            lastCheckedAt: new Date().toISOString(),
            message: response.ok
              ? "Backend services are healthy."
              : unavailableMessage
          });
        }
      } catch {
        if (active) {
          setHealth({
            backendAvailable: false,
            lastCheckedAt: new Date().toISOString(),
            message: unavailableMessage
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
