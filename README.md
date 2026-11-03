# Charts Web POC

Production-ready charting proof-of-concept with ECharts. Demonstrates clean architecture patterns with separate fetch, transform, config, and render layers.

## Project Structure

```
app/
├── echarts-prod/          ⭐ Main implementation
│   ├── components/        # Chart components & options
│   ├── data/              # Mappers, queries, mock data
│   ├── hooks/             # React Query data hooks
│   ├── utils/             # Reusable utility functions
│   ├── api/               # API routes
│   └── page.tsx           # Entry point
├── echarts/               # Original reference
├── recharts/              # Alternative library
├── victory/               # Alternative library
└── chartjs/               # Alternative library

docs/                      # Comprehensive data flow documentation
├── README.md              # Quick navigation
├── DATA_FLOW_SUMMARY.md   # Visual overview
├── DATA_FLOW_WALKTHROUGH.md # Step-by-step examples
├── PATTERN_ALIGNMENT.md   # vs apps-platform
└── FILE_REFERENCE_GUIDE.md # Code navigation
```

## Quick Start

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) → Click "ECharts (Prod)"

## Architecture

```
API → Fetch (React Query) → Transform (Utils) → Config → Render → Chart
```

- **Fetch**: `hooks/` (useBatteryData, useEnergyData, etc.)
- **Transform**: `utils/` + `data/mappers.ts` (format, calculate, convert)
- **Config**: `components/chartOptions.ts` (build ECharts options)
- **Render**: `components/Chart.tsx` (ZRenderer interactions)

## Learn More

Start with **`docs/README.md`** for complete data flow documentation with real examples from apps-platform.

## Status

✅ Production-ready | ✅ Zero lint errors | ✅ Fully documented | ✅ Type-safe
