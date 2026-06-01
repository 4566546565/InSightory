"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, BookOpen, Target } from "lucide-react";
import { RichContent } from "@/components/knowledge/rich-content";

interface KeyConcept {
  term: string;
  definition: string;
}

interface Misconception {
  statement: string;
  correction: string;
}

export function KnowledgePointTabs({
  content,
  keyConcepts,
  misconceptions,
  examRequirements,
}: {
  content: unknown;
  keyConcepts: KeyConcept[] | null;
  misconceptions: Misconception[] | null;
  examRequirements: string | null;
}) {
  const [activeTab, setActiveTab] = useState("content");

  const tabs = [
    { value: "content", label: "核心内容", icon: <BookOpen className="h-4 w-4" /> },
    ...(keyConcepts && keyConcepts.length > 0 ? [{ value: "concepts", label: "重点概念", icon: null }] : []),
    ...(misconceptions && misconceptions.length > 0 ? [{ value: "misconceptions", label: "易错辨析", icon: <AlertTriangle className="h-4 w-4" /> }] : []),
    ...(examRequirements ? [{ value: "exam", label: "考情分析", icon: <Target className="h-4 w-4" /> }] : []),
  ];

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="w-full justify-start h-auto p-1.5 gap-1 bg-muted/60 rounded-xl">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-2 rounded-lg px-4 py-2 data-[state=active]:shadow-sm">
            {tab.icon}
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="content" className="mt-5">
        <Card className="border-0 shadow-card overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-primary via-primary/70 to-gold" />
          <CardContent className="pt-6 pb-8 px-8">
            <RichContent content={content} />
          </CardContent>
        </Card>
      </TabsContent>

      {keyConcepts && (
        <TabsContent value="concepts" className="mt-5">
          <div className="grid gap-4 md:grid-cols-2">
            {keyConcepts.map((kc, i) => (
              <Card key={i} className="card-hover border-0 shadow-card overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-primary/50 via-primary/30 to-transparent" />
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-serif flex items-center gap-2">
                    <span className="text-xs font-mono text-muted-foreground bg-muted rounded-md px-1.5 py-0.5">
                      {i + 1}
                    </span>
                    {kc.term}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">{kc.definition}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      )}

      {misconceptions && (
        <TabsContent value="misconceptions" className="mt-5">
          <div className="space-y-4">
            {misconceptions.map((mc, i) => (
              <Card key={i} className="border-0 shadow-card overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-amber-500/60 via-amber-400/30 to-transparent" />
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">误区 {i + 1}</span>
                      <span>{mc.statement}</span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-4 border border-green-200/50 dark:border-green-800/30">
                    <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">正确理解</p>
                    <p className="text-sm text-foreground leading-relaxed">{mc.correction}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      )}

      {examRequirements && (
        <TabsContent value="exam" className="mt-5">
          <Card className="border-0 shadow-card overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-primary/40 via-gold/30 to-transparent" />
            <CardHeader>
              <CardTitle className="text-lg font-serif flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                课标要求与考情分析
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/40 rounded-lg p-5">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {examRequirements}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      )}
    </Tabs>
  );
}
