# 📚 Documentation Index

This documentation explains the complete data flow from API calls to rendered charts, using real examples from apps-platform.

## 📖 Four-Part Guide

### 1. [DATA_FLOW_WALKTHROUGH.md](./DATA_FLOW_WALKTHROUGH.md) - Deep Dive (471 lines)
**The most comprehensive guide**

📍 What's inside:
- Complete Battery History flow (Consumer-Web)
- Complete Trading Performance flow (Supplier-Web)
- Step-by-step transformation for each
- Detailed input/output at each layer
- Code examples for each stage
- Key differences between the two examples

👉 **Start here if you want to understand:** Every detail of how data transforms from API response to rendered chart

---

### 2. [PATTERN_ALIGNMENT.md](./PATTERN_ALIGNMENT.md) - Comparison (343 lines)
**Your echarts-prod vs Production Pattern**

📍 What's inside:
- Visual architecture comparison
- Layer-by-layer alignment table
- Full data flow for each example
- Your implementation mapped to apps-platform
- What you could learn from apps-platform
- Migration path to real data

👉 **Start here if you want to understand:** How your project follows the proven production pattern

---

### 3. [DATA_FLOW_SUMMARY.md](./DATA_FLOW_SUMMARY.md) - Visual Overview (299 lines)
**High-level visual walkthrough**

📍 What's inside:
- Big-picture diagram of data flow
- Two side-by-side examples (Battery vs Trading)
- Your echarts-prod examples
- Key takeaways
- Next steps

👉 **Start here if you want:** A quick visual understanding of the flow

---

### 4. [FILE_REFERENCE_GUIDE.md](./FILE_REFERENCE_GUIDE.md) - Implementation Map (367 lines)
**Where to find what in the code**

📍 What's inside:
- Project folder structure
- Key files by data flow layer
- What each file does
- Step-by-step walkthrough of Battery History example
- Component dependencies
- Data transformation pipeline
- How to extend/add new features
- Quick search cheat sheet

👉 **Start here if you want:** To know which files contain what

---

## 🎯 Quick Navigation

### I want to understand the data flow
→ Read in order: 3 → 1 → 2 → 4

1. **[DATA_FLOW_SUMMARY.md](./DATA_FLOW_SUMMARY.md)** (10 min) - Get the visual
2. **[DATA_FLOW_WALKTHROUGH.md](./DATA_FLOW_WALKTHROUGH.md)** (20 min) - Deep dive
3. **[PATTERN_ALIGNMENT.md](./PATTERN_ALIGNMENT.md)** (15 min) - See how it applies
4. **[FILE_REFERENCE_GUIDE.md](./FILE_REFERENCE_GUIDE.md)** (10 min) - Know the files

### I want to find specific code
→ Use: **[FILE_REFERENCE_GUIDE.md](./FILE_REFERENCE_GUIDE.md)**

See sections:
- "Key Files by Data Flow Layer" → find what layer
- "Following the Flow Through One Example" → trace the steps
- "Quick File Search Cheat Sheet" → quick lookup

### I want to add a new chart
→ Use: **[FILE_REFERENCE_GUIDE.md](./FILE_REFERENCE_GUIDE.md)** → "How to Extend This"

### I want to understand how my code compares to production
→ Read: **[PATTERN_ALIGNMENT.md](./PATTERN_ALIGNMENT.md)**

---

## 📊 The Data Flow (At a Glance)

```
API Call
   ↓
Fetch Layer (Hook + React Query)
   ↓
Transform Layer (Mappers + Utilities)
   ↓
Config Layer (Chart Options Builder)
   ↓
Render Layer (Chart Component)
   ↓
Interactive SVG Chart
   ↓
User Interaction (Hover, Click)
   ↓
Callback Events
   ↓
Parent Component Updates Display
```

This pattern is used for:
- ✅ Battery History (single-axis time series)
- ✅ Trading Performance (dual-axis multi-series)
- ✅ Energy Charts (stacked bar charts)
- ✅ Any ECharts visualization

---

## 📂 Project Structure

```
echarts-prod/
├── hooks/                    ← FETCH LAYER
│   ├── useBatteryData.ts
│   └── useEnergyData.ts
├── data/                     ← FETCH + TRANSFORM
│   ├── queries.tsx
│   ├── mappers.ts
│   └── mockResponses.ts
├── utils/                    ← TRANSFORM LAYER
│   ├── parseConstituentSeries.ts
│   ├── buildStackedSeries.ts
│   └── formatTimestamp.ts
├── components/               ← CONFIG + RENDER LAYER
│   ├── chartOptions.ts
│   ├── Chart.tsx
│   ├── BatteryHistoryChart.tsx
│   └── EnergyChart.tsx
└── page.tsx                  ← DISPLAY LAYER
```

---

## 🔑 Key Concepts

### Fetch Layer
- React Query manages data fetching
- Custom hooks abstract API calls
- Caching & lifecycle management built-in
- Zod schemas validate responses

### Transform Layer
- Mappers convert API format → chart format
- Utilities handle specific calculations
- Each utility is single-purpose
- Composable and testable

### Config Layer
- Chart options builders create ECharts config
- Separate functions for axes, tooltips, etc
- Theme colors injected via tokens
- Type-safe configuration

### Render Layer
- Core Chart.tsx component is reusable
- ZRenderer provides low-level mouse events
- Interactions converted to parent callbacks
- Chart lifecycle handled automatically

### Display Layer
- Parent component receives events
- Updates local state
- Rerenders dependent UI
- Coordinates with other features

---

## 💡 Learning Tips

1. **Start with the summary** (DATA_FLOW_SUMMARY.md) to see the big picture
2. **Follow a concrete example** step-by-step in DATA_FLOW_WALKTHROUGH.md
3. **Map it to your code** using FILE_REFERENCE_GUIDE.md
4. **Verify it matches the pattern** in PATTERN_ALIGNMENT.md

Each document builds on the previous one:
- Summary → Walkthrough → Alignment → Reference

---

## ✅ Your Implementation Status

Your echarts-prod follows the production pattern:
- ✅ Fetch Layer (hooks + React Query)
- ✅ Transform Layer (utils folder with single-purpose functions)
- ✅ Config Layer (chartOptions.ts)
- ✅ Render Layer (Chart.tsx with ZRenderer)
- ✅ Display Layer (page.tsx state management)

The architecture is **production-ready**. You just need to:
1. Connect to real API endpoints
2. Add feature containers (modals, navigation)
3. Add error boundaries & loading states
4. Write tests for each layer

---

## 📚 Related Files

- **CODE**: See `app/echarts-prod/` for implementation
- **TESTS**: See test files for validation examples
- **TYPES**: `data/contracts.ts` for data shapes
- **STYLING**: Theme tokens injection in chart components
- **DEMO**: `page.tsx` for usage examples

---

## 🚀 Next Steps

1. **Understand**: Read documentation in order (3→1→2→4)
2. **Explore**: Use FILE_REFERENCE_GUIDE to navigate code
3. **Apply**: Connect to real data endpoints
4. **Extend**: Add new charts following the same pattern
5. **Test**: Write unit tests for each layer

Good luck! 🎉
