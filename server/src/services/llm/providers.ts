import type { LlmProvider } from "../../llm-types.js";

async function callGemini(
  prompt: string,
  model: string,
  apiKey: string
): Promise<string> {
  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(apiKey);
  const generativeModel = genAI.getGenerativeModel({
    model,
    generationConfig: { responseMimeType: "application/json" },
  });
  const result = await generativeModel.generateContent(prompt);
  return result.response.text();
}

async function callOpenAI(
  prompt: string,
  model: string,
  apiKey: string
): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content: "You are a startup analyst. Always respond with valid JSON only.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI error: ${res.status} ${err}`);
  }

  const data = (await res.json()) as {
    choices: { message: { content: string } }[];
  };
  return data.choices[0]?.message?.content ?? "";
}

async function callAnthropic(
  prompt: string,
  model: string,
  apiKey: string
): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: 8192,
      system:
        "You are a startup analyst. Always respond with valid JSON only, no markdown fences.",
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic error: ${res.status} ${err}`);
  }

  const data = (await res.json()) as {
    content: { type: string; text: string }[];
  };
  const block = data.content.find((c) => c.type === "text");
  return block?.text ?? "";
}

const OPENROUTER_FALLBACK_MODEL = "openrouter/free";

async function callOpenRouterOnce(
  prompt: string,
  model: string,
  apiKey: string
): Promise<{ ok: true; content: string } | { ok: false; status: number; body: string }> {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://isee.app",
      "X-Title": "isee v1",
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      messages: [
        {
          role: "system",
          content: "You are a startup analyst. Always respond with valid JSON only.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    return { ok: false, status: res.status, body: await res.text() };
  }

  const data = (await res.json()) as {
    choices: { message: { content: string } }[];
  };
  return { ok: true, content: data.choices[0]?.message?.content ?? "" };
}

async function callOpenRouter(
  prompt: string,
  model: string,
  apiKey: string
): Promise<string> {
  const { parseOpenRouterError, sleep } = await import("./openrouter-errors.js");

  const modelsToTry =
    model !== OPENROUTER_FALLBACK_MODEL
      ? [model, OPENROUTER_FALLBACK_MODEL]
      : [model];

  let lastError: { status: number; body: string } | null = null;

  for (const currentModel of modelsToTry) {
    for (let attempt = 0; attempt < 3; attempt++) {
      const result = await callOpenRouterOnce(prompt, currentModel, apiKey);

      if (result.ok) {
        if (currentModel !== model) {
          console.warn(
            `OpenRouter: fell back from ${model} to ${currentModel}`
          );
        }
        return result.content;
      }

      lastError = { status: result.status, body: result.body };
      const parsed = parseOpenRouterError(result.status, result.body);

      if (!parsed.retryable || attempt === 2) break;

      await sleep(1000 * 2 ** attempt);
    }
  }

  const parsed = parseOpenRouterError(
    lastError?.status ?? 502,
    lastError?.body ?? "Unknown OpenRouter error"
  );
  throw new Error(`OpenRouter error: ${parsed.status} ${parsed.message}`);
}

export async function callLlmProvider(
  provider: LlmProvider,
  prompt: string,
  model: string,
  apiKey: string
): Promise<string> {
  switch (provider) {
    case "gemini":
      return callGemini(prompt, model, apiKey);
    case "openai":
      return callOpenAI(prompt, model, apiKey);
    case "anthropic":
      return callAnthropic(prompt, model, apiKey);
    case "openrouter":
      return callOpenRouter(prompt, model, apiKey);
    case "ollama": {
      const { callOllamaChat } = await import("./ollama.js");
      return callOllamaChat(prompt, model, apiKey);
    }
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}
