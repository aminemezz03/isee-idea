export interface UnderstandResponse {
  summary: string;
  targetAudience: string;
  coreProblem: string;
  keyFeatures: string[];
  monetizationHypothesis: string;
}

export interface Channel {
  name: string;
  description: string;
  effort: string;
  impact: string;
}

export interface AnalysisResponse {
  score: number;
  scoreJustification: string;
  breakdownScores: {
    marketPotential: number;
    technicalFeasibility: number;
    automationViability: number;
    distributionEase: number;
  };
  marketValuation: {
    marketSize: string;
    growthRate: string;
    competitorLandscape: string;
    financialPotential: string;
  };
  optimalDemographics: {
    bestRegions: string[];
    bestIndustries: string[];
    targetUserPersona: string;
  };
  budgetAndAutomation: {
    setupComplexity: string;
    buildOnceFeasibility: string;
    automationStrategy: string[];
    operationalCostEstimate: string;
  };
  distributionStrategy: {
    channels: Channel[];
    first100UsersPlan: string[];
  };
}

export interface ProjectHistoryItem {
  id: string;
  prompt: string;
  understandResponse: UnderstandResponse;
  analysisResponse?: AnalysisResponse;
  createdAt: string;
}

export type LlmProvider = "gemini" | "openai" | "anthropic" | "openrouter" | "ollama";
export type LlmMode = "platform" | "custom";

export interface LlmConfig {
  mode: LlmMode;
  provider: LlmProvider;
  model: string;
  apiKey?: string;
}

export interface PlatformModel {
  id: string;
  provider: LlmProvider;
  model: string;
  label: string;
  description: string;
}

export interface ProviderInfo {
  id: LlmProvider;
  label: string;
  models: { id: string; label: string }[];
}

export interface ModelsResponse {
  platform: PlatformModel[];
  providers: ProviderInfo[];
  platformAvailable: boolean;
}

export type ApiKeyValidationStatus = "idle" | "checking" | "valid" | "invalid";

export interface ValidateApiKeyResponse {
  valid: boolean;
  message: string;
  provider?: LlmProvider;
  models?: { id: string; label: string }[];
}
