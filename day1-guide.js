/**
 * Day 1 Study Guide — Crypto Foundations + ZKP
 * Data file loaded by the study plan website.
 */

window.DAY1_GUIDE = {
  block1: {
    title: "Crypto Primitives + ZKP Fundamentals",
    connectionsSummary:
      "These primitives are the building blocks of every " +
      "anonymous credential system. Hash functions underpin " +
      "commitment schemes used in Pedersen commitments (the " +
      "core of BBS+ signatures). Digital signatures, " +
      "especially blind signatures, enable issuers to sign " +
      "credentials without learning their content. Elliptic " +
      "curve pairings on BLS12-381 make BBS+ selective " +
      "disclosure possible. Zero-knowledge proofs and Sigma " +
      "protocols let holders prove credential attributes to " +
      "verifiers on Sui without revealing the credential " +
      "itself. Together, these form the cryptographic " +
      "foundation for privacy-preserving identity on-chain.",
    concepts: [
      {
        name: "Hash Functions",
        analogy:
          "A fingerprint scanner for data. Just as every " +
          "person has a unique fingerprint that cannot be " +
          "reverse-engineered back into a person, a hash " +
          "function produces a unique fixed-size digest for " +
          "any input. Change a single bit and the entire " +
          "fingerprint changes beyond recognition.",
        diagram:
          '┌─────────────────────────────────────────────┐\n' +
          '│            Hash Function H(x)               │\n' +
          '├─────────────────────────────────────────────┤\n' +
          '│                                             │\n' +
          '│  "Hello"  ──→ ┌────────┐ ──→ a591a6d4...   │\n' +
          '│               │  H(x)  │                    │\n' +
          '│  "Hello!" ──→ └────────┘ ──→ 334d016f...   │\n' +
          '│                                             │\n' +
          '│  Properties:                                │\n' +
          '│  ┌──────────────────────────────────────┐   │\n' +
          '│  │ x ──→ H(x)    (easy, deterministic) │   │\n' +
          '│  │ H(x) ──→ x    (impossible: one-way) │   │\n' +
          '│  │ H(a) = H(b)   (infeasible: no clash)│   │\n' +
          '│  └──────────────────────────────────────┘   │\n' +
          '└─────────────────────────────────────────────┘',
        keyPoints: [
          "Deterministic: same input always produces the same output",
          "One-way (preimage resistant): given H(x), finding x is computationally infeasible",
          "Collision resistant: finding two inputs with the same hash is infeasible",
          "Avalanche effect: flipping one input bit changes roughly half the output bits",
          "Used in Merkle trees, commitment schemes, digital signatures, and proof systems"
        ],
        connections:
          "Hash functions are embedded in every layer of the " +
          "thesis system. Sui uses SHA-256 and Blake2b for " +
          "transaction hashing and Merkle tree construction. " +
          "In anonymous credentials, hashes bind attributes " +
          "inside Pedersen commitments and form the backbone " +
          "of Fiat-Shamir transforms that make ZKPs " +
          "non-interactive for on-chain verification."
      },
      {
        name: "Commitment Schemes",
        analogy:
          "A sealed envelope placed inside a glass box. " +
          "Everyone can see the envelope exists (the " +
          "commitment), but nobody can read what is inside " +
          "until you break the seal and open it (the reveal). " +
          "Once sealed, you cannot swap the contents for " +
          "something else.",
        diagram:
          '┌──────────────────────────────────────────┐\n' +
          '│          Commitment Scheme                │\n' +
          '├──────────────────────────────────────────┤\n' +
          '│                                          │\n' +
          '│  COMMIT PHASE                            │\n' +
          '│  ┌────────────┐                          │\n' +
          '│  │ message m  │──┐                       │\n' +
          '│  └────────────┘  │  C = Commit(m, r)     │\n' +
          '│  ┌────────────┐  │  ┌───────────┐        │\n' +
          '│  │ random r   │──┴─→│  C (blob) │───→ V  │\n' +
          '│  └────────────┘     └───────────┘        │\n' +
          '│                                          │\n' +
          '│  REVEAL PHASE                            │\n' +
          '│  ┌──────────────────┐                    │\n' +
          '│  │ send (m, r) to V │                    │\n' +
          '│  └────────┬─────────┘                    │\n' +
          '│           ↓                              │\n' +
          '│  V checks: Commit(m, r) = C ?            │\n' +
          '│                                          │\n' +
          '│  Pedersen: C = g^m * h^r                 │\n' +
          '│  (additively homomorphic)                │\n' +
          '└──────────────────────────────────────────┘',
        keyPoints: [
          "Hiding: the commitment C reveals nothing about the message m",
          "Binding: once committed, the committer cannot open to a different value",
          "Pedersen commitments are additively homomorphic: Commit(a) + Commit(b) = Commit(a+b)",
          "Randomness r is essential for hiding; without it, commitments become deterministic and breakable"
        ],
        connections:
          "Pedersen commitments are the core primitive in BBS+ " +
          "anonymous credentials. Each credential attribute is " +
          "committed individually, allowing selective disclosure: " +
          "the holder reveals only chosen attributes while " +
          "keeping others hidden inside commitments. The " +
          "homomorphic property enables efficient range proofs " +
          "and attribute predicate proofs without revealing " +
          "underlying values."
      },
      {
        name: "Digital Signatures",
        analogy:
          "A wax seal on a medieval letter. Anyone can inspect " +
          "the seal to verify it matches your signet ring " +
          "(public key), but only you possess the ring " +
          "(private key) to create it. Blind signatures are " +
          "like signing a letter inside a carbon-paper " +
          "envelope: the signer stamps the envelope, the " +
          "signature transfers through, but the signer never " +
          "sees the letter's content.",
        diagram:
          '┌──────────────────────────────────────────────┐\n' +
          '│           Digital Signatures                  │\n' +
          '├──────────────────────────────────────────────┤\n' +
          '│                                              │\n' +
          '│  STANDARD SIGNATURE                          │\n' +
          '│  ┌─────┐  sk   ┌──────┐                     │\n' +
          '│  │ msg │──────→│ Sign │──→ sig               │\n' +
          '│  └─────┘       └──────┘                      │\n' +
          '│  ┌─────┐  pk   ┌────────┐                    │\n' +
          '│  │ sig │──────→│ Verify │──→ true/false      │\n' +
          '│  └─────┘       └────────┘                    │\n' +
          '│                                              │\n' +
          '│  BLIND SIGNATURE                             │\n' +
          '│  ┌─────┐ blind  ┌───────┐ sign  ┌────────┐  │\n' +
          '│  │ msg │──────→│ Blind │─────→│ Signer │   │\n' +
          '│  └─────┘        └───────┘      └───┬────┘   │\n' +
          '│                                    ↓         │\n' +
          '│                  ┌─────────┐  blind sig      │\n' +
          '│                  │ Unblind │←────────         │\n' +
          '│                  └────┬────┘                  │\n' +
          '│                       ↓                      │\n' +
          '│                  valid sig on msg             │\n' +
          '│              (signer never saw msg)           │\n' +
          '└──────────────────────────────────────────────┘',
        keyPoints: [
          "Authentication: proves the signer's identity",
          "Non-repudiation: signer cannot deny having signed",
          "Integrity: any modification to the signed message invalidates the signature",
          "Blind signatures enable privacy: the issuer signs without seeing the content",
          "BBS+ signatures extend this to multi-message signing with selective disclosure"
        ],
        connections:
          "Anonymous credentials rely on specialized signature " +
          "schemes. BBS+ signatures allow an issuer to sign a " +
          "vector of attributes, and the holder can later " +
          "selectively disclose any subset. On Sui, credential " +
          "issuance uses blind signing so the issuer never " +
          "learns the full credential. Verification happens " +
          "on-chain using pairing-based signature checks."
      },
      {
        name: "Elliptic Curve Cryptography",
        analogy:
          "Clock arithmetic on a curved surface. Imagine " +
          "adding points on a curve by drawing lines between " +
          "them: it is easy to compute P + P + ... + P = nP " +
          "(scalar multiplication), but given only nP and P, " +
          "finding n is astronomically hard. This one-way " +
          "trapdoor is the foundation of modern public-key " +
          "cryptography.",
        diagram:
          '┌────────────────────────────────────────────┐\n' +
          '│       Elliptic Curve over Finite Field      │\n' +
          '│            y^2 = x^3 + ax + b               │\n' +
          '├────────────────────────────────────────────┤\n' +
          '│                                            │\n' +
          '│        *  P                                │\n' +
          '│       / \\                                  │\n' +
          '│      /   \\  line through P and Q           │\n' +
          '│     /     * Q                              │\n' +
          '│    /       \\                               │\n' +
          '│   /    ─────*──── R (intersection)         │\n' +
          '│              |                             │\n' +
          '│              | reflect over x-axis         │\n' +
          '│              ↓                             │\n' +
          '│              * P + Q                       │\n' +
          '│                                            │\n' +
          '│  KEY GENERATION                            │\n' +
          '│  sk = n (random scalar)                    │\n' +
          '│  pk = n * G (generator point)              │\n' +
          '│                                            │\n' +
          '│  ECDLP: given pk and G, find n → HARD      │\n' +
          '│                                            │\n' +
          '│  PAIRING-FRIENDLY CURVES                   │\n' +
          '│  e: G1 x G2 → GT (bilinear map)           │\n' +
          '│  ┌─────────────────────────────────┐       │\n' +
          '│  │ BN254:     fast, 128-bit sec    │       │\n' +
          '│  │ BLS12-381: standard, 128-bit    │       │\n' +
          '│  └─────────────────────────────────┘       │\n' +
          '└────────────────────────────────────────────┘',
        keyPoints: [
          "The Elliptic Curve Discrete Log Problem (ECDLP) is the security foundation: given G and nG, finding n is infeasible",
          "Key pairs: private key is a scalar n, public key is the point nG on the curve",
          "Pairing-friendly curves (BN254, BLS12-381) enable bilinear maps e(P,Q) used in BBS+ and Groth16",
          "Bilinear pairings satisfy e(aP, bQ) = e(P, Q)^(ab), enabling signature aggregation and ZKP verification",
          "BLS12-381 is the current standard for ZKP-friendly applications due to its security and efficiency"
        ],
        connections:
          "BBS+ signatures operate over pairing-friendly curves, " +
          "specifically BLS12-381. The bilinear pairing enables " +
          "the core selective disclosure mechanism: a verifier " +
          "can check that hidden attributes are correctly " +
          "signed without seeing them. On Sui, Groth16 proof " +
          "verification uses BN254 pairings natively. " +
          "Understanding EC math is essential for grasping how " +
          "credentials are issued, held, and verified."
      },
      {
        name: "Zero-Knowledge Proofs (Fundamentals)",
        analogy:
          "Proving you know the exit of a maze without " +
          "showing the path. In Ali Baba's cave, two tunnels " +
          "meet at a locked door inside. You enter one " +
          "tunnel, the verifier shouts which tunnel to exit " +
          "from. If you know the secret (the door's code), " +
          "you always exit correctly. After many rounds, the " +
          "verifier is convinced you know the secret without " +
          "ever seeing the code.",
        diagram:
          '┌──────────────────────────────────────────────┐\n' +
          '│       Zero-Knowledge Proof System             │\n' +
          '├──────────────────────────────────────────────┤\n' +
          '│                                              │\n' +
          '│   Prover (knows w)       Verifier            │\n' +
          '│   ┌──────────┐          ┌──────────┐         │\n' +
          '│   │ witness w │          │ statement │         │\n' +
          '│   │ statement │          │   only    │         │\n' +
          '│   └─────┬────┘          └─────┬────┘         │\n' +
          '│         │    proof            │               │\n' +
          '│         │──────────────────→ │               │\n' +
          '│         │                    │               │\n' +
          '│         │   accept/reject    │               │\n' +
          '│         │ ←──────────────────│               │\n' +
          '│                                              │\n' +
          '│   THREE PROPERTIES                           │\n' +
          '│   ┌────────────────────────────────────────┐ │\n' +
          '│   │ 1. Completeness: honest P convinces V  │ │\n' +
          '│   │ 2. Soundness: cheating P fails         │ │\n' +
          '│   │ 3. Zero-Knowledge: V learns nothing    │ │\n' +
          '│   │    beyond the statement truth           │ │\n' +
          '│   └────────────────────────────────────────┘ │\n' +
          '│                                              │\n' +
          '│   Interactive → Non-interactive              │\n' +
          '│   (Fiat-Shamir: replace verifier with hash)  │\n' +
          '└──────────────────────────────────────────────┘',
        keyPoints: [
          "Completeness: an honest prover with a valid witness always convinces the verifier",
          "Soundness: a dishonest prover without a valid witness cannot convince the verifier (except with negligible probability)",
          "Zero-knowledge: the verifier learns nothing beyond the truth of the statement",
          "Fiat-Shamir heuristic transforms interactive proofs into non-interactive ones by replacing the verifier's challenge with a hash",
          "Non-interactive ZKPs (NIZKs) are essential for blockchain: no back-and-forth, just submit proof on-chain"
        ],
        connections:
          "ZKPs are the heart of the thesis. Anonymous " +
          "credential presentation is fundamentally a " +
          "zero-knowledge proof: the holder proves they " +
          "possess a valid credential with certain attributes " +
          "without revealing the credential or other " +
          "attributes. On Sui, these proofs must be " +
          "non-interactive (Fiat-Shamir) so they can be " +
          "verified in a single transaction without " +
          "multi-round interaction."
      },
      {
        name: "Sigma Protocols",
        analogy:
          "A three-step dance between prover and verifier. " +
          "Step 1: the prover commits to a random value " +
          "(like showing a locked safe). Step 2: the " +
          "verifier issues a random challenge (like asking " +
          "to open a specific compartment). Step 3: the " +
          "prover responds correctly (opening it). This " +
          "three-move structure is the simplest form of " +
          "interactive zero-knowledge proof.",
        diagram:
          '┌──────────────────────────────────────────────┐\n' +
          '│           Sigma Protocol (3-move)             │\n' +
          '├──────────────────────────────────────────────┤\n' +
          '│                                              │\n' +
          '│   Prover                     Verifier        │\n' +
          '│     │                           │            │\n' +
          '│     │  1. COMMITMENT (a)        │            │\n' +
          '│     │   a = g^k (random k)      │            │\n' +
          '│     │────────────────────────→  │            │\n' +
          '│     │                           │            │\n' +
          '│     │  2. CHALLENGE (e)         │            │\n' +
          '│     │   e = random              │            │\n' +
          '│     │  ←────────────────────────│            │\n' +
          '│     │                           │            │\n' +
          '│     │  3. RESPONSE (z)          │            │\n' +
          '│     │   z = k + e*x             │            │\n' +
          '│     │────────────────────────→  │            │\n' +
          '│     │                           │            │\n' +
          '│     │         Verify:           │            │\n' +
          '│     │      g^z = a * pk^e ?     │            │\n' +
          '│                                              │\n' +
          '│   SCHNORR PROTOCOL                           │\n' +
          '│   Proves knowledge of discrete log x         │\n' +
          '│   where pk = g^x, without revealing x        │\n' +
          '│                                              │\n' +
          '│   COMPOSITIONS                               │\n' +
          '│   AND: prove knowledge of x AND y            │\n' +
          '│   OR:  prove knowledge of x OR y             │\n' +
          '│        (without revealing which)              │\n' +
          '└──────────────────────────────────────────────┘',
        keyPoints: [
          "Three-move structure: commitment (a), challenge (e), response (z)",
          "Schnorr protocol: the canonical Sigma protocol for proving knowledge of a discrete logarithm",
          "Honest-verifier zero-knowledge (HVZK): secure when the verifier follows the protocol honestly",
          "AND/OR compositions allow proving compound statements without revealing which branch is satisfied",
          "Made non-interactive via Fiat-Shamir: e = H(a || statement) replaces the verifier's random challenge"
        ],
        connections:
          "Sigma protocols are the proof mechanism inside BBS+ " +
          "credential presentation. When a holder presents a " +
          "credential on Sui, they run a composed Sigma " +
          "protocol: an AND-proof that they know the issuer's " +
          "signature and that the hidden attributes satisfy " +
          "certain predicates. The Schnorr protocol proves " +
          "knowledge of the secret key binding the credential " +
          "to the holder, preventing credential transfer."
      }
    ]
  },
  block2: {
    title: "Proving Systems (SNARKs, STARKs, PLONK)",
    connectionsSummary:
      "Choosing the right proving system is a critical " +
      "architectural decision for the thesis. Groth16 " +
      "(SNARK) offers the smallest proofs and fastest " +
      "verification, making it ideal for on-chain " +
      "verification on Sui where gas costs matter. Sui " +
      "natively supports Groth16 verification over BN254. " +
      "PLONK offers universal setups, useful if the " +
      "credential circuit evolves. Bulletproofs avoid " +
      "trusted setup entirely but are too slow for " +
      "on-chain verification. STARKs provide quantum " +
      "resistance but with larger proofs. The thesis " +
      "will likely use Groth16 for on-chain verification " +
      "of credential proofs, potentially with PLONK for " +
      "more complex predicate circuits.",
    concepts: [
      {
        name: "Arithmetic Circuits & R1CS",
        analogy:
          "Turning a math problem into a circuit board. " +
          "Each gate computes one operation (add or " +
          "multiply), wires carry values between gates, " +
          "and the entire circuit proves the computation " +
          "is correct. If any wire carries the wrong " +
          "value, the circuit fails. R1CS is the standard " +
          "blueprint format for describing these circuits.",
        diagram:
          '┌──────────────────────────────────────────────┐\n' +
          '│      Arithmetic Circuit → R1CS               │\n' +
          '├──────────────────────────────────────────────┤\n' +
          '│                                              │\n' +
          '│  Example: prove x^2 + x + 5 = 35            │\n' +
          '│           (solution: x = 5)                  │\n' +
          '│                                              │\n' +
          '│  CIRCUIT                                     │\n' +
          '│   x ──→┌─────┐                               │\n' +
          '│        │  *  │──→ v1 (= x*x)                │\n' +
          '│   x ──→└─────┘                               │\n' +
          '│                  ┌─────┐                      │\n' +
          '│   v1 ──────────→│  +  │──→ v2 (= v1+x)      │\n' +
          '│   x  ──────────→└─────┘                      │\n' +
          '│                  ┌─────┐                      │\n' +
          '│   v2 ──────────→│  +  │──→ out (= v2+5)     │\n' +
          '│    5 ──────────→└─────┘                      │\n' +
          '│                                              │\n' +
          '│  R1CS: A * w . B * w = C * w                 │\n' +
          '│  Each gate → one constraint row               │\n' +
          '│  w = [1, x, out, v1, v2] (witness)           │\n' +
          '└──────────────────────────────────────────────┘',
        keyPoints: [
          "Arithmetic circuits express computations as DAGs of addition and multiplication gates over a finite field",
          "R1CS (Rank-1 Constraint System): each gate becomes a constraint A_i * w . B_i * w = C_i * w",
          "The witness w contains all intermediate values plus inputs and outputs",
          "Flattening: complex expressions are broken into elementary gate operations",
          "R1CS is the input format for Groth16; PLONK uses a different arithmetization (PLONKish)"
        ],
        connections:
          "Every ZKP about anonymous credentials must first be " +
          "expressed as an arithmetic circuit. The credential " +
          "verification logic (pairing checks, attribute " +
          "predicates, range proofs) is flattened into R1CS " +
          "constraints. The circuit size directly determines " +
          "proving time and on-chain verification cost on Sui."
      },
      {
        name: "ZK-SNARKs (Groth16)",
        analogy:
          "A magical seal that compresses an entire book " +
          "into a single stamp. Anyone can verify the stamp " +
          "matches the book in milliseconds, but the stamp " +
          "reveals nothing about the book's content. The " +
          "catch: creating the stamp mold requires a " +
          "one-time trusted ceremony, and if the ceremony " +
          "secret (toxic waste) leaks, fake stamps become " +
          "possible.",
        diagram:
          '┌──────────────────────────────────────────────┐\n' +
          '│              Groth16 Pipeline                 │\n' +
          '├──────────────────────────────────────────────┤\n' +
          '│                                              │\n' +
          '│  ┌───────────────────┐                       │\n' +
          '│  │  Trusted Setup    │  (per circuit!)       │\n' +
          '│  │  (MPC ceremony)   │                       │\n' +
          '│  └────────┬──────────┘                       │\n' +
          '│           ↓                                  │\n' +
          '│  ┌─────────────┐  ┌─────────────┐            │\n' +
          '│  │ Proving Key │  │ Verifying Key│            │\n' +
          '│  │    (pk)     │  │     (vk)     │            │\n' +
          '│  └──────┬──────┘  └──────┬───────┘            │\n' +
          '│         ↓                ↓                   │\n' +
          '│  ┌────────────┐  ┌─────────────┐             │\n' +
          '│  │  Prover    │  │  Verifier   │             │\n' +
          '│  │ (witness,  │  │ (proof,     │             │\n' +
          '│  │  pk) → pi  │  │  vk) → 0/1  │             │\n' +
          '│  └────────────┘  └─────────────┘             │\n' +
          '│                                              │\n' +
          '│  PROPERTIES                                  │\n' +
          '│  ┌────────────────────────────────────────┐  │\n' +
          '│  │ Proof size:    192 bytes (constant!)   │  │\n' +
          '│  │ Verification:  O(1) — 3 pairings      │  │\n' +
          '│  │ Proving time:  O(n log n)              │  │\n' +
          '│  │ Setup:         circuit-specific (!)    │  │\n' +
          '│  │ Trust:         toxic waste must die    │  │\n' +
          '│  └────────────────────────────────────────┘  │\n' +
          '└──────────────────────────────────────────────┘',
        keyPoints: [
          "Trusted setup: a per-circuit MPC ceremony generates proving and verifying keys; the secret randomness (toxic waste) must be destroyed",
          "Constant proof size (192 bytes, 3 group elements) regardless of circuit complexity",
          "O(1) verification time: only 3 pairing checks needed, making it the fastest to verify on-chain",
          "Non-universal: each new circuit requires a new trusted setup ceremony",
          "Sui natively supports Groth16 verification over BN254 via the sui::groth16 module"
        ],
        connections:
          "Groth16 is the primary candidate for on-chain " +
          "credential verification on Sui. Its constant proof " +
          "size and O(1) verification map directly to minimal " +
          "gas costs. The sui::groth16 native module enables " +
          "direct proof verification in Move smart contracts. " +
          "The trusted setup requirement means each credential " +
          "circuit version needs a ceremony, which is a " +
          "deployment consideration for the thesis system."
      },
      {
        name: "ZK-STARKs",
        analogy:
          "Like SNARKs but with transparent setup. No secret " +
          "ceremony is needed: all parameters are derived " +
          "from public randomness. The tradeoff is larger " +
          "proofs, like writing a longer but self-evident " +
          "proof instead of a short proof that requires " +
          "trusting the exam board.",
        diagram:
          '┌──────────────────────────────────────────────┐\n' +
          '│          SNARKs vs STARKs Comparison          │\n' +
          '├──────────────────────────────────────────────┤\n' +
          '│                                              │\n' +
          '│  Property      │ SNARKs      │ STARKs       │\n' +
          '│  ──────────────┼─────────────┼──────────────│\n' +
          '│  Setup         │ Trusted     │ Transparent  │\n' +
          '│  Proof size    │ ~192 B      │ ~50-200 KB   │\n' +
          '│  Verify time   │ O(1)        │ O(log^2 n)   │\n' +
          '│  Prove time    │ O(n log n)  │ O(n log n)   │\n' +
          '│  Quantum safe  │ No          │ Yes          │\n' +
          '│  Crypto basis  │ Pairings    │ Hashes only  │\n' +
          '│                                              │\n' +
          '│  STARK PIPELINE                              │\n' +
          '│  ┌────────┐  ┌─────────┐  ┌───────────┐     │\n' +
          '│  │ Trace  │→│ AIR     │→│ FRI       │     │\n' +
          '│  │ (exec) │  │ (constr)│  │ (commit)  │     │\n' +
          '│  └────────┘  └─────────┘  └─────┬─────┘     │\n' +
          '│                                 ↓           │\n' +
          '│                          STARK proof        │\n' +
          '│                         (no trusted setup)  │\n' +
          '└──────────────────────────────────────────────┘',
        keyPoints: [
          "Transparent setup: no trusted ceremony, all parameters are public (no toxic waste risk)",
          "Quantum-resistant: relies only on collision-resistant hash functions, not elliptic curve assumptions",
          "Larger proofs (~50-200 KB vs 192 bytes for Groth16) and slower verification",
          "FRI (Fast Reed-Solomon Interactive Oracle Proofs) is the core commitment scheme",
          "Used by StarkNet and zkSync; not natively supported on Sui for verification"
        ],
        connections:
          "STARKs are relevant to the thesis as a future-proofing " +
          "consideration. While Groth16 is preferred for current " +
          "on-chain verification on Sui, STARKs offer quantum " +
          "resistance which may matter for long-lived identity " +
          "credentials. The thesis should acknowledge the " +
          "SNARK-to-STARK migration path and its implications " +
          "for credential longevity."
      },
      {
        name: "PLONK",
        analogy:
          "A universal proving factory. Unlike Groth16, which " +
          "needs a new setup ceremony for each circuit (like " +
          "building a new factory per product), PLONK's " +
          "single setup works for any circuit up to a " +
          "maximum size. Change the circuit, keep the setup. " +
          "The factory just reconfigures its production line.",
        diagram:
          '┌──────────────────────────────────────────────┐\n' +
          '│              PLONK Architecture               │\n' +
          '├──────────────────────────────────────────────┤\n' +
          '│                                              │\n' +
          '│  ┌─────────────────────────────┐             │\n' +
          '│  │   Universal SRS (one-time)  │             │\n' +
          '│  │   (powers of tau ceremony)  │             │\n' +
          '│  └──────────────┬──────────────┘             │\n' +
          '│                 ↓                            │\n' +
          '│  ┌──────────┐  ┌──────────┐  ┌──────────┐   │\n' +
          '│  │Circuit A │  │Circuit B │  │Circuit C │   │\n' +
          '│  │(preproc) │  │(preproc) │  │(preproc) │   │\n' +
          '│  └─────┬────┘  └─────┬────┘  └─────┬────┘   │\n' +
          '│        ↓             ↓             ↓        │\n' +
          '│  ┌──────────┐  ┌──────────┐  ┌──────────┐   │\n' +
          '│  │ Proof A  │  │ Proof B  │  │ Proof C  │   │\n' +
          '│  └──────────┘  └──────────┘  └──────────┘   │\n' +
          '│                                              │\n' +
          '│  KEY COMPONENTS                              │\n' +
          '│  ┌────────────────────────────────────────┐  │\n' +
          '│  │ KZG polynomial commitments             │  │\n' +
          '│  │ Permutation argument (copy constraints)│  │\n' +
          '│  │ Custom gates (extend beyond add/mul)   │  │\n' +
          '│  │ Updatable SRS (add your randomness)    │  │\n' +
          '│  └────────────────────────────────────────┘  │\n' +
          '└──────────────────────────────────────────────┘',
        keyPoints: [
          "Universal setup: one SRS (Structured Reference String) works for any circuit up to a max size",
          "Updatable: anyone can add their own randomness to the SRS, strengthening trust assumptions",
          "Permutation argument: enforces that wires connecting gates carry consistent values (copy constraints)",
          "KZG polynomial commitments enable efficient proof generation and verification",
          "Custom gates allow encoding complex operations (hash functions, range checks) more efficiently than R1CS"
        ],
        connections:
          "PLONK is a strong alternative for the thesis if the " +
          "credential circuit needs to evolve. A universal setup " +
          "means new attribute schemas or predicate types do " +
          "not require new ceremonies. PLONK-based systems like " +
          "Halo2 are used in privacy protocols (Zcash Orchard). " +
          "If Sui adds native PLONK verification, it could " +
          "simplify credential system upgrades."
      },
      {
        name: "Bulletproofs",
        analogy:
          "A Russian nesting doll proof. Each layer of the " +
          "proof halves its size through a recursive inner " +
          "product argument, compressing a large statement " +
          "into a logarithmically small proof. No trusted " +
          "setup ceremony is needed at all, but opening " +
          "each doll takes time, making verification slower.",
        diagram:
          '┌──────────────────────────────────────────────┐\n' +
          '│           Bulletproofs (IPA-based)            │\n' +
          '├──────────────────────────────────────────────┤\n' +
          '│                                              │\n' +
          '│  INNER PRODUCT ARGUMENT                      │\n' +
          '│  Prove: <a, b> = c                           │\n' +
          '│                                              │\n' +
          '│  Round 1: n elements                         │\n' +
          '│  ┌─────────────────────────────────────┐     │\n' +
          '│  │ a1 a2 a3 a4 a5 a6 a7 a8 │ n=8      │     │\n' +
          '│  └─────────────┬───────────────────────┘     │\n' +
          '│                ↓ fold (halve)                │\n' +
          '│  Round 2: n/2 elements                       │\n' +
          '│  ┌─────────────────────┐                     │\n' +
          '│  │ a1\' a2\' a3\' a4\'  │ n=4                │\n' +
          '│  └─────────┬───────────┘                     │\n' +
          '│            ↓ fold                            │\n' +
          '│  Round 3: n/4 elements                       │\n' +
          '│  ┌───────────┐                               │\n' +
          '│  │ a1" a2"   │ n=2                           │\n' +
          '│  └─────┬─────┘                               │\n' +
          '│        ↓ fold                                │\n' +
          '│  Final: single element                       │\n' +
          '│  ┌─────┐                                     │\n' +
          '│  │ a*  │ → verify                            │\n' +
          '│  └─────┘                                     │\n' +
          '│                                              │\n' +
          '│  Proof size: O(log n) group elements         │\n' +
          '│  Verify:     O(n) — must recompute           │\n' +
          '│  Setup:      NONE (transparent)              │\n' +
          '└──────────────────────────────────────────────┘',
        keyPoints: [
          "No trusted setup: completely transparent, based on discrete log assumption only",
          "Logarithmic proof size: O(log n) group elements, much smaller than the statement but larger than SNARKs",
          "Linear verification time O(n): verifier must recompute the inner product, making it slower than Groth16",
          "Primary use case: range proofs (proving a value is in [0, 2^n) without revealing it)",
          "Used in Monero for confidential transaction amounts; also in Zcash Sapling for Pedersen hash commitments"
        ],
        connections:
          "Bulletproofs are relevant for range proofs in the " +
          "thesis credential system: proving an age attribute " +
          "is above 18, or a payment amount is within bounds, " +
          "without revealing the exact value. However, their " +
          "O(n) verification cost makes them unsuitable for " +
          "direct on-chain use on Sui. The thesis may use " +
          "Bulletproof range proofs inside a Groth16 wrapper " +
          "for efficient on-chain verification."
      }
    ]
  }
};
