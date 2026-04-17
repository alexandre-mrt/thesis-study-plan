/**
 * Ch 2.4 SOTA — Private Payments (2024-2026)
 *
 * State-of-the-art systems, upgrades, and post-mortems for private payment
 * protocols. Each entry is production-tracked: mainnet status, recent
 * changelogs, and current limitations. Rendered by paper-guide.js (or any
 * consumer) via window.SOTA_CH24.
 *
 * Curation rules:
 *   - Every `link` must resolve (project site, changelog, ZIP, BIP, RFC).
 *   - `recap_long` covers architecture + privacy model + known limitations.
 *   - `math_highlight` gives the one equation a reader should remember.
 *   - `why_for_thesis` ties back to the Sui-based private payment design.
 */

window.SOTA_CH24 = {
  updated: "2026-04-17",
  items: [
    /* ── 1. Penumbra Mainnet ── */
    {
      name: "Penumbra Mainnet",
      authors: "Penumbra Labs (Henry de Valence et al.)",
      venue: "Cosmos-SDK zone — mainnet launch 2024-07-30 (Testnet 78 → v0.80)",
      year: 2024,
      link: "https://penumbra.zone/",
      recap_short:
        "Cosmos-based shielded L1 with sealed-bid batch DEX, staking, and " +
        "governance — all on the same shielded pool.",
      recap_long:
        "Penumbra is the first production private-by-default Cosmos zone: " +
        "a single shielded pool supports transfers, delegated staking, IBC, " +
        "and a Frequent Batch Auction DEX (ZSwap). Transactions are built " +
        "from 'actions' (Spend, Output, Delegate, Swap, SwapClaim), each " +
        "carrying its own ZK proof over the Poseidon-hashed Merkle tree of " +
        "notes. Decaf377 is the prime-order group, redesigned from Ristretto " +
        "for Groth16 efficiency. Privacy relies on a full-viewing-key model " +
        "where users scan the chain with trial decryption; light clients use " +
        "per-asset FMD (Fuzzy Message Detection) hints. Batching hides trade " +
        "intent: all swaps in a block clear at one uniform price, removing " +
        "front-running and sandwich MEV by construction.\n\n" +
        "Known limitations (as of v0.80, Feb 2026): the FMD scanning cost " +
        "grows linearly with chain history and no light-client scheme has " +
        "been deployed yet; cross-chain IBC-shielded assets require a " +
        "trusted relayer to translate Penumbra-native assets into generic " +
        "Cosmos tokens; the trusted setup is a 140-participant ceremony " +
        "from 2023 that has not been rotated. Post-quantum migration is " +
        "tracked but unscheduled.",
      math_highlight:
        "Note commitment: $\\mathsf{cm} = \\text{Poseidon}(v, \\text{asset\\_id}, " +
        "\\text{diversifier}, \\text{transmission\\_key}, \\rho)$, " +
        "with nullifier $\\mathsf{nf} = \\text{Poseidon}(\\mathsf{nk}, \\rho, \\mathsf{cm})$.",
      why_for_thesis:
        "Penumbra's multi-action transaction format maps almost directly to " +
        "Sui's programmable transaction blocks (PTBs). Study ZSwap as a " +
        "template for private AMMs on Sui, and the FMD hint mechanism as a " +
        "candidate for scalable wallet scanning in your design.",
      tags: ["cosmos", "mainnet", "shielded-pool", "mev-resistant", "decaf377"]
    },

    /* ── 2. Aztec Sunset + Aztec Network (Public Testnet) ── */
    {
      name: "Aztec Network — Aztec Connect sunset + Noir client-side proving",
      authors: "Aztec Labs (Zac Williamson, Joe Andrews et al.)",
      venue: "Aztec Connect shut down 2024-03; public testnet live 2025-05",
      year: 2025,
      link: "https://aztec.network/blog/a-new-era-for-web3-introducing-aztec-public-testnet",
      recap_short:
        "Aztec pivoted from Aztec Connect (Ethereum L1 shielded pool) to a " +
        "fully private L2 where users generate proofs on their own device " +
        "using Noir + Barretenberg's UltraHonk backend.",
      recap_long:
        "Aztec Connect (2022–2024) was a single-pool shielded rollup on " +
        "Ethereum L1, shut down in March 2024 after failing to reach product-" +
        "market fit alongside the Aztec Network L2 effort. The new Aztec L2 " +
        "is a hybrid private/public zkRollup where every account has a " +
        "private and a public state tree. Contracts are written in Noir, a " +
        "Rust-like DSL that compiles to ACIR; client-side proofs are " +
        "generated with Barretenberg using UltraHonk (2024) and now ClientIVC " +
        "(folding-based proof recursion, 2025). A sequencer aggregates " +
        "user-generated proofs into a rollup proof verified on L1.\n\n" +
        "Privacy model: UTXO-style private notes encrypted to recipient " +
        "public keys, with nullifiers for spend tracking. Public state uses " +
        "an Ethereum-style account model for composability. Known limits: " +
        "client-side proving still takes 30-90s on a laptop for a typical " +
        "transfer; encrypted note broadcast is a liveness + storage concern; " +
        "the public testnet has no economic guarantees and the mainnet " +
        "launch has slipped multiple times (currently H2 2026 target).",
      math_highlight:
        "ClientIVC folding: given instances $U_1, U_2$ with witnesses " +
        "$w_1, w_2$, fold to $U' = U_1 + r \\cdot U_2$ such that a single " +
        "final SNARK verifies the entire fold; cost amortises across notes.",
      why_for_thesis:
        "Aztec is the reference implementation for fully-private smart " +
        "contracts with client-side proving — directly relevant if your " +
        "thesis explores putting ZK proof generation on the user device " +
        "vs. a TEE-delegated prover. The Noir / ACIR toolchain is a " +
        "portable alternative to circom/halo2 for your PoC.",
      tags: ["ethereum-l2", "noir", "client-side-proving", "ultrahonk", "clientivc"]
    },

    /* ── 3. Namada ── */
    {
      name: "Namada — Multichain Asset Shielding (MASP) mainnet",
      authors: "Anoma Foundation / Heliax (Adrian Brink, Awa Sun Yin et al.)",
      venue: "Mainnet Phase 2 'Shielded Expedition' → MASP live 2024-03; " +
        "shielded rewards live 2024-12",
      year: 2024,
      link: "https://namada.net/blog/understanding-the-masp-and-cc-circuits",
      recap_short:
        "Cosmos-SDK chain with a Multi-Asset Shielded Pool: Zcash Sapling " +
        "circuits extended to support any IBC-bridged asset in a single " +
        "shielded set.",
      recap_long:
        "Namada's headline primitive is MASP (Multi-Asset Shielded Pool), " +
        "a generalisation of Zcash's Sapling circuit where note commitments " +
        "include an asset type tag. Any IBC-imported asset (ATOM, OSMO, " +
        "USDC-Noble, etc.) can enter the same shielded pool, so anonymity " +
        "sets compose across assets instead of fragmenting per-token. " +
        "Namada also ships 'shielded rewards': a protocol subsidy paid in " +
        "NAM to shielded holders, proportional to their time-weighted " +
        "shielded balance, proved in ZK without revealing the amount. " +
        "Consensus is CometBFT, proofs use Groth16 over BLS12-381.\n\n" +
        "Known limitations: the shielded-set anonymity is only as large as " +
        "the active shielded user base, which remains small (~hundreds of " +
        "thousands of notes as of early 2026); asset-type tagging leaks " +
        "metadata during transparent↔shielded conversion; like Zcash " +
        "Sapling, MASP relies on the 2018 Powers of Tau + Sapling MPC " +
        "ceremony, inherited unchanged; no post-quantum migration path.",
      math_highlight:
        "MASP note: $n = (d, pk_d, v, t, \\rho, \\text{rcm})$ where " +
        "$t$ is the asset type; commitment " +
        "$\\mathsf{cm} = \\text{PedersenHash}(d \\,\\|\\, pk_d \\,\\|\\, v \\,\\|\\, t \\,\\|\\, \\rho, \\text{rcm})$.",
      why_for_thesis:
        "MASP is the template for 'one shielded pool, many assets' — exactly " +
        "the design question if your Sui payment system supports multiple " +
        "Coin<T> types. Study the asset-type commitment encoding and the " +
        "transparent↔shielded conversion leakage analysis.",
      tags: ["cosmos", "masp", "multi-asset", "shielded-rewards", "ibc"]
    },

    /* ── 4. Silent Payments (BIP 352) ── */
    {
      name: "Silent Payments — BIP 352",
      authors: "Ruben Somsen, josibake, Rich Grijzenhout",
      venue: "BIP 352 final 2024; Bitcoin Core PR #28122 (scan support, 2025)",
      year: 2024,
      link: "https://github.com/bitcoin/bips/blob/master/bip-0352.mediawiki",
      recap_short:
        "Reusable static Bitcoin receive addresses that produce a fresh, " +
        "unlinkable output per payment — no interaction, no notifications.",
      recap_long:
        "Silent Payments let a receiver publish one static address " +
        "$(B_{\\text{scan}}, B_{\\text{spend}})$ that senders use to derive " +
        "a new P2TR output per payment via ECDH. The sender computes a " +
        "shared secret $s = H(a \\cdot B_{\\text{scan}})$ from their private " +
        "key and the receiver's scan pubkey; the output key is " +
        "$P = B_{\\text{spend}} + s \\cdot G$. Each payment lands at a " +
        "fresh, unlinkable key, while the receiver scans every block with " +
        "their scan key. No side channel, no lightning-style invoice flow, " +
        "no address-reuse.\n\n" +
        "Status (Apr 2026): BIP 352 is final; Bitcoin Core merged scanning " +
        "infrastructure in the 28.x series (PRs #28122, #30108) behind a " +
        "build flag; third-party wallets shipping support include Cake " +
        "Wallet, Silentium, BlueWallet (experimental), and Dana Wallet. " +
        "Full-node scanning cost is the main limitation: every wallet must " +
        "ECDH against every taproot output, so light clients need a server-" +
        "side index or BIP 158-style filter extension (BIP 352 defines a " +
        "tweak-set per block; indexing proposals are in draft).",
      math_highlight:
        "Per-output tweak: $t_k = H_{\\text{BIP0352/Label}}(s \\,\\|\\, k)$, " +
        "output key $P_k = B_{\\text{spend}} + t_k \\cdot G$, " +
        "scan: for each tx, try $s' = H(b_{\\text{scan}} \\cdot A)$ with " +
        "input pubkey sum $A$.",
      why_for_thesis:
        "Silent Payments solve 'stealth addresses' without any trusted " +
        "infrastructure — a benchmark for what's achievable on an account " +
        "or UTXO chain without ZK. If your Sui design offers receiver " +
        "privacy, BIP 352's scanning economics (cost vs. receiver latency) " +
        "is the baseline to beat.",
      tags: ["bitcoin", "bip", "stealth-address", "taproot", "ecdh"]
    },

    /* ── 5. Zcash NU6 + Crosslink / Project Tachyon ── */
    {
      name: "Zcash NU6 and the Orchard → Halo 2 transition",
      authors: "Electric Coin Co. + Zcash Foundation (Daira Emma Hopwood et al.)",
      venue: "NU5 activated 2022-05 (Orchard); NU6 activated 2024-11 " +
        "(funding-stream update); NU6.1 in-flight 2026",
      year: 2024,
      link: "https://zips.z.cash/zip-0253",
      recap_short:
        "Zcash migrated from Sprout (BCTV14) → Sapling (Groth16) → Orchard " +
        "(Halo 2, no trusted setup), and is now iterating on funding + " +
        "planned protocol overhaul (Crosslink / Tachyon).",
      recap_long:
        "The Zcash protocol stack as of NU6 consists of three shielded " +
        "pools: Sprout (legacy, being deprecated; ZIP-2003 enforces " +
        "turnstile-only exit), Sapling (Groth16 + Jubjub), and Orchard " +
        "(Halo 2 + Pallas/Vesta Pasta curves, no trusted setup via inner-" +
        "product argument recursion). NU6 (Nov 2024, ZIP-253/1015) was a " +
        "tokenomics/governance upgrade: dev-fund reallocation and lock-" +
        "box mechanism, no cryptographic change. NU6.1 (in proposal as of " +
        "Apr 2026) extends the funding scheme and adds ZIP-233 'block " +
        "subsidy burn'.\n\n" +
        "Research track beyond NU6: 'Crosslink' (ZIP-1001) hybridises " +
        "Zcash PoW finality with a BFT finality gadget (~3 min finality); " +
        "'Project Tachyon' (announced 2024-10) is a full protocol rewrite " +
        "proposal targeting oblivious sync, scalable wallets (no full-chain " +
        "scan), and better asset issuance (ZSAs, ZIP-227/228). Known " +
        "limitations of today's Zcash: shielded usage is still <5% of " +
        "total tx volume; trial decryption dominates mobile wallet cost; " +
        "no post-quantum plan until Tachyon lands.",
      math_highlight:
        "Halo 2 inner-product argument folds instances without trusted " +
        "setup: $\\pi_{\\text{IPA}}: \\langle \\mathbf{a}, \\mathbf{b} \\rangle = c$ " +
        "with polynomial commitments $P = \\langle \\mathbf{a}, \\mathbf{G} \\rangle + c \\cdot H$, " +
        "recursively verified across blocks.",
      why_for_thesis:
        "Zcash is the oldest shielded-pool case study. Track the Tachyon " +
        "redesign proposals for SoTA thinking on 'oblivious sync' (light " +
        "clients without full scan) — one of the open problems your Sui " +
        "design must address.",
      tags: ["zcash", "halo2", "orchard", "nu6", "tachyon", "zip"]
    },

    /* ── 6. Monero — Seraphis + Jamtis ── */
    {
      name: "Monero — Seraphis + Jamtis long-term redesign",
      authors: "koe, UkoeHB, Monero Research Lab",
      venue: "Active research branch; targeting 2026-2027 fork; FCMP++ " +
        "(Full-Chain Membership Proof) scheduled sooner",
      year: 2025,
      link: "https://github.com/UkoeHB/Seraphis",
      recap_short:
        "Next-generation Monero transaction protocol replacing ring " +
        "signatures with membership proofs over the full chain; Jamtis is " +
        "the new address format with view-tag optimisation.",
      recap_long:
        "Monero's current CLSAG+RingCT design has a ring size of 16, so " +
        "sender anonymity is 1-in-16 per input — repeatedly critiqued in " +
        "academic attacks (Möser et al. 2018, OSPEAD 2024). Seraphis " +
        "replaces ring signatures with a composition proof over a Merkle " +
        "tree of all enote outputs, giving anonymity-set = entire chain. " +
        "Jamtis is the companion address format: a 196-char human-readable " +
        "address with mandatory view tags (1-byte per enote) that cut " +
        "wallet-scan cost by ~256x. Transaction structure: Seraphis " +
        "'enotes' (like Zcash notes) with one-time addresses, ephemeral " +
        "pubkeys, and amount commitments, spent via a spend-proof that " +
        "commits to a Merkle root of the entire output set.\n\n" +
        "Timeline (Apr 2026): Seraphis+Jamtis is still in code review; " +
        "the nearer-term upgrade is FCMP++ (Full-Chain Membership Proofs), " +
        "a set of Curve-trees-based proofs that can be bolted onto today's " +
        "protocol to give full-chain anonymity without the full Seraphis " +
        "rewrite — targeted for 2026 hard fork. Limitations: FCMP++ proofs " +
        "are ~10KB per input (vs. ~2KB for CLSAG-16) and verification is " +
        "5-10x slower; Seraphis will need a long migration path to drain " +
        "the legacy pool.",
      math_highlight:
        "Seraphis composition proof: prove knowledge of " +
        "$(k^s, k^{vb}, k^m)$ such that $K_o = k^s G + k^{vb} X + k^m U$ " +
        "and $K_o$ is in the Merkle tree of enote outputs, without " +
        "revealing $K_o$'s index.",
      why_for_thesis:
        "Monero's FCMP++ is a live example of migrating from ring " +
        "signatures to full-chain membership proofs — the same design " +
        "question you face if your Sui payment system needs 'sender " +
        "anonymous among all users who ever held this coin type'. Study " +
        "the Curve-trees construction (Campanelli–Hall-Andersen–Kamp 2022).",
      tags: ["monero", "seraphis", "jamtis", "fcmp", "curve-trees", "ring-signature"]
    },

    /* ── 7. Railgun (Bitcoin/EVM privacy) ── */
    {
      name: "Railgun — Private DeFi (multi-chain)",
      authors: "Railgun Privacy System DAO (Kieran Mesquita et al.)",
      venue: "Ethereum mainnet 2022; Arbitrum, BNB, Polygon 2023-24; " +
        "multi-L2 expansion + RAILGUN Rails (2025)",
      year: 2025,
      link: "https://www.railgun.org/",
      recap_short:
        "EVM-native shielded pool for any ERC-20 plus in-pool DeFi " +
        "composability; uses Poseidon-Merkle notes + Groth16 proofs and a " +
        "'Private Proofs of Innocence' compliance module.",
      recap_long:
        "Railgun deploys a shielded-pool contract on each supported EVM " +
        "chain. Users shield by depositing ERC-20s (producing notes " +
        "committed to a Poseidon-Merkle tree) and transact privately via " +
        "Groth16 proofs that check input note ownership, nullifier " +
        "uniqueness, and output commitment correctness. The innovation " +
        "over Tornado Cash is composability: relayers can execute DeFi " +
        "calls (Uniswap, 0x, etc.) on behalf of a shielded user while the " +
        "assets stay inside the pool. The 'RAILGUN Rails' release (2025) " +
        "adds a cross-pool bridge with a privacy-preserving transfer proof.\n\n" +
        "Post-sanctions compliance: Railgun shipped 'Private Proofs of " +
        "Innocence' (PPOI) in 2024 — a client-side ZK proof that a user's " +
        "funds do NOT originate from a list of blacklisted deposits " +
        "(e.g. OFAC-flagged). This predates and is cited by Buterin et " +
        "al.'s Privacy Pools paper. Limitations: anonymity set is " +
        "per-chain and per-asset (no MASP-style composition), so thin " +
        "ERC-20s leak heavily; PPOI relies on an off-chain " +
        "'sanctioned-set' list that is itself a trust assumption.",
      math_highlight:
        "PPOI statement: $\\exists\\, \\pi \\text{ s.t. } " +
        "\\text{MerklePath}(\\pi, \\mathsf{nf}_{\\text{deposit}}) \\in T_{\\text{allowed}} " +
        "\\,\\wedge\\, \\mathsf{nf}_{\\text{deposit}} \\notin B_{\\text{sanctioned}}$.",
      why_for_thesis:
        "Railgun is the live answer to 'how do you do private DeFi on " +
        "EVM without Tornado Cash's compliance problem'. PPOI is a " +
        "working example of privacy + auditability without a TEE, so it " +
        "is the key comparison baseline for your thesis's TEE-backed " +
        "auditor design.",
      tags: ["evm", "shielded-pool", "private-defi", "ppoi", "compliance"]
    },

    /* ── 8. Anoma — Private Intents ── */
    {
      name: "Anoma — Intent-centric private architecture",
      authors: "Heliax / Anoma Foundation (Christopher Goes, Awa Sun Yin et al.)",
      venue: "Whitepaper v2 (2024); Anoma Devnet live 2025; mainnet 2026 target",
      year: 2024,
      link: "https://github.com/anoma/whitepaper/blob/main/whitepaper.pdf",
      recap_short:
        "Intent-based architecture: users sign partial transactions " +
        "('intents') that solvers match and settle, all inside a " +
        "privacy-preserving execution layer based on Taiga.",
      recap_long:
        "Anoma generalises the 'transaction' abstraction to 'intents': a " +
        "signed partial state change that is valid only if combined with " +
        "a complementary counterparty intent. A solver network discovers " +
        "matching intents off-chain and produces a full settlement " +
        "transaction, which the chain verifies. The privacy layer is " +
        "Taiga, a UTXO-based execution framework where each resource has " +
        "a validity predicate checked in Halo 2 (Pallas curve). Taiga's " +
        "'resource machine' generalises notes to arbitrary typed " +
        "resources with compliance proofs, making private bartering and " +
        "multi-asset atomic swaps native.\n\n" +
        "Relationship to Namada: Namada is Anoma's shielded-payments " +
        "fractal (shipped first, on CometBFT), while Anoma proper is the " +
        "broader intent-centric protocol (independent consensus, under " +
        "development). Limitations (Apr 2026): solver incentives and " +
        "censorship resistance are unresolved — a solver sees intent " +
        "plaintext, so 'solver-MEV' is a new attack surface; the Taiga " +
        "circuit count makes proofs heavy; no stable SDK yet.",
      math_highlight:
        "Resource: $r = (L, v, q, \\text{data}, \\rho, \\text{nk})$ with " +
        "commitment $\\mathsf{cm}_r$; an intent is a partial transaction " +
        "$\\Delta = (\\{r^{\\text{in}}\\}, \\{r^{\\text{out}}\\})$ valid " +
        "iff $\\sum v^{\\text{in}} \\geq \\sum v^{\\text{out}}$ per label.",
      why_for_thesis:
        "Anoma's intent model is the closest framework to 'private " +
        "programmable payments' — an escape from the UTXO vs. account " +
        "dichotomy. Even if you stay Sui-native, Taiga's resource-machine " +
        "abstraction is a useful framing for your design's privacy " +
        "invariants.",
      tags: ["intents", "taiga", "halo2", "resource-machine", "solver"]
    },

    /* ── 9. Tornado Cash post-sanctions + Privacy Pools ── */
    {
      name: "Tornado Cash post-sanctions + Privacy Pools",
      authors: "Buterin, Illum, Nadler, Schär, Soleimani (Privacy Pools, 2023)",
      venue: "OFAC delisting 2024-03; Van Loon v. DoT 5th Cir. ruling 2024-11; " +
        "Privacy Pools v1 on Ethereum 2024",
      year: 2024,
      link: "https://arxiv.org/abs/2306.07444",
      recap_short:
        "Tornado Cash was OFAC-sanctioned in 2022; 5th Circuit ruled in " +
        "2024 that immutable smart-contract code is not 'property' and " +
        "delisted it. Privacy Pools is the academic+code response: " +
        "opt-in 'proof of innocence' via association sets.",
      recap_long:
        "Tornado Cash is a fixed-denomination Ethereum mixer (Groth16 + " +
        "Poseidon-Merkle, deployed 2019) sanctioned by OFAC on 2022-08-08 " +
        "after the Lazarus/DPRK laundered ~$450M through it. Following " +
        "Van Loon v. Department of the Treasury (5th Cir., 2024-11), " +
        "OFAC delisted the smart-contract addresses (2024-03 partially, " +
        "2025 fully for non-KYC contracts); Roman Storm was convicted on " +
        "one count in Aug 2025 and sentenced in early 2026 with an " +
        "appeal pending. The legal upshot: immutable code per se is not " +
        "sanctionable property, but operators can still face money-" +
        "transmitting charges.\n\n" +
        "Privacy Pools (Buterin et al., 2023; deployed 2024) is the " +
        "technical answer. Users deposit into a shared pool as in " +
        "Tornado, but on withdrawal they prove in ZK that their deposit " +
        "belongs to a chosen association set $S$ (a public subset of " +
        "deposits) and does NOT belong to a blacklist $B$. Users choose " +
        "which $S$ they trust; third parties (e.g. Chainalysis) publish " +
        "their own $S$. Limitations: the association-set scheme is only " +
        "as strong as the audits that build it, and enforces an external " +
        "reputation system on otherwise permissionless flows; it also " +
        "worsens anonymity-set fragmentation (each $S$ is smaller than " +
        "the whole pool).",
      math_highlight:
        "Withdrawal statement: $\\exists\\, (\\text{path}, \\text{nullifier}): " +
        "\\text{MerklePath}(\\text{path}) \\in S \\,\\wedge\\, " +
        "\\text{MerklePath}(\\text{path}) \\notin B \\,\\wedge\\, " +
        "\\text{nullifier} = H(\\text{path} \\,\\|\\, \\text{secret})$.",
      why_for_thesis:
        "Tornado Cash is the single most cited 'privacy tool gone wrong' " +
        "case study. Privacy Pools is the cleanest opt-in compliance " +
        "model published. Both are essential context for framing your " +
        "TEE-auditor + anonymous-credential design as a principled middle " +
        "ground: the thesis needs to argue why your approach avoids both " +
        "Tornado's outcome and Privacy Pools' set-fragmentation cost.",
      tags: ["tornado-cash", "privacy-pools", "ofac", "compliance", "association-set"]
    },

    /* ── 10. Solana Confidential Transfers (Token-2022) ── */
    {
      name: "Solana Confidential Transfers (Token-2022 extension)",
      authors: "Solana Labs + Anza (Sam Kim, Jon Cinque et al.)",
      venue: "Token-2022 program live 2023; Confidential Transfer extension " +
        "mainnet-beta 2024; Confidential Balances + Mints 2025",
      year: 2024,
      link: "https://www.solana-program.com/docs/confidential-balances",
      recap_short:
        "SPL Token-2022 extension that hides token amounts using twisted " +
        "ElGamal + Bulletproofs range proofs; addresses and token type " +
        "remain public.",
      recap_long:
        "Solana's Token-2022 adds a 'confidential transfer' extension to " +
        "any SPL token mint. Balances are encrypted under a twisted " +
        "ElGamal public key $(P, H) = (s H, H)$; a transfer consumes a " +
        "ciphertext, produces two new ciphertexts (sender residual, " +
        "receiver add), and includes zero-knowledge proofs that (a) the " +
        "amount is in $[0, 2^{64})$ (Bulletproofs), (b) the balance " +
        "decrease equals the balance increase (equality proof on " +
        "ElGamal), (c) the sender knew the plaintext. Crucially, " +
        "addresses and token mint are NOT hidden — this is 'confidential' " +
        "(amount privacy) not 'anonymous' (identity privacy), matching " +
        "the SoK's level-1 definition. Proofs are precompiled as Solana " +
        "native BPF syscalls for speed.\n\n" +
        "Recent additions (2025): 'Confidential Mint' extension hides " +
        "the total supply; 'Confidential Balances' extension adds auditor " +
        "keys — a mint authority can designate an ElGamal auditor key to " +
        "which every ciphertext is additionally encrypted, giving " +
        "regulator-visibility without breaking public-chain privacy. " +
        "Limitations: no sender/receiver anonymity (full graph leak), " +
        "no cross-token composition, Bulletproofs verification still " +
        "dominates compute-unit cost.",
      math_highlight:
        "Twisted ElGamal: $\\text{Enc}_{pk}(v) = (C_1, C_2) = " +
        "(v H + r P, r H)$; homomorphic add: " +
        "$\\text{Enc}(v_1) \\oplus \\text{Enc}(v_2) = \\text{Enc}(v_1 + v_2)$; " +
        "range proof $\\pi: v \\in [0, 2^{64})$ via Bulletproofs.",
      why_for_thesis:
        "Closest production system to your likely thesis design on Sui: " +
        "ElGamal + Bulletproofs over an account-based, public-address " +
        "model. Study the auditor-key extension as a lightweight, " +
        "TEE-free alternative to your TEE-auditor — it is the baseline " +
        "your TEE design needs to beat on privacy or auditability.",
      tags: ["solana", "token-2022", "elgamal", "bulletproofs", "confidential-transfer", "auditor-key"]
    },

    /* ── 11. FMD / Oblivious Message Retrieval ── */
    {
      name: "Fuzzy Message Detection + Oblivious Message Retrieval",
      authors: "Beck, Len, Miers, Green (FMD, 2021); Liu-Tromer (OMR, 2022); " +
        "GSZ (OMRv2, 2024); Penumbra production deployment (2024)",
      year: 2024,
      venue: "CCS 2021 (FMD); PETS 2022 (OMR); IACR 2024/1603 (OMRv2)",
      link: "https://eprint.iacr.org/2024/1603",
      recap_short:
        "Protocols that let a light wallet discover its incoming shielded " +
        "notes without scanning the full chain and without revealing which " +
        "notes are theirs to the server.",
      recap_long:
        "Full-chain scanning is the dominant mobile-wallet cost for every " +
        "shielded chain (Zcash, Penumbra, Namada, Aztec). Two families of " +
        "protocols address it. FMD (Fuzzy Message Detection): the " +
        "receiver publishes a 'clue key' with a tunable false-positive " +
        "rate $p$; senders attach a small FMD ciphertext per output; " +
        "servers/light-clients return only outputs matching the key " +
        "(fraction $p$ of total), giving bandwidth saving $\\propto 1/p$ " +
        "at the cost of $p$-fraction metadata leak. OMR (Oblivious " +
        "Message Retrieval, Liu-Tromer): use somewhat-homomorphic " +
        "encryption (BFV) so the server compacts the receiver's messages " +
        "into a constant-size digest without learning which outputs " +
        "match. OMRv2 (2024) cuts OMR detection cost by ~100x using " +
        "better SIMD batching.\n\n" +
        "Status: FMD is live on Penumbra (detection keys = part of every " +
        "full viewing key); OMR has reference implementations in Rust + " +
        "Lattigo but no mainnet deployment yet (computational cost on " +
        "server side is the blocker). Open: hybrid FMD+OMR designs where " +
        "FMD does coarse filtering and OMR does precise detection on the " +
        "filtered set.",
      math_highlight:
        "FMD detection: clue $c_i = (H(sk \\cdot C_i))|_\\gamma$ where " +
        "$\\gamma$ is a threshold; false-positive rate " +
        "$p = 2^{-\\gamma}$, tunable by the receiver.",
      why_for_thesis:
        "If your Sui design uses encrypted-note receiver-privacy, wallet " +
        "scan cost is the elephant in the room. FMD/OMR is the SoTA " +
        "solution space. Cite Penumbra's FMD deployment as 'exists in " +
        "production' and OMRv2 as 'near-term improvement'.",
      tags: ["fmd", "omr", "wallet-scan", "light-client", "bfv"]
    },

    /* ── 12. Veiled Coins / Aptos ElGamal extension ── */
    {
      name: "Veiled Coins — Aptos confidential assets (Bulletproofs-Plus)",
      authors: "Aptos Labs (Alin Tomescu et al.)",
      venue: "Move stdlib veiled_coin module 2023; Bulletproofs-Plus " +
        "deployment + audited release 2024-2025",
      year: 2024,
      link: "https://github.com/aptos-labs/aptos-core/tree/main/aptos-move/framework/aptos-framework/sources/confidential_asset",
      recap_short:
        "Aptos Move implementation of ElGamal-encrypted balances with " +
        "Bulletproofs-Plus range proofs; confidentiality-only (amount " +
        "privacy), addresses public.",
      recap_long:
        "Aptos's veiled-coin / 'confidential asset' module is the Move-" +
        "ecosystem analogue of Solana's Token-2022 confidential transfers. " +
        "It encodes balances as twisted ElGamal ciphertexts under the " +
        "account's pubkey and uses Bulletproofs-Plus (Chung-Hong-Lee-" +
        "Wang, 2022) range proofs — shorter proofs than original " +
        "Bulletproofs at the same soundness. The 2024-2025 release " +
        "replaced the initial audit-blocked implementation with a " +
        "formally-audited one under a new 'confidential_asset' " +
        "namespace; amounts and remaining balance stay encrypted, " +
        "addresses public.\n\n" +
        "Design decisions relevant to Sui: (a) normalize-then-transfer " +
        "flow avoids unbounded ciphertext-size growth; (b) public auxiliary " +
        "'normalization' transactions let a user re-randomise without " +
        "spending (useful for replay/timing side channels); (c) no " +
        "auditor-key variant yet (unlike Solana). Limitations: account " +
        "model means full transaction graph is public; no sender/" +
        "receiver anonymity; range-proof verification is the bottleneck " +
        "in Move VM.",
      math_highlight:
        "Bulletproofs-Plus range proof: $\\pi_{\\text{BP+}}(v, \\gamma): " +
        "\\text{Com}(v; \\gamma) \\wedge v \\in [0, 2^n)$ with proof size " +
        "$2\\log_2 n + 6$ group elements (vs. $2\\log_2 n + 10$ for " +
        "original Bulletproofs).",
      why_for_thesis:
        "Direct Move-VM precedent for what you would build on Sui. Study " +
        "the confidential_asset module's API design (deposit, withdraw, " +
        "transfer, normalize) as a likely template, and Bulletproofs-Plus " +
        "as the range-proof baseline for your Ch 2.2 coverage.",
      tags: ["aptos", "move", "veiled-coin", "bulletproofs-plus", "elgamal", "confidential-asset"]
    }
  ]
};
