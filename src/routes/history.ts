import { Router, Request, Response } from "express";
import { getHistory, getHistoryById } from "../store/historyStore";

export const historyRouter = Router();

historyRouter.get("/", (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || "default";
  const list = getHistory(userId);
  res.json(list);
});

historyRouter.get("/:id", (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || "default";
  const item = getHistoryById(userId, req.params.id);
  if (!item) {
    res.status(404).json({ error: "Report not found" });
    return;
  }
  res.json(item);
});
