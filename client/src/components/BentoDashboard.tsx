import { Sparkles, RotateCcw } from "lucide-react";
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
  const { breakdownScores: b } = analysis;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-10 pb-[max(4rem,env(safe-area-inset-bottom))]">
      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-end sm:justify-between gap-4 mb-6 sm:mb-8">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={16} className="text-indigo-300 shrink-0 sm:w-[18px] sm:h-[18px]" />
            <span className="font-mono text-[10px] sm:text-xs uppercase text-white/40 tracking-widest">
              Deep research complete
            </span>
          </div>
          <h2 className="font-serif-display text-2xl sm:text-4xl md:text-5xl text-white tracking-tight">
            Analytical Dashboard
          </h2>
        </div>
        <button
          type="button"
          onClick={onNewScout}
          className="glass-btn flex items-center justify-center gap-2 w-full sm:w-auto shrink-0"
        >
          <RotateCcw size={16} />
          New Scout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 auto-rows-auto">
        {/* Score hero */}
        <div
          className="md:col-span-4 glass-card-accent glass-card-animate p-4 sm:p-6 flex flex-col justify-between min-h-[180px] sm:min-h-[220px]"
        >
          <p className="font-mono text-xs uppercase text-indigo-300/80 tracking-wider">
            Overall Viability
          </p>
          <p className="font-serif-display text-5xl sm:text-7xl md:text-8xl text-white my-2">
            {analysis.score.toFixed(1)}
          </p>
          <p className="text-sm text-white/70 leading-relaxed">
            {analysis.scoreJustification}
          </p>
        </div>

        {/* Breakdown */}
        <div
          className="md:col-span-8 glass-card glass-card-animate p-4 sm:p-6"
          style={{ animationDelay: "0.05s" }}
        >
          <h3 className="font-display font-bold text-lg text-white mb-5">
            Breakdown Scores
          </h3>
          <div className="grid sm:grid-cols-2 gap-5">
            <ScoreBar label="Market Potential" value={b.marketPotential} />
            <ScoreBar label="Technical Feasibility" value={b.technicalFeasibility} />
            <ScoreBar label="Automation Viability" value={b.automationViability} />
            <ScoreBar label="Distribution Ease" value={b.distributionEase} />
          </div>
        </div>

        {/* Market valuation */}
        <div
          className="md:col-span-6 glass-card-emerald glass-card-animate p-4 sm:p-6"
          style={{ animationDelay: "0.1s" }}
        >
          <h3 className="font-display font-bold text-lg text-white mb-4">
            Market Valuation
          </h3>
          <div className="space-y-4 text-sm">
            <Field label="Market Size" value={analysis.marketValuation.marketSize} />
            <Field label="Growth Rate" value={analysis.marketValuation.growthRate} />
            <Field
              label="Competitor Landscape"
              value={analysis.marketValuation.competitorLandscape}
            />
            <Field
              label="Financial Potential"
              value={analysis.marketValuation.financialPotential}
            />
          </div>
        </div>

        {/* Demographics */}
        <div
          className="md:col-span-6 glass-card-teal glass-card-animate p-4 sm:p-6"
          style={{ animationDelay: "0.15s" }}
        >
          <h3 className="font-display font-bold text-lg text-white mb-4">
            Optimal Demographics
          </h3>
          <div className="space-y-4 text-sm">
            <div>
              <p className="font-mono text-xs uppercase text-white/40 mb-2">
                Best Regions
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
                Best Industries
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
              label="Target Persona"
              value={analysis.optimalDemographics.targetUserPersona}
            />
          </div>
        </div>

        {/* Budget & Automation */}
        <div
          className="md:col-span-7 glass-card glass-card-animate p-4 sm:p-6"
          style={{ animationDelay: "0.2s" }}
        >
          <h3 className="font-display font-bold text-lg text-white mb-4">
            Budget & Autopilot Strategy
          </h3>
          <div className="space-y-3 text-sm mb-5">
            <Field
              label="Setup Complexity"
              value={analysis.budgetAndAutomation.setupComplexity}
            />
            <Field
              label="Build-Once Feasibility"
              value={analysis.budgetAndAutomation.buildOnceFeasibility}
            />
            <Field
              label="Monthly Op Cost"
              value={analysis.budgetAndAutomation.operationalCostEstimate}
            />
          </div>
          <p className="font-mono text-xs uppercase text-white/40 mb-3">
            Automation Strategy
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

        {/* Distribution */}
        <div
          className="md:col-span-5 glass-card-accent glass-card-animate p-4 sm:p-6"
          style={{ animationDelay: "0.25s" }}
        >
          <h3 className="font-display font-bold text-lg text-white mb-4">
            Distribution Playbook
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
            First 100 Users Plan
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
