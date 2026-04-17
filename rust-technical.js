/**
 * Rust Technical Companion — Production Rust & Crypto Codebases
 * Deep technical details paired with RUST_GUIDE.
 * Uses HTML for formatting; <code> for inline Rust, <pre> for blocks.
 */

window.RUST_TECHNICAL = {
  block1: {
    concepts: [
      /* ───────── fastcrypto (Mysten Labs) ───────── */
      {
        name: "fastcrypto (Mysten Labs)",
        formalDefinition:
          "<p>fastcrypto organizes cryptographic primitives around a <strong>trait hierarchy</strong> " +
          "that enforces uniform APIs across all signature schemes:</p>" +
          "<ul>" +
          "<li><code>trait Signer</code> — produces a signature from a message</li>" +
          "<li><code>trait Verifier</code> — verifies a signature against a public key</li>" +
          "<li><code>trait KeyPair</code> — associates <code>type PubKey</code>, " +
          "<code>type PrivKey</code>, and <code>type Sig</code></li>" +
          "<li><code>trait AggregateAuthenticator</code> — batch verification " +
          "and signature aggregation (used by BLS12-381)</li>" +
          "</ul>" +
          "<p>Every concrete scheme (Ed25519, Secp256k1, BLS12-381, etc.) implements " +
          "these traits, enabling generic code that works across all backends.</p>",
        mathDetails: [
          {
            subtitle: "Trait Design Patterns",
            content:
              "<p>The core trait signatures that define fastcrypto's abstraction layer:</p>" +
              "<pre><code>" +
              "pub trait ToFromBytes: Sized {\n" +
              "    fn from_bytes(bytes: &amp;[u8]) -&gt; Result&lt;Self, FastCryptoError&gt;;\n" +
              "    fn as_bytes(&amp;self) -&gt; &amp;[u8];\n" +
              "}\n\n" +
              "pub trait Signer&lt;Sig&gt; {\n" +
              "    fn sign(&amp;self, msg: &amp;[u8]) -&gt; Sig;\n" +
              "}\n\n" +
              "pub trait Verifier&lt;Sig&gt; {\n" +
              "    fn verify(&amp;self, msg: &amp;[u8], signature: &amp;Sig)\n" +
              "        -&gt; Result&lt;(), FastCryptoError&gt;;\n" +
              "}\n\n" +
              "pub trait KeyPair:\n" +
              "    Sized + From&lt;Self::PrivKey&gt; + Signer&lt;Self::Sig&gt;\n" +
              "{\n" +
              "    type PubKey: Verifier&lt;Self::Sig&gt; + Clone;\n" +
              "    type PrivKey: Signer&lt;Self::Sig&gt;;\n" +
              "    type Sig: Authenticator&lt;PubKey = Self::PubKey&gt;;\n" +
              "    fn public(&amp;self) -&gt; &amp;Self::PubKey;\n" +
              "}\n\n" +
              "pub trait AggregateAuthenticator {\n" +
              "    type Sig: Authenticator;\n" +
              "    type PubKey: Verifier&lt;Self::Sig&gt;;\n" +
              "    fn aggregate&lt;'a&gt;(\n" +
              "        signatures: impl IntoIterator&lt;Item = &amp;'a Self::Sig&gt;\n" +
              "    ) -&gt; Result&lt;Self, FastCryptoError&gt; where Self::Sig: 'a;\n" +
              "    fn verify(\n" +
              "        &amp;self,\n" +
              "        pks: &amp;[&lt;Self::Sig as Authenticator&gt;::PubKey],\n" +
              "        messages: &amp;[&amp;[u8]],\n" +
              "    ) -&gt; Result&lt;(), FastCryptoError&gt;;\n" +
              "}" +
              "</code></pre>" +
              "<p>The <code>Authenticator</code> trait bridges signatures back to their " +
              "public key type via an associated type, enabling the compiler to enforce " +
              "that you never mix Ed25519 signatures with BLS public keys.</p>"
          },
          {
            subtitle: "Pedersen Module",
            content:
              "<p>fastcrypto implements Pedersen commitments over the <strong>Ristretto group</strong> " +
              "(a prime-order group built on Curve25519, eliminating cofactor issues).</p>" +
              "<p>Core API surface:</p>" +
              "<pre><code>" +
              "// Pedersen commitment: C = v*G + r*H\n" +
              "pub struct PedersenCommitment {\n" +
              "    point: RistrettoPoint,\n" +
              "}\n\n" +
              "impl PedersenCommitment {\n" +
              "    /// Create a commitment to value `v` with blinding `r`\n" +
              "    pub fn new(\n" +
              "        value: &amp;[u8],\n" +
              "        blinding: &amp;Scalar,\n" +
              "    ) -&gt; Self;\n\n" +
              "    /// Verify that a commitment opens to (value, blinding)\n" +
              "    pub fn verify(\n" +
              "        &amp;self,\n" +
              "        value: &amp;[u8],\n" +
              "        blinding: &amp;Scalar,\n" +
              "    ) -&gt; bool;\n" +
              "}" +
              "</code></pre>" +
              "<p><strong>Homomorphic property:</strong> " +
              "<code>C(v1, r1) + C(v2, r2) = C(v1+v2, r1+r2)</code>. " +
              "This is exploited in confidential transactions where input commitments " +
              "must sum to output commitments without revealing amounts.</p>" +
              "<p>The module uses <code>curve25519-dalek</code> as its backend, inheriting " +
              "constant-time scalar multiplication and compressed point serialization.</p>"
          },
          {
            subtitle: "Bulletproofs Module",
            content:
              "<p>fastcrypto wraps the <code>bulletproofs</code> crate (dalek) to provide " +
              "range proofs that a committed value lies in <code>[0, 2^n)</code>:</p>" +
              "<pre><code>" +
              "pub struct BulletproofsRangeProof {\n" +
              "    proof: RangeProof,\n" +
              "}\n\n" +
              "impl BulletproofsRangeProof {\n" +
              "    /// Prove that `value` lies in [0, 2^bit_length)\n" +
              "    pub fn prove_bit_length(\n" +
              "        value: u64,\n" +
              "        blinding: &amp;Scalar,\n" +
              "        bit_length: usize,  // e.g., 32 or 64\n" +
              "    ) -&gt; Result&lt;(Self, PedersenCommitment), FastCryptoError&gt;;\n\n" +
              "    /// Verify a range proof against a commitment\n" +
              "    pub fn verify_bit_length(\n" +
              "        &amp;self,\n" +
              "        commitment: &amp;PedersenCommitment,\n" +
              "        bit_length: usize,\n" +
              "    ) -&gt; Result&lt;(), FastCryptoError&gt;;\n" +
              "}" +
              "</code></pre>" +
              "<p><strong>Proof sizes:</strong> Bulletproofs produce logarithmic-size proofs " +
              "(~672 bytes for 64-bit range), compared to ~4 KB for a Sigma protocol range " +
              "proof. Verification is slower than Groth16 but requires <strong>no trusted " +
              "setup</strong>.</p>" +
              "<p><strong>Aggregation:</strong> Multiple range proofs can be aggregated " +
              "into a single proof that is only marginally larger, critical for " +
              "transactions with multiple outputs.</p>"
          }
        ],
        practicalNotes:
          "<p><strong>Adding a new signature scheme to fastcrypto:</strong></p>" +
          "<ol>" +
          "<li>Create a new module under <code>fastcrypto/src/</code> (e.g., " +
          "<code>my_scheme.rs</code>)</li>" +
          "<li>Define <code>MySchemeKeyPair</code>, <code>MySchemePublicKey</code>, " +
          "<code>MySchemePrivateKey</code>, <code>MySchemeSignature</code></li>" +
          "<li>Implement <code>ToFromBytes</code> for all four types</li>" +
          "<li>Implement <code>Signer&lt;MySchemeSignature&gt;</code> for the private key</li>" +
          "<li>Implement <code>Verifier&lt;MySchemeSignature&gt;</code> for the public key</li>" +
          "<li>Implement <code>KeyPair</code> with associated types pointing to the above</li>" +
          "<li>Add <code>proptest</code> strategies for random key generation</li>" +
          "<li>Test roundtrip: <code>sign -> verify</code> succeeds, " +
          "<code>sign -> corrupt -> verify</code> fails</li>" +
          "</ol>" +
          "<p><strong>Testing patterns (proptest):</strong></p>" +
          "<pre><code>" +
          "use proptest::prelude::*;\n\n" +
          "proptest! {\n" +
          "    #[test]\n" +
          "    fn sign_verify_roundtrip(\n" +
          "        msg in prop::collection::vec(any::&lt;u8&gt;(), 0..1024)\n" +
          "    ) {\n" +
          "        let kp = Ed25519KeyPair::generate(&amp;mut OsRng);\n" +
          "        let sig = kp.sign(&amp;msg);\n" +
          "        prop_assert!(kp.public().verify(&amp;msg, &amp;sig).is_ok());\n" +
          "    }\n" +
          "}" +
          "</code></pre>",
        exercises: [
          {
            type: "design",
            question:
              "Design a trait extension for ElGamal auditor key encryption that " +
              "fits fastcrypto's existing trait hierarchy. What new traits would " +
              "you introduce? How would they compose with Signer/Verifier?"
          },
          {
            type: "calculation",
            question:
              "Using fastcrypto's Pedersen commitment API, compute C = 42*G + r*H " +
              "and verify it opens correctly. Write the Rust code using " +
              "BulletproofsRangeProof::prove_bit_length and then verify."
          },
          {
            type: "comparison",
            question:
              "Compare fastcrypto's Bulletproofs API with dalek-cryptography/bulletproofs. " +
              "What does fastcrypto abstract away? What flexibility do you lose?"
          }
        ]
      },

      /* ───────── Rust Crypto Patterns ───────── */
      {
        name: "Rust Crypto Patterns",
        formalDefinition:
          "<p>Production cryptographic Rust requires three pillars of defensive coding:</p>" +
          "<ul>" +
          "<li><strong>Constant-time operations:</strong> All comparisons and branches " +
          "on secret data must execute in time independent of the secret values. " +
          "The <code>subtle</code> crate provides <code>ConstantTimeEq</code>, " +
          "<code>ConditionallySelectable</code>, and <code>Choice</code> types.</li>" +
          "<li><strong>Secure memory:</strong> The <code>zeroize</code> crate's " +
          "<code>Zeroize</code> and <code>ZeroizeOnDrop</code> traits ensure secret " +
          "material is overwritten when no longer needed, using compiler barriers " +
          "to prevent dead-store elimination.</li>" +
          "<li><strong>Error handling taxonomy:</strong> " +
          "<code>thiserror</code> for typed, matchable library errors; " +
          "<code>anyhow</code> for ergonomic application/test error propagation. " +
          "Crypto errors must never leak secret-dependent information in messages.</li>" +
          "</ul>",
        mathDetails: [
          {
            subtitle: "Constant-Time Operations",
            content:
              "<p><strong>Timing side channels</strong> arise when execution time depends on " +
              "secret values. A classic example:</p>" +
              "<pre><code>" +
              "// VULNERABLE: early return leaks byte position\n" +
              "fn insecure_compare(a: &amp;[u8], b: &amp;[u8]) -&gt; bool {\n" +
              "    if a.len() != b.len() { return false; }\n" +
              "    for i in 0..a.len() {\n" +
              "        if a[i] != b[i] { return false; } // leaks index i\n" +
              "    }\n" +
              "    true\n" +
              "}" +
              "</code></pre>" +
              "<p>An attacker measuring response times can deduce each byte sequentially, " +
              "reducing a brute-force attack from <code>O(2^(8n))</code> to " +
              "<code>O(8n * 256)</code> = <code>O(n)</code>.</p>" +
              "<p><strong>Correct approach</strong> using the <code>subtle</code> crate:</p>" +
              "<pre><code>" +
              "use subtle::ConstantTimeEq;\n\n" +
              "fn secure_compare(a: &amp;[u8], b: &amp;[u8]) -&gt; bool {\n" +
              "    // ct_eq returns a Choice, not bool.\n" +
              "    // All bytes are always compared.\n" +
              "    a.ct_eq(b).into()\n" +
              "}" +
              "</code></pre>" +
              "<p>The <code>Choice</code> type is a <code>u8</code> that is always 0 or 1 " +
              "and supports <code>ConditionallySelectable</code> for branchless assignment:</p>" +
              "<pre><code>" +
              "use subtle::{ConditionallySelectable, Choice};\n\n" +
              "let mut result = Scalar::zero();\n" +
              "// Branchless: assigns secret_val if choice==1, keeps result if choice==0\n" +
              "result.conditional_assign(&amp;secret_val, choice);" +
              "</code></pre>"
          },
          {
            subtitle: "Secure Memory",
            content:
              "<p>The <code>zeroize</code> crate solves a subtle problem: compiler " +
              "optimizations can remove memory-clearing code as a \"dead store\" " +
              "if the buffer is never read again.</p>" +
              "<pre><code>" +
              "// BROKEN: compiler may optimize this away\n" +
              "fn naive_clear(secret: &amp;mut [u8; 32]) {\n" +
              "    for byte in secret.iter_mut() {\n" +
              "        *byte = 0; // dead store — buffer is dropped next\n" +
              "    }\n" +
              "}\n\n" +
              "// CORRECT: zeroize uses a compiler fence\n" +
              "use zeroize::{Zeroize, ZeroizeOnDrop};\n\n" +
              "#[derive(Zeroize, ZeroizeOnDrop)]\n" +
              "struct PrivateKey {\n" +
              "    scalar: [u8; 32],\n" +
              "}\n" +
              "// When PrivateKey is dropped, scalar is zeroed\n" +
              "// via core::ptr::write_volatile + compiler fence" +
              "</code></pre>" +
              "<p><code>zeroize</code> works by using <code>core::ptr::write_volatile</code> " +
              "followed by a compiler fence (<code>core::sync::atomic::compiler_fence</code>), " +
              "which tells the compiler it must not reorder or eliminate the write.</p>" +
              "<p><strong>Pattern in fastcrypto:</strong> All private key types derive " +
              "<code>ZeroizeOnDrop</code>. Any struct holding secret material " +
              "(blinding factors, nonces) should do the same.</p>"
          },
          {
            subtitle: "Property-Based Testing for Crypto",
            content:
              "<p><code>proptest</code> generates random inputs and checks invariants " +
              "hold for all of them, far more thorough than hand-picked test cases:</p>" +
              "<pre><code>" +
              "use proptest::prelude::*;\n" +
              "use fastcrypto::ed25519::*;\n\n" +
              "proptest! {\n" +
              "    // Property: sign-verify roundtrip always succeeds\n" +
              "    #[test]\n" +
              "    fn sign_verify_roundtrip(\n" +
              "        msg in prop::collection::vec(any::&lt;u8&gt;(), 0..2048)\n" +
              "    ) {\n" +
              "        let kp = Ed25519KeyPair::generate(&amp;mut OsRng);\n" +
              "        let sig = kp.sign(&amp;msg);\n" +
              "        prop_assert!(kp.public().verify(&amp;msg, &amp;sig).is_ok());\n" +
              "    }\n\n" +
              "    // Property: wrong key always rejects\n" +
              "    #[test]\n" +
              "    fn wrong_key_rejects(\n" +
              "        msg in prop::collection::vec(any::&lt;u8&gt;(), 1..2048)\n" +
              "    ) {\n" +
              "        let kp1 = Ed25519KeyPair::generate(&amp;mut OsRng);\n" +
              "        let kp2 = Ed25519KeyPair::generate(&amp;mut OsRng);\n" +
              "        let sig = kp1.sign(&amp;msg);\n" +
              "        // Different key must reject\n" +
              "        prop_assert!(kp2.public().verify(&amp;msg, &amp;sig).is_err());\n" +
              "    }\n\n" +
              "    // Property: Pedersen commitment homomorphism\n" +
              "    #[test]\n" +
              "    fn pedersen_homomorphic(\n" +
              "        v1 in 0u64..u32::MAX as u64,\n" +
              "        v2 in 0u64..u32::MAX as u64,\n" +
              "    ) {\n" +
              "        let r1 = Scalar::random(&amp;mut OsRng);\n" +
              "        let r2 = Scalar::random(&amp;mut OsRng);\n" +
              "        let c1 = PedersenCommitment::new(v1, &amp;r1);\n" +
              "        let c2 = PedersenCommitment::new(v2, &amp;r2);\n" +
              "        let c_sum = PedersenCommitment::new(v1 + v2, &amp;(r1 + r2));\n" +
              "        prop_assert_eq!(c1 + c2, c_sum);\n" +
              "    }\n" +
              "}" +
              "</code></pre>" +
              "<p><strong>Key strategies for crypto testing:</strong></p>" +
              "<ul>" +
              "<li>Roundtrip properties (serialize-deserialize, sign-verify, " +
              "commit-open)</li>" +
              "<li>Algebraic invariants (homomorphism, associativity)</li>" +
              "<li>Negative properties (wrong key rejects, tampered signature rejects)</li>" +
              "<li>Edge cases: empty message, max-length message, identity point, " +
              "zero scalar</li>" +
              "</ul>"
          }
        ],
        securityAnalysis:
          "<p><strong>Real-world timing attacks:</strong></p>" +
          "<ul>" +
          "<li><strong>OpenSSL RSA (2003):</strong> Boneh and Brumley demonstrated " +
          "remote timing attacks against OpenSSL's RSA decryption. By measuring " +
          "server response times over the network, they recovered the full RSA " +
          "private key. The root cause: Montgomery multiplication's extra reduction " +
          "step depended on secret bits.</li>" +
          "<li><strong>Lucky13 (2013):</strong> Al Fardan and Paterson exploited " +
          "timing differences in TLS CBC-mode padding validation. The MAC " +
          "computation time varied by ~1 microsecond depending on padding length, " +
          "enough to mount a plaintext recovery attack.</li>" +
          "<li><strong>Cache timing:</strong> AES table-lookup implementations " +
          "leak key bits through cache access patterns. This is why modern AES " +
          "uses hardware AES-NI instructions.</li>" +
          "</ul>" +
          "<p><strong>Rust's type system helps but does not eliminate side channels:</strong></p>" +
          "<ul>" +
          "<li>Rust prevents memory corruption bugs (buffer overflows, use-after-free) " +
          "that are common vulnerability classes in C crypto libraries</li>" +
          "<li>Rust does NOT prevent timing leaks from branches on secrets — " +
          "you must explicitly use the <code>subtle</code> crate</li>" +
          "<li>Rust does NOT prevent the compiler from optimizing away dead stores " +
          "of secrets — you must use <code>zeroize</code></li>" +
          "<li>LLVM may still introduce timing variations through instruction " +
          "scheduling or auto-vectorization — audit assembly output for " +
          "security-critical paths</li>" +
          "</ul>",
        exercises: [
          {
            type: "design",
            question:
              "Write a proptest strategy that generates random BLS12-381 key " +
              "pairs and verifies the sign-then-verify roundtrip. Include a " +
              "property that also tests aggregated BLS signatures."
          },
          {
            type: "conceptual",
            question:
              "Explain why `if secret_byte == 0 { ... }` is dangerous in crypto " +
              "code, even in Rust. What instruction-level behavior causes the " +
              "leak, and how does subtle::Choice prevent it?"
          }
        ]
      },

      /* ───────── Key Codebases to Study ───────── */
      {
        name: "Key Codebases to Study",
        formalDefinition:
          "<p>Each codebase represents a different architectural approach to " +
          "privacy-preserving cryptocurrency. Understanding their <strong>crate " +
          "structure</strong> and <strong>dependency graphs</strong> reveals how " +
          "production systems organize cryptographic code:</p>" +
          "<ul>" +
          "<li><strong>Penumbra</strong> (<code>penumbra-zone/penumbra</code>): " +
          "~40 crates, monorepo. Privacy-focused Cosmos chain using custom " +
          "primitives on the <code>decaf377</code> curve.</li>" +
          "<li><strong>Grin</strong> (<code>mimblewimble/grin</code>): " +
          "~8 crates, focused Mimblewimble implementation. Minimal, " +
          "confidential-by-default transaction model.</li>" +
          "<li><strong>Zcash Orchard</strong> (<code>zcash/orchard</code>): " +
          "standalone crate within the librustzcash ecosystem. Halo 2 proof " +
          "system, no trusted setup.</li>" +
          "</ul>",
        mathDetails: [
          {
            subtitle: "Penumbra Architecture",
            content:
              "<p><strong>Crate map</strong> (key crates for thesis relevance):</p>" +
              "<pre><code>" +
              "penumbra/\n" +
              "  crates/\n" +
              "    crypto/\n" +
              "      decaf377/          # Custom curve: cofactor-free Ristretto-style\n" +
              "      decaf377-rdsa/     # Randomizable signatures (re-randomizable keys)\n" +
              "      decaf377-fmd/      # Fuzzy message detection (privacy-preserving scan)\n" +
              "      decaf377-ka/       # Key agreement (DH on decaf377)\n" +
              "    core/\n" +
              "      asset/             # Asset ID, denomination, value types\n" +
              "      keys/              # Spending key, viewing key hierarchy\n" +
              "      shielded-pool/     # Note model, nullifiers, note commitments\n" +
              "      dex/               # Private DEX with batch swaps" +
              "</code></pre>" +
              "<p><strong>Key types to study:</strong></p>" +
              "<ul>" +
              "<li><code>Note</code>: the fundamental UTXO-like object containing " +
              "(value, asset_id, rseed, address). Committed via Poseidon hash.</li>" +
              "<li><code>Nullifier</code>: derived from <code>nk</code> (nullifier key) + " +
              "note position. Published on-chain to mark a note as spent without " +
              "revealing which note.</li>" +
              "<li><code>SpendKey -> FullViewingKey -> IncomingViewingKey</code>: " +
              "key derivation hierarchy that separates spending authority from " +
              "view access.</li>" +
              "</ul>" +
              "<p><strong>Privacy model:</strong> Penumbra uses a shielded pool where " +
              "all state is encrypted. Transaction amounts are hidden via Pedersen " +
              "commitments on decaf377, with balance proofs ensuring conservation.</p>"
          },
          {
            subtitle: "Grin Transaction Model",
            content:
              "<p>Grin implements Mimblewimble, where transactions are purely " +
              "commitment-based with no scripts or addresses:</p>" +
              "<pre><code>" +
              "// Simplified from grin/core/src/core/transaction.rs\n\n" +
              "pub struct Transaction {\n" +
              "    /// Inputs: references to previously created outputs\n" +
              "    pub inputs: Vec&lt;Input&gt;,\n" +
              "    /// Outputs: new Pedersen commitments\n" +
              "    pub outputs: Vec&lt;Output&gt;,\n" +
              "    /// Kernels: contain the excess (signature proof)\n" +
              "    pub kernels: Vec&lt;TxKernel&gt;,\n" +
              "}\n\n" +
              "pub struct Output {\n" +
              "    /// Pedersen commitment: C = v*G + r*H\n" +
              "    pub commit: Commitment,\n" +
              "    /// Bulletproof range proof: v is in [0, 2^64)\n" +
              "    pub proof: RangeProof,\n" +
              "}\n\n" +
              "pub struct TxKernel {\n" +
              "    /// The excess: sum(output_blinds) - sum(input_blinds)\n" +
              "    pub excess: Commitment,\n" +
              "    /// Schnorr signature proving knowledge of excess\n" +
              "    pub excess_sig: Signature,\n" +
              "    /// Fee (public, non-hidden)\n" +
              "    pub fee: FeeFields,\n" +
              "}" +
              "</code></pre>" +
              "<p><strong>Balance proof:</strong> For a valid transaction, " +
              "<code>sum(output_commits) - sum(input_commits) = excess + fee*H</code>. " +
              "The kernel's Schnorr signature on <code>excess</code> proves the " +
              "creator knew the blinding factor difference, preventing inflation.</p>" +
              "<p><strong>Cut-through:</strong> Grin's killer feature. If output A " +
              "is created in Tx1 and spent in Tx2, both A's creation and spending " +
              "can be removed from the chain, leaving only the net effect. This " +
              "makes the chain shrink over time.</p>"
          },
          {
            subtitle: "Zcash Orchard",
            content:
              "<p>The Orchard shielded pool (deployed in NU5) uses Halo 2, a " +
              "recursive proof system with <strong>no trusted setup</strong>:</p>" +
              "<pre><code>" +
              "// Key structures in zcash/orchard/src/\n\n" +
              "// Note commitment tree: incremental Merkle tree of note commitments\n" +
              "pub struct MerkleHashOrchard;  // Sinsemilla hash as domain separator\n\n" +
              "// Each note is committed: cm = SinsemillaCommit(rcm, g_d, pk_d, v, rho, psi)\n" +
              "pub struct NoteCommitment(pallas::Base);\n\n" +
              "// Nullifier: nf = DeriveNullifier(nk, rho, psi, cm)\n" +
              "// Unique per note, unlinkable to the commitment\n" +
              "pub struct Nullifier(pallas::Base);\n\n" +
              "// Action: the fundamental unit (replaces separate Spend + Output)\n" +
              "pub struct Action&lt;A&gt; {\n" +
              "    nf: Nullifier,          // nullifier of spent note\n" +
              "    rk: VerificationKey,    // re-randomized spend authority\n" +
              "    cmx: NoteCommitment,    // commitment to new note\n" +
              "    encrypted_note: A,      // encrypted note ciphertext\n" +
              "    cv_net: ValueCommitment, // net value commitment\n" +
              "}" +
              "</code></pre>" +
              "<p><strong>Action circuit:</strong> Each <code>Action</code> bundles a " +
              "spend and an output. The Halo 2 circuit proves:</p>" +
              "<ol>" +
              "<li>The nullified note exists in the Merkle tree (membership proof)</li>" +
              "<li>The nullifier is correctly derived from the note and nullifier key</li>" +
              "<li>The note commitment is well-formed</li>" +
              "<li>The value commitment balances (input value = output value + " +
              "fee contribution)</li>" +
              "<li>The spender has authorization (spend authority signature)</li>" +
              "</ol>" +
              "<p><strong>No trusted setup:</strong> Halo 2 uses an Inner Product " +
              "Argument (IPA) on the Pallas/Vesta curve cycle, avoiding the toxic " +
              "waste problem of Groth16. This means Orchard can be upgraded without " +
              "ceremonies.</p>"
          }
        ],
        practicalNotes:
          "<p><strong>How to navigate large Rust crypto codebases:</strong></p>" +
          "<ol>" +
          "<li><strong>Start from types:</strong> Read the core data structures " +
          "first (<code>Note</code>, <code>Transaction</code>, <code>Action</code>). " +
          "The types tell you what the system manipulates.</li>" +
          "<li><strong>Follow the data:</strong> Pick one operation (e.g., \"create " +
          "a shielded transfer\") and trace it from user input through type " +
          "construction, proof generation, serialization, and on-chain verification.</li>" +
          "<li><strong>Run one test:</strong> Find a unit test for the operation " +
          "you are studying and run it with " +
          "<code>cargo test test_name -- --nocapture</code>. " +
          "Add <code>println!</code> statements to observe intermediate values.</li>" +
          "<li><strong>Use cargo doc:</strong> Run <code>cargo doc --open --no-deps</code> " +
          "to browse the crate's own documentation without drowning in dependency docs.</li>" +
          "<li><strong>Read Cargo.toml:</strong> The dependency list reveals which " +
          "crypto primitives the project uses and how crates relate to each other.</li>" +
          "</ol>" +
          "<p><strong>Recommended study order per codebase:</strong></p>" +
          "<pre><code>" +
          "1. README.md / ARCHITECTURE.md\n" +
          "2. Cargo.toml (workspace members, key deps)\n" +
          "3. Core types (look for mod.rs or lib.rs in crypto crate)\n" +
          "4. One end-to-end test\n" +
          "5. The proof/circuit module (if applicable)" +
          "</code></pre>",
        exercises: [
          {
            type: "design",
            question:
              "Clone penumbra-zone/penumbra and trace a shielded transfer from " +
              "user input to on-chain state change. List every cryptographic " +
              "operation in order (key derivation, commitment, proof generation, " +
              "encryption, nullifier derivation)."
          },
          {
            type: "comparison",
            question:
              "Compare how Grin, Penumbra, and Aptos handle the double-spend " +
              "problem. Which uses nullifiers? Which does not? What are the " +
              "privacy trade-offs of each approach?"
          }
        ]
      }
    ]
  }
};
