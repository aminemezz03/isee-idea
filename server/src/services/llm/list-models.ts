import type { LlmProvider } from "../../llm-types.js";

export interface ProviderModel {
  id: string;
  label: string;
}

export async function listProviderModels(
  provider: LlmProvider,
  apiKey: string
): Promise<ProviderModel[]> {
  switch (provider) {
    case "gemini":
      return listGeminiModels(apiKey);
    case "openai":
      return listOpenAIModels(apiKey);
    case "anthropic":
      return listAnthropicModels(apiKey);
    case "openrouter":
      return listOpenRouterModels(apiKey);
    case "ollama": {
      const { listOllamaModels } = await import("./ollama.js");
      return listOllamaModels(apiKey);
    }
    default:
      return [];
  }
}

async function listGeminiModels(apiKey: string): Promise<ProviderModel[]> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url);
  if (!res.ok) throw listError(res);

  const data = (await res.json()) as {
    models?: {
      name: string;
      displayName?: string;
      supportedGenerationMethods?: string[];
    }[];
  };

  return (data.models ?? [])
    .filter((m) => m.supportedGenerationMethods?.includes("generateContent"))
    .map((m) => {
      const id = m.name.replace(/^models\//, "");
      return { id, label: m.displayName || formatLabel(id) };
    })
    .sort((a, b) => a.label.localeCompare(b.label));
}

async function listOpenAIModels(apiKey: string): Promise<ProviderModel[]> {
  const res = await fetch("https://api.openai.com/v1/models", {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) throw listError(res);

  const data = (await res.json()) as { data?: { id: string }[] };

  return (data.data ?? [])
    .map((m) => m.id)
    .filter((id) => /^(gpt-|o[134]|chatgpt)/i.test(id))
    .sort()
    .reverse()
    .map((id) => ({ id, label: formatLabel(id) }));
}

async function listAnthropicModels(apiKey: string): Promise<ProviderModel[]> {
  const res = await fetch("https://api.anthropic.com/v1/models", {
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
  });
  if (!res.ok) throw listError(res);

  const data = (await res.json()) as {
    data?: { id: string; display_name?: string }[];
  };

  return (data.data ?? [])
    .map((m) => ({
      id: m.id,
      label: m.display_name || formatLabel(m.id),
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export async function listOpenRouterModels(apiKey: string): Promise<ProviderModel[]> {
  const res = await fetch("https://openrouter.ai/api/v1/models", {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) throw listError(res);

  const data = (await res.json()) as {
    data?: { id: string; name?: string }[];
  };

  return (data.data ?? [])
    .filter((m) => m.id && !m.id.includes("moderation"))
    .map((m) => ({
      id: m.id,
      label: m.name || formatOpenRouterLabel(m.id),
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

function formatOpenRouterLabel(id: string): string {
  const parts = id.split("/");
  const name = parts[parts.length - 1].replace(/:.*$/, "");
  return formatLabel(name);
}

function formatLabel(id: string): string {
  return id
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

async function listError(res: Response): Promise<Error> {
  const body = await res.text();
  if (res.status === 401 || res.status === 403) {
    return new Error("Invalid API key.");
  }
  try {
    const data = JSON.parse(body) as { error?: { message?: string } };
    return new Error(data.error?.message ?? "Failed to list models.");
  } catch {
    return new Error("Failed to list models.");
  }
}
