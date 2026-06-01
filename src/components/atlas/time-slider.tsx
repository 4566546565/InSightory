"use client";

import { useAtlas, VIEW_YEAR_BOUNDS } from "./atlas-provider";
import { keyEvents } from "@/data/atlas/dynasties";
import { worldKeyEvents } from "@/data/atlas/exploration-routes";
import { Play, Pause, FastForward } from "lucide-react";

export function TimeSlider() {
  const { state, dispatch } = useAtlas();
  const { currentYear, isPlaying, playSpeed, view } = state;
  const { min: MIN_YEAR, max: MAX_YEAR } = VIEW_YEAR_BOUNDS[view];
  const activeKeyEvents = view === "china" ? keyEvents : worldKeyEvents;
  const pct = ((currentYear - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * 100;

  return (
    <div className="w-full bg-card border-b px-4 pt-3 pb-2">
      {/* 时间轴 */}
      <div className="relative h-10 mb-2">
        {/* 轴线 */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-px bg-border" />
        {/* 当前位置指示 */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-primary/40 -translate-x-1/2 z-10"
          style={{ left: `${pct}%` }}
        />
        {/* 事件标记 */}
        {activeKeyEvents.map((evt) => {
          const pos = ((evt.year - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * 100;
          return (
            <button
              key={`${evt.year}-${evt.label}`}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 group"
              style={{ left: `${pos}%` }}
              onClick={() => {
                dispatch({ type: "SET_YEAR", year: evt.year });
                dispatch({ type: "SELECT_DYNASTY", id: null });
                if ("event_id" in evt && evt.event_id) {
                  dispatch({ type: "SELECT_EVENT", id: `evt:${evt.event_id}` });
                }
                if (view === "china") {
                  dispatch({ type: "SET_LAYER", layer: "dynasty", value: true });
                }
                if (view === "world") {
                  dispatch({ type: "SET_LAYER", layer: "empire", value: true });
                }
              }}
            >
              {/* 竖线+圆点 */}
              <div className="flex flex-col items-center">
                <div className="w-px h-2.5 bg-muted-foreground/30 group-hover:bg-primary group-hover:h-4 transition-all" />
                <div className="w-2 h-2 rounded-full bg-background border-2 border-muted-foreground/40 group-hover:border-primary group-hover:bg-primary group-hover:scale-125 transition-all" />
              </div>
              {/* 悬浮提示 */}
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2.5 opacity-0 group-hover:opacity-100 transition-all duration-150 pointer-events-none group-hover:-translate-y-0 translate-y-1">
                <div className="bg-foreground text-background text-[11px] font-medium px-2.5 py-1 rounded-md whitespace-nowrap shadow-lg">
                  {evt.label}
                  <span className="ml-1.5 opacity-60 text-[10px]">
                    {evt.year < 0 ? `前${Math.abs(evt.year)}年` : `${evt.year}年`}
                  </span>
                </div>
                <div className="w-2 h-2 bg-foreground rotate-45 mx-auto -mt-1 rounded-sm" />
              </div>
            </button>
          );
        })}
      </div>

      {/* 滑块控制行 */}
      <div className="flex items-center gap-3">
        {/* 播放/暂停 */}
        <button
          className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity shrink-0"
          onClick={() => dispatch({ type: "TOGGLE_PLAY" })}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
        </button>

        {/* 速度切换 */}
        <button
          className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border border-border hover:bg-muted transition-colors shrink-0"
          onClick={() => dispatch({ type: "SET_SPEED", speed: playSpeed === 1 ? 5 : 1 })}
        >
          <FastForward className="h-3 w-3" />
          {playSpeed}年/秒
        </button>

        {/* 范围滑块 */}
        <div className="atlas-slider flex-1 relative">
          <input
            type="range"
            min={MIN_YEAR}
            max={MAX_YEAR}
            value={currentYear}
            onChange={(e) => dispatch({ type: "SET_YEAR", year: parseInt(e.target.value) })}
            className="w-full h-2 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, hsl(var(--primary)) ${pct}%, hsl(var(--muted)) ${pct}%)`,
            }}
          />
        </div>

        {/* 年份显示 */}
        <div className="text-lg font-bold font-mono text-primary min-w-[120px] text-right shrink-0">
          {currentYear < 0 ? `前${Math.abs(currentYear)}年` : `${currentYear}年`}
        </div>
      </div>
    </div>
  );
}
