"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type Theme = "light" | "dark" | "system";

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);
const STORAGE_KEY = "theme";
const THEME_CLASSNAMES: Array<"light" | "dark"> = ["light", "dark"];

function isTheme(value: string | null): value is Theme {
  return value === "light" || value === "dark" || value === "system";
}

function getSystemTheme(): "light" | "dark" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyThemeClass(next: "light" | "dark") {
  const root = document.documentElement;
  root.classList.remove(...THEME_CLASSNAMES);
  root.classList.add(next);
  root.style.colorScheme = next;
}

export function ThemeProvider({ children, defaultTheme = "light" }: { children: React.ReactNode; defaultTheme?: Theme }) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  const syncTheme = useCallback(
    (next: Theme) => {
      const finalTheme = next === "system" ? getSystemTheme() : next;
      applyThemeClass(finalTheme);
      setResolvedTheme(finalTheme);
    },
    []
  );

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const initial = isTheme(stored) ? stored : defaultTheme;
    setTheme(initial);
    syncTheme(initial);
  }, [defaultTheme, syncTheme]);

  useEffect(() => {
    if (theme === "system") {
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      const handleMediaChange = () => {
        const next = media.matches ? "dark" : "light";
        applyThemeClass(next);
        setResolvedTheme(next);
      };

      handleMediaChange();
      media.addEventListener("change", handleMediaChange);
      return () => media.removeEventListener("change", handleMediaChange);
    }

    localStorage.setItem(STORAGE_KEY, theme);
    syncTheme(theme);
  }, [syncTheme, theme]);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
