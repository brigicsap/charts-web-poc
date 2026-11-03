"use client";

import { useChartTheme } from "../../ChartThemeContext";

export function useChartPalette() {
  const { theme, themeName } = useChartTheme();
  return {
    solar: theme.secondary,
    battery: theme.primary,
    grid: theme.tertiary,
    gridImport: theme.primary,
    gridExport: theme.secondary,
    focus: theme.cursorStroke,
    border: theme.grid,
    text: themeName === "default" ? "#374151" : "#d4d4d4",
    background: themeName === "default" ? "#ffffff" : "#171717",
    missing: theme.referenceArea,
    warranty: themeName === "default" ? "#374151" : "#e5e7eb",
    alert: theme.referenceLineAlert,
    retention: [
      theme.secondary,
      theme.primary,
      theme.tertiary,
      "#b36a92",
      "#658aa1",
      "#ae924b",
    ],
  };
}

export type ChartPalette = ReturnType<typeof useChartPalette>;
