# Night Shift Enriched Spec — 2026-03-30

## Original spec
See SPEC.md for full resource list and requirements.

## Clarifications from pre-flight

### Scope
- Single task: build one interactive single-page website (index.html + style.css + app.js)
- All resources from SPEC.md organized by 3 days / 6 blocks
- Progress tracking, Pomodoro timer, YouTube embeds
- Deploy-ready for Vercel
- Push to GitHub

### Design: Dark Academic
- Background: #0f0f0f
- Accent colors: Day 1 #6366F1 (indigo), Day 2 #06B6D4 (cyan), Day 3 #10B981 (emerald)
- Font: Inter for body, JetBrains Mono for code/badges
- Cards: subtle glass-morphism (rgba backgrounds, backdrop-blur)
- Dark, elegant, study-focused

### Tech decisions
- Pure HTML/CSS/JS — no framework, no build step
- Google Fonts for Inter + JetBrains Mono
- localStorage for progress persistence
- YouTube lite-embed pattern (thumbnail → iframe on click)

### Priorities
- Must-have: all resources rendered, day tabs, progress checkboxes, YouTube embeds, responsive
- Nice-to-have: Pomodoro timer, keyboard shortcuts, print CSS, collapsible cards

### Testing
- Visual verification via screenshot
- Manual check that localStorage works

### Do NOT
- No npm/bun dependencies
- No framework
- No backend
