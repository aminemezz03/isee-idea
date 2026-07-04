import { Router } from "express";
import type { LlmProvider } from "../llm-types.js";
import { validateProviderApiKey } from "../services/llm/validate.js";

const router = Router();

router.post("/validate-api-key", async (req, res) => {
  try {
    const { provider, apiKey } = req.body as {
      provider?: LlmProvider;
      apiKey?: string;
    };

    if (!provider || !["gemini", "openai", "anthropic", "openrouter", "ollama"].includes(provider)) {
      res.status(400).json({ valid: false, message: "Invalid provider." });
      return;
    }

    if (!apiKey?.trim()) {
      res.status(400).json({ valid: false, message: "API key is required." });
      return;
    }

    const result = await validateProviderApiKey(provider, apiKey.trim());

    res.json({ ...result, provider });
  } catch (err) {
    console.error("validate-api-key error:", err);
    res.status(500).json({
      valid: false,
      message: "Could not reach the provider. Check your connection and try again.",
    });
  }
});

export default router;
