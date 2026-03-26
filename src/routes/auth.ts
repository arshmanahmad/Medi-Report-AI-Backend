import { Router, Request, Response } from "express";
import type { User } from "../types";
import {
  findUserByEmail,
  addUser,
  getUsers,
} from "../store/usersStore";

export const authRouter = Router();

authRouter.post("/login", (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "Email and password required" });
    return;
  }
  const user = findUserByEmail(email);
  if (user) {
    res.json(user);
    return;
  }
  res.status(401).json({ error: "Invalid credentials" });
});

authRouter.post("/register", (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    res.status(400).json({ error: "Name, email and password required" });
    return;
  }
  if (getUsers().some((u) => u.email === email)) {
    res.status(409).json({ error: "Email already registered" });
    return;
  }
  const user: User = {
    id: `user-${Date.now()}`,
    name,
    email,
    role: "user",
    createdAt: new Date().toISOString().split("T")[0],
  };
  addUser(user);
  res.status(201).json(user);
});
