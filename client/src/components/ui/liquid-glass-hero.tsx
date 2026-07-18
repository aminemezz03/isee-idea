import { useEffect, useRef, useState, type ReactNode } from "react";
import { Globe, Camera, Share2, ArrowRight, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { resolveLocale, type Locale } from "@/i18n";
import { GLASS, VIDEO_URL } from "@/lib/theme";

const FADE_DURATION = 500;
const FADE_OUT_BEFORE_END = 0.55;
const TEXTAREA_MAX_HEIGHT = 200;

interface LiquidGlassHeroProps {
  onSubmitIdea: (idea: string) => void;
  loading?: boolean;
  llmSettings?: ReactNode;
}

interface AttachedImage {
  name: string;
  previewUrl: string;
}

const LiquidGlassHero = ({ onSubmitIdea, loading = false, llmSettings }: LiquidGlassHeroProps) => {
  const { t, i18n } = useTranslation();
  const [idea, setIdea] = useState("");
  const [attachedImage, setAttachedImage] = useState<AttachedImage | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const fadingOutRef = useRef(false);

  const resizeTextarea = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const next = Math.min(el.scrollHeight, TEXTAREA_MAX_HEIGHT);
    el.style.height = `${next}px`;
    el.style.overflowY = el.scrollHeight > TEXTAREA_MAX_HEIGHT ? "auto" : "hidden";
  };

  useEffect(() => {
    resizeTextarea();
  }, [idea]);

  useEffect(() => {
    return () => {
      if (attachedImage?.previewUrl) {
        URL.revokeObjectURL(attachedImage.previewUrl);
      }
    };
  }, [attachedImage]);

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

  const clearAttachedImage = () => {
    setAttachedImage((prev) => {
      if (prev?.previewUrl) URL.revokeObjectURL(prev.previewUrl);
      return null;
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCameraClick = () => {
    if (loading) return;
    fileInputRef.current?.click();
  };

  const handleImageSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    setAttachedImage((prev) => {
      if (prev?.previewUrl) URL.revokeObjectURL(prev.previewUrl);
      return {
        name: file.name,
        previewUrl: URL.createObjectURL(file),
      };
    });

    textareaRef.current?.focus();
  };

  const handleShare = async () => {
    const url = window.location.href;
    const title = t("hero.shareTitle");
    const text = t("hero.shareText");

    try {
      if (navigator.share) {
        await navigator.share({ title, text, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      alert(t("hero.shareCopied"));
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      try {
        await navigator.clipboard.writeText(url);
        alert(t("hero.shareCopied"));
      } catch {
        alert(t("hero.shareFailed"));
      }
    }
  };

  const handleToggleLanguage = () => {
    const current = resolveLocale(i18n.language);
    const next: Locale = current === "fr" ? "en" : "fr";
    void i18n.changeLanguage(next);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = idea.trim();
    if ((!trimmed && !attachedImage) || loading) return;

    let payload = trimmed;
    if (attachedImage) {
      const hint = t("hero.imageHint", { name: attachedImage.name });
      payload = trimmed ? `${trimmed}\n\n${hint}` : hint;
    }

    onSubmitIdea(payload);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const navItems = [
    t("hero.navScout"),
    t("hero.navResearch"),
    t("hero.navAutopilot"),
  ];

  const canSubmit = Boolean(idea.trim() || attachedImage);

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

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleImageSelected}
      />

      <nav className="relative z-20 px-4 sm:px-6 md:px-10 py-4 sm:py-6 w-full pt-[max(1rem,env(safe-area-inset-top))]">
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-white font-semibold text-base sm:text-lg shrink-0">
            <Globe size={20} className="sm:w-[22px] sm:h-[22px]" />
            <span>isee</span>
            <span className="text-white/50 text-xs sm:text-sm font-mono">.v1</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((l) => (
              <span key={l} className="text-white/80 text-sm font-medium">
                {l}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <LanguageSwitcher />
            <div className={`${GLASS} hidden sm:inline-flex rounded-full px-3 sm:px-4 py-1.5 text-white/90 text-[10px] sm:text-xs font-mono`}>
              {t("hero.scouterActive")}
            </div>
          </div>
        </div>
      </nav>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 text-center pb-4">
        <h1 className="relative z-0 font-serif-display text-white mb-5 sm:mb-6 tracking-tight leading-[1.1] text-[clamp(1.75rem,6vw,4.5rem)] pointer-events-none select-none px-2">
          {t("hero.headline")}
        </h1>

        <div className="relative z-20 w-full max-w-xl space-y-3 sm:space-y-4 overflow-visible">
          <form
            onSubmit={handleSubmit}
            className={`${GLASS} relative z-20 overflow-visible rounded-3xl px-3 sm:px-4 pt-3 pb-2.5 flex flex-col gap-2`}
          >
            {attachedImage && (
              <div className="flex items-center gap-2 text-left">
                <img
                  src={attachedImage.previewUrl}
                  alt={t("hero.imageAttached")}
                  className="h-14 w-14 rounded-xl object-cover border border-white/20"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-mono text-white/50">{t("hero.imageAttached")}</p>
                  <p className="text-sm text-white/85 truncate">{attachedImage.name}</p>
                </div>
                <button
                  type="button"
                  onClick={clearAttachedImage}
                  aria-label={t("hero.removeImage")}
                  className="p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition"
                >
                  <X size={16} />
                </button>
              </div>
            )}
            <textarea
              ref={textareaRef}
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t("hero.placeholder")}
              disabled={loading}
              rows={1}
              className="w-full min-h-[1.5rem] max-h-[200px] resize-none bg-transparent outline-none border-none text-left text-white placeholder:text-white/50 text-base leading-6 disabled:opacity-60 overflow-y-auto scrollbar-none"
            />
            <div className="flex items-center justify-between gap-2 shrink-0">
              <div className="min-w-0">{llmSettings}</div>
              <button
                type="submit"
                disabled={loading || !canSubmit}
                aria-label={t("hero.submitAria")}
                className="glass-btn-solid p-2.5 sm:p-3 shrink-0 disabled:opacity-50 disabled:hover:scale-100"
              >
                <ArrowRight size={18} />
              </button>
            </div>
          </form>

          <p className="text-white/70 text-sm sm:text-base leading-relaxed px-1 sm:px-2">
            {t("hero.subtitle")}
          </p>
        </div>
      </div>

      <div className="relative z-10 flex justify-center gap-3 sm:gap-4 pb-[max(2.5rem,env(safe-area-inset-bottom))] sm:pb-12">
        <button
          type="button"
          onClick={handleCameraClick}
          disabled={loading}
          aria-label={t("hero.cameraAria")}
          title={t("hero.cameraAria")}
          className={`${GLASS} rounded-full p-3 sm:p-4 text-white hover:bg-white/15 transition disabled:opacity-50`}
        >
          <Camera size={18} />
        </button>
        <button
          type="button"
          onClick={() => void handleShare()}
          aria-label={t("hero.shareAria")}
          title={t("hero.shareAria")}
          className={`${GLASS} rounded-full p-3 sm:p-4 text-white hover:bg-white/15 transition`}
        >
          <Share2 size={18} />
        </button>
        <button
          type="button"
          onClick={handleToggleLanguage}
          aria-label={t("hero.globeAria")}
          title={t("hero.globeAria")}
          className={`${GLASS} rounded-full p-3 sm:p-4 text-white hover:bg-white/15 transition`}
        >
          <Globe size={18} />
        </button>
      </div>
    </div>
  );
};

export { LiquidGlassHero };
