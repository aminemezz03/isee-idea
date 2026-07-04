export type LlmProvider = "gemini" | "openai" | "anthropic" | "openrouter" | "ollama";
export type LlmMode = "platform" | "custom";

export interface LlmConfig {
  mode: LlmMode;
  provider: LlmProvider;
  model: string;
  apiKey?: string;
}

export interface PlatformModel {
  id: string;
  provider: LlmProvider;
  model: string;
  label: string;
  description: string;
}

export interface ProviderInfo {
  id: LlmProvider;
  label: string;
  models: { id: string; label: string }[];
}

export interface ModelsResponse {
  platform: PlatformModel[];
  providers: ProviderInfo[];
  platformAvailable: boolean;
}
