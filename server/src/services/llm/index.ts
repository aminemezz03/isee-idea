import type { LlmConfig } from "../../llm-types.js";
import { resolveApiKey } from "./config.js";
import { callLlmProvider } from "./providers.js";

export async function callLlm(
  prompt: string,
  config: LlmConfig
): Promise<string> {
  const apiKey = resolveApiKey(config);
  if (!apiKey) {
    throw new Error(
      config.mode === "custom"
        ? "API key is required for custom mode"
        : `Platform ${config.provider} is not configured on the server`
    );
  }

  return callLlmProvider(config.provider, prompt, config.model, apiKey);
}
