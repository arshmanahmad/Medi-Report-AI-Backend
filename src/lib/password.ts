import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

const SALT_LEN = 16;
const KEY_LEN = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(SALT_LEN);
  const hash = scryptSync(password, salt, KEY_LEN, { N: 16384, r: 8, p: 1 });
  return `${salt.toString("hex")}:${hash.toString("hex")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [saltHex, hashHex] = stored.split(":");
  if (!saltHex || !hashHex) return false;
  const salt = Buffer.from(saltHex, "hex");
  const expected = Buffer.from(hashHex, "hex");
  const test = scryptSync(password, salt, KEY_LEN, { N: 16384, r: 8, p: 1 });
  if (expected.length !== test.length) return false;
  return timingSafeEqual(expected, test);
}
