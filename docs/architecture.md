# FraudDNA 360 - System Architecture

FraudDNA 360 moves from reactive, complaint-driven fraud investigation toward proactive fraud intelligence.

## 5-Layer Integrated Pipeline

```
┌───────────────────────────┐
│ Layer 1: Early Detection  │  Detect structuring & transaction splitting (e.g. ₹5,00,000 → sub-accounts)
└─────────────┬─────────────┘
              │
              ▼
┌───────────────────────────┐
│ Layer 2: Network Graph    │  Build adjacency graphs of Mule accounts, shared IP/phone, & ATM usage
└─────────────┬─────────────┘
              │
              ▼
┌───────────────────────────┐
│ Layer 3: AI Predictions   │  Forecast WHERE (Hotspot ATM Cluster) and WHEN (Time Window)
└─────────────┬─────────────┘
              │
              ▼
┌───────────────────────────┐
│ Layer 4: Dynamic Risk     │  Recalculate dynamic risk scores (e.g. 58 → 82) with explainability
└─────────────┬─────────────┘
              │
              ▼
┌───────────────────────────┐
│ Layer 5: Response & Lead  │  Generate priority investigator alerts and recommended action leads
└───────────────────────────┘
```

## System Components

1. **Frontend**: React + Vite + Tailwind CSS + Recharts + Interactive SVG Network Graph.
2. **Backend**: Express REST API with modular 5-layer service architecture.
3. **Database**: MySQL relational database (`frauddna360`) with connection pool (`mysql2`) and automatic in-memory seed store fallback.
