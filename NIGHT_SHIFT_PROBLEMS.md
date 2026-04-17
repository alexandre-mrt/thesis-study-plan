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

### DEPENDENCY: app.js CHAPTER_KEYS not updated for Ch 2.6 keyboard shortcut
- **Iteration**: 1
- **File**: app.js:13 (CHAPTER_KEYS array), app.js:476 (case '6' handler)
- **What I needed**: app.js to include 'ch26' in CHAPTER_KEYS and add a case '7' handler so keyboard shortcut 6 maps to Ch 2.6 and 7 maps to Rust.
- **What I did**: Scope was index.html only. Left app.js untouched. The hint in index.html still shows `1-6` which is accurate for the current app.js behavior (keys 1-6 map to ch21-ch25 + rust, bypassing ch26).
- **Confidence**: HIGH
- **User action needed**: Update app.js — add 'ch26' at index 5 in CHAPTER_KEYS (before 'rust'), add `case '7': switchDay(CHAPTER_KEYS[6]); break;`, and update the shortcuts hint in index.html from `<kbd>1</kbd>-<kbd>6</kbd>` to `<kbd>1</kbd>-<kbd>7</kbd>`.

---

## Problems — 2026-04-17 (T19 Flashcards)

### ASSUMPTION: Flashcards tab not restored on page reload
- **Iteration**: 1
- **File**: app.js `restoreActiveDay()`
- **What I needed**: Decision on whether to persist the flashcard tab across page reloads.
- **What I did**: Intentionally do NOT restore 'flashcards' tab on page load — restores ch21 instead. Rationale: flashcards is a session tool, not a primary study view. User opens it via nav or `F` key.
- **Confidence**: MEDIUM
- **User action needed**: If you want flashcards to restore on reload, remove the `saved !== 'flashcards'` guard in `restoreActiveDay()` in app.js.

### ASSUMPTION: No --color-ch26 CSS variable used in flashcards
- **Iteration**: 1
- **File**: flashcards.js (renderCard), flashcards.css
- **What I needed**: ch26 color from CSS variable (undefined in style.css per prior agent note).
- **What I did**: Used hardcoded `#8B5CF6` (purple) for ch26 accent in the `chapterColors` map, consistent with prior agent decision. Marked inline comment NIGHT-SHIFT-REVIEW in flashcards.js renderCard function.
- **Confidence**: HIGH (same fallback color the prior agent chose)
