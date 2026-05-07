/**
 * Ch 2.5 Papers Technical Companion — Regulatory & Enterprise Privacy
 * Formal definitions and technical details for paper recap cards.
 * Rendered by paper-guide.js via window.CH25_PAPERS_TECH.
 * KaTeX: \( inline \) and \[ display \]
 */

window.CH25_PAPERS_TECH = {
  papers: [
    /* ── Paper 1: BIS Working Paper 1242 ── */
    {
      name: "BIS Working Paper 1242",
      formalDefinition:
        "BIS WP 1242 is a policy document rather than a formal cryptographic paper. " +
        "It provides a structured assessment of PETs against regulatory criteria, " +
        "using a qualitative scoring matrix rather than game-based definitions. " +
        "The key technical framework maps each PET to four regulatory dimensions: " +
        "<ol>" +
        "<li><strong>Data minimization:</strong> Does the PET reduce the amount of " +
        "personal data exposed to counterparties and infrastructure operators?</li>" +
        "<li><strong>Auditability:</strong> Can authorized regulators access " +
        "transaction data under legal process without compromising general privacy?</li>" +
        "<li><strong>Scalability:</strong> What is the computational overhead at " +
        "CBDC-scale transaction volumes (millions per day)?</li>" +
        "<li><strong>Interoperability:</strong> Can the PET work across payment rails " +
        "with different trust models (open blockchain, permissioned ledger, RTGS)?</li>" +
        "</ol>",
      mathDetails: [
        {
          subtitle: "ZKP Assessment: Selective Disclosure via Pedersen + Range Proof",
          content:
            "The paper's technical assessment of ZKPs for payments focuses on " +
            "the selective disclosure pattern. For a credential with attributes " +
            "\\( (a_1, \\ldots, a_n) \\), a ZKP-based selective disclosure proof reveals " +
            "a subset \\( I \\subseteq [n] \\) while hiding \\( \\{a_j : j \\notin I\\} \\). " +
            "The BIS notes this is achievable with Pedersen commitments: " +
            "\\[ C = \\prod_{i=1}^n G_i^{a_i} \\cdot H^r \\] " +
            "and a proof of opening for the selected attributes \\( \\{a_i : i \\in I\\} \\) " +
            "while proving knowledge of the remaining commitments. " +
            "The computational cost is \\( O(n) \\) for proof generation and \\( O(|I|) \\) " +
            "for verification — the BIS rates this 'promising but needing optimization' " +
            "for real-time payment applications."
        },
        {
          subtitle: "TEE Assessment: Hardware-Enforced Data Minimization",
          content:
            "The BIS assesses TEEs as providing a different trust model than ZKPs: " +
            "instead of cryptographic proof that data was not seen, TEEs provide " +
            "hardware attestation that only authorized code ran on the data. " +
            "The formal guarantee is an attestation certificate: " +
            "\\[ \\mathsf{attest} = \\mathsf{Sign}_{\\mathsf{sk}_{\\text{TEE}}}(\\mathsf{mrenclave} \\| \\mathsf{report}) \\] " +
            "where \\( \\mathsf{mrenclave} \\) is the cryptographic hash of the enclave code. " +
            "A verifier checks \\( \\mathsf{attest} \\) against Intel/AMD's certificate chain. " +
            "The BIS notes TEEs add a hardware manufacturer trust assumption absent in ZKPs, " +
            "but offer significantly better performance: TEE processing overhead is " +
            "\\( \\sim 10\\text{--}30\\% \\) versus ZKP proving overhead of \\( 10^3 \\text{--}10^4\\times \\)."
        }
      ]
    },

    /* ── Paper 2: eIDAS 2.0 ARF ── */
    {
      name: "eIDAS 2.0 Architecture Reference Framework",
      formalDefinition:
        "The ARF is a regulatory technical specification, not an academic paper. " +
        "It defines the EUDIW (EU Digital Identity Wallet) as a system with " +
        "the following key technical components: " +
        "<ul>" +
        "<li><strong>PID (Personal Identification Data):</strong> Government-issued " +
        "identity attributes (name, date of birth, nationality) in SD-JWT or mdoc format.</li>" +
        "<li><strong>EAA (Electronic Attestation of Attributes):</strong> Any attribute " +
        "credential from a qualified trust service provider.</li>" +
        "<li><strong>SD-JWT:</strong> Selective Disclosure JWT — a credential format " +
        "where each attribute is individually disclosable using a hash commitment.</li>" +
        "<li><strong>mdoc (ISO 18013-5):</strong> Mobile document standard for " +
        "proximity presentation (NFC/BLE).</li>" +
        "</ul>" +
        "The ARF mandates the OpenID4VP (Verifiable Presentations) protocol for " +
        "online presentation and ISO 18013-5 for offline/proximity scenarios.",
      mathDetails: [
        {
          subtitle: "SD-JWT Selective Disclosure Mechanism",
          content:
            "SD-JWT is the primary credential format in eIDAS 2.0. Each attribute " +
            "\\( a_i \\) is individually committed using a salted hash: " +
            "\\[ d_i = \\mathsf{hash}(\\mathsf{salt}_i \\| a_i) \\] " +
            "The issuer signs a JWT containing \\( (d_1, \\ldots, d_n) \\) plus " +
            "any non-selectively-disclosable claims. To disclose attribute \\( a_i \\), " +
            "the holder reveals \\( (\\mathsf{salt}_i, a_i) \\); the verifier checks: " +
            "\\[ \\mathsf{hash}(\\mathsf{salt}_i \\| a_i) \\stackrel{?}{=} d_i \\] " +
            "SD-JWT does not use ZKPs — the holder must reveal the full attribute value. " +
            "This is weaker than BBS+, which allows proving predicates over attributes " +
            "(e.g., \\( \\text{age} \\geq 18 \\)) without revealing the exact value. " +
            "This is the gap that 'Making BBS+ eIDAS 2.0 Compliant' (ePrint 2025/619) " +
            "addresses, and which your thesis system closes."
        },
        {
          subtitle: "BBS+ vs SD-JWT: Privacy Comparison",
          content:
            "The ARF v1.x requires SD-JWT, but BBS+ is under evaluation. The key " +
            "technical differences relevant to your thesis: " +
            "<table style='border-collapse: collapse; width: 100%; font-size: 0.85em;'>" +
            "<tr><th style='border: 1px solid #444; padding: 4px;'>Property</th>" +
            "<th style='border: 1px solid #444; padding: 4px;'>SD-JWT</th>" +
            "<th style='border: 1px solid #444; padding: 4px;'>BBS+</th></tr>" +
            "<tr><td style='border: 1px solid #444; padding: 4px;'>Selective disclosure</td>" +
            "<td style='border: 1px solid #444; padding: 4px;'>Yes (reveal full attribute)</td>" +
            "<td style='border: 1px solid #444; padding: 4px;'>Yes (prove predicates)</td></tr>" +
            "<tr><td style='border: 1px solid #444; padding: 4px;'>Unlinkability</td>" +
            "<td style='border: 1px solid #444; padding: 4px;'>No (issuer signature visible)</td>" +
            "<td style='border: 1px solid #444; padding: 4px;'>Yes (derived proof)</td></tr>" +
            "<tr><td style='border: 1px solid #444; padding: 4px;'>Range proofs</td>" +
            "<td style='border: 1px solid #444; padding: 4px;'>No</td>" +
            "<td style='border: 1px solid #444; padding: 4px;'>Yes (via BBS+ extension)</td></tr>" +
            "<tr><td style='border: 1px solid #444; padding: 4px;'>On-chain verify</td>" +
            "<td style='border: 1px solid #444; padding: 4px;'>ECDSA or RSA</td>" +
            "<td style='border: 1px solid #444; padding: 4px;'>Pairing on BLS12-381</td></tr>" +
            "</table>" +
            "Your thesis uses BBS+ — this table justifies the choice over SD-JWT."
        }
      ]
    },

    /* ── Paper 3: Canton Network Whitepaper ── */
    {
      name: "Canton Network Whitepaper",
      formalDefinition:
        "The Canton whitepaper defines a <em>sub-transaction view</em> as the " +
        "fundamental privacy primitive. A Daml transaction \\( \\mathsf{tx} \\) " +
        "is decomposed into a tree of views \\( V = (V_1, \\ldots, V_k) \\) " +
        "where each view \\( V_i \\) is associated with a set of parties " +
        "\\( P_i \\subseteq \\mathcal{P} \\). The privacy guarantee is: " +
        "\\[ \\forall p \\in P_i : p \\text{ receives } V_i \\] " +
        "\\[ \\forall p \\notin P_i : p \\text{ receives only } H(V_i) \\] " +
        "where \\( H \\) is a cryptographic hash. The overall transaction " +
        "commitment is: " +
        "\\[ C_{\\text{tx}} = \\mathsf{MerkleRoot}(H(V_1), \\ldots, H(V_k)) \\] " +
        "Each participant verifies their views against \\( C_{\\text{tx}} \\) " +
        "using a Merkle inclusion proof, ensuring integrity without full disclosure.",
      mathDetails: [
        {
          subtitle: "Blinded Merkle Tree Construction",
          content:
            "Canton's blinded Merkle tree works as follows. Given views " +
            "\\( V_1, \\ldots, V_k \\), compute leaf hashes \\( h_i = H(V_i) \\). " +
            "The Merkle tree is built over \\( (h_1, \\ldots, h_k) \\) in the " +
            "standard way: " +
            "\\[ h_{\\text{parent}} = H(h_{\\text{left}} \\| h_{\\text{right}}) \\] " +
            "A party holding view \\( V_i \\) receives: " +
            "\\[ (V_i, \\; \\text{Merkle path from } h_i \\text{ to root}) \\] " +
            "They verify: " +
            "\\[ \\mathsf{MerkleVerify}(C_{\\text{tx}}, h_i, \\text{path}) = \\top \\] " +
            "This proves \\( V_i \\) is part of the committed transaction without " +
            "revealing \\( V_j \\) for \\( j \\neq i \\). The key difference from ZKPs: " +
            "this does not prove anything about the <em>content</em> of \\( V_j \\) — " +
            "it merely hides it. A malicious coordinator could include an invalid " +
            "\\( V_j \\) and parties \\( P_j \\) would not detect it until they " +
            "receive their view."
        },
        {
          subtitle: "Trust Model Comparison: Canton vs ZKP",
          content:
            "The fundamental trust difference between Canton and ZKP-based systems: " +
            "<ul>" +
            "<li><strong>Canton:</strong> Privacy \\( \\Leftarrow \\) honest coordinator " +
            "distributes only authorized views. If the coordinator is compromised, " +
            "privacy fails silently. The Merkle tree proves <em>consistency</em>, " +
            "not <em>privacy</em>.</li>" +
            "<li><strong>ZKP-based (your thesis):</strong> Privacy \\( \\Leftarrow \\) " +
            "computational hardness of the underlying problem (discrete log / pairing). " +
            "Even a fully compromised coordinator cannot break privacy without " +
            "solving the cryptographic hard problem.</li>" +
            "</ul>" +
            "Formally: Canton's privacy is <em>computational under honest-majority assumption " +
            "on coordinators</em>, while ZKP privacy is <em>computational under discrete log " +
            "assumption</em> with no coordinator trust requirement. " +
            "Your thesis's contribution is eliminating the coordinator trust assumption " +
            "for the identity and payment privacy layers."
        }
      ]
    },

    /* ── Paper 4: Canton ZKPs Not a Panacea ── */
    {
      name: "Canton: ZKPs Not a Privacy Panacea",
      formalDefinition:
        "This is an industry blog post, not a formal paper. It presents three " +
        "technical arguments against ZKPs as an enterprise privacy primitive, " +
        "each of which has a formal analog: " +
        "<ol>" +
        "<li><strong>Silent Failures (Under-Constrained Circuits):</strong> A ZKP " +
        "circuit with insufficient constraints \\( C \\) can accept proofs for " +
        "statements outside the intended language \\( \\mathcal{L} \\). Formally: " +
        "if \\( C \\) is under-constrained, \\( \\exists w' \\notin \\mathcal{R} \\) " +
        "such that \\( C(w') = 1 \\).</li>" +
        "<li><strong>Auditability Incompatibility:</strong> Full ZK anonymity and " +
        "mandatory transparency are formally incompatible (see SoK open problem #3).</li>" +
        "<li><strong>Performance:</strong> Groth16 proving is \\( O(n \\log n) \\) " +
        "in the circuit size \\( n \\), with constant factor \\( \\sim 1\\text{--}10 \\) " +
        "seconds for payment-scale circuits.</li>" +
        "</ol>",
      mathDetails: [
        {
          subtitle: "Under-Constrained Circuit Vulnerability",
          content:
            "An R1CS (Rank-1 Constraint System) for a circuit \\( C \\) is defined " +
            "by matrices \\( (A, B, C) \\in \\mathbb{F}^{m \\times n} \\) where the " +
            "witness \\( w \\in \\mathbb{F}^n \\) satisfies: " +
            "\\[ (A \\cdot w) \\circ (B \\cdot w) = C \\cdot w \\] " +
            "A circuit is <em>under-constrained</em> if there exist " +
            "\\( w_1 \\neq w_2 \\) with the same public inputs \\( x \\) such that " +
            "both satisfy the R1CS. Formally: " +
            "\\[ \\exists w_1 \\neq w_2 : (A w_i) \\circ (B w_i) = C w_i \\; \\forall i \\in \\{1,2\\} \\] " +
            "A famous example: Zcash Sapling's 2019 vulnerability allowed minting " +
            "arbitrary coins by exploiting an under-constrained note commitment check. " +
            "The circuit checked \\( \\mathsf{cm} = \\mathsf{hash}(v \\| \\rho) \\) but " +
            "did not constrain the relationship between \\( v \\) and the spend authority. " +
            "The Canton blog uses this as evidence that ZKP circuits require " +
            "formal verification — which is now standard practice (Circom + Formal Verfication)."
        },
        {
          subtitle: "Your Thesis's Response to Each Critique",
          content:
            "A structured technical response to Canton's three critiques: " +
            "<ol>" +
            "<li><strong>Silent Failures:</strong> Your Circom circuits should be " +
            "accompanied by formal equivalence checks (e.g., using the Halo2 " +
            "constraint system's built-in type checking, or external tools like " +
            "ECNE or Picus). State this in your implementation chapter.</li>" +
            "<li><strong>Auditability:</strong> Your TEE auditor resolves this: " +
            "\\[ \\mathsf{Audit}(\\mathsf{tx}) \\to (S, R, v) \\] " +
            "requires the TEE's attestation key, held by a regulated entity. " +
            "General anonymity is preserved (TEE cannot be queried arbitrarily); " +
            "regulated audit is possible (TEE runs audit code under attestation).</li>" +
            "<li><strong>Performance:</strong> On-chain verification (Groth16 on BN254) " +
            "costs \\( \\sim 250{,}000 \\) gas on Ethereum / \\( \\sim 2 \\) ms on Sui. " +
            "Proof generation is client-side: \\( \\sim 2\\text{--}5 \\) seconds in " +
            "SnarkJS on a mobile device — comparable to Face ID authentication latency, " +
            "acceptable for payment UX.</li>" +
            "</ol>"
        }
      ]
    },

    /* ── Paper 5: The Sumcheck Protocol ── */
    {
      name: "The Sumcheck Protocol (LFKN 1992 + Modern Revival)",
      formalDefinition:
        "The sumcheck protocol is an interactive proof for claims of the form " +
        "\\( H = \\sum_{x \\in \\{0,1\\}^n} g(x) \\), where \\( g: \\mathbb{F}^n \\to \\mathbb{F} \\) " +
        "is a polynomial of individual degree \\( d \\) in each variable. The protocol runs in \\( n \\) " +
        "rounds, reducing the exponential-size sum to a single evaluation \\( g(r_1, \\ldots, r_n) \\)." +
        "<ol>" +
        "<li><strong>Round \\( i \\):</strong> The prover sends a univariate polynomial " +
        "\\( s_i(X_i) = \\sum_{x_{i+1}, \\ldots, x_n \\in \\{0,1\\}} g(r_1, \\ldots, r_{i-1}, X_i, x_{i+1}, \\ldots, x_n) \\), " +
        "which has degree \\( \\leq d \\).</li>" +
        "<li><strong>Verifier check:</strong> \\( s_i(0) + s_i(1) = s_{i-1}(r_{i-1}) \\) " +
        "(for round 1: \\( s_1(0) + s_1(1) = H \\)).</li>" +
        "<li><strong>Challenge:</strong> The verifier samples \\( r_i \\xleftarrow{\\$} \\mathbb{F} \\).</li>" +
        "</ol>" +
        "After \\( n \\) rounds, the verifier checks \\( g(r_1, \\ldots, r_n) = s_n(r_n) \\) " +
        "via an oracle or polynomial commitment scheme.",
      mathDetails: [
        {
          subtitle: "Soundness Analysis via Schwartz-Zippel",
          content:
            "If the claimed sum is incorrect (\\( H \\neq \\sum_x g(x) \\)), a cheating prover must " +
            "send a polynomial \\( s_1'(X_1) \\neq s_1(X_1) \\) that still satisfies " +
            "\\( s_1'(0) + s_1'(1) = H \\). The key observation: \\( s_1'(X_1) - s_1(X_1) \\) is a " +
            "nonzero polynomial of degree \\( \\leq d \\). By the Schwartz-Zippel lemma, " +
            "\\[ \\Pr_{r_1 \\leftarrow \\mathbb{F}}[s_1'(r_1) = s_1(r_1)] \\leq \\frac{d}{|\\mathbb{F}|} \\] " +
            "With probability \\( \\geq 1 - d/|\\mathbb{F}| \\), the cheating prover's lie propagates to round 2 " +
            "as an incorrect reduced claim. By union bound over \\( n \\) rounds: " +
            "\\[ \\Pr[\\text{cheat succeeds}] \\leq \\frac{n \\cdot d}{|\\mathbb{F}|} \\] " +
            "For \\( n = 30 \\), \\( d = 3 \\), \\( |\\mathbb{F}| = 2^{256} \\): " +
            "\\( \\epsilon \\leq 90 / 2^{256} \\approx 10^{-76} \\)."
        },
        {
          subtitle: "Multilinear Extensions and Efficient Sumcheck",
          content:
            "In practice, \\( g \\) is the <em>multilinear extension</em> (MLE) of a function " +
            "\\( f: \\{0,1\\}^n \\to \\mathbb{F} \\): " +
            "\\[ \\tilde{f}(x_1, \\ldots, x_n) = \\sum_{w \\in \\{0,1\\}^n} f(w) \\cdot \\prod_{i=1}^n " +
            "\\big( x_i \\cdot w_i + (1-x_i)(1-w_i) \\big) \\] " +
            "The MLE \\( \\tilde{f} \\) has degree 1 in each variable (\\( d = 1 \\)), so each round " +
            "polynomial \\( s_i \\) is a degree-1 univariate, requiring only 2 evaluations. The " +
            "prover can compute all \\( s_i \\) in \\( O(2^n) \\) total time using a " +
            "<em>streaming</em> algorithm that halves the work each round: " +
            "\\[ T_{\\text{prover}} = 2^n + 2^{n-1} + \\cdots + 2 = O(2^n) \\] " +
            "This is <strong>optimal</strong>: the prover visits each evaluation point exactly once. " +
            "Spartan and Lasso exploit this for R1CS and lookup arguments respectively."
        },
        {
          subtitle: "Sumcheck in Spartan: R1CS to Sumcheck Reduction",
          content:
            "Spartan (Setty, CRYPTO 2020) converts R1CS satisfiability into a sumcheck claim. " +
            "Given R1CS matrices \\( A, B, C \\in \\mathbb{F}^{m \\times m} \\) and witness \\( z \\), " +
            "satisfiability requires \\( Az \\circ Bz = Cz \\). Spartan encodes this as: " +
            "\\[ \\sum_{x \\in \\{0,1\\}^{\\log m}} \\tilde{eq}(\\tau, x) \\cdot " +
            "\\big( \\tilde{A}(x) \\cdot \\tilde{B}(x) - \\tilde{C}(x) \\big) = 0 \\] " +
            "where \\( \\tau \\xleftarrow{\\$} \\mathbb{F}^{\\log m} \\) is a random point and " +
            "\\( \\tilde{eq}(\\tau, x) = \\prod_i (\\tau_i x_i + (1-\\tau_i)(1-x_i)) \\). " +
            "The prover runs sumcheck on this expression. The verifier's final check reduces to " +
            "evaluating \\( \\tilde{A}, \\tilde{B}, \\tilde{C}, \\tilde{z} \\) at one random point, " +
            "delegated to a polynomial commitment. " +
            "Key property: <strong>no FFT needed</strong> — the prover's dominant cost is \\( O(m) \\) " +
            "field operations (linear in the number of constraints), with memory \\( O(m) \\). " +
            "This is why Spartan is the natural decider for folding schemes: it handles sparse " +
            "R1CS efficiently without the superlinear overhead of Groth16/PLONK."
        },
        {
          subtitle: "GKR Protocol: Sumcheck for Circuit Verification",
          content:
            "The GKR protocol (Goldwasser, Kalai, Rothblum, 2008/2015) uses sumcheck to verify " +
            "arithmetic circuit evaluation layer by layer. For a circuit with \\( d \\) layers, the " +
            "verifier starts with a claim about the output and reduces it via sumcheck to a claim " +
            "about the layer below. At each layer \\( i \\): " +
            "\\[ \\tilde{V}_i(r) = \\sum_{p,q \\in \\{0,1\\}^{s_i}} \\tilde{\\text{add}}_i(r,p,q) " +
            "\\cdot (\\tilde{V}_{i+1}(p) + \\tilde{V}_{i+1}(q)) + \\tilde{\\text{mult}}_i(r,p,q) " +
            "\\cdot \\tilde{V}_{i+1}(p) \\cdot \\tilde{V}_{i+1}(q) \\] " +
            "Each layer reduction is one sumcheck invocation. After \\( d \\) layers, the verifier " +
            "checks the input layer directly. Total verifier cost: \\( O(d \\cdot s \\cdot \\log s) \\) " +
            "where \\( s \\) is the layer width — dramatically less than evaluating the full circuit."
        }
      ]
    }
  ]
};
