import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}分${s}秒` : `${s}秒`;
}

export function safeJsonParse<T>(json: unknown): T | null {
  if (typeof json === "object" && json !== null) return json as T;
  if (typeof json === "string") {
    try {
      return JSON.parse(json) as T;
    } catch {
      return null;
    }
  }
  return null;
}
