import type { LlmProvider } from "../../llm-types.js";
import { parseLocale, t, type Locale } from "../../i18n.js";
import { listProviderModels, type ProviderModel } from "./list-models.js";

export interface ValidateResult {
  valid: boolean;
  message: string;
  models?: ProviderModel[];
}

export async function validateProviderApiKey(
  provider: LlmProvider,
  apiKey: string,
  localeRaw: Locale | string = "en"
): Promise<ValidateResult> {
  const locale = parseLocale(localeRaw);
  try {
    const models = await listProviderModels(provider, apiKey);

    if (models.length === 0) {
      return {
        valid: false,
        message: t(locale).noModelsReturned,
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
      message: t(locale).keyValid(providerName, models.length),
      models,
    };
  } catch (err) {
    return {
      valid: false,
      message: err instanceof Error ? err.message : t(locale).validationFailed,
    };
  }
}
