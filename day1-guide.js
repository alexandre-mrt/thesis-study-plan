/**
 * Day 1 Study Guide — Crypto Foundations + ZKP
 * Data file loaded by the study plan website.
 */

window.DAY1_GUIDE = {
  block1: {
    title: "Crypto Primitives + ZKP Fundamentals",
    connectionsSummary:
      "These primitives are the building blocks of every " +
      "anonymous credential system. Hash functions underpin " +
      "commitment schemes used in Pedersen commitments (the " +
      "core of BBS+ signatures). Digital signatures, " +
      "especially blind signatures, enable issuers to sign " +
      "credentials without learning their content. Elliptic " +
      "curve pairings on BLS12-381 make BBS+ selective " +
      "disclosure possible. Zero-knowledge proofs and Sigma " +
      "protocols let holders prove credential attributes to " +
      "verifiers on Sui without revealing the credential " +
      "itself. The Privacy-Enhancing Technology (PET) " +
      "primitives — Oblivious Transfer, MPC, Secret Sharing, " +
      "Garbled Circuits, FHE, and ORAM — extend this " +
      "foundation with techniques for distributed trust, " +
      "computation on private data, and secure memory access " +
      "inside TEEs. Together, these form the cryptographic " +
      "foundation for privacy-preserving identity on-chain.",
    concepts: [
      {
        name: "Hash Functions",
        analogy:
          "A fingerprint scanner for data. Just as every " +
          "person has a unique fingerprint that cannot be " +
          "reverse-engineered back into a person, a hash " +
          "function produces a unique fixed-size digest for " +
          "any input. Change a single bit and the entire " +
          "fingerprint changes beyond recognition.",
        diagram:
          '┌─────────────────────────────────────────────┐\n' +
          '│            Hash Function H(x)               │\n' +
          '├─────────────────────────────────────────────┤\n' +
          '│                                             │\n' +
          '│  "Hello"  ──→ ┌────────┐ ──→ a591a6d4...   │\n' +
          '│               │  H(x)  │                    │\n' +
          '│  "Hello!" ──→ └────────┘ ──→ 334d016f...   │\n' +
          '│                                             │\n' +
          '│  Properties:                                │\n' +
          '│  ┌──────────────────────────────────────┐   │\n' +
          '│  │ x ──→ H(x)    (easy, deterministic) │   │\n' +
          '│  │ H(x) ──→ x    (impossible: one-way) │   │\n' +
          '│  │ H(a) = H(b)   (infeasible: no clash)│   │\n' +
          '│  └──────────────────────────────────────┘   │\n' +
          '└─────────────────────────────────────────────┘',
        keyPoints: [
          "Deterministic: same input always produces the same output",
          "One-way (preimage resistant): given H(x), finding x is computationally infeasible",
          "Collision resistant: finding two inputs with the same hash is infeasible",
          "Avalanche effect: flipping one input bit changes roughly half the output bits",
          "Used in Merkle trees, commitment schemes, digital signatures, and proof systems"
        ],
        connections:
          "Hash functions are embedded in every layer of the " +
          "thesis system. Sui uses SHA-256 and Blake2b for " +
          "transaction hashing and Merkle tree construction. " +
          "In anonymous credentials, hashes bind attributes " +
          "inside Pedersen commitments and form the backbone " +
          "of Fiat-Shamir transforms that make ZKPs " +
          "non-interactive for on-chain verification.",
        publicPrivate: [
          { item: "hash function H", status: "public", holder: "everyone", when: "always (algorithm is public)" },
          { item: "input x", status: "private", holder: "whoever holds the data", when: "can be public or private depending on context" },
          { item: "output H(x)", status: "public", holder: "everyone", when: "after computation" },
          { item: "pre-image x from H(x)", status: "private", holder: "original data holder", when: "computationally infeasible to recover (one-way property)" }
        ],
        thesisExample:
          "In your thesis, Poseidon hash is used inside ZK circuits for " +
          "the credential commitment tree on Sui. When a user's BBS+ " +
          "credential is issued, a Poseidon hash of the credential " +
          "commitment is inserted into an on-chain Merkle tree. During " +
          "payment verification, the ZK circuit proves membership in " +
          "this tree — Poseidon's ZK-friendly design keeps the circuit " +
          "under 1000 constraints per hash, making on-chain verification " +
          "affordable.",
        history: {
          inventor: "Ralph Merkle (Stanford University)",
          year: 1979,
          context:
            "Merkle proposed cryptographic hashing as part of his PhD thesis " +
            "on public-key cryptosystems. Before dedicated hash functions, message " +
            "authentication relied on block-cipher MACs (DES-CBC-MAC). Rivest's " +
            "MD4 (1990) and MD5 (1992) dominated the 1990s until differential " +
            "cryptanalysis revealed weaknesses. SHA-1 (NSA, 1995) became the " +
            "standard until Xiaoyun Wang demonstrated practical collisions in " +
            "2005 at CRYPTO. SHA-256 (SHA-2 family, 2001) and SHA-3/Keccak " +
            "(Bertoni, Daemen, Peeters, Van Assche, 2012 NIST winner) are the " +
            "current standards.",
          funFact:
            "Merkle's original hash tree patent (US 4,309,569) was filed in " +
            "1979 but not granted until 1982. He was 27 years old and the " +
            "concept was considered too abstract to be useful. Today Merkle " +
            "trees secure every major blockchain."
        },
        limitations: [
          "SHA-256 requires ~27,000 R1CS constraints in a Groth16 circuit " +
          "because its bitwise operations (rotations, XOR, modular additions) " +
          "are expensive over arithmetic fields. Poseidon needs only ~300 " +
          "constraints for equivalent security, making it 90x more ZK-friendly.",
          "Hash functions are one-way by construction but not hiding for small " +
          "message spaces. H(m) for a known small domain can be brute-forced " +
          "(e.g., hashing all 10^9 possible SSNs reveals the preimage in seconds).",
          "Collision resistance degrades with output length via the birthday " +
          "bound: a 256-bit hash provides only 128-bit collision resistance " +
          "(2^128 evaluations), which is marginal for post-quantum security " +
          "where Grover's algorithm halves the preimage resistance to 128 bits."
        ],
        exercises: [
          {
            type: "calculation",
            question:
              "If a hash function has a 256-bit output, how many evaluations " +
              "are needed on average to find a collision (birthday attack)? " +
              "Express as a power of 2.",
            hint:
              "The birthday bound for an n-bit hash is approximately 2^(n/2) " +
              "evaluations.",
            answer:
              "2^128 evaluations. The birthday paradox says that with 2^128 " +
              "random hashes, the probability of at least one collision exceeds " +
              "50%. This is why 256-bit hashes provide 128-bit collision " +
              "resistance, and why post-quantum security (where Grover halves " +
              "preimage resistance) may require 384-bit or larger outputs."
          },
          {
            type: "conceptual",
            question:
              "Why does Sui use Poseidon hash inside ZK circuits (e.g., zkLogin) " +
              "instead of SHA-256, even though SHA-256 is more widely studied?",
            hint:
              "Think about the cost of representing each hash operation as " +
              "arithmetic constraints in an R1CS or PLONKish system.",
            answer:
              "SHA-256 requires ~27,000 R1CS constraints per invocation because " +
              "its bitwise operations (rotations, XOR, additions mod 2^32) are " +
              "expensive to express in arithmetic circuits over prime fields. " +
              "Poseidon, designed specifically for ZK, uses field-native " +
              "operations (additions, multiplications, exponentiations in F_p) " +
              "and needs only ~300 constraints. In zkLogin, where the circuit " +
              "must hash multiple values, this 90x reduction directly translates " +
              "to faster proof generation and smaller proving keys."
          },
          {
            type: "comparison",
            question:
              "Compare SHA-256, Poseidon, and Pedersen hash in terms of " +
              "constraint cost, algebraic friendliness, and typical use cases " +
              "in ZK systems.",
            hint:
              "Pedersen hash is based on elliptic curve scalar multiplication, " +
              "Poseidon on S-box permutations over F_p, and SHA-256 on bitwise " +
              "operations.",
            answer:
              "SHA-256: ~27,000 R1CS constraints, bitwise (not field-native), " +
              "used for external compatibility (Merkle trees, TLS). Poseidon: " +
              "~300 constraints, fully field-native (S-box = x^alpha in F_p), " +
              "used inside ZK circuits for commitments and Merkle trees. " +
              "Pedersen hash: ~750 constraints (EC scalar multiplication), " +
              "additively homomorphic which enables algebraic composition, " +
              "used in Zcash Sapling. Poseidon dominates new ZK designs " +
              "because it minimizes proving time."
          }
        ]
      },
      {
        name: "Commitment Schemes",
        analogy:
          "A sealed envelope placed inside a glass box. " +
          "Everyone can see the envelope exists (the " +
          "commitment), but nobody can read what is inside " +
          "until you break the seal and open it (the reveal). " +
          "Once sealed, you cannot swap the contents for " +
          "something else.",
        diagram:
          '┌──────────────────────────────────────────┐\n' +
          '│          Commitment Scheme                │\n' +
          '├──────────────────────────────────────────┤\n' +
          '│                                          │\n' +
          '│  COMMIT PHASE                            │\n' +
          '│  ┌────────────┐                          │\n' +
          '│  │ message m  │──┐                       │\n' +
          '│  └────────────┘  │  C = Commit(m, r)     │\n' +
          '│  ┌────────────┐  │  ┌───────────┐        │\n' +
          '│  │ random r   │──┴─→│  C (blob) │───→ V  │\n' +
          '│  └────────────┘     └───────────┘        │\n' +
          '│                                          │\n' +
          '│  REVEAL PHASE                            │\n' +
          '│  ┌──────────────────┐                    │\n' +
          '│  │ send (m, r) to V │                    │\n' +
          '│  └────────┬─────────┘                    │\n' +
          '│           ↓                              │\n' +
          '│  V checks: Commit(m, r) = C ?            │\n' +
          '│                                          │\n' +
          '│  Pedersen: C = g^m * h^r                 │\n' +
          '│  (additively homomorphic)                │\n' +
          '└──────────────────────────────────────────┘',
        keyPoints: [
          "Hiding: the commitment C reveals nothing about the message m",
          "Binding: once committed, the committer cannot open to a different value",
          "Pedersen commitments are additively homomorphic: Commit(a) + Commit(b) = Commit(a+b)",
          "Randomness r is essential for hiding; without it, commitments become deterministic and breakable"
        ],
        connections:
          "Pedersen commitments are the core primitive in BBS+ " +
          "anonymous credentials. Each credential attribute is " +
          "committed individually, allowing selective disclosure: " +
          "the holder reveals only chosen attributes while " +
          "keeping others hidden inside commitments. The " +
          "homomorphic property enables efficient range proofs " +
          "and attribute predicate proofs without revealing " +
          "underlying values.",
        publicPrivate: [
          { item: "commitment C = g^m * h^r", status: "public", holder: "everyone", when: "after commit phase" },
          { item: "message m", status: "private", holder: "committer", when: "until reveal phase" },
          { item: "randomness r", status: "private", holder: "committer", when: "until reveal phase" },
          { item: "generators g, h", status: "public", holder: "everyone", when: "always (system parameters)" },
          { item: "message m", status: "revealed", holder: "everyone", when: "after reveal phase — committer sends (m, r) to verifier" },
          { item: "randomness r", status: "revealed", holder: "everyone", when: "after reveal phase — verifier checks C = g^m * h^r" }
        ],
        thesisExample:
          "Your credential system uses Pedersen commitments to hide " +
          "attribute values. When a user presents an age credential, " +
          "C = g^age · h^r keeps the exact age private. The " +
          "homomorphic property enables range proofs: prove age ≥ 18 " +
          "without revealing the exact value. In the payment layer, " +
          "Pedersen commitments hide transaction amounts while enabling " +
          "balance verification: sum of input commitments = sum of " +
          "output commitments.",
        history: {
          inventor: "Torben Pedersen (Aarhus University)",
          year: 1991,
          context:
            "Pedersen published 'Non-Interactive and Information-Theoretic " +
            "Secure Verifiable Secret Sharing' at CRYPTO 1991. Earlier " +
            "commitment schemes by Blum (1981) and Brassard-Chaum-Crepeau " +
            "(1988) existed but were less practical. Pedersen's C = g^m * h^r " +
            "achieved information-theoretic hiding with computational binding " +
            "from the discrete log assumption, in a single elegant equation. " +
            "Hash-based commitments C = H(m || r) predated Pedersen but lack " +
            "the homomorphic property essential for modern ZK systems.",
          funFact:
            "Pedersen commitments are so fundamental that they appear in the " +
            "specifications of Monero (RingCT), Mimblewimble/Grin, Zcash, and " +
            "nearly every confidential transaction scheme. The original paper " +
            "has over 3,000 citations."
        },
        limitations: [
          "Computationally binding only: if a quantum computer solves the " +
          "discrete log problem, an adversary could open a Pedersen commitment " +
          "to any value they choose, completely breaking binding.",
          "Requires NOTHING-UP-MY-SLEEVE generation of generators g, h: if " +
          "anyone knows the discrete log log_g(h), they can open any " +
          "commitment to any value (breaking binding), since C = g^m * h^r = " +
          "g^(m + r*log_g(h)) gives full freedom in choosing m' and r'.",
          "Not compact for large attribute sets: a credential with L " +
          "attributes requires L separate Pedersen commitments (one per " +
          "attribute), each needing its own randomness, which increases " +
          "storage and communication overhead linearly."
        ],
        exercises: [
          {
            type: "calculation",
            question:
              "On a toy group where operations are integers mod 11, with " +
              "generators g=2 and h=7, compute the Pedersen commitment " +
              "C = g^m * h^r (mod 11) for m=3 and r=4. Then compute a " +
              "second commitment for m=5 and r=2, and verify that the " +
              "product of the two commitments equals a commitment to m=8 " +
              "and r=6.",
            hint:
              "Compute 2^3 mod 11 = 8, then 7^4 mod 11. Use Fermat's little " +
              "theorem: a^10 = 1 (mod 11) for any a not divisible by 11.",
            answer:
              "C1 = 2^3 * 7^4 mod 11 = 8 * 2401 mod 11 = 8 * (2401 mod 11) " +
              "= 8 * 3 = 24 mod 11 = 2. C2 = 2^5 * 7^2 mod 11 = 32 * 49 " +
              "mod 11 = 10 * 5 = 50 mod 11 = 6. C1*C2 = 2*6 = 12 mod 11 " +
              "= 1. Direct: 2^8 * 7^6 mod 11 = 256 * 117649 mod 11 = 3 * 4 " +
              "= 12 mod 11 = 1. They match, confirming the homomorphic " +
              "property: Commit(m1,r1) * Commit(m2,r2) = Commit(m1+m2, r1+r2)."
          },
          {
            type: "conceptual",
            question:
              "Why is randomness r essential for the hiding property of " +
              "Pedersen commitments? What attack becomes possible if the " +
              "committer uses r=0?",
            hint:
              "With r=0, the commitment becomes C = g^m, which is a " +
              "deterministic function of m alone.",
            answer:
              "Without randomness, C = g^m is deterministic. An adversary who " +
              "knows the message space (e.g., ages 0-150) can compute g^m for " +
              "every possible m and compare with C. This is a dictionary " +
              "attack analogous to rainbow tables. The randomness r ensures " +
              "that identical messages produce different commitments (each " +
              "with fresh r), making C information-theoretically hiding: " +
              "every commitment value is equally likely for any message."
          },
          {
            type: "design",
            question:
              "In the thesis credential system, how would you use Pedersen " +
              "commitments to enable range proofs on an age attribute (prove " +
              "age >= 18 without revealing exact age)? Outline the approach.",
            hint:
              "Think about decomposing age - 18 into bits and committing to " +
              "each bit, then proving each bit is 0 or 1.",
            answer:
              "Commit to the age as C_age = g^age * h^r. To prove age >= 18, " +
              "compute delta = age - 18 and prove delta >= 0 by decomposing " +
              "delta into bits (b_0, ..., b_n). Commit to each bit " +
              "C_i = g^b_i * h^r_i and prove each b_i is in {0,1} using " +
              "Sigma protocols. The homomorphic property lets the verifier " +
              "check that the product of bit commitments (weighted by powers " +
              "of 2) equals the commitment to delta, without learning any " +
              "bit values. This is essentially how Bulletproof range proofs " +
              "work inside the thesis payment layer."
          }
        ]
      },
      {
        name: "Digital Signatures",
        analogy:
          "A wax seal on a medieval letter. Anyone can inspect " +
          "the seal to verify it matches your signet ring " +
          "(public key), but only you possess the ring " +
          "(private key) to create it. Blind signatures are " +
          "like signing a letter inside a carbon-paper " +
          "envelope: the signer stamps the envelope, the " +
          "signature transfers through, but the signer never " +
          "sees the letter's content.",
        diagram:
          '┌──────────────────────────────────────────────┐\n' +
          '│           Digital Signatures                  │\n' +
          '├──────────────────────────────────────────────┤\n' +
          '│                                              │\n' +
          '│  STANDARD SIGNATURE                          │\n' +
          '│  ┌─────┐  sk   ┌──────┐                     │\n' +
          '│  │ msg │──────→│ Sign │──→ sig               │\n' +
          '│  └─────┘       └──────┘                      │\n' +
          '│  ┌─────┐  pk   ┌────────┐                    │\n' +
          '│  │ sig │──────→│ Verify │──→ true/false      │\n' +
          '│  └─────┘       └────────┘                    │\n' +
          '│                                              │\n' +
          '│  BLIND SIGNATURE                             │\n' +
          '│  ┌─────┐ blind  ┌───────┐ sign  ┌────────┐  │\n' +
          '│  │ msg │──────→│ Blind │─────→│ Signer │   │\n' +
          '│  └─────┘        └───────┘      └───┬────┘   │\n' +
          '│                                    ↓         │\n' +
          '│                  ┌─────────┐  blind sig      │\n' +
          '│                  │ Unblind │←────────         │\n' +
          '│                  └────┬────┘                  │\n' +
          '│                       ↓                      │\n' +
          '│                  valid sig on msg             │\n' +
          '│              (signer never saw msg)           │\n' +
          '└──────────────────────────────────────────────┘',
        keyPoints: [
          "Authentication: proves the signer's identity",
          "Non-repudiation: signer cannot deny having signed",
          "Integrity: any modification to the signed message invalidates the signature",
          "Blind signatures enable privacy: the issuer signs without seeing the content",
          "BBS+ signatures extend this to multi-message signing with selective disclosure"
        ],
        connections:
          "Anonymous credentials rely on specialized signature " +
          "schemes. BBS+ signatures allow an issuer to sign a " +
          "vector of attributes, and the holder can later " +
          "selectively disclose any subset. On Sui, credential " +
          "issuance uses blind signing so the issuer never " +
          "learns the full credential. Verification happens " +
          "on-chain using pairing-based signature checks.",
        publicPrivate: [
          { item: "public key pk", status: "public", holder: "everyone", when: "always (published by signer)" },
          { item: "secret key sk", status: "private", holder: "signer", when: "always (never revealed)" },
          { item: "message m", status: "public", holder: "everyone", when: "always (signed in the clear)" },
          { item: "signature sigma", status: "public", holder: "everyone", when: "after signing" },
          { item: "blinding factor r (blind signatures)", status: "private", holder: "user/requester", when: "always (never revealed to signer)" },
          { item: "blinded message m' (blind signatures)", status: "public", holder: "signer sees only m'", when: "during blind signing protocol" },
          { item: "unblinded signature sigma (blind signatures)", status: "private", holder: "user/requester", when: "until user chooses to present it" }
        ],
        thesisExample:
          "BBS+ signatures (a specialized multi-message signature " +
          "scheme) are the core of your credential layer. The issuer " +
          "signs the user's attribute vector (name, age, nationality, " +
          "KYC level) with a single BBS+ signature. Blind issuance " +
          "ensures the issuer doesn't learn all attributes. The user " +
          "can later derive unlinkable proofs from this signature, " +
          "showing only selected attributes to different verifiers " +
          "on Sui.",
        history: {
          inventor: "Whitfield Diffie & Martin Hellman (Stanford); RSA by Rivest, Shamir, Adleman (MIT)",
          year: 1976,
          context:
            "Diffie and Hellman introduced public-key cryptography in 'New " +
            "Directions in Cryptography' (1976), but digital signatures were " +
            "first formalized by Rivest, Shamir, and Adleman (RSA, 1978). " +
            "David Chaum invented blind signatures in 1982 ('Blind Signatures " +
            "for Untraceable Payments', CRYPTO 1982), enabling the signer to " +
            "sign a message without seeing its content. Schnorr signatures " +
            "(1989) and ECDSA (NIST, 1998) brought elliptic curve efficiency. " +
            "BBS+ (Boneh-Boyen-Shacham, 2004; extended by Au-Susilo-Mu, 2006) " +
            "added multi-message signing with selective disclosure.",
          funFact:
            "Chaum's blind signature patent expired before its commercial " +
            "potential was realized. His company DigiCash (1990) went bankrupt " +
            "in 1998, but the blind signature concept became foundational for " +
            "anonymous credentials and privacy-preserving identity 25 years later."
        },
        limitations: [
          "Standard ECDSA signatures are linkable: the same public key " +
          "produces verifiable signatures that can be correlated across " +
          "different contexts, destroying user privacy. BBS+ signatures solve " +
          "this with unlinkable derived proofs.",
          "Blind signatures require an interactive protocol between signer " +
          "and user (at least 2 rounds), which adds latency and complexity " +
          "to credential issuance. Threshold blind signing (t-of-n issuers) " +
          "multiplies this to 2 rounds per signer.",
          "BBS+ signatures are pairing-based (BLS12-381), making them ~10x " +
          "slower to verify than ECDSA. A single BBS+ verification takes " +
          "~5ms on a modern CPU due to pairing computations, vs ~0.5ms for " +
          "Ed25519."
        ],
        exercises: [
          {
            type: "conceptual",
            question:
              "Explain the difference between a standard digital signature, a " +
              "blind signature, and a BBS+ signature. When would you use each " +
              "in an identity system?",
            hint:
              "Think about what the signer learns and what the verifier can " +
              "link across presentations.",
            answer:
              "Standard signature (ECDSA/Ed25519): signer sees the message, " +
              "verifier can link all uses of the same public key. Used for " +
              "transaction signing (Sui transactions). Blind signature (Chaum): " +
              "signer signs without seeing the message content; used for " +
              "credential issuance where the issuer should not learn all " +
              "attributes. BBS+ signature: signer signs a vector of messages " +
              "(attributes), and the holder can later derive unlinkable proofs " +
              "disclosing any subset; used for selective disclosure in " +
              "anonymous credentials."
          },
          {
            type: "comparison",
            question:
              "Compare the verification cost of Ed25519, ECDSA (secp256k1), " +
              "and BBS+ (BLS12-381) in terms of operations and approximate " +
              "wall-clock time. Why does Sui use Ed25519 for transactions " +
              "but the thesis uses BBS+ for credentials?",
            hint:
              "Ed25519 and ECDSA require scalar multiplications. BBS+ requires " +
              "bilinear pairings which are ~10x more expensive.",
            answer:
              "Ed25519: 1 scalar multiplication + 1 point addition, ~0.1ms. " +
              "ECDSA: 2 scalar multiplications + modular inverse, ~0.3ms. " +
              "BBS+: 2-3 pairings + multi-scalar multiplication, ~5ms. " +
              "Sui uses Ed25519 for transaction authentication because speed " +
              "is critical (thousands of TPS). The thesis uses BBS+ for " +
              "credentials because selective disclosure and unlinkability " +
              "require the algebraic structure of pairing-based signatures. " +
              "The 10x cost is acceptable since credential presentation " +
              "happens less frequently than transaction signing."
          },
          {
            type: "design",
            question:
              "Design a blind issuance protocol for BBS+ credentials: how " +
              "does the user get a BBS+ signature on their attributes without " +
              "the issuer learning all attribute values?",
            hint:
              "The user can blind (randomize) some attributes by adding a " +
              "Pedersen commitment, and the issuer signs over the blinded " +
              "values plus the known attributes.",
            answer:
              "The user Pedersen-commits to private attributes (e.g., " +
              "C_priv = g^attr * h^r) and sends C_priv along with public " +
              "attributes (name, nationality) to the issuer. The issuer signs " +
              "the combined vector [public_attrs, C_priv] with BBS+. The user " +
              "unblinds by incorporating the randomness r into their credential " +
              "representation. During presentation, the user proves knowledge " +
              "of r and the private attributes via a ZK proof. The issuer " +
              "never sees the private attribute values, only the commitment."
          }
        ]
      },
      {
        name: "Elliptic Curve Cryptography",
        analogy:
          "Clock arithmetic on a curved surface. Imagine " +
          "adding points on a curve by drawing lines between " +
          "them: it is easy to compute P + P + ... + P = nP " +
          "(scalar multiplication), but given only nP and P, " +
          "finding n is astronomically hard. This one-way " +
          "trapdoor is the foundation of modern public-key " +
          "cryptography.",
        diagram:
          '┌────────────────────────────────────────────┐\n' +
          '│       Elliptic Curve over Finite Field      │\n' +
          '│            y^2 = x^3 + ax + b               │\n' +
          '├────────────────────────────────────────────┤\n' +
          '│                                            │\n' +
          '│        *  P                                │\n' +
          '│       / \\                                  │\n' +
          '│      /   \\  line through P and Q           │\n' +
          '│     /     * Q                              │\n' +
          '│    /       \\                               │\n' +
          '│   /    ─────*──── R (intersection)         │\n' +
          '│              |                             │\n' +
          '│              | reflect over x-axis         │\n' +
          '│              ↓                             │\n' +
          '│              * P + Q                       │\n' +
          '│                                            │\n' +
          '│  KEY GENERATION                            │\n' +
          '│  sk = n (random scalar)                    │\n' +
          '│  pk = n * G (generator point)              │\n' +
          '│                                            │\n' +
          '│  ECDLP: given pk and G, find n → HARD      │\n' +
          '│                                            │\n' +
          '│  PAIRING-FRIENDLY CURVES                   │\n' +
          '│  e: G1 x G2 → GT (bilinear map)           │\n' +
          '│  ┌─────────────────────────────────┐       │\n' +
          '│  │ BN254:     fast, 128-bit sec    │       │\n' +
          '│  │ BLS12-381: standard, 128-bit    │       │\n' +
          '│  └─────────────────────────────────┘       │\n' +
          '└────────────────────────────────────────────┘',
        keyPoints: [
          "The Elliptic Curve Discrete Log Problem (ECDLP) is the security foundation: given G and nG, finding n is infeasible",
          "Key pairs: private key is a scalar n, public key is the point nG on the curve",
          "Pairing-friendly curves (BN254, BLS12-381) enable bilinear maps e(P,Q) used in BBS+ and Groth16",
          "Bilinear pairings satisfy e(aP, bQ) = e(P, Q)^(ab), enabling signature aggregation and ZKP verification",
          "BLS12-381 is the current standard for ZKP-friendly applications due to its security and efficiency"
        ],
        connections:
          "BBS+ signatures operate over pairing-friendly curves, " +
          "specifically BLS12-381. The bilinear pairing enables " +
          "the core selective disclosure mechanism: a verifier " +
          "can check that hidden attributes are correctly " +
          "signed without seeing them. On Sui, Groth16 proof " +
          "verification uses BN254 pairings natively. " +
          "Understanding EC math is essential for grasping how " +
          "credentials are issued, held, and verified.",
        publicPrivate: [
          { item: "curve parameters (a, b, p, G, n)", status: "public", holder: "everyone", when: "always (standardized parameters)" },
          { item: "private key sk (scalar)", status: "private", holder: "key owner", when: "always (never revealed)" },
          { item: "public key pk = [sk]G", status: "public", holder: "everyone", when: "always (derived from sk, published)" },
          { item: "pairing parameters (G1, G2, GT, e)", status: "public", holder: "everyone", when: "always (curve specification)" },
          { item: "discrete log sk from pk", status: "private", holder: "key owner", when: "computationally infeasible to recover (ECDLP hardness)" }
        ],
        thesisExample:
          "Your entire system runs on BLS12-381 — the same " +
          "pairing-friendly curve used by Sui's cryptography module. " +
          "BBS+ signatures require bilinear pairings e(A, [x]₂) for " +
          "verification. Groth16 proofs for on-chain verification " +
          "also use BLS12-381. This curve choice means credential " +
          "operations and ZK verification share the same algebraic " +
          "foundation, simplifying your Sui Move verifier contract.",
        history: {
          inventor: "Neal Koblitz (University of Washington) and Victor Miller (IBM Research)",
          year: 1985,
          context:
            "Koblitz and Miller independently proposed using elliptic curves " +
            "for cryptography in 1985. Before ECC, RSA (1978) and Diffie-Hellman " +
            "(1976) relied on integer factorization and discrete log in Z_p*, " +
            "requiring 2048-bit keys for 112-bit security. ECC achieves the " +
            "same security with 256-bit keys (16x smaller), enabling mobile " +
            "and embedded cryptography. Pairing-based cryptography emerged " +
            "from Boneh and Franklin's identity-based encryption (2001), using " +
            "the Weil and Tate pairings on supersingular curves. BN254 (Barreto " +
            "and Naehrig, 2005) and BLS12-381 (Bowe, 2017 for Zcash Sapling) " +
            "are the dominant pairing-friendly curves today.",
          funFact:
            "When Koblitz first proposed ECC in 1985, the NSA was skeptical. " +
            "By 2005, NSA endorsed Suite B with ECC as the preferred algorithm. " +
            "By 2018, over 80% of TLS connections used ECDHE key exchange."
        },
        limitations: [
          "Not quantum-safe: Shor's algorithm breaks ECDLP in polynomial time " +
          "on a sufficiently large quantum computer. A 256-bit elliptic curve " +
          "key would require ~2,300 logical qubits to break, which is expected " +
          "within 10-20 years.",
          "Pairing computation is expensive: a single e(P,Q) on BLS12-381 " +
          "takes ~1.5ms, compared to ~0.05ms for a scalar multiplication. " +
          "Groth16 verification (3 pairings) costs ~4.5ms, which sets the " +
          "floor for on-chain verification time.",
          "Curve choice creates ecosystem lock-in: BLS12-381 proofs cannot " +
          "be verified in contracts designed for BN254 (different field " +
          "arithmetic), and Sui's native groth16 module currently supports " +
          "only BN254, BLS12-381, and BN254 alt_bn128."
        ],
        exercises: [
          {
            type: "calculation",
            question:
              "On the tiny elliptic curve y^2 = x^3 + 7 over F_17 " +
              "(secp256k1 equation, tiny field), the point G = (15, 13) " +
              "has order 18. Compute 2G using the point doubling formula. " +
              "The tangent slope is lambda = (3*x1^2 + a) / (2*y1) mod 17.",
            hint:
              "a = 0 for this curve. lambda = (3*15^2) / (2*13) mod 17 " +
              "= (3*225) / 26 mod 17 = 675/26 mod 17. Use modular inverse: " +
              "26 mod 17 = 9, and 9^(-1) mod 17 = 2 (since 9*2 = 18 = 1 mod 17).",
            answer:
              "lambda = 675 * 2 mod 17 = 1350 mod 17. 1350 / 17 = 79 remainder 7, " +
              "so lambda = 7. x3 = lambda^2 - 2*x1 = 49 - 30 = 19 mod 17 = 2. " +
              "y3 = lambda*(x1 - x3) - y1 = 7*(15-2) - 13 = 91 - 13 = 78 " +
              "mod 17 = 10. So 2G = (2, 10). You can verify: 10^2 = 100 = " +
              "15 mod 17, and 2^3 + 7 = 15 mod 17. Checks out."
          },
          {
            type: "conceptual",
            question:
              "What is the bilinear property of pairings, and why is it " +
              "essential for BBS+ signature verification?",
            hint:
              "The bilinear property states e(aP, bQ) = e(P,Q)^(ab). " +
              "Think about how a verifier checks a signature without " +
              "knowing the signer's secret key.",
            answer:
              "Bilinearity means e(aP, Q) = e(P, aQ) = e(P,Q)^a. In BBS+ " +
              "verification, the verifier checks e(A, pk) = e(H, G2) where " +
              "A is the signature element and pk = [sk]G2. Without knowing " +
              "sk, the verifier uses the pairing to algebraically relate " +
              "the signature to the public key. Bilinearity lets the " +
              "verification equation hold without revealing sk: " +
              "e(A, [sk]G2) = e([sk]A, G2) = e(H, G2) when A = [1/sk]H. " +
              "This algebraic trick is impossible with non-pairing curves."
          }
        ]
      },
      {
        name: "Zero-Knowledge Proofs (Fundamentals)",
        analogy:
          "Proving you know the exit of a maze without " +
          "showing the path. In Ali Baba's cave, two tunnels " +
          "meet at a locked door inside. You enter one " +
          "tunnel, the verifier shouts which tunnel to exit " +
          "from. If you know the secret (the door's code), " +
          "you always exit correctly. After many rounds, the " +
          "verifier is convinced you know the secret without " +
          "ever seeing the code.",
        diagram:
          '┌──────────────────────────────────────────────┐\n' +
          '│       Zero-Knowledge Proof System             │\n' +
          '├──────────────────────────────────────────────┤\n' +
          '│                                              │\n' +
          '│   Prover (knows w)       Verifier            │\n' +
          '│   ┌──────────┐          ┌──────────┐         │\n' +
          '│   │ witness w │          │ statement │         │\n' +
          '│   │ statement │          │   only    │         │\n' +
          '│   └─────┬────┘          └─────┬────┘         │\n' +
          '│         │    proof            │               │\n' +
          '│         │──────────────────→ │               │\n' +
          '│         │                    │               │\n' +
          '│         │   accept/reject    │               │\n' +
          '│         │ ←──────────────────│               │\n' +
          '│                                              │\n' +
          '│   THREE PROPERTIES                           │\n' +
          '│   ┌────────────────────────────────────────┐ │\n' +
          '│   │ 1. Completeness: honest P convinces V  │ │\n' +
          '│   │ 2. Soundness: cheating P fails         │ │\n' +
          '│   │ 3. Zero-Knowledge: V learns nothing    │ │\n' +
          '│   │    beyond the statement truth           │ │\n' +
          '│   └────────────────────────────────────────┘ │\n' +
          '│                                              │\n' +
          '│   Interactive → Non-interactive              │\n' +
          '│   (Fiat-Shamir: replace verifier with hash)  │\n' +
          '└──────────────────────────────────────────────┘',
        keyPoints: [
          "Completeness: an honest prover with a valid witness always convinces the verifier",
          "Soundness: a dishonest prover without a valid witness cannot convince the verifier (except with negligible probability)",
          "Zero-knowledge: the verifier learns nothing beyond the truth of the statement",
          "Fiat-Shamir heuristic transforms interactive proofs into non-interactive ones by replacing the verifier's challenge with a hash",
          "Non-interactive ZKPs (NIZKs) are essential for blockchain: no back-and-forth, just submit proof on-chain"
        ],
        connections:
          "ZKPs are the heart of the thesis. Anonymous " +
          "credential presentation is fundamentally a " +
          "zero-knowledge proof: the holder proves they " +
          "possess a valid credential with certain attributes " +
          "without revealing the credential or other " +
          "attributes. On Sui, these proofs must be " +
          "non-interactive (Fiat-Shamir) so they can be " +
          "verified in a single transaction without " +
          "multi-round interaction.",
        publicPrivate: [
          { item: "statement x", status: "public", holder: "everyone", when: "always (what is being proved)" },
          { item: "witness w", status: "private", holder: "prover", when: "always (never revealed to verifier)" },
          { item: "proof pi", status: "public", holder: "everyone", when: "after proof generation" },
          { item: "verifier's challenge e", status: "public", holder: "everyone", when: "during/after protocol (or derived via Fiat-Shamir)" },
          { item: "prover's internal randomness", status: "private", holder: "prover", when: "always (used during proof generation, never revealed)" },
          { item: "verification result (accept/reject)", status: "public", holder: "everyone", when: "after verification" }
        ],
        thesisExample:
          "ZKPs are the privacy backbone of your thesis. During " +
          "credential presentation, a ZK proof convinces the Sui " +
          "verifier that the user holds a valid BBS+ credential with " +
          "certain attributes, without revealing the credential " +
          "itself. During payment, another ZK proof shows the user " +
          "has sufficient balance without revealing the amount. The " +
          "proof is posted on-chain — anyone can verify, but no one " +
          "learns private data.",
        history: {
          inventor: "Shafi Goldwasser, Silvio Micali, Charles Rackoff (MIT/University of Toronto)",
          year: 1985,
          context:
            "Goldwasser, Micali, and Rackoff introduced zero-knowledge proofs " +
            "in 'The Knowledge Complexity of Interactive Proof Systems' " +
            "(STOC 1985, journal version in SIAM 1989). The paper defined the " +
            "three properties (completeness, soundness, zero-knowledge) and " +
            "showed that quadratic residuosity could be proved in ZK. Amos " +
            "Fiat and Adi Shamir (1986) transformed interactive proofs into " +
            "non-interactive ones via the Fiat-Shamir heuristic (replacing " +
            "verifier randomness with a hash). Goldwasser and Micali received " +
            "the Turing Award in 2012 for this foundational work.",
          funFact:
            "The original GMR paper was rejected from STOC 1984 because " +
            "reviewers found the zero-knowledge concept 'too theoretical to " +
            "be interesting.' It was accepted the following year and became " +
            "one of the most influential papers in theoretical computer science."
        },
        limitations: [
          "Interactive ZKPs require multiple rounds of communication between " +
          "prover and verifier, making them impractical for blockchain where " +
          "the verifier is a smart contract. The Fiat-Shamir transform fixes " +
          "this but relies on the random oracle model (hash behaves as truly " +
          "random), which is a heuristic assumption, not a proof.",
          "Computational vs statistical zero-knowledge: most practical ZK " +
          "systems (Groth16, PLONK) achieve computational ZK, meaning a " +
          "computationally bounded adversary cannot extract information. A " +
          "quantum adversary might break computational ZK for pairing-based " +
          "systems.",
          "Soundness is only guaranteed with overwhelming probability (1 - 1/2^k " +
          "for k-bit challenge). With a 128-bit challenge, the probability " +
          "of a cheating prover succeeding is 2^-128, but it is never exactly " +
          "zero. Proof-of-knowledge extraction requires rewinding, which " +
          "does not work in concurrent settings without careful protocol design."
        ],
        exercises: [
          {
            type: "conceptual",
            question:
              "Explain the Ali Baba cave analogy for zero-knowledge proofs. " +
              "What does each element of the analogy (cave, tunnels, door, " +
              "code) correspond to in the formal definition?",
            hint:
              "The cave has two tunnels meeting at a locked door. The prover " +
              "enters one tunnel, the verifier shouts which tunnel to exit from.",
            answer:
              "Cave = the proof system. Two tunnels = two possible executions " +
              "(the prover takes one path). Locked door = the NP relation " +
              "(the computational problem). Door code = the witness (secret " +
              "solution). Verifier shouting = random challenge. Correct exit " +
              "= valid response. After k rounds, the verifier is convinced " +
              "with probability 1 - 2^-k that the prover knows the code, " +
              "but never learns the code itself. The simulator (for ZK " +
              "property) can fake the transcript by choosing the exit first " +
              "and filming backwards."
          },
          {
            type: "comparison",
            question:
              "Compare interactive ZKPs, NIZKs (Fiat-Shamir), and ZK-SNARKs " +
              "in terms of: number of rounds, proof size, verification time, " +
              "and trust assumptions. Which is best for on-chain verification?",
            hint:
              "Interactive: multiple rounds. Fiat-Shamir NIZK: 1 message, " +
              "random oracle assumption. ZK-SNARK: 1 message, trusted setup.",
            answer:
              "Interactive ZKP: O(k) rounds (k = soundness parameter), " +
              "O(k) communication, O(k) verification, no trust assumptions " +
              "beyond standard crypto. Fiat-Shamir NIZK: 1 round (non-interactive), " +
              "proof size depends on the Sigma protocol (~1KB), linear " +
              "verification, random oracle model. ZK-SNARK (Groth16): " +
              "1 round, 288 bytes constant, O(1) verification (3 pairings), " +
              "but requires trusted setup. For on-chain verification, " +
              "ZK-SNARKs win because constant proof size and O(1) verification " +
              "minimize gas costs and storage on Sui."
          },
          {
            type: "design",
            question:
              "In the thesis, why must the ZKP for credential presentation " +
              "be non-interactive? What would happen if you used an " +
              "interactive protocol on Sui?",
            hint:
              "Sui smart contracts execute in a single transaction. There is " +
              "no mechanism for multi-round interaction with a contract.",
            answer:
              "Sui Move contracts are invoked in a single transaction with " +
              "no state between calls for an ongoing protocol session. An " +
              "interactive ZKP would require the contract to store the " +
              "commitment (round 1), wait for the user to respond to a " +
              "challenge (round 2), and verify (round 3) across separate " +
              "transactions. This is expensive (3 transactions, on-chain " +
              "state storage, timing attacks). A non-interactive proof " +
              "(Fiat-Shamir or SNARK) is submitted and verified atomically " +
              "in a single transaction, which is cheaper, simpler, and " +
              "prevents front-running of the challenge."
          }
        ]
      },
      {
        name: "Sigma Protocols",
        analogy:
          "A three-step dance between prover and verifier. " +
          "Step 1: the prover commits to a random value " +
          "(like showing a locked safe). Step 2: the " +
          "verifier issues a random challenge (like asking " +
          "to open a specific compartment). Step 3: the " +
          "prover responds correctly (opening it). This " +
          "three-move structure is the simplest form of " +
          "interactive zero-knowledge proof.",
        diagram:
          '┌──────────────────────────────────────────────┐\n' +
          '│           Sigma Protocol (3-move)             │\n' +
          '├──────────────────────────────────────────────┤\n' +
          '│                                              │\n' +
          '│   Prover                     Verifier        │\n' +
          '│     │                           │            │\n' +
          '│     │  1. COMMITMENT (a)        │            │\n' +
          '│     │   a = g^k (random k)      │            │\n' +
          '│     │────────────────────────→  │            │\n' +
          '│     │                           │            │\n' +
          '│     │  2. CHALLENGE (e)         │            │\n' +
          '│     │   e = random              │            │\n' +
          '│     │  ←────────────────────────│            │\n' +
          '│     │                           │            │\n' +
          '│     │  3. RESPONSE (z)          │            │\n' +
          '│     │   z = k + e*x             │            │\n' +
          '│     │────────────────────────→  │            │\n' +
          '│     │                           │            │\n' +
          '│     │         Verify:           │            │\n' +
          '│     │      g^z = a * pk^e ?     │            │\n' +
          '│                                              │\n' +
          '│   SCHNORR PROTOCOL                           │\n' +
          '│   Proves knowledge of discrete log x         │\n' +
          '│   where pk = g^x, without revealing x        │\n' +
          '│                                              │\n' +
          '│   COMPOSITIONS                               │\n' +
          '│   AND: prove knowledge of x AND y            │\n' +
          '│   OR:  prove knowledge of x OR y             │\n' +
          '│        (without revealing which)              │\n' +
          '└──────────────────────────────────────────────┘',
        keyPoints: [
          "Three-move structure: commitment (a), challenge (e), response (z)",
          "Schnorr protocol: the canonical Sigma protocol for proving knowledge of a discrete logarithm",
          "Honest-verifier zero-knowledge (HVZK): secure when the verifier follows the protocol honestly",
          "AND/OR compositions allow proving compound statements without revealing which branch is satisfied",
          "Made non-interactive via Fiat-Shamir: e = H(a || statement) replaces the verifier's random challenge"
        ],
        connections:
          "Sigma protocols are the proof mechanism inside BBS+ " +
          "credential presentation. When a holder presents a " +
          "credential on Sui, they run a composed Sigma " +
          "protocol: an AND-proof that they know the issuer's " +
          "signature and that the hidden attributes satisfy " +
          "certain predicates. The Schnorr protocol proves " +
          "knowledge of the secret key binding the credential " +
          "to the holder, preventing credential transfer.",
        publicPrivate: [
          { item: "first message a (commitment)", status: "public", holder: "everyone", when: "after prover sends it (step 1)" },
          { item: "challenge e", status: "public", holder: "everyone", when: "after verifier sends it (step 2)" },
          { item: "response z", status: "public", holder: "everyone", when: "after prover sends it (step 3)" },
          { item: "prover's random nonce k", status: "private", holder: "prover", when: "always (used to compute a = g^k, never revealed)" },
          { item: "secret x (discrete log)", status: "private", holder: "prover", when: "always (the value being proved, never revealed)" },
          { item: "transcript (a, e, z)", status: "public", holder: "everyone", when: "after protocol completes" }
        ],
        thesisExample:
          "Your BBS+ selective disclosure uses Sigma protocols " +
          "internally. When proving knowledge of hidden attributes, " +
          "the prover runs a Schnorr-like protocol: commit to " +
          "randomized values, receive a challenge (Fiat-Shamir), " +
          "respond. The OR-composition of Sigma protocols could " +
          "enable 'prove I'm from EU OR I have premium KYC' without " +
          "revealing which condition is met — useful for flexible " +
          "credential policies on Sui.",
        history: {
          inventor: "Claus-Peter Schnorr (Goethe University Frankfurt)",
          year: 1989,
          context:
            "Schnorr published 'Efficient Identification and Signatures for " +
            "Smart Cards' at CRYPTO 1989, giving the canonical three-move " +
            "protocol for proving knowledge of a discrete logarithm. The term " +
            "'Sigma protocol' was coined by Ronald Cramer in his 1997 PhD " +
            "thesis at the University of Amsterdam, named for the Greek letter " +
            "Sigma describing the three-flow communication pattern. Ivan " +
            "Damgard formalized AND/OR compositions in 2002, enabling compound " +
            "statements. The Fiat-Shamir heuristic (1986) made Sigma protocols " +
            "non-interactive by replacing the verifier's challenge with a hash.",
          funFact:
            "Schnorr patented his signature scheme (US Patent 4,995,082, " +
            "filed 1989). This patent blocked adoption for years and prevented " +
            "Schnorr signatures from being selected for DSS (NIST chose DSA " +
            "instead as a workaround). The patent expired in 2008, and " +
            "Schnorr signatures finally entered widespread use via Ed25519 " +
            "(Bernstein, 2011)."
        },
        limitations: [
          "Honest-verifier zero-knowledge (HVZK) only: if the verifier " +
          "deviates from the protocol (e.g., choosing challenges adaptively), " +
          "security may break. Achieving full ZK against malicious verifiers " +
          "requires additional techniques (e.g., commitment to the challenge).",
          "Nonce reuse is catastrophic: if the prover uses the same random k " +
          "in two Schnorr proofs with different challenges e1 and e2, the " +
          "secret x can be extracted as x = (z1 - z2) / (e1 - e2). This " +
          "exact attack extracted the PlayStation 3 ECDSA private key in 2010.",
          "OR-composition leaks which branch is NOT satisfied to the prover " +
          "(since the prover simulates one branch). This is fine when the " +
          "prover is honest, but in some MPC settings it can be problematic. " +
          "The simulator for the OR-proof also has a specific structure that " +
          "limits composability with other protocols."
        ],
        exercises: [
          {
            type: "calculation",
            question:
              "In a Schnorr protocol over Z_23* with generator g=5, the " +
              "prover's secret is x=7 (so pk = 5^7 mod 23 = 17). The prover " +
              "picks random k=3, computes commitment a = g^k = 5^3 mod 23. " +
              "The verifier sends challenge e=4. Compute the response z and " +
              "verify the proof.",
            hint:
              "z = k + e*x mod (order of g). The order of 5 in Z_23* is 22. " +
              "Verification checks g^z = a * pk^e mod 23.",
            answer:
              "a = 5^3 mod 23 = 125 mod 23 = 10. z = (3 + 4*7) mod 22 = " +
              "31 mod 22 = 9. Verification LHS: g^z = 5^9 mod 23. Computing " +
              "step by step: 5^2 = 2, 5^4 = 4, 5^8 = 16, 5^9 = 16*5 = " +
              "80 mod 23 = 11. Verification RHS: a * pk^e = 10 * 17^4 mod " +
              "23. Computing: 17^2 = 289 mod 23 = 13, 17^4 = 13^2 = 169 " +
              "mod 23 = 8. So 10 * 8 = 80 mod 23 = 11. LHS = RHS = 11. " +
              "Proof valid."
          },
          {
            type: "conceptual",
            question:
              "Explain why nonce reuse in a Schnorr signature/proof is " +
              "catastrophic. If a prover uses the same k for two different " +
              "challenges e1 and e2, how does an attacker recover the " +
              "secret x?",
            hint:
              "z1 = k + e1*x and z2 = k + e2*x. Two equations, two unknowns.",
            answer:
              "With z1 = k + e1*x and z2 = k + e2*x, subtract: " +
              "z1 - z2 = (e1 - e2)*x, so x = (z1 - z2)/(e1 - e2) mod q. " +
              "The attacker recovers the full secret key from two transcripts " +
              "sharing the same nonce. This is exactly how fail0verflow " +
              "extracted Sony's PS3 ECDSA key in 2010: Sony used a static " +
              "random number in their ECDSA implementation. The lesson: " +
              "nonces must be generated deterministically (RFC 6979) or " +
              "with hardware randomness, never reused."
          },
          {
            type: "design",
            question:
              "How would you use an OR-composition of Sigma protocols to " +
              "prove 'I am an EU citizen OR I have premium KYC status' " +
              "without revealing which condition is met?",
            hint:
              "In an OR-proof, the prover honestly executes one branch " +
              "and simulates the other. The verifier cannot distinguish " +
              "which was real.",
            answer:
              "Let statement S1 = 'credential contains EU nationality' and " +
              "S2 = 'credential contains premium KYC flag'. The prover knows " +
              "a witness for one (say S1). For S1, run the real Sigma protocol: " +
              "commit a1 = g^k, receive challenge e, compute e1 from the " +
              "overall challenge. For S2, simulate: choose z2 and e2 first, " +
              "compute a2 = g^z2 * pk^(-e2) (valid-looking transcript). Set " +
              "e1 = e - e2 mod q. The verifier checks both branches and that " +
              "e1 + e2 = e, but cannot determine which branch was simulated. " +
              "This is the standard Cramer-Damgard-Schoenmakers (CDS) OR-proof " +
              "technique from 1994."
          }
        ]
      },
      {
        name: "Oblivious Transfer (OT)",
        analogy:
          "A vending machine where the seller does not see " +
          "what you picked, and you only get the item you " +
          "chose — neither learns the other's secret. Like " +
          "choosing a card from a deck face-down: dealer " +
          "does not know which card you took, you do not " +
          "see the other cards.",
        diagram:
          '┌──────────────────────────────────────────────┐\n' +
          '│         1-of-2 Oblivious Transfer             │\n' +
          '├──────────────────────────────────────────────┤\n' +
          '│                                              │\n' +
          '│   Sender                    Receiver         │\n' +
          '│   ┌──────────┐             ┌──────────┐      │\n' +
          '│   │ m0 , m1  │             │ choice b │      │\n' +
          '│   └─────┬────┘             └─────┬────┘      │\n' +
          '│         │      OT protocol       │           │\n' +
          '│         │◄──────────────────────►│           │\n' +
          '│         │                        │           │\n' +
          '│   ┌─────┴────────────────────────┴─────┐     │\n' +
          '│   │  Receiver gets: m_b                │     │\n' +
          '│   │  Sender learns: nothing about b    │     │\n' +
          '│   │  Receiver learns: nothing about    │     │\n' +
          '│   │    m_(1-b)                         │     │\n' +
          '│   └────────────────────────────────────┘     │\n' +
          '│                                              │\n' +
          '│   OT EXTENSION (IKNP)                        │\n' +
          '│   few base OTs ──→ many cheap OTs            │\n' +
          '└──────────────────────────────────────────────┘',
        keyPoints: [
          "Foundation of MPC — all MPC can be built from OT",
          "1-of-2 OT: sender has 2 messages, receiver picks one without sender knowing which",
          "OT extension: few 'real' OTs produce many cheap OTs (IKNP protocol)",
          "Base OT from Diffie-Hellman assumption, extended OT is nearly free",
          "Variants: 1-of-n OT, k-of-n OT, string OT"
        ],
        connections:
          "OT enables private credential issuance — the " +
          "issuer can sign a credential without learning " +
          "which attributes the user chose to include. " +
          "Combined with blind signatures, OT is a building " +
          "block for privacy-preserving identity systems.",
        publicPrivate: [
          { item: "sender's messages (m0, m1)", status: "private", holder: "sender", when: "always (sender never reveals both)" },
          { item: "receiver's choice bit b", status: "private", holder: "receiver", when: "always (sender learns nothing about b)" },
          { item: "chosen message m_b", status: "private", holder: "receiver", when: "after protocol (only receiver learns it)" },
          { item: "unchosen message m_(1-b)", status: "private", holder: "sender", when: "always (receiver learns nothing about it)" }
        ],
        thesisExample:
          "OT could enable private credential issuance in your " +
          "system. The issuer holds signing capabilities for multiple " +
          "attribute types, and the user selects which attributes to " +
          "include without the issuer learning the selection. This " +
          "is especially relevant for selective attribute enrollment: " +
          "a user might want to include their nationality but not " +
          "their employer in a credential, without revealing this " +
          "choice to the issuer.",
        history: {
          inventor: "Michael Rabin (Harvard University)",
          year: 1981,
          context:
            "Rabin introduced oblivious transfer in 'How to Exchange Secrets " +
            "with Oblivious Transfer' (Technical Report TR-81, 1981). His " +
            "original version was 'all-or-nothing': the receiver gets the " +
            "message with probability 1/2, and neither party knows the " +
            "outcome. Shimon Even, Oded Goldreich, and Abraham Lempel (1985) " +
            "introduced the more useful 1-of-2 OT variant. Ishai, Kilian, " +
            "Nissim, and Petrank (IKNP, 2003) showed how to extend a small " +
            "number of base OTs into millions of cheap OTs using only " +
            "symmetric-key operations, making OT practical for large-scale MPC.",
          funFact:
            "Joe Kilian proved in 1988 that OT is 'complete' for secure " +
            "computation: any two-party computation can be built from OT " +
            "alone. This means OT is the cryptographic equivalent of a " +
            "universal logic gate."
        },
        limitations: [
          "Base OT requires public-key operations (typically Diffie-Hellman), " +
          "making the first ~128 OTs expensive (~1ms each). OT extension " +
          "(IKNP) amortizes this but still requires those initial base OTs.",
          "OT is inherently interactive (at least 2 rounds for 1-of-2 OT), " +
          "which is problematic for blockchain settings where the receiver " +
          "might be a smart contract that cannot participate in real-time " +
          "interaction.",
          "Malicious security for OT (protecting against cheating parties) " +
          "roughly doubles the communication cost compared to semi-honest " +
          "security. Protocols like ALSZ13 add consistency checks that " +
          "increase computation by ~40%."
        ],
        exercises: [
          {
            type: "conceptual",
            question:
              "Explain the difference between Rabin's original OT (1981) " +
              "and 1-of-2 OT (Even-Goldreich-Lempel, 1985). Why is 1-of-2 " +
              "OT more useful for MPC?",
            hint:
              "In Rabin OT, the receiver gets the message with probability " +
              "1/2 and neither knows if transfer occurred. In 1-of-2 OT, " +
              "the receiver chooses which of two messages to receive.",
            answer:
              "Rabin OT: sender has one message m. Receiver gets m with " +
              "probability 1/2 and 'nothing' with probability 1/2. Neither " +
              "party knows the outcome. This is useful for some protocols " +
              "but impractical for MPC where the receiver needs a specific " +
              "input. 1-of-2 OT: sender has (m0, m1), receiver has choice " +
              "bit b, receiver gets m_b. Sender learns nothing about b, " +
              "receiver learns nothing about m_(1-b). This is directly " +
              "useful for garbled circuit evaluation: the evaluator uses " +
              "OT to obtain their input wire labels without the garbler " +
              "learning which labels were chosen."
          },
          {
            type: "comparison",
            question:
              "OT extension (IKNP 2003) turns k base OTs into n >> k " +
              "extended OTs. If base OT costs 1ms of public-key crypto " +
              "each, and extended OT costs 1 microsecond of symmetric-key " +
              "crypto each, what is the total time for 1 million OTs?",
            hint:
              "You need k = 128 base OTs, then 1,000,000 extended OTs. " +
              "Sum the two phases.",
            answer:
              "Phase 1 (base OTs): 128 * 1ms = 128ms. Phase 2 (extensions): " +
              "1,000,000 * 1 microsecond = 1,000ms = 1 second. Total: ~1.13 " +
              "seconds for 1 million OTs. Without extension, it would be " +
              "1,000,000 * 1ms = 1,000 seconds (~16 minutes). OT extension " +
              "provides a ~900x speedup for large-scale MPC protocols. This " +
              "is why IKNP is considered one of the most impactful results " +
              "in practical MPC."
          }
        ]
      },
      {
        name: "Multi-Party Computation (MPC)",
        analogy:
          "Three millionaires want to know who is richest " +
          "without revealing their exact wealth. MPC lets " +
          "them compute the answer collaboratively — each " +
          "inputs their secret, the protocol outputs only " +
          "the final result, and no one learns anyone " +
          "else's input.",
        diagram:
          '┌──────────────────────────────────────────────┐\n' +
          '│         Multi-Party Computation               │\n' +
          '├──────────────────────────────────────────────┤\n' +
          '│                                              │\n' +
          '│   P1 (x1)    P2 (x2)    ...    Pn (xn)      │\n' +
          '│     │           │                │           │\n' +
          '│     └───────────┼────────────────┘           │\n' +
          '│                 ↓                            │\n' +
          '│        ┌────────────────┐                    │\n' +
          '│        │  MPC Protocol  │                    │\n' +
          '│        │ f(x1,...,xn)   │                    │\n' +
          '│        └───────┬────────┘                    │\n' +
          '│                ↓                             │\n' +
          '│   ┌────────────────────────────────┐         │\n' +
          '│   │ Each party learns only output  │         │\n' +
          '│   │ y = f(x1, ..., xn)             │         │\n' +
          '│   │ No party learns other inputs    │         │\n' +
          '│   └────────────────────────────────┘         │\n' +
          '│                                              │\n' +
          '│   PARADIGMS                                  │\n' +
          '│   Garbled circuits: 2-party, const rounds    │\n' +
          '│   Secret sharing:  n-party, per-gate comm    │\n' +
          '└──────────────────────────────────────────────┘',
        keyPoints: [
          "Compute any function on private inputs without a trusted third party",
          "Two main paradigms: garbled circuits (2-party, constant rounds) and secret sharing (n-party, interaction per gate)",
          "Semi-honest vs malicious security models",
          "Practical applications: threshold signatures, private auctions, salary benchmarking",
          "MPC-in-the-head: use MPC simulation for ZK proofs (Ligero, MPC-in-the-head paradigm)"
        ],
        connections:
          "MPC can distribute trust in credential issuance " +
          "— no single issuer sees all attributes. Threshold " +
          "BBS+ signatures use MPC so multiple authorities " +
          "jointly sign credentials. For your thesis, MPC " +
          "could enable distributed TEE key management.",
        publicPrivate: [
          { item: "each party's input x_i", status: "private", holder: "party i", when: "always (no other party learns it)" },
          { item: "function f", status: "public", holder: "everyone", when: "always (agreed upon before protocol)" },
          { item: "output y = f(x1,...,xn)", status: "public", holder: "all parties (or designated recipients)", when: "after protocol completes" },
          { item: "intermediate computation values", status: "private", holder: "distributed as secret shares", when: "during protocol (no single party sees cleartext intermediates)" }
        ],
        thesisExample:
          "Threshold BBS+ issuance uses MPC: 3 out of 5 issuers " +
          "jointly sign a credential, so no single issuer sees all " +
          "attributes or holds the full signing key. This distributes " +
          "trust in your identity system. MPC-in-the-head could also " +
          "provide an alternative ZK proof system for credential " +
          "verification, avoiding the trusted setup of Groth16 at " +
          "the cost of larger proofs.",
        history: {
          inventor: "Andrew Yao (Stanford University / Tsinghua University)",
          year: 1982,
          context:
            "Yao introduced the 'Millionaires Problem' and garbled circuits " +
            "for 2-party computation at FOCS 1982. Oded Goldreich, Silvio " +
            "Micali, and Avi Wigderson (GMW, 1987) extended this to n-party " +
            "computation using secret sharing. Ben-Or, Goldwasser, and " +
            "Wigderson (BGW, 1988) showed information-theoretic MPC is " +
            "possible when honest parties form a majority. Ivan Damgard, " +
            "Valerio Pastro, Nigel Smart, and Sarah Zakarias introduced SPDZ " +
            "(pronounced 'Speedz', 2012), the first practical maliciously " +
            "secure MPC protocol using somewhat homomorphic encryption for " +
            "preprocessing.",
          funFact:
            "Yao received the Turing Award in 2000 for his foundational " +
            "contributions to computation theory, including MPC. The " +
            "Millionaires Problem he posed in 1982 is still the most " +
            "common way MPC is explained to newcomers, 44 years later."
        },
        limitations: [
          "Communication complexity scales at least linearly with the number " +
          "of parties (O(n^2) for naive protocols). A 10-party GMW protocol " +
          "sends O(n^2 * |C|) field elements where |C| is the circuit size, " +
          "making large computations with many parties impractical.",
          "Malicious security is 3-20x more expensive than semi-honest " +
          "security depending on the protocol. SPDZ achieves malicious " +
          "security via MAC-based verification, adding ~3x overhead. " +
          "Garbled circuits with cut-and-choose (Lindell 2013) add ~40x.",
          "MPC assumes network availability and synchrony for liveness. If " +
          "enough parties go offline (more than n-t for a t-threshold " +
          "protocol), the computation halts. This is problematic for " +
          "blockchain-based MPC where node availability is not guaranteed."
        ],
        exercises: [
          {
            type: "conceptual",
            question:
              "What is the difference between semi-honest and malicious " +
              "security in MPC? Why does the thesis care about this " +
              "distinction for threshold BBS+ issuance?",
            hint:
              "Semi-honest parties follow the protocol but try to learn " +
              "from the transcript. Malicious parties can deviate arbitrarily.",
            answer:
              "Semi-honest (passive): parties follow the protocol correctly " +
              "but try to infer others' inputs from the messages they see. " +
              "Sufficient when parties are trusted institutions (e.g., " +
              "government issuers). Malicious (active): parties can send " +
              "arbitrary messages, abort, or collude. Required when parties " +
              "are mutually distrusting (e.g., competing credential issuers). " +
              "For the thesis, threshold BBS+ issuance with mutually " +
              "distrusting issuers (e.g., different countries' identity " +
              "authorities) requires malicious security, as a corrupt issuer " +
              "could try to sign unauthorized credentials."
          },
          {
            type: "comparison",
            question:
              "Compare garbled circuits (Yao) and secret sharing (GMW/BGW) " +
              "for MPC. Which approach is better for 2-party computation, " +
              "and which for 5-party computation? Why?",
            hint:
              "Think about round complexity: garbled circuits have constant " +
              "rounds, secret sharing requires communication per gate.",
            answer:
              "Garbled circuits (Yao): constant rounds (2-3), 2-party only, " +
              "communication = O(|C| * kappa) where kappa is the security " +
              "parameter, good for high-latency networks. Secret sharing " +
              "(GMW/BGW): O(depth(C)) rounds (one per multiplication depth), " +
              "n-party, communication = O(n^2 * |C|), good for low-latency " +
              "networks with many parties. For 2-party: garbled circuits win " +
              "(fewer rounds, optimized with free-XOR and half-gates). For " +
              "5-party: secret sharing wins (garbled circuits do not generalize " +
              "efficiently beyond 2 parties, while BGW scales naturally to n)."
          },
          {
            type: "design",
            question:
              "Design a threshold BBS+ signing protocol for 3-of-5 issuers. " +
              "What does each issuer contribute, and how is the final " +
              "signature assembled without any single issuer seeing the " +
              "full signing key?",
            hint:
              "The BBS+ signing key sk is Shamir-shared among 5 issuers. " +
              "Each issuer contributes a partial signature using their share.",
            answer:
              "Setup: Shamir-share the BBS+ signing key sk into 5 shares " +
              "(sk_1, ..., sk_5) with threshold 3. Each issuer i holds sk_i. " +
              "Signing: the user sends the attribute commitment to all 5 " +
              "issuers. Any 3 issuers compute partial signatures " +
              "sigma_i = H(attrs)^(lambda_i * sk_i) where lambda_i are " +
              "Lagrange interpolation coefficients. The user (or a combiner) " +
              "multiplies the partial signatures: sigma = prod(sigma_i) = " +
              "H(attrs)^(sum(lambda_i * sk_i)) = H(attrs)^sk. The full " +
              "signing key sk is never reconstructed. If 2 issuers are " +
              "compromised, they cannot sign (need 3 shares)."
          }
        ]
      },
      {
        name: "Secret Sharing",
        analogy:
          "A treasure map torn into 5 pieces — you need at " +
          "least 3 pieces to find the treasure, but any 2 " +
          "pieces reveal absolutely nothing. Shamir's " +
          "scheme uses polynomial interpolation: the secret " +
          "is the y-intercept of a random polynomial, and " +
          "each share is a point on the curve.",
        diagram:
          '┌──────────────────────────────────────────────┐\n' +
          '│      Shamir Secret Sharing (t,n)              │\n' +
          '├──────────────────────────────────────────────┤\n' +
          '│                                              │\n' +
          '│   secret s = f(0)                            │\n' +
          '│   f(x) = s + a1*x + ... + a(t-1)*x^(t-1)    │\n' +
          '│   (random polynomial of degree t-1)          │\n' +
          '│                                              │\n' +
          '│     f(x)                                     │\n' +
          '│      │   *                                   │\n' +
          '│      │  * share3                             │\n' +
          '│      │ *     * share4                        │\n' +
          '│   s ─*────────────── (y-intercept)           │\n' +
          '│      │  * share1                             │\n' +
          '│      │     * share2                          │\n' +
          '│      └──────────────────── x                 │\n' +
          '│                                              │\n' +
          '│   t shares → reconstruct s (interpolation)   │\n' +
          '│   < t shares → zero information about s      │\n' +
          '└──────────────────────────────────────────────┘',
        keyPoints: [
          "Shamir (t,n): secret is f(0), shares are f(1),...,f(n) on degree-(t-1) polynomial",
          "Additive sharing: secret = sum of shares (simpler, t=n only)",
          "Information-theoretic security: fewer than t shares reveal nothing (not even computationally)",
          "Foundation for MPC protocols (SPDZ, BGW)",
          "Verifiable secret sharing (VSS): detect cheating dealers"
        ],
        connections:
          "Secret sharing enables threshold credential " +
          "issuance — t-of-n issuers must cooperate to sign " +
          "a credential, preventing single-point compromise. " +
          "For TEE key management, secret sharing distributes " +
          "the enclave sealing key across multiple TEE " +
          "instances.",
        publicPrivate: [
          { item: "secret s", status: "private", holder: "dealer (initially)", when: "before sharing; reconstructed only when >= t shares combine" },
          { item: "share s_i", status: "private", holder: "party i", when: "always (each party holds only their share)" },
          { item: "threshold t and total n", status: "public", holder: "everyone", when: "always (scheme parameters)" },
          { item: "reconstructed secret s", status: "revealed", holder: "reconstructing parties", when: "when >= t shares are combined (information-theoretic security: < t shares reveal nothing)" }
        ],
        thesisExample:
          "In your thesis architecture, the issuer's BBS+ signing " +
          "key could be Shamir-shared among multiple TEE instances. " +
          "If one TEE is compromised, the attacker gets one share — " +
          "useless alone. Threshold reconstruction (e.g., 3-of-5) " +
          "ensures the system remains operational even if 2 TEE " +
          "instances fail, while keeping the full signing key safe " +
          "from any single point of compromise.",
        history: {
          inventor: "Adi Shamir (Weizmann Institute of Science)",
          year: 1979,
          context:
            "Shamir published 'How to Share a Secret' in Communications of " +
            "the ACM (November 1979). George Blakley independently proposed " +
            "a different geometric scheme the same year at the AFIPS " +
            "conference. Shamir's scheme uses polynomial interpolation: the " +
            "secret is the y-intercept f(0) of a random degree-(t-1) " +
            "polynomial, and each share is a point f(i). Before these " +
            "schemes, distributing secrets required trusting a single " +
            "custodian. Feldman (1987) added verifiability (VSS): " +
            "shareholders can verify their shares are consistent without " +
            "learning the secret.",
          funFact:
            "Adi Shamir is the 'S' in RSA (Rivest-Shamir-Adleman). He " +
            "published both RSA and secret sharing within a year of each " +
            "other (1978-1979), establishing two pillars of modern " +
            "cryptography before age 27."
        },
        limitations: [
          "Shamir's scheme requires synchronous communication for " +
          "reconstruction: all t shareholders must be online simultaneously " +
          "to contribute their shares. Asynchronous secret sharing (Cachin " +
          "et al., 2002) exists but adds significant complexity.",
          "Share refresh is necessary for long-lived secrets: if an adversary " +
          "compromises shares over time (mobile adversary model), they might " +
          "accumulate t shares from different epochs. Proactive secret sharing " +
          "(Herzberg et al., 1995) addresses this but requires periodic " +
          "resharing among all parties.",
          "Linear secret sharing schemes (including Shamir) reveal the secret " +
          "to the reconstructing party. Threshold computation (MPC over " +
          "shares) is needed if the reconstructed secret should never exist " +
          "in cleartext — adding MPC overhead on top of the sharing scheme."
        ],
        exercises: [
          {
            type: "calculation",
            question:
              "Construct a (2,3) Shamir secret sharing of secret s=42 over " +
              "Z_97. Choose random polynomial f(x) = 42 + 17x (mod 97). " +
              "Compute shares f(1), f(2), f(3). Then reconstruct s from " +
              "shares at x=1 and x=3 using Lagrange interpolation.",
            hint:
              "Lagrange basis: L_1(0) = (0-3)/(1-3) = 3/2 mod 97 and " +
              "L_3(0) = (0-1)/(3-1) = -1/2 mod 97. Use modular inverse: " +
              "2^(-1) mod 97 = 49 (since 2*49 = 98 = 1 mod 97).",
            answer:
              "Shares: f(1) = 42+17 = 59, f(2) = 42+34 = 76, f(3) = 42+51 " +
              "= 93. Reconstruction from (1,59) and (3,93): L_1(0) = " +
              "(0-3)/(1-3) = (-3)/(-2) = 3/2 = 3*49 = 147 mod 97 = 50. " +
              "L_3(0) = (0-1)/(3-1) = (-1)/2 = -1*49 = -49 mod 97 = 48. " +
              "s = 59*50 + 93*48 mod 97 = 2950 + 4464 mod 97 = 7414 mod 97 " +
              "= 7414 - 76*97 = 7414 - 7372 = 42. Matches the original secret."
          },
          {
            type: "conceptual",
            question:
              "What is the difference between Shamir's (t,n) threshold " +
              "scheme and additive secret sharing? When would you use each?",
            hint:
              "Additive sharing: s = s_1 + s_2 + ... + s_n (all shares " +
              "needed). Shamir: any t of n shares suffice.",
            answer:
              "Additive sharing splits s into n random shares where " +
              "s = sum(s_i). ALL n shares are needed (threshold = n). It is " +
              "simpler and faster (just random sampling + subtraction) but " +
              "has no fault tolerance. Shamir (t,n) allows reconstruction " +
              "from any t shares, providing fault tolerance (n-t parties " +
              "can fail). Use additive sharing in 2-party MPC (simpler, no " +
              "interpolation needed) or when all parties are always available. " +
              "Use Shamir in threshold systems (t-of-n credential issuance, " +
              "TEE key backup) where availability matters."
          },
          {
            type: "design",
            question:
              "In the thesis, the issuer's BBS+ signing key is Shamir-shared " +
              "among 5 TEE instances with threshold 3. Describe a proactive " +
              "resharing protocol that defends against a mobile adversary " +
              "who compromises different TEEs over time.",
            hint:
              "Each TEE generates a random (2,5) sharing of zero and adds " +
              "it to their current share. The secret remains the same but " +
              "all shares change.",
            answer:
              "Each TEE i generates a random degree-1 polynomial q_i(x) with " +
              "q_i(0) = 0 (a sharing of zero). TEE i sends q_i(j) to each " +
              "other TEE j. Each TEE j updates its share: s_j' = s_j + " +
              "sum(q_i(j)) for all i. Since sum(q_i(0)) = 0, the secret " +
              "is unchanged: f'(0) = f(0) = sk. But all shares s_j' are " +
              "completely new, so old compromised shares are useless. This " +
              "resharing should happen periodically (e.g., daily). An " +
              "adversary must compromise 3 TEEs within a single epoch to " +
              "recover sk."
          }
        ]
      },
      {
        name: "Garbled Circuits",
        analogy:
          "Imagine encrypting every wire in a circuit with " +
          "a different random key, then shuffling (garbling) " +
          "the truth tables so they work with encrypted " +
          "values. One party garbles the circuit and sends " +
          "it; the other evaluates it on their encrypted " +
          "input. Neither sees the other's input.",
        diagram:
          '┌──────────────────────────────────────────────┐\n' +
          '│            Garbled Circuit (Yao)              │\n' +
          '├──────────────────────────────────────────────┤\n' +
          '│                                              │\n' +
          '│   Garbler                  Evaluator         │\n' +
          '│   ┌──────────┐            ┌──────────┐       │\n' +
          '│   │ input a  │            │ input b  │       │\n' +
          '│   └─────┬────┘            └─────┬────┘       │\n' +
          '│         │                       │            │\n' +
          '│   ┌─────┴──────┐          (gets labels       │\n' +
          '│   │ Garble     │           via OT)           │\n' +
          '│   │ circuit    │                │            │\n' +
          '│   └─────┬──────┘                │            │\n' +
          '│         │ garbled tables         │            │\n' +
          '│         │──────────────────────→│            │\n' +
          '│         │                       │            │\n' +
          '│         │              ┌────────┴───────┐    │\n' +
          '│         │              │ Evaluate gate  │    │\n' +
          '│         │              │ by gate        │    │\n' +
          '│         │              └────────┬───────┘    │\n' +
          '│         │                       ↓            │\n' +
          '│         │              output = f(a, b)      │\n' +
          '│                                              │\n' +
          '│   OPTIMIZATIONS                              │\n' +
          '│   Free XOR: XOR gates cost 0 ciphertexts     │\n' +
          '│   Half-gates: AND needs only 2 ciphertexts   │\n' +
          '└──────────────────────────────────────────────┘',
        keyPoints: [
          "Yao's protocol: one party garbles, other evaluates (constant rounds, 2-party)",
          "Each wire has two random labels (0-label and 1-label)",
          "Garbled gate: encrypt each output label under the two input labels",
          "Point-and-permute optimization: 1 bit tells which row to decrypt",
          "Free XOR: XOR gates cost nothing (labels differ by global offset)",
          "Half-gates: AND gates need only 2 ciphertexts instead of 4"
        ],
        connections:
          "Garbled circuits enable efficient 2-party " +
          "computation for credential operations. A user and " +
          "verifier can jointly evaluate a policy function on " +
          "the user's private credential without revealing " +
          "attributes to the verifier.",
        publicPrivate: [
          { item: "circuit structure C", status: "public", holder: "everyone", when: "always (function to compute is agreed upon)" },
          { item: "garbled circuit C~", status: "public", holder: "evaluator (sent by garbler)", when: "during protocol" },
          { item: "all wire labels", status: "private", holder: "garbler", when: "garbler knows all labels; evaluator learns only their input labels via OT" },
          { item: "garbler's input", status: "private", holder: "garbler", when: "always (evaluator never learns it)" },
          { item: "evaluator's input", status: "private", holder: "evaluator", when: "always (garbler never learns it; labels obtained via OT)" },
          { item: "output f(a, b)", status: "revealed", holder: "both parties", when: "after evaluation completes" }
        ],
        thesisExample:
          "Garbled circuits could enable a privacy-preserving " +
          "credential policy evaluation between user and verifier " +
          "on Sui. The verifier garbles a policy circuit ('age ≥ 18 " +
          "AND country ∈ EU AND risk_score < 5'), the user evaluates " +
          "it on their private credential attributes via OT, and " +
          "both learn only the boolean result. This keeps the full " +
          "policy logic private to the verifier and attributes " +
          "private to the user.",
        history: {
          inventor: "Andrew Yao (Stanford University)",
          year: 1986,
          context:
            "Yao introduced garbled circuits in 'How to Generate and Exchange " +
            "Secrets' at FOCS 1986, building on his 1982 work on secure " +
            "2-party computation. The protocol was primarily theoretical " +
            "until Malkhi, Nisan, Pinkas, and Sella (2004) built the first " +
            "practical implementation (Fairplay). Kolesnikov and Schneider " +
            "(2008) introduced Free XOR, eliminating the cost of XOR gates " +
            "entirely. Zahur, Rosulek, and Evans (2015) introduced " +
            "half-gates, reducing AND gates to 2 ciphertexts (from 4), " +
            "which is provably optimal. Modern garbled circuit implementations " +
            "(EMP-toolkit, ABY) process billions of gates per second.",
          funFact:
            "The term 'garbled circuit' was actually coined years after " +
            "Yao's paper. Yao never used the word 'garbled' in his original " +
            "publication. Beaver, Micali, and Rogaway (1990) introduced the " +
            "term in their formalization of Yao's protocol."
        },
        limitations: [
          "Garbled circuits are one-time use: each garbled circuit can only " +
          "be evaluated once securely (reuse reveals wire label correlations). " +
          "For repeated evaluations, new garbled circuits must be generated, " +
          "making the amortized cost high.",
          "Communication cost is O(|C| * kappa) where |C| is the circuit " +
          "size and kappa is the security parameter (~128 bits). For a " +
          "circuit with 1 million AND gates, this is ~32MB of garbled tables " +
          "that must be transmitted.",
          "Garbled circuits are 2-party only. Extending to n > 2 parties " +
          "requires BMR (Beaver-Micali-Rogaway) protocol, which adds an " +
          "O(n) factor to the garbled table size and requires interaction " +
          "during garbling."
        ],
        exercises: [
          {
            type: "calculation",
            question:
              "A garbled AND gate with point-and-permute has 4 rows in the " +
              "garbled table. With the half-gates optimization, it has 2 " +
              "rows. If a circuit has 500,000 AND gates and 300,000 XOR " +
              "gates (free), and each row is 128 bits (16 bytes), what is " +
              "the total garbled circuit size with: (a) basic garbling, " +
              "(b) half-gates?",
            hint:
              "XOR gates are free (0 rows). Only AND gates contribute " +
              "to the garbled table size. Multiply gates * rows * bytes.",
            answer:
              "(a) Basic: 500,000 AND gates * 4 rows * 16 bytes = 32,000,000 " +
              "bytes = 32 MB. XOR gates contribute 0 bytes (Free XOR). " +
              "(b) Half-gates: 500,000 * 2 rows * 16 bytes = 16,000,000 " +
              "bytes = 16 MB. The half-gates optimization cuts communication " +
              "by exactly 50% for AND-heavy circuits. This is provably " +
              "optimal (Zahur-Rosulek-Evans 2015): no garbling scheme can " +
              "do better than 2 ciphertexts per AND gate under standard " +
              "assumptions."
          },
          {
            type: "conceptual",
            question:
              "Why are garbled circuits 'one-time use' and what goes wrong " +
              "if you reuse the same garbled circuit with different inputs?",
            hint:
              "Think about what the evaluator learns when they see two " +
              "different sets of wire labels for the same garbled gate.",
            answer:
              "Each wire has two labels (0-label and 1-label). On first " +
              "evaluation, the evaluator learns one label per wire (the one " +
              "corresponding to their input). On a second evaluation with " +
              "different inputs, they might learn the other label for some " +
              "wires. With both labels for a wire, the evaluator can " +
              "decrypt all rows of downstream garbled gates, recovering " +
              "the circuit's truth table in plaintext. This reveals the " +
              "garbler's private input. Solution: generate a fresh garbled " +
              "circuit for each evaluation, or use reusable garbled circuits " +
              "(Goldwasser-Kalai-Rothblum 2008, but impractical)."
          }
        ]
      },
      {
        name: "Fully Homomorphic Encryption (FHE)",
        analogy:
          "A magical glove box — you put your encrypted " +
          "data inside, perform operations on it while it " +
          "is still encrypted, and take out an encrypted " +
          "result. Decrypt to get the answer. The box " +
          "(server) never sees your data, but processes " +
          "it correctly.",
        diagram:
          '┌──────────────────────────────────────────────┐\n' +
          '│       Fully Homomorphic Encryption            │\n' +
          '├──────────────────────────────────────────────┤\n' +
          '│                                              │\n' +
          '│   Client                    Server           │\n' +
          '│                                              │\n' +
          '│   plaintext x                                │\n' +
          '│       │                                      │\n' +
          '│   ┌───┴────┐                                 │\n' +
          '│   │Encrypt │──→ Enc(x) ──→┌──────────┐      │\n' +
          '│   └────────┘              │Compute   │      │\n' +
          '│                           │ f() on   │      │\n' +
          '│                           │ Enc(x)   │      │\n' +
          '│                           └────┬─────┘      │\n' +
          '│                                ↓            │\n' +
          '│   ┌─────────┐         Enc(f(x))             │\n' +
          '│   │ Decrypt │←──────────────────            │\n' +
          '│   └────┬────┘                               │\n' +
          '│        ↓                                    │\n' +
          '│     f(x)  (result in the clear)             │\n' +
          '│                                              │\n' +
          '│   SCHEMES                                    │\n' +
          '│   BFV:  integer arithmetic                   │\n' +
          '│   CKKS: approximate real numbers             │\n' +
          '│   TFHE: boolean circuits, fast bootstrap     │\n' +
          '└──────────────────────────────────────────────┘',
        keyPoints: [
          "Compute arbitrary functions on encrypted data without decryption",
          "Leveled FHE: supports bounded-depth circuits. Fully HE: bootstrapping refreshes noise for unlimited depth",
          "Lattice-based (LWE/RLWE): quantum-resistant",
          "Key schemes: BFV (integer arithmetic), CKKS (approximate real numbers), TFHE (boolean circuits, fast bootstrapping)",
          "Current state: approximately 10,000x overhead vs plaintext, improving rapidly"
        ],
        connections:
          "FHE could enable private credential verification " +
          "without TEE — the verifier encrypts the policy, " +
          "user evaluates it homomorphically on their " +
          "credential. Too slow today for real-time use, but " +
          "a long-term alternative to TEE-based privacy.",
        publicPrivate: [
          { item: "public key pk", status: "public", holder: "everyone (server included)", when: "always (used for encryption)" },
          { item: "secret key sk", status: "private", holder: "data owner/client", when: "always (only party that can decrypt)" },
          { item: "ciphertext Enc(m)", status: "public", holder: "server", when: "during computation (server computes on ciphertext)" },
          { item: "result ciphertext Enc(f(m))", status: "public", holder: "server returns to client", when: "after homomorphic computation" },
          { item: "plaintext m and result f(m)", status: "private", holder: "data owner/client", when: "only client can decrypt; server never sees plaintext" }
        ],
        thesisExample:
          "FHE represents a future alternative to TEEs in your " +
          "architecture. Instead of running credential verification " +
          "inside an SGX enclave, a Sui node could verify BBS+ " +
          "proofs homomorphically on encrypted credentials. Currently " +
          "too slow (~10,000x overhead), but lattice-based FHE is " +
          "quantum-safe — if TEE trust assumptions weaken and FHE " +
          "performance improves, it could replace the TEE layer in " +
          "your post-quantum migration strategy.",
        history: {
          inventor: "Craig Gentry (IBM Research / Stanford PhD)",
          year: 2009,
          context:
            "Gentry constructed the first fully homomorphic encryption scheme " +
            "in his 2009 Stanford PhD thesis, solving a 30-year open problem " +
            "posed by Rivest, Adleman, and Dertouzos in 1978. Prior work " +
            "achieved only partial homomorphism: RSA is multiplicatively " +
            "homomorphic (Enc(a) * Enc(b) = Enc(a*b)), and Paillier (1999) " +
            "is additively homomorphic. Gentry's breakthrough was " +
            "bootstrapping: a technique to refresh noisy ciphertexts by " +
            "homomorphically evaluating the decryption circuit. Brakerski " +
            "and Vaikuntanathan (BV, 2011) and Brakerski-Gentry-Vaikuntanathan " +
            "(BGV, 2012) made FHE practical by basing it on the Learning " +
            "With Errors (LWE) problem. Cheon-Kim-Kim-Song (CKKS, 2017) " +
            "enabled approximate arithmetic on encrypted real numbers.",
          funFact:
            "Gentry's PhD thesis was titled 'A Fully Homomorphic Encryption " +
            "Scheme' and ran to 209 pages. His advisor was Dan Boneh. When " +
            "he presented the result, the cryptography community was stunned " +
            "because most researchers believed practical FHE was decades away."
        },
        limitations: [
          "Performance overhead is still 10,000-1,000,000x compared to " +
          "plaintext computation, depending on the operation. A single " +
          "bootstrapping operation (noise refresh) takes 10-100ms on modern " +
          "hardware. TFHE achieves ~13ms per gate-level bootstrap.",
          "Ciphertext expansion: encrypting 1 bit produces ~4KB-32KB of " +
          "ciphertext depending on the scheme and parameters. This makes " +
          "FHE impractical for large datasets or bandwidth-constrained " +
          "settings like on-chain storage.",
          "FHE supports only computation (addition and multiplication). " +
          "Branching on encrypted data (if-then-else) requires evaluating " +
          "both branches and selecting the result homomorphically, doubling " +
          "the cost for each conditional. Complex control flow becomes " +
          "exponentially expensive."
        ],
        exercises: [
          {
            type: "conceptual",
            question:
              "Explain why 'bootstrapping' was Gentry's key insight for " +
              "fully homomorphic encryption. What happens to a ciphertext " +
              "without bootstrapping after many operations?",
            hint:
              "Lattice-based ciphertexts contain noise that grows with each " +
              "operation. When noise exceeds a threshold, decryption fails.",
            answer:
              "In lattice-based FHE (LWE/RLWE), each ciphertext contains a " +
              "noise term that grows with every homomorphic operation. " +
              "Addition roughly adds noise, multiplication roughly squares " +
              "it. After O(log(q/noise)) multiplications, the noise exceeds " +
              "the decryption threshold and the ciphertext becomes garbage. " +
              "Bootstrapping resets the noise by homomorphically evaluating " +
              "the decryption circuit: Enc(m) with high noise becomes " +
              "Enc(m) with low noise. This requires the scheme to evaluate " +
              "its own decryption as a circuit, which Gentry achieved by " +
              "squashing the decryption circuit to low enough depth."
          },
          {
            type: "comparison",
            question:
              "Compare BFV, CKKS, and TFHE schemes. For each, state the " +
              "data type it operates on, a typical use case, and the main " +
              "tradeoff.",
            hint:
              "BFV works on integers, CKKS on approximate reals, and TFHE " +
              "on individual bits with fast bootstrapping.",
            answer:
              "BFV (Brakerski-Fan-Vercauteren): operates on exact integers " +
              "mod t, best for counting and integer arithmetic (e.g., " +
              "encrypted database queries). Tradeoff: no native floating " +
              "point. CKKS (Cheon-Kim-Kim-Song): operates on approximate " +
              "real/complex numbers via SIMD-like batching, best for ML " +
              "inference on encrypted data. Tradeoff: introduces rounding " +
              "errors. TFHE (Torus FHE, Chillotti et al. 2016): operates " +
              "on individual bits with ~13ms bootstrapping per gate, best " +
              "for arbitrary boolean circuits. Tradeoff: bit-level operations " +
              "are slow for arithmetic (8-bit addition needs ~100 gates)."
          },
          {
            type: "design",
            question:
              "If FHE performance improves 1000x (reaching ~10x plaintext " +
              "overhead), could it replace TEEs in the thesis architecture? " +
              "What would the credential verification flow look like?",
            hint:
              "The verifier would encrypt the policy, the user evaluates " +
              "it homomorphically on their credential, and the verifier " +
              "decrypts the boolean result.",
            answer:
              "Flow: (1) User encrypts their credential attributes under " +
              "their FHE key: Enc(age), Enc(nationality), etc. (2) Verifier " +
              "sends the verification policy as a circuit: 'age >= 18 AND " +
              "nationality in EU'. (3) User evaluates the circuit " +
              "homomorphically on their encrypted attributes, producing " +
              "Enc(result). (4) User decrypts and sends the result with a " +
              "ZK proof that the computation was correct. Advantages over " +
              "TEE: no hardware trust assumptions, quantum-resistant (LWE). " +
              "Remaining issues: the ZK proof of correct FHE evaluation is " +
              "itself expensive, and the user must be trusted to decrypt " +
              "honestly (or use a verifiable decryption protocol)."
          }
        ]
      },
      {
        name: "Oblivious RAM (ORAM)",
        analogy:
          "A librarian who fetches books for you, but " +
          "shuffles the entire library after every request " +
          "so that an observer cannot tell which book you " +
          "asked for — even if they watch every shelf " +
          "access. Expensive (read the whole library each " +
          "time) but perfectly hides your access pattern.",
        diagram:
          '┌──────────────────────────────────────────────┐\n' +
          '│           Oblivious RAM (ORAM)                │\n' +
          '├──────────────────────────────────────────────┤\n' +
          '│                                              │\n' +
          '│   Client               Server Memory         │\n' +
          '│   ┌────────┐          ┌──────────────┐       │\n' +
          '│   │ wants  │          │ encrypted    │       │\n' +
          '│   │ addr 5 │          │ data blocks  │       │\n' +
          '│   └───┬────┘          └──────┬───────┘       │\n' +
          '│       │                      │               │\n' +
          '│       │  access path + dummies                │\n' +
          '│       │──────────────────────→│               │\n' +
          '│       │                      │               │\n' +
          '│       │  ┌────────────────────────────┐      │\n' +
          '│       │  │ Server sees: random reads  │      │\n' +
          '│       │  │ Cannot distinguish real    │      │\n' +
          '│       │  │ access from dummy access   │      │\n' +
          '│       │  └────────────────────────────┘      │\n' +
          '│       │                      │               │\n' +
          '│       │  reshuffled blocks   │               │\n' +
          '│       │←─────────────────────│               │\n' +
          '│                                              │\n' +
          '│   Path ORAM: O(log n) overhead               │\n' +
          '│   Circuit ORAM: O(log n), smaller constants  │\n' +
          '└──────────────────────────────────────────────┘',
        keyPoints: [
          "Hides memory access patterns from the server/observer",
          "Path ORAM: store data in a binary tree, access a random path each time, O(log n) overhead",
          "Circuit ORAM: O(log n) with smaller constants",
          "Critical for TEE: even if enclave memory is encrypted, access patterns leak information",
          "Practical overhead: 10-100x, often prohibitive"
        ],
        connections:
          "ORAM is essential for TEE security — without it, " +
          "memory access patterns in SGX enclaves leak " +
          "credential attributes during verification. Your " +
          "thesis may need ORAM or ORAM-like techniques when " +
          "credentials are stored and accessed inside TEEs.",
        publicPrivate: [
          { item: "data contents", status: "private", holder: "client (encrypted in server memory)", when: "always (server stores only encrypted blocks)" },
          { item: "logical access pattern", status: "private", holder: "client", when: "always (ORAM's core purpose: hide which data is accessed)" },
          { item: "physical access pattern (observed)", status: "public", holder: "server/observer", when: "always visible but reveals nothing about logical accesses" },
          { item: "position map", status: "private", holder: "client", when: "always (stored client-side, maps logical to physical addresses)" },
          { item: "stash (overflow buffer)", status: "private", holder: "client", when: "always (stored client-side, holds evicted blocks)" }
        ],
        thesisExample:
          "In your TEE layer, the enclave processes credential " +
          "verification requests. Without ORAM, an OS-level " +
          "attacker observing memory access patterns during BBS+ " +
          "verification could infer which credential attributes are " +
          "being checked (different attributes cause different memory " +
          "accesses). Path ORAM inside the SGX enclave hides these " +
          "patterns at ~10x overhead, protecting attribute privacy " +
          "even against side-channel adversaries.",
        history: {
          inventor: "Oded Goldreich and Rafail Ostrovsky (Technion / UCLA)",
          year: 1996,
          context:
            "Goldreich and Ostrovsky published 'Software Protection and " +
            "Simulation on Oblivious RAMs' in JACM 1996 (based on " +
            "Goldreich's 1987 work and Ostrovsky's 1990 PhD thesis at MIT). " +
            "The original scheme had O(sqrt(n)) overhead. Shi, Chan, Stefanov, " +
            "and Li (2011) introduced Path ORAM, reducing overhead to " +
            "O(log n) with a simple tree-based construction. Path ORAM " +
            "became the standard for practical ORAM due to its simplicity. " +
            "Circuit ORAM (Wang et al., 2015) improved constants. ORAM " +
            "gained renewed importance with Intel SGX (2015), where memory " +
            "access pattern leaks became a real threat to enclave privacy.",
          funFact:
            "Goldreich and Ostrovsky's lower bound proof shows that any " +
            "ORAM scheme must have Omega(log n) overhead, meaning Path " +
            "ORAM's O(log n) is asymptotically optimal. No future ORAM " +
            "scheme can beat this logarithmic barrier."
        },
        limitations: [
          "Practical overhead of 10-100x makes ORAM prohibitive for " +
          "performance-critical applications. Path ORAM with 1 million " +
          "blocks requires accessing ~20 blocks per real access (log2(10^6) " +
          "= 20), and each block access involves re-encryption and reshuffling.",
          "Client-side storage for the position map grows as O(n * log(n) / B) " +
          "where B is the block size. For 1GB of server data with 4KB blocks, " +
          "the position map is ~5MB, which must fit in trusted memory (e.g., " +
          "SGX enclave's limited EPC of 128MB).",
          "ORAM protects access patterns but not access timing or volume. " +
          "An adversary can still observe when accesses happen and how many " +
          "accesses occur. Hiding timing requires constant-rate access " +
          "(dummy accesses when idle), further increasing overhead."
        ],
        exercises: [
          {
            type: "calculation",
            question:
              "In Path ORAM with n = 2^20 blocks (approximately 1 million), " +
              "the tree has depth log2(n) = 20. Each bucket holds Z = 4 " +
              "blocks and each block is 4KB. What is the bandwidth overhead " +
              "per real access (read one path + write one path)?",
            hint:
              "One path traversal reads/writes (depth + 1) buckets. Each " +
              "access reads a full path and writes it back.",
            answer:
              "Path depth = 20 levels + 1 root = 21 buckets per path. Each " +
              "bucket = Z * block_size = 4 * 4KB = 16KB. Per access: read " +
              "21 * 16KB + write 21 * 16KB = 672KB total bandwidth for one " +
              "4KB logical read. Overhead = 672KB / 4KB = 168x. This is " +
              "the practical cost of hiding access patterns in Path ORAM. " +
              "The overhead is why ORAM is typically used only for sensitive " +
              "data structures (e.g., credential lookup tables inside TEEs), " +
              "not for bulk data processing."
          },
          {
            type: "conceptual",
            question:
              "Why is ORAM specifically important for TEE-based credential " +
              "verification? What information leaks through memory access " +
              "patterns in an SGX enclave, even though the data is encrypted?",
            hint:
              "The OS controls page tables and can observe which memory pages " +
              "the enclave accesses. Different credential attributes may be " +
              "stored at different addresses.",
            answer:
              "SGX encrypts enclave memory but the untrusted OS manages page " +
              "tables and can observe page-level access patterns. If " +
              "credential attributes are stored at different addresses " +
              "(e.g., age at page 5, nationality at page 12), the OS sees " +
              "which pages are accessed during verification, revealing which " +
              "attributes are being checked. This is a controlled-channel " +
              "attack (Xu et al., 2015). Even cache-line granularity leaks " +
              "(L1/L2 cache attacks). ORAM makes all access patterns " +
              "indistinguishable: verifying 'age >= 18' produces the same " +
              "memory trace as verifying 'nationality = Swiss'."
          },
          {
            type: "design",
            question:
              "Given that full ORAM has 100x overhead, propose a practical " +
              "middle ground for the thesis TEE layer that protects against " +
              "the most likely access pattern attacks without full ORAM cost.",
            hint:
              "Consider what data structures inside the TEE are most " +
              "sensitive to access pattern analysis, and protect only those.",
            answer:
              "Use ORAM selectively: (1) Store the credential attribute " +
              "lookup table (small, ~1000 entries) in a Path ORAM structure " +
              "inside the enclave. Cost: ~20x for a small dataset. " +
              "(2) Process all credential types through the same code path " +
              "(constant-time attribute comparison) to prevent " +
              "instruction-level leaks. (3) Add dummy accesses to pad each " +
              "verification to a fixed number of memory operations. " +
              "(4) Keep the ZK circuit evaluation (Groth16 proving) outside " +
              "the TEE where access patterns do not reveal credential " +
              "contents. This selective approach achieves ~5-10x overhead " +
              "instead of 100x while protecting the most sensitive operations."
          }
        ]
      }
    ]
  },
  block2: {
    title: "Proving Systems (SNARKs, STARKs, PLONK)",
    connectionsSummary:
      "Choosing the right proving system is a critical " +
      "architectural decision for the thesis. Groth16 " +
      "(SNARK) offers the smallest proofs and fastest " +
      "verification, making it ideal for on-chain " +
      "verification on Sui where gas costs matter. Sui " +
      "natively supports Groth16 verification over BN254. " +
      "PLONK offers universal setups, useful if the " +
      "credential circuit evolves. Bulletproofs avoid " +
      "trusted setup entirely but are too slow for " +
      "on-chain verification. STARKs provide quantum " +
      "resistance but with larger proofs. The thesis " +
      "will likely use Groth16 for on-chain verification " +
      "of credential proofs, potentially with PLONK for " +
      "more complex predicate circuits.",
    concepts: [
      {
        name: "Arithmetic Circuits & R1CS",
        analogy:
          "Turning a math problem into a circuit board. " +
          "Each gate computes one operation (add or " +
          "multiply), wires carry values between gates, " +
          "and the entire circuit proves the computation " +
          "is correct. If any wire carries the wrong " +
          "value, the circuit fails. R1CS is the standard " +
          "blueprint format for describing these circuits.",
        diagram:
          '┌──────────────────────────────────────────────┐\n' +
          '│      Arithmetic Circuit → R1CS               │\n' +
          '├──────────────────────────────────────────────┤\n' +
          '│                                              │\n' +
          '│  Example: prove x^2 + x + 5 = 35            │\n' +
          '│           (solution: x = 5)                  │\n' +
          '│                                              │\n' +
          '│  CIRCUIT                                     │\n' +
          '│   x ──→┌─────┐                               │\n' +
          '│        │  *  │──→ v1 (= x*x)                │\n' +
          '│   x ──→└─────┘                               │\n' +
          '│                  ┌─────┐                      │\n' +
          '│   v1 ──────────→│  +  │──→ v2 (= v1+x)      │\n' +
          '│   x  ──────────→└─────┘                      │\n' +
          '│                  ┌─────┐                      │\n' +
          '│   v2 ──────────→│  +  │──→ out (= v2+5)     │\n' +
          '│    5 ──────────→└─────┘                      │\n' +
          '│                                              │\n' +
          '│  R1CS: A * w . B * w = C * w                 │\n' +
          '│  Each gate → one constraint row               │\n' +
          '│  w = [1, x, out, v1, v2] (witness)           │\n' +
          '└──────────────────────────────────────────────┘',
        keyPoints: [
          "Arithmetic circuits express computations as DAGs of addition and multiplication gates over a finite field",
          "R1CS (Rank-1 Constraint System): each gate becomes a constraint A_i * w . B_i * w = C_i * w",
          "The witness w contains all intermediate values plus inputs and outputs",
          "Flattening: complex expressions are broken into elementary gate operations",
          "R1CS is the input format for Groth16; PLONK uses a different arithmetization (PLONKish)"
        ],
        connections:
          "Every ZKP about anonymous credentials must first be " +
          "expressed as an arithmetic circuit. The credential " +
          "verification logic (pairing checks, attribute " +
          "predicates, range proofs) is flattened into R1CS " +
          "constraints. The circuit size directly determines " +
          "proving time and on-chain verification cost on Sui.",
        publicPrivate: [
          { item: "circuit C (structure)", status: "public", holder: "everyone", when: "always (defines the computation to be proved)" },
          { item: "public inputs", status: "public", holder: "everyone", when: "always (known to both prover and verifier)" },
          { item: "private inputs (witness)", status: "private", holder: "prover", when: "always (the secret satisfying assignment)" },
          { item: "constraint matrices (A, B, C)", status: "public", holder: "everyone", when: "always (derived from the circuit)" }
        ],
        thesisExample:
          "Your credential verification circuit in R1CS encodes: " +
          "'I know a BBS+ signature σ on attributes (a1,...,aL) " +
          "where the signature verifies against issuer public key " +
          "ipk, the credential is in the Merkle tree with root R, " +
          "the nullifier is correctly derived, and attributes " +
          "satisfy the disclosure policy.' This circuit has ~100K " +
          "constraints for a 10-attribute credential — the R1CS " +
          "representation is what Groth16 actually proves.",
        history: {
          inventor: "Numerous contributors; R1CS formalized in the SNARKs literature (Ben-Sasson, Chiesa et al.)",
          year: 2013,
          context:
            "Arithmetic circuits as a model of computation date back to " +
            "Valiant (1976) and Strassen (1973) in algebraic complexity " +
            "theory. Their use in zero-knowledge proofs was pioneered by " +
            "Ishai, Kushilevitz, Ostrovsky, and Sahai (IKOS, 2007) with " +
            "MPC-in-the-head. The R1CS (Rank-1 Constraint System) format was " +
            "formalized and popularized by Ben-Sasson, Chiesa, Tromer, and " +
            "Virza in the libsnark library (2013), which became the reference " +
            "implementation for Groth16. Circom (Belles-Munoz, iden3, 2018) " +
            "made R1CS circuit writing accessible via a domain-specific " +
            "language that compiles to R1CS constraints.",
          funFact:
            "The first production R1CS circuit (Zcash Sprout, 2016) had " +
            "about 1.2 million constraints and took ~40 seconds to prove. " +
            "Modern circuits for zkLogin on Sui have similar constraint " +
            "counts but prove in ~2 seconds thanks to hardware improvements " +
            "and better libraries."
        },
        limitations: [
          "R1CS only supports rank-1 constraints (A*w . B*w = C*w), meaning " +
          "each constraint encodes exactly one multiplication. Operations " +
          "like range checks or hash functions that require many " +
          "multiplications result in bloated constraint systems — SHA-256 " +
          "needs ~27,000 constraints.",
          "Flattening complex expressions into elementary gates can " +
          "dramatically increase the number of intermediate variables. A " +
          "polynomial of degree d requires d-1 multiplication gates and " +
          "d-1 auxiliary variables, even if the algebraic expression is " +
          "compact.",
          "R1CS is not universally efficient: PLONKish arithmetization " +
          "(custom gates + lookup tables) can express the same computation " +
          "with 5-10x fewer constraints for hash-heavy circuits. The choice " +
          "of arithmetization format directly impacts proving time."
        ],
        exercises: [
          {
            type: "calculation",
            question:
              "Flatten the expression y = x^3 + x + 5 into R1CS constraints. " +
              "Introduce intermediate variables and write each constraint in " +
              "the form A * B = C. How many constraints do you need?",
            hint:
              "You need one constraint per multiplication. x^3 requires " +
              "computing x*x first, then (x*x)*x.",
            answer:
              "Introduce v1 = x*x and v2 = v1*x = x^3. " +
              "Constraint 1: x * x = v1 (computes x^2). " +
              "Constraint 2: v1 * x = v2 (computes x^3). " +
              "Constraint 3: (v2 + x + 5) * 1 = y (addition is 'free' in " +
              "R1CS as a linear combination, but we need a constraint to " +
              "bind the output). Actually, addition is a linear combination " +
              "that can be embedded into constraint 2's output: we can write " +
              "v1 * x = y - x - 5, which gives 2 constraints total. The " +
              "witness vector is w = [1, x, y, v1] with 2 R1CS constraints."
          },
          {
            type: "conceptual",
            question:
              "Why is R1CS the 'input format' for Groth16 but not for PLONK? " +
              "What does PLONKish arithmetization offer that R1CS cannot?",
            hint:
              "PLONK uses custom gates that can encode multiple operations " +
              "in a single constraint, plus lookup tables.",
            answer:
              "R1CS restricts each constraint to a single multiplication " +
              "(rank-1). PLONK's arithmetization uses polynomial identity " +
              "checks with custom gates that can encode arbitrary degree-d " +
              "relations in a single constraint row. For example, a PLONK " +
              "custom gate can check a * b + c * d = e in one constraint, " +
              "which would need 2 R1CS constraints. Lookup tables (plookup, " +
              "Gabizon-Williamson 2020) let PLONK check set membership " +
              "(e.g., 'x is a valid byte') in O(1) constraints, whereas " +
              "R1CS needs O(8) constraints for the same check. This makes " +
              "PLONK 5-10x more efficient for hash circuits."
          },
          {
            type: "design",
            question:
              "Estimate the R1CS constraint count for a credential " +
              "verification circuit that checks: (1) BBS+ signature " +
              "verification, (2) Merkle tree membership (depth 20, Poseidon " +
              "hash), (3) nullifier derivation (1 Poseidon hash), and " +
              "(4) one range proof (age >= 18, 8-bit range).",
            hint:
              "BBS+ verification involves ~3 pairings. Each pairing needs " +
              "~50,000 constraints in R1CS. Poseidon hash is ~300 constraints. " +
              "An 8-bit range proof needs ~8 bit-decomposition constraints.",
            answer:
              "BBS+ signature verification: ~150,000 constraints (3 pairing " +
              "checks, each ~50K constraints for Miller loop + final " +
              "exponentiation in R1CS). Merkle tree: 20 levels * 300 " +
              "constraints/Poseidon = 6,000 constraints. Nullifier: 300 " +
              "constraints (1 Poseidon hash). Range proof (8-bit): ~16 " +
              "constraints (bit decomposition + binary checks). Total: " +
              "~156,316 constraints. The BBS+ pairings dominate. This is " +
              "why some systems prove BBS+ verification outside the circuit " +
              "(via Sigma protocols) and only use the SNARK for Merkle " +
              "membership and nullifier checks (~6,300 constraints)."
          }
        ]
      },
      {
        name: "ZK-SNARKs (Groth16)",
        analogy:
          "A magical seal that compresses an entire book " +
          "into a single stamp. Anyone can verify the stamp " +
          "matches the book in milliseconds, but the stamp " +
          "reveals nothing about the book's content. The " +
          "catch: creating the stamp mold requires a " +
          "one-time trusted ceremony, and if the ceremony " +
          "secret (toxic waste) leaks, fake stamps become " +
          "possible.",
        diagram:
          '┌──────────────────────────────────────────────┐\n' +
          '│              Groth16 Pipeline                 │\n' +
          '├──────────────────────────────────────────────┤\n' +
          '│                                              │\n' +
          '│  ┌───────────────────┐                       │\n' +
          '│  │  Trusted Setup    │  (per circuit!)       │\n' +
          '│  │  (MPC ceremony)   │                       │\n' +
          '│  └────────┬──────────┘                       │\n' +
          '│           ↓                                  │\n' +
          '│  ┌─────────────┐  ┌─────────────┐            │\n' +
          '│  │ Proving Key │  │ Verifying Key│            │\n' +
          '│  │    (pk)     │  │     (vk)     │            │\n' +
          '│  └──────┬──────┘  └──────┬───────┘            │\n' +
          '│         ↓                ↓                   │\n' +
          '│  ┌────────────┐  ┌─────────────┐             │\n' +
          '│  │  Prover    │  │  Verifier   │             │\n' +
          '│  │ (witness,  │  │ (proof,     │             │\n' +
          '│  │  pk) → pi  │  │  vk) → 0/1  │             │\n' +
          '│  └────────────┘  └─────────────┘             │\n' +
          '│                                              │\n' +
          '│  PROPERTIES                                  │\n' +
          '│  ┌────────────────────────────────────────┐  │\n' +
          '│  │ Proof size:    192 bytes (constant!)   │  │\n' +
          '│  │ Verification:  O(1) — 3 pairings      │  │\n' +
          '│  │ Proving time:  O(n log n)              │  │\n' +
          '│  │ Setup:         circuit-specific (!)    │  │\n' +
          '│  │ Trust:         toxic waste must die    │  │\n' +
          '│  └────────────────────────────────────────┘  │\n' +
          '└──────────────────────────────────────────────┘',
        keyPoints: [
          "Trusted setup: a per-circuit MPC ceremony generates proving and verifying keys; the secret randomness (toxic waste) must be destroyed",
          "Constant proof size (192 bytes, 3 group elements) regardless of circuit complexity",
          "O(1) verification time: only 3 pairing checks needed, making it the fastest to verify on-chain",
          "Non-universal: each new circuit requires a new trusted setup ceremony",
          "Sui natively supports Groth16 verification over BN254 via the sui::groth16 module"
        ],
        connections:
          "Groth16 is the primary candidate for on-chain " +
          "credential verification on Sui. Its constant proof " +
          "size and O(1) verification map directly to minimal " +
          "gas costs. The sui::groth16 native module enables " +
          "direct proof verification in Move smart contracts. " +
          "The trusted setup requirement means each credential " +
          "circuit version needs a ceremony, which is a " +
          "deployment consideration for the thesis system.",
        publicPrivate: [
          { item: "CRS (proving key pk, verification key vk)", status: "public", holder: "everyone", when: "after trusted setup ceremony" },
          { item: "toxic waste tau", status: "destroyed", holder: "no one (must be destroyed)", when: "after setup — if leaked, fake proofs become possible" },
          { item: "proof pi = (A, B, C)", status: "public", holder: "everyone", when: "after proof generation" },
          { item: "public inputs", status: "public", holder: "everyone", when: "always (statement being verified)" },
          { item: "witness (private inputs)", status: "private", holder: "prover", when: "always (never revealed to verifier)" },
          { item: "verification result (accept/reject)", status: "public", holder: "everyone", when: "after verification (3 pairing checks)" }
        ],
        thesisExample:
          "Groth16 is your on-chain verification workhorse. The " +
          "BBS+ selective disclosure proof is wrapped in a Groth16 " +
          "proof for gas efficiency on Sui: instead of verifying " +
          "multiple pairing equations, the Sui Move contract " +
          "verifies a single Groth16 proof (3 pairings, ~50ms, " +
          "~200K gas). The per-circuit setup is acceptable since " +
          "your credential verification circuit is stable — one " +
          "ceremony covers all presentations.",
        history: {
          inventor: "Jens Groth (University College London)",
          year: 2016,
          context:
            "Groth published 'On the Size of Pairing-Based Non-interactive " +
            "Arguments' at EUROCRYPT 2016, achieving the smallest possible " +
            "SNARK proof (3 group elements, 192 bytes). Earlier SNARKs " +
            "include Pinocchio (Parno, Howell, Gentry, Rabin, 2013) with " +
            "8 group elements and GGPR (Gennaro, Gentry, Parno, Raykova, " +
            "2013). The concept of 'succinct' arguments dates to Kilian " +
            "(1992) and Micali (2000, CS proofs). Ben-Sasson and Chiesa " +
            "et al. built libsnark (2013), the first practical SNARK " +
            "library. Zcash (2016) was the first production deployment of " +
            "SNARKs (Pinocchio-based Sprout, later Groth16-based Sapling). " +
            "Sui added native Groth16 verification in 2023.",
          funFact:
            "Groth16 proofs are exactly 192 bytes (3 elements of G1/G2 on " +
            "BN254) regardless of whether the circuit has 100 or 10 million " +
            "constraints. This constant size is why Groth16 dominates " +
            "on-chain verification despite being 8 years old."
        },
        limitations: [
          "Trusted setup is circuit-specific: every new circuit (or circuit " +
          "modification) requires a new MPC ceremony. Zcash's Sapling " +
          "ceremony (2018) involved 90 participants over several months. " +
          "If the toxic waste (secret tau) is not destroyed, an adversary " +
          "can forge proofs for any statement.",
          "Not quantum-safe: Groth16 relies on pairing-based assumptions " +
          "(Knowledge of Exponent, q-SDH) that Shor's algorithm breaks. " +
          "A sufficiently large quantum computer could forge Groth16 proofs, " +
          "breaking all on-chain verification.",
          "Proving time is O(n log n) where n is the number of constraints, " +
          "with large constants due to FFT and multi-scalar multiplication. " +
          "A 1 million constraint circuit takes ~5-15 seconds to prove on " +
          "a modern laptop. This limits real-time applications where the " +
          "user must generate a proof interactively."
        ],
        exercises: [
          {
            type: "conceptual",
            question:
              "What is 'toxic waste' in Groth16's trusted setup, and why " +
              "is it called the 'most dangerous secret in cryptography'? " +
              "How do MPC ceremonies mitigate this risk?",
            hint:
              "The toxic waste is the secret randomness (tau) used to " +
              "generate the CRS. If any single party in the MPC ceremony " +
              "destroys their share, the waste is unrecoverable.",
            answer:
              "Toxic waste is the secret randomness tau (and alpha, beta, " +
              "gamma, delta) used to compute the CRS (proving/verification " +
              "keys). With tau, an attacker can forge proofs for any false " +
              "statement (e.g., 'I own 1 billion coins' or 'this invalid " +
              "credential is valid'). MPC ceremonies distribute the " +
              "generation: each participant i contributes tau_i, and the " +
              "final tau = product(tau_i). Security holds if at least ONE " +
              "participant honestly destroys their tau_i. Zcash Powers of " +
              "Tau ceremony had 90 participants; the probability of all 90 " +
              "being compromised is negligible."
          },
          {
            type: "calculation",
            question:
              "Groth16 verification consists of 3 pairing checks. If each " +
              "pairing on BN254 takes 1.5ms, and the verifier also needs to " +
              "compute a multi-scalar multiplication of the public inputs " +
              "(taking 0.2ms per input), what is the total verification time " +
              "for a circuit with 5 public inputs?",
            hint:
              "Total = (3 pairings) + (public input MSM). The MSM cost is " +
              "0.2ms * number of public inputs.",
            answer:
              "Pairings: 3 * 1.5ms = 4.5ms. Public input MSM: 5 * 0.2ms = " +
              "1.0ms. Total: 5.5ms. In practice, Sui's native groth16 " +
              "verification takes ~4-6ms for typical circuits. On-chain, " +
              "this translates to ~200K gas units on Sui (comparable to a " +
              "few simple Move function calls). Compare this to verifying " +
              "the raw BBS+ proof directly (3 pairings + Sigma protocol " +
              "verification), which would take 10-20ms and require " +
              "custom Move code for each proof type."
          },
          {
            type: "comparison",
            question:
              "Compare Groth16 with Pinocchio (the predecessor SNARK). " +
              "What did Groth16 improve, and what remained the same?",
            hint:
              "Pinocchio has 8 group elements per proof. Both require " +
              "trusted setup and use pairings.",
            answer:
              "Pinocchio (PHGR13): 8 group elements proof (~512B on BN254), " +
              "7 pairing checks for verification, circuit-specific trusted " +
              "setup, O(n log n) proving. Groth16: 3 group elements proof " +
              "(192B), 3 pairing checks (2.3x faster verification), " +
              "circuit-specific trusted setup (same limitation), O(n log n) " +
              "proving. Both require trusted setup and are not quantum-safe. " +
              "Groth16's improvement is purely in proof size (2.7x smaller) " +
              "and verification speed (2.3x faster). Groth16 achieves the " +
              "theoretical minimum: Groth proved no pairing-based SNARK can " +
              "have fewer than 2 group elements."
          }
        ]
      },
      {
        name: "ZK-STARKs",
        analogy:
          "Like SNARKs but with transparent setup. No secret " +
          "ceremony is needed: all parameters are derived " +
          "from public randomness. The tradeoff is larger " +
          "proofs, like writing a longer but self-evident " +
          "proof instead of a short proof that requires " +
          "trusting the exam board.",
        diagram:
          '┌──────────────────────────────────────────────┐\n' +
          '│          SNARKs vs STARKs Comparison          │\n' +
          '├──────────────────────────────────────────────┤\n' +
          '│                                              │\n' +
          '│  Property      │ SNARKs      │ STARKs       │\n' +
          '│  ──────────────┼─────────────┼──────────────│\n' +
          '│  Setup         │ Trusted     │ Transparent  │\n' +
          '│  Proof size    │ ~192 B      │ ~50-200 KB   │\n' +
          '│  Verify time   │ O(1)        │ O(log^2 n)   │\n' +
          '│  Prove time    │ O(n log n)  │ O(n log n)   │\n' +
          '│  Quantum safe  │ No          │ Yes          │\n' +
          '│  Crypto basis  │ Pairings    │ Hashes only  │\n' +
          '│                                              │\n' +
          '│  STARK PIPELINE                              │\n' +
          '│  ┌────────┐  ┌─────────┐  ┌───────────┐     │\n' +
          '│  │ Trace  │→│ AIR     │→│ FRI       │     │\n' +
          '│  │ (exec) │  │ (constr)│  │ (commit)  │     │\n' +
          '│  └────────┘  └─────────┘  └─────┬─────┘     │\n' +
          '│                                 ↓           │\n' +
          '│                          STARK proof        │\n' +
          '│                         (no trusted setup)  │\n' +
          '└──────────────────────────────────────────────┘',
        keyPoints: [
          "Transparent setup: no trusted ceremony, all parameters are public (no toxic waste risk)",
          "Quantum-resistant: relies only on collision-resistant hash functions, not elliptic curve assumptions",
          "Larger proofs (~50-200 KB vs 192 bytes for Groth16) and slower verification",
          "FRI (Fast Reed-Solomon Interactive Oracle Proofs) is the core commitment scheme",
          "Used by StarkNet and zkSync; not natively supported on Sui for verification"
        ],
        connections:
          "STARKs are relevant to the thesis as a future-proofing " +
          "consideration. While Groth16 is preferred for current " +
          "on-chain verification on Sui, STARKs offer quantum " +
          "resistance which may matter for long-lived identity " +
          "credentials. The thesis should acknowledge the " +
          "SNARK-to-STARK migration path and its implications " +
          "for credential longevity.",
        publicPrivate: [
          { item: "all verification parameters", status: "public", holder: "everyone", when: "always (transparent setup — no trusted ceremony)" },
          { item: "proof", status: "public", holder: "everyone", when: "after proof generation (~50-200 KB)" },
          { item: "witness", status: "private", holder: "prover", when: "always (never revealed)" },
          { item: "FRI commitments (Merkle roots)", status: "public", holder: "everyone", when: "included in proof (verifier checks against them)" }
        ],
        thesisExample:
          "STARKs offer a quantum-safe alternative for your " +
          "post-quantum migration. While Groth16 is broken by " +
          "quantum computers (pairing-based), STARKs rely only on " +
          "hash functions. The tradeoff: ~100KB proofs vs 288B for " +
          "Groth16, meaning higher gas costs on Sui. Your migration " +
          "strategy could use STARKs for high-value transactions " +
          "(where quantum safety matters more) and keep Groth16 for " +
          "low-value payments.",
        history: {
          inventor: "Eli Ben-Sasson, Iddo Bentov, Yinon Horesh, Michael Riabzev (Technion / StarkWare)",
          year: 2018,
          context:
            "Ben-Sasson et al. published 'Scalable, transparent, and " +
            "post-quantum secure computational integrity' (ePrint 2018/046), " +
            "introducing STARKs. The key innovation was using FRI (Fast " +
            "Reed-Solomon Interactive Oracle Proofs of Proximity) as a " +
            "polynomial commitment scheme based only on hash functions. " +
            "STARKs build on the IOP (Interactive Oracle Proof) model " +
            "formalized by Ben-Sasson, Chiesa, and Spooner (2016). " +
            "StarkWare (founded 2018 by Ben-Sasson, Goldberg, and others) " +
            "commercialized STARKs for Ethereum scaling via StarkEx " +
            "(2020) and StarkNet (2021). The AIR (Algebraic Intermediate " +
            "Representation) arithmetization format was co-developed " +
            "with the STARK framework.",
          funFact:
            "The name STARK stands for 'Scalable Transparent ARgument of " +
            "Knowledge,' a deliberate contrast with SNARKs (Succinct " +
            "Non-interactive ARgument of Knowledge). The 'T' for " +
            "Transparent emphasizes no trusted setup, and the 'S' for " +
            "Scalable refers to quasi-linear prover time."
        },
        limitations: [
          "Proof size is 50-200KB (vs 192 bytes for Groth16), making " +
          "on-chain verification storage-expensive. Posting a STARK proof " +
          "on Ethereum costs ~500K-1M gas for calldata alone, compared to " +
          "~300K total for Groth16 verification.",
          "Verification time is O(log^2 n) with large constants. For a " +
          "circuit of size 2^20, STARK verification takes ~50-100ms " +
          "(compared to ~5ms for Groth16). This makes STARKs impractical " +
          "for Sui's per-transaction verification model.",
          "STARKs require a specific arithmetization (AIR) that is less " +
          "expressive than R1CS for some computations. Converting existing " +
          "R1CS circuits to AIR format requires non-trivial rewriting, and " +
          "the STARK ecosystem has fewer developer tools than SNARKs " +
          "(no equivalent to Circom's large library ecosystem)."
        ],
        exercises: [
          {
            type: "conceptual",
            question:
              "Explain the FRI protocol at a high level. How does it prove " +
              "that a committed polynomial has low degree, and why is this " +
              "useful for STARKs?",
            hint:
              "FRI recursively halves the polynomial's degree by folding, " +
              "and the verifier checks random evaluations at each step.",
            answer:
              "FRI proves that a function f committed via Merkle tree is " +
              "'close to' a polynomial of degree < d. Process: (1) Commit " +
              "to evaluations of f on a domain D. (2) Verifier sends random " +
              "alpha. (3) Prover folds: f'(x) = (f(x) + f(-x))/2 + " +
              "alpha*(f(x) - f(-x))/(2x), reducing degree by half. " +
              "(4) Repeat until the polynomial is constant. (5) Verifier " +
              "checks random positions across layers for consistency. " +
              "This is useful because STARK soundness reduces to proving " +
              "that the execution trace satisfies polynomial constraints " +
              "of bounded degree. FRI provides the 'polynomial commitment' " +
              "using only hash functions (Merkle trees), avoiding pairings."
          },
          {
            type: "comparison",
            question:
              "A credential system must choose between Groth16 and STARKs " +
              "for on-chain verification on Sui. Create a decision matrix " +
              "comparing: proof size, verification time, setup trust, " +
              "quantum safety, and proving time.",
            hint:
              "Consider that Sui has native Groth16 support but no native " +
              "STARK verifier.",
            answer:
              "Proof size: Groth16 = 192B (excellent for on-chain), STARK = " +
              "50-200KB (expensive on-chain storage). Verification: Groth16 = " +
              "~5ms / 3 pairings (Sui native), STARK = ~100ms / log^2(n) " +
              "hash operations (no Sui native support, must be in Move). " +
              "Setup: Groth16 = trusted ceremony (per circuit), STARK = " +
              "transparent (no trust). Quantum safety: Groth16 = broken by " +
              "quantum (pairing-based), STARK = safe (hash-based). Proving: " +
              "Groth16 = ~10s for 1M constraints, STARK = ~15s for equivalent " +
              "(quasi-linear). For the thesis TODAY, Groth16 wins on all " +
              "practical metrics except quantum safety. For 10-year " +
              "credential longevity, STARKs may be necessary."
          }
        ]
      },
      {
        name: "PLONK",
        analogy:
          "A universal proving factory. Unlike Groth16, which " +
          "needs a new setup ceremony for each circuit (like " +
          "building a new factory per product), PLONK's " +
          "single setup works for any circuit up to a " +
          "maximum size. Change the circuit, keep the setup. " +
          "The factory just reconfigures its production line.",
        diagram:
          '┌──────────────────────────────────────────────┐\n' +
          '│              PLONK Architecture               │\n' +
          '├──────────────────────────────────────────────┤\n' +
          '│                                              │\n' +
          '│  ┌─────────────────────────────┐             │\n' +
          '│  │   Universal SRS (one-time)  │             │\n' +
          '│  │   (powers of tau ceremony)  │             │\n' +
          '│  └──────────────┬──────────────┘             │\n' +
          '│                 ↓                            │\n' +
          '│  ┌──────────┐  ┌──────────┐  ┌──────────┐   │\n' +
          '│  │Circuit A │  │Circuit B │  │Circuit C │   │\n' +
          '│  │(preproc) │  │(preproc) │  │(preproc) │   │\n' +
          '│  └─────┬────┘  └─────┬────┘  └─────┬────┘   │\n' +
          '│        ↓             ↓             ↓        │\n' +
          '│  ┌──────────┐  ┌──────────┐  ┌──────────┐   │\n' +
          '│  │ Proof A  │  │ Proof B  │  │ Proof C  │   │\n' +
          '│  └──────────┘  └──────────┘  └──────────┘   │\n' +
          '│                                              │\n' +
          '│  KEY COMPONENTS                              │\n' +
          '│  ┌────────────────────────────────────────┐  │\n' +
          '│  │ KZG polynomial commitments             │  │\n' +
          '│  │ Permutation argument (copy constraints)│  │\n' +
          '│  │ Custom gates (extend beyond add/mul)   │  │\n' +
          '│  │ Updatable SRS (add your randomness)    │  │\n' +
          '│  └────────────────────────────────────────┘  │\n' +
          '└──────────────────────────────────────────────┘',
        keyPoints: [
          "Universal setup: one SRS (Structured Reference String) works for any circuit up to a max size",
          "Updatable: anyone can add their own randomness to the SRS, strengthening trust assumptions",
          "Permutation argument: enforces that wires connecting gates carry consistent values (copy constraints)",
          "KZG polynomial commitments enable efficient proof generation and verification",
          "Custom gates allow encoding complex operations (hash functions, range checks) more efficiently than R1CS"
        ],
        connections:
          "PLONK is a strong alternative for the thesis if the " +
          "credential circuit needs to evolve. A universal setup " +
          "means new attribute schemas or predicate types do " +
          "not require new ceremonies. PLONK-based systems like " +
          "Halo2 are used in privacy protocols (Zcash Orchard). " +
          "If Sui adds native PLONK verification, it could " +
          "simplify credential system upgrades.",
        publicPrivate: [
          { item: "universal SRS (structured reference string)", status: "public", holder: "everyone", when: "after trusted setup (universal, reusable across circuits)" },
          { item: "circuit-specific preprocessed data", status: "public", holder: "everyone", when: "after circuit compilation (derived from SRS + circuit)" },
          { item: "proof", status: "public", holder: "everyone", when: "after proof generation" },
          { item: "witness (private inputs)", status: "private", holder: "prover", when: "always (never revealed)" },
          { item: "KZG polynomial commitments", status: "public", holder: "everyone", when: "included in proof (verifier checks openings)" }
        ],
        thesisExample:
          "PLONK's universal setup is attractive for your system: " +
          "as you iterate on the credential circuit during your " +
          "thesis, you don't need a new trusted ceremony for each " +
          "circuit change. The lookup argument (plookup) could " +
          "efficiently implement the 'country ∈ EU' set membership " +
          "check inside the circuit. PLONK proofs are ~400B (vs " +
          "Groth16's 288B) with ~5ms verification — a reasonable " +
          "tradeoff for development flexibility.",
        history: {
          inventor: "Ariel Gabizon, Zachary Williamson, Oana Ciobotaru (Aztec Network / Protocol Labs)",
          year: 2019,
          context:
            "Gabizon, Williamson, and Ciobotaru published 'PLONK: " +
            "Permutations over Lagrange-bases for Oecumenical Noninteractive " +
            "arguments of Knowledge' (ePrint 2019/953). PLONK solved the " +
            "universal setup problem: unlike Groth16 (per-circuit setup), " +
            "PLONK's SRS works for any circuit up to a maximum size. It " +
            "built on Kate-Zaverucha-Goldberg (KZG) polynomial commitments " +
            "(2010) and Sonic (Maller, Bowe, Kohlweiss, Meiklejohn, 2019). " +
            "Halo (Bowe, Grigg, Hopwood, 2019) later achieved recursive " +
            "proof composition without trusted setup. PLONK variants " +
            "proliferated: TurboPLONK (custom gates), UltraPLONK (plookup " +
            "tables), Halo2 (Zcash, recursive), and Noir (Aztec DSL).",
          funFact:
            "The name PLONK is a backronym: 'Permutations over " +
            "Lagrange-bases for Oecumenical Noninteractive arguments of " +
            "Knowledge.' The 'O' stands for 'Oecumenical' (meaning " +
            "universal), chosen to make the acronym spell a word meaning " +
            "'cheap wine' in British slang."
        },
        limitations: [
          "PLONK proofs are ~400-700 bytes (vs 192 for Groth16) and require " +
          "~15-25ms verification (vs ~5ms for Groth16). While still practical, " +
          "this 3-5x overhead accumulates in high-throughput blockchain " +
          "settings where every millisecond of verification affects TPS.",
          "The universal SRS still requires a trusted setup ceremony (powers " +
          "of tau). While the SRS is reusable across circuits and updatable " +
          "(anyone can add randomness), the initial ceremony must be " +
          "conducted honestly. If compromised, all circuits using that SRS " +
          "are insecure.",
          "KZG polynomial commitments (used in PLONK) are not quantum-safe " +
          "(based on discrete log). Replacing KZG with FRI (hash-based) " +
          "gives Plonky2/Plonky3, which are quantum-safe but with larger " +
          "proofs (~100KB) and slower verification."
        ],
        exercises: [
          {
            type: "conceptual",
            question:
              "What is the 'permutation argument' in PLONK, and why is it " +
              "needed? What problem does it solve that R1CS handles " +
              "differently?",
            hint:
              "In a circuit, the output wire of one gate connects to the " +
              "input wire of another. The permutation argument enforces " +
              "these 'copy constraints.'",
            answer:
              "In PLONK's flat table representation, each row is a gate " +
              "with columns (a, b, c) for left input, right input, and " +
              "output. When gate 1's output must equal gate 2's input, " +
              "this is a 'copy constraint': c_1 = a_2. The permutation " +
              "argument proves that values at specified positions are " +
              "equal by showing that a permutation mapping those positions " +
              "preserves all values. Technically, it uses a grand product " +
              "check: prod((f(i) + beta*i + gamma) / (f(i) + beta*sigma(i) + " +
              "gamma)) = 1, where sigma is the permutation. In R1CS, copy " +
              "constraints are implicit in the constraint matrices A, B, C " +
              "(the same variable index appears in multiple constraints)."
          },
          {
            type: "comparison",
            question:
              "Compare Groth16, PLONK, and Halo2 as candidates for the " +
              "thesis credential circuit. Consider: setup requirements, " +
              "proof size, verification time, ability to upgrade the circuit, " +
              "and ecosystem maturity.",
            hint:
              "Halo2 is used in Zcash Orchard and supports recursive proofs. " +
              "PLONK and Halo2 share the PLONKish arithmetization.",
            answer:
              "Groth16: per-circuit setup, 192B proof, ~5ms verify, cannot " +
              "upgrade without new ceremony, mature ecosystem (circom, " +
              "snarkjs, arkworks). PLONK: universal setup (reusable), ~500B " +
              "proof, ~20ms verify, circuits upgradeable within SRS bounds, " +
              "growing ecosystem (noir, plonky). Halo2: no trusted setup " +
              "(IPA-based), ~5KB proof, ~100ms verify, recursive proofs " +
              "enable proof aggregation, Zcash ecosystem. For the thesis: " +
              "Groth16 for on-chain verification (Sui native support, " +
              "smallest proof). PLONK as upgrade path if credential schemas " +
              "change frequently. Halo2 if proof aggregation (batching " +
              "multiple credential proofs into one) becomes needed."
          },
          {
            type: "design",
            question:
              "The thesis credential circuit may need updates (new attribute " +
              "types, new predicate functions). Design a strategy using " +
              "PLONK's universal setup to handle circuit evolution without " +
              "new ceremonies.",
            hint:
              "The universal SRS supports any circuit up to a maximum size N. " +
              "Only the circuit-specific preprocessing needs to change.",
            answer:
              "Strategy: (1) Conduct one powers-of-tau ceremony with N = " +
              "2^22 (~4 million constraints), large enough for any foreseeable " +
              "credential circuit. (2) Define the credential verification " +
              "circuit as a versioned template: v1 supports 10 attributes + " +
              "range proofs + Merkle membership. (3) When v2 adds new " +
              "attribute types or predicates, recompile the circuit against " +
              "the same SRS. Only the preprocessed verification key changes " +
              "(deployed as a new Sui Move module). (4) Both v1 and v2 " +
              "proofs can coexist on-chain, verified by different modules " +
              "sharing the same trusted SRS. This avoids re-running the " +
              "ceremony for each credential schema update."
          }
        ]
      },
      {
        name: "Bulletproofs",
        analogy:
          "A Russian nesting doll proof. Each layer of the " +
          "proof halves its size through a recursive inner " +
          "product argument, compressing a large statement " +
          "into a logarithmically small proof. No trusted " +
          "setup ceremony is needed at all, but opening " +
          "each doll takes time, making verification slower.",
        diagram:
          '┌──────────────────────────────────────────────┐\n' +
          '│           Bulletproofs (IPA-based)            │\n' +
          '├──────────────────────────────────────────────┤\n' +
          '│                                              │\n' +
          '│  INNER PRODUCT ARGUMENT                      │\n' +
          '│  Prove: <a, b> = c                           │\n' +
          '│                                              │\n' +
          '│  Round 1: n elements                         │\n' +
          '│  ┌─────────────────────────────────────┐     │\n' +
          '│  │ a1 a2 a3 a4 a5 a6 a7 a8 │ n=8      │     │\n' +
          '│  └─────────────┬───────────────────────┘     │\n' +
          '│                ↓ fold (halve)                │\n' +
          '│  Round 2: n/2 elements                       │\n' +
          '│  ┌─────────────────────┐                     │\n' +
          '│  │ a1\' a2\' a3\' a4\'  │ n=4                │\n' +
          '│  └─────────┬───────────┘                     │\n' +
          '│            ↓ fold                            │\n' +
          '│  Round 3: n/4 elements                       │\n' +
          '│  ┌───────────┐                               │\n' +
          '│  │ a1" a2"   │ n=2                           │\n' +
          '│  └─────┬─────┘                               │\n' +
          '│        ↓ fold                                │\n' +
          '│  Final: single element                       │\n' +
          '│  ┌─────┐                                     │\n' +
          '│  │ a*  │ → verify                            │\n' +
          '│  └─────┘                                     │\n' +
          '│                                              │\n' +
          '│  Proof size: O(log n) group elements         │\n' +
          '│  Verify:     O(n) — must recompute           │\n' +
          '│  Setup:      NONE (transparent)              │\n' +
          '└──────────────────────────────────────────────┘',
        keyPoints: [
          "No trusted setup: completely transparent, based on discrete log assumption only",
          "Logarithmic proof size: O(log n) group elements, much smaller than the statement but larger than SNARKs",
          "Linear verification time O(n): verifier must recompute the inner product, making it slower than Groth16",
          "Primary use case: range proofs (proving a value is in [0, 2^n) without revealing it)",
          "Used in Monero for confidential transaction amounts; also in Zcash Sapling for Pedersen hash commitments"
        ],
        connections:
          "Bulletproofs are relevant for range proofs in the " +
          "thesis credential system: proving an age attribute " +
          "is above 18, or a payment amount is within bounds, " +
          "without revealing the exact value. However, their " +
          "O(n) verification cost makes them unsuitable for " +
          "direct on-chain use on Sui. The thesis may use " +
          "Bulletproof range proofs inside a Groth16 wrapper " +
          "for efficient on-chain verification.",
        publicPrivate: [
          { item: "generators G, H", status: "public", holder: "everyone", when: "always (system parameters, no trusted setup)" },
          { item: "commitment C = vG + rH", status: "public", holder: "everyone", when: "always (published by committer)" },
          { item: "opening (value v, blinding factor r)", status: "private", holder: "committer/prover", when: "always (never revealed to verifier)" },
          { item: "proof (inner product argument)", status: "public", holder: "everyone", when: "after proof generation (O(log n) group elements)" },
          { item: "range being proved (e.g., v in [0, 2^64))", status: "public", holder: "everyone", when: "always (part of the public statement)" }
        ],
        thesisExample:
          "Bulletproofs handle range proofs in your payment layer: " +
          "prove that the transaction amount v ∈ [0, 2^64) without " +
          "revealing v. No trusted setup needed (unlike Groth16 " +
          "range proofs). Aggregated Bulletproofs let you prove " +
          "ranges for multiple outputs in one proof. Monero's " +
          "adoption of Bulletproofs validates their practicality " +
          "for private payments — your system applies the same " +
          "technique on Sui.",
        history: {
          inventor: "Benedikt Bunz, Jonathan Bootle, Dan Boneh, Andrew Poelstra, Pieter Wuille, Greg Maxwell",
          year: 2017,
          context:
            "Bunz et al. published 'Bulletproofs: Short Proofs for " +
            "Confidential Transactions and More' (S&P 2018, ePrint " +
            "2017/1066). The core technique builds on Bootle et al.'s " +
            "efficient inner product argument (EUROCRYPT 2016) from UCL. " +
            "Bulletproofs were designed specifically for range proofs in " +
            "confidential transactions — proving a committed value is in " +
            "[0, 2^n) without revealing it. Monero adopted Bulletproofs in " +
            "October 2018 (hard fork v0.13), reducing transaction sizes by " +
            "~80%. Bulletproofs+ (Chung, Han, Ju, Kim, 2020) further " +
            "reduced proof size by ~15%.",
          funFact:
            "Before Bulletproofs, Monero's range proofs used Borromean ring " +
            "signatures, producing ~13KB per output. Bulletproofs compressed " +
            "this to ~0.7KB (single output), saving Monero ~$100M per year " +
            "in transaction fees at 2018 volumes."
        },
        limitations: [
          "Verification time is O(n) where n is the number of generators " +
          "(bit length of the range). Verifying a 64-bit range proof " +
          "requires ~64 multi-scalar exponentiations, taking ~3-5ms. " +
          "Batch verification amortizes this (128 proofs in ~50ms) but " +
          "single-proof verification is 5-10x slower than Groth16.",
          "Not quantum-safe: Bulletproofs rely on the discrete log " +
          "assumption (same as Pedersen commitments). Shor's algorithm " +
          "breaks the binding of the underlying commitment and the " +
          "soundness of the inner product argument.",
          "Proving time is O(n) with significant constants due to " +
          "multi-scalar multiplication at each round. A 64-bit range proof " +
          "takes ~20-50ms to generate, compared to ~500ms for an equivalent " +
          "Groth16 range circuit. However, Groth16's proof is constant-size " +
          "while Bulletproofs grow logarithmically."
        ],
        exercises: [
          {
            type: "calculation",
            question:
              "A Bulletproof for a 64-bit range proof produces " +
              "2*ceil(log2(64)) = 2*6 = 12 group elements plus 5 scalars " +
              "and a few additional elements. If each group element is " +
              "32 bytes and each scalar is 32 bytes, estimate the proof " +
              "size. Compare with Groth16's 192 bytes.",
            hint:
              "The Bulletproof inner product argument produces 2*log2(n) " +
              "group elements (L_i, R_i pairs) plus 2 scalars (a, b) " +
              "and 3 additional elements (A, S, T1, T2, tau_x, mu, t_hat).",
            answer:
              "Inner product argument: 2*6 = 12 group elements (L, R pairs) " +
              "= 384 bytes. Final scalars: a, b = 64 bytes. Protocol " +
              "elements: A (commitment to aL, aR), S (commitment to sL, sR), " +
              "T1, T2 (polynomial commitments) = 4 group elements = 128 bytes. " +
              "Scalars: tau_x, mu, t_hat = 3 scalars = 96 bytes. " +
              "Total: 384 + 64 + 128 + 96 = 672 bytes. Compare: Groth16 = " +
              "192 bytes (3.5x smaller). But Bulletproofs need NO trusted " +
              "setup, which for range proofs in a payment system is a " +
              "significant advantage."
          },
          {
            type: "conceptual",
            question:
              "Explain the inner product argument at a high level. Why does " +
              "it produce a logarithmic-size proof for a linear-size " +
              "statement?",
            hint:
              "The prover recursively halves the vectors, sending 2 group " +
              "elements per round. After log2(n) rounds, the vectors are " +
              "size 1 and can be checked directly.",
            answer:
              "The prover wants to convince the verifier that <a, b> = c " +
              "for vectors a, b of length n. Round 1: split a = (a_L, a_R) " +
              "and b = (b_L, b_R). Send L = <a_L, b_R> and R = <a_R, b_L> " +
              "as group element commitments. Verifier sends random x. " +
              "Prover folds: a' = a_L*x + a_R*x^(-1), b' = b_R*x + " +
              "b_L*x^(-1). Now a', b' have length n/2. Repeat for log2(n) " +
              "rounds until a', b' are single elements, then send them. " +
              "Total: 2*log2(n) group elements (L_i, R_i) + 2 field elements " +
              "(final a', b'). Verification: O(n) because the verifier must " +
              "compute the final commitment from all the L_i, R_i values."
          },
          {
            type: "design",
            question:
              "The thesis payment layer needs range proofs for transaction " +
              "amounts. Compare two approaches: (a) Bulletproofs directly " +
              "on-chain, (b) Bulletproof range proof wrapped inside a " +
              "Groth16 proof. Which should the thesis use and why?",
            hint:
              "Consider on-chain verification cost, trusted setup burden, " +
              "and proof aggregation. Sui has native Groth16 but not native " +
              "Bulletproof verification.",
            answer:
              "Approach (a) Bulletproofs on-chain: no trusted setup, ~672B " +
              "proof, but verification is O(n) requiring ~5ms for 64-bit " +
              "range AND requires a custom Move verifier (no Sui native " +
              "support). Approach (b) Bulletproof inside Groth16: the ZK " +
              "circuit takes the Bulletproof components as private inputs " +
              "and verifies the range proof inside the circuit. Output: " +
              "Groth16 proof (192B, ~5ms native verification). Cost: the " +
              "Bulletproof verification adds ~50K constraints to the Groth16 " +
              "circuit. Recommendation for the thesis: approach (b) because " +
              "Sui has native Groth16 verification, and the credential " +
              "circuit already uses Groth16. Alternatively, encode range " +
              "proofs directly as R1CS constraints (bit decomposition, " +
              "~64 constraints per 64-bit range) which is simpler than " +
              "wrapping Bulletproofs."
          }
        ]
      }
    ]
  }
};
