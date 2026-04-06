import type { HealthHistory } from "../types";
import { saveAppState } from "../persistence/appState";
import { getUsersForPersistence } from "./usersStore";

export const historyStore: Record<string, HealthHistory[]> = {};

let persistEnabled = false;

export function enableHistoryPersistence(): void {
  persistEnabled = true;
}

export function persistAppState(): void {
  if (!persistEnabled) return;
  saveAppState({
    users: getUsersForPersistence(),
    history: JSON.parse(JSON.stringify(historyStore)) as Record<
      string,
      HealthHistory[]
    >,
  });
}

export function loadHistoryFromState(
  data: Record<string, HealthHistory[]> | null
): void {
  for (const k of Object.keys(historyStore)) {
    delete historyStore[k];
  }
  if (!data) return;
  Object.assign(historyStore, data);
}

export function saveToHistory(userId: string, entry: HealthHistory): void {
  if (!historyStore[userId]) historyStore[userId] = [];
  historyStore[userId].unshift(entry);
  persistAppState();
}

export function getHistory(userId: string): HealthHistory[] {
  return historyStore[userId] || [];
}

export function getHistoryById(
  userId: string,
  id: string
): HealthHistory | undefined {
  return (historyStore[userId] || []).find((h) => h.id === id);
}

export function getTotalReportCount(): number {
  return Object.values(historyStore).reduce((sum, list) => sum + list.length, 0);
}

export function deleteHistoryForUser(userId: string): void {
  delete historyStore[userId];
  persistAppState();
}
