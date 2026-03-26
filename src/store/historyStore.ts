import type { HealthHistory } from "../types";

export const historyStore: Record<string, HealthHistory[]> = {};

export function saveToHistory(userId: string, entry: HealthHistory): void {
  if (!historyStore[userId]) historyStore[userId] = [];
  historyStore[userId].unshift(entry);
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
