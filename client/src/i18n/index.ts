import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import fr from "./locales/fr.json";

export const LOCALES = ["en", "fr"] as const;
export type Locale = (typeof LOCALES)[number];

const STORAGE_KEY = "isee-locale";

export function isLocale(value: unknown): value is Locale {
  return value === "en" || value === "fr";
}

/** Always returns a clean `en` | `fr` (handles fr-FR, en-US, etc.). */
export function resolveLocale(lng?: string | null): Locale {
  const raw = (lng ?? i18n.language ?? i18n.resolvedLanguage ?? "en").toLowerCase();
  if (raw.startsWith("fr")) return "fr";
  return "en";
}

export function detectLocale(): Locale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (isLocale(stored)) return stored;
  } catch {
    /* ignore */
  }
  if (typeof navigator !== "undefined" && navigator.language.toLowerCase().startsWith("fr")) {
    return "fr";
  }
  return "en";
}

export function persistLocale(locale: Locale) {
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    /* ignore */
  }
  document.documentElement.lang = locale;
  document.title = locale === "fr" ? fr.meta.title : en.meta.title;
}

const initialLocale = detectLocale();

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fr: { translation: fr },
  },
  lng: initialLocale,
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

persistLocale(initialLocale);

i18n.on("languageChanged", (lng) => {
  persistLocale(resolveLocale(lng));
});

export default i18n;
