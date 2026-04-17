# T18 QA Report — Thesis Study Plan

**Date**: 2026-04-17
**Branch**: `feat/night-shift-2026-04-17-plan-sota`
**Verdict**: **ITERATE**

---

## Sprint Contract Verification

| # | Scenario | Result | Notes |
|---|----------|--------|-------|
| 1 | Initial load — Ch 2.1 active, cards visible, progress bar | PASS | 44 resource cards, progress bar at 0%, Ch 2.1 active |
| 2 | Plan tab — grid ≥60 cells | FAIL | Grid never renders on load. `plan.js defer` does not execute in Puppeteer/Chrome headless environment; `window.PLAN` remains undefined |
| 3 | Plan modal — objectives/materials/exercises visible | PASS (conditional) | Works correctly when `PLAN.init()` is manually triggered. Modal design is excellent |
| 4 | Plan completion persists across reload | PASS (conditional) | `localStorage` correctly stores and restores completion state |
| 5 | Keyboard shortcuts 1-6, F, P, Z | PASS | All shortcuts work correctly. F→flashcards, P→plan, Z→ZK deep dive, 1-6→chapters |
| 6 | SOTA cards Ch 2.5 — ≥10 cards, KaTeX math | PARTIAL | 12 cards found, expand works, but KaTeX math NOT rendered (raw LaTeX shown) |
| 7 | Flashcards — filter chips, flip, Got it | PARTIAL | Flip works, Got it advances card, but counter shows `0 / 0` throughout |
| 8 | Search "bulletproofs" — results with chapter tags | PASS | 46 results, chapter tags present. Results dropdown is partially off-screen at 1440px |
| 9 | Weekly review modal — 10 items, Skip closes | FAIL | Modal opens (today is Friday) but renders as unstyled inline HTML due to CSS parse error. Skip works |
| 10 | Dual Pomodoro — chapters=25/5, plan=50/10 | PASS | Correctly switches mode indicator on tab change |
| 11 | Print stylesheet — nav hidden | UNTESTABLE | Cannot emulate `@media print` via JS. `html.print-only` proxy does not hide nav |
| 12 | All chapters load (2.1-2.6, Rust, Method) | PASS | All 8 tabs render. Method has 0 resource cards (expected — inline content) |

---

## Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| Functionality | 2.5/5 | Plan grid never auto-initializes; weekly review modal unstyled; SOTA KaTeX broken; flashcard counter broken |
| Usability | 3/5 | Nav search clipped at 1440px; plan grid requires manual JS to trigger; weekly review is visually confusing |
| Visual Quality | 4/5 | Plan grid, modals, flashcards, SOTA cards all look polished once working. CSS parse bug degrades T14 styles |
| Robustness | 3/5 | Correct tab restoration; localStorage persistence works; but plan.js defer timing creates fragile initialization |
| **Weighted Total** | **3.0/5** | Func×0.4 + Usab×0.25 + Vis×0.2 + Rob×0.15 = 1.0+0.75+0.8+0.45 |

---

## Bugs

### CRITICAL

#### BUG-01: `plan.js defer` does not execute — Plan grid never renders
- **File**: `index.html:1418`, `app.js:218`
- **Severity**: critical
- **Symptom**: When Plan tab is clicked, `window.PLAN` is `undefined`. The grid never initializes. The plan section remains empty.
- **Root cause**: `plan.js` has `defer` attribute but the three scripts that follow it (`flashcard-data.js`, `flashcards.js`, `app.js`) do NOT have `defer`. In Chrome's execution order, deferred scripts run after all synchronous scripts complete. However, `app.js` (sync) runs first, registers a `DOMContentLoaded` handler, and `restoreActiveDay()` is called. By this time `window.PLAN` is still `undefined`, so `switchPlan()` skips the `PLAN.init()` call. Even though `plan.js defer` eventually executes and sets `window.PLAN`, nobody calls `init()` again because `planInitialized` guard prevents re-entry on subsequent tab clicks after a failed first attempt — wait, actually the guard is `if (!planInitialized && window.PLAN)` so a second click WOULD call init. The real issue: in Puppeteer's headless Chrome, the deferred script appears not to execute at all before `evaluate()` calls run.
- **Fix**: Remove `defer` from `plan.js` and place it AFTER `app.js` at the bottom of `<body>`, or add `defer` to all scripts consistently.
- **Reproduction**: Load `index.html`, check `typeof window.PLAN` — always `undefined`.

#### BUG-02: CSS parse error truncates all T14 styles — weekly review modal unstyled
- **File**: `style.css:1289-1303`
- **Severity**: critical
- **Symptom**: `.weekly-review-modal` has `position: static; display: block` instead of `position: fixed; display: flex`. The modal renders as inline document flow, not as a centered overlay. All styles after `.whats-new-badge` (line 1289) are ignored.
- **Root cause**: The `.whats-new-badge` rule at line 1289 is missing its closing `}` brace. The rule body bleeds into subsequent selectors. The browser's CSS parser sees `.result-chapter`, `.pomodoro-preset-row`, `.weekly-review-modal` etc. as nested inside `.whats-new-badge`, and ignores them all (invalid nested selectors in non-nesting CSS).
- **Fix**: Add the missing `}` closing brace at the end of `.whats-new-badge { ... }` (before line 1304).
- **Affected styles**: `.result-chapter`, `.pomodoro-preset-row`, `.pomodoro-preset-label`, `.pomodoro-mode`, `.weekly-review-modal`, `.weekly-review-card`, and all other T14 styles defined after line 1288.
- **Reproduction**: Open DevTools → Sources → style.css → search for `.whats-new-badge` → observe missing `}`.

### HIGH

#### BUG-03: KaTeX math not rendered in SOTA card formulas
- **File**: `sota-renderer.js:227-229`, `study-guide.js` (KATEX_DELIMITERS)
- **Severity**: high
- **Symptom**: SOTA card key formula displays raw LaTeX: `$\text{fold}(U_1, U_2, r) = U_1 + r \cdot U_2, ...$` instead of rendered math.
- **Root cause**: `renderMathIn()` in `study-guide.js` uses `KATEX_DELIMITERS` which only contains `\[...\]` and `\(...\)` delimiters. SOTA card formulas use `$...$` (single-dollar) inline delimiters. Since `renderMathIn` IS defined, `sota-renderer.js` uses it (line 227), bypassing the fallback path that includes `$...$` delimiters.
- **Fix**: Add `{ left: '$', right: '$', display: false }` to `KATEX_DELIMITERS` in `study-guide.js`.

#### BUG-04: Flashcard progress counter always shows `0 / 0`
- **File**: `flashcards.js:451-461`
- **Severity**: high
- **Symptom**: The `#fc-progress-label` span always displays `0 / 0` regardless of session progress. `fcState.queue.length = 20` and `fcState.currentIdx` advances, but the label never updates visually.
- **Root cause**: `updateProgress()` finds `document.getElementById('fc-progress-label')` and sets `textContent`. The element exists in the DOM. Investigation shows the update may be racing with something. Likely cause: `render()` re-renders the entire `#flashcards-section` innerHTML (line 236), which resets the label to `0 / 0`. Then `startSession()` calls `renderCard()` and `updateProgress()` in sequence. But if `updateProgress()` runs BEFORE the new DOM nodes are live, the getElementById returns null or stale. Needs further investigation.
- **Reproduction**: Switch to Flashcards tab → counter shows `0 / 0`. Click "Got it" multiple times → counter never changes.

### MEDIUM

#### BUG-05: Search input and results partially clipped at 1440px viewport
- **File**: `style.css` (nav layout), `index.html` (nav structure)
- **Severity**: medium
- **Symptom**: At 1440px viewport width, the search input (`#concept-search`) starts at x=1335 with width=220, resulting in right edge at x=1555 — 115px off-screen. Search results dropdown also clips on the right.
- **Fix**: Either make search input width responsive (max-width with overflow hidden), or move search out of the fixed nav bar to a dedicated position.

#### BUG-06: SOTA container error for Method and Flashcards tabs
- **File**: `app.js:266-268`, `sota-renderer.js`
- **Severity**: medium
- **Symptom**: Console errors `SOTA: container not found: #method-sota-container` and `SOTA: container not found: #flashcards-sota-container` when navigating to those tabs.
- **Root cause**: `switchDay()` unconditionally calls `window.SOTA.renderChapter(chapterKey, '#' + chapterKey + '-sota-container')` for all chapter keys including `flashcards` and `method` which have no SOTA containers.
- **Fix**: Guard the SOTA render call with a DOM check, or exclude non-chapter keys.

### LOW

#### BUG-07: Pomodoro timer shows stale duration after preset switch
- **File**: `app.js:389-397`
- **Severity**: low
- **Symptom**: Switching from Chapter tab (25/5) to Plan tab (50/10) updates the mode indicator to "50/10" but the timer display still shows "25:00". A user might not realize the timer will run 50 minutes on next start.
- **Note**: This is documented as intentional ("Does NOT reset a running timer") but is confusing UX when the timer is NOT running. A stopped timer should reset to the new preset duration.

#### BUG-08: P8 Synthesis sessions have no chapter color (fallback to ch26 purple)
- **File**: `plan.js:19-24` — `NIGHT-SHIFT-REVIEW` comment acknowledges this.
- **Severity**: low
- **Symptom**: "Synth" cells use ch26 (purple) color as fallback. No `--chapter-color` CSS var for `synthesis`.

---

## Screenshots

The following screenshots were captured during the QA session (stored in conversation context — not saved to disk by MCP Puppeteer tool):

| Name | Scenario | Result |
|------|----------|--------|
| qa-01-initial-load | Initial load, Ch 2.1 active | PASS — 44 cards, progress bar visible |
| qa-02-plan-grid | Plan tab after manual PLAN.init() | PASS (conditional) — 15×5 grid renders beautifully |
| qa-03-plan-modal | Session modal open (S01) | PASS — objectives/materials/exercises/SOTA note/checkbox/next button |
| qa-04-plan-completion-persists | Modal reopened after reload | PASS — checkbox persisted (orange checkmark) |
| qa-05-shortcut-P | P key → Plan tab | PASS |
| qa-05-shortcut-Z | Z key → ZK Deep Dive | PASS — 7-section deep dive loads |
| qa-06-sota-ch25-expanded | SOTA card expanded (Nova paper) | PARTIAL — body renders but math is raw LaTeX |
| qa-07-flashcards-flip | Flashcard front | PASS — card shows question |
| qa-08-flashcards-next | Flashcard back + buttons | PASS — Got it/Retry buttons visible |
| qa-09-search-results | "bulletproofs" search | PASS — 46 results, chapter tags present |
| qa-10-weekly-review | Weekly review modal | FAIL — no CSS overlay, renders as inline raw HTML |
| qa-11-pomodoro-plan | Pomodoro on Plan tab | PASS — "Mode 50/10" shown |
| qa-12-pomodoro-chapter | Pomodoro on chapter tab | PASS — "Mode 25/5" shown |
| qa-13-print-preview | Print mode proxy | INCONCLUSIVE — @media print not testable via JS |
| qa-14-all-chapters | Method tab (last in sequence) | PASS — all chapters navigate correctly |

---

## Verdict: ITERATE

**Blocking issues before next QA pass**:
1. `style.css:1289` — Add missing `}` to `.whats-new-badge` rule (30-second fix, unlocks all T14 styles)
2. `index.html:1418` — Fix `plan.js defer` loading order (move after `app.js`, or remove `defer`)
3. `study-guide.js` — Add `$...$` to `KATEX_DELIMITERS` for SOTA math rendering
4. `flashcards.js` — Fix `updateProgress()` not updating the label

**Ship criteria**: 0 critical bugs, ≤1 high bug, weighted score ≥4.0.
Current score: **3.0/5** with 2 critical + 2 high bugs.
