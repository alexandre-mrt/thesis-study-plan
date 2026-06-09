/**
 * Ch 2.5 Study Guide — IOP & PCP Theory
 * Data file loaded by the study plan website.
 */

window.CH25_IOP_GUIDE = {
  block1: {
    title: 'IOP &amp; PCP Theory',
    connectionsSummary:
      'These concepts form the theoretical foundation of all modern ZK proof ' +
      'systems. Understanding the IOP/PCP framework explains WHY proofs can be ' +
      'succinct and HOW they are constructed.',
    concepts: [
      {
        name: 'PCP (Probabilistically Checkable Proofs)',
        analogy:
          'A 10,000-page proof where a verifier randomly reads 3 sentences ' +
          'and catches any error with 99% probability. The proof is written in ' +
          'a special format so that any lie corrupts enough of the text to be ' +
          'detectable by spot-checking.',
        mermaidDiagram:
          'sequenceDiagram\n' +
          '    participant P as 🔒 Prover\n' +
          '    participant Pi as 📜 Proof π = [b₁, b₂, ..., bₙ]\n' +
          '    participant V as 🔍 Verifier\n' +
          '    Note over P: Writes static proof π<br/>(no interaction)\n' +
          '    P->>Pi: Write proof string π ∈ Σᵐ\n' +
          '    Note over V: Uses O(log n) random bits<br/>to pick query positions\n' +
          '    V->>Pi: Query position i₁\n' +
          '    Pi-->>V: b[i₁]\n' +
          '    V->>Pi: Query position i₂\n' +
          '    Pi-->>V: b[i₂]\n' +
          '    V->>Pi: Query position i₃\n' +
          '    Pi-->>V: b[i₃]\n' +
          '    Note over V: Reads only O(1) bits total\n' +
          '    alt All checks pass\n' +
          '        V->>V: ✅ ACCEPT\n' +
          '    else Any check fails\n' +
          '        V->>V: ❌ REJECT\n' +
          '    end\n' +
          '    Note over P,V: Completeness: true proof ⟹ always accepts<br/>Soundness: false proof ⟹ rejects w.p. ≥ 1/2<br/>PCP Theorem: NP = PCP[O(log n), O(1)]',
        diagram:
          '┌──────────────────────────────────────────────────────┐\n' +
          '│        PCP: Probabilistically Checkable Proof        │\n' +
          '├──────────────────────────────────────────────────────┤\n' +
          '│  Proof Pi:  [ b1 | b2 | b3 | ... | bN ]             │\n' +
          '│               ^         ^              ^             │\n' +
          '│  Verifier:  query i1   query i2    query i3          │\n' +
          '│  (O(log n) random bits to pick positions)            │\n' +
          '│               |         |              |             │\n' +
          '│               v         v              v             │\n' +
          '│         ┌──────────────────────────────────┐        │\n' +
          '│         │ V reads O(1) bits → ACCEPT/REJECT│        │\n' +
          '│         └──────────────────────────────────┘        │\n' +
          '│                                                      │\n' +
          '│  Completeness: true proof => always accepts          │\n' +
          '│  Soundness:    false proof => rejects w.p. >= 1/2    │\n' +
          '│  PCP Theorem:  NP = PCP[O(log n), O(1)]             │\n' +
          '└──────────────────────────────────────────────────────┘',
        keyPoints: [
          'PCP Theorem: NP = PCP[O(log n), O(1)] — every NP proof can be rewritten so a verifier checks O(1) bits with O(log n) randomness',
          'Query complexity q: number of proof positions read (constant for PCP theorem)',
          'Randomness complexity r: number of random bits (O(log n) for PCP theorem)',
          'Soundness error: probability verifier accepts false proof (amplified by repetition)',
          'Perfect completeness: honest proofs always accepted (no false negatives)',
          '3-SAT has a PCP with O(1) queries — verifier checks via clever algebraic encoding',
          'PCPs imply hardness of approximation (Hastad 1997)'
        ],
        connections:
          'PCPs are the theoretical ancestor of all succinct proof systems. ' +
          'The Kilian-Micali construction compiles a PCP into a succinct argument ' +
          'using Merkle hashing. Modern SNARKs evolved from this: IOP generalizes ' +
          'PCP with interaction, then Fiat-Shamir removes the interaction.',
        thesisExample:
          'PCPs explain WHY SNARKs can verify computation in O(1): the PCP theorem ' +
          'guarantees that any NP statement can be checked with constant queries. ' +
          'When your Sui verifier checks a credential proof in constant time, it is ' +
          'because the underlying proof system descends from this theorem.',
        history: {
          inventor: 'Arora, Lund, Motwani, Sudan, Szegedy',
          year: 1992,
          context:
            'The PCP theorem was proved in two landmark papers: Arora-Lund-Motwani-' +
            'Sudan-Szegedy (1992) and Arora-Safra (1998). It unified disparate results ' +
            'in complexity theory and won the Godel Prize in 2001. Before PCPs, verifying ' +
            'an NP proof required reading the entire proof.',
          funFact:
            'The PCP theorem was initially motivated by hardness of approximation, not ' +
            'cryptography. Its application to succinct proofs came later via Kilian (1992) ' +
            'and Micali (1994), eventually spawning the entire SNARK/STARK ecosystem.'
        },
        limitations: [
          'Classical PCPs have enormous proof length (polynomial blowup) — impractical without further compilation',
          'The constant in O(1) queries hides large constants; practical systems use IOPs instead',
          'PCP constructions are complex to implement; no production system uses raw PCPs directly'
        ],
        exercises: [
          {
            type: 'conceptual',
            question:
              'Why does the PCP theorem imply that NP-hard problems are hard to approximate? ' +
              'Sketch the connection between query complexity and approximation ratio.',
            hint:
              'If you could approximate MAX-3SAT to ratio (1 - epsilon), you could use the ' +
              'PCP verifier as a reduction: a satisfiable instance has all checks pass, an ' +
              'unsatisfiable one fails many checks.',
            answer:
              'The PCP theorem recasts every NP language as a constraint satisfaction problem ' +
              'where YES instances satisfy all constraints and NO instances satisfy at most a ' +
              '(1 - epsilon) fraction. Any algorithm that approximates better than this ratio ' +
              'would solve NP, proving P != NP implies inapproximability.'
          },
          {
            type: 'conceptual',
            question:
              'Explain why O(log n) random bits suffice for the PCP verifier. What does this ' +
              'imply about the number of possible query patterns?',
            hint:
              'O(log n) random bits give 2^(O(log n)) = poly(n) possible coin sequences.',
            answer:
              'With O(log n) random bits, the verifier has poly(n) possible random strings, ' +
              'so it can only access poly(n) different sets of query positions. A union bound ' +
              'over all possible random choices ensures that if the proof is false, at least ' +
              'half the random strings lead to a query set that detects the error.'
          }
        ]
      },
      {
        name: 'IOP (Interactive Oracle Proofs)',
        analogy:
          'A multi-round courtroom where each round the witness submits a sealed ' +
          'evidence box. The judge randomly opens a few drawers from any box submitted ' +
          'so far. The witness cannot change previously submitted boxes, but can adapt ' +
          'future submissions to the judge\'s questions.',
        mermaidDiagram:
          'sequenceDiagram\n' +
          '    participant P as 🔒 Prover\n' +
          '    participant V as 🔍 Verifier\n' +
          '    rect rgb(30, 40, 60)\n' +
          '        Note over P,V: Round 1\n' +
          '        P->>V: Send oracle f₁ (polynomial)\n' +
          '        Note over V: Oracle access: spot-check f₁<br/>at random positions\n' +
          '        V->>P: Random challenge r₁\n' +
          '    end\n' +
          '    rect rgb(40, 30, 60)\n' +
          '        Note over P,V: Round 2\n' +
          '        Note over P: Computes f₂ using r₁\n' +
          '        P->>V: Send oracle f₂ (depends on r₁)\n' +
          '        Note over V: Oracle access: spot-check f₁ AND f₂\n' +
          '        V->>P: Random challenge r₂\n' +
          '    end\n' +
          '    rect rgb(50, 30, 50)\n' +
          '        Note over P,V: Round k (final)\n' +
          '        P->>V: Send oracle fₖ\n' +
          '        Note over V: Query f₁, f₂, ..., fₖ<br/>at chosen positions\n' +
          '    end\n' +
          '    alt All oracle checks pass\n' +
          '        V->>V: ✅ ACCEPT\n' +
          '    else Any check fails\n' +
          '        V->>V: ❌ REJECT\n' +
          '    end\n' +
          '    Note over P,V: Key: V has oracle access (spot-checks) to each fᵢ<br/>Combines IP interactivity + PCP oracle access',
        diagram:
          '┌──────────────────────────────────────────────────────┐\n' +
          '│         IOP: Interactive Oracle Proof                 │\n' +
          '├──────────────────────────────────────────────────────┤\n' +
          '│  Round 1: P sends oracle f1 (function/poly)          │\n' +
          '│           V queries f1, sends challenge r1            │\n' +
          '│                                                      │\n' +
          '│  Round 2: P sends oracle f2 (depends on r1)          │\n' +
          '│           V queries f1,f2, sends challenge r2        │\n' +
          '│           ...                                        │\n' +
          '│  Round k: P sends oracle fk                          │\n' +
          '│           V queries f1,...,fk → ACCEPT/REJECT        │\n' +
          '│                                                      │\n' +
          '│  Key: V has oracle access (spot-checks) to each fi   │\n' +
          '│       Combines IP interactivity + PCP oracle access  │\n' +
          '└──────────────────────────────────────────────────────┘',
        keyPoints: [
          'Combines IP interactivity with PCP oracle access — the best of both worlds',
          'Rounds k: number of prover messages (each is an oracle)',
          'Query complexity: total number of positions read across all oracles',
          'Public-coin IOPs: verifier messages are just random challenges (enables Fiat-Shamir)',
          'BCS transformation: IOP + Merkle hash tree = non-interactive argument in ROM',
          'Strictly more powerful than PCPs: interaction allows shorter proofs',
          'Every modern STARK and SNARK is compiled from an IOP at its core'
        ],
        connections:
          'IOPs are the information-theoretic core of all modern proof systems. ' +
          'A STARK is an IOP compiled with Merkle trees (BCS transform). A SNARK ' +
          'like PLONK is a polynomial IOP compiled with KZG commitments. The IOP ' +
          'abstraction cleanly separates the "math" from the "crypto".',
        thesisExample:
          'Every STARK/SNARK is compiled from an IOP. When you choose between ' +
          'Groth16, PLONK, or STARK for your credential verification on Sui, you ' +
          'are choosing which IOP to compile and with which commitment scheme. ' +
          'The IOP determines round structure, prover complexity, and soundness.',
        history: {
          inventor: 'Ben-Sasson, Chiesa, Spooner',
          year: 2016,
          context:
            'Formalized at TCC 2016 as a clean abstraction unifying PCPs and ' +
            'interactive proofs. Before IOPs, the connection between PCP-based ' +
            'constructions (Kilian/Micali) and IP-based constructions (GKR) was ' +
            'murky. IOPs provided a single framework explaining both.',
          funFact:
            'The IOP abstraction was "obvious in hindsight" — researchers had been ' +
            'building IOP-like protocols for years (FRI, Aurora) before the formal ' +
            'definition crystallized the concept.'
        },
        limitations: [
          'IOP is an information-theoretic model — it does not directly give a concrete protocol until compiled with a commitment scheme',
          'The BCS transformation requires the random oracle model; real hash functions may not perfectly instantiate it',
          'Multi-round IOPs increase the prover communication complexity linearly with rounds'
        ],
        exercises: [
          {
            type: 'comparison',
            question:
              'Compare PCP, IP, and IOP along three axes: verifier access model, ' +
              'interaction, and known proof length. Why is IOP strictly more powerful?',
            hint:
              'PCP = oracle access + no interaction. IP = full messages + interaction. ' +
              'IOP = oracle access + interaction.',
            answer:
              'PCP: oracle access to a static proof, no interaction, poly(n) proof length. ' +
              'IP: reads full prover messages, multi-round interaction, poly(n) communication. ' +
              'IOP: oracle access to each round\'s message, multi-round, query complexity can be ' +
              'sublinear. IOP is more powerful because the prover can adaptively choose later ' +
              'oracles based on verifier challenges, enabling shorter proofs than static PCPs.'
          },
          {
            type: 'conceptual',
            question:
              'Explain the BCS transformation. How does it convert an IOP into a ' +
              'non-interactive argument?',
            hint:
              'Each prover oracle is committed via a Merkle tree. The verifier\'s random ' +
              'challenges are derived from the Merkle root via Fiat-Shamir.',
            answer:
              'BCS (Ben-Sasson, Chiesa, Spooner 2016): (1) Prover sends oracle fi by ' +
              'committing it in a Merkle tree and publishing the root. (2) Verifier challenges ' +
              'are computed as Hash(transcript so far) — Fiat-Shamir. (3) Prover opens the ' +
              'queried positions with Merkle authentication paths. (4) Verifier checks paths ' +
              'and runs the IOP decision. Result: non-interactive, transparent (no trusted setup), ' +
              'post-quantum if hash is post-quantum.'
          }
        ]
      },
      {
        name: 'IOPP (IOP of Proximity)',
        analogy:
          'Testing if a painting is "close enough" to a masterpiece by examining ' +
          'random brushstrokes. You cannot inspect every pixel, but you can catch ' +
          'a forgery that differs in more than a few percent of strokes. Proximity ' +
          'is the key relaxation that makes sublinear verification possible.',
        mermaidDiagram:
          'sequenceDiagram\n' +
          '    participant P as 🔒 Prover\n' +
          '    participant V as 🔍 Verifier\n' +
          '    Note over P: Holds f : L → F<br/>(evaluations on domain L)\n' +
          '    Note over V: Goal: Is f δ-close to RS[F, L, d]?<br/>i.e., does f agree with deg < d poly<br/>on ≥ (1−δ)|L| positions?\n' +
          '    rect rgb(30, 50, 40)\n' +
          '        Note over P,V: Multi-round proximity test\n' +
          '        P->>V: Commit to f (oracle access)\n' +
          '        V->>P: Random folding challenge α₁\n' +
          '        P->>V: Send folded oracle f′ (reduced degree)\n' +
          '        V->>P: Random folding challenge α₂\n' +
          '        P->>V: Send folded oracle f″ (further reduced)\n' +
          '        Note over P,V: ... log|L| rounds ...\n' +
          '    end\n' +
          '    Note over V: Query f at O(log|L|) positions<br/>Check consistency across rounds\n' +
          '    alt f is δ-close to RS[F,L,d]\n' +
          '        V->>V: ✅ ACCEPT (extractor recovers p)\n' +
          '    else f is δ-far from RS[F,L,d]\n' +
          '        V->>V: ❌ REJECT\n' +
          '    end',
        diagram:
          '┌──────────────────────────────────────────────────────┐\n' +
          '│         IOPP: IOP of Proximity                       │\n' +
          '├──────────────────────────────────────────────────────┤\n' +
          '│  Given: f : L -> F (evaluations on domain L)         │\n' +
          '│  Code:  RS[F, L, d] = {p(x) : deg(p) < d on L}      │\n' +
          '│  Param: proximity delta                              │\n' +
          '│                                                      │\n' +
          '│  Question: Is f delta-close to RS[F, L, d]?          │\n' +
          '│  delta-close: Hamming(f, nearest codeword) <= delta  │\n' +
          '│  i.e., f agrees with deg<d poly on >=(1-d)|L| pts    │\n' +
          '│                                                      │\n' +
          '│  IOPP verifier:                                      │\n' +
          '│    - Multi-round interaction with prover             │\n' +
          '│    - Queries f at O(log |L|) positions               │\n' +
          '│    - ACCEPT if f is delta-close to RS                │\n' +
          '│    - REJECT if f is delta-far from RS                │\n' +
          '│                                                      │\n' +
          '│  Why proximity suffices: if f is close to p(x),      │\n' +
          '│  extractor recovers p as valid witness               │\n' +
          '└──────────────────────────────────────────────────────┘',
        keyPoints: [
          'Proximity vs membership: tests if f is CLOSE to a codeword, not necessarily IN the code',
          'Reed-Solomon proximity: is f close to a low-degree polynomial?',
          'Relative Hamming distance: fraction of disagreeing positions with nearest codeword',
          'Proximity parameter delta: typically 1 - sqrt(rate)',
          'Why proximity suffices: close to valid polynomial => extraction works',
          'Composition: IOPP + polynomial IOP = full proof system',
          'FRI is the most efficient known IOPP for Reed-Solomon codes'
        ],
        connections:
          'IOPP is the "type-checking" layer in STARK construction. The polynomial ' +
          'IOP assumes prover messages are low-degree polynomials; the IOPP actually ' +
          'verifies this assumption. Without IOPP, a cheating prover could send ' +
          'arbitrary functions that pass polynomial identity checks at queried points.',
        thesisExample:
          'IOPP is the bottleneck component in STARKs. Its efficiency determines ' +
          'proof verification time and therefore gas costs on Sui. A better IOPP ' +
          '(like FRI with tight soundness bounds) directly reduces the cost of ' +
          'verifying your credential proofs on-chain.',
        history: {
          inventor: 'Ben-Sasson, Bentov, Horesh, Riabzev',
          year: 2017,
          context:
            'Formalized as IOPP in the FRI paper (ICALP 2018). Earlier work by ' +
            'Ben-Sasson and Sudan (2005) on "robust characterization of polynomials" ' +
            'laid the groundwork for proximity testing of Reed-Solomon codes.',
          funFact:
            'The relaxation from membership to proximity testing is what makes ' +
            'sublinear verification possible. Testing exact membership in RS requires ' +
            'reading the entire function; testing proximity only needs O(log n) queries.'
        },
        limitations: [
          'Proximity parameter delta must be chosen carefully — too small and soundness degrades, too large and completeness fails for "almost valid" proofs',
          'Current soundness analyses (e.g., for FRI) rely on complex combinatorial arguments that are still being refined (BCIKS 2020)',
          'IOPP guarantees proximity to the code, not exact membership — the extraction step adds a small soundness loss'
        ],
        exercises: [
          {
            type: 'calculation',
            question:
              'A Reed-Solomon code RS[F, L, d] has |L| = 1024 and d = 256. ' +
              'What is the rate? What is the relative minimum distance? If delta = 0.5, ' +
              'how many positions can f disagree with the nearest codeword and still be accepted?',
            hint:
              'Rate = d/|L|. RS minimum distance = |L| - d + 1. Relative distance = (|L| - d + 1)/|L|.',
            answer:
              'Rate rho = 256/1024 = 1/4. Minimum distance = 1024 - 256 + 1 = 769. ' +
              'Relative distance = 769/1024 approx 0.75. If delta = 0.5, then f can disagree on ' +
              'at most delta * |L| = 512 positions and still be considered "close." Since the ' +
              'minimum distance is 769 > 512, any function within Hamming distance 512 of a ' +
              'codeword is uniquely decodable (Johnson bound).'
          },
          {
            type: 'conceptual',
            question:
              'Why does proximity testing suffice for soundness in a STARK? Why not require ' +
              'exact membership?',
            hint:
              'Think about what the polynomial IOP needs: it needs to extract a polynomial ' +
              'witness from the prover\'s messages. Proximity to RS means a unique polynomial ' +
              'can be recovered.',
            answer:
              'The polynomial IOP\'s soundness relies on the prover committing to actual ' +
              'polynomials. If a function f is delta-close to RS[F,L,d], there exists a unique ' +
              'polynomial p of degree < d that agrees with f on (1-delta)|L| positions (by ' +
              'unique decoding). The extractor recovers p and uses it as the witness. The IOP ' +
              'soundness proof goes through with at most an additive epsilon loss from the ' +
              'positions where f differs from p.'
          }
        ]
      },
      {
        name: 'FRI Protocol (Fast Reed-Solomon IOP of Proximity)',
        analogy:
          'Testing if someone is a real pianist by repeatedly asking them to play ' +
          '"half the song." Each round, you fold the music in half and check ' +
          'consistency. After log(d) rounds, you are left with a single note that ' +
          'you can verify directly. A fake pianist cannot maintain consistency ' +
          'through all the folding steps.',
        mermaidDiagram:
          'sequenceDiagram\n' +
          '    participant P as 🔒 Prover\n' +
          '    participant V as 🔍 Verifier\n' +
          '    Note over P: f₀(x) on L₀, deg < d\n' +
          '    rect rgb(30, 40, 60)\n' +
          '        Note over P,V: Round 0 — Split f₀(x) = g₀(x²) + x·h₀(x²)\n' +
          '        P->>V: Commit f₀ (Merkle root of evals on L₀)\n' +
          '        V->>P: Random challenge α₀\n' +
          '    end\n' +
          '    rect rgb(35, 35, 65)\n' +
          '        Note over P,V: Round 1 — f₁(y) = g₀(y) + α₀·h₀(y), deg < d/2\n' +
          '        Note over P: Domain halves: L₁ = {x² : x ∈ L₀}\n' +
          '        P->>V: Commit f₁ (Merkle root of evals on L₁)\n' +
          '        V->>P: Random challenge α₁\n' +
          '    end\n' +
          '    rect rgb(40, 30, 70)\n' +
          '        Note over P,V: Round 2 — f₂ = g₁ + α₁·h₁, deg < d/4\n' +
          '        P->>V: Commit f₂\n' +
          '        V->>P: Random challenge α₂\n' +
          '    end\n' +
          '    Note over P,V: ⋮ log(d) rounds total ⋮\n' +
          '    rect rgb(50, 25, 50)\n' +
          '        Note over P,V: Final Round — f_final = CONSTANT\n' +
          '        P->>V: Send constant value directly\n' +
          '    end\n' +
          '    Note over V: CONSISTENCY CHECK:<br/>Pick x ∈ Lᵢ, read fᵢ(x) and fᵢ(−x),<br/>verify fᵢ₊₁(x²) matches folding\n' +
          '    alt All consistency checks pass\n' +
          '        V->>V: ✅ ACCEPT (f₀ is close to deg < d)\n' +
          '    else Inconsistency found\n' +
          '        V->>V: ❌ REJECT\n' +
          '    end',
        diagram:
          '┌──────────────────────────────────────────────────────┐\n' +
          '│          FRI: Recursive Degree Halving                │\n' +
          '├──────────────────────────────────────────────────────┤\n' +
          '│  Round 0: f0(x) on L0 (deg < d)                      │\n' +
          '│    Split: f0(x) = g0(x^2) + x*h0(x^2)               │\n' +
          '│    Verifier sends alpha_0                            │\n' +
          '│              |                                       │\n' +
          '│              v                                       │\n' +
          '│  Round 1: f1(x) = g0(x) + alpha_0*h0(x)  (deg<d/2) │\n' +
          '│    Domain L1 = {x^2 : x in L0}                      │\n' +
          '│    Verifier sends alpha_1                            │\n' +
          '│              |                                       │\n' +
          '│              v                                       │\n' +
          '│  Round 2: f2 = g1 + alpha_1*h1  (deg < d/4)         │\n' +
          '│              ...                                     │\n' +
          '│              v                                       │\n' +
          '│  Round log(d): f_final = CONSTANT (check directly)  │\n' +
          '│                                                      │\n' +
          '│  CONSISTENCY: V picks x in L_i, reads f_i(x),       │\n' +
          '│  f_i(-x), checks f_{i+1}(x^2) matches              │\n' +
          '└──────────────────────────────────────────────────────┘',
        keyPoints: [
          'Recursive degree halving: f(x) = g(x^2) + x*h(x^2) where deg(g),deg(h) < deg(f)/2',
          'Domain squaring: L_{i+1} = {x^2 : x in L_i} — domain halves each round',
          'Each round halves BOTH degree AND domain size — log(d) rounds total',
          'Final check: is f_final a constant? (degree-0 = single field element)',
          'Query complexity: O(log d) — exponentially better than reading full function',
          'Soundness: each fold catches cheating w.p. >= (1 - rate); amplified over rounds',
          'FRI as polynomial commitment: commit to Merkle root of evals, open via FRI',
          'Batching: combine multiple polynomials with random linear combination'
        ],
        connections:
          'FRI is the polynomial commitment scheme behind all STARKs. It provides ' +
          'transparent (no trusted setup) and post-quantum polynomial commitments ' +
          'using only hash functions. The BCS-compiled FRI gives the STARK verifier.',
        thesisExample:
          'FRI is the polynomial commitment behind STARKs (transparent, post-quantum). ' +
          'If you use a STARK backend for credential proofs on Sui, FRI\'s efficiency ' +
          'directly impacts gas costs. The blowup factor (domain/degree ratio) controls ' +
          'the proof size vs. soundness tradeoff.',
        history: {
          inventor: 'Ben-Sasson, Bentov, Horesh, Riabzev',
          year: 2018,
          context:
            'Published at ICALP 2018: "Fast Reed-Solomon Interactive Oracle Proofs of ' +
            'Proximity." FRI achieved quasi-linear prover time O(n log n) and logarithmic ' +
            'verifier time, making transparent proof systems practical for the first time.',
          funFact:
            'FRI was directly motivated by making STARKs practical. The name encodes its ' +
            'purpose: Fast Reed-Solomon IOP of Proximity. It reduced STARK proof generation ' +
            'from hours to seconds for realistic circuit sizes.'
        },
        limitations: [
          'Blowup factor: domain must be larger than degree by factor 1/rho (typically 4-16x), increasing proof size',
          'Field must have multiplicative subgroups of size 2^k (requires specific field choices like the Goldilocks field or BabyBear)',
          'FRI soundness proofs are non-trivial — tight bounds proved only recently (BCIKS 2020, conjectured bounds still used in practice)',
          'Proof size is O(log^2(d)) field elements — larger than KZG O(1) but avoids trusted setup'
        ],
        exercises: [
          {
            type: 'calculation',
            question:
              'Walk through one FRI fold for f(x) = 3x^3 + 2x^2 + x + 5 with random ' +
              'challenge alpha = 2. Decompose f into even/odd parts and compute f1.',
            hint:
              'f(x) = g(x^2) + x*h(x^2) means: even-degree terms give g, odd-degree terms ' +
              'give h. f(x) = (2x^2 + 5) + x*(3x^2 + 1), so g(y) = 2y + 5, h(y) = 3y + 1.',
            answer:
              'Decompose: f(x) = 3x^3 + 2x^2 + x + 5 = (2x^2 + 5) + x*(3x^2 + 1). ' +
              'So g(y) = 2y + 5, h(y) = 3y + 1 (where y = x^2). ' +
              'With alpha = 2: f1(y) = g(y) + 2*h(y) = (2y + 5) + 2*(3y + 1) = 2y + 5 + 6y + 2 = 8y + 7. ' +
              'f1 has degree 1 (halved from degree 3 in x, which is degree 1 in y = x^2). ' +
              'Next round would fold f1(y) = 8y + 7 into a constant.'
          },
          {
            type: 'conceptual',
            question:
              'Why does FRI require the field to have large multiplicative subgroups of ' +
              'order 2^k? What happens if the subgroup is not large enough?',
            hint:
              'FRI relies on domain squaring: L_{i+1} = L_i^2. This requires L_i to be a ' +
              'coset of a multiplicative subgroup closed under squaring.',
            answer:
              'FRI\'s domain squaring map x -> x^2 halves the domain each round because it ' +
              'collapses coset pairs {x, -x} to x^2. This works cleanly only when L is a ' +
              'multiplicative coset of a 2^k-order subgroup: squaring such a group gives a ' +
              '2^(k-1)-order subgroup. If no such subgroup exists, you cannot perform log(d) ' +
              'folding rounds. This is why STARKs use fields like F_p with p = 2^64 - 2^32 + 1 ' +
              '(Goldilocks) which has a 2^32-order multiplicative subgroup.'
          }
        ]
      },
      {
        name: 'Univariate Sumcheck & Functional IOP',
        analogy:
          'Instead of checking every cell in a spreadsheet, verifying that the ' +
          'SUM formula is correct by evaluating a random weighted combination. ' +
          'If the sum claimed is wrong, a random challenge will catch the ' +
          'discrepancy with high probability over a large field.',
        mermaidDiagram:
          'sequenceDiagram\n' +
          '    participant P as 🔒 Prover\n' +
          '    participant V as 🔍 Verifier\n' +
          '    Note over P,V: Claim: Σ_{a∈H} f(a) = σ\n' +
          '    Note over P: Knows f(x) and witness<br/>Key identity: f(x) − σ/|H| = Z_H(x)·q(x) + r(x)<br/>where Z_H(x) = Π_{a∈H}(x−a)\n' +
          '    P->>V: Claim σ + commit to quotient q(x)\n' +
          '    V->>P: Random challenge r ← F\n' +
          '    Note over V: Evaluate at random point r:<br/>Check f(r) − σ/|H| = Z_H(r)·q(r)<br/>(reduces sum to single point evaluation!)\n' +
          '    alt Identity holds at r\n' +
          '        V->>V: ✅ ACCEPT\n' +
          '    else Identity fails at r\n' +
          '        V->>V: ❌ REJECT\n' +
          '    end\n' +
          '    Note over P,V: Soundness: Schwartz-Zippel<br/>False identity fails at random point<br/>w.p. ≥ 1 − deg/|F|',
        diagram:
          '┌──────────────────────────────────────────────────────┐\n' +
          '│       Univariate Sumcheck Protocol                   │\n' +
          '├──────────────────────────────────────────────────────┤\n' +
          '│  Claim: sum_{a in H} f(a) = sigma  (|H| = n)        │\n' +
          '│                                                      │\n' +
          '│  Key identity:                                       │\n' +
          '│    sum = sigma <=> f(x)-sigma/|H| = Z_H(x)*q(x)+r(x)│\n' +
          '│    Z_H(x) = prod_{a in H}(x-a) (vanishing poly)     │\n' +
          '│                                                      │\n' +
          '│  Protocol:                                           │\n' +
          '│    1. Prover claims sigma, sends quotient q(x)       │\n' +
          '│    2. Verifier sends random challenge r              │\n' +
          '│    3. Check: f(r) - sigma/|H| = Z_H(r)*q(r)         │\n' +
          '│       (reduces to point evaluation!)                 │\n' +
          '│                                                      │\n' +
          '│  Soundness: Schwartz-Zippel — false identity fails   │\n' +
          '│  at random point w.p. >= 1 - deg/|F|                 │\n' +
          '└──────────────────────────────────────────────────────┘',
        keyPoints: [
          'Univariate sumcheck: prove sum_{a in H} f(a) = sigma by reducing to point evaluation',
          'Vanishing polynomial Z_H(x) = prod_{a in H}(x-a): zero on all of H',
          'Zero-on-H testing: f vanishes on H iff Z_H divides f',
          'Functional oracle: evaluates linear functions of the proof (generalizes point queries)',
          'Multivariate vs univariate: LFKN is multivariate; Aurora/Marlin use univariate variant',
          'Schwartz-Zippel: non-zero poly of degree d has at most d roots over F (soundness basis)'
        ],
        connections:
          'Sumcheck is the "engine" inside many modern SNARKs. Aurora, Marlin, and ' +
          'Fractal use univariate sumcheck to reduce constraint satisfaction to polynomial ' +
          'evaluations. Spartan and HyperPlonk use multivariate sumcheck directly. ' +
          'The GKR protocol chains sumchecks for delegated computation.',
        thesisExample:
          'Sumcheck helps evaluate which proof system fits Sui\'s verification model. ' +
          'Systems using sumcheck (Spartan, HyperPlonk) have different tradeoffs than ' +
          'systems using polynomial commitments directly (PLONK). For your credential ' +
          'circuit, the sumcheck-based approach may offer better prover time at the cost ' +
          'of slightly larger proofs.',
        history: {
          inventor: 'Lund, Fortnow, Karloff, Nisan',
          year: 1992,
          context:
            'The sumcheck protocol was introduced in the LFKN 1992 paper proving ' +
            'IP = PSPACE. It reduces verifying a sum over an exponential domain to ' +
            'a single evaluation. Aurora/Marlin/Fractal (2019-2020) adapted it to ' +
            'the univariate setting for efficient SNARKs.',
          funFact:
            'The sumcheck protocol is arguably the most important "trick" in complexity ' +
            'theory and proof systems. Almost every interactive proof or argument system ' +
            'uses some form of sumcheck at its core.'
        },
        limitations: [
          'Univariate sumcheck requires the evaluation domain H to be a structured subgroup (roots of unity) for efficient Z_H computation',
          'Soundness error is deg(f)/|F| per round — requires large fields for negligible error',
          'The quotient polynomial q(x) has high degree, requiring the prover to commit to it (adds communication)'
        ],
        exercises: [
          {
            type: 'calculation',
            question:
              'Let H = {1, w, w^2, w^3} be 4th roots of unity in F_17 (w = 4). ' +
              'Compute Z_H(x) = x^4 - 1 evaluated at a random point r = 3. If f(x) = x^2 ' +
              'and sigma = sum_{a in H} f(a), find sigma and verify the sumcheck identity.',
            hint:
              'H = {1, 4, 16, 13} in F_17 (powers of 4 mod 17). Compute f(1) + f(4) + f(16) + f(13) mod 17.',
            answer:
              'H = {1, 4, 16, 13} (since 4^1=4, 4^2=16, 4^3=13, 4^4=1 in F_17). ' +
              'sigma = 1^2 + 4^2 + 16^2 + 13^2 = 1 + 16 + 256 + 169 = 1 + 16 + 256 + 169. ' +
              'Mod 17: 1 + 16 + 256%17 + 169%17 = 1 + 16 + 1 + 16 = 34 = 0 (mod 17). ' +
              'So sigma = 0. Z_H(3) = 3^4 - 1 = 81 - 1 = 80 = 80%17 = 12 (mod 17). ' +
              'Sumcheck: f(x) - 0 = x^2 should be divisible by Z_H check: x^2 = (x^4-1)*q(x)+r(x). ' +
              'Since deg(f)=2 < deg(Z_H)=4, quotient is 0 and remainder is f itself. But sigma=0 ' +
              'means f integrates to 0 over H, verified by the calculation above.'
          },
          {
            type: 'conceptual',
            question:
              'Explain why the vanishing polynomial Z_H(x) is central to both zero-testing ' +
              'and sumcheck in SNARKs. How does it encode constraint satisfaction?',
            hint:
              'A constraint system says "this polynomial should be zero on every row." ' +
              'Rows correspond to elements of H.',
            answer:
              'In R1CS/AIR/PLONKish, the constraint polynomial C(x) must equal zero for ' +
              'every x in H (each element of H is a "row" of the execution trace). This means ' +
              'Z_H(x) divides C(x), i.e., C(x) = Z_H(x)*q(x). The prover demonstrates this by ' +
              'providing q(x) and the verifier checks C(r) = Z_H(r)*q(r) at a random point r. ' +
              'For sumcheck, Z_H similarly captures "sum over H" via the identity relating sums ' +
              'to divisibility by Z_H.'
          }
        ]
      },
      {
        name: 'Code Switching & Rate of the Code',
        analogy:
          'Choosing between a thick textbook (low rate: lots of redundancy, easy to ' +
          'spot errors) and a compressed summary (high rate: less redundancy, harder ' +
          'to verify but shorter). In STARKs, you pick a redundancy level that ' +
          'balances proof size against soundness guarantees.',
        mermaidDiagram:
          'flowchart LR\n' +
          '    subgraph MSG["📝 Message"]\n' +
          '        M["m₀, m₁, ..., m_{k-1}<br/>(k symbols)"]\n' +
          '    end\n' +
          '    subgraph ENC["🔢 RS Encoding"]\n' +
          '        E["p(x) = m₀ + m₁x + ... + m_{k-1}x^{k-1}"]\n' +
          '    end\n' +
          '    subgraph CW["📜 Codeword"]\n' +
          '        C["p(a₀), p(a₁), ..., p(a_{n-1})<br/>(n evaluations)"]\n' +
          '    end\n' +
          '    M --> E --> C\n' +
          '    subgraph PARAMS["📊 Parameters"]\n' +
          '        R["Rate ρ = k/n<br/>Distance d = n−k+1<br/>Blowup = 1/ρ"]\n' +
          '    end\n' +
          '    subgraph SWITCH["🔄 Code Switching"]\n' +
          '        LO["Low rate 1/8<br/>More redundancy<br/>Better soundness"] -->|between rounds| HI["High rate 1/2<br/>Less redundancy<br/>Smaller proof"]\n' +
          '    end',
        diagram:
          '┌──────────────────────────────────────────────────────┐\n' +
          '│     Reed-Solomon Encoding &amp; Rate                     │\n' +
          '├──────────────────────────────────────────────────────┤\n' +
          '│  Message:  [m0, m1, ..., m_{k-1}]  (k symbols)      │\n' +
          '│  Encode:   p(x) = m0 + m1*x + ... + m_{k-1}*x^{k-1}│\n' +
          '│  Codeword: [p(a0), ..., p(a_{n-1})]  (n evals)      │\n' +
          '│                                                      │\n' +
          '│  Rate: rho = k/n    Distance: d = n - k + 1          │\n' +
          '│  Relative dist: ~1 - rho   Blowup: 1/rho            │\n' +
          '│  RS is MDS (achieves Singleton bound)                │\n' +
          '│                                                      │\n' +
          '│  CODE SWITCHING (between IOP rounds):                │\n' +
          '│  ┌────────────┐     ┌────────────┐                  │\n' +
          '│  │Low rate 1/8│ --> │High rate 1/2│                  │\n' +
          '│  │More redund.│     │Less redund. │                  │\n' +
          '│  │Better sound│     │Smaller proof│                  │\n' +
          '│  └────────────┘     └────────────┘                  │\n' +
          '└──────────────────────────────────────────────────────┘',
        keyPoints: [
          'Linear codes: generator matrix G maps messages to codewords (C = m*G)',
          'RS codes = polynomial evaluations: k coefficients encoded as n point evaluations',
          'Rate rho = k/n: higher rate = more efficient but less redundancy',
          'MDS: RS achieves Singleton bound d = n - k + 1 exactly',
          'Code switching: changing rate between IOP rounds (trade soundness vs proof size)',
          'Blowup factor = 1/rho: STARK with blowup 4 has 4x evaluation domain vs degree',
          'Interleaved codes: stack multiple codewords, test together for amortized efficiency'
        ],
        connections:
          'The rate of the Reed-Solomon code directly determines STARK proof size and ' +
          'soundness. FRI operates over RS codes; its blowup factor is 1/rho. Plonky2/3 ' +
          'use aggressive parameters (blowup 2-4) for efficiency. Code switching between ' +
          'rounds allows optimizing each stage independently.',
        thesisExample:
          'The blowup factor directly affects proof size in STARKs. A blowup of 4 ' +
          '(rate 1/4) vs 8 (rate 1/8) doubles the proof size but improves soundness. ' +
          'Plonky2/3 use smaller blowup for efficiency — relevant if generating proofs ' +
          'on mobile for your credential system where bandwidth and storage are constrained.',
        history: {
          inventor: 'Reed and Solomon',
          year: 1960,
          context:
            'Reed-Solomon codes were introduced in 1960 for error correction in ' +
            'communications. Their adoption in proof systems came via Ben-Sasson et al. ' +
            '(2018) who used RS proximity testing as the core of STARKs. The coding ' +
            'theory connection transformed proof system design.',
          funFact:
            'RS codes were originally designed for satellite communications and are used ' +
            'in CDs, DVDs, QR codes, and deep-space probes. Their reuse in ZK proofs is ' +
            'one of the most elegant cross-pollinations between coding theory and cryptography.'
        },
        limitations: [
          'Lower rate means larger proofs: blowup factor 8 (rate 1/8) gives 8x overhead in evaluation domain size',
          'RS codes require the field size to exceed the codeword length (|F| > n), constraining field choices',
          'Code switching adds complexity to soundness analysis — must account for rate changes between rounds',
          'Interleaved testing provides amortized (not worst-case) soundness — rare pathological cases exist'
        ],
        exercises: [
          {
            type: 'calculation',
            question:
              'Compare two STARK configurations: (A) blowup factor 4 (rate 1/4) and ' +
              '(B) blowup factor 8 (rate 1/8). For a degree-1024 polynomial, what is the ' +
              'evaluation domain size and relative distance for each?',
            hint:
              'Domain size = degree * blowup. Relative distance ~ 1 - rate for RS codes.',
            answer:
              'Config A: domain = 1024 * 4 = 4096, rate = 1/4, relative distance ~ 1 - 1/4 = 3/4. ' +
              'Config B: domain = 1024 * 8 = 8192, rate = 1/8, relative distance ~ 1 - 1/8 = 7/8. ' +
              'Config B has 2x larger domain (larger proofs, more Merkle commitments) but higher ' +
              'distance (better soundness per FRI round). In practice, STARK implementors choose ' +
              'blowup 4 for efficiency and compensate with more FRI query repetitions.'
          },
          {
            type: 'conceptual',
            question:
              'Why is Reed-Solomon an MDS code, and why does this property matter for proof systems?',
            hint:
              'MDS means the code achieves the Singleton bound d = n - k + 1. Think about what ' +
              'this implies for error detection capability per unit of redundancy.',
            answer:
              'RS is MDS because any k evaluations of a degree < k polynomial uniquely determine it ' +
              '(Lagrange interpolation). This means any two distinct codewords differ in at least ' +
              'n - k + 1 positions — the maximum possible for any [n,k] code. For proof systems, ' +
              'MDS means you get the best possible soundness for a given rate: the proximity parameter ' +
              'delta can be set as large as 1 - rho, maximizing the chance of catching a cheating prover.'
          }
        ]
      },
      {
        name: 'Arithmetic Circuits & Constraint Systems',
        analogy:
          'Converting a cooking recipe into a factory assembly line. Each step becomes ' +
          'a labeled gate with specific wiring. Different factory layouts (R1CS, AIR, ' +
          'PLONKish) suit different recipes — a repetitive recipe works best on a ' +
          'conveyor belt (AIR), while a complex one-off dish needs a flexible kitchen (PLONKish).',
        mermaidDiagram:
          'flowchart LR\n' +
          '    subgraph INPUT["💻 Computation"]\n' +
          '        X["x² + x + 5 = 35"]\n' +
          '    end\n' +
          '    subgraph SYSTEMS["⚙️ Constraint Systems"]\n' +
          '        direction TB\n' +
          '        R1CS["R1CS<br/>Az ∘ Bz = Cz<br/>deg-2 only<br/>→ Groth16, Spartan"]\n' +
          '        AIR["AIR<br/>s_{i+1} = f(sᵢ)<br/>repeated structure<br/>→ STARKs"]\n' +
          '        PLONK["PLONKish<br/>custom gates + lookups<br/>most flexible<br/>→ PLONK, Halo2"]\n' +
          '    end\n' +
          '    X --> R1CS & AIR & PLONK\n' +
          '    style R1CS fill:#1a2744\n' +
          '    style AIR fill:#1a3a2a\n' +
          '    style PLONK fill:#3a1a3a',
        diagram:
          '┌──────────────────────────────────────────────────────┐\n' +
          '│  Computation: x^2 + x + 5 = 35 (x = 5)             │\n' +
          '├──────────────────────────────────────────────────────┤\n' +
          '│  CIRCUIT:     R1CS (Az o Bz = Cz):                  │\n' +
          '│    x           w = [1, x, x^2, x^2+x, out]         │\n' +
          '│    |           C1: x * x = x^2                      │\n' +
          '│    * <-x       C2: (x^2+x) * 1 = x^2+x            │\n' +
          '│    |           C3: 1 * (x^2+x+5) = 35              │\n' +
          '│    + <-x                                            │\n' +
          '│    |                                                 │\n' +
          '│    + <-5       AIR:              PLONKish:           │\n' +
          '│    |           s_{i+1}=f(s_i)   qL*a + qR*b        │\n' +
          '│    =35         boundary:        + qM*a*b + qO*c    │\n' +
          '│                s_0=x, s_T=35    + qC = 0            │\n' +
          '│                (repeated        + copy constraints   │\n' +
          '│                 structure)      + lookup tables      │\n' +
          '└──────────────────────────────────────────────────────┘',
        keyPoints: [
          'Arithmetic circuits: add/multiply gates over finite field F',
          'R1CS: Az o Bz = Cz — Groth16/Spartan; degree-2 only',
          'AIR: transition + boundary constraints — STARKs; great for repeated structures',
          'PLONKish: custom gates + copy constraints + lookups — Halo2/PLONK; most flexible',
          'SHA-256 in R1CS: ~22k constraints (bitwise ops expensive over arithmetic fields)',
          'Choice of constraint system determines which proof system you can use downstream'
        ],
        connections:
          'Constraint systems are the "assembly language" of proof systems. Your computation ' +
          'must be expressed in one of these formats before any proof can be generated. The ' +
          'choice of arithmetization cascades through the entire pipeline: R1CS leads to Groth16, ' +
          'AIR leads to STARKs, PLONKish leads to PLONK/Halo2.',
        thesisExample:
          'Your BBS+ credential verification will be expressed as a circuit. R1CS (for Groth16) ' +
          'gives the smallest proofs (192 bytes) ideal for Sui gas costs. AIR (for STARKs) gives ' +
          'transparent setup but larger proofs. PLONKish (for PLONK) gives universal trusted setup ' +
          'with medium proofs. The choice cascades through your entire system design.',
        history: {
          inventor: 'Gennaro, Gentry, Parno, Raykova (R1CS); Ben-Sasson et al. (AIR); Gabizon, Williamson, Ciobotaru (PLONKish)',
          year: 2012,
          context:
            'R1CS was formalized in the GGPR 2012 paper that led to SNARKs. AIR was ' +
            'introduced with STARKs (Ben-Sasson et al. 2018). PLONKish emerged from PLONK ' +
            '(Gabizon et al. 2019). Each represents a different philosophy: R1CS is minimal, ' +
            'AIR is repetition-friendly, PLONKish is maximally flexible.',
          funFact:
            'The name "arithmetization" comes from complexity theory where Boolean circuits ' +
            'are converted to arithmetic form. In practice, the biggest engineering challenge ' +
            'is expressing non-arithmetic operations (comparisons, bit manipulation) efficiently ' +
            'in field arithmetic.'
        },
        limitations: [
          'R1CS is limited to degree-2 constraints; expressing higher-degree operations requires auxiliary variables (quadratic blowup)',
          'AIR requires the computation to have regular structure (uniform transition function); irregular computations need padding',
          'PLONKish custom gates require careful design — poorly designed gates can increase prover time without reducing constraint count',
          'All systems incur overhead for non-arithmetic operations: comparisons need O(log p) constraints, bitwise ops need bit decomposition'
        ],
        exercises: [
          {
            type: 'design',
            question:
              'Express the computation "prove I know x such that x^3 + x + 5 = y" in R1CS. ' +
              'How many constraints and variables do you need? Then sketch how it would look in AIR.',
            hint:
              'R1CS can only express degree-2 constraints. x^3 requires an intermediate variable ' +
              'v = x^2, then x*v = x^3. For AIR, think of it as a 2-step computation.',
            answer:
              'R1CS: variables w = [1, x, v1=x^2, v2=x^3, v3=x^3+x+5, y]. Constraints: ' +
              '(1) x * x = v1, (2) x * v1 = v2, (3) (v2 + x + 5) * 1 = y. Three constraints, ' +
              '6 variables (including constant 1). ' +
              'AIR: state = (s, acc) with transition s_{i+1} = s_i * x (multiply by x each step). ' +
              'After 3 steps acc = x^3. Then check acc + x + 5 = y as boundary constraint. ' +
              'Two columns, 3 rows, 1 transition constraint, 2 boundary constraints.'
          },
          {
            type: 'comparison',
            question:
              'Compare the constraint count for SHA-256 in R1CS vs PLONKish with lookup tables. ' +
              'Why do lookup tables dramatically reduce the constraint count?',
            hint:
              'SHA-256 uses XOR, AND, and bit rotation. In R1CS, each bit operation requires ' +
              'decomposing into individual bits. Lookup tables can verify a 16-bit XOR in one constraint.',
            answer:
              'R1CS: ~22,000 constraints. Each 32-bit XOR requires 32 bit-decomposition constraints + ' +
              '32 XOR-per-bit constraints. Each rotation requires copying bits to new positions. ' +
              'PLONKish with lookups: ~3,000 constraints. A 8-bit XOR lookup table (256 entries) verifies ' +
              '8 bits of XOR in a single lookup constraint. Four lookups handle a 32-bit XOR vs 64 ' +
              'R1CS constraints. This ~7x reduction comes from amortizing bit operations into table lookups.'
          }
        ]
      },
      {
        name: 'The Full Pipeline — Computation to SNARK',
        analogy:
          'Manufacturing a diamond from raw carbon. Each stage compresses and ' +
          'transforms while preserving the essential truth. Raw computation is ' +
          'bulky and unstructured; the pipeline refines it into a tiny, ' +
          'verifiable gem that anyone can inspect in milliseconds.',
        mermaidDiagram:
          'flowchart TD\n' +
          '    subgraph COMP["💻 Computation"]\n' +
          '        X["x² + x + 5 = 35<br/>(witness: x = 5)"]\n' +
          '    end\n' +
          '    subgraph ARITH["Stage 1: Arithmetization"]\n' +
          '        R1["R1CS<br/>Az ∘ Bz = Cz<br/>(deg-2 only)"] \n' +
          '        AIR["AIR<br/>s_{i+1} = f(sᵢ)<br/>(repeated structure)"]\n' +
          '        PLK["PLONKish<br/>custom gates + lookups<br/>(most flexible)"]\n' +
          '    end\n' +
          '    subgraph PIOP["Stage 2: Polynomial IOP"]\n' +
          '        G16["Groth16<br/>(linear PCP)"]\n' +
          '        STK["STARK<br/>(FRI IOPP)"]\n' +
          '        PLN["PLONK<br/>(poly commit)"]\n' +
          '    end\n' +
          '    subgraph COMPILE["Stage 3: Compilation"]\n' +
          '        C1["Fiat-Shamir + KZG"]\n' +
          '        C2["BCS + Merkle"]\n' +
          '        C3["Fiat-Shamir + KZG"]\n' +
          '    end\n' +
          '    subgraph RESULT["🎯 Result"]\n' +
          '        S1["SNARK<br/>trusted setup<br/>192B, 3ms"]\n' +
          '        S2["STARK<br/>transparent<br/>~45KB, 15ms"]\n' +
          '        S3["SNARK<br/>universal setup<br/>~1.2KB, 5ms"]\n' +
          '    end\n' +
          '    X --> R1 & AIR & PLK\n' +
          '    R1 --> G16 --> C1 --> S1\n' +
          '    AIR --> STK --> C2 --> S2\n' +
          '    PLK --> PLN --> C3 --> S3\n' +
          '    style S1 fill:#1a3a2a\n' +
          '    style S2 fill:#1a2744\n' +
          '    style S3 fill:#3a1a3a',
        diagram:
          '┌──────────────────────────────────────────────────────┐\n' +
          '│  COMPUTATION → ARITHMETIZE → POLY IOP → COMPILE     │\n' +
          '├──────────────────────────────────────────────────────┤\n' +
          '│  Stage 1: ARITHMETIZATION                            │\n' +
          '│  ┌────────┬──────────┬──────────┐                   │\n' +
          '│  │ R1CS   │  AIR     │ PLONKish │                   │\n' +
          '│  │(deg-2) │(trans+bnd│(gates+   │                   │\n' +
          '│  │        │ constrs) │ lookups) │                   │\n' +
          '│  └───┬────┴────┬─────┴────┬─────┘                  │\n' +
          '│      v         v          v                          │\n' +
          '│  Stage 2: POLYNOMIAL IOP                             │\n' +
          '│  ┌────────┬──────────┬──────────┐                   │\n' +
          '│  │Groth16 │ STARK    │ PLONK    │                   │\n' +
          '│  │(lin PCP│(FRI IOPP)│(poly cmt)│                   │\n' +
          '│  └───┬────┴────┬─────┴────┬─────┘                  │\n' +
          '│      v         v          v                          │\n' +
          '│  Stage 3: COMPILATION                                │\n' +
          '│  ┌────────┬──────────┬──────────┐                   │\n' +
          '│  │F-S+KZG │BCS+Merkle│F-S+KZG  │                   │\n' +
          '│  └───┬────┴────┬─────┴────┬─────┘                  │\n' +
          '│      v         v          v                          │\n' +
          '│  ┌────────┬──────────┬──────────┐                   │\n' +
          '│  │ SNARK  │  STARK   │  SNARK   │                   │\n' +
          '│  │trusted │transparent│universal│                   │\n' +
          '│  │192B,3ms│~45KB,15ms│~1.2KB,5ms│                   │\n' +
          '│  └────────┴──────────┴──────────┘                   │\n' +
          '└──────────────────────────────────────────────────────┘',
        keyPoints: [
          'Three stages: arithmetization, polynomial IOP, compilation (make non-interactive)',
          'Three compilers: Kilian/Micali (PCP), BCS (IOP), polynomial commitment (poly-IOP)',
          'Setup: trusted (Groth16), universal (PLONK), transparent (STARK)',
          'Proof size: Groth16 ~192B, PLONK ~1.2KB, STARK ~45KB',
          'Post-quantum: only STARK path (hash-based, no elliptic curves)',
          'Recursion: wrap one proof inside another (STARK inside Groth16 for small on-chain proof)',
          'No single path dominates all metrics — design requires tradeoffs'
        ],
        connections:
          'This pipeline is the master map connecting all concepts in this chapter. ' +
          'PCP/IOP provides the information-theoretic foundation, FRI/IOPP the polynomial ' +
          'commitment, constraint systems the arithmetization.',
        thesisExample:
          'Master map for thesis decisions. Sui gas cost favors small proofs (Groth16), no ' +
          'trusted setup on-chain favors STARK/PLONK, mobile prover favors fast systems. ' +
          'Practical approach: STARK proofs (transparent, fast) wrapped in Groth16 (small) ' +
          'for on-chain verification — recursion gives best of both worlds.',
        history: {
          inventor: 'Kilian (1992), Micali (1994), Groth (2016), Ben-Sasson et al. (2018)',
          year: 2016,
          context:
            'Kilian (1992) showed PCP + hash = succinct argument. Micali (1994) made it ' +
            'non-interactive. Groth16 optimized pairings. STARKs (2018) opened the transparent ' +
            'path. PLONK (2019) unified with universal setup.',
          funFact:
            'The field went from theory to billions in production in ~5 years (2017-2022). ' +
            'Zcash, StarkNet, zkSync, Scroll all deploy different paths through this pipeline.'
        },
        limitations: [
          'No single path dominates: smallest proofs need trusted setup, transparent proofs are large',
          'Recursion adds prover overhead: verifying STARK inside Groth16 circuit is expensive',
          'Pipeline complexity: bugs can hide at any stage (arithmetization, soundness, field arithmetic)',
          'Trusted setup ceremonies are logistically complex and a single point of failure'
        ],
        exercises: [
          {
            type: 'design',
            question:
              'For your thesis credential system on Sui, trace "prove knowledge of BBS+ credential" ' +
              'through each pipeline variant. Consider: proof size (affects gas), setup requirement, ' +
              'prover time (mobile device), and post-quantum security. Which path would you choose?',
            hint:
              'Consider that Sui charges gas proportional to proof size, there is no on-chain trusted ' +
              'setup ceremony, and users may prove on mobile devices.',
            answer:
              'Groth16: 192B proof (cheapest gas), 3ms verify, needs trusted setup. ' +
              'STARK: ~45KB (expensive gas), 15ms verify, transparent, post-quantum, fast prover. ' +
              'PLONK: ~1.2KB (moderate gas), 5ms verify, universal setup. ' +
              'Recommended: PLONK for flexibility, or STARK-inside-Groth16 recursion ' +
              '(transparent prover + small on-chain proof). Best compromise for Sui: Groth16 ' +
              'with trusted setup run by credential issuer consortium.'
          },
          {
            type: 'comparison',
            question:
              'Compare the three compilation strategies (Fiat-Shamir+KZG, BCS+Merkle, Fiat-Shamir+KZG ' +
              'for PLONK). What security model does each assume, and what are the post-quantum implications?',
            hint:
              'KZG relies on pairings (broken by quantum computers). Merkle hashing is post-quantum. ' +
              'The random oracle model is needed for Fiat-Shamir.',
            answer:
              'F-S+KZG (Groth16/PLONK): random oracle + pairing assumptions, NOT post-quantum. ' +
              'BCS+Merkle (STARK): random oracle only, IS post-quantum (hash-based). ' +
              'For thesis: long-term credentials (10+ years) argue for STARK path; ' +
              'short-term (1-2 years) favors KZG for gas efficiency.'
          }
        ]
      }
    ]
  }
};
