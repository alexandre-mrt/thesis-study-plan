/**
 * Ch 2.3 SOTA — TEE & Remote Attestation (2024-2026)
 * Focus: production TEE deployments, attestation standards, side-channel CVEs,
 * Mysten Seal, confidential GPU, ARM CCA, migration from SGX to TDX.
 *
 * Schema: items[] with { name, authors, venue, year, link,
 *   recap_short, recap_long, math_highlight, why_for_thesis, tags }.
 *
 * Paired with ch23-papers-guide.js (window.CH23_PAPERS) for the
 * academic paper recap cards. This file carries SOTA industry + CVE
 * references that change faster than the paper corpus.
 */

window.SOTA_CH23 = {
  items: [
    /* ───────── 1. Intel TDX 1.5 Architecture ───────── */
    {
      name: 'Intel TDX 1.5 Architecture and Module Specification',
      authors: 'Intel Corporation',
      venue: 'Intel Developer Documentation (TDX Module 1.5 Base Architecture)',
      year: 2024,
      link: 'https://www.intel.com/content/www/us/en/developer/articles/technical/intel-trust-domain-extensions.html',
      recap_short:
        'TDX 1.5 is the production baseline on 4th/5th Gen Xeon — SEAM Module, MRTD+RTMR, TDCALL attestation.',
      recap_long:
        'TDX 1.5 is the TDX Module revision shipping on Sapphire Rapids and Emerald Rapids ' +
        '(4th/5th Gen Xeon) and is what Azure, GCP and Alibaba expose as "Confidential VMs". ' +
        'A Trust Domain is a hardware-isolated VM whose memory is encrypted with MKTME-i ' +
        '(integrity + replay protection), managed by the TDX Module running in SEAM root mode. ' +
        'The hypervisor can schedule and IO-service a TD but cannot read or remap its memory. ' +
        'Attestation produces a TDREPORT (MRTD for initial image, RTMR0..3 for extensible ' +
        'measurements) which is wrapped by the SGX Quoting Enclave into a DCAP-format Quote ' +
        'signed by Intel-provisioned ECDSA keys. ' +
        '\n\n' +
        'Key additions vs. TDX 1.0: TD Partitioning (TDP) for L2 guests, service TDs for ' +
        'live migration, Partitioned TDs for nested virtualization, and enlarged RTMR space. ' +
        'Intel Trust Authority (ITA) provides a SaaS verifier returning JWT attestation ' +
        'tokens — the common attestation surface used by cloud confidential-VM products.',
      math_highlight: 'attestation chain: $\\text{MRTD} \\parallel \\text{RTMR}_{0..3} \\xrightarrow{\\text{SGX QE}} \\text{Quote}_{\\text{ECDSA}}$',
      why_for_thesis:
        'TDX 1.5 is the reference TEE for the thesis issuance service. The thesis TEE-agnostic ' +
        'attestation module must parse DCAP Quotes and the newer ITA JWT format. MRTD pinning ' +
        'in the Sui contract is the on-chain anchor that the TEE binary is the approved issuer.',
      tags: ['tdx', 'attestation', 'production', 'intel', 'mrtd', 'rtmr'],
    },

    /* ───────── 2. Azure / GCP / AWS Confidential VM deployments ───────── */
    {
      name: 'Confidential VMs with Intel TDX in Azure, GCP, AWS (2024-2025 production rollout)',
      authors: 'Microsoft Azure, Google Cloud, AWS',
      venue: 'Azure DCesv5/ECesv5 GA (2024); GCP C3 Confidential GA (2024); AWS EC2 M7i/M7a TDX preview (2025)',
      year: 2024,
      link: 'https://learn.microsoft.com/en-us/azure/confidential-computing/tdx-confidential-vm-overview',
      recap_short:
        'TDX went GA on Azure (DCesv5) and GCP (C3 Confidential) during 2024, AWS followed with M7i TDX previews.',
      recap_long:
        'In 2024 Azure launched the DCesv5/ECesv5 VM families — the first GA confidential VMs ' +
        'built on Intel TDX with integrated Microsoft Azure Attestation (MAA) support. GCP ' +
        'shipped C3 Confidential VMs with TDX in the same window, exposing attestation through ' +
        'the Confidential Space service (integrates with Workload Identity Federation). AWS ' +
        'kept Nitro Enclaves as the default TEE but began previewing TDX on M7i during 2025 ' +
        'while continuing to position Nitro as the production path for sensitive workloads. ' +
        '\n\n' +
        'The practical consequence is that TDX attestation is now a three-verifier problem: ' +
        'Intel ITA (raw hardware trust), cloud provider verifier (MAA / Confidential Space), ' +
        'and customer on-chain or off-chain verifier. Each layer adds policy (acceptable MRTD, ' +
        'minimum TCB level, freshness). The TEE-agnostic layer in the thesis has to either ' +
        'consume the cloud-verified JWT or verify the raw Quote directly.',
      math_highlight:
        'verifier composition: $V_{\\text{cloud}}(\\text{Quote}) \\Rightarrow \\text{JWT} \\xrightarrow{V_{\\text{chain}}} \\text{accept}$',
      why_for_thesis:
        'Cloud-provider attestation wrappers change the on-chain verification design. Rather ' +
        'than verify raw TDX Quotes on Sui (expensive), the thesis can accept ITA/MAA JWTs ' +
        'signed by a well-known key, verified with a lighter signature check on-chain.',
      tags: ['tdx', 'azure', 'gcp', 'aws', 'confidential-vm', 'production'],
    },

    /* ───────── 3. NVIDIA H100 Confidential Computing ───────── */
    {
      name: 'NVIDIA H100/H200 Confidential Computing and Remote Attestation',
      authors: 'NVIDIA Corporation',
      venue: 'NVIDIA Hopper Confidential Computing (GA 2024); H200 extension (2024)',
      year: 2024,
      link: 'https://docs.nvidia.com/confidential-computing/index.html',
      recap_short:
        'H100/H200 add HW isolation, encrypted PCIe, and a signed GPU attestation report — the first production confidential GPU.',
      recap_long:
        'Hopper Confidential Computing runs a full H100 or H200 GPU inside an encrypted ' +
        'bounce-buffered PCIe channel paired with a CPU TEE (TDX or SEV-SNP). The GPU firmware ' +
        'produces an attestation report over the driver version, BIOS, CC mode, and a nonce; ' +
        'NVIDIA NRAS (Remote Attestation Service) signs a token after verifying the report ' +
        'against Intel ITA / AMD SEV-SNP attestation for the host CPU. The resulting token ' +
        'is a JWT that binds CPU TEE state to GPU TEE state. ' +
        '\n\n' +
        'This matters for confidential AI: inference on private weights or private inputs ' +
        'now has a hardware-rooted chain of custody covering the CPU, the PCIe link, and the ' +
        'GPU itself. The trust model still assumes NVIDIA-signed firmware; recent side-channel ' +
        'work (e.g., LeftoverLocals, 2024) on GPU memory residency shows that CC alone does ' +
        'not address all microarchitectural leakage classes.',
      math_highlight:
        'bound CPU+GPU attestation: $\\text{Quote}_{\\text{CPU}} \\parallel \\text{Report}_{\\text{GPU}} \\xrightarrow{\\text{NRAS}} \\text{JWT}$',
      why_for_thesis:
        'If the thesis covers ML-based credential verification or risk scoring, confidential ' +
        'GPU is the enabling primitive. The bound attestation pattern (CPU + peripheral) is ' +
        'a useful template for future hardware composed TCBs on Sui.',
      tags: ['gpu', 'h100', 'h200', 'confidential-computing', 'nvidia', 'attestation'],
    },

    /* ───────── 4. AWS Nitro Enclaves + KMS ───────── */
    {
      name: 'AWS Nitro Enclaves and KMS cryptographic attestation',
      authors: 'Amazon Web Services',
      venue: 'AWS Nitro Enclaves developer documentation (updated 2024-2025)',
      year: 2024,
      link: 'https://docs.aws.amazon.com/enclaves/latest/user/nitro-enclave.html',
      recap_short:
        'Nitro Enclaves use the Nitro hypervisor + signed PCR attestation doc, directly consumable by KMS condition keys.',
      recap_long:
        'Nitro Enclaves are purpose-built VM-level TEEs on EC2 instances: no persistent storage, ' +
        'no external network, one vsock channel to the parent. Attestation is a CBOR document ' +
        'signed by the Nitro Hypervisor containing PCR0..PCR8 (image, kernel, app, IAM role, ' +
        'instance ID). AWS KMS has native `kms:RecipientAttestation:...` condition keys that ' +
        'let you gate `Decrypt`/`GenerateDataKey` on a specific PCR0 (enclave image) and ' +
        'PCR2 (application). This is the simplest production TEE-to-cloud-KMS integration. ' +
        '\n\n' +
        'Compared with TDX, the Nitro model is closed (no public microcode, AWS is the root ' +
        'of trust) but extremely simple to deploy: no provisioning service, no PCK caching, ' +
        'no Intel/AMD key management. It is the default TEE for blockchain projects that ' +
        'need fast pilots (Chainlink, Flashbots SUAVE, Fireblocks). No known hardware ' +
        'side-channel CVEs as of 2026 — the attack surface is mostly the app inside.',
      math_highlight:
        'KMS policy: $\\text{Decrypt} \\Leftarrow \\text{PCR0} = h_{\\text{image}} \\wedge \\text{PCR8} = h_{\\text{signer}}$',
      why_for_thesis:
        'Nitro is the fastest path to a working prototype for the thesis issuance service. ' +
        'KMS-gated key release mirrors the "TEE-bound credential issuance key" pattern. The ' +
        'attestation doc format is simple enough to verify in Sui Move with a short COSE parser.',
      tags: ['nitro-enclaves', 'aws', 'kms', 'attestation', 'production'],
    },

    /* ───────── 5. Mysten Seal ───────── */
    {
      name: 'Mysten Seal — decentralized secrets management with TEE/IBE',
      authors: 'Mysten Labs',
      venue: 'Mysten Labs blog + Sui docs (Seal, announced 2024-2025)',
      year: 2025,
      link: 'https://blog.sui.io/seal-decentralized-secrets-management/',
      recap_short:
        'Seal is Sui\'s decentralized secrets service: threshold identity-based encryption with on-chain access policy.',
      recap_long:
        'Seal is a Mysten Labs product that lets a Sui dApp encrypt data to an on-chain ' +
        'policy (Move package + function) and only later decrypt once that policy authorizes ' +
        'the caller on-chain. The architecture uses a threshold of off-chain key servers that ' +
        'each hold a share of an identity-based encryption master secret; decryption requires ' +
        'a Sui transaction whose effects satisfy the policy, after which the key servers ' +
        'cooperatively produce a derivation. Key servers can be deployed inside TEEs (Nitro / ' +
        'TDX) to strengthen the operational trust model. ' +
        '\n\n' +
        'Seal is the closest thing Sui has to a native confidential storage primitive, and is ' +
        'the building block the thesis leans on when it says "Sui-native TEE abstraction": ' +
        'instead of baking TDX/Nitro attestation directly into a Move contract, a contract ' +
        'expresses the privacy policy and Seal handles the off-chain TEE plumbing. Complements ' +
        'but does not replace ZKP: Seal protects at-rest secrets, ZKP protects computations.',
      math_highlight:
        'threshold IBE decrypt: $\\mathsf{Dec}(c, \\{sk_i\\}_{i \\in S}), |S| \\geq t$',
      why_for_thesis:
        'Seal is the Sui-native answer to "where do we put credential issuance keys". Thesis ' +
        'can compose Seal-protected issuer keys with the ZKP-based spend proofs, avoiding ' +
        'a custom TEE key-management layer.',
      tags: ['sui', 'mysten', 'seal', 'ibe', 'threshold', 'key-management'],
    },

    /* ───────── 6. SGX sunset on Xeon ───────── */
    {
      name: 'Intel SGX sunset on Xeon Scalable and migration to TDX',
      authors: 'Intel Corporation',
      venue: 'Intel Product Brief / PSIRT statements (Ice Lake end of SGX, Sapphire Rapids = TDX)',
      year: 2024,
      link: 'https://www.intel.com/content/www/us/en/support/articles/000097170/software/intel-security-products.html',
      recap_short:
        'SGX was removed from Xeon Scalable starting with Sapphire Rapids — TDX is the designated successor.',
      recap_long:
        'Intel quietly removed SGX from 4th Gen Xeon Scalable (Sapphire Rapids) onward. ' +
        'SGX remains on client CPUs (some Core SKUs) and 3rd Gen Xeon (Ice Lake-SP), but ' +
        'any new server deployment from 2024 forward uses TDX. Projects that depended on ' +
        'SGX attestation for production (iExec, Secret Network, Phala, Oasis) have either ' +
        'migrated to TDX, moved to a different TEE stack (Phala → TDX / GPU TEE), or ' +
        'constrained themselves to Ice Lake end-of-life hardware. ' +
        '\n\n' +
        'On top of the platform sunset, the SGX DCAP attestation was broken in 2025 by the ' +
        'WireTap attack (DDR4 bus interposer, see ch23-papers-guide.js). The combined message ' +
        'is unambiguous: treat SGX as a legacy TEE for new work. Any thesis reference to SGX ' +
        'should be historical — e.g., explaining enclave concepts or citing ZLiTE — rather ' +
        'than architectural.',
      math_highlight: 'platform roadmap: $\\text{SGX}_{\\text{Xeon}} \\xrightarrow{\\text{sunset 2024}} \\text{TDX}_{\\text{Xeon}}$',
      why_for_thesis:
        'Eliminates SGX as a credible thesis backend. Confirms TDX (or ARM CCA / Nitro) ' +
        'as the forward-looking choice. Useful background for the "why TDX" paragraph.',
      tags: ['sgx', 'tdx', 'intel', 'migration', 'legacy'],
    },

    /* ───────── 7. Downfall CVE-2022-40982 ───────── */
    {
      name: 'Downfall (CVE-2022-40982) — Gather Data Sampling',
      authors: 'Daniel Moghimi (Google)',
      venue: 'USENIX Security 2023; CVE-2022-40982 / INTEL-SA-00828',
      year: 2023,
      link: 'https://downfall.page/',
      recap_short:
        'Gather Data Sampling leaks data across SMT threads and enclaves on Skylake through Tiger Lake Intel CPUs.',
      recap_long:
        'Downfall exploits the AVX2/AVX-512 GATHER instruction: transient execution of a ' +
        'gather can forward stale data from a shared SIMD register file to an attacker-controlled ' +
        'load, crossing SMT and user/kernel boundaries — including SGX enclaves. Affected ' +
        'micro-architectures span Skylake through Ice Lake (most server fleets pre-2023). ' +
        'Intel microcode mitigations (Gather Data Sampling mitigation, GDS) serialize gathers ' +
        'and impose measurable overhead on AVX-heavy workloads. ' +
        '\n\n' +
        'Downfall is a transient-execution attack in the same family as MDS/Fallout. Importantly, ' +
        'the mitigation is firmware-level, not architectural: a TDX or SGX workload on an ' +
        'unpatched host is vulnerable even with the enclave marked "correctly attested". ' +
        'Attestation has to include microcode version (SVN / TCB level) in the policy or the ' +
        'attestation certifies a known-broken platform.',
      math_highlight: 'TCB policy: $\\text{accept}(Q) \\iff \\text{TCB.svn}(Q) \\geq \\text{TCB.svn}^{\\text{Downfall-fix}}$',
      why_for_thesis:
        'Drives the thesis TCB-level attestation policy. Simply verifying that a Quote is ' +
        'valid is not enough — the verifier has to enforce a minimum TCB SVN, otherwise ' +
        'Downfall-era machines silently pass policy.',
      tags: ['cve', 'downfall', 'side-channel', 'intel', 'gds', 'transient-execution'],
    },

    /* ───────── 8. Inception CVE-2023-20569 ───────── */
    {
      name: 'Inception (CVE-2023-20569) — AMD Zen speculative RAS poisoning',
      authors: 'Trujillo, Gruss et al. (ETH Zurich, CISPA)',
      venue: 'USENIX Security 2024; AMD-SB-7005; CVE-2023-20569',
      year: 2023,
      link: 'https://comsec.ethz.ch/research/microarch/inception/',
      recap_short:
        'Training the Return Address Stack lets attackers hijack speculative returns on AMD Zen 1-4, including SEV-SNP guests.',
      recap_long:
        'Inception is the AMD counterpart to Intel\'s RetBleed. The Return Address Stack (RAS) ' +
        'is a small per-core buffer predicting return targets; Inception shows that a malicious ' +
        'Zen guest can poison the RAS from within a SEV-SNP VM and steer speculative execution ' +
        'in the host or another VM. On Zen 1-4 the mitigation is a combination of microcode ' +
        '(SRSO: Speculative Return Stack Overflow) and compiler-level return thunks with ' +
        'measurable performance cost. ' +
        '\n\n' +
        'This is the AMD-side reminder that microarchitectural state is shared regardless of ' +
        'the virtualization boundary and that "TEE" does not imply "side-channel free". ' +
        'For thesis risk analysis, Inception demonstrates that the cloud-provider-level attacker ' +
        'model has to include transient-execution primitives on both Intel (Downfall) and AMD ' +
        '(Inception) platforms — hybrid TEE + ZKP design is the only sound defense.',
      math_highlight: 'RAS poisoning: $\\text{RAS}_{\\text{victim}} \\leftarrow \\text{train}(\\text{RAS}_{\\text{attacker}})$',
      why_for_thesis:
        'Symmetric justification to Downfall: cross-VM leaks exist on AMD too. Paired with ' +
        'TEE.Fail (ch23-papers-guide.js), Inception kills the idea that switching vendors ' +
        'is a real mitigation — only cryptographic layering survives.',
      tags: ['cve', 'inception', 'amd', 'sev-snp', 'ras', 'transient-execution'],
    },

    /* ───────── 9. ÆPIC Leak ───────── */
    {
      name: 'ÆPIC Leak (CVE-2022-21233) — architectural SGX leak',
      authors: 'Borrello et al. (Sapienza, TU Graz, Amazon, CISPA)',
      venue: 'USENIX Security 2022; CVE-2022-21233; INTEL-SA-00657',
      year: 2022,
      link: 'https://aepicleak.com/',
      recap_short:
        'First architectural (non-transient) SGX data leak — stale APIC registers expose enclave memory on Ice Lake / Alder Lake.',
      recap_long:
        'ÆPIC Leak is the first fully architectural information leak from SGX: stale data in ' +
        'the APIC MMIO region of Ice Lake-SP, Ice Lake (client), and Alder Lake CPUs can be ' +
        'read by a kernel attacker without any timing side-channel analysis. It leaks enclave ' +
        'memory directly. Mitigation is microcode + disabling the APIC MMIO region. ' +
        '\n\n' +
        'ÆPIC is historically important because it turns SGX from a "protects against a root ' +
        'OS attacker" story into "protects only against a user-space attacker on patched ' +
        'firmware". For the thesis, it\'s another data point that platform-level patches must ' +
        'be reflected in the attestation TCB policy. It also explains why 3rd Gen Xeon is not ' +
        'a safe fallback even though it technically still supports SGX.',
      math_highlight: 'leak channel: $\\text{APIC}_{\\text{stale}} \\to \\text{enclave.mem}$',
      why_for_thesis:
        'Completes the "SGX is not viable for new thesis work" argument. Together with ' +
        'Downfall, Inception and WireTap, shows that TEE CVEs are frequent and the on-chain ' +
        'verifier must treat TCB freshness as a first-class check.',
      tags: ['cve', 'aepic', 'sgx', 'architectural-leak', 'intel'],
    },

    /* ───────── 10. IETF RATS Architecture ───────── */
    {
      name: 'IETF RATS Architecture (RFC 9334) and DICE / TCG DICE Attestation',
      authors: 'IETF RATS WG; Trusted Computing Group',
      venue: 'RFC 9334 (Jan 2023); TCG DICE Attestation Architecture (2024 rev)',
      year: 2023,
      link: 'https://datatracker.ietf.org/doc/html/rfc9334',
      recap_short:
        'RFC 9334 defines Attester/Verifier/Relying Party roles; DICE defines layered device identity via measured boot.',
      recap_long:
        'RFC 9334 is the normative vocabulary for remote attestation: Attester, Verifier, ' +
        'Relying Party, Endorser, Reference Value Provider, and a precise distinction between ' +
        'Evidence, Endorsements, Reference Values, and Attestation Results. Every modern TEE ' +
        'attestation stack (Intel ITA, AWS Nitro, ARM CCA, Azure MAA) can be mapped onto this ' +
        'role model. It finally makes the phrase "verify an attestation" semantically precise. ' +
        '\n\n' +
        'TCG DICE (Device Identifier Composition Engine) is complementary: each boot layer ' +
        'derives a key from the previous layer\'s measurement, producing an X.509/CWT chain ' +
        'rooted in an immutable per-device secret (UDS). DICE is the substrate for ARM CCA ' +
        'platform tokens, Microsoft Pluton, and most secure microcontroller attestation schemes. ' +
        'Together RATS + DICE define the interoperable shape that TDX, CCA, Nitro, and NVIDIA ' +
        'GPU attestation are converging toward.',
      math_highlight: 'DICE chain: $\\text{CDI}_{i+1} = \\mathrm{KDF}(\\text{CDI}_i, H(\\text{code}_{i+1}))$',
      why_for_thesis:
        'Makes the thesis TEE-agnostic attestation layer implementable. Defines "Attestation ' +
        'Result = cloud verifier JWT", which is what a Sui Move verifier actually consumes. ' +
        'Cite RFC 9334 when specifying the attestation interface in the architecture chapter.',
      tags: ['rats', 'dice', 'ietf', 'tcg', 'attestation-standards', 'rfc-9334'],
    },

    /* ───────── 11. Confidential Containers (CoCo) ───────── */
    {
      name: 'Confidential Containers (CoCo) 0.10+ and the Kata runtime',
      authors: 'CNCF Confidential Containers community',
      venue: 'CNCF Sandbox project; CoCo 0.10-0.12 releases (2024-2025)',
      year: 2025,
      link: 'https://github.com/confidential-containers/confidential-containers',
      recap_short:
        'CoCo boots a Kata-shielded pod inside a TDX / SEV-SNP VM, with attestation-gated image decryption via KBS.',
      recap_long:
        'CoCo is the CNCF project that wraps a Kubernetes pod inside a confidential VM: the ' +
        'Kata runtime starts a TDX or SEV-SNP guest, and the pod\'s OCI image is decrypted ' +
        'inside the guest only after attesting to a Key Broker Service (KBS). The KBS evaluates ' +
        'the Quote (via ITA, SNP attestation service, or a local verifier), compares MRTD / ' +
        'launch-digest / PCRs against policy, and releases the image decryption key and any ' +
        'runtime secrets. This gives Kubernetes workloads real attestation without rewriting ' +
        'the app. ' +
        '\n\n' +
        'Gramine and Occlum fill the adjacent niche of "library OS inside SGX / TDX": unmodified ' +
        'Linux binaries run inside a TEE with a trusted libc shim. In the CoCo era their role ' +
        'has shifted toward legacy SGX workloads; new deployments usually pick a full VM-based ' +
        'TEE + CoCo. For thesis prototyping, CoCo is the shortest route from a Rust microservice ' +
        'to a TEE-attested deployment on Azure or GCP.',
      math_highlight: 'policy: $\\text{release}(k) \\iff \\text{match}(\\text{Quote.MRTD}, \\text{policy.MRTD})$',
      why_for_thesis:
        'Provides the deployment substrate for the thesis issuance service. Avoids writing ' +
        'TEE-specific code: the Rust binary is the app, CoCo + KBS handle attestation and ' +
        'secret release. Realistic target for the implementation chapter.',
      tags: ['coco', 'kata', 'kubernetes', 'kbs', 'gramine', 'occlum', 'deployment'],
    },

    /* ───────── 12. ARM CCA v9.2 and Realm Management Monitor ───────── */
    {
      name: 'ARM CCA v9.2 and the Realm Management Monitor (RMM) specification',
      authors: 'ARM Limited',
      venue: 'ARM Architecture Reference Manual (ARMv9-A); RMM Specification 1.0 (2024)',
      year: 2024,
      link: 'https://developer.arm.com/documentation/den0137/latest',
      recap_short:
        'RMM 1.0 is the first stable specification of ARM CCA Realms — the ARM-side counterpart to Intel TDX.',
      recap_long:
        'The Realm Management Monitor (RMM) specification 1.0 landed in 2024 as the stable ' +
        'software contract for ARM CCA Realms. A Realm is a confidential VM whose memory is ' +
        'encrypted per-Realm via Memory Encryption Contexts (MEC) and whose lifecycle is ' +
        'managed by RMM code running at EL2 in Realm world. Attestation produces a CBOR Realm ' +
        'Attestation Token plus a Platform Token (from the Hardware Enforced Security, HES, ' +
        'root of trust), both following the IETF RATS CCA profile. ' +
        '\n\n' +
        'Availability: Neoverse V-series (V2 and later) and Arm Cortex-X925-class cores. No ' +
        'major public cloud exposes CCA in production as of 2026, but AWS Graviton and ' +
        'Azure Cobalt roadmaps imply arrival within the thesis timeframe. Architecturally, ' +
        'CCA is cleaner than TDX (no legacy SGX Quoting Enclave, RATS-native attestation) and ' +
        'will likely become the preferred TEE for mobile and edge thesis scenarios.',
      math_highlight:
        'CCA token: $(\\text{RealmToken}, \\text{PlatformToken}) = \\mathrm{COSE\\_Sign}(\\text{measurements})$',
      why_for_thesis:
        'ARM CCA is the thesis\'s future-looking TEE target. The RATS-native token format ' +
        'simplifies the on-chain verifier compared with DCAP. Good forward-compatibility ' +
        'bet for the TEE-agnostic abstraction.',
      tags: ['arm-cca', 'rmm', 'realm', 'armv9', 'rats', 'hes', 'future'],
    },
  ],
};
