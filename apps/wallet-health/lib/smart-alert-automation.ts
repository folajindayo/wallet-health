/**
 * Smart Alert Automation Utility
 * Automated alert rules and notifications
 */

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  condition: AlertCondition;
  action: AlertAction;
  isActive: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  cooldown: number; // milliseconds
  lastTriggered?: number;
  triggerCount: number;
}

export interface AlertCondition {
  type: 'price_change' | 'balance_change' | 'approval_granted' | 'transaction_detected' | 'risk_score_change';
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'between';
  value: number | string | [number, number];
  token?: string;
  chainId?: number;
}

export interface AlertAction {
  type: 'notification' | 'email' | 'webhook' | 'sms';
  target: string; // Email, webhook URL, phone number, etc.
  message?: string; // Custom message template
}

export interface AlertTrigger {
  id: string;
  ruleId: string;
  timestamp: number;
  condition: AlertCondition;
  value: any; // Actual value that triggered
  action: AlertAction;
  status: 'pending' | 'sent' | 'failed';
}

export class SmartAlertAutomation {
  private rules: Map<string, AlertRule> = new Map();
  private triggers: AlertTrigger[] = [];

  /**
   * Create alert rule
   */
  createRule(rule: Omit<AlertRule, 'id' | 'triggerCount'>): AlertRule {
    const id = `rule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const fullRule: AlertRule = {
      ...rule,
      id,
      triggerCount: 0,
    };

    this.rules.set(id, fullRule);
    return fullRule;
  }

  /**
   * Get rule
   */
  getRule(id: string): AlertRule | null {
    return this.rules.get(id) || null;
  }

  /**
   * Get active rules
   */
  getActiveRules(): AlertRule[] {
    return Array.from(this.rules.values()).filter(r => r.isActive);
  }

  /**
   * Check conditions and trigger alerts
   */
  async checkConditions(
    data: {
      prices?: Map<string, number>;
      balances?: Map<string, string>;
      approvals?: Array<{ token: string; spender: string }>;
      transactions?: Array<{ hash: string; value: string }>;
      riskScore?: number;
    }
  ): Promise<AlertTrigger[]> {
    const triggers: AlertTrigger[] = [];
    const now = Date.now();

    this.rules.forEach(rule => {
      if (!rule.isActive) {
        return;
      }

      // Check cooldown
      if (rule.lastTriggered && now - rule.lastTriggered < rule.cooldown) {
        return;
      }

      // Check condition
      const shouldTrigger = this.evaluateCondition(rule.condition, data);

      if (shouldTrigger) {
        const trigger: AlertTrigger = {
          id: `trigger-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          ruleId: rule.id,
          timestamp: now,
          condition: rule.condition,
          value: this.getConditionValue(rule.condition, data),
          action: rule.action,
          status: 'pending',
        };

        triggers.push(trigger);
        this.triggers.push(trigger);

        // Update rule
        rule.lastTriggered = now;
        rule.triggerCount++;

        // Execute action
        this.executeAction(trigger);
      }
    });

    // Keep only last 10000 triggers
    if (this.triggers.length > 10000) {
      this.triggers = this.triggers.slice(-10000);
    }

    return triggers;
  }

  /**
   * Evaluate condition
   */
  private evaluateCondition(
    condition: AlertCondition,
    data: any
  ): boolean {
    const value = this.getConditionValue(condition, data);
    if (value === null || value === undefined) {
      return false;
    }

    switch (condition.operator) {
      case 'gt':
        return Number(value) > Number(condition.value);
      case 'lt':
        return Number(value) < Number(condition.value);
      case 'eq':
        return value === condition.value;
      case 'gte':
        return Number(value) >= Number(condition.value);
      case 'lte':
        return Number(value) <= Number(condition.value);
      case 'between':
        const [min, max] = condition.value as [number, number];
        return Number(value) >= min && Number(value) <= max;
      default:
        return false;
    }
  }

  /**
   * Get condition value from data
   */
  private getConditionValue(condition: AlertCondition, data: any): any {
    switch (condition.type) {
      case 'price_change':
        if (data.prices && condition.token) {
          return data.prices.get(condition.token) || 0;
        }
        return null;

      case 'balance_change':
        if (data.balances && condition.token) {
          return data.balances.get(condition.token) || '0';
        }
        return null;

      case 'risk_score_change':
        return data.riskScore || 0;

      default:
        return null;
    }
  }

  /**
   * Execute alert action
   */
  private async executeAction(trigger: AlertTrigger): Promise<void> {
    try {
      switch (trigger.action.type) {
        case 'notification':
          // In production, would send browser notification
          console.log(`Notification: ${trigger.action.message || 'Alert triggered'}`);
          break;

        case 'email':
          // In production, would send email
          console.log(`Email to ${trigger.action.target}: ${trigger.action.message}`);
          break;

        case 'webhook':
          // In production, would call webhook
          console.log(`Webhook to ${trigger.action.target}`);
          break;

        case 'sms':
          // In production, would send SMS
          console.log(`SMS to ${trigger.action.target}: ${trigger.action.message}`);
          break;
      }

      trigger.status = 'sent';
    } catch (error) {
      trigger.status = 'failed';
      console.error('Failed to execute alert action:', error);
    }
  }

  /**
   * Get trigger history
   */
  getTriggerHistory(ruleId?: string, limit = 50): AlertTrigger[] {
    let triggers = this.triggers;

    if (ruleId) {
      triggers = triggers.filter(t => t.ruleId === ruleId);
    }

    return triggers.slice(-limit).reverse();
  }

  /**
   * Delete rule
   */
  deleteRule(id: string): boolean {
    // Remove related triggers
    this.triggers = this.triggers.filter(t => t.ruleId !== id);
    return this.rules.delete(id);
  }

  /**
   * Enable/disable rule
   */
  toggleRule(id: string, isActive: boolean): boolean {
    const rule = this.rules.get(id);
    if (!rule) {
      return false;
    }

    rule.isActive = isActive;
    return true;
  }

  /**
   * Clear all rules
   */
  clear(): void {
    this.rules.clear();
    this.triggers = [];
  }
}

// Singleton instance
export const smartAlertAutomation = new SmartAlertAutomation();

