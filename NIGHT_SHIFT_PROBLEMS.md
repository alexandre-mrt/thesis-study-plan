# Night Shift Problems — 2026-03-30

> Items that need your attention. Run `grep -r "NIGHT-SHIFT-REVIEW" .` to find marked code.

## Summary
- 2 uncertainties logged
- 0 tasks blocked
- 0 fixes failed
- 0 assumptions made

## Problems

### UNCERTAINTY: study-guide.js exceeds 800 line limit (925 lines)
- **Iteration**: 1
- **File**: /Users/alexandremourot/projects/thesis-study-plan/study-guide.js
- **What I needed**: Guidance on whether to extract builder functions into a separate file
- **What I did**: Kept all rendering functions in study-guide.js as the task specified. Replaced color-mix() CSS with rgba() fallback and inline style.color for better browser compatibility.
- **Confidence**: MEDIUM
- **User action needed**: Consider extracting buildHistorySection/buildLimitationsSection/buildExercisesSection into a separate file if the 800 line limit is strict.

### UNCERTAINTY: Task says "ALL 12 concepts" but day2-guide.js has 11
- **Iteration**: 1
- **File**: /Users/alexandremourot/projects/thesis-study-plan/day2-guide.js
- **What I needed**: Clarification on whether a 12th concept was expected
- **What I did**: Enriched all 11 existing concepts (6 in block1 Anonymous Credentials + 5 in block2 TEEs) with history, limitations, and exercises. Did not add a new concept since the task said to enrich existing ones.
- **Confidence**: MEDIUM
- **User action needed**: Verify if a 12th concept was intended (e.g., a "Confidential Computing" or "SGX Deprecation" concept). If so, add it to block2.
