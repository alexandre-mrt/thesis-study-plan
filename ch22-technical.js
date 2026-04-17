/**
 * Ch 2.2 Technical Companion — Confidential Transactions & Range Proofs
 * Deep mathematical / formal definitions paired with CH22_GUIDE.
 * Rendered with KaTeX: \\( ... \\) for inline, \\[ ... \\] for display.
 */

window.CH22_TECHNICAL = {
  block1: {
    concepts: [
      /* ───────── Pedersen Commitments ───────── */
      {
        name: "Pedersen Commitments",
        formalDefinition:
          "A Pedersen commitment scheme operates over an elliptic " +
          "curve group \\( \\mathbb{G} \\) of prime order \\( p \\) " +
          "with two independent generators \\( G, H \\in \\mathbb{G} \\) " +
          "such that \\( \\log_G(H) \\) is unknown. To commit to a " +
          "value \\( v \\in \\mathbb{Z}_p \\), the committer samples " +
          "a blinding factor \\( r \\xleftarrow{\\$} \\mathbb{Z}_p \\) " +
          "and computes:" +
          "\\[ C = v \\cdot G + r \\cdot H \\]" +
          "The commitment \\( C \\) is a single curve point. " +
          "Opening requires revealing \\( (v, r) \\) and checking " +
          "\\( C \\stackrel{?}{=} v \\cdot G + r \\cdot H \\). " +
          "Pedersen (1991) introduced this scheme, which achieves " +
          "perfectly hiding and computationally binding properties.",
        mathDetails: [
          {
            subtitle: "Computational Binding (DL Assumption)",
            content:
              "Suppose an adversary finds two valid openings " +
              "\\( (v_0, r_0) \\) and \\( (v_1, r_1) \\) with " +
              "\\( v_0 \\neq v_1 \\) for the same commitment \\( C \\). Then:" +
              "\\[ v_0 \\cdot G + r_0 \\cdot H = v_1 \\cdot G + r_1 \\cdot H \\]" +
              "\\[ (v_0 - v_1) \\cdot G = (r_1 - r_0) \\cdot H \\]" +
              "Since \\( v_0 \\neq v_1 \\), we have \\( v_0 - v_1 \\neq 0 \\), so:" +
              "\\[ H = \\frac{v_0 - v_1}{r_1 - r_0} \\cdot G \\]" +
              "This yields \\( \\log_G(H) = (v_0 - v_1)(r_1 - r_0)^{-1} \\), " +
              "breaking the discrete log assumption. Therefore, any " +
              "adversary breaking binding can be used to solve the " +
              "DLP in \\( \\mathbb{G} \\)."
          },
          {
            subtitle: "Information-Theoretic Hiding",
            content:
              "For any commitment \\( C \\in \\mathbb{G} \\) and any " +
              "value \\( v' \\in \\mathbb{Z}_p \\), there exists exactly " +
              "one blinding factor \\( r' \\) such that " +
              "\\( C = v' \\cdot G + r' \\cdot H \\):" +
              "\\[ r' = (C - v' \\cdot G) \\cdot H^{-1} \\]" +
              "(where \\( H^{-1} \\) denotes the scalar inverse of " +
              "the discrete log). Since every value has a unique " +
              "consistent blinding factor, the commitment \\( C \\) " +
              "reveals zero information about \\( v \\) " +
              "information-theoretically. Even an unbounded adversary " +
              "cannot distinguish \\( \\mathrm{Com}(v_0; r_0) \\) from " +
              "\\( \\mathrm{Com}(v_1; r_1) \\)."
          },
          {
            subtitle: "Homomorphic Property Proof",
            content:
              "Given two commitments \\( C_1 = v_1 \\cdot G + r_1 \\cdot H \\) " +
              "and \\( C_2 = v_2 \\cdot G + r_2 \\cdot H \\), their " +
              "elliptic curve sum is:" +
              "\\[ C_1 + C_2 = (v_1 + v_2) \\cdot G + (r_1 + r_2) \\cdot H \\]" +
              "This is a valid commitment to \\( v_1 + v_2 \\) with " +
              "blinding factor \\( r_1 + r_2 \\). More generally, for " +
              "scalars \\( a, b \\):" +
              "\\[ a \\cdot C_1 + b \\cdot C_2 = (a v_1 + b v_2) \\cdot G " +
              "+ (a r_1 + b r_2) \\cdot H \\]" +
              "This additive homomorphism is the key property enabling " +
              "confidential transaction balance verification: " +
              "\\( \\sum C_{\\text{in}} - \\sum C_{\\text{out}} = " +
              "0 \\cdot G + r_{\\text{excess}} \\cdot H \\) proves " +
              "conservation of value without revealing any amounts."
          },
          {
            subtitle: "Nothing-Up-My-Sleeve Generator Construction",
            content:
              "The security of Pedersen commitments requires that " +
              "\\( \\log_G(H) \\) is unknown to all parties. The " +
              "standard technique uses hash-to-curve: given a " +
              "canonical generator \\( G \\), compute " +
              "\\( H = \\text{hash\\_to\\_curve}(\\texttt{\"Pedersen\\_H\"}) \\). " +
              "Since the hash function is modeled as a random oracle, " +
              "finding \\( \\log_G(H) \\) requires solving the DLP. " +
              "This nothing-up-my-sleeve construction was used in " +
              "Maxwell's Confidential Transactions proposal (2015) " +
              "and in Grin/Beam implementations."
          }
        ],
        securityAnalysis:
          "<strong>If \\( \\log_G(H) \\) is known:</strong> " +
          "An adversary who knows \\( k = \\log_G(H) \\) can " +
          "equivocate: given \\( C = v \\cdot G + r \\cdot H \\), " +
          "they can open to any \\( v' \\) by setting " +
          "\\( r' = r + (v - v') \\cdot k^{-1} \\). This completely " +
          "breaks binding. In a payment system, this means an " +
          "attacker could create commitments that appear balanced " +
          "but actually inflate the supply." +
          "<br><br>" +
          "<strong>Curve choice matters:</strong> " +
          "Ristretto255 provides a prime-order group abstraction " +
          "over Curve25519, eliminating cofactor-related " +
          "vulnerabilities. The secp256k1 curve (Bitcoin/Grin) has " +
          "cofactor 1 natively but requires careful implementation " +
          "to avoid timing side-channels in scalar multiplication." +
          "<br><br>" +
          "<strong>Quantum threat:</strong> " +
          "Shor's algorithm breaks the DLP, destroying the binding " +
          "property. Post-quantum alternatives (lattice-based " +
          "commitments) exist but lack the efficient homomorphic " +
          "property needed for confidential transactions.",
        practicalNotes:
          "<strong>Curve performance (single scalar multiplication):</strong> " +
          "Ristretto255 ~70 us, secp256k1 ~50 us, BLS12-381 G1 ~500 us. " +
          "A Pedersen commitment requires one 2-multi-scalar multiplication, " +
          "roughly 1.5x a single scalar mul." +
          "<br><br>" +
          "<strong>Commitment size:</strong> 32 bytes (Ristretto255 compressed), " +
          "33 bytes (secp256k1 compressed), 48 bytes (BLS12-381 G1 compressed)." +
          "<br><br>" +
          "<strong>Batch verification:</strong> " +
          "To verify \\( n \\) balance equations simultaneously, sample " +
          "random weights \\( w_i \\) and check " +
          "\\( \\sum_i w_i \\cdot (\\sum C_{\\text{in},i} - \\sum C_{\\text{out},i}) = O \\). " +
          "This reduces \\( n \\) multi-scalar muls to one large " +
          "multi-scalar mul, with soundness error \\( 1/p \\) per " +
          "equation (Schwartz-Zippel).",
        keyFormulas: [
          {
            name: "Pedersen Commitment",
            formula:
              "\\[ C = v \\cdot G + r \\cdot H, \\quad " +
              "r \\xleftarrow{\\$} \\mathbb{Z}_p \\]"
          },
          {
            name: "Homomorphic Sum",
            formula:
              "\\[ C_1 + C_2 = (v_1 + v_2) \\cdot G + " +
              "(r_1 + r_2) \\cdot H \\]"
          },
          {
            name: "Balance Verification (Kernel Excess)",
            formula:
              "\\[ \\sum_{i} C_{\\text{in},i} - \\sum_{j} C_{\\text{out},j} " +
              "= 0 \\cdot G + r_{\\text{excess}} \\cdot H \\]"
          },
          {
            name: "Binding Break (DL Recovery)",
            formula:
              "\\[ \\log_G(H) = (v_0 - v_1)(r_1 - r_0)^{-1} \\]"
          }
        ],
        exercises: [
          {
            type: "calculation",
            question:
              "Let G = 7 and H = 11 in a toy group Z_23 (multiplicative). " +
              "Compute the Pedersen commitment C = v*G + r*H (mod 23) " +
              "for v = 3, r = 5. Then compute a second commitment " +
              "for v = 4, r = 2. Verify that C1 + C2 (mod 23) equals " +
              "the commitment to v = 7, r = 7.",
            hint:
              "Work in additive notation over Z_23. " +
              "C1 = 3*7 + 5*11 = 21 + 55 = 76 mod 23. " +
              "C2 = 4*7 + 2*11 = 28 + 22 = 50 mod 23.",
            answer:
              "C1 = 76 mod 23 = 7. C2 = 50 mod 23 = 4. " +
              "C1 + C2 = 11 mod 23. " +
              "Direct: C(7, 7) = 7*7 + 7*11 = 49 + 77 = 126 mod 23 = 126 - 5*23 = 11. " +
              "Matches. The homomorphic property holds."
          },
          {
            type: "calculation",
            question:
              "In a confidential transaction, inputs commit to values " +
              "(10, r1) and (20, r2). Outputs commit to (25, r3) and (5, r4). " +
              "What constraint must the blinding factors satisfy for " +
              "the balance equation to hold? Write the kernel excess.",
            hint:
              "The balance equation requires sum of inputs = sum of outputs. " +
              "The value part: 10 + 20 = 25 + 5 = 30, so values balance.",
            answer:
              "For balance: (10+20)*G + (r1+r2)*H = (25+5)*G + (r3+r4)*H. " +
              "Since 30 = 30, the value terms cancel, leaving " +
              "(r1 + r2 - r3 - r4)*H = O. So the kernel excess is " +
              "r_excess = r1 + r2 - r3 - r4, and a Schnorr signature on " +
              "r_excess proves the creator knew the blinding factors."
          },
          {
            type: "conceptual",
            question:
              "Suppose the second generator is constructed as H = 2*G " +
              "(i.e., log_G(H) = 2 is known). Explain concretely how " +
              "an attacker could create money from nothing in a " +
              "confidential transaction system.",
            hint:
              "If log_G(H) = 2, then v*G + r*H = v*G + 2r*G = (v + 2r)*G. " +
              "The commitment only depends on v + 2r, not v and r independently.",
            answer:
              "The attacker can open C to any (v', r') with v' + 2r' = v + 2r. " +
              "For example, commit to v=0, r=5: C = 10*G. Then claim " +
              "this was v=10, r=0 (since 10+0 = 0+10). They can create " +
              "outputs of any value that sum to the same v+2r total, " +
              "inflating the money supply while the balance equation still checks out."
          }
        ]
      },

      /* ───────── Bulletproofs ───────── */
      {
        name: "Bulletproofs",
        formalDefinition:
          "Bulletproofs (Bunz, Bootle, Boneh, Poelstra, Wuille, " +
          "Maxwell, 2018) are short non-interactive zero-knowledge " +
          "arguments of knowledge for arithmetic circuits, with a " +
          "primary application as range proofs. Given a Pedersen " +
          "commitment \\( C = v \\cdot G + r \\cdot H \\), a " +
          "Bulletproof proves:" +
          "\\[ v \\in [0, 2^n) \\]" +
          "without revealing \\( v \\) or \\( r \\). The proof size " +
          "is \\( O(\\log n) \\) group elements (concretely, " +
          "\\( 2 \\lceil \\log_2 n \\rceil + 4 \\) group elements " +
          "and 5 scalars for a single range proof). The core " +
          "technique is an inner product argument that recursively " +
          "halves the witness size.",
        mathDetails: [
          {
            subtitle: "Reduction from Range Proof to Inner Product",
            content:
              "To prove \\( v \\in [0, 2^n) \\), decompose " +
              "\\( v \\) into bits \\( v = \\sum_{i=0}^{n-1} a_i \\cdot 2^i \\) " +
              "where \\( a_i \\in \\{0, 1\\} \\). Define " +
              "\\( \\mathbf{a}_L = (a_0, \\ldots, a_{n-1}) \\) and " +
              "\\( \\mathbf{a}_R = \\mathbf{a}_L - \\mathbf{1}^n \\). " +
              "The bit constraint \\( a_i \\in \\{0,1\\} \\) is equivalent to:" +
              "\\[ \\langle \\mathbf{a}_L, \\mathbf{a}_R \\rangle = 0 \\]" +
              "since \\( a_i(a_i - 1) = 0 \\iff a_i \\in \\{0,1\\} \\). " +
              "Combined with the constraint " +
              "\\( \\langle \\mathbf{a}_L, \\mathbf{2}^n \\rangle = v \\), " +
              "the range proof reduces to proving an inner product " +
              "relation on committed vectors."
          },
          {
            subtitle: "Inner Product Argument (Recursive Halving)",
            content:
              "The inner product argument proves " +
              "\\( \\langle \\mathbf{a}, \\mathbf{b} \\rangle = c \\) for " +
              "committed vectors of length \\( n \\). In each round, " +
              "split \\( \\mathbf{a} = (\\mathbf{a}_{\\text{lo}}, " +
              "\\mathbf{a}_{\\text{hi}}) \\) and " +
              "\\( \\mathbf{b} = (\\mathbf{b}_{\\text{lo}}, " +
              "\\mathbf{b}_{\\text{hi}}) \\), each of length \\( n/2 \\). " +
              "Compute cross-terms:" +
              "\\[ L = \\langle \\mathbf{a}_{\\text{lo}}, " +
              "\\mathbf{b}_{\\text{hi}} \\rangle \\cdot U + " +
              "\\langle \\mathbf{a}_{\\text{lo}}, " +
              "\\mathbf{G}_{\\text{hi}} \\rangle + " +
              "\\langle \\mathbf{b}_{\\text{hi}}, " +
              "\\mathbf{H}_{\\text{lo}} \\rangle \\]" +
              "\\[ R = \\langle \\mathbf{a}_{\\text{hi}}, " +
              "\\mathbf{b}_{\\text{lo}} \\rangle \\cdot U + " +
              "\\langle \\mathbf{a}_{\\text{hi}}, " +
              "\\mathbf{G}_{\\text{lo}} \\rangle + " +
              "\\langle \\mathbf{b}_{\\text{lo}}, " +
              "\\mathbf{H}_{\\text{hi}} \\rangle \\]" +
              "The verifier sends challenge \\( x \\) (or it is derived " +
              "via Fiat-Shamir). The prover folds:" +
              "\\[ \\mathbf{a}' = x \\cdot \\mathbf{a}_{\\text{lo}} + " +
              "x^{-1} \\cdot \\mathbf{a}_{\\text{hi}} \\]" +
              "\\[ \\mathbf{b}' = x^{-1} \\cdot \\mathbf{b}_{\\text{lo}} + " +
              "x \\cdot \\mathbf{b}_{\\text{hi}} \\]" +
              "After \\( \\log_2 n \\) rounds, the vectors reduce to " +
              "single scalars, yielding \\( 2 \\log_2 n \\) group " +
              "elements (the \\( L_i, R_i \\) pairs) plus 2 final scalars."
          },
          {
            subtitle: "Proof Size Analysis",
            content:
              "For a 64-bit range proof (\\( n = 64 \\)):" +
              "\\[ \\text{Proof size} = 2 \\lceil \\log_2 64 \\rceil + 4 " +
              "\\text{ group elements} + 5 \\text{ scalars} \\]" +
              "\\[ = 2 \\cdot 6 + 4 = 16 \\text{ group elements} + " +
              "5 \\text{ scalars} \\]" +
              "On secp256k1 (33-byte points, 32-byte scalars): " +
              "\\( 16 \\times 33 + 5 \\times 32 = 528 + 160 = 688 \\) bytes. " +
              "Compare with Borromean ring signatures (Maxwell, 2015): " +
              "\\( 2 + 32 \\cdot 64 = 2050 \\) bytes for 64-bit range. " +
              "Aggregation of \\( m \\) proofs adds only " +
              "\\( 2 \\lceil \\log_2 m \\rceil \\) group elements: " +
              "8 proofs cost ~866 bytes total, not 8 times 688."
          },
          {
            subtitle: "Bulletproofs++ Improvements",
            content:
              "Bulletproofs++ (Eagen, Flaminia, Ganesh, 2024) introduces " +
              "two main improvements. First, the reciprocal range proof " +
              "technique: instead of decomposing \\( v \\) into bits, " +
              "prove that \\( v \\) is a sum of digits in a chosen base " +
              "\\( b \\), using a reciprocal argument " +
              "\\( \\sum 1/(X - d_i) \\) to enforce digit membership. " +
              "Second, the norm argument replaces the inner product " +
              "argument with a more efficient \\( \\ell_2 \\)-norm " +
              "argument. Combined, BP++ achieves ~416 bytes for a " +
              "64-bit range proof (38% smaller than original " +
              "Bulletproofs) and ~30% faster verification."
          }
        ],
        securityAnalysis:
          "<strong>Soundness (Schwartz-Zippel):</strong> " +
          "The inner product argument relies on the Schwartz-Zippel " +
          "lemma: if the prover cheats (the committed vectors do not " +
          "satisfy the inner product relation), then the polynomial " +
          "identity \\( P(x) = x^2 L + c + x^{-2} R \\) will fail " +
          "to hold for a random challenge \\( x \\) except with " +
          "probability \\( \\leq d/p \\) where \\( d \\) is the " +
          "polynomial degree. Over \\( \\log n \\) rounds, soundness " +
          "error is at most \\( (\\log n) / p \\), which is " +
          "negligible for 256-bit primes." +
          "<br><br>" +
          "<strong>Zero-knowledge (simulator construction):</strong> " +
          "In the Fiat-Shamir model, the simulator programs the " +
          "random oracle to produce challenges consistent with " +
          "uniformly sampled \\( L_i, R_i \\) values. The simulator " +
          "does not need the witness \\( (v, r) \\). This is a " +
          "standard rewinding argument in the random oracle model." +
          "<br><br>" +
          "<strong>No trusted setup:</strong> " +
          "Unlike SNARKs (Groth16, PLONK), Bulletproofs require " +
          "only a common reference string of independent group " +
          "generators. These can be generated deterministically via " +
          "hash-to-curve, requiring no MPC ceremony and producing " +
          "no toxic waste. A compromised SNARK trusted setup allows " +
          "forging proofs (e.g., creating money); Bulletproofs " +
          "eliminate this risk entirely.",
        practicalNotes:
          "<strong>Aggregation:</strong> " +
          "When a transaction has \\( m \\) outputs, the range proofs " +
          "can be aggregated into a single proof of size " +
          "\\( 2(\\lceil \\log_2(m \\cdot n) \\rceil) + 4 \\) group " +
          "elements. For 8 outputs with 64-bit ranges: " +
          "\\( 2 \\cdot 9 + 4 = 22 \\) group elements instead of " +
          "\\( 8 \\times 16 = 128 \\)." +
          "<br><br>" +
          "<strong>Batch verification:</strong> " +
          "Multiple independent Bulletproofs can be batch-verified " +
          "using random linear combinations, reducing amortized " +
          "verification cost by ~50% (Bunz et al., 2018, Section 4.4). " +
          "Grin uses this for block validation." +
          "<br><br>" +
          "<strong>Verification cost:</strong> " +
          "Single verification requires \\( O(n) \\) group " +
          "exponentiations (the verifier must reconstruct the " +
          "generator folding). This is the main drawback compared " +
          "to SNARKs with \\( O(1) \\) verification. For 64-bit " +
          "proofs: ~3 ms on modern hardware." +
          "<br><br>" +
          "<strong>Implementations:</strong> " +
          "dalek-cryptography/bulletproofs (Rust, Ristretto255), " +
          "secp256k1-zkp (C, secp256k1, used in Grin/Liquid), " +
          "Mysten Labs fastcrypto (Rust, Ristretto255, includes BP).",
        keyFormulas: [
          {
            name: "Inner Product",
            formula:
              "\\[ \\langle \\mathbf{a}, \\mathbf{b} \\rangle = " +
              "\\sum_{i=0}^{n-1} a_i \\cdot b_i \\]"
          },
          {
            name: "Recursive Cross-Terms (L, R)",
            formula:
              "\\[ L_j = \\langle \\mathbf{a}_{\\text{lo}}, " +
              "\\mathbf{G}_{\\text{hi}} \\rangle + " +
              "\\langle \\mathbf{b}_{\\text{hi}}, " +
              "\\mathbf{H}_{\\text{lo}} \\rangle + " +
              "\\langle \\mathbf{a}_{\\text{lo}}, " +
              "\\mathbf{b}_{\\text{hi}} \\rangle \\cdot U \\]"
          },
          {
            name: "Fiat-Shamir Challenge",
            formula:
              "\\[ x_j = H(\\text{transcript} \\| L_j \\| R_j) \\]"
          },
          {
            name: "Proof Size (64-bit range)",
            formula:
              "\\[ |\\pi| = 2\\lceil \\log_2 n \\rceil + 4 " +
              "\\text{ points} + 5 \\text{ scalars} " +
              "\\approx 672 \\text{ bytes} \\]"
          }
        ],
        exercises: [
          {
            type: "calculation",
            question:
              "Trace one round of the inner product halving for " +
              "a = (3, 7, 2, 5) and b = (1, 4, 6, 3) with challenge x = 2. " +
              "Compute the folded vectors a' and b' and verify that " +
              "<a', b'> = x^2 * <a_lo, b_hi> + <a, b> + x^{-2} * <a_hi, b_lo>.",
            hint:
              "Split: a_lo = (3, 7), a_hi = (2, 5), " +
              "b_lo = (1, 4), b_hi = (6, 3). " +
              "Compute L = <a_lo, b_hi> = 3*6 + 7*3 = 39, " +
              "R = <a_hi, b_lo> = 2*1 + 5*4 = 22, " +
              "c = <a, b> = 3 + 28 + 12 + 15 = 58.",
            answer:
              "a' = x*a_lo + x^{-1}*a_hi = 2*(3,7) + 0.5*(2,5) = (7, 16.5). " +
              "b' = x^{-1}*b_lo + x*b_hi = 0.5*(1,4) + 2*(6,3) = (12.5, 8). " +
              "<a', b'> = 7*12.5 + 16.5*8 = 87.5 + 132 = 219.5. " +
              "Check: x^2*L + c + x^{-2}*R = 4*39 + 58 + 0.25*22 = 156 + 58 + 5.5 = 219.5. Matches."
          },
          {
            type: "comparison",
            question:
              "Compare proof sizes for a 64-bit range proof across " +
              "Borromean ring signatures, Bulletproofs, and Bulletproofs++. " +
              "For each, state the size and its asymptotic complexity.",
            hint:
              "Borromean: linear in n (bits). " +
              "Bulletproofs: logarithmic in n. " +
              "Bulletproofs++: also logarithmic but with better constants.",
            answer:
              "Borromean: O(n) = 64 * (32 + 32) + 32 = ~4,128 bytes (ring sig per bit). " +
              "Bulletproofs: O(log n) = 2*6+4 = 16 points + 5 scalars = ~672 bytes. " +
              "Bulletproofs++: O(log n) with reciprocal technique = ~416 bytes (38% smaller). " +
              "The jump from Borromean to BP is 6x; BP to BP++ is ~1.6x."
          },
          {
            type: "conceptual",
            question:
              "Explain why Bulletproofs do not require a trusted setup " +
              "while Groth16 SNARKs do. What is the concrete risk of " +
              "a compromised trusted setup in a payment system?",
            hint:
              "Consider what the CRS (common reference string) looks " +
              "like for each system and what knowledge of the trapdoor enables.",
            answer:
              "Bulletproofs CRS consists of independent group generators " +
              "derived via hash-to-curve: no secret is involved. Groth16 " +
              "CRS contains encrypted powers of a secret tau (toxic waste). " +
              "If tau is known, the adversary can forge any proof, including " +
              "a range proof for a negative value, enabling unlimited " +
              "money creation. This is why Zcash required elaborate MPC " +
              "ceremonies (Powers of Tau) to generate their CRS."
          }
        ]
      },

      /* ───────── Mimblewimble ───────── */
      {
        name: "Mimblewimble",
        formalDefinition:
          "Mimblewimble (Tom Elvis Jedusor, 2016; refined by " +
          "Andrew Poelstra, 2016) is a UTXO-based confidential " +
          "transaction protocol where every output is a Pedersen " +
          "commitment \\( C = v \\cdot G + r \\cdot H \\). " +
          "There are no addresses and no scripts. Ownership is " +
          "proved solely by knowledge of the blinding factor " +
          "\\( r \\). A valid transaction satisfies:" +
          "\\[ \\sum_{i} C_{\\text{in},i} - \\sum_{j} C_{\\text{out},j} " +
          "- \\text{fee} \\cdot G = r_{\\text{excess}} \\cdot H \\]" +
          "The excess \\( r_{\\text{excess}} \\cdot H \\) is called " +
          "the transaction kernel and is accompanied by a Schnorr " +
          "signature proving knowledge of \\( r_{\\text{excess}} \\). " +
          "Cut-through allows intermediate outputs to be algebraically " +
          "eliminated from the blockchain.",
        mathDetails: [
          {
            subtitle: "Transaction Kernel (Excess and Signature)",
            content:
              "Define the kernel excess as:" +
              "\\[ E = \\sum_{i} C_{\\text{in},i} - \\sum_{j} C_{\\text{out},j} " +
              "- \\text{fee} \\cdot G \\]" +
              "If values balance (\\( \\sum v_{\\text{in}} = " +
              "\\sum v_{\\text{out}} + \\text{fee} \\)), then:" +
              "\\[ E = (\\sum r_{\\text{in}} - \\sum r_{\\text{out}}) " +
              "\\cdot H = r_{\\text{excess}} \\cdot H \\]" +
              "The kernel is the pair \\( (E, \\sigma) \\) where " +
              "\\( \\sigma \\) is a Schnorr signature proving " +
              "knowledge of \\( r_{\\text{excess}} \\) such that " +
              "\\( E = r_{\\text{excess}} \\cdot H \\). This serves " +
              "as transaction authorization: only someone who knows " +
              "both the input and output blinding factors can produce " +
              "a valid kernel signature."
          },
          {
            subtitle: "Schnorr Multi-Signature for Kernel",
            content:
              "In practice, sender and receiver jointly construct the " +
              "kernel via an interactive multi-signature protocol. " +
              "The sender knows \\( r_{\\text{in}} \\) and the " +
              "receiver chooses \\( r_{\\text{out}} \\). Neither " +
              "party alone knows \\( r_{\\text{excess}} = " +
              "r_{\\text{in}} - r_{\\text{out}} \\). They use a " +
              "2-of-2 Schnorr multi-signature:" +
              "\\[ \\text{Each party picks nonce } k_i, " +
              "\\text{ shares } R_i = k_i \\cdot H \\]" +
              "\\[ R = R_1 + R_2, \\quad " +
              "e = H_{\\text{sig}}(R \\| E \\| \\text{msg}) \\]" +
              "\\[ s_i = k_i + e \\cdot r_i^{\\text{partial}}, \\quad " +
              "s = s_1 + s_2 \\]" +
              "The combined \\( (R, s) \\) is a valid Schnorr " +
              "signature on the kernel excess \\( E \\)."
          },
          {
            subtitle: "Cut-Through Algebra",
            content:
              "Consider two transactions:" +
              "\\[ \\text{Tx}_1: C_A \\rightarrow C_B + C_C " +
              "\\quad (\\text{kernel } K_1) \\]" +
              "\\[ \\text{Tx}_2: C_B \\rightarrow C_D + C_E " +
              "\\quad (\\text{kernel } K_2) \\]" +
              "Output \\( C_B \\) from Tx1 is spent in Tx2. " +
              "After cut-through, \\( C_B \\) is removed from both " +
              "the output set and the input set:" +
              "\\[ \\text{Merged}: C_A \\rightarrow C_C + C_D + C_E " +
              "\\quad (\\text{kernels } K_1, K_2) \\]" +
              "Balance still holds because:" +
              "\\[ C_A - C_C - C_D - C_E = " +
              "(C_A - C_B - C_C) + (C_B - C_D - C_E) \\]" +
              "\\[ = K_1 + K_2 = (r_{\\text{excess},1} + " +
              "r_{\\text{excess},2}) \\cdot H \\]" +
              "The kernels are preserved; only the intermediate " +
              "output \\( C_B \\) disappears. A new node syncing " +
              "the chain only needs: block headers, the current " +
              "UTXO set, all kernels, and range proofs for " +
              "unspent outputs."
          }
        ],
        securityAnalysis:
          "<strong>Transaction graph leakage (pre-cut-through):</strong> " +
          "Before a block is mined, transactions propagate through " +
          "the mempool with their full input/output structure visible " +
          "to network observers. A surveillance node can reconstruct " +
          "the transaction graph even though amounts are hidden. " +
          "The Dandelion++ protocol (Fanti et al., 2018) mitigates " +
          "this by first propagating transactions along a random " +
          "'stem' path before broadcasting ('fluff' phase), making " +
          "it harder to link transactions to their origin IP." +
          "<br><br>" +
          "<strong>No scripting:</strong> " +
          "Mimblewimble's algebraic structure precludes standard " +
          "scripts (no OP_RETURN, no timelocks natively). Atomic " +
          "swaps require adaptor signatures (Poelstra, 2017). " +
          "This limits programmability compared to Bitcoin or Sui." +
          "<br><br>" +
          "<strong>Inflation audit:</strong> " +
          "Full nodes must verify all kernels and range proofs to " +
          "ensure no inflation occurred. A kernel-only sync (IBD) " +
          "trusts that the UTXO set is correct, which is weaker " +
          "than full validation. Grin mitigates this with full " +
          "archival nodes that store complete transaction history.",
        practicalNotes:
          "<strong>Interactive transaction construction:</strong> " +
          "The sender and receiver must exchange 'slates' (partial " +
          "transactions) to jointly construct the kernel. The " +
          "Slatepack format (Grin, 2020) standardizes this as " +
          "ASCII-armored messages exchangeable via any channel " +
          "(Tor, email, QR codes). This remains the biggest UX " +
          "hurdle: both parties must be online or use asynchronous " +
          "relay services." +
          "<br><br>" +
          "<strong>Scaling benefits:</strong> " +
          "After full cut-through, a Grin blockchain with the same " +
          "transaction volume as Bitcoin would be ~100x smaller. " +
          "New node sync requires only: ~1 MB block headers, the " +
          "UTXO set (~1 GB for Bitcoin-scale), and all kernels " +
          "(~100 bytes each, one per historical transaction)." +
          "<br><br>" +
          "<strong>Implementations:</strong> " +
          "Grin (Rust, community-driven, pure Mimblewimble), " +
          "Beam (C++, added confidential assets and Lelantus-MW), " +
          "Litecoin MWEB (opt-in Mimblewimble Extension Blocks, " +
          "activated May 2022).",
        keyFormulas: [
          {
            name: "Balance Equation",
            formula:
              "\\[ \\sum C_{\\text{in}} - \\sum C_{\\text{out}} " +
              "- \\text{fee} \\cdot G = r_{\\text{excess}} \\cdot H \\]"
          },
          {
            name: "Kernel Excess",
            formula:
              "\\[ E = r_{\\text{excess}} \\cdot H, \\quad " +
              "r_{\\text{excess}} = \\sum r_{\\text{in}} - " +
              "\\sum r_{\\text{out}} \\]"
          },
          {
            name: "Cut-Through Cancellation",
            formula:
              "\\[ \\{C_A \\to C_B, C_C\\} + \\{C_B \\to C_D, C_E\\} " +
              "\\;\\Rightarrow\\; \\{C_A \\to C_C, C_D, C_E\\} \\]"
          }
        ],
        exercises: [
          {
            type: "calculation",
            question:
              "A Mimblewimble transaction has 2 inputs committing to " +
              "(v=8, r=3) and (v=12, r=7), and 2 outputs committing to " +
              "(v=15, r=4) and (v=5, r=2), with fee=0. Verify the " +
              "balance equation and compute the kernel excess scalar.",
            hint:
              "Sum of input values: 8 + 12 = 20. " +
              "Sum of output values: 15 + 5 = 20. Values balance. " +
              "Now compute r_excess = sum(r_in) - sum(r_out).",
            answer:
              "r_excess = (3 + 7) - (4 + 2) = 10 - 6 = 4. " +
              "Kernel excess E = 4*H. The kernel signature proves " +
              "knowledge of r_excess = 4 via a Schnorr signature on H."
          },
          {
            type: "calculation",
            question:
              "Given Tx1: C_A -> C_B, C_C (kernel K1) and " +
              "Tx2: C_B -> C_D (kernel K2), show how cut-through " +
              "removes C_B. If C_A commits to (v=10, r=5), C_B to " +
              "(v=7, r=3), C_C to (v=3, r=1), C_D to (v=7, r=6), " +
              "verify the merged balance equation.",
            hint:
              "After cut-through: inputs = {C_A}, outputs = {C_C, C_D}. " +
              "Check values: 10 = 3 + 7 = 10. " +
              "r_total = r(A) - r(C) - r(D) = 5 - 1 - 6.",
            answer:
              "Values: 10 = 3 + 7. Correct. " +
              "Blinding: r_excess_total = 5 - 1 - 6 = -2. " +
              "Cross-check: K1 excess = 5 - 3 - 1 = 1, K2 excess = 3 - 6 = -3. " +
              "Sum: 1 + (-3) = -2. Matches r_excess_total. " +
              "E_merged = -2 * H, verified by K1 + K2."
          },
          {
            type: "conceptual",
            question:
              "Explain why Mimblewimble requires interaction between " +
              "sender and receiver to construct a transaction, while " +
              "Bitcoin does not. What fundamental property forces this?",
            hint:
              "Think about who chooses the blinding factor for the " +
              "output commitment and why the receiver must be involved.",
            answer:
              "In Bitcoin, the sender can construct the entire transaction " +
              "because outputs are identified by addresses (public key hashes). " +
              "In Mimblewimble, the receiver must choose their output's " +
              "blinding factor r (which serves as their private key for that " +
              "coin). If the sender chose r, they could spend the output " +
              "themselves. The kernel signature requires both parties' " +
              "partial blinding factors, enforcing a multi-signature protocol."
          }
        ]
      },

      /* ───────── ElGamal Auditor Keys ───────── */
      {
        name: "ElGamal Auditor Keys",
        formalDefinition:
          "The ElGamal auditor key pattern encrypts transaction " +
          "values to an auditor's public key alongside each Pedersen " +
          "commitment. Given an auditor's key pair " +
          "\\( (a, A = a \\cdot G) \\) and a transaction value " +
          "\\( v \\), the sender encrypts:" +
          "\\[ R = k \\cdot G, \\quad C_{\\text{enc}} = v \\cdot G + k \\cdot A \\]" +
          "where \\( k \\xleftarrow{\\$} \\mathbb{Z}_p \\) is a random " +
          "ephemeral key. The ciphertext \\( (R, C_{\\text{enc}}) \\) " +
          "is published alongside the Pedersen commitment. Only the " +
          "auditor, knowing \\( a \\), can recover \\( v \\cdot G \\) " +
          "and extract \\( v \\). This is an elliptic curve variant " +
          "of ElGamal encryption (ElGamal, 1985).",
        mathDetails: [
          {
            subtitle: "Decryption and Value Recovery",
            content:
              "The auditor computes:" +
              "\\[ C_{\\text{enc}} - a \\cdot R = " +
              "(v \\cdot G + k \\cdot A) - a \\cdot (k \\cdot G) \\]" +
              "\\[ = v \\cdot G + k \\cdot a \\cdot G - a \\cdot k \\cdot G " +
              "= v \\cdot G \\]" +
              "This yields the point \\( v \\cdot G \\), not " +
              "\\( v \\) directly. For small values " +
              "(\\( v < 2^{40} \\)), the auditor recovers \\( v \\) via " +
              "Baby-step Giant-step (BSGS): precompute " +
              "\\( \\{j \\cdot G : 0 \\leq j < 2^{20}\\} \\) and " +
              "search for \\( v \\cdot G - j \\cdot G = " +
              "i \\cdot (2^{20} \\cdot G) \\) with " +
              "\\( 0 \\leq i < 2^{20} \\). Total: \\( O(2^{20}) \\) " +
              "storage and \\( O(2^{20}) \\) group operations, " +
              "recovering values up to \\( 2^{40} \\) in ~1 second."
          },
          {
            subtitle: "Twisted ElGamal Variant (Aptos)",
            content:
              "The Twisted ElGamal variant (used in Aptos confidential " +
              "transactions) restructures the ciphertext so the owner " +
              "can decrypt their own balance efficiently:" +
              "\\[ C_{\\text{tw}} = (v \\cdot G + r \\cdot \\text{PK}, \\;" +
              " r \\cdot G) \\]" +
              "where \\( \\text{PK} = \\text{sk} \\cdot G \\) is the " +
              "owner's public key. The owner decrypts:" +
              "\\[ v \\cdot G + r \\cdot \\text{PK} - \\text{sk} \\cdot " +
              "(r \\cdot G) = v \\cdot G \\]" +
              "then recovers \\( v \\) via BSGS. Crucially, this is " +
              "also a valid Pedersen commitment (to \\( v \\) with " +
              "blinding factor \\( r \\) under generator \\( \\text{PK} \\)), " +
              "so it supports homomorphic balance verification and " +
              "Bulletproof range proofs simultaneously."
          },
          {
            subtitle: "Equality Proof (Two Ciphertexts, Same Value)",
            content:
              "To prove that a Pedersen commitment \\( C = v \\cdot G + " +
              "r \\cdot H \\) and an ElGamal ciphertext " +
              "\\( (R, C_{\\text{enc}} = v \\cdot G + k \\cdot A) \\) " +
              "encrypt the same value \\( v \\), the prover constructs " +
              "a sigma protocol:" +
              "\\[ \\text{Prove knowledge of } (v, r, k) \\text{ such that:} \\]" +
              "\\[ C = v \\cdot G + r \\cdot H \\quad \\wedge \\quad " +
              "C_{\\text{enc}} = v \\cdot G + k \\cdot A \\quad \\wedge \\quad " +
              "R = k \\cdot G \\]" +
              "This is a standard conjunction of Schnorr-type proofs " +
              "sharing the witness component \\( v \\). The proof size " +
              "is 3 group elements + 3 scalars (~200 bytes), and " +
              "verification requires 6 multi-scalar multiplications."
          },
          {
            subtitle: "Multiple Auditor Keys Pattern",
            content:
              "For \\( m \\) auditors with keys " +
              "\\( A_1, \\ldots, A_m \\), the sender produces " +
              "\\( m \\) ElGamal ciphertexts:" +
              "\\[ (R_j = k_j \\cdot G, \\; C_j = v \\cdot G + " +
              "k_j \\cdot A_j) \\quad j = 1, \\ldots, m \\]" +
              "Each auditor \\( j \\) can only decrypt their own " +
              "ciphertext. Optimization: use a single \\( k \\) for " +
              "all ciphertexts (\\( R = k \\cdot G \\)) if auditors " +
              "are non-colluding, reducing the overhead from " +
              "\\( m \\) points to 1 shared \\( R \\) plus \\( m \\) " +
              "encrypted values. The equality proof extends to prove " +
              "all ciphertexts encrypt the same \\( v \\) as the " +
              "Pedersen commitment."
          }
        ],
        securityAnalysis:
          "<strong>IND-CPA security under DDH:</strong> " +
          "ElGamal encryption is IND-CPA secure (indistinguishable " +
          "under chosen-plaintext attack) under the Decisional " +
          "Diffie-Hellman assumption. Given " +
          "\\( (g, g^a, g^k, g^{ak}) \\) vs \\( (g, g^a, g^k, g^z) \\), " +
          "distinguishing the real ciphertext from random is as hard " +
          "as DDH." +
          "<br><br>" +
          "<strong>Not IND-CCA2 (malleability):</strong> " +
          "ElGamal is malleable: given ciphertext " +
          "\\( (R, C_{\\text{enc}}) \\) for value \\( v \\), anyone " +
          "can compute \\( (R, C_{\\text{enc}} + \\delta \\cdot G) \\) " +
          "which decrypts to \\( v + \\delta \\). In the auditor " +
          "context, this means a malicious party could modify the " +
          "audit ciphertext to report a different value. Mitigation: " +
          "the equality proof between the Pedersen commitment and " +
          "the ElGamal ciphertext binds them together, preventing " +
          "independent modification." +
          "<br><br>" +
          "<strong>Auditor key compromise:</strong> " +
          "If the auditor's private key \\( a \\) is leaked, all " +
          "historical and future transactions can be decrypted. " +
          "Mitigation: key rotation (new auditor key per epoch), " +
          "threshold decryption (\\( t \\)-of-\\( n \\) auditors must " +
          "cooperate to decrypt), or forward-secret schemes where " +
          "past ciphertexts cannot be decrypted with the current key.",
        practicalNotes:
          "<strong>Zcash viewing keys comparison:</strong> " +
          "Zcash Sapling provides incoming viewing keys (ivk) and " +
          "outgoing viewing keys (ovk). The ivk lets a third party " +
          "detect and decrypt incoming payments; the ovk allows " +
          "viewing sent transactions. This is functionally equivalent " +
          "to the ElGamal auditor pattern but integrated into the " +
          "note encryption scheme (Sapling uses a KDF + symmetric " +
          "encryption derived from a DH exchange, not raw ElGamal)." +
          "<br><br>" +
          "<strong>Integration with Pedersen commitments:</strong> " +
          "Each transaction output carries: (1) a Pedersen commitment " +
          "\\( C = v \\cdot G + r \\cdot H \\), (2) a Bulletproof range " +
          "proof for \\( v \\geq 0 \\), (3) an ElGamal ciphertext " +
          "\\( (R, C_{\\text{enc}}) \\) for the auditor, and (4) an " +
          "equality proof linking (1) and (3). Total overhead per " +
          "output: ~32 + ~672 + ~64 + ~200 = ~968 bytes (or ~744 " +
          "bytes with Bulletproofs++)." +
          "<br><br>" +
          "<strong>BSGS table:</strong> " +
          "The precomputed table for value recovery occupies " +
          "\\( 2^{20} \\times 32 \\) bytes = 32 MB for a 40-bit " +
          "value range. This is computed once and reused for all " +
          "decryptions. For 48-bit ranges, the table grows to " +
          "\\( 2^{24} \\times 32 \\) = 512 MB.",
        keyFormulas: [
          {
            name: "ElGamal Encryption",
            formula:
              "\\[ R = k \\cdot G, \\quad " +
              "C_{\\text{enc}} = v \\cdot G + k \\cdot A \\]"
          },
          {
            name: "Auditor Decryption",
            formula:
              "\\[ v \\cdot G = C_{\\text{enc}} - a \\cdot R \\]"
          },
          {
            name: "Equality Proof Statement",
            formula:
              "\\[ \\exists \\; (v, r, k): \\; " +
              "C = v G + r H \\;\\wedge\\; " +
              "C_{\\text{enc}} = v G + k A \\;\\wedge\\; " +
              "R = k G \\]"
          },
          {
            name: "BSGS Value Recovery",
            formula:
              "\\[ v = i \\cdot 2^{\\lceil n/2 \\rceil} + j, \\quad " +
              "0 \\leq i, j < 2^{\\lceil n/2 \\rceil} \\]"
          }
        ],
        exercises: [
          {
            type: "calculation",
            question:
              "In a toy group with G as generator and auditor key " +
              "A = 5*G, encrypt value v = 7 using ephemeral key k = 3. " +
              "Compute R and C_enc. Then decrypt using the auditor's " +
              "private key a = 5.",
            hint:
              "R = k*G = 3*G. C_enc = v*G + k*A = 7*G + 3*(5*G) = 7*G + 15*G.",
            answer:
              "R = 3*G. C_enc = 7*G + 15*G = 22*G. " +
              "Decryption: C_enc - a*R = 22*G - 5*(3*G) = 22*G - 15*G = 7*G. " +
              "The auditor obtains 7*G and recovers v = 7 via BSGS or lookup."
          },
          {
            type: "calculation",
            question:
              "An auditor receives ciphertext (R = 3*G, C_enc = 22*G) " +
              "and their private key is a = 5. They compute " +
              "V = C_enc - a*R = 7*G. Using BSGS with a split at " +
              "2^2 = 4 (baby step size), find v if v < 16.",
            hint:
              "Precompute baby steps: {0*G, 1*G, 2*G, 3*G}. " +
              "Giant step: 4*G. Check V - i*(4*G) for i = 0, 1, 2, 3.",
            answer:
              "Baby steps: {0, G, 2G, 3G} stored as lookup. " +
              "i=0: V - 0 = 7G. Not in baby set. " +
              "i=1: V - 4G = 3G. Found at j=3. " +
              "v = i*4 + j = 1*4 + 3 = 7. Correct."
          },
          {
            type: "design",
            question:
              "Design a multi-auditor scheme where a tax authority " +
              "sees transaction amounts and a compliance officer sees " +
              "amounts plus sender identity. What ciphertexts and " +
              "proofs would each transaction carry?",
            hint:
              "Think about what information each auditor needs. " +
              "Tax authority: just v. Compliance: v plus sender " +
              "public key. Each gets their own ElGamal ciphertext.",
            answer:
              "Each transaction carries: (1) Pedersen commitment C = v*G + r*H, " +
              "(2) Bulletproof range proof, " +
              "(3) ElGamal to tax authority: (k1*G, v*G + k1*A_tax), " +
              "(4) ElGamal to compliance: (k2*G, v*G + k2*A_comp) plus an " +
              "additional ciphertext encrypting the sender's public key " +
              "(k3*G, sender_pk + k3*A_comp), " +
              "(5) Equality proofs linking commitments (1), (3), and (4) " +
              "to the same value v. Tax authority decrypts only (3) to get v. " +
              "Compliance decrypts (4) and the sender key ciphertext."
          }
        ]
      }
    ]
  }
};
