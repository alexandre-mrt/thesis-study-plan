/**
 * SOTA Rust Crypto Ecosystem (2024-2026)
 *
 * State-of-the-art Rust libraries, zkVMs, and crypto tooling relevant to the
 * thesis Rust implementation track. Items chosen to align with utt-rs deps
 * (arkworks 0.5, merlin 3, blake2/sha2, ark-bls12-381 0.5) and the broader
 * anonymous credentials + ZKP + TEE roadmap at Mysten Labs.
 *
 * Rendered with KaTeX: \\( ... \\) for inline math. Paper/library links are
 * canonical (GitHub, crates.io, docs.rs, or project sites).
 */
window.SOTA_RUST = {
  items: [
    /* ───────── 1. arkworks 0.5 ───────── */
    {
      name: "arkworks 0.5",
      authors: "arkworks-rs contributors",
      venue: "Rust crates (ark-ff / ark-ec / ark-poly / ark-serialize, 2024)",
      year: 2024,
      link: "https://github.com/arkworks-rs/algebra",
      recap_short:
        "Major workspace bump: unified release of ark-ff / ark-ec / ark-poly / ark-serialize / ark-std at 0.5 with a cleaner trait hierarchy and const-generic field traits.",
      recap_long:
        "arkworks 0.5 (2024) is the first coordinated major release since 0.4 (2022). The most visible break is in ark-ec: the CurveGroup / Group traits replace the older ProjectiveCurve / AffineCurve split, and short-Weierstrass / twisted-Edwards models are reorganised under ark-ec::models::{short_weierstrass, twisted_edwards}. ark-ff restructures field traits so that Field: PrimeField no longer implies FftField automatically — downstream code typing generic over F: Field must add explicit FftField bounds when calling FFT APIs. Serialisation moves from ark-serialize's read/write helpers to the Compress / Validate flag enums introduced in 0.4, now made mandatory. " +
        "Migration path for utt-rs (already on 0.5): (i) replace ProjectiveCurve/AffineCurve with CurveGroup and its AffineRepr; (ii) use G::generator() instead of G::prime_subgroup_generator(); (iii) import short_weierstrass::{Projective, Affine} rather than the top-level re-exports; (iv) switch canonical (de)serialisation calls to serialize_compressed / deserialize_compressed or the explicit (Compress, Validate) variants. ark-bls12-381 0.5 follows the same conventions; pairing is still exposed through Bls12_381: Pairing with TargetField = Fq12.",
      math_highlight:
        "$\\text{Fr}::\\text{rand}(\\text{rng})$ samples $r \\xleftarrow{\\$} \\mathbb{F}_r$ uniformly; group generator via $G::\\text{generator}()$ in $\\mathbb{G}_1$.",
      why_for_thesis:
        "Foundational stack of utt-rs (ark-ec, ark-ff, ark-bls12-381, ark-poly, ark-serialize all at 0.5). Understanding the 0.4→0.5 trait migration avoids subtle type errors when extending the crypto crate with new primitives (threshold PS, IBE, range proofs).",
      tags: ["arkworks", "library", "breaking-change", "bls12-381"]
    },

    /* ───────── 2. halo2_proofs + PSE fork ───────── */
    {
      name: "halo2 & PSE halo2 fork",
      authors: "Zcash Foundation; Privacy & Scaling Explorations (PSE / Ethereum Foundation)",
      venue: "zcash/halo2 & privacy-scaling-explorations/halo2 (GitHub, 2024-2025)",
      year: 2024,
      link: "https://github.com/privacy-scaling-explorations/halo2",
      recap_short:
        "The Zcash halo2 crate stays pinned to the Orchard circuit; the PSE fork is the de-facto production branch for EVM and application circuits, adding a KZG-backed prover, GWC/SHPLONK multi-opening, and a zkEVM-oriented PLONKish API.",
      recap_long:
        "halo2 originally shipped with the IPA polynomial commitment used by Zcash Orchard (no trusted setup, logarithmic verifier). PSE forked halo2 to replace IPA with KZG over BN254 so that proofs can be verified on-chain in an Ethereum precompile-friendly way; their fork also exposes the halo2_backend / halo2_frontend split, a Keccak-friendly Challenge255 transcript, and the SHPLONK multi-opening scheme (Boneh–Drake–Fisch–Gabizon, 2021). Most ecosystem projects — Scroll zkEVM, Taiko, Axiom, Semaphore v4, zkLogin circuits — build on the PSE fork. " +
        "Divergence matters for thesis circuits: (i) column / region APIs are mostly compatible but the PSE fork renames several modules (halo2_proofs::halo2curves vs upstream arkworks-free curves); (ii) the PSE Circuit trait carries an associated type for floor planner selection and a configure_with_params method used by Axiom and scroll; (iii) benchmarks and MSM tuning (ICICLE, CUDA) exist only in the PSE fork. Picking the fork is a thesis-relevant decision when prototyping Groth16-alternative PLONKish circuits for anonymous credentials.",
      math_highlight:
        "KZG opening proof: $\\pi = \\left[\\frac{p(X) - p(z)}{X - z}\\right]_1 \\in \\mathbb{G}_1$; verify via $e(\\pi, [\\tau - z]_2) = e([p(\\tau) - p(z)]_1, [1]_2)$.",
      why_for_thesis:
        "Halo2 is the most mature Rust PLONKish framework. If the thesis needs on-chain verification (Sui / EVM rollup bridge) the PSE fork’s KZG variant is the pragmatic choice; the original halo2 IPA variant remains useful for trust-setup-free deployments.",
      tags: ["halo2", "plonk", "kzg", "fork"]
    },

    /* ───────── 3. plonky3 ───────── */
    {
      name: "Plonky3",
      authors: "Polygon Zero (Daniel Lubarov, William Borgeaud, Hamish Ivey-Law et al.)",
      venue: "Plonky3 repository & blog, Polygon Labs (2024)",
      year: 2024,
      link: "https://github.com/Plonky3/Plonky3",
      recap_short:
        "Modular STARK / AIR toolkit in Rust released 2024 by Polygon Zero: small-field arithmetic (Mersenne-31, BabyBear, Goldilocks), FRI commitment, and a pluggable hash/challenger layer used by SP1, Valida and several zkVMs.",
      recap_long:
        "Plonky3 is a ground-up rewrite of Plonky2 that decouples the STARK proof system into independent crates: p3-field (prime-field arithmetic with Montgomery and NTT-friendly primes), p3-commit (vector / Merkle / FRI commitment), p3-air (Algebraic Intermediate Representation traits), p3-uni-stark and p3-fri (prover / verifier), and p3-challenger (Fiat-Shamir transcripts supporting Keccak, Poseidon2 and Blake3). Fields of interest include BabyBear ($p = 2^{31} - 2^{27} + 1$), KoalaBear, Mersenne31 ($p = 2^{31} - 1$) and Goldilocks ($p = 2^{64} - 2^{32} + 1$). " +
        "Plonky3 is the proof backend for Succinct's SP1, Lita's Valida zkVM, and experimentally for Polygon's AggLayer. For thesis purposes it is the canonical place to learn modern small-field / hash-based proofs in idiomatic Rust: the AIR trait forces you to write algebraic constraints as pure functions over AB::Expr, and the benches show realistic FRI performance numbers on laptop hardware.",
      math_highlight:
        "BabyBear: $\\mathbb{F}_p$ with $p = 2^{31} - 2^{27} + 1 = 2013265921$; 2-adicity $27$ ⇒ FFTs of length up to $2^{27}$.",
      why_for_thesis:
        "If the thesis explores hash-based / post-quantum alternatives to the pairing-based utt-rs design, Plonky3 is the cleanest Rust codebase to study (and to extend for a custom AIR representing, e.g., a threshold credential verifier).",
      tags: ["plonky3", "stark", "fri", "zkvm-backend"]
    },

    /* ───────── 4. Nova + Sonobe ───────── */
    {
      name: "nova-snark & Sonobe folding framework",
      authors: "Microsoft Research (nova-snark); 0xPARC / PSE (Sonobe)",
      venue: "microsoft/Nova & privacy-scaling-explorations/sonobe (2024-2025)",
      year: 2025,
      link: "https://sonobe.io",
      recap_short:
        "nova-snark is the reference Rust implementation of Nova / SuperNova folding; Sonobe wraps Nova, HyperNova and ProtoStar behind a common Rust API with Circom / Noir / arkworks front-ends and on-chain Solidity verifiers.",
      recap_long:
        "Nova (Kothapalli–Setty–Tzialla, CRYPTO '22) introduces a folding scheme for relaxed R1CS, reducing incrementally-verifiable computation to a single amortised SNARK at the end. nova-snark by Microsoft Research is the canonical Rust codebase, using Pasta / Grumpkin cycle-of-curves and Poseidon for Fiat-Shamir. Sonobe (sonobe.io) is a Rust folding-schemes library built on top of arkworks that generalises the pattern: the same IVC front-end compiles to Nova, HyperNova, ProtoStar or Mova, and the library emits Solidity verifier contracts so that the compressed proof can be verified on an EVM chain. " +
        "The practical idiom is the FCircuit / FoldingScheme traits: the developer only writes one step circuit implementing StepCircuit over a Curve::Scalar, and Sonobe handles the running-instance algebra, folding, and final Groth16 / Spartan compression. Benchmarks in early 2025 show Nova+Sonobe producing on the order of a few seconds per recursive step on consumer hardware with ~$2^{18}$ R1CS constraints per step. For the thesis this matters because accountable-privacy statements (e.g., a multi-step spending policy) can be expressed as IVC without paying for monolithic SNARK circuit size.",
      math_highlight:
        "Relaxed R1CS fold: given $(U_1,W_1),(U_2,W_2)$ and challenge $r$, folded instance $U = U_1 + r\\cdot U_2$, witness $W = W_1 + r\\cdot W_2$, error $E = E_1 + r\\cdot T + r^2 E_2$.",
      why_for_thesis:
        "Folding is the leading path for recursive anonymous credential proofs; Sonobe is the Rust production-ready reference and integrates natively with arkworks (same stack as utt-rs).",
      tags: ["nova", "folding", "ivc", "sonobe"]
    },

    /* ───────── 5. Jolt ───────── */
    {
      name: "Jolt zkVM",
      authors: "a16z crypto (Arasu Arun, Srinath Setty, Justin Thaler)",
      venue: "a16z/jolt (GitHub, 2024-2025)",
      year: 2024,
      link: "https://github.com/a16z/jolt",
      recap_short:
        "RISC-V zkVM built on Lasso / sumcheck and the 'lookup singularity' philosophy: the entire CPU is proved via lookups into structured tables, with Spartan as the final backend.",
      recap_long:
        "Jolt (Just One Lookup Table) proves execution of a RISC-V program by decomposing every instruction into reads from prefix-suffix-decomposable lookup tables (Lasso protocol, Setty–Thaler–Wahby 2023). Compared with SP1 / risc0 which compile RISC-V to STARK-style AIR constraints, Jolt argues that lookups are strictly cheaper once tables factorise nicely (as they do for bitwise ops, comparisons, and the RV32I ISA). The Rust codebase exposes tracer + prover crates; developers write ordinary Rust programs, compile to riscv32im-unknown-none-elf, and run jolt prove. " +
        "The backend pipeline is: RISC-V trace → memory-checking (offline memory checking, Blum et al.) → Lasso lookups for ALU / branch / memory ops → Spartan (sumcheck + Hyrax / Zeromorph PCS) for the final argument. Early 2025 benches report prover throughput competitive with SP1 on RV32IM for equivalent cycle counts, with substantially lower per-instruction constraint blow-up. Jolt is not yet as feature-complete as SP1 (no precompile ecosystem, no on-chain Groth16 wrapper in mainline) but its architecture is the cleanest teaching example of modern lookup-centric zkVMs.",
      math_highlight:
        "Lasso lookup argument reduces checking $\\{a_i\\} \\subseteq T$ to a sumcheck over a decomposed table $T = T_1 \\otimes \\cdots \\otimes T_k$, prover time $O(m + \\sqrt[k]{|T|})$.",
      why_for_thesis:
        "Reading Jolt alongside SP1 gives two contrasting designs (lookups vs AIR); the Rust implementation is short enough to read end-to-end during the Rust track of the study plan.",
      tags: ["jolt", "zkvm", "lasso", "lookups"]
    },

    /* ───────── 6. SP1 ───────── */
    {
      name: "SP1 zkVM",
      authors: "Succinct Labs",
      venue: "succinctlabs/sp1 (GitHub, 2024)",
      year: 2024,
      link: "https://github.com/succinctlabs/sp1",
      recap_short:
        "Production RISC-V zkVM in Rust built on Plonky3 with a rich precompile ecosystem (Keccak, SHA-256, secp256k1, BN254, BLS12-381, Ed25519) and Groth16 / Plonk proof compression for on-chain verification.",
      recap_long:
        "SP1 compiles Rust (or any LLVM language) to a custom RISC-V target and proves execution using a Plonky3 STARK backend. Its signature feature is a precompile mechanism: cryptographic primitives that would otherwise take millions of cycles (BLS12-381 pairings, Keccak rounds, secp256k1 ecrecover) are handled by dedicated AIR chips, making the prover competitive with bespoke circuits. SP1 also ships a 'groth16 wrapper' and a 'plonk wrapper' that compress the STARK proof into an on-chain-verifiable SNARK, and a CUDA prover (sp1-cuda) for GPU acceleration. " +
        "The developer workflow is notably simple: cargo prove new, cargo prove build, then SP1Prover::new().prove(&elf, stdin) in Rust. For thesis purposes SP1 serves two roles: (1) it is the easiest way to outsource a complex Rust statement (say, 'this transcript verifies under these credentials') to a zkVM without hand-writing constraints; (2) its precompile architecture is a reference design for integrating BLS12-381 and Keccak into a STARK-based system — directly relevant if the thesis later blends pairing-based credentials with STARK-style recursion.",
      math_highlight:
        "STARK prover complexity $O(N \\log N)$ with $N$ = trace length; Groth16 wrapper yields a constant-size on-chain proof of 3 $\\mathbb{G}_1 / \\mathbb{G}_2$ elements.",
      why_for_thesis:
        "SP1 is the path-of-least-resistance to move Rust crypto code into a verifiable setting without rebuilding circuits from scratch; precompile list overlaps exactly with utt-rs primitives (BLS12-381, Keccak, SHA-256).",
      tags: ["sp1", "zkvm", "plonky3", "precompile"]
    },

    /* ───────── 7. RISC Zero ───────── */
    {
      name: "RISC Zero zkVM v1.0 / v2",
      authors: "RISC Zero (Brian Retford, Jeremy Bruestle et al.)",
      venue: "risc0/risc0 (GitHub); zkVM 1.0 (Mar 2024), 2.x (2025)",
      year: 2024,
      link: "https://github.com/risc0/risc0",
      recap_short:
        "First production-audited Rust RISC-V zkVM: v1.0 (2024) introduced continuations for unbounded execution and a Groth16 wrapper for on-chain verification; v2.x brings accelerated prover and Bonsai cloud proving.",
      recap_long:
        "RISC Zero pioneered the 'write Rust, get a SNARK' idiom. The zkVM compiles guest programs to rv32im, executes them inside an instrumented VM that emits a trace, and proves the trace via a STARK with FRI over the BabyBear field ($p = 2^{31} - 2^{27} + 1$). The 1.0 release (March 2024) was the first security-audited version: it introduced continuations (proofs split into segments and recursively joined), a stabilised ZKR receipt format, and a Groth16 wrapper producing ~256-byte proofs verifiable on EVM / Solana / Sui. v2.x (2025) focuses on prover performance (CUDA, Metal) and the Bonsai SaaS for offloaded proving. " +
        "From a thesis standpoint RISC Zero is the incumbent: battle-tested, documented, and the first zkVM with real-world deployments (Zeth for zkEVM, Bonsai apps). Compared with SP1 it has fewer precompiles but better continuation support and a more mature receipt / journal API (public outputs are typed Rust structs, not raw bytes). The distinction between Segment, SuccinctReceipt and Groth16Receipt is worth learning early: most integration bugs live at that boundary.",
      math_highlight:
        "Receipt journal commits $\\text{hash}(\\text{exit\\_code} \\,\\|\\, \\text{image\\_id} \\,\\|\\, \\text{journal})$; Groth16 wrapper outputs $(\\pi_A, \\pi_B, \\pi_C) \\in \\mathbb{G}_1 \\times \\mathbb{G}_2 \\times \\mathbb{G}_1$.",
      why_for_thesis:
        "If the thesis produces a demo that needs on-chain verification of a non-trivial Rust statement, RISC Zero's Bonsai + Groth16 wrapper is the shortest path from a crate to a verified tx on Sui.",
      tags: ["risc0", "zkvm", "groth16-wrapper", "continuations"]
    },

    /* ───────── 8. fastcrypto ───────── */
    {
      name: "fastcrypto",
      authors: "Mysten Labs",
      venue: "MystenLabs/fastcrypto (GitHub, 2022-2025)",
      year: 2025,
      link: "https://github.com/MystenLabs/fastcrypto",
      recap_short:
        "Mysten Labs' internal crypto toolkit powering Sui: constant-time Ed25519 / secp256k1 / BLS12-381, threshold BLS, KZG, VRF, zkLogin Groth16 verifier, and post-quantum experimentation, all benchmarked against the Rust ecosystem.",
      recap_long:
        "fastcrypto is a curated, audited Rust crypto crate collection maintained by Mysten Labs: fastcrypto (core signatures / hashes), fastcrypto-zkp (Groth16 / zkLogin / KZG verification), fastcrypto-tbls (threshold BLS and DKG), fastcrypto-vdf (class-group VDFs). The project is explicit about non-goals — it is not a general-purpose library, it supports only the primitives Sui actually needs — which makes it an unusually good study object: each file is small, documented, and benchmarked against blst, curve25519-dalek, k256, ed25519-dalek, and ark-* crates. Benchmarks live in fastcrypto/benches and directly compare alternatives. " +
        "For thesis work the most directly relevant modules are: bls12381 (thin blst + arkworks wrappers, threshold signing), groth16 / zk_login (Sui's zkLogin verifier and its BN254 vs BLS12-381 trade-offs), hash (Blake2b, Poseidon), and aggregate_authenticator (accountable threshold schemes). The repo also contains the canonical Rust implementation of zkLogin's 'proof for OIDC JWT' pipeline, which doubles as a worked example of Groth16 + SHA-256 in-circuit.",
      math_highlight:
        "zkLogin Groth16 verification: $e(\\pi_A, \\pi_B) = e(\\alpha, \\beta) \\cdot e(\\Sigma_{i} x_i \\cdot \\gamma_i, \\gamma) \\cdot e(\\pi_C, \\delta)$ over BN254.",
      why_for_thesis:
        "fastcrypto is the codebase the Mysten Labs host team works in daily; reading it before September aligns the thesis Rust with internal conventions (error types, benchmarks, audit expectations).",
      tags: ["fastcrypto", "sui", "mysten", "bls", "zklogin"]
    },

    /* ───────── 9. BLS12-381 Rust landscape ───────── */
    {
      name: "BLS12-381 Rust implementations (blst / ark-bls12-381 / zkcrypto bls12_381)",
      authors: "Supranational (blst); arkworks-rs (ark-bls12-381); zkcrypto (bls12_381)",
      venue: "supranational/blst, arkworks-rs/curves, zkcrypto/bls12_381",
      year: 2024,
      link: "https://github.com/supranational/blst",
      recap_short:
        "Three production Rust stacks for BLS12-381 with distinct trade-offs: blst (fastest, assembly-optimised, audited, opaque types), ark-bls12-381 (generic / composable, integrates with R1CS and pairing generics), zkcrypto/bls12_381 (pure Rust, no_std, middle ground).",
      recap_long:
        "BLS12-381 is the default pairing-friendly curve for threshold signatures (Ethereum consensus, Sui, Filecoin, Zcash Sapling). The three Rust implementations have been the 'big three' for several years: blst (Supranational) is written mostly in C + assembly with Rust bindings — by far the fastest, used by Ethereum Lighthouse/Lodestar, Filecoin, Sui's fastcrypto, but its types are opaque (blst_p1 / blst_p2 rather than generic group traits); ark-bls12-381 is the arkworks implementation, slower than blst but fully generic over PrimeField / CurveGroup / Pairing, meaning it composes with ark-groth16, ark-r1cs-std and ark-poly; zkcrypto/bls12_381 is a pure-Rust, no_std, auditable implementation that powers Zcash Sapling / Halo2 and is often used when blst's C dependency is a blocker. " +
        "Benchmarks on an Apple M2 (2024 numbers from fastcrypto/benches and zkcrypto): one Miller loop ≈ 500µs (blst) vs ≈ 1.1ms (zkcrypto) vs ≈ 1.4ms (arkworks); variable-base $\\mathbb{G}_1$ MSM of size $2^{16}$: ≈ 90ms (blst) vs ≈ 250-400ms (pure Rust). utt-rs uses ark-bls12-381 for composability; a production fork would swap in blst for hot paths. This three-way choice is one of the most recurring integration decisions in Rust crypto.",
      math_highlight:
        "BLS12-381 params: $p \\approx 2^{381}$, $r \\approx 2^{255}$, embedding degree $k=12$, security $\\approx 128$ bits; pairing $e: \\mathbb{G}_1 \\times \\mathbb{G}_2 \\to \\mathbb{G}_T \\subset \\mathbb{F}_{p^{12}}^\\ast$.",
      why_for_thesis:
        "Direct choice in utt-rs and any future thesis artefact: pick arkworks for research prototypes, blst for benchmarks or production, zkcrypto for no_std / audit-friendly settings.",
      tags: ["bls12-381", "blst", "arkworks", "pairing"]
    },

    /* ───────── 10. curve25519-dalek + merlin ───────── */
    {
      name: "curve25519-dalek 4.x + merlin transcripts",
      authors: "dalek-cryptography contributors (Henry de Valence, Isis Lovecruft et al.)",
      venue: "dalek-cryptography/curve25519-dalek, dalek-cryptography/merlin",
      year: 2024,
      link: "https://github.com/dalek-cryptography/curve25519-dalek",
      recap_short:
        "Reference Rust Curve25519 / Ristretto stack. 4.x (2023-2024) stabilises the Scalar API and pulls in the zkcrypto group traits; merlin is the canonical Rust transcript abstraction for Fiat-Shamir in non-interactive Sigma / Bulletproofs / PS-based protocols.",
      recap_long:
        "curve25519-dalek 4.x is the long-awaited stable release: the Scalar type now wraps an internal 29-bit-limb representation with constant-time constructors (Scalar::from_canonical_bytes, Scalar::from_bytes_mod_order), RistrettoPoint implements the group::Group and group::GroupEncoding traits from zkcrypto, and backend selection (simd, u64, u32, fiat) is controlled by Cargo features rather than nightly-only flags. ed25519-dalek 2.0 sits on top and fixes the 'double public key oracle' issue by requiring pre-hashed contexts for domain separation. " +
        "merlin (Henry de Valence, 2018, still the canonical Rust transcript) implements a STROBE-128-based Transcript: append_message(label, data) absorbs with domain separation, challenge_bytes(label, dest) squeezes Fiat-Shamir challenges. Best practices (from Dalek docs and from the utt-rs code): (i) label every appended field with a unique byte string; (ii) never reuse a transcript across protocol invocations; (iii) seed the transcript with a protocol identifier so that a Bulletproofs range proof cannot be confused with a PS sigma-protocol proof; (iv) fork the transcript (clone) for parallel branches rather than running two protocols in the same transcript state.",
      math_highlight:
        "Ristretto255: prime-order subgroup $\\mathcal{R} \\subset E(\\mathbb{F}_q)$ of order $\\ell = 2^{252} + 27742317777372353535851937790883648493$.",
      why_for_thesis:
        "utt-rs uses merlin 3 directly; the transcript discipline described here is exactly the interface threshold PS sigma-protocols need. Curve25519 itself is a useful cross-check when benchmarking Ristretto vs BLS12-381-based schemes.",
      tags: ["curve25519", "ristretto", "merlin", "transcript"]
    },

    /* ───────── 11. Groth16 Rust stacks ───────── */
    {
      name: "Groth16 in Rust: ark-groth16 vs bellman vs bellperson",
      authors: "arkworks-rs (ark-groth16); zkcrypto (bellman); Filecoin (bellperson)",
      venue: "arkworks-rs/groth16, zkcrypto/bellman, filecoin-project/bellperson",
      year: 2024,
      link: "https://github.com/arkworks-rs/groth16",
      recap_short:
        "Three long-lived Rust Groth16 implementations. ark-groth16 is generic and pairs with ark-relations R1CS DSL; bellman is the Zcash Sapling original; bellperson is Filecoin's GPU-accelerated fork (Halo2 transcripts + MSM on CUDA).",
      recap_long:
        "ark-groth16 is the default choice for research: it is generic over Pairing (so the same circuit compiles for BLS12-381, BN254, BLS12-377), integrates with ark-relations ConstraintSystem and ark-r1cs-std gadgets (Boolean, FpVar, Groth16VerifierGadget for recursion), and has a compact audited codebase (~2k LoC). bellman (zkcrypto) was the original Zcash Sapling prover — pure Rust, curve-specific (BLS12-381 via zkcrypto/pairing), conservative API; still used in older Zcash forks. bellperson forks bellman with two major additions: GPU acceleration (CUDA / OpenCL kernels for MSM and FFT, essential for Filecoin's gigabyte-scale proofs) and the Halo2 Challenge255 transcript for recursion. " +
        "Decision matrix: use ark-groth16 when you need circuit composability, recursion gadgets, or paper-faithful prototypes; use bellperson when proof times dominate and GPUs are available; use bellman only for Zcash-compat or extreme minimalism. Note that raw Groth16 is quietly being displaced by PLONKish / lookup-based systems in new projects (halo2, SP1, Jolt), but it remains the on-chain-verifier workhorse because the verifier is 3 pairings regardless of circuit size.",
      math_highlight:
        "Groth16 verify: $e(\\pi_A, \\pi_B) \\stackrel{?}{=} e(\\alpha, \\beta) \\cdot e\\big(\\sum_i x_i \\cdot \\psi_i, \\gamma\\big) \\cdot e(\\pi_C, \\delta)$; proof size $= 2|\\mathbb{G}_1| + |\\mathbb{G}_2| = 192$ bytes on BLS12-381.",
      why_for_thesis:
        "Any thesis artefact that uses Groth16 (zkLogin-style credentials, commitment openings, accountable privacy) needs one of these. ark-groth16 aligns with the utt-rs arkworks stack.",
      tags: ["groth16", "arkworks", "bellman", "snark"]
    },

    /* ───────── 12. tfhe-rs ───────── */
    {
      name: "tfhe-rs (Zama)",
      authors: "Zama",
      venue: "zama-ai/tfhe-rs (GitHub); TFHE-rs v0.5-0.8 (2024-2025)",
      year: 2025,
      link: "https://github.com/zama-ai/tfhe-rs",
      recap_short:
        "Production Rust TFHE library (Chillotti-Gama-Georgieva-Izabachène) with GPU (CUDA) / multi-bit PBS, integer / boolean / shortint APIs, and a high-level FheUint type that overloads Rust arithmetic over ciphertexts.",
      recap_long:
        "tfhe-rs is the reference open-source Rust implementation of TFHE (Torus-FHE) by Zama. Recent 2024-2025 releases (v0.5 through v0.8) add: (i) high-level FheUint<N> and FheInt<N> types that implement core::ops traits so that a + b, a.cmp(&b), a.bitand(b) are transparently homomorphic, with N up to 256; (ii) a CUDA backend (tfhe-cuda-backend) achieving multi-ms bootstrapping for multi-bit PBS on H100; (iii) compressed / seeded ciphertexts for network-efficient transmission; (iv) a multi-party / threshold key-generation mode experimental for v0.8. The underlying scheme uses LWE samples $\\mathbf{a}, \\langle \\mathbf{a}, \\mathbf{s} \\rangle + m \\cdot \\Delta + e$ over the torus, with programmable bootstrapping mapping a test polynomial via blind rotation. " +
        "For thesis purposes tfhe-rs is the canonical way to see FHE as a usable Rust tool rather than a paper curiosity. Ch 2.6 of the study plan (Advanced — MPC / FHE / threshold) maps directly: threshold FHE is being specced (Zama threshold KMS) and the same primitives (noise flooding, ciphertext compression) appear in MPC-FHE hybrids for private computation over private-payment states.",
      math_highlight:
        "LWE decryption: $m = \\lfloor \\phi / \\Delta \\rceil$ where $\\phi = b - \\langle \\mathbf{a}, \\mathbf{s} \\rangle = m \\cdot \\Delta + e$ over $\\mathbb{T} = \\mathbb{R}/\\mathbb{Z}$.",
      why_for_thesis:
        "FHE is the natural complement to TEE for the 'compute over encrypted data' story in the thesis; tfhe-rs is the only Rust production FHE stack aligned with the rest of the ecosystem (serde, tokio).",
      tags: ["tfhe-rs", "fhe", "zama", "lwe"]
    }
  ]
};
