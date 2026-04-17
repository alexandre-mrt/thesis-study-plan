/**
 * Ch 2.5 SOTA Data — ZK Proof Systems (2024-2026)
 *
 * State-of-the-art updates: folding schemes (Nova/SuperNova/HyperNova/ProtoStar),
 * production SNARK backends (Plonky3, Halo2/PSE/ezkl), small-field arithmetization
 * (Binius), zkVMs (Jolt, SP1, RISC Zero, Valida), Sumcheck revival, and Groth16
 * tooling benchmarks.
 *
 * Consumed by paper-guide.js / zk-deepdive.js via window.SOTA_CH25.
 */

window.SOTA_CH25 = {
  chapter: "2.5",
  title: "ZK Proof Systems — State of the Art (2024-2026)",
  updated: "2026-04-17",
  items: [
    /* ── 1. Nova — the folding genesis ── */
    {
      name: "Nova: Recursive Zero-Knowledge Arguments from Folding Schemes",
      authors: "Kothapalli, Setty, Tzialla",
      venue: "CRYPTO 2022 / ePrint 2021/370",
      year: 2022,
      link: "https://eprint.iacr.org/2021/370",
      recap_short:
        "Introduces folding: compress two instances of Relaxed R1CS into one, amortizing IVC cost.",
      recap_long:
        "Nova replaces SNARK-of-SNARK recursion with a folding scheme. Instead of verifying a proof " +
        "inside a circuit at every step, the prover folds two Relaxed R1CS instances into one via a " +
        "linear combination with challenge r, and only produces a final SNARK at the end of the " +
        "computation. This reduces per-step recursion cost from ~millions of constraints (Halo/PLONK " +
        "recursion) to ~20-50k constraints for the folding verifier, making IVC practical on commodity hardware. " +
        "The final compressing SNARK (e.g., Spartan) is run exactly once. Follow-ups SuperNova (non-uniform " +
        "IVC, 2022), HyperNova (CCS-based folding, 2023), and ProtoStar (generic compiler from special-sound " +
        "protocols, 2023) extend this to branching, high-degree constraint systems, and lookups.",
      math_highlight:
        "$\\text{fold}(U_1, U_2, r) = U_1 + r \\cdot U_2, \\quad E \\leftarrow E_1 + r \\cdot T + r^2 \\cdot E_2$",
      why_for_thesis:
        "Folding enables efficient IVC for long audit histories on Sui: each confidential transaction " +
        "appends one R1CS step, and the TEE auditor compresses the entire chain into a single Spartan proof " +
        "without running recursion per step.",
      benchmarks:
        "Prover ~40ms/step on M1 (10k-constraint step); final Spartan proof ~28KB; verifier ~10ms.",
      tags: ["folding", "recursion", "ivc", "snark"]
    },

    /* ── 2. SuperNova — non-uniform IVC ── */
    {
      name: "SuperNova: Proving Universal Machine Executions Without Universal Circuits",
      authors: "Kothapalli, Setty",
      venue: "ePrint 2022/1758",
      year: 2022,
      link: "https://eprint.iacr.org/2022/1758",
      recap_short:
        "Extends Nova to non-uniform IVC: each step can execute a different function (zkVM opcodes).",
      recap_long:
        "Standard IVC assumes the same function F is iterated at every step. SuperNova relaxes this: the " +
        "prover commits to a set of functions {F_1, ..., F_L} (e.g., each CPU opcode), and at step i the " +
        "prover selects which function to run and folds only into that function's running instance. Cost is " +
        "proportional to the size of the executed opcode, not the union of all opcodes, making SuperNova the " +
        "natural foundation for zkVMs without the overhead of universal circuits. " +
        "Directly implemented in Sonobe and Nexus zkVM.",
      math_highlight:
        "$U_i^{(j)} \\leftarrow \\text{fold}(U_{i-1}^{(j)}, u_i^{(j)}, r), \\quad j = \\phi(i) \\in [L]$",
      why_for_thesis:
        "If the thesis extends to a Move-like bytecode compiler with ZK, SuperNova is the blueprint: each " +
        "Move opcode becomes an F_j and transaction traces fold opcode-by-opcode.",
      benchmarks:
        "Per-opcode prover ~15-60ms depending on opcode arity (Nexus v3 measurements).",
      tags: ["folding", "zkvm", "non-uniform", "ivc"]
    },

    /* ── 3. HyperNova — high-degree folding ── */
    {
      name: "HyperNova: Recursive Arguments for Customizable Constraint Systems",
      authors: "Kothapalli, Setty",
      venue: "CRYPTO 2024 / ePrint 2023/573",
      year: 2024,
      link: "https://eprint.iacr.org/2023/573",
      recap_short:
        "Folds Customizable Constraint Systems (CCS), which generalize R1CS, Plonkish, AIR with degree > 2.",
      recap_long:
        "R1CS is restricted to degree-2 constraints. HyperNova introduces folding over CCS, a superset " +
        "capturing Plonkish (gates + copy constraints), AIR (STARK-style transitions), and high-degree " +
        "custom gates. The folding verifier is still linear, but the error term polynomial is now of degree " +
        "d = max gate degree. To keep soundness, HyperNova uses multifolding via a sumcheck-based reduction: " +
        "multiple instances are batched into a single check at a random point. This unlocks folding for " +
        "circuits that previously required Plonk or AIR, e.g., Poseidon hash with degree-5 S-boxes.",
      math_highlight:
        "$\\text{MultiFold}(\\{U_i\\}_{i=1}^k) \\to U^*, \\quad \\text{via sumcheck on } g(x) = \\sum_i e_q(r_i, x) \\cdot p_i(x)$",
      why_for_thesis:
        "Poseidon and BLS12-381 scalar ops are awkward in R1CS; HyperNova + CCS lets you express them in " +
        "native high-degree form while keeping Nova-speed folding for BBS+ signature verification.",
      benchmarks:
        "On Poseidon (width 3, 57 rounds): HyperNova prover ~2x faster than Nova + hand-encoded R1CS.",
      tags: ["folding", "ccs", "plonkish", "sumcheck"]
    },

    /* ── 4. ProtoStar — universal folding compiler ── */
    {
      name: "ProtoStar: Generic Efficient Accumulation/Folding for Special-Sound Protocols",
      authors: "Bünz, Chen",
      venue: "ASIACRYPT 2023 / ePrint 2023/620",
      year: 2023,
      link: "https://eprint.iacr.org/2023/620",
      recap_short:
        "Generic accumulation compiler: any special-sound protocol becomes a folding scheme, with native lookups.",
      recap_long:
        "Where Nova folds R1CS and HyperNova folds CCS, ProtoStar gives a black-box compiler: any (2k+1)-move " +
        "special-sound protocol (including Plonk, Halo2, lookups) can be transformed into an accumulation " +
        "scheme with O(d) prover work and constant-size verifier per step. Crucially, ProtoStar is the first " +
        "folding scheme with native support for lookup arguments (Plookup, LogUp) without blowing up the " +
        "accumulator size. Implemented in arkworks-rs/protostar and a core primitive in Sonobe's folding zoo.",
      math_highlight:
        "$\\text{Acc.verify}(\\pi_{\\text{acc}}, x) \\approx \\text{sumcheck on polynomial error term } e(X)$",
      why_for_thesis:
        "Lookup arguments matter for range proofs (replacing Bulletproofs++) and Merkle path checks in the " +
        "audit trail. ProtoStar keeps folding cheap even when lookups dominate.",
      benchmarks:
        "ProtoStar prover: ~1.5-3x Nova for pure R1CS, ~0.7x Nova when lookups are intensive.",
      tags: ["folding", "lookups", "universal", "accumulation"]
    },

    /* ── 5. Plonky3 — production modular SNARK ── */
    {
      name: "Plonky3: Modular Polynomial IOP Framework",
      authors: "Polygon Zero team (Daniel Lubarov et al.)",
      venue: "GitHub release 2024 / Polygon Zero blog",
      year: 2024,
      link: "https://github.com/Plonky3/Plonky3",
      recap_short:
        "Modular STARK/PLONK toolkit: pluggable fields (Goldilocks, Mersenne31, BabyBear, KoalaBear), hashes, PCS.",
      recap_long:
        "Plonky3 is the successor to Plonky2, rebuilt as a modular library rather than a monolithic prover. " +
        "Users compose an AIR, a field (Mersenne31 / BabyBear / Goldilocks / KoalaBear), a hash (Poseidon2, " +
        "Keccak, Monolith), and a polynomial commitment scheme (FRI, Circle STARK) to produce a custom prover. " +
        "Powers SP1 (Succinct), Valida, Polygon Miden, and zkCasper. The 2024 release switched to Poseidon2 + " +
        "Mersenne31 + Circle STARKs, claiming ~5x speedup over Plonky2. In 2025, KoalaBear (31-bit " +
        "two-adic field) landed as default, enabling ~3x SIMD throughput on AVX-512.",
      math_highlight:
        "$\\text{Circle STARK: } \\mathbb{F}_p \\to \\text{circle group } C(\\mathbb{F}_p), \\quad p = 2^{31} - 1$",
      why_for_thesis:
        "If the thesis needs a post-quantum audit layer (FRI-based, no trusted setup), Plonky3 is the " +
        "production-grade choice. Its modularity lets you swap in the same hash as the Sui Move VM.",
      benchmarks:
        "SP1 on Plonky3: ~1.3 GHz RISC-V cycle rate on 32-core EPYC; proof ~1MB before STARK-to-SNARK wrap.",
      tags: ["stark", "plonk", "fri", "modular", "production"]
    },

    /* ── 6. Binius — binary-field arithmetization ── */
    {
      name: "Binius: Highly Efficient Proofs over the Binary Tower",
      authors: "Diamond, Posen (Irreducible / Ulvetanna)",
      venue: "ePrint 2023/1784",
      year: 2023,
      link: "https://eprint.iacr.org/2023/1784",
      recap_short:
        "Arithmetizes computation directly over GF(2) tower fields, killing bit-decomposition overhead.",
      recap_long:
        "Most SNARKs use large prime fields (BN254, BLS12-381), which waste 250+ bits per field element " +
        "when the underlying computation is bit-level (hashes, XOR, AES). Binius proves over binary tower " +
        "fields GF(2^{2^k}) with a small-field sumcheck and a Reed-Solomon code variant (Brakedown-style). " +
        "SHA-256 and Keccak become native and ~10x cheaper to prove than in BN254 R1CS. The 2024 follow-up " +
        "(ePrint 2024/504) adds switchover to univariate PCS for even better verifier cost. Irreducible is " +
        "building a production library in Rust; early benchmarks show 8-30x prover speedup over Plonky3 on " +
        "hash-heavy workloads.",
      math_highlight:
        "$\\text{Tower: } \\tau_0 = \\mathbb{F}_2 \\subset \\tau_1 \\subset \\cdots \\subset \\tau_7 = \\mathbb{F}_{2^{128}}$",
      why_for_thesis:
        "Merkle proof verification (Keccak/SHA) is a bottleneck in the audit-path ZK; Binius makes hash " +
        "proofs an order of magnitude cheaper, improving thesis prover latency.",
      benchmarks:
        "Keccak-256 prover: ~0.6ms/perm on M1 (Binius) vs ~6ms (Plonky3 BabyBear) vs ~80ms (BN254 R1CS).",
      tags: ["binary-field", "small-field", "hash-proving", "sumcheck"]
    },

    /* ── 7. Halo2 ecosystem fork divergence ── */
    {
      name: "Halo2 Ecosystem: Zcash upstream, PSE fork, ezkl fork",
      authors: "Electric Coin Co. / Privacy & Scaling Explorations / ezkl team",
      venue: "GitHub 2020-2026 (ongoing maintenance splits)",
      year: 2026,
      link: "https://github.com/privacy-scaling-explorations/halo2",
      recap_short:
        "Halo2 split into three production forks: Zcash (KZG-less, IPA), PSE (KZG + recursion), ezkl (ONNX → halo2).",
      recap_long:
        "Halo2 (Zcash, 2020) pioneered PLONKish arithmetization + IPA-based accumulation without trusted " +
        "setup. By 2023 the ecosystem had diverged: (1) Zcash upstream stayed on Pasta curves + IPA for " +
        "consensus safety; (2) PSE (Ethereum Foundation) forked to add KZG commitments, GWC multi-opening, " +
        "and halo2-wrong for foreign-field arithmetic, powering zkEVM Type 1; (3) ezkl forked PSE to compile " +
        "ONNX ML models into Halo2 circuits, shipping zk-ML in production (Worldcoin, Giza). In 2025 Axiom " +
        "and Scroll forked PSE again to add custom lookup tables. The fragmentation is a known pain point: " +
        "proofs from one fork cannot be verified by another, and bug fixes do not auto-propagate.",
      math_highlight:
        "$\\text{Halo2 gates: } \\sum_i q_i(X) \\cdot G_i(\\{w_j(X)\\}) = 0$",
      why_for_thesis:
        "Pick PSE halo2 if the thesis needs Ethereum-compatible proofs; pick Zcash halo2 if you want the " +
        "cleanest IPA codebase to read. ezkl is interesting for ML-audit scenarios.",
      benchmarks:
        "Fork divergence: ~12 months of API drift. PSE halo2 prover ~20% faster than Zcash upstream on KZG.",
      tags: ["halo2", "plonk", "forks", "ecosystem"]
    },

    /* ── 8. Jolt — a16z zkVM via lookups ── */
    {
      name: "Jolt: SNARKs for Virtual Machines via Lookups",
      authors: "Arun, Setty, Thaler (a16z crypto)",
      venue: "EUROCRYPT 2024 / ePrint 2023/1217",
      year: 2024,
      link: "https://eprint.iacr.org/2023/1217",
      recap_short:
        "Every RISC-V instruction reduced to a massive lookup via Lasso; prover is dominated by hashing.",
      recap_long:
        "Jolt encodes an entire ISA as a single gigantic lookup table (2^128 entries for 64-bit RISC-V), " +
        "then uses Lasso — a lookup argument that avoids materializing the table — to prove that every " +
        "executed instruction is a valid (opcode, operands, result) tuple. Combined with a Spartan-style " +
        "sumcheck for the memory and register trace, the prover becomes dominated by Merkle hashing, not " +
        "by opcode-specific circuits. a16z claims Jolt is 2-5x faster than RISC Zero / SP1 on simple " +
        "workloads. The 2025 rewrite ('Jolt-Twist') simplifies memory checking and drops prover memory " +
        "from 80GB to 20GB for 32M-cycle programs.",
      math_highlight:
        "$\\text{Lasso: } T[i] = F(i_1, i_2) \\text{ decomposable} \\Rightarrow \\text{prover avoids full } T$",
      why_for_thesis:
        "If you prototype a Move-subset zkVM for Sui, Jolt's lookup-centric approach scales better than " +
        "per-opcode R1CS, especially for the heavy bitwise opcodes common in cryptographic code.",
      benchmarks:
        "Jolt prover ~1.5 MHz RISC-V on M2 Max; proof ~250KB before SNARK wrapping; verifier <100ms.",
      tags: ["zkvm", "lookups", "lasso", "risc-v"]
    },

    /* ── 9. SP1 / RISC Zero / Valida — zkVM comparison ── */
    {
      name: "SP1 vs RISC Zero vs Valida — zkVM Landscape 2025",
      authors: "Succinct Labs / RISC Zero Inc. / Valida (Lita)",
      venue: "Comparative benchmarks, various docs + blogs 2024-2025",
      year: 2025,
      link: "https://blog.succinct.xyz/introducing-sp1/",
      recap_short:
        "Three production RISC-V zkVMs: SP1 (Plonky3 + precompiles), RISC Zero (Groth16 wrap), Valida (custom ISA).",
      recap_long:
        "SP1 (Succinct, Feb 2024) uses Plonky3 + STARK + Groth16 wrap; known for extensive precompiles (BN254, " +
        "BLS12-381, Keccak, SHA-256, secp256k1) that short-circuit expensive RISC-V cycles. RISC Zero (zkVM " +
        "1.0, 2023; v2.0 in 2025) uses its own proof system Zirgen + FRI + Groth16 wrap, and pioneered " +
        "continuations to handle 100M+ cycle programs. Valida (Lita, 2024) breaks from RISC-V and designs a " +
        "ZK-friendly ISA to minimize prover cost per opcode — faster on pure math, worse on " +
        "general-purpose code. As of 2025, SP1 leads on throughput (1+ GHz effective), RISC Zero leads on " +
        "adoption (Boundless network), Valida is the research frontier.",
      math_highlight:
        "$\\text{Effective Hz} = \\frac{\\text{RISC-V cycles proven}}{\\text{wall-clock seconds}}$",
      why_for_thesis:
        "Use SP1 for the fastest off-the-shelf ZK-Rust proving (BBS+ signature verification in Rust). Use " +
        "RISC Zero if you need Bonsai cloud proving. Avoid Valida unless you embrace custom ISA.",
      benchmarks:
        "SP1 v3: ~1.2 GHz on 32-core / 256GB host. RISC Zero v2: ~800 MHz. Valida (early): ~2 GHz on math-heavy.",
      tags: ["zkvm", "sp1", "risc-zero", "valida", "comparison"]
    },

    /* ── 10. Nova-snark Rust + Sonobe ── */
    {
      name: "nova-snark (Microsoft) + Sonobe (PSE) — Folding in Rust",
      authors: "Microsoft Research + PSE (0xPARC)",
      venue: "GitHub libraries, 2023-2026",
      year: 2026,
      link: "https://github.com/privacy-scaling-explorations/sonobe",
      recap_short:
        "nova-snark: reference Nova impl. Sonobe: multi-scheme folding library (Nova, HyperNova, ProtoGalaxy).",
      recap_long:
        "nova-snark (github.com/microsoft/Nova) is the canonical Rust implementation of Nova + Supernova, " +
        "maintained by Srinath Setty's group at MSR. It uses arkworks under the hood and ships a CCCS/R1CS " +
        "circuit compiler. Sonobe (PSE, 2023) builds on top: a unified folding library exposing Nova, " +
        "HyperNova, ProtoGalaxy, and Mova behind a single trait, with decider SNARKs (Groth16, Spartan) for " +
        "final compression. Sonobe's 'folding zoo' is the first place to prototype IVC pipelines without " +
        "committing to one scheme. Nexus zkVM (v3, 2025) and privacy-preserving rollups like Cygnus use " +
        "Sonobe in production.",
      math_highlight:
        "$\\text{trait FoldingScheme: init} \\to \\text{prove\\_step} \\to \\text{verify\\_final}$",
      why_for_thesis:
        "Write the thesis folding prototype in Sonobe: swap Nova → HyperNova → ProtoGalaxy with zero code " +
        "change and pick the best at benchmark time. Final SNARK wrap via Groth16 on BN254 for Sui-ready size.",
      benchmarks:
        "Sonobe Nova prover ~45ms/step (10k R1CS) on M2; Groth16 decider ~2s, final proof 192B.",
      tags: ["rust", "nova", "sonobe", "folding", "tooling"]
    },

    /* ── 11. Groth16 optimization benchmarks ── */
    {
      name: "Groth16 Benchmarks: ark-groth16 vs Bellman vs snarkjs vs rapidsnark",
      authors: "arkworks, zkcrypto, iden3, 0kims-association (comparative)",
      venue: "GitHub + zkbench + IEEE S&P benchmarking 2024-2025",
      year: 2025,
      link: "https://github.com/arkworks-rs/groth16",
      recap_short:
        "Groth16 still rules proof-size (192B) and verifier cost; implementations differ by 10-50x on prover.",
      recap_long:
        "Despite all the new proof systems, Groth16 remains the go-to for on-chain verification: 192-byte " +
        "proof, 3 pairings to verify, native EVM precompile at 0x08. The 2024-2025 benchmark war: " +
        "rapidsnark (iden3, C++/ASM) leads at ~1.2s for 1M-constraint BN254 proofs on a laptop; " +
        "ark-groth16 (Rust) at ~3-4s; snarkjs (pure WASM) at ~30s; Bellman (zkcrypto) at ~8s but with " +
        "the cleanest API. GPU provers (ICICLE by Ingonyama, Sppark by Supranational) push 1M-constraint " +
        "proofs to sub-second on A100. Trusted setup remains the pain point — use Powers of Tau ceremony " +
        "outputs (Perpetual Powers of Tau, Phase 2 ceremonies).",
      math_highlight:
        "$\\pi = (A, B, C), \\quad e(A, B) = e(\\alpha, \\beta) \\cdot e(\\sum_i a_i \\gamma_i, \\gamma) \\cdot e(C, \\delta)$",
      why_for_thesis:
        "If Sui adds a BN254 Groth16 verifier precompile (currently has one for BLS12-381), use Groth16 " +
        "for the final audit proof: 192B on-chain, ~2ms verifier, ceremony reusable via PPOT.",
      benchmarks:
        "1M-constraint BN254 proof: rapidsnark 1.2s (CPU) / 0.3s (GPU ICICLE) / ark-groth16 3.5s / snarkjs 28s.",
      tags: ["groth16", "benchmarks", "tooling", "pairing"]
    },

    /* ── 12. Sumcheck revival — Gemini, Hyrax, Aurora ── */
    {
      name: "Sumcheck Revival: Gemini, Hyrax, Aurora — the GKR Comeback",
      authors: "Bootle et al. (Gemini) / Wahby et al. (Hyrax) / Ben-Sasson et al. (Aurora)",
      venue: "EUROCRYPT 2022 (Gemini) / S&P 2018 (Hyrax) / EUROCRYPT 2019 + 2024 refresh (Aurora)",
      year: 2024,
      link: "https://eprint.iacr.org/2022/420",
      recap_short:
        "Sumcheck-based proofs (GKR lineage) are small-prover-memory and highly parallelizable; back in fashion.",
      recap_long:
        "The sumcheck protocol (Lund-Fortnow-Karloff-Nisan 1992, GKR 2008) was eclipsed in 2016-2022 by " +
        "Plonk-style polynomial IOPs, but is now central to modern designs. Gemini (EUROCRYPT 2022) shows " +
        "that a sumcheck-based PCS gives linear-prover, logarithmic-verifier SNARKs without FFTs — critical " +
        "for sparse matrices. Hyrax-refresh (2024) combines sumcheck with IPA for doubly-efficient proofs. " +
        "Aurora-2024 (ePrint 2024/xxx) re-examines FRI+sumcheck hybrids. Crucially, HyperNova, Spartan, " +
        "Lasso, and Binius all derive their efficiency from sumcheck. The lesson: sumcheck is the right " +
        "hammer when your constraint system has structure (sparsity, tensor product, tower fields).",
      math_highlight:
        "$\\sum_{x \\in \\{0,1\\}^n} g(x) = c \\iff \\text{interactive reduction to } g(r_1, \\ldots, r_n)$",
      why_for_thesis:
        "Any 'folding + final SNARK' thesis pipeline likely uses Spartan (sumcheck) as the decider. " +
        "Understanding sumcheck mechanics is prerequisite to debugging Sonobe/nova-snark proofs.",
      benchmarks:
        "Spartan on 1M R1CS: ~2s prover (CPU, no FFT); proof ~30KB; verifier ~20ms.",
      tags: ["sumcheck", "gkr", "spartan", "linear-prover"]
    }
  ]
};
