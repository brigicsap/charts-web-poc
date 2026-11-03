"use client";

import type { EChartsOption, EChartsType } from "echarts";
import { useEffect, useRef, useState } from "react";

type ChartProps = {
	option: EChartsOption;
	height?: number;
	selectedIndex?: number | null;
	initialIndex?: number | null;
	maxInteractiveIndex?: number;
	interaction?: "bar" | "line";
	onSelect?: (index: number | null) => void;
	onFocus?: (index: number | null) => void;
};

export default function Chart(props: ChartProps) {
	const {
		option,
		height = 300,
		interaction,
		selectedIndex,
		initialIndex,
		onFocus,
	} = props;
	const elementRef = useRef<HTMLDivElement>(null);
	const chartRef = useRef<EChartsType | null>(null);
	const propsRef = useRef(props);
	const hoveredRef = useRef<number | null>(null);
	const [ready, setReady] = useState(false);
	useEffect(() => {
		propsRef.current = props;
	}, [props]);

	useEffect(() => {
		const element = elementRef.current;
		if (!element) return;
		let disposed = false;
		let initializing = false;
		const initialize = () => {
			if (
				disposed ||
				initializing ||
				chartRef.current ||
				!element.clientWidth ||
				!element.clientHeight
			)
				return;
			initializing = true;
			void import("echarts")
				.then((echarts) => {
					if (disposed || !element.clientWidth || !element.clientHeight) return;
					chartRef.current = echarts.init(element);
					setReady(true);
				})
				.finally(() => {
					initializing = false;
				});
		};
		const resize = () => {
			if (chartRef.current) chartRef.current.resize();
			else initialize();
		};
		const observer = new ResizeObserver(resize);
		observer.observe(element);
		initialize();
		return () => {
			disposed = true;
			observer.disconnect();
			chartRef.current?.dispose();
			chartRef.current = null;
		};
	}, []);

	useEffect(() => {
		const chart = chartRef.current;
		const element = elementRef.current;
		if (!ready || !chart || !element) return;
		chart.dispatchAction({ type: "hideTip" });
		chart.setOption(
			{
				...option,
				textStyle: {
					...option.textStyle,
					fontFamily: getComputedStyle(element).fontFamily,
				},
			},
			{ replaceMerge: ["series", "xAxis", "yAxis"] },
		);
		const index =
			interaction === "line"
				? (selectedIndex ?? hoveredRef.current ?? initialIndex)
				: (hoveredRef.current ?? selectedIndex);
		chart.dispatchAction({ type: "downplay" });
		if (index != null && index >= 0) {
			chart.dispatchAction({
				type: "showTip",
				seriesIndex: 0,
				dataIndex: index,
			});
			if (interaction === "line")
				chart.dispatchAction({ type: "highlight", dataIndex: index });
		}
		if (interaction === "line") onFocus?.(index ?? null);
	}, [ready, option, selectedIndex, initialIndex, interaction, onFocus]);

	useEffect(() => {
		const chart = chartRef.current;
		if (!ready || !chart) return;
		const renderPointer = (hovered: number | null) => {
			const current = propsRef.current;
			const index =
				current.interaction === "line"
					? (current.selectedIndex ?? hovered ?? current.initialIndex ?? null)
					: (hovered ?? current.selectedIndex ?? null);
			chart.dispatchAction({ type: "downplay" });
			if (index == null) chart.dispatchAction({ type: "hideTip" });
			else {
				chart.dispatchAction({
					type: "showTip",
					seriesIndex: 0,
					dataIndex: index,
				});
				if (current.interaction === "line")
					chart.dispatchAction({ type: "highlight", dataIndex: index });
			}
			current.onFocus?.(index);
		};
		const getIndex = (event: { offsetX: number; offsetY: number }) => {
			if (!chart.containPixel("grid", [event.offsetX, event.offsetY]))
				return null;
			const coordinates = chart.convertFromPixel(
				{ xAxisIndex: 0 },
				event.offsetX,
			);
			const index = Math.round(Number(coordinates));
			const max = propsRef.current.maxInteractiveIndex;
			if (!Number.isFinite(index) || index < 0 || (max != null && index > max))
				return null;
			return index;
		};
		const move = (event: { offsetX: number; offsetY: number }) => {
			if (!propsRef.current.interaction) return;
			const index = getIndex(event);
			if (hoveredRef.current === index) return;
			hoveredRef.current = index;
			renderPointer(index);
		};
		const leave = () => {
			hoveredRef.current = null;
			renderPointer(null);
		};
		const click = (event: { offsetX: number; offsetY: number }) => {
			const index = getIndex(event);
			if (index == null) return;
			propsRef.current.onSelect?.(
				propsRef.current.selectedIndex === index ? null : index,
			);
		};
		const renderer = chart.getZr();
		renderer.on("mousemove", move);
		renderer.on("globalout", leave);
		renderer.on("click", click);
		return () => {
			renderer.off("mousemove", move);
			renderer.off("globalout", leave);
			renderer.off("click", click);
		};
	}, [ready]);

	return <div ref={elementRef} className="w-full min-w-0" style={{ height }} />;
}
