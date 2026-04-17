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
    }
  ]
};
