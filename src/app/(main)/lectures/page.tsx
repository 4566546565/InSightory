"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Play, BookOpen, X } from "lucide-react";

const textbooks = [
  {
    title: "高中历史速通",
    desc: "快速梳理高中历史核心脉络",
    icon: "⚡",
    color: "from-red-500 to-orange-500",
    bg: "bg-red-50 dark:bg-red-950/50",
    bvid: "BV1F3jtzqEvj",
    cid: "30122116060",
    aid: "114561189420335",
  },
  {
    title: "中外历史纲要（上）",
    desc: "中国古代史至近现代史",
    icon: "📜",
    color: "from-blue-500 to-blue-600",
    bg: "bg-blue-50 dark:bg-blue-950/50",
    bvid: "BV1NM4m1C7yG",
    cid: "1541988513",
    aid: "1304432149",
  },
  {
    title: "中外历史纲要（下）",
    desc: "世界史与中国近现代史",
    icon: "🌍",
    color: "from-amber-500 to-orange-500",
    bg: "bg-amber-50 dark:bg-amber-950/50",
    bvid: "BV1Kb421H7Uj",
    cid: "1581558423",
    aid: "1805670381",
  },
  {
    title: "历史选择性必修1",
    desc: "国家制度与社会治理",
    icon: "🏛️",
    color: "from-emerald-500 to-teal-500",
    bg: "bg-emerald-50 dark:bg-emerald-950/50",
    bvid: "BV1kzSyYZEqf",
    cid: "26596281023",
    aid: "113417822146814",
  },
  {
    title: "历史选择性必修2",
    desc: "经济与社会生活",
    icon: "💰",
    color: "from-violet-500 to-purple-500",
    bg: "bg-violet-50 dark:bg-violet-950/50",
    bvid: "BV1HX4y1k7Ev",
    cid: "1083643826",
    aid: "354536185",
  },
  {
    title: "历史选择性必修3",
    desc: "文化交流与传播",
    icon: "🎭",
    color: "from-rose-500 to-pink-500",
    bg: "bg-rose-50 dark:bg-rose-950/50",
    bvid: "BV1KjeBzdEZx",
    cid: "31892112261",
    aid: "115077508369578",
  },
];

export default function LecturesPage() {
  const [selected, setSelected] = useState<(typeof textbooks)[number] | null>(null);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">微课资源</h1>
      <p className="text-muted-foreground mb-8">5-15分钟重难点讲解，视频+音频，随时随地学习</p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {textbooks.map((tb) => (
          <button
            key={tb.bvid}
            onClick={() => setSelected(tb)}
            className="text-left group"
          >
            <div className={`relative overflow-hidden rounded-2xl p-5 ${tb.bg} border border-[hsl(var(--border))]/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300`}>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tb.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                <span className="text-xl">{tb.icon}</span>
              </div>
              <h3 className="font-semibold text-foreground mb-1 group-hover:text-[hsl(var(--primary))] transition-colors">{tb.title}</h3>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">{tb.desc}</p>
              <div className="flex items-center gap-1.5 mt-3 text-xs text-[hsl(var(--primary))] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                <Play className="h-3.5 w-3.5" />
                观看视频
              </div>
            </div>
          </button>
        ))}
      </div>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              {selected?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="px-6 pb-6">
            <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
              {selected && (
                <iframe
                  src={`https://player.bilibili.com/player.html?isOutside=true&aid=${selected.aid}&bvid=${selected.bvid}&cid=${selected.cid}&p=1&autoplay=0&high_quality=1`}
                  style={{ border: "none", overflow: "hidden" }}
                  allowFullScreen
                  className="w-full h-full"
                />
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-3">{selected?.desc}</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
