import type { Request, Response, NextFunction } from "express";
import { verifyUserToken } from "../lib/jwt";

export const DEMO_USER_ID = "demo";

export type AuthMode = "jwt" | "demo";

export type RequestAuth = {
  mode: AuthMode;
  userId: string;
  role: "user" | "admin";
  email?: string;
};

declare global {
  namespace Express {
    interface Request {
      auth?: RequestAuth;
    }
  }
}

/**
 * Reads `Authorization: Bearer <jwt>` or `X-Demo-Mode: true` (guest preview).
 */
export function attachAuthContext(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const demoHeader = req.get("X-Demo-Mode");
  const isDemo = demoHeader === "true" || demoHeader === "1";

  const authHeader = req.get("Authorization");
  const bearer =
    authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;

  if (bearer) {
    try {
      const payload = verifyUserToken(bearer);
      req.auth = {
        mode: "jwt",
        userId: payload.sub,
        role: payload.role,
        email: payload.email,
      };
      next();
      return;
    } catch {
      res.status(401).json({ error: "Invalid or expired token" });
      return;
    }
  }

  if (isDemo) {
    req.auth = {
      mode: "demo",
      userId: DEMO_USER_ID,
      role: "user",
    };
    next();
    return;
  }

  req.auth = undefined;
  next();
}

export function requireJwtOrDemo(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.auth) {
    res.status(401).json({
      error: "Authentication required",
      hint: "Sign in or open the app in demo mode (X-Demo-Mode: true).",
    });
    return;
  }
  next();
}

export function requireJwt(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.auth || req.auth.mode !== "jwt") {
    res.status(401).json({
      error: "Sign in required",
      hint: "Demo mode cannot access this area.",
    });
    return;
  }
  next();
}

export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.auth || req.auth.role !== "admin") {
    res.status(403).json({ error: "Administrator access required" });
    return;
  }
  next();
}
