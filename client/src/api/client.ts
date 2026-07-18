import i18n, { resolveLocale } from "@/i18n";
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
  if (!res.ok) throw new Error(i18n.t("errors.fetchModels"));
  return res.json();
}

export async function validateApiKey(
  provider: LlmProvider,
  apiKey: string,
  locale?: string
): Promise<ValidateApiKeyResponse> {
  const res = await fetch(apiUrl("/api/validate-api-key"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      provider,
      apiKey,
      locale: resolveLocale(locale ?? i18n.language),
    }),
  });
  return res.json();
}

export async function understandIdea(
  prompt: string,
  llm: LlmConfig,
  locale?: string
): Promise<UnderstandResponse> {
  let res: Response;
  try {
    res = await scoutFetch("/api/understand-idea", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt,
        llm,
        locale: resolveLocale(locale ?? i18n.language),
      }),
    });
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError") {
      throw new Error(i18n.t("errors.timeoutUnderstand"));
    }
    throw e;
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? i18n.t("errors.understandIdea"));
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
    throw new Error(i18n.t("errors.incompleteAnalysis"));
  }
  return data as AnalysisResponse;
}

export async function analyzeIdea(
  prompt: string,
  llm: LlmConfig,
  correction?: string,
  locale?: string
): Promise<AnalysisResponse> {
  let res: Response;
  try {
    res = await scoutFetch("/api/analyze-idea", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt,
        correction,
        llm,
        locale: resolveLocale(locale ?? i18n.language),
      }),
    });
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError") {
      throw new Error(i18n.t("errors.timeoutAnalyze"));
    }
    throw e;
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? i18n.t("errors.analyzeIdea"));
  }
  const data = await res.json();
  return assertAnalysis(data);
}
