import { Router, Request, Response } from "express";
import type { User } from "../types";
import { verifyPassword } from "../lib/password";
import { signUserToken } from "../lib/jwt";
import {
  addUser,
  findStoredUserByEmail,
  getUsers,
  toPublicUser,
} from "../store/usersStore";
import { persistAppState } from "../store/historyStore";

export const authRouter = Router();

authRouter.post("/login", (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) {
    res.status(400).json({ error: "Email and password required" });
    return;
  }
  const stored = findStoredUserByEmail(email);
  if (!stored || !verifyPassword(password, stored.passwordHash)) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const user = toPublicUser(stored);
  const token = signUserToken(user);
  res.json({ user, token });
});

authRouter.post("/register", (req: Request, res: Response) => {
  const { name, email, password } = req.body as {
    name?: string;
    email?: string;
    password?: string;
  };
  if (!name || !email || !password) {
    res.status(400).json({ error: "Name, email and password required" });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ error: "Password must be at least 6 characters" });
    return;
  }
  if (getUsers().some((u) => u.email.toLowerCase() === email.toLowerCase())) {
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
  addUser(user, password);
  persistAppState();
  const token = signUserToken(user);
  res.status(201).json({ user, token });
});
