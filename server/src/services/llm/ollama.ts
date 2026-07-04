import type { ProviderModel } from "./list-models.js";

export const OLLAMA_CLOUD_BASE = "https://ollama.com";

export function getOllamaApiKey(): string | undefined {
  return (
    process.env.OLLAMA_API_KEY?.trim() ||
    process.env.Ollama_API_KEY?.trim()
  );
}

export function curateOllamaPlatformModels(
  models: ProviderModel[]
): ProviderModel[] {
  const score = (id: string): number => {
    if (id.includes("cloud")) return 95;
    if (id.includes("gpt-oss")) return 90;
    if (id.includes("gemma4")) return 85;
    if (id.includes("qwen3")) return 80;
    if (id.includes("deepseek")) return 78;
    if (id.includes("llama")) return 70;
    return 50;
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
    if (result.length >= 15) break;
  }
  return result;
}

export function defaultOllamaModel(models: ProviderModel[]): string {
  const curated = curateOllamaPlatformModels(models);
  return (
    curated.find((m) => m.id.includes("cloud"))?.id ??
    curated[0]?.id ??
    "gpt-oss:120b-cloud"
  );
}

export async function listOllamaModels(apiKey: string): Promise<ProviderModel[]> {
  const res = await fetch(`${OLLAMA_CLOUD_BASE}/api/tags`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  if (!res.ok) {
    const body = await res.text();
    if (res.status === 401 || res.status === 403) {
      throw new Error("Invalid Ollama API key.");
    }
    throw new Error(`Failed to list Ollama models (${res.status}): ${body.slice(0, 120)}`);
  }

  const data = (await res.json()) as {
    models?: { name?: string; model?: string }[];
  };

  return (data.models ?? [])
    .map((m) => {
      const id = (m.name ?? m.model ?? "").trim();
      return id ? { id, label: formatOllamaLabel(id) } : null;
    })
    .filter((m): m is ProviderModel => m !== null)
    .sort((a, b) => a.label.localeCompare(b.label));
}

export async function callOllamaChat(
  prompt: string,
  model: string,
  apiKey: string
): Promise<string> {
  const res = await fetch(`${OLLAMA_CLOUD_BASE}/v1/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      messages: [
        {
          role: "system",
          content: "You are a startup analyst. Always respond with valid JSON only.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    if (res.status === 400 && body.includes("response_format")) {
      return callOllamaNativeChat(prompt, model, apiKey);
    }
    throw new Error(`Ollama error: ${res.status} ${body.slice(0, 300)}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };

  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("Ollama returned an empty response.");
  }

  return content;
}

async function callOllamaNativeChat(
  prompt: string,
  model: string,
  apiKey: string
): Promise<string> {
  const res = await fetch(`${OLLAMA_CLOUD_BASE}/api/chat`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      stream: false,
      format: "json",
      options: { num_predict: 4096, temperature: 0.7 },
      messages: [
        {
          role: "system",
          content: "You are a startup analyst. Always respond with valid JSON only.",
        },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Ollama error: ${res.status} ${body.slice(0, 300)}`);
  }

  const data = (await res.json()) as {
    message?: { content?: string };
  };

  const content = data.message?.content?.trim();
  if (!content) {
    throw new Error("Ollama returned an empty response.");
  }

  return content;
}

function formatOllamaLabel(id: string): string {
  const base = id.split(":")[0];
  return base
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    + (id.includes("cloud") ? " (Cloud)" : "");
}
