"use client";

import { useState, useCallback } from "react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (content: string, mode: "tutor" | "figure" = "tutor", figure?: string) => {
      setError(null);
      const userMsg: ChatMessage = { role: "user", content };
      const updated = [...messages, userMsg];
      setMessages(updated);
      setStreaming(true);

      try {
        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: updated, mode, figure }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error?.message || "请求失败");
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error("无法读取响应");

        const decoder = new TextDecoder();
        let assistantContent = "";
        setMessages([...updated, { role: "assistant", content: "" }]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") break;
              try {
                const parsed = JSON.parse(data);
                assistantContent += parsed.text || "";
                setMessages([
                  ...updated,
                  { role: "assistant", content: assistantContent },
                ]);
              } catch {
                // partial chunk
              }
            }
          }
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "未知错误");
      } finally {
        setStreaming(false);
      }
    },
    [messages]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return { messages, streaming, error, sendMessage, clearMessages };
}
