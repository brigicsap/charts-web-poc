# 📁 File Reference Guide: Where to Find the Data Flow

## Your Project Structure

```
charts-web-poc/
├── app/echarts-prod/
│   ├── page.tsx                    ← Entry point (demo page)
│   ├── api/[chart]/route.ts        ← API endpoint for mock data
│   │
│   ├── hooks/                      ← FETCH LAYER
│   │   ├── useBatteryData.ts       │ Hooks fetch data via React Query
│   │   ├── useEnergyData.ts        │
│   │   ├── useChartPalette.ts      │
│   │   └── index.ts                │ Barrel export
│   │
│   ├── data/                       ← FETCH + TRANSFORM LAYER
│   │   ├── queries.tsx             │ DataProvider + query helpers
│   │   ├── dates.ts                │ Date utilities & formatters
│   │   ├── contracts.ts            │ Zod schemas for validation
│   │   ├── mappers.ts              │ Data transformation functions
│   │   └── mockResponses.ts        │ Mock data generation
│   │
│   ├── utils/                      ← TRANSFORM LAYER
│   │   ├── applyChartHighlight.ts  │ Reusable transformation functions
│   │   ├── buildStackedSeries.ts   │
│   │   ├── parseConstituentSeries.ts│
│   │   ├── formatTimestamp.ts      │
│   │   ├── toGBP.ts                │
│   │   ├── accumulateCost.ts       │
│   │   ├── round2.ts               │
│   │   ├── getMissingRanges.ts     │
│   │   ├── formatDailyTimeTick.ts  │
│   │   ├── buildQuarterHourSlots.ts│
│   │   └── index.ts                │ Barrel export
│   │
│   ├── components/                 ← CONFIG + RENDER LAYER
│   │   ├── Chart.tsx               │ Core reusable chart component
│   │   ├── chartOptions.ts         │ Chart configuration builders
│   │   ├── BatteryHistoryChart.tsx │ Battery chart component
│   │   ├── EnergyChart.tsx         │ Energy chart component
│   │   ├── CustomerAppRetention.tsx│ Example chart component
│   │   ├── ThroughputWarrantyLimit.tsx│
│   │   ├── SavingsChart.tsx        │
│   │   ├── WeeklyActiveUsers.tsx   │
│   │   ├── LegendValues.tsx        │ UI component for legend
│   │   └── DataControls.tsx        │ UI for user controls
│   │
│   └── notes.ts                    ← Implementation notes
```

---

## Key Files by Data Flow Layer

### FETCH LAYER (API Call → Data)

| File | Purpose | Key Functions |
|------|---------|---------------|
| **hooks/useBatteryData.ts** | Fetch battery data | `useBatteryData()` |
| **hooks/useEnergyData.ts** | Fetch energy data | `useEnergyData()` |
| **data/queries.tsx** | React Query setup | `DataProvider`, `getRequest()`, `fetchResponse()` |
| **data/contracts.ts** | Data validation | Zod schemas |
| **data/mockResponses.ts** | Mock data gen | `makeBatteryResponse()`, `makeEnergyResponse()` |

**How It Works**:
1. Component calls `useBatteryData()` hook
2. Hook uses React Query to call `fetchResponse()`
3. Response is validated against Zod schema
4. Data returned to component (with loading/error states)

**Example**:
```typescript
// In component:
const { data, isLoading } = useBatteryData({ /* params */ })

// In hook (useBatteryData.ts):
useQuery({
  queryKey: [...],
  queryFn: () => fetchResponse(url, schema, signal)
})
```

---

### TRANSFORM LAYER (API Data → Chart Format)

**Utilities** (`utils/*.ts`):
| File | Purpose | Example Input/Output |
|------|---------|-----|
| **parseConstituentSeries.ts** | Extract energy by type | `[{constituentDatapoints}]` → `[{time, type1, type2}]` |
| **buildStackedSeries.ts** | Create stacked bars | `ChartSeries[]` → `BarSeriesOption[]` |
| **formatTimestamp.ts** | Format time for display | `"2026-04-22T00:00:00Z"` → `"00:00"` |
| **toGBP.ts** | Convert money format | `{units, nanos}` → `123.45` |
| **accumulateCost.ts** | Add money values | `current + {units, nanos}` → properly rounded |
| **round2.ts** | Round to 2 decimals | `1.239` → `1.24` |
| **getMissingRanges.ts** | Detect data gaps | `[1, 2, null, null, 5]` → `[[2,3]]` |

**Mappers** (`data/mappers.ts`):
```typescript
// Main mapping functions:
mapEnergyChart() // API response → chart data
mapBatteryChart() // API response → chart data
constituentValue() // Extract specific metric from datapoints
```

**Date Utils** (`data/dates.ts`):
```typescript
getDateRange() // "2026-04-22" + "day" → {from, to}
formatChartTimestamp() // Timezone-aware time formatting
```

**How It Works**:
```
API Response (raw)
    ↓
Parse/Extract (parseConstituentSeries)
    ↓
Transform (buildStackedSeries, buildQuarterHourSlots)
    ↓
Format (formatTimestamp, toGBP, round2)
    ↓
Chart Data (xAxisData, seriesData)
```

---

### CONFIG LAYER (Chart Data → ECharts Config)

| File | Purpose | Key Functions |
|------|---------|---------------|
| **components/chartOptions.ts** | Build chart options | `baseOption()`, `categoryAxes()`, `valueAxis()` |

**How It Works**:

```typescript
// chartOptions.ts exports:
export function baseOption(): EChartsOption { /* ... */ }
export function categoryAxes(): XAXisComponentOption { /* ... */ }
export function valueAxis(): YAxisComponentOption { /* ... */ }

// Components combine them:
const option = {
  ...baseOption(),
  xAxis: categoryAxes(),
  yAxis: valueAxis(),
  series: buildStackedSeries(...)
}
```

**What Each Does**:
- `baseOption()`: Grid, tooltip, animation, general settings
- `categoryAxes()`: X-axis with time labels, formatting
- `valueAxis()`: Y-axis with min/max, unit labels

---

### RENDER LAYER (ECharts Config → SVG Chart)

| File | Purpose | Key Props |
|------|---------|-----------|
| **components/Chart.tsx** | Core chart component | `option`, `interaction`, `onFocus`, `onSelect` |
| **components/BatteryHistoryChart.tsx** | Battery chart wrapper | `data`, `range`, `onFocusedDataPointChange` |
| **components/EnergyChart.tsx** | Energy chart wrapper | `data`, `response`, `onSelect` |

**How It Works**:

```typescript
// Components pass config to Chart:
<Chart
  option={chartOption}
  interaction="line"
  initialIndex={latestIndex}
  onFocus={handleFocus}
  onSelect={handleSelect}
/>

// Chart.tsx does:
1. Initialize ECharts instance in useEffect
2. Set up ResizeObserver for responsive sizing
3. Update options when props change
4. Attach ZRenderer mouse event handlers
5. Convert pixel coords to data indices
6. Emit interaction events to parent
```

---

### DISPLAY LAYER (Events → UI Update)

| File | Purpose | Handles |
|------|---------|---------|
| **page.tsx** | Demo page | State management, chart orchestration |
| **components/DataControls.tsx** | User controls | Date selection, resolution toggle |
| **components/LegendValues.tsx** | Legend display | Shows values for focused point |

**How It Works**:

```typescript
// page.tsx:
const [selectedDate, setSelectedDate] = useState()
const [focused, setFocused] = useState()

return (
  <>
    <DataControls onChange={setSelectedDate} />
    <BatteryHistoryChart 
      date={selectedDate}
      onFocus={setFocused}
    />
    <LegendValues focused={focused} />
  </>
)
```

---

## Following the Flow Through One Example

### Battery History: From API to Render

**Step 1: Component calls hook** (page.tsx)
```typescript
const { data } = useBatteryData({ selectedDate, resolution })
```
↓ File: `hooks/useBatteryData.ts`

**Step 2: Hook fetches via React Query** (hooks/useBatteryData.ts)
```typescript
queryFn: () => fetchResponse(url, schema, signal)
```
↓ File: `data/queries.tsx`

**Step 3: Validate response** (data/queries.tsx)
```typescript
const result = schema.safeParse(await response.json())
```
↓ File: `data/contracts.ts` (defines schema)

**Step 4: Map to chart format** (data/mappers.ts or inline)
```typescript
const { xAxisData, seriesData } = mapBatteryChart(response)
```
↓ File: `data/mappers.ts`

**Step 5: Build chart options** (components/chartOptions.ts)
```typescript
const option = {
  ...baseOption(),
  xAxis: categoryAxes(),
  yAxis: valueAxis(),
  series: [{ type: 'line', data: seriesData }]
}
```
↓ File: `components/chartOptions.ts`

**Step 6: Render chart** (components/BatteryHistoryChart.tsx)
```typescript
<Chart
  option={option}
  interaction="line"
  onFocus={handleFocus}
/>
```
↓ File: `components/Chart.tsx`

**Step 7: User interaction** (components/Chart.tsx)
```typescript
// ZRenderer mousemove → getDataIndex() → applyChartHighlight()
// → onFocus() callback → parent updates display
```
↓ File: `page.tsx` (handles onFocus event)

**Step 8: Display update** (page.tsx + components/LegendValues.tsx)
```typescript
<LegendValues focused={focused} />
```

---

## Key Relationships

### Component Dependencies
```
page.tsx (entry point)
├── DataControls.tsx (user input)
├── BatteryHistoryChart.tsx (chart wrapper)
│   └── Chart.tsx (core chart)
├── EnergyChart.tsx (chart wrapper)
│   └── Chart.tsx (core chart)
├── LegendValues.tsx (data display)
└── useBatteryData, useEnergyData (data fetching)
    └── queries.tsx (React Query setup)
        └── mockResponses.ts / API
```

### Data Transformation Pipeline
```
mockResponses.ts (or API)
├── mappers.ts (high-level transformation)
│   └── utils/*.ts (specific transformations)
│       ├── parseConstituentSeries.ts
│       ├── buildStackedSeries.ts
│       ├── formatTimestamp.ts
│       └── toGBP.ts
└── dates.ts (date/time utilities)
```

### Chart Configuration Assembly
```
chartOptions.ts
├── baseOption() → Grid, tooltip, animation
├── categoryAxes() → X-axis config
├── valueAxis() → Y-axis config
└── (combined by components)
    └── Chart.tsx (renders with ECharts)
```

---

## How to Extend This

### Add a New Chart
1. Create component in `components/NewChart.tsx`
2. Add mapper in `utils/mapNewChart.ts`
3. Add hook in `hooks/useNewData.ts`
4. Add options builder in `components/chartOptions.ts`
5. Compose in `page.tsx`

### Add a New Data Source
1. Create hook in `hooks/use<Source>Data.ts`
2. Update `data/queries.tsx` with new endpoint
3. Update `data/contracts.ts` with schema
4. Create mapper in `utils/`
5. Use in existing chart components

### Add a New Interaction
1. Add handler in `Chart.tsx`
2. Emit event via callback
3. Handle in parent component
4. Update display/state

---

## Quick File Search Cheat Sheet

**Need to understand how data flows?**
- Start: `hooks/use*Data.ts`
- Middle: `data/mappers.ts` + `utils/*.ts`
- End: `components/Chart.tsx`

**Need to customize chart appearance?**
- Look in: `components/chartOptions.ts`

**Need to add a new chart type?**
- Copy: `components/BatteryHistoryChart.tsx`
- Modify: `components/chartOptions.ts`
- Test with: mock data from `data/mockResponses.ts`

**Need to change how data is formatted?**
- Check: `utils/*.ts` files
- Add new: `utils/myNewFormatter.ts`
- Export from: `utils/index.ts`

**Need to understand mock data?**
- Read: `data/mockResponses.ts`
- Run with real API: Update `data/queries.tsx`
