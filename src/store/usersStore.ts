import type { User } from "../types";

const users: User[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    role: "user",
    createdAt: "2024-01-15",
  },
  {
    id: "admin-1",
    name: "Admin User",
    email: "admin@example.com",
    role: "admin",
    createdAt: "2024-01-10",
  },
];

export function getUsers(): User[] {
  return [...users];
}

export function findUserByEmail(email: string): User | undefined {
  return users.find((u) => u.email === email);
}

export function addUser(user: User): void {
  users.push(user);
}

export function updateUserById(
  id: string,
  updates: Partial<Pick<User, "name" | "email" | "role">>
): User | undefined {
  const i = users.findIndex((u) => u.id === id);
  if (i === -1) return undefined;
  users[i] = { ...users[i], ...updates };
  return users[i];
}

export function deleteUserById(id: string): boolean {
  const i = users.findIndex((u) => u.id === id);
  if (i === -1) return false;
  users.splice(i, 1);
  return true;
}
