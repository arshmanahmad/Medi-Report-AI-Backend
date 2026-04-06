import express from "express";
import cors from "cors";
import { bootstrapPersistence } from "./bootstrap";
import {
  attachAuthContext,
  requireJwtOrDemo,
  requireJwt,
  requireAdmin,
} from "./middleware/authMiddleware";
import { predictionRouter } from "./routes/prediction";
import { healthRouter } from "./routes/health";
import { historyRouter } from "./routes/history";
import { authRouter } from "./routes/auth";
import { adminRouter } from "./routes/admin";
bootstrapPersistence();

const app = express();
const PORT = process.env.PORT || 4000;
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://127.0.0.1:5001";

app.use(
  cors({
    origin: true,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "X-Demo-Mode"],
  })
);
app.use(express.json());

app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);
app.use(
  "/api/predict",
  attachAuthContext,
  requireJwtOrDemo,
  predictionRouter
);
app.use(
  "/api/history",
  attachAuthContext,
  requireJwtOrDemo,
  historyRouter
);
app.use("/api/admin", attachAuthContext, requireJwt, requireAdmin, adminRouter);

app.get("/", (_req, res) => {
  res.json({ message: "Medi Report AI Backend", aiService: AI_SERVICE_URL });
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
  console.log(`AI Service expected at ${AI_SERVICE_URL}`);
});
