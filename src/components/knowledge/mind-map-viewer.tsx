"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, Pencil, X, Check } from "lucide-react";

interface MindMapNode {
  content: string;
  children?: MindMapNode[];
}

function renderMarkmapJson(node: MindMapNode): string {
  function render(n: MindMapNode, level: number): string {
    const indent = "  ".repeat(level);
    let md = `${indent}- ${n.content}\n`;
    if (n.children) {
      for (const child of n.children) {
        md += render(child, level + 1);
      }
    }
    return md;
  }
  return render(node, 0);
}

interface MarkmapInstance {
  setData: (data: unknown) => Promise<void>;
  fit: (maxScale?: number) => Promise<void>;
  rescale: (scale: number) => Promise<void>;
  svg: { selection: () => { call: (fn: unknown) => unknown } };
  state: { scale: number };
  destroy: () => void;
}

export function MindMapViewer({ data }: { data: unknown }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const markmapRef = useRef<MarkmapInstance | null>(null);
  const transformerRef = useRef<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [dragging, setDragging] = useState(false);
  const [editing, setEditing] = useState(false);
  const [markdown, setMarkdown] = useState("");
  const originalMarkdownRef = useRef("");

  // Initialize markdown from data
  useEffect(() => {
    // Handle case where data might be a JSON string
    let parsedData = data;
    if (typeof data === "string") {
      try { parsedData = JSON.parse(data); } catch { /* keep as-is */ }
    }
    if (parsedData && typeof parsedData === "object" && "content" in (parsedData as MindMapNode)) {
      const md = renderMarkmapJson(parsedData as MindMapNode);
      setMarkdown(md);
      originalMarkdownRef.current = md;
    }
  }, [data]);

  const getCurrentScale = useCallback(() => {
    const mm = markmapRef.current;
    if (!mm) return 1;
    try {
      // d3-zoom stores transform on the SVG element as __zoom property
      const svgEl = svgRef.current as unknown as { __zoom?: { k: number } } | null;
      if (svgEl?.__zoom) return svgEl.__zoom.k;
      return mm.state?.scale || 1;
    } catch {
      return 1;
    }
  }, []);

  const handleZoomIn = useCallback(() => {
    const mm = markmapRef.current;
    if (!mm) return;
    const current = getCurrentScale();
    mm.rescale(Math.min(current * 1.3, 5));
  }, [getCurrentScale]);

  const handleZoomOut = useCallback(() => {
    const mm = markmapRef.current;
    if (!mm) return;
    const current = getCurrentScale();
    mm.rescale(Math.max(current / 1.3, 0.2));
  }, [getCurrentScale]);

  const handleReset = useCallback(() => {
    markmapRef.current?.fit();
  }, []);

  const handleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      container.requestFullscreen();
    }
  }, []);

  const handleApplyEdit = useCallback(() => {
    const mm = markmapRef.current;
    const transformer = transformerRef.current as { transform: (md: string) => { root: unknown } } | null;
    if (!mm || !transformer) return;

    try {
      const { root } = transformer.transform(markdown);
      mm.setData(root).then(() => mm.fit());
    } catch {
      // Invalid markdown, ignore
    }
  }, [markdown]);

  const handleResetEdit = useCallback(() => {
    setMarkdown(originalMarkdownRef.current);
    const mm = markmapRef.current;
    const transformer = transformerRef.current as { transform: (md: string) => { root: unknown } } | null;
    if (!mm || !transformer) return;
    const { root } = transformer.transform(originalMarkdownRef.current);
    mm.setData(root).then(() => mm.fit());
  }, []);

  // Initialize markmap
  useEffect(() => {
    // Handle case where data might be a JSON string
    let parsedData = data;
    if (typeof data === "string") {
      try { parsedData = JSON.parse(data); } catch { /* keep as-is */ }
    }

    if (!containerRef.current || !parsedData) {
      setLoading(false);
      return;
    }

    setLoading(true);
    let mm: MarkmapInstance | null = null;

    import("markmap-view").then(({ Markmap }) => {
      import("markmap-lib").then(({ Transformer }) => {
        const transformer = new Transformer();
        transformerRef.current = transformer;
        const node = parsedData as MindMapNode;
        const md = renderMarkmapJson(node);
        const { root } = transformer.transform(md);

        if (svgRef.current) {
          svgRef.current.innerHTML = "";
          mm = Markmap.create(svgRef.current) as unknown as MarkmapInstance;
          mm.setData(root);
          mm.fit();
          markmapRef.current = mm;
          setLoading(false);
        }
      });
    });

    return () => {
      if (mm) {
        try { mm.destroy(); } catch {}
      }
    };
  }, [data]);

  // Drag state tracking for cursor
  const handlePointerDown = useCallback(() => setDragging(true), []);
  const handlePointerUp = useCallback(() => setDragging(false), []);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    svg.addEventListener("pointerdown", handlePointerDown);
    svg.addEventListener("pointerup", handlePointerUp);
    svg.addEventListener("pointerleave", handlePointerUp);
    return () => {
      svg.removeEventListener("pointerdown", handlePointerDown);
      svg.removeEventListener("pointerup", handlePointerUp);
      svg.removeEventListener("pointerleave", handlePointerUp);
    };
  }, [handlePointerDown, handlePointerUp]);

  // Check if data is empty (handle both object and string)
  const hasData = data && (typeof data === "object" || (typeof data === "string" && data.length > 2));
  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-center">
        <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--muted))] flex items-center justify-center mb-4">
          <svg className="h-8 w-8 text-[hsl(var(--muted-foreground))]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        </div>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">思维导图数据为空</p>
        <p className="text-xs text-[hsl(var(--muted-foreground))]/60 mt-1">该课程暂无结构化知识点</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="mindmap-container relative">
      {/* Toolbar - always visible */}
      <div className="mindmap-toolbar">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleZoomIn} title="放大">
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleZoomOut} title="缩小">
          <ZoomOut className="h-4 w-4" />
        </Button>
        <div className="w-px h-4 bg-[hsl(var(--border))]" />
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleReset} title="重置视图">
          <RotateCcw className="h-4 w-4" />
        </Button>
        <div className="w-px h-4 bg-[hsl(var(--border))]" />
        <Button
          variant="ghost"
          size="icon"
          className={`h-8 w-8 ${editing ? "bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]" : ""}`}
          onClick={() => setEditing(!editing)}
          title="编辑思维导图"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleFullscreen} title="全屏">
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>

      {/* SVG Container */}
      <div
        className={`w-full h-[500px] overflow-hidden rounded-xl bg-[hsl(var(--background))] ${
          dragging ? "mindmap-dragging" : ""
        }`}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[hsl(var(--card))/0.8] z-10">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-[hsl(var(--primary))] border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-[hsl(var(--muted-foreground))]">加载思维导图...</span>
            </div>
          </div>
        )}
        <svg
          ref={svgRef}
          className="w-full h-full"
          style={{ touchAction: "none" }}
        />
      </div>

      {/* Edit Panel */}
      {editing && (
        <div className="mt-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden animate-fade-in-up">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30">
            <div className="flex items-center gap-2">
              <Pencil className="h-3.5 w-3.5 text-[hsl(var(--primary))]" />
              <span className="text-sm font-medium">编辑思维导图源文本</span>
            </div>
            <span className="text-[10px] text-[hsl(var(--muted-foreground))]">编辑仅在当前会话生效</span>
          </div>
          <textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            className="w-full h-48 p-4 text-sm font-mono bg-[hsl(var(--background))] text-[hsl(var(--foreground))] outline-none resize-y"
            spellCheck={false}
          />
          <div className="flex items-center justify-end gap-2 px-4 py-2.5 border-t border-[hsl(var(--border))] bg-[hsl(var(--muted))]/20">
            <Button variant="ghost" size="sm" onClick={handleResetEdit} className="gap-1.5">
              <RotateCcw className="h-3.5 w-3.5" />
              重置
            </Button>
            <Button size="sm" onClick={handleApplyEdit} className="gap-1.5">
              <Check className="h-3.5 w-3.5" />
              应用
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
