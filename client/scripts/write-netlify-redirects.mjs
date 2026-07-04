import { writeFileSync } from "node:fs";
import { join } from "node:path";

const apiBase = process.env.VITE_API_URL?.replace(/\/$/, "") ?? "";
const lines = [];

if (apiBase) {
  lines.push(`/api/*  ${apiBase}/api/:splat  200`);
}

lines.push("/*    /index.html   200");

writeFileSync(join(process.cwd(), "dist", "_redirects"), lines.join("\n") + "\n");
console.log(
  apiBase
    ? `Wrote Netlify _redirects with API proxy → ${apiBase}`
    : "Wrote Netlify _redirects (SPA only, no API proxy — set VITE_API_URL on Netlify)"
);
