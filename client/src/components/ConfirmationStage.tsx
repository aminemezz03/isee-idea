import type { UnderstandResponse } from "@/types";

interface ConfirmationStageProps {
  comprehension: UnderstandResponse;
  correction: string;
  onCorrectionChange: (value: string) => void;
  onConfirm: () => void;
  onBack: () => void;
  loading: boolean;
}

export function ConfirmationStage({
  comprehension,
  correction,
  onCorrectionChange,
  onConfirm,
  onBack,
  loading,
}: ConfirmationStageProps) {
  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-6 py-4 sm:py-10 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <h2 className="font-serif-display text-2xl sm:text-4xl text-white mb-2 tracking-tight">
        AI Comprehension
      </h2>
      <p className="text-white/60 mb-6 sm:mb-8 text-sm sm:text-base">
        Review how we understood your idea. Confirm to run deep research, or
        refine below.
      </p>

      <div className="glass-card glass-card-animate p-4 sm:p-6 space-y-4 sm:space-y-5 mb-5 sm:mb-6">
        <Block label="Summary" value={comprehension.summary} />
        <Block label="Target Audience" value={comprehension.targetAudience} />
        <Block label="Core Problem" value={comprehension.coreProblem} />
        <div>
          <p className="font-mono text-xs uppercase text-white/40 mb-2">
            Key Features (MVP)
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
          label="Monetization Hypothesis"
          value={comprehension.monetizationHypothesis}
        />
      </div>

      <div
        className="glass-card-emerald glass-card-animate p-4 sm:p-5 mb-6 sm:mb-8"
        style={{ animationDelay: "0.1s" }}
      >
        <label className="font-mono text-xs uppercase text-emerald-300/70 block mb-2">
          Refinement (optional)
        </label>
        <textarea
          value={correction}
          onChange={(e) => onCorrectionChange(e.target.value)}
          placeholder='e.g. "Focus on European markets instead of US"'
          rows={3}
          className="w-full bg-black/20 border border-white/15 rounded-xl p-3 text-base sm:text-sm text-white placeholder:text-white/30 outline-none focus:border-indigo-400/50 focus:ring-1 focus:ring-indigo-400/30 resize-y min-h-[5rem]"
        />
      </div>

      <div className="flex flex-col-reverse sm:flex-row flex-wrap gap-3 sticky bottom-0 pb-[env(safe-area-inset-bottom)] sm:static sm:pb-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent sm:from-transparent pt-4 sm:pt-0 -mx-3 px-3 sm:mx-0 sm:px-0">
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className="glass-btn-solid flex items-center justify-center gap-2 px-6 w-full sm:w-auto"
        >
          <span className="sm:hidden">Confirm & Run Research</span>
          <span className="hidden sm:inline">Yes, Confirm & Run Deep Research</span>
        </button>
        <button
          type="button"
          onClick={onBack}
          className="glass-btn w-full sm:w-auto"
          disabled={loading}
        >
          Back
        </button>
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
