"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Sun, Moon, User, LogOut, Settings, Bell } from "lucide-react";
import { useTheme } from "next-themes";
import { useFontSize } from "@/components/providers/font-size-provider";

export function Topbar({ user }: { user?: { name?: string; email?: string; role?: string } | null }) {
  const router = useRouter();
  const { setTheme, theme } = useTheme();
  const { fontSize, setFontSize } = useFontSize();
  const [searchFocused, setSearchFocused] = useState(false);

  const initials = user?.name?.charAt(0) || "U";

  return (
    <header className="flex h-16 items-center gap-4 border-b bg-[hsl(var(--card))]/80 glass px-6">
      <div className="flex-1" />

      {/* Search */}
      <div className="relative">
        <div
          className={`flex items-center gap-2 rounded-xl border bg-[hsl(var(--muted))]/50 px-4 py-2.5 text-sm text-[hsl(var(--muted-foreground))] transition-all duration-300 ${
            searchFocused
              ? "w-96 border-[hsl(var(--primary))] bg-[hsl(var(--card))] shadow-lg ring-2 ring-[hsl(var(--primary))]/10"
              : "w-72 hover:border-[hsl(var(--primary))]/30 hover:bg-[hsl(var(--card))]"
          }`}
        >
          <Search className="h-4 w-4 shrink-0" />
          <input
            type="text"
            placeholder="搜索知识点、试题、史料..."
            className="flex-1 bg-transparent outline-none placeholder:text-[hsl(var(--muted-foreground))]"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] border border-[hsl(var(--border))] rounded px-1.5 py-0.5 bg-[hsl(var(--background))]">
            Ctrl+K
          </kbd>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-xl">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[hsl(var(--destructive))]" />
        </Button>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-xl"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        {/* Font Size */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-10 px-3 rounded-xl text-xs font-medium">
              <span className="mr-1">Aa</span>
              {fontSize === "sm" ? "小" : fontSize === "lg" ? "大" : "中"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuItem onClick={() => setFontSize("sm")}>小号字体</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFontSize("md")}>中号字体</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFontSize("lg")}>大号字体</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Divider */}
        <div className="w-px h-6 bg-[hsl(var(--border))]" />

        {/* User Menu */}
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-3 h-10 pl-2 pr-4 rounded-xl">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(220 60% 35%)] text-white text-xs font-medium">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium hidden sm:inline">{user.name}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/profile")} className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />个人中心
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/profile/settings")} className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />设置
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })} className="cursor-pointer text-[hsl(var(--destructive))]">
                <LogOut className="mr-2 h-4 w-4" />退出登录
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link href="/login">
            <Button className="h-10 px-5 rounded-xl font-medium">
              登录
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
}
