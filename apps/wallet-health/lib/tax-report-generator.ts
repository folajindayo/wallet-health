/**
 * Tax Report Generator Utility
 * Generates tax reports from transaction history
 */

export interface TaxTransaction {
  id: string;
  timestamp: number;
  type: 'buy' | 'sell' | 'swap' | 'transfer_in' | 'transfer_out' | 'stake' | 'unstake' | 'reward';
  tokenIn?: {
    address: string;
    symbol: string;
    amount: string;
    valueUSD: number;
  };
  tokenOut?: {
    address: string;
    symbol: string;
    amount: string;
    valueUSD: number;
  };
  fee?: {
    token: string;
    amount: string;
    valueUSD: number;
  };
  gainLoss?: number; // USD
  costBasis?: number; // USD
  chainId: number;
  transactionHash: string;
}

export interface TaxReport {
  year: number;
  summary: {
    totalTransactions: number;
    totalIncome: number;
    totalExpenses: number;
    netGainLoss: number;
    realizedGains: number;
    realizedLosses: number;
  };
  byCategory: {
    trading: number;
    staking: number;
    rewards: number;
    transfers: number;
  };
  transactions: TaxTransaction[];
  washSales?: WashSale[];
}

export interface WashSale {
  buyTransaction: TaxTransaction;
  sellTransaction: TaxTransaction;
  lossDisallowed: number;
  daysBetween: number;
}

export interface TaxYearSummary {
  year: number;
  totalGainLoss: number;
  realizedGains: number;
  realizedLosses: number;
  shortTermGains: number;
  longTermGains: number;
  shortTermLosses: number;
  longTermLosses: number;
  totalIncome: number;
  totalExpenses: number;
}

export class TaxReportGenerator {
  /**
   * Generate tax report for a year
   */
  generateTaxReport(
    transactions: TaxTransaction[],
    year: number
  ): TaxReport {
    const yearTransactions = transactions.filter(
      tx => new Date(tx.timestamp).getFullYear() === year
    );

    // Calculate summary
    let totalIncome = 0;
    let totalExpenses = 0;
    let realizedGains = 0;
    let realizedLosses = 0;

    const byCategory = {
      trading: 0,
      staking: 0,
      rewards: 0,
      transfers: 0,
    };

    yearTransactions.forEach(tx => {
      // Categorize
      if (tx.type === 'swap' || tx.type === 'buy' || tx.type === 'sell') {
        byCategory.trading += tx.gainLoss || 0;
      } else if (tx.type === 'stake' || tx.type === 'unstake') {
        byCategory.staking += tx.gainLoss || 0;
      } else if (tx.type === 'reward') {
        byCategory.rewards += tx.gainLoss || 0;
        totalIncome += tx.gainLoss || 0;
      } else {
        byCategory.transfers += tx.gainLoss || 0;
      }

      // Calculate gains/losses
      if (tx.gainLoss) {
        if (tx.gainLoss > 0) {
          realizedGains += tx.gainLoss;
          totalIncome += tx.gainLoss;
        } else {
          realizedLosses += Math.abs(tx.gainLoss);
          totalExpenses += Math.abs(tx.gainLoss);
        }
      }

      // Add fees to expenses
      if (tx.fee) {
        totalExpenses += tx.fee.valueUSD;
      }
    });

    const netGainLoss = realizedGains - realizedLosses;

    // Detect wash sales
    const washSales = this.detectWashSales(yearTransactions);

    return {
      year,
      summary: {
        totalTransactions: yearTransactions.length,
        totalIncome,
        totalExpenses,
        netGainLoss,
        realizedGains,
        realizedLosses,
      },
      byCategory,
      transactions: yearTransactions.sort((a, b) => a.timestamp - b.timestamp),
      washSales: washSales.length > 0 ? washSales : undefined,
    };
  }

  /**
   * Detect wash sales (buying and selling same token within 30 days)
   */
  private detectWashSales(transactions: TaxTransaction[]): WashSale[] {
    const washSales: WashSale[] = [];
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;

    // Group transactions by token
    const tokenTransactions = new Map<string, TaxTransaction[]>();
    transactions.forEach(tx => {
      const token = tx.tokenOut?.address || tx.tokenIn?.address;
      if (token) {
        if (!tokenTransactions.has(token)) {
          tokenTransactions.set(token, []);
        }
        tokenTransactions.get(token)!.push(tx);
      }
    });

    // Check for wash sales
    tokenTransactions.forEach((txs, token) => {
      const buys = txs.filter(tx => tx.type === 'buy' || (tx.type === 'swap' && tx.tokenOut));
      const sells = txs.filter(tx => tx.type === 'sell' || (tx.type === 'swap' && tx.tokenIn));

      sells.forEach(sell => {
        buys.forEach(buy => {
          const daysBetween = Math.abs(sell.timestamp - buy.timestamp);
          
          // Check if within 30 days and sell resulted in a loss
          if (daysBetween <= thirtyDays && sell.gainLoss && sell.gainLoss < 0) {
            const lossDisallowed = Math.abs(sell.gainLoss);
            
            washSales.push({
              buyTransaction: buy,
              sellTransaction: sell,
              lossDisallowed,
              daysBetween: Math.floor(daysBetween / (24 * 60 * 60 * 1000)),
            });
          }
        });
      });
    });

    return washSales;
  }

  /**
   * Calculate cost basis using FIFO (First In First Out)
   */
  calculateCostBasisFIFO(
    transactions: TaxTransaction[],
    tokenAddress: string
  ): Array<{ transaction: TaxTransaction; costBasis: number }> {
    const tokenTransactions = transactions
      .filter(tx => 
        tx.tokenIn?.address === tokenAddress || tx.tokenOut?.address === tokenAddress
      )
      .sort((a, b) => a.timestamp - b.timestamp);

    const holdings: Array<{ amount: number; costBasis: number }> = [];
    const results: Array<{ transaction: TaxTransaction; costBasis: number }> = [];

    tokenTransactions.forEach(tx => {
      if (tx.type === 'buy' || (tx.type === 'swap' && tx.tokenOut?.address === tokenAddress)) {
        // Buying
        const amount = parseFloat(tx.tokenOut?.amount || '0');
        const costBasis = tx.tokenOut?.valueUSD || 0;
        holdings.push({ amount, costBasis });
      } else if (tx.type === 'sell' || (tx.type === 'swap' && tx.tokenIn?.address === tokenAddress)) {
        // Selling
        const sellAmount = parseFloat(tx.tokenIn?.amount || '0');
        let remaining = sellAmount;
        let totalCostBasis = 0;

        while (remaining > 0 && holdings.length > 0) {
          const holding = holdings[0];
          const used = Math.min(remaining, holding.amount);
          totalCostBasis += (used / holding.amount) * holding.costBasis;
          remaining -= used;
          holding.amount -= used;

          if (holding.amount <= 0) {
            holdings.shift();
          }
        }

        results.push({
          transaction: tx,
          costBasis: totalCostBasis,
        });
      }
    });

    return results;
  }

  /**
   * Generate year summary
   */
  generateYearSummary(
    transactions: TaxTransaction[],
    year: number
  ): TaxYearSummary {
    const report = this.generateTaxReport(transactions, year);
    const oneYear = 365 * 24 * 60 * 60 * 1000;

    let shortTermGains = 0;
    let longTermGains = 0;
    let shortTermLosses = 0;
    let longTermLosses = 0;

    report.transactions.forEach(tx => {
      if (tx.gainLoss) {
        // Determine if short-term (< 1 year) or long-term
        // This is simplified - would need to track purchase dates
        const isShortTerm = true; // Simplified

        if (tx.gainLoss > 0) {
          if (isShortTerm) {
            shortTermGains += tx.gainLoss;
          } else {
            longTermGains += tx.gainLoss;
          }
        } else {
          if (isShortTerm) {
            shortTermLosses += Math.abs(tx.gainLoss);
          } else {
            longTermLosses += Math.abs(tx.gainLoss);
          }
        }
      }
    });

    return {
      year,
      totalGainLoss: report.summary.netGainLoss,
      realizedGains: report.summary.realizedGains,
      realizedLosses: report.summary.realizedLosses,
      shortTermGains,
      longTermGains,
      shortTermLosses,
      longTermLosses,
      totalIncome: report.summary.totalIncome,
      totalExpenses: report.summary.totalExpenses,
    };
  }

  /**
   * Export to CSV format
   */
  exportToCSV(report: TaxReport): string {
    const headers = [
      'Date',
      'Type',
      'Token In',
      'Amount In',
      'Value In (USD)',
      'Token Out',
      'Amount Out',
      'Value Out (USD)',
      'Fee (USD)',
      'Gain/Loss (USD)',
      'Transaction Hash',
    ];

    const rows = report.transactions.map(tx => {
      const date = new Date(tx.timestamp).toISOString().split('T')[0];
      return [
        date,
        tx.type,
        tx.tokenIn?.symbol || '',
        tx.tokenIn?.amount || '',
        tx.tokenIn?.valueUSD || 0,
        tx.tokenOut?.symbol || '',
        tx.tokenOut?.amount || '',
        tx.tokenOut?.valueUSD || 0,
        tx.fee?.valueUSD || 0,
        tx.gainLoss || 0,
        tx.transactionHash,
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }
}

// Singleton instance
export const taxReportGenerator = new TaxReportGenerator();

