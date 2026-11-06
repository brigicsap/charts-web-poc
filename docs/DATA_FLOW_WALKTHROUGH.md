# 📊 Data Flow Walkthrough

Detailed step-by-step for two real examples from apps-platform.

## Battery History (Single-Axis Time Series)

### Flow Diagram
```
User selects date range
  ↓
useGetBatteryPercentage hook (React Query)
  ↓ API Response: { dataPoints: [{ timestamp, batteryPercentage }, ...] }
  ↓
useMappedChartData: { xAxisData: ['10:00', '11:00', ...], seriesData: [80, 78, ...] }
  ↓
useChartOption: { xAxis, yAxis, series, tooltip, ... }
  ↓
LineChart renders → ZRenderer handles interactions
  ↓
User hovers/clicks → BatteryHistoryChart receives event
```

### Data Transformation Steps

**Step 1: API Response**
```json
{
  "dataPoints": [
    { "timestamp": "2026-04-22T00:00:00Z", "batteryPercentage": 80 },
    { "timestamp": "2026-04-22T00:15:00Z", "batteryPercentage": 78 },
    { "timestamp": "2026-04-22T00:30:00Z", "batteryPercentage": 82 }
  ]
}
```

**Step 2: Map to Chart Format**
```ts
// data/mappers.ts
input: { dataPoints: [...] }
output: {
  xAxisData: ['00:00', '00:15', '00:30'],  // via formatTimestamp
  seriesData: [80, 78, 82],                // via round2
  pointsByIndex: { 0: {...}, 1: {...}, ... }
}
```

**Step 3: Build Chart Config**
```ts
// components/chartOptions.ts
baseOption = {
  tooltip: { trigger: 'axis' },
  grid: { top: 60, right: 100, bottom: 30, left: 60 }
}

xAxis = { type: 'category', data: xAxisData }

yAxis = { type: 'value', min: 0, max: 100 }

series = {
  data: seriesData,
  type: 'line',
  smooth: true,
  // ... styling
}

return { ...baseOption, xAxis, yAxis, series }
```

**Step 4: Render & Interact**
```ts
// Chart.tsx
<Chart 
  options={chartOptions}
  onHover={(index) => setFocusedPoint(index)}
  onClick={(index) => setSelectedPoint(index)}
/>
```

---

## Trading Performance (Dual-Axis Multi-Series)

Same pattern but with two Y-axes.

### Flow Diagram
```
User selects trading period
  ↓
useGetTradingPerformance hook
  ↓ API Response: { powerData, priceData }
  ↓
useMappedChartData: { xAxisData, powerSeries, priceSeries }
  ↓
useChartOption (dual-axis config)
  ↓
LineChart renders two series on different axes
  ↓
Interactions via ZRenderer
```

### Key Difference: Dual Axes

**Step 1: API Response**
```json
{
  "powerData": [
    { "timestamp": "2026-04-22T00:00:00Z", "power": 5.2 },
    { "timestamp": "2026-04-22T00:15:00Z", "power": 5.5 }
  ],
  "priceData": [
    { "timestamp": "2026-04-22T00:00:00Z", "price": 0.45 },
    { "timestamp": "2026-04-22T00:15:00Z", "price": 0.47 }
  ]
}
```

**Step 2: Map to Chart Format**
```ts
// powerSeries and priceSeries need different units
output: {
  xAxisData: ['00:00', '00:15'],
  powerSeries: { data: [5.2, 5.5], yAxisIndex: 0 },  // Left axis
  priceSeries: { data: [0.45, 0.47], yAxisIndex: 1 } // Right axis
}
```

**Step 3: Build Dual-Axis Config**
```ts
xAxis = { type: 'category', data: xAxisData }

yAxis = [
  { type: 'value', name: 'Power (kW)' },      // Index 0 = left
  { type: 'value', name: 'Price (£/kWh)', position: 'right' }  // Index 1 = right
]

series = [
  { data: powerSeries, type: 'line', yAxisIndex: 0 },
  { data: priceSeries, type: 'line', yAxisIndex: 1 }
]
```

---

## Key Patterns

### 1. Data Validation
```ts
// At fetch boundary (fetchResponse in queries.tsx)
const schema = z.object({
  dataPoints: z.array(z.object({
    timestamp: z.string(),
    batteryPercentage: z.number()
  }))
})
const validated = schema.parse(apiResponse)
```

### 2. Single-Purpose Utils
Each utility does one thing:
```ts
formatTimestamp(date)      // → "10:00"
round2(number)             // → 75.48
toGBP(pence)               // → "£0.45"
buildStackedSeries(data)   // → { data, stack: 'group' }
getMissingRanges(data)     // → [{ start, end }]
```

### 3. Reusable Chart Component
```ts
<Chart 
  options={options}           // Any valid ECharts config
  onHover={(index) => {...}}  // Callback when user hovers
  onClick={(index) => {...}}  // Callback when user clicks
/>
```

### 4. ZRenderer Integration
Chart.tsx uses ZRenderer to:
- Capture pixel-level mouse events
- Convert pixel coordinates to data indices
- Call parent callbacks with data point info

---

## Your Implementation

You already have all these pieces:

- ✅ `hooks/` — React Query hooks like useBatteryData
- ✅ `data/mappers.ts` — Data transformation functions
- ✅ `utils/` — Single-purpose utilities
- ✅ `components/chartOptions.ts` — Config builders
- ✅ `components/Chart.tsx` — Reusable render component
- ✅ `page.tsx` — Display layer orchestration

**Just connect to real API endpoints and you're ready to go.**

---

## Glossary

| Term | Meaning |
|------|---------|
| **ZRenderer** | ECharts' canvas rendering engine for mouse events |
| **yAxisIndex** | Which Y-axis a series uses (0=left, 1=right) |
| **React Query** | Data fetching + caching library |
| **Zod** | TypeScript schema validation |
| **seriesData** | Array of values to plot |
| **xAxisData** | Array of X-axis labels |
