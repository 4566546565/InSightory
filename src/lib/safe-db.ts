import { db } from "@/lib/db";

export async function safeQuery<T>(promise: Promise<T>): Promise<{ data: T | null; error: string | null }> {
  try {
    const data = await promise;
    return { data, error: null };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("Can't reach database server") || msg.includes("PrismaClientInitializationError")) {
      return { data: null, error: "数据库未连接，请在本地安装并启动 PostgreSQL" };
    }
    return { data: null, error: msg };
  }
}

export async function findMany<T>(promise: Promise<T[]>): Promise<T[]> {
  try {
    return await promise;
  } catch {
    return [];
  }
}

export async function findFirst<T>(promise: Promise<T | null>): Promise<T | null> {
  try {
    return await promise;
  } catch {
    return null;
  }
}
