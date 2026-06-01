import type { Metadata } from "next";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { FontSizeProvider } from "@/components/providers/font-size-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "洞见历史 - 高中历史学习平台",
    template: "%s | 洞见历史",
  },
  description: "基于部编版高中历史教材的同步学习平台，提供知识导图、时空轴、史料实证、智能练习等学习工具",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <FontSizeProvider>
            <QueryProvider>
              {children}
              <Toaster />
            </QueryProvider>
          </FontSizeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
