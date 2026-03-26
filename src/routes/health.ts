import { Router, Request, Response } from "express";
import { checkAiServiceHealth } from "../services/aiService";

export const healthRouter = Router();

healthRouter.get("/", (_req: Request, res: Response) => {
  res.json({ status: "ok", service: "medi-report-ai-backend" });
});

healthRouter.get("/ai", async (_req: Request, res: Response) => {
  const ok = await checkAiServiceHealth();
  res.status(ok ? 200 : 503).json({
    aiService: ok ? "connected" : "unavailable",
  });
});
