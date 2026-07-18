import { useEffect, useState } from "react";
import { Globe, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { StatusLine } from "@/components/StatusLine";
import { TextShimmer } from "@/components/ui/shimmer-text";

export type LoadingPhase = "understand" | "analyze";

interface LoadingScreenProps {
  visible: boolean;
  phase: LoadingPhase;
}

export function LoadingScreen({ visible, phase }: LoadingScreenProps) {
  const { t } = useTranslation();
  const [stepIndex, setStepIndex] = useState(0);

  const config =
    phase === "understand"
      ? {
          title: t("loading.understandTitle"),
          steps: [
            t("loading.understandStep1"),
            t("loading.understandStep2"),
            t("loading.understandStep3"),
            t("loading.understandStep4"),
          ],
        }
      : {
          title: t("loading.analyzeTitle"),
          steps: [
            t("loading.analyzeStep1"),
            t("loading.analyzeStep2"),
            t("loading.analyzeStep3"),
            t("loading.analyzeStep4"),
          ],
        };

  useEffect(() => {
    if (!visible) {
      setStepIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setStepIndex((i) => (i + 1) % config.steps.length);
    }, 2200);
    return () => clearInterval(interval);
  }, [visible, config.steps.length]);

  if (!visible) return null;

  return (
    <div className="loading-overlay fixed inset-0 z-[100] flex items-center justify-center dark">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-xl" />

      <div className="relative flex flex-col items-center text-center px-4 sm:px-6 max-w-md pb-[env(safe-area-inset-bottom)]">
        <div className="loading-orb relative mb-10 h-32 w-32">
          <div className="loading-ring loading-ring-1 absolute inset-0 rounded-full border border-white/20" />
          <div className="loading-ring loading-ring-2 absolute inset-2 rounded-full border border-white/30" />
          <div className="loading-ring loading-ring-3 absolute inset-5 rounded-full border border-indigo-400/50" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="glass-orb-center flex h-16 w-16 items-center justify-center rounded-full bg-white/10 backdrop-blur-xl border border-white/30">
              <Globe size={28} className="text-white loading-icon-pulse" />
            </div>
          </div>
          <Sparkles
            size={16}
            className="absolute -top-1 right-4 text-white/60 loading-sparkle"
          />
          <Sparkles
            size={12}
            className="absolute bottom-2 -left-1 text-indigo-300/80 loading-sparkle-delay"
          />
        </div>

        <TextShimmer
          as="h2"
          className="font-serif-display text-2xl sm:text-3xl tracking-tight mb-3"
          duration={3}
        >
          {config.title}
        </TextShimmer>

        <div key={stepIndex} className="loading-step-text mb-8 min-h-[1.5rem]">
          <StatusLine message={config.steps[stepIndex]} />
        </div>

        <div className="w-48 h-1 rounded-full bg-white/10 overflow-hidden border border-white/10">
          <div className="loading-progress-bar h-full rounded-full bg-gradient-to-r from-indigo-500 via-white/80 to-indigo-400" />
        </div>

        <p className="mt-6 text-white/40 text-xs font-mono uppercase tracking-widest">
          {t("loading.footer")}
        </p>
      </div>
    </div>
  );
}
