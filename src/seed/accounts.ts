import { hashPassword } from "../lib/password";
import type { StoredUser } from "../store/usersStore";

/**
 * Default dev accounts. Override when running `npm run seed`:
 *   SEED_USER_PASSWORD, SEED_ADMIN_PASSWORD
 */
export const SEED_ACCOUNT_DEFS = [
  {
    id: "1",
    email: "john.doe@example.com",
    name: "John Doe",
    role: "user" as const,
    createdAt: "2024-01-15",
    resolvePassword: () => process.env.SEED_USER_PASSWORD ?? "user12345",
  },
  {
    id: "admin-1",
    email: "admin@example.com",
    name: "Admin User",
    role: "admin" as const,
    createdAt: "2024-01-10",
    resolvePassword: () => process.env.SEED_ADMIN_PASSWORD ?? "admin12345",
  },
];

export function buildSeedStoredUsers(): StoredUser[] {
  return SEED_ACCOUNT_DEFS.map((s) => ({
    id: s.id,
    email: s.email,
    name: s.name,
    role: s.role,
    createdAt: s.createdAt,
    passwordHash: hashPassword(s.resolvePassword()),
  }));
}
