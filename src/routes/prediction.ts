import { Router, Request, Response } from "express";
import { getPrediction } from "../services/aiService";
import { saveToHistory } from "../store/historyStore";
import type { MedicalTestInput } from "../types";

export const predictionRouter = Router();

predictionRouter.post("/", async (req: Request, res: Response) => {
  try {
    const { testValues, selectedDisease, userId } = req.body as {
      testValues: MedicalTestInput;
      selectedDisease?: string;
      userId?: string;
    };

    if (!testValues || typeof testValues !== "object") {
      res.status(400).json({ error: "testValues is required" });
      return;
    }

    const result = await getPrediction(
      testValues,
      selectedDisease || null,
      userId || null
    );
    const uid = userId || "default";
    saveToHistory(uid, {
      id: `hist-${uid}-${Date.now()}`,
      testDate: result.testDate,
      testValues,
      predictions: result.predictions,
      fullResult: result,
    });
    res.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Prediction failed";
    const status = (err as { response?: { status?: number } })?.response?.status;
    const code = (err as NodeJS.ErrnoException)?.code;
    const hint =
      code === "ECONNRESET" || message.includes("ECONNRESET")
        ? " Start the Python AI service: cd Medi-Report-AI-Backend/ai-services, activate venv, pip install -r requirements.txt, then python app.py. Ensure AI_SERVICE_URL matches (default http://127.0.0.1:5000)."
        : code === "ECONNREFUSED" || message.includes("ECONNREFUSED")
          ? " Nothing is listening on the AI service port. Run python app.py in ai-services."
          : "";
    res.status(status || 502).json({
      error: "AI prediction service error",
      details: message + hint,
    });
  }
});
