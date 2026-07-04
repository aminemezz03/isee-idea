import { Router } from "express";
import type { AnalysisResponse, UnderstandResponse } from "../types.js";
import type { LlmConfig } from "../llm-types.js";
import {
  buildAnalyzePrompt,
  buildUnderstandPrompt,
  parseJsonResponse,
} from "../services/gemini.js";
import { callLlm } from "../services/llm/index.js";
import { validateLlmConfig } from "../services/llm/config.js";
import {
  formatOpenRouterErrorMessage,
  parseOpenRouterError,
} from "../services/llm/openrouter-errors.js";

const router = Router();

function formatLlmError(err: unknown): string {
  const msg = err instanceof Error ? err.message : "Unknown AI error";

  if (msg.startsWith("Ollama error:")) {
    if (msg.includes("401") || msg.includes("403")) {
      return "Invalid Ollama API key.";
    }
    if (msg.includes("429")) {
      return "Ollama rate limit reached. Wait a moment and try again.";
    }
    return msg.replace(/^Ollama error:\s*\d+\s*/, "").slice(0, 220);
  }

  if (msg.startsWith("OpenRouter error:")) {
    const match = msg.match(/^OpenRouter error:\s*(\d+)\s*(.*)$/s);
    if (match) {
      const status = Number(match[1]);
      const body = match[2]?.trim() ?? msg;
      return formatOpenRouterErrorMessage(
        parseOpenRouterError(status, body)
      );
    }
  }

  if (msg.includes("404")) return "Model not found. Pick a different model in AI settings.";
  if (msg.includes("402")) return "Insufficient OpenRouter credits. Try a free model (marked :free).";
  if (msg.includes("401") || msg.includes("403")) return "Invalid API key for the selected provider.";
  if (msg.includes("429") || msg.includes("rate-limited") || msg.includes("rate limit")) {
    return "This free model is temporarily rate-limited. Wait a minute and try again, or switch to “OpenRouter Free” in AI settings.";
  }

  return msg.length > 200 ? msg.slice(0, 200) + "…" : msg;
}

async function runLlmJson<T>(
  prompt: string,
  llm: LlmConfig,
  parse: (raw: string) => T
): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const raw = await callLlm(prompt, llm);
      return parse(raw);
    } catch (err) {
      lastErr = err;
      const msg = err instanceof Error ? err.message : "";
      if (attempt === 0 && (msg.includes("JSON") || msg.includes("Unexpected token"))) {
        continue;
      }
      throw err;
    }
  }
  throw lastErr;
}

router.post("/understand-idea", async (req, res) => {
  try {
    const { prompt, llm: llmRaw } = req.body as {
      prompt?: string;
      llm?: unknown;
    };

    if (!prompt?.trim()) {
      res.status(400).json({ error: "prompt is required" });
      return;
    }

    const llm = validateLlmConfig(llmRaw);
    if (!llm) {
      res.status(400).json({ error: "Valid llm configuration is required" });
      return;
    }

    const data = await runLlmJson(
      buildUnderstandPrompt(prompt.trim()),
      llm,
      (raw) => parseJsonResponse<UnderstandResponse>(raw)
    );
    res.json(data);
  } catch (err) {
    console.error("understand-idea error:", err);
    res.status(502).json({ error: formatLlmError(err) });
  }
});

router.post("/analyze-idea", async (req, res) => {
  try {
    const { prompt, correction, llm: llmRaw } = req.body as {
      prompt?: string;
      correction?: string;
      llm?: unknown;
    };

    if (!prompt?.trim()) {
      res.status(400).json({ error: "prompt is required" });
      return;
    }

    const llm = validateLlmConfig(llmRaw);
    if (!llm) {
      res.status(400).json({ error: "Valid llm configuration is required" });
      return;
    }

    const data = await runLlmJson(
      buildAnalyzePrompt(prompt.trim(), correction?.trim()),
      llm,
      (raw) => parseJsonResponse<AnalysisResponse>(raw)
    );
    res.json(data);
  } catch (err) {
    console.error("analyze-idea error:", err);
    res.status(502).json({ error: formatLlmError(err) });
  }
});

export default router;
