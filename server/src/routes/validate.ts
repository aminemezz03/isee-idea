import { Router } from "express";
import { parseLocale, t } from "../i18n.js";
import type { LlmProvider } from "../llm-types.js";
import { validateProviderApiKey } from "../services/llm/validate.js";

const router = Router();

router.post("/validate-api-key", async (req, res) => {
  try {
    const { provider, apiKey, locale: localeRaw } = req.body as {
      provider?: LlmProvider;
      apiKey?: string;
      locale?: unknown;
    };
    const locale = parseLocale(localeRaw);

    if (!provider || !["gemini", "openai", "anthropic", "openrouter", "ollama"].includes(provider)) {
      res.status(400).json({ valid: false, message: t(locale).invalidProvider });
      return;
    }

    if (!apiKey?.trim()) {
      res.status(400).json({ valid: false, message: t(locale).apiKeyRequired });
      return;
    }

    const result = await validateProviderApiKey(provider, apiKey.trim(), locale);

    res.json({ ...result, provider });
  } catch (err) {
    console.error("validate-api-key error:", err);
    const locale = parseLocale(req.body?.locale);
    res.status(500).json({
      valid: false,
      message: t(locale).providerUnreachable,
    });
  }
});

export default router;
