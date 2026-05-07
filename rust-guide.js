/**
 * Rust Study Guide — Production Rust & Crypto Codebases
 * Data file loaded by the study plan website.
 */

window.RUST_GUIDE = {
  block1: {
    title: "Production Rust & Crypto Codebases",
    connectionsSummary:
      "Your thesis implementation will be in Rust, building on Mysten Labs' " +
      "fastcrypto library. Production-grade Rust for cryptography requires " +
      "mastering error handling patterns (thiserror for libraries), constant-time " +
      "operations (subtle crate), secure memory cleanup (zeroize), property-based " +
      "testing (proptest), and fuzzing (cargo-fuzz). Understanding the Rust crypto " +
      "ecosystem — dalek, arkworks, fastcrypto — is essential for implementing " +
      "Pedersen commitments, Bulletproofs, and anonymous credential protocols.",
    concepts: [
      {
        name: "fastcrypto (Mysten Labs)",
        analogy:
          "The Swiss army knife of Sui's cryptographic toolkit. Instead of " +
          "reaching for a dozen different crates with different APIs, fastcrypto " +
          "wraps the best implementations behind unified traits. It is like " +
          "having one remote control that works with every TV brand — same " +
          "buttons (Signer, Verifier), different internals (Ed25519, BLS, Secp256k1).",
        diagram:
          '┌─────────────────────────────────────────────────────┐\n' +
          '│              fastcrypto Architecture                │\n' +
          '├─────────────────────────────────────────────────────┤\n' +
          '│                                                     │\n' +
          '│  Trait Layer:                                       │\n' +
          '│  ┌─────────────────────────────────────────┐        │\n' +
          '│  │ trait Signer    { fn sign(...) }         │       │\n' +
          '│  │ trait Verifier  { fn verify(...) }       │       │\n' +
          '│  │ trait AggregateAuthenticator             │       │\n' +
          '│  │ trait KeyPair   { type PubKey, PrivKey } │       │\n' +
          '│  └─────────────────────────────────────────┘        │\n' +
          '│                                                     │\n' +
          '│  Implementations:                                   │\n' +
          '│  ├── Ed25519     (curve25519-dalek backend)         │\n' +
          '│  ├── Secp256k1   (k256 backend)                    │\n' +
          '│  ├── Secp256r1   (p256 backend)                    │\n' +
          '│  ├── BLS12-381   (blst backend)                    │\n' +
          '│  ├── Pedersen    (Ristretto commitments)            │\n' +
          '│  ├── Bulletproofs (range proofs)                    │\n' +
          '│  └── Hash        (SHA, Blake2, Keccak, Poseidon)   │\n' +
          '│                                                     │\n' +
          '│  fastcrypto-zkp:                                    │\n' +
          '│  ├── Groth16 verifier (BN254)                      │\n' +
          '│  ├── zkLogin proof verification                    │\n' +
          '│  └── Poseidon hash                                 │\n' +
          '└─────────────────────────────────────────────────────┘',
        keyPoints: [
          "Unified trait-based API: Signer, Verifier, AggregateAuthenticator",
          "Wraps best-of-breed backends with consistent interface",
          "Already has Pedersen commitments and Bulletproofs — your thesis builds on these",
          "fastcrypto-zkp: Groth16 verifier and zkLogin implementation — study bn254/zk_login.rs",
          "Study path: traits first, then Pedersen module, then Bulletproofs, then zkLogin"
        ],
        connections:
          "fastcrypto is THE library you will build on during the internship. " +
          "Your thesis contributions (Bulletproofs++, ElGamal auditor keys, " +
          "anonymous credential verification) will either extend fastcrypto " +
          "or integrate with it. Understanding its trait hierarchy and patterns " +
          "is prerequisite for contributing.",
        thesisExample:
          "During the internship, you will likely add Bulletproofs++ range proofs " +
          "and ElGamal auditor key encryption to fastcrypto's existing Pedersen " +
          "commitment module. The trait-based design means your additions follow " +
          "established patterns: implement the existing traits, add tests with " +
          "proptest, benchmark with criterion.",
        history: {
          inventor: "Mysten Labs (Kostas Chalkias, Chief Cryptographer)",
          year: 2022,
          context:
            "Mysten Labs was founded in 2021 by ex-Meta Novi/Diem engineers " +
            "(Evan Cheng, Sam Blackshear, Adeniyi Abiodun, George Danezis, " +
            "Kostas Chalkias). fastcrypto started as Sui's internal crypto " +
            "library and was open-sourced in 2022. Kostas Chalkias (previously " +
            "at R3 and Novi) designed the trait architecture. The library wraps " +
            "best-of-breed backends (curve25519-dalek, blst, k256) rather than " +
            "reimplementing cryptographic primitives from scratch — a deliberate " +
            "security decision to avoid introducing new bugs in critical code.",
          funFact:
            "The 'wrap, don't rewrite' philosophy is rare in crypto libraries — " +
            "most teams eventually rewrite primitives for performance. fastcrypto " +
            "bets that audited upstream backends are safer than optimized custom code, " +
            "even if it means accepting some overhead at FFI boundaries."
        },
        limitations: [
          "Tightly coupled to Sui's needs — some primitives are Sui-specific " +
            "(e.g., intent signing prepends domain separators that other chains do not use)",
          "Not all signature schemes support aggregation — BLS12-381 does via " +
            "AggregateAuthenticator, but Ed25519 aggregation is not exposed through fastcrypto's API",
          "Bulletproofs support exists but is basic — no Bulletproofs++ yet, which means " +
            "range proofs are larger and slower than state-of-the-art (potential thesis contribution)",
          "Documentation is sparse — must read source code and test files to understand " +
            "API usage patterns, as the doc comments are minimal"
        ],
        exercises: [
          {
            type: "design",
            question:
              "Sketch how you would add a Bulletproofs++ range proof module to " +
              "fastcrypto, following its existing trait patterns. What traits would " +
              "your module implement? How would it integrate with the existing " +
              "Pedersen commitment module? What new types would you introduce?",
            hint:
              "Study how the existing Bulletproofs module (fastcrypto/src/bulletproofs.rs) " +
              "defines BulletproofsRangeProof and implements prove/verify. Look at the " +
              "trait signatures: your Bulletproofs++ module would need a similar structure " +
              "but with different proof generation internals and smaller proof sizes.",
            answer:
              "Create a new module fastcrypto/src/bulletproofs_pp.rs. Define " +
              "BulletproofsPPRangeProof wrapping the proof bytes. Implement a " +
              "prove(value, blinding, bit_length) -> Result<Self> and " +
              "verify(commitment, proof, bit_length) -> Result<()> following the " +
              "existing Bulletproofs API surface. Reuse the existing PedersenCommitment " +
              "type from the commitments module — Bulletproofs++ proves the same " +
              "commitment structure, just with a more efficient proof. Add a " +
              "BulletproofsPPError variant to FastCryptoError. The key design decision " +
              "is whether to wrap an external Bulletproofs++ implementation (like the " +
              "bp-pp crate) or implement from the paper — following fastcrypto's " +
              "philosophy, wrapping is safer."
          },
          {
            type: "comparison",
            question:
              "Compare fastcrypto's error handling approach with dalek-cryptography's. " +
              "How does each library communicate failures? Which approach is better " +
              "for a multi-scheme library like fastcrypto, and why?",
            hint:
              "fastcrypto defines a central FastCryptoError enum with variants for " +
              "each failure mode. dalek uses per-crate error types (e.g., " +
              "SignatureError in ed25519-dalek). Think about what happens when you " +
              "need to combine errors from multiple backends in one library.",
            answer:
              "fastcrypto uses a unified FastCryptoError enum (InvalidInput, " +
              "InvalidSignature, GeneralError, etc.) that all scheme implementations " +
              "return. This works well because callers write generic code over the " +
              "Signer/Verifier traits and need a single error type to match on. " +
              "dalek-cryptography uses per-crate errors (ed25519's SignatureError, " +
              "x25519's separate error handling) which is cleaner per-crate but " +
              "forces callers to handle different error types when combining schemes. " +
              "For a multi-scheme library, fastcrypto's approach is better: one match " +
              "statement handles all signature verification failures regardless of " +
              "whether the key was Ed25519, BLS, or Secp256k1. The tradeoff is that " +
              "the central enum can become a grab-bag — some variants are only " +
              "relevant to specific schemes."
          }
        ]
      },
      {
        name: "Rust Crypto Patterns",
        analogy:
          "Handling nuclear material. Cryptographic code is like working with " +
          "radioactive isotopes — you need special handling at every step. " +
          "You never let secrets touch uncontrolled memory (zeroize), you " +
          "never let timing differences leak information (subtle), and you " +
          "test not just that it works but that it works for ALL valid inputs " +
          "(proptest). One careless moment and the whole system is compromised.",
        diagram:
          '┌─────────────────────────────────────────────────────┐\n' +
          '│           Rust Crypto Safety Patterns               │\n' +
          '├─────────────────────────────────────────────────────┤\n' +
          '│                                                     │\n' +
          '│  CONSTANT-TIME (subtle crate):                      │\n' +
          '│  // WRONG: if secret_byte == 0 { ... }             │\n' +
          '│  // RIGHT: secret_byte.ct_eq(&0u8)                 │\n' +
          '│  // Timing does not depend on secret values         │\n' +
          '│                                                     │\n' +
          '│  SECURE CLEANUP (zeroize crate):                   │\n' +
          '│  #[derive(Zeroize, ZeroizeOnDrop)]                 │\n' +
          '│  struct PrivateKey([u8; 32]);                       │\n' +
          '│  // Memory zeroed when key goes out of scope        │\n' +
          '│                                                     │\n' +
          '│  ERROR HANDLING:                                    │\n' +
          '│  Library: thiserror (typed, matchable errors)       │\n' +
          '│  Binary:  anyhow (erased, .context("msg"))         │\n' +
          '│                                                     │\n' +
          '│  TESTING:                                           │\n' +
          '│  proptest: "for ALL valid keys, sign→verify works" │\n' +
          '│  cargo-fuzz: random mutation finds panics/crashes   │\n' +
          '│  criterion: statistical benchmarking                │\n' +
          '└─────────────────────────────────────────────────────┘',
        keyPoints: [
          "subtle crate: ConstantTimeEq, ConditionallySelectable — prevents timing side channels",
          "zeroize crate: ZeroizeOnDrop — secrets zeroed on drop, never linger in memory",
          "thiserror for library error types, anyhow for application/test code",
          "proptest: property-based testing — essential for crypto (verify invariants on random inputs)",
          "cargo-fuzz: find panics and overflows via random mutation — critical for parsers and deserialization",
          "criterion: statistical benchmarks with regression detection"
        ],
        connections:
          "These patterns are mandatory for any code you contribute to Mysten Labs. " +
          "fastcrypto uses subtle extensively for constant-time operations. " +
          "Your Bulletproofs++ and credential code must follow the same discipline: " +
          "every secret value uses subtle ops, every key type derives ZeroizeOnDrop, " +
          "every core function has proptest coverage.",
        thesisExample:
          "When implementing the anonymous credential issuance protocol in Rust, " +
          "the issuer's secret key must derive ZeroizeOnDrop. The blinding factor " +
          "comparison in the Bulletproof verifier must use subtle::ConstantTimeEq. " +
          "The credential presentation protocol must be property-tested: 'for all " +
          "valid credentials and all valid attribute subsets, selective disclosure " +
          "verifies correctly.' These are not nice-to-haves — they are production " +
          "requirements at Mysten.",
        history: {
          inventor: "RustCrypto org, dalek team, Tony Arcieri",
          year: 2017,
          context:
            "The Rust crypto ecosystem coalesced around 2017-2019. The subtle crate " +
            "(by Henry de Valence and Isis Lovecruft from the dalek team) formalized " +
            "constant-time operations in Rust. The zeroize crate (by Tony Arcieri, " +
            "RustCrypto org) solved the problem of the compiler optimizing away " +
            "zeroing of secret memory. The RustCrypto GitHub org (founded around 2016) " +
            "standardized trait interfaces (Digest, Signature, AEAD). Before these " +
            "efforts, Rust crypto was fragmented — each library had its own error " +
            "types, trait signatures, and safety guarantees.",
          funFact:
            "The zeroize crate exists because Rust's optimizer is too good: it sees " +
            "'write zeros to memory that is about to be freed' and removes the write " +
            "as dead code. zeroize uses compiler fences and volatile writes to force " +
            "the zeroing to actually happen — a constant battle against LLVM's optimizer."
        },
        limitations: [
          "The subtle crate prevents timing leaks in Rust code but cannot prevent " +
            "them in hardware — CPU cache timing, branch prediction, and memory bus " +
            "side channels remain outside its control",
          "zeroize works on stack and heap memory but cannot zero CPU registers — " +
            "the compiler may keep secret values in registers after the value is " +
            "'dropped', and there is no portable way to clear them",
          "proptest is not a formal verification tool — it tests random samples, " +
            "not exhaustive proofs. Critical cryptographic properties still need " +
            "paper proofs or tools like CryptoVerif/EasyCrypt for real assurance",
          "Rust's safety guarantees end at FFI boundaries — calling C crypto libraries " +
            "(via ring, blst) reintroduces C's unsafety, and any memory corruption in " +
            "the C code bypasses Rust's borrow checker entirely"
        ],
        exercises: [
          {
            type: "conceptual",
            question:
              "Explain why the Rust compiler might optimize away " +
              "secret_key.iter_mut().for_each(|b| *b = 0) and how the zeroize " +
              "crate prevents this. What specific compiler optimization is at play, " +
              "and what mechanism does zeroize use to defeat it?",
            hint:
              "The compiler performs 'dead store elimination' — if memory is written " +
              "to but never read again before being freed, the write is removed. " +
              "Look at how zeroize uses core::ptr::write_volatile and compiler fences " +
              "to prevent this.",
            answer:
              "The compiler's dead store elimination pass sees that the zero-write " +
              "to secret_key is followed by the variable going out of scope (being " +
              "freed) with no subsequent read. Since no observable behavior depends " +
              "on the zeros, LLVM removes the write entirely — the secret remains " +
              "in memory. zeroize defeats this using core::ptr::write_volatile, " +
              "which tells the compiler that the write has side effects that must " +
              "not be eliminated (volatile means 'this memory access is observable'). " +
              "Additionally, zeroize places a compiler fence (core::sync::atomic::fence) " +
              "after the write to prevent reordering. The ZeroizeOnDrop derive macro " +
              "implements Drop to call zeroize automatically, ensuring secrets are " +
              "always cleaned up even on early returns or panics."
          },
          {
            type: "design",
            question:
              "Write a proptest strategy (in pseudocode or Rust) that tests the " +
              "homomorphic property of Pedersen commitments: " +
              "Commit(v1, r1) + Commit(v2, r2) = Commit(v1+v2, r1+r2). " +
              "What input ranges should you use, and what edge cases matter?",
            hint:
              "Use proptest's any::<u64>() for values and random scalars for blinding " +
              "factors. The key edge cases are: v1+v2 overflowing the scalar field, " +
              "either value being zero, and blinding factors summing to zero.",
            answer:
              "proptest! { #[test] fn pedersen_homomorphic(" +
              "v1 in 0u64..u64::MAX/2, v2 in 0u64..u64::MAX/2, " +
              "r1 in arb_scalar(), r2 in arb_scalar()) { " +
              "let c1 = pedersen_commit(v1, r1); " +
              "let c2 = pedersen_commit(v2, r2); " +
              "let c_sum = pedersen_commit(v1 + v2, r1 + r2); " +
              "prop_assert_eq!(c1 + c2, c_sum); } } " +
              "Input ranges: cap values at u64::MAX/2 to avoid overflow before " +
              "reduction into the scalar field. arb_scalar() generates random " +
              "elements in the curve's scalar field. Edge cases to add as explicit " +
              "tests: v1=0 or v2=0 (commitment to zero is still randomized by r), " +
              "r1+r2=0 (the sum commitment's blinding cancels but the value is " +
              "still hidden by the group structure), and v1=v2=field_order-1 " +
              "(tests modular arithmetic at the boundary)."
          }
        ]
      },
      {
        name: "Key Codebases to Study",
        analogy:
          "Learning to cook by working in different restaurant kitchens. " +
          "Each codebase is a masterclass in a specific technique: Penumbra " +
          "teaches shielded payments architecture, Grin teaches Mimblewimble " +
          "elegance, Zcash teaches battle-tested ZKP integration, and fastcrypto " +
          "teaches trait-based crypto library design. Study the best to build " +
          "the best.",
        diagram:
          '┌─────────────────────────────────────────────────────┐\n' +
          '│           Priority Codebases                        │\n' +
          '├─────────────────────────────────────────────────────┤\n' +
          '│                                                     │\n' +
          '│  1. MystenLabs/fastcrypto     CRITICAL              │\n' +
          '│     → traits, Pedersen, Bulletproofs, zkLogin        │\n' +
          '│                                                     │\n' +
          '│  2. penumbra-zone/penumbra    VERY HIGH             │\n' +
          '│     → penumbra-crypto crate, Poseidon, decaf377     │\n' +
          '│                                                     │\n' +
          '│  3. mimblewimble/grin         HIGH                  │\n' +
          '│     → core/transaction.rs, libwallet                │\n' +
          '│                                                     │\n' +
          '│  4. zcash/librustzcash        HIGH                  │\n' +
          '│     → orchard crate (Halo 2), zcash_primitives      │\n' +
          '│                                                     │\n' +
          '│  5. aptos-labs/aptos-core     HIGH                  │\n' +
          '│     → confidential_token/, Twisted ElGamal + BP     │\n' +
          '│                                                     │\n' +
          '│  6. MystenLabs/seal           MEDIUM                │\n' +
          '│     → IBE, threshold decryption, Move policies      │\n' +
          '│                                                     │\n' +
          '│  Study approach per codebase:                       │\n' +
          '│  → Clone, read README, run tests                   │\n' +
          '│  → Find the core crypto module                     │\n' +
          '│  → Trace one full operation end-to-end              │\n' +
          '│  → Note patterns applicable to your thesis          │\n' +
          '└─────────────────────────────────────────────────────┘',
        keyPoints: [
          "fastcrypto: your daily tool — understand trait design, run tests, read Pedersen + BP modules",
          "Penumbra: state-of-the-art private payments in Rust — study penumbra-crypto crate architecture",
          "Grin: cleanest Mimblewimble — study core/src/core/transaction.rs for CT patterns",
          "Zcash: battle-tested ZKP — study orchard crate for Halo 2 integration patterns",
          "Aptos: Twisted ElGamal on Move chain — closest analog to what you build on Sui",
          "Seal: Mysten's secrets management — understand IBE + threshold architecture for potential TEE integration"
        ],
        connections:
          "Each codebase teaches a different aspect of your thesis system. " +
          "fastcrypto is the API you extend. Penumbra shows how to structure " +
          "a shielded crypto crate. Grin demonstrates clean CT implementation. " +
          "Aptos shows CT on an account-based Move chain (closest to Sui). " +
          "Zcash shows how to integrate ZKPs with a payment system at scale.",
        thesisExample:
          "Before the internship starts, clone and build all 6 codebases. " +
          "For each, trace one confidential transfer end-to-end: from " +
          "commitment creation to range proof generation to verification. " +
          "Document the patterns in your research log. This gives you the " +
          "vocabulary and design intuition to hit the ground running at Mysten.",
        history: {
          inventor: "Multiple teams (Zcash, Grin, Penumbra, Aptos)",
          year: 2016,
          context:
            "These codebases represent three generations of blockchain privacy: " +
            "Zcash (2016, first production ZKP payments, founded by Zooko Wilcox), " +
            "Grin/Beam (2019, first Mimblewimble implementations based on Tom Elvis " +
            "Jedusor's 2016 whitepaper), and Penumbra (2022+, modern shielded DeFi " +
            "by Henry de Valence). Aptos Confidential Transactions (2024) is the " +
            "newest entry, adapting confidential transfers to an account-based Move " +
            "chain — the closest architectural precedent for what the thesis builds " +
            "on Sui.",
          funFact:
            "Grin's anonymous founder 'Ignotus Peverell' (a Harry Potter character) " +
            "disappeared in 2019 after launching the project, mirroring Satoshi " +
            "Nakamoto's departure from Bitcoin. The Mimblewimble whitepaper itself " +
            "was posted under the pseudonym 'Tom Elvis Jedusor' — the French name " +
            "for Voldemort — on a Bitcoin research IRC channel."
        },
        limitations: [
          "Penumbra uses a custom curve (decaf377) that is not widely used elsewhere — " +
            "patterns learned from Penumbra's curve operations may not transfer directly " +
            "to Sui's BLS12-381 and BN254 stack",
          "Grin's community is small and development has slowed significantly since " +
            "2021 — some code may be unmaintained, and dependency versions can be outdated",
          "Zcash's Orchard circuit uses Halo 2, which has a steep learning curve — " +
            "understanding the proof system internals requires familiarity with PLONKish " +
            "arithmetization, which is not directly applicable to Bulletproofs",
          "Aptos Confidential Transactions is relatively new (2024) and less battle-tested " +
            "than Zcash — the code may contain undiscovered issues, and the API surface " +
            "could change as it matures"
        ],
        exercises: [
          {
            type: "comparison",
            question:
              "Clone both Grin (mimblewimble/grin) and Aptos (aptos-labs/aptos-core). " +
              "Find the range proof verification code in each codebase. Compare: " +
              "what proof system does each use? What elliptic curve? What is the " +
              "approximate proof size? Which approach would produce smaller proofs " +
              "for 64-bit range proofs?",
            hint:
              "In Grin, look at core/src/core/committed.rs and the secp256k1-zkp " +
              "dependency for Bulletproofs over the secp256k1 curve. In Aptos, look " +
              "under aptos-move/framework/src/ or search for 'range_proof' and " +
              "'bulletproof' — Aptos uses Bulletproofs over Ristretto255 (via " +
              "curve25519-dalek).",
            answer:
              "Grin uses original Bulletproofs over the secp256k1 curve via the " +
              "secp256k1-zkp C library (wrapped with FFI). Proof size is " +
              "logarithmic: ~674 bytes for a 64-bit range proof. Aptos uses " +
              "Bulletproofs over Ristretto255 (curve25519-dalek) in pure Rust. " +
              "Proof sizes are comparable (~672 bytes for 64-bit) since both use " +
              "the same Bulletproofs protocol, just on different curves. The key " +
              "architectural difference is that Grin uses secp256k1 (Bitcoin's curve) " +
              "because Mimblewimble was designed as a Bitcoin extension, while Aptos " +
              "chose Ristretto255 for cleaner point encoding and a prime-order group. " +
              "For the thesis on Sui, Bulletproofs++ would reduce proof size further " +
              "to ~416 bytes for 64-bit range proofs, regardless of curve choice."
          },
          {
            type: "design",
            question:
              "You need to add confidential transfers to Sui using fastcrypto. " +
              "Of the codebases studied (Penumbra, Grin, Zcash, Aptos), which " +
              "one's architecture would you follow most closely and why? Consider: " +
              "account model vs UTXO, proof system, curve compatibility with Sui, " +
              "and implementation language.",
            hint:
              "Sui uses an account-based model (like Aptos), not UTXO (like Grin " +
              "and Zcash). The proof system matters too: Bulletproofs are simpler " +
              "than Halo 2 and do not require a trusted setup. Consider which " +
              "codebase matches Sui's constraints most closely on all four dimensions.",
            answer:
              "Aptos Confidential Transactions is the closest match on three of " +
              "four dimensions: (1) Account model — both Sui and Aptos are " +
              "account-based Move chains, so the state management patterns " +
              "(encrypted balances stored in account resources, not UTXOs) transfer " +
              "directly. (2) Proof system — Aptos uses Bulletproofs, which is the " +
              "same family as the thesis target (Bulletproofs++). (3) Language — " +
              "both use Rust for the crypto backend with Move for on-chain logic. " +
              "The one gap is curve: Aptos uses Ristretto255 while Sui's fastcrypto " +
              "has stronger support for BLS12-381 and Ristretto via different backends. " +
              "Penumbra is the second-most useful for its shielded DeFi patterns, " +
              "but its UTXO-based design and custom decaf377 curve make it less " +
              "directly applicable. Grin and Zcash are valuable for understanding " +
              "the cryptographic primitives but their UTXO architectures require " +
              "significant redesign for an account-based chain."
          }
        ]
      }
      /* ───────── arkworks Ecosystem ───────── */
      {
        name: "arkworks Ecosystem (ark-ff, ark-ec, ark-groth16)",
        analogy:
          "LEGO blocks for cryptographic math. Instead of building a bridge from " +
          "raw steel, you get pre-fabricated beams (finite fields), joints (elliptic " +
          "curves), and connectors (polynomial commitments) that snap together. " +
          "ark-ff gives you field elements, ark-ec gives you curve points, ark-poly " +
          "gives you polynomials, and ark-groth16 gives you a complete proof system. " +
          "Each block works independently, but they are designed to interlock — " +
          "because they share the same trait system, you can swap BLS12-381 for BN254 " +
          "by changing one type parameter, and every operation from field arithmetic " +
          "to pairing checks adapts automatically.",
        diagram:
          '┌─────────────────────────────────────────────────────┐\n' +
          '│            arkworks 0.5 Crate Ecosystem             │\n' +
          '├─────────────────────────────────────────────────────┤\n' +
          '│                                                     │\n' +
          '│  ALGEBRA LAYER (arkworks-rs/algebra)                │\n' +
          '│  ┌─────────────────────────────────────────────┐    │\n' +
          '│  │ ark-ff       Field, PrimeField, FftField    │    │\n' +
          '│  │ ark-ec       CurveGroup, AffineRepr, Pairing│    │\n' +
          '│  │ ark-poly     DensePolynomial, EvalDomain     │    │\n' +
          '│  │ ark-serialize  Compressed / Validated IO     │    │\n' +
          '│  └─────────────────────────────────────────────┘    │\n' +
          '│       ▲                                             │\n' +
          '│       │ depends on                                  │\n' +
          '│  CURVE IMPLEMENTATIONS                              │\n' +
          '│  ┌─────────────────────────────────────────────┐    │\n' +
          '│  │ ark-bls12-381   G1, G2, Fr, Fq, Bls12_381  │    │\n' +
          '│  │ ark-bn254       G1, G2, Fr, Fq, Bn254       │    │\n' +
          '│  │ ark-ed25519     EdwardsConfig                │    │\n' +
          '│  │ ark-bw6-761     BW6 cycle curve              │    │\n' +
          '│  └─────────────────────────────────────────────┘    │\n' +
          '│       ▲                                             │\n' +
          '│       │ depends on                                  │\n' +
          '│  PROOF SYSTEMS                                      │\n' +
          '│  ┌─────────────────────────────────────────────┐    │\n' +
          '│  │ ark-relations   R1CS (ConstraintSystem)     │    │\n' +
          '│  │ ark-r1cs-std    Gadgets (AllocVar, EqGadget)│    │\n' +
          '│  │ ark-groth16     Prove / Verify (Groth16)    │    │\n' +
          '│  │ ark-marlin      Universal SNARK              │    │\n' +
          '│  └─────────────────────────────────────────────┘    │\n' +
          '│                                                     │\n' +
          '│  THESIS USAGE:                                      │\n' +
          '│  utt-rs → ark-bls12-381 + ark-ec + ark-ff (0.5)    │\n' +
          '│  Sonobe → ark-relations + ark-groth16 (decider)     │\n' +
          '└─────────────────────────────────────────────────────┘',
        keyPoints: [
          "Modular architecture: each crate handles one concern — fields (ark-ff), " +
            "curves (ark-ec), polynomials (ark-poly), proofs (ark-groth16). Swap " +
            "any layer without touching the others",
          "Trait-based generics: write code once over CurveGroup or PrimeField, " +
            "instantiate with BLS12-381, BN254, or any curve. Your credential code " +
            "compiles for any pairing-friendly curve",
          "arkworks 0.5 breaking changes: CurveGroup replaces ProjectiveCurve, " +
            "AffineRepr replaces AffineCurve, generator() replaces " +
            "prime_subgroup_generator(). The thesis codebase (utt-rs) is already on 0.5",
          "ark-groth16 + ark-relations: define circuits as ConstraintSynthesizer, " +
            "generate proving/verification keys, create and verify Groth16 proofs. " +
            "This is the exact flow used by Sonobe's decider SNARK",
          "Multi-scalar multiplication (MSM) via VariableBaseMSM::msm() — the " +
            "performance bottleneck in proof generation. Understanding MSM tuning " +
            "is key to optimizing prover latency",
          "Pairing operations via the Pairing trait: Bls12_381::pairing(g1, g2) " +
            "computes e(G1, G2) → GT. Used for Groth16 verification and BBS+ " +
            "signature verification"
        ],
        connections:
          "arkworks IS the foundation of your thesis implementation. The utt-rs " +
          "crate uses ark-bls12-381, ark-ec, ark-ff, and ark-serialize at version " +
          "0.5. Every BBS+ operation (signing, proof generation, verification) is " +
          "an arkworks field/curve operation. Sonobe uses ark-relations and " +
          "ark-groth16 for the final decider proof. You cannot debug thesis code " +
          "without understanding arkworks traits and their error messages.",
        thesisExample:
          "When implementing BBS+ selective disclosure in utt-rs, you will: " +
          "(1) sample random blinding factors with Fr::rand(&mut rng), " +
          "(2) compute Pedersen-like commitments with G1Projective scalar " +
          "multiplication, (3) evaluate multilinear polynomials for the " +
          "credential proof circuit, and (4) verify pairings with " +
          "Bls12_381::pairing(). Each of these is a direct arkworks API call. " +
          "For the Sonobe folding pipeline, the final Groth16 decider uses " +
          "ark-groth16's Groth16::prove() and Groth16::verify() — the exact " +
          "same API shown in the code examples.",
        history: {
          inventor: "Pratyush Mishra, arkworks-rs contributors",
          year: 2020,
          context:
            "arkworks grew from zexe (Bowe, Chiesa, Green, Miers, Mishra, Wu, " +
            "Oakland S&P 2020), which pioneered decentralized private computation. " +
            "Pratyush Mishra (UC Berkeley → Aleo) led the extraction of zexe's " +
            "algebra and proof system code into reusable crates. The 0.3 release " +
            "(2021) established the trait-based architecture. The 0.4 release (2022) " +
            "added Compress/Validate serialization. The 0.5 release (2024) cleaned " +
            "up the curve trait hierarchy (CurveGroup/AffineRepr). Today arkworks " +
            "is the de facto standard for ZK proof systems in Rust — used by " +
            "Sonobe, Jolt, Mina, Aleo, and many others.",
          funFact:
            "The name 'arkworks' comes from 'arithmetic + frameworks'. The library " +
            "has over 100 contributors and is maintained as a community project " +
            "rather than by a single company — unusual for crypto infrastructure " +
            "where most libraries are corporate-backed."
        },
        limitations: [
          "Compile times are brutal — generic-heavy code with deep trait bounds " +
            "can take 60+ seconds for incremental builds. Use cargo check, not " +
            "cargo build, during development",
          "Error messages are cryptic — trait bound failures involving CurveGroup + " +
            "PrimeField + CanonicalSerialize produce multi-page error output. Learn " +
            "to read the 'required by this bound' chain",
          "No GPU acceleration by default — MSM and NTT are CPU-only in arkworks. " +
            "GPU provers (ICICLE, Sppark) wrap arkworks types but are separate crates",
          "Documentation is minimal — the API docs exist but lack examples. The " +
            "best way to learn is reading test files in each crate's tests/ directory",
          "The 0.4 → 0.5 migration broke significant downstream code — watch for " +
            "outdated examples and tutorials that still use ProjectiveCurve/AffineCurve"
        ],
        exercises: [
          {
            type: "code",
            question:
              "Write a Rust snippet that: (1) samples a random scalar r in Fr " +
              "(BLS12-381), (2) computes P = r * G where G is the generator of G1, " +
              "(3) serializes P to compressed bytes, (4) deserializes and verifies " +
              "equality. Use arkworks 0.5 APIs.",
            hint:
              "Import ark_bls12_381::{Fr, G1Projective}, ark_ec::CurveGroup, " +
              "ark_ff::UniformRand, ark_serialize::{CanonicalSerialize, CanonicalDeserialize}. " +
              "Use G1Projective::generator() for G, and .into_affine() before serializing " +
              "for compressed form.",
            answer:
              "use ark_bls12_381::{Fr, G1Projective, G1Affine};\n" +
              "use ark_ec::CurveGroup;\n" +
              "use ark_ff::UniformRand;\n" +
              "use ark_serialize::{CanonicalSerialize, CanonicalDeserialize};\n\n" +
              "let mut rng = ark_std::test_rng();\n" +
              "let r = Fr::rand(&mut rng);\n" +
              "let g = G1Projective::generator();\n" +
              "let p = g * r;\n" +
              "let p_affine = p.into_affine();\n\n" +
              "let mut bytes = Vec::new();\n" +
              "p_affine.serialize_compressed(&mut bytes).unwrap();\n\n" +
              "let p_back = G1Affine::deserialize_compressed(&bytes[..]).unwrap();\n" +
              "assert_eq!(p_affine, p_back);"
          },
          {
            type: "code",
            question:
              "Define a minimal R1CS circuit in arkworks that proves knowledge " +
              "of x such that x^3 + x + 5 = y (where y is a public input). " +
              "Implement ConstraintSynthesizer and generate a Groth16 proof.",
            hint:
              "Implement the ConstraintSynthesizer<F> trait. In generate_constraints(), " +
              "allocate x as a witness (AllocVar), compute x*x, then x*x*x, add x and 5, " +
              "enforce equality with y (public input). Use ark_groth16::Groth16 for " +
              "setup/prove/verify.",
            answer:
              "See the technical companion for the full working example with " +
              "ConstraintSynthesizer, Groth16::circuit_specific_setup(), " +
              "Groth16::prove(), and Groth16::verify()."
          },
          {
            type: "conceptual",
            question:
              "Explain the difference between CurveGroup and AffineRepr in " +
              "arkworks 0.5. When should you use each? What happens if you " +
              "try to do repeated additions on AffineRepr points?",
            hint:
              "CurveGroup uses projective coordinates (3 field elements: X, Y, Z), " +
              "AffineRepr uses affine coordinates (2 field elements: x, y). Think " +
              "about what happens with the expensive field inversion in affine addition.",
            answer:
              "CurveGroup (projective) avoids field inversions during point " +
              "addition by using homogeneous coordinates — additions and doublings " +
              "are 10-15 field multiplications. AffineRepr (affine) requires a " +
              "field inversion per addition (~100x slower than multiplication). " +
              "Use CurveGroup for all intermediate computation (scalar multiplication, " +
              "MSM, proof generation), then call .into_affine() only at the end for " +
              "serialization or comparison. If you accidentally accumulate additions " +
              "on AffineRepr, each addition triggers into_group() → add → into_affine(), " +
              "paying an inversion every time. This is the #1 performance mistake " +
              "in arkworks code."
          }
        ]
      }
    ]
  }
};
