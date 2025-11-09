/**
 * Address Book Manager Utility
 * Manage saved addresses with labels and notes
 */

export interface SavedAddress {
  address: string;
  label: string;
  notes?: string;
  tags?: string[];
  chainId?: number;
  addedAt: number;
  lastUsed?: number;
  useCount: number;
  isVerified?: boolean;
  verificationSource?: string; // e.g., 'ens', 'contract', 'manual'
}

export interface AddressGroup {
  id: string;
  name: string;
  color?: string;
  addresses: string[];
  createdAt: number;
}

export class AddressBook {
  private addresses: Map<string, SavedAddress> = new Map();
  private groups: Map<string, AddressGroup> = new Map();

  /**
   * Add address to address book
   */
  addAddress(address: Omit<SavedAddress, 'addedAt' | 'useCount'>): SavedAddress {
    const addressLower = address.address.toLowerCase();
    const existing = this.addresses.get(addressLower);

    if (existing) {
      // Update existing address
      const updated: SavedAddress = {
        ...existing,
        ...address,
        useCount: existing.useCount,
      };
      this.addresses.set(addressLower, updated);
      this.saveToStorage();
      return updated;
    }

    const newAddress: SavedAddress = {
      ...address,
      address: addressLower,
      addedAt: Date.now(),
      useCount: 0,
    };

    this.addresses.set(addressLower, newAddress);
    this.saveToStorage();
    return newAddress;
  }

  /**
   * Get address by address string
   */
  getAddress(address: string): SavedAddress | null {
    return this.addresses.get(address.toLowerCase()) || null;
  }

  /**
   * Update address
   */
  updateAddress(
    address: string,
    updates: Partial<SavedAddress>
  ): SavedAddress | null {
    const addressLower = address.toLowerCase();
    const existing = this.addresses.get(addressLower);
    if (!existing) return null;

    const updated = { ...existing, ...updates };
    this.addresses.set(addressLower, updated);
    this.saveToStorage();
    return updated;
  }

  /**
   * Remove address
   */
  removeAddress(address: string): boolean {
    const removed = this.addresses.delete(address.toLowerCase());
    if (removed) {
      // Remove from all groups
      this.groups.forEach(group => {
        const index = group.addresses.indexOf(address.toLowerCase());
        if (index > -1) {
          group.addresses.splice(index, 1);
        }
      });
      this.saveToStorage();
    }
    return removed;
  }

  /**
   * Record address usage
   */
  recordUsage(address: string): void {
    const addressLower = address.toLowerCase();
    const existing = this.addresses.get(addressLower);
    if (existing) {
      existing.useCount++;
      existing.lastUsed = Date.now();
      this.addresses.set(addressLower, existing);
      this.saveToStorage();
    }
  }

  /**
   * Get all addresses
   */
  getAllAddresses(): SavedAddress[] {
    return Array.from(this.addresses.values());
  }

  /**
   * Search addresses
   */
  searchAddresses(query: string): SavedAddress[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.addresses.values()).filter(addr => {
      return (
        addr.address.toLowerCase().includes(lowerQuery) ||
        addr.label.toLowerCase().includes(lowerQuery) ||
        addr.notes?.toLowerCase().includes(lowerQuery) ||
        addr.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
    });
  }

  /**
   * Get addresses by tag
   */
  getAddressesByTag(tag: string): SavedAddress[] {
    return Array.from(this.addresses.values()).filter(
      addr => addr.tags?.includes(tag)
    );
  }

  /**
   * Get frequently used addresses
   */
  getFrequentlyUsed(limit = 10): SavedAddress[] {
    return Array.from(this.addresses.values())
      .sort((a, b) => b.useCount - a.useCount)
      .slice(0, limit);
  }

  /**
   * Get recently used addresses
   */
  getRecentlyUsed(limit = 10): SavedAddress[] {
    return Array.from(this.addresses.values())
      .filter(addr => addr.lastUsed)
      .sort((a, b) => (b.lastUsed || 0) - (a.lastUsed || 0))
      .slice(0, limit);
  }

  /**
   * Create address group
   */
  createGroup(group: Omit<AddressGroup, 'id' | 'createdAt'>): AddressGroup {
    const newGroup: AddressGroup = {
      ...group,
      id: `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
    };

    this.groups.set(newGroup.id, newGroup);
    this.saveToStorage();
    return newGroup;
  }

  /**
   * Add address to group
   */
  addAddressToGroup(groupId: string, address: string): boolean {
    const group = this.groups.get(groupId);
    if (!group) return false;

    const addressLower = address.toLowerCase();
    if (!group.addresses.includes(addressLower)) {
      group.addresses.push(addressLower);
      this.saveToStorage();
    }
    return true;
  }

  /**
   * Remove address from group
   */
  removeAddressFromGroup(groupId: string, address: string): boolean {
    const group = this.groups.get(groupId);
    if (!group) return false;

    const index = group.addresses.indexOf(address.toLowerCase());
    if (index > -1) {
      group.addresses.splice(index, 1);
      this.saveToStorage();
      return true;
    }
    return false;
  }

  /**
   * Get group addresses
   */
  getGroupAddresses(groupId: string): SavedAddress[] {
    const group = this.groups.get(groupId);
    if (!group) return [];

    return group.addresses
      .map(address => this.addresses.get(address))
      .filter((addr): addr is SavedAddress => addr !== undefined);
  }

  /**
   * Get all groups
   */
  getAllGroups(): AddressGroup[] {
    return Array.from(this.groups.values());
  }

  /**
   * Delete group
   */
  deleteGroup(groupId: string): boolean {
    return this.groups.delete(groupId);
  }

  /**
   * Verify address (mark as verified)
   */
  verifyAddress(
    address: string,
    source: string,
    verified = true
  ): SavedAddress | null {
    const addressLower = address.toLowerCase();
    const existing = this.addresses.get(addressLower);
    if (!existing) return null;

    existing.isVerified = verified;
    existing.verificationSource = source;
    this.addresses.set(addressLower, existing);
    this.saveToStorage();
    return existing;
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalAddresses: number;
    verifiedAddresses: number;
    totalGroups: number;
    mostUsedAddress: SavedAddress | null;
    averageUseCount: number;
  } {
    const addresses = Array.from(this.addresses.values());
    const verified = addresses.filter(a => a.isVerified).length;
    const totalUseCount = addresses.reduce((sum, a) => sum + a.useCount, 0);
    const averageUseCount = addresses.length > 0
      ? totalUseCount / addresses.length
      : 0;

    const mostUsed = addresses.length > 0
      ? addresses.reduce((max, a) => a.useCount > max.useCount ? a : max, addresses[0])
      : null;

    return {
      totalAddresses: addresses.length,
      verifiedAddresses: verified,
      totalGroups: this.groups.size,
      mostUsedAddress: mostUsed,
      averageUseCount: Math.round(averageUseCount * 100) / 100,
    };
  }

  /**
   * Export address book
   */
  exportAddressBook(): string {
    return JSON.stringify({
      addresses: Array.from(this.addresses.values()),
      groups: Array.from(this.groups.values()),
      exportDate: new Date().toISOString(),
    }, null, 2);
  }

  /**
   * Import address book
   */
  importAddressBook(data: {
    addresses: SavedAddress[];
    groups?: AddressGroup[];
  }): void {
    if (data.addresses) {
      data.addresses.forEach(addr => {
        this.addresses.set(addr.address.toLowerCase(), addr);
      });
    }

    if (data.groups) {
      data.groups.forEach(group => {
        this.groups.set(group.id, group);
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
          'wallet-health-address-book',
          JSON.stringify({
            addresses: Array.from(this.addresses.values()),
            groups: Array.from(this.groups.values()),
          })
        );
      } catch (error) {
        console.error('Failed to save address book to storage:', error);
      }
    }
  }

  /**
   * Load from localStorage
   */
  loadFromStorage(): void {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('wallet-health-address-book');
        if (stored) {
          const data = JSON.parse(stored);
          if (data.addresses) {
            data.addresses.forEach((addr: SavedAddress) => {
              this.addresses.set(addr.address.toLowerCase(), addr);
            });
          }
          if (data.groups) {
            data.groups.forEach((group: AddressGroup) => {
              this.groups.set(group.id, group);
            });
          }
        }
      } catch (error) {
        console.error('Failed to load address book from storage:', error);
      }
    }
  }
}

// Singleton instance
export const addressBook = new AddressBook();

// Initialize from storage if available
if (typeof window !== 'undefined') {
  addressBook.loadFromStorage();
}
