# Thesis Prep Study Plan — 15 weeks, 75 sessions, 150 h

**Window:** 2026-04-20 (Mon) → 2026-07-31 (Fri). Weekdays only, 2 h per session.
**Gap:** 2026-08-01 → 2026-09-06 is review + Mysten Labs onboarding before the thesis starts 2026-09-07.

## Phase summary

| Phase | Weeks | Sessions | Hours | Dates                    | Focus |
|-------|-------|----------|-------|--------------------------|-------|
| P1    | W01-03 | 15       | 30    | 2026-04-20 → 2026-05-08 | Ch 2.1 Anonymous Credentials + BBS+/PS + Rust refresher |
| P2    | W04-05 | 10       | 20    | 2026-05-11 → 2026-05-22 | Ch 2.2 Confidential Transactions + Pedersen + Bulletproofs++ |
| P3    | W06-07 | 10       | 20    | 2026-05-25 → 2026-06-05 | Ch 2.3 TEE + attestation + side channels |
| P4    | W08-09 | 10       | 20    | 2026-06-08 → 2026-06-19 | Ch 2.4 Private Payments (Zcash / Monero / Penumbra / Namada) |
| P5    | W10-11 | 10       | 20    | 2026-06-22 → 2026-07-03 | Ch 2.5 ZK Proof Systems + folding |
| P6    | W12 | 5       | 10    | 2026-07-06 → 2026-07-10 | Ch 2.6 MPC / FHE advanced |
| P7    | W13-14 | 10       | 20    | 2026-07-13 → 2026-07-24 | Rust implementation (utt-rs deep + credential-coin PoC) |
| P8    | W15 | 5       | 10    | 2026-07-27 → 2026-07-31 | Synthesis + thesis proposal prep |

## P1 — Ch 2.1 Anonymous Credentials + BBS+/PS + Rust refresher

| ID  | Date       | Day | Week | Chapter | Title |
|-----|------------|-----|------|---------|-------|
| S01 | 2026-04-20 | Mon | W01  | rust    | Rust crypto refresher: ownership, borrow, lifetimes |
| S02 | 2026-04-21 | Tue | W01  | rust    | Rust crypto refresher: traits, generics, constant-time |
| S03 | 2026-04-22 | Wed | W01  | rust    | Rust + arkworks: groups, fields, pairings |
| S04 | 2026-04-23 | Thu | W01  | ch21    | BBS+ signatures: core construction |
| S05 | 2026-04-24 | Fri | W01  | ch21    | BBS+ selective disclosure + ZKPoK |
| S06 | 2026-04-27 | Mon | W02  | ch21    | BBS+ issuance + blind signing |
| S07 | 2026-04-28 | Tue | W02  | ch21    | Pointcheval-Sanders signatures |
| S08 | 2026-04-29 | Wed | W02  | ch21    | Threshold BBS+ and distributed issuance |
| S09 | 2026-04-30 | Thu | W02  | ch21    | zk-creds and snark-based anon creds |
| S10 | 2026-05-01 | Fri | W02  | ch21    | Revocation: accumulators and status lists |
| S11 | 2026-05-04 | Mon | W03  | ch21    | eIDAS 2.0 and BBS anon creds |
| S12 | 2026-05-05 | Tue | W03  | ch21    | Post-quantum anon creds (lattice) |
| S13 | 2026-05-06 | Wed | W03  | ch21    | Server-aided anon creds + mobile UX |
| S14 | 2026-05-07 | Thu | W03  | ch21    | Chain-native identity: blockchain anon creds papers |
| S15 | 2026-05-08 | Fri | W03  | ch21    | P1 review + write-up |

## P2 — Ch 2.2 Confidential Transactions + Pedersen + Bulletproofs++

| ID  | Date       | Day | Week | Chapter | Title |
|-----|------------|-----|------|---------|-------|
| S16 | 2026-05-11 | Mon | W04  | ch22    | Confidential Transactions: Pedersen commitments |
| S17 | 2026-05-12 | Tue | W04  | ch22    | Range proofs: inner product + Bulletproofs |
| S18 | 2026-05-13 | Wed | W04  | ch22    | Bulletproofs+ shorter proofs |
| S19 | 2026-05-14 | Thu | W04  | ch22    | Bulletproofs++ and reciprocal set membership |
| S20 | 2026-05-15 | Fri | W04  | ch22    | Mimblewimble and cut-through |
| S21 | 2026-05-18 | Mon | W05  | ch22    | ElGamal veiled transactions (Aptos style) |
| S22 | 2026-05-19 | Tue | W05  | ch22    | Flashproofs and alternate range proofs |
| S23 | 2026-05-20 | Wed | W05  | ch22    | Binius small-field proofs for CT |
| S24 | 2026-05-21 | Thu | W05  | ch22    | UTT paper deep dive: CT layer |
| S25 | 2026-05-22 | Fri | W05  | ch22    | P2 review + CT design memo |

## P3 — Ch 2.3 TEE + attestation + side channels

| ID  | Date       | Day | Week | Chapter | Title |
|-----|------------|-----|------|---------|-------|
| S26 | 2026-05-25 | Mon | W06  | ch23    | TEE landscape: SGX, TDX, SEV, Nitro, ARM CCA |
| S27 | 2026-05-26 | Tue | W06  | ch23    | Remote attestation protocols |
| S28 | 2026-05-27 | Wed | W06  | ch23    | Side-channel attacks on TEE (part 1) |
| S29 | 2026-05-28 | Thu | W06  | ch23    | Side-channel attacks on TEE (part 2) |
| S30 | 2026-05-29 | Fri | W06  | ch23    | NVIDIA H100/H200 confidential computing |
| S31 | 2026-06-01 | Mon | W07  | ch23    | TEE + blockchain: TeeRollup and zkTLS |
| S32 | 2026-06-02 | Tue | W07  | ch23    | TEE + Zcash / FL + ZK: ZLiTE, zkFL-Health |
| S33 | 2026-06-03 | Wed | W07  | ch23    | Mysten Seal + Sui-native TEE |
| S34 | 2026-06-04 | Thu | W07  | ch23    | TEE deep research notes consolidation |
| S35 | 2026-06-05 | Fri | W07  | ch23    | P3 review + TEE design memo |

## P4 — Ch 2.4 Private Payments (Zcash / Monero / Penumbra / Namada)

| ID  | Date       | Day | Week | Chapter | Title |
|-----|------------|-----|------|---------|-------|
| S36 | 2026-06-08 | Mon | W08  | ch24    | SoK Privacy-Preserving Transactions |
| S37 | 2026-06-09 | Tue | W08  | ch24    | Zcash architecture and Sapling/Orchard |
| S38 | 2026-06-10 | Wed | W08  | ch24    | Monero ring signatures + RingCT |
| S39 | 2026-06-11 | Thu | W08  | ch24    | Penumbra shielded pool + chain-native privacy |
| S40 | 2026-06-12 | Fri | W08  | ch24    | Aztec 3.0 + Noir client-side proving |
| S41 | 2026-06-15 | Mon | W09  | ch24    | Namada multichain private transfers |
| S42 | 2026-06-16 | Tue | W09  | ch24    | Railway + Bitcoin silent payments |
| S43 | 2026-06-17 | Wed | W09  | ch24    | UTT deep dive: accountable privacy |
| S44 | 2026-06-18 | Thu | W09  | ch24    | Compliance: viewing keys, audit, regulatory hooks |
| S45 | 2026-06-19 | Fri | W09  | ch24    | P4 review + private payment memo |

## P5 — Ch 2.5 ZK Proof Systems + folding

| ID  | Date       | Day | Week | Chapter | Title |
|-----|------------|-----|------|---------|-------|
| S46 | 2026-06-22 | Mon | W10  | ch22    | Groth16 in depth |
| S47 | 2026-06-23 | Tue | W10  | ch22    | Plonk + lookups (Plookup, Plonkup, Halo 2) |
| S48 | 2026-06-24 | Wed | W10  | ch25    | Folding schemes: Nova + SuperNova |
| S49 | 2026-06-25 | Thu | W10  | ch25    | HyperNova + ProtoStar |
| S50 | 2026-06-26 | Fri | W10  | ch25    | Plonky3 and binary-friendly arithmetization |
| S51 | 2026-06-29 | Mon | W11  | ch25    | Binius and binary-field proofs |
| S52 | 2026-06-30 | Tue | W11  | ch25    | STARKs and Ligero/Brakedown |
| S53 | 2026-07-01 | Wed | W11  | ch25    | GKR + sumcheck revival |
| S54 | 2026-07-02 | Thu | W11  | ch25    | Recursion + proof aggregation |
| S55 | 2026-07-03 | Fri | W11  | ch25    | P5 review + ZK memo |

## P6 — Ch 2.6 MPC / FHE advanced

| ID  | Date       | Day | Week | Chapter | Title |
|-----|------------|-----|------|---------|-------|
| S56 | 2026-07-06 | Mon | W12  | ch26    | MPC fundamentals: GMW, BGW, SPDZ |
| S57 | 2026-07-07 | Tue | W12  | ch26    | Threshold cryptography + BLS / FROST |
| S58 | 2026-07-08 | Wed | W12  | ch26    | FHE fundamentals: BGV, BFV, CKKS, TFHE |
| S59 | 2026-07-09 | Thu | W12  | ch26    | PSI + private set operations |
| S60 | 2026-07-10 | Fri | W12  | ch26    | P6 review + advanced memo |

## P7 — Rust implementation (utt-rs deep + credential-coin PoC)

| ID  | Date       | Day | Week | Chapter | Title |
|-----|------------|-----|------|---------|-------|
| S61 | 2026-07-13 | Mon | W13  | rust    | utt-rs: crate map + architecture |
| S62 | 2026-07-14 | Tue | W13  | rust    | utt-crypto: Pedersen + Schnorr internals |
| S63 | 2026-07-15 | Wed | W13  | rust    | utt-protocol: coin / nullifier flow |
| S64 | 2026-07-16 | Thu | W13  | rust    | utt-node: networking + BFT glue |
| S65 | 2026-07-17 | Fri | W13  | rust    | PoC scaffold: new crate credential-coin |
| S66 | 2026-07-20 | Mon | W14  | rust    | PoC impl: BBS+ key gen + sign |
| S67 | 2026-07-21 | Tue | W14  | rust    | PoC impl: BBS+ ZKPoK (selective disclosure) |
| S68 | 2026-07-22 | Wed | W14  | rust    | PoC impl: Pedersen + range proof bridge |
| S69 | 2026-07-23 | Thu | W14  | rust    | PoC impl: nullifier + spend proof |
| S70 | 2026-07-24 | Fri | W14  | rust    | PoC wrap-up: docs, bench, CI |

## P8 — Synthesis + thesis proposal prep

| ID  | Date       | Day | Week | Chapter | Title |
|-----|------------|-----|------|---------|-------|
| S71 | 2026-07-27 | Mon | W15  | synthesis    | Synthesis S1: advisor constraints + reread |
| S72 | 2026-07-28 | Tue | W15  | synthesis    | Synthesis S2: thesis proposal outline |
| S73 | 2026-07-29 | Wed | W15  | synthesis    | Synthesis S3: threat model + security analysis |
| S74 | 2026-07-30 | Thu | W15  | synthesis    | Synthesis S4: experiment plan + roadmap |
| S75 | 2026-07-31 | Fri | W15  | synthesis    | Synthesis S5: final package + advisor packet |

## Session structure (2 h block)

- **0:00-0:10** Warm-up: re-read previous session notes + lexicon
- **0:10-1:10** Primary learning: paper OR deep dive OR Rust coding
- **1:10-1:25** Exercises: proof reconstruction, implementation, design
- **1:25-1:45** SOTA sub-topic deep dive (follow `sota_note`)
- **1:45-2:00** Log to `research-log/YYYY-MM-DD.md`, flashcards, next-session prep

## How sessions connect to the site

- `paper_refs` slugs map to paper cards under `ch21-papers-guide.js` ... `ch26-papers-guide.js`.
- `chapter` field controls the colour of the Plan-tab grid cell.
- `materials[].ref` is free-form (paper title, GitHub path, video name).
- `sota_note` is the single item you should web-search if you want to go deeper that day.
