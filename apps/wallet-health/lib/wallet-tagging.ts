/**
 * Wallet Tagging System Utility
 * Tag and categorize wallets for better organization
 */

export interface WalletTag {
  id: string;
  name: string;
  color: string;
  description?: string;
  createdAt: number;
  usageCount: number;
}

export interface TaggedWallet {
  address: string;
  tags: string[]; // tag IDs
  notes?: string;
  category?: string;
  lastTagged: number;
}

export interface TagCategory {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

export class WalletTagging {
  private tags: Map<string, WalletTag> = new Map();
  private taggedWallets: Map<string, TaggedWallet> = new Map();
  private categories: Map<string, TagCategory> = new Map();

  /**
   * Create a new tag
   */
  createTag(tag: Omit<WalletTag, 'id' | 'createdAt' | 'usageCount'>): WalletTag {
    const newTag: WalletTag = {
      ...tag,
      id: `tag-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
      usageCount: 0,
    };

    this.tags.set(newTag.id, newTag);
    this.saveToStorage();
    return newTag;
  }

  /**
   * Get tag by ID
   */
  getTag(tagId: string): WalletTag | null {
    return this.tags.get(tagId) || null;
  }

  /**
   * Get all tags
   */
  getAllTags(): WalletTag[] {
    return Array.from(this.tags.values());
  }

  /**
   * Update tag
   */
  updateTag(tagId: string, updates: Partial<WalletTag>): WalletTag | null {
    const tag = this.tags.get(tagId);
    if (!tag) return null;

    const updated = { ...tag, ...updates };
    this.tags.set(tagId, updated);
    this.saveToStorage();
    return updated;
  }

  /**
   * Delete tag
   */
  deleteTag(tagId: string): boolean {
    const tag = this.tags.get(tagId);
    if (!tag) return false;

    // Remove tag from all wallets
    this.taggedWallets.forEach((wallet, address) => {
      const index = wallet.tags.indexOf(tagId);
      if (index > -1) {
        wallet.tags.splice(index, 1);
        if (wallet.tags.length === 0) {
          this.taggedWallets.delete(address);
        }
      }
    });

    this.tags.delete(tagId);
    this.saveToStorage();
    return true;
  }

  /**
   * Tag a wallet
   */
  tagWallet(address: string, tagIds: string[], notes?: string, category?: string): TaggedWallet {
    const addressLower = address.toLowerCase();
    const existing = this.taggedWallets.get(addressLower);

    // Increment usage count for tags
    tagIds.forEach(tagId => {
      const tag = this.tags.get(tagId);
      if (tag) {
        tag.usageCount++;
      }
    });

    const taggedWallet: TaggedWallet = {
      address: addressLower,
      tags: [...new Set(tagIds)], // Remove duplicates
      notes,
      category,
      lastTagged: Date.now(),
    };

    this.taggedWallets.set(addressLower, taggedWallet);
    this.saveToStorage();
    return taggedWallet;
  }

  /**
   * Remove tag from wallet
   */
  removeTagFromWallet(address: string, tagId: string): boolean {
    const addressLower = address.toLowerCase();
    const wallet = this.taggedWallets.get(addressLower);
    if (!wallet) return false;

    const index = wallet.tags.indexOf(tagId);
    if (index > -1) {
      wallet.tags.splice(index, 1);
      
      // Decrement usage count
      const tag = this.tags.get(tagId);
      if (tag) {
        tag.usageCount = Math.max(0, tag.usageCount - 1);
      }

      // Remove wallet if no tags left
      if (wallet.tags.length === 0) {
        this.taggedWallets.delete(addressLower);
      } else {
        this.taggedWallets.set(addressLower, wallet);
      }

      this.saveToStorage();
      return true;
    }

    return false;
  }

  /**
   * Get tagged wallet
   */
  getTaggedWallet(address: string): TaggedWallet | null {
    return this.taggedWallets.get(address.toLowerCase()) || null;
  }

  /**
   * Get wallets by tag
   */
  getWalletsByTag(tagId: string): TaggedWallet[] {
    return Array.from(this.taggedWallets.values()).filter(
      wallet => wallet.tags.includes(tagId)
    );
  }

  /**
   * Get wallets by category
   */
  getWalletsByCategory(category: string): TaggedWallet[] {
    return Array.from(this.taggedWallets.values()).filter(
      wallet => wallet.category === category
    );
  }

  /**
   * Search tags
   */
  searchTags(query: string): WalletTag[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.tags.values()).filter(
      tag =>
        tag.name.toLowerCase().includes(lowerQuery) ||
        tag.description?.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Create category
   */
  createCategory(category: Omit<TagCategory, 'id'>): TagCategory {
    const newCategory: TagCategory = {
      ...category,
      id: `category-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    this.categories.set(newCategory.id, newCategory);
    this.saveToStorage();
    return newCategory;
  }

  /**
   * Get all categories
   */
  getAllCategories(): TagCategory[] {
    return Array.from(this.categories.values());
  }

  /**
   * Get tag statistics
   */
  getTagStats(): {
    totalTags: number;
    totalTaggedWallets: number;
    mostUsedTags: Array<{ tag: WalletTag; count: number }>;
    tagsByCategory: Record<string, number>;
  } {
    const mostUsedTags = Array.from(this.tags.values())
      .map(tag => ({ tag, count: tag.usageCount }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const tagsByCategory: Record<string, number> = {};
    this.taggedWallets.forEach(wallet => {
      if (wallet.category) {
        tagsByCategory[wallet.category] = (tagsByCategory[wallet.category] || 0) + 1;
      }
    });

    return {
      totalTags: this.tags.size,
      totalTaggedWallets: this.taggedWallets.size,
      mostUsedTags,
      tagsByCategory,
    };
  }

  /**
   * Export tags and tagged wallets
   */
  exportData(): string {
    return JSON.stringify({
      tags: Array.from(this.tags.values()),
      taggedWallets: Array.from(this.taggedWallets.values()),
      categories: Array.from(this.categories.values()),
      exportDate: new Date().toISOString(),
    }, null, 2);
  }

  /**
   * Import tags and tagged wallets
   */
  importData(data: {
    tags: WalletTag[];
    taggedWallets?: TaggedWallet[];
    categories?: TagCategory[];
  }): void {
    if (data.tags) {
      data.tags.forEach(tag => {
        this.tags.set(tag.id, tag);
      });
    }

    if (data.taggedWallets) {
      data.taggedWallets.forEach(wallet => {
        this.taggedWallets.set(wallet.address.toLowerCase(), wallet);
      });
    }

    if (data.categories) {
      data.categories.forEach(category => {
        this.categories.set(category.id, category);
      });
    }

    this.saveToStorage();
  }

  /**
   * Save to localStorage
   */
  private saveToStorage(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          'wallet-health-tags',
          JSON.stringify({
            tags: Array.from(this.tags.values()),
            taggedWallets: Array.from(this.taggedWallets.values()),
            categories: Array.from(this.categories.values()),
          })
        );
      } catch (error) {
        console.error('Failed to save tags to storage:', error);
      }
    }
  }

  /**
   * Load from localStorage
   */
  loadFromStorage(): void {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('wallet-health-tags');
        if (stored) {
          const data = JSON.parse(stored);
          if (data.tags) {
            data.tags.forEach((tag: WalletTag) => {
              this.tags.set(tag.id, tag);
            });
          }
          if (data.taggedWallets) {
            data.taggedWallets.forEach((wallet: TaggedWallet) => {
              this.taggedWallets.set(wallet.address.toLowerCase(), wallet);
            });
          }
          if (data.categories) {
            data.categories.forEach((category: TagCategory) => {
              this.categories.set(category.id, category);
            });
          }
        }
      } catch (error) {
        console.error('Failed to load tags from storage:', error);
      }
    }
  }
}

// Singleton instance
export const walletTagging = new WalletTagging();

// Initialize from storage if available
if (typeof window !== 'undefined') {
  walletTagging.loadFromStorage();
}

