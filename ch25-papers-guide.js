/**
 * Ch 2.5 Papers Guide — Regulatory & Enterprise Privacy
 * Intuitive recap data for academic paper cards.
 * Rendered by paper-guide.js via window.CH25_PAPERS.
 */

window.CH25_PAPERS = {
  papers: [
    /* ── Paper 1: BIS Working Paper 1242 ── */
    {
      name: "BIS Working Paper 1242",
      authors: "Bank for International Settlements",
      venue: "BIS Working Papers, 2025",
      status: "queued",
      relevance: "context",
      analogy:
        "The BIS is the central bank of central banks — the institution that " +
        "sets global monetary standards. When the BIS publishes a working paper " +
        "on privacy-enhancing technologies for digital payments, it signals that " +
        "regulators are no longer dismissing cryptographic privacy as a tool for " +
        "criminals. Think of this paper as the official permission slip from the " +
        "establishment: privacy tech in payments is legitimate, here is what " +
        "works, and here is what still needs to be solved.",
      diagram:
        '┌────────────────────────────────────────────────────────────┐\n' +
        '│           BIS WP 1242 — Regulatory Privacy Landscape       │\n' +
        '├────────────────────────────────────────────────────────────┤\n' +
        '│                                                            │\n' +
        '│  PRIVACY-ENHANCING TECHNOLOGIES (PETs) ASSESSED           │\n' +
        '│  ┌──────────────────────────────────────────────────┐      │\n' +
        '│  │ Zero-Knowledge Proofs — selective disclosure     │      │\n' +
        '│  │ Secure Multi-Party Computation — distributed     │      │\n' +
        '│  │ Trusted Execution Environments — hardware        │      │\n' +
        '│  │ Differential Privacy — statistical noise        │      │\n' +
        '│  │ Homomorphic Encryption — compute on ciphertext  │      │\n' +
        '│  └──────────────────────────────────────────────────┘      │\n' +
        '│                                                            │\n' +
        '│  REGULATORY REQUIREMENTS MAPPED                            │\n' +
        '│  AML / CFT compliance  ←→  transaction transparency       │\n' +
        '│  GDPR / data minimization ←→ privacy by design            │\n' +
        '│  Auditability           ←→  selective disclosure          │\n' +
        '│                                                            │\n' +
        '│  CBDC RELEVANCE: privacy-preserving retail CBDC design     │\n' +
        '└────────────────────────────────────────────────────────────┘',
      diagram_mermaid:
        'flowchart TD\n' +
        '  BIS["BIS WP 1242<br/>Regulatory privacy landscape"]\n' +
        '  BIS --> PETs["Privacy-Enhancing Technologies"]\n' +
        '  PETs --> ZKP["Zero-Knowledge Proofs<br/><i>selective disclosure</i>"]\n' +
        '  PETs --> MPC["Secure Multi-Party Computation<br/><i>distributed</i>"]\n' +
        '  PETs --> TEE["Trusted Execution Environments<br/><i>hardware</i>"]\n' +
        '  PETs --> DP["Differential Privacy<br/><i>statistical noise</i>"]\n' +
        '  PETs --> HE["Homomorphic Encryption<br/><i>compute on ciphertext</i>"]\n' +
        '  BIS --> REG["Regulatory requirements"]\n' +
        '  REG --> AML["AML / CFT<br/>transaction transparency"]\n' +
        '  REG --> GDPR["GDPR / data minimization<br/>privacy by design"]\n' +
        '  REG --> AUD["Auditability<br/>selective disclosure"]\n' +
        '  BIS --> CBDC["CBDC relevance<br/><b>privacy-preserving retail CBDC design</b>"]\n' +
        '  classDef proofsystem fill:#111827,stroke:#6366F1,color:#fff\n' +
        '  classDef prover fill:#1f2937,stroke:#06B6D4,color:#fff\n' +
        '  classDef verifier fill:#1a1a1a,stroke:#10B981,color:#fff\n' +
        '  class BIS,PETs proofsystem\n' +
        '  class ZKP,MPC,TEE,DP,HE prover\n' +
        '  class REG,AML,GDPR,AUD,CBDC verifier',
      keyPoints: [
        "Central bank perspective on privacy-enhancing technologies (PETs) for " +
          "digital payments — ZKPs, MPC, TEEs, differential privacy, HE",
        "Maps each PET against regulatory requirements: AML/CFT compliance, " +
          "GDPR data minimization, auditability, and cross-border interoperability",
        "Assesses maturity and readiness of each technology for CBDC deployment, " +
          "with ZKPs rated 'promising but computationally intensive'",
        "Identifies the privacy-transparency trade-off as the central design " +
          "challenge: full anonymity is incompatible with AML requirements",
        "Recommends 'selective disclosure' architecture: users prove compliance " +
          "attributes (e.g., jurisdiction, age) without revealing all transaction data"
      ],
      connections:
        "Use this paper to legitimize the regulatory framing of your thesis. " +
        "The BIS's endorsement of ZKPs for selective disclosure validates your " +
        "approach of using BBS+ credentials to prove compliance attributes. " +
        "The paper's assessment of TEEs as a privacy primitive directly supports " +
        "your TEE-based audit path design.",
      thesisExample:
        "In your introduction and motivation chapter, cite BIS WP 1242 to " +
        "demonstrate that central bank institutions recognize the need for " +
        "privacy-preserving payments that maintain regulatory compliance. " +
        "When discussing your TEE auditor design in Chapter 4, reference the " +
        "paper's recommendation for selective disclosure as the design principle " +
        "underlying your threshold audit mechanism.",
      keyTakeaway:
        "Official central bank endorsement of PETs for payments. Use to " +
        "establish regulatory context and legitimize ZKP + TEE approach."
    },

    /* ── Paper 2: eIDAS 2.0 ARF ── */
    {
      name: "eIDAS 2.0 Architecture Reference Framework",
      authors: "European Commission",
      venue: "EU Commission Technical Specification, 2024",
      status: "queued",
      relevance: "related",
      analogy:
        "eIDAS 2.0 is the European Union's blueprint for a unified digital " +
        "identity wallet for all EU citizens. Think of it as a passport for the " +
        "digital world: a single app on your phone that can prove you are over " +
        "18, that you hold a valid driving license, and that you are an EU " +
        "citizen — all without revealing your name, address, or any extra " +
        "attributes beyond what the verifier is allowed to see. The ARF is the " +
        "technical specification document that every EU member state and wallet " +
        "provider must implement.",
      diagram:
        '┌────────────────────────────────────────────────────────────┐\n' +
        '│           eIDAS 2.0 Architecture Reference Framework       │\n' +
        '├────────────────────────────────────────────────────────────┤\n' +
        '│                                                            │\n' +
        '│  THREE ACTORS                                              │\n' +
        '│  ┌──────────────┐  issues PID/EAA  ┌──────────────────┐   │\n' +
        '│  │ PID Provider │ ──────────────→  │  EUDIW (Wallet)  │   │\n' +
        '│  │ (e.g. govt)  │                  │  (User device)   │   │\n' +
        '│  └──────────────┘                  └────────┬─────────┘   │\n' +
        '│                                             │ presents     │\n' +
        '│                                    selective│ disclosure   │\n' +
        '│                                             ▼             │\n' +
        '│                                   ┌──────────────────┐    │\n' +
        '│                                   │  Relying Party   │    │\n' +
        '│                                   │  (Verifier)      │    │\n' +
        '│                                   └──────────────────┘    │\n' +
        '│                                                            │\n' +
        '│  KEY PROTOCOLS                                             │\n' +
        '│  PID — Personal Identification Data (government-issued)   │\n' +
        '│  EAA — Electronic Attestation of Attributes               │\n' +
        '│  SD-JWT — Selective Disclosure JWT (primary credential fmt)│\n' +
        '│  mdoc  — ISO 18013-5 mobile document format               │\n' +
        '│                                                            │\n' +
        '│  ZKP STATUS: optional in ARF v1.x, planned for v2.0       │\n' +
        '└────────────────────────────────────────────────────────────┘',
      diagram_mermaid:
        'flowchart LR\n' +
        '  PID["PID Provider<br/>(e.g. government)"]\n' +
        '  W["EUDIW<br/>(User wallet)"]\n' +
        '  RP["Relying Party<br/>(Verifier)"]\n' +
        '  PID -- "issues PID / EAA" --> W\n' +
        '  W -- "selective disclosure" --> RP\n' +
        '  PROT["Key protocols<br/>PID: Personal ID Data<br/>EAA: Electronic Attestation<br/>SD-JWT: Selective Disclosure JWT<br/>mdoc: ISO 18013-5"]\n' +
        '  ZKP["ZKP status<br/>optional in ARF v1.x<br/><b>planned for v2.0</b>"]\n' +
        '  W -.-> PROT\n' +
        '  PROT -.-> ZKP\n' +
        '  classDef proofsystem fill:#111827,stroke:#6366F1,color:#fff\n' +
        '  classDef prover fill:#1f2937,stroke:#06B6D4,color:#fff\n' +
        '  classDef verifier fill:#1a1a1a,stroke:#10B981,color:#fff\n' +
        '  class PID proofsystem\n' +
        '  class W,PROT prover\n' +
        '  class RP,ZKP verifier',
      keyPoints: [
        "European regulatory framework defining the EU Digital Identity Wallet " +
          "(EUDIW): architecture, credential formats, and protocol requirements",
        "Three actors: PID Provider (government issuer), EUDIW (user wallet), " +
          "Relying Party (verifier) — exactly the issuer-holder-verifier model",
        "Primary credential formats: SD-JWT (Selective Disclosure JWT) and mdoc " +
          "(ISO 18013-5); BBS+ signatures are under evaluation for ZKP support",
        "Selective disclosure is mandatory: users must be able to prove attributes " +
          "without revealing the full credential",
        "ZKP support is optional in ARF v1.x but planned for v2.0 — the 'Making " +
          "BBS+ eIDAS 2.0 Compliant' paper (ePrint 2025/619) bridges this gap",
        "Relying party registration required: verifiers must justify which " +
          "attributes they request (data minimization principle)"
      ],
      connections:
        "eIDAS 2.0 defines the regulatory compliance target for your thesis. " +
        "Your BBS+ anonymous credential system is designed to be eIDAS 2.0 " +
        "compatible: it uses the same issuer-holder-verifier model, supports " +
        "selective disclosure, and can interoperate with SD-JWT wallets. " +
        "The main gap is the blockchain anchoring — your thesis's contribution " +
        "is making this work on Sui with on-chain ZK verification.",
      thesisExample:
        "In Chapter 2.1 and your design chapter, position your credential system " +
        "as eIDAS 2.0 aligned: 'The issuer-holder-verifier model in our design " +
        "follows the eIDAS 2.0 ARF [cite]. Our BBS+ credential format is " +
        "compatible with the EAA (Electronic Attestation of Attributes) model, " +
        "and selective disclosure is enforced at the ZKP level rather than the " +
        "application level, providing stronger guarantees than SD-JWT.' " +
        "Note the ARF does not mandate on-chain verification — this is your " +
        "contribution.",
      keyTakeaway:
        "EU regulatory target for your credential system. Use to establish " +
        "compliance framing and show your BBS+ design is regulation-ready."
    },

    /* ── Paper 3: Canton Network Whitepaper ── */
    {
      name: "Canton Network Whitepaper",
      authors: "Digital Asset",
      venue: "Digital Asset Technical Documentation, 2023",
      status: "queued",
      relevance: "context",
      analogy:
        "Canton is the enterprise privacy approach that deliberately chose NOT " +
        "to use ZKPs. Instead of mathematical proofs that you cannot see private " +
        "data, Canton uses a sophisticated 'need-to-know' access control system: " +
        "each transaction is split into sub-views, and each participant only " +
        "receives the sub-views they are a party to. Privacy is enforced by " +
        "selective data distribution, not cryptographic hiding. Think of it as " +
        "a confidential filing system where the clerk physically hands you only " +
        "the pages you are authorized to see — efficient and auditable, but " +
        "trusting the clerk.",
      diagram:
        '┌────────────────────────────────────────────────────────────┐\n' +
        '│           Canton Network — Privacy Architecture             │\n' +
        '├────────────────────────────────────────────────────────────┤\n' +
        '│                                                            │\n' +
        '│  SUB-TRANSACTION VIEW MODEL                                │\n' +
        '│  Full Transaction                                          │\n' +
        '│  ┌──────────────────────────────────────────────────┐      │\n' +
        '│  │ View A: Party 1 + Party 2 data (both see this)   │      │\n' +
        '│  │ View B: Party 2 + Party 3 data (Party 1 hidden)  │      │\n' +
        '│  │ View C: Global settlement data (all parties)     │      │\n' +
        '│  └──────────────────────────────────────────────────┘      │\n' +
        '│                                                            │\n' +
        '│  BLINDED MERKLE TREE                                       │\n' +
        '│  Transaction hash = Merkle root of all views               │\n' +
        '│  Each party sees their subtree; other branches blinded     │\n' +
        '│  → Integrity verified without full disclosure              │\n' +
        '│                                                            │\n' +
        '│  NO ZKPs: privacy = access control + data minimization     │\n' +
        '│  Comparison baseline: ZKPs would add silent-failure risk   │\n' +
        '└────────────────────────────────────────────────────────────┘',
      diagram_mermaid:
        'flowchart TD\n' +
        '  TX["Full Transaction"]\n' +
        '  TX --> VA["View A<br/>Party 1 + Party 2 data<br/><i>both see this</i>"]\n' +
        '  TX --> VB["View B<br/>Party 2 + Party 3 data<br/><i>Party 1 hidden</i>"]\n' +
        '  TX --> VC["View C<br/>Global settlement data<br/><i>all parties</i>"]\n' +
        '  VA --> MT["Blinded Merkle Tree<br/>tx hash = Merkle root of all views"]\n' +
        '  VB --> MT\n' +
        '  VC --> MT\n' +
        '  MT --> INT["Integrity verified<br/>without full disclosure"]\n' +
        '  INT --> CON["<b>No ZKPs</b><br/>privacy = access control<br/>+ data minimization"]\n' +
        '  classDef proofsystem fill:#111827,stroke:#6366F1,color:#fff\n' +
        '  classDef prover fill:#1f2937,stroke:#06B6D4,color:#fff\n' +
        '  classDef verifier fill:#1a1a1a,stroke:#10B981,color:#fff\n' +
        '  class TX proofsystem\n' +
        '  class VA,VB,VC,MT prover\n' +
        '  class INT,CON verifier',
      keyPoints: [
        "Enterprise privacy via sub-transaction views: each participant sees only " +
          "the contract sub-views they are a party to, enforced by selective distribution",
        "Blinded Merkle trees for integrity: transaction hash is the Merkle root " +
          "of all views; parties verify their subtree without seeing others",
        "Explicitly avoids ZKPs: the design philosophy is that correctness " +
          "is enforced by the Daml runtime on trusted nodes, not by proofs",
        "Privacy = data minimization + access control, not cryptographic hiding — " +
          "a fundamentally different trust model than ZKP-based systems",
        "Relevant to your thesis as the enterprise baseline: Canton is the " +
          "dominant enterprise blockchain privacy approach, and your thesis " +
          "must position against it"
      ],
      connections:
        "Canton is your comparison baseline in the discussion chapter. Your " +
        "thesis's ZKP-based approach offers stronger privacy guarantees (no " +
        "trusted distribution layer) but higher computational cost. The Canton " +
        "whitepaper documents exactly what ZKPs replace: the need to trust " +
        "that parties only share data they are authorized to share.",
      thesisExample:
        "In your related work and discussion chapters, contrast Canton with " +
        "your ZKP-based approach: 'Canton achieves enterprise-grade privacy via " +
        "sub-transaction views and blinded Merkle trees [Canton WP], without " +
        "ZKPs. This requires trusting the distribution layer. Our approach " +
        "eliminates this trust assumption at the cost of proof generation overhead " +
        "(§6.2 benchmark). The Canton model is appropriate for permissioned " +
        "enterprise networks; our model targets public blockchains where the " +
        "distribution layer cannot be trusted.'",
      keyTakeaway:
        "Enterprise privacy without ZKPs — the comparison baseline. Canton's " +
        "trust model is what ZKPs are designed to replace."
    },

    /* ── Paper 4: Canton ZKPs Not a Panacea ── */
    {
      name: "Canton: ZKPs Not a Privacy Panacea",
      authors: "Canton Network",
      venue: "Canton Network Blog, 2025",
      status: "queued",
      relevance: "context",
      analogy:
        "This blog post is the prosecution's closing argument against ZKPs as " +
        "a privacy solution. Canton's engineers argue that ZKPs are like a " +
        "perfectly locked safe that can still be robbed if the combination is " +
        "written on a sticky note nearby: the proof might be mathematically " +
        "correct, but silent failures (incorrect circuit constraints), lack of " +
        "auditability, and performance overhead make ZKPs a poor fit for " +
        "enterprise deployments. Your thesis must engage with this critique " +
        "seriously — not dismiss it.",
      diagram:
        '┌────────────────────────────────────────────────────────────┐\n' +
        '│         Canton\'s Critique of ZKPs for Privacy              │\n' +
        '├────────────────────────────────────────────────────────────┤\n' +
        '│                                                            │\n' +
        '│  ARGUMENT 1: Silent Failures                               │\n' +
        '│  ZKP circuit bug → invalid proofs accepted as valid        │\n' +
        '│  No runtime error — system silently violates invariants    │\n' +
        '│  Example: Zcash Sapling trusted setup vulnerability (2019) │\n' +
        '│                                                            │\n' +
        '│  ARGUMENT 2: Lack of Auditability                          │\n' +
        '│  Regulators cannot inspect ZK transactions without a key   │\n' +
        '│  "Right to audit" incompatible with full ZK anonymity      │\n' +
        '│                                                            │\n' +
        '│  ARGUMENT 3: Performance Overhead                          │\n' +
        '│  Groth16 proving: ~1-10 seconds per transaction            │\n' +
        '│  Verification: ~1ms — acceptable, proving is the bottleneck│\n' +
        '│                                                            │\n' +
        '│  CANTON\'S RESPONSE: sub-transaction views + Daml runtime   │\n' +
        '│  YOUR THESIS RESPONSE: TEE auditor + circuit audits (§5.4) │\n' +
        '└────────────────────────────────────────────────────────────┘',
      diagram_mermaid:
        'flowchart TD\n' +
        '  C["Canton critique of ZKPs"]\n' +
        '  C --> A1["Argument 1: Silent Failures<br/>circuit bug -> invalid proofs accepted<br/><i>Zcash Sapling setup vuln (2019)</i>"]\n' +
        '  C --> A2["Argument 2: Lack of Auditability<br/>regulators need key<br/><i>right to audit vs full anonymity</i>"]\n' +
        '  C --> A3["Argument 3: Performance Overhead<br/>Groth16 proving: 1-10s / tx<br/>Verification: ~1ms (ok)"]\n' +
        '  A1 --> CR["Canton response<br/>sub-transaction views<br/>+ Daml runtime"]\n' +
        '  A2 --> CR\n' +
        '  A3 --> CR\n' +
        '  A1 --> TR["Thesis response<br/>TEE auditor<br/>+ circuit audits (S5.4)"]\n' +
        '  A2 --> TR\n' +
        '  A3 --> TR\n' +
        '  classDef proofsystem fill:#111827,stroke:#6366F1,color:#fff\n' +
        '  classDef prover fill:#1f2937,stroke:#06B6D4,color:#fff\n' +
        '  classDef verifier fill:#1a1a1a,stroke:#10B981,color:#fff\n' +
        '  class C proofsystem\n' +
        '  class A1,A2,A3 prover\n' +
        '  class CR,TR verifier',
      keyPoints: [
        "Industry critique of ZKPs for enterprise privacy from Canton Network engineers",
        "Silent failures: ZKP circuit bugs produce invalid proofs that pass " +
          "verification — no runtime error, system silently violates business logic",
        "Lack of auditability: regulators and auditors cannot inspect ZK-encrypted " +
          "transactions without a backdoor key, creating compliance risk",
        "Performance concerns: proof generation latency (seconds) is unacceptable " +
          "for high-frequency enterprise transaction processing",
        "Argues that Canton's sub-transaction view model achieves equivalent " +
          "enterprise privacy without these failure modes",
        "Your thesis must directly address each critique to be credible"
      ],
      connections:
        "This blog post defines the objections your thesis must defeat. For " +
        "silent failures: your circuit design uses formal verification and " +
        "the Circom type system to prevent under-constrained circuits. " +
        "For auditability: your TEE audit path gives regulators access without " +
        "breaking anonymity for non-audited transactions. " +
        "For performance: your benchmarks should show Groth16 verification " +
        "on Sui is < 1ms (on-chain cost), and the proving bottleneck is " +
        "client-side (acceptable for wallet UX).",
      thesisExample:
        "In Chapter 6 (evaluation) or the discussion chapter, have a dedicated " +
        "section 'Addressing the ZKP Critique' that cites this blog post and " +
        "responds to each argument: (1) Circuit correctness: cite your formal " +
        "verification approach; (2) Auditability: cite your TEE audit design; " +
        "(3) Performance: cite your Groth16 verification benchmarks on Sui. " +
        "This shows reviewers you have engaged with the strongest counterarguments.",
      keyTakeaway:
        "The strongest industry critique of ZKPs. Your thesis must address " +
        "silent failures, auditability, and performance to be credible."
    },

    /* ── Paper 5: The Sumcheck Protocol ── */
    {
      name: "The Sumcheck Protocol (LFKN 1992 + Modern Revival)",
      authors: "Lund, Fortnow, Karloff, Nisan (1992) / Thaler (2013-2024)",
      venue: "JCSS 1992 + Thaler's Proofs, Arguments and Zero Knowledge, 2023",
      status: "queued",
      relevance: "core",
      analogy:
        "Imagine you are an election auditor with 2^20 (one million) ballot boxes " +
        "distributed across 20 regions. You need to verify the total vote count " +
        "is correct, but you cannot physically open every box — it would take " +
        "forever. The sumcheck protocol lets you verify the total by checking " +
        "just 20 'partial sum' polynomials — one per region dimension — using " +
        "randomness to compress each layer. At each step, the prover commits " +
        "to a small summary of one dimension, the verifier spot-checks it " +
        "against the previous round using a random challenge, and they move to " +
        "the next dimension. After 20 rounds, the verifier is left with a " +
        "single evaluation to check directly. The key insight: you reduce a " +
        "global claim (sum over exponentially many points) to a local claim " +
        "(one evaluation at a random point).",
      diagram:
        '┌────────────────────────────────────────────────────────────┐\n' +
        '│           The Sumcheck Protocol — Core Mechanism            │\n' +
        '├────────────────────────────────────────────────────────────┤\n' +
        '│                                                            │\n' +
        '│  CLAIM: H = Σ_{x ∈ {0,1}^n} g(x)                         │\n' +
        '│                                                            │\n' +
        '│  PROVER                         VERIFIER                   │\n' +
        '│  ┌──────────────┐               ┌──────────────┐           │\n' +
        '│  │ Sends s1(X)  │ ──────────→   │ s1(0)+s1(1)  │           │\n' +
        '│  │ (univariate) │ ←── r1 ───   │ =? H          │           │\n' +
        '│  │ Sends s2(X)  │ ──────────→   │ s2(0)+s2(1)  │           │\n' +
        '│  │              │ ←── r2 ───   │ =? s1(r1)     │           │\n' +
        '│  │    ...       │     ...       │    ...        │           │\n' +
        '│  │ Sends sn(X)  │ ──────────→   │ sn(0)+sn(1)  │           │\n' +
        '│  │              │ ←── rn ───   │ =? s_{n-1}()  │           │\n' +
        '│  └──────────────┘               └──────────────┘           │\n' +
        '│                                                            │\n' +
        '│  FINAL: Verifier checks g(r1,...,rn) = sn(rn) via PCS     │\n' +
        '│                                                            │\n' +
        '│  COST: n rounds, O(n·d) communication, O(n·d) verifier     │\n' +
        '│  SOUNDNESS: n·d / |F| ≈ 0 for large fields                │\n' +
        '└────────────────────────────────────────────────────────────┘',
      diagram_mermaid:
        'flowchart TD\n' +
        '  CLAIM["Claim: H = Σ g(x) over {0,1}^n"]\n' +
        '  CLAIM --> R1["Round 1: Prover sends s₁(X)<br/>Verifier checks s₁(0)+s₁(1) = H<br/>Verifier sends random r₁"]\n' +
        '  R1 --> R2["Round 2: Prover sends s₂(X)<br/>Verifier checks s₂(0)+s₂(1) = s₁(r₁)<br/>Verifier sends random r₂"]\n' +
        '  R2 --> RN["...<br/>Round n: Prover sends sₙ(X)<br/>Verifier checks sₙ(0)+sₙ(1) = sₙ₋₁(rₙ₋₁)"]\n' +
        '  RN --> FINAL["Final: Verifier checks g(r₁,...,rₙ) = sₙ(rₙ)<br/><b>via polynomial commitment (PCS)</b>"]\n' +
        '  FINAL --> RESULT["✓ Accept or ✗ Reject<br/>Soundness: n·d/|F| ≈ 0"]\n' +
        '  classDef proofsystem fill:#111827,stroke:#6366F1,color:#fff\n' +
        '  classDef prover fill:#1f2937,stroke:#06B6D4,color:#fff\n' +
        '  classDef verifier fill:#1a1a1a,stroke:#10B981,color:#fff\n' +
        '  class CLAIM proofsystem\n' +
        '  class R1,R2,RN prover\n' +
        '  class FINAL,RESULT verifier',
      keyPoints: [
        "The most important building block in modern SNARKs — central to " +
          "Spartan, HyperNova, Lasso/Jolt, Binius, and GKR protocols",
        "Converts an exponential-size sum (2^n terms) into n rounds of " +
          "interaction, each involving a small degree-d polynomial",
        "Communication cost O(n·d) — exponentially less than 2^n naive " +
          "verification. Verifier work is O(n·d), nearly trivial",
        "No FFT required — unlike Plonk/Groth16, sumcheck provers use " +
          "linear memory, making it ideal for large structured computations",
        "Soundness guaranteed by Schwartz-Zippel lemma: cheating probability " +
          "≤ n·d/|F|, which is negligible for 256-bit fields",
        "Composable: can be nested, batched, and paired with any polynomial " +
          "commitment scheme (KZG, FRI, IPA)"
      ],
      connections:
        "Sumcheck is the engine behind the thesis's folding pipeline. " +
        "Spartan — the final decider SNARK in Sonobe — is a sumcheck-based " +
        "protocol. HyperNova's multifolding uses sumcheck to batch CCS " +
        "instances. Lasso/Jolt's lookup arguments decompose via sumcheck. " +
        "Understanding sumcheck mechanics is prerequisite to debugging " +
        "why a Sonobe proof fails.",
      thesisExample:
        "In your implementation chapter, when describing the folding + final " +
        "SNARK pipeline, explain that the Spartan decider works by expressing " +
        "R1CS satisfiability as a sum over the Boolean hypercube, then " +
        "applying the sumcheck protocol to reduce verification to a single " +
        "polynomial evaluation. This is why the decider proof is small and " +
        "fast to verify on Sui: sumcheck compresses the check to O(n) rounds, " +
        "and the final evaluation is delegated to a polynomial commitment.",
      keyTakeaway:
        "The fundamental engine of modern SNARKs. Converts exponential " +
        "sums to linear-round interactive proofs. Powers Spartan, HyperNova, " +
        "Jolt — the exact tools used in the thesis folding pipeline."
    },

    /* ── Paper 6: Lattice-Based Cryptography ── */
    {
      name: "Lattice-Based Cryptography: From LWE to Post-Quantum ZK",
      authors: "Regev (2005), Lyubashevsky (2012), Beullens & Seiler (LaBRADOR, 2023)",
      venue: "STOC 2005 (LWE), EUROCRYPT 2012 (Fiat-Shamir for lattices), CRYPTO 2023 (LaBRADOR), CRYPTO 2024 (Greyhound)",
      status: "queued",
      relevance: "future-work",
      analogy:
        "Imagine a grid of evenly spaced points stretching to infinity — like " +
        "an infinite sheet of graph paper in hundreds of dimensions. Lattice " +
        "cryptography works because two simple operations become impossibly " +
        "hard in high dimensions: (1) finding the closest grid point to an " +
        "arbitrary target, and (2) finding a short combination of grid vectors " +
        "that sums to a specific result. The beauty is that quantum computers, " +
        "which shatter RSA and pairings via Shor's algorithm, gain essentially " +
        "no advantage against lattice problems. This makes lattices the only " +
        "known foundation that supports encryption, signatures, ZK proofs, " +
        "AND fully homomorphic encryption — all post-quantum secure.",
      diagram:
        '┌────────────────────────────────────────────────────────────┐\n' +
        '│        Lattice-Based Cryptography — Thesis Relevance       │\n' +
        '├────────────────────────────────────────────────────────────┤\n' +
        '│                                                            │\n' +
        '│  HARD PROBLEMS                                             │\n' +
        '│  LWE:  b = A·s + e (mod q)      → find secret s           │\n' +
        '│  SIS:  A·x = 0 (mod q)           → find short x           │\n' +
        '│  Module variants: matrices over Z_q[X]/(X^n+1)            │\n' +
        '│                                                            │\n' +
        '│  NIST STANDARDS (Aug 2024)                                 │\n' +
        '│  FIPS 203: ML-KEM (Kyber)    → key encapsulation          │\n' +
        '│  FIPS 204: ML-DSA (Dilithium) → digital signatures        │\n' +
        '│  FIPS 205: SLH-DSA (SPHINCS+) → hash-based signatures     │\n' +
        '│                                                            │\n' +
        '│  ZK PROOFS (research frontier)                             │\n' +
        '│  Labrador (CRYPTO 2024) — first practical lattice SNARK    │\n' +
        '│  Greyhound (2024) — improved structured commitments        │\n' +
        '│  Proof size: ~50-100 KB (vs 288 B for Groth16)            │\n' +
        '│                                                            │\n' +
        '│  THESIS: pairing-based now → lattice-based future work     │\n' +
        '└────────────────────────────────────────────────────────────┘',
      diagram_mermaid:
        'flowchart TD\n' +
        '  LP["Lattice Hard Problems<br/>LWE + SIS"]\n' +
        '  LP --> NIST["NIST Standards (2024)<br/>ML-KEM, ML-DSA, SLH-DSA"]\n' +
        '  LP --> ZK["Post-Quantum ZK<br/>Labrador, Greyhound"]\n' +
        '  LP --> FHE["FHE Schemes<br/>CKKS, BFV, BGV, TFHE"]\n' +
        '  ZK --> THESIS["Thesis Migration Path<br/>Groth16 → Labrador<br/>BBS+ → Lattice credentials"]\n' +
        '  NIST --> THESIS\n' +
        '  classDef proofsystem fill:#111827,stroke:#6366F1,color:#fff\n' +
        '  classDef prover fill:#1f2937,stroke:#06B6D4,color:#fff\n' +
        '  classDef verifier fill:#1a1a1a,stroke:#10B981,color:#fff\n' +
        '  class LP proofsystem\n' +
        '  class NIST,ZK,FHE prover\n' +
        '  class THESIS verifier',
      keyPoints: [
        "Post-quantum secure: lattice problems (LWE, SIS) resist both " +
          "classical and quantum attacks — Shor's algorithm does not help",
        "NIST standardized ML-KEM (Kyber) and ML-DSA (Dilithium) in August " +
          "2024 as FIPS 203 and 204 — lattices are now the official PQ standard",
        "LaBRADOR (CRYPTO 2023) is the first practical lattice-based proof system: " +
          "~50 KB proofs. Greyhound (CRYPTO 2024) adds sublinear verification. " +
          "RoKoko (2026) achieves polylog verifier, 100x faster",
        "Key tradeoff vs pairing-based: lattice proofs are 100-300x larger " +
          "and 10x slower to verify, but survive quantum computers",
        "Lattices also enable FHE (compute on encrypted data) — the only " +
          "known mathematical foundation supporting encryption, signatures, " +
          "ZK proofs, AND FHE simultaneously",
        "Module-LWE (used by Kyber/Dilithium) offers the best balance of " +
          "security, performance, and implementation simplicity"
      ],
      connections:
        "Lattice-based crypto is the post-quantum migration path for your " +
        "thesis. Currently the system uses BLS12-381 pairings for Groth16 " +
        "and BBS+ — both broken by Shor's algorithm. The future-work chapter " +
        "should outline: (1) replace BBS+ with lattice-based anonymous " +
        "credentials, (2) replace Groth16 with Labrador/Greyhound, " +
        "(3) leverage the TEE to absorb the larger proof sizes off-chain.",
      thesisExample:
        "In your discussion and future work chapters, present the lattice " +
        "migration as a concrete path: 'The current pairing-based design " +
        "(BLS12-381 Groth16, BBS+ signatures) is vulnerable to quantum " +
        "attacks. A post-quantum variant would replace Groth16 with " +
        "Labrador [Beullens-Seiler, CRYPTO 2024], accepting ~50-100 KB " +
        "proof sizes. The TEE auditor architecture (§5) mitigates this: " +
        "lattice proofs are verified off-chain inside the TEE, and only " +
        "compact attestations are posted on Sui.' Include the comparison " +
        "table from the ZK Deep Dive section.",
      keyTakeaway:
        "The post-quantum foundation for all thesis cryptography. Not used " +
        "today (proof sizes too large), but the concrete migration path " +
        "when quantum computers threaten pairing-based systems."
    }
  ]
};
