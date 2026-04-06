import axios from "axios";
import http from "http";
import type { MedicalTestInput, PredictionResult } from "../types";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://127.0.0.1:5001";

/** Fresh TCP connection each request — avoids stale sockets and ECONNRESET on Windows. */
const httpAgent = new http.Agent({ keepAlive: false });

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableAiError(err: unknown): boolean {
  const code = (err as NodeJS.ErrnoException)?.code;
  const msg = err instanceof Error ? err.message : String(err);
  return (
    code === "ECONNRESET" ||
    code === "ECONNREFUSED" ||
    code === "ETIMEDOUT" ||
    code === "EPIPE" ||
    msg.includes("ECONNRESET") ||
    msg.includes("ECONNREFUSED")
  );
}

export async function getPrediction(
  testValues: MedicalTestInput,
  selectedDisease?: string | null,
  userId?: string | null
): Promise<PredictionResult> {
  const base = AI_SERVICE_URL.replace(/\/$/, "");
  const url = `${base}/predict`;
  const body = {
    test_values: testValues,
    selected_disease: selectedDisease || null,
    user_id: userId || null,
  };

  const maxAttempts = 3;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const { data } = await axios.post<PredictionResult>(url, body, {
        timeout: 60000,
        headers: { "Content-Type": "application/json" },
        httpAgent,
      });
      return data;
    } catch (err) {
      lastError = err;
      if (attempt < maxAttempts && isRetryableAiError(err)) {
        await sleep(400 * attempt);
        continue;
      }
      throw err;
    }
  }

  throw lastError;
}

export async function checkAiServiceHealth(): Promise<boolean> {
  try {
    const base = AI_SERVICE_URL.replace(/\/$/, "");
    const { status } = await axios.get(`${base}/health`, {
      timeout: 5000,
      httpAgent,
    });
    return status === 200;
  } catch {
    return false;
  }
}
