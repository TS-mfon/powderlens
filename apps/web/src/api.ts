const apiBase = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || "";

const timeoutFetch = async <T>(path: string, init?: RequestInit): Promise<T> => {
  if (!apiBase) {
    throw new Error("API base URL is not configured.");
  }

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 4000);

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
      throw new Error(`API request failed for ${path} with ${response.status}`);
    }

    return response.json() as Promise<T>;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`API request timed out for ${path}`);
    }

    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
};

export async function getJson<T>(path: string): Promise<T> {
  return timeoutFetch<T>(path);
}

export async function postJson<T>(path: string, body: unknown): Promise<T> {
  return timeoutFetch<T>(path, {
    method: "POST",
    body: JSON.stringify(body)
  });
}
