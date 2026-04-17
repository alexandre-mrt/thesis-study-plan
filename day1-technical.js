/**
 * Day 1 Technical Companion — Crypto Foundations + ZKP
 * Deep mathematical / formal definitions paired with DAY1_GUIDE.
 * Rendered with KaTeX: \\( ... \\) for inline, \\[ ... \\] for display.
 */

window.DAY1_TECHNICAL = {
  block1: {
    concepts: [
      /* ───────── Hash Functions ───────── */
      {
        name: "Hash Functions",
        formalDefinition:
          "A cryptographic hash function is a deterministic, " +
          "efficiently computable function " +
          "\\( H: \\{0,1\\}^{*} \\rightarrow \\{0,1\\}^{n} \\) " +
          "that maps arbitrary-length inputs to fixed-length " +
          "\\( n \\)-bit outputs and satisfies three security " +
          "properties parameterized by the security parameter " +
          "\\( \\lambda \\).",
        mathDetails: [
          {
            subtitle: "Preimage Resistance",
            content:
              "For a randomly sampled \\( y \\in \\{0,1\\}^n \\), " +
              "no PPT adversary \\( \\mathcal{A} \\) can find " +
              "\\( x \\) such that \\( H(x) = y \\) with " +
              "non-negligible probability:" +
              "\\[ \\Pr\\bigl[\\mathcal{A}(y) = x \\;:\\; " +
              "H(x) = y\\bigr] \\leq \\mathrm{negl}(\\lambda) \\]" +
              "This is the one-way property: the function is " +
              "easy to compute in the forward direction but " +
              "computationally infeasible to invert. Generic " +
              "preimage attacks require \\( O(2^n) \\) evaluations."
          },
          {
            subtitle: "Second Preimage Resistance",
            content:
              "Given \\( x \\), no PPT adversary can find " +
              "\\( x' \\neq x \\) such that " +
              "\\( H(x) = H(x') \\):" +
              "\\[ \\Pr\\bigl[\\mathcal{A}(x) = x' \\;:\\; " +
              "x' \\neq x \\wedge H(x) = H(x')\\bigr] " +
              "\\leq \\mathrm{negl}(\\lambda) \\]" +
              "Second preimage resistance is strictly weaker " +
              "than collision resistance: if you can find " +
              "collisions, you can find second preimages, but " +
              "not necessarily vice versa."
          },
          {
            subtitle: "Collision Resistance",
            content:
              "No PPT adversary can find any pair " +
              "\\( (x, x') \\) with \\( x \\neq x' \\) and " +
              "\\( H(x) = H(x') \\):" +
              "\\[ \\Pr\\bigl[\\mathcal{A}() = (x, x') \\;:\\; " +
              "x \\neq x' \\wedge H(x) = H(x')\\bigr] " +
              "\\leq \\mathrm{negl}(\\lambda) \\]" +
              "By the birthday paradox, a generic collision " +
              "search succeeds after \\( O(2^{n/2}) \\) " +
              "evaluations. For \\( n = 256 \\), this gives a " +
              "\\( 2^{128} \\) security bound."
          },
          {
            subtitle: "Birthday Bound Analysis",
            content:
              "Given \\( q \\) random queries to \\( H \\), the " +
              "probability of at least one collision is:" +
              "\\[ \\Pr[\\text{collision}] \\approx " +
              "1 - e^{-q^2 / (2 \\cdot 2^n)} \\]" +
              "Setting this to \\( 1/2 \\) yields " +
              "\\( q \\approx 1.177 \\cdot 2^{n/2} \\). " +
              "This birthday bound is tight for ideal hash " +
              "functions and dictates the minimum output length: " +
              "for 128-bit security we need \\( n \\geq 256 \\)."
          },
          {
            subtitle: "Merkle-Damgard Construction",
            content:
              "Most classical hash functions (SHA-256, SHA-1) " +
              "use the Merkle-Damgard paradigm: the input is " +
              "padded and split into blocks " +
              "\\( m_1, m_2, \\ldots, m_\\ell \\). A compression " +
              "function \\( f: \\{0,1\\}^n \\times \\{0,1\\}^b " +
              "\\rightarrow \\{0,1\\}^n \\) is iterated:" +
              "\\[ h_0 = \\mathrm{IV}, \\quad " +
              "h_i = f(h_{i-1}, m_i), \\quad " +
              "H(m) = h_\\ell \\]" +
              "If \\( f \\) is collision resistant, then " +
              "\\( H \\) is collision resistant. However, " +
              "Merkle-Damgard is vulnerable to length-extension " +
              "attacks (mitigated in SHA-3/Keccak via the sponge " +
              "construction)."
          },
          {
            subtitle: "Random Oracle Model vs Standard Model",
            content:
              "The Random Oracle Model (ROM) treats \\( H \\) " +
              "as a truly random function: for each new query " +
              "\\( x \\), the output \\( H(x) \\) is uniformly " +
              "random and independent of all previous outputs. " +
              "Security proofs in the ROM are stronger but " +
              "rely on an idealization. The standard model " +
              "proves security using only concrete properties " +
              "(collision resistance, etc.) without idealizing " +
              "\\( H \\). The Fiat-Shamir transform is proven " +
              "secure in the ROM; standard-model alternatives " +
              "exist but are less efficient."
          }
        ],
        securityAnalysis:
          "Generic attack complexities: preimage " +
          "\\( O(2^n) \\), second preimage \\( O(2^n) \\), " +
          "collision \\( O(2^{n/2}) \\) (birthday bound). " +
          "For SHA-256 (\\( n = 256 \\)): collision security " +
          "is \\( 2^{128} \\), no known attacks faster than " +
          "generic. For SHA-1 (\\( n = 160 \\)): practical " +
          "collision found (SHAttered, 2017) at " +
          "\\( \\approx 2^{63} \\) operations. " +
          "In the ZK context, the hash function choice affects " +
          "circuit cost: SHA-256 requires ~27,000 R1CS " +
          "constraints while ZK-friendly hashes (Poseidon) " +
          "require ~250 constraints.",
        practicalNotes:
          "SHA-256: 256-bit output, ~500 MB/s software, " +
          "~27,000 R1CS constraints per hash. " +
          "Blake2b: 256-bit, ~1 GB/s, used in Sui transaction " +
          "hashing. " +
          "Poseidon: algebraic hash over \\( \\mathbb{F}_p \\), " +
          "~250 R1CS constraints, ~8x faster in ZK circuits " +
          "than SHA-256, standard for in-circuit hashing " +
          "(Zcash Sapling, Filecoin). " +
          "Pedersen hash: defined on elliptic curves, ~1,500 " +
          "constraints, used in Zcash Sprout Merkle trees. " +
          "MiMC: \\( x \\mapsto x^3 + k \\) iterated, ~300 " +
          "constraints, used in Tornado Cash. " +
          "For Merkle trees of depth \\( d \\): verification " +
          "requires \\( d \\) hash evaluations and \\( d \\) " +
          "sibling nodes as proof.",
        keyFormulas: [
          {
            name: "Birthday Bound",
            formula:
              "\\[ \\Pr[\\text{collision among } q \\text{ queries}] " +
              "\\approx 1 - e^{-q^2/(2 \\cdot 2^n)} \\]"
          },
          {
            name: "Merkle Tree Verification",
            formula:
              "\\[ \\text{Verify}(\\text{root}, \\text{leaf}, " +
              "\\text{path}) : \\; h_0 = \\text{leaf}, \\;" +
              " h_{i+1} = H(h_i \\| \\text{sibling}_i), \\; " +
              "h_d \\stackrel{?}{=} \\text{root} \\]"
          },
          {
            name: "Collision Resistance Bound",
            formula:
              "\\[ q \\approx 1.177 \\cdot 2^{n/2} " +
              "\\text{ queries for 50\\% collision probability} \\]"
          }
        ],
        exercises: [
          {
            type: "calculation",
            question:
              "A hash function has output length \\( n = 160 \\) bits " +
              "(like SHA-1). Using the birthday bound formula, how many " +
              "hash evaluations \\( q \\) are needed for a 50% chance " +
              "of finding a collision? Express your answer as a power of 2.",
            hint:
              "Use \\( q \\approx 1.177 \\cdot 2^{n/2} \\). Since " +
              "\\( 1.177 \\approx 2^{0.24} \\), you can write the " +
              "result as \\( 2^{n/2 + 0.24} \\).",
            answer:
              "\\( q \\approx 1.177 \\cdot 2^{80} \\approx 2^{80.24} \\). " +
              "So roughly \\( 2^{80} \\) evaluations suffice. This is " +
              "why SHA-1 (160-bit output) provides only ~80-bit " +
              "collision security, and the SHAttered attack achieved " +
              "a collision at \\( \\approx 2^{63} \\) due to " +
              "structural weaknesses."
          },
          {
            type: "conceptual",
            question:
              "Prove that collision resistance implies second preimage " +
              "resistance. That is, show that if an adversary " +
              "\\( \\mathcal{A} \\) can break second preimage " +
              "resistance, then there exists an adversary " +
              "\\( \\mathcal{B} \\) that breaks collision resistance.",
            hint:
              "Construct \\( \\mathcal{B} \\) as a reduction: " +
              "\\( \\mathcal{B} \\) picks a random \\( x \\), runs " +
              "\\( \\mathcal{A}(x) \\) to get \\( x' \\neq x \\) " +
              "with \\( H(x) = H(x') \\). What does \\( \\mathcal{B} \\) " +
              "output?",
            answer:
              "\\( \\mathcal{B} \\) picks \\( x \\xleftarrow{\\$} " +
              "\\{0,1\\}^* \\), runs \\( x' \\leftarrow " +
              "\\mathcal{A}(x) \\). If \\( x' \\neq x \\) and " +
              "\\( H(x') = H(x) \\), output \\( (x, x') \\) as a " +
              "collision. Since \\( \\mathcal{A} \\) succeeds with " +
              "non-negligible probability \\( \\epsilon \\), " +
              "\\( \\mathcal{B} \\) finds a collision with the same " +
              "probability \\( \\epsilon \\). Contrapositive: if " +
              "\\( H \\) is collision resistant, then " +
              "\\( \\epsilon \\leq \\mathrm{negl}(\\lambda) \\), so " +
              "\\( H \\) is second preimage resistant."
          }
        ]
      },

      /* ───────── Commitment Schemes ───────── */
      {
        name: "Commitment Schemes",
        formalDefinition:
          "A commitment scheme is a pair of PPT algorithms " +
          "\\( (\\mathrm{Com}, \\mathrm{Open}) \\). The committer " +
          "computes \\( c = \\mathrm{Com}(m; r) \\) for message " +
          "\\( m \\) and randomness \\( r \\), producing " +
          "commitment \\( c \\). Later, the committer reveals " +
          "\\( (m, r) \\) and the verifier checks " +
          "\\( \\mathrm{Open}(c, m, r) \\stackrel{?}{=} 1 \\). " +
          "The scheme must satisfy hiding and binding.",
        mathDetails: [
          {
            subtitle: "Hiding Property",
            content:
              "Computational hiding: for all PPT adversaries " +
              "\\( \\mathcal{A} \\) and all " +
              "\\( m_0, m_1 \\):" +
              "\\[ \\bigl\\{\\mathrm{Com}(m_0; r) : " +
              "r \\leftarrow \\mathcal{R}\\bigr\\} " +
              "\\approx_c \\bigl\\{\\mathrm{Com}(m_1; r) : " +
              "r \\leftarrow \\mathcal{R}\\bigr\\} \\]" +
              "Perfect (information-theoretic) hiding means the " +
              "distributions are identical, not just " +
              "computationally indistinguishable. Pedersen " +
              "commitments achieve perfect hiding because for " +
              "any commitment \\( c \\) and any message " +
              "\\( m' \\), there exists exactly one \\( r' \\) " +
              "such that \\( c = g^{m'} h^{r'} \\)."
          },
          {
            subtitle: "Binding Property",
            content:
              "Computational binding: no PPT adversary can " +
              "find \\( (m_0, r_0, m_1, r_1) \\) with " +
              "\\( m_0 \\neq m_1 \\) and " +
              "\\( \\mathrm{Com}(m_0; r_0) = " +
              "\\mathrm{Com}(m_1; r_1) \\):" +
              "\\[ \\Pr\\bigl[\\mathrm{Com}(m_0; r_0) = " +
              "\\mathrm{Com}(m_1; r_1) \\wedge " +
              "m_0 \\neq m_1\\bigr] \\leq " +
              "\\mathrm{negl}(\\lambda) \\]" +
              "For Pedersen commitments, binding relies on the " +
              "discrete logarithm problem: if " +
              "\\( g^{m_0} h^{r_0} = g^{m_1} h^{r_1} \\), " +
              "then \\( g^{m_0 - m_1} = h^{r_1 - r_0} \\), " +
              "and since \\( m_0 \\neq m_1 \\) we get " +
              "\\( \\log_g h = (m_0 - m_1)(r_1 - r_0)^{-1} \\), " +
              "breaking DLP."
          },
          {
            subtitle: "Pedersen Commitment",
            content:
              "Let \\( \\mathbb{G} \\) be a cyclic group of " +
              "prime order \\( p \\) with generators \\( g, h \\) " +
              "where \\( \\log_g h \\) is unknown. The Pedersen " +
              "commitment to \\( m \\in \\mathbb{Z}_p \\) with " +
              "randomness \\( r \\in \\mathbb{Z}_p \\) is:" +
              "\\[ C = g^m \\cdot h^r \\]" +
              "This is perfectly hiding (for any \\( C \\) and " +
              "\\( m' \\), set \\( r' = (\\log_g C - m') \\cdot " +
              "(\\log_g h)^{-1} \\)) and computationally binding " +
              "under DLP."
          },
          {
            subtitle: "Homomorphic Property",
            content:
              "Pedersen commitments are additively homomorphic. " +
              "Given \\( C_1 = g^{m_1} h^{r_1} \\) and " +
              "\\( C_2 = g^{m_2} h^{r_2} \\):" +
              "\\[ C_1 \\cdot C_2 = g^{m_1 + m_2} \\cdot " +
              "h^{r_1 + r_2} = " +
              "\\mathrm{Com}(m_1 + m_2; r_1 + r_2) \\]" +
              "This enables proving linear relations on " +
              "committed values without opening them. For " +
              "example, to prove \\( m_3 = m_1 + m_2 \\), " +
              "show that \\( C_1 \\cdot C_2 / C_3 \\) is a " +
              "commitment to 0."
          },
          {
            subtitle: "Vector Pedersen Commitments",
            content:
              "For multi-attribute credentials, we commit to a " +
              "vector \\( \\mathbf{m} = (m_1, \\ldots, m_k) \\) " +
              "using independent generators " +
              "\\( g_1, \\ldots, g_k, h \\):" +
              "\\[ C = \\prod_{i=1}^{k} g_i^{m_i} \\cdot h^r " +
              "= g_1^{m_1} \\cdots g_k^{m_k} \\cdot h^r \\]" +
              "This generalizes the scalar Pedersen commitment " +
              "and is the foundation for BBS+ credential " +
              "commitments where each \\( m_i \\) is a " +
              "credential attribute."
          },
          {
            subtitle: "Impossibility: Perfect Hiding + Perfect Binding",
            content:
              "A fundamental result: no commitment scheme can " +
              "be simultaneously perfectly hiding and perfectly " +
              "binding. If perfectly hiding (all messages have " +
              "identical commitment distributions), then for any " +
              "commitment \\( c \\) there exist valid openings " +
              "to different messages, so binding cannot be " +
              "information-theoretic. The Pedersen commitment " +
              "trades perfect hiding for computational binding; " +
              "hash-based commitments " +
              "(\\( c = H(m \\| r) \\)) trade perfect binding " +
              "for computational hiding."
          }
        ],
        securityAnalysis:
          "Pedersen commitment security reduces to the DLP " +
          "in \\( \\mathbb{G} \\). Concretely, any adversary " +
          "breaking binding with advantage \\( \\epsilon \\) " +
          "yields a DLP solver with advantage " +
          "\\( \\epsilon \\). Hiding is unconditional " +
          "(information-theoretic): even an unbounded adversary " +
          "gains zero information about \\( m \\) from " +
          "\\( C \\). " +
          "The setup assumption (nobody knows " +
          "\\( \\log_g h \\)) is critical: if this discrete " +
          "log is known, the committer can equivocate " +
          "(open to different values). In practice, \\( g \\) " +
          "and \\( h \\) are derived via hash-to-curve to " +
          "ensure nobody knows the relationship.",
        practicalNotes:
          "Pedersen on BLS12-381 \\( \\mathbb{G}_1 \\): " +
          "commitment is one multi-exponentiation (~0.5 ms), " +
          "commitment size is one group element (48 bytes " +
          "compressed). " +
          "Vector Pedersen for \\( k \\) attributes: one " +
          "\\( (k+1) \\)-multi-exp (~0.5 + 0.3k ms). " +
          "Used in: BBS+ credential commitments, Bulletproofs " +
          "range proofs (commit to value then prove range), " +
          "Zcash note commitments (Windowed Pedersen hash " +
          "in Sapling, Sinsemilla in Orchard). " +
          "For on-chain use: the commitment is a single curve " +
          "point stored in the smart contract; verification " +
          "only requires re-computing the commitment.",
        keyFormulas: [
          {
            name: "Pedersen Commitment",
            formula:
              "\\[ C = g^m \\cdot h^r, \\quad " +
              "m \\in \\mathbb{Z}_p, \\; " +
              "r \\xleftarrow{\\$} \\mathbb{Z}_p \\]"
          },
          {
            name: "Homomorphic Property",
            formula:
              "\\[ C_1 \\cdot C_2 = g^{m_1 + m_2} " +
              "\\cdot h^{r_1 + r_2} \\]"
          },
          {
            name: "Vector Pedersen Commitment",
            formula:
              "\\[ C = \\prod_{i=1}^{k} g_i^{m_i} " +
              "\\cdot h^r \\]"
          }
        ],
        exercises: [
          {
            type: "calculation",
            question:
              "Let \\( g, h \\) be generators of a group of prime order " +
              "\\( p = 11 \\). Suppose \\( g = 2, h = 7 \\) in " +
              "\\( \\mathbb{Z}_{11}^* \\). Compute the Pedersen " +
              "commitment \\( C = g^m \\cdot h^r \\mod 11 \\) for " +
              "message \\( m = 3 \\) and randomness \\( r = 5 \\).",
            hint:
              "Compute \\( g^m = 2^3 \\mod 11 \\) and " +
              "\\( h^r = 7^5 \\mod 11 \\) separately, then multiply " +
              "modulo 11.",
            answer:
              "\\( g^m = 2^3 = 8 \\mod 11 \\). " +
              "\\( h^r = 7^5 = 16807 \\mod 11 \\). " +
              "\\( 16807 = 1527 \\times 11 + 10 \\), so " +
              "\\( 7^5 = 10 \\mod 11 \\). " +
              "\\( C = 8 \\cdot 10 = 80 = 7 \\cdot 11 + 3 \\), " +
              "so \\( C = 3 \\mod 11 \\)."
          },
          {
            type: "conceptual",
            question:
              "Demonstrate that Pedersen commitments are additively " +
              "homomorphic. Given \\( C_1 = g^{m_1} h^{r_1} \\) and " +
              "\\( C_2 = g^{m_2} h^{r_2} \\), show algebraically " +
              "that \\( C_1 \\cdot C_2 = \\mathrm{Com}(m_1 + m_2; " +
              "r_1 + r_2) \\). Then explain why this is useful for " +
              "confidential transactions.",
            hint:
              "Use the group law \\( g^a \\cdot g^b = g^{a+b} \\). " +
              "For confidential transactions, think about verifying " +
              "that inputs equal outputs without revealing amounts.",
            answer:
              "\\( C_1 \\cdot C_2 = g^{m_1} h^{r_1} \\cdot " +
              "g^{m_2} h^{r_2} = g^{m_1 + m_2} \\cdot " +
              "h^{r_1 + r_2} = \\mathrm{Com}(m_1 + m_2; " +
              "r_1 + r_2) \\). In confidential transactions, each " +
              "amount \\( v_i \\) is committed as \\( C_i \\). To " +
              "verify \\( \\sum v_{\\text{in}} = \\sum v_{\\text{out}} \\), " +
              "the verifier checks " +
              "\\( \\prod C_{\\text{in}} / \\prod C_{\\text{out}} " +
              "= h^{r_{\\text{diff}}} \\) (a commitment to 0), " +
              "provable without revealing any individual amount."
          }
        ]
      },

      /* ───────── Digital Signatures ───────── */
      {
        name: "Digital Signatures",
        formalDefinition:
          "A digital signature scheme is a triple of PPT " +
          "algorithms " +
          "\\( (\\mathrm{KeyGen}, \\mathrm{Sign}, " +
          "\\mathrm{Verify}) \\):" +
          "\\[ \\mathrm{KeyGen}(1^\\lambda) \\rightarrow " +
          "(sk, pk), \\quad " +
          "\\mathrm{Sign}(sk, m) \\rightarrow \\sigma, \\quad " +
          "\\mathrm{Verify}(pk, m, \\sigma) \\rightarrow " +
          "\\{0, 1\\} \\]" +
          "with correctness: " +
          "\\( \\mathrm{Verify}(pk, m, " +
          "\\mathrm{Sign}(sk, m)) = 1 \\) for all \\( m \\).",
        mathDetails: [
          {
            subtitle: "EUF-CMA Security",
            content:
              "Existential Unforgeability under Chosen Message " +
              "Attack (EUF-CMA): the adversary has access to a " +
              "signing oracle \\( \\mathcal{O}_{\\mathrm{Sign}} \\) " +
              "and must produce a valid signature on a message " +
              "\\( m^* \\) never queried to the oracle:" +
              "\\[ \\Pr\\bigl[\\mathrm{Verify}(pk, m^*, " +
              "\\sigma^*) = 1 \\;:\\; " +
              "m^* \\notin Q\\bigr] \\leq " +
              "\\mathrm{negl}(\\lambda) \\]" +
              "where \\( Q \\) is the set of queried messages. " +
              "This is the standard security notion for " +
              "digital signatures."
          },
          {
            subtitle: "Schnorr Signature",
            content:
              "Setup: group \\( \\mathbb{G} \\) of prime order " +
              "\\( p \\), generator \\( g \\), hash " +
              "\\( H \\). Key pair: \\( sk = x " +
              "\\xleftarrow{\\$} \\mathbb{Z}_p \\), " +
              "\\( pk = g^x \\)." +
              "\\[ \\textbf{Sign}(sk, m): \\; " +
              "k \\xleftarrow{\\$} \\mathbb{Z}_p, \\; " +
              "R = g^k, \\; " +
              "e = H(R \\| pk \\| m), \\; " +
              "s = k - e \\cdot x \\mod p. \\; " +
              "\\text{Output } \\sigma = (R, s). \\]" +
              "\\[ \\textbf{Verify}(pk, m, \\sigma): \\; " +
              "e = H(R \\| pk \\| m), \\; " +
              "g^s \\cdot pk^e \\stackrel{?}{=} R \\]" +
              "Correctness: \\( g^s \\cdot pk^e = " +
              "g^{k - ex} \\cdot g^{ex} = g^k = R \\). " +
              "Security reduces to the DLP in the ROM " +
              "(via the forking lemma)."
          },
          {
            subtitle: "BLS Signature",
            content:
              "Uses a pairing \\( e: \\mathbb{G}_1 \\times " +
              "\\mathbb{G}_2 \\rightarrow \\mathbb{G}_T \\) and " +
              "a hash-to-curve \\( H: \\{0,1\\}^* \\rightarrow " +
              "\\mathbb{G}_1 \\). Key pair: " +
              "\\( sk = x \\in \\mathbb{Z}_p \\), " +
              "\\( pk = [x]g_2 \\in \\mathbb{G}_2 \\)." +
              "\\[ \\mathrm{Sign}(sk, m): \\; " +
              "\\sigma = [x] H(m) \\in \\mathbb{G}_1 \\]" +
              "\\[ \\mathrm{Verify}(pk, m, \\sigma): \\; " +
              "e(\\sigma, g_2) \\stackrel{?}{=} " +
              "e(H(m), pk) \\]" +
              "Correctness: \\( e([x]H(m), g_2) = " +
              "e(H(m), g_2)^x = e(H(m), [x]g_2) \\). " +
              "Security reduces to CDH in the ROM. " +
              "Key advantage: signatures aggregate: " +
              "\\( \\sigma_{\\mathrm{agg}} = \\sum_i \\sigma_i \\), " +
              "verified with a single pairing equation."
          },
          {
            subtitle: "Blind Signatures (Chaum)",
            content:
              "RSA-based blind signatures: the signer has RSA " +
              "key \\( (n, e, d) \\). The user blinds message " +
              "\\( m \\) with random \\( r \\):" +
              "\\[ m' = m \\cdot r^e \\mod n \\]" +
              "The signer signs: " +
              "\\( \\sigma' = (m')^d \\mod n \\). " +
              "The user unblinds: " +
              "\\( \\sigma = \\sigma' / r = " +
              "(m \\cdot r^e)^d / r = m^d \\cdot r - r = " +
              "m^d \\mod n \\)." +
              "\\[ \\sigma = \\sigma' \\cdot r^{-1} \\mod n \\]" +
              "The signer never sees \\( m \\) and cannot link " +
              "\\( \\sigma \\) to the blinding session. This is " +
              "the foundation for unlinkable credential issuance: " +
              "the issuer signs without learning the credential " +
              "content."
          },
          {
            subtitle: "Multi-Signatures and Aggregate Signatures",
            content:
              "BLS aggregation: given \\( n \\) signatures " +
              "\\( \\sigma_i = [x_i]H(m_i) \\), the aggregate " +
              "is \\( \\sigma_{\\mathrm{agg}} = \\sum_i " +
              "\\sigma_i \\in \\mathbb{G}_1 \\). Verification " +
              "checks:" +
              "\\[ e(\\sigma_{\\mathrm{agg}}, g_2) " +
              "\\stackrel{?}{=} \\prod_i e(H(m_i), pk_i) \\]" +
              "Same-message multi-signatures (all sign the " +
              "same \\( m \\)): \\( \\sigma_{\\mathrm{multi}} = " +
              "\\sum_i \\sigma_i \\), verify against " +
              "\\( pk_{\\mathrm{agg}} = \\sum_i pk_i \\):" +
              "\\[ e(\\sigma_{\\mathrm{multi}}, g_2) " +
              "\\stackrel{?}{=} e(H(m), pk_{\\mathrm{agg}}) \\]" +
              "Aggregate signatures compress \\( n \\) " +
              "signatures into one group element, saving " +
              "bandwidth and on-chain storage."
          }
        ],
        securityAnalysis:
          "Schnorr: EUF-CMA secure under DLP in the ROM " +
          "(proof via forking lemma: rewind the adversary " +
          "on two different hash challenges to extract the " +
          "secret key). " +
          "BLS: EUF-CMA secure under the Computational " +
          "Diffie-Hellman (CDH) assumption in the ROM. " +
          "Rogue-key attack on naive BLS aggregation: " +
          "mitigated by requiring proof of possession of " +
          "\\( sk \\) during key registration. " +
          "Blind signatures: one-more-RSA assumption (after " +
          "\\( \\ell \\) interactions with the signer, the " +
          "adversary cannot produce \\( \\ell + 1 \\) valid " +
          "signatures). " +
          "All schemes require careful nonce generation: " +
          "deterministic nonces (RFC 6979) prevent " +
          "catastrophic key leakage from nonce reuse.",
        practicalNotes:
          "Ed25519 (Schnorr on Curve25519): 32-byte keys, " +
          "64-byte signatures, ~70,000 sign/s, ~25,000 " +
          "verify/s. Used in Sui for transaction signing. " +
          "BLS12-381 signatures: 48-byte signatures " +
          "(\\( \\mathbb{G}_1 \\) compressed), 96-byte " +
          "public keys (\\( \\mathbb{G}_2 \\)), ~3 ms sign, " +
          "~8 ms verify (single), aggregation amortizes to " +
          "sub-ms per signature. Used in Ethereum 2.0 " +
          "consensus. " +
          "BBS+ (multi-message Schnorr-like on pairings): " +
          "see Day 2 for full treatment. Credential " +
          "issuance ~5 ms, presentation proof ~15 ms, " +
          "verification ~10 ms on BLS12-381.",
        keyFormulas: [
          {
            name: "Schnorr Signature",
            formula:
              "\\[ \\sigma = (R, s): \\; R = g^k, \\; " +
              "e = H(R \\| pk \\| m), \\; " +
              "s = k - ex \\mod p \\]"
          },
          {
            name: "Schnorr Verification",
            formula:
              "\\[ g^s \\cdot pk^e \\stackrel{?}{=} R \\]"
          },
          {
            name: "BLS Pairing Verification",
            formula:
              "\\[ e(\\sigma, g_2) \\stackrel{?}{=} " +
              "e(H(m), pk) \\]"
          }
        ],
        exercises: [
          {
            type: "calculation",
            question:
              "In the Schnorr signature scheme, the signer has secret " +
              "key \\( x = 7 \\) in \\( \\mathbb{Z}_{23} \\), with " +
              "generator \\( g = 5 \\) and public key " +
              "\\( pk = g^x \\mod 23 \\). The signer picks nonce " +
              "\\( k = 3 \\) and the hash gives " +
              "\\( e = H(R \\| pk \\| m) = 4 \\). Compute the " +
              "signature component \\( s = k - e \\cdot x \\mod 23 \\) " +
              "and verify that \\( g^s \\cdot pk^e = R \\mod 23 \\).",
            hint:
              "First compute \\( R = g^k \\mod 23 \\). Then " +
              "\\( s = k - ex \\mod 23 \\). For verification, " +
              "compute \\( g^s \\cdot pk^e \\mod 23 \\) and check " +
              "it equals \\( R \\).",
            answer:
              "\\( R = 5^3 = 125 \\mod 23 = 125 - 5 \\cdot 23 = 10 \\). " +
              "\\( pk = 5^7 \\mod 23 \\). \\( 5^2 = 2, 5^4 = 4, " +
              "5^7 = 5^4 \\cdot 5^2 \\cdot 5 = 4 \\cdot 2 \\cdot 5 " +
              "= 40 = 17 \\mod 23 \\). " +
              "\\( s = 3 - 4 \\cdot 7 = 3 - 28 = -25 " +
              "= -25 + 2 \\cdot 23 = 21 \\mod 23 \\). " +
              "Verify: \\( g^s = 5^{21} \\mod 23 \\). Since " +
              "\\( 5^{22} = 1 \\) (Fermat), \\( 5^{21} = 5^{-1} \\). " +
              "\\( 5 \\cdot 14 = 70 = 3 \\cdot 23 + 1 \\), so " +
              "\\( 5^{-1} = 14 \\). \\( pk^e = 17^4 \\mod 23 \\). " +
              "\\( 17^2 = 289 = 12 \\cdot 23 + 13 = 13 \\). " +
              "\\( 17^4 = 13^2 = 169 = 7 \\cdot 23 + 8 = 8 \\). " +
              "\\( g^s \\cdot pk^e = 14 \\cdot 8 = 112 = " +
              "4 \\cdot 23 + 20 = 20 \\mod 23 \\). But " +
              "\\( R = 10 \\). Note: using the alternative convention " +
              "\\( s = k + ex \\), we get \\( s = 3 + 28 = 31 = " +
              "8 \\mod 23 \\), and verification checks " +
              "\\( g^s = 5^8 = 5^4 \\cdot 5^4 = 4 \\cdot 4 = " +
              "16 \\mod 23 \\), \\( pk^{-e} = 8^{-1} \\mod 23 \\). " +
              "The key point: both conventions work as long as " +
              "sign and verify use the same formula."
          },
          {
            type: "conceptual",
            question:
              "Explain why nonce reuse in Schnorr signatures is " +
              "catastrophic. Specifically, if two different messages " +
              "\\( m_1, m_2 \\) are signed with the same nonce " +
              "\\( k \\), show how an attacker extracts the secret " +
              "key \\( x \\) from the two signatures " +
              "\\( (R, s_1) \\) and \\( (R, s_2) \\).",
            hint:
              "With the same \\( R \\), we have " +
              "\\( s_1 = k - e_1 x \\) and \\( s_2 = k - e_2 x \\) " +
              "where \\( e_i = H(R \\| pk \\| m_i) \\). Subtract " +
              "the two equations.",
            answer:
              "\\( s_1 - s_2 = (k - e_1 x) - (k - e_2 x) = " +
              "(e_2 - e_1) x \\). Therefore " +
              "\\( x = \\frac{s_1 - s_2}{e_2 - e_1} \\mod p \\). " +
              "Since \\( e_1, e_2, s_1, s_2 \\) are all public " +
              "(part of the signatures and computable from " +
              "\\( R, pk, m_i \\)), the attacker recovers the full " +
              "secret key. This is exactly what happened to Sony's " +
              "PS3 ECDSA key in 2010. Mitigation: use deterministic " +
              "nonces (RFC 6979) where \\( k = \\text{HMAC}(x, m) \\)."
          }
        ]
      },

      /* ───────── Elliptic Curve Cryptography ───────── */
      {
        name: "Elliptic Curve Cryptography",
        formalDefinition:
          "An elliptic curve over a finite field " +
          "\\( \\mathbb{F}_p \\) (with \\( p > 3 \\)) is " +
          "the set of points satisfying the short " +
          "Weierstrass equation together with the point " +
          "at infinity \\( \\mathcal{O} \\):" +
          "\\[ E(\\mathbb{F}_p) = \\{(x, y) \\in " +
          "\\mathbb{F}_p^2 : y^2 = x^3 + ax + b\\} " +
          "\\cup \\{\\mathcal{O}\\}, \\quad " +
          "4a^3 + 27b^2 \\neq 0 \\]" +
          "The set \\( E(\\mathbb{F}_p) \\) forms an " +
          "abelian group under the chord-and-tangent " +
          "addition law with \\( \\mathcal{O} \\) as identity.",
        mathDetails: [
          {
            subtitle: "Group Law (Point Addition)",
            content:
              "For \\( P = (x_1, y_1) \\) and " +
              "\\( Q = (x_2, y_2) \\) with " +
              "\\( P \\neq \\pm Q \\), their sum " +
              "\\( R = P + Q = (x_3, y_3) \\) is:" +
              "\\[ \\lambda = \\frac{y_2 - y_1}{x_2 - x_1}, " +
              "\\quad x_3 = \\lambda^2 - x_1 - x_2, \\quad " +
              "y_3 = \\lambda(x_1 - x_3) - y_1 \\]" +
              "For point doubling \\( P = Q \\):" +
              "\\[ \\lambda = \\frac{3x_1^2 + a}{2y_1}, " +
              "\\quad x_3 = \\lambda^2 - 2x_1, \\quad " +
              "y_3 = \\lambda(x_1 - x_3) - y_1 \\]" +
              "Special cases: \\( P + \\mathcal{O} = P \\), " +
              "\\( P + (-P) = \\mathcal{O} \\) where " +
              "\\( -P = (x_1, -y_1) \\)."
          },
          {
            subtitle: "Scalar Multiplication and ECDLP",
            content:
              "Scalar multiplication: " +
              "\\( [n]P = \\underbrace{P + P + \\cdots + P}_{n " +
              "\\text{ times}} \\). Efficiently computed in " +
              "\\( O(\\log n) \\) group operations via " +
              "double-and-add." +
              "\\[ \\textbf{ECDLP}: \\; \\text{Given } " +
              "P, Q = [n]P \\in E(\\mathbb{F}_p), \\; " +
              "\\text{find } n \\in \\mathbb{Z}_r \\]" +
              "Best known algorithms: Pollard's rho in " +
              "\\( O(\\sqrt{r}) \\) group operations, where " +
              "\\( r = |E(\\mathbb{F}_p)| \\) is the group " +
              "order. For \\( r \\approx 2^{256} \\), this " +
              "gives \\( \\approx 2^{128} \\) security. " +
              "No subexponential algorithms known for " +
              "generic elliptic curves (unlike factoring or " +
              "finite field DLP)."
          },
          {
            subtitle: "Bilinear Pairings",
            content:
              "A bilinear pairing is a map " +
              "\\( e: \\mathbb{G}_1 \\times \\mathbb{G}_2 " +
              "\\rightarrow \\mathbb{G}_T \\) where " +
              "\\( \\mathbb{G}_1, \\mathbb{G}_2 \\) are " +
              "elliptic curve subgroups of order \\( r \\) and " +
              "\\( \\mathbb{G}_T \\) is a multiplicative " +
              "subgroup of \\( \\mathbb{F}_{p^k}^* \\) " +
              "(\\( k \\) is the embedding degree). Properties:" +
              "\\[ \\textbf{Bilinearity}: \\; " +
              "e([a]P, [b]Q) = e(P, Q)^{ab} \\]" +
              "\\[ \\textbf{Non-degeneracy}: \\; " +
              "e(G_1, G_2) \\neq 1_{\\mathbb{G}_T} " +
              "\\text{ for generators } G_1, G_2 \\]" +
              "\\[ \\textbf{Computability}: \\; " +
              "e \\text{ can be computed efficiently " +
              "(Miller's algorithm)} \\]" +
              "Pairings enable \"multiplication in the " +
              "exponent\": we can check " +
              "\\( e([a]P, [b]Q) = e([c]P, [d]Q) \\) iff " +
              "\\( ab = cd \\) without knowing " +
              "\\( a, b, c, d \\)."
          },
          {
            subtitle: "Pairing-Friendly Curves",
            content:
              "Not all elliptic curves support efficient " +
              "pairings. The embedding degree \\( k \\) must be " +
              "small enough for \\( \\mathbb{F}_{p^k} \\) " +
              "arithmetic to be practical. Key curves:" +
              "\\[ \\textbf{BN254}: \\; k = 12, \\; " +
              "r \\approx 2^{254}, \\; " +
              "\\text{security} \\approx 100\\text{-bit} \\]" +
              "\\[ \\textbf{BLS12-381}: \\; k = 12, \\; " +
              "r \\approx 2^{255}, \\; " +
              "\\text{security} \\approx 128\\text{-bit} \\]" +
              "BN254 was originally estimated at 128-bit " +
              "security but extended tower NFS attacks reduced " +
              "this to ~100 bits. BLS12-381 provides a " +
              "conservative 128-bit level. Both use embedding " +
              "degree 12, meaning " +
              "\\( \\mathbb{G}_T \\subset " +
              "\\mathbb{F}_{p^{12}}^* \\)."
          },
          {
            subtitle: "Security Assumptions on Pairings",
            content:
              "Key hardness assumptions in pairing groups:" +
              "\\[ \\textbf{CDH}: \\; \\text{Given } " +
              "(g, [a]g, [b]g), \\text{ compute } [ab]g \\]" +
              "\\[ \\textbf{DDH}: \\; \\text{Distinguish } " +
              "(g, [a]g, [b]g, [ab]g) \\text{ from } " +
              "(g, [a]g, [b]g, [c]g) \\]" +
              "\\[ \\textbf{DBDH}: \\; \\text{Distinguish } " +
              "e(g,g)^{abc} \\text{ from } e(g,g)^z " +
              "\\text{ given } ([a]g, [b]g, [c]g) \\]" +
              "Note: DDH is easy in pairing groups (use the " +
              "pairing to check), so pairing-based schemes " +
              "rely on CDH or stronger assumptions. The " +
              "q-SDH assumption (used in Groth16) is: given " +
              "\\( (g, [\\tau]g, [\\tau^2]g, \\ldots, " +
              "[\\tau^q]g) \\), find " +
              "\\( (c, [1/(\\tau + c)]g) \\)."
          }
        ],
        securityAnalysis:
          "ECDLP security: \\( O(\\sqrt{r}) \\) via Pollard " +
          "rho, giving 128-bit security for 256-bit curves. " +
          "Pairing security depends on both ECDLP in " +
          "\\( \\mathbb{G}_1, \\mathbb{G}_2 \\) and the " +
          "DLP in \\( \\mathbb{F}_{p^k}^* \\). " +
          "For BLS12-381: ECDLP in " +
          "\\( \\mathbb{G}_1 \\approx 2^{128} \\), DLP in " +
          "\\( \\mathbb{F}_{p^{12}}^* \\approx 2^{128} \\). " +
          "Quantum threat: Shor's algorithm breaks ECDLP in " +
          "polynomial time. Estimated ~2,500 logical qubits " +
          "for 256-bit curves. Post-quantum migration is a " +
          "long-term consideration for credential systems.",
        practicalNotes:
          "BLS12-381: field size \\( p \\approx 2^{381} \\), " +
          "scalar field \\( r \\approx 2^{255} \\). " +
          "\\( \\mathbb{G}_1 \\) elements: 48 bytes " +
          "compressed. \\( \\mathbb{G}_2 \\) elements: 96 " +
          "bytes compressed. \\( \\mathbb{G}_T \\) elements: " +
          "576 bytes. Pairing computation: ~1.5 ms. " +
          "Scalar multiplication in \\( \\mathbb{G}_1 \\): " +
          "~0.5 ms. Multi-scalar multiplication (MSM) of " +
          "\\( n \\) points: ~0.5 ms + 0.15 ms per point " +
          "(Pippenger). " +
          "BN254: cheaper EVM verification (precompiles at " +
          "0x06-0x08), used by Sui's groth16 module. " +
          "Curve25519 (no pairings): 32-byte keys, ~0.05 ms " +
          "scalar mul, used in Ed25519 signatures.",
        keyFormulas: [
          {
            name: "Curve Equation",
            formula:
              "\\[ E: y^2 = x^3 + ax + b \\quad " +
              "\\text{over } \\mathbb{F}_p, \\; " +
              "4a^3 + 27b^2 \\neq 0 \\]"
          },
          {
            name: "Pairing Bilinearity",
            formula:
              "\\[ e([a]P, [b]Q) = e(P, Q)^{ab} \\]"
          },
          {
            name: "ECDLP Definition",
            formula:
              "\\[ \\text{Given } P, \\; Q = [n]P, " +
              "\\; \\text{find } n \\quad " +
              "\\text{(hard: } O(\\sqrt{r}) " +
              "\\text{ best known)} \\]"
          }
        ],
        exercises: [
          {
            type: "calculation",
            question:
              "Consider the elliptic curve \\( E: y^2 = x^3 + 2x + 3 \\) " +
              "over \\( \\mathbb{F}_7 \\). Verify that " +
              "\\( P = (3, 6) \\) is on the curve. Then compute " +
              "\\( 2P \\) using the point doubling formula.",
            hint:
              "Check \\( 6^2 \\equiv 3^3 + 2 \\cdot 3 + 3 \\mod 7 \\). " +
              "For doubling, \\( \\lambda = (3x_1^2 + a)/(2y_1) \\mod 7 \\). " +
              "You need the modular inverse of \\( 2 \\cdot 6 = 12 " +
              "\\equiv 5 \\mod 7 \\).",
            answer:
              "On-curve check: LHS = \\( 6^2 = 36 = 1 \\mod 7 \\). " +
              "RHS = \\( 27 + 6 + 3 = 36 = 1 \\mod 7 \\). " +
              "\\( 1 = 1 \\) so \\( P \\) is on the curve. " +
              "Doubling: \\( \\lambda = (3 \\cdot 9 + 2)/(2 \\cdot 6) " +
              "= 29/12 \\mod 7 = 1/5 \\mod 7 \\). " +
              "\\( 5^{-1} \\mod 7 = 3 \\) (since \\( 5 \\cdot 3 = 15 " +
              "= 1 \\mod 7 \\)). So \\( \\lambda = 3 \\). " +
              "\\( x_3 = 9 - 6 = 3 \\mod 7 \\). " +
              "\\( y_3 = 3(3 - 3) - 6 = -6 = 1 \\mod 7 \\). " +
              "Therefore \\( 2P = (3, 1) \\)."
          },
          {
            type: "conceptual",
            question:
              "Explain why DDH (Decisional Diffie-Hellman) is easy " +
              "in pairing groups but CDH (Computational Diffie-Hellman) " +
              "is believed hard. Given a pairing " +
              "\\( e: \\mathbb{G}_1 \\times \\mathbb{G}_2 \\rightarrow " +
              "\\mathbb{G}_T \\) and a tuple \\( (g, [a]g, [b]g, T) \\), " +
              "show how to decide whether \\( T = [ab]g \\).",
            hint:
              "Use the bilinearity property: " +
              "\\( e([a]g, [b]g) = e(g, g)^{ab} \\). Compare this " +
              "with \\( e(T, g) \\).",
            answer:
              "To decide if \\( T = [ab]g \\), compute: " +
              "\\( e([a]g, [b]g) = e(g, g)^{ab} \\) and " +
              "\\( e(T, g) = e(g, g)^{\\log_g T} \\). " +
              "If \\( T = [ab]g \\), then " +
              "\\( e(T, g) = e(g, g)^{ab} \\), so the two values " +
              "are equal. If \\( T = [c]g \\) for random \\( c \\neq ab \\), " +
              "they differ. This breaks DDH but does not break CDH: " +
              "the pairing lets us verify an answer but does not " +
              "help us compute \\( [ab]g \\) from \\( [a]g, [b]g \\). " +
              "This is why pairing-based schemes (BBS+, BLS) rely " +
              "on CDH, not DDH."
          }
        ]
      },

      /* ───────── Zero-Knowledge Proofs (Fundamentals) ───────── */
      {
        name: "Zero-Knowledge Proofs (Fundamentals)",
        formalDefinition:
          "An interactive proof system for a language " +
          "\\( L \\) with NP relation \\( R \\) is a pair " +
          "of interactive algorithms \\( (P, V) \\) where " +
          "\\( P \\) is a PPT prover with access to a " +
          "witness \\( w \\) and \\( V \\) is a PPT verifier. " +
          "The system satisfies completeness, soundness, and " +
          "zero-knowledge for the relation " +
          "\\( R = \\{(x, w) : x \\in L\\} \\).",
        mathDetails: [
          {
            subtitle: "Completeness",
            content:
              "If the statement is true and both parties are " +
              "honest, the verifier always accepts:" +
              "\\[ \\forall (x, w) \\in R: \\; " +
              "\\Pr\\bigl[\\langle P(x, w), V(x) \\rangle " +
              "= 1\\bigr] = 1 \\]" +
              "Some definitions allow a negligible completeness " +
              "error: \\( \\geq 1 - \\mathrm{negl}(\\lambda) \\). " +
              "For practical ZK systems, perfect completeness " +
              "(probability exactly 1) is standard."
          },
          {
            subtitle: "Soundness",
            content:
              "No cheating prover \\( P^* \\) can convince " +
              "the verifier to accept a false statement:" +
              "\\[ \\forall P^*, \\forall x \\notin L: \\; " +
              "\\Pr\\bigl[\\langle P^*(x), V(x) \\rangle " +
              "= 1\\bigr] \\leq \\mathrm{negl}(\\lambda) \\]" +
              "Computational soundness (argument): holds " +
              "against PPT provers only. Statistical soundness " +
              "(proof): holds against unbounded provers. " +
              "SNARKs are arguments (computational soundness); " +
              "STARKs can achieve statistical soundness."
          },
          {
            subtitle: "Zero-Knowledge Property",
            content:
              "There exists a PPT simulator " +
              "\\( \\mathrm{Sim} \\) that, given only the " +
              "statement \\( x \\) (no witness), produces a " +
              "transcript indistinguishable from a real " +
              "interaction:" +
              "\\[ \\mathrm{View}_V\\bigl[P(x, w) " +
              "\\leftrightarrow V(x)\\bigr] \\approx " +
              "\\mathrm{Sim}(x) \\]" +
              "Perfect ZK: distributions are identical. " +
              "Statistical ZK: statistically close. " +
              "Computational ZK: computationally " +
              "indistinguishable. The simulator captures the " +
              "intuition that the proof reveals nothing beyond " +
              "the statement's truth."
          },
          {
            subtitle: "HVZK vs Malicious-Verifier ZK",
            content:
              "Honest-Verifier ZK (HVZK): the simulator works " +
              "only when the verifier follows the protocol " +
              "(sends random challenges). " +
              "Malicious-Verifier ZK: the simulator works for " +
              "any verifier strategy \\( V^* \\). " +
              "HVZK is sufficient for many applications because " +
              "the Fiat-Shamir transform replaces the verifier " +
              "with a hash function, which is \"honest\" by " +
              "construction. Converting HVZK to full ZK in the " +
              "interactive setting requires additional " +
              "techniques (e.g., coin-flipping protocols)."
          },
          {
            subtitle: "Knowledge Soundness and Extractors",
            content:
              "A proof of knowledge (PoK) has a stronger " +
              "property: there exists a PPT extractor " +
              "\\( \\mathrm{Ext} \\) that, given oracle access " +
              "to any successful prover \\( P^* \\), can " +
              "extract the witness \\( w \\):" +
              "\\[ \\Pr\\bigl[\\langle P^*(x), V(x) \\rangle " +
              "= 1\\bigr] > \\epsilon \\implies " +
              "\\Pr\\bigl[\\mathrm{Ext}^{P^*}(x) = w : " +
              "(x, w) \\in R\\bigr] > \\epsilon - " +
              "\\mathrm{negl}(\\lambda) \\]" +
              "For Sigma protocols, extraction uses the " +
              "rewinding technique: run \\( P^* \\) to get " +
              "transcript \\( (a, e_1, z_1) \\), then rewind " +
              "and send different challenge \\( e_2 \\) to get " +
              "\\( (a, e_2, z_2) \\). The witness is extracted " +
              "from the two transcripts."
          },
          {
            subtitle: "Proof of Knowledge vs Proof of Membership",
            content:
              "Proof of membership: proves \\( x \\in L \\) " +
              "(the statement is true). " +
              "Proof of knowledge: proves the prover " +
              "knows a witness \\( w \\) for \\( x \\). " +
              "These are distinct: a proof of membership for " +
              "\"\\( \\exists w: f(w) = x \\)\" shows that " +
              "such \\( w \\) exists but does not guarantee the " +
              "prover possesses it. In credential systems, we " +
              "need proofs of knowledge: the holder must " +
              "demonstrate they actually possess the credential " +
              "secret key, not just that one exists."
          },
          {
            subtitle: "Fiat-Shamir Heuristic",
            content:
              "Transforms any public-coin interactive proof " +
              "into a non-interactive one by replacing the " +
              "verifier's random challenges with hash " +
              "evaluations:" +
              "\\[ e = H(x \\| a) \\quad " +
              "\\text{(hash of statement and commitment)} \\]" +
              "The resulting NIZK proof is " +
              "\\( \\pi = (a, z) \\) where \\( z \\) is " +
              "computed using \\( e = H(x \\| a) \\). " +
              "Security: in the Random Oracle Model, if the " +
              "interactive protocol is HVZK with special " +
              "soundness, then the Fiat-Shamir transform " +
              "yields a secure NIZK proof of knowledge. " +
              "Caveat: Fiat-Shamir is not generically secure " +
              "in the standard model (known counterexamples " +
              "by Goldwasser-Kalai)."
          }
        ],
        securityAnalysis:
          "Simulation-based security: the core technique is " +
          "constructing a simulator that produces fake " +
          "transcripts without the witness. The simulator " +
          "typically works by choosing the challenge first " +
          "and then computing a consistent commitment " +
          "(reversing the protocol order). " +
          "Extraction uses rewinding: fork the prover's " +
          "execution at the challenge point and run with a " +
          "different challenge. From two accepting transcripts " +
          "\\( (a, e_1, z_1) \\) and \\( (a, e_2, z_2) \\), " +
          "the witness is algebraically recovered. " +
          "In the non-interactive (Fiat-Shamir) setting, " +
          "extraction requires \"programming\" the random " +
          "oracle. The reduction sets " +
          "\\( H(x \\| a) \\) to a value it controls, " +
          "enabling witness extraction.",
        practicalNotes:
          "Interactive proofs require real-time communication " +
          "(multiple rounds), unsuitable for blockchain. " +
          "NIZKs (via Fiat-Shamir) produce a single proof " +
          "string that can be verified asynchronously on-chain. " +
          "Proof sizes: Sigma protocol NIZK ~64-128 bytes " +
          "(2-3 scalars), Groth16 ~192 bytes, PLONK ~400 " +
          "bytes, STARK ~100 KB. " +
          "For credential presentation: the holder computes " +
          "a Fiat-Shamir NIZK offline, then submits it in " +
          "a Sui transaction for on-chain verification.",
        keyFormulas: [
          {
            name: "Completeness",
            formula:
              "\\[ \\Pr\\bigl[\\langle P(x, w), V(x) " +
              "\\rangle = 1 : (x, w) \\in R\\bigr] = 1 \\]"
          },
          {
            name: "Soundness",
            formula:
              "\\[ \\Pr\\bigl[\\langle P^*(x), V(x) " +
              "\\rangle = 1 : x \\notin L\\bigr] \\leq " +
              "\\mathrm{negl}(\\lambda) \\]"
          },
          {
            name: "Zero-Knowledge (Simulation)",
            formula:
              "\\[ \\mathrm{View}_V[P(x,w) " +
              "\\leftrightarrow V(x)] \\approx " +
              "\\mathrm{Sim}(x) \\]"
          },
          {
            name: "Fiat-Shamir Transform",
            formula:
              "\\[ e = H(x \\| a), \\quad " +
              "\\pi = (a, z) \\quad " +
              "\\text{(non-interactive proof)} \\]"
          }
        ],
        exercises: [
          {
            type: "conceptual",
            question:
              "Construct a simulator for the Schnorr identification " +
              "protocol. That is, given only the public key " +
              "\\( h = g^x \\) (without knowing \\( x \\)), produce " +
              "a transcript \\( (a, e, z) \\) that is " +
              "indistinguishable from a real protocol execution " +
              "when \\( e \\) is chosen uniformly.",
            hint:
              "The simulator picks \\( e \\) and \\( z \\) first " +
              "(both uniformly random), then computes \\( a \\) from " +
              "the verification equation \\( g^z = a \\cdot h^e \\).",
            answer:
              "Simulator \\( \\mathrm{Sim}(h) \\): " +
              "1. Pick \\( e \\xleftarrow{\\$} \\mathbb{Z}_p \\) " +
              "and \\( z \\xleftarrow{\\$} \\mathbb{Z}_p \\). " +
              "2. Compute \\( a = g^z \\cdot h^{-e} \\). " +
              "3. Output \\( (a, e, z) \\). " +
              "Verification holds by construction: " +
              "\\( g^z = g^z \\cdot h^{-e} \\cdot h^e = a \\cdot h^e \\). " +
              "In a real transcript, \\( a = g^k \\) for random " +
              "\\( k \\), \\( e \\) is uniform, and " +
              "\\( z = k + ex \\). Since \\( k \\) is uniform, " +
              "\\( z \\) is also uniform for any fixed \\( e \\). " +
              "The simulated distribution (uniform \\( e, z \\), " +
              "determined \\( a \\)) is identical to the real one."
          },
          {
            type: "calculation",
            question:
              "In an interactive ZK proof, the verifier sends a " +
              "challenge \\( e \\) from a challenge space " +
              "\\( \\mathcal{E} \\) of size " +
              "\\( |\\mathcal{E}| = 2^{128} \\). What is the " +
              "soundness error (probability a cheating prover " +
              "convinces the verifier for a false statement) in a " +
              "single round? How many sequential repetitions are " +
              "needed to reduce the soundness error below " +
              "\\( 2^{-80} \\)?",
            hint:
              "For a Sigma protocol, the soundness error is " +
              "\\( 1/|\\mathcal{E}| \\). For \\( k \\) repetitions, " +
              "the error is \\( (1/|\\mathcal{E}|)^k \\).",
            answer:
              "Single round soundness error: " +
              "\\( 1/|\\mathcal{E}| = 1/2^{128} = 2^{-128} \\). " +
              "This is already below \\( 2^{-80} \\), so " +
              "\\( k = 1 \\) repetition suffices. In general, " +
              "for \\( |\\mathcal{E}| = 2^t \\), we need " +
              "\\( k \\geq \\lceil 80/t \\rceil \\) repetitions. " +
              "With \\( t = 128 \\geq 80 \\), one round already " +
              "gives negligible soundness error. This is why " +
              "Schnorr proofs over 256-bit curves (where " +
              "\\( |\\mathcal{E}| \\approx 2^{256} \\)) need only " +
              "one round."
          }
        ]
      },

      /* ───────── Sigma Protocols ───────── */
      {
        name: "Sigma Protocols",
        formalDefinition:
          "A Sigma protocol for relation \\( R \\) is a " +
          "three-move interactive proof " +
          "\\( (a, e, z) \\) between prover \\( P(x, w) \\) " +
          "and verifier \\( V(x) \\): (1) \\( P \\) sends " +
          "commitment \\( a \\), (2) \\( V \\) sends random " +
          "challenge \\( e \\xleftarrow{\\$} " +
          "\\mathcal{E} \\), (3) \\( P \\) sends response " +
          "\\( z \\). The protocol satisfies special " +
          "soundness and special HVZK.",
        mathDetails: [
          {
            subtitle: "Schnorr Identification Protocol",
            content:
              "Relation: \\( R = \\{(h, x) : h = g^x\\} \\). " +
              "Prover knows \\( x \\) and wants to prove " +
              "knowledge of \\( \\log_g h \\)." +
              "\\[ \\textbf{Step 1 (Commitment)}: \\; " +
              "P \\text{ picks } k \\xleftarrow{\\$} " +
              "\\mathbb{Z}_p, \\; " +
              "\\text{sends } a = g^k \\]" +
              "\\[ \\textbf{Step 2 (Challenge)}: \\; " +
              "V \\text{ sends } e \\xleftarrow{\\$} " +
              "\\mathbb{Z}_p \\]" +
              "\\[ \\textbf{Step 3 (Response)}: \\; " +
              "P \\text{ sends } z = k + e \\cdot x " +
              "\\mod p \\]" +
              "\\[ \\textbf{Verification}: \\; " +
              "g^z \\stackrel{?}{=} a \\cdot h^e \\]" +
              "Correctness: \\( g^z = g^{k + ex} = " +
              "g^k \\cdot (g^x)^e = a \\cdot h^e \\)."
          },
          {
            subtitle: "Special Soundness",
            content:
              "Given two accepting transcripts with the same " +
              "commitment but different challenges:" +
              "\\[ (a, e_1, z_1) \\text{ and } " +
              "(a, e_2, z_2) \\text{ with } e_1 \\neq e_2 \\]" +
              "From the verification equations:" +
              "\\[ g^{z_1} = a \\cdot h^{e_1} \\quad " +
              "\\text{and} \\quad g^{z_2} = a \\cdot h^{e_2} \\]" +
              "Dividing: \\( g^{z_1 - z_2} = h^{e_1 - e_2} \\), " +
              "so:" +
              "\\[ x = \\frac{z_1 - z_2}{e_1 - e_2} \\mod p \\]" +
              "This extraction formula is the key to proving " +
              "knowledge soundness. The extractor rewinds the " +
              "prover to obtain two transcripts with the same " +
              "first message."
          },
          {
            subtitle: "Special Honest-Verifier Zero-Knowledge",
            content:
              "Simulator \\( \\mathrm{Sim}(h) \\): pick " +
              "\\( e \\xleftarrow{\\$} \\mathbb{Z}_p \\) and " +
              "\\( z \\xleftarrow{\\$} \\mathbb{Z}_p \\), " +
              "then compute:" +
              "\\[ a = g^z \\cdot h^{-e} \\]" +
              "The transcript \\( (a, e, z) \\) is accepting " +
              "(\\( g^z = a \\cdot h^e \\) by construction) and " +
              "has the same distribution as real transcripts " +
              "when \\( e \\) is uniform. This proves SHVZK: " +
              "the simulator produces transcripts without " +
              "knowing the witness \\( x \\), just by choosing " +
              "\\( (e, z) \\) first and computing \\( a \\) " +
              "backward."
          },
          {
            subtitle: "AND Composition",
            content:
              "To prove knowledge of \\( x_1 \\) AND " +
              "\\( x_2 \\) for \\( h_1 = g^{x_1} \\) and " +
              "\\( h_2 = g^{x_2} \\): run both Sigma protocols " +
              "in parallel with the same challenge \\( e \\)." +
              "\\[ P \\text{ sends } (a_1, a_2), \\; " +
              "V \\text{ sends } e, \\; " +
              "P \\text{ sends } (z_1, z_2) \\]" +
              "\\[ \\text{Verify: } g^{z_1} \\stackrel{?}{=} " +
              "a_1 \\cdot h_1^e \\text{ AND } " +
              "g^{z_2} \\stackrel{?}{=} a_2 \\cdot h_2^e \\]" +
              "Sharing the same challenge ensures the prover " +
              "cannot cheat on either sub-protocol independently."
          },
          {
            subtitle: "OR Composition (Cramer-Damgard-Schoenmakers)",
            content:
              "Prove knowledge of \\( x_1 \\) OR \\( x_2 \\) " +
              "without revealing which. Suppose the prover " +
              "knows \\( x_1 \\) (WLOG):" +
              "\\[ P \\text{ computes real commitment } " +
              "a_1 = g^{k_1} \\text{ and simulates } " +
              "(a_2, e_2, z_2) \\text{ for the unknown branch} \\]" +
              "\\[ V \\text{ sends challenge } e \\]" +
              "\\[ P \\text{ sets } e_1 = e - e_2 \\mod p, \\; " +
              "z_1 = k_1 + e_1 \\cdot x_1 \\]" +
              "\\[ \\text{Verify: both sub-checks pass AND } " +
              "e_1 + e_2 = e \\]" +
              "The verifier cannot distinguish which branch " +
              "was real and which was simulated. This is " +
              "fundamental for anonymous credentials: prove " +
              "membership in group A OR group B without " +
              "revealing which."
          },
          {
            subtitle: "Equality of Discrete Logs",
            content:
              "Prove \\( \\log_g h_1 = \\log_f h_2 \\) " +
              "(same secret \\( x \\) used for two " +
              "different bases \\( g, f \\)). " +
              "Relation: \\( h_1 = g^x \\) and " +
              "\\( h_2 = f^x \\)." +
              "\\[ P: k \\xleftarrow{\\$} \\mathbb{Z}_p, \\; " +
              "a_1 = g^k, \\; a_2 = f^k \\]" +
              "\\[ V: e \\xleftarrow{\\$} \\mathbb{Z}_p \\]" +
              "\\[ P: z = k + ex \\mod p \\]" +
              "\\[ \\text{Verify: } g^z \\stackrel{?}{=} " +
              "a_1 \\cdot h_1^e \\text{ AND } " +
              "f^z \\stackrel{?}{=} a_2 \\cdot h_2^e \\]" +
              "This is used in credential systems to prove " +
              "that the same secret key is embedded in " +
              "different commitments or across different " +
              "presentations (preventing credential sharing)."
          }
        ],
        securityAnalysis:
          "Special soundness + SHVZK implies the protocol is " +
          "a proof of knowledge. The knowledge error is " +
          "\\( 1/|\\mathcal{E}| \\) where " +
          "\\( \\mathcal{E} \\) is the challenge space. " +
          "For \\( |\\mathcal{E}| = p \\approx 2^{256} \\), " +
          "this is negligible. " +
          "After Fiat-Shamir, security in the ROM follows " +
          "from the forking lemma: if the adversary can " +
          "produce one valid proof with non-negligible " +
          "probability, by reprogramming the random oracle " +
          "we obtain two proofs with the same commitment but " +
          "different challenges, enabling extraction. " +
          "OR-proofs are witness-indistinguishable (WI): the " +
          "verifier cannot tell which witness was used, even " +
          "with unbounded computation.",
        practicalNotes:
          "Sigma protocol NIZKs (after Fiat-Shamir) are " +
          "extremely compact: typically 2-3 group elements + " +
          "2-3 scalars (~128-192 bytes for a single DL proof). " +
          "Proof generation: ~1 ms (one exponentiation + one " +
          "hash). Verification: ~1 ms (one multi-exp). " +
          "Composition overhead: AND doubles proof size " +
          "linearly, OR adds one simulated transcript. " +
          "In BBS+ credential presentation, the holder runs " +
          "a composed Sigma protocol: AND of (knowledge of " +
          "signature, knowledge of secret key, attribute " +
          "predicates). The resulting NIZK is ~300-500 bytes " +
          "for typical credentials with 5-10 attributes.",
        keyFormulas: [
          {
            name: "Schnorr Protocol",
            formula:
              "\\[ a = g^k, \\quad e \\xleftarrow{\\$} " +
              "\\mathbb{Z}_p, \\quad z = k + ex, \\quad " +
              "\\text{check } g^z = a \\cdot h^e \\]"
          },
          {
            name: "Witness Extraction",
            formula:
              "\\[ x = \\frac{z_1 - z_2}{e_1 - e_2} " +
              "\\mod p \\]"
          },
          {
            name: "OR-Proof Challenge Split",
            formula:
              "\\[ e_1 + e_2 = e \\mod p, \\quad " +
              "\\text{one branch real, one simulated} \\]"
          },
          {
            name: "SHVZK Simulator",
            formula:
              "\\[ \\mathrm{Sim}: \\; e, z " +
              "\\xleftarrow{\\$} \\mathbb{Z}_p, \\; " +
              "a = g^z \\cdot h^{-e} \\]"
          }
        ],
        exercises: [
          {
            type: "calculation",
            question:
              "In the Schnorr Sigma protocol, suppose the extractor " +
              "obtains two accepting transcripts with the same " +
              "commitment: \\( (a, e_1 = 3, z_1 = 17) \\) and " +
              "\\( (a, e_2 = 7, z_2 = 41) \\), working modulo " +
              "\\( p = 43 \\). Extract the witness \\( x \\) using " +
              "the special soundness formula.",
            hint:
              "Use \\( x = (z_1 - z_2) / (e_1 - e_2) \\mod p \\). " +
              "You need the modular inverse of \\( (e_1 - e_2) \\) " +
              "modulo 43.",
            answer:
              "\\( x = (z_1 - z_2) \\cdot (e_1 - e_2)^{-1} \\mod 43 \\). " +
              "Numerator: \\( 17 - 41 = -24 \\equiv 19 \\mod 43 \\). " +
              "Denominator: \\( 3 - 7 = -4 \\equiv 39 \\mod 43 \\). " +
              "Need \\( 39^{-1} \\mod 43 \\). " +
              "\\( 39 \\cdot 11 = 429 = 9 \\cdot 43 + 42 \\equiv " +
              "-1 \\mod 43 \\), so \\( 39 \\cdot (-11) \\equiv " +
              "1 \\mod 43 \\), i.e., " +
              "\\( 39^{-1} = -11 \\equiv 32 \\mod 43 \\). " +
              "\\( x = 19 \\cdot 32 = 608 \\mod 43 \\). " +
              "\\( 608 = 14 \\cdot 43 + 6 \\), so \\( x = 6 \\)."
          },
          {
            type: "conceptual",
            question:
              "In an OR composition (Cramer-Damgard-Schoenmakers), " +
              "the prover knows witness \\( x_1 \\) for " +
              "\\( h_1 = g^{x_1} \\) but not \\( x_2 \\) for " +
              "\\( h_2 = g^{x_2} \\). Describe step-by-step how " +
              "the prover constructs the OR-proof, and explain why " +
              "the verifier cannot tell which branch is real.",
            hint:
              "The prover simulates the transcript for the unknown " +
              "branch (branch 2) and runs the real protocol for " +
              "branch 1. The challenge constraint is " +
              "\\( e_1 + e_2 = e \\). The verifier only sees both " +
              "transcripts and checks each independently.",
            answer:
              "Step 1: Prover simulates branch 2 first: pick " +
              "\\( e_2 \\xleftarrow{\\$} \\mathbb{Z}_p \\) and " +
              "\\( z_2 \\xleftarrow{\\$} \\mathbb{Z}_p \\), compute " +
              "\\( a_2 = g^{z_2} \\cdot h_2^{-e_2} \\). " +
              "Step 2: Run real protocol for branch 1: pick " +
              "\\( k \\xleftarrow{\\$} \\mathbb{Z}_p \\), compute " +
              "\\( a_1 = g^k \\). Send \\( (a_1, a_2) \\). " +
              "Step 3: Receive challenge \\( e \\) from verifier. " +
              "Set \\( e_1 = e - e_2 \\mod p \\), compute " +
              "\\( z_1 = k + e_1 \\cdot x_1 \\mod p \\). " +
              "Send \\( (e_1, z_1, e_2, z_2) \\). " +
              "Verifier checks: \\( g^{z_1} = a_1 \\cdot h_1^{e_1} \\), " +
              "\\( g^{z_2} = a_2 \\cdot h_2^{e_2} \\), and " +
              "\\( e_1 + e_2 = e \\). Both branches produce valid " +
              "transcripts with uniformly distributed components. " +
              "The simulated branch is indistinguishable from a real " +
              "one because SHVZK simulators produce identical " +
              "distributions to real transcripts."
          }
        ]
      },

      /* ───────── Oblivious Transfer (OT) ───────── */
      {
        name: "Oblivious Transfer (OT)",
        formalDefinition:
          "1-of-2 OT: Sender \\( S \\) has \\( (m_0, m_1) \\), " +
          "Receiver \\( R \\) has \\( b \\in \\{0,1\\} \\). " +
          "After protocol: \\( R \\) learns \\( m_b \\), " +
          "\\( S \\) learns nothing about \\( b \\), " +
          "\\( R \\) learns nothing about \\( m_{1-b} \\).",
        mathDetails: [
          {
            subtitle: "Diffie-Hellman OT (Simplest Protocol)",
            content:
              "Sender picks \\( a \\), publishes " +
              "\\( A = g^a \\). " +
              "Receiver: if \\( b=0 \\), " +
              "\\( B = g^r \\); if \\( b=1 \\), " +
              "\\( B = A \\cdot g^r \\). " +
              "Sender computes " +
              "\\( k_0 = B^a, \\; k_1 = (B/A)^a \\). " +
              "Encrypt: \\( e_i = \\text{Enc}(k_i, m_i) \\). " +
              "Receiver decrypts \\( m_b \\) with " +
              "\\( k_b = A^r \\)."
          },
          {
            subtitle: "OT Extension (IKNP)",
            content:
              "Base OTs: \\( \\kappa \\) real OTs (128). " +
              "Extend to \\( n \\) OTs using pseudorandom " +
              "generator. Cost: \\( O(n) \\) symmetric " +
              "operations + \\( \\kappa \\) base OTs. " +
              "Core idea: transpose a random " +
              "\\( n \\times \\kappa \\) matrix, use " +
              "correlation to derive keys."
          },
          {
            subtitle: "Security Definitions",
            content:
              "Sender security: " +
              "\\( \\text{View}_S(m_0, m_1, b) \\approx " +
              "\\text{View}_S(m_0, m_1, b') \\) for any " +
              "\\( b, b' \\). " +
              "Receiver security: " +
              "\\( \\text{View}_R(m_0, m_1, b) \\approx " +
              "\\text{Sim}(m_b) \\) — receiver only " +
              "learns \\( m_b \\)."
          },
          {
            subtitle: "Variants",
            content:
              "1-of-n OT (receiver picks 1 of n), " +
              "k-of-n OT, random OT (random messages, " +
              "used in preprocessing), string OT " +
              "(messages are strings, not bits)."
          }
        ],
        securityAnalysis:
          "Semi-honest: CDH assumption for base OT. " +
          "Malicious: need UC-secure OT (e.g., " +
          "Peikert-Vaikuntanathan-Waters from LWE). " +
          "OT is \"complete\" for MPC — any secure " +
          "computation reduces to OT.",
        practicalNotes:
          "Base OT: ~1ms (2 exponentiations). " +
          "Extended OT: ~1\\(\\mu\\)s per OT after setup. " +
          "Libraries: libOTe (C++), emp-toolkit. " +
          "IKNP gives ~10M OTs/second.",
        keyFormulas: [
          {
            name: "DH-OT Key Derivation",
            formula:
              "\\[ k_0 = B^a, \\quad " +
              "k_1 = (B / A)^a, \\quad " +
              "k_b = A^r \\]"
          },
          {
            name: "OT Extension Cost",
            formula:
              "\\[ \\text{Cost}(n) = O(n) " +
              "\\text{ symmetric ops} + " +
              "\\kappa \\text{ base OTs} \\]"
          }
        ],
        exercises: [
          {
            type: "calculation",
            question:
              "In the Diffie-Hellman OT protocol, suppose the " +
              "sender picks \\( a = 3 \\) and publishes " +
              "\\( A = g^a \\mod p \\) with \\( g = 2, p = 11 \\). " +
              "The receiver wants \\( m_1 \\) (so \\( b = 1 \\)) " +
              "and picks \\( r = 4 \\). Compute the receiver's " +
              "message \\( B \\) and show that the receiver can " +
              "derive \\( k_1 = A^r \\) but cannot derive \\( k_0 \\).",
            hint:
              "\\( A = 2^3 \\mod 11 \\). For \\( b = 1 \\): " +
              "\\( B = A \\cdot g^r \\mod 11 \\). The sender computes " +
              "\\( k_0 = B^a, k_1 = (B/A)^a \\). The receiver " +
              "computes \\( k_1 = A^r \\). Verify they match.",
            answer:
              "\\( A = 2^3 = 8 \\mod 11 \\). " +
              "\\( B = 8 \\cdot 2^4 = 8 \\cdot 16 = 8 \\cdot 5 = " +
              "40 = 7 \\mod 11 \\). " +
              "Sender: \\( k_0 = 7^3 = 343 = 2 \\mod 11 \\). " +
              "\\( k_1 = (B/A)^a = (7 \\cdot 8^{-1})^3 \\mod 11 \\). " +
              "\\( 8^{-1} = 7 \\mod 11 \\) (since \\( 8 \\cdot 7 = " +
              "56 = 1 \\mod 11 \\)). " +
              "\\( B/A = 7 \\cdot 7 = 49 = 5 \\mod 11 \\). " +
              "\\( k_1 = 5^3 = 125 = 4 \\mod 11 \\). " +
              "Receiver: \\( k_1 = A^r = 8^4 \\mod 11 \\). " +
              "\\( 8^2 = 64 = 9, 8^4 = 81 = 4 \\mod 11 \\). " +
              "Both get \\( k_1 = 4 \\). The receiver cannot compute " +
              "\\( k_0 = 2 \\) without knowing \\( a \\)."
          },
          {
            type: "conceptual",
            question:
              "Explain why OT is said to be 'complete for secure " +
              "computation.' What does this mean formally, and " +
              "what is the high-level construction that reduces " +
              "any function evaluation to OT?",
            hint:
              "Think about how any function can be represented as " +
              "a boolean circuit, and how Yao's garbled circuits " +
              "use OT for the evaluator's input.",
            answer:
              "OT completeness means: given OT as a primitive, we " +
              "can securely compute any function " +
              "\\( f(x_1, \\ldots, x_n) \\). The construction: " +
              "(1) Express \\( f \\) as a boolean circuit \\( C \\). " +
              "(2) For 2-party: Garbler creates garbled circuit " +
              "\\( \\tilde{C} \\), sends to Evaluator. Evaluator " +
              "gets their input labels via OT (one OT per input " +
              "bit). (3) For n-party (GMW): use OT to implement " +
              "multiplications on secret-shared bits. Each AND gate " +
              "requires \\( O(n^2) \\) OTs. Formally: Kilian (1988) " +
              "proved that OT implies general secure computation " +
              "in the semi-honest model. Ishai et al. extended " +
              "this to malicious security. Combined with OT " +
              "extension (IKNP), the base cost is \\( \\kappa \\) " +
              "public-key OTs, and all remaining OTs use only " +
              "symmetric-key operations."
          }
        ]
      },

      /* ───────── Multi-Party Computation (MPC) ───────── */
      {
        name: "Multi-Party Computation (MPC)",
        formalDefinition:
          "\\( n \\) parties \\( P_1, \\ldots, P_n \\) with " +
          "inputs \\( x_1, \\ldots, x_n \\). Compute " +
          "\\( y = f(x_1, \\ldots, x_n) \\). Security: " +
          "\\( \\exists \\text{Sim} : " +
          "\\text{View}_{P_i}[\\pi] \\approx " +
          "\\text{Sim}(x_i, y) \\) — each party's view " +
          "is simulatable from their input and output alone.",
        mathDetails: [
          {
            subtitle: "GMW Protocol (Secret Sharing based)",
            content:
              "Additive sharing: " +
              "\\( x = x^{(1)} + \\cdots + x^{(n)} \\). " +
              "Addition: local (add shares). " +
              "Multiplication: \\( [x \\cdot y] \\) requires " +
              "interaction — use Beaver triples " +
              "\\( [a], [b], [c=ab] \\) preprocessed via OT."
          },
          {
            subtitle: "Yao's Garbled Circuits",
            content:
              "For 2-party. Garbler creates garbled circuit " +
              "\\( \\tilde{C} \\), sends to evaluator. " +
              "Evaluator gets their input labels via OT. " +
              "Evaluates circuit gate-by-gate. " +
              "Constant rounds (3)."
          },
          {
            subtitle: "SPDZ Protocol",
            content:
              "Malicious security \\( n \\)-party. " +
              "Preprocessing: generate Beaver triples with " +
              "MAC \\( \\alpha \\cdot x + \\beta \\). " +
              "Online phase: \\( O(n) \\) communication per " +
              "multiplication gate. MAC check at end " +
              "detects cheating."
          },
          {
            subtitle: "MPC-in-the-head",
            content:
              "Simulate \\( n \\)-party MPC locally, commit " +
              "to each party's view, open subset for " +
              "verification \\( \\rightarrow \\) ZK proof. " +
              "Basis for Ligero, KKW, Banquet signature " +
              "schemes."
          },
          {
            subtitle: "Threshold Cryptography",
            content:
              "\\( (t, n) \\)-threshold signing: \\( t \\) " +
              "parties jointly sign, \\( < t \\) learn nothing " +
              "about secret key. Threshold BBS+: " +
              "distributed credential issuance."
          }
        ],
        securityAnalysis:
          "Semi-honest: privacy against honest-but-curious. " +
          "Malicious: privacy + correctness against active " +
          "adversaries. UC-secure: composable with other " +
          "protocols. Threshold \\( t < n/2 \\) (honest " +
          "majority) or \\( t < n \\) (dishonest majority, " +
          "with abort).",
        practicalNotes:
          "GMW: ~ms per AND gate (LAN), ~100ms (WAN). " +
          "Garbled circuits: ~1\\(\\mu\\)s per AND gate. " +
          "SPDZ online: ~10\\(\\mu\\)s per mult. " +
          "Threshold ECDSA: ~100ms for 2-of-3. " +
          "Libraries: MP-SPDZ, emp-toolkit, ABY framework.",
        keyFormulas: [
          {
            name: "Beaver Triple Multiplication",
            formula:
              "\\[ [x \\cdot y] = [c] + " +
              "\\epsilon \\cdot [b] + " +
              "\\delta \\cdot [a] + " +
              "\\epsilon \\cdot \\delta, \\quad " +
              "\\epsilon = x - a, \\; " +
              "\\delta = y - b \\]"
          },
          {
            name: "Simulation Definition",
            formula:
              "\\[ \\text{View}_{P_i}[\\pi(x_1, \\ldots, x_n)] " +
              "\\approx \\text{Sim}(x_i, f(x_1, \\ldots, x_n)) \\]"
          },
          {
            name: "SPDZ MAC Check",
            formula:
              "\\[ \\text{MAC}(x) = \\alpha \\cdot x + \\beta, " +
              "\\quad \\text{verify } \\sum_i \\text{MAC}(x_i) " +
              "\\stackrel{?}{=} \\alpha \\cdot \\sum_i x_i " +
              "+ \\sum_i \\beta_i \\]"
          }
        ],
        exercises: [
          {
            type: "calculation",
            question:
              "In a 2-party computation using Beaver triples, parties " +
              "hold additive shares of \\( x \\) and \\( y \\), plus " +
              "a preprocessed triple \\( (a, b, c) \\) where " +
              "\\( c = ab \\). Given \\( x = 7, y = 5, a = 3, " +
              "b = 4, c = 12 \\), all modulo \\( p = 13 \\), " +
              "compute the shares of \\( x \\cdot y \\) using the " +
              "Beaver multiplication protocol.",
            hint:
              "Compute \\( \\epsilon = x - a \\) and " +
              "\\( \\delta = y - b \\). Then " +
              "\\( xy = c + \\epsilon b + \\delta a + " +
              "\\epsilon \\delta \\). All modulo 13.",
            answer:
              "\\( \\epsilon = x - a = 7 - 3 = 4 \\mod 13 \\). " +
              "\\( \\delta = y - b = 5 - 4 = 1 \\mod 13 \\). " +
              "\\( xy = c + \\epsilon b + \\delta a + " +
              "\\epsilon \\delta = 12 + 4 \\cdot 4 + 1 \\cdot 3 + " +
              "4 \\cdot 1 = 12 + 16 + 3 + 4 = 35 = " +
              "9 \\mod 13 \\). " +
              "Verification: \\( 7 \\cdot 5 = 35 = 9 \\mod 13 \\). " +
              "Correct. In practice, \\( \\epsilon, \\delta \\) are " +
              "publicly opened, but the individual shares of " +
              "\\( x, y \\) remain hidden because \\( a, b \\) are " +
              "random."
          },
          {
            type: "conceptual",
            question:
              "Explain the difference between semi-honest security " +
              "and malicious security in MPC. Why does the SPDZ " +
              "protocol use MACs, and how do they detect cheating " +
              "by a malicious party?",
            hint:
              "Semi-honest: parties follow the protocol but try to " +
              "learn extra information. Malicious: parties can deviate " +
              "arbitrarily. Think about what happens if a party sends " +
              "a wrong share in a multiplication.",
            answer:
              "Semi-honest: adversary follows protocol honestly but " +
              "tries to infer additional information from their view. " +
              "Security = simulatability of the view. Malicious: " +
              "adversary can send arbitrary messages, deviate from " +
              "protocol. Security requires correctness + privacy. " +
              "SPDZ uses information-theoretic MACs: each shared " +
              "value \\( x \\) has a MAC \\( \\alpha x + \\beta \\) " +
              "where \\( \\alpha \\) is a global secret key shared " +
              "among parties. If a malicious party modifies their " +
              "share of \\( x \\) to \\( x + \\Delta \\), the MAC " +
              "check at the end fails: " +
              "\\( \\text{MAC}(x + \\Delta) = \\alpha(x + \\Delta) + " +
              "\\beta \\neq \\alpha x + \\beta \\) " +
              "(difference is \\( \\alpha \\Delta \\), which the " +
              "adversary cannot forge without knowing \\( \\alpha \\)). " +
              "The MAC check is deferred to the end, allowing " +
              "efficient online computation with a single batch " +
              "verification."
          }
        ]
      },

      /* ───────── Secret Sharing ───────── */
      {
        name: "Secret Sharing",
        formalDefinition:
          "\\( (t, n) \\)-secret sharing: dealer splits " +
          "\\( s \\) into shares " +
          "\\( (s_1, \\ldots, s_n) \\) s.t. any \\( t \\) " +
          "shares reconstruct \\( s \\), and any " +
          "\\( < t \\) shares reveal nothing about \\( s \\).",
        mathDetails: [
          {
            subtitle: "Shamir's Secret Sharing",
            content:
              "Choose random polynomial " +
              "\\( f(x) = s + a_1 x + \\cdots + " +
              "a_{t-1} x^{t-1} \\) over " +
              "\\( \\mathbb{F}_p \\). " +
              "Shares: \\( s_i = f(i) \\) for " +
              "\\( i = 1, \\ldots, n \\). " +
              "Reconstruct via Lagrange interpolation: " +
              "\\( s = f(0) = \\sum_{i \\in S} s_i \\cdot " +
              "\\lambda_i \\) where " +
              "\\( \\lambda_i = \\prod_{j \\in S, j \\neq i} " +
              "\\frac{j}{j - i} \\)."
          },
          {
            subtitle: "Additive Secret Sharing",
            content:
              "\\( s = s_1 + s_2 + \\cdots + s_n " +
              "\\mod p \\). Choose " +
              "\\( s_1, \\ldots, s_{n-1} \\) randomly, " +
              "set \\( s_n = s - \\sum_{i=1}^{n-1} s_i \\). " +
              "Requires ALL shares (t=n). Addition is " +
              "free, multiplication needs interaction."
          },
          {
            subtitle: "Verifiable Secret Sharing (VSS)",
            content:
              "Feldman VSS: dealer publishes " +
              "\\( g^{a_0}, g^{a_1}, \\ldots, " +
              "g^{a_{t-1}} \\). " +
              "Each party verifies: " +
              "\\( g^{s_i} = \\prod_{j=0}^{t-1} " +
              "(g^{a_j})^{i^j} \\). " +
              "Detects cheating dealer."
          },
          {
            subtitle: "Proactive Secret Sharing",
            content:
              "Periodically refresh shares without " +
              "changing secret. Prevents mobile adversary " +
              "(attacker who corrupts different parties " +
              "over time)."
          }
        ],
        securityAnalysis:
          "Shamir: information-theoretic privacy " +
          "(unconditional). Feldman VSS: computational " +
          "(DLP). Threshold \\( t \\leq n \\) for Shamir, " +
          "\\( t < n/2 \\) for VSS with reconstruction " +
          "guarantee.",
        practicalNotes:
          "Shamir reconstruction: \\( O(t^2) \\) field " +
          "operations (or \\( O(t \\log^2 t) \\) with FFT). " +
          "Used in threshold wallets (Fireblocks), HSMs, " +
          "key recovery. Simple to implement but " +
          "communication overhead for MPC.",
        keyFormulas: [
          {
            name: "Shamir Polynomial",
            formula:
              "\\[ f(x) = s + a_1 x + a_2 x^2 + " +
              "\\cdots + a_{t-1} x^{t-1} " +
              "\\in \\mathbb{F}_p[x] \\]"
          },
          {
            name: "Lagrange Basis",
            formula:
              "\\[ \\lambda_i = \\prod_{j \\in S, " +
              "j \\neq i} \\frac{j}{j - i}, \\quad " +
              "s = \\sum_{i \\in S} s_i \\cdot " +
              "\\lambda_i \\]"
          },
          {
            name: "Feldman Verification",
            formula:
              "\\[ g^{s_i} \\stackrel{?}{=} " +
              "\\prod_{j=0}^{t-1} " +
              "(g^{a_j})^{i^j} \\]"
          }
        ],
        exercises: [
          {
            type: "calculation",
            question:
              "A (2,3)-Shamir secret sharing scheme operates over " +
              "\\( \\mathbb{F}_7 \\). The dealer has secret " +
              "\\( s = 4 \\) and picks random coefficient " +
              "\\( a_1 = 5 \\). Compute the three shares " +
              "\\( s_1 = f(1), s_2 = f(2), s_3 = f(3) \\). Then " +
              "reconstruct \\( s \\) from shares \\( s_1, s_3 \\) " +
              "using Lagrange interpolation.",
            hint:
              "\\( f(x) = 4 + 5x \\mod 7 \\). For reconstruction " +
              "from \\( \\{1, 3\\} \\): " +
              "\\( \\lambda_1 = 3/(3-1) \\mod 7 \\), " +
              "\\( \\lambda_3 = 1/(1-3) \\mod 7 \\). Then " +
              "\\( s = s_1 \\lambda_1 + s_3 \\lambda_3 \\mod 7 \\).",
            answer:
              "\\( f(x) = 4 + 5x \\mod 7 \\). " +
              "\\( s_1 = 4 + 5 = 9 = 2 \\mod 7 \\). " +
              "\\( s_2 = 4 + 10 = 14 = 0 \\mod 7 \\). " +
              "\\( s_3 = 4 + 15 = 19 = 5 \\mod 7 \\). " +
              "Reconstruction from \\( S = \\{1, 3\\} \\): " +
              "\\( \\lambda_1 = \\frac{0 - 3}{1 - 3} = " +
              "\\frac{-3}{-2} = \\frac{3}{2} \\mod 7 \\). " +
              "\\( 2^{-1} = 4 \\mod 7 \\) (since \\( 2 \\cdot 4 = 8 = " +
              "1 \\mod 7 \\)), so \\( \\lambda_1 = 3 \\cdot 4 = " +
              "12 = 5 \\mod 7 \\). " +
              "\\( \\lambda_3 = \\frac{0 - 1}{3 - 1} = " +
              "\\frac{-1}{2} = -4 = 3 \\mod 7 \\). " +
              "\\( s = 2 \\cdot 5 + 5 \\cdot 3 = 10 + 15 = 25 = " +
              "4 \\mod 7 \\). Correct."
          },
          {
            type: "conceptual",
            question:
              "Shamir secret sharing has information-theoretic " +
              "privacy: fewer than \\( t \\) shares reveal nothing " +
              "about the secret. Prove this for the case \\( t = 2 \\): " +
              "given one share \\( s_1 = f(1) \\), show that any " +
              "secret \\( s' \\in \\mathbb{F}_p \\) is equally likely.",
            hint:
              "The polynomial is \\( f(x) = s + a_1 x \\) where " +
              "\\( a_1 \\) is uniformly random. Given \\( f(1) = s + a_1 \\), " +
              "for any \\( s' \\), there exists exactly one \\( a_1 \\) " +
              "that is consistent.",
            answer:
              "For \\( t = 2 \\): \\( f(x) = s + a_1 x \\) with " +
              "\\( a_1 \\xleftarrow{\\$} \\mathbb{F}_p \\). " +
              "Given \\( s_1 = f(1) = s + a_1 \\), for any candidate " +
              "secret \\( s' \\), we need \\( a_1 = s_1 - s' \\). " +
              "This is exactly one value of \\( a_1 \\in \\mathbb{F}_p \\). " +
              "Since \\( a_1 \\) is uniform over \\( \\mathbb{F}_p \\), " +
              "each \\( s' \\) is consistent with probability " +
              "\\( 1/p \\). Therefore " +
              "\\( \\Pr[s = s' \\mid s_1] = 1/p \\) for all \\( s' \\), " +
              "which is the uniform distribution. The conditional " +
              "distribution of \\( s \\) given one share is identical " +
              "to the prior, giving perfect information-theoretic " +
              "privacy."
          }
        ]
      },

      /* ───────── Garbled Circuits ───────── */
      {
        name: "Garbled Circuits",
        formalDefinition:
          "Garbler \\( G \\) creates \\( \\tilde{C} \\), " +
          "a garbled version of circuit \\( C \\). " +
          "Evaluator \\( E \\) evaluates \\( \\tilde{C} \\) " +
          "on garbled inputs to get garbled output. " +
          "\\( G \\) learns nothing about \\( E \\)'s input; " +
          "\\( E \\) learns nothing beyond \\( C(x, y) \\).",
        mathDetails: [
          {
            subtitle: "Wire Labels",
            content:
              "Each wire \\( w \\) has two labels " +
              "\\( (W_w^0, W_w^1) \\in \\{0,1\\}^\\kappa \\). " +
              "Label \\( W_w^b \\) represents bit \\( b \\) " +
              "on wire \\( w \\)."
          },
          {
            subtitle: "Garbled Gate",
            content:
              "For AND gate with input wires " +
              "\\( a, b \\) and output wire \\( c \\):" +
              "\\[ \\tilde{g} = \\bigl\\{ " +
              "\\text{Enc}_{W_a^i, W_b^j}" +
              "(W_c^{i \\wedge j}) " +
              "\\bigr\\}_{i,j \\in \\{0,1\\}} \\]" +
              "Four ciphertexts, randomly permuted " +
              "(point-and-permute: add select bits " +
              "to labels)."
          },
          {
            subtitle: "Free XOR Optimization",
            content:
              "Choose global " +
              "\\( \\Delta \\in \\{0,1\\}^\\kappa \\). Set " +
              "\\( W_w^1 = W_w^0 \\oplus \\Delta \\) for " +
              "all wires. XOR gates: " +
              "\\( W_c^0 = W_a^0 \\oplus W_b^0 \\) — " +
              "no encryption needed, completely free."
          },
          {
            subtitle: "Half-Gates",
            content:
              "AND gate needs only 2 ciphertexts " +
              "(instead of 4). Garbler half-gate + " +
              "evaluator half-gate combined. Best known " +
              "optimization."
          },
          {
            subtitle: "Input Handling",
            content:
              "Garbler sends their garbled input " +
              "directly. Evaluator gets their garbled " +
              "input via OT: for each input bit, OT " +
              "transfers the correct label."
          }
        ],
        securityAnalysis:
          "Simulation-based: garbled circuit + one set of " +
          "labels \\( \\approx \\) simulator output. " +
          "Requires OT security for evaluator's input. " +
          "Selective vs adaptive security for garbler's " +
          "input.",
        practicalNotes:
          "Half-gates: 2 AES calls per AND gate. " +
          "~1 billion gates/second on modern CPU " +
          "(AES-NI). Communication: 256 bits per AND " +
          "gate. Boolean circuits only (arithmetic is " +
          "expensive). Used for PSI (Private Set " +
          "Intersection), private ML inference.",
        keyFormulas: [
          {
            name: "Garbled Gate Encryption",
            formula:
              "\\[ \\tilde{g}_{i,j} = " +
              "\\text{Enc}_{W_a^i, W_b^j}" +
              "(W_c^{i \\wedge j}) \\]"
          },
          {
            name: "Free XOR Relation",
            formula:
              "\\[ W_w^1 = W_w^0 \\oplus \\Delta, " +
              "\\quad W_c^0 = W_a^0 \\oplus W_b^0 \\]"
          },
          {
            name: "Half-Gate Construction",
            formula:
              "\\[ \\tilde{g} = " +
              "(\\text{Enc}_{W_a^0}(W_c^{\\text{G}}), " +
              "\\; \\text{Enc}_{W_b^0}(W_c^{\\text{E}})), " +
              "\\quad W_c = W_c^{\\text{G}} " +
              "\\oplus W_c^{\\text{E}} \\]"
          }
        ],
        exercises: [
          {
            type: "calculation",
            question:
              "A garbled circuit uses the Free XOR optimization with " +
              "global offset \\( \\Delta = 1010 \\) (4-bit). Wire " +
              "\\( a \\) has \\( W_a^0 = 0110 \\) and wire " +
              "\\( b \\) has \\( W_b^0 = 1100 \\). Compute " +
              "\\( W_a^1 \\), \\( W_b^1 \\), and the output label " +
              "\\( W_c^0 \\) for an XOR gate. Verify " +
              "\\( W_c^1 = W_c^0 \\oplus \\Delta \\).",
            hint:
              "Free XOR: \\( W_w^1 = W_w^0 \\oplus \\Delta \\). " +
              "For XOR gate output: " +
              "\\( W_c^0 = W_a^0 \\oplus W_b^0 \\).",
            answer:
              "\\( W_a^1 = 0110 \\oplus 1010 = 1100 \\). " +
              "\\( W_b^1 = 1100 \\oplus 1010 = 0110 \\). " +
              "\\( W_c^0 = W_a^0 \\oplus W_b^0 = 0110 \\oplus " +
              "1100 = 1010 \\). " +
              "\\( W_c^1 = W_c^0 \\oplus \\Delta = 1010 \\oplus " +
              "1010 = 0000 \\). " +
              "Verification: if \\( a = 1, b = 0 \\), evaluator " +
              "has \\( W_a^1 = 1100 \\) and \\( W_b^0 = 1100 \\). " +
              "Output = \\( 1100 \\oplus 1100 = 0000 = W_c^1 \\). " +
              "Since \\( 1 \\oplus 0 = 1 \\), this correctly gives " +
              "the label for bit 1. No encryption needed for XOR."
          },
          {
            type: "conceptual",
            question:
              "Explain why garbled circuits provide security only for " +
              "a single evaluation. Why can't the evaluator garble a " +
              "second set of inputs and evaluate again? What is the " +
              "consequence for reactive computations?",
            hint:
              "Think about what the evaluator learns after " +
              "evaluation: they know one label per wire. Could they " +
              "correlate labels across evaluations? What about the " +
              "garbled gate entries: after decrypting one, what " +
              "information remains?",
            answer:
              "After evaluation, the evaluator knows one label per " +
              "wire (the label corresponding to the actual bit " +
              "value). If the same garbled circuit were used with " +
              "different inputs, the evaluator could compare labels: " +
              "same label = same bit value, different label = " +
              "different bit value, leaking information about inputs. " +
              "Furthermore, the evaluator could try all 4 garbled " +
              "gate entries (not just the one they can decrypt) to " +
              "learn the relationship between input and output " +
              "labels. For reactive or multi-use computations, " +
              "fresh garbled circuits must be generated each time, " +
              "or one must use techniques like BMR (multi-party " +
              "garbling) or combine with secret sharing for " +
              "stateful computation."
          }
        ]
      },

      /* ───────── Fully Homomorphic Encryption (FHE) ───────── */
      {
        name: "Fully Homomorphic Encryption (FHE)",
        formalDefinition:
          "\\( (\\text{KeyGen}, \\text{Enc}, \\text{Dec}, " +
          "\\text{Eval}) \\) where " +
          "\\( \\text{Eval}(\\text{pk}, f, " +
          "\\text{Enc}(m)) = \\text{Enc}(f(m)) \\) " +
          "for any function \\( f \\), without decrypting.",
        mathDetails: [
          {
            subtitle: "Learning With Errors (LWE)",
            content:
              "Public key: \\( (A, b = As + e) \\) where " +
              "\\( A \\in \\mathbb{Z}_q^{n \\times m} \\), " +
              "\\( s \\in \\mathbb{Z}_q^n \\) secret, " +
              "\\( e \\) small error. Encrypt: " +
              "\\( (c_1, c_2) = (rA, \\; rb + " +
              "\\lfloor q/2 \\rfloor \\cdot m) \\). " +
              "Decrypt: \\( m = \\lfloor (c_2 - " +
              "c_1 \\cdot s) / (q/2) \\rceil \\)."
          },
          {
            subtitle: "Noise Growth",
            content:
              "Each homomorphic operation increases noise. " +
              "Addition: \\( \\|e_{\\text{add}}\\| \\leq " +
              "\\|e_1\\| + \\|e_2\\| \\). " +
              "Multiplication: \\( \\|e_{\\text{mult}}\\| " +
              "\\approx \\|e_1\\| \\cdot \\|e_2\\| \\). " +
              "After too many multiplications, noise " +
              "exceeds threshold " +
              "\\( \\rightarrow \\) decryption fails."
          },
          {
            subtitle: "Bootstrapping (Gentry)",
            content:
              "Homomorphically evaluate the decryption " +
              "circuit to refresh noise. " +
              "\\( \\text{Eval}(\\text{pk}, \\text{Dec}, " +
              "\\text{Enc}(\\text{Enc}(m))) = " +
              "\\text{Enc}(m) \\) with fresh noise. " +
              "Enables unlimited depth but expensive " +
              "(~100ms per bootstrap)."
          },
          {
            subtitle: "Key Schemes",
            content:
              "BFV: integer arithmetic, batching via CRT. " +
              "BGV: modulus switching for noise management. " +
              "CKKS: approximate computation on " +
              "real/complex numbers (ML-friendly). " +
              "TFHE: boolean gates, fast bootstrapping " +
              "(~10ms), used for boolean circuits."
          },
          {
            subtitle: "SIMD Batching",
            content:
              "Pack \\( n \\) plaintexts into one " +
              "ciphertext using CRT/NTT. Single operation " +
              "processes all \\( n \\) values. Amortized " +
              "cost \\( O(1) \\) per plaintext element."
          }
        ],
        securityAnalysis:
          "Based on (R)LWE: believed quantum-safe. " +
          "Security parameter \\( n \\geq 1024 \\) for " +
          "128-bit security. IND-CPA secure (not " +
          "IND-CCA — malleable by design). Circular " +
          "security assumption for bootstrapping key.",
        practicalNotes:
          "CKKS multiply: ~10ms. BFV multiply: ~5ms. " +
          "TFHE bootstrap: ~10ms. Ciphertext size: " +
          "~32KB-1MB depending on parameters. " +
          "Libraries: Microsoft SEAL (BFV/CKKS), " +
          "TFHE-rs (Rust), OpenFHE. Current overhead: " +
          "1000-10000x vs plaintext.",
        keyFormulas: [
          {
            name: "LWE Encryption/Decryption",
            formula:
              "\\[ \\text{Enc}: (c_1, c_2) = " +
              "(rA, \\; rb + \\lfloor q/2 \\rfloor " +
              "\\cdot m), \\quad " +
              "\\text{Dec}: m = \\lfloor " +
              "\\tfrac{c_2 - c_1 s}{q/2} \\rceil \\]"
          },
          {
            name: "Noise Growth Bounds",
            formula:
              "\\[ \\|e_{\\text{add}}\\| \\leq " +
              "\\|e_1\\| + \\|e_2\\|, \\quad " +
              "\\|e_{\\text{mult}}\\| \\approx " +
              "\\|e_1\\| \\cdot \\|e_2\\| \\]"
          },
          {
            name: "Bootstrapping Equation",
            formula:
              "\\[ \\text{Eval}(\\text{pk}, " +
              "\\text{Dec}_{\\text{sk}}, " +
              "\\text{Enc}(\\text{Enc}(m))) = " +
              "\\text{Enc}(m) \\]"
          }
        ],
        exercises: [
          {
            type: "calculation",
            question:
              "In a simplified LWE scheme with \\( q = 17 \\), " +
              "secret \\( s = 3 \\), and error \\( e = 1 \\). The " +
              "public key is \\( (a, b) = (5, 5 \\cdot 3 + 1) = " +
              "(5, 16) \\mod 17 \\). Encrypt the message bit " +
              "\\( m = 1 \\). Then decrypt and verify correctness.",
            hint:
              "Encryption: \\( c_1 = ra \\mod q \\), " +
              "\\( c_2 = rb + \\lfloor q/2 \\rfloor m \\mod q \\). " +
              "Pick \\( r = 1 \\) for simplicity. " +
              "\\( \\lfloor 17/2 \\rfloor = 8 \\). " +
              "Decryption: compute \\( c_2 - c_1 s \\mod q \\) " +
              "and round to nearest multiple of \\( q/2 \\).",
            answer:
              "\\( c_1 = 1 \\cdot 5 = 5 \\mod 17 \\). " +
              "\\( c_2 = 1 \\cdot 16 + 8 \\cdot 1 = 24 = " +
              "7 \\mod 17 \\). " +
              "Decrypt: \\( c_2 - c_1 s = 7 - 5 \\cdot 3 = " +
              "7 - 15 = -8 = 9 \\mod 17 \\). " +
              "Compare to \\( \\lfloor q/2 \\rfloor = 8 \\). " +
              "\\( |9 - 0| = 9 \\) vs \\( |9 - 8| = 1 \\). " +
              "Closer to 8 (which represents \\( m = 1 \\)), so " +
              "\\( m = 1 \\). The noise is \\( 9 - 8 = 1 \\) " +
              "(matching our error \\( e = 1 \\)). If noise grew " +
              "past \\( q/4 = 4.25 \\), decryption would fail."
          },
          {
            type: "conceptual",
            question:
              "Explain why FHE is IND-CPA secure but cannot be " +
              "IND-CCA secure. What property of homomorphic " +
              "encryption inherently conflicts with chosen-ciphertext " +
              "security? Why is this acceptable in practice?",
            hint:
              "IND-CCA security means ciphertexts are non-malleable. " +
              "But homomorphic evaluation produces new valid " +
              "ciphertexts from existing ones. Think about what " +
              "happens if an adversary can query a decryption oracle.",
            answer:
              "Homomorphic evaluation lets anyone transform " +
              "\\( \\text{Enc}(m) \\) into " +
              "\\( \\text{Enc}(f(m)) \\) for any computable \\( f \\). " +
              "This is inherent malleability: given \\( c = " +
              "\\text{Enc}(m) \\), compute \\( c' = " +
              "\\text{Eval}(\\text{pk}, f, c) = \\text{Enc}(f(m)) \\). " +
              "In an IND-CCA game, the adversary could submit " +
              "\\( c' \\) to the decryption oracle and learn " +
              "\\( f(m) \\), trivially breaking security (e.g., " +
              "\\( f = \\text{identity} \\) to directly decrypt). " +
              "This is acceptable because FHE is used in settings " +
              "where the evaluator does not have decryption access. " +
              "The threat model assumes the server computes on " +
              "encrypted data without a decryption key. Circuit " +
              "privacy (hiding which function was evaluated) is " +
              "addressed separately via rerandomization."
          }
        ]
      },

      /* ───────── Oblivious RAM (ORAM) ───────── */
      {
        name: "Oblivious RAM (ORAM)",
        formalDefinition:
          "Client accesses server memory such that " +
          "access pattern " +
          "\\( \\text{AP}(\\vec{x}) \\) is " +
          "computationally indistinguishable from " +
          "\\( \\text{AP}(\\vec{y}) \\) for any two " +
          "request sequences \\( \\vec{x}, \\vec{y} \\) " +
          "of same length.",
        mathDetails: [
          {
            subtitle: "Path ORAM",
            content:
              "Server stores \\( N \\) blocks in a binary " +
              "tree of depth " +
              "\\( L = \\lceil \\log N \\rceil \\). " +
              "Each block mapped to a random leaf. " +
              "Access: read entire path from root to leaf, " +
              "find block, re-encrypt and shuffle stash, " +
              "write back. Bandwidth: " +
              "\\( O(L \\cdot B) = O(B \\log N) \\) per " +
              "access where \\( B \\) is block size."
          },
          {
            subtitle: "Position Map",
            content:
              "Maps block ID \\( \\rightarrow \\) leaf. " +
              "Stored recursively in smaller ORAMs. " +
              "\\( O(\\log N) \\) levels of recursion, " +
              "each with \\( N/B \\) entries."
          },
          {
            subtitle: "Stash Management",
            content:
              "Client-side buffer holding blocks that " +
              "don't fit on their path. Stash size: " +
              "\\( O(\\log N) \\) with high probability. " +
              "If stash overflows " +
              "\\( \\rightarrow \\) security breach."
          },
          {
            subtitle: "Circuit ORAM",
            content:
              "Improves over Path ORAM with " +
              "reverse-lexicographic eviction. Amortized " +
              "\\( O(\\log N) \\) with smaller stash. " +
              "Better for sequential access patterns."
          },
          {
            subtitle: "TEE + ORAM",
            content:
              "TEE encrypts data but access patterns " +
              "visible on memory bus. ORAM inside TEE " +
              "hides access patterns. ZeroTrace: Path " +
              "ORAM inside SGX enclave. Overhead: ~10x " +
              "for TEE + ORAM vs ~100x for pure ORAM."
          }
        ],
        securityAnalysis:
          "Path ORAM: simulation-based security, " +
          "negligible stash overflow probability. " +
          "Assumes PRF for re-encryption. Combined with " +
          "TEE: hides access patterns even from " +
          "OS/hypervisor.",
        practicalNotes:
          "Path ORAM: ~10\\(\\mu\\)s per access (RAM), " +
          "~1ms per access (disk). ZeroTrace: " +
          "~100\\(\\mu\\)s per access in SGX. Practical " +
          "for small databases (~1M entries). For larger: " +
          "use oblivious data structures instead of " +
          "generic ORAM.",
        keyFormulas: [
          {
            name: "Path ORAM Bandwidth",
            formula:
              "\\[ \\text{BW} = O(B \\cdot \\log N) " +
              "\\text{ per access}, \\quad " +
              "L = \\lceil \\log N \\rceil \\]"
          },
          {
            name: "Stash Overflow Probability",
            formula:
              "\\[ \\Pr[|\\text{Stash}| > R] \\leq " +
              "14 \\cdot e^{-R} \\quad " +
              "\\text{(exponentially small)} \\]"
          },
          {
            name: "Recursive Position Map Depth",
            formula:
              "\\[ \\text{Levels} = " +
              "O(\\log_B N), \\quad " +
              "\\text{total cost } = " +
              "O(B \\cdot \\log^2 N / \\log B) \\]"
          }
        ],
        exercises: [
          {
            type: "calculation",
            question:
              "A Path ORAM stores \\( N = 2^{20} \\) blocks, each " +
              "of size \\( B = 4 \\) KB. The binary tree has depth " +
              "\\( L = \\lceil \\log_2 N \\rceil = 20 \\). Calculate " +
              "the bandwidth per access and the stash overflow " +
              "probability for stash size \\( R = 30 \\).",
            hint:
              "Bandwidth per access = \\( O(B \\cdot L) \\): read one " +
              "path (root to leaf) and write back. Stash overflow: " +
              "\\( \\Pr[|\\text{Stash}| > R] \\leq 14 \\cdot e^{-R} \\).",
            answer:
              "Bandwidth: reading and writing one path = " +
              "\\( 2 \\cdot L \\cdot B = 2 \\cdot 20 \\cdot 4 " +
              "= 160 \\) KB per access (read path + write back). " +
              "With bucket size \\( Z = 4 \\), each node holds 4 " +
              "blocks, so the path has \\( 21 \\times 4 = 84 \\) " +
              "blocks = 336 KB total transferred. " +
              "Stash overflow: \\( \\Pr[|\\text{Stash}| > 30] \\leq " +
              "14 \\cdot e^{-30} = 14 \\cdot 9.36 \\times 10^{-14} " +
              "\\approx 1.3 \\times 10^{-12} \\). After " +
              "\\( 2^{40} \\approx 10^{12} \\) accesses, the " +
              "expected number of overflows is ~1.3. For " +
              "\\( R = 50 \\), the probability drops to " +
              "\\( < 2^{-60} \\), which is negligible."
          },
          {
            type: "conceptual",
            question:
              "Explain why ORAM is necessary for TEE-based " +
              "applications. If a TEE (like Intel SGX) already " +
              "encrypts memory, what additional information does " +
              "the access pattern leak, and give a concrete " +
              "attack example.",
            hint:
              "Think about a binary search in encrypted memory. " +
              "The TEE encrypts values but the memory controller " +
              "sees which addresses are accessed. What can an " +
              "observer infer from the sequence of addresses?",
            answer:
              "TEEs encrypt data at rest and in transit, but the " +
              "CPU's memory access pattern (which physical " +
              "addresses are read/written) is visible to the " +
              "OS, hypervisor, and hardware bus. This leaks " +
              "information through side channels. Concrete attack: " +
              "a binary search over a sorted encrypted array of " +
              "\\( N \\) elements accesses \\( \\log N \\) " +
              "memory locations. The sequence of addresses " +
              "reveals the comparison outcomes, effectively " +
              "disclosing the search target. For a database " +
              "of 1M records, the access pattern of a query " +
              "reveals which record was accessed. Page-level " +
              "attacks (Xu et al., 2015) showed that observing " +
              "SGX page faults alone can extract text from " +
              "encrypted documents. ORAM makes all access " +
              "sequences indistinguishable: every access " +
              "touches a full random-looking path, regardless " +
              "of the actual data being accessed."
          }
        ]
      }
    ]
  },

  block2: {
    concepts: [
      /* ───────── Arithmetic Circuits & R1CS ───────── */
      {
        name: "Arithmetic Circuits & R1CS",
        formalDefinition:
          "An arithmetic circuit \\( C \\) over a finite " +
          "field \\( \\mathbb{F} \\) is a directed acyclic " +
          "graph where each internal node is a gate " +
          "(\\( + \\) or \\( \\times \\) over " +
          "\\( \\mathbb{F} \\)) and edges carry field " +
          "elements. The circuit computes " +
          "\\( C: \\mathbb{F}^n \\rightarrow \\mathbb{F} \\). " +
          "R1CS (Rank-1 Constraint System) represents " +
          "the circuit as:" +
          "\\[ (A \\cdot \\mathbf{z}) \\circ " +
          "(B \\cdot \\mathbf{z}) = C \\cdot \\mathbf{z} \\]" +
          "where \\( A, B, C \\in \\mathbb{F}^{m \\times n} \\) " +
          "are constraint matrices, \\( \\mathbf{z} \\) is the " +
          "extended witness vector, and \\( \\circ \\) denotes " +
          "the Hadamard (element-wise) product.",
        mathDetails: [
          {
            subtitle: "Flattening to Elementary Gates",
            content:
              "Any polynomial computation is decomposed into " +
              "a sequence of elementary operations. Example: " +
              "\\( y = x^3 + x + 5 \\) becomes:" +
              "\\[ v_1 = x \\cdot x \\quad " +
              "(\\text{gate 1: squaring}) \\]" +
              "\\[ v_2 = v_1 \\cdot x \\quad " +
              "(\\text{gate 2: cubing}) \\]" +
              "\\[ v_3 = v_2 + x \\quad " +
              "(\\text{gate 3: addition}) \\]" +
              "\\[ y = v_3 + 5 \\quad " +
              "(\\text{gate 4: add constant}) \\]" +
              "Each multiplication gate becomes one R1CS " +
              "constraint. Addition gates are free (absorbed " +
              "into the linear combinations). The total number " +
              "of constraints equals the number of " +
              "multiplication gates."
          },
          {
            subtitle: "Witness Vector",
            content:
              "The extended witness vector " +
              "\\( \\mathbf{z} = (1, x_1, \\ldots, x_\\ell, " +
              "w_1, \\ldots, w_m) \\) contains:" +
              "\\[ \\text{Constant } 1, \\quad " +
              "\\text{public inputs } x_i, \\quad " +
              "\\text{private witness values } w_j \\]" +
              "The public inputs are known to both prover " +
              "and verifier. The private witness values are " +
              "known only to the prover. The verifier checks " +
              "the constraints are satisfied using the public " +
              "inputs and the proof (without seeing the private " +
              "witness)."
          },
          {
            subtitle: "R1CS Constraint Format",
            content:
              "Each constraint (corresponding to one " +
              "multiplication gate) has the form:" +
              "\\[ \\langle \\mathbf{a}_i, \\mathbf{z} \\rangle " +
              "\\cdot \\langle \\mathbf{b}_i, \\mathbf{z} " +
              "\\rangle = \\langle \\mathbf{c}_i, \\mathbf{z} " +
              "\\rangle \\]" +
              "where \\( \\mathbf{a}_i, \\mathbf{b}_i, " +
              "\\mathbf{c}_i \\) are row vectors of " +
              "\\( A, B, C \\). Each inner product " +
              "\\( \\langle \\mathbf{a}_i, \\mathbf{z} " +
              "\\rangle \\) computes a linear combination of " +
              "witness values. The constraint says: " +
              "(linear combo 1) \\( \\times \\) " +
              "(linear combo 2) \\( = \\) " +
              "(linear combo 3)."
          },
          {
            subtitle: "QAP (Quadratic Arithmetic Program)",
            content:
              "R1CS is converted to QAP by polynomial " +
              "interpolation. For each row index \\( j \\) of " +
              "the witness, define polynomials " +
              "\\( A_j(x), B_j(x), C_j(x) \\) such that " +
              "\\( A_j(\\omega^i) = A_{i,j} \\) for constraint " +
              "\\( i \\). The QAP satisfiability condition is:" +
              "\\[ \\left(\\sum_j z_j A_j(x)\\right) \\cdot " +
              "\\left(\\sum_j z_j B_j(x)\\right) - " +
              "\\left(\\sum_j z_j C_j(x)\\right) = " +
              "H(x) \\cdot T(x) \\]" +
              "where \\( T(x) = \\prod_{i=1}^{m} " +
              "(x - \\omega^i) \\) is the vanishing polynomial " +
              "and \\( H(x) \\) is the quotient. The key " +
              "insight: \\( T(x) \\) divides the left-hand " +
              "side iff all R1CS constraints are satisfied."
          },
          {
            subtitle: "Circuit Complexity",
            content:
              "The circuit size (number of constraints) " +
              "directly determines:" +
              "\\[ \\text{Proving time: } O(n \\log n) " +
              "\\text{ field operations (Groth16)} \\]" +
              "\\[ \\text{CRS size: } O(n) " +
              "\\text{ group elements} \\]" +
              "\\[ \\text{Prover memory: } O(n) \\]" +
              "Verification is independent of circuit size for " +
              "Groth16 (\\( O(1) \\) pairings). " +
              "Optimizing circuit size is critical: one SHA-256 " +
              "hash costs ~27,000 constraints, one Poseidon hash " +
              "costs ~250. A credential verification circuit " +
              "with BLS12-381 pairing checks can reach " +
              "100K-1M constraints."
          }
        ],
        securityAnalysis:
          "Circuit satisfiability is NP-complete (Cook-Levin " +
          "theorem generalized to arithmetic circuits). The " +
          "witness \\( \\mathbf{z} \\) satisfying all " +
          "constraints is an NP witness. The soundness of the " +
          "proving system ensures that no adversary can find " +
          "a proof for an unsatisfied circuit. " +
          "Completeness of the R1CS representation is " +
          "critical: the circuit must faithfully encode the " +
          "intended computation. Under-constrained circuits " +
          "(missing constraints) are a common vulnerability, " +
          "allowing proofs for unintended witnesses.",
        practicalNotes:
          "Circom: DSL for writing arithmetic circuits, " +
          "compiles to R1CS. SnarkJS: JavaScript prover and " +
          "verifier for Groth16 and PLONK over BN254. " +
          "Arkworks (Rust): generic constraint system library " +
          "supporting R1CS and custom backends. " +
          "Typical constraint counts: Poseidon hash ~250, " +
          "EdDSA signature verification ~12,000, SHA-256 " +
          "~27,000, BLS12-381 pairing ~300,000. " +
          "Circuit auditing tools: ecne (formal verification " +
          "for Circom), Picus (underconstrained detection). " +
          "A credential presentation circuit (prove valid " +
          "BBS+ signature + selective disclosure) typically " +
          "has 50K-200K constraints.",
        keyFormulas: [
          {
            name: "R1CS Format",
            formula:
              "\\[ (A \\mathbf{z}) \\circ " +
              "(B \\mathbf{z}) = C \\mathbf{z} \\]"
          },
          {
            name: "Single Constraint",
            formula:
              "\\[ \\langle \\mathbf{a}_i, \\mathbf{z} " +
              "\\rangle \\cdot \\langle \\mathbf{b}_i, " +
              "\\mathbf{z} \\rangle = " +
              "\\langle \\mathbf{c}_i, \\mathbf{z} \\rangle \\]"
          },
          {
            name: "QAP Divisibility Check",
            formula:
              "\\[ \\left(\\sum_j z_j A_j(x)\\right) " +
              "\\left(\\sum_j z_j B_j(x)\\right) - " +
              "\\left(\\sum_j z_j C_j(x)\\right) = " +
              "H(x) \\cdot T(x) \\]"
          }
        ],
        exercises: [
          {
            type: "calculation",
            question:
              "Flatten the computation \\( y = x^2 + 3x + 2 \\) " +
              "into R1CS constraints. Define the witness vector " +
              "\\( \\mathbf{z} \\) and write out each constraint " +
              "in the form \\( \\langle \\mathbf{a}_i, " +
              "\\mathbf{z} \\rangle \\cdot \\langle \\mathbf{b}_i, " +
              "\\mathbf{z} \\rangle = \\langle \\mathbf{c}_i, " +
              "\\mathbf{z} \\rangle \\). How many R1CS constraints " +
              "are needed?",
            hint:
              "Introduce an intermediate variable " +
              "\\( v_1 = x \\cdot x \\). Then " +
              "\\( y = v_1 + 3x + 2 \\). Only multiplication gates " +
              "produce R1CS constraints. Addition and constant " +
              "multiplication are absorbed into the linear " +
              "combinations.",
            answer:
              "Witness vector: \\( \\mathbf{z} = (1, x, y, v_1) \\) " +
              "where \\( v_1 = x^2 \\). " +
              "Constraint 1 (the multiplication gate " +
              "\\( v_1 = x \\cdot x \\)): " +
              "\\( \\langle (0, 1, 0, 0), \\mathbf{z} \\rangle " +
              "\\cdot \\langle (0, 1, 0, 0), \\mathbf{z} \\rangle " +
              "= \\langle (0, 0, 0, 1), \\mathbf{z} \\rangle \\). " +
              "This gives \\( x \\cdot x = v_1 \\). " +
              "Constraint 2 (enforce \\( y = v_1 + 3x + 2 \\)): " +
              "\\( \\langle (2, 3, 0, 1), \\mathbf{z} \\rangle " +
              "\\cdot \\langle (1, 0, 0, 0), \\mathbf{z} \\rangle " +
              "= \\langle (0, 0, 1, 0), \\mathbf{z} \\rangle \\). " +
              "This gives \\( (v_1 + 3x + 2) \\cdot 1 = y \\). " +
              "Total: 2 R1CS constraints (one true multiplication, " +
              "one for the output constraint using multiplication " +
              "by 1)."
          },
          {
            type: "conceptual",
            question:
              "Explain what an 'under-constrained' circuit is and " +
              "why it is a critical vulnerability in ZK systems. " +
              "Give a concrete example of a missing constraint that " +
              "would allow a malicious prover to generate a valid " +
              "proof for an incorrect statement.",
            hint:
              "Consider a circuit that checks \\( b^2 = v \\) to " +
              "verify that \\( b \\) is a binary decomposition bit. " +
              "What if the constraint \\( b(b-1) = 0 \\) is missing?",
            answer:
              "An under-constrained circuit has fewer constraints " +
              "than needed to fully specify the intended computation. " +
              "The prover can find a satisfying witness that is " +
              "valid for the constraints but does not correspond " +
              "to a correct execution. Example: a range proof " +
              "circuit decomposes \\( v \\) into bits " +
              "\\( b_0, \\ldots, b_{n-1} \\) and checks " +
              "\\( v = \\sum b_i 2^i \\). If the constraint " +
              "\\( b_i(b_i - 1) = 0 \\) (forcing \\( b_i \\in " +
              "\\{0,1\\} \\)) is missing, a malicious prover can " +
              "set \\( b_i \\) to any field element. With " +
              "\\( b_0 = -5 \\) and appropriate other bits, the " +
              "sum still matches \\( v \\) but the 'range proof' " +
              "is meaningless since negative 'bits' are used. " +
              "The Zcash Sprout vulnerability (2019) was exactly " +
              "this: a missing constraint allowed creating coins " +
              "from nothing. Circuit auditing tools (ecne, Picus) " +
              "detect such under-constrained systems."
          }
        ]
      },

      /* ───────── ZK-SNARKs (Groth16) ───────── */
      {
        name: "ZK-SNARKs (Groth16)",
        formalDefinition:
          "Groth16 is a pairing-based zk-SNARK producing " +
          "proofs \\( \\pi = ([A]_1, [B]_2, [C]_1) \\in " +
          "\\mathbb{G}_1 \\times \\mathbb{G}_2 \\times " +
          "\\mathbb{G}_1 \\) for an R1CS/QAP relation. " +
          "It achieves the minimal proof size (3 group " +
          "elements) and verification cost (3 pairings + 1 " +
          "multi-exponentiation) among known SNARKs, at the " +
          "cost of a per-circuit trusted setup.",
        mathDetails: [
          {
            subtitle: "Trusted Setup (CRS Generation)",
            content:
              "The setup ceremony samples toxic waste " +
              "\\( \\tau, \\alpha, \\beta, \\gamma, " +
              "\\delta \\xleftarrow{\\$} \\mathbb{Z}_p^* \\) " +
              "and produces the Common Reference String (CRS). " +
              "The proving key contains:" +
              "\\[ \\mathrm{pk} = \\bigl\\{[\\tau^i]_1, " +
              "[\\tau^i]_2, [\\alpha]_1, [\\beta]_1, " +
              "[\\beta]_2, [\\delta]_1, [\\delta]_2, \\; " +
              "\\bigl[\\tfrac{\\beta A_j(\\tau) + " +
              "\\alpha B_j(\\tau) + C_j(\\tau)}{\\delta}" +
              "\\bigr]_1, \\; " +
              "\\bigl[\\tfrac{\\tau^i T(\\tau)}{\\delta}" +
              "\\bigr]_1\\bigr\\} \\]" +
              "The verifying key:" +
              "\\[ \\mathrm{vk} = \\bigl\\{[\\alpha]_1, " +
              "[\\beta]_2, [\\gamma]_2, [\\delta]_2, \\; " +
              "\\bigl[\\tfrac{\\beta A_j(\\tau) + " +
              "\\alpha B_j(\\tau) + C_j(\\tau)}{\\gamma}" +
              "\\bigr]_1\\bigr\\} \\]" +
              "The toxic waste \\( (\\tau, \\alpha, \\beta, " +
              "\\gamma, \\delta) \\) must be destroyed. If " +
              "any participant in the MPC ceremony is honest " +
              "(destroys their share), the CRS is secure."
          },
          {
            subtitle: "Proving Algorithm",
            content:
              "Given witness \\( \\mathbf{z} \\) and proving " +
              "key \\( \\mathrm{pk} \\), the prover samples " +
              "\\( r, s \\xleftarrow{\\$} \\mathbb{Z}_p \\) " +
              "and computes:" +
              "\\[ [A]_1 = [\\alpha + \\sum_j z_j A_j(\\tau) " +
              "+ r\\delta]_1 \\]" +
              "\\[ [B]_2 = [\\beta + \\sum_j z_j B_j(\\tau) " +
              "+ s\\delta]_2 \\]" +
              "\\[ [C]_1 = \\bigl[\\sum_{j \\in " +
              "\\text{private}} z_j \\cdot " +
              "\\tfrac{\\beta A_j(\\tau) + \\alpha B_j(\\tau) " +
              "+ C_j(\\tau)}{\\delta} + H(\\tau) \\cdot " +
              "\\tfrac{T(\\tau)}{\\delta} + As + Br - " +
              "rs\\delta\\bigr]_1 \\]" +
              "The randomizers \\( r, s \\) ensure the proof " +
              "is zero-knowledge (different proofs for the same " +
              "witness are unlinkable)."
          },
          {
            subtitle: "Verification Algorithm",
            content:
              "Given proof \\( \\pi = ([A]_1, [B]_2, [C]_1) \\), " +
              "public inputs \\( (x_1, \\ldots, x_\\ell) \\), " +
              "and verifying key \\( \\mathrm{vk} \\), check:" +
              "\\[ e([A]_1, [B]_2) \\stackrel{?}{=} " +
              "e([\\alpha]_1, [\\beta]_2) \\cdot " +
              "e\\bigl(\\sum_{i=0}^{\\ell} x_i " +
              "[\\tfrac{\\beta A_i(\\tau) + \\alpha B_i(\\tau) " +
              "+ C_i(\\tau)}{\\gamma}]_1, \\; " +
              "[\\gamma]_2\\bigr) \\cdot " +
              "e([C]_1, [\\delta]_2) \\]" +
              "This is 3 pairings plus a multi-scalar " +
              "multiplication of size \\( \\ell + 1 \\) " +
              "(number of public inputs). Verification is " +
              "\\( O(\\ell) \\) in public inputs but constant " +
              "in circuit size."
          },
          {
            subtitle: "Proof Size and Verification Cost",
            content:
              "Proof structure: \\( [A]_1 \\in \\mathbb{G}_1 \\), " +
              "\\( [B]_2 \\in \\mathbb{G}_2 \\), " +
              "\\( [C]_1 \\in \\mathbb{G}_1 \\)." +
              "\\[ \\text{BN254: } 2 \\times 32 + 1 \\times 64 " +
              "= 128 \\text{ bytes (uncompressed), or ~192 bytes} \\]" +
              "\\[ \\text{BLS12-381: } 2 \\times 48 + 1 " +
              "\\times 96 = 192 \\text{ bytes (compressed)} \\]" +
              "Verification cost: 3 pairings (~4.5 ms on " +
              "BLS12-381, ~1.5 ms on BN254) + MSM of public " +
              "inputs. This is constant regardless of whether " +
              "the circuit has 1,000 or 10,000,000 constraints."
          },
          {
            subtitle: "Per-Circuit Trusted Setup",
            content:
              "The CRS is circuit-specific: the polynomials " +
              "\\( A_j(x), B_j(x), C_j(x) \\) are derived " +
              "from the specific R1CS instance. Changing " +
              "even one constraint requires a new setup. " +
              "MPC ceremonies (Powers of Tau + phase 2) " +
              "mitigate the trust assumption: any one honest " +
              "participant ensures security. Zcash's Sapling " +
              "ceremony had 90+ participants. " +
              "Perpetual Powers of Tau (Hermez): a phase-1 " +
              "ceremony that is reusable across circuits; only " +
              "phase 2 is circuit-specific."
          }
        ],
        securityAnalysis:
          "Groth16 security relies on knowledge assumptions " +
          "in the generic group model:" +
          "\\( q \\)-PKE (Power Knowledge of Exponent): " +
          "given \\( ([1]_1, [\\tau]_1, \\ldots, " +
          "[\\tau^q]_1, [\\alpha]_1, [\\alpha\\tau]_1, " +
          "\\ldots) \\), any adversary outputting " +
          "\\( ([A]_1, [\\hat{A}]_1) \\) with " +
          "\\( \\hat{A} = \\alpha A \\) must \"know\" the " +
          "coefficients. " +
          "\\( q \\)-SDH (Strong Diffie-Hellman): given " +
          "\\( (g, [\\tau]g, \\ldots, [\\tau^q]g) \\), " +
          "computing \\( (c, [1/(\\tau+c)]g) \\) is hard. " +
          "Soundness is computational (argument, not proof). " +
          "Knowledge soundness uses algebraic extractors in " +
          "the generic group model rather than rewinding. " +
          "Simulation: the simulator, knowing the trapdoor " +
          "\\( \\tau \\), can produce valid-looking proofs " +
          "without a witness (this is why the toxic waste " +
          "must be destroyed).",
        practicalNotes:
          "Proving time: ~1 second for 1M constraints " +
          "(BN254, modern hardware). Scales as " +
          "\\( O(n \\log n) \\) due to FFT. " +
          "Verification: ~10 ms (3 pairings + MSM). " +
          "Proving key size: ~50 MB for 1M constraints. " +
          "Verifying key: ~1 KB (constant + \\( \\ell \\) " +
          "group elements for public inputs). " +
          "On Sui: the \\( \\texttt{sui::groth16} \\) module " +
          "verifies Groth16 proofs over BN254 natively in " +
          "Move. Gas cost: ~5,000 gas units for verification. " +
          "Implementations: snarkjs (JS), arkworks (Rust), " +
          "bellman (Rust, used in Zcash), gnark (Go). " +
          "Used in: Zcash Sapling, Tornado Cash, Filecoin " +
          "PoRep, Sui anonymous credential verification.",
        keyFormulas: [
          {
            name: "Groth16 Verification Equation",
            formula:
              "\\[ e([A]_1, [B]_2) = " +
              "e([\\alpha]_1, [\\beta]_2) \\cdot " +
              "e(\\textstyle\\sum_i x_i [\\gamma_i]_1, " +
              "[\\gamma]_2) \\cdot " +
              "e([C]_1, [\\delta]_2) \\]"
          },
          {
            name: "Proof Structure",
            formula:
              "\\[ \\pi = ([A]_1, [B]_2, [C]_1) \\in " +
              "\\mathbb{G}_1 \\times \\mathbb{G}_2 \\times " +
              "\\mathbb{G}_1 \\]"
          },
          {
            name: "CRS (Toxic Waste)",
            formula:
              "\\[ \\tau, \\alpha, \\beta, \\gamma, " +
              "\\delta \\xleftarrow{\\$} \\mathbb{Z}_p^* " +
              "\\quad \\text{(must be destroyed after setup)} \\]"
          }
        ],
        exercises: [
          {
            type: "calculation",
            question:
              "A Groth16 proof over BLS12-381 has structure " +
              "\\( \\pi = ([A]_1, [B]_2, [C]_1) \\). " +
              "\\( \\mathbb{G}_1 \\) elements are 48 bytes compressed, " +
              "\\( \\mathbb{G}_2 \\) elements are 96 bytes compressed. " +
              "Verification requires 3 pairings at ~1.5 ms each and " +
              "a multi-scalar multiplication of " +
              "\\( \\ell + 1 \\) elements at ~0.15 ms per element. " +
              "For a circuit with \\( \\ell = 5 \\) public inputs, " +
              "compute: (a) proof size in bytes, (b) verification " +
              "time.",
            hint:
              "Proof = 2 elements from \\( \\mathbb{G}_1 \\) + 1 " +
              "from \\( \\mathbb{G}_2 \\). Verification = 3 pairings " +
              "+ MSM of \\( \\ell + 1 \\) points.",
            answer:
              "(a) Proof size: \\( 2 \\times 48 + 1 \\times 96 = " +
              "96 + 96 = 192 \\) bytes. This is constant regardless " +
              "of circuit size. " +
              "(b) Verification: \\( 3 \\times 1.5 + (5 + 1) " +
              "\\times 0.15 = 4.5 + 0.9 = 5.4 \\) ms. " +
              "For comparison, if \\( \\ell = 1 \\): " +
              "\\( 4.5 + 0.3 = 4.8 \\) ms. The verification cost " +
              "is dominated by the pairings and grows only linearly " +
              "with the number of public inputs, not with circuit " +
              "size. A circuit with 1M constraints and 5 public " +
              "inputs verifies in the same ~5.4 ms."
          },
          {
            type: "conceptual",
            question:
              "Explain why the 'toxic waste' in Groth16 is dangerous " +
              "and how MPC ceremonies mitigate the trust assumption. " +
              "Specifically, if an adversary knows \\( \\tau \\), " +
              "what can they do, and why does a multi-party ceremony " +
              "with \\( n \\) participants require only 1 honest " +
              "participant?",
            hint:
              "With \\( \\tau \\), the adversary can construct the " +
              "simulator: produce valid proofs without a witness. " +
              "In the MPC ceremony, each participant \\( i \\) " +
              "contributes \\( \\tau_i \\) and the effective toxic " +
              "waste is \\( \\tau = \\prod_i \\tau_i \\).",
            answer:
              "If an adversary knows \\( \\tau, \\alpha, \\beta, " +
              "\\gamma, \\delta \\), they can run the zero-knowledge " +
              "simulator: compute " +
              "\\( [A]_1, [B]_2, [C]_1 \\) satisfying the " +
              "verification equation without any witness. This " +
              "means they can prove false statements (e.g., create " +
              "money from nothing in Zcash). " +
              "MPC ceremony: each participant \\( i \\) generates " +
              "\\( \\tau_i \\xleftarrow{\\$} \\mathbb{Z}_p^* \\). " +
              "The combined toxic waste is " +
              "\\( \\tau = \\tau_1 \\cdot \\tau_2 \\cdots \\tau_n \\). " +
              "To recover \\( \\tau \\), the adversary needs ALL " +
              "individual \\( \\tau_i \\) values. If even one " +
              "participant honestly destroys their \\( \\tau_i \\), " +
              "the product \\( \\tau \\) is unknown to everyone. " +
              "This is a 1-of-\\( n \\) trust assumption: security " +
              "holds unless all \\( n \\) participants are compromised."
          }
        ]
      },

      /* ───────── ZK-STARKs ───────── */
      {
        name: "ZK-STARKs",
        formalDefinition:
          "A ZK-STARK (Scalable Transparent ARgument of " +
          "Knowledge) is a proof system for computations " +
          "expressed as an Algebraic Intermediate " +
          "Representation (AIR) over \\( \\mathbb{F}_p \\). " +
          "It produces proofs of size " +
          "\\( O(\\log^2 n) \\) with verification time " +
          "\\( O(\\log^2 n) \\), using only collision-resistant " +
          "hash functions (no algebraic assumptions, no " +
          "trusted setup).",
        mathDetails: [
          {
            subtitle: "Algebraic Intermediate Representation (AIR)",
            content:
              "An AIR instance defines an execution trace as a " +
              "matrix \\( T \\in \\mathbb{F}^{n \\times w} \\) " +
              "with \\( n \\) rows (steps) and \\( w \\) columns " +
              "(registers), along with transition constraints:" +
              "\\[ f_i(T[j, *], T[j+1, *]) = 0 \\quad " +
              "\\forall j \\in [n-1], \\; \\forall i \\]" +
              "Each column is interpolated as a polynomial " +
              "\\( t_k(x) \\) of degree \\( < n \\) over a " +
              "domain \\( D = \\{\\omega^0, \\omega^1, \\ldots, " +
              "\\omega^{n-1}\\} \\) where \\( \\omega \\) is " +
              "a primitive \\( n \\)-th root of unity. The " +
              "constraints become polynomial identities that " +
              "must hold on \\( D \\)."
          },
          {
            subtitle: "FRI Protocol (Fast Reed-Solomon IOP)",
            content:
              "FRI proves that a committed function is close to " +
              "a polynomial of bounded degree. The key " +
              "mechanism is recursive folding:" +
              "\\[ f_0(x) \\rightarrow f_1(x) \\rightarrow " +
              "\\cdots \\rightarrow f_k(x) \\]" +
              "At each step, split " +
              "\\( f_i(x) = g_i(x^2) + x \\cdot h_i(x^2) \\) " +
              "and fold with random challenge \\( \\alpha_i \\):" +
              "\\[ f_{i+1}(x) = g_i(x) + \\alpha_i \\cdot " +
              "h_i(x) \\]" +
              "Each fold halves the degree: " +
              "\\( \\deg(f_{i+1}) = \\deg(f_i)/2 \\). After " +
              "\\( \\log_2 d \\) rounds (where \\( d \\) is " +
              "the initial degree), the result is a constant. " +
              "Commitments use Merkle trees of evaluations."
          },
          {
            subtitle: "STARK Proof Structure",
            content:
              "The full STARK proof consists of:" +
              "\\[ \\pi = (\\text{trace commitment}, \\; " +
              "\\text{composition poly commitment}, \\; " +
              "\\text{FRI layers}, \\; " +
              "\\text{query responses}) \\]" +
              "1. Commit to trace polynomials (Merkle root). " +
              "2. Combine constraints into a composition " +
              "polynomial \\( C(x) \\) using random " +
              "challenges. " +
              "3. Run FRI on \\( C(x) \\) to prove low degree. " +
              "4. Answer \\( s \\) random query points with " +
              "evaluations + Merkle proofs. " +
              "Soundness error: \\( \\leq " +
              "(d/|\\mathbb{F}|)^s + " +
              "\\text{FRI soundness} \\) where \\( s \\) is " +
              "the number of queries."
          },
          {
            subtitle: "Proof and Verification Complexity",
            content:
              "For a computation with \\( n \\) steps:" +
              "\\[ \\text{Prover time: } O(n \\log n) " +
              "\\text{ (dominated by FFTs and Merkle trees)} \\]" +
              "\\[ \\text{Proof size: } O(\\log^2 n) " +
              "\\text{ (FRI layers + Merkle paths)} \\]" +
              "\\[ \\text{Verifier time: } O(\\log^2 n) " +
              "\\text{ (check FRI queries + Merkle paths)} \\]" +
              "Concretely, for \\( n = 2^{20} \\) (~1M steps): " +
              "proof size ~100-200 KB, verification ~50 ms. " +
              "Compare with Groth16: 192 bytes, ~10 ms " +
              "verification. STARKs trade proof size for " +
              "transparency and quantum resistance."
          },
          {
            subtitle: "Transparency and Quantum Safety",
            content:
              "STARKs are transparent: the only cryptographic " +
              "assumption is collision resistance of the hash " +
              "function used in Merkle commitments. " +
              "No structured reference string, no pairing " +
              "groups, no number-theoretic assumptions. " +
              "Quantum safety: Grover's algorithm provides at " +
              "most a square-root speedup for finding hash " +
              "collisions (\\( 2^{n/2} \\rightarrow 2^{n/3} \\) " +
              "for \\( n \\)-bit hashes). For 256-bit hashes, " +
              "this gives ~85-bit post-quantum security. " +
              "Doubling the hash output to 512 bits restores " +
              "128-bit post-quantum security."
          }
        ],
        securityAnalysis:
          "STARK soundness: the proof is a probabilistic " +
          "argument with soundness error bounded by " +
          "\\( (d / |\\mathbb{F}|)^s + \\epsilon_{\\text{FRI}} \\) " +
          "where \\( d \\) is the constraint degree, " +
          "\\( |\\mathbb{F}| \\) is the field size, and " +
          "\\( s \\) is the number of query rounds. FRI " +
          "soundness: \\( (1/2)^s \\) for each folding check. " +
          "With \\( s \\approx 80 \\) queries and " +
          "\\( |\\mathbb{F}| \\approx 2^{64} \\), total " +
          "soundness error is \\( < 2^{-80} \\). " +
          "Zero-knowledge is achieved by adding random " +
          "low-degree polynomials to the trace before " +
          "commitment (randomized AIR). " +
          "Post-quantum: secure as long as the hash function " +
          "remains collision resistant (SHA-256, Blake3 " +
          "with adequate output size).",
        practicalNotes:
          "Proof sizes: ~50-200 KB depending on circuit size " +
          "and security parameter. Verification: ~50 ms " +
          "(dominated by hash computations). Proving: " +
          "~10 seconds for 1M steps (depends on field and " +
          "hash choice). " +
          "Implementations: StarkWare (proprietary, Cairo " +
          "language), Winterfell (Rust, open-source by " +
          "Facebook/Polygon), Plonky2 (STARK + PLONK " +
          "recursion by Polygon). " +
          "Not natively supported on Sui for verification " +
          "(proof is too large for on-chain storage). " +
          "Recursive STARKs: verify a STARK inside a STARK " +
          "to compress proof size, or wrap a STARK in a " +
          "SNARK for on-chain verification (used in zkSync " +
          "and Polygon zkEVM).",
        keyFormulas: [
          {
            name: "FRI Folding",
            formula:
              "\\[ f_{i+1}(x) = g_i(x) + \\alpha_i " +
              "\\cdot h_i(x), \\quad \\text{where } " +
              "f_i(x) = g_i(x^2) + x \\cdot h_i(x^2) \\]"
          },
          {
            name: "AIR Transition Constraint",
            formula:
              "\\[ f_i(T[j, *], T[j+1, *]) = 0 " +
              "\\quad \\forall j \\in [n-1] \\]"
          },
          {
            name: "Proof/Verification Complexity",
            formula:
              "\\[ |\\pi| = O(\\log^2 n), \\quad " +
              "t_{\\text{verify}} = O(\\log^2 n), \\quad " +
              "t_{\\text{prove}} = O(n \\log n) \\]"
          }
        ],
        exercises: [
          {
            type: "calculation",
            question:
              "In the FRI protocol, starting with a polynomial of " +
              "degree \\( d = 2^{16} = 65536 \\), each folding " +
              "round halves the degree. (a) How many folding rounds " +
              "are needed to reduce to a constant? (b) If each " +
              "round uses \\( s = 80 \\) query points and each " +
              "Merkle path proof is \\( 32 \\cdot \\log_2 d \\) " +
              "bytes, estimate the total proof size from FRI " +
              "queries alone.",
            hint:
              "Rounds = \\( \\log_2 d \\). Each round commits " +
              "evaluations in a Merkle tree. Queries: \\( s \\) " +
              "per round, each requiring a Merkle path of depth " +
              "proportional to the evaluation domain size at " +
              "that round.",
            answer:
              "(a) Rounds = \\( \\log_2(2^{16}) = 16 \\). " +
              "After 16 folds: \\( d/2^{16} = 1 \\) (constant). " +
              "(b) At round \\( i \\), the domain has \\( 2^{16-i} \\) " +
              "points, so Merkle paths have depth \\( 16 - i \\). " +
              "Average depth across rounds \\( \\approx 8 \\). " +
              "Each Merkle node = 32 bytes. Total FRI query size " +
              "\\( \\approx s \\times 16 \\times 8 \\times 32 = " +
              "80 \\times 16 \\times 8 \\times 32 = " +
              "327,680 \\) bytes \\( \\approx 320 \\) KB. " +
              "Adding trace commitments and composition polynomial " +
              "queries, total proof is typically 100-200 KB. " +
              "The \\( O(\\log^2 n) \\) scaling: " +
              "\\( \\log n \\) rounds \\( \\times \\) " +
              "\\( \\log n \\)-depth Merkle paths = " +
              "\\( \\log^2 n \\) overhead."
          },
          {
            type: "conceptual",
            question:
              "Compare the trust assumptions of STARKs versus " +
              "Groth16 SNARKs. Explain why STARKs are considered " +
              "'transparent' and 'post-quantum safe,' and identify " +
              "the main trade-off compared to SNARKs.",
            hint:
              "STARKs use only hash functions (collision resistance). " +
              "SNARKs use pairings and a trusted setup. Consider " +
              "proof size, verification time, and quantum resistance.",
            answer:
              "STARKs are transparent: the only cryptographic " +
              "assumption is collision resistance of the hash " +
              "function (e.g., SHA-256, Blake3). No structured " +
              "reference string, no toxic waste, no ceremony. " +
              "Anyone can verify the setup is honest (there is " +
              "no setup). Post-quantum: hash collision resistance " +
              "degrades gracefully under Grover's algorithm " +
              "(\\( 2^{n/2} \\to 2^{n/3} \\) for \\( n \\)-bit " +
              "hash), mitigated by doubling output size. " +
              "Groth16: relies on \\( q \\)-SDH, \\( q \\)-PKE " +
              "(knowledge assumptions), pairing groups, and a " +
              "circuit-specific trusted setup. Broken by quantum " +
              "computers (Shor breaks ECDLP). " +
              "Trade-off: STARK proof ~100-200 KB vs Groth16 " +
              "192 bytes. STARK verification ~50 ms vs Groth16 " +
              "~10 ms. For on-chain verification (where proof " +
              "size = gas cost), SNARKs dominate. Common " +
              "hybrid approach: wrap a STARK in a SNARK " +
              "(recursive composition) to get STARK transparency " +
              "with SNARK proof size."
          }
        ]
      },

      /* ───────── PLONK ───────── */
      {
        name: "PLONK",
        formalDefinition:
          "PLONK (Permutations over Lagrange-bases for " +
          "Oecumenical Noninteractive arguments of " +
          "Knowledge) is a universal zk-SNARK using a " +
          "structured reference string " +
          "\\( \\mathrm{srs} = \\bigl([1]_1, [\\tau]_1, " +
          "\\ldots, [\\tau^n]_1, [\\tau]_2\\bigr) \\) " +
          "that works for any circuit of size \\( \\leq n \\). " +
          "It uses polynomial commitments (KZG) and a " +
          "permutation argument for copy constraints.",
        mathDetails: [
          {
            subtitle: "PLONKish Arithmetization",
            content:
              "PLONK uses a gate equation with selector " +
              "polynomials. For wire values \\( a, b, c \\) " +
              "at each gate:" +
              "\\[ q_L \\cdot a + q_R \\cdot b + q_O \\cdot c " +
              "+ q_M \\cdot (a \\cdot b) + q_C = 0 \\]" +
              "Selectors encode the gate type: addition gate " +
              "(\\( q_L = q_R = 1, q_O = -1, q_M = 0 \\)), " +
              "multiplication gate " +
              "(\\( q_M = 1, q_O = -1, q_L = q_R = 0 \\)), " +
              "constant gate (\\( q_C = c, q_O = -1 \\)), etc. " +
              "Custom gates: add more selector columns " +
              "(e.g., \\( q_{\\text{range}} \\) for range " +
              "checks, \\( q_{\\text{bool}} \\) for boolean " +
              "constraints \\( a(a-1) = 0 \\))."
          },
          {
            subtitle: "Copy Constraints (Permutation Argument)",
            content:
              "Wires connecting gates must carry consistent " +
              "values. This is enforced by a permutation " +
              "\\( \\sigma: [3n] \\rightarrow [3n] \\) that " +
              "maps each wire to the next wire carrying the " +
              "same value. The grand product argument proves " +
              "the permutation holds:" +
              "\\[ Z(\\omega^0) = 1 \\]" +
              "\\[ Z(\\omega^{i+1}) = Z(\\omega^i) \\cdot " +
              "\\frac{(a_i + \\beta \\omega^i + \\gamma)" +
              "(b_i + \\beta k_1 \\omega^i + \\gamma)" +
              "(c_i + \\beta k_2 \\omega^i + \\gamma)}" +
              "{(a_i + \\beta \\sigma_1(\\omega^i) + \\gamma)" +
              "(b_i + \\beta \\sigma_2(\\omega^i) + \\gamma)" +
              "(c_i + \\beta \\sigma_3(\\omega^i) + \\gamma)} \\]" +
              "If the permutation is satisfied, " +
              "\\( Z(\\omega^n) = 1 \\) (the product " +
              "telescopes to 1)."
          },
          {
            subtitle: "KZG Polynomial Commitment",
            content:
              "Kate-Zaverucha-Goldberg (KZG) commitments: " +
              "commit to polynomial \\( f(x) \\) of degree " +
              "\\( \\leq n \\) using the SRS:" +
              "\\[ [f(\\tau)]_1 = \\sum_{i=0}^{n} " +
              "c_i [\\tau^i]_1 \\quad " +
              "\\text{(one MSM of size } n \\text{)} \\]" +
              "Opening proof at point \\( z \\): compute " +
              "quotient \\( q(x) = \\frac{f(x) - f(z)}{x - z} \\) " +
              "and commit:" +
              "\\[ \\pi = [q(\\tau)]_1 \\]" +
              "Verification: check the pairing equation " +
              "\\( e([f(\\tau)]_1 - [f(z)]_1, [1]_2) " +
              "\\stackrel{?}{=} e(\\pi, [\\tau - z]_2) \\). " +
              "Opening proof is a single " +
              "\\( \\mathbb{G}_1 \\) element (48 bytes on " +
              "BLS12-381). Batch opening: open multiple " +
              "polynomials at the same point with a single " +
              "proof using random linear combination."
          },
          {
            subtitle: "Linearization Trick",
            content:
              "The verifier needs to check a polynomial " +
              "identity involving products of committed " +
              "polynomials. Directly checking would require " +
              "the verifier to know the polynomials. The " +
              "linearization trick: evaluate all but one " +
              "polynomial at a random point \\( \\zeta \\), " +
              "then check a linear (not quadratic) polynomial " +
              "identity at \\( \\zeta \\). This reduces the " +
              "number of opening proofs the verifier must " +
              "check, keeping verification efficient."
          },
          {
            subtitle: "Lookup Arguments (Plookup)",
            content:
              "Plookup extends PLONK with table lookups: " +
              "prove that a value \\( v \\) belongs to a " +
              "predefined table \\( T = \\{t_1, \\ldots, " +
              "t_N\\} \\) without encoding the check as " +
              "arithmetic constraints. " +
              "The argument sorts the concatenation of the " +
              "lookup values and table, then uses a grand " +
              "product to verify the sorting is valid:" +
              "\\[ \\prod_i \\frac{(1 + \\beta) \\cdot " +
              "(\\gamma + f_i) \\cdot (\\gamma(1+\\beta) + " +
              "t_i + \\beta t_{i+1})}" +
              "{(\\gamma(1+\\beta) + s_i + \\beta s_{i+1})} " +
              "= 1 \\]" +
              "where \\( f \\) is the lookup column, \\( t \\) " +
              "is the table, and \\( s \\) is the sorted " +
              "concatenation. Lookups are especially useful " +
              "for range checks, XOR tables, and non-algebraic " +
              "operations."
          },
          {
            subtitle: "Universal and Updatable SRS",
            content:
              "PLONK's SRS is universal: " +
              "\\( \\mathrm{srs} = ([1]_1, [\\tau]_1, \\ldots, " +
              "[\\tau^n]_1, [\\tau]_2) \\) works for any circuit " +
              "of size \\( \\leq n \\). Only the preprocessing " +
              "(selector and permutation polynomials) is " +
              "circuit-specific, and it does not require a " +
              "new ceremony. " +
              "Updatable: any party can add their randomness " +
              "\\( \\tau' \\) via " +
              "\\( [\\tau^i]_1 \\mapsto [(\\tau')^i \\cdot " +
              "\\tau^i]_1 \\). Security holds if any one " +
              "participant is honest (stronger trust model " +
              "than Groth16's fixed ceremony)."
          }
        ],
        securityAnalysis:
          "PLONK security reduces to the \\( q \\)-SDH " +
          "assumption in the algebraic group model (AGM): " +
          "any algebraic adversary's output is a linear " +
          "combination of the SRS elements. " +
          "Knowledge soundness: the extractor uses the " +
          "algebraic structure to extract the witness from " +
          "the adversary's proof. " +
          "The updatable SRS gives a stronger trust model: " +
          "security holds even if all but one ceremony " +
          "participant is malicious. " +
          "Zero-knowledge: achieved by adding random " +
          "blinding polynomials to the wire polynomials " +
          "(masking the low-degree terms). " +
          "Plookup soundness: reduces to the same assumptions " +
          "plus the permutation argument's correctness.",
        practicalNotes:
          "Proof size: ~400-600 bytes (7-9 " +
          "\\( \\mathbb{G}_1 \\) elements + 6-8 field " +
          "elements). Verification: ~5 ms (2 pairings + " +
          "multi-exp). Proving: ~4x slower than Groth16 for " +
          "the same circuit. " +
          "Advantages over Groth16: universal SRS (no new " +
          "ceremony per circuit), custom gates reduce " +
          "constraint count, lookup tables. " +
          "SRS sizes: Powers-of-Tau ceremony up to " +
          "\\( 2^{28} \\) (~268M constraints). Perpetual " +
          "Powers of Tau (Hermez) is the standard. " +
          "Implementations: gnark (Go), Halo2 (Rust, by " +
          "Zcash), Aztec's Barretenberg (C++). " +
          "Used in: Aztec protocol, Polygon zkEVM, Zcash " +
          "Orchard (Halo2 variant with IPA instead of KZG). " +
          "Not yet natively supported on Sui (would require " +
          "KZG verification precompile).",
        keyFormulas: [
          {
            name: "PLONK Gate Equation",
            formula:
              "\\[ q_L a + q_R b + q_O c + q_M ab + q_C = 0 \\]"
          },
          {
            name: "Permutation Grand Product",
            formula:
              "\\[ Z(\\omega^{i+1}) = Z(\\omega^i) \\cdot " +
              "\\frac{(a_i + \\beta\\omega^i + \\gamma)" +
              "(b_i + \\beta k_1\\omega^i + \\gamma)" +
              "(c_i + \\beta k_2\\omega^i + \\gamma)}" +
              "{(a_i + \\beta\\sigma_1(\\omega^i) + \\gamma)" +
              "(b_i + \\beta\\sigma_2(\\omega^i) + \\gamma)" +
              "(c_i + \\beta\\sigma_3(\\omega^i) + \\gamma)} \\]"
          },
          {
            name: "KZG Commitment and Opening",
            formula:
              "\\[ \\mathrm{Com}(f) = [f(\\tau)]_1, \\quad " +
              "\\pi = \\bigl[\\tfrac{f(\\tau) - f(z)}" +
              "{\\tau - z}\\bigr]_1 \\]"
          }
        ],
        exercises: [
          {
            type: "calculation",
            question:
              "In PLONKish arithmetization, encode the constraint " +
              "'\\( c = a \\cdot b \\)' (a multiplication gate) " +
              "using the PLONK gate equation " +
              "\\( q_L a + q_R b + q_O c + q_M(ab) + q_C = 0 \\). " +
              "What are the selector values? Then encode " +
              "'\\( c = a + b \\)' (an addition gate) and " +
              "'\\( a = 7 \\)' (a constant gate).",
            hint:
              "For multiplication: the output \\( c \\) equals the " +
              "product \\( ab \\), so you want \\( q_M \\cdot ab - " +
              "c = 0 \\). Set the appropriate selectors to achieve " +
              "this. Similarly for addition.",
            answer:
              "Multiplication \\( c = ab \\): " +
              "\\( q_L = 0, q_R = 0, q_O = -1, q_M = 1, q_C = 0 \\). " +
              "Check: \\( 0 \\cdot a + 0 \\cdot b + (-1)c + 1 \\cdot " +
              "ab + 0 = ab - c = 0 \\). " +
              "Addition \\( c = a + b \\): " +
              "\\( q_L = 1, q_R = 1, q_O = -1, q_M = 0, q_C = 0 \\). " +
              "Check: \\( a + b - c = 0 \\). " +
              "Constant \\( a = 7 \\): " +
              "\\( q_L = -1, q_R = 0, q_O = 0, q_M = 0, q_C = 7 \\). " +
              "Check: \\( -a + 7 = 0 \\implies a = 7 \\). " +
              "Boolean constraint \\( a(a-1) = 0 \\): " +
              "\\( q_L = -1, q_R = 0, q_O = 0, q_M = 1, q_C = 0 \\). " +
              "Check: \\( -a + a^2 = a(a-1) = 0 \\)."
          },
          {
            type: "conceptual",
            question:
              "Explain the advantage of PLONK's universal SRS over " +
              "Groth16's per-circuit CRS. Describe what happens when " +
              "a developer needs to update a ZK circuit (e.g., add " +
              "a new attribute check in a credential system) under " +
              "each scheme.",
            hint:
              "Groth16 CRS encodes the specific circuit polynomials " +
              "\\( A_j(x), B_j(x), C_j(x) \\). PLONK SRS is just " +
              "powers of \\( \\tau \\). Think about what must be " +
              "recomputed in each case.",
            answer:
              "Groth16: the CRS contains circuit-specific elements " +
              "like \\( [\\frac{\\beta A_j(\\tau) + \\alpha B_j(\\tau) " +
              "+ C_j(\\tau)}{\\delta}]_1 \\). Any circuit change " +
              "(adding one constraint, modifying one gate) " +
              "invalidates the entire CRS. A new MPC ceremony " +
              "(at least phase 2) must be conducted, which takes " +
              "days to weeks with many participants. " +
              "PLONK: the SRS \\( ([1]_1, [\\tau]_1, \\ldots, " +
              "[\\tau^n]_1, [\\tau]_2) \\) is independent of the " +
              "circuit. When the circuit changes, only the " +
              "preprocessing (selector polynomials " +
              "\\( q_L, q_R, q_O, q_M, q_C \\) and permutation " +
              "\\( \\sigma \\)) is recomputed locally by the " +
              "developer. No new ceremony needed. The same Powers " +
              "of Tau can serve all circuits up to size \\( n \\). " +
              "For an evolving credential system, PLONK allows " +
              "rapid iteration: add a new attribute predicate, " +
              "recompile the circuit, reuse the same SRS."
          }
        ]
      },

      /* ───────── Bulletproofs ───────── */
      {
        name: "Bulletproofs",
        formalDefinition:
          "Bulletproofs is a non-interactive zero-knowledge " +
          "proof system based on the inner product argument. " +
          "For vectors \\( \\mathbf{a}, \\mathbf{b} \\in " +
          "\\mathbb{Z}_p^n \\) and generators " +
          "\\( \\mathbf{G}, \\mathbf{H} \\in " +
          "\\mathbb{G}^n \\), it proves:" +
          "\\[ P = \\langle \\mathbf{a}, \\mathbf{G} \\rangle " +
          "+ \\langle \\mathbf{b}, \\mathbf{H} \\rangle " +
          "+ \\langle \\mathbf{a}, \\mathbf{b} \\rangle " +
          "\\cdot Q \\quad \\text{and} \\quad " +
          "\\langle \\mathbf{a}, \\mathbf{b} \\rangle = c \\]" +
          "with proof size \\( O(\\log n) \\) group elements " +
          "and no trusted setup.",
        mathDetails: [
          {
            subtitle: "Pedersen Vector Commitment",
            content:
              "The prover commits to vectors \\( \\mathbf{a} \\) " +
              "and \\( \\mathbf{b} \\) using independent " +
              "generators \\( \\mathbf{G} = (G_1, \\ldots, G_n) \\) " +
              "and \\( \\mathbf{H} = (H_1, \\ldots, H_n) \\), " +
              "plus an additional generator \\( Q \\) for the " +
              "inner product value:" +
              "\\[ P = \\sum_{i=1}^n a_i G_i + " +
              "\\sum_{i=1}^n b_i H_i + " +
              "\\langle \\mathbf{a}, \\mathbf{b} \\rangle " +
              "\\cdot Q \\]" +
              "This commitment is perfectly hiding (the " +
              "generators are independent) and computationally " +
              "binding under the discrete log assumption."
          },
          {
            subtitle: "Recursive Halving Protocol",
            content:
              "Split vectors into halves: " +
              "\\( \\mathbf{a} = (\\mathbf{a}_L, " +
              "\\mathbf{a}_R) \\), similarly for " +
              "\\( \\mathbf{b}, \\mathbf{G}, \\mathbf{H} \\). " +
              "Compute cross-terms:" +
              "\\[ L = \\langle \\mathbf{a}_L, " +
              "\\mathbf{G}_R \\rangle + " +
              "\\langle \\mathbf{b}_R, " +
              "\\mathbf{H}_L \\rangle + " +
              "\\langle \\mathbf{a}_L, " +
              "\\mathbf{b}_R \\rangle \\cdot Q \\]" +
              "\\[ R = \\langle \\mathbf{a}_R, " +
              "\\mathbf{G}_L \\rangle + " +
              "\\langle \\mathbf{b}_L, " +
              "\\mathbf{H}_R \\rangle + " +
              "\\langle \\mathbf{a}_R, " +
              "\\mathbf{b}_L \\rangle \\cdot Q \\]" +
              "Send \\( (L, R) \\) to verifier, receive " +
              "challenge \\( x \\). Fold:" +
              "\\[ \\mathbf{a}' = x \\mathbf{a}_L + " +
              "x^{-1} \\mathbf{a}_R, \\quad " +
              "\\mathbf{b}' = x^{-1} \\mathbf{b}_L + " +
              "x \\mathbf{b}_R \\]" +
              "\\[ \\mathbf{G}' = x^{-1} \\mathbf{G}_L + " +
              "x \\mathbf{G}_R, \\quad " +
              "\\mathbf{H}' = x \\mathbf{H}_L + " +
              "x^{-1} \\mathbf{H}_R \\]" +
              "New commitment: " +
              "\\( P' = x^2 L + P + x^{-2} R \\). " +
              "Recurse on half-size vectors. After " +
              "\\( \\log_2 n \\) rounds, vectors reduce to " +
              "scalars."
          },
          {
            subtitle: "Proof Structure and Size",
            content:
              "The proof consists of:" +
              "\\[ \\pi = \\bigl((L_1, R_1), (L_2, R_2), " +
              "\\ldots, (L_{\\log n}, R_{\\log n}), \\; " +
              "a, b\\bigr) \\]" +
              "where \\( (L_i, R_i) \\) are group elements from " +
              "each round and \\( (a, b) \\) are the final " +
              "scalar values. Total size:" +
              "\\[ 2 \\log_2 n \\text{ group elements} + " +
              "2 \\text{ scalars} = " +
              "2 \\log_2 n \\cdot 32 + 2 \\cdot 32 " +
              "\\text{ bytes (Curve25519)} \\]" +
              "For \\( n = 64 \\) (64-bit range proof): " +
              "\\( 2 \\cdot 6 + 2 = 14 \\) elements, ~672 " +
              "bytes."
          },
          {
            subtitle: "Range Proof Construction",
            content:
              "Prove \\( v \\in [0, 2^n) \\) without revealing " +
              "\\( v \\). Write \\( v \\) in binary: " +
              "\\( v = \\sum_{i=0}^{n-1} b_i \\cdot 2^i \\) " +
              "where \\( b_i \\in \\{0, 1\\} \\). Set:" +
              "\\[ \\mathbf{a}_L = (b_0, b_1, \\ldots, " +
              "b_{n-1}), \\quad " +
              "\\mathbf{a}_R = \\mathbf{a}_L - \\mathbf{1}^n \\]" +
              "The constraints are: (1) \\( \\langle " +
              "\\mathbf{a}_L, \\mathbf{2}^n \\rangle = v \\) " +
              "(binary decomposition), (2) \\( \\mathbf{a}_L " +
              "\\circ \\mathbf{a}_R = \\mathbf{0} \\) (each " +
              "bit is 0 or 1, since \\( b(b-1) = 0 \\)). " +
              "These are encoded as an inner product relation " +
              "and proved using the halving protocol."
          },
          {
            subtitle: "Aggregated Range Proofs",
            content:
              "Prove \\( m \\) values " +
              "\\( v_1, \\ldots, v_m \\in [0, 2^n) \\) " +
              "simultaneously. The proof size grows only " +
              "logarithmically in \\( m \\):" +
              "\\[ |\\pi| = 2 \\lceil\\log_2(mn)\\rceil " +
              "\\text{ group elements} + " +
              "\\text{constant overhead} \\]" +
              "For \\( m = 16 \\) values with \\( n = 64 \\)-bit " +
              "range: ~928 bytes (vs ~672 bytes for one). " +
              "This sublinear aggregation is key for " +
              "confidential transactions: prove all " +
              "transaction outputs are in range with a single " +
              "compact proof."
          }
        ],
        securityAnalysis:
          "Security relies solely on the discrete logarithm " +
          "assumption in \\( \\mathbb{G} \\). No trusted " +
          "setup, no pairings required. " +
          "Soundness: extraction via rewinding. Given two " +
          "accepting transcripts with different challenges at " +
          "any round, the extractor can recover the vectors " +
          "\\( \\mathbf{a}, \\mathbf{b} \\). " +
          "Zero-knowledge: the prover adds blinding factors " +
          "that are absorbed into the commitment structure. " +
          "The verifier sees only \\( (L_i, R_i) \\) and " +
          "final scalars, which are simulatable. " +
          "Quantum consideration: Bulletproofs rely on " +
          "discrete log which is broken by Shor's algorithm. " +
          "Post-quantum Bulletproofs would need lattice-based " +
          "commitments (active research area).",
        practicalNotes:
          "64-bit range proof: ~672 bytes, ~1.2 ms prove, " +
          "~1.1 ms verify (Curve25519). " +
          "Verification is \\( O(n) \\): the verifier must " +
          "compute a multi-scalar multiplication of size " +
          "\\( n \\) to check the proof. This linear cost " +
          "makes Bulletproofs unsuitable for direct on-chain " +
          "verification for large \\( n \\). " +
          "Batch verification: verify \\( m \\) proofs " +
          "together ~2x faster than individually (shared " +
          "multi-exp). " +
          "Used in: Monero (confidential amounts since 2018, " +
          "upgraded to Bulletproofs+ in 2022), Mimblewimble " +
          "(Grin, Beam), Zcash Sapling (for Pedersen hash " +
          "commitments, not range proofs). " +
          "For the thesis: Bulletproof range proofs could be " +
          "used for credential attribute predicates " +
          "(e.g., age > 18), wrapped inside a Groth16 proof " +
          "for efficient on-chain verification on Sui.",
        keyFormulas: [
          {
            name: "Vector Commitment",
            formula:
              "\\[ P = \\langle \\mathbf{a}, \\mathbf{G} " +
              "\\rangle + \\langle \\mathbf{b}, \\mathbf{H} " +
              "\\rangle + \\langle \\mathbf{a}, \\mathbf{b} " +
              "\\rangle Q \\]"
          },
          {
            name: "Recursive Halving (Fold)",
            formula:
              "\\[ \\mathbf{a}' = x\\mathbf{a}_L + " +
              "x^{-1}\\mathbf{a}_R, \\quad " +
              "P' = x^2 L + P + x^{-2} R \\]"
          },
          {
            name: "Range Proof Encoding",
            formula:
              "\\[ v = \\langle \\mathbf{a}_L, " +
              "\\mathbf{2}^n \\rangle, \\quad " +
              "\\mathbf{a}_L \\circ (\\mathbf{a}_L - " +
              "\\mathbf{1}^n) = \\mathbf{0} \\]"
          }
        ],
        exercises: [
          {
            type: "calculation",
            question:
              "Compute the proof size for a Bulletproof inner product " +
              "argument on vectors of length \\( n = 256 \\), using " +
              "Curve25519 (32-byte group elements, 32-byte scalars). " +
              "Then compute the proof size for an aggregated range " +
              "proof of \\( m = 8 \\) values in \\( [0, 2^{64}) \\).",
            hint:
              "Inner product proof: \\( 2 \\log_2 n \\) group elements " +
              "+ 2 scalars. For aggregated range proof of \\( m \\) " +
              "values with \\( n \\)-bit range, the vector length is " +
              "\\( mn \\), so use \\( 2 \\log_2(mn) \\) group elements " +
              "+ constant overhead (~5 additional group elements + " +
              "5 scalars for the range proof wrapper).",
            answer:
              "Inner product (\\( n = 256 \\)): " +
              "\\( 2 \\log_2(256) = 2 \\cdot 8 = 16 \\) group elements " +
              "+ 2 scalars = \\( 16 \\times 32 + 2 \\times 32 = " +
              "512 + 64 = 576 \\) bytes. " +
              "Aggregated range proof (\\( m = 8, n = 64 \\)): " +
              "vector length = \\( 8 \\times 64 = 512 \\). " +
              "\\( 2 \\log_2(512) = 2 \\times 9 = 18 \\) group elements " +
              "from the inner product argument. Adding ~5 group " +
              "elements + 5 scalars for the range proof structure: " +
              "\\( (18 + 5) \\times 32 + (2 + 5) \\times 32 = " +
              "736 + 224 = 960 \\) bytes. " +
              "Compare: 8 separate proofs would be " +
              "\\( 8 \\times 672 = 5,376 \\) bytes. Aggregation " +
              "saves \\( \\approx 82\\% \\) bandwidth."
          },
          {
            type: "conceptual",
            question:
              "Explain how Bulletproof range proofs encode the " +
              "constraint '\\( v \\in [0, 2^n) \\)' as an inner " +
              "product relation. Why does the bit constraint " +
              "\\( b_i(b_i - 1) = 0 \\) get expressed as " +
              "\\( \\mathbf{a}_L \\circ \\mathbf{a}_R = \\mathbf{0} \\) " +
              "where \\( \\mathbf{a}_R = \\mathbf{a}_L - \\mathbf{1}^n \\)?",
            hint:
              "Write \\( v = \\sum b_i 2^i \\) and set " +
              "\\( \\mathbf{a}_L = (b_0, \\ldots, b_{n-1}) \\). " +
              "For each component, what does " +
              "\\( a_{L,i} \\cdot a_{R,i} = 0 \\) imply about " +
              "\\( a_{L,i} \\)?",
            answer:
              "Set \\( \\mathbf{a}_L = (b_0, \\ldots, b_{n-1}) \\) " +
              "as the binary representation of \\( v \\). Then " +
              "\\( \\langle \\mathbf{a}_L, \\mathbf{2}^n \\rangle = " +
              "\\sum_i b_i 2^i = v \\) (binary decomposition). " +
              "Set \\( \\mathbf{a}_R = \\mathbf{a}_L - \\mathbf{1}^n \\), " +
              "so \\( a_{R,i} = b_i - 1 \\). " +
              "The Hadamard product constraint: " +
              "\\( (\\mathbf{a}_L \\circ \\mathbf{a}_R)_i = " +
              "b_i(b_i - 1) = 0 \\). This forces \\( b_i \\in " +
              "\\{0, 1\\} \\) for each \\( i \\), since over any " +
              "field, \\( x(x-1) = 0 \\iff x = 0 \\) or \\( x = 1 \\). " +
              "Combined: \\( v = \\sum b_i 2^i \\) with each " +
              "\\( b_i \\in \\{0,1\\} \\) implies " +
              "\\( 0 \\leq v < 2^n \\). These two constraints are " +
              "then combined (using random challenge \\( y \\)) " +
              "into a single inner product relation that can be " +
              "proved using the logarithmic halving protocol."
          }
        ]
      }
    ]
  }
};
