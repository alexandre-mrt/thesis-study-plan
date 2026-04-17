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
    }
  ]
};
