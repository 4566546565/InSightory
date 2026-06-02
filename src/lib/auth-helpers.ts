import { auth } from "@/lib/auth";
import { UnauthorizedError, ForbiddenError } from "@/lib/errors";

export async function getCurrentUser() {
  try {
    const session = await auth();
    if (!session?.user) return null;
    return session.user as { id: string; email: string; name: string; role: string };
  } catch {
    return null;
  }
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();
  return user;
}

export async function requireRole(...roles: string[]) {
  const user = await requireAuth();
  if (!roles.includes(user.role)) throw new ForbiddenError();
  return user;
}
