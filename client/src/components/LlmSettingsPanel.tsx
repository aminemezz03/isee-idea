import { Bot, Key, Sparkles, ChevronDown, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { GLASS } from "@/lib/theme";
import type {
  ApiKeyValidationStatus,
  LlmConfig,
  LlmMode,
  LlmProvider,
  ModelsResponse,
} from "@/types";

interface LlmSettingsPanelProps {
  config: LlmConfig;
  models: ModelsResponse | null;
  modelsLoading: boolean;
  availableCustomModels: { id: string; label: string }[];
  apiKeyStatus: ApiKeyValidationStatus;
  apiKeyMessage: string;
  onModeChange: (mode: LlmMode) => void;
  onProviderChange: (provider: LlmProvider) => void;
  onCustomModelSelect: (modelId: string) => void;
  onApiKeyChange: (key: string) => void;
  onPlatformModelSelect: (id: string) => void;
  onValidateKey: () => void;
}

function shortLabel(
  config: LlmConfig,
  models: ModelsResponse | null,
  availableCustomModels: { id: string; label: string }[]
): string {
  if (!models) return "…";
  if (config.mode === "custom") {
    return (
      availableCustomModels.find((m) => m.id === config.model)?.label ??
      config.model
    );
  }
  const name = models.platform.find(
    (m) => m.provider === config.provider && m.model === config.model
  )?.label;
  return (
    name?.replace("Gemini ", "").replace("Claude ", "").replace("GPT-", "") ??
    config.model
  );
}

function ValidationBadge({ status }: { status: ApiKeyValidationStatus }) {
  if (status === "valid") {
    return <CheckCircle2 size={10} className="text-emerald-400 shrink-0" />;
  }
  if (status === "invalid") {
    return <XCircle size={10} className="text-red-400 shrink-0" />;
  }
  if (status === "checking") {
    return <Loader2 size={10} className="text-indigo-300 animate-spin shrink-0" />;
  }
  return null;
}

export function LlmSettingsPanel({
  config,
  models,
  modelsLoading,
  availableCustomModels,
  apiKeyStatus,
  apiKeyMessage,
  onModeChange,
  onProviderChange,
  onCustomModelSelect,
  onApiKeyChange,
  onPlatformModelSelect,
  onValidateKey,
}: LlmSettingsPanelProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const platformAvailable = (models?.platform.length ?? 0) > 0;
  const pillLabel = shortLabel(config, models, availableCustomModels);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const panelWidth = Math.min(288, window.innerWidth - 16);
    let left = rect.right - panelWidth;
    left = Math.max(8, Math.min(left, window.innerWidth - panelWidth - 8));
    let top = rect.bottom + 8;
    const estimatedHeight = 420;
    if (top + estimatedHeight > window.innerHeight - 8) {
      top = Math.max(8, rect.top - estimatedHeight - 8);
    }
    if (top < 8) top = 8;
    setPos({ top, left });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        rootRef.current?.contains(target) ||
        panelRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const panel = open ? (
    <div
      ref={panelRef}
      role="dialog"
      aria-label={t("llm.settingsAria")}
      style={{ top: pos.top, left: pos.left, maxWidth: "calc(100vw - 1rem)", maxHeight: "calc(100dvh - 1rem)" }}
      className="fixed z-[9999] w-72 rounded-2xl border border-white/20 bg-slate-950/95 p-3 shadow-[0_16px_48px_rgba(0,0,0,0.6)] backdrop-blur-xl space-y-3 text-white overflow-y-auto overscroll-contain"
      onMouseDown={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="flex gap-1.5">
        <ModeButton
          active={config.mode === "platform"}
          disabled={!platformAvailable}
          onClick={() => onModeChange("platform")}
          icon={<Sparkles size={11} />}
          label="isee"
        />
        <ModeButton
          active={config.mode === "custom"}
          onClick={() => onModeChange("custom")}
          icon={<Key size={11} />}
          label={t("llm.yourKey")}
        />
      </div>

      {config.mode === "platform" ? (
        <div className="space-y-1 max-h-44 overflow-y-auto">
          {platformAvailable ? (
            models!.platform.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  onPlatformModelSelect(m.id);
                  setOpen(false);
                }}
                className={`w-full text-left rounded-lg px-2.5 py-2 text-xs border transition ${
                  config.model === m.model && config.provider === m.provider
                    ? "border-indigo-400/60 bg-indigo-500/20"
                    : "border-white/10 bg-white/5 hover:bg-white/10"
                }`}
              >
                <p className="font-medium">{m.label}</p>
              </button>
            ))
          ) : (
            <p className="text-xs text-white/50 px-1">{t("llm.noPlatformModels")}</p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1">
            {models?.providers.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onProviderChange(p.id)}
                className={`rounded-full px-2 py-0.5 text-[10px] font-medium border transition ${
                  config.provider === p.id
                    ? "border-indigo-400/60 bg-indigo-500/25"
                    : "border-white/15 bg-white/5 hover:bg-white/10"
                }`}
              >
                {p.label.replace("Google ", "").replace("Anthropic", "Claude")}
              </button>
            ))}
          </div>

          <label className="block">
            <span className="font-mono text-[10px] uppercase text-white/40 mb-1 block">
              {t("llm.apiKey")}
            </span>
            <div className="relative">
              <input
                type="text"
                autoComplete="off"
                spellCheck={false}
                value={config.apiKey ?? ""}
                onChange={(e) => onApiKeyChange(e.target.value)}
                onPaste={(e) => e.stopPropagation()}
                placeholder={t("llm.apiKeyPlaceholder")}
                className={`w-full bg-slate-900 border rounded-lg px-2 py-2 pr-7 text-xs text-white outline-none placeholder:text-white/30 font-mono transition ${
                  apiKeyStatus === "valid"
                    ? "border-emerald-500/60 focus:border-emerald-400/60"
                    : apiKeyStatus === "invalid"
                      ? "border-red-500/60 focus:border-red-400/60"
                      : "border-white/20 focus:border-indigo-400/60"
                }`}
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2">
                <ValidationBadge status={apiKeyStatus} />
              </span>
            </div>
          </label>

          {apiKeyMessage && (
            <p
              className={`text-[10px] font-mono leading-snug ${
                apiKeyStatus === "valid"
                  ? "text-emerald-400"
                  : apiKeyStatus === "invalid"
                    ? "text-red-400"
                    : "text-white/50"
              }`}
            >
              {apiKeyMessage}
            </p>
          )}

          <button
            type="button"
            onClick={onValidateKey}
            disabled={apiKeyStatus === "checking" || !config.apiKey?.trim()}
            className="w-full rounded-lg border border-white/15 bg-white/5 py-1.5 text-[11px] font-medium hover:bg-white/10 disabled:opacity-40 transition flex items-center justify-center gap-1.5"
          >
            {apiKeyStatus === "checking" ? (
              <>
                <Loader2 size={11} className="animate-spin" />
                {t("llm.verifying")}
              </>
            ) : (
              t("llm.verifyKey")
            )}
          </button>

          {apiKeyStatus === "valid" && availableCustomModels.length > 0 && (
            <div>
              <span className="font-mono text-[10px] uppercase text-emerald-400/80 mb-1 block">
                {t("llm.chooseModel", { count: availableCustomModels.length })}
              </span>
              <div className="space-y-1 max-h-36 overflow-y-auto">
                {availableCustomModels.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => onCustomModelSelect(m.id)}
                    className={`w-full text-left rounded-lg px-2.5 py-2 text-xs border transition ${
                      config.model === m.id
                        ? "border-indigo-400/60 bg-indigo-500/20"
                        : "border-white/10 bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <p className="font-medium truncate">{m.label}</p>
                    <p className="text-[10px] text-white/40 font-mono truncate">{m.id}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {apiKeyStatus !== "valid" && (
            <p className="text-[10px] text-white/35 font-mono">
              {t("llm.verifyToLoad")}
            </p>
          )}
        </div>
      )}
    </div>
  ) : null;

  return (
    <div ref={rootRef} className="relative shrink-0 z-30">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        title={
          config.mode === "custom"
            ? t("llm.yourKeyTitle", { model: pillLabel })
            : pillLabel
        }
        className={`${GLASS} flex items-center gap-1 rounded-full pl-2 pr-1.5 py-1 min-h-9 text-white transition hover:bg-white/15 max-w-[5.5rem] sm:max-w-[9rem] shrink-0`}
      >
        <Bot size={11} className="text-indigo-300 shrink-0" />
        {config.mode === "custom" && <ValidationBadge status={apiKeyStatus} />}
        <span className="text-[10px] sm:text-[11px] font-mono truncate leading-none">
          {modelsLoading ? t("common.loading") : pillLabel}
        </span>
        <ChevronDown
          size={10}
          className={`text-white/50 shrink-0 transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      {panel && createPortal(panel, document.body)}
    </div>
  );
}

function ModeButton({
  active,
  disabled,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-medium border transition disabled:opacity-40 ${
        active
          ? "border-indigo-400/60 bg-indigo-500/20"
          : "border-white/10 bg-white/5 hover:bg-white/10"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
