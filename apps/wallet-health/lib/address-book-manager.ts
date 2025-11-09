/**
 * Address Book Manager Utility
 * Manages frequently used addresses and contacts
 */

export interface AddressBookEntry {
  id: string;
  address: string;
  label: string;
  chainId?: number; // If specific to a chain
  tags: string[];
  notes?: string;
  createdAt: number;
  lastUsed?: number;
  useCount: number;
  verified: boolean;
  ensName?: string;
  metadata?: {
    type?: 'wallet' | 'contract' | 'exchange' | 'service';
    website?: string;
    twitter?: string;
  };
}

export interface AddressBookGroup {
  id: string;
  name: string;
  description?: string;
  addresses: string[]; // Entry IDs
  color?: string;
  createdAt: number;
}

export interface AddressBookStats {
  totalEntries: number;
  totalGroups: number;
  verifiedEntries: number;
  mostUsed: AddressBookEntry[];
  recentEntries: AddressBookEntry[];
  byChain: Record<number, number>;
  byTag: Record<string, number>;
}

export class AddressBookManager {
  private entries: Map<string, AddressBookEntry> = new Map();
  private groups: Map<string, AddressBookGroup> = new Map();

  /**
   * Add address entry
   */
  addEntry(entry: Omit<AddressBookEntry, 'id' | 'createdAt' | 'useCount'>): AddressBookEntry {
    const id = `entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const fullEntry: AddressBookEntry = {
      ...entry,
      id,
      createdAt: Date.now(),
      useCount: 0,
    };

    this.entries.set(id, fullEntry);
    return fullEntry;
  }

  /**
   * Get entry
   */
  getEntry(id: string): AddressBookEntry | null {
    return this.entries.get(id) || null;
  }

  /**
   * Get entry by address
   */
  getEntryByAddress(address: string, chainId?: number): AddressBookEntry | null {
    for (const entry of this.entries.values()) {
      if (
        entry.address.toLowerCase() === address.toLowerCase() &&
        (!chainId || !entry.chainId || entry.chainId === chainId)
      ) {
        return entry;
      }
    }
    return null;
  }

  /**
   * Update entry
   */
  updateEntry(id: string, updates: Partial<AddressBookEntry>): boolean {
    const entry = this.entries.get(id);
    if (!entry) {
      return false;
    }

    Object.assign(entry, updates);
    return true;
  }

  /**
   * Delete entry
   */
  deleteEntry(id: string): boolean {
    // Remove from groups
    this.groups.forEach(group => {
      group.addresses = group.addresses.filter(addrId => addrId !== id);
    });

    return this.entries.delete(id);
  }

  /**
   * Record address usage
   */
  recordUsage(address: string, chainId?: number): void {
    const entry = this.getEntryByAddress(address, chainId);
    if (entry) {
      entry.useCount++;
      entry.lastUsed = Date.now();
    }
  }

  /**
   * Create group
   */
  createGroup(group: Omit<AddressBookGroup, 'id' | 'createdAt'>): AddressBookGroup {
    const id = `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const fullGroup: AddressBookGroup = {
      ...group,
      id,
      createdAt: Date.now(),
    };

    this.groups.set(id, fullGroup);
    return fullGroup;
  }

  /**
   * Get group
   */
  getGroup(id: string): AddressBookGroup | null {
    return this.groups.get(id) || null;
  }

  /**
   * Add entry to group
   */
  addEntryToGroup(groupId: string, entryId: string): boolean {
    const group = this.groups.get(groupId);
    const entry = this.entries.get(entryId);

    if (!group || !entry) {
      return false;
    }

    if (!group.addresses.includes(entryId)) {
      group.addresses.push(entryId);
    }

    return true;
  }

  /**
   * Remove entry from group
   */
  removeEntryFromGroup(groupId: string, entryId: string): boolean {
    const group = this.groups.get(groupId);
    if (!group) {
      return false;
    }

    group.addresses = group.addresses.filter(id => id !== entryId);
    return true;
  }

  /**
   * Search entries
   */
  searchEntries(query: string): AddressBookEntry[] {
    const queryLower = query.toLowerCase();
    const results: AddressBookEntry[] = [];

    this.entries.forEach(entry => {
      if (
        entry.label.toLowerCase().includes(queryLower) ||
        entry.address.toLowerCase().includes(queryLower) ||
        entry.ensName?.toLowerCase().includes(queryLower) ||
        entry.tags.some(tag => tag.toLowerCase().includes(queryLower)) ||
        entry.notes?.toLowerCase().includes(queryLower)
      ) {
        results.push(entry);
      }
    });

    return results.sort((a, b) => b.useCount - a.useCount);
  }

  /**
   * Get entries by tag
   */
  getEntriesByTag(tag: string): AddressBookEntry[] {
    const results: AddressBookEntry[] = [];

    this.entries.forEach(entry => {
      if (entry.tags.includes(tag)) {
        results.push(entry);
      }
    });

    return results;
  }

  /**
   * Get entries by chain
   */
  getEntriesByChain(chainId: number): AddressBookEntry[] {
    const results: AddressBookEntry[] = [];

    this.entries.forEach(entry => {
      if (!entry.chainId || entry.chainId === chainId) {
        results.push(entry);
      }
    });

    return results;
  }

  /**
   * Get statistics
   */
  getStats(): AddressBookStats {
    const entries = Array.from(this.entries.values());
    const verifiedEntries = entries.filter(e => e.verified).length;

    // Most used entries
    const mostUsed = [...entries]
      .sort((a, b) => b.useCount - a.useCount)
      .slice(0, 10);

    // Recent entries
    const recentEntries = [...entries]
      .sort((a, b) => (b.lastUsed || b.createdAt) - (a.lastUsed || a.createdAt))
      .slice(0, 10);

    // Count by chain
    const byChain: Record<number, number> = {};
    entries.forEach(entry => {
      const chainId = entry.chainId || 0; // 0 = all chains
      byChain[chainId] = (byChain[chainId] || 0) + 1;
    });

    // Count by tag
    const byTag: Record<string, number> = {};
    entries.forEach(entry => {
      entry.tags.forEach(tag => {
        byTag[tag] = (byTag[tag] || 0) + 1;
      });
    });

    return {
      totalEntries: entries.length,
      totalGroups: this.groups.size,
      verifiedEntries,
      mostUsed,
      recentEntries,
      byChain,
      byTag,
    };
  }

  /**
   * Export address book
   */
  exportAddressBook(): {
    entries: AddressBookEntry[];
    groups: AddressBookGroup[];
    exportedAt: number;
  } {
    return {
      entries: Array.from(this.entries.values()),
      groups: Array.from(this.groups.values()),
      exportedAt: Date.now(),
    };
  }

  /**
   * Import address book
   */
  importAddressBook(data: {
    entries: AddressBookEntry[];
    groups: AddressBookGroup[];
  }): void {
    data.entries.forEach(entry => {
      this.entries.set(entry.id, entry);
    });

    data.groups.forEach(group => {
      this.groups.set(group.id, group);
    });
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.entries.clear();
    this.groups.clear();
  }
}

// Singleton instance
export const addressBookManager = new AddressBookManager();

