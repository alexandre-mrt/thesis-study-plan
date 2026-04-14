/**
 * Ch 2.3 Papers Technical — TEE & Confidential Computing
 * Formal definitions, threat models, and attestation protocols.
 * Paired with ch23-papers-guide.js. KaTeX: \( inline \) \[ display \]
 */

window.CH23_PAPERS_TECH = {
  papers: [
    /* ───────── 1. TEE.Fail ───────── */
    {
      name: 'TEE.Fail',
      formalDefinition:
        'TEE.Fail demonstrates practical side-channel attacks against Intel TDX and AMD SEV-SNP ' +
        'using commodity hardware costing under $1000. The paper formalizes the TEE threat model as: ' +
        'given a TEE enclave \\( E \\) running computation \\( f(x) \\) on secret input \\( x \\), an adversary ' +
        '\\( \\mathcal{A} \\) with physical access can extract \\( x \\) by observing side-channel leakage ' +
        '\\( L(f, x) \\) from power consumption, cache timing, or memory bus signals.',
      mathDetails: [
        {
          subtitle: 'Side-Channel Leakage Model',
          content:
            'The leakage function \\( L: \\mathcal{F} \\times \\mathcal{X} \\to \\mathcal{O} \\) maps ' +
            'computation \\( f \\in \\mathcal{F} \\) on input \\( x \\in \\mathcal{X} \\) to observable ' +
            'signals \\( o \\in \\mathcal{O} \\). The adversary wins if they can construct an extractor ' +
            '\\( \\text{Ext}: \\mathcal{O}^* \\to \\mathcal{X} \\) such that: ' +
            '\\[ \\Pr[\\text{Ext}(L(f, x)^n) = x] \\geq 1 - \\text{negl}(\\lambda) \\] ' +
            'for polynomial \\( n \\) observations. TEE.Fail achieves this with: ' +
            'RAPL power interface (Intel), performance counters, and DDR bus monitoring.'
        },
        {
          subtitle: 'Attack Cost Analysis',
          content:
            'Equipment cost breakdown: DDR4 interposer ($200-400), oscilloscope ($300-500), ' +
            'FPGA for signal processing ($100-200). Total: under $1000. ' +
            'Attack success rate on TDX: key extraction in \\( O(10^6) \\) traces ' +
            '(approximately 30 minutes of observation). ' +
            'Implication for thesis: TEE-only privacy is insufficient. The hybrid model ' +
            '(TEE for computation + ZKP for verification) ensures that even if the TEE ' +
            'is compromised, the ZKP guarantees remain information-theoretically sound.'
        }
      ]
    },

    /* ───────── 2. WireTap ───────── */
    {
      name: 'WireTap: SGX DCAP Key Extraction',
      formalDefinition:
        'WireTap extracts SGX DCAP attestation ECDSA private keys by physically interposing ' +
        'on the DDR4 memory bus. The attack exploits the fact that SGX enclaves on DDR4 systems ' +
        'store encryption keys in memory that traverses the bus in plaintext during specific operations. ' +
        'The extracted key \\( sk_{DCAP} \\) allows forging attestation quotes: ' +
        '\\( \\sigma_{fake} = \\text{Sign}(sk_{DCAP}, \\text{Quote}_{malicious}) \\).',
      mathDetails: [
        {
          subtitle: 'Attack Vector',
          content:
            'The DDR4 interposer captures memory transactions between CPU and DRAM. ' +
            'SGX uses Memory Encryption Engine (MEE) with AES-128-CTR for confidentiality, but ' +
            'the key derivation process leaks the ECDSA signing key \\( sk \\in \\mathbb{Z}_q \\) ' +
            'through observable memory access patterns during the DCAP quoting enclave operations. ' +
            'Extraction time: 45 minutes. Cost: under $1000 in hardware.'
        },
        {
          subtitle: 'Impact on SGX Trust Model',
          content:
            'Post-WireTap, SGX on DDR4 is fundamentally broken for attestation: ' +
            '\\[ \\text{Verify}(pk_{DCAP}, \\sigma, Q) = 1 \\not\\Rightarrow \\text{Authentic}(Q) \\] ' +
            'An attacker can forge quotes for any enclave measurement. ' +
            'Phala Network abandoned SGX after this disclosure. ' +
            'DDR5 with on-die encryption (TME-MK) mitigates this specific vector. ' +
            'Thesis implication: SGX cannot be trusted as a TEE backend; prefer TDX or Nitro.'
        }
      ]
    },

    /* ───────── 3. TDXdown ───────── */
    {
      name: 'TDXdown',
      formalDefinition:
        'TDXdown demonstrates a single-stepping attack against Intel TDX by exploiting a design ' +
        'flaw in the countermeasure meant to prevent instruction-level control. The attack allows ' +
        'an adversary controlling the VMM to execute a TDX guest one instruction at a time, ' +
        'enabling fine-grained side-channel observations.',
      mathDetails: [
        {
          subtitle: 'Single-Stepping Mechanism',
          content:
            'TDX is designed to prevent the host VMM from single-stepping guest code. ' +
            'However, TDXdown shows that by manipulating timer interrupts and APIC configurations, ' +
            'the VMM can force VM exits after each instruction: ' +
            '\\[ \\text{for each instruction } i_k: \\text{VMRESUME} \\to i_k \\to \\text{VMEXIT} \\] ' +
            'This enables cache-timing attacks at instruction granularity, sufficient to ' +
            'extract AES keys in \\( O(n) \\) encryptions where \\( n \\) is the key length in bits.'
        },
        {
          subtitle: 'Countermeasure Limitations',
          content:
            'Intel proposed TSX-based defenses (detecting interrupts within transactions), ' +
            'but TDXdown bypasses these by triggering exits through architectural events that ' +
            'cannot be suppressed. The fundamental issue: the VMM controls the hardware timer ' +
            'and interrupt delivery, which is inherent to the virtualization trust model. ' +
            'Mitigation requires hardware changes (e.g., secure timers inside the TEE).'
        }
      ]
    },

    /* ───────── 4. Intel TDX Architecture ───────── */
    {
      name: 'Intel TDX Architecture',
      formalDefinition:
        'Intel Trust Domain Extensions (TDX) provides hardware-isolated virtual machines ' +
        'called Trust Domains (TDs). The trust model removes the VMM from the TCB: ' +
        '\\( \\text{TCB}_{TDX} = \\{\\text{CPU}, \\text{TDX Module}, \\text{TD}\\} \\). ' +
        'Memory encryption uses AES-128-XTS with per-TD keys managed by the TDX module.',
      mathDetails: [
        {
          subtitle: 'Attestation Protocol',
          content:
            'TDX attestation produces a quote \\( Q \\) binding the TD measurement to ' +
            'the hardware root of trust: ' +
            '\\[ Q = \\text{Sign}(sk_{QE}, (\\text{MRTD}, \\text{RTMR}, \\text{ReportData})) \\] ' +
            'where \\( \\text{MRTD} \\) is the TD build measurement (code + config), ' +
            '\\( \\text{RTMR} \\) captures runtime measurements, and \\( \\text{ReportData} \\) ' +
            'contains application-specific data (e.g., a public key for secure channels). ' +
            'Verification: \\( \\text{Verify}(pk_{Intel}, \\text{CertChain}, Q) \\stackrel{?}{=} 1 \\).'
        },
        {
          subtitle: 'Memory Encryption',
          content:
            'Each TD gets a unique encryption key \\( k_{TD} \\) derived by the hardware: ' +
            '\\[ \\text{Enc}(k_{TD}, \\text{addr}, \\text{data}) \\to \\text{ciphertext} \\] ' +
            'using AES-128-XTS with the physical address as tweak. ' +
            'The VMM sees only ciphertext in DRAM. Integrity is protected via ' +
            'MAC trees (TD Partitioning with integrity). ' +
            'Key limitation: keys reside in CPU package — physical attacks on the memory bus ' +
            '(as in TEE.Fail) observe ciphertext, not plaintext.'
        }
      ]
    },

    /* ───────── 5. ARM CCA ───────── */
    {
      name: 'ARM CCA (Confidential Compute Architecture)',
      formalDefinition:
        'ARM Confidential Compute Architecture introduces Realms — isolated execution ' +
        'environments managed by the Realm Management Monitor (RMM) running at EL2. ' +
        'Unlike TDX, CCA targets mobile/edge devices with the Arm v9 ISA. ' +
        'Trust model: \\( \\text{TCB}_{CCA} = \\{\\text{Hardware}, \\text{RMM}, \\text{Realm}\\} \\).',
      mathDetails: [
        {
          subtitle: 'Realm Architecture',
          content:
            'CCA adds a new security state (Realm world) alongside Secure and Normal worlds. ' +
            'Memory is tagged with Granule Protection Tables (GPT) at EL3: ' +
            '\\[ \\text{GPT}(\\text{PA}) \\in \\{\\text{Normal}, \\text{Secure}, \\text{Realm}, \\text{Root}\\} \\] ' +
            'Hardware enforces that Normal-world software cannot access Realm memory. ' +
            'Attestation uses the CCA attestation token (EAT profile) signed by the ' +
            'platform root of trust.'
        },
        {
          subtitle: 'Mobile Relevance for Thesis',
          content:
            'CCA is relevant because the thesis targets mobile-friendly credential operations. ' +
            'If anonymous credential issuance or presentation requires TEE assistance, ' +
            'CCA-enabled smartphones could run the credential protocol inside a Realm. ' +
            'Key advantage over TDX: CCA is designed for power-constrained devices. ' +
            'Key limitation: no production deployments yet (as of 2026), limited tooling.'
        }
      ]
    },

    /* ───────── 6. TCU ───────── */
    {
      name: 'Trusted Compute Units (TCU)',
      formalDefinition:
        'TCU proposes a framework composing TEE and zkVM for verifiable off-chain computation. ' +
        'The core idea: TEE provides fast execution with attestation, while a zkVM generates ' +
        'a succinct proof \\( \\pi \\) that the TEE output is correct. The on-chain verifier checks ' +
        '\\( \\pi \\) without trusting the TEE: ' +
        '\\[ \\text{Verify}(\\text{vk}, \\pi, (x, y)) = 1 \\iff f(x) = y \\]',
      mathDetails: [
        {
          subtitle: 'Composition Architecture',
          content:
            'The TCU pipeline: ' +
            '\\[ x \\xrightarrow{\\text{input}} \\text{TEE}(f, x) \\xrightarrow{(y, \\text{att})} ' +
            '\\text{zkVM}(\\text{att}, x, y) \\xrightarrow{\\pi} \\text{On-chain Verifier} \\] ' +
            'The TEE executes \\( f(x) = y \\) efficiently and produces an attestation. ' +
            'The zkVM takes the attestation as witness and generates proof \\( \\pi \\). ' +
            'Even if the TEE is compromised, the zkVM proof ensures \\( f(x) = y \\) was computed correctly ' +
            '(assuming the zkVM is sound).'
        },
        {
          subtitle: 'Thesis Application',
          content:
            'TCU is the closest existing architecture to the thesis design: ' +
            'TEE handles credential issuance (fast, needs secrets) while ZKP proves ' +
            'credential validity on Sui (trustless verification). ' +
            'Key difference: thesis uses TEE for computation + auditing (not just attestation), ' +
            'and the ZKP is generated by the user (not the TEE operator). ' +
            'Performance: TEE execution ~1ms, ZKP generation ~1-10s, on-chain verification ~1ms.'
        }
      ]
    },

    /* ───────── 7. TeeRollup ───────── */
    {
      name: 'TeeRollup',
      formalDefinition:
        'TeeRollup designs a rollup using heterogeneous TEEs (mixing TDX, SEV-SNP, Nitro) ' +
        'to tolerate compromise of any single TEE vendor. The security model requires ' +
        '\\( k \\)-of-\\( n \\) TEE agreement where TEEs are from at least \\( t \\) distinct vendors: ' +
        '\\[ \\text{Valid}(\\text{batch}) \\iff |\\{\\text{TEE}_i : \\text{Attest}_i(\\text{batch}) = 1\\}| \\geq k ' +
        '\\wedge |\\text{Vendors}| \\geq t \\]',
      mathDetails: [
        {
          subtitle: 'Heterogeneous Trust Model',
          content:
            'Unlike single-vendor TEE designs, TeeRollup assumes each vendor \\( V_j \\) ' +
            'may be independently compromised with probability \\( p_j \\). ' +
            'The probability of system compromise is: ' +
            '\\[ P_{\\text{fail}} = \\prod_{S \\subseteq V, |S| \\geq k} \\prod_{j \\in S} p_j \\] ' +
            'With \\( n = 5 \\) TEEs across 3 vendors and \\( k = 3 \\), even if one vendor ' +
            'is fully compromised, the system remains secure.'
        },
        {
          subtitle: 'Thesis Threat Model Integration',
          content:
            'TeeRollup informs the thesis threat model: rather than trusting a single TEE, ' +
            'the credential issuance protocol can require multi-TEE attestation. ' +
            'Trade-off: latency increases with \\( k \\) (need \\( k \\) attestations per batch) ' +
            'but security improves exponentially against vendor-level compromise.'
        }
      ]
    },

    /* ───────── 8. ZLiTE ───────── */
    {
      name: 'ZLiTE: Lightweight TEE for Zcash',
      formalDefinition:
        'ZLiTE uses a TEE to run a lightweight Zcash client that can verify shielded ' +
        'transactions without downloading the full blockchain. The TEE maintains a ' +
        'pruned state \\( S_{\\text{lite}} \\subset S_{\\text{full}} \\) and verifies ' +
        'Groth16 proofs \\( \\pi \\) of transaction validity inside the enclave.',
      mathDetails: [
        {
          subtitle: 'Lightweight Verification',
          content:
            'Instead of maintaining the full UTXO set, ZLiTE keeps only: ' +
            '\\[ S_{\\text{lite}} = (\\text{NullifierSet}, \\text{CommitmentTreeRoot}, \\text{BlockHeaders}) \\] ' +
            'For each shielded transaction with proof \\( \\pi \\) and public inputs \\( x \\): ' +
            '\\[ \\text{TEE.Verify}(\\text{vk}_{Groth16}, \\pi, x) \\wedge ' +
            '\\text{nf} \\notin \\text{NullifierSet} \\] ' +
            'The TEE attestation certifies the verification result to external parties.'
        },
        {
          subtitle: 'TEE + ZKP Synergy',
          content:
            'ZLiTE demonstrates that TEE and ZKP are complementary: ' +
            'ZKPs provide transaction privacy (amount, sender, receiver hidden), ' +
            'TEE provides efficient verification without full node requirements. ' +
            'This is analogous to the thesis design where ZKPs hide credential attributes ' +
            'and TEE handles efficient batch verification and auditing.'
        }
      ]
    },

    /* ───────── 9. TEE + zkTLS ───────── */
    {
      name: 'TEE + zkTLS for Lightning Network (Hot/Cold Proofs)',
      formalDefinition:
        'This paper introduces the "Hot Proofs / Cold Proofs" distinction for Lightning Network ' +
        'channel management: Hot Proofs are generated inside a TEE for real-time channel updates ' +
        '(millisecond latency), while Cold Proofs are ZKPs posted on-chain for dispute resolution ' +
        '(higher latency but trustless).',
      mathDetails: [
        {
          subtitle: 'Hot/Cold Proof Architecture',
          content:
            'Hot Proofs (TEE-generated, real-time): ' +
            '\\[ \\pi_{\\text{hot}} = \\text{TEE.Sign}(sk_{TEE}, (\\text{state}_i, \\text{state}_{i+1})) \\] ' +
            'Latency: ~1ms. Trust: TEE attestation. ' +
            'Cold Proofs (ZKP, on-chain dispute): ' +
            '\\[ \\pi_{\\text{cold}} = \\text{Prove}(\\text{crs}, (\\text{state}_i, \\text{state}_{i+1}), w) \\] ' +
            'Latency: ~10s. Trust: cryptographic soundness. ' +
            'The system uses hot proofs during normal operation and falls back to cold proofs ' +
            'when the TEE is unavailable or disputed.'
        },
        {
          subtitle: 'Thesis Analogy',
          content:
            'This hot/cold distinction maps directly to the thesis: ' +
            'credential presentation could use TEE-assisted fast verification (hot path) ' +
            'with ZKP fallback for on-chain verification (cold path). ' +
            'Normal flow: TEE verifies credential + issues attestation (~1ms). ' +
            'Dispute/audit flow: user generates ZKP of credential validity (~1-10s) ' +
            'verified on Sui without TEE involvement.'
        }
      ]
    },

    /* ───────── 10. zkFL-Health ───────── */
    {
      name: 'zkFL-Health: ZKP + TEE for Verifiable Privacy',
      formalDefinition:
        'zkFL-Health combines Halo 2 / Nova ZKP systems with TEE (SGX) for privacy-preserving ' +
        'federated learning in healthcare. The TEE executes model training on private data, ' +
        'and the ZKP proves the training was performed correctly without revealing the data. ' +
        'Results are logged to a blockchain audit trail.',
      mathDetails: [
        {
          subtitle: 'Architecture Pattern',
          content:
            'The three-layer architecture: ' +
            '\\[ \\text{Data} \\xrightarrow{\\text{TEE}} \\text{Model Update} ' +
            '\\xrightarrow{\\text{ZKP}} \\pi_{\\text{correct}} ' +
            '\\xrightarrow{\\text{Blockchain}} \\text{Audit Log} \\] ' +
            'TEE provides computation privacy (data never leaves enclave). ' +
            'ZKP provides verifiability (anyone can check the proof). ' +
            'Blockchain provides immutable audit trail. ' +
            'This is the same TEE-for-computation, ZKP-for-proof, blockchain-for-audit ' +
            'pattern that the thesis adopts for anonymous credentials.'
        },
        {
          subtitle: 'Performance Characteristics',
          content:
            'Halo 2 proof generation: ~5-30s depending on circuit size. ' +
            'Nova recursive proofs: amortized ~100ms per step (IVC). ' +
            'TEE computation: ~10-100ms for model update. ' +
            'On-chain verification: ~1ms (constant time). ' +
            'The bottleneck is ZKP generation, which is acceptable for ' +
            'batch operations (credential issuance) but may be too slow for ' +
            'real-time operations (credential presentation at point-of-sale).'
        }
      ]
    }
  ]
};
