"use client";

import { createContext, type ReactNode, useContext, useState } from "react";
import {
	type ChartTheme,
	type ChartThemeName,
	chartThemes,
} from "./chartTheme";

const ChartThemeContext = createContext<{
	theme: ChartTheme;
	themeName: ChartThemeName;
	setTheme: (name: ChartThemeName) => void;
}>({
	theme: chartThemes.default,
	themeName: "default",
	setTheme: () => {},
});

export function ChartThemeProvider({ children }: { children: ReactNode }) {
	const [themeName, setThemeName] = useState<ChartThemeName>("default");
	return (
		<ChartThemeContext.Provider
			value={{
				theme: chartThemes[themeName],
				themeName,
				setTheme: setThemeName,
			}}
		>
			{children}
		</ChartThemeContext.Provider>
	);
}

export function useChartTheme() {
	return useContext(ChartThemeContext);
}
