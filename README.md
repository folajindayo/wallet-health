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
│   │       ├── web3-config.ts    # Wagmi & WalletConnect config
│   │       ├── mongodb.ts        # Database connection
│   │       └── risk-scorer.ts    # Risk scoring algorithm
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
- **Blockchain Interaction**: Wagmi + Viem
- **State Management**: React Query (@tanstack/react-query)

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
- **Base** (Chain ID: 8453)
- **Arbitrum One** (Chain ID: 42161)

## 📡 API Routes

### Scan Endpoints

- `POST /api/scan/approvals` - Fetch token approvals
- `POST /api/scan/tokens` - Get wallet token balances
- `POST /api/scan/transactions` - Fetch recent transactions

### Risk Analysis

- `POST /api/risk/calculate` - Calculate wallet health score
- `POST /api/risk/check-contract` - Verify contract safety
- `POST /api/risk/detect-spam` - Identify spam tokens

### Database Operations

- `POST /api/db/save-scan` - Store scan results
- `GET /api/db/scan-history` - Retrieve scan history
- `GET|POST /api/db/preferences` - User preferences

## 🎨 Dark Mode Theme

The app uses a custom dark theme by default with:

- Background: `#0a0a0a`
- Primary accent: `#10b981` (green for "healthy")
- Card surface: `#121212`
- Border: `#262626`

Theme variables are defined in `apps/wallet-health/app/globals.css`.

## 🔒 Security & Privacy

- ✅ **Non-custodial**: Read-only access via WalletConnect
- ✅ **No private keys**: Never asks for or stores private keys
- ✅ **Open source**: All code is publicly auditable
- ✅ **No tracking**: Privacy-first approach

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

### Project Structure Guidelines

- Files should be 200-400 lines (max 500, never exceed 800-1000)
- Use NativeWind, not StyleSheet
- Individual file commits with descriptive messages
- README.md is the sole readme file (remove others)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [GoldRush (Covalent)](https://goldrush.dev/) for blockchain data API
- [Reown (WalletConnect)](https://reown.com/) for wallet connection
- [Shadcn UI](https://ui.shadcn.com/) for beautiful components
- [Vercel](https://vercel.com/) for Next.js and deployment

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/folajindayo/wallet-health/issues)
- **Twitter**: [@wallet_health](https://twitter.com/wallet_health)
- **Email**: support@wallet-health.app

## 🗺️ Roadmap

- [ ] Browser extension for real-time monitoring
- [ ] Notification system for risky approvals
- [ ] Integration with revoke.cash for inline revoking
- [ ] Activity timeline chart
- [ ] Multi-wallet comparison
- [ ] PDF export for compliance reports

---

**Built with ❤️ by the Wallet Health Team**
