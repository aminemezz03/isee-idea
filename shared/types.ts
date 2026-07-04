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
