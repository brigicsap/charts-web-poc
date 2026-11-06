# 📁 File Reference

Where to find code + how to extend.

## Structure

```
app/echarts-prod/
├── page.tsx              # Entry point / demo page
├── api/                  # Mock API endpoints
├── hooks/                # FETCH: React Query hooks
│   ├── useBatteryData.ts
│   └── useEnergyData.ts
├── data/                 # FETCH+TRANSFORM: Mappers, queries, validation
│   ├── queries.tsx       # React Query setup
│   ├── mappers.ts        # Data transformation
│   ├── contracts.ts      # Zod schemas
│   └── mockResponses.ts  # Mock data
├── utils/                # TRANSFORM: Single-purpose utilities
│   ├── formatTimestamp.ts
│   ├── toGBP.ts
│   ├── buildStackedSeries.ts
│   └── ... (9 total files)
├── components/           # CONFIG+RENDER: Charts & options
│   ├── Chart.tsx         # Core reusable chart
│   ├── chartOptions.ts   # Chart config builders
│   ├── BatteryHistoryChart.tsx
│   ├── EnergyChart.tsx
│   └── ... (other charts)
└── notes.ts              # Dev notes
```

## By Layer

| Layer | Files | Purpose |
|-------|-------|---------|
| **Fetch** | `hooks/`, `data/queries.tsx` | Get data from API via React Query |
| **Transform** | `utils/`, `data/mappers.ts` | Convert to chart format |
| **Config** | `components/chartOptions.ts` | Build ECharts options |
| **Render** | `components/Chart.tsx` | Draw & interact with chart |
| **Display** | `page.tsx` | Coordinate state & events |

## Key Files

### Chart.tsx
- Reusable chart component
- Handles ECharts lifecycle (init, resize, destroy)
- ZRenderer events → callbacks to parent
- Props: `options`, `onHover`, `onClick`, etc.

### chartOptions.ts
Functions that build ECharts config:
- `baseOption()` — common settings
- `categoryAxes()` — X-axis config
- `valueAxis()` — Y-axis config

Combine them: `{ ...baseOption, xAxis: categoryAxes(...), yAxis: valueAxis(...), ... }`

### utils/
Each file = one function:
- `formatTimestamp.ts` — format dates
- `toGBP.ts` — format currency
- `buildStackedSeries.ts` — build stacked chart data
- etc.

Import with barrel export: `import { formatTimestamp, toGBP } from '../utils'`

### hooks/
React Query hooks for each data source:
```ts
const { data, isLoading, error } = useBatteryData({ startDate, endDate })
```

## How to Add a Chart

1. **Create component** in `components/YourChart.tsx`
   ```ts
   import { Chart } from './Chart'
   import { buildChartOptions } from './chartOptions'
   
   export function YourChart({ data }) {
     const options = buildChartOptions(data, /* config */)
     return <Chart options={options} onHover={...} />
   }
   ```

2. **Create mapper** in `data/mappers.ts` to transform API data
   ```ts
   export function mapYourData(response) {
     return {
       xAxisData: response.labels,
       seriesData: response.values,
     }
   }
   ```

3. **Use in page.tsx**
   ```ts
   const { data } = useYourData()
   const transformed = mapYourData(data)
   return <YourChart data={transformed} />
   ```

4. **Add utilities as needed** to `utils/`

## Glossary

- **ZRenderer** — ECharts' canvas engine for mouse events
- **yAxisIndex** — Which Y-axis a series uses (0=left, 1=right)
- **seriesData** — Array of values to plot
- **xAxisData** — Array of labels/categories for X-axis
- **React Query** — Data fetching + caching library
- **Zod** — Schema validation library
