/**
 * Wallet Tagging System
 * Tag and categorize wallets for better organization
 */

export interface WalletTag {
  id: string;
  name: string;
  color: string;
  description?: string;
  category?: string;
  createdAt: number;
}

export interface WalletTagAssignment {
  walletAddress: string;
  tagId: string;
  assignedAt: number;
  assignedBy?: string;
  notes?: string;
}

export interface TaggedWallet {
  address: string;
  tags: WalletTag[];
  primaryTag?: WalletTag;
  metadata?: Record<string, any>;
}

export interface TagStatistics {
  tag: WalletTag;
  walletCount: number;
  wallets: string[];
}

export class WalletTagging {
  private tags: Map<string, WalletTag> = new Map(); // tagId -> tag
  private assignments: Map<string, WalletTagAssignment[]> = new Map(); // wallet -> assignments

  /**
   * Create a tag
   */
  createTag(tag: Omit<WalletTag, 'id' | 'createdAt'>): WalletTag {
    const now = Date.now();
    const fullTag: WalletTag = {
      ...tag,
      id: `tag_${now}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: now,
    };

    this.tags.set(fullTag.id, fullTag);
    return fullTag;
  }

  /**
   * Get tag
   */
  getTag(tagId: string): WalletTag | null {
    return this.tags.get(tagId) || null;
  }

  /**
   * Update tag
   */
  updateTag(tagId: string, updates: Partial<Omit<WalletTag, 'id' | 'createdAt'>>): boolean {
    const tag = this.tags.get(tagId);
    if (!tag) return false;

    Object.assign(tag, updates);
    return true;
  }

  /**
   * Delete tag
   */
  deleteTag(tagId: string): boolean {
    // Remove all assignments
    this.assignments.forEach((assignments, wallet) => {
      this.assignments.set(
        wallet,
        assignments.filter(a => a.tagId !== tagId)
      );
    });

    return this.tags.delete(tagId);
  }

  /**
   * Assign tag to wallet
   */
  assignTag(
    walletAddress: string,
    tagId: string,
    notes?: string
  ): boolean {
    if (!this.tags.has(tagId)) return false;

    const walletKey = walletAddress.toLowerCase();
    if (!this.assignments.has(walletKey)) {
      this.assignments.set(walletKey, []);
    }

    const assignments = this.assignments.get(walletKey)!;
    
    // Check if already assigned
    if (assignments.some(a => a.tagId === tagId)) {
      return false;
    }

    assignments.push({
      walletAddress: walletKey,
      tagId,
      assignedAt: Date.now(),
      notes,
    });

    return true;
  }

  /**
   * Remove tag from wallet
   */
  removeTag(walletAddress: string, tagId: string): boolean {
    const walletKey = walletAddress.toLowerCase();
    const assignments = this.assignments.get(walletKey);
    if (!assignments) return false;

    const before = assignments.length;
    this.assignments.set(
      walletKey,
      assignments.filter(a => a.tagId !== tagId)
    );

    return assignments.length < before;
  }

  /**
   * Get tags for wallet
   */
  getWalletTags(walletAddress: string): WalletTag[] {
    const walletKey = walletAddress.toLowerCase();
    const assignments = this.assignments.get(walletKey) || [];
    
    return assignments
      .map(a => this.tags.get(a.tagId))
      .filter((tag): tag is WalletTag => tag !== undefined);
  }

  /**
   * Get tagged wallet info
   */
  getTaggedWallet(walletAddress: string): TaggedWallet | null {
    const tags = this.getWalletTags(walletAddress);
    if (tags.length === 0) return null;

    return {
      address: walletAddress,
      tags,
      primaryTag: tags[0], // First tag as primary
    };
  }

  /**
   * Get wallets by tag
   */
  getWalletsByTag(tagId: string): string[] {
    const wallets: string[] = [];

    this.assignments.forEach((assignments, wallet) => {
      if (assignments.some(a => a.tagId === tagId)) {
        wallets.push(wallet);
      }
    });

    return wallets;
  }

  /**
   * Get all tags
   */
  getAllTags(): WalletTag[] {
    return Array.from(this.tags.values());
  }

  /**
   * Search tags
   */
  searchTags(query: {
    name?: string;
    category?: string;
  }): WalletTag[] {
    let tags = Array.from(this.tags.values());

    if (query.name) {
      const nameLower = query.name.toLowerCase();
      tags = tags.filter(t => t.name.toLowerCase().includes(nameLower));
    }

    if (query.category) {
      tags = tags.filter(t => t.category === query.category);
    }

    return tags;
  }

  /**
   * Get tag statistics
   */
  getTagStatistics(tagId: string): TagStatistics | null {
    const tag = this.tags.get(tagId);
    if (!tag) return null;

    const wallets = this.getWalletsByTag(tagId);

    return {
      tag,
      walletCount: wallets.length,
      wallets,
    };
  }

  /**
   * Get all tag statistics
   */
  getAllTagStatistics(): TagStatistics[] {
    return Array.from(this.tags.keys())
      .map(tagId => this.getTagStatistics(tagId))
      .filter((stats): stats is TagStatistics => stats !== null)
      .sort((a, b) => b.walletCount - a.walletCount);
  }

  /**
   * Get wallets by multiple tags (AND/OR logic)
   */
  getWalletsByTags(
    tagIds: string[],
    logic: 'AND' | 'OR' = 'OR'
  ): string[] {
    if (tagIds.length === 0) return [];

    if (logic === 'OR') {
      const walletSet = new Set<string>();
      tagIds.forEach(tagId => {
        this.getWalletsByTag(tagId).forEach(wallet => walletSet.add(wallet));
      });
      return Array.from(walletSet);
    } else {
      // AND logic - wallet must have all tags
      if (tagIds.length === 0) return [];

      let wallets = this.getWalletsByTag(tagIds[0]);
      
      for (let i = 1; i < tagIds.length; i++) {
        const tagWallets = new Set(this.getWalletsByTag(tagIds[i]));
        wallets = wallets.filter(w => tagWallets.has(w));
      }

      return wallets;
    }
  }

  /**
   * Bulk assign tag
   */
  bulkAssignTag(walletAddresses: string[], tagId: string): {
    successful: number;
    failed: number;
  } {
    let successful = 0;
    let failed = 0;

    walletAddresses.forEach(address => {
      if (this.assignTag(address, tagId)) {
        successful++;
      } else {
        failed++;
      }
    });

    return { successful, failed };
  }
}

// Singleton instance
export const walletTagging = new WalletTagging();
