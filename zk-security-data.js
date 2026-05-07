/**
 * ZK Security Audit — Data
 * Attack vectors, circuit pitfalls, production exploits, security notions,
 * and design decisions for building ZK-based anonymous credentials.
 */

window.ZK_SECURITY_DATA = {
  categories: [

    /* ================================================================
     * CATEGORY 0: ZK Security Notions
     * ================================================================ */
    {
      id: 'notions',
      title: 'ZK Security Notions',
      icon: '🛡️',
      description: 'Foundational security properties every ZK system must satisfy. Understand these before auditing anything.',
      items: [
        {
          name: 'Soundness vs Knowledge Soundness',
          severity: 'info',
          tags: ['theory', 'foundation'],
          description:
            '<p><strong>Soundness:</strong> a cheating prover cannot convince the verifier of a false statement ' +
            '(except with negligible probability). Formally: if \\(x \\notin L\\), no prover strategy succeeds.</p>' +
            '<p><strong>Knowledge soundness:</strong> stronger — there exists an <em>extractor</em> that, given ' +
            'access to a successful prover, can extract the witness \\(w\\). This means the prover must "know" ' +
            'the witness, not just be lucky.</p>',
          diagram:
            'SOUNDNESS                          KNOWLEDGE SOUNDNESS\n' +
            '──────────                         ────────────────────\n' +
            'False statement → proof fails       Proof passes → extractor can recover w\n' +
            '"You cannot fake it"               "If you proved it, you KNOW the secret"\n' +
            '\n' +
            'Example:                            Example:\n' +
            'Cannot prove age≥18 if age=15      If proof of valid credential passes,\n' +
            '                                    extractor can recover the credential σ\n' +
            '\n' +
            'THESIS: Groth16 provides knowledge soundness\n' +
            '→ a valid proof guarantees the prover knows a real BBS+ credential',
          impact: 'If soundness breaks, the entire system is compromised — anyone can prove false statements (fake credentials, forged payments).',
          mitigation: 'Use proof systems with proven knowledge soundness (Groth16, PLONK). Ensure the circuit correctly encodes the statement — soundness of the proof system does not help if the circuit is wrong.'
        },
        {
          name: 'Zero-Knowledge: Simulation Paradigm',
          severity: 'info',
          tags: ['theory', 'privacy'],
          description:
            '<p>A proof system is <strong>zero-knowledge</strong> if there exists a <em>simulator</em> that, ' +
            'without knowing the witness, produces transcripts <strong>indistinguishable</strong> from real proofs. ' +
            'This means the proof reveals nothing beyond the truth of the statement.</p>' +
            '<p>Three flavors:</p>' +
            '<ul>' +
            '<li><strong>Perfect ZK:</strong> simulator output is identical to real (Pedersen commitments)</li>' +
            '<li><strong>Statistical ZK:</strong> statistically close (Bulletproofs)</li>' +
            '<li><strong>Computational ZK:</strong> indistinguishable for polynomial-time adversaries (Groth16)</li>' +
            '</ul>',
          diagram:
            'REAL PROOF                     SIMULATED PROOF\n' +
            '──────────                     ───────────────\n' +
            'Prover(x, w) ↔ Verifier       Simulator(x) → fake transcript\n' +
            'Uses actual witness w          Uses NO witness (only statement x)\n' +
            '\n' +
            '  If these are indistinguishable → ZERO KNOWLEDGE\n' +
            '  → The proof leaked nothing about w\n' +
            '\n' +
            'THESIS: if a Sui observer cannot distinguish a real credential\n' +
            'proof from a simulated one, the credential attributes are hidden.',
          impact: 'If ZK breaks, the verifier (or an observer) can extract information about hidden credential attributes — defeating the privacy goal.',
          mitigation: 'Use well-analyzed proof systems. Ensure randomness in proof generation is truly random — deterministic proofs or reused randomness can leak the witness.'
        },
        {
          name: 'What to Prove, How to Verify, Where to Generate',
          severity: 'info',
          tags: ['design', 'architecture'],
          description:
            '<p>Three critical design decisions for any ZK application:</p>' +
            '<h4>1. WHAT to prove (statement design)</h4>' +
            '<ul>' +
            '<li>Prove the <strong>minimum necessary</strong>: "credential is valid AND age≥18" — not the full credential</li>' +
            '<li>Include all security-critical checks IN the circuit: nullifier derivation, Merkle membership, signature verification</li>' +
            '<li>If it is not in the circuit, it is not proven — a common source of bugs</li>' +
            '</ul>' +
            '<h4>2. HOW to verify (on-chain vs off-chain)</h4>' +
            '<ul>' +
            '<li><strong>On-chain (Sui Move):</strong> Groth16 pairing check = 3 pairings = ~10ms, ~288B proof. Trustless. Anyone can verify.</li>' +
            '<li><strong>Off-chain (TEE):</strong> can verify larger proofs (lattice, STARKs). Cheaper. But requires trust in TEE hardware.</li>' +
            '<li><strong>Hybrid:</strong> TEE batch-verifies N proofs, posts one attestation on-chain. Best throughput.</li>' +
            '</ul>' +
            '<h4>3. WHERE to generate (client vs server)</h4>' +
            '<ul>' +
            '<li><strong>Client-side (wallet):</strong> witness never leaves user device. Maximum privacy. But slow on mobile (~500ms-2s for 100K constraints).</li>' +
            '<li><strong>Server-side (delegated):</strong> faster (GPU, dedicated hardware). But server sees the witness — destroys ZK property. Only acceptable if server is a TEE.</li>' +
            '<li><strong>Split proving:</strong> client commits to witness, server assists with heavy computation (e.g., MSM). Witness privacy preserved via homomorphic commitments.</li>' +
            '</ul>',
          diagram:
            'DESIGN DECISION MATRIX\n' +
            '─────────────────────────────────────────────────────────────\n' +
            '                  Client-side       TEE-assisted     Server-side\n' +
            'Privacy:          ★★★★★             ★★★★             ★★ (sees witness)\n' +
            'Speed (mobile):   ★★                ★★★★★            ★★★★★\n' +
            'Trust model:      Trustless          Hardware trust   Full trust\n' +
            'Proof systems:    Groth16, PLONK     Any (incl STARK) Any\n' +
            '─────────────────────────────────────────────────────────────\n' +
            '\n' +
            'THESIS ARCHITECTURE:\n' +
            '┌──────────────┐     ┌──────────────┐     ┌──────────┐\n' +
            '│ User Wallet  │────▸│  TEE Auditor  │────▸│   Sui    │\n' +
            '│ Client-side  │     │  Batch verify │     │ On-chain │\n' +
            '│ Groth16 prove│     │  Post attest  │     │ Verify   │\n' +
            '└──────────────┘     └──────────────┘     └──────────┘\n' +
            '  Witness stays       TEE sees proofs      Only sees\n' +
            '  on device            not witnesses         attestation',
          impact: 'Wrong design decisions can either destroy privacy (server-side proving) or make the system unusable (client-side STARK proving on mobile).',
          mitigation: 'For the thesis: client-side Groth16 for individual proofs (~500ms mobile), TEE-assisted batch verification for throughput, on-chain Groth16 verification for trustless settlement.'
        }
      ]
    },

    /* ================================================================
     * CATEGORY 1: Circuit-Level Vulnerabilities
     * ================================================================ */
    {
      id: 'circuit',
      title: 'Circuit-Level Vulnerabilities',
      icon: '⚡',
      description: 'Bugs in the constraint system itself — the #1 source of ZK security issues. ~96% of all documented SNARK bugs are under-constrained circuits.',
      items: [
        {
          name: 'Under-Constrained Circuits',
          severity: 'critical',
          tags: ['circuit', 'R1CS', 'most-common'],
          description:
            '<p>The dominant ZK bug class. A circuit is <strong>under-constrained</strong> when it accepts ' +
            'witnesses that should be invalid — because a necessary constraint is missing. The prover can ' +
            'assign arbitrary values to unconstrained variables and forge proofs.</p>' +
            '<p>From ePrint 2024/514: <strong>~96% of documented SNARK circuit bugs</strong> are under-constrained.</p>',
          vulnerable_code:
            '// CIRCOM: missing constraint on hash output\n' +
            'template BadMerkle() {\n' +
            '    signal input leaf;\n' +
            '    signal input sibling;\n' +
            '    signal output root;\n' +
            '    component h = Poseidon(2);\n' +
            '    h.inputs[0] <-- leaf;      // ← ASSIGNMENT ONLY, no constraint!\n' +
            '    h.inputs[1] <-- sibling;   // ← ASSIGNMENT ONLY!\n' +
            '    root <== h.out;\n' +
            '    // BUG: leaf and sibling are not constrained to the hash inputs\n' +
            '    // Prover can set leaf to ANY value and still produce valid root\n' +
            '}',
          fixed_code:
            '// CIRCOM: properly constrained\n' +
            'template GoodMerkle() {\n' +
            '    signal input leaf;\n' +
            '    signal input sibling;\n' +
            '    signal output root;\n' +
            '    component h = Poseidon(2);\n' +
            '    h.inputs[0] <== leaf;      // ← ASSIGN + CONSTRAIN\n' +
            '    h.inputs[1] <== sibling;   // ← ASSIGN + CONSTRAIN\n' +
            '    root <== h.out;\n' +
            '}',
          impact: 'Prover forges proofs for false statements. In a credential system: fake credentials pass verification. In a payment system: mint infinite tokens.',
          mitigation: 'Use <== not <-- in Circom. Run circomspect (Trail of Bits) for static analysis. Use --inspect flag. For arkworks: every FpVar must participate in an enforce_equal or enforce_constraint call.',
          references: '<a href="https://github.com/0xPARC/zk-bug-tracker">0xPARC ZK Bug Tracker</a> · <a href="https://eprint.iacr.org/2024/514">ePrint 2024/514</a>'
        },
        {
          name: 'Tornado Cash: The <-- vs <== Bug',
          severity: 'critical',
          year: '2019',
          tags: ['exploit', 'circom', 'real-world'],
          description:
            '<p>Kobi Gurkan discovered that the MiMC hash implementation in circomlib used <code>&lt;--</code> ' +
            '(assignment only) instead of <code>&lt;==</code> (assignment + constraint). An attacker could fake ' +
            'the Merkle root and withdraw deposits without ever having deposited.</p>' +
            '<p>The Tornado Cash team <strong>white-hat exploited their own contract</strong>, migrated all user funds ' +
            'to a new contract with the fix, and preserved user anonymity throughout.</p>',
          diagram:
            'ATTACK FLOW:\n' +
            '1. Attacker creates a fake Merkle proof with arbitrary leaf\n' +
            '2. MiMC hash uses <-- so leaf value is NOT constrained\n' +
            '3. Prover sets leaf = attacker_address (never deposited)\n' +
            '4. Circuit computes hash correctly but from WRONG inputs\n' +
            '5. Proof verifies ✓ → attacker withdraws 0.1 ETH\n' +
            '\n' +
            'ROOT CAUSE: one character difference\n' +
            '  h.inputs[0] <-- leaf     ← BUG (no constraint)\n' +
            '  h.inputs[0] <== leaf     ← FIX (constrained)',
          impact: 'Full fund theft from the Tornado Cash pool. White-hat prevented actual exploitation.',
          mitigation: 'Never use <-- without a separate constraint. Static analysis with circomspect catches this pattern.',
          references: '<a href="https://tornado-cash.medium.com/tornado-cash-got-hacked-by-us-b1e012a3c9a8">Tornado Cash Post-Mortem</a>'
        },
        {
          name: 'Zcash Sapling: Infinite Counterfeiting (CVE-2019-7167)',
          severity: 'critical',
          year: '2018',
          tags: ['exploit', 'zcash', 'trusted-setup'],
          description:
            '<p>Ariel Gabizon discovered a flaw in the BCTV14 zk-SNARK construction (March 2018) that allowed ' +
            '<strong>infinite counterfeiting of shielded ZEC</strong> — completely undetectable on-chain. ' +
            'The bug: a toxic waste element from the trusted setup leaked into the verification key in a way ' +
            'that let anyone forge proofs.</p>' +
            '<p>Fixed secretly in the Sapling upgrade (Oct 28, 2018). Disclosed publicly Feb 5, 2019. ' +
            '<strong>No exploitation was detected</strong> — but it would have been undetectable if it had occurred.</p>',
          diagram:
            'BCTV14 TRUSTED SETUP BUG:\n' +
            '─────────────────────────\n' +
            'Setup generates: alpha, beta, gamma, delta, tau (toxic waste)\n' +
            'Verification key contains: [alpha*beta]_T, [gamma]_2, [delta]_2, ...\n' +
            '\n' +
            'BUG: an extra element in the VK let an attacker compute\n' +
            '     a "universal forgery key" from public parameters alone\n' +
            '\n' +
            'ATTACK:  forge any proof π for any statement x\n' +
            '         → mint unlimited ZEC in the shielded pool\n' +
            '         → completely undetectable (valid proofs!)\n' +
            '\n' +
            'FIX: Sapling uses Groth16 (different construction)\n' +
            '     → no extra VK elements → no forgery path',
          impact: 'Potential unlimited inflation of the ZEC supply. The most severe ZK vulnerability ever found in production.',
          mitigation: 'Use well-audited proof systems (Groth16, not BCTV14). Multiple independent audits of the trusted setup ceremony. Circuit-specific formal verification.',
          references: '<a href="https://nvd.nist.gov/vuln/detail/cve-2019-7167">CVE-2019-7167</a>'
        },
        {
          name: 'Nondeterministic Circuits',
          severity: 'high',
          tags: ['circuit', 'soundness'],
          description:
            '<p>A circuit is <strong>nondeterministic</strong> when multiple valid witnesses exist for the same ' +
            'public input. This is dangerous when the application assumes a unique witness (e.g., a unique ' +
            'nullifier derivation). If the circuit allows two different witnesses to produce the same nullifier, ' +
            'double-spending becomes possible.</p>',
          vulnerable_code:
            '// ARKWORKS: nondeterministic square root\n' +
            '// BUG: both +sqrt and -sqrt satisfy x*x == y\n' +
            'let x = FpVar::new_witness(cs, || Ok(val.sqrt().unwrap()))?;\n' +
            'let y = FpVar::new_input(cs, || Ok(val))?;\n' +
            '(&x * &x).enforce_equal(&y)?;\n' +
            '// Missing: constrain x to the POSITIVE root',
          fixed_code:
            '// FIX: enforce canonical form (e.g., x < p/2)\n' +
            'let x = FpVar::new_witness(cs, || Ok(val.sqrt().unwrap()))?;\n' +
            'let y = FpVar::new_input(cs, || Ok(val))?;\n' +
            '(&x * &x).enforce_equal(&y)?;\n' +
            '// Enforce x is the canonical (positive) square root\n' +
            'enforce_less_than_half_prime(&x)?;',
          impact: 'Multiple valid proofs for the same statement may enable double-spending or linkability attacks.',
          mitigation: 'Ensure circuit determinism: for every public input, there must be exactly one valid witness. Use Picus (Veridise) to formally verify uniqueness.'
        }
      ]
    },

    /* ================================================================
     * CATEGORY 2: Protocol-Level Issues
     * ================================================================ */
    {
      id: 'protocol',
      title: 'Protocol-Level Issues',
      icon: '🔗',
      description: 'Vulnerabilities in the proof system protocol itself — Fiat-Shamir mistakes, trusted setup attacks, replay issues.',
      items: [
        {
          name: 'Frozen Heart: Weak Fiat-Shamir Implementations',
          severity: 'critical',
          year: '2022',
          tags: ['fiat-shamir', 'multi-party', 'trail-of-bits'],
          description:
            '<p>Trail of Bits (April 2022) disclosed <strong>Frozen Heart</strong>: a class of bugs where ' +
            'public commitments were omitted from the Fiat-Shamir hash transcript. Affected <strong>8 organizations</strong> ' +
            '(ZenGo, Dusk Network, Iden3/Hermez, ConsenSys, ING Bank, SECBIT Labs, Adjoint) across Bulletproofs, ' +
            'PlonK, and Girault\'s proof.</p>' +
            '<p>Follow-up research (ePrint 2023/691) found <strong>36 weak Fiat-Shamir implementations across ' +
            '12 proof systems</strong>, with novel soundness attacks on Bulletproofs, Plonk, Spartan, and ' +
            'Wesolowski\'s VDF.</p>',
          diagram:
            'FIAT-SHAMIR: Interactive → Non-Interactive\n' +
            '────────────────────────────────────────────\n' +
            'CORRECT:  challenge = H(commitment || statement || all_prior_messages)\n' +
            'WEAK:     challenge = H(commitment)           ← MISSING statement!\n' +
            'BROKEN:   challenge = H(statement)            ← MISSING commitment!\n' +
            '\n' +
            'ATTACK on WEAK variant:\n' +
            '1. Prover picks desired challenge c\n' +
            '2. Computes commitment R that hashes to c   (since only R is hashed)\n' +
            '3. Forges response s for any statement\n' +
            '→ Proof verifies for a FALSE statement!\n' +
            '\n' +
            'FROZEN HEART: commitments omitted from transcript\n' +
            '→ prover controls the challenge → forges proofs',
          impact: 'One instance could have enabled unlimited currency creation in a private blockchain.',
          mitigation: 'Hash EVERYTHING into the Fiat-Shamir transcript: all commitments, the full statement, domain separator, and protocol version. Use established transcript libraries (Merlin in Rust).',
          references: '<a href="https://blog.trailofbits.com/2022/04/13/part-1-coordinated-disclosure-of-vulnerabilities-affecting-girault-bulletproofs-and-plonk/">Trail of Bits Frozen Heart</a> · <a href="https://eprint.iacr.org/2023/691">ePrint 2023/691</a>'
        },
        {
          name: 'Groth16 Trusted Setup: Phase 2 Skipped',
          severity: 'critical',
          year: '2026',
          tags: ['trusted-setup', 'groth16', 'exploit'],
          description:
            '<p>Two real-world exploits in February 2026 resulted from <strong>skipping Groth16 Phase 2</strong> ' +
            'of the trusted setup:</p>' +
            '<ul>' +
            '<li><strong>Foom Protocol (~$1.4M, Base + Ethereum):</strong> gamma and delta were set to the same G2 generator, ' +
            'collapsing soundness. Attackers forged proofs from fabricated inputs.</li>' +
            '<li><strong>Veil Protocol (~5 ETH, Base):</strong> Tornado Cash fork with the same Phase 2 skip. Entire pool drained.</li>' +
            '</ul>',
          diagram:
            'GROTH16 SETUP HAS TWO PHASES:\n' +
            '─────────────────────────────\n' +
            'Phase 1 (Powers of Tau): generates universal SRS\n' +
            '  → shared across all circuits\n' +
            '  → large community ceremony (safe)\n' +
            '\n' +
            'Phase 2 (Circuit-specific): generates pk, vk for YOUR circuit\n' +
            '  → gamma, delta must be FRESH random values\n' +
            '  → MUST be done per-circuit\n' +
            '\n' +
            'IF PHASE 2 SKIPPED:\n' +
            '  gamma = delta = G2_generator\n' +
            '  → verification equation degenerates\n' +
            '  → attacker computes C = -vk_x\n' +
            '  → proof (A=0, B=0, C=-vk_x) verifies for ANY statement\n' +
            '  → TOTAL SOUNDNESS BREAK',
          impact: '$1.4M+ stolen across two protocols. Complete soundness failure — any statement is provable.',
          mitigation: 'ALWAYS complete both phases. Verify that gamma ≠ delta ≠ G2_generator in the verification key. Use snarkjs groth16 setup which runs both phases. Automate VK validation in deployment scripts.',
          references: '<a href="https://blog.zksecurity.xyz/posts/groth16-setup-exploit/">zkSecurity: First ZK Exploits (Feb 2026)</a>'
        },
        {
          name: 'Solana: Phantom Challenge in ZK ElGamal',
          severity: 'critical',
          year: '2025',
          tags: ['fiat-shamir', 'solana', 'real-world'],
          description:
            '<p>zkSecurity discovered (June 2025) that in Solana\'s confidential transfer program, a prover-generated ' +
            'challenge in a sigma OR-proof was <strong>not absorbed into the Fiat-Shamir transcript</strong>. ' +
            'This allowed arbitrary minting/burning of SPL tokens using confidential transfers.</p>' +
            '<p>The ZK ElGamal Proof Program was disabled at runtime. No in-the-wild exploit occurred.</p>',
          impact: 'Unlimited minting/burning of any SPL token using confidential transfers.',
          mitigation: 'In OR-proofs and sigma protocols, ALL challenges (including prover-generated ones) must be included in the transcript. Formal verification of Fiat-Shamir transcripts.',
          references: '<a href="https://blog.zksecurity.xyz/posts/solana-phantom-challenge-bug/">zkSecurity: Solana Phantom Challenge Bug</a>'
        },
        {
          name: 'Proof Replay and Front-Running',
          severity: 'high',
          tags: ['replay', 'front-running', 'nullifier'],
          description:
            '<p>ZK proofs without nonces or context binding are <strong>replayable</strong>: a valid proof can be ' +
            'submitted multiple times or in different contexts.</p>' +
            '<p><strong>Front-running:</strong> in a public mempool, an attacker sees a ZK proof transaction and ' +
            'submits it first with a higher gas price, stealing the associated action (e.g., claiming an airdrop).</p>',
          diagram:
            'REPLAY ATTACK:\n' +
            '1. Alice submits proof π for "I own credential C"\n' +
            '2. Bob copies π and submits it in a different context\n' +
            '3. If no domain separation → proof is valid in both contexts!\n' +
            '\n' +
            'FRONT-RUNNING:\n' +
            '1. Alice submits tx with proof π to mempool\n' +
            '2. Attacker sees π, creates tx with π + higher gas\n' +
            '3. Attacker\'s tx lands first → claims Alice\'s reward\n' +
            '\n' +
            'MITIGATIONS:\n' +
            '→ Bind proof to sender address (public input)\n' +
            '→ Include nonce / block height in statement\n' +
            '→ Nullifiers with domain separation (topic tag)\n' +
            '→ Commit-reveal scheme for front-running protection',
          impact: 'Double-spending, unauthorized action replay, stolen rewards.',
          mitigation: 'Bind proofs to sender address as public input. Use nullifiers with domain-specific derivation. For front-running: use commit-reveal or encrypted mempools.'
        }
      ]
    },

    /* ================================================================
     * CATEGORY 3: Production Exploits Timeline
     * ================================================================ */
    {
      id: 'exploits',
      title: 'Production Exploits',
      icon: '💥',
      description: 'Real-world ZK exploits with dates, amounts, and root causes. Learn from what actually broke.',
      items: [
        {
          name: 'Foom Protocol — $1.4M (Feb 2026)',
          severity: 'critical',
          year: '2026',
          tags: ['groth16', 'setup', 'base', 'ethereum'],
          description:
            '<p>White-hat exploit on Base and Ethereum. Groth16 Phase 2 setup was never completed — ' +
            'gamma and delta were both set to the same G2 generator point, collapsing soundness entirely. ' +
            'Attackers computed vk_x from fabricated inputs and set C = -vk_x to forge proofs.</p>' +
            '<p>The bug bounty had been live since June 27, 2025.</p>',
          impact: '~$1.4M drained. Complete soundness failure.',
          mitigation: 'Verify VK parameters: gamma ≠ delta ≠ G2.generator(). Automate this check in CI.',
          references: '<a href="https://blog.zksecurity.xyz/posts/groth16-setup-exploit/">zkSecurity Analysis</a>'
        },
        {
          name: 'Veil Protocol — Pool Drained (Feb 2026)',
          severity: 'critical',
          year: '2026',
          tags: ['groth16', 'setup', 'tornado-fork', 'base'],
          description: '<p>Privacy pool on Base (Tornado Cash fork). Same root cause as Foom — skipped Groth16 Phase 2. Entire pool drained in a single transaction.</p>',
          impact: '~5 ETH drained. All depositor privacy compromised.',
          mitigation: 'When forking ZK protocols, verify the trusted setup is complete and correct for YOUR circuit.',
        },
        {
          name: 'gnark Groth16 — Soundness + ZK Break (2024)',
          severity: 'critical',
          year: '2024',
          tags: ['gnark', 'go', 'CVE'],
          description:
            '<p>Two CVEs in the Go-based gnark library:</p>' +
            '<ul>' +
            '<li><strong>CVE-2024-45039:</strong> soundness break when using 2+ commitments in Groth16</li>' +
            '<li><strong>CVE-2024-45040:</strong> zero-knowledge property break with commitments — proofs leaked witness information</li>' +
            '</ul>',
          impact: 'Any gnark-based Groth16 prover using commitments could have soundness or ZK failures.',
          mitigation: 'Update gnark to patched version. Monitor CVE databases for ZK library vulnerabilities.',
          references: '<a href="https://www.zellic.io/blog/gnark-bug-groth16-commitments/">Zellic Analysis</a>'
        },
        {
          name: 'zkSync Airdrop — $5M Admin Key Compromise (Apr 2025)',
          severity: 'high',
          year: '2025',
          tags: ['zksync', 'admin-key', 'not-zk-bug'],
          description:
            '<p>Not a ZK circuit exploit — a compromised admin private key gave access to ' +
            '<code>sweepUnclaimed()</code> on three airdrop contracts, minting 111M tokens (0.45% supply increase).</p>' +
            '<p>Lesson: ZK security is necessary but not sufficient. The surrounding infrastructure ' +
            '(admin keys, access control, upgrade mechanisms) must also be secure.</p>',
          impact: '$5M in tokens minted via compromised admin key.',
          mitigation: 'Multisig for admin functions. Timelocks on sensitive operations. ZK does not protect against key compromise.',
          references: '<a href="https://www.halborn.com/blog/post/explained-the-zksync-hack-april-2025">Halborn Analysis</a>'
        }
      ]
    },

    /* ================================================================
     * CATEGORY 4: Prover & Verifier Attacks
     * ================================================================ */
    {
      id: 'prover-verifier',
      title: 'Prover & Verifier Attacks',
      icon: '🎭',
      description: 'Attacks targeting the prover or verifier implementation rather than the circuit or protocol.',
      items: [
        {
          name: 'Side-Channel Attacks on ZK Provers',
          severity: 'medium',
          tags: ['side-channel', 'timing', 'prover'],
          description:
            '<p>ZK proof generation involves heavy computation (MSM, NTT) with <strong>data-dependent memory access patterns</strong>. ' +
            'Timing and cache side-channels during witness generation can leak secret inputs.</p>' +
            '<p>Particularly dangerous for:</p>' +
            '<ul>' +
            '<li><strong>Client-side proving on shared hardware</strong> (browser, mobile) — other apps can observe timing</li>' +
            '<li><strong>TEE-assisted proving</strong> — SGX has known side-channel vulnerabilities (Spectre, Foreshadow)</li>' +
            '<li><strong>Cloud proving services</strong> — co-tenant VMs can observe memory access patterns</li>' +
            '</ul>',
          diagram:
            'TIMING ATTACK ON MSM:\n' +
            '─────────────────────\n' +
            'MSM: result = Σ(scalar[i] * base[i])\n' +
            '\n' +
            'Scalar bits are processed sequentially:\n' +
            '  bit = 1 → add + double (slower)\n' +
            '  bit = 0 → double only   (faster)\n' +
            '\n' +
            'Attacker measures total time:\n' +
            '  More 1-bits → slower execution\n' +
            '  → leaks Hamming weight of scalar\n' +
            '  → partial witness recovery\n' +
            '\n' +
            'MITIGATION: constant-time MSM (always add + double)\n' +
            '            → arkworks uses this by default',
          impact: 'Partial or full witness recovery, enabling credential de-anonymization or key extraction.',
          mitigation: 'Use constant-time implementations (arkworks). Avoid cloud proving for sensitive witnesses. For TEE: use Arm TrustZone over Intel SGX (fewer known side-channels).'
        },
        {
          name: 'Malicious Verifier: Extracting Information',
          severity: 'medium',
          tags: ['verifier', 'interactivity', 'privacy'],
          description:
            '<p>In interactive proof systems, a <strong>malicious verifier</strong> can deviate from the protocol ' +
            'to extract information. For example, choosing challenges adaptively rather than randomly.</p>' +
            '<p>Non-interactive proofs (Fiat-Shamir) are immune to this by construction — there is no verifier ' +
            'during proof generation. But <strong>the trusted setup ceremony IS interactive</strong>: a malicious ' +
            'ceremony participant who controls the toxic waste can forge proofs.</p>',
          impact: 'Privacy breach (interactive) or soundness break (compromised setup).',
          mitigation: 'Use non-interactive proofs (Fiat-Shamir). For trusted setup: multi-party ceremony with at least 1 honest participant. Or use transparent setup (STARKs, Labrador).'
        }
      ]
    },

    /* ================================================================
     * CATEGORY 5: Anonymous Credential Attacks
     * ================================================================ */
    {
      id: 'credential-attacks',
      title: 'Anonymous Credential Attacks',
      icon: '🎫',
      description: 'Attack vectors specific to ZK-based anonymous credentials and private payments — directly relevant to the thesis.',
      items: [
        {
          name: 'Nullifier Reuse and Cross-Protocol Replay',
          severity: 'critical',
          tags: ['nullifier', 'double-spend', 'credential'],
          description:
            '<p>Nullifiers prevent double-spending: each credential use publishes a unique nullifier ' +
            '\\(nf = H(sk \\| \\sigma \\| \\text{context})\\). But if the <strong>context (domain separator) ' +
            'is missing or shared between applications</strong>, a nullifier from one app is valid in another.</p>',
          diagram:
            'CORRECT NULLIFIER DERIVATION:\n' +
            '  nf = H(sk || credential_σ || app_id || action_type)\n' +
            '  → unique per app, per action, per credential\n' +
            '\n' +
            'VULNERABLE DERIVATION:\n' +
            '  nf = H(sk || credential_σ)\n' +
            '  → SAME nullifier across ALL apps!\n' +
            '\n' +
            'ATTACK:\n' +
            '  1. Alice uses credential in Voting App → nf₁ published\n' +
            '  2. Attacker replays nf₁ in Airdrop App\n' +
            '  3. If no domain separation → nf₁ is valid in both!\n' +
            '  4. Alice is "spent" in the airdrop without consenting\n' +
            '\n' +
            'THESIS: derive nullifiers as H(sk || σ || "sui:credential:v1" || topic)',
          impact: 'Double-spending, unauthorized credential consumption across protocols, denial-of-service by burning others\' nullifiers.',
          mitigation: 'Include application ID, action type, and protocol version in nullifier derivation. Use the PLUME standard (ePrint 2022/1255) for deterministic nullifiers with domain separation.',
          references: '<a href="https://eprint.iacr.org/2022/1255">PLUME: Deterministic ECDSA Nullifiers</a>'
        },
        {
          name: 'Credential Forgery via Under-Constrained Signature Check',
          severity: 'critical',
          tags: ['BBS+', 'signature', 'circuit'],
          description:
            '<p>The BBS+ signature verification circuit must check the full pairing equation. If any component ' +
            'is missing or under-constrained, a prover can forge credentials that pass ZK verification.</p>',
          vulnerable_code:
            '// PSEUDO: incomplete BBS+ verification in circuit\n' +
            '// BUG: missing check that e(sigma, pk + e*G2) == e(msg_point, G2)\n' +
            '// Only checks: e(sigma, G2) == some_value\n' +
            '// → attacker picks arbitrary sigma that satisfies partial check\n' +
            '// → forged credential passes!',
          fixed_code:
            '// CORRECT: full BBS+ pairing equation in circuit\n' +
            '// Check: e(sigma, pk + e*G2) == e(G1 + Σ(mi*Hi), G2)\n' +
            '// ALL components constrained:\n' +
            '//   - sigma is a valid G1 point (on-curve check)\n' +
            '//   - e is correctly derived (hash-to-field)\n' +
            '//   - mi are bound to the committed attributes\n' +
            '//   - pk is the correct issuer key (public input)',
          impact: 'Forged credentials accepted as valid. Attacker impersonates any identity.',
          mitigation: 'Formally verify the BBS+ circuit against the paper specification. Every element in the pairing equation must be constrained. Test with known-invalid credentials to ensure rejection.'
        },
        {
          name: 'Linkability Attacks Despite Zero-Knowledge',
          severity: 'high',
          tags: ['privacy', 'linkability', 'metadata'],
          description:
            '<p>ZK proofs guarantee that the proof reveals nothing about the witness. But <strong>metadata ' +
            'around the proof</strong> can still link transactions:</p>' +
            '<ul>' +
            '<li><strong>Timing:</strong> proof submitted at 3:42 AM from rare timezone → narrows anonymity set</li>' +
            '<li><strong>Proof size variations:</strong> if different credential types produce different proof sizes</li>' +
            '<li><strong>Gas patterns:</strong> consistent gas usage patterns across transactions</li>' +
            '<li><strong>Reused randomness:</strong> if the prover reuses blinding factors, two proofs become linkable</li>' +
            '<li><strong>Network-level:</strong> IP address, Tor circuit reuse</li>' +
            '</ul>',
          diagram:
            'ZK PRIVACY BOUNDARY:\n' +
            '┌──────────────────────────────────────────┐\n' +
            '│  INSIDE the proof: PRIVATE (guaranteed)   │\n' +
            '│  - credential attributes                  │\n' +
            '│  - user identity                          │\n' +
            '│  - Merkle path                            │\n' +
            '└──────────────────────────────────────────┘\n' +
            '┌──────────────────────────────────────────┐\n' +
            '│  OUTSIDE the proof: LEAKS (your problem)  │\n' +
            '│  - submission timestamp                   │\n' +
            '│  - IP address / network metadata          │\n' +
            '│  - gas price / transaction patterns       │\n' +
            '│  - proof size (if variable)               │\n' +
            '│  - interaction frequency                  │\n' +
            '└──────────────────────────────────────────┘',
          impact: 'Transactions linked to the same user despite ZK privacy, reducing the anonymity set to 1.',
          mitigation: 'Use relayers to submit transactions (hide IP). Pad proofs to fixed size. Randomize submission timing. Use private mempools. Fresh randomness for every proof.'
        }
      ]
    },

    /* ================================================================
     * CATEGORY 6: Audit Checklist
     * ================================================================ */
    {
      id: 'checklist',
      title: 'ZK Audit Checklist',
      icon: '✅',
      description: 'Systematic checklist for auditing ZK circuits before deployment. Based on findings from Trail of Bits, Zellic, and zkSecurity.',
      items: [
        {
          name: 'Pre-Deployment Audit Checklist',
          severity: 'info',
          tags: ['checklist', 'audit', 'tools'],
          description:
            '<h4>Circuit Correctness</h4>' +
            '<ul>' +
            '<li>☐ Every signal uses <code>&lt;==</code> not <code>&lt;--</code> (Circom) or has an <code>enforce_*</code> call (arkworks)</li>' +
            '<li>☐ All public inputs are constrained (not just assigned)</li>' +
            '<li>☐ No unused public inputs (snarkjs/compiler may optimize them out)</li>' +
            '<li>☐ Range checks on all field elements that represent bounded values (ages, amounts)</li>' +
            '<li>☐ Circuit is deterministic: one valid witness per public input</li>' +
            '<li>☐ Run <code>circomspect</code> (Trail of Bits) for static analysis</li>' +
            '<li>☐ Run <code>picus</code> (Veridise) for formal verification of uniqueness</li>' +
            '</ul>' +
            '<h4>Protocol Security</h4>' +
            '<ul>' +
            '<li>☐ Fiat-Shamir transcript includes: all commitments + statement + domain separator</li>' +
            '<li>☐ Groth16: Phase 2 completed with fresh randomness (gamma ≠ delta ≠ G2.gen)</li>' +
            '<li>☐ Nullifiers include domain separation (app_id + action_type + protocol_version)</li>' +
            '<li>☐ Proofs bound to sender address (prevents replay and front-running)</li>' +
            '<li>☐ No toxic waste retained from trusted setup</li>' +
            '</ul>' +
            '<h4>Implementation</h4>' +
            '<ul>' +
            '<li>☐ Constant-time witness computation (no timing side-channels)</li>' +
            '<li>☐ Fresh randomness per proof (never reuse blinding factors)</li>' +
            '<li>☐ Verification key hardcoded or verified on-chain (not user-provided)</li>' +
            '<li>☐ Proof deserialization validates points are on curve and in subgroup</li>' +
            '<li>☐ Test with KNOWN-INVALID inputs to verify rejection</li>' +
            '</ul>' +
            '<h4>Privacy (for anonymous credentials)</h4>' +
            '<ul>' +
            '<li>☐ Proof size is fixed regardless of disclosed attributes</li>' +
            '<li>☐ No metadata leakage (timestamp padding, relayer usage)</li>' +
            '<li>☐ Randomness is truly random (CSPRNG, not deterministic from witness)</li>' +
            '<li>☐ Unlinkability tested: two proofs from same credential are indistinguishable</li>' +
            '</ul>',
          diagram:
            'AUDIT TOOLS FOR ZK:\n' +
            '─────────────────────────────────────────────────\n' +
            'Static Analysis:\n' +
            '  circomspect (Trail of Bits)  — Circom lint/audit\n' +
            '  --inspect flag              — Circom built-in\n' +
            '\n' +
            'Formal Verification:\n' +
            '  Picus (Veridise)            — circuit uniqueness\n' +
            '  ECNE (0xPARC)              — determinism checker\n' +
            '\n' +
            'Fuzzing:\n' +
            '  cargo-fuzz + proptest       — arkworks circuits\n' +
            '  snarkjs witness fuzzer      — random witness injection\n' +
            '\n' +
            'Manual:\n' +
            '  0xPARC ZK Bug Tracker       — known vulnerability patterns\n' +
            '  zkSecurity blog             — exploit post-mortems',
          impact: 'Skipping any checklist item can result in critical vulnerabilities that are invisible to standard testing.',
          mitigation: 'Run this checklist before every deployment. Automate what you can (circomspect in CI, VK validation in deploy scripts).',
          references: '<a href="https://github.com/0xPARC/zk-bug-tracker">0xPARC ZK Bug Tracker</a> · <a href="https://github.com/trailofbits/circomspect">circomspect</a> · <a href="https://github.com/Veridise/Picus">Picus</a>'
        }
      ]
    }
  ]
};
