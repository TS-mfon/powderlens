const apiBase =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4010";

export async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${apiBase}${path}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${path}`);
  }

  return response.json() as Promise<T>;
}
