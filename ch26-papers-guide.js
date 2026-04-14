/**
 * Ch 2.6 Papers Guide — Sui Blockchain Primitives
 * Intuitive recap data for academic paper cards.
 * Rendered by paper-guide.js via window.CH26_PAPERS.
 */

window.CH26_PAPERS = {
  papers: [
    /* ── Paper 1: zkLogin ── */
    {
      name: "zkLogin: Privacy-Preserving Blockchain Authentication with Existing Credentials",
      authors: "Mysten Labs",
      venue: "ACM CCS 2024, arXiv 2401.11735",
      status: "skimmed",
      relevance: "core",
      analogy:
        "zkLogin answers the question: 'How can someone log into a blockchain " +
        "with their Google account, without Google knowing they have a crypto " +
        "wallet?' The trick is a two-layered ZKP. First, you prove to yourself " +
        "(off-chain) that Google's JWT token is valid. Second, you publish on-chain " +
        "a proof that you know a valid JWT for some user, without revealing which " +
        "user. Your Sui address is derived from a hash of your Google subject ID " +
        "and a salt — stable and deterministic, but unlinkable to your Google " +
        "identity by anyone who doesn't know your salt. This is already deployed " +
        "at scale on Sui mainnet, making it the most production-ready ZKP in " +
        "your thesis ecosystem.",
      diagram:
        '┌────────────────────────────────────────────────────────────┐\n' +
        '│              zkLogin — Two-Proof Architecture              │\n' +
        '├────────────────────────────────────────────────────────────┤\n' +
        '│                                                            │\n' +
        '│  STEP 1: OAuth (off-chain)                                 │\n' +
        '│  User ──[Google OAuth]──→ JWT = { sub, aud, nonce, ... }   │\n' +
        '│           nonce = H(ephemeral_pk || max_epoch || rand)     │\n' +
        '│                                                            │\n' +
        '│  STEP 2: ZKP Generation (client-side, Groth16 / BN254)     │\n' +
        '│  Proof 1 — JWT Validity:                                   │\n' +
        '│    π₁ = ZKPoK{ jwt_header, jwt_payload, sig_google :       │\n' +
        '│      RSA_Verify(pk_google, jwt) = ⊤ ∧ nonce correct }      │\n' +
        '│                                                            │\n' +
        '│  Proof 2 — Address Derivation:                             │\n' +
        '│    π₂ = ZKPoK{ sub, salt :                                 │\n' +
        '│      addr = H(iss || sub || salt || aud) }                 │\n' +
        '│                                                            │\n' +
        '│  STEP 3: Sui Transaction                                   │\n' +
        '│  Submit (tx, π₁, π₂, ephemeral_sig) to Sui validators     │\n' +
        '│  Validators verify π₁ + π₂ + ephemeral_sig on-chain       │\n' +
        '│                                                            │\n' +
        '│  PRIVACY: validators never see sub or salt                 │\n' +
        '│  SECURITY: ephemeral key expires at max_epoch              │\n' +
        '└────────────────────────────────────────────────────────────┘',
      keyPoints: [
        "zkLogin lets users authenticate to Sui with Google/Apple/Facebook OAuth " +
          "without revealing their OAuth identity to validators or on-chain observers",
        "Two-proof system: (1) JWT validity proof — RSA signature verification " +
          "in a ZKP circuit; (2) address derivation proof — binds OAuth subject ID " +
          "to a deterministic Sui address via a user-controlled salt",
        "Uses Groth16 over BN254 — trusted setup was performed via a multi-party " +
          "ceremony; verification cost is constant regardless of circuit size",
        "Ephemeral key design: OAuth flow generates a short-lived keypair; the " +
          "JWT nonce commits to the ephemeral public key; JWT expiry = session expiry",
        "Deployed at scale on Sui mainnet since 2024 — the only production ZKP " +
          "identity system on a major L1 blockchain",
        "Direct building block for your thesis: zkLogin provides the OAuth-to-Sui " +
          "binding; your anonymous credentials extend this with selective disclosure " +
          "and payment privacy"
      ],
      connections:
        "zkLogin is the authentication layer your thesis builds on. Your system " +
        "assumes users have Sui addresses (possibly obtained via zkLogin) and " +
        "adds an anonymous credential layer above it. The two-proof pattern " +
        "in zkLogin (JWT proof + address proof) is structurally similar to your " +
        "credential proof (issuance proof + payment proof). The Groth16/BN254 " +
        "setup from zkLogin can potentially be reused for your payment proofs.",
      thesisExample:
        "In Chapter 2.6 (Sui primitives) and your design chapter, position " +
        "zkLogin as the identity foundation: 'zkLogin provides privacy-preserving " +
        "authentication for Sui [cite CCS 2024], binding real-world identities " +
        "to pseudonymous addresses via ZKP. Our system uses this as the base " +
        "identity layer (users obtain credentials against their zkLogin address) " +
        "and adds BBS+ selective disclosure and confidential payments above it, " +
        "extending zkLogin's privacy guarantees from authentication to transactions.'",
      keyTakeaway:
        "Production ZKP on Sui — the direct building block. Study the two-proof " +
        "architecture and Groth16/BN254 setup for reuse in your payment proofs."
    },

    /* ── Paper 2: ZK Authenticator ── */
    {
      name: "ZK Authenticator: Policy-Private Obliviously Updateable Authenticator",
      authors: "Anonymized / TBD",
      venue: "AFT 2025",
      status: "queued",
      relevance: "related",
      analogy:
        "A standard authenticator is like a nightclub bouncer who stamps your " +
        "hand: they check your ID, confirm you are allowed in, and the stamp " +
        "proves you passed the check. The ZK Authenticator improves on this in " +
        "two ways: (1) the bouncer checks your policy ('over 21, EU resident') " +
        "without learning your exact age or country — policy-private; (2) when " +
        "your policy changes (you move countries), the authenticator can be " +
        "updated without revealing that an update happened — obliviously updateable. " +
        "This maps directly to the credential revocation and update problem in " +
        "anonymous credential systems.",
      diagram:
        '┌────────────────────────────────────────────────────────────┐\n' +
        '│           ZK Authenticator — Key Properties                │\n' +
        '├────────────────────────────────────────────────────────────┤\n' +
        '│                                                            │\n' +
        '│  POLICY PRIVACY                                            │\n' +
        '│  Verifier learns: policy_satisfied = {true, false}         │\n' +
        '│  Verifier does NOT learn: which policy attributes checked   │\n' +
        '│  → Hides the policy itself, not just the attribute values  │\n' +
        '│                                                            │\n' +
        '│  OBLIVIOUS UPDATE                                          │\n' +
        '│  Old credential → New credential (attribute changed)       │\n' +
        '│  Observer cannot distinguish update from new issuance      │\n' +
        '│  → No timing correlation attack on credential updates      │\n' +
        '│                                                            │\n' +
        '│  UPDATEABILITY                                             │\n' +
        '│  Issuer can update credential without full re-issuance     │\n' +
        '│  → Efficient revocation + attribute refresh                │\n' +
        '│                                                            │\n' +
        '│  RELEVANCE TO THESIS                                       │\n' +
        '│  Your credential system needs updateable credentials for   │\n' +
        '│  KYC refresh, policy changes, balance cap adjustments      │\n' +
        '└────────────────────────────────────────────────────────────┘',
      keyPoints: [
        "Policy-private authenticator: verifier learns only whether a policy is " +
          "satisfied, not which specific policy attributes were checked",
        "Obliviously updateable: credential updates are computationally " +
          "indistinguishable from new issuances — prevents timing correlation attacks",
        "Presented at AFT 2025 — the top academic venue for applied fintech research, " +
          "indicating practical deployment relevance",
        "Addresses a gap in existing anonymous credential systems: most support " +
          "selective disclosure but not policy-hiding or oblivious updates",
        "Relevant to your thesis's credential lifecycle management: KYC refresh, " +
          "payment cap adjustments, and regulatory policy changes all require " +
          "updateable credentials"
      ],
      connections:
        "The ZK Authenticator addresses the credential update problem that your " +
        "thesis needs to handle. When a user's KYC status changes or their " +
        "payment cap is adjusted by the regulator, how does the credential " +
        "update without leaking timing information? This paper's oblivious " +
        "update mechanism is a candidate approach for your credential lifecycle " +
        "section. Policy-privacy also strengthens your privacy guarantees: even " +
        "the policy structure is hidden from verifiers.",
      thesisExample:
        "In your related work section, cite the ZK Authenticator when discussing " +
        "credential lifecycle management: 'The ZK Authenticator [AFT 2025] " +
        "introduces oblivious updateability — a property our system should " +
        "adopt for KYC refresh scenarios (§4.4). We adopt the policy-privacy " +
        "notion from this work: Sui validators verify that credentials satisfy " +
        "the payment policy without learning the specific policy thresholds.'",
      keyTakeaway:
        "Policy-private + obliviously updateable credentials — extends your " +
        "anonymous credential design with update semantics and policy hiding."
    },

    /* ── Paper 3: Sui Confidential Transactions ── */
    {
      name: "Sui Confidential Transactions",
      authors: "Mysten Labs",
      venue: "Mysten Labs Technical Report / Design Document (TBD)",
      status: "queued",
      relevance: "core",
      analogy:
        "Sui Confidential Transactions is the protocol-level answer to: 'How do " +
        "you send tokens on Sui without revealing the amount to blockchain " +
        "observers?' Mysten Labs is building this directly into the Sui protocol " +
        "using the same cryptographic building blocks your thesis uses: Pedersen " +
        "commitments to hide amounts, range proofs to prevent inflation attacks, " +
        "and zk-SNARKs for efficient on-chain verification. When published, this " +
        "will be the ground truth for what Sui's confidential payment primitives " +
        "look like — your thesis's payment layer must be compatible with it.",
      diagram:
        '┌────────────────────────────────────────────────────────────┐\n' +
        '│        Sui Confidential Transactions — Expected Design      │\n' +
        '├────────────────────────────────────────────────────────────┤\n' +
        '│                                                            │\n' +
        '│  SUI OBJECT MODEL                                          │\n' +
        '│  Object { id, type, owner, version, content }             │\n' +
        '│                                                            │\n' +
        '│  CONFIDENTIAL COIN OBJECT (expected)                       │\n' +
        '│  ConfidentialCoin {                                        │\n' +
        '│    id: ObjectID,                                           │\n' +
        '│    commitment: PedersenCommitment,  // C = v*G + r*H       │\n' +
        '│    range_proof: BulletproofOrGroth16,                      │\n' +
        '│    audit_ciphertext: ElGamalCiphertext,  // optional       │\n' +
        '│  }                                                         │\n' +
        '│                                                            │\n' +
        '│  TRANSFER PROOF (expected zk-SNARK)                        │\n' +
        '│  π = ZKPoK{ v_in, v_out, r_in, r_out :                    │\n' +
        '│    C_in - C_out = r_excess * H  (balance)                 │\n' +
        '│    v_out ≥ 0  (range)                                      │\n' +
        '│    v_in = v_out + v_fee  (fee)                             │\n' +
        '│  }                                                         │\n' +
        '│                                                            │\n' +
        '│  STATUS: Design in progress at Mysten Labs (as of 2026)    │\n' +
        '│  NIGHT-SHIFT-REVIEW: cite design doc when published        │\n' +
        '└────────────────────────────────────────────────────────────┘',
      keyPoints: [
        "Protocol-level confidential payments being designed by Mysten Labs for Sui — " +
          "amounts hidden via Pedersen commitments, validity proved via zk-SNARKs",
        "Expected to use Sui's object model: confidential coins are Move objects " +
          "with commitment and range proof fields, owned by addresses",
        "Range proofs (Bulletproofs or Groth16) prevent inflation attacks by proving " +
          "committed values are non-negative without revealing them",
        "The design is expected to support an optional audit ciphertext (ElGamal) " +
          "for compliance — directly compatible with your TEE audit design",
        "When published, this document will be the ground truth for Sui's " +
          "confidential payment primitives — your thesis must be architecturally aligned",
        "As of April 2026: design document not yet published; monitor Mysten Labs " +
          "GitHub and research blog for release"
      ],
      connections:
        "Sui Confidential Transactions is your thesis's platform dependency. " +
        "Your anonymous credential + private payment system runs on top of " +
        "whatever confidential transaction primitive Sui provides. You need to " +
        "understand the expected commitment scheme, proof system, and object model " +
        "to ensure your credential binding and TEE audit design are compatible. " +
        "If the design uses ElGamal audit ciphertexts (as expected), your TEE " +
        "can decrypt them without any on-chain changes.",
      thesisExample:
        "In your design chapter, explicitly state: 'Our payment layer is designed " +
        "to be compatible with Sui's planned confidential transaction primitive " +
        "[cite design doc when available]. We use Pedersen commitments over the " +
        "same curve (BN254/Ristretto255 — TBD pending Mysten's choice) and " +
        "Groth16 proofs for balance verification. If Sui's native confidential " +
        "transactions are deployed before our system, our credential binding " +
        "can be retrofitted without changing the proof system (§4.5).'",
      keyTakeaway:
        "The Sui protocol primitive your thesis builds on. Monitor Mysten Labs " +
        "for publication; design your system to be compatible with expected " +
        "Pedersen commitment + zk-SNARK architecture."
    }
  ]
};
