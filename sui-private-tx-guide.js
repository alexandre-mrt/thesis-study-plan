/**
 * Private Transactions on Sui — Study Guide (landscape + thesis synthesis)
 * The map of confidentiality on Sui: what leaks by default, the four privacy layers
 * (amount / data / compute / identity), and how they compose into private payments.
 * contra file:line citations resolve from MystenLabs/confidential-transfers @ 27c382f.
 */

window.SUIPRIVATETX_GUIDE = {
  "block1": {
    "title": "Private Transactions on Sui — The Landscape and the Thesis Design Space",
    "connectionsSummary": "Everything you ship for the thesis lives on a chain that is, by default, radically transparent: Sui's object model puts every balance, every transfer, and every contract call in the clear. 'Private transactions on Sui' is therefore not one feature but a STACK of partial solutions, each hiding a different facet: Confidential Transfers (`contra`) hide AMOUNTS, Seal hides DATA, Nautilus (TEE) hides COMPUTE, and zkLogin hides the link to your WEB2 IDENTITY — but none of them gives sender/receiver unlinkability (an anonymity set). That missing piece — anonymous authorization over confidential value — is exactly the gap your thesis fills with anonymous credentials. This part is the synthesis chapter: it gives you the threat model to state precisely WHAT is public, a map of the four privacy layers and what each does/doesn't hide, and the concrete architecture for composing them into a private low-value payment system on Sui. Treat it as the spine of your background + design chapters.",
    "concepts": [
      {
        "name": "What's Public by Default on Sui — The Privacy Threat Model",
        "analogy": "Sui is a glass building. Every account is a glass room; every object (a coin, an NFT, a position) sits on a labelled shelf with its type, owner, and contents visible to anyone walking past with a block explorer. When you transact, you don't whisper — you rearrange the shelves in full view: which coins moved, how much, from whom, to whom, calling which function, are all recorded as plaintext in the transaction and its effects. There is no shielded pool, no default mixing, no encrypted mempool. So before you can claim ANY privacy property, you must name exactly which pane of glass you are frosting. Four things leak independently: the AMOUNT of a transfer, the DATA a contract stores, the LOGIC/inputs of a computation, and the IDENTITY behind an address (plus the GRAPH linking addresses over time). A privacy design is only as strong as the leakiest pane you forgot to cover.",
        "diagram": "Sui by default — what a block explorer sees:\n\n   Tx { sender: 0xA, gas, ... }\n     ├─ MoveCall  pkg::module::function   ◀ logic VISIBLE\n     ├─ inputs    objects + pure args     ◀ inputs VISIBLE\n     └─ effects\n          ├─ balanceChanges  0xA −10, 0xB +10   ◀ AMOUNT + GRAPH visible\n          ├─ created/mutated/deleted objects     ◀ STATE visible\n          └─ events                              ◀ payloads visible\n\n   Four independent leaks to close:\n     [1] AMOUNT     how much moved        → Confidential Transfers (contra)\n     [2] DATA       what a contract holds → Seal (encrypt) / off-chain\n     [3] COMPUTE    inputs + logic run    → Nautilus (TEE) / ZK\n     [4] IDENTITY   who is behind 0xA     → zkLogin (web2 link) / creds (gap)\n   + GRAPH/timing leaks even when amounts are hidden (no anonymity set)",
        "keyPoints": [
          "Sui's object model is fully transparent: object type, owner, version, and contents are public; transactions expose sender, MoveCall target, inputs, and effects (balanceChanges, created/mutated objects, events)",
          "There is NO native shielded pool, encrypted mempool, or default mixing on Sui — privacy is opt-in, per-facet, and application-level",
          "Validators see transaction contents during execution; privacy schemes hide data from the CHAIN STATE / public, not necessarily from a validator running TEE-less code",
          "Four orthogonal leaks: amount, stored data, computation inputs/logic, and identity/transaction-graph — each needs a different tool",
          "Even with amounts hidden, sender + receiver + timing of a confidential transfer stay public (the anonymity-set / unlinkability gap)",
          "Gas is always paid by a visible address (unless sponsored) — gas payment itself is a deanonymization vector"
        ],
        "connections": "This is the threat-model section your thesis MUST open with. Reviewers (Ford, Troncoso, Vaudenay) will judge the work by whether you state the adversary and the exact leak each mechanism closes. Naming the four panes (amount/data/compute/identity) + the graph leak gives you a checklist to evaluate every design against, and prevents the classic mistake of claiming 'private' when only the amount is hidden.",
        "thesisExample": "Write a single threat-model table: rows = {amount, stored data, computation, identity, transaction graph/timing}, columns = {visible by default?, which Sui tool hides it?, residual leak?}. Fill it from this part. That table becomes Figure 1 of your background chapter and the rubric for your evaluation.",
        "history": {
          "inventor": "Sui object model by Mysten Labs (transparency is a deliberate design choice for parallel execution + verifiability)",
          "year": 2023,
          "context": "Sui's owned/shared object model and Mysticeti consensus optimize for parallelism and cheap verifiability, which favours transparent state. Like Ethereum, privacy was not a base-layer goal; it is layered on top via cryptography (ZK, threshold encryption), hardware (TEE), and protocol design. Confidential Transfers (2026 devnet beta) was Mysten's first first-party amount-privacy primitive.",
          "funFact": "On a transparent chain, hiding the amount can paradoxically make you MORE identifiable if you're the only one using the confidential token — privacy needs a crowd, which is why the anonymity-set gap matters as much as the encryption."
        },
        "limitations": [
          "Per-facet privacy means a single uncovered leak (e.g. a public gas payer, or a unique transfer timing) can unravel the rest",
          "Transaction graph analysis works even against hidden amounts — wrap/unwrap events and timing correlate addresses",
          "Validator-side visibility during execution limits what 'on-chain privacy' can mean without TEE or pure ZK",
          "No base-layer anonymity set means k-anonymity must be engineered by the application"
        ],
        "exercises": [
          {
            "type": "concept",
            "question": "List, for a single ordinary Sui coin transfer, every field a block explorer can read. Then mark which of the four leak categories each field falls under."
          },
          {
            "type": "concept",
            "question": "Argue why hiding the amount alone does NOT give payment privacy. Construct a deanonymization attack using only senders, receivers, and timestamps of confidential transfers."
          },
          {
            "type": "design",
            "question": "Draft your thesis threat model: who is the adversary (passive chain observer? validator? auditor?), and which of the four panes must your design frost to meet your privacy goal for low-value payments?"
          }
        ]
      },
      {
        "name": "The Sui Privacy Stack — Four Layers of Confidentiality",
        "analogy": "Think of privacy on Sui as four independent tinting films you can apply to the glass building, each made by a different supplier and each tinting a different window. AMOUNT film = Confidential Transfers (`contra`): encrypts balances/transfer amounts with twisted ElGamal + Bulletproofs. DATA film = Seal: encrypts arbitrary blobs so only those who satisfy an on-chain access policy (`seal_approve`) can decrypt, with the keys split threshold-style across key servers. COMPUTE film = Nautilus: runs your logic inside an AWS Nitro TEE and lets a Move contract verify a hardware attestation, so the inputs and intermediate state stay sealed while the OUTPUT is trustworthy. IDENTITY film = zkLogin: lets a user authenticate with a web2 account (Google, etc.) and act on-chain without publishing the link between their real identity and their address, via a Groth16 proof. They're composable — you can stack films — but each has a distinct trust assumption (math vs threshold vs hardware vs OAuth provider), and choosing the right film per window is a core thesis decision.",
        "diagram": "Four privacy layers, four trust roots, four hidden facets:\n\n  LAYER        HIDES            PRIMITIVE              TRUST ROOT\n  ─────────────────────────────────────────────────────────────\n  Amount       balances/amts    Confidential Transfers DDH + DL(h)\n               (contra)         twisted ElGamal+BPs    (pure crypto)\n  Data         stored blobs     Seal (IBE threshold)   t-of-n key\n               + access ctrl     seal_approve policy     servers\n  Compute      inputs + logic   Nautilus (AWS Nitro)   AWS CA +\n               (output signed)  attestation in Move     silicon\n  Identity     web2↔address     zkLogin (Groth16 BN254) OAuth issuer\n               link             ephemeral key + salt   + prover\n\n  Composable:  zkLogin user ── confidential transfer ── of value\n               whose KEY is stored via Seal, issued by a\n               credential minted inside a Nautilus TEE.",
        "keyPoints": [
          "Amount layer = Confidential Transfers / `contra`: twisted ElGamal over Ristretto255 + Bulletproofs; hides balances & transfer amounts, NOT sender/receiver (devnet beta, UNAUDITED) — see the dedicated Ch 2.2 chapter",
          "Data layer = Seal: identity-based threshold encryption; data encrypted to an on-chain policy, decryptable only if a Move `seal_approve` check passes; keys held t-of-n by key servers (trust = threshold of servers)",
          "Compute layer = Nautilus: AWS Nitro Enclave runs logic, signs outputs with an attested ephemeral key, Move verifies the Nitro attestation (trust = AWS CA + silicon) — see the Nautilus chapter",
          "Identity layer = zkLogin: Groth16 (BN254) proof binds an OAuth JWT to an ephemeral key; on-chain address = hash over (salt, iss, aud, sub) so the web2↔address link stays private (trust = OAuth issuer + prover + salt secrecy)",
          "Different trust models: pure crypto (amounts) > threshold (data) > hardware (compute) > federated OAuth (identity) — your thesis should rank these for its threat model",
          "The layers compose but each adds its own residual leak and failure mode; privacy is the MIN over all layers used, not the max"
        ],
        "connections": "This four-layer map is the organizing frame for your entire background section, and each layer already has its own deep chapter in this study plan (Confidential Transfers in Ch 2.2, Seal/Nautilus in Ch 2.3, zkLogin in Ch 2.6/crypto). Your contribution sits at the seam between AMOUNT (contra) and IDENTITY (anonymous credentials): you add unlinkable authorization on top of confidential value, the one combination none of the four layers delivers alone.",
        "thesisExample": "Use this as your related-work taxonomy. For each layer, write one paragraph: what it hides, its trust assumption, its residual leak, and whether your design uses or extends it. Conclude with the gap statement: 'no existing Sui primitive provides anonymous authorization over confidential amounts; this thesis composes contra's amount-hiding with credential-based anonymous authorization to close it.'",
        "history": {
          "inventor": "Mysten Labs (Seal, Nautilus, zkLogin, Confidential Transfers) — a coordinated 2023–2026 privacy/identity product line",
          "year": 2026,
          "context": "Sui shipped zkLogin first (2023, web2 onboarding), then Seal (threshold secrets / encrypted storage), Nautilus (TEE-verified off-chain compute), and Confidential Transfers (2026, amount privacy). Together they form a deliberate 'privacy toolbox' rather than a single shielded protocol — reflecting Sui's bet that composable, auditable, opt-in primitives beat a monolithic privacy chain.",
          "funFact": "These four were built by overlapping teams and reuse each other: the Confidential Transfers demo wallet explicitly plans to move secret-key storage from browser localStorage to Seal — a real in-the-wild composition of two of the four layers."
        },
        "limitations": [
          "No single layer gives full transaction privacy; you must combine and the combination inherits every trust assumption",
          "Trust roots are heterogeneous — a thesis must justify each (e.g. is depending on AWS acceptable for your model?)",
          "Seal and Nautilus add off-chain infrastructure (key servers, enclaves) the user/issuer must run or trust",
          "zkLogin reveals nothing about identity on-chain but the OAuth provider + salt service can still link if compromised"
        ],
        "exercises": [
          {
            "type": "concept",
            "question": "For each of the four layers, write its trust assumption in one sentence and the single event that would break it (e.g. 'Seal breaks if t key servers collude')."
          },
          {
            "type": "concept",
            "question": "The contra demo plans to store viewing keys in Seal. Which two layers compose here, and what new combined trust assumption results?"
          },
          {
            "type": "design",
            "question": "Pick the minimal subset of layers your low-value private payment system actually needs. Justify each inclusion and each exclusion against your threat model."
          }
        ]
      },
      {
        "name": "Amount Privacy — Confidential Transfers (`contra`) in One Page",
        "analogy": "This is the AMOUNT film, and it is the part of the stack closest to your thesis core, so here is the one-page version (the full deep dive is the Confidential Transfers chapter in Ch 2.2). You take an ordinary Sui `Coin<T>` and WRAP it into a confidential balance: the coin's value goes into a shared pool, and you get encrypted credit. Inside the confidential domain you can TRANSFER to others with the amount hidden (twisted ElGamal ciphertexts, proven correct by Bulletproofs range proofs + Schnorr-style equality proofs, so nobody inflates or overspends). To exit, you UNWRAP back to a public coin. The catch, repeated because it matters for composition: wrap and unwrap REVEAL the amount (they touch the public coin layer), and even private transfers reveal sender, receiver, and timing. So contra is precisely an amount-confidentiality layer — and the natural substrate your anonymous-credential work sits on top of, via its `Auth`/policy hook.",
        "diagram": "contra in one page (║ = amount revealed at the border):\n\n   public Coin<T> ──wrap──║──▶ confidential balance ──transfer(HIDDEN)──▶\n                                          │                    receiver\n                                          └──unwrap──║──▶ public Coin<T>\n\n   Hidden:   transfer AMOUNTS, balances\n   Public:   sender, receiver, timing, wrap/unwrap amounts\n\n   Crypto:   twisted ElGamal (c=r·g+m·h, d=r·pk) + 4×u16 limbs\n             Bulletproofs range + DDH/ElGamal sigma proofs\n   Hook:     Auth<T> + Policy gate register/wrap/unwrap  ◀ thesis seam\n   Compliance: per-account auditor, freeze, seize, selective disclosure\n\n   Status: devnet public beta, UNAUDITED. pkg 0xe0f1b22e…0c271",
        "keyPoints": [
          "Wrap (public→confidential) and unwrap (confidential→public) reveal the amount; only intra-domain transfers hide it — top-level README 'Privacy boundary'",
          "Amounts are four u16 twisted-ElGamal limbs; correctness via Bulletproofs (sui::rangeproofs) + sigma NIZKs (nizk.move) — see Ch 2.2 deep chapter",
          "Authorization is an Auth<T> minted via authorize_as_sender / authorize_as_object / authorize_with_witness (contra.move:216-237) — the witness path is the credential-integration seam",
          "Built-in compliance: per-account auditors (selective visibility), freeze/seize levers, and user-initiated selective disclosure — already a partial identity/compliance story",
          "It is an AMOUNT layer only: it gives zero sender/receiver unlinkability — the anonymity-set gap is unaddressed by contra",
          "UNAUDITED devnet beta — usable as a research substrate, not production"
        ],
        "connections": "contra is the substrate your thesis extends. Its `authorize_with_witness` lets an issuer's contract mint authorization after arbitrary checks — replace 'issuer checks a KYC list' with 'a ZK credential proof authorizes the witness' and you have anonymous authorization over confidential amounts. The per-account auditor is also your concrete baseline for the compliance-preserving-privacy comparison.",
        "thesisExample": "In your design chapter, present contra as the chosen amount-privacy layer and your credential module as the authorization layer above it. Show the exact call: your Move module verifies a Groth16 credential proof and, on success, calls authorize_with_witness (contra.move:223) to mint an Auth<T> for register/wrap/unwrap — composing private identity with private value.",
        "history": {
          "inventor": "Mysten Labs; twisted-ElGamal lineage from Zether (Bünz et al. 2019) and Solana confidential transfers",
          "year": 2026,
          "context": "After zkLogin/Seal/Nautilus, Confidential Transfers added the missing amount-privacy primitive in 2026 as a standalone Move package (`contra`), explicitly designed to wrap existing `Coin<T>` standards and to ship with compliance hooks (auditors, freeze/seize) so it is regulator-compatible by default.",
          "funFact": "contra deliberately uses Bulletproofs + sigma proofs instead of a SNARK precisely so the payment path needs no trusted setup and deposits are free homomorphic adds — a different point in the design space from Zcash-style note systems."
        },
        "limitations": [
          "No anonymity set: hides amounts, not the who/when of transfers",
          "Wrap/unwrap leak the boundary amount and counterparties",
          "UNAUDITED, crypto 'not finalized', devnet only",
          "Decryption/aggregation limits (u16 limbs, merge cap) impose UX constraints on heavy receivers"
        ],
        "exercises": [
          {
            "type": "concept",
            "question": "State precisely what contra hides and what it leaks. Why is it accurate to call it an 'amount-confidentiality layer' rather than a 'private payments system'?"
          },
          {
            "type": "design",
            "question": "Sketch the Move signature of a credential-gated wrapper that calls authorize_with_witness (contra.move:223). What does your witness type W represent, and what does the ZK proof attest?"
          },
          {
            "type": "hands-on",
            "question": "Open the dedicated Confidential Transfers chapter (Ch 2.2) and map each of its six concepts to one row of your four-pane threat-model table."
          }
        ]
      },
      {
        "name": "Identity & Sender Privacy — zkLogin and the Anonymity-Set Gap",
        "analogy": "zkLogin is the IDENTITY film: it lets a user log in with Google (or any OIDC provider) and act on Sui WITHOUT publishing the link between 'alice@gmail.com' and her on-chain address. Under the hood a Groth16 proof attests 'I hold a valid, unexpired JWT for this provider and committed to this ephemeral key', and the address is derived by hashing a user-specific SALT together with the token's issuer/audience/subject — so the chain sees a normal-looking address with no visible tie to the web2 account. But — and this is the crux for your thesis — zkLogin hides the web2↔address LINK, not the on-chain ACTIVITY of that address. Once you act, your address is as traceable as any other: every transaction it sends is linkable to every other by the shared address. Sui has no native mixer, no shielded pool, no ring signatures — there is NO anonymity set. So 'sender privacy' on Sui today means at best 'fresh pseudonym per login', not unlinkability. Closing that gap — unlinkable authorization so multiple actions can't be tied to one user or each other — is the anonymous-credentials problem your thesis tackles.",
        "diagram": "What zkLogin hides vs what stays linkable:\n\n   web2 (Google JWT) ──Groth16 proof──▶ ephemeral key ──signs──▶ tx\n        │                                                         │\n        └─ HIDDEN: link web2 ↔ address                            │\n   address = H(salt, iss, aud, sub)  ◀ no visible web2 tie         │\n                                                                   ▼\n   on-chain:  addr 0xZ → tx1, tx2, tx3 ...  ◀ all LINKABLE by 0xZ\n              (same pseudonym ⇒ full activity graph)\n\n   Missing on Sui:  anonymity set / mixing / unlinkable spends\n   ┌───────────────────────────────────────────────────────────┐\n   │  THESIS GAP: anonymous credentials = prove 'I'm authorized' │\n   │  WITHOUT revealing which user, and UNLINKABLY across uses   │\n   │  (nullifiers for double-spend, selective disclosure)        │\n   └───────────────────────────────────────────────────────────┘",
        "keyPoints": [
          "zkLogin hides the web2-identity ↔ on-chain-address link via a Groth16 (BN254) proof over an OIDC JWT + an ephemeral key + a user salt; address = hash over (salt, iss, aud, sub)",
          "It does NOT anonymize on-chain activity: a zkLogin address is a stable pseudonym, so all its transactions are mutually linkable",
          "Sui has no native anonymity set: no shielded pool, no mixer, no ring signatures — sender unlinkability must be built at the application layer",
          "Trust in zkLogin = the OIDC provider (issues honest JWTs) + the prover service + salt secrecy; a salt or provider compromise can re-link identity",
          "Anonymous credentials (BBS+/Coconut/Semaphore-style) are the missing primitive: prove possession of an attribute/authorization without revealing identity AND without linking repeated uses",
          "Double-spend / sybil control without identity needs nullifiers + revocation-friendly accumulators — the hard part your thesis must design"
        ],
        "connections": "This is the precise statement of your thesis gap. The Sui stack gives amount privacy (contra), data privacy (Seal), compute privacy (Nautilus), and web2-link privacy (zkLogin) — but NO unlinkable authorization. Your anonymous-credential system (ZKP for the proof, TEE for issuance) supplies exactly that, and plugs into contra's witness hook so the authorized action can ALSO have a hidden amount. zkLogin is your closest relative and your strongest 'why not just use X' to address head-on.",
        "thesisExample": "Devote a related-work subsection to 'zkLogin vs anonymous credentials': both use Groth16, but zkLogin gives per-account web2 unlinkability while your credentials give per-USE unlinkability + selective disclosure + nullifier-based double-spend protection. Tabulate the difference and use it to motivate the contribution. Tie nullifier design to your revocation question (key thesis question #4).",
        "history": {
          "inventor": "zkLogin by Mysten Labs (2023); anonymous credentials lineage: Chaum (1985), Camenisch–Lysyanskaya (2001), BBS+ , Coconut (Sonnino et al. 2018), Semaphore",
          "year": 2023,
          "context": "zkLogin solved web2 onboarding (no seed phrase) with privacy of the identity link, a major UX win, but it was never meant to provide transaction-graph anonymity. Anonymous credentials, a 40-year cryptographic line, provide unlinkable selective-disclosure proofs — the property zkLogin lacks — and are the foundation your ZKP+TEE design builds on for Sui.",
          "funFact": "zkLogin and your thesis credentials can share the SAME on-chain Groth16 verifier (Sui's sui::groth16) — the difference is entirely in the statement being proved, which is a clean way to argue feasibility/cost in your evaluation."
        },
        "limitations": [
          "zkLogin pseudonyms are linkable on-chain; rotating addresses fragments balances and UX",
          "No base-layer anonymity set means k-anonymity must be bootstrapped by the application (hard for low-volume tokens)",
          "Anonymous-credential nullifiers + revocation interact subtly with unlinkability — naive designs leak or fail to revoke",
          "Trust dependencies (OIDC provider, salt service, prover) remain even with perfect on-chain ZK"
        ],
        "exercises": [
          {
            "type": "concept",
            "question": "Explain the difference between 'web2-link unlinkability' (zkLogin) and 'per-use unlinkability' (anonymous credentials). Give a scenario where the first holds but the second fails."
          },
          {
            "type": "design",
            "question": "Design a nullifier scheme that prevents double-spend of a one-time credential WITHOUT linking the two attempted uses to each other or to the holder. What does the nullifier commit to?"
          },
          {
            "type": "concept",
            "question": "Why does hiding amounts (contra) plus fresh pseudonyms (zkLogin) still NOT give unlinkable payments? Identify the residual linkage and which thesis primitive removes it."
          }
        ]
      },
      {
        "name": "Composing Private Payments on Sui — The Thesis Design Space",
        "analogy": "Now assemble the films into a window that's actually private. A complete private low-value payment on Sui needs four things at once: (1) the AMOUNT hidden — use contra; (2) the AUTHORIZATION anonymous and unlinkable — your anonymous-credential proof, verified on-chain (Groth16) and minting contra's Auth<T> via the witness hook; (3) the CREDENTIAL issued without a trusted central database leaking identity — issue it inside a Nautilus TEE (stateless, attested) and/or store viewing keys with Seal; (4) double-spend & revocation handled by NULLIFIERS + an accumulator, so a spent or revoked credential can't be reused, all without deanonymizing honest users. The art is in the seams: the credential proof must bind to the contra operation it authorizes (so it can't be replayed elsewhere), the nullifier must be unlinkable yet unique, and the compliance path (selective disclosure / per-account auditor) must coexist with anonymity. That composition — confidential value + anonymous authorization + TEE-anchored issuance + accountable privacy — IS your thesis.",
        "diagram": "The thesis architecture (ZKP + TEE over the Sui privacy stack):\n\n   ┌─ ISSUANCE (off-chain, Nautilus TEE) ─────────────────┐\n   │  verify identity once → mint credential commitment    │\n   │  attested, stateless (no identity DB retained)        │\n   └───────────────┬──────────────────────────────────────┘\n                   ▼  on-chain: credential accumulator (Merkle/RSA)\n   ┌─ USE (on-chain, per payment) ────────────────────────┐\n   │  ZK proof: 'I hold a valid, non-revoked credential'   │\n   │            + selective disclosure of needed attrs      │\n   │            + nullifier (unlinkable, one-time)          │\n   │     │ verified by sui::groth16                         │\n   │     ▼ mint Auth<T> via authorize_with_witness          │\n   │  contra: wrap / transfer (HIDDEN amount) / unwrap      │\n   └───────────────────────────────────────────────────────┘\n   Compliance seam: per-account auditor + selective disclosure\n   Open gaps: anonymity set, nullifier/revocation, TEE trust, gas payer privacy",
        "keyPoints": [
          "Full private payment = confidential AMOUNT (contra) + anonymous AUTHORIZATION (credential ZK proof) + private ISSUANCE (Nautilus TEE) + double-spend/revocation (nullifiers + accumulator)",
          "Integration point is contra's authorize_with_witness (contra.move:223): a Move module verifying a Groth16 credential proof mints the Auth<T> that gates wrap/transfer/unwrap",
          "On-chain verification reuses Sui's native Groth16 (sui::groth16, BN254) — the same verifier family as zkLogin, so feasibility/cost is benchmarkable",
          "TEE issuance (Nautilus) gives stateless, attested credential minting so the issuer holds no linkable identity database — pairs with Seal for key storage",
          "Accountable privacy: contra's per-account auditor + user selective disclosure let regulators open specific facts without breaking default anonymity — a core thesis selling point",
          "Open research gaps to claim: bootstrapping an anonymity set, unlinkable-yet-unique nullifiers, revocation without deanonymization, gas-payer privacy (sponsored tx), and the TEE-vs-pure-ZK trust trade",
          "Evaluation axes (thesis question #5): proof size, prover time, on-chain Groth16 verify gas, end-to-end latency, and practicality for LOW-VALUE payments"
        ],
        "connections": "This concept is the blueprint for your design + evaluation chapters and directly answers the five thesis questions: on-chain issuance without linking usage (TEE + accumulator), attribute verification without revealing (selective-disclosure ZK), TEE's role (private attested issuance), revocation without breaking anonymity (nullifier + revocation accumulator), and gas/proof cost on Sui (native Groth16 benchmark). Every other concept in this part feeds into this synthesis.",
        "thesisExample": "Make this diagram your Figure 2 (system architecture). Then structure the implementation chapter exactly along its boxes: (a) Nautilus issuance module, (b) on-chain credential accumulator + Groth16 verifier, (c) the contra witness adapter, (d) nullifier registry. Each box gets a benchmark in the evaluation chapter, rolled up against the low-value-payment practicality bar.",
        "history": {
          "inventor": "ZKP+TEE hybrids are an active research line; this specific composition (anonymous credentials over Confidential Transfers on Sui) is the thesis contribution",
          "year": 2026,
          "context": "Hybrid ZKP+TEE designs (e.g. TEE for fast issuance/attestation + ZK for trustless verification) aim to get the performance of hardware with the trust-minimization of cryptography. Composing that with a first-party confidential-transfer primitive on a high-throughput chain (Sui) is novel because the amount-privacy substrate (contra) only shipped in 2026 — making this thesis timely.",
          "funFact": "Because contra's Auth<T> is a drop-only, phantom-typed capability minted per-transaction, it is an almost perfect plug for a credential check: the proof authorizes exactly one operation in exactly one PTB and cannot be stored or replayed — the type system enforces single-use authorization for free."
        },
        "limitations": [
          "Composition inherits ALL four layers' trust assumptions plus the new credential/TEE assumptions — the privacy is the minimum across them",
          "Anonymity set must still be bootstrapped; with few users, hidden amounts + unlinkable proofs still leak via timing/volume",
          "TEE issuance reintroduces a hardware trust root that pure-ZK purists (and some reviewers) will challenge — justify it explicitly",
          "Revocation + nullifiers + unlinkability is genuinely hard; a flawed scheme silently breaks either privacy or double-spend protection",
          "contra is UNAUDITED devnet beta, so an end-to-end prototype is research-grade, not production"
        ],
        "exercises": [
          {
            "type": "design",
            "question": "Draw your full system as a PTB: which calls verify the credential proof, mint the Auth<T>, and execute the confidential transfer, and in what order? Where does the nullifier get checked and recorded?"
          },
          {
            "type": "concept",
            "question": "Map each of the five thesis research questions to a specific box in the architecture diagram and name the artifact that answers it."
          },
          {
            "type": "design",
            "question": "Justify (or reject) the TEE issuance box against a pure-ZK alternative. State the threat each stops, the cost of each, and which you'd defend to Bryan Ford / Carmela Troncoso."
          }
        ]
      }
    ]
  }
};
