import type { EChartsOption } from "echarts";
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

export function baseOption(palette: ChartPalette): EChartsOption {
	return {
		animation: false,
		backgroundColor: palette.background,
		textStyle: { color: palette.text },
		grid: { top: 32, bottom: 42, left: 56, right: 24, containLabel: true },
		tooltip: {
			trigger: "axis",
			showContent: false,
			axisPointer: {
				type: "shadow",
				shadowStyle: { color: palette.focus, opacity: 0.12 },
			},
		},
	};
}

export function categoryAxes(
	labels: string[],
	palette: ChartPalette,
	formatter?: (value: string) => string,
): EChartsOption["xAxis"] {
	return [
		{
			type: "category",
			data: labels,
			axisLine: { onZero: false, lineStyle: { color: palette.border } },
			axisTick: { alignWithLabel: true, lineStyle: { color: palette.border } },
			axisLabel: { color: palette.text, formatter, hideOverlap: true },
		},
		{
			type: "category",
			position: "top",
			axisLine: {
				show: true,
				onZero: false,
				lineStyle: { color: palette.border },
			},
			axisLabel: { show: false },
			axisTick: { show: false },
		},
	];
}

export function valueAxis(
	palette: ChartPalette,
	name: string,
): EChartsOption["yAxis"] {
	return {
		type: "value",
		name,
		splitNumber: 4,
		axisLine: { show: true, lineStyle: { color: palette.border } },
		axisLabel: { color: palette.text },
		splitLine: { lineStyle: { color: palette.border, type: "dashed" } },
	};
}
