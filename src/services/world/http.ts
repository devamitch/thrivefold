/** GET with a timeout; throws on non-2xx. Used by the public-data providers in services/world. */
export async function getText(url: string, timeoutMs = 10_000): Promise<string> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(t);
  }
}

export async function getJson<T>(url: string, timeoutMs = 10_000): Promise<T> {
  return JSON.parse(await getText(url, timeoutMs)) as T;
}
