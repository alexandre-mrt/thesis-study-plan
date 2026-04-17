/**
 * Ch 2.6 Papers Technical Companion — Sui Blockchain Primitives
 * Formal definitions and math details for paper recap cards.
 * Rendered by paper-guide.js via window.CH26_PAPERS_TECH.
 * KaTeX: \( inline \) and \[ display \]
 */

window.CH26_PAPERS_TECH = {
  papers: [
    /* ── Paper 1: zkLogin ── */
    {
      name: "zkLogin: Privacy-Preserving Blockchain Authentication with Existing Credentials",
      formalDefinition:
        "zkLogin defines a privacy-preserving authentication scheme " +
        "\\( \\Pi_{\\text{zkLogin}} = (\\mathsf{Setup}, \\mathsf{KeyGen}, " +
        "\\mathsf{Login}, \\mathsf{Verify}) \\) with the following properties: " +
        "<ul>" +
        "<li><strong>Correctness:</strong> An honest user with a valid JWT from " +
        "an approved OpenID provider can always produce a valid zkLogin proof.</li>" +
        "<li><strong>Identity Binding:</strong> A Sui address \\( \\mathsf{addr} \\) " +
        "derived via zkLogin is uniquely and deterministically bound to a " +
        "\\( (\\mathsf{iss}, \\mathsf{sub}, \\mathsf{aud}, \\mathsf{salt}) \\) tuple.</li>" +
        "<li><strong>Zero-Knowledge:</strong> The zkLogin proof reveals nothing about " +
        "\\( \\mathsf{sub} \\) (the OAuth subject ID) or \\( \\mathsf{salt} \\) " +
        "to the Sui validators.</li>" +
        "<li><strong>Soundness:</strong> No PPT adversary can produce a valid zkLogin " +
        "proof for a Sui address \\( \\mathsf{addr} \\) without a valid JWT " +
        "from the approved OpenID provider for the corresponding \\( \\mathsf{sub} \\).</li>" +
        "</ul>",
      mathDetails: [
        {
          subtitle: "Sui Address Derivation from OAuth Identity",
          content:
            "The Sui address for a zkLogin user is derived as: " +
            "\\[ \\mathsf{addr} = H\\big(\\mathsf{iss} \\| \\mathsf{sub} \\| \\mathsf{aud} \\| \\mathsf{salt}\\big) \\bmod 2^{256} \\] " +
            "where \\( H \\) is BLAKE2b-256 (Sui's standard hash function). " +
            "The \\( \\mathsf{salt} \\) is a user-controlled 128-bit random value " +
            "stored in the user's wallet — it acts as an unlinkability factor. " +
            "Two users with the same \\( (\\mathsf{iss}, \\mathsf{sub}) \\) but " +
            "different salts have different Sui addresses. " +
            "The address is <em>stable</em> across sessions (deterministic given the salt) " +
            "but <em>unlinkable</em> to the OAuth identity without knowing the salt. " +
            "A user who loses their salt loses access to their Sui address — " +
            "this is the key UX limitation the paper discusses."
        },
        {
          subtitle: "Proof 1: JWT Validity Circuit (Groth16 over BN254)",
          content:
            "The core circuit proves validity of a JWT signature in ZK. " +
            "Let \\( pk_{\\text{OIDC}} \\) be the OpenID provider's RSA public key " +
            "(retrieved from a well-known endpoint). The circuit proves: " +
            "\\[ \\pi_1 \\leftarrow \\mathsf{Groth16.Prove}\\bigg( " +
            "\\mathcal{C}_1, \\; " +
            "x_1 = (pk_{\\text{OIDC}}, \\mathsf{aud}, \\mathsf{nonce}_{\\text{expected}}), \\; " +
            "w_1 = (\\mathsf{jwt\\_header}, \\mathsf{jwt\\_payload}, " +
            "\\sigma_{\\text{JWT}}, \\mathsf{sub}, \\mathsf{salt}) " +
            "\\bigg) \\] " +
            "The circuit \\( \\mathcal{C}_1 \\) checks: " +
            "<ol>" +
            "<li>\\( \\mathsf{RSA\\_Verify}(pk_{\\text{OIDC}}, \\mathsf{jwt\\_header} \\| \\mathsf{jwt\\_payload}, \\sigma_{\\text{JWT}}) = \\top \\)</li>" +
            "<li>\\( \\mathsf{jwt\\_payload.aud} = \\mathsf{aud} \\) (correct client)</li>" +
            "<li>\\( \\mathsf{jwt\\_payload.nonce} = H(pk_{\\text{eph}} \\| \\mathsf{max\\_epoch} \\| r) \\) (nonce commits to ephemeral key)</li>" +
            "<li>\\( \\mathsf{addr} = H(\\mathsf{iss} \\| \\mathsf{sub} \\| \\mathsf{aud} \\| \\mathsf{salt}) \\) (address derivation)</li>" +
            "</ol>" +
            "RSA verification inside a circuit is expensive: " +
            "a 2048-bit RSA verification requires \\( \\sim 2^{17} \\) constraints " +
            "in R1CS. The zkLogin team uses the BigInt trick over BN254's scalar field " +
            "to implement this within Groth16's trusted setup framework."
        },
        {
          subtitle: "Proof 2: Ephemeral Key Binding and Session Security",
          content:
            "The second proof element is not a separate ZK proof but a conventional " +
            "signature. The user generates an ephemeral keypair " +
            "\\( (sk_{\\text{eph}}, pk_{\\text{eph}}) \\) valid for at most " +
            "\\( \\mathsf{max\\_epoch} \\) epochs on Sui. The transaction is signed: " +
            "\\[ \\sigma_{\\text{tx}} = \\mathsf{Sign}_{sk_{\\text{eph}}}(\\mathsf{tx\\_hash}) \\] " +
            "The zkLogin authenticator submitted to Sui validators is: " +
            "\\[ \\mathsf{auth} = (\\pi_1, \\; pk_{\\text{eph}}, \\; " +
            "\\mathsf{max\\_epoch}, \\; \\sigma_{\\text{tx}}) \\] " +
            "Validators check: " +
            "\\[ \\mathsf{Groth16.Verify}(vk, x_1, \\pi_1) = \\top \\] " +
            "\\[ \\mathsf{Verify}_{pk_{\\text{eph}}}(\\mathsf{tx\\_hash}, \\sigma_{\\text{tx}}) = \\top \\] " +
            "\\[ \\mathsf{epoch\\_current} \\leq \\mathsf{max\\_epoch} \\] " +
            "This design means compromising \\( sk_{\\text{eph}} \\) only gives " +
            "access until \\( \\mathsf{max\\_epoch} \\), limiting blast radius."
        },
        {
          subtitle: "Trusted Setup and Security Assumption",
          content:
            "zkLogin uses Groth16, which requires a trusted setup producing " +
            "Structured Reference String (SRS): " +
            "\\[ \\mathsf{SRS} = (\\{\\tau^i \\cdot G_1\\}_{i=0}^n, " +
            "\\{\\tau^i \\cdot G_2\\}_{i=0}^m) \\] " +
            "where \\( \\tau \\) is the toxic waste that must be destroyed. " +
            "Mysten Labs ran a multi-party computation (Powers of Tau) ceremony " +
            "where \\( \\tau = \\prod_i \\tau_i \\) and security holds if at least " +
            "one participant destroyed their \\( \\tau_i \\). " +
            "Security assumption: \\( q \\)-DLOG and \\( q \\)-power knowledge of " +
            "exponent assumption in the group \\( (\\mathbb{G}_1, \\mathbb{G}_2) \\) " +
            "over BN254 (also called BN128 in Ethereum). " +
            "Verification cost on Sui: \\( \\sim 3 \\) pairing operations " +
            "\\( e(\\cdot, \\cdot) : \\mathbb{G}_1 \\times \\mathbb{G}_2 \\to \\mathbb{G}_T \\), " +
            "approximately 2 ms on modern hardware."
        }
      ]
    },

    /* ── Paper 2: ZK Authenticator ── */
    {
      name: "ZK Authenticator: Policy-Private Obliviously Updateable Authenticator",
      formalDefinition:
        "The ZK Authenticator introduces two new security properties beyond " +
        "standard anonymous credentials: " +
        "<ul>" +
        "<li><strong>Policy Privacy:</strong> A verifier with policy \\( \\phi \\) " +
        "and a proof \\( \\pi \\) learns only whether \\( \\phi(\\mathbf{a}) = 1 \\) " +
        "for the hidden attribute vector \\( \\mathbf{a} \\), but not \\( \\phi \\) itself " +
        "or any information about \\( \\mathbf{a} \\) beyond \\( \\phi(\\mathbf{a}) = 1 \\).</li>" +
        "<li><strong>Oblivious Updateability:</strong> A credential update " +
        "\\( \\mathsf{Update}(\\sigma, a_i \\to a_i') \\to \\sigma' \\) " +
        "produces an updated credential that is computationally indistinguishable " +
        "from a fresh issuance: " +
        "\\[ \\mathsf{Update}(\\sigma, a_i \\to a_i') \\approx_c \\mathsf{Issue}(\\mathbf{a}') \\]" +
        "</li>" +
        "</ul>",
      mathDetails: [
        {
          subtitle: "Policy Privacy via Garbled Policies",
          content:
            "The paper achieves policy privacy by having the verifier provide " +
            "the policy as a garbled circuit. Let \\( \\phi : \\{0,1\\}^n \\to \\{0,1\\} \\) " +
            "be a boolean policy over \\( n \\) attribute bits. The verifier sends: " +
            "\\[ (\\tilde{\\phi}, \\{\\mathbf{k}_{b,i}\\}) \\leftarrow \\mathsf{GC.Garble}(\\phi) \\] " +
            "The prover evaluates the garbled circuit on their attributes using " +
            "oblivious transfer to retrieve the correct input labels: " +
            "\\[ \\mathbf{k}_{a_i, i} \\leftarrow \\mathsf{OT}_{\\text{sender}: \\{\\mathbf{k}_{0,i}, \\mathbf{k}_{1,i}\\}, \\; \\text{receiver}: a_i} \\] " +
            "The prover evaluates \\( \\tilde{\\phi}(\\mathbf{k}_{a_1,1}, \\ldots) \\to b \\) " +
            "and proves in ZK that \\( b = 1 \\) and the OT was performed correctly. " +
            "Policy privacy follows from garbled circuit security: " +
            "the garbled circuit reveals nothing about \\( \\phi \\) beyond its truth table output."
        },
        {
          subtitle: "Oblivious Update via Re-Randomization",
          content:
            "The oblivious update property is achieved by combining BBS+ " +
            "re-randomization with a hiding commitment to the updated attribute. " +
            "Given credential \\( \\sigma = (A, e, s) \\) on attributes \\( \\mathbf{m} \\) " +
            "where \\( A = (\\mathsf{pk} + \\mathsf{msgs} + e)^{-1} \\cdot P_1 \\): " +
            "<ol>" +
            "<li>Issue a new credential \\( \\sigma' \\) on \\( \\mathbf{m}' \\) normally.</li>" +
            "<li>Re-randomize \\( \\sigma' \\): " +
            "\\( A' = r^{-1} \\cdot A_{\\sigma'}, \\; e' = e_{\\sigma'} - r \\cdot s_{\\sigma'} \\).</li>" +
            "<li>Prove in ZK that the re-randomized credential is valid " +
            "without revealing the link to \\( \\sigma \\) or \\( \\sigma' \\).</li>" +
            "</ol>" +
            "The output is computationally indistinguishable from fresh issuance " +
            "under the BBS+ unforgeability assumption, achieving oblivious updateability."
        }
      ]
    },

    /* ── Paper 3: Sui Confidential Transactions ── */
    {
      name: "Sui Confidential Transactions",
      formalDefinition:
        "Based on Mysten Labs's public communications and the UTT/Aptos precedents, " +
        "the expected design defines a <em>confidential transaction</em> on Sui as " +
        "a Move object transition satisfying: " +
        "<ul>" +
        "<li><strong>Balance Hiding:</strong> \\( C_v = v \\cdot G + r \\cdot H \\) — " +
        "value \\( v \\) is hidden in a Pedersen commitment.</li>" +
        "<li><strong>Balance Preservation:</strong> " +
        "\\( \\sum C_{v,\\text{in}} - \\sum C_{v,\\text{out}} = r_{\\text{excess}} \\cdot H \\) — " +
        "verifiable homomorphically.</li>" +
        "<li><strong>Range Validity:</strong> \\( v_{\\text{out}} \\in [0, 2^{64}] \\) — " +
        "proved via Bulletproofs or Groth16 range circuit.</li>" +
        "<li><strong>Ownership:</strong> Ownership of a confidential coin object is " +
        "enforced by Sui's object model: the \\( \\mathsf{owner} \\) field is an " +
        "address or a capability object, not hidden.</li>" +
        "</ul>" +
        "<em>NIGHT-SHIFT-REVIEW: This is expected design based on public communications " +
        "— confirm against Mysten Labs design doc when published.</em>",
      mathDetails: [
        {
          subtitle: "Sui Object Model Integration",
          content:
            "Sui uses an object-centric model rather than a global account state. " +
            "Each object \\( O = (\\mathsf{id}, \\mathsf{type}, \\mathsf{owner}, " +
            "\\mathsf{version}, \\mathsf{content}) \\) has a unique ID and is " +
            "owned by exactly one address or shared. A confidential coin object is expected to be: " +
            "<pre style='font-family: monospace; font-size: 0.85em; background: #1a1a2e; " +
            "padding: 8px; border-radius: 4px;'>" +
            "struct ConfidentialCoin has key, store {\\n" +
            "  id: UID,\\n" +
            "  commitment: vector&lt;u8&gt;,  // Pedersen C = v*G + r*H\\n" +
            "  range_proof: vector&lt;u8&gt;, // Groth16 or Bulletproof\\n" +
            "  audit_ct: Option&lt;vector&lt;u8&gt;&gt;, // ElGamal to auditor pk\\n" +
            "}" +
            "</pre>" +
            "The owner field is a plain Sui address (not hidden). This means " +
            "sender-receiver pairs are visible (address-level pseudonymity only) — " +
            "full sender anonymity requires a nullifier-based anonymous pool " +
            "(like Zcash's shielded pool), which is a separate, more complex primitive. " +
            "Your thesis likely targets confidentiality (hidden amounts) rather than " +
            "full anonymity, which is compatible with Sui's object model."
        },
        {
          subtitle: "Balance Verification via Homomorphic Commitment",
          content:
            "The core balance check for a confidential transfer from " +
            "\\( (C_{\\text{in}}) \\) to \\( (C_{\\text{out,1}}, C_{\\text{out,2}}) \\): " +
            "\\[ C_{\\text{in}} - C_{\\text{out,1}} - C_{\\text{out,2}} " +
            "\\stackrel{?}{=} C_{\\text{fee}} \\] " +
            "Since Pedersen commitments are additively homomorphic: " +
            "\\[ (v_{\\text{in}} - v_{\\text{out,1}} - v_{\\text{out,2}} - v_{\\text{fee}}) \\cdot G " +
            "+ (r_{\\text{in}} - r_{\\text{out,1}} - r_{\\text{out,2}} - r_{\\text{fee}}) \\cdot H " +
            "= 0 \\cdot G + r_{\\text{excess}} \\cdot H \\] " +
            "This holds if and only if \\( v_{\\text{in}} = v_{\\text{out,1}} + v_{\\text{out,2}} + v_{\\text{fee}} \\). " +
            "The validator checks this equation on-chain (elliptic curve point arithmetic), " +
            "plus verifies the range proofs for each output commitment. " +
            "The range proof prover time dominates: Bulletproofs++ gives " +
            "\\( \\sim 50 \\) ms for 64-bit range on Ristretto255; " +
            "Groth16 range circuit gives \\( \\sim 300 \\) ms but constant verification."
        },
        {
          subtitle: "TEE Audit Path Integration",
          content:
            "The expected audit ciphertext is ElGamal encryption under the auditor's " +
            "public key \\( pk_{\\text{aud}} = sk_{\\text{aud}} \\cdot G \\): " +
            "\\[ \\mathsf{ct}_{\\text{aud}} = (r \\cdot G, \\; v \\cdot G + r \\cdot pk_{\\text{aud}}) \\] " +
            "Your TEE-based auditor holds \\( sk_{\\text{aud}} \\) within the enclave. " +
            "When a court order triggers an audit, the TEE decrypts: " +
            "\\[ v \\cdot G = \\mathsf{ct}_{\\text{aud}}[1] - sk_{\\text{aud}} \\cdot \\mathsf{ct}_{\\text{aud}}[0] \\] " +
            "Then solves the discrete log for \\( v \\) — feasible since " +
            "\\( v \\in [0, 2^{64}] \\) using baby-step giant-step in \\( O(2^{32}) \\) time, " +
            "or more practically, if the TEE also has access to the blinding factor \\( r \\) " +
            "from the sender (shared via authenticated encryption to the TEE), " +
            "it can directly compute \\( v = (\\mathsf{ct}[1] - r \\cdot pk_{\\text{aud}}) / G \\). " +
            "The TEE's attestation certificate proves to a court that only the " +
            "authorized audit code ran — no other queries were served."
        }
      ]
    }
  ]
};
