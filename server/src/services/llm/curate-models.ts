import type { ProviderModel } from "./list-models.js";

/** Pick useful OpenRouter models for the isee platform (free + popular first). */
export function curateOpenRouterPlatformModels(
  models: ProviderModel[]
): ProviderModel[] {
  const score = (id: string): number => {
    if (id === "openrouter/free") return 100;
    if (id.includes("llama-3.3-70b") && id.includes(":free")) return 88;
    if (id.includes("deepseek") && id.includes(":free")) return 86;
    if (id.includes(":free")) return 82;
    if (id.includes("gemini-2.5-flash") && !id.includes("lite")) return 80;
    if (id.includes("gpt-4o-mini")) return 75;
    if (id.includes("claude-3.5-haiku") || id.includes("claude-haiku")) return 70;
    if (id.includes("llama-3.3-70b")) return 65;
    if (id.includes("gemma") && id.includes(":free")) return 40;
    return 0;
  };

  const sorted = [...models].sort(
    (a, b) => score(b.id) - score(a.id) || a.label.localeCompare(b.label)
  );

  const seen = new Set<string>();
  const result: ProviderModel[] = [];
  for (const m of sorted) {
    if (seen.has(m.id)) continue;
    seen.add(m.id);
    result.push(m);
    if (result.length >= 20) break;
  }
  return result;
}

export function defaultOpenRouterModel(models: ProviderModel[]): string {
  const curated = curateOpenRouterPlatformModels(models);
  return (
    curated.find((m) => m.id.includes(":free"))?.id ??
    curated[0]?.id ??
    "openrouter/free"
  );
}
