# Night Shift Enriched Spec — Paper Recaps + Search (2026-04-14)

## Goal
Enrich the thesis study plan website with paper recap cards for all ~41 papers from papers.md, and make everything searchable.

## User Answers
- **Layout:** Paper section inside each chapter tab (below existing study guide)
- **Recap quality:** No badge distinction between AI-generated and real recaps
- **Status badges:** Use the status field from papers.md (read/skimmed/queued)

## Data Structure (per paper)

### Intuitive (guide) — mirrors concept cards
```js
{
  name: "Paper Title",
  authors: "Author1, Author2",
  venue: "IACR ePrint 2024/1959",
  status: "queued",       // read | skimmed | queued
  relevance: "core",      // core | related | context
  analogy: "One paragraph explaining the paper's contribution intuitively",
  diagram: "ASCII diagram showing core idea",
  keyPoints: ["point1", "point2", ...],
  connections: "How this paper connects to the thesis",
  thesisExample: "Specific example of how to use this in the thesis",
  keyTakeaway: "One-line summary from papers.md"
}
```

### Technical — mirrors technical companion
```js
{
  name: "Paper Title",
  formalDefinition: "Formal description with KaTeX math",
  mathDetails: [
    { subtitle: "Core Construction", content: "..." },
    { subtitle: "Security Model", content: "..." }
  ]
}
```

## File Plan

### New data files (12 files)
- `ch21-papers-guide.js` + `ch21-papers-technical.js` (Ch 2.1: 16 papers)
- `ch22-papers-guide.js` + `ch22-papers-technical.js` (Ch 2.2: 8 papers)
- `ch23-papers-guide.js` + `ch23-papers-technical.js` (Ch 2.3: 10 papers)
- `ch24-papers-guide.js` + `ch24-papers-technical.js` (Ch 2.4: 3 papers)
- `ch25-papers-guide.js` + `ch25-papers-technical.js` (Ch 2.5: 4 papers)
- `ch26-papers-guide.js` + `ch26-papers-technical.js` (Ch 2.6: 3 papers)

### New modules (2 files)
- `paper-guide.js` — renders paper cards in each chapter
- `paper-cards.css` — paper-specific styles

### Modified files
- `index.html` — script tags + paper section containers
- `search.js` — extend buildSearchIndex() for papers

### NOT modified
- day{1,2,3}-guide.js, day{1,2,3}-technical.js, ch22-guide.js, ch22-technical.js
- rust-guide.js, rust-technical.js
- study-guide.js, app.js

## Papers by Chapter (from papers.md)

### Ch 2.1 — Anonymous Credentials (16 papers)
1. Revisiting BBS Signatures | Tessaro, Zhu | ePrint 2023/275 | skimmed | core
2. SAAC | Chairattana-Apirom et al. | CRYPTO 2025 | skimmed | core
3. BBS+ for eIDAS 2.0 | — | ePrint 2025/619 | queued | core
4. zk-creds | Rosenberg et al. | IEEE S&P 2023 | skimmed | related
5. Coconut | Sonnino et al. | NDSS 2019 | skimmed | related
6. Revocable TACO | — | AsiaCCS 2024 | queued | related
7. Post-quantum traceable anon creds | — | CIC 2026 | queued | context
8. CL Signatures | Camenisch, Lysyanskaya | CRYPTO 2004 | queued | core
9. Brands credentials | Brands | — | queued | core
10. Blockchain Privacy-Preserving Mobile Payment | Yu et al. | 2022 | queued | core
11. BDIdM | Cui et al. | 2024 | queued | related
12. GrAC | Tang et al. | 2024 | queued | related
13. Comparative Eval Threshold Anon Creds | Ali et al. | 2025 | queued | core
14. Cross-chain Identity Auth | Zhu et al. | 2024 | queued | related
15. AccCred | Xie et al. | 2025 | queued | core
16. Zero-Knowledge Proof-of-Identity | — | IACR 2019/546 | queued | core

### Ch 2.2 — Confidential TX & ZK (8 papers)
1. Confidential Transactions | Maxwell | 2015 | queued | core
2. Bulletproofs | Bunz et al. | S&P 2018 | queued | core
3. Bulletproofs+ | Chung et al. | 2020 | queued | core
4. Bulletproofs++ | Eagen, Kanjalkar | 2024 | queued | core
5. Mimblewimble | anon | 2016 | queued | related
6. Groth16 | Groth | EUROCRYPT 2016 | queued | core
7. Plonk | Gabizon et al. | ePrint 2019/953 | queued | core
8. Halo 2 | Zcash/ECC | — | queued | related

### Ch 2.3 — TEE (10 papers)
1. TEE.Fail | Georgia Tech, Purdue | 2025 | skimmed | core
2. WireTap SGX DCAP | — | CCS 2025 | queued | core
3. TDXdown | — | CCS 2024 | skimmed | related
4. Intel TDX Architecture | Intel | Whitepaper | queued | related
5. ARM CCA | ARM | Spec | queued | context
6. TCU | Castillo et al. | 2025 | queued | core
7. TeeRollup | Wen et al. | 2024 | queued | related
8. ZLiTE | Matetic et al. | 2019 | queued | related
9. TEE+zkTLS Lightning | Singh et al. | 2025 | queued | related
10. zkFL-Health | Sharma et al. | 2025 | queued | related

### Ch 2.4 — Privacy-Preserving Payments (3 papers)
1. SoK: Privacy-Preserving Transactions | Baldimtsi et al. | IACR 2024/1959 | queued | core
2. Hitchhiker's Guide | Nardelli et al. | 2025 | queued | related
3. UTT: Decentralized Ecash | Tomescu et al. | IACR 2022/452 | read | core

### Ch 2.5 — Regulatory & Enterprise (4 papers)
1. BIS Working Paper 1242 | BIS | 2025 | queued | context
2. eIDAS 2.0 ARF | EU Commission | — | queued | related
3. Canton Network Whitepaper | Digital Asset | 2023 | queued | context
4. Canton: ZKPs Not a Privacy Panacea | Canton Blog | 2025 | queued | context

### Ch 2.6 — Sui Primitives (3 papers)
1. zkLogin | Mysten Labs | CCS 2024 | skimmed | core
2. ZK Authenticator | — | AFT 2025 | queued | related
3. Sui confidential TX design doc | Mysten Labs | TBD | queued | core

## Design Patterns to Follow
- Chapter colors: ch21=#06B6D4, ch22=#F59E0B, ch23=#10B981, ch24=#EC4899, ch25=#6366F1
- Dark theme: bg #0f0f0f, text #e5e5e5
- Glass-morphism cards with backdrop-blur
- Expandable cards with header click
- localStorage for state
- KaTeX for math
