# 📚 Documentation Index

Complete guide to echarts-prod data flow architecture.

## Four Guides

| Guide | Focus | Time |
|-------|-------|------|
| **[DATA_FLOW_SUMMARY.md](./DATA_FLOW_SUMMARY.md)** | Visual overview of the flow | 10 min |
| **[DATA_FLOW_WALKTHROUGH.md](./DATA_FLOW_WALKTHROUGH.md)** | Battery History & Trading Performance | 20 min |
| **[PATTERN_ALIGNMENT.md](./PATTERN_ALIGNMENT.md)** | Your code vs apps-platform | 15 min |
| **[FILE_REFERENCE_GUIDE.md](./FILE_REFERENCE_GUIDE.md)** | Where's the code? How to extend? | 10 min |

## Navigation

### Learn the pattern
Read in order: Summary → Walkthrough → Alignment → Reference

### Find specific code
→ [FILE_REFERENCE_GUIDE.md](./FILE_REFERENCE_GUIDE.md)

### Add a new chart
→ [FILE_REFERENCE_GUIDE.md](./FILE_REFERENCE_GUIDE.md) section "How to Extend"

### Understand your implementation
→ [PATTERN_ALIGNMENT.md](./PATTERN_ALIGNMENT.md)

---

## The Universal Pattern

```
API → Fetch (React Query hook)
  ↓
Transform (Utils + Mapper)
  ↓
Config (Chart Options Builder)
  ↓
Render (Chart Component)
  ↓
Interactive Chart
```

This pattern handles all chart types: time series, multi-axis, stacked bars, etc.

---

## Project Structure

```
echarts-prod/
├── hooks/          # Fetch layer (React Query)
├── data/           # Fetch + Transform (mappers, queries)
├── utils/          # Transform layer (single-purpose functions)
├── components/     # Config + Render (chart options, Chart.tsx)
└── page.tsx        # Display layer
```

---

## Your Implementation ✅

- ✅ **Fetch Layer** — React Query hooks manage data + caching
- ✅ **Transform Layer** — Utils folder has single-purpose functions
- ✅ **Config Layer** — chartOptions.ts builds ECharts config
- ✅ **Render Layer** — Chart.tsx handles interactions via ZRenderer
- ✅ **Display Layer** — page.tsx coordinates state & events

**Status:** Production-ready. Ready to connect to real data.

---

## Next Steps

1. Read the guides (1 hour total)
2. Use FILE_REFERENCE_GUIDE to navigate code
3. Connect to real API endpoints
4. Add new charts following the same pattern

Start with [DATA_FLOW_SUMMARY.md](./DATA_FLOW_SUMMARY.md) 🚀
