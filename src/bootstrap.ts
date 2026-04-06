import { ensureDataDir, loadAppState } from "./persistence/appState";
import { initializeUsersFromState } from "./store/usersStore";
import {
  enableHistoryPersistence,
  loadHistoryFromState,
  persistAppState,
} from "./store/historyStore";

export function bootstrapPersistence(): void {
  ensureDataDir();
  const state = loadAppState();
  const isNew = !state;
  if (state) {
    initializeUsersFromState(state.users);
    loadHistoryFromState(state.history);
  } else {
    initializeUsersFromState(null);
    loadHistoryFromState(null);
  }
  enableHistoryPersistence();
  if (isNew) {
    persistAppState();
  }
}
