import fs from "fs";
import path from "path";
import type { HealthHistory } from "../types";
import type { StoredUser } from "../store/usersStore";


const DATA_DIR = path.join(process.cwd(), "data");
export const APP_STATE_PATH = path.join(DATA_DIR, "app-state.json");

export type AppStateFile = {
  users: StoredUser[];
  history: Record<string, HealthHistory[]>;
};

export function ensureDataDir(): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export function loadAppState(): AppStateFile | null {
  try {
    if (!fs.existsSync(APP_STATE_PATH)) return null;
    const raw = fs.readFileSync(APP_STATE_PATH, "utf-8");
    const parsed = JSON.parse(raw) as AppStateFile;
    if (!parsed.users || !Array.isArray(parsed.users)) return null;
    if (!parsed.history || typeof parsed.history !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveAppState(state: AppStateFile): void {
  ensureDataDir();
  fs.writeFileSync(APP_STATE_PATH, JSON.stringify(state, null, 2), "utf-8");
}
