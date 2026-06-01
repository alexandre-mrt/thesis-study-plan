/**
 * Nautilus Study Guide — Verifiable Off-Chain Compute via TEE
 * Data file loaded by the study plan website.
 */

window.NAUTILUS_GUIDE = {
  "block1": {
    "title": "Nautilus — Verifiable Off-Chain Compute via TEE",
    "connectionsSummary": "Nautilus is Sui's framework for trustworthy off-chain computation: an AWS Nitro Enclave runs your code in a hardware-isolated VM, signs its outputs with an ephemeral key, and an on-chain Move verifier checks both the hardware attestation and the signatures. For your thesis this is the TEE half of the ZKP+TEE design space — the complementary trust model to Seal/ZK. Understanding how attestation anchors an enclave's key on-chain, and how that key then signs private-payment outputs, is directly relevant to the Mysten internship (Sep 2026 - Mar 2027) where composing TEE-backed confidential compute with anonymous-credential and confidential-transaction primitives is the goal.",
    "concepts": [
      {
        "name": "TEE Trust Model & Nitro Attestation",
        "analogy": "A Nitro Enclave is a sealed, tamper-evident envelope produced by a notary you already trust (AWS). Inside the envelope, specific code runs in total isolation — even the parent machine cannot peek in. When the enclave wants to prove 'I am exactly this code, and here is my fresh public key', it asks the hardware (the Nitro Secure Module) to stamp a notarized document. The stamp is an ECDSA P-384 signature chaining up to AWS's root certificate. On-chain, Sui already knows AWS's root cert, so it can verify the stamp is genuine — the chain trusts the hardware, not the operator running it.",
        "diagram": "┌──────────────────────────────────────────────────────────┐\n│            Nitro Enclave Hardware Root of Trust           │\n├──────────────────────────────────────────────────────────┤\n│                                                          │\n│   Parent EC2 host  (UNTRUSTED, cannot read enclave)      │\n│   ┌────────────────────────────────────────────────┐     │\n│   │  Nitro Enclave (CPU-isolated VM)               │     │\n│   │   • PCR0 = hash(EIF image)                     │     │\n│   │   • PCR1 = hash(kernel)                        │     │\n│   │   • PCR2 = hash(application)                   │     │\n│   │   • ephemeral Ed25519 keypair (priv stays in)  │     │\n│   │            │                                   │     │\n│   │            ▼  NSM driver signs                 │     │\n│   │   COSE_Sign1 attestation doc (ECDSA P-384)     │     │\n│   └────────────────────────────────────────────────┘     │\n│            │  cert chain: leaf → intermediate → AWS root  │\n│            ▼                                              │\n│   On-chain: load_nitro_attestation(doc, &clock)          │\n│   verifies sig + X.509 chain to hardcoded AWS root        │\n└──────────────────────────────────────────────────────────┘",
        "keyPoints": [
          "AWS Nitro Enclave = CPU-isolated VM; the parent host cannot read enclave memory",
          "PCRs (Platform Configuration Registers) measure the running code: PCR0=EIF image, PCR1=kernel, PCR2=application",
          "The Nitro Secure Module (NSM) hardware signs the attestation document — the private signing key never leaves the chip",
          "Attestation is a COSE_Sign1 (RFC 8152) structure, tag=18, alg=-35 (ECDSA P-384), 96-byte signature",
          "Certificate chain runs leaf → intermediate(s) → AWS root; the root cert is hardcoded into the Sui framework",
          "On-chain entry point: sui::nitro_attestation::load_nitro_attestation(attestation, &Clock) → NitroAttestationDocument",
          "Move abort codes: ENotSupportedError=0, EParseError=1, EVerifyError=2, EInvalidPCRsError=3"
        ],
        "connections": "This is the foundational trust assumption of the whole TEE branch of your thesis. Where a ZKP convinces a verifier with pure math (no trusted party), a TEE convinces it with a hardware manufacturer's signature. Your thesis must articulate precisely what each model assumes: Nautilus trusts AWS's CA and the Nitro silicon; Seal/ZK trusts only the soundness of the proof system. Knowing where the trust is rooted lets you reason about which threats each design stops.",
        "thesisExample": "When you write the threat-model chapter, you'll contrast 'who can forge a valid output'. For Nautilus the answer is: anyone who can either (a) extract the ephemeral key from inside a genuine enclave (hardware attack) or (b) forge an AWS-rooted cert chain. You can cite the exact verifier — verify_nitro_attestation in nitro_attestation.rs:118-148 — as the concrete artifact enforcing that boundary.",
        "history": {
          "inventor": "Mysten Labs (Nautilus framework) on top of AWS Nitro Enclaves",
          "year": 2025,
          "context": "AWS Nitro Enclaves shipped in 2020 as part of the Nitro System, giving EC2 customers a way to carve a hardware-isolated VM out of a parent instance with no persistent storage, no interactive access, and a hardware attestation channel via the NSM. Mysten Labs' Nautilus framework (2025) bridges that attestation into Move: it bundles the AWS root certificate into the Sui framework and exposes load_nitro_attestation as a native function so smart contracts can verify enclave outputs without trusting the enclave operator.",
          "funFact": "Sui literally ships AWS's root certificate inside its source tree — include_bytes!(\"./nitro_root_certificate.pem\") — so the whole chain's trust in any Nitro Enclave reduces to one embedded PEM file."
        },
        "limitations": [
          "Trust is rooted in AWS and the Nitro silicon — a manufacturer/CA compromise or a hardware side-channel breaks every Nautilus deployment at once",
          "Attestation only proves WHICH code is running, not that the code is correct or bug-free — a buggy enclave produces validly-signed wrong outputs",
          "Side-channel attacks (timing, power, micro-architectural) against TEEs are an active research area; the attestation says nothing about side-channel resistance",
          "Vendor lock-in: the Move verifier is specific to AWS Nitro's COSE/X.509 format; SGX/SEV would need a different verifier",
          "Certificate validity is time-bounded and checked against the on-chain Clock, so attestation documents are not indefinitely replayable but also expire"
        ],
        "exercises": [
          {
            "type": "hands-on",
            "question": "Read sui::nitro_attestation::load_nitro_attestation (nitro_attestation.move:52-54) and trace how it calls the native load_nitro_attestation_internal (nitro_attestation.move:96-99)."
          },
          {
            "type": "hands-on",
            "question": "Open nitro_attestation.rs:118-148 (verify_nitro_attestation) and list every check performed: signature, leaf cert key usage, cert chain, timestamp."
          },
          {
            "type": "hands-on",
            "question": "Find the four Move abort codes (ENotSupportedError=0 … EInvalidPCRsError=3) in nitro_attestation.move and write down which failure each maps to."
          }
        ]
      },
      {
        "name": "Attestation Document Structure (PCRs & COSE_Sign1)",
        "analogy": "The attestation document is the enclave's notarized ID card. It lists who the enclave is (module_id), when it was issued (timestamp), a set of fingerprints of the exact software running (the PCRs), the enclave's fresh public key, and optional custom fields (user_data, nonce). The whole card is sealed in a COSE_Sign1 wrapper — think of it as cryptographic shrink-wrap: a single ECDSA P-384 signature over a canonical CBOR encoding, so any tampering breaks the seal and the on-chain parser rejects it.",
        "diagram": "┌──────────────────────────────────────────────────────────┐\n│            COSE_Sign1 Attestation Document                │\n├──────────────────────────────────────────────────────────┤\n│  tag = 18 (RFC 8152 COSE_Sign1)                          │\n│  ┌────────────────────────────────────────────────────┐  │\n│  │ protected   = {1: -35}   (ECDSA P-384)             │  │\n│  │ unprotected = {} (empty)                           │  │\n│  │ payload     = CBOR( AttestationDocument )          │  │\n│  │   ├─ module_id   (Nitro hypervisor ID)             │  │\n│  │   ├─ timestamp   (ms since UNIX epoch)             │  │\n│  │   ├─ digest      (\"SHA384\")                        │  │\n│  │   ├─ pcrs[]      (index + value, 32/48/64 bytes)   │  │\n│  │   ├─ public_key  Option (≤1024 B, the eph. pk)     │  │\n│  │   ├─ user_data   Option (≤512 B)                   │  │\n│  │   ├─ nonce       Option (freshness)                │  │\n│  │   └─ certificate + cabundle (cert chain)           │  │\n│  │ signature   = 96 bytes (P-384)                     │  │\n│  └────────────────────────────────────────────────────┘  │\n│  signed over: [\"Signature1\", protected, empty, payload]   │\n└──────────────────────────────────────────────────────────┘",
        "keyPoints": [
          "NitroAttestationDocument fields: module_id, timestamp, digest, pcrs[], public_key, user_data, nonce (nitro_attestation.move:28-45)",
          "Each PCREntry is { index: u8, value: vector<u8> }; value is 32/48/64 bytes for SHA256/384/512",
          "Required PCRs always included: indices 0,1,2,3,4,8; custom PCRs 5-7 and 9-31 included only when nonzero (nitro_attestation.rs:629-651)",
          "COSE_Sign1 wrapper: protected = {1:-35}, unprotected empty, payload = CBOR(doc), signature = 96 bytes (nitro_attestation.rs:155-168)",
          "Signature is computed over the canonical array [\"Signature1\", protected, empty, payload] (nitro_attestation.rs:363-376)",
          "Hard limits enforced in Rust: MAX_CERT_CHAIN_LENGTH=10, MAX_USER_DATA_LENGTH=512, MAX_PK_LENGTH=1024, MAX_PCRS_LENGTH=32, MAX_CERT_LENGTH=1024 (nitro_attestation.rs:25-34)",
          "Rust doc has both pcr_vec (legacy [0,1,2,3,4,8]) and pcr_map (all nonzero PCRs) for the upgraded parser (nitro_attestation.rs:382-393)"
        ],
        "connections": "Understanding the document format is what lets you reason about freshness and binding. The nonce field is a freshness proof; user_data is a 512-byte channel to bind application context into the attestation. In a privacy-payment setting you might bind a commitment or a session identifier into user_data so the attestation proves not just 'this enclave' but 'this enclave for THIS request' — exactly the kind of binding argument you'll make for ZK statements too.",
        "thesisExample": "If you need the enclave's attestation to commit to a specific batch of confidential transactions, you can place a Merkle root or BCS-encoded request hash into user_data (≤512 bytes) so the on-chain verifier ties the enclave's identity to the exact input it processed — preventing an attacker from replaying a valid attestation against a different input.",
        "history": {
          "inventor": "AWS (Nitro attestation format) + IETF COSE (RFC 8152)",
          "year": 2020,
          "context": "COSE (CBOR Object Signing and Encryption, RFC 8152, 2017) is the compact binary cousin of JOSE/JWT, designed for constrained IoT devices. AWS chose COSE_Sign1 — the single-signer variant — for Nitro attestation because it is deterministic and compact. PCRs themselves are a TPM-era concept (Trusted Platform Module measured boot) repurposed for enclave measurement, where each register is the running hash of a boot/image stage.",
          "funFact": "The COSE algorithm value -35 is not arbitrary: it is the registered IANA COSE identifier for ES384 (ECDSA with SHA-384 over P-384)."
        },
        "limitations": [
          "Parsing CBOR/COSE on-chain is non-trivial; a malformed document aborts with EParseError=1 rather than giving a precise reason",
          "user_data and nonce are application-defined — Nautilus does not enforce any semantics, so binding correctness is entirely the dapp's responsibility",
          "PCR values prove software identity but reveal nothing about runtime data confidentiality; two different secrets in the same code yield identical PCRs",
          "Document size is bounded (1024-byte cert, 512-byte user_data), so large context cannot be embedded directly — only hashes/commitments fit"
        ],
        "exercises": [
          {
            "type": "hands-on",
            "question": "Map each field of the Move NitroAttestationDocument (nitro_attestation.move:28-45) to its Rust counterpart AttestationDocument (nitro_attestation.rs:382-393)."
          },
          {
            "type": "hands-on",
            "question": "Read nitro_attestation.rs:629-651 and explain the difference between the required PCR set and the include_all_nonzero_pcrs behavior."
          },
          {
            "type": "hands-on",
            "question": "Find the five MAX_* constants (nitro_attestation.rs:25-34) and reason about which denial-of-service each bound prevents."
          }
        ]
      },
      {
        "name": "On-Chain Enclave Registration (Cap/Witness Pattern)",
        "analogy": "Registration is the enclave's one-time 'passport check' at the border. The enclave shows up with its notarized attestation document; the Move verifier checks the document's PCR measurements match exactly what the dapp owner pre-registered (the EnclaveConfig), then stamps the passport by extracting the enclave's ephemeral public key and storing it in a shared Enclave object. The Cap<T> is the dapp's signet ring: only the module holding the witness type T can mint a config for that dapp, so nobody can impersonate your enclave's identity.",
        "diagram": "┌──────────────────────────────────────────────────────────┐\n│        One-Time On-Chain Enclave Registration            │\n├──────────────────────────────────────────────────────────┤\n│                                                          │\n│  Cap<T>  ── new_cap<T: drop>(witness, ctx) ──┐           │\n│   (one per dapp module, witness-gated)       │           │\n│                                              ▼           │\n│  EnclaveConfig<T> { pcrs, capability_id, version }       │\n│                       ▲                                  │\n│   attestation doc ────┘                                 │\n│        │  register_enclave<T>()                          │\n│        ▼                                                 │\n│  load_pk: assert document.pcrs == config.pcrs            │\n│           (abort EInvalidPCRs=0 on mismatch)             │\n│        │  extract ephemeral pk from attestation          │\n│        ▼                                                 │\n│  share_object( Enclave<T> { pk, config_version, owner }) │\n│   → public key now anchored on-chain, reusable           │\n└──────────────────────────────────────────────────────────┘",
        "keyPoints": [
          "EnclaveConfig<phantom T> holds the trusted PCR triple, a capability_id, and a version (enclave.move:31-37)",
          "Pcrs(vector<u8>, vector<u8>, vector<u8>) — three 48-byte SHA-384 digests for PCR0/PCR1/PCR2 (enclave.move:23)",
          "Cap<phantom T> is minted only via new_cap<T: drop>(witness, ctx) — the witness type T gates who can create a dapp's config (enclave.move:60-64)",
          "register_enclave<T>(config, document, ctx) verifies PCRs then extracts the ephemeral pk and shares an Enclave<T> object (enclave.move:85-100)",
          "load_pk asserts document.to_pcrs() == config.pcrs (abort EInvalidPCRs=0), then destroy_some's the public key (enclave.move:163-167)",
          "Registration is expensive (full attestation + cert-chain verify) but happens ONCE; after that the cheap Ed25519 key is reused",
          "Enclave registration abort codes: EInvalidPCRs=0, EInvalidConfigVersion=1, EInvalidCap=2, EInvalidOwner=3 (enclave.move:15-18)"
        ],
        "connections": "The Cap/Witness pattern is core idiomatic Sui Move and shows up everywhere in your thesis codebase (TreasuryCap, AdminCap, etc.). Here it solves the identity problem: how does the chain know THIS Enclave object belongs to MY dapp and runs MY code? The answer — phantom type T + capability_id binding — is the same capability-based access-control reasoning you'll apply when designing who may mint credentials or authorize confidential transfers.",
        "thesisExample": "If you build a TEE-backed confidential-payment oracle, you'd define a witness type PAYMENT_ORACLE, mint a Cap<PAYMENT_ORACLE>, and register an EnclaveConfig<PAYMENT_ORACLE> pinned to the PCRs of your reviewed enclave image. Any payment-settlement function would take &Enclave<PAYMENT_ORACLE>, guaranteeing the signature it checks came from your audited code and no other enclave.",
        "limitations": [
          "PCRs must be known and pinned in advance — every code change to the enclave changes PCR2 and forces re-registration with a new attestation",
          "There is no on-chain notion of 'this PCR set was audited' — the dapp owner is trusted to register PCRs of genuinely reviewed code",
          "A compromised dapp owner (holder of Cap<T>) can register a malicious enclave config; the Cap is a single point of authority",
          "The Enclave object is shared, so its public key is globally readable — fine for verification, but the model assumes the ephemeral private key is never extracted"
        ],
        "exercises": [
          {
            "type": "hands-on",
            "question": "Read register_enclave<T> (enclave.move:85-100) and load_pk (enclave.move:163-167); identify exactly where the PCR equality check happens."
          },
          {
            "type": "hands-on",
            "question": "Study new_cap<T: drop> (enclave.move:60-64) and explain in one sentence why the witness type T must have the drop ability."
          },
          {
            "type": "hands-on",
            "question": "List the four enclave-registration abort codes (enclave.move:15-18) and construct, on paper, a transaction that would trigger EInvalidCap=2."
          }
        ]
      },
      {
        "name": "Off-Chain Server: Ephemeral Keypair & Signed Responses",
        "analogy": "Think of the enclave server as a sworn witness who, the moment they enter the courtroom, is handed a brand-new fountain pen (the ephemeral Ed25519 keypair) that exists only for this session and never leaves the room. The court records the pen's unique nib pattern (the public key, via attestation). From then on, every statement the witness signs with that pen is provably theirs. Each response is wrapped in an IntentMessage — a tamper-evident envelope stamped with an intent code and a timestamp — then BCS-serialized and signed, so the on-chain verifier can re-derive the exact bytes and check the signature.",
        "diagram": "┌──────────────────────────────────────────────────────────┐\n│              Off-Chain Enclave Server Flow                │\n├──────────────────────────────────────────────────────────┤\n│  boot: eph_kp = Ed25519KeyPair::generate(rng)            │\n│        (private key NEVER leaves enclave)                │\n│                                                          │\n│  GET /get_attestation                                    │\n│    └─ NsmRequest::Attestation{ public_key: Some(pk) }   │\n│       → COSE_Sign1 doc containing pk  (one-time)         │\n│                                                          │\n│  POST /process_data  { input }                           │\n│    └─ to_signed_response(kp, payload, ts, intent):       │\n│         IntentMessage{ intent, timestamp_ms, data }      │\n│         bytes = bcs::to_bytes(&intent_msg)               │\n│         sig   = kp.sign(bytes)                           │\n│       → { response: IntentMessage, signature: hex }      │\n│                                                          │\n│  client submits (payload, ts, intent, sig) on-chain      │\n└──────────────────────────────────────────────────────────┘",
        "keyPoints": [
          "AppState holds eph_kp: Ed25519KeyPair (generated on boot) and an api_key for external services (lib.rs:40-45)",
          "Keypair created via Ed25519KeyPair::generate(&mut rand::thread_rng()) in main.rs; one keypair per enclave instance (main.rs:16)",
          "GET /get_attestation calls the NSM driver with NsmRequest::Attestation{ public_key: Some(pk) } and returns the COSE doc (common.rs:82-113)",
          "POST /process_data wraps output via to_signed_response<T>(kp, payload, timestamp_ms, intent) (common.rs:56-71)",
          "IntentMessage<T> { intent: u8, timestamp_ms: u64, data: T } mirrors the on-chain Move struct field-for-field (common.rs:26-40)",
          "Signing payload is bcs::to_bytes(&intent_msg) — BCS guarantees identical bytes in Rust and Move for cross-language verification",
          "The private key signs only inside the enclave; only the public key is ever exported (via attestation) — rotation requires re-registration"
        ],
        "connections": "This is where the TEE meets your cryptography background: the enclave acts as a single signer whose key is hardware-anchored. The IntentMessage/BCS discipline is the same determinism requirement you face when a ZK circuit and a verifier must agree on serialized inputs byte-for-byte. The 'compute privately inside, sign the result, verify cheaply outside' pattern is the exact shape a TEE-backed confidential-payment processor takes in your thesis.",
        "thesisExample": "Your confidential-payment enclave would receive an encrypted intent, decrypt and route it internally, then call to_signed_response with intent=PAYMENT_SETTLED and a payload carrying the (public) settlement commitment. The client submits that signed message to a Move function that mints/settles only if enclave.verify_signature(...) returns true — the enclave's correctness is enforced cryptographically, not by trusting the operator.",
        "history": {
          "inventor": "Mysten Labs (Nautilus reference server) using fastcrypto Ed25519",
          "year": 2025,
          "context": "The reference Nautilus server is an axum (Rust async) web service that runs inside the enclave image. It uses fastcrypto's Ed25519KeyPair for the ephemeral key and the aws-nitro-enclaves-nsm-api driver to request attestation from the NSM. The design deliberately keeps the enclave stateless: it holds only the ephemeral key and signs each response independently, so there is no notion of 'correct next state' to corrupt — only 'this output came from the registered enclave'.",
          "funFact": "Because BCS serialization is canonical, the very same byte vector that the Rust server signs is reconstructed independently inside Move — neither side ever transmits the signed bytes; they each derive them from the structured fields."
        },
        "limitations": [
          "Ephemeral key compromise inside the enclave (e.g., via a memory-disclosure bug in the app code) lets an attacker forge arbitrary signed outputs",
          "No on-chain freshness enforcement: the server stamps timestamp_ms but the framework does not check it — replay protection is the dapp's job",
          "Key rotation is heavyweight: a new keypair means a new attestation and a new on-chain registration, so long-lived deployments accumulate registrations",
          "The enclave is stateless by design, so it cannot prove ordering or 'this is the correct successor state' — only single-output authenticity"
        ],
        "exercises": [
          {
            "type": "hands-on",
            "question": "Read to_signed_response<T> (common.rs:56-71) and write down the exact byte sequence that gets signed."
          },
          {
            "type": "hands-on",
            "question": "Compare the Rust IntentMessage<T> (common.rs:26-40) with the Move intent message (enclave.move:53-57) and confirm the field order matches."
          },
          {
            "type": "hands-on",
            "question": "Trace get_attestation (common.rs:82-113): which NsmRequest variant is used and what does public_key: Some(pk) put into the document?"
          }
        ]
      },
      {
        "name": "On-Chain Signature Verification & Usage",
        "analogy": "After the one-time passport check, every later interaction is a quick signature match. The Move verifier takes the structured claim (intent + timestamp + payload), rebuilds the exact bytes the enclave would have signed, and checks them against the public key it already stored at registration. It's like a bank teller who, once your signature card is on file, just compares each cheque to the card — fast, cheap, and no notary needed for every transaction.",
        "diagram": "┌──────────────────────────────────────────────────────────┐\n│            On-Chain Signature Verification                │\n├──────────────────────────────────────────────────────────┤\n│  verify_signature<T, P: drop>(                           │\n│     enclave, intent_scope, timestamp_ms, payload, sig)   │\n│        │                                                 │\n│        ├─ msg  = create_intent_message(scope, ts, p)     │\n│        ├─ bytes = bcs::to_bytes(&msg)                    │\n│        └─ ed25519::ed25519_verify(sig, enclave.pk, bytes)│\n│                          │ true / false                  │\n│                          ▼                               │\n│  dapp: update_weather(loc, temp, ts, sig, &enclave):     │\n│        res = enclave.verify_signature(WEATHER_INTENT,    │\n│                       ts, WeatherResponse{...}, sig)     │\n│        assert!(res, EInvalidSignature)                   │\n│        → mint WeatherNFT                                 │\n└──────────────────────────────────────────────────────────┘",
        "keyPoints": [
          "verify_signature<T, P: drop>(enclave, intent_scope, timestamp_ms, payload, signature) -> bool (enclave.move:102-112)",
          "It reconstructs the intent message on-chain, BCS-serializes it, and calls ed25519::ed25519_verify against enclave.pk",
          "The public key compared against is the one anchored during register_enclave — no per-call attestation needed",
          "There is NO on-chain timestamp validation; freshness is left entirely to the dapp (a deliberate design choice)",
          "Example: update_weather<T>(location, temperature, timestamp_ms, sig, &enclave, ctx) verifies WEATHER_INTENT (=0) then mints (weather.move:45-67)",
          "Failure path: assert!(res, EInvalidSignature) — the dapp defines its own abort code on signature mismatch",
          "Verification is cheap (one Ed25519 check) versus registration (full cert-chain attestation) — the core cost-amortization of the design"
        ],
        "connections": "The two-phase 'expensive attestation once, cheap signature many times' structure is the performance argument that makes TEE attractive versus per-call ZK proofs in some settings. For your thesis comparison table this is the headline tradeoff: ZK verification cost is paid every proof; Nautilus pays a heavy cert-chain check once at registration and then only an Ed25519 verify per output. Quantifying that is a concrete, citable result for the evaluation chapter.",
        "thesisExample": "A TEE-backed confidential-balance oracle would expose verify_signature(enclave, BALANCE_INTENT, ts, BalanceAttestation{commitment}, sig) inside a Move settlement function. You'd add the freshness check the framework omits — e.g., assert!(ts + WINDOW > clock.timestamp_ms()) — to close the replay gap, and document that as a hardening you contributed over the reference design.",
        "limitations": [
          "No built-in replay protection: the same (payload, timestamp, sig) can be submitted repeatedly unless the dapp tracks nonces/timestamps",
          "verify_signature returns bool, not an abort — forgetting the assert! silently accepts unverified data (a real footgun)",
          "Correctness of the payload is not verified, only its authenticity — the chain trusts that the registered enclave computed the right answer",
          "Statelessness means the chain cannot detect a forked/rolled-back enclave producing two contradictory valid signatures for the same timestamp"
        ],
        "exercises": [
          {
            "type": "hands-on",
            "question": "Read verify_signature<T, P> (enclave.move:102-112) and the example update_weather (weather.move:45-67); note where the result bool is asserted."
          },
          {
            "type": "hands-on",
            "question": "Identify the exact line where the framework could (but deliberately does not) validate timestamp_ms, and sketch the assert you'd add."
          },
          {
            "type": "hands-on",
            "question": "Trace the full weather walkthrough (weather.move:69-127): registration via load_nitro_attestation, then update_weather with a real signature."
          }
        ]
      },
      {
        "name": "ZKP + TEE Composition (Seal Integration)",
        "analogy": "ZK and TEE are two different ways to make a stranger trust a computation. ZK is a magician proving a card trick is fair using only math you can check yourself — no trusted assistant. TEE is a sealed glass box from a trusted manufacturer: you trust the box, and it shows you the result is genuine. Composing them gives you the best of both: the enclave (TEE) holds and decrypts secrets that Seal encrypted, computes privately inside the box, and emits a signed result — while the math-checkable proof commitments handle the parts you don't want to trust the box for. The thesis question is exactly where to draw that line.",
        "diagram": "┌──────────────────────────────────────────────────────────┐\n│             ZKP (Seal)   vs   TEE (Nautilus)             │\n├───────────────┬─────────────────┬───────────────────────┤\n│ Root of trust │ math (proof)    │ AWS CA + Nitro silicon │\n│ Verify cost   │ high, per-proof │ 1× cert chain + cheap  │\n│               │                 │ Ed25519 per output     │\n│ Privacy       │ hides the whole │ hides internal state;  │\n│               │ computation     │ attests correct enclave│\n│ Compose via   │ proof commitment│ ephemeral-key signature│\n└───────────────┴─────────────────┴───────────────────────┘\n  Pipeline:  enclave boots → eph key attested on-chain\n             → Seal injects encrypted secret into enclave\n             → enclave decrypts + computes privately\n             → signs output (proves: registered enclave\n               AND ran the Seal-verified private compute)",
        "keyPoints": [
          "Nautilus ships an optional seal-example feature flag (#[cfg(feature = \"seal-example\")]) that integrates Seal into the enclave (lib.rs:12-34)",
          "Two-phase bootstrap: a host-init server provisions/injects a sealed secret before the main computation server starts (main.rs:32-35)",
          "Secret provisioning is decoupled from attestation — a SEAL_API_KEY is supplied outside and unsealed inside the enclave",
          "Trust-model contrast: ZK roots in proof soundness (no trusted party); TEE roots in the AWS cert chain + Nitro hardware",
          "Verification cost contrast: ZK pays per proof; Nautilus pays one cert-chain verify at registration, then a cheap Ed25519 per output",
          "Composition glue differs: ZK composes via proof commitments; Nautilus composes via the ephemeral key's signature",
          "Combined claim: a signed enclave output can assert BOTH 'from the registered enclave' AND 'ran a Seal-verified private computation'"
        ],
        "connections": "This is the thesis thesis. Your project lives precisely at the ZKP+TEE seam: deciding which guarantees come from cryptographic soundness and which from hardware attestation, and how privacy-payment flows compose them. Nautilus + Seal is the concrete reference for that composition on Sui, and the Mysten internship is where you'd push it — e.g., using a TEE to make ZK proving practical over secrets, or using ZK to remove the hardware-trust assumption where it matters most.",
        "thesisExample": "A privacy-payment sketch: the payer encrypts their payment intent under Seal; the enclave (and only the enclave) decrypts it, computes the routing/settlement, re-encrypts the output, and signs it with its ephemeral key. On-chain you verify the Ed25519 signature (proves the enclave was used) and, where present, a Seal/ZK commitment (proves the intent stayed private). Your contribution is the protocol and the precise statement of what each layer guarantees.",
        "history": {
          "inventor": "Mysten Labs (Seal + Nautilus on Sui)",
          "year": 2025,
          "context": "Seal is Mysten's decentralized secrets-management / threshold-encryption layer and Nautilus is the TEE-attestation framework; both landed in the Sui ecosystem in 2025. The seal-example feature in the Nautilus server demonstrates the intended composition: TEE provides a hardware-isolated execution environment, Seal provides the encrypted-secret channel into it, and Sui Move provides the on-chain verifier that ties the two together via attestation + signature.",
          "funFact": "The seal-example is gated behind a Cargo feature flag, so the base Nautilus server compiles without any Seal dependency — the TEE and the ZK/secret layers are deliberately decoupled, mirroring the thesis's modular trust argument."
        },
        "limitations": [
          "Composing TEE + ZK widens the trusted computing base: you now depend on BOTH the hardware/CA and the proof system being sound",
          "The seal-example is a reference, not a hardened protocol — secret-injection timing and the host-init server are attack surface",
          "Privacy of the intent depends on Seal's threshold assumptions; the TEE alone does not provide the cryptographic hiding a ZK proof does",
          "Reasoning about the combined guarantee is subtle: a valid signature proves authenticity but not that the private-compute branch was actually taken unless explicitly committed"
        ],
        "exercises": [
          {
            "type": "hands-on",
            "question": "Read the seal-example feature gate (lib.rs:12-34) and the host-init spawn (main.rs:32-35); describe the two-phase bootstrap order."
          },
          {
            "type": "hands-on",
            "question": "Fill in the ZKP-vs-TEE comparison table from the source: root of trust, verification cost, privacy model, composition mechanism."
          },
          {
            "type": "hands-on",
            "question": "Sketch (on paper) a privacy-payment flow that uses Seal for the encrypted intent and Nautilus for the signed settlement, labeling which property each layer provides."
          }
        ]
      }
    ]
  }
};
