import Link from "next/link";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, FileText, FileQuestion, ArrowRight, Sparkles, MapIcon, Calendar, GraduationCap, Network } from "lucide-react";

export const dynamic = "force-dynamic";

async function getHomeData() {
  try {
    const today = new Date();
    const [todayEvents, textbooks] = await Promise.all([
      db.todayInHistory.findMany({ where: { month: today.getMonth() + 1, day: today.getDate() }, take: 3 }),
      db.textbook.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    ]);
    return { todayEvents, textbooks, dbError: false };
  } catch {
    return { todayEvents: [], textbooks: [], dbError: true };
  }
}

const textbookIcons: Record<string, string> = {
  "纲要（上）": "📜",
  "纲要（下）": "🌍",
  "必修1": "🏛️",
  "必修2": "💰",
  "必修3": "🎭",
};

export default async function HomePage() {
  const today = new Date();
  const { todayEvents, textbooks } = await getHomeData();

  return (
    <div className="animate-fade-in-up">
      {/* ── Hero ──────────────────────────────── */}
      <section className="relative -mx-6 -mt-6 mb-12 overflow-hidden rounded-b-3xl">
        <div className="hero-gradient absolute inset-0" />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        <div className="relative z-10 mx-auto max-w-4xl px-6 py-20 text-center">
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white/80 text-sm mb-6 backdrop-blur-sm border border-white/10">
              <Sparkles className="h-3.5 w-3.5" />
              基于部编版高中历史教材
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white font-serif tracking-tight mb-4">
              洞见历史
            </h1>
            <p className="text-lg text-white/60 max-w-xl mx-auto mb-8 leading-relaxed">
              知识导图 · 时空轴 · 史料实证 · 智能练习
            </p>
            {/* Blue CTA Buttons */}
            <div className="flex items-center justify-center gap-4">
              <Link href="/knowledge">
                <Button size="lg" className="h-12 px-8 text-base font-semibold rounded-xl shadow-lg shadow-[hsl(var(--primary))]/30 hover:shadow-xl hover:shadow-[hsl(var(--primary))]/40 hover:scale-105 transition-all duration-300 gap-2">
                  <BookOpen className="h-5 w-5" />
                  开始学习
                </Button>
              </Link>
              <Link href="/practice">
                <Button size="lg" variant="secondary" className="h-12 px-8 text-base font-semibold rounded-xl bg-white/15 text-white border border-white/20 hover:bg-white/25 hover:scale-105 transition-all duration-300 gap-2 backdrop-blur-sm">
                  <FileQuestion className="h-5 w-5" />
                  试题练习
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* ── Quick Actions ────────────────────── */}
      <section className="mb-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { href: "/knowledge", icon: BookOpen, title: "同步知识库", desc: "按教材组织的知识体系", color: "from-blue-500 to-blue-600", bg: "bg-blue-50 dark:bg-blue-950/50" },
            { href: "/timeline", icon: Clock, title: "时空轴", desc: "中外对照大事年表", color: "from-amber-500 to-orange-500", bg: "bg-amber-50 dark:bg-amber-950/50" },
            { href: "/sources", icon: FileText, title: "史料实证", desc: "文献与图像史料库", color: "from-emerald-500 to-teal-500", bg: "bg-emerald-50 dark:bg-emerald-950/50" },
            { href: "/practice", icon: FileQuestion, title: "智能练习", desc: "随课练习与模拟考场", color: "from-rose-500 to-pink-500", bg: "bg-rose-50 dark:bg-rose-950/50" },
          ].map((item, i) => (
            <Link key={item.title} href={item.href} className="group" style={{ animationDelay: `${i * 0.08}s` }}>
              <div className={`relative overflow-hidden rounded-2xl p-5 ${item.bg} border border-[hsl(var(--border))]/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300`}>
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                  <item.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">{item.desc}</p>
                <ArrowRight className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Textbooks ─────────────────────────── */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold font-serif">同步教材</h2>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">覆盖高中三年全部历史教材</p>
          </div>
          <Link href="/knowledge">
            <Button variant="ghost" size="sm" className="gap-1 text-[hsl(var(--primary))]">
              查看全部 <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {textbooks.map((tb, i) => {
            const icon = Object.entries(textbookIcons).find(([key]) => tb.title.includes(key))?.[1] || "📚";
            return (
              <Link key={tb.id} href={`/knowledge/${tb.id}`} className="group" style={{ animationDelay: `${i * 0.06}s` }}>
                <div className="knowledge-card h-full rounded-2xl p-5 text-center cursor-pointer group-hover:scale-[1.02] transition-all duration-300">
                  <div className="w-14 h-14 rounded-2xl bg-[hsl(var(--muted))] group-hover:bg-[hsl(var(--primary))]/10 flex items-center justify-center mx-auto mb-3 transition-colors">
                    <span className="text-2xl">{icon}</span>
                  </div>
                  <h3 className="font-bold font-serif text-sm group-hover:text-[hsl(var(--primary))] transition-colors leading-tight">{tb.title}</h3>
                  {tb.subtitle && <p className="text-[11px] text-[hsl(var(--muted-foreground))] mt-1 line-clamp-1">{tb.subtitle}</p>}
                  <Badge variant="secondary" className="text-[10px] mt-2 px-2 py-0.5 rounded-md">{tb.volume}</Badge>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Today in History ──────────────────── */}
      {todayEvents.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold font-serif flex items-center gap-2">
                <Calendar className="h-6 w-6 text-[hsl(var(--primary))]" />
                历史上的今天
              </h2>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">{today.getMonth() + 1}月{today.getDate()}日</p>
            </div>
            <Link href="/timeline">
              <Button variant="ghost" size="sm" className="gap-1">
                时空轴 <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {todayEvents.map((event, i) => (
              <div key={event.id} className="knowledge-card rounded-2xl overflow-hidden animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="flex">
                  <div className="date-stamp rounded-none rounded-br-xl w-16">
                    <span className="date-stamp-month">{today.getMonth() + 1}月</span>
                    <span className="date-stamp-day">{today.getDate()}</span>
                  </div>
                  <div className="flex-1 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={event.category === "CHINA" ? "default" : "secondary"} className="text-[10px] px-1.5 py-0 h-5">
                        {event.category === "CHINA" ? "中国" : "世界"}
                      </Badge>
                      {event.year && <span className="text-xs text-[hsl(var(--muted-foreground))]">{event.year}年</span>}
                    </div>
                    <h3 className="font-semibold font-serif text-sm leading-snug">{event.title}</h3>
                    {event.description && <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1.5 line-clamp-2 leading-relaxed">{event.description}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Features Grid ─────────────────────── */}
      <section className="mb-8">
        <div className="section-alt -mx-6 px-6 py-12 rounded-2xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold font-serif mb-2">为什么选择洞见历史</h2>
            <div className="pattern-divider w-20 mx-auto" />
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
            {[
              { icon: Network, title: "知识结构化", desc: "每课配套思维导图，理清历史脉络与逻辑关系" },
              { icon: Clock, title: "时空定位", desc: "中外对照时间轴，建立全球史观与时空观念" },
              { icon: FileText, title: "史料实证", desc: "原始文献与图像史料，培养历史解释能力" },
              { icon: GraduationCap, title: "学法指导", desc: "答题技巧与学习方法，提升历史学科素养" },
              { icon: FileQuestion, title: "智能练习", desc: "随课练习与错题本，精准定位薄弱环节" },
              { icon: Sparkles, title: "AI问答", desc: "智能历史问答助手，随时解答学习疑问" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-[hsl(var(--card))]/60">
                <div className="w-10 h-10 rounded-xl bg-[hsl(var(--primary))]/10 flex items-center justify-center shrink-0">
                  <item.icon className="h-5 w-5 text-[hsl(var(--primary))]" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
