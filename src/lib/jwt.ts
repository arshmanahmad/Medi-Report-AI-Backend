import jwt, { type SignOptions } from "jsonwebtoken";
import type { User } from "../types";

const JWT_SECRET =
  process.env.JWT_SECRET || "medi-report-dev-secret-change-in-production";
const JWT_EXPIRES: SignOptions["expiresIn"] =
  (process.env.JWT_EXPIRES as SignOptions["expiresIn"]) || "7d";

export type JwtPayload = {
  sub: string;
  email: string;
  role: "user" | "admin";
};

export function signUserToken(user: User): string {
  const payload: JwtPayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
  };
  const opts: SignOptions = { expiresIn: JWT_EXPIRES };
  return jwt.sign(payload, JWT_SECRET, opts);
}

export function verifyUserToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, JWT_SECRET);
  if (typeof decoded !== "object" || decoded === null || !("sub" in decoded)) {
    throw new Error("Invalid token payload");
  }
  const p = decoded as JwtPayload;
  if (!p.sub || !p.email || !p.role) {
    throw new Error("Invalid token payload");
  }
  return p;
}
