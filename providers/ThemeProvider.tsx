"use client";

import { createContext, useContext, useEffect } from "react";
import { type PropsWithChildren } from "react";
import { usePreferencesStore, type AppTheme } from "@/store/preferencesStore";

type ThemeContextValue = {
  resolvedTheme: "light";
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: PropsWithChildren) {
  const theme = usePreferencesStore((state) => state.theme);
  const setTheme = usePreferencesStore((state) => state.setTheme);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.setAttribute("data-theme", "light");
    root.classList.remove("dark");
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme: "light" }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return (
    useContext(ThemeContext) ?? {
      resolvedTheme: "light",
      theme: "light" as AppTheme,
      setTheme: () => {},
    }
  );
}
