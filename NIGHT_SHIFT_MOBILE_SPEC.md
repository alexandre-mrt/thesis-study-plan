# Night Shift — Mobile Responsive Pass

## Mission
Three concrete fixes on thesis-study-plan at HEAD of main (e63f545).

## Task 1: Reorder chapter sections — study guide above videos
For every chapter section in `index.html` (`#ch-21`, `#ch-22`, `#ch-23`, `#ch-24`, `#ch-25`, `#ch-26`, `#ch-rust`):

Current order within each `.block`:
```
.block-header + .block-title
.block-objectives
.resources-grid          <- contains YouTube videos + readings
.study-guide-toggle button
.study-guide-container
.paper-guide-container
#chXX-sota-container
```

Target order:
```
.block-header + .block-title
.block-objectives
.study-guide-toggle button     <- moved up
.study-guide-container         <- moved up
.paper-guide-container         <- moved up
.resources-grid                <- now below
#chXX-sota-container           <- unchanged
```

**Rationale**: user prefers primary content (guide) above secondary (videos/readings).

**Acceptance**: visual inspection shows guide appears first in every chapter. SOTA cards still at bottom.

## Task 2: Fix nav overflow on narrow viewports
The top nav (`.nav` in `index.html:27-106`) contains:
- `.nav-title` "Thesis Prep"
- `.day-tabs` (11 chapter buttons: Ch 2.1-2.6, Rust, Method, Plan, ZK, Flashcards)
- `.search-container` (input + dropdown)
- `.nav-right` (view toggle, lexicon, pomodoro, progress)
- `.mobile-menu-btn` (hamburger, hidden > 768px)

Current responsive: `@media (max-width: 768px)` in `style.css:1066+` flex-wraps + toggles with hamburger, but:
- Tabs still overflow at 375px
- `.nav-right` reveal state broken
- Pomodoro + progress overflow right edge

**Strategy**:
- On `<768px`: chapter tabs become horizontally scrollable with `scroll-snap-type: x mandatory`. Add fade gradient on right edge to hint scrollability.
- Keep hamburger button for `.nav-right` controls only (pomodoro/progress/view-toggle). Tabs remain inline-scroll so user always sees current chapter.
- Search input: full width on mobile when hamburger open.
- All touch targets >= 44px.

**Acceptance**: on iPhone SE (375px): every chapter tab reachable by horizontal scroll. Hamburger shows view/pomodoro/progress. Nothing overflows `html` width. Sticky behaviour preserved.

## Task 3: Full responsive audit
Test via Puppeteer on 375, 430, 768, 1024.

Routes:
- `/` (landing = Ch 2.1)
- Each chapter tab (Ch 2.1..2.6, Rust)
- Plan, Flashcards, Method, ZK

Checks per viewport:
- No horizontal page overflow (`document.documentElement.scrollWidth <= innerWidth + 1`)
- All buttons >= 44x44 px touch target
- No text under 14px on body content
- Plan grid: collapses to vertical on <768px
- Pomodoro controls stack cleanly
- Search input: shrinks gracefully, remains usable
- Flashcards: already mobile-first, just verify
- Modals (weekly review, session detail): fit in viewport, close button reachable

Fixes go into: `style.css`, `plan.css`, `flashcards.css`, `zk-deepdive.css`, `paper-cards.css` as needed.

## Out of scope
- No new features
- No content changes (copy, papers, flashcards, study guides stay identical)
- No dark/light theme toggle
- No PWA manifest

## Completion
Stability gate: 3 consecutive clean audit passes (code quality + security + mobile smoke). Merge to main + push.
