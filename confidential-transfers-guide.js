/**
 * Confidential Transfers Study Guide — Hidden-Amount Token Transfers on Sui (`contra`)
 * Data file loaded by the study plan website.
 * Source of truth: MystenLabs/confidential-transfers @ 27c382f (devnet public beta, 2026-06).
 * All file:line citations resolve from move/sources/*.move in that repo.
 */

window.CONFIDENTIAL_GUIDE = {
  "block1": {
    "title": "Confidential Transfers on Sui — Hidden Amounts with On-Chain Verifiability (`contra`)",
    "connectionsSummary": "Confidential Transfers (Move package `contra`) is Mysten Labs' production attempt at the exact problem at the centre of your thesis: move value on a public ledger while hiding the amount, yet let the network still prove no money was created or overspent. It does this WITHOUT a SNARK — amounts are encrypted with Twisted ElGamal (additively homomorphic over Ristretto255) and correctness is enforced by Bulletproofs range proofs plus a handful of Schnorr/sigma proofs. That is the same toolbox (Pedersen commitments, Bulletproofs, Fiat-Shamir) you study in Ch 2.2, applied end-to-end inside Move. For the Mysten internship (Sep 2026 – Mar 2027) this is the canonical reference design to extend: it already ships the confidential-payment half, the per-account auditor (a built-in selective-disclosure / compliance hook), and an `Auth`/policy layer that is the natural seam to plug anonymous credentials into. Status to keep in mind: devnet public-beta, UNAUDITED, cryptography 'not finalized' — i.e. exactly the kind of system a thesis can critique and improve.",
    "concepts": [
      {
        "name": "Twisted ElGamal — Encrypting an Amount You Can Still Add Up",
        "analogy": "Think of each balance as a sealed box on a public shelf. Anyone can see the box and even stack two boxes together, but only the owner has the key to read the number inside. Twisted ElGamal is the lock. A balance/amount m is hidden as a pair: a ciphertext c = r·g + m·h and a decryption handle d = r·pk. Here g and h are two fixed 'pegs' on the Ristretto255 curve whose relationship nobody knows, r is fresh randomness, and pk = x·g is your public key. The magic is two-fold. (1) Homomorphic: stack two boxes (add the curve points componentwise) and you get a sealed box of the SUM — the chain can credit a deposit to your balance without ever decrypting either. (2) Only you decrypt: with your secret x you compute c − d/x = m·h, which strips the randomness and leaves m sitting 'in the exponent' of h. The catch — and the next concept — is that recovering m from m·h means solving a discrete log, which is only feasible for small m.",
        "diagram": "Encrypt amount m under pk = x·g, randomness r:\n\n      ciphertext        decryption handle\n   c = r·g + m·h           d = r·pk\n   └── hides m ──┘         └─ binds to your key ─┘\n\nHomomorphic add (deposit lands, chain never decrypts):\n   (c1,d1) + (c2,d2) = (c1+c2, d1+d2)  =  Enc(m1+m2)\n\nDecrypt (owner only, secret x):\n   c − d/x = (r·g + m·h) − r·(x·g)/x\n           = r·g + m·h − r·g\n           = m·h        →  solve m = log_h(m·h)\n\n   g = standard generator\n   h = hash_to_curve(\"fastcrypto-blinding-gen-01\")  (log_g h unknown)",
        "keyPoints": [
          "Group is Ristretto255 (sui::ristretto255 / group_ops); two generators g (standard) and h with unknown discrete-log relation — twisted_elgamal.move:11-53",
          "h is hardcoded: g_from_bytes(x\"34ce1477c14558178089500a39c864e0f607b3c1f41ab398400e4a9de6d2c446\") = hash_to_curve(\"fastcrypto-blinding-gen-01\") — twisted_elgamal.move:49",
          "Encryption: c = r·g + m·h (ciphertext), d = r·pk (decryption handle); 'message in the exponent' — twisted_elgamal.move:29-40",
          "Additively homomorphic: add()/sub()/add_assign() add the curve points componentwise → Enc(m1±m2) — twisted_elgamal.move:67-94",
          "Decrypt: c − d/x = m·h, then brute-force the discrete log m = log_h(m·h)",
          "The struct is just two curve points: Encryption { ciphertext, decryption_handle } — twisted_elgamal.move:29",
          "Twisted ElGamal vs textbook ElGamal: the message rides on the SECOND generator h (a Pedersen-style commitment), which is what makes range proofs over the same commitment composable"
        ],
        "connections": "This is the bridge between Ch 2.2 (Pedersen commitments + Bulletproofs) and a real ledger. c = r·g + m·h IS a Pedersen commitment to m with blinding r; the extra handle d = r·pk is what upgrades a commitment into a decryptable ciphertext for a specific owner. Your thesis can frame the whole system as 'commit-and-prove on an encrypted balance', and twisted ElGamal is why the same commitment can be both spent homomorphically and range-proved.",
        "thesisExample": "In the cryptographic-preliminaries chapter, present twisted ElGamal as the design choice that avoids a SNARK for the payment path: because Enc is additively homomorphic, a deposit is a free curve-point add and only SPENDING needs a proof. Contrast this with a Zcash-style note model (full SNARK per spend) and quantify the trade: cheaper/auditable here, but bounded amount range (next concept) and no full anonymity set.",
        "history": {
          "inventor": "Twisted ElGamal popularized by the Zether confidential-payment paper (Bünz, Agrawal, Zamani, Boneh); implemented for Sui by Mysten Labs in the `contra` package",
          "year": 2026,
          "context": "ElGamal (1985) encrypts in a cyclic group but is multiplicatively homomorphic and hard to range-prove. 'Twisted' ElGamal (Zether, 2019; also used by Solana's confidential transfers) puts the message on a second independent generator h, turning the ciphertext into a Pedersen commitment plus a key-bound handle — additively homomorphic AND directly range-provable with Bulletproofs. Mysten's confidential-transfers brought this to Sui's Move + Ristretto255 + on-chain Bulletproofs verifier in 2026, announced as a devnet public beta.",
          "funFact": "The blinding generator h is literally pinned in the contract as a 32-byte constant derived from the ASCII string \"fastcrypto-blinding-gen-01\" — so the whole scheme's hiding property rests on nobody ever finding log_g(h) of that one hashed string."
        },
        "limitations": [
          "Decryption is a discrete-log search → only small messages are recoverable (handled by the u16-limb trick, next concept)",
          "Hides amounts only — sender, receiver, and timing of every transfer stay fully public (no anonymity set)",
          "A trivial encryption of a known public value uses d = identity (encrypt_trivial, twisted_elgamal.move:128) — fine, but it means 'public-into-confidential' wraps are not hidden",
          "Security reduces to DDH on Ristretto255 + the hardcoded h being nothing-up-my-sleeve; a bad h (known log_g h) would silently break hiding/soundness"
        ],
        "exercises": [
          {
            "type": "hands-on",
            "question": "Open twisted_elgamal.move:35-94 and trace new(), add(), sub(): confirm that addition is just two g_add calls — the homomorphism is one line per component."
          },
          {
            "type": "concept",
            "question": "Write out by hand why c − d/x = m·h cancels the randomness. Where does the secret x have to be inverted, and why can't the chain do this decryption itself?"
          },
          {
            "type": "concept",
            "question": "c = r·g + m·h is also a Pedersen commitment. Which value is the 'message' and which is the 'blinding'? Why does that ordering matter for the range proof in concept 3?"
          }
        ]
      },
      {
        "name": "u16 Limbs & Bounded Aggregation — Keeping a u64 Decryptable",
        "analogy": "Decrypting needs a discrete-log search, which is only practical up to roughly 2^32. But balances are u64 (up to ~1.8e19) — far too big to brute-force directly. The fix is the same trick a child uses to read a big number: split it into digits. Instead of base-10 digits, `contra` uses four base-65536 digits (u16 'limbs'): amount = l0 + l1·2^16 + l2·2^32 + l3·2^48. Each limb is its own little sealed box, and each fits in [0, 2^16), so a precomputed baby-step/giant-step table cracks it in milliseconds. The subtlety: when you keep stacking encrypted deposits homomorphically, a limb that started below 2^16 grows. Stack k deposits and a limb can reach k·2^16. To stay under the 2^32 decryptable ceiling the contract counts how many values have been folded in (an `upper_bound`) and refuses new deposits once it hits ~2^16 — you must `merge` to reset. This is why incoming money piles up in a 'pending' box that you periodically sweep into your 'active' box.",
        "diagram": "u64 amount as four u16 limbs (each separately encrypted):\n\n  amount = l0 + l1·2^16 + l2·2^32 + l3·2^48\n           ┌──┐  ┌──┐    ┌──┐    ┌──┐\n  Enc:     │l0│  │l1│    │l2│    │l3│   ← 4 Twisted-ElGamal ciphertexts\n           └──┘  └──┘    └──┘    └──┘\n  each limb ∈ [0,2^16)  → BSGS table cracks log_h in ms\n\nBounded aggregation (why a 'pending' balance exists):\n\n  start: limb ≤ 2^16\n  fold k deposits homomorphically → limb ≤ k·2^16\n  cap k at 0xFFFF  ⇒  limb ≤ 0xFFFF·0xFFFF < 2^32  (still decryptable)\n\n  upper_bound counts folds; one slot reserved (0xFFFE)\n  too many deposits, no merge  →  abort EBalancesFull (code 10)\n  fix: merge() pending → active, resets the bound",
        "keyPoints": [
          "EncryptedAmount = four Encryption limbs l0..l3; value = l0 + 2^16·l1 + 2^32·l2 + 2^48·l3 — encrypted_amount.move:36-44",
          "Each limb encrypts a u16 so decryption stays a feasible discrete-log search (~2^32 ceiling per limb) — baby-step/giant-step over a precomputed table",
          "EncryptedBalance<T> = { amount: EncryptedAmount, upper_bound: u16 }; upper_bound counts how many u16-bounded values were folded in — balance.move:42-45",
          "max_upper_bound() = 0xFFFF keeps every limb < 2^32; has_deposit_slot reserves one slot so the live cap is 0xFFFE — balance.move:115-122, contra.move:977-981",
          "Exceeding the cap aborts EBalancesFull (code 10); recovery = merge() to reset the bound — contra.move:97, 686-693",
          "collapse() recombines the four limbs into one Encryption via collapse_limbs (l0 + 2^16 l1 + ...) — encrypted_amount.move:180, 241",
          "merge_public() folds a known public value, merge_encrypted() folds an encrypted coin, each bumps upper_bound by 1 — balance.move:144-161"
        ],
        "connections": "Limb decomposition is the systems-engineering reality behind 'just use Bulletproofs'. Your Ch 2.2 study treats a range proof as proving m ∈ [0, 2^n); here n = 16 PER LIMB, and four limbs reconstruct the u64. The bounded-aggregation cap is a beautiful example of a cryptographic invariant (limbs stay < 2^32) enforced by a plain integer counter — a pattern worth highlighting when your thesis argues about which invariants need ZK vs which can be cheap bookkeeping.",
        "thesisExample": "Use the limb cap as a concrete 'practicality' data point in your evaluation chapter: the decryption cost (BSGS table size) directly bounds how big a single limb may grow, which in turn bounds how many deposits an account can receive before a mandatory merge. That is a real UX/throughput constraint your design must either inherit or improve (e.g. larger limbs + bigger tables, or a different decryption strategy).",
        "history": {
          "inventor": "Limb-encoding for ElGamal-in-the-exponent is folklore in confidential-payment systems (Zether, Solana confidential transfers); contra uses four u16 limbs",
          "year": 2026,
          "context": "Because ElGamal-in-the-exponent decryption is a discrete log, every such system must bound the plaintext. Solana's confidential transfers split a u64 into a u16 'lo' + u48 'hi' with a discrete-log lookup; contra splits evenly into four u16 limbs and verifies each with the same per-limb Bulletproof, trading a few more limbs for a uniform proof structure.",
          "funFact": "The whole reason your encrypted balance has THREE sub-balances (active / pending-encrypted / pending-public) is this limb cap: deposits can't safely auto-add into the balance you're about to prove a statement about, so they queue in 'pending' until you sweep them."
        },
        "limitations": [
          "Hard cap of ~65534 un-merged deposits before EBalancesFull — a busy receiver must merge often",
          "Decryption is still O(table) work per limb; very large per-limb values (after heavy aggregation) approach the 2^32 BSGS limit",
          "Four limbs = four ciphertexts = four range-proof commitments per amount → proof size and verify cost scale with limbs",
          "The cap is enforced by a u16 counter, not by the proof — an issuer override (set_balance_by_issuer) sets upper_bound = 1 and can desync accounting if misused"
        ],
        "exercises": [
          {
            "type": "hands-on",
            "question": "In encrypted_amount.move:241-257 read collapse_limbs and confirm the 1, 2^16, 2^32, 2^48 weighting. Then in balance.move:115-122 explain why 0xFFFF·0xFFFF is the exact safety margin."
          },
          {
            "type": "concept",
            "question": "Why does an incoming transfer credit `pending` (contra.move:648) instead of `active`? Tie your answer to 'a spend proof commits to a snapshot of active'."
          },
          {
            "type": "hands-on",
            "question": "Find where EBalancesFull is raised (contra.move:521-522 and 637) and describe the two situations (wrap vs receive) that can hit the cap."
          }
        ]
      },
      {
        "name": "Range Proofs + Sigma NIZKs — Proving 'No Inflation, No Overdraft' Without Revealing Anything",
        "analogy": "Encryption hides the amounts; proofs stop people from cheating with hidden amounts. Two cheats matter: making a NEGATIVE amount (which would mint money via wrap-around in the curve's scalar field) and spending more than you have. `contra` blocks both with zero-knowledge proofs the chain checks before trusting any encrypted number. A WellFormedProof bundles (a) Bulletproofs — compact range proofs that every limb really is in [0, 2^16) so nobody sneaks in a giant/negative value, and (b) per-limb sigma proofs (Schnorr-style) that each ciphertext is a genuine encryption under the claimed key. Separately, when you spend, a Chaum–Pedersen DDH proof shows 'my new encrypted balance equals my old balance minus exactly the amount I'm sending' — a subtraction the verifier checks on ciphertexts it cannot read. All these proofs are made non-interactive with Fiat–Shamir (hash the transcript to get the challenge), using Blake2b256 so the TypeScript prover and the Move verifier compute the identical challenge.",
        "diagram": "What the chain checks on a spend (it never sees plaintexts):\n\n  WellFormedProof  =  Bulletproof(s)        +  ConsistencyProof / amount\n                      └ each limb ∈[0,2^16)    └ each limb is valid Enc under pk\n                        (no negative/inflation)   (Schnorr/ElGamal sigma)\n\n  Balance equality (DdhProof, Chaum–Pedersen):\n     prove   old_active − amount  ==  new_active     (on ciphertexts)\n     i.e. knows x with X = x·g AND X' = x·h  →  same plaintext re-encrypted\n\n  Fiat–Shamir:  challenge = Blake2b256( g,h, statement, commitments )\n     same hash in nizk.ts (prover) and nizk.move (verifier)  ⇒ proofs verify on-chain\n\n  Three sigma proof types (nizk.move):\n     DdhProof            balance equality / re-key\n     ElGamalProof        ciphertext well-formedness (per limb)\n     KeyConsistencyProof viewing-key encrypted correctly to auditors",
        "keyPoints": [
          "WellFormedProof = vector of Bulletproofs (chunked) + one ConsistencyProof (4 ElGamal sigma proofs) per amount — encrypted_amount.move:56-70",
          "Range check delegates to the framework: sui::rangeproofs::verify_bulletproofs_ristretto255, version 0 (Bünz et al. 2018), LIMB_BITS = 16 — encrypted_amount.move:19-29, 299",
          "One Bulletproof covers at most 8 amounts (32 limb commitments = native cap); batch_sizes() greedily chunks n amounts, e.g. n=20 → [8,8,4] — encrypted_amount.move:25-29, 311",
          "Three sigma proofs in nizk.move: DdhProof (Chaum–Pedersen DDH), ElGamalProof (encryption well-formedness), KeyConsistencyProof (auditor key encryption) — nizk.move:34-64",
          "Fiat–Shamir over Blake2b256; the bases g,h are bound into the challenge so the same proof type is reusable across contexts — nizk.move:90-133, repo CLAUDE.md note",
          "Domain separation tags: DST_DDH=0x01, DST_ELGAMAL=0x02, DST_KEY_CONSISTENCY=0x03; session_id (20-byte derived address) ‖ protocol_id — contra.move:107-111, 984-995",
          "Client builds proofs in WASM: @contra/bulletproofs-wasm wraps fastcrypto::bulletproofs, byte-compatible with the on-chain verifier (Merlin/STROBE transcript)",
          "into_well_formed() verifies then wraps an amount as WellFormedEncryptedAmount; aborts EWellFormedProofFailed on failure — encrypted_amount.move:132-153"
        ],
        "connections": "This concept is where Ch 2.2 (Bulletproofs inner-product argument) and Ch 2.5 (sigma protocols, Fiat–Shamir, soundness) meet a deployed verifier. Note the architectural choice: Bulletproofs for the RANGE statement (efficient for [0, 2^n)) but cheap bespoke sigma proofs for the LINEAR statements (equality, well-formedness, key consistency) — you don't pay SNARK costs for things a Schnorr proof handles. That 'right proof for the right relation' split is a strong thesis talking point.",
        "thesisExample": "In your proof-systems chapter, dissect the KeyConsistencyProof (nizk.move:58-64): it proves the 8 32-bit limbs of a 256-bit secret key are each correctly ElGamal-encrypted to every auditor key AND sum to the public key. That is a non-trivial AND-composition of DDH statements with a linear-combination check — a clean worked example of building a custom sigma protocol, which you can reproduce/benchmark against a generic SNARK to argue when hand-rolled sigmas win.",
        "history": {
          "inventor": "Bulletproofs (Bünz, Bootle, Boneh, Poelstra, Wuille, Maxwell, 2018); Chaum–Pedersen DDH proofs (1992); Fiat–Shamir (1986)",
          "year": 2018,
          "context": "Bulletproofs gave logarithmic-size range proofs with no trusted setup, making confidential transactions practical (used by Monero). Sui exposes a native Ristretto255 Bulletproofs verifier (sui::rangeproofs) ported from fastcrypto, so Move contracts verify client-built proofs cheaply. contra layers application-specific sigma proofs (DDH/ElGamal/key-consistency) on top for the linear relations Bulletproofs don't cover.",
          "funFact": "The TS prover and the Move verifier must hash IDENTICAL bytes or every proof fails — so the repo pins Blake2b256 for the sigma transcripts and Merlin/STROBE for Bulletproofs on BOTH sides; a single byte-ordering mismatch silently rejects all transactions."
        },
        "limitations": [
          "Bulletproofs verify time is linear in the aggregate; the 8-amount/proof cap forces chunking for large batches",
          "Range proofs prove [0, 2^16) per limb, not the full statement — soundness of 'no inflation' relies on the limb decomposition + collapse being correct, not on a single proof",
          "Sigma proofs are only as sound as the Fiat–Shamir transform (random-oracle model); a transcript-binding bug (missing field in the hash) can break soundness — the repo's own TODOs note unfinished DST separation",
          "Proofs are built client-side in WASM and assembled into large PTBs by hand (no high-level byte-array entry points yet) — a real integration burden"
        ],
        "exercises": [
          {
            "type": "hands-on",
            "question": "Read verify_well_formed_range_proofs (encrypted_amount.move:286-306). How are the 4 limb ciphertexts per amount laid out for verify_bulletproofs_ristretto255? Why 4·chunk commitments?"
          },
          {
            "type": "hands-on",
            "question": "In nizk.move:117-133 read verify_elgamal and write the two verification equations it checks. Identify the Schnorr response z1, z2 and the challenge c."
          },
          {
            "type": "concept",
            "question": "Why bind g and h into the Fiat–Shamir challenge (nizk.move:99-112) even though they're fixed constants? What attack does omitting them enable? (Hint: proof-reuse across relations.)"
          }
        ]
      },
      {
        "name": "Accounts, Balances & the Auth Model — Where the Hidden Money Lives",
        "analogy": "Picture a bank branch (one shared ConfidentialToken<T> per coin type) with a vault (Pool<T>) holding the real coins, and a wall of safe-deposit boxes. Each customer has ONE base Account (created once per address) and, inside it, a per-token drawer (TokenAccount<T>, stored as a dynamic field). Each drawer has three compartments: active (what you can spend), pending-encrypted (transfers others sent you, not yet swept), and pending-public (coins you wrapped in, not yet swept). To do anything you must present an Auth<T> — an unforgeable, single-use permission slip that says 'this operation is allowed for this owner'. There are exactly three ways to mint one: as the transaction sender (normal wallet), as an object that owns the account (e.g. a payment-channel smart contract proving custody by holding the object's UID), or with a witness that the token issuer's contract hands out after its own checks (the KYC/permissioned path). The whole design keeps deposits out of `active` so that a spend proof, which commits to a snapshot of `active`, can never be invalidated by money arriving mid-flight.",
        "diagram": "Object graph (all derived objects → no indexer needed):\n\n  TokenRegistry (shared)──derive──▶ ConfidentialToken<T> (shared)\n                                       ├─ is_active, freeze_admins\n                                       ├─ policy: Option<Policy>\n                                       ├─ auditors\n                                       └─derive─▶ Pool<T>  (holds real Coin<T>)\n\n  AccountRegistry (shared)─derive─▶ Account { owner }\n                                       └─ dynamic field TokenAccountKey<T> ▶\n                                          TokenAccount<T> {\n                                            pk,\n                                            active           (spendable)\n                                            pending          (encrypted deposits)\n                                            public_balance   (wrapped coins)\n                                            is_frozen, accepts_deposits\n                                          }\n\nAuth<T> — three constructors (policy.move / contra.move):\n  authorize_as_sender   → ctx.sender()           (wallet, permissionless)\n  authorize_as_object   → addr from &mut UID     (object owns account)\n  authorize_with_witness → owner under witness W  (issuer-gated / KYC)",
        "keyPoints": [
          "Singletons TokenRegistry + AccountRegistry shared at init; everything else is a derived object → deterministic addresses, no indexing — contra.move:117-121, 205-210",
          "ConfidentialToken<T> { is_active, freeze_admins, policy, auditors }; one per coin type — contra.move:127-133",
          "Pool<T> is a derived object of the token that custodies wrapped Coin<T> as a Sui address balance (low contention) — contra.move:140-142",
          "Account { id, owner } is key-only (no store); per-token state is a dynamic field TokenAccount<T> — contra.move:145-160",
          "TokenAccount holds THREE balances: active, pending (encrypted), public_balance (wrapped) plus pk, is_frozen, accepts_deposits — contra.move:151-160",
          "Auth<T> is drop-only and phantom-typed so it can't be stored or reused across tokens — policy.move:35-39",
          "Three Auth constructors: authorize_as_sender / authorize_as_object / authorize_with_witness — contra.move:216-237",
          "Policy is a u32 bitmap of permissioned operations gated by a witness TypeName; default is permissionless (Option::none) — policy.move:26-70"
        ],
        "connections": "The Auth/Policy layer is the single most thesis-relevant seam in the whole codebase: it is the generic hook where an anonymous-credential check could authorize an operation. Today `authorize_with_witness` lets an issuer's contract gate register/wrap/unwrap behind ANY logic (KYC list, allowlist, rate limit). Your thesis could replace that 'issuer checks a list' with 'a ZK credential proof authorizes the witness' — confidential amounts (this system) + anonymous authorization (your contribution) = private payments with private identity.",
        "thesisExample": "In your architecture chapter, draw exactly this object graph and mark the trust/authorization boundary at Auth<T>. Then show your extension: a Move module that verifies a Groth16 credential proof (à la zkLogin) and, on success, mints an Auth<T> via authorize_with_witness. Cite contra.move:223-230 as the integration point and argue why the phantom-T, drop-only Auth is a safe capability to gate this way.",
        "history": {
          "inventor": "Object-capability + witness patterns are idiomatic Sui Move (Mysten Labs); the three-balance split is contra-specific",
          "year": 2026,
          "context": "Sui's object model lets state live in derived objects with deterministic addresses, so wallets/RPC find a TokenAccount without an indexer. contra leans on this plus dynamic fields (one drawer per token) and the witness pattern (a type only the issuer can construct) to build a permission system entirely from Move's type system — no access-control lists on-chain.",
          "funFact": "Anyone can create an Account for any address (new_account doesn't check the sender) — it's safe because every actual operation re-checks owner == authenticated sender, and the only way to dispose of an Account is to share it. The capability, not the object, carries the authority."
        },
        "limitations": [
          "The client SDK (ContraClient) only builds the permissionless flows; issuer-defined permissioned wrappers must be assembled by hand",
          "Three balances + manual merge is real UX complexity exposed to wallets",
          "Auth<T> is per-PTB and per-token; cross-token or long-lived authorization needs re-minting each transaction",
          "Account state in dynamic fields means generic explorers may not render confidential balances without contra-specific decoding"
        ],
        "exercises": [
          {
            "type": "hands-on",
            "question": "Read the three Auth constructors (contra.move:216, 235, 223) and policy.move:77-106. What exactly distinguishes is_allowed (operation bitmap) from is_authenticated (owner)?"
          },
          {
            "type": "concept",
            "question": "Why are deposits credited to `pending` and swept by merge() rather than added to `active` directly? Connect to 'a spend proof commits to a snapshot' from concept 2."
          },
          {
            "type": "hands-on",
            "question": "Study apps/payment-channel: how does a Channel<T> shared object authorize spending its own confidential Account via authorize_as_object? This is the canonical as_object() reference."
          }
        ]
      },
      {
        "name": "The Flows — Wrap In, Transfer Hidden, Unwrap Out (and Why Transfers Can 'Soft-Fail')",
        "analogy": "Living a confidential life with this token is a four-verb loop. WRAP: hand the vault a public Coin<T> and get private credit — the amount is VISIBLE (you're crossing the public/private border). TRANSFER: send an encrypted amount account-to-account — the amount is HIDDEN; this is the only step that keeps privacy. UNWRAP: withdraw private credit back to a public Coin<T> — amount VISIBLE again. MERGE: sweep your pending boxes into active so you can spend them. A transfer is a little state machine: batched_transfer debits the sender and produces one sealed coin per receiver, then you call add once per receiver, then finalize. The clever part is failure handling. The SDK builds your spend proof against the balance it SAW; if a deposit lands between 'SDK builds proof' and 'chain runs it', the proof is stale. Rather than abort (and burn gas / scare the user), the chain runs the prepended merge successfully and then SOFT-FAILS the spend: it emits a TryTransferFailedEvent and leaves your funds untouched. You just retry with merge:false and it goes through. So 'my transfer silently did nothing' is usually this race, not a bug.",
        "diagram": "The four verbs and the privacy border (║ = amount revealed):\n\n   public Coin<T> ──wrap──║──▶ pending-public ──merge──▶ active\n                                                            │\n   active ──transfer (HIDDEN)──▶ receiver.pending-encrypted │\n                                                            │\n   active ──unwrap──║──▶ public Coin<T>   (from Pool<T>)    │\n\nTransfer as a state machine (contra.move):\n   batched_transfer(...) ─▶ TransferBatch::Ok | ::BalanceProofFailed\n        │  (Ok carries one EncryptedCoin per receiver)\n        ├─ add_to_batch(receiver)  ×N   (credits each receiver.pending)\n        └─ finalize()  /  try_finalize()\n\nMerge-then-spend race (default merge:true):\n   SDK reads balance ──build proof──▶ submit\n                          ▲ deposit arrives here = proof now stale\n   chain: merge OK  →  spend proof fails  →  emit TryTransferFailedEvent\n          funds safe; retry with merge:false  →  succeeds",
        "keyPoints": [
          "wrap(): public Coin<T> → pending-public; amount is public; reserve goes to Pool<T> — contra.move:502-529",
          "batched_transfer() → TransferBatch enum (Ok{coins,...} | BalanceProofFailed); one aggregate Bulletproof over receiver_amounts ++ [new_balance] — contra.move:543-608",
          "add_to_batch() once per receiver, in order, credits receiver.pending-encrypted; finalize()/try_finalize() closes it — contra.move:615-678",
          "unwrap() → Coin<T> paid from Pool<T>; amount public; try_unwrap() is the non-aborting variant — contra.move:741-797",
          "merge() folds pending-encrypted + pending-public into active and resets the growth bound — contra.move:686-693",
          "Privacy boundary: only confidential transfers hide the amount; wrap/unwrap reveal it (they touch the public coin layer) — top-level README 'Privacy boundary'",
          "Soft-fail: try_finalize / try_unwrap emit TryTransferFailedEvent / TryUnwrapFailedEvent instead of aborting; the TX SUCCEEDS, so clients must watch events — contra.move:658-672, 770-797, events.move:61-69",
          "Fix for the merge-then-spend race: retry with merge:false (pending already folded by the first tx's merge) — top-level README"
        ],
        "connections": "These flows are the empirical surface your evaluation chapter measures: gas per wrap/transfer/unwrap, proof-build latency in WASM, and the failure-rate of optimistic merge under concurrent deposits. The wrap/unwrap 'border reveal' is also the key privacy caveat to state plainly — it mirrors the 'shielded pool entry/exit is observable' problem in Zcash, and is exactly where mixing/anonymity-set ideas from Ch 2.4 would extend the design.",
        "thesisExample": "Build a small experiment for the evaluation chapter: drive concurrent deposits while a sender submits transfers and measure how often the optimistic merge soft-fails (TryTransferFailedEvent). Report it as a real-world reliability metric and propose a mitigation (e.g. proofs that bind to active only, or a deposit-epoch). Cite contra.move:658-672 and the README race description.",
        "history": {
          "inventor": "Mysten Labs (contra); the wrap/unwrap 'shielded pool' shape mirrors Zcash/Zether confidential-balance designs",
          "year": 2026,
          "context": "Confidential-balance systems universally face the 'rollover' problem: a balance you're spending must not change underneath your proof. Zether used epochs; contra uses a pending/active split plus an optimistic 'merge-then-spend' that fails soft. The four-verb wrap/transfer/unwrap/merge loop is contra's public API surface, exercised by the kaisho demo wallet.",
          "funFact": "The transfer is modelled as a Move enum with no abilities (a 'hot potato') — TransferBatch must be consumed by finalize in the same transaction or the whole PTB aborts, which is how the contract guarantees every produced receiver-coin is actually credited."
        },
        "limitations": [
          "wrap/unwrap leak the amount and counterparty of that operation — privacy is only intra-domain",
          "Optimistic merge can soft-fail under concurrent deposits, requiring a retry (extra latency, client must handle the event)",
          "Each receiver in a batch must be added in order and the batch finalized in the same PTB (hot-potato) — fiddly to assemble by hand",
          "No high-level entry points: flows are large hand-built PTBs constructing every proof/ciphertext input"
        ],
        "exercises": [
          {
            "type": "hands-on",
            "question": "Trace batched_transfer → add_to_batch → finalize (contra.move:543-678). Where is the sender debited, where is each receiver credited, and what happens to the batch if the balance proof failed?"
          },
          {
            "type": "concept",
            "question": "Explain why try_unwrap returns a ZERO coin + event on failure instead of aborting (contra.move:770-797). What does this buy the wallet UX, and what must the client now do?"
          },
          {
            "type": "hands-on",
            "question": "Run the kaisho demo (kaisho-wallet.vercel.app) end to end: register → wrap → transfer → unwrap. Note which amounts appear in the explorer and which don't."
          }
        ]
      },
      {
        "name": "Compliance & Auditors — Selective Disclosure Built In",
        "analogy": "A pure privacy coin is a regulatory non-starter; contra ships the escape valves an issuer needs, without breaking the default of privacy. Think of it as 'private by default, with named keyholders'. AUDITORS: at registration a user encrypts their OWN viewing key to the issuer's set of auditor public keys (proving they did so correctly). From then on an auditor can decrypt that one key and READ everything that account does — but can never MOVE funds. Crucially this is PER-ACCOUNT, not per-transaction: you pay the auditor-visibility cost once, not on every transfer. FREEZE/SEIZE: the issuer (via TreasuryCap) and designated freeze-admins (via ManagementCap) can freeze accounts, pause the whole token, or even overwrite a balance to seize/burn — the levers a court order or fraud case demands. SELECTIVE DISCLOSURE: independently, any user can voluntarily reveal one value (a balance, or one transfer's amount) plus a proof that it matches the on-chain ciphertext under their key — convincing an auditor of a single fact without handing over their secret. PERMISSIONED MODE: the issuer can gate register/wrap/unwrap behind their own contract (KYC, screening) while user-to-user transfers stay permissionless.",
        "diagram": "Per-account auditing (pay once at register, not per transfer):\n\n  user secret key x ──encrypt to auditor pks──▶ VerifiedKeyEncryption\n        (KeyConsistencyProof: 8×32-bit limbs, each Enc'd to every auditor,\n         and the limbs sum to pk)  — auditors.move / nizk.move\n        stored on the TokenAccount; auditor decrypts x ⇒ reads all activity\n        (read-only: auditors never sign protocol txs)\n\nIssuer compliance levers:\n   deny list (DenyCapV2)      block send/recv/wrap/unwrap (sender+receiver)\n   account_freeze / global    admins freeze; only TreasuryCap unfreezes\n   set_balance_by_issuer      overwrite a balance (seize / burn / reset)\n   set_policy<T,W>            gate register/wrap/unwrap behind witness W\n\nSelective disclosure (user-initiated, no auditor needed):\n   reveal value v + DDH proof  ⇒  verifier checks v matches ciphertext\n   under pk, WITHOUT learning x   (protocol-id 100 in the SDK)",
        "keyPoints": [
          "Per-account auditing: user encrypts their viewing key to all auditor pks at register; KeyConsistencyProof proves it correct — auditors.move:49-186, nizk.move:138",
          "Auditors are passive readers (decrypt the user key, read state/events); they NEVER sign or move funds — top-level README 'For Auditors'",
          "update_auditors() rotates the set and bumps a version; recommended_min_version is ADVISORY (not enforced on-chain) — contra.move:953-965, auditors.move:34-35",
          "Per-account freeze (admins via ManagementCap) vs global pause (is_active); only TreasuryCap unfreezes — contra.move:898-928",
          "Deny-list integration uses the underlying coin's DenyCapV2 (sender + receiver, next-epoch) — deny_list.move:12-25",
          "set_balance_by_issuer overwrites active + clears pending/public (seize/burn); can desync supply↔pool, caller's responsibility — contra.move:862-873",
          "Permissioned mode: set_policy<T,W> gates register/wrap/unwrap behind a witness; user↔user transfers stay permissionless — contra.move:936-943, README 'Permissioned'",
          "Selective disclosure: SDK decryptWithProof + on-chain verifyDecryption; reveal one value with a DDH proof, secret key stays hidden — repo CLAUDE.md, protocol-id 100"
        ],
        "connections": "This is the compliance-preserving-privacy pillar from your thesis principles, already prototyped. The per-account auditor is a concrete 'designated opening' mechanism — compare it in your related-work chapter to viewing keys (Zcash), auditable decryption (PGC/Solana), and threshold auditors. The selective-disclosure path is literally an attribute proof over an encrypted value: the same machinery your anonymous-credential design needs for 'prove age > 18 without revealing birthdate', here specialized to 'prove balance = v'.",
        "thesisExample": "Dedicate a related-work subsection to contra's auditor design and critique it: per-account auditing is cheap but COARSE (an auditor who can read one account reads ALL its history, with no scoping to a time window or a single transfer). Propose a finer-grained alternative — e.g. per-transfer auditor ciphertext gated by a credential, or threshold auditors so no single party can deanonymize — and position it as a thesis contribution. Cite auditors.move and the AUDITORS.md per-account-vs-per-transaction discussion.",
        "history": {
          "inventor": "Auditable confidential payments line: PGC (Chen, Ma, Tang, Au), Zether auditability, Solana confidential transfers auditor keys; contra's per-account variant by Mysten Labs",
          "year": 2026,
          "context": "Regulators require some openability, so confidential-payment research added 'auditors' / 'viewing keys' that decrypt without spending. Most designs attach an auditor-readable ciphertext to EVERY transaction (per-transaction auditing). contra instead encrypts the user's viewing key once to the auditor set (per-account auditing), trading finer scoping for far lower per-transfer cost — documented in the repo's AUDITORS.md.",
          "funFact": "An account registered while the token had NO auditors carries an empty VerifiedKeyEncryption — so enabling auditors later doesn't retroactively open old accounts unless they rotate keys, a subtle and thesis-worthy privacy/compliance corner case."
        },
        "limitations": [
          "Per-account auditing is coarse: an auditor sees the account's ENTIRE history, not a single scoped transfer or time window",
          "recommended_min_version is advisory — the chain does NOT reject stale-auditor-key accounts; wallets must enforce rotation",
          "set_balance_by_issuer bypasses the homomorphic accounting and can desync total supply vs the pool reserve if misused",
          "Trust in auditors is all-or-nothing (single key per auditor); no built-in threshold so one compromised auditor key deanonymizes every opted-in account",
          "Whole system is UNAUDITED devnet beta — compliance guarantees are not yet production-grade"
        ],
        "exercises": [
          {
            "type": "hands-on",
            "question": "Read verify_key_encryption (auditors.move:152-186): which two proofs are checked (sigma + Bulletproof) before a VerifiedKeyEncryption is stored, and what does each guarantee?"
          },
          {
            "type": "concept",
            "question": "Contrast per-account vs per-transaction auditing (AUDITORS.md). State one privacy advantage and one cost advantage of contra's choice, then propose where a thesis could improve scoping."
          },
          {
            "type": "hands-on",
            "question": "Find set_balance_by_issuer (contra.move:862-873). List the three balances it touches and explain the supply-consistency warning. When is this lever legitimate vs dangerous?"
          }
        ]
      }
    ]
  }
};
