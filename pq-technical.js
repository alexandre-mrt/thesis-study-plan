/**
 * Post-Quantum — Technical Companion
 * Deep mathematical / formal definitions paired with PQ_GUIDE.
 * Rendered with KaTeX: \( ... \) for inline, \[ ... \] for display.
 */

window.PQ_TECHNICAL = {
  block1: {
    concepts: [
      /* ───────── Neutral Atom Quantum Computing ───────── */
      {
        name: "Neutral Atom Quantum Computing",
        formalDefinition:
          "A neutral-atom quantum computer encodes logical qubits in the " +
          "hyperfine clock states of alkali or alkaline-earth atoms (e.g., " +
          "\\(^{87}\\text{Rb}\\), \\(^{133}\\text{Cs}\\), \\(^{171}\\text{Yb}\\)) " +
          "trapped in optical tweezer arrays. The computational basis states " +
          "\\(|0\\rangle\\) and \\(|1\\rangle\\) correspond to two hyperfine levels " +
          "separated by \\(\\Delta E = h \\cdot \\nu_{\\text{HF}}\\) where " +
          "\\(\\nu_{\\text{HF}} \\sim 6.8\\,\\text{GHz}\\) for \\(^{87}\\text{Rb}\\).",
        mathDetails: [
          {
            subtitle: "Optical Tweezer Trapping Potential",
            content:
              "Each atom is confined in a focused Gaussian beam creating a harmonic " +
              "trapping potential:" +
              "\\[ U(\\mathbf{r}) = -\\frac{1}{2} \\alpha(\\omega_L) |\\mathbf{E}(\\mathbf{r})|^2 \\]" +
              "where \\(\\alpha(\\omega_L)\\) is the dynamic polarizability at laser frequency " +
              "\\(\\omega_L\\) and \\(\\mathbf{E}\\) is the electric field. For red-detuned light " +
              "(\\(\\omega_L < \\omega_0\\)), the potential is attractive at intensity maxima. " +
              "Typical trap depth: \\(U_0 / k_B \\sim 1\\,\\text{mK}\\), waist " +
              "\\(w_0 \\sim 0.5{-}1\\,\\mu\\text{m}\\)."
          },
          {
            subtitle: "Single-Qubit Gate: Raman Transition",
            content:
              "A single-qubit rotation \\(R(\\theta, \\phi)\\) is implemented via a " +
              "two-photon Raman process with two laser beams of frequencies " +
              "\\(\\omega_1, \\omega_2\\) satisfying:" +
              "\\[ \\omega_1 - \\omega_2 = \\nu_{\\text{HF}} + \\delta \\]" +
              "where \\(\\delta\\) is a controllable detuning. The effective Rabi frequency is:" +
              "\\[ \\Omega_{\\text{eff}} = \\frac{\\Omega_1 \\Omega_2}{2\\Delta} \\]" +
              "with \\(\\Omega_i\\) the individual Rabi frequencies and \\(\\Delta\\) the " +
              "detuning from the intermediate excited state. The rotation angle is " +
              "\\(\\theta = \\Omega_{\\text{eff}} \\cdot t_p\\) where \\(t_p\\) is pulse duration. " +
              "The rotation axis (\\(\\phi\\)) is set by the relative phase of the two beams. " +
              "Achieved fidelity: \\(\\mathcal{F} > 0.9998\\) (error \\(< 10^{-4}\\))."
          },
          {
            subtitle: "Two-Qubit Gate: Rydberg Blockade CZ",
            content:
              "The controlled-Z gate exploits the Rydberg blockade mechanism. " +
              "An atom excited to Rydberg state \\(|r\\rangle\\) (principal quantum number " +
              "\\(n \\sim 60{-}100\\)) creates a strong van der Waals interaction:" +
              "\\[ V_{\\text{vdW}} = \\frac{C_6}{R^6} \\]" +
              "where \\(C_6 \\propto n^{11}\\) and \\(R\\) is interatomic distance. " +
              "When \\(V_{\\text{vdW}} \\gg \\Omega\\) (blockade regime, \\(R < R_b\\)), " +
              "simultaneous excitation of two atoms is suppressed. " +
              "The blockade radius is:" +
              "\\[ R_b = \\left(\\frac{C_6}{\\hbar \\Omega}\\right)^{1/6} \\sim 5{-}10\\,\\mu\\text{m} \\]" +
              "CZ gate pulse sequence (3 pulses on Rydberg transition):" +
              "\\[ |11\\rangle \\xrightarrow{\\pi_c} |r1\\rangle \\xrightarrow{2\\pi_t \\text{ (blocked)}} " +
              "|r1\\rangle \\xrightarrow{\\pi_c} -|11\\rangle \\]" +
              "For \\(|01\\rangle\\): control not excited, target gets full \\(2\\pi\\) rotation " +
              "(no phase). Net effect: conditional phase \\(-1\\) only on \\(|11\\rangle\\). " +
              "Demonstrated fidelity: \\(\\mathcal{F} > 0.995\\) in parallel on 60 atoms."
          },
          {
            subtitle: "Scaling: Error Correction on Neutral Atoms",
            content:
              "Surface code on a 2D atom array with code distance \\(d\\):" +
              "\\[ p_L \\sim \\left(\\frac{p_{\\text{phys}}}{p_{\\text{th}}}\\right)^{\\lfloor d/2 \\rfloor + 1} \\]" +
              "where \\(p_{\\text{phys}}\\) is physical error rate and " +
              "\\(p_{\\text{th}} \\approx 1\\%\\) is the threshold. " +
              "For \\(p_{\\text{phys}} = 0.5\\%\\) (current best):" +
              "\\[ p_L(d=7) \\sim (0.5)^4 \\approx 6 \\times 10^{-2} \\]" +
              "\\[ p_L(d=13) \\sim (0.5)^7 \\approx 8 \\times 10^{-3} \\]" +
              "Physical qubits per logical qubit: \\(\\sim 2d^2\\). " +
              "For Oratomic's P-256 attack (10,000 physical qubits), this yields " +
              "~200-500 logical qubits depending on \\(d\\), consistent with " +
              "the 1,200-1,450 logical qubit estimate from Google's circuits."
          }
        ]
      },

      /* ───────── Craig Gidney — Quantum Cryptanalysis Optimization ───────── */
      {
        name: "Craig Gidney — Quantum Cryptanalysis Optimization",
        formalDefinition:
          "Gidney's work optimizes the quantum circuit depth and qubit count for " +
          "Shor's algorithm applied to the integer factoring problem and the " +
          "elliptic curve discrete logarithm problem (ECDLP). For RSA-\\(n\\): " +
          "factor \\(N = p \\cdot q\\) where \\(|N| = n\\) bits. For ECDLP: " +
          "given \\(P, Q = kP\\) on elliptic curve \\(E(\\mathbb{F}_p)\\), find " +
          "\\(k \\in \\mathbb{Z}_{|E|}\\).",
        mathDetails: [
          {
            subtitle: "Shor's Algorithm Complexity",
            content:
              "Shor's algorithm reduces factoring to order-finding. For an \\(n\\)-bit " +
              "modulus \\(N\\):" +
              "\\[ \\text{Logical qubits: } O(n) \\]" +
              "\\[ \\text{Toffoli gates: } O(n^2 \\log n) \\text{ (schoolbook)} \\]" +
              "\\[ \\text{Toffoli gates: } O(n \\log^2 n) \\text{ (Karatsuba + windowed)} \\]" +
              "Gidney's 2025 result for RSA-2048: " +
              "\\(< 10^6\\) physical qubits (at \\(10^{-3}\\) error rate), " +
              "runtime \\(< 1\\) week. Key innovations:" +
              "\\begin{itemize}" +
              "\\end{itemize}" +
              "Magic state cultivation achieves state fidelity \\(1 - 10^{-4}\\) with 40× " +
              "fewer raw magic states than standard distillation."
          },
          {
            subtitle: "ECDLP Quantum Circuit (Google, March 2026)",
            content:
              "For secp256k1 (\\(n = 256\\)-bit curve over \\(\\mathbb{F}_p\\)):" +
              "\\[ \\text{Logical qubits: } 1{,}200 \\text{ to } 1{,}450 \\]" +
              "\\[ \\text{Toffoli gates: } 70{-}90 \\times 10^6 \\]" +
              "The circuit implements modular exponentiation on the elliptic curve group:" +
              "\\[ |k\\rangle|0\\rangle \\mapsto |k\\rangle|kP\\rangle \\]" +
              "followed by Quantum Fourier Transform for phase estimation. " +
              "Google proved correctness via ZK: committed to circuit hash \\(h = \\text{SHA256}(C)\\), " +
              "generated test inputs \\(\\{x_i\\} = \\text{SHAKE256}(h, i)\\) for \\(i \\in [9024]\\), " +
              "simulated \\(C(x_i)\\) inside SP1 zkVM, and wrapped in Groth16 proof " +
              "\\(\\pi = \\text{Prove}(\\text{pk}, h, \\{x_i, y_i\\})\\)."
          },
          {
            subtitle: "QEC Goes FOOM — Superexponential Scaling",
            content:
              "Gidney's observation (Dec 2025): if physical qubit count doubles " +
              "annually while error rate \\(p\\) stays constant at threshold, " +
              "logical lifetime scales as:" +
              "\\[ L = C \\cdot \\lambda^{q(t)} \\]" +
              "where \\(q(t) = q_0 \\cdot 2^{t/T}\\) (exponential hardware growth) and " +
              "\\(\\lambda = p_{\\text{th}} / p_{\\text{phys}} > 1\\). This is " +
              "double-exponential in time:" +
              "\\[ L(t) = C \\cdot \\lambda^{q_0 \\cdot 2^{t/T}} \\]" +
              "Implication: quantum computers appear useless for a long time, then " +
              "suddenly (FOOM) achieve astronomical logical lifetimes once hardware " +
              "crosses the threshold. Each 'QEC hurdle' cleared triggers a mini-FOOM."
          }
        ]
      },

      /* ───────── Scott Aaronson's Warning ───────── */
      {
        name: "Scott Aaronson — The 2029 Warning",
        formalDefinition:
          "A Cryptographically Relevant Quantum Computer (CRQC) is defined as a " +
          "fault-tolerant quantum computer capable of running Shor's algorithm to " +
          "break RSA-2048 or ECDLP-256 in practical time (hours to days). " +
          "Aaronson's assessment (April 2026): probability of CRQC by 2029 has " +
          "shifted from negligible (pre-2025) to non-trivial, based on hardware " +
          "milestones exceeding expectations.",
        mathDetails: [
          {
            subtitle: "What Changed: Gate Fidelity Threshold",
            content:
              "Surface code threshold: \\(p_{\\text{th}} \\approx 1\\%\\). " +
              "In 2025, multiple platforms achieved:" +
              "\\[ p_{\\text{phys,2Q}} < 10^{-3} \\quad (\\text{2-qubit gate error} < 0.1\\%) \\]" +
              "This means \\(p_{\\text{phys}} / p_{\\text{th}} \\approx 0.1\\), giving:" +
              "\\[ p_L(d=7) \\sim (0.1)^4 = 10^{-4} \\]" +
              "\\[ p_L(d=11) \\sim (0.1)^6 = 10^{-6} \\]" +
              "At this ratio, modest code distances suffice for cryptographic attacks. " +
              "This is the hardware milestone that shifted Aaronson's assessment."
          },
          {
            subtitle: "Harvest Now, Decrypt Later (HNDL)",
            content:
              "Let \\(T_{\\text{data}}\\) = useful lifetime of encrypted data, " +
              "\\(T_{\\text{CRQC}}\\) = time until CRQC available, " +
              "\\(T_{\\text{migrate}}\\) = time to deploy PQC. " +
              "Data is vulnerable to HNDL if:" +
              "\\[ T_{\\text{data}} > T_{\\text{CRQC}} - T_{\\text{now}} \\]" +
              "Migration must begin if:" +
              "\\[ T_{\\text{migrate}} > T_{\\text{CRQC}} - T_{\\text{now}} \\]" +
              "With \\(T_{\\text{CRQC}} \\approx 2029\\), \\(T_{\\text{now}} = 2026\\), " +
              "and typical \\(T_{\\text{migrate}} = 2{-}5\\) years for large systems: " +
              "migration should have started already. For anonymous credentials with " +
              "long-lived unlinkability guarantees, HNDL is particularly dangerous: " +
              "stored proofs could be de-anonymized retroactively."
          },
          {
            subtitle: "NIST PQC Migration Timeline",
            content:
              "Standards timeline (binding for US federal, influential globally):" +
              "\\[ \\text{FIPS 203 (ML-KEM):} \\quad \\text{finalized August 2024} \\]" +
              "\\[ \\text{FIPS 204 (ML-DSA):} \\quad \\text{finalized August 2024} \\]" +
              "\\[ \\text{FIPS 205 (SLH-DSA):} \\quad \\text{finalized August 2024} \\]" +
              "\\[ \\text{CNSA 2.0:} \\quad \\text{quantum-safe for new systems by Jan 2027} \\]" +
              "\\[ \\text{NIST:} \\quad \\text{deprecate RSA/ECDSA by 2030} \\]" +
              "\\[ \\text{NIST:} \\quad \\text{disallow RSA/ECDSA by 2035} \\]" +
              "For anonymous credentials: no standardized post-quantum BBS+ equivalent " +
              "exists yet. Lattice-based AC (CIC 2026) is the closest candidate."
          }
        ]
      },

      /* ───────── Oratomic ───────── */
      {
        name: "Oratomic — 10,000 Qubits Break Crypto",
        formalDefinition:
          "Oratomic's result (arXiv:2603.28627): Shor's algorithm for ECDLP on " +
          "curve \\(E(\\mathbb{F}_p)\\) with \\(|p| = 256\\) bits can be executed on " +
          "a reconfigurable neutral-atom array with \\(N \\leq 10{,}000\\) physical " +
          "qubits, using mid-circuit atom rearrangement and transversal gates " +
          "to achieve fault tolerance without a full surface code.",
        mathDetails: [
          {
            subtitle: "Resource Estimates",
            content:
              "For P-256 ECDLP (\\(n = 256\\), group order \\(\\approx 2^{256}\\)):" +
              "\\[ \\text{Physical qubits (Oratomic): } \\sim 10{,}000 \\]" +
              "\\[ \\text{Runtime at 10K qubits: } \\sim \\text{weeks} \\]" +
              "\\[ \\text{Physical qubits (faster): } \\sim 26{,}000 \\]" +
              "\\[ \\text{Runtime at 26K qubits: } \\sim \\text{days} \\]" +
              "\\[ \\text{Physical qubits (RSA-2048): } \\sim 102{,}000 \\]" +
              "Compare to Gidney's superconducting estimate: \\(< 10^6\\) qubits. " +
              "The neutral-atom advantage comes from: (1) reconfigurability allowing " +
              "non-local connectivity, (2) all-to-all Rydberg interactions within zones, " +
              "(3) transversal CNOT via atom shuttling."
          },
          {
            subtitle: "AI-Assisted Optimization via OpenEvolve",
            content:
              "Oratomic used LLM-powered evolutionary search (OpenEvolve):" +
              "\\[ \\text{Population: } P_t = \\{C_1, C_2, \\ldots, C_N\\} \\quad (N \\sim 1000) \\]" +
              "\\[ \\text{Fitness: } f(C_i) = \\alpha \\cdot Q(C_i)^{-1} + \\beta \\cdot D(C_i)^{-1} + \\gamma \\cdot F(C_i) \\]" +
              "where \\(Q =\\) qubit count, \\(D =\\) circuit depth, \\(F =\\) estimated fidelity. " +
              "LLMs (Gemini, Claude) proposed mutations informed by quantum computing literature. " +
              "After \\(\\sim 10^4\\) generations: 100× reduction in \\(Q\\) vs. baseline. " +
              "This is the first instance of AI meaningfully accelerating quantum algorithm design."
          },
          {
            subtitle: "Comparison: Neutral Atoms vs Superconducting",
            content:
              "\\[\\begin{array}{lcc}" +
              "\\text{Property} & \\text{Neutral Atoms} & \\text{Superconducting} \\\\" +
              "\\hline" +
              "\\text{Qubits (current max)} & 6{,}100 & 1{,}180 \\\\" +
              "\\text{Coherence } T_2 & 13{-}40\\text{s} & 0.1{-}1\\text{ms} \\\\" +
              "\\text{2Q gate fidelity} & 99.5\\% & 99.9\\% \\\\" +
              "\\text{Connectivity} & \\text{reconfigurable} & \\text{fixed lattice} \\\\" +
              "\\text{Operating temp} & \\text{room (vacuum)} & 15\\text{mK} \\\\" +
              "\\text{Fabrication} & \\text{identical atoms} & \\text{lithography} \\\\" +
              "\\text{Scaling path} & \\text{optical arrays} & \\text{cryostat limits} \\\\" +
              "\\end{array}\\]" +
              "Neutral atoms trade slightly lower gate fidelity for dramatically better " +
              "scalability and coherence. For Shor's algorithm (deep circuits, many qubits), " +
              "the neutral-atom trade-off favors cryptographic attacks."
          }
        ]
      },

      /* ───────── Succinct + Google ───────── */
      {
        name: "Succinct + Google — ZK Proof of Quantum Threat",
        formalDefinition:
          "Google's responsible disclosure used a zero-knowledge proof to demonstrate " +
          "circuit correctness without revealing circuit structure. Formally: " +
          "given a committed circuit \\(C\\) with hash \\(h = H(C)\\), prove " +
          "\\(\\exists C : H(C) = h \\wedge \\forall i \\in [9024] : C(x_i) = y_i\\) " +
          "where \\(\\{x_i\\}\\) are publicly derivable test inputs.",
        mathDetails: [
          {
            subtitle: "ZK Proof Construction",
            content:
              "Step 1 — Commitment: \\(h = \\text{SHA-256}(C)\\) (binding) " +
              "\\[ \\text{Published: } h \\quad \\text{Secret: } C \\]" +
              "Step 2 — Test input generation (Fiat-Shamir):" +
              "\\[ x_i = \\text{SHAKE256}(h \\| i) \\quad \\text{for } i = 1, \\ldots, 9024 \\]" +
              "Step 3 — Simulation inside SP1 zkVM:" +
              "\\[ \\text{SP1}(C, \\{x_i\\}) \\rightarrow \\{y_i\\} \\quad \\text{(execution trace)} \\]" +
              "Step 4 — Groth16 wrapping:" +
              "\\[ \\pi = \\text{Groth16.Prove}(\\text{pk}, (h, \\{x_i, y_i\\}), C) \\]" +
              "Step 5 — Verification (anyone):" +
              "\\[ \\text{Groth16.Verify}(\\text{vk}, (h, \\{x_i, y_i\\}), \\pi) \\stackrel{?}{=} 1 \\]" +
              "Properties: zero-knowledge (C not revealed), soundness (no fake circuits " +
              "pass 9024 tests), completeness (honest prover always convinces)."
          },
          {
            subtitle: "Implication for Post-Quantum ZK",
            content:
              "Irony: Groth16 (used here) is itself quantum-vulnerable (pairing-based). " +
              "A CRQC could break both:" +
              "\\[ \\text{1. The crypto being attacked (ECDLP-256)} \\]" +
              "\\[ \\text{2. The proof system used to disclose it (Groth16)} \\]" +
              "Post-quantum alternatives for ZK:" +
              "\\[ \\text{STARKs (hash-based): } \\text{post-quantum safe} \\]" +
              "\\[ \\text{Lattice-based SNARKs: } \\text{in research} \\]" +
              "\\[ \\text{FRI + hash functions: } \\text{Plonky3, Circle STARKs} \\]" +
              "For your thesis: credential verification proofs (currently Groth16) " +
              "should have a migration path to STARKs or lattice-based systems."
          }
        ]
      },

      /* ───────── Quantum AI ───────── */
      {
        name: "Quantum AI — Thousand-Scenario Filtering",
        formalDefinition:
          "AI-accelerated quantum circuit optimization uses evolutionary algorithms " +
          "augmented with Large Language Model proposals. The search space is the set " +
          "of all valid quantum circuits \\(\\mathcal{C}\\) for a target unitary \\(U\\), " +
          "and the objective is to minimize resource cost subject to correctness.",
        mathDetails: [
          {
            subtitle: "Evolutionary Circuit Optimization",
            content:
              "Given target operation \\(U\\) (e.g., modular exponentiation for Shor):" +
              "\\[ \\min_{C \\in \\mathcal{C}} \\; \\text{Cost}(C) = \\alpha |C|_Q + \\beta |C|_D + \\gamma (1 - \\mathcal{F}(C, U)) \\]" +
              "where \\(|C|_Q\\) = qubit count, \\(|C|_D\\) = depth, " +
              "\\(\\mathcal{F}(C, U) = |\\langle \\psi_C | \\psi_U \\rangle|^2\\) = process fidelity. " +
              "LLM augmentation: instead of random mutations, use LLM to propose " +
              "structurally meaningful changes (gate decompositions, state recycling, " +
              "ancilla sharing) informed by training on quantum computing literature."
          },
          {
            subtitle: "Compound Risk: AI × Quantum",
            content:
              "Two acceleration vectors compound:" +
              "\\[ T_{\\text{attack}} = \\frac{T_{\\text{baseline}}}{A_{\\text{AI}} \\cdot A_{\\text{HW}}} \\]" +
              "where \\(A_{\\text{AI}}\\) = AI-driven algorithm improvement factor (currently ~100×), " +
              "\\(A_{\\text{HW}}\\) = hardware scaling factor. " +
              "If \\(A_{\\text{AI}}\\) improves 10× per year (LLM capabilities growth) " +
              "and \\(A_{\\text{HW}}\\) improves 2× per year (qubit count doubling): " +
              "effective attack capability grows \\(\\sim 20\\times\\) annually — " +
              "much faster than classical Moore's law. This compound growth is why " +
              "conservative timelines keep getting compressed."
          }
        ]
      }
    ]
  },

  block2: {
    concepts: [
      /* ───────── Google Quantum AI ───────── */
      {
        name: "Google Quantum AI",
        formalDefinition:
          "Google Quantum AI operates a dual-modality research program: " +
          "superconducting transmon qubits (Sycamore/Willow series) and " +
          "neutral-atom arrays (Boulder lab, from 2026). Their Willow chip (105 qubits) " +
          "was the first to demonstrate below-threshold quantum error correction.",
        mathDetails: [
          {
            subtitle: "Willow: Below-Threshold QEC",
            content:
              "On Willow (Dec 2024), increasing code distance \\(d\\) from 3 to 5 to 7 " +
              "reduced logical error rate exponentially:" +
              "\\[ p_L(d=3) > p_L(d=5) > p_L(d=7) \\]" +
              "This is the first experimental demonstration of the below-threshold regime " +
              "where adding more qubits actually helps (\\(\\Lambda > 1\\)):" +
              "\\[ \\Lambda = \\frac{p_L(d)}{p_L(d+2)} > 1 \\]" +
              "Quantum Echoes (Oct 2025): algorithm demonstrating 13,000× speedup over " +
              "classical simulation for a sampling task — evidence of quantum utility."
          }
        ]
      },

      /* ───────── QuERA ───────── */
      {
        name: "QuERA Computing",
        formalDefinition:
          "QuERA builds neutral-atom quantum computers using \\(^{87}\\text{Rb}\\) " +
          "atoms in reconfigurable optical tweezer arrays with Rydberg-mediated " +
          "entanglement. Their architecture supports arbitrary connectivity via " +
          "mid-circuit atom transport.",
        mathDetails: [
          {
            subtitle: "Architecture Specifications",
            content:
              "Current system (2025):" +
              "\\[ N_{\\text{phys}} = 3{,}000 \\text{ qubits} \\]" +
              "\\[ T_{\\text{operation}} > 2 \\text{ hours (continuous)} \\]" +
              "\\[ N_{\\text{logical}} = 96 \\text{ (below threshold)} \\]" +
              "Demonstrated: magic state distillation with neutral atoms — a key " +
              "ingredient for universal fault-tolerant computation. " +
              "Roadmap implies \\(\\sim 10{,}000\\) physical qubits by 2027, sufficient " +
              "for Oratomic's ECDLP attack threshold."
          }
        ]
      },

      /* ───────── Timeline Synthesis ───────── */
      {
        name: "Quantum Threat Timeline Synthesis",
        formalDefinition:
          "Synthesizing hardware roadmaps, algorithm improvements, and expert assessments " +
          "into a probabilistic threat model for elliptic curve cryptography.",
        mathDetails: [
          {
            subtitle: "Threat Timeline Table",
            content:
              "\\[\\begin{array}{lll}" +
              "\\text{Milestone} & \\text{Date} & \\text{Source} \\\\" +
              "\\hline" +
              "\\text{NSA CNSA 2.0 (new systems)} & \\text{Jan 2027} & \\text{NSA} \\\\" +
              "\\text{10K neutral-atom qubits} & \\text{2027-2028} & \\text{QuERA, Atom Comp.} \\\\" +
              "\\text{Google PQC migration} & \\text{2029} & \\text{Google Security} \\\\" +
              "\\text{CRQC plausible} & \\text{\\sim 2029} & \\text{Aaronson} \\\\" +
              "\\text{NIST deprecate ECDSA} & \\text{2030} & \\text{NIST} \\\\" +
              "\\text{NIST disallow ECDSA} & \\text{2035} & \\text{NIST} \\\\" +
              "\\end{array}\\]"
          },
          {
            subtitle: "Implications for Anonymous Credentials",
            content:
              "Your thesis system uses:" +
              "\\[ \\text{BBS+ signatures: } \\text{pairing-based (vulnerable)} \\]" +
              "\\[ \\text{Groth16 proofs: } \\text{pairing-based (vulnerable)} \\]" +
              "\\[ \\text{BLS12-381 curve: } \\text{256-bit security (quantum: 128-bit)} \\]" +
              "Post-quantum alternatives:" +
              "\\[ \\text{Credentials: lattice-based AC (module lattices, CIC 2026)} \\]" +
              "\\[ \\text{ZK proofs: STARKs (hash-based), Plonky3, Circle STARKs} \\]" +
              "\\[ \\text{Signatures: ML-DSA (FIPS 204), SLH-DSA (FIPS 205)} \\]" +
              "\\[ \\text{Key exchange: ML-KEM (FIPS 203)} \\]" +
              "Migration complexity: BBS+ selective disclosure has no direct lattice equivalent. " +
              "The CIC 2026 construction offers traceability (for revocation) but gives up " +
              "full unlinkability — a fundamental trade-off in the post-quantum regime."
          }
        ]
      }
    ]
  }
};
