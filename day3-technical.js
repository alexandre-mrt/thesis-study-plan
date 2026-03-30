/**
 * Day 3 Technical Companion — Blockchain Privacy + Integration
 * Deep mathematical content with formal definitions, proofs, and security analysis.
 * Uses KaTeX: \\( for inline math, \\[ for display math.
 */

window.DAY3_TECHNICAL = {
  block1: {
    title: 'Blockchain Privacy (Zcash, Sui, Private Payments)',
    concepts: [
      {
        name: 'Blockchain Transparency Problem',
        formalDefinition:
          'A blockchain transaction \\( \\text{tx} = (\\text{sender}, \\text{receiver}, \\text{amount}, \\text{data}) \\) is a tuple where all fields are publicly visible on the ledger. The state of the chain \\( S = \\{\\text{tx}_1, \\ldots, \\text{tx}_n\\} \\) is a totally ordered, append-only sequence accessible to every participant.',
        mathDetails: [
          {
            subtitle: 'Transaction Graph Analysis',
            content:
              'The transaction history induces a directed multigraph \\( G = (V, E) \\) where \\( V \\) is the set of addresses and \\( E \\) is the set of transactions. Each edge \\( e = (u, v, w, t) \\in E \\) carries a value \\( w \\) and timestamp \\( t \\). Chain analysis exploits structural properties of \\( G \\) to de-anonymize users.',
          },
          {
            subtitle: 'Pseudonymity Model',
            content:
              'An address is derived deterministically from a public key: \\( \\text{addr} = H(\\text{pk}) \\) where \\( H \\) is a hash function (e.g., Keccak-256 for Ethereum, SHA3-256 for Sui). Pseudonymity provides unlinkability only if no address is ever associated with a real-world identity. Once a single link is established, the entire transaction subgraph reachable from that address is de-anonymized.',
          },
          {
            subtitle: 'Common-Input Heuristic',
            content:
              'If a transaction spends multiple UTXOs \\( \\{u_1, \\ldots, u_k\\} \\), the common-input heuristic assumes all inputs belong to the same entity: \\[ \\text{Cluster}(\\text{tx}) = \\{\\text{addr}(u_i) \\mid u_i \\in \\text{inputs}(\\text{tx})\\} \\] This heuristic, combined with change-address detection, allows clustering of addresses into identity groups. Change detection identifies the output that returns surplus value to the sender: if \\( \\sum v_{\\text{in}} - v_{\\text{out,1}} = v_{\\text{out,2}} \\) and \\( v_{\\text{out,2}} \\) is a round number, \\( v_{\\text{out,1}} \\) is likely the change.',
          },
          {
            subtitle: 'Formal Privacy Metric',
            content:
              'The privacy of a transaction can be measured by the entropy of the sender distribution conditioned on observable data: \\[ \\text{Privacy}(\\text{tx}) = H(\\text{sender} \\mid \\text{observed}) = -\\sum_{i=1}^{k} p_i \\log_2 p_i \\] where \\( p_i = \\Pr[\\text{sender} = i \\mid \\text{observed}] \\) and \\( k \\) is the anonymity set size. Perfect privacy yields \\( H = \\log_2 k \\) (uniform distribution). A system provides \\( k \\)-anonymity if the sender is indistinguishable among at least \\( k \\) users, i.e., \\( \\max_i p_i \\leq 1/k \\).',
          },
        ],
        securityAnalysis:
          'Pseudonymous systems offer no formal privacy guarantee against an adversary with auxiliary information. An adversary \\( \\mathcal{A} \\) with access to the transaction graph \\( G \\) and side-channel data (exchange KYC records, IP addresses, timing metadata) can reduce the effective anonymity set to \\( k = 1 \\) for most users. The advantage is: \\( \\text{Adv}_{\\text{deanon}}(\\mathcal{A}) = \\Pr[\\mathcal{A}(G, \\text{aux}) = \\text{sender}] \\). For Bitcoin, empirical studies show \\( \\text{Adv} \\geq 0.6 \\) using graph clustering alone.',
        practicalNotes:
          'Chainalysis and similar firms identify 60-80% of Bitcoin transactions. Ethereum is fully transparent with named contract addresses. Even "private" Layer 2 solutions leak metadata through timing analysis, gas patterns, and access frequency. On-chain privacy requires cryptographic hiding, not just pseudonymity.',
        keyFormulas: [
          {
            name: 'Address derivation',
            formula: '\\( \\text{addr} = H(\\text{pk}) \\)',
          },
          {
            name: 'Anonymity entropy',
            formula:
              '\\( H(\\text{sender} \\mid \\text{observed}) = -\\sum_{i} p_i \\log_2 p_i \\)',
          },
          {
            name: 'k-anonymity condition',
            formula: '\\( \\max_i p_i \\leq 1/k \\)',
          },
        ],
      },

      {
        name: 'Zcash & Shielded Transactions',
        formalDefinition:
          'Zcash implements a shielded UTXO model where transaction outputs (notes) are hidden behind commitments. A note is a tuple \\( \\text{note} = (\\text{pk}_d, v, \\rho, \\text{rcm}) \\) consisting of a diversified payment address, a value, a unique nonce, and commitment randomness. The note commitment \\( \\text{cm} = \\text{PedersenHash}(\\text{repr}(\\text{note})) \\) is added to a global Merkle tree. Spending a note requires publishing a nullifier \\( \\text{nf} = \\text{PRF}_{\\text{nsk}}(\\rho) \\) and a zero-knowledge proof that the note exists and is validly spent.',
        mathDetails: [
          {
            subtitle: 'Note Structure & Commitment',
            content:
              'A Sapling note contains: diversified payment address \\( \\text{pk}_d \\) (derived from recipient diversifier and key), value \\( v \\in [0, 2^{64}) \\), unique nonce \\( \\rho \\) (derived from nullifier of spent note), and randomness \\( \\text{rcm} \\). The commitment is computed as: \\[ \\text{cm} = \\text{PedersenHash}(\\text{repr}(\\text{note})) \\] using the Jubjub curve for in-circuit efficiency. Each new commitment is inserted as a leaf into the global note commitment Merkle tree with root \\( \\text{rt} \\).',
          },
          {
            subtitle: 'Nullifier Derivation',
            content:
              'When spending a note, the owner computes a nullifier: \\[ \\text{nf} = \\text{PRF}_{\\text{nsk}}(\\rho) \\] where \\( \\text{nsk} \\) is the nullifier secret key (part of the spending key) and \\( \\rho \\) is the note nonce. The nullifier is published on-chain. Since \\( \\text{PRF} \\) is a pseudorandom function, the nullifier reveals neither the note nor the spending key. The nullifier set prevents double-spending: a transaction is rejected if its nullifier already exists in the set.',
          },
          {
            subtitle: 'Spend Circuit (Groth16)',
            content:
              'The spend proof demonstrates knowledge of a valid note without revealing it. The formal circuit statement is: \\[ \\exists \\, (\\text{note}, \\text{path}, \\text{sk}) \\text{ such that:} \\] \\[ \\text{cm} = \\text{Commit}(\\text{note}) \\] \\[ \\text{MerklePath}(\\text{cm}, \\text{path}) = \\text{rt} \\] \\[ \\text{nf} = \\text{PRF}_{\\text{nsk}}(\\rho) \\] \\[ v_{\\text{old}} \\geq v_{\\text{new}} \\] The prover demonstrates: (1) knowledge of a valid note whose commitment is in the tree, (2) the Merkle path from that commitment to the published root \\( \\text{rt} \\) is correct, (3) the nullifier is correctly derived, and (4) the note value is sufficient. None of the witness values (note, path, key) are revealed.',
          },
          {
            subtitle: 'Value Commitments & Balance',
            content:
              'Transaction values are hidden using Pedersen commitments on the Jubjub curve: \\[ \\text{cv} = v \\cdot \\mathcal{V} + \\text{rcv} \\cdot \\mathcal{R} \\] where \\( \\mathcal{V}, \\mathcal{R} \\) are independent generators. The homomorphic property enables balance verification without revealing amounts: \\[ \\sum_{i} \\text{cv}_{\\text{in},i} - \\sum_{j} \\text{cv}_{\\text{out},j} = \\text{cv}_{\\text{fee}} \\] This equation is checked in the clear (on the commitments) and holds because Pedersen commitments are additively homomorphic: \\( \\text{Commit}(a, r_a) + \\text{Commit}(b, r_b) = \\text{Commit}(a+b, r_a+r_b) \\).',
          },
          {
            subtitle: 'Sapling vs. Orchard',
            content:
              'Sapling (2018): uses Groth16 proofs on BLS12-381 with Jubjub as the embedded curve. Proving time ~40ms, verification ~10ms, proof size ~192 bytes. Requires a trusted setup (powers-of-tau ceremony). Transaction structure: separate Spend and Output descriptions (more granular than the original 2-in-2-out JoinSplit). Orchard (2022): replaces Groth16 with Halo 2, a recursive proof system requiring NO trusted setup. Uses the Pallas/Vesta curve cycle for efficient recursion. Actions combine spend and output into a single description, improving privacy (spend and output counts are equal).',
          },
        ],
        securityAnalysis:
          'Security rests on three pillars: (1) IND-CCA security of the note encryption scheme — an adversary cannot distinguish between ciphertexts of different notes, (2) Soundness of the spend circuit — no PPT adversary can produce a valid proof for a non-existent note (Groth16 knowledge soundness under the q-PKE assumption in the generic group model), (3) Collision resistance of the Merkle tree hash — no adversary can find two notes with the same commitment. The trusted setup for Groth16 introduces a toxic waste risk: if the ceremony is compromised, an adversary can forge proofs and create counterfeit shielded value.',
        practicalNotes:
          'Shielded transactions are ~1.6KB each (vs. ~250B for transparent). Proving takes ~40ms on desktop, viable on mobile. Despite cryptographic strength, only ~5% of Zcash value resides in shielded pools, limiting the effective anonymity set. The dual-pool design (transparent + shielded) allows chain analysis at pool boundaries (shielding/unshielding transactions).',
        keyFormulas: [
          {
            name: 'Note commitment',
            formula:
              '\\( \\text{cm} = \\text{PedersenHash}(\\text{repr}(\\text{note})) \\)',
          },
          {
            name: 'Nullifier derivation',
            formula: '\\( \\text{nf} = \\text{PRF}_{\\text{nsk}}(\\rho) \\)',
          },
          {
            name: 'Spend circuit statement',
            formula:
              '\\( \\exists \\, (\\text{note}, \\text{path}, \\text{sk}) : \\text{cm} = \\text{Commit}(\\text{note}) \\wedge \\text{MerklePath}(\\text{cm}, \\text{path}) = \\text{rt} \\wedge \\text{nf} = \\text{PRF}_{\\text{nsk}}(\\rho) \\wedge v_{\\text{old}} \\geq v_{\\text{new}} \\)',
          },
          {
            name: 'Value balance equation',
            formula:
              '\\( \\sum \\text{cv}_{\\text{in}} - \\sum \\text{cv}_{\\text{out}} = \\text{cv}_{\\text{fee}} \\)',
          },
        ],
      },

      {
        name: 'Monero Privacy',
        formalDefinition:
          'Monero enforces mandatory privacy through three complementary mechanisms: ring signatures (sender ambiguity), stealth addresses (receiver privacy), and RingCT with Pedersen commitments (amount hiding). Every transaction uses all three, ensuring the anonymity set equals the full transaction set rather than an opt-in subset.',
        mathDetails: [
          {
            subtitle: 'Stealth Address Derivation',
            content:
              'A Monero address is a pair of public keys \\( (A, B) = (aG, bG) \\) where \\( a \\) is the view key and \\( b \\) is the spend key. To send to this address, the sender picks random \\( r \\) and computes a one-time destination key: \\[ P = H_s(rA) \\cdot G + B \\] The sender also publishes \\( R = rG \\) (the transaction public key). The recipient scans transactions by computing \\( P\' = H_s(aR) \\cdot G + B \\) and checking if \\( P\' = P \\). Only the recipient (knowing \\( a \\)) can detect incoming payments. To spend, the recipient derives the private key: \\[ x = H_s(aR) + b \\] Each transaction output gets a unique one-time address, unlinking the recipient from their public address.',
          },
          {
            subtitle: 'Ring Signatures (CLSAG)',
            content:
              'The Compact Linkable Spontaneous Anonymous Group (CLSAG) signature allows signing with private key \\( x_\\pi \\) among a ring of public keys \\( \\{P_1, \\ldots, P_n\\} \\). The verifier is convinced that one of the ring members signed, but cannot determine the index \\( \\pi \\). The signature satisfies: (1) Unforgeability: no adversary can produce a valid signature without knowing a private key in the ring, (2) Anonymity: the index \\( \\pi \\) is computationally hidden under the Decisional Diffie-Hellman (DDH) assumption, (3) Linkability via key images.',
          },
          {
            subtitle: 'Key Image (Double-Spend Prevention)',
            content:
              'Each input includes a key image: \\[ I = x_\\pi \\cdot H_p(P_\\pi) \\] where \\( H_p \\) maps a point to another curve point. The key image is deterministic for a given key pair — spending the same output twice produces the same image \\( I \\). The network maintains a set of used key images and rejects duplicates. Crucially, \\( I \\) does not reveal \\( \\pi \\) (which ring member is the real signer) because computing \\( \\pi \\) from \\( I \\) requires solving the discrete log \\( x_\\pi = \\log_G P_\\pi \\).',
          },
          {
            subtitle: 'RingCT & Pedersen Commitments',
            content:
              'RingCT hides transaction amounts using Pedersen commitments: \\[ C_i = a_i G + b_i H \\] where \\( a_i \\) is the amount and \\( b_i \\) is a blinding factor, with \\( G, H \\) independent generators (discrete log of \\( H \\) w.r.t. \\( G \\) is unknown). Balance is verified homomorphically: \\[ \\sum C_{\\text{in}} - \\sum C_{\\text{out}} = z \\cdot H \\] If the transaction is valid, the excess \\( z \\) is zero (the blinding factors cancel). Miners verify this without learning any amounts.',
          },
          {
            subtitle: 'Bulletproofs+ Range Proofs',
            content:
              'To prevent negative amounts (which would allow inflation), each output includes a range proof demonstrating \\( 0 \\leq a_i < 2^{64} \\) without revealing \\( a_i \\). Bulletproofs+ achieve logarithmic proof size: \\( O(\\log n) \\) where \\( n = 64 \\) is the bit-length. For \\( m \\) outputs, an aggregated proof has size \\( 2 \\lceil \\log_2(64m) \\rceil + 9 \\) group elements, significantly smaller than the original Borromean ring signature range proofs. No trusted setup is required.',
          },
          {
            subtitle: 'Ring Size & Anonymity',
            content:
              'The current mandatory ring size is 16, meaning each transaction input references 16 possible source outputs (1 real + 15 decoys). The effective anonymity set grows with ring size but also increases transaction size linearly. CLSAG reduces signature size compared to the previous MLSAG scheme: a CLSAG signature for ring size \\( n \\) requires \\( n + 1 \\) scalars and 1 key image, vs. \\( 2n + 1 \\) scalars for MLSAG.',
          },
        ],
        securityAnalysis:
          'Security properties: (1) Unforgeability of CLSAG under the One-More Discrete Logarithm assumption, (2) Anonymity of the signer index under DDH, (3) Linkability ensures double-spend detection via key image uniqueness, (4) Computational hiding of Pedersen commitments under the discrete log assumption, (5) Soundness of Bulletproofs+ range proofs under the discrete log assumption. The main limitation is that ring-based anonymity provides a bounded anonymity set (currently 16) compared to the global anonymity set of commitment-based schemes like Zcash.',
        practicalNotes:
          'Transaction size is ~1.4KB with Bulletproofs+ (down from ~13KB with Borromean range proofs). Verification takes ~50ms. Mandatory privacy means the full transaction volume contributes to the anonymity set, unlike Zcash where only ~5% is shielded. Mining is ASIC-resistant (RandomX algorithm), promoting decentralization.',
        keyFormulas: [
          {
            name: 'Stealth address derivation',
            formula: '\\( P = H_s(rA) \\cdot G + B \\)',
          },
          {
            name: 'CLSAG key image',
            formula: '\\( I = x_\\pi \\cdot H_p(P_\\pi) \\)',
          },
          {
            name: 'Pedersen commitment balance',
            formula:
              '\\( \\sum C_{\\text{in}} - \\sum C_{\\text{out}} = z \\cdot H \\)',
          },
        ],
      },

      {
        name: 'Tornado Cash & Mixer Model',
        formalDefinition:
          'Tornado Cash is a non-custodial zero-knowledge mixer on Ethereum. It implements a two-phase protocol: \\( \\text{Deposit}(\\text{commitment}) \\rightarrow \\text{Withdraw}(\\text{proof}, \\text{nullifier}) \\). Users deposit a fixed denomination by submitting a commitment \\( \\text{cm} = H(s \\| n) \\) where \\( s \\) is a secret and \\( n \\) is a nullifier secret. Withdrawal proves knowledge of a valid commitment in the Merkle tree without revealing which one.',
        mathDetails: [
          {
            subtitle: 'Deposit Phase',
            content:
              'The user generates random values: secret \\( s \\) and nullifier secret \\( n \\), both 248-bit field elements. The commitment is: \\[ \\text{cm} = H(s \\| n) \\] where \\( H \\) is the Pedersen hash (or MiMC in earlier versions). The user sends a transaction to the Tornado Cash contract with the commitment and a fixed ETH amount (0.1, 1, 10, or 100 ETH). The contract inserts \\( \\text{cm} \\) as a leaf into an incremental Merkle tree and stores the updated root \\( R \\). Fixed denominations are critical: they ensure all deposits of the same size are indistinguishable.',
          },
          {
            subtitle: 'Merkle Tree Structure',
            content:
              'The contract maintains an incremental Merkle tree of depth 20, supporting up to \\( 2^{20} \\approx 1,048,576 \\) deposits. The tree uses MiMC or Poseidon as the hash function (SNARK-friendly). Historical roots are stored (up to 100) to allow concurrent withdrawals against recent roots. The insertion cost is \\( O(\\text{depth}) = O(20) \\) hashes on-chain.',
          },
          {
            subtitle: 'Withdrawal Circuit (Groth16)',
            content:
              'The withdrawal ZK circuit proves: \\[ \\exists \\, (s, n, \\text{path}) : \\] \\[ \\text{leaf} = H(s \\| n) \\] \\[ \\text{MerklePath}(\\text{leaf}, \\text{path}) = R \\] \\[ \\text{nullifier} = H(n) \\] Public inputs: root \\( R \\), nullifier \\( H(n) \\), recipient address, relayer address, fee. Private inputs (witness): secret \\( s \\), nullifier secret \\( n \\), Merkle path. The circuit has ~28,000 R1CS constraints. The nullifier \\( H(n) \\) is published on-chain to prevent double-withdrawal: the contract rejects any nullifier that has been seen before.',
          },
          {
            subtitle: 'Anonymity Set & Relayer Network',
            content:
              'The anonymity set equals the number of unspent deposits of the same denomination since contract deployment. For the 0.1 ETH pool, this reached ~12,000 deposits, giving \\( \\log_2(12000) \\approx 13.5 \\) bits of anonymity. The relayer network solves the gas payment linkage problem: without a relayer, the withdrawer must pay gas from a funded address, potentially linking the withdrawal. Relayers submit the withdrawal transaction on behalf of the user, deducting a fee from the withdrawn amount.',
          },
        ],
        securityAnalysis:
          'Security relies on: (1) Groth16 soundness (no valid proof for a non-existent commitment), (2) Collision resistance of \\( H \\) (no two distinct \\( (s, n) \\) pairs produce the same commitment), (3) Merkle tree binding (the root uniquely determines the set of leaves), (4) PRF security of the nullifier derivation (nullifier does not leak \\( s \\) or \\( n \\)). The trusted setup risk is mitigated by a multi-party ceremony. Anonymity depends critically on the set size: a pool with few deposits offers weak privacy. Timing analysis (deposit-then-withdraw pattern) can further reduce the effective anonymity set.',
        practicalNotes:
          'Proving takes ~40 seconds in the browser using WASM-compiled Groth16 prover (snarkjs). On-chain verification costs ~300K gas (~$5-15 at typical gas prices). The protocol was sanctioned by OFAC in August 2022, raising fundamental questions about the legality of on-chain privacy tools. The smart contract itself remains immutable and operational on Ethereum.',
        keyFormulas: [
          {
            name: 'Deposit commitment',
            formula: '\\( \\text{cm} = H(s \\| n) \\)',
          },
          {
            name: 'Nullifier derivation',
            formula: '\\( \\text{nullifier} = H(n) \\)',
          },
          {
            name: 'Merkle membership circuit',
            formula:
              '\\( \\exists \\, (s, n, \\text{path}) : H(s \\| n) \\in \\text{tree}(R) \\wedge \\text{nullifier} = H(n) \\)',
          },
        ],
      },

      {
        name: 'Sui Architecture & Privacy Gaps',
        formalDefinition:
          'Sui is an object-centric blockchain using the Move virtual machine with a DAG-based consensus protocol. State is represented as typed objects with unique identifiers, owners, and versions. Unlike account-based chains, Sui enables parallel execution on independent objects and single-writer fast-path for owned objects, achieving sub-second finality.',
        mathDetails: [
          {
            subtitle: 'Object Model',
            content:
              'Everything in Sui is an object with a globally unique ID \\( \\text{id} \\in \\{0,1\\}^{256} \\), an owner (address, another object, or "shared"), a version number, and typed contents defined by a Move struct. Objects are the fundamental unit of storage, ownership, and access control. This differs from the account model (Ethereum) where state is a global mapping \\( \\text{address} \\rightarrow \\text{storage} \\).',
          },
          {
            subtitle: 'Owned vs. Shared Objects',
            content:
              'Owned objects have a single writer (the owner). Transactions on owned objects skip consensus entirely and use Byzantine Consistent Broadcast, achieving finality in ~200ms. Shared objects may be accessed by multiple writers and require full consensus via the Mysticeti protocol (DAG-based BFT), with finality in ~390ms. A transaction is specified as: \\[ \\text{tx} = (\\text{sender}, [\\text{input\\_objects}], \\text{Move\\_call}, \\text{gas\\_budget}) \\] where the input objects determine whether consensus is needed.',
          },
          {
            subtitle: 'Move Type System & Resource Safety',
            content:
              'Move enforces linear types: resources cannot be duplicated (\\( \\text{copy} \\) is restricted) or implicitly dropped (\\( \\text{drop} \\) must be explicit). This means a Coin object cannot be cloned (no double-spend at the language level) and cannot be lost (must be explicitly transferred or destroyed). Formally, if \\( r \\) is a resource, every execution path must consume \\( r \\) exactly once. The borrow checker enforces reference safety at compile time.',
          },
          {
            subtitle: 'Privacy Gaps',
            content:
              'Sui provides zero native privacy: (1) All objects are publicly readable via RPC: \\( \\text{getObject}(\\text{id}) \\rightarrow \\text{full\\_contents} \\), (2) All transactions are publicly visible: sender, called function, arguments, gas, and effects, (3) Object ownership is transparent: \\( \\text{owner}(\\text{obj}) \\) is always known, (4) Move module source and bytecode are public, (5) No native encrypted storage, confidential transactions, or private state. However, the object model is structurally suited for privacy: per-object encryption, per-object ZK proofs, and owned objects as private credential containers are all natural extensions.',
          },
        ],
        securityAnalysis:
          'Sui achieves safety from Move type system (resource linearity prevents double-spend and loss), BFT consensus (Mysticeti tolerates \\( f < n/3 \\) Byzantine validators), and cryptographic authentication (Ed25519/Secp256k1 transaction signatures). The privacy gap means all economic activity is surveilled by default. An adversary with RPC access has a complete view of every user balance, transaction, and interaction pattern.',
        practicalNotes:
          'Sui achieves ~390ms time-to-finality and 100K+ TPS in benchmarks. Move safety prevents entire classes of smart contract bugs (reentrancy, integer overflow in resource logic). The object model makes it a strong candidate for privacy extensions because owned objects naturally map to private credentials (single-owner, no contention, fast-path execution).',
        keyFormulas: [
          {
            name: 'Transaction structure',
            formula:
              '\\( \\text{tx} = (\\text{sender}, [\\text{input\\_objects}], \\text{Move\\_call}, \\text{gas\\_budget}) \\)',
          },
          {
            name: 'Object ownership',
            formula:
              '\\( \\text{owner}(\\text{obj}) \\in \\{\\text{address}, \\text{object\\_id}, \\text{shared}\\} \\)',
          },
        ],
      },

      {
        name: 'Private Payment Requirements',
        formalDefinition:
          'A private payment system must satisfy four privacy properties: sender privacy (who paid), receiver privacy (who was paid), amount privacy (how much), and transaction graph privacy (unlinkability of payment flows). Formally, for each property, no probabilistic polynomial-time adversary should distinguish between any two valid scenarios with non-negligible advantage.',
        mathDetails: [
          {
            subtitle: 'Sender Privacy',
            content:
              'The adversary cannot identify the sender from the transaction with probability better than random guessing within the anonymity set: \\[ \\Pr[\\text{identify sender} \\mid \\text{tx}] \\leq \\frac{1}{|\\text{anonymity set}|} \\] This can be achieved via ring signatures (Monero, \\( k = 16 \\)), mixing (Tornado Cash, \\( k = |\\text{pool}| \\)), or zero-knowledge proofs of Merkle membership (Zcash, \\( k = |\\text{commitment tree}| \\)).',
          },
          {
            subtitle: 'Receiver Privacy',
            content:
              'The receiver should not be identifiable from the transaction. Stealth addresses generate a fresh one-time address per payment. In Zcash, the receiver address is encrypted inside the note ciphertext. The formal requirement: given \\( \\text{tx} \\) and any set of candidate receivers \\( \\{R_1, \\ldots, R_m\\} \\), no adversary can determine the true receiver with advantage greater than \\( 1/m \\).',
          },
          {
            subtitle: 'Amount Privacy via Pedersen Commitments',
            content:
              'Transaction amounts are hidden using Pedersen commitments: \\[ C = vG + rH \\] where \\( v \\) is the value, \\( r \\) is randomness, and \\( G, H \\) are independent generators with unknown discrete log relation. The commitment is computationally hiding (given \\( C \\), \\( v \\) is indistinguishable from random under the DDH assumption) and perfectly binding (no two \\( (v, r) \\) pairs produce the same \\( C \\), given the discrete log hardness of \\( H \\) w.r.t. \\( G \\)). Range proofs (Bulletproofs) ensure \\( v \\geq 0 \\) without revealing \\( v \\).',
          },
          {
            subtitle: 'Graph Privacy & Unlinkability',
            content:
              'Deposits and withdrawals must be unlinkable: \\[ \\Pr[\\text{link}(\\text{deposit}_i, \\text{withdraw}_j) \\mid \\text{chain}] \\leq \\frac{1}{|\\text{anonymity set}|} \\] This requires: (1) no timing correlation (random delay between deposit/withdraw), (2) no amount correlation (fixed denominations), (3) no address reuse (fresh addresses per withdrawal), (4) no metadata leakage (use relayers to avoid gas payment linking).',
          },
          {
            subtitle: 'Compliance Hooks',
            content:
              'Viewing keys enable selective auditability: an auditor with key \\( \\text{vk} \\) can decrypt transaction memos: \\[ \\text{Dec}(\\text{vk}, \\text{encrypted\\_memo}) \\rightarrow (\\text{sender}, \\text{receiver}, v) \\] This preserves privacy for regular users while enabling regulatory compliance. The encryption must be IND-CCA2 secure so that non-auditors learn nothing. For volume thresholds, a user can prove compliance without revealing individual transactions: \\[ \\pi_{\\text{volume}} : \\text{"my total monthly volume"} \\sum v_i < X \\] using a ZK proof over committed values.',
          },
          {
            subtitle: 'Low-Value Optimization',
            content:
              'For transactions below a compliance threshold (e.g., \\( v < 1000 \\) EUR, aligned with EU simplified due diligence), lighter verification reduces latency: smaller range proofs (e.g., 32-bit instead of 64-bit), TEE-based verification instead of on-chain ZKP, or reduced anonymity set requirements. This mirrors real-world AML rules where low-value transactions face less scrutiny.',
          },
        ],
        securityAnalysis:
          'Formal privacy is defined via UC-security against an adaptive adversary who can corrupt participants dynamically. The ideal functionality \\( \\mathcal{F}_{\\text{pay}} \\) reveals only: (1) a payment occurred, (2) the total fee, and (3) information available to the auditor via viewing keys. The simulator must produce a view indistinguishable from real execution. Compliance must not degrade privacy for non-targeted users: viewing keys are per-auditor, and the system should support threshold decryption requiring \\( t \\)-of-\\( n \\) auditors to prevent unilateral surveillance.',
        practicalNotes:
          'The regulatory landscape is evolving: FATF travel rule requires identity exchange above certain thresholds, EU MiCA regulation introduces comprehensive crypto-asset supervision, and some jurisdictions mandate transaction monitoring. The thesis design targets the sweet spot: privacy by default with optional disclosure for compliance, avoiding both the "Monero problem" (no compliance) and the "transparent chain problem" (no privacy).',
        keyFormulas: [
          {
            name: 'Sender anonymity bound',
            formula:
              '\\( \\Pr[\\text{identify sender} \\mid \\text{tx}] \\leq 1/|\\text{anonymity set}| \\)',
          },
          {
            name: 'Pedersen commitment',
            formula: '\\( C = vG + rH \\)',
          },
          {
            name: 'Viewing key decryption',
            formula:
              '\\( \\text{Dec}(\\text{vk}, \\text{encrypted\\_memo}) \\rightarrow (\\text{sender}, \\text{receiver}, v) \\)',
          },
        ],
      },
    ],
  },

  block2: {
    title: 'ZKP+TEE Integration + Thesis Architecture',
    concepts: [
      {
        name: 'Why Combine ZKP + TEE',
        formalDefinition:
          'A hybrid system \\( \\Pi_{\\text{hybrid}} \\) is secure under the disjunction of trust assumptions: \\( \\text{Assumption}_{\\text{ZKP}} \\vee \\text{Assumption}_{\\text{TEE}} \\). If the TEE hardware is intact, the system achieves full privacy with low latency. If the TEE is compromised, ZKP verification still guarantees computational soundness. The system is secure as long as at least one assumption holds.',
        mathDetails: [
          {
            subtitle: 'Pure ZKP Cost Model',
            content:
              'ZKP proving for a circuit \\( C \\) with \\( N \\) constraints costs: \\[ T_{\\text{prove}} = O(N \\log N) \\] dominated by multi-scalar multiplication (MSM) and number-theoretic transform (NTT) operations over the scalar field. For a credential verification circuit with ~100K constraints (BBS+ signature verification + selective disclosure), this translates to ~500ms on desktop, ~2s on mobile. Verification is fast: \\( T_{\\text{verify}} = O(1) \\) for Groth16 (3 pairings), but the proving bottleneck limits real-time applications.',
          },
          {
            subtitle: 'Pure TEE Cost Model',
            content:
              'TEE execution is near-native speed: \\[ T_{\\text{TEE}} = O(|\\text{computation}|) \\cdot c_{\\text{overhead}} \\] where \\( c_{\\text{overhead}} \\approx 1.1\\text{-}1.5\\times \\) for SGX enclave context switches and memory encryption. A credential verification inside a TEE takes ~1-5ms. However, TEE security relies on hardware integrity (Intel/AMD attestation), which has been broken by side-channel attacks (Foreshadow, Plundervolt, AEPIC Leak). The trust model is: Intel is honest AND the hardware is not physically tampered with.',
          },
          {
            subtitle: 'Hybrid Architecture',
            content:
              'The hybrid approach partitions computation: TEE handles expensive pre-computation (witness generation), ZKP handles the final proof: \\[ \\text{TEE}: z = f(w) \\quad \\text{(fast, private)} \\] \\[ \\text{ZKP}: \\text{Prove}(g(z) = \\text{output}) \\quad \\text{(trustless, public)} \\] The ZKP circuit is over \\( g \\) (a simpler function operating on intermediate values \\( z \\)), not over \\( f \\circ g \\) (the full computation). This reduces circuit size and proving time by 10-100x while maintaining trustless verification.',
          },
          {
            subtitle: 'Formal Security: UC Framework',
            content:
              'In the Universal Composability (UC) framework, define ideal functionality \\( \\mathcal{F}_{\\text{hybrid}} \\) that realizes the desired privacy and correctness properties. The real-world protocol \\( \\Pi_{\\text{hybrid}} \\) UC-realizes \\( \\mathcal{F}_{\\text{hybrid}} \\) if: \\[ \\text{REAL}_{\\Pi_{\\text{hybrid}}, \\mathcal{A}} \\approx_c \\text{IDEAL}_{\\mathcal{F}_{\\text{hybrid}}, \\mathcal{S}} \\] for all environments \\( \\mathcal{Z} \\), under the assumption that EITHER the TEE functionality \\( \\mathcal{F}_{\\text{TEE}} \\) is honestly implemented OR the ZKP soundness holds. This gives graceful degradation: TEE compromise does not break soundness, and ZKP assumption failure does not break confidentiality (TEE still protects).',
          },
          {
            subtitle: 'Complementary Guarantees',
            content:
              'TEE provides confidentiality (private data never leaves the enclave in plaintext) while ZKP provides verifiability (anyone can check the proof without trusting the prover). Neither alone suffices: ZKP alone is too slow for real-time credential checks, TEE alone requires trusting hardware vendors. The hybrid provides both properties simultaneously, with each compensating for the weakness of the other.',
          },
        ],
        securityAnalysis:
          'The graceful degradation model ensures: (1) If TEE is intact and ZKP assumption holds: full privacy + fast verification + trustless soundness. (2) If TEE is compromised but ZKP holds: privacy of inputs in transit is lost, but soundness is maintained (no forged proofs). (3) If ZKP assumption fails but TEE is intact: verification requires trusting the TEE, but confidentiality is preserved. (4) If both fail: system is broken. The probability of simultaneous failure is \\( \\Pr[\\text{break}] = \\Pr[\\text{TEE broken}] \\cdot \\Pr[\\text{ZKP broken}] \\), which is negligible if either assumption holds independently.',
        practicalNotes:
          'A 10-100x speedup in ZKP proving is achievable when the TEE pre-computes the witness (decrypting credentials, checking balances, marshaling field elements). The main engineering challenge is secure communication between the TEE enclave and the ZKP prover: the witness must be passed through sealed storage or secure channels to prevent leakage.',
        keyFormulas: [
          {
            name: 'ZKP proving complexity',
            formula: '\\( T_{\\text{prove}} = O(N \\log N) \\)',
          },
          {
            name: 'Hybrid partition',
            formula:
              '\\( \\text{TEE}: z = f(w), \\quad \\text{ZKP}: \\text{Prove}(g(z) = \\text{output}) \\)',
          },
          {
            name: 'UC security',
            formula:
              '\\( \\text{REAL}_{\\Pi, \\mathcal{A}} \\approx_c \\text{IDEAL}_{\\mathcal{F}, \\mathcal{S}} \\)',
          },
        ],
      },

      {
        name: 'Hybrid Architecture Patterns',
        formalDefinition:
          'Three canonical patterns for ZKP+TEE integration form a pipeline: \\( \\text{Input} \\xrightarrow{\\text{TEE}} \\text{Witness} \\xrightarrow{\\text{ZKP}} \\text{Proof} \\xrightarrow{\\text{Chain}} \\text{Verified} \\). Each pattern trades off trust assumptions against performance, with different suitability for real-time vs. batch workloads.',
        mathDetails: [
          {
            subtitle: 'Pattern 1: TEE-Assisted Witness Generation',
            content:
              'The TEE receives encrypted private inputs, decrypts them inside the enclave, computes the ZKP witness \\( w \\), and seals the intermediate state. The ZKP prover (which may run outside the TEE) uses the witness to generate a proof \\( \\pi \\) such that \\( C(w) = 1 \\). The key benefit: private inputs never leave the TEE in plaintext, yet the resulting proof is verifiable by anyone without trusting the TEE. The TEE attestation certifies that the witness was honestly computed from the correct inputs.',
          },
          {
            subtitle: 'Pattern 2: TEE-Accelerated Proving',
            content:
              'The TEE runs the ZKP prover internally, taking advantage of hardware-accelerated operations (AES-NI for field arithmetic, AVX-512 for MSM). The enclave produces both the proof \\( \\pi \\) and an attestation \\( \\sigma_{\\text{att}} \\) certifying honest generation. This is less trustless than Pattern 1 because the verifier must check the attestation (trusting Intel SGX remote attestation), but it is much faster: the entire proving pipeline runs in protected memory. Verification can still be done on-chain without TEE trust if the ZKP itself is verified.',
          },
          {
            subtitle: 'Pattern 3: TEE Real-Time + ZKP Settlement',
            content:
              'For latency-sensitive operations (credential verification at point of service), the TEE performs real-time verification (~1-5ms). Periodically, a batch ZKP is generated proving that the TEE honestly performed \\( N \\) verifications: \\[ \\pi_{\\text{batch}} : \\text{"TEE correctly verified } \\text{tx}_1, \\ldots, \\text{tx}_N\\text{"} \\] This batch proof settles on-chain (e.g., every 100 verifications or every 10 minutes). The ZKP proves the entire batch was honest, amortizing the proving cost over \\( N \\) transactions. Cost per transaction: \\( T_{\\text{prove}} / N \\).',
          },
          {
            subtitle: 'Commitment Scheme Bridge',
            content:
              'The TEE commits to intermediate values using a commitment scheme: \\[ \\text{com} = \\text{Commit}(z, r) \\] where \\( z \\) is the intermediate computation result and \\( r \\) is randomness. The ZKP then proves properties about \\( z \\) by opening the commitment selectively. This bridges the TEE (which knows \\( z \\) in plaintext) and the ZKP (which proves statements about \\( z \\) without revealing it). The commitment must be binding (TEE cannot change \\( z \\) after committing) and hiding (the commitment reveals nothing about \\( z \\)).',
          },
        ],
        securityAnalysis:
          'Pattern 1 has the strongest trust model: privacy requires TEE integrity, but soundness is purely cryptographic (ZKP). Pattern 2 relies on TEE for both privacy and proof generation, but on-chain verification remains trustless. Pattern 3 has a time-bounded trust assumption: if the TEE is compromised, invalid verifications are accepted until the next batch proof catches the inconsistency (at most \\( N \\) transactions or one epoch). Each pattern suits different use cases: Pattern 1 for high-security credential issuance, Pattern 2 for server-side proving, Pattern 3 for real-time consumer applications.',
        practicalNotes:
          'Pattern 1 is the most practical today given current TEE deployment (Intel SGX, ARM TrustZone) and ZKP tooling (Groth16 via snarkjs/arkworks). Pattern 3 is the most scalable for production systems where sub-second latency is required. The thesis primarily uses Pattern 1 for credential operations and Pattern 3 for payment verification.',
        keyFormulas: [
          {
            name: 'Pattern 1 flow',
            formula:
              '\\( \\text{TEE}(\\text{enc\\_input}) \\rightarrow w, \\quad \\text{Prove}(C, w) \\rightarrow \\pi \\)',
          },
          {
            name: 'Pattern 3 batch cost',
            formula:
              '\\( \\text{Cost per tx} = T_{\\text{prove}} / N \\)',
          },
          {
            name: 'Commitment bridge',
            formula:
              '\\( \\text{com} = \\text{Commit}(z, r), \\quad \\text{ZKP proves } g(z) = \\text{output} \\)',
          },
        ],
      },

      {
        name: 'Anonymous Credentials on Sui',
        formalDefinition:
          'The credential system on Sui is defined as a tuple of protocols: \\( \\Pi_{\\text{SuiCred}} = (\\text{Setup}, \\text{Issue}, \\text{Present}, \\text{Verify}, \\text{Revoke}) \\). Credentials are BBS+ signed attribute vectors stored as encrypted Sui objects. Presentation uses zero-knowledge proofs for selective disclosure, verified on-chain by Move contracts.',
        mathDetails: [
          {
            subtitle: 'Setup & Schema',
            content:
              'A Move module is deployed defining the credential schema: attribute types \\( (t_1, \\ldots, t_L) \\), issuer public key \\( \\text{ipk} \\), and verification parameters. The issuer generates a BBS+ key pair \\( (\\text{isk}, \\text{ipk}) \\) where \\( \\text{ipk} = (w, h_0, h_1, \\ldots, h_L) \\) with \\( w = g_2^{\\text{isk}} \\) and \\( h_i \\) are random generators in \\( \\mathbb{G}_1 \\). The setup also initializes on-chain data structures: the revocation accumulator and the credential registry.',
          },
          {
            subtitle: 'Issuance (BBS+ Signature)',
            content:
              'The issuer creates a BBS+ signature on the attribute vector \\( \\mathbf{a} = (a_1, \\ldots, a_L) \\): \\[ \\sigma = (A, e, s) \\quad \\text{where} \\quad A = \\left( g_1 \\cdot h_0^s \\cdot \\prod_{i=1}^{L} h_i^{a_i} \\right)^{1/(\\text{isk} + e)} \\] The signature is verified by checking: \\[ e(A, w \\cdot g_2^e) = e\\left(g_1 \\cdot h_0^s \\cdot \\prod_{i=1}^{L} h_i^{a_i}, \\, g_2\\right) \\] The signed credential \\( (\\sigma, \\mathbf{a}) \\) is encrypted and stored as a Sui object owned by the user.',
          },
          {
            subtitle: 'Credential Storage as Sui Object',
            content:
              'The credential is stored as an encrypted Sui object: \\( \\text{EncObj}(\\sigma, \\mathbf{a}) \\) with the user as owner. Using an owned object ensures single-writer semantics (no consensus needed for credential operations) and Move resource safety (the credential cannot be duplicated or implicitly destroyed). The encryption key is derived from the user\'s wallet key, ensuring only the user can decrypt the credential contents.',
          },
          {
            subtitle: 'Selective Disclosure (BBS+ Proof)',
            content:
              'To present a credential with selective disclosure set \\( D \\subseteq [L] \\) (indices of revealed attributes), the user derives a BBS+ proof of knowledge: \\[ \\pi_{\\text{BBS}} = \\text{SPK}\\{(\\sigma, \\{a_i\\}_{i \\notin D}) : \\text{Verify}(\\text{ipk}, \\sigma, \\mathbf{a}) = 1\\} \\] The proof reveals \\( \\{a_i\\}_{i \\in D} \\) and hides \\( \\{a_i\\}_{i \\notin D} \\). Each presentation uses fresh randomization of the signature \\( \\sigma \\), ensuring unlinkability: two presentations of the same credential produce statistically independent proofs.',
          },
          {
            subtitle: 'Groth16 Wrapping for On-Chain Efficiency',
            content:
              'Direct BBS+ proof verification requires pairing operations that are expensive in Move. Instead, the BBS+ proof is wrapped in a Groth16 proof: the Groth16 circuit verifies the BBS+ proof internally, and the on-chain Move contract only needs to verify a single Groth16 proof (3 pairings, ~200 bytes). The wrapping circuit for a 10-attribute credential has ~100K R1CS constraints. On-chain verification: \\[ \\text{Verify}_{\\text{Groth16}}(\\text{vk}, \\pi, [\\text{ipk}, \\{a_i\\}_{i \\in D}]) = 1 \\]',
          },
          {
            subtitle: 'Revocation & Scoped Pseudonyms',
            content:
              'Revocation uses a cryptographic accumulator stored as a shared Sui object. The issuer updates the accumulator to exclude revoked credentials. During presentation, the user proves non-membership of their credential in the revocation set. For scoped linkability, the user derives a pseudonym: \\[ \\text{nym} = \\text{PRF}(\\text{sk}, \\text{scope}) \\] Presentations within the same scope (e.g., same service provider) produce the same pseudonym (enabling rate-limiting or Sybil resistance), while presentations across different scopes produce independent pseudonyms (unlinkable).',
          },
        ],
        securityAnalysis:
          'Security properties: (1) BBS+ unforgeability under the q-SDH assumption — no adversary can produce a valid signature on a new message without the issuer secret key, (2) Zero-knowledge of hidden attributes — the proof reveals nothing about \\( \\{a_i\\}_{i \\notin D} \\) beyond what is implied by the revealed attributes, (3) Unlinkability across presentations — fresh randomization ensures two proofs from the same credential are computationally indistinguishable from proofs of two different credentials, (4) Groth16 wrapping preserves all properties (knowledge soundness in the generic group model).',
        practicalNotes:
          'Estimated performance: ~200ms proof generation on mobile (BBS+ proof + Groth16 wrapping), ~50ms on-chain verification, ~500 bytes proof size. The Groth16 wrapping adds a trusted setup requirement but makes on-chain verification cheap (~50K gas). The credential object size on Sui is ~1KB encrypted.',
        keyFormulas: [
          {
            name: 'BBS+ signature',
            formula:
              '\\( A = \\left(g_1 \\cdot h_0^s \\cdot \\prod_{i=1}^{L} h_i^{a_i}\\right)^{1/(\\text{isk} + e)} \\)',
          },
          {
            name: 'Groth16 wrapping verification',
            formula:
              '\\( \\text{Verify}_{\\text{Groth16}}(\\text{vk}, \\pi, [\\text{ipk}, \\{a_i\\}_{i \\in D}]) = 1 \\)',
          },
          {
            name: 'Scoped pseudonym',
            formula: '\\( \\text{nym} = \\text{PRF}(\\text{sk}, \\text{scope}) \\)',
          },
        ],
      },

      {
        name: 'Private Payment Flow',
        formalDefinition:
          'A private payment \\( \\text{Pay}(\\text{sender}, \\text{receiver}, v) \\) is a credential-gated transaction that hides the sender identity, receiver identity, and amount while proving validity on-chain. The payment combines a credential proof (KYC compliance), a value commitment (amount hiding), a nullifier (double-spend prevention), and an encrypted memo (auditability).',
        mathDetails: [
          {
            subtitle: 'Step 1: Credential Verification',
            content:
              'The sender proves possession of a valid, non-revoked credential satisfying access predicates. The ZK proof \\( \\pi_1 \\) states: \\[ \\pi_1 : \\exists \\, (\\sigma, \\mathbf{a}) : \\text{BBS.Verify}(\\text{ipk}, \\sigma, \\mathbf{a}) = 1 \\wedge a_{\\text{age}} \\geq 18 \\wedge a_{\\text{country}} \\in \\text{EU} \\wedge \\text{NotRevoked}(\\sigma, \\text{acc}) \\] The proof reveals no attributes beyond the truth of the predicates. The credential is not consumed (can be reused for future payments).',
          },
          {
            subtitle: 'Step 2: Amount Commitment',
            content:
              'The sender creates a Pedersen commitment to the payment value: \\[ C_{\\text{send}} = v \\cdot G + r_s \\cdot H \\] The receiver creates a matching commitment: \\[ C_{\\text{recv}} = v \\cdot G + r_r \\cdot H \\] Both use the same value \\( v \\) but independent blinding factors \\( r_s, r_r \\). The difference \\( C_{\\text{send}} - C_{\\text{recv}} = (r_s - r_r) \\cdot H \\) commits to zero value, which is proven in the balance proof.',
          },
          {
            subtitle: 'Step 3: Balance & Range Proof',
            content:
              'The ZK proof \\( \\pi_2 \\) establishes: \\[ \\pi_2 : v_{\\text{send}} = v_{\\text{recv}} \\wedge 0 \\leq v < 2^{64} \\] The equality proof shows no value is created or destroyed (no inflation). The range proof (Bulletproofs or Groth16-embedded) ensures no negative values that could exploit the modular arithmetic of the commitment scheme. For efficiency, the range proof uses a binary decomposition: prove each bit \\( v = \\sum_{i=0}^{63} b_i \\cdot 2^i \\) with \\( b_i \\in \\{0, 1\\} \\).',
          },
          {
            subtitle: 'Step 4: Nullifier (Double-Spend Prevention)',
            content:
              'The sender computes a nullifier for the spent note: \\[ \\text{nf} = \\text{PRF}(\\text{sk}_{\\text{sender}}, \\text{note\\_id}) \\] The nullifier is published on-chain. The contract maintains a nullifier set (sparse Merkle tree) and rejects transactions with duplicate nullifiers. The PRF ensures the nullifier is deterministic (same note always produces same nullifier) but pseudorandom (nullifier reveals neither the sender key nor the note ID).',
          },
          {
            subtitle: 'Step 5: Viewing Key & Encrypted Memo',
            content:
              'For compliance, the sender encrypts transaction details under the auditor public key: \\[ \\text{memo} = \\text{Enc}(\\text{vk}_{\\text{auditor}}, (\\text{sender\\_id}, \\text{receiver\\_id}, v, \\text{timestamp})) \\] The encryption uses a hybrid scheme (ECIES or similar): \\( \\text{Enc}(\\text{pk}, m) = (rG, \\text{AES}(H(r \\cdot \\text{pk}), m)) \\). Only the auditor holding the corresponding private key can decrypt. The memo is stored on-chain alongside the transaction.',
          },
          {
            subtitle: 'Combined Proof & Low-Value Fast Path',
            content:
              'For gas efficiency, \\( \\pi_1 \\) (credential) and \\( \\pi_2 \\) (payment) are bundled into a single Groth16 proof \\( \\pi \\) with combined public inputs. The on-chain Move contract verifies one proof instead of two, saving ~50% gas. For low-value payments (\\( v < \\text{threshold} \\)), a fast path uses TEE verification (~5ms) instead of on-chain ZKP verification. The TEE attests to the validity and produces a signed receipt. Periodic batch ZKP proofs settle these fast-path transactions on-chain.',
          },
          {
            subtitle: 'On-Chain Settlement',
            content:
              'The Sui Move contract executes: (1) verify combined proof \\( \\pi \\) against verification key, (2) check nullifier is not in the nullifier set, (3) insert new note commitment into the Merkle tree (shared object), (4) insert nullifier into the nullifier set (shared object), (5) store encrypted memo, (6) emit payment event. The note commitment tree and nullifier set are shared Sui objects requiring Mysticeti consensus (~390ms finality).',
          },
        ],
        securityAnalysis:
          'Payment privacy achieves IND-CCA security: an adversary cannot distinguish between any two payments of the same structure. Double-spend prevention follows from the binding property of the nullifier scheme and the collision resistance of the PRF. Compliance is enforced by the viewing key mechanism without degrading privacy for non-targeted transactions. The combined Groth16 proof preserves both credential unforgeability and payment soundness under composition.',
        practicalNotes:
          'Estimated end-to-end performance: ~500ms full proof generation on mobile (credential + payment circuit), ~200K gas on Sui for on-chain verification, ~1KB total transaction size (proof + commitments + nullifier + encrypted memo). The low-value fast path reduces latency to ~50ms using TEE, suitable for point-of-sale scenarios.',
        keyFormulas: [
          {
            name: 'Credential check circuit',
            formula:
              '\\( \\pi_1 : \\exists \\, (\\sigma, \\mathbf{a}) : \\text{BBS.Verify}(\\text{ipk}, \\sigma, \\mathbf{a}) = 1 \\wedge \\text{predicates}(\\mathbf{a}) \\)',
          },
          {
            name: 'Value commitment balance',
            formula:
              '\\( C_{\\text{send}} - C_{\\text{recv}} = (r_s - r_r) \\cdot H \\)',
          },
          {
            name: 'Nullifier derivation',
            formula:
              '\\( \\text{nf} = \\text{PRF}(\\text{sk}_{\\text{sender}}, \\text{note\\_id}) \\)',
          },
          {
            name: 'Viewing key encryption',
            formula:
              '\\( \\text{memo} = \\text{Enc}(\\text{vk}_{\\text{auditor}}, (\\text{sender}, \\text{receiver}, v)) \\)',
          },
        ],
      },

      {
        name: 'Post-Quantum Considerations',
        formalDefinition:
          'Post-quantum security requires resilience against adversaries with bounded quantum polynomial-time (\\( \\text{BQP} \\)) computation. Quantum algorithms (Shor, Grover) break or weaken many classical cryptographic assumptions, necessitating migration to lattice-based, hash-based, or code-based alternatives for long-lived credentials and payment systems.',
        mathDetails: [
          {
            subtitle: "Shor's Algorithm Impact",
            content:
              "Shor's algorithm factors integers and computes discrete logarithms in polynomial time: \\[ \\text{Factor}(n) \\in O((\\log n)^2 (\\log \\log n)(\\log \\log \\log n)) \\] on a quantum computer (simplified: \\( O((\\log n)^3) \\) with quantum Fourier transform). This breaks: RSA (integer factoring), ECDSA/EdDSA (elliptic curve discrete log), BLS signatures (pairing-based discrete log), BBS+ signatures (relies on q-SDH in pairing groups), and Groth16 (relies on pairings over BLS12-381). Essentially, all elliptic curve and pairing-based cryptography used in the thesis is vulnerable.",
          },
          {
            subtitle: "Grover's Algorithm Impact",
            content:
              "Grover's algorithm provides a quadratic speedup for unstructured search: \\[ \\text{Search}(f, N) \\in O(\\sqrt{N}) = O(2^{n/2}) \\] This halves the effective security of symmetric primitives: AES-256 provides 128-bit security against quantum, AES-128 provides only 64-bit. Hash functions are similarly affected: SHA-256 provides 128-bit collision resistance against quantum (vs. 128-bit classically via birthday attack). Grover does not break symmetric crypto but requires doubling key sizes.",
          },
          {
            subtitle: 'Lattice-Based Alternatives',
            content:
              'The Learning With Errors (LWE) problem is the foundation of most post-quantum schemes: \\[ \\text{LWE}_{n,q,\\chi} : \\text{Given } (\\mathbf{A}, \\mathbf{b} = \\mathbf{A}\\mathbf{s} + \\mathbf{e}) \\text{, find } \\mathbf{s} \\] where \\( \\mathbf{A} \\in \\mathbb{Z}_q^{m \\times n} \\), \\( \\mathbf{s} \\in \\mathbb{Z}_q^n \\), and \\( \\mathbf{e} \\leftarrow \\chi \\) is a small error vector. The Module-LWE variant (used in Kyber/ML-KEM) operates over polynomial rings \\( \\mathbb{Z}_q[X]/(X^n + 1) \\) for efficiency. The Short Integer Solution (SIS) problem provides hash function security: \\[ \\text{SIS}_{n,q,\\beta} : \\text{Given } \\mathbf{A}, \\text{ find } \\mathbf{x} \\neq 0 \\text{ s.t. } \\mathbf{A}\\mathbf{x} = 0 \\text{ and } \\|\\mathbf{x}\\| \\leq \\beta \\] Best known quantum attacks on LWE/SIS remain exponential in \\( n \\).',
          },
          {
            subtitle: 'Post-Quantum Credentials',
            content:
              'Replacing BBS+ with lattice-based alternatives is challenging because efficient selective disclosure requires algebraic structure. Current approaches: (1) Dilithium-based credentials (hash-then-sign): efficient signing and verification but no native selective disclosure — requires combining with general-purpose ZK proofs, (2) Lattice-based anonymous credentials using relaxed proofs of knowledge over Module-LWE commitments: larger but provide native selective disclosure, (3) Hash-based signatures (SPHINCS+/SLH-DSA): quantum-safe and well-understood, but signatures are ~8-40KB and no algebraic structure for selective disclosure.',
          },
          {
            subtitle: 'Lether Protocol',
            content:
              'Lether is a lattice-based Anonymous Zether protocol providing post-quantum private payments. It uses Module-LWE encryption for confidential amounts and lattice-based zero-knowledge proofs for balance and range verification. Key metrics: ~68KB per transaction (vs. ~1.5KB for pairing-based), sub-second proving time, security under Module-LWE assumption. The proof system uses "relaxed" extractability (the extractor recovers a witness with small norm, not exact), which is sufficient for payment security.',
          },
          {
            subtitle: 'Migration Strategy',
            content:
              'The recommended migration path is: (1) Hybrid classical+PQ during transition: run both BBS+ and a lattice-based scheme in parallel, accept either proof. (2) Harvest-now-decrypt-later defense: credentials with long lifetimes (identity documents, 10+ years) should use PQ signatures now. (3) NIST PQC standardized algorithms: ML-KEM (Kyber) for key encapsulation, ML-DSA (Dilithium) for digital signatures, SLH-DSA (SPHINCS+) for stateless hash-based signatures. (4) The thesis architecture is modular: cryptographic primitives (signature scheme, commitment scheme, hash function) can be swapped without changing the protocol structure.',
          },
        ],
        securityAnalysis:
          'Lattice assumptions (LWE, SIS, Ring-LWE, Module-LWE) are currently the best candidates for post-quantum security. The best known quantum algorithms (BKZ with quantum sieving) still require \\( 2^{\\Omega(n)} \\) time. However, lattice-based ZK proofs have a soundness gap: the extracted witness has larger norm than the honest witness, requiring careful parameter selection to avoid attacks. The Lether protocol addresses this with specific norm bounds and security reductions.',
        practicalNotes:
          'Post-quantum credential proofs are 10-100x larger than classical ones (~68KB vs. ~500B for Lether vs. BBS+/Groth16). This is acceptable for long-lived credentials (identity documents issued for 10+ years) where future-proofing outweighs size concerns. For short-lived credentials (session tokens, temporary access), classical schemes remain appropriate during the transition period. The thesis recommends a dual-stack approach: PQ for issuance signatures, classical for presentation proofs, with a full PQ migration path documented.',
        keyFormulas: [
          {
            name: "Shor's complexity (factoring)",
            formula: '\\( O((\\log n)^3) \\)',
          },
          {
            name: 'LWE problem definition',
            formula:
              '\\( (\\mathbf{A}, \\mathbf{b} = \\mathbf{A}\\mathbf{s} + \\mathbf{e}) \\text{ where } \\mathbf{e} \\leftarrow \\chi \\)',
          },
          {
            name: 'Lether proof size comparison',
            formula:
              '\\( |\\pi_{\\text{Lether}}| \\approx 68\\text{KB} \\text{ vs. } |\\pi_{\\text{Groth16}}| \\approx 192\\text{B} \\)',
          },
        ],
      },

      {
        name: 'Full Thesis Architecture',
        formalDefinition:
          'The complete thesis system is a multi-layer privacy protocol on Sui: \\( \\Pi = (\\Pi_{\\text{cred}}, \\Pi_{\\text{pay}}, \\Pi_{\\text{TEE}}, \\Pi_{\\text{comply}}) \\), integrating anonymous credentials (BBS+), private payments (Pedersen commitments + nullifiers), TEE acceleration (witness generation + batch proving), and compliance mechanisms (viewing keys + threshold reporting) into a unified protocol verified by on-chain Sui Move contracts.',
        mathDetails: [
          {
            subtitle: 'Layer 1: Credential Layer (BBS+)',
            content:
              'The credential layer handles issuance, storage, and privacy-preserving presentation: \\[ \\text{Issue}(\\text{isk}, \\mathbf{a}) \\rightarrow \\sigma = (A, e, s) \\] \\[ \\text{Present}(\\sigma, \\mathbf{a}, D) \\rightarrow \\pi_{\\text{cred}} \\] where \\( D \\subseteq [L] \\) is the disclosure set. The issuer signs the attribute vector with BBS+, the user stores the credential as an encrypted Sui object, and presentation generates a Groth16-wrapped BBS+ proof. The proof \\( \\pi_{\\text{cred}} \\) demonstrates: valid signature from a recognized issuer, satisfaction of access predicates (age, jurisdiction, etc.), and non-revocation against the on-chain accumulator.',
          },
          {
            subtitle: 'Layer 2: Payment Layer (Pedersen + Nullifier)',
            content:
              'The payment layer handles value transfer with amount hiding and double-spend prevention: \\[ \\text{Pay}(v, \\text{sk}) \\rightarrow (C, \\text{nf}, \\pi_{\\text{pay}}) \\] where \\( C = vG + rH \\) is the value commitment, \\( \\text{nf} = \\text{PRF}(\\text{sk}, \\text{note\\_id}) \\) is the nullifier, and \\( \\pi_{\\text{pay}} \\) proves correct balance (no inflation), range validity (\\( 0 \\leq v < 2^{64} \\)), and correct nullifier derivation. The note commitment is added to the on-chain Merkle tree; the nullifier is added to the nullifier set.',
          },
          {
            subtitle: 'Layer 3: TEE Acceleration',
            content:
              'The TEE layer provides two modes of operation: \\[ \\text{TEE.Verify}(\\pi_{\\text{cred}}) \\rightarrow \\{0, 1\\} \\quad \\text{(real-time, ~1-5ms)} \\] \\[ \\text{TEE.BatchProve}([\\text{tx}_1, \\ldots, \\text{tx}_n]) \\rightarrow \\pi_{\\text{batch}} \\quad \\text{(periodic settlement)} \\] In real-time mode, the TEE verifies credential proofs for low-latency applications (point of sale, API access). In batch mode, the TEE aggregates multiple transaction witnesses and generates a single Groth16 proof covering the entire batch, reducing on-chain verification costs by a factor of \\( n \\). The TEE attestation certifies enclave integrity for both modes.',
          },
          {
            subtitle: 'Layer 4: Compliance Layer',
            content:
              'The compliance layer enables regulatory adherence without compromising user privacy: \\[ \\text{ViewKey}(\\text{auditor\\_pk}, \\text{tx\\_details}) \\rightarrow \\text{encrypted\\_memo} \\] \\[ \\text{ThresholdReport}(\\text{user\\_sk}, \\text{period}) \\rightarrow \\pi_{\\text{volume}} \\] Viewing keys allow designated auditors to decrypt transaction metadata. Threshold reports let users prove compliance (e.g., "my monthly volume is below the reporting threshold") without revealing individual transactions. The compliance layer is modular: jurisdictions can define different policies (threshold amounts, required predicates, auditor keys) without modifying the core protocol.',
          },
          {
            subtitle: 'Sui Integration Details',
            content:
              'The on-chain components are implemented as Sui Move modules: (1) Credential schema: a Move struct defining attribute types with issuer public key stored as a shared object. (2) Groth16 verifier contract: accepts serialized proofs and public inputs, performs pairing checks, returns boolean. (3) Note registry: a shared Sui object containing the Merkle tree of note commitments (Poseidon hash, depth 32). (4) Nullifier set: a shared Sui object implementing a sparse Merkle tree for efficient membership and non-membership proofs. (5) Compliance registry: stores encrypted memos and auditor public keys.',
          },
          {
            subtitle: 'System Parameters',
            content:
              'The protocol uses: BLS12-381 curve (for BBS+ and Groth16 pairings), Poseidon hash function (SNARK-friendly, ~8x faster than SHA-256 in-circuit), Groth16 proving system (192-byte proofs, 3-pairing verification), Ed25519 for Sui transaction signatures, AES-256-GCM for credential encryption, ECIES for viewing key encryption. The Merkle tree uses Poseidon with arity 2 and depth 32, supporting \\( 2^{32} \\approx 4 \\times 10^9 \\) notes.',
          },
          {
            subtitle: 'Complete Transaction Flow',
            content:
              'End-to-end flow for a credential-gated private payment: (1) User decrypts credential from Sui object (locally or in TEE), (2) TEE verifies credential validity (fast path) OR user generates ZK proof \\( \\pi_{\\text{cred}} \\) (trustless path), (3) User creates payment proof \\( \\pi_{\\text{pay}} \\) with value commitment \\( C \\), nullifier \\( \\text{nf} \\), and range proof, (4) Proofs \\( \\pi_{\\text{cred}} \\) and \\( \\pi_{\\text{pay}} \\) are combined into a single Groth16 proof \\( \\pi \\), (5) Sui transaction submitted: Move contract verifies \\( \\pi \\), checks nullifier freshness, updates note tree, records nullifier, stores encrypted memo, (6) Event emitted for off-chain indexers. Total on-chain: one proof verification + two shared object mutations + one event.',
          },
          {
            subtitle: 'Performance Budget',
            content:
              'End-to-end latency breakdown: credential decryption (~5ms), witness generation (~50ms in TEE), Groth16 proving (~500ms mobile, ~100ms desktop), transaction submission + consensus (~390ms Mysticeti), on-chain verification (~10ms execution). Total: ~700ms with TEE assist on mobile, ~100ms with TEE fast path (skipping on-chain ZKP for low-value). Gas cost: ~300K gas units (~$0.01 at current Sui prices). Transaction size: ~1.5KB (192B proof + commitments + nullifier + encrypted memo + Sui tx overhead).',
          },
        ],
        securityAnalysis:
          'The full system security is analyzed through composition of its layers: (1) BBS+ unforgeability ensures no credential forgery (q-SDH assumption), (2) Groth16 knowledge soundness ensures proofs cannot be faked (generic group model + q-PKE), (3) Pedersen commitment hiding ensures amount privacy (DDH assumption), (4) Nullifier collision resistance ensures double-spend prevention (PRF security), (5) TEE attestation ensures enclave integrity (hardware trust model), (6) Viewing key IND-CCA2 security ensures only designated auditors can decrypt memos. Under UC composition, the layered protocol securely realizes the ideal payment functionality \\( \\mathcal{F}_{\\text{pay}} \\) that reveals only: a transaction occurred, the fee, and auditor-decryptable metadata. The main trust assumptions are: at least one of {TEE integrity, ZKP soundness} holds, the issuer is honest during credential issuance, and the Sui consensus is live and safe (\\( f < n/3 \\) Byzantine validators).',
        practicalNotes:
          'The architecture is designed for progressive deployment: Phase 1 deploys the credential layer (BBS+ issuance + on-chain verification). Phase 2 adds the payment layer (commitments + nullifiers). Phase 3 integrates TEE acceleration. Phase 4 adds compliance hooks. Each phase is independently useful and testable. The modular design also supports post-quantum migration: swap BBS+ for lattice-based signatures, swap Groth16 for STARK-based proofs, keep the protocol structure unchanged.',
        keyFormulas: [
          {
            name: 'Credential issuance',
            formula:
              '\\( \\text{Issue}(\\text{isk}, \\mathbf{a}) \\rightarrow \\sigma \\)',
          },
          {
            name: 'Credential presentation',
            formula:
              '\\( \\text{Present}(\\sigma, \\mathbf{a}, D) \\rightarrow \\pi_{\\text{cred}} \\)',
          },
          {
            name: 'Payment creation',
            formula:
              '\\( \\text{Pay}(v, \\text{sk}) \\rightarrow (C, \\text{nf}, \\pi_{\\text{pay}}) \\)',
          },
          {
            name: 'TEE real-time verification',
            formula:
              '\\( \\text{TEE.Verify}(\\pi_{\\text{cred}}) \\rightarrow \\{0, 1\\} \\)',
          },
          {
            name: 'TEE batch proving',
            formula:
              '\\( \\text{TEE.BatchProve}([\\text{tx}_1, \\ldots, \\text{tx}_n]) \\rightarrow \\pi_{\\text{batch}} \\)',
          },
          {
            name: 'Viewing key encryption',
            formula:
              '\\( \\text{ViewKey}(\\text{auditor\\_pk}, \\text{tx\\_details}) \\rightarrow \\text{encrypted\\_memo} \\)',
          },
          {
            name: 'Threshold compliance proof',
            formula:
              '\\( \\text{ThresholdReport}(\\text{user\\_sk}, \\text{period}) \\rightarrow \\pi_{\\text{volume}} \\)',
          },
          {
            name: 'Full protocol specification',
            formula:
              '\\( \\Pi = (\\Pi_{\\text{cred}}, \\Pi_{\\text{pay}}, \\Pi_{\\text{TEE}}, \\Pi_{\\text{comply}}) \\)',
          },
        ],
      },
    ],
  },
};
