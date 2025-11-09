/**
 * Address Book Manager
 * Manages trusted addresses, labels, and contact information
 */

export interface AddressEntry {
  id: string;
  address: string;
  label: string;
  chainId?: number; // If specific to a chain
  tags: string[];
  notes?: string;
  isTrusted: boolean;
  isContract: boolean;
  ensName?: string;
  avatar?: string;
  createdAt: number;
  updatedAt: number;
  lastUsed?: number;
  usageCount: number;
  metadata?: Record<string, any>;
}

export interface AddressBookGroup {
  id: string;
  name: string;
  description?: string;
  addresses: string[]; // Address IDs
  color?: string;
  createdAt: number;
}

export interface AddressBook {
  entries: Map<string, AddressEntry>; // address -> entry
  groups: Map<string, AddressBookGroup>; // groupId -> group
  tags: Set<string>;
}

export class AddressBookManager {
  private addressBooks: Map<string, AddressBook> = new Map(); // wallet -> address book

  /**
   * Get or create address book for a wallet
   */
  private getAddressBook(walletAddress: string): AddressBook {
    const walletKey = walletAddress.toLowerCase();
    if (!this.addressBooks.has(walletKey)) {
      this.addressBooks.set(walletKey, {
        entries: new Map(),
        groups: new Map(),
        tags: new Set(),
      });
    }
    return this.addressBooks.get(walletKey)!;
  }

  /**
   * Add or update an address entry
   */
  addAddress(
    walletAddress: string,
    entry: Omit<AddressEntry, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>
  ): AddressEntry {
    const book = this.getAddressBook(walletAddress);
    const addressKey = entry.address.toLowerCase();

    const existing = book.entries.get(addressKey);
    const now = Date.now();

    const fullEntry: AddressEntry = {
      ...entry,
      id: existing?.id || `addr_${now}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
      usageCount: existing?.usageCount || 0,
      tags: entry.tags || [],
    };

    book.entries.set(addressKey, fullEntry);

    // Update tags set
    fullEntry.tags.forEach(tag => book.tags.add(tag));

    return fullEntry;
  }

  /**
   * Get address entry
   */
  getAddress(walletAddress: string, address: string): AddressEntry | null {
    const book = this.getAddressBook(walletAddress);
    return book.entries.get(address.toLowerCase()) || null;
  }

  /**
   * Update address entry
   */
  updateAddress(
    walletAddress: string,
    address: string,
    updates: Partial<Omit<AddressEntry, 'id' | 'address' | 'createdAt' | 'usageCount'>>
  ): AddressEntry | null {
    const book = this.getAddressBook(walletAddress);
    const entry = book.entries.get(address.toLowerCase());

    if (!entry) return null;

    const updated: AddressEntry = {
      ...entry,
      ...updates,
      updatedAt: Date.now(),
    };

    book.entries.set(address.toLowerCase(), updated);

    // Update tags if changed
    if (updates.tags) {
      updates.tags.forEach(tag => book.tags.add(tag));
    }

    return updated;
  }

  /**
   * Remove address entry
   */
  removeAddress(walletAddress: string, address: string): boolean {
    const book = this.getAddressBook(walletAddress);
    return book.entries.delete(address.toLowerCase());
  }

  /**
   * Record address usage
   */
  recordUsage(walletAddress: string, address: string): void {
    const book = this.getAddressBook(walletAddress);
    const entry = book.entries.get(address.toLowerCase());

    if (entry) {
      entry.usageCount++;
      entry.lastUsed = Date.now();
      entry.updatedAt = Date.now();
    }
  }

  /**
   * Search addresses
   */
  searchAddresses(
    walletAddress: string,
    query: {
      search?: string;
      tags?: string[];
      isTrusted?: boolean;
      isContract?: boolean;
      chainId?: number;
      limit?: number;
    }
  ): AddressEntry[] {
    const book = this.getAddressBook(walletAddress);
    let results = Array.from(book.entries.values());

    // Filter by search term
    if (query.search) {
      const searchLower = query.search.toLowerCase();
      results = results.filter(
        entry =>
          entry.label.toLowerCase().includes(searchLower) ||
          entry.address.toLowerCase().includes(searchLower) ||
          entry.ensName?.toLowerCase().includes(searchLower) ||
          entry.notes?.toLowerCase().includes(searchLower)
      );
    }

    // Filter by tags
    if (query.tags && query.tags.length > 0) {
      results = results.filter(entry =>
        query.tags!.some(tag => entry.tags.includes(tag))
      );
    }

    // Filter by trusted status
    if (query.isTrusted !== undefined) {
      results = results.filter(entry => entry.isTrusted === query.isTrusted);
    }

    // Filter by contract status
    if (query.isContract !== undefined) {
      results = results.filter(entry => entry.isContract === query.isContract);
    }

    // Filter by chain
    if (query.chainId !== undefined) {
      results = results.filter(
        entry => !entry.chainId || entry.chainId === query.chainId
      );
    }

    // Sort by usage count and last used
    results.sort((a, b) => {
      if (b.usageCount !== a.usageCount) {
        return b.usageCount - a.usageCount;
      }
      return (b.lastUsed || 0) - (a.lastUsed || 0);
    });

    // Apply limit
    if (query.limit) {
      results = results.slice(0, query.limit);
    }

    return results;
  }

  /**
   * Get all addresses
   */
  getAllAddresses(walletAddress: string): AddressEntry[] {
    const book = this.getAddressBook(walletAddress);
    return Array.from(book.entries.values());
  }

  /**
   * Create a group
   */
  createGroup(
    walletAddress: string,
    group: Omit<AddressBookGroup, 'id' | 'createdAt'>
  ): AddressBookGroup {
    const book = this.getAddressBook(walletAddress);
    const now = Date.now();

    const fullGroup: AddressBookGroup = {
      ...group,
      id: `group_${now}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: now,
      addresses: group.addresses || [],
    };

    book.groups.set(fullGroup.id, fullGroup);
    return fullGroup;
  }

  /**
   * Add address to group
   */
  addAddressToGroup(
    walletAddress: string,
    groupId: string,
    addressId: string
  ): boolean {
    const book = this.getAddressBook(walletAddress);
    const group = book.groups.get(groupId);

    if (!group) return false;

    if (!group.addresses.includes(addressId)) {
      group.addresses.push(addressId);
    }

    return true;
  }

  /**
   * Remove address from group
   */
  removeAddressFromGroup(
    walletAddress: string,
    groupId: string,
    addressId: string
  ): boolean {
    const book = this.getAddressBook(walletAddress);
    const group = book.groups.get(groupId);

    if (!group) return false;

    group.addresses = group.addresses.filter(id => id !== addressId);
    return true;
  }

  /**
   * Get all groups
   */
  getAllGroups(walletAddress: string): AddressBookGroup[] {
    const book = this.getAddressBook(walletAddress);
    return Array.from(book.groups.values());
  }

  /**
   * Get all tags
   */
  getAllTags(walletAddress: string): string[] {
    const book = this.getAddressBook(walletAddress);
    return Array.from(book.tags);
  }

  /**
   * Get statistics
   */
  getStatistics(walletAddress: string): {
    totalAddresses: number;
    trustedAddresses: number;
    contractAddresses: number;
    totalGroups: number;
    totalTags: number;
    mostUsedAddresses: AddressEntry[];
  } {
    const book = this.getAddressBook(walletAddress);
    const entries = Array.from(book.entries.values());

    const trustedAddresses = entries.filter(e => e.isTrusted).length;
    const contractAddresses = entries.filter(e => e.isContract).length;

    const mostUsedAddresses = entries
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 10);

    return {
      totalAddresses: entries.length,
      trustedAddresses,
      contractAddresses,
      totalGroups: book.groups.size,
      totalTags: book.tags.size,
      mostUsedAddresses,
    };
  }

  /**
   * Export address book
   */
  exportAddressBook(walletAddress: string): AddressBook {
    const book = this.getAddressBook(walletAddress);
    return {
      entries: new Map(book.entries),
      groups: new Map(book.groups),
      tags: new Set(book.tags),
    };
  }

  /**
   * Import address book
   */
  importAddressBook(walletAddress: string, importedBook: AddressBook): void {
    const book = this.getAddressBook(walletAddress);
    
    // Merge entries
    importedBook.entries.forEach((entry, address) => {
      book.entries.set(address, entry);
    });

    // Merge groups
    importedBook.groups.forEach((group, id) => {
      book.groups.set(id, group);
    });

    // Merge tags
    importedBook.tags.forEach(tag => book.tags.add(tag));
  }
}

// Singleton instance
export const addressBookManager = new AddressBookManager();

