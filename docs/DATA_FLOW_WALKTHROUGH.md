# Data Flow Walkthrough: Battery History vs Trading Performance

## Overview
Both charts follow a similar architectural pattern but with different data sources and visualization approaches.

---

## 1. BATTERY HISTORY CHART (Consumer-Web)
📍 Location: `@lib/features/SolarBatteries/Optimisation/BatteryHistory/`

### Data Flow Architecture

```
User Action (date range selection)
    ↓
[BatteryHistory.tsx] - Main container
    ├─→ useGetBatteryPercentage hook
    │       ├─→ Query parameters: productId, range, intervalMinutes
    │       └─→ API call: getBatteryPercentageResolver()
    │           └─→ Endpoint: /energy-device-service/v2/products/{productId}/battery-percentage
    │
    ├─→ useGetOptimisationHistory hook
    │       ├─→ Query parameters: productId, dateRange
    │       └─→ API call: getOptimisationHistoryResolver()
    │           └─→ Endpoint: Gets device optimization schedule changes
    │
    └─→ [BatteryHistoryChart.tsx] - Chart rendering
            ├─→ useMappedChartData hook
            │   ├─→ Input: raw API response + range + intervalMinutes
            │   └─→ Output: { xAxisData, seriesData, pointsByIndex }
            │
            ├─→ useChartOption hook
            │   ├─→ Input: isWeek, intervalMinutes, missingRanges, xAxisData, seriesData
            │   └─→ Output: ECharts configuration object
            │
            └─→ [LineChart] - UI Component (reusable from @lib/ui)
                ├─→ Renders SVG line chart
                ├─→ Handles mouse interactions (hover, click)
                └─→ Emits onFocusedDataPointChange events
```

### Step-by-Step Data Transformation

#### Step 1: Initial Data Fetch
**Hook:** `useGetBatteryPercentage`
```typescript
// Input parameters
{
  productId: "prod-123",
  intervalMinutes: 15,
  range: { from: Instant, to: Instant }
}

// Query made via React Query
queryFn: getBatteryPercentageResolver({
  productId,
  fromDttmUTC: "2026-04-22T00:00:00Z",
  toDttmUTC: "2026-04-23T00:00:00Z",
  intervalMinutes: "15"
})

// API Response (BatteryPercentageResponse)
{
  dataPoints: [
    { timestamp: "2026-04-22T00:00:00Z", batteryPercentage: 80 },
    { timestamp: "2026-04-22T00:15:00Z", batteryPercentage: 78 },
    // ... 96 points for a day at 15-minute intervals
  ]
}
```

#### Step 2: Data Mapping to Chart Format
**Hook:** `useMappedChartData`
```typescript
// Takes raw API response and transforms it:

Input:
{
  data: BatteryPercentageResponse,
  range: { from, to },
  intervalMinutes: 15
}

Output:
{
  xAxisData: [
    "00:00",
    "00:15",
    "00:30",
    // ... 96 time labels for the day
  ],
  
  seriesData: [
    80,    // battery % at 00:00
    78,    // battery % at 00:15
    null,  // missing data slot
    75,    // battery % at 00:30
    // ... data points with nulls for gaps
  ],
  
  pointsByIndex: {
    0: { timestamp, batteryPercentage, ... },
    1: { timestamp, batteryPercentage, ... },
    // ... indexed for tooltip lookups
  }
}
```

#### Step 3: Chart Options Configuration
**Hook:** `useChartOption`
```typescript
// Generates ECharts configuration:

Input:
{
  isWeek: boolean,
  intervalMinutes: 15,
  missingRanges: [[10, 14], [25, 30]], // visual gap ranges
  xAxisData: string[],
  seriesData: (number | null)[]
}

Output: {
  xAxis: {
    type: 'category',
    data: xAxisData,
    // ... formatting for time labels
  },
  yAxis: {
    type: 'value',
    min: 0,
    max: 100,
    // ... percentage formatting
  },
  series: [
    {
      type: 'line',
      data: seriesData,
      // ... styling, smooth curves, etc
    },
    // ... additional series for missing data visualization
  ],
  tooltip: { /* ... */ },
  grid: { /* ... */ },
}
```

#### Step 4: UI Rendering
**Component:** `LineChart` (from @lib/ui)
```typescript
// Receives:
{
  data: { xAxisData, seriesData },
  chartOption: echarts.EChartsOption,
  initialFocusedIndex: 95,  // latest data point
  maxInteractiveDataIndex: 95,
  enableClickSelection: true,
  onFocusedDataPointChange: (index) => {}
}

// Renders ECharts instance and handles:
- Mouse hover → highlights line and shows tooltip
- Click → selects/deselects a data point
- Emits: onFocusedDataPointChange with pointsByIndex[index]
```

#### Step 5: Interaction Handling
**In BatteryHistory.tsx:**
```typescript
onFocusedDataPointChange={(dataPoint) => {
  // Update UI to show:
  // - Battery percentage at that timestamp
  // - Associated optimization mode
  // - Related schedules from optimization history
}}
```

---

## 2. TRADING PERFORMANCE CHART (Supplier-Web)
📍 Location: `@app/supplier-web/components/Features/AnalyticsDashboard/`

### Data Flow Architecture

```
User Action (time range + price visibility toggle)
    ↓
[TradingPerformanceCard.tsx]
    ├─→ useGetTradingPerformance hook
    │       ├─→ Query parameters: startTime, endTime, currentTime
    │       └─→ API call: supplierBffClient.getTradingPerformance()
    │           └─→ Endpoint: BFF (Backend for Frontend) service
    │
    └─→ [TradingPerformanceChart.tsx]
            ├─→ Input: performance data + priceVisibility
            │
            ├─→ buildTradingPerformanceSeries()
            │   ├─→ Transforms performance.rows into series objects
            │   └─→ Creates 2 series: committedPower + optionalPrice
            │
            ├─→ buildDualValueAxes()
            │   ├─→ Creates yAxis for power (kW) on left
            │   └─→ Creates yAxis for price (£/MWh) on right
            │
            └─→ [TradingLineChart] - Chart rendering
                ├─→ Dual-axis visualization
                ├─→ Tooltip on mousemove/click
                └─→ onFocusedDataPointChange events
```

### Step-by-Step Data Transformation

#### Step 1: Initial Data Fetch
**Hook:** `useGetTradingPerformance`
```typescript
// Input parameters
{
  startTime: "2026-04-22T00:00:00Z",
  endTime: "2026-04-22T23:59:59Z",
  currentTime: "2026-04-22T14:30:00Z"
}

// Query made via React Query
queryFn: supplierBffClient.getTradingPerformance({
  startTime,
  endTime,
  currentTime
})

// API Response (TradingPerformanceBase)
{
  rows: [
    {
      timestamp: "2026-04-22T00:00:00Z",
      committedPower: 45.5,        // kW
      actualPower: 44.2,
      dispatchedCost: 125.30,       // £
      pricingPeriod: {
        price: 48.50,               // £/MWh
        dispatchPeriod: "00:00-00:30"
      }
    },
    // ... multiple rows for the time period
  ],
  priceDenominatorUnit: "MWh",
  powerUnit: "kW",
  currency: "GBP"
}
```

#### Step 2: Series Building
**Mapper:** `buildTradingPerformanceSeries()`
```typescript
// Takes performance data + visibility settings

Input:
{
  performance: TradingPerformance,
  priceVisibility: "all" | "committed" | "hidden",
  colors: { committedPower, actualPower, price, ... }
}

Output: SeriesOption[] = [
  {
    name: "Committed Power",
    type: "line",
    data: [45.5, 46.2, 45.8, ...],  // extracted from rows
    yAxisIndex: 0,                   // left axis (power)
    color: colors.committedPower,
    smooth: true,
    // ... styling
  },
  {
    name: "Price",
    type: "line",
    data: [48.50, 48.75, 48.50, ...], // only if priceVisibility allows
    yAxisIndex: 1,                    // right axis (price)
    color: colors.price,
    // ... styling
  }
]
```

#### Step 3: Dual Axis Configuration
**Mapper:** `buildDualValueAxes()`
```typescript
// Creates two Y-axes with different scales

Output: YAxisComponentOption[] = [
  {
    type: 'value',
    position: 'left',
    name: 'kW',                    // power unit
    axisLabel: {
      formatter: (value) => `${value.toFixed(1)} kW`
    },
    // ... axis styling
  },
  {
    type: 'value',
    position: 'right',
    name: '£/MWh',                 // price denominator
    axisLabel: {
      formatter: (value) => `£${value.toFixed(2)}`
    },
    // ... axis styling
  }
]
```

#### Step 4: Chart Options Assembly
**In TradingPerformanceChart.tsx:**
```typescript
const chartOption: EChartsOption = {
  tooltip: {
    trigger: 'axis',
    triggerOn: 'mousemove|click|mousewheel',
    showContent: false,
    alwaysShowContent: true,
    axisPointer: {
      type: 'line',
      lineStyle: { color, type: 'dashed', width: 1 }
    }
  },
  
  xAxis: {
    type: 'category',
    data: rows.map(r => formatTimestamp(r.timestamp))
    // ... time labels
  },
  
  yAxis: buildDualValueAxes(),  // left & right axes
  
  series: buildTradingPerformanceSeries(),  // power + price lines
  
  grid: { /* positioning */ }
}
```

#### Step 5: UI Rendering
**Component:** `TradingLineChart`
```typescript
// ECharts wrapper that receives the full configuration
// Renders dual-axis line chart with synchronized tooltips

On mouse interaction:
- Hover over chart → tooltip shows both power and price at that point
- Click → selects that time period
- Emits: onFocusedDataPointChange with row index and data
```

#### Step 6: Interaction & Metrics
**Component:** `TradingPerformanceMetrics.tsx`
```typescript
// Receives the focused data point and displays:
onFocusedDataPointChange={(focusedPoint) => {
  // Show performance metrics for that time period:
  // - Committed Power: 45.5 kW
  // - Actual Power: 44.2 kW
  // - Dispatched Cost: £125.30
  // - Market Price: £48.50/MWh
}}
```

---

## Key Differences

| Aspect | Battery History | Trading Performance |
|--------|-----------------|---------------------|
| **Data Source** | Energy Device Service | Supplier BFF (Backend) |
| **Time Resolution** | 15-min intervals (configurable) | Variable (depends on trading periods) |
| **Axes** | Single Y-axis (0-100%) | Dual Y-axes (Power + Price) |
| **Series** | Single line + missing data viz | Multiple lines (actual, committed, price) |
| **Interaction** | Select/hover to view detailed history | Hover to compare power vs price |
| **Associated Data** | Optimization schedules, modes | Cost metrics, trading periods |

---

## Common Patterns in Apps-Platform

### 1. Data Fetching Layer
- **Custom hooks** (useGetBatteryPercentage, useGetTradingPerformance)
- **React Query** for caching & lifecycle management
- **Resolver functions** (createClientResolver) for API calls
- **Zod schemas** for runtime validation

### 2. Data Transformation Layer
- **Separate mapper functions** (useMappedChartData, buildTradingPerformanceSeries)
- **Transform API → UI format** (e.g., rows → series data)
- **Handle missing/invalid data** gracefully

### 3. Chart Configuration Layer
- **useChartOption/buildChartOption** hooks
- **ECharts configuration objects** assembled from pieces
- **Theme tokens** injected via useTokenValue
- **Accessibility** (colors, labels, tooltips)

### 4. UI Rendering Layer
- **Reusable chart components** (LineChart, TradingLineChart)
- **Interaction handlers** attached at render time
- **Event emissions** for parent component state management
- **Focused/selected state** tracked externally

### 5. Interaction & Display
- **Tooltip/hover details** shown via focused index
- **Metrics cards** updated on selection
- **Range selection** for navigation
- **Skeleton loaders** during fetch

---

## Data Flow Summary Comparison

### Battery History: Single-Axis, Time-Series
```
API Response
  ↓ (timestamps + percentages)
[Mapper: Extract time labels & battery values]
  ↓ (xAxisData: ["00:00", "00:15", ...], seriesData: [80, 78, null, ...])
[Chart Options: Configure single Y-axis 0-100]
  ↓ (ECharts option with line + missing data visualization)
[LineChart Renderer: Render interactive line]
  ↓ (on hover/click)
[Parent: Update focused point, display related schedules]
```

### Trading Performance: Dual-Axis, Multi-Series
```
API Response
  ↓ (rows with power, cost, price data)
[Mapper 1: Extract power & price series]
  ↓ (series with data indexed by row)
[Mapper 2: Build left/right Y-axes]
  ↓ (power axis in kW, price axis in £/MWh)
[Chart Options: Configure dual-axis setup]
  ↓ (ECharts option with synchronized axes)
[TradingLineChart Renderer: Render dual-axis visualization]
  ↓ (on hover/click)
[Parent: Update metrics, show performance breakdown]
```

---

## How This Applies to Your echarts-prod

Your implementation is on the right track! Here's the mapping:

**Your Component Structure:**
```
Chart.tsx                    ↔ LineChart/TradingLineChart
chartOptions.ts              ↔ useChartOption / buildChartOption
BatteryHistoryChart.tsx      ↔ BatteryHistoryChart + mappers
EnergyChart.tsx              ↔ Similar to TradingPerformanceChart
useBatteryData.ts            ↔ useGetBatteryPercentage
utils/*                      ↔ Mapper functions
```

**Your Data Flow Is Following The Pattern:**
1. ✅ Hooks fetch raw data (useEnergyData, useBatteryData)
2. ✅ Utils/Mappers transform it (buildStackedSeries, parseConstituentSeries)
3. ✅ Chart options configured (chartOptions.ts)
4. ✅ Chart component renders (Chart.tsx with ZRenderer for interactions)
5. ✅ Events bubble up (onSelect, onFocus callbacks)

**Key Advantages of This Pattern:**
- Clear separation of concerns (fetch → transform → render)
- Easy to test each layer independently
- Reusable components and utilities
- Predictable data transformations
- Type-safe throughout the pipeline
