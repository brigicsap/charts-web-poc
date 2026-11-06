# 📊 Data Flow Summary

## The Pattern

```
API Call
  ↓
Fetch (React Query hook)
  ↓
Transform (Utils + Mapper)
  ↓
Config (Chart Options)
  ↓
Render (Chart.tsx with ZRenderer)
  ↓
Interactive Chart
  ↓
User Interaction → Parent Updates
```

Works for any chart type: time series, dual-axis, stacked bars, etc.

---

## Example: Battery History

### Input
- API: timestamp + battery percentage
- Mock data: hourly readings

### Fetch Layer
```ts
// hooks/useBatteryData.ts
const { data, isLoading } = useQuery(['battery'], () => fetchBatteryData())
```
- React Query handles caching & lifecycle
- Loading/error states managed automatically

### Transform Layer
```ts
// data/mappers.ts → mapBatteryData()
// utils/formatTimestamp.ts → format times
// utils/round2.ts → round percentages

transformed = {
  xAxisData: ['10:00', '11:00', '12:00', ...],
  seriesData: [75, 78, 82, ...],
}
```

### Config Layer
```ts
// components/chartOptions.ts
const options = {
  xAxis: { data: xAxisData, type: 'category' },
  yAxis: { type: 'value', min: 0, max: 100 },
  series: [{ data: seriesData, type: 'line', smooth: true }],
  tooltip: { ... },
}
```

### Render Layer
```ts
// components/Chart.tsx
<Chart options={options} onHover={handleHover} onClick={handleClick} />
```
- ZRenderer captures pixel events
- Converts to data indices
- Emits callbacks to parent

### Display Layer
```ts
// page.tsx
const [selectedIndex, setSelectedIndex] = useState(null)
const { data } = useBatteryData()
const options = buildChartOptions(data)

return <Chart {...} onChange={setSelectedIndex} />
```

---

## Example: Trading Performance

Similar pattern but with dual axes:
- Left axis (yAxisIndex: 0): Power (kW)
- Right axis (yAxisIndex: 1): Price (£/kWh)

Each series maps to its axis via `yAxisIndex` property.

Transform layer handles:
- Converting units
- Formatting currencies (toGBP utility)
- Aligning time points

---

## Key Takeaways

1. **One pattern, many charts** — Same flow for all visualizations
2. **Separation of concerns** — Each layer handles one job
3. **Reusable utilities** — Single-purpose functions compose well
4. **Type-safe** — TypeScript throughout, Zod validation at fetch boundary
5. **Testable** — Each layer can be tested independently

---

## Your Implementation ✅

All 5 layers are in place:
- ✅ Fetch: `hooks/` with React Query
- ✅ Transform: `utils/` + `data/mappers.ts`
- ✅ Config: `components/chartOptions.ts`
- ✅ Render: `components/Chart.tsx`
- ✅ Display: `page.tsx`

Ready to connect to real data. See [DATA_FLOW_WALKTHROUGH.md](./DATA_FLOW_WALKTHROUGH.md) for detailed step-by-step examples.
