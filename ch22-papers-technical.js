/**
 * Ch 2.2 Papers Technical Companion — Confidential Transactions & ZK Proof Systems
 * Deep mathematical content with formal definitions and KaTeX math.
 * KaTeX: \\( ... \\) for inline, \\[ ... \\] for display.
 * Window global: CH22_PAPERS_TECH
 */

window.CH22_PAPERS_TECH = {
  papers: [
    /* ================================================================
     * 1. Confidential Transactions — Maxwell (2015)
     * ================================================================ */
    {
      name: 'Confidential Transactions',
      formalDefinition:
        'A Confidential Transaction is a tuple ' +
        '\\( \\text{tx} = (\\{C_{\\text{in},i}\\}, \\{C_{\\text{out},j}\\}, \\pi_{\\text{range}}) \\) ' +
        'where each \\( C \\) is a Pedersen commitment \\( C = v \\cdot G + r \\cdot H \\) ' +
        'over an elliptic curve group \\( \\mathbb{G} \\) of prime order \\( q \\) ' +
        'with independent generators \\( G, H \\). ' +
        'The transaction is valid iff: ' +
        '\\[ \\sum_i C_{\\text{in},i} - \\sum_j C_{\\text{out},j} = r_{\\text{excess}} \\cdot H \\] ' +
        'and for each output \\( j \\): ' +
        '\\[ \\pi_{\\text{range},j} \\text{ proves } v_j \\in [0, 2^{64}) \\]',
      mathDetails: [
        {
          subtitle: 'Pedersen Commitment Scheme',
          content:
            'Let \\( \\mathbb{G} \\) be a prime-order group with \\( |\\mathbb{G}| = q \\). ' +
            'Generators \\( G, H \\in \\mathbb{G} \\) are chosen so that ' +
            '\\( \\log_G(H) \\) is unknown (nothing-up-my-sleeve). ' +
            'The commitment to value \\( v \\in \\mathbb{Z}_q \\) with blinding \\( r \\xleftarrow{\\$} \\mathbb{Z}_q \\) is: ' +
            '\\[ C = \\text{Com}(v, r) = v \\cdot G + r \\cdot H \\] ' +
            'Properties: ' +
            '(1) Perfectly hiding: \\( \\forall v_0 \\neq v_1, \\forall C: \\Pr[C = \\text{Com}(v_0, r_0)] = \\Pr[C = \\text{Com}(v_1, r_1)] \\) — ' +
            'the commitment is uniform over \\( \\mathbb{G} \\). ' +
            '(2) Computationally binding: finding \\( (v, r) \\neq (v\', r\') \\) with \\( \\text{Com}(v,r) = \\text{Com}(v\',r\') \\) ' +
            'implies \\( \\log_G(H) = (v - v\')(r\' - r)^{-1} \\bmod q \\), solving DLP.',
        },
        {
          subtitle: 'Homomorphic Balance Verification',
          content:
            'The Pedersen commitment is additively homomorphic over \\( \\mathbb{G} \\): ' +
            '\\[ \\text{Com}(v_1, r_1) + \\text{Com}(v_2, r_2) = \\text{Com}(v_1 + v_2, r_1 + r_2) \\] ' +
            'For a transaction with inputs \\( \\{(v_i, r_i)\\} \\) and outputs \\( \\{(v_j, r_j)\\} \\), ' +
            'balance is verified by checking: ' +
            '\\[ \\sum_i C_{\\text{in},i} - \\sum_j C_{\\text{out},j} ' +
            '= \\sum_i v_i \\cdot G + r_i \\cdot H - \\sum_j v_j \\cdot G - r_j \\cdot H ' +
            '= \\underbrace{\\left(\\sum v_i - \\sum v_j\\right)}_{= 0} \\cdot G ' +
            '+ \\underbrace{\\left(\\sum r_i - \\sum r_j\\right)}_{= r_{\\text{excess}}} \\cdot H \\] ' +
            'If \\( \\sum v_i = \\sum v_j \\) (balance), the result lies on the \\( H \\)-subgroup: ' +
            '\\( r_{\\text{excess}} \\cdot H \\). ' +
            'A Schnorr signature with secret \\( r_{\\text{excess}} \\) authorizes the transaction.',
        },
        {
          subtitle: 'Range Proof Necessity',
          content:
            'Without range proofs, an adversary can inflate the supply. Suppose \\( v_{\\text{in}} = 5 \\). ' +
            'Adversary constructs outputs: \\( v_{\\text{out},1} = 10 \\), \\( v_{\\text{out},2} = -5 \\). ' +
            'Then \\( v_{\\text{in}} = v_{\\text{out},1} + v_{\\text{out},2} = 5 \\) — balance holds! ' +
            'But \\( v_{\\text{out},2} = -5 \\equiv q - 5 \\pmod{q} \\) as a curve scalar — ' +
            'this is a valid curve point but represents a negative amount. ' +
            'Range proofs enforce \\( v_j \\in [0, 2^{64}) \\) for each output, ' +
            'preventing negative-value attacks. ' +
            'Maxwell\'s original proposal used Borromean ring signatures (~5 KB per output). ' +
            'Bulletproofs (2018) reduced this to ~672 bytes; Bulletproofs++ (2022) to ~416 bytes.',
        },
        {
          subtitle: 'Excess Blinding Factor as Transaction Kernel',
          content:
            'The excess blinding factor \\( r_{\\text{excess}} = \\sum_i r_i - \\sum_j r_j \\) ' +
            'serves as a per-transaction secret key. The sender publishes the excess commitment ' +
            '\\( K = r_{\\text{excess}} \\cdot G \\) and a Schnorr signature ' +
            '\\( (s, e) \\) where \\( s = k + r_{\\text{excess}} \\cdot e \\pmod{q} \\) ' +
            'for random nonce \\( k \\) and challenge \\( e = H(K \\| \\text{tx\\_data}) \\). ' +
            'Verification: \\( s \\cdot G \\stackrel{?}{=} R + e \\cdot K \\) ' +
            'where \\( R = k \\cdot G \\). This proves the signer knew \\( r_{\\text{excess}} \\) ' +
            'without revealing it, authorizing the value transfer.',
        },
      ],
    },

    /* ================================================================
     * 2. Bulletproofs
     * ================================================================ */
    {
      name: 'Bulletproofs: Short Proofs for Confidential Transactions',
      formalDefinition:
        'A Bulletproof is a non-interactive zero-knowledge argument for the relation: ' +
        '\\[ \\mathcal{R}_{\\text{range}} = \\{ (C, n; v, r) : C = v \\cdot G + r \\cdot H \\wedge v \\in [0, 2^n) \\} \\] ' +
        'The proof system achieves communication complexity \\( O(\\log n) \\) ' +
        'via an inner product argument (IPA) over a prime-order group \\( \\mathbb{G} \\), ' +
        'without a trusted setup, under the discrete logarithm assumption in the random oracle model.',
      mathDetails: [
        {
          subtitle: 'Bit Decomposition and Commitment',
          content:
            'Write \\( v = \\sum_{i=0}^{n-1} b_i \\cdot 2^i \\) where \\( b_i \\in \\{0,1\\} \\). ' +
            'The prover commits to the bit vectors using generators \\( \\mathbf{G} = (G_1,\\ldots,G_n) \\) ' +
            'and \\( \\mathbf{H} = (H_1,\\ldots,H_n) \\): ' +
            '\\[ A = \\mathbf{G}^{\\mathbf{a}_L} \\cdot \\mathbf{H}^{\\mathbf{a}_R} \\cdot h^{\\alpha} \\] ' +
            'where \\( \\mathbf{a}_L = (b_0,\\ldots,b_{n-1}) \\) and \\( \\mathbf{a}_R = \\mathbf{a}_L - \\mathbf{1}^n \\). ' +
            'The key relation to prove: ' +
            '\\( \\langle \\mathbf{a}_L, \\mathbf{2}^n \\rangle = v \\) (value) and ' +
            '\\( \\langle \\mathbf{a}_L, \\mathbf{a}_R \\rangle = \\mathbf{0} \\) (bits are 0 or 1).',
        },
        {
          subtitle: 'Reduction to Inner Product Argument',
          content:
            'The verifier sends challenges \\( y, z \\in \\mathbb{Z}_q \\). ' +
            'The two constraints are combined into a single inner product: ' +
            '\\[ \\langle \\mathbf{l}(X), \\mathbf{r}(X) \\rangle = t(X) \\] ' +
            'where \\( \\mathbf{l}(X) = \\mathbf{a}_L - z \\cdot \\mathbf{1} + \\mathbf{s}_L \\cdot X \\), ' +
            '\\( \\mathbf{r}(X) = \\mathbf{y}^n \\circ (\\mathbf{a}_R + z \\cdot \\mathbf{1} + \\mathbf{s}_R \\cdot X) + z^2 \\cdot \\mathbf{2}^n \\), ' +
            'and \\( t(X) = \\langle \\mathbf{l}(X), \\mathbf{r}(X) \\rangle \\) is a degree-2 polynomial. ' +
            'The prover commits to the coefficients \\( t_0, t_1, t_2 \\) and then evaluates at a ' +
            'verifier challenge \\( x \\), reducing to a single inner product statement.',
        },
        {
          subtitle: 'Inner Product Argument (IPA) — Recursive Halving',
          content:
            'Given vectors \\( \\mathbf{a}, \\mathbf{b} \\in \\mathbb{Z}_q^n \\) and commitment ' +
            '\\( P = \\mathbf{G}^{\\mathbf{a}} \\cdot \\mathbf{H}^{\\mathbf{b}} \\cdot u^{c} \\) where \\( c = \\langle \\mathbf{a}, \\mathbf{b} \\rangle \\), ' +
            'the IPA proves knowledge of \\( \\mathbf{a}, \\mathbf{b} \\) in \\( O(\\log n) \\) rounds: ' +
            '\\[ L = \\mathbf{G}_{[n/2:]}^{\\mathbf{a}_{[:n/2]}} \\cdot \\mathbf{H}_{[:n/2]}^{\\mathbf{b}_{[n/2:]}} \\cdot u^{\\langle \\mathbf{a}_{[:n/2]}, \\mathbf{b}_{[n/2:]} \\rangle} \\] ' +
            '\\[ R = \\mathbf{G}_{[:n/2]}^{\\mathbf{a}_{[n/2:]}} \\cdot \\mathbf{H}_{[n/2:]}^{\\mathbf{b}_{[:n/2]}} \\cdot u^{\\langle \\mathbf{a}_{[n/2:]}, \\mathbf{b}_{[:n/2]} \\rangle} \\] ' +
            'Verifier sends \\( x \\xleftarrow{\\$} \\mathbb{Z}_q \\). Prover folds: ' +
            '\\( \\mathbf{a}\' = \\mathbf{a}_{[:n/2]} \\cdot x + \\mathbf{a}_{[n/2:]} \\cdot x^{-1} \\), ' +
            '\\( \\mathbf{b}\' = \\mathbf{b}_{[:n/2]} \\cdot x^{-1} + \\mathbf{b}_{[n/2:]} \\cdot x \\). ' +
            'After \\( \\log_2 n \\) rounds, vectors reduce to scalars. ' +
            'Total proof: \\( 2 \\log_2(n) + 4 \\) group elements + \\( 3 \\) scalars.',
        },
        {
          subtitle: 'Proof Size Analysis',
          content:
            'For a 64-bit range proof over BN254 (32-byte group elements, 32-byte scalars): ' +
            '\\[ |\\pi_{\\text{BP}}| = 2 \\underbrace{(2\\log_2 64)}_{= 12} \\cdot 32 + 4 \\cdot 32 + 3 \\cdot 32 \\approx 672 \\text{ bytes} \\] ' +
            'Verification requires: \\( 2n - 1 \\) scalar multiplications for naïve verification, ' +
            'or \\( n + 2\\log n \\) with multi-exponentiation. ' +
            'Aggregating \\( m \\) range proofs costs \\( O(\\log(nm)) \\) communication instead of \\( O(m \\log n) \\) — ' +
            'a significant saving: 2 aggregated 64-bit proofs cost ~800 bytes, not 2 × 672 = 1,344 bytes.',
        },
      ],
    },

    /* ================================================================
     * 3. Bulletproofs+
     * ================================================================ */
    {
      name: 'Bulletproofs+: Shorter Proofs for Privacy-Enhanced Distributed Ledger',
      formalDefinition:
        'Bulletproofs+ improves on Bulletproofs by replacing the standard inner product ' +
        '\\( \\langle \\mathbf{a}, \\mathbf{b} \\rangle = \\sum_i a_i b_i \\) ' +
        'with the weighted inner product ' +
        '\\( \\langle \\mathbf{a}, \\mathbf{b} \\rangle_y = \\sum_i y^i a_i b_i \\) ' +
        'for a challenge scalar \\( y \\in \\mathbb{Z}_q^* \\). ' +
        'This algebraic change allows one cross-term commitment to be absorbed per recursion round, ' +
        'reducing the proof by \\( 2 \\log_2(n) \\) field elements ' +
        '(saving ~96 bytes for 64-bit range proofs over BN254/BLS12-381).',
      mathDetails: [
        {
          subtitle: 'Weighted Inner Product Argument',
          content:
            'The weighted inner product (WIP) with weight \\( \\mathbf{y} = (y, y^2, \\ldots, y^n) \\) is: ' +
            '\\[ \\langle \\mathbf{a}, \\mathbf{b} \\rangle_{y} = \\sum_{i=1}^{n} y^i a_i b_i \\] ' +
            'The WIP satisfies a folding identity: for split \\( \\mathbf{a} = (\\mathbf{a}_L, \\mathbf{a}_R) \\): ' +
            '\\[ \\langle \\mathbf{a}_L + x^{-1} \\mathbf{a}_R, y^{n/2}(y^{n/2} \\mathbf{a}_L x + \\mathbf{a}_R) \\rangle_{y^2} \\] ' +
            'This folding identity means the verifier does not need separate \\( L \\) and \\( R \\) ' +
            'cross-term commitments — one suffices. Result: each recursion round emits ' +
            '1 group element instead of 2, saving \\( \\log_2(n) \\) elements total.',
        },
        {
          subtitle: 'Proof Size Comparison',
          content:
            'For \\( n = 64 \\)-bit range proof over a curve with 48-byte \\( G_1 \\) elements (BLS12-381): ' +
            '\\[ |\\pi_{\\text{BP}}| \\approx 2\\log_2(64) \\cdot 48 + O(1) = 12 \\cdot 48 + \\ldots \\approx 672 \\text{ B} \\] ' +
            '\\[ |\\pi_{\\text{BP+}}| \\approx \\log_2(64) \\cdot 48 + O(1) = 6 \\cdot 48 + \\ldots \\approx 576 \\text{ B} \\] ' +
            'Saving: \\( -\\log_2(n) \\) elements \\( = -6 \\times 16 = -96 \\) bytes for BN254 (32-byte elements). ' +
            'Verification: the WIP verifier requires fewer scalar multiplications per round — ' +
            'empirically 15–20% faster than Bulletproofs on the same circuit.',
        },
        {
          subtitle: 'Security Reduction',
          content:
            'The WIP satisfies perfect completeness and witness-extended emulation under the ' +
            'discrete logarithm assumption. The reduction is tight: ' +
            'an adversary \\( \\mathcal{A} \\) that breaks the WIP argument with advantage \\( \\epsilon \\) ' +
            'can be used to solve DLP in \\( \\mathbb{G} \\) with advantage \\( \\epsilon / 2^{\\log n} \\approx \\epsilon / n \\). ' +
            'In the random oracle model (Fiat-Shamir), soundness error is negligible: ' +
            '\\( \\text{Adv}_{\\text{sound}}^{\\text{BP+}}(\\mathcal{A}) \\leq \\text{negl}(\\lambda) + q_{\\text{RO}} / q \\).',
        },
      ],
    },

    /* ================================================================
     * 4. Bulletproofs++
     * ================================================================ */
    {
      name: 'Bulletproofs++: Next Generation Confidential Transactions via Reciprocal Set Membership Proofs',
      formalDefinition:
        'Bulletproofs++ introduces two key innovations: ' +
        '(1) A reciprocal set-membership argument to prove \\( b \\in \\{0, 1, \\ldots, 2^n - 1\\} \\) ' +
        'via partial fractions of the polynomial \\( \\prod_{s \\in S} (X - s) \\), and ' +
        '(2) A norm argument that proves \\( \\|\\mathbf{a}\\|^2 \\leq B \\) ' +
        'as a replacement for the inner product argument. ' +
        'Together these achieve a 64-bit range proof in \\( \\approx 416 \\) bytes, ' +
        'a 38% reduction over original Bulletproofs.',
      mathDetails: [
        {
          subtitle: 'Reciprocal Range Proof',
          content:
            'To prove \\( v \\in \\{0, 1, \\ldots, 2^n-1\\} \\), decompose \\( v = \\sum_i b_i 2^i \\) ' +
            'with \\( b_i \\in \\{0, 1\\} \\) and prove \\( b_i(b_i - 1) = 0 \\) for all \\( i \\). ' +
            'Bulletproofs++ encodes this as a partial-fraction identity: ' +
            '\\[ \\frac{1}{\\prod_{i=0}^{n-1}(X - b_i)} = \\sum_{i=0}^{n-1} \\frac{c_i}{X - b_i} \\] ' +
            'where \\( c_i \\) are coefficients satisfying \\( \\sum_i c_i b_i = \\langle \\mathbf{c}, \\mathbf{b} \\rangle \\). ' +
            'The prover commits to \\( \\mathbf{b} \\) and \\( \\mathbf{c} \\) and proves the partial-fraction ' +
            'decomposition holds at a random verifier challenge \\( x \\). ' +
            'This is more efficient than committing to each bit individually.',
        },
        {
          subtitle: 'Norm Argument',
          content:
            'The norm argument proves that \\( \\|\\mathbf{a}\\|^2 = \\sum_i a_i^2 \\leq B \\) ' +
            'for a committed vector \\( \\mathbf{a} \\). ' +
            'This is related to the inner product via the identity: ' +
            '\\[ \\langle \\mathbf{a}, \\mathbf{a} \\rangle = \\|\\mathbf{a}\\|^2 \\] ' +
            'The norm argument uses a single accumulation commitment rather than two cross-term commitments, ' +
            'saving additional group elements per round. ' +
            'Combined with the reciprocal set-membership, the total proof structure is: ' +
            '\\[ \\pi_{\\text{BP++}} = (C_{\\text{bits}}, C_{\\text{coeff}}, \\{L_i\\}_{i=1}^{\\log n}, a, c) \\] ' +
            'with total size \\( \\approx (2 + \\log n) \\) group elements + \\( 2 \\) scalars.',
        },
        {
          subtitle: 'Proof Size Table',
          content:
            'For \\( n = 64 \\)-bit range over Ristretto255/BN254 (32-byte group elements): ' +
            '\\[ \\begin{array}{lccc} ' +
            '\\textbf{System} & \\textbf{Group elems} & \\textbf{Scalars} & \\textbf{Total} \\\\ ' +
            '\\hline ' +
            '\\text{Borromean} & \\sim 128 & 128 & \\sim 8{,}192\\text{ B} \\\\ ' +
            '\\text{Bulletproofs} & 2\\log n + 4 & 5 & \\sim 672\\text{ B} \\\\ ' +
            '\\text{Bulletproofs+} & \\log n + 4 & 5 & \\sim 576\\text{ B} \\\\ ' +
            '\\text{Bulletproofs++} & \\log n + 2 & 2 & \\sim 416\\text{ B} \\\\ ' +
            '\\end{array} \\] ' +
            'Bulletproofs++ achieves \\( 38\\% \\) reduction vs Bulletproofs. ' +
            'For 2-output aggregated proof: \\( 2 \\times 416 \\approx 832\\text{ B} \\) vs \\( 1{,}344\\text{ B} \\).',
        },
        {
          subtitle: 'Security Assumptions',
          content:
            'Bulletproofs++ security reduces to the discrete logarithm problem in \\( \\mathbb{G} \\) ' +
            'in the random oracle model. Formally: ' +
            '\\[ \\Pr[\\text{Verify}(\\pi_{\\text{BP++}}) = 1 \\wedge v \\notin [0, 2^n)] \\leq \\text{negl}(\\lambda) \\] ' +
            'under the DL assumption. No trusted setup is required: the generators \\( \\mathbf{G}, \\mathbf{H} \\) ' +
            'are chosen via hash-to-curve from public random data. ' +
            'Batch verification: \\( m \\) proofs can be verified simultaneously with ' +
            'a single multi-scalar multiplication of size \\( O(m \\log n) \\), ' +
            'saving roughly \\( m \\times \\) verifier time over sequential verification.',
        },
      ],
    },

    /* ================================================================
     * 5. Mimblewimble
     * ================================================================ */
    {
      name: 'Mimblewimble',
      formalDefinition:
        'Mimblewimble is a blockchain protocol where all transaction amounts are hidden ' +
        'as Pedersen commitments \\( C = v \\cdot G + r \\cdot H \\) and there are no addresses. ' +
        'A transaction is valid iff: ' +
        '\\[ \\sum_i C_{\\text{in},i} - \\sum_j C_{\\text{out},j} = K = r_{\\text{excess}} \\cdot G \\] ' +
        'and a Schnorr signature \\( \\sigma = (s, e) \\) verifies against \\( K \\), ' +
        'proving the sender knew the excess blinding factor \\( r_{\\text{excess}} \\) ' +
        'without revealing \\( v_i \\) or \\( r_i \\).',
      mathDetails: [
        {
          subtitle: 'Transaction Kernel and Excess',
          content:
            'In Mimblewimble, a transaction kernel is: ' +
            '\\[ \\text{kernel} = (K_{\\text{excess}}, \\sigma, f) \\] ' +
            'where \\( K_{\\text{excess}} = r_{\\text{excess}} \\cdot G \\), ' +
            '\\( \\sigma \\) is a Schnorr signature under \\( r_{\\text{excess}} \\), ' +
            'and \\( f \\) is the transaction fee. ' +
            'Validity condition for the entire block: ' +
            '\\[ \\sum_{\\text{outputs}} C_j - \\sum_{\\text{inputs}} C_i + f \\cdot G ' +
            '= \\sum_{\\text{kernels}} K_{\\text{excess},k} \\] ' +
            'This is verified purely over curve points — no amounts are ever revealed. ' +
            'Conservation of value follows from \\( \\sum v_{\\text{out}} + f = \\sum v_{\\text{in}} \\) ' +
            'iff the above point equation holds (DLP hardness).',
        },
        {
          subtitle: 'Cut-Through Mechanism',
          content:
            'If output \\( C_j \\) from transaction \\( \\text{tx}_1 \\) is spent as ' +
            'input \\( C_j \\) in transaction \\( \\text{tx}_2 \\), ' +
            'the two transactions can be merged: ' +
            '\\[ \\text{tx}_1 \\oplus \\text{tx}_2: \\quad ' +
            '\\{C_{\\text{in},\\text{tx}_1}\\} \\to \\{C_{\\text{out},\\text{tx}_2}\\} \\] ' +
            'with combined kernel \\( K_{\\text{excess}}^{1+2} = K_{\\text{excess}}^1 + K_{\\text{excess}}^2 \\). ' +
            'The intermediate output \\( C_j \\) disappears from the UTXO set. ' +
            'This extends to entire blocks: the block body is a set of inputs, outputs, and kernels ' +
            'where all spent outputs have been pruned. ' +
            'Chain state grows as \\( O(\\text{UTXO set}) \\) not \\( O(\\text{all transactions}) \\).',
        },
        {
          subtitle: 'Non-Interactive Transaction Construction',
          content:
            'Mimblewimble transactions require interaction to construct (sender and receiver must ' +
            'exchange blinding factors). The process: ' +
            '(1) Sender picks \\( r_{\\text{in}} \\) and computes \\( C_{\\text{in}} = v_{\\text{in}} \\cdot G + r_{\\text{in}} \\cdot H \\); ' +
            '(2) Receiver picks \\( r_{\\text{out}} \\) and computes \\( C_{\\text{out}} = v_{\\text{out}} \\cdot G + r_{\\text{out}} \\cdot H \\); ' +
            '(3) Excess: \\( r_{\\text{excess}} = r_{\\text{out}} - r_{\\text{in}} \\), ' +
            '\\( K_{\\text{excess}} = r_{\\text{excess}} \\cdot G \\); ' +
            '(4) Both sign a Schnorr signature: \\( \\sigma = (s_S + s_R, e) \\) where ' +
            '\\( s_S = k_S + r_{\\text{in}} \\cdot e \\), \\( s_R = k_R + r_{\\text{out}} \\cdot e \\). ' +
            'This two-round interaction is a deployment challenge; Grin uses Tor for message passing.',
        },
      ],
    },

    /* ================================================================
     * 6. Groth16
     * ================================================================ */
    {
      name: 'On the Size of Pairing-Based Non-Interactive Arguments (Groth16)',
      formalDefinition:
        'Groth16 is a pairing-based zkSNARK for arithmetic circuits ' +
        '\\( C: \\mathbb{F}^n \\to \\mathbb{F}^m \\). ' +
        'Given a Quadratic Arithmetic Program (QAP) ' +
        '\\( \\mathcal{Q} = (t(x), \\{u_i(x), v_i(x), w_i(x)\\}_{i=0}^m) \\), ' +
        'the proof \\( \\pi = (A, B, C) \\in G_1 \\times G_2 \\times G_1 \\) ' +
        'satisfies the verification equation: ' +
        '\\[ e(A, B) = e(\\alpha, \\beta) \\cdot e\\!\\left(\\sum_{i=0}^{\\ell} a_i \\frac{\\beta u_i(\\tau) + \\alpha v_i(\\tau) + w_i(\\tau)}{\\gamma}, \\gamma\\right) \\cdot e(C, \\delta) \\] ' +
        'where \\( \\tau \\) is the setup trapdoor, \\( \\ell \\) is the number of public inputs, ' +
        'and \\( (\\alpha, \\beta, \\gamma, \\delta) \\in \\mathbb{F}^4 \\) are setup secrets.',
      mathDetails: [
        {
          subtitle: 'Quadratic Arithmetic Program (QAP)',
          content:
            'Any arithmetic circuit \\( C \\) of depth \\( d \\) and \\( m \\) gates ' +
            'is transformed into a QAP over field \\( \\mathbb{F} \\). ' +
            'Let \\( \\{r_i\\}_{i=1}^m \\) be distinct points in \\( \\mathbb{F} \\). ' +
            'For each wire \\( i \\), define polynomials \\( u_i, v_i, w_i \\) such that: ' +
            '\\[ \\sum_i a_i u_i(r_g) = \\text{left input of gate } g \\] ' +
            '\\[ \\sum_i a_i v_i(r_g) = \\text{right input of gate } g \\] ' +
            '\\[ \\sum_i a_i w_i(r_g) = \\text{output of gate } g \\] ' +
            'The circuit is satisfied iff: ' +
            '\\[ p(x) = \\left(\\sum_i a_i u_i(x)\\right) \\cdot \\left(\\sum_i a_i v_i(x)\\right) - \\sum_i a_i w_i(x) \\] ' +
            'is divisible by the target polynomial \\( t(x) = \\prod_g (x - r_g) \\), ' +
            'i.e., \\( p(x) = h(x) \\cdot t(x) \\).',
        },
        {
          subtitle: 'Trusted Setup and CRS',
          content:
            'The setup samples \\( \\tau, \\alpha, \\beta, \\gamma, \\delta \\xleftarrow{\\$} \\mathbb{F} \\) ' +
            '(toxic waste — must be destroyed). The Common Reference String (CRS) contains: ' +
            '\\[ \\text{pk} = \\left(\\{\\tau^i \\cdot G_1\\}_{i=0}^{d}, \\alpha \\cdot G_1, \\beta \\cdot G_1, ' +
            '\\left\\{\\frac{\\beta u_i(\\tau) + \\alpha v_i(\\tau) + w_i(\\tau)}{\\gamma} \\cdot G_1\\right\\}_{i=\\ell+1}^m, \\ldots\\right) \\] ' +
            'The proving key \\( \\text{pk} \\) encodes the circuit constraints at the trapdoor point \\( \\tau \\). ' +
            'Circuit-specificity: changing any gate requires generating a new CRS from scratch. ' +
            'Multi-party computation (MPC) ceremonies (e.g., Zcash Sapling ceremony with 90 parties) ' +
            'distribute the trust: security holds if at least one party is honest.',
        },
        {
          subtitle: 'Proof Generation',
          content:
            'The prover samples \\( r, s \\xleftarrow{\\$} \\mathbb{F} \\) and computes: ' +
            '\\[ A = \\alpha \\cdot G_1 + \\sum_i a_i u_i(\\tau) \\cdot G_1 + r \\cdot \\delta \\cdot G_1 \\] ' +
            '\\[ B = \\beta \\cdot G_2 + \\sum_i a_i v_i(\\tau) \\cdot G_2 + s \\cdot \\delta \\cdot G_2 \\] ' +
            '\\[ C = \\frac{\\sum_{i=\\ell+1}^m a_i (\\beta u_i(\\tau)+\\alpha v_i(\\tau)+w_i(\\tau))}{\\delta} \\cdot G_1 ' +
            '+ h(\\tau) \\cdot \\frac{t(\\tau)}{\\delta} \\cdot G_1 + sA + rB - rs \\delta \\cdot G_1 \\] ' +
            'Proving time: O(m log m) via FFT over the QAP polynomials, ' +
            'plus O(m) scalar multiplications in \\( G_1 \\). ' +
            'For Zcash Sapling (a circuit of ~4M constraints): ~40 ms on laptop, ~200 ms on mobile.',
        },
        {
          subtitle: 'Pairing Verification',
          content:
            'The verification equation uses the bilinear pairing \\( e: G_1 \\times G_2 \\to G_T \\): ' +
            '\\[ e(A, B) \\stackrel{?}{=} e(\\alpha \\cdot G_1, \\beta \\cdot G_2) ' +
            '\\cdot e\\!\\left(\\sum_{i=0}^{\\ell} a_i L_i, \\gamma \\cdot G_2\\right) \\cdot e(C, \\delta \\cdot G_2) \\] ' +
            'where \\( L_i = \\frac{\\beta u_i(\\tau) + \\alpha v_i(\\tau) + w_i(\\tau)}{\\gamma} \\cdot G_1 \\). ' +
            'This requires 3 pairing operations — constant time regardless of circuit size. ' +
            'On BLS12-381: each pairing \\( \\approx 1 \\text{ ms} \\), total verification \\( \\approx 3 \\text{ ms} \\). ' +
            'Proof: 1 \\( G_1 \\) element (48 B) + 1 \\( G_2 \\) element (96 B) + 1 \\( G_1 \\) element (48 B) = 192 B.',
        },
      ],
    },

    /* ================================================================
     * 7. Plonk
     * ================================================================ */
    {
      name: 'PLONK: Permutations over Lagrange-bases for Oecumenical Non-interactive Arguments of Knowledge',
      formalDefinition:
        'PLONK is a universal zkSNARK based on Kate polynomial commitments ' +
        'and a permutation argument over a multiplicative subgroup \\( H = \\{\\omega^0, \\ldots, \\omega^{n-1}\\} \\) ' +
        'of \\( \\mathbb{F}_p^* \\). The proof for a circuit of \\( n \\) gates ' +
        'contains \\( O(1) \\) KZG polynomial commitments and \\( O(1) \\) field elements, ' +
        'with verification requiring \\( 2 \\) pairing operations (batched).',
      mathDetails: [
        {
          subtitle: 'Gate Constraints and Selector Polynomials',
          content:
            'A Plonk circuit uses three wire polynomials \\( a(X), b(X), c(X) \\in \\mathbb{F}[X] \\) ' +
            'and five selector polynomials \\( q_L, q_R, q_O, q_M, q_C \\in \\mathbb{F}[X] \\). ' +
            'Each gate \\( g \\) (at \\( \\omega^g \\in H \\)) must satisfy: ' +
            '\\[ q_L(\\omega^g) a(\\omega^g) + q_R(\\omega^g) b(\\omega^g) ' +
            '+ q_O(\\omega^g) c(\\omega^g) + q_M(\\omega^g) a(\\omega^g) b(\\omega^g) ' +
            '+ q_C(\\omega^g) = 0 \\] ' +
            'Choosing \\( q_M = 1, q_O = -1 \\) gives a multiplication gate \\( a \\cdot b = c \\); ' +
            'choosing \\( q_L = q_R = 1, q_O = -1 \\) gives addition. ' +
            'The selector polynomials are part of the circuit description (precomputed, committed in setup).',
        },
        {
          subtitle: 'Copy Constraints via Permutation Argument',
          content:
            'Wires shared between gates are encoded as a permutation \\( \\sigma \\) ' +
            'over the wire index set \\( \\{a_0, \\ldots, a_{n-1}, b_0, \\ldots, c_{n-1}\\} \\). ' +
            'The permutation check uses the product argument: ' +
            '\\[ \\prod_{i=0}^{n-1} \\frac{(a(\\omega^i) + \\beta \\omega^i + \\gamma)(b(\\omega^i) + \\beta k_1 \\omega^i + \\gamma)(c(\\omega^i) + \\beta k_2 \\omega^i + \\gamma)}{(a(\\omega^i) + \\beta \\sigma_1(\\omega^i) + \\gamma)(b(\\omega^i) + \\beta \\sigma_2(\\omega^i) + \\gamma)(c(\\omega^i) + \\beta \\sigma_3(\\omega^i) + \\gamma)} = 1 \\] ' +
            'where \\( \\beta, \\gamma \\) are verifier challenges and ' +
            '\\( k_1, k_2 \\) are coset representatives. ' +
            'This is encoded as a polynomial constraint on the accumulator \\( z(X) \\).',
        },
        {
          subtitle: 'Kate (KZG) Polynomial Commitments',
          content:
            'The Kate commitment to \\( f(X) \\in \\mathbb{F}_{<d}[X] \\) is: ' +
            '\\[ \\text{cm}(f) = f(\\tau) \\cdot G_1 = \\sum_{i=0}^{d-1} f_i \\cdot (\\tau^i \\cdot G_1) \\in G_1 \\] ' +
            'where \\( \\{\\tau^i \\cdot G_1\\}_{i=0}^{D} \\) is the universal SRS. ' +
            'The same \\( \\tau \\) works for any polynomial up to degree \\( D \\) — universality. ' +
            'Opening proof for \\( f(z) = v \\): ' +
            '\\[ \\pi = \\frac{f(\\tau) - v}{\\tau - z} \\cdot G_1 \\in G_1 \\] ' +
            'Verification: \\( e(\\text{cm}(f) - v \\cdot G_1, G_2) = e(\\pi, \\tau \\cdot G_2 - z \\cdot G_2) \\). ' +
            'Updatable SRS: parties can sequentially multiply \\( \\tau \\) by a secret \\( \\rho_i \\), ' +
            'maintaining \\( \\tau_{\\text{new}} = \\rho_i \\cdot \\tau_{\\text{old}} \\). ' +
            'Security holds if at least one party destroys their \\( \\rho_i \\).',
        },
        {
          subtitle: 'Proof Structure and Size',
          content:
            'A Plonk proof consists of: ' +
            '\\[ \\pi = ([a]_1, [b]_1, [c]_1, [z]_1, [t_{lo}]_1, [t_{mid}]_1, [t_{hi}]_1, ' +
            '\\bar{a}, \\bar{b}, \\bar{c}, \\bar{s}_1, \\bar{s}_2, \\bar{z}_\\omega, [W_z]_1, [W_{z\\omega}]_1) \\] ' +
            'That is: 7 \\( G_1 \\) commitments + 6 field evaluations + 2 opening proofs. ' +
            'On BLS12-381 (48 B for \\( G_1 \\), 32 B for \\( \\mathbb{F}_p \\)): ' +
            '\\( 9 \\times 48 + 6 \\times 32 \\approx 624 \\) bytes. ' +
            'Practical implementations add blinding and split the quotient polynomial — ' +
            'Aztec\'s implementation is ~1.2 KB in practice. ' +
            'Verification: 2 pairings (same cost as Groth16) + polynomial evaluation checks in \\( G_1 \\).',
        },
      ],
    },

    /* ================================================================
     * 8. Halo 2
     * ================================================================ */
    {
      name: 'Halo 2',
      formalDefinition:
        'Halo 2 is a recursive zkSNARK based on the inner product argument (IPA) ' +
        'over the Pallas/Vesta curve cycle, with no trusted setup. ' +
        'It achieves recursion via an accumulation scheme: ' +
        'instead of verifying proof \\( \\pi_{n-1} \\) inside proof \\( \\pi_n \\) ' +
        '(expensive), it accumulates an IPA instance \\( \\text{acc}_{n} \\) and ' +
        'defers verification to a single check at the chain end. ' +
        'Security reduces to the discrete logarithm assumption in \\( \\mathbb{G} \\).',
      mathDetails: [
        {
          subtitle: 'IPA Polynomial Commitment (No Trusted Setup)',
          content:
            'The IPA replaces KZG commitments with a Pedersen-style vector commitment. ' +
            'For polynomial \\( f(X) = \\sum_{i=0}^{n-1} f_i X^i \\) and generators ' +
            '\\( \\mathbf{G} = (G_0, \\ldots, G_{n-1}) \\in \\mathbb{G}^n \\): ' +
            '\\[ \\text{cm}(f) = \\sum_{i=0}^{n-1} f_i \\cdot G_i \\in \\mathbb{G} \\] ' +
            'Evaluation proof for \\( f(z) = v \\): uses the inner product relation ' +
            '\\[ \\langle \\mathbf{f}, \\mathbf{z} \\rangle = v \\] ' +
            'where \\( \\mathbf{z} = (1, z, z^2, \\ldots, z^{n-1}) \\). ' +
            'The IPA proves this in \\( O(\\log n) \\) rounds, each sending 2 group elements. ' +
            'No trusted setup: generators \\( G_i \\) are nothing-up-my-sleeve (hash-to-curve). ' +
            'Cost: verifier does \\( O(n) \\) scalar multiplications (vs \\( O(1) \\) for KZG) — ' +
            'this is the fundamental tradeoff against Plonk/Groth16.',
        },
        {
          subtitle: 'Accumulation Scheme for Recursion',
          content:
            'Standard recursion: verify \\( \\pi_{n-1} \\) inside circuit \\( C_n \\). ' +
            'Cost: the verifier circuit for one IPA proof is \\( O(n) \\) native field multiplications — ' +
            'too expensive to embed directly. ' +
            'Halo 2 accumulation: instead of verifying the IPA, accumulate it: ' +
            '\\[ \\text{acc}_n = \\text{Acc}(\\text{acc}_{n-1}, \\pi_n) \\] ' +
            'The accumulation step is \\( O(1) \\) field operations (linear combination of group elements). ' +
            'The circuit for \\( \\text{acc}_n \\) has \\( O(\\log n) \\) native gates per step, not \\( O(n) \\). ' +
            'Final verification: check \\( \\text{acc}_N \\) once at the end of the chain. ' +
            'Formally: the accumulator is an IPA instance \\( (\\text{cm}, z, v, \\{L_i, R_i\\}) \\) ' +
            'that "accumulates" all previous proofs via random linear combination.',
        },
        {
          subtitle: 'Pallas / Vesta Curve Cycle',
          content:
            'Recursion requires: the arithmetic in the verifier circuit must be native to the prover\'s field. ' +
            'For curve \\( E_1 / \\mathbb{F}_{p_1} \\): the circuit is over \\( \\mathbb{F}_{p_1} \\) ' +
            'but the group order is \\( q_1 \\). ' +
            'The Pallas/Vesta cycle satisfies: ' +
            '\\[ p_{\\text{Pallas}} = q_{\\text{Vesta}}, \\quad q_{\\text{Pallas}} = p_{\\text{Vesta}} \\] ' +
            'i.e., the base field of Pallas equals the scalar field of Vesta and vice versa. ' +
            'Alternating between Pallas and Vesta, each inner IPA proof computation is native: ' +
            '\\( \\text{Prove on Pallas} \\to \\text{Accumulate on Vesta} \\to \\text{Prove on Pallas} \\to \\ldots \\) ' +
            'The cycle avoids costly non-native field arithmetic that would dominate circuit size.',
        },
        {
          subtitle: 'Halo 2 vs Groth16 vs Plonk Tradeoffs',
          content:
            'Comparison table for a circuit of \\( n \\approx 10^5 \\) constraints: ' +
            '\\[ \\begin{array}{lcccc} ' +
            '\\textbf{System} & \\textbf{Proof} & \\textbf{Verify} & \\textbf{Setup} & \\textbf{Recursive} \\\\ ' +
            '\\hline ' +
            '\\text{Groth16} & 192\\text{ B} & \\sim3\\text{ ms} & \\text{circuit-specific} & \\text{no} \\\\ ' +
            '\\text{Plonk} & \\sim1.3\\text{ KB} & \\sim3\\text{ ms} & \\text{universal} & \\text{no} \\\\ ' +
            '\\text{Halo 2} & \\sim1.5\\text{ KB} & \\sim10\\text{ ms} & \\text{none} & \\text{yes} \\\\ ' +
            '\\end{array} \\] ' +
            'Halo 2 wins on: setup trust, recursion. ' +
            'Halo 2 loses on: proof size, verifier time, implementation complexity. ' +
            'For Sui smart-contract verification: the \\( \\sim10\\text{ ms} \\) verifier time ' +
            'translates to higher gas costs than Groth16 (\\( \\sim3\\text{ ms} \\)). ' +
            'For the thesis (non-recursive single-credential proof): Groth16 or Plonk are preferable; ' +
            'Halo 2 becomes relevant only if the system needs proof aggregation or chain recursion.',
        },
      ],
    },
  ],
};
