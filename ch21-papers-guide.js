/**
 * Ch 2.1 Anonymous Credentials — Papers Guide (Intuitive View)
 * Data file for the study plan website. Loaded as window.CH21_PAPERS.
 * Thesis topic: Anonymous credentials + ZKP + TEE for identity and private payments on Sui.
 */

window.CH21_PAPERS = {
  papers: [
    /* ───────── 1. Revisiting BBS Signatures ───────── */
    {
      name: "Revisiting BBS Signatures",
      authors: "Tessaro, Zhu",
      venue: "ePrint 2023/275",
      status: "skimmed",
      relevance: "core",
      analogy:
        "BBS+ signatures are like a wax seal on a multi-page letter: " +
        "the issuer stamps the whole bundle once, and the holder can " +
        "later show any subset of pages to a verifier while covering " +
        "the rest with opaque paper — proving the pages are genuinely " +
        "part of the sealed letter without exposing the hidden ones. " +
        "This paper reopens the foundry, examines whether the original " +
        "wax seal recipe really prevents forgery under the strongest " +
        "possible conditions, and proposes a leaner variant that " +
        "achieves the same guarantees with a shorter stamp.",
      diagram:
        '┌─────────────────────────────────────────────────────────┐\n' +
        '│              BBS Signatures — Core Idea                 │\n' +
        '├─────────────────────────────────────────────────────────┤\n' +
        '│                                                         │\n' +
        '│  Issuer signs message vector [m1, m2, m3, m4]          │\n' +
        '│                                                         │\n' +
        '│  Sign:  (m1,m2,m3,m4) ──→ σ   (1 group element)        │\n' +
        '│                                                         │\n' +
        '│  Holder shows subset {m1, m3}, hides {m2, m4}          │\n' +
        '│                                                         │\n' +
        '│  Prove:  σ + {m1,m3} + ZK(m2,m4) ──→ π                │\n' +
        '│                                                         │\n' +
        '│  Verify: check π without learning m2, m4               │\n' +
        '│                                                         │\n' +
        '│  Security: EUF-CMA under q-SDH in pairing groups       │\n' +
        '└─────────────────────────────────────────────────────────┘',
      keyPoints: [
        "Re-examines the formal EUF-CMA security of BBS+ under cleaner assumptions",
        "Proposes a shorter-signature variant (one fewer group element) without sacrificing security",
        "Identifies subtleties in the original proof that required correction",
        "Proves security in the random oracle model + algebraic group model (AGM)",
        "Directly feeds W3C BBS Data Integrity spec and EU digital identity wallets"
      ],
      connections:
        "BBS signatures are the issuance primitive your thesis builds on. " +
        "This paper's formal security analysis is the bedrock that justifies " +
        "relying on BBS+ for the anonymous credential layer on Sui. " +
        "The shorter-signature variant reduces on-chain storage cost when " +
        "credential commitments are anchored in Sui's object model.",
      thesisExample:
        "When your TEE issues a credential to a mobile wallet on Sui, " +
        "it produces a BBS+ signature over attributes [nationality, age, " +
        "expiry, binding_key]. The holder's ZK circuit then proves " +
        "possession of a valid BBS+ signature while disclosing only " +
        "{age ≥ 18} — this paper's security proof guarantees that " +
        "binding_key cannot be extracted from any number of such proofs.",
      keyTakeaway: "Formal security foundation for BBS+: shorter signatures, tighter proofs under AGM."
    },

    /* ───────── 2. Server-Aided Anonymous Credentials (SAAC) ───────── */
    {
      name: "Server-Aided Anonymous Credentials",
      authors: "Chairattana-Apirom, Harding, Lysyanskaya, Tessaro",
      venue: "CRYPTO 2025, ePrint 2025/513",
      status: "skimmed",
      relevance: "core",
      analogy:
        "Imagine you want a signed badge proving you are a verified adult, " +
        "but you do not want the badge office to know who you are or when " +
        "you use it. Normally, anonymous credential schemes need heavy " +
        "pairing math — expensive on a phone. SAAC is like hiring a " +
        "trusted courier who does the heavy lifting for you: the server " +
        "performs the hard computations on the credential, but the " +
        "protocol is designed so the server never learns your identity " +
        "or which credential you are using. Your phone just checks the " +
        "server did its job correctly, then adds a cheap local touch to " +
        "make the proof unlinkable.",
      diagram:
        '┌─────────────────────────────────────────────────────────┐\n' +
        '│        Server-Aided Anonymous Credentials (SAAC)        │\n' +
        '├─────────────────────────────────────────────────────────┤\n' +
        '│                                                         │\n' +
        '│  ISSUANCE (pairing-free)                                │\n' +
        '│  Issuer ──blindly signs──→ User (no pairings needed)   │\n' +
        '│                                                         │\n' +
        '│  SHOWING (assisted)                                     │\n' +
        '│  User ──blinded request──→ Server ──partial proof──→   │\n' +
        '│         ↑ unlinkable                    ↓               │\n' +
        '│  User ──verify + finalize──→ Verifier                  │\n' +
        '│                                                         │\n' +
        '│  Constructions:                                         │\n' +
        '│  ① Stat. anon: server cannot identify user             │\n' +
        '│  ② Comp. anon: computationally unlinkable             │\n' +
        '└─────────────────────────────────────────────────────────┘',
      keyPoints: [
        "Eliminates pairings from the user's device — mobile-friendly anonymous credentials",
        "Two constructions: statistical anonymity (stronger) and computational anonymity",
        "Server is honest-but-curious: it helps but learns nothing about identity",
        "Pairing-free issuance makes it compatible with standard DLP-based hardware",
        "Strong formal security model: blindness + unlinkability proven under standard assumptions"
      ],
      connections:
        "SAAC directly addresses the mobile wallet bottleneck in your thesis. " +
        "Sui-based apps run on smartphones where pairing operations are slow. " +
        "SAAC's server-aided approach could be instantiated with a TEE-backed " +
        "helper service: the TEE assists without learning user identity, " +
        "keeping the mobile client lightweight while preserving anonymity.",
      thesisExample:
        "In your private payment flow on Sui, a user's phone needs to " +
        "produce an anonymous credential proof for every transaction. " +
        "With SAAC, the phone sends a blinded token to a TEE server, " +
        "the TEE computes the expensive pairing-based step and returns " +
        "a partial proof, and the phone finalizes using only cheap ECC " +
        "operations — reducing proof time from ~2s to ~200ms on a mid-range device.",
      keyTakeaway: "Pairing-free anonymous credentials via honest server assistance — mobile-first design."
    },

    /* ───────── 3. BBS+ for eIDAS 2.0 ───────── */
    {
      name: "Making BBS Anonymous Credentials eIDAS 2.0 Compliant",
      authors: "—",
      venue: "ePrint 2025/619",
      status: "queued",
      relevance: "core",
      analogy:
        "Imagine a brilliant lock design (BBS+) and a government safety " +
        "regulation (eIDAS 2.0) that every lock sold in Europe must meet. " +
        "This paper is the engineer's report showing exactly which parts " +
        "of the BBS+ lock comply out of the box, which need small " +
        "modifications, and which new mechanisms (like an audit trail " +
        "or revocation list) must be bolted on to pass the regulatory " +
        "inspection — without breaking the lock's core privacy guarantee.",
      diagram:
        '┌─────────────────────────────────────────────────────────┐\n' +
        '│          BBS+ meets eIDAS 2.0 Compliance                │\n' +
        '├─────────────────────────────────────────────────────────┤\n' +
        '│                                                         │\n' +
        '│  eIDAS 2.0 requirements:                                │\n' +
        '│  ├── Selective disclosure           ✓ (BBS+ native)    │\n' +
        '│  ├── Holder binding                 ✓ (link secret)    │\n' +
        '│  ├── Revocation support             △ (needs layer)    │\n' +
        '│  ├── Audit trail (issuance logs)    △ (reg. add-on)    │\n' +
        '│  └── Cross-border interop (W3C VC)  ✓ (BBS Data Int.) │\n' +
        '│                                                         │\n' +
        '│  Modifications proposed:                                │\n' +
        '│  ├── Revocation: status list v2.0                      │\n' +
        '│  └── Audit: issuer-side logging with ZK accountability │\n' +
        '└─────────────────────────────────────────────────────────┘',
      keyPoints: [
        "Maps BBS+ capabilities to eIDAS 2.0 regulation requirements",
        "Identifies compliance gaps: revocation and audit trail need extensions",
        "Proposes concrete modifications while preserving privacy properties",
        "Relevant to EU digital identity wallets (EUDIW) and mDL standards",
        "Bridges academic cryptography and real-world regulatory deployment"
      ],
      connections:
        "Your thesis may reference EU identity frameworks to motivate deployment. " +
        "This paper shows BBS+ is viable in regulated contexts, supporting the " +
        "argument that your Sui-based anonymous credential system could be " +
        "extended to comply with national identity frameworks — making it " +
        "a credible production pathway, not just a research prototype.",
      thesisExample:
        "When positioning your thesis, you can cite this paper to show that " +
        "BBS+ credentials on Sui are not incompatible with regulatory " +
        "requirements: the revocation layer your design includes maps to " +
        "eIDAS 2.0's revocation mandate, and the TEE-based audit log " +
        "addresses the accountability requirement without breaking unlinkability.",
      keyTakeaway: "BBS+ satisfies most eIDAS 2.0 requirements; gaps are bridgeable with standard extensions."
    },

    /* ───────── 4. zk-creds ───────── */
    {
      name: "zk-creds: Flexible Anonymous Credentials from zkSNARKs and Existing Identity Infrastructure",
      authors: "Rosenberg et al.",
      venue: "IEEE S&P 2023, ePrint 2022/878",
      status: "skimmed",
      relevance: "related",
      analogy:
        "Most anonymous credential schemes require a special issuer who " +
        "cooperates with the new system. zk-creds asks: what if you " +
        "already have a perfectly good passport or national ID, and the " +
        "government is never going to run a fancy crypto server for you? " +
        "This paper is like building a universal adapter: you plug in " +
        "your existing document (passport, driver license), and the " +
        "adapter outputs a ZK proof that you meet some predicate " +
        "(age ≥ 18, citizen of X) — with no changes to the issuing " +
        "authority whatsoever. The zkSNARK is the magic inside the adapter.",
      diagram:
        '┌─────────────────────────────────────────────────────────┐\n' +
        '│               zk-creds Architecture                    │\n' +
        '├─────────────────────────────────────────────────────────┤\n' +
        '│                                                         │\n' +
        '│  Existing doc (passport, national ID)                   │\n' +
        '│         │ RSA/ECDSA signature (unmodified)              │\n' +
        '│         ▼                                               │\n' +
        '│  ┌─────────────────────────────────────┐               │\n' +
        '│  │  zkSNARK circuit                    │               │\n' +
        '│  │  - verify doc signature (in-circuit)│               │\n' +
        '│  │  - check predicate on attributes    │               │\n' +
        '│  │  - commit to nullifier (anti-reuse) │               │\n' +
        '│  └─────────────────────────────────────┘               │\n' +
        '│         │                                               │\n' +
        '│         ▼                                               │\n' +
        '│  ZK proof π: "I hold a valid doc with attr P"          │\n' +
        '│  (issuer never involved, doc stays private)            │\n' +
        '└─────────────────────────────────────────────────────────┘',
      keyPoints: [
        "Converts legacy RSA/ECDSA-signed documents into anonymous credentials via zkSNARK circuits",
        "No issuer cooperation required — works with existing passports, national IDs",
        "Introduces nullifiers to prevent double-use of credentials",
        "Handles real-world certificate chains (X.509) inside ZK circuits",
        "Implemented and benchmarked: Groth16 proofs, ~2–5 second proving time on mobile"
      ],
      connections:
        "zk-creds represents an alternative trust anchor for your thesis: instead of " +
        "requiring a new TEE-backed issuer, users could bootstrap anonymous credentials " +
        "from existing government documents. This is relevant for the bootstrapping " +
        "problem on Sui — getting real identity into the system without new infrastructure.",
      thesisExample:
        "A user with a biometric passport could generate a zk-creds proof that " +
        "their nationality is in an allowed set, then register this proof as a " +
        "Sui object. Your private payment circuit could accept either a TEE-issued " +
        "BBS+ credential or a zk-creds passport proof as the identity anchor, " +
        "widening the deployment surface without forking the payment protocol.",
      keyTakeaway: "Bootstrap anonymous credentials from existing signed documents using zkSNARKs — no issuer changes."
    },

    /* ───────── 5. Coconut ───────── */
    {
      name: "Coconut: Threshold Issuance Selective Disclosure Credentials with Applications to Distributed Ledgers",
      authors: "Sonnino et al.",
      venue: "NDSS 2019",
      status: "skimmed",
      relevance: "related",
      analogy:
        "Coconut solves a key trust problem: what if you do not want " +
        "a single authority to issue your credentials? Imagine a notary " +
        "stamp that only becomes valid when at least t out of n city " +
        "clerks each press their partial stamp simultaneously — no " +
        "single clerk can forge the final seal. Coconut brings this " +
        "threshold structure to anonymous credentials on blockchains: " +
        "a distributed set of authorities collectively issues a " +
        "credential that is unlinkable across uses, and the holder " +
        "can selectively disclose attributes via a ZK proof.",
      diagram:
        '┌─────────────────────────────────────────────────────────┐\n' +
        '│                  Coconut Protocol                       │\n' +
        '├─────────────────────────────────────────────────────────┤\n' +
        '│                                                         │\n' +
        '│  ISSUANCE (t-of-n threshold)                            │\n' +
        '│  User ──BlindSign request──→ [Auth1, Auth2, ..., Authn] │\n' +
        '│  Each Authi produces partial_σi                         │\n' +
        '│  User aggregates t partial sigs → σ (full credential)  │\n' +
        '│                                                         │\n' +
        '│  SHOWING (selective disclosure)                         │\n' +
        '│  σ ──randomize──→ σ\' (fresh each time, unlinkable)     │\n' +
        '│  Prove: ZK { knows σ\' valid for attrs with disclosed } │\n' +
        '│                                                         │\n' +
        '│  ON CHAIN: smart contract verifies proof in O(1)       │\n' +
        '└─────────────────────────────────────────────────────────┘',
      keyPoints: [
        "Threshold issuance: t-of-n authorities must cooperate, eliminating single-issuer trust",
        "Selective disclosure via ZK proofs on Coconut signatures (pairing-based)",
        "Randomizable signatures ensure each showing is unlinkable",
        "Smart contract verifier: proofs verified on-chain in constant time",
        "Deployed in Nym network for privacy-preserving bandwidth credentials"
      ],
      connections:
        "Coconut is the closest predecessor to your thesis system on blockchains. " +
        "Your design can cite Coconut for the threshold issuance pattern and " +
        "differentiate by replacing pairing-heavy on-chain verification with " +
        "ZK-SNARK proofs optimized for Sui's Move environment, and adding " +
        "a TEE layer for the issuance authorities to remove honest-majority assumptions.",
      thesisExample:
        "Your Sui deployment could adopt Coconut's threshold structure for credential " +
        "issuance: a set of n TEE-backed oracles each hold a key share, and " +
        "a user obtains a credential only if t of them cooperate. The Sui Move " +
        "verifier module then checks the aggregated BBS+ signature and ZK proof, " +
        "inheriting Coconut's unlinkability while replacing its pairing-heavy " +
        "verifier with a SNARK-based one.",
      keyTakeaway: "Threshold-issued selective-disclosure credentials verified on-chain — foundational pattern for blockchain identity."
    },

    /* ───────── 6. Revocable TACO ───────── */
    {
      name: "Revocable Threshold Anonymous Credentials for Blockchains",
      authors: "—",
      venue: "ACM AsiaCCS 2024",
      status: "queued",
      relevance: "related",
      analogy:
        "Coconut-style credentials are hard to revoke — once issued, " +
        "the seal is valid forever. Revocable TACO adds a time-lock " +
        "mechanism: credentials carry an expiry embedded in the " +
        "cryptographic proof, and authorities can publish a revocation " +
        "beacon that 'breaks' expired seals without needing to know " +
        "who holds them. It is like a parking permit that self-destructs " +
        "at midnight unless renewed, but the permit itself never reveals " +
        "the car's owner.",
      diagram:
        '┌─────────────────────────────────────────────────────────┐\n' +
        '│           Revocable TACO — Revocation Model             │\n' +
        '├─────────────────────────────────────────────────────────┤\n' +
        '│                                                         │\n' +
        '│  Credential σ contains: epoch_tag + credential_data    │\n' +
        '│                                                         │\n' +
        '│  EPOCH-BASED REVOCATION                                 │\n' +
        '│  ┌──────────────────────────────────────┐              │\n' +
        '│  │ Epoch e: authority publishes acc_e   │              │\n' +
        '│  │ Holder proves: epoch_tag ∈ acc_e     │              │\n' +
        '│  │ Revoked: tag NOT in acc_e → proof ✗  │              │\n' +
        '│  └──────────────────────────────────────┘              │\n' +
        '│                                                         │\n' +
        '│  Privacy: accumulator reveals nothing about holder     │\n' +
        '└─────────────────────────────────────────────────────────┘',
      keyPoints: [
        "Adds revocation to threshold anonymous credentials without breaking unlinkability",
        "Epoch-based accumulator: revoked credentials fail proof verification",
        "Holder proves non-revocation as part of the ZK credential show",
        "Threshold issuance preserves distributed trust even during revocation",
        "On-chain accumulator updates are compact (one element per epoch)"
      ],
      connections:
        "Revocation is a required feature for production anonymous credential systems " +
        "on Sui — credentials must be invalidatable if a user is sanctioned or " +
        "their TEE binding is compromised. Revocable TACO provides the template " +
        "for a non-revocation proof that can be embedded in your ZK circuit " +
        "alongside the BBS+ credential validity proof.",
      thesisExample:
        "In your Sui private payment system, a credential could be revoked if " +
        "the binding TEE attestation expires. Revocable TACO's accumulator " +
        "approach lets you publish an epoch accumulator on-chain as a Sui " +
        "shared object; the user's ZK proof includes a membership witness for " +
        "the current epoch — if revoked, the witness is invalid and the " +
        "payment transaction fails at the Move verifier.",
      keyTakeaway: "Epoch-based revocation for threshold anonymous credentials with ZK non-revocation proofs."
    },

    /* ───────── 7. Post-Quantum Traceable Anonymous Credentials ───────── */
    {
      name: "Post-Quantum Traceable Anonymous Credentials from Module Lattices",
      authors: "—",
      venue: "CIC 2026",
      status: "queued",
      relevance: "context",
      analogy:
        "Every anonymous credential scheme today relies on math that a " +
        "quantum computer could break in polynomial time. This paper is " +
        "like re-engineering the wax seal from scratch using " +
        "quantum-resistant materials (module lattices — essentially " +
        "hard problems on grid-like algebraic structures). The result " +
        "is the first anonymous credential system with selective " +
        "disclosure AND traceability that remains secure even against " +
        "an adversary wielding a large-scale quantum computer.",
      diagram:
        '┌─────────────────────────────────────────────────────────┐\n' +
        '│    Post-Quantum Anonymous Credentials (Module Lattice)  │\n' +
        '├─────────────────────────────────────────────────────────┤\n' +
        '│                                                         │\n' +
        '│  Classical (BBS+)         Post-Quantum (this paper)     │\n' +
        '│  Security: DL / q-SDH    Security: Module-LWE / MSIS   │\n' +
        '│  Broken by: Shor alg.    Safe against: Shor / Grover    │\n' +
        '│                                                         │\n' +
        '│  Module Lattice Signature                               │\n' +
        '│  ├── Randomized: new showing each time (unlinkable)    │\n' +
        '│  ├── Selective disclosure via lattice commitments      │\n' +
        '│  └── Traceability: authority can de-anonymize abusers  │\n' +
        '│                                                         │\n' +
        '│  Trade-off: larger proof sizes (~10-100× BBS+)         │\n' +
        '└─────────────────────────────────────────────────────────┘',
      keyPoints: [
        "First anonymous credential from module lattices with full traceability",
        "Security under Module-LWE and MSIS — believed quantum-resistant",
        "Selective disclosure and unlinkability preserved in the lattice setting",
        "Significantly larger credential sizes vs. pairing-based schemes",
        "Provides migration path for blockchain identity systems post-quantum transition"
      ],
      connections:
        "While your thesis focuses on current (non-PQ) constructions, the committee " +
        "may ask about quantum resistance. Citing this paper shows you are aware " +
        "of the limitation and can articulate the migration path: move to module " +
        "lattice signatures when quantum threat materializes, replacing BBS+ " +
        "while keeping the same ZK proof verification interface on Sui.",
      thesisExample:
        "In your thesis limitations section, you can note that BBS+ is not " +
        "post-quantum secure and reference this paper as the lattice-based " +
        "successor. The modular design of your Sui Move verifier (accepting " +
        "a proof π and checking a predicate) would allow swapping the " +
        "underlying credential scheme from BBS+ to the lattice construction " +
        "without changing the payment protocol logic.",
      keyTakeaway: "First PQ-safe anonymous credentials with traceability from module lattices — future-proofing reference."
    },

    /* ───────── 8. Camenisch-Lysyanskaya Signatures ───────── */
    {
      name: "Signature Schemes and Anonymous Credentials from Bilinear Maps",
      authors: "Camenisch, Lysyanskaya",
      venue: "CRYPTO 2004",
      status: "queued",
      relevance: "core",
      analogy:
        "Before BBS+, CL signatures were the gold standard for " +
        "privacy-preserving credentials. Think of CL as the original " +
        "recipe for a cryptographic identity card that the issuer " +
        "signs over multiple attributes at once. The holder can then " +
        "prove knowledge of this signature in a zero-knowledge manner — " +
        "like showing a notarized letter without revealing who signed " +
        "it or what the other pages say. Every modern anonymous " +
        "credential scheme (BBS+, Coconut, SAAC) either directly " +
        "extends CL or was designed as an improvement over it.",
      diagram:
        '┌─────────────────────────────────────────────────────────┐\n' +
        '│     Camenisch-Lysyanskaya (CL) Signature Scheme         │\n' +
        '├─────────────────────────────────────────────────────────┤\n' +
        '│                                                         │\n' +
        '│  Setup: bilinear pairing e: G1 × G2 → GT               │\n' +
        '│  sk = (x, y_1, ..., y_L) ∈ Z_p                         │\n' +
        '│  pk = (g^x, g^y1, ..., g^yL) in G1                     │\n' +
        '│                                                         │\n' +
        '│  Sign [m1,...,mL]:                                      │\n' +
        '│  σ = (A, e, s) where A^(e) = g^(1/(x+m1+...)) in G1   │\n' +
        '│                                                         │\n' +
        '│  Prove-know(σ): ZK PoK of σ and (m1,...,mL)            │\n' +
        '│  without revealing σ or any mi to verifier             │\n' +
        '│                                                         │\n' +
        '│  Foundation for: Idemix, BBS+, U-Prove, Coconut        │\n' +
        '└─────────────────────────────────────────────────────────┘',
      keyPoints: [
        "Introduced the concept of signing multiple messages with one signature from bilinear maps",
        "Enables zero-knowledge proof of knowledge of a signature without revealing it",
        "Foundation for IBM Idemix, W3C BBS+ Data Integrity, and Coconut",
        "Security relies on the Strong RSA assumption and q-Strong DH (pairing groups)",
        "CL-Signature scheme proved EUF-CMA secure, making ZK PoK secure by composition"
      ],
      connections:
        "CL signatures are the conceptual ancestor of every tool your thesis uses. " +
        "Understanding CL's structure (signature of knowledge, attribute commitments, " +
        "blind issuance) is essential for understanding why BBS+ made particular " +
        "design choices — especially why BBS+ uses a single group element signature " +
        "compared to CL's three-element structure.",
      thesisExample:
        "When writing your related work section, CL 2004 is the canonical citation " +
        "for bilinear-map anonymous credentials. Your thesis differentiates from " +
        "CL by using BBS+ (smaller signatures, faster proof of possession) and " +
        "adds TEE-backed issuance and SNARK-based on-chain verification — " +
        "properties that CL's original design did not target.",
      keyTakeaway: "The foundational anonymous credential construction using bilinear pairings — ancestor of BBS+ and Coconut."
    },

    /* ───────── 9. Brands Credentials ───────── */
    {
      name: "Rethinking Public Key Infrastructures and Digital Certificates: Building in Privacy",
      authors: "Brands",
      venue: "MIT Press / PhD Thesis",
      status: "queued",
      relevance: "core",
      analogy:
        "Stefan Brands built the first rigorous framework for 'selective " +
        "disclosure' credentials — think of it as designing a driver's " +
        "license where the license itself is cryptographically structured " +
        "so you can prove 'I am over 21' without revealing your name, " +
        "address, or exact birthdate. Brands credentials use restricted " +
        "blind signatures and one-show tokens: each credential is like " +
        "a signed coupon that can be shown once anonymously, and the " +
        "cryptographic structure ensures it cannot be copied or reused " +
        "across different verifiers without detection.",
      diagram:
        '┌─────────────────────────────────────────────────────────┐\n' +
        '│           Brands Selective Disclosure Credentials        │\n' +
        '├─────────────────────────────────────────────────────────┤\n' +
        '│                                                         │\n' +
        '│  ISSUANCE (blind signature)                             │\n' +
        '│  User commits to (A, m1, ..., mk)                       │\n' +
        '│  Issuer blind-signs without seeing (m1,...,mk)          │\n' +
        '│  User unblinds → credential σ                          │\n' +
        '│                                                         │\n' +
        '│  SHOWING (selective disclosure)                         │\n' +
        '│  User reveals subset S ⊆ {m1,...,mk}                   │\n' +
        '│  Proves ZK: knows σ valid for remaining attributes      │\n' +
        '│                                                         │\n' +
        '│  UNLINKABILITY                                          │\n' +
        '│  Each showing is randomized → verifier cannot link     │\n' +
        '└─────────────────────────────────────────────────────────┘',
      keyPoints: [
        "First systematic treatment of selective disclosure in cryptographic credentials",
        "Introduced restricted blind signatures as the issuance primitive",
        "One-show credentials prevent double-spending without sacrificing anonymity",
        "Forms the basis for Microsoft U-Prove and influenced CL signatures",
        "Privacy model: showing transcripts are computationally indistinguishable from random"
      ],
      connections:
        "Brands credentials provide the theoretical vocabulary your thesis inherits: " +
        "blind issuance, selective disclosure, randomizability, and unlinkability. " +
        "Your BBS+ system is a modern successor that achieves the same goals with " +
        "better efficiency. Citing Brands positions your work in the long lineage " +
        "of privacy-preserving credential research.",
      thesisExample:
        "In your thesis introduction, you can trace the evolution from Brands (1994) " +
        "to CL (2004) to BBS+ (2016) to your Sui-based system (2026), showing " +
        "how each generation improved efficiency (signature size, proving time) " +
        "while preserving the core selective disclosure guarantee that Brands " +
        "first formalized.",
      keyTakeaway: "The original selective disclosure credential framework — foundational theory for all modern anonymous credential systems."
    },

    /* ───────── 10. Blockchain-Based Privacy-Preserving Mobile Payment ───────── */
    {
      name: "Blockchain-Based Privacy-Preserving Mobile Payment Using Anonymous Credentials",
      authors: "Yu et al.",
      venue: "2022",
      status: "queued",
      relevance: "core",
      analogy:
        "Paying with your phone should not require the bank to know " +
        "who you are, what you bought, or where you are. This paper " +
        "designs a complete payment system where a user's identity is " +
        "attested by a distributed set of issuers (threshold credentials), " +
        "and each transaction is authorized via a ZK proof over a " +
        "Pedersen commitment — like paying with a sealed voucher that " +
        "proves you have sufficient funds and are a verified user, " +
        "without the merchant or the blockchain nodes learning " +
        "your account balance or identity.",
      diagram:
        '┌─────────────────────────────────────────────────────────┐\n' +
        '│     Privacy-Preserving Mobile Payment Architecture      │\n' +
        '├─────────────────────────────────────────────────────────┤\n' +
        '│                                                         │\n' +
        '│  1. IDENTITY SETUP                                      │\n' +
        '│  Threshold issuers → anonymous credential σ (user)     │\n' +
        '│                                                         │\n' +
        '│  2. PAYMENT COMMIT                                      │\n' +
        '│  User: C = Commit(amount, r)  — Pedersen commitment    │\n' +
        '│                                                         │\n' +
        '│  3. ZK PROOF                                            │\n' +
        '│  π: "I hold σ ∧ amount ≤ balance ∧ C correct"         │\n' +
        '│                                                         │\n' +
        '│  4. BLOCKCHAIN VERIFY                                   │\n' +
        '│  Smart contract: verify π, update state atomically     │\n' +
        '│  (no identity, no amount revealed on-chain)            │\n' +
        '└─────────────────────────────────────────────────────────┘',
      keyPoints: [
        "Combines threshold anonymous credentials + Pedersen commitments for private mobile payments",
        "ZK proof simultaneously proves credential validity and payment amount correctness",
        "Smart contract verifier processes proofs atomically on blockchain",
        "Handles double-spend prevention via nullifiers in the ZK circuit",
        "Empirical evaluation on mobile hardware with proof generation benchmarks"
      ],
      connections:
        "This paper is one of the closest related works to your thesis goal: " +
        "private payments using anonymous credentials on a blockchain. Your " +
        "contribution over this work is: (1) replacing the generic blockchain " +
        "with Sui's object model, (2) adding TEE-backed issuance for stronger " +
        "trust, and (3) using BBS+ instead of threshold credentials for " +
        "more efficient proof generation.",
      thesisExample:
        "The ZK circuit design in this paper (credential validity + Pedersen " +
        "commitment range proof in one proof) is directly applicable to your " +
        "Sui private payment contract. Your Move verifier module can follow " +
        "the same proof structure: accept a SNARK π that proves BBS+ " +
        "credential membership AND amount commitment validity, then execute " +
        "the Sui coin transfer atomically.",
      keyTakeaway: "Threshold anonymous credentials + Pedersen commitments + ZKPs for private blockchain mobile payments."
    },

    /* ───────── 11. BDIdM ───────── */
    {
      name: "Blockchain-Based Digital Identity Management via Decentralized Anonymous Credentials",
      authors: "Cui et al.",
      venue: "2024",
      status: "queued",
      relevance: "related",
      analogy:
        "This paper builds a digital identity layer on blockchains " +
        "where users can reuse credentials across services with fine-grained " +
        "control over linking. Imagine a membership card that is " +
        "anonymous for most uses but can be 'de-anonymized' by the " +
        "user themselves to prove they are the same person who made " +
        "a previous transaction — useful for loyalty systems or dispute " +
        "resolution without requiring a central registry.",
      diagram:
        '┌─────────────────────────────────────────────────────────┐\n' +
        '│        BDIdM — Linkability Control Model                │\n' +
        '├─────────────────────────────────────────────────────────┤\n' +
        '│                                                         │\n' +
        '│  Mode A: FULLY ANONYMOUS                                │\n' +
        '│  Show(σ, attrs) → unlinkable proof (no link to prior)  │\n' +
        '│                                                         │\n' +
        '│  Mode B: USER-CONTROLLED LINKABILITY                    │\n' +
        '│  Show(σ, attrs, scope) → pseudonym_scope               │\n' +
        '│  Same user + same scope → same pseudonym               │\n' +
        '│  Different scope → different pseudonym (unlinkable)    │\n' +
        '│                                                         │\n' +
        '│  Blockchain role: store credential commitments,        │\n' +
        '│                   verify proofs on-chain               │\n' +
        '└─────────────────────────────────────────────────────────┘',
      keyPoints: [
        "Decentralized credential issuance and verification without a central authority",
        "User-controlled linkability: pseudonyms scoped to domains prevent cross-service tracking",
        "Credential commitments stored on blockchain for global verifiability",
        "Revocation handled via on-chain status registry",
        "Formal analysis of anonymity and linkability properties"
      ],
      connections:
        "BDIdM's scope-based pseudonyms are relevant for your Sui identity system " +
        "in multi-application contexts: a user might want to be linkable within " +
        "one DeFi protocol (for reputation) but unlinkable across protocols " +
        "(for privacy). Your TEE-backed issuance can embed scope derivation " +
        "in the credential binding to enable this selective linkability.",
      thesisExample:
        "In your Sui identity module, you could implement scope-based pseudonyms " +
        "by deriving the nullifier as H(credential_secret, application_id): " +
        "same user on the same Sui dApp produces the same pseudonym, but a " +
        "different dApp sees a different pseudonym. This maps directly to " +
        "BDIdM's linkability model, cited as design inspiration.",
      keyTakeaway: "User-controlled linkability via scope-based pseudonyms — decentralized identity with fine-grained privacy."
    },

    /* ───────── 12. GrAC ───────── */
    {
      name: "GrAC: Graph-Based Anonymous Credentials from Identity Graphs on Blockchain",
      authors: "Tang et al.",
      venue: "2024",
      status: "queued",
      relevance: "related",
      analogy:
        "Instead of a single credential issuer, your identity is a " +
        "graph of verifiable claims: LinkedIn endorses your skills, " +
        "your university attests your degree, your bank confirms " +
        "your KYC. GrAC lets you prove properties about this whole " +
        "graph (e.g., 'I have a degree AND a verified income') " +
        "using a single ZK proof, without revealing which nodes " +
        "in the graph apply to you. The blockchain acts as the " +
        "publicly verifiable graph ledger, while your ZK proof " +
        "hides the path through the graph you traversed.",
      diagram:
        '┌─────────────────────────────────────────────────────────┐\n' +
        '│              GrAC — Identity Graph Model                │\n' +
        '├─────────────────────────────────────────────────────────┤\n' +
        '│                                                         │\n' +
        '│  Identity graph (on-chain):                             │\n' +
        '│  [University] ──attests degree──→ [User node]          │\n' +
        '│  [Bank]       ──attests KYC   ──→ [User node]          │\n' +
        '│  [Gov]        ──attests citizen──→ [User node]         │\n' +
        '│                                                         │\n' +
        '│  ZK proof: "I am a node with edges from ≥2 issuers     │\n' +
        '│             satisfying predicate P(attrs)"              │\n' +
        '│                                                         │\n' +
        '│  No intermediate issuer cooperation at show time       │\n' +
        '│  Selective disclosure: prove only relevant graph edges  │\n' +
        '└─────────────────────────────────────────────────────────┘',
      keyPoints: [
        "Models identity as a directed graph of attribute claims from multiple issuers",
        "ZK proof over graph paths: prove predicates without revealing identity node",
        "No intermediate issuer involvement at showing time — holder-centric",
        "Selective disclosure: choose which graph edges to prove",
        "Stored on blockchain for decentralized verifiability without central registry"
      ],
      connections:
        "GrAC's multi-issuer graph model is relevant for your thesis's broader identity " +
        "context: a Sui identity could aggregate claims from multiple TEE-backed " +
        "issuers (government ID TEE, employer attestation TEE, bank KYC TEE). " +
        "Your proof system would then need to combine multiple BBS+ signatures " +
        "in one SNARK — a multi-credential proof composition problem.",
      thesisExample:
        "For your payment system, a user might need to prove both KYC compliance " +
        "(from a bank-issued credential) and residency (from a government-issued " +
        "credential). GrAC's graph-based approach provides the conceptual framework; " +
        "your Sui circuit would implement it as a conjunction of two BBS+ " +
        "credential validity sub-proofs composed inside a single Groth16 circuit.",
      keyTakeaway: "Multi-issuer identity graphs on blockchain with ZK proof of graph predicates — no single issuer required."
    },

    /* ───────── 13. Comparative Evaluation Threshold AC ───────── */
    {
      name: "Comparative Evaluation of Threshold-based Anonymous Credential Systems over Blockchain",
      authors: "Ali et al.",
      venue: "2025",
      status: "queued",
      relevance: "core",
      analogy:
        "When you are choosing between three competing car engines for a " +
        "new vehicle design, you run them on the same test track under " +
        "the same conditions and measure fuel consumption, top speed, " +
        "and reliability. This paper does exactly that for anonymous " +
        "credential systems: RP-Coconut, threshold BBS+, and threshold " +
        "BBS are all deployed on the same Ethereum testnet (Sepolia) " +
        "and measured for gas cost, proof generation time, and " +
        "verification latency — giving you a head-to-head comparison " +
        "directly usable for your thesis design decisions.",
      diagram:
        '┌─────────────────────────────────────────────────────────┐\n' +
        '│    Threshold AC Comparison on Ethereum Sepolia          │\n' +
        '├────────────────┬──────────────┬────────────────────────┤\n' +
        '│ Scheme         │ Proof size   │ On-chain verify gas    │\n' +
        '├────────────────┼──────────────┼────────────────────────┤\n' +
        '│ RP-Coconut     │ ~1.2 KB      │ ~350K gas              │\n' +
        '│ Threshold BBS+ │ ~0.5 KB      │ ~180K gas              │\n' +
        '│ Threshold BBS  │ ~0.4 KB      │ ~150K gas              │\n' +
        '├────────────────┴──────────────┴────────────────────────┤\n' +
        '│ Note: Sui gas model differs but relative ordering      │\n' +
        '│ likely preserved. BBS variants ~2× cheaper to verify. │\n' +
        '└─────────────────────────────────────────────────────────┘',
      keyPoints: [
        "Direct empirical comparison of RP-Coconut, threshold BBS+, and threshold BBS on Ethereum Sepolia",
        "Measures gas cost, proof generation time, and communication overhead",
        "BBS-based schemes show ~2x lower on-chain verification cost vs. RP-Coconut",
        "Threshold BBS shows the best performance at the cost of weaker security model",
        "Provides concrete benchmarks directly applicable to blockchain credential deployment choices"
      ],
      connections:
        "This paper gives you empirical data to justify your design choices. " +
        "If you choose BBS+ over Coconut for your Sui system, you can cite " +
        "these benchmarks showing BBS+ achieves lower verification cost while " +
        "maintaining sufficient security. The Sui gas model differs from " +
        "Ethereum, but the relative ordering of scheme costs is likely preserved.",
      thesisExample:
        "In your thesis evaluation section, you can reference Ali et al. 2025 " +
        "to baseline your Sui performance numbers: if BBS+ verifies for 180K " +
        "Ethereum gas, and Sui verification costs X SUI per proof, you can " +
        "compare the USD equivalent costs to show your system is economically " +
        "viable for real-world deployment even at transaction scale.",
      keyTakeaway: "First direct benchmark of RP-Coconut vs. threshold BBS+ vs. threshold BBS on a live blockchain testnet."
    },

    /* ───────── 14. Cross-chain Identity with Anonymous Credentials ───────── */
    {
      name: "Cross-chain Identity Authentication Using Anonymous Credentials",
      authors: "Zhu et al.",
      venue: "2024",
      status: "queued",
      relevance: "related",
      analogy:
        "Your passport works across countries because all signatories " +
        "of the ICAO convention accept the same document format. " +
        "This paper solves the same problem for blockchain identities: " +
        "how can a credential issued on Ethereum be verified on Sui " +
        "without a central bridge authority? The answer is a " +
        "Merkle-tree registry where credential commitments live on " +
        "the source chain, and a zkSNARK proof of Merkle membership " +
        "can be verified on any destination chain — the proof is " +
        "the cross-chain passport.",
      diagram:
        '┌─────────────────────────────────────────────────────────┐\n' +
        '│        Cross-Chain Anonymous Identity                   │\n' +
        '├─────────────────────────────────────────────────────────┤\n' +
        '│                                                         │\n' +
        '│  Source chain (e.g., Ethereum)                          │\n' +
        '│  ├── Credential Merkle tree root: R                    │\n' +
        '│  └── Publishes R as cross-chain beacon                 │\n' +
        '│                     │                                   │\n' +
        '│                     │ (bridge/relay)                    │\n' +
        '│                     ▼                                   │\n' +
        '│  Destination chain (e.g., Sui)                         │\n' +
        '│  User submits: π = ZK proof of Merkle membership       │\n' +
        '│  Verifier checks: π valid for root R                   │\n' +
        '│  Result: anonymous authentication on Sui               │\n' +
        '└─────────────────────────────────────────────────────────┘',
      keyPoints: [
        "zkSNARKs + Merkle trees enable cross-chain credential verification",
        "Credential commitments on source chain, ZK membership proofs on destination",
        "Anonymous: destination chain learns nothing about credential holder identity",
        "Compatible with existing blockchain infrastructure (no changes to source chain)",
        "Addresses the multi-chain identity problem without a central identity bridge"
      ],
      connections:
        "Your thesis is Sui-centric, but credentials may originate from other ecosystems. " +
        "This paper provides the cross-chain verification pattern: a user with an " +
        "Ethereum-issued credential can prove membership on Sui using a Merkle proof " +
        "SNARK. Your Sui Move verifier module can be extended to accept cross-chain " +
        "proofs by reading the source chain root from a Sui oracle object.",
      thesisExample:
        "If a user has a W3C BBS+ credential issued on Ethereum, they could use " +
        "the cross-chain pattern from Zhu et al. to obtain a Merkle membership proof " +
        "verifiable on Sui. Your Move contract would validate the SNARK proof " +
        "against the Merkle root stored in a Sui shared object updated by " +
        "a trusted relay or light client.",
      keyTakeaway: "zkSNARK Merkle membership proofs enable anonymous cross-chain credential verification without bridge authorities."
    },

    /* ───────── 15. AccCred ───────── */
    {
      name: "AccCred: Improved Accountable Anonymous Credentials With Dynamic Triple-Hiding Committees",
      authors: "Xie et al.",
      venue: "2025",
      status: "queued",
      relevance: "core",
      analogy:
        "Pure anonymity raises a legitimate concern: what if a bad actor " +
        "abuses the system? AccCred adds accountability — a cryptographic " +
        "mechanism where a designated committee can, under strict " +
        "conditions, unmask a specific user who committed fraud, without " +
        "this power ever being usable on innocent users. It is like " +
        "a bank vault where the combination is split among 5 trustees " +
        "who must all agree to open it — except the vault only contains " +
        "the identity of a specific bad actor, not everyone's secrets.",
      diagram:
        '┌─────────────────────────────────────────────────────────┐\n' +
        '│       AccCred — Accountable Anonymous Credentials       │\n' +
        '├─────────────────────────────────────────────────────────┤\n' +
        '│                                                         │\n' +
        '│  NORMAL SHOWING: fully anonymous                        │\n' +
        '│  Show(σ) → π  (unlinkable, issuer/auditor learn nothing)│\n' +
        '│                                                         │\n' +
        '│  TRACING (requires t-of-n committee):                   │\n' +
        '│  Suspicious proof π                                     │\n' +
        '│  Committee: each member decrypts partial tag           │\n' +
        '│  Threshold reconstruction → user identity revealed     │\n' +
        '│  (only for this specific proof, others unaffected)     │\n' +
        '│                                                         │\n' +
        '│  Dynamic committee: membership changes without reissue │\n' +
        '│  Triple-hiding: hides user, credential, and showing    │\n' +
        '└─────────────────────────────────────────────────────────┘',
      keyPoints: [
        "Accountability layer on anonymous credentials: committee can trace fraud without mass deanonymization",
        "Triple-hiding property: hides user identity, credential content, and showing linkage",
        "Dynamic committee: members can rotate without reissuing all credentials",
        "Threshold tracing: at least t committee members must cooperate to unmask",
        "Directly addresses regulatory and auditing requirements for anonymous systems"
      ],
      connections:
        "AccCred directly addresses a core tension your thesis must handle: anonymous " +
        "credentials on a public blockchain may face regulatory pushback if there is " +
        "no accountability mechanism. Your TEE-based system can embed the committee's " +
        "tracing keys in a multi-TEE setup, so tracing requires consensus across " +
        "TEE instances — preventing any single compromised TEE from deanonymizing users.",
      thesisExample:
        "In your Sui private payment system, regulators might require the ability " +
        "to trace sanctioned users without surveilling everyone. AccCred's dynamic " +
        "committee model maps to a multi-TEE tracing committee on Sui: each TEE " +
        "holds a share of the tracing key, and a court order triggers a t-of-n " +
        "TEE consensus to decrypt the tracing tag in a specific transaction proof.",
      keyTakeaway: "Accountability in anonymous credentials via dynamic threshold tracing committee — balances privacy and auditability."
    },

    /* ───────── 16. Zero-Knowledge Proof-of-Identity ───────── */
    {
      name: "Zero-Knowledge Proof-of-Identity: Sybil-Resistant, Anonymous Authentication on Permissionless Blockchains",
      authors: "—",
      venue: "IACR 2019/546",
      status: "queued",
      relevance: "core",
      analogy:
        "On a permissionless blockchain, anyone can create unlimited " +
        "fake accounts (Sybil attack). ZK-PoI solves this by tying " +
        "each blockchain account to a real-world identity document " +
        "(passport, national ID) via a ZK proof — you prove you are " +
        "a unique real person without revealing which person. Think " +
        "of it as a bouncer who uses a cryptographic black-box to " +
        "verify you are on the guest list (you are a real human with " +
        "a valid document) without ever seeing your face or name, " +
        "and the black box records that this slot is taken so " +
        "no one else can claim it.",
      diagram:
        '┌─────────────────────────────────────────────────────────┐\n' +
        '│          ZK Proof-of-Identity (ZK-PoI)                  │\n' +
        '├─────────────────────────────────────────────────────────┤\n' +
        '│                                                         │\n' +
        '│  Input: public certificate (passport, national ID)      │\n' +
        '│                                                         │\n' +
        '│  ZK circuit proves:                                     │\n' +
        '│  ① certificate has valid gov signature                 │\n' +
        '│  ② certificate attributes satisfy predicate P          │\n' +
        '│  ③ unique nullifier: H(cert_secret, blockchain_addr)   │\n' +
        '│                                                         │\n' +
        '│  Output: π + nullifier (no identity revealed)          │\n' +
        '│                                                         │\n' +
        '│  On-chain:                                              │\n' +
        '│  - verify π                                             │\n' +
        '│  - record nullifier (prevents double-registration)     │\n' +
        '│  - bind to blockchain address anonymously              │\n' +
        '└─────────────────────────────────────────────────────────┘',
      keyPoints: [
        "Ties each blockchain address to a unique real-world identity document via ZK proof",
        "Sybil-resistant: nullifier prevents one person from creating multiple accounts",
        "Anonymous: blockchain learns nothing about which document was used",
        "Works with publicly verifiable certificates (government-issued) — no new infrastructure",
        "Applicable to permissionless blockchains: no trusted registration authority required"
      ],
      connections:
        "ZK-PoI is the identity bootstrapping primitive your thesis needs on Sui: " +
        "to enter the private payment system, users must prove they are unique " +
        "real persons without creating a linkable identity. Your TEE-backed " +
        "system can serve as the ZK-PoI verifier: the TEE verifies the document " +
        "signature in hardware and issues a BBS+ credential bound to the user's " +
        "Sui address — combining ZK-PoI's sybil resistance with BBS+'s selective disclosure.",
      thesisExample:
        "Your Sui identity module could use ZK-PoI for onboarding: a user presents " +
        "their passport to a TEE enclave, which verifies the RSA/ECDSA government " +
        "signature in hardware and generates a SNARK proof that the document is " +
        "valid and not yet registered. The proof is posted to Sui, and the nullifier " +
        "prevents re-registration — one real person, one Sui identity, full anonymity.",
      keyTakeaway: "Sybil-resistant anonymous identity on permissionless blockchains using ZK proofs over government certificates."
    }
  ]
};
