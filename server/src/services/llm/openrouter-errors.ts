export interface ParsedOpenRouterError {
  status: number;
  message: string;
  retryable: boolean;
}

export function parseOpenRouterError(
  status: number,
  body: string
): ParsedOpenRouterError {
  let message = body;
  let retryable = status === 429 || status === 502 || status === 503;

  try {
    const parsed = JSON.parse(body) as {
      error?: {
        message?: string;
        code?: number;
        metadata?: {
          raw?: string;
          provider_name?: string;
        };
      };
    };

    const raw = parsed.error?.metadata?.raw?.trim();
    const apiMessage = parsed.error?.message?.trim();

    if (raw) {
      message = raw;
    } else if (apiMessage) {
      message = apiMessage;
    }

    if (message.includes("rate-limited") || message.includes("rate limit")) {
      retryable = true;
    }
  } catch {
    /* use raw body */
  }

  return { status, message, retryable };
}

export function formatOpenRouterErrorMessage(parsed: ParsedOpenRouterError): string {
  const { status, message } = parsed;

  if (status === 429 || message.includes("rate-limited") || message.includes("rate limit")) {
    return "This free model is temporarily rate-limited. Wait a minute and try again, or switch to “OpenRouter Free” in AI settings.";
  }
  if (status === 402 || message.includes("credit")) {
    return "Insufficient OpenRouter credits. Try a free model (marked :free).";
  }
  if (status === 401 || status === 403) {
    return "Invalid API key for OpenRouter.";
  }
  if (status === 404 || message.includes("not found")) {
    return "Model not found. Pick a different model in AI settings.";
  }

  return message.length > 220 ? message.slice(0, 220) + "…" : message;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
