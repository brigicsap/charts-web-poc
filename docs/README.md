# 📚 Documentation

Complete guide to the echarts-prod data flow architecture.

## Quick Links

- **[DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md)** — Navigation hub
- **[DATA_FLOW_SUMMARY.md](./DATA_FLOW_SUMMARY.md)** — Visual overview (10 min)
- **[DATA_FLOW_WALKTHROUGH.md](./DATA_FLOW_WALKTHROUGH.md)** — Step-by-step examples (20 min)
- **[PATTERN_ALIGNMENT.md](./PATTERN_ALIGNMENT.md)** — Your code vs production (15 min)
- **[FILE_REFERENCE_GUIDE.md](./FILE_REFERENCE_GUIDE.md)** — Code navigation (reference)

## The Pattern

```
API → Fetch (React Query) → Transform (Utils) → Config → Render → Chart
```

## I want to...

**Understand the data flow** → Start with [DATA_FLOW_SUMMARY.md](./DATA_FLOW_SUMMARY.md)

**Find specific code** → Use [FILE_REFERENCE_GUIDE.md](./FILE_REFERENCE_GUIDE.md)

**See real examples** → Read [DATA_FLOW_WALKTHROUGH.md](./DATA_FLOW_WALKTHROUGH.md) (Battery History & Trading Performance)

**Add a new chart** → Follow [FILE_REFERENCE_GUIDE.md](./FILE_REFERENCE_GUIDE.md) section "How to Extend"

**Compare to production** → Read [PATTERN_ALIGNMENT.md](./PATTERN_ALIGNMENT.md)

## Status

✅ Production-ready | ✅ Zero lint errors | ✅ Fully documented | ✅ Type-safe
