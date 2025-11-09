import { NextRequest, NextResponse } from 'next/server';

interface ExportRequest {
  walletAddress: string;
  format: 'json' | 'csv' | 'pdf';
  includeCharts?: boolean;
  sections?: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body: ExportRequest = await request.json();
    const { walletAddress, format, includeCharts = false, sections = [] } = body;

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    // Mock comprehensive report data
    const reportData = {
      metadata: {
        walletAddress,
        generatedAt: new Date().toISOString(),
        reportVersion: '1.0.0',
      },
      securitySummary: {
        overallScore: 92,
        riskLevel: 'low',
        lastScan: new Date().toISOString(),
        trendsLast30Days: {
          scores: [78, 82, 85, 88, 86, 90, 92],
          dates: ['30d ago', '25d ago', '20d ago', '15d ago', '10d ago', '5d ago', 'Today'],
        },
      },
      approvals: {
        total: 12,
        unlimited: 3,
        risky: 1,
        items: [
          {
            token: 'USDT',
            spender: 'Uniswap V2',
            amount: 'Unlimited',
            risk: 'medium',
          },
          {
            token: 'DAI',
            spender: 'Aave',
            amount: 'Unlimited',
            risk: 'low',
          },
        ],
      },
      tokens: {
        total: 24,
        portfolioValue: 45230.50,
        spamDetected: 3,
        topHoldings: [
          { symbol: 'ETH', balance: 5.25, value: 18500 },
          { symbol: 'USDC', balance: 12450, value: 12450 },
          { symbol: 'WBTC', balance: 0.32, value: 14280 },
        ],
      },
      transactions: {
        last30Days: 45,
        totalGasSpent: 0.245,
        mostActive: {
          protocol: 'Uniswap',
          count: 18,
        },
      },
      defiExposure: {
        totalValue: 29871.25,
        protocols: [
          { name: 'Uniswap', value: 5420.50, risk: 'low' },
          { name: 'Aave', value: 12350.00, risk: 'low' },
          { name: 'Curve', value: 3200.75, risk: 'medium' },
          { name: 'Lido', value: 8900.00, risk: 'low' },
        ],
      },
      riskFactors: [
        {
          category: 'Token Approvals',
          score: 85,
          issues: 1,
          recommendation: 'Review unlimited approvals',
        },
        {
          category: 'Contract Interactions',
          score: 95,
          issues: 0,
          recommendation: 'All contracts verified',
        },
        {
          category: 'Portfolio Diversity',
          score: 90,
          issues: 0,
          recommendation: 'Well diversified',
        },
      ],
      recommendations: [
        'Revoke unlimited approval for USDT on unknown contract',
        'Consider using a hardware wallet for high-value transactions',
        'Enable 2FA on all connected dApps',
        'Regular security scans recommended (weekly)',
      ],
    };

    // Generate different formats
    if (format === 'json') {
      return NextResponse.json(reportData, {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="wallet-health-report-${walletAddress.slice(0, 8)}.json"`,
        },
      });
    }

    if (format === 'csv') {
      const csv = generateCSV(reportData);
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="wallet-health-report-${walletAddress.slice(0, 8)}.csv"`,
        },
      });
    }

    if (format === 'pdf') {
      // In a real implementation, you'd use a library like puppeteer or pdfkit
      return NextResponse.json(
        { 
          message: 'PDF generation not yet implemented',
          data: reportData
        },
        { status: 501 }
      );
    }

    return NextResponse.json(
      { error: 'Invalid format' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Failed to generate export' },
      { status: 500 }
    );
  }
}

function generateCSV(data: any): string {
  const lines: string[] = [];
  
  // Metadata
  lines.push('WALLET HEALTH REPORT');
  lines.push(`Wallet Address,${data.metadata.walletAddress}`);
  lines.push(`Generated At,${data.metadata.generatedAt}`);
  lines.push('');

  // Security Summary
  lines.push('SECURITY SUMMARY');
  lines.push(`Overall Score,${data.securitySummary.overallScore}`);
  lines.push(`Risk Level,${data.securitySummary.riskLevel}`);
  lines.push(`Last Scan,${data.securitySummary.lastScan}`);
  lines.push('');

  // Approvals
  lines.push('TOKEN APPROVALS');
  lines.push('Token,Spender,Amount,Risk');
  data.approvals.items.forEach((approval: any) => {
    lines.push(`${approval.token},${approval.spender},${approval.amount},${approval.risk}`);
  });
  lines.push('');

  // Top Holdings
  lines.push('TOP TOKEN HOLDINGS');
  lines.push('Symbol,Balance,Value (USD)');
  data.tokens.topHoldings.forEach((token: any) => {
    lines.push(`${token.symbol},${token.balance},${token.value}`);
  });
  lines.push('');

  // DeFi Exposure
  lines.push('DEFI PROTOCOL EXPOSURE');
  lines.push('Protocol,Value (USD),Risk');
  data.defiExposure.protocols.forEach((protocol: any) => {
    lines.push(`${protocol.name},${protocol.value},${protocol.risk}`);
  });
  lines.push('');

  // Risk Factors
  lines.push('RISK FACTORS');
  lines.push('Category,Score,Issues,Recommendation');
  data.riskFactors.forEach((factor: any) => {
    lines.push(`${factor.category},${factor.score},${factor.issues},${factor.recommendation}`);
  });
  lines.push('');

  // Recommendations
  lines.push('RECOMMENDATIONS');
  data.recommendations.forEach((rec: string) => {
    lines.push(rec);
  });

  return lines.join('\n');
}

