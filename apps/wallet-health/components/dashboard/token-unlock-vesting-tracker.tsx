'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Unlock, 
  Lock,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  Target,
  Activity,
  AlertCircle,
  CheckCircle2,
  Bell,
  Download,
  Plus,
  BarChart3,
  PieChart,
  Zap,
  Award,
  Gift,
  Users,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useState } from 'react';

interface VestingSchedule {
  id: string;
  token: string;
  tokenLogo: string;
  type: 'linear' | 'cliff' | 'milestone' | 'custom';
  totalAmount: number;
  vestedAmount: number;
  lockedAmount: number;
  claimableAmount: number;
  currentPrice: number;
  totalValue: number;
  claimedValue: number;
  lockedValue: number;
  claimableValue: number;
  startDate: Date;
  endDate: Date;
  cliffDate?: Date;
  nextUnlock: Date;
  nextUnlockAmount: number;
  percentageVested: number;
  unlockFrequency: string;
  category: 'airdrop' | 'ico' | 'team' | 'advisor' | 'seed' | 'private' | 'public';
  protocol: string;
  status: 'active' | 'completed' | 'cancelled';
}

interface UnlockEvent {
  id: string;
  scheduleId: string;
  token: string;
  tokenLogo: string;
  amount: number;
  value: number;
  unlockDate: Date;
  claimed: boolean;
  claimDate?: Date;
  txHash?: string;
}

interface UpcomingUnlock {
  date: Date;
  events: {
    token: string;
    logo: string;
    amount: number;
    value: number;
  }[];
  totalValue: number;
}

interface TokenUnlockVestingTrackerProps {
  walletAddress: string;
}

export function TokenUnlockVestingTracker({ walletAddress }: TokenUnlockVestingTrackerProps) {
  const [selectedView, setSelectedView] = useState<'schedules' | 'calendar' | 'history'>('schedules');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all');

  // Mock vesting schedules
  const vestingSchedules: VestingSchedule[] = [
    {
      id: '1',
      token: 'PROJECT-A',
      tokenLogo: '🚀',
      type: 'linear',
      totalAmount: 100000,
      vestedAmount: 45000,
      lockedAmount: 55000,
      claimableAmount: 5000,
      currentPrice: 2.5,
      totalValue: 250000,
      claimedValue: 100000,
      lockedValue: 137500,
      claimableValue: 12500,
      startDate: new Date(Date.now() - 86400000 * 180),
      endDate: new Date(Date.now() + 86400000 * 185),
      nextUnlock: new Date(Date.now() + 86400000 * 15),
      nextUnlockAmount: 5000,
      percentageVested: 45,
      unlockFrequency: 'Monthly',
      category: 'seed',
      protocol: 'Project A',
      status: 'active',
    },
    {
      id: '2',
      token: 'DEFI-TOKEN',
      tokenLogo: '💎',
      type: 'cliff',
      totalAmount: 50000,
      vestedAmount: 0,
      lockedAmount: 50000,
      claimableAmount: 0,
      currentPrice: 5.0,
      totalValue: 250000,
      claimedValue: 0,
      lockedValue: 250000,
      claimableValue: 0,
      startDate: new Date(Date.now() - 86400000 * 30),
      endDate: new Date(Date.now() + 86400000 * 335),
      cliffDate: new Date(Date.now() + 86400000 * 60),
      nextUnlock: new Date(Date.now() + 86400000 * 60),
      nextUnlockAmount: 12500,
      percentageVested: 0,
      unlockFrequency: 'Quarterly after cliff',
      category: 'private',
      protocol: 'DeFi Protocol',
      status: 'active',
    },
    {
      id: '3',
      token: 'AIRDROP-XYZ',
      tokenLogo: '🎁',
      type: 'milestone',
      totalAmount: 25000,
      vestedAmount: 15000,
      lockedAmount: 10000,
      claimableAmount: 2500,
      currentPrice: 0.8,
      totalValue: 20000,
      claimedValue: 9600,
      lockedValue: 8000,
      claimableValue: 2000,
      startDate: new Date(Date.now() - 86400000 * 90),
      endDate: new Date(Date.now() + 86400000 * 90),
      nextUnlock: new Date(Date.now() + 86400000 * 30),
      nextUnlockAmount: 2500,
      percentageVested: 60,
      unlockFrequency: 'Milestone-based',
      category: 'airdrop',
      protocol: 'XYZ Protocol',
      status: 'active',
    },
    {
      id: '4',
      token: 'TEAM-COIN',
      tokenLogo: '👥',
      type: 'linear',
      totalAmount: 200000,
      vestedAmount: 200000,
      lockedAmount: 0,
      claimableAmount: 0,
      currentPrice: 1.2,
      totalValue: 240000,
      claimedValue: 240000,
      lockedValue: 0,
      claimableValue: 0,
      startDate: new Date(Date.now() - 86400000 * 730),
      endDate: new Date(Date.now() - 86400000 * 30),
      nextUnlock: new Date(Date.now() - 86400000 * 30),
      nextUnlockAmount: 0,
      percentageVested: 100,
      unlockFrequency: 'Monthly',
      category: 'team',
      protocol: 'Team Allocation',
      status: 'completed',
    },
  ];

  // Mock unlock events
  const unlockEvents: UnlockEvent[] = [
    {
      id: '1',
      scheduleId: '1',
      token: 'PROJECT-A',
      tokenLogo: '🚀',
      amount: 5000,
      value: 12500,
      unlockDate: new Date(Date.now() - 86400000 * 15),
      claimed: true,
      claimDate: new Date(Date.now() - 86400000 * 14),
      txHash: '0xabcd1234...',
    },
    {
      id: '2',
      scheduleId: '3',
      token: 'AIRDROP-XYZ',
      tokenLogo: '🎁',
      amount: 2500,
      value: 2000,
      unlockDate: new Date(Date.now() - 86400000 * 30),
      claimed: true,
      claimDate: new Date(Date.now() - 86400000 * 28),
      txHash: '0xefgh5678...',
    },
    {
      id: '3',
      scheduleId: '1',
      token: 'PROJECT-A',
      tokenLogo: '🚀',
      amount: 5000,
      value: 12500,
      unlockDate: new Date(Date.now() + 86400000 * 15),
      claimed: false,
    },
    {
      id: '4',
      scheduleId: '2',
      token: 'DEFI-TOKEN',
      tokenLogo: '💎',
      amount: 12500,
      value: 62500,
      unlockDate: new Date(Date.now() + 86400000 * 60),
      claimed: false,
    },
  ];

  // Group upcoming unlocks by date
  const upcomingUnlocks: UpcomingUnlock[] = [];
  const futureEvents = unlockEvents
    .filter(e => !e.claimed && e.unlockDate > new Date())
    .sort((a, b) => a.unlockDate.getTime() - b.unlockDate.getTime());

  futureEvents.forEach(event => {
    const dateKey = event.unlockDate.toDateString();
    let unlock = upcomingUnlocks.find(u => u.date.toDateString() === dateKey);
    
    if (!unlock) {
      unlock = {
        date: event.unlockDate,
        events: [],
        totalValue: 0,
      };
      upcomingUnlocks.push(unlock);
    }
    
    unlock.events.push({
      token: event.token,
      logo: event.tokenLogo,
      amount: event.amount,
      value: event.value,
    });
    unlock.totalValue += event.value;
  });

  const filteredSchedules = vestingSchedules.filter(schedule => {
    if (filterStatus === 'all') return true;
    return schedule.status === filterStatus;
  });

  const totalLockedValue = vestingSchedules.reduce((sum, s) => sum + s.lockedValue, 0);
  const totalClaimableValue = vestingSchedules.reduce((sum, s) => sum + s.claimableValue, 0);
  const totalVestedValue = vestingSchedules.reduce((sum, s) => sum + s.claimedValue, 0);
  const activeSchedules = vestingSchedules.filter(s => s.status === 'active').length;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const getDaysUntil = (date: Date) => {
    const days = Math.floor((date.getTime() - Date.now()) / 86400000);
    if (days < 0) return 'Passed';
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    return `${days} days`;
  };

  const getTypeBadge = (type: string) => {
    const styles: Record<string, any> = {
      linear: { variant: 'default', label: 'Linear' },
      cliff: { variant: 'warning', label: 'Cliff' },
      milestone: { variant: 'info', label: 'Milestone' },
      custom: { variant: 'outline', label: 'Custom' },
    };
    const style = styles[type] || { variant: 'outline', label: type };
    return <Badge variant={style.variant}>{style.label}</Badge>;
  };

  const getCategoryBadge = (category: string) => {
    const styles: Record<string, any> = {
      airdrop: { variant: 'success', label: 'Airdrop', icon: Gift },
      ico: { variant: 'info', label: 'ICO', icon: Sparkles },
      team: { variant: 'default', label: 'Team', icon: Users },
      advisor: { variant: 'warning', label: 'Advisor', icon: Award },
      seed: { variant: 'outline', label: 'Seed', icon: Target },
      private: { variant: 'outline', label: 'Private', icon: Lock },
      public: { variant: 'outline', label: 'Public', icon: Unlock },
    };
    const style = styles[category] || { variant: 'outline', label: category, icon: Activity };
    const IconComponent = style.icon;
    return (
      <Badge variant={style.variant} className="gap-1">
        <IconComponent className="h-3 w-3" />
        {style.label}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'completed':
        return <Badge variant="outline">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Unlock className="h-5 w-5" />
              Token Unlock & Vesting Tracker
            </CardTitle>
            <CardDescription>
              Track your vesting schedules and upcoming token unlocks
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              <Bell className="h-4 w-4 mr-2" />
              Set Alerts
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Schedule
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="p-3 rounded-lg border border-yellow-500/20 bg-yellow-500/5 text-center">
            <p className="text-2xl font-bold text-yellow-500">{formatCurrency(totalLockedValue)}</p>
            <p className="text-xs text-muted-foreground">Locked Value</p>
          </div>
          <div className="p-3 rounded-lg border border-green-500/20 bg-green-500/5 text-center">
            <p className="text-2xl font-bold text-green-500">{formatCurrency(totalClaimableValue)}</p>
            <p className="text-xs text-muted-foreground">Claimable Now</p>
          </div>
          <div className="p-3 rounded-lg border border-border bg-card text-center">
            <p className="text-2xl font-bold">{formatCurrency(totalVestedValue)}</p>
            <p className="text-xs text-muted-foreground">Already Claimed</p>
          </div>
          <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 text-center">
            <p className="text-2xl font-bold text-primary">{activeSchedules}</p>
            <p className="text-xs text-muted-foreground">Active Schedules</p>
          </div>
        </div>

        {/* View Selector */}
        <div className="mb-6 flex gap-2">
          <Button
            size="sm"
            variant={selectedView === 'schedules' ? 'default' : 'outline'}
            onClick={() => setSelectedView('schedules')}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Schedules
          </Button>
          <Button
            size="sm"
            variant={selectedView === 'calendar' ? 'default' : 'outline'}
            onClick={() => setSelectedView('calendar')}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Calendar
          </Button>
          <Button
            size="sm"
            variant={selectedView === 'history' ? 'default' : 'outline'}
            onClick={() => setSelectedView('history')}
          >
            <Clock className="h-4 w-4 mr-2" />
            History
          </Button>
        </div>

        {/* Schedules View */}
        {selectedView === 'schedules' && (
          <>
            {/* Filters */}
            <div className="mb-6 flex gap-2">
              {(['all', 'active', 'completed'] as const).map((status) => (
                <Button
                  key={status}
                  size="sm"
                  variant={filterStatus === status ? 'default' : 'outline'}
                  onClick={() => setFilterStatus(status)}
                  className="capitalize"
                >
                  {status}
                </Button>
              ))}
            </div>

            <div className="space-y-4 mb-6">
              {filteredSchedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className={`p-4 rounded-lg border transition-colors ${
                    schedule.claimableAmount > 0
                      ? 'border-green-500/30 bg-green-500/5'
                      : 'border-border hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="text-5xl">{schedule.tokenLogo}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h5 className="font-bold text-lg">{schedule.token}</h5>
                          {getTypeBadge(schedule.type)}
                          {getCategoryBadge(schedule.category)}
                          {getStatusBadge(schedule.status)}
                          {schedule.claimableAmount > 0 && (
                            <Badge variant="success" className="gap-1 animate-pulse">
                              <Zap className="h-3 w-3" />
                              Claimable
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{schedule.protocol}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                          <div>
                            <p className="text-xs text-muted-foreground">Total Amount</p>
                            <p className="text-sm font-bold">
                              {formatNumber(schedule.totalAmount)} ({formatCurrency(schedule.totalValue)})
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Vested</p>
                            <p className="text-sm font-bold">
                              {formatNumber(schedule.vestedAmount)} ({schedule.percentageVested}%)
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Locked</p>
                            <p className="text-sm font-bold text-yellow-500">
                              {formatNumber(schedule.lockedAmount)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Claimable</p>
                            <p className="text-sm font-bold text-green-500">
                              {formatNumber(schedule.claimableAmount)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span>Vesting Progress</span>
                      <span className="font-bold">{schedule.percentageVested}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-border overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-yellow-500 to-green-500 transition-all"
                        style={{ width: `${schedule.percentageVested}%` }}
                      />
                    </div>
                  </div>

                  {/* Schedule Details */}
                  <div className="mb-3 p-3 rounded-lg bg-muted/50">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div>
                        <p className="text-muted-foreground mb-1">Start Date</p>
                        <p className="font-bold">{formatDate(schedule.startDate)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">End Date</p>
                        <p className="font-bold">{formatDate(schedule.endDate)}</p>
                      </div>
                      {schedule.cliffDate && (
                        <div>
                          <p className="text-muted-foreground mb-1">Cliff Date</p>
                          <p className="font-bold">{formatDate(schedule.cliffDate)}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-muted-foreground mb-1">Frequency</p>
                        <p className="font-bold">{schedule.unlockFrequency}</p>
                      </div>
                    </div>
                  </div>

                  {/* Next Unlock */}
                  {schedule.status === 'active' && (
                    <div className="mb-3 p-3 rounded-lg border border-primary/20 bg-primary/5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Next Unlock</p>
                          <p className="text-sm font-bold">
                            {formatNumber(schedule.nextUnlockAmount)} tokens
                            <span className="text-muted-foreground ml-2">
                              ({formatCurrency(schedule.nextUnlockAmount * schedule.currentPrice)})
                            </span>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground mb-1">In</p>
                          <p className="text-sm font-bold text-primary">
                            {getDaysUntil(schedule.nextUnlock)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    {schedule.claimableAmount > 0 && (
                      <Button size="sm" className="gap-1">
                        <CheckCircle2 className="h-4 w-4" />
                        Claim {formatNumber(schedule.claimableAmount)} tokens
                      </Button>
                    )}
                    <Button size="sm" variant="outline">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Calendar View */}
        {selectedView === 'calendar' && (
          <div className="space-y-4 mb-6">
            <h4 className="text-sm font-semibold">Upcoming Unlocks</h4>
            {upcomingUnlocks.slice(0, 10).map((unlock, index) => (
              <div
                key={index}
                className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold">{formatDate(unlock.date)}</p>
                      <p className="text-xs text-muted-foreground">
                        {getDaysUntil(unlock.date)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-500">
                      {formatCurrency(unlock.totalValue)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {unlock.events.length} token{unlock.events.length > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  {unlock.events.map((event, eventIndex) => (
                    <div
                      key={eventIndex}
                      className="flex items-center justify-between p-2 rounded bg-muted/50"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{event.logo}</span>
                        <span className="font-semibold text-sm">{event.token}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">{formatNumber(event.amount)}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(event.value)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* History View */}
        {selectedView === 'history' && (
          <div className="space-y-3 mb-6">
            <h4 className="text-sm font-semibold">Claim History</h4>
            {unlockEvents
              .filter(e => e.claimed)
              .sort((a, b) => (b.claimDate?.getTime() || 0) - (a.claimDate?.getTime() || 0))
              .map((event) => (
                <div
                  key={event.id}
                  className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-3xl">{event.tokenLogo}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-semibold">{event.token}</h5>
                          <Badge variant="success" className="gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Claimed
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Unlocked: {formatDate(event.unlockDate)} • Claimed: {event.claimDate && formatDate(event.claimDate)}
                        </p>
                        {event.txHash && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Tx: {event.txHash}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{formatNumber(event.amount)}</p>
                      <p className="text-sm text-green-500">{formatCurrency(event.value)}</p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Info Box */}
        <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
          <h4 className="text-sm font-semibold mb-2">🔓 Vesting & Unlock Tracker</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Track all your vesting schedules in one place</li>
            <li>• Get notified before tokens unlock</li>
            <li>• Claim tokens directly from the dashboard</li>
            <li>• Monitor total locked value and future unlocks</li>
            <li>• Support for linear, cliff, and milestone vesting</li>
            <li>• Export schedules for tax reporting</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

