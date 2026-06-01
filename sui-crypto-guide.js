/**
 * On-Chain Cryptographic Primitives (Sui Move Natives) — Study Guide
 * Data file loaded by the study plan website.
 * Grounded in sui-framework sources/crypto/*.move (sui-source-mirror).
 */

window.SUICRYPTO_GUIDE = {
  block1: {
    title: "On-Chain Cryptographic Primitives (Sui Move Natives)",
    connectionsSummary:
      "Your thesis builds privacy payments on Sui (Veil), and the verifier side " +
      "of every zero-knowledge protocol you design will run inside a Move smart " +
      "contract. These six native modules — groth16, group_ops, bls12381, poseidon, " +
      "ecvrf, ecdsa_k1 — are the on-chain cryptographic surface area you will call " +
      "from Move: SNARK proof verification, BLS12-381/BN254 group arithmetic, " +
      "ZK-friendly Poseidon hashing for private Merkle trees, and signature checks. " +
      "Understanding their exact signatures, abort codes, and gas profile is the " +
      "difference between a design that verifies confidential transactions on-chain " +
      "and one that is too expensive or simply does not type-check. This is the " +
      "Move-side counterpart to fastcrypto (the Rust prover/host side) you will " +
      "touch during the Mysten internship (Sep 2026 - Mar 2027).",
    concepts: [
      {
        name: "sui::groth16 — SNARK Verifier Engine",
        analogy:
          "A bouncer with a magic stamp. The prover spent enormous effort building " +
          "a sealed envelope (the proof) that says 'I know a secret satisfying these " +
          "constraints' without revealing the secret. groth16 is the bouncer: it does " +
          "NOT re-do the prover's work — it runs a tiny, fixed-cost check (two elliptic " +
          "curve pairings) that is mathematically guaranteed to pass only if the secret " +
          "really exists. Even better, the bouncer pre-stamps part of the check once " +
          "(prepare_verifying_key) so every subsequent guest is verified faster.",
        diagram:
          '┌──────────────────────────────────────────────────────────┐\n' +
          '│                   sui::groth16 two-phase                 │\n' +
          '├──────────────────────────────────────────────────────────┤\n' +
          '│  Phase 1 (once, amortized):                              │\n' +
          '│    vk_bytes ──► prepare_verifying_key(curve, vk)         │\n' +
          '│              └─► PreparedVerifyingKey {                  │\n' +
          '│                    vk_gamma_abc_g1_bytes,                │\n' +
          '│                    alpha_g1_beta_g2_bytes,  ◄ precomputed│\n' +
          '│                    gamma_g2_neg_pc_bytes,     pairing    │\n' +
          '│                    delta_g2_neg_pc_bytes }               │\n' +
          '│                                                          │\n' +
          '│  Phase 2 (per proof):                                    │\n' +
          '│    PublicProofInputs (1..8 × 32-byte field elements)     │\n' +
          '│    ProofPoints  (A∈G1, B∈G2, C∈G1)                       │\n' +
          '│         │                                                │\n' +
          '│         ▼                                                │\n' +
          '│    verify_groth16_proof(curve, pvk, inputs, points)      │\n' +
          '│         │                                                │\n' +
          '│         ▼   e(A,B)·e(C,δ) == e(α,β)·e(Σ,γ)  ?            │\n' +
          '│       bool  (true ⟺ all circuit constraints hold)       │\n' +
          '└──────────────────────────────────────────────────────────┘',
        keyPoints: [
          "Curve selector: bls12381() → id 0, bn254() → id 1 (Curve { id: u8 })",
          "Two-phase: prepare_verifying_key(curve, vk) then verify_groth16_proof(...) → bool",
          "Public inputs capped at MaxPublicInputs = 8 field elements, 32 bytes each",
          "ProofPoints = (A in G1, B in G2, C in G1); accepts Arkworks-canonical bytes",
          "Aborts: EInvalidVerifyingKey(0), EInvalidCurve(1), ETooManyPublicInputs(2), EInvalidScalar(3)",
          "public_proof_inputs_from_bytes validates len % 32 == 0 and count ≤ 8; proof_points_from_bytes does NOT validate",
          "BN254 is the curve zkLogin and most Circom/snarkjs circuits target on-chain"
        ],
        connections:
          "groth16 is the on-chain endpoint of your Veil confidential-transaction " +
          "pipeline. The off-chain prover (Rust/arkworks or Circom) produces a proof " +
          "that a transaction is balanced and the spender knows the note's secret; the " +
          "Move contract calls verify_groth16_proof to accept or reject the state " +
          "update. The two-phase split matters for your gas budget: prepare the " +
          "verifying key once at deploy time and store the PreparedVerifyingKey, so " +
          "every confidential transfer pays only the per-proof pairing cost.",
        thesisExample:
          "In Veil you store a PreparedVerifyingKey (built from your circuit's vk) as " +
          "an immutable object. A confidential transfer entry function reconstructs " +
          "PublicProofInputs from the on-chain commitments + nullifier and ProofPoints " +
          "from the user-supplied proof, then asserts " +
          "verify_groth16_proof(&bn254(), &pvk, &inputs, &points). Only on true do you " +
          "insert the nullifier and update encrypted balances — the contract never " +
          "learns the amount.",
        history: {
          inventor: "Jens Groth (groth16 scheme); Mysten Labs / fastcrypto (Sui native binding)",
          year: 2016,
          context:
            "Jens Groth's 2016 paper 'On the Size of Pairing-based Non-interactive " +
            "Arguments' gave the smallest known zk-SNARK proof — three group elements " +
            "verified with a constant number of pairings — at the cost of a " +
            "circuit-specific trusted setup. Sui exposes it as a native because pairing " +
            "checks are far too expensive to implement in pure Move; the heavy lifting " +
            "happens in Rust (fastcrypto-zkp / arkworks) behind verify_groth16_proof_internal. " +
            "zkLogin, Sui's flagship use of Groth16, verifies a BN254 proof that an OAuth " +
            "JWT maps to an on-chain address.",
          funFact:
            "A groth16 proof is only ~200 bytes and verifies in milliseconds, no matter " +
            "how astronomically complex the statement being proven is."
        },
        limitations: [
          "Requires a circuit-specific trusted setup (the toxic-waste ceremony); a leaked " +
            "setup secret lets an attacker forge proofs",
          "Hard cap of 8 public inputs (MaxPublicInputs) — larger statements must pack " +
            "data into fewer field elements or use a different proof system",
          "Each pairing is expensive (~5-10M gas); full verification (two pairings) is on " +
            "the order of tens of millions of gas units — batch off-chain where possible",
          "proof_points_from_bytes performs no validation — malformed points surface only " +
            "as an EInvalidCurve/abort inside the native, so trust boundaries must be explicit",
          "Only BLS12-381 and BN254 are supported (EInvalidCurve otherwise)"
        ],
        exercises: [
          {
            type: "conceptual",
            question:
              "Why does sui::groth16 split verification into prepare_verifying_key and " +
              "verify_groth16_proof instead of a single call? What does the first phase " +
              "compute that the second reuses?",
            hint:
              "Read groth16.move lines 97-128. Look at what PreparedVerifyingKey stores: " +
              "alpha_g1_beta_g2_bytes is a precomputed pairing.",
            answer:
              "prepare_verifying_key canonicalizes the Arkworks verifying key and " +
              "precomputes the fixed pairing terms (notably e(alpha, beta) stored as " +
              "alpha_g1_beta_g2_bytes, plus the negated, prepared gamma and delta G2 " +
              "points). These depend only on the circuit, not the proof, so computing " +
              "them once and storing the PreparedVerifyingKey amortizes the cost across " +
              "every subsequent verify_groth16_proof call — each proof then pays only for " +
              "the proof-dependent pairings."
          },
          {
            type: "design",
            question:
              "Sketch the Move entry function for a Veil confidential transfer that uses " +
              "groth16. Which arguments come from chain state vs. the user, and where " +
              "exactly does the abort happen on a bad proof?",
            hint:
              "PublicProofInputs are derived from public on-chain data (commitments, " +
              "nullifier, root). ProofPoints are user-supplied. verify_groth16_proof " +
              "returns bool — you assert on it.",
            answer:
              "Store pvk: &PreparedVerifyingKey (deploy-time immutable). The entry fn " +
              "takes proof_bytes and public-input bytes from the caller, builds inputs = " +
              "public_proof_inputs_from_bytes(...) (which aborts ETooManyPublicInputs/" +
              "EInvalidScalar on malformed input) and points = proof_points_from_bytes(...). " +
              "Then assert!(verify_groth16_proof(&bn254(), pvk, &inputs, &points), E_BAD_PROOF). " +
              "Only after the assert do you add the nullifier to the set and apply the " +
              "balance update, so a forged proof reverts the whole transaction."
          }
        ]
      },
      {
        name: "sui::group_ops — Generic Group Arithmetic (Element<T>)",
        analogy:
          "A type-safe calculator for elliptic-curve points. The numbers inside are " +
          "opaque byte blobs that only the native Rust engine understands, but Move's " +
          "phantom type parameter T acts like a label on each calculator key: you " +
          "physically cannot add a G1 point to a G2 point, the compiler stops you. " +
          "Every operation (add, multiply, pairing) is forwarded to fastcrypto with a " +
          "one-byte 'type_' tag telling the engine which group it is working in.",
        diagram:
          '┌────────────────────────────────────────────────────────┐\n' +
          '│   Element<phantom T> { bytes: vector<u8> }             │\n' +
          '│   (phantom T = compile-time group; type_:u8 = runtime) │\n' +
          '├────────────────────────────────────────────────────────┤\n' +
          '│  from_bytes(type_, bytes, is_trusted) ─┐               │\n' +
          '│     if !is_trusted → internal_validate │               │\n' +
          '│                                        ▼               │\n' +
          '│  add / sub        e1 ⊕ e2,  e1 ⊖ e2                    │\n' +
          '│  mul / div        s · e,    (1/s) · e                  │\n' +
          '│  hash_to(type_,m) deterministic hash-to-curve         │\n' +
          '│  multi_scalar_multiplication(scalars[], elems[])      │\n' +
          '│       Σ sᵢ·eᵢ   (assert len>0, len==len, len≤32)      │\n' +
          '│  pairing<G1,G2,G3>(e1,e2) → Element<G3> (target GT)   │\n' +
          '│  sum(terms[])     ⊕ᵢ terms[i]                         │\n' +
          '│  convert<From,To> e.g. G1 → UncompressedG1            │\n' +
          '│         │                                              │\n' +
          '│         ▼  every op delegates to fastcrypto native    │\n' +
          '└────────────────────────────────────────────────────────┘',
        keyPoints: [
          "Core type: Element<phantom T> { bytes: vector<u8> } — phantom T = compile-time group safety",
          "from_bytes(type_, bytes, is_trusted): validates via internal_validate when !is_trusted, else stores opaquely",
          "add/sub/mul/div: group law and scalar mul/div; div aborts on scalar = 0 (field inversion failure)",
          "multi_scalar_multiplication: asserts non-empty, equal lengths, ≤ 32 elements (EInputTooLong)",
          "pairing<G1,G2,G3>(type_, e1, e2): bilinear map into target group GT",
          "convert<From,To>: space/time tradeoff projection (e.g. compressed ↔ uncompressed)",
          "Errors: ENotSupported(0), EInvalidInput(1), EInputTooLong(2), EInvalidBufferLength(3)"
        ],
        connections:
          "group_ops is the arithmetic substrate beneath everything pairing-based in " +
          "your thesis. Pedersen commitments (C = v·G + r·H), commitment homomorphism, " +
          "and multi-scalar multiplication for aggregating openings all bottom out in " +
          "these calls. When you write Veil's commitment logic in Move rather than " +
          "calling a higher-level wrapper, group_ops is the API you use directly, with " +
          "bls12381's typed constants supplying the generators.",
        thesisExample:
          "To form a Veil Pedersen commitment in Move you compute " +
          "group_ops::add(G1_TYPE, &group_ops::mul(...value·G...), &group_ops::mul(...r·H...)). " +
          "To verify a batched opening of N commitments you use " +
          "multi_scalar_multiplication(G1_TYPE, &coeffs, &basis_points) — one native call " +
          "evaluating Σ coeffᵢ·pointᵢ, which is dramatically cheaper than N separate muls " +
          "and keeps your confidential-transfer verification under the gas ceiling.",
        history: {
          inventor: "Mysten Labs (group_ops Move module over fastcrypto)",
          year: 2023,
          context:
            "group_ops was added to expose fastcrypto's generic group abstraction to " +
            "Move so that higher-level modules (bls12381, and future curves) need not " +
            "each re-implement add/mul/pairing. The design mirrors fastcrypto's Rust " +
            "GroupElement / Scalar traits: a single byte buffer plus a type discriminator, " +
            "with all real math in audited Rust. The 32-element MSM cap reflects a " +
            "gas/DoS limit that has been raised over time as metering matured.",
          funFact:
            "Move's phantom types give you compile-time group discipline for free even " +
            "though, at runtime, every Element is just an indistinguishable vector<u8>."
        },
        limitations: [
          "The phantom type T and the runtime type_: u8 are NOT cross-checked by Move — " +
            "passing a G1 byte buffer with G2_TYPE is the caller's responsibility and " +
            "aborts only inside the native",
          "multi_scalar_multiplication is capped at 32 elements (EInputTooLong) — larger " +
            "batches must be split, partially defeating MSM's efficiency",
          "All bytes are opaque on-chain; you cannot inspect or branch on point coordinates in Move",
          "div / scalar inversion aborts on zero with a native (non-named) failure, so guard divisors yourself",
          "Validation is skipped entirely when is_trusted = true — a footgun if the source is not actually trusted"
        ],
        exercises: [
          {
            type: "comparison",
            question:
              "Compare calling group_ops::mul N times and summing, versus a single " +
              "multi_scalar_multiplication. What does the MSM win on, and what is the " +
              "hard constraint you must respect?",
            hint:
              "See group_ops.move multi_scalar_multiplication (asserts on length and the " +
              "32-element cap). Think about both gas and the number of native crossings.",
            answer:
              "MSM computes Σ sᵢ·eᵢ in one native call using Shamir's/Pippenger-style " +
              "batching, far cheaper than N independent scalar muls plus N-1 adds, and it " +
              "crosses the Move↔native boundary once. The hard constraint: scalars and " +
              "elements vectors must be equal length, non-empty, and ≤ 32 elements, or it " +
              "aborts (EInputTooLong). Batches over 32 must be chunked and the partial " +
              "results summed."
          },
          {
            type: "design",
            question:
              "You need a Pedersen commitment C = v·G + r·H on G1 in Move. Which " +
              "group_ops calls do you chain, and what supplies G and H?",
            hint:
              "bls12381 exposes g1_generator(); H is an independent generator (hash-to-curve " +
              "or a fixed constant). mul takes a scalar Element and a group Element.",
            answer:
              "Compute t1 = group_ops::mul(G1_TYPE, &v_scalar, &G) and t2 = " +
              "group_ops::mul(G1_TYPE, &r_scalar, &H), then C = group_ops::add(G1_TYPE, &t1, &t2). " +
              "G comes from bls12381::g1_generator(); H must be a second generator with " +
              "unknown discrete log w.r.t. G, e.g. derived via hash_to(G1_TYPE, domain_sep) " +
              "so no one knows logG(H)."
          }
        ]
      },
      {
        name: "sui::bls12381 — Typed BLS12-381 Curve Operations",
        analogy:
          "The fully-labeled, ready-to-use edition of the group_ops calculator, " +
          "specialized for the BLS12-381 curve. Instead of passing raw type tags, you " +
          "get named keys: scalar_add, g1_mul, g2_generator, pairing. Each Scalar, G1, " +
          "G2, GT is its own Move type so the compiler enforces the algebra, and the " +
          "module ships the exact generator and identity constants so you never " +
          "hand-encode a curve point.",
        diagram:
          '┌──────────────────────────────────────────────────────────┐\n' +
          '│              BLS12-381 typed algebra                     │\n' +
          '├──────────────────────────────────────────────────────────┤\n' +
          '│  Scalar (Fr, 32B)  G1 (48B)  G2 (96B)  GT (≈384B)        │\n' +
          '│                    UncompressedG1 (space↔time)           │\n' +
          '│                                                          │\n' +
          '│  Field:  scalar_add/sub/mul/div/neg/inv (inv,div ⊥ 0)    │\n' +
          '│  G1:     g1_add/sub/mul/div/neg, hash_to_g1,             │\n' +
          '│          g1_multi_scalar_multiplication (≤32),           │\n' +
          '│          g1_to_uncompressed_g1                           │\n' +
          '│  G2:     g2_add/sub/mul/div/neg, hash_to_g2, g2_msm      │\n' +
          '│  GT:     gt_add/sub/mul/div/neg                          │\n' +
          '│                                                          │\n' +
          '│  pairing(g1, g2) ──► gt   (one pairing, ~5-10M gas)      │\n' +
          '│                                                          │\n' +
          '│  Native sig verify (NOT Element-based):                  │\n' +
          '│   bls12381_min_sig_verify(sig 48B/G1, pk 96B/G2, msg)    │\n' +
          '│   bls12381_min_pk_verify (sig 96B/G2, pk 48B/G1, msg)    │\n' +
          '└──────────────────────────────────────────────────────────┘',
        keyPoints: [
          "Type tags: SCALAR=0, G1=1, G2=2, GT=3, UNCOMPRESSED_G1=4 — sizes 32/48/96/≈384 bytes",
          "Ships generator + identity byte constants for Scalar, G1, G2, GT (big-endian)",
          "Field ops scalar_div/scalar_inv and the *_div ops abort on zero (field inversion failure)",
          "hash_to_g1 / hash_to_g2 use DST BLS_SIG_BLS12381G{1,2}_XMD:SHA-256_SSWU_RO_NUL_",
          "g1/g2_multi_scalar_multiplication abort when len > 32",
          "pairing(e1: &Element<G1>, e2: &Element<G2>) → Element<GT> — single on-chain pairing",
          "Native bls12381_min_sig_verify (sig on G1) and bls12381_min_pk_verify (sig on G2) for raw signature checks"
        ],
        connections:
          "BLS12-381 is the native curve for Groth16 over BLS and the standard curve for " +
          "threshold and aggregatable signatures. For your thesis, this module is how " +
          "Veil's multi-party / auditor protocols verify BLS signatures on-chain, and " +
          "how you compose typed commitments and pairing checks without dropping to raw " +
          "group_ops byte tags. The min_sig / min_pk split lets you choose where the " +
          "signature lives (small G1 vs small G2) to optimize for verification cost vs. " +
          "key size.",
        thesisExample:
          "If Veil uses a committee (e.g. an auditor set or a threshold decryptor), each " +
          "member signs an attestation with BLS and you verify the aggregate on-chain " +
          "with bls12381_min_sig_verify(&agg_sig, &agg_pk, &msg). For commitment " +
          "aggregation you call g1_multi_scalar_multiplication(&opening_coeffs, " +
          "&commitment_points) to fold many Pedersen openings into one G1 element, then " +
          "check a single pairing(folded_g1, vk_g2) against the expected target.",
        history: {
          inventor: "Sean Bowe / Zcash (BLS12-381 curve); Boneh-Lynn-Shacham (BLS signatures)",
          year: 2017,
          context:
            "BLS12-381 was designed by Sean Bowe at Zcash in 2017 as a pairing-friendly " +
            "curve with ~128-bit security and a large, smooth subgroup ideal for FFT-based " +
            "SNARK provers. It became the de-facto standard for Ethereum 2.0, Filecoin, " +
            "and Sui. The signature scheme (Boneh, Lynn, Shacham, 2001) is uniquely " +
            "aggregatable: many signatures over many messages collapse into one. Sui's " +
            "module wraps fastcrypto's blst backend.",
          funFact:
            "min_sig vs min_pk is a literal space tradeoff: put the signature on the " +
            "48-byte G1 (cheap to store/transmit, e.g. for high-volume signatures) or on " +
            "the 96-byte G2, swapping which object is small."
        },
        limitations: [
          "A single on-chain pairing costs ~5-10M gas; pairing-heavy logic gets expensive fast",
          "GT elements are ~384 bytes uncompressed — storing or moving them on-chain is costly",
          "MSM still capped at 32 elements per call (same fastcrypto limit as group_ops)",
          "Signature verify natives take raw byte vectors with no length pre-check in Move — " +
            "wrong-length inputs abort inside the native, not with a friendly Move error",
          "The phantom-typed API prevents type confusion in Move but not malleability of the " +
            "underlying encoding — you must still feed canonical, subgroup-checked bytes"
        ],
        exercises: [
          {
            type: "comparison",
            question:
              "When would you choose bls12381_min_sig_verify over bls12381_min_pk_verify? " +
              "What lives on G1 vs G2 in each, and how does that map to a real cost decision?",
            hint:
              "G1 points are 48 bytes, G2 points are 96 bytes. Think about which artifact " +
              "you produce in bulk: many signatures, or many public keys.",
            answer:
              "min_sig puts the signature on G1 (48B) and the public key on G2 (96B); " +
              "min_pk reverses it (sig on G2 96B, pk on G1 48B). Choose min_sig when you " +
              "store/transmit many signatures and few keys (signatures are the small, hot " +
              "object) — common for high-throughput attestations. Choose min_pk when public " +
              "keys dominate storage and you want them compact. Both use SHA-256 SSWU " +
              "hash-to-curve with the matching DST."
          },
          {
            type: "design",
            question:
              "Express a Pedersen-style commitment and its homomorphic addition using only " +
              "bls12381 typed functions, and explain why the addition of two commitments " +
              "still opens correctly.",
            hint:
              "Use g1_mul for v·G and r·H, g1_add to combine. Homomorphism: C1 + C2 commits " +
              "to (v1+v2) with blinding (r1+r2).",
            answer:
              "C = g1_add(g1_mul(v, G), g1_mul(r, H)) with G = g1_generator() and H a second " +
              "generator. Because the group law is the elliptic-curve point addition, " +
              "g1_add(C1, C2) = (v1+v2)·G + (r1+r2)·H, i.e. a commitment to the summed value " +
              "with the summed blinding. This homomorphism is exactly what lets a " +
              "confidential transfer prove inputs = outputs by checking that the commitments " +
              "balance, without revealing any amount."
          }
        ]
      },
      {
        name: "sui::poseidon — ZK-Friendly Hash (BN254)",
        analogy:
          "A hash function that 'speaks the same language' as a SNARK circuit. Normal " +
          "hashes (SHA, Keccak) shuffle bits — cheap on a CPU but a nightmare to prove " +
          "in zero-knowledge, where every bit operation explodes into constraints. " +
          "Poseidon instead does pure field arithmetic (add and multiply over BN254), " +
          "so the same Merkle tree you build on-chain with poseidon_bn254 can be proven " +
          "inside a Groth16 circuit with a tiny number of constraints. It is the hash " +
          "that lets on-chain state and off-chain proofs agree cheaply.",
        diagram:
          '┌────────────────────────────────────────────────────────┐\n' +
          '│  poseidon_bn254(data: &vector<u256>) → u256            │\n' +
          '├────────────────────────────────────────────────────────┤\n' +
          '│  data = [x₁, x₂, …, xₙ]   (1 ≤ n ≤ 16 scalars)         │\n' +
          '│     │                                                  │\n' +
          '│     ├─ assert n > 0           ........ EEmptyInput     │\n' +
          '│     ├─ assert n ≤ 16          ........ ETooManyInputs  │\n' +
          '│     └─ ∀ xᵢ: assert xᵢ < BN254_MAX  .. ENonCanonical   │\n' +
          '│           │   (BN254 field modulus, ~2.5×10⁷⁶)         │\n' +
          '│           ▼   bcs::to_bytes (little-endian u256)       │\n' +
          '│     poseidon_bn254_internal(&[bytes])  (native sponge) │\n' +
          '│           │                                            │\n' +
          '│           ▼   bcs peel_u256                            │\n' +
          '│         u256   (single field-element digest)          │\n' +
          '└────────────────────────────────────────────────────────┘',
        keyPoints: [
          "Signature: public fun poseidon_bn254(data: &vector<u256>): u256",
          "MAX_INPUTS = 16 scalars per call; at least 1 required",
          "Every input must be < BN254_MAX (21888242871839275222246405745257275088548364400416034343698204186575808495617)",
          "Aborts: ENonCanonicalInput(0), EEmptyInput(1), ETooManyInputs(2)",
          "Inputs are BCS-serialized little-endian u256, hashed by native sponge, parsed back to u256",
          "Arithmetic-friendly (no bitwise ops) → far cheaper to prove in-circuit than Keccak/SHA",
          "BN254 field matches Circom/snarkjs and zkLogin's curve, so on-chain and in-circuit hashes agree"
        ],
        connections:
          "Poseidon is the backbone of every private Merkle tree in your thesis. Veil's " +
          "note commitments and nullifier accumulators are Poseidon hashes: the same " +
          "function computes leaf/root on-chain (poseidon_bn254) and inside the Groth16 " +
          "circuit that proves membership. Using a ZK-friendly hash is what keeps your " +
          "membership proofs small enough to verify on Sui — a Keccak Merkle path would " +
          "blow up the circuit's constraint count by orders of magnitude.",
        thesisExample:
          "A Veil note leaf is leaf = poseidon_bn254(&vector[amount, blinding, " +
          "recipient_pk]). The contract maintains a Poseidon Merkle accumulator; on " +
          "deposit it recomputes the root with poseidon_bn254 up the path and stores it. " +
          "When spending, the user proves in Groth16 'I know a leaf in the tree with this " +
          "nullifier' — and because the in-circuit hash is the identical Poseidon over " +
          "BN254, the on-chain root and the proven root are guaranteed to match.",
        history: {
          inventor: "Grassi, Khovratovich, Rechberger, Roy, Schofnegger (Poseidon)",
          year: 2019,
          context:
            "Poseidon (USENIX Security 2021, ePrint 2019/458) was designed specifically " +
            "for zero-knowledge proof systems and the prime fields they operate over. Its " +
            "round function uses x^5 S-boxes and an MDS mixing layer — operations that are " +
            "native field multiplications, so a hash that costs thousands of gates as " +
            "Keccak costs a few hundred constraints as Poseidon. Sui exposes the BN254 " +
            "instantiation because BN254 is the curve used by zkLogin and most deployed " +
            "Circom circuits.",
          funFact:
            "The same Poseidon hash can be a one-liner in a Circom circuit and a single " +
            "native call in Move, which is exactly why on-chain and in-circuit Merkle " +
            "roots line up bit-for-bit."
        },
        limitations: [
          "Limited to BN254 — if your circuit uses BLS12-381's scalar field, this native does not apply",
          "MAX_INPUTS = 16 per call; wider arities must be hashed in a tree/sponge of multiple calls",
          "Inputs must be canonical (< field modulus) or it aborts ENonCanonicalInput — caller must reduce",
          "Younger and less battle-tested than SHA-2/Keccak; security rests on algebraic cryptanalysis assumptions",
          "Parameter choice (round counts) is security-critical; you rely on Sui shipping vetted constants"
        ],
        exercises: [
          {
            type: "conceptual",
            question:
              "Why is Poseidon preferred over Keccak256 for the Merkle trees in a " +
              "ZK privacy payment system, even though Keccak is faster on a normal CPU?",
            hint:
              "The bottleneck is not on-chain hashing speed — it is the constraint count " +
              "when you prove a Merkle path inside a SNARK. Poseidon is pure field arithmetic.",
            answer:
              "Inside a SNARK, cost is measured in constraints, not CPU cycles. Keccak's " +
              "bitwise and-or-xor operations map to thousands of constraints per hash because " +
              "the prover must bit-decompose field elements. Poseidon is built from field " +
              "additions and x^5 multiplications native to the proof system, costing a few " +
              "hundred constraints. Since proving Merkle membership requires hashing the " +
              "whole path in-circuit, Poseidon shrinks the circuit (and proving time) by " +
              "orders of magnitude, while still being computable on-chain via poseidon_bn254."
          },
          {
            type: "calculation",
            question:
              "You call poseidon_bn254 with a vector containing a u256 equal to BN254_MAX. " +
              "What happens, and how do you make the input valid?",
            hint:
              "Read poseidon.move lines 38-47: assert!(*e < BN254_MAX, ENonCanonicalInput).",
            answer:
              "It aborts with ENonCanonicalInput (code 0), because the check is strict " +
              "less-than: the value must be a canonical field element in [0, BN254_MAX). To " +
              "fix it, reduce the value modulo BN254_MAX before passing it (x mod p), so it " +
              "lands strictly below the modulus."
          }
        ]
      },
      {
        name: "sui::ecvrf — Verifiable Random Function (Ristretto255)",
        analogy:
          "A tamper-proof dice machine with a receipt. A holder of a secret key can " +
          "produce a random-looking output from any input seed, plus a proof that this " +
          "exact output is the unique correct one for that seed and their public key. " +
          "Anyone can check the receipt (ecvrf_verify) but no one — not even the key " +
          "holder — can choose a different output. Unpredictable before reveal, " +
          "verifiable after.",
        diagram:
          '┌──────────────────────────────────────────────────────────┐\n' +
          '│  ecvrf_verify(hash, alpha_string, public_key, proof)→bool│\n' +
          '├──────────────────────────────────────────────────────────┤\n' +
          '│  alpha_string  ─ input seed                              │\n' +
          '│  public_key    ─ Ristretto255 point (32 bytes)           │\n' +
          '│  proof         ─ VRF proof (80 bytes)                    │\n' +
          '│  hash          ─ claimed VRF output (64 bytes)           │\n' +
          '│        │                                                 │\n' +
          '│        ▼  native reconstructs proof point and            │\n' +
          '│           checks challenge derived from alpha_string     │\n' +
          '│        ▼                                                 │\n' +
          '│      bool   true ⟺ hash is THE unique output for         │\n' +
          '│             (alpha_string, public_key)                   │\n' +
          '│  Aborts: EInvalidHashLength(1) ≠64B,                     │\n' +
          '│          EInvalidPublicKeyEncoding(2),                   │\n' +
          '│          EInvalidProofEncoding(3)                        │\n' +
          '└──────────────────────────────────────────────────────────┘',
        keyPoints: [
          "Single native: public native fun ecvrf_verify(hash, alpha_string, public_key, proof): bool",
          "hash = 64-byte VRF output; public_key = 32-byte Ristretto255 point; proof = 80 bytes",
          "Aborts: EInvalidHashLength(1), EInvalidPublicKeyEncoding(2), EInvalidProofEncoding(3)",
          "Deterministic + unique: one valid output per (seed, key) pair, but unpredictable without the secret key",
          "Ristretto255 (Edwards) arithmetic — no pairings, so far cheaper than BLS/Groth16",
          "Useful for on-chain lotteries / commit-reveal where randomness must be proven, not trusted"
        ],
        connections:
          "ECVRF is tangential to the core privacy-payment thesis (it reveals a public " +
          "key and provides far less than a zero-knowledge proof), but it is the right " +
          "tool whenever your design needs verifiable, unbiasable randomness without " +
          "paying for pairings — e.g. selecting an auditor committee, randomizing a " +
          "decoy set, or any commit-reveal sub-protocol where a party must prove its " +
          "randomness was honestly derived from a committed seed.",
        thesisExample:
          "If a Veil extension randomly samples which notes go into a privacy set (decoy " +
          "selection) and must prove the sampling was unbiased, a coordinator with a " +
          "registered Ristretto255 public key produces output = VRF(seed) and the " +
          "contract calls ecvrf_verify(&output, &seed, &pubkey, &proof) before accepting " +
          "the derived selection — guaranteeing the set was not grinded to deanonymize a " +
          "target.",
        history: {
          inventor: "Micali, Rabin, Vadhan (VRF concept); IRTF CFRG draft (ECVRF)",
          year: 1999,
          context:
            "Verifiable Random Functions were introduced by Micali, Rabin, and Vadhan in " +
            "1999. ECVRF is the elliptic-curve instantiation standardized by the IRTF CFRG " +
            "(RFC 9381). Sui's variant uses the Ristretto255 group — a prime-order quotient " +
            "of Curve25519 that removes cofactor pitfalls — making proofs compact and " +
            "verification cheap relative to pairing-based schemes. It backs use cases like " +
            "Algorand-style leader election and on-chain randomness beacons.",
          funFact:
            "Unlike a plain signature, a VRF output is unique: even the secret-key holder " +
            "cannot produce two different valid outputs for the same input, which is what " +
            "makes it unbiasable."
        },
        limitations: [
          "Reveals the prover's public key — provides verifiability, not anonymity, so it is " +
            "a poor fit for the privacy core of the thesis",
          "Randomness quality depends on the secret key staying secret; a leaked key makes " +
            "future outputs predictable",
          "Strict encodings: 64-byte hash, 32-byte key, 80-byte proof, or it aborts",
          "A single trusted producer can still withhold (refuse to reveal) — VRF prevents " +
            "biasing the value but not censorship of it",
          "Lower-level than Sui's native on-chain randomness (sui::random); for general dApp " +
            "randomness that beacon is usually the better default"
        ],
        exercises: [
          {
            type: "conceptual",
            question:
              "What property does ECVRF give you that a normal digital signature over the " +
              "same seed does not, and why does that property matter for fair randomness?",
            hint:
              "Think about uniqueness. Many valid signatures can exist for one message; how " +
              "many valid VRF outputs exist for one (seed, key)?",
            answer:
              "ECVRF outputs are unique: for a given (alpha_string, public_key) there is " +
              "exactly one valid VRF output, and the proof certifies it. A signature scheme " +
              "may admit many valid signatures for one message (malleability/randomized " +
              "signing), so the signer could grind for a favorable value. Uniqueness means " +
              "the key holder cannot bias the result — they get exactly one output per seed " +
              "— which is precisely what fair, unbiasable on-chain randomness requires."
          },
          {
            type: "design",
            question:
              "Why is ECVRF a weaker privacy tool than Groth16 for the thesis, and in what " +
              "narrow role could it still appear in a Veil-style system?",
            hint:
              "ecvrf_verify takes the public_key in the clear. Compare to a SNARK that " +
              "reveals nothing about secrets.",
            answer:
              "ecvrf_verify exposes the producer's public key and proves a statement about " +
              "randomness, not a zero-knowledge statement about hidden balances or " +
              "identities — so it leaks the actor and offers no confidentiality of values. " +
              "Its narrow useful role is supplying verifiable, unbiasable randomness for " +
              "auxiliary mechanisms: decoy/anonymity-set selection, committee sampling, or " +
              "commit-reveal sequencing, where you need provable fairness but not secrecy."
          }
        ]
      },
      {
        name: "sui::ecdsa_k1 — secp256k1 ECDSA & Recovery",
        analogy:
          "A passport-control desk for Bitcoin/Ethereum signatures. secp256k1 is the " +
          "curve those chains sign with, and this module lets a Sui contract check such " +
          "signatures natively. ecrecover is the clever party trick: from a signature " +
          "plus a one-byte recovery hint it reconstructs the signer's public key (and " +
          "hence their Ethereum address) directly — no separately-supplied key needed.",
        diagram:
          '┌──────────────────────────────────────────────────────────┐\n' +
          '│                 sui::ecdsa_k1 (secp256k1)                │\n' +
          '├──────────────────────────────────────────────────────────┤\n' +
          '│  secp256k1_ecrecover(sig 65B, msg, hash) → pubkey 65B    │\n' +
          '│     sig = (r,s,v)  hash: KECCAK256=0 | SHA256=1           │\n' +
          '│     ⊥ EFailToRecoverPubKey(0), EInvalidSignature(1)      │\n' +
          '│                                                          │\n' +
          '│  decompress_pubkey(33B) → 65B   (02/03 → 04‖X‖Y)         │\n' +
          '│     ⊥ EInvalidPubKey(2)                                  │\n' +
          '│                                                          │\n' +
          '│  secp256k1_verify(sig 64B, pubkey 33B, msg, hash)→ bool  │\n' +
          '│     non-recoverable (r,s); silent false on bad sig       │\n' +
          '│                                                          │\n' +
          '│  test-only: secp256k1_sign(...), keypair_from_seed(...)  │\n' +
          '└──────────────────────────────────────────────────────────┘',
        keyPoints: [
          "secp256k1_ecrecover(sig, msg, hash): 65-byte sig (r,s,v) + raw msg → 65-byte uncompressed pubkey",
          "Hash selector: KECCAK256 = 0, SHA256 = 1 (msg is hashed inside, not pre-hashed)",
          "secp256k1_verify(sig, pubkey, msg, hash): 64-byte (r,s) sig + 33-byte compressed key → bool (silent false)",
          "decompress_pubkey: 33-byte compressed (02/03 parity) → 65-byte uncompressed; aborts EInvalidPubKey",
          "Aborts: EFailToRecoverPubKey(0), EInvalidSignature(1), EInvalidPubKey(2)",
          "secp256k1_sign and secp256k1_keypair_from_seed are test-only (#[test_only]) — never for production",
          "Ethereum-compatible: recover address by hashing the recovered pubkey"
        ],
        connections:
          "ecdsa_k1 is minor for the confidential-payment core (ECDSA reveals the public " +
          "key and offers no privacy), but central to interoperability features your " +
          "thesis may need: account abstraction and social recovery using existing " +
          "Bitcoin/Ethereum keys, or bridged attestations where an off-chain or " +
          "other-chain signature must be proven on Sui. It is the bridge between Sui's " +
          "native identity model and the secp256k1 world.",
        thesisExample:
          "If Veil offers social recovery where a guardian signs with their existing " +
          "Ethereum wallet, the recovery entry function calls " +
          "secp256k1_ecrecover(&guardian_sig, &recovery_msg, KECCAK256) and compares the " +
          "Keccak hash of the recovered pubkey against the registered guardian address — " +
          "letting users reuse MetaMask keys to authorize a Sui-side action without " +
          "exposing any payment secrets.",
        history: {
          inventor: "Certicom (secp256k1 parameters); ANSI/SEC ECDSA standard",
          year: 2000,
          context:
            "secp256k1 is the Koblitz curve specified by Certicom's SEC 2 (2000) and made " +
            "famous by Bitcoin, which Satoshi chose for its efficient endomorphism-based " +
            "speedups. Ethereum inherited it, and ecrecover became a workhorse opcode there. " +
            "Sui exposes the same primitives via fastcrypto's k256 backend so Move contracts " +
            "can validate cross-chain signatures. The recovery ID v ∈ {0,1,2,3} encodes " +
            "which of the candidate points is the true public key.",
          funFact:
            "ecrecover is why Ethereum can derive 'who signed this' from a signature alone — " +
            "the public key is literally recovered from the (r, s, v) tuple plus the message."
        },
        limitations: [
          "ECDSA reveals the signer's public key — no privacy, so unsuitable for the " +
            "confidential core of a privacy payment system",
          "secp256k1_verify fails silently (returns false) rather than aborting — easy to " +
            "forget to check the bool",
          "No native signature aggregation (unlike BLS) — N signers means N verifications",
          "ECDSA is malleable (s and -s); enforce low-s if you key any logic on signature uniqueness",
          "secp256k1_sign / keypair_from_seed are test-only — they must never appear in a " +
            "production contract"
        ],
        exercises: [
          {
            type: "comparison",
            question:
              "Contrast secp256k1_ecrecover and secp256k1_verify: what inputs differ, what do " +
              "they return, and which failure modes must you guard against in each?",
            hint:
              "One reconstructs the pubkey from a 65-byte (r,s,v) sig and can abort; the " +
              "other takes a 64-byte (r,s) sig plus an explicit pubkey and returns bool.",
            answer:
              "ecrecover takes a 65-byte recoverable signature (r,s,v) and the message, and " +
              "returns the 65-byte uncompressed public key; it aborts with EFailToRecoverPubKey " +
              "or EInvalidSignature on bad input, so you handle failure via abort. verify takes " +
              "a 64-byte non-recoverable (r,s) signature, an explicit 33-byte compressed public " +
              "key, and the message, and returns a bool — it fails silently as false, so you " +
              "must remember to assert on the result. Use ecrecover when you want to derive " +
              "the signer's address; use verify when you already know the expected key."
          },
          {
            type: "conceptual",
            question:
              "Why is ecdsa_k1 essentially irrelevant to the privacy core of the thesis, yet " +
              "still worth including for account-abstraction features?",
            hint:
              "Privacy needs to hide who acts and how much. ECDSA verification reveals the " +
              "public key / address.",
            answer:
              "Confidential payments hide both the actor and the amounts; ECDSA verification " +
              "inherently exposes the signer's public key (or recovers it), leaking identity " +
              "and providing no zero-knowledge property, so it cannot carry the privacy core. " +
              "It is still valuable at the system's edges: account abstraction and social " +
              "recovery that let users reuse existing Bitcoin/Ethereum keys, and bridged " +
              "attestations where an external-chain signature must be checked on Sui — utility " +
              "features that sit outside the confidential value flow."
          }
        ]
      }
    ]
  }
};
