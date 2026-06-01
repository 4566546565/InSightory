"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@/hooks/use-chat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, User, Send, Sparkles, Trash2 } from "lucide-react";

const FIGURES = [
  { id: "qinshihuang", name: "秦始皇", dynasty: "秦朝" },
  { id: "zhangqian", name: "张骞", dynasty: "西汉" },
  { id: "washington", name: "华盛顿", dynasty: "美国" },
  { id: "napoleon", name: "拿破仑", dynasty: "法国" },
];

export default function ChatPage() {
  const { messages, streaming, error, sendMessage, clearMessages } = useChat();
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"tutor" | "figure">("tutor");
  const [figure, setFigure] = useState("qinshihuang");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || streaming) return;
    sendMessage(input, mode, figure);
    setInput("");
  }

  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-7rem)] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            AI 历史问答
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === "tutor" ? "向AI历史学习助手提问" : "与历史人物对话"}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={clearMessages} disabled={messages.length === 0}>
          <Trash2 className="h-4 w-4 mr-1" />清空对话
        </Button>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <Tabs value={mode} onValueChange={(v) => setMode(v as "tutor" | "figure")}>
          <TabsList>
            <TabsTrigger value="tutor">学习助手</TabsTrigger>
            <TabsTrigger value="figure">人物对话</TabsTrigger>
          </TabsList>
        </Tabs>

        {mode === "figure" && (
          <div className="flex gap-1">
            {FIGURES.map((f) => (
              <Button
                key={f.id}
                variant={figure === f.id ? "default" : "outline"}
                size="sm"
                onClick={() => setFigure(f.id)}
                className="text-xs"
              >
                {f.name}
              </Button>
            ))}
          </div>
        )}
      </div>

      <Card className="flex-1 flex flex-col min-h-0">
        <CardContent className="flex-1 min-h-0 pt-6">
          <ScrollArea className="h-full pr-4" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <Sparkles className="h-10 w-10 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium mb-2">
                  {mode === "tutor" ? "开始提问吧" : "选择一位历史人物开始对话"}
                </p>
                <p className="text-sm">
                  {mode === "tutor"
                    ? "试试问：分封制和宗法制有什么区别？"
                    : "试试问：你最重要的历史贡献是什么？"}
                </p>
              </div>
            ) : (
              <div className="space-y-4 pb-4">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
                  >
                    {msg.role === "assistant" && (
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className="bg-primary/10">
                          {mode === "figure" ? (
                            <User className="h-4 w-4" />
                          ) : (
                            <Bot className="h-4 w-4" />
                          )}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`rounded-lg px-4 py-2.5 max-w-[80%] text-sm whitespace-pre-wrap ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      {msg.content || (streaming && i === messages.length - 1 ? "..." : "")}
                    </div>
                    {msg.role === "user" && (
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                {error && (
                  <div className="text-center text-sm text-destructive py-2">{error}</div>
                )}
              </div>
            )}
          </ScrollArea>
        </CardContent>

        <div className="p-4 border-t">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                mode === "tutor"
                  ? "输入你的历史问题..."
                  : `向${FIGURES.find((f) => f.id === figure)?.name || ""}提问...`
              }
              disabled={streaming}
              className="flex-1"
            />
            <Button type="submit" disabled={!input.trim() || streaming}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
