"use client";

import type { EChartsOption, EChartsType } from "echarts";
import { useEffect, useRef, useState } from "react";
import { applyChartHighlight } from "../utils/applyChartHighlight";

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

type MouseEvent = { offsetX: number; offsetY: number };

export default function Chart(props: ChartProps) {
  const {
    option,
    height = 300,
    interaction,
    selectedIndex,
    initialIndex,
    maxInteractiveIndex,
    onSelect,
    onFocus,
  } = props;
  const elementRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<EChartsType | null>(null);
  const propsRef = useRef(props);
  const hoveredRef = useRef<number | null>(null);
  const [ready, setReady] = useState(false);

  // Keep props reference in sync for use in event handlers
  useEffect(() => {
    propsRef.current = props;
  }, [props]);

  // Initialize chart instance and set up resize observer
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

  // Update chart option and handle selection/focus states
  useEffect(() => {
    const chart = chartRef.current;
    const element = elementRef.current;
    if (!ready || !chart || !element) return;
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
    // Determine index based on interaction type
    const index =
      interaction === "line"
        ? (selectedIndex ?? hoveredRef.current ?? initialIndex ?? null)
        : (hoveredRef.current ?? selectedIndex ?? null);
    // Apply highlight and tooltip
    applyChartHighlight(chart, index, interaction === "line");
    if (interaction === "line") onFocus?.(index);
  }, [ready, option, selectedIndex, initialIndex, interaction, onFocus]);

  // Handle mouse interactions (hover, click)
  useEffect(() => {
    const chart = chartRef.current;
    if (!ready || !chart) return;

    const getDataIndex = (event: MouseEvent): number | null => {
      if (!chart.containPixel("grid", [event.offsetX, event.offsetY]))
        return null;
      const x = chart.convertFromPixel({ xAxisIndex: 0 }, event.offsetX);
      const index = Math.round(Number(x));
      const isValid =
        Number.isFinite(index) &&
        index >= 0 &&
        (maxInteractiveIndex == null || index <= maxInteractiveIndex);
      return isValid ? index : null;
    };

    const handleMove = (event: MouseEvent) => {
      if (!interaction) return;
      const index = getDataIndex(event);
      if (hoveredRef.current === index) return;
      hoveredRef.current = index;
      const displayIndex =
        interaction === "line"
          ? (selectedIndex ?? index ?? initialIndex ?? null)
          : (index ?? selectedIndex ?? null);
      applyChartHighlight(chart, displayIndex, interaction === "line");
      onFocus?.(displayIndex);
    };

    const handleLeave = () => {
      hoveredRef.current = null;
      const displayIndex =
        interaction === "line"
          ? (selectedIndex ?? initialIndex ?? null)
          : (selectedIndex ?? null);
      applyChartHighlight(chart, displayIndex, interaction === "line");
      onFocus?.(displayIndex);
    };

    const handleClick = (event: MouseEvent) => {
      const index = getDataIndex(event);
      if (index != null) {
        onSelect?.(selectedIndex === index ? null : index);
      }
    };

    const renderer = chart.getZr();
    // ZRenderer is ECharts' underlying canvas rendering engine
    // We use it to listen to low-level mouse events (pixel coordinates)
    // rather than high-level chart events, allowing us to detect clicks
    // anywhere on the chart and convert pixel positions to data indices
    renderer.on("mousemove", handleMove);
    renderer.on("globalout", handleLeave);
    renderer.on("click", handleClick);
    return () => {
      renderer.off("mousemove", handleMove);
      renderer.off("globalout", handleLeave);
      renderer.off("click", handleClick);
    };
  }, [
    ready,
    interaction,
    maxInteractiveIndex,
    selectedIndex,
    initialIndex,
    onFocus,
    onSelect,
  ]);

  return <div ref={elementRef} className="w-full min-w-0" style={{ height }} />;
}
