import { Router, Request, Response } from "express";
import {
  getUsers,
  addUser,
  updateUserById,
  deleteUserById,
} from "../store/usersStore";
import {
  getTotalReportCount,
  deleteHistoryForUser,
  persistAppState,
} from "../store/historyStore";
import type { User } from "../types";

export const adminRouter = Router();

adminRouter.get("/stats", (_req: Request, res: Response) => {
  const allUsers = getUsers();
  const regularUsers = allUsers.filter((u) => u.role === "user");
  const totalReports = getTotalReportCount();
  res.json({
    totalUsers: regularUsers.length,
    totalAdmins: allUsers.filter((u) => u.role === "admin").length,
    totalReports,
    activeModels: 1,
    aiServiceNote:
      "Rule-based engine in ai-services; optional RF model + incremental training_data",
  });
});

adminRouter.get("/users", (_req: Request, res: Response) => {
  res.json(getUsers());
});

adminRouter.post("/users", (req: Request, res: Response) => {
  const { name, email, role, password } = req.body as {
    name?: string;
    email?: string;
    role?: "user" | "admin";
    password?: string;
  };
  if (!name || !email) {
    res.status(400).json({ error: "Name and email required" });
    return;
  }
  if (getUsers().some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    res.status(409).json({ error: "Email already exists" });
    return;
  }
  const pwd =
    typeof password === "string" && password.length >= 6
      ? password
      : "TempPass123!";
  const user: User = {
    id: `user-${Date.now()}`,
    name,
    email,
    role: role === "admin" ? "admin" : "user",
    createdAt: new Date().toISOString().split("T")[0],
  };
  addUser(user, pwd);
  persistAppState();
  res.status(201).json(user);
});

adminRouter.patch("/users/:id", (req: Request, res: Response) => {
  const { name, email, role } = req.body as Partial<{
    name: string;
    email: string;
    role: "user" | "admin";
  }>;
  if (
    email &&
    getUsers().some((u) => u.email === email && u.id !== req.params.id)
  ) {
    res.status(409).json({ error: "Email already in use" });
    return;
  }
  const updated = updateUserById(req.params.id, { name, email, role });
  if (!updated) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  persistAppState();
  res.json(updated);
});

adminRouter.delete("/users/:id", (req: Request, res: Response) => {
  const ok = deleteUserById(req.params.id);
  if (!ok) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  deleteHistoryForUser(req.params.id);
  res.status(204).send();
});
