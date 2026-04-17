# Night Shift 2026-04-17 — Mobile Responsive Pass — SUMMARY

**Branch merged to main**: `feat/night-shift-2026-04-17-mobile`
**Commit**: 2d6273b
**Duration**: ~4h
**Stability Gate**: 3 consecutive clean audit passes

## Fixes shipped

| ID | Fix | Files |
|----|-----|-------|
| T0 | Plan tab rendered empty — stale `#plan-section { display:none }` gated visibility off the wrong element | plan.css |
| T1 | Every chapter block reordered: Study Guide + Paper Guide moved above Related Papers grid | index.html |
| T2 | Nav overflow <900px: chapter tabs become horizontal scroll + gradient fade, nav-right hidden behind hamburger | style.css, app.js, index.html |
| T3 | Responsive audit on 375/430/768/1024/1440: all 11 tabs render without overflow, 44px touch targets, Plan grid stacks cleanly | style.css |

## Architecture decisions
1. Horizontal-scroll + scroll-snap tabs on mobile (not hamburger-only) — preserves chapter discoverability
2. Day-tabs use scroll overflow at ALL viewports with gradient-fade mask — pre-existing desktop overflow was silently broken
3. Breakpoint: 900px (mobile) / 901px+ (desktop). JS + CSS aligned.
4. Study Guide moved above the whole resources-grid (not interleaved with videos) — cleanest DOM surgery

## Morning checklist
- [ ] Open site in Safari mobile and Chrome mobile — confirm tabs scroll, hamburger opens, Plan tab shows 75 sessions
- [ ] Verify Vercel deploy at production URL
- [ ] Skim any PROBLEMS.md entries (none expected)

## Known accepted UX nits (see audit findings)
- Day-tab click inside open mobile menu doesn't auto-collapse the menu
- Hamburger aria-controls points to entire `#nav` (broad but functional)
- mediaQuery.addEventListener requires Safari 14+ (acceptable)
