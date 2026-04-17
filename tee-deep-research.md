# TEE Deep Technical Research

Preparation for master thesis at Mysten Labs (Sep 2026 - Mar 2027).
Focus: TEEs for unlinkability, privacy-preserving blockchain systems, anonymous credentials.

---

## 1. Complete TEE Landscape

### 1.1 Taxonomy: Process-Level vs VM-Level

TEEs split into two fundamental architectures:

**Process-level (enclave-based):** Isolate individual applications within a process boundary.
Smaller TCB, but require application modification and expose larger side-channel attack surface.
Example: Intel SGX, RISC-V Keystone.

**VM-level (confidential VMs):** Isolate entire virtual machines from the hypervisor.
Larger TCB, but offer enhanced compatibility (run unmodified OS/apps) and better scalability.
Examples: Intel TDX, AMD SEV-SNP, ARM CCA, AWS Nitro Enclaves.

```
+--------------------------------------------------------------+
|                    TEE Landscape 2025-2026                    |
+--------------------------------------------------------------+
|                                                               |
|  PROCESS-LEVEL (Enclaves)     VM-LEVEL (Confidential VMs)    |
|  +------------------------+   +----------------------------+  |
|  | Intel SGX (deprecated  |   | Intel TDX                  |  |
|  |   on consumer chips)   |   | AMD SEV / SEV-SNP          |  |
|  | RISC-V Keystone        |   | ARM CCA (Realm)            |  |
|  | ARM TrustZone          |   | AWS Nitro Enclaves         |  |
|  +------------------------+   | NVIDIA CC (GPU TEE)        |  |
|                               +----------------------------+  |
|                                                               |
|  SPECIAL PURPOSE                                              |
|  +----------------------------------------------------------+ |
|  | Google Titan (hardware RoT, not general TEE)              | |
|  | Apple Secure Enclave (mobile, closed ecosystem)           | |
|  | TPM 2.0 (attestation/key storage only, not computation)   | |
|  +----------------------------------------------------------+ |
+--------------------------------------------------------------+
```

### 1.2 Detailed Comparison

#### Intel SGX (Software Guard Extensions)

- **Architecture:** Process-level enclaves. Creates encrypted memory regions (EPC) within a process. Code enters/exits via ECALL/OCALL CPU instructions. EPC limited to 128-512 MB (paging for more = performance hit).
- **Trust model:** Trust CPU + Intel only. OS, hypervisor, BIOS are untrusted. Smallest TCB of any TEE.
- **Attestation:** EPID (legacy, EOL April 2025) or DCAP (ECDSA-based, current). Local attestation via EREPORT, remote via Quoting Enclave producing a Quote verified by Intel Attestation Service or third-party verifiers.
- **Sealing:** Data encrypted to enclave identity (MRENCLAVE = hash of enclave binary) or signer identity (MRSIGNER = hash of signing key). MRENCLAVE: only exact same binary can unseal. MRSIGNER: any enclave by same signer can unseal (enables version upgrades).
- **Performance overhead:** 5-20% for compute-bound, up to 2x for memory-intensive (EPC paging). I/O crossing enclave boundary is expensive.
- **Availability:** Xeon server CPUs only (consumer deprecated since 11th gen, 2021). Still supported on Xeon Scalable but Intel shifting focus to TDX.
- **CRITICAL: WireTap attack (ACM CCS 2025).** Researchers extracted DCAP attestation ECDSA keys using sub-$1000 DDR4 memory bus interposer in under 45 minutes. Enables forging attestation quotes. Affected Phala, Secret Network, Crust. SGX on DDR4 is fundamentally broken for high-security use cases. DDR5 platforms not yet demonstrated vulnerable.
- **Status:** Effectively deprecated for new projects. Migrate to TDX.

#### Intel TDX (Trust Domain Extensions)

- **Architecture:** VM-level. Creates hardware-isolated VMs called Trust Domains (TDs). The TDX Module (firmware running in a new CPU mode called SEAM) manages TD lifecycle. Entire guest OS + apps run inside the TD unmodified.
- **Trust model:** Trust CPU + TDX Module firmware. Hypervisor (VMM) is untrusted. Smallest TCB among VM-level TEEs (the TDX Module is formally verified).
- **Attestation:** Two-step process. (1) Guest calls TDCALL[TDG.MR.REPORT] to get TDREPORT from TDX Module, containing measurements (MRTD for initial config, RTMR registers for runtime state) + MAC. (2) TDREPORT sent to SGX Quoting Enclave which converts it to a remotely verifiable Quote. Verified via Intel Trust Authority (SaaS) or DCAP infrastructure.
- **Performance overhead:** 2-8% for compute, ~28.6% average for I/O-intensive workloads. Consistently outperforms AMD SEV when CPU perf is normalized. Memory encryption uses AES-256 (strongest among TEEs).
- **Availability:** 4th Gen Xeon Scalable (Sapphire Rapids) and later. Available on major clouds (Azure, GCP, AWS). Built for DDR5, hardened against physical bus attacks like WireTap.
- **Status:** Intel's primary confidential computing technology going forward.

#### AMD SEV / SEV-SNP (Secure Encrypted Virtualization)

- **Architecture:** VM-level. Memory encryption engine (SME) encrypts VM memory with per-VM keys managed by AMD Secure Processor (SP), a dedicated ARM core on the die. Evolution: SEV (encryption only) -> SEV-ES (encrypted state, protects registers) -> SEV-SNP (adds integrity via Reverse Map Table).
- **Trust model:** Trust CPU + AMD SP firmware. Hypervisor untrusted. SNP adds integrity protection preventing hypervisor from replaying, remapping, or corrupting guest memory.
- **Attestation:** AMD SP generates attestation reports containing platform measurements (firmware, microcode) and guest measurements (launch digest). Reports signed by the SP using a key derived from chip-unique secrets. Verification via AMD Key Distribution Service (KDS) which provides the signing key certificate chain. Communication between SP and VM secured via VMPCKs (VM Platform Communication Keys).
- **Performance overhead:** 3-5% for CPU-bound workloads, 3-15% typical range, up to 20% for network-heavy NFV workloads. Best price/performance ratio in production deployments.
- **Availability:** EPYC processors (3rd gen Milan for SEV-SNP, 4th gen Genoa improved). Widely available on Azure, GCP, AWS. EPYC 9005 (Turin) latest generation.
- **Status:** Most mature VM-level TEE in production. Strong ecosystem.

#### ARM TrustZone

- **Architecture:** Partitions the processor into two worlds: Normal World (rich OS) and Secure World (trusted OS like OP-TEE). Hardware enforced via NS (Non-Secure) bit on bus transactions. Not an enclave system; it is a two-world system-wide partition.
- **Trust model:** Secure World trusts CPU, secure firmware, and secure OS. Normal World is untrusted. Static partition: only one Secure World per chip (limited scalability).
- **Attestation:** No standardized remote attestation. Platform-specific, often proprietary. Typically relies on secure boot chain + device certificates.
- **Performance overhead:** Near zero for context switching between worlds. Primary overhead is in Secure World OS itself.
- **Availability:** Ubiquitous in ARM mobile SoCs (every smartphone). Cortex-A and Cortex-M. Deployed in billions of devices.
- **Status:** Legacy for mobile. Being superseded by ARM CCA for server/cloud use. Still dominant for mobile TEE (payment, DRM, biometrics).

#### ARM CCA (Confidential Compute Architecture)

- **Architecture:** Extends TrustZone's two-world model to four worlds: Normal, Secure, Root, and Realm. The Realm world is new and orthogonal to existing worlds. Realms are confidential VMs managed by the Realm Management Monitor (RMM) running at EL2 in the Realm world. RME (Realm Management Extension) is the hardware component. Memory Encryption Contexts (MEC) provide per-Realm encryption keys.
- **Trust model:** Realm code/data is confidential and integrity-protected against Normal World hypervisor and other Realms. Root world (firmware/monitor) is trusted. RMM is part of the TCB.
- **Attestation:** RMM maintains runtime measurements of each Realm. On request, generates a Realm attestation token + CCA Platform attestation token from the Hardware Enforced Security (HES) Root of Trust. Token format follows IETF RATS specification (CCA attestation token draft).
- **Interface APIs:** RMI (Realm Management Interface) for hypervisor-to-RMM communication, RSI (Realm Services Interface) for guest-to-RMM communication (including attestation requests).
- **Performance overhead:** Expected similar to TDX/SEV-SNP (2-10%). Still in early deployment.
- **Availability:** ARMv9-A architecture. First silicon expected in Neoverse V-series server chips. Not yet widely available in production clouds.
- **Status:** Future of ARM confidential computing. Critical for edge/mobile confidential computing scenarios.

#### AWS Nitro Enclaves

- **Architecture:** Not a CPU instruction set extension; instead, leverages the Nitro Hypervisor to carve out isolated VMs from a parent EC2 instance. Enclave has NO persistent storage, NO interactive access, NO external networking. Communication with parent instance only via vsock (local socket). Runs a full Linux kernel inside the enclave.
- **Trust model:** Trust the Nitro Hypervisor + AWS hardware. The parent EC2 instance is untrusted (cannot access enclave memory). AWS itself can see nothing inside the enclave.
- **Attestation:** Nitro Secure Module (NSM) generates attestation documents encoded in CBOR, signed with COSE (ECDSA P-384). Document contains: module_id, timestamp, PCR values (platform configuration registers, up to 32), DER-encoded certificate, CA bundle, optional public_key/user_data/nonce. Verification against AWS Nitro Attestation PKI root certificate. KMS integration: can require specific PCR values before decrypting secrets.
- **PCR values:** PCR0 = enclave image hash, PCR1 = Linux kernel hash, PCR2 = application hash, PCR8 = signing certificate. Enables code identity verification.
- **Performance overhead:** Minimal CPU overhead (same hardware), but vsock communication adds latency for I/O-heavy workloads. Memory is carved from parent instance.
- **Availability:** Any EC2 Nitro-based instance (most modern instance types). Very easy to get started.
- **Status:** Production-ready, widely used for key management, blockchain validators, sensitive data processing. No physical access attack vector (AWS controls hardware).

#### NVIDIA Confidential Computing (GPU TEE)

- **Architecture:** H100 Hopper and later GPUs. On-die Root of Trust (RoT) with measured/attested boot. Hardware firewalls isolate the GPU TEE from host. Each GPU has a unique hardware-fused device identity key and Device Identity Certificate. Memory encryption for GPU memory.
- **Trust model:** Trust GPU hardware + NVIDIA firmware. Host CPU, OS, hypervisor are untrusted for GPU memory. Typically paired with CPU TEE (TDX or SEV-SNP) for end-to-end protection.
- **Attestation:** Follows RATS (Remote ATtestation procedureS) specification. 64 structured measurement records (firmware, config hashes). Supports composite attestation with Intel Trust Authority: attest CPU TEE + GPU TEE in one workflow.
- **Performance overhead:** Varies by workload. For AI inference, typically 5-15% overhead.
- **Availability:** H100, H200 (Hopper), Blackwell architecture GPUs. Available on major clouds.
- **Status:** Only solution for confidential AI at scale. Growing rapidly with AI demand.

#### RISC-V Keystone

- **Architecture:** Pure software-based TEE framework for RISC-V. Three components: (1) Security Monitor (SM) using RISC-V Physical Memory Protection (PMP) hardware, (2) Runtime in the enclave, (3) Host driver. Modular and customizable: swap out components for different security/performance tradeoffs.
- **Trust model:** Trust CPU + Security Monitor. Host OS and other enclaves are mutually isolated.
- **Attestation:** Working toward standard remote attestation protocols. Currently supports measured boot and local attestation. Not yet production-grade.
- **Performance overhead:** Depends on configuration. PMP-based isolation is lightweight.
- **Availability:** QEMU, FireSim (FPGA), SiFive HiFive Unleashed. Experimental/research stage.
- **Status:** Not production-ready. Important for long-term open-source TEE vision (no vendor lock-in). Actively being developed toward industry standards.

#### Other Notable TEEs

- **Apple Secure Enclave:** Dedicated security coprocessor in Apple SoCs. Handles biometrics, key storage, secure boot. Closed ecosystem, no third-party enclave code.
- **Google Titan / Titan M2:** Hardware RoT, not a general-purpose TEE. Used for secure boot, key storage, attestation. Titan M2 in Pixel phones is a separate security chip with its own OS.
- **Samsung Knox / Qualcomm SPU:** Mobile TEEs building on TrustZone. Proprietary extensions.
- **IBM Secure Execution:** VM-level TEE for IBM Z mainframes. Niche but mature for enterprise.

### 1.3 Summary Comparison Table

```
+------------------+----------+------------+----------------+----------+-------------+
| TEE              | Level    | TCB Size   | Attestation    | Overhead | Production  |
+------------------+----------+------------+----------------+----------+-------------+
| Intel SGX        | Process  | Smallest   | DCAP/EPID      | 5-20%    | Declining   |
| Intel TDX        | VM       | Small      | TDREPORT+Quote | 2-8%     | Growing     |
| AMD SEV-SNP      | VM       | Medium     | AMD SP Reports | 3-15%    | Mature      |
| ARM TrustZone    | System   | Medium     | Platform-spec  | ~0%      | Mobile only |
| ARM CCA          | VM       | Medium     | RMM Tokens     | 2-10%    | Coming      |
| AWS Nitro        | VM       | Medium     | NSM/CBOR/COSE  | Low      | Mature      |
| NVIDIA CC        | GPU      | Large      | RATS/64 meas.  | 5-15%    | Growing     |
| RISC-V Keystone  | Process  | Configurable| In progress   | Low      | Research    |
+------------------+----------+------------+----------------+----------+-------------+
```

---

## 2. Mysten Labs, Seal, and TEE Strategy

### 2.1 Seal: Decentralized Secrets Management

Seal is Mysten Labs' decentralized secrets management (DSM) product, launched on Sui Testnet in April 2025 and now on mainnet.

**Architecture:**
```
+-------------------+     +-----------------------+     +------------------+
|   Client App      |     |   Sui Blockchain      |     | Seal Key Servers |
| (TypeScript SDK)  |     | (Move Contracts)      |     | (t-of-n threshold|
|                   |     |                       |     |  decryption)     |
| 1. Encrypt data   |     | 2. Define access      |     |                  |
|    with IBE +     |---->|    policies in Move   |     | 4. Each server   |
|    master pubkey  |     |    (who, when, what)  |     |    provides      |
|                   |     |                       |     |    partial key   |
| 6. Decrypt with   |     | 3. Verify user meets  |     |    share         |
|    combined key   |<----|    policy onchain     |---->|                  |
+-------------------+     +-----------------------+     | 5. Aggregator    |
                                                        |    combines t    |
                                                        |    shares        |
                                                        +------------------+
```

**Core design:**
- **Identity-Based Encryption (IBE):** Encrypts data to an identity (not a specific public key). The identity can be an address, NFT ownership, role, etc.
- **Threshold encryption:** Master key split via Distributed Key Generation (DKG) across n key servers with t-of-n threshold. First decentralized key server runs 3-of-5 with geo-distributed operators. No single operator ever holds the full master key.
- **Onchain policies:** Access rules defined in Move smart contracts on Sui. Policies are flexible, updatable, and app-specific. The contract decides who can decrypt, when, and under what conditions.
- **Storage agnostic:** Works with Walrus (decentralized storage), IPFS, or any storage. Seal handles encryption/access, not storage.
- **Client-side encryption:** Data encrypted before leaving the user's environment.

**Codebase:** 73.6% Rust, 25.2% Move, 1.2% other. Repository: github.com/MystenLabs/seal.

### 2.2 Seal and TEE

Based on thorough search of Mysten Labs' public repos, blog posts, and documentation: **Seal does not currently use TEEs or Nitro Enclaves.** The system is purely cryptographic, relying on threshold encryption and onchain access control rather than hardware-based trust.

However, TEEs are a natural fit for Seal's key server infrastructure:
- Key servers could run inside TEEs to protect key shares from the server operators themselves.
- Attestation would prove to users that key servers are running expected code and not exfiltrating key shares.
- This is likely where your thesis work could contribute.

### 2.3 Sui Privacy Roadmap (2026)

Mysten Labs co-founder Adeniyi Abiodun confirmed private transactions coming to Sui in 2026:
- "Private by default" with selective disclosure. Users control what is shared.
- "First class primitives" embedded at the protocol level, not an optional layer.
- Targets both consumer payments and enterprise use cases with regulatory compliance.
- Mysten Labs published a SoK (Systematization of Knowledge) paper exploring privacy models for account-based blockchains, covering confidential balances, k-anonymity, and sender-receiver unlinkability using homomorphic encryption and ZKPs.
- Related work on Groth-Sahai proofs and ZK range proofs for anonymous credential systems.

**The thesis opportunity:** Mysten Labs is building privacy primitives using cryptography (ZKP, homomorphic encryption, IBE). TEEs could complement this stack by providing computationally cheap unlinkability, confidential computation for key management, and a path to stronger privacy guarantees without the overhead of pure ZKP approaches.

### 2.4 Blockchain Projects Using TEEs (Precedent)

| Project | TEE Used | Architecture | Status |
|---------|----------|-------------|--------|
| Secret Network | Intel SGX | Validators run all contracts in SGX enclaves. State encrypted at rest. Consensus encryption seed stored only in TEE. | Live since Sep 2020. Migrating away from SGX after WireTap. |
| Oasis (Sapphire) | Intel SGX | Confidential ParaTime runs EVM inside SGX. Standard Solidity, private by default. Node operators cannot see inputs/state/outputs. | Live. Working on TDX migration. |
| Phala Network | SGX -> TDX + NVIDIA CC | pRuntime kernel in TEE. After WireTap, deprecated SGX entirely. Migrating to TDX + NVIDIA CC. | Active migration. |
| Chainlink | Multi-TEE | DECO protocol. DON nodes use TEEs for confidential oracle data. Defense-in-depth with multiple hardware vendors. | Production. |

**Key lesson from all of these:** Every project that relied solely on SGX is now migrating or has been compromised. TEE vendor diversity is not optional.

---

## 3. TEE-Agnostic Design

### 3.1 The Problem

Different TEEs have fundamentally different:
- **APIs:** ECALL/OCALL (SGX) vs vsock (Nitro) vs standard syscalls (TDX/SEV)
- **Memory models:** Limited EPC (SGX) vs full VM memory (TDX/SEV/Nitro)
- **Attestation formats:** EPID/DCAP quotes (SGX) vs CBOR/COSE documents (Nitro) vs TDREPORT+Quote (TDX) vs AMD SP reports (SEV-SNP)
- **I/O models:** No networking in SGX, vsock only in Nitro, full networking in TDX/SEV
- **Isolation granularity:** Process (SGX) vs VM (everything else)

Writing code that works across TEEs requires abstraction at multiple layers.

### 3.2 Existing Abstraction Frameworks

#### Gramine (formerly Graphene-SGX)
- **Approach:** Library OS that runs unmodified Linux applications inside SGX enclaves. Intercepts syscalls and reimplements them within the enclave boundary.
- **Pros:** No code modification. Run existing Linux binaries. Good for legacy applications.
- **Cons:** SGX-only. Large TCB (the library OS itself). Performance overhead from syscall translation.
- **Use case:** Port existing applications to SGX without rewriting.
- **Status:** Active development, part of Confidential Computing Consortium.

#### Occlum
- **Approach:** Memory-safe library OS for SGX. Supports multi-process, uses Rust internally for safety. OCI container integration.
- **Pros:** Better memory safety than Gramine. Container-friendly.
- **Cons:** SGX-only. Similar TCB concerns.
- **Status:** Active. Alibaba-backed.

#### Enarx
- **Approach:** True TEE-agnostic framework. Runs WebAssembly (WASM/WASI) workloads inside TEEs. Abstracts away the TEE entirely: same WASM binary runs on SGX, SEV, or TDX.
- **Pros:** Language-agnostic (any language that compiles to WASM). True portability. Only trusts the enclave and CPU firmware. Part of CCC.
- **Cons:** WASM performance overhead. Not all workloads fit the WASM model. Limited ecosystem.
- **Key insight for thesis:** Enarx's "Keep" concept is closest to the TEE-agnostic design your advisor wants.

#### EGo
- **Approach:** Go runtime for SGX enclaves. Write standard Go code, compile for SGX with minimal changes.
- **Pros:** Easy for Go developers. Small configuration overhead.
- **Cons:** SGX-only. Go only. No cross-TEE portability.

#### Confidential Containers (CoCo)
- **Approach:** CNCF project. Run OCI/Kubernetes containers inside TEEs (TDX, SEV-SNP, or SGX). Standard container image, confidential execution.
- **Pros:** Kubernetes-native. Works with existing container tooling. Supports multiple TEEs.
- **Cons:** VM-level only (TDX/SEV-SNP). Container overhead.
- **Status:** Growing rapidly. Likely the production standard for multi-TEE deployments.

### 3.3 TEE-Agnostic Design Pattern for Your Thesis

The advisor's requirement: "No one wants TEE vendor lock-in."

**Proposed abstraction architecture:**

```
+------------------------------------------------------------------+
|                        Application Logic                          |
|   (Rust: credential issuance, ZKP verification, key derivation)  |
+------------------------------------------------------------------+
                              |
                    TEE Abstraction Layer
                              |
+------------------------------------------------------------------+
|                      TEE Interface Trait                           |
|                                                                   |
|  trait TeeRuntime {                                               |
|      fn attest(&self, user_data: &[u8]) -> AttestationDoc;       |
|      fn seal(&self, data: &[u8], policy: SealPolicy) -> Sealed;  |
|      fn unseal(&self, sealed: &Sealed) -> Result<Vec<u8>>;       |
|      fn secure_channel(&self) -> TlsStream;                      |
|      fn get_entropy(&self, len: usize) -> Vec<u8>;               |
|  }                                                                |
+------------------------------------------------------------------+
          |                    |                     |
+-----------------+  +------------------+  +-------------------+
| NitroRuntime    |  | TdxRuntime       |  | SevSnpRuntime     |
| - vsock I/O     |  | - standard I/O   |  | - standard I/O    |
| - NSM attestation| | - TDREPORT+Quote |  | - AMD SP reports  |
| - KMS integration|| - Intel TA       |  | - AMD KDS         |
+-----------------+  +------------------+  +-------------------+
```

**Key design decisions:**

1. **Attestation abstraction:** Normalize all attestation formats into a common `AttestationDoc` that contains: measurements, platform identity, nonce, and user data. Each backend translates its native format.

2. **I/O abstraction:** Nitro uses vsock, SGX uses ECALL/OCALL, TDX/SEV use standard networking. Abstract behind a `SecureChannel` trait.

3. **Sealing abstraction:** Not all TEEs have sealing. Nitro has no persistent storage at all. Design: external encrypted storage (e.g., Walrus/S3) with keys derived from attestation identity. This naturally implements the advisor's requirement: "No state held by TEE only."

4. **Build once, deploy anywhere:** Use `#[cfg(feature = "nitro")]` / `#[cfg(feature = "tdx")]` compile-time feature flags. Core logic is identical.

```rust
// Pseudocode: TEE-agnostic trait
pub trait TeeRuntime: Send + Sync {
    /// Generate attestation evidence for remote verification
    fn attest(&self, nonce: &[u8], user_data: &[u8]) -> Result<AttestationEvidence>;

    /// Derive a deterministic key from TEE identity + label
    /// Key is reproducible across restarts of the same enclave code
    fn derive_key(&self, label: &[u8]) -> Result<[u8; 32]>;

    /// Get cryptographically secure random bytes
    fn random_bytes(&self, buf: &mut [u8]) -> Result<()>;
}

pub struct AttestationEvidence {
    pub platform: Platform,        // Nitro | TDX | SevSnp
    pub measurements: Vec<u8>,     // Platform-specific, opaque
    pub user_data: Vec<u8>,        // Application-provided
    pub nonce: Vec<u8>,            // Challenge-response
    pub signature: Vec<u8>,        // Platform signature
    pub cert_chain: Vec<Vec<u8>>,  // Verification chain
}

pub enum Platform {
    AwsNitro,
    IntelTdx,
    AmdSevSnp,
    IntelSgx,  // Legacy support
}
```

### 3.4 Addressing Vendor Lock-in with Standards

The Confidential Computing Consortium (CCC) is working on:
- **Standardized attestation verification:** Common API for verifying attestation from any TEE vendor.
- **TPM-based combined attestation:** Use a vendor-neutral TPM as a secondary trust anchor alongside TEE-specific attestation.
- **IETF RATS (Remote ATtestation procedureS):** Standard framework for attestation evidence/results exchange.

**Practical approach for the thesis:**
1. Target AWS Nitro Enclaves first (easiest to deploy, Mysten Labs likely uses AWS).
2. Design the abstraction layer from day one.
3. Add Intel TDX backend as second target.
4. Keep the architecture open for AMD SEV-SNP and future RISC-V.

---

## 4. Programming Inside a TEE (Practical)

### 4.1 What You CAN and CANNOT Do

```
+----------------------------------+-----------------------------------+
|          CAN DO                  |         CANNOT DO                 |
+----------------------------------+-----------------------------------+
| CPU computation (any algorithm)  | Direct filesystem access (SGX,   |
| Memory allocation (within limits)|   Nitro)                         |
| Cryptographic operations         | External networking (SGX, Nitro) |
| Multi-threading                  | System calls (SGX: most blocked) |
| TLS over allowed channels        | GPU access from CPU TEE          |
| Attestation generation           | Debugging in production          |
| Secure random number generation  | Loading dynamic libraries (SGX)  |
| Key derivation                   | Fork/exec processes (SGX)        |
| Sealed storage (SGX only)        | Persistent storage (Nitro)       |
+----------------------------------+-----------------------------------+
```

**Note:** VM-level TEEs (TDX, SEV-SNP) have far fewer restrictions. They run a full Linux kernel, so standard system calls work. The restrictions above primarily apply to SGX and Nitro Enclaves.

### 4.2 Rust in SGX: Teaclave vs Fortanix

#### Teaclave SGX SDK (Apache)

Split architecture: untrusted app + trusted enclave.

```rust
// Untrusted side: calls into enclave via FFI
extern {
    fn process_credential(
        eid: sgx_enclave_id_t,
        retval: *mut sgx_status_t,
        input: *const u8,
        input_len: usize,
        output: *mut u8,
        output_len: usize,
    ) -> sgx_status_t;
}

// Trusted side (inside enclave): #[no_std], limited crate support
#[no_mangle]
pub extern "C" fn process_credential(
    input: *const u8,
    input_len: usize,
    output: *mut u8,
    output_len: usize,
) -> sgx_status_t {
    // Reconstruct slice from raw pointer (unsafe boundary)
    let input_slice = unsafe {
        core::slice::from_raw_parts(input, input_len)
    };
    // ... process credential inside enclave ...
    sgx_status_t::SGX_SUCCESS
}
```

- Requires `.edl` (Enclave Definition Language) files for interface definition.
- `#[no_std]` environment with ported crates. No async/await.
- v2.0 supports `cargo build`, Tokio/Tonic in enclave.
- ~160K lines of code wrapping Intel's C++ SDK.

#### Fortanix EDP (Enclave Development Platform)

Single-binary architecture: no app/enclave split.

```rust
// Standard Rust code that runs inside SGX enclave
// Two lines in .cargo/config to target SGX:
// [build]
// target = "x86_64-fortanix-unknown-sgx"

use std::net::{TcpListener, TcpStream};

fn main() {
    // Standard networking API - works inside enclave!
    let listener = TcpListener::bind("127.0.0.1:7878").unwrap();
    for stream in listener.incoming() {
        let stream = stream.unwrap();
        handle_connection(stream);
    }
}
```

- Official Rust tier-2 target (`x86_64-fortanix-unknown-sgx`).
- Uses `libstd` (not `#[no_std]`). Standard Rust APIs work.
- ~18K lines of code (4x smaller than Teaclave).
- **CAVEAT:** Unsupported operations (filesystem, process spawning) compile fine but panic at runtime. Violates Rust's "if it compiles, it works" principle.

**Recommendation for thesis:** Use Fortanix EDP for any SGX prototyping. Much lower friction. But SGX itself is declining; focus on Nitro/TDX.

### 4.3 Rust in AWS Nitro Enclaves

```rust
// Inside Nitro Enclave: use aws-nitro-enclaves-nsm-api crate
use aws_nitro_enclaves_nsm_api::api::Request;
use aws_nitro_enclaves_nsm_api::driver;

fn generate_attestation(nonce: &[u8], public_key: &[u8]) -> Vec<u8> {
    // Initialize the NSM device
    let nsm_fd = driver::nsm_init();

    // Request attestation document
    let request = Request::Attestation {
        user_data: Some(user_data.to_vec().into()),
        nonce: Some(nonce.to_vec().into()),
        public_key: Some(public_key.to_vec().into()),
    };

    let response = driver::nsm_process_request(nsm_fd, request);
    match response {
        Response::Attestation { document } => document,
        _ => panic!("Unexpected response"),
    }
}

// Communication with parent instance via vsock
use vsock::{VsockListener, VsockStream};

fn main() {
    let listener = VsockListener::bind(vsock::VMADDR_CID_ANY, 5000)
        .expect("Failed to bind vsock");

    for stream in listener.incoming() {
        let stream = stream.unwrap();
        // Handle requests from parent EC2 instance
        handle_request(stream);
    }
}
```

**Key Nitro Enclave constraints:**
- No external networking. All I/O goes through vsock to parent instance.
- No persistent storage. State must be externalized.
- Enclave image is a Docker container converted to `.eif` (Enclave Image File).
- Attestation document in CBOR/COSE format, signed with ECDSA P-384.
- KMS integration: condition KMS key policies on PCR values to restrict decryption to specific enclave code versions.

**Nitro development workflow:**
1. Write standard Rust application.
2. Create Dockerfile for the enclave.
3. Build enclave image: `nitro-cli build-enclave --docker-uri <image> --output-file enclave.eif`
4. Run: `nitro-cli run-enclave --eif-path enclave.eif --cpu-count 2 --memory 512`
5. Connect via vsock from parent instance.
6. For KMS: configure IAM + KMS key policy with PCR conditions.

### 4.4 Attestation Flow (Universal Pattern)

```
+----------+         +----------+         +----------+         +----------+
| Verifier |         | Enclave  |         | TEE HW   |         | Vendor   |
| (relying |         | (your    |         | (CPU/NSM)|         | PKI      |
|  party)  |         |  code)   |         |          |         |          |
+----+-----+         +----+-----+         +----+-----+         +----+-----+
     |                     |                    |                    |
     |  1. Challenge       |                    |                    |
     |  (nonce)            |                    |                    |
     +-------------------->|                    |                    |
     |                     |                    |                    |
     |                     | 2. Request         |                    |
     |                     |    attestation     |                    |
     |                     |    (nonce +        |                    |
     |                     |     user_data)     |                    |
     |                     +------------------->|                    |
     |                     |                    |                    |
     |                     |    3. Signed       |                    |
     |                     |    attestation     |                    |
     |                     |    document        |                    |
     |                     |<-------------------+                    |
     |                     |                    |                    |
     | 4. Attestation doc  |                    |                    |
     |<--------------------+                    |                    |
     |                     |                    |                    |
     | 5. Verify signature against vendor PKI   |                    |
     +------------------------------------------------------------->|
     |                                                               |
     | 6. Verify measurements match expected enclave code            |
     | 7. Verify nonce matches challenge (anti-replay)               |
     | 8. If valid: establish encrypted channel with enclave         |
     |                     |                    |                    |
```

### 4.5 Sealing Deep Dive

Sealing = encrypting data to the enclave's identity so it persists across restarts.

**SGX sealing policies:**
- **MRENCLAVE:** Seal key derived from exact enclave binary hash. Only identical binary can unseal. Strictest. Problem: any code update = lose access to sealed data.
- **MRSIGNER:** Seal key derived from signing authority hash. Any enclave signed by same key can unseal. Enables version upgrades. Weaker isolation between enclaves by same author.

**The "no state held by TEE only" pattern (advisor's requirement):**

Since Nitro has no persistent storage and SGX sealing is fragile (WireTap, version updates), the best practice is:

```
+-----------+     +------------+     +------------------+
| TEE       |     | Encrypted  |     | External KMS     |
| (compute  |---->| blob on    |<--->| (AWS KMS, Vault, |
|  only)    |     | external   |     |  onchain escrow) |
|           |     | storage    |     |                  |
| - Derive  |     | (S3/Walrus)|     | - Master key     |
|   session |     |            |     |   protected by   |
|   keys    |     | - Data     |     |   attestation    |
| - Process |     |   encrypted|     |   policy         |
|   data    |     |   at rest  |     |                  |
| - Forget  |     |            |     | - TEE proves     |
|   after   |     |            |     |   identity to    |
|   use     |     |            |     |   get key        |
+-----------+     +------------+     +------------------+
```

**Pattern:** TEE processes data but never stores it. Keys are managed externally (KMS with attestation-gated access). Data at rest is encrypted externally. If TEE is compromised or lost, data remains accessible (just re-provision a new TEE with same code = same attestation = same KMS access).

This directly implements: "OK if we lose access to privacy but not to data" and "Lose access to key -> must not lose data."

---

## 5. TEE for Unlinkability

### 5.1 The Core Idea

Unlinkability means an observer cannot determine that two actions (transactions, messages, requests) were performed by the same entity.

**TEE as a "mixing box":**

```
+-----------------------------------------------------------------+
|                         TEE Enclave                              |
|                                                                  |
|   Encrypted    +------------------+     Unlinkable               |
|   Inputs  ---->| Process:         |---->  Outputs                |
|   (linked to   | - Decrypt inputs |     (no correlation          |
|    senders)    | - Verify creds   |      to inputs)              |
|                | - Apply logic    |                              |
|                | - Re-encrypt     |                              |
|                | - Shuffle/batch  |                              |
|                +------------------+                              |
|                                                                  |
|   Observer sees: encrypted traffic in, encrypted traffic out.    |
|   Cannot link input i to output j (TEE provides the mixing).    |
+-----------------------------------------------------------------+
```

### 5.2 TEE Unlinkability vs ZKP Unlinkability

| Dimension | TEE Unlinkability | ZKP Unlinkability |
|-----------|------------------|-------------------|
| **Guarantee** | Hardware-based. Breaks if TEE is compromised. | Mathematical. Unconditional. |
| **Performance** | Near-native speed. Process millions of txns. | Proof generation: seconds to minutes per operation. |
| **Complexity** | Write normal code inside TEE. | Requires circuit design, specialized DSLs (Circom, Noir, Halo2). |
| **Trust assumption** | Trust hardware vendor (Intel/AMD/AWS). | Trust math only (no hardware vendor). |
| **Failure mode** | Compromise = all historical unlinkability retroactively broken (if attacker recorded traffic). | Cannot be broken retroactively. Past proofs remain valid. |
| **Composability** | Limited. Each TEE instance is independent. | Excellent. Proofs compose (recursive SNARKs). |
| **Side channels** | Vulnerable to access pattern analysis, timing, power analysis. | No side channels (pure math). |
| **Scalability** | Scales with hardware. Add more enclaves. | Proof aggregation helps but has limits. |

### 5.3 Hybrid Architecture (Best of Both)

**The thesis proposition:** Use TEE for high-throughput unlinkability with ZKP as a fallback/verification layer.

```
+---------------------------------------------------------------------+
|                     Hybrid Privacy Architecture                      |
+---------------------------------------------------------------------+
|                                                                      |
|  HOT PATH (high throughput, low latency):                           |
|  +---------------------------------------------------------------+  |
|  | TEE processes transactions at native speed.                    |  |
|  | Provides unlinkability via encrypted mixing.                   |  |
|  | Generates a commitment (hash of batch) for later verification.|  |
|  +---------------------------------------------------------------+  |
|                              |                                       |
|  COLD PATH (periodic verification):                                 |
|  +---------------------------------------------------------------+  |
|  | ZKP proves the TEE batch was processed correctly.             |  |
|  | Proof published onchain. Verifiable by anyone.                |  |
|  | If TEE is compromised, ZKP catches invalid state transitions. |  |
|  +---------------------------------------------------------------+  |
|                              |                                       |
|  FALLBACK (TEE unavailable):                                        |
|  +---------------------------------------------------------------+  |
|  | Full ZKP pipeline. Slower but functional.                     |  |
|  | No privacy degradation, only performance degradation.         |  |
|  +---------------------------------------------------------------+  |
|                                                                      |
+---------------------------------------------------------------------+
```

This implements the advisor's "lose access to privacy but not to data" by:
- TEE provides privacy. ZKP provides integrity verification.
- If TEE fails: fall back to ZKP-only (slower but mathematically guaranteed privacy).
- Data itself is always on external storage, encrypted. Never locked inside TEE.

### 5.4 TEE Unlinkability for Anonymous Credentials

Specific to your thesis topic (anonymous credentials + ZKP + TEE):

**Without TEE:** User generates a ZKP proving they hold a valid credential without revealing which one. Expensive (proving time) but unconditional unlinkability.

**With TEE:** User sends encrypted credential to TEE. TEE verifies credential validity inside enclave, generates a fresh pseudonymous token, and outputs it. The link between credential and token exists only inside the enclave (never persisted, never visible outside). Much faster than ZKP.

**Concrete flow:**
```
User                         TEE Enclave                   Verifier
  |                               |                            |
  | 1. Encrypt(credential,        |                            |
  |    TEE_pubkey)                 |                            |
  +------------------------------>|                            |
  |                               | 2. Decrypt credential      |
  |                               | 3. Verify credential       |
  |                               |    signature valid          |
  |                               | 4. Check not revoked       |
  |                               | 5. Generate fresh          |
  |                               |    pseudonymous token       |
  |                               | 6. Sign token with         |
  |                               |    enclave key              |
  |                               | 7. Forget credential       |
  |                               |    (zero memory)            |
  | 8. Receive token              |                            |
  |<------------------------------+                            |
  |                                                            |
  | 9. Present token to verifier                               |
  +----------------------------------------------------------->|
  |                               | 10. Verify token sig       |
  |                               |     via TEE attestation    |
  |                               |                            |
```

**Critical implementation detail:** Step 7 (zero memory) is essential. The enclave must explicitly overwrite the credential in memory after processing. In Rust:

```rust
// Inside the enclave
fn process_credential(encrypted_cred: &[u8]) -> Token {
    let mut credential = decrypt(encrypted_cred);

    // Verify and generate token
    let token = generate_pseudonymous_token(&credential);

    // CRITICAL: zero the credential from memory
    // Do NOT rely on Drop - use explicit zeroization
    credential.zeroize(); // from the `zeroize` crate

    token
}
```

### 5.5 Access Pattern Leakage and ORAM

Even with encryption, memory access patterns can leak information. An attacker observing which memory addresses the TEE accesses can infer what data is being processed.

**Oblivious RAM (ORAM):** Ensures that memory access patterns reveal nothing about the actual data being accessed. The TEE shuffles and re-encrypts data on every access.

- **Path ORAM:** Most practical ORAM construction. O(log N) overhead per access. Tree-based structure where each access reads and rewrites an entire path.
- **ZeroTrace:** SGX-specific ORAM implementation (CMU). Provides oblivious memory primitives.
- **mc-oblivious:** MobileCoin's ORAM library for SGX enclaves (Rust, production-grade).

**Performance cost:** ORAM adds 10-100x overhead depending on data size. Use selectively for sensitive operations (credential lookup, key derivation) rather than all memory access.

For the thesis: ORAM is important to mention as a mitigation but may not be needed if the TEE processes each credential independently (no database of credentials inside the enclave).

---

## 6. Addressing Advisor's Design Insights

### 6.1 "No one wants TEE vendor lock-in"

**Solution: TEE Abstraction Layer (Section 3.3)**

Concrete implementation strategy:
1. Define a Rust trait (`TeeRuntime`) that abstracts attestation, key derivation, and I/O.
2. Implement for AWS Nitro first (most accessible, no physical attack vector, Mysten likely uses AWS).
3. Add Intel TDX backend (second priority, strong security).
4. Keep AMD SEV-SNP as future option.
5. Use compile-time feature flags for backend selection.
6. Attestation verification is backend-specific but can be normalized.

**The TEE is replaceable. The application logic is not.**

### 6.2 "No state held by TEE only"

**Solution: Stateless TEE Pattern**

```rust
// The TEE is a pure function: input -> output
// No persistent state inside the enclave

struct StatelessEnclave;

impl StatelessEnclave {
    /// TEE receives encrypted input, processes it, returns encrypted output.
    /// Nothing is retained in memory after processing.
    fn process(&self, request: EncryptedRequest) -> EncryptedResponse {
        // 1. Decrypt request using session key
        let input = self.decrypt(request);

        // 2. Process (verify credential, generate token, etc.)
        let output = self.business_logic(input);

        // 3. Encrypt response
        let response = self.encrypt(output);

        // 4. Zeroize all intermediate state
        input.zeroize();
        output.zeroize();

        response
    }
}
```

**Where does state live?**
- Encrypted on external storage (Walrus, S3, IPFS).
- Keys in external KMS (AWS KMS, onchain escrow via Seal).
- TEE proves its identity via attestation to access keys.
- If TEE dies: spin up a new one with same code = same attestation = same access.

### 6.3 "OK if we lose access to privacy but not to data"

**Solution: Graceful Degradation Architecture**

```
NORMAL OPERATION:
  User -> TEE (privacy) -> Output (unlinkable)
  Data on external storage (encrypted, always accessible)

TEE COMPROMISED / UNAVAILABLE:
  User -> ZKP fallback (slower but still private)
  Data on external storage (still accessible, still encrypted)

TEE VENDOR EXITS / HARDWARE EOL:
  Migrate to different TEE backend (abstraction layer)
  Data on external storage (unaffected)
  Only privacy processing changes, not data layer

CATASTROPHIC FAILURE (all TEEs down, no ZKP capacity):
  User -> Direct onchain (no privacy, but data is accessible)
  Graceful degradation: lose privacy feature, keep functionality
```

**Key architectural principle:** Encryption keys for data at rest must NOT be derived solely from TEE identity. They should be:
- Managed by a multi-party system (Seal's threshold encryption).
- Recoverable without TEE (e.g., social recovery, multisig).
- TEE is a privacy-enhancing layer, not a gatekeeper for data access.

### 6.4 "Lose access to key"

**Solution: Key Hierarchy with TEE as Processing Layer Only**

```
+-------------------------------------------------------------------+
|                       Key Hierarchy                                |
+-------------------------------------------------------------------+
|                                                                    |
|  Master Key (NEVER inside TEE)                                    |
|  +--------------------------------------------------------------+ |
|  | Split via threshold scheme (e.g., Seal's t-of-n)             | |
|  | Shares held by: key servers, user devices, onchain escrow    | |
|  | Recovery: any t shares reconstruct master key                | |
|  +--------------------------------------------------------------+ |
|                              |                                     |
|  Session Keys (ephemeral, inside TEE)                             |
|  +--------------------------------------------------------------+ |
|  | Derived from master key + TEE attestation                     | |
|  | Short-lived (minutes to hours)                                | |
|  | Used for: encryption, signing, token generation               | |
|  | Rotated frequently (forward secrecy)                          | |
|  | If TEE compromised: only current session affected             | |
|  +--------------------------------------------------------------+ |
|                              |                                     |
|  Data Encryption Keys (derived, deterministic)                    |
|  +--------------------------------------------------------------+ |
|  | Derived from master key + data identifier                     | |
|  | Can be re-derived without TEE                                 | |
|  | TEE accelerates derivation but is not required                | |
|  +--------------------------------------------------------------+ |
|                                                                    |
+-------------------------------------------------------------------+
```

**Implementation sketch:**
```rust
// Key derivation: TEE gets session key from KMS, never the master key
async fn initialize_session(tee: &impl TeeRuntime) -> SessionKeys {
    // 1. TEE generates attestation evidence
    let attestation = tee.attest(nonce, user_data)?;

    // 2. Send attestation to KMS (AWS KMS / Seal key servers)
    // KMS verifies TEE identity and code measurements
    let encrypted_session_key = kms.get_session_key(attestation).await?;

    // 3. Decrypt session key inside TEE
    // Only this TEE instance can decrypt (KMS encrypted to TEE's public key)
    let session_key = tee.decrypt(encrypted_session_key)?;

    // 4. Session key has TTL (e.g., 1 hour)
    // After TTL: re-attest and get new key (forward secrecy)
    SessionKeys {
        signing_key: derive(session_key, b"signing"),
        encryption_key: derive(session_key, b"encryption"),
        expires_at: now() + Duration::hours(1),
    }
}
```

---

## 7. Practical Recommendations for the Thesis

### 7.1 Technology Choices

| Component | Recommendation | Rationale |
|-----------|---------------|-----------|
| Primary TEE | AWS Nitro Enclaves | Easiest deployment, no physical attack vector, strong attestation, likely Mysten's cloud. |
| Secondary TEE | Intel TDX | Strongest VM-level security, growing ecosystem, Phala's chosen migration target. |
| Language | Rust | Memory safety, zeroize crate, first-class support in both Nitro and SGX SDKs. |
| Encryption | Seal (IBE + threshold) | Mysten's own tool. Natural integration with Sui onchain policies. |
| Attestation verification | AWS KMS + custom verifier | KMS for Nitro-native; custom verifier for cross-TEE support. |
| ZKP library | Groth16 (arkworks) or Plonk | For fallback/verification path. arkworks is Rust-native. |

### 7.2 What to Build (Thesis Prototype Scope)

1. **TEE abstraction trait** in Rust with Nitro backend.
2. **Anonymous credential processing** inside the enclave: receive encrypted credential, verify, issue pseudonymous token.
3. **Onchain policy integration** via Seal: who can request credential verification.
4. **Attestation verification** by the relying party (smart contract or off-chain verifier).
5. **Graceful degradation** demo: system works (slower) when TEE is unavailable.

### 7.3 Key Risks to Address in the Thesis

1. **SGX is dead for high-security use.** WireTap (2025) demonstrated practical key extraction. Do not build on SGX.
2. **Side-channel attacks remain a concern for all TEEs.** Mitigate with: constant-time code, ORAM for sensitive data access, defense-in-depth with ZKP.
3. **TEE vendor trust is a single point of failure.** Mitigate with: multi-TEE support, threshold trust (require attestation from multiple TEE types), ZKP fallback.
4. **Forward secrecy is essential.** If a TEE is compromised, limit damage to current session. Rotate keys frequently. Do not keep historical data in TEE memory.
5. **Reproducible builds.** To verify that the enclave code matches the attested measurements, builds must be reproducible. This is a solved problem for Nitro (Docker) but harder for SGX.

---

## Sources

### TEE Landscape & Comparison
- [Cisco Confidential Computing Overview](https://www.cisco.com/c/en/us/products/collateral/servers-unified-computing/computing-overview-wp.html)
- [AMD SEV vs Intel TDX vs NVIDIA GPU TEE (Phala)](https://phala.com/learn/AMD-SEV-vs-Intel-TDX-vs-NVIDIA-GPU-TEE)
- [Confidential VMs Explained: AMD SEV-SNP and Intel TDX (ACM)](https://dl.acm.org/doi/10.1145/3700418)
- [TEE Experimental Evaluation: SGX, SEV, TDX (ScienceDirect)](https://www.sciencedirect.com/science/article/pii/S0167404825001464)
- [TEEs: A Primer (a16z Crypto)](https://a16zcrypto.com/posts/article/trusted-execution-environments-tees-primer/)
- [TEE Abstraction as Missing Layer (arXiv)](https://arxiv.org/pdf/2512.22090)

### Intel SGX & TDX
- [Intel TDX Linux Kernel Documentation](https://docs.kernel.org/arch/x86/tdx.html)
- [Intel SGX Deprecation FAQ](https://www.intel.com/content/www/us/en/support/articles/000089326/software/intel-security-products.html)
- [Intel SGX Sealing](https://www.intel.com/content/www/us/en/developer/articles/technical/introduction-to-intel-sgx-sealing.html)
- [Intel PCS API EOL Extended to April 2026](https://community.intel.com/t5/Intel-Software-Guard-Extensions/Intel-PCS-API-versions-2-and-3-EOL-Date-Extended-to-April-30/m-p/1704170)

### AMD SEV-SNP
- [AMD SEV-SNP Whitepaper](https://www.amd.com/content/dam/amd/en/documents/epyc-business-docs/white-papers/SEV-SNP-strengthening-vm-isolation-with-integrity-protection-and-more.pdf)
- [AMD SEV-SNP Performance on EPYC Turin](https://www.techedubyte.com/amd-sev-snp-performance-epyc-9005-turin-servers/)

### ARM CCA
- [ARM CCA Official Page](https://www.arm.com/architecture/security-features/arm-confidential-compute-architecture)
- [ARM CCA Linux Kernel Docs](https://docs.kernel.org/arch/arm64/arm-cca.html)
- [RME Getting Started Guide](https://learn.arm.com/learning-paths/cross-platform/cca_rme/cca/)
- [Elevating Security with ARM CCA (CACM)](https://cacm.acm.org/practice/elevating-security-with-arm-cca/)

### AWS Nitro Enclaves
- [AWS Nitro Enclaves for Blockchain Key Management](https://aws.amazon.com/blogs/web3/aws-nitro-enclaves-for-secure-blockchain-key-management-part-1/)
- [Nitro Attestation Process (GitHub)](https://github.com/aws/aws-nitro-enclaves-nsm-api/blob/main/docs/attestation_process.md)
- [Trail of Bits: Nitro Enclaves Images and Attestation](https://blog.trailofbits.com/2024/02/16/a-few-notes-on-aws-nitro-enclaves-images-and-attestation/)
- [Nitro Enclaves NSM API (Rust)](https://docs.rs/aws-nitro-enclaves-nsm-api)

### NVIDIA Confidential Computing
- [NVIDIA H100 Confidential Computing Blog](https://developer.nvidia.com/blog/confidential-computing-on-h100-gpus-for-secure-and-trustworthy-ai/)
- [NVIDIA H100 CC Whitepaper](https://images.nvidia.com/aem-dam/en-zz/Solutions/data-center/HCC-Whitepaper-v1.0.pdf)
- [Intel + NVIDIA Composite Attestation](https://community.intel.com/t5/Blogs/Products-and-Solutions/Security/Seamless-Attestation-of-Intel-TDX-and-NVIDIA-H100-TEEs-with/post/1525587)

### RISC-V Keystone
- [Keystone Official Site](https://keystone-enclave.org/)
- [Keystone Paper (EuroSys 2020)](https://www.shwetashinde.org/publications/keystone_eurosys20.pdf)

### WireTap Attack
- [WireTap Official Site](https://wiretap.fail/)
- [WireTap Attack Breaks Intel SGX (SecurityWeek)](https://www.securityweek.com/wiretap-attack-breaks-intel-sgx-security/)
- [Phala Response to WireTap](https://phala.com/posts/response-to-wiretap-sgx-deprecation)

### Mysten Labs & Seal
- [Seal Official Site](https://seal.mystenlabs.com/)
- [Seal GitHub Repository](https://github.com/MystenLabs/seal)
- [Seal Mainnet Launch Blog](https://www.mystenlabs.com/blog/seal-mainnet-launch-privacy-access-control)
- [Seal Testnet Launch Blog](https://www.mystenlabs.com/blog/mysten-labs-launches-seal-decentralized-secrets-management-on-testnet)
- [Sui Plans Private Transactions for 2026](https://bitcoinist.com/sui-plans-private-transactions-for-2026/)
- [Decentralized Seal Key Server on Testnet](https://blog.sui.io/introducing-decentralized-seal-key-server-testnet/)
- [Seal SDK Documentation](https://sdk.mystenlabs.com/seal)

### Sui Privacy Research
- [ZK Range Proofs (Mysten Labs Blog)](https://www.mystenlabs.com/blog/zero-knowledge-range-proofs)
- [Groth-Sahai Proofs (Mysten Labs Blog)](https://www.mystenlabs.com/blog/groth-sahai-proofs-zero-to-hero)
- [SoK: ZK Range Proofs (ePrint)](https://eprint.iacr.org/2024/430)

### Blockchain + TEE Projects
- [Secret Network SGX Architecture](https://docs.scrt.network/secret-network-documentation/overview-ecosystem-and-technology/techstack/privacy-technology/intel-sgx)
- [Oasis Sapphire Confidential Smart Contracts](https://docs.chainstack.com/docs/oasis-sapphire-tutorial-understanding-confidential-smart-contracts-with-oasis-sapphire)
- [TEEs in Blockchain (Chainlink)](https://chain.link/article/trusted-execution-environments-blockchain)
- [TEEs and Web3 Overview (Oasis)](https://oasis.net/blog/tees-web3-summary)

### Rust SGX Development
- [Fortanix EDP](https://edp.fortanix.com/)
- [Fortanix rust-sgx GitHub](https://github.com/fortanix/rust-sgx)
- [Apache Teaclave SGX SDK](https://github.com/apache/teaclave-sgx-sdk)
- [Secure Computation in Rust with SGX (LambdaClass)](https://blog.lambdaclass.com/secure-computation-in-rust-using-intels-sgx-instructions-with-teaclave-and-fortanix/)

### TEE-Agnostic Frameworks
- [Enarx Integrity Measurement (Springer)](https://link.springer.com/article/10.1007/s10922-025-09983-4)
- [Confidential Computing Consortium Projects](https://confidentialcomputing.io/projects/current-projects/)
- [Multi-Cloud Confidential Computing (SafeLiShare)](https://safelishare.com/blog/building-multi-cloud-confidential-computing-the-danger-of-cloud-and-data-lock-in/)

### ORAM & Side Channels
- [MobileCoin mc-oblivious (GitHub)](https://github.com/mobilecoinfoundation/mc-oblivious)
- [ZeroTrace: Oblivious Memory for SGX](https://eprint.iacr.org/2017/549.pdf)
- [SGX Published Attacks Survey (arXiv)](https://arxiv.org/pdf/2006.13598)
- [Foreshadow Attack](https://foreshadowattack.eu/)
