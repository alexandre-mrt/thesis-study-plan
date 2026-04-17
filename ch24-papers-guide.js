/**
 * Ch 2.4 Papers Guide — Privacy-Preserving Payments
 * Intuitive recap data for academic paper cards.
 * Rendered by paper-guide.js via window.CH24_PAPERS.
 */

window.CH24_PAPERS = {
  papers: [
    /* ── Paper 1: SoK Privacy-Preserving Transactions ── */
    {
      name: "SoK: Privacy-Preserving Transactions in Blockchains",
      authors: "Baldimtsi, Chalkias, Madathil, Roy",
      venue: "IACR ePrint 2024/1959 (rev. Jan 2026)",
      status: "queued",
      relevance: "core",
      analogy:
        "Think of this paper as the definitive field guide for a naturalist " +
        "surveying every species of private blockchain payment. Before this SoK, " +
        "researchers used incompatible definitions — one team's 'anonymous' was " +
        "another team's 'unlinkable'. The authors (from Mysten Labs and Yale) " +
        "define a single formal taxonomy, then rate every major system against " +
        "it. The six open problems at the end are a research agenda in disguise: " +
        "each one is a gap your thesis can target.",
      diagram:
        '┌────────────────────────────────────────────────────────────┐\n' +
        '│          SoK Privacy Taxonomy (Baldimtsi et al.)           │\n' +
        '├────────────────────────────────────────────────────────────┤\n' +
        '│                                                            │\n' +
        '│  PRIVACY LEVELS (weakest → strongest)                      │\n' +
        '│  ┌────────────────────────────────────────────────────┐    │\n' +
        '│  │ Confidentiality   — amounts hidden, parties known  │    │\n' +
        '│  │ k-Anonymity       — sender in crowd of k users     │    │\n' +
        '│  │ Full Anonymity    — sender/receiver fully hidden   │    │\n' +
        '│  │ Sender-Receiver   — tx graph fully unlinkable      │    │\n' +
        '│  │   Unlinkability                                    │    │\n' +
        '│  └────────────────────────────────────────────────────┘    │\n' +
        '│                                                            │\n' +
        '│  LEDGER MODELS COVERED                                     │\n' +
        '│  UTxO (Bitcoin-style)  ←→  Account-based (Ethereum-style) │\n' +
        '│                                                            │\n' +
        '│  CRYPTO TOOLS COMPARED                                     │\n' +
        '│  Homomorphic Encryption │ ZKPs │ Ring Sigs │ MPC           │\n' +
        '│                                                            │\n' +
        '│  6 OPEN PROBLEMS (your thesis targets #5 and #6)           │\n' +
        '│  1. Stateless verification  4. Post-quantum privacy        │\n' +
        '│  2. Efficient anon accounts 5. Anon creds + payments       │\n' +
        '│  3. Privacy + auditability  6. Anon account-based systems  │\n' +
        '└────────────────────────────────────────────────────────────┘',
      keyPoints: [
        "First unified formal framework comparing privacy guarantees across all major " +
          "private payment systems (Zcash, Monero, Tornado Cash, UTT, Zether, etc.)",
        "Defines four privacy levels: confidentiality, k-anonymity, full anonymity, " +
          "and sender-receiver unlinkability — each with a precise game-based definition",
        "Covers both UTxO-based and account-based models, identifying that the latter " +
          "is fundamentally harder to make fully anonymous due to sequential nonce state",
        "Compares cryptographic tools: homomorphic encryption for balance verification, " +
          "ZKPs for transaction validity, ring signatures for sender ambiguity",
        "Lists 6 open problems — including efficient anonymous account-based systems " +
          "and combining anonymous credentials with payment privacy",
        "Mysten Labs co-authored: directly relevant to Sui's design roadmap and " +
          "your thesis company's research agenda"
      ],
      connections:
        "This SoK is the canonical citation for framing your thesis problem. " +
        "Open problem #5 (anonymous credentials + private payments) and #6 " +
        "(efficient anonymous account-based systems) are exactly what your work " +
        "addresses on Sui. The formal privacy definitions here should be imported " +
        "verbatim into your background chapter as the notational baseline.",
      thesisExample:
        "In Chapter 2.4, cite Baldimtsi et al.'s sender-receiver unlinkability " +
        "definition when positioning your system. In Chapter 5 (design), show that " +
        "your Sui-based construction achieves full anonymity (level 3 in their " +
        "taxonomy) while the TEE auditor pattern addresses their open problem #3 " +
        "(privacy with auditability). The Mysten Labs co-authorship makes this a " +
        "credibility anchor for your thesis.",
      keyTakeaway:
        "The definitive SoK for private blockchain payments by your thesis company. " +
        "The 6 open problems it identifies are the research gap your thesis fills."
    },

    /* ── Paper 2: Hitchhiker's Guide ── */
    {
      name: "Hitchhiker's Guide to Privacy-Preserving Digital Payment Systems",
      authors: "Nardelli et al.",
      venue: "Bank of Italy, arXiv 2505.21008, 2025",
      status: "queued",
      relevance: "related",
      analogy:
        "If the SoK above is the scientific field guide, this is the tourist's " +
        "companion: written by central bank economists, it explains the same " +
        "privacy landscape in policy-friendly language. It bridges the gap between " +
        "cryptographic definitions and what regulators actually care about — making " +
        "it the ideal reference when your thesis discusses compliance, GDPR, and " +
        "the trade-off between user privacy and AML/KYC requirements.",
      diagram:
        '┌────────────────────────────────────────────────────────────┐\n' +
        '│          Hitchhiker\'s Guide — Taxonomy Overview            │\n' +
        '├────────────────────────────────────────────────────────────┤\n' +
        '│                                                            │\n' +
        '│  PRIVACY GOALS (policy framing)                            │\n' +
        '│  ┌──────────────────────────────────────────────────┐      │\n' +
        '│  │ Payment Confidentiality — amount hidden          │      │\n' +
        '│  │ Sender Anonymity        — payer identity hidden  │      │\n' +
        '│  │ Receiver Anonymity      — payee identity hidden  │      │\n' +
        '│  │ Relationship Privacy    — link between parties   │      │\n' +
        '│  │ Temporal Privacy        — timing of payments     │      │\n' +
        '│  └──────────────────────────────────────────────────┘      │\n' +
        '│                                                            │\n' +
        '│  OPEN CHALLENGES IDENTIFIED                                │\n' +
        '│  • Privacy vs. AML/KYC compliance tension                  │\n' +
        '│  • Regulatory auditability without breaking anonymity      │\n' +
        '│  • Scalability of ZK-based systems at CBDC scale           │\n' +
        '│  • Interoperability across payment rails                   │\n' +
        '└────────────────────────────────────────────────────────────┘',
      keyPoints: [
        "Comprehensive taxonomy of privacy goals in digital payments, written " +
          "from a central bank / policy perspective (Bank of Italy)",
        "Distinguishes payment confidentiality, sender anonymity, receiver " +
          "anonymity, relationship privacy, and temporal privacy as separate goals",
        "Surveys existing systems (Zcash, Monero, Lightning, CBDC prototypes) " +
          "against the taxonomy, identifying which goals each achieves",
        "Highlights open challenges: AML/KYC tension, scalability at CBDC scale, " +
          "cross-border interoperability",
        "Policy-oriented framing makes it ideal for the regulatory discussion " +
          "section of a thesis targeting enterprise or government deployment"
      ],
      connections:
        "Use this paper in the regulatory framing of your thesis. When you argue " +
        "that anonymous credentials + TEE auditing resolve the privacy-compliance " +
        "tension, this is the citation for why that tension exists. The Bank of " +
        "Italy provenance adds legitimacy when your thesis discusses CBDC-adjacent " +
        "use cases or eIDAS 2.0 compliance.",
      thesisExample:
        "In your thesis discussion chapter, cite the Hitchhiker's Guide when " +
        "explaining why full sender anonymity (as in Monero) is insufficient for " +
        "regulated contexts, and why your TEE-based auditor pattern is a principled " +
        "middle ground. The paper's open challenge on 'regulatory auditability " +
        "without breaking anonymity' is precisely what your BBS+ credential + " +
        "threshold auditor design addresses.",
      keyTakeaway:
        "Policy-friendly taxonomy of payment privacy goals, with the AML/KYC " +
        "tension as the key challenge your thesis's auditor pattern resolves."
    },

    /* ── Paper 3: UTT ── */
    {
      name: "UTT: Decentralized Ecash with Accountable Privacy",
      authors: "Tomescu et al.",
      venue: "IACR 2022/452",
      status: "read",
      relevance: "core",
      analogy:
        "UTT solves the 'honest criminal' problem: a fully anonymous payment " +
        "system (like physical cash) is perfect for honest users but paradise " +
        "for money launderers. UTT's insight is that you can have untraceable " +
        "transactions most of the time, but a threshold committee of auditors " +
        "can collaboratively de-anonymize specific transactions if required " +
        "by law. Think of it as digital cash with a sealed warrant: you need " +
        "a majority of judges (threshold signature) to break the seal, but " +
        "one corrupt judge cannot do it alone.",
      diagram:
        '┌────────────────────────────────────────────────────────────┐\n' +
        '│              UTT Protocol Architecture                     │\n' +
        '├────────────────────────────────────────────────────────────┤\n' +
        '│                                                            │\n' +
        '│  COIN STRUCTURE                                            │\n' +
        '│  coin = (serial_number, type, value, owner_pk, budget_tag) │\n' +
        '│                                                            │\n' +
        '│  TRANSACTION FLOW                                          │\n' +
        '│  ┌────────┐    spend proof     ┌───────────┐              │\n' +
        '│  │ Sender │ ─────────────────→ │ Validator │              │\n' +
        '│  └────────┘  (ZKP: I own       └─────┬─────┘              │\n' +
        '│                input coins,           │ nullifier check    │\n' +
        '│                value balances,        ▼                    │\n' +
        '│                budget valid)    ┌──────────┐              │\n' +
        '│                                 │  Ledger  │              │\n' +
        '│  ISSUANCE                       └──────────┘              │\n' +
        '│  ┌──────────────────────────────────────────────┐         │\n' +
        '│  │ Bank  ──[threshold BLS]──→  signed coin      │         │\n' +
        '│  │  (t-of-n trustees must co-sign)              │         │\n' +
        '│  └──────────────────────────────────────────────┘         │\n' +
        '│                                                            │\n' +
        '│  AUDIT PATH                                                │\n' +
        '│  coin encrypted to auditor_pk (ElGamal)                   │\n' +
        '│  t-of-n auditors → partial decryptions → reveal owner     │\n' +
        '│                                                            │\n' +
        '│  BUDGET SYSTEM                                             │\n' +
        '│  Each user has a privacy budget B (monthly limit).         │\n' +
        '│  ZKP proves remaining budget ≥ 0 without revealing it.     │\n' +
        '└────────────────────────────────────────────────────────────┘',
      keyPoints: [
        "First formal treatment of 'accountable privacy' in decentralized ecash: " +
          "untraceable by default, auditable by threshold committee under legal process",
        "Uses threshold BLS signatures for coin issuance: t-of-n bank trustees " +
          "must collaborate to mint coins, preventing unilateral money creation",
        "Pedersen commitments hide coin values; range proofs (using inner-product " +
          "arguments) prove values are non-negative without revealing them",
        "Nullifier-based double-spend prevention: each coin has a unique serial " +
          "number; spending reveals the nullifier, not the coin's origin",
        "Budget system: each user has a privacy budget B (e.g. 10,000 per month); " +
          "a ZKP proves the transaction does not exceed the budget without revealing it",
        "Audit mechanism: coins are ElGamal-encrypted to auditor public key; " +
          "t-of-n auditors produce partial decryptions, combined to reveal owner",
        "Implemented in utt-rs (Rust); directly influences Mysten Labs's " +
          "confidential transaction design and your thesis system"
      ],
      connections:
        "UTT is the closest published system to your thesis design. Your " +
        "contribution differs in three ways: (1) you use BBS+ anonymous credentials " +
        "for identity binding rather than UTT's simpler public-key model; (2) you " +
        "target Sui's object model rather than a custom ledger; (3) you use a TEE " +
        "for the audit path instead of UTT's pure threshold cryptography, which " +
        "reduces on-chain audit complexity but introduces a hardware trust assumption.",
      thesisExample:
        "In your related work chapter, position your system relative to UTT: " +
        "'UTT demonstrates accountable privacy is achievable with threshold BLS " +
        "and range proofs [cite 2022/452]. We extend this by integrating " +
        "anonymous credential binding (§4.2) and replacing the threshold audit " +
        "committee with a TEE-backed auditor (§4.3), achieving lower on-chain " +
        "complexity at the cost of a hardware trust assumption.' " +
        "The budget proof mechanism maps directly to your payment-cap ZKP.",
      keyTakeaway:
        "The paper your thesis most directly builds on. Study the nullifier " +
        "scheme, budget proof construction, and threshold audit mechanism in detail."
    }
  ]
};
