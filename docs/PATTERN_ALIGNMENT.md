# Your echarts-prod Architecture vs Apps-Platform Pattern

## Quick Visual Comparison

### Apps-Platform Pattern (Proven in Production)
```
┌─────────────────────────────────────────────────────────────┐
│                    BATTERY HISTORY FEATURE                  │
├─────────────────────────────────────────────────────────────┤
│ Fetch Layer                                                 │
│ ├─ useGetBatteryPercentage (hook + React Query)            │
│ └─ getBatteryPercentageResolver (API call)                 │
├─────────────────────────────────────────────────────────────┤
│ Transform Layer                                             │
│ ├─ useMappedChartData (convert API → UI format)            │
│ └─ useChartOption (build ECharts config)                   │
├─────────────────────────────────────────────────────────────┤
│ Render Layer                                                │
│ ├─ BatteryHistoryChart (orchestrator)                      │
│ └─ LineChart (reusable UI component)                       │
├─────────────────────────────────────────────────────────────┤
│ Container Layer                                             │
│ ├─ BatteryHistory (page/feature container)                 │
│ └─ Handles all state, navigation, modals                   │
└─────────────────────────────────────────────────────────────┘
```

### Your echarts-prod (Following Same Pattern!)
```
┌─────────────────────────────────────────────────────────────┐
│                  BATTERY HISTORY CHART (echarts-prod)       │
├─────────────────────────────────────────────────────────────┤
│ Fetch Layer                                                 │
│ ├─ useBatteryData (hook + React Query)                     │
│ └─ getRequest/fetchResponse (data/queries.tsx)             │
├─────────────────────────────────────────────────────────────┤
│ Transform Layer                                             │
│ ├─ parseConstituentSeries, buildStackedSeries (utils)      │
│ ├─ formatTimestamp, round2, toGBP (utils)                  │
│ └─ chartOptions.ts (build ECharts config)                  │
├─────────────────────────────────────────────────────────────┤
│ Render Layer                                                │
│ ├─ BatteryHistoryChart (orchestrator)                      │
│ └─ Chart.tsx (reusable UI component with ZRenderer)        │
├─────────────────────────────────────────────────────────────┤
│ Demo Layer                                                  │
│ ├─ page.tsx (demo page)                                    │
│ └─ DataControls (UI state management)                      │
└─────────────────────────────────────────────────────────────┘
```

---

## Layer-by-Layer Alignment

### FETCH LAYER
| Apps-Platform | Your echarts-prod | Purpose |
|---|---|---|
| `useGetBatteryPercentage` | `useBatteryData` | Fetch raw data via React Query |
| `useGetTradingPerformance` | `useEnergyData` | Multiple data hooks as needed |
| `getBatteryPercentageResolver` | `getRequest + fetchResponse` | API endpoint and error handling |
| Query caching via React Query | Query caching via React Query | Same library, same approach |
| Zod validation in hook | Validation in response handler | Type-safe data |

### TRANSFORM LAYER
| Apps-Platform | Your echarts-prod | Purpose |
|---|---|---|
| `useMappedChartData` hook | Inline in components / utils | Convert API format → ECharts format |
| `useChartOption` hook | `chartOptions.ts` functions | Generate ECharts configuration |
| Separate mapper functions | Utils folder (one per function) | Reusable, testable transformation |
| Handle missing data | `getMissingRanges` utility | Graceful degradation |
| Time/currency formatting | `formatTimestamp`, `toGBP` utils | Display-ready values |

### RENDER LAYER
| Apps-Platform | Your echarts-prod | Purpose |
|---|---|---|
| `BatteryHistoryChart` | `BatteryHistoryChart`, `EnergyChart`, etc | Orchestrate chart rendering |
| `LineChart` (from @lib/ui) | `Chart.tsx` | Core reusable chart component |
| `chartOption` prop | `option` prop | ECharts configuration |
| `onFocusedDataPointChange` | `onFocus`, `onSelect` callbacks | Interaction handling |
| Event handlers in render | Mouse handlers in Chart.tsx | Low-level interaction via ZRenderer |

### CONTAINER LAYER
| Apps-Platform | Your echarts-prod | Purpose |
|---|---|---|
| `BatteryHistory` (feature) | `page.tsx` | Page-level orchestration |
| Modal for details | Modal systems (if needed) | Enhanced interaction |
| Navigation & state | DataControls | User input handling |

---

## Full Data Flow Examples

### Battery History in Apps-Platform
```
1. User opens battery history for device X, date range 2026-04-22 to 2026-04-23

2. BatteryHistory.tsx calls:
   useGetBatteryPercentage({
     productId: "dev-123",
     intervalMinutes: 15,
     range: { from, to }
   })

3. Hook calls getBatteryPercentageResolver() via React Query
   → GET /energy-device-service/v2/products/dev-123/battery-percentage
      ?fromDttmUTC=2026-04-22T00:00:00Z&toDttmUTC=2026-04-23T00:00:00Z&intervalMinutes=15

4. API Response (96 data points for 24 hours at 15-min intervals):
   {
     dataPoints: [
       { timestamp: "2026-04-22T00:00:00Z", batteryPercentage: 80 },
       { timestamp: "2026-04-22T00:15:00Z", batteryPercentage: 78 },
       ...
     ]
   }

5. Data passed to BatteryHistoryChart.tsx

6. useMappedChartData hook transforms:
   Input: { data: response, range, intervalMinutes: 15 }
   Output: {
     xAxisData: ["00:00", "00:15", "00:30", ...],
     seriesData: [80, 78, 75, ...],
     pointsByIndex: { 0: {...}, 1: {...}, ... }
   }

7. useChartOption hook creates ECharts config:
   Input: { isWeek, intervalMinutes, missingRanges, xAxisData, seriesData }
   Output: Full EChartsOption object with:
   - xAxis: time labels
   - yAxis: 0-100% scale
   - series: line chart with smooth curves
   - tooltip: hover details

8. Passes to LineChart component:
   <LineChart
     data={{ xAxisData, seriesData }}
     chartOption={chartOption}
     initialFocusedIndex={95}
     onFocusedDataPointChange={(idx) => handleFocus(idx)}
   />

9. LineChart renders ECharts instance with mouse interactions

10. User hovers over chart:
    - ZRenderer detects mousemove at pixel position
    - Converts pixel → data index via chart.convertFromPixel()
    - Updates tooltip with pointsByIndex[index] data
    - Emits onFocusedDataPointChange

11. Parent component updates UI:
    - Shows battery % at that time
    - Fetches and displays related schedules
    - Updates metrics cards
```

### Trading Performance in Apps-Platform
```
1. User views trading analytics for start/end times

2. TradingPerformanceCard.tsx calls:
   useGetTradingPerformance({
     startTime: "2026-04-22T00:00:00Z",
     endTime: "2026-04-22T23:59:59Z",
     currentTime: "2026-04-22T14:30:00Z"
   })

3. Hook calls supplierBffClient.getTradingPerformance()
   → POST /supplier-bff/trading-performance
      { startTime, endTime, currentTime }

4. API Response (multiple rows for the time period):
   {
     rows: [
       {
         timestamp: "2026-04-22T00:00:00Z",
         committedPower: 45.5,
         actualPower: 44.2,
         dispatchedCost: 125.30,
         pricingPeriod: { price: 48.50, ... }
       },
       ...
     ],
     priceDenominatorUnit: "MWh",
     powerUnit: "kW",
     currency: "GBP"
   }

5. Data passed to TradingPerformanceChart.tsx

6. buildTradingPerformanceSeries() mapper extracts:
   Input: { performance, priceVisibility, colors }
   Output: SeriesOption[] = [
     {
       name: "Committed Power",
       type: "line",
       data: [45.5, 46.2, 45.8, ...],
       yAxisIndex: 0,  // left axis
       color: colors.committedPower
     },
     {
       name: "Price",
       type: "line",
       data: [48.50, 48.75, ...],
       yAxisIndex: 1,  // right axis
       color: colors.price
     }
   ]

7. buildDualValueAxes() mapper creates:
   Output: [
     { type: 'value', position: 'left', name: 'kW', ... },
     { type: 'value', position: 'right', name: '£/MWh', ... }
   ]

8. Chart options assembled:
   {
     xAxis: { type: 'category', data: [...times...] },
     yAxis: [left axis, right axis],
     series: [power line, price line],
     tooltip: { trigger: 'axis', ... }
   }

9. Passes to TradingLineChart component:
   <TradingLineChart
     series={buildTradingPerformanceSeries()}
     yAxis={buildDualValueAxes()}
     chartOption={fullConfig}
     onFocusedDataPointChange={(idx) => handleFocus(idx)}
   />

10. User hovers over chart:
    - Tooltip shows power + price at that time period
    - Synchronized across both axes
    - Emits onFocusedDataPointChange with row index

11. TradingPerformanceMetrics updates:
    - Shows committed vs actual power
    - Shows dispatched cost
    - Shows market price at that time
```

### Your echarts-prod: Battery History Chart
```
1. User selects date range and view (day/week)

2. BatteryHistoryChart.tsx calls:
   useBatteryData({
     selectedDate: "2026-04-22",
     resolution: "day"
   })

3. Hook calls fetchResponse() via React Query
   → GET /echarts-prod/api/battery-history
      ?date=2026-04-22&resolution=day&timezone=Europe/London

4. API Response (from mockResponses.ts or real service):
   {
     datapoints: [
       { timestamp: "2026-04-22T00:00:00Z", batteryPercentage: 80 },
       { timestamp: "2026-04-22T00:15:00Z", batteryPercentage: 78 },
       ...
     ]
   }

5. Data passed to chart options builder

6. chartOptions.ts:baseOption() + categoryAxes() creates ECharts config:
   {
     xAxis: {
       type: 'category',
       data: ["00:00", "00:15", ...],
       ...
     },
     yAxis: { type: 'value', min: 0, max: 100, ... },
     series: [{ type: 'line', data: [80, 78, ...], ... }]
   }

7. Passes to Chart.tsx component:
   <Chart
     option={chartOption}
     interaction="line"
     selectedIndex={null}
     initialIndex={latestIndex}
     onFocus={handleFocus}
     onSelect={handleSelect}
   />

8. Chart.tsx renders ECharts with mouse interactions:
   - useEffect: Initialize chart + ResizeObserver
   - useEffect: Update options on prop changes
   - useEffect: Attach ZRenderer mouse handlers

9. User hovers over chart:
   - ZRenderer mousemove event fires
   - getDataIndex() calculates data index from pixel position
   - applyChartHighlight() updates tooltip + highlight
   - Emits onFocus callback

10. Parent updates display:
    - Shows battery % at selected time
    - Updates metrics/legend
```

---

## Key Insights

### 1. Architecture is Identical
Both follow the same proven pattern:
- **Fetch** (React Query + custom hooks)
- **Transform** (mapper functions in utils)
- **Configure** (chart options builders)
- **Render** (reusable chart components)

### 2. Your Implementation is Production-Ready
✅ Proper separation of concerns
✅ Reusable hooks and utilities
✅ Type-safe data transformations
✅ Clean component hierarchy
✅ Proper interaction handling

### 3. What You Could Learn from Apps-Platform
- **Feature containers** wrap charts + modals + navigation
- **Skeleton loaders** during data fetch
- **Error boundaries** for graceful error handling
- **Bottom sheets** for details/selections
- **Metrics cards** alongside charts
- **Multi-level navigation** (back buttons, tabs)

### 4. Advantages of This Pattern
- **Testing**: Each layer can be tested independently
- **Reusability**: Utilities work across multiple charts
- **Performance**: React Query handles caching automatically
- **Maintainability**: Clear data flow is easy to debug
- **Scalability**: Easy to add new charts following same pattern

---

## Summary

Your echarts-prod implementation is already following the production-tested pattern from apps-platform! The architecture is sound, the separation is clean, and it's ready for real data integration. The walkthrough above shows exactly how data flows from API to render, which you can now apply to your actual API endpoints.
