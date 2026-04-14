/**
 * Ch 2.1 Anonymous Credentials — Papers Technical Companion
 * Deep mathematical / formal definitions paired with CH21_PAPERS.
 * Rendered with KaTeX: \\( ... \\) for inline, \\[ ... \\] for display.
 * Paper names MUST match ch21-papers-guide.js exactly.
 */

window.CH21_PAPERS_TECH = {
  papers: [
    /* ───────── 1. Revisiting BBS Signatures ───────── */
    {
      name: "Revisiting BBS Signatures",
      formalDefinition:
        "BBS signatures operate over a pairing-friendly group " +
        "\\( (\\mathbb{G}_1, \\mathbb{G}_2, \\mathbb{G}_T, e, p) \\) " +
        "where \\( e: \\mathbb{G}_1 \\times \\mathbb{G}_2 \\rightarrow \\mathbb{G}_T \\). " +
        "A BBS signature over message vector " +
        "\\( \\mathbf{m} = (m_1, \\ldots, m_L) \\in \\mathbb{Z}_p^L \\) " +
        "under key \\( (\\mathit{sk}, \\mathit{pk}) \\) is a triple " +
        "\\( \\sigma = (A, e, s) \\in \\mathbb{G}_1 \\times \\mathbb{Z}_p \\times \\mathbb{Z}_p \\) " +
        "satisfying " +
        "\\[ e(A,\\; \\tilde{w} \\cdot \\tilde{g}^{\\mathit{e}}) = " +
        "e\\!\\left(B,\\; \\tilde{g}\\right) \\]" +
        "where \\( B = g_0 \\cdot g_s^s \\cdot \\prod_{i=1}^L g_i^{m_i} \\in \\mathbb{G}_1 \\) " +
        "and \\( \\tilde{w} = \\tilde{g}^{\\mathit{sk}} \\in \\mathbb{G}_2 \\). " +
        "Tessaro and Zhu revisit the EUF-CMA security of this scheme " +
        "and propose a shorter variant dropping \\( s \\) from the signature, " +
        "reducing it to \\( (A, e) \\) under an augmented \\( B \\) definition.",
      mathDetails: [
        {
          subtitle: "EUF-CMA Security Definition",
          content:
            "A signature scheme is EUF-CMA (Existentially Unforgeable under Chosen-Message Attack) " +
            "if for any PPT adversary \\( \\mathcal{A} \\) given \\( \\mathit{pk} \\) and " +
            "access to a signing oracle \\( \\mathcal{O}_{\\text{sign}} \\), the probability of " +
            "producing a valid forgery \\( (\\mathbf{m}^*, \\sigma^*) \\) on a message not " +
            "previously queried is negligible:" +
            "\\[ \\Pr\\left[ \\text{Verify}(\\mathit{pk}, \\mathbf{m}^*, \\sigma^*) = 1 " +
            "\\;\\wedge\\; \\mathbf{m}^* \\notin Q \\right] \\leq \\mathrm{negl}(\\lambda) \\]" +
            "The original BBS+ proof required the \\( q \\)-SDH assumption with a subtle " +
            "subtraction argument; Tessaro-Zhu tighten this in the Algebraic Group Model (AGM)."
        },
        {
          subtitle: "q-SDH Assumption",
          content:
            "The \\( q \\)-Strong Diffie-Hellman assumption states that given " +
            "\\( (g, g^x, g^{x^2}, \\ldots, g^{x^q}) \\) in a cyclic group \\( \\mathbb{G} \\) " +
            "of prime order \\( p \\), no PPT adversary can output a pair " +
            "\\( (c, g^{1/(x+c)}) \\) for any \\( c \\in \\mathbb{Z}_p \\setminus \\{-x\\} \\):" +
            "\\[ \\Pr\\left[ \\mathcal{A}(g, g^x, \\ldots, g^{x^q}) = " +
            "\\left(c,\\; g^{1/(x+c)}\\right) \\right] \\leq \\mathrm{negl}(\\lambda) \\]" +
            "BBS+ signatures are secure under \\( q \\)-SDH because a forgery implies " +
            "extracting \\( g^{1/(\\mathit{sk} + e^*)} \\) — a \\( q \\)-SDH solution."
        },
        {
          subtitle: "Algebraic Group Model (AGM) Reduction",
          content:
            "In the AGM (Fuchsbauer, Kiltz, Loss 2018), every adversary that outputs " +
            "a group element \\( X \\in \\mathbb{G} \\) must also provide an " +
            "algebraic representation: " +
            "\\[ X = \\prod_{i} g_i^{\\alpha_i} \\]" +
            "for the input generators \\( g_i \\). Tessaro-Zhu use AGM to extract a " +
            "\\( q \\)-SDH solution from any EUF-CMA forgery, giving a tight reduction " +
            "without the lossy \\( q \\)-fold security loss in the standard model. " +
            "The shorter BBS variant \\( \\sigma = (A, e) \\) saves one \\( \\mathbb{G}_1 \\) " +
            "element (48 bytes on BLS12-381) per signature."
        },
        {
          subtitle: "Proof of Knowledge of Signature",
          content:
            "To prove possession of \\( \\sigma = (A, e, s) \\) without revealing it, " +
            "the holder randomizes: \\( A' = A^r \\) for random \\( r \\in \\mathbb{Z}_p \\), " +
            "computes \\( \\bar{A} = A'^{-e} \\cdot B'^{1} \\) and runs a Sigma protocol " +
            "proving knowledge of \\( (e, s, r, m_{i_1}, \\ldots) \\) such that the " +
            "pairing equation holds:" +
            "\\[ e(A', \\tilde{w}) \\cdot e(A', \\tilde{g})^e = e(B', \\tilde{g}) \\]" +
            "Using Fiat-Shamir, this becomes a non-interactive proof \\( \\pi \\) sound " +
            "under the discrete logarithm assumption and ROM."
        }
      ]
    },

    /* ───────── 2. SAAC ───────── */
    {
      name: "Server-Aided Anonymous Credentials",
      formalDefinition:
        "SAAC defines a tuple of PPT algorithms " +
        "\\( (\\mathsf{Setup}, \\mathsf{IssKeyGen}, \\mathsf{UsrKeyGen}, " +
        "\\mathsf{Obtain}, \\mathsf{Issue}, \\mathsf{Show}, \\mathsf{Verify}) \\) " +
        "where the Show algorithm is split between a user \\( U \\) and a " +
        "server \\( \\mathcal{S} \\). Security requires: " +
        "(1) \\textit{Correctness}: honest executions verify; " +
        "(2) \\textit{Unforgeability}: a user without a valid credential cannot " +
        "convince a verifier; " +
        "(3) \\textit{Blindness}: the issuer learns nothing about the user's " +
        "committed attributes during \\( \\mathsf{Obtain} \\); " +
        "(4) \\textit{Unlinkability}: even a colluding server and issuer cannot " +
        "link showings to each other or to the obtain phase.",
      mathDetails: [
        {
          subtitle: "Pairing-Free Construction (Statistical Anonymity)",
          content:
            "The statistical anonymity construction avoids pairings entirely, " +
            "using only group operations in a prime-order group \\( \\mathbb{G} \\) " +
            "of order \\( p \\). The credential \\( \\sigma \\) is a randomizable " +
            "blind signature. During \\( \\mathsf{Show} \\):" +
            "\\[ U \\rightarrow \\mathcal{S}: \\quad \\text{blinded} (\\sigma, m_1, \\ldots, m_L) \\]" +
            "\\[ \\mathcal{S} \\rightarrow U: \\quad \\text{partial proof} \\; \\pi_{\\text{server}} \\]" +
            "\\[ U \\rightarrow V: \\quad \\pi = \\text{Finalize}(\\pi_{\\text{server}}, \\text{local state}) \\]" +
            "Statistical anonymity means the server's view is identically distributed " +
            "for all users: \\( \\mathsf{View}_{\\mathcal{S}}(U_0) \\equiv \\mathsf{View}_{\\mathcal{S}}(U_1) \\)."
        },
        {
          subtitle: "Computational Anonymity Construction",
          content:
            "The computationally anonymous construction achieves lower overhead " +
            "by relying on a computational indistinguishability assumption. " +
            "The server receives a rerandomized commitment " +
            "\\( C' = C \\cdot g^r \\) for user-chosen random \\( r \\) and " +
            "returns a proof \\( \\pi_{\\text{server}} \\) over \\( C' \\). " +
            "Anonymity holds if the DDH problem is hard in \\( \\mathbb{G} \\): " +
            "\\[ \\{(g^a, g^b, g^{ab})\\} \\approx_c \\{(g^a, g^b, g^c)\\} \\]" +
            "for random \\( a, b, c \\in \\mathbb{Z}_p \\). " +
            "The user's final step verifies \\( \\pi_{\\text{server}} \\) and removes " +
            "the rerandomization factor, producing a fresh unlinkable credential showing."
        },
        {
          subtitle: "Security Against Colluding Server",
          content:
            "A key theorem of SAAC: even if \\( \\mathcal{S} \\) and the issuer collude, " +
            "they cannot link two showings from the same user. " +
            "Formally, for any PPT distinguisher \\( \\mathcal{D} \\):" +
            "\\[ \\left| \\Pr[\\mathcal{D}(\\mathsf{view}) = 1 \\mid b=0] - " +
            "\\Pr[\\mathcal{D}(\\mathsf{view}) = 1 \\mid b=1] \\right| \\leq \\mathrm{negl}(\\lambda) \\]" +
            "where \\( b \\) selects which user \\( U_b \\) produced the showing. " +
            "The proof proceeds by a hybrid argument replacing the user's blinding " +
            "factor with a uniformly random value, indistinguishable under DDH."
        }
      ]
    },

    /* ───────── 3. BBS+ for eIDAS 2.0 ───────── */
    {
      name: "Making BBS Anonymous Credentials eIDAS 2.0 Compliant",
      formalDefinition:
        "eIDAS 2.0 mandates that EU digital identity wallets support " +
        "selective disclosure, holder binding, revocation, and audit trails. " +
        "The paper formalizes compliance as a tuple of properties " +
        "\\( \\mathcal{P} = \\{\\mathsf{SD}, \\mathsf{HB}, \\mathsf{Rev}, \\mathsf{Aud}\\} \\) " +
        "and proves which BBS+ protocol variants satisfy each. " +
        "Selective disclosure is modeled as: for disclosed set " +
        "\\( D \\subseteq [L] \\) and hidden set \\( H = [L] \\setminus D \\), " +
        "the verifier learns only \\( \\{m_i\\}_{i \\in D} \\) and a proof " +
        "\\( \\pi \\) that \\( \\{m_i\\}_{i \\in H} \\) exist in a valid signed credential.",
      mathDetails: [
        {
          subtitle: "Holder Binding via Link Secret",
          content:
            "Holder binding is achieved by including a link secret " +
            "\\( \\ell_s \\in \\mathbb{Z}_p \\) as a hidden attribute in every credential. " +
            "The holder proves knowledge of \\( \\ell_s \\) in every showing, " +
            "binding all showings to the same holder without revealing \\( \\ell_s \\):" +
            "\\[ \\pi_{\\text{HB}}: \\quad \\exists\\, \\ell_s \\;:\\; " +
            "g_0^{\\ell_s} = C_{\\text{pub}} \\;\\wedge\\; " +
            "\\ell_s \\in \\mathbf{m} \\text{ in valid credential} \\sigma \\]" +
            "Under the discrete logarithm assumption, two proofs with the same " +
            "\\( C_{\\text{pub}} \\) are bound to the same holder."
        },
        {
          subtitle: "Revocation via Status List",
          content:
            "The paper proposes integrating W3C Status List 2021 with BBS+. " +
            "Each credential carries a status entry index \\( \\mathit{idx} \\). " +
            "The revocation check is a ZK range/membership proof:" +
            "\\[ \\pi_{\\text{Rev}}: \\quad \\mathit{idx} \\notin \\mathcal{R}_{\\text{epoch}} \\]" +
            "where \\( \\mathcal{R}_{\\text{epoch}} \\) is the published revocation set " +
            "for the current epoch. Using an accumulator \\( \\mathit{acc} \\), " +
            "this becomes a constant-size non-membership witness " +
            "verifiable in \\( O(1) \\) group operations."
        },
        {
          subtitle: "Audit Trail with ZK Accountability",
          content:
            "eIDAS 2.0 requires issuers to maintain audit logs without breaking " +
            "anonymity at showing time. The paper proposes that the issuer stores " +
            "encrypted credential metadata \\( \\mathsf{Enc}_{pk_{\\text{audit}}}(\\mathit{id}, t) \\) " +
            "at issuance, where \\( pk_{\\text{audit}} \\) belongs to a regulated auditor. " +
            "The audit log reveals nothing to the verifier (different key) while " +
            "allowing regulators with \\( sk_{\\text{audit}} \\) to trace issuances " +
            "if legally mandated — decoupled from showing-time anonymity."
        }
      ]
    },

    /* ───────── 4. zk-creds ───────── */
    {
      name: "zk-creds: Flexible Anonymous Credentials from zkSNARKs and Existing Identity Infrastructure",
      formalDefinition:
        "zk-creds models an anonymous credential as a zero-knowledge " +
        "proof of knowledge over a certificate chain. Given an " +
        "X.509 certificate \\( \\mathsf{cert} \\) signed by a CA " +
        "with key \\( \\mathit{sk}_{\\text{CA}} \\), the user proves:" +
        "\\[ \\pi_{\\text{zk-creds}}: \\quad " +
        "\\exists\\, (\\mathsf{cert}, \\mathit{sk}_{\\text{user}}) \\;:\\; " +
        "\\mathsf{Verify}_{\\mathit{pk}_{\\text{CA}}}(\\mathsf{cert}) = 1 " +
        "\\;\\wedge\\; P(\\mathsf{attrs}(\\mathsf{cert})) = 1 " +
        "\\;\\wedge\\; \\eta = H(\\mathit{sk}_{\\text{user}}, \\mathsf{scope}) \\]" +
        "where \\( \\eta \\) is the nullifier preventing double-registration " +
        "for scope \\( \\mathsf{scope} \\), and \\( P \\) is the disclosed " +
        "attribute predicate (e.g., age \\( \\geq 18 \\)).",
      mathDetails: [
        {
          subtitle: "RSA Signature Verification in Circuit",
          content:
            "The most expensive part of zk-creds is verifying an RSA-2048 signature " +
            "inside a zkSNARK circuit. RSA-PKCS#1 v1.5 verification requires computing " +
            "\\[ \\sigma^e \\pmod{N} \\overset{?}{=} H(\\mathsf{cert}) \\]" +
            "for public exponent \\( e \\) and modulus \\( N \\) (2048-bit). " +
            "In a Groth16 circuit over BN254, 2048-bit modular exponentiation " +
            "requires \\( \\sim 2^{17} \\) constraints using windowed arithmetic, " +
            "taking \\( \\approx 3\\text{-}5 \\) seconds proving time on a modern laptop."
        },
        {
          subtitle: "Nullifier Construction",
          content:
            "The nullifier \\( \\eta \\) ties one certificate to one blockchain slot " +
            "without revealing which certificate was used:" +
            "\\[ \\eta = H(\\mathit{sk}_{\\text{user}}, \\mathsf{scope}) \\in \\{0,1\\}^{256} \\]" +
            "Uniqueness follows from collision resistance of \\( H \\). " +
            "Unlinkability follows because \\( \\eta \\) is a PRF output: " +
            "given \\( \\eta \\), no PPT adversary can determine " +
            "\\( \\mathit{sk}_{\\text{user}} \\) or link \\( \\eta \\) to \\( \\mathsf{cert} \\) " +
            "without \\( \\mathit{sk}_{\\text{user}} \\). " +
            "Different scopes yield unlinkable nullifiers from the same certificate."
        },
        {
          subtitle: "Groth16 zkSNARK",
          content:
            "zk-creds uses Groth16 over BN254 with a circuit of depth " +
            "\\( \\sim 2^{20} \\) constraints. Groth16 produces constant-size " +
            "proofs \\( \\pi = (A, B, C) \\in \\mathbb{G}_1 \\times \\mathbb{G}_2 \\times \\mathbb{G}_1 \\) " +
            "(192 bytes on BN254). Verification requires 3 pairings:" +
            "\\[ e(A, B) = e(\\alpha, \\beta) \\cdot e(\\mathsf{inputs}, \\gamma) \\cdot e(C, \\delta) \\]" +
            "On-chain verification costs \\( \\sim 250{,}000 \\) gas on Ethereum, " +
            "translating to acceptable cost on Sui given its lower gas model."
        }
      ]
    },

    /* ───────── 5. Coconut ───────── */
    {
      name: "Coconut: Threshold Issuance Selective Disclosure Credentials with Applications to Distributed Ledgers",
      formalDefinition:
        "Coconut defines threshold BBS-like credentials over a bilinear " +
        "pairing \\( e: \\mathbb{G}_1 \\times \\mathbb{G}_2 \\rightarrow \\mathbb{G}_T \\). " +
        "A \\( (t, n) \\)-threshold signing key is " +
        "\\( \\mathit{sk} = \\sum_{i=1}^n \\mathit{sk}_i \\cdot \\lambda_i \\) " +
        "via Shamir secret sharing with Lagrange coefficients " +
        "\\( \\lambda_i \\). Each authority \\( i \\) produces a partial signature " +
        "\\( \\sigma_i = (h, h^{\\mathit{sk}_i \\cdot (m + \\mathit{sk}_i')}) \\in \\mathbb{G}_1^2 \\), " +
        "and any \\( t \\) partial signatures aggregate into a full " +
        "credential \\( \\sigma \\) verifiable against the aggregate public key.",
      mathDetails: [
        {
          subtitle: "Threshold Issuance via Shamir Sharing",
          content:
            "The master secret key \\( x \\in \\mathbb{Z}_p \\) is shared using a " +
            "degree-\\( (t-1) \\) polynomial \\( f(z) = x + a_1 z + \\cdots + a_{t-1} z^{t-1} \\). " +
            "Authority \\( i \\) holds \\( x_i = f(i) \\). Any \\( t \\) authorities " +
            "can reconstruct via Lagrange interpolation:" +
            "\\[ x = \\sum_{i \\in S} x_i \\cdot \\prod_{j \\in S, j \\neq i} " +
            "\\frac{-j}{i-j} \\pmod{p} \\]" +
            "Partial signatures are aggregated directly in \\( \\mathbb{G}_1 \\): " +
            "\\[ \\sigma = \\left(h,\\; \\prod_{i \\in S} \\sigma_i^{\\lambda_i}\\right) \\]"
        },
        {
          subtitle: "Selective Disclosure ZK Proof",
          content:
            "To disclose attributes \\( \\{m_i\\}_{i \\in D} \\) and hide \\( \\{m_j\\}_{j \\in H} \\), " +
            "the holder rerandomizes \\( \\sigma \\rightarrow \\sigma' = (h^r, \\sigma_2^r) \\) " +
            "and proves via Sigma protocol:" +
            "\\[ \\pi: \\quad e(\\sigma'_2, \\tilde{g}) = " +
            "e(\\sigma'_1, \\tilde{g}^x \\cdot \\prod_{i=1}^L \\tilde{h}_i^{m_i}) \\]" +
            "Hidden \\( m_j \\) are committed in the proof. " +
            "Unlinkability follows from the randomization of \\( \\sigma \\rightarrow \\sigma' \\): " +
            "each showing is a fresh uniformly random pair in \\( \\mathbb{G}_1^2 \\)."
        },
        {
          subtitle: "On-Chain Verification Complexity",
          content:
            "Coconut's on-chain verifier checks the pairing equation, requiring " +
            "2 pairing evaluations (each \\( O(1) \\) given precomputed values). " +
            "On Ethereum, this costs \\( \\sim 350{,}000 \\) gas. The proof size is " +
            "\\( 2 |\\mathbb{G}_1| + 2|\\mathbb{G}_2| + (L+3)|\\mathbb{Z}_p| \\) bytes — " +
            "roughly 800 bytes for \\( L = 5 \\) attributes on BLS12-381. " +
            "Compared to BBS+ SNARKed proofs (192 bytes Groth16), Coconut " +
            "proofs are \\( \\sim 4\\times \\) larger but avoid SNARK trusted setup."
        }
      ]
    },

    /* ───────── 6. Revocable TACO ───────── */
    {
      name: "Revocable Threshold Anonymous Credentials for Blockchains",
      formalDefinition:
        "Revocable TACO extends threshold anonymous credentials with " +
        "an epoch-based accumulator revocation scheme. A credential " +
        "\\( \\sigma \\) includes an epoch tag \\( \\tau \\in \\mathbb{Z}_p \\). " +
        "At each epoch \\( e \\), authorities publish an accumulator " +
        "\\( \\mathsf{acc}_e = \\prod_{j: \\text{active}} (z - \\tau_j) \\pmod{p} \\) " +
        "(or a pairing-based equivalent). The holder proves membership:" +
        "\\[ \\pi_{\\text{nonrev}}: \\quad \\exists\\, w \\;:\\; " +
        "\\mathsf{acc}_e \\cdot w = \\prod_{j \\neq \\mathit{idx}} (z - \\tau_j) \\]",
      mathDetails: [
        {
          subtitle: "Accumulator-Based Non-Revocation Proof",
          content:
            "A Camenisch-Lysyanskaya (CL) accumulator is used for compact non-revocation. " +
            "The accumulator value is \\( \\mathsf{acc} = g^{\\prod_{i \\in S} (x + \\tau_i)} \\) " +
            "for active set \\( S \\) and trapdoor \\( x \\). " +
            "The witness for \\( \\tau_j \\in S \\) is:" +
            "\\[ w_j = g^{\\prod_{i \\in S, i \\neq j} (x + \\tau_i)} \\]" +
            "Membership is proven ZK via:" +
            "\\[ e(w_j, \\tilde{g}^x \\cdot \\tilde{g}^{\\tau_j}) = e(\\mathsf{acc}, \\tilde{g}) \\]" +
            "Witness update after revocation requires one \\( \\mathbb{G}_1 \\) operation per active user."
        },
        {
          subtitle: "Threshold Revocation Authority",
          content:
            "Revocation decisions are made by a \\( (t, n) \\)-threshold committee. " +
            "Each authority \\( i \\) holds \\( x_i \\) (Shamir share of accumulator trapdoor). " +
            "To revoke credential with tag \\( \\tau_r \\), the committee computes " +
            "partial updates \\( \\Delta_i = \\mathsf{acc}^{1/(x_i + \\tau_r)} \\) and " +
            "the new accumulator is the Lagrange-weighted product:" +
            "\\[ \\mathsf{acc}' = \\prod_{i \\in T} \\Delta_i^{\\lambda_i} \\]" +
            "This preserves the threshold trust model: no \\( t-1 \\) authorities " +
            "can revoke a credential without the \\( t \\)-th member's cooperation."
        }
      ]
    },

    /* ───────── 7. Post-Quantum Traceable Anonymous Credentials ───────── */
    {
      name: "Post-Quantum Traceable Anonymous Credentials from Module Lattices",
      formalDefinition:
        "The scheme operates over a module lattice defined by a ring " +
        "\\( R_q = \\mathbb{Z}_q[X]/(X^n + 1) \\) and module " +
        "\\( R_q^k \\). Credentials are based on a Module-LWE " +
        "(MLWE) hard problem: given " +
        "\\( (\\mathbf{A}, \\mathbf{b} = \\mathbf{A}\\mathbf{s} + \\mathbf{e}) \\) " +
        "for secret \\( \\mathbf{s} \\in R_q^k \\) and small \\( \\mathbf{e} \\), " +
        "distinguish \\( \\mathbf{b} \\) from uniform. " +
        "Signatures use MSIS (Module Short Integer Solution) for unforgeability. " +
        "Traceability is achieved via an ElGamal-style encryption of the " +
        "user identity inside the credential commitment.",
      mathDetails: [
        {
          subtitle: "Module-LWE and MSIS Assumptions",
          content:
            "MLWE\\( (n, k, q, \\chi) \\): distinguish " +
            "\\( (\\mathbf{A}, \\mathbf{A}\\mathbf{s}+\\mathbf{e}) \\) from " +
            "\\( (\\mathbf{A}, \\mathbf{u}) \\) for " +
            "\\( \\mathbf{s}, \\mathbf{e} \\leftarrow \\chi^k \\), \\( \\mathbf{u} \\leftarrow R_q^k \\)." +
            "\\[ \\Pr[\\mathcal{A}(\\mathbf{A}, \\mathbf{A}\\mathbf{s}+\\mathbf{e}) = 1] - " +
            "\\Pr[\\mathcal{A}(\\mathbf{A}, \\mathbf{u}) = 1] \\leq \\mathrm{negl}(\\lambda) \\]" +
            "MSIS\\( (n, k, q, \\beta) \\): find \\( \\mathbf{x} \\in R_q^{k+1} \\) with " +
            "\\( \\|\\mathbf{x}\\|_\\infty \\leq \\beta \\) and " +
            "\\( [\\mathbf{A}|I]\\mathbf{x} = \\mathbf{0} \\). " +
            "Best known attack: BKZ lattice reduction, " +
            "cost \\( 2^{\\Omega(\\lambda)} \\) operations even for a quantum adversary."
        },
        {
          subtitle: "Lattice-Based Selective Disclosure",
          content:
            "Selective disclosure is achieved via lattice commitments. " +
            "A commitment to \\( m \\in R_q \\) is " +
            "\\( C = \\mathbf{a}_0 r + \\mathbf{a}_m m \\in R_q^k \\) for random \\( r \\). " +
            "Opening \\( m \\) while hiding others requires proving knowledge " +
            "of the committed value via a lattice zero-knowledge proof " +
            "(e.g., Fiat-Shamir with aborts):" +
            "\\[ \\pi: \\; \\exists\\, (r, m) \\;:\\; " +
            "C = \\mathbf{a}_0 r + \\mathbf{a}_m m " +
            "\\;\\wedge\\; \\|r\\|, \\|m\\| \\leq \\beta \\]" +
            "Proof sizes are \\( O(n \\cdot k \\cdot \\log q) \\) — typically " +
            "10-100× larger than pairing-based BBS+ proofs."
        }
      ]
    },

    /* ───────── 8. Camenisch-Lysyanskaya Signatures ───────── */
    {
      name: "Signature Schemes and Anonymous Credentials from Bilinear Maps",
      formalDefinition:
        "CL signatures use a bilinear pairing " +
        "\\( e: \\mathbb{G}_1 \\times \\mathbb{G}_2 \\rightarrow \\mathbb{G}_T \\). " +
        "The key generation produces " +
        "\\( \\mathit{sk} = (x, y_1, \\ldots, y_L) \\leftarrow \\mathbb{Z}_p^{L+1} \\) " +
        "and \\( \\mathit{pk} = (X = g_2^x, Y_1 = g_2^{y_1}, \\ldots, Y_L = g_2^{y_L}) \\in \\mathbb{G}_2^{L+1} \\). " +
        "A signature on \\( (m_1, \\ldots, m_L) \\) is a triple " +
        "\\( \\sigma = (a, a^y, a^{x + \\sum_{i=1}^L y_i m_i}) \\in \\mathbb{G}_1^3 \\) " +
        "for random \\( a \\leftarrow \\mathbb{G}_1 \\). " +
        "EUF-CMA security reduces to \\( q \\)-SDH.",
      mathDetails: [
        {
          subtitle: "Verification Equation",
          content:
            "Given \\( \\sigma = (a, b, c) \\), verification checks:" +
            "\\[ e(a, X) \\cdot \\prod_{i=1}^L e(a, Y_i)^{m_i} " +
            "\\overset{?}{=} e(c, g_2) \\]" +
            "and \\( e(a, g_2)^y \\overset{?}{=} e(b, g_2) \\). " +
            "This requires \\( L + 2 \\) pairing evaluations — expensive for large \\( L \\). " +
            "BBS+ reduced this to 2 pairings by batching all attributes into a single " +
            "generator product \\( B = g_0 \\prod g_i^{m_i} \\in \\mathbb{G}_1 \\)."
        },
        {
          subtitle: "Zero-Knowledge Proof of Knowledge of Signature",
          content:
            "The CL proof of knowledge uses a Sigma protocol. " +
            "Given \\( \\sigma = (a, b, c) \\), the prover picks random " +
            "\\( r \\leftarrow \\mathbb{Z}_p \\) and rerandomizes " +
            "\\( (a' = a^r, b' = b^r, c' = c^r) \\). " +
            "The prover then proves knowledge of " +
            "\\( (r^{-1}, m_1, \\ldots, m_L) \\) such that:" +
            "\\[ e(a', X) \\cdot \\prod_{i \\in H} e(a', Y_i)^{m_i} " +
            "= e(c', g_2) \\cdot \\prod_{i \\in D} e(a', Y_i)^{-m_i} \\]" +
            "For hidden set \\( H \\) and disclosed set \\( D \\). " +
            "Applying Fiat-Shamir makes this non-interactive. " +
            "BBS+ improves this to \\( O(|H|) \\) exponentiations total."
        }
      ]
    },

    /* ───────── 9. Brands Credentials ───────── */
    {
      name: "Rethinking Public Key Infrastructures and Digital Certificates: Building in Privacy",
      formalDefinition:
        "Brands credentials use a prime-order group \\( \\mathbb{G} = \\langle g \\rangle \\) " +
        "of order \\( q \\). A credential for attribute vector " +
        "\\( (m_1, \\ldots, m_k) \\) is issued via a restricted blind signature. " +
        "The user commits to \\( A = g^{m_1} h_1^{m_2} \\cdots h_{k-1}^{m_k} \\) " +
        "and the issuer blindly signs \\( A \\). The signature " +
        "\\( \\sigma = (z, a, b, r) \\) satisfies " +
        "\\( a = g^{r_1}, b = A^{r_1} / z^{c}, r = r_2 - c \\cdot \\mathit{sk} \\) " +
        "where \\( c \\) is the challenge derived from the attribute encoding. " +
        "Each showing rerandomizes \\( \\sigma \\) to produce an unlinkable transcript.",
      mathDetails: [
        {
          subtitle: "Restricted Blind Signature",
          content:
            "Brands' blind signature is 'restricted' because the issuer knows " +
            "the encoding structure \\( A \\) (which generators were used) but " +
            "not the individual attribute values \\( m_i \\). " +
            "Security: given a colluding issuer and \\( n \\) showing transcripts, " +
            "they cannot determine any \\( m_i \\) or link showings. " +
            "Formally, blindness requires: " +
            "\\[ \\{\\text{transcript of showing}\\}_{i=1}^n \\approx_c " +
            "\\{\\text{simulated transcripts}\\}_{i=1}^n \\]" +
            "under the discrete logarithm assumption in \\( \\mathbb{G} \\)."
        },
        {
          subtitle: "One-Show vs. Multi-Show Credentials",
          content:
            "Brands' one-show tokens include a show-specific commitment " +
            "\\( T = g_1^{\\text{count}} \\cdot g_2^r \\) that prevents reuse. " +
            "If the same credential is shown twice with the same \\( T \\), " +
            "the issuer can detect it (double-spending). " +
            "Multi-show credentials (Brands' extension) use randomizable signatures: " +
            "each showing picks fresh \\( \\alpha, \\beta \\leftarrow \\mathbb{Z}_q \\) and outputs " +
            "\\( \\sigma' = (z^\\alpha, a \\cdot g^\\beta, b^\\alpha \\cdot h^\\beta, r) \\). " +
            "This is the precursor to BBS+ randomization."
        }
      ]
    },

    /* ───────── 10. Blockchain-Based Privacy-Preserving Mobile Payment ───────── */
    {
      name: "Blockchain-Based Privacy-Preserving Mobile Payment Using Anonymous Credentials",
      formalDefinition:
        "The payment system defines algorithms " +
        "\\( (\\mathsf{Setup}, \\mathsf{IssueCredential}, \\mathsf{PayInit}, " +
        "\\mathsf{PayProve}, \\mathsf{PayVerify}) \\). " +
        "A payment transaction is valid if the verifier accepts proof " +
        "\\[ \\pi: \\; \\exists\\, (\\sigma, m_{\\text{bal}}, r) \\;:\\; " +
        "\\mathsf{VerifyCredential}(\\sigma) = 1 " +
        "\\;\\wedge\\; C = \\mathsf{Com}(m_{\\text{bal}}, r) " +
        "\\;\\wedge\\; m_{\\text{bal}} \\geq \\mathsf{amount} " +
        "\\;\\wedge\\; \\eta \\notin \\mathcal{N} \\]" +
        "where \\( \\mathcal{N} \\) is the on-chain nullifier set preventing double-spending, " +
        "\\( C \\) is a Pedersen commitment to the balance, and \\( \\sigma \\) is an " +
        "anonymous credential from the threshold issuers.",
      mathDetails: [
        {
          subtitle: "Pedersen Commitment and Range Proof",
          content:
            "A Pedersen commitment to amount \\( v \\) is " +
            "\\( C = g^v h^r \\in \\mathbb{G} \\) for random blinding \\( r \\). " +
            "Perfectly hiding (\\( C \\) is uniform) and computationally binding (DL). " +
            "The range proof \\( v \\in [0, 2^k) \\) is constructed via bit decomposition: " +
            "\\[ C = \\prod_{j=0}^{k-1} C_j^{2^j}, \\quad C_j = g^{b_j} h^{r_j} \\]" +
            "each \\( C_j \\) is proven to commit to a bit \\( b_j \\in \\{0, 1\\} \\) " +
            "via a one-out-of-two OR proof. Total proof size: \\( O(k) \\) group elements, " +
            "typically \\( k = 32 \\) for 32-bit amounts."
        },
        {
          subtitle: "Combined ZK Proof",
          content:
            "The full payment proof is a conjunction of four sub-proofs, " +
            "combined via the Sigma protocol \\( \\Sigma \\)-AND: " +
            "\\[ \\pi = \\pi_{\\text{cred}} \\wedge \\pi_{\\text{commit}} " +
            "\\wedge \\pi_{\\text{range}} \\wedge \\pi_{\\text{nullifier}} \\]" +
            "Using Fiat-Shamir, a single challenge \\( c \\) covers all sub-proofs. " +
            "The proof size is \\( |\\pi| = O(L + k) \\) group elements " +
            "where \\( L \\) is the number of credential attributes and \\( k \\) is " +
            "the range bit width. The smart contract verifier checks " +
            "the nullifier uniqueness and proof validity atomically."
        }
      ]
    },

    /* ───────── 11. BDIdM ───────── */
    {
      name: "Blockchain-Based Digital Identity Management via Decentralized Anonymous Credentials",
      formalDefinition:
        "BDIdM defines identity as a set of attribute-credential pairs " +
        "\\( \\{(\\mathsf{attr}_i, \\sigma_i)\\}_{i=1}^n \\) stored as " +
        "on-chain commitments \\( \\{C_i\\} \\). Showing is parameterized " +
        "by a scope \\( \\mathsf{scope} \\in \\{0,1\\}^* \\). " +
        "The pseudonym \\( \\mathsf{nym}_{\\mathsf{scope}} = H(\\mathit{sk}_{\\text{user}}, \\mathsf{scope}) \\) " +
        "is deterministic within a scope but computationally independent " +
        "across scopes: for \\( s \\neq s' \\), " +
        "\\( (\\mathsf{nym}_s, \\mathsf{nym}_{s'}) \\) are computationally " +
        "indistinguishable from random under PRF security of \\( H \\).",
      mathDetails: [
        {
          subtitle: "Scope-Based Pseudonymity",
          content:
            "The pseudonym \\( \\mathsf{nym} \\) serves as the user's identity " +
            "within one application/scope. It is computed as a PRF evaluation:" +
            "\\[ \\mathsf{nym}_{\\mathsf{scope}} = " +
            "\\mathsf{PRF}_{\\mathit{sk}_{\\text{user}}}(\\mathsf{scope}) \\]" +
            "Proof of consistent pseudonym:" +
            "\\[ \\pi: \\; \\exists\\, \\mathit{sk}_{\\text{user}} \\;:\\; " +
            "\\mathsf{nym} = \\mathsf{PRF}_{\\mathit{sk}}(\\mathsf{scope}) " +
            "\\;\\wedge\\; \\mathit{sk} \\text{ embedded in } \\sigma \\]" +
            "The ZK proof ensures the same \\( \\mathit{sk} \\) produces the " +
            "same pseudonym across sessions (linking within scope) but " +
            "different pseudonyms in different scopes (unlinking across scopes)."
        },
        {
          subtitle: "Linkability Control Formal Model",
          content:
            "BDIdM defines two distinguishing games: " +
            "\\textsc{Unlink}\\( (s \\neq s') \\): adversary cannot distinguish " +
            "whether \\( (\\mathsf{nym}_s, \\mathsf{nym}_{s'}) \\) came from the same user; " +
            "\\textsc{Link}\\( (s = s') \\): verifier can confirm two showings " +
            "within the same scope came from the same user (via equal \\( \\mathsf{nym} \\)). " +
            "Formally, \\textsc{Unlink} holds if:" +
            "\\[ |\\Pr[\\mathcal{A}_{\\text{unlink}} = 1 \\mid b=0] - " +
            "\\Pr[\\mathcal{A}_{\\text{unlink}} = 1 \\mid b=1]| \\leq \\mathrm{negl}(\\lambda) \\]" +
            "under PRF security."
        }
      ]
    },

    /* ───────── 12. GrAC ───────── */
    {
      name: "GrAC: Graph-Based Anonymous Credentials from Identity Graphs on Blockchain",
      formalDefinition:
        "An identity graph \\( \\mathcal{G} = (V, E) \\) where each edge " +
        "\\( (u, v, \\mathsf{attr}, \\sigma) \\in E \\) represents a " +
        "credential issued by node \\( u \\) to node \\( v \\) with attribute " +
        "\\( \\mathsf{attr} \\) and signature \\( \\sigma \\). " +
        "A GrAC proof asserts membership of a path " +
        "\\( P = (v_0, v_1, \\ldots, v_k) \\) in \\( \\mathcal{G} \\) satisfying " +
        "predicate \\( P(\\mathsf{attrs}(P)) = 1 \\), in zero knowledge over " +
        "the intermediate nodes and credentials. The identity graph root " +
        "is stored on blockchain; ZK proofs are verified against this root.",
      mathDetails: [
        {
          subtitle: "Graph Path ZK Proof",
          content:
            "For a path \\( v_0 \\rightarrow v_1 \\rightarrow \\cdots \\rightarrow v_k \\) " +
            "with credentials \\( \\sigma_1, \\ldots, \\sigma_k \\), " +
            "the GrAC proof is a conjunction:" +
            "\\[ \\pi = \\bigwedge_{i=1}^k \\pi_{\\text{cred},i} \\]" +
            "where \\( \\pi_{\\text{cred},i} \\) is a BBS+ proof of knowledge of " +
            "\\( \\sigma_i \\) signed by \\( v_{i-1} \\) for \\( v_i \\). " +
            "The path is hidden: \\( v_1, \\ldots, v_{k-1} \\) are intermediate " +
            "nodes proved in ZK. Only the path endpoints and disclosed " +
            "attributes are revealed."
        },
        {
          subtitle: "Blockchain Integration",
          content:
            "The identity graph is committed to a Merkle tree on-chain. " +
            "Each leaf is a credential commitment " +
            "\\( \\mathsf{leaf}_{(u,v)} = H(u, v, \\mathsf{attr}, \\sigma) \\). " +
            "The GrAC proof includes a Merkle membership proof for each " +
            "edge credential:" +
            "\\[ \\pi_{\\text{Merkle},i}: \\; \\mathsf{leaf}_{(v_{i-1},v_i)} " +
            "\\in \\mathsf{tree}(\\mathsf{root}) \\]" +
            "Combined with the BBS+ credential proof, the full GrAC proof is " +
            "verifiable against the on-chain Merkle root in \\( O(k \\cdot \\log n) \\) " +
            "hash operations."
        }
      ]
    },

    /* ───────── 13. Comparative Evaluation Threshold AC ───────── */
    {
      name: "Comparative Evaluation of Threshold-based Anonymous Credential Systems over Blockchain",
      formalDefinition:
        "The paper evaluates three systems: " +
        "RP-Coconut (randomizable pairing-based Coconut), " +
        "Threshold BBS+ (BBS+ with Shamir-shared keys), and " +
        "Threshold BBS (simplified BBS variant). " +
        "For each system, it measures: proof size \\( |\\pi| \\), " +
        "proof generation time \\( T_{\\text{prove}} \\), " +
        "on-chain verification gas \\( G_{\\text{verify}} \\), and " +
        "communication complexity \\( |\\text{msg}| \\) during issuance. " +
        "The evaluation is conducted on Ethereum Sepolia (testnet) " +
        "with standardized hardware and 5 attributes per credential.",
      mathDetails: [
        {
          subtitle: "RP-Coconut Complexity",
          content:
            "RP-Coconut proof size: " +
            "\\( |\\pi| = 2|\\mathbb{G}_1| + 2|\\mathbb{Z}_p| + L|\\mathbb{Z}_p| \\approx 1.2 \\) KB for \\( L=5 \\). " +
            "On-chain verification: 2 pairings + \\( L \\) scalar multiplications, " +
            "costing \\( \\approx 350{,}000 \\) gas on Ethereum. " +
            "Proof generation: \\( \\approx 800 \\) ms on a mobile device " +
            "(dominated by pairing evaluation in \\( \\mathbb{G}_T \\))."
        },
        {
          subtitle: "Threshold BBS+ Complexity",
          content:
            "Threshold BBS+ proof: " +
            "\\( |\\pi| = |\\mathbb{G}_1| + |\\mathbb{G}_2| + 3|\\mathbb{Z}_p| \\approx 0.5 \\) KB. " +
            "On-chain: 2 pairings (batched) \\( \\approx 180{,}000 \\) gas. " +
            "The \\( (t,n) \\)-threshold issuance adds \\( O(t) \\) communication rounds. " +
            "Security: EUF-CMA under \\( q \\)-SDH + ROM + AGM. " +
            "Result: \\( \\sim 2\\times \\) cheaper on-chain than RP-Coconut " +
            "while maintaining comparable security guarantees."
        },
        {
          subtitle: "Threshold BBS Complexity",
          content:
            "Threshold BBS (simplified, no randomization of \\( e \\) component) " +
            "achieves: \\( |\\pi| \\approx 0.4 \\) KB, " +
            "on-chain cost \\( \\approx 150{,}000 \\) gas. " +
            "Trade-off: slightly weaker unlinkability guarantees compared to BBS+ " +
            "(relies on a stronger computational assumption for unlinkability). " +
            "Summary table reference: " +
            "\\[ G_{\\text{RP-Coconut}} \\approx 2\\times G_{\\text{BBS+}} " +
            "\\approx 2.3\\times G_{\\text{BBS}} \\]"
        }
      ]
    },

    /* ───────── 14. Cross-chain Identity ───────── */
    {
      name: "Cross-chain Identity Authentication Using Anonymous Credentials",
      formalDefinition:
        "Cross-chain anonymous authentication is defined as a protocol " +
        "between a source chain \\( \\mathcal{C}_s \\) and destination chain " +
        "\\( \\mathcal{C}_d \\). The source chain publishes a Merkle tree root " +
        "\\( \\mathsf{root} \\in \\{0,1\\}^{256} \\) of credential commitments. " +
        "Authentication on \\( \\mathcal{C}_d \\) requires a zkSNARK proof:" +
        "\\[ \\pi: \\; \\exists\\, (\\sigma, r, w) \\;:\\; " +
        "\\mathsf{VerifyCredential}(\\sigma) = 1 " +
        "\\;\\wedge\\; \\mathsf{MerkleVerify}(w, H(\\sigma, r), \\mathsf{root}) = 1 " +
        "\\;\\wedge\\; \\eta = H(\\sigma, \\mathsf{chain\\_id}) \\]" +
        "where \\( w \\) is the Merkle witness, \\( \\eta \\) the cross-chain nullifier, " +
        "and \\( \\mathsf{root} \\) is relayed from \\( \\mathcal{C}_s \\).",
      mathDetails: [
        {
          subtitle: "Merkle Tree Root as Cross-Chain Anchor",
          content:
            "The Merkle tree over \\( n \\) credential commitments has depth " +
            "\\( \\lceil \\log_2 n \\rceil \\). The root \\( \\mathsf{root} \\) is " +
            "computed bottom-up using a ZK-friendly hash (Poseidon or MiMC):" +
            "\\[ \\mathsf{root} = H_{\\text{tree}}(\\{H(\\sigma_i, r_i)\\}_{i=1}^n) \\]" +
            "The Merkle witness \\( w \\) for credential \\( i \\) is a sequence of " +
            "\\( \\lceil \\log_2 n \\rceil \\) sibling hashes. " +
            "Inside the zkSNARK circuit, Merkle verification costs " +
            "\\( \\lceil \\log_2 n \\rceil \\) Poseidon hash evaluations " +
            "(\\( \\approx 50 \\) constraints per Poseidon call on BN254)."
        },
        {
          subtitle: "Cross-Chain Nullifier",
          content:
            "The cross-chain nullifier prevents replaying a credential across chains:" +
            "\\[ \\eta_{\\mathcal{C}_d} = H(\\sigma, \\mathsf{chain\\_id}_{\\mathcal{C}_d}) \\]" +
            "Each destination chain has a distinct \\( \\mathsf{chain\\_id} \\), " +
            "so the same credential produces different nullifiers on different chains, " +
            "preventing cross-chain replay. " +
            "Unlinkability: given \\( \\eta_{\\mathcal{C}_d} \\) and \\( \\eta_{\\mathcal{C}_{d'}} \\), " +
            "an adversary cannot determine they came from the same credential " +
            "under the collision-resistance of \\( H \\) and PRF security."
        }
      ]
    },

    /* ───────── 15. AccCred ───────── */
    {
      name: "AccCred: Improved Accountable Anonymous Credentials With Dynamic Triple-Hiding Committees",
      formalDefinition:
        "AccCred defines a tuple " +
        "\\( (\\mathsf{Setup}, \\mathsf{CommKeyGen}, \\mathsf{Issue}, " +
        "\\mathsf{Show}, \\mathsf{Verify}, \\mathsf{Trace}) \\). " +
        "A credential \\( \\sigma \\) for user \\( u \\) contains a tracing ciphertext " +
        "\\( \\mathsf{CT}_u = \\mathsf{Enc}_{pk_{\\text{com}}}(u) \\) under the committee key " +
        "\\( pk_{\\text{com}} \\) (threshold ElGamal). The showing proof proves knowledge " +
        "of \\( \\sigma \\) and that \\( \\mathsf{CT}_u \\) encrypts the correct user identity. " +
        "Tracing requires \\( t \\) committee members to jointly decrypt \\( \\mathsf{CT}_u \\). " +
        "Triple-hiding: the proof hides (1) user identity, (2) credential content, " +
        "(3) which credential was shown.",
      mathDetails: [
        {
          subtitle: "Threshold ElGamal Tracing",
          content:
            "The committee holds a \\( (t,n) \\)-shared ElGamal key: " +
            "\\( \\mathit{sk}_{\\text{com}} = \\sum_{i \\in S} \\mathit{sk}_i \\cdot \\lambda_i \\), " +
            "\\( pk_{\\text{com}} = g^{\\mathit{sk}_{\\text{com}}} \\in \\mathbb{G} \\). " +
            "The tracing ciphertext is: " +
            "\\[ \\mathsf{CT}_u = (g^r, pk_{\\text{com}}^r \\cdot u) \\in \\mathbb{G}^2 \\]" +
            "Partial decryptions by \\( t \\) members: " +
            "\\( D_i = (g^r)^{\\mathit{sk}_i} \\). " +
            "Reconstruction: \\[ u = \\mathsf{CT}_u[1] \\cdot \\left(\\prod_{i \\in S} D_i^{\\lambda_i}\\right)^{-1} \\]"
        },
        {
          subtitle: "Triple-Hiding Security",
          content:
            "Triple-hiding formalizes that a showing transcript " +
            "\\( (\\pi, \\mathsf{CT}_u) \\) hides: " +
            "(1) \\textbf{User}: \\( \\mathsf{CT}_u \\) is semantically secure — " +
            "indistinguishable from an encryption of \\( u' \\neq u \\) without \\( t \\) committee shares; " +
            "(2) \\textbf{Credential}: the underlying \\( \\sigma \\) is hidden in \\( \\pi \\) " +
            "by rerandomization — each showing uses fresh \\( \\sigma' \\); " +
            "(3) \\textbf{Showing}: \\( (\\pi, \\mathsf{CT}_u) \\) is unlinkable " +
            "across sessions — indistinguishable from another user's transcript. " +
            "\\[ \\Pr[\\mathcal{A}(\\mathsf{view}) = b] \\leq \\frac{1}{2} + \\mathrm{negl}(\\lambda) \\]" +
            "under DDH + threshold ElGamal IND-CPA."
        },
        {
          subtitle: "Dynamic Committee Rotation",
          content:
            "Dynamic committee rotation allows changing committee members without reissuing credentials. " +
            "The new committee \\( \\mathcal{C}' \\) generates a fresh " +
            "\\( pk'_{\\text{com}} \\) and a proactive key resharing protocol updates " +
            "ciphertexts from old to new encryption: " +
            "\\[ \\mathsf{CT}'_u = \\mathsf{Re-Enc}_{pk_{\\text{com}} \\rightarrow pk'_{\\text{com}}}(\\mathsf{CT}_u) \\]" +
            "using threshold re-encryption (no plaintext exposure). " +
            "Existing credentials remain valid; only the tracing key changes. " +
            "Cost: \\( O(n) \\) re-encryption operations for \\( n \\) active credentials."
        }
      ]
    },

    /* ───────── 16. ZK Proof-of-Identity ───────── */
    {
      name: "Zero-Knowledge Proof-of-Identity: Sybil-Resistant, Anonymous Authentication on Permissionless Blockchains",
      formalDefinition:
        "ZK-PoI defines a registration protocol that takes as input " +
        "a government certificate \\( \\mathsf{cert} \\) with public key signature " +
        "\\( \\sigma_{\\text{gov}} = \\mathsf{Sign}_{\\mathit{sk}_{\\text{gov}}}(\\mathsf{cert}) \\) " +
        "and produces a SNARK proof \\( \\pi \\) and nullifier \\( \\eta \\) such that:" +
        "\\[ \\pi: \\; \\exists\\, (\\mathsf{cert}, \\mathit{sk}_{\\text{user}}) \\;:\\; " +
        "\\mathsf{Verify}_{\\mathit{pk}_{\\text{gov}}}(\\sigma_{\\text{gov}}, \\mathsf{cert}) = 1 " +
        "\\;\\wedge\\; P(\\mathsf{attrs}(\\mathsf{cert})) = 1 " +
        "\\;\\wedge\\; \\eta = H(\\mathit{sk}_{\\text{user}}, \\mathsf{addr}_{\\text{chain}}) \\]" +
        "On-chain: verify \\( \\pi \\) against \\( \\mathit{pk}_{\\text{gov}} \\) " +
        "and check \\( \\eta \\notin \\mathcal{N} \\) (nullifier set). " +
        "Sybil resistance: one certificate → one nullifier → one registration.",
      mathDetails: [
        {
          subtitle: "Government Signature Verification In-Circuit",
          content:
            "Passports use RSA-2048 or ECDSA-P256 signatures. " +
            "In-circuit RSA-2048 verification requires: " +
            "\\[ \\sigma^e \\pmod{N} \\overset{?}{=} \\mathsf{EMSA}(H(\\mathsf{cert})) \\]" +
            "Modular exponentiation with \\( e = 65537 \\) and \\( N \\) 2048-bit: " +
            "implemented via binary method, \\( \\approx 17 \\) squarings and 1 multiplication, " +
            "each 2048-bit multiply requiring \\( \\approx 2^{17} \\) BN254 field constraints. " +
            "Total: \\( \\sim 2^{21} \\) constraints. Proving time: \\( \\approx 5 \\)s on laptop."
        },
        {
          subtitle: "Nullifier Binding",
          content:
            "The nullifier binds one certificate to one blockchain address: " +
            "\\[ \\eta = \\mathsf{Poseidon}(\\mathit{sk}_{\\text{user}}, \\mathsf{addr}_{\\text{chain}}) \\]" +
            "where \\( \\mathit{sk}_{\\text{user}} \\) is derived from the passport chip's secret (via NFC read). " +
            "Security: uniqueness from collision resistance; " +
            "anonymity from PRF security (given \\( \\eta \\), find \\( \\mathit{sk}_{\\text{user}} \\) is hard). " +
            "Double-registration prevention: on-chain check \\( \\eta \\notin \\mathcal{N} \\) " +
            "costs \\( O(1) \\) with a Merkle-tree nullifier accumulator."
        },
        {
          subtitle: "Sybil Resistance Formal Guarantee",
          content:
            "ZK-PoI is sybil-resistant if for any PPT adversary \\( \\mathcal{A} \\) " +
            "holding \\( k \\) distinct certificates, they can register at most " +
            "\\( k \\) distinct blockchain accounts. " +
            "Formally, the probability of registering \\( k+1 \\) accounts " +
            "with only \\( k \\) certificates is bounded by the soundness " +
            "error of the SNARK plus the collision probability of \\( H \\):" +
            "\\[ \\Pr[\\text{Sybil}_{k+1}] \\leq \\epsilon_{\\text{SNARK}} + \\mathrm{negl}(\\lambda) \\]" +
            "where \\( \\epsilon_{\\text{SNARK}} \\leq \\mathrm{negl}(\\lambda) \\) under " +
            "the knowledge soundness of Groth16."
        }
      ]
    }
  ]
};
