# Night Shift Problems — 2026-04-14

> Items that need your attention. Run `grep -r "NIGHT-SHIFT-REVIEW" .` to find marked code.

## Problems

### UNCERTAINTY: Sui Confidential Transactions design doc not yet published
- **Iteration**: 1
- **File**: ch26-papers-guide.js, ch26-papers-technical.js
- **What I needed**: The actual Mysten Labs design document for Sui confidential transactions
- **What I did**: Based the technical content on (a) UTT paper which Mysten co-authored,
  (b) Aptos Confidential Asset design (similar architecture), and (c) Mysten Labs
  public communications. Marked with NIGHT-SHIFT-REVIEW in ch26-papers-technical.js
  formalDefinition block for the Sui Confidential Transactions paper.
- **Confidence**: MEDIUM
- **User action needed**: When the Mysten Labs design doc is published, update
  ch26-papers-guide.js (venue field currently "TBD") and ch26-papers-technical.js
  (formalDefinition and mathDetails for Sui Confidential Transactions paper).

### UNCERTAINTY: Canton "ZKPs Not a Privacy Panacea" blog post exact URL
- **Iteration**: 1
- **File**: ch25-papers-guide.js
- **What I needed**: The exact URL of the Canton Network blog post
- **What I did**: Task description provides title and venue "Canton Network Blog, 2025".
  Used this as-is. The blog post is real but the exact URL was not in the task spec.
- **Confidence**: MEDIUM
- **User action needed**: Find the exact URL and add it as a resource card in index.html
  if not already present.

### ASSUMPTION: ZK Authenticator (AFT 2025) author list and technical approach
- **Iteration**: 1
- **File**: ch26-papers-guide.js, ch26-papers-technical.js
- **What I needed**: Author list and exact technical approach for the ZK Authenticator paper
- **What I did**: Task spec says author is "Anonymized / TBD". Used this as authors field.
  Technical content based on the standard approaches for policy-privacy (garbled circuits)
  and oblivious updateability (BBS+ re-randomization) from the broader literature.
- **Confidence**: MEDIUM
- **User action needed**: When you read the paper, verify the technical approach in
  ch26-papers-technical.js matches and update mathDetails if needed.

### ASSUMPTION: ch26 color not defined in style.css
- **Iteration**: 1
- **File**: paper-guide.js:19
- **What I needed**: A `--color-ch26` CSS variable for Chapter 2.6 (Sui Primitives)
- **What I did**: Used `#8B5CF6` (purple) as hardcoded fallback in CHAPTER_COLORS. Marked with `NIGHT-SHIFT-REVIEW` comment.
- **Confidence**: MEDIUM
- **User action needed**: Add `--color-ch26` to `:root` in style.css when Ch 2.6 tab is added to index.html, then replace the hardcoded fallback with `var(--color-ch26)`.

### [T14 UNCERTAINTY] Plan tab does not exist in the current codebase
- **Iteration**: 1
- **File**: app.js, index.html
- **What I needed**: A "Plan" tab (`data-day="plan"`) to hook dual Pomodoro preset switching onto
- **What I did**: Implemented `switchPlan()` in app.js that sets the plan preset and handles
  `data-day="plan"` in initDayTabs. The function is globally accessible for T13 to call.
  No Plan tab HTML was added to index.html since T13 owns that nav tab.
- **Confidence**: MEDIUM
- **User action needed**: T13 must add `<button class="day-tab" data-day="plan">Plan</button>`
  to the nav for the preset switch to trigger. Or call `switchPlan()` directly from plan tab code.

### [T14 UNCERTAINTY] ZK Deep Dive entries lack timestamp field
- **Iteration**: 1
- **File**: search.js
- **What I needed**: Year/timestamp data for ZK Deep Dive entries to benefit from recency boost
- **What I did**: ZK Deep Dive entries come from `getZKDeepdiveSearchEntries()` and are pushed
  as-is into the index; their `timestamp` field will be `undefined` which `yearBoost()` treats
  as 0 (no boost). This is safe and correct behavior — no boost applied to entries without year.
- **Confidence**: HIGH
- **User action needed**: If ZK Deep Dive data has a year field, update zk-deepdive.js to include
  `timestamp: year` in entries returned by `getZKDeepdiveSearchEntries()`.

### DEPENDENCY: app.js CHAPTER_KEYS not updated for Ch 2.6 keyboard shortcut
- **Iteration**: 1
- **File**: app.js:13 (CHAPTER_KEYS array), app.js:476 (case '6' handler)
- **What I needed**: app.js to include 'ch26' in CHAPTER_KEYS and add a case '7' handler so keyboard shortcut 6 maps to Ch 2.6 and 7 maps to Rust.
- **What I did**: Scope was index.html only. Left app.js untouched. The hint in index.html still shows `1-6` which is accurate for the current app.js behavior (keys 1-6 map to ch21-ch25 + rust, bypassing ch26).
- **Confidence**: HIGH
- **User action needed**: Update app.js — add 'ch26' at index 5 in CHAPTER_KEYS (before 'rust'), add `case '7': switchDay(CHAPTER_KEYS[6]); break;`, and update the shortcuts hint in index.html from `<kbd>1</kbd>-<kbd>6</kbd>` to `<kbd>1</kbd>-<kbd>7</kbd>`.
