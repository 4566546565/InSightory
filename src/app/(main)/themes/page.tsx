import { db } from "@/lib/db";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Zap, BarChart3, TrendingUp, Scale, Target, Lightbulb, Star, MessageSquare, Brain, BookOpen, Globe, FileText } from "lucide-react";

export const metadata = { title: "专题史贯通" };

const categoryLabels: Record<string, string> = {
  CHINESE: "中国史专题",
  WORLD: "世界史专题",
  COMPARISON: "中外对比专题",
};

const categoryDescriptions: Record<string, string> = {
  CHINESE: "政治制度演变、经济发展、思想文化、民族复兴等",
  WORLD: "世界市场形成、民主政治发展、国际格局演变、社会主义运动等",
  COMPARISON: "中外政治制度、工业化道路、思想文化、改革开放模式对比",
};

const categoryColors: Record<string, string> = {
  CHINESE: "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800",
  WORLD: "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800",
  COMPARISON: "bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800",
};

const categoryBadgeColors: Record<string, string> = {
  CHINESE: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  WORLD: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  COMPARISON: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
};

const categoryIcons: Record<string, typeof Brain> = {
  CHINESE: BookOpen,
  WORLD: Globe,
  COMPARISON: Scale,
};

const themeIcons: Record<string, typeof Brain> = {
  "中国古代政治制度演变": Target,
  "中国古代经济发展": TrendingUp,
  "中国传统文化主流思想演变": Lightbulb,
  "中国近现代民族复兴之路": Star,
  "中国共产党百年奋斗历程": Brain,
  "中国古代民族关系与边疆治理": Globe,
  "中国古代选官制度演变": Target,
  "中国近代社会生活变迁": MessageSquare,
  "资本主义世界市场的形成": TrendingUp,
  "近代西方民主政治的发展": Target,
  "两次世界大战与国际秩序演变": Zap,
  "十月革命与社会主义运动": Star,
  "经济全球化与区域集团化": BarChart3,
  "近代科学技术革命": Zap,
  "殖民地半殖民地人民的抗争": Star,
  "近代中外政治制度对比": Scale,
  "中外工业化道路对比": BarChart3,
  "中外思想文化对比": Lightbulb,
  "中外改革开放对比": MessageSquare,
  "中外科技发展对比": Zap,
  "中外法律制度对比": Scale,
};

export default async function ThemesPage() {
  let themes: Array<{
    id: string;
    title: string;
    category: string;
    description: string | null;
    eraStart: string | null;
    eraEnd: string | null;
    sortOrder: number;
    sections: Array<{ id: string }>;
  }> = [];

  try {
    themes = await db.theme.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        sections: { select: { id: true } },
      },
    });
  } catch {
    themes = [];
  }

  const grouped = ["CHINESE", "WORLD", "COMPARISON"].map((cat) => ({
    category: cat,
    label: categoryLabels[cat],
    description: categoryDescriptions[cat],
    themes: themes.filter((t) => t.category === cat),
  }));

  return (
    <div className="animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-serif text-foreground">专题史贯通</h1>
        <p className="text-muted-foreground mt-1">横向与纵向整合历史线索，构建系统性的历史认知框架</p>
        <div className="pattern-divider w-16 mt-3" />
      </div>

      {themes.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">暂无专题内容</p>
        </div>
      ) : (
        grouped.map(({ category, label, description, themes: catThemes }) => {
          if (catThemes.length === 0) return null;
          const CatIcon = categoryIcons[category] || Brain;

          return (
            <div key={category} className="mb-12">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  category === "CHINESE" ? "bg-red-100 dark:bg-red-900" :
                  category === "WORLD" ? "bg-blue-100 dark:bg-blue-900" :
                  "bg-purple-100 dark:bg-purple-900"
                }`}>
                  <CatIcon className={`h-5 w-5 ${
                    category === "CHINESE" ? "text-red-600 dark:text-red-400" :
                    category === "WORLD" ? "text-blue-600 dark:text-blue-400" :
                    "text-purple-600 dark:text-purple-400"
                  }`} />
                </div>
                <div>
                  <h2 className="text-xl font-serif font-bold text-foreground">{label}</h2>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </div>
                <Badge variant="secondary" className={`ml-auto text-[10px] ${categoryBadgeColors[category]}`}>
                  {catThemes.length}个专题
                </Badge>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mt-4">
                {catThemes.map((theme) => {
                  const Icon = themeIcons[theme.title] || FileText;
                  return (
                    <Link key={theme.id} href={`/themes/${theme.id}`}>
                      <Card className={`card-hover border cursor-pointer group h-full overflow-hidden ${categoryColors[category]}`}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-lg bg-white/80 dark:bg-black/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                              <Icon className="h-4.5 w-4.5 text-foreground/70" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors leading-snug">
                                {theme.title}
                              </h3>
                              {theme.description && (
                                <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                                  {theme.description}
                                </p>
                              )}
                              <div className="flex items-center gap-2 mt-2">
                                {theme.eraStart && theme.eraEnd && (
                                  <span className="text-[10px] text-muted-foreground">
                                    {theme.eraStart} — {theme.eraEnd}
                                  </span>
                                )}
                                <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                                  {theme.sections.length}个章节
                                </Badge>
                              </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
