import { jwtDecrypt } from "jose";
import { hkdf } from "@panva/hkdf";

export interface SessionUser {
  id: string;
  role: string;
}

// Derive the encryption key the same way NextAuth does: HKDF with cookie name as salt
async function getDerivedEncryptionKey(secret: string, salt: string) {
  return await hkdf("sha256", secret, salt, `Auth.js Generated Encryption Key (${salt})`, 64);
}

export async function getSessionFromCookie(
  cookieHeader: string | null | undefined
): Promise<SessionUser | null> {
  if (!cookieHeader) return null;

  const match = cookieHeader.match(/(?:__Secure-)?authjs\.session-token=([^;]+)/);
  if (!match) return null;

  const secret = process.env.AUTH_SECRET;
  if (!secret) return null;

  try {
    const salt = "authjs.session-token";
    const encryptionKey = await getDerivedEncryptionKey(secret, salt);
    const { payload } = await jwtDecrypt(match[1], encryptionKey, {
      keyManagementAlgorithms: ["dir"],
      contentEncryptionAlgorithms: ["A256CBC-HS512", "A256GCM"],
      clockTolerance: 15,
    });
    if (payload.id && payload.role) {
      return { id: payload.id as string, role: payload.role as string };
    }
    return null;
  } catch {
    return null;
  }
}
