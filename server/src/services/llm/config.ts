import type { LlmConfig, LlmProvider } from "../../llm-types.js";
import { getOllamaApiKey } from "./ollama.js";

export const OPENROUTER_BASE = "https://openrouter.ai/api/v1";

export const PROVIDER_LABELS: Record<LlmProvider, string> = {
  gemini: "Google Gemini",
  openai: "OpenAI",
  anthropic: "Anthropic",
  openrouter: "OpenRouter",
  ollama: "Ollama",
};

export const CUSTOM_MODELS: Record<
  LlmProvider,
  { id: string; label: string }[]
> = {
  gemini: [
    { id: "gemini-2.0-flash", label: "Gemini 2.0 Flash" },
    { id: "gemini-2.0-pro", label: "Gemini 2.0 Pro" },
    { id: "gemini-1.5-flash", label: "Gemini 1.5 Flash" },
  ],
  openai: [
    { id: "gpt-4o-mini", label: "GPT-4o Mini" },
    { id: "gpt-4o", label: "GPT-4o" },
    { id: "gpt-4-turbo", label: "GPT-4 Turbo" },
  ],
  anthropic: [
    { id: "claude-3-5-haiku-latest", label: "Claude 3.5 Haiku" },
    { id: "claude-3-5-sonnet-latest", label: "Claude 3.5 Sonnet" },
    { id: "claude-3-opus-latest", label: "Claude 3 Opus" },
  ],
  openrouter: [
    { id: "openrouter/free", label: "OpenRouter Free" },
    { id: "google/gemma-4-26b-a4b-it:free", label: "Gemma 4 26B (Free)" },
    { id: "meta-llama/llama-3.3-70b-instruct:free", label: "Llama 3.3 70B (Free)" },
  ],
  ollama: [
    { id: "gpt-oss:120b-cloud", label: "GPT-OSS 120B (Cloud)" },
    { id: "gemma4:31b-cloud", label: "Gemma 4 31B (Cloud)" },
    { id: "qwen3-coder:480b-cloud", label: "Qwen3 Coder 480B (Cloud)" },
  ],
};

interface PlatformModelDef {
  provider: LlmProvider;
  model: string;
  label: string;
  description: string;
  envKey: string;
}

const PLATFORM_MODEL_DEFS: PlatformModelDef[] = [
  {
    provider: "gemini",
    model: "gemini-2.0-flash",
    label: "Gemini 2.0 Flash",
    description: "Fast, great for idea comprehension",
    envKey: "GEMINI_API_KEY",
  },
  {
    provider: "gemini",
    model: "gemini-2.0-pro",
    label: "Gemini 2.0 Pro",
    description: "Deep reasoning for complex ideas",
    envKey: "GEMINI_API_KEY",
  },
  {
    provider: "openai",
    model: "gpt-4o-mini",
    label: "GPT-4o Mini",
    description: "Cost-efficient OpenAI model",
    envKey: "OPENAI_API_KEY",
  },
  {
    provider: "openai",
    model: "gpt-4o",
    label: "GPT-4o",
    description: "Flagship OpenAI multimodal model",
    envKey: "OPENAI_API_KEY",
  },
  {
    provider: "anthropic",
    model: "claude-3-5-haiku-latest",
    label: "Claude 3.5 Haiku",
    description: "Fast Anthropic model",
    envKey: "ANTHROPIC_API_KEY",
  },
  {
    provider: "anthropic",
    model: "claude-3-5-sonnet-latest",
    label: "Claude 3.5 Sonnet",
    description: "Balanced depth and speed",
    envKey: "ANTHROPIC_API_KEY",
  },
];

export async function getAvailablePlatformModels() {
  const staticModels = PLATFORM_MODEL_DEFS.filter((m) => !!process.env[m.envKey]).map(
    (m) => ({
      id: `${m.provider}:${m.model}`,
      provider: m.provider,
      model: m.model,
      label: m.label,
      description: m.description,
    })
  );

  const platformModels = [...staticModels];
  const ollamaFeatured: typeof staticModels = [];
  const openRouterFeatured: typeof staticModels = [];

  const ollamaKey = getOllamaApiKey();
  if (ollamaKey) {
    try {
      const { listOllamaModels, curateOllamaPlatformModels } = await import(
        "./ollama.js"
      );
      const ollamaModels = curateOllamaPlatformModels(
        await listOllamaModels(ollamaKey)
      );
      ollamaFeatured.push(
        ...ollamaModels.map((m) => ({
          id: `ollama:${m.id}`,
          provider: "ollama" as const,
          model: m.id,
          label: m.label,
          description: m.id.includes("cloud")
            ? "Powered by isee · Ollama Cloud"
            : "Powered by isee · Ollama",
        }))
      );
    } catch (err) {
      console.error("Failed to load Ollama platform models:", err);
    }
  }

  const orKey = process.env.OPENROUTER_API_KEY?.trim();
  if (orKey) {
    try {
      const { listOpenRouterModels } = await import("./list-models.js");
      const { curateOpenRouterPlatformModels } = await import("./curate-models.js");
      const orModels = curateOpenRouterPlatformModels(
        await listOpenRouterModels(orKey)
      );
      openRouterFeatured.push(
        ...orModels.map((m) => ({
          id: `openrouter:${m.id}`,
          provider: "openrouter" as const,
          model: m.id,
          label: m.label,
          description: m.id.includes(":free")
            ? "Free via isee · OpenRouter"
            : "Powered by isee · OpenRouter",
        }))
      );
    } catch (err) {
      console.error("Failed to load OpenRouter platform models:", err);
    }
  }

  return [...ollamaFeatured, ...openRouterFeatured, ...platformModels];
}

export function resolveApiKey(config: LlmConfig): string | null {
  if (config.mode === "custom") {
    return config.apiKey?.trim() || null;
  }

  const envMap: Record<LlmProvider, string | undefined> = {
    gemini: process.env.GEMINI_API_KEY,
    openai: process.env.OPENAI_API_KEY,
    anthropic: process.env.ANTHROPIC_API_KEY,
    openrouter: process.env.OPENROUTER_API_KEY,
    ollama: getOllamaApiKey(),
  };

  return envMap[config.provider]?.trim() || null;
}

export function validateLlmConfig(config: unknown): LlmConfig | null {
  if (!config || typeof config !== "object") return null;
  const c = config as Partial<LlmConfig>;
  if (c.mode !== "platform" && c.mode !== "custom") return null;
  if (!["gemini", "openai", "anthropic", "openrouter", "ollama"].includes(c.provider ?? "")) return null;
  if (!c.model?.trim()) return null;
  if (c.mode === "custom" && !c.apiKey?.trim()) return null;
  return {
    mode: c.mode,
    provider: c.provider as LlmProvider,
    model: c.model.trim(),
    apiKey: c.apiKey?.trim(),
  };
}
