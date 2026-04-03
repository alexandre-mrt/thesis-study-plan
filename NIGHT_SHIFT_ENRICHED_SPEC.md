# Night Shift Enriched Spec — 2026-04-03

## Original spec
Enrich ALL study guide content for the thesis study plan website:
- Add technical AND intuitive views for all concepts
- Add small exercises for every concept
- Add limitations and historical facts
- Make the whole thing more complete and less generic/AI-slop
- Use grounded, specific content with real names, dates, and technical details

## Clarifications from pre-flight
- **Scope**: ALL guide files (existing + new). Enriching existing without breaking what works.
- **Exercise depth**: Semi-technical — mix of conceptual ("explain why X") and hands-on ("compute a Pedersen commitment with these values")
- **History style**: Detailed sections — who, when, why, what problem it solved, what was the alternative before
- **Limitations**: Honest, specific — not generic "has tradeoffs" but actual known weaknesses
- **Technical views**: Create ch22-technical.js and rust-technical.js with KaTeX formulas, security analysis, formal definitions.
- **Quality bar**: No generic filler. Every sentence should teach something. Use real paper citations, real vulnerability names, real implementation details.
- **Priorities**: All chapters equally important. Must-have: exercises + history + limitations for every concept.

## File inventory

### Intuitive guides (to ENRICH with exercises, history, limitations):
1. `day1-guide.js` — 17 concepts (Ch 2.5: ZK Proof Systems) — mapped via data-day="1"
2. `day2-guide.js` — 12 concepts (Ch 2.1: Anonymous Credentials + Ch 2.3: TEE) — mapped via data-day="2"
3. `day3-guide.js` — 12 concepts (Ch 2.4: Private Payments + Integration) — mapped via data-day="3"
4. `ch22-guide.js` — 4 concepts (Ch 2.2: Confidential TX & Range Proofs) — mapped via data-day="ch22"
5. `rust-guide.js` — 3 concepts (Rust: Production Rust & Codebases) — mapped via data-day="rust"

### Technical guides:
6. `day1-technical.js` — EXISTS, matches day1-guide concepts
7. `day2-technical.js` — EXISTS, matches day2-guide concepts
8. `day3-technical.js` — EXISTS, matches day3-guide concepts
9. `ch22-technical.js` — MISSING, needs creation
10. `rust-technical.js` — MISSING, needs creation

### UI rendering changes:
11. `study-guide.js` — Add support for exercises, limitations, history fields in concept rendering
12. `style.css` / `technical.css` — Add styles for exercise cards, history sections, limitation badges

## New fields to add to every concept

```javascript
// In intuitive guide files:
{
  name: "...",
  analogy: "...",        // existing
  diagram: "...",        // existing
  keyPoints: [...],      // existing
  connections: "...",    // existing
  publicPrivate: [...],  // existing
  thesisExample: "...",  // existing
  // NEW:
  history: {
    inventor: "Name (affiliation)",
    year: 2018,
    context: "What problem existed before, what motivated this",
    funFact: "Optional memorable anecdote"
  },
  limitations: [
    "Specific limitation with technical detail"
  ],
  exercises: [
    {
      type: "conceptual",  // or "calculation" or "comparison" or "design"
      question: "...",
      hint: "...",
      answer: "..."
    }
  ]
}
```

## Task breakdown

### T1: Update study-guide.js rendering + CSS (DEPENDENCY: blocks T3-T12)
Add rendering for history, limitations, exercises in buildIntuitiveContent() and buildConceptCard().
Add CSS styles for new sections.

### T2: Create ch22-technical.js (4 concepts: Pedersen, Bulletproofs, Mimblewimble, ElGamal Auditor)

### T3: Create rust-technical.js (3 concepts: fastcrypto, Rust Crypto Patterns, Key Codebases)

### T4: Enrich day1-guide.js — add history, limitations, exercises to 17 concepts

### T5: Enrich day2-guide.js — add history, limitations, exercises to 12 concepts

### T6: Enrich day3-guide.js — add history, limitations, exercises to 12 concepts

### T7: Enrich ch22-guide.js — add history, limitations, exercises to 4 concepts

### T8: Enrich rust-guide.js — add history, limitations, exercises to 3 concepts

### T9-T11: Enrich day1/2/3-technical.js — add exercises where missing

## Do NOT
- Delete or rewrite existing content that works well
- Change the file structure or HTML layout
- Modify the tab/navigation system
- Break localStorage checkbox persistence
- Use generic filler
