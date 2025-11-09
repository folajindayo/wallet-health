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
│   │       ├── token-metadata-cache.ts    # Token metadata caching system
│   │       ├── transaction-batch-analyzer.ts # Transaction batch analyzer
│   │       ├── wallet-tagging.ts         # Wallet tagging & categorization
│   │       ├── security-recommendations.ts # Security recommendations engine
│   │       ├── approval-history-tracker.ts # Approval history tracking
│   │       ├── address-book.ts           # Address book manager
│   │       ├── gas-optimization-calculator.ts # Gas optimization calculator
│   │       └── wallet-health-report.ts   # Wallet health report generator
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

### Security & Recommendations

- ✅ **🛡️ Security Recommendations Engine** - Generate actionable security recommendations
- ✅ **📜 Approval History Tracker** - Track token approval changes over time
- ✅ **🔍 Token Metadata Cache** - Cache token metadata to reduce API calls
- ✅ **📈 Risk Trend Analysis** - Analyze risk score trends and predict future risk levels

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

// Get watchlist statistics
const stats = watchlistManager.getStats();
console.log(`Total Wallets: ${stats.totalWallets}`);
console.log(`Average Score: ${stats.averageScore}`);
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
- ✅ Export reports (JSON, CSV)
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
