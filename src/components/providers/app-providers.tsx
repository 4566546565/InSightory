"use client";

import { ThemeProvider } from "@/components/providers/theme-provider";
import { FontSizeProvider } from "@/components/providers/font-size-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "@/components/ui/toaster";
import { type ReactNode } from "react";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <FontSizeProvider>
        <QueryProvider>
          {children}
          <Toaster />
        </QueryProvider>
      </FontSizeProvider>
    </ThemeProvider>
  );
}
