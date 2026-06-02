"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

type FontSize = "sm" | "md" | "lg";

const FontSizeContext = createContext<{
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
}>({ fontSize: "md", setFontSize: () => {} });

export function useFontSize() {
  return useContext(FontSizeContext);
}

export function FontSizeProvider({ children }: { children: ReactNode }) {
  const [fontSize, setFontSize] = useState<FontSize>("md");

  useEffect(() => {
    const stored = localStorage.getItem("font-size") as FontSize | null;
    if (stored) setFontSize(stored);
  }, []);

  useEffect(() => {
    localStorage.setItem("font-size", fontSize);
    document.documentElement.classList.remove("font-size-sm", "font-size-md", "font-size-lg");
    document.documentElement.classList.add(`font-size-${fontSize}`);
  }, [fontSize]);

  return (
    <FontSizeContext.Provider value={{ fontSize, setFontSize }}>
      {children}
    </FontSizeContext.Provider>
  );
}
