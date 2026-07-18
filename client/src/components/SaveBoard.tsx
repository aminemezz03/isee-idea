import { Trash2, X, Bookmark, PanelLeftClose, PanelLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ProjectHistoryItem } from "@/types";

interface SaveBoardProps {
  visible: boolean;
  collapsed: boolean;
  mobileOpen: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
  history: ProjectHistoryItem[];
  activeId?: string;
  onSelect: (item: ProjectHistoryItem) => void;
  onDelete: (id: string) => void;
}

export function SaveBoard({
  visible,
  collapsed,
  mobileOpen,
  onClose,
  onToggleCollapse,
  history,
  activeId,
  onSelect,
  onDelete,
}: SaveBoardProps) {
  const { t, i18n } = useTranslation();

  if (!visible) return null;

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {collapsed && (
        <aside className="hidden lg:flex h-full w-14 shrink-0 flex-col items-center border-r border-white/15 bg-black/30 backdrop-blur-2xl py-4 gap-3">
          <button
            type="button"
            onClick={onToggleCollapse}
            title={t("saveBoard.open")}
            className="p-2.5 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition"
          >
            <PanelLeft size={20} />
          </button>
          <button
            type="button"
            onClick={onToggleCollapse}
            title={t("saveBoard.title")}
            className="p-2.5 rounded-lg text-indigo-300 hover:bg-white/10 transition relative"
          >
            <Bookmark size={20} />
            {history.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-indigo-500 text-[9px] font-mono text-white flex items-center justify-center">
                {history.length > 9 ? "9+" : history.length}
              </span>
            )}
          </button>
        </aside>
      )}

      <aside
        className={`fixed lg:relative top-0 left-0 z-50 lg:z-auto h-[100dvh] lg:h-full shrink-0 flex flex-col border-r border-white/15 bg-black/30 backdrop-blur-2xl transition-transform duration-300 ease-in-out w-[min(20rem,calc(100vw-0.5rem))] ${
          collapsed ? "lg:hidden" : "lg:w-80"
        } ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
        style={{
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-2 text-white">
            <Bookmark size={18} className="text-indigo-300" />
            <h2 className="font-display font-bold text-lg">{t("saveBoard.title")}</h2>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onToggleCollapse}
              title={t("saveBoard.closeSidebar")}
              className="hidden lg:flex p-1.5 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition"
            >
              <PanelLeftClose size={18} />
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label={t("saveBoard.close")}
              className="p-2 min-w-11 min-h-11 flex items-center justify-center hover:bg-white/10 rounded-full text-white/70 lg:hidden"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {history.length === 0 ? (
            <p className="text-sm text-white/40 font-mono p-3">
              {t("saveBoard.empty")}
            </p>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                role="button"
                tabIndex={0}
                className={`glass-card p-3 cursor-pointer transition hover:bg-white/15 ${
                  activeId === item.id
                    ? "ring-1 ring-indigo-400/60 bg-white/15"
                    : ""
                }`}
                onClick={() => onSelect(item)}
                onKeyDown={(e) => e.key === "Enter" && onSelect(item)}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="font-mono text-[10px] text-white/40 uppercase">
                    {new Date(item.createdAt).toLocaleDateString(i18n.language)}
                  </span>
                  {item.analysisResponse && (
                    <span className="font-display font-bold text-xs bg-indigo-500/40 text-white px-2 py-0.5 rounded-full border border-indigo-400/30">
                      {item.analysisResponse.score.toFixed(1)}
                    </span>
                  )}
                </div>
                <p className="text-sm font-medium text-white/90 line-clamp-2 mb-1">
                  {item.understandResponse.summary}
                </p>
                <p className="text-xs text-white/40 font-mono line-clamp-1">
                  {item.prompt}
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(item.id);
                  }}
                  className="mt-2 flex items-center gap-1.5 text-xs text-red-400/80 hover:text-red-300 min-h-11 px-1 -ml-1"
                >
                  <Trash2 size={12} />
                  {t("common.delete")}
                </button>
              </div>
            ))
          )}
        </div>
      </aside>
    </>
  );
}
