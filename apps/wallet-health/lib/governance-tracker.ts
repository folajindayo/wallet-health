/**
 * Governance Tracker
 * Tracks DAO governance participation and voting history
 */

export interface GovernanceProposal {
  id: string;
  dao: string;
  daoName: string;
  chainId: number;
  title: string;
  description?: string;
  proposer: string;
  startBlock: number;
  endBlock: number;
  startDate: number;
  endDate: number;
  status: 'pending' | 'active' | 'succeeded' | 'defeated' | 'executed' | 'cancelled';
  votingPower?: string;
  forVotes?: string;
  againstVotes?: string;
  abstainVotes?: string;
  quorum?: string;
  metadata?: Record<string, any>;
}

export interface GovernanceVote {
  proposalId: string;
  voter: string;
  timestamp: number;
  support: 'for' | 'against' | 'abstain';
  votingPower: string;
  reason?: string;
  transactionHash?: string;
  chainId: number;
}

export interface GovernanceParticipation {
  walletAddress: string;
  totalProposals: number;
  votedProposals: number;
  participationRate: number;
  totalVotingPower: string;
  averageVotingPower: string;
  daos: Record<string, {
    dao: string;
    daoName: string;
    proposals: number;
    votes: number;
    participationRate: number;
  }>;
  votingHistory: GovernanceVote[];
  recentActivity: Array<{
    date: number;
    proposals: number;
    votes: number;
  }>;
}

export class GovernanceTracker {
  private proposals: Map<string, GovernanceProposal[]> = new Map(); // dao -> proposals
  private votes: Map<string, GovernanceVote[]> = new Map(); // wallet -> votes

  /**
   * Add governance proposal
   */
  addProposal(proposal: GovernanceProposal): void {
    const daoKey = `${proposal.dao.toLowerCase()}-${proposal.chainId}`;
    if (!this.proposals.has(daoKey)) {
      this.proposals.set(daoKey, []);
    }

    const daoProposals = this.proposals.get(daoKey)!;
    
    // Check if already exists
    const existingIndex = daoProposals.findIndex(p => p.id === proposal.id);
    if (existingIndex >= 0) {
      daoProposals[existingIndex] = proposal;
    } else {
      daoProposals.push(proposal);
    }
  }

  /**
   * Record vote
   */
  recordVote(
    walletAddress: string,
    vote: GovernanceVote
  ): void {
    const walletKey = walletAddress.toLowerCase();
    if (!this.votes.has(walletKey)) {
      this.votes.set(walletKey, []);
    }

    const walletVotes = this.votes.get(walletKey)!;
    
    // Check if already exists
    const existingIndex = walletVotes.findIndex(
      v => v.proposalId === vote.proposalId && v.voter.toLowerCase() === vote.voter.toLowerCase()
    );

    if (existingIndex >= 0) {
      walletVotes[existingIndex] = vote;
    } else {
      walletVotes.push(vote);
    }
  }

  /**
   * Get participation summary
   */
  getParticipation(walletAddress: string): GovernanceParticipation {
    const walletKey = walletAddress.toLowerCase();
    const votes = this.votes.get(walletKey) || [];

    // Get all proposals this wallet could vote on
    const allProposals: GovernanceProposal[] = [];
    this.proposals.forEach(daoProposals => {
      allProposals.push(...daoProposals);
    });

    // Filter proposals that overlap with vote timestamps
    const votedProposalIds = new Set(votes.map(v => v.proposalId));
    const votedProposals = allProposals.filter(p => votedProposalIds.has(p.id));

    const totalVotingPower = votes.reduce(
      (sum, v) => sum + BigInt(v.votingPower || '0'),
      BigInt(0)
    ).toString();

    const averageVotingPower =
      votes.length > 0
        ? (BigInt(totalVotingPower) / BigInt(votes.length)).toString()
        : '0';

    // DAO breakdown
    const daos: Record<string, {
      dao: string;
      daoName: string;
      proposals: number;
      votes: number;
      participationRate: number;
    }> = {};

    votes.forEach(vote => {
      const proposal = allProposals.find(p => p.id === vote.proposalId);
      if (proposal) {
        const daoKey = `${proposal.dao.toLowerCase()}-${proposal.chainId}`;
        if (!daos[daoKey]) {
          daos[daoKey] = {
            dao: proposal.dao,
            daoName: proposal.daoName,
            proposals: 0,
            votes: 0,
            participationRate: 0,
          };
        }

        daos[daoKey].votes++;
      }
    });

    // Count proposals per DAO
    this.proposals.forEach((daoProposals, daoKey) => {
      if (!daos[daoKey]) {
        const firstProposal = daoProposals[0];
        if (firstProposal) {
          daos[daoKey] = {
            dao: firstProposal.dao,
            daoName: firstProposal.daoName,
            proposals: daoProposals.length,
            votes: 0,
            participationRate: 0,
          };
        }
      } else {
        daos[daoKey].proposals = daoProposals.length;
        daos[daoKey].participationRate =
          daoProposals.length > 0
            ? (daos[daoKey].votes / daoProposals.length) * 100
            : 0;
      }
    });

    // Recent activity (last 30 days)
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const recentVotes = votes.filter(v => v.timestamp >= thirtyDaysAgo);
    const recentProposals = allProposals.filter(p => p.startDate >= thirtyDaysAgo);

    const recentActivity: Array<{ date: number; proposals: number; votes: number }> = [];
    for (let i = 29; i >= 0; i--) {
      const date = Date.now() - i * 24 * 60 * 60 * 1000;
      const dayStart = new Date(date).setHours(0, 0, 0, 0);
      const dayEnd = new Date(date).setHours(23, 59, 59, 999);

      const dayProposals = recentProposals.filter(
        p => p.startDate >= dayStart && p.startDate <= dayEnd
      ).length;

      const dayVotes = recentVotes.filter(
        v => v.timestamp >= dayStart && v.timestamp <= dayEnd
      ).length;

      recentActivity.push({
        date: dayStart,
        proposals: dayProposals,
        votes: dayVotes,
      });
    }

    return {
      walletAddress: walletKey,
      totalProposals: allProposals.length,
      votedProposals: votedProposals.length,
      participationRate:
        allProposals.length > 0
          ? (votedProposals.length / allProposals.length) * 100
          : 0,
      totalVotingPower,
      averageVotingPower,
      daos,
      votingHistory: votes.sort((a, b) => b.timestamp - a.timestamp),
      recentActivity,
    };
  }

  /**
   * Get proposals for a DAO
   */
  getProposals(dao: string, chainId: number): GovernanceProposal[] {
    const daoKey = `${dao.toLowerCase()}-${chainId}`;
    return this.proposals.get(daoKey) || [];
  }

  /**
   * Get votes for a wallet
   */
  getVotes(
    walletAddress: string,
    options: {
      proposalId?: string;
      dao?: string;
      limit?: number;
    } = {}
  ): GovernanceVote[] {
    const walletKey = walletAddress.toLowerCase();
    let votes = this.votes.get(walletKey) || [];

    if (options.proposalId) {
      votes = votes.filter(v => v.proposalId === options.proposalId);
    }

    if (options.dao) {
      // Filter by DAO through proposals
      const daoProposals = this.getProposals(options.dao, votes[0]?.chainId || 1);
      const proposalIds = new Set(daoProposals.map(p => p.id));
      votes = votes.filter(v => proposalIds.has(v.proposalId));
    }

    votes.sort((a, b) => b.timestamp - a.timestamp);

    if (options.limit) {
      votes = votes.slice(0, options.limit);
    }

    return votes;
  }

  /**
   * Get active proposals
   */
  getActiveProposals(dao?: string, chainId?: number): GovernanceProposal[] {
    const now = Date.now();
    let allProposals: GovernanceProposal[] = [];

    if (dao && chainId) {
      allProposals = this.getProposals(dao, chainId);
    } else {
      this.proposals.forEach(daoProposals => {
        allProposals.push(...daoProposals);
      });
    }

    return allProposals.filter(
      p => p.status === 'active' && p.startDate <= now && p.endDate >= now
    );
  }
}

// Singleton instance
export const governanceTracker = new GovernanceTracker();
