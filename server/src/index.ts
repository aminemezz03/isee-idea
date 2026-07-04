import "dotenv/config";
import cors from "cors";
import express from "express";
import ideasRouter from "./routes/ideas.js";
import modelsRouter from "./routes/models.js";
import validateRouter from "./routes/validate.js";

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "isee-api" });
});

app.use("/api", modelsRouter);
app.use("/api", validateRouter);
app.use("/api", ideasRouter);

app.listen(PORT, () => {
  console.log(`isee server running on http://localhost:${PORT}`);
});
