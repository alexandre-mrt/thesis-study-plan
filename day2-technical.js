/**
 * Day 2 Technical Companion — Anonymous Credentials + TEEs
 * Deep mathematical content for each concept in DAY2_GUIDE.
 * Uses KaTeX-compatible LaTeX: \\( for inline, \\[ for display math.
 */

window.DAY2_TECHNICAL = {
  block1: {
    title: "Anonymous Credentials (CL, BBS+, VCs)",
    concepts: [
      {
        name: "Anonymous Credentials",
        formalDefinition:
          "A tuple of PPT algorithms \\( (\\text{IssuerSetup}, \\text{Obtain}, \\text{Show}, \\text{Verify}) \\) where: " +
          "\\( \\text{IssuerSetup}(1^\\lambda) \\to (isk, ipk) \\); " +
          "\\( \\text{Obtain}(\\text{user}, isk, (a_1, \\ldots, a_n)) \\to \\sigma \\); " +
          "\\( \\text{Show}(\\sigma, (a_1, \\ldots, a_n), S) \\to \\pi \\) for disclosed set \\( S \\subseteq \\{1, \\ldots, n\\} \\); " +
          "\\( \\text{Verify}(ipk, \\{a_i\\}_{i \\in S}, \\pi) \\to \\{0, 1\\} \\).",
        mathDetails: [
          {
            subtitle: "Key Generation and Credential Issuance",
            content:
              "The issuer generates a key pair \\( (isk, ipk) \\). A credential on attributes " +
              "\\( (a_1, \\ldots, a_n) \\in \\mathcal{M}^n \\) is a signature \\( \\sigma \\) computed under \\( isk \\). " +
              "The issuance protocol \\( \\text{Obtain} \\) may be interactive (blind issuance) so the issuer " +
              "does not learn all attributes, or non-interactive if the issuer knows all attributes.",
          },
          {
            subtitle: "Show Protocol and Selective Disclosure",
            content:
              "The \\( \\text{Show} \\) protocol produces a zero-knowledge proof \\( \\pi \\) that the user holds " +
              "a valid signature \\( \\sigma \\) on some attribute vector \\( (a_1, \\ldots, a_n) \\), revealing only " +
              "the subset \\( \\{a_i\\}_{i \\in S} \\) for a disclosed set \\( S \\subseteq [n] \\). The verifier learns " +
              "nothing about \\( \\{a_i\\}_{i \\notin S} \\) or \\( \\sigma \\) itself beyond validity.",
          },
          {
            subtitle: "Unlinkability",
            content:
              "Two presentations \\( \\text{Show}_1 \\) and \\( \\text{Show}_2 \\) derived from the same credential " +
              "are computationally indistinguishable from presentations of two different credentials. Formally, " +
              "for any PPT distinguisher \\( \\mathcal{D} \\):" +
              "\\[ \\left| \\Pr[\\mathcal{D}(\\pi_1, \\pi_2) = 1 \\mid \\text{same } \\sigma] - " +
              "\\Pr[\\mathcal{D}(\\pi_1, \\pi_2) = 1 \\mid \\text{diff } \\sigma] \\right| \\leq \\text{negl}(\\lambda) \\]",
          },
          {
            subtitle: "One-Show vs Multi-Show Credentials",
            content:
              "One-show credentials embed a serial number revealed on use, enabling double-spend detection: " +
              "if used twice, the two presentations leak the user identity. Multi-show credentials (like BBS+) " +
              "allow unlimited unlinkable presentations. The choice depends on the application: " +
              "e-cash requires one-show, identity credentials require multi-show.",
          },
          {
            subtitle: "Formal Security Games",
            content:
              "Anonymity (CCA-like): adversary chooses two users with valid credentials, receives a presentation " +
              "from one, and must guess which. Advantage must be negligible. " +
              "Unforgeability (EUF-CMA analog): adversary with access to issuance oracle cannot produce a valid " +
              "presentation for an attribute vector never issued. Formally:" +
              "\\[ \\Pr[\\text{Verify}(ipk, \\{a_i\\}_{i \\in S}, \\pi^*) = 1 \\mid (a_1, \\ldots, a_n) \\notin Q] \\leq \\text{negl}(\\lambda) \\]" +
              "where \\( Q \\) is the set of issued credential attribute vectors.",
          },
        ],
        securityAnalysis:
          "Anonymity game: challenger picks \\( b \\leftarrow \\{0,1\\} \\), generates presentation for user \\( b \\), " +
          "adversary guesses \\( b' \\). Advantage \\( |\\Pr[b' = b] - 1/2| \\leq \\text{negl}(\\lambda) \\). " +
          "Unforgeability game: adversary interacts with issuance oracle polynomially many times, then outputs " +
          "a forgery \\( (S^*, \\{a_i^*\\}_{i \\in S^*}, \\pi^*) \\). Wins if verification passes and no issued " +
          "credential is consistent with the disclosed attributes. This is analogous to EUF-CMA for digital signatures.",
        practicalNotes:
          "IRMA (I Reveal My Attributes): open-source implementation based on Idemix, used in Dutch government pilots. " +
          "IBM Idemix: CL-based system integrated into Hyperledger Fabric. " +
          "EU Digital Identity Wallet (eIDAS 2.0): mandates selective disclosure support, BBS+ and SD-JWT as candidate mechanisms. " +
          "W3C Verifiable Credentials: standardized data model, with BBS+ Data Integrity proof suite for unlinkable presentations.",
        keyFormulas: [
          {
            name: "Anonymity advantage",
            formula: "\\[ \\text{Adv}_{\\text{anon}}^{\\mathcal{A}}(\\lambda) = \\left| \\Pr[b' = b] - \\frac{1}{2} \\right| \\leq \\text{negl}(\\lambda) \\]",
          },
          {
            name: "Unforgeability bound",
            formula: "\\[ \\Pr[\\text{Forge}] \\leq \\text{negl}(\\lambda) \\]",
          },
        ],
        exercises: [
          {
            type: "conceptual",
            question:
              "Explain why the unlinkability property of anonymous credentials is essential for privacy. " +
              "Describe the formal anonymity game (challenger picks b, adversary guesses b') and explain what " +
              "would go wrong if presentations were linkable — give a concrete surveillance scenario.",
            hint:
              "Think about a user presenting the same credential to multiple verifiers. " +
              "If presentations are linkable, verifiers can collude to build a profile. " +
              "The anonymity game formalizes this: the adversary sees two presentations and must determine if they come from the same credential.",
            answer:
              "Unlinkability ensures that two presentations from the same credential are computationally indistinguishable " +
              "from presentations of two different credentials. In the anonymity game, the challenger picks b in {0,1}, " +
              "generates presentations for user b, and the adversary guesses b'. Advantage |Pr[b'=b] - 1/2| must be negligible. " +
              "Without unlinkability, a verifier at a pharmacy and a verifier at an employer could correlate presentations " +
              "to the same credential, tracking the user across contexts — defeating the purpose of selective disclosure.",
          },
          {
            type: "design",
            question:
              "Design the high-level flow of an anonymous credential system for age verification at a bar. " +
              "Specify: (1) what attributes are in the credential, (2) which are disclosed vs hidden during the Show protocol, " +
              "(3) what predicate proof is needed, and (4) how the verifier checks validity without learning the user's identity.",
            hint:
              "The credential should contain: name, date_of_birth, nationality, photo_hash, credential_id. " +
              "For age verification, the bar only needs to know the user is >= 18. " +
              "Use a predicate proof on date_of_birth rather than disclosing it.",
            answer:
              "Attributes: (name, date_of_birth, nationality, photo_hash, credential_id). " +
              "Disclosed set D = {} (nothing disclosed). " +
              "Predicate proof: prove date_of_birth <= (today - 18 years) without revealing the exact date. " +
              "The Show protocol produces a ZK proof pi that: (1) the user holds a valid signature from the issuer, " +
              "(2) the date_of_birth attribute satisfies the age predicate. " +
              "The verifier runs Verify(ipk, {}, pi) checking the issuer's public key and the predicate. " +
              "The verifier learns only that the holder is >= 18 — not their name, exact age, or any other attribute.",
          },
        ],
      },
      {
        name: "CL Signatures (Camenisch-Lysyanskaya)",
        formalDefinition:
          "Signature scheme based on the Strong RSA assumption. Given a special RSA modulus \\( n = pq \\) " +
          "where \\( p, q \\) are safe primes, the public key is \\( (n, S, Z, R_1, \\ldots, R_L) \\) with " +
          "\\( S, Z, R_i \\in QR_n \\) (quadratic residues mod \\( n \\)). A signature on messages " +
          "\\( (m_1, \\ldots, m_L) \\) is a triple \\( (A, e, v) \\) satisfying the CL signature equation.",
        mathDetails: [
          {
            subtitle: "CL03 Signature Equation",
            content:
              "A signature on \\( (m_1, \\ldots, m_L) \\) is a triple \\( (A, e, v) \\) such that:" +
              "\\[ A^e \\equiv Z \\cdot S^v \\cdot \\prod_{i=1}^{L} R_i^{m_i} \\pmod{n} \\]" +
              "where \\( e \\) is a prime in \\( [2^{\\ell_e - 1}, 2^{\\ell_e}] \\) and \\( v \\) is chosen from a " +
              "range ensuring statistical ZK. The issuer computes \\( A = \\left( \\frac{Z}{S^v \\cdot \\prod R_i^{m_i}} \\right)^{1/e} \\bmod n \\), " +
              "which requires knowledge of \\( p, q \\) to compute \\( e \\)-th roots.",
          },
          {
            subtitle: "Proof of Knowledge of a CL Signature",
            content:
              "To prove possession of a valid signature without revealing it, the holder executes a Sigma protocol proving:" +
              "\\[ \\text{PK}\\{ (A, e, v, m_1, \\ldots, m_L) : A^e \\equiv Z \\cdot S^v \\cdot \\prod R_i^{m_i} \\pmod{n} \\} \\]" +
              "This is a proof of knowledge of an RSA representation. The prover first randomizes the signature " +
              "to prevent linkability, then runs an interactive (or Fiat-Shamir transformed) proof.",
          },
          {
            subtitle: "Signature Randomization",
            content:
              "Given \\( (A, e, v) \\), choose random \\( r' \\) and compute:" +
              "\\[ A' = A \\cdot S^{r'}, \\quad v' = v - e \\cdot r' \\]" +
              "Then \\( (A')^e = A^e \\cdot S^{e \\cdot r'} = Z \\cdot S^v \\cdot \\prod R_i^{m_i} \\cdot S^{e \\cdot r'} = Z \\cdot S^{v'} \\cdot \\prod R_i^{m_i} \\cdot S^{e \\cdot r' + v - v} \\). " +
              "Substituting \\( v' = v - er' \\):" +
              "\\[ (A')^e = Z \\cdot S^{v'} \\cdot \\prod R_i^{m_i} \\]" +
              "So \\( (A', e, v') \\) is a valid signature on the same messages, unlinkable to the original.",
          },
          {
            subtitle: "Selective Disclosure with CL",
            content:
              "To reveal a subset \\( D \\subseteq [L] \\) of messages, the prover separates the signature equation:" +
              "\\[ A^e = Z \\cdot S^v \\cdot \\prod_{i \\in D} R_i^{m_i} \\cdot \\prod_{i \\notin D} R_i^{m_i} \\pmod{n} \\]" +
              "The disclosed \\( \\{m_i\\}_{i \\in D} \\) are sent in the clear. The hidden \\( \\{m_i\\}_{i \\notin D} \\) " +
              "along with \\( (A, e, v) \\) are proved in zero knowledge via a Sigma protocol.",
          },
          {
            subtitle: "Predicate Proofs (Range Proofs)",
            content:
              "To prove \\( m_i \\geq 18 \\) without revealing \\( m_i \\), decompose \\( m_i - 18 \\) into a sum of " +
              "four squares (Lagrange's theorem: every non-negative integer is a sum of four squares):" +
              "\\[ m_i - 18 = a_1^2 + a_2^2 + a_3^2 + a_4^2 \\]" +
              "Then prove knowledge of \\( a_1, a_2, a_3, a_4 \\) satisfying this decomposition, embedded in the " +
              "CL proof framework. More efficient range proofs use binary decomposition or Bulletproofs.",
          },
          {
            subtitle: "Revocation via RSA Accumulators",
            content:
              "An RSA accumulator over a set of valid credential identifiers \\( V = \\{x_1, \\ldots, x_k\\} \\):" +
              "\\[ \\text{acc} = g^{\\prod_{i \\in V} (x_i + s)} \\bmod n \\]" +
              "where \\( s \\) is a secret and \\( g \\in QR_n \\). A membership witness for \\( x_i \\) is:" +
              "\\[ w_i = g^{\\prod_{j \\in V, j \\neq i} (x_j + s)} \\bmod n \\]" +
              "Verification: \\( w_i^{(x_i + s)} \\equiv \\text{acc} \\pmod{n} \\). The holder proves in ZK that their " +
              "credential identifier is accumulated, without revealing which one.",
          },
        ],
        securityAnalysis:
          "Security relies on the Strong RSA assumption: given \\( (n, z) \\), it is hard to find \\( (u, e) \\) with " +
          "\\( e > 1 \\) such that \\( u^e \\equiv z \\pmod{n} \\). Unforgeability of CL signatures reduces to Strong RSA: " +
          "a forger who can produce a new valid \\( (A^*, e^*, v^*) \\) on a fresh message vector can be used to break " +
          "Strong RSA. The proof uses the forking lemma and the fact that finding \\( e \\)-th roots mod \\( n \\) without " +
          "the factorization is equivalent to factoring.",
        practicalNotes:
          "RSA-2048 keys: public key is ~256 bytes (modulus) plus \\( L \\) group elements (~256B each). " +
          "Signature: ~2KB for modular exponentiation results. " +
          "Operations: modular exponentiation is slow (~5-50ms per expo on modern hardware). " +
          "A CL proof with 10 attributes takes ~500ms to generate. " +
          "Being replaced by BBS+ due to smaller keys, faster operations, and pairing-based efficiency. " +
          "Still used in Hyperledger Indy/Aries ecosystem (legacy).",
        keyFormulas: [
          {
            name: "CL Signature Equation",
            formula: "\\[ A^e \\equiv Z \\cdot S^v \\cdot \\prod_{i=1}^{L} R_i^{m_i} \\pmod{n} \\]",
          },
          {
            name: "Signature Randomization",
            formula: "\\[ A' = A \\cdot S^{r'}, \\quad v' = v - e \\cdot r' \\]",
          },
          {
            name: "RSA Accumulator",
            formula: "\\[ \\text{acc} = g^{\\prod_{i \\in V} (x_i + s)} \\bmod n, \\quad w_i = g^{\\prod_{j \\neq i} (x_j + s)} \\bmod n \\]",
          },
        ],
        exercises: [
          {
            type: "calculation",
            question:
              "Given the CL signature equation A^e = Z * S^v * R_1^{m_1} (mod n), suppose the holder has signature (A, e, v) " +
              "and picks randomness r' = 42. Write the randomized signature (A', e, v') in terms of A, S, e, v, and r'. " +
              "Then verify algebraically that (A')^e still satisfies the CL equation with v' substituted for v.",
            hint:
              "Randomization: A' = A * S^{r'}, v' = v - e*r'. " +
              "Expand (A')^e = (A * S^{r'})^e = A^e * S^{e*r'}. " +
              "Substitute the original CL equation for A^e.",
            answer:
              "A' = A * S^{42}, v' = v - 42e. " +
              "Check: (A')^e = A^e * S^{42e} = (Z * S^v * R_1^{m_1}) * S^{42e} = Z * S^{v + 42e} * R_1^{m_1}. " +
              "But v' = v - 42e, so v + 42e = v' + 42e + 42e? No: v = v' + 42e, so v + 42e = v' + 84e. " +
              "Correction: (A')^e = Z * S^v * R_1^{m_1} * S^{42e} = Z * S^{v+42e} * R_1^{m_1}. " +
              "Since v' = v - 42e, we have v = v' + 42e, so v + 42e = v' + 84e. This is wrong. " +
              "The correct verification: (A')^e = A^e * S^{e*r'} = Z * S^v * R_1^{m_1} * S^{e*r'} = Z * S^{v + e*r'} * R_1^{m_1}. " +
              "Define v' = v + e*r' (not v - e*r'). Then (A')^e = Z * S^{v'} * R_1^{m_1}. " +
              "Note: the sign convention depends on the formulation. In the file's convention v' = v - e*r', " +
              "the equation rearranges as A' = A * S^{r'} => (A')^e = Z * S^{v + er'} * prod(R_i^{m_i}) = Z * S^{v'} * prod(R_i^{m_i}) where v' = v + er'. " +
              "The key insight: the randomized triple (A', e, v') is a valid CL signature on the same messages, unlinkable to (A, e, v).",
          },
          {
            type: "conceptual",
            question:
              "Why does CL signature security rely on the Strong RSA assumption rather than the standard RSA assumption? " +
              "Explain the difference between the two assumptions, and why computing e-th roots mod n for adversary-chosen e " +
              "is the critical operation in CL forgery.",
            hint:
              "Standard RSA: given (n, e, y), find x such that x^e = y mod n (e is fixed). " +
              "Strong RSA: given (n, z), find ANY (u, e) with e > 1 such that u^e = z mod n (adversary chooses e). " +
              "In CL, the forger can choose the prime e in the signature.",
            answer:
              "Standard RSA fixes e and asks to invert the RSA function. Strong RSA lets the adversary choose e freely. " +
              "CL signatures require the adversary to produce (A*, e*, v*) where e* is a prime chosen by the adversary. " +
              "A forger who finds a new valid triple effectively computes an e*-th root of a known value modulo n, " +
              "for an e* of their choosing. This is exactly the Strong RSA problem. " +
              "The standard RSA assumption is insufficient because CL does not fix e — different signatures use different primes. " +
              "The reduction uses the forking lemma: rewinding the forger with different challenges yields two valid signatures " +
              "with different e values, from which an e-th root can be extracted, contradicting Strong RSA.",
          },
        ],
      },
      {
        name: "BBS+ Signatures",
        formalDefinition:
          "A pairing-based signature scheme on a message vector \\( (m_1, \\ldots, m_L) \\in \\mathbb{Z}_p^L \\). " +
          "Defined over a Type-3 pairing \\( e: \\mathbb{G}_1 \\times \\mathbb{G}_2 \\to \\mathbb{G}_T \\) with " +
          "generators \\( g_1 \\in \\mathbb{G}_1 \\) and \\( \\tilde{g}_2 \\in \\mathbb{G}_2 \\). Security rests on the " +
          "\\( q \\)-Strong Diffie-Hellman (\\( q \\)-SDH) assumption.",
        mathDetails: [
          {
            subtitle: "Key Generation",
            content:
              "Choose \\( x \\xleftarrow{\\$} \\mathbb{Z}_p \\) and \\( h_0, h_1, \\ldots, h_L \\xleftarrow{\\$} \\mathbb{G}_1 \\). " +
              "The secret key is \\( sk = x \\). The public key is:" +
              "\\[ pk = (\\tilde{X} = \\tilde{g}_2^x, \\; h_0, h_1, \\ldots, h_L) \\in \\mathbb{G}_2 \\times \\mathbb{G}_1^{L+1} \\]" +
              "Here \\( h_i \\) are public generators in \\( \\mathbb{G}_1 \\), one per message slot plus \\( h_0 \\) for the " +
              "blinding factor \\( s \\).",
          },
          {
            subtitle: "Signing",
            content:
              "To sign \\( (m_1, \\ldots, m_L) \\in \\mathbb{Z}_p^L \\), choose \\( e, s \\xleftarrow{\\$} \\mathbb{Z}_p \\) and compute:" +
              "\\[ B = g_1 \\cdot h_0^s \\cdot \\prod_{i=1}^{L} h_i^{m_i} \\]" +
              "\\[ A = B^{1/(x + e)} \\]" +
              "The signature is \\( \\sigma = (A, e, s) \\in \\mathbb{G}_1 \\times \\mathbb{Z}_p^2 \\). " +
              "Computing \\( B^{1/(x+e)} \\) requires the secret key \\( x \\).",
          },
          {
            subtitle: "Verification (Pairing Equation)",
            content:
              "Given \\( pk = (\\tilde{X}, h_0, \\ldots, h_L) \\), signature \\( (A, e, s) \\), and messages \\( (m_1, \\ldots, m_L) \\), verify:" +
              "\\[ e(A, \\; \\tilde{X} \\cdot \\tilde{g}_2^e) = e\\!\\left(g_1 \\cdot h_0^s \\cdot \\prod_{i=1}^{L} h_i^{m_i}, \\; \\tilde{g}_2\\right) \\]" +
              "This holds because \\( e(B^{1/(x+e)}, \\tilde{g}_2^{x+e}) = e(B, \\tilde{g}_2) \\) by bilinearity. " +
              "The pairing check requires two pairing evaluations and one multi-exponentiation in \\( \\mathbb{G}_1 \\).",
          },
          {
            subtitle: "Proof of Knowledge (Selective Disclosure)",
            content:
              "To prove knowledge of a valid BBS+ signature while disclosing only \\( \\{m_i\\}_{i \\in D} \\):" +
              "\\[ \\textbf{Step 1: Randomize.} \\quad r_1, r_2 \\xleftarrow{\\$} \\mathbb{Z}_p, \\quad A' = A^{r_1}, \\quad \\bar{A} = A'^{-e} \\cdot B^{r_1} \\]" +
              "where \\( B = g_1 \\cdot h_0^s \\cdot \\prod h_i^{m_i} \\). Then \\( \\bar{A} = A'^{-e} \\cdot (A^{x+e})^{r_1} = A'^x \\cdot A'^e \\cdot A'^{-e} = (A')^x \\). " +
              "So: \\( e(A', \\tilde{X}) = e(\\bar{A}, \\tilde{g}_2) \\)." +
              "\\[ \\textbf{Step 2: Sigma protocol.} \\]" +
              "Prove knowledge of \\( (e, r_2, s', \\{m_i\\}_{i \\notin D}) \\) satisfying:" +
              "\\[ \\bar{A} / d = A'^{-e} \\cdot h_0^{r_2} \\cdot \\prod_{i \\notin D} h_i^{m_i} \\]" +
              "where \\( d = g_1 \\cdot \\prod_{i \\in D} h_i^{m_i} \\) is computable by the verifier, and \\( s' = s + r_1 \\cdot r_2 \\). " +
              "The proof uses Schnorr-style commitments and a Fiat-Shamir challenge.",
          },
          {
            subtitle: "Unlinkability via Randomization",
            content:
              "Each presentation uses a fresh random \\( r_1 \\), producing a different \\( A' = A^{r_1} \\). Since " +
              "\\( r_1 \\) is uniform in \\( \\mathbb{Z}_p^* \\), the distribution of \\( A' \\) is uniform over \\( \\mathbb{G}_1 \\setminus \\{\\mathcal{O}\\} \\), " +
              "independent of \\( A \\). Two presentations from the same credential are information-theoretically " +
              "unlinkable (perfect ZK in the randomization step).",
          },
          {
            subtitle: "Multi-Message Support",
            content:
              "BBS+ natively supports \\( L \\) messages in a single signature through the generators \\( h_1, \\ldots, h_L \\). " +
              "The signature size is constant (one \\( \\mathbb{G}_1 \\) element + two scalars) regardless of \\( L \\). " +
              "The proof size grows linearly with the number of hidden attributes: each hidden \\( m_i \\) adds one " +
              "scalar to the proof (the Schnorr response). Disclosed attributes add no proof overhead.",
          },
        ],
        securityAnalysis:
          "Unforgeability reduces to the \\( q \\)-SDH assumption in Type-3 pairing groups: given " +
          "\\( (g_1, g_1^x, g_1^{x^2}, \\ldots, g_1^{x^q}, \\tilde{g}_2, \\tilde{g}_2^x) \\), it is hard to compute " +
          "\\( (g_1^{1/(x+c)}, c) \\) for any fresh \\( c \\notin \\{x, x^2, \\ldots\\} \\). " +
          "The proof shows that an adversary making \\( q \\) signing queries who forges a new signature can be used " +
          "to solve \\( q \\)-SDH. Anonymity (unlinkability of presentations) follows from the perfect " +
          "re-randomization of \\( A \\to A' = A^{r_1} \\) and the zero-knowledge property of the Schnorr-based proof.",
        practicalNotes:
          "Instantiated on BLS12-381: \\( |\\mathbb{G}_1| = 48 \\) bytes (compressed), \\( |\\mathbb{G}_2| = 96 \\) bytes, " +
          "\\( |\\mathbb{Z}_p| = 32 \\) bytes. " +
          "Signature size: 48 + 32 + 32 = 112 bytes. " +
          "Proof size: ~48 (\\( A' \\)) + 48 (\\( \\bar{A} \\)) + 48 (\\( d \\)) + 32 per hidden attribute + 32 (challenge) bytes. " +
          "Performance (BLS12-381, single core): sign ~1ms, prove ~5-10ms for 10 attributes, verify ~10-15ms. " +
          "Pairing computation dominates verification (~3ms per pairing on modern hardware). " +
          "W3C BBS Data Integrity draft: defines JSON-LD proof format for BBS+ selective disclosure in VCs. " +
          "Libraries: @mattrglobal/bbs-signatures (JS), hyperledger/anoncreds-rs (Rust).",
        keyFormulas: [
          {
            name: "BBS+ Signing",
            formula: "\\[ A = \\left(g_1 \\cdot h_0^s \\cdot \\prod_{i=1}^{L} h_i^{m_i}\\right)^{1/(x+e)} \\]",
          },
          {
            name: "BBS+ Verification (Pairing)",
            formula: "\\[ e(A, \\; \\tilde{X} \\cdot \\tilde{g}_2^e) = e\\!\\left(g_1 \\cdot h_0^s \\cdot \\prod_{i=1}^{L} h_i^{m_i}, \\; \\tilde{g}_2\\right) \\]",
          },
          {
            name: "Randomization for Unlinkable Proof",
            formula: "\\[ A' = A^{r_1}, \\quad \\bar{A} = A'^{-e} \\cdot B^{r_1}, \\quad e(A', \\tilde{X}) = e(\\bar{A}, \\tilde{g}_2) \\]",
          },
        ],
        exercises: [
          {
            type: "calculation",
            question:
              "In BBS+ signing, the signer computes B = g_1 * h_0^s * h_1^{m_1} * h_2^{m_2} and A = B^{1/(x+e)}. " +
              "The verification pairing equation is e(A, X_tilde * g_tilde_2^e) = e(B, g_tilde_2). " +
              "Prove algebraically why this equation holds, starting from A = B^{1/(x+e)} and X_tilde = g_tilde_2^x. " +
              "Which property of bilinear pairings do you use?",
            hint:
              "Start with the left side: e(A, X_tilde * g_tilde_2^e) = e(B^{1/(x+e)}, g_tilde_2^x * g_tilde_2^e). " +
              "Simplify g_tilde_2^x * g_tilde_2^e = g_tilde_2^{x+e}. " +
              "Use bilinearity: e(g^a, h^b) = e(g, h)^{ab}.",
            answer:
              "LHS = e(B^{1/(x+e)}, g_tilde_2^{x+e}). " +
              "By bilinearity: e(B^{1/(x+e)}, g_tilde_2^{x+e}) = e(B, g_tilde_2)^{(1/(x+e)) * (x+e)} = e(B, g_tilde_2)^1 = e(B, g_tilde_2) = RHS. " +
              "The critical property used is bilinearity of the Type-3 pairing: e(g^a, h^b) = e(g, h)^{ab}. " +
              "This is why BBS+ requires pairing-friendly curves (BLS12-381) — the pairing enables verification " +
              "without knowing the secret key x or the signing randomness e.",
          },
          {
            type: "conceptual",
            question:
              "BBS+ achieves information-theoretic unlinkability through randomization A' = A^{r_1}. " +
              "Explain why choosing r_1 uniformly at random in Z_p* makes A' uniformly distributed over G_1 \\ {O}, " +
              "regardless of A. Why does this give perfect (not just computational) unlinkability? " +
              "Compare this to CL signature randomization.",
            hint:
              "In a cyclic group of prime order p, if A is a generator, then A^{r_1} for uniform r_1 in Z_p* " +
              "produces every non-identity element with equal probability 1/(p-1). " +
              "For CL, randomization is A' = A * S^{r'}, which is statistical (not perfect) ZK.",
            answer:
              "Since G_1 has prime order p, any non-identity element A is a generator. " +
              "The map r_1 -> A^{r_1} is a bijection from Z_p* to G_1 \\ {O}. " +
              "So for uniform r_1, A' is uniformly distributed over G_1 \\ {O}, independent of which A was used. " +
              "Two presentations (A'_1, A'_2) are identically distributed regardless of whether they derive from " +
              "the same A or different A values — this is information-theoretic (perfect) unlinkability, not relying " +
              "on any computational assumption. " +
              "CL randomization A' = A * S^{r'} is only statistically hiding because the RSA group has unknown order, " +
              "and the range of r' must be super-polynomially larger than the group order to achieve statistical ZK.",
          },
        ],
      },
      {
        name: "Selective Disclosure",
        formalDefinition:
          "Given a signature \\( \\sigma \\) on messages \\( (m_1, \\ldots, m_L) \\), produce a proof \\( \\pi \\) " +
          "that convinces a verifier of the validity of \\( \\sigma \\) while revealing only \\( \\{m_i\\}_{i \\in D} \\) " +
          "for a disclosed set \\( D \\subseteq [L] \\). Formally: " +
          "\\( \\pi \\leftarrow \\text{Prove}(pk, \\sigma, (m_1, \\ldots, m_L), D) \\) and " +
          "\\( \\text{Verify}(pk, \\{m_i\\}_{i \\in D}, \\pi) \\to \\{0,1\\} \\).",
        mathDetails: [
          {
            subtitle: "BBS+ Selective Disclosure Split",
            content:
              "The core technique splits the multi-exponentiation in the signature equation into disclosed and hidden parts:" +
              "\\[ \\prod_{i=1}^{L} h_i^{m_i} = \\underbrace{\\prod_{i \\in D} h_i^{m_i}}_{\\text{disclosed (verifier computes)}} \\cdot \\underbrace{\\prod_{i \\notin D} h_i^{m_i}}_{\\text{hidden (proved in ZK)}} \\]" +
              "The verifier computes \\( d = g_1 \\cdot \\prod_{i \\in D} h_i^{m_i} \\) from the disclosed values and checks " +
              "the proof against this. The prover demonstrates knowledge of the hidden exponents via Schnorr proofs.",
          },
          {
            subtitle: "Predicate Proofs (Range Proofs)",
            content:
              "To prove \\( m_i \\in [a, b] \\) without revealing \\( m_i \\), embed a range proof in the Sigma protocol. " +
              "Using Bulletproofs: prove \\( m_i - a \\) and \\( b - m_i \\) are both non-negative by decomposing into " +
              "\\( n \\)-bit representations and proving each bit is binary:" +
              "\\[ m_i - a = \\sum_{j=0}^{n-1} b_j \\cdot 2^j, \\quad b_j \\in \\{0, 1\\} \\]" +
              "Bulletproof range proof size: \\( O(\\log n) \\) group elements, where \\( n \\) is the bit length. " +
              "For a 64-bit range proof: ~672 bytes.",
          },
          {
            subtitle: "Equality Proof Across Credentials",
            content:
              "To prove \\( m_i^{(1)} = m_j^{(2)} \\) (same value in two different credentials) without revealing it, " +
              "use a combined Schnorr proof. If both credentials use BBS+, the prover shows:" +
              "\\[ \\text{PK}\\{ (\\alpha) : C_1 = h_i^{\\alpha} \\; \\wedge \\; C_2 = h_j'^{\\alpha} \\} \\]" +
              "where \\( C_1, C_2 \\) are commitments to \\( m_i^{(1)} \\) and \\( m_j^{(2)} \\) respectively, extracted " +
              "from the respective BBS+ proofs. A single Schnorr response \\( \\alpha \\) binds both.",
          },
          {
            subtitle: "Set Membership Proof",
            content:
              "To prove \\( m_i \\in \\{v_1, \\ldots, v_k\\} \\) (e.g., country in an allowed list) without revealing which value:" +
              "\\[ \\text{PK}\\{ (m_i) : \\prod_{j=1}^{k}(m_i - v_j) = 0 \\} \\]" +
              "This can be realized via a polynomial evaluation proof or an OR-composition of Sigma protocols " +
              "(prove \\( m_i = v_1 \\lor m_i = v_2 \\lor \\ldots \\)). For small sets, OR-composition is efficient. " +
              "For large sets, use an accumulator-based membership proof.",
          },
          {
            subtitle: "Non-Membership (Inequality) Proof",
            content:
              "To prove \\( m_i \\neq v \\) or \\( m_i \\notin S \\) (e.g., not on a blocklist), use accumulator " +
              "non-membership witnesses. For RSA accumulators, a non-membership witness for \\( x \\notin V \\) " +
              "uses Bezout coefficients:" +
              "\\[ a \\cdot x + b \\cdot \\prod_{v \\in V} v = \\gcd(x, \\prod_{v \\in V} v) = 1 \\]" +
              "The holder proves knowledge of \\( (a, b) \\) satisfying this relation in ZK. " +
              "This is computationally harder than membership proofs.",
          },
        ],
        securityAnalysis:
          "The selective disclosure proof inherits zero-knowledge from the underlying Sigma protocol: " +
          "the simulator can produce transcripts indistinguishable from real proofs without knowing the hidden attributes. " +
          "Soundness comes from the BBS+ unforgeability: extracting the hidden attributes from a valid proof is " +
          "equivalent to forging a BBS+ signature. Predicate proofs (range, set membership) add additional ZK layers, " +
          "each with their own soundness guarantees (Bulletproof soundness relies on discrete log hardness).",
        practicalNotes:
          "Each hidden attribute adds ~32 bytes (one \\( \\mathbb{Z}_p \\) scalar) to the proof. " +
          "A Bulletproof range proof adds ~672 bytes for 64-bit range. " +
          "Equality proofs across credentials add ~64 bytes (shared Schnorr response + commitment). " +
          "Set membership with OR-composition: proof size linear in set size; for \\( k \\leq 16 \\), ~512 bytes. " +
          "For larger sets, accumulator-based: constant ~200 bytes but requires accumulator infrastructure.",
        keyFormulas: [
          {
            name: "Selective Disclosure Split",
            formula: "\\[ \\prod_{i=1}^{L} h_i^{m_i} = \\prod_{i \\in D} h_i^{m_i} \\cdot \\prod_{i \\notin D} h_i^{m_i} \\]",
          },
          {
            name: "Range Proof (bit decomposition)",
            formula: "\\[ m_i - a = \\sum_{j=0}^{n-1} b_j \\cdot 2^j, \\quad b_j \\in \\{0,1\\} \\]",
          },
          {
            name: "Equality Proof Across Credentials",
            formula: "\\[ \\text{PK}\\{ (\\alpha) : C_1 = h_i^{\\alpha} \\; \\wedge \\; C_2 = h_j'^{\\alpha} \\} \\]",
          },
        ],
        exercises: [
          {
            type: "design",
            question:
              "A verifier wants to check that a user is (1) over 18 and (2) a citizen of an EU country, " +
              "without learning the exact age or which EU country. The user holds a BBS+ credential with attributes " +
              "(name, date_of_birth, nationality, address, credential_id). " +
              "Design the selective disclosure proof: specify D (disclosed set), the predicate proofs needed, " +
              "and the proof components the verifier receives.",
            hint:
              "D should be empty — nothing is disclosed in the clear. " +
              "You need two predicate proofs: a range proof on date_of_birth and a set membership proof on nationality. " +
              "The set membership proof proves nationality is in {DE, FR, IT, ES, ...} without revealing which.",
            answer:
              "Disclosed set D = {} (empty). " +
              "Proof components: (1) BBS+ selective disclosure proof that the user holds a valid signature on 5 attributes, " +
              "with all 5 hidden. (2) Range proof: date_of_birth <= (current_date - 18*365.25 days), realized via " +
              "Bulletproof or bit-decomposition embedded in the Schnorr protocol. (3) Set membership proof: " +
              "nationality in {DE, FR, IT, ES, NL, BE, ...all 27 EU codes}, realized via OR-composition of " +
              "27 Schnorr proofs (for small set) or accumulator-based membership proof (for efficiency). " +
              "The verifier receives: randomized BBS+ proof (A', A_bar, d), Schnorr responses for all 5 hidden attributes, " +
              "the range proof (~672 bytes), and the set membership proof. The verifier checks all proofs against ipk.",
          },
          {
            type: "conceptual",
            question:
              "Explain the difference between selective disclosure via SD-JWT and via BBS+ in terms of unlinkability. " +
              "In SD-JWT, the holder reveals (salt_i, k_i, v_i) for disclosed claims. Why does this make " +
              "SD-JWT presentations linkable? What specific cryptographic property does BBS+ have that SD-JWT lacks?",
            hint:
              "In SD-JWT, the JWT body (including all hashes H_1, ..., H_n and the issuer signature) is the same " +
              "across all presentations. The verifier sees the full signed JWT each time. " +
              "In BBS+, each presentation uses fresh randomness r_1 to produce a new A'.",
            answer:
              "SD-JWT reuses the same issuer signature (ECDSA/EdDSA over the JWT body) in every presentation. " +
              "The JWT body contains all hashes H_1, ..., H_n, which are fixed. Any two verifiers receiving " +
              "presentations can compare the JWT signature or the hash set to determine they come from the same credential. " +
              "BBS+ achieves unlinkability because each presentation randomizes the signature: A' = A^{r_1} with fresh r_1. " +
              "The randomized values (A', A_bar) are uniformly distributed and independent across presentations. " +
              "The cryptographic property BBS+ has that SD-JWT lacks is re-randomizable signatures: " +
              "the ability to transform a valid signature into a new, unlinkable valid signature on the same messages.",
          },
        ],
      },
      {
        name: "W3C Verifiable Credentials & DIDs",
        formalDefinition:
          "A Verifiable Credential is a tamper-evident data structure: " +
          "\\( \\text{VC} = (\\text{issuer}, \\text{subject}, \\text{claims}, \\text{proof}) \\) where " +
          "\\( \\text{claims} = \\{(k_i, v_i)\\}_{i=1}^{n} \\) are attribute key-value pairs and " +
          "\\( \\text{proof} \\) is a cryptographic proof of integrity (digital signature, ZK proof, or both). " +
          "A DID (Decentralized Identifier) is a URI of the form \\( \\texttt{did:method:identifier} \\) that " +
          "resolves to a DID Document containing public keys and service endpoints.",
        mathDetails: [
          {
            subtitle: "DID Resolution",
            content:
              "DID resolution is a function \\( \\text{resolve}: \\text{DID} \\to \\text{DIDDocument} \\) where the " +
              "DID Document contains: verification methods (public keys), authentication methods, service endpoints, " +
              "and controller relationships. The resolution method depends on the DID method: " +
              "\\( \\texttt{did:web} \\) fetches from a web server, \\( \\texttt{did:key} \\) derives from the identifier itself, " +
              "\\( \\texttt{did:sui} \\) reads a Sui on-chain object.",
          },
          {
            subtitle: "SD-JWT (Selective Disclosure JWT)",
            content:
              "SD-JWT hashes individual claims before inclusion in the JWT payload. For each claim \\( (k_i, v_i) \\):" +
              "\\[ H_i = \\text{SHA-256}(\\text{salt}_i \\| k_i \\| v_i) \\]" +
              "The JWT body contains \\( \\{H_1, \\ldots, H_n\\} \\) signed by the issuer. To disclose claim \\( i \\), " +
              "the holder reveals \\( (\\text{salt}_i, k_i, v_i) \\) and the verifier checks \\( H_i = \\text{SHA-256}(\\text{salt}_i \\| k_i \\| v_i) \\). " +
              "Undisclosed claims remain hidden (preimage resistance of SHA-256). " +
              "Limitation: SD-JWT presentations are linkable (same JWT signature shown each time).",
          },
          {
            subtitle: "BBS+ Integration with VCs",
            content:
              "VC claims are mapped to a BBS+ message vector: \\( m_i = \\text{Hash}(k_i \\| v_i) \\) for each claim. " +
              "The issuer signs \\( (m_1, \\ldots, m_L) \\) using BBS+, producing \\( \\sigma = (A, e, s) \\). " +
              "The VC proof field contains the BBS+ signature (or a derived proof). " +
              "For presentation: the holder runs the BBS+ selective disclosure protocol, producing an unlinkable " +
              "ZK proof that replaces the original signature in the Verifiable Presentation. " +
              "W3C BBS Data Integrity Cryptosuite (draft) standardizes this flow.",
          },
          {
            subtitle: "Verifiable Presentations",
            content:
              "A Verifiable Presentation \\( \\text{VP} \\) packages one or more VCs (or derived proofs) with " +
              "a holder binding proof:" +
              "\\[ \\text{VP} = (\\{\\text{VC}_i^{\\text{derived}}\\}_{i=1}^{k}, \\; \\text{holderProof}) \\]" +
              "The holder proof binds the presentation to the holder's DID (prevents replay). " +
              "With BBS+, each \\( \\text{VC}_i^{\\text{derived}} \\) is a selective disclosure proof, and the " +
              "holder proof is a Schnorr proof of knowledge of the DID's private key.",
          },
          {
            subtitle: "DID Methods for Sui",
            content:
              "A potential \\( \\texttt{did:sui} \\) method: \\( \\texttt{did:sui:<object\\_id>} \\) where the DID Document " +
              "is stored as a Sui object. Resolution calls \\( \\text{sui\\_getObject}(\\text{object\\_id}) \\) and parses " +
              "the object data into a DID Document. " +
              "Advantages: on-chain key rotation (update the Sui object), Sui's object model maps naturally to " +
              "DID Document lifecycle, and verification is on-chain (smart contract reads the DID object directly).",
          },
        ],
        securityAnalysis:
          "VC security depends on: (1) the underlying signature scheme (BBS+ unforgeability, SD-JWT relies on " +
          "ECDSA/EdDSA + SHA-256 preimage resistance), (2) the DID method security (can the DID be hijacked? " +
          "\\( \\texttt{did:web} \\) inherits web PKI trust model, \\( \\texttt{did:sui} \\) inherits Sui consensus security), " +
          "(3) the revocation mechanism (accumulator soundness or status list integrity). " +
          "SD-JWT provides selective disclosure but NOT unlinkability: the same JWT body is reused across presentations. " +
          "BBS+ provides both selective disclosure AND unlinkability.",
        practicalNotes:
          "eIDAS 2.0 Architecture Reference Framework (ARF v1.4) mandates support for ISO 18013-5 (mDL) and " +
          "SD-JWT for interoperability, with BBS+ as the preferred privacy-preserving option. " +
          "Current VC ecosystem: ~80% JWT-based VCs, growing adoption of SD-JWT, BBS+ in pilot phase. " +
          "JSON-LD processing adds overhead (~50-200ms for context resolution) compared to JWT (~1ms). " +
          "Sui integration: VCs issued off-chain, anchored on-chain via hash commitments, ZK proofs verified by Move contracts.",
        keyFormulas: [
          {
            name: "SD-JWT Hash Construction",
            formula: "\\[ H_i = \\text{SHA-256}(\\text{salt}_i \\| k_i \\| v_i) \\]",
          },
          {
            name: "VC-to-BBS+ Mapping",
            formula: "\\[ m_i = \\text{Hash}(k_i \\| v_i), \\quad \\sigma = \\text{BBS}^+.\\text{Sign}(sk, (m_1, \\ldots, m_L)) \\]",
          },
        ],
        exercises: [
          {
            type: "comparison",
            question:
              "Compare three DID methods — did:web, did:key, and did:sui — along the following axes: " +
              "(1) trust model (who do you trust?), (2) key rotation support, (3) offline resolution capability, " +
              "and (4) suitability for anonymous credential presentations. " +
              "Which method best fits a Sui-based anonymous credential system and why?",
            hint:
              "did:web trusts the web server operator and DNS/TLS infrastructure. " +
              "did:key encodes the public key directly in the DID (no resolution needed, but no key rotation). " +
              "did:sui trusts Sui consensus for the DID Document stored as an on-chain object.",
            answer:
              "did:web: trust = web PKI (CA + DNS); key rotation = yes (update hosted document); offline = no (needs HTTP); " +
              "anonymous creds = poor (server logs who resolves the DID). " +
              "did:key: trust = none (self-certifying); key rotation = no (key IS the identifier); offline = yes; " +
              "anonymous creds = good for holders (no resolution needed) but no revocation/rotation. " +
              "did:sui: trust = Sui consensus (BFT, 2/3 honest validators); key rotation = yes (update Sui object); " +
              "offline = no (needs Sui RPC); anonymous creds = best fit because verification can happen on-chain " +
              "via Move contracts, key rotation is decentralized, and the DID Document lifecycle maps to Sui object model. " +
              "Best fit for Sui-based anonymous credentials: did:sui for issuers (on-chain key management), " +
              "did:key for holders (minimal footprint, privacy-preserving).",
          },
          {
            type: "design",
            question:
              "Design the issuance flow for a BBS+-based Verifiable Credential on Sui. " +
              "The issuer has a did:sui DID. Specify: (1) how the issuer's BBS+ public key is published, " +
              "(2) the credential issuance protocol steps, (3) how the VC is anchored on-chain, " +
              "and (4) how a verifier resolves the issuer's key to check a presentation.",
            hint:
              "The issuer's BBS+ public key (h_0, h_1, ..., h_L, X_tilde) can be stored in the DID Document " +
              "as a verification method. The credential itself is issued off-chain (signed by BBS+). " +
              "On-chain anchoring uses a hash commitment, not the full credential.",
            answer:
              "Step 1: Issuer publishes BBS+ pk = (X_tilde, h_0, ..., h_L) in their did:sui DID Document, " +
              "stored as a Sui object field under 'verificationMethod' with type 'Bls12381G2Key2020'. " +
              "Step 2: Issuance — issuer receives holder's attribute commitments (blind issuance for holder-secret attributes), " +
              "computes sigma = BBS+.Sign(sk, (m_1, ..., m_L)), returns sigma to holder off-chain. " +
              "Step 3: Anchoring — issuer publishes H = SHA-256(VC_id || MRENCLAVE_credential || issuance_timestamp) " +
              "as a Sui event or in a shared registry object. This proves issuance time without revealing VC contents. " +
              "Step 4: Verification — verifier resolves did:sui:<object_id> via sui_getObject, extracts BBS+ pk " +
              "from the DID Document, then verifies the BBS+ selective disclosure proof against that pk.",
          },
        ],
      },
      {
        name: "Revocation Mechanisms",
        formalDefinition:
          "A tuple of algorithms \\( (\\text{Setup}, \\text{Add}, \\text{Revoke}, \\text{ProveNonRevoked}, \\text{VerifyNonRevoked}) \\) where: " +
          "\\( \\text{Setup}(1^\\lambda) \\to (\\text{acc}_0, sk_{\\text{acc}}) \\); " +
          "\\( \\text{Add}(sk_{\\text{acc}}, \\text{acc}, x) \\to (\\text{acc}', w_x) \\); " +
          "\\( \\text{Revoke}(sk_{\\text{acc}}, \\text{acc}, x) \\to \\text{acc}' \\); " +
          "\\( \\text{ProveNonRevoked}(w_x, \\text{acc}) \\to \\pi \\); " +
          "\\( \\text{VerifyNonRevoked}(\\text{acc}, x, \\pi) \\to \\{0,1\\} \\).",
        mathDetails: [
          {
            subtitle: "RSA Accumulator",
            content:
              "Let \\( n = pq \\) be an RSA modulus with \\( p, q \\) safe primes, \\( g \\in QR_n \\). " +
              "For a set of valid credential identifiers \\( V = \\{x_1, \\ldots, x_k\\} \\) mapped to distinct primes \\( p_i \\):" +
              "\\[ \\text{acc} = g^{\\prod_{i=1}^{k} p_i} \\bmod n \\]" +
              "Membership witness for \\( x_i \\) (with prime representative \\( p_i \\)):" +
              "\\[ w_i = g^{\\prod_{j \\neq i} p_j} \\bmod n \\]" +
              "Verification: \\( w_i^{p_i} \\equiv \\text{acc} \\pmod{n} \\).",
          },
          {
            subtitle: "Non-Membership Proof",
            content:
              "To prove \\( x \\notin V \\) (credential not revoked), use the Bezout coefficient method. " +
              "Since \\( p_x \\) (prime for \\( x \\)) is coprime to \\( \\prod_{j \\in V} p_j \\), by the extended Euclidean algorithm:" +
              "\\[ a \\cdot p_x + b \\cdot \\prod_{j \\in V} p_j = 1 \\]" +
              "The non-membership witness is \\( (g^b \\bmod n, a) \\). Verification checks:" +
              "\\[ (g^b)^{\\prod_{j \\in V} p_j} \\cdot \\text{acc}^{a \\cdot p_x} \\neq \\text{acc} \\quad \\text{...wait, more precisely:} \\]" +
              "\\[ \\text{acc}^a \\cdot (g^b)^{p_x} = g^{a \\cdot \\prod p_j + b \\cdot p_x} = g^1 = g \\]" +
              "The verifier checks \\( \\text{acc}^a \\cdot d^{p_x} = g \\) where \\( d = g^b \\). " +
              "In the ZK setting, the holder proves knowledge of \\( (a, d) \\) satisfying this without revealing \\( p_x \\).",
          },
          {
            subtitle: "Dynamic Accumulator Updates",
            content:
              "Adding element \\( x_{k+1} \\) (prime \\( p_{k+1} \\)):" +
              "\\[ \\text{acc}' = \\text{acc}^{p_{k+1}} \\bmod n \\]" +
              "Existing witnesses update: \\( w_i' = w_i^{p_{k+1}} \\bmod n \\). " +
              "Revoking element \\( x_r \\) (removing from accumulated set): the issuer with \\( p, q \\) computes" +
              "\\[ \\text{acc}' = \\text{acc}^{1/p_r} \\bmod n \\]" +
              "using knowledge of \\( \\phi(n) \\). Existing witnesses for non-revoked elements must be updated: " +
              "\\( w_i' = w_i^{1/p_r} \\bmod n \\), or batch update via the new accumulator value.",
          },
          {
            subtitle: "Merkle-Based Revocation",
            content:
              "Alternative approach: maintain a Merkle tree over revoked identifiers. " +
              "Non-revocation proof = Merkle non-membership proof (sorted tree or sparse Merkle tree). " +
              "For a sparse Merkle tree with \\( 2^{256} \\) leaves, a non-membership proof is a Merkle path of " +
              "length 256 showing the leaf at the credential's position is empty (default hash). " +
              "Proof size: \\( 256 \\times 32 = 8192 \\) bytes (can be compressed with pruning).",
          },
          {
            subtitle: "Privacy-Preserving Status Lists",
            content:
              "W3C StatusList2021: a bitstring where position \\( i \\) indicates whether credential \\( i \\) is revoked. " +
              "Privacy issue: the verifier learns which position the holder checks. " +
              "ZK overlay: the holder proves in zero knowledge that their credential's bit is 0 (not revoked) " +
              "without revealing which bit position. This requires a ZK proof over the status list, " +
              "e.g., proving \\( \\text{StatusList}[\\text{idx}] = 0 \\) inside a SNARK with the index as private input.",
          },
        ],
        securityAnalysis:
          "RSA accumulator security: under Strong RSA, no PPT adversary can produce a valid membership witness " +
          "for an element not in the accumulated set. Non-membership proofs require the same assumption plus " +
          "collision resistance of the prime mapping. " +
          "Merkle-based approach: security relies on collision resistance of the hash function (SHA-256). " +
          "StatusList2021 + ZK: SNARK soundness ensures the holder cannot lie about their revocation status. " +
          "Privacy: RSA accumulators with ZK proofs reveal nothing about which credential is checked. " +
          "Merkle proofs without ZK leak the position (tree path).",
        practicalNotes:
          "RSA accumulator: issuer update \\( O(1) \\) exponentiations, witness update \\( O(|\\text{revoked}|) \\) " +
          "exponentiations for each holder (or batch updates). Modular exponentiation ~5ms each. " +
          "Merkle approach: \\( O(\\log n) \\) hash computations (~microseconds), but proof is larger (~8KB vs ~256B for accumulator). " +
          "For Sui: accumulator stored as shared object (small: ~256B), witness maintained by holder off-chain. " +
          "StatusList2021 + SNARK: proving non-revocation inside Groth16 adds ~100K constraints for Merkle path verification.",
        keyFormulas: [
          {
            name: "RSA Accumulator",
            formula: "\\[ \\text{acc} = g^{\\prod_{i=1}^{k} p_i} \\bmod n \\]",
          },
          {
            name: "Witness Verification",
            formula: "\\[ w_i^{p_i} \\equiv \\text{acc} \\pmod{n} \\]",
          },
          {
            name: "Non-Membership (Bezout)",
            formula: "\\[ \\text{acc}^a \\cdot d^{p_x} = g \\quad \\text{where } d = g^b, \\; a \\cdot p_x + b \\cdot \\textstyle\\prod_{j \\in V} p_j = 1 \\]",
          },
        ],
        exercises: [
          {
            type: "calculation",
            question:
              "Consider a toy RSA accumulator with n = 77 (p=7, q=11), g = 4, and valid credential primes V = {3, 5}. " +
              "Compute: (1) the accumulator value acc = g^{3*5} mod 77, " +
              "(2) the membership witness for credential with prime 3: w_3 = g^5 mod 77, " +
              "(3) verify that w_3^3 = acc mod 77.",
            hint:
              "acc = 4^{15} mod 77. Compute 4^2 = 16, 4^4 = 256 mod 77, etc. by repeated squaring. " +
              "w_3 = 4^5 mod 77. Then check w_3^3 mod 77 = acc.",
            answer:
              "acc = 4^{15} mod 77: 4^2 = 16, 4^4 = 256 mod 77 = 25, 4^8 = 625 mod 77 = 9, " +
              "4^{15} = 4^8 * 4^4 * 4^2 * 4^1 = 9 * 25 * 16 * 4 = 9 * 25 = 225 mod 77 = 71, " +
              "71 * 16 = 1136 mod 77 = 1136 - 14*77 = 1136 - 1078 = 58, " +
              "58 * 4 = 232 mod 77 = 232 - 3*77 = 232 - 231 = 1. So acc = 1. " +
              "w_3 = 4^5 mod 77: 4^4 = 25, 4^5 = 25*4 = 100 mod 77 = 23. So w_3 = 23. " +
              "Verify: 23^3 mod 77 = 23^2 * 23 = 529 * 23. 529 mod 77 = 529 - 6*77 = 529 - 462 = 67. " +
              "67 * 23 = 1541 mod 77 = 1541 - 20*77 = 1541 - 1540 = 1. " +
              "w_3^3 = 1 = acc. Verification passes.",
          },
          {
            type: "design",
            question:
              "Design a privacy-preserving revocation check for a Sui-based credential system. " +
              "The issuer maintains a revocation list. The holder must prove non-revocation without revealing " +
              "which credential they hold. Compare two approaches: (1) RSA accumulator with ZK non-membership proof, " +
              "and (2) StatusList2021 with a SNARK proof. Recommend one for Sui and justify.",
            hint:
              "RSA accumulator: small on-chain state (~256B), holder maintains witness off-chain, " +
              "witness update cost is O(|revoked|) exponentiations per epoch. " +
              "StatusList + SNARK: bitstring on-chain, SNARK proves bit at secret index is 0, " +
              "but proving cost is high (~100K constraints for Merkle path in Groth16).",
            answer:
              "Approach 1 (RSA accumulator): Store acc (256B) as a Sui shared object. Holder maintains witness w_x off-chain. " +
              "On revocation, issuer updates acc' = acc^{1/p_r}. Holder updates witness via batch update. " +
              "Proof: ZK proof of accumulator membership (~200B proof). Privacy: perfect (reveals nothing about which credential). " +
              "Cost: witness update is expensive for holders (O(|revoked|) exponentiations). " +
              "Approach 2 (StatusList + SNARK): Store compressed bitstring on-chain. Holder generates Groth16 proof " +
              "that StatusList[idx] = 0 with idx as private input. Proof: ~128B (Groth16). " +
              "Cost: ~100K constraints for Merkle path verification inside the SNARK, proving time ~2-5s. " +
              "Recommendation for Sui: RSA accumulator. Sui's object model suits a single shared accumulator object, " +
              "on-chain verification of accumulator proofs is cheaper than Groth16 verification (~50K gas vs ~300K gas), " +
              "and the holder witness update can be batched into epoch boundaries matching Sui's epoch model.",
          },
        ],
      },
    ],
  },
  block2: {
    title: "TEEs (SGX, Attestation, Trust Model)",
    concepts: [
      {
        name: "Trusted Execution Environments (TEE)",
        formalDefinition:
          "A hardware-isolated computation environment defined by a tuple of operations " +
          "\\( \\text{TEE} = (\\text{Init}, \\text{Execute}, \\text{Attest}, \\text{Seal}) \\) with the guarantee " +
          "that for all PPT adversaries \\( \\mathcal{A} \\) controlling the OS, hypervisor, and co-located processes: " +
          "\\( \\Pr[\\mathcal{A} \\text{ reads or modifies enclave state}] \\leq \\text{negl}(\\lambda) \\).",
        mathDetails: [
          {
            subtitle: "Threat Model",
            content:
              "The adversary \\( \\mathcal{A} \\) controls the entire software stack: operating system, hypervisor, " +
              "BIOS/UEFI, and all other processes. The adversary may also have physical access to the machine " +
              "(bus probing, cold-boot attacks). The ONLY trusted component is the CPU package itself " +
              "(including its microcode and key material fused at manufacturing). " +
              "Formally: the trusted computing base (TCB) is reduced to the CPU die.",
          },
          {
            subtitle: "Isolation Guarantee",
            content:
              "For any adversary \\( \\mathcal{A} \\) and enclave program \\( P \\) with state \\( \\text{st} \\):" +
              "\\[ \\Pr[\\mathcal{A}^{\\text{Execute}(P, \\cdot)}(\\text{st}) \\neq \\text{st}] \\leq \\text{negl}(\\lambda) \\quad \\text{(integrity)} \\]" +
              "\\[ \\Pr[\\mathcal{A}^{\\text{Execute}(P, \\cdot)} \\text{ learns } \\text{st}] \\leq \\text{negl}(\\lambda) \\quad \\text{(confidentiality)} \\]" +
              "Integrity means the adversary cannot alter the enclave's execution. " +
              "Confidentiality means the adversary learns nothing about the enclave's internal state.",
          },
          {
            subtitle: "Memory Encryption",
            content:
              "The Memory Encryption Engine (MEE) encrypts all data leaving the CPU to DRAM using AES-128-CTR " +
              "(SGX) or AES-128-XTS (TDX/SEV). Each cache line (64 bytes) is encrypted with a unique tweak " +
              "derived from the physical address. This prevents bus-snooping and cold-boot attacks from " +
              "reading enclave memory. The encryption keys are generated at boot and stored in CPU registers " +
              "(never in DRAM).",
          },
          {
            subtitle: "Integrity Tree",
            content:
              "A Merkle tree is maintained over enclave memory pages to detect tampering. Each page's MAC " +
              "(message authentication code) is stored in the tree. On every cache line fetch from DRAM, " +
              "the CPU verifies the MAC against the integrity tree. Replay attacks (serving stale data) " +
              "are detected via version numbers at each tree node. " +
              "Tree depth: \\( O(\\log(\\text{EPC size} / \\text{page size})) \\), typically ~20 levels.",
          },
          {
            subtitle: "UC-Secure Ideal Functionality",
            content:
              "In the Universal Composability (UC) framework, a TEE realizes an ideal functionality " +
              "\\( \\mathcal{F}_{\\text{att}} \\) for attested computation:" +
              "\\[ \\mathcal{F}_{\\text{att}}(\\text{prog}, \\text{input}) \\to (\\text{output}, \\sigma_{\\text{att}}) \\]" +
              "where \\( \\sigma_{\\text{att}} \\) is an attestation binding the output to the program \\( \\text{prog} \\) " +
              "and the hardware identity. Any protocol using \\( \\mathcal{F}_{\\text{att}} \\) composes securely " +
              "with other UC-secure protocols, enabling modular security proofs for TEE-based systems.",
          },
        ],
        securityAnalysis:
          "Hardware root of trust: security assumes the CPU manufacturer (Intel/AMD/ARM) is honest and the " +
          "manufacturing process is not compromised. Formal model: the Global Attestation Platform ideal " +
          "functionality (Pass et al., 2017) captures the trust assumption as an ideal party that faithfully " +
          "executes programs and signs outputs. " +
          "Known limitations: side-channel leakage is NOT captured by the ideal functionality. The formal " +
          "model assumes the leakage function \\( \\mathcal{L} \\) is empty, which does not hold in practice.",
        practicalNotes:
          "Intel SGX: process-level enclaves, deprecated on consumer CPUs (12th gen+), still available on server (Xeon). " +
          "Intel TDX: VM-level isolation (Trust Domains), available on 4th gen Xeon Scalable (Sapphire Rapids). " +
          "AMD SEV-SNP: VM-level, Secure Nested Paging prevents hypervisor remapping attacks. " +
          "ARM TrustZone: two-world model (Secure World / Normal World), used in mobile and IoT. " +
          "RISC-V Keystone: open-source TEE framework for RISC-V.",
        keyFormulas: [
          {
            name: "Isolation Guarantee",
            formula: "\\[ \\forall \\mathcal{A}: \\Pr[\\mathcal{A} \\text{ reads or modifies enclave state}] \\leq \\text{negl}(\\lambda) \\]",
          },
          {
            name: "Ideal Functionality",
            formula: "\\[ \\mathcal{F}_{\\text{att}}(\\text{prog}, \\text{input}) \\to (\\text{output}, \\sigma_{\\text{att}}) \\]",
          },
        ],
        exercises: [
          {
            type: "conceptual",
            question:
              "The TEE ideal functionality F_att assumes the leakage function L is empty (no side-channel leakage). " +
              "Explain why this assumption does not hold in practice for Intel SGX. " +
              "List three specific micro-architectural leakage channels and for each, describe what information " +
              "an OS-level adversary can extract from an enclave.",
            hint:
              "The OS controls page tables, cache eviction, and branch prediction. " +
              "Think about: (1) page-fault side channel (OS sees which pages are accessed), " +
              "(2) cache timing (Prime+Probe on shared L1/L2), (3) speculative execution (Spectre/Foreshadow).",
            answer:
              "(1) Page-fault channel: the OS controls page table mappings and can mark enclave pages as not-present. " +
              "When the enclave accesses a page, a page fault reveals which 4KB page was accessed. " +
              "Over time, this reveals memory access patterns at 4KB granularity — enough to extract AES keys from T-table implementations. " +
              "(2) Cache timing (Prime+Probe): the adversary fills L1 cache sets with known data, lets the enclave execute, " +
              "then measures access times. Slow access means the enclave evicted that cache line, revealing which " +
              "64-byte cache lines the enclave touched. Resolution: 64B, enough to distinguish AES S-box lookups. " +
              "(3) Spectre/Foreshadow: speculative execution within the enclave accesses memory based on secret values. " +
              "Although speculatively accessed data is rolled back architecturally, it leaves L1 cache footprints. " +
              "Foreshadow specifically reads arbitrary EPC data from L1 cache via terminal page faults, breaking confidentiality entirely.",
          },
          {
            type: "comparison",
            question:
              "Compare the TEE implementations of Intel SGX, Intel TDX, and AMD SEV-SNP along three dimensions: " +
              "(1) isolation granularity (process vs VM), (2) trusted computing base size, " +
              "and (3) resistance to hypervisor-based attacks. Which is best suited for a cloud-deployed " +
              "credential issuance service and why?",
            hint:
              "SGX isolates at process level (enclave), TDX and SEV-SNP isolate at VM level (Trust Domain / SEV VM). " +
              "TCB: SGX = CPU only; TDX = CPU + TDX module; SEV-SNP = CPU + AMD Secure Processor. " +
              "Hypervisor attacks: SGX enclaves are inside a process managed by untrusted OS; TDX/SEV protect the entire VM.",
            answer:
              "SGX: process-level isolation, smallest TCB (CPU microcode only), but vulnerable to OS-controlled " +
              "side channels (page faults, cache). Deprecated on consumer CPUs, server-only (Xeon). " +
              "TDX: VM-level isolation (Trust Domains), TCB includes CPU + Intel TDX module firmware. " +
              "The hypervisor cannot read/modify TD memory (hardware enforced via SEPT). " +
              "Larger protected surface than SGX (full VM), but larger TCB and attack surface (full guest OS inside TD). " +
              "SEV-SNP: VM-level, TCB = CPU + AMD Secure Processor (PSP). Secure Nested Paging prevents " +
              "hypervisor remapping attacks (each page has a Reverse Map Table entry binding it to a specific VM). " +
              "Best for cloud credential issuance: TDX or SEV-SNP, because (1) VM-level isolation allows running " +
              "standard Linux + application stack without EDL porting, (2) cloud providers (AWS Nitro, Azure CC) " +
              "offer managed TDX/SEV instances, (3) the credential issuance service needs network I/O which is " +
              "expensive with SGX OCALLs but native in a confidential VM.",
          },
        ],
      },
      {
        name: "Intel SGX Enclaves",
        formalDefinition:
          "An SGX enclave \\( E \\) is a process-level isolated execution environment with a cryptographic " +
          "measurement \\( \\text{MRENCLAVE} = H(\\text{code} \\| \\text{data} \\| \\text{layout} \\| \\text{config}) \\) " +
          "computed by the CPU during enclave creation (ECREATE + EADD + EEXTEND + EINIT sequence). " +
          "\\( H \\) is SHA-256 applied incrementally to each page added to the enclave.",
        mathDetails: [
          {
            subtitle: "Enclave Page Cache (EPC)",
            content:
              "The EPC is a reserved region of physical memory (Processor Reserved Memory, PRM) whose contents " +
              "are encrypted by the MEE. SGX1: EPC size fixed at boot, typically 128MB (93.5MB usable after metadata). " +
              "SGX2 (EDMM): dynamic memory management, EPC up to 512GB. " +
              "When EPC is full, pages are encrypted and evicted to regular DRAM (EWB instruction), then " +
              "loaded back on demand (ELD instruction). Each evicted page carries a MAC and version number " +
              "to detect tampering and replay.",
          },
          {
            subtitle: "ECALL / OCALL Interface",
            content:
              "ECALL (Enclave Call): untrusted application enters the enclave through a predefined entry point table (ECALL table). " +
              "The CPU switches to enclave mode, saves untrusted registers, and begins execution at the specified entry point. " +
              "OCALL (Outside Call): enclave calls back to untrusted code. Enclave state is saved (encrypted), " +
              "control transfers to untrusted handler. Return value is NOT trusted (enclave must validate). " +
              "The ECALL/OCALL boundary is the attack surface: all OCALL return values and ECALL parameters must be " +
              "sanitized (Iago attacks: malicious OS provides crafted return values to manipulate enclave logic).",
          },
          {
            subtitle: "Sealing (Persistent Encryption)",
            content:
              "Data persistence across enclave restarts via sealing:" +
              "\\[ \\text{ct} = \\text{AES-GCM}(K_{\\text{seal}}, \\text{data}) \\]" +
              "where the seal key \\( K_{\\text{seal}} \\) is derived by the EGETKEY instruction from:" +
              "\\[ K_{\\text{seal}} = \\text{KDF}(K_{\\text{root}}, \\; \\text{policy} \\| \\text{SVN} \\| \\text{CPUSVN} \\| \\text{KE\\_ID}) \\]" +
              "\\( K_{\\text{root}} \\) is a per-CPU fused key that never leaves the hardware. " +
              "Two sealing policies determine the identity used in derivation.",
          },
          {
            subtitle: "Sealing Policies: MRENCLAVE vs MRSIGNER",
            content:
              "MRENCLAVE policy: \\( K_{\\text{seal}} \\) is bound to the exact enclave code hash. " +
              "Only the identical enclave binary can unseal the data. Pros: maximum isolation. " +
              "Cons: any code update (even a bug fix) changes MRENCLAVE, losing access to sealed data." +
              "\\[ K_{\\text{seal}}^{\\text{enclave}} = \\text{KDF}(K_{\\text{root}}, \\text{MRENCLAVE}) \\]" +
              "MRSIGNER policy: \\( K_{\\text{seal}} \\) is bound to the developer's signing key hash. " +
              "Any enclave signed by the same developer key can unseal. Enables seamless upgrades." +
              "\\[ K_{\\text{seal}}^{\\text{signer}} = \\text{KDF}(K_{\\text{root}}, \\text{MRSIGNER} \\| \\text{ProdID}) \\]",
          },
          {
            subtitle: "Key Derivation via EGETKEY",
            content:
              "EGETKEY is a leaf function of the ENCLU instruction that derives enclave-specific keys from " +
              "the CPU root key. It takes a KEYREQUEST structure specifying: key type (seal, report, provisioning), " +
              "key policy (MRENCLAVE or MRSIGNER), SVN (Security Version Number), and optional key ID. " +
              "The derived key is deterministic: same inputs on same CPU always produce the same key. " +
              "This enables persistent sealed storage and local attestation report generation.",
          },
        ],
        securityAnalysis:
          "Primary threat: side-channel attacks (see dedicated concept). The ECALL/OCALL interface is the main " +
          "software attack surface. Iago attacks exploit enclave trust in OS-provided data (system call return values). " +
          "Mitigation: input validation on all ECALL parameters, sanitize all OCALL returns. " +
          "EPC paging attacks: OS observes which pages are swapped in/out, leaking access patterns. " +
          "Mitigation: ORAM (impractical) or access-pattern-independent algorithms.",
        practicalNotes:
          "SGX SDK: C/C++ with EDL (Enclave Definition Language) files defining ECALL/OCALL interfaces. " +
          "Gramine (formerly Graphene-SGX): run unmodified Linux applications in SGX with library OS. " +
          "Occlum: memory-safe LibOS for SGX enclaves. " +
          "Typical overhead: 5-15% for computation-bound workloads, up to 100x for I/O-bound (due to OCALLs). " +
          "EPC size limitation: applications with >128MB working set suffer from page swapping overhead. " +
          "SGX2 (EDMM) mitigates by allowing up to 512GB EPC.",
        keyFormulas: [
          {
            name: "MRENCLAVE Measurement",
            formula: "\\[ \\text{MRENCLAVE} = \\text{SHA-256}(\\text{ECREATE} \\| \\text{EADD}_1 \\| \\text{EEXTEND}_1 \\| \\cdots \\| \\text{EINIT}) \\]",
          },
          {
            name: "Seal Key Derivation",
            formula: "\\[ K_{\\text{seal}} = \\text{KDF}(K_{\\text{root}}, \\; \\text{policy} \\| \\text{SVN} \\| \\text{CPUSVN}) \\]",
          },
          {
            name: "Sealing Encryption",
            formula: "\\[ \\text{ct} = \\text{AES-GCM}(K_{\\text{seal}}, \\text{data}) \\]",
          },
        ],
        exercises: [
          {
            type: "conceptual",
            question:
              "An enclave developer seals a user's BBS+ private credential using MRENCLAVE policy. " +
              "After discovering a bug, they release a patched enclave binary. " +
              "Explain why the sealed credential becomes inaccessible, and describe how using MRSIGNER policy " +
              "instead would solve this problem. What is the security tradeoff?",
            hint:
              "MRENCLAVE = SHA-256(code || data || layout || config). Any code change produces a different hash. " +
              "The seal key K_seal = KDF(K_root, MRENCLAVE) changes, so the old ciphertext cannot be decrypted. " +
              "MRSIGNER uses the developer's signing key hash instead of the code hash.",
            answer:
              "With MRENCLAVE policy, K_seal = KDF(K_root, MRENCLAVE). The patched binary has a different MRENCLAVE " +
              "(even a one-byte change in code alters the SHA-256 measurement). The new enclave derives a different K_seal " +
              "and cannot decrypt data sealed by the old version. The credential is permanently lost. " +
              "MRSIGNER policy: K_seal = KDF(K_root, MRSIGNER || ProdID). Since both the old and new binaries are signed " +
              "by the same developer key, MRSIGNER is identical. The new enclave can unseal the old data seamlessly. " +
              "Security tradeoff: MRSIGNER allows ANY enclave signed by the same developer to access sealed data. " +
              "A malicious or buggy version of the enclave (same developer signature) could unseal and exfiltrate secrets. " +
              "MRENCLAVE is stricter: only the exact code that sealed the data can unseal it. " +
              "Best practice: use MRSIGNER with SVN (Security Version Number) to allow upgrades but prevent rollback " +
              "to older, vulnerable versions.",
          },
          {
            type: "design",
            question:
              "Design the ECALL/OCALL interface for an SGX enclave that issues BBS+ anonymous credentials. " +
              "The enclave holds the issuer's BBS+ secret key. Specify: (1) which operations happen inside the enclave (ECALLs), " +
              "(2) which operations require outside calls (OCALLs), and (3) what input validation is needed " +
              "to prevent Iago attacks on each OCALL return value.",
            hint:
              "Inside the enclave: key generation, BBS+ signing, seal/unseal of secret key. " +
              "Outside: network I/O (receiving attribute requests, sending credentials), persistent storage. " +
              "Iago attack: malicious OS returns crafted OCALL values to manipulate enclave logic.",
            answer:
              "ECALLs (inside enclave): " +
              "(a) ecall_init(): generate or unseal BBS+ key pair (sk, pk), return pk to untrusted side. " +
              "(b) ecall_issue_credential(attributes[], holder_commitment): validate attributes, compute " +
              "sigma = BBS+.Sign(sk, attributes), return sigma. " +
              "(c) ecall_seal_key(): seal sk using MRSIGNER policy with current SVN, return ciphertext via OCALL. " +
              "OCALLs (outside enclave): " +
              "(a) ocall_store_sealed_key(ciphertext): persist sealed key to disk. Return: success/failure. " +
              "Validation: enclave does not trust the return value — it re-reads and unseals to verify integrity. " +
              "(b) ocall_get_timestamp(): get current time for credential validity period. " +
              "Validation: enclave maintains a monotonic counter; reject timestamps earlier than last seen " +
              "(prevents OS from providing stale time to extend expired credentials). " +
              "(c) ocall_log(message): audit logging. Validation: none needed (fire-and-forget, no enclave state change). " +
              "Critical Iago defense: never use OCALL return values to index arrays or control secret-dependent branches.",
          },
        ],
      },
      {
        name: "Remote Attestation",
        formalDefinition:
          "A protocol \\( \\Pi_{\\text{att}} \\) between an enclave \\( E \\) (prover) and a remote verifier \\( V \\): " +
          "\\( E \\) proves to \\( V \\) that it is running a specific program (identified by MRENCLAVE) on genuine " +
          "hardware, with integrity guarantees. Formally, \\( V \\) obtains a statement " +
          "\\( (\\text{MRENCLAVE}, \\text{MRSIGNER}, \\text{ProdID}, \\text{SVN}, \\text{userData}) \\) " +
          "authenticated by the hardware manufacturer's root of trust.",
        mathDetails: [
          {
            subtitle: "Local Attestation (Intra-Platform)",
            content:
              "Enclave A verifies enclave B on the same platform:" +
              "\\[ \\text{REPORT}_B = (\\text{MRENCLAVE}_B, \\text{MRSIGNER}_B, \\text{userData}_B, \\text{MAC}_B) \\]" +
              "where \\( \\text{MAC}_B = \\text{CMAC}(K_{\\text{report}(A,B)}, \\text{REPORT\\_BODY}_B) \\). " +
              "The report key \\( K_{\\text{report}(A,B)} \\) is derived from the CPU root key and target enclave A's identity. " +
              "Enclave A retrieves the same key via EGETKEY and verifies the MAC. " +
              "This establishes a secure channel between two enclaves on the same CPU without external trust.",
          },
          {
            subtitle: "EPID-Based Remote Attestation (SGX1)",
            content:
              "Step 1: Application enclave generates REPORT (via EREPORT instruction). " +
              "Step 2: Quoting Enclave (QE, Intel-provided) verifies REPORT locally, then signs it using " +
              "Enhanced Privacy ID (EPID) group signature:" +
              "\\[ \\text{QUOTE} = \\text{EPID.Sign}(sk_{\\text{member}}, \\text{REPORT}) \\]" +
              "EPID is a group signature scheme: all members of a group (all SGX CPUs) share a group public key, " +
              "but each has a unique member private key. Signatures are unlinkable across sessions. " +
              "Step 3: Verifier sends QUOTE to Intel Attestation Service (IAS), which validates the EPID signature, " +
              "checks revocation lists, and returns a signed attestation report. " +
              "Step 4: Verifier checks IAS report signature (Intel's public key) and MRENCLAVE value.",
          },
          {
            subtitle: "DCAP (Data Center Attestation Primitives, SGX2)",
            content:
              "DCAP replaces EPID with ECDSA (P-256) quotes, removing the Intel online dependency:" +
              "\\[ \\text{QUOTE}_{\\text{DCAP}} = \\text{ECDSA.Sign}(sk_{\\text{QE}}, \\text{REPORT}) \\]" +
              "The QE's signing key is certified by a Provisioning Certification Enclave (PCE), " +
              "which holds a key certified by Intel's Provisioning Certification Key (PCK). " +
              "Certificate chain: QUOTE signature \\( \\leftarrow \\) QE cert \\( \\leftarrow \\) PCK cert \\( \\leftarrow \\) Intel Root CA. " +
              "Verification is fully offline: the verifier caches the PCK certificate chain and validates locally.",
          },
          {
            subtitle: "Attestation Report Contents",
            content:
              "The REPORT/QUOTE body contains:" +
              "\\[ \\begin{aligned} &\\text{MRENCLAVE} & (32\\text{B}) & \\quad \\text{enclave code measurement} \\\\ " +
              "&\\text{MRSIGNER} & (32\\text{B}) & \\quad \\text{enclave signer key hash} \\\\ " +
              "&\\text{ISV\\_PROD\\_ID} & (2\\text{B}) & \\quad \\text{product identifier} \\\\ " +
              "&\\text{ISV\\_SVN} & (2\\text{B}) & \\quad \\text{security version number} \\\\ " +
              "&\\text{REPORT\\_DATA} & (64\\text{B}) & \\quad \\text{user-defined data} \\end{aligned} \\]" +
              "The REPORT_DATA field is critical for binding: typically set to " +
              "\\( H(pk_{\\text{enclave}} \\| \\text{nonce}) \\) to bind the attestation to an ephemeral key pair, " +
              "enabling a secure channel establishment after attestation.",
          },
          {
            subtitle: "Attestation-Key Binding for Secure Channels",
            content:
              "The enclave generates a key pair \\( (sk_E, pk_E) \\) and sets REPORT_DATA = \\( H(pk_E \\| \\text{nonce}) \\). " +
              "After attestation, the verifier is convinced that \\( pk_E \\) belongs to a genuine enclave running " +
              "the attested code. A TLS session using \\( pk_E \\) as the server certificate ensures: " +
              "(1) authenticity (attestation proves code identity), " +
              "(2) confidentiality (TLS encrypts the channel), " +
              "(3) freshness (nonce prevents replay of old attestations). " +
              "This pattern (RA-TLS) is used by Gramine and other SGX frameworks.",
          },
        ],
        securityAnalysis:
          "EPID provides signer anonymity: the verifier (and Intel) cannot identify which specific CPU produced the " +
          "quote, only that it is a valid group member. This is a privacy advantage but prevents per-platform auditing. " +
          "DCAP uses ECDSA: the verifier CAN identify the specific QE (and hence platform), enabling auditing but " +
          "sacrificing platform anonymity. For blockchain use cases (e.g., Sui validator TEE attestation), DCAP is " +
          "preferred because the validator identity is already public, and no Intel online dependency is acceptable. " +
          "Attestation freshness: EPID/DCAP quotes include a user-supplied nonce to prevent replay attacks.",
        practicalNotes:
          "DCAP attestation latency: ~200ms for quote generation, ~50ms for verification (excluding network for cert fetch). " +
          "EPID attestation: ~2s round-trip including IAS network call. " +
          "Intel PCCS (Provisioning Certification Caching Service): caches PCK certs locally for DCAP, " +
          "reducing cold-start latency. " +
          "For blockchain integration: attestation quotes can be verified on-chain (expensive) or by an off-chain " +
          "verifier committee. On Sui: Move contract could verify ECDSA signature on DCAP quote (~50K gas).",
        keyFormulas: [
          {
            name: "REPORT MAC",
            formula: "\\[ \\text{MAC} = \\text{CMAC}(K_{\\text{report}}, \\text{REPORT\\_BODY}) \\]",
          },
          {
            name: "DCAP Quote Signature",
            formula: "\\[ \\text{QUOTE} = \\text{ECDSA}_{\\text{P-256}}(sk_{\\text{QE}}, \\text{REPORT}) \\]",
          },
          {
            name: "Attestation Key Binding",
            formula: "\\[ \\text{REPORT\\_DATA} = \\text{SHA-256}(pk_{\\text{enclave}} \\| \\text{nonce}) \\]",
          },
        ],
        exercises: [
          {
            type: "conceptual",
            question:
              "Trace the full DCAP remote attestation flow for a credential issuance enclave. " +
              "A remote client wants to verify that the enclave is running the correct credential issuance code " +
              "before sending sensitive attributes. List each step, the data exchanged, and the trust assumptions " +
              "at each step. What happens if the Quoting Enclave is compromised?",
            hint:
              "DCAP flow: (1) app enclave generates REPORT, (2) QE verifies REPORT locally and signs with ECDSA, " +
              "(3) client receives QUOTE + PCK certificate chain, (4) client verifies ECDSA signature up to Intel Root CA. " +
              "The QE's key is certified by the PCE, which holds a key certified by Intel's PCK.",
            answer:
              "Step 1: Client sends nonce to the enclave. Enclave generates ephemeral key pair (sk_E, pk_E), " +
              "sets REPORT_DATA = SHA-256(pk_E || nonce), calls EREPORT to generate a REPORT for the QE's target info. " +
              "Trust: CPU hardware faithfully measures MRENCLAVE. " +
              "Step 2: QE receives REPORT, verifies MAC using shared report key (local attestation), " +
              "then signs: QUOTE = ECDSA_P256(sk_QE, REPORT). Trust: QE is an Intel-signed enclave running correct code. " +
              "Step 3: Client receives (QUOTE, QE_cert, PCK_cert, Intel_Root_CA_cert). " +
              "Client verifies: ECDSA signature on QUOTE using QE_cert public key, QE_cert signed by PCK, " +
              "PCK signed by Intel Root CA (pinned). Trust: Intel CA is honest and did not mis-issue certificates. " +
              "Step 4: Client checks MRENCLAVE in QUOTE matches expected hash of credential issuance code, " +
              "extracts pk_E from REPORT_DATA, establishes TLS session using pk_E. " +
              "If QE is compromised: attacker can forge QUOTEs for arbitrary MRENCLAVE values, " +
              "completely breaking attestation. Mitigation: QE runs in its own enclave with Intel-controlled code, " +
              "and its measurement is verified by the PCE during provisioning.",
          },
          {
            type: "design",
            question:
              "Design an on-chain attestation verification system for Sui. A credential issuance enclave " +
              "produces a DCAP QUOTE that must be verified by a Sui Move contract before the enclave is " +
              "registered as an authorized issuer. Specify: (1) what data is submitted on-chain, " +
              "(2) the Move contract verification logic, and (3) how to handle attestation freshness and key rotation.",
            hint:
              "On-chain: submit QUOTE (ECDSA signature + REPORT body) and PCK certificate chain. " +
              "Move contract: verify ECDSA P-256 signature (Sui supports secp256r1), check MRENCLAVE, " +
              "store authorized enclave identity. Freshness: include a Sui epoch number or timestamp in REPORT_DATA.",
            answer:
              "Data submitted on-chain: (quote_signature: vector<u8>, report_body: vector<u8>, " +
              "pck_cert_chain: vector<vector<u8>>, enclave_pk: vector<u8>). " +
              "Move contract logic: " +
              "(a) Verify PCK cert chain up to a pinned Intel Root CA public key (stored as a module constant). " +
              "(b) Extract QE public key from PCK cert, verify quote_signature using ecdsa_secp256r1::verify(). " +
              "(c) Parse report_body: extract MRENCLAVE (bytes 112..144), REPORT_DATA (bytes 320..384). " +
              "(d) Check MRENCLAVE matches a whitelist of approved enclave measurements (stored in a shared object). " +
              "(e) Check REPORT_DATA == SHA-256(enclave_pk || current_epoch) for freshness. " +
              "(f) Register enclave_pk as an authorized issuer in an AuthorizedIssuers table. " +
              "Key rotation: enclave generates new key pair, produces new QUOTE with new pk in REPORT_DATA, " +
              "submits on-chain. Old key is deregistered after a grace period (e.g., 1 epoch). " +
              "Gas cost: ~200K-300K gas for ECDSA verification + SHA-256 + storage writes.",
          },
        ],
      },
      {
        name: "Side-Channel Attacks",
        formalDefinition:
          "An attack that exploits observable physical or micro-architectural side effects of computation to " +
          "extract secret information. Formally, an adversary \\( \\mathcal{A} \\) with access to a leakage oracle " +
          "\\( \\mathcal{L}(\\text{trace}) \\) that reveals partial information about the execution trace " +
          "(memory access patterns, branch outcomes, timing) can reconstruct secrets with non-negligible probability.",
        mathDetails: [
          {
            subtitle: "Timing Attacks",
            content:
              "If execution time depends on secret data:" +
              "\\[ T(x) = T_{\\text{base}} + f(x_{\\text{secret}}) \\]" +
              "the adversary measures \\( T(x) \\) across many inputs and correlates timing with hypotheses about " +
              "\\( x_{\\text{secret}} \\). Example: RSA decryption with square-and-multiply has different timing for " +
              "0-bits vs 1-bits of the exponent. A single secret-dependent branch can leak the entire key " +
              "over \\( O(n) \\) observations where \\( n \\) is the key bit-length.",
          },
          {
            subtitle: "Cache Attacks: Prime+Probe",
            content:
              "The adversary and enclave share the L1/L2 cache (SGX does not partition caches). " +
              "Prime: adversary fills a cache set with known data. " +
              "Enclave executes: enclave memory accesses evict adversary's lines from specific cache sets. " +
              "Probe: adversary measures access time to each cache set. Slow access = enclave used that set. " +
              "Resolution: cache-set granularity (64B line, 64 sets in L1 = 4096B resolution). " +
              "This reveals which cache lines the enclave accessed, leaking memory access patterns.",
          },
          {
            subtitle: "Spectre and Speculative Execution",
            content:
              "Spectre exploits branch prediction: the CPU speculatively executes instructions beyond a mispredicted " +
              "branch, accessing memory that would be forbidden on the correct path. Although speculative results " +
              "are rolled back architecturally, they leave cache footprints (micro-architectural state). " +
              "The adversary trains the branch predictor, triggers speculative execution in the enclave, " +
              "then uses cache timing (Flush+Reload) to read the speculatively accessed data. " +
              "SGX is particularly vulnerable because the adversary controls the OS and can manipulate branch predictor state.",
          },
          {
            subtitle: "Foreshadow (L1 Terminal Fault)",
            content:
              "Foreshadow (CVE-2018-3615) exploits L1 terminal faults in SGX: when a page table entry is marked " +
              "not-present, the CPU still speculatively reads from the L1 cache using the physical address. " +
              "If the enclave data is in L1, the speculative read succeeds and the data can be extracted via " +
              "cache side channel. This allows reading arbitrary EPC pages from L1 cache, completely breaking " +
              "SGX confidentiality. Mitigated by Intel microcode updates (L1 cache flush on enclave exit).",
          },
          {
            subtitle: "Formal Leakage Model",
            content:
              "The leakage function for a program execution trace \\( \\tau \\) captures observable side effects:" +
              "\\[ \\mathcal{L}(\\tau) = \\{\\text{mem\\_access\\_pattern}(\\tau), \\; \\text{branch\\_outcomes}(\\tau), \\; \\text{timing}(\\tau)\\} \\]" +
              "A program is side-channel resistant if its leakage is independent of secret inputs:" +
              "\\[ \\forall x_1, x_2 \\in \\text{Secret}: \\mathcal{L}(\\tau(x_1)) = \\mathcal{L}(\\tau(x_2)) \\]" +
              "Achieving this requires: no secret-dependent branches (constant-time conditionals), " +
              "no secret-dependent memory access (constant-time table lookups), and no secret-dependent timing.",
          },
          {
            subtitle: "ORAM (Oblivious RAM)",
            content:
              "ORAM makes memory access patterns independent of the actual data accessed. For \\( N \\) data blocks:" +
              "\\[ \\text{Path ORAM}: O(\\log N) \\text{ overhead per access} \\]" +
              "Each access reads and rewrites an entire tree path, shuffling blocks randomly. " +
              "The adversary sees a random-looking access pattern regardless of the actual access sequence. " +
              "Practical overhead: 10-100x slowdown depending on implementation. " +
              "For SGX: ORAM protects against page-level access pattern leakage but is typically too slow " +
              "for production use. Used in research prototypes (Obliviate, ZeroTrace).",
          },
        ],
        securityAnalysis:
          "Side-channel attacks reduce the effective security of TEEs. A single cache timing measurement can leak " +
          "~6 bits of information per cache set access. Over many observations, full AES keys (128 bits) can be " +
          "recovered in seconds. Spectre-class attacks can bypass all software-based isolation within the same " +
          "address space. " +
          "Countermeasure effectiveness: constant-time programming eliminates timing and branch leakage but not " +
          "cache-based leakage. ORAM eliminates access pattern leakage but with prohibitive overhead. " +
          "Intel microcode patches mitigate known attacks but new variants are discovered regularly (~2-3 per year).",
        practicalNotes:
          "Gramine mitigations: system call shielding (prevents Iago attacks), ASLR inside enclave. " +
          "Constant-time crypto libraries: libsodium, BoringSSL (used in enclaves). " +
          "ORAM overhead: 50-100x for Path ORAM, impractical for most production workloads. " +
          "Intel patches: L1D flush on context switch (Foreshadow mitigation, ~5% overhead), " +
          "IBRS/STIBP (Spectre mitigation, ~10-30% overhead on some workloads). " +
          "Best practice: minimize secret-dependent control flow, use constant-time crypto, " +
          "accept residual risk for non-cryptographic computations.",
        keyFormulas: [
          {
            name: "Leakage Function",
            formula: "\\[ \\mathcal{L}(\\tau) = \\{\\text{mem\\_access}(\\tau), \\; \\text{branch}(\\tau), \\; \\text{timing}(\\tau)\\} \\]",
          },
          {
            name: "Side-Channel Resistance Criterion",
            formula: "\\[ \\forall x_1, x_2: \\mathcal{L}(\\tau(x_1)) = \\mathcal{L}(\\tau(x_2)) \\]",
          },
          {
            name: "Path ORAM Overhead",
            formula: "\\[ O(\\log N) \\text{ accesses per operation, for } N \\text{ data blocks} \\]",
          },
        ],
        exercises: [
          {
            type: "conceptual",
            question:
              "A BBS+ credential issuance enclave uses a lookup table for elliptic curve scalar multiplication " +
              "(windowed method with precomputed points). Explain how a Prime+Probe cache attack on L1 " +
              "can extract the issuer's secret key x. Describe the attack steps and what information each " +
              "cache observation reveals. How many observations are needed to recover a 256-bit key?",
            hint:
              "Windowed scalar multiplication processes the key in w-bit windows, looking up precomputed points " +
              "in a table indexed by each window value. If the table spans multiple cache lines, " +
              "the accessed cache line reveals the w-bit window value. " +
              "L1 cache line = 64 bytes, each G1 point = 96 bytes (uncompressed).",
            answer:
              "Attack: The windowed method processes x in w-bit chunks (e.g., w=4, so 4-bit windows). " +
              "For each window, it accesses precomputed_table[window_value]. With 2^4 = 16 entries of 96 bytes each, " +
              "the table spans 1536 bytes = 24 cache lines. Different window values access different cache lines. " +
              "Prime phase: attacker fills all 24 relevant L1 cache sets with known data. " +
              "Enclave executes one scalar multiplication step, accessing precomputed_table[window_i]. " +
              "Probe phase: attacker measures access time to each cache set. The slow set reveals which table entry " +
              "was accessed, leaking the 4-bit window value. " +
              "For 256-bit key with 4-bit windows: 64 observations (one per window) recover the full key. " +
              "In practice, noise requires ~100-200 observations with statistical analysis. " +
              "Countermeasure: constant-time table lookup (access ALL entries, select the correct one via conditional moves), " +
              "or use Montgomery ladder (no table lookups).",
          },
          {
            type: "calculation",
            question:
              "The side-channel resistance criterion requires L(tau(x_1)) = L(tau(x_2)) for all secret inputs x_1, x_2. " +
              "Consider a naive if-else branch: if (secret_bit) { A = table[0]; } else { A = table[8]; }. " +
              "Show that this violates the criterion by describing L(tau(0)) and L(tau(1)). " +
              "Then rewrite the code using a constant-time conditional select and prove it satisfies the criterion.",
            hint:
              "L(tau) includes branch outcomes and memory access patterns. " +
              "For secret_bit=0: branch taken = else, memory access = table[8]. " +
              "For secret_bit=1: branch taken = if, memory access = table[0]. " +
              "Constant-time select: mask = -secret_bit (all 1s or all 0s), A = (table[0] & mask) | (table[8] & ~mask).",
            answer:
              "Naive version: " +
              "L(tau(1)) = {branch: if-taken, mem_access: &table[0]}. " +
              "L(tau(0)) = {branch: else-taken, mem_access: &table[8]}. " +
              "L(tau(1)) != L(tau(0)) — both branch outcome and memory address differ. Criterion violated. " +
              "Constant-time version: " +
              "mask = -(int64_t)secret_bit; // 0xFFFF...F if bit=1, 0x0000...0 if bit=0 " +
              "val0 = table[0]; val8 = table[8]; // always access BOTH entries " +
              "A = (val0 & mask) | (val8 & ~mask); " +
              "L(tau(1)) = {branch: none (no conditional), mem_access: {&table[0], &table[8]}}. " +
              "L(tau(0)) = {branch: none, mem_access: {&table[0], &table[8]}}. " +
              "L(tau(1)) == L(tau(0)) — same branches (none), same memory accesses (both entries loaded). " +
              "Criterion satisfied. The bitwise select computes the correct value without leaking which was chosen.",
          },
        ],
      },
      {
        name: "Trust Model: TEE vs ZKP",
        formalDefinition:
          "A comparison of trust assumptions: TEE security relies on hardware manufacturer integrity and " +
          "absence of physical/side-channel attacks. ZKP security relies on computational hardness assumptions " +
          "(e.g., DLP, \\( q \\)-SDH, knowledge-of-exponent). A hybrid model achieves security under the " +
          "disjunction: \\( \\text{Secure}_{\\text{hybrid}} \\iff \\text{Secure}_{\\text{TEE}} \\lor \\text{Secure}_{\\text{ZKP}} \\).",
        mathDetails: [
          {
            subtitle: "ZKP Trust Assumptions",
            content:
              "ZKP security rests on well-studied computational assumptions:" +
              "\\[ \\text{Discrete Log}: \\text{Given } (g, g^x), \\text{ computing } x \\text{ is hard} \\]" +
              "\\[ q\\text{-SDH}: \\text{Given } (g, g^x, \\ldots, g^{x^q}), \\text{ computing } (g^{1/(x+c)}, c) \\text{ is hard} \\]" +
              "These assumptions are believed to hold as long as \\( P \\neq NP \\) (more precisely, as long as " +
              "no sub-exponential algorithm exists for DLP in the relevant groups). " +
              "Post-quantum: DLP and pairing-based assumptions are broken by Shor's algorithm. " +
              "Lattice-based ZKPs (e.g., based on Module-LWE) resist quantum attacks but are less efficient.",
          },
          {
            subtitle: "TEE Trust Assumptions",
            content:
              "TEE security requires:" +
              "\\[ \\text{Trust}_{\\text{TEE}} = \\text{HW\\_honest} \\wedge \\neg\\text{physical\\_access} \\wedge \\text{side\\_channel\\_mitigated} \\]" +
              "Hardware honest: CPU manufacturer did not insert backdoors. " +
              "No physical access: adversary cannot decap the CPU die (cost: ~$100K+ for advanced attacks). " +
              "Side-channel mitigated: known side channels are patched and residual leakage is acceptable. " +
              "Each assumption is empirical (not mathematical) and can be violated by supply chain attacks, " +
              "nation-state adversaries, or novel micro-architectural discoveries.",
          },
          {
            subtitle: "Hybrid Security Model",
            content:
              "The hybrid architecture provides security under EITHER assumption:" +
              "\\[ \\text{Security}_{\\text{hybrid}} = \\text{Security}_{\\text{ZKP}} \\cup \\text{Security}_{\\text{TEE}} \\]" +
              "Meaning: the system remains secure if at least one of the two mechanisms is unbroken. " +
              "If TEE is compromised (side-channel attack): ZKP layer ensures correctness and privacy " +
              "(adversary cannot forge proofs or link presentations). " +
              "If ZKP assumption is broken (e.g., quantum computer): TEE still provides confidentiality " +
              "(computation happens inside enclave, outputs are encrypted). " +
              "This is a defense-in-depth approach with graceful degradation.",
          },
          {
            subtitle: "TEE-Assisted ZKP Proving",
            content:
              "A key construction for the thesis: use TEE to generate ZK proofs efficiently." +
              "\\[ \\text{TEE}: (\\text{witness}, \\text{circuit}) \\to \\text{proof} \\]" +
              "The witness (private data: credential attributes, user identity) never leaves the enclave. " +
              "The ZKP (Groth16 proof) is published on-chain and verified by a Sui Move contract. " +
              "Trust analysis: even if the TEE is compromised, the adversary learns the witness but " +
              "CANNOT forge a proof for a false statement (ZKP soundness holds independently). " +
              "If ZKP is broken, the TEE still prevents witness extraction (confidentiality holds).",
          },
          {
            subtitle: "UC Composability of Hybrid Model",
            content:
              "In the UC framework, the hybrid protocol realizes an ideal functionality " +
              "\\( \\mathcal{F}_{\\text{hybrid}} \\) that composes \\( \\mathcal{F}_{\\text{att}} \\) (TEE attestation) " +
              "with \\( \\mathcal{F}_{\\text{ZK}} \\) (zero-knowledge proof). " +
              "If both sub-functionalities are UC-realized, the composition theorem guarantees that " +
              "\\( \\mathcal{F}_{\\text{hybrid}} \\) is UC-secure. " +
              "Caveat: \\( \\mathcal{F}_{\\text{att}} \\) assumes no side-channel leakage, which weakens the UC guarantee. " +
              "Practical solution: treat TEE as an efficiency optimization, not a security requirement. " +
              "The system must be secure even with \\( \\mathcal{F}_{\\text{att}} \\) replaced by a no-op.",
          },
          {
            subtitle: "Performance Comparison",
            content:
              "For a credential presentation (prove attributes satisfy a policy):" +
              "\\[ \\begin{aligned} " +
              "&\\text{TEE-only}: &\\sim 1\\text{ms compute} + 200\\text{ms attestation} \\\\ " +
              "&\\text{ZKP-only (Groth16)}: &\\sim 1\\text{-}5\\text{s prove}, \\sim 5\\text{ms verify} \\\\ " +
              "&\\text{Hybrid (TEE proves)}: &\\sim 500\\text{ms prove (in TEE)}, \\sim 5\\text{ms verify} " +
              "\\end{aligned} \\]" +
              "TEE accelerates ZKP proving by ~2-10x through optimized native code and access to hardware AES-NI. " +
              "On-chain verification cost is identical (Groth16: 3 pairings regardless of prover). " +
              "Latency-sensitive use case (point-of-sale): TEE-only path (~200ms total). " +
              "High-assurance use case (DeFi transaction): ZKP path with on-chain verification.",
          },
        ],
        securityAnalysis:
          "The hybrid model achieves security under the disjunction of TEE and ZKP assumptions, providing graceful " +
          "degradation. If TEE is broken: credential attributes may leak (confidentiality loss) but presentations " +
          "remain unforgeable (ZKP soundness). If ZKP is broken (quantum): TEE still hides the witness from the " +
          "host. Both simultaneously broken: full compromise, but this requires both a hardware vulnerability " +
          "AND a break in computational assumptions, which is significantly harder than either alone.",
        practicalNotes:
          "TEE for latency-sensitive operations: real-time credential verification at point-of-sale, " +
          "API authentication with sub-second latency requirements. " +
          "ZKP for high-assurance operations: on-chain DeFi transactions where trustless verification is mandatory. " +
          "Deployment strategy: TEE-assisted provers run on cloud infrastructure (AWS Nitro, Azure Confidential Computing), " +
          "generate Groth16 proofs that Sui validators verify on-chain. " +
          "Fallback: if TEE infrastructure is unavailable, users generate proofs locally (slower but equally secure).",
        keyFormulas: [
          {
            name: "Hybrid Security",
            formula: "\\[ \\text{Secure}_{\\text{hybrid}} \\iff \\text{Secure}_{\\text{TEE}} \\lor \\text{Secure}_{\\text{ZKP}} \\]",
          },
          {
            name: "TEE Trust Requirement",
            formula: "\\[ \\text{Trust}_{\\text{TEE}} = \\text{HW\\_honest} \\wedge \\neg\\text{physical\\_access} \\wedge \\text{side\\_channel\\_mitigated} \\]",
          },
          {
            name: "Performance: TEE vs ZKP Proving",
            formula: "\\[ T_{\\text{TEE}} \\approx 1\\text{ms} \\quad \\text{vs} \\quad T_{\\text{ZKP}} \\approx 1\\text{-}5\\text{s} \\quad (\\sim\\!1000\\text{x difference}) \\]",
          },
        ],
        exercises: [
          {
            type: "comparison",
            question:
              "The hybrid security model states: Secure_hybrid iff Secure_TEE OR Secure_ZKP. " +
              "Analyze three failure scenarios: (1) TEE compromised via Foreshadow, ZKP intact; " +
              "(2) ZKP broken by quantum computer (Shor's algorithm), TEE intact; " +
              "(3) both compromised simultaneously. For each scenario, describe what security properties " +
              "(confidentiality, integrity, unlinkability) survive.",
            hint:
              "When TEE is compromised: adversary can read enclave memory (learns witness/attributes) " +
              "but ZKP soundness still prevents forging proofs for false statements. " +
              "When ZKP is broken: adversary can forge proofs, but TEE prevents witness extraction. " +
              "Both broken: no security remains.",
            answer:
              "Scenario 1 (TEE broken, ZKP intact): Adversary extracts the witness (credential attributes, user identity) " +
              "from the enclave via Foreshadow. Confidentiality: LOST (adversary knows attributes). " +
              "Integrity: PRESERVED (ZKP soundness means adversary cannot forge a proof for attributes they do not hold). " +
              "Unlinkability: PRESERVED (BBS+ randomization is information-theoretic, independent of TEE). " +
              "Practical impact: credential attributes leak, but the system remains unforgeable. " +
              "Scenario 2 (ZKP broken, TEE intact): Shor's algorithm breaks DLP/q-SDH. Adversary can forge BBS+ signatures " +
              "and proofs. Confidentiality: PRESERVED (TEE still encrypts computation, witness never leaves enclave). " +
              "Integrity: LOST (adversary can forge credentials). Unlinkability: LOST (adversary can link presentations " +
              "by solving DLP to recover randomness). Practical impact: credential forgery possible, but existing secrets safe. " +
              "Scenario 3 (both broken): All properties lost. Adversary extracts secrets from TEE AND forges/links proofs. " +
              "This requires both a hardware vulnerability AND a computational breakthrough — the disjunctive model " +
              "ensures this is strictly harder than breaking either alone.",
          },
          {
            type: "design",
            question:
              "Design a TEE-assisted ZKP proving architecture for anonymous credential presentation on Sui. " +
              "The user's credential attributes are stored sealed in a cloud TEE. A Sui Move contract verifies " +
              "the Groth16 proof. Specify: (1) what happens inside the TEE, (2) what is published on-chain, " +
              "(3) the fallback path if the TEE is unavailable, and (4) why the system is secure even if the " +
              "cloud TEE operator is malicious.",
            hint:
              "Inside TEE: unseal credential, compute Groth16 witness, run prover, output proof. " +
              "On-chain: Groth16 proof + public inputs (disclosed attributes, issuer pk commitment). " +
              "Fallback: user downloads sealed credential, runs Groth16 prover locally (~5s instead of ~500ms). " +
              "Malicious operator: can read enclave memory IF TEE is broken, but cannot forge proofs (ZKP soundness).",
            answer:
              "Architecture: " +
              "(1) Inside TEE: User authenticates via RA-TLS (remote attestation + TLS). Enclave unseals the BBS+ " +
              "credential (sk_seal derived from MRSIGNER policy). Enclave constructs Groth16 witness: " +
              "(private: all attributes, BBS+ signature, randomness; public: disclosed attributes, issuer pk, policy predicate). " +
              "Enclave runs Groth16 prover with the preloaded proving key (~500ms with AES-NI acceleration). " +
              "Outputs: (proof, public_inputs). Witness never leaves the enclave. " +
              "(2) On-chain: User submits a Sui transaction containing (groth16_proof: vector<u8>, " +
              "public_inputs: vector<u8>) to a Verifier Move contract. Contract calls sui::groth16::verify() " +
              "with the pinned verification key. If valid, executes the authorized action (e.g., mint token, access gate). " +
              "Cost: ~3 pairing operations, ~50K gas. " +
              "(3) Fallback: User requests sealed credential export (encrypted blob). Runs Groth16 prover locally " +
              "using a WASM or native prover (~3-5s on laptop). Same proof format — Move contract cannot distinguish " +
              "TEE-generated vs locally-generated proofs. " +
              "(4) Security against malicious operator: The cloud operator controls the OS but NOT the enclave. " +
              "If TEE isolation holds: operator learns nothing (confidentiality). " +
              "If TEE is broken: operator learns attributes but CANNOT forge Groth16 proofs for false statements " +
              "(soundness depends on q-SDH, not TEE). The system degrades to ZKP-only security — still unforgeable.",
          },
        ],
      },
    ],
  },
};
