# Thesis Study Plan Website

## Goal
Build a single-page interactive study website organizing all resources for a 3-day deep work plan on master thesis topics (Anonymous Credentials + ZKP + TEE for identity & private payments on Sui).

## Stack
- Pure HTML/CSS/JS (no framework, single index.html or small set of files)
- Clean, minimal design — study-focused, dark mode friendly
- Mobile responsive
- Deploy-ready for Vercel

## Design Requirements
- **Navigation:** Sticky top bar with 3 day tabs + progress indicator
- **Layout per day:** 2 blocks (9h-11h and 11h30-13h30), each with:
  - Block title and learning objectives
  - Resource cards (video embeds for YouTube, links for papers/docs)
  - Each resource has: title, author/source, type badge (Video/Paper/Book/Tutorial), estimated time, description
  - Checkbox per resource for progress tracking (localStorage persistence)
- **Progress bar:** Global progress % at the top based on checked items
- **Pomodoro timer:** Simple 25min/5min timer for study sessions, toggleable
- **Color scheme:** Each day has a distinct accent color (like the calendar events)
- **YouTube embeds:** Embedded iframes for all YouTube videos, lazy-loaded

## Resource Organization

### DAY 1 — Tuesday March 31: Crypto Foundations + ZKP

#### Block 1 (9h-11h): Crypto Primitives + ZKP Fundamentals
| Resource | Type | URL | Est. Time |
|----------|------|-----|-----------|
| Cryptography for blockchains: Avoiding common mistakes — Dan Boneh | Video | https://www.youtube.com/watch?v=9yNsOg3_Y3k | 45min |
| Berkeley ZK MOOC — Lectures 1-2 | Course | https://zk-learning.org/ | 30min |
| RareSkills ZK Book — Module 1: Foundational Math | Book | https://rareskills.io/zk-book | 30min |
| Updraft Cyfrin — Fundamentals of ZKPs | Course | https://updraft.cyfrin.io/courses/fundamentals-of-zero-knowledge-proofs | 15min |

#### Block 2 (11h30-13h30): Proving Systems (SNARKs, STARKs, PLONK)
| Resource | Type | URL | Est. Time |
|----------|------|-----|-----------|
| PLONK paper — Gabizon, Williamson, Ciobotaru | Paper | https://eprint.iacr.org/2019/953 | 45min |
| RareSkills ZK Book — Module 2: ZK-SNARKs (Groth16) | Book | https://rareskills.io/zk-book | 30min |
| RareSkills ZK Book — Module 4: Bulletproofs | Book | https://rareskills.io/zk-book | 20min |
| ZK Proof Frameworks Survey (2025) | Paper | https://arxiv.org/html/2502.07063v1 | 25min |

### DAY 2 — Wednesday April 1: Anonymous Credentials + TEEs

#### Block 1 (9h-11h): Anonymous Credentials (CL, BBS+, VCs)
| Resource | Type | URL | Est. Time |
|----------|------|-----|-----------|
| Anonymous Credentials & Decentralizing ID — Foteini Baldimtsi (a16z) | Video | https://www.youtube.com/watch?v=kgNcxQH-hMQ | 40min |
| Efficient Anonymous Updatable Credentials — Samuel Jaques | Video | https://www.youtube.com/watch?v=knyNFTfXcb4 | 30min |
| SoK: Anonymous Credentials for Digital Identity Wallets | Paper | https://eprint.iacr.org/2026/330 | 25min |
| OpenAC: Transparent & Lightweight Anonymous Credentials | Paper | https://eprint.iacr.org/2026/251 | 15min |
| Dock Network BBS+ Tutorial | Tutorial | https://docknetwork.github.io/sdk/tutorials/tutorial_anoncreds.html | 10min |

#### Block 2 (11h30-13h30): TEEs (SGX, Attestation, Trust Model)
| Resource | Type | URL | Est. Time |
|----------|------|-----|-----------|
| TEEs for Blockchain Applications — Ari Juels (a16z) | Video | https://www.youtube.com/watch?v=Xq7oWtiwWII | 40min |
| Accessing Data Privately — Elaine Shi (a16z) | Video | https://www.youtube.com/watch?v=enAohl_yEL0 | 35min |
| TEE Complete Guide 2026 — Trezalabs | Tutorial | https://www.trezalabs.com/blog/what-is-a-trusted-execution-environment-tee-complete-guide | 20min |
| Microsoft TEE Documentation | Docs | https://learn.microsoft.com/en-us/azure/confidential-computing/trusted-execution-environment | 15min |
| Luca Mariot channel — TEE/crypto lectures | Channel | https://www.youtube.com/@lucamariot5689 | 10min |

### DAY 3 — Thursday April 2: Blockchain Privacy + Integration

#### Block 1 (9h-11h): Blockchain Privacy (Zcash, Sui, Private Payments)
| Resource | Type | URL | Est. Time |
|----------|------|-----|-----------|
| Twilight: Differentially Private Payment Channel — Saar Tochner (a16z) | Video | https://www.youtube.com/watch?v=YiPio_tYq9g | 35min |
| UTT: Decentralized Ecash with Accountable Privacy | Paper | https://eprint.iacr.org/2022/452 | 30min |
| Lether: Post-Quantum Account-Based Private Payments | Paper | https://eprint.iacr.org/2026/076 | 25min |
| SoK: Privacy-Preserving Transactions in Blockchains | Paper | https://eprint.iacr.org/2024/1959 | 20min |
| Sui Architecture Documentation | Docs | https://docs.sui.io/concepts/sui-architecture | 10min |

#### Block 2 (11h30-13h30): ZKP+TEE Integration + Thesis Architecture
| Resource | Type | URL | Est. Time |
|----------|------|-----|-----------|
| Quantum-Safe Private Group System for Signal | Paper | https://eprint.iacr.org/2026/453 | 30min |
| Promise of ZKPs for Blockchain Privacy (Wiley 2025) | Paper | https://onlinelibrary.wiley.com/doi/abs/10.1002/spy2.461 | 25min |
| Privacy-Preserving Credentials with BBS (Unibe thesis 2025) | Paper | https://crypto.unibe.ch/archive/theses/2025.bsc.lukas.leuba.pdf | 25min |
| Blockchain Privacy: Monero vs Zcash vs Canton — Tiger Research | Article | https://reports.tiger-research.com/p/privacy-blockchain-eng | 15min |
| Sui Developer Portal | Docs | https://www.sui.io/developers | 10min |
| Making BBS Anonymous Credentials eIDAS 2.0 Compliant | Paper | https://eprint.iacr.org/2025/619 | 15min |

## Features
- LocalStorage for progress persistence
- Smooth scroll between days
- Collapsible resource cards
- YouTube thumbnail preview that expands to full embed on click (performance)
- Print-friendly version (Ctrl+P strips interactive elements)
- Keyboard shortcuts: 1/2/3 to switch days, Space to toggle timer
