"use client";

import { useState, useEffect } from "react";
import AtlasClient from "./atlas-client";

export default function AtlasDynamic() {
  const [ready, setReady] = useState(false);
  useEffect(() => { setReady(true); }, []);

  if (!ready) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">加载地图中...</p>
        </div>
      </div>
    );
  }

  return <AtlasClient />;
}
