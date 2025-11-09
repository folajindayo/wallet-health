/**
 * Governance Participation Tracker Utility
 * Tracks DAO governance participation and voting history
 */

export interface GovernanceProposal {
  id: string;
  daoName: string;
  daoAddress: string;
  chainId: number;
  title: string;
  description?: string;
  proposer: string;
  startBlock: number;
  endBlock: number;
  startTime: number;
  endTime: number;
  status: 'pending' | 'active' | 'succeeded' | 'defeated' | 'executed' | 'canceled';
  forVotes: string;
  againstVotes: string;
  abstainVotes?: string;
  quorum: string;
  votingPower?: string;
}

export interface Vote {
  proposalId: string;
  voter: string;
  support: 'for' | 'against' | 'abstain';
  votingPower: string;
  timestamp: number;
  transactionHash: string;
  reason?: string;
}

export interface DAOProfile {
  daoAddress: string;
  daoName: string;
  chainId: number;
  tokenAddress: string;
  tokenSymbol: string;
  votingPower: string;
  totalProposals: number;
  votedProposals: number;
  participationRate: number;
  votingHistory: Vote[];
  delegation?: {
    delegate: string;
    delegatedPower: string;
  };
}

export interface GovernanceStats {
  totalDAOs: number;
  totalProposals: number;
  votedProposals: number;
  participationRate: number;
  averageVotingPower: number;
  topDAOs: Array<{
    daoName: string;
    proposals: number;
    votes: number;
  }>;
  recentActivity: Array<{
    date: number;
    proposals: number;
    votes: number;
  }>;
}

export class GovernanceTracker {
  private proposals: Map<string, GovernanceProposal> = new Map();
  private votes: Map<string, Vote[]> = new Map();
  private daoProfiles: Map<string, DAOProfile> = new Map();

  /**
   * Add a proposal
   */
  addProposal(proposal: GovernanceProposal): void {
    const key = `${proposal.daoAddress.toLowerCase()}-${proposal.id}`;
    this.proposals.set(key, proposal);
  }

  /**
   * Add a vote
   */
  addVote(vote: Vote): void {
    const key = vote.proposalId;
    if (!this.votes.has(key)) {
      this.votes.set(key, []);
    }
    this.votes.get(key)!.push(vote);
  }

  /**
   * Get proposals for a DAO
   */
  getDAOProposals(daoAddress: string, chainId: number): GovernanceProposal[] {
    return Array.from(this.proposals.values()).filter(
      p => p.daoAddress.toLowerCase() === daoAddress.toLowerCase() && p.chainId === chainId
    );
  }

  /**
   * Get votes for a wallet
   */
  getWalletVotes(walletAddress: string): Vote[] {
    const allVotes: Vote[] = [];
    this.votes.forEach(voteList => {
      const walletVotes = voteList.filter(
        v => v.voter.toLowerCase() === walletAddress.toLowerCase()
      );
      allVotes.push(...walletVotes);
    });
    return allVotes.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Get DAO profile for a wallet
   */
  getDAOProfile(
    walletAddress: string,
    daoAddress: string,
    chainId: number
  ): DAOProfile | null {
    const key = `${walletAddress.toLowerCase()}-${daoAddress.toLowerCase()}-${chainId}`;
    
    if (this.daoProfiles.has(key)) {
      return this.daoProfiles.get(key)!;
    }

    const proposals = this.getDAOProposals(daoAddress, chainId);
    const votes = this.getWalletVotes(walletAddress).filter(
      v => proposals.some(p => p.id === v.proposalId)
    );

    const votedProposals = new Set(votes.map(v => v.proposalId)).size;
    const participationRate = proposals.length > 0
      ? (votedProposals / proposals.length) * 100
      : 0;

    // Calculate average voting power
    const votingPowers = votes.map(v => parseFloat(v.votingPower));
    const averageVotingPower = votingPowers.length > 0
      ? votingPowers.reduce((sum, p) => sum + p, 0) / votingPowers.length
      : 0;

    const profile: DAOProfile = {
      daoAddress,
      daoName: proposals[0]?.daoName || 'Unknown DAO',
      chainId,
      tokenAddress: '', // Would be fetched from DAO contract
      tokenSymbol: proposals[0]?.daoName || 'GOV',
      votingPower: votes.length > 0 ? votes[0].votingPower : '0',
      totalProposals: proposals.length,
      votedProposals,
      participationRate: Math.round(participationRate * 100) / 100,
      votingHistory: votes,
    };

    this.daoProfiles.set(key, profile);
    return profile;
  }

  /**
   * Get governance statistics
   */
  getGovernanceStats(walletAddress: string): GovernanceStats {
    const allVotes = this.getWalletVotes(walletAddress);
    const allProposals = Array.from(this.proposals.values());

    // Get unique DAOs
    const daoSet = new Set(
      allProposals.map(p => `${p.daoAddress.toLowerCase()}-${p.chainId}`)
    );
    const totalDAOs = daoSet.size;

    // Get voted proposals
    const votedProposalIds = new Set(allVotes.map(v => v.proposalId));
    const votedProposals = votedProposalIds.size;
    const participationRate = allProposals.length > 0
      ? (votedProposals / allProposals.length) * 100
      : 0;

    // Calculate average voting power
    const votingPowers = allVotes.map(v => parseFloat(v.votingPower));
    const averageVotingPower = votingPowers.length > 0
      ? votingPowers.reduce((sum, p) => sum + p, 0) / votingPowers.length
      : 0;

    // Get top DAOs by participation
    const daoStats = new Map<string, { daoName: string; proposals: number; votes: number }>();
    allProposals.forEach(proposal => {
      const daoKey = `${proposal.daoAddress.toLowerCase()}-${proposal.chainId}`;
      if (!daoStats.has(daoKey)) {
        daoStats.set(daoKey, {
          daoName: proposal.daoName,
          proposals: 0,
          votes: 0,
        });
      }
      const stats = daoStats.get(daoKey)!;
      stats.proposals++;
      if (votedProposalIds.has(proposal.id)) {
        stats.votes++;
      }
    });

    const topDAOs = Array.from(daoStats.values())
      .sort((a, b) => b.votes - a.votes)
      .slice(0, 10);

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const recentVotes = allVotes.filter(v => v.timestamp >= thirtyDaysAgo);
    const recentProposals = allProposals.filter(p => p.startTime >= thirtyDaysAgo);

    // Group by date
    const activityMap = new Map<number, { proposals: number; votes: number }>();
    recentProposals.forEach(p => {
      const dateKey = Math.floor(p.startTime / (24 * 60 * 60 * 1000)) * (24 * 60 * 60 * 1000);
      if (!activityMap.has(dateKey)) {
        activityMap.set(dateKey, { proposals: 0, votes: 0 });
      }
      activityMap.get(dateKey)!.proposals++;
    });

    recentVotes.forEach(v => {
      const dateKey = Math.floor(v.timestamp / (24 * 60 * 60 * 1000)) * (24 * 60 * 60 * 1000);
      if (!activityMap.has(dateKey)) {
        activityMap.set(dateKey, { proposals: 0, votes: 0 });
      }
      activityMap.get(dateKey)!.votes++;
    });

    const recentActivity = Array.from(activityMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date - b.date);

    return {
      totalDAOs,
      totalProposals: allProposals.length,
      votedProposals,
      participationRate: Math.round(participationRate * 100) / 100,
      averageVotingPower: Math.round(averageVotingPower * 100) / 100,
      topDAOs,
      recentActivity,
    };
  }

  /**
   * Get active proposals
   */
  getActiveProposals(daoAddress?: string): GovernanceProposal[] {
    const now = Date.now();
    let proposals = Array.from(this.proposals.values()).filter(
      p => p.status === 'active' && p.startTime <= now && p.endTime >= now
    );

    if (daoAddress) {
      proposals = proposals.filter(
        p => p.daoAddress.toLowerCase() === daoAddress.toLowerCase()
      );
    }

    return proposals.sort((a, b) => a.endTime - b.endTime);
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.proposals.clear();
    this.votes.clear();
    this.daoProfiles.clear();
  }
}

// Singleton instance
export const governanceTracker = new GovernanceTracker();

