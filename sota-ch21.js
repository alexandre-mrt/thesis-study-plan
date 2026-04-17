/**
 * Ch 2.1 Anonymous Credentials — SOTA Addendum (2024-2026)
 *
 * State-of-the-art research, standardization drafts, and deployment milestones
 * that post-date the main ch21-papers-guide.js / ch21-papers-technical.js
 * baseline. Every entry is cross-referenced to an authoritative public URL.
 *
 * Rendering: KaTeX with \\( ... \\) inline and \\[ ... \\] display.
 * Loaded as window.SOTA_CH21 by index.html.
 *
 * Last curated: 2026-04-17.
 */
window.SOTA_CH21 = {
  chapter: "Ch 2.1 Anonymous Credentials",
  last_updated: "2026-04-17",
  items: [
    /* ───────── 1. BBS Signatures IRTF draft-10 ───────── */
    {
      name: "The BBS Signature Scheme — IRTF CFRG draft-irtf-cfrg-bbs-signatures-10",
      authors: "Tobias Looker, Vasilis Kalos, Andrew Whitehead, Mike Lodder",
      venue: "IRTF CFRG Internet-Draft (January 2026)",
      year: 2026,
      link: "https://datatracker.ietf.org/doc/draft-irtf-cfrg-bbs-signatures/",
      recap_short:
        "Active IRTF Internet-Draft standardizing BBS signatures over BLS12-381 for interoperable selective-disclosure credentials; draft-10 refines ciphersuites and proof generation/verification pseudocode ahead of IESG submission.",
      recap_long:
        "Draft-10 (January 2026) is the latest iteration of the CFRG BBS specification that formalizes the core Sign / Verify / ProofGen / ProofVerify interfaces on BLS12-381-SHAKE-256 and BLS12-381-SHA-256 ciphersuites. Compared to the early 2022-2023 drafts that most academic BBS papers still cite (draft-04 / draft-05), draft-10 tightens the challenge-hashing domain separation, clarifies generator derivation via hash-to-curve (expand_message_xmd), and aligns the witness encoding with the companion Blind BBS and per-verifier linkability drafts (see items 2 and 3). " +
        "This is the anchor that W3C VC Data Integrity, EUDI Wallet, ISO mDL and production SDKs (Mattr, Digital Bazaar, DIF, Animo) converge on. Any thesis design that claims 'BBS signatures' interoperable with the outside world must cite this specific draft number because prior drafts differ in ciphersuite and challenge-hash structure.",
      math_highlight:
        "Core signature: $\\sigma = (A, e)$ with $A = B \\cdot (x + e)^{-1} \\in \\mathbb{G}_1$, " +
        "where $B = P_1 + Q_1 \\cdot \\mathsf{domain} + \\sum_{i=1}^{L} H_i \\cdot m_i$ and $x = \\mathsf{SK}$. " +
        "Verification checks $e(A,\\; W + \\tilde{P}_2 \\cdot e) = e(B,\\; \\tilde{P}_2)$ with $W = \\tilde{P}_2^x$.",
      why_for_thesis:
        "This is the canonical BBS reference the thesis must pin against. A Sui Move verifier or Rust client library targeting BBS must implement the draft-10 ciphersuite verbatim, or its credentials will be incompatible with EUDI wallets and W3C verifiers. When the thesis reports gas / cycle numbers, cite draft-10 to avoid confusion with the older Tessaro-Zhu academic variant.",
      tags: ["standard", "RFC", "BBS", "BLS12-381", "implementation"]
    },

    /* ───────── 2. Blind BBS Signatures IRTF draft-02 ───────── */
    {
      name: "Blind BBS Signatures — IRTF CFRG draft-irtf-cfrg-bbs-blind-signatures-02",
      authors: "Vasilis Kalos, Greg M. Bernstein",
      venue: "IRTF CFRG Internet-Draft (latest revision 2025-09-03)",
      year: 2025,
      link: "https://datatracker.ietf.org/doc/draft-irtf-cfrg-bbs-blind-signatures/",
      recap_short:
        "Specifies a blind-issuance extension of BBS where the signer signs a vector of committed, signer-hidden messages alongside signer-known messages; the output is verifiable against the same draft-10 ProofVerify and enables device-bound secrets and OAuth-style privacy-preserving issuance.",
      recap_long:
        "Blind BBS partitions the signed vector into (committed, uncommitted) messages: the Holder commits to secrets such as a link-secret or a device-bound key using a Pedersen-style commitment $C = \\prod H_i^{m_i} \\cdot H_s^{s}$, sends $C$ + a PoK to the Issuer, and receives a standard BBS signature over $[\\text{committed} \\,\\|\\, \\text{visible}]$ without the Issuer ever learning the committed content. " +
        "This is crucial for the 'hardware-bound' credential story: the private key never leaves the TEE / secure element, yet the issuer can still sign over it. Draft-02 fixes challenge-hash separators and nonce encoding to match the main draft-10 API; implementations in @mattrglobal/bbs-signatures and DIF Veramo already track it.",
      math_highlight:
        "Holder commits: $C = Q_1 \\cdot s' + \\sum_{i \\in \\text{hidden}} H_i \\cdot m_i$ and sends $(C, \\pi_{\\text{PoK}})$. " +
        "Signer completes: $A = (C + Q_1 \\cdot s'' + \\sum_{i \\in \\text{visible}} H_i \\cdot m_i + P_1)(x + e)^{-1}$.",
      why_for_thesis:
        "Direct building block for device-bound credentials on Sui: the user's link-secret lives in a Seal enclave / iOS Secure Enclave, the Issuer TEE signs blindly, and the resulting credential is unforgeable even if the Holder's host OS is compromised. Blind BBS is the standards-tracked alternative to ad-hoc 'sign-over-commitment' tricks in the academic literature.",
      tags: ["standard", "blind-signature", "device-binding", "TEE"]
    },

    /* ───────── 3. BBS per-Verifier Linkability draft-02 ───────── */
    {
      name: "BBS per Verifier Linkability (Pseudonyms) — draft-irtf-cfrg-bbs-per-verifier-linkability-02",
      authors: "Vasilis Kalos, Greg M. Bernstein",
      venue: "IRTF CFRG Internet-Draft (latest revision 2025-09-03)",
      year: 2025,
      link: "https://datatracker.ietf.org/doc/draft-irtf-cfrg-bbs-per-verifier-linkability/",
      recap_short:
        "Adds scoped pseudonyms to BBS proofs so that the same Holder presents an identical tag to the same verifier (context-binding) but uncorrelated tags to different verifiers — without the Issuer ever learning the Holder's link-secret.",
      recap_long:
        "The construction computes a verifier-scoped pseudonym $\\mathsf{nym} = H_{\\text{pid}}^{\\mathit{ls}}$ where $H_{\\text{pid}} = \\mathsf{hash\\_to\\_curve}(\\text{verifier\\_id})$ and $\\mathit{ls}$ is a link-secret signed (blindly) as a hidden BBS message. The BBS proof extension proves in zero-knowledge that the same $\\mathit{ls}$ underlies $\\mathsf{nym}$ and the credential, so the verifier can detect repeat visits and rate-limit sybils yet cannot correlate users across domains. " +
        "This is the sybil-resistance layer EUDI Wallet Regulation and the W3C BBS Data Integrity spec explicitly require; draft-02 aligns with the main draft-10 challenge structure so that a single proof covers credential validity + scoped-pseudonym correctness.",
      math_highlight:
        "Verifier-scoped pseudonym: $\\mathsf{nym}_V = (\\mathsf{hash\\_to\\_curve}(V))^{\\mathit{ls}} \\in \\mathbb{G}_1$. " +
        "Proof statement: $\\mathsf{PoK}\\{(\\mathit{ls}, \\sigma) : \\mathsf{Verify}(\\sigma, m, \\mathit{ls}) = 1 \\;\\wedge\\; \\mathsf{nym}_V = H_V^{\\mathit{ls}} \\}$.",
      why_for_thesis:
        "Maps 1-to-1 onto the thesis's per-dApp unlinkability goal on Sui: a user can be linkable within one payment protocol (for rate-limiting or reputation) but unlinkable across protocols. Implementing this draft inside the Move verifier avoids reinventing a custom nullifier scheme and inherits CFRG security review.",
      tags: ["standard", "pseudonym", "sybil-resistance", "unlinkability"]
    },

    /* ───────── 4. Threshold BBS+ (Doerner et al.) ───────── */
    {
      name: "Threshold BBS+ Signatures for Distributed Anonymous Credential Issuance",
      authors: "Jack Doerner, Yashvanth Kondi, Eysa Lee, abhi shelat, LaKyah Tyner",
      venue: "IEEE S&P 2023 / IACR ePrint 2023/602",
      year: 2023,
      link: "https://eprint.iacr.org/2023/602",
      recap_short:
        "First efficient $t$-of-$n$ distributed signing protocol for BBS+ using MPC-style preprocessing; reduces issuance to a few rounds of local computation + additive secret sharing, removing the single-issuer trust assumption without changing the verifier.",
      recap_long:
        "The signer secret $x = \\mathsf{SK}$ is split with Shamir sharing, and the hard step — computing $A = B (x+e)^{-1}$ — is handled by an MPC protocol that multiplies two secret-shared values and then inverts the shared sum. The paper achieves non-interactive online issuance after an offline preprocessing phase, making it deployment-realistic for an issuer cluster. " +
        "Crucially the output is byte-identical to a single-party BBS+ signature, so existing Holders, verifiers and circuits work unchanged. This is the security foundation for every follow-up 'threshold BBS' paper (items 5 and 6) and for production pilots at Hyperledger AnonCreds v2.",
      math_highlight:
        "Threshold issuance: each party $P_j$ holds share $x_j$ of $x$; they jointly compute " +
        "$\\langle A \\rangle = B \\cdot \\langle (x + e)^{-1} \\rangle$ via MPC inversion, revealing $A$ at the end. " +
        "Security: EUF-CMA of BBS+ $\\Rightarrow$ UC-security of the distributed signing functionality under $t < n/2$ static corruption.",
      why_for_thesis:
        "Directly supports the thesis's 'no single issuer' goal: a federation of TEE-backed Issuers (each Sui validator running Seal) can co-sign a credential without any single enclave ever holding the full issuer key. The thesis can cite this as the concrete construction realizing the threshold architecture it describes.",
      tags: ["threshold", "MPC", "BBS+", "issuance"]
    },

    /* ───────── 5. Multi-Holder BBS ───────── */
    {
      name: "Multi-Holder Anonymous Credentials from BBS Signatures",
      authors: "Andrea Flamini, Eysa Lee, Anna Lysyanskaya",
      venue: "IACR ePrint 2024/1874",
      year: 2024,
      link: "https://eprint.iacr.org/2024/1874",
      recap_short:
        "Extends BBS to the multi-holder setting where one credential is jointly owned by several parties who must cooperate to present it, formalizing a security model in between single-holder BBS and fully delegatable credentials.",
      recap_long:
        "The construction lets a credential be co-owned by $k$ Holders, each binding a share of a joint link-secret to the signature. Showing the credential requires all $k$ parties (or a predefined subset) to contribute proof shares — useful for organizational credentials, joint accounts, or custodial recovery. The paper proves unforgeability and unlinkability under the standard BBS assumptions plus a new 'multi-holder' distinguishing game, and gives concrete schemes in BLS12-381 with minimal overhead over single-holder BBS. " +
        "It composes cleanly with the CFRG drafts: the underlying signature is still verifiable by a stock draft-10 verifier once the Holders finalize the joint proof.",
      math_highlight:
        "Joint link-secret $\\mathit{ls} = \\sum_{j=1}^{k} \\mathit{ls}_j$ committed as $H_{\\mathit{ls}}^{\\mathit{ls}}$. " +
        "Show: each Holder $j$ contributes $\\pi_j$ proving knowledge of $\\mathit{ls}_j$ and a shared Fiat-Shamir challenge; " +
        "aggregated proof $\\pi = \\prod \\pi_j$ verifies against the single BBS signature.",
      why_for_thesis:
        "Useful for the thesis's enterprise and joint-custody use cases on Sui: a DAO treasury or a corporate entity may need a credential that no single person can wield unilaterally. This paper supplies the formal model and ready-to-implement construction.",
      tags: ["multi-party", "BBS", "joint-custody", "theoretical"]
    },

    /* ───────── 6. Two-Party BBS+ in Two Passes ───────── */
    {
      name: "Two-Party BBS+ Signature in Two Passes",
      authors: "Xiaofei Wu, Tian Qiu, Guofeng Tang, Yuqing Niu, Bowen Jiang, Jun Zhou, Haiyang Xue, Guomin Yang",
      venue: "IACR ePrint 2026/573",
      year: 2026,
      link: "https://eprint.iacr.org/2026/573",
      recap_short:
        "Optimizes the 2-of-2 BBS+ case (phone + cloud) to just two communication passes with no preprocessing, achieving near-single-party latency — the practical deployment profile for mobile wallets.",
      recap_long:
        "While general $t$-of-$n$ threshold BBS+ (item 4) is elegant, real deployments overwhelmingly use the 2-of-2 'split-key' pattern: one key share on the phone, one on a backend that rate-limits issuance or enforces a policy. This paper redesigns the Doerner et al. protocol for that specific case and cuts it to two rounds online with no offline preprocessing, matching the latency budget of a mobile UX. Security is proved under the same q-SDH assumption as single-party BBS+, in the random oracle model. " +
        "Independent interest: the construction avoids the OT / Beaver-triple preprocessing that made earlier threshold BBS incompatible with low-power devices.",
      math_highlight:
        "Two-pass issuance: phone sends $(R_1, c_1)$; server replies $(R_2, s_2)$; phone derives $(A, e)$ locally. " +
        "Round count is 2 and online exponentiations per party $\\leq 3$, asymptotically matching single-party BBS+.",
      why_for_thesis:
        "The canonical pattern for the thesis's Sui mobile wallet: local key share in Secure Enclave, second share in a Seal TEE on Mysten infrastructure. This paper provides a directly implementable 2-of-2 threshold without the cost of full MPC preprocessing.",
      tags: ["threshold", "2-of-2", "mobile", "BBS+"]
    },

    /* ───────── 7. Tight Security for BBS Signatures ───────── */
    {
      name: "Tight Security for BBS Signatures",
      authors: "Rutchathon Chairattana-Apirom, Dennis Hofheinz, Stefano Tessaro",
      venue: "IACR ePrint 2025/1973",
      year: 2025,
      link: "https://eprint.iacr.org/2025/1973",
      recap_short:
        "Gives the first tight EUF-CMA security reduction for BBS (not BBS+) under a standard assumption, closing the lossy $O(q_s)$ gap that forced prior deployments to inflate BLS12-381 parameters.",
      recap_long:
        "The Tessaro-Zhu 2023 'Revisiting BBS' proof relied on the Algebraic Group Model and lost a factor $q_s$ (signing-query count) in the reduction. This 2025 follow-up (same group at UW + ETH) removes the $q_s$ slack and gives a tight reduction to a concrete hardness problem, in the ROM. Concretely, implementers no longer need to over-provision group sizes to account for $2^{30}$ queries per issuer. " +
        "The paper also refines the concrete security analysis of the BBS proof-of-possession (ProofGen / ProofVerify), which is what production verifiers actually run. Combined with the companion 'On the Concrete Security of BBS/BBS+' (2025/1093) by the same authors, this is the state-of-the-art foundation for picking parameters.",
      math_highlight:
        "Tight reduction: $\\mathsf{Adv}^{\\text{EUF-CMA}}_{\\mathsf{BBS}}(\\mathcal{A}) \\leq \\mathsf{Adv}^{\\text{q-SDH}}(\\mathcal{B}) + \\mathcal{O}(1/p)$, " +
        "independent of the number of signing queries $q_s$.",
      why_for_thesis:
        "Lets the thesis defend parameter choices on solid ground: using BLS12-381 at the standard 128-bit level is provably sufficient for any realistic query volume of a Sui-scale issuer. Cite this to answer the inevitable committee question 'how does the security proof degrade with issuance volume?'.",
      tags: ["security-proof", "tight-reduction", "theoretical", "parameters"]
    },

    /* ───────── 8. Device-Bound Anonymous Credentials ───────── */
    {
      name: "Device-Bound Anonymous Credentials With(out) Trusted Hardware",
      authors: "Karla Friedrichs, Franklin Harding, Anja Lehmann, Anna Lysyanskaya",
      venue: "IACR ePrint 2025/1995",
      year: 2025,
      link: "https://eprint.iacr.org/2025/1995",
      recap_short:
        "Formalizes device-bound anonymous credentials in two flavors — with a TEE/secure-element and without — and gives BBS-compatible constructions whose security degrades gracefully when the hardware is compromised.",
      recap_long:
        "Device binding is essential for real-world privacy credentials (EUDI, mDL): the signing key must never leave a hardware-protected module, otherwise it can be exfiltrated by malware and duplicated. This paper gives the first unified formal model covering the TEE-based binding (where attestation is available) and the 'soft' binding (where only commitment + PoK is used). Both constructions use BBS as the credential backbone and plug directly into draft-10 verifiers. " +
        "The 'without trusted hardware' mode falls back gracefully: if the device key leaks, an adversary can still only impersonate the specific Holder, not forge new credentials — a strictly stronger guarantee than stock BBS + ad-hoc key-binding.",
      math_highlight:
        "Hardware binding: credential message vector includes $m_d = \\mathsf{sk}_d$ stored in TEE, " +
        "Show produces $\\mathsf{nym}_d = H_d^{m_d}$ + remote attestation $\\mathsf{att}(\\mathsf{pk}_d)$. " +
        "Unforgeability: $\\mathsf{Adv}^{\\text{forge}}(\\mathcal{A}) \\leq \\mathsf{Adv}^{\\text{BBS}}(\\mathcal{B}) + \\mathsf{Adv}^{\\text{att}}(\\mathcal{C})$.",
      why_for_thesis:
        "This is arguably the single most relevant 2025 paper for the thesis: it formalizes exactly the TEE-bound anonymous credential setting the thesis targets on Sui, and provides both the ideal (with attestation) and fallback (without) security models. Expect to cite it heavily in the related-work and security-analysis chapters.",
      tags: ["TEE", "device-binding", "attestation", "core-thesis"]
    },

    /* ───────── 9. Server-Aided Anonymous Credentials ───────── */
    {
      name: "Server-Aided Anonymous Credentials",
      authors: "Rutchathon Chairattana-Apirom, Franklin Harding, Anna Lysyanskaya, Stefano Tessaro",
      venue: "CRYPTO 2025 / IACR ePrint 2025/513",
      year: 2025,
      link: "https://eprint.iacr.org/2025/513",
      recap_short:
        "Pairing-free anonymous credentials on the Holder side: an honest-but-curious Server performs the expensive pairing steps while learning nothing about Holder identity, bringing BBS-equivalent functionality to devices without pairing hardware.",
      recap_long:
        "The construction splits Show into a cheap Holder step (group operations only, no pairings) and an assisted Server step that handles the pairing check. Two variants: one with statistical anonymity (server's view is identically distributed across users) and one with computational anonymity (server plus issuer colluding still cannot link). The server cannot forge or link proofs. " +
        "Published at CRYPTO 2025, this is the leading candidate for mobile-first anonymous credentials where pairing-friendly-curve support is incomplete or too slow for interactive UX.",
      math_highlight:
        "Anonymity game: for all PPT $\\mathcal{S}^\\ast$, " +
        "$|\\Pr[\\mathcal{S}^\\ast(\\mathsf{View}_S(U_0)) = 1] - \\Pr[\\mathcal{S}^\\ast(\\mathsf{View}_S(U_1)) = 1]| \\leq \\mathsf{negl}(\\lambda)$. " +
        "Holder cost: $\\mathcal{O}(L)$ group ops; server cost: one pairing.",
      why_for_thesis:
        "If the Sui Move pairing primitives become a bottleneck for on-chain verification, this paper gives an alternative architecture: a Seal TEE acts as the honest-but-curious server, handling pairings while the on-chain Move contract only verifies cheap Schnorr-style equations.",
      tags: ["server-aided", "pairing-free", "mobile", "CRYPTO"]
    },

    /* ───────── 10. Issuer Hiding for BBS ───────── */
    {
      name: "Issuer Hiding for BBS-Based Anonymous Credentials",
      authors: "Jonathan Katz, Marek Sefranek",
      venue: "IACR ePrint 2025/2080",
      year: 2025,
      link: "https://eprint.iacr.org/2025/2080",
      recap_short:
        "Lets the Holder prove 'this credential was signed by some authorized issuer in the set $\\mathcal{I}$' without revealing which — protecting Holders who would otherwise leak their employer / bank / country via the $\\mathsf{pk}_I$ in the proof.",
      recap_long:
        "Vanilla BBS presentations include the issuer public key, which is often a privacy leak (revealing employer, bank, country of issuance…). Issuer hiding wraps the proof with a ring-signature-style Fiat-Shamir OR proof over the accredited issuer set, while keeping the BBS credential itself verifiable. The paper gives a construction whose proof size grows only logarithmically in $|\\mathcal{I}|$ using Merkle accumulators, and proves unlinkability across proofs of the same credential. " +
        "Follow-ups in 2026 (ePrint 2026/369, 2026/555) further reduce overhead with randomizable issuer public keys; the Katz-Sefranek paper remains the cleanest formalization.",
      math_highlight:
        "Given issuer set $\\mathcal{I} = \\{\\mathsf{pk}_1, \\ldots, \\mathsf{pk}_n\\}$ with root $R = \\mathsf{MerkleRoot}(\\mathcal{I})$, " +
        "Holder proves: $\\exists i,\\; \\pi : \\; \\mathsf{MerklePath}(\\mathsf{pk}_i, R) = \\pi \\;\\wedge\\; \\mathsf{VerifyBBS}(\\mathsf{pk}_i, \\sigma, m) = 1$ " +
        "in zero-knowledge, with proof size $\\mathcal{O}(\\log |\\mathcal{I}|)$.",
      why_for_thesis:
        "Essential for the thesis's cross-jurisdiction private-payments story: a user in Switzerland transferring on Sui should not reveal their KYC provider. Issuer hiding is what makes 'proof of KYC from any accredited provider in the EEA' a buildable primitive.",
      tags: ["issuer-privacy", "ring-proof", "BBS", "regulatory"]
    },

    /* ───────── 11. BBS x eIDAS 2.0 ───────── */
    {
      name: "Making BBS Anonymous Credentials eIDAS 2.0 Compliant",
      authors: "Nicolas Desmoulins, Antoine Dumanois, Seyni Kane, Jacques Traoré",
      venue: "IACR ePrint 2025/619",
      year: 2025,
      link: "https://eprint.iacr.org/2025/619",
      recap_short:
        "Detailed gap analysis between raw BBS + the draft CFRG suite and the eIDAS 2.0 regulatory requirements (revocation, auditability, holder-binding, high-assurance levels); proposes concrete add-ons with formal security arguments.",
      recap_long:
        "The authors (Orange Labs) map each eIDAS 2.0 requirement for EUDI Wallets — selective disclosure, holder binding, revocation, audit trail, interop with ISO mDL and W3C VCs — to BBS primitives and identify two gaps: revocation and auditable issuance logs. They propose a status-list-v2-compatible revocation extension that is ZK-checkable inside the BBS proof, and a structured-audit-log scheme that preserves unlinkability. " +
        "The paper bridges academic BBS work and the concrete deployment constraints shipping with the EUDI Wallet Reference Implementation.",
      math_highlight:
        "Non-revocation: status list encoded as bit-accumulator $\\mathsf{acc}_e$ at epoch $e$; " +
        "Holder proves $\\mathsf{NonMember}(\\mathsf{nym}_{\\text{rev}}, \\mathsf{acc}_e)$ as an additional clause in the BBS proof-of-knowledge, " +
        "cost $+\\mathcal{O}(\\log |\\text{revoked}|)$ group operations.",
      why_for_thesis:
        "Lets the thesis position a Sui-based BBS deployment as EU-compatible. The revocation construction can be reused verbatim; the audit-log story supports the thesis's accountability narrative (à la AccCred) in a regulator-friendly way.",
      tags: ["regulation", "eIDAS", "revocation", "deployment"]
    },

    /* ───────── 12. W3C VC Data Integrity BBS Cryptosuites ───────── */
    {
      name: "W3C Data Integrity BBS Cryptosuites v1.0",
      authors: "Greg Bernstein (Ed.), Manu Sporny (Ed.) — W3C Verifiable Credentials WG",
      venue: "W3C Working Draft (2026-04-07)",
      year: 2026,
      link: "https://www.w3.org/TR/vc-di-bbs/",
      recap_short:
        "W3C spec wiring BBS signatures into the Verifiable Credentials Data Integrity framework, defining JSON-LD selective-disclosure cryptosuites (`bbs-2023`) used by W3C VC issuers and verifiers.",
      recap_long:
        "This spec is what turns the abstract BBS mechanics of draft-10 into a format interoperable with the W3C Verifiable Credentials ecosystem. It defines RDF-canonicalization-based message mapping, JSON-LD proof structures, and two normative suites — base and selective-disclosure — built on the CFRG BBS profile. Latest Working Draft is dated 2026-04-07. " +
        "Every shipping VC implementation (Digital Bazaar, Animo Paradym, DIF Veramo, Mattr) either already supports this suite or has it on roadmap; it is the default path for BBS credentials on the open web.",
      math_highlight:
        "Selective disclosure: let $D \\subseteq \\{1,\\ldots,L\\}$ be disclosed indices. " +
        "Derived proof: $\\pi_D = \\mathsf{BBS.ProofGen}(\\mathsf{pk}, \\sigma, \\mathbf{m}, D)$, " +
        "with VC-DI envelope: $\\mathsf{proof} = \\{ \\mathsf{type}: \\text{DataIntegrityProof}, \\mathsf{cryptosuite}: \\text{bbs-2023}, \\mathsf{proofValue}: \\pi_D \\}$.",
      why_for_thesis:
        "The thesis's Sui credentials should be issuable in this format so they round-trip with W3C/DIF infrastructure. Implementing the `bbs-2023` suite gives the thesis automatic interop with the broader VC ecosystem (mobile wallets, verifier SaaS, hackathon tooling).",
      tags: ["standard", "W3C", "VC", "JSON-LD", "interop"]
    },

    /* ───────── 13. Privacy Pass Architecture (RFC 9576) ───────── */
    {
      name: "The Privacy Pass Architecture — RFC 9576",
      authors: "Alex Davidson, Jana Iyengar, Christopher A. Wood",
      venue: "IETF RFC 9576 (June 2024)",
      year: 2024,
      link: "https://datatracker.ietf.org/doc/rfc9576/",
      recap_short:
        "Finalized architecture RFC for Privacy Pass: unlinkable, rate-limited authorization tokens issued by a (trusted) Attester and redeemed anonymously at an Origin — the production deployment of 'lightweight' anonymous credentials on the open web.",
      recap_long:
        "Privacy Pass v3 decouples the Attester (verifies you once — e.g., solved a CAPTCHA, has a valid iCloud Private Relay account) from the Issuer (blindly signs a token) from the Origin (redeems the token anonymously). RFC 9576 (June 2024) standardizes that architecture; the companion RFC 9577 defines the HTTP authentication scheme and RFCs 9578/9579 define the concrete issuance protocols (public-metadata and blind-RSA variants). Cloudflare, Apple iCloud Private Relay, Fastly and Google have all shipped compatible token issuers. " +
        "Privacy Pass is 'anonymous credentials, minus attributes, plus HTTP-native rate limiting' — a practical sibling of the BBS ecosystem and a useful baseline for thesis implementation-effort comparisons.",
      math_highlight:
        "Token issuance (blind-RSA variant, RFC 9578): Origin asks $\\mathsf{TokenRequest}$, Client draws $r \\leftarrow \\mathbb{Z}_N^\\ast$, " +
        "sends $\\tilde{m} = r^e \\cdot H(m) \\bmod N$; Issuer returns $\\tilde{\\sigma} = \\tilde{m}^d \\bmod N$; " +
        "Client unblinds to $\\sigma = \\tilde{\\sigma}/r$. Verification is standard RSA-FDH.",
      why_for_thesis:
        "A production-grade, deployed counterpoint to BBS. The thesis can use Privacy Pass as a baseline — 'if you only need unlinkable rate-limiting without attributes, this is the off-the-shelf answer' — to motivate why BBS is needed for the richer selective-disclosure use cases the thesis targets.",
      tags: ["standard", "RFC", "privacy-pass", "deployment", "baseline"]
    },

    /* ───────── 14. EU Digital Identity Wallet ARF ───────── */
    {
      name: "EU Digital Identity Wallet — Architecture and Reference Framework (ARF)",
      authors: "European Commission DG CNECT / EUDI Wallet Expert Group",
      venue: "EU Regulation 2024/1183 + ARF (GitHub, active 2024-2026)",
      year: 2026,
      link: "https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework",
      recap_short:
        "Authoritative architectural spec that every EU member state's digital identity wallet must satisfy by 2026-2027, mandating selective disclosure, unlinkability across verifiers, revocation, and high-assurance device binding — the regulatory target BBS-based credentials must hit.",
      recap_long:
        "eIDAS 2.0 (Regulation 2024/1183) made the EUDI Wallet a regulatory obligation: every EU citizen must be offered one by 2026, and every regulated online service (banking, travel, public administration) must accept credentials from it. The ARF is the living technical specification on GitHub; it mandates support for ISO mDL (18013-5), SD-JWT VCs, and — via the Cryptographic Mechanisms subgroup — the BBS+ profile for full unlinkable selective disclosure. " +
        "The ARF is how academic BBS/ZK research becomes a 450-million-user market. Any thesis on anonymous credentials written in 2026 is measured against the ARF's requirements, whether it wants to be or not.",
      math_highlight:
        "Required high-assurance property (ARF §6.6, 'Unlinkability'): for any two Relying Parties $\\mathsf{RP}_1, \\mathsf{RP}_2$ " +
        "receiving presentations $\\pi_1, \\pi_2$ from the same Holder, $\\pi_1 \\not\\equiv \\pi_2$ and no PPT distinguisher " +
        "can link them with probability non-negligibly above $1/2$ without the Holder's cooperation.",
      why_for_thesis:
        "The ARF is the deployment target that justifies the whole thesis: 'why does a Sui-based anonymous credential system matter in 2026?' Because the ARF is about to mandate these properties across 27 countries. Cite the ARF in the introduction to frame the work as EU-production-relevant, not just academic.",
      tags: ["regulation", "EUDI", "deployment", "policy", "context"]
    }
  ]
};
