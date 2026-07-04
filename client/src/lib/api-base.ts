/**
 * Dev: relative /api → Vite proxy → localhost:3001
 * Prod: direct Render URL (avoids Netlify ~30s proxy timeout on long AI calls)
 * Fallback: relative /api → Netlify _redirects proxy (short requests only)
 */
export function apiUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (import.meta.env.DEV) return normalized;

  const direct = import.meta.env.VITE_API_URL?.replace(/\/$/, "");
  if (direct) return `${direct}${normalized}`;

  return normalized;
}

/** Long-running scout calls need extra time (Render cold start + LLM). */
export function scoutFetch(
  path: string,
  init?: RequestInit
): Promise<Response> {
  const timeoutMs = path.includes("analyze-idea") ? 180_000 : 120_000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  return fetch(apiUrl(path), { ...init, signal: controller.signal }).finally(
    () => clearTimeout(timer)
  );
}
