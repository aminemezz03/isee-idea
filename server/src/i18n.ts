export type Locale = "en" | "fr";

export function parseLocale(value: unknown): Locale {
  if (typeof value === "string" && value.toLowerCase().startsWith("fr")) {
    return "fr";
  }
  return "en";
}

const messages = {
  en: {
    promptRequired: "prompt is required",
    llmRequired: "Valid llm configuration is required",
    unknownAiError: "Unknown AI error",
    invalidOllamaKey: "Invalid Ollama API key.",
    ollamaRateLimit: "Ollama rate limit reached. Wait a moment and try again.",
    modelNotFound: "Model not found. Pick a different model in AI settings.",
    insufficientCredits:
      "Insufficient OpenRouter credits. Try a free model (marked :free).",
    invalidApiKey: "Invalid API key for the selected provider.",
    rateLimited:
      "This free model is temporarily rate-limited. Wait a minute and try again, or switch to “OpenRouter Free” in AI settings.",
    invalidOpenRouterKey: "Invalid API key for OpenRouter.",
    invalidProvider: "Invalid provider.",
    apiKeyRequired: "API key is required.",
    providerUnreachable:
      "Could not reach the provider. Check your connection and try again.",
    noModelsReturned:
      "API key accepted but no models were returned for this provider.",
    keyValid: (provider: string, count: number) =>
      `${provider} API key is valid. ${count} models available.`,
    validationFailed: "API key validation failed.",
    languageName: "English",
    languageInstruction: `OUTPUT LANGUAGE: English (en).
Every human-readable string value in the JSON MUST be written in English.
This includes summary, descriptions, lists, plans, region/industry names, channel names, effort/impact labels, and justifications.
JSON keys stay in English. Numbers stay numeric. Do not mix languages.`,
  },
  fr: {
    promptRequired: "le prompt est requis",
    llmRequired: "Une configuration llm valide est requise",
    unknownAiError: "Erreur IA inconnue",
    invalidOllamaKey: "Clé API Ollama invalide.",
    ollamaRateLimit:
      "Limite de débit Ollama atteinte. Attendez un instant et réessayez.",
    modelNotFound:
      "Modèle introuvable. Choisissez un autre modèle dans les paramètres IA.",
    insufficientCredits:
      "Crédits OpenRouter insuffisants. Essayez un modèle gratuit (marqué :free).",
    invalidApiKey: "Clé API invalide pour le fournisseur sélectionné.",
    rateLimited:
      "Ce modèle gratuit est temporairement limité. Attendez une minute et réessayez, ou passez à « OpenRouter Free » dans les paramètres IA.",
    invalidOpenRouterKey: "Clé API OpenRouter invalide.",
    invalidProvider: "Fournisseur invalide.",
    apiKeyRequired: "La clé API est requise.",
    providerUnreachable:
      "Impossible de joindre le fournisseur. Vérifiez votre connexion et réessayez.",
    noModelsReturned:
      "Clé API acceptée mais aucun modèle n'a été renvoyé pour ce fournisseur.",
    keyValid: (provider: string, count: number) =>
      `Clé API ${provider} valide. ${count} modèles disponibles.`,
    validationFailed: "Échec de la validation de la clé API.",
    languageName: "French",
    languageInstruction: `LANGUE DE SORTIE : français (fr).
Toutes les valeurs texte lisibles par un humain dans le JSON DOIVENT être rédigées en français.
Cela inclut le résumé, les descriptions, les listes, les plans, les noms de régions/secteurs, les noms de canaux, les libellés effort/impact, et les justifications.
Les clés JSON restent en anglais. Les nombres restent numériques. Ne mélange pas les langues.`,
  },
} as const;

export function systemPromptForLocale(locale: Locale): string {
  const lang = t(locale).languageName;
  return `You are a startup analyst. Always respond with valid JSON only, no markdown fences. All human-readable string values in the JSON must be written in ${lang}. JSON keys remain in English.`;
}

export function t(locale: Locale) {
  return messages[locale];
}
