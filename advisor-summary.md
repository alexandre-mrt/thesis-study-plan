# Thesis Direction: From UTT to Credential-Gated Private Payments on Sui

## Summary for Thesis Advisor

### Context
This document relates our thesis work (Anonymous Credentials + ZKP + TEE for identity and private payments on Sui) to the UTT paper (Tomescu et al., 2022) and proposes a concrete research direction.

---

## 1. UTT Paper Recap

**UTT: Decentralized Ecash with Accountable Privacy** (ePrint 2022/452)
Authors: Alin Tomescu, Adithya Bhat, Benny Applebaum, Ittai Abraham, Guy Gueta, Benny Pinkas, Avishay Yanai

### Key Contributions
- **Anonymity budgets**: users can send anonymous payments up to a configurable limit per month. Beyond that threshold, transactions become auditable or public. This is the first system to formalize this "sensible anonymity" model.
- **Decentralized trust**: the bank, auditor, and registration authorities are all distributed via threshold cryptography + BFT consensus (Concord-BFT). No single point of trust.
- **No zkSNARKs**: UTT achieves privacy through carefully co-designed primitives (threshold IBE, Pedersen commitments, Schnorr-based proofs, nullifiers) without heavy ZK circuits, enabling ~1,000 TPS with ~100ms latency, scaling to 10K+ TPS with 60 shards.

### UTT Primitives
| Primitive | Role in UTT |
|-----------|-------------|
| Pedersen commitments | Hide coin values |
| Nullifiers | Prevent double-spend |
| Threshold Boneh-Franklin IBE | Decentralized registration (identity binding) |
| Threshold signatures | Distributed minting authority |
| Schnorr-based proofs | Ownership and balance proofs |
| BFT consensus (Concord-BFT) | Decentralized ledger |

### UTT Protocol Flow
1. **Registration**: user registers with threshold authorities, receives decryption key via threshold IBE
2. **Mint**: public coins → private coins (Pedersen committed values)
3. **Transfer**: user creates transaction with nullifiers + new commitments + Schnorr proofs
4. **Budget enforcement**: the system tracks anonymous spending volume via clever accounting, enforces monthly limits
5. **Burn**: private coins → public coins (when budget exceeded or user chooses transparency)

---

## 2. Relation to Our Thesis

### What UTT does well (and we should learn from)
| UTT Strength | Relevance to Our Work |
|---|---|
| Anonymity budgets | Our payment tiers (micro/low/high) are conceptually similar — privacy is proportional to transaction value |
| Threshold authorities | We need threshold BBS+ issuance for distributed credential trust |
| No zkSNARKs = fast | Challenges our assumption that Groth16 is necessary for on-chain verification |
| Co-designed crypto + consensus | We should co-design credential verification with Sui's object model |
| Registration protocol | Maps to our credential issuance flow |
| Formal MPC-style security | Sets the bar for our security analysis |

### What UTT lacks (our thesis contribution)
| Gap in UTT | Our Solution |
|---|---|
| No identity layer — registration is minimal (just key binding) | BBS+ anonymous credentials with selective disclosure (age, nationality, KYC level) |
| Custom BFT chain (not deployable on existing chains) | Built on Sui — leverages existing ecosystem, validators, and Move VM |
| No credential-gated access to privacy features | Users must prove valid KYC credential before creating private transactions |
| No TEE acceleration | TEE fast path for real-time payments, ZKP for trustless settlement |
| No selective disclosure | BBS+ enables proving specific attributes without revealing others |
| No post-quantum consideration | Our architecture includes a lattice-based migration path |
| Compliance is budget-based only | We add viewing keys + encrypted memos for granular auditing |

---

## 3. Proposed Solution: UTT-Sui

**Core idea**: adapt UTT's anonymity budget model to Sui, replacing the registration protocol with BBS+ credential issuance, adding TEE acceleration, and using Sui's object model for state management.

### Architecture Overview

```
                        CREDENTIAL LAYER
                    ┌─────────────────────┐
                    │  Threshold BBS+     │
                    │  Issuance (MPC)     │
                    │                     │
                    │  Issuer₁ ─┐         │
                    │  Issuer₂ ──┼─ σ_BBS │
                    │  Issuer₃ ─┘         │
                    └────────┬────────────┘
                             │ credential
                             ▼
┌──────────────────────────────────────────────────┐
│                   USER WALLET                     │
│  BBS+ credential (encrypted Sui object)           │
│  Payment notes (Pedersen committed)               │
│  Nullifier secrets                                │
└────────┬──────────────────────────┬───────────────┘
         │ fast path                │ trust path
         ▼                          ▼
┌─────────────────┐    ┌───────────────────────────┐
│   TEE LAYER     │    │    ZKP LAYER (on-chain)    │
│                 │    │                            │
│ SGX enclave:    │    │ Groth16 proof:             │
│ - Verify BBS+   │    │ - Valid credential         │
│ - Check policy  │    │ - Balance sufficient       │
│ - Batch proofs  │    │ - Nullifier correct        │
│                 │    │ - Amount in range           │
│ ~1ms per verify │    │ - Budget not exceeded       │
└────────┬────────┘    └────────────┬───────────────┘
         │                          │
         ▼                          ▼
┌──────────────────────────────────────────────────┐
│              SUI BLOCKCHAIN                       │
│                                                   │
│  Note Registry (Merkle tree, shared object)       │
│  Nullifier Set (sparse Merkle tree)               │
│  Budget Tracker (per-pseudonym monthly totals)    │
│  Credential Verifier (Move module)                │
│  Accumulator (revocation, shared object)          │
│                                                   │
│  Compliance: encrypted memos + viewing keys       │
└──────────────────────────────────────────────────┘
```

### Key Design Decisions

**1. Anonymity budget on Sui (from UTT)**
- Each user has a scoped pseudonym: `nym = PRF(sk, "budget_epoch_N")`
- The pseudonym is linkable within an epoch (monthly) but unlinkable across epochs
- Sui tracks `budget_used[nym]` as a shared object
- Below budget: full privacy (hidden sender, receiver, amount)
- Above budget: transaction details encrypted under auditor's viewing key

**2. BBS+ instead of registration (our contribution)**
- UTT's registration = minimal identity binding via threshold IBE
- Our system: full credential with attributes, enabling selective disclosure
- Credential-gated privacy: must prove `credential.kyc_level >= required_level` before transacting
- This directly addresses regulatory requirements (FATF travel rule, EU MiCA)

**3. TEE fast path (our contribution)**
- UTT achieves speed by avoiding zkSNARKs entirely
- We keep Groth16 for on-chain settlement but add TEE for real-time verification
- Merchant TEE verifies credential + payment in ~1ms
- Periodic batch Groth16 proof settles N payments on Sui

**4. Sui object model advantages (vs UTT's custom chain)**
- Payment notes = owned Sui objects (natural parallelism)
- Nullifier set = shared object (consensus only when needed)
- Budget tracker = shared object (updated per epoch)
- Credential = encrypted owned object in user wallet
- Move type system prevents double-spending by construction

### What Changes from UTT

| UTT Component | Our Adaptation | Primitive Change |
|---|---|---|
| Registration via threshold IBE | BBS+ credential issuance via threshold MPC | IBE → BBS+ (pairing-based, same curve) |
| Schnorr ownership proofs | Groth16 wrapping BBS+ selective disclosure | Schnorr → Groth16 (heavier but more expressive) |
| Custom BFT ledger | Sui blockchain (Mysticeti consensus) | Concord-BFT → Sui validators |
| Pedersen commitments for values | Same (Pedersen on BLS12-381) | No change — reuse UTT's approach |
| Nullifiers | Same structure, adapted for Sui objects | No change — proven design |
| Budget accounting (custom) | Scoped pseudonyms + Sui shared objects | Adapted for Sui's object model |
| No credential verification | BBS+ selective disclosure circuit | New addition |
| No TEE | SGX enclave for fast path | New addition |

---

## 4. Questions for Discussion

### Primitives Questions

**On BBS+ vs UTT's Schnorr approach:**
- UTT avoids zkSNARKs by using Schnorr proofs for balance/ownership. Should we consider a hybrid: Schnorr for simple proofs (balance, ownership) and Groth16 only for credential verification? This could reduce circuit complexity and gas costs.
- What is the minimal circuit needed if we use BBS+ proof-of-knowledge natively (Sigma protocols) instead of wrapping everything in Groth16?

**On anonymity budgets:**
- UTT enforces budgets via linkable pseudonyms within an epoch. How do we implement this on Sui without a custom validator? Can the scoped pseudonym be a derived Sui address?
- Should the budget threshold be per-user (fairness) or per-credential-type (policy flexibility)?
- How do we handle epoch transitions? Users could split payments across epoch boundaries to circumvent budgets.

**On threshold issuance:**
- UTT uses threshold IBE for registration. For our BBS+ issuance, what is the optimal threshold (t, n)? What's the latency overhead of threshold BBS+ signing vs single-signer?
- Should the threshold issuers run inside TEEs for additional protection of key shares?

**On TEE integration:**
- UTT doesn't use TEEs at all — their speed comes from avoiding zkSNARKs. Is TEE acceleration actually necessary if we can reduce the ZK circuit complexity (e.g., by not wrapping BBS+ in Groth16)?
- What is the minimum useful TEE deployment: per-merchant (payment terminal), per-validator (Sui node), or centralized service?

**On Sui-specific design:**
- UTT uses UTXO-like coins. Sui's object model is similar (objects = coins). But Sui shared objects require consensus. Can we design the system to minimize shared object access (only nullifier set + budget tracker)?
- Can the Sui Move verifier be written generically enough to support both Groth16 and future STARK-based proofs (for PQ migration)?

### Research Questions

1. **Is Groth16 wrapping actually necessary?** UTT proves you can build practical private payments without zkSNARKs. Could we use native BBS+ Sigma protocol proofs for everything except on-chain verification, and only use Groth16 for the final on-chain check?

2. **How does the anonymity budget interact with credentials?** In UTT, all users have the same budget. With credentials, different KYC levels could have different budgets — how do we enforce this without linking budget pseudonyms to credential types?

3. **TEE vs larger anonymity sets:** UTT's speed gives it larger anonymity sets (more users = more privacy). If our TEE path is equally fast, can we match UTT's anonymity set guarantees?

4. **Post-quantum migration path:** UTT's Schnorr + Pedersen are quantum-vulnerable. Our Groth16 + BBS+ are also quantum-vulnerable. Lether (ePrint 2026/076) shows lattice-based private payments work. What's the minimal change to our architecture for PQ safety?

5. **Formal security model:** UTT defines an MPC-style ideal functionality. Can we extend their framework to include credential verification? This would give us a formal security proof comparable to UTT's.

---

## 5. Proposed Thesis Contributions (Ranked by Impact)

1. **Credential-gated anonymity budgets on Sui** — extending UTT's model with BBS+ identity verification, enabling compliant private payments on an existing L1
2. **TEE-accelerated credential verification** — dual-path (fast TEE + trustless ZKP) architecture with formal graceful degradation guarantees
3. **Sui Move implementation** — first anonymous credential + private payment system on Sui, leveraging the object model for natural parallelism
4. **Threshold BBS+ issuance protocol** — distributed credential issuance without single-point-of-trust issuer
5. **Post-quantum migration analysis** — concrete plan for transitioning from BBS+/Groth16 to lattice-based alternatives

---

## References

- [UTT: Decentralized Ecash with Accountable Privacy](https://eprint.iacr.org/2022/452) — Tomescu et al., 2022
- [SoK: Anonymous Credentials for Digital Identity Wallets](https://eprint.iacr.org/2026/330) — ePrint 2026
- [OpenAC: Transparent & Lightweight Anonymous Credentials](https://eprint.iacr.org/2026/251) — ePrint 2026
- [Lether: Post-Quantum Account-Based Private Payments](https://eprint.iacr.org/2026/076) — ePrint 2026
- [Quantum-Safe Private Group System for Signal](https://eprint.iacr.org/2026/453) — ePrint 2026
- [PLONK](https://eprint.iacr.org/2019/953) — Gabizon, Williamson, Ciobotaru, 2019
- [Threshold BBS+ Signatures for Distributed Anonymous Credential Issuance](https://www.researchgate.net/publication/372988334) — 2023
