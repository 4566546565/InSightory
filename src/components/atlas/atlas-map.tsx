"use client";

import { useEffect, useRef, useCallback } from "react";
import { useAtlas } from "./atlas-provider";
import { dynasties, keyEvents } from "@/data/atlas/dynasties";
import { warRoutes } from "@/data/atlas/war-routes";
import { tradeNetworks } from "@/data/atlas/trade-networks";
import { worldEmpires } from "@/data/atlas/world-empires";
import { explorationRoutes } from "@/data/atlas/exploration-routes";
import { chinaRoutes } from "@/data/atlas/china-routes";
import { allEvents, type EventDetail } from "@/data/atlas/events";
import ReactMarkdown from "react-markdown";
import "leaflet/dist/leaflet.css";

// ─── 模块级 Leaflet 缓存 ─────────────────────────
let L: any = null;

async function getLeaflet() {
  if (!L) L = (await import("leaflet")).default;
  return L;
}

// ─── GeoJSON 重心计算 ──────────────────────────────
function getGeojsonCentroid(geojson: any): [number, number] | null {
  try {
    let coords: number[][] = [];
    if (geojson.type === "MultiPolygon") {
      coords = geojson.coordinates[0][0];
    } else if (geojson.type === "Polygon") {
      coords = geojson.coordinates[0];
    }
    if (!coords || coords.length === 0) return null;
    const sum = coords.reduce((acc, c) => [acc[0] + c[0], acc[1] + c[1]], [0, 0]);
    return [sum[0] / coords.length, sum[1] / coords.length];
  } catch { return null; }
}

// ─── 国家名称 → 近似坐标 ──────────────────────────
const COUNTRY_COORDS: Record<string, [number, number]> = {
  "英国": [-2, 54], "法国": [2, 46], "德国": [10, 51], "西班牙": [-4, 40],
  "葡萄牙": [-8, 39], "荷兰": [5, 52], "意大利": [12, 42], "俄罗斯": [40, 60],
  "美国": [-97, 38], "日本": [138, 36], "中国": [105, 35], "印度": [78, 22],
  "土耳其": [35, 39], "埃及": [30, 27], "巴西": [-51, -10], "墨西哥": [-102, 23],
  "阿根廷": [-64, -34], "哥伦比亚": [-72, 4], "秘鲁": [-76, -10],
  "古巴": [-79, 22], "菲律宾": [122, 12], "印度尼西亚": [117, -2],
  "澳大利亚": [134, -25], "加拿大": [-106, 56], "南非": [24, -29],
  "肯尼亚": [38, 1], "坦桑尼亚": [35, -6], "纳米比亚": [18, -22],
  "喀麦隆": [12, 6], "缅甸": [96, 20], "马来西亚": [109, 4],
  "莫桑比克": [35, -18], "安哥拉": [18, -12], "阿尔及利亚": [3, 28],
  "越南": [106, 16], "老挝": [103, 18], "柬埔寨": [105, 13],
  "塞内加尔": [-14, 14], "马里": [-4, 17], "马达加斯加": [47, -19],
  "波兰": [20, 52], "芬兰": [26, 64], "乌克兰": [32, 49],
  "格鲁吉亚": [44, 42], "苏里南": [-56, 4], "朝鲜": [127, 40],
  "中国（东北）": [126, 43], "台湾": [121, 24], "香港": [114, 22],
  "孟加拉国": [90, 24], "巴基斯坦": [69, 30], "利比亚": [17, 27],
  "突尼斯": [9, 34], "叙利亚": [38, 35], "伊拉克": [44, 33],
  "希腊": [22, 39], "保加利亚": [25, 43], "罗马尼亚": [25, 46],
  "美国（北美十三殖民地）": [-77, 38], "德国（普鲁士）": [13, 52],
  "苏联": [40, 60], "奥匈帝国": [16, 48],
  "非洲": [20, 5], "美洲": [-60, 15],
  "东南亚": [105, 10], "波斯湾": [50, 27], "东非": [38, 0],
  "中国（明朝）": [105, 35],
};

// ─── 瓦片源配置 ──────
const TIANDITU_KEY = process.env.NEXT_PUBLIC_TIANDITU_KEY || "";
const TIANDITU_SUBS = ["0", "1", "2", "3", "4", "5", "6", "7"];
const TDT_BASE = "https://t{s}.tianditu.gov.cn";
// 中国视角：天地图（vec_w 底图 + cva_w 中文标注）
const TILE_CHINA_BASE = {
  url: `${TDT_BASE}/vec_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILECOL={x}&TILEROW={y}&TILEMATRIX={z}&tk=${TIANDITU_KEY}`,
  opts: { maxZoom: 18, subdomains: TIANDITU_SUBS },
};
const TILE_CHINA_LABEL = {
  url: `${TDT_BASE}/cva_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cva&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILECOL={x}&TILEROW={y}&TILEMATRIX={z}&tk=${TIANDITU_KEY}`,
  opts: { maxZoom: 18, subdomains: TIANDITU_SUBS },
};
// 世界视角：天地图（vec_w 底图 + cva_w 标注）
const TILE_WORLD_BASE = {
  url: `${TDT_BASE}/vec_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILECOL={x}&TILEROW={y}&TILEMATRIX={z}&tk=${TIANDITU_KEY}`,
  opts: { maxZoom: 18, subdomains: TIANDITU_SUBS },
};
const TILE_WORLD_LABEL = {
  url: `${TDT_BASE}/cva_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cva&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILECOL={x}&TILEROW={y}&TILEMATRIX={z}&tk=${TIANDITU_KEY}`,
  opts: { maxZoom: 18, subdomains: TIANDITU_SUBS },
};

// ─── ViewToggle ────────────────────────────────────
export function ViewToggle() {
  const { state, dispatch } = useAtlas();
  return (
    <div className="flex gap-1 bg-card rounded-lg p-1 border shadow-sm">
      {(["china", "world"] as const).map((v) => (
        <button
          key={v}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            state.view === v
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted"
          }`}
          onClick={() => {
            dispatch({ type: "SELECT_DYNASTY", id: null });
            dispatch({ type: "SET_VIEW", view: v });
          }}
        >
          {v === "china" ? "中国视角" : "世界视角"}
        </button>
      ))}
    </div>
  );
}

// ─── LayerControls ─────────────────────────────────
export function LayerControls() {
  const { state, dispatch } = useAtlas();
  const { currentYear, layers } = state;

  const activeDRaw = dynasties.filter((d) => currentYear >= d.start_year && currentYear <= d.end_year);
  const activeIds = new Set(activeDRaw.map((d) => d.id));
  const unconqueredD = activeDRaw.filter((d) => !d.conqueredBy || !activeIds.has(d.conqueredBy));
  const maxDPriority = Math.max(...unconqueredD.map((d) => d.priority ?? 0));
  const activeD = unconqueredD.filter((d) => (d.priority ?? 0) === maxDPriority);
  const activeW = warRoutes.filter((w) => currentYear >= w.start_year && currentYear <= w.end_year);
  const activeEmp = worldEmpires.filter((e) => currentYear >= e.start_year && currentYear <= e.end_year);
  const yearLabel = currentYear < 0 ? `前${Math.abs(currentYear)}年` : `${currentYear}年`;

  return (
    <div className="flex items-center justify-between px-4 py-2 border-t text-xs bg-card">
      <div className="flex items-center gap-4">
        <span className="font-mono font-bold text-primary">{yearLabel}</span>
        <span className="text-muted-foreground">
          政权: {activeD.length} | 战争: {activeW.length} | 帝国: {activeEmp.length}
        </span>
      </div>
      <div className="flex items-center gap-3">
        {(["dynasty", "war", "trade", "empire"] as const).map((key) => (
          <label key={key} className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={layers[key]}
              onChange={() => dispatch({ type: "TOGGLE_LAYER", layer: key })}
              className="rounded border-border text-primary"
            />
            <span>{key === "dynasty" ? "疆域" : key === "war" ? "战争" : key === "trade" ? "贸易" : "殖民帝国"}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

// ─── EventPanel ────────────────────────────────────
function findEventId(mapElementId: string): string | null {
  // 时间轴标记直接传入 evt:xxx 格式
  if (mapElementId.startsWith("evt:")) return mapElementId.slice(4);
  const d = dynasties.find((d) => d.id === mapElementId);
  if (d?.event_id) return d.event_id;
  const w = warRoutes.find((w) => w.id === mapElementId);
  if (w?.event_id) return w.event_id;
  const t = tradeNetworks.find((t) => t.id === mapElementId);
  if (t?.event_id) return t.event_id;
  const e = explorationRoutes.find((e) => e.id === mapElementId);
  if (e?.event_id) return e.event_id;
  const emp = worldEmpires.find((emp) => emp.id === mapElementId);
  if (emp?.event_id) return emp.event_id;
  return null;
}

function findRelatedMapElement(eventId: string): { id: string; year: number } | null {
  const d = dynasties.find((d) => d.event_id === eventId);
  if (d) return { id: d.id, year: d.start_year };
  const w = warRoutes.find((w) => w.event_id === eventId);
  if (w) return { id: w.id, year: w.start_year };
  const t = tradeNetworks.find((t) => t.event_id === eventId);
  if (t) return { id: t.id, year: t.start_year };
  const e = explorationRoutes.find((e) => e.event_id === eventId);
  if (e) return { id: e.id, year: e.start_year };
  const emp = worldEmpires.find((emp) => emp.event_id === eventId);
  if (emp) return { id: emp.id, year: emp.start_year };
  return null;
}

export function EventPanel() {
  const { state, dispatch } = useAtlas();
  const { selectedEventId } = state;
  const isOpen = !!selectedEventId;

  // 通过 event_id 查找解说数据
  let eventData: EventDetail | null = null;
  if (selectedEventId) {
    const eid = findEventId(selectedEventId);
    if (eid) {
      eventData = allEvents.find((e) => e.id === eid) ?? null;
    }
    // 如果没有关联事件数据，从地图元素自身构建基础数据
    // 用 strip 后的 eid 匹配，而非带 evt: 前缀的 selectedEventId
    const lookupId = eid ?? selectedEventId.replace(/^evt:/, "");
    if (!eventData) {
      const d = dynasties.find((d) => d.id === lookupId);
      if (d) {
        eventData = {
          id: d.id,
          title: d.name,
          year: d.start_year,
          background: `存续时间：${d.start_year}年 - ${d.end_year}年，首都：${d.capital.name}`,
          content: `## ${d.name}\n\n**存续时间**：${d.start_year}年 - ${d.end_year}年\n\n**首都**：${d.capital.name}`,
          source: d.source,
          related_events: [],
        };
      }
      const w = warRoutes.find((w) => w.id === lookupId);
      if (w) {
        eventData = {
          id: w.id,
          title: w.detail.title,
          year: w.start_year,
          background: w.name,
          content: w.detail.description,
          source: w.detail.source,
          related_events: [],
        };
      }
      const t = tradeNetworks.find((t) => t.id === lookupId);
      if (t) {
        eventData = {
          id: t.id,
          title: t.detail.title,
          year: t.start_year,
          background: t.name,
          content: t.detail.description,
          source: t.detail.source,
          related_events: [],
        };
      }
      const e = explorationRoutes.find((e) => e.id === lookupId);
      if (e) {
        eventData = {
          id: e.id,
          title: e.detail.title,
          year: e.start_year,
          background: `${e.explorer}的航行`,
          content: e.detail.description,
          source: e.detail.source,
          related_events: [],
        };
      }
      const emp = worldEmpires.find((emp) => emp.id === lookupId);
      if (emp) {
        eventData = {
          id: emp.id,
          title: emp.name,
          year: emp.start_year,
          background: `存续时间：${emp.start_year}年 - ${emp.end_year}年，首都：${emp.capital.name}`,
          content: `## ${emp.name}\n\n**存续时间**：${emp.start_year}年 - ${emp.end_year}年\n\n**首都**：${emp.capital.name}`,
          source: emp.source,
          related_events: [],
        };
      }
    }
  }

  const relatedEvents = eventData?.related_events
    ?.map((eid) => allEvents.find((e) => e.id === eid))
    .filter(Boolean) as EventDetail[] | undefined;

  const handleRelatedClick = (targetEvent: EventDetail) => {
    // 找到关联事件对应的地图元素，更新时间轴
    const mapEl = findRelatedMapElement(targetEvent.id);
    if (mapEl) {
      dispatch({ type: "SET_YEAR", year: mapEl.year });
      dispatch({ type: "SELECT_EVENT", id: mapEl.id });
    } else {
      // 没有对应地图元素时，通过 evt: 前缀直接打开事件解说面板
      dispatch({ type: "SET_YEAR", year: targetEvent.year });
      dispatch({ type: "SELECT_EVENT", id: `evt:${targetEvent.id}` });
    }
  };

  return (
    <div
      className="border-l bg-card overflow-hidden shrink-0 transition-all duration-300 ease-in-out"
      style={{
        width: isOpen ? "22rem" : "0rem",
        opacity: isOpen ? 1 : 0,
      }}
    >
      {eventData && (
        <div className="w-80 h-full flex flex-col">
          {/* 标题栏 */}
          <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
            <h3 className="font-bold text-base truncate pr-2">{eventData.title}</h3>
            <button
              className="text-muted-foreground hover:text-foreground text-lg leading-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted shrink-0"
              onClick={() => dispatch({ type: "SELECT_EVENT", id: null })}
            >
              &times;
            </button>
          </div>

          {/* 内容区 */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
            {/* 时间标签 */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {eventData.year < 0 ? `前${Math.abs(eventData.year)}年` : `${eventData.year}年`}
            </div>

            {/* 涉及国家 */}
            {eventData.countries && eventData.countries.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {eventData.countries.map((c) => (
                  <span key={c} className="inline-flex items-center px-2 py-0.5 rounded-md bg-gold/10 text-gold text-[11px] font-medium border border-gold/20">
                    {c}
                  </span>
                ))}
              </div>
            )}

            {/* 历史背景 */}
            {eventData.background && (
              <div className="rounded-lg bg-muted/50 px-3 py-2.5 border border-border/50">
                <p className="text-xs font-medium text-muted-foreground mb-1">历史背景</p>
                <p className="text-sm leading-relaxed">{eventData.background}</p>
              </div>
            )}

            {/* 详细解说 */}
            <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:mt-3 prose-headings:mb-2 prose-p:leading-relaxed prose-p:text-sm prose-strong:text-foreground">
              <ReactMarkdown>{eventData.content}</ReactMarkdown>
            </div>

            {/* 教材出处 */}
            <div className="rounded-lg bg-muted/30 px-3 py-2.5 border border-border/30">
              <p className="text-xs font-medium text-muted-foreground mb-1">教材出处</p>
              <p className="text-xs leading-relaxed text-muted-foreground">{eventData.source}</p>
            </div>

            {/* 相关事件链接 */}
            {relatedEvents && relatedEvents.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">相关事件</p>
                <div className="flex flex-wrap gap-1.5">
                  {relatedEvents.map((re) => (
                    <button
                      key={re.id}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border/50 bg-card hover:bg-muted text-xs font-medium transition-colors"
                      onClick={() => handleRelatedClick(re)}
                    >
                      <svg className="w-3 h-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                      </svg>
                      {re.title}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MapView ───────────────────────────────────────
function MapView() {
  const { state, dispatch } = useAtlas();
  const { currentYear, layers, view } = state;
  const mapRef = useRef<HTMLDivElement>(null);
  const mapRef2 = useRef<any>(null);
  const initRef = useRef(false);
  const layersRef = useRef<any>({ dynasty: [], war: [], trade: [], empire: [] });
  const eventRouteRef = useRef<any[]>([]);
  const tileRef = useRef<any>(null); // 当前激活的瓦片图层
  const stateRef = useRef({ currentYear, layers, view, selectedDynastyId: state.selectedDynastyId, selectedEventId: state.selectedEventId });
  stateRef.current = { currentYear, layers, view, selectedDynastyId: state.selectedDynastyId, selectedEventId: state.selectedEventId };

  const clearLayers = useCallback(() => {
    const map = mapRef2.current;
    if (!map) return;
    (["dynasty", "war", "trade", "empire"] as const).forEach((key) => {
      layersRef.current[key].forEach((layer: any) => {
        try { map.removeLayer(layer); } catch {}
      });
    });
    layersRef.current = { dynasty: [], war: [], trade: [], empire: [] };
  }, []);

  const clearEventRoutes = useCallback(() => {
    const map = mapRef2.current;
    if (!map) return;
    eventRouteRef.current.forEach((layer: any) => {
      try { map.removeLayer(layer); } catch {}
    });
    eventRouteRef.current = [];
  }, []);

  const renderLayers = useCallback(() => {
    const map = mapRef2.current;
    if (!map || !L) return;

    const { currentYear: cy, layers: ly, view: v, selectedDynastyId: selDid } = stateRef.current;
    clearLayers();

    // ═══════════════════════════════════════════════
    //  中国视角：朝代疆域 + 战争路线
    // ═══════════════════════════════════════════════
    if (v === "china") {
      // 疆域图层 — 支持单选：有选中朝代时只显示该朝代，否则按年份过滤
      if (ly.dynasty) {
        let dynastiesToShow: typeof dynasties;
        if (selDid) {
          dynastiesToShow = dynasties.filter((d) => d.id === selDid);
        } else {
          const activeD = dynasties.filter((d) => cy >= d.start_year && cy <= d.end_year);
          // 剔除被当前活跃朝代征服的政权
          const activeIds = new Set(activeD.map((d) => d.id));
          const unconquered = activeD.filter((d) => !d.conqueredBy || !activeIds.has(d.conqueredBy));
          const maxPriority = Math.max(...unconquered.map((d) => d.priority ?? 0));
          dynastiesToShow = unconquered.filter((d) => (d.priority ?? 0) === maxPriority);
        }
        dynastiesToShow.forEach((d) => {
            const yearLabel = (y: number) => y < 0 ? `前${Math.abs(y)}年` : `${y}年`;
            const tooltipHtml = `
              <div style="font-family:'Noto Serif SC',serif;text-align:center;line-height:1.5;min-width:80px">
                <div style="font-size:14px;font-weight:700;margin-bottom:2px">${d.name}</div>
                <div style="font-size:11px;opacity:0.8">${yearLabel(d.start_year)} — ${yearLabel(d.end_year)}</div>
                <div style="font-size:10px;opacity:0.65;margin-top:1px">都 ${d.capital.name}</div>
              </div>`;
            const geo = L.geoJSON(d.geojson as any, {
              style: { fillColor: d.color, fillOpacity: 0.35, color: d.color, weight: 4, opacity: 1 },
            }).addTo(map);
            geo.bindTooltip(tooltipHtml, {
              direction: "right",
              offset: [10, 0],
              className: "atlas-tooltip",
              opacity: 1,
            });
            geo.on("mouseover", function (this: any) {
              this.setStyle({ fillOpacity: 0.55, weight: 5 });
            });
            geo.on("mouseout", function (this: any) {
              this.setStyle({ fillOpacity: 0.35, weight: 4 });
            });
            geo.on("click", () => {
              dispatch({ type: "SET_YEAR", year: d.start_year });
              dispatch({ type: "SELECT_DYNASTY", id: d.id });
            });
            layersRef.current.dynasty.push(geo);

            const icon = L.divIcon({
              html: `<div style="background:${d.color};width:10px;height:10px;border-radius:50%;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4)"></div>`,
              className: "",
              iconSize: [10, 10],
              iconAnchor: [5, 5],
            });
            const marker = L.marker(d.capital.coords as [number, number], { icon })
              .addTo(map)
              .bindPopup(
                `<div style="text-align:center"><b>${d.capital.name}</b><br/><small style="color:#666">${d.name}首都</small></div>`
              );
            layersRef.current.dynasty.push(marker);
          });
      }

      // 战争图层
      if (ly.war) {
        warRoutes
          .filter((w) => cy >= w.start_year && cy <= w.end_year)
          .forEach((w) => {
            w.phases.forEach((phase) => {
              if ((phase.type === "march" || phase.type === "retreat") && phase.path) {
                const color = phase.type === "retreat" ? "#999" : "#e74c3c";
                const pl = L.polyline(phase.path, {
                  color,
                  weight: 3,
                  dashArray: phase.type === "retreat" ? "5, 10" : undefined,
                }).addTo(map);
                pl.on("click", () => {
                  dispatch({ type: "SET_YEAR", year: w.start_year });
                  dispatch({ type: "SELECT_EVENT", id: w.id });
                });
                pl.bindPopup(`${w.name} - ${phase.name || ""}`);
                layersRef.current.war.push(pl);

                if (phase.type === "march" && phase.path.length >= 2) {
                  const arrow = L.divIcon({
                    html: `<div style="color:${color};font-size:14px;text-shadow:0 1px 2px rgba(0,0,0,0.5)">&#9654;</div>`,
                    className: "",
                    iconSize: [14, 14],
                    iconAnchor: [7, 7],
                  });
                  const mid = Math.floor(phase.path.length / 2);
                  layersRef.current.war.push(
                    L.marker(phase.path[mid], { icon: arrow, interactive: false }).addTo(map)
                  );
                }
              }
              if (phase.type === "battle" && phase.point) {
                const icon = L.divIcon({
                  html: `<div style="color:#e74c3c;font-size:18px;text-shadow:0 1px 3px rgba(0,0,0,0.4)">&#9876;</div>`,
                  className: "",
                  iconSize: [18, 18],
                  iconAnchor: [9, 9],
                });
                const m = L.marker(phase.point, { icon }).addTo(map);
                m.on("click", () => {
                  dispatch({ type: "SET_YEAR", year: w.start_year });
                  dispatch({ type: "SELECT_EVENT", id: phase.event_id || w.id });
                });
                m.bindPopup(
                  `<div style="text-align:center"><b style="color:#e74c3c">&#9876; ${phase.name}</b><br/><small>${w.name}</small></div>`
                );
                layersRef.current.war.push(m);
              }
            });
          });
      }
    }

    // ═══════════════════════════════════════════════
    //  世界视角：根据选中事件过滤显示
    // ═══════════════════════════════════════════════
    if (v === "world") {
      const selEvt = stateRef.current.selectedEventId;
      const explorationIds = new Set(["columbus", "dias", "vasco-da-gama", "magellan"]);
      const selExplorationId = selEvt ? selEvt.replace(/^evt:/, "") : null;
      const isExplorationEvt = selExplorationId ? explorationIds.has(selExplorationId) : false;

      // ── 探险航线（点击某条航线时间点时只显示该航线）──
      const showExploration = !selEvt || isExplorationEvt;
      if (showExploration && ly.trade) {
        const routesToShow = isExplorationEvt
          ? explorationRoutes.filter((r) => r.id === selExplorationId)
          : explorationRoutes.filter((r) => cy >= r.start_year && cy <= r.end_year);
        routesToShow.forEach((r) => {
          r.routes.forEach((route, ri) => {
            const latlngs = route.path.map(([lng, lat]) => [lat, lng] as [number, number]);
            const pl = L.polyline(latlngs, {
              color: "#e67e22", weight: 3, opacity: 0.8, dashArray: "8, 6",
            }).addTo(map);
            pl.bindPopup(`<b>${r.name}</b>（${r.explorer}）<br/><small>${r.start_year}年</small>`);
            layersRef.current.trade.push(pl);

            // 航线名称标签（只在第一段航线中点显示）
            if (ri === 0) {
              const midIdx = Math.floor(latlngs.length / 2);
              const mid = latlngs[midIdx];
              const labelIcon = L.divIcon({
                html: `<div style="background:rgba(230,126,34,0.9);color:#fff;padding:2px 8px;border-radius:10px;font-size:12px;font-weight:bold;white-space:nowrap;box-shadow:0 1px 4px rgba(0,0,0,0.3);pointer-events:none">${r.explorer}</div>`,
                className: "", iconSize: [0, 0], iconAnchor: [0, 14],
              });
              const label = L.marker(mid, { icon: labelIcon, interactive: false }).addTo(map);
              layersRef.current.trade.push(label);
            }
          });
          r.nodes.forEach((node) => {
            const icon = L.divIcon({
              html: `<div style="background:#fff;border:2px solid #e67e22;border-radius:50%;width:12px;height:12px;box-shadow:0 2px 4px rgba(0,0,0,0.3)"><div style="width:4px;height:4px;border-radius:50%;background:#e67e22;margin:3px auto"></div></div>`,
              className: "", iconSize: [12, 12], iconAnchor: [6, 6],
            });
            const [nlng, nlat] = node.coords;
            const m = L.marker([nlat, nlng], { icon, interactive: false }).addTo(map);
            m.bindTooltip(node.name, { permanent: true, direction: "top", offset: [0, -8], className: "atlas-tooltip" });
            layersRef.current.trade.push(m);
          });
        });
      }

      // ── 贸易路线（三角贸易等）──
      const showTrade = !selEvt || selEvt === "evt:triangle-trade";
      if (showTrade && ly.trade) {
        tradeNetworks
          .filter((t) => cy >= t.start_year && cy <= t.end_year)
          .forEach((t) => {
            t.routes.forEach((route) => {
              const color = route.type === "overland" ? "#f39c12" : "#3498db";
              const latlngs = route.path.map(([lng, lat]) => [lat, lng] as [number, number]);
              const pl = L.polyline(latlngs, { color, weight: 3, opacity: 0.8 }).addTo(map);
              pl.bindPopup(t.name);
              layersRef.current.trade.push(pl);
            });
            t.nodes.forEach((node) => {
              const borderColor = t.routes[0]?.type === "overland" ? "#f39c12" : "#3498db";
              const icon = L.divIcon({
                html: `<div style="background:#fff;border:2px solid ${borderColor};border-radius:50%;width:14px;height:14px;box-shadow:0 2px 6px rgba(0,0,0,0.4)"><div style="width:6px;height:6px;border-radius:50%;background:${borderColor};margin:2.5px auto"></div></div>`,
                className: "", iconSize: [14, 14], iconAnchor: [7, 7],
              });
              const [nlng, nlat] = node.coords;
              const m = L.marker([nlat, nlng], { icon, interactive: false }).addTo(map);
              m.bindTooltip(node.name, { permanent: true, direction: "top", offset: [0, -8], className: "atlas-tooltip" });
              layersRef.current.trade.push(m);
            });
          });
      }

      // ── 殖民帝国版图（只显示与当前事件关联的版图）──
      const showEmpire = !selEvt || (!isExplorationEvt && selEvt !== "evt:triangle-trade");
      if (showEmpire && ly.empire) {
        // 获取当前事件ID（去除evt:前缀）
        const currentEventId = selEvt ? selEvt.replace(/^evt:/, "") : null;

        worldEmpires
          .filter((e) => {
            // 基础时间过滤
            if (cy < e.start_year || cy > e.end_year) return false;

            // 如果有选中事件，只显示与该事件直接关联的帝国
            if (currentEventId && e.relatedEvents && e.relatedEvents.length > 0) {
              return e.relatedEvents.includes(currentEventId);
            }

            // 没有选中事件时，显示所有符合时间范围的帝国
            return !currentEventId;
          })
          .forEach((e) => {
            const geo = L.geoJSON(e.geojson as any, {
              style: { fillColor: e.color, fillOpacity: 0.35, color: e.color, weight: 4, opacity: 1 },
            }).addTo(map);
            geo.bindPopup(`<b>${e.name}</b><br/>${e.countries ? e.countries.join("、") : ""}`);
            layersRef.current.empire.push(geo);

            // 帝国名称标签（版图重心）
            const centroid = getGeojsonCentroid(e.geojson);
            if (centroid) {
              const [clng, clat] = centroid;
              const nameIcon = L.divIcon({
                html: `<div style="color:${e.color};font-size:11px;font-weight:bold;text-shadow:0 1px 3px rgba(255,255,255,0.9),0 0 1px rgba(255,255,255,0.9);white-space:nowrap;pointer-events:none;text-align:center;line-height:1.3">${e.name}</div>`,
                className: "", iconSize: [0, 0], iconAnchor: [0, 0],
              });
              const nameLabel = L.marker([clat, clng], { icon: nameIcon, interactive: false }).addTo(map);
              layersRef.current.empire.push(nameLabel);
            }

            // 首都标记
            const capIcon = L.divIcon({
              html: `<div style="background:${e.color};width:8px;height:8px;border-radius:50%;border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.3)"></div>`,
              className: "", iconSize: [8, 8], iconAnchor: [4, 4],
            });
            const [clng, clat] = e.capital.coords;
            const marker = L.marker([clat, clng], { icon: capIcon, interactive: false })
              .addTo(map)
              .bindTooltip(`首都：${e.capital.name}`, { permanent: true, direction: "top", offset: [0, -8], className: "atlas-tooltip" });
            layersRef.current.empire.push(marker);
          });
      }

      // ── 事件涉及国家高亮标记 ──
      if (selEvt) {
        const evtId = selEvt.replace(/^evt:/, "");
        const evtData = allEvents.find((e) => e.id === evtId);
        if (evtData?.countries && evtData.countries.length > 0) {
          evtData.countries.forEach((country) => {
            const coords = COUNTRY_COORDS[country];
            if (!coords) return;
            const [lng, lat] = coords;
            // 国家标记圆点
            const dotIcon = L.divIcon({
              html: `<div style="width:10px;height:10px;border-radius:50%;background:#f59e0b;border:2px solid #fff;box-shadow:0 0 8px rgba(245,158,11,0.6);animation:pulse 2s infinite"></div>`,
              className: "", iconSize: [10, 10], iconAnchor: [5, 5],
            });
            const dot = L.marker([lat, lng], { icon: dotIcon, interactive: false }).addTo(map);
            layersRef.current.empire.push(dot);
            // 国家名称标签
            const countryIcon = L.divIcon({
              html: `<div style="background:rgba(245,158,11,0.9);color:#fff;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:bold;white-space:nowrap;box-shadow:0 1px 4px rgba(0,0,0,0.3);pointer-events:none">${country}</div>`,
              className: "", iconSize: [0, 0], iconAnchor: [0, 14],
            });
            const label = L.marker([lat, lng], { icon: countryIcon, interactive: false }).addTo(map);
            layersRef.current.empire.push(label);
          });
        }
      }
    }
  }, [clearLayers, dispatch]);

  // 初始化地图（含 resize 监听）
  useEffect(() => {
    if (initRef.current) return;
    const el = mapRef.current;
    if (!el) return;
    // 防止 React Strict Mode 双重初始化
    if (mapRef2.current || (el as any)._leaflet_id) return;
    initRef.current = true;

    let cancelled = false;

    (async () => {
      const leaflet = await getLeaflet();
      if (cancelled || !el || mapRef2.current || (el as any)._leaflet_id) return;

      const map = leaflet.map(el, {
        center: [35, 105],
        zoom: 5,
        zoomControl: false,
        attributionControl: false,
      });

      leaflet.control.zoom({ position: "topright" }).addTo(map);

      // 创建瓦片图层，按需切换
      const chinaBase = leaflet.tileLayer(TILE_CHINA_BASE.url, TILE_CHINA_BASE.opts);
      const chinaLabel = leaflet.tileLayer(TILE_CHINA_LABEL.url, TILE_CHINA_LABEL.opts);
      const worldBase = leaflet.tileLayer(TILE_WORLD_BASE.url, TILE_WORLD_BASE.opts);
      const worldLabel = leaflet.tileLayer(TILE_WORLD_LABEL.url, TILE_WORLD_LABEL.opts);
      chinaBase.addTo(map); // 默认中国视角
      chinaLabel.addTo(map);
      tileRef.current = { chinaBase, chinaLabel, worldBase, worldLabel, active: "china" };

      mapRef2.current = map;

      // resize 监听在地图就绪后添加
      const handleResize = () => map.invalidateSize();
      window.addEventListener("resize", handleResize);

      // 初始渲染图层
      renderLayers();

      setTimeout(() => {
        if (!cancelled) map.invalidateSize();
      }, 100);

      // 保存清理函数
      (map as any)._resizeCleanup = () => window.removeEventListener("resize", handleResize);
    })();

    return () => {
      cancelled = true;
      clearLayers();
      clearEventRoutes();
      if (mapRef2.current) {
        (mapRef2.current as any)._resizeCleanup?.();
        try { mapRef2.current.remove(); } catch {}
        mapRef2.current = null;
      }
      initRef.current = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 视角切换（含瓦片源切换）
  useEffect(() => {
    const map = mapRef2.current;
    const tiles = tileRef.current;
    if (!map || !tiles) return;

    // 切换瓦片图层
    if (view === "china" && tiles.active !== "china") {
      try { map.removeLayer(tiles.worldBase); } catch {}
      try { map.removeLayer(tiles.worldLabel); } catch {}
      tiles.chinaBase.addTo(map);
      tiles.chinaLabel.addTo(map);
      tiles.active = "china";
    } else if (view === "world" && tiles.active !== "world") {
      try { map.removeLayer(tiles.chinaBase); } catch {}
      try { map.removeLayer(tiles.chinaLabel); } catch {}
      tiles.worldBase.addTo(map);
      tiles.worldLabel.addTo(map);
      tiles.active = "world";
    }

    // 切换视角中心
    if (view === "china") {
      map.setView([35, 105], 5);
    } else {
      map.setView([20, 0], 2);
    }

    // 切换视角后重新渲染图层
    renderLayers();
  }, [view, renderLayers]);

  // 键盘快捷键
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!mapRef2.current) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const { currentYear: cy } = stateRef.current;
      switch (e.key) {
        case "+":
        case "=":
          mapRef2.current.zoomIn();
          break;
        case "-":
          mapRef2.current.zoomOut();
          break;
        case "ArrowLeft":
          dispatch({ type: "SET_YEAR", year: cy - (e.shiftKey ? 10 : 1) });
          break;
        case "ArrowRight":
          dispatch({ type: "SET_YEAR", year: cy + (e.shiftKey ? 10 : 1) });
          break;
        case " ":
          e.preventDefault();
          dispatch({ type: "TOGGLE_PLAY" });
          break;
        case "Escape":
          dispatch({ type: "SELECT_EVENT", id: null });
          dispatch({ type: "SELECT_DYNASTY", id: null });
          break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [dispatch]);

  // 图层更新 — 状态变化时重绘
  useEffect(() => {
    renderLayers();
  }, [currentYear, layers, renderLayers, state.selectedDynastyId, state.selectedEventId]);

  // 事件专属渲染（路线 / 地点特写）
  useEffect(() => {
    const map = mapRef2.current;
    if (!map || !L) return;

    clearEventRoutes();

    const eid = stateRef.current.selectedEventId;
    if (!eid || stateRef.current.view !== "china") return;

    const routeId = eid.replace(/^evt:/, "");

    // 1) 路线事件（如张骞出使西域）
    // 优先精确匹配 route id，也支持匹配途经点的 event_id（如遵义会议→长征路线）
    let route = chinaRoutes.find((r) => r.id === routeId);
    if (!route) {
      route = chinaRoutes.find((r) => r.waypoints.some((wp: { event_id?: string }) => wp.event_id === routeId));
    }
    if (route) {
      const color = route.color || "#8B4513";
      const latlngs = route.path.map(([lng, lat]) => [lat, lng] as [number, number]);
      const pl = L.polyline(latlngs, {
        color, weight: 3, opacity: 0.9, lineCap: "round", lineJoin: "round",
      }).addTo(map);
      eventRouteRef.current.push(pl);

      route.waypoints.forEach((wp, idx) => {
        const isEndpoint = idx === 0 || idx === route.waypoints.length - 1;
        const size = isEndpoint ? 18 : 12;
        const inner = isEndpoint ? 8 : 4;
        const fontSize = isEndpoint ? "13px" : "10px";
        const icon = L.divIcon({
          html: `<div style="position:relative">
            <div style="background:#fff;border:2px solid ${color};border-radius:50%;width:${size}px;height:${size}px;box-shadow:0 2px 6px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center">
              <div style="width:${inner}px;height:${inner}px;border-radius:50%;background:${color}"></div>
            </div>
            <div style="position:absolute;top:100%;left:50%;transform:translateX(-50%);white-space:nowrap;font-size:${fontSize};font-weight:bold;color:${color};text-shadow:0 1px 3px rgba(255,255,255,0.9),0 0 1px rgba(255,255,255,0.9);margin-top:2px;pointer-events:none">
              ${wp.name}${wp.label ? `<span style="font-weight:normal;font-size:9px;color:#666;display:block;text-align:center">${wp.label}</span>` : ""}
            </div>
          </div>`,
          className: "", iconSize: [size, size], iconAnchor: [size / 2, size / 2],
        });
        const [lng, lat] = wp.coords;
        const wpEventId = (wp as { event_id?: string }).event_id || route.event_id;
        const m = L.marker([lat, lng], { icon, interactive: !!wpEventId }).addTo(map);
        if (wpEventId) {
          m.on("click", () => {
            dispatch({ type: "SET_YEAR", year: 1935 });
            dispatch({ type: "SELECT_EVENT", id: `evt:${wpEventId}` });
          });
          m.bindPopup(
            `<div style="text-align:center"><b style="color:${color}">${wp.name}</b>${wp.label ? `<br/><small>${wp.label}</small>` : ""}</div>`
          );
        }
        eventRouteRef.current.push(m);
      });

      const timer = setTimeout(() => {
        if (!mapRef2.current) return;
        const ll = route.path.map(([lng, lat]) => L.latLng(lat, lng));
        map.fitBounds(L.latLngBounds(ll), { padding: [60, 60], maxZoom: 6 });
      }, 50);
      return () => clearTimeout(timer);
    }

    // 2) 地点标记事件（有坐标的朝代/历史事件）
    const keyEvt = keyEvents.find((e) => e.event_id === routeId);
    if (keyEvt && "coords" in keyEvt && keyEvt.coords) {
      const [lng, lat] = keyEvt.coords;
      const icon = L.divIcon({
        html: `<div style="width:12px;height:12px;border-radius:50%;background:#ef4444;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.4)"></div>`,
        className: "",
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      });
      const m = L.marker([lat, lng], { icon, interactive: false }).addTo(map);
      eventRouteRef.current.push(m);
    }
  }, [state.selectedEventId, view, clearEventRoutes]);

  return <div ref={mapRef} style={{ position: "absolute", inset: 0 }} />;
}

// ─── AtlasMap (组合组件) ───────────────────────────
export function AtlasMap() {
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex" }}>
      <div style={{ flex: 1, position: "relative", minHeight: 0 }}>
        <MapView />
        <div style={{ position: "absolute", top: 12, left: 12, zIndex: 1000 }}>
          <ViewToggle />
        </div>
      </div>
      <EventPanel />
    </div>
  );
}
