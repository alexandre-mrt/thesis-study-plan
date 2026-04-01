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
];
