import { Router } from "express";
import type { AnalysisResponse, UnderstandResponse } from "../types.js";
import type { LlmConfig } from "../llm-types.js";
import { parseLocale, t, type Locale } from "../i18n.js";
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

function formatLlmError(err: unknown, locale: Locale): string {
  const msg = err instanceof Error ? err.message : t(locale).unknownAiError;

  if (msg.startsWith("Ollama error:")) {
    if (msg.includes("401") || msg.includes("403")) {
      return t(locale).invalidOllamaKey;
    }
    if (msg.includes("429")) {
      return t(locale).ollamaRateLimit;
    }
    return msg.replace(/^Ollama error:\s*\d+\s*/, "").slice(0, 220);
  }

  if (msg.startsWith("OpenRouter error:")) {
    const match = msg.match(/^OpenRouter error:\s*(\d+)\s*(.*)$/s);
    if (match) {
      const status = Number(match[1]);
      const body = match[2]?.trim() ?? msg;
      return formatOpenRouterErrorMessage(
        parseOpenRouterError(status, body),
        locale
      );
    }
  }

  if (msg.includes("404")) return t(locale).modelNotFound;
  if (msg.includes("402")) return t(locale).insufficientCredits;
  if (msg.includes("401") || msg.includes("403")) return t(locale).invalidApiKey;
  if (msg.includes("429") || msg.includes("rate-limited") || msg.includes("rate limit")) {
    return t(locale).rateLimited;
  }

  return msg.length > 200 ? msg.slice(0, 200) + "…" : msg;
}

async function runLlmJson<T>(
  prompt: string,
  llm: LlmConfig,
  parse: (raw: string) => T,
  locale: Locale
): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const raw = await callLlm(prompt, llm, locale);
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
    const { prompt, llm: llmRaw, locale: localeRaw } = req.body as {
      prompt?: string;
      llm?: unknown;
      locale?: unknown;
    };
    const locale = parseLocale(localeRaw);

    if (!prompt?.trim()) {
      res.status(400).json({ error: t(locale).promptRequired });
      return;
    }

    const llm = validateLlmConfig(llmRaw);
    if (!llm) {
      res.status(400).json({ error: t(locale).llmRequired });
      return;
    }

    const data = await runLlmJson(
      buildUnderstandPrompt(prompt.trim(), t(locale).languageInstruction),
      llm,
      (raw) => parseJsonResponse<UnderstandResponse>(raw),
      locale
    );
    res.json(data);
  } catch (err) {
    console.error("understand-idea error:", err);
    const locale = parseLocale(req.body?.locale);
    res.status(502).json({ error: formatLlmError(err, locale) });
  }
});

router.post("/analyze-idea", async (req, res) => {
  try {
    const { prompt, correction, llm: llmRaw, locale: localeRaw } = req.body as {
      prompt?: string;
      correction?: string;
      llm?: unknown;
      locale?: unknown;
    };
    const locale = parseLocale(localeRaw);

    if (!prompt?.trim()) {
      res.status(400).json({ error: t(locale).promptRequired });
      return;
    }

    const llm = validateLlmConfig(llmRaw);
    if (!llm) {
      res.status(400).json({ error: t(locale).llmRequired });
      return;
    }

    const data = await runLlmJson(
      buildAnalyzePrompt(
        prompt.trim(),
        correction?.trim(),
        t(locale).languageInstruction
      ),
      llm,
      (raw) => parseJsonResponse<AnalysisResponse>(raw),
      locale
    );
    res.json(data);
  } catch (err) {
    console.error("analyze-idea error:", err);
    const locale = parseLocale(req.body?.locale);
    res.status(502).json({ error: formatLlmError(err, locale) });
  }
});

export default router;
