/**
 * Options & Derivatives Dashboard Utility
 * Tracks options and derivatives positions
 */

export interface OptionsPosition {
  id: string;
  type: 'call' | 'put';
  underlying: string;
  underlyingSymbol: string;
  strikePrice: number;
  expiration: number;
  premium: number; // USD paid
  quantity: number; // Number of contracts
  currentPrice?: number; // Current underlying price
  intrinsicValue?: number; // USD
  timeValue?: number; // USD
  profitLoss?: number; // USD
  profitLossPercent?: number;
  chainId: number;
  protocol: string;
  openedAt: number;
  status: 'open' | 'exercised' | 'expired' | 'closed';
}

export interface DerivativesPosition {
  id: string;
  type: 'future' | 'perpetual' | 'swap' | 'synthetic';
  underlying: string;
  underlyingSymbol: string;
  size: number; // Position size
  entryPrice: number;
  currentPrice?: number;
  leverage?: number;
  margin?: number; // USD
  liquidationPrice?: number;
  profitLoss?: number; // USD
  profitLossPercent?: number;
  chainId: number;
  protocol: string;
  openedAt: number;
  status: 'open' | 'closed' | 'liquidated';
}

export interface OptionsDerivativesDashboard {
  optionsPositions: OptionsPosition[];
  derivativesPositions: DerivativesPosition[];
  totalOptionsValue: number; // USD
  totalDerivativesValue: number; // USD
  totalProfitLoss: number; // USD
  totalProfitLossPercent: number;
  openPositions: number;
  expiredPositions: number;
  byProtocol: Record<string, number>;
  byUnderlying: Record<string, number>;
  riskMetrics: {
    totalExposure: number; // USD
    maxLeverage: number;
    averageLeverage: number;
    liquidationRisk: number; // 0-100
  };
}

export class OptionsDerivativesDashboard {
  private optionsPositions: Map<string, OptionsPosition> = new Map();
  private derivativesPositions: Map<string, DerivativesPosition> = new Map();

  /**
   * Add options position
   */
  addOptionsPosition(position: OptionsPosition): void {
    this.optionsPositions.set(position.id, position);
  }

  /**
   * Add derivatives position
   */
  addDerivativesPosition(position: DerivativesPosition): void {
    this.derivativesPositions.set(position.id, position);
  }

  /**
   * Update position prices
   */
  updatePrices(
    currentPrices: Map<string, number>
  ): void {
    // Update options positions
    this.optionsPositions.forEach(position => {
      if (position.status === 'open') {
        const currentPrice = currentPrices.get(position.underlying);
        if (currentPrice) {
          position.currentPrice = currentPrice;

          // Calculate intrinsic value
          if (position.type === 'call') {
            position.intrinsicValue = Math.max(0, currentPrice - position.strikePrice) * position.quantity;
          } else {
            position.intrinsicValue = Math.max(0, position.strikePrice - currentPrice) * position.quantity;
          }

          // Calculate time value (simplified)
          const timeToExpiry = (position.expiration - Date.now()) / (24 * 60 * 60 * 1000);
          position.timeValue = timeToExpiry > 0 ? position.premium - (position.intrinsicValue || 0) : 0;

          // Calculate P&L
          const currentValue = (position.intrinsicValue || 0) + (position.timeValue || 0);
          position.profitLoss = currentValue - position.premium;
          position.profitLossPercent = position.premium > 0
            ? (position.profitLoss || 0) / position.premium * 100
            : 0;

          // Check expiration
          if (position.expiration < Date.now()) {
            position.status = 'expired';
          }
        }
      }
    });

    // Update derivatives positions
    this.derivativesPositions.forEach(position => {
      if (position.status === 'open') {
        const currentPrice = currentPrices.get(position.underlying);
        if (currentPrice) {
          position.currentPrice = currentPrice;

          // Calculate P&L
          if (position.type === 'future' || position.type === 'perpetual') {
            const priceDiff = currentPrice - position.entryPrice;
            position.profitLoss = priceDiff * position.size;
            position.profitLossPercent = position.entryPrice > 0
              ? (priceDiff / position.entryPrice) * 100
              : 0;
          }

          // Calculate liquidation price (simplified)
          if (position.leverage && position.margin && position.entryPrice) {
            const liquidationThreshold = 0.9; // 90% of margin
            const priceMove = (position.margin * liquidationThreshold) / (position.size * position.leverage);
            position.liquidationPrice = position.entryPrice - priceMove;
          }
        }
      }
    });
  }

  /**
   * Get dashboard data
   */
  getDashboard(): OptionsDerivativesDashboard {
    const options = Array.from(this.optionsPositions.values());
    const derivatives = Array.from(this.derivativesPositions.values());

    const openOptions = options.filter(p => p.status === 'open');
    const openDerivatives = derivatives.filter(p => p.status === 'open');

    const totalOptionsValue = openOptions.reduce(
      (sum, p) => sum + ((p.intrinsicValue || 0) + (p.timeValue || 0)),
      0
    );

    const totalDerivativesValue = openDerivatives.reduce(
      (sum, p) => sum + (p.margin || 0),
      0
    );

    const totalProfitLoss = [
      ...openOptions.map(p => p.profitLoss || 0),
      ...openDerivatives.map(p => p.profitLoss || 0),
    ].reduce((sum, pnl) => sum + pnl, 0);

    const totalInvested = [
      ...openOptions.map(p => p.premium),
      ...openDerivatives.map(p => p.margin || 0),
    ].reduce((sum, inv) => sum + inv, 0);

    const totalProfitLossPercent = totalInvested > 0
      ? (totalProfitLoss / totalInvested) * 100
      : 0;

    // Count by protocol
    const byProtocol: Record<string, number> = {};
    [...options, ...derivatives].forEach(position => {
      byProtocol[position.protocol] = (byProtocol[position.protocol] || 0) + 1;
    });

    // Count by underlying
    const byUnderlying: Record<string, number> = {};
    [...options, ...derivatives].forEach(position => {
      byUnderlying[position.underlyingSymbol] = (byUnderlying[position.underlyingSymbol] || 0) + 1;
    });

    // Calculate risk metrics
    const totalExposure = openDerivatives.reduce(
      (sum, p) => sum + (p.size * (p.currentPrice || p.entryPrice)),
      0
    );

    const leverages = openDerivatives
      .map(p => p.leverage || 1)
      .filter(l => l > 0);

    const maxLeverage = leverages.length > 0 ? Math.max(...leverages) : 0;
    const averageLeverage = leverages.length > 0
      ? leverages.reduce((sum, l) => sum + l, 0) / leverages.length
      : 0;

    // Calculate liquidation risk
    let liquidationRisk = 0;
    openDerivatives.forEach(position => {
      if (position.liquidationPrice && position.currentPrice) {
        const distanceToLiquidation = Math.abs(
          (position.currentPrice - position.liquidationPrice) / position.currentPrice
        );
        if (distanceToLiquidation < 0.1) {
          liquidationRisk += 20; // High risk
        } else if (distanceToLiquidation < 0.2) {
          liquidationRisk += 10; // Medium risk
        }
      }
    });

    liquidationRisk = Math.min(100, liquidationRisk);

    return {
      optionsPositions: options,
      derivativesPositions: derivatives,
      totalOptionsValue,
      totalDerivativesValue,
      totalProfitLoss: Math.round(totalProfitLoss * 100) / 100,
      totalProfitLossPercent: Math.round(totalProfitLossPercent * 100) / 100,
      openPositions: openOptions.length + openDerivatives.length,
      expiredPositions: options.filter(p => p.status === 'expired').length,
      byProtocol,
      byUnderlying,
      riskMetrics: {
        totalExposure,
        maxLeverage: Math.round(maxLeverage * 100) / 100,
        averageLeverage: Math.round(averageLeverage * 100) / 100,
        liquidationRisk,
      },
    };
  }

  /**
   * Get positions by protocol
   */
  getPositionsByProtocol(protocol: string): {
    options: OptionsPosition[];
    derivatives: DerivativesPosition[];
  } {
    return {
      options: Array.from(this.optionsPositions.values()).filter(
        p => p.protocol === protocol
      ),
      derivatives: Array.from(this.derivativesPositions.values()).filter(
        p => p.protocol === protocol
      ),
    };
  }

  /**
   * Get positions by underlying
   */
  getPositionsByUnderlying(underlying: string): {
    options: OptionsPosition[];
    derivatives: DerivativesPosition[];
  } {
    return {
      options: Array.from(this.optionsPositions.values()).filter(
        p => p.underlying.toLowerCase() === underlying.toLowerCase()
      ),
      derivatives: Array.from(this.derivativesPositions.values()).filter(
        p => p.underlying.toLowerCase() === underlying.toLowerCase()
      ),
    };
  }

  /**
   * Clear all positions
   */
  clear(): void {
    this.optionsPositions.clear();
    this.derivativesPositions.clear();
  }
}

// Singleton instance
export const optionsDerivativesDashboard = new OptionsDerivativesDashboard();

