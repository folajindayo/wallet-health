/**
 * Wallet Activity Exporter Utility
 * Export wallet activity data in various formats
 */

export interface ExportOptions {
  format: 'csv' | 'json' | 'pdf' | 'xlsx';
  startDate?: number;
  endDate?: number;
  includeTransactions?: boolean;
  includeTokenBalances?: boolean;
  includeNFTs?: boolean;
  includeDeFiPositions?: boolean;
  includeApprovals?: boolean;
  chainIds?: number[];
}

export interface ExportData {
  walletAddress: string;
  exportDate: number;
  period: {
    start: number;
    end: number;
  };
  summary: {
    totalTransactions: number;
    totalValueUSD: number;
    tokenCount: number;
    nftCount: number;
    defiPositions: number;
  };
  transactions?: any[];
  tokenBalances?: any[];
  nfts?: any[];
  defiPositions?: any[];
  approvals?: any[];
}

export class WalletActivityExporter {
  /**
   * Export wallet activity
   */
  async exportActivity(
    walletAddress: string,
    data: {
      transactions?: any[];
      tokenBalances?: any[];
      nfts?: any[];
      defiPositions?: any[];
      approvals?: any[];
    },
    options: ExportOptions
  ): Promise<string> {
    const exportData: ExportData = {
      walletAddress,
      exportDate: Date.now(),
      period: {
        start: options.startDate || 0,
        end: options.endDate || Date.now(),
      },
      summary: {
        totalTransactions: data.transactions?.length || 0,
        totalValueUSD: this.calculateTotalValue(data),
        tokenCount: data.tokenBalances?.length || 0,
        nftCount: data.nfts?.length || 0,
        defiPositions: data.defiPositions?.length || 0,
      },
    };

    if (options.includeTransactions) {
      exportData.transactions = this.filterData(data.transactions || [], options);
    }
    if (options.includeTokenBalances) {
      exportData.tokenBalances = this.filterData(data.tokenBalances || [], options);
    }
    if (options.includeNFTs) {
      exportData.nfts = this.filterData(data.nfts || [], options);
    }
    if (options.includeDeFiPositions) {
      exportData.defiPositions = this.filterData(data.defiPositions || [], options);
    }
    if (options.includeApprovals) {
      exportData.approvals = this.filterData(data.approvals || [], options);
    }

    switch (options.format) {
      case 'json':
        return this.exportJSON(exportData);
      case 'csv':
        return this.exportCSV(exportData);
      case 'xlsx':
        return this.exportXLSX(exportData);
      case 'pdf':
        return this.exportPDF(exportData);
      default:
        throw new Error(`Unsupported format: ${options.format}`);
    }
  }

  /**
   * Filter data based on options
   */
  private filterData(data: any[], options: ExportOptions): any[] {
    let filtered = data;

    if (options.startDate) {
      filtered = filtered.filter(item => {
        const timestamp = item.timestamp || item.date || item.createdAt || 0;
        return timestamp >= options.startDate!;
      });
    }

    if (options.endDate) {
      filtered = filtered.filter(item => {
        const timestamp = item.timestamp || item.date || item.createdAt || 0;
        return timestamp <= options.endDate!;
      });
    }

    if (options.chainIds && options.chainIds.length > 0) {
      filtered = filtered.filter(item => {
        const chainId = item.chainId || item.chain_id || 1;
        return options.chainIds!.includes(chainId);
      });
    }

    return filtered;
  }

  /**
   * Calculate total value
   */
  private calculateTotalValue(data: {
    tokenBalances?: any[];
    defiPositions?: any[];
  }): number {
    let total = 0;

    if (data.tokenBalances) {
      total += data.tokenBalances.reduce((sum, token) => {
        return sum + (token.balanceUSD || token.valueUSD || 0);
      }, 0);
    }

    if (data.defiPositions) {
      total += data.defiPositions.reduce((sum, position) => {
        return sum + (position.valueUSD || position.totalValueUSD || 0);
      }, 0);
    }

    return Math.round(total * 100) / 100;
  }

  /**
   * Export as JSON
   */
  private exportJSON(data: ExportData): string {
    return JSON.stringify(data, null, 2);
  }

  /**
   * Export as CSV
   */
  private exportCSV(data: ExportData): string {
    const lines: string[] = [];
    
    // Header
    lines.push('Wallet Activity Export');
    lines.push(`Wallet: ${data.walletAddress}`);
    lines.push(`Export Date: ${new Date(data.exportDate).toISOString()}`);
    lines.push(`Period: ${new Date(data.period.start).toISOString()} to ${new Date(data.period.end).toISOString()}`);
    lines.push('');
    lines.push('Summary');
    lines.push(`Total Transactions,${data.summary.totalTransactions}`);
    lines.push(`Total Value USD,${data.summary.totalValueUSD}`);
    lines.push(`Token Count,${data.summary.tokenCount}`);
    lines.push(`NFT Count,${data.summary.nftCount}`);
    lines.push(`DeFi Positions,${data.summary.defiPositions}`);
    lines.push('');

    // Transactions
    if (data.transactions && data.transactions.length > 0) {
      lines.push('Transactions');
      lines.push('Hash,From,To,Value,Timestamp');
      data.transactions.forEach(tx => {
        lines.push(`${tx.hash || ''},${tx.from || ''},${tx.to || ''},${tx.value || 0},${tx.timestamp || ''}`);
      });
      lines.push('');
    }

    // Token balances
    if (data.tokenBalances && data.tokenBalances.length > 0) {
      lines.push('Token Balances');
      lines.push('Token,Symbol,Balance,Value USD');
      data.tokenBalances.forEach(token => {
        lines.push(`${token.token || ''},${token.symbol || ''},${token.balance || 0},${token.balanceUSD || 0}`);
      });
      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Export as XLSX (simplified - would use library in production)
   */
  private exportXLSX(data: ExportData): string {
    // In production, would use a library like 'xlsx'
    // For now, return JSON as placeholder
    return this.exportJSON(data);
  }

  /**
   * Export as PDF (simplified - would use library in production)
   */
  private exportPDF(data: ExportData): string {
    // In production, would use a library like 'pdfkit' or 'puppeteer'
    // For now, return JSON as placeholder
    return this.exportJSON(data);
  }

  /**
   * Generate export filename
   */
  generateFilename(walletAddress: string, format: string): string {
    const date = new Date().toISOString().split('T')[0];
    const shortAddress = walletAddress.substring(0, 8);
    return `wallet-activity-${shortAddress}-${date}.${format}`;
  }

  /**
   * Validate export options
   */
  validateOptions(options: ExportOptions): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!options.format) {
      errors.push('Format is required');
    }

    if (!['csv', 'json', 'pdf', 'xlsx'].includes(options.format)) {
      errors.push(`Invalid format: ${options.format}`);
    }

    if (options.startDate && options.endDate && options.startDate > options.endDate) {
      errors.push('Start date must be before end date');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

// Singleton instance
export const walletActivityExporter = new WalletActivityExporter();

