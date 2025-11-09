# Wallet Health Monitor 🛡️

A non-custodial Web3 wallet scanner that helps users assess the security of their wallet by detecting risky token approvals, suspicious tokens, and contract risk signals across multiple blockchains.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Turborepo](https://img.shields.io/badge/Turborepo-2.0-red)

## 🎯 Overview

Wallet Health Monitor is a comprehensive, non-custodial Web3 security platform that provides instant security audits, real-time monitoring, and advanced analytics for crypto wallets. It scans for:

- **Risky token approvals** - Detect unlimited allowances and suspicious spenders
- **Spam & phishing tokens** - Identify malicious airdrops
- **Contract risk signals** - Flag new/unverified contracts
- **Multi-chain support** - Ethereum, BNB Chain, Polygon, Base, and Arbitrum
- **Real-time monitoring** - Continuous wallet activity tracking with alerts
- **DeFi exposure analysis** - Comprehensive DeFi protocol risk assessment
- **NFT security scanning** - Detect suspicious NFTs and phishing attempts
- **Gas optimization** - Track and optimize gas prices across chains
- **Transaction simulation** - Preview transaction outcomes before execution
- **Portfolio analytics** - Comprehensive portfolio performance and risk analysis

**No smart contracts required** — the app reads on-chain and public data through the GoldRush API.

## 🏗️ Architecture

This project is a **Turborepo monorepo** with the following structure:

```
wallet-health/
├── apps/
│   ├── wallet-health/          # Main wallet scanner app (Next.js 15)
│   │   ├── app/
│   │   │   ├── api/           # Next.js API routes
│   │   │   │   ├── scan/     # GoldRush API integration
│   │   │   │   ├── risk/     # Risk analysis endpoints
│   │   │   │   └── db/       # MongoDB operations
│   │   │   ├── dashboard/    # Dashboard page
│   │   │   └── page.tsx      # Landing page
│   │   ├── components/
│   │   │   ├── providers/    # Web3 & Theme providers
│   │   │   ├── dashboard/    # Dashboard components
│   │   │   └── ui/          # Shadcn UI components
│   │   └── lib/
│   │       ├── web3-config.ts              # Wagmi & WalletConnect config
│   │       ├── mongodb.ts                  # Database connection
│   │       ├── risk-scorer.ts              # Risk scoring algorithm
│   │       ├── wallet-monitor.ts           # Real-time wallet monitoring
│   │       ├── gas-tracker.ts              # Gas price tracking & optimization
│   │       ├── nft-security-scanner.ts      # NFT security analysis
│   │       ├── defi-exposure-analyzer.ts   # DeFi protocol exposure analysis
│   │       ├── transaction-simulator.ts    # Transaction simulation & preview
│   │       ├── portfolio-performance-tracker.ts  # Portfolio performance tracking
│   │       ├── contract-interaction-tracker.ts   # Smart contract interaction history
│   │       ├── price-alert-manager.ts      # Token price alerts system
│   │       ├── activity-heatmap-generator.ts      # Activity heatmap visualization
│   │       ├── risk-trend-analyzer.ts      # Risk trend analysis over time
│   │       ├── approval-optimizer.ts       # Token approval optimization
│   │       ├── cross-chain-bridge-tracker.ts      # Cross-chain bridge tracking
│   │       ├── mev-protection-analyzer.ts         # MEV protection analysis
│   │       ├── token-unlock-tracker.ts            # Token unlock/vesting tracking
│   │       ├── governance-tracker.ts               # DAO governance participation
│   │       ├── tax-report-generator.ts             # Tax report generation
│   │       ├── liquidity-pool-analyzer.ts         # LP position analysis
│   │       ├── staking-tracker.ts                  # Staking positions & rewards
│   │       ├── wallet-backup-manager.ts           # Wallet backup management
│   │       ├── flashloan-monitor.ts                # Flashloan usage monitoring
│   │       ├── smart-contract-security-scanner.ts  # Deep contract security analysis
│   │       ├── wallet-reputation-system.ts         # Wallet reputation scoring
│   │       ├── multisig-manager.ts                 # Multi-sig wallet management
│   │       ├── ens-domain-manager.ts               # ENS domain management
│   │       ├── airdrop-eligibility-checker.ts      # Airdrop eligibility checking
│   │       ├── portfolio-rebalancer.ts             # Portfolio rebalancing strategies
│   │       ├── yield-opportunity-finder.ts         # Yield farming opportunity finder
│   │       ├── whale-watcher.ts                     # Whale activity tracking
│   │       ├── rug-pull-detector.ts                 # Rug pull risk detection
│   │       ├── transaction-batch-executor.ts        # Batch transaction execution
│   │       ├── activity-timeline-generator.ts        # Activity timeline generation
│   │       ├── token-metadata-fetcher.ts            # Token metadata fetching
│   │       ├── address-book-manager.ts              # Address book management
│   │       ├── gas-price-predictor.ts               # Gas price prediction
│   │       ├── smart-contract-deployer-helper.ts    # Contract deployment helper
│   │       ├── dca-automation.ts                    # DCA automation strategies
│   │       ├── limit-order-manager.ts               # Limit order management
│   │       ├── recurring-payments-manager.ts         # Recurring payments management
│   │       ├── token-swap-aggregator.ts             # Token swap route aggregation
│   │       ├── carbon-footprint-tracker.ts          # Carbon footprint tracking
│   │       ├── social-recovery-manager.ts           # Social recovery wallet management
│   │       ├── on-chain-reputation-system.ts        # On-chain reputation scoring
│   │       ├── options-derivatives-dashboard.ts     # Options & derivatives tracking
│   │       ├── token-launchpad-platform.ts           # Token launch tracking
│   │       ├── profit-loss-calculator.ts             # P&L calculation
│   │       ├── network-status-monitor.ts            # Network status monitoring
│   │       ├── quick-actions-manager.ts              # Quick actions management
│   │       ├── security-badge-generator.ts          # Security badge generation
│   │       ├── smart-alert-automation.ts            # Automated alert rules
│   │       ├── dao-treasury-manager.ts              # DAO treasury management
│   │       ├── token-vesting-scheduler.ts           # Token vesting scheduling
│   │       ├── token-snapshot-manager.ts            # Token balance snapshots
│   │       ├── wallet-comparison-tool.ts             # Wallet comparison utility
│   │       ├── transaction-fee-optimizer.ts         # Transaction fee optimization
│   │       ├── token-price-tracker.ts               # Token price tracking
│   │       ├── wallet-activity-exporter.ts          # Activity data export
│   │       ├── multi-chain-portfolio-aggregator.ts  # Multi-chain portfolio aggregation
│   │       ├── token-distribution-analyzer.ts       # Token distribution analysis
│   │       ├── wallet-clustering-tool.ts            # Wallet behavior clustering
│   │       ├── transaction-simulator.ts             # Transaction simulation
│   │       ├── gas-price-history-tracker.ts         # Gas price history tracking
│   │       ├── wallet-health-score-calculator.ts    # Wallet health score calculation
│   │       ├── token-approval-risk-analyzer.ts      # Token approval risk analysis
│   │       ├── smart-contract-interaction-history.ts # Contract interaction tracking
│   │       ├── portfolio-rebalancing-suggestions.ts # Rebalancing suggestions
│   │       ├── yield-farming-opportunity-finder.ts # Yield farming opportunities
│   │       ├── wallet-activity-patterns-analyzer.ts # Activity pattern analysis
│   │       ├── transaction-batch-optimizer.ts        # Batch transaction optimization
│   │       ├── wallet-reputation-builder.ts          # Wallet reputation building
│   │       ├── token-sniper-alert-system.ts         # Token sniper alerts
│   │       ├── defi-protocol-risk-analyzer.ts        # DeFi protocol risk analysis
│   │       ├── nft-collection-tracker.ts            # NFT collection tracking
│   │       ├── cross-chain-asset-tracker.ts          # Cross-chain asset tracking
│   │       ├── wallet-recovery-assistant.ts          # Wallet recovery assistance
│   │       ├── gas-war-monitor.ts                    # Gas war monitoring
│   │       ├── token-price-alert-manager.ts         # Advanced price alert management
│   │       ├── wallet-activity-heatmap-generator.ts # Activity heatmap generation
│   │       ├── smart-contract-security-scanner.ts    # Contract security scanning
│   │       ├── token-unlock-tracker.ts               # Token unlock/vesting tracking
│   │       ├── governance-proposal-tracker.ts       # DAO proposal tracking
│   │       ├── liquidity-pool-position-analyzer.ts  # LP position analysis
│   │       ├── staking-rewards-calculator.ts         # Staking rewards calculation
│   │       ├── wallet-backup-validator.ts           # Backup validation
│   │       ├── portfolio-optimizer.ts      # Portfolio optimization algorithms
│   │       ├── risk-model-engine.ts        # Advanced risk modeling
│   │       ├── yield-optimizer.ts          # Yield optimization
│   │       ├── alert-manager.ts           # Alert system & notifications
│   │       ├── activity-timeline.ts       # Activity timeline generator
│   │       ├── ens-resolver.ts            # ENS domain resolution
│   │       ├── multisig-analyzer.ts       # Multi-signature wallet analyzer
│   │       ├── approval-revoker.ts        # Token approval revocation helper
│   │       ├── wallet-backup.ts          # Wallet backup & export utility
│   │       ├── watchlist-manager.ts      # Watchlist manager for multiple wallets
│   │       ├── mev-protection-analyzer.ts # MEV protection analysis
│   │       ├── governance-tracker.ts    # DAO governance participation tracking
│   │       ├── activity-heatmap-generator.ts # Activity heatmap visualization
│   │       ├── security-recommendations.ts # Security recommendations engine
│   │       ├── approval-history-tracker.ts # Approval history tracking
│   │       ├── wallet-tagging.ts        # Wallet tagging & categorization
│   │       ├── token-metadata-cache.ts  # Token metadata caching system
│   │       └── risk-trend-analyzer.ts   # Risk trend analysis over time
│   │       ├── token-metadata-cache.ts    # Token metadata caching system
│   │       ├── transaction-batch-analyzer.ts # Transaction batch analyzer
│   │       ├── wallet-tagging.ts         # Wallet tagging & categorization
│   │       ├── security-recommendations.ts # Security recommendations engine
│   │       ├── approval-history-tracker.ts # Approval history tracking
│   │       ├── address-book.ts           # Address book manager
│   │       ├── gas-optimization-calculator.ts # Gas optimization calculator
│   │       ├── wallet-health-report.ts   # Wallet health report generator
│   │       ├── wallet-recovery-checker.ts # Recovery phrase security checker
│   │       ├── token-allowance-monitor.ts # Real-time allowance monitoring
│   │       ├── wallet-activity-analyzer.ts # Deep activity pattern analysis
│   │       ├── risk-prediction-engine.ts # Risk prediction based on patterns
│   │       ├── wallet-clustering.ts      # Wallet clustering & relationships
│   │       ├── transaction-fee-optimizer.ts # Transaction fee optimization
│   │       ├── wallet-security-audit.ts  # Comprehensive security audit
│   │       └── cross-chain-portfolio-aggregator.ts # Cross-chain portfolio aggregation
│   │       ├── token-unlock-tracker.ts  # Token vesting & unlock tracking
│   │       ├── cross-chain-bridge-tracker.ts # Cross-chain bridge tracking
│   │       ├── staking-tracker.ts       # Staking positions & rewards tracking
│   │       ├── mev-protection-analyzer.ts # MEV protection analysis
│   │       ├── governance-tracker.ts    # DAO governance participation tracking
│   │       └── activity-heatmap.ts      # Activity heatmap generation
│   └── dashboard/              # Legacy dashboard (preserved)
├── packages/
│   ├── ui/                    # Shared UI components
│   ├── config/               # Shared TypeScript configs
│   └── types/                # Shared TypeScript types
├── turbo.json                # Turborepo configuration
└── package.json              # Root package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm 8+
- MongoDB instance (local or cloud)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/folajindayo/wallet-health.git
cd wallet-health
```

2. **Install dependencies**

```bash
npm install -g turbo
pnpm install
```

3. **Set up environment variables**

For the wallet-health app, create `apps/wallet-health/.env.local`:

```bash
# Reown (WalletConnect) Project ID
NEXT_PUBLIC_REOWN_PROJECT_ID=your_reown_project_id

# GoldRush (Covalent) API Key
GOLDRUSH_API_KEY=your_goldrush_api_key

# MongoDB Connection String
MONGODB_URI=your_mongodb_connection_string
```

> **Note**: Get your API keys from:
> - Reown (WalletConnect): https://cloud.reown.com/
> - GoldRush (Covalent): https://goldrush.dev/

4. **Run the development server**

```bash
# Run all apps
pnpm dev

# Or run wallet-health app only
cd apps/wallet-health
pnpm dev
```

5. **Open the app**

Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Technology Stack

### Core Technologies

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5
- **Styling**: TailwindCSS v4 (dark mode default)
- **Monorepo**: Turborepo 2.0
- **Package Manager**: pnpm

### Web3 Stack

- **Wallet Connection**: Reown AppKit (WalletConnect v2)
  - Multi-wallet support (MetaMask, WalletConnect, Coinbase Wallet, etc.)
  - Session management and persistence
  - Deep linking and QR code scanning
  - Custom branding and theming
- **Blockchain Interaction**: Wagmi + Viem
  - Type-safe contract interactions
  - Multi-chain support
  - Transaction simulation and gas estimation
- **State Management**: React Query (@tanstack/react-query)
  - Optimistic updates
  - Automatic caching and refetching
  - Background synchronization

### Base L2 Integration

- **Native Base Support**: Optimized for Base network
  - Custom RPC endpoints with load balancing
  - Base OP Stack integration
  - Superchain support
  - Gas optimization strategies
  - Transaction monitoring and analytics
  - Bridge functionality UI
  - Testnet support (Base Sepolia)

### APIs & Data

- **Blockchain Data**: GoldRush API (Covalent)
- **Database**: MongoDB
- **API Routes**: Next.js API Routes

### UI Components

- **Component Library**: Shadcn UI
- **Icons**: Lucide React
- **Charts**: Recharts
- **Primitives**: Radix UI

## 📊 Risk Scoring Algorithm

The security score is calculated based on multiple risk factors:

| Parameter | Weight | Description |
|-----------|--------|-------------|
| Active Approvals (>10) | -15 pts | Too many active token approvals |
| Unverified Contracts | -25 pts each | Approvals to unverified contracts |
| New Contracts (<30 days) | -10 pts each | Recently deployed contracts |
| Spam Tokens Detected | -20 pts | Phishing or spam tokens in wallet |
| ENS / Verified Protocols | +10 pts | Using verified protocols |

### Risk Levels

- 🟢 **Safe (80-100)**: Healthy wallet with good security practices
- 🟠 **Moderate (50-79)**: Some concerns that need attention
- 🔴 **Critical (0-49)**: Immediate action required

## 🌐 Supported Chains

- **Ethereum Mainnet** (Chain ID: 1)
- **BNB Smart Chain** (Chain ID: 56)
- **Polygon** (Chain ID: 137)
- **Base** (Chain ID: 8453) - Enhanced support with L2 optimizations
- **Base Sepolia** (Chain ID: 84532) - Testnet support
- **Arbitrum One** (Chain ID: 42161)
- **Optimism** (Chain ID: 10) - Coming soon
- **Avalanche** (Chain ID: 43114) - Coming soon

### Chain-Specific Features

- **Base Network**: 
  - OP Stack integration
  - Superchain compatibility
  - Optimized gas estimation
  - Native token support
  - Bridge UI components

## ✨ Features

### Core Security Features

- **🔍 Approval Scanner** - Comprehensive token approval analysis across all supported chains
- **🛡️ Risk Detection** - Multi-factor risk assessment with detailed scoring
- **🚨 Real-time Alerts** - Continuous monitoring with instant notifications for suspicious activity
- **📊 Security Score** - 0-100 health score with actionable recommendations

### Advanced Analytics

- **💼 DeFi Exposure Analyzer** - Track and analyze DeFi protocol positions and risks
- **🎨 NFT Security Scanner** - Detect suspicious NFTs, phishing attempts, and unverified collections
- **⛽ Gas Tracker** - Real-time gas price tracking with optimization recommendations
- **🔄 Transaction Simulator** - Preview transaction outcomes before execution
- **📈 Portfolio Analytics** - Comprehensive portfolio performance and risk analysis
- **🔗 Cross-chain Tracking** - Unified view across multiple blockchains

### Monitoring & Alerts

- **👁️ Real-time Monitoring** - Continuous wallet activity tracking
- **🔔 Smart Alerts** - Configurable alerts for large transfers, new approvals, and suspicious contracts
- **📜 Activity Timeline** - Complete transaction history with risk annotations
- **📊 Historical Trends** - Track security score changes over time

### Utility Features

- **🔀 Wallet Comparison** - Compare multiple wallets side-by-side with similarity scoring
- **💾 Export Reports** - Export scan results as JSON, CSV, PDF, or encrypted backups
- **🔐 Multi-sig Support** - Analyze multi-signature wallet configurations and security
- **🌐 ENS Integration** - Resolve ENS domains, reverse lookup, and verify ownership
- **📋 Address Book** - Manage saved addresses with labels, tags, and verification status
- **🏷️ Wallet Tagging** - Tag and categorize wallets for better organization
- **📝 Watchlist Manager** - Monitor multiple wallets with groups and alerts
- **💾 Wallet Backup** - Secure wallet data export with encryption support
- **📊 Health Report Generator** - Generate comprehensive wallet health reports
- **🔗 Wallet Clustering** - Group related wallets based on patterns and relationships
- **📊 Activity Analyzer** - Deep analysis of wallet activity patterns and behaviors

### Portfolio & Performance Features

- ✅ **📈 Portfolio Performance Tracker** - Track portfolio value, returns, and performance metrics over time
- ✅ **📊 Activity Heatmap** - Visualize wallet activity patterns by day and hour
- ✅ **📉 Risk Trend Analyzer** - Analyze risk score trends and predict future risk levels
- ✅ **💰 Token Price Alerts** - Set and manage price alerts for tokens
- ✅ **📜 Contract Interaction History** - Track all smart contract interactions with detailed statistics

### Optimization Features

- ✅ **⚡ Approval Optimizer** - Get recommendations for optimal token approval amounts
- ✅ **🌉 Cross-chain Bridge Tracker** - Track assets bridged across different chains
- ✅ **⏱️ Gas Optimization Calculator** - Calculate optimal gas prices and estimate costs
- ✅ **🔄 Approval Revoker** - Safely revoke risky token approvals with batch support
- ✅ **📊 Transaction Batch Analyzer** - Analyze multiple transactions for patterns and risks

### Advanced DeFi Features

- ✅ **🛡️ MEV Protection Analyzer** - Analyze MEV risks and suggest protection strategies
- ✅ **🔓 Token Unlock Tracker** - Track token unlocks and vesting schedules
- ✅ **🗳️ Governance Tracker** - Track DAO governance participation and voting history
- ✅ **💧 Liquidity Pool Analyzer** - Analyze LP positions and calculate impermanent loss
- ✅ **💰 Staking Tracker** - Track staking positions, rewards, and performance
- ✅ **⚡ Flashloan Monitor** - Monitor flashloan usage and detect risks
- ✅ **💰 Yield Opportunity Finder** - Find best yield farming opportunities

### Financial & Compliance Features

- ✅ **📊 Tax Report Generator** - Generate comprehensive tax reports from transactions
- ✅ **💾 Wallet Backup Manager** - Manage wallet backups and recovery methods

### Advanced Security & Analysis Features

- ✅ **🔒 Smart Contract Security Scanner** - Deep security analysis of contracts
- ✅ **⭐ Wallet Reputation System** - Build reputation scores based on activity
- ✅ **👥 Multi-sig Wallet Manager** - Manage and analyze multi-signature wallets
- ✅ **🌐 ENS Domain Manager** - Manage ENS domains and subdomains
- ✅ **🎁 Airdrop Eligibility Checker** - Check eligibility for airdrop campaigns
- ✅ **⚖️ Portfolio Rebalancer** - Suggest portfolio rebalancing strategies
- ✅ **🐋 Whale Watcher** - Track large wallet movements and whale activity
- ✅ **🚨 Rug Pull Detector** - Detect potential rug pull risks in tokens
- ✅ **📜 Activity Timeline Generator** - Visual timeline of wallet activities
- ✅ **📇 Token Metadata Fetcher** - Fetch and cache token metadata
- ✅ **📖 Address Book Manager** - Manage frequently used addresses
- ✅ **⛽ Gas Price Predictor** - Predict future gas prices
- ✅ **🚀 Smart Contract Deployer Helper** - Safe contract deployment assistance
- ✅ **📦 Transaction Batch Executor** - Execute multiple transactions efficiently

### Trading & Automation Features

- ✅ **📈 DCA Automation** - Automate dollar-cost averaging strategies
- ✅ **📊 Limit Order Manager** - Manage limit orders for token swaps
- ✅ **🔄 Recurring Payments Manager** - Manage recurring crypto payments
- ✅ **🔄 Token Swap Aggregator** - Find best swap routes across DEXs

### Sustainability & Social Features

- ✅ **🌱 Carbon Footprint Tracker** - Track carbon footprint of transactions
- ✅ **👥 Social Recovery Manager** - Manage social recovery wallets and guardians
- ✅ **⭐ On-chain Reputation System** - Build reputation based on on-chain activity
- ✅ **📊 Options & Derivatives Dashboard** - Track options and derivatives positions
- ✅ **🚀 Token Launchpad Platform** - Track token launches and ICOs
- ✅ **💰 Profit/Loss Calculator** - Calculate P&L for positions and transactions
- ✅ **🌐 Network Status Monitor** - Monitor blockchain network status and health
- ✅ **⚡ Quick Actions Manager** - Quick action shortcuts for common operations
- ✅ **🏆 Security Badge Generator** - Generate security badges for wallets
- ✅ **🔔 Smart Alert Automation** - Automated alert rules and notifications
- ✅ **🏛️ DAO Treasury Manager** - Manage DAO treasury analysis and tracking
- ✅ **📅 Token Vesting Scheduler** - Schedule and track token vesting
- ✅ **📸 Token Snapshot Manager** - Take snapshots of token balances at specific times
- ✅ **🔍 Wallet Comparison Tool** - Compare multiple wallets side by side
- ✅ **💰 Transaction Fee Optimizer** - Optimize transaction fees across different networks
- ✅ **📈 Token Price Tracker** - Track token prices over time with alerts
- ✅ **📤 Wallet Activity Exporter** - Export wallet activity data in various formats
- ✅ **🌐 Multi-chain Portfolio Aggregator** - Aggregate portfolios across multiple chains
- ✅ **📊 Token Distribution Analyzer** - Analyze token distribution and holder patterns
- ✅ **🔗 Wallet Clustering Tool** - Cluster wallets by behavior patterns
- ✅ **🎮 Transaction Simulator** - Simulate transactions before executing them
- ✅ **📈 Gas Price History Tracker** - Track gas price history over time
- ✅ **💚 Wallet Health Score Calculator** - Calculate overall wallet health score
- ✅ **⚠️ Token Approval Risk Analyzer** - Analyze risks of token approvals
- ✅ **📝 Smart Contract Interaction History** - Track all smart contract interactions
- ✅ **⚖️ Portfolio Rebalancing Suggestions** - Suggest portfolio rebalancing strategies
- ✅ **🌾 Yield Farming Opportunity Finder** - Find yield farming opportunities
- ✅ **📊 Wallet Activity Patterns Analyzer** - Analyze wallet activity patterns
- ✅ **📦 Transaction Batch Optimizer** - Optimize batch transactions for gas efficiency
- ✅ **⭐ Wallet Reputation Builder** - Build reputation based on on-chain activity
- ✅ **🎯 Token Sniper Alert System** - Alert for new token launches and opportunities
- ✅ **🛡️ DeFi Protocol Risk Analyzer** - Analyze DeFi protocol risks
- ✅ **🖼️ NFT Collection Tracker** - Track NFT collections and their values
- ✅ **🌉 Cross-chain Asset Tracker** - Track assets across multiple chains
- ✅ **🔐 Wallet Recovery Assistant** - Help with wallet recovery processes
- ✅ **⚔️ Gas War Monitor** - Monitor gas wars and high competition transactions
- ✅ **🔔 Token Price Alert Manager** - Advanced token price alert management
- ✅ **🔥 Wallet Activity Heatmap Generator** - Generate visual heatmap of wallet activity
- ✅ **🔒 Smart Contract Security Scanner** - Deep security analysis of smart contracts
- ✅ **🔓 Token Unlock Tracker** - Track token vesting and unlock schedules
- ✅ **🗳️ Governance Proposal Tracker** - Track DAO governance proposals and voting
- ✅ **💧 Liquidity Pool Position Analyzer** - Analyze LP positions and impermanent loss
- ✅ **💰 Staking Rewards Calculator** - Calculate staking rewards and APY
- ✅ **✅ Wallet Backup Validator** - Validate wallet backups and recovery phrases

### Security & Recommendations

- ✅ **🛡️ Security Recommendations Engine** - Generate actionable security recommendations
- ✅ **📜 Approval History Tracker** - Track token approval changes over time
- ✅ **🔍 Token Metadata Cache** - Cache token metadata to reduce API calls
- ✅ **📈 Risk Trend Analysis** - Analyze risk score trends and predict future risk levels
- ✅ **🔐 Wallet Recovery Checker** - Check recovery phrase security and best practices
- ✅ **👁️ Token Allowance Monitor** - Real-time monitoring of token allowances
- ✅ **🔮 Risk Prediction Engine** - Predict future risks based on historical patterns
- ✅ **💰 Transaction Fee Optimizer** - Optimize transaction fees across chains
- ✅ **🔍 Security Audit** - Comprehensive security audit and compliance checking
- ✅ **🌐 Cross-chain Portfolio Aggregator** - Aggregate portfolio across multiple chains
- ✅ **🎯 Token Approval Simulator** - Simulate approval changes before executing
- ✅ **⚠️ Wallet Risk Calculator** - Calculate comprehensive risk scores
- ✅ **✅ Security Checklist Generator** - Generate comprehensive security checklists

### Advanced DeFi Features

- ✅ **💧 Liquidity Pool Analyzer** - Analyze LP positions and calculate impermanent loss
- ✅ **💰 Staking Tracker** - Track staking positions, rewards, and performance

## 📡 API Routes

### Scan Endpoints

- `POST /api/scan/approvals` - Fetch token approvals for a wallet
- `POST /api/scan/tokens` - Get wallet token balances and metadata
- `POST /api/scan/transactions` - Fetch recent transaction history
- `POST /api/scan/nfts` - Scan wallet NFTs and collections

### Risk Analysis

- `POST /api/risk/calculate` - Calculate comprehensive wallet health score
- `POST /api/risk/check-contract` - Verify contract safety and verification status
- `POST /api/risk/detect-spam` - Identify spam and phishing tokens
- `POST /api/risk/analyze-defi` - Analyze DeFi protocol exposure and risks

### Database Operations

- `POST /api/db/save-scan` - Store scan results for historical tracking
- `GET /api/db/scan-history` - Retrieve scan history with filtering
- `GET|POST /api/db/preferences` - Manage user preferences and settings

### Export & Reporting

- `POST /api/export/report` - Generate comprehensive security reports

### Alerts & Notifications

- `GET /api/alerts` - Get alerts for a wallet (with filtering options)
- `POST /api/alerts` - Create or acknowledge alerts

### Activity Timeline

- `POST /api/timeline` - Generate chronological activity timeline with risk annotations

### ENS Resolution

- `POST /api/ens/resolve` - Resolve ENS domains to addresses or reverse lookup

### Multi-Signature Analysis

- `POST /api/multisig/analyze` - Analyze multi-signature wallet configuration and security

### Wallet Comparison

- `POST /api/wallet/compare` - Compare two wallets side-by-side

### Token Price Tracking

- `GET /api/prices/track` - Get current token price, history, or predictions
- `POST /api/prices/track` - Calculate portfolio value, batch prices, manage alerts

### Portfolio Performance

- `POST /api/portfolio/performance` - Track portfolio performance metrics over time

### Contract Interactions

- `POST /api/contracts/interactions` - Track and analyze smart contract interactions

### Gas Optimization

- `POST /api/gas/optimize` - Get gas price optimization recommendations

### Token Unlocks

- `POST /api/tokens/unlocks` - Track token vesting schedules and unlock events

### Cross-Chain Bridges

- `POST /api/bridges/track` - Track cross-chain bridge transactions

### Staking

- `POST /api/staking/track` - Track staking positions and rewards

### MEV Protection

- `POST /api/mev/analyze` - Analyze transactions for MEV risks and protection

### Governance

- `POST /api/governance/track` - Track DAO governance participation and voting

### Watchlist

- `GET /api/watchlist` - Get, search, and manage watchlists
- `POST /api/watchlist` - Create, update watchlists and manage alerts

### Security Recommendations

- `POST /api/security/recommendations` - Generate personalized security recommendations

### Approval History

- `POST /api/approvals/history` - Track approval history and detect patterns

### Wallet Tagging

- `GET /api/wallet/tags` - Get, search, and manage wallet tags
- `POST /api/wallet/tags` - Create tags and assign to wallets

### Token Metadata

- `GET /api/tokens/metadata` - Get cached token metadata
- `POST /api/tokens/metadata` - Set, batch get, or manage token metadata cache

### Risk Trends

- `POST /api/risk/trend` - Analyze risk trends and predict future risks

### Token Distribution

- `POST /api/tokens/distribution` - Analyze token distribution and concentration

### Wallet Reputation

- `POST /api/wallet/reputation` - Calculate and compare wallet reputation scores

### Gas Price Prediction

- `POST /api/gas/predict` - Predict optimal gas prices based on historical data

### Governance

- `POST /api/governance/track` - Track DAO governance participation and voting

### Activity Heatmap

- `POST /api/activity/heatmap` - Generate activity heatmaps and statistics

### Analytics & Detection

- `POST /api/analytics/connection` - Track wallet connection sessions and get analytics
- `GET /api/analytics/connection` - Get connection analytics for a wallet
- `POST /api/analytics/patterns` - Detect unusual transaction patterns
- `POST /api/analytics/anomalies` - Detect anomalies in wallet activity
- `GET /api/analytics/anomalies` - Get behavior profile for a wallet

### Health Trends

- `POST /api/health/trends` - Add health snapshot or get trend analysis
- `GET /api/health/trends` - Get wallet health trend analysis

### Contract Risk Analysis

- `POST /api/contracts/risk` - Analyze contract risk or interaction risk
  - `action: analyze` - Analyze contract risk
  - `action: analyze_interaction` - Analyze specific contract interaction risk
  - `action: mark_vulnerable` - Mark contract as vulnerable
  - `action: mark_safe` - Mark contract as safe

### Activity Prediction

- `POST /api/analytics/predict` - Predict wallet activity patterns
  - `action: add_history` - Add activity history
  - `action: predict` - Get activity predictions
  - `action: get_history` - Get activity history

### Multi-Wallet Portfolio

- `POST /api/portfolio/multi-wallet` - Manage multi-wallet portfolios
  - `action: add_wallet` - Add wallet to portfolio
  - `action: remove_wallet` - Remove wallet from portfolio
  - `action: get_summary` - Get portfolio summary
  - `action: compare` - Compare multiple wallets
  - `action: create_group` - Create wallet group
  - `action: get_groups` - Get wallet groups
  - `action: export` - Export portfolio data
- `GET /api/portfolio/multi-wallet` - Get wallet(s) or portfolio summary

### Cost Optimization

- `POST /api/gas/optimize-cost` - Optimize transaction costs
  - `action: optimize` - Optimize single transaction cost
  - `action: optimize_batch` - Optimize batch transaction costs
  - `action: compare_chains` - Compare costs across chains
  - `action: add_gas_data` - Add gas price data point

### Security Score Tracking

- `POST /api/security/score-tracker` - Track security score history
  - `action: add_snapshot` - Add security score snapshot
  - `action: get_history` - Get security score history
  - `action: get_statistics` - Get score statistics
  - `action: export` - Export score history
- `GET /api/security/score-tracker` - Get security score history

### Token Approval Management

- `POST /api/approvals/manage` - Manage token approvals
  - `action: add_approvals` - Add or update approvals
  - `action: get_approvals` - Get approvals for wallet
  - `action: get_risky` - Get risky approvals
  - `action: generate_batch_revoke` - Generate batch revoke operations
  - `action: get_recommendations` - Get approval recommendations
  - `action: get_health_score` - Get approval health score
  - `action: get_statistics` - Get approval statistics
  - `action: remove_approval` - Remove specific approval

### Activity Timeline

- `POST /api/timeline/generate` - Generate activity timeline with risk annotations

### Risk Alerts

- `POST /api/alerts/risk` - Manage risk alerts
  - `action: create` - Create new alert
  - `action: get_alerts` - Get alerts for wallet
  - `action: acknowledge` - Acknowledge alert
  - `action: resolve` - Resolve alert
  - `action: bulk_acknowledge` - Bulk acknowledge alerts
  - `action: bulk_resolve` - Bulk resolve alerts
  - `action: get_summary` - Get alert summary
  - `action: create_rule` - Create alert rule
  - `action: evaluate_rules` - Evaluate rules and create alerts
- `GET /api/alerts/risk` - Get alerts with filtering options

### Portfolio Rebalancing

- `POST /api/portfolio/rebalance` - Portfolio rebalancing assistance
  - `action: generate_plan` - Generate rebalancing plan
  - `action: generate_target_allocation` - Generate target allocation based on risk profile

## 🎨 Dark Mode Theme

The app uses a custom dark theme by default with:

- Background: `#0a0a0a`
- Primary accent: `#10b981` (green for "healthy")
- Card surface: `#121212`
- Border: `#262626`

Theme variables are defined in `apps/wallet-health/app/globals.css`.

## 🔒 Security & Privacy

- ✅ **Non-custodial**: Read-only access via WalletConnect - your funds never leave your wallet
- ✅ **No private keys**: Never asks for or stores private keys or seed phrases
- ✅ **Open source**: All code is publicly auditable on GitHub
- ✅ **No tracking**: Privacy-first approach with no analytics or user tracking
- ✅ **Local processing**: Sensitive data processing happens client-side when possible
- ✅ **Encrypted storage**: All stored data is encrypted at rest
- ✅ **API security**: All API calls use HTTPS and proper authentication

## 🚧 Development

### Build for Production

```bash
# Build all apps
pnpm build

# Build wallet-health app only
cd apps/wallet-health
pnpm build
```

### Lint & Format

```bash
pnpm lint
```

### Commit Messages

This project uses conventional commit messages. A comprehensive list of 1400+ commit message templates is available in `wallet.txt` covering:

- Reown SDK integration and features
- WalletConnect v2 protocol updates
- AppKit (Web3Modal) component development
- Base L2 network enhancements
- Cross-platform integrations
- Performance optimizations
- Security improvements
- Testing and documentation

Example commit messages:
```bash
feat: integrate Reown SDK for wallet connections
fix: resolve WalletConnect connection timeout issues
feat: implement Base L2 network support
perf: optimize AppKit bundle size
```

### Automated Git Commit Script (`commit.sh`)

The project includes an advanced automated git commit script (`commit.sh`) that reads commit messages from `wallet.txt` and automatically commits and pushes changes to your repository.

#### Features

- ✅ **Automatic commits** - Reads messages from `wallet.txt` line by line
- ✅ **Configurable delay** - Set custom delay between commits
- ✅ **Dry-run mode** - Test without making actual commits
- ✅ **Progress tracking** - Shows progress percentage and statistics
- ✅ **Logging** - Optional file logging for audit trail
- ✅ **Statistics** - Tracks commits, pushes, errors, and timing
- ✅ **Branch selection** - Commit to specific branches
- ✅ **Skip empty commits** - Option to skip when no changes detected
- ✅ **Force push option** - Optional force push capability
- ✅ **Verbose mode** - Detailed output for debugging
- ✅ **Resume capability** - Automatically resumes from where it left off

#### Usage

```bash
# Basic usage (commits every 1 second)
./commit.sh

# Commit every 5 seconds
./commit.sh -d 5

# Dry-run mode (test without committing)
./commit.sh --dry-run

# Verbose mode with custom delay
./commit.sh -v -d 3

# Skip empty commits and use specific branch
./commit.sh -s -b main

# Custom message file and log file
./commit.sh -f my-messages.txt -l my-log.log

# Force push (use with caution)
./commit.sh --force-push
```

#### Command-Line Options

| Option | Description | Default |
|--------|-------------|---------|
| `-d, --delay SECONDS` | Delay between commits | 1 |
| `-f, --file FILE` | Path to commit messages file | wallet.txt |
| `-b, --branch BRANCH` | Git branch to commit to | current branch |
| `-l, --log FILE` | Log file path | commit.log |
| `-n, --dry-run` | Show what would be done without committing | false |
| `-v, --verbose` | Show detailed output | false |
| `-s, --skip-empty` | Skip commits when no changes detected | false |
| `--force-push` | Force push to remote | false |
| `--no-log` | Disable logging to file | false |
| `--no-stats` | Disable statistics tracking | false |
| `-h, --help` | Show help message | - |

#### Statistics

The script tracks and displays:
- Total commits made
- Successful pushes
- Messages skipped
- Error count
- Remaining messages
- Time elapsed
- Current branch

Statistics are saved to `commit-stats.json` and displayed on exit (Ctrl+C).

#### Logging

When enabled, all operations are logged to `commit.log` with timestamps:
```
[2024-01-15 10:30:45] [INFO] Script started with options: delay=1, dry-run=false
[2024-01-15 10:30:46] [SUCCESS] Commit successful
[2024-01-15 10:30:47] [SUCCESS] Push successful
```

#### Safety Features

- ✅ Validates git repository before starting
- ✅ Checks for remote repository configuration
- ✅ Handles errors gracefully without losing messages
- ✅ Preserves commit messages on failure for retry
- ✅ Shows statistics before exit
- ✅ Safe to interrupt with Ctrl+C

#### Examples

```bash
# Test run with verbose output
./commit.sh --dry-run -v

# Production run with 2-second delay and logging
./commit.sh -d 2 -v

# Commit to feature branch, skip empty commits
./commit.sh -b feature/new-feature -s

# Custom configuration
./commit.sh -d 5 -f custom-messages.txt -l custom.log -v --skip-empty
```

#### Requirements

- Bash shell (macOS/Linux)
- Git repository initialized
- `wallet.txt` file with commit messages (one per line)
- Write permissions for log and stats files

### Project Structure Guidelines

- Files should be 200-400 lines (max 500, never exceed 800-1000)
- Use NativeWind, not StyleSheet
- Individual file commits with descriptive messages
- README.md is the sole readme file (remove others)
- Follow conventional commit format (see `wallet.txt` for examples)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run tests for specific app
cd apps/wallet-health
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

## 📦 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy production
vercel --prod
```

### Docker

```bash
# Build Docker image
docker build -t wallet-health .

# Run container
docker run -p 3000:3000 wallet-health
```

### Environment Variables

Make sure to set the following environment variables in your deployment:

```bash
NEXT_PUBLIC_REOWN_PROJECT_ID=your_project_id
GOLDRUSH_API_KEY=your_api_key
MONGODB_URI=your_mongodb_uri
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Key Integrations

### Reown (WalletConnect)
- **SDK**: Latest Reown SDK for wallet connections
- **Features**: Session management, deep linking, push notifications
- **Documentation**: [Reown Docs](https://docs.reown.com/)
- **Cloud Console**: [cloud.reown.com](https://cloud.reown.com/)

### AppKit (Web3Modal)
- **Components**: Pre-built wallet connection UI components
- **Features**: Custom themes, wallet filtering, chain selection
- **Documentation**: [AppKit Docs](https://docs.reown.com/appkit/react/core/overview)
- **GitHub**: [@reown/appkit](https://github.com/reown/appkit)

### Base Network
- **L2 Solution**: Coinbase's Layer 2 blockchain
- **Features**: OP Stack, Superchain compatibility, low fees
- **Documentation**: [Base Docs](https://docs.base.org/)
- **Explorer**: [basescan.org](https://basescan.org/)

### GoldRush API (Covalent)
- **Data Provider**: Comprehensive blockchain data API
- **Features**: Multi-chain support, token balances, transactions
- **Documentation**: [GoldRush Docs](https://goldrush.dev/)
- **Dashboard**: [goldrush.dev](https://goldrush.dev/)

## 🙏 Acknowledgments

- [GoldRush (Covalent)](https://goldrush.dev/) for blockchain data API
- [Reown (WalletConnect)](https://reown.com/) for wallet connection infrastructure
- [AppKit](https://docs.reown.com/appkit) for beautiful wallet UI components
- [Base](https://base.org/) for L2 network support and optimization
- [Shadcn UI](https://ui.shadcn.com/) for beautiful components
- [Vercel](https://vercel.com/) for Next.js and deployment
- [Wagmi](https://wagmi.sh/) and [Viem](https://viem.sh/) for Web3 interactions

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/folajindayo/wallet-health/issues)
- **Twitter**: [@wallet_health](https://twitter.com/wallet_health)
- **Email**: support@wallet-health.app

## ✨ Features

### Core Security Features

- ✅ **🔍 Approval Scanner** - Comprehensive token approval analysis across all supported chains
- ✅ **🛡️ Risk Detection** - Multi-factor risk assessment with detailed scoring
- ✅ **🚨 Real-time Alerts** - Continuous monitoring with instant notifications for suspicious activity
- ✅ **📊 Security Score** - 0-100 health score with actionable recommendations

### Advanced Analytics

- ✅ **💼 DeFi Exposure Analyzer** - Track and analyze DeFi protocol positions and risks
- ✅ **🎨 NFT Security Scanner** - Detect suspicious NFTs, phishing attempts, and unverified collections
- ✅ **⛽ Gas Tracker** - Real-time gas price tracking with optimization recommendations
- ✅ **🔄 Transaction Simulator** - Preview transaction outcomes before execution
- ✅ **📈 Portfolio Analytics** - Comprehensive portfolio performance and risk analysis
- ✅ **🔗 Cross-chain Tracking** - Unified view across multiple blockchains
- ✅ **📊 Token Distribution Analyzer** - Analyze token distribution and concentration risks
- ✅ **⭐ Wallet Reputation System** - Comprehensive wallet reputation scoring
- ✅ **🔮 Gas Price Predictor** - Predict optimal gas prices with ML-based forecasting

### Monitoring & Alerts

- ✅ **👁️ Real-time Monitoring** - Continuous wallet activity tracking
- ✅ **🔔 Smart Alerts** - Configurable alerts for large transfers, new approvals, and suspicious contracts
- ✅ **📜 Activity Timeline** - Complete transaction history with risk annotations
- ✅ **📊 Historical Trends** - Track security score changes over time

### Utility Features

- ✅ **🔀 Wallet Comparison** - Compare multiple wallets side-by-side with similarity scoring
- ✅ **💾 Export Reports** - Export scan results as JSON, CSV, or PDF
- ✅ **🔐 Multi-sig Support** - Analyze multi-signature wallet configurations and security
- ✅ **🌐 ENS Integration** - Resolve ENS domains, reverse lookup, and verify ownership
- ✅ **📱 Responsive Design** - Works seamlessly on desktop and mobile devices
- ✅ **🔔 Alert System** - Configurable alerts with browser, email, push, and webhook notifications
- ✅ **📜 Activity Timeline** - Chronological timeline with risk annotations and grouping
- ✅ **📊 Advanced Analytics** - Portfolio optimization, risk modeling, and yield optimization
- ✅ **💰 Token Price Tracker** - Real-time token prices with portfolio value calculation
- ✅ **📈 Portfolio Performance** - Track performance metrics, returns, and Sharpe ratio
- ✅ **🔗 Contract Interactions** - Comprehensive smart contract interaction tracking
- ✅ **⛽ Gas Optimizer** - Optimal transaction timing based on gas price patterns
- ✅ **🔓 Token Unlock Tracker** - Track vesting schedules and upcoming unlocks
- ✅ **🌉 Cross-Chain Bridges** - Track and analyze cross-chain bridge transactions
- ✅ **💰 Staking Tracker** - Monitor staking positions, rewards, and performance
- ✅ **🛡️ MEV Protection** - Analyze and protect against MEV attacks
- ✅ **🗳️ Governance Tracker** - Track DAO participation and voting history
- ✅ **📊 Activity Heatmap** - Visualize wallet activity patterns over time
- ✅ **👀 Watchlist Manager** - Monitor multiple wallets with groups and alerts

## 💻 Usage Examples

### Real-time Wallet Monitoring

```typescript
import { WalletMonitor } from '@/lib/wallet-monitor';

const monitor = new WalletMonitor({
  walletAddress: '0x...',
  chainId: 1,
  checkInterval: 30000, // 30 seconds
  alertThresholds: {
    largeTransferThreshold: 10000, // USD
    newApprovalAlert: true,
    suspiciousContractAlert: true,
  },
});

monitor.start((alert) => {
  console.log('Alert:', alert);
  // Handle alert (show notification, log, etc.)
});
```

### Gas Price Tracking

```typescript
import { gasTracker } from '@/lib/gas-tracker';

// Get current gas prices
const prices = await gasTracker.getGasPrice(1); // Ethereum

// Estimate transaction cost
const estimate = await gasTracker.estimateGasCost(
  1,
  'swap',
  prices
);

// Get optimal gas price recommendation
const recommendation = gasTracker.getOptimalGasPrice(1, 'medium');
```

### NFT Security Scanning

```typescript
import { nftSecurityScanner } from '@/lib/nft-security-scanner';

// Scan a single NFT
const nftInfo = await nftSecurityScanner.scanNFT(
  '0x...', // contract address
  '123',   // token ID
  1        // chain ID
);

// Calculate portfolio risk
const portfolioRisk = nftSecurityScanner.calculatePortfolioRisk([nftInfo]);
```

### DeFi Exposure Analysis

```typescript
import { defiExposureAnalyzer } from '@/lib/defi-exposure-analyzer';

const exposure = await defiExposureAnalyzer.analyzeExposure(
  '0x...', // wallet address
  1,        // chain ID
  approvals,
  tokens
);

console.log(`Total DeFi Exposure: $${exposure.totalValueUSD}`);
console.log(`Concentration Risk: ${exposure.concentrationRisk}%`);
```

### Alert Management

```typescript
import { alertManager } from '@/lib/alert-manager';

// Subscribe to alerts
const unsubscribe = alertManager.onAlert('0x...', (alert) => {
  console.log('New alert:', alert);
});

// Create alert
await alertManager.createAlert({
  type: 'risk',
  severity: 'high',
  title: 'Unverified Contract Detected',
  message: 'Approval to unverified contract detected',
  walletAddress: '0x...',
  chainId: 1,
});

// Get alerts
const alerts = alertManager.getAlerts('0x...', {
  unacknowledgedOnly: true,
  severity: ['critical', 'high'],
});
```

### Activity Timeline

```typescript
import { activityTimeline } from '@/lib/activity-timeline';

const timeline = await activityTimeline.generateTimeline(
  transactions,
  approvals,
  {
    groupBy: 'day',
    includeRiskAnalysis: true,
    filterByRisk: ['critical', 'moderate'],
  }
);

console.log(`Total events: ${timeline.summary.totalEvents}`);
console.log(`Critical events: ${timeline.summary.riskDistribution.critical}`);
```

### ENS Resolution

```typescript
import { ensResolver } from '@/lib/ens-resolver';

// Resolve ENS to address
const resolution = await ensResolver.resolveENS('vitalik.eth');
console.log(`Address: ${resolution.address}`);

// Reverse lookup
const ensInfo = await ensResolver.resolveAddress('0x...');
console.log(`ENS Name: ${ensInfo.name}`);
console.log(`Verified: ${ensInfo.verified}`);
```

### Multi-Signature Analysis

```typescript
import { multisigAnalyzer } from '@/lib/multisig-analyzer';

const analysis = await multisigAnalyzer.analyzeMultisig({
  address: '0x...',
  chainId: 1,
  type: 'gnosis_safe',
  threshold: 3,
  owners: ['0x...', '0x...', '0x...'],
  totalOwners: 3,
});

console.log(`Security Score: ${analysis.securityScore}`);
console.log(`Risk Level: ${analysis.riskLevel}`);
console.log('Recommendations:', analysis.recommendations);
```

### Wallet Comparison

```typescript
import { compareWallets } from '@/lib/wallet-monitor';

const comparison = compareWallets(
  { address: '0x...', approvals: [...], tokens: [...] },
  { address: '0x...', approvals: [...], tokens: [...] }
);

console.log(`Common approvals: ${comparison.commonApprovals.length}`);
console.log(`Unique to wallet 1: ${comparison.uniqueApprovals1.length}`);
```

### Transaction Simulation

```typescript
import { transactionSimulator } from '@/lib/transaction-simulator';

const simulation = await transactionSimulator.simulateTransaction({
  from: '0x...',
  to: '0x...',
  value: '1000000000000000000', // 1 ETH
  chainId: 1,
});

if (!simulation.success) {
  console.error('Transaction will fail:', simulation.errors);
} else {
  console.log(`Gas cost: ${simulation.gasCostUSD} USD`);
  console.log('Warnings:', simulation.warnings);
}
```

### Portfolio Performance Tracking

```typescript
import { portfolioPerformanceTracker } from '@/lib/portfolio-performance-tracker';

// Add portfolio snapshot
portfolioPerformanceTracker.addSnapshot({
  timestamp: Date.now(),
  totalValueUSD: 10000,
  tokenBreakdown: [...],
  chainBreakdown: [...],
});

// Calculate performance metrics
const metrics = portfolioPerformanceTracker.calculateMetrics();
console.log(`Total Return: ${metrics?.totalReturnPercent}%`);
console.log(`Best Performer: ${metrics?.bestPerformer.symbol}`);
```

### Contract Interaction Tracking

```typescript
import { contractInteractionTracker } from '@/lib/contract-interaction-tracker';

// Add interaction
contractInteractionTracker.addInteraction({
  hash: '0x...',
  timestamp: Date.now(),
  from: '0x...',
  to: '0x...',
  contractAddress: '0x...',
  method: 'transfer',
  value: '1000000000000000000',
  gasUsed: 21000,
  gasPrice: 30e9,
  status: 'success',
  chainId: 1,
  blockNumber: 12345678,
});

// Get contract statistics
const stats = contractInteractionTracker.getContractStats('0x...');
console.log(`Total Interactions: ${stats?.totalInteractions}`);
console.log(`Risk Score: ${stats?.riskScore}`);
```

### Price Alerts

```typescript
import { priceAlertManager } from '@/lib/price-alert-manager';

// Create price alert
const alert = priceAlertManager.createAlert(
  '0x...', // token address
  'ETH',
  1, // chain ID
  'above', // condition
  2000 // target price in USD
);

// Update price and check alerts
const triggers = await priceAlertManager.updatePrice('0x...', 1, 2100);
triggers.forEach(trigger => {
  console.log(`Alert triggered: ${trigger.tokenSymbol} reached ${trigger.actualPrice}`);
});
```

### Activity Heatmap

```typescript
import { activityHeatmapGenerator } from '@/lib/activity-heatmap-generator';

const activities = [
  { timestamp: Date.now(), type: 'transfer', value: 100, chainId: 1 },
  // ... more activities
];

// Generate heatmap data
const heatmap = activityHeatmapGenerator.generateHeatmap(activities, 7); // 7 days

// Generate statistics
const stats = activityHeatmapGenerator.generateStats(activities);
console.log(`Busiest Day: ${stats.busiestDay}`);
console.log(`Busiest Hour: ${stats.busiestHour}`);
```

### Risk Trend Analysis

```typescript
import { riskTrendAnalyzer } from '@/lib/risk-trend-analyzer';

// Add risk snapshot
riskTrendAnalyzer.addSnapshot({
  timestamp: Date.now(),
  score: 85,
  riskLevel: 'safe',
  factors: [...],
});

// Analyze trend
const trend = riskTrendAnalyzer.analyzeTrend();
console.log(`Trend: ${trend?.trend}`);
console.log(`Predicted Score: ${trend?.prediction?.nextScore}`);
```

### Approval Optimization

```typescript
import { approvalOptimizer } from '@/lib/approval-optimizer';

const analysis = approvalOptimizer.analyzeApprovals(approvals, usagePatterns);

console.log(`Unlimited Approvals: ${analysis.unlimitedApprovals}`);
console.log(`Recommendations: ${analysis.recommendations.length}`);

// Get approval health score
const healthScore = approvalOptimizer.getApprovalHealthScore(analysis);
console.log(`Approval Health Score: ${healthScore}`);
```

### Cross-chain Bridge Tracking

```typescript
import { crossChainBridgeTracker } from '@/lib/cross-chain-bridge-tracker';

// Add bridge transaction
crossChainBridgeTracker.addBridge({
  hash: '0x...',
  timestamp: Date.now(),
  fromChain: 1,
  toChain: 8453,
  fromAddress: '0x...',
  toAddress: '0x...',
  tokenAddress: '0x...',
  tokenSymbol: 'ETH',
  amount: '1000000000000000000',
  bridgeProtocol: 'Base Bridge',
  status: 'pending',
});

// Get bridge statistics
const stats = crossChainBridgeTracker.getStats();
console.log(`Total Bridges: ${stats.totalBridges}`);
console.log(`Success Rate: ${stats.successRate}%`);
```

### Approval Revoker

```typescript
import { approvalRevoker } from '@/lib/approval-revoker';

// Generate revoke transaction
const revokeTx = approvalRevoker.generateRevokeTransaction({
  tokenAddress: '0x...',
  spenderAddress: '0x...',
  chainId: 1,
  walletAddress: '0x...',
});

// Get revoke recommendations
const recommendations = approvalRevoker.getRevokeRecommendations(approvals);
console.log(`Critical: ${recommendations.critical.length}`);
console.log(`High: ${recommendations.high.length}`);

// Estimate gas cost
const gasEstimate = approvalRevoker.estimateGasCost(approvals, '30');
console.log(`Total Cost: ${gasEstimate.totalCostETH} ETH`);
```

### Wallet Backup & Export

```typescript
import { walletBackup } from '@/lib/wallet-backup';

// Create backup
const backup = walletBackup.createBackup(
  '0x...',
  1,
  scanResults,
  { alerts: true, monitoring: true, theme: 'dark' }
);

// Export as JSON
walletBackup.exportAsJSON(backup);

// Export as encrypted
await walletBackup.exportAsEncrypted(backup, 'your-password');

// Import encrypted backup
const imported = await walletBackup.importEncrypted(encryptedData, 'your-password');
```

### Watchlist Manager

```typescript
import { watchlistManager } from '@/lib/watchlist-manager';

// Add wallet to watchlist
watchlistManager.addWallet({
  address: '0x...',
  label: 'My Main Wallet',
  tags: ['personal', 'defi'],
  chainId: 1,
  alertsEnabled: true,
});

// Create watchlist group
const group = watchlistManager.createGroup({
  name: 'DeFi Wallets',
  wallets: ['0x...', '0x...'],
  color: '#10b981',
});

// Create watchlist
const watchlist = watchlistManager.createWatchlist({
  name: 'My DeFi Wallets',
  wallets: ['0x...', '0x...'],
  tags: ['defi', 'active'],
  alertsEnabled: true,
});

// Add alert
watchlistManager.addAlert(watchlist.id, {
  watchlistId: watchlist.id,
  walletAddress: '0x...',
  type: 'score_change',
  severity: 'medium',
  message: 'Wallet health score dropped',
});

// Get statistics
const stats = watchlistManager.getWatchlistStats(watchlist.id);
console.log(`Total wallets: ${stats?.totalWallets}`);
```

### MEV Protection Analysis

```typescript
import { mevProtectionAnalyzer } from '@/lib/mev-protection-analyzer';

// Analyze transaction for MEV risks
const analysis = mevProtectionAnalyzer.analyzeTransaction({
  hash: '0x...',
  timestamp: Date.now(),
  from: '0x...',
  to: '0x...',
  type: 'swap',
  chainId: 1,
});

console.log(`Protection Score: ${analysis.protectionScore}`);
console.log(`Protection Level: ${analysis.protectionLevel}`);

// Get protection strategies
const strategies = mevProtectionAnalyzer.getProtectionStrategies(1);
console.log(`Available strategies: ${strategies.length}`);

// Get recommendation
const recommendation = mevProtectionAnalyzer.recommendProtection(1, 'swap', 5000);
console.log(`Recommended: ${recommendation?.name}`);
```

### Governance Tracking

```typescript
import { governanceTracker } from '@/lib/governance-tracker';

// Add proposal
governanceTracker.addProposal('0x...', {
  id: 'prop-1',
  dao: '0x...',
  daoName: 'Uniswap DAO',
  chainId: 1,
  title: 'Proposal Title',
  status: 'active',
  startTime: Date.now(),
  endTime: Date.now() + 7 * 24 * 60 * 60 * 1000,
  votesFor: '0',
  votesAgainst: '0',
});

// Record vote
governanceTracker.recordVote('0x...', {
  proposalId: 'prop-1',
  voter: '0x...',
  timestamp: Date.now(),
  support: true,
  votingPower: '1000000000000000000',
  transactionHash: '0x...',
});

// Get summary
const summary = governanceTracker.getSummary('0x...');
console.log(`Participation Rate: ${summary.participationRate}%`);

// Get active proposals
const active = governanceTracker.getActiveProposals('0x...');
console.log(`Active proposals: ${active.length}`);
```

### Activity Heatmap

```typescript
import { activityHeatmapGenerator } from '@/lib/activity-heatmap-generator';

const activities = [
  { timestamp: Date.now(), type: 'transfer', chainId: 1 },
  // ... more activities
];

// Generate heatmap
const heatmap = activityHeatmapGenerator.generateHeatmap(activities, 30);
console.log(`Busiest day: ${heatmap.summary.busiestDay}`);
console.log(`Busiest hour: ${heatmap.summary.busiestHour}`);

// Generate statistics
const stats = activityHeatmapGenerator.generateStats(activities);
console.log(`Peak activity: ${stats.peakActivity.count}`);
```

### Token Metadata Cache

```typescript
import { tokenMetadataCache } from '@/lib/token-metadata-cache';

// Set token metadata
tokenMetadataCache.set({
  address: '0x...',
  chainId: 1,
  symbol: 'USDC',
  name: 'USD Coin',
  decimals: 6,
  logoURI: 'https://...',
  priceUSD: 1.0,
});

// Get cached metadata
const metadata = tokenMetadataCache.get('0x...', 1);
if (metadata) {
  console.log(`Token: ${metadata.symbol} - $${metadata.priceUSD}`);
}

// Search tokens
const results = tokenMetadataCache.search('USDC');
```

### Transaction Batch Analyzer

```typescript
import { transactionBatchAnalyzer } from '@/lib/transaction-batch-analyzer';

// Analyze batch of transactions
const analysis = transactionBatchAnalyzer.analyzeBatch(transactions);

console.log(`Total: ${analysis.summary.total}`);
console.log(`Successful: ${analysis.summary.successful}`);
console.log(`Risks: ${analysis.risks.length}`);

// Get patterns
console.log(`Most Active Hour: ${analysis.patterns.timePatterns.mostActiveHour}`);
console.log(`Frequent Recipients: ${analysis.patterns.frequentRecipients.length}`);
```

### Token Snapshots

```typescript
import { tokenSnapshotManager } from '@/lib/token-snapshot-manager';

// Create snapshot
tokenSnapshotManager.createSnapshot({
  timestamp: Date.now(),
  walletAddress: '0x...',
  chainId: 1,
  tokens: [/* ... */],
  totalValueUSD: 10000,
});

// Get latest snapshot
const latest = tokenSnapshotManager.getLatestSnapshot('0x...', 1);

// Compare snapshots
const comparison = tokenSnapshotManager.compareSnapshots(snapshot1, snapshot2);
console.log(`New tokens: ${comparison.differences.newTokens.length}`);

// Calculate growth
const growth = tokenSnapshotManager.calculateGrowth('0x...', 1, '30d');
console.log(`Growth: ${growth?.growthPercentage}%`);
```

### Advanced Wallet Comparison

```typescript
import { walletComparisonTool } from '@/lib/wallet-comparison-tool';

// Compare two wallets
const comparison = walletComparisonTool.compareWallets(wallet1, wallet2);
console.log(`Similarity: ${comparison.comparison.overallSimilarity}%`);
console.log(`Common approvals: ${comparison.comparison.commonApprovals.length}`);

// Compare multiple wallets
const multiComparison = walletComparisonTool.compareMultipleWallets([wallet1, wallet2, wallet3]);
console.log(`Average score: ${multiComparison.statistics.averageScore}`);
console.log(`Best wallet: ${multiComparison.rankings[0].address}`);
```

### Transaction Fee Optimization

```typescript
import { transactionFeeOptimizer } from '@/lib/transaction-fee-optimizer';

// Optimize fee
const optimization = transactionFeeOptimizer.optimizeFee(1, 21000, 'low');
console.log(`Savings: ${optimization.savings.savingsPercentage}%`);

// Compare across chains
const comparison = transactionFeeOptimizer.compareCrossChainFees('swap', 150000);
console.log(`Best chain: ${comparison.bestOption.chainName}`);

// Estimate batch savings
const batchSavings = transactionFeeOptimizer.estimateBatchSavings(1, 5, 46000);
console.log(`Batch savings: ${batchSavings.savingsPercentage}%`);

// Get recommendation
const recommendation = transactionFeeOptimizer.recommendOptimalChain('transfer', 'medium', 5000);
console.log(`Recommended: ${recommendation.chainName}`);
```

### Activity Export

```typescript
import { walletActivityExporter } from '@/lib/wallet-activity-exporter';

// Export as JSON
const jsonExport = await walletActivityExporter.exportWalletData('0x...', data, {
  format: 'json',
  includeApprovals: true,
  includeTokens: true,
  includeTransactions: true,
});

// Export as CSV
const csvExport = await walletActivityExporter.exportWalletData('0x...', data, {
  format: 'csv',
  includeApprovals: true,
  dateRange: { start: Date.now() - 30 * 24 * 60 * 60 * 1000, end: Date.now() },
});

// Generate summary
const summary = walletActivityExporter.generateSummary(data, options);
console.log(`Total items: ${summary.totalItems}`);
```

### Multi-Chain Portfolio Aggregation

```typescript
import { multiChainPortfolioAggregator } from '@/lib/multi-chain-portfolio-aggregator';

// Aggregate portfolio
const aggregated = multiChainPortfolioAggregator.aggregatePortfolio('0x...', chainPortfolios);
console.log(`Total value: $${aggregated.totalValueUSD}`);
console.log(`Top chain: ${aggregated.summary.topChains[0].chainName}`);

// Calculate cross-chain token totals
const tokenTotals = multiChainPortfolioAggregator.calculateCrossChainTokenTotals(chainPortfolios);
console.log(`USDC total: ${tokenTotals.get('0x...')?.totalBalance}`);

// Get recommendations
const recommendations = multiChainPortfolioAggregator.getChainAllocationRecommendations(aggregated);
recommendations.forEach(rec => {
  console.log(`${rec.chainName}: ${rec.reason}`);
});
```

### Token Distribution Analysis

```typescript
import { tokenDistributionAnalyzer } from '@/lib/token-distribution-analyzer';

// Analyze distribution
const distribution = tokenDistributionAnalyzer.analyzeDistribution(
  '0x...',
  'TOKEN',
  '1000000000000000000000',
  holders
);

console.log(`Gini Coefficient: ${distribution.statistics.giniCoefficient}`);
console.log(`Top 10%: ${distribution.statistics.top10Percentage}%`);
console.log(`Risk: ${distribution.riskAssessment.concentrationRisk}`);

// Compare distributions
const comparison = tokenDistributionAnalyzer.compareDistributions(dist1, dist2);
console.log(`More decentralized: ${comparison.comparison.moreDecentralized}`);

// Get health score
const healthScore = tokenDistributionAnalyzer.getDistributionHealthScore(distribution);
console.log(`Health Score: ${healthScore}/100`);
```

### Wallet Reputation System

```typescript
import { walletReputationSystem } from '@/lib/wallet-reputation-system';

// Calculate reputation
const score = walletReputationSystem.calculateScore('0x...', {
  age: 365,
  totalTransactions: 500,
  verifiedContracts: 10,
  unverifiedContracts: 2,
  hasENS: true,
  chains: [1, 8453, 137],
});

console.log(`Overall Score: ${score.overallScore}/1000`);
console.log(`Badges: ${score.badges.join(', ')}`);

// Get history
const history = walletReputationSystem.getHistory('0x...');
console.log(`Trend: ${history?.trend}`);

// Compare wallets
const comparison = walletReputationSystem.compareWallets('0x...', '0x...');
console.log(`Better wallet: ${comparison?.comparison.betterWallet}`);

// Get top wallets
const top = walletReputationSystem.getTopWallets(10);
console.log(`Top wallet: ${top[0].walletAddress}`);
```

### Gas Price Prediction

```typescript
import { gasPricePredictor } from '@/lib/gas-price-predictor';

// Add data point
gasPricePredictor.addDataPoint(1, {
  low: 20,
  standard: 30,
  fast: 40,
  instant: 50,
});

// Predict prices
const prediction = gasPricePredictor.predict(1, 'medium', '1h');
console.log(`Recommended: ${prediction?.recommendedPrice} gwei`);
console.log(`Trend: ${prediction?.trend}`);

// Get optimal price
const optimal = gasPricePredictor.getOptimalPrice(1, 'low', 15);
console.log(`Savings: ${optimal?.savingsPercentage}%`);
console.log(`Wait time: ${optimal?.estimatedWait}`);
```

### Wallet Tagging

```typescript
import { walletTagging } from '@/lib/wallet-tagging';

// Create tag
const tag = walletTagging.createTag({
  name: 'High Risk',
  color: '#ef4444',
  description: 'Wallets with high risk scores',
});

// Tag wallet
walletTagging.tagWallet('0x...', [tag.id], 'Needs review', 'critical');

// Get wallets by tag
const taggedWallets = walletTagging.getWalletsByTag(tag.id);

// Get tag statistics
const stats = walletTagging.getTagStats();
console.log(`Total Tags: ${stats.totalTags}`);
```

### Security Recommendations

```typescript
import { securityRecommendationsEngine } from '@/lib/security-recommendations';

// Generate recommendations
const recommendations = securityRecommendationsEngine.generateRecommendations({
  approvals,
  tokens,
  contracts,
  riskScore: 65,
  alerts,
});

// Get critical recommendations
const critical = securityRecommendationsEngine.getRecommendationsBySeverity(
  'critical',
  context
);

critical.forEach(rec => {
  console.log(`${rec.title}: ${rec.action}`);
});
```

### Approval History Tracker

```typescript
import { approvalHistoryTracker } from '@/lib/approval-history-tracker';

// Add history entry
approvalHistoryTracker.addHistoryEntry({
  tokenAddress: '0x...',
  tokenSymbol: 'USDC',
  spenderAddress: '0x...',
  action: 'granted',
  newAllowance: '1000000000',
  chainId: 1,
});

// Get approval trends
const trends = approvalHistoryTracker.getApprovalTrends();
trends.forEach(trend => {
  console.log(`${trend.tokenSymbol}: ${trend.trend}`);
});

// Get statistics
const stats = approvalHistoryTracker.getStatistics();
console.log(`Total Grants: ${stats.grants}`);
console.log(`Average Lifetime: ${stats.averageLifetime} days`);
```

### Address Book

```typescript
import { addressBook } from '@/lib/address-book';

// Add address
addressBook.addAddress({
  address: '0x...',
  label: 'Uniswap Router',
  notes: 'Main DEX router',
  tags: ['defi', 'dex'],
  chainId: 1,
  isVerified: true,
  verificationSource: 'contract',
});

// Record usage
addressBook.recordUsage('0x...');

// Get frequently used addresses
const frequent = addressBook.getFrequentlyUsed(10);
frequent.forEach(addr => {
  console.log(`${addr.label}: ${addr.useCount} uses`);
});
```

### Gas Optimization Calculator

```typescript
import { gasOptimizationCalculator } from '@/lib/gas-optimization-calculator';

// Calculate gas estimate
const estimate = gasOptimizationCalculator.calculateGasEstimate(
  21000, // gas limit
  gasPriceData,
  'standard',
  2000 // ETH price USD
);

console.log(`Cost: ${estimate.costETH} ETH ($${estimate.costUSD})`);

// Get optimization recommendation
const recommendation = gasOptimizationCalculator.getOptimizationRecommendation(
  50, // current gas price (gwei)
  gasPriceData,
  'medium'
);

console.log(`Recommended: ${recommendation.recommendedGasPrice} gwei`);
console.log(`Savings: ${recommendation.savings.percentage}%`);
```

### Wallet Health Report Generator

```typescript
import { walletHealthReportGenerator } from '@/lib/wallet-health-report';

// Generate report
const report = walletHealthReportGenerator.generateReport(scanResults, {
  includeTrends: true,
  includeDetailedAnalysis: true,
});

console.log(`Overall Score: ${report.summary.overallScore}/100`);
console.log(`Risk Level: ${report.summary.riskLevel}`);

// Export as markdown
const markdown = walletHealthReportGenerator.exportAsMarkdown(report);

// Export as JSON
const json = walletHealthReportGenerator.exportAsJSON(report);
```

### Wallet Recovery Checker

```typescript
import { walletRecoveryChecker } from '@/lib/wallet-recovery-checker';

// Check recovery phrase strength (without storing actual phrase)
const check = walletRecoveryChecker.checkRecoveryPhrase(recoveryWords);

console.log(`Strength: ${check.strength}`);
console.log(`Score: ${check.score}/100`);
check.issues.forEach(issue => {
  console.log(`${issue.severity}: ${issue.description}`);
});

// Check best practices
const practices = walletRecoveryChecker.checkBestPractices({
  hasBackup: true,
  isOffline: true,
  multipleBackups: true,
});

console.log(`Best Practices Score: ${practices.score}/100`);
```

### Token Allowance Monitor

```typescript
import { tokenAllowanceMonitor } from '@/lib/token-allowance-monitor';

// Create snapshot
const snapshots = tokenAllowanceMonitor.createSnapshot(allowances);

// Get change history
const changes = tokenAllowanceMonitor.getChangeHistory('0x...', undefined, 10);
changes.forEach(change => {
  console.log(`${change.changeType}: ${change.tokenSymbol}`);
});

// Start monitoring
const monitorId = tokenAllowanceMonitor.startMonitoring({
  walletAddress: '0x...',
  chainId: 1,
  checkInterval: 60000, // 1 minute
  alertOnChange: true,
}, (change) => {
  console.log('Allowance changed:', change);
});
```

### Wallet Activity Analyzer

```typescript
import { walletActivityAnalyzer } from '@/lib/wallet-activity-analyzer';

// Analyze activity
const analysis = walletActivityAnalyzer.analyzeActivity(
  '0x...',
  transactions,
  30 // last 30 days
);

console.log(`Total Transactions: ${analysis.summary.totalTransactions}`);
console.log(`Most Active Hour: ${analysis.summary.mostActiveHour}`);
console.log(`Is DeFi User: ${analysis.behaviors.isDeFiUser}`);

// Compare two wallets
const comparison = walletActivityAnalyzer.compareActivity(analysis1, analysis2);
console.log(`Similarity: ${comparison.similarity}%`);
```

### Risk Prediction Engine

```typescript
import { riskPredictionEngine } from '@/lib/risk-prediction-engine';

// Predict risks
const predictions = riskPredictionEngine.predictRisks({
  currentRiskScore: 65,
  riskHistory: [...],
  approvalCount: 15,
  riskyApprovals: 3,
  recentTransactions: 50,
  failedTransactions: 5,
  newContracts: 2,
  spamTokens: 1,
});

predictions.forEach(prediction => {
  console.log(`${prediction.severity}: ${prediction.description}`);
  console.log(`Probability: ${prediction.probability}%`);
});

// Get summary
const summary = riskPredictionEngine.getPredictionSummary(predictions);
console.log(`Critical Predictions: ${summary.critical}`);
```

### Wallet Clustering

```typescript
import { walletClustering } from '@/lib/wallet-clustering';

// Analyze wallets and create clusters
const analysis = walletClustering.analyzeWallets(wallets);

console.log(`Total Clusters: ${analysis.statistics.totalClusters}`);
analysis.clusters.forEach(cluster => {
  console.log(`${cluster.name}: ${cluster.wallets.length} wallets`);
});

// Create manual cluster
const cluster = walletClustering.createManualCluster(
  'My Wallets',
  ['0x...', '0x...', '0x...']
);

// Get relationships
analysis.relationships.forEach(rel => {
  console.log(`${rel.wallet1} <-> ${rel.wallet2}: ${rel.relationshipType}`);
});
```

### Transaction Fee Optimizer

```typescript
import { transactionFeeOptimizer } from '@/lib/transaction-fee-optimizer';

// Optimize fee for a transaction
const optimization = transactionFeeOptimizer.optimizeFee(
  1, // Ethereum
  21000, // gas limit
  50, // current gas price (gwei)
  { slow: 20, standard: 30, fast: 40 },
  'medium'
);

console.log(`Savings: ${optimization.savings} ETH (${optimization.savingsPercentage}%)`);

// Compare fees across chains
const comparison = transactionFeeOptimizer.compareFeesAcrossChains(
  21000,
  gasPriceDataMap
);

console.log(`Cheapest: ${comparison.chains[0].chainName}`);
```

### Wallet Security Audit

```typescript
import { walletSecurityAudit } from '@/lib/wallet-security-audit';

// Perform comprehensive audit
const audit = walletSecurityAudit.performAudit('0x...', {
  approvals,
  tokens,
  contracts,
  transactions,
  practices: {
    hasBackup: true,
    usesHardwareWallet: false,
  },
});

console.log(`Overall Score: ${audit.overallScore}/100`);
console.log(`Risk Level: ${audit.riskLevel}`);
console.log(`Critical Issues: ${audit.criticalIssues.length}`);

// Get compliance results
audit.compliance.forEach(compliance => {
  console.log(`${compliance.standard}: ${compliance.passed ? 'PASS' : 'FAIL'}`);
});
```

### Cross-chain Portfolio Aggregator

```typescript
import { crossChainPortfolioAggregator } from '@/lib/cross-chain-portfolio-aggregator';

// Aggregate portfolio across chains
const portfolio = crossChainPortfolioAggregator.aggregatePortfolio(
  '0x...',
  chainPortfolios
);

console.log(`Total Value: $${portfolio.totalValueUSD}`);
console.log(`Chains: ${portfolio.summary.chainsWithAssets}`);
console.log(`Diversification: ${portfolio.summary.diversification}%`);

// Get top tokens
const topTokens = crossChainPortfolioAggregator.getTopTokens(portfolio, 10);
topTokens.forEach(token => {
  console.log(`${token.symbol}: $${token.valueUSD}`);
});

// Calculate portfolio health
const health = crossChainPortfolioAggregator.calculatePortfolioHealth(portfolio);
console.log(`Portfolio Health Score: ${health.score}/100`);
```

### Wallet Health Score Calculator

```typescript
import { walletHealthScoreCalculator } from '@/lib/wallet-health-score-calculator';

// Calculate comprehensive health score
const healthScore = walletHealthScoreCalculator.calculateHealthScore({
  approvals,
  tokens,
  contracts,
  transactions,
  practices: {
    hasBackup: true,
    usesHardwareWallet: false,
  },
  previousScore: 75,
});

console.log(`Overall Score: ${healthScore.overallScore}/100`);
console.log(`Risk Level: ${healthScore.riskLevel}`);

// View breakdown
healthScore.breakdown.forEach(category => {
  console.log(`${category.category}: ${category.score} (contribution: ${category.contribution})`);
});

// Calculate potential improvement
const improvement = walletHealthScoreCalculator.calculatePotentialImprovement(
  healthScore.overallScore,
  healthScore.recommendations
);
console.log(`Potential Score: ${improvement.potentialScore} (+${improvement.improvement})`);
```

### Enhanced Transaction Simulator

```typescript
import { transactionSimulatorEnhanced } from '@/lib/transaction-simulator-enhanced';

// Simulate transaction
const simulation = await transactionSimulatorEnhanced.simulateTransaction({
  from: '0x...',
  to: '0x...',
  value: '1000000000000000000', // 1 ETH
  chainId: 1,
  gasPrice: 30,
  ethPriceUSD: 2000,
});

console.log(`Success: ${simulation.success}`);
console.log(`Gas Cost: ${simulation.gasCost} ETH ($${simulation.gasCostUSD})`);
console.log(`Risk Level: ${simulation.riskAssessment.riskLevel}`);

// View state changes
simulation.stateChanges.forEach(change => {
  console.log(`${change.type}: ${change.description}`);
});

// View warnings
simulation.warnings.forEach(warning => {
  console.log(`${warning.severity}: ${warning.message}`);
});
```

### Wallet Backup Validator

```typescript
import { walletBackupValidator } from '@/lib/wallet-backup-validator';

// Validate backup
const validation = walletBackupValidator.validateBackup(backupData);

console.log(`Valid: ${validation.valid}`);
console.log(`Score: ${validation.score}/100`);

// Check integrity
console.log(`Integrity: ${validation.integrity.checksumValid}`);
console.log(`Security: ${validation.security.isEncrypted}`);

// View issues
validation.issues.forEach(issue => {
  console.log(`${issue.severity}: ${issue.message}`);
});

// Verify restore capability
const restoreCheck = walletBackupValidator.verifyRestoreCapability(backupData);
console.log(`Can Restore: ${restoreCheck.canRestore}`);
```

### DCA Automation

```typescript
import { dcaAutomation } from '@/lib/dca-automation';

// Create DCA strategy
const strategy = dcaAutomation.createStrategy({
  name: 'ETH DCA',
  tokenIn: '0x...', // USDC
  tokenOut: '0x...', // ETH
  tokenInSymbol: 'USDC',
  tokenOutSymbol: 'ETH',
  amountPerPeriod: 100, // $100 per period
  frequency: 'weekly',
  startDate: Date.now(),
  chainId: 1,
  isActive: true,
});

// Get statistics
const stats = dcaAutomation.getStats();
console.log(`Total Invested: $${stats.totalInvested}`);
console.log(`Average ROI: ${stats.averageROI}%`);
```

### Limit Order Management

```typescript
import { limitOrderManager } from '@/lib/limit-order-manager';

// Create limit order
const order = limitOrderManager.createOrder({
  tokenIn: '0x...',
  tokenInSymbol: 'USDC',
  tokenOut: '0x...',
  tokenOutSymbol: 'ETH',
  amountIn: '1000000000', // 1000 USDC
  limitPrice: 2000, // Buy ETH at $2000 or lower
  chainId: 1,
  protocol: 'Uniswap V3',
});

// Check orders
const pending = limitOrderManager.getPendingOrders();
console.log(`Pending Orders: ${pending.length}`);
```

### Recurring Payments

```typescript
import { recurringPaymentsManager } from '@/lib/recurring-payments-manager';

// Create recurring payment
const payment = recurringPaymentsManager.createPayment({
  name: 'Monthly Subscription',
  from: '0x...',
  to: '0x...',
  token: '0x...',
  tokenSymbol: 'USDC',
  amount: '100000000', // 100 USDC
  frequency: 'monthly',
  startDate: Date.now(),
  chainId: 1,
  isActive: true,
});

// Get upcoming payments
const upcoming = recurringPaymentsManager.getUpcomingPayments(30);
console.log(`Upcoming Payments: ${upcoming.length}`);
```

### Token Swap Aggregation

```typescript
import { tokenSwapAggregator } from '@/lib/token-swap-aggregator';

// Get swap quote
const quote = await tokenSwapAggregator.getQuote(
  '0x...', // USDC
  '0x...', // ETH
  '1000000000', // 1000 USDC
  1
);

console.log(`Best Route: ${quote.bestRoute?.protocol}`);
console.log(`Amount Out: ${quote.bestRoute?.amountOut}`);
```

### Carbon Footprint Tracking

```typescript
import { carbonFootprintTracker } from '@/lib/carbon-footprint-tracker';

// Calculate emission
const emission = carbonFootprintTracker.calculateEmission(1, 21000, 'transfer');

// Calculate footprint
const footprint = carbonFootprintTracker.calculateFootprint('0x...');
console.log(`Total Emissions: ${footprint.totalEmissions} kg CO2`);
console.log(`Offset Needed: $${footprint.offsetNeeded}`);
```

### Social Recovery Management

```typescript
import { socialRecoveryManager } from '@/lib/social-recovery-manager';

// Add social recovery wallet
socialRecoveryManager.addWallet({
  address: '0x...',
  chainId: 1,
  guardians: [
    { address: '0x...', addedAt: Date.now(), isActive: true, type: 'wallet', verified: true },
  ],
  threshold: 2,
  recoveryDelay: 86400 * 7, // 7 days
  isActive: true,
});

// Create recovery request
const request = socialRecoveryManager.createRecoveryRequest(
  '0x...',
  1,
  '0x...', // new owner
  '0x...' // requester
);
```

### On-chain Reputation

```typescript
import { onChainReputationSystem } from '@/lib/on-chain-reputation-system';

// Calculate reputation
const reputation = await onChainReputationSystem.calculateReputation('0x...', {
  totalTrades: 100,
  totalVolumeUSD: 50000,
  defiInteractions: 50,
  governanceVotes: 10,
});

console.log(`Reputation Score: ${reputation.overallScore}`);
console.log(`Level: ${reputation.level}`);
console.log(`Badges: ${reputation.badges.length}`);
```

### Options & Derivatives Dashboard

```typescript
import { optionsDerivativesDashboard } from '@/lib/options-derivatives-dashboard';

// Add options position
optionsDerivativesDashboard.addOptionsPosition({
  id: 'opt1',
  type: 'call',
  underlying: '0x...',
  underlyingSymbol: 'ETH',
  strikePrice: 2000,
  expiration: Date.now() + 30 * 24 * 60 * 60 * 1000,
  premium: 100,
  quantity: 1,
  chainId: 1,
  protocol: 'Opyn',
  openedAt: Date.now(),
  status: 'open',
});

// Get dashboard
const dashboard = optionsDerivativesDashboard.getDashboard();
console.log(`Total P&L: $${dashboard.totalProfitLoss}`);
console.log(`Liquidation Risk: ${dashboard.riskMetrics.liquidationRisk}%`);
```

## 📊 Performance Metrics

- **Scan Speed**: < 5 seconds for multi-chain wallet scan
- **Real-time Updates**: 30-second monitoring intervals
- **API Response Time**: < 500ms average
- **Gas Price Accuracy**: ±5% within 30 seconds
- **Supported Wallets**: MetaMask, WalletConnect, Coinbase Wallet, and 50+ more

## 🗺️ Roadmap

### Completed ✅

- ✅ Real-time wallet monitoring
- ✅ Multi-wallet comparison
- ✅ Gas price tracking and optimization
- ✅ NFT security scanning
- ✅ DeFi exposure analysis
- ✅ Transaction simulation
- ✅ Export reports (JSON, CSV, encrypted backups)
- ✅ Portfolio performance tracking
- ✅ Contract interaction history
- ✅ Token price alerts system
- ✅ Activity heatmap visualization
- ✅ Risk trend analysis
- ✅ Approval optimization recommendations
- ✅ Cross-chain bridge tracking
- ✅ MEV protection analysis
- ✅ Token unlock/vesting tracking
- ✅ Governance participation tracking
- ✅ Tax report generation
- ✅ Liquidity pool analysis
- ✅ Staking position tracking
- ✅ Wallet backup management
- ✅ Flashloan monitoring
- ✅ Smart contract security scanning
- ✅ Wallet reputation system
- ✅ Multi-sig wallet management
- ✅ ENS domain management
- ✅ Airdrop eligibility checking
- ✅ Portfolio rebalancing
- ✅ Yield opportunity finding
- ✅ Whale activity tracking
- ✅ Rug pull detection
- ✅ Transaction batch execution
- ✅ Activity timeline generation
- ✅ Token metadata fetching
- ✅ Address book management
- ✅ Gas price prediction
- ✅ Smart contract deployment helper
- ✅ DCA automation
- ✅ Limit order management
- ✅ Recurring payments management
- ✅ Token swap aggregation
- ✅ Carbon footprint tracking
- ✅ Social recovery management
- ✅ On-chain reputation system
- ✅ Options & derivatives dashboard
- ✅ Token launchpad platform
- ✅ Profit/loss calculator
- ✅ Network status monitor
- ✅ Quick actions manager
- ✅ Security badge generator
- ✅ Smart alert automation
- ✅ DAO treasury manager
- ✅ Token vesting scheduler
- ✅ Token snapshot manager
- ✅ Wallet comparison tool
- ✅ Transaction fee optimizer
- ✅ Token price tracker
- ✅ Wallet activity exporter
- ✅ Multi-chain portfolio aggregator
- ✅ Token distribution analyzer
- ✅ Wallet clustering tool
- ✅ Transaction simulator
- ✅ Gas price history tracker
- ✅ Wallet health score calculator
- ✅ Token approval risk analyzer
- ✅ Smart contract interaction history
- ✅ Portfolio rebalancing suggestions
- ✅ Yield farming opportunity finder
- ✅ Wallet activity patterns analyzer
- ✅ Transaction batch optimizer
- ✅ Wallet reputation builder
- ✅ Token sniper alert system
- ✅ DeFi protocol risk analyzer
- ✅ NFT collection tracker
- ✅ Cross-chain asset tracker
- ✅ Wallet recovery assistant
- ✅ Gas war monitor
- ✅ Token price alert manager
- ✅ Wallet activity heatmap generator
- ✅ Smart contract security scanner
- ✅ Token unlock tracker
- ✅ Governance proposal tracker
- ✅ Liquidity pool position analyzer
- ✅ Staking rewards calculator
- ✅ Wallet backup validator
- ✅ Approval revoker with batch support
- ✅ Wallet backup & export with encryption
- ✅ Watchlist manager for multiple wallets
- ✅ Token metadata caching system
- ✅ Transaction batch analyzer
- ✅ Wallet tagging & categorization
- ✅ Security recommendations engine
- ✅ Approval history tracker
- ✅ Address book manager
- ✅ Gas optimization calculator
- ✅ Wallet health report generator
- ✅ Wallet health score calculator
- ✅ Enhanced transaction simulator
- ✅ Wallet backup validator
- ✅ Wallet recovery phrase checker
- ✅ Token allowance real-time monitor
- ✅ Wallet activity pattern analyzer
- ✅ Risk prediction engine
- ✅ Wallet clustering & relationships
- ✅ Transaction fee optimizer
- ✅ Comprehensive security audit
- ✅ Cross-chain portfolio aggregator

### In Progress 🚧

- 🔄 Browser extension for real-time monitoring
- 🔄 Push notification system for risky approvals
- 🔄 Integration with revoke.cash for inline revoking
- 🔄 PDF export for compliance reports

### Medium-term (Q2-Q3 2024)
- [ ] Reown session encryption and security enhancements
- [ ] AppKit custom wallet onboarding flow
- [ ] Base bridge integration UI
- [ ] Transaction batch processing
- [ ] Wallet connection analytics dashboard
- [ ] Custom chain configuration UI
- [ ] Hardware wallet support (Ledger, Trezor)
- [ ] Social login integration (Google, Apple)

### Long-term (Q4 2024+)
- [ ] Account abstraction support
- [ ] Paymaster integration
- [ ] Cross-chain transaction monitoring
- [ ] AI-powered risk detection
- [ ] Mobile app (React Native)
- [ ] API for third-party integrations
- [ ] White-label solution for enterprises

---

**Built with ❤️ by the Wallet Health Team**
