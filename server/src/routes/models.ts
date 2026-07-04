import { Router } from "express";
import type { ModelsResponse } from "../llm-types.js";
import {
  CUSTOM_MODELS,
  getAvailablePlatformModels,
  PROVIDER_LABELS,
} from "../services/llm/config.js";

const router = Router();

router.get("/models", async (_req, res) => {
  try {
    const platform = await getAvailablePlatformModels();
    const providers = (
      Object.keys(CUSTOM_MODELS) as (keyof typeof CUSTOM_MODELS)[]
    ).map((id) => ({
      id,
      label: PROVIDER_LABELS[id],
      models: CUSTOM_MODELS[id],
    }));

    const response: ModelsResponse = {
      platform,
      providers,
      platformAvailable: platform.length > 0,
    };

    res.json(response);
  } catch (err) {
    console.error("models error:", err);
    res.status(500).json({ error: "Failed to load models" });
  }
});

export default router;
