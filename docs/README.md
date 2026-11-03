# 📚 Charts Data Flow Documentation

Complete guide to understanding how data flows from API calls to rendered charts in your echarts-prod project.

## 📖 Start Here

**New to the project?** → Read **[DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md)** first

It will guide you through the recommended reading order based on what you want to learn.

---

## 📂 Documentation Files

### 1. **[DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md)** - Navigation Guide
Index of all documents with quick navigation shortcuts.

**Use this to:**
- Find what you want to learn
- Get the recommended reading order
- Quick lookup by use case

---

### 2. **[DATA_FLOW_SUMMARY.md](./DATA_FLOW_SUMMARY.md)** - Visual Overview
High-level visual walkthrough with diagrams.

**Use this to:**
- Get a quick understanding of the data flow
- See the big picture before diving deep
- Understand the universal pattern

**Reading time:** 10 min

---

### 3. **[DATA_FLOW_WALKTHROUGH.md](./DATA_FLOW_WALKTHROUGH.md)** - Deep Dive
Comprehensive step-by-step walkthrough of two real examples.

**Use this to:**
- Understand every detail of the data transformation
- See Battery History (Consumer-Web) complete flow
- See Trading Performance (Supplier-Web) complete flow
- Learn with real code examples

**Reading time:** 20 min

---

### 4. **[PATTERN_ALIGNMENT.md](./PATTERN_ALIGNMENT.md)** - Your Code vs Production
Comparison of your echarts-prod vs apps-platform architecture.

**Use this to:**
- Verify your implementation matches the production pattern
- See how your code maps to apps-platform examples
- Understand what you're doing right
- Learn what to add for production

**Reading time:** 15 min

---

### 5. **[FILE_REFERENCE_GUIDE.md](./FILE_REFERENCE_GUIDE.md)** - Code Navigation
Where to find what in your codebase.

**Use this to:**
- Locate specific files by function
- Understand project structure
- Follow a data flow step-by-step through code
- Learn how to extend/add new features

**Reading time:** 10 min (reference)

---

## 🎯 Quick Navigation

### I want to understand how data flows
Read in order:
1. [DATA_FLOW_SUMMARY.md](./DATA_FLOW_SUMMARY.md) (visual)
2. [DATA_FLOW_WALKTHROUGH.md](./DATA_FLOW_WALKTHROUGH.md) (details)
3. [PATTERN_ALIGNMENT.md](./PATTERN_ALIGNMENT.md) (your code)
4. [FILE_REFERENCE_GUIDE.md](./FILE_REFERENCE_GUIDE.md) (files)

**Total time:** ~55 minutes

---

### I want to find specific code
→ Use [FILE_REFERENCE_GUIDE.md](./FILE_REFERENCE_GUIDE.md)

See sections:
- "Key Files by Data Flow Layer"
- "Following the Flow Through One Example"
- "Quick File Search Cheat Sheet"

---

### I want to add a new chart
→ Use [FILE_REFERENCE_GUIDE.md](./FILE_REFERENCE_GUIDE.md)

See section: "How to Extend This"

---

### I want to understand how my code compares to production
→ Read [PATTERN_ALIGNMENT.md](./PATTERN_ALIGNMENT.md)

---

## 📊 The Data Flow (TL;DR)

```
API Call
  ↓
Fetch Layer (React Query hooks)
  ↓
Transform Layer (Mappers + Utils)
  ↓
Config Layer (Chart Options)
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

---

## ✅ Your Implementation

Your echarts-prod already follows the production pattern:

- ✅ **Fetch Layer** (hooks + React Query)
- ✅ **Transform Layer** (utils folder with reusable functions)
- ✅ **Config Layer** (chartOptions.ts)
- ✅ **Render Layer** (Chart.tsx with ZRenderer)
- ✅ **Display Layer** (page.tsx state management)

**Status:** Production-ready architecture

---

## 🚀 Next Steps

1. **Understand the pattern** (read docs)
2. **Connect to real data** (replace mock data with API calls)
3. **Add feature layers** (modals, navigation, error handling)
4. **Add polish** (skeleton loaders, error states)
5. **Write tests** (unit tests for each layer)

---

## 📚 Related Resources

- **Project code**: `../app/echarts-prod/`
- **Hooks**: `../app/echarts-prod/hooks/`
- **Utils**: `../app/echarts-prod/utils/`
- **Components**: `../app/echarts-prod/components/`
- **Main entry**: `../app/echarts-prod/page.tsx`

---

## 💡 Learning Tips

1. **Start with the summary** to see the big picture
2. **Follow a concrete example** step-by-step
3. **Map it to your code** using the file reference guide
4. **Verify it matches the pattern** described in alignment guide

Each document builds on the previous:
- Summary → Walkthrough → Alignment → Reference

---

## ✨ Key Insights

### Universal Pattern
The same architecture works for:
- Single-axis time series (Battery History)
- Dual-axis multi-series (Trading Performance)
- Stacked bar charts (Energy)
- Any visualization type

### Separation of Concerns
Each layer has a specific responsibility:
- **Fetch**: Get data from API
- **Transform**: Convert to chart format
- **Config**: Build chart configuration
- **Render**: Display interactive chart
- **Display**: Update surrounding UI

### Type Safety
Throughout the entire flow:
- Zod schemas validate API responses
- TypeScript types ensure correctness
- No data transformation ambiguity

---

**Ready to dive in? Start with [DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md)!** 🚀
