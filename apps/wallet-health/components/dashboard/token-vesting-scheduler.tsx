'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  TrendingUp,
  Calendar,
  Unlock,
  Lock,
  Plus,
  AlertCircle,
  CheckCircle2,
  Info,
  DollarSign,
  Users
} from 'lucide-react';
import { useState } from 'react';

interface VestingSchedule {
  id: string;
  beneficiary: string;
  beneficiaryName: string;
  token: string;
  totalAmount: number;
  released: number;
  startDate: Date;
  cliffDate: Date;
  endDate: Date;
  vestingType: 'linear' | 'cliff' | 'monthly' | 'quarterly';
  status: 'active' | 'completed' | 'revoked';
  revocable: boolean;
  claimable: number;
}

interface VestingMilestone {
  date: Date;
  amount: number;
  released: boolean;
  description: string;
}

interface TokenVestingSchedulerProps {
  walletAddress: string;
}

export function TokenVestingScheduler({ walletAddress }: TokenVestingSchedulerProps) {
  const [selectedSchedule, setSelectedSchedule] = useState<string | null>(null);

  // Mock vesting schedules
  const schedules: VestingSchedule[] = [
    {
      id: '1',
      beneficiary: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      beneficiaryName: 'Core Team Member #1',
      token: 'PROJECT',
      totalAmount: 100000,
      released: 25000,
      startDate: new Date(Date.now() - 86400000 * 180),
      cliffDate: new Date(Date.now() - 86400000 * 90),
      endDate: new Date(Date.now() + 86400000 * 545),
      vestingType: 'linear',
      status: 'active',
      revocable: true,
      claimable: 8333,
    },
    {
      id: '2',
      beneficiary: '0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD',
      beneficiaryName: 'Advisor',
      token: 'PROJECT',
      totalAmount: 50000,
      released: 50000,
      startDate: new Date(Date.now() - 86400000 * 365),
      cliffDate: new Date(Date.now() - 86400000 * 275),
      endDate: new Date(Date.now() - 86400000 * 1),
      vestingType: 'monthly',
      status: 'completed',
      revocable: false,
      claimable: 0,
    },
    {
      id: '3',
      beneficiary: '0x8315177aB297bA92A06054cE80a67Ed4DBd7ed3a',
      beneficiaryName: 'Investor #5',
      token: 'PROJECT',
      totalAmount: 200000,
      released: 0,
      startDate: new Date(Date.now() - 86400000 * 30),
      cliffDate: new Date(Date.now() + 86400000 * 150),
      endDate: new Date(Date.now() + 86400000 * 545),
      vestingType: 'cliff',
      status: 'active',
      revocable: false,
      claimable: 0,
    },
    {
      id: '4',
      beneficiary: '0x21a31Ee1afC51d94C2eFcCAa2092aD1028285549',
      beneficiaryName: 'Marketing Team',
      token: 'PROJECT',
      totalAmount: 75000,
      released: 18750,
      startDate: new Date(Date.now() - 86400000 * 90),
      cliffDate: new Date(Date.now() - 86400000 * 30),
      endDate: new Date(Date.now() + 86400000 * 275),
      vestingType: 'quarterly',
      status: 'active',
      revocable: true,
      claimable: 18750,
    },
  ];

  // Mock milestones for selected schedule
  const milestones: VestingMilestone[] = [
    {
      date: new Date(Date.now() - 86400000 * 180),
      amount: 0,
      released: true,
      description: 'Vesting Start',
    },
    {
      date: new Date(Date.now() - 86400000 * 90),
      amount: 25000,
      released: true,
      description: 'Cliff Release (25%)',
    },
    {
      date: new Date(Date.now()),
      amount: 8333,
      released: false,
      description: 'Current Period',
    },
    {
      date: new Date(Date.now() + 86400000 * 90),
      amount: 8333,
      released: false,
      description: 'Next Quarter',
    },
    {
      date: new Date(Date.now() + 86400000 * 180),
      amount: 8334,
      released: false,
      description: 'Final Release',
    },
  ];

  const totalVesting = schedules.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalReleased = schedules.reduce((sum, s) => sum + s.released, 0);
  const totalClaimable = schedules.reduce((sum, s) => sum + s.claimable, 0);
  const activeSchedules = schedules.filter(s => s.status === 'active').length;

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const formatTimeUntil = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.floor(diff / 86400000);

    if (diff < 0) return 'Completed';
    if (days < 30) return `${days}d left`;
    const months = Math.floor(days / 30);
    return `${months}mo left`;
  };

  const getProgress = (schedule: VestingSchedule) => {
    return (schedule.released / schedule.totalAmount) * 100;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="gap-1">
          <Clock className="h-3 w-3" />
          Active
        </Badge>;
      case 'completed':
        return <Badge variant="secondary" className="gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Completed
        </Badge>;
      case 'revoked':
        return <Badge variant="destructive">Revoked</Badge>;
      default:
        return null;
    }
  };

  const getVestingTypeBadge = (type: string) => {
    const styles: Record<string, { label: string; variant: any }> = {
      linear: { label: 'Linear', variant: 'default' },
      cliff: { label: 'Cliff', variant: 'warning' },
      monthly: { label: 'Monthly', variant: 'info' },
      quarterly: { label: 'Quarterly', variant: 'success' },
    };
    const style = styles[type] || { label: type, variant: 'outline' };
    return <Badge variant={style.variant}>{style.label}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Token Vesting Scheduler
            </CardTitle>
            <CardDescription>
              Manage token vesting schedules and releases
            </CardDescription>
          </div>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Schedule
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="p-3 rounded-lg border border-border bg-card text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Users className="h-4 w-4 text-primary" />
              <p className="text-2xl font-bold">{activeSchedules}</p>
            </div>
            <p className="text-xs text-muted-foreground">Active Schedules</p>
          </div>
          <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 text-center">
            <p className="text-2xl font-bold text-primary">{formatNumber(totalVesting)}</p>
            <p className="text-xs text-muted-foreground">Total Vesting</p>
          </div>
          <div className="p-3 rounded-lg border border-green-500/20 bg-green-500/5 text-center">
            <p className="text-2xl font-bold text-green-600">{formatNumber(totalReleased)}</p>
            <p className="text-xs text-muted-foreground">Released</p>
          </div>
          <div className="p-3 rounded-lg border border-yellow-500/20 bg-yellow-500/5 text-center">
            <p className="text-2xl font-bold text-yellow-600">{formatNumber(totalClaimable)}</p>
            <p className="text-xs text-muted-foreground">Claimable Now</p>
          </div>
        </div>

        {/* Vesting Overview Chart */}
        <div className="mb-6 p-4 rounded-lg border border-primary/20 bg-primary/5">
          <h4 className="text-sm font-semibold mb-3">Vesting Progress Overview</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm mb-1">
              <span>Total Progress</span>
              <span className="font-bold">{((totalReleased / totalVesting) * 100).toFixed(1)}%</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-green-500 transition-all"
                style={{ width: `${(totalReleased / totalVesting) * 100}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{formatNumber(totalReleased)} released</span>
              <span>{formatNumber(totalVesting - totalReleased)} locked</span>
            </div>
          </div>
        </div>

        {/* Vesting Schedules */}
        <div className="space-y-3 mb-6">
          <h4 className="text-sm font-semibold">Vesting Schedules</h4>
          {schedules.map((schedule) => {
            const progress = getProgress(schedule);
            const isCliffPassed = new Date() >= schedule.cliffDate;

            return (
              <div
                key={schedule.id}
                className={`p-4 rounded-lg border transition-colors ${
                  schedule.status === 'completed'
                    ? 'border-green-500/30 bg-green-500/5'
                    : schedule.status === 'revoked'
                    ? 'border-red-500/30 bg-red-500/5 opacity-60'
                    : 'border-border hover:bg-muted/50 cursor-pointer'
                }`}
                onClick={() => setSelectedSchedule(schedule.id)}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h5 className="font-semibold">{schedule.beneficiaryName}</h5>
                      {getStatusBadge(schedule.status)}
                      {getVestingTypeBadge(schedule.vestingType)}
                      {schedule.revocable && (
                        <Badge variant="outline" className="text-xs">Revocable</Badge>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground font-mono mb-3">
                      {schedule.beneficiary}
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Total Amount</p>
                        <p className="text-sm font-bold">
                          {formatNumber(schedule.totalAmount)} {schedule.token}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Released</p>
                        <p className="text-sm font-bold text-green-600">
                          {formatNumber(schedule.released)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Claimable</p>
                        <p className="text-sm font-bold text-primary">
                          {formatNumber(schedule.claimable)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">End Date</p>
                        <p className="text-sm font-medium">{formatDate(schedule.endDate)}</p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{progress.toFixed(1)}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            schedule.status === 'completed' ? 'bg-green-500' : 'bg-primary'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Cliff Status */}
                    {!isCliffPassed && schedule.status === 'active' && (
                      <div className="p-2 rounded bg-yellow-500/10 border border-yellow-500/20 mb-2">
                        <div className="flex items-center gap-2">
                          <Lock className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                          <p className="text-xs text-yellow-600">
                            Cliff period until {formatDate(schedule.cliffDate)} • {formatTimeUntil(schedule.cliffDate)}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Claimable Alert */}
                    {schedule.claimable > 0 && schedule.status === 'active' && (
                      <div className="p-2 rounded bg-green-500/10 border border-green-500/20">
                        <div className="flex items-center gap-2">
                          <Unlock className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <p className="text-xs text-green-600">
                            {formatNumber(schedule.claimable)} {schedule.token} ready to claim
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                {schedule.status === 'active' && (
                  <div className="flex gap-2">
                    {schedule.claimable > 0 && (
                      <Button size="sm" variant="secondary">
                        <Unlock className="h-4 w-4 mr-2" />
                        Claim Tokens
                      </Button>
                    )}
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                    {schedule.revocable && (
                      <Button size="sm" variant="destructive">
                        Revoke
                      </Button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Milestones Timeline */}
        {selectedSchedule && (
          <div className="mb-6 p-4 rounded-lg border border-primary/20 bg-primary/5">
            <h4 className="text-sm font-semibold mb-4">Vesting Milestones</h4>
            <div className="space-y-3">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className={`mt-1 p-2 rounded-full ${
                    milestone.released
                      ? 'bg-green-500'
                      : index === 2
                      ? 'bg-primary'
                      : 'bg-muted'
                  }`}>
                    {milestone.released ? (
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    ) : (
                      <Clock className="h-4 w-4 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-semibold text-sm">{milestone.description}</h5>
                      {milestone.released && (
                        <Badge variant="secondary" className="text-xs">Released</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">
                      {formatDate(milestone.date)}
                    </p>
                    {milestone.amount > 0 && (
                      <p className="text-sm font-bold text-primary">
                        {formatNumber(milestone.amount)} PROJECT
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
          <h4 className="text-sm font-semibold mb-2">⏳ Vesting Types</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• <strong>Linear:</strong> Tokens unlock gradually over time</li>
            <li>• <strong>Cliff:</strong> All tokens unlock after a specific period</li>
            <li>• <strong>Monthly:</strong> Tokens unlock in equal monthly portions</li>
            <li>• <strong>Quarterly:</strong> Tokens unlock every three months</li>
            <li>• <strong>Revocable:</strong> Schedule can be cancelled by admin</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

