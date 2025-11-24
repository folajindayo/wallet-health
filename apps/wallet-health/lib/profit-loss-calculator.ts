/**
 * Profit/Loss Calculator Utility
 * Calculates profit and loss for positions and transactions
 */

export interface Position {
  id: string;
  token: string;
  tokenSymbol: string;
  chainId: number;
  entryPrice: number; // USD per token
  currentPrice: number; // USD per token
  quantity: number; // Token amount
  entryDate: number;
  fees?: number; // USD
  type: 'buy' | 'sell' | 'swap' | 'liquidity' | 'staking';
}

export interface PnLCalculation {
  position: Position;
  entryValue: number; // USD
  currentValue: number; // USD
  profitLoss: number; // USD
  profitLossPercent: number; // Percentage
  fees: number; // USD
  netProfitLoss: number; // USD
  netProfitLossPercent: number; // Percentage
  holdingPeriod: number; // days
  isLongTerm: boolean; // > 1 year
}

export interface PortfolioPnL {
  totalPositions: number;
  openPositions: number;
  closedPositions: number;
  totalRealizedPnL: number; // USD
  totalUnrealizedPnL: number; // USD
  totalFees: number; // USD
  netPnL: number; // USD
  netPnLPPercent: number; // Percentage
  bestPerformer: Position | null;
  worstPerformer: Position | null;
  byToken: Record<string, {
    positions: number;
    totalPnL: number;
    averagePnLPercent: number;
  }>;
  byType: Record<string, {
    positions: number;
    totalPnL: number;
  }>;
}

export class ProfitLossCalculator {
  /**
   * Calculate P&L for a position
   */
  calculatePnL(position: Position): PnLCalculation {
    const entryValue = position.entryPrice * position.quantity;
    const currentValue = position.currentPrice * position.quantity;
    const profitLoss = currentValue - entryValue;
    const profitLossPercent = entryValue > 0
      ? (profitLoss / entryValue) * 100
      : 0;

    const fees = position.fees || 0;
    const netProfitLoss = profitLoss - fees;
    const netProfitLossPercent = entryValue > 0
      ? (netProfitLoss / entryValue) * 100
      : 0;

    const holdingPeriod = Math.floor(
      (Date.now() - position.entryDate) / (24 * 60 * 60 * 1000)
    );
    const isLongTerm = holdingPeriod > 365;

    return {
      position,
      entryValue: Math.round(entryValue * 100) / 100,
      currentValue: Math.round(currentValue * 100) / 100,
      profitLoss: Math.round(profitLoss * 100) / 100,
      profitLossPercent: Math.round(profitLossPercent * 100) / 100,
      fees,
      netProfitLoss: Math.round(netProfitLoss * 100) / 100,
      netProfitLossPercent: Math.round(netProfitLossPercent * 100) / 100,
      holdingPeriod,
      isLongTerm,
    };
  }

  /**
   * Calculate portfolio P&L
   */
  calculatePortfolioPnL(positions: Position[]): PortfolioPnL {
    const openPositions = positions.filter(p => p.currentPrice > 0);
    const closedPositions = positions.filter(p => p.currentPrice === 0);

    // Calculate realized P&L (closed positions)
    const totalRealizedPnL = closedPositions.reduce((sum, pos) => {
      const pnl = this.calculatePnL(pos);
      return sum + pnl.netProfitLoss;
    }, 0);

    // Calculate unrealized P&L (open positions)
    const totalUnrealizedPnL = openPositions.reduce((sum, pos) => {
      const pnl = this.calculatePnL(pos);
      return sum + pnl.netProfitLoss;
    }, 0);

    // Calculate total fees
    const totalFees = positions.reduce((sum, pos) => sum + (pos.fees || 0), 0);

    const netPnL = totalRealizedPnL + totalUnrealizedPnL;
    const totalInvested = positions.reduce(
      (sum, pos) => sum + (pos.entryPrice * pos.quantity),
      0
    );
    const netPnLPPercent = totalInvested > 0
      ? (netPnL / totalInvested) * 100
      : 0;

    // Find best and worst performers
    const pnlCalculations = positions.map(pos => this.calculatePnL(pos));
    const bestPerformer = pnlCalculations.length > 0
      ? pnlCalculations.reduce((best, current) =>
          current.netProfitLoss > best.netProfitLoss ? current : best
        ).position
      : null;

    const worstPerformer = pnlCalculations.length > 0
      ? pnlCalculations.reduce((worst, current) =>
          current.netProfitLoss < worst.netProfitLoss ? current : worst
        ).position
      : null;

    // Group by token
    const byToken: Record<string, {
      positions: number;
      totalPnL: number;
      averagePnLPercent: number;
    }> = {};

    positions.forEach(pos => {
      if (!byToken[pos.tokenSymbol]) {
        byToken[pos.tokenSymbol] = {
          positions: 0,
          totalPnL: 0,
          averagePnLPercent: 0,
        };
      }

      const pnl = this.calculatePnL(pos);
      byToken[pos.tokenSymbol].positions++;
      byToken[pos.tokenSymbol].totalPnL += pnl.netProfitLoss;
    });

    // Calculate averages
    Object.keys(byToken).forEach(symbol => {
      const data = byToken[symbol];
      data.averagePnLPercent = data.positions > 0
        ? (data.totalPnL / (positions.filter(p => p.tokenSymbol === symbol)
            .reduce((sum, p) => sum + (p.entryPrice * p.quantity), 0))) * 100
        : 0;
    });

    // Group by type
    const byType: Record<string, { positions: number; totalPnL: number }> = {};
    positions.forEach(pos => {
      if (!byType[pos.type]) {
        byType[pos.type] = { positions: 0, totalPnL: 0 };
      }

      const pnl = this.calculatePnL(pos);
      byType[pos.type].positions++;
      byType[pos.type].totalPnL += pnl.netProfitLoss;
    });

    return {
      totalPositions: positions.length,
      openPositions: openPositions.length,
      closedPositions: closedPositions.length,
      totalRealizedPnL: Math.round(totalRealizedPnL * 100) / 100,
      totalUnrealizedPnL: Math.round(totalUnrealizedPnL * 100) / 100,
      totalFees: Math.round(totalFees * 100) / 100,
      netPnL: Math.round(netPnL * 100) / 100,
      netPnLPPercent: Math.round(netPnLPPercent * 100) / 100,
      bestPerformer,
      worstPerformer,
      byToken,
      byType,
    };
  }

  /**
   * Calculate tax implications
   */
  calculateTaxImplications(positions: Position[]): {
    shortTermGains: number; // USD
    longTermGains: number; // USD
    shortTermLosses: number; // USD
    longTermLosses: number; // USD
    netShortTerm: number; // USD
    netLongTerm: number; // USD
    totalTaxable: number; // USD
  } {
    const closedPositions = positions.filter(p => p.currentPrice === 0);
    const now = Date.now();
    const oneYear = 365 * 24 * 60 * 60 * 1000;

    let shortTermGains = 0;
    let longTermGains = 0;
    let shortTermLosses = 0;
    let longTermLosses = 0;

    closedPositions.forEach(pos => {
      const pnl = this.calculatePnL(pos);
      const isLongTerm = (now - pos.entryDate) > oneYear;

      if (pnl.netProfitLoss > 0) {
        if (isLongTerm) {
          longTermGains += pnl.netProfitLoss;
        } else {
          shortTermGains += pnl.netProfitLoss;
        }
      } else {
        if (isLongTerm) {
          longTermLosses += Math.abs(pnl.netProfitLoss);
        } else {
          shortTermLosses += Math.abs(pnl.netProfitLoss);
        }
      }
    });

    const netShortTerm = shortTermGains - shortTermLosses;
    const netLongTerm = longTermGains - longTermLosses;
    const totalTaxable = Math.max(0, netShortTerm) + Math.max(0, netLongTerm);

    return {
      shortTermGains: Math.round(shortTermGains * 100) / 100,
      longTermGains: Math.round(longTermGains * 100) / 100,
      shortTermLosses: Math.round(shortTermLosses * 100) / 100,
      longTermLosses: Math.round(longTermLosses * 100) / 100,
      netShortTerm: Math.round(netShortTerm * 100) / 100,
      netLongTerm: Math.round(netLongTerm * 100) / 100,
      totalTaxable: Math.round(totalTaxable * 100) / 100,
    };
  }

  /**
   * Calculate ROI for a period
   */
  calculateROI(
    positions: Position[],
    startDate: number,
    endDate: number
  ): {
    roi: number; // Percentage
    totalInvested: number; // USD
    totalValue: number; // USD
    profitLoss: number; // USD
  } {
    const periodPositions = positions.filter(
      p => p.entryDate >= startDate && p.entryDate <= endDate
    );

    const totalInvested = periodPositions.reduce(
      (sum, pos) => sum + (pos.entryPrice * pos.quantity),
      0
    );

    const totalValue = periodPositions.reduce(
      (sum, pos) => sum + (pos.currentPrice * pos.quantity),
      0
    );

    const profitLoss = totalValue - totalInvested;
    const roi = totalInvested > 0
      ? (profitLoss / totalInvested) * 100
      : 0;

    return {
      roi: Math.round(roi * 100) / 100,
      totalInvested: Math.round(totalInvested * 100) / 100,
      totalValue: Math.round(totalValue * 100) / 100,
      profitLoss: Math.round(profitLoss * 100) / 100,
    };
  }
}

// Singleton instance
export const profitLossCalculator = new ProfitLossCalculator();

