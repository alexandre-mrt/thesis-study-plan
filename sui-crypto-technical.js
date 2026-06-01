/**
 * On-Chain Cryptographic Primitives (Sui Move Natives) — Technical Companion
 * Deep technical details paired with SUICRYPTO_GUIDE (matched by concept .name).
 * Grounded in sui-framework sources/crypto/*.move:
 *   groth16.move, group_ops.move, bls12381.move, poseidon.move, ecvrf.move, ecdsa_k1.move
 * HTML formatting; <code> for inline Move/Rust, <pre> for blocks.
 */

window.SUICRYPTO_TECHNICAL = {
  block1: {
    concepts: [
      /* ───────── sui::groth16 ───────── */
      {
        name: "sui::groth16 — SNARK Verifier Engine",
        formalDefinition:
          "<p><code>sui::groth16</code> provides on-chain verification of " +
          "<strong>Groth16 zk-SNARK proofs</strong> over <strong>BLS12-381</strong> and " +
          "<strong>BN254</strong>. Verification is a two-phase pipeline: a one-time " +
          "<code>prepare_verifying_key</code> that precomputes circuit-dependent pairing " +
          "terms, and a per-proof <code>verify_groth16_proof</code> that runs the final " +
          "pairing equation and returns a <code>bool</code>.</p>" +
          "<ul>" +
          "<li><code>Curve { id: u8 }</code> — <code>bls12381()</code> → 0, <code>bn254()</code> → 1</li>" +
          "<li><code>PreparedVerifyingKey</code> — four byte vectors: " +
          "<code>vk_gamma_abc_g1_bytes</code>, <code>alpha_g1_beta_g2_bytes</code>, " +
          "<code>gamma_g2_neg_pc_bytes</code>, <code>delta_g2_neg_pc_bytes</code></li>" +
          "<li><code>PublicProofInputs { bytes }</code> — 1..8 field elements, 32 bytes each, little-endian</li>" +
          "<li><code>ProofPoints { bytes }</code> — three group elements (A∈G1, B∈G2, C∈G1)</li>" +
          "</ul>" +
          "<p>File: <code>sui-framework/sources/crypto/groth16.move</code> (140 lines).</p>",
        mathDetails: [
          {
            subtitle: "Public types, constants and abort codes",
            content:
              "<pre><code>" +
              "public struct Curve has copy, drop, store { id: u8 }\n" +
              "public fun bls12381(): Curve { Curve { id: 0 } }\n" +
              "public fun bn254():   Curve { Curve { id: 1 } }\n\n" +
              "public struct PreparedVerifyingKey has copy, drop, store {\n" +
              "    vk_gamma_abc_g1_bytes:   vector&lt;u8&gt;,\n" +
              "    alpha_g1_beta_g2_bytes:  vector&lt;u8&gt;,\n" +
              "    gamma_g2_neg_pc_bytes:   vector&lt;u8&gt;,\n" +
              "    delta_g2_neg_pc_bytes:   vector&lt;u8&gt;,\n" +
              "}\n\n" +
              "public struct PublicProofInputs has copy, drop, store { bytes: vector&lt;u8&gt; }\n" +
              "public struct ProofPoints       has copy, drop, store { bytes: vector&lt;u8&gt; }\n\n" +
              "const MaxPublicInputs:     u64 = 8;\n" +
              "const EInvalidVerifyingKey: u64 = 0;\n" +
              "const EInvalidCurve:        u64 = 1;\n" +
              "const ETooManyPublicInputs: u64 = 2;\n" +
              "const EInvalidScalar:       u64 = 3;\n" +
              "</code></pre>"
          },
          {
            subtitle: "Phase 1 — prepare_verifying_key (groth16.move:97-99)",
            content:
              "<p>Canonicalizes an Arkworks verifying key and precomputes the fixed pairing " +
              "terms. Aborts <code>EInvalidVerifyingKey</code> (bad encoding) or " +
              "<code>EInvalidCurve</code> (unsupported curve). Wraps the native " +
              "<code>prepare_verifying_key_internal</code>.</p>" +
              "<pre><code>" +
              "public fun prepare_verifying_key(\n" +
              "    curve: &amp;Curve,\n" +
              "    verifying_key: &amp;vector&lt;u8&gt;,\n" +
              ") : PreparedVerifyingKey {\n" +
              "    prepare_verifying_key_internal(curve.id, verifying_key)\n" +
              "}\n\n" +
              "native fun prepare_verifying_key_internal(\n" +
              "    curve: u8, verifying_key: &amp;vector&lt;u8&gt;,\n" +
              ") : PreparedVerifyingKey;\n" +
              "</code></pre>"
          },
          {
            subtitle: "Phase 2 — verify_groth16_proof (groth16.move:113-128)",
            content:
              "<p>Runs the final pairing check, returning <code>true</code> iff the proof " +
              "satisfies all circuit constraints. Aborts <code>EInvalidCurve</code> and " +
              "<code>ETooManyPublicInputs</code>. The conceptual equation is " +
              "<code>e(A,B) · e(C, δ) == e(α, β) · e(Σ vk_abc·inputs, γ)</code>.</p>" +
              "<pre><code>" +
              "public fun verify_groth16_proof(\n" +
              "    curve: &amp;Curve,\n" +
              "    prepared_verifying_key: &amp;PreparedVerifyingKey,\n" +
              "    public_proof_inputs:    &amp;PublicProofInputs,\n" +
              "    proof_points:           &amp;ProofPoints,\n" +
              ") : bool {\n" +
              "    verify_groth16_proof_internal(\n" +
              "        curve.id,\n" +
              "        &amp;prepared_verifying_key.vk_gamma_abc_g1_bytes,\n" +
              "        &amp;prepared_verifying_key.alpha_g1_beta_g2_bytes,\n" +
              "        &amp;prepared_verifying_key.gamma_g2_neg_pc_bytes,\n" +
              "        &amp;prepared_verifying_key.delta_g2_neg_pc_bytes,\n" +
              "        &amp;public_proof_inputs.bytes,\n" +
              "        &amp;proof_points.bytes,\n" +
              "    )\n" +
              "}\n" +
              "</code></pre>"
          },
          {
            subtitle: "Constructors and validation (groth16.move:44-89)",
            content:
              "<p><code>public_proof_inputs_from_bytes</code> <strong>validates</strong> that " +
              "the byte length is divisible by 32 and the element count ≤ 8 (aborts " +
              "<code>EInvalidScalar</code>, <code>ETooManyPublicInputs</code>). " +
              "<code>proof_points_from_bytes</code> is an <strong>opaque wrapper with no " +
              "validation</strong> — malformed points surface only inside the native.</p>" +
              "<pre><code>" +
              "public fun pvk_from_bytes(\n" +
              "    vk_gamma_abc_g1_bytes:  vector&lt;u8&gt;,\n" +
              "    alpha_g1_beta_g2_bytes: vector&lt;u8&gt;,\n" +
              "    gamma_g2_neg_pc_bytes:  vector&lt;u8&gt;,\n" +
              "    delta_g2_neg_pc_bytes:  vector&lt;u8&gt;,\n" +
              ") : PreparedVerifyingKey;            // line 44-56\n\n" +
              "public fun pvk_to_bytes(pvk: PreparedVerifyingKey)\n" +
              "    : vector&lt;vector&lt;u8&gt;&gt;;            // line 59-66\n\n" +
              "public fun public_proof_inputs_from_bytes(bytes: vector&lt;u8&gt;)\n" +
              "    : PublicProofInputs;             // line 75-79  (validates % 32, ≤ 8)\n\n" +
              "public fun proof_points_from_bytes(bytes: vector&lt;u8&gt;)\n" +
              "    : ProofPoints;                   // line 87-89  (no validation)\n" +
              "</code></pre>" +
              "<p>Gas note: a single pairing ≈ 5-10M gas; full Groth16 verification (two " +
              "pairings) ≈ 20-30M gas. Prepare the key once and store the " +
              "<code>PreparedVerifyingKey</code>.</p>"
          }
        ]
      },
      /* ───────── sui::group_ops ───────── */
      {
        name: "sui::group_ops — Generic Group Arithmetic (Element<T>)",
        formalDefinition:
          "<p><code>sui::group_ops</code> is the low-level, <code>Element&lt;T&gt;</code>-typed " +
          "elliptic-curve arithmetic layer backing all pairing-based cryptography on Sui. " +
          "It is a type-safe Move wrapper over fastcrypto native calls: the " +
          "<strong>phantom type parameter <code>T</code></strong> enforces group discipline at " +
          "compile time, while a runtime <code>type_: u8</code> discriminator tells the native " +
          "which group it is operating in.</p>" +
          "<pre><code>" +
          "public struct Element&lt;phantom T&gt; has copy, drop, store {\n" +
          "    bytes: vector&lt;u8&gt;,\n" +
          "}\n" +
          "</code></pre>" +
          "<p>File: <code>sui-framework/sources/crypto/group_ops.move</code> (150 lines).</p>",
        mathDetails: [
          {
            subtitle: "Accessors, validation and the group law",
            content:
              "<pre><code>" +
              "public fun bytes&lt;G&gt;(e: &amp;Element&lt;G&gt;): &amp;vector&lt;u8&gt;     // 26-28\n" +
              "public fun equal&lt;G&gt;(e1: &amp;Element&lt;G&gt;, e2: &amp;Element&lt;G&gt;): bool // 30-32\n\n" +
              "public fun from_bytes&lt;G&gt;(\n" +
              "    type_: u8, bytes: vector&lt;u8&gt;, is_trusted: bool,\n" +
              ") : Element&lt;G&gt; {                                  // 35-38\n" +
              "    if (!is_trusted) {\n" +
              "        assert!(internal_validate(type_, &amp;bytes), EInvalidInput);\n" +
              "    };\n" +
              "    Element&lt;G&gt; { bytes }\n" +
              "}\n\n" +
              "public fun add&lt;G&gt;(type_: u8, e1: &amp;Element&lt;G&gt;, e2: &amp;Element&lt;G&gt;): Element&lt;G&gt; // 40-42\n" +
              "public fun sub&lt;G&gt;(type_: u8, e1: &amp;Element&lt;G&gt;, e2: &amp;Element&lt;G&gt;): Element&lt;G&gt; // 44-46\n" +
              "public fun mul&lt;S, G&gt;(type_: u8, scalar: &amp;Element&lt;S&gt;, e: &amp;Element&lt;G&gt;): Element&lt;G&gt; // 48-50\n" +
              "public fun div&lt;S, G&gt;(type_: u8, scalar: &amp;Element&lt;S&gt;, e: &amp;Element&lt;G&gt;): Element&lt;G&gt; // 53-55 (aborts if scalar = 0)\n" +
              "</code></pre>" +
              "<p><code>div</code> aborts implicitly when the scalar is zero (fastcrypto field " +
              "inversion failure). <code>from_bytes</code> with <code>is_trusted = true</code> " +
              "skips validation entirely.</p>"
          },
          {
            subtitle: "hash_to, MSM, pairing, convert, sum",
            content:
              "<pre><code>" +
              "public fun hash_to&lt;G&gt;(type_: u8, m: &amp;vector&lt;u8&gt;): Element&lt;G&gt; // 57-59\n\n" +
              "public fun multi_scalar_multiplication&lt;S, G&gt;(   // 64-83\n" +
              "    type_: u8,\n" +
              "    scalars:  &amp;vector&lt;Element&lt;S&gt;&gt;,\n" +
              "    elements: &amp;vector&lt;Element&lt;G&gt;&gt;,\n" +
              ") : Element&lt;G&gt; {\n" +
              "    assert!(scalars.length() &gt; 0, EInvalidInput);\n" +
              "    assert!(scalars.length() == elements.length(), EInvalidInput);\n" +
              "    // aborts EInputTooLong if length &gt; 32 (current limit)\n" +
              "    // returns s1*e1 + s2*e2 + ... + sn*en\n" +
              "}\n\n" +
              "public fun pairing&lt;G1, G2, G3&gt;(\n" +
              "    type_: u8, e1: &amp;Element&lt;G1&gt;, e2: &amp;Element&lt;G2&gt;,\n" +
              ") : Element&lt;G3&gt;                                  // 85-91  (target group GT)\n\n" +
              "public fun convert&lt;From, To&gt;(\n" +
              "    from_type_: u8, to_type_: u8, e: &amp;Element&lt;From&gt;,\n" +
              ") : Element&lt;To&gt;                                  // 93-99\n\n" +
              "public fun sum&lt;G&gt;(type_: u8, terms: &amp;vector&lt;Element&lt;G&gt;&gt;): Element&lt;G&gt; // 101-103\n" +
              "</code></pre>"
          },
          {
            subtitle: "Error codes and helpers",
            content:
              "<pre><code>" +
              "const ENotSupported:        u64 = 0;\n" +
              "const EInvalidInput:        u64 = 1;\n" +
              "const EInputTooLong:        u64 = 2;\n" +
              "const EInvalidBufferLength:  u64 = 3;\n\n" +
              "// test/encoding helper (135-149): u64 → 8 big/little-endian bytes\n" +
              "fun set_as_prefix(x: u64, big_endian: bool, buffer: &amp;mut vector&lt;u8&gt;) {\n" +
              "    assert!(buffer.length() &gt; 7, EInvalidBufferLength);\n" +
              "    // ...\n" +
              "}\n" +
              "</code></pre>" +
              "<p><strong>Trust caveat:</strong> the phantom <code>T</code> and the runtime " +
              "<code>type_: u8</code> are not cross-validated by Move; mismatches abort only " +
              "inside the native. All real arithmetic is delegated to audited Rust " +
              "(fastcrypto <code>internal_*</code> functions).</p>"
          }
        ]
      },
      /* ───────── sui::bls12381 ───────── */
      {
        name: "sui::bls12381 — Typed BLS12-381 Curve Operations",
        formalDefinition:
          "<p><code>sui::bls12381</code> provides high-level, typed wrappers over " +
          "<code>group_ops</code> specialized for the <strong>BLS12-381</strong> curve, plus " +
          "two native signature-verification functions. Each algebraic domain is a distinct " +
          "Move type — <code>Scalar</code> (Fr, 32B), <code>G1</code> (48B compressed), " +
          "<code>G2</code> (96B compressed), <code>GT</code> (≈384B), " +
          "<code>UncompressedG1</code> — so the compiler enforces correct algebra.</p>" +
          "<pre><code>" +
          "const SCALAR_TYPE:          u8 = 0;\n" +
          "const G1_TYPE:              u8 = 1;\n" +
          "const G2_TYPE:              u8 = 2;\n" +
          "const GT_TYPE:              u8 = 3;\n" +
          "const UNCOMPRESSED_G1_TYPE:  u8 = 4;\n" +
          "</code></pre>" +
          "<p>File: <code>sui-framework/sources/crypto/bls12381.move</code> (283 lines). Ships " +
          "byte constants for generators and identities of Scalar / G1 / G2 / GT (big-endian).</p>",
        mathDetails: [
          {
            subtitle: "Native signature verification (bls12381.move:15-31)",
            content:
              "<p>These are <strong>not</strong> <code>Element</code>-based — they take raw " +
              "byte vectors. <code>min_sig</code> places the signature on G1 (48B) and the key " +
              "on G2 (96B); <code>min_pk</code> reverses it.</p>" +
              "<pre><code>" +
              "public native fun bls12381_min_sig_verify(\n" +
              "    signature:  &amp;vector&lt;u8&gt;,   // 48 bytes, point on G1\n" +
              "    public_key: &amp;vector&lt;u8&gt;,   // 96 bytes, point on G2\n" +
              "    msg:        &amp;vector&lt;u8&gt;,\n" +
              ") : bool;  // DST: BLS_SIG_BLS12381G1_XMD:SHA-256_SSWU_RO_NUL_\n\n" +
              "public native fun bls12381_min_pk_verify(\n" +
              "    signature:  &amp;vector&lt;u8&gt;,   // 96 bytes, point on G2\n" +
              "    public_key: &amp;vector&lt;u8&gt;,   // 48 bytes, point on G1\n" +
              "    msg:        &amp;vector&lt;u8&gt;,\n" +
              ") : bool;  // DST: BLS_SIG_BLS12381G2_XMD:SHA-256_SSWU_RO_NUL_\n" +
              "</code></pre>"
          },
          {
            subtitle: "Scalar field Fr (bls12381.move:80-122)",
            content:
              "<pre><code>" +
              "public fun scalar_from_bytes(bytes: &amp;vector&lt;u8&gt;): Element&lt;Scalar&gt;\n" +
              "public fun scalar_from_u64(x: u64):           Element&lt;Scalar&gt;\n" +
              "public fun scalar_zero(): Element&lt;Scalar&gt;\n" +
              "public fun scalar_one():  Element&lt;Scalar&gt;\n" +
              "public fun scalar_add(e1, e2): Element&lt;Scalar&gt;\n" +
              "public fun scalar_sub(e1, e2): Element&lt;Scalar&gt;\n" +
              "public fun scalar_mul(e1, e2): Element&lt;Scalar&gt;\n" +
              "public fun scalar_div(e1, e2): Element&lt;Scalar&gt;  // aborts if e1 = 0\n" +
              "public fun scalar_neg(e):      Element&lt;Scalar&gt;\n" +
              "public fun scalar_inv(e):      Element&lt;Scalar&gt;  // aborts if e = 0\n" +
              "</code></pre>"
          },
          {
            subtitle: "G1 / G2 / GT and pairing (bls12381.move:127-282)",
            content:
              "<pre><code>" +
              "// G1 (48-byte compressed), lines 127-178\n" +
              "public fun g1_generator(): Element&lt;G1&gt;\n" +
              "public fun g1_identity():  Element&lt;G1&gt;\n" +
              "public fun g1_add/g1_sub/g1_neg(...): Element&lt;G1&gt;\n" +
              "public fun g1_mul(scalar: Element&lt;Scalar&gt;, e: Element&lt;G1&gt;): Element&lt;G1&gt;\n" +
              "public fun g1_div(scalar, e): Element&lt;G1&gt;       // aborts if scalar = 0\n" +
              "public fun hash_to_g1(m: &amp;vector&lt;u8&gt;): Element&lt;G1&gt;\n" +
              "public fun g1_multi_scalar_multiplication(\n" +
              "    scalars:  &amp;vector&lt;Element&lt;Scalar&gt;&gt;,\n" +
              "    elements: &amp;vector&lt;Element&lt;G1&gt;&gt;,\n" +
              ") : Element&lt;G1&gt;                                  // aborts if len &gt; 32\n" +
              "public fun g1_to_uncompressed_g1(e): Element&lt;UncompressedG1&gt;\n\n" +
              "// G2 (96-byte compressed), lines 183-229  — symmetric API + hash_to_g2\n" +
              "// GT (≈384-byte), lines 234-261 — gt_add/sub/mul/div/neg (div aborts if scalar = 0)\n\n" +
              "// Pairing + conversion, lines 266-282\n" +
              "public fun pairing(e1: &amp;Element&lt;G1&gt;, e2: &amp;Element&lt;G2&gt;): Element&lt;GT&gt;\n" +
              "public fun uncompressed_g1_to_g1(e: &amp;Element&lt;UncompressedG1&gt;): Element&lt;G1&gt;\n" +
              "public fun uncompressed_g1_sum(\n" +
              "    terms: &amp;vector&lt;Element&lt;UncompressedG1&gt;&gt;,\n" +
              ") : Element&lt;UncompressedG1&gt;\n" +
              "</code></pre>" +
              "<p>hash_to_g1 DST: <code>BLS_SIG_BLS12381G1_XMD:SHA-256_SSWU_RO_NUL_</code>; " +
              "hash_to_g2 DST: the G2 variant. A single on-chain <code>pairing</code> ≈ 5-10M gas.</p>"
          }
        ]
      },
      /* ───────── sui::poseidon ───────── */
      {
        name: "sui::poseidon — ZK-Friendly Hash (BN254)",
        formalDefinition:
          "<p><code>sui::poseidon</code> exposes the <strong>Poseidon</strong> hash over the " +
          "<strong>BN254 scalar field</strong>. It hashes 1..16 field elements (as " +
          "<code>u256</code>) into a single <code>u256</code> digest, and is optimized for " +
          "zero-knowledge circuits: pure field arithmetic, no bitwise operations, so the same " +
          "hash that runs on-chain costs only a handful of constraints in a SNARK.</p>" +
          "<ul>" +
          "<li><code>public fun poseidon_bn254(data: &amp;vector&lt;u256&gt;): u256</code></li>" +
          "<li><code>MAX_INPUTS = 16</code>; at least one input required</li>" +
          "<li>Every input must be strictly less than the BN254 field modulus</li>" +
          "</ul>" +
          "<p>File: <code>sui-framework/sources/crypto/poseidon.move</code> (53 lines).</p>",
        mathDetails: [
          {
            subtitle: "Constants and abort codes",
            content:
              "<pre><code>" +
              "const BN254_MAX: u256 =\n" +
              "  21888242871839275222246405745257275088548364400416034343698204186575808495617u256;\n" +
              "const MAX_INPUTS:        u64 = 16;\n" +
              "const ENonCanonicalInput: u64 = 0;\n" +
              "const EEmptyInput:        u64 = 1;\n" +
              "const ETooManyInputs:     u64 = 2;\n" +
              "</code></pre>"
          },
          {
            subtitle: "poseidon_bn254 — validation + native (poseidon.move:38-52)",
            content:
              "<p>Rejects empty input (<code>EEmptyInput</code>), &gt;16 inputs " +
              "(<code>ETooManyInputs</code>), and any non-canonical element ≥ field modulus " +
              "(<code>ENonCanonicalInput</code>). Each element is BCS-serialized to " +
              "little-endian <code>u256</code> bytes, hashed by the native sponge, and parsed " +
              "back to <code>u256</code>.</p>" +
              "<pre><code>" +
              "public fun poseidon_bn254(data: &amp;vector&lt;u256&gt;): u256 {\n" +
              "    assert!(data.length() &gt; 0,           EEmptyInput);\n" +
              "    assert!(data.length() &lt;= MAX_INPUTS, ETooManyInputs);\n" +
              "    let b = data.map_ref!(|e| {\n" +
              "        assert!(*e &lt; BN254_MAX, ENonCanonicalInput);\n" +
              "        bcs::to_bytes(e)\n" +
              "    });\n" +
              "    let binary_output = poseidon_bn254_internal(&amp;b);\n" +
              "    bcs::new(binary_output).peel_u256()\n" +
              "}\n\n" +
              "native fun poseidon_bn254_internal(\n" +
              "    data: &amp;vector&lt;vector&lt;u8&gt;&gt;,\n" +
              ") : vector&lt;u8&gt;;\n" +
              "</code></pre>" +
              "<p>Gas note: a Poseidon hash of up to 16 inputs is on the order of ~100-200K " +
              "gas (estimate, varies by input count) — cheap relative to a pairing.</p>"
          }
        ]
      },
      /* ───────── sui::ecvrf ───────── */
      {
        name: "sui::ecvrf — Verifiable Random Function (Ristretto255)",
        formalDefinition:
          "<p><code>sui::ecvrf</code> verifies an <strong>Elliptic Curve Verifiable Random " +
          "Function</strong> over <strong>Ristretto255</strong>. A single native, " +
          "<code>ecvrf_verify</code>, checks that a claimed 64-byte output is the unique " +
          "correct VRF output for a given input seed and public key. Ristretto255 (a " +
          "prime-order quotient of Curve25519) means no pairings and cheap verification.</p>" +
          "<p>File: <code>sui-framework/sources/crypto/ecvrf.move</code> (23 lines).</p>",
        mathDetails: [
          {
            subtitle: "ecvrf_verify and abort codes (ecvrf.move:6-23)",
            content:
              "<pre><code>" +
              "const EInvalidHashLength:         u64 = 1;  // output != 64 bytes\n" +
              "const EInvalidPublicKeyEncoding:  u64 = 2;  // not a valid Ristretto255 point\n" +
              "const EInvalidProofEncoding:      u64 = 3;  // malformed proof\n\n" +
              "public native fun ecvrf_verify(\n" +
              "    hash:         &amp;vector&lt;u8&gt;,   // VRF output, 64 bytes\n" +
              "    alpha_string: &amp;vector&lt;u8&gt;,   // input seed\n" +
              "    public_key:   &amp;vector&lt;u8&gt;,   // Ristretto255 public key, 32 bytes\n" +
              "    proof:        &amp;vector&lt;u8&gt;,   // VRF proof, 80 bytes\n" +
              ") : bool;\n" +
              "</code></pre>" +
              "<p>The native reconstructs the VRF proof point from <code>hash</code>, " +
              "<code>proof</code> and <code>public_key</code>, checks it against the challenge " +
              "derived from <code>alpha_string</code>, and returns <code>true</code> iff all " +
              "checks pass. Because the output is unique per (seed, key), even the secret-key " +
              "holder cannot bias it — the basis for unbiasable on-chain randomness.</p>"
          }
        ]
      },
      /* ───────── sui::ecdsa_k1 ───────── */
      {
        name: "sui::ecdsa_k1 — secp256k1 ECDSA & Recovery",
        formalDefinition:
          "<p><code>sui::ecdsa_k1</code> provides <strong>ECDSA over secp256k1</strong> " +
          "(Bitcoin/Ethereum-compatible): public-key recovery from a signature, signature " +
          "verification against a known key, and public-key decompression. Messages are " +
          "hashed inside the native (selector: <code>KECCAK256 = 0</code> or " +
          "<code>SHA256 = 1</code>), not pre-hashed.</p>" +
          "<p>File: <code>sui-framework/sources/crypto/ecdsa_k1.move</code> (115 lines).</p>",
        mathDetails: [
          {
            subtitle: "Constants and abort codes",
            content:
              "<pre><code>" +
              "const KECCAK256: u8 = 0;\n" +
              "const SHA256:    u8 = 1;\n\n" +
              "const EFailToRecoverPubKey: u64 = 0;\n" +
              "const EInvalidSignature:    u64 = 1;\n" +
              "const EInvalidPubKey:       u64 = 2;\n" +
              "</code></pre>"
          },
          {
            subtitle: "ecrecover, decompress, verify (ecdsa_k1.move:49-75)",
            content:
              "<pre><code>" +
              "// 65-byte (r,s,v) signature + raw msg → 65-byte uncompressed pubkey (04||X||Y)\n" +
              "public native fun secp256k1_ecrecover(\n" +
              "    signature: &amp;vector&lt;u8&gt;,   // 65 bytes (r,s,v), v in {0,1,2,3}\n" +
              "    msg:       &amp;vector&lt;u8&gt;,\n" +
              "    hash:      u8,             // KECCAK256 | SHA256\n" +
              ") : vector&lt;u8&gt;;  // aborts EFailToRecoverPubKey | EInvalidSignature\n\n" +
              "// 33-byte compressed (02/03 parity) → 65-byte uncompressed\n" +
              "public native fun decompress_pubkey(\n" +
              "    pubkey: &amp;vector&lt;u8&gt;,\n" +
              ") : vector&lt;u8&gt;;  // aborts EInvalidPubKey\n\n" +
              "// 64-byte (r,s) signature + 33-byte compressed key → bool (silent false)\n" +
              "public native fun secp256k1_verify(\n" +
              "    signature:  &amp;vector&lt;u8&gt;,   // 64 bytes (r,s), non-recoverable\n" +
              "    public_key: &amp;vector&lt;u8&gt;,   // 33 bytes compressed\n" +
              "    msg:        &amp;vector&lt;u8&gt;,\n" +
              "    hash:       u8,\n" +
              ") : bool;\n" +
              "</code></pre>"
          },
          {
            subtitle: "Test-only signing primitives (ecdsa_k1.move:87-114)",
            content:
              "<p>These are gated <code>#[test_only]</code> and must never appear in a " +
              "production contract.</p>" +
              "<pre><code>" +
              "#[test_only]\n" +
              "public native fun secp256k1_sign(\n" +
              "    private_key: &amp;vector&lt;u8&gt;,  // 32 bytes\n" +
              "    msg:         &amp;vector&lt;u8&gt;,\n" +
              "    hash:        u8,\n" +
              "    recoverable: bool,\n" +
              ") : vector&lt;u8&gt;;\n\n" +
              "#[test_only]\n" +
              "public native fun secp256k1_keypair_from_seed(\n" +
              "    seed: &amp;vector&lt;u8&gt;,\n" +
              ") : KeyPair;\n" +
              "</code></pre>" +
              "<p>Note: <code>secp256k1_verify</code> returns <code>false</code> on a bad " +
              "signature rather than aborting — callers must assert on the boolean. ECDSA is " +
              "malleable (s vs -s) and has no native aggregation.</p>"
          }
        ]
      }
    ]
  }
};
