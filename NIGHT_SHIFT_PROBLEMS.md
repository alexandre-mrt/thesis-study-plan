# Night Shift Problems — 2026-03-30

> Items that need your attention. Run `grep -r "NIGHT-SHIFT-REVIEW" .` to find marked code.

## Summary
- 1 uncertainty logged
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
