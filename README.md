# Wallet Health Monitor 🛡️

A non-custodial Web3 wallet scanner that helps users assess the security of their wallet by detecting risky token approvals, suspicious tokens, and contract risk signals across multiple blockchains.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Turborepo](https://img.shields.io/badge/Turborepo-2.0-red)

## 🎯 Overview

Wallet Health Monitor is a lightweight, read-only dApp that provides instant security audits for crypto wallets. It scans for:

- **Risky token approvals** - Detect unlimited allowances and suspicious spenders
- **Spam & phishing tokens** - Identify malicious airdrops
- **Contract risk signals** - Flag new/unverified contracts
- **Multi-chain support** - Ethereum, BNB Chain, Polygon, Base, and Arbitrum
- **Advanced wallet integration** - Seamless connection via Reown AppKit and WalletConnect
- **Base L2 optimization** - Native support for Base network with enhanced features
- **Real-time monitoring** - Track wallet health changes over time
- **Transaction analysis** - Deep dive into transaction history and patterns

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
│   │       ├── portfolio-optimizer.ts      # Portfolio optimization algorithms
│   │       ├── risk-model-engine.ts        # Advanced risk modeling
│   │       └── yield-optimizer.ts          # Yield farming optimization
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

- **🔀 Wallet Comparison** - Compare multiple wallets side-by-side
- **💾 Export Reports** - Export scan results as JSON, CSV, or PDF
- **🔐 Multi-sig Support** - Analyze multi-signature wallet configurations
- **🌐 ENS Integration** - Resolve ENS domains and verify ownership

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

### Automated Git Farming Script (`farm.sh`)

The project includes an advanced automated git commit script (`farm.sh`) that reads commit messages from `wallet.txt` and automatically commits and pushes changes to your repository.

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
./farm.sh

# Commit every 5 seconds
./farm.sh -d 5

# Dry-run mode (test without committing)
./farm.sh --dry-run

# Verbose mode with custom delay
./farm.sh -v -d 3

# Skip empty commits and use specific branch
./farm.sh -s -b main

# Custom message file and log file
./farm.sh -f my-messages.txt -l my-log.log

# Force push (use with caution)
./farm.sh --force-push
```

#### Command-Line Options

| Option | Description | Default |
|--------|-------------|---------|
| `-d, --delay SECONDS` | Delay between commits | 1 |
| `-f, --file FILE` | Path to commit messages file | wallet.txt |
| `-b, --branch BRANCH` | Git branch to commit to | current branch |
| `-l, --log FILE` | Log file path | farm.log |
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

Statistics are saved to `farm-stats.json` and displayed on exit (Ctrl+C).

#### Logging

When enabled, all operations are logged to `farm.log` with timestamps:
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
./farm.sh --dry-run -v

# Production run with 2-second delay and logging
./farm.sh -d 2 -v

# Commit to feature branch, skip empty commits
./farm.sh -b feature/new-feature -s

# Custom configuration
./farm.sh -d 5 -f custom-messages.txt -l custom.log -v --skip-empty
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

### Current Features

- ✅ **Multi-chain wallet scanning** - Support for 5+ major chains
- ✅ **Risk scoring algorithm** - Comprehensive security assessment
- ✅ **Token approval detection** - Identify risky and unlimited approvals
- ✅ **Spam token detection** - Flag malicious airdrops
- ✅ **Contract verification** - Check contract safety and verification status
- ✅ **Reown AppKit integration** - Modern wallet connection UI
- ✅ **WalletConnect v2 support** - Latest protocol implementation
- ✅ **Base L2 optimization** - Enhanced Base network support
- ✅ **Dark mode UI** - Beautiful, modern interface
- ✅ **Scan history** - Track wallet health over time
- ✅ **MongoDB integration** - Persistent data storage
- ✅ **Responsive design** - Works on desktop and mobile

### Advanced Features

- 🔄 **Session persistence** - Remember wallet connections
- 🔄 **Multi-account support** - Manage multiple wallet accounts
- 🔄 **Transaction simulation** - Preview transactions before signing
- 🔄 **Gas optimization** - Smart gas estimation and batching
- 🔄 **Custom RPC endpoints** - Configure your own RPC providers
- 🔄 **Network switching** - Seamless chain switching in UI
- 🔄 **Wallet filtering** - Filter wallets by features and capabilities
- 🔄 **Analytics dashboard** - Track connection metrics and usage

## 🗺️ Roadmap

### Short-term (Q1 2024)
- [ ] Browser extension for real-time monitoring
- [ ] Notification system for risky approvals
- [ ] Integration with revoke.cash for inline revoking
- [ ] Activity timeline chart
- [ ] Multi-wallet comparison
- [ ] PDF export for compliance reports

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
