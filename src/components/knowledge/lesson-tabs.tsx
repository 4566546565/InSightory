"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lightbulb, BookOpen, Network, Bookmark } from "lucide-react";
import { RichContent } from "@/components/knowledge/rich-content";
import { MindMapViewer } from "@/components/knowledge/mind-map-viewer";

interface LessonKP {
  id: string;
  title: string;
  difficulty: number;
  tags: string[];
  mindMapJson: unknown;
}

export function LessonTabs({
  content,
  summary,
  terms,
  mindMapData,
  knowledgePoints,
  textbookId,
  unitId,
  lessonId,
  lessonNumber,
}: {
  content: unknown;
  summary: string | null;
  terms: string[];
  mindMapData: unknown;
  knowledgePoints: LessonKP[];
  textbookId: string;
  unitId: string;
  lessonId: string;
  lessonNumber: number;
}) {
  const [activeTab, setActiveTab] = useState("content");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="w-full justify-start h-auto p-1.5 gap-1 bg-muted/60 rounded-xl">
        <TabsTrigger value="content" className="flex items-center gap-2 rounded-lg px-4 py-2 data-[state=active]:shadow-sm">
          <BookOpen className="h-4 w-4" />
          <span>课程内容</span>
        </TabsTrigger>
        <TabsTrigger value="mindmap" className="flex items-center gap-2 rounded-lg px-4 py-2 data-[state=active]:shadow-sm">
          <Network className="h-4 w-4" />
          <span>思维导图</span>
        </TabsTrigger>
        <TabsTrigger value="kps" className="flex items-center gap-2 rounded-lg px-4 py-2 data-[state=active]:shadow-sm">
          <Lightbulb className="h-4 w-4" />
          <span>知识点</span>
          <Badge variant="default" className="ml-0.5 text-[10px] px-1.5 py-0 h-5">{knowledgePoints.length}</Badge>
        </TabsTrigger>
      </TabsList>

      {/* Tab 1: Course Content */}
      <TabsContent value="content" className="mt-5">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-card overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-primary via-primary/70 to-gold" />
              <CardContent className="pt-6 pb-8 px-8">
                <RichContent content={content} />
              </CardContent>
            </Card>
          </div>
          <div className="space-y-5">
            <Card className="border-0 shadow-card overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-primary/40 via-primary/20 to-transparent" />
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Bookmark className="h-4 w-4 text-primary" />
                  关键术语
                </CardTitle>
              </CardHeader>
              <CardContent>
                {terms.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {terms.map((term) => (
                      <Badge key={term} variant="secondary" className="text-xs">{term}</Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">暂无</p>
                )}
              </CardContent>
            </Card>
            {knowledgePoints.length > 0 && (
              <Card className="border-0 shadow-card overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-primary/30 to-transparent" />
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-primary" />
                    知识点速览
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {knowledgePoints.slice(0, 5).map((kp) => (
                    <Link
                      key={kp.id}
                      href={`/knowledge/${textbookId}/${unitId}/${lessonId}/${kp.id}`}
                      className="flex items-center justify-between p-2.5 rounded-lg hover:bg-accent transition-colors group"
                    >
                      <span className="text-sm font-medium group-hover:text-primary transition-colors leading-snug truncate mr-2">
                        {kp.title}
                      </span>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {"★".repeat(kp.difficulty)}
                      </span>
                    </Link>
                  ))}
                  {knowledgePoints.length > 5 && (
                    <p className="text-xs text-muted-foreground text-center pt-1">
                      共 {knowledgePoints.length} 个知识点，点击"知识点"标签查看全部
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </TabsContent>

      {/* Tab 2: Mind Map */}
      <TabsContent value="mindmap" className="mt-5">
        <Card className="border-0 shadow-card overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-gold via-primary/60 to-primary/30" />
          <CardContent className="pt-6 pb-8">
            <div className="flex items-center gap-2 mb-4">
              <Network className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">第{lessonNumber}课 知识结构图</span>
            </div>
            <MindMapViewer data={mindMapData} />
          </CardContent>
        </Card>
      </TabsContent>

      {/* Tab 3: Knowledge Points */}
      <TabsContent value="kps" className="mt-5">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {knowledgePoints.map((kp, i) => (
            <Link
              key={kp.id}
              href={`/knowledge/${textbookId}/${unitId}/${lessonId}/${kp.id}`}
            >
              <Card className="card-hover border-0 shadow-card cursor-pointer group h-full overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-primary via-primary/70 to-gold" />
                <CardContent className="p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-xs font-mono text-muted-foreground bg-muted rounded-md px-1.5 py-0.5 shrink-0 mt-0.5">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="font-medium text-sm group-hover:text-primary transition-colors leading-snug">
                      {kp.title}
                    </h3>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {kp.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-[10px] px-1.5">{tag}</Badge>
                      ))}
                    </div>
                    <span className="text-xs gold-text shrink-0">
                      {"★".repeat(kp.difficulty)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
}
