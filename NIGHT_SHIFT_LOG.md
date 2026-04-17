# Night Shift Log — 2026-04-14

## Objective
Add paper recap cards (intuitive + technical) for all ~44 papers from papers.md, integrated into each chapter tab with full search support.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│  index.html                                         │
│  ├── Ch 2.1 tab                                     │
│  │   ├── [existing] study-guide concepts            │
│  │   └── [NEW] paper recap section (16 papers)      │
│  ├── Ch 2.2 tab                                     │
│  │   ├── [existing] study-guide concepts            │
│  │   └── [NEW] paper recap section (8 papers)       │
│  ├── ... (same for Ch 2.3–2.6)                      │
│  └── search bar → indexes concepts + papers         │
│                                                     │
│  New files:                                         │
│  ├── paper-guide.js     (rendering engine)          │
│  ├── paper-cards.css    (styles)                    │
│  ├── ch2X-papers-guide.js × 6  (data)              │
│  └── ch2X-papers-technical.js × 6 (data)           │
└─────────────────────────────────────────────────────┘
```

## Task Execution Plan

### Wave A (parallel, no deps)
- T1: paper-guide.js rendering module
- T2: paper-cards.css styles

### Wave B (parallel, no deps)
- T3: Ch 2.1 paper data (16 papers)
- T4: Ch 2.2 paper data (8 papers)
- T5: Ch 2.3 paper data (10 papers)
- T6: Ch 2.4+2.5+2.6 paper data (10 papers)

### Wave C (depends on A+B)
- T7: index.html integration
- T8: search.js extension

### Wave D (depends on C)
- T9: QA testing

### Wave E
- T10: Cleanup + PR

## Decisions
- Paper rendering in separate paper-guide.js, not modifying study-guide.js
- Ch 2.4+2.5+2.6 grouped in T6 (only 10 papers total)
- No AI recap badge — user prefers uniform look
