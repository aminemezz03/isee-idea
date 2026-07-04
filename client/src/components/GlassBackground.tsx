import { useEffect, useRef } from "react";
import { VIDEO_URL } from "@/lib/theme";

interface GlassBackgroundProps {
  dim?: "light" | "medium" | "heavy";
}

export function GlassBackground({ dim = "medium" }: GlassBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.play().catch(() => {});
  }, []);

  const overlay =
    dim === "light"
      ? "bg-black/40"
      : dim === "heavy"
        ? "bg-black/70"
        : "bg-black/55";

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-black">
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover opacity-60"
        src={VIDEO_URL}
        autoPlay
        muted
        playsInline
        loop
      />
      <div className={`absolute inset-0 ${overlay}`} />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50 pointer-events-none" />
    </div>
  );
}
