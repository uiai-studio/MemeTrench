# MemeTrench Protocol & TrenchScreen Terminal

> **Universal 6-Chain Memecoin Launchpad & Real-Time Trading Terminal**  
> Powered by the Omniguard Protocol • 2-2-1 Tri-Vault Revenue Engine • 60/20/20 Ad Revenue Distribution Pool • Dual-Oracle & 72h Soft-Landing Floor Protection

[![License: MIT](https://img.shields.io/badge/License-MIT-amber.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-cyan.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8.svg)](https://tailwindcss.com/)
[![Chains](https://img.shields.io/badge/Chains-BSC%20%7C%20Solana%20%7C%20Base%20%7C%20ETH%20%7C%20TON%20%7C%20Sui-emerald.svg)](https://github.com/uiai-studio)
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen.svg)]()

---

## 🌐 Live Demo & Proof of Work

- **Live Application:** [MemeTrench & TrenchScreen Terminal](https://ais-pre-aq5jcyrpikvf4s7wo4cvxo-517768755508.europe-west2.run.app)
- **GitHub Repository:** [https://github.com/uiai-studio](https://github.com/uiai-studio)
- **Author & Lead Engineer:** **Muhammad Idris Umar** ([uiai.studio@gmail.com](mailto:uiai.studio@gmail.com))

---

## 🚀 Overview

**MemeTrench** is a high-performance, full-stack memecoin launchpad and trading terminal engineered across 6 blockchain ecosystems (**BNB Smart Chain / BSC, Solana, Base, Ethereum, TON, and Sui**).

Traditional launchpads suffer from predatory MEV front-running, sudden rugpulls, and misaligned developer incentives. MemeTrench solves this through an uncheatable mathematical architecture:
1. **The 2-2-1 Tri-Vault Revenue Engine** converts transaction fees into sustainable creator salaries, holder dividends, and perpetual deflationary burns.
2. **60/20/20 Ad Revenue Distribution Pool** creates a self-serve advertising ecosystem where 20% of all sponsor bids are distributed directly to token holders.
3. **Continuous TWAR 48-Hour Micro-Batch Vesting** eliminates instantaneous post-launch dumps.
4. **72-Hour Soft-Landing Floor Vault** guarantees a 50% pro-rata native refund parachute for token buyers if momentum stalls below $80K market cap.

---

## ⚡ Core Invariants & Architecture

### 1. 🪙 2-2-1 Tri-Vault Revenue Engine
Every trade allocates a total 5% fee split programmatically:
- **2% Creator Stream Vault:** Streamed linearly per block over 30 days. No upfront dump capability.
- **2% Diamond Holder Dividend Vault:** Continuous native currency reflections claimable by diamond hand wallets in real-time.
- **1% Perpetual Buyback & Burn Vault:** Automated execution against the bonding curve or graduated liquidity pool.

### 2. 📢 60/20/20 Self-Serve Ad Auction & Holder Yield Pool
Monetize high-traffic launchpad real estate through an on-chain ad bidding system:
- **60% Protocol Treasury:** Funds ecosystem operations, RPC nodes, and security audits.
- **20% Token Holder Dividend Pool:** Distributed pro-rata to verified token diamond hands.
- **20% Automated Token Buyback & Burn:** Market-buys active tokens and burns them forever.

### 3. ⏳ TWAR Continuous Micro-Batch Linear Unlocking (48h)
- **Immediate Liquidity:** 20% of purchased tokens are instantly liquid upon swap execution.
- **Micro-Batch Linear Release:** The remaining 80% unlocks smoothly across 48 hours using deterministic block-time offsets.
- **5-Block Anti-Sniping Cooldown:** Prevents automated bot bundling in the first blocks after deployment.

### 4. 🪂 72-Hour Soft-Landing Floor Vault Protection
- If a memecoin does not reach an $80K market cap within 72 hours of launch:
  - **50% of the Escrow Vault** is unlocked as a guaranteed pro-rata refund in native currency (BNB, SOL, ETH, TON, SUI) to all participating buyers.
  - **50% of the Escrow Vault** is allocated to a community DAO governance relaunch.

### 5. 🔍 Dual-Oracle Verification & Verifiable Supply Forensics
- **Dual-Oracle Feed:** Real-time cross-validation comparing Chainlink and Pyth network oracles with maximum allowed divergence caps (<0.5%).
- **Gini Coefficient Telemetry:** Real-time wallet distribution analytics to catch cabal accumulations before investing.

### 6. 🛡️ Cryptographic Developer Trust Badges
- Verified ZK Identity proofs.
- Non-custodial KYC verification and security audit certifications.
- Reputation scoring based on multi-chain historical contract track records.

### 7. 📄 1-Click Builder Resume PDF Generator
- Direct client-side vector generation of **Muhammad Idris Umar's** official engineering resume via `jsPDF` (`Muhammad_Idris_Umar_Resume.pdf`).

---

## 🛠️ Tech Stack

- **Frontend Framework:** React 18 with TypeScript
- **Styling & Layout:** Tailwind CSS with responsive mobile-first architecture
- **Build Tool:** Vite & `esbuild`
- **Backend / API:** Express.js (Node.js TypeScript runtime)
- **PDF Engine:** `jspdf`
- **Visuals & Icons:** Lucide React & Canvas Confetti
- **Multi-Chain Architecture:** EVM (BSC, Base, Ethereum), SVM (Solana), TVM (TON), Move (Sui)

---

## 📂 Project Structure

```
├── index.html                   # HTML entry point with responsive viewport
├── metadata.json                # Project capabilities & configuration
├── package.json                 # Dependency manifest & build scripts
├── server.ts                    # Express API server with Vite middleware
├── src/
│   ├── main.tsx                 # React application entry point
│   ├── App.tsx                  # Root component & modal orchestrator
│   ├── index.css                # Global Tailwind CSS entry
│   ├── types.ts                 # TypeScript types (Tokens, Trades, Vaults, Badges)
│   ├── components/
│   │   ├── Navbar.tsx           # Multi-chain navigation, live ticker & mobile drawer
│   │   ├── TradingTerminal.tsx  # Dynamic candlestick terminal & swap engine
│   │   ├── TokenScreener.tsx    # Multi-chain 6-network screener & filter table
│   │   ├── ResumeModal.tsx      # Muhammad Idris Umar's 1-Page PDF Resume generator
│   │   ├── TriVaultCard.tsx     # 2-2-1 Tri-Vault Revenue Engine interface
│   │   ├── TriVaultModal.tsx    # Detailed Tri-Vault audit & parameter breakdown
│   │   ├── AdAuctionModal.tsx   # 60/20/20 Ad Banner bidding & holder dividend claims
│   │   ├── DevBadgeModal.tsx    # ZK-Proof & Dev Trust Badges management
│   │   ├── LaunchpadModal.tsx   # 6-Chain token deployment modal
│   │   ├── ArchitectureModal.tsx# Complete Omniguard Protocol Architecture Blueprint
│   │   ├── SoftLandingDashboardModal.tsx # 72h floor vault refund & DAO voting
│   │   ├── OracleHealthMonitorModal.tsx  # Chainlink vs Pyth oracle divergence health
│   │   ├── VerifiableForensicsModal.tsx  # Gini index & supply distribution inspector
│   │   ├── CampaignStudioModal.tsx       # Memecoin marketing campaign studio
│   │   ├── BscHeatmapModal.tsx           # BSC ecosystem trading volume heatmap
│   │   └── MainnetHubModal.tsx           # Autonomous Keeper and mainnet contracts hub
│   ├── context/
│   │   └── WalletContext.tsx    # Multi-chain non-custodial wallet provider
│   └── data/
│       ├── chainConfig.ts       # 6-Chain network configurations & RPC endpoints
│       └── mockTokens.ts        # Initial multi-chain verified token registries
└── README.md                    # Project documentation
```

---

## 🚦 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### 1. Clone the Repository
```bash
git clone https://github.com/uiai-studio/memetrench.git
cd memetrench
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
```

### 5. Start Production Server
```bash
npm start
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Healthcheck indicator |
| `GET` | `/api/tokens` | Retrieves all active 6-chain memecoins with live metrics |
| `POST` | `/api/tokens/swap` | Executes a Buy/Sell with TWAR vesting calculation |
| `POST` | `/api/tokens/launch` | Deploys a new token on the selected chain with bonding curve |
| `POST` | `/api/tokens/:mint/claim-insurance` | Claims 50% pro-rata refund if floor protection is active |
| `GET` | `/api/ads/auction` | Fetches active sponsored banner placements & ad stats |
| `POST` | `/api/ads/auction` | Submits a new advertiser bid with 60/20/20 revenue distribution |
| `POST` | `/api/user/:address/claim-ad-revenue` | Claims accumulated 20% ad revenue dividends for token holders |

---

## 📱 Responsive Design Matrix

MemeTrench is optimized for all screen form factors:
- **Mobile Phones (320px – 640px):** Dedicated hamburger drawer, touch-friendly 44px tap targets, scrollable tickers, and single-column stacked terminals.
- **Tablets (640px – 1024px):** 2-column balanced screeners, responsive navigation pills, and adaptive charts.
- **Desktops & Ultra-Wide (1024px+):** 12-column high-density trading workstation with live candlestick charting, real-time depth, and multi-chain screener.

---

## 👤 Author & Builder

- **Name:** **Muhammad Idris Umar**
- **Role:** Full-Stack & Web3 Software Engineer
- **Email:** [uiai.studio@gmail.com](mailto:uiai.studio@gmail.com)
- **GitHub:** [https://github.com/uiai-studio](https://github.com/uiai-studio)
- **Location:** Nigeria (Available for Global Remote Opportunities)

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
