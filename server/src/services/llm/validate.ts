import type { LlmProvider } from "../../llm-types.js";
import { listProviderModels, type ProviderModel } from "./list-models.js";

export interface ValidateResult {
  valid: boolean;
  message: string;
  models?: ProviderModel[];
}

export async function validateProviderApiKey(
  provider: LlmProvider,
  apiKey: string
): Promise<ValidateResult> {
  try {
    const models = await listProviderModels(provider, apiKey);

    if (models.length === 0) {
      return {
        valid: false,
        message: "API key accepted but no models were returned for this provider.",
      };
    }

    const providerName =
      provider === "gemini"
        ? "Gemini"
        : provider === "openai"
          ? "OpenAI"
          : provider === "anthropic"
            ? "Anthropic"
            : provider === "ollama"
              ? "Ollama"
              : "OpenRouter";

    return {
      valid: true,
      message: `${providerName} API key is valid. ${models.length} models available.`,
      models,
    };
  } catch (err) {
    return {
      valid: false,
      message: err instanceof Error ? err.message : "API key validation failed.",
    };
  }
}
