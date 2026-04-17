# SOTA Research Queue

Prioritized backlog of topics to integrate into site content
(`ch*-papers-guide.js`, `sota-*.js`).

- **[P0]** — integrate at the next weekly update (Sunday)
- **[P1]** — soon (within 2-3 weeks)
- **[P2]** — eventually / only if time permits

Each item: short title + source hint + target chapter. Add new items at
the bottom of the relevant section; the weekly update script promotes
P0 items first.

---

## Anon creds / BBS+ (ch21)

- [P0] Threshold BBS+ impl benchmarks — IACR 2023/602 follow-up and the
  2024 Dfns / zkMaps threshold-BBS implementations
- [P0] `draft-irtf-cfrg-bbs-signatures-07` ciphersuite review
  (BLS12-381-SHA-256 vs SHAKE-256) — pick the one for Rust PoC
- [P1] EUDI Wallet Architecture Reference Framework v1.4 — BBS+ profile
  section and the relation to ISO mdoc
- [P1] PS rerandomizable signatures 2024-2025 refinements
  (Pointcheval-Sanders — IACR 2024/???, track CFRG list)
- [P1] zk-creds (Rosenberg et al., S&P 2023) — production follow-ups
  and browser-side prover benchmarks
- [P2] BBS vs PS proof-system comparison (size, verification cost,
  threshold-friendliness)
- [P2] Microsoft PrivacyPass + Private Access Tokens — latest IETF
  drafts and iOS 17+ deployment notes

## Confidential TX (ch22)

- [P0] Bulletproofs++ — latest IACR revision (2022/510) benchmarks
  on BLS12-381 and ristretto255
- [P0] Aptos veiled coin (ElGamal-based veiled transactions) — 2024
  update + production gas numbers
- [P1] Flashproofs (IEEE S&P 2022) — 2024 refinements and comparison
  with BP++
- [P1] Binius small-field range proofs — feasibility for confidential
  balance commitments
- [P2] GKR-based range proofs revival (Sumcheck) — compare vs BP++

## TEE / attestation (ch23)

- [P0] Mysten Seal architecture deep dive (Sui-native TEE) — advisor
  constraint: "no TEE lock-in", so document Seal's portability story
- [P0] Intel TDX production deployments 2025 — Azure Confidential VMs,
  GCP Confidential Space, AWS availability
- [P1] NVIDIA H100 / H200 confidential computing + remote attestation
  flow (NVAT)
- [P1] AWS Nitro Enclaves v2 + KMS integration patterns
- [P1] Downfall (CVE-2022-40982) and Inception (2023) recap + 2024
  side-channel CVEs (list from Intel SA-01084 family)
- [P2] AMD SEV-SNP vs Intel TDX — comparative attestation-report
  verification pipeline

## Private payments (ch24)

- [P1] Penumbra mainnet 2024-2025 — shielded IBC flow, fee-payer UX
- [P1] Aztec 3.0 — Noir + client-side proving architecture after
  Aztec Connect sunset
- [P2] Namada multichain private transfers — MASP details
- [P2] Silent Payments BIP352 for Bitcoin — wallet support matrix

## ZK proof systems (ch25)

- [P0] Folding schemes landscape paper — Nova / SuperNova / HyperNova /
  ProtoStar side-by-side (ePrint 2021/370, 2022/1758, 2023/573, 2023/620)
- [P0] Sonobe (PSE) — production-ready folding implementation in Rust,
  pick for P7 PoC
- [P1] Plonky3 production release notes — Binius / small-fields / AIR
  changes since Plonky2
- [P1] Halo2 vs PSE fork divergence — which one does Mysten use
- [P2] Ligero / Brakedown in 2025 — code-based commitments comeback
- [P2] GKR / Sumcheck-based SNARKs revival (Hyrax, Spartan follow-ups)

## Advanced (ch26 + rust)

- [P1] Threshold FHE — OpenFHE 2025, Zama Concrete TFHE-rs 0.9+
- [P1] `arkworks` ecosystem 2025 major-version changes (ark-bls12-381,
  ark-groth16, ark-crypto-primitives)
- [P2] Silent MPC protocols — Pianissimo (2024) + follow-ups
- [P2] PSI latest — Apple PSI 2024 improvements, Meta's delegated PSI
- [P2] Async crypto patterns for Sui Move FFI — reference implementations
  in `sui-crypto` crates

---

**Maintenance**
- Add timestamp `(added YYYY-MM-DD)` after each item when creating it
- Move item to `# Integrated` (bottom, future) once merged into site
- Keep total P0 items ≤ 8 per week to stay within the weekly digest budget
