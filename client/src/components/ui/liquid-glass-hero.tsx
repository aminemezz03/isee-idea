import { useEffect, useRef, useState, type ReactNode } from "react";
import { Globe, Camera, Share2, ArrowRight } from "lucide-react";
import { GLASS, VIDEO_URL } from "@/lib/theme";

const FADE_DURATION = 500;
const FADE_OUT_BEFORE_END = 0.55;

interface LiquidGlassHeroProps {
  onSubmitIdea: (idea: string) => void;
  loading?: boolean;
  llmSettings?: ReactNode;
}

const LiquidGlassHero = ({ onSubmitIdea, loading = false, llmSettings }: LiquidGlassHeroProps) => {
  const [idea, setIdea] = useState("");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const fadingOutRef = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const cancelRaf = () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };

    const animateOpacity = (target: number, duration: number) => {
      cancelRaf();
      const start = performance.now();
      const from = parseFloat(video.style.opacity || "0");

      const step = (now: number) => {
        const elapsed = now - start;
        const t = Math.min(1, elapsed / duration);
        video.style.opacity = String(from + (target - from) * t);
        if (t < 1) rafRef.current = requestAnimationFrame(step);
        else rafRef.current = null;
      };

      rafRef.current = requestAnimationFrame(step);
    };

    const fadeIn = () => {
      fadingOutRef.current = false;
      animateOpacity(1, FADE_DURATION);
    };

    const handleLoaded = () => {
      video.style.opacity = "0";
      video.play().catch(() => {});
      fadeIn();
    };

    const handleTimeUpdate = () => {
      if (fadingOutRef.current) return;
      const remaining = video.duration - video.currentTime;
      if (!isNaN(remaining) && remaining <= FADE_OUT_BEFORE_END) {
        fadingOutRef.current = true;
        animateOpacity(0, FADE_DURATION);
      }
    };

    const handleEnded = () => {
      cancelRaf();
      video.style.opacity = "0";
      setTimeout(() => {
        video.currentTime = 0;
        video.play().catch(() => {});
        fadeIn();
      }, 100);
    };

    video.style.opacity = "0";
    video.addEventListener("loadeddata", handleLoaded);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);
    if (video.readyState >= 2) handleLoaded();

    return () => {
      cancelRaf();
      video.removeEventListener("loadeddata", handleLoaded);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = idea.trim();
    if (!trimmed || loading) return;
    onSubmitIdea(trimmed);
  };

  return (
    <div className="relative w-full min-h-[100dvh] bg-black overflow-hidden flex flex-col">
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        src={VIDEO_URL}
        autoPlay
        muted
        playsInline
        loop={false}
        style={{ opacity: 0 }}
      />
      <div className="absolute inset-0 bg-black/50" />

      <nav className="relative z-20 px-4 sm:px-6 md:px-10 py-4 sm:py-6 w-full pt-[max(1rem,env(safe-area-inset-top))]">
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-white font-semibold text-base sm:text-lg shrink-0">
            <Globe size={20} className="sm:w-[22px] sm:h-[22px]" />
            <span>isee</span>
            <span className="text-white/50 text-xs sm:text-sm font-mono">.v1</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {["Scout", "Research", "Autopilot"].map((l) => (
              <span key={l} className="text-white/80 text-sm font-medium">
                {l}
              </span>
            ))}
          </div>
          <div className={`${GLASS} hidden sm:inline-flex rounded-full px-3 sm:px-4 py-1.5 text-white/90 text-[10px] sm:text-xs font-mono shrink-0`}>
            scouter active
          </div>
        </div>
      </nav>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 text-center pb-4">
        <h1 className="relative z-0 font-serif-display text-white mb-5 sm:mb-6 tracking-tight leading-[1.1] text-[clamp(1.75rem,6vw,4.5rem)] pointer-events-none select-none px-2">
          Built for the curious
        </h1>

        <div className="relative z-20 w-full max-w-xl space-y-3 sm:space-y-4 overflow-visible">
          <form
            onSubmit={handleSubmit}
            className={`${GLASS} relative z-20 overflow-visible rounded-2xl sm:rounded-full px-3 sm:pl-4 sm:pr-2 py-2.5 sm:py-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-1.5`}
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <input
                type="text"
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="Enter your idea"
                disabled={loading}
                className="flex-1 min-w-0 bg-transparent outline-none border-none text-white placeholder:text-white/50 text-base sm:text-base disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={loading || !idea.trim()}
                aria-label="Submit idea"
                className="glass-btn-solid p-2.5 sm:p-3 shrink-0 sm:hidden disabled:opacity-50 disabled:hover:scale-100"
              >
                <ArrowRight size={18} />
              </button>
            </div>
            <div className="flex items-center gap-1.5 justify-between sm:justify-end shrink-0 border-t border-white/10 sm:border-0 pt-2 sm:pt-0">
              {llmSettings}
              <button
                type="submit"
                disabled={loading || !idea.trim()}
                aria-label="Submit idea"
                className="glass-btn-solid p-2.5 sm:p-3 shrink-0 hidden sm:flex disabled:opacity-50 disabled:hover:scale-100"
              >
                <ArrowRight size={18} />
              </button>
            </div>
          </form>

          <p className="text-white/70 text-sm sm:text-base leading-relaxed px-1 sm:px-2">
            Describe your raw project idea. Our AI will comprehend it, confirm with
            you, then run deep market research and autopilot strategy.
          </p>
        </div>
      </div>

      <div className="relative z-10 hidden sm:flex justify-center gap-3 sm:gap-4 pb-[max(2.5rem,env(safe-area-inset-bottom))] sm:pb-12">
        {[Camera, Share2, Globe].map((Icon, i) => (
          <button
            key={i}
            type="button"
            className={`${GLASS} rounded-full p-3 sm:p-4 text-white hover:bg-white/15 transition`}
          >
            <Icon size={18} />
          </button>
        ))}
      </div>
    </div>
  );
};

export { LiquidGlassHero };
