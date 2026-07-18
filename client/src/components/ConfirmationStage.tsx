import { useTranslation } from "react-i18next";
import type { UnderstandResponse } from "@/types";

interface ConfirmationStageProps {
  comprehension: UnderstandResponse;
  correction: string;
  onCorrectionChange: (value: string) => void;
  onConfirm: () => void;
  onBack: () => void;
  loading: boolean;
  error?: string | null;
}

export function ConfirmationStage({
  comprehension,
  correction,
  onCorrectionChange,
  onConfirm,
  onBack,
  loading,
  error,
}: ConfirmationStageProps) {
  const { t } = useTranslation();

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-6 py-4 sm:py-10 pb-[max(7rem,calc(env(safe-area-inset-bottom)+6rem))] sm:pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      {error && (
        <div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}
      <h2 className="font-serif-display text-2xl sm:text-4xl text-white mb-2 tracking-tight">
        {t("confirm.title")}
      </h2>
      <p className="text-white/60 mb-6 sm:mb-8 text-sm sm:text-base">
        {t("confirm.subtitle")}
      </p>

      <div className="glass-card glass-card-animate p-4 sm:p-6 space-y-4 sm:space-y-5 mb-5 sm:mb-6">
        <Block label={t("confirm.summary")} value={comprehension.summary} />
        <Block label={t("confirm.targetAudience")} value={comprehension.targetAudience} />
        <Block label={t("confirm.coreProblem")} value={comprehension.coreProblem} />
        <div>
          <p className="font-mono text-xs uppercase text-white/40 mb-2">
            {t("confirm.keyFeatures")}
          </p>
          <ul className="space-y-2">
            {comprehension.keyFeatures.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-white/85">
                <span className="font-mono text-indigo-300 shrink-0">{i + 1}.</span>
                {f}
              </li>
            ))}
          </ul>
        </div>
        <Block
          label={t("confirm.monetization")}
          value={comprehension.monetizationHypothesis}
        />
      </div>

      <div
        className="relative z-20 glass-card-emerald glass-card-animate p-4 sm:p-5 mb-6 sm:mb-8"
        style={{ animationDelay: "0.1s" }}
      >
        <label
          htmlFor="isee-refinement"
          className="font-mono text-xs uppercase text-emerald-300/70 block mb-2"
        >
          {t("confirm.refinement")}
        </label>
        <textarea
          id="isee-refinement"
          name="refinement"
          value={correction}
          onChange={(e) => onCorrectionChange(e.target.value)}
          placeholder={t("confirm.refinementPlaceholder")}
          rows={3}
          disabled={loading}
          autoComplete="off"
          className="relative z-20 w-full bg-black/30 border border-white/20 rounded-xl p-3 text-base sm:text-sm text-white placeholder:text-white/30 outline-none focus:border-emerald-400/50 focus:ring-1 focus:ring-emerald-400/30 resize-y min-h-[5rem] disabled:opacity-50"
        />
      </div>

      <div className="sticky bottom-0 z-30 pointer-events-none pb-[env(safe-area-inset-bottom)] sm:static sm:pb-0 bg-gradient-to-t from-black via-black/80 to-transparent sm:from-transparent sm:via-transparent pt-6 sm:pt-0 -mx-3 px-3 sm:mx-0 sm:px-0">
        <div className="pointer-events-auto flex flex-col-reverse sm:flex-row flex-wrap gap-3">
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="glass-btn-solid flex items-center justify-center gap-2 px-6 w-full sm:w-auto"
          >
            <span className="sm:hidden">{t("confirm.confirmShort")}</span>
            <span className="hidden sm:inline">{t("confirm.confirmLong")}</span>
          </button>
          <button
            type="button"
            onClick={onBack}
            className="glass-btn w-full sm:w-auto"
            disabled={loading}
          >
            {t("common.back")}
          </button>
        </div>
      </div>
    </div>
  );
}

function Block({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono text-xs uppercase text-white/40 mb-1">{label}</p>
      <p className="text-sm leading-relaxed text-white/85">{value}</p>
    </div>
  );
}
