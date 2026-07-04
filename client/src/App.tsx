import { useCallback, useEffect, useState } from "react";
import { analyzeIdea, understandIdea } from "@/api/client";
import { BentoDashboard } from "@/components/BentoDashboard";
import { ConfirmationStage } from "@/components/ConfirmationStage";
import { GlassBackground } from "@/components/GlassBackground";
import { Header } from "@/components/Header";
import { LlmSettingsPanel } from "@/components/LlmSettingsPanel";
import {
  LoadingScreen,
  type LoadingPhase,
} from "@/components/LoadingScreen";
import { SaveBoard } from "@/components/SaveBoard";
import { LiquidGlassHero } from "@/components/ui/liquid-glass-hero";
import { useLlmSettings } from "@/hooks/useLlmSettings";
import { useProjectHistory } from "@/hooks/useProjectHistory";
import type {
  AnalysisResponse,
  ApiKeyValidationStatus,
  LlmConfig,
  ProjectHistoryItem,
  UnderstandResponse,
} from "@/types";

type Stage = "input" | "confirm" | "dashboard";

function validateLlm(
  config: LlmConfig,
  platformAvailable: boolean,
  apiKeyStatus: ApiKeyValidationStatus
): string | null {
  if (config.mode === "custom") {
    if (!config.apiKey?.trim()) {
      return "Please enter your API key in AI Model settings.";
    }
    if (apiKeyStatus === "checking") {
      return "Your API key is still being verified. Please wait.";
    }
    if (apiKeyStatus !== "valid") {
      return "Please verify your API key is valid before scouting.";
    }
    return null;
  }
  if (!platformAvailable) {
    return "No isee models available. Switch to Your API Key mode and enter your key.";
  }
  return null;
}

function App() {
  const { history, saveItem, updateItem, deleteItem } = useProjectHistory();
  const llm = useLlmSettings();
  const [stage, setStage] = useState<Stage>("input");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem("isee-sidebar-collapsed") === "true";
    } catch {
      return false;
    }
  });
  const [loading, setLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState<LoadingPhase>("understand");
  const [prompt, setPrompt] = useState("");
  const [correction, setCorrection] = useState("");
  const [comprehension, setComprehension] = useState<UnderstandResponse | null>(
    null
  );
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [activeId, setActiveId] = useState<string | undefined>();

  const llmPanel = (
    <LlmSettingsPanel
      config={llm.config}
      models={llm.models}
      modelsLoading={llm.modelsLoading}
      availableCustomModels={llm.availableCustomModels}
      apiKeyStatus={llm.apiKeyStatus}
      apiKeyMessage={llm.apiKeyMessage}
      onModeChange={llm.setMode}
      onProviderChange={llm.setProvider}
      onCustomModelSelect={llm.selectCustomModel}
      onApiKeyChange={llm.setApiKey}
      onPlatformModelSelect={llm.selectPlatformModel}
      onValidateKey={() => llm.checkApiKey()}
    />
  );

  const handleSubmitIdea = useCallback(
    async (idea: string) => {
      const err = validateLlm(llm.config, llm.models?.platformAvailable ?? false, llm.apiKeyStatus);
      if (err) {
        alert(err);
        return;
      }

      setLoadingPhase("understand");
      setLoading(true);
      setPrompt(idea);
      try {
        const result = await understandIdea(idea, llm.config);
        setComprehension(result);
        const id = crypto.randomUUID();
        const item: ProjectHistoryItem = {
          id,
          prompt: idea,
          understandResponse: result,
          createdAt: new Date().toISOString(),
        };
        saveItem(item);
        setActiveId(id);
        setStage("confirm");
      } catch (e) {
        alert(e instanceof Error ? e.message : "Failed to understand idea.");
      } finally {
        setLoading(false);
      }
    },
    [llm.config, llm.models?.platformAvailable, saveItem]
  );

  const handleConfirm = useCallback(async () => {
    if (!prompt || !comprehension || !activeId) return;

    const err = validateLlm(llm.config, llm.models?.platformAvailable ?? false, llm.apiKeyStatus);
    if (err) {
      alert(err);
      return;
    }

    setLoadingPhase("analyze");
    setLoading(true);
    try {
      const result = await analyzeIdea(prompt, llm.config, correction || undefined);
      setAnalysis(result);
      updateItem({
        id: activeId,
        prompt,
        understandResponse: comprehension,
        analysisResponse: result,
        createdAt:
          history.find((h) => h.id === activeId)?.createdAt ??
          new Date().toISOString(),
      });
      setStage("dashboard");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to run deep research.");
    } finally {
      setLoading(false);
    }
  }, [
    prompt,
    correction,
    comprehension,
    activeId,
    history,
    updateItem,
    llm.config,
    llm.models?.platformAvailable,
  ]);

  const toggleSidebar = useCallback(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen((v) => !v);
    } else {
      setSidebarCollapsed((v) => {
        const next = !v;
        localStorage.setItem("isee-sidebar-collapsed", String(next));
        return next;
      });
    }
  }, []);

  const handleSelectHistory = useCallback((item: ProjectHistoryItem) => {
    setPrompt(item.prompt);
    setComprehension(item.understandResponse);
    setActiveId(item.id);
    setCorrection("");
    if (item.analysisResponse) {
      setAnalysis(item.analysisResponse);
      setStage("dashboard");
    } else {
      setAnalysis(null);
      setStage("confirm");
    }
    setSidebarOpen(false);
  }, []);

  const handleNewScout = useCallback(() => {
    setStage("input");
    setPrompt("");
    setCorrection("");
    setComprehension(null);
    setAnalysis(null);
    setActiveId(undefined);
  }, []);

  const showSidebarLayout = stage !== "input";
  const modelLabel = llm.getModelLabel();

  useEffect(() => {
    if (!sidebarOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [sidebarOpen]);

  return (
    <div className="min-h-[100dvh] overflow-x-hidden">
      {showSidebarLayout && <GlassBackground />}

      {showSidebarLayout ? (
        <div className="relative z-10 flex min-h-[100dvh] overflow-x-hidden">
          <SaveBoard
            visible
            collapsed={sidebarCollapsed}
            mobileOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            onToggleCollapse={() => {
              setSidebarCollapsed((v) => {
                const next = !v;
                localStorage.setItem("isee-sidebar-collapsed", String(next));
                return next;
              });
            }}
            history={history}
            activeId={activeId}
            onSelect={handleSelectHistory}
            onDelete={deleteItem}
          />
          <div className="flex-1 min-w-0 overflow-x-hidden">
            <Header
              stage={stage}
              sidebarCollapsed={sidebarCollapsed}
              onToggleSidebar={toggleSidebar}
              modelLabel={modelLabel}
              llmMode={llm.config.mode}
            />
            {stage === "confirm" && comprehension && (
              <ConfirmationStage
                comprehension={comprehension}
                correction={correction}
                onCorrectionChange={setCorrection}
                onConfirm={handleConfirm}
                onBack={handleNewScout}
                loading={loading}
              />
            )}
            {stage === "dashboard" && analysis && (
              <BentoDashboard analysis={analysis} onNewScout={handleNewScout} />
            )}
          </div>
        </div>
      ) : (
        <LiquidGlassHero
          onSubmitIdea={handleSubmitIdea}
          loading={loading}
          llmSettings={llmPanel}
        />
      )}

      <LoadingScreen visible={loading} phase={loadingPhase} />
    </div>
  );
}

export default App;
