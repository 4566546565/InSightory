"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Pencil, Eraser, ZoomIn, ZoomOut, RotateCcw, Maximize2,
  Undo2, Trash2,
} from "lucide-react";

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

interface DrawStroke {
  id: string;
  points: { x: number; y: number }[];
  color: string;
  width: number;
}

type ToolMode = "none" | "draw" | "erase";

const PALETTE = ["#ef4444", "#f97316", "#3b82f6", "#22c55e", "#a855f7", "#1e293b"];
const STROKE_WIDTHS = [2, 4, 7];

export function MindMapViewer({ data }: { data: unknown }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const drawCanvasRef = useRef<HTMLCanvasElement>(null);
  const markmapRef = useRef<MarkmapInstance | null>(null);
  const transformerRef = useRef<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [dragging, setDragging] = useState(false);

  // Drawing state
  const [tool, setTool] = useState<ToolMode>("none");
  const [color, setColor] = useState(PALETTE[2]);
  const [strokeWidthIdx, setStrokeWidthIdx] = useState(1);
  const [strokes, setStrokes] = useState<DrawStroke[]>([]);
  const [undoStack, setUndoStack] = useState<DrawStroke[][]>([]);
  const drawingRef = useRef<{ points: { x: number; y: number }[]; color: string; width: number } | null>(null);
  const erasingRef = useRef(false);

  // ── Initialize markmap ───────────────────────────────────────────────────

  useEffect(() => {
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

  // ── Resize drawing canvas to match SVG ───────────────────────────────────

  useEffect(() => {
    const svg = svgRef.current;
    const cvs = drawCanvasRef.current;
    if (!svg || !cvs) return;

    function sync() {
      const s = svgRef.current;
      const c = drawCanvasRef.current;
      if (!s || !c) return;
      const rect = s.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      c.width = rect.width * dpr;
      c.height = rect.height * dpr;
      c.style.width = `${rect.width}px`;
      c.style.height = `${rect.height}px`;
      const ctx = c.getContext("2d");
      if (ctx) ctx.scale(dpr, dpr);
    }

    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(svg);
    return () => ro.disconnect();
  }, []);

  // ── Redraw strokes when they change ──────────────────────────────────────

  const redrawStrokes = useCallback(() => {
    const cvs = drawCanvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cvs.width, cvs.height);

    for (const st of strokes) {
      if (st.points.length < 2) continue;
      ctx.strokeStyle = st.color;
      ctx.lineWidth = st.width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(st.points[0].x, st.points[0].y);
      if (st.points.length === 2) {
        ctx.lineTo(st.points[1].x, st.points[1].y);
      } else {
        for (let i = 1; i < st.points.length - 1; i++) {
          const mx = (st.points[i].x + st.points[i + 1].x) / 2;
          const my = (st.points[i].y + st.points[i + 1].y) / 2;
          ctx.quadraticCurveTo(st.points[i].x, st.points[i].y, mx, my);
        }
        const last = st.points[st.points.length - 1];
        ctx.lineTo(last.x, last.y);
      }
      ctx.stroke();
    }

    // Active drawing preview
    if (drawingRef.current && drawingRef.current.points.length >= 2) {
      const dr = drawingRef.current;
      ctx.strokeStyle = dr.color;
      ctx.lineWidth = dr.width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.globalAlpha = 0.7;
      ctx.beginPath();
      ctx.moveTo(dr.points[0].x, dr.points[0].y);
      for (let i = 1; i < dr.points.length - 1; i++) {
        const mx = (dr.points[i].x + dr.points[i + 1].x) / 2;
        const my = (dr.points[i].y + dr.points[i + 1].y) / 2;
        ctx.quadraticCurveTo(dr.points[i].x, dr.points[i].y, mx, my);
      }
      const last = dr.points[dr.points.length - 1];
      ctx.lineTo(last.x, last.y);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }, [strokes]);

  useEffect(() => {
    redrawStrokes();
  }, [strokes, redrawStrokes]);

  // ── Drawing canvas pointer handlers ──────────────────────────────────────

  function getCvsPos(e: React.PointerEvent) {
    const cvs = drawCanvasRef.current;
    if (!cvs) return { x: 0, y: 0 };
    const rect = cvs.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function onDrawPointerDown(e: React.PointerEvent) {
    if (tool === "none") return;
    e.stopPropagation();
    const cvs = drawCanvasRef.current;
    if (cvs) cvs.setPointerCapture(e.pointerId);
    const pos = getCvsPos(e);

    if (tool === "draw") {
      drawingRef.current = { points: [pos], color, width: STROKE_WIDTHS[strokeWidthIdx] };
    } else if (tool === "erase") {
      erasingRef.current = true;
      eraseAt(pos.x, pos.y);
    }
  }

  function onDrawPointerMove(e: React.PointerEvent) {
    if (tool === "none") return;
    const pos = getCvsPos(e);

    if (drawingRef.current) {
      drawingRef.current.points.push(pos);
      redrawStrokes();
      return;
    }

    if (erasingRef.current) {
      eraseAt(pos.x, pos.y);
    }
  }

  function onDrawPointerUp(e: React.PointerEvent) {
    if (tool === "none") return;
    const cvs = drawCanvasRef.current;
    if (cvs) cvs.releasePointerCapture(e.pointerId);
    erasingRef.current = false;

    if (drawingRef.current && drawingRef.current.points.length >= 2) {
      const dr = drawingRef.current;
      setUndoStack((prev) => [...prev, strokes]);
      setStrokes((prev) => [...prev, {
        id: `s${Date.now()}`,
        points: dr.points,
        color: dr.color,
        width: dr.width,
      }]);
    }
    drawingRef.current = null;
  }

  function eraseAt(x: number, y: number) {
    setStrokes((prev) => {
      const before = prev.length;
      const next = prev.filter((s) =>
        !s.points.some((p) => Math.abs(p.x - x) < 16 && Math.abs(p.y - y) < 16)
      );
      if (next.length < before) setUndoStack((u) => [...u, prev]);
      return next;
    });
  }

  // ── Toolbar actions ──────────────────────────────────────────────────────

  const handleZoomIn = useCallback(() => {
    markmapRef.current?.rescale((markmapRef.current.state?.scale || 1) * 1.3);
  }, []);

  const handleZoomOut = useCallback(() => {
    markmapRef.current?.rescale((markmapRef.current.state?.scale || 1) / 1.3);
  }, []);

  const handleReset = useCallback(() => {
    markmapRef.current?.fit();
  }, []);

  const handleFullscreen = useCallback(() => {
    const c = containerRef.current;
    if (!c) return;
    document.fullscreenElement ? document.exitFullscreen() : c.requestFullscreen();
  }, []);

  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setUndoStack((u) => u.slice(0, -1));
    setStrokes(prev);
  }, [undoStack]);

  const handleClearAll = useCallback(() => {
    if (strokes.length === 0) return;
    setUndoStack((u) => [...u, strokes]);
    setStrokes([]);
  }, [strokes]);

  // ── Sync drawing canvas offset with markmap pan/zoom ─────────────────────

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    // markmap uses d3-zoom, which stores the transform as __zoom on the SVG
    // We need to observe when the SVG transforms and re-offset our drawing canvas
    let lastTransform = "";

    function syncOffset() {
      const svgEl = svg as unknown as { __zoom?: { k: number; x: number; y: number } };
      const t = svgEl.__zoom;
      if (!t) return;
      const key = `${t.k},${t.x},${t.y}`;
      if (key === lastTransform) return;
      lastTransform = key;

      const cvs = drawCanvasRef.current;
      if (!cvs) return;
      // Offset the drawing canvas to match the SVG's d3-zoom transform
      cvs.style.transform = `translate(${t.x}px, ${t.y}px) scale(${t.k})`;
      cvs.style.transformOrigin = "0 0";
    }

    // Poll for transform changes (d3-zoom doesn't fire standard events)
    const iv = setInterval(syncOffset, 50);
    return () => clearInterval(iv);
  }, []);

  // ── Check empty ──────────────────────────────────────────────────────────

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

  const isDrawing = tool !== "none";

  return (
    <div ref={containerRef} className="mindmap-container relative">
      {/* Toolbar */}
      <div className="mindmap-toolbar">
        {/* Drawing tools */}
        <Button
          variant="ghost" size="icon" className="h-8 w-8"
          onClick={() => setTool(tool === "draw" ? "none" : "draw")}
          title={tool === "draw" ? "退出画笔" : "画笔涂鸦"}
        >
          <Pencil className={`h-4 w-4 ${tool === "draw" ? "text-[hsl(var(--primary))]" : ""}`} />
        </Button>
        <Button
          variant="ghost" size="icon" className="h-8 w-8"
          onClick={() => setTool(tool === "erase" ? "none" : "erase")}
          title={tool === "erase" ? "退出橡皮擦" : "橡皮擦"}
        >
          <Eraser className={`h-4 w-4 ${tool === "erase" ? "text-[hsl(var(--primary))]" : ""}`} />
        </Button>

        {/* Colors (visible when drawing) */}
        {isDrawing && (
          <>
            <div className="w-px h-4 bg-[hsl(var(--border))]" />
            {PALETTE.map((c) => (
              <button
                key={c}
                className={`h-4 w-4 rounded-full border-2 transition-all ${color === c ? "border-foreground scale-125" : "border-transparent hover:scale-110"}`}
                style={{ backgroundColor: c }}
                onClick={() => setColor(c)}
              />
            ))}
            <div className="w-px h-4 bg-[hsl(var(--border))]" />
            {STROKE_WIDTHS.map((w, i) => (
              <button
                key={w}
                className={`h-6 px-1.5 rounded text-[10px] font-medium transition-all ${strokeWidthIdx === i ? "bg-[hsl(var(--primary))] text-white" : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]"}`}
                onClick={() => setStrokeWidthIdx(i)}
              >
                {"细 中 粗".split(" ")[i]}
              </button>
            ))}
            <div className="w-px h-4 bg-[hsl(var(--border))]" />
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleUndo} title="撤销" disabled={undoStack.length === 0}>
              <Undo2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleClearAll} title="清除所有涂鸦" disabled={strokes.length === 0}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}

        {!isDrawing && <div className="flex-1" />}

        {/* Zoom controls - always visible */}
        {!isDrawing && (
          <>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleZoomIn} title="放大">
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleZoomOut} title="缩小">
              <ZoomOut className="h-4 w-4" />
            </Button>
            <div className="w-px h-4 bg-[hsl(var(--border))]" />
          </>
        )}

        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleReset} title="重置视图">
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleFullscreen} title="全屏">
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>

      {/* SVG Container (markmap renders here) */}
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
          style={{ touchAction: isDrawing ? "none" : undefined }}
        />

        {/* Drawing overlay canvas — sits on top of SVG */}
        <canvas
          ref={drawCanvasRef}
          className="absolute inset-0 w-full h-full pointer-events-auto"
          style={{
            cursor: tool === "draw" ? "crosshair" : tool === "erase" ? "cell" : "default",
            pointerEvents: isDrawing ? "auto" : "none",
            touchAction: "none",
          }}
          onPointerDown={onDrawPointerDown}
          onPointerMove={onDrawPointerMove}
          onPointerUp={onDrawPointerUp}
          onPointerLeave={onDrawPointerUp}
        />
      </div>

      {/* Mode indicator */}
      {isDrawing && (
        <div className="mt-2 text-center text-[10px] text-[hsl(var(--muted-foreground))]">
          {tool === "draw" && "🎨 画笔模式 — 在思维导图上自由涂鸦标注"}
          {tool === "erase" && "🧹 橡皮擦模式 — 点击或拖拽擦除涂鸦"}
        </div>
      )}
    </div>
  );
}
