import { apiUrl, scoutFetch } from "@/lib/api-base";
import type {
  AnalysisResponse,
  LlmConfig,
  LlmProvider,
  ModelsResponse,
  UnderstandResponse,
  ValidateApiKeyResponse,
} from "@/types";

export async function fetchModels(): Promise<ModelsResponse> {
  const res = await fetch(apiUrl("/api/models"));
  if (!res.ok) throw new Error("Failed to fetch models");
  return res.json();
}

export async function validateApiKey(
  provider: LlmProvider,
  apiKey: string
): Promise<ValidateApiKeyResponse> {
  const res = await fetch(apiUrl("/api/validate-api-key"), {
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
  let res: Response;
  try {
    res = await scoutFetch("/api/understand-idea", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, llm }),
    });
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError") {
      throw new Error("Request timed out. Render may be waking up — try again in a minute.");
    }
    throw e;
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Failed to understand idea");
  }
  return res.json();
}

function assertAnalysis(data: unknown): AnalysisResponse {
  if (
    !data ||
    typeof data !== "object" ||
    typeof (data as AnalysisResponse).score !== "number" ||
    !(data as AnalysisResponse).breakdownScores
  ) {
    throw new Error("AI returned an incomplete analysis. Please try again.");
  }
  return data as AnalysisResponse;
}

export async function analyzeIdea(
  prompt: string,
  llm: LlmConfig,
  correction?: string
): Promise<AnalysisResponse> {
  let res: Response;
  try {
    res = await scoutFetch("/api/analyze-idea", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, correction, llm }),
    });
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError") {
      throw new Error(
        "Deep research timed out. The server may still be waking up — wait 30s and try again."
      );
    }
    throw e;
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Failed to analyze idea");
  }
  const data = await res.json();
  return assertAnalysis(data);
}
