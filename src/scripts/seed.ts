/**
 * Upsert seed users into data/app-state.json (merge by email; keeps history).
 * Run from backend root: npm run seed
 */
import { hashPassword } from "../lib/password";
import { SEED_ACCOUNT_DEFS } from "../seed/accounts";
import {
  ensureDataDir,
  loadAppState,
  saveAppState,
  type AppStateFile,
} from "../persistence/appState";
import type { StoredUser } from "../store/usersStore";

function allocId(preferred: string, taken: Set<string>): string {
  if (!taken.has(preferred)) return preferred;
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function run(): void {
  ensureDataDir();
  const existing = loadAppState();
  const state: AppStateFile = existing ?? { users: [], history: {} };
  if (!Array.isArray(state.users)) state.users = [];
  if (!state.history || typeof state.history !== "object") state.history = {};

  const takenIds = new Set(state.users.map((u) => u.id));

  for (const def of SEED_ACCOUNT_DEFS) {
    const emailLower = def.email.toLowerCase();
    const idx = state.users.findIndex(
      (u) => u.email.toLowerCase() === emailLower
    );
    const hash = hashPassword(def.resolvePassword());

    if (idx >= 0) {
      const cur = state.users[idx];
      state.users[idx] = {
        ...cur,
        name: def.name,
        role: def.role,
        passwordHash: hash,
      };
    } else {
      const id = allocId(def.id, takenIds);
      takenIds.add(id);
      const row: StoredUser = {
        id,
        email: def.email,
        name: def.name,
        role: def.role,
        createdAt: def.createdAt,
        passwordHash: hash,
      };
      state.users.push(row);
    }
  }

  saveAppState(state);

  console.log("[seed] Wrote accounts to data/app-state.json");
  for (const def of SEED_ACCOUNT_DEFS) {
    console.log(`  • ${def.role}: ${def.email}`);
  }
  console.log(
    "[seed] Passwords: set SEED_USER_PASSWORD / SEED_ADMIN_PASSWORD, or defaults user12345 / admin12345 (see README)."
  );
  console.log(
    "[seed] Restart the API server if it is running so it reloads users from disk."
  );
}

run();
