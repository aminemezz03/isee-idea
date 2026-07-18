import { useTranslation } from "react-i18next";
import { isLocale, type Locale } from "@/i18n";
import { GLASS } from "@/lib/theme";

interface LanguageSwitcherProps {
  className?: string;
  compact?: boolean;
}

export function LanguageSwitcher({ className = "", compact = false }: LanguageSwitcherProps) {
  const { i18n, t } = useTranslation();
  const current = (isLocale(i18n.language) ? i18n.language : "en") as Locale;

  const setLocale = (locale: Locale) => {
    void i18n.changeLanguage(locale);
  };

  return (
    <div
      role="group"
      aria-label={t("lang.switchTo")}
      className={`${GLASS} inline-flex rounded-full p-0.5 shrink-0 ${className}`}
    >
      {(["en", "fr"] as const).map((locale) => {
        const active = current === locale;
        return (
          <button
            key={locale}
            type="button"
            onClick={() => setLocale(locale)}
            aria-pressed={active}
            className={`rounded-full font-mono transition ${
              compact
                ? "px-2 py-1 text-[10px]"
                : "px-2.5 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs"
            } ${
              active
                ? "bg-white/20 text-white"
                : "text-white/55 hover:text-white/85"
            }`}
          >
            {t(`lang.${locale}`)}
          </button>
        );
      })}
    </div>
  );
}
