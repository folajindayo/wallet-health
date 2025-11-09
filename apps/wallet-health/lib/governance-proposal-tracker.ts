/**
 * Governance Proposal Tracker Utility
 * Track DAO governance proposals and voting
 */

export interface GovernanceProposal {
  id: string;
  proposalId: number | string;
  daoAddress: string;
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
  forVotes: string;
  againstVotes: string;
  abstainVotes?: string;
  quorum: string;
  quorumReached: boolean;
  executionETA?: number;
  actions?: Array<{
    target: string;
    value: string;
    signature: string;
    calldata: string;
  }>;
}

export interface Vote {
  proposalId: string | number;
  voter: string;
  support: 'for' | 'against' | 'abstain';
  weight: string;
  timestamp: number;
  transactionHash: string;
}

export interface GovernanceStats {
  daoAddress: string;
  totalProposals: number;
  activeProposals: number;
  userVotes: number;
  participationRate: number; // Percentage
  proposalsByStatus: Record<string, number>;
  topProposers: Array<{
    address: string;
    proposalCount: number;
  }>;
}

export class GovernanceProposalTracker {
  private proposals: Map<string, GovernanceProposal[]> = new Map();
  private votes: Map<string, Vote[]> = new Map();

  /**
   * Add proposal
   */
  addProposal(proposal: Omit<GovernanceProposal, 'id'>): GovernanceProposal {
    const id = `proposal-${proposal.daoAddress.toLowerCase()}-${proposal.proposalId}`;
    const fullProposal: GovernanceProposal = {
      ...proposal,
      id,
    };

    const key = proposal.daoAddress.toLowerCase();
    if (!this.proposals.has(key)) {
      this.proposals.set(key, []);
    }

    this.proposals.get(key)!.push(fullProposal);
    return fullProposal;
  }

  /**
   * Get proposals
   */
  getProposals(daoAddress: string, status?: GovernanceProposal['status']): GovernanceProposal[] {
    const key = daoAddress.toLowerCase();
    let proposals = this.proposals.get(key) || [];

    if (status) {
      proposals = proposals.filter(p => p.status === status);
    }

    return proposals.sort((a, b) => b.startTime - a.startTime);
  }

  /**
   * Get proposal
   */
  getProposal(daoAddress: string, proposalId: number | string): GovernanceProposal | null {
    const proposals = this.getProposals(daoAddress);
    return proposals.find(p => p.proposalId === proposalId) || null;
  }

  /**
   * Add vote
   */
  addVote(vote: Vote): void {
    const key = vote.proposalId.toString();
    if (!this.votes.has(key)) {
      this.votes.set(key, []);
    }

    this.votes.get(key)!.push(vote);
  }

  /**
   * Get votes for proposal
   */
  getVotes(proposalId: string | number): Vote[] {
    const key = proposalId.toString();
    return this.votes.get(key) || [];
  }

  /**
   * Get user votes
   */
  getUserVotes(walletAddress: string): Vote[] {
    const allVotes: Vote[] = [];
    this.votes.forEach(votes => {
      allVotes.push(...votes.filter(v => v.voter.toLowerCase() === walletAddress.toLowerCase()));
    });
    return allVotes.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Get statistics
   */
  getStatistics(daoAddress: string, walletAddress?: string): GovernanceStats {
    const proposals = this.getProposals(daoAddress);
    const activeProposals = proposals.filter(p => p.status === 'active').length;

    // Count proposals by status
    const proposalsByStatus: Record<string, number> = {};
    proposals.forEach(p => {
      proposalsByStatus[p.status] = (proposalsByStatus[p.status] || 0) + 1;
    });

    // Find top proposers
    const proposerCounts = new Map<string, number>();
    proposals.forEach(p => {
      proposerCounts.set(p.proposer.toLowerCase(), (proposerCounts.get(p.proposer.toLowerCase()) || 0) + 1);
    });
    const topProposers = Array.from(proposerCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([address, count]) => ({ address, proposalCount: count }));

    // User participation
    let userVotes = 0;
    let participationRate = 0;

    if (walletAddress) {
      const userVotesList = this.getUserVotes(walletAddress);
      userVotes = userVotesList.length;
      participationRate = proposals.length > 0
        ? (userVotes / proposals.length) * 100
        : 0;
    }

    return {
      daoAddress,
      totalProposals: proposals.length,
      activeProposals,
      userVotes,
      participationRate: Math.round(participationRate * 100) / 100,
      proposalsByStatus,
      topProposers,
    };
  }

  /**
   * Get active proposals
   */
  getActiveProposals(daoAddress?: string): GovernanceProposal[] {
    let allProposals: GovernanceProposal[] = [];
    
    if (daoAddress) {
      allProposals = this.getProposals(daoAddress);
    } else {
      this.proposals.forEach(proposals => {
        allProposals.push(...proposals);
      });
    }

    const now = Date.now();
    return allProposals.filter(p => {
      return p.status === 'active' && p.startTime <= now && p.endTime >= now;
    }).sort((a, b) => a.endTime - b.endTime);
  }

  /**
   * Update proposal status
   */
  updateProposalStatus(
    daoAddress: string,
    proposalId: number | string,
    status: GovernanceProposal['status']
  ): boolean {
    const proposal = this.getProposal(daoAddress, proposalId);
    if (!proposal) {
      return false;
    }

    proposal.status = status;
    return true;
  }

  /**
   * Clear proposals
   */
  clear(daoAddress?: string): void {
    if (daoAddress) {
      this.proposals.delete(daoAddress.toLowerCase());
    } else {
      this.proposals.clear();
      this.votes.clear();
    }
  }
}

// Singleton instance
export const governanceProposalTracker = new GovernanceProposalTracker();

