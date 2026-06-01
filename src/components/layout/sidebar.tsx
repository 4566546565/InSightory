"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  BookOpen, Lightbulb, FileText, Clock, Map, BookMarked,
  Headphones, FileQuestion, MessageSquare, GraduationCap, ChevronLeft, Sparkles,
  History,
} from "lucide-react";

const menuItems = [
  { href: "/knowledge", label: "同步知识库", icon: BookOpen },
  { href: "/themes", label: "专题史贯通", icon: Lightbulb },
  { href: "/sources", label: "史料实证库", icon: FileText },
  { href: "/timeline", label: "时空轴", icon: Clock },
  { href: "/atlas", label: "历史地图集", icon: Map },
  { href: "/practice", label: "试题练习", icon: FileQuestion },
  { href: "/lectures", label: "微课资源", icon: Headphones },
  { href: "/readings", label: "拓展阅读", icon: BookMarked },
  { href: "/guides", label: "学法指导", icon: GraduationCap },
  { href: "/community", label: "学习社区", icon: MessageSquare },
  { href: "/chat", label: "AI历史问答", icon: Sparkles },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <TooltipProvider delayDuration={300}>
      <aside
        className={cn(
          "flex flex-col transition-all duration-300 ease-in-out",
          collapsed ? "w-[72px]" : "w-64",
          "bg-[var(--sidebar)] text-[var(--sidebar-foreground)]"
        )}
      >
        {/* Brand */}
        <div className={cn("flex h-16 items-center border-b border-white/[0.08]", collapsed ? "justify-center px-2" : "px-5")}>
          <Link href="/" className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[hsl(var(--primary))]">
              <History className="h-5 w-5 text-white" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-base font-bold text-white tracking-tight">洞见历史</span>
                <span className="text-[10px] text-white/50 tracking-wider">INSIGHTORY</span>
              </div>
            )}
          </Link>
        </div>

        <div className="flex-1 py-4 overflow-y-auto custom-scrollbar">
          <nav className={cn("space-y-1", collapsed ? "px-2" : "px-3")}>
            {menuItems.map((item) => {
              const active = isActive(item.href);
              const link = (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn("sidebar-item", active && "active", collapsed && "justify-center px-2")}
                >
                  <item.icon className={cn("h-5 w-5 shrink-0", active && "text-white")} />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );

              if (collapsed) {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>{link}</TooltipTrigger>
                    <TooltipContent side="right" className="text-xs bg-[var(--sidebar)] text-white border-white/[0.08]">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                );
              }
              return link;
            })}

          </nav>
        </div>

        {/* Collapse toggle */}
        <div className="border-t border-white/[0.08] p-3">
          <Button
            variant="ghost"
            size="icon"
            className="w-full h-9 text-white/60 hover:text-white hover:bg-[var(--sidebar-accent)]"
            onClick={() => setCollapsed(!collapsed)}
          >
            <ChevronLeft className={cn("h-4 w-4 transition-transform duration-300", collapsed && "rotate-180")} />
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  );
}
