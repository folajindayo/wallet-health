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
  description: string;
  proposer: string;
  startBlock: number;
  endBlock: number;
  startTime: number;
  endTime: number;
  status: 'pending' | 'active' | 'succeeded' | 'defeated' | 'executed' | 'cancelled';
  votesFor: string;
  votesAgainst: string;
  quorum: string;
  votingPower?: string;
}

export interface GovernanceVote {
  proposalId: string;
  voter: string;
  timestamp: number;
  support: boolean; // true = for, false = against
  votingPower: string;
  votingPowerUSD?: number;
  reason?: string;
  transactionHash: string;
}

export interface GovernancePosition {
  dao: string;
  daoName: string;
  chainId: number;
  tokenAddress: string;
  tokenSymbol: string;
  balance: string;
  balanceUSD?: number;
  votingPower: string;
  delegations?: Array<{
    delegate: string;
    amount: string;
  }>;
}

export interface GovernanceSummary {
  totalProposals: number;
  votedProposals: number;
  participationRate: number;
  totalVotingPower: string;
  totalVotingPowerUSD?: number;
  positions: GovernancePosition[];
  daos: Record<string, {
    dao: string;
    daoName: string;
    proposals: number;
    votes: number;
    participationRate: number;
  }>;
  recentVotes: GovernanceVote[];
}

export class GovernanceTracker {
  private proposals: Map<string, GovernanceProposal[]> = new Map(); // wallet -> proposals
  private votes: Map<string, GovernanceVote[]> = new Map(); // wallet -> votes
  private positions: Map<string, GovernancePosition[]> = new Map(); // wallet -> positions

  /**
   * Add governance proposal
   */
  addProposal(
    walletAddress: string,
    proposal: GovernanceProposal
  ): void {
    const walletKey = walletAddress.toLowerCase();
    if (!this.proposals.has(walletKey)) {
      this.proposals.set(walletKey, []);
    }

    const walletProposals = this.proposals.get(walletKey)!;
    
    // Check if already exists
    if (!walletProposals.find(p => p.id === proposal.id)) {
      walletProposals.push(proposal);
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

    this.votes.get(walletKey)!.push(vote);
  }

  /**
   * Add governance position
   */
  addPosition(
    walletAddress: string,
    position: GovernancePosition
  ): void {
    const walletKey = walletAddress.toLowerCase();
    if (!this.positions.has(walletKey)) {
      this.positions.set(walletKey, []);
    }

    const walletPositions = this.positions.get(walletKey)!;
    
    // Update if exists, otherwise add
    const existingIndex = walletPositions.findIndex(
      p => p.dao === position.dao && p.chainId === position.chainId
    );

    if (existingIndex >= 0) {
      walletPositions[existingIndex] = position;
    } else {
      walletPositions.push(position);
    }
  }

  /**
   * Get governance summary
   */
  getSummary(walletAddress: string): GovernanceSummary {
    const walletKey = walletAddress.toLowerCase();
    const proposals = this.proposals.get(walletKey) || [];
    const votes = this.votes.get(walletKey) || [];
    const positions = this.positions.get(walletKey) || [];

    const votedProposalIds = new Set(votes.map(v => v.proposalId));
    const participationRate = proposals.length > 0
      ? (votedProposalIds.size / proposals.length) * 100
      : 0;

    const totalVotingPower = positions.reduce(
      (sum, p) => sum + BigInt(p.votingPower || '0'),
      BigInt(0)
    ).toString();

    const totalVotingPowerUSD = positions.reduce(
      (sum, p) => sum + (p.balanceUSD || 0),
      0
    );

    // DAO breakdown
    const daos: Record<string, {
      dao: string;
      daoName: string;
      proposals: number;
      votes: number;
      participationRate: number;
    }> = {};

    proposals.forEach(proposal => {
      if (!daos[proposal.dao]) {
        daos[proposal.dao] = {
          dao: proposal.dao,
          daoName: proposal.daoName,
          proposals: 0,
          votes: 0,
          participationRate: 0,
        };
      }
      daos[proposal.dao].proposals++;
    });

    votes.forEach(vote => {
      const proposal = proposals.find(p => p.id === vote.proposalId);
      if (proposal && daos[proposal.dao]) {
        daos[proposal.dao].votes++;
      }
    });

    // Calculate participation rate per DAO
    Object.values(daos).forEach(dao => {
      dao.participationRate = dao.proposals > 0
        ? (dao.votes / dao.proposals) * 100
        : 0;
    });

    // Recent votes (last 10)
    const recentVotes = votes
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10);

    return {
      totalProposals: proposals.length,
      votedProposals: votedProposalIds.size,
      participationRate: Math.round(participationRate * 100) / 100,
      totalVotingPower,
      totalVotingPowerUSD,
      positions,
      daos,
      recentVotes,
    };
  }

  /**
   * Get proposals for a DAO
   */
  getProposals(
    walletAddress: string,
    dao?: string,
    status?: GovernanceProposal['status']
  ): GovernanceProposal[] {
    const walletKey = walletAddress.toLowerCase();
    let proposals = this.proposals.get(walletKey) || [];

    if (dao) {
      proposals = proposals.filter(p => p.dao === dao);
    }

    if (status) {
      proposals = proposals.filter(p => p.status === status);
    }

    return proposals.sort((a, b) => b.startTime - a.startTime);
  }

  /**
   * Get votes for a proposal
   */
  getVotes(
    walletAddress: string,
    proposalId?: string
  ): GovernanceVote[] {
    const walletKey = walletAddress.toLowerCase();
    let votes = this.votes.get(walletKey) || [];

    if (proposalId) {
      votes = votes.filter(v => v.proposalId === proposalId);
    }

    return votes.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Get active proposals
   */
  getActiveProposals(walletAddress: string): GovernanceProposal[] {
    const now = Date.now();
    return this.getProposals(walletAddress).filter(
      p => p.status === 'active' && p.startTime <= now && p.endTime >= now
    );
  }

  /**
   * Calculate voting power for a DAO
   */
  getVotingPower(
    walletAddress: string,
    dao: string,
    chainId: number
  ): string {
    const walletKey = walletAddress.toLowerCase();
    const positions = this.positions.get(walletKey) || [];
    
    const position = positions.find(
      p => p.dao === dao && p.chainId === chainId
    );

    return position?.votingPower || '0';
  }
}

// Singleton instance
export const governanceTracker = new GovernanceTracker();
