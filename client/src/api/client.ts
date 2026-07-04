import type {
  AnalysisResponse,
  LlmConfig,
  LlmProvider,
  ModelsResponse,
  UnderstandResponse,
  ValidateApiKeyResponse,
} from "@/types";

export async function fetchModels(): Promise<ModelsResponse> {
  const res = await fetch("/api/models");
  if (!res.ok) throw new Error("Failed to fetch models");
  return res.json();
}

export async function validateApiKey(
  provider: LlmProvider,
  apiKey: string
): Promise<ValidateApiKeyResponse> {
  const res = await fetch("/api/validate-api-key", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ provider, apiKey }),
  });
  return res.json();
}

export async function understandIdea(
  prompt: string,
  llm: LlmConfig
): Promise<UnderstandResponse> {
  const res = await fetch("/api/understand-idea", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, llm }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Failed to understand idea");
  }
  return res.json();
}

export async function analyzeIdea(
  prompt: string,
  llm: LlmConfig,
  correction?: string
): Promise<AnalysisResponse> {
  const res = await fetch("/api/analyze-idea", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, correction, llm }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Failed to analyze idea");
  }
  return res.json();
}
