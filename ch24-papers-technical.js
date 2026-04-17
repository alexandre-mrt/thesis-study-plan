/**
 * Ch 2.4 Papers Technical Companion — Privacy-Preserving Payments
 * Formal definitions and math details for paper recap cards.
 * Rendered by paper-guide.js via window.CH24_PAPERS_TECH.
 * KaTeX: \( inline \) and \[ display \]
 */

window.CH24_PAPERS_TECH = {
  papers: [
    /* ── Paper 1: SoK Privacy-Preserving Transactions ── */
    {
      name: "SoK: Privacy-Preserving Transactions in Blockchains",
      formalDefinition:
        "The SoK defines a <em>privacy-preserving payment scheme</em> as a tuple " +
        "\\( \\Pi = (\\mathsf{Setup}, \\mathsf{KeyGen}, \\mathsf{Mint}, \\mathsf{Transfer}, \\mathsf{Verify}) \\) " +
        "operating over a ledger \\( \\mathcal{L} \\). Four privacy levels are formalized via " +
        "indistinguishability games against a PPT adversary \\( \\mathcal{A} \\): " +
        "<ol>" +
        "<li><strong>Confidentiality:</strong> \\( \\mathcal{A} \\) cannot distinguish " +
        "\\( \\mathsf{Transfer}(v_0, \\cdot) \\) from \\( \\mathsf{Transfer}(v_1, \\cdot) \\) " +
        "for \\( v_0 \\neq v_1 \\) — amounts are hidden.</li>" +
        "<li><strong>\\( k \\)-Anonymity:</strong> The sender is computationally " +
        "indistinguishable from any member of a set \\( S \\) of \\( k \\) users.</li>" +
        "<li><strong>Full Anonymity:</strong> Both sender and receiver identities are " +
        "computationally hidden: \\( \\mathsf{View}(\\mathsf{tx}) \\approx_c \\mathsf{View}(\\mathsf{tx}') \\) " +
        "for any two valid transactions with different parties.</li>" +
        "<li><strong>Sender-Receiver Unlinkability:</strong> No PPT \\( \\mathcal{A} \\) can " +
        "link sender \\( S \\) to receiver \\( R \\) across transactions with non-negligible " +
        "advantage over \\( 1/2 \\).</li>" +
        "</ol>" +
        "The paper further formalizes <em>soundness</em> (no double-spending), " +
        "<em>balance</em> (conservation of value), and <em>ledger consistency</em>.",
      mathDetails: [
        {
          subtitle: "UTxO vs Account-Based Anonymity Separation",
          content:
            "The SoK proves a separation result: in a purely account-based model, " +
            "achieving sender-receiver unlinkability requires \\( O(n) \\) on-chain state " +
            "per transaction for a network of \\( n \\) users, versus \\( O(1) \\) for UTxO. " +
            "This is because account-based models have a global state mapping " +
            "\\( \\text{addr} \\to \\text{balance} \\), and any update to that state leaks " +
            "which address was involved. Formally: let \\( \\mathcal{L}_{\\text{acc}} \\) be " +
            "an account-based ledger. For any transaction \\( \\mathsf{tx} \\), " +
            "\\( \\Delta \\mathcal{L}_{\\text{acc}}(\\mathsf{tx}) \\) necessarily identifies " +
            "at least one address unless commitments are used for the entire state. " +
            "This is why Zcash uses a shielded pool (UTxO-style) even when built on " +
            "an EVM-compatible chain, and why efficient anonymous account-based systems " +
            "remain open problem #6 in the SoK."
        },
        {
          subtitle: "Homomorphic Encryption for Balance Verification",
          content:
            "For confidential but non-anonymous payments, the SoK shows that " +
            "Pedersen commitments with homomorphic verification suffice. Given " +
            "\\( C_i = v_i \\cdot G + r_i \\cdot H \\), balance is verified by checking: " +
            "\\[ \\sum_{i} C_{\\text{in},i} - \\sum_{j} C_{\\text{out},j} = r_{\\text{excess}} \\cdot H \\] " +
            "The excess \\( r_{\\text{excess}} \\) serves as a transaction signature scalar " +
            "(the 'kernel' in Mimblewimble). For full anonymity, a ZKP of " +
            "knowledge is required in addition: " +
            "\\[ \\pi \\leftarrow \\mathsf{ZKPoK}\\{(v, r) : C = v \\cdot G + r \\cdot H \\wedge v \\geq 0\\} \\] " +
            "combining a range proof with a commitment opening proof."
        },
        {
          subtitle: "Six Open Problems (Formal Statement)",
          content:
            "The SoK concludes with six open problems, two of which directly motivate " +
            "your thesis: " +
            "<ul>" +
            "<li><strong>OP#3 — Privacy with Auditability:</strong> Construct a scheme " +
            "achieving full anonymity and soundness, while admitting a threshold " +
            "de-anonymization protocol \\( \\mathsf{Audit}(\\mathsf{tx}, \\pi_{\\text{aud}}) \\) " +
            "that reveals \\( (S, R) \\) only when \\( t \\)-of-\\( n \\) auditors " +
            "cooperate, without degrading anonymity for non-audited transactions.</li>" +
            "<li><strong>OP#5 — Anonymous Credentials + Payments:</strong> Construct a " +
            "scheme where a sender proves possession of an anonymous credential " +
            "\\( \\sigma \\) (e.g., 'age ≥ 18') as part of the transaction proof, " +
            "without linking the credential issuance to the payment.</li>" +
            "</ul>" +
            "Both open problems are addressed in your thesis by combining BBS+ " +
            "credentials, range proofs, and a TEE-based audit path."
        }
      ]
    },

    /* ── Paper 2: Hitchhiker's Guide ── */
    {
      name: "Hitchhiker's Guide to Privacy-Preserving Digital Payment Systems",
      formalDefinition:
        "The paper provides a policy-oriented taxonomy rather than game-based " +
        "definitions, but maps each privacy goal to a cryptographic primitive: " +
        "<ul>" +
        "<li><strong>Payment Confidentiality:</strong> Hiding \\( v \\) — achieved by " +
        "Pedersen commitments \\( C = v \\cdot G + r \\cdot H \\) or ElGamal encryption " +
        "\\( (r \\cdot G, v \\cdot G + r \\cdot \\mathsf{pk}) \\).</li>" +
        "<li><strong>Sender Anonymity:</strong> Hiding sender identity — achieved by " +
        "ring signatures over a set \\( S = \\{\\mathsf{pk}_1, \\ldots, \\mathsf{pk}_k\\} \\) " +
        "or ZK membership proofs in a commitment tree.</li>" +
        "<li><strong>Relationship Privacy:</strong> Unlinking \\( (S, R) \\) pairs — " +
        "requires stealth addresses or per-transaction key derivation " +
        "\\( \\mathsf{addr}_{\\text{one-time}} = H(r \\cdot \\mathsf{pk}_R) \\cdot G + \\mathsf{pk}_R \\).</li>" +
        "</ul>",
      mathDetails: [
        {
          subtitle: "AML/KYC Tension Formalized",
          content:
            "The paper identifies the fundamental tension as a theorem: " +
            "No scheme can simultaneously achieve (a) sender-receiver unlinkability " +
            "and (b) mandatory transaction traceability for all transactions. " +
            "Proof sketch: sender-receiver unlinkability requires that for any " +
            "transaction \\( \\mathsf{tx} \\), a PPT distinguisher \\( \\mathcal{D} \\) " +
            "cannot link sender \\( S \\) to receiver \\( R \\) with advantage " +
            "\\( > \\mathsf{negl}(\\lambda) \\). Mandatory traceability requires " +
            "an efficient algorithm \\( \\mathsf{Trace}(\\mathsf{tx}) \\to (S, R) \\). " +
            "These are contradictory unless \\( \\mathsf{Trace} \\) uses a secret key " +
            "\\( \\mathsf{sk}_{\\text{aud}} \\) not available to \\( \\mathcal{D} \\) — " +
            "i.e., selective traceability with an auditor key resolves the tension."
        },
        {
          subtitle: "Stealth Address Construction",
          content:
            "The paper reviews the stealth address technique for receiver anonymity: " +
            "Let \\( (\\mathsf{sk}_R, \\mathsf{pk}_R) \\) be receiver's keys. " +
            "Sender samples \\( r \\xleftarrow{\\$} \\mathbb{Z}_p \\) and computes: " +
            "\\[ \\mathsf{addr}_{\\text{stealth}} = H(r \\cdot \\mathsf{pk}_R) \\cdot G + \\mathsf{pk}_R \\] " +
            "Publishing \\( r \\cdot G \\) (the ephemeral key) on-chain allows the " +
            "receiver to check all transactions: " +
            "\\[ H(\\mathsf{sk}_R \\cdot (r \\cdot G)) \\cdot G + \\mathsf{pk}_R " +
            "\\stackrel{?}{=} \\mathsf{addr}_{\\text{stealth}} \\] " +
            "This costs \\( O(n) \\) receiver scanning per block with \\( n \\) transactions. " +
            "The paper identifies this scanning cost as an open scalability challenge."
        }
      ]
    },

    /* ── Paper 3: UTT ── */
    {
      name: "UTT: Decentralized Ecash with Accountable Privacy",
      formalDefinition:
        "UTT defines a <em>decentralized ecash scheme with accountable privacy</em> " +
        "as a tuple \\( \\Sigma_{\\text{UTT}} = (\\mathsf{Setup}, \\mathsf{Reg}, " +
        "\\mathsf{Mint}, \\mathsf{Transfer}, \\mathsf{Burn}, \\mathsf{Audit}) \\) " +
        "with the following security properties: " +
        "<ul>" +
        "<li><strong>Untraceability:</strong> For any PPT adversary \\( \\mathcal{A} \\), " +
        "\\( \\Pr[\\mathcal{A} \\text{ identifies sender in } \\mathsf{tx}] \\leq \\mathsf{negl}(\\lambda) \\)</li>" +
        "<li><strong>Balance:</strong> No coalition of malicious users can produce " +
        "a valid transaction where \\( \\sum v_{\\text{in}} < \\sum v_{\\text{out}} \\)</li>" +
        "<li><strong>Budget Soundness:</strong> No user can transfer more than their " +
        "privacy budget \\( B \\) in any audit epoch without producing an invalid proof</li>" +
        "<li><strong>Auditability:</strong> A threshold committee of \\( t \\)-of-\\( n \\) " +
        "auditors can recover \\( (S, R, v) \\) for any transaction given the " +
        "audit ciphertext \\( \\mathsf{ct}_{\\text{aud}} \\) embedded in \\( \\mathsf{tx} \\)</li>" +
        "</ul>",
      mathDetails: [
        {
          subtitle: "Coin Structure and Pedersen Commitment",
          content:
            "Each UTT coin is a tuple \\( (\\mathsf{sn}, t, v, \\mathsf{pk}, \\tau) \\) where: " +
            "<ul>" +
            "<li>\\( \\mathsf{sn} \\in \\mathbb{Z}_p \\) — serial number (unique identifier)</li>" +
            "<li>\\( t \\in \\{0, 1\\} \\) — coin type (public or private)</li>" +
            "<li>\\( v \\in [0, 2^\\ell] \\) — value (hidden in private coins)</li>" +
            "<li>\\( \\mathsf{pk} \\in \\mathbb{G} \\) — owner public key</li>" +
            "<li>\\( \\tau \\in \\mathbb{Z}_p \\) — budget tag (epoch-specific)</li>" +
            "</ul>" +
            "The coin commitment is: " +
            "\\[ C_{\\text{coin}} = \\mathsf{sn} \\cdot G_0 + v \\cdot G_1 + \\mathsf{pk} \\cdot G_2 + \\tau \\cdot G_3 + r \\cdot H \\] " +
            "for independently chosen generators \\( G_0, G_1, G_2, G_3, H \\). " +
            "The multi-base structure allows separate ZKP sub-circuits for each component."
        },
        {
          subtitle: "Threshold BLS Coin Issuance",
          content:
            "UTT uses threshold BLS signatures for distributed minting. The bank is " +
            "split into \\( n \\) trustees with shares \\( \\mathsf{sk}_i \\) of a " +
            "joint secret key \\( \\mathsf{sk} = f(0) \\) where \\( f \\) is a " +
            "degree-\\( (t-1) \\) polynomial. To mint coin \\( C \\):" +
            "\\[ \\sigma_i = \\mathsf{sk}_i \\cdot H_1(C) \\quad \\text{(partial signature)} \\] " +
            "\\[ \\sigma = \\sum_{i \\in S} \\lambda_i \\cdot \\sigma_i \\quad \\text{(Lagrange interpolation)} \\] " +
            "\\[ \\text{Verify: } e(\\sigma, G) = e(H_1(C), \\mathsf{pk}) \\] " +
            "where \\( e : \\mathbb{G}_1 \\times \\mathbb{G}_2 \\to \\mathbb{G}_T \\) is " +
            "a bilinear pairing over BLS12-381 (the same curve used in Ethereum's " +
            "BLS signatures and in Groth16 proofs)."
        },
        {
          subtitle: "Spend Proof (ZKP Circuit)",
          content:
            "A UTT spend transaction proves in zero knowledge: " +
            "\\[ \\pi_{\\text{spend}} \\leftarrow \\mathsf{ZKPoK}\\bigg\\{ " +
            "(\\mathsf{sn}_{\\text{in}}, v_{\\text{in}}, r_{\\text{in}}, \\mathsf{sk}, \\sigma) \\;:\\; \\] " +
            "\\[ C_{\\text{in}} = \\text{commit}(\\mathsf{sn}_{\\text{in}}, v_{\\text{in}}, \\ldots) \\] " +
            "\\[ \\wedge \\; e(\\sigma, G) = e(H_1(C_{\\text{in}}), \\mathsf{pk}_{\\text{bank}}) \\] " +
            "\\[ \\wedge \\; \\mathsf{nul} = H_2(\\mathsf{sn}_{\\text{in}}, \\mathsf{sk}) \\] " +
            "\\[ \\wedge \\; v_{\\text{in}} \\geq 0 \\; \\wedge \\; \\sum v_{\\text{in}} = \\sum v_{\\text{out}} \\bigg\\} \\] " +
            "The nullifier \\( \\mathsf{nul} \\) is published on-chain; re-spending " +
            "the same coin produces the same \\( \\mathsf{nul} \\), detected by the validator. " +
            "The circuit is implemented using Groth16 (constant-size proofs: 3 \\( \\mathbb{G}_1 \\) + " +
            "1 \\( \\mathbb{G}_2 \\) point = ~192 bytes total)."
        },
        {
          subtitle: "Budget Proof and Privacy Budget System",
          content:
            "Each user has a privacy budget \\( B_u \\) per epoch. The budget tag " +
            "\\( \\tau \\) is a commitment to the remaining budget: " +
            "\\[ \\tau = H_3(\\mathsf{epoch} \\| \\mathsf{pk} \\| b_{\\text{remaining}}) \\] " +
            "During a transfer of value \\( v \\), the spend proof also proves: " +
            "\\[ \\pi_{\\text{budget}} \\leftarrow \\mathsf{ZKPoK}\\{ " +
            "(b_{\\text{old}}, b_{\\text{new}}) : b_{\\text{new}} = b_{\\text{old}} - v \\wedge b_{\\text{new}} \\geq 0 \\} \\] " +
            "The range proof \\( b_{\\text{new}} \\geq 0 \\) prevents overspending. " +
            "This maps directly to your thesis's payment-cap ZKP: a user can prove " +
            "their cumulative monthly transfers stay below a regulatory threshold " +
            "without revealing the exact amounts."
        },
        {
          subtitle: "ElGamal Audit Encryption",
          content:
            "Each transaction includes an audit ciphertext for the auditor committee: " +
            "\\[ \\mathsf{ct}_{\\text{aud}} = (r \\cdot G, \\; (S, R, v) + r \\cdot \\mathsf{pk}_{\\text{aud}}) \\] " +
            "where \\( \\mathsf{pk}_{\\text{aud}} = \\mathsf{sk}_{\\text{aud}} \\cdot G \\) is " +
            "the auditor committee's joint public key (a threshold ElGamal key). " +
            "The spend ZKP proves that \\( \\mathsf{ct}_{\\text{aud}} \\) correctly " +
            "encrypts the transaction parties, preventing a malicious sender from " +
            "providing garbage audit data. Decryption requires \\( t \\)-of-\\( n \\) " +
            "auditors to produce partial decryptions: " +
            "\\[ D_i = \\mathsf{sk}_i \\cdot (r \\cdot G) \\] " +
            "\\[ (S, R, v) = \\mathsf{ct}_{\\text{aud}}[1] - \\sum_{i \\in S} \\lambda_i \\cdot D_i \\]"
        }
      ]
    }
  ]
};
