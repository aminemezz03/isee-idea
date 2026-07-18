import type {
  AnalysisResponse,
  UnderstandResponse,
} from "../types.js";

export function mockUnderstandIdea(prompt: string): UnderstandResponse {
  const snippet = prompt.slice(0, 80).trim() || "your concept";
  return {
    summary: `A software venture centered on: ${snippet}${prompt.length > 80 ? "…" : ""}`,
    targetAudience:
      "Early-stage founders, indie hackers, and product-minded operators seeking structured validation.",
    coreProblem:
      "Founders struggle to translate raw ideas into actionable market intelligence without expensive consultants.",
    keyFeatures: [
      "AI-powered idea comprehension and refinement loop",
      "Multi-axis viability scoring dashboard",
      "Autopilot automation strategy generator",
      "Organic distribution playbook for first 100 users",
      "Persistent scout history board",
    ],
    monetizationHypothesis:
      "Freemium scout credits with Pro tier for unlimited deep research exports and team workspaces.",
  };
}

export function mockAnalyzeIdea(
  prompt: string,
  correction?: string
): AnalysisResponse {
  const focus = correction?.trim()
    ? `Adjusted focus: ${correction.slice(0, 120)}`
    : "Baseline analysis from original prompt.";

  return {
    score: 7.4,
    scoreJustification: `${focus} The idea shows strong product-market fit signals in the AI tooling space with moderate competition. Technical build is straightforward with modern stack; distribution will require deliberate community-led GTM.`,
    breakdownScores: {
      marketPotential: 8.1,
      technicalFeasibility: 8.5,
      automationViability: 7.2,
      distributionEase: 5.8,
    },
    marketValuation: {
      marketSize:
        "Global idea-validation & founder tooling TAM ~$4.2B; SAM for AI scouters ~$680M.",
      growthRate: "18–24% CAGR driven by AI-native founder workflows.",
      competitorLandscape:
        "Fragmented: Notion AI, ValidatorAI, and niche indie tools. Differentiation via deep autopilot + distribution playbook.",
      financialPotential:
        "At 2% SAM capture with $29/mo Pro: ~$4M ARR potential within 3 years with focused niche GTM.",
    },
    optimalDemographics: {
      bestRegions: ["United States", "Western Europe", "Canada", "Australia"],
      bestIndustries: ["SaaS", "AI Tools", "No-Code", "Creator Economy"],
      targetUserPersona:
        "Solo founder or 2-person team, 25–40, technical or product background, building first or second venture, budget-conscious, active on X/Indie Hackers.",
    },
    budgetAndAutomation: {
      setupComplexity: "Medium — 4–6 weeks MVP with Vite + Express + Gemini API.",
      buildOnceFeasibility:
        "High — core pipeline is prompt-in / JSON-out; cron-based re-scoring and webhook alerts are additive.",
      automationStrategy: [
        "Serverless cron (Vercel/Railway) to refresh market signals weekly",
        "Webhook from Stripe for Pro tier scout credit resets",
        "Gemini batch API for queued deep-research jobs",
        "Email digest via Resend when analysis completes",
        "localStorage sync optional export to Notion via API",
      ],
      operationalCostEstimate:
        "$45–120/mo at early scale (hosting + Gemini API + email). Scales with scout volume.",
    },
    distributionStrategy: {
      channels: [
        {
          name: "Indie Hackers & Reddit",
          description:
            "Share scout results as case studies; offer free scouts in launch posts.",
          effort: "Low",
          impact: "High",
        },
        {
          name: "X/Twitter Build in Public",
          description:
            "Daily threads showing real idea scores and breakdowns with CTA to try isee.",
          effort: "Medium",
          impact: "High",
        },
        {
          name: "Product Hunt Launch",
          description:
            "Launch with live demo scouting audience-submitted ideas on stream.",
          effort: "Medium",
          impact: "Medium",
        },
      ],
      first100UsersPlan: [
        "Week 1: Post 5 free scout breakdowns on Indie Hackers with link to isee.v1",
        "Week 2: Run Twitter spaces with live idea scouting sessions",
        "Week 3: Partner with 3 micro-influencer founders for sponsored scouts",
        "Week 4: Product Hunt launch + email waitlist from scout completions",
      ],
    },
  };
}

export const UNDERSTAND_SCHEMA = `{
  "summary": "string",
  "targetAudience": "string",
  "coreProblem": "string",
  "keyFeatures": ["string"],
  "monetizationHypothesis": "string"
}`;

export const ANALYSIS_SCHEMA = `{
  "score": number,
  "scoreJustification": "string",
  "breakdownScores": {
    "marketPotential": number,
    "technicalFeasibility": number,
    "automationViability": number,
    "distributionEase": number
  },
  "marketValuation": {
    "marketSize": "string",
    "growthRate": "string",
    "competitorLandscape": "string",
    "financialPotential": "string"
  },
  "optimalDemographics": {
    "bestRegions": ["string"],
    "bestIndustries": ["string"],
    "targetUserPersona": "string"
  },
  "budgetAndAutomation": {
    "setupComplexity": "string",
    "buildOnceFeasibility": "string",
    "automationStrategy": ["string"],
    "operationalCostEstimate": "string"
  },
  "distributionStrategy": {
    "channels": [{ "name": "string", "description": "string", "effort": "string", "impact": "string" }],
    "first100UsersPlan": ["string"]
  }
}`;

export function buildUnderstandPrompt(
  prompt: string,
  languageInstruction: string
): string {
  return `${languageInstruction}

You are an expert startup analyst. Analyze this raw project idea and return ONLY valid JSON matching this schema (no markdown):
${UNDERSTAND_SCHEMA}

Project idea:
"""
${prompt}
"""

Remember: ${languageInstruction}`;
}

export function buildAnalyzePrompt(
  prompt: string,
  correction: string | undefined,
  languageInstruction: string
): string {
  const refinement = correction?.trim();
  const correctionBlock = refinement
    ? `

CRITICAL USER REFINEMENT — this OVERRIDES the original idea wherever they conflict:
"""
${refinement}
"""
You MUST apply this refinement across the entire analysis (market focus, demographics, distribution, scoring, and recommendations). Do not ignore it.`
    : "";

  return `${languageInstruction}

You are an expert startup analyst performing deep market research. Return ONLY valid JSON matching this schema (no markdown):
${ANALYSIS_SCHEMA}

Original project idea:
"""
${prompt}
"""${correctionBlock}

Score each breakdown dimension 0.0-10.0. Overall score 0.0-10.0. Be specific and actionable.

Remember: ${languageInstruction}`;
}

export function parseJsonResponse<T>(text: string): T {
  const cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start === -1 || end <= start) throw new Error("Model returned invalid JSON.");
    return JSON.parse(cleaned.slice(start, end + 1)) as T;
  }
}
