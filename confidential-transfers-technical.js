/**
 * Confidential Transfers Technical Companion — paired with CONFIDENTIAL_GUIDE.
 * Deep technical detail. HTML for formatting; <code> inline, <pre> blocks.
 * Source: MystenLabs/confidential-transfers @ 27c382f (devnet beta). file:line → move/sources/*.move.
 */

window.CONFIDENTIAL_TECHNICAL = {
  block1: {
    concepts: [
      /* ───────── 1. Twisted ElGamal ───────── */
      {
        name: "Twisted ElGamal — Encrypting an Amount You Can Still Add Up",
        formalDefinition:
          "<p>Let <code>G</code> be the Ristretto255 prime-order group with two generators " +
          "<code>g</code> (standard) and <code>h</code>, where <code>log_g(h)</code> is unknown " +
          "(nothing-up-my-sleeve: <code>h = hash_to_curve(\"fastcrypto-blinding-gen-01\")</code>, " +
          "twisted_elgamal.move:49). A keypair is <code>x &larr;$ Z_q</code>, " +
          "<code>pk = x&middot;g</code>.</p>" +
          "<p><strong>Twisted ElGamal</strong> (message-in-the-exponent) encrypts " +
          "<code>m &isin; Z_q</code> with fresh <code>r &larr;$ Z_q</code> as</p>" +
          "<pre><code>c = r&middot;g + m&middot;h      (ciphertext component / Pedersen commitment to m)\n" +
          "d = r&middot;pk            (decryption handle)</code></pre>" +
          "<p><strong>Decryption</strong> with <code>x</code>: compute " +
          "<code>c &minus; x&#8315;&sup1;&middot;d = r&middot;g + m&middot;h &minus; r&middot;g = m&middot;h</code>, " +
          "then recover <code>m = log_h(m&middot;h)</code> by a bounded discrete-log search.</p>" +
          "<p><strong>Additive homomorphism:</strong> " +
          "<code>(c&#8321;,d&#8321;) &oplus; (c&#8322;,d&#8322;) = (c&#8321;+c&#8322;, d&#8321;+d&#8322;) = Enc(m&#8321;+m&#8322;)</code> " +
          "under randomness <code>r&#8321;+r&#8322;</code>. This is the property that lets the chain " +
          "credit deposits without decrypting.</p>" +
          "<p><strong>Security:</strong> IND-CPA hiding reduces to DDH in <code>G</code>; binding of the " +
          "embedded commitment reduces to the discrete-log hardness of <code>log_g(h)</code>.</p>",
        mathDetails: [
          {
            subtitle: "On-chain type & homomorphic ops (Move)",
            content:
              "<pre><code>" +
              "// twisted_elgamal.move:29\n" +
              "public struct Encryption has copy, drop, store {\n" +
              "    ciphertext: Element&lt;G&gt;,        // c = r&middot;g + m&middot;h\n" +
              "    decryption_handle: Element&lt;G&gt;, // d = r&middot;pk\n" +
              "}\n\n" +
              "// add(): componentwise point addition  (twisted_elgamal.move:67)\n" +
              "Encryption {\n" +
              "    ciphertext:        g_add(&amp;e1.ciphertext,        &amp;e2.ciphertext),\n" +
              "    decryption_handle: g_add(&amp;e1.decryption_handle, &amp;e2.decryption_handle),\n" +
              "}</code></pre>" +
              "<p><code>add_assign</code>/<code>sub_assign</code> mutate in place; " +
              "<code>add_assign_u64(e, a)</code> folds a PUBLIC value via " +
              "<code>e.ciphertext += a&middot;h</code> (no handle change, twisted_elgamal.move:97).</p>"
          },
          {
            subtitle: "The blinding generator h (verify it is NUMS)",
            content:
              "<pre><code>" +
              "// twisted_elgamal.move:49-53\n" +
              "public(package) fun h(): Element&lt;G&gt; {\n" +
              "    g_from_bytes(\n" +
              "        &amp;x\"34ce1477c14558178089500a39c864e0f607b3c1f41ab398400e4a9de6d2c446\"\n" +
              "    )\n" +
              "}</code></pre>" +
              "<p>Soundness of the embedded Pedersen commitment requires <code>log_g(h)</code> to be " +
              "unknown. The constant is the hash-to-curve image of the domain string " +
              "<code>\"fastcrypto-blinding-gen-01\"</code> &mdash; a thesis security note: a reviewer " +
              "should independently recompute this point to confirm it is nothing-up-my-sleeve.</p>"
          },
          {
            subtitle: "Trivial encryptions (public values entering the system)",
            content:
              "<p><code>encrypt_zero()</code> = <code>(0, 0)</code> (both identity); " +
              "<code>encrypt_trivial(a)</code> = <code>(a&middot;h, 0)</code> &mdash; a deterministic, " +
              "randomness-free encryption used when a known public amount is wrapped in " +
              "(twisted_elgamal.move:119-138). Because <code>d = 0</code>, a trivial encryption is NOT " +
              "hiding &mdash; consistent with the fact that <code>wrap</code> reveals the amount.</p>"
          }
        ]
      },

      /* ───────── 2. u16 Limbs & Bounded Aggregation ───────── */
      {
        name: "u16 Limbs & Bounded Aggregation — Keeping a u64 Decryptable",
        formalDefinition:
          "<p>Decryption recovers <code>m</code> via <code>log_h(m&middot;h)</code>, feasible only for " +
          "small <code>m</code> (baby-step/giant-step, ~<code>2&#179;&sup2;</code> ceiling). A " +
          "<code>u64</code> amount is therefore split into four base-<code>2&#185;&#8310;</code> limbs:</p>" +
          "<pre><code>amount = l&#8320; + l&#8321;&middot;2&#185;&#8310; + l&#8322;&middot;2&#179;&sup2; + l&#8323;&middot;2&#8308;&#8312;,   each l&#7522; &isin; [0, 2&#185;&#8310;)</code></pre>" +
          "<p>An <code>EncryptedAmount</code> is four independent <code>Encryption</code> limbs " +
          "(encrypted_amount.move:39). An <code>EncryptedBalance&lt;T&gt;</code> pairs the amount with an " +
          "<code>upper_bound: u16</code> counting how many <code>u16</code>-bounded values were folded in " +
          "(balance.move:42).</p>" +
          "<p><strong>Aggregation invariant.</strong> Each homomorphic fold adds two limbs; starting from " +
          "limbs <code>&le; 2&#185;&#8310;</code>, folding <code>k</code> values gives limbs " +
          "<code>&le; k&middot;2&#185;&#8310;</code>. Capping <code>k &le; 0xFFFF</code> keeps every limb " +
          "<code>&le; 0xFFFF&middot;0xFFFF &lt; 2&#179;&sup2;</code>, i.e. inside the BSGS window " +
          "(balance.move:115). <code>has_deposit_slot</code> reserves one slot, so the live cap is " +
          "<code>0xFFFE</code> (contra.move:977).</p>",
        mathDetails: [
          {
            subtitle: "Limb structs & recombination",
            content:
              "<pre><code>" +
              "// encrypted_amount.move:39\n" +
              "public struct EncryptedAmount has copy, drop, store {\n" +
              "    l0: Encryption, l1: Encryption, l2: Encryption, l3: Encryption,\n" +
              "}\n" +
              "// balance.move:42\n" +
              "public struct EncryptedBalance&lt;phantom T&gt; has store {\n" +
              "    amount: EncryptedAmount,\n" +
              "    upper_bound: u16,   // folded-value counter (growth bound)\n" +
              "}\n\n" +
              "// collapse_limbs: l0 + 2^16 l1 + 2^32 l2 + 2^48 l3   (encrypted_amount.move:241)\n" +
              "g_add(l0, &amp;g_add(\n" +
              "    &amp;g_mul(&amp;scalar_from_u64(1 &lt;&lt; 16), l1),\n" +
              "    &amp;g_add(&amp;g_mul(&amp;scalar_from_u64(1 &lt;&lt; 32), l2),\n" +
              "           &amp;g_mul(&amp;scalar_from_u64(1 &lt;&lt; 48), l3))))</code></pre>"
          },
          {
            subtitle: "The cap and its enforcement",
            content:
              "<pre><code>" +
              "// balance.move:115-122\n" +
              "public(package) fun max_upper_bound(): u16 { 0xFFFF }\n" +
              "public(package) fun max_upper_bound_minus_1(): u16 { 0xFFFE }\n\n" +
              "// contra.move:977-981 — slot check before accepting a deposit\n" +
              "let cap  = balance::max_upper_bound_minus_1();\n" +
              "let used = self.active.upper_bound() + self.pending.upper_bound();\n" +
              "cap &gt; used   // false → EBalancesFull (code 10)</code></pre>" +
              "<p>Recovery is <code>merge()</code> (contra.move:686): it folds pending into active and the " +
              "post-merge balance is re-stated to <code>upper_bound = 1</code>, freeing slots. This is a " +
              "cryptographic invariant (limbs <code>&lt; 2&#179;&sup2;</code>) enforced by a plain " +
              "<code>u16</code> counter, not by a proof.</p>"
          },
          {
            subtitle: "Why three balances follow from the cap",
            content:
              "<p>A spend proof commits to a snapshot of <code>active</code>. If deposits added directly " +
              "into <code>active</code>, a concurrent deposit would invalidate an in-flight proof. So " +
              "incoming value is quarantined: <code>pending</code> (encrypted transfers) and " +
              "<code>public_balance</code> (wrapped coins), both swept by <code>merge</code>. The " +
              "<code>upper_bound</code> compared against the cap is the SUM of active + pending " +
              "(contra.move:979), so a flood of un-merged deposits is what triggers " +
              "<code>EBalancesFull</code>.</p>"
          }
        ]
      },

      /* ───────── 3. Range Proofs + Sigma NIZKs ───────── */
      {
        name: "Range Proofs + Sigma NIZKs — Proving 'No Inflation, No Overdraft' Without Revealing Anything",
        formalDefinition:
          "<p>Encrypted amounts are untrusted until accompanied by proofs. <code>contra</code> uses two " +
          "proof families, each for the relation it is efficient at:</p>" +
          "<ul>" +
          "<li><strong>Bulletproofs</strong> (Bünz et&nbsp;al. 2018, version 0) for the RANGE relation " +
          "<code>l&#7522; &isin; [0, 2&#185;&#8310;)</code> per limb &mdash; blocks negative/overflow " +
          "amounts that would mint value. Verified on-chain by " +
          "<code>sui::rangeproofs::verify_bulletproofs_ristretto255</code> " +
          "(encrypted_amount.move:299).</li>" +
          "<li><strong>Sigma (Schnorr) NIZKs</strong> for LINEAR relations &mdash; cheap, bespoke, " +
          "Fiat&ndash;Shamir over Blake2b256 (nizk.move).</li>" +
          "</ul>" +
          "<p>A <code>WellFormedProof</code> = a (chunked) vector of Bulletproofs + one " +
          "<code>ConsistencyProof</code> (four <code>ElGamalProof</code>s, one per limb) per amount " +
          "(encrypted_amount.move:56-70). <code>into_well_formed</code> verifies and wraps into a " +
          "<code>WellFormedEncryptedAmount</code> or aborts <code>EWellFormedProofFailed</code> (code 4).</p>",
        mathDetails: [
          {
            subtitle: "The three sigma relations (nizk.move)",
            content:
              "<pre><code>" +
              "DdhProof  (Chaum&ndash;Pedersen): knows x s.t.  x_g = x&middot;g  AND  x_h = x&middot;h\n" +
              "    → used for balance EQUALITY: prove old_active &minus; amount == new_active\n" +
              "      and for re-keying a balance to a new pk     (nizk.move:34, 90)\n\n" +
              "ElGamalProof: knows (r,m) s.t.  c = r&middot;g + m&middot;h  AND  d = r&middot;pk\n" +
              "    → per-limb well-formedness (valid Enc under pk) (nizk.move:43, 117)\n\n" +
              "KeyConsistencyProof: the 8&times;32-bit limbs u_i of a 256-bit secret key\n" +
              "    satisfy  C_i = r_i&middot;g + u_i&middot;h,  D_ij = r_i&middot;pk_j (every auditor j),\n" +
              "    and  (&sum;_i u_i&middot;2^{32i})&middot;g == sender_public_key   (nizk.move:58, 138)" +
              "</code></pre>" +
              "<p><code>verify_elgamal</code> checks two equations: " +
              "<code>z&#8321;&middot;pk == c&middot;e&#8322; + a</code> and " +
              "<code>c&middot;e&#8321; + b == z&#8321;&middot;g + z&#8322;&middot;h</code> " +
              "(nizk.move:129-132), the standard Schnorr verification with challenge <code>c</code> and " +
              "responses <code>z&#8321;,z&#8322;</code>.</p>"
          },
          {
            subtitle: "Bulletproof batching & limb layout",
            content:
              "<pre><code>" +
              "// encrypted_amount.move:19-29\n" +
              "BULLETPROOFS_VERSION = 0   // Bünz et al. 2018\n" +
              "LIMB_BITS            = 16  // each limb proved in [0, 2^16)\n" +
              "MAX_BATCH_SIZE       = 8   // native caps 32 commitments = 8 amounts × 4 limbs\n\n" +
              "// batch_sizes(n): greedy chunking (encrypted_amount.move:311)\n" +
              "//   n=7  → [4,2,1]   n=8 → [8]   n=16 → [8,8]   n=20 → [8,8,4]\n\n" +
              "// per chunk, the 4·chunk limb ciphertexts are flattened for the verifier\n" +
              "// (encrypted_amount.move:299-305)\n" +
              "rangeproofs::verify_bulletproofs_ristretto255(\n" +
              "    range_proof, LIMB_BITS,\n" +
              "    &amp;vector::tabulate!(4*chunk, |j| *amounts[start + j/4][j%4].ciphertext()),\n" +
              "    BULLETPROOFS_VERSION)</code></pre>"
          },
          {
            subtitle: "Fiat–Shamir & domain separation",
            content:
              "<p>Challenges are <code>Blake2b256</code> over the transcript, with the bases " +
              "<code>g,h</code> bound in (nizk.move:99-112) so a proof for one relation cannot be replayed " +
              "for another. The client (nizk.ts via helpers.ts) hashes the SAME BCS-encoded transcript, so " +
              "TS-built proofs verify on-chain. Domain tags (contra.move:107-111):</p>" +
              "<pre><code>DST_DDH = 0x01   DST_ELGAMAL = 0x02   DST_KEY_CONSISTENCY = 0x03\n" +
              "session_id = 20-byte derived TokenAccount address          (contra.move:984)\n" +
              "dst        = session_id ‖ protocol_id  (21 bytes)          (contra.move:991)\n" +
              "// SDK reserves protocol-id 100 for the selective-disclosure decryption proof</code></pre>" +
              "<p>Range proofs use the <strong>Merlin/STROBE</strong> transcript (via " +
              "<code>@contra/bulletproofs-wasm</code> &rarr; <code>fastcrypto::bulletproofs</code>), " +
              "byte-compatible with the on-chain verifier.</p>"
          }
        ]
      },

      /* ───────── 4. Accounts, Balances & Auth ───────── */
      {
        name: "Accounts, Balances & the Auth Model — Where the Hidden Money Lives",
        formalDefinition:
          "<p>State is built entirely from Sui derived objects + dynamic fields, so addresses are " +
          "deterministic and no indexer is needed. Two shared singletons are created at " +
          "<code>init</code> (contra.move:205): <code>TokenRegistry</code> and " +
          "<code>AccountRegistry</code>. Per coin type <code>T</code> there is one " +
          "<code>ConfidentialToken&lt;T&gt;</code> (claimed via <code>TokenKey&lt;T&gt;()</code>) and a " +
          "derived <code>Pool&lt;T&gt;</code> custodying the wrapped <code>Coin&lt;T&gt;</code> reserve as " +
          "a Sui address balance. Per address there is one <code>Account</code>; per-token state is a " +
          "dynamic field <code>TokenAccount&lt;T&gt;</code> with three balances.</p>" +
          "<p>Every state-changing op consumes an <code>Auth&lt;T&gt;</code> &mdash; a drop-only, " +
          "phantom-typed capability carrying an operations bitmap + the authenticated owner " +
          "(policy.move:35). A <code>Policy</code> (u32 bitmap gated by a witness <code>TypeName</code>) " +
          "decides which operations need the permissioned path; absence of a policy = fully " +
          "permissionless.</p>",
        mathDetails: [
          {
            subtitle: "Core types (contra.move)",
            content:
              "<pre><code>" +
              "// contra.move:127\n" +
              "public struct ConfidentialToken&lt;phantom T&gt; has key {\n" +
              "    id: UID, is_active: bool, freeze_admins: VecSet&lt;address&gt;,\n" +
              "    policy: Option&lt;Policy&gt;, auditors: Auditors }\n\n" +
              "// contra.move:145, 151\n" +
              "public struct Account has key { id: UID, owner: address }\n" +
              "public struct TokenAccount&lt;phantom T&gt; has store {\n" +
              "    pk: Element&lt;G&gt;, verified_key_encryption, session_id,\n" +
              "    is_frozen: bool, accepts_deposits: bool,\n" +
              "    active:  EncryptedBalance&lt;T&gt;,   // spendable\n" +
              "    pending: EncryptedBalance&lt;T&gt;,   // encrypted deposits\n" +
              "    public_balance: PublicCoin&lt;T&gt;,  // wrapped coins\n" +
              "}</code></pre>"
          },
          {
            subtitle: "The Auth capability & its three constructors",
            content:
              "<pre><code>" +
              "// policy.move:35 — drop-only, phantom T (no store ⇒ per-PTB, non-reusable)\n" +
              "public struct Auth&lt;phantom T&gt; has drop { operations: u32, owner: address }\n\n" +
              "// contra.move\n" +
              "authorize_as_sender(ct, ctx)            // owner = ctx.sender()      :216\n" +
              "authorize_as_object(ct, uid: &amp;mut UID) // owner = addr(UID)         :235\n" +
              "authorize_with_witness&lt;T,W&gt;(ct, op, owner, w: W)  // issuer-gated   :223\n\n" +
              "// checks\n" +
              "is_allowed(auth, op)        // operation bit set    (policy.move:109)\n" +
              "is_authenticated(auth, who) // auth.owner == who    (policy.move:115)</code></pre>" +
              "<p><strong>Thesis seam:</strong> <code>authorize_with_witness</code> mints an " +
              "<code>Auth&lt;T&gt;</code> for <code>owner</code> only if the policy's witness type is " +
              "<code>W</code> and <code>op</code> is permissioned. A credential-verifying Move module that " +
              "produces <code>W</code> on a valid ZK proof would attach anonymous authorization to " +
              "confidential amounts.</p>"
          },
          {
            subtitle: "Policy bitmap (permissioned operations)",
            content:
              "<pre><code>" +
              "// operation ids (contra.move:103-105)\n" +
              "PERMISSIONED_REGISTER = 0   PERMISSIONED_WRAP = 1   PERMISSIONED_UNWRAP = 2\n\n" +
              "// policy.move:26 — witness-gated u32 bitmap; MAX_OPERATION_INDEX = 31\n" +
              "public struct Policy has drop, store {\n" +
              "    witness_type: TypeName,             // only the issuer can construct W\n" +
              "    permissioned_operations_bitmap: u32 }\n\n" +
              "set_policy&lt;T,W&gt;(ct, &amp;mut treasuryCap, ops)   // contra.move:936\n" +
              "// empty ops vector ⇒ permissionless again</code></pre>" +
              "<p>Confidential transfers between already-registered accounts stay permissionless under any " +
              "policy &mdash; only <code>register/wrap/unwrap</code> are gateable.</p>"
          }
        ]
      },

      /* ───────── 5. The Flows ───────── */
      {
        name: "The Flows — Wrap In, Transfer Hidden, Unwrap Out (and Why Transfers Can 'Soft-Fail')",
        formalDefinition:
          "<p>The public API is four verbs plus a state machine for transfers. " +
          "<code>wrap</code> (contra.move:502) deposits a public <code>Coin&lt;T&gt;</code> into the " +
          "receiver's <code>public_balance</code> (amount public; reserve → <code>Pool&lt;T&gt;</code>). " +
          "<code>unwrap</code> (contra.move:741) withdraws a public coin from the pool (amount public). " +
          "<code>merge</code> (contra.move:686) folds pending → active. A confidential " +
          "<strong>transfer</strong> is the only amount-hiding step and is modelled as a hot-potato enum " +
          "<code>TransferBatch&lt;T&gt;</code> (contra.move:164) that must be finalized in the same PTB.</p>" +
          "<p><strong>Optimistic failure.</strong> The SDK defaults <code>merge:true</code>, prepending a " +
          "<code>merge</code> to a spend. Because the spend proof is built against the observed balance, a " +
          "deposit arriving in the build&rarr;execute window makes the proof stale: the chain runs the " +
          "<code>merge</code> but the spend SOFT-FAILS (emits an event, no abort, funds intact). Retry with " +
          "<code>merge:false</code> succeeds.</p>",
        mathDetails: [
          {
            subtitle: "Transfer state machine (contra.move)",
            content:
              "<pre><code>" +
              "// contra.move:164 — no abilities ⇒ hot potato\n" +
              "public enum TransferBatch&lt;phantom T&gt; {\n" +
              "    BalanceProofFailed,\n" +
              "    Ok { sender, sender_pk, coins: vector&lt;EncryptedCoin&lt;T&gt;&gt;, sender_amounts },\n" +
              "}\n\n" +
              "batched_transfer(sender, auth, ct, deny_list,\n" +
              "    receiver_pks, receiver_amounts,\n" +
              "    well_formed_proofs,            // ONE aggregate Bulletproof over\n" +
              "                                   //   receiver_amounts ++ [new_balance]\n" +
              "    sender_amounts, consistency_proof, new_balance, balance_proof)\n" +
              "  → TransferBatch                                       (contra.move:543)\n" +
              "add_to_batch(batch, receiver, memo, deny_list) ×N       (contra.move:615)\n" +
              "finalize(batch) | try_finalize(batch): bool             (contra.move:676, 658)" +
              "</code></pre>" +
              "<p>The sender is debited inside <code>balance::try_split_batch</code> " +
              "(balance.move:188): it checks the sender total equals the sum of receiver commitments, " +
              "verifies the consistency + balance proofs, then peels one " +
              "<code>EncryptedCoin&lt;T&gt;</code> per receiver. Each <code>add_to_batch</code> credits a " +
              "receiver's <code>pending</code> (contra.move:648).</p>"
          },
          {
            subtitle: "Soft-fail events (watch these in the client)",
            content:
              "<pre><code>" +
              "// events.move:61-69\n" +
              "TryTransferFailedEvent     // try_finalize: balance proof failed\n" +
              "TryUnwrapFailedEvent       // try_unwrap:   balance proof failed\n" +
              "TrySetPublicKeyFailedEvent // optimistic re-key raced a deposit\n\n" +
              "// contra.move:770 — try_unwrap returns a ZERO coin instead of aborting\n" +
              "let (success, coin) = account.try_unwrap_internal(...);\n" +
              "if (!success) { events::emit_try_unwrap_failed(); };\n" +
              "coin   // zero-value if the proof failed</code></pre>" +
              "<p>The transaction SUCCEEDS in all soft-fail cases, so a wallet cannot rely on tx status " +
              "&mdash; it must subscribe to these events. Event type tags use the <code>events</code> " +
              "module segment, e.g. <code>&lt;pkg&gt;::events::TransferEvent&lt;T&gt;</code>.</p>"
          },
          {
            subtitle: "Privacy boundary (what wrap/unwrap leak)",
            content:
              "<p>Confidential transfers hide the amount but reveal <em>sender, receiver, timing</em>. " +
              "<code>wrap</code>/<code>unwrap</code> cross into/out of the public coin layer, so that single " +
              "operation's amount and counterparties are public &mdash; analogous to shielded-pool " +
              "entry/exit observability in Zcash. The <code>TransferEvent</code> (events.move:46) even " +
              "carries the amount twice (under sender and receiver keys); note its " +
              "<code>encrypted_amount_sender</code> is only verified as part of the batch total, not " +
              "individually range-checked &mdash; a documented sharp edge.</p>"
          }
        ]
      },

      /* ───────── 6. Compliance & Auditors ───────── */
      {
        name: "Compliance & Auditors — Selective Disclosure Built In",
        formalDefinition:
          "<p><code>contra</code> is private-by-default with issuer-controlled openability. Four mechanisms:</p>" +
          "<ul>" +
          "<li><strong>Per-account auditing.</strong> At register the user encrypts their viewing key to " +
          "the auditor key set and proves it correct with a <code>KeyConsistencyProof</code> + an " +
          "aggregate Bulletproof; the result is a <code>VerifiedKeyEncryption</code> stored on the account " +
          "(auditors.move:152). Auditors decrypt that one key and read all activity &mdash; never sign.</li>" +
          "<li><strong>Freeze / pause.</strong> Per-account and global, asymmetric authority.</li>" +
          "<li><strong>Seize.</strong> Direct balance overwrite by the issuer.</li>" +
          "<li><strong>Selective disclosure.</strong> A user reveals one value + a DDH proof matching the " +
          "on-chain ciphertext under their key, without exposing the secret.</li>" +
          "</ul>",
        mathDetails: [
          {
            subtitle: "Auditor key-consistency check",
            content:
              "<pre><code>" +
              "// auditors.move:36, 49\n" +
              "public struct Auditors has store {\n" +
              "    pks: vector&lt;Element&lt;G&gt;&gt;, version: u32, recommended_min_version: u32 }\n" +
              "public struct VerifiedKeyEncryption has copy,drop,store {\n" +
              "    ciphertext: vector&lt;MultiRecipientEncryption&gt;, version: u32 }\n\n" +
              "// auditors.move:152 — verify before storing\n" +
              "proof.verify_key_consistency(dst, sender_pk, auditors.pks(), &amp;ciphertext)\n" +
              "  &amp;&amp; rangeproofs::verify_bulletproofs_ristretto255(   // LIMB_BITS = 32\n" +
              "         &amp;range_proof, 32, &amp;limb_commitments, 0)</code></pre>" +
              "<p>The proof attests the 8&times;32-bit limbs of the 256-bit viewing key are each " +
              "ElGamal-encrypted to <em>every</em> auditor and sum to the user's <code>pk</code> " +
              "(nizk.move:138). Per-account (not per-transaction) auditing &mdash; one ciphertext at " +
              "register, not one per transfer.</p>"
          },
          {
            subtitle: "Issuer levers (asymmetric authority)",
            content:
              "<pre><code>" +
              "// contra.move\n" +
              "global_freeze(ct, ctx)        // any freeze admin → is_active = false   :898\n" +
              "global_unfreeze(ct, &amp;TreasuryCap)            // ISSUER only           :906\n" +
              "account_freeze(ct, account, ctx)             // admin freezes account  :913\n" +
              "account_unfreeze(&amp;TreasuryCap, account)      // ISSUER only           :924\n" +
              "set_balance_by_issuer(&amp;mut TreasuryCap, account, new_balance) // seize :862\n" +
              "update_auditors(ct, &amp;ManagementCap, pks, bump_recommended_min)        :953\n\n" +
              "// deny_list.move:12-25 — underlying coin DenyCapV2 (sender + receiver)\n" +
              "is_sender_denied / is_receiver_denied / is_frozen (global pause)</code></pre>" +
              "<p><code>set_balance_by_issuer</code> overwrites <code>active</code> and clears " +
              "<code>pending</code>/<code>public_balance</code>, setting <code>upper_bound = 1</code>; it " +
              "bypasses homomorphic accounting and can desync circulating supply vs the " +
              "<code>Pool&lt;T&gt;</code> reserve &mdash; the caller must restore consistency. " +
              "<code>recommended_min_version</code> is advisory: the chain does NOT reject stale-key " +
              "accounts (auditors.move:34-35).</p>"
          },
          {
            subtitle: "Selective disclosure & thesis critique",
            content:
              "<p>Independently of auditors, the SDK's <code>decryptWithProof</code> produces " +
              "<code>(value, proof)</code> for any ciphertext (a balance, or a " +
              "<code>TransferEvent</code> amount); a verifier checks " +
              "<code>ciphertext.verifyDecryption(pk, value, proof)</code> &mdash; a DDH proof under " +
              "Fiat&ndash;Shamir protocol-id 100. This is an attribute proof over an encrypted value, " +
              "exactly the primitive an anonymous-credential layer reuses.</p>" +
              "<p><strong>Critique to develop:</strong> per-account auditing is coarse (whole-history " +
              "visibility, no per-transfer or time scoping) and single-key (one compromised auditor key " +
              "deanonymizes every opted-in account). A thesis contribution could add threshold auditors " +
              "or credential-gated, per-transfer disclosure. See <code>AUDITORS.md</code> for the " +
              "per-account-vs-per-transaction design discussion.</p>"
          }
        ]
      }
    ]
  }
};
