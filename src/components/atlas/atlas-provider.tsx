"use client";

import { createContext, useContext, useReducer, useCallback, useEffect, useRef, type ReactNode } from "react";

// ─── 视图对应的年份范围 ───────────────────────────
export const VIEW_YEAR_BOUNDS = {
  china: { min: -221, max: 2024 },
  world: { min: 1400, max: 2024 },
} as const;

function getYearBounds(view: "china" | "world") {
  return VIEW_YEAR_BOUNDS[view];
}

interface AtlasState {
  currentYear: number;
  chinaYear: number;
  worldYear: number;
  isPlaying: boolean;
  playSpeed: 1 | 5;
  view: "china" | "world";
  layers: { dynasty: boolean; war: boolean; trade: boolean; empire: boolean; ohm: boolean };
  selectedEventId: string | null;
  selectedDynastyId: string | null;
}

type AtlasAction =
  | { type: "SET_YEAR"; year: number }
  | { type: "TOGGLE_PLAY" }
  | { type: "SET_SPEED"; speed: 1 | 5 }
  | { type: "SET_VIEW"; view: "china" | "world" }
  | { type: "TOGGLE_LAYER"; layer: keyof AtlasState["layers"] }
  | { type: "SET_LAYER"; layer: keyof AtlasState["layers"]; value: boolean }
  | { type: "SELECT_EVENT"; id: string | null }
  | { type: "SELECT_DYNASTY"; id: string | null };

const initialState: AtlasState = {
  currentYear: -221,
  chinaYear: -221,
  worldYear: 1400,
  isPlaying: false,
  playSpeed: 1,
  view: "china",
  layers: { dynasty: false, war: true, trade: true, empire: false, ohm: false },
  selectedEventId: null,
  selectedDynastyId: null,
};

function atlasReducer(state: AtlasState, action: AtlasAction): AtlasState {
  switch (action.type) {
    case "SET_YEAR": {
      const bounds = getYearBounds(state.view);
      return { ...state, currentYear: Math.max(bounds.min, Math.min(bounds.max, action.year)) };
    }
    case "TOGGLE_PLAY":
      return { ...state, isPlaying: !state.isPlaying };
    case "SET_SPEED":
      return { ...state, playSpeed: action.speed };
    case "SET_VIEW": {
      const savedYear = action.view === "china" ? state.chinaYear : state.worldYear;
      const bounds = getYearBounds(action.view);
      const year = Math.max(bounds.min, Math.min(bounds.max, savedYear));
      return {
        ...state,
        view: action.view,
        currentYear: year,
        chinaYear: action.view === "china" ? state.currentYear : state.chinaYear,
        worldYear: action.view === "world" ? state.currentYear : state.worldYear,
      };
    }
    case "TOGGLE_LAYER":
      return {
        ...state,
        layers: { ...state.layers, [action.layer]: !state.layers[action.layer] },
      };
    case "SET_LAYER":
      return {
        ...state,
        layers: { ...state.layers, [action.layer]: action.value },
      };
    case "SELECT_EVENT":
      return { ...state, selectedEventId: action.id };
    case "SELECT_DYNASTY":
      return { ...state, selectedDynastyId: action.id };
    default:
      return state;
  }
}

const AtlasContext = createContext<{
  state: AtlasState;
  dispatch: React.Dispatch<AtlasAction>;
}>({ state: initialState, dispatch: () => {} });

export function useAtlas() {
  return useContext(AtlasContext);
}

export function AtlasProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(atlasReducer, initialState);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  // 播放/暂停逻辑（用 ref 读取最新 state，避免 stale closure）
  useEffect(() => {
    if (state.isPlaying) {
      intervalRef.current = setInterval(() => {
        const s = stateRef.current;
        dispatch({ type: "SET_YEAR", year: s.currentYear + s.playSpeed });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [state.isPlaying, state.playSpeed]);

  return (
    <AtlasContext.Provider value={{ state, dispatch }}>
      {children}
    </AtlasContext.Provider>
  );
}
