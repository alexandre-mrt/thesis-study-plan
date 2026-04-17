/**
 * Ch 2.3 Papers Guide — TEE & Confidential Computing
 * Academic paper recap cards: intuitive view with analogies, diagrams, and thesis connections.
 * Paired with ch23-papers-technical.js (window.CH23_PAPERS_TECH).
 */

window.CH23_PAPERS = {
  papers: [
    /* ───────── 1. TEE.Fail ───────── */
    {
      name: 'TEE.Fail',
      authors: 'Kenjar et al. (Georgia Tech, Purdue)',
      venue: '2025',
      status: 'skimmed',
      relevance: 'core',
      analogy:
        'A bank vault that looks solid from the front but has a ventilation duct on the ' +
        'side. The vault manufacturer (Intel) says the locks are unbreakable, and they are — ' +
        'nobody can brute-force the door. But an attacker with $1000 worth of plumbing tools ' +
        'can listen to the temperature changes inside the duct and deduce what is happening in ' +
        'the vault without ever opening it. TEE.Fail shows that TDX and SEV-SNP both have ' +
        'these ventilation ducts in the form of power draw, cache timing, and memory bus signals.',
      diagram_mermaid:
        'flowchart TD\n' +
        '  A["Attacker<br/>$1000 hardware"]\n' +
        '  A --> P["Power analysis<br/>RAPL interface<br/><i>Leaks AES key bytes</i>"]\n' +
        '  A --> C["Cache timing<br/>Prime+Probe on LLC<br/><i>Reveals data layout</i>"]\n' +
        '  A --> M["Memory bus<br/>DDR4 interposer<br/><i>Plaintext memory reads</i>"]\n' +
        '  P --> V1["Intel TDX<br/>Sapphire Rapids"]\n' +
        '  C --> V1\n' +
        '  M --> V1\n' +
        '  P --> V2["AMD SEV-SNP<br/>Milan, Genoa"]\n' +
        '  C --> V2\n' +
        '  M --> V2\n' +
        '  V1 --> I["No single TEE is side-channel-immune<br/><b>TEE-agnostic + hybrid ZKP design</b>"]\n' +
        '  V2 --> I\n' +
        '  classDef attack fill:#1f2937,stroke:#EF4444,color:#fff\n' +
        '  classDef vendor fill:#111827,stroke:#10B981,color:#fff\n' +
        '  classDef conclusion fill:#1a1a1a,stroke:#06B6D4,color:#fff\n' +
        '  class A,P,C,M attack\n' +
        '  class V1,V2 vendor\n' +
        '  class I conclusion',
      keyPoints: [
        'Side-channel attacks break TDX and SEV-SNP with under $1000 of commodity hardware',
        'RAPL power interface leaks cryptographic key material (accessible to unprivileged software)',
        'Prime+Probe cache attacks work against VM-level TEEs, not just SGX enclaves',
        'Hardware cost barrier is lower than ever: DDR4 interposers, logic analyzers, cheap FPGAs',
        'Countermeasures: disable RAPL from guest OS, cache partitioning (CAT), add noise',
        'No TEE vendor has fully patched side-channel risks — defense in depth is mandatory',
        'Motivates hybrid model: TEE for computation speed + ZKP for cryptographic proof of correctness',
      ],
      connections:
        'TEE.Fail is the direct motivation for the TEE-agnostic design in your thesis. ' +
        'Because every TEE has hardware-level side-channel risks, your system cannot rely ' +
        'on TEE security alone. ZKP (specifically Groth16 on Sui) provides a cryptographic ' +
        'guarantee that is side-channel-immune by construction — the proof is valid regardless ' +
        'of what an attacker observes about the prover. The hybrid model (TEE for fast ' +
        'computation + ZKP for on-chain proof) directly addresses TEE.Fail: even if the TEE ' +
        'is compromised, the ZKP remains valid. This is cited in your threat model chapter.',
      thesisExample:
        'In your thesis threat model (Chapter 4), TEE.Fail justifies the split architecture. ' +
        'The TEE handles fast computation (generating witness data for ZKP, processing ' +
        'credential attributes). The Groth16 proof submitted to Sui is independently ' +
        'verifiable — a compromised TEE can lie about computation, but cannot forge a ' +
        'valid ZKP without knowing the witness. This two-layer defense means an attacker ' +
        'must break BOTH the TEE isolation AND the ZKP soundness simultaneously.',
      keyTakeaway:
        'Every TEE can be broken with $1000 hardware and time. Design your system so a ' +
        'compromised TEE cannot forge proofs — ZKP is the cryptographic backstop.',
    },

    /* ───────── 2. WireTap: SGX DCAP Key Extraction ───────── */
    {
      name: 'WireTap: SGX DCAP Key Extraction',
      authors: 'Murdock et al.',
      venue: 'ACM CCS 2025',
      status: 'queued',
      relevance: 'core',
      analogy:
        'Imagine a bank that authenticates couriers by checking a tamper-proof seal on their ' +
        'ID badge. The seal is cryptographically signed by the bank headquarters (Intel). ' +
        'WireTap shows that an attacker with a $800 circuit board can physically intercept the ' +
        'badge manufacturing process and copy the master signing key. Now the attacker can ' +
        'print unlimited fake IDs that pass every checkpoint. Every SGX enclave that uses ' +
        'DCAP attestation to prove "this is genuine Intel hardware" can be faked after WireTap.',
      diagram:
        '┌─────────────────────────────────────────────────────┐\n' +
        '│         WireTap: DDR4 Bus Interposer Attack         │\n' +
        '├─────────────────────────────────────────────────────┤\n' +
        '│                                                     │\n' +
        '│  Target: SGX DCAP Provisioning Certificate Key      │\n' +
        '│                                                     │\n' +
        '│  Normal attestation flow:                           │\n' +
        '│  Enclave → [DCAP quote] → Intel PCK cert → Verify   │\n' +
        '│                                                     │\n' +
        '│  WireTap attack flow:                               │\n' +
        '│                                                     │\n' +
        '│  ┌─────────────────────────────────────┐            │\n' +
        '│  │  CPU ←→ DDR4 DIMM memory bus        │            │\n' +
        '│  │          ↑                           │            │\n' +
        '│  │   DDR4 interposer ($800)             │            │\n' +
        '│  │   Captures provisioning traffic      │            │\n' +
        '│  └─────────────────────────────────────┘            │\n' +
        '│                                                     │\n' +
        '│  Duration: < 45 minutes                             │\n' +
        '│  Cost: < $1000 total hardware                       │\n' +
        '│  Result: ECDSA signing key extracted                │\n' +
        '│                                                     │\n' +
        '│  Consequence: Attacker can forge SGX quotes         │\n' +
        '│  → Any DCAP-based attestation is forgeable          │\n' +
        '│                                                     │\n' +
        '│  Real-world impact:                                 │\n' +
        '│  • Phala Network: abandoned SGX, migrated to TDX   │\n' +
        '│  • Secret Network: emergency key rotation           │\n' +
        '│  • SGX on DDR4: fundamentally broken               │\n' +
        '└─────────────────────────────────────────────────────┘',
      keyPoints: [
        'Physical DDR4 interposer captures provisioning traffic during SGX key provisioning',
        'ECDSA signing key extracted in under 45 minutes with under $1000 hardware',
        'Any DCAP-based SGX attestation quote can be forged with the extracted key',
        'Phala Network immediately abandoned SGX and migrated entire infrastructure to TDX',
        'SGX on DDR4 memory is fundamentally broken — DDR5 not yet demonstrated vulnerable',
        'Root cause: provisioning key flows through the physical memory bus in cleartext',
        'Fix requires hardware redesign: moving key provisioning off the DDR4 bus path',
        'DCAP attestation-based systems (iExec, Secret, Crust) all affected',
      ],
      connections:
        'WireTap is the reason your thesis explicitly rules out SGX as the TEE backend. ' +
        'The TEE-agnostic design directly responds to WireTap: by designing the system to ' +
        'work with TDX (DDR5, hardened provisioning path) or ARM CCA, you avoid the ' +
        'DDR4 bus vulnerability. The attestation verification in your Sui smart contract ' +
        'must be vendor-agnostic precisely because individual TEE attestation schemes can ' +
        'be broken — WireTap proves this for SGX DCAP. Your hybrid ZKP layer provides ' +
        'attestation-independent correctness guarantees.',
      thesisExample:
        'In your thesis architecture section, WireTap justifies why attestation alone is ' +
        'insufficient as a trust mechanism. A Sui smart contract that accepts raw TEE ' +
        'attestation quotes (DCAP format) would be exploitable if the signing key is ' +
        'compromised. Your design instead uses ZKP as the primary on-chain trust mechanism: ' +
        'the TEE generates a Groth16 witness, which the Sui contract verifies mathematically. ' +
        'Even if an attacker forges a DCAP quote, they cannot forge a Groth16 proof without ' +
        'knowing the ZKP witness — the circuits remain sound under SGX attestation failure.',
      keyTakeaway:
        'SGX DCAP attestation is broken on DDR4 hardware. Never build a system where ' +
        'security depends solely on TEE attestation validity — ZKP provides the ' +
        'cryptographic layer that survives attestation compromise.',
    },

    /* ───────── 3. TDXdown ───────── */
    {
      name: 'TDXdown',
      authors: 'Wilke et al.',
      venue: 'ACM CCS 2024',
      status: 'skimmed',
      relevance: 'related',
      analogy:
        'Intel designed TDX with a countermeasure against single-stepping attacks: if an ' +
        'attacker slows the clock to execute one instruction at a time (to spy on state), ' +
        'TDX should detect this and abort. TDXdown is like finding that the alarm on the ' +
        'time-lock safe triggers only when the clock is slowed past a specific threshold — ' +
        'if you slow it to just above that threshold, you can single-step through the ' +
        'critical region without triggering the alarm. A design flaw in the countermeasure ' +
        'itself becomes the attack surface.',
      diagram:
        '┌─────────────────────────────────────────────────────┐\n' +
        '│        TDXdown: Single-Stepping Attack              │\n' +
        '├─────────────────────────────────────────────────────┤\n' +
        '│                                                     │\n' +
        '│  Threat: Single-stepping attack                     │\n' +
        '│  Attacker controls: performance counter interrupts  │\n' +
        '│  Goal: execute one instruction at a time inside TD  │\n' +
        '│                                                     │\n' +
        '│  Intel TDX countermeasure (intended):               │\n' +
        '│  If step_count < threshold → abort TD              │\n' +
        '│                                                     │\n' +
        '│  TDXdown exploit:                                   │\n' +
        '│  ┌─────────────────────────────────────┐            │\n' +
        '│  │  Tuned PMI (Perf Monitor Interrupt) │            │\n' +
        '│  │  fires at exactly N steps, where    │            │\n' +
        '│  │  N is just above Intel\'s threshold  │            │\n' +
        '│  │  → Countermeasure never triggers    │            │\n' +
        '│  │  → Attacker observes per-instruction│            │\n' +
        '│  │    TD state (registers, flags)      │            │\n' +
        '│  └─────────────────────────────────────┘            │\n' +
        '│                                                     │\n' +
        '│  Key insight: The countermeasure itself has a       │\n' +
        '│  tunable boundary that the attacker can sit below   │\n' +
        '│                                                     │\n' +
        '│  Impact: Enables fine-grained control-flow leakage  │\n' +
        '│  and data-dependent branch observation in TDX       │\n' +
        '└─────────────────────────────────────────────────────┘',
      keyPoints: [
        'Single-stepping attacks let an attacker observe per-instruction CPU state inside a TD',
        'Intel added a countermeasure to TDX: detect abnormally small step counts and abort',
        'TDXdown bypasses this countermeasure by tuning PMI frequency to just above the threshold',
        'Result: attacker can observe fine-grained control flow and data-dependent branches',
        'This is a design flaw in the countermeasure logic, not just an implementation bug',
        'Applicable to any TDX workload processing secret data (cryptographic operations)',
        'Patch requires TDX Module firmware update + microcode changes',
        'Demonstrates that even well-designed countermeasures can have off-by-one failure modes',
      ],
      connections:
        'TDXdown is relevant for your thesis threat model when modeling attacker capabilities ' +
        'against TDX (one of the supported backends). The attack requires privileged host ' +
        'access (the attacker controls the VMM/hypervisor). For your thesis, this means the ' +
        'threat model must specify that the cloud provider (infrastructure layer) is partially ' +
        'trusted — a fully malicious cloud provider can execute TDXdown-style attacks. This ' +
        'reinforces why cryptographic proofs (ZKP) are needed: even if a TDX workload is ' +
        'single-stepped, the ZKP output remains verifiably correct on-chain.',
      thesisExample:
        'In your thesis, TDXdown is categorized as an infrastructure-level threat (attacker ' +
        'is the cloud provider) rather than a remote attacker threat. Your system design ' +
        'acknowledges this in the threat model: for credential issuance, you assume a ' +
        'semi-honest cloud provider. The ZKP layer (Groth16 on Sui) mitigates this: even ' +
        'if the TEE computation is observed step by step, the verifier only accepts a ' +
        'mathematically valid proof. TDXdown can leak the witness but cannot manufacture ' +
        'a valid Groth16 proof without solving the discrete log problem.',
      keyTakeaway:
        'Countermeasures themselves can have design flaws. TDX single-stepping attacks ' +
        'work against a privileged attacker. Assume the TEE can be observed and design ' +
        'the cryptographic layer to be sound even under observation.',
    },

    /* ───────── 4. Intel TDX Architecture ───────── */
    {
      name: 'Intel TDX Architecture',
      authors: 'Intel Corporation',
      venue: 'Whitepaper (Intel.com)',
      status: 'queued',
      relevance: 'related',
      analogy:
        'Standard virtualization is like renting a room in a hotel: the hotel owner ' +
        '(hypervisor) has a master key to every room. TDX is like upgrading to a room ' +
        'with a hardware-enforced lock that the hotel owner cannot open — their master ' +
        'key physically does not work on TDX rooms. The hotel can still cut off your ' +
        'electricity (DoS), but cannot read your documents (confidentiality). The room ' +
        'also comes with a receipt stamp that proves, to anyone in the world, exactly ' +
        'which hotel room you checked into and when (remote attestation).',
      diagram:
        '┌─────────────────────────────────────────────────────┐\n' +
        '│         Intel TDX Trust Model                       │\n' +
        '├─────────────────────────────────────────────────────┤\n' +
        '│                                                     │\n' +
        '│  Trusted Computing Base (TCB):                      │\n' +
        '│  ┌───────────────────────────────────┐              │\n' +
        '│  │  CPU + TDX Module (SEAM firmware) │ ← Trusted   │\n' +
        '│  └───────────────────────────────────┘              │\n' +
        '│                                                     │\n' +
        '│  Untrusted:                                         │\n' +
        '│  ┌───────────┐ ┌──────────┐ ┌─────────┐            │\n' +
        '│  │ VMM/Host  │ │ BIOS/EFI │ │  Other  │            │\n' +
        '│  │ OS        │ │          │ │  VMs    │            │\n' +
        '│  └───────────┘ └──────────┘ └─────────┘            │\n' +
        '│                                                     │\n' +
        '│  Trust Domain (TD) measurements:                   │\n' +
        '│  MRTD   = SHA-384 of initial TD image              │\n' +
        '│  RTMR0  = firmware measurements (boot chain)       │\n' +
        '│  RTMR1  = OS measurements                          │\n' +
        '│  RTMR2  = app measurements                         │\n' +
        '│  RTMR3  = user-defined (custom claims)             │\n' +
        '│                                                     │\n' +
        '│  Attestation flow:                                  │\n' +
        '│  TD                                                 │\n' +
        '│  ├── TDCALL[TDG.MR.REPORT] → TDREPORT (local)     │\n' +
        '│  │     contains: MRTD, RTMRs, TD info, MAC        │\n' +
        '│  └── SGX QE converts → Quote (remote)             │\n' +
        '│        verified by Intel Trust Authority (ITA)     │\n' +
        '└─────────────────────────────────────────────────────┘',
      keyPoints: [
        'TDX creates hardware-isolated Trust Domains (VMs) where even the hypervisor is untrusted',
        'SEAM mode: TDX Module firmware runs in a new CPU privilege level, managing TD lifecycle',
        'Memory encryption: AES-256 via Multi-Key Total Memory Encryption (MKTME)',
        'Measurements: MRTD (initial image hash) + 4 RTMR runtime registers for extensible measurement',
        'Attestation: TDCALL generates TDREPORT → SGX Quoting Enclave wraps into remotely verifiable Quote',
        'Intel Trust Authority (ITA): SaaS attestation verification service with JWT responses',
        'Integrity: SEPT (Secure EPT) prevents hypervisor from remapping TD memory pages',
        'Availability on: 4th Gen Xeon (Sapphire Rapids) and newer, DDR5 platforms',
      ],
      connections:
        'Intel TDX is the primary TEE backend for your thesis design. The attestation flow ' +
        '(TDCALL → TDREPORT → Quote → ITA verification) is what your system uses to establish ' +
        'that computation ran in a genuine TDX environment. The MRTD + RTMR measurement scheme ' +
        'maps to your enclave measurement commitment: the Sui smart contract verifies that the ' +
        'attestation Quote matches an expected measurement hash before accepting the ZKP witness. ' +
        'The TEE-agnostic design means you can swap TDX for AMD SEV-SNP or ARM CCA by changing ' +
        'only the attestation verification module.',
      thesisExample:
        'In your thesis implementation chapter, TDX is the reference TEE for the credential ' +
        'issuance service. When a user requests a BBS+ credential, the issuance computation ' +
        'runs inside a TDX Trust Domain. The TD generates a Groth16 witness (attribute set + ' +
        'blinding factors), outputs a proof, and calls TDCALL[TDG.MR.REPORT] to create a ' +
        'TDREPORT. This report, converted to a Quote and verified by ITA, confirms to the ' +
        'Sui contract that the specific issuance binary (MRTD hash) ran without hypervisor ' +
        'interference. RTMR2 records the application binary hash; the contract checks it ' +
        'matches the expected issuer code before processing the credential.',
      keyTakeaway:
        'TDX is your primary TEE reference architecture. Understand MRTD/RTMR measurements ' +
        'and the TDCALL → Quote → ITA attestation pipeline — these map directly to your ' +
        'on-chain verification design.',
    },

    /* ───────── 5. ARM CCA ───────── */
    {
      name: 'ARM CCA (Confidential Compute Architecture)',
      authors: 'ARM Limited',
      venue: 'Architecture Specification (developer.arm.com)',
      status: 'queued',
      relevance: 'context',
      analogy:
        'TrustZone (the old ARM security system) divided the chip into two rooms: Normal ' +
        'and Secure. Only one secure room existed per chip, and whoever controlled it ' +
        'controlled security for the entire device. ARM CCA adds a third and fourth room: ' +
        'Root (for firmware) and Realm (for confidential VMs). Realm rooms are managed by ' +
        'the Realm Management Monitor (RMM), not the Normal World hypervisor. Each Realm ' +
        'is like a safety deposit box: the bank (hypervisor) can move the box around the ' +
        'vault but cannot open it.',
      diagram:
        '┌─────────────────────────────────────────────────────┐\n' +
        '│         ARM CCA: Four-World Architecture            │\n' +
        '├─────────────────────────────────────────────────────┤\n' +
        '│                                                     │\n' +
        '│  ┌─────────────┐  ┌───────────────────────────┐    │\n' +
        '│  │ Root World  │  │ Realm World               │    │\n' +
        '│  │ (EL3 FW)    │  │ ┌─────┐ ┌─────┐ ┌─────┐  │    │\n' +
        '│  │             │  │ │ VM1 │ │ VM2 │ │ VM3 │  │    │\n' +
        '│  │ Manages:    │  │ │     │ │     │ │     │  │    │\n' +
        '│  │ • Boot chain│  │ └─────┘ └─────┘ └─────┘  │    │\n' +
        '│  │ • HES RoT   │  │ Managed by RMM (EL2)     │    │\n' +
        '│  └─────────────┘  └───────────────────────────┘    │\n' +
        '│                                                     │\n' +
        '│  ┌─────────────┐  ┌───────────────────────────┐    │\n' +
        '│  │ Secure World│  │ Normal World              │    │\n' +
        '│  │ (TrustZone) │  │ (Rich OS + Apps)          │    │\n' +
        '│  │ OP-TEE etc  │  │ Hypervisor (untrusted      │    │\n' +
        '│  │             │  │ to Realms)                │    │\n' +
        '│  └─────────────┘  └───────────────────────────┘    │\n' +
        '│                                                     │\n' +
        '│  Attestation:                                       │\n' +
        '│  Realm → RSI_ATTEST_TOKEN_INIT                     │\n' +
        '│  RMM  → Realm Attestation Token (CBOR/COSE)        │\n' +
        '│  HES  → CCA Platform Token (platform measurements) │\n' +
        '│  Verified via IETF RATS CCA profile                │\n' +
        '└─────────────────────────────────────────────────────┘',
      keyPoints: [
        'Four hardware worlds: Normal, Secure, Root, Realm — each enforced by NS/NSE bits',
        'Realm Management Extension (RME): hardware support for Realm world isolation',
        'RMM (Realm Management Monitor): manages Realm VMs at EL2 in Realm world',
        'Memory Encryption Contexts (MEC): per-Realm AES encryption keys',
        'Attestation: RSI_ATTEST_TOKEN_INIT generates CCA token (Realm + Platform measurements)',
        'Token format: CBOR-encoded, COSE-signed, following IETF RATS CCA profile',
        'Availability: ARMv9-A (Neoverse V-series), not yet widely in production clouds',
        'Key advantage over TrustZone: multiple isolated confidential VMs, not just one secure world',
      ],
      connections:
        'ARM CCA is relevant as an alternative TEE backend for mobile and edge scenarios. ' +
        'Your thesis covers ARM CCA in the related work section as the future of ' +
        'mobile TEE computing. The IETF RATS attestation format used by CCA is more ' +
        'standardized than Intel TDX\'s format, and could simplify the attestation ' +
        'verification module in your Sui smart contract. If your system is deployed on ' +
        'ARM-based cloud infrastructure (AWS Graviton with future CCA support), the ' +
        'TEE-agnostic architecture handles it without redesign.',
      thesisExample:
        'In your thesis, ARM CCA appears in the TEE landscape section (Chapter 2.3) as ' +
        'the future alternative to TDX for non-Intel hardware. For the thesis prototype, ' +
        'CCA is not the primary backend (limited cloud availability as of 2026), but ' +
        'the TEE-agnostic attestation interface you design — a generic verify_attestation ' +
        '(quote: Bytes, expected_measurement: Hash) → bool function — works with CCA ' +
        'tokens by swapping the verification logic without changing the Sui contract interface.',
      keyTakeaway:
        'ARM CCA is the future of mobile and edge confidential computing. Know its ' +
        'four-world model and IETF RATS attestation format — your TEE-agnostic design ' +
        'should accommodate it without architectural changes.',
    },

    /* ───────── 6. Trusted Compute Units (TCU) ───────── */
    {
      name: 'Trusted Compute Units (TCU)',
      authors: 'Castillo et al.',
      venue: '2025',
      status: 'queued',
      relevance: 'core',
      analogy:
        'In electronics, a circuit breaker combines two functions: fast protection (the ' +
        'thermal element reacts instantly) and verifiable protection (the mechanical ' +
        'state can be inspected). TCU applies this to computation: a TEE provides the ' +
        'fast, efficient execution (no proof overhead) while a zkVM provides the ' +
        'verifiable record of what happened (a proof that the computation was correct). ' +
        'Together they form a Trusted Compute Unit: fast AND provable, where neither ' +
        'component alone is sufficient.',
      diagram:
        '┌─────────────────────────────────────────────────────┐\n' +
        '│     Trusted Compute Unit (TCU) Architecture         │\n' +
        '├─────────────────────────────────────────────────────┤\n' +
        '│                                                     │\n' +
        '│  Input data                                         │\n' +
        '│       │                                             │\n' +
        '│       ▼                                             │\n' +
        '│  ┌────────────────────────────────────┐             │\n' +
        '│  │              TEE                   │             │\n' +
        '│  │   Fast off-chain computation       │             │\n' +
        '│  │   (native speed, no proof cost)    │             │\n' +
        '│  │                                    │             │\n' +
        '│  │   Produces:                        │             │\n' +
        '│  │   • Computation output             │             │\n' +
        '│  │   • Execution trace / witness      │             │\n' +
        '│  └──────────────┬─────────────────────┘             │\n' +
        '│                 │ witness                           │\n' +
        '│                 ▼                                   │\n' +
        '│  ┌────────────────────────────────────┐             │\n' +
        '│  │              zkVM                  │             │\n' +
        '│  │   Proof generation                 │             │\n' +
        '│  │   (verifiable, trustless)          │             │\n' +
        '│  │                                    │             │\n' +
        '│  │   Produces:                        │             │\n' +
        '│  │   • ZK proof π                     │             │\n' +
        '│  └──────────────┬─────────────────────┘             │\n' +
        '│                 │ proof                             │\n' +
        '│                 ▼                                   │\n' +
        '│  ┌────────────────────────────────────┐             │\n' +
        '│  │       On-chain verifier            │             │\n' +
        '│  │   Verify π in O(1) — cheap         │             │\n' +
        '│  │   Trust: math only, not hardware   │             │\n' +
        '│  └────────────────────────────────────┘             │\n' +
        '└─────────────────────────────────────────────────────┘',
      keyPoints: [
        'TCU = TEE for fast off-chain computation + zkVM for verifiable on-chain proof',
        'TEE provides efficiency (native speed), zkVM provides soundness (mathematical proof)',
        'Witness generated inside TEE is fed to zkVM proof generation — no trusted setup needed for the witness',
        'On-chain verifier checks only the ZK proof — does not trust the TEE attestation directly',
        'Compositional trust: both hardware (TEE) and cryptographic (ZKP) properties are active simultaneously',
        'Addresses the core tension in blockchain: computation is expensive on-chain, but verification must be cheap',
        'Closest existing architecture to your thesis design: directly applicable pattern',
        'Differs from pure zkVM (no TEE speed) and pure TEE (no ZKP trustlessness)',
      ],
      connections:
        'TCU is the most directly relevant paper to your thesis architecture. Your design ' +
        'IS a TCU: the credential issuance service runs in a TDX Trust Domain (TEE component) ' +
        'generating BBS+ signatures and computing ZKP witnesses. The Groth16 circuit running ' +
        'on Sui (zkVM-equivalent) generates a proof that any Sui validator can verify in ' +
        'O(1) time. Castillo et al. formalize exactly this composition pattern, giving you ' +
        'formal definitions and security proofs to cite in your background chapter. ' +
        'Reference their security model for composing TEE-level and ZKP-level guarantees.',
      thesisExample:
        'Your thesis is an instance of the TCU framework applied to anonymous credentials ' +
        'and private payments. Concretely: the TEE component runs the credential issuance ' +
        'logic (BBS+ signing, attribute verification against KYC data), produces the ZKP ' +
        'witness (committed attributes, blinding factors), and passes it to the zkVM ' +
        'component (Groth16 circuit). The on-chain Sui contract verifies the Groth16 proof ' +
        'without trusting the TEE. This mirrors TCU\'s formal model exactly. Your Chapter 3 ' +
        '(System Architecture) can directly use TCU\'s composition theorem as the ' +
        'theoretical foundation.',
      keyTakeaway:
        'TCU is your theoretical foundation. Your thesis is an instance of TCU applied to ' +
        'anonymous credentials. Read this paper carefully — it gives you formal definitions, ' +
        'security proofs, and vocabulary for the architecture chapter.',
    },

    /* ───────── 7. TeeRollup ───────── */
    {
      name: 'TeeRollup',
      authors: 'Wen et al.',
      venue: '2024',
      status: 'queued',
      relevance: 'related',
      analogy:
        'A rollup normally relies on a single TEE operator to batch transactions. If that ' +
        'TEE is compromised, all transactions are invalid. TeeRollup is like replacing one ' +
        'accountant with a committee of accountants where at least some of them must be ' +
        'honest — if one accountant is bribed, the others catch the error. The heterogeneous ' +
        'TEE design uses different hardware vendors (Intel + AMD + ARM) so that compromising ' +
        'one vendor does not compromise the system: an attacker would need to simultaneously ' +
        'exploit TDX, SEV-SNP, and CCA hardware vulnerabilities.',
      diagram:
        '┌─────────────────────────────────────────────────────┐\n' +
        '│        TeeRollup: Heterogeneous TEE Design          │\n' +
        '├─────────────────────────────────────────────────────┤\n' +
        '│                                                     │\n' +
        '│  Traditional TEE Rollup:                           │\n' +
        '│  Transactions → [Single TEE operator] → Batch      │\n' +
        '│                  ↑ single point of failure         │\n' +
        '│                                                     │\n' +
        '│  TeeRollup — Heterogeneous TEE Committee:          │\n' +
        '│                                                     │\n' +
        '│  Transactions                                       │\n' +
        '│       │                                             │\n' +
        '│       ├──→ [Intel TDX node]  ──→ Vote              │\n' +
        '│       ├──→ [AMD SEV-SNP node] ──→ Vote             │\n' +
        '│       └──→ [ARM CCA node]    ──→ Vote             │\n' +
        '│                                  │                 │\n' +
        '│                                  ▼                 │\n' +
        '│                          Threshold consensus       │\n' +
        '│                          (t-of-n agreement)        │\n' +
        '│                                  │                 │\n' +
        '│                                  ▼                 │\n' +
        '│                          Valid batch committed      │\n' +
        '│                          on-chain                  │\n' +
        '│                                                     │\n' +
        '│  Security: attacker must compromise t distinct     │\n' +
        '│  TEE hardware platforms simultaneously             │\n' +
        '└─────────────────────────────────────────────────────┘',
      keyPoints: [
        'Heterogeneous TEE rollup: multiple TEE vendors in threshold committee prevents single-vendor capture',
        'Threat model: assumes any individual TEE can be compromised, system remains safe if t nodes are honest',
        'Addresses the real-world concern that WireTap and TEE.Fail show: individual TEEs can be broken',
        'Threshold signature scheme across heterogeneous TEEs provides distributed trust assumption',
        'Trade-off: higher coordination overhead than single-TEE rollup, but significantly stronger security',
        'TEE compromise is a software rollback attack scenario: TeeRollup\'s threat model is your threat model',
        'Relevant for your credential issuance service: could run on heterogeneous TEE committee',
      ],
      connections:
        'TeeRollup addresses the TEE compromise scenario that your thesis threat model must ' +
        'handle. For the credential issuance service, a single compromised TEE could issue ' +
        'fraudulent credentials. TeeRollup\'s heterogeneous committee model is a defense: ' +
        'require t-of-n TEE operators across different hardware vendors to co-sign credential ' +
        'issuance. This is an extension beyond your thesis scope but is the natural next step. ' +
        'Reference TeeRollup in your future work section: "Extending to a heterogeneous TEE ' +
        'committee for distributed trust would follow the TeeRollup architecture."',
      thesisExample:
        'In your thesis threat model, a compromised TEE operator is addressed by the ZKP ' +
        'layer: a compromised TEE cannot forge a valid Groth16 proof. But a compromised ' +
        'TEE that co-operates with a malicious issuer could issue fraudulent credentials ' +
        'with valid proofs. TeeRollup\'s answer is to require multiple independent TEE ' +
        'operators to agree. Your current design uses a single TEE issuer for simplicity; ' +
        'the future work section cites TeeRollup as the path to decentralizing the issuance ' +
        'trust. The ZKP layer remains the primary defense in the current design.',
      keyTakeaway:
        'Heterogeneous TEE committees eliminate single-vendor trust. Reference in your ' +
        'threat model and future work sections. The ZKP layer in your current design ' +
        'is the immediate defense; TeeRollup is the long-term answer.',
    },

    /* ───────── 8. ZLiTE ───────── */
    {
      name: 'ZLiTE: Lightweight TEE for Zcash',
      authors: 'Matetic et al. (ETH Zurich)',
      venue: '2019',
      status: 'queued',
      relevance: 'related',
      analogy:
        'A Zcash light client normally has to trust the full node it connects to — the ' +
        'light client cannot verify shielded transactions itself. ZLiTE puts the Zcash ' +
        'full node logic inside an SGX enclave: the light client connects to the enclave ' +
        'and gets a TEE-attested response. It is like using an ATM machine where you can ' +
        'cryptographically prove the ATM is running the bank\'s genuine software, not a ' +
        'skimmer. The SGX attestation is the proof that the full node is honest.',
      diagram:
        '┌─────────────────────────────────────────────────────┐\n' +
        '│         ZLiTE: TEE-backed Light Client              │\n' +
        '├─────────────────────────────────────────────────────┤\n' +
        '│                                                     │\n' +
        '│  Traditional light client problem:                  │\n' +
        '│  Light client → Full node (trusted? who knows?)     │\n' +
        '│                                                     │\n' +
        '│  ZLiTE solution:                                    │\n' +
        '│                                                     │\n' +
        '│  Light client                                       │\n' +
        '│      │ request + TLS                                │\n' +
        '│      ▼                                             │\n' +
        '│  ┌─────────────────────────────┐                   │\n' +
        '│  │  SGX Enclave (ZLiTE server) │                   │\n' +
        '│  │  • Zcash full node logic    │                   │\n' +
        '│  │  • Processes shielded TXs   │                   │\n' +
        '│  │  • Private key ops inside   │                   │\n' +
        '│  │  • SGX attestation proof    │                   │\n' +
        '│  └──────────────┬──────────────┘                   │\n' +
        '│                 │ attested response                │\n' +
        '│                 ▼                                  │\n' +
        '│  Light client verifies SGX attestation             │\n' +
        '│  → trusts response is from genuine Zcash code      │\n' +
        '│                                                     │\n' +
        '│  Privacy model:                                     │\n' +
        '│  Zcash ZKP (Groth16) → hides amounts/identity      │\n' +
        '│  TEE (SGX) → protects key material during ops      │\n' +
        '└─────────────────────────────────────────────────────┘',
      keyPoints: [
        'Combines TEE (SGX) with Zcash ZKP-based privacy: TEE protects key material, ZKP hides tx details',
        'Enables trustless light clients: SGX attestation proves server runs genuine Zcash code',
        'Historical: predates WireTap (2019 vs 2025) — SGX was still viable at publication time',
        'Shows the TEE + ZKP combination is not new: this pattern was first applied to privacy coins',
        'Privacy is layered: ZKP provides on-chain privacy, TEE provides off-chain operational security',
        'Demonstrates that TEE attestation can serve as a trust anchor for privacy system components',
        'Limitation: SGX is now broken (WireTap 2025) — ZLiTE\'s SGX layer would need updating to TDX',
      ],
      connections:
        'ZLiTE is the earliest example of combining TEE + ZKP-based privacy in a blockchain ' +
        'system. Your thesis follows the same architectural logic: TEE handles off-chain ' +
        'computation and key protection, ZKP provides cryptographic privacy guarantees on-chain. ' +
        'ZLiTE uses Zcash\'s existing Groth16 proofs; your system uses Groth16 circuits custom-built ' +
        'for BBS+ credentials and confidential payments on Sui. Reference ZLiTE in your related ' +
        'work as the 2019 precursor to your design — your contribution is applying this pattern ' +
        'to a programmable L1 (Sui) with anonymous credentials.',
      thesisExample:
        'In your thesis related work chapter, ZLiTE establishes the TEE + ZKP privacy pattern ' +
        'in 2019. The key comparison: ZLiTE uses TEE to protect existing Zcash ZKP infrastructure, ' +
        'while your thesis designs a NEW ZKP circuit (BBS+ credential verification) that is ' +
        'TEE-assisted. ZLiTE shows that TEE attestation serves as an off-chain trust anchor; ' +
        'your design goes further by making the ZKP the primary on-chain trust mechanism and ' +
        'the TEE a performance optimization — the ZKP remains valid even if the TEE is compromised.',
      keyTakeaway:
        'ZLiTE is the 2019 precursor to your TEE + ZKP architecture, applied to Zcash. ' +
        'Cite it in related work: your contribution is generalizing this pattern to ' +
        'anonymous credentials on a programmable L1.',
    },

    /* ───────── 9. TEE + zkTLS for Lightning Network ───────── */
    {
      name: 'TEE + zkTLS for Lightning Network (Hot/Cold Proofs)',
      authors: 'Singh et al.',
      venue: '2025',
      status: 'queued',
      relevance: 'related',
      analogy:
        'Think of two types of cash machines: a hot cash machine (ATM) that gives you ' +
        'money instantly with a hardware security guarantee, and a cold cash machine ' +
        '(a bank teller) that requires filling out forms and waiting, but gives you a ' +
        'fully auditable receipt with no hardware trust required. Hot Proofs (TEE) are ' +
        'the ATM: fast, hardware-dependent, best for frequent small transactions. Cold ' +
        'Proofs (ZKP) are the bank teller: slow, expensive, but cryptographically ' +
        'self-contained — valid without trusting any hardware.',
      diagram:
        '┌─────────────────────────────────────────────────────┐\n' +
        '│      Hot Proofs (TEE) vs Cold Proofs (ZKP)          │\n' +
        '├─────────────────────────────────────────────────────┤\n' +
        '│                                                     │\n' +
        '│  Hot Proofs (TEE-based):                            │\n' +
        '│  ┌────────────────────────────────────┐             │\n' +
        '│  │ Prover (inside TEE)               │             │\n' +
        '│  │  • Generates channel state proof  │             │\n' +
        '│  │  • TEE attestation = trust anchor │             │\n' +
        '│  │  • Fast: <1ms per proof           │             │\n' +
        '│  │  • Cost: hardware trust required  │             │\n' +
        '│  └────────────────────────────────────┘             │\n' +
        '│                      │                              │\n' +
        '│                      ▼ attestation quote            │\n' +
        '│              Verifier (on-chain) accepts            │\n' +
        '│                                                     │\n' +
        '│  Cold Proofs (ZKP-based):                           │\n' +
        '│  ┌────────────────────────────────────┐             │\n' +
        '│  │ Prover (anywhere)                 │             │\n' +
        '│  │  • Generates Groth16/Halo2 proof  │             │\n' +
        '│  │  • No hardware trust needed       │             │\n' +
        '│  │  • Slow: 1-10 seconds             │             │\n' +
        '│  │  • Cost: proving computation      │             │\n' +
        '│  └────────────────────────────────────┘             │\n' +
        '│                      │                              │\n' +
        '│                      ▼ ZK proof                     │\n' +
        '│              Verifier (on-chain) accepts            │\n' +
        '│                                                     │\n' +
        '│  Hybrid: Hot Proof for high-frequency ops          │\n' +
        '│           Cold Proof for settlement / disputes     │\n' +
        '└─────────────────────────────────────────────────────┘',
      keyPoints: [
        'Hot Proofs (TEE): fast, cheap, hardware-dependent trust — ideal for Lightning channel state proofs',
        'Cold Proofs (ZKP): slow, expensive, cryptographic trust — ideal for settlement and dispute resolution',
        'Hybrid model: use Hot Proofs for frequent operations, Cold Proofs for high-value or dispute resolution',
        'zkTLS: TLS session data can be proven to a third party without revealing the raw TLS traffic',
        'Hot/Cold distinction cleanly maps to your thesis: TEE for credential issuance, ZKP for on-chain proof',
        'Lightning Network context: proving channel balance without opening the channel on-chain',
        'Key insight: the two proof types are complementary, not competing — choose based on latency vs trust',
      ],
      connections:
        'The Hot Proof / Cold Proof distinction is directly applicable to your thesis payment tiers. ' +
        'For low-value, high-frequency payments: TEE-generated proofs (Hot Proofs) are acceptable — ' +
        'fast, low-overhead, TEE attestation provides sufficient trust. For high-value, infrequent ' +
        'payments: Groth16 proofs (Cold Proofs) provide cryptographic guarantees that survive TEE ' +
        'compromise. This dual-tier model mirrors your thesis design: a threshold-based system ' +
        'where small payments use faster verification paths and large payments require full ZKP.',
      thesisExample:
        'In your thesis Chapter 4 (Payment Architecture), the Hot/Cold Proof distinction becomes ' +
        'the payment tier model. Payments below the threshold (e.g., <1000 SUI): TEE-signed ' +
        'authorization (Hot Proof) accepted by the contract with attestation verification only. ' +
        'Payments above the threshold: Groth16 credential proof (Cold Proof) required, involving ' +
        'full ZKP verification on-chain. This gives your system a practical performance gradient: ' +
        'everyday microtransactions are fast and cheap, while large transfers maintain ' +
        'cryptographic privacy even if the TEE is compromised.',
      keyTakeaway:
        'Hot Proofs (TEE) for speed, Cold Proofs (ZKP) for trustlessness. Your thesis payment ' +
        'tier model maps exactly to this distinction. Use this framing in Chapter 4.',
    },

    /* ───────── 10. zkFL-Health: ZKP + TEE for Verifiable Privacy ───────── */
    {
      name: 'zkFL-Health: ZKP + TEE for Verifiable Privacy',
      authors: 'Sharma et al.',
      venue: '2025',
      status: 'queued',
      relevance: 'related',
      analogy:
        'Imagine a hospital that needs to train an AI model on patient data without any ' +
        'individual hospital exposing its patients\' records. zkFL-Health is like having ' +
        'each hospital put their data inside a private room (TEE) where only the AI ' +
        'training algorithm can enter. After training, the AI model produces a " report ' +
        'card" (ZK proof) proving it trained on valid data, which the other hospitals can ' +
        'verify. The blockchain keeps a permanent audit trail of every training round. ' +
        'Privacy (TEE), verifiability (ZKP), and auditability (blockchain) all in one.',
      diagram:
        '┌─────────────────────────────────────────────────────┐\n' +
        '│      zkFL-Health: ZKP + TEE Architecture            │\n' +
        '├─────────────────────────────────────────────────────┤\n' +
        '│                                                     │\n' +
        '│  Hospital 1          Hospital 2         Hospital N  │\n' +
        '│  ┌─────────┐        ┌─────────┐        ┌─────────┐ │\n' +
        '│  │  TEE    │        │  TEE    │        │  TEE    │ │\n' +
        '│  │ Private │        │ Private │        │ Private │ │\n' +
        '│  │ data    │        │ data    │        │ data    │ │\n' +
        '│  │ inside  │        │ inside  │        │ inside  │ │\n' +
        '│  └────┬────┘        └────┬────┘        └────┬────┘ │\n' +
        '│       │ local           │ local            │ local  │\n' +
        '│       │ gradient        │ gradient         │ grad.  │\n' +
        '│       └──────────┬──────┘                  │       │\n' +
        '│                  │ aggregation             │       │\n' +
        '│                  ▼                         │       │\n' +
        '│          ┌───────────────┐                 │       │\n' +
        '│          │  ZKP (Halo2/  │ ←───────────────┘       │\n' +
        '│          │   Nova)       │                          │\n' +
        '│          │  Proves:      │                          │\n' +
        '│          │  • Gradients  │                          │\n' +
        '│          │    from valid │                          │\n' +
        '│          │    private    │                          │\n' +
        '│          │    data       │                          │\n' +
        '│          └──────┬────────┘                          │\n' +
        '│                 │ ZK proof π                        │\n' +
        '│                 ▼                                   │\n' +
        '│          ┌───────────────┐                          │\n' +
        '│          │  Blockchain   │                          │\n' +
        '│          │  Audit Trail  │                          │\n' +
        '│          │  (permanent   │                          │\n' +
        '│          │  record)      │                          │\n' +
        '│          └───────────────┘                          │\n' +
        '└─────────────────────────────────────────────────────┘',
      keyPoints: [
        'TEE (SGX/TDX) protects private data during federated learning computation',
        'Halo2 or Nova ZKP proves gradient computations were performed on valid private data',
        'Blockchain stores audit trail: every training round is permanently recorded with a ZK proof',
        'Split trust: TEE handles data privacy during compute, ZKP ensures verifiable correctness',
        'Similar architecture to your thesis: TEE for computation + ZKP for proof + blockchain for record',
        'Halo2 used for efficient recursive proofs (Nova for aggregation across hospitals)',
        'Compliance angle: blockchain audit trail enables regulatory inspection without raw data exposure',
        'Demonstrates the TEE + ZKP + blockchain triad works at scale in a real healthcare domain',
      ],
      connections:
        'zkFL-Health is architecturally closest to your thesis: TEE for private computation + ' +
        'ZKP (Halo2/Nova vs your Groth16) for verifiable correctness + blockchain (Ethereum/Sui) ' +
        'for immutable audit trail. The key difference is domain: federated learning vs ' +
        'anonymous credentials and private payments. The compliance angle (regulatory audit ' +
        'without raw data exposure) directly mirrors your ElGamal auditor key pattern. ' +
        'Reference zkFL-Health in your related work to demonstrate your architectural pattern ' +
        'is emerging across multiple domains.',
      thesisExample:
        'In your thesis related work (Chapter 2.3/2.4 boundary), zkFL-Health shows the same ' +
        'TEE + ZKP + blockchain triad applied to healthcare ML. The mapping is direct: ' +
        'private patient data → private credential attributes; federated gradient → credential ' +
        'issuance computation; Halo2 aggregation proof → Groth16 spend proof; blockchain audit ' +
        'trail → Sui on-chain nullifier set. Your thesis\' contribution is (1) applying this ' +
        'to identity and payments, not ML, and (2) adding the anonymous credential layer ' +
        '(BBS+ selective disclosure) which zkFL-Health does not address.',
      keyTakeaway:
        'zkFL-Health validates the TEE + ZKP + blockchain triad in healthcare. Your thesis ' +
        'applies the same triad to identity. Use this as a related work citation to show ' +
        'the pattern is domain-general.',
    },
  ],
};
