/**
 * ZK Deep Dive — Content Data (Sections 1-4)
 * Loaded by zk-deepdive.js for rendering.
 */

window.ZK_DEEPDIVE_SECTIONS_1 = [
  /* ================================================================
   * SECTION 1: What is a Zero-Knowledge Proof?
   * ================================================================ */
  {
    id: 'zk-what-is',
    title: 'What is a Zero-Knowledge Proof? (The Bar Analogy)',
    icon: '\uD83C\uDF7A',
    content:
      '<p>Imagine you are at a bar and need to prove you are over 18. Today, you show your ID ' +
      'and the bouncer sees your <strong>name, birth date, address, photo</strong>. ' +
      'A zero-knowledge proof lets you prove <em>"I am over 18"</em> and <strong>NOTHING else</strong>. ' +
      'The bouncer learns one bit of information: yes or no. Not your name, not your exact age, not your address.</p>' +
      '<p>How? Imagine a magical ID card: you press a button labeled <code>\u226518?</code> and the card glows green. ' +
      'The bouncer trusts the card manufacturer (the government). The card never reveals its contents. That is ZK.</p>' +
      '<h4>Classic Analogies</h4>' +
      '<ul class="zk-list">' +
      '<li><strong>Ali Baba\'s Cave:</strong> A cave has two paths that meet at a locked door. ' +
      'You want to prove you know the secret word to open the door. The verifier waits outside, ' +
      'you enter a random path, and the verifier shouts which path to come out from. ' +
      'If you know the secret, you always come out the right side. After 20 rounds, the chance ' +
      'of faking it is \\(2^{-20} \\approx 0.0001\\%\\).</li>' +
      '<li><strong>Where\'s Waldo:</strong> You know exactly where Waldo is on a huge poster. ' +
      'You cut a small hole in a big cardboard sheet and place it so only Waldo is visible. ' +
      'The verifier sees Waldo but has no idea where on the poster he is.</li>' +
      '<li><strong>Color-Blind Friend:</strong> Your friend cannot distinguish red from green. ' +
      'You give them two balls (one red, one green). They hide the balls behind their back, ' +
      'sometimes swap them, show you the result. You always say correctly whether they swapped ' +
      'or not. After many rounds, they are convinced the balls are different colors, but they ' +
      'never learn <em>which</em> is red and <em>which</em> is green.</li>' +
      '</ul>',
    diagram:
      '           TRADITIONAL ID                              ZERO-KNOWLEDGE PROOF\n' +
      '  \n' +
      '  You ----[ Full ID Card ]----> Bouncer         You ----[ ZK Proof ]----> Bouncer\n' +
      '          |                     |                        |                 |\n' +
      '          | Name: Alice         | Sees ALL               | Statement:     | Sees ONLY\n' +
      '          | DOB:  2001-03-15    | your data              | "age >= 18"    | yes/no\n' +
      '          | Addr: Zurich 8001   |                        |                 |\n' +
      '          | Photo: [img]        |                        | Proof: 288B    |\n' +
      '          | ID#: 12345678       |                        | (just math)    |\n' +
      '  \n' +
      '  Information leaked: 5+ fields             Information leaked: 0 fields\n' +
      '  Privacy cost: HIGH                        Privacy cost: ZERO',
    publicPrivate: [
      { item: 'Your name', status: 'public', holder: 'Bouncer', when: 'Traditional ID' },
      { item: 'Your name', status: 'private', holder: 'Only you', when: 'ZK proof' },
      { item: 'Your birth date', status: 'public', holder: 'Bouncer', when: 'Traditional ID' },
      { item: 'Your birth date', status: 'private', holder: 'Only you', when: 'ZK proof' },
      { item: '"Age >= 18" (yes/no)', status: 'public', holder: 'Bouncer', when: 'Both methods' },
    ],
    thesisExample:
      'In the thesis, users hold BBS+ credentials with attributes like name, age, nationality. ' +
      'Instead of showing the full credential to a Sui smart contract, they generate a ZK proof ' +
      'that reveals only what is needed (e.g., "valid credential + Swiss resident") while keeping ' +
      'all other attributes hidden. The verifier contract learns nothing beyond the disclosed claim.',
  },

  /* ================================================================
   * SECTION 2: The Three Properties
   * ================================================================ */
  {
    id: 'zk-three-properties',
    title: 'The Three Properties (Completeness, Soundness, Zero-Knowledge)',
    icon: '\uD83D\uDEE1\uFE0F',
    content:
      '<p>Every ZK proof system must satisfy three fundamental properties. Without any one of them, ' +
      'the system is broken or useless.</p>' +
      '<div class="zk-property-grid">' +
      '<div class="zk-property-card">' +
      '<h4>1. Completeness</h4>' +
      '<p class="zk-formal">If the statement is <strong>true</strong> and both parties follow the protocol, ' +
      'the verifier <strong>always</strong> accepts.</p>' +
      '<p class="zk-intuition">Bar analogy: If you are truly over 18, the magic card <strong>always</strong> ' +
      'glows green. An honest prover with a valid credential is never rejected.</p>' +
      '<p class="zk-formal-math">\\(\\forall x \\in L, \\forall w \\text{ s.t. } R(x,w)=1: ' +
      '\\Pr[\\text{Verify}(x, \\text{Prove}(x,w)) = 1] = 1\\)</p>' +
      '</div>' +
      '<div class="zk-property-card">' +
      '<h4>2. Soundness</h4>' +
      '<p class="zk-formal">If the statement is <strong>false</strong>, no cheating prover can convince ' +
      'the verifier (except with negligible probability).</p>' +
      '<p class="zk-intuition">Bar analogy: If you are under 18, you <strong>cannot</strong> make the card ' +
      'glow green. No amount of tricks can forge a valid proof. A 15-year-old cannot convince the bouncer.</p>' +
      '<p class="zk-formal-math">\\(\\forall x \\notin L, \\forall \\text{malicious } P^*: ' +
      '\\Pr[\\text{Verify}(x, P^*(x)) = 1] \\leq \\text{negl}(\\lambda)\\)</p>' +
      '</div>' +
      '<div class="zk-property-card">' +
      '<h4>3. Zero-Knowledge</h4>' +
      '<p class="zk-formal">The verifier learns <strong>nothing</strong> beyond the truth of the statement. ' +
      'Formally: there exists a simulator that, without knowing the witness, produces transcripts ' +
      'indistinguishable from real ones.</p>' +
      '<p class="zk-intuition">Bar analogy: The bouncer learns <strong>nothing</strong> beyond "over 18". ' +
      'Not your age, not your birthday. Even a malicious bouncer who tries clever tricks gets zero extra info. ' +
      'The bouncer could have <em>simulated</em> the whole interaction without you being there.</p>' +
      '<p class="zk-formal-math">\\(\\exists \\text{ Sim}: \\forall V^*, ' +
      '\\text{View}_{V^*}[P(x,w) \\leftrightarrow V^*(x)] \\approx \\text{Sim}(x)\\)</p>' +
      '</div>' +
      '</div>' +
      '<h4>Important Distinctions</h4>' +
      '<ul class="zk-list">' +
      '<li><strong>Proof of knowledge vs proof of membership:</strong> ' +
      'Proof of membership shows \\(x \\in L\\) (the statement is in the language). ' +
      'Proof of <em>knowledge</em> shows "I know a witness \\(w\\) such that \\(R(x,w)=1\\)" ' +
      'with an extractable witness. The thesis uses proofs of knowledge: "I <em>know</em> a valid credential."</li>' +
      '<li><strong>Interactive vs non-interactive (Fiat-Shamir):</strong> ' +
      'Interactive proofs require back-and-forth messages (like Ali Baba\'s cave: 20 rounds of challenges). ' +
      'Non-interactive proofs use the <em>Fiat-Shamir heuristic</em>: replace the verifier\'s random challenge ' +
      'with a hash of the transcript. One message, verifiable by anyone. The thesis uses non-interactive proofs ' +
      'because Sui smart contracts cannot engage in interactive protocols.</li>' +
      '<li><strong>Honest-verifier ZK vs malicious-verifier ZK:</strong> ' +
      'HVZK assumes the verifier follows the protocol (sends random challenges). ' +
      'Malicious-verifier ZK protects against a verifier who deviates. ' +
      'Non-interactive proofs (Fiat-Shamir) provide malicious-verifier ZK by construction, ' +
      'since there is no verifier during proof generation.</li>' +
      '</ul>',
    diagram:
      '            COMPLETENESS              SOUNDNESS               ZERO-KNOWLEDGE\n' +
      '         "honest always works"    "cheaters always fail"    "verifier learns nothing"\n' +
      '  \n' +
      '  True statement + honest P       False statement + any P*    Any statement + any V*\n' +
      '         |                                |                         |\n' +
      '         v                                v                         v\n' +
      '    Verify = ACCEPT              Verify = REJECT               View is simulatable\n' +
      '    (probability = 1)            (probability >= 1-negl)       (no info leaked)\n' +
      '  \n' +
      '  Example: valid credential       Example: expired cred        Example: bouncer sees\n' +
      '  -> always verified OK           -> always rejected           only "yes" for age >= 18',
    publicPrivate: [],
    thesisExample:
      'When a Sui smart contract verifies a Groth16 proof of credential validity, all three properties hold: ' +
      '(1) Completeness: a user with a valid BBS+ credential always generates an accepted proof. ' +
      '(2) Soundness: no one can forge a proof without a valid credential (relies on discrete-log hardness). ' +
      '(3) Zero-knowledge: the contract learns nothing about the credential attributes beyond what was selectively disclosed.',
  },

  /* ================================================================
   * SECTION 3: Statements, Witnesses, Circuits
   * ================================================================ */
  {
    id: 'zk-circuits',
    title: 'What Are We Actually Proving? (Statements, Witnesses, Circuits)',
    icon: '\u26A1',
    content:
      '<p>A ZK proof proves: <strong>"I know a SECRET (witness) that makes a PUBLIC statement true."</strong></p>' +
      '<div class="zk-callout">' +
      '<span class="zk-callout-label">THESIS EXAMPLE</span>' +
      '<p><strong>Statement</strong> (public): "There exists a valid BBS+ credential in the Merkle tree ' +
      'with root \\(R\\), issued by key \\(\\mathit{ipk}\\), where age \\(\\geq 18\\)"</p>' +
      '<p><strong>Witness</strong> (private): the actual credential \\(\\sigma\\), the attributes ' +
      '(name="Alice", age=25, country="CH"), the Merkle path, the randomness</p>' +
      '<p>The proof convinces the verifier the statement is true WITHOUT revealing the witness.</p>' +
      '</div>' +
      '<h4>What is a Circuit?</h4>' +
      '<p>Any computation can be expressed as an <strong>arithmetic circuit</strong> over a finite field: ' +
      'a directed acyclic graph of addition and multiplication gates. The circuit <em>is</em> the program ' +
      'that defines what we are proving.</p>' +
      '<ul class="zk-list">' +
      '<li><strong>The circuit IS public</strong> -- everyone knows WHAT is being proved</li>' +
      '<li><strong>The witness IS private</strong> -- only the prover knows the secret inputs</li>' +
      '<li><strong>The public inputs</strong> are known to both (Merkle root, issuer key, etc.)</li>' +
      '</ul>' +
      '<div class="zk-callout zk-callout-critical">' +
      '<span class="zk-callout-label">KEY INSIGHT</span>' +
      '<p><strong>The circuit is ALWAYS public.</strong> This is fundamental. If the circuit were private, ' +
      'the verifier would not know what claim is being verified. The WITNESS is private, not the circuit.</p>' +
      '<p>Analogy: The circuit is like the <strong>exam questions</strong> (public). The witness is your ' +
      '<strong>answers</strong> (private). The proof is the <strong>grade slip</strong> that says PASS ' +
      'without showing your answers.</p>' +
      '</div>' +
      '<h4>From Computation to Proof</h4>' +
      '<p>The pipeline transforms human-readable code into a mathematical proof:</p>' +
      '<ol class="zk-list">' +
      '<li><strong>High-level program</strong> (Circom, Leo, Noir) describes the statement</li>' +
      '<li><strong>Arithmetic circuit</strong> -- flattened into addition + multiplication gates over \\(\\mathbb{F}_p\\)</li>' +
      '<li><strong>R1CS</strong> (Rank-1 Constraint System) -- each gate becomes \\(A \\cdot B = C\\) with matrices</li>' +
      '<li><strong>QAP</strong> (Quadratic Arithmetic Program) -- R1CS encoded as polynomials</li>' +
      '<li><strong>Proving system</strong> (Groth16, PLONK) evaluates polynomials, produces the proof</li>' +
      '</ol>',
    diagram:
      '  COMPUTATION TO PROOF PIPELINE\n' +
      '  \n' +
      '  High-Level Program            Arithmetic Circuit              R1CS\n' +
      '  (human readable)              (add + mul gates)               (matrix form)\n' +
      '  \n' +
      '  fn verify_age(                     x1\n' +
      '    age: Field,                      |                    A * B = C\n' +
      '    threshold: Field                [>=]                  --------\n' +
      '  ) -> bool {                        |                    Constraints:\n' +
      '    assert(age >= threshold);    x2--[*]--x3              w1 * w2 = w3\n' +
      '    return true;                     |                    w3 + w4 = w5\n' +
      '  }                                 [+]--x4              ...\n' +
      '                                     |\n' +
      '                                   output\n' +
      '  \n' +
      '        |                            |                        |\n' +
      '        v                            v                        v\n' +
      '  \n' +
      '  QAP (polynomials)        -->  Proving System  -->    Proof (288 bytes)\n' +
      '  encode constraints as         Groth16/PLONK          pi = (A, B, C)\n' +
      '  polynomial identities         evaluates + commits    verifiable by anyone\n' +
      '  \n' +
      '  PUBLIC: circuit, statement, verification key, proof\n' +
      '  PRIVATE: witness (your secret inputs)',
    publicPrivate: [
      { item: 'Circuit definition', status: 'public', holder: 'Everyone', when: 'At deployment' },
      { item: 'Public inputs (Merkle root, issuer key)', status: 'public', holder: 'Both prover + verifier', when: 'At proof time' },
      { item: 'Witness (credential, attributes, paths)', status: 'private', holder: 'Prover only', when: 'At proof time' },
      { item: 'Proof (pi)', status: 'public', holder: 'Everyone', when: 'After proof generation' },
      { item: 'Verification key', status: 'public', holder: 'Everyone', when: 'At deployment' },
      { item: 'Proving key', status: 'public', holder: 'Prover (large file)', when: 'At setup' },
    ],
    thesisExample:
      'The thesis circuit proves: "I know a BBS+ signature sigma on attributes (a1,...,an) under issuer ' +
      'public key ipk, where the credential is in the Merkle tree with root R, and attribute a_age >= 18." ' +
      'The circuit is compiled to ~100K R1CS constraints and deployed as part of the verification key on Sui. ' +
      'The witness includes the actual credential, all attributes, and the Merkle authentication path.',
  },

  /* ================================================================
   * SECTION 4: The End-to-End Flow
   * ================================================================ */
  {
    id: 'zk-e2e-flow',
    title: 'The End-to-End Flow (Step by Step)',
    icon: '\uD83D\uDD04',
    content:
      '<p>Here is the <strong>complete flow</strong> of creating and verifying a ZK proof, ' +
      'using the thesis credential example.</p>' +
      '<div class="zk-step">' +
      '<div class="zk-step-number">1</div>' +
      '<div class="zk-step-content">' +
      '<h4>Define the Circuit</h4>' +
      '<p>A developer writes: "prove valid BBS+ credential with selective disclosure." ' +
      'This becomes an arithmetic circuit with ~100K constraints. The circuit is ' +
      '<strong>PUBLIC</strong> -- deployed as part of the Sui Move contract.</p>' +
      '</div></div>' +
      '<div class="zk-step">' +
      '<div class="zk-step-number">2</div>' +
      '<div class="zk-step-content">' +
      '<h4>Trusted Setup (for Groth16)</h4>' +
      '<p>Run a ceremony that generates:</p>' +
      '<ul class="zk-list">' +
      '<li><strong>Proving key (pk)</strong> -- used by prover, ~50MB for 100K constraints</li>' +
      '<li><strong>Verification key (vk)</strong> -- used by verifier, ~1KB</li>' +
      '<li><strong>Toxic waste (\\(\\tau\\))</strong> -- MUST be destroyed, or fake proofs become possible</li>' +
      '</ul>' +
      '<p><code>pk</code> and <code>vk</code> are <strong>PUBLIC</strong>, ' +
      '\\(\\tau\\) is <strong>DESTROYED</strong>.</p>' +
      '</div></div>' +
      '<div class="zk-step">' +
      '<div class="zk-step-number">3</div>' +
      '<div class="zk-step-content">' +
      '<h4>Witness Computation</h4>' +
      '<p>The prover (user\'s wallet) computes the witness:</p>' +
      '<ul class="zk-list">' +
      '<li>Reads BBS+ credential from wallet storage</li>' +
      '<li>Computes Merkle path from on-chain tree</li>' +
      '<li>Derives nullifier from secret key: \\(\\mathit{nf} = H(sk \\| \\sigma)\\)</li>' +
      '<li>Prepares all private inputs</li>' +
      '</ul>' +
      '<p>The witness is <strong>PRIVATE</strong> -- it never leaves the user\'s device.</p>' +
      '</div></div>' +
      '<div class="zk-step">' +
      '<div class="zk-step-number">4</div>' +
      '<div class="zk-step-content">' +
      '<h4>Proof Generation</h4>' +
      '<p>The prover runs: \\(\\pi = \\text{Prove}(pk, x, w)\\)</p>' +
      '<ul class="zk-list">' +
      '<li>Evaluates the circuit on the witness</li>' +
      '<li>Performs heavy crypto (multi-scalar multiplication, NTT, pairings)</li>' +
      '<li>Takes ~500ms on mobile, ~100ms on laptop</li>' +
      '<li>Output: proof \\(\\pi = (A, B, C)\\) -- just <strong>288 bytes</strong> on BLS12-381</li>' +
      '</ul>' +
      '<p>The proof is <strong>PUBLIC</strong> -- it will be sent on-chain.</p>' +
      '</div></div>' +
      '<div class="zk-step">' +
      '<div class="zk-step-number">5</div>' +
      '<div class="zk-step-content">' +
      '<h4>Verification</h4>' +
      '<p>The verifier (Sui Move contract) runs: \\(\\text{Verify}(vk, x, \\pi)\\)</p>' +
      '<ul class="zk-list">' +
      '<li>Checks one pairing equation: \\(e(A, B) = e(\\alpha, \\beta) \\cdot e(C, \\delta) \\cdot e(\\mathit{pub}, \\gamma)\\)</li>' +
      '<li>Takes ~10ms, constant time regardless of circuit size</li>' +
      '<li>Returns: <strong>accept</strong> or <strong>reject</strong></li>' +
      '</ul>' +
      '<p>The result is <strong>PUBLIC</strong> -- on-chain for everyone to see.</p>' +
      '</div></div>' +
      '<div class="zk-step">' +
      '<div class="zk-step-number">6</div>' +
      '<div class="zk-step-content">' +
      '<h4>State Update</h4>' +
      '<p>If accepted, Sui updates the note Merkle tree and nullifier set. ' +
      'The transaction is finalized in ~390ms (Sui finality). ' +
      'The proof, public inputs, and result are permanently recorded on-chain.</p>' +
      '</div></div>',
    diagram:
      '  COMPLETE ZK PROOF FLOW (Thesis Credential Example)\n' +
      '  \n' +
      '  STEP 1: CIRCUIT                    STEP 2: SETUP\n' +
      '  +-----------------------+          +---------------------------+\n' +
      '  | Circuit C:            |          | Trusted Setup(C):         |\n' +
      '  | "valid BBS+ cred      |  ------> | pk (50MB)  [PUBLIC]      |\n' +
      '  |  with age >= 18"      |          | vk (1KB)   [PUBLIC]      |\n' +
      '  | ~100K constraints     |          | tau        [DESTROYED]    |\n' +
      '  | [PUBLIC]              |          +---------------------------+\n' +
      '  +-----------------------+                    |\n' +
      '                                               v\n' +
      '  STEP 3: WITNESS                   STEP 4: PROVE\n' +
      '  +-----------------------+         +---------------------------+\n' +
      '  | User\'s wallet:        |         | pi = Prove(pk, x, w)     |\n' +
      '  | - BBS+ credential     | ------> | - Evaluate circuit       |\n' +
      '  | - Attributes          |         | - MSM + NTT + pairings   |\n' +
      '  | - Merkle path         |         | - ~100ms laptop          |\n' +
      '  | - Nullifier derivation|         | - Output: pi (288 bytes) |\n' +
      '  | [PRIVATE]             |         | [PUBLIC output]          |\n' +
      '  +-----------------------+         +---------------------------+\n' +
      '                                               |\n' +
      '                                               v\n' +
      '  STEP 5: VERIFY (on Sui)           STEP 6: STATE UPDATE\n' +
      '  +-----------------------+         +---------------------------+\n' +
      '  | Verify(vk, x, pi)    |         | If ACCEPT:               |\n' +
      '  | - 1 pairing equation | ------> | - Update Merkle tree     |\n' +
      '  | - ~10ms constant     |         | - Add nullifier to set   |\n' +
      '  | - ACCEPT / REJECT    |         | - Finality: ~390ms       |\n' +
      '  | [PUBLIC result]      |         | [PUBLIC on-chain]        |\n' +
      '  +-----------------------+         +---------------------------+\n' +
      '  \n' +
      '  What travels on-chain: proof (288B) + public inputs + result\n' +
      '  What stays private:    credential, attributes, Merkle path, nullifier preimage',
    publicPrivate: [
      { item: 'Circuit C', status: 'public', holder: 'Everyone (on-chain code)', when: 'Step 1 - Definition' },
      { item: 'Proving key pk', status: 'public', holder: 'Prover (downloaded)', when: 'Step 2 - Setup' },
      { item: 'Verification key vk', status: 'public', holder: 'Verifier contract', when: 'Step 2 - Setup' },
      { item: 'Toxic waste tau', status: 'destroyed', holder: 'No one', when: 'Step 2 - Setup' },
      { item: 'BBS+ credential sigma', status: 'private', holder: 'User wallet', when: 'Step 3 - Witness' },
      { item: 'User attributes', status: 'private', holder: 'User wallet', when: 'Step 3 - Witness' },
      { item: 'Merkle path', status: 'private', holder: 'User wallet', when: 'Step 3 - Witness' },
      { item: 'Nullifier preimage (sk)', status: 'private', holder: 'User wallet', when: 'Step 3 - Witness' },
      { item: 'Proof pi = (A, B, C)', status: 'public', holder: 'On-chain', when: 'Step 4 - Prove' },
      { item: 'Public inputs (root, ipk)', status: 'public', holder: 'On-chain', when: 'Step 5 - Verify' },
      { item: 'Nullifier (derived hash)', status: 'public', holder: 'On-chain', when: 'Step 6 - Update' },
    ],
    thesisExample:
      'This exact 6-step flow is the core of the thesis system. Step 1 defines what the credential ' +
      'proof circuit checks. Steps 2-4 happen in the user\'s wallet (client-side). Steps 5-6 happen ' +
      'in the Sui Move smart contract. The entire flow from proof generation to on-chain finality ' +
      'takes under 1 second.',
  },
];
