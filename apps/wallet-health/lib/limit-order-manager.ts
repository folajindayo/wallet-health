/**
 * Limit Order Manager Utility
 * Manages limit orders for token swaps
 */

export interface LimitOrder {
  id: string;
  tokenIn: string;
  tokenInSymbol: string;
  tokenOut: string;
  tokenOutSymbol: string;
  amountIn: string;
  limitPrice: number; // Price in USD
  chainId: number;
  protocol: string; // DEX protocol
  status: 'pending' | 'filled' | 'cancelled' | 'expired';
  createdAt: number;
  expiresAt?: number;
  filledAt?: number;
  filledPrice?: number;
  filledAmount?: string;
  transactionHash?: string;
  gasEstimate?: number;
}

export interface LimitOrderStats {
  totalOrders: number;
  pendingOrders: number;
  filledOrders: number;
  cancelledOrders: number;
  totalVolumeUSD: number;
  averageFillPrice: number;
  fillRate: number; // Percentage
  bestFill: LimitOrder | null;
}

export class LimitOrderManager {
  private orders: Map<string, LimitOrder> = new Map();

  /**
   * Create limit order
   */
  createOrder(order: Omit<LimitOrder, 'id' | 'status' | 'createdAt'>): LimitOrder {
    const id = `limit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const fullOrder: LimitOrder = {
      ...order,
      id,
      status: 'pending',
      createdAt: Date.now(),
    };

    this.orders.set(id, fullOrder);
    return fullOrder;
  }

  /**
   * Get order
   */
  getOrder(id: string): LimitOrder | null {
    return this.orders.get(id) || null;
  }

  /**
   * Get pending orders
   */
  getPendingOrders(): LimitOrder[] {
    return Array.from(this.orders.values())
      .filter(o => o.status === 'pending')
      .sort((a, b) => a.createdAt - b.createdAt);
  }

  /**
   * Check and fill orders based on current price
   */
  checkOrders(currentPrices: Map<string, number>): LimitOrder[] {
    const filledOrders: LimitOrder[] = [];
    const now = Date.now();

    this.orders.forEach(order => {
      if (order.status !== 'pending') {
        return;
      }

      // Check expiration
      if (order.expiresAt && now > order.expiresAt) {
        order.status = 'expired';
        return;
      }

      // Check if price condition is met
      const currentPrice = currentPrices.get(order.tokenOut);
      if (currentPrice && currentPrice <= order.limitPrice) {
        order.status = 'filled';
        order.filledAt = now;
        order.filledPrice = currentPrice;
        order.filledAmount = order.amountIn; // Simplified
        filledOrders.push(order);
      }
    });

    return filledOrders;
  }

  /**
   * Cancel order
   */
  cancelOrder(id: string): boolean {
    const order = this.orders.get(id);
    if (!order || order.status !== 'pending') {
      return false;
    }

    order.status = 'cancelled';
    return true;
  }

  /**
   * Get statistics
   */
  getStats(): LimitOrderStats {
    const orders = Array.from(this.orders.values());
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const filledOrders = orders.filter(o => o.status === 'filled');
    const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;

    const totalVolumeUSD = filledOrders.reduce((sum, o) => {
      return sum + parseFloat(o.amountIn) * (o.filledPrice || 0);
    }, 0);

    const averageFillPrice = filledOrders.length > 0
      ? filledOrders.reduce((sum, o) => sum + (o.filledPrice || 0), 0) / filledOrders.length
      : 0;

    const fillRate = orders.length > 0
      ? (filledOrders.length / orders.length) * 100
      : 0;

    // Find best fill (closest to limit price)
    const bestFill = filledOrders.length > 0
      ? filledOrders.reduce((best, current) => {
          const bestDiff = Math.abs((best.filledPrice || 0) - best.limitPrice);
          const currentDiff = Math.abs((current.filledPrice || 0) - current.limitPrice);
          return currentDiff < bestDiff ? current : best;
        })
      : null;

    return {
      totalOrders: orders.length,
      pendingOrders,
      filledOrders: filledOrders.length,
      cancelledOrders,
      totalVolumeUSD,
      averageFillPrice: Math.round(averageFillPrice * 100) / 100,
      fillRate: Math.round(fillRate * 100) / 100,
      bestFill,
    };
  }

  /**
   * Get orders by token pair
   */
  getOrdersByPair(tokenIn: string, tokenOut: string): LimitOrder[] {
    return Array.from(this.orders.values()).filter(
      o => o.tokenIn.toLowerCase() === tokenIn.toLowerCase() &&
           o.tokenOut.toLowerCase() === tokenOut.toLowerCase()
    );
  }

  /**
   * Get orders by status
   */
  getOrdersByStatus(status: LimitOrder['status']): LimitOrder[] {
    return Array.from(this.orders.values())
      .filter(o => o.status === status)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  /**
   * Clear expired orders
   */
  clearExpiredOrders(): number {
    const now = Date.now();
    let cleared = 0;

    this.orders.forEach(order => {
      if (order.status === 'pending' && order.expiresAt && now > order.expiresAt) {
        order.status = 'expired';
        cleared++;
      }
    });

    return cleared;
  }

  /**
   * Clear all orders
   */
  clear(): void {
    this.orders.clear();
  }
}

// Singleton instance
export const limitOrderManager = new LimitOrderManager();

