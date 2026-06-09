/**
 * Private Transactions on Sui — Technical Companion (paired with SUIPRIVATETX_GUIDE).
 * Threat model, the four-layer stack, and the thesis composition — technical detail.
 * HTML formatting; <code> inline, <pre> blocks. contra cites → confidential-transfers @ 27c382f.
 */

window.SUIPRIVATETX_TECHNICAL = {
  block1: {
    concepts: [
      /* ───────── 1. Threat model ───────── */
      {
        name: "What's Public by Default on Sui — The Privacy Threat Model",
        formalDefinition:
          "<p>Sui's state is a set of <strong>objects</strong>, each with a public " +
          "<code>(id, version, type, owner, contents)</code>. A transaction is a " +
          "<strong>Programmable Transaction Block</strong> (PTB) whose <code>sender</code>, " +
          "<code>MoveCall</code> targets, input objects/pure args, and <strong>effects</strong> " +
          "(<code>balanceChanges</code>, created/mutated/deleted objects, emitted events) are all " +
          "recorded in plaintext and served by RPC/explorers. There is no native shielded pool or " +
          "encrypted mempool.</p>" +
          "<p>Formally, model the adversary <code>A</code> as a passive observer with full read access to " +
          "chain state + effects (optionally also a validator with execution-time visibility, or a " +
          "registered auditor). Privacy goals are stated per leak:</p>" +
          "<ul>" +
          "<li><strong>Amount hiding:</strong> <code>A</code> cannot learn transfer values.</li>" +
          "<li><strong>Data hiding:</strong> <code>A</code> cannot read contract-held blobs.</li>" +
          "<li><strong>Compute hiding:</strong> <code>A</code> cannot learn inputs/intermediate state.</li>" +
          "<li><strong>Identity/graph hiding:</strong> <code>A</code> cannot link address↔real-identity " +
          "nor link an address's transactions (unlinkability).</li>" +
          "</ul>",
        mathDetails: [
          {
            subtitle: "What an explorer reads from one transfer",
            content:
              "<pre><code>" +
              "TransactionBlockResponse {\n" +
              "  transaction.data.sender: 0xA            // identity (pseudonym)\n" +
              "  transaction.data.commands: [MoveCall{ package, module, function }] // logic\n" +
              "  transaction.data.inputs:   [Object(id), Pure(bytes)]              // inputs\n" +
              "  effects.status, gasUsed, gasObject (payer)                        // gas → payer\n" +
              "  balanceChanges: [{owner:0xA, -10},{owner:0xB,+10}]               // AMOUNT+GRAPH\n" +
              "  objectChanges, events                                            // state\n" +
              "}</code></pre>" +
              "<p>Each line maps to a leak category. A privacy claim must specify which line(s) are " +
              "redacted and which remain — anything unredacted is in <code>A</code>'s view.</p>"
          },
          {
            subtitle: "Residual graph leak (formal)",
            content:
              "<p>Even with amounts hidden, define the public transfer graph " +
              "<code>G = (V, E)</code> where <code>V</code> = addresses and " +
              "<code>(u,v,t) &isin; E</code> for each confidential transfer at time <code>t</code>. " +
              "Amount-hiding redacts edge <em>weights</em> but not edge <em>existence</em>. Standard " +
              "graph deanonymization (degree, timing correlation, wrap/unwrap boundary events) recovers " +
              "structure from <code>G</code> alone &mdash; hence amount privacy &ne; payment privacy, and " +
              "an <strong>anonymity set</strong> (edge-existence hiding) is a separate, unmet goal.</p>"
          }
        ]
      },

      /* ───────── 2. Four-layer stack ───────── */
      {
        name: "The Sui Privacy Stack — Four Layers of Confidentiality",
        formalDefinition:
          "<p>Four orthogonal primitives, each a different hardness assumption. Composition privacy is " +
          "the <strong>conjunction</strong> of guarantees and the <strong>union</strong> of trust " +
          "assumptions &mdash; i.e. privacy = MIN over layers, trust = SUM over layers.</p>" +
          "<table style='width:100%;border-collapse:collapse'>" +
          "<tr><th style='text-align:left'>Layer</th><th style='text-align:left'>Primitive</th>" +
          "<th style='text-align:left'>Assumption</th></tr>" +
          "<tr><td>Amount</td><td>Confidential Transfers (twisted ElGamal + Bulletproofs)</td>" +
          "<td>DDH on Ristretto255; DL of <code>h</code> unknown</td></tr>" +
          "<tr><td>Data</td><td>Seal (IBE threshold encryption)</td>" +
          "<td>&lt; t-of-n key servers collude; BLS/IBE hardness</td></tr>" +
          "<tr><td>Compute</td><td>Nautilus (AWS Nitro TEE)</td>" +
          "<td>AWS root CA + Nitro silicon honest; no side-channel</td></tr>" +
          "<tr><td>Identity</td><td>zkLogin (Groth16 BN254)</td>" +
          "<td>OIDC issuer honest; salt secret; prover correct</td></tr>" +
          "</table>",
        mathDetails: [
          {
            subtitle: "Seal — access-gated threshold decryption",
            content:
              "<p>Data is IBE-encrypted to an <em>identity</em> = a policy id; the master key is shared " +
              "<code>t-of-n</code> across key servers. A client obtains a decryption key only if a Move " +
              "<code>seal_approve</code> function (a dry-run access check) does not abort, then combines " +
              "<code>t</code> server responses. Trust degrades gracefully: privacy holds unless " +
              "<code>&ge; t</code> servers collude.</p>" +
              "<pre><code>encrypt(data) → ciphertext bound to policy P\n" +
              "decrypt: dry-run seal_approve(P, ctx) must pass → fetch t key shares → combine</code></pre>" +
              "<p>(Deep dive: the Seal material in Ch 2.3 / <code>/sui-seal</code>.)</p>"
          },
          {
            subtitle: "Nautilus — attested compute (output integrity, input secrecy)",
            content:
              "<p>Logic runs in a Nitro Enclave that emits a COSE_Sign1 attestation binding PCRs " +
              "(code measurement) to an ephemeral public key; a Move verifier checks the AWS-rooted " +
              "cert chain via <code>sui::nitro_attestation</code>, then trusts outputs signed by that " +
              "key. Inputs/intermediate state stay sealed; only the OUTPUT is published and verifiable. " +
              "(Deep dive: the Nautilus chapter.)</p>"
          },
          {
            subtitle: "zkLogin — identity-link hiding",
            content:
              "<pre><code>address = Blake2b( salt, iss, aud, sub )   // no visible web2 tie\n" +
              "Groth16 proof (BN254) attests:\n" +
              "  • a valid, unexpired OIDC JWT for (iss, aud, sub)\n" +
              "  • commitment to an ephemeral key + max epoch\n" +
              "verified on-chain by sui::groth16 (same verifier family the thesis reuses)</code></pre>"
          }
        ]
      },

      /* ───────── 3. contra one page ───────── */
      {
        name: "Amount Privacy — Confidential Transfers (`contra`) in One Page",
        formalDefinition:
          "<p>The amount layer. An <code>EncryptedAmount</code> is four u16 twisted-ElGamal limbs " +
          "(<code>c = r&middot;g + m&middot;h</code>, <code>d = r&middot;pk</code>); a " +
          "<code>WellFormedProof</code> = Bulletproofs (per-limb range, " +
          "<code>sui::rangeproofs::verify_bulletproofs_ristretto255</code>) + per-limb ElGamal sigma " +
          "proofs; a <code>DdhProof</code> proves balance equality on a spend. Value crosses the " +
          "public/confidential boundary via <code>wrap</code>/<code>unwrap</code> (amount revealed) and " +
          "moves hidden via <code>batched_transfer</code>. Full treatment in the Ch 2.2 Confidential " +
          "Transfers chapter; this page is the integration view.</p>",
        mathDetails: [
          {
            subtitle: "The integration seam (Auth witness)",
            content:
              "<pre><code>" +
              "// policy.move:35 — drop-only, phantom T, per-PTB capability\n" +
              "public struct Auth&lt;phantom T&gt; has drop { operations: u32, owner: address }\n\n" +
              "// contra.move:223 — issuer-gated mint: the thesis hook\n" +
              "public fun authorize_with_witness&lt;T, W: drop&gt;(\n" +
              "    ct: &amp;ConfidentialToken&lt;T&gt;, operation: u8, owner: address, witness: W\n" +
              "): Auth&lt;T&gt;\n" +
              "// mints Auth iff policy.witness_type == W AND operation is permissioned\n\n" +
              "// PERMISSIONED_REGISTER=0  PERMISSIONED_WRAP=1  PERMISSIONED_UNWRAP=2 (contra.move:103)" +
              "</code></pre>" +
              "<p>Replace the issuer's KYC-list check with a credential ZK-proof check inside the module " +
              "that holds <code>W</code>: verifying the proof, then calling " +
              "<code>authorize_with_witness</code>, yields anonymous authorization over confidential " +
              "value.</p>"
          },
          {
            subtitle: "What it does / doesn't hide (precise)",
            content:
              "<pre><code>HIDES : transfer amounts, balances (active/pending)\n" +
              "LEAKS : sender, receiver, timing (every transfer);\n" +
              "        amount + counterparty of each wrap/unwrap (boundary)\n" +
              "EXTRAS: per-account auditor (selective visibility), freeze/seize,\n" +
              "        user selective disclosure (verifyDecryption, protocol-id 100)\n" +
              "STATUS: devnet beta, UNAUDITED, pkg 0xe0f1b22e…0c271</code></pre>"
          }
        ]
      },

      /* ───────── 4. zkLogin + anonymity-set gap ───────── */
      {
        name: "Identity & Sender Privacy — zkLogin and the Anonymity-Set Gap",
        formalDefinition:
          "<p>zkLogin provides <strong>web2-link unlinkability</strong>: the map " +
          "real-identity&rarr;address is hidden behind a Groth16 proof + a secret salt. It does NOT " +
          "provide <strong>per-use unlinkability</strong>: a zkLogin address is a persistent pseudonym, " +
          "so its transactions are mutually linkable, and Sui has no anonymity set (no mixing / shielded " +
          "pool / ring signatures). Anonymous credentials supply the missing notion.</p>" +
          "<p>An <strong>anonymous credential</strong> scheme provides algorithms " +
          "<code>(Issue, Prove, Verify, Revoke)</code> such that a holder can prove possession of a " +
          "credential (and selectively disclose attributes) so that: (i) proofs reveal nothing beyond " +
          "the disclosed predicate (zero-knowledge), (ii) two showings are <em>unlinkable</em>, and " +
          "(iii) double-spend/sybil is prevented by a <strong>nullifier</strong> that is unique per " +
          "(credential, context) yet reveals neither the credential nor links to other nullifiers.</p>",
        mathDetails: [
          {
            subtitle: "zkLogin vs anonymous credentials",
            content:
              "<table style='width:100%;border-collapse:collapse'>" +
              "<tr><th style='text-align:left'>Property</th><th>zkLogin</th><th>Anon. credential</th></tr>" +
              "<tr><td>Hides web2 ↔ address</td><td>yes</td><td>n/a</td></tr>" +
              "<tr><td>Unlinkable across uses</td><td><strong>no</strong> (stable pseudonym)</td><td><strong>yes</strong></td></tr>" +
              "<tr><td>Selective attribute disclosure</td><td>no</td><td>yes</td></tr>" +
              "<tr><td>Double-spend control</td><td>n/a</td><td>nullifier</td></tr>" +
              "<tr><td>On-chain verifier</td><td>sui::groth16</td><td>sui::groth16 (same)</td></tr>" +
              "</table>" +
              "<p>Same Groth16 verifier, different statement &mdash; a clean feasibility/cost argument: " +
              "benchmark the credential circuit against zkLogin's known on-chain verify gas.</p>"
          },
          {
            subtitle: "Nullifier sketch (unlinkable + unique)",
            content:
              "<pre><code>nullifier = H( sk_credential , context )\n" +
              "  • unique:    deterministic in (sk_credential, context) ⇒ a 2nd spend repeats it\n" +
              "  • unlinkable: H hides sk_credential; different contexts ⇒ uncorrelated nullifiers\n" +
              "on-chain: maintain a nullifier set; reject if present (double-spend);\n" +
              "          ZK proof attests nullifier well-formed w.r.t. a committed credential\n" +
              "revocation: prove membership in a NON-revoked accumulator (Merkle / RSA acc.)</code></pre>" +
              "<p>The subtlety (thesis question #4): revocation must not deanonymize &mdash; prove " +
              "non-membership in a revocation set without revealing which credential.</p>"
          }
        ]
      },

      /* ───────── 5. Composition / thesis ───────── */
      {
        name: "Composing Private Payments on Sui — The Thesis Design Space",
        formalDefinition:
          "<p>A complete private low-value payment composes the layers: confidential AMOUNT (contra) + " +
          "anonymous unlinkable AUTHORIZATION (credential ZK proof &rarr; <code>Auth&lt;T&gt;</code>) + " +
          "private ISSUANCE (Nautilus TEE, optionally Seal for key storage) + double-spend/REVOCATION " +
          "(nullifier + accumulator). Verification reuses <code>sui::groth16</code>. The binding " +
          "requirement: the credential proof must be bound to the specific contra operation it " +
          "authorizes (no replay), and the nullifier must be unique-yet-unlinkable.</p>",
        mathDetails: [
          {
            subtitle: "End-to-end PTB (one private payment)",
            content:
              "<pre><code>PTB:\n" +
              "  1. cred::verify_and_authorize&lt;T, W&gt;(ct, proof, public_inputs, op)\n" +
              "       • sui::groth16 verifies: valid non-revoked credential\n" +
              "         + selective-disclosure predicate + well-formed nullifier\n" +
              "       • assert nullifier ∉ NullifierSet ; insert it\n" +
              "       • bind proof to (op, this PTB) to prevent replay\n" +
              "       • return Auth&lt;T&gt; via contra::authorize_with_witness(ct, op, owner, W{})\n" +
              "  2. contra::wrap | batched_transfer | unwrap (auth, ...)   // amount HIDDEN\n" +
              "  // Auth<T> is drop-only ⇒ single-use authorization enforced by the type system</code></pre>"
          },
          {
            subtitle: "Mapping to the five thesis research questions",
            content:
              "<pre><code>Q1 issue without linking usage  → TEE issuance + on-chain accumulator commitment\n" +
              "Q2 verify attributes hidden     → selective-disclosure Groth16 circuit\n" +
              "Q3 role of TEE                  → stateless attested issuance (no identity DB)\n" +
              "Q4 revocation w/o deanon        → non-membership proof in revocation accumulator\n" +
              "Q5 cost on Sui / low-value      → benchmark sui::groth16 verify gas + prover time +\n" +
              "                                  e2e latency vs payment value</code></pre>"
          },
          {
            subtitle: "Open gaps & evaluation axes",
            content:
              "<p><strong>Gaps to claim as contributions / future work:</strong> bootstrapping an " +
              "anonymity set on a transparent chain; unlinkable-yet-unique nullifiers with practical " +
              "revocation; gas-payer privacy (sponsored / Enoki transactions so the gas address doesn't " +
              "deanonymize); and the TEE-vs-pure-ZK trust trade (justify the hardware root to " +
              "Ford/Troncoso). <strong>Evaluation axes:</strong> proof size, prover time, on-chain " +
              "Groth16 verify gas, end-to-end latency, and the practicality threshold for low-value " +
              "payments. Caveat: contra is UNAUDITED devnet beta &mdash; the prototype is research-grade." +
              "</p>"
          }
        ]
      }
    ]
  }
};
