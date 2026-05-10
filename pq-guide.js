/**
 * Post-Quantum — Study Guide (Intuitive View)
 * Data file for the study plan website. Loaded as window.PQ_GUIDE.
 * Sources: Quantum Industry Day, Scott Aaronson, Craig Gidney, Oratomic, Google QAI.
 */

window.PQ_GUIDE = {
  block1: {
    title: "Quantum Threat Landscape & Neutral Atom Computing",
    connectionsSummary:
      "Post-quantum cryptography is no longer a distant concern. " +
      "Neutral atom quantum computers — using lasers to manipulate individual atoms — " +
      "have demonstrated a path to breaking 256-bit DLog by 2029 with as few as 10,000 qubits. " +
      "This section covers how neutral atom QC works, why it threatens current crypto, " +
      "the key people sounding alarms (Aaronson, Gidney), and the company landscape racing " +
      "to build these machines. For your thesis, this means the anonymous credential system " +
      "must plan a post-quantum migration path (lattice-based BBS+, hash-based signatures).",
    concepts: [
      /* ───────── Neutral Atom Quantum Computing ───────── */
      {
        name: "Neutral Atom Quantum Computing",
        analogy:
          "Imagine a chessboard made of light where each square holds a single atom " +
          "suspended in mid-air by a laser beam (optical tweezer). To make a move, " +
          "you shine different colored lasers at specific atoms — rotating their quantum " +
          "state like spinning a top. For two-piece moves (2-qubit gates), you excite " +
          "one atom to a huge 'Rydberg' state where its electron orbits far out, creating " +
          "an invisible force field that influences its neighbor. The pieces are all " +
          "identical (every rubidium atom is the same), the board is reconfigurable " +
          "(you can move atoms mid-game), and you don't need a fridge — just a vacuum " +
          "and lasers.",
        diagram:
          '┌─────────────────────────────────────────────────────────────────┐\n' +
          '│          Neutral Atom Quantum Computer — How It Works          │\n' +
          '├─────────────────────────────────────────────────────────────────┤\n' +
          '│                                                                 │\n' +
          '│  1. TRAPPING — Optical Tweezers                                │\n' +
          '│     ╭─────╮   ╭─────╮   ╭─────╮                               │\n' +
          '│     │  Rb │   │  Rb │   │  Rb │  ← atoms in laser traps       │\n' +
          '│     ╰──┬──╯   ╰──┬──╯   ╰──┬──╯                               │\n' +
          '│        │         │         │     λ ~ 850-1000nm               │\n' +
          '│                                                                 │\n' +
          '│  2. SINGLE-QUBIT GATE — Raman Laser Transition                 │\n' +
          '│     |0⟩ ──[laser pulse]──→ α|0⟩ + β|1⟩                         │\n' +
          '│     Two lasers, Δλ = qubit splitting frequency                 │\n' +
          '│     Rotation angle ∝ pulse power × pulse duration              │\n' +
          '│     Fidelity: > 99.98%                                         │\n' +
          '│                                                                 │\n' +
          '│  3. TWO-QUBIT GATE — Rydberg Blockade                          │\n' +
          '│     Control ──[π pulse]──→ Rydberg state (n~60-100)            │\n' +
          '│     Target  ──[2π pulse]─→ BLOCKED if control is Rydberg       │\n' +
          '│     Control ──[π pulse]──→ back to ground                      │\n' +
          '│     Result: Controlled-Z gate                                  │\n' +
          '│     Fidelity: > 99.5% (parallel on 60 atoms)                   │\n' +
          '│                                                                 │\n' +
          '│  4. READOUT — Fluorescence imaging                             │\n' +
          '│     Shine resonant light → |1⟩ fluoresces, |0⟩ stays dark      │\n' +
          '└─────────────────────────────────────────────────────────────────┘',
        keyPoints: [
          "Atoms trapped in optical tweezers (focused lasers at ~850-1000nm for Rubidium)",
          "Single-qubit gates via Raman transitions: two lasers with frequency difference matching qubit splitting",
          "Rotation angle controlled by: wavelength, pulse power, and pulse duration",
          "Two-qubit gates via Rydberg blockade: excite to n~60-100 orbital, creates interaction zone",
          "CZ gate = π pulse (control) → 2π pulse (target, blocked if control excited) → π pulse (control)",
          "No dilution refrigerator needed (unlike superconducting qubits) — just vacuum + lasers",
          "All atoms are physically identical — no fabrication variation",
          "Arrays of 6,100+ qubits demonstrated (Caltech, 2025), coherence times ~13 seconds",
          "Reconfigurable: atoms can be physically moved mid-computation"
        ],
        connections:
          "Neutral atom QC is the most direct threat to your thesis's cryptographic assumptions. " +
          "BBS+ signatures rely on the hardness of discrete log in pairing groups. " +
          "Oratomic showed 10,000 neutral atoms can run Shor's algorithm on P-256 ECDLP. " +
          "This is the specific attack vector that motivates post-quantum migration planning " +
          "in your Discussion chapter.",
        thesisExample:
          "Your credential system uses BBS+ over BLS12-381 (256-bit security). " +
          "Oratomic's paper shows P-256 ECDLP solvable with ~10,000 physical qubits, " +
          "and with 26,000 qubits, runtime drops to a few days. BLS12-381 has similar " +
          "curve parameters. If neutral atom computers reach 10,000+ qubits by 2029 " +
          "(as roadmaps suggest), the foundational hardness assumption of your system " +
          "is threatened. Post-quantum alternatives: lattice-based anonymous credentials " +
          "(module lattices, CIC 2026) or hash-based accumulators for revocation."
      },

      /* ───────── Craig Gidney & Google's Optimizations ───────── */
      {
        name: "Craig Gidney — Quantum Cryptanalysis Optimization",
        analogy:
          "Craig Gidney is like an architect who keeps redesigning the same building " +
          "to use fewer materials. In 2019, he said you'd need a 20-million-brick " +
          "quantum building to crack RSA. By 2025, he got it down to under 1 million " +
          "bricks. Then in March 2026, Google proved (via a ZK proof!) that their " +
          "latest ECDLP circuit design works — but refused to show the blueprints. " +
          "The optimizations are no longer public because they represent a real weapon.",
        diagram:
          '┌─────────────────────────────────────────────────────────────────┐\n' +
          '│         Craig Gidney — Qubit Cost Reduction Timeline            │\n' +
          '├─────────────────────────────────────────────────────────────────┤\n' +
          '│                                                                 │\n' +
          '│  RSA-2048 Factoring:                                           │\n' +
          '│  ┌──────────┬─────────────────┬──────────────────┐             │\n' +
          '│  │   Year   │  Qubits Needed  │  Improvement     │             │\n' +
          '│  ├──────────┼─────────────────┼──────────────────┤             │\n' +
          '│  │   2019   │  20,000,000     │  baseline        │             │\n' +
          '│  │   2025   │  < 1,000,000    │  20× reduction   │             │\n' +
          '│  └──────────┴─────────────────┴──────────────────┘             │\n' +
          '│                                                                 │\n' +
          '│  ECDLP-256 (secp256k1):                                        │\n' +
          '│  ┌──────────┬─────────────────┬──────────────────┐             │\n' +
          '│  │   2026   │  1,200-1,450    │  logical qubits  │             │\n' +
          '│  │          │  (ZK-proven)    │  circuits SECRET  │             │\n' +
          '│  └──────────┴─────────────────┴──────────────────┘             │\n' +
          '│                                                                 │\n' +
          '│  Key Innovations:                                              │\n' +
          '│  • Magic state cultivation (40× error reduction)               │\n' +
          '│  • Yoked surface codes (3× storage density)                    │\n' +
          '│  • QEC goes "FOOM" — superexponential improvement              │\n' +
          '│                                                                 │\n' +
          '│  ⚠️  Google used Succinct SP1 to prove circuit correctness      │\n' +
          '│      without revealing the circuit → responsible disclosure     │\n' +
          '└─────────────────────────────────────────────────────────────────┘',
        keyPoints: [
          "RSA-2048: from 20M qubits (2019) to <1M qubits (2025) — 20× reduction",
          "ECDLP-256: 1,200-1,450 logical qubits proven sufficient (March 2026)",
          "Magic state cultivation: 40× error reduction, fidelity 0.9999(1)",
          "Yoked surface codes: triple storage density of idle qubits",
          "QEC improvement is superexponential — 'a lull followed by a FOOM'",
          "Google published circuits as ZK proof via Succinct SP1 — blueprints kept secret",
          "Gidney sees no further 10× without changing fundamental assumptions",
          "Trail of Bits independently matched or beat Google's circuits (April 2026)"
        ],
        connections:
          "Gidney's work directly quantifies the quantum threat timeline. " +
          "The fact that ECDLP-256 needs only 1,200 logical qubits means the gap between " +
          "hardware roadmaps and cryptographic breaks is narrowing fast. For your thesis, " +
          "this validates the urgency of discussing post-quantum migration in Chapter 7.",
        thesisExample:
          "Google proved via ZK (Succinct SP1 + Groth16) that their quantum circuits " +
          "can solve secp256k1 ECDLP with 1,200 logical qubits. This is directly relevant: " +
          "your thesis uses ZK proofs (Groth16) for credential verification. The irony is " +
          "that ZK proofs — your system's privacy tool — were used to responsibly disclose " +
          "the very quantum threat that could break your system's underlying curves."
      },

      /* ───────── Scott Aaronson's Warning ───────── */
      {
        name: "Scott Aaronson — The 2029 Warning",
        analogy:
          "Scott Aaronson is the most trusted referee in quantum computing — known for " +
          "decades of careful skepticism against hype. When he says 'this is the clearest " +
          "warning I can offer in public right now' about 2029 being the year fault-tolerant " +
          "QC breaks crypto, it's like a conservative weather forecaster suddenly saying " +
          "'evacuate now.' He joined StarkWare specifically to help blockchains prepare.",
        diagram:
          '┌─────────────────────────────────────────────────────────────────┐\n' +
          '│              Aaronson — Timeline Shift                          │\n' +
          '├─────────────────────────────────────────────────────────────────┤\n' +
          '│                                                                 │\n' +
          '│  Before 2025: "Probably decades away"                          │\n' +
          '│       │                                                         │\n' +
          '│       ▼  (2025: multiple platforms > 99.9% gate fidelity)      │\n' +
          '│                                                                 │\n' +
          '│  April 2026: "Plausibly within 3 years"                        │\n' +
          '│       │                                                         │\n' +
          '│       ▼                                                         │\n' +
          '│  Actions taken:                                                 │\n' +
          '│  • Joined StarkWare as Scientific Advisor (Feb 2026)            │\n' +
          '│  • Urges immediate PQC migration                               │\n' +
          '│  • Takes "aggressive roadmaps" of Google, QuERA, Quantinuum    │\n' +
          '│    seriously for first time                                     │\n' +
          '│                                                                 │\n' +
          '│  Key quote: "People whose judgment I trust on hardware and      │\n' +
          '│  error correction tell me a CRQC should be possible by ~2029"   │\n' +
          '│                                                                 │\n' +
          '│  ⚠️  "Harvest now, decrypt later" threat already active          │\n' +
          '└─────────────────────────────────────────────────────────────────┘',
        keyPoints: [
          "Aaronson: CRQC (Cryptographically Relevant Quantum Computer) plausible by ~2029",
          "Shift from 'probably decades away' to 'plausibly within 3 years' — unprecedented",
          "Joined StarkWare (Feb 2026) to assess post-quantum risks to blockchains",
          "2025 exceeded his expectations: multiple platforms achieved >99.9% 2-qubit gate fidelity",
          "Now takes aggressive roadmaps of Google, QuERA, Quantinuum, PsiQuantum seriously",
          "'Harvest now, decrypt later' — adversaries record encrypted traffic today for future decryption",
          "Not claiming 2029 is certain — but plausible enough that failing to prepare is irresponsible"
        ],
        connections:
          "Aaronson's warning validates discussing post-quantum readiness in your thesis. " +
          "His involvement with StarkWare (a ZK company) shows even the ZK/blockchain " +
          "world is taking this seriously. STARKs are already post-quantum safe (hash-based), " +
          "but pairing-based systems like BBS+ are not.",
        thesisExample:
          "Your thesis uses BBS+ (pairing-based) and Groth16 (pairing-based SNARK). " +
          "Both are vulnerable to quantum attacks. Aaronson's timeline suggests these " +
          "systems have ~3 years before they face real-world threats. Your Discussion " +
          "chapter should note: STARKs (hash-based, post-quantum safe) as a migration " +
          "target, and lattice-based credential schemes as BBS+ replacements."
      },

      /* ───────── Oratomic & The 10,000 Qubit Threshold ───────── */
      {
        name: "Oratomic — 10,000 Qubits Break Crypto",
        analogy:
          "Oratomic is a Caltech/Harvard spinoff that figured out the minimum viable " +
          "quantum computer to break real crypto. Think of it as finding that you don't " +
          "need a 20-story building to reach the roof — a clever system of ladders " +
          "(reconfigurable atom arrays) gets you there with a single floor. Their March " +
          "2026 paper showed Shor's algorithm works with just 10,000 atoms — and " +
          "multiple companies plan to have that many by 2029.",
        diagram:
          '┌─────────────────────────────────────────────────────────────────┐\n' +
          '│        Oratomic Paper (arXiv:2603.28627, March 2026)            │\n' +
          '├─────────────────────────────────────────────────────────────────┤\n' +
          '│                                                                 │\n' +
          '│  "Shor\'s algorithm with as few as 10,000 atomic qubits"        │\n' +
          '│  Authors: Cain, Xu, King, Picard, Levine, Endres, Preskill,    │\n' +
          '│           Huang, Bluvstein (Caltech, Harvard)                  │\n' +
          '│                                                                 │\n' +
          '│  ┌─────────────────┬──────────┬────────────────┐               │\n' +
          '│  │  Target         │  Qubits  │  Runtime       │               │\n' +
          '│  ├─────────────────┼──────────┼────────────────┤               │\n' +
          '│  │  P-256 ECDLP    │  10,000  │  weeks         │               │\n' +
          '│  │  P-256 ECDLP    │  26,000  │  few days      │               │\n' +
          '│  │  RSA-2048       │  102,000 │  months        │               │\n' +
          '│  └─────────────────┴──────────┴────────────────┘               │\n' +
          '│                                                                 │\n' +
          '│  Company roadmaps reaching 10,000 qubits:                      │\n' +
          '│  • Atom Computing: 3rd gen system (2026-2027)                  │\n' +
          '│  • QuERA: ~10,000 physical qubits (2026-2027)                  │\n' +
          '│  • Pasqal: 10,000+ qubits by 2028                             │\n' +
          '│  • Oratomic: end of decade                                     │\n' +
          '│                                                                 │\n' +
          '│  AI-assisted: used OpenEvolve (LLMs) to optimize algorithms    │\n' +
          '│  → 100× reduction in required particles                        │\n' +
          '└─────────────────────────────────────────────────────────────────┘',
        keyPoints: [
          "P-256 ECDLP solvable with ~10,000 physical neutral-atom qubits (weeks runtime)",
          "With 26,000 qubits, runtime drops to a few days",
          "RSA-2048 requires ~102,000 qubits and months",
          "Used AI (OpenEvolve/LLMs) to optimize — 100× reduction in required particles",
          "Company: Caltech/Harvard spinoff, CEO Dolev Bluvstein, founded 2026",
          "Partnership with Monarch Quantum for photonic + neutral atom integration",
          "Multiple companies target 10,000+ qubits by 2027-2029"
        ],
        connections:
          "Oratomic's paper is the most concrete threat quantification for your thesis. " +
          "P-256 and BLS12-381 have comparable security levels against quantum attacks. " +
          "The 10,000-qubit threshold is within reach of multiple companies' roadmaps, " +
          "making the 2029 timeline plausible rather than speculative."
      },

      /* ───────── Succinct + Google + US Gov ───────── */
      {
        name: "Succinct + Google — ZK Proof of Quantum Threat",
        analogy:
          "Google found the weapon (optimized quantum circuits that break ECDLP-256). " +
          "Instead of publishing the blueprints, they used Succinct's SP1 zkVM to " +
          "prove the weapon works without showing how it's built. It's like proving " +
          "you can pick a lock by having a notary watch you do it, then publishing " +
          "the notary's signed statement — not the lockpicking technique. The US " +
          "government saw it first. You got the press release.",
        diagram:
          '┌─────────────────────────────────────────────────────────────────┐\n' +
          '│     Google + Succinct: Responsible Quantum Disclosure            │\n' +
          '├─────────────────────────────────────────────────────────────────┤\n' +
          '│                                                                 │\n' +
          '│  1. Google designs optimized ECDLP-256 circuits                │\n' +
          '│     └─→ 1,200-1,450 logical qubits / 70-90M Toffoli gates     │\n' +
          '│                                                                 │\n' +
          '│  2. Commits circuit via SHA-256 hash                           │\n' +
          '│     └─→ Binding without revealing                              │\n' +
          '│                                                                 │\n' +
          '│  3. Generates 9,024 test inputs (Fiat-Shamir / SHAKE256)       │\n' +
          '│     └─→ Prevents cherry-picking                                │\n' +
          '│                                                                 │\n' +
          '│  4. Simulates inside Succinct SP1 zkVM                         │\n' +
          '│     └─→ Proves circuit produces correct outputs                │\n' +
          '│                                                                 │\n' +
          '│  5. Wraps in Groth16 SNARK                                     │\n' +
          '│     └─→ Anyone can verify, no one sees the circuit             │\n' +
          '│                                                                 │\n' +
          '│  US Gov context:                                                │\n' +
          '│  • NSA CNSA 2.0: quantum-safe by Jan 2027 (new systems)        │\n' +
          '│  • NIST: deprecate RSA/ECDSA by 2030, disallow by 2035        │\n' +
          '│  • FBI/NIST/CISA: 2026 = "Year of Quantum Security"            │\n' +
          '└─────────────────────────────────────────────────────────────────┘',
        keyPoints: [
          "Google proved ECDLP-256 circuit works via ZK (Succinct SP1 + Groth16) without revealing design",
          "Circuit committed via SHA-256, tested on 9,024 Fiat-Shamir inputs",
          "Trail of Bits independently matched/beat Google's results (April 2026)",
          "NSA CNSA 2.0 mandates quantum-safe systems by January 2027",
          "NIST: deprecate RSA/ECDSA by 2030, fully disallow by 2035",
          "2026 designated 'Year of Quantum Security' by FBI, NIST, CISA",
          "US government was briefed before public disclosure"
        ],
        connections:
          "The Groth16 + SP1 approach for responsible disclosure is a direct application " +
          "of the same ZK technology your thesis uses. It's both an existential threat " +
          "(quantum breaks your curves) and a validation (ZK proofs are the responsible " +
          "way to handle dangerous knowledge)."
      },

      /* ───────── Quantum AI Briefing ───────── */
      {
        name: "Quantum AI — Thousand-Scenario Filtering",
        analogy:
          "Imagine you have 1,000 different quantum circuit designs competing to solve " +
          "ECDLP. Instead of manually evaluating each one, you let an AI (like an " +
          "evolutionary algorithm) run them all, score their efficiency, combine the " +
          "best traits from winners, mutate them, and repeat. After thousands of " +
          "generations, what emerges is a circuit no human designed — but that works " +
          "100× better. This is how Oratomic got from 'millions of qubits needed' to " +
          "'10,000 is enough.'",
        diagram:
          '┌─────────────────────────────────────────────────────────────────┐\n' +
          '│        AI-Accelerated Quantum Circuit Optimization              │\n' +
          '├─────────────────────────────────────────────────────────────────┤\n' +
          '│                                                                 │\n' +
          '│  OFFENSIVE (Oratomic approach):                                 │\n' +
          '│  ┌────────────────────────────────────────────┐                │\n' +
          '│  │  OpenEvolve (LLMs: Gemini, Claude)         │                │\n' +
          '│  │  → Generate 1000s of circuit variants      │                │\n' +
          '│  │  → Score: qubit count, gate depth, fidelity│                │\n' +
          '│  │  → Combine best traits (evolutionary)      │                │\n' +
          '│  │  → Result: 100× reduction                  │                │\n' +
          '│  └────────────────────────────────────────────┘                │\n' +
          '│                                                                 │\n' +
          '│  DEFENSIVE (Enterprise PQC migration):                         │\n' +
          '│  ┌────────────────────────────────────────────┐                │\n' +
          '│  │  Run 1000s of migration scenarios          │                │\n' +
          '│  │  Parameters: quantum horizon, data lifetime│                │\n' +
          '│  │  → Identify priority systems               │                │\n' +
          '│  │  → Estimate vulnerability windows          │                │\n' +
          '│  │  → Allocate migration budget               │                │\n' +
          '│  └────────────────────────────────────────────┘                │\n' +
          '│                                                                 │\n' +
          '│  CONVERGENCE RISK:                                             │\n' +
          '│  AI speeds up quantum discovery → quantum accelerates AI       │\n' +
          '│  = compound risk acceleration                                  │\n' +
          '└─────────────────────────────────────────────────────────────────┘',
        keyPoints: [
          "Oratomic used OpenEvolve (LLM-powered) to optimize quantum algorithms → 100× improvement",
          "AI 'tried thousands of different ideas' combining past scientific results in novel ways",
          "Defensive: enterprises run thousands of PQC migration scenarios to prioritize",
          "AI + Quantum convergence creates compound risk (each accelerates the other)",
          "Not just brute-force search — LLMs bring domain understanding to circuit optimization",
          "Filtering: evaluate circuits on qubit count, gate depth, error threshold simultaneously"
        ],
        connections:
          "The AI-assisted optimization is what made Oratomic's breakthrough possible. " +
          "It demonstrates that the quantum threat timeline can accelerate non-linearly " +
          "as AI tools improve. For your thesis, this means post-quantum timelines could " +
          "compress further — plan conservatively."
      }
    ]
  },

  block2: {
    title: "Quantum Company Landscape",
    connectionsSummary:
      "The neutral atom quantum computing space is intensely competitive, with " +
      "multiple well-funded companies racing to 10,000+ qubits. This section maps " +
      "the major players, their technology choices, funding, and timelines. " +
      "Understanding who is building what helps assess the credibility of the " +
      "2029 threat timeline.",
    concepts: [
      /* ───────── Google Quantum AI ───────── */
      {
        name: "Google Quantum AI",
        analogy:
          "Google is playing both sides: building the weapon (quantum computers that " +
          "break crypto) and the shield (PQC migration). They have the Willow chip " +
          "(superconducting), just hired a neutral-atom team lead, and published the " +
          "ECDLP circuit that proves crypto is breakable. Their internal deadline: " +
          "migrate all Google infrastructure to PQC by 2029.",
        diagram:
          '┌─────────────────────────────────────────────────────┐\n' +
          '│  Google Quantum AI                                  │\n' +
          '├─────────────────────────────────────────────────────┤\n' +
          '│  Modality: Superconducting + Neutral atoms (new)   │\n' +
          '│  Willow: 105 qubits, below-threshold QEC (2024)    │\n' +
          '│  Quantum Echoes: 13,000× speedup demo (2025)       │\n' +
          '│  Hired JILA Fellow Adam Kaufman → neutral atoms    │\n' +
          '│  PQC migration deadline: 2029                      │\n' +
          '│  Collaboration: Ethereum Foundation, Stanford      │\n' +
          '└─────────────────────────────────────────────────────┘',
        keyPoints: [
          "Dual-track: superconducting (Willow, 105 qubits) + neutral atoms (new team, 2026)",
          "First below-threshold error correction demonstrated (Dec 2024)",
          "Published ECDLP-256 circuits via ZK proof (March 2026)",
          "Internal PQC migration deadline: 2029",
          "Hired JILA Fellow Adam Kaufman to lead neutral-atom program in Boulder, CO"
        ],
        connections:
          "Google's dual investment in both superconducting and neutral atom modalities " +
          "shows they believe neutral atoms are a credible path to scale."
      },

      /* ───────── QuERA ───────── */
      {
        name: "QuERA Computing",
        analogy:
          "QuERA is the Harvard/MIT spinoff that's closest to the 10,000-qubit mark. " +
          "They already have 3,000 qubits running continuously for 2+ hours, and plan " +
          "100 logical / ~10,000 physical qubits by 2026-2027.",
        diagram:
          '┌─────────────────────────────────────────────────────┐\n' +
          '│  QuERA (Harvard/MIT, Lukin group)                   │\n' +
          '├─────────────────────────────────────────────────────┤\n' +
          '│  Modality: Neutral atoms (tweezers + Rydberg)      │\n' +
          '│  Current: 3,000 qubits, 2h+ continuous operation   │\n' +
          '│  2025: 96 logical qubits, below-threshold QEC      │\n' +
          '│  Roadmap: 10,000 physical qubits by 2026-2027     │\n' +
          '│  Funding: $230M+ (2025)                            │\n' +
          '│  Partners: Google, Japan AIST, UK NQCC             │\n' +
          '└─────────────────────────────────────────────────────┘',
        keyPoints: [
          "3,000-qubit array running continuously 2+ hours (2025)",
          "Below-threshold error correction with 96 logical qubits",
          "Magic state distillation demonstrated",
          "$230M+ funding in 2025",
          "Roadmap: 100 logical / ~10,000 physical qubits by 2026-2027",
          "Deployed Gemini machine to Japan and UK national labs"
        ],
        connections:
          "QuERA's roadmap is the most aggressive for reaching 10,000 qubits. " +
          "Combined with Oratomic's 10,000-qubit threshold paper, this directly " +
          "validates the 2029 threat timeline for ECDLP-256."
      },

      /* ───────── Pasqal ───────── */
      {
        name: "Pasqal",
        analogy:
          "The French champion of neutral atoms. Founded by Alain Aspect's group " +
          "(the guy who won the Nobel Prize for Bell test experiments). They're " +
          "installing QPUs in European supercomputing centers and aim for 10,000+ " +
          "qubits by 2028.",
        diagram:
          '┌─────────────────────────────────────────────────────┐\n' +
          '│  Pasqal (Paris, France)                            │\n' +
          '├─────────────────────────────────────────────────────┤\n' +
          '│  Modality: Neutral atoms (optical tweezers)        │\n' +
          '│  Current: 1,000+ atoms, 250-qubit QPU             │\n' +
          '│  2028: 10,000+ qubits                              │\n' +
          '│  2029-2030: 100,000 atoms + fault tolerance       │\n' +
          '│  2032-2035: million-atom systems                   │\n' +
          '│  Deployments: GENCI (FR), Jülich (DE), CA, IT     │\n' +
          '│  Focus: optimization, materials simulation, ML     │\n' +
          '└─────────────────────────────────────────────────────┘',
        keyPoints: [
          "Founded by Alain Aspect's group members (Lahaye, Browaeys)",
          "1,000+ trapped atoms, 250-qubit QPU for quantum advantage demo (early 2026)",
          "First neutral-atom QPUs in HPC centers (France, Germany)",
          "Roadmap: 10,000+ qubits (2028), 100,000 atoms (2029-2030), million (2032-2035)",
          "Focus on optimization and quantum simulation rather than cryptanalysis"
        ],
        connections:
          "Pasqal's aggressive roadmap adds another data point supporting the " +
          "2028-2029 timeline for 10,000+ qubit systems."
      },

      /* ───────── Atom Computing ───────── */
      {
        name: "Atom Computing",
        analogy:
          "Atom Computing uses a clever trick: instead of encoding qubits in the " +
          "electron state (which decoheres fast), they encode in the nuclear spin " +
          "(which is shielded by electrons). This gives ~40-second coherence times. " +
          "They partnered with Microsoft and plan 10,000 qubits in their 3rd-gen system.",
        diagram:
          '┌─────────────────────────────────────────────────────┐\n' +
          '│  Atom Computing (Boulder/Berkeley + Microsoft)      │\n' +
          '├─────────────────────────────────────────────────────┤\n' +
          '│  Modality: Neutral atoms (nuclear spin qubits)     │\n' +
          '│  Coherence: ~40 seconds (nuclear spin)             │\n' +
          '│  Current: 112 atoms, 28 logical qubits             │\n' +
          '│  Record: 24 entangled logical qubits (2025)        │\n' +
          '│  Next: 10,000 physical qubits (3rd gen)            │\n' +
          '│  Commercial: Magne system deployed (Denmark, 2026) │\n' +
          '│  Gov: DARPA, 2 DOE NQIS Centers                    │\n' +
          '└─────────────────────────────────────────────────────┘',
        keyPoints: [
          "Nuclear spin qubits: ~40s coherence (vs ms for superconducting)",
          "28 logical qubits on 112 atoms; 24 entangled logical qubits (record)",
          "Microsoft partnership for joint commercial system",
          "3rd-gen: 10,000 physical qubits (10× current)",
          "Government contracts: DARPA, two DOE NQIS Centers",
          "Commercial Magne system already deployed in Denmark (Jan 2026)"
        ],
        connections:
          "Atom Computing's nuclear spin approach offers the longest coherence " +
          "times, which helps with Shor's algorithm's deep circuit requirements."
      },

      /* ───────── Alice & Bob ───────── */
      {
        name: "Alice & Bob (Cat Qubits)",
        analogy:
          "Alice & Bob took a different approach: instead of fighting both bit-flips " +
          "AND phase-flips, they designed a qubit (the 'cat qubit') that inherently " +
          "resists bit-flips. Their qubit can hold its bit state for over an hour. " +
          "They only need to correct phase errors — cutting error correction overhead in half.",
        diagram:
          '┌─────────────────────────────────────────────────────┐\n' +
          '│  Alice & Bob (Paris, France)                       │\n' +
          '├─────────────────────────────────────────────────────┤\n' +
          '│  Modality: Cat qubits (superconducting)            │\n' +
          '│  NOT neutral atoms — different paradigm            │\n' +
          '│  Bit-flip lifetime: > 1 hour (Sep 2025)            │\n' +
          '│  Elevator Codes: 10,000× error reduction (2026)    │\n' +
          '│  Funding: 230M+ EUR total                          │\n' +
          '│  Goal: Fault-tolerant universal QC by 2030         │\n' +
          '│  Advantage: Only need to correct phase-flips       │\n' +
          '└─────────────────────────────────────────────────────┘',
        keyPoints: [
          "Cat qubits provide built-in bit-flip protection (>1 hour lifetime)",
          "Only need to correct phase-flip errors → drastically reduced overhead",
          "Elevator Codes: 10,000× error reduction (Jan 2026)",
          "NVIDIA CUDA-Q integration for 9.25× decoding speedup",
          "230M+ EUR funding total (Series B + extension)",
          "Target: fault-tolerant universal quantum computer by 2030"
        ],
        connections:
          "Alice & Bob represents an alternative modality but confirms the trend: " +
          "multiple independent approaches are converging on fault tolerance by 2029-2030."
      },

      /* ───────── PlanQC ───────── */
      {
        name: "PlanQC",
        analogy:
          "PlanQC uses optical lattices instead of tweezers — think of a 3D egg carton " +
          "made of light where atoms sit in the wells. This allows denser packing " +
          "and potentially faster gate operations via quantum gas microscopes.",
        diagram:
          '┌─────────────────────────────────────────────────────┐\n' +
          '│  PlanQC (Munich, Max Planck spinoff)                │\n' +
          '├─────────────────────────────────────────────────────┤\n' +
          '│  Modality: Neutral atoms in optical lattices        │\n' +
          '│  (not tweezers — denser packing possible)          │\n' +
          '│  Funding: 50M EUR equity + 20M EUR gov (MAQCS)     │\n' +
          '│  Goal: 1,000-qubit system at Leibniz SC (~2027)   │\n' +
          '│  Partners: ESA, Airbus, Fraunhofer, d-fine         │\n' +
          '│  Tech: quantum gas microscopes + fast Rydberg       │\n' +
          '└─────────────────────────────────────────────────────┘',
        keyPoints: [
          "Optical lattice approach (not tweezers) — denser atom packing",
          "Max Planck Institute spinoff (2022), Munich",
          "50M EUR equity + 20M EUR German federal project",
          "1,000-qubit system target at Leibniz Supercomputing Centre by ~2027",
          "Partners: ESA, Airbus, Fraunhofer"
        ],
        connections:
          "PlanQC shows Europe is investing heavily in quantum compute, " +
          "with government-backed deployments at major HPC centers."
      },

      /* ───────── Q-Factor ───────── */
      {
        name: "Q-Factor",
        analogy:
          "Q-Factor is the new Israeli entrant that skipped incremental scaling and " +
          "went straight for architectural innovation to reach a million qubits. " +
          "They raised $24M seed in April 2026 with backing from Intel Capital.",
        diagram:
          '┌─────────────────────────────────────────────────────┐\n' +
          '│  Q-Factor (Israel, Weizmann/Technion)              │\n' +
          '├─────────────────────────────────────────────────────┤\n' +
          '│  Modality: Neutral atoms                           │\n' +
          '│  Funding: $24M seed (April 2026)                   │\n' +
          '│  Investors: NFX, TPY, Intel Capital, Korea IP      │\n' +
          '│  Goal: Million-qubit via architectural innovation  │\n' +
          '│  Approach: not incremental — novel system design    │\n' +
          '└─────────────────────────────────────────────────────┘',
        keyPoints: [
          "Israeli startup from Weizmann Institute / Technion",
          "$24M seed (April 2026): NFX, TPY Capital, Intel Capital, Korea Investment Partners",
          "Goal: million-qubit quantum computer",
          "Differentiator: architectural innovation for scaling beyond few-thousand qubits",
          "Not incremental — fundamentally different system design"
        ],
        connections:
          "Q-Factor's architectural approach could leapfrog the incremental scaling " +
          "of other companies, potentially accelerating the timeline further."
      }
    ]
  }
};
