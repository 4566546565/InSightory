import { db } from "@/lib/db";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Brain, FileText, Clock, Eye, ChevronRight, Search, Zap, BarChart3, BookOpen, TrendingUp, Scale, Target, Lightbulb, Star, MessageSquare, Scroll, Map, User, PenTool } from "lucide-react";

export const metadata = { title: "学法指导" };

const templateIcons: Record<string, typeof Brain> = {
  "原因/背景/条件类": Search,
  "影响/作用/意义/危害类": Zap,
  "特点/特征类": BarChart3,
  "措施/内容/表现类": FileText,
  "变化/发展/趋势类": TrendingUp,
  "比较/对比类": Scale,
  "目的/意图类": Target,
  "实质/本质类": Lightbulb,
  "评价/评述类": Star,
  "启示/认识/感悟类": MessageSquare,
  "观点评析/辨析类": Brain,
  "史料实证类": Scroll,
  "图表信息类": BarChart3,
  "历史人物评价类": User,
  "观点论证型": PenTool,
  "自拟论题型": PenTool,
  "关系探讨型": Scale,
};

const categoryColors: Record<string, string> = {
  "基础核心题型": "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800",
  "高频进阶题型": "bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800",
  "新高考特色题型": "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800",
  "历史小论文": "bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800",
};

const categoryBadgeColors: Record<string, string> = {
  "基础核心题型": "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  "高频进阶题型": "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  "新高考特色题型": "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  "历史小论文": "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
};

const categoryOrder = ["基础核心题型", "高频进阶题型", "新高考特色题型", "历史小论文"];

const otherCategoryIcons: Record<string, typeof Brain> = {
  "考试策略": GraduationCap,
  "记忆方法": Brain,
  "复习计划": Clock,
};

export default async function GuidesPage() {
  let guides: Array<{ id: string; title: string; category: string; tags: string[]; content: unknown }> = [];
  try {
    guides = await db.studyGuide.findMany({
      orderBy: { createdAt: "asc" },
    });
  } catch {
    guides = [];
  }

  // Separate template guides from other guides
  const templateGuides = guides.filter(g => categoryOrder.includes(g.category));
  const otherGuides = guides.filter(g => !categoryOrder.includes(g.category));

  // Group templates by category
  const grouped = categoryOrder.map(cat => ({
    category: cat,
    guides: templateGuides.filter(g => g.category === cat),
  })).filter(g => g.guides.length > 0);

  return (
    <div className="animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-serif text-foreground">学法指导</h1>
        <p className="text-muted-foreground mt-1">掌握科学的学习方法和应试技巧</p>
        <div className="pattern-divider w-16 mt-3" />
      </div>

      {/* Template Sections */}
      {grouped.map(({ category, guides }) => (
        <div key={category} className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-serif font-bold text-foreground">{category}</h2>
            <Badge variant="secondary" className={`text-[10px] ${categoryBadgeColors[category] || ""}`}>
              {guides.length}个模板
            </Badge>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {guides.map((guide) => {
              const Icon = templateIcons[guide.title] || FileText;
              const colorClass = categoryColors[category] || "";
              return (
                <Link key={guide.id} href={`/guides/${guide.id}`}>
                  <Card className={`card-hover border cursor-pointer group h-full overflow-hidden ${colorClass}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-white/80 dark:bg-black/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                          <Icon className="h-4.5 w-4.5 text-foreground/70" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors leading-snug">
                            {guide.title}
                          </h3>
                          {guide.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {guide.tags.slice(0, 2).map((tag) => (
                                <Badge key={tag} variant="outline" className="text-[9px] px-1 py-0">{tag}</Badge>
                              ))}
                            </div>
                          )}
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
      ))}

      {/* Other Guides */}
      {otherGuides.length > 0 && (
        <div className="mb-10">
          <h2 className="text-lg font-serif font-bold text-foreground mb-4">其他学习资料</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {otherGuides.map((guide) => {
              const Icon = otherCategoryIcons[guide.category] || FileText;
              return (
                <Link key={guide.id} href={`/guides/${guide.id}`}>
                  <Card className="card-hover border-0 shadow-card cursor-pointer group h-full overflow-hidden bg-card">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                          <Icon className="h-4.5 w-4.5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors leading-snug">
                            {guide.title}
                          </h3>
                          <Badge variant="secondary" className="text-[10px] mt-1.5">{guide.category}</Badge>
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
      )}
    </div>
  );
}
