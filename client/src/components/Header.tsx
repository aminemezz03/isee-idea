import { PanelLeftClose, PanelLeft, Globe, Bot } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

interface HeaderProps {
  stage: "input" | "confirm" | "dashboard";
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  modelLabel?: string;
  llmMode?: "platform" | "custom";
}

export function Header({
  stage,
  sidebarCollapsed,
  onToggleSidebar,
  modelLabel,
  llmMode,
}: HeaderProps) {
  const { t } = useTranslation();

  if (stage === "input") return null;

  const openLabel = t("header.openSaveBoard");
  const closeLabel = t("header.closeSaveBoard");
  const sidebarTitle = sidebarCollapsed ? openLabel : closeLabel;

  const stageLabels = {
    input: t("header.stageInput"),
    confirm: t("header.stageConfirm"),
    dashboard: t("header.stageDashboard"),
  };

  const stageLabelsShort = {
    input: t("header.stageInputShort"),
    confirm: t("header.stageConfirmShort"),
    dashboard: t("header.stageDashboardShort"),
  };

  return (
    <header className="sticky top-0 z-30 px-3 sm:px-6 py-3 sm:py-5 pt-[max(0.75rem,env(safe-area-inset-top))] bg-black/20 backdrop-blur-md lg:bg-transparent lg:backdrop-blur-none">
      <div className="max-w-7xl mx-auto flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <button
            type="button"
            onClick={onToggleSidebar}
            title={sidebarTitle}
            aria-label={sidebarTitle}
            className="p-2.5 min-w-11 min-h-11 flex items-center justify-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition shrink-0"
          >
            <span className="lg:hidden">
              <PanelLeft size={20} />
            </span>
            <span className="hidden lg:inline">
              {sidebarCollapsed ? (
                <PanelLeft size={20} />
              ) : (
                <PanelLeftClose size={20} />
              )}
            </span>
          </button>
          <div className="flex items-center gap-2 text-white font-semibold text-base sm:text-xl shrink-0 min-w-0">
            <Globe size={18} className="sm:w-5 sm:h-5 shrink-0" />
            <span className="font-display font-bold tracking-tight truncate">
              isee <span className="text-white/50 font-mono text-xs sm:text-sm">.v1</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 pl-12 sm:pl-0 overflow-x-auto max-w-full scrollbar-none">
          <LanguageSwitcher compact />
          {modelLabel && (
            <div className="glass rounded-full px-2.5 sm:px-3 py-1.5 flex items-center gap-1.5 font-mono text-[10px] sm:text-xs text-white/80 max-w-[9rem] sm:max-w-none shrink-0">
              <Bot size={12} className="text-indigo-300 shrink-0" />
              <span className="truncate">
                {llmMode === "custom" ? t("common.byok") : ""}
                {modelLabel}
              </span>
            </div>
          )}
          <div className="glass rounded-full px-2.5 sm:px-4 py-1.5 font-mono text-[10px] sm:text-xs text-white/90 whitespace-nowrap shrink-0">
            <span className="sm:hidden">{stageLabelsShort[stage]}</span>
            <span className="hidden sm:inline">{stageLabels[stage]}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
