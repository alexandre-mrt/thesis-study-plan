/**
 * Ch 2.5 IOP & PCP Theory — Technical Companion
 * Formal definitions and mathematical details for IOP/PCP concepts.
 * Rendered by study-guide.js via window.CH25_IOP_TECHNICAL.
 * KaTeX: \( inline \) and \[ display \]
 */

window.CH25_IOP_TECHNICAL = {
  block1: {
    title: 'IOP &amp; PCP Theory',
    concepts: [
      /* ── 1. PCP ── */
      {
        name: 'Probabilistically Checkable Proofs (PCP)',
        formalDefinition:
          '<p>A PCP system for language \\( L \\) is a pair \\( (P, V) \\) where ' +
          '\\( P \\) produces a proof string \\( \\pi \\in \\Sigma^m \\), and ' +
          '\\( V \\) is a probabilistic polynomial-time verifier with oracle access to ' +
          '\\( \\pi \\). The verifier uses \\( r(n) \\) random bits and makes ' +
          '\\( q(n) \\) queries to \\( \\pi \\).</p>',
        mathDetails: [
          {
            subtitle: 'PCP Parameters',
            content:
              '<p>Define \\( \\mathrm{PCP}[r(n), q(n)] \\) as the class of languages ' +
              'with PCP verifiers using \\( r(n) \\) random bits and \\( q(n) \\) queries ' +
              'over alphabet \\( \\Sigma \\), with completeness \\( c \\) and soundness ' +
              '\\( s \\):</p>' +
              '\\[ x \\in L \\Rightarrow \\exists\\pi,\\; \\Pr[V^\\pi(x) = 1] \\geq c \\]' +
              '\\[ x \\notin L \\Rightarrow \\forall\\pi,\\; \\Pr[V^\\pi(x) = 1] \\leq s \\]' +
              '<p><strong>PCP Theorem:</strong> ' +
              '\\( \\mathrm{NP} = \\mathrm{PCP}[O(\\log n), O(1)] \\). Every NP statement ' +
              'has a proof checkable with \\( O(\\log n) \\) random bits and \\( O(1) \\) queries.</p>'
          },
          {
            subtitle: 'Query Complexity &amp; Soundness',
            content:
              '<p>Soundness error with \\( q \\) queries and repetition:</p>' +
              '\\[ \\varepsilon \\leq 2^{-\\Omega(q)} \\]' +
              '<p><strong>Free-bit complexity:</strong> the number of "free" answer bits ' +
              'not determined by consistency checks. Lower free-bit complexity yields ' +
              'better soundness. The <em>parallel repetition theorem</em> (Raz) shows that ' +
              '\\( k \\)-fold parallel repetition reduces soundness error exponentially, ' +
              'though not perfectly: \\( s^k \\leq \\varepsilon(k) \\leq s^{\\Omega(k)} \\).</p>'
          },
          {
            subtitle: 'PCP of Proximity',
            content:
              '<p>A PCP of Proximity (PCPP) relaxes the standard PCP: the verifier also ' +
              'has oracle access to the input \\( x \\), and accepts if \\( (x, w) \\) is ' +
              '\\( \\delta \\)-close to the language \\( L \\) in relative Hamming distance:</p>' +
              '\\[ \\Delta((x, w),\\; L) \\leq \\delta \\Rightarrow \\Pr[V^{x,\\pi}(|x|) = 1] \\geq c \\]' +
              '\\[ \\Delta((x, w),\\; L) &gt; \\delta \\Rightarrow \\forall\\pi,\\; \\Pr[V^{x,\\pi}(|x|) = 1] \\leq s \\]' +
              '<p>PCPPs are the key building block for constructing IOPs of proximity.</p>'
          }
        ]
      },

      /* ── 2. IOP ── */
      {
        name: 'Interactive Oracle Proofs (IOP)',
        formalDefinition:
          '<p>A \\( k \\)-round IOP: in round \\( i \\), the prover sends an oracle ' +
          '\\( f_i \\), and the verifier sends a challenge \\( r_i \\). At the end, ' +
          '\\( V \\) makes \\( q \\) queries total across all oracles ' +
          '\\( f_1, \\ldots, f_k \\). IOPs combine the round structure of interactive ' +
          'proofs (IP) with the oracle access model of PCPs.</p>',
        mathDetails: [
          {
            subtitle: 'IOP Parameters',
            content:
              '<p>Key parameters: round complexity \\( k \\), query complexity \\( q \\), ' +
              'soundness error \\( \\varepsilon \\), proof length \\( l(n) \\).</p>' +
              '<p><strong>Comparison of proof models:</strong></p>' +
              '<ul>' +
              '<li><strong>IP:</strong> \\( k \\) rounds of interaction, no oracle access — ' +
              'verifier reads full messages.</li>' +
              '<li><strong>PCP:</strong> 0 rounds of interaction, oracle access to static proof.</li>' +
              '<li><strong>IOP:</strong> \\( k \\) rounds of interaction + oracle access to each ' +
              'prover message — strictly generalizes both IP and PCP.</li>' +
              '</ul>'
          },
          {
            subtitle: 'BCS Transformation',
            content:
              '<p>IOP + collision-resistant hash \\( \\rightarrow \\) non-interactive argument ' +
              'in the Random Oracle Model (ROM):</p>' +
              '<ol>' +
              '<li>Merkle-commit each oracle \\( f_i \\) to obtain root \\( \\mathrm{rt}_i \\).</li>' +
              '<li>Apply Fiat-Shamir: \\( r_i = H(\\mathrm{rt}_1, \\ldots, \\mathrm{rt}_i) \\).</li>' +
              '<li>Proof includes Merkle authentication paths for queried positions.</li>' +
              '</ol>' +
              '<p><strong>Theorem (BCS):</strong> If the IOP has soundness \\( \\varepsilon \\), ' +
              'the compiled argument has soundness \\( \\varepsilon + \\mathrm{negl}(\\lambda) \\) ' +
              'in the ROM.</p>'
          },
          {
            subtitle: 'Public-Coin IOPs',
            content:
              '<p>A public-coin IOP is one where all verifier messages are uniformly random ' +
              'coins (no secret state). This property enables the Fiat-Shamir transform. ' +
              'Most efficient IOPs in practice (FRI, Aurora, STARK) are public-coin.</p>' +
              '<p>Arthur-Merlin characterization: \\( \\mathrm{public\\text{-}coin\\;IOP} ' +
              '\\subseteq \\mathrm{IOP} \\), but for constant-round IOPs with polynomial ' +
              'proof length, public-coin suffices (analogous to the GS theorem for IP).</p>'
          }
        ]
      },

      /* ── 3. IOPP ── */
      {
        name: 'IOP of Proximity (IOPP)',
        formalDefinition:
          '<p>An IOPP for code \\( C \\subseteq \\mathbb{F}^n \\): given oracle access to ' +
          '\\( f: L \\to \\mathbb{F} \\), the verifier tests whether \\( f \\) is ' +
          '\\( \\delta \\)-close to \\( C \\) in relative Hamming distance:</p>' +
          '\\[ \\Delta(f, C) = \\min_{c \\in C} \\frac{|\\{i : f(i) \\neq c(i)\\}|}{n} \\]',
        mathDetails: [
          {
            subtitle: 'Proximity Parameter',
            content:
              '<p>The proximity parameter \\( \\delta \\in (0, 1 - R) \\) where ' +
              '\\( R \\) is the code rate. Key radii:</p>' +
              '<ul>' +
              '<li><strong>Unique decoding radius:</strong> \\( \\delta &lt; (1-R)/2 \\) — ' +
              'at most one codeword within distance \\( \\delta \\).</li>' +
              '<li><strong>List decoding radius:</strong> \\( \\delta &lt; 1 - \\sqrt{R} \\) ' +
              '(Johnson bound) — polynomially many codewords within distance \\( \\delta \\).</li>' +
              '</ul>' +
              '<p>The Johnson bound: for a code of distance \\( d \\) and block length \\( n \\), ' +
              'the list decoding radius is \\( 1 - \\sqrt{1 - d/n} = 1 - \\sqrt{R} \\) for ' +
              'Reed-Solomon codes (MDS).</p>'
          },
          {
            subtitle: 'Reed-Solomon IOPP',
            content:
              '<p>Test proximity to the Reed-Solomon code:</p>' +
              '\\[ \\mathrm{RS}[\\mathbb{F}, L, d] = \\{(p(\\alpha))_{\\alpha \\in L} : ' +
              '\\deg(p) &lt; d\\} \\]' +
              '<p>This is the set of evaluations of polynomials of degree \\( &lt; d \\) over ' +
              'the evaluation domain \\( L \\subseteq \\mathbb{F} \\). Testing proximity ' +
              'to this code is the central problem that FRI solves.</p>'
          },
          {
            subtitle: 'Soundness Analysis',
            content:
              '<p><strong>Correlated agreement theorem:</strong> If \\( f \\) is ' +
              '\\( \\delta \\)-far from \\( \\mathrm{RS}[\\mathbb{F}, L, d] \\), then the ' +
              'verifier rejects with probability:</p>' +
              '\\[ \\Pr[\\text{reject}] \\geq 1 - \\varepsilon(\\delta, |\\mathbb{F}|, d, n) \\]' +
              '<p>The correlated agreement theorem shows that agreement of \\( f \\) with a ' +
              'low-degree polynomial on a random subspace implies global proximity — this ' +
              'is the key lemma enabling recursive proximity testing in FRI.</p>'
          }
        ]
      },

      /* ── 4. FRI ── */
      {
        name: 'FRI Protocol (Fast RS-IOPP)',
        formalDefinition:
          '<p>FRI tests proximity to \\( \\mathrm{RS}[\\mathbb{F}, L_0, d] \\) via ' +
          'recursive folding. At round \\( i \\): given \\( f_i \\) on domain ' +
          '\\( L_i \\) of degree \\( &lt; d/2^i \\), decompose:</p>' +
          '\\[ f_i(x) = g(x^2) + x \\cdot h(x^2) \\]' +
          '<p>Verifier sends \\( \\alpha_i \\), prover sends ' +
          '\\( f_{i+1}(x) = g(x) + \\alpha_i \\cdot h(x) \\) on ' +
          '\\( L_{i+1} = \\{x^2 : x \\in L_i\\} \\).</p>',
        mathDetails: [
          {
            subtitle: 'FRI Folding Algebra',
            content:
              '<p>Split \\( f(x) \\) into even and odd components:</p>' +
              '\\[ f(x) = f_{\\text{even}}(x^2) + x \\cdot f_{\\text{odd}}(x^2) \\]' +
              '<p>After folding with challenge \\( \\alpha \\):</p>' +
              '\\[ f\'(y) = f_{\\text{even}}(y) + \\alpha \\cdot f_{\\text{odd}}(y) \\]' +
              '<p>Degree halves: \\( \\deg(f\') &lt; \\deg(f)/2 \\). Domain squaring: ' +
              '\\( L\' = L^2 = \\{x^2 : x \\in L\\} \\), so \\( |L\'| = |L|/2 \\).</p>'
          },
          {
            subtitle: 'FRI Soundness',
            content:
              '<p>Johnson bound application yields per-round soundness. ' +
              'Conjectured soundness (used in practice) vs proven soundness (BCIKS20):</p>' +
              '\\[ \\varepsilon \\leq O\\!\\left(\\frac{d}{|\\mathbb{F}|}\\right)^{1/2} ' +
              '\\text{ per round} \\times \\text{number of rounds} \\]' +
              '<p>Batched FRI: test multiple polynomials simultaneously via random linear ' +
              'combination \\( f = \\sum_j \\beta_j f_j \\). Soundness amplified by ' +
              'independent folding challenges across rounds.</p>'
          },
          {
            subtitle: 'FRI as Polynomial Commitment',
            content:
              '<p><strong>Commit phase:</strong> Merkle tree of evaluations ' +
              '\\( \\{f(\\alpha)\\}_{\\alpha \\in L} \\).</p>' +
              '<p><strong>Open phase:</strong> FRI folding + consistency checks between layers.</p>' +
              '<p><strong>Batch opening:</strong> random linear combination of polynomials.</p>' +
              '<p><strong>Comparison with KZG:</strong></p>' +
              '<ul>' +
              '<li>FRI: transparent (no trusted setup), post-quantum, proof size ' +
              '\\( O(\\log^2 n) \\) field elements.</li>' +
              '<li>KZG: smaller proofs (1 group element), but requires trusted setup and ' +
              'pairing-based assumptions (not post-quantum).</li>' +
              '</ul>'
          },
          {
            subtitle: 'FRI Variants',
            content:
              '<p><strong>DEEP-FRI:</strong> out-of-domain sampling — verifier picks a point ' +
              '\\( z \\notin L \\) and checks \\( f(z) \\) via quotient polynomial. ' +
              'Improves soundness from list-decoding to unique-decoding regime.</p>' +
              '<p><strong>FRI with code switching:</strong> change rate \\( \\rho \\) between rounds ' +
              'to optimize proof size vs soundness tradeoff.</p>' +
              '<p><strong>ethSTARK optimizations:</strong> grinding (proof-of-work on first ' +
              'Fiat-Shamir challenge), optimized Merkle caps, and coset-based evaluation domains.</p>'
          }
        ]
      },

      /* ── 5. Functional IOP & Sumcheck ── */
      {
        name: 'Functional IOP &amp; Sumcheck',
        formalDefinition:
          '<p><strong>Functional IOP:</strong> the prover sends a functional oracle ' +
          '\\( F \\) that the verifier can evaluate on linear functions (not just pointwise). ' +
          '</p><p><strong>Sumcheck protocol:</strong> prove ' +
          '\\( H = \\sum_{x \\in \\mathcal{H}^m} f(x) \\) via \\( m \\) rounds of ' +
          'degree reduction.</p>',
        mathDetails: [
          {
            subtitle: 'Univariate Sumcheck',
            content:
              '<p>Claim: \\( \\sum_{a \\in H} f(a) = \\sigma \\). This is equivalent to:</p>' +
              '\\[ Z_H(x) \\mid \\left(f(x) - \\frac{\\sigma}{|H|}\\right) \\]' +
              '<p>where \\( Z_H(x) = \\prod_{a \\in H}(x - a) \\) is the vanishing polynomial. ' +
              'The verifier checks at random \\( r \\):</p>' +
              '\\[ f(r) = h(r) \\cdot Z_H(r) + \\frac{\\sigma}{|H|} \\]' +
              '<p>where \\( h(x) \\) is the quotient polynomial sent by the prover.</p>'
          },
          {
            subtitle: 'Multivariate Sumcheck',
            content:
              '<p>\\( m \\) rounds, each fixing one variable. In round \\( i \\):</p>' +
              '<ol>' +
              '<li>Prover sends univariate \\( g_i(x_i) = ' +
              '\\sum_{x_{i+1},\\ldots,x_m \\in \\{0,1\\}} f(r_1,\\ldots,r_{i-1}, x_i, \\ldots, x_m) \\).</li>' +
              '<li>Verifier checks \\( g_i(0) + g_i(1) = \\) previous claim.</li>' +
              '<li>Verifier sends random \\( r_i \\), new claim \\( = g_i(r_i) \\).</li>' +
              '</ol>' +
              '<p>Final check: query \\( f(r_1, \\ldots, r_m) \\) directly. Total communication: ' +
              '\\( O(m \\cdot d) \\) field elements for degree-\\( d \\) polynomial.</p>'
          },
          {
            subtitle: 'Aurora/Marlin/Fractal Paradigm',
            content:
              '<p>Encode R1CS constraints as univariate sumcheck over evaluation domain ' +
              '\\( H \\). The approach uses:</p>' +
              '<ul>' +
              '<li><strong>Rowcheck:</strong> verify that a polynomial vanishes on \\( H \\) — ' +
              'i.e., \\( Z_H(x) \\mid p(x) \\).</li>' +
              '<li><strong>Colcheck:</strong> verify a column relation via rational constraints ' +
              'and the sumcheck over \\( H \\).</li>' +
              '</ul>' +
              '<p>This paradigm enables succinct verification of R1CS satisfiability with ' +
              '\\( O(\\log n) \\) verifier time after a polynomial commitment setup.</p>'
          }
        ]
      },

      /* ── 6. Code Switching & Rate ── */
      {
        name: 'Code Switching &amp; Rate of the Code',
        formalDefinition:
          '<p>Reed-Solomon code: \\( \\mathrm{RS}[\\mathbb{F}, L, k] = ' +
          '\\{(p(\\alpha))_{\\alpha \\in L} : \\deg(p) &lt; k\\} \\) with rate ' +
          '\\( \\rho = k / |L| \\) and minimum distance \\( d = |L| - k + 1 \\). ' +
          'Code switching refers to changing \\( \\rho \\) between IOP rounds.</p>',
        mathDetails: [
          {
            subtitle: 'Reed-Solomon Parameters',
            content:
              '<p>Rate \\( \\rho = k/n \\), relative distance \\( \\delta = 1 - \\rho \\) ' +
              '(MDS property: RS codes achieve the Singleton bound with equality). ' +
              'Blowup factor \\( \\beta = 1/\\rho \\).</p>' +
              '<p>For FRI: domain \\( L \\) must be a multiplicative subgroup of ' +
              '\\( \\mathbb{F} \\), with \\( |L| = 2^l \\) for binary folding (each squaring ' +
              'halves the domain).</p>'
          },
          {
            subtitle: 'Code Switching in IOPs',
            content:
              '<p>Tradeoff between rate and soundness:</p>' +
              '<ul>' +
              '<li><strong>High rate</strong> (\\( \\rho \\to 1 \\)): small proofs but weak ' +
              'per-round soundness (distance \\( \\delta \\to 0 \\)).</li>' +
              '<li><strong>Low rate</strong> (\\( \\rho \\to 0 \\)): large proofs but strong ' +
              'per-round soundness (distance \\( \\delta \\to 1 \\)).</li>' +
              '</ul>' +
              '<p><strong>Strategy:</strong> start with low rate for strong base soundness, ' +
              'switch to high rate in later rounds where soundness is amplified by ' +
              'composition across rounds.</p>'
          },
          {
            subtitle: 'Interleaved Codes &amp; Batching',
            content:
              '<p>Stack \\( m \\) codewords row-wise to form an interleaved code. ' +
              'Test proximity of all \\( m \\) codewords simultaneously using a single ' +
              'random linear combination:</p>' +
              '\\[ f = \\sum_{j=1}^m \\beta_j \\cdot f_j \\]' +
              '<p>Proximity of the interleaved code \\( \\approx \\) proximity of individual ' +
              'codes (with high probability over \\( \\beta_j \\)). Enables batch FRI for ' +
              'multiple polynomial commitments with sublinear overhead.</p>'
          }
        ]
      },

      /* ── 7. Arithmetic Circuits & Constraint Systems ── */
      {
        name: 'Arithmetic Circuits &amp; Constraint Systems',
        formalDefinition:
          '<p>An arithmetic circuit \\( C \\) over field \\( \\mathbb{F} \\) is a DAG with ' +
          'input gates, constant gates, addition gates (\\( + \\)), and multiplication ' +
          'gates (\\( \\times \\)). Size = number of gates, depth = longest input-to-output path.</p>',
        mathDetails: [
          {
            subtitle: 'R1CS (Rank-1 Constraint System)',
            content:
              '<p>System of constraints:</p>' +
              '\\[ (A \\cdot z) \\circ (B \\cdot z) = C \\cdot z \\]' +
              '<p>where \\( A, B, C \\in \\mathbb{F}^{m \\times n} \\), ' +
              '\\( z = (1, x, w) \\) is the extended witness, and \\( \\circ \\) denotes ' +
              'the Hadamard (entry-wise) product. Each constraint is degree-2:</p>' +
              '\\[ \\left(\\sum_i a_i z_i\\right)\\left(\\sum_i b_i z_i\\right) = \\sum_i c_i z_i \\]' +
              '<p>Expressiveness: any fan-in-2 arithmetic circuit maps to R1CS with ' +
              'approximately the same number of constraints as multiplication gates.</p>'
          },
          {
            subtitle: 'AIR (Algebraic Intermediate Representation)',
            content:
              '<p>Execution trace matrix \\( T \\in \\mathbb{F}^{N \\times w} \\) with:</p>' +
              '<ul>' +
              '<li><strong>Transition constraints:</strong> \\( p(T[i], T[i+1]) = 0 \\) for all ' +
              '\\( i \\in [N-1] \\).</li>' +
              '<li><strong>Boundary constraints:</strong> \\( T[0, j] = v_j \\) for specified positions.</li>' +
              '</ul>' +
              '<p>Degree of transition polynomial \\( d_t \\) determines prover complexity. ' +
              'AIR is natural for iterated computations (hash functions, VM execution) where ' +
              'the same transition relation repeats \\( N \\) times.</p>'
          },
          {
            subtitle: 'PLONKish Arithmetization',
            content:
              '<p>Gate equation with selector polynomials:</p>' +
              '\\[ q_L \\cdot a + q_R \\cdot b + q_O \\cdot c + q_M \\cdot (a \\cdot b) + q_C = 0 \\]' +
              '<p>Additional features:</p>' +
              '<ul>' +
              '<li><strong>Copy constraints:</strong> permutation argument (grand product check) ' +
              'ensures wire consistency across gates.</li>' +
              '<li><strong>Lookup tables:</strong> Plookup protocol for range checks and ' +
              'non-arithmetic operations.</li>' +
              '<li><strong>Custom gates:</strong> degree-\\( d \\) constraints for specialized ' +
              'operations (e.g., Poseidon S-box as degree-5 gate).</li>' +
              '</ul>' +
              '<p>Most flexible: subsumes both R1CS and AIR as special cases.</p>'
          },
          {
            subtitle: 'Comparison Table',
            content:
              '<ul>' +
              '<li><strong>R1CS:</strong> degree 2, simple structure, used by Groth16 and Spartan.</li>' +
              '<li><strong>AIR:</strong> arbitrary degree, good for repetitive structure, used by STARKs.</li>' +
              '<li><strong>PLONKish:</strong> configurable degree, custom gates + lookups, ' +
              'used by PLONK/Halo2.</li>' +
              '</ul>' +
              '<p>Choice depends on computation structure: R1CS for general circuits, ' +
              'AIR for iterative computations, PLONKish for maximum flexibility with ' +
              'domain-specific optimizations.</p>'
          }
        ]
      },

      /* ── 8. Full Pipeline ── */
      {
        name: 'The Full Pipeline: Computation &rarr; SNARK',
        formalDefinition:
          '<p>A SNARK for NP language \\( L \\) is a triple ' +
          '\\( (\\mathsf{Setup}, \\mathsf{Prove}, \\mathsf{Verify}) \\) satisfying: ' +
          '<strong>completeness</strong> (honest prover always convinces), ' +
          '<strong>(knowledge) soundness</strong> (no efficient cheating prover), and ' +
          '<strong>succinctness</strong> (proof size and verification time are sublinear in ' +
          'witness size \\( |w| \\)).</p>',
        mathDetails: [
          {
            subtitle: 'Three-Stage Construction',
            content:
              '<p>The modular SNARK construction pipeline:</p>' +
              '<ol>' +
              '<li><strong>Stage 1 — Arithmetization:</strong> computation \\( \\rightarrow \\) ' +
              'constraint system (R1CS, AIR, or PLONKish).</li>' +
              '<li><strong>Stage 2 — Information-theoretic proof:</strong> constraint system ' +
              '\\( \\rightarrow \\) IOP/PCP (polynomial IOP with ideal oracles).</li>' +
              '<li><strong>Stage 3 — Compilation:</strong> IOP \\( \\rightarrow \\) argument ' +
              'via commitment scheme + Fiat-Shamir (replace oracles with commitments).</li>' +
              '</ol>'
          },
          {
            subtitle: 'Compiler Families',
            content:
              '<p>Three main compiler strategies:</p>' +
              '<ol>' +
              '<li><strong>PCP + Kilian/Micali:</strong> succinct argument using ' +
              'collision-resistant hash functions.</li>' +
              '<li><strong>IOP + BCS:</strong> transparent argument via Merkle commitments + ' +
              'Fiat-Shamir. No trusted setup, post-quantum.</li>' +
              '<li><strong>Polynomial IOP + polynomial commitment:</strong> (zk-)SNARK using ' +
              'KZG, IPA, or FRI as the commitment backend.</li>' +
              '</ol>'
          },
          {
            subtitle: 'Property Comparison',
            content:
              '<ul>' +
              '<li><strong>Groth16:</strong> 3 \\( \\mathbb{G}_1 \\) + 1 \\( \\mathbb{G}_2 \\) ' +
              'elements (192 bytes), trusted setup (per-circuit), not post-quantum.</li>' +
              '<li><strong>STARK:</strong> \\( O(\\log^2 n) \\) field elements (~45 KB), ' +
              'transparent, post-quantum (hash-based).</li>' +
              '<li><strong>PLONK (KZG):</strong> 9–15 \\( \\mathbb{G}_1 \\) elements (~1.2 KB), ' +
              'universal trusted setup, not post-quantum.</li>' +
              '<li><strong>Recursive SNARKs (Nova/Supernova):</strong> fold instances incrementally, ' +
              'amortize verification cost to \\( O(1) \\) per step.</li>' +
              '</ul>'
          }
        ]
      }
    ]
  }
};
