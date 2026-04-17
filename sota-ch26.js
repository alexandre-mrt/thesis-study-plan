/**
 * Ch 2.6 Advanced Topics — SOTA 2024-2026
 * MPC, FHE, threshold cryptography, OT extensions, VSS, DKG, PSI, MPCitH, FROST.
 * Rendered as reference cards alongside ch26 paper guides.
 */

window.SOTA_CH26 = {
  items: [
    /* ── 1. Threshold FHE / OpenFHE ── */
    {
      name: "OpenFHE v1.2+ (2024-2025)",
      authors: "OpenFHE Consortium (Duality, Samsung, IBM, Intel, MIT)",
      venue: "Software release (duality.cloud / openfhe.org)",
      year: 2025,
      link: "https://www.openfhe.org/",
      recap_short: "Production-grade C++ FHE library with CKKS/BFV/BGV/FHEW/TFHE and native threshold-FHE (multi-party key gen + distributed decryption).",
      recap_long:
        "OpenFHE 1.2 (2024) consolidated the post-PALISADE landscape by supporting every major FHE scheme under one API and shipping a multi-party interactive protocol that produces a shared public key whose secret is additively split between N parties (threshold FHE). Decryption requires a threshold of partial-decryption shares + noise flooding for simulation security. " +
        "The 2025 line adds hardware acceleration hooks (Intel HEXL, GPU via cuFHE-style back-ends), improved bootstrapping for CKKS (Chen-Han style meta-BTS, ~5-10x speedup over 2022 baselines), and FHEW/TFHE LUT evaluation approaching ~10 ms per gate on modern CPUs. Paired with Lattigo (Go) and HEonGPU it is the de facto reference for deployable FHE.",
      math_highlight:
        "Threshold key-gen: $sk = \\sum_i sk_i$, $pk = (-a \\cdot sk + e, a)$ jointly computed; partial decrypt $\\mu_i = sk_i \\cdot c_1 + e_i^{\\text{flood}}$; combine: $m \\approx c_0 + \\sum_i \\mu_i \\pmod q$.",
      why_for_thesis:
        "Advisor wants TEE-free private computation paths. OpenFHE threshold mode lets Mysten Labs replace a Seal-style enclave custodian with a committee of validators holding FHE shares — candidate building block for Sui-native confidential compute without hardware trust.",
      tags: ["fhe", "threshold", "library", "production", "openfhe"]
    },

    /* ── 2. Zama TFHE-rs / Concrete ML ── */
    {
      name: "TFHE-rs v1.x and Concrete ML 2.x (Zama, 2024-2026)",
      authors: "Zama (Chillotti, Gama, Georgieva, Izabachène, et al.)",
      venue: "Open-source Rust libraries",
      year: 2025,
      link: "https://github.com/zama-ai/tfhe-rs",
      recap_short: "Rust TFHE implementation with programmable bootstrapping; Concrete ML compiles ONNX/PyTorch models to FHE-friendly circuits.",
      recap_long:
        "TFHE-rs exposes encrypted integers (FheUint8..FheUint256) with arithmetic, comparison and look-up tables via programmable bootstrapping (PBS). Each PBS runs at sub-10ms on a modern x86 core and ~1ms with GPU acceleration (Zama's H100 backend, 2025). " +
        "Concrete ML sits on top and transforms quantised neural nets, GBDTs and logistic regression into TFHE circuits, automating parameter selection given a security level and accuracy target. Zama's 2025 fhEVM-Coprocessor and Gateway add an on-chain pattern: encrypted state on Ethereum, off-chain TFHE coprocessor, threshold decryption by a validator set — mirroring the Mysten Seal story but FHE-native.",
      math_highlight:
        "Programmable bootstrap: given $\\text{ct}=\\text{LWE}(m)$, compute $\\text{ct}'=\\text{LWE}(f(m))$ for any $f:\\mathbb{Z}_p\\to\\mathbb{Z}_p$ encoded as a test polynomial, while refreshing noise below threshold.",
      why_for_thesis:
        "Rust-first FHE stack matches the thesis' Rust/Move implementation track. Concrete ML shows a credible path to private inference on user credentials without leaking attributes to a TEE or verifier.",
      tags: ["fhe", "tfhe", "rust", "ml", "zama"]
    },

    /* ── 3. Silent / Pseudorandom-correlation MPC ── */
    {
      name: "Pianissimo and Silent-MPC line (2024-2025)",
      authors: "Boyle, Couteau, Gilboa, Ishai, Kohl, Rindal, Scholl et al.",
      venue: "CRYPTO / EUROCRYPT / IACR ePrint",
      year: 2024,
      link: "https://eprint.iacr.org/2024/429",
      recap_short: "Pseudorandom correlation generators (PCG/PCF) produce Beaver triples and OLE correlations with near-zero communication after a tiny setup.",
      recap_long:
        "Silent MPC replaces bandwidth-heavy offline phases with local expansion of short seeds into huge batches of correlated randomness using LPN or Ring-LPN hardness. The 2024 wave (ePrint 2024/429 and follow-ups) pushes concrete performance below 1 bit per triple amortised and supports vector-OLE, subfield VOLE, and authenticated triples for Mac'n'Cheese / QuickSilver style ZK. " +
        "MP-SPDZ integrates these PCFs as pluggable offline back-ends, so existing MASCOT/SPDZ2k protocols inherit silent-generation speedups. Pianissimo and Ferret-style protocols are now the reference for malicious-secure dishonest-majority MPC offline.",
      math_highlight:
        "PCG for OLE: seeds $k_0,k_1$ expand to shares of $(\\vec x\\otimes \\vec y)$ where $\\vec x,\\vec y\\in\\mathbb{F}^n$ via compressible LPN codes; security reduces to syndrome-decoding with noise rate $\\approx 1/\\log n$.",
      why_for_thesis:
        "If the thesis builds a threshold protocol over Sui (threshold BBS+, ECDSA, DKG), silent correlations are the cheapest practical way to do the offline phase — directly relevant to any on-chain committee that must refresh triples periodically.",
      tags: ["mpc", "silent", "pcg", "correlations"]
    },

    /* ── 4. MP-SPDZ 2024-2025 ── */
    {
      name: "MP-SPDZ 0.3.x-0.4.x (Keller, 2024-2025)",
      authors: "Marcel Keller et al.",
      venue: "Open-source framework (CCS 2020 base, continuous releases)",
      year: 2025,
      link: "https://github.com/data61/MP-SPDZ",
      recap_short: "Reference multi-protocol MPC compiler: 30+ protocols (SPDZ, MASCOT, Semi, Rep3, SPDZ2k, Tiny) with unified Python front-end.",
      recap_long:
        "Keller's framework remains the go-to benchmarking platform. 2024-2025 releases add better GPU support, silent-OT back-ends, improved malicious-secure edaBits for mixed arithmetic/binary computation, and tighter integration with ONNX for private ML. " +
        "The compiler now emits optimised bytecode handling millions of rounds, and the high-level API lets researchers swap the protocol (honest majority vs. dishonest, active vs. passive) with one flag — invaluable for prototyping.",
      math_highlight:
        "SPDZ2k MAC check over $\\mathbb{Z}_{2^{k+s}}$: shares $[x] = (x_i, m_i)$ with $\\sum m_i = \\alpha(\\sum x_i + \\epsilon 2^k)$; batching gives soundness $2^{-s}$ with $s=64$ providing $2^{-64}$ cheating probability.",
      why_for_thesis:
        "MP-SPDZ is the practical tool to prototype any MPC building block (threshold signing, private join, aggregated statistics) before committing to a custom Rust implementation for Sui.",
      tags: ["mpc", "framework", "spdz"]
    },

    /* ── 5. Private Set Intersection ── */
    {
      name: "Apple Private Set Intersection (iOS 18, 2024) + PSI-Analytics",
      authors: "Apple Security Engineering; Chase, Garimella, Miao, Raghuraman, Rindal (research)",
      venue: "Apple Security Research Blog 2024; CCS/USENIX 2024",
      year: 2024,
      link: "https://security.apple.com/blog/contact-key-verification/",
      recap_short: "Apple deployed large-scale PSI in iCloud Contact Key Verification; research PSI-Analytics extends PSI to arbitrary aggregate statistics.",
      recap_long:
        "Apple's 2024 Contact Key Verification uses a Merkle-tree-based transparency log and PSI variants to let users detect unauthorised key changes without revealing their contact graph. This is one of the largest real-world deployments of private-set protocols. " +
        "Academic PSI in 2024-2025 pushes beyond intersection: Circuit-PSI (Pinkas et al.) and PSI-Analytics (Rindal, Chase et al.) output secret-shared results that feed into downstream MPC for count, sum, cardinality with predicates. Vector-OLE based PSI (VOLE-PSI, Rindal 2021 updates) achieves ~4-6 ns/element amortised for billion-scale sets.",
      math_highlight:
        "OPRF-based PSI: $F_k(x) = H_2(x, H_1(x)^k)$ evaluated obliviously via Diffie-Hellman (RFC 9497 OPRF); sender sees $\\{F_k(x_i)\\}$, receiver compares with locally computed values.",
      why_for_thesis:
        "Anonymous credential use-cases frequently reduce to PSI-like flows (proving membership in a private revocation list). 2024-2025 PSI performance makes such hooks concrete and sub-second even on mobile.",
      tags: ["psi", "mpc", "deployment"]
    },

    /* ── 6. Threshold ECDSA post-Lindell ── */
    {
      name: "Threshold ECDSA refinements 2024 (DKLs, Lindell, CGGMP')",
      authors: "Doerner, Kondi, Lee, shelat (DKLs); Canetti, Gennaro, Goldfeder, Makriyannis, Peled (CGGMP')",
      venue: "S&P / CCS 2024",
      year: 2024,
      link: "https://eprint.iacr.org/2023/765",
      recap_short: "Non-interactive / 1-round-online threshold ECDSA with proactive refresh and identifiable abort, now standardised in BIP-style drafts.",
      recap_long:
        "Post-2020 threshold ECDSA had two leading families: DKLs (OT-based, fast online) and CGGMP (Paillier-based, non-interactive pre-signing). 2023-2024 saw refinements: DKLs23 reduces rounds and removes assumptions on OT setup; CGGMP' (2024) fixes subtle soundness issues in range proofs and adds identifiable abort. " +
        "These are shipping in Fireblocks, Safeheron, Coinbase WaaS custody systems. For Bitcoin, the FROST-for-ECDSA gap is closed by ROAST-style aggregation; for EVM, MPC wallets now offer <1s signing with n-of-m committees.",
      math_highlight:
        "ECDSA sig: $s = k^{-1}(H(m) + r \\cdot x) \\bmod n$ with $r = (k \\cdot G).x$; threshold version shares $k$ and $x$ additively and uses MtA (multiplicative-to-additive) conversion: given $[a],[b]$ compute $[a\\cdot b]$ via OT or Paillier.",
      why_for_thesis:
        "If the thesis touches cross-chain (Sui ↔ Bitcoin/EVM), threshold ECDSA is the missing primitive. Advisor's TEE-skepticism aligns with MPC-based custody over enclave-based custody.",
      tags: ["threshold", "ecdsa", "mpc", "custody"]
    },

    /* ── 7. DKG 2024-2025 ── */
    {
      name: "Distributed Key Generation: GLOW, Fouque-Stern, and async DKG (2024-2025)",
      authors: "Groth; Gurkan, Jovanovic, Maller, Meiklejohn, Stern, Wang; Das, Yurek, Xiang, Miller, Kate, Ren",
      venue: "IACR ePrint / CCS / PODC 2024-2025",
      year: 2024,
      link: "https://eprint.iacr.org/2021/005",
      recap_short: "Non-interactive DKG (Groth21/GLOW) and asynchronous DKG (Das-Yurek 2022/updates) now support large validator sets with polynomial-commitment compression.",
      recap_long:
        "Classical Pedersen-DKG (1991) and Feldman VSS remain baselines but don't scale beyond ~50 parties synchronously. GLOW (Gurkan et al. 2021, productionised 2024 in Aleo/Anoma/Sui committees) gives a single-round publicly-verifiable DKG over BLS12-381 with O(n) communication, using KZG-style polynomial commitments + NIZK of correct encryption. " +
        "Async-DKG (Das et al. 2022, refined 2024) tolerates network asynchrony with O(n^3) total communication and is used in HoneyBadger-style BFT. For BBS+/BLS threshold keys, GLOW is the current sweet spot.",
      math_highlight:
        "Feldman commitment: dealer picks $f(X)=s+\\sum a_i X^i$, publishes $(g^s, g^{a_1},\\dots,g^{a_t})$; share $s_i=f(i)$ verified by $g^{s_i} \\stackrel{?}{=}\\prod_j (g^{a_j})^{i^j}$.",
      why_for_thesis:
        "Any threshold primitive (BBS+, BLS, ECDSA, FHE) bootstraps from a DKG. The thesis' committee model needs a concrete DKG choice — GLOW if Sui-native validators, async-DKG if hostile network assumptions.",
      tags: ["dkg", "threshold", "pedersen", "glow"]
    },

    /* ── 8. Silent OT / KOS variants ── */
    {
      name: "Silent OT Extension and KOS 2024 variants",
      authors: "Boyle, Couteau, Gilboa, Ishai, Orrù, Scholl; Keller-Orsini-Scholl (KOS)",
      venue: "CCS 2019 / IACR 2024 updates / Ferret, SoftSpokenOT",
      year: 2024,
      link: "https://eprint.iacr.org/2024/1079",
      recap_short: "Silent OT (Ferret) produces millions of OTs from a seed OT with O(1) amortised communication; SoftSpokenOT tightens KOS.",
      recap_long:
        "KOS (Keller-Orsini-Scholl 2015) has been the workhorse OT-extension since 2015. SoftSpokenOT (2022, updated 2024) removes the small-field assumption and fixes the concrete security bound exposed by Roy's 2022 attack, restoring 128-bit security without extra cost. " +
        "Silent OT (Ferret, 2020 onwards; IACR 2024/1079 and related) uses LPN-based PCGs so two parties expand a one-time seed into arbitrarily many OTs with <1 bit/OT communication — it is the enabler for silent MPC as a whole.",
      math_highlight:
        "OT-extension from correlated OT: given $\\Delta$ and $\\{q_i, q_i\\oplus\\Delta\\cdot x_i\\}$, hash $H(i, q_i)$ and $H(i, q_i\\oplus\\Delta)$ to derive $(m_0^i, m_1^i)$ OT messages; batching via correlation-robust hash.",
      why_for_thesis:
        "Every MPC-flavoured credential protocol reduces to OT at the bottom. Knowing which 2024 variant to pull from libOTe/emp-ot is decisive for thesis implementation quality.",
      tags: ["ot", "silent-ot", "kos", "ferret"]
    },

    /* ── 9. VSS latest ── */
    {
      name: "Publicly Verifiable Secret Sharing (PVSS) with Bulletproofs / KZG (2024)",
      authors: "Gentry, Halevi, Krawczyk, Magri, Nielsen, Rabkin, Yakoubov; Cascudo-David SCRAPE line",
      venue: "IACR ePrint 2024 / CCS 2024",
      year: 2024,
      link: "https://eprint.iacr.org/2021/339",
      recap_short: "Modern PVSS schemes use KZG or inner-product arguments to compress correctness proofs to O(log n) or O(1) group elements.",
      recap_long:
        "Classical Feldman VSS ships O(t) commitments; Pedersen VSS adds hiding. The 2024 wave replaces the NIZK-of-correct-sharing with succinct proofs: KZG-based PVSS (used by Aleo, Anoma, Filecoin) commits to the share polynomial with a single G1 element plus O(1) opening proofs per party. " +
        "YOSO-style (You Only Speak Once) PVSS variants enable proactive resharing without identifying the new committee in advance — useful for MPC-as-a-service on a permissionless blockchain.",
      math_highlight:
        "KZG commit: $C = g^{f(\\tau)}$; opening at point $i$: $\\pi_i = g^{(f(\\tau)-f(i))/(\\tau-i)}$; verify $e(C/g^{f(i)}, g) = e(\\pi_i, g^\\tau / g^i)$.",
      why_for_thesis:
        "PVSS is the glue between DKG and proactive refresh. If the thesis proposes a long-lived committee holding credential-issuer keys, PVSS with succinct proofs is mandatory for on-chain verifiability.",
      tags: ["vss", "pvss", "kzg", "threshold"]
    },

    /* ── 10. MPC-in-the-head: Picnic → Banquet → Limbo → Helium ── */
    {
      name: "MPCitH lineage: Picnic / Banquet / Limbo / Helium (2020-2025)",
      authors: "Chase, Derler, Goldfeder, Orlandi, Ramacher, Rechberger, Slamanig, Zaverucha; de Saint Guilhem; Feneuil-Rivain",
      venue: "CCS / EUROCRYPT / NIST PQ signature on-ramp",
      year: 2024,
      link: "https://microsoft.github.io/Picnic/",
      recap_short: "MPC-in-the-head signatures: Picnic → Banquet → Limbo → Helium iteratively shrink signature size from 34KB to ~5-8KB.",
      recap_long:
        "The MPCitH paradigm proves knowledge of a secret key for a symmetric primitive (LowMC, AES, Rain) by simulating an MPC protocol and revealing all but one party's view. Picnic (2017, NIST round 3) hit ~34KB. Banquet (2021) introduced polynomial-evaluation optimisations, then Limbo (2021) and the 2023-2024 Helium/BN++/SDitH variants pushed signatures to 5-8KB with competitive signing/verification. " +
        "The 2023 NIST post-quantum signature on-ramp selected several MPCitH/VOLEitH candidates (FAEST, SDitH, MIRA, MQOM) for the next round — MPCitH is now a front-runner for PQ signatures that avoid lattice assumptions.",
      math_highlight:
        "MPCitH check: prover commits to $N$ parties' views of computing $C(sk)=pk$; verifier samples $N-1$ seeds (Fiat-Shamir), checks consistency; soundness error $1/N$ per round, repeated $\\tau$ times for $2^{-\\tau \\log N}$ security.",
      why_for_thesis:
        "MPCitH is the PQ backup story for BBS+/PS signatures. If the thesis aims at long-term deployable credentials, MPCitH-based signature primitives are the cleanest hedge without introducing lattice trapdoor machinery.",
      tags: ["mpcith", "picnic", "pq-signature", "zk"]
    },

    /* ── 11. FROST + MuSig2 ── */
    {
      name: "FROST (RFC 9591) and MuSig2 (BIP-327) — 2024-2025 deployment",
      authors: "Komlo, Goldberg (FROST); Nick, Ruffing, Seurin (MuSig2)",
      venue: "IRTF RFC 9591 (2024); BIP-327 (2023); S&P 2023",
      year: 2024,
      link: "https://www.rfc-editor.org/rfc/rfc9591",
      recap_short: "RFC 9591 standardises FROST (threshold Schnorr); BIP-327 ships MuSig2 (n-of-n Schnorr aggregation) to Bitcoin Taproot.",
      recap_long:
        "FROST (Flexible Round-Optimised Schnorr Threshold) achieves two-round threshold Schnorr signing with pre-processing, proven secure in ROM. RFC 9591 (Feb 2024) is the stable standard and underpins Zcash orchard threshold wallets, ZF Frost Rust crate, and multiple Bitcoin signer projects. " +
        "MuSig2 (BIP-327) is the n-of-n counterpart: participants combine public keys into an aggregate and co-sign with two rounds; Taproot transactions are indistinguishable from a single-key Schnorr sig. Together, FROST + MuSig2 give the full threshold-Schnorr menu. ROAST (Ruffing et al.) handles robust asynchronous signing on top.",
      math_highlight:
        "FROST signing: each signer $i$ publishes nonce commit $D_i = g^{d_i}, E_i = g^{e_i}$; binding factor $\\rho_i = H(i, m, B)$; group nonce $R = \\prod_i D_i \\cdot E_i^{\\rho_i}$; share $z_i = d_i + e_i \\rho_i + \\lambda_i s_i c$ with Lagrange $\\lambda_i$ and challenge $c=H(R, X, m)$.",
      why_for_thesis:
        "FROST is the simplest bridge from the thesis' DKG to a live threshold signature on Sui (ed25519-Schnorr) or Bitcoin/Zcash integration. Concrete, standardised, shipping — ideal reference for any committee signing flow.",
      tags: ["frost", "musig2", "schnorr", "threshold", "rfc"]
    },

    /* ── 12. HE for ML — SEAL + OpenFHE ML stack ── */
    {
      name: "HE-for-ML stack: Microsoft SEAL 4.x, OpenFHE-CKKS, TenSEAL (2024-2025)",
      authors: "Microsoft Research; OpenFHE; OpenMined TenSEAL",
      venue: "Libraries + CCS/USENIX Security 2024-2025 papers",
      year: 2025,
      link: "https://github.com/microsoft/SEAL",
      recap_short: "Practical privacy-preserving inference with CKKS (SEAL/OpenFHE) and hybrid HE-MPC (Gazelle, Delphi, Cheetah).",
      recap_long:
        "Microsoft SEAL 4.x remains the de facto CKKS reference; OpenFHE now matches it on performance and exceeds it on feature coverage (FHEW/TFHE, threshold). 2024-2025 work converges on hybrid HE-MPC for deep nets: linear layers via CKKS, non-linear via GC/OT (Cheetah, CrypTen, SIGMA). " +
        "Production deployments: Zama Concrete ML for logistic regression, Duality Cloud for genomic analytics, Apple's 2024 Private Cloud Compute architecture (though attestation-based rather than FHE-based). Bootstrapping-free inference is now realistic for models up to ResNet-20.",
      math_highlight:
        "CKKS encoding: $m \\in \\mathbb{C}^{N/2} \\mapsto \\Delta \\cdot m \\in R_q$; add/mul preserve an approximate encoding with rescaling $\\text{ct}' = \\lfloor \\text{ct}/\\Delta \\rceil$ to control scale growth after multiplication.",
      why_for_thesis:
        "Private inference over credentials (e.g. KYC risk scoring without seeing the attributes) is a realistic advisor-approved demo application — FHE-for-ML is the backbone.",
      tags: ["fhe", "ml", "ckks", "seal"]
    }
  ]
};
