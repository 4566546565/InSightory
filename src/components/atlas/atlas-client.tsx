"use client";

import { AtlasProvider } from "./atlas-provider";
import { TimeSlider } from "./time-slider";
import { AtlasMap, LayerControls } from "./atlas-map";
import { Map } from "lucide-react";

export default function AtlasClient() {
  return (
    <AtlasProvider>
      <div style={{ height: "calc(100vh - 4rem)", display: "flex", flexDirection: "column" }}>
        {/* 顶部标题栏 */}
        <div className="flex items-center gap-3 px-4 py-2 border-b shrink-0">
          <Map className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-bold font-serif">交互式历史地图集</h1>
          <span className="text-xs text-muted-foreground">基于部编版高中历史教材</span>
        </div>

        {/* 时间轴 */}
        <div className="shrink-0">
          <TimeSlider />
        </div>

        {/* 地图区域 */}
        <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
          <AtlasMap />
        </div>

        {/* 底部图层控制 */}
        <div className="shrink-0">
          <LayerControls />
        </div>
      </div>
    </AtlasProvider>
  );
}
