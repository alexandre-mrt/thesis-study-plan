#!/usr/bin/env python3
"""Build sessions.json for the 15-week thesis prep plan.

Window: 2026-04-20 (Mon) -> 2026-08-01 (Fri), 75 weekdays x 2h = 150h.
Run: python3 _build_sessions.py  (writes ../study-plan/sessions.json)

This script is the source of truth for the schedule. Sessions are defined
as a flat list so phase/week math stays in one place.
"""
from __future__ import annotations
import json
from datetime import date, timedelta
from pathlib import Path

WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
START = date(2026, 4, 20)
END = date(2026, 8, 1)


def weekday_dates(start: date, end: date) -> list[tuple[str, str, int]]:
    """Return [(iso, weekday, week_idx_1based)] for all weekdays in [start, end]."""
    out = []
    d = start
    while d <= end:
        if d.weekday() < 5:
            idx = len(out) + 1
            week = (idx - 1) // 5 + 1
            out.append((d.isoformat(), WEEKDAYS[d.weekday()], week))
        d += timedelta(days=1)
    return out


# --------------------------------------------------------------------------
# Session content (75 entries). Each entry is (title, objectives,
# materials, paper_refs, exercises, sota_note, chapter, phase).
# --------------------------------------------------------------------------

# paper refs map (short keys -> canonical refs from ch*-papers-guide.js)
# Kept intentionally lean: we reference real names, not invented ones.

SESSIONS: list[dict] = []


def add(title: str, chapter: str, phase: str, objectives: list[str],
        materials: list[dict], paper_refs: list[str], exercises: list[str],
        sota_note: str) -> None:
    SESSIONS.append({
        "title": title,
        "chapter": chapter,
        "phase": phase,
        "objectives": objectives,
        "materials": materials,
        "paper_refs": paper_refs,
        "exercises": exercises,
        "sota_note": sota_note,
    })


# ===== PHASE 1 — Weeks 1-3 (15 sessions) =====
# P1 first 3 days = Rust crypto refresher, then BBS+/PS deep dive.

# --- Week 1 ---
add(
    "Rust crypto refresher: ownership, borrow, lifetimes",
    "rust", "P1",
    [
        "Recall move/borrow/lifetime rules on crypto types",
        "Practice &[u8] vs Vec<u8> APIs for keys and signatures",
        "Use Result<T, E> with thiserror for a toy KDF",
        "Zeroize secrets on drop (zeroize crate)",
    ],
    [
        {"type": "doc", "ref": "Rust Book ch 4 + 10", "time_min": 45},
        {"type": "code", "ref": "rust-guide.js block1 fastcrypto section", "time_min": 45},
        {"type": "exercise", "ref": "Write toy HKDF wrapper", "time_min": 30},
    ],
    [],
    [
        "Rewrite a naive clone()-heavy snippet without clones",
        "Add zeroize to a struct holding a secret key",
        "Implement From/TryFrom for a wrapper type over [u8; 32]",
    ],
    "Check arkworks 0.5 migration notes vs 0.4 API.",
)
add(
    "Rust crypto refresher: traits, generics, constant-time",
    "rust", "P1",
    [
        "Read the subtle crate API and constant-time idioms",
        "Trait objects vs generics on crypto primitives (fastcrypto)",
        "Write a ct_eq comparison for two scalars",
        "Understand why branching on secret data is a bug",
    ],
    [
        {"type": "doc", "ref": "subtle crate docs", "time_min": 30},
        {"type": "code", "ref": "fastcrypto Signer/Verifier traits", "time_min": 45},
        {"type": "video", "ref": "Jon Gjengset: crust of Rust generics", "time_min": 30},
    ],
    [],
    [
        "Implement ConstantTimeEq for a 32-byte struct",
        "Design a Signer trait that cannot leak key material",
        "Write a benchmark comparing Vec<u8> vs [u8; 32] dispatch",
    ],
    "Review fastcrypto MSRV + recent breaking changes (2025).",
)
add(
    "Rust + arkworks: groups, fields, pairings",
    "rust", "P1",
    [
        "Navigate ark-bls12-381 and ark-ec APIs",
        "Build a G1/G2 element, hash-to-curve, serialize",
        "Do a pairing e(P, Q) and verify bilinearity",
        "Read ark-serialize canonical (de)serialize",
    ],
    [
        {"type": "doc", "ref": "arkworks book + README", "time_min": 40},
        {"type": "code", "ref": "ark-bls12-381 examples", "time_min": 50},
        {"type": "exercise", "ref": "Schnorr sig over G1", "time_min": 30},
    ],
    [],
    [
        "Implement Schnorr sign/verify on BLS12-381 G1",
        "Verify e(aP, bQ) == e(P, Q)^{ab} experimentally",
        "Measure pairing cost vs scalar mul on BLS12-381",
    ],
    "arkworks 0.5 renamed several traits; confirm against latest release.",
)
add(
    "BBS+ signatures: core construction",
    "ch21", "P1",
    [
        "State the BBS+ signing equation and key layout",
        "Understand EUF-CMA security intuition",
        "Map (A, e, s) triple to bilinear group elements",
        "Derive verify: e(A, X + eG2) == e(B, G2)",
    ],
    [
        {"type": "paper", "ref": "Tessaro-Zhu — Revisiting BBS Signatures (ePrint 2023/275)", "time_min": 60},
        {"type": "video", "ref": "Dan Boneh pairing-based signatures lecture", "time_min": 25},
        {"type": "notes", "ref": "ch21-papers-guide.js — Revisiting BBS Signatures", "time_min": 15},
    ],
    ["tessaro-zhu-bbs-2023"],
    [
        "Reproduce Sign/Verify equations from scratch",
        "Argue why the e term cannot be 0 mod q",
        "Sketch a BBS+ unforgeability reduction to q-SDH",
    ],
    "Track draft-irtf-cfrg-bbs-signatures latest rev + Rust impl status.",
)
add(
    "BBS+ selective disclosure + ZKPoK",
    "ch21", "P1",
    [
        "Describe the prover's randomization of (A, e, s)",
        "Write the Fiat-Shamir protocol for disclosed attrs",
        "Split messages into disclosed vs hidden sets",
        "Understand why rerandomization preserves soundness",
    ],
    [
        {"type": "paper", "ref": "Tessaro-Zhu ePrint 2023/275 §4", "time_min": 45},
        {"type": "paper", "ref": "Camenisch-Lysyanskaya 2004 (CL sigs)", "time_min": 40},
        {"type": "notes", "ref": "ch21-papers-guide.js", "time_min": 15},
    ],
    ["tessaro-zhu-bbs-2023", "cl-sigs-2004"],
    [
        "Derive the Sigma protocol for disclosing attr i",
        "Add Fiat-Shamir hash and output a proof transcript",
        "Show soundness by extractor rewinding sketch",
    ],
    "Compare BBS+ proof size vs CL signatures on BLS12-381.",
)

# --- Week 2 ---
add(
    "BBS+ issuance + blind signing",
    "ch21", "P1",
    [
        "Understand blind issuance for hidden attributes",
        "Follow the commitment + proof of knowledge step",
        "Describe nonce/challenge exchange",
        "Compare blind BBS+ with U-Prove and CL",
    ],
    [
        {"type": "paper", "ref": "Sign. Schemes & Anon Creds from Bilinear Maps (Camenisch-Lysyanskaya)", "time_min": 45},
        {"type": "paper", "ref": "draft-irtf-cfrg-bbs-signatures latest", "time_min": 45},
        {"type": "notes", "ref": "ch21-papers-guide.js — Bilinear Maps paper", "time_min": 15},
    ],
    ["camenisch-lysyanskaya-bilinear-2004"],
    [
        "Write pseudocode for BlindSign and UnblindProof",
        "Identify where the holder could cheat and how Sign prevents it",
        "Design an attribute schema (age, country, KYC level)",
    ],
    "Check PrivacyPass / IETF anon-creds WG drafts for blind BBS+.",
)
add(
    "Pointcheval-Sanders signatures",
    "ch21", "P1",
    [
        "State PS key gen, sign, verify equations",
        "Prove rerandomizability of PS signatures",
        "Compare PS vs BBS+ proof size and verify cost",
        "Map PS onto Coconut threshold issuance",
    ],
    [
        {"type": "paper", "ref": "Pointcheval-Sanders 2016 Short Randomizable Sigs", "time_min": 50},
        {"type": "paper", "ref": "Coconut (Sonnino et al.)", "time_min": 40},
        {"type": "notes", "ref": "ch21-papers-guide.js — Coconut", "time_min": 15},
    ],
    ["pointcheval-sanders-2016", "coconut-2019"],
    [
        "Verify PS rerandomization formulas on paper",
        "Sketch a Coconut threshold issuance flow with t-of-n issuers",
        "Argue why Coconut suits distributed trust on Sui",
    ],
    "Look up PS2 (refreshable) variants from 2024 IACR.",
)
add(
    "Threshold BBS+ and distributed issuance",
    "ch21", "P1",
    [
        "Map Shamir + BBS+ into threshold issuer roles",
        "Understand DKG vs trusted setup for issuers",
        "Describe share reconstruction during sign",
        "Reason about proactive re-sharing",
    ],
    [
        {"type": "paper", "ref": "Threshold BBS+ (IACR 2023/602)", "time_min": 50},
        {"type": "paper", "ref": "Revocable Threshold Anon Creds for Blockchains", "time_min": 40},
        {"type": "notes", "ref": "ch21-papers-guide.js — Revocable Threshold", "time_min": 15},
    ],
    ["threshold-bbs-2023", "revocable-threshold-anon-creds"],
    [
        "Design a (2,3) threshold BBS+ setup diagram",
        "List attack scenarios if one issuer colludes",
        "Contrast with ACM CCS '22 threshold schemes",
    ],
    "Track follow-ups to IACR 2023/602 (2024-2025 refinements).",
)
add(
    "zk-creds and snark-based anon creds",
    "ch21", "P1",
    [
        "Understand zk-creds universal credential framework",
        "Compare snark-based vs BBS+-based creds",
        "Assess proving cost on mobile / in browser",
        "Argue for BBS+ for our thesis given TEE option",
    ],
    [
        {"type": "paper", "ref": "zk-creds: Flexible Anon Creds from zkSNARKs", "time_min": 60},
        {"type": "notes", "ref": "ch21-papers-guide.js — zk-creds", "time_min": 20},
        {"type": "doc", "ref": "PrivacyPass spec overview", "time_min": 20},
    ],
    ["zk-creds"],
    [
        "List attributes where zk-creds beats BBS+",
        "Estimate Groth16 prover time for a 64-attr credential",
        "Design a fallback path from BBS+ to zk-creds",
    ],
    "PrivacyPass 3.0 (Apple PAT) — check latest deployment status.",
)
add(
    "Revocation: accumulators and status lists",
    "ch21", "P1",
    [
        "Compare cryptographic accumulators (RSA, pairing, merkle)",
        "Describe status list 2021 and BitStringStatusList",
        "Understand witness update cost per revocation",
        "Trade off privacy vs update frequency",
    ],
    [
        {"type": "paper", "ref": "Revocable Threshold Anon Creds for Blockchains", "time_min": 45},
        {"type": "paper", "ref": "Nguyen pairing accumulator 2005", "time_min": 35},
        {"type": "doc", "ref": "W3C StatusList2021 spec", "time_min": 25},
    ],
    ["revocable-threshold-anon-creds"],
    [
        "Draw a timeline: issue, revoke, verify with accumulator",
        "Estimate witness update cost for 10M credentials",
        "Decide: status list vs accumulator for our thesis",
    ],
    "W3C VCDM 2.0 status list semantics (2024 CR).",
)

# --- Week 3 ---
add(
    "eIDAS 2.0 and BBS anon creds",
    "ch21", "P1",
    [
        "Summarize eIDAS 2.0 architecture (ARF)",
        "Map BBS to the PID / EAA flow",
        "Understand relying party + wallet + issuer roles",
        "Identify where selective disclosure sits",
    ],
    [
        {"type": "paper", "ref": "Making BBS Anon Creds eIDAS 2.0 Compliant", "time_min": 55},
        {"type": "doc", "ref": "eIDAS 2.0 ARF latest version", "time_min": 35},
        {"type": "notes", "ref": "ch25-papers-guide.js — eIDAS ARF", "time_min": 20},
    ],
    ["bbs-eidas-2024", "eidas-arf"],
    [
        "Diagram a PID issuance using BBS+",
        "List eIDAS 2.0 requirements our thesis must address",
        "Argue for Sui as the target chain for EUDIW payments",
    ],
    "Track ARF 1.8+ and IETF SD-JWT VC vs BBS debate.",
)
add(
    "Post-quantum anon creds (lattice)",
    "ch21", "P1",
    [
        "Overview of lattice-based signatures (Falcon, Dilithium)",
        "Understand module-lattice anon creds",
        "Compare PQ proof size vs BBS+",
        "Identify a PQ migration path for our design",
    ],
    [
        {"type": "paper", "ref": "Post-Quantum Traceable Anon Creds from Module Lattices", "time_min": 60},
        {"type": "notes", "ref": "ch21-papers-guide.js — PQ anon creds", "time_min": 20},
        {"type": "doc", "ref": "NIST PQC status", "time_min": 20},
    ],
    ["pq-traceable-anon-creds"],
    [
        "Sketch a hybrid BBS+/lattice credential",
        "List what would break if BLS12-381 were deprecated",
        "Read 1 recent PQ anon creds paper (2024-2025)",
    ],
    "Check IRTF CFRG on PQ signatures for credentials.",
)
add(
    "Server-aided anon creds + mobile UX",
    "ch21", "P1",
    [
        "Understand server-aided signing for constrained clients",
        "Identify trust assumptions on the aid server",
        "Compare with TEE-assisted signing",
        "Map to our TEE fast path idea",
    ],
    [
        {"type": "paper", "ref": "Server-Aided Anon Creds", "time_min": 55},
        {"type": "notes", "ref": "ch21-papers-guide.js — Server-Aided", "time_min": 20},
        {"type": "doc", "ref": "Mysten Seal architecture notes", "time_min": 25},
    ],
    ["server-aided-anon-creds"],
    [
        "List the aid server's capabilities and bounds",
        "Diagram our TEE fast path vs server-aided model",
        "Identify attacks if the aid server is malicious",
    ],
    "Mysten Seal public design docs — extract primitives.",
)
add(
    "Chain-native identity: blockchain anon creds papers",
    "ch21", "P1",
    [
        "Survey blockchain-based anon creds papers",
        "Extract reusable design patterns",
        "Identify pitfalls (public issuer lists, replay, MEV)",
        "Compare GrAC and AccCred designs",
    ],
    [
        {"type": "paper", "ref": "Blockchain-Based Privacy-Preserving Mobile Payment (Anon Creds)", "time_min": 40},
        {"type": "paper", "ref": "GrAC: Graph-Based Anon Creds on Blockchain", "time_min": 35},
        {"type": "paper", "ref": "AccCred: Accountable Anon Creds", "time_min": 35},
    ],
    ["blockchain-mobile-anon-creds", "grac-graph-anon-creds", "acccred-accountable"],
    [
        "Map each paper's primitives onto Sui Move",
        "Extract a 1-page design doc for our credential module",
        "Identify which ideas we keep and which we drop",
    ],
    "Check 2025 extensions of AccCred on ePrint.",
)
add(
    "P1 review + write-up",
    "ch21", "P1",
    [
        "Consolidate P1 into research-log.md",
        "Summarize BBS+, PS, threshold, revocation, eIDAS",
        "Draft 2 pages on credentials design choice",
        "Open questions list for advisor",
    ],
    [
        {"type": "notes", "ref": "P1 session notes (S01-S14)", "time_min": 40},
        {"type": "doc", "ref": "advisor-summary.md", "time_min": 25},
        {"type": "writing", "ref": "research-log draft", "time_min": 55},
    ],
    [],
    [
        "Write a 2-page BBS+ vs PS trade-off memo",
        "List 5 open questions for the next advisor meeting",
        "Commit notes to research-log/YYYY-MM-DD.md",
    ],
    "Check IETF 121 BBS / SD-JWT VC updates.",
)

# ===== PHASE 2 — Weeks 4-5 (10 sessions): Confidential TX =====

# --- Week 4 ---
add(
    "Confidential Transactions: Pedersen commitments",
    "ch22", "P2",
    [
        "State Pedersen commit = vG + rH with hiding + binding",
        "Understand homomorphic addition of commitments",
        "Explain why G and H must be nothing-up-my-sleeve",
        "Connect Pedersen to UTT coin hiding",
    ],
    [
        {"type": "paper", "ref": "Maxwell — Confidential Transactions", "time_min": 45},
        {"type": "notes", "ref": "ch22-papers-guide.js — Confidential TX", "time_min": 25},
        {"type": "code", "ref": "curve25519-dalek Pedersen example", "time_min": 50},
    ],
    ["maxwell-ct", "utt-2022"],
    [
        "Implement Pedersen commit/open in Rust over Ristretto",
        "Verify homomorphism: commit(a)+commit(b) == commit(a+b)",
        "Explain binding breakdown if H = kG",
    ],
    "Check pasta-curves / curve25519-dalek 5.0 releases.",
)
add(
    "Range proofs: inner product + Bulletproofs",
    "ch22", "P2",
    [
        "Trace the inner-product argument reduction",
        "Understand range proof reduction to IP argument",
        "Proof size: 2 log n + constants",
        "Aggregated range proofs",
    ],
    [
        {"type": "paper", "ref": "Bulletproofs: Short Proofs for Confidential Transactions", "time_min": 60},
        {"type": "notes", "ref": "ch22-papers-guide.js — Bulletproofs", "time_min": 25},
        {"type": "video", "ref": "Dan Boneh Bulletproofs lecture", "time_min": 25},
    ],
    ["bulletproofs"],
    [
        "Derive the 2-round IP argument on paper",
        "Prove the range-proof dimension reduction step",
        "Estimate proof size for 64-bit ranges aggregated x16",
    ],
    "dalek bulletproofs crate: current maintenance status.",
)
add(
    "Bulletproofs+ shorter proofs",
    "ch22", "P2",
    [
        "Identify the protocol change from BP to BP+",
        "Quantify proof size reduction",
        "Understand weighted inner product",
        "Map BP+ onto Monero mainnet",
    ],
    [
        {"type": "paper", "ref": "Bulletproofs+ (BP+)", "time_min": 55},
        {"type": "notes", "ref": "ch22-papers-guide.js — BP+", "time_min": 25},
        {"type": "doc", "ref": "Monero BP+ release notes", "time_min": 30},
    ],
    ["bulletproofs-plus"],
    [
        "Compare BP vs BP+ on paper for n=64",
        "Trace the weighted IP reduction",
        "Design a BP+ aggregated proof for 8 outputs",
    ],
    "Track Monero BP+ post-2022 deployment analytics.",
)
add(
    "Bulletproofs++ and reciprocal set membership",
    "ch22", "P2",
    [
        "Understand reciprocal set membership technique",
        "Explain shorter range + arithmetic proofs",
        "Compare BP++ to BP+ on proving time",
        "Identify implementation libraries (Rust)",
    ],
    [
        {"type": "paper", "ref": "Bulletproofs++ — Next Gen Conf TX", "time_min": 60},
        {"type": "notes", "ref": "ch22-papers-guide.js — BP++", "time_min": 25},
        {"type": "doc", "ref": "BP++ reference impl", "time_min": 25},
    ],
    ["bulletproofs-plus-plus"],
    [
        "Derive the reciprocal set membership check",
        "Estimate proof size for n=64 with BP++",
        "List production blockchains that could adopt BP++",
    ],
    "Latest BP++ IACR revision (2025) — new optimizations.",
)
add(
    "Mimblewimble and cut-through",
    "ch22", "P2",
    [
        "State Mimblewimble's aggregation property",
        "Understand cut-through + kernel offsets",
        "Identify weaknesses: no scripts, flashlight attacks",
        "Compare Grin vs Beam deployments",
    ],
    [
        {"type": "paper", "ref": "Mimblewimble (Jedusor)", "time_min": 50},
        {"type": "notes", "ref": "ch22-papers-guide.js — Mimblewimble", "time_min": 25},
        {"type": "doc", "ref": "Grin MW spec", "time_min": 35},
    ],
    ["mimblewimble"],
    [
        "Walk through a cut-through example with 4 TXs",
        "List 3 privacy flaws of Mimblewimble (flashlight)",
        "Sketch a Mimblewimble + BBS+ auditability layer",
    ],
    "Grin/Beam 2024-2025 activity — is it dead or alive?",
)

# --- Week 5 ---
add(
    "ElGamal veiled transactions (Aptos style)",
    "ch22", "P2",
    [
        "Understand ElGamal additively-homomorphic variant",
        "Contrast with Pedersen for CT",
        "Review Aptos confidential asset module",
        "Identify sigma proofs used for balance integrity",
    ],
    [
        {"type": "paper", "ref": "Aptos veiled transactions whitepaper", "time_min": 45},
        {"type": "doc", "ref": "Aptos confidential-asset module docs", "time_min": 30},
        {"type": "notes", "ref": "advisor-summary.md — ElGamal note", "time_min": 25},
    ],
    [],
    [
        "Implement additively-homomorphic ElGamal in Rust",
        "Prove balance in sigma protocol (commit + challenge + response)",
        "Compare Pedersen vs ElGamal for Sui Move",
    ],
    "Aptos 2024-2025 confidential asset standard updates.",
)
add(
    "Flashproofs and alternate range proofs",
    "ch22", "P2",
    [
        "Understand flashproofs' approach",
        "Compare with BP/BP+/BP++ and Groth16 range",
        "Map latency/size/proving-cost trade-offs",
        "Identify when short-range proofs win",
    ],
    [
        {"type": "paper", "ref": "Flashproofs (IEEE S&P 2022)", "time_min": 55},
        {"type": "notes", "ref": "ch22 notes", "time_min": 25},
        {"type": "doc", "ref": "Survey of range proofs (2024)", "time_min": 35},
    ],
    [],
    [
        "Tabulate range-proof variants on 4 metrics",
        "Pick one variant best fit for Sui Move gas budget",
        "Draft a range-proof benchmark plan",
    ],
    "2024 refinements of Flashproofs on ePrint.",
)
add(
    "Binius small-field proofs for CT",
    "ch22", "P2",
    [
        "Understand binary-field arithmetization",
        "Compare Binius with Plonky3 for range proofs",
        "Assess hardware-friendly SNARKs for CT",
        "Project feasibility in 2026-2027 timeframe",
    ],
    [
        {"type": "paper", "ref": "Binius (Diamond-Posen)", "time_min": 60},
        {"type": "doc", "ref": "Ulvetanna Binius release notes", "time_min": 30},
        {"type": "notes", "ref": "ch22 sota", "time_min": 25},
    ],
    [],
    [
        "Explain why binary fields aid hashing proofs",
        "List primitives Binius accelerates (Keccak, AES)",
        "Sketch a Binius-based range proof plan",
    ],
    "Binius 2025 implementation status (Irreducible).",
)
add(
    "UTT paper deep dive: CT layer",
    "ch22", "P2",
    [
        "Trace UTT coin minting / transfer / burn",
        "Understand budget accounting via Pedersen",
        "Map UTT Schnorr proofs to Sigma protocols",
        "Connect UTT to threshold IBE",
    ],
    [
        {"type": "paper", "ref": "UTT: Decentralized Ecash with Accountable Privacy", "time_min": 70},
        {"type": "notes", "ref": "advisor-summary.md", "time_min": 25},
        {"type": "code", "ref": "utt-rs utt-protocol crate scan", "time_min": 25},
    ],
    ["utt-2022"],
    [
        "Draw UTT transfer flow with Pedersen + Schnorr",
        "Locate the budget proof in the UTT protocol",
        "List 3 UTT design choices we can reuse",
    ],
    "Track utt-rs progress + latest Tomescu talks (2025).",
)
add(
    "P2 review + CT design memo",
    "ch22", "P2",
    [
        "Pick Pedersen vs ElGamal for the thesis PoC",
        "Pick a range proof (BP+ or BP++)",
        "Write a 2-page CT layer memo",
        "Update research-queue with open CT questions",
    ],
    [
        {"type": "notes", "ref": "P2 session notes (S16-S24)", "time_min": 40},
        {"type": "writing", "ref": "CT layer memo", "time_min": 50},
        {"type": "doc", "ref": "advisor-summary §2", "time_min": 30},
    ],
    [],
    [
        "Write a 2-page CT design memo",
        "Append open questions to research-queue.md",
        "Commit notes to research-log/",
    ],
    "Watch for 2026 IACR preprints on short CT range proofs.",
)

# ===== PHASE 3 — Weeks 6-7 (10 sessions): TEE =====

# --- Week 6 ---
add(
    "TEE landscape: SGX, TDX, SEV, Nitro, ARM CCA",
    "ch23", "P3",
    [
        "Map vendor TEEs to threat models",
        "State enclave memory encryption properties",
        "Understand VM-level vs process-level TEEs",
        "Identify relevant primitives for our thesis",
    ],
    [
        {"type": "paper", "ref": "Intel TDX Architecture", "time_min": 55},
        {"type": "paper", "ref": "ARM CCA (Confidential Compute Architecture)", "time_min": 40},
        {"type": "notes", "ref": "ch23-papers-guide.js", "time_min": 25},
    ],
    ["intel-tdx", "arm-cca"],
    [
        "Draw 5-column table: SGX/TDX/SEV/Nitro/CCA",
        "Identify what each TEE does and does NOT protect",
        "Argue which TEE fits our credential fast path",
    ],
    "Intel TDX 2025 production deployments (GCP, Azure).",
)
add(
    "Remote attestation protocols",
    "ch23", "P3",
    [
        "DCAP / ECDSA attestation flow for Intel",
        "Understand measurement (MRENCLAVE / MRTD)",
        "Map to Nitro attestation docs + PKI",
        "Reason about TCB recovery after CVEs",
    ],
    [
        {"type": "paper", "ref": "WireTap: SGX DCAP Key Extraction", "time_min": 50},
        {"type": "paper", "ref": "Trusted Compute Units (TCU)", "time_min": 40},
        {"type": "doc", "ref": "AWS Nitro Enclaves attestation spec", "time_min": 30},
    ],
    ["wiretap-sgx-dcap", "tcu"],
    [
        "Write pseudocode for DCAP quote verification",
        "List 3 attack vectors on attestation",
        "Design a thesis attestation verifier on Sui Move",
    ],
    "AWS Nitro Enclaves v2 + KMS integration patterns.",
)
add(
    "Side-channel attacks on TEE (part 1)",
    "ch23", "P3",
    [
        "Cache side channels (Prime+Probe, Flush+Reload)",
        "Speculative execution classes (Spectre, Meltdown)",
        "Understand Downfall and Inception",
        "Identify mitigations per CPU generation",
    ],
    [
        {"type": "paper", "ref": "TEE.Fail", "time_min": 55},
        {"type": "paper", "ref": "TDXdown", "time_min": 45},
        {"type": "notes", "ref": "ch23-papers-guide.js", "time_min": 20},
    ],
    ["tee-fail", "tdxdown"],
    [
        "Summarize TEE.Fail attack chain in 5 bullets",
        "List CPUs vulnerable to Downfall with patches",
        "Decide: use TEE as fallback vs primary trust",
    ],
    "2024-2025 SGX/TDX CVE list + patch timelines.",
)
add(
    "Side-channel attacks on TEE (part 2)",
    "ch23", "P3",
    [
        "Memory bus attacks (Membuster)",
        "Micro-architectural data sampling",
        "Understand constant-time enclave design",
        "Plan formal verification strategies",
    ],
    [
        {"type": "paper", "ref": "WireTap SGX DCAP Key Extraction", "time_min": 50},
        {"type": "notes", "ref": "ch23 side-channels section", "time_min": 25},
        {"type": "doc", "ref": "Intel SA advisory list (2024-2025)", "time_min": 35},
    ],
    ["wiretap-sgx-dcap"],
    [
        "Draft a threat model for our TEE fast path",
        "List 5 constant-time coding rules for enclaves",
        "Identify attestation freshness requirements",
    ],
    "Inception and related transient attacks follow-up (2024).",
)
add(
    "NVIDIA H100/H200 confidential computing",
    "ch23", "P3",
    [
        "GPU CC model: trusted execution on accelerator",
        "Understand SPDM / CCM attestation",
        "Assess ZK prover acceleration inside GPU TEE",
        "Map to Mysten Seal / TEE VM architectures",
    ],
    [
        {"type": "paper", "ref": "Intel TDX Architecture (TDX Connect)", "time_min": 35},
        {"type": "doc", "ref": "NVIDIA Confidential Computing whitepaper", "time_min": 50},
        {"type": "notes", "ref": "ch23 TEE landscape", "time_min": 35},
    ],
    ["intel-tdx"],
    [
        "Diagram a CPU+GPU attestation chain",
        "Estimate ZK prover speedup with H100 CC on/off",
        "Identify open questions for Mysten advisors",
    ],
    "NVIDIA 2025 CC announcements + SPDM 1.3 spec.",
)

# --- Week 7 ---
add(
    "TEE + blockchain: TeeRollup and zkTLS",
    "ch23", "P3",
    [
        "Understand TeeRollup architecture",
        "Compare zk rollup vs TEE rollup security",
        "Read zkTLS + lightning hot/cold proofs",
        "Map to credential issuance over TEE",
    ],
    [
        {"type": "paper", "ref": "TeeRollup", "time_min": 55},
        {"type": "paper", "ref": "TEE + zkTLS for Lightning Network", "time_min": 45},
        {"type": "notes", "ref": "ch23 Blockchain+TEE", "time_min": 25},
    ],
    ["teerollup", "tee-zktls-lightning"],
    [
        "List TeeRollup trust assumptions",
        "Compare latency: TEE rollup vs zk rollup",
        "Sketch a credential-issuance TEE rollup on Sui",
    ],
    "2025 TEE rollup deployments on Ethereum L2s.",
)
add(
    "TEE + Zcash / FL + ZK: ZLiTE, zkFL-Health",
    "ch23", "P3",
    [
        "Understand ZLiTE light-client TEE",
        "Read zkFL-Health: ZK + TEE federated learning",
        "Assess TEE + ZK hybrid architectures",
        "Identify our hybrid design inspiration",
    ],
    [
        {"type": "paper", "ref": "ZLiTE: Lightweight TEE for Zcash", "time_min": 45},
        {"type": "paper", "ref": "zkFL-Health: ZKP + TEE Verifiable Privacy", "time_min": 45},
        {"type": "notes", "ref": "ch23 papers", "time_min": 25},
    ],
    ["zlite-zcash", "zkfl-health"],
    [
        "Compare ZLiTE vs FlyClient",
        "Draft a TEE+ZK hybrid credential protocol",
        "List what ZK guarantees vs what TEE guarantees",
    ],
    "Check 2025 TEE+ZK hybrid constructions on ePrint.",
)
add(
    "Mysten Seal + Sui-native TEE",
    "ch23", "P3",
    [
        "Read Mysten Seal architecture notes",
        "Understand Sui's native TEE integration plan",
        "Map Seal to our credential fast path",
        "Identify what is public vs NDA",
    ],
    [
        {"type": "doc", "ref": "Mysten Seal blog + whitepaper", "time_min": 55},
        {"type": "notes", "ref": "ch23 TEE + Sui", "time_min": 25},
        {"type": "paper", "ref": "Intel TDX Architecture (for comparison)", "time_min": 30},
    ],
    ["intel-tdx"],
    [
        "Draw Seal integration with Move runtime",
        "List 3 primitives Seal provides we can use",
        "Open questions to ask Mysten advisors",
    ],
    "Mysten Seal roadmap updates 2025-2026.",
)
add(
    "TEE deep research notes consolidation",
    "ch23", "P3",
    [
        "Synthesize tee-deep-research.md main findings",
        "Map each finding to a thesis decision",
        "Identify required mitigations",
        "List TEE assumptions to document formally",
    ],
    [
        {"type": "doc", "ref": "tee-deep-research.md", "time_min": 70},
        {"type": "notes", "ref": "ch23 side-channel + attestation sessions", "time_min": 25},
        {"type": "writing", "ref": "TEE threat model draft", "time_min": 25},
    ],
    [],
    [
        "Write a 2-page TEE threat model",
        "List 5 assumptions we must state in the thesis",
        "Pick TEE vendor stack for the PoC",
    ],
    "2026 side-channel advisories — stay current.",
)
add(
    "P3 review + TEE design memo",
    "ch23", "P3",
    [
        "Consolidate P3 learnings",
        "Pick TEE stack + attestation flow",
        "Finalize TEE threat model",
        "Prepare advisor Q&A",
    ],
    [
        {"type": "notes", "ref": "P3 session notes (S26-S34)", "time_min": 40},
        {"type": "writing", "ref": "TEE design memo", "time_min": 50},
        {"type": "doc", "ref": "advisor-summary + tee-deep-research", "time_min": 30},
    ],
    [],
    [
        "Write 2-page TEE design memo",
        "List 5 advisor questions on TEE",
        "Commit to research-log/",
    ],
    "Upcoming CCS 2026 accepted papers on TEE.",
)

# ===== PHASE 4 — Weeks 8-9 (10 sessions): Private Payments =====

# --- Week 8 ---
add(
    "SoK Privacy-Preserving Transactions",
    "ch24", "P4",
    [
        "Taxonomy: UTXO vs account privacy models",
        "Compare anonymity sets + unlinkability",
        "Identify compliance hooks per design",
        "Map each system to underlying primitives",
    ],
    [
        {"type": "paper", "ref": "SoK: Privacy-Preserving Transactions in Blockchains", "time_min": 60},
        {"type": "paper", "ref": "Hitchhiker's Guide to Privacy-Preserving Digital Payment Systems", "time_min": 45},
        {"type": "notes", "ref": "ch24-papers-guide.js", "time_min": 25},
    ],
    ["sok-privacy-tx", "hitchhiker-privacy-payment"],
    [
        "Build a comparison table across 6 systems",
        "Mark which systems support compliance",
        "List design choices we inherit for our thesis",
    ],
    "Any 2025 privacy-tx SoK follow-up surveys.",
)
add(
    "Zcash architecture and Sapling/Orchard",
    "ch24", "P4",
    [
        "Zcash protocol overview (transparent, shielded)",
        "Sapling: Groth16 + note commitments",
        "Orchard: Halo 2 + action transfers",
        "Understand viewing keys and NU5+",
    ],
    [
        {"type": "doc", "ref": "Zcash protocol spec (NU5+)", "time_min": 55},
        {"type": "paper", "ref": "Halo 2 (for Orchard)", "time_min": 40},
        {"type": "notes", "ref": "ch22 Halo 2 paper", "time_min": 25},
    ],
    ["halo2"],
    [
        "Diagram a Sapling note lifecycle",
        "Contrast Orchard vs Sapling for UX + size",
        "Explain viewing key structure",
    ],
    "Zcash NU6 + proof system migration status.",
)
add(
    "Monero ring signatures + RingCT",
    "ch24", "P4",
    [
        "Understand ring signatures vs CLSAG",
        "RingCT: commitments + range proof (BP+)",
        "Stealth addresses and key images",
        "Assess anonymity set sizing",
    ],
    [
        {"type": "paper", "ref": "Bulletproofs+ (BP+ in Monero)", "time_min": 40},
        {"type": "doc", "ref": "Monero CLSAG + RingCT docs", "time_min": 50},
        {"type": "notes", "ref": "ch22 BP+ notes", "time_min": 30},
    ],
    ["bulletproofs-plus"],
    [
        "Trace a CLSAG signature flow",
        "Compute anonymity set impact of ring size 16",
        "List known deanonymization heuristics",
    ],
    "Monero Jamtis / Seraphis roadmap (2025-2026).",
)
add(
    "Penumbra shielded pool + chain-native privacy",
    "ch24", "P4",
    [
        "Penumbra note/action architecture",
        "Understand DEX privacy via batched auctions",
        "Governance + staking privacy",
        "Assess production adoption",
    ],
    [
        {"type": "doc", "ref": "Penumbra protocol docs v0.80+", "time_min": 60},
        {"type": "paper", "ref": "SoK Privacy-Preserving TX", "time_min": 30},
        {"type": "notes", "ref": "research-log notes", "time_min": 30},
    ],
    ["sok-privacy-tx"],
    [
        "Diagram a Penumbra shielded swap",
        "Compare Penumbra vs Namada on primitives",
        "List what we can port to Sui Move",
    ],
    "Penumbra mainnet 2025 activity + governance outcomes.",
)
add(
    "Aztec 3.0 + Noir client-side proving",
    "ch24", "P4",
    [
        "Aztec state tree + notes model",
        "Noir DSL for private smart contracts",
        "Client-side proving UX patterns",
        "Compare with Sui client-side ZK ideas",
    ],
    [
        {"type": "doc", "ref": "Aztec protocol spec (2025)", "time_min": 50},
        {"type": "doc", "ref": "Noir docs (aztec.nr)", "time_min": 40},
        {"type": "notes", "ref": "ch24 private payment notes", "time_min": 30},
    ],
    [],
    [
        "Write a minimal Noir private coin contract",
        "Estimate client-side proof size + time",
        "Draft a Sui analog using Move + ZK",
    ],
    "Aztec 3.0 mainnet launch readiness 2025-2026.",
)

# --- Week 9 ---
add(
    "Namada multichain private transfers",
    "ch24", "P4",
    [
        "Namada MASP construction",
        "IBC-based shielded transfers",
        "Accounting for privacy budget across chains",
        "Map to our Sui cross-chain thoughts",
    ],
    [
        {"type": "doc", "ref": "Namada v0.30+ spec", "time_min": 55},
        {"type": "paper", "ref": "SoK privacy-preserving TX", "time_min": 25},
        {"type": "notes", "ref": "ch24 notes", "time_min": 40},
    ],
    ["sok-privacy-tx"],
    [
        "Diagram a Namada shielded IBC hop",
        "Identify leak vectors on IBC-shielded TX",
        "Sketch a Sui-IBC shielded path",
    ],
    "Namada mainnet metrics (shielded volumes 2025).",
)
add(
    "Railway + Bitcoin silent payments",
    "ch24", "P4",
    [
        "BIP-352 silent payments flow",
        "Railway / Railgun privacy on Ethereum",
        "Assess UX + address hygiene",
        "Identify gaps for merchants",
    ],
    [
        {"type": "doc", "ref": "BIP-352 silent payments", "time_min": 45},
        {"type": "doc", "ref": "Railgun (0xPARC) docs", "time_min": 45},
        {"type": "notes", "ref": "ch24 notes", "time_min": 30},
    ],
    [],
    [
        "Implement silent payment address derivation in Rust",
        "Compare Railgun vs Aztec for EVM privacy",
        "Draft merchant UX for silent payments",
    ],
    "BIP-352 wallet adoption 2025-2026.",
)
add(
    "UTT deep dive: accountable privacy",
    "ch24", "P4",
    [
        "UTT budget enforcement + accountability",
        "Nullifier design vs Zcash",
        "Threshold IBE registration",
        "Map UTT to our Sui thesis",
    ],
    [
        {"type": "paper", "ref": "UTT: Decentralized Ecash with Accountable Privacy", "time_min": 60},
        {"type": "notes", "ref": "advisor-summary.md", "time_min": 35},
        {"type": "code", "ref": "utt-rs utt-protocol scan", "time_min": 25},
    ],
    ["utt-2022"],
    [
        "Trace a UTT transfer transaction byte by byte",
        "Compare UTT budget vs Zcash viewing keys",
        "List 5 UTT ideas we port to Sui",
    ],
    "Track UTT follow-up papers from VMware + Mysten 2025.",
)
add(
    "Compliance: viewing keys, audit, regulatory hooks",
    "ch24", "P4",
    [
        "Viewing key design (Zcash, Penumbra, Aztec)",
        "Regulatory requirements (MiCA, FATF travel rule)",
        "Balance privacy vs auditability",
        "Draft compliance design for our thesis",
    ],
    [
        {"type": "doc", "ref": "Chainalysis MiCA compliance brief", "time_min": 30},
        {"type": "paper", "ref": "SoK Privacy-Preserving TX", "time_min": 35},
        {"type": "notes", "ref": "advisor-summary.md", "time_min": 25},
        {"type": "doc", "ref": "FATF travel rule guidance", "time_min": 30},
    ],
    ["sok-privacy-tx"],
    [
        "Compare 3 viewing key models",
        "Design our thesis compliance layer (2 pages)",
        "Identify 3 regulators we must satisfy",
    ],
    "MiCA implementing technical standards (2025-2026).",
)
add(
    "P4 review + private payment memo",
    "ch24", "P4",
    [
        "Synthesize private payment designs",
        "Pick base architecture for our PoC",
        "Decide compliance model",
        "Advisor questions",
    ],
    [
        {"type": "notes", "ref": "P4 session notes (S36-S44)", "time_min": 40},
        {"type": "writing", "ref": "Private payment memo", "time_min": 55},
        {"type": "doc", "ref": "advisor-summary.md", "time_min": 25},
    ],
    [],
    [
        "Write 2-page private payment memo",
        "List 5 advisor questions",
        "Commit to research-log/",
    ],
    "Upcoming EC / USENIX Security 2026 private payment papers.",
)

# ===== PHASE 5 — Weeks 10-11 (10 sessions): ZK Proof Systems =====

# --- Week 10 ---
add(
    "Groth16 in depth",
    "ch22", "P5",
    [
        "CRS structure + per-circuit trusted setup",
        "R1CS → QAP transformation",
        "Verifier pairing equation",
        "Known pitfalls (malleability, aggregation)",
    ],
    [
        {"type": "paper", "ref": "Groth16 — Size of Pairing-Based NIZK", "time_min": 55},
        {"type": "notes", "ref": "ch22-papers-guide.js — Groth16", "time_min": 25},
        {"type": "code", "ref": "arkworks Groth16 example", "time_min": 40},
    ],
    ["groth16"],
    [
        "Compile a toy R1CS circuit with ark-relations",
        "Generate a Groth16 proof and verify",
        "Argue why Groth16 setup must be MPC'd",
    ],
    "Groth16 subversion-resistance updates (2024-2025).",
)
add(
    "Plonk + lookups (Plookup, Plonkup, Halo 2)",
    "ch22", "P5",
    [
        "Universal trusted setup (KZG)",
        "Plonk gates + copy constraints",
        "Plookup arguments and Halo 2 table layout",
        "Assess Plonkish vs AIR trade-offs",
    ],
    [
        {"type": "paper", "ref": "PLONK: Permutations over Lagrange-bases", "time_min": 55},
        {"type": "paper", "ref": "Halo 2", "time_min": 40},
        {"type": "notes", "ref": "ch22 PLONK + Halo 2", "time_min": 25},
    ],
    ["plonk", "halo2"],
    [
        "Write a toy Plonkish gate for range proof",
        "Trace Halo 2 table lookup syntax",
        "Compare Plonk vs Groth16 on UX",
    ],
    "PSE Halo 2 fork vs zcash/halo2 divergence (2025).",
)
add(
    "Folding schemes: Nova + SuperNova",
    "ch25", "P5",
    [
        "Understand R1CS folding idea",
        "Nova prover/verifier structure",
        "SuperNova multi-instance folding",
        "Map to IVC + recursive workflows",
    ],
    [
        {"type": "paper", "ref": "Nova (Kothapalli-Setty-Tzialla)", "time_min": 55},
        {"type": "paper", "ref": "SuperNova (Kothapalli-Setty)", "time_min": 40},
        {"type": "notes", "ref": "ch25 notes + zk-deepdive-data", "time_min": 25},
    ],
    [],
    [
        "Derive the Nova folding equation",
        "List SuperNova applications (VMs, zkEVM)",
        "Sketch a Nova + Sui integration",
    ],
    "Sonobe + Nova production releases 2025.",
)
add(
    "HyperNova + ProtoStar",
    "ch25", "P5",
    [
        "HyperNova high-degree custom gates",
        "ProtoStar uniform folding",
        "Trade-off between gate count and folding cost",
        "Map to practical projects",
    ],
    [
        {"type": "paper", "ref": "HyperNova", "time_min": 55},
        {"type": "paper", "ref": "ProtoStar", "time_min": 45},
        {"type": "notes", "ref": "zk-deepdive-data", "time_min": 20},
    ],
    [],
    [
        "Compare Nova/SuperNova/HyperNova/ProtoStar",
        "List which folding scheme fits our thesis",
        "Sketch BBS+ revocation via folding",
    ],
    "2025 folding papers — NeutronNova, etc.",
)
add(
    "Plonky3 and binary-friendly arithmetization",
    "ch25", "P5",
    [
        "Plonky3 production architecture",
        "Mersenne31 field + AIRs",
        "FRI low-degree tests",
        "Compare to STARK + Brakedown",
    ],
    [
        {"type": "doc", "ref": "Plonky3 GitHub + design doc", "time_min": 60},
        {"type": "paper", "ref": "STARK (Ben-Sasson) for comparison", "time_min": 40},
        {"type": "notes", "ref": "ch25 notes", "time_min": 20},
    ],
    [],
    [
        "Write a toy Plonky3 AIR",
        "Trace FRI reduction with 2 layers",
        "Compare Plonky3 vs Binius for our use case",
    ],
    "Plonky3 1.0 release + RISC-V zkVM integrations.",
)

# --- Week 11 ---
add(
    "Binius and binary-field proofs",
    "ch25", "P5",
    [
        "Binary-field arithmetization",
        "Compare to Mersenne31 / Goldilocks",
        "Hardware-friendly hashing proofs",
        "Identify production readiness",
    ],
    [
        {"type": "paper", "ref": "Binius (Diamond-Posen)", "time_min": 60},
        {"type": "doc", "ref": "Ulvetanna / Irreducible blog", "time_min": 30},
        {"type": "notes", "ref": "ch22 Binius + ch25", "time_min": 30},
    ],
    [],
    [
        "Derive Binius field tower reasoning",
        "Estimate proof cost for Keccak-f",
        "Decide Binius role in our PoC",
    ],
    "Binius 2025 benchmarks + open-source releases.",
)
add(
    "STARKs and Ligero/Brakedown",
    "ch25", "P5",
    [
        "STARK arithmetization (AIR)",
        "FRI commitment scheme",
        "Ligero + Brakedown hash-based SNARKs",
        "Compare on prover/verifier cost",
    ],
    [
        {"type": "paper", "ref": "STARK (Ben-Sasson et al.)", "time_min": 55},
        {"type": "paper", "ref": "Ligero / Brakedown", "time_min": 45},
        {"type": "notes", "ref": "ch25 notes", "time_min": 25},
    ],
    [],
    [
        "Trace a FRI check with 3 layers",
        "Compare Ligero vs Brakedown",
        "Map hash-based SNARK to BBS+ verify",
    ],
    "RISC Zero + zkVM STARK updates 2025.",
)
add(
    "GKR + sumcheck revival",
    "ch25", "P5",
    [
        "Sumcheck protocol",
        "GKR for layered circuits",
        "Virgo, Libra, Hyrax legacy",
        "Modern usage: Lasso, Spartan",
    ],
    [
        {"type": "paper", "ref": "Spartan (Setty)", "time_min": 55},
        {"type": "paper", "ref": "Lasso (lookup argument)", "time_min": 45},
        {"type": "notes", "ref": "zk-deepdive-data", "time_min": 20},
    ],
    [],
    [
        "Trace a sumcheck round",
        "Compare Spartan vs Plonk for our use case",
        "List where Lasso helps our circuits",
    ],
    "Lasso + Jolt (a16z) progress 2025-2026.",
)
add(
    "Recursion + proof aggregation",
    "ch25", "P5",
    [
        "Cycle of curves (Halo / Pasta)",
        "Recursive proof composition",
        "Proof aggregation via folding",
        "Map to credential batch verification",
    ],
    [
        {"type": "paper", "ref": "Halo 2 (recursion)", "time_min": 50},
        {"type": "paper", "ref": "Nova (for comparison)", "time_min": 40},
        {"type": "notes", "ref": "zk-deepdive notes", "time_min": 30},
    ],
    ["halo2"],
    [
        "Sketch a batched BBS+ verification via folding",
        "Compare Halo 2 recursion vs Nova folding",
        "Argue for one approach in our PoC",
    ],
    "Proof aggregation tooling 2025 (Nebra, others).",
)
add(
    "P5 review + ZK memo",
    "ch25", "P5",
    [
        "Pick ZK backbone for PoC (Groth16? Halo 2? Nova?)",
        "Pick lookup / range proof strategy",
        "Draft 2-page ZK stack memo",
        "Open questions list",
    ],
    [
        {"type": "notes", "ref": "P5 session notes (S46-S54)", "time_min": 40},
        {"type": "writing", "ref": "ZK stack memo", "time_min": 55},
        {"type": "doc", "ref": "advisor-summary + research-queue", "time_min": 25},
    ],
    [],
    [
        "Write 2-page ZK stack memo",
        "List 5 advisor questions on ZK",
        "Commit to research-log/",
    ],
    "Upcoming CRYPTO 2026 folding / lookup papers.",
)

# ===== PHASE 6 — Week 12 (5 sessions): MPC/FHE Advanced =====

add(
    "MPC fundamentals: GMW, BGW, SPDZ",
    "ch26", "P6",
    [
        "Secret sharing + secure computation",
        "Honest-majority vs dishonest-majority",
        "SPDZ offline/online phases",
        "Map to threshold BBS+ signing",
    ],
    [
        {"type": "paper", "ref": "SPDZ (Damgard et al.)", "time_min": 55},
        {"type": "paper", "ref": "BDOZ / SPDZ2k overview", "time_min": 35},
        {"type": "notes", "ref": "ch26 + advisor-summary", "time_min": 30},
    ],
    [],
    [
        "Trace SPDZ multiplication triple usage",
        "Estimate round complexity for 10 parties",
        "Map to threshold BBS+ signing",
    ],
    "Silent MPC (Pianissimo 2024) follow-ups.",
)
add(
    "Threshold cryptography + BLS / FROST",
    "ch26", "P6",
    [
        "Threshold BLS signatures",
        "FROST threshold Schnorr",
        "DKG protocols (Pedersen, GG18, GG20)",
        "Bias attacks + proactive refresh",
    ],
    [
        {"type": "paper", "ref": "FROST: Flexible Round-Optimized Schnorr Threshold", "time_min": 50},
        {"type": "paper", "ref": "GG20 / threshold BBS+ refs", "time_min": 40},
        {"type": "notes", "ref": "ch26 + rust-guide", "time_min": 30},
    ],
    ["threshold-bbs-2023"],
    [
        "Write pseudocode for FROST sign",
        "List DKG attack scenarios",
        "Compare FROST vs threshold BBS+ for our thesis",
    ],
    "IRTF CFRG FROST standardization status 2025.",
)
add(
    "FHE fundamentals: BGV, BFV, CKKS, TFHE",
    "ch26", "P6",
    [
        "LWE + ring-LWE basics",
        "BGV / BFV exact arithmetic",
        "CKKS approximate arithmetic",
        "TFHE bootstrap + programmable bootstrap",
    ],
    [
        {"type": "paper", "ref": "TFHE (Chillotti et al.)", "time_min": 55},
        {"type": "doc", "ref": "OpenFHE 2025 docs", "time_min": 40},
        {"type": "notes", "ref": "ch26 notes", "time_min": 25},
    ],
    [],
    [
        "Derive LWE decryption eq",
        "Trace a TFHE bootstrap abstractly",
        "List where FHE might help our thesis",
    ],
    "OpenFHE 2025 release + Zama Concrete updates.",
)
add(
    "PSI + private set operations",
    "ch26", "P6",
    [
        "PSI protocols (OPRF, OT-based, FHE-based)",
        "Unbalanced PSI for client-server",
        "Apple PSI design",
        "Identify thesis applicability",
    ],
    [
        {"type": "doc", "ref": "Apple PSI whitepaper", "time_min": 40},
        {"type": "paper", "ref": "Unbalanced PSI (Chen et al.)", "time_min": 45},
        {"type": "notes", "ref": "ch26 notes", "time_min": 35},
    ],
    [],
    [
        "Compare OPRF vs OT-based PSI",
        "Estimate PSI cost for 10k x 1M sets",
        "List PSI use cases for anon creds",
    ],
    "PSI 2024-2025 improvements (DiffPSI etc).",
)
add(
    "P6 review + advanced memo",
    "ch26", "P6",
    [
        "Pick MPC primitives for threshold BBS+",
        "Decide if FHE is in scope",
        "Decide if PSI is in scope",
        "Advisor questions",
    ],
    [
        {"type": "notes", "ref": "P6 session notes (S56-S59)", "time_min": 35},
        {"type": "writing", "ref": "Advanced primitives memo", "time_min": 55},
        {"type": "doc", "ref": "advisor-summary.md", "time_min": 30},
    ],
    [],
    [
        "Write 2-page advanced primitives memo",
        "List 3 advisor questions",
        "Commit to research-log/",
    ],
    "Eurocrypt 2026 accepted MPC/FHE papers.",
)

# ===== PHASE 7 — Weeks 13-14 (10 sessions): Rust Impl =====

# --- Week 13 ---
add(
    "utt-rs: crate map + architecture",
    "rust", "P7",
    [
        "Navigate utt-crypto / utt-protocol / utt-node",
        "Identify public API surface",
        "Map Rust types to UTT paper primitives",
        "Set up cargo workspace locally",
    ],
    [
        {"type": "code", "ref": "~/projects/thesis/Master Thesis/utt-rs — cargo metadata", "time_min": 40},
        {"type": "doc", "ref": "utt-rs README + docs/", "time_min": 40},
        {"type": "paper", "ref": "UTT 2022/452", "time_min": 40},
    ],
    ["utt-2022"],
    [
        "Run cargo build + cargo test on utt-rs",
        "Generate cargo doc and navigate",
        "Draw the crate dependency graph",
    ],
    "Latest Tomescu commits to utt-rs (2025-2026).",
)
add(
    "utt-crypto: Pedersen + Schnorr internals",
    "rust", "P7",
    [
        "Walk Pedersen commit code",
        "Walk Schnorr sigma protocols code",
        "Identify constant-time issues",
        "Benchmark critical paths",
    ],
    [
        {"type": "code", "ref": "utt-rs/utt-crypto src/", "time_min": 70},
        {"type": "doc", "ref": "curve25519-dalek / arkworks APIs", "time_min": 30},
        {"type": "exercise", "ref": "Add cargo bench for Pedersen", "time_min": 20},
    ],
    ["utt-2022"],
    [
        "Measure Pedersen commit perf for 1k ops",
        "Document any non-constant-time code",
        "Write a unit test for edge cases",
    ],
    "Check arkworks 0.5 breakage relevance.",
)
add(
    "utt-protocol: coin / nullifier flow",
    "rust", "P7",
    [
        "Read mint / transfer / burn code paths",
        "Map to UTT paper equations",
        "Identify where budget proofs live",
        "Trace nullifier derivation",
    ],
    [
        {"type": "code", "ref": "utt-rs/utt-protocol src/", "time_min": 70},
        {"type": "paper", "ref": "UTT 2022/452 §3 + §4", "time_min": 30},
        {"type": "exercise", "ref": "Write an integration test for transfer", "time_min": 20},
    ],
    ["utt-2022"],
    [
        "Add a property test for nullifier uniqueness",
        "Document coin struct invariants",
        "Sketch how to port to Sui Move",
    ],
    "utt-rs protocol layer evolution 2025.",
)
add(
    "utt-node: networking + BFT glue",
    "rust", "P7",
    [
        "Walk utt-node main loop",
        "Identify BFT abstractions",
        "Map to Sui consensus (Mysticeti)",
        "Assess what we reuse vs rewrite",
    ],
    [
        {"type": "code", "ref": "utt-rs/utt-node src/", "time_min": 60},
        {"type": "doc", "ref": "Sui Mysticeti whitepaper", "time_min": 40},
        {"type": "notes", "ref": "advisor-summary.md", "time_min": 20},
    ],
    [],
    [
        "List what utt-node abstractions map cleanly to Sui",
        "Identify 3 items to rewrite natively on Sui",
        "Draft migration plan",
    ],
    "Mysticeti v2 updates (2025-2026).",
)
add(
    "PoC scaffold: new crate credential-coin",
    "rust", "P7",
    [
        "Create new Cargo workspace credential-coin",
        "Wire fastcrypto + BLS12-381",
        "Define Credential, Coin, Policy types",
        "Add thiserror + zeroize + subtle",
    ],
    [
        {"type": "code", "ref": "cargo new --lib credential-coin", "time_min": 60},
        {"type": "doc", "ref": "fastcrypto README", "time_min": 30},
        {"type": "exercise", "ref": "Write a skeleton lib.rs + tests", "time_min": 30},
    ],
    [],
    [
        "cargo build + cargo test on skeleton",
        "Add CI stub (.github/workflows)",
        "Commit scaffold",
    ],
    "fastcrypto 2025 API changes.",
)

# --- Week 14 ---
add(
    "PoC impl: BBS+ key gen + sign",
    "rust", "P7",
    [
        "Implement BBS+ KeyGen on BLS12-381",
        "Implement Sign for n attributes",
        "Implement Verify",
        "Unit tests + negative tests",
    ],
    [
        {"type": "code", "ref": "credential-coin/bbs_plus.rs", "time_min": 80},
        {"type": "paper", "ref": "Tessaro-Zhu 2023/275 (ref equations)", "time_min": 25},
        {"type": "exercise", "ref": "Write 5 unit tests", "time_min": 15},
    ],
    ["tessaro-zhu-bbs-2023"],
    [
        "cargo test passes on BBS+",
        "Add test for signature forgery attempt",
        "Benchmark sign/verify for 16 attrs",
    ],
    "draft-irtf-cfrg-bbs-signatures latest changes.",
)
add(
    "PoC impl: BBS+ ZKPoK (selective disclosure)",
    "rust", "P7",
    [
        "Implement prover ZKPoK",
        "Implement verifier",
        "Test disclosure of any subset",
        "Measure proof size",
    ],
    [
        {"type": "code", "ref": "credential-coin/bbs_plus_proof.rs", "time_min": 85},
        {"type": "paper", "ref": "Tessaro-Zhu §4", "time_min": 25},
        {"type": "exercise", "ref": "Fuzz proof verifier", "time_min": 10},
    ],
    ["tessaro-zhu-bbs-2023"],
    [
        "Prove disclosure of attr 0 out of 16",
        "Measure proof size vs disclosed count",
        "Add property test for soundness",
    ],
    "Compare proof size against ref impl (Hyperledger AnonCreds v2).",
)
add(
    "PoC impl: Pedersen + range proof bridge",
    "rust", "P7",
    [
        "Add Pedersen commitments over BLS12-381",
        "Bridge BBS+ signed value to Pedersen",
        "Integrate a range proof library",
        "Link coin value to credential attr",
    ],
    [
        {"type": "code", "ref": "credential-coin/pedersen.rs", "time_min": 70},
        {"type": "doc", "ref": "bulletproofs crate docs", "time_min": 30},
        {"type": "exercise", "ref": "End-to-end integration test", "time_min": 30},
    ],
    [],
    [
        "End-to-end integration test: credential → committed coin",
        "Range proof on coin value",
        "Benchmark end-to-end path",
    ],
    "Evaluate bulletproofs crate vs arkworks bulletproofs.",
)
add(
    "PoC impl: nullifier + spend proof",
    "rust", "P7",
    [
        "Design nullifier derivation (hash + secret)",
        "Implement spend proof (Schnorr-based)",
        "Prevent double-spend logic",
        "Test against known UTT patterns",
    ],
    [
        {"type": "code", "ref": "credential-coin/spend.rs", "time_min": 75},
        {"type": "paper", "ref": "UTT 2022/452 nullifier flow", "time_min": 25},
        {"type": "exercise", "ref": "Double-spend test", "time_min": 20},
    ],
    ["utt-2022"],
    [
        "Cargo test passes double-spend detection",
        "Bench spend proof gen/verify",
        "Document coin lifecycle state machine",
    ],
    "Sui Move object-model implications for nullifiers.",
)
add(
    "PoC wrap-up: docs, bench, CI",
    "rust", "P7",
    [
        "Write crate README + rustdoc",
        "Finalize cargo bench baselines",
        "Set up GitHub Actions CI",
        "Tag v0.1.0",
    ],
    [
        {"type": "code", "ref": "credential-coin README + docs", "time_min": 50},
        {"type": "exercise", "ref": "cargo bench + tarpaulin coverage", "time_min": 40},
        {"type": "doc", "ref": "GitHub Actions Rust template", "time_min": 30},
    ],
    [],
    [
        "README renders cleanly",
        "CI is green",
        "git tag v0.1.0 + commit",
    ],
    "rust-audit tooling (cargo-audit, cargo-deny) latest.",
)

# ===== PHASE 8 — Week 15 (5 sessions): Synthesis =====

add(
    "Synthesis S1: advisor constraints + reread",
    "synthesis", "P8",
    [
        "Reread advisor-summary.md end to end",
        "List advisor's no-go zones (TEE lock-in, etc.)",
        "Extract thesis scope boundaries",
        "List 10 open questions",
    ],
    [
        {"type": "doc", "ref": "advisor-summary.md (full)", "time_min": 60},
        {"type": "doc", "ref": "project_advisor_insights memory", "time_min": 30},
        {"type": "notes", "ref": "All prior research-log entries", "time_min": 30},
    ],
    [],
    [
        "Write a 1-page 'constraints' sheet",
        "Mark each P1-P7 memo against constraints",
        "List 10 open questions for advisor",
    ],
    "Check if advisor published new notes since 2026-03.",
)
add(
    "Synthesis S2: thesis proposal outline",
    "synthesis", "P8",
    [
        "Draft 3-page thesis proposal outline",
        "Title + abstract + contributions",
        "Background + related work",
        "Approach + timeline",
    ],
    [
        {"type": "writing", "ref": "thesis-proposal-outline.md", "time_min": 80},
        {"type": "doc", "ref": "All P1-P7 memos", "time_min": 25},
        {"type": "notes", "ref": "advisor constraints sheet", "time_min": 15},
    ],
    [],
    [
        "Commit thesis-proposal-outline.md v0.1",
        "Identify 5 risk items",
        "Share to advisor for async feedback",
    ],
    "Mysten Labs ongoing thesis topics (public blog).",
)
add(
    "Synthesis S3: threat model + security analysis",
    "synthesis", "P8",
    [
        "Write thesis threat model",
        "Assumptions (TEE, issuer, network)",
        "Formal security goals",
        "Sketch proofs per goal",
    ],
    [
        {"type": "writing", "ref": "threat-model.md", "time_min": 75},
        {"type": "notes", "ref": "P3 TEE memo + P1 credential memo", "time_min": 30},
        {"type": "paper", "ref": "SoK Privacy-Preserving TX — attack taxonomy", "time_min": 15},
    ],
    ["sok-privacy-tx"],
    [
        "Commit threat-model.md v0.1",
        "List proof obligations",
        "List simulator strategies",
    ],
    "Any new formal methods results for anon creds (2025-2026).",
)
add(
    "Synthesis S4: experiment plan + roadmap",
    "synthesis", "P8",
    [
        "Define evaluation metrics",
        "Design benchmarks (proof size, time, TPS)",
        "Define baseline systems",
        "Draft 6-month implementation roadmap",
    ],
    [
        {"type": "writing", "ref": "experiment-plan.md", "time_min": 75},
        {"type": "notes", "ref": "P7 PoC notes", "time_min": 25},
        {"type": "doc", "ref": "Sui testnet specs", "time_min": 20},
    ],
    [],
    [
        "Commit experiment-plan.md v0.1",
        "Identify 3 risk-reduction experiments",
        "Draft Gantt for Sept 2026 - Mar 2027",
    ],
    "Mysticeti / Walrus benchmarks (2025-2026).",
)
add(
    "Synthesis S5: final package + advisor packet",
    "synthesis", "P8",
    [
        "Merge all memos into thesis proposal v1",
        "Write 1-page executive summary",
        "Prepare slide deck outline",
        "Schedule advisor meeting",
    ],
    [
        {"type": "writing", "ref": "thesis-proposal-v1.md", "time_min": 75},
        {"type": "writing", "ref": "executive-summary.md + slides outline", "time_min": 30},
        {"type": "doc", "ref": "All prior memos + research-log", "time_min": 15},
    ],
    [],
    [
        "Commit thesis-proposal-v1.md",
        "Push everything to GitHub",
        "Email advisor a packet link",
    ],
    "Plan the first Mysten onboarding meeting agenda.",
)

# --------------------------------------------------------------------------
# Assemble final JSON
# --------------------------------------------------------------------------

assert len(SESSIONS) == 75, f"expected 75 sessions, got {len(SESSIONS)}"

dates = weekday_dates(START, END)
assert len(dates) == 75, f"expected 75 weekdays, got {len(dates)}"

out = []
for i, (entry, (iso, wd, week)) in enumerate(zip(SESSIONS, dates), 1):
    out.append({
        "id": f"S{i:02d}",
        "date": iso,
        "weekday": wd,
        "week": week,
        "phase": entry["phase"],
        "chapter": entry["chapter"],
        "title": entry["title"],
        "objectives": entry["objectives"],
        "materials": entry["materials"],
        "paper_refs": entry["paper_refs"],
        "exercises": entry["exercises"],
        "sota_note": entry["sota_note"],
        "duration_min": 120,
    })

out_path = Path(__file__).resolve().parent / "sessions.json"
out_path.write_text(json.dumps(out, indent=2, ensure_ascii=False) + "\n")
print(f"wrote {len(out)} sessions to {out_path}")
