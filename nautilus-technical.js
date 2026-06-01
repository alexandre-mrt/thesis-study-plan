/**
 * Nautilus Technical Companion — Verifiable Off-Chain Compute via TEE
 * Deep technical details paired with NAUTILUS_GUIDE.
 * Uses HTML for formatting; <code> for inline, <pre> for blocks.
 */

window.NAUTILUS_TECHNICAL = {
  block1: {
    concepts: [
      /* ───────── TEE Trust Model & Nitro Attestation ───────── */
      {
        name: "TEE Trust Model & Nitro Attestation",
        formalDefinition:
          "<p>A <strong>Trusted Execution Environment (TEE)</strong> shifts the verifier's trust from " +
          "the operator of a machine to its <strong>hardware manufacturer</strong>. AWS Nitro Enclaves " +
          "provide a CPU-isolated VM carved out of a parent EC2 instance with no persistent storage, " +
          "no interactive access, and a hardware <em>attestation</em> channel via the Nitro Secure " +
          "Module (NSM).</p>" +
          "<ul>" +
          "<li>The enclave's running software is measured into <strong>PCRs</strong> (Platform " +
          "Configuration Registers): <code>PCR0</code>=hash of the EIF image, <code>PCR1</code>=kernel, " +
          "<code>PCR2</code>=application.</li>" +
          "<li>The NSM signs an <strong>attestation document</strong> binding the PCRs to an enclave-" +
          "supplied public key, using <strong>ECDSA P-384</strong>.</li>" +
          "<li>A certificate chain (leaf → intermediate(s) → AWS root) lets a relying party verify the " +
          "signature came from genuine AWS Nitro hardware.</li>" +
          "</ul>" +
          "<p>Sui exposes on-chain verification via the native " +
          "<code>sui::nitro_attestation::load_nitro_attestation</code>, with the AWS root certificate " +
          "embedded in the framework.</p>",
        mathDetails: [
          {
            subtitle: "On-Chain Entry Point (Move)",
            content:
              "<p>The public Move API and its abort codes (nitro_attestation.move):</p>" +
              "<pre><code>" +
              "// nitro_attestation.move:52-54\n" +
              "public fun load_nitro_attestation(\n" +
              "    attestation: vector&lt;u8&gt;,\n" +
              "    clock: &amp;Clock,\n" +
              "): NitroAttestationDocument;\n\n" +
              "// abort codes\n" +
              "const ENotSupportedError: u64 = 0; // feature not on this network\n" +
              "const EParseError: u64       = 1; // CBOR/attestation parse failed\n" +
              "const EVerifyError: u64      = 2; // signature or cert verify failed\n" +
              "const EInvalidPCRsError: u64 = 3; // PCR mismatch in document\n" +
              "</code></pre>" +
              "<p>The public function calls a native " +
              "<code>load_nitro_attestation_internal</code> (nitro_attestation.move:96-99) bound to the " +
              "Rust verifier.</p>"
          },
          {
            subtitle: "Native Verification (Rust)",
            content:
              "<p><code>verify_nitro_attestation</code> (nitro_attestation.rs:118-148) extracts the " +
              "P-384 signature and the leaf certificate's public key, verifies the COSE signature, then " +
              "validates the certificate chain against the on-chain <code>Clock</code>:</p>" +
              "<pre><code>" +
              "pub fn verify_nitro_attestation(\n" +
              "    signature: &amp;[u8],\n" +
              "    signed_message: &amp;[u8],\n" +
              "    payload: &amp;AttestationDocument,\n" +
              "    timestamp: u64,\n" +
              ") -&gt; SuiResult&lt;()&gt; {\n" +
              "    let signature = Signature::from_slice(signature)?;\n" +
              "    let cert = X509Certificate::from_der(\n" +
              "        payload.certificate.as_slice())?;\n" +
              "    let pk = SubjectPublicKeyInfo::parsed(cert.1.public_key())?;\n" +
              "    match pk {\n" +
              "        PublicKey::EC(ec) =&gt; {\n" +
              "            let vk = VerifyingKey::from_sec1_bytes(ec.data())?;\n" +
              "            vk.verify(signed_message, &amp;signature)?;\n" +
              "        }\n" +
              "        _ =&gt; return Err(/* ... */),\n" +
              "    }\n" +
              "    payload.verify_cert(timestamp)?; // chain to AWS root\n" +
              "    Ok(())\n" +
              "}\n" +
              "</code></pre>" +
              "<p>The AWS root is embedded: " +
              "<code>include_bytes!(\"./nitro_root_certificate.pem\")</code> (nitro_attestation.rs:37-44).</p>"
          },
          {
            subtitle: "Certificate Chain Validation",
            content:
              "<p>Chain validation (<code>verify_cert_chain</code>, nitro_attestation.rs:720-827) enforces:</p>" +
              "<ul>" +
              "<li>Leaf certificate must carry the <code>digitalSignature</code> key-usage bit.</li>" +
              "<li>Intermediate and root CAs must have <code>keyCertSign</code> and " +
              "<code>basicConstraints(CA=true)</code>, with <code>pathLenConstraint</code> respected.</li>" +
              "<li>Issuer/subject chaining checked at each hop; each cert signed by the previous issuer.</li>" +
              "<li>Validity windows checked against the <code>Clock</code> (millisecond precision).</li>" +
              "</ul>" +
              "<p>The signed message for COSE_Sign1 is the canonical array " +
              "<code>[\"Signature1\", protected, empty, payload]</code> (nitro_attestation.rs:363-376).</p>"
          }
        ]
      },

      /* ───────── Attestation Document Structure (PCRs & COSE_Sign1) ───────── */
      {
        name: "Attestation Document Structure (PCRs & COSE_Sign1)",
        formalDefinition:
          "<p>The attestation payload is an <strong>AttestationDocument</strong> CBOR-encoded inside a " +
          "<strong>COSE_Sign1</strong> (RFC 8152, tag 18) envelope. It binds the enclave's measured " +
          "identity (PCRs), an enclave-supplied <code>public_key</code>, and optional application data " +
          "to a single ECDSA P-384 signature.</p>" +
          "<ul>" +
          "<li><strong>Required PCRs</strong>: indices 0,1,2,3,4,8 are always present.</li>" +
          "<li><strong>Custom PCRs</strong>: indices 5-7, 9-31 are included only when nonzero (under " +
          "<code>include_all_nonzero_pcrs</code>).</li>" +
          "<li>PCR values are 32 / 48 / 64 bytes for SHA-256 / SHA-384 / SHA-512.</li>" +
          "</ul>",
        mathDetails: [
          {
            subtitle: "Move & Rust Document Structs",
            content:
              "<p>Move side (nitro_attestation.move:28-45) and Rust side " +
              "(nitro_attestation.rs:382-393):</p>" +
              "<pre><code>" +
              "// Move\n" +
              "public struct NitroAttestationDocument has drop {\n" +
              "    module_id: vector&lt;u8&gt;,\n" +
              "    timestamp: u64,                 // ms since UNIX epoch\n" +
              "    digest: vector&lt;u8&gt;,            // hash alg (SHA384)\n" +
              "    pcrs: vector&lt;PCREntry&gt;,        // index + value pairs\n" +
              "    public_key: Option&lt;vector&lt;u8&gt;&gt;,// DER key, &lt;=1024 B\n" +
              "    user_data: Option&lt;vector&lt;u8&gt;&gt;, // custom, &lt;=512 B\n" +
              "    nonce: Option&lt;vector&lt;u8&gt;&gt;,     // freshness\n" +
              "}\n" +
              "public struct PCREntry has drop {\n" +
              "    index: u8,\n" +
              "    value: vector&lt;u8&gt;,\n" +
              "}\n\n" +
              "// Rust\n" +
              "pub struct AttestationDocument {\n" +
              "    pub module_id: String,\n" +
              "    pub timestamp: u64,\n" +
              "    pub digest: String,\n" +
              "    pub pcr_vec: Vec&lt;Vec&lt;u8&gt;&gt;,     // legacy [0,1,2,3,4,8]\n" +
              "    pub pcr_map: BTreeMap&lt;u8, Vec&lt;u8&gt;&gt;, // all nonzero\n" +
              "    certificate: Vec&lt;u8&gt;,\n" +
              "    cabundle: Vec&lt;Vec&lt;u8&gt;&gt;,        // CA chain to AWS root\n" +
              "    pub public_key: Option&lt;Vec&lt;u8&gt;&gt;,\n" +
              "    pub user_data: Option&lt;Vec&lt;u8&gt;&gt;,\n" +
              "    pub nonce: Option&lt;Vec&lt;u8&gt;&gt;,\n" +
              "}\n" +
              "</code></pre>"
          },
          {
            subtitle: "COSE_Sign1 Wrapper",
            content:
              "<p>The signed envelope (nitro_attestation.rs:155-168):</p>" +
              "<pre><code>" +
              "pub struct CoseSign1 {\n" +
              "    protected: Vec&lt;u8&gt;,   // CBOR map {1: -35} => ES384\n" +
              "    unprotected: HeaderMap,// always empty\n" +
              "    payload: Vec&lt;u8&gt;,     // CBOR(AttestationDocument)\n" +
              "    signature: Vec&lt;u8&gt;,   // 96 bytes (P-384)\n" +
              "}\n" +
              "</code></pre>" +
              "<p>Tag = 18 marks COSE_Sign1; alg = -35 is the IANA COSE identifier for ES384 " +
              "(ECDSA + SHA-384 over P-384). Parsing entry point: " +
              "<code>CoseSign1::parse_and_validate</code> (nitro_attestation.rs:285-322).</p>"
          },
          {
            subtitle: "Hard Limits (DoS bounds)",
            content:
              "<p>Constants enforced during parsing (nitro_attestation.rs:25-34):</p>" +
              "<pre><code>" +
              "const MAX_CERT_CHAIN_LENGTH: usize = 10;\n" +
              "const MAX_USER_DATA_LENGTH:  usize = 512;\n" +
              "const MAX_PK_LENGTH:         usize = 1024;\n" +
              "const MAX_PCRS_LENGTH:       usize = 32;\n" +
              "const MAX_CERT_LENGTH:       usize = 1024;\n" +
              "</code></pre>" +
              "<p>PCR-selection logic lives at nitro_attestation.rs:629-651: required PCRs " +
              "(0,1,2,3,4,8) always included; nonzero custom PCRs added when " +
              "<code>include_all_nonzero_pcrs = true</code>.</p>"
          }
        ]
      },

      /* ───────── On-Chain Enclave Registration (Cap/Witness Pattern) ───────── */
      {
        name: "On-Chain Enclave Registration (Cap/Witness Pattern)",
        formalDefinition:
          "<p>Registration anchors an enclave's ephemeral public key on-chain <strong>once</strong>, " +
          "after verifying that the attestation document's PCRs match a pre-registered " +
          "<code>EnclaveConfig&lt;T&gt;</code>. Access control uses the Sui <strong>capability + " +
          "witness</strong> pattern: a phantom type <code>T</code> identifies the dapp, a " +
          "<code>Cap&lt;T&gt;</code> authorizes config creation, and the config's " +
          "<code>capability_id</code> binds them together.</p>",
        mathDetails: [
          {
            subtitle: "Core Structs",
            content:
              "<pre><code>" +
              "// enclave.move:23\n" +
              "public struct Pcrs(\n" +
              "    vector&lt;u8&gt;, vector&lt;u8&gt;, vector&lt;u8&gt; // PCR0/1/2, 48 B each\n" +
              ") has copy, drop, store;\n\n" +
              "// enclave.move:31-37\n" +
              "public struct EnclaveConfig&lt;phantom T&gt; has key {\n" +
              "    id: UID,\n" +
              "    name: String,\n" +
              "    pcrs: Pcrs,\n" +
              "    capability_id: ID,  // references Cap&lt;T&gt;\n" +
              "    version: u64,       // bumped on PCR update\n" +
              "}\n\n" +
              "// enclave.move:48-50\n" +
              "public struct Cap&lt;phantom T&gt; has key, store { id: UID }\n" +
              "</code></pre>"
          },
          {
            subtitle: "Witness-Gated Cap Creation",
            content:
              "<pre><code>" +
              "// enclave.move:60-64\n" +
              "public fun new_cap&lt;T: drop&gt;(\n" +
              "    _: T,                 // witness consumed (must be `drop`)\n" +
              "    ctx: &amp;mut TxContext,\n" +
              ") -&gt; Cap&lt;T&gt; {\n" +
              "    Cap { id: object::new(ctx) }\n" +
              "}\n" +
              "</code></pre>" +
              "<p>Only the module that defines <code>T</code> can construct a value of <code>T</code>, so " +
              "only that module can mint its <code>Cap&lt;T&gt;</code>. The cap's id is stored as " +
              "<code>EnclaveConfig.capability_id</code>, and access checks assert " +
              "<code>cap.id.to_inner() == enclave_config.capability_id</code> (abort " +
              "<code>EInvalidCap = 2</code>, enclave.move:160).</p>"
          },
          {
            subtitle: "Registration Flow & PCR Check",
            content:
              "<pre><code>" +
              "// enclave.move:85-100\n" +
              "public fun register_enclave&lt;T&gt;(\n" +
              "    enclave_config: &amp;EnclaveConfig&lt;T&gt;,\n" +
              "    document: NitroAttestationDocument,\n" +
              "    ctx: &amp;mut TxContext,\n" +
              ") {\n" +
              "    let pk = enclave_config.load_pk(&amp;document);\n" +
              "    let enclave = Enclave&lt;T&gt; {\n" +
              "        id: object::new(ctx),\n" +
              "        pk,\n" +
              "        config_version: enclave_config.version,\n" +
              "        owner: ctx.sender(),\n" +
              "    };\n" +
              "    transfer::share_object(enclave);\n" +
              "}\n\n" +
              "// enclave.move:163-167\n" +
              "fun load_pk&lt;T&gt;(\n" +
              "    enclave_config: &amp;EnclaveConfig&lt;T&gt;,\n" +
              "    document: &amp;NitroAttestationDocument,\n" +
              ") -&gt; vector&lt;u8&gt; {\n" +
              "    assert!(document.to_pcrs() == enclave_config.pcrs,\n" +
              "            EInvalidPCRs); // = 0\n" +
              "    (*document.public_key()).destroy_some()\n" +
              "}\n" +
              "</code></pre>" +
              "<p>Registration abort codes (enclave.move:15-18): " +
              "<code>EInvalidPCRs=0</code>, <code>EInvalidConfigVersion=1</code>, " +
              "<code>EInvalidCap=2</code>, <code>EInvalidOwner=3</code>.</p>"
          }
        ]
      },

      /* ───────── Off-Chain Server: Ephemeral Keypair & Signed Responses ───────── */
      {
        name: "Off-Chain Server: Ephemeral Keypair & Signed Responses",
        formalDefinition:
          "<p>The enclave runs a Rust web server holding an <strong>ephemeral Ed25519 keypair</strong> " +
          "generated at boot; the private key never leaves the enclave. It exposes " +
          "<code>GET /get_attestation</code> (one-time, returns the COSE document containing the public " +
          "key) and <code>POST /process_data</code> (wraps each result in an <code>IntentMessage</code>, " +
          "BCS-serializes, and signs it).</p>",
        mathDetails: [
          {
            subtitle: "App State & Keypair",
            content:
              "<pre><code>" +
              "// lib.rs:40-45\n" +
              "pub struct AppState {\n" +
              "    pub eph_kp: Ed25519KeyPair, // generated on boot (fastcrypto)\n" +
              "    pub api_key: String,        // for external APIs\n" +
              "}\n\n" +
              "// main.rs:16\n" +
              "let eph_kp = Ed25519KeyPair::generate(\n" +
              "    &amp;mut rand::thread_rng());\n" +
              "</code></pre>"
          },
          {
            subtitle: "IntentMessage & Signed Response",
            content:
              "<pre><code>" +
              "// common.rs:26-40 — mirrors Move (enclave.move:53-57)\n" +
              "pub struct IntentMessage&lt;T: Serialize&gt; {\n" +
              "    pub intent: u8,        // application intent code\n" +
              "    pub timestamp_ms: u64, // ms since UNIX epoch\n" +
              "    pub data: T,\n" +
              "}\n\n" +
              "// common.rs:56-71\n" +
              "pub fn to_signed_response&lt;T: Serialize + Clone&gt;(\n" +
              "    kp: &amp;Ed25519KeyPair,\n" +
              "    payload: T,\n" +
              "    timestamp_ms: u64,\n" +
              "    intent: u8,\n" +
              ") -&gt; ProcessedDataResponse&lt;IntentMessage&lt;T&gt;&gt; {\n" +
              "    let intent_msg =\n" +
              "        IntentMessage::new(payload.clone(), timestamp_ms, intent);\n" +
              "    let signing_payload =\n" +
              "        bcs::to_bytes(&amp;intent_msg).expect(\"should not fail\");\n" +
              "    let sig = kp.sign(&amp;signing_payload);\n" +
              "    ProcessedDataResponse {\n" +
              "        response: intent_msg,\n" +
              "        signature: Hex::encode(sig),\n" +
              "    }\n" +
              "}\n" +
              "</code></pre>" +
              "<p>Because BCS is canonical, the exact bytes signed here are reconstructed independently " +
              "in Move during verification — the signed bytes are never transmitted.</p>"
          },
          {
            subtitle: "GET /get_attestation (NSM driver)",
            content:
              "<pre><code>" +
              "// common.rs:82-113\n" +
              "pub async fn get_attestation(\n" +
              "    State(state): State&lt;Arc&lt;AppState&gt;&gt;,\n" +
              ") -&gt; Result&lt;Json&lt;GetAttestationResponse&gt;, EnclaveError&gt; {\n" +
              "    let pk = state.eph_kp.public();\n" +
              "    let fd = driver::nsm_init();\n" +
              "    let request = NsmRequest::Attestation {\n" +
              "        user_data: None,\n" +
              "        nonce: None,\n" +
              "        public_key: Some(ByteBuf::from(\n" +
              "            pk.as_bytes().to_vec())),\n" +
              "    };\n" +
              "    let response = driver::nsm_process_request(fd, request);\n" +
              "    // returns COSE_Sign1 over a doc containing `pk`\n" +
              "}\n" +
              "</code></pre>" +
              "<p>The NSM signs internally; only the public key crosses the enclave boundary, embedded " +
              "in the attestation document.</p>"
          }
        ]
      },

      /* ───────── On-Chain Signature Verification & Usage ───────── */
      {
        name: "On-Chain Signature Verification & Usage",
        formalDefinition:
          "<p>After registration, the chain verifies enclave outputs with a single Ed25519 check. " +
          "<code>verify_signature</code> reconstructs the <code>IntentMessage</code> on-chain, " +
          "BCS-serializes it, and verifies the signature against the registered " +
          "<code>enclave.pk</code>. There is <strong>no on-chain timestamp validation</strong> — " +
          "freshness/replay protection is delegated to the dapp.</p>",
        mathDetails: [
          {
            subtitle: "verify_signature (Move)",
            content:
              "<pre><code>" +
              "// enclave.move:102-112\n" +
              "public fun verify_signature&lt;T, P: drop&gt;(\n" +
              "    enclave: &amp;Enclave&lt;T&gt;,\n" +
              "    intent_scope: u8,\n" +
              "    timestamp_ms: u64,\n" +
              "    payload: P,\n" +
              "    signature: &amp;vector&lt;u8&gt;,\n" +
              "): bool {\n" +
              "    let intent_message =\n" +
              "        create_intent_message(intent_scope, timestamp_ms, payload);\n" +
              "    let payload = bcs::to_bytes(&amp;intent_message);\n" +
              "    ed25519::ed25519_verify(signature, &amp;enclave.pk, &amp;payload)\n" +
              "}\n" +
              "</code></pre>" +
              "<p>The function returns <code>bool</code> — callers MUST <code>assert!</code> it. The " +
              "public key compared against is the one anchored in <code>register_enclave</code>; no " +
              "per-call attestation is needed.</p>"
          },
          {
            subtitle: "Dapp Usage Pattern (weather example)",
            content:
              "<pre><code>" +
              "// weather.move:45-67\n" +
              "public fun update_weather&lt;T&gt;(\n" +
              "    location: String,\n" +
              "    temperature: u64,\n" +
              "    timestamp_ms: u64,\n" +
              "    sig: &amp;vector&lt;u8&gt;,\n" +
              "    enclave: &amp;Enclave&lt;T&gt;,\n" +
              "    ctx: &amp;mut TxContext,\n" +
              "): WeatherNFT {\n" +
              "    let res = enclave.verify_signature(\n" +
              "        WEATHER_INTENT, // = 0\n" +
              "        timestamp_ms,\n" +
              "        WeatherResponse { location, temperature },\n" +
              "        sig,\n" +
              "    );\n" +
              "    assert!(res, EInvalidSignature);\n" +
              "    // mint NFT ...\n" +
              "}\n" +
              "</code></pre>"
          },
          {
            subtitle: "End-to-End Test Walkthrough",
            content:
              "<p>The on-chain test (weather.move:69-127) shows the full lifecycle:</p>" +
              "<pre><code>" +
              "let payload = x\"8444a1013822...\"; // attestation CBOR\n" +
              "let document =\n" +
              "    nitro_attestation::load_nitro_attestation(payload, &amp;clock);\n" +
              "config.register_enclave(document, scenario.ctx());\n\n" +
              "let sig = x\"77b6d8be225440d0...\"; // Ed25519 from enclave\n" +
              "let nft = update_weather(\n" +
              "    b\"San Francisco\".to_string(),\n" +
              "    13,\n" +
              "    1744683300000, // timestamp_ms\n" +
              "    &amp;sig,\n" +
              "    &amp;enclave,\n" +
              "    scenario.ctx(),\n" +
              ");\n" +
              "</code></pre>" +
              "<p><strong>Security note:</strong> no freshness is enforced by the framework — a dapp " +
              "that wants replay protection must add e.g. " +
              "<code>assert!(timestamp_ms + WINDOW &gt; clock.timestamp_ms())</code> itself.</p>"
          }
        ]
      },

      /* ───────── ZKP + TEE Composition (Seal Integration) ───────── */
      {
        name: "ZKP + TEE Composition (Seal Integration)",
        formalDefinition:
          "<p>Nautilus (TEE) and Seal (threshold encryption / ZK-adjacent secrets) compose to give a " +
          "single signed output that proves <em>both</em> 'this came from the registered enclave' and " +
          "'the enclave ran a Seal-verified private computation'. The two trust models are complementary:</p>" +
          "<ul>" +
          "<li><strong>ZK (Seal)</strong>: root of trust = proof soundness (offline-verifiable, no trusted " +
          "party); high per-proof verification cost; hides the entire computation; composes via proof " +
          "commitments.</li>" +
          "<li><strong>TEE (Nautilus)</strong>: root of trust = AWS CA + Nitro silicon; one cert-chain " +
          "verify at registration then cheap Ed25519 per output; hides internal state and attests " +
          "enclave correctness; composes via ephemeral-key signatures.</li>" +
          "</ul>",
        mathDetails: [
          {
            subtitle: "Feature-Gated Seal Integration (Rust)",
            content:
              "<pre><code>" +
              "// lib.rs:12-34\n" +
              "#[cfg(feature = \"seal-example\")]\n" +
              "#[path = \"seal-example/mod.rs\"]\n" +
              "pub mod seal_example;\n\n" +
              "// main.rs:32-35 — two-phase bootstrap\n" +
              "#[cfg(feature = \"seal-example\")]\n" +
              "{\n" +
              "    nautilus_server::app::spawn_host_init_server(\n" +
              "        state.clone()).await?;\n" +
              "}\n" +
              "</code></pre>" +
              "<p>A host-only init server runs in parallel to the main server to inject an encrypted " +
              "secret (e.g. <code>SEAL_API_KEY</code>) before the main computation starts — decoupling " +
              "secret provisioning from the main attestation.</p>"
          },
          {
            subtitle: "Trust-Model Comparison Table",
            content:
              "<pre><code>" +
              "Dimension      | ZKP (Seal)         | TEE (Nautilus)\n" +
              "---------------+--------------------+-------------------------\n" +
              "Root of trust  | proof (offline)    | AWS CA chain + hardware\n" +
              "Verify cost    | high (per proof)   | 1x cert chain + low\n" +
              "               |                    | (Ed25519 per output)\n" +
              "Privacy        | hides computation  | hides internal state;\n" +
              "               |                    | attests correctness\n" +
              "Composability  | proof commitment   | signature (eph key)\n" +
              "</code></pre>"
          },
          {
            subtitle: "Composed Privacy-Payment Pipeline",
            content:
              "<p>The intended composition for a privacy-payment flow:</p>" +
              "<ul>" +
              "<li><strong>1.</strong> Enclave boots; generates ephemeral Ed25519 keypair.</li>" +
              "<li><strong>2.</strong> Attestation document (carrying the public key) registered on-chain " +
              "via <code>register_enclave</code>.</li>" +
              "<li><strong>3.</strong> Seal injects the encrypted secret/intent into the enclave; only the " +
              "enclave can decrypt.</li>" +
              "<li><strong>4.</strong> Enclave computes routing/settlement privately, re-encrypts output, " +
              "and signs it via <code>to_signed_response</code>.</li>" +
              "<li><strong>5.</strong> On-chain: <code>ed25519_verify</code> proves the enclave was used; an " +
              "optional Seal/ZK commitment proves the intent stayed private.</li>" +
              "</ul>" +
              "<p><strong>Caveat:</strong> composing widens the trusted computing base — soundness now " +
              "depends on <em>both</em> the hardware/CA and the proof system. The signature alone proves " +
              "authenticity, not that the private-compute branch was taken, unless that fact is explicitly " +
              "committed into the payload or <code>user_data</code>.</p>"
          }
        ]
      }
    ]
  }
};
