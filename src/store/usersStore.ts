import type { User } from "../types";
import { hashPassword } from "../lib/password";
import { buildSeedStoredUsers } from "../seed/accounts";

export type StoredUser = User & { passwordHash: string };

let users: StoredUser[] = [];

function seedDefaultUsers(): void {
  users = buildSeedStoredUsers();
}

export function initializeUsersFromState(list: StoredUser[] | null): void {
  if (list && list.length > 0) {
    users = list.filter(
      (u) =>
        u &&
        typeof u.passwordHash === "string" &&
        u.passwordHash.includes(":")
    );
    if (users.length === 0) {
      seedDefaultUsers();
    }
    return;
  }
  seedDefaultUsers();
}

export function getUsersForPersistence(): StoredUser[] {
  return users.map((u) => ({ ...u }));
}

export function getUsers(): User[] {
  return users.map(toPublicUser);
}

export function toPublicUser(u: StoredUser): User {
  const { passwordHash: _, ...rest } = u;
  return rest;
}

export function findStoredUserByEmail(email: string): StoredUser | undefined {
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function findUserByEmail(email: string): User | undefined {
  const u = findStoredUserByEmail(email);
  return u ? toPublicUser(u) : undefined;
}

export function addUser(user: User, password: string): void {
  const stored: StoredUser = {
    ...user,
    passwordHash: hashPassword(password),
  };
  users.push(stored);
}

export function updateUserById(
  id: string,
  updates: Partial<Pick<User, "name" | "email" | "role">>
): User | undefined {
  const i = users.findIndex((u) => u.id === id);
  if (i === -1) return undefined;
  users[i] = { ...users[i], ...updates };
  return toPublicUser(users[i]);
}

export function deleteUserById(id: string): boolean {
  const i = users.findIndex((u) => u.id === id);
  if (i === -1) return false;
  users.splice(i, 1);
  return true;
}
