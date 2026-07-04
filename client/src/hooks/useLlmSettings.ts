import { useCallback, useEffect, useRef, useState } from "react";
import { fetchModels, validateApiKey } from "@/api/client";
import type {
  ApiKeyValidationStatus,
  LlmConfig,
  LlmMode,
  LlmProvider,
  ModelsResponse,
} from "@/types";

const SETTINGS_KEY = "isee-llm-settings";

const DEFAULT_CONFIG: LlmConfig = {
  mode: "platform",
  provider: "openrouter",
  model: "openrouter/free",
};

function loadSettings(): LlmConfig {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
  return DEFAULT_CONFIG;
}

export function useLlmSettings() {
  const [config, setConfigState] = useState<LlmConfig>(loadSettings);
  const [models, setModels] = useState<ModelsResponse | null>(null);
  const [modelsLoading, setModelsLoading] = useState(true);
  const [availableCustomModels, setAvailableCustomModels] = useState<
    { id: string; label: string }[]
  >([]);
  const [apiKeyStatus, setApiKeyStatus] =
    useState<ApiKeyValidationStatus>("idle");
  const [apiKeyMessage, setApiKeyMessage] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetchModels()
      .then((data: ModelsResponse) => {
        setModels(data);
        if (data.platformAvailable && data.platform.length > 0) {
          setConfigState((prev) => {
            if (prev.mode !== "platform") return prev;
            const match = data.platform.find(
              (p) => p.provider === prev.provider && p.model === prev.model
            );
            if (match) {
              if (
                prev.provider === "openrouter" &&
                prev.model.includes("gemma") &&
                prev.model.includes(":free")
              ) {
                const fallback = data.platform.find(
                  (p) => p.model === "openrouter/free"
                );
                if (fallback) {
                  const next = {
                    mode: "platform" as const,
                    provider: fallback.provider,
                    model: fallback.model,
                  };
                  localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
                  return next;
                }
              }
              return prev;
            }
            const preferred =
              data.platform.find((p) => p.provider === "ollama") ??
              data.platform.find((p) => p.model === "openrouter/free") ??
              data.platform[0];
            const next = {
              mode: "platform" as const,
              provider: preferred.provider,
              model: preferred.model,
            };
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
            return next;
          });
        } else {
          setConfigState((prev) =>
            prev.mode === "platform"
              ? { ...prev, mode: "custom", apiKey: prev.apiKey ?? "" }
              : prev
          );
        }
      })
      .catch(() => {
        setModels(null);
        setApiKeyMessage(
          import.meta.env.PROD
            ? "Could not load isee models. Redeploy Netlify after setting VITE_API_URL, or check Render is running."
            : "Could not load models. Is the server running?"
        );
      })
      .finally(() => setModelsLoading(false));
  }, []);

  const persist = useCallback((next: LlmConfig) => {
    setConfigState(next);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  }, []);

  const resetValidation = useCallback(() => {
    setApiKeyStatus("idle");
    setApiKeyMessage("");
    setAvailableCustomModels([]);
  }, []);

  const checkApiKey = useCallback(
    async (override?: Pick<LlmConfig, "provider" | "apiKey">) => {
      const provider = override?.provider ?? config.provider;
      const key = (override?.apiKey ?? config.apiKey)?.trim();

      if (!key) {
        setApiKeyStatus("invalid");
        setApiKeyMessage("Enter an API key to verify.");
        setAvailableCustomModels([]);
        return false;
      }

      setApiKeyStatus("checking");
      setApiKeyMessage("Verifying your API key…");
      setAvailableCustomModels([]);

      try {
        const result = await validateApiKey(provider, key);

        if (result.valid && result.models?.length) {
          setAvailableCustomModels(result.models);
          setApiKeyStatus("valid");
          setApiKeyMessage(result.message);

          const currentValid = result.models.some((m) => m.id === config.model);
          const pick = currentValid
            ? config.model
            : result.models[0].id;

          if (!currentValid) {
            persist({ ...config, provider, apiKey: key, model: pick });
          }

          return true;
        }

        setApiKeyStatus("invalid");
        setApiKeyMessage(result.message);
        setAvailableCustomModels([]);
        return false;
      } catch {
        setApiKeyStatus("invalid");
        setApiKeyMessage("Could not verify key. Is the server running?");
        setAvailableCustomModels([]);
        return false;
      }
    },
    [config, persist]
  );

  const setMode = useCallback(
    (mode: LlmMode) => {
      resetValidation();
      if (mode === "platform" && models?.platform.length) {
        const first = models.platform[0];
        persist({
          mode: "platform",
          provider: first.provider,
          model: first.model,
        });
      } else {
        const provider = config.provider ?? "gemini";
        const providerModels =
          models?.providers.find((p) => p.id === provider)?.models ?? [];
        persist({
          mode: "custom",
          provider,
          model: providerModels[0]?.id ?? "gemini-2.0-flash",
          apiKey: config.apiKey ?? "",
        });
      }
    },
    [config, models, persist, resetValidation]
  );

  const setProvider = useCallback(
    (provider: LlmProvider) => {
      resetValidation();
      const providerModels =
        models?.providers.find((p) => p.id === provider)?.models ?? [];
      persist({
        ...config,
        provider,
        model: providerModels[0]?.id ?? config.model,
      });
    },
    [config, models, persist, resetValidation]
  );

  const selectCustomModel = useCallback(
    (modelId: string) => {
      persist({ ...config, model: modelId });
    },
    [config, persist]
  );

  const setApiKey = useCallback(
    (apiKey: string) => {
      resetValidation();
      persist({ ...config, apiKey });
    },
    [config, persist, resetValidation]
  );

  const selectPlatformModel = useCallback(
    (platformModelId: string) => {
      resetValidation();
      const found = models?.platform.find((m) => m.id === platformModelId);
      if (!found) return;
      persist({
        mode: "platform",
        provider: found.provider,
        model: found.model,
      });
    },
    [models, persist, resetValidation]
  );

  const getModelLabel = useCallback(() => {
    if (config.mode === "platform") {
      return (
        models?.platform.find(
          (m) => m.provider === config.provider && m.model === config.model
        )?.label ?? config.model
      );
    }
    return (
      availableCustomModels.find((m) => m.id === config.model)?.label ??
      models?.providers
        .find((p) => p.id === config.provider)
        ?.models.find((m) => m.id === config.model)?.label ??
      config.model
    );
  }, [config, models, availableCustomModels]);

  useEffect(() => {
    if (config.mode !== "custom") return;
    const key = config.apiKey?.trim();
    if (!key || key.length < 8) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      checkApiKey();
    }, 900);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [config.mode, config.apiKey, config.provider, checkApiKey]);

  return {
    config,
    models,
    modelsLoading,
    availableCustomModels,
    apiKeyStatus,
    apiKeyMessage,
    setMode,
    setProvider,
    selectCustomModel,
    setApiKey,
    selectPlatformModel,
    getModelLabel,
    checkApiKey,
  };
}
