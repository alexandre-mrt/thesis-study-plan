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
  },

  /* ================================================================
   * BLOCK 2: Cryptographic Functions — Hands-On with arkworks & Circom
   * ================================================================ */
  block2: {
    title: "Cryptographic Functions in Practice",
    connectionsSummary:
      "This block provides hands-on examples of every cryptographic primitive " +
      "used in the thesis: Pedersen commitments, Schnorr and BBS+ signatures, " +
      "Groth16 circuit writing, and Merkle trees with Poseidon hash. Each concept " +
      "includes working arkworks (Rust) code and equivalent Circom (circuit DSL) " +
      "snippets so you can see the same operation in both the off-chain and in-circuit worlds.",
    concepts: [
      /* ───────── Pedersen Commitments ───────── */
      {
        name: "Pedersen Commitments (arkworks + Circom)",
        analogy:
          "A Pedersen commitment is a digital sealed envelope. You put a value " +
          "inside, seal it with a random blinding factor, and hand the sealed " +
          "envelope to someone. They cannot open it (hiding), and you cannot " +
          "swap the value later (binding). The magic: sealed envelopes are additive — " +
          "if Alice seals 3 and Bob seals 5, their sealed envelopes add up to a " +
          "sealed 8, without anyone opening them. This is the foundation of " +
          "confidential transactions.",
        diagram:
          '┌─────────────────────────────────────────────────────┐\n' +
          '│           Pedersen Commitment: C = v·G + r·H        │\n' +
          '├─────────────────────────────────────────────────────┤\n' +
          '│                                                     │\n' +
          '│  ARKWORKS (off-chain, Rust)                         │\n' +
          '│  let g = G1Projective::generator();                 │\n' +
          '│  let h = hash_to_g1("pedersen_h");                  │\n' +
          '│  let c = g * v + h * r;                             │\n' +
          '│                                                     │\n' +
          '│  CIRCOM (in-circuit, DSL)                           │\n' +
          '│  component ped = Pedersen(2);                       │\n' +
          '│  ped.in[0] <== v;                                   │\n' +
          '│  ped.in[1] <== r;                                   │\n' +
          '│  commitment <== ped.out;                             │\n' +
          '│                                                     │\n' +
          '│  HOMOMORPHIC PROPERTY                               │\n' +
          '│  C(v1,r1) + C(v2,r2) = C(v1+v2, r1+r2)            │\n' +
          '│  → Verify balance without revealing amounts          │\n' +
          '└─────────────────────────────────────────────────────┘',
        keyPoints: [
          "C = v·G + r·H where v is value, r is random blinding, G and H are " +
            "independent generators. Hiding: C looks random. Binding: cannot find " +
            "different (v', r') that opens to same C (discrete log hardness)",
          "Homomorphic: C1 + C2 = C(v1+v2, r1+r2). This is how confidential " +
            "transactions verify balance conservation without revealing amounts",
          "arkworks: scalar multiplication on G1Projective. Use hash-to-curve " +
            "for the second generator H to ensure nobody knows log_G(H)",
          "Circom: use the Pedersen hash template from circomlib — but note it " +
            "outputs a curve point hash, not a raw commitment. For real commitments, " +
            "use EscalarMulAny with two bases",
          "Cost: 1 scalar multiplication = ~250 constraints in R1CS. A Pedersen " +
            "commitment proof adds ~500 constraints to your circuit"
        ],
        connections:
          "Pedersen commitments are used everywhere in the thesis: confidential " +
          "balances, BBS+ credential attribute hiding, and Merkle tree leaf " +
          "commitments. Understanding the arkworks implementation is essential " +
          "for debugging commitment verification failures.",
        thesisExample:
          "In the payment circuit, the prover commits to the transfer amount: " +
          "C_amount = amount·G + blinding·H. The circuit checks that input " +
          "commitments minus output commitments equals zero (balance conservation) " +
          "without revealing the actual amounts. The range proof then shows " +
          "each committed amount is non-negative.",
        history: {
          inventor: "Torben Pedersen",
          year: 1991,
          context:
            "Published at CRYPTO 1991. Pedersen's scheme improved on earlier " +
            "commitment schemes by being perfectly hiding (information-theoretically " +
            "secure) while computationally binding (relies on discrete log). " +
            "It became the standard commitment in privacy protocols because of " +
            "its additive homomorphism — a property that coin-based and account-based " +
            "confidential transactions both exploit.",
          funFact:
            "The choice of the second generator H is critical: if you know " +
            "log_G(H) = k, you can open any commitment to any value. This is " +
            "why H must be derived via a 'nothing-up-my-sleeve' process like " +
            "hashing a fixed string to a curve point."
        },
        limitations: [
          "Computationally binding only — a quantum computer that solves discrete " +
            "log can break binding (find alternative openings)",
          "Not additively homomorphic for multiplication — you can add commitments " +
            "but not multiply them. For multiplication, you need pairings or " +
            "additional ZK proof techniques",
          "The blinding factor r must be truly random — reusing r across " +
            "commitments leaks the difference of committed values"
        ],
        exercises: [
          {
            type: "code",
            question:
              "Using arkworks BLS12-381, implement a function that: (1) commits " +
              "to two values v1=100 and v2=50 with random blindings, (2) computes " +
              "the sum commitment, (3) verifies the sum commitment opens to 150 " +
              "using the sum of blindings. Print the commitment sizes in bytes.",
            hint:
              "Use G1Projective::generator() for G. Derive H by hashing a fixed " +
              "string: H = G1Projective::rand(&mut deterministic_rng). Commit " +
              "with c = g * Fr::from(v) + h * r. The sum commitment is c1 + c2.",
            answer:
              "let g = G1Projective::generator();\n" +
              "let h = G1Projective::rand(&mut ark_std::test_rng()); // deterministic H\n" +
              "let r1 = Fr::rand(&mut rng); let r2 = Fr::rand(&mut rng);\n" +
              "let c1 = g * Fr::from(100u64) + h * r1;\n" +
              "let c2 = g * Fr::from(50u64) + h * r2;\n" +
              "let c_sum = c1 + c2;\n" +
              "let c_check = g * Fr::from(150u64) + h * (r1 + r2);\n" +
              "assert_eq!(c_sum, c_check); // homomorphic!"
          }
        ]
      },

      /* ───────── Schnorr & BBS+ Signatures ───────── */
      {
        name: "Schnorr & BBS+ Signatures (arkworks)",
        analogy:
          "A Schnorr signature is like signing a document with invisible ink that " +
          "only appears under UV light — anyone can verify the signature exists, " +
          "but they learn nothing about the pen. BBS+ takes this further: you can " +
          "sign a document with 10 fields, then show the signature is valid while " +
          "revealing only 3 of the 10 fields. The verifier is convinced all 10 " +
          "fields were signed, but sees only what you choose to disclose. This is " +
          "selective disclosure — the core of anonymous credentials.",
        diagram:
          '┌─────────────────────────────────────────────────────┐\n' +
          '│             Schnorr vs BBS+ Signatures              │\n' +
          '├─────────────────────────────────────────────────────┤\n' +
          '│                                                     │\n' +
          '│  SCHNORR (single message, DL-based)                 │\n' +
          '│  Keygen:  sk = x, pk = x·G                          │\n' +
          '│  Sign:    k ← random, R = k·G                       │\n' +
          '│           c = H(R || pk || msg)                      │\n' +
          '│           s = k - c·x                                │\n' +
          '│           σ = (R, s)                                 │\n' +
          '│  Verify:  s·G + c·pk == R ?                          │\n' +
          '│                                                     │\n' +
          '│  BBS+ (multi-message, pairing-based)                │\n' +
          '│  Keygen:  sk = x, pk = x·G2                         │\n' +
          '│  Sign:    σ = 1/(x + e) · (G1 + Σ mᵢ·Hᵢ)           │\n' +
          '│  Verify:  e(σ, pk + e·G2) == e(G1 + Σ mᵢ·Hᵢ, G2)  │\n' +
          '│  Disclose: derive proof π revealing subset of mᵢ     │\n' +
          '│                                                     │\n' +
          '│  KEY DIFFERENCE:                                    │\n' +
          '│  Schnorr: prove "I signed this message"             │\n' +
          '│  BBS+:    prove "I signed messages including..."    │\n' +
          '│           (selective disclosure, unlinkable)         │\n' +
          '└─────────────────────────────────────────────────────┘',
        keyPoints: [
          "Schnorr: sign = (R, s) where R = k·G, s = k - c·x. Verification: " +
            "s·G + c·pk = k·G = R. One scalar mul + one hash. ~64 bytes on BLS12-381",
          "BBS+: sign N messages at once. Signature σ is a single G1 point. " +
            "Selective disclosure: derive a ZK proof that reveals subset of " +
            "messages while hiding the rest. Signature is ~48 bytes (compressed G1)",
          "arkworks implementation: Schnorr uses ark-ec scalar mul + a hash-to-field. " +
            "BBS+ uses Bls12_381::pairing() for verification. Both use Fr for scalars",
          "BBS+ requires pairings (G1 × G2 → GT). Schnorr works on any group. " +
            "This is why BBS+ needs BLS12-381 or BN254 — curves with efficient pairings",
          "Unlinkability: each BBS+ proof is randomized — two proofs from the " +
            "same credential are unlinkable. Schnorr signatures are always the same " +
            "for the same message"
        ],
        connections:
          "BBS+ is THE signature scheme for the thesis anonymous credentials. " +
          "The issuer signs a credential (N attributes) with BBS+. The holder " +
          "derives a selective disclosure proof revealing only chosen attributes. " +
          "The Sui contract verifies the proof via pairing checks.",
        thesisExample:
          "Credential flow: (1) Issuer signs (name, age, country, id) with BBS+ " +
          "using sk. Signature σ = 1/(sk+e) · (G1 + name·H1 + age·H2 + ...). " +
          "(2) User derives proof π disclosing only age ≥ 18. (3) Sui verifier " +
          "checks the pairing equation with the disclosed attributes and the proof.",
        history: {
          inventor: "Boneh, Boyen, Shacham (BBS+, 2004); Schnorr (1989)",
          year: 2004,
          context:
            "Schnorr signatures (1989) were the first efficient discrete-log " +
            "signatures, later standardized as EdDSA. BBS (Boneh-Boyen-Shacham, " +
            "2004) introduced short group signatures. The '+' variant by Au, " +
            "Susilo, and Mu (2006) added efficient multi-message signing and " +
            "selective disclosure, making it the standard for anonymous credentials.",
          funFact:
            "BBS+ signatures are being considered for the W3C Verifiable " +
            "Credentials standard and eIDAS 2.0. If adopted, every EU citizen's " +
            "digital wallet could use BBS+ for privacy-preserving identity proofs."
        },
        limitations: [
          "BBS+ requires pairing-friendly curves — cannot use ed25519 or secp256k1",
          "BBS+ is NOT post-quantum — broken by Shor's algorithm. Lattice-based " +
            "alternatives exist but are 100x larger (see lattice section)",
          "Selective disclosure proofs are larger than the original signature " +
            "(~300-500 bytes vs ~48 bytes) due to randomization commitments",
          "BBS+ verification is ~5x slower than Schnorr due to pairing operations"
        ],
        exercises: [
          {
            type: "code",
            question:
              "Implement a minimal Schnorr signature in arkworks BLS12-381: " +
              "keygen, sign, verify. Use Blake2s as the hash function. Test with " +
              "a simple message.",
            hint:
              "sk = Fr::rand(&mut rng), pk = G1Projective::generator() * sk. " +
              "Sign: k = Fr::rand(), R = g*k, c = hash(R || pk || msg) as Fr, " +
              "s = k - c*sk. Verify: g*s + pk*c == R.",
            answer:
              "let g = G1Projective::generator();\n" +
              "let sk = Fr::rand(&mut rng);\n" +
              "let pk = g * sk;\n" +
              "// Sign\n" +
              "let k = Fr::rand(&mut rng);\n" +
              "let r = g * k;\n" +
              "let c = hash_to_fr(&[r, pk, msg]); // Blake2s → Fr\n" +
              "let s = k - c * sk;\n" +
              "// Verify\n" +
              "assert_eq!(g * s + pk * c, r);"
          }
        ]
      },

      /* ───────── Groth16 Circuit Writing ───────── */
      {
        name: "Groth16 Circuit Writing (arkworks R1CS + Circom)",
        analogy:
          "Writing a ZK circuit is like writing a tax form that proves your income " +
          "is above a threshold without showing the actual number. The form has " +
          "boxes (variables), rules (constraints), and a final checkbox (output). " +
          "The trick: every rule must be a simple multiplication — A × B = C. " +
          "Any computation can be broken down into these simple multiplications, " +
          "but the skill is doing it efficiently.",
        diagram:
          '┌─────────────────────────────────────────────────────┐\n' +
          '│       Two Ways to Write ZK Circuits                 │\n' +
          '├─────────────────────────────────────────────────────┤\n' +
          '│                                                     │\n' +
          '│  ARKWORKS (Rust, low-level R1CS)                    │\n' +
          '│  ┌───────────────────────────────────────┐          │\n' +
          '│  │ impl ConstraintSynthesizer<Fr> {      │          │\n' +
          '│  │   fn generate_constraints(self, cs) { │          │\n' +
          '│  │     let x = FpVar::new_witness(..);   │          │\n' +
          '│  │     let y = &x * &x;  // x^2          │          │\n' +
          '│  │     y.enforce_equal(&pub_input)?;      │          │\n' +
          '│  │   }                                   │          │\n' +
          '│  │ }                                      │          │\n' +
          '│  └───────────────────────────────────────┘          │\n' +
          '│  → Compiles to R1CS directly in Rust                │\n' +
          '│  → Full control, type-safe, integrated with Sonobe  │\n' +
          '│                                                     │\n' +
          '│  CIRCOM (DSL, higher-level)                         │\n' +
          '│  ┌───────────────────────────────────────┐          │\n' +
          '│  │ template Square() {                   │          │\n' +
          '│  │   signal input x;                     │          │\n' +
          '│  │   signal output y;                    │          │\n' +
          '│  │   y <== x * x;                        │          │\n' +
          '│  │ }                                      │          │\n' +
          '│  └───────────────────────────────────────┘          │\n' +
          '│  → Compiles to R1CS via circom compiler             │\n' +
          '│  → Easier syntax, large library (circomlib)         │\n' +
          '│  → Proofs via snarkjs (JS) or rapidsnark (C++)     │\n' +
          '│                                                     │\n' +
          '│  THESIS: arkworks for Sonobe/folding pipeline       │\n' +
          '│          Circom for standalone credential circuits   │\n' +
          '└─────────────────────────────────────────────────────┘',
        keyPoints: [
          "R1CS: every constraint is A · B = C where A, B, C are linear " +
            "combinations of witness variables. One multiplication = one constraint",
          "arkworks: implement ConstraintSynthesizer<F> trait. Use FpVar " +
            "(high-level) or cs.new_witness_variable() + lc!() macro (low-level). " +
            "Compile to ark-groth16 for proving",
          "Circom: signal = variable, <== = assign + constrain, <-- = assign only " +
            "(dangerous: no constraint!). template = reusable component. " +
            "circomlib provides Poseidon, MerkleProof, EdDSA, Pedersen templates",
          "Constraint cost: addition is free (linear combination), multiplication " +
            "costs 1 constraint. Hash functions dominate cost: SHA-256 = ~27K " +
            "constraints, Poseidon = ~250 constraints",
          "arkworks advantages: type-safe Rust, integrated with Sonobe folding, " +
            "direct access to curve operations. Circom advantages: faster " +
            "prototyping, huge template library, snarkjs/rapidsnark ecosystem"
        ],
        connections:
          "The thesis uses both: arkworks R1CS for the Sonobe folding pipeline " +
          "(credential verification as a folding step), and Circom for standalone " +
          "circuit prototyping. Understanding both is essential for choosing the " +
          "right tool for each sub-circuit.",
        thesisExample:
          "The credential verification circuit in arkworks: (1) allocate BBS+ " +
          "signature as witness, (2) recompute the pairing equation in-circuit " +
          "using ark-r1cs-std gadgets, (3) enforce equality with the public " +
          "verification result. This circuit is ~100K constraints and feeds " +
          "into Sonobe's Nova folding as one step.",
        history: {
          inventor: "Jens Groth (Groth16, 2016); iden3 team (Circom, 2018)",
          year: 2016,
          context:
            "Groth16 (EUROCRYPT 2016) achieved the smallest proof size and " +
            "fastest verification for R1CS-based SNARKs — still unbeaten in 2026. " +
            "Circom was created by the iden3 team (Jordi Baylina) in 2018 to make " +
            "circuit writing accessible. It compiles to R1CS and integrates with " +
            "snarkjs for browser-based proving. circomlib (2019) provided standard " +
            "templates that became the de facto building blocks for ZK applications.",
          funFact:
            "Circom's <== operator does two things: assigns a value AND creates " +
            "a constraint. The <-- operator only assigns. Forgetting to add a " +
            "separate constraint after <-- is the #1 source of circuit bugs — " +
            "the prover can assign any value and the verifier won't catch it."
        },
        limitations: [
          "Groth16 requires a per-circuit trusted setup — changing the circuit " +
            "means redoing the ceremony. PLONK/Marlin avoid this with universal setup",
          "Circom lacks a type system — all signals are field elements. No " +
            "structs, no generics, no enums. Complex circuits get messy fast",
          "arkworks R1CS is verbose — a simple hash check takes 50+ lines in " +
            "Rust vs 5 lines in Circom. The tradeoff is safety vs productivity",
          "Neither approach handles non-field operations well — bit operations, " +
            "comparisons, and range checks require expensive bit decomposition"
        ],
        exercises: [
          {
            type: "code",
            question:
              "Write a Circom template that proves knowledge of a preimage: " +
              "given public hash h, prove you know secret x such that " +
              "Poseidon(x) = h. Then write the equivalent in arkworks.",
            hint:
              "Circom: include 'circomlib/poseidon.circom', use Poseidon(1) " +
              "template. arkworks: use ark-crypto-primitives PoseidonHash or " +
              "implement the sponge manually.",
            answer:
              "// CIRCOM\n" +
              "include \"circomlib/circuits/poseidon.circom\";\n" +
              "template PreimageProof() {\n" +
              "  signal input x;        // private\n" +
              "  signal input h;        // public\n" +
              "  component hasher = Poseidon(1);\n" +
              "  hasher.inputs[0] <== x;\n" +
              "  h === hasher.out;\n" +
              "}\n" +
              "component main {public [h]} = PreimageProof();"
          }
        ]
      },

      /* ───────── Merkle Trees + Poseidon ───────── */
      {
        name: "Merkle Trees & Poseidon Hash (arkworks + Circom)",
        analogy:
          "A Merkle tree is a tournament bracket for data. Each leaf is a player, " +
          "each internal node is the 'winner' (hash) of two children. The root " +
          "summarizes the entire dataset in one hash. To prove a leaf is in the " +
          "tree, you show only the path from leaf to root — O(log n) hashes, not " +
          "the entire tree. Poseidon is a hash function designed to be cheap inside " +
          "ZK circuits: ~250 constraints per hash vs ~27,000 for SHA-256. This is " +
          "a 100x difference that makes Merkle proofs practical in ZK.",
        diagram:
          '┌─────────────────────────────────────────────────────┐\n' +
          '│        Merkle Tree + Poseidon in ZK Circuits        │\n' +
          '├─────────────────────────────────────────────────────┤\n' +
          '│                                                     │\n' +
          '│  TREE STRUCTURE (depth 3, 8 leaves)                 │\n' +
          '│                    Root                              │\n' +
          '│                   /    \\                             │\n' +
          '│                 H01    H23                           │\n' +
          '│                / \\    / \\                           │\n' +
          '│              H0  H1  H2  H3                         │\n' +
          '│              |   |   |   |                          │\n' +
          '│             L0  L1  L2  L3  ...                     │\n' +
          '│                                                     │\n' +
          '│  MEMBERSHIP PROOF for L1:                           │\n' +
          '│  Path: [L0, H23] (sibling at each level)            │\n' +
          '│  Verify: H(H(L0,L1), H23) == Root ?                 │\n' +
          '│  Cost: depth × hash = 3 × 250 = 750 constraints    │\n' +
          '│                                                     │\n' +
          '│  HASH COST COMPARISON (per hash call)               │\n' +
          '│  SHA-256:   27,000 constraints  ████████████████     │\n' +
          '│  Poseidon:     250 constraints  █                   │\n' +
          '│  → Always use Poseidon inside ZK circuits!          │\n' +
          '│                                                     │\n' +
          '│  THESIS: credential Merkle tree uses Poseidon       │\n' +
          '│  Depth 20 = 2^20 credentials, proof = 20 hashes    │\n' +
          '│  Total: 20 × 250 = 5,000 constraints               │\n' +
          '└─────────────────────────────────────────────────────┘',
        keyPoints: [
          "Merkle tree: binary hash tree where root = H(H(L0,L1), H(L2,L3)). " +
            "Membership proof = sibling hashes along the path. Cost: O(log n) hashes",
          "Poseidon hash: designed for prime fields (BN254, BLS12-381). ~250 " +
            "constraints per hash in R1CS. Uses power-map S-boxes (x^5 or x^7) " +
            "instead of XOR/bit ops — native to field arithmetic",
          "arkworks: use ark-crypto-primitives::crh::poseidon for Poseidon. " +
            "MerkleTree and MerkleTreePath types handle tree construction and " +
            "proof generation. In-circuit verification via PathVar gadget",
          "Circom: circomlib provides Poseidon(n) and MerkleTreeInclusionProof(depth) " +
            "templates. Drop-in components for membership proofs",
          "Thesis tree: depth 20 → holds 2^20 (~1M) credentials. Membership " +
            "proof = 20 Poseidon hashes = ~5,000 constraints. Tiny compared to " +
            "the BBS+ verification (~100K constraints)"
        ],
        connections:
          "The credential Merkle tree is how the thesis tracks all issued " +
          "credentials on-chain without storing them in the clear. The root is " +
          "published on Sui. To prove credential validity, the user provides " +
          "a Merkle path (private) that connects their credential leaf to the " +
          "public root — all inside the ZK circuit.",
        thesisExample:
          "The credential circuit includes: (1) Poseidon hash of credential " +
          "attributes to get leaf, (2) Merkle path verification against the " +
          "on-chain root (20 Poseidon hashes = 5K constraints), (3) BBS+ " +
          "signature verification (~100K constraints). Total: ~105K constraints. " +
          "The Merkle path is a small fraction of the total circuit cost.",
        history: {
          inventor: "Ralph Merkle (trees, 1979); Grassi, Khovratovich et al. (Poseidon, 2019)",
          year: 2019,
          context:
            "Merkle trees were invented by Ralph Merkle in 1979 for his PhD thesis " +
            "and are used in nearly every blockchain (Bitcoin block headers, Ethereum " +
            "state trie). Poseidon was published at USENIX Security 2021 by Grassi, " +
            "Khovratovich, Rechberger, Roy, and Schofnegger, specifically designed " +
            "to minimize constraint count in arithmetic circuits. It replaced " +
            "MiMC and Rescue as the preferred ZK-friendly hash after its security " +
            "analysis was completed.",
          funFact:
            "Using SHA-256 inside a ZK circuit costs 27,000 constraints per hash. " +
            "A depth-20 Merkle proof with SHA-256 would cost 540,000 constraints — " +
            "more than the entire credential circuit. Poseidon reduces this to 5,000, " +
            "making the Merkle proof essentially free relative to BBS+ verification."
        },
        limitations: [
          "Poseidon is relatively new (~2019) and has had fewer years of " +
            "cryptanalysis than SHA-256. Some conservative applications still " +
            "prefer SHA-256 despite the cost",
          "Poseidon parameters (width, rounds, S-box) must match between " +
            "the off-chain tree builder and the in-circuit verifier — mismatch " +
            "is a silent bug that produces valid-looking but wrong proofs",
          "Merkle trees are append-only by default. Updating or deleting a leaf " +
            "requires recomputing the path — expensive for large trees. Indexed " +
            "Merkle trees solve this but add complexity",
          "The tree depth must be fixed at circuit compile time — cannot handle " +
            "variable-depth trees in a single circuit"
        ],
        exercises: [
          {
            type: "code",
            question:
              "Write a Circom circuit that verifies a Merkle membership proof " +
              "of depth 10 using Poseidon hash. Inputs: leaf (private), " +
              "pathElements[10] (private), pathIndices[10] (private), root (public). " +
              "The circuit should recompute the root from the leaf and path, " +
              "then enforce equality with the public root.",
            hint:
              "Use circomlib's Poseidon(2) for each level. At each level, " +
              "use pathIndices[i] to select which side the sibling goes on: " +
              "if index=0, hash(current, sibling); if index=1, hash(sibling, current). " +
              "Use a Mux to select left/right order.",
            answer:
              "include \"circomlib/circuits/poseidon.circom\";\n" +
              "template MerkleProof(depth) {\n" +
              "  signal input leaf;\n" +
              "  signal input pathElements[depth];\n" +
              "  signal input pathIndices[depth];\n" +
              "  signal input root;\n" +
              "  signal current[depth + 1];\n" +
              "  current[0] <== leaf;\n" +
              "  for (var i = 0; i < depth; i++) {\n" +
              "    component h = Poseidon(2);\n" +
              "    // if pathIndices[i]==0: h(current, sibling)\n" +
              "    // if pathIndices[i]==1: h(sibling, current)\n" +
              "    h.inputs[0] <== current[i] + pathIndices[i] * (pathElements[i] - current[i]);\n" +
              "    h.inputs[1] <== pathElements[i] + pathIndices[i] * (current[i] - pathElements[i]);\n" +
              "    current[i+1] <== h.out;\n" +
              "  }\n" +
              "  root === current[depth];\n" +
              "}\n" +
              "component main {public [root]} = MerkleProof(10);"
          }
        ]
      }
    ]
  }
};
