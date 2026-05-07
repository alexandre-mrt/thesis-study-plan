/**
 * ZK Deep Dive — Content Data (Sections 5-7)
 * Loaded by zk-deepdive.js for rendering.
 */

window.ZK_DEEPDIVE_SECTIONS_2 = [
  /* ================================================================
   * SECTION 5: How Hard Is It?
   * ================================================================ */
  {
    id: 'zk-complexity',
    title: 'How Hard Is It? (Complexity and Cost)',
    icon: '\uD83D\uDCA1',
    content:
      '<h4>Circuit Design is HARD</h4>' +
      '<ul class="zk-list">' +
      '<li>Writing circuits is like programming in assembly -- you work with <strong>field elements</strong>, not integers</li>' +
      '<li>Every operation costs constraints: one multiplication = one constraint</li>' +
      '<li>A simple hash (SHA-256) = ~27,000 constraints. Poseidon hash = ~250 constraints. That is a <strong>100x</strong> difference.</li>' +
      '<li>BBS+ verification circuit = ~100K constraints</li>' +
      '<li><strong>Bugs in circuits = SECURITY VULNERABILITIES.</strong> Wrong constraints mean fake proofs are possible.</li>' +
      '<li>Tools: <strong>Circom</strong> (DSL for circuits), <strong>Arkworks</strong> (Rust library), <strong>gnark</strong> (Go library)</li>' +
      '</ul>' +
      '<h4>Proving is EXPENSIVE</h4>' +
      '<ul class="zk-list">' +
      '<li>Proving time: \\(O(n \\log n)\\) where \\(n\\) = circuit size (number of constraints)</li>' +
      '<li>For 100K constraints: ~500ms mobile, ~100ms laptop, ~20ms GPU</li>' +
      '<li>Memory: prover needs ~500MB for 100K constraints (proving key + witness in RAM)</li>' +
      '<li>This is why TEEs matter for the thesis -- TEE can verify BBS+ directly in ~1ms vs ~500ms ZK proof on mobile</li>' +
      '</ul>' +
      '<h4>Verification is CHEAP</h4>' +
      '<ul class="zk-list">' +
      '<li>Groth16: constant 3 pairings = ~10ms always, regardless of circuit complexity</li>' +
      '<li>PLONK: ~5ms always</li>' +
      '<li>This is why ZK is perfect for blockchain -- <strong>expensive to prove (off-chain), cheap to verify (on-chain)</strong></li>' +
      '</ul>' +
      '<h4>Trusted Setup is a ONE-TIME PAIN</h4>' +
      '<ul class="zk-list">' +
      '<li><strong>Groth16:</strong> per-circuit ceremony. If the circuit changes, you must redo the setup.</li>' +
      '<li><strong>PLONK:</strong> universal ceremony. One setup for all circuits up to size \\(N\\).</li>' +
      '<li><strong>Powers of Tau:</strong> community ceremony where participants contribute randomness. ' +
      'Only ONE honest participant is needed for security.</li>' +
      '</ul>' +
      '<h4>Proof System Comparison</h4>' +
      '<table class="zk-comparison-table">' +
      '<thead><tr>' +
      '<th>System</th><th>Proof Size</th><th>Prove Time</th><th>Verify Time</th><th>Setup</th><th>Post-Quantum</th>' +
      '</tr></thead>' +
      '<tbody>' +
      '<tr><td><strong>Groth16</strong></td><td>288 B</td><td>~100ms</td><td>~10ms (3 pairings)</td><td>Per-circuit</td><td>No</td></tr>' +
      '<tr><td><strong>PLONK</strong></td><td>~900 B</td><td>~200ms</td><td>~5ms</td><td>Universal</td><td>No</td></tr>' +
      '<tr><td><strong>STARKs</strong></td><td>~50 KB</td><td>~1s</td><td>~20ms</td><td>None (transparent)</td><td>Yes</td></tr>' +
      '<tr><td><strong>Bulletproofs</strong></td><td>~700 B</td><td>~2s</td><td>~500ms</td><td>None</td><td>No</td></tr>' +
      '</tbody></table>' +
      '<p class="zk-table-note">Approximate values for ~100K constraint circuits on a modern laptop. ' +
      'Real performance depends on curve choice, implementation, and hardware.</p>',
    diagram:
      '  COST LANDSCAPE OF ZK PROOFS\n' +
      '  \n' +
      '  Operation             Cost              Where it happens\n' +
      '  ----------------------------------------------------------------\n' +
      '  Circuit compilation   Minutes           Developer machine (once)\n' +
      '  Trusted setup         Hours             MPC ceremony (once)\n' +
      '  Witness computation   ~10ms             User device\n' +
      '  Proof generation      ~100ms-500ms      User device (bottleneck)\n' +
      '  Proof verification    ~10ms             On-chain (cheap!)\n' +
      '  State update          ~390ms            Sui finality\n' +
      '  ----------------------------------------------------------------\n' +
      '  \n' +
      '  HASH FUNCTION COST IN CONSTRAINTS\n' +
      '  \n' +
      '  SHA-256:   |================================================| 27,000\n' +
      '  Blake2s:   |============================|                      15,000\n' +
      '  MiMC:      |===|                                                  731\n' +
      '  Poseidon:  |=|                                                    250\n' +
      '  \n' +
      '  --> Use ZK-friendly hashes (Poseidon) inside circuits!\n' +
      '      The thesis uses Poseidon for Merkle tree hashing.',
    publicPrivate: [],
    thesisExample:
      'The thesis faces a direct tradeoff: ZK proofs on mobile take ~500ms and need ~500MB RAM for ' +
      'the proving key. For "coffee payments" this is acceptable but not ideal. The TEE approach offers ' +
      'an alternative: the TEE verifies the BBS+ credential directly (~1ms) and produces a batch proof ' +
      'that N payments were honest. The hybrid ZK+TEE architecture lets the system choose the optimal ' +
      'path based on context.',
  },

  /* ================================================================
   * SECTION 6: What is Public vs Private?
   * ================================================================ */
  {
    id: 'zk-public-private',
    title: "What's Public vs Private? (The Complete Picture)",
    icon: '\uD83D\uDD0D',
    content:
      '<p>This section provides the definitive "who knows what" for the entire ZK pipeline. ' +
      'Understanding this is critical for reasoning about privacy guarantees.</p>' +
      '<h4>Knowledge by Role</h4>' +
      '<table class="zk-comparison-table zk-knowledge-table">' +
      '<thead><tr>' +
      '<th>Information</th><th>Circuit Designer</th><th>Prover</th><th>Verifier</th><th>Blockchain</th><th>Observer</th>' +
      '</tr></thead>' +
      '<tbody>' +
      '<tr><td>Circuit (what is proved)</td><td>Writes it</td><td>Has it</td><td>Has it</td><td>Stored</td><td>Can read</td></tr>' +
      '<tr><td>Proving key</td><td>Generates it</td><td>Downloads it</td><td>Does not need</td><td>Not stored</td><td>Can download</td></tr>' +
      '<tr><td>Verification key</td><td>Generates it</td><td>Has it</td><td>Uses it</td><td>Stored</td><td>Can read</td></tr>' +
      '<tr><td>Witness (secret inputs)</td><td>Never sees</td><td>Knows it</td><td>Never sees</td><td>Never stored</td><td>Cannot access</td></tr>' +
      '<tr><td>Public inputs</td><td>Defines format</td><td>Provides them</td><td>Reads them</td><td>Stored in tx</td><td>Can read</td></tr>' +
      '<tr><td>Proof (pi)</td><td>Does not see</td><td>Creates it</td><td>Checks it</td><td>Stored in tx</td><td>Can read</td></tr>' +
      '<tr><td>Credential attributes</td><td>Never sees</td><td>Knows all</td><td>Never sees</td><td>Never stored</td><td>Cannot access</td></tr>' +
      '<tr><td>Nullifier</td><td>Defines derivation</td><td>Computes it</td><td>Checks uniqueness</td><td>Stored in set</td><td>Cannot link to user</td></tr>' +
      '<tr><td>User identity</td><td>Never sees</td><td>Is the user</td><td>Never learns</td><td>Not linked</td><td>Cannot determine</td></tr>' +
      '</tbody></table>' +
      '<h4>What an Observer (Chain Analyst) Sees</h4>' +
      '<ul class="zk-list">' +
      '<li>A proof was submitted (288 bytes of math)</li>' +
      '<li>The public inputs (Merkle root, issuer public key, disclosed predicates)</li>' +
      '<li>The nullifier (prevents double-spending, but cannot be linked to a person)</li>' +
      '<li>The transaction was accepted or rejected</li>' +
      '<li><strong>They CANNOT determine:</strong> who submitted it, what the hidden attributes are, ' +
      'which specific credential was used, or link two transactions by the same user (unless the user reuses a nullifier)</li>' +
      '</ul>' +
      '<h4>What the Observer CANNOT Do</h4>' +
      '<div class="zk-callout">' +
      '<span class="zk-callout-label">PRIVACY GUARANTEES</span>' +
      '<p>Even with full blockchain access, an observer cannot: (1) extract the witness from the proof ' +
      '(computational ZK), (2) determine which credential in the Merkle tree was used (anonymity set = all credentials), ' +
      '(3) link two proofs to the same user (different nullifiers per context), ' +
      '(4) determine the undisclosed attributes (perfect hiding).</p>' +
      '</div>',
    diagram:
      '  WHO KNOWS WHAT -- COMPLETE PICTURE\n' +
      '  \n' +
      '  ==============================================================\n' +
      '  |              |  Circuit  |  Witness  |  Proof  |  Identity  |\n' +
      '  ==============================================================\n' +
      '  | Designer     |  WRITES   |    --     |   --    |    --      |\n' +
      '  | Prover       |  HAS      |  KNOWS    | CREATES |  IS user   |\n' +
      '  | Verifier     |  HAS      |    --     | CHECKS  |    --      |\n' +
      '  | Blockchain   |  STORES   |    --     | STORES  |    --      |\n' +
      '  | Observer     |  READS    |    --     | READS   |    --      |\n' +
      '  ==============================================================\n' +
      '  \n' +
      '   "--" means: ZERO knowledge. Cannot access, derive, or infer.\n' +
      '  \n' +
      '  Privacy comes from the mathematical guarantee that the proof\n' +
      '  reveals nothing about the witness beyond the public statement.',
    publicPrivate: [
      { item: 'Circuit definition', status: 'public', holder: 'Everyone', when: 'Always' },
      { item: 'Proving key', status: 'public', holder: 'Anyone who downloads', when: 'After setup' },
      { item: 'Verification key', status: 'public', holder: 'On-chain contract', when: 'After setup' },
      { item: 'Toxic waste', status: 'destroyed', holder: 'No one (must be destroyed)', when: 'After setup' },
      { item: 'Witness / secret inputs', status: 'private', holder: 'Prover only', when: 'Always' },
      { item: 'Public inputs', status: 'public', holder: 'Both parties', when: 'At proof time' },
      { item: 'Proof pi', status: 'public', holder: 'On-chain', when: 'After proving' },
      { item: 'User identity', status: 'private', holder: 'User only', when: 'Always' },
      { item: 'Hidden attributes', status: 'private', holder: 'User only', when: 'Always' },
      { item: 'Nullifier', status: 'public', holder: 'On-chain (unlinkable)', when: 'After proving' },
    ],
    thesisExample:
      'In the thesis architecture, the privacy boundary is precise: the Sui blockchain stores proofs, ' +
      'nullifiers, and Merkle roots. It never stores credentials, user attributes, or identity links. ' +
      'An observer sees that "someone proved a valid credential" but cannot determine who, which credential, ' +
      'or what the hidden attributes are. The anonymity set is all credentials in the Merkle tree.',
  },

  /* ================================================================
   * SECTION 7: ZK in Your Thesis
   * ================================================================ */
  {
    id: 'zk-thesis-flow',
    title: 'ZK in Your Thesis (Credential + Payment Flow)',
    icon: '\uD83C\uDFD7\uFE0F',
    content:
      '<p>The complete end-to-end flow for the thesis, showing <strong>exactly</strong> where ZK is used ' +
      'at each step.</p>' +
      '<div class="zk-thesis-step">' +
      '<div class="zk-thesis-step-num">1</div>' +
      '<div class="zk-thesis-step-body">' +
      '<h4>Credential Issuance (No ZK needed)</h4>' +
      '<p>An issuer (government, university) signs a BBS+ credential over the user\'s attributes. ' +
      'This is a direct signature operation -- no ZK proof is involved at this stage.</p>' +
      '<ul class="zk-detail-list">' +
      '<li><strong>Statement:</strong> N/A (no proof)</li>' +
      '<li><strong>Witness:</strong> N/A</li>' +
      '<li><strong>Output:</strong> BBS+ signature \\(\\sigma\\) over attributes \\((a_1, \\ldots, a_n)\\)</li>' +
      '<li><strong>Public:</strong> Issuer public key \\(\\mathit{ipk}\\)</li>' +
      '<li><strong>Private:</strong> User attributes, issuer secret key \\(\\mathit{isk}\\)</li>' +
      '</ul>' +
      '</div></div>' +
      '<div class="zk-thesis-step">' +
      '<div class="zk-thesis-step-num">2</div>' +
      '<div class="zk-thesis-step-body">' +
      '<h4>Credential Presentation (ZK proof of valid credential)</h4>' +
      '<p>The user proves they hold a valid credential and selectively discloses chosen attributes.</p>' +
      '<ul class="zk-detail-list">' +
      '<li><strong>Statement:</strong> "I know a valid BBS+ credential under \\(\\mathit{ipk}\\) in Merkle tree \\(R\\), ' +
      'where age \\(\\geq 18\\) and country = CH"</li>' +
      '<li><strong>Witness:</strong> Credential \\(\\sigma\\), all attributes, Merkle path, randomness</li>' +
      '<li><strong>Proof:</strong> Groth16 proof \\(\\pi\\) (288 bytes)</li>' +
      '<li><strong>Public:</strong> Merkle root \\(R\\), issuer key \\(\\mathit{ipk}\\), disclosed predicates</li>' +
      '<li><strong>Private:</strong> Name, exact age, address, credential signature</li>' +
      '</ul>' +
      '</div></div>' +
      '<div class="zk-thesis-step">' +
      '<div class="zk-thesis-step-num">3</div>' +
      '<div class="zk-thesis-step-body">' +
      '<h4>Payment Creation (ZK proof of sufficient balance + valid nullifier)</h4>' +
      '<p>The user creates a private payment by proving they have enough balance without revealing the amount.</p>' +
      '<ul class="zk-detail-list">' +
      '<li><strong>Statement:</strong> "I know a note with value \\(\\geq\\) payment amount, with valid nullifier, ' +
      'and the change note is correctly formed"</li>' +
      '<li><strong>Witness:</strong> Input note, secret key, value, change amount</li>' +
      '<li><strong>Proof:</strong> Groth16 proof \\(\\pi\\) (288 bytes)</li>' +
      '<li><strong>Public:</strong> Nullifier, output note commitment, Merkle root</li>' +
      '<li><strong>Private:</strong> Payment amount, sender balance, sender identity</li>' +
      '</ul>' +
      '</div></div>' +
      '<div class="zk-thesis-step">' +
      '<div class="zk-thesis-step-num">4</div>' +
      '<div class="zk-thesis-step-body">' +
      '<h4>On-Chain Verification (Groth16 pairing check in Sui Move)</h4>' +
      '<p>The Sui smart contract verifies the proof using the stored verification key.</p>' +
      '<ul class="zk-detail-list">' +
      '<li><strong>Computation:</strong> \\(e(A, B) = e(\\alpha, \\beta) \\cdot e(C, \\delta) \\cdot e(\\mathit{pub}, \\gamma)\\)</li>' +
      '<li><strong>Cost:</strong> ~10ms constant time (3 pairing operations)</li>' +
      '<li><strong>On success:</strong> Add nullifier to set, update Merkle tree, emit event</li>' +
      '<li><strong>Public:</strong> Accept/reject result, nullifier, new Merkle root</li>' +
      '<li><strong>Private:</strong> Nothing -- all on-chain data is public, but reveals nothing about the user</li>' +
      '</ul>' +
      '</div></div>' +
      '<div class="zk-thesis-step">' +
      '<div class="zk-thesis-step-num">5</div>' +
      '<div class="zk-thesis-step-body">' +
      '<h4>Batch Settlement from TEE (ZK proof of honest batch verification)</h4>' +
      '<p>For high-throughput scenarios, a TEE processes N payments and produces a single proof ' +
      'that all N were honestly verified.</p>' +
      '<ul class="zk-detail-list">' +
      '<li><strong>Statement:</strong> "I (TEE) verified N credential presentations and M payments, ' +
      'all were valid under the stated rules"</li>' +
      '<li><strong>Witness:</strong> All N proofs, all M payment details, TEE attestation</li>' +
      '<li><strong>Proof:</strong> Aggregated Groth16 proof or TEE attestation + batch root</li>' +
      '<li><strong>Public:</strong> Batch Merkle root, TEE attestation, count of verified transactions</li>' +
      '<li><strong>Private:</strong> Individual transaction details, user identities, credential attributes</li>' +
      '</ul>' +
      '</div></div>',
    diagram:
      '  THESIS ARCHITECTURE -- WHERE ZK IS USED\n' +
      '  \n' +
      '  ISSUER                    USER WALLET                SUI BLOCKCHAIN\n' +
      '  ------                    -----------                --------------\n' +
      '  \n' +
      '  1. Issue credential       Store sigma, attrs\n' +
      '     BBS+ Sign(isk, attrs)  in encrypted wallet\n' +
      '     [NO ZK]                [PRIVATE]\n' +
      '                                 |\n' +
      '                                 v\n' +
      '                            2. Present credential\n' +
      '                               ZK Prove:\n' +
      '                               "valid cred +            ----> Verify(vk, x, pi)\n' +
      '                                age >= 18"                    Accept / Reject\n' +
      '                               [ZK PROOF]                    [ON-CHAIN]\n' +
      '                                 |\n' +
      '                                 v\n' +
      '                            3. Create payment\n' +
      '                               ZK Prove:\n' +
      '                               "balance >= amt +        ----> Verify(vk, x, pi)\n' +
      '                                valid nullifier"              Add nullifier\n' +
      '                               [ZK PROOF]                    Update tree\n' +
      '                                                              [ON-CHAIN]\n' +
      '  TEE ENCLAVE\n' +
      '  -----------\n' +
      '  5. Batch settlement\n' +
      '     Verify N payments\n' +
      '     inside SGX enclave     -----> 4. Submit batch proof\n' +
      '     Produce attestation           to Sui contract\n' +
      '     [TEE + ZK HYBRID]             [ON-CHAIN]\n' +
      '  \n' +
      '  LEGEND:  [NO ZK] = direct crypto   [ZK PROOF] = zero-knowledge proof\n' +
      '           [PRIVATE] = never shared   [ON-CHAIN] = public blockchain state',
    publicPrivate: [
      { item: 'BBS+ credential sigma', status: 'private', holder: 'User wallet', when: 'Step 1: Issuance' },
      { item: 'Issuer public key ipk', status: 'public', holder: 'Everyone', when: 'Step 1: Issuance' },
      { item: 'Credential ZK proof', status: 'public', holder: 'On-chain', when: 'Step 2: Presentation' },
      { item: 'Disclosed predicates', status: 'public', holder: 'Verifier', when: 'Step 2: Presentation' },
      { item: 'Hidden attributes', status: 'private', holder: 'User only', when: 'Step 2: Presentation' },
      { item: 'Payment ZK proof', status: 'public', holder: 'On-chain', when: 'Step 3: Payment' },
      { item: 'Payment amount', status: 'private', holder: 'Sender + receiver', when: 'Step 3: Payment' },
      { item: 'Nullifier', status: 'public', holder: 'On-chain (unlinkable)', when: 'Step 3: Payment' },
      { item: 'TEE attestation', status: 'public', holder: 'On-chain', when: 'Step 5: Batch' },
      { item: 'Individual tx details', status: 'private', holder: 'Inside TEE enclave', when: 'Step 5: Batch' },
    ],
    thesisExample:
      'The thesis system uses ZK at two critical points: credential presentation (step 2) and payment ' +
      'creation (step 3). The TEE provides a performance optimization for batch settlement (step 5). ' +
      'The hybrid ZK+TEE architecture means: users get strong cryptographic privacy (ZK) while the system ' +
      'achieves high throughput (TEE batch processing). If the TEE is compromised, privacy degrades ' +
      'gracefully because the ZK proofs remain sound.',
  },

  /* ================================================================
   * SECTION 8: The Sumcheck Protocol
   * ================================================================ */
  {
    id: 'zk-sumcheck',
    title: 'The Sumcheck Protocol (The Engine Behind Modern SNARKs)',
    icon: '∑',
    content:
      '<p>The <strong>sumcheck protocol</strong> is arguably the most important building block in modern ' +
      'proof systems. Invented in 1992, it was overshadowed by Plonk-era polynomial IOPs, but is now ' +
      '<strong>central</strong> to HyperNova, Spartan, Lasso, Jolt, and Binius. If you understand sumcheck, ' +
      'you understand the engine that powers the thesis\'s folding pipeline.</p>' +

      '<h4>Intuitive Explanation: The Ballot-Counting Analogy</h4>' +
      '<p>Imagine you are an election auditor. There are \\(2^n\\) ballot boxes across \\(n\\) districts. ' +
      'You want to verify the <strong>total vote count</strong> is correct, but you cannot physically open ' +
      'every box — there are too many. The sumcheck protocol lets you verify the total by checking just ' +
      '\\(n\\) <em>partial sums</em>, one per district dimension, using randomness to "compress" each layer.</p>' +
      '<p>At each round, the prover sends a small polynomial (degree \\(d\\)) that describes one "slice" of ' +
      'the sum. The verifier checks that it is consistent with the previous round, picks a random challenge, ' +
      'and moves to the next dimension. After \\(n\\) rounds, the verifier is left with a single evaluation ' +
      '\\(g(r_1, \\ldots, r_n)\\) that they can check directly — or delegate to another protocol (like a PCS).</p>' +

      '<h4>The Protocol Step by Step</h4>' +
      '<p>We want to prove:</p>' +
      '<p class="zk-formal-math">\\[H = \\sum_{x_1 \\in \\{0,1\\}} \\sum_{x_2 \\in \\{0,1\\}} \\cdots ' +
      '\\sum_{x_n \\in \\{0,1\\}} g(x_1, x_2, \\ldots, x_n)\\]</p>' +
      '<p>where \\(g\\) is a multivariate polynomial over a finite field \\(\\mathbb{F}\\), ' +
      'and the sum is over the Boolean hypercube \\(\\{0,1\\}^n\\).</p>' +

      '<div class="zk-step">' +
      '<div class="zk-step-number">1</div>' +
      '<div class="zk-step-content">' +
      '<h4>Round 1 — Fix all variables except \\(x_1\\)</h4>' +
      '<p>The prover sends a univariate polynomial:</p>' +
      '<p class="zk-formal-math">\\[s_1(X_1) = \\sum_{x_2, \\ldots, x_n \\in \\{0,1\\}} g(X_1, x_2, \\ldots, x_n)\\]</p>' +
      '<p>The verifier checks: \\(s_1(0) + s_1(1) = H\\). If this holds, the verifier picks a random ' +
      '\\(r_1 \\in \\mathbb{F}\\) and sends it to the prover.</p>' +
      '</div></div>' +

      '<div class="zk-step">' +
      '<div class="zk-step-number">2</div>' +
      '<div class="zk-step-content">' +
      '<h4>Round \\(i\\) — Fix \\(x_i\\), challenge on previous</h4>' +
      '<p>The prover sends:</p>' +
      '<p class="zk-formal-math">\\[s_i(X_i) = \\sum_{x_{i+1}, \\ldots, x_n \\in \\{0,1\\}} ' +
      'g(r_1, \\ldots, r_{i-1}, X_i, x_{i+1}, \\ldots, x_n)\\]</p>' +
      '<p>The verifier checks: \\(s_i(0) + s_i(1) = s_{i-1}(r_{i-1})\\), then picks random ' +
      '\\(r_i \\in \\mathbb{F}\\).</p>' +
      '</div></div>' +

      '<div class="zk-step">' +
      '<div class="zk-step-number">3</div>' +
      '<div class="zk-step-content">' +
      '<h4>Final Round — Single-point evaluation</h4>' +
      '<p>After \\(n\\) rounds, the verifier must check \\(g(r_1, \\ldots, r_n) = s_n(r_n)\\). ' +
      'This is a single-point evaluation of \\(g\\), which can be checked via an oracle or a ' +
      '<strong>polynomial commitment scheme</strong> (PCS).</p>' +
      '</div></div>' +

      '<h4>Why Is This So Powerful?</h4>' +
      '<ul class="zk-list">' +
      '<li><strong>Communication:</strong> \\(O(n \\cdot d)\\) field elements total — exponentially less ' +
      'than the \\(2^n\\) terms being summed</li>' +
      '<li><strong>Verifier work:</strong> \\(O(n \\cdot d)\\) — the verifier does almost nothing</li>' +
      '<li><strong>Prover work:</strong> \\(O(2^n)\\) total field operations — the prover visits each evaluation ' +
      'point once, halving the work each round. Structured instances (sparse R1CS) reduce this further</li>' +
      '<li><strong>No FFT required:</strong> Unlike Plonk/Groth16, sumcheck works without FFT — prover ' +
      'memory is linear, not superlinear</li>' +
      '<li><strong>Composable:</strong> Sumcheck can be nested, batched, and composed with any PCS</li>' +
      '</ul>' +

      '<h4>Technical: Soundness Guarantee</h4>' +
      '<p>By the Schwartz-Zippel lemma, if \\(g\\) has total degree \\(d\\) in each variable, the ' +
      'probability of a cheating prover fooling the verifier in one round is at most \\(d / |\\mathbb{F}|\\). ' +
      'Over \\(n\\) rounds, the total soundness error is:</p>' +
      '<p class="zk-formal-math">\\[\\epsilon \\leq \\frac{n \\cdot d}{|\\mathbb{F}|}\\]</p>' +
      '<p>For a 256-bit field with \\(n = 20\\) variables and degree \\(d = 3\\): ' +
      '\\(\\epsilon \\leq 60 / 2^{256} \\approx 0\\). Practically unbreakable.</p>' +

      '<h4>Where Sumcheck Appears in Modern Systems</h4>' +
      '<table class="zk-comparison-table">' +
      '<thead><tr>' +
      '<th>System</th><th>Role of Sumcheck</th><th>What It Replaces</th>' +
      '</tr></thead>' +
      '<tbody>' +
      '<tr><td><strong>Spartan</strong></td><td>Core proof protocol — proves R1CS satisfiability via sumcheck on multilinear extensions</td><td>FFT-based polynomial evaluation (Groth16/PLONK)</td></tr>' +
      '<tr><td><strong>HyperNova</strong></td><td>Multifolding — batches multiple CCS instances into one check at a random point</td><td>Per-instance folding verifier</td></tr>' +
      '<tr><td><strong>Lasso/Jolt</strong></td><td>Lookup arguments — proves table membership via sumcheck decomposition</td><td>Plookup-style permutation arguments</td></tr>' +
      '<tr><td><strong>Binius</strong></td><td>Small-field sumcheck over binary tower fields for hash-heavy circuits</td><td>Large prime field arithmetic</td></tr>' +
      '<tr><td><strong>GKR</strong></td><td>Layer-by-layer verification of arithmetic circuits via sumcheck reduction</td><td>Full circuit evaluation by verifier</td></tr>' +
      '</tbody></table>' +

      '<div class="zk-callout zk-callout-critical">' +
      '<span class="zk-callout-label">KEY INSIGHT</span>' +
      '<p>Sumcheck converts a <strong>global claim</strong> (sum over exponentially many points) into a ' +
      '<strong>local claim</strong> (evaluation at one random point). This is the fundamental trick. ' +
      'Every system that uses sumcheck is exploiting this reduction: "I do not need to verify the whole ' +
      'computation — just one random slice of it."</p>' +
      '</div>',

    diagram:
      '  THE SUMCHECK PROTOCOL — ROUND BY ROUND\n' +
      '  \n' +
      '  Claim: H = sum over {0,1}^n of g(x1, ..., xn)\n' +
      '  \n' +
      '  PROVER                                      VERIFIER\n' +
      '  ------                                      --------\n' +
      '  \n' +
      '  Round 1:\n' +
      '  Compute s1(X) = sum_{x2..xn} g(X, x2, ..., xn)\n' +
      '  Send s1(X) [degree d polynomial]     ------>  Check: s1(0) + s1(1) = H ?\n' +
      '                                       <------  Send random r1\n' +
      '  \n' +
      '  Round 2:\n' +
      '  Compute s2(X) = sum_{x3..xn} g(r1, X, x3, ..., xn)\n' +
      '  Send s2(X)                           ------>  Check: s2(0) + s2(1) = s1(r1) ?\n' +
      '                                       <------  Send random r2\n' +
      '  \n' +
      '       ...            (repeat for n rounds)           ...\n' +
      '  \n' +
      '  Round n:\n' +
      '  Compute sn(X) = g(r1, ..., r_{n-1}, X)\n' +
      '  Send sn(X)                           ------>  Check: sn(0) + sn(1) = s_{n-1}(r_{n-1}) ?\n' +
      '                                       <------  Send random rn\n' +
      '  \n' +
      '  Final check:\n' +
      '                                                Check: g(r1, ..., rn) = sn(rn) ?\n' +
      '                                                (via oracle / PCS evaluation proof)\n' +
      '  \n' +
      '  COST SUMMARY\n' +
      '  ─────────────────────────────────────────────────────────\n' +
      '  Communication:  n polynomials of degree d  = O(n*d) field elements\n' +
      '  Verifier:       n consistency checks       = O(n*d) field ops\n' +
      '  Prover:         sum over 2^n points        = O(2^n) field ops\n' +
      '  Soundness:      n*d / |F|                  ≈ 0 for large fields\n' +
      '  ─────────────────────────────────────────────────────────\n' +
      '  \n' +
      '  KEY: 2^n terms verified with only n rounds of interaction!',

    publicPrivate: [
      { item: 'Polynomial g (circuit encoding)', status: 'public', holder: 'Both prover + verifier', when: 'Protocol start' },
      { item: 'Claimed sum H', status: 'public', holder: 'Both parties', when: 'Protocol start' },
      { item: 'Round polynomials s_i(X)', status: 'public', holder: 'Sent by prover', when: 'Each round' },
      { item: 'Random challenges r_i', status: 'public', holder: 'Chosen by verifier', when: 'Each round' },
      { item: 'Witness (secret inputs to g)', status: 'private', holder: 'Prover only', when: 'During computation' },
      { item: 'Final evaluation g(r1,...,rn)', status: 'public', holder: 'Verified via PCS', when: 'Final round' },
    ],

    thesisExample:
      'In the thesis folding pipeline, Spartan uses sumcheck as its core proving mechanism to verify R1CS ' +
      'satisfiability of the credential/payment circuit. When HyperNova folds multiple CCS instances (e.g., ' +
      'batching N credential presentations), the multifolding verifier is a sumcheck invocation. The final ' +
      'Spartan decider proof — the one submitted on-chain to Sui — is a sumcheck-based argument compressed ' +
      'via a polynomial commitment. Understanding sumcheck is prerequisite to debugging why a Sonobe proof ' +
      'fails: the error almost always traces back to a round polynomial inconsistency.',
  },
];
