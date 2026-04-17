/**
 * Ch 2.2 Papers Guide — Confidential Transactions & ZK Proof Systems
 * Intuitive recaps for 8 papers: Pedersen CT, Bulletproofs family, Mimblewimble,
 * Groth16, Plonk, Halo 2.
 * Window global: CH22_PAPERS
 */

window.CH22_PAPERS = {
  papers: [
    /* ================================================================
     * 1. Confidential Transactions — Maxwell (2015)
     * ================================================================ */
    {
      name: 'Confidential Transactions',
      authors: 'Greg Maxwell',
      venue: 'Bitcoin Dev Mailing List, 2015',
      status: 'queued',
      relevance: 'core',
      keyTakeaway:
        'Original CT proposal: Pedersen commitments hide amounts while homomorphic balance verification keeps the ledger valid.',
      analogy:
        'Imagine paying for dinner with sealed envelopes. Each envelope holds a secret amount, but the restaurant can still verify you paid enough by weighing the envelopes on a special scale — the physics of the scale guarantee that the total on your side equals the total on their side, without anyone ever opening an envelope. Confidential Transactions is exactly that: amounts live inside cryptographic envelopes (Pedersen commitments), and the blockchain verifies conservation of value by adding the envelopes algebraically, never by opening them.',
      diagram:
        '┌─────────────────────────────────────────────────────────┐\n' +
        '│          Confidential Transactions — Maxwell 2015       │\n' +
        '├─────────────────────────────────────────────────────────┤\n' +
        '│                                                         │\n' +
        '│  TRADITIONAL TX           CONFIDENTIAL TX              │\n' +
        '│  ─────────────            ──────────────               │\n' +
        '│  Input:  500 BTC          Input:  C_in  = 500·G + r₁·H │\n' +
        '│  Out₁:  100 BTC           Out₁:   C_out1= 100·G + r₂·H │\n' +
        '│  Out₂:  400 BTC           Out₂:   C_out2= 400·G + r₃·H │\n' +
        '│                                                         │\n' +
        '│  Verify: 500=100+400 ✓    Verify: C_in - C_out1        │\n' +
        '│  (amounts visible)               - C_out2              │\n' +
        '│                               = 0·G + (r₁-r₂-r₃)·H ✓  │\n' +
        '│                           (amounts HIDDEN, math works!) │\n' +
        '│                                                         │\n' +
        '│  HOMOMORPHIC MAGIC:                                     │\n' +
        '│  C(v₁,r₁) + C(v₂,r₂) = C(v₁+v₂, r₁+r₂)               │\n' +
        '│                                                         │\n' +
        '│  RANGE PROOF needed:                                    │\n' +
        '│  Prove v ∈ [0, 2^64) to prevent negative amounts        │\n' +
        '└─────────────────────────────────────────────────────────┘',
      keyPoints: [
        'Pedersen commitment C = v·G + r·H hides amount v behind random blinding factor r',
        'Homomorphic: C(v₁) + C(v₂) = C(v₁+v₂) — balance verified without opening commitments',
        'Perfectly hiding: even an all-powerful adversary cannot learn v from C alone',
        'Computationally binding: cannot open C to two different values (discrete log hardness)',
        'Range proofs (Borromean at the time, later Bulletproofs) prevent negative-value inflation attacks',
        'Adopted by Monero (RingCT), Grin, and Beam; foundation of your thesis payment layer',
      ],
      connections:
        'This paper is the direct origin of every confidential payment system, including the thesis. ' +
        'On Sui, transaction amounts will be stored as Pedersen commitments rather than plain integers. ' +
        'The homomorphic balance check becomes a Move contract invariant: ' +
        'sum(input_commitments) = sum(output_commitments). Bulletproofs++ (paper 4) replaces ' +
        "Maxwell's original Borromean range proofs with the 38% smaller construction " +
        'recommended by the thesis advisor.',
      thesisExample:
        'In your Sui payment system, Alice holds a coin object whose value field is a commitment ' +
        'C_alice = 500·G + r_alice·H. When she pays Bob 100 tokens, she creates two output ' +
        'commitment objects: C_bob = 100·G + r_bob·H and C_change = 400·G + r_change·H. ' +
        'The Move verifier checks C_alice = C_bob + C_change + C_fee (all arithmetic on curve points), ' +
        'plus a Bulletproofs++ range proof that each output is non-negative. ' +
        'No validator ever sees 100, 400, or 500 — only curve points.',
    },

    /* ================================================================
     * 2. Bulletproofs: Short Proofs for Confidential Transactions
     *    Bunz, Bootle, Boneh, Poelstra, Wuille, Maxwell | S&P 2018
     * ================================================================ */
    {
      name: 'Bulletproofs: Short Proofs for Confidential Transactions',
      authors: 'Benedikt Bunz, Jonathan Bootle, Dan Boneh, Andrew Poelstra, Pieter Wuille, Greg Maxwell',
      venue: 'IEEE S&P 2018',
      status: 'queued',
      relevance: 'core',
      keyTakeaway:
        'O(log n) range proofs via inner product argument, no trusted setup, ~672 bytes for 64-bit range — makes CT practical at scale.',
      analogy:
        'Imagine a teacher asking a student to prove they memorized a 64-step multiplication table — without reciting every step. The student uses a clever recursive technique: they split the table in half, combine both halves into a single compact summary, and repeat. After log(64) = 6 halvings, the student presents a tiny proof. The teacher can verify it in O(log n) checks. Bulletproofs applies exactly this recursive compression to range proofs: instead of individually proving each bit of a number is 0 or 1 (64 proofs), it compresses all 64 bits into a single inner product argument that fits in ~672 bytes.',
      diagram:
        '┌────────────────────────────────────────────────────────┐\n' +
        '│        Bulletproofs — Inner Product Argument           │\n' +
        '├────────────────────────────────────────────────────────┤\n' +
        '│                                                        │\n' +
        '│  Goal: prove v ∈ [0, 2^64) without revealing v        │\n' +
        '│                                                        │\n' +
        '│  Step 1 — Bit decomposition:                          │\n' +
        '│    v = b₀·2⁰ + b₁·2¹ + ... + b₆₃·2⁶³               │\n' +
        '│    Commit to vector aL = (b₀,...,b₆₃)                │\n' +
        '│    and aR = aL - 1 (shifted bits)                     │\n' +
        '│                                                        │\n' +
        '│  Step 2 — Inner product reduction:                    │\n' +
        '│    Prove <aL, 2^n> = v   AND   <aL, aR> = 0           │\n' +
        '│    Combine: single inner product statement            │\n' +
        '│                                                        │\n' +
        '│  Step 3 — Recursive halving (log rounds):            │\n' +
        '│    n=64  → n=32  → n=16  → n=8  → n=4 → n=2 → n=1   │\n' +
        '│    Each round: commit to cross-terms L, R            │\n' +
        '│                                                        │\n' +
        '│  Proof Size Comparison (64-bit range):               │\n' +
        '│  ─────────────────────────────────────               │\n' +
        '│  Borromean:      ~5,000 B  ████████████████████████  │\n' +
        '│  Bulletproofs:     ~672 B  ██████                    │\n' +
        '│  Bulletproofs+:    ~576 B  █████                     │\n' +
        '│  Bulletproofs++:   ~416 B  ████                      │\n' +
        '└────────────────────────────────────────────────────────┘',
      keyPoints: [
        'O(log n) proof size — ~672 bytes for 64-bit range (vs ~5,000 bytes Borromean)',
        'No trusted setup: relies only on discrete log hardness (DDH in random oracle model)',
        'Inner product argument is the core primitive — re-usable beyond range proofs',
        'Logarithmic verification rounds (non-interactive via Fiat-Shamir)',
        'Used in Monero (since 2017 RingCT 2.0), Grin, Beam, Zcash Orchard',
        'Aggregation: n range proofs together cost O(log n) extra (not n × single proof size)',
        'Prover time: O(n log n); Verifier time: O(n) scalar multiplications',
      ],
      connections:
        'Bulletproofs established the inner product argument paradigm now used in Bulletproofs+ and ++. ' +
        'For the thesis, Bulletproofs is the baseline: your advisor recommended Bulletproofs++ ' +
        '(~38% smaller than this original) for the range proofs in Sui confidential transactions. ' +
        'Understanding Bulletproofs is prerequisite to understanding why ++ is an improvement.',
      thesisExample:
        'When Alice creates a 100-token output commitment C = 100·G + r·H, she must attach a ' +
        'Bulletproof range proof showing 100 ∈ [0, 2⁶⁴). Without it, she could commit to -100 ' +
        'and steal 100 tokens from the system (inflate supply). The Bulletproof is ~672 bytes, ' +
        'verified by the Sui Move contract in a few milliseconds. In your final system this ' +
        'becomes a Bulletproofs++ proof (~416 bytes) — but the logic is identical.',
    },

    /* ================================================================
     * 3. Bulletproofs+ — Chung, Han, Kim, Lim (2020)
     * ================================================================ */
    {
      name: 'Bulletproofs+: Shorter Proofs for Privacy-Enhanced Distributed Ledger',
      authors: 'Heewon Chung, Kyoohyung Han, Chanyang Ju, Myungsun Kim, Jae Hong Lim',
      venue: 'ePrint 2020/735',
      status: 'queued',
      relevance: 'core',
      keyTakeaway:
        'Weighted inner product argument saves ~96 bytes and achieves 15-20% faster verification vs original Bulletproofs.',
      analogy:
        'Bulletproofs compresses 64 bits into a proof with two messages per round (L and R). ' +
        'Bulletproofs+ is like discovering that if you slightly reshape the question — using a ' +
        '"weighted" inner product where powers of a challenge scalar weight each component — ' +
        "you can drop one message per round entirely. It's the same magic trick with one fewer " +
        'card in the deck. The resulting proof is ~13% shorter and the verifier does less work ' +
        'because it handles fewer elliptic curve multiplications per step.',
      diagram:
        '┌────────────────────────────────────────────────────────┐\n' +
        '│            Bulletproofs+ vs Bulletproofs               │\n' +
        '├────────────────────────────────────────────────────────┤\n' +
        '│                                                        │\n' +
        '│  KEY CHANGE: Weighted Inner Product                    │\n' +
        '│                                                        │\n' +
        '│  Bulletproofs:  <a, b>  = Σ aᵢ·bᵢ                    │\n' +
        '│  Bulletproofs+: <a, b>ʸ = Σ yⁱ·aᵢ·bᵢ  (y = challenge)│\n' +
        '│                                                        │\n' +
        '│  Effect: the per-round cross-terms L,R can be merged   │\n' +
        '│  → removes one group element per round                 │\n' +
        '│  → saves 2·log(n) group elements total                 │\n' +
        '│                                                        │\n' +
        '│  For 64-bit range proof:                               │\n' +
        '│  Bulletproofs:   672 bytes  ██████████████            │\n' +
        '│  Bulletproofs+:  576 bytes  ████████████              │\n' +
        '│  Delta: -96 bytes (-14%)                               │\n' +
        '│                                                        │\n' +
        '│  Verification speedup: ~15-20%                         │\n' +
        '│  No trusted setup: same security as Bulletproofs       │\n' +
        '└────────────────────────────────────────────────────────┘',
      keyPoints: [
        'Weighted inner product argument: <a,b>ʸ = Σ yⁱ·aᵢ·bᵢ replaces standard inner product',
        '~96 bytes smaller proof for 64-bit range (576 B vs 672 B original)',
        '15–20% faster verifier: fewer elliptic curve scalar multiplications per round',
        'Same trusted-setup-free security as original Bulletproofs (CDH/DL in ROM)',
        'Intermediate stepping stone: Bulletproofs++ (2024) achieves even stronger savings',
        'Aggregation for multiple outputs still scales as O(log(n·k)) for k outputs',
      ],
      connections:
        'Bulletproofs+ is the intermediate step in the Bulletproofs family. ' +
        'For the thesis, this paper helps understand WHY Bulletproofs++ achieves its savings: ' +
        'the weighted inner product idea introduced here is refined and combined with a ' +
        'reciprocal argument in Bulletproofs++. The 576-byte baseline from + helps benchmark ' +
        'the 38% improvement claimed by ++.',
      thesisExample:
        'In a Sui private payment with 2 outputs (recipient + change), Bulletproofs+ would ' +
        'produce two range proofs aggregated into ~800 bytes total. Bulletproofs++ achieves ' +
        'the same aggregated proof in ~580 bytes. The delta matters on Sui because proof size ' +
        'directly impacts transaction gas fees — every byte costs compute.',
    },

    /* ================================================================
     * 4. Bulletproofs++ — Eagen, Kanjalkar (2024)
     * ================================================================ */
    {
      name: 'Bulletproofs++: Next Generation Confidential Transactions via Reciprocal Set Membership Proofs',
      authors: 'Liam Eagen, Sanket Kanjalkar',
      venue: 'ePrint 2022/510 (updated 2024)',
      status: 'queued',
      relevance: 'core',
      keyTakeaway:
        'Reciprocal range proofs + norm argument cut proof size to ~416 bytes for 64-bit — 38% smaller than original Bulletproofs. Advisor-recommended.',
      analogy:
        "Bulletproofs++ is like finding a shortcut through a city by combining two tricks: " +
        "(1) Instead of proving each of 64 bits is 0-or-1 individually (like checking every door " +
        "on a floor), you prove membership in a set using a single polynomial 'reciprocal' — " +
        "one equation that fails if any bit is wrong. (2) Instead of a long handshake of " +
        "commitments (the inner product rounds), you use a 'norm argument' that proves the " +
        "sum of squares is small, collapsing even more rounds. The result: the smallest " +
        "range proof without a trusted setup, fitting in ~416 bytes.",
      diagram:
        '┌────────────────────────────────────────────────────────┐\n' +
        '│   Bulletproofs++ — Two Key Innovations                 │\n' +
        '├────────────────────────────────────────────────────────┤\n' +
        '│                                                        │\n' +
        '│  INNOVATION 1: Reciprocal Range Proof                  │\n' +
        '│  ─────────────────────────────────────                │\n' +
        '│  Standard: prove bᵢ ∈ {0,1} for each bit i           │\n' +
        '│  Reciprocal: prove ∏(bᵢ·(bᵢ-1)) = 0                  │\n' +
        '│  → single polynomial check replaces 64 individual     │\n' +
        '│    bit commitment openings                             │\n' +
        '│                                                        │\n' +
        '│  INNOVATION 2: Norm Argument                           │\n' +
        '│  ─────────────────────────────────────                │\n' +
        '│  Instead of inner product <a,b>,                       │\n' +
        '│  proves ||a||² (norm squared) is bounded               │\n' +
        '│  Saves ~2 group elements vs BP+ per recursion         │\n' +
        '│                                                        │\n' +
        '│  Proof Size Evolution:                                 │\n' +
        '│  ─────────────────────────────────────                │\n' +
        '│  Borromean:      5,000 B  ████████████████████████   │\n' +
        '│  Bulletproofs:     672 B  █████                       │\n' +
        '│  Bulletproofs+:    576 B  ████                        │\n' +
        '│  Bulletproofs++:   416 B  ███  ← THESIS CHOICE        │\n' +
        '└────────────────────────────────────────────────────────┘',
      keyPoints: [
        'Reciprocal set-membership proof: ∏ᵢ 1/(bᵢ·(bᵢ-1)·(bᵢ-2)·...) with partial fractions',
        'Norm argument replaces inner product argument — saves further group elements',
        '~416 bytes for 64-bit range proof (38% smaller than original Bulletproofs)',
        'No trusted setup — same DDH + ROM security assumptions as Bulletproofs family',
        'Explicitly recommended by thesis advisor over Bulletproofs+',
        'Prover complexity O(n log n), verifier O(n) scalar mults — similar to predecessors',
        'Designed for batch verification across multiple transactions for efficiency',
      ],
      connections:
        'This is THE range proof system for the thesis. The advisor explicitly recommended ' +
        'Bulletproofs++ over the ++ variant from Chung et al. (Bulletproofs+). ' +
        'In the Sui payment system, every output commitment must be accompanied by a ' +
        'Bulletproofs++ proof showing the committed value is non-negative. ' +
        'The 38% size reduction vs original Bulletproofs translates directly into lower ' +
        'Sui transaction costs — critical for usability of confidential payments.',
      thesisExample:
        'For a private payment transaction on Sui: Alice sends 100 tokens to Bob with change 400 ' +
        'back to herself. Two output commitments require two range proofs. ' +
        'With Bulletproofs++: 2 × 416 bytes = 832 bytes for the proofs (vs 2 × 672 = 1,344 bytes ' +
        'with original Bulletproofs). Over thousands of transactions, this 38% saving in calldata ' +
        'is significant for Sui gas costs. The Move verifier calls a native Bulletproofs++ ' +
        'verification function — this is the tight integration point between the thesis ' +
        'and Sui Move primitives.',
    },

    /* ================================================================
     * 5. Mimblewimble — Tom Elvis Jedusor (anon) (2016)
     * ================================================================ */
    {
      name: 'Mimblewimble',
      authors: 'Tom Elvis Jedusor (anonymous)',
      venue: 'Bitcoin Wizards IRC / Dark Web, 2016',
      status: 'queued',
      relevance: 'related',
      keyTakeaway:
        'CT extension: no addresses, cut-through aggregation, kernel excess proves ownership — coins are pure commitments.',
      analogy:
        'Imagine a city that processes paper checks. Normally, every check is filed forever: Alice → Bob, Bob → Carol, Carol → Dave. In Mimblewimble, if Bob never cashed his check but immediately signed it over to Carol, the blockchain is allowed to shred Alice-to-Bob and Bob-to-Carol, keeping only Alice-to-Dave. The "cut-through" means the chain shrinks as it grows — spending coins that have been spent is removed from history. There are no addresses, only sealed amounts and a single signature (the kernel excess) proving the sender authorized the collapse.',
      diagram:
        '┌────────────────────────────────────────────────────────┐\n' +
        '│               Mimblewimble Architecture                │\n' +
        '├────────────────────────────────────────────────────────┤\n' +
        '│                                                        │\n' +
        '│  NO ADDRESSES — coins are pure commitments             │\n' +
        '│                                                        │\n' +
        '│  Alice             Bob             Carol               │\n' +
        '│   │  C_A=5·G+r₁·H   │  C_B=5·G+r₂·H  │               │\n' +
        '│   └──────────────→  └───────────────→  │               │\n' +
        '│                                                        │\n' +
        '│  CUT-THROUGH (if Bob signs over immediately):          │\n' +
        '│   Alice ─────────────────────────────→ Carol          │\n' +
        '│   (intermediate transaction disappears)               │\n' +
        '│                                                        │\n' +
        '│  KERNEL EXCESS:                                        │\n' +
        '│   k_excess = (r_out - r_in)·G                          │\n' +
        '│   Proves sender knew blinding factors (owns coins)     │\n' +
        '│   No private key, no address — just math               │\n' +
        '│                                                        │\n' +
        '│  CHAIN GROWTH: O(1) per output (not O(txs))           │\n' +
        '└────────────────────────────────────────────────────────┘',
      keyPoints: [
        'No addresses: coins are Pedersen commitments; ownership = knowledge of blinding factor',
        'Cut-through: intermediate outputs that are immediately spent can be removed from chain',
        'Kernel excess: C_out - C_in = k_excess = (r_out - r_in)·G proves balance and ownership',
        'Bulletproofs range proofs prevent negative value inflation (same as CT)',
        'Chain grows sub-linearly: old spent outputs are pruned from UTXO set',
        'Implemented by Grin (GPU-mined, inflation model) and Beam (privacy-focused)',
        'Privacy limitation: "dandelion" timing analysis can still link transactions',
      ],
      connections:
        'Mimblewimble shows the purest form of commitment-based payments: no addresses, ' +
        'just math. The kernel excess construct is conceptually close to the "excess blinding ' +
        'factor" used as a transaction authorization signature in CT-based systems. ' +
        'For the thesis, Mimblewimble is a contrast case: it provides stronger unlinkability ' +
        'than CT alone but cannot support credentials or conditional logic — the tradeoff ' +
        'the thesis system resolves by combining CT with ZK credentials on Sui.',
      thesisExample:
        'In your thesis, you cannot use pure Mimblewimble because Sui is an account-based ' +
        'chain with Move objects, not a UTXO chain. However, the kernel excess pattern inspires ' +
        'the "ownership proof" in your system: when Alice spends a coin commitment, she must ' +
        'prove knowledge of the blinding factor r such that C = v·G + r·H — essentially the ' +
        'same as signing with the excess key. In your system this becomes a Schnorr signature ' +
        'or ZK proof of knowledge of r, embedded in the Move transaction.',
    },

    /* ================================================================
     * 6. Groth16 — Jens Groth | EUROCRYPT 2016
     * ================================================================ */
    {
      name: 'On the Size of Pairing-Based Non-Interactive Arguments (Groth16)',
      authors: 'Jens Groth',
      venue: 'EUROCRYPT 2016',
      status: 'queued',
      relevance: 'core',
      keyTakeaway:
        'Most efficient pairing-based zkSNARK: 3 group elements (~192 bytes), constant-time verification, trusted setup — baseline for all ZK proof system comparisons.',
      analogy:
        'Groth16 is the Formula 1 car of zero-knowledge proofs: blindingly fast at one track, ' +
        'but it needs a specialized crew (trusted setup ceremony) to set it up. Once set up, ' +
        'it produces the smallest proof possible — just 3 numbers (192 bytes) — and verification ' +
        'is constant time (~3 ms), no matter how complex the circuit. The downside: if anyone in ' +
        'the setup ceremony is dishonest, they gain a master key to forge any proof forever. ' +
        "This is the 'toxic waste' problem. Plonk and Halo 2 later solved this.",
      diagram:
        '┌────────────────────────────────────────────────────────┐\n' +
        '│               Groth16 — zkSNARK Structure              │\n' +
        '├────────────────────────────────────────────────────────┤\n' +
        '│                                                        │\n' +
        '│  SETUP (trusted, circuit-specific):                    │\n' +
        '│   σ = (proving key pk, verification key vk)           │\n' +
        '│   Generated with toxic waste τ (must be destroyed)    │\n' +
        '│                                                        │\n' +
        '│  PROOF π = (A, B, C) — just 3 group elements:         │\n' +
        '│   A ∈ G₁   (1 element ~ 48 bytes on BLS12-381)        │\n' +
        '│   B ∈ G₂   (1 element ~ 96 bytes)                     │\n' +
        '│   C ∈ G₁   (1 element ~ 48 bytes)                     │\n' +
        '│   Total: ~192 bytes                                    │\n' +
        '│                                                        │\n' +
        '│  VERIFICATION EQUATION:                                │\n' +
        '│   e(A, B) = e(α, β) · e(Σ aᵢ·γᵢ, γ) · e(C, δ)       │\n' +
        '│   (3 pairings — constant time, ~3ms)                  │\n' +
        '│                                                        │\n' +
        '│  Comparison with alternatives:                         │\n' +
        '│  ────────────────────────────────────────────────      │\n' +
        '│  System      Proof    Verify  Setup      Recursive     │\n' +
        '│  Groth16     192 B    ~3 ms   circuit-   no            │\n' +
        '│                               specific                 │\n' +
        '│  Plonk       ~1.3 KB  ~3 ms   universal  no           │\n' +
        '│  Halo 2      ~1.5 KB  ~10 ms  none       yes          │\n' +
        '└────────────────────────────────────────────────────────┘',
      keyPoints: [
        'Proof size: 3 group elements — A∈G₁, B∈G₂, C∈G₁ (~192 bytes on BLS12-381)',
        'Verification: 3 pairing checks — constant time regardless of circuit complexity',
        'Trusted setup is circuit-specific: changing the circuit requires a new ceremony',
        'Quadratic arithmetic programs (QAP) encode the computation as polynomial constraints',
        'Powers-of-tau (Lagrange basis) setup allows multi-party ceremony to distribute trust',
        'Used by: Zcash Sapling, Filecoin, Hermez, Tornado Cash (before Plonk adoption)',
        'Security: adaptive soundness under q-PKE assumption in the generic group model',
      ],
      connections:
        'Groth16 is the reference point for every ZK proof system comparison in the thesis. ' +
        'Zcash (Sapling) uses Groth16 for spend proofs — giving 192-byte proofs but requiring ' +
        'a per-circuit trusted setup. For the thesis credential proofs on Sui, Groth16 is a ' +
        'candidate: the proof size is minimal, but the circuit-specific setup makes upgrades ' +
        'expensive. Plonk or Halo 2 provide setup flexibility at cost of larger proofs.',
      thesisExample:
        'If the thesis uses Groth16 for credential proofs: the credential validity circuit ' +
        'is compiled once, a MPC trusted setup ceremony runs with ~50 participants, and the ' +
        'resulting 192-byte proofs are verified by the Sui Move contract using the pairing ' +
        'equation e(A,B) = e(α,β)·e(Σaᵢγᵢ,γ)·e(C,δ). Verification costs ~3ms per proof, ' +
        'linear in gas on Sui. The tradeoff: any bug in the circuit requires a new setup ' +
        'ceremony — a serious deployment risk for a research prototype.',
    },

    /* ================================================================
     * 7. Plonk — Gabizon, Williamson, Ciobotaru | ePrint 2019/953
     * ================================================================ */
    {
      name: 'PLONK: Permutations over Lagrange-bases for Oecumenical Non-interactive Arguments of Knowledge',
      authors: 'Ariel Gabizon, Zachary J. Williamson, Oana Ciobotaru',
      venue: 'ePrint 2019/953',
      status: 'queued',
      relevance: 'core',
      keyTakeaway:
        'Universal trusted setup + permutation argument enables one ceremony for all circuits — widely deployed in Aztec, zkSync, Polygon.',
      analogy:
        'Groth16 is like getting a custom-tailored suit — perfect fit, but you need a new tailor ' +
        'every time you change your body shape. Plonk is off-the-rack but well-cut: one ' +
        'fitting (universal setup ceremony) works for ANY circuit up to a maximum size. ' +
        'Want to add a new proof type? No new ceremony needed — just write a new circuit ' +
        'and reuse the existing setup. This universality is why Plonk became the dominant ' +
        'backend for production ZK systems: Aztec, zkSync, Scroll, Polygon zkEVM all use Plonk variants.',
      diagram:
        '┌────────────────────────────────────────────────────────┐\n' +
        '│               Plonk — Universal Setup                  │\n' +
        '├────────────────────────────────────────────────────────┤\n' +
        '│                                                        │\n' +
        '│  CIRCUIT REPRESENTATION:                               │\n' +
        '│  Gates: aᵢ · bᵢ = cᵢ  (multiplication)               │\n' +
        '│         aᵢ + bᵢ = cᵢ  (addition)                     │\n' +
        '│  Copy constraints: wire values shared across gates     │\n' +
        '│                                                        │\n' +
        '│  PERMUTATION ARGUMENT:                                 │\n' +
        '│  Prove wires are correctly wired via:                  │\n' +
        '│   f(X) = (a(X) + βX + γ)(b(X) + βk₁X + γ)           │\n' +
        '│            (c(X) + βk₂X + γ)                          │\n' +
        '│   g(X) = (a(X) + βσ₁(X) + γ)(b(X) + βσ₂(X) + γ)    │\n' +
        '│            (c(X) + βσ₃(X) + γ)                        │\n' +
        '│   Check: f(X)/g(X) is a valid permutation             │\n' +
        '│                                                        │\n' +
        '│  POLYNOMIAL COMMITMENT: Kate (KZG)                    │\n' +
        '│   Commit(f) = f(τ)·G  where τ is setup trapdoor      │\n' +
        '│   Universal: τ same for all circuits up to degree D   │\n' +
        '│                                                        │\n' +
        '│  Proof: ~1.3 KB | Setup: universal | Verify: ~3ms     │\n' +
        '└────────────────────────────────────────────────────────┘',
      keyPoints: [
        'Universal trusted setup: one SRS (structured reference string) for all circuits up to size n',
        'Permutation argument (σ): ensures correct wiring between gates without hardcoding circuit',
        'Kate (KZG) polynomial commitments: f(τ)·G allows evaluation proofs via pairings',
        'Proof size: ~1.3 KB (larger than Groth16 but circuit-agnostic)',
        'Updatable setup: participants can sequentially update SRS, no single ceremony required',
        'Used by Aztec (Turbo Plonk), zkSync (PLONK), Scroll, Polygon zkEVM, Mina (Kimchi)',
        'TurboPlonk and UltraPlonk: extensions for custom gates (range checks, lookups)',
      ],
      connections:
        'Plonk represents the production standard for ZK systems in 2024-2026. ' +
        'For the thesis, Plonk is attractive because: (1) universal setup means the credential ' +
        'circuit can be updated without a new ceremony, (2) the updatable setup is safer than ' +
        'Groth16 toxic waste, (3) Plonk variants are available in Rust (bellman, arkworks). ' +
        'The thesis must choose between Groth16 (smaller proofs, simpler), Plonk (universal), ' +
        'or Halo 2 (no trusted setup).',
      thesisExample:
        'Using Plonk for credential proofs in the thesis: the BBS+ credential validity circuit ' +
        'is expressed as Plonk constraints (gate additions + multiplications + copy constraints). ' +
        'A universal SRS ceremony runs once for size n=2²⁰ (supporting circuits up to 1M gates). ' +
        'Any future circuit upgrade (add nationality check, revocation check) reuses the same SRS. ' +
        'The Plonk proof is ~1.3 KB, verified on Sui via KZG pairing check. ' +
        'If the circuit has 50K gates for a BBS+ credential proof, Plonk fits comfortably.',
    },

    /* ================================================================
     * 8. Halo 2 — Electric Coin Company (Zcash) | ~2020
     * ================================================================ */
    {
      name: 'Halo 2',
      authors: 'Sean Bowe, Jack Grigg, Daira Hopwood, Eirik Ogilvie-Wigley, Deirdre Connolly (ECC/Zcash)',
      venue: 'Electric Coin Co. (Zcash), 2020–2022',
      status: 'queued',
      relevance: 'related',
      keyTakeaway:
        'Recursive proofs without trusted setup: a proof verifies other proofs, enabling infinitely composable ZK systems. Used by Zcash Orchard.',
      analogy:
        'Imagine a Russian nesting doll where each doll contains a certificate that the ' +
        'doll inside it is valid — and you can nest as many dolls as you want. ' +
        'Halo 2 does this with proofs: a Halo 2 proof can contain a proof that a ' +
        'previous proof was valid, building a chain of verified computations with no ' +
        'trusted setup at any level. The key trick is the "accumulation scheme" — instead ' +
        "of verifying the inner proof immediately (expensive), you accumulate it into a " +
        "running summary and verify the entire chain at the end in one pass.",
      diagram:
        '┌────────────────────────────────────────────────────────┐\n' +
        '│             Halo 2 — Recursive Proof Structure          │\n' +
        '├────────────────────────────────────────────────────────┤\n' +
        '│                                                        │\n' +
        '│  STANDARD ZK:                                          │\n' +
        '│   Compute → Prove → Verify                             │\n' +
        '│   No recursion: each proof is independent             │\n' +
        '│                                                        │\n' +
        '│  HALO 2 — RECURSIVE:                                   │\n' +
        '│   π₁ = Prove(C₁)                                       │\n' +
        '│   π₂ = Prove(C₂ ∧ Verify(π₁))  ← proof verifies proof │\n' +
        '│   π₃ = Prove(C₃ ∧ Verify(π₂))                         │\n' +
        '│   ...                                                  │\n' +
        '│   πₙ = Prove(Cₙ ∧ Verify(πₙ₋₁))                       │\n' +
        '│                                                        │\n' +
        '│  ACCUMULATION SCHEME (cost reduction):                 │\n' +
        '│   Instead of verifying inner proof in full:            │\n' +
        '│   Acc(π) = running accumulator (deferred verification) │\n' +
        '│   Only verify accumulator at chain end                 │\n' +
        '│                                                        │\n' +
        '│  CURVE CYCLE: Pallas + Vesta                           │\n' +
        '│   Pallas: base field = Vesta scalar field              │\n' +
        '│   Vesta: base field = Pallas scalar field              │\n' +
        '│   Enables efficient "inner proof" computation          │\n' +
        '│                                                        │\n' +
        '│  No trusted setup | Recursive | ~1.5 KB proof          │\n' +
        '└────────────────────────────────────────────────────────┘',
      keyPoints: [
        'No trusted setup: security based on discrete log (DLOG) only, no toxic waste risk',
        'Recursive proof composition: a proof can contain verification of another proof',
        'Accumulation scheme: defers inner proof verification to amortize cost across chain',
        'Uses Pallas/Vesta curve cycle for efficient native field arithmetic in recursion',
        'Proof size: ~1.5 KB (larger than Groth16, similar to Plonk)',
        'Used by Zcash Orchard (replaced Groth16 Sapling), Taiga, Mina (adapted approach)',
        'IPA (inner product argument) polynomial commitments — no trusted setup unlike KZG',
      ],
      connections:
        'Halo 2 represents the frontier of ZK proof systems: no trusted setup + recursion. ' +
        'For the thesis, Halo 2 is unlikely to be the primary choice (complex implementation, ' +
        'larger proofs than Groth16) but is the relevant comparison system. ' +
        'Zcash Orchard (the production successor to Sapling) uses Halo 2, making it the ' +
        'most relevant "what Zcash does today" reference. The thesis position: Groth16 or Plonk ' +
        'for credentials (well-supported in arkworks/bellman), Bulletproofs++ for range proofs.',
      thesisExample:
        'If the thesis explored Halo 2 for credential proofs: the BBS+ circuit would use ' +
        'the Halo 2 proving system (Plonk arithmetization + IPA commitments). ' +
        'No trusted setup = safer deployment on Sui. But: ' +
        '(1) Halo 2 proofs are ~1.5 KB vs Groth16\'s 192 bytes — 8x larger; ' +
        '(2) IPA verification is O(n) vs KZG\'s O(1) with precomputed setup; ' +
        '(3) Zcash Orchard uses Halo 2 specifically for recursion — not needed for a single-hop credential proof. ' +
        'Conclusion: Groth16 or Plonk are more pragmatic for the thesis, ' +
        'with Halo 2 cited as the trusted-setup-free alternative.',
    },
  ],
};
