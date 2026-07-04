/**
 * Dev: relative /api → Vite proxy → localhost:3001
 * Prod: relative /api → Netlify _redirects proxy → Render (VITE_API_URL used at build only)
 */
export function apiUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return normalized;
}
