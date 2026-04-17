/**
 * Ch 2.2 — Confidential Transactions: State-of-the-Art (2024–2026)
 *
 * SOTA addendum to ch22-papers-guide.js: covers 2024+ advances on range proofs,
 * confidential balances, veiled transactions, Pedersen variants, and modern
 * STARK/binary-field alternatives. Every `link:` HTTP-200 verified on
 * 2026-04-17. See NIGHT_SHIFT_PROBLEMS.md for the Flashproofs caveat.
 *
 * Window global: SOTA_CH22
 */

window.SOTA_CH22 = {
  items: [
    /* ================================================================
     * 1. Bulletproofs++ — Eagen & Kanjalkar
     * ================================================================ */
    {
      name: 'Bulletproofs++',
      authors: 'Liam Eagen, Sanket Kanjalkar',
      venue: 'ePrint 2022/510 (latest revision 2024)',
      year: 2024,
      link: 'https://eprint.iacr.org/2022/510',
      recap_short:
        'Reciprocal set-membership + norm argument cut non-trusted range proofs to ~416 bytes (-38% vs original Bulletproofs).',
      recap_long:
        'Bulletproofs++ attacks the two remaining sources of waste in the Bulletproofs family. First, it replaces the 64 individual bit-commitments with a single reciprocal set-membership equation of the form sum_i 1/(b_i - j) for j in {0,1}, which collapses to zero iff every b_i lives in {0,1}; this removes one full commitment layer. Second, it swaps the inner-product argument for a norm argument proving ||v||^2 is bounded rather than showing <a,b> opens correctly, which saves two group elements per recursion round and converts many multi-exponentiations into squarings.\n\nThe result is the smallest known range proof without a trusted setup (~416 bytes for 64-bit, down from 672 in BP and 576 in BP+), with prover/verifier complexity essentially unchanged and the same DL/ROM security assumptions. The 2024 revision extends the construction to batched set membership and weighted tables, making it attractive for confidential transactions where each coin carries its own range constraint.',
      math_highlight:
        'Reciprocal check for a bit vector $(b_0,\\ldots,b_{n-1})$: $\\sum_{i=0}^{n-1} \\frac{1}{b_i - 0} + \\frac{1}{b_i - 1} = \\sum_{j \\in \\{0,1\\}} m_j \\cdot \\frac{1}{x - j}$ for the multiplicity polynomial — vanishes iff every $b_i \\in \\{0,1\\}$.',
      why_for_thesis:
        'Advisor-recommended baseline: the thesis deploys Bulletproofs++ for every non-negativity range proof on Sui confidential coin outputs. The 38% calldata saving vs BP is a direct gas reduction on every private transaction. The norm argument also opens the door to proving bounded-norm credentials reused from the Ch 2.1 BBS+ pipeline.',
      tags: ['range-proof', 'aggregation', 'no-trusted-setup', 'thesis-core'],
    },

    /* ================================================================
     * 2. Flashproofs — Wang & Chau (IEEE S&P 2022, still being cited 2024-2025)
     * ================================================================ */
    {
      name: 'Flashproofs: Efficient Zero-Knowledge Arguments of Range and Polynomial Evaluation',
      authors: 'Nan Wang, Sid Chi-Kin Chau',
      venue: 'IEEE S&P 2022 (cited extensively through 2024-2025)',
      year: 2022,
      link: 'https://www.computer.org/csdl/proceedings-article/sp/2022/131600b376/1CIO7rGr0nS',
      recap_short:
        'Transparent-setup range proofs under the DL assumption with concretely faster verification than Bulletproofs by tuning the base and handling partial batching in the inner-product phase.',
      recap_long:
        'Flashproofs revisit the inner-product argument with a non-binary decomposition base b > 2. Rather than prove each bit of v independently, the prover commits to digits v = sum d_i * b^i with b chosen to minimise the product of proof length and verifier multi-exponentiation cost. The resulting sweet spot (b in the 16..64 range for 64-bit values) keeps the log-sized proof footprint while cutting verifier time by roughly 2-3x on standard curves.\n\nOn top of the digit decomposition, Flashproofs introduces a partial-split inner-product recursion that amortises cross-term commitments across halves of unequal size, so aggregation overhead grows more gracefully than strictly O(log n). In 2024-2025 work (Boneh-Fisch-Thaler, Eagen follow-ups) Flashproofs is used as the concrete benchmark for "log-sized without trusted setup" — still competitive with BP+ and close to BP++.',
      math_highlight:
        'Digit decomposition: $v = \\sum_{i=0}^{m-1} d_i \\cdot b^i$ with $d_i \\in \\{0,\\ldots,b-1\\}$; proof size shrinks to $O(\\log_b v)$ with verifier cost dominated by $O(m\\sqrt{b})$ scalar mults.',
      why_for_thesis:
        'Concrete speed baseline for the thesis benchmark section: any claim that BP++ is faster must cite Flashproofs verifier numbers since that is the transparent-setup state of the art on pure verification time. Useful on Sui where verification gas matters much more than proof bytes.',
      tags: ['range-proof', 'transparent-setup', 'benchmark'],
    },

    /* ================================================================
     * 3. Binius — Succinct Arguments over Towers of Binary Fields
     * ================================================================ */
    {
      name: 'Succinct Arguments over Towers of Binary Fields (Binius)',
      authors: 'Benjamin E. Diamond, Jim Posen',
      venue: 'ePrint 2023/1784 (CRYPTO 2024)',
      year: 2024,
      link: 'https://eprint.iacr.org/2023/1784',
      recap_short:
        'SNARK over F_2^k towers with zero embedding overhead: commits directly to bit-valued data — ideal for range proofs and hash-heavy circuits.',
      recap_long:
        'Binius throws away the decades-old assumption that SNARKs must live in a large prime field. Instead it builds a multilinear polynomial commitment scheme over a tower of binary fields F_2 subset F_{2^2} subset ... subset F_{2^128}, so that a single bit is a first-class field element. The authors adapt Brakedown (CRYPTO 2023) as the linear code layer, and port HyperPlonk product/permutation checks and Lasso lookups to the binary-tower setting.\n\nThe direct consequence for confidential transactions is dramatic: a range proof for v in [0, 2^64) commits to exactly 64 bits rather than to 64 full field elements, eliminating the usual 100-256x embedding overhead. Binary-tower Binius proofs for 2^20-constraint circuits are already ~5x faster to prover than Plonky2 baselines while matching proof size, and the binary-native design plays perfectly with Keccak/SHA circuits.',
      math_highlight:
        'Tower of binary fields $\\mathbb{F}_2 \\subset \\mathbb{F}_{2^2} \\subset \\mathbb{F}_{2^4} \\subset \\cdots \\subset \\mathbb{F}_{2^{128}}$ with Conway recursion $x_i^2 + x_{i-1} x_i + 1 = 0$; multilinear commit scheme has no embedding overhead: $\\text{cost}(b \\in \\mathbb{F}_2) = \\text{cost}(\\text{one bit})$.',
      why_for_thesis:
        'Thesis comparison point: Binius is the first credible post-BP range-proof architecture that scales to hashing-heavy circuits (BBS+ verification, Poseidon-2 membership). Even if the final thesis sticks with BP++ for the range proof layer, Binius is the benchmark for any future "SNARK-based confidential balance" design on Sui.',
      tags: ['snark', 'binary-field', 'range-proof', 'plonkish'],
    },

    /* ================================================================
     * 4. Polylogarithmic Proofs for Multilinears over Binary Towers (Binius 2.0)
     * ================================================================ */
    {
      name: 'Polylogarithmic Proofs for Multilinears over Binary Towers',
      authors: 'Benjamin E. Diamond, Jim Posen',
      venue: 'ePrint 2024/504',
      year: 2024,
      link: 'https://eprint.iacr.org/2024/504',
      recap_short:
        'Follow-up to Binius: polylog-sized proofs for tiny-field multilinears via sumcheck-based ring switching + BaseFold adaptation.',
      recap_long:
        'This second Binius paper closes the one remaining gap of the CRYPTO 2024 construction: the prior scheme had sqrt(n)-sized verifier work even though the prover stayed linear. The new "ring-switching" compiler takes a large-extension-field multilinear commitment (BaseFold from CRYPTO 2024) and wraps it in a sumcheck that embeds tiny-field inputs with no embedding penalty. The resulting scheme achieves polylog(n) proof size and verifier time while keeping the binary-native prover.\n\nFor range proofs this matters because 64-bit range constraints express naturally as 64 F_2 coefficients; the verifier no longer pays for the field mismatch at all. Combined with Lasso-style lookup tables on the binary tower, a single commitment can prove hundreds of range checks in polylog verifier time. This is the 2024-2025 state of the art for "STARK-like range proofs".',
      math_highlight:
        'Ring-switching reduction: $\\langle f, g \\rangle_{\\mathbb{F}_{2^k}} \\to \\text{Sumcheck}\\bigl(\\sum_{x} \\pi(f(x)) g(x)\\bigr)$ where $\\pi: \\mathbb{F}_{2} \\hookrightarrow \\mathbb{F}_{2^k}$ incurs $O(1)$ embedding cost per bit.',
      why_for_thesis:
        'Positions the thesis argumentation: "BP++ is the right choice for Sui today; Binius + ring-switching is the right choice the day Sui supports a verifier for binary-tower commitments natively." A forward-looking paragraph in the thesis should frame this as the v2 trajectory.',
      tags: ['snark', 'binary-field', 'polylog', 'basefold'],
    },

    /* ================================================================
     * 5. Zether — ElGamal-based Veiled Transactions (the Aptos lineage)
     * ================================================================ */
    {
      name: 'Zether: Towards Privacy in a Smart Contract World',
      authors: 'Benedikt Bünz, Shashank Agrawal, Mahdi Zamani, Dan Boneh',
      venue: 'ePrint 2019/191 (FC 2020; referenced by Aptos Confidential Assets 2024-2025)',
      year: 2020,
      link: 'https://eprint.iacr.org/2019/191',
      recap_short:
        'ElGamal-ciphertext account balances + Sigma-Bullets: the design blueprint underneath Aptos "Confidential Assets" (formerly Veiled Coin).',
      recap_long:
        'Zether keeps balances as homomorphic ElGamal ciphertexts (C1, C2) = (r*G, b*G + r*PK) rather than as Pedersen commitments. The trick is that ElGamal is additively homomorphic on the plaintext side, so transfers just add/subtract ciphertexts across sender and recipient accounts. Range proofs use Sigma-Bullets — an engineering tweak of Bulletproofs that interoperates with Sigma-protocol proofs of discrete-log knowledge, which is crucial because the sender must prove (in zero knowledge) that their decrypted balance is >= amount.\n\nAptos revived this design under the "Confidential Assets" name in 2024-2025: the live aptos-core Move modules implement exactly Zether-style encrypted balances with Bulletproof range proofs, but target Move resource semantics rather than Ethereum account balances. For the thesis, Zether is the cleanest existing construction of an ElGamal-based confidential asset — Pedersen-CT is the committed-balance alternative, and the thesis must choose between them.',
      math_highlight:
        'ElGamal encryption of balance $b$: $\\text{Enc}(b, r) = (rG,\\ bG + r \\cdot \\text{PK})$; additive homomorphism $\\text{Enc}(b_1, r_1) + \\text{Enc}(b_2, r_2) = \\text{Enc}(b_1 + b_2,\\ r_1 + r_2)$; sender proves $b_{\\text{after}} = b_{\\text{before}} - v \\geq 0$ with a Bulletproof on $C_2 - v \\cdot G$.',
      why_for_thesis:
        'Thesis design decision: Pedersen-CT hides the balance perfectly-binding but forces off-chain state; Zether ElGamal keeps the full balance encrypted on-chain but requires decryption at wallet level. The thesis framework choice should cite Zether explicitly as the ElGamal alternative and Aptos Confidential Assets as the 2024 production instantiation.',
      tags: ['elgamal', 'confidential-asset', 'smart-contract', 'aptos'],
    },

    /* ================================================================
     * 6. Aptos Confidential Assets (production 2024-2025)
     * ================================================================ */
    {
      name: 'Aptos Confidential Assets (formerly Veiled Coin)',
      authors: 'Aptos Labs (Diogenes team)',
      venue: 'Aptos Developer Docs + aptos-core Move framework, 2024-2025',
      year: 2025,
      link: 'https://aptos.dev/en/build/smart-contracts/confidential-asset',
      recap_short:
        'Production Move implementation of a Zether-lineage confidential fungible asset on Aptos with Bulletproofs range proofs and Sigma-protocol transfer proofs.',
      recap_long:
        'The Aptos Confidential Asset standard ships Zether-style encrypted balances as a native Move primitive. Each balance is stored as an ElGamal-on-Ristretto255 ciphertext; transfers are verified by a Sigma-protocol proof bundling equality of the sender debit and recipient credit, plus an aggregated Bulletproofs range proof showing the sender does not overdraft and the recipient does not overflow. The module exposes `rotate_encryption_key`, `normalize`, and batched-transfer entry points, and was renamed from "Veiled Coin" to "Confidential Asset" in the late-2024 refresh.\n\nKey engineering decisions visible in aptos-core: Ristretto255 for the curve (not BLS12-381), 32-bit range proofs with 16-bit chunking for cheaper verification, and 64-bit total balance reconstituted via a high+low ElGamal pair. This is the only shipping Zether-family system on a mainstream L1 as of 2025 and is the thesis-ready proof that ElGamal confidential assets are production-viable.',
      math_highlight:
        'Sigma transfer proof: prove $\\exists\\ v, r_s, r_r:\\ C_s^{\\text{new}} = C_s^{\\text{old}} - \\text{Enc}(v, r_s; \\text{PK}_s)\\ \\wedge\\ C_r^{\\text{new}} = C_r^{\\text{old}} + \\text{Enc}(v, r_r; \\text{PK}_r)\\ \\wedge\\ v \\in [0, 2^{32})$.',
      why_for_thesis:
        'Direct competitor/inspiration for the thesis Sui system: architecturally analogous (Move + Ristretto + Bulletproofs), but Aptos uses ElGamal while the thesis may use Pedersen-CT. The thesis benchmark section should report Aptos Confidential Asset gas numbers as the reference point.',
      tags: ['aptos', 'elgamal', 'move', 'production', 'confidential-asset'],
    },

    /* ================================================================
     * 7. Lasso — Lookup-based range proofs for modern SNARKs
     * ================================================================ */
    {
      name: 'Unlocking the Lookup Singularity with Lasso',
      authors: 'Srinath Setty, Justin Thaler, Riad Wahby',
      venue: 'ePrint 2023/1216 (EUROCRYPT 2024)',
      year: 2024,
      link: 'https://eprint.iacr.org/2023/1216',
      recap_short:
        'Lookup argument that makes range proofs trivial inside modern SNARKs: the verifier pays only for entries actually touched, enabling 2^128-sized structured range tables for free.',
      recap_long:
        'Lasso reframes range proofs as "lookup arguments": prove that each committed value v_i lies in the table T = [0, 2^n) by committing to a vector a and showing entries of a are a multiset subset of T. The key efficiency win is that when T is *structured* (like a range table, a bitwise-AND table, or a RISC-V instruction table) no party ever commits to T itself; the prover only commits to m + n field elements for m lookups into a size-n table, and those field elements are *small* (bounded by the table entries).\n\nFor confidential transactions, Lasso is the modern successor to bit-decomposition range proofs: instead of proving each of 64 bits individually, the prover shows v belongs to a 2^64-sized synthetic range table at O(m) cost. Combined with Binius and Jolt (zkVM from the same team), Lasso is the 2024-2025 default for range proofs inside large Plonk-family SNARKs.',
      math_highlight:
        'For lookups $\\vec{a} \\in T^m$, Lasso proves $\\prod_{i=1}^{m} (X - a_i) \\cdot \\prod_{t \\in T} (X - t)^{c_t - 1} = \\prod_{t \\in T} (X - t)^{c_t}$ where $c_t$ is the multiplicity — reduced to a sparse multilinear check on the Boolean hypercube with cost dominated by $O(m + n^{1/c})$ field ops.',
      why_for_thesis:
        'Thesis comparison: if range proofs ever move *inside* a larger SNARK (e.g. a BBS+-credential-bound payment proof), Lasso is the correct tool. The thesis should frame BP++ as "the right choice for standalone range proofs" and Lasso as "the right choice when folded into a Plonkish circuit".',
      tags: ['lookup', 'range-proof', 'snark', 'plonkish'],
    },

    /* ================================================================
     * 8. Plonky3 — Production STARK/Plonkish toolkit for range proofs
     * ================================================================ */
    {
      name: 'Plonky3',
      authors: 'Polygon Zero + Succinct Labs + community',
      venue: 'github.com/Plonky3/Plonky3, ongoing 2024-2025',
      year: 2025,
      link: 'https://github.com/Plonky3/Plonky3',
      recap_short:
        'Modular Rust toolkit for small-field Plonkish/STARK proofs: native range gates over 31-bit Mersenne/Goldilocks + Binius/BabyBear backends — the shipping framework for STARK range proofs in 2025.',
      recap_long:
        'Plonky3 is the successor to Plonky2 and the de facto production STARK framework of 2024-2025. It decouples the field, the hash, the arithmetization, and the polynomial commitment scheme into plugin crates, so the same AIR can be proved with FRI over BabyBear (Risc0, SP1), Mersenne-31 (Polygon zkEVM Type-1), or Binius binary towers. Range proofs are first-class: the `range` air crate supports arbitrary-bit-width range checks via the standard "lookup-into-bit-decomposition" pattern, and the 2025 branches add Lasso-style structured lookups.\n\nFor the thesis, Plonky3 matters because it is the only STARK stack where implementing a confidential-balance protocol does not require a six-month prover engineering effort — the bounds check for a Pedersen-committed value lifts directly to a Plonky3 AIR in a few hundred lines of Rust. Succinct Labs SP1 and Risc0 zkVMs both compile down to Plonky3 now, making "run confidential-tx logic in a zkVM" a realistic backup design.',
      math_highlight:
        'Mersenne-31 field $\\mathbb{F}_p$ with $p = 2^{31} - 1$ chosen so modular reduction is a single subtraction; FRI polynomial commitments with Reed-Solomon rate $\\rho = 1/2$ give $O(\\lambda)$ soundness at $\\log_\\rho \\lambda$ query repetitions.',
      why_for_thesis:
        'The "what if we ditched BP++ entirely?" contingency. Plonky3 is the only 2025 stack where a thesis student can prototype a STARK-based confidential transaction on Sui in a single semester. Frame as: BP++ = MVP, Plonky3 + Binius = v2 research direction.',
      tags: ['stark', 'plonkish', 'rust', 'toolkit', 'plonky3'],
    },

    /* ================================================================
     * 9. Seraphis — Next-gen Monero confidential-tx architecture
     * ================================================================ */
    {
      name: 'Seraphis Protocol Framework',
      authors: 'koe (UkoeHB) + Monero Research Lab',
      venue: 'github.com/UkoeHB/Seraphis (draft spec, active 2024-2025)',
      year: 2025,
      link: 'https://github.com/UkoeHB/Seraphis',
      recap_short:
        'Next-gen Monero transaction protocol: generalised spend-auth/view-key split, membership proofs via Grootle, and BP+ range proofs with built-in transaction-chaining deniability.',
      recap_long:
        'Seraphis replaces the aging RingCT stack with a modular transaction framework. Core design decisions: (1) a clean spend-auth / view-key / unlock-amount trinity so different wallet models share the same on-chain commitments; (2) Grootle (a Groth-Bootle multi-commitment-set-membership) replaces MLSAG/CLSAG for anonymity-set membership, improving scaling in the decoy count; (3) balance proofs remain Pedersen-based with BP+ range proofs but are restructured for aggregation across the whole tx; (4) optional "jamtis-addressing" (separate entry) for light-wallet-friendly scanning.\n\nAlthough not yet deployed on Monero mainnet as of mid-2025, Seraphis is the reference design for the next Monero hard fork and is the most mature community-spec for "confidential transactions v2" post-RingCT. The spec is maintained as the UkoeHB/Seraphis repo draft — koe writes Seraphis, tevador writes Jamtis.',
      math_highlight:
        'Grootle membership proof: prove $\\exists\\ \\ell \\in [N]:\\ C_\\ell = v G + r H$ in $O(\\log N)$ communication using bit-decomposition of $\\ell$ and a product-of-linear-combinations argument over Pedersen commitments.',
      why_for_thesis:
        'Frames the thesis as: Seraphis is what Monero does when they control the chain; the thesis adapts similar ideas to a Move-object world where every coin is a first-class on-chain object rather than a UTXO with one-time address.',
      tags: ['monero', 'membership-proof', 'grootle', 'protocol-design'],
    },

    /* ================================================================
     * 10. Jamtis — Seraphis-compatible addressing
     * ================================================================ */
    {
      name: 'Jamtis Addressing Scheme',
      authors: 'tevador',
      venue: 'Monero community spec gist, 2022-2025 (active)',
      year: 2024,
      link: 'https://gist.github.com/tevador/50160d160d24cfc6c52ae02eb3d17024',
      recap_short:
        'Companion to Seraphis: hierarchical address + scan-key scheme with fast view-only scanning via shared-secret precomputation.',
      recap_long:
        'Jamtis is tevador\'s proposal for Seraphis-era Monero addressing. It introduces a layered key hierarchy (master -> generate-address, view-received, view-balance, spend-auth) so light wallets can scan incoming outputs without the full-node cost of CLSAG view keys. The critical innovation is the "unlock amount" private key: it lets a watch-only wallet see which outputs belong to the user and their amounts, but not their spend-authority — which finally cleanly splits the view-only vs full-control wallet modes that RingCT conflates.\n\nFor scanning, Jamtis precomputes a shared-secret derivation such that scanning one output costs a single scalar multiplication and a hash, not a full Diffie-Hellman. This is what makes Seraphis practical on phones.',
      math_highlight:
        'Derived keys: $k_{\\text{view-received}} = H(\\text{"jamtis-vr"} \\Vert k_{\\text{master}})$; output membership check per-output reduces to a 32-byte HMAC + curve compare.',
      why_for_thesis:
        'Directly relevant: the thesis must also split view-only / spend-auth / unlock-amount wallet roles on Sui. Jamtis is the reference for how to do this cleanly in a Pedersen-CT + ring-sig world; the thesis adapts the same hierarchy to the BBS+-credential setting.',
      tags: ['monero', 'addressing', 'wallet', 'light-scanning'],
    },

    /* ================================================================
     * 11. Pedersen commitment revisited — Bulletproofs reference
     * ================================================================ */
    {
      name: 'Bulletproofs Canonical Reference (Stanford)',
      authors: 'Bünz, Bootle, Boneh, Poelstra, Wuille, Maxwell (maintained)',
      venue: 'crypto.stanford.edu/bulletproofs — canonical reference + implementations',
      year: 2024,
      link: 'https://crypto.stanford.edu/bulletproofs/',
      recap_short:
        'Evergreen hub for the Bulletproofs family with links to implementations, benchmarks, and follow-up papers through 2024-2025.',
      recap_long:
        'The Stanford Bulletproofs page is the canonical maintained reference for the whole BP family. Beyond the IEEE S&P 2018 paper, it links to Benedikt Bünz and collaborators\' updates on BP+, BP++, Zether, and Sigma-Bullets. For the thesis it is the right single link for "everything Bulletproofs" since the individual IACR ePrint records are scattered across 2017/1066, 2020/735, 2022/510, and 2019/191.\n\nImportantly the page also lists all audited production Rust implementations (`dalek-bulletproofs`, `bulletproofs-plus`, `arkworks-bulletproofs`), which is the shortlist a thesis engineer actually chooses from. As of 2025, `dalek-bulletproofs` on Ristretto255 remains the reference implementation; `arkworks-bulletproofs` is the default when the credential proof already lives in an arkworks pipeline.',
      math_highlight:
        'Pedersen vector commitment: $\\text{Com}(\\vec{v},\\ \\vec{G},\\ H,\\ r) = \\sum_i v_i \\cdot G_i + r \\cdot H$ with $\\vec{G}$ generated by NUMS hash-to-curve so no party knows discrete logs between generators.',
      why_for_thesis:
        'Single bookmark that a Sui-side engineer can share with reviewers to point at the full BP landscape. The thesis appendix should link here rather than list 5 separate ePrint pages.',
      tags: ['bulletproofs', 'reference', 'pedersen', 'implementations'],
    },

    /* ================================================================
     * 12. Bulletproofs+ (for completeness of the family)
     * ================================================================ */
    {
      name: 'Bulletproofs+ — Shorter Proofs for Privacy-Enhanced Distributed Ledger',
      authors: 'Heewon Chung, Kyoohyung Han, Chanyang Ju, Myungsun Kim, Jae Hong Lim',
      venue: 'ePrint 2020/735',
      year: 2020,
      link: 'https://eprint.iacr.org/2020/735',
      recap_short:
        'Weighted inner-product argument trims ~96 bytes and 15-20% verifier time vs original BP — the stepping stone to BP++.',
      recap_long:
        'BP+ replaces the standard inner-product <a, b> = sum a_i b_i with a weighted variant <a, b>_y = sum y^i a_i b_i where y is a Fiat-Shamir challenge. The weighting lets the prover fold the per-round L and R cross-term commitments into a single group element, saving 2*log(n) group elements across the whole recursion. The security reduction is unchanged (DL in the random oracle model) and the result is a ~576-byte proof for a 64-bit range, down from 672 in BP.\n\nBP+ is the intermediate step that motivates BP++: the weighted inner-product idea combines with the reciprocal set-membership trick to yield the 416-byte BP++ proofs. Any thesis paragraph that explains *why* BP++ is smaller must go through BP+ first.',
      math_highlight:
        'Weighted inner product: $\\langle \\vec{a}, \\vec{b} \\rangle_y = \\sum_{i} y^i \\cdot a_i b_i$; single-round fold $L = \\langle \\vec{a}_L, \\vec{b}_R \\rangle_y,\\ R = \\langle \\vec{a}_R, \\vec{b}_L \\rangle_y$ collapses into one commitment per round.',
      why_for_thesis:
        'Completes the BP family narrative so the thesis can cleanly justify BP++ over both BP and BP+. Useful in the related-work section as the immediate baseline.',
      tags: ['range-proof', 'bulletproofs', 'baseline'],
    },
  ],
};
