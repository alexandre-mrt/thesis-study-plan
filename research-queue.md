# SOTA Research Queue

Prioritized backlog of topics to integrate into site content
(`ch*-papers-guide.js`, `sota-*.js`).

- **[P0]** — integrate at the next weekly update (Sunday)
- **[P1]** — soon (within 2-3 weeks)
- **[P2]** — eventually / only if time permits

Each item: short title + source hint + target chapter. Add new items at
the bottom of the relevant section; the weekly update script promotes
P0 items first. Keep total P0 items ≤ 8 per week to stay within the
weekly digest budget.

---

## Anon creds / BBS+ (ch21)

- [P0] Threshold BBS+ impl benchmarks — IACR 2023/602 follow-up and the
  2024 Dfns / zkMaps threshold-BBS implementations
- [P0] `draft-irtf-cfrg-bbs-signatures-07` ciphersuite review
  (BLS12-381-SHA-256 vs SHAKE-256) — pick the one for Rust PoC
- [P1] EUDI Wallet Architecture Reference Framework v1.4 — BBS+ profile
  section and the relation to ISO mdoc
- [P1] zk-creds (Rosenberg et al., S&P 2023) — production follow-ups
  and browser-side prover benchmarks
- [P2] BBS vs PS rerandomizable signatures — proof-system comparison
  (size, verification cost, threshold-friendliness, 2024-2025 refinements)

## Confidential TX / Bulletproofs++ (ch22)

- [P0] Bulletproofs++ — latest IACR revision (2022/510) benchmarks
  on BLS12-381 and ristretto255
- [P0] Aptos veiled coin (ElGamal-based veiled transactions) — 2024
  update + production gas numbers
- [P1] Flashproofs (IEEE S&P 2022) — 2024 refinements and comparison
  with BP++
- [P2] Binius small-field range proofs — feasibility for confidential
  balance commitments

## TEE / attestation (ch23)

- [P0] Mysten Seal architecture deep dive (Sui-native TEE) — advisor
  constraint: "no TEE lock-in", so document Seal's portability story
- [P0] Intel TDX production deployments 2025 — Azure Confidential VMs,
  GCP Confidential Space, AWS availability
- [P1] NVIDIA H100 / H200 confidential computing + remote attestation
  flow (NVAT)
- [P1] Downfall (CVE-2022-40982), Inception (2023) and 2024 Intel SA-01084
  family side-channel CVEs recap
- [P2] AMD SEV-SNP vs Intel TDX — comparative attestation-report
  verification pipeline

## ZK folding schemes (ch25)

- [P0] Folding schemes landscape paper — Nova / SuperNova / HyperNova /
  ProtoStar side-by-side (ePrint 2021/370, 2022/1758, 2023/573, 2023/620)
- [P0] Sonobe (PSE) — production-ready folding implementation in Rust,
  candidate for P7 PoC
- [P1] ProtoStar generalization to any special-sound protocol — what it
  unlocks vs HyperNova
- [P2] `nova-snark` (Microsoft) vs Sonobe — API ergonomics and curve
  support for the Rust track

---

**Maintenance**
- Add timestamp `(added YYYY-MM-DD)` after each item when creating it
- Move item to `# Integrated` (bottom, future) once merged into site
- When a daily log flags an item `Queued for: weekly update`, confirm it
  appears here with the right priority
