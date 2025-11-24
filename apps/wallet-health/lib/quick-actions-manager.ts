/**
 * Quick Actions Manager Utility
 * Manages quick action shortcuts for common operations
 */

export interface QuickAction {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'security' | 'trading' | 'defi' | 'utility' | 'analytics';
  action: () => void | Promise<void>;
  shortcut?: string; // Keyboard shortcut
  requiresConnection: boolean;
  requiresApproval?: boolean;
  badge?: string; // Badge text (e.g., "New", "Beta")
}

export interface QuickActionGroup {
  id: string;
  name: string;
  actions: QuickAction[];
  icon?: string;
}

export interface QuickActionStats {
  totalActions: number;
  byCategory: Record<string, number>;
  mostUsed: QuickAction[];
  recentActions: QuickAction[];
}

export class QuickActionsManager {
  private actions: Map<string, QuickAction> = new Map();
  private actionHistory: Array<{ actionId: string; timestamp: number }> = [];
  private groups: Map<string, QuickActionGroup> = new Map();

  /**
   * Register quick action
   */
  registerAction(action: QuickAction): void {
    this.actions.set(action.id, action);
  }

  /**
   * Get action
   */
  getAction(id: string): QuickAction | null {
    return this.actions.get(id) || null;
  }

  /**
   * Execute action
   */
  async executeAction(id: string): Promise<boolean> {
    const action = this.actions.get(id);
    if (!action) {
      return false;
    }

    try {
      await action.action();
      
      // Record usage
      this.actionHistory.push({
        actionId: id,
        timestamp: Date.now(),
      });

      // Keep only last 1000 actions
      if (this.actionHistory.length > 1000) {
        this.actionHistory = this.actionHistory.slice(-1000);
      }

      return true;
    } catch (error) {
      console.error(`Failed to execute action ${id}:`, error);
      return false;
    }
  }

  /**
   * Get actions by category
   */
  getActionsByCategory(category: QuickAction['category']): QuickAction[] {
    return Array.from(this.actions.values())
      .filter(a => a.category === category)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Get all actions
   */
  getAllActions(): QuickAction[] {
    return Array.from(this.actions.values());
  }

  /**
   * Create action group
   */
  createGroup(group: QuickActionGroup): void {
    this.groups.set(group.id, group);
  }

  /**
   * Get group
   */
  getGroup(id: string): QuickActionGroup | null {
    return this.groups.get(id) || null;
  }

  /**
   * Get statistics
   */
  getStats(): QuickActionStats {
    const byCategory: Record<string, number> = {};
    this.actions.forEach(action => {
      byCategory[action.category] = (byCategory[action.category] || 0) + 1;
    });

    // Get most used actions
    const actionCounts = new Map<string, number>();
    this.actionHistory.forEach(entry => {
      actionCounts.set(entry.actionId, (actionCounts.get(entry.actionId) || 0) + 1);
    });

    const mostUsed = Array.from(actionCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([id]) => this.actions.get(id))
      .filter((a): a is QuickAction => a !== null);

    // Get recent actions
    const recentActionIds = this.actionHistory
      .slice(-10)
      .reverse()
      .map(e => e.actionId);

    const recentActions = recentActionIds
      .map(id => this.actions.get(id))
      .filter((a): a is QuickAction => a !== null);

    return {
      totalActions: this.actions.size,
      byCategory,
      mostUsed,
      recentActions,
    };
  }

  /**
   * Search actions
   */
  searchActions(query: string): QuickAction[] {
    const queryLower = query.toLowerCase();
    return Array.from(this.actions.values()).filter(
      action =>
        action.name.toLowerCase().includes(queryLower) ||
        action.description.toLowerCase().includes(queryLower) ||
        action.category.toLowerCase().includes(queryLower)
    );
  }

  /**
   * Initialize default actions
   */
  initializeDefaultActions(): void {
    // Security actions
    this.registerAction({
      id: 'scan-wallet',
      name: 'Scan Wallet',
      description: 'Perform security scan',
      icon: 'Shield',
      category: 'security',
      action: async () => {
        // Would trigger wallet scan
        console.log('Scanning wallet...');
      },
      requiresConnection: true,
    });

    this.registerAction({
      id: 'revoke-approvals',
      name: 'Revoke Approvals',
      description: 'Revoke risky token approvals',
      icon: 'X',
      category: 'security',
      action: async () => {
        // Would open approval revoker
        console.log('Opening approval revoker...');
      },
      requiresConnection: true,
      requiresApproval: true,
    });

    // Trading actions
    this.registerAction({
      id: 'swap-tokens',
      name: 'Swap Tokens',
      description: 'Quick token swap',
      icon: 'ArrowLeftRight',
      category: 'trading',
      action: async () => {
        // Would open swap interface
        console.log('Opening swap...');
      },
      requiresConnection: true,
    });

    // Analytics actions
    this.registerAction({
      id: 'view-portfolio',
      name: 'View Portfolio',
      description: 'View portfolio analytics',
      icon: 'BarChart',
      category: 'analytics',
      action: async () => {
        // Would navigate to portfolio
        console.log('Opening portfolio...');
      },
      requiresConnection: true,
    });
  }

  /**
   * Clear action history
   */
  clearHistory(): void {
    this.actionHistory = [];
  }
}

// Singleton instance
export const quickActionsManager = new QuickActionsManager();

