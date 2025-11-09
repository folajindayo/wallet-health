/**
 * Recurring Payments Manager Utility
 * Manages recurring crypto payments and subscriptions
 */

export interface RecurringPayment {
  id: string;
  name: string;
  from: string;
  to: string;
  token: string;
  tokenSymbol: string;
  amount: string;
  amountUSD?: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  customInterval?: number; // days
  startDate: number;
  endDate?: number;
  nextPayment: number;
  totalPayments: number;
  completedPayments: number;
  chainId: number;
  isActive: boolean;
  description?: string;
  category?: string;
}

export interface PaymentExecution {
  id: string;
  paymentId: string;
  timestamp: number;
  amount: string;
  transactionHash?: string;
  status: 'pending' | 'completed' | 'failed';
  gasUsed?: number;
  gasCost?: number; // USD
}

export interface RecurringPaymentStats {
  totalPayments: number;
  activePayments: number;
  totalAmountUSD: number;
  upcomingPayments: RecurringPayment[];
  overduePayments: RecurringPayment[];
  byCategory: Record<string, number>;
}

export class RecurringPaymentsManager {
  private payments: Map<string, RecurringPayment> = new Map();
  private executions: Map<string, PaymentExecution> = new Map();

  /**
   * Create recurring payment
   */
  createPayment(payment: Omit<RecurringPayment, 'id' | 'totalPayments' | 'completedPayments' | 'nextPayment'>): RecurringPayment {
    const id = `recurring-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const nextPayment = this.calculateNextPayment(
      payment.startDate,
      payment.frequency,
      payment.customInterval
    );

    const fullPayment: RecurringPayment = {
      ...payment,
      id,
      totalPayments: 0,
      completedPayments: 0,
      nextPayment,
    };

    this.payments.set(id, fullPayment);
    return fullPayment;
  }

  /**
   * Calculate next payment date
   */
  private calculateNextPayment(
    startDate: number,
    frequency: RecurringPayment['frequency'],
    customInterval?: number
  ): number {
    const now = Date.now();
    if (now < startDate) {
      return startDate;
    }

    let intervalMs: number;
    if (frequency === 'custom' && customInterval) {
      intervalMs = customInterval * 24 * 60 * 60 * 1000;
    } else {
      intervalMs = {
        daily: 24 * 60 * 60 * 1000,
        weekly: 7 * 24 * 60 * 60 * 1000,
        monthly: 30 * 24 * 60 * 60 * 1000,
        yearly: 365 * 24 * 60 * 60 * 1000,
        custom: customInterval ? customInterval * 24 * 60 * 60 * 1000 : 0,
      }[frequency];
    }

    const periodsElapsed = Math.floor((now - startDate) / intervalMs);
    return startDate + (periodsElapsed + 1) * intervalMs;
  }

  /**
   * Record payment execution
   */
  recordExecution(execution: PaymentExecution): void {
    this.executions.set(execution.id, execution);

    const payment = this.payments.get(execution.paymentId);
    if (payment) {
      if (execution.status === 'completed') {
        payment.completedPayments++;
        payment.totalPayments++;
        payment.nextPayment = this.calculateNextPayment(
          payment.startDate,
          payment.frequency,
          payment.customInterval
        );
      }
    }
  }

  /**
   * Get payment
   */
  getPayment(id: string): RecurringPayment | null {
    return this.payments.get(id) || null;
  }

  /**
   * Get upcoming payments
   */
  getUpcomingPayments(days = 7): RecurringPayment[] {
    const now = Date.now();
    const cutoff = now + days * 24 * 60 * 60 * 1000;

    return Array.from(this.payments.values())
      .filter(p => p.isActive && p.nextPayment >= now && p.nextPayment <= cutoff)
      .sort((a, b) => a.nextPayment - b.nextPayment);
  }

  /**
   * Get overdue payments
   */
  getOverduePayments(): RecurringPayment[] {
    const now = Date.now();

    return Array.from(this.payments.values())
      .filter(p => p.isActive && p.nextPayment < now)
      .sort((a, b) => a.nextPayment - b.nextPayment);
  }

  /**
   * Get statistics
   */
  getStats(): RecurringPaymentStats {
    const payments = Array.from(this.payments.values());
    const activePayments = payments.filter(p => p.isActive).length;
    
    const totalAmountUSD = payments.reduce((sum, p) => sum + (p.amountUSD || 0), 0);

    const upcomingPayments = this.getUpcomingPayments(30);
    const overduePayments = this.getOverduePayments();

    // Count by category
    const byCategory: Record<string, number> = {};
    payments.forEach(payment => {
      const category = payment.category || 'uncategorized';
      byCategory[category] = (byCategory[category] || 0) + (payment.amountUSD || 0);
    });

    return {
      totalPayments: payments.length,
      activePayments,
      totalAmountUSD,
      upcomingPayments,
      overduePayments,
      byCategory,
    };
  }

  /**
   * Pause payment
   */
  pausePayment(id: string): boolean {
    const payment = this.payments.get(id);
    if (!payment) {
      return false;
    }

    payment.isActive = false;
    return true;
  }

  /**
   * Resume payment
   */
  resumePayment(id: string): boolean {
    const payment = this.payments.get(id);
    if (!payment) {
      return false;
    }

    payment.isActive = true;
    payment.nextPayment = this.calculateNextPayment(
      payment.startDate,
      payment.frequency,
      payment.customInterval
    );
    return true;
  }

  /**
   * Delete payment
   */
  deletePayment(id: string): boolean {
    // Remove related executions
    const executionIds: string[] = [];
    this.executions.forEach((execution, execId) => {
      if (execution.paymentId === id) {
        executionIds.push(execId);
      }
    });

    executionIds.forEach(execId => this.executions.delete(execId));

    return this.payments.delete(id);
  }

  /**
   * Get payment executions
   */
  getPaymentExecutions(paymentId: string): PaymentExecution[] {
    return Array.from(this.executions.values())
      .filter(e => e.paymentId === paymentId)
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.payments.clear();
    this.executions.clear();
  }
}

// Singleton instance
export const recurringPaymentsManager = new RecurringPaymentsManager();

