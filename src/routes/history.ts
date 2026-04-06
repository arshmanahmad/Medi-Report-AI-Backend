import { Router, Request, Response } from "express";
import { getHistory, getHistoryById } from "../store/historyStore";

export const historyRouter = Router();

historyRouter.get("/", (req: Request, res: Response) => {
  const auth = req.auth;
  if (!auth) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const list = getHistory(auth.userId);
  res.json(list);
});

historyRouter.get("/:id", (req: Request, res: Response) => {
  const auth = req.auth;
  if (!auth) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const item = getHistoryById(auth.userId, req.params.id);
  if (!item) {
    res.status(404).json({ error: "Report not found" });
    return;
  }
  res.json(item);
});
