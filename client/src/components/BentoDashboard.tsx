import { Sparkles, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { AnalysisResponse } from "@/types";

interface BentoDashboardProps {
  analysis: AnalysisResponse;
  onNewScout: () => void;
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs font-mono mb-1.5 text-white/70">
        <span>{label}</span>
        <span className="text-indigo-300">{value.toFixed(1)}</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden border border-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-300 transition-all duration-1000"
          style={{ width: `${Math.min(100, value * 10)}%` }}
        />
      </div>
    </div>
  );
}

export function BentoDashboard({ analysis, onNewScout }: BentoDashboardProps) {
  const { t } = useTranslation();
  const { breakdownScores: b } = analysis;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-10 pb-[max(4rem,env(safe-area-inset-bottom))]">
      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-end sm:justify-between gap-4 mb-6 sm:mb-8">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={16} className="text-indigo-300 shrink-0 sm:w-[18px] sm:h-[18px]" />
            <span className="font-mono text-[10px] sm:text-xs uppercase text-white/40 tracking-widest">
              {t("dashboard.badge")}
            </span>
          </div>
          <h2 className="font-serif-display text-2xl sm:text-4xl md:text-5xl text-white tracking-tight">
            {t("dashboard.title")}
          </h2>
        </div>
        <button
          type="button"
          onClick={onNewScout}
          className="glass-btn flex items-center justify-center gap-2 w-full sm:w-auto shrink-0"
        >
          <RotateCcw size={16} />
          {t("dashboard.newScout")}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 auto-rows-auto">
        <div
          className="md:col-span-4 glass-card-accent glass-card-animate p-4 sm:p-6 flex flex-col justify-between min-h-[180px] sm:min-h-[220px]"
        >
          <p className="font-mono text-xs uppercase text-indigo-300/80 tracking-wider">
            {t("dashboard.overallViability")}
          </p>
          <p className="font-serif-display text-5xl sm:text-7xl md:text-8xl text-white my-2">
            {analysis.score.toFixed(1)}
          </p>
          <p className="text-sm text-white/70 leading-relaxed">
            {analysis.scoreJustification}
          </p>
        </div>

        <div
          className="md:col-span-8 glass-card glass-card-animate p-4 sm:p-6"
          style={{ animationDelay: "0.05s" }}
        >
          <h3 className="font-display font-bold text-lg text-white mb-5">
            {t("dashboard.breakdownScores")}
          </h3>
          <div className="grid sm:grid-cols-2 gap-5">
            <ScoreBar label={t("dashboard.marketPotential")} value={b.marketPotential} />
            <ScoreBar label={t("dashboard.technicalFeasibility")} value={b.technicalFeasibility} />
            <ScoreBar label={t("dashboard.automationViability")} value={b.automationViability} />
            <ScoreBar label={t("dashboard.distributionEase")} value={b.distributionEase} />
          </div>
        </div>

        <div
          className="md:col-span-6 glass-card-emerald glass-card-animate p-4 sm:p-6"
          style={{ animationDelay: "0.1s" }}
        >
          <h3 className="font-display font-bold text-lg text-white mb-4">
            {t("dashboard.marketValuation")}
          </h3>
          <div className="space-y-4 text-sm">
            <Field label={t("dashboard.marketSize")} value={analysis.marketValuation.marketSize} />
            <Field label={t("dashboard.growthRate")} value={analysis.marketValuation.growthRate} />
            <Field
              label={t("dashboard.competitorLandscape")}
              value={analysis.marketValuation.competitorLandscape}
            />
            <Field
              label={t("dashboard.financialPotential")}
              value={analysis.marketValuation.financialPotential}
            />
          </div>
        </div>

        <div
          className="md:col-span-6 glass-card-teal glass-card-animate p-4 sm:p-6"
          style={{ animationDelay: "0.15s" }}
        >
          <h3 className="font-display font-bold text-lg text-white mb-4">
            {t("dashboard.optimalDemographics")}
          </h3>
          <div className="space-y-4 text-sm">
            <div>
              <p className="font-mono text-xs uppercase text-white/40 mb-2">
                {t("dashboard.bestRegions")}
              </p>
              <div className="flex flex-wrap gap-2">
                {analysis.optimalDemographics.bestRegions.map((r) => (
                  <span
                    key={r}
                    className="glass rounded-full px-3 py-0.5 text-xs font-mono text-white/80"
                  >
                    {r}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="font-mono text-xs uppercase text-white/40 mb-2">
                {t("dashboard.bestIndustries")}
              </p>
              <div className="flex flex-wrap gap-2">
                {analysis.optimalDemographics.bestIndustries.map((ind) => (
                  <span
                    key={ind}
                    className="glass rounded-full px-3 py-0.5 text-xs font-mono text-white/80"
                  >
                    {ind}
                  </span>
                ))}
              </div>
            </div>
            <Field
              label={t("dashboard.targetPersona")}
              value={analysis.optimalDemographics.targetUserPersona}
            />
          </div>
        </div>

        <div
          className="md:col-span-7 glass-card glass-card-animate p-4 sm:p-6"
          style={{ animationDelay: "0.2s" }}
        >
          <h3 className="font-display font-bold text-lg text-white mb-4">
            {t("dashboard.budgetAutopilot")}
          </h3>
          <div className="space-y-3 text-sm mb-5">
            <Field
              label={t("dashboard.setupComplexity")}
              value={analysis.budgetAndAutomation.setupComplexity}
            />
            <Field
              label={t("dashboard.buildOnce")}
              value={analysis.budgetAndAutomation.buildOnceFeasibility}
            />
            <Field
              label={t("dashboard.monthlyOpCost")}
              value={analysis.budgetAndAutomation.operationalCostEstimate}
            />
          </div>
          <p className="font-mono text-xs uppercase text-white/40 mb-3">
            {t("dashboard.automationStrategy")}
          </p>
          <ol className="space-y-2">
            {analysis.budgetAndAutomation.automationStrategy.map((step, i) => (
              <li key={i} className="text-sm flex gap-2 text-white/80">
                <span className="font-mono text-indigo-300 shrink-0">{i + 1}.</span>
                {step}
              </li>
            ))}
          </ol>
        </div>

        <div
          className="md:col-span-5 glass-card-accent glass-card-animate p-4 sm:p-6"
          style={{ animationDelay: "0.25s" }}
        >
          <h3 className="font-display font-bold text-lg text-white mb-4">
            {t("dashboard.distributionPlaybook")}
          </h3>
          <div className="space-y-3 mb-5">
            {analysis.distributionStrategy.channels.map((ch) => (
              <div
                key={ch.name}
                className="glass rounded-xl p-3 text-sm"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 mb-1">
                  <span className="font-semibold text-white">{ch.name}</span>
                  <span className="font-mono text-[10px] text-indigo-300 whitespace-nowrap">
                    {ch.effort} · {ch.impact}
                  </span>
                </div>
                <p className="text-white/60 text-xs">{ch.description}</p>
              </div>
            ))}
          </div>
          <p className="font-mono text-xs uppercase text-indigo-300/70 mb-2">
            {t("dashboard.first100Plan")}
          </p>
          <ol className="space-y-2 text-sm">
            {analysis.distributionStrategy.first100UsersPlan.map((step, i) => (
              <li key={i} className="flex gap-2 text-white/80">
                <span className="font-mono text-indigo-300 shrink-0">{i + 1}.</span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono text-xs uppercase text-white/40 mb-0.5">{label}</p>
      <p className="text-white/85 leading-relaxed">{value}</p>
    </div>
  );
}
