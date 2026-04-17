/**
 * Ch 2.2 Study Guide — Confidential Transactions & Range Proofs
 * Data file loaded by the study plan website.
 */

window.CH22_GUIDE = {
  block1: {
    title: "Confidential Transactions & Range Proofs",
    connectionsSummary:
      "Confidential transactions are the cryptographic backbone of private " +
      "payments. Instead of storing transaction amounts as plain numbers, " +
      "values are hidden inside Pedersen commitments — curve points that " +
      "preserve the ability to verify balance without revealing amounts. " +
      "Range proofs (especially Bulletproofs) prevent inflation attacks by " +
      "proving committed values are non-negative. Mimblewimble extends this " +
      "by eliminating addresses entirely. The ElGamal auditor key pattern " +
      "enables selective auditability — a critical requirement for your " +
      "thesis where compliance must coexist with privacy.",
    concepts: [
      {
        name: "Pedersen Commitments",
        analogy:
          "A sealed envelope with a numeric lock. You write a number on a " +
          "piece of paper, add a random 'salt' number, seal both in an " +
          "envelope, and lock it with a special combination lock. Nobody " +
          "can open the envelope (hiding), but you can later prove what " +
          "number is inside without opening it. The mathematical magic: " +
          "sealed envelopes can be added together, and the sum envelope " +
          "contains the sum of the numbers inside.",
        diagram:
          '┌─────────────────────────────────────────────────────┐\n' +
          '│              Pedersen Commitment                    │\n' +
          '├─────────────────────────────────────────────────────┤\n' +
          '│                                                     │\n' +
          '│  C = v * G + r * H                                  │\n' +
          '│                                                     │\n' +
          '│  v = value (the secret amount)                      │\n' +
          '│  r = blinding factor (random, keeps v hidden)       │\n' +
          '│  G, H = generator points (public, nobody knows      │\n' +
          '│         the discrete log between them)              │\n' +
          '│                                                     │\n' +
          '│  HOMOMORPHIC PROPERTY:                              │\n' +
          '│  C1 = v1*G + r1*H                                  │\n' +
          '│  C2 = v2*G + r2*H                                  │\n' +
          '│  C1 + C2 = (v1+v2)*G + (r1+r2)*H                   │\n' +
          '│                                                     │\n' +
          '│  → Sum of commitments = commitment to sum of values │\n' +
          '│  → Verify balance WITHOUT knowing any amounts!      │\n' +
          '└─────────────────────────────────────────────────────┘',
        diagram_mermaid:
          'flowchart TD\n' +
          '  V["value v<br/><i>secret amount</i>"]\n' +
          '  R["blinding factor r<br/><i>random, hides v</i>"]\n' +
          '  G["generator G<br/>public"]\n' +
          '  H["generator H<br/>public, unknown log_G(H)"]\n' +
          '  V --> C["C = v·G + r·H<br/><b>Pedersen commitment</b>"]\n' +
          '  R --> C\n' +
          '  G --> C\n' +
          '  H --> C\n' +
          '  C --> HOM["Homomorphic property<br/>C1 + C2 = (v1+v2)·G + (r1+r2)·H"]\n' +
          '  HOM --> OUT["Sum of commitments = commitment to sum<br/>verify balance without revealing amounts"]\n' +
          '  classDef primitive fill:#111827,stroke:#F59E0B,color:#fff\n' +
          '  classDef step fill:#1f2937,stroke:#6366F1,color:#fff\n' +
          '  classDef result fill:#1a1a1a,stroke:#06B6D4,color:#fff\n' +
          '  classDef threat fill:#1f2937,stroke:#EF4444,color:#fff\n' +
          '  class V,R,G,H primitive\n' +
          '  class C,HOM step\n' +
          '  class OUT result',
        keyPoints: [
          "Perfectly hiding: given C, an adversary cannot determine v (information-theoretic)",
          "Computationally binding: committer cannot open to a different value (relies on discrete log)",
          "Homomorphic: sum of commitments = commitment to sum of values",
          "The coin IS the commitment — UTXOs are curve points, not numbers",
          "Used in: Confidential Transactions, Mimblewimble, Bulletproofs, your thesis payment system"
        ],
        connections:
          "Pedersen commitments are the foundation of the confidential " +
          "payment layer in your thesis. Every transaction amount is " +
          "stored as a commitment on Sui. The homomorphic property lets " +
          "validators verify conservation of value (inputs = outputs) " +
          "without learning any amounts. Combined with Bulletproof range " +
          "proofs, this prevents inflation attacks while maintaining privacy.",
        publicPrivate: [
          { item: "generators G, H", status: "public", holder: "everyone", when: "system parameters" },
          { item: "commitment C", status: "public", holder: "on-chain", when: "after transaction" },
          { item: "value v", status: "private", holder: "sender + receiver", when: "always hidden" },
          { item: "blinding factor r", status: "private", holder: "owner of the commitment", when: "acts as private key" }
        ],
        thesisExample:
          "In your thesis system on Sui, when Alice sends 100 tokens to Bob, " +
          "the transaction contains: C_in = 500*G + r1*H (Alice's input), " +
          "C_out1 = 100*G + r2*H (Bob gets), C_out2 = 400*G + r3*H (Alice's change). " +
          "Validators check C_in - C_out1 - C_out2 = 0*G + (r1-r2-r3)*H = commitment " +
          "to zero. Balance verified, amounts hidden. The excess blinding factor " +
          "(r1-r2-r3) serves as a transaction kernel signature.",
        history: {
          inventor: "Torben Pedersen (Aarhus University)",
          year: 1991,
          context:
            "Published 'Non-Interactive and Information-Theoretic Secure Verifiable " +
            "Secret Sharing' at CRYPTO 1991. Before Pedersen, commitment schemes were " +
            "either computationally hiding or information-theoretically hiding, but not " +
            "both efficiently in a single practical construction. Pedersen gave the first " +
            "practical scheme achieving information-theoretic hiding combined with " +
            "computational binding, based on the discrete logarithm assumption.",
          funFact:
            "The scheme is so elegant it fits in a single equation (C = vG + rH), " +
            "yet it underpins billions of dollars in confidential transactions across " +
            "Monero, Mimblewimble, and enterprise blockchains today."
        },
        limitations: [
          "Computationally binding only -- if quantum computers break discrete log, " +
          "an adversary could open a commitment to any value they choose",
          "Requires NOTHING-UP-MY-SLEEVE generation of H -- if anyone knows log_G(H), " +
          "binding breaks completely (can commit to v then open as v', since " +
          "v*G + r*H = v'*G + r'*H is solvable when the discrete log relation is known)",
          "Homomorphic property is double-edged: enables CT balance verification " +
          "but also enables algebraic manipulation if range proofs are absent " +
          "(attacker can commit to negative values that sum to zero)"
        ],
        exercises: [
          {
            type: "calculation",
            question:
              "On a toy curve where G=1 and H=7 (think of these as integers mod 11 " +
              "for simplicity), compute the Pedersen commitment C = v*G + r*H for " +
              "v=7, r=3. Then compute a second commitment for v=4, r=5. Verify the " +
              "homomorphic property by adding both commitments and comparing with " +
              "a direct commitment to v=11, r=8.",
            hint:
              "Just do integer arithmetic mod 11: C1 = 7*1 + 3*7 = 28 mod 11. " +
              "C2 = 4*1 + 5*7 = 39 mod 11.",
            answer:
              "C1 = 7*1 + 3*7 = 7 + 21 = 28 = 6 (mod 11). " +
              "C2 = 4*1 + 5*7 = 4 + 35 = 39 = 6 (mod 11). " +
              "C1 + C2 = 6 + 6 = 12 = 1 (mod 11). " +
              "Direct: C_sum = 11*1 + 8*7 = 11 + 56 = 67 = 1 (mod 11). " +
              "They match, confirming the homomorphic property: Commit(v1,r1) + Commit(v2,r2) = Commit(v1+v2, r1+r2)."
          },
          {
            type: "conceptual",
            question:
              "Explain precisely why knowledge of log_G(H) = x (i.e., H = x*G) " +
              "breaks the binding property of Pedersen commitments. Give a concrete " +
              "attack: how would an adversary open commitment C to two different values?",
            hint:
              "If H = x*G, then v*G + r*H = v*G + r*x*G = (v + r*x)*G. " +
              "Think about what freedom this gives in choosing v' and r'.",
            answer:
              "If the adversary knows x such that H = x*G, then C = v*G + r*H = " +
              "(v + r*x)*G. To open to a different value v', the adversary sets " +
              "r' = r + (v - v')/x (mod curve order). Then v'*G + r'*H = " +
              "v'*G + (r + (v-v')/x)*x*G = v'*G + r*x*G + (v-v')*G = " +
              "(v' + r*x + v - v')*G = (v + r*x)*G = C. The adversary has opened " +
              "the same commitment to a completely different value, breaking binding."
          },
          {
            type: "comparison",
            question:
              "Compare Pedersen commitments (C = vG + rH) with hash-based commitments " +
              "(C = Hash(v || r)) for use in Confidential Transactions. Consider: " +
              "hiding guarantee, binding guarantee, homomorphism, proof size, and " +
              "quantum resistance. Which is better for CT and why?",
            hint:
              "Hash-based commitments are computationally hiding (not information-theoretic) " +
              "but can be quantum-resistant if the hash is. The key differentiator for CT " +
              "is the homomorphic property.",
            answer:
              "Pedersen: information-theoretically hiding (perfect), computationally " +
              "binding (DL assumption), homomorphic (sums verify without opening), " +
              "not quantum-resistant. Hash-based: computationally hiding (hash preimage), " +
              "computationally binding (collision resistance), NOT homomorphic, " +
              "potentially quantum-resistant (with post-quantum hash). " +
              "For CT, Pedersen wins because homomorphism is essential: validators must " +
              "verify sum(inputs) = sum(outputs) without learning any amounts. With " +
              "hash-based commitments, this would require opening every commitment to " +
              "the validator, defeating the purpose of confidential transactions entirely."
          }
        ]
      },
      {
        name: "Bulletproofs",
        analogy:
          "A magic weighing scale. Imagine you need to prove your luggage weighs " +
          "between 0 and 23 kg for a flight, but you do not want anyone to know " +
          "the exact weight (maybe it is full of gold bars). A Bulletproof is " +
          "like a special certificate from a trusted scale that says 'weight is " +
          "in the valid range' without printing the actual number. The certificate " +
          "itself is tiny — just a few hundred bytes — no matter how precise the " +
          "range is.",
        diagram:
          '┌─────────────────────────────────────────────────────┐\n' +
          '│             Bulletproofs Range Proof                 │\n' +
          '├─────────────────────────────────────────────────────┤\n' +
          '│                                                     │\n' +
          '│  PROBLEM: Pedersen commitments hide values, but      │\n' +
          '│  what stops someone from committing to -5?           │\n' +
          '│                                                     │\n' +
          '│  Attack: C_in = 5*G + r1*H                          │\n' +
          '│          C_out1 = 10*G + r2*H  (attacker keeps 10!) │\n' +
          '│          C_out2 = -5*G + r3*H  (negative = huge mod n)│\n' +
          '│          Balance: 5 - 10 - (-5) = 0  ✓  INFLATION!  │\n' +
          '│                                                     │\n' +
          '│  SOLUTION: Range proof proves v ∈ [0, 2^64)          │\n' +
          '│                                                     │\n' +
          '│  Proof Size Progression:                             │\n' +
          '│  Borromean:      ~5,000 bytes  ████████████████████  │\n' +
          '│  Bulletproofs:     ~672 bytes  █████                 │\n' +
          '│  Bulletproofs+:    ~576 bytes  ████                  │\n' +
          '│  Bulletproofs++:   ~416 bytes  ███                   │\n' +
          '│                                                     │\n' +
          '│  Core technique: Inner Product Argument              │\n' +
          '│  Recursive halving: O(log n) proof size              │\n' +
          '│  NO trusted setup (unlike SNARKs)                    │\n' +
          '└─────────────────────────────────────────────────────┘',
        diagram_mermaid:
          'flowchart TD\n' +
          '  PB["<b>Problem</b>: Pedersen hides v,<br/>nothing stops committing to −5"]\n' +
          '  AT["<b>Inflation attack</b><br/>C_in = 5·G + r1·H<br/>C_out1 = 10·G + r2·H<br/>C_out2 = −5·G + r3·H<br/>balance 5 − 10 − (−5) = 0 ✓"]\n' +
          '  SOL["Range proof<br/>prove v ∈ [0, 2^64)"]\n' +
          '  IPA["Inner product argument<br/>recursive halving → O(log n)<br/>no trusted setup"]\n' +
          '  PB --> AT --> SOL --> IPA\n' +
          '  IPA --> R1["Borromean ≈ 5000 B"]\n' +
          '  IPA --> R2["Bulletproofs ≈ 672 B"]\n' +
          '  IPA --> R3["Bulletproofs+ ≈ 576 B"]\n' +
          '  IPA --> R4["Bulletproofs++ ≈ 416 B"]\n' +
          '  classDef primitive fill:#111827,stroke:#F59E0B,color:#fff\n' +
          '  classDef step fill:#1f2937,stroke:#6366F1,color:#fff\n' +
          '  classDef result fill:#1a1a1a,stroke:#06B6D4,color:#fff\n' +
          '  classDef threat fill:#1f2937,stroke:#EF4444,color:#fff\n' +
          '  class PB primitive\n' +
          '  class SOL,IPA step\n' +
          '  class R1,R2,R3,R4 result\n' +
          '  class AT threat',
        keyPoints: [
          "Proves a committed value is in [0, 2^64) without revealing it",
          "O(log n) proof size via inner product argument — ~672 bytes for 64-bit",
          "No trusted setup (unlike Groth16/PLONK) — relies only on discrete log assumption",
          "Aggregation: multiple range proofs compressed together (8 proofs ≈ 866 bytes, not 8x672)",
          "Bulletproofs++ (2024): reciprocal range proofs, ~416 bytes — 38% smaller",
          "Advisor preference: Bulletproofs over SNARKs for range proofs specifically (simpler, no toxic waste)"
        ],
        connections:
          "Bulletproofs are the range proof mechanism your advisor specifically " +
          "recommended. Every confidential output in your payment system needs " +
          "a Bulletproof to prevent inflation. The no-trusted-setup property is " +
          "critical — a compromised trusted setup in a currency means someone " +
          "can print money. Bulletproofs++ is the target implementation.",
        publicPrivate: [
          { item: "range proof", status: "public", holder: "on-chain", when: "attached to every output" },
          { item: "commitment C", status: "public", holder: "on-chain", when: "the output being range-proved" },
          { item: "value v", status: "private", holder: "prover (tx sender)", when: "never revealed" },
          { item: "proof verification", status: "public", holder: "any validator", when: "O(n) group operations" }
        ],
        thesisExample:
          "In your system, every transaction output includes a Bulletproof++ " +
          "range proof (~416 bytes) proving the committed amount is non-negative. " +
          "This is verified by Sui validators as part of transaction validation. " +
          "The fastcrypto library already has Bulletproofs support — your thesis " +
          "extends it with Bulletproofs++ and integrates it with the ElGamal " +
          "auditor key pattern for selective compliance.",
        history: {
          inventor:
            "Benedikt Bunz (Stanford), Jonathan Bootle (UCL), Dan Boneh (Stanford), " +
            "Andrew Poelstra (Blockstream), Pieter Wuille (Blockstream), Greg Maxwell (Blockstream)",
          year: 2018,
          context:
            "Published 'Bulletproofs: Short Proofs for Confidential Transactions and More' " +
            "at IEEE S&P 2018. Before Bulletproofs, Greg Maxwell's Confidential Transactions " +
            "proposal (2015) used Borromean ring signatures producing ~5KB per range proof, " +
            "making CT impractical for Bitcoin due to blockchain bloat. Bulletproofs reduced " +
            "proofs to ~672 bytes using an inner product argument with logarithmic communication, " +
            "finally making CT viable at scale.",
          funFact:
            "Monero adopted Bulletproofs in October 2018 (just months after publication), " +
            "reducing average transaction sizes by ~80%. Grin and Beam both launched on " +
            "January 15, 2019 -- the same day -- as independent Mimblewimble implementations " +
            "using Bulletproofs."
        },
        limitations: [
          "Verification is O(n) group operations -- slower than SNARK verification " +
          "which is O(1), making Bulletproofs less competitive for large general-purpose circuits",
          "No succinctness for general computation -- the inner product argument is " +
          "efficient for range proofs and specific R1CS instances, but not practical " +
          "as a general-purpose ZK proof system",
          "Prover time is O(n) with larger constants than some SNARK provers, " +
          "and proving is single-threaded in naive implementations (parallelization requires " +
          "multi-scalar multiplication optimizations)",
          "Not quantum-secure -- relies on the discrete log assumption on elliptic curves, " +
          "which Shor's algorithm breaks"
        ],
        exercises: [
          {
            type: "calculation",
            question:
              "Bulletproof proof size for a single 64-bit range proof is " +
              "2*ceil(log2(64))*32 + 9*32 = 2*6*32 + 288 = 672 bytes. " +
              "Aggregated proofs share the inner product argument: for m proofs, " +
              "size = 2*ceil(log2(64*m))*32 + 9*32. Compute the proof size for " +
              "1, 4, and 8 aggregated 64-bit range proofs. What is the per-proof " +
              "cost at each level?",
            hint:
              "For m=4: log2(64*4) = log2(256) = 8, so size = 2*8*32 + 9*32. " +
              "For m=8: log2(64*8) = log2(512) = 9.",
            answer:
              "m=1: 2*6*32 + 9*32 = 384 + 288 = 672 bytes (672/proof). " +
              "m=4: 2*8*32 + 9*32 = 512 + 288 = 800 bytes (200/proof). " +
              "m=8: 2*9*32 + 9*32 = 576 + 288 = 864 bytes (108/proof). " +
              "Aggregation is extremely efficient: 8 proofs cost only 864 bytes total, " +
              "compared to 8*672 = 5,376 bytes without aggregation -- an 84% reduction. " +
              "The logarithmic growth of the inner product argument makes batch " +
              "verification in blocks highly practical."
          },
          {
            type: "conceptual",
            question:
              "Explain why the absence of a trusted setup is critical for a " +
              "cryptocurrency range proof system. What specific attack becomes " +
              "possible if a trusted setup is compromised in the context of " +
              "Confidential Transactions?",
            hint:
              "Think about what 'toxic waste' from a trusted setup ceremony " +
              "allows the holder to do. In a SNARK-based range proof, a " +
              "compromised setup lets you create valid proofs for false statements.",
            answer:
              "If a trusted setup is compromised (the 'toxic waste' secret is recovered), " +
              "an attacker can forge valid range proofs for any value -- including negative " +
              "values or values exceeding the actual balance. In a Confidential Transaction " +
              "system, this means the attacker can create money out of thin air: commit to " +
              "a negative output that passes range proof verification, effectively printing " +
              "unlimited currency. This is undetectable because the amounts are hidden. " +
              "Bulletproofs eliminate this risk entirely -- security depends only on the " +
              "discrete log assumption, with no ceremony, no multi-party computation, " +
              "and no toxic waste to protect."
          },
          {
            type: "comparison",
            question:
              "Compare Bulletproofs, Groth16, and STARKs for use as range proof " +
              "systems in Confidential Transactions. Build a comparison table with " +
              "these dimensions: proof size, verification time, prover time, " +
              "trusted setup, quantum resistance, and suitability for on-chain CT.",
            hint:
              "Groth16 has the smallest proofs (~192 bytes) but requires a trusted " +
              "setup per circuit. STARKs have large proofs (~50-200 KB) but are " +
              "quantum-resistant and have no trusted setup.",
            answer:
              "Bulletproofs: ~672B proof, O(n) verification (~3ms), O(n) proving (~30ms), " +
              "no trusted setup, not quantum-resistant. Best for CT range proofs. " +
              "Groth16: ~192B proof, O(1) verification (~1ms), O(n) proving (~50ms), " +
              "REQUIRES trusted setup (toxic waste = money printing), not quantum-resistant. " +
              "Unacceptable risk for currency despite smallest proofs. " +
              "STARKs: ~50-200KB proof, O(log^2 n) verification (~5ms), O(n log n) proving, " +
              "no trusted setup, quantum-resistant. Proof size is prohibitive for on-chain CT " +
              "(would dominate transaction size). " +
              "Conclusion: Bulletproofs hit the sweet spot for CT -- small enough proofs, " +
              "no trusted setup risk, and verification is fast enough for block validation. " +
              "STARKs may become relevant when recursive composition reduces proof sizes."
          }
        ]
      },
      {
        name: "Mimblewimble",
        analogy:
          "A restaurant where everyone eats in the dark. In a normal " +
          "restaurant (Bitcoin), everyone can see who ordered what and " +
          "how much they paid. In the Mimblewimble restaurant, there are " +
          "no names on the bill, no menu items listed, and at the end of " +
          "the night, if everyone ate in the dark but the kitchen's total " +
          "food used matches the total money collected, the books balance. " +
          "Even better: if Alice passed food to Bob who passed it to Carol, " +
          "the intermediate step is erased from the records entirely (cut-through).",
        diagram:
          '┌─────────────────────────────────────────────────────┐\n' +
          '│              Mimblewimble Transaction               │\n' +
          '├─────────────────────────────────────────────────────┤\n' +
          '│                                                     │\n' +
          '│  No addresses. No scripts. Only commitments.        │\n' +
          '│  Ownership = knowledge of blinding factor r.        │\n' +
          '│                                                     │\n' +
          '│  Transaction:                                       │\n' +
          '│  Inputs:  [C_in1, C_in2]   (spent commitments)     │\n' +
          '│  Outputs: [C_out1, C_out2] (new commitments)       │\n' +
          '│  Kernel:  excess + signature + fee                  │\n' +
          '│                                                     │\n' +
          '│  CUT-THROUGH:                                       │\n' +
          '│  Tx1: A ──→ B, C       Tx2: B ──→ D, E             │\n' +
          '│  After cut-through: A ──→ C, D, E   (B disappears!) │\n' +
          '│  Kernels K1, K2 persist (proof of authorization)    │\n' +
          '│                                                     │\n' +
          '│  Full node only needs:                              │\n' +
          '│  • Block headers                                    │\n' +
          '│  • Unspent outputs (current UTXO set)              │\n' +
          '│  • All kernels (one per historical tx)             │\n' +
          '│  • Range proofs for unspent outputs                │\n' +
          '└─────────────────────────────────────────────────────┘',
        diagram_mermaid:
          'flowchart TD\n' +
          '  TX["Mimblewimble transaction<br/>no addresses, no scripts<br/>ownership = knowledge of r"]\n' +
          '  IN["Inputs<br/>[C_in1, C_in2]<br/>spent commitments"]\n' +
          '  OUT["Outputs<br/>[C_out1, C_out2]<br/>new commitments"]\n' +
          '  K["Kernel<br/>excess + signature + fee"]\n' +
          '  TX --> IN\n' +
          '  TX --> OUT\n' +
          '  TX --> K\n' +
          '  K --> CT["Cut-through<br/>Tx1: A → B,C and Tx2: B → D,E<br/>after: A → C,D,E (B disappears)<br/>kernels K1, K2 persist"]\n' +
          '  CT --> NODE["Full node only needs:<br/>• block headers<br/>• current UTXO set<br/>• all kernels (1 per tx)<br/>• range proofs for unspent outputs"]\n' +
          '  classDef primitive fill:#111827,stroke:#F59E0B,color:#fff\n' +
          '  classDef step fill:#1f2937,stroke:#6366F1,color:#fff\n' +
          '  classDef result fill:#1a1a1a,stroke:#06B6D4,color:#fff\n' +
          '  classDef threat fill:#1f2937,stroke:#EF4444,color:#fff\n' +
          '  class IN,OUT,K primitive\n' +
          '  class TX,CT step\n' +
          '  class NODE result',
        keyPoints: [
          "Extends CT: no addresses at all, ownership proved by blinding factor knowledge",
          "Interactive transaction construction (sender + receiver must coordinate — biggest UX hurdle)",
          "Cut-through: intermediate outputs cancel algebraically, dramatic blockchain size reduction",
          "Kernels persist forever: proof of authorization even after cut-through",
          "Implementations: Grin (Rust, clean), Beam (C++, auditable), Litecoin MWEB (opt-in)",
          "Limitations: interactivity, no scripting, mempool graph leakage"
        ],
        connections:
          "Mimblewimble is a reference architecture, not the thesis target. " +
          "The key insights to borrow: coins as commitments (not values), " +
          "kernel excess as transaction authorization, and the idea that " +
          "addresses are unnecessary when ownership is cryptographic. " +
          "Your thesis applies these ideas on Sui's account model rather " +
          "than UTXO, which requires a different design (closer to Aptos's " +
          "Twisted ElGamal approach).",
        publicPrivate: [
          { item: "commitment C", status: "public", holder: "on-chain", when: "the UTXO" },
          { item: "blinding factor r", status: "private", holder: "owner (= private key)", when: "never revealed" },
          { item: "kernel excess", status: "public", holder: "on-chain", when: "persists after cut-through" },
          { item: "amount v", status: "private", holder: "sender + receiver", when: "never on-chain" },
          { item: "transaction graph", status: "private", holder: "erased by cut-through", when: "after block inclusion" }
        ],
        thesisExample:
          "Your thesis does not use Mimblewimble directly (Sui is account-based, " +
          "not UTXO). However, the core idea — replacing plaintext amounts with " +
          "Pedersen commitments and using range proofs — is exactly what the " +
          "advisor recommended. The Aptos approach (Twisted ElGamal on account " +
          "balances) adapts these Mimblewimble ideas to an account model, " +
          "which is closer to what you will build on Sui.",
        history: {
          inventor: "Anonymous ('Tom Elvis Jedusor'), formalized by Andrew Poelstra (Blockstream)",
          year: 2016,
          context:
            "In August 2016, an anonymous author using the pseudonym 'Tom Elvis Jedusor' " +
            "(Voldemort's French name in Harry Potter) dropped a whitepaper on a Bitcoin " +
            "research IRC channel and vanished. Andrew Poelstra formalized the protocol " +
            "in October 2016. Two independent implementations launched simultaneously on " +
            "January 15, 2019: Grin (community-driven, fair launch, no premine) and Beam " +
            "(VC-backed, with a development treasury).",
          funFact:
            "The name 'Mimblewimble' is the tongue-tying curse from Harry Potter -- fitting " +
            "for a protocol that prevents the blockchain from 'speaking' transaction details. " +
            "The mysterious author has never been identified."
        },
        limitations: [
          "Interactive transactions -- sender and receiver must exchange data to co-construct " +
          "a transaction (Grin's Slatepack protocol helps, but this remains a major UX hurdle " +
          "compared to Bitcoin's send-to-address model)",
          "No scripting capability -- cannot natively support multisig, time-locked contracts, " +
          "atomic swaps, or DeFi without workarounds like scriptless scripts via adaptor signatures, " +
          "which are limited in expressiveness",
          "Transaction graph leakage in the mempool before cut-through -- a surveillance node " +
          "connecting to many peers can observe the original transaction graph before block " +
          "inclusion (Dandelion++ mitigates by randomizing propagation paths but does not " +
          "fully solve the problem)",
          "Quantum vulnerability -- the entire security model rests on Pedersen commitments " +
          "and Bulletproofs, both of which break if discrete log is broken by a quantum computer"
        ],
        exercises: [
          {
            type: "calculation",
            question:
              "Demonstrate cut-through on a 3-transaction chain. " +
              "Tx1: Alice (input C_A = 10G + r1*H) sends to Bob (C_B = 7G + r2*H) " +
              "with change C_A2 = 3G + r3*H. " +
              "Tx2: Bob (input C_B = 7G + r2*H) sends to Carol (C_C = 5G + r4*H) " +
              "with change C_B2 = 2G + r5*H. " +
              "Tx3: Carol (input C_C = 5G + r4*H) sends to Dave (C_D = 5G + r6*H). " +
              "After cut-through, which outputs remain? Which are eliminated?",
            hint:
              "Cut-through removes any output that appears as both an output in one " +
              "transaction and an input in a subsequent transaction. C_B appears as " +
              "Tx1 output and Tx2 input. C_C appears as Tx2 output and Tx3 input.",
            answer:
              "C_B (7G + r2*H) is created in Tx1 and spent in Tx2 -- eliminated. " +
              "C_C (5G + r4*H) is created in Tx2 and spent in Tx3 -- eliminated. " +
              "Remaining after cut-through: Input C_A (10G + r1*H), Outputs C_A2 (3G + r3*H), " +
              "C_B2 (2G + r5*H), C_D (5G + r6*H). Kernels K1, K2, K3 all persist as proof " +
              "of authorization. Verification: C_A - C_A2 - C_B2 - C_D = " +
              "(10-3-2-5)*G + (r1-r3-r5-r6)*H = 0*G + excess*H. The intermediate " +
              "transactions are invisible -- as if Alice directly paid Carol's recipients."
          },
          {
            type: "conceptual",
            question:
              "Why does Mimblewimble require interactive transaction construction " +
              "(sender and receiver must communicate), while Bitcoin does not? " +
              "What specific role does the receiver play in building the transaction?",
            hint:
              "In Bitcoin, the sender constructs the entire transaction alone because " +
              "outputs are locked to the receiver's address (a public script). In MW, " +
              "there are no addresses. Think about who chooses the blinding factor for " +
              "the output commitment.",
            answer:
              "In Bitcoin, the sender creates an output locked to the receiver's public key hash -- " +
              "no communication needed because the locking script is deterministic from the address. " +
              "In Mimblewimble, ownership means knowledge of the blinding factor r. The receiver MUST " +
              "choose their own blinding factor for the output commitment (otherwise the sender would " +
              "know r and could spend the funds). The receiver also contributes to the kernel signature " +
              "that proves the transaction excess sums to zero. This multi-round exchange (sender " +
              "proposes, receiver adds their blinding factor and partial signature, sender finalizes) " +
              "is fundamentally interactive and cannot be made non-interactive without introducing " +
              "addresses or a receiver-online assumption."
          },
          {
            type: "design",
            question:
              "How would you add time-locked contracts to Mimblewimble without " +
              "a scripting language? Consider scriptless scripts with adaptor " +
              "signatures. Describe a mechanism where Bob can only claim an output " +
              "after block height 1000, with Alice able to reclaim it before then. " +
              "How does this relate to your thesis's payment system on Sui?",
            hint:
              "Adaptor signatures let you make a valid signature conditional on " +
              "knowledge of a secret. A timelock can be enforced by having a " +
              "time-oracle reveal a secret at the target block height.",
            answer:
              "Using adaptor signatures: Alice creates an output C_B for Bob with a partial " +
              "signature that requires knowledge of a secret s to complete. A time-oracle (or " +
              "miners via block header commitment) reveals s at block height 1000. Before height " +
              "1000, Alice holds a pre-signed refund transaction (using a relative timelock). " +
              "After height 1000, Bob learns s and can complete the adaptor signature to claim " +
              "the output. This is clunky: it requires a trusted time-oracle or miner cooperation, " +
              "and only supports simple timelocks (not arbitrary scripts like HTLCs or DeFi). " +
              "For your thesis on Sui, this limitation is irrelevant -- Sui has native Move smart " +
              "contracts, so you get programmable timelocks, multisig, and DeFi natively. The " +
              "challenge is integrating Pedersen commitments with Move's object model rather than " +
              "recreating MW's UTXO-based cut-through."
          }
        ]
      },
      {
        name: "ElGamal Auditor Keys",
        analogy:
          "A special X-ray machine at airport security. Regular passengers " +
          "see nothing in your sealed luggage (privacy). But security officers " +
          "with the right clearance can X-ray specific bags when needed. " +
          "Different officers have different clearance levels: customs sees " +
          "the contents, tax authority sees the value, regular staff sees " +
          "nothing. The ElGamal auditor key is like giving each authority " +
          "their own X-ray machine that only reveals what they need to see.",
        diagram:
          '┌─────────────────────────────────────────────────────┐\n' +
          '│           ElGamal Auditor Key Pattern               │\n' +
          '├─────────────────────────────────────────────────────┤\n' +
          '│                                                     │\n' +
          '│  Alongside each Pedersen commitment:                │\n' +
          '│  C = v*G + r*H         (amount hidden)             │\n' +
          '│                                                     │\n' +
          '│  Add ElGamal ciphertext for auditor:                │\n' +
          '│  enc_v = (k*G, v*G + k*A)   where A = auditor pubkey│\n' +
          '│                                                     │\n' +
          '│  Auditor decrypts:                                  │\n' +
          '│  v*G + k*A - a*(k*G) = v*G  → recover v            │\n' +
          '│                                                     │\n' +
          '│  MULTIPLE AUDITOR KEYS:                             │\n' +
          '│  ┌─────────────────────────────────────────┐        │\n' +
          '│  │ Tax authority:   sees amounts only       │       │\n' +
          '│  │ Compliance:      sees amounts + sender   │       │\n' +
          '│  │ Regulator:       sees everything          │       │\n' +
          '│  │ Public:          sees nothing             │       │\n' +
          '│  └─────────────────────────────────────────┘        │\n' +
          '│                                                     │\n' +
          '│  Equivalents in other systems:                      │\n' +
          '│  • Zcash: viewing keys (ivk/ovk)                   │\n' +
          '│  • Monero: view key (k_v)                          │\n' +
          '│  • Aptos: Twisted ElGamal (owner decrypts balance) │\n' +
          '└─────────────────────────────────────────────────────┘',
        diagram_mermaid:
          'flowchart TD\n' +
          '  PC["Pedersen commitment<br/>C = v·G + r·H<br/><i>amount hidden</i>"]\n' +
          '  EG["ElGamal ciphertext (per auditor)<br/>enc_v = (k·G, v·G + k·A)<br/>A = auditor public key"]\n' +
          '  PC --> TX["On-chain output<br/>C + enc_v published together"]\n' +
          '  EG --> TX\n' +
          '  TX --> DEC["Auditor decrypts with a<br/>(v·G + k·A) − a·(k·G) = v·G<br/>→ recover v (small range DLOG)"]\n' +
          '  DEC --> L1["Tax authority<br/>sees amounts only"]\n' +
          '  DEC --> L2["Compliance<br/>sees amounts + sender"]\n' +
          '  DEC --> L3["Regulator<br/>sees everything"]\n' +
          '  DEC --> L4["Public<br/>sees nothing"]\n' +
          '  DEC --> EQ["Equivalents<br/>Zcash viewing keys (ivk/ovk)<br/>Monero view key k_v<br/>Aptos twisted ElGamal"]\n' +
          '  TX --> T["<b>Threat</b>: auditor key compromise<br/>retro-exposes all past amounts"]\n' +
          '  classDef primitive fill:#111827,stroke:#F59E0B,color:#fff\n' +
          '  classDef step fill:#1f2937,stroke:#6366F1,color:#fff\n' +
          '  classDef result fill:#1a1a1a,stroke:#06B6D4,color:#fff\n' +
          '  classDef threat fill:#1f2937,stroke:#EF4444,color:#fff\n' +
          '  class PC,EG primitive\n' +
          '  class TX,DEC step\n' +
          '  class L1,L2,L3,L4,EQ result\n' +
          '  class T threat',
        keyPoints: [
          "Encrypt (v, r) to auditor's public key alongside each Pedersen commitment",
          "Auditor decrypts and verifies C = v*G + r*H — sees actual amounts, cannot spend",
          "Multiple auditor keys: different disclosure levels for different authorities",
          "Common pattern in enterprise: Zcash viewing keys, Monero view keys",
          "Advisor requirement: 'Ability to have auditors come in. Special keys of the machine to audit.'",
          "Twisted ElGamal (Aptos): ciphertext = (v*G + r*PK, r*G) — owner can decrypt own balance"
        ],
        connections:
          "This is a core advisor requirement for your thesis. The system " +
          "must support selective auditability: a regulator can be given " +
          "a key that reveals transaction amounts without revealing sender " +
          "identity. This is implemented as an ElGamal envelope attached " +
          "to each confidential output. The TEE component in your thesis " +
          "adds proportional disclosure: low-value payments get aggregate " +
          "audit only, high-value gets detailed records.",
        publicPrivate: [
          { item: "auditor public key A", status: "public", holder: "on-chain / well-known", when: "system setup" },
          { item: "audit ciphertext", status: "public", holder: "on-chain", when: "attached to each output" },
          { item: "auditor private key a", status: "private", holder: "auditor only", when: "stored securely" },
          { item: "decrypted amount v", status: "private", holder: "auditor after decrypt", when: "on audit demand" }
        ],
        thesisExample:
          "In your thesis, each confidential transaction on Sui includes an " +
          "ElGamal envelope: enc_v = (k*G, v*G + k*A_regulator). The regulator " +
          "can decrypt all amounts but cannot see who transacted (anonymous " +
          "credentials handle identity). For GDPR proportionality, the TEE " +
          "processes low-value transactions and only produces aggregate stats " +
          "for the auditor, while high-value or suspicious transactions get " +
          "full ElGamal envelopes. This is the commercially friendly tradeoff " +
          "the advisor wants.",
        history: {
          inventor: "Taher ElGamal (Netscape Communications)",
          year: 1985,
          context:
            "Published 'A Public Key Cryptosystem and a Signature Scheme Based on " +
            "Discrete Logarithms' in CRYPTO 1984 proceedings (appeared in Advances in " +
            "Cryptology, 1985). Originally designed as both an encryption and signature " +
            "scheme. The encryption component became foundational for selective disclosure " +
            "in privacy-preserving systems. Zcash adapted the concept as 'viewing keys' " +
            "(ivk/ovk) in the Sapling upgrade (2018), Monero uses a dedicated 'view key' " +
            "(k_v) since launch (2014).",
          funFact:
            "Taher ElGamal was Chief Scientist at Netscape and is often called the " +
            "'father of SSL'. The ElGamal signature scheme (not the encryption) was " +
            "the basis for the DSA standard adopted by NIST, though ElGamal himself " +
            "was not involved in that standardization."
        },
        limitations: [
          "ElGamal is IND-CPA secure but NOT IND-CCA2 -- ciphertexts are malleable: " +
          "an attacker can transform enc(v) into enc(2v) without knowing v by doubling " +
          "both ciphertext components, which is dangerous if ciphertexts are used as " +
          "inputs to other protocols",
          "Value recovery requires solving discrete log on v*G -- practical only for " +
          "small values (brute force or baby-step-giant-step up to about 2^40, which " +
          "takes ~1 million operations). For transaction amounts this is fine, but it " +
          "cannot encrypt arbitrary data",
          "Auditor key is a single point of failure -- compromise of the auditor's " +
          "private key reveals all past and future audited transactions. No key " +
          "rotation without re-encrypting all historical ciphertexts",
          "No forward secrecy -- if the auditor key is compromised at any point in " +
          "the future, all past transactions encrypted to that key are retrospectively " +
          "exposed, unlike protocols with ephemeral key exchange"
        ],
        exercises: [
          {
            type: "calculation",
            question:
              "Using toy numbers: generator G=1 (integers mod 23), auditor private " +
              "key a=5, auditor public key A=a*G=5. Encrypt value v=100 using random " +
              "nonce k=3. Compute the ElGamal ciphertext (R, E) where R=k*G and " +
              "E=v*G + k*A. Then show decryption: the auditor computes E - a*R to " +
              "recover v*G, then brute-forces v.",
            hint:
              "R = k*G = 3*1 = 3. E = v*G + k*A = 100*1 + 3*5 = 115. " +
              "Decryption: E - a*R = 115 - 5*3 = 100. Since G=1, v*G = v directly.",
            answer:
              "Encryption: R = k*G = 3*1 = 3. E = v*G + k*A = 100 + 15 = 115. " +
              "Ciphertext = (R=3, E=115). Decryption: auditor computes E - a*R = " +
              "115 - 5*3 = 115 - 15 = 100 = v*G. Since G=1, v*G = v = 100 directly. " +
              "In a real elliptic curve, the auditor would recover the point v*G and " +
              "need to compute discrete log to find v (practical for values up to ~2^40 " +
              "using baby-step-giant-step or precomputed lookup tables). Note: without " +
              "knowing k, no one else can compute k*A to strip the masking."
          },
          {
            type: "design",
            question:
              "Design a threshold auditor scheme where 2-of-3 auditors must cooperate " +
              "to decrypt transaction amounts. The individual auditor keys are a1, a2, a3 " +
              "with public keys A1, A2, A3. How would you encrypt so that any 2 of the 3 " +
              "can jointly decrypt? How does this mitigate the single-point-of-failure " +
              "limitation? How might this apply to your thesis system?",
            hint:
              "Use Shamir secret sharing on the auditor private key: split a into " +
              "shares (a1, a2, a3) such that any 2 shares can reconstruct a. " +
              "The combined public key A = a*G is used for encryption.",
            answer:
              "Generate a master auditor key a and split it using 2-of-3 Shamir secret sharing " +
              "into shares (a1, a2, a3). The combined public key A = a*G is published. Encrypt " +
              "normally: (R=k*G, E=v*G+k*A). To decrypt, any 2 auditors provide partial " +
              "decryptions: auditor i computes a_i*R. Using Lagrange interpolation on these " +
              "partial decryptions, the group reconstructs a*R = k*A, then recovers v*G = E - a*R. " +
              "This mitigates single-point-of-failure: compromising one auditor key reveals nothing. " +
              "An attacker needs 2 of 3 keys. For the thesis: a 2-of-3 scheme with a regulator, " +
              "a compliance officer, and a judicial authority provides checks and balances -- " +
              "no single entity can surveil transactions unilaterally."
          },
          {
            type: "comparison",
            question:
              "Compare three approaches to selective auditability: (1) ElGamal auditor " +
              "keys as used in your thesis design, (2) Zcash viewing keys (ivk/ovk in " +
              "Sapling), and (3) Canton Network's observer pattern. For each, describe: " +
              "what is revealed to the auditor, what remains hidden, the trust model, " +
              "and the main tradeoff.",
            hint:
              "Zcash viewing keys are derived from the spending key and reveal incoming " +
              "or outgoing transactions. Canton uses access control rather than cryptographic " +
              "disclosure -- observers see plaintext data by being included in the transaction.",
            answer:
              "ElGamal auditor keys: auditor decrypts amounts but not sender identity (anonymous " +
              "credentials protect identity). Cryptographic guarantee -- auditor cannot see more " +
              "than what is encrypted to their key. Tradeoff: no forward secrecy, key compromise " +
              "exposes all history. " +
              "Zcash viewing keys (ivk/ovk): incoming viewing key reveals all received transactions " +
              "(amounts + memo). Outgoing viewing key reveals all sent transactions. Derived from " +
              "spending key, so the holder chooses what to share. Tradeoff: all-or-nothing per " +
              "direction -- cannot reveal amounts without revealing transaction counterparties. " +
              "Canton observer pattern: observers are explicitly added to a contract and see " +
              "plaintext data -- no cryptography involved, purely access control. Tradeoff: no " +
              "mathematical privacy guarantee -- the platform operator (Canton) sees everything " +
              "by design, and disclosure is based on trust, not cryptographic enforcement. " +
              "For the thesis, ElGamal keys are ideal because they decouple amount disclosure " +
              "from identity disclosure, which Zcash viewing keys cannot do."
          }
        ]
      }
    ]
  }
};
