/**
 * Wallet Clustering Utility
 * Group related wallets together based on patterns and relationships
 */

export interface WalletCluster {
  id: string;
  name: string;
  wallets: string[];
  clusterType: 'same-owner' | 'related-activity' | 'shared-contracts' | 'similar-patterns' | 'manual';
  confidence: number; // 0-100
  metadata: {
    commonContracts: string[];
    commonTokens: string[];
    transactionCount: number;
    totalValue: string;
    createdAt: number;
  };
}

export interface WalletRelationship {
  wallet1: string;
  wallet2: string;
  relationshipType: 'direct-transfer' | 'shared-contract' | 'similar-activity' | 'same-tokens';
  strength: number; // 0-100
  evidence: string[];
  firstSeen: number;
  lastSeen: number;
}

export interface ClusteringAnalysis {
  clusters: WalletCluster[];
  relationships: WalletRelationship[];
  isolatedWallets: string[];
  statistics: {
    totalClusters: number;
    averageClusterSize: number;
    largestCluster: number;
    totalRelationships: number;
  };
}

export class WalletClustering {
  private clusters: Map<string, WalletCluster> = new Map();
  private relationships: Map<string, WalletRelationship> = new Map();

  /**
   * Generate relationship key
   */
  private getRelationshipKey(wallet1: string, wallet2: string): string {
    const [addr1, addr2] = [wallet1.toLowerCase(), wallet2.toLowerCase()].sort();
    return `${addr1}-${addr2}`;
  }

  /**
   * Analyze wallets and create clusters
   */
  analyzeWallets(
    wallets: Array<{
      address: string;
      transactions?: Array<{
        to: string;
        from: string;
        timestamp: number;
        value: string;
        contractAddress?: string;
      }>;
      tokens?: Array<{ address: string; symbol: string }>;
      contracts?: string[];
    }>
  ): ClusteringAnalysis {
    // Detect relationships
    const detectedRelationships = this.detectRelationships(wallets);
    detectedRelationships.forEach(rel => {
      const key = this.getRelationshipKey(rel.wallet1, rel.wallet2);
      this.relationships.set(key, rel);
    });

    // Create clusters from relationships
    const clusters = this.createClustersFromRelationships(detectedRelationships, wallets);

    // Calculate statistics
    const statistics = this.calculateStatistics(clusters, detectedRelationships);

    // Find isolated wallets
    const clusteredWallets = new Set<string>();
    clusters.forEach(cluster => {
      cluster.wallets.forEach(addr => clusteredWallets.add(addr.toLowerCase()));
    });

    const isolatedWallets = wallets
      .map(w => w.address.toLowerCase())
      .filter(addr => !clusteredWallets.has(addr));

    return {
      clusters,
      relationships: detectedRelationships,
      isolatedWallets,
      statistics,
    };
  }

  /**
   * Detect relationships between wallets
   */
  private detectRelationships(
    wallets: Array<{
      address: string;
      transactions?: Array<{
        to: string;
        from: string;
        timestamp: number;
        value: string;
        contractAddress?: string;
      }>;
      tokens?: Array<{ address: string; symbol: string }>;
      contracts?: string[];
    }>
  ): WalletRelationship[] {
    const relationships: WalletRelationship[] = [];
    const walletMap = new Map<string, typeof wallets[0]>();
    wallets.forEach(w => walletMap.set(w.address.toLowerCase(), w));

    // Check for direct transfers
    wallets.forEach(wallet1 => {
      wallets.forEach(wallet2 => {
        if (wallet1.address.toLowerCase() === wallet2.address.toLowerCase()) {
          return;
        }

        const evidence: string[] = [];
        let strength = 0;
        let relationshipType: WalletRelationship['relationshipType'] = 'similar-activity';
        let firstSeen = Date.now();
        let lastSeen = 0;

        // Check for direct transfers
        const directTransfers = wallet1.transactions?.filter(tx =>
          (tx.from.toLowerCase() === wallet1.address.toLowerCase() &&
           tx.to.toLowerCase() === wallet2.address.toLowerCase()) ||
          (tx.from.toLowerCase() === wallet2.address.toLowerCase() &&
           tx.to.toLowerCase() === wallet1.address.toLowerCase())
        ) || [];

        if (directTransfers.length > 0) {
          relationshipType = 'direct-transfer';
          strength += Math.min(directTransfers.length * 10, 50);
          evidence.push(`${directTransfers.length} direct transfers`);
          
          directTransfers.forEach(tx => {
            const txTime = tx.timestamp;
            if (txTime < firstSeen) firstSeen = txTime;
            if (txTime > lastSeen) lastSeen = txTime;
          });
        }

        // Check for shared contracts
        const contracts1 = new Set(wallet1.contracts || []);
        const contracts2 = new Set(wallet2.contracts || []);
        const sharedContracts = [...contracts1].filter(c => contracts2.has(c));

        if (sharedContracts.length > 0) {
          if (relationshipType === 'similar-activity') {
            relationshipType = 'shared-contracts';
          }
          strength += Math.min(sharedContracts.length * 5, 30);
          evidence.push(`${sharedContracts.length} shared contracts`);
        }

        // Check for same tokens
        const tokens1 = new Set((wallet1.tokens || []).map(t => t.address.toLowerCase()));
        const tokens2 = new Set((wallet2.tokens || []).map(t => t.address.toLowerCase()));
        const commonTokens = [...tokens1].filter(t => tokens2.has(t));

        if (commonTokens.length > 3) {
          if (relationshipType === 'similar-activity') {
            relationshipType = 'same-tokens';
          }
          strength += Math.min(commonTokens.length * 2, 20);
          evidence.push(`${commonTokens.length} common tokens`);
        }

        if (strength > 20) {
          relationships.push({
            wallet1: wallet1.address.toLowerCase(),
            wallet2: wallet2.address.toLowerCase(),
            relationshipType,
            strength: Math.min(100, strength),
            evidence,
            firstSeen,
            lastSeen: lastSeen || Date.now(),
          });
        }
      });
    });

    return relationships;
  }

  /**
   * Create clusters from relationships
   */
  private createClustersFromRelationships(
    relationships: WalletRelationship[],
    wallets: Array<{ address: string }>
  ): WalletCluster[] {
    const clusters: WalletCluster[] = [];
    const processed = new Set<string>();

    // Group wallets by relationships
    const walletGroups = new Map<string, Set<string>>();

    relationships.forEach(rel => {
      const group1 = Array.from(walletGroups.entries())
        .find(([_, group]) => group.has(rel.wallet1))?.[0];
      const group2 = Array.from(walletGroups.entries())
        .find(([_, group]) => group.has(rel.wallet2))?.[0];

      if (group1 && group2) {
        if (group1 !== group2) {
          // Merge groups
          const group1Set = walletGroups.get(group1)!;
          const group2Set = walletGroups.get(group2)!;
          group1Set.forEach(addr => group2Set.add(addr));
          walletGroups.delete(group1);
        }
      } else if (group1) {
        walletGroups.get(group1)!.add(rel.wallet2);
      } else if (group2) {
        walletGroups.get(group2)!.add(rel.wallet1);
      } else {
        // Create new group
        const newGroup = new Set([rel.wallet1, rel.wallet2]);
        walletGroups.set(`group-${Date.now()}-${Math.random()}`, newGroup);
      }
    });

    // Create clusters from groups
    walletGroups.forEach((group, id) => {
      const walletAddresses = Array.from(group);
      const clusterRelationships = relationships.filter(rel =>
        group.has(rel.wallet1) && group.has(rel.wallet2)
      );

      const averageConfidence = clusterRelationships.length > 0
        ? clusterRelationships.reduce((sum, r) => sum + r.strength, 0) / clusterRelationships.length
        : 50;

      clusters.push({
        id,
        name: `Cluster ${clusters.length + 1}`,
        wallets: walletAddresses,
        clusterType: this.determineClusterType(clusterRelationships),
        confidence: Math.round(averageConfidence),
        metadata: {
          commonContracts: [],
          commonTokens: [],
          transactionCount: clusterRelationships.length,
          totalValue: '0',
          createdAt: Date.now(),
        },
      });

      walletAddresses.forEach(addr => processed.add(addr));
    });

    return clusters;
  }

  /**
   * Determine cluster type from relationships
   */
  private determineClusterType(relationships: WalletRelationship[]): WalletCluster['clusterType'] {
    if (relationships.some(r => r.relationshipType === 'direct-transfer')) {
      return 'same-owner';
    }
    if (relationships.some(r => r.relationshipType === 'shared-contracts')) {
      return 'shared-contracts';
    }
    if (relationships.some(r => r.relationshipType === 'same-tokens')) {
      return 'similar-patterns';
    }
    return 'related-activity';
  }

  /**
   * Calculate statistics
   */
  private calculateStatistics(
    clusters: WalletCluster[],
    relationships: WalletRelationship[]
  ): ClusteringAnalysis['statistics'] {
    const clusterSizes = clusters.map(c => c.wallets.length);
    const averageClusterSize = clusterSizes.length > 0
      ? clusterSizes.reduce((sum, size) => sum + size, 0) / clusterSizes.length
      : 0;

    const largestCluster = clusterSizes.length > 0
      ? Math.max(...clusterSizes)
      : 0;

    return {
      totalClusters: clusters.length,
      averageClusterSize: Math.round(averageClusterSize * 100) / 100,
      largestCluster,
      totalRelationships: relationships.length,
    };
  }

  /**
   * Create manual cluster
   */
  createManualCluster(
    name: string,
    wallets: string[],
    clusterType: WalletCluster['clusterType'] = 'manual'
  ): WalletCluster {
    const cluster: WalletCluster = {
      id: `manual-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      wallets: wallets.map(w => w.toLowerCase()),
      clusterType,
      confidence: 100,
      metadata: {
        commonContracts: [],
        commonTokens: [],
        transactionCount: 0,
        totalValue: '0',
        createdAt: Date.now(),
      },
    };

    this.clusters.set(cluster.id, cluster);
    return cluster;
  }

  /**
   * Get cluster by ID
   */
  getCluster(clusterId: string): WalletCluster | null {
    return this.clusters.get(clusterId) || null;
  }

  /**
   * Get all clusters
   */
  getAllClusters(): WalletCluster[] {
    return Array.from(this.clusters.values());
  }

  /**
   * Add wallet to cluster
   */
  addWalletToCluster(clusterId: string, walletAddress: string): boolean {
    const cluster = this.clusters.get(clusterId);
    if (!cluster) return false;

    const address = walletAddress.toLowerCase();
    if (!cluster.wallets.includes(address)) {
      cluster.wallets.push(address);
      this.clusters.set(clusterId, cluster);
    }
    return true;
  }

  /**
   * Remove wallet from cluster
   */
  removeWalletFromCluster(clusterId: string, walletAddress: string): boolean {
    const cluster = this.clusters.get(clusterId);
    if (!cluster) return false;

    const index = cluster.wallets.indexOf(walletAddress.toLowerCase());
    if (index > -1) {
      cluster.wallets.splice(index, 1);
      this.clusters.set(clusterId, cluster);
      return true;
    }
    return false;
  }

  /**
   * Delete cluster
   */
  deleteCluster(clusterId: string): boolean {
    return this.clusters.delete(clusterId);
  }
}

// Singleton instance
export const walletClustering = new WalletClustering();

