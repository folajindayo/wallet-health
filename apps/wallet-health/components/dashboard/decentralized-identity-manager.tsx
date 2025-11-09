'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Fingerprint, 
  Shield,
  CheckCircle2,
  XCircle,
  AlertCircle,
  User,
  Mail,
  Phone,
  Globe,
  Twitter,
  Github,
  Linkedin,
  Key,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Copy,
  Share2,
  Download,
  Upload,
  Plus,
  Edit,
  Trash2,
  Award,
  Star,
  QrCode,
  ExternalLink,
  Clock,
  Activity,
  Target,
  Settings
} from 'lucide-react';
import { useState } from 'react';

interface IdentityCredential {
  id: string;
  type: 'kyc' | 'social' | 'professional' | 'education' | 'reputation' | 'custom';
  name: string;
  issuer: string;
  issuedDate: Date;
  expiryDate?: Date;
  verified: boolean;
  status: 'active' | 'pending' | 'expired' | 'revoked';
  visibility: 'public' | 'private' | 'selective';
  data: Record<string, any>;
  icon: any;
  proofUrl?: string;
}

interface IdentityProfile {
  id: string;
  displayName: string;
  bio: string;
  avatar: string;
  walletAddress: string;
  ensName?: string;
  verified: boolean;
  reputationScore: number;
  credentialCount: number;
  verifiedCredentials: number;
  socialLinks: {
    twitter?: string;
    github?: string;
    linkedin?: string;
    website?: string;
  };
}

interface VerificationRequest {
  id: string;
  type: string;
  provider: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedDate: Date;
  icon: any;
}

interface DataAccessRequest {
  id: string;
  requester: string;
  requestedData: string[];
  purpose: string;
  timestamp: Date;
  status: 'pending' | 'approved' | 'rejected';
  expiresAt: Date;
}

interface DecentralizedIdentityManagerProps {
  walletAddress: string;
}

export function DecentralizedIdentityManager({ walletAddress }: DecentralizedIdentityManagerProps) {
  const [selectedTab, setSelectedTab] = useState<'profile' | 'credentials' | 'requests' | 'privacy'>('profile');
  const [showPrivateData, setShowPrivateData] = useState(false);

  // Mock identity profile
  const profile: IdentityProfile = {
    id: '1',
    displayName: 'Crypto Enthusiast',
    bio: 'Web3 builder and DeFi investor. Building the future of finance.',
    avatar: '👤',
    walletAddress,
    ensName: 'cryptouser.eth',
    verified: true,
    reputationScore: 87,
    credentialCount: 12,
    verifiedCredentials: 9,
    socialLinks: {
      twitter: '@cryptouser',
      github: 'cryptouser',
      website: 'https://myportfolio.eth',
    },
  };

  // Mock credentials
  const credentials: IdentityCredential[] = [
    {
      id: '1',
      type: 'kyc',
      name: 'KYC Verification',
      issuer: 'Civic',
      issuedDate: new Date(Date.now() - 86400000 * 90),
      verified: true,
      status: 'active',
      visibility: 'private',
      data: {
        level: 'Level 2',
        country: 'United States',
      },
      icon: Shield,
      proofUrl: 'ipfs://QmX...',
    },
    {
      id: '2',
      type: 'social',
      name: 'Twitter Verification',
      issuer: 'Twitter OAuth',
      issuedDate: new Date(Date.now() - 86400000 * 120),
      verified: true,
      status: 'active',
      visibility: 'public',
      data: {
        handle: '@cryptouser',
        followers: '12.5K',
      },
      icon: Twitter,
    },
    {
      id: '3',
      type: 'professional',
      name: 'GitHub Contributions',
      issuer: 'GitHub',
      issuedDate: new Date(Date.now() - 86400000 * 60),
      verified: true,
      status: 'active',
      visibility: 'public',
      data: {
        username: 'cryptouser',
        repos: 45,
        stars: 1200,
      },
      icon: Github,
    },
    {
      id: '4',
      type: 'reputation',
      name: 'Gitcoin Passport',
      issuer: 'Gitcoin',
      issuedDate: new Date(Date.now() - 86400000 * 180),
      verified: true,
      status: 'active',
      visibility: 'public',
      data: {
        score: 87,
        stamps: 15,
      },
      icon: Award,
      proofUrl: 'https://passport.gitcoin.co',
    },
    {
      id: '5',
      type: 'reputation',
      name: 'Proof of Humanity',
      issuer: 'PoH DAO',
      issuedDate: new Date(Date.now() - 86400000 * 365),
      verified: true,
      status: 'active',
      visibility: 'public',
      data: {
        registered: true,
        vouched: 5,
      },
      icon: User,
      proofUrl: 'https://proofofhumanity.id',
    },
    {
      id: '6',
      type: 'professional',
      name: 'LinkedIn Profile',
      issuer: 'LinkedIn',
      issuedDate: new Date(Date.now() - 86400000 * 45),
      verified: false,
      status: 'pending',
      visibility: 'private',
      data: {
        connections: '500+',
      },
      icon: Linkedin,
    },
    {
      id: '7',
      type: 'education',
      name: 'Smart Contract Developer',
      issuer: 'Alchemy University',
      issuedDate: new Date(Date.now() - 86400000 * 200),
      expiryDate: new Date(Date.now() + 86400000 * 165),
      verified: true,
      status: 'active',
      visibility: 'public',
      data: {
        course: 'Smart Contract Development',
        grade: 'A',
      },
      icon: Award,
      proofUrl: 'https://university.alchemy.com/cert/...',
    },
    {
      id: '8',
      type: 'reputation',
      name: 'ENS Domain Holder',
      issuer: 'ENS',
      issuedDate: new Date(Date.now() - 86400000 * 400),
      expiryDate: new Date(Date.now() + 86400000 * 365),
      verified: true,
      status: 'active',
      visibility: 'public',
      data: {
        domain: 'cryptouser.eth',
        years: 2,
      },
      icon: Globe,
    },
  ];

  // Mock verification requests
  const verificationRequests: VerificationRequest[] = [
    {
      id: '1',
      type: 'Email Verification',
      provider: 'Email',
      status: 'approved',
      requestedDate: new Date(Date.now() - 86400000 * 5),
      icon: Mail,
    },
    {
      id: '2',
      type: 'Phone Verification',
      provider: 'Twilio',
      status: 'pending',
      requestedDate: new Date(Date.now() - 86400000 * 1),
      icon: Phone,
    },
  ];

  // Mock data access requests
  const accessRequests: DataAccessRequest[] = [
    {
      id: '1',
      requester: 'DeFi Protocol X',
      requestedData: ['KYC Status', 'Country'],
      purpose: 'Compliance verification for platform access',
      timestamp: new Date(Date.now() - 3600000 * 2),
      status: 'pending',
      expiresAt: new Date(Date.now() + 86400000 * 7),
    },
    {
      id: '2',
      requester: 'NFT Marketplace Y',
      requestedData: ['Twitter Handle', 'Reputation Score'],
      purpose: 'Creator verification for NFT minting',
      timestamp: new Date(Date.now() - 86400000 * 1),
      status: 'approved',
      expiresAt: new Date(Date.now() + 86400000 * 30),
    },
    {
      id: '3',
      requester: 'DAO Governance Platform',
      requestedData: ['GitHub Profile', 'ENS Name'],
      purpose: 'Member verification for voting rights',
      timestamp: new Date(Date.now() - 86400000 * 3),
      status: 'rejected',
      expiresAt: new Date(Date.now() - 86400000 * 1),
    },
  ];

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getTypeBadge = (type: string) => {
    const styles: Record<string, any> = {
      kyc: { variant: 'success', label: 'KYC' },
      social: { variant: 'info', label: 'Social' },
      professional: { variant: 'default', label: 'Professional' },
      education: { variant: 'warning', label: 'Education' },
      reputation: { variant: 'outline', label: 'Reputation' },
      custom: { variant: 'outline', label: 'Custom' },
    };
    const style = styles[type] || { variant: 'outline', label: type };
    return <Badge variant={style.variant}>{style.label}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="secondary" className="gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Active
        </Badge>;
      case 'pending':
        return <Badge variant="outline" className="gap-1">
          <Clock className="h-3 w-3" />
          Pending
        </Badge>;
      case 'expired':
        return <Badge variant="destructive" className="gap-1">
          <AlertCircle className="h-3 w-3" />
          Expired
        </Badge>;
      case 'revoked':
        return <Badge variant="destructive" className="gap-1">
          <XCircle className="h-3 w-3" />
          Revoked
        </Badge>;
      default:
        return null;
    }
  };

  const getVisibilityBadge = (visibility: string) => {
    switch (visibility) {
      case 'public':
        return <Badge variant="outline" className="gap-1">
          <Eye className="h-3 w-3" />
          Public
        </Badge>;
      case 'private':
        return <Badge variant="outline" className="gap-1">
          <EyeOff className="h-3 w-3" />
          Private
        </Badge>;
      case 'selective':
        return <Badge variant="outline" className="gap-1">
          <Target className="h-3 w-3" />
          Selective
        </Badge>;
      default:
        return null;
    }
  };

  const getRequestStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'approved':
        return <Badge variant="secondary">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
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
              <Fingerprint className="h-5 w-5" />
              Decentralized Identity Manager
            </CardTitle>
            <CardDescription>
              Manage your Web3 identity and verifiable credentials
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Credential
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 text-center">
            <p className="text-2xl font-bold text-primary">{profile.reputationScore}</p>
            <p className="text-xs text-muted-foreground">Reputation Score</p>
          </div>
          <div className="p-3 rounded-lg border border-border bg-card text-center">
            <p className="text-2xl font-bold">{profile.credentialCount}</p>
            <p className="text-xs text-muted-foreground">Total Credentials</p>
          </div>
          <div className="p-3 rounded-lg border border-green-500/20 bg-green-500/5 text-center">
            <p className="text-2xl font-bold text-green-500">{profile.verifiedCredentials}</p>
            <p className="text-xs text-muted-foreground">Verified</p>
          </div>
          <div className="p-3 rounded-lg border border-border bg-card text-center">
            <p className="text-2xl font-bold">{accessRequests.filter(r => r.status === 'pending').length}</p>
            <p className="text-xs text-muted-foreground">Pending Requests</p>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="mb-6 flex gap-2">
          <Button
            size="sm"
            variant={selectedTab === 'profile' ? 'default' : 'outline'}
            onClick={() => setSelectedTab('profile')}
          >
            <User className="h-4 w-4 mr-2" />
            Profile
          </Button>
          <Button
            size="sm"
            variant={selectedTab === 'credentials' ? 'default' : 'outline'}
            onClick={() => setSelectedTab('credentials')}
          >
            <Award className="h-4 w-4 mr-2" />
            Credentials ({credentials.length})
          </Button>
          <Button
            size="sm"
            variant={selectedTab === 'requests' ? 'default' : 'outline'}
            onClick={() => setSelectedTab('requests')}
          >
            <Activity className="h-4 w-4 mr-2" />
            Requests
          </Button>
          <Button
            size="sm"
            variant={selectedTab === 'privacy' ? 'default' : 'outline'}
            onClick={() => setSelectedTab('privacy')}
          >
            <Lock className="h-4 w-4 mr-2" />
            Privacy
          </Button>
        </div>

        {/* Profile Tab */}
        {selectedTab === 'profile' && (
          <div className="space-y-4 mb-6">
            {/* Profile Card */}
            <div className="p-6 rounded-lg border border-border bg-gradient-to-br from-primary/5 to-transparent">
              <div className="flex items-start gap-4 mb-4">
                <div className="text-6xl">{profile.avatar}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-2xl font-bold">{profile.displayName}</h3>
                    {profile.verified && (
                      <Badge variant="secondary" className="gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  {profile.ensName && (
                    <p className="text-sm text-primary mb-2">{profile.ensName}</p>
                  )}
                  <p className="text-sm text-muted-foreground mb-3">{profile.bio}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                    <Key className="h-3 w-3" />
                    {formatAddress(profile.walletAddress)}
                    <Button size="sm" variant="ghost" className="h-5 w-5 p-0">
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex gap-3 mb-4">
                {profile.socialLinks.twitter && (
                  <Button size="sm" variant="outline" className="gap-1">
                    <Twitter className="h-3 w-3" />
                    {profile.socialLinks.twitter}
                  </Button>
                )}
                {profile.socialLinks.github && (
                  <Button size="sm" variant="outline" className="gap-1">
                    <Github className="h-3 w-3" />
                    {profile.socialLinks.github}
                  </Button>
                )}
                {profile.socialLinks.website && (
                  <Button size="sm" variant="outline" className="gap-1">
                    <Globe className="h-3 w-3" />
                    Website
                  </Button>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
                <Button size="sm" variant="outline">
                  <QrCode className="h-4 w-4 mr-2" />
                  Show QR
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            {/* Reputation Breakdown */}
            <div className="p-4 rounded-lg border border-border">
              <h4 className="text-sm font-semibold mb-3">Reputation Breakdown</h4>
              <div className="space-y-2">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span>Identity Verification</span>
                    <span className="font-bold">95/100</span>
                  </div>
                  <div className="h-2 rounded-full bg-border overflow-hidden">
                    <div className="h-full bg-green-500" style={{ width: '95%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span>Social Presence</span>
                    <span className="font-bold">82/100</span>
                  </div>
                  <div className="h-2 rounded-full bg-border overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: '82%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span>Professional Credentials</span>
                    <span className="font-bold">78/100</span>
                  </div>
                  <div className="h-2 rounded-full bg-border overflow-hidden">
                    <div className="h-full bg-purple-500" style={{ width: '78%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Credentials Tab */}
        {selectedTab === 'credentials' && (
          <div className="space-y-3 mb-6">
            {credentials.map((credential) => {
              const IconComponent = credential.icon;
              
              return (
                <div
                  key={credential.id}
                  className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <IconComponent className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h5 className="font-semibold">{credential.name}</h5>
                          {getTypeBadge(credential.type)}
                          {getStatusBadge(credential.status)}
                          {getVisibilityBadge(credential.visibility)}
                          {credential.verified && (
                            <Badge variant="secondary" className="gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Issued by: {credential.issuer}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                          <span>Issued: {formatDate(credential.issuedDate)}</span>
                          {credential.expiryDate && (
                            <>
                              <span>•</span>
                              <span>Expires: {formatDate(credential.expiryDate)}</span>
                            </>
                          )}
                        </div>
                        {Object.keys(credential.data).length > 0 && (
                          <div className="flex gap-2 flex-wrap">
                            {Object.entries(credential.data).map(([key, value]) => (
                              <Badge key={key} variant="outline" className="text-xs">
                                {key}: {value}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Settings className="h-4 w-4 mr-2" />
                      Manage
                    </Button>
                    {credential.proofUrl && (
                      <Button size="sm" variant="outline">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Proof
                      </Button>
                    )}
                    <Button size="sm" variant="outline">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Requests Tab */}
        {selectedTab === 'requests' && (
          <div className="space-y-4 mb-6">
            <div>
              <h4 className="text-sm font-semibold mb-3">Data Access Requests</h4>
              <div className="space-y-3">
                {accessRequests.map((request) => (
                  <div
                    key={request.id}
                    className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h5 className="font-semibold">{request.requester}</h5>
                          {getRequestStatusBadge(request.status)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {request.purpose}
                        </p>
                        <div className="flex gap-2 flex-wrap mb-2">
                          {request.requestedData.map((data) => (
                            <Badge key={data} variant="outline" className="text-xs">
                              {data}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Requested: {formatDate(request.timestamp)} • Expires: {formatDate(request.expiresAt)}
                        </p>
                      </div>
                    </div>
                    {request.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="default">
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button size="sm" variant="destructive">
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-3">Verification Requests</h4>
              <div className="space-y-3">
                {verificationRequests.map((request) => {
                  const IconComponent = request.icon;
                  return (
                    <div
                      key={request.id}
                      className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <IconComponent className="h-5 w-5 text-primary" />
                          <div>
                            <h5 className="font-semibold text-sm">{request.type}</h5>
                            <p className="text-xs text-muted-foreground">
                              Provider: {request.provider} • {formatDate(request.requestedDate)}
                            </p>
                          </div>
                        </div>
                        {getRequestStatusBadge(request.status)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Privacy Tab */}
        {selectedTab === 'privacy' && (
          <div className="space-y-4 mb-6">
            <div className="p-4 rounded-lg border border-yellow-500/20 bg-yellow-500/5">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold mb-1">Privacy Control</h4>
                  <p className="text-xs text-muted-foreground">
                    You have full control over your data. Choose what to share and with whom.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-border">
              <h4 className="text-sm font-semibold mb-3">Data Visibility Settings</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Profile Information</p>
                    <p className="text-xs text-muted-foreground">Display name, bio, avatar</p>
                  </div>
                  <Badge variant="outline">Public</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Wallet Address</p>
                    <p className="text-xs text-muted-foreground">Your primary wallet address</p>
                  </div>
                  <Badge variant="outline">Public</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">KYC Information</p>
                    <p className="text-xs text-muted-foreground">Identity verification data</p>
                  </div>
                  <Badge variant="outline" className="gap-1">
                    <EyeOff className="h-3 w-3" />
                    Private
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Social Connections</p>
                    <p className="text-xs text-muted-foreground">Linked social accounts</p>
                  </div>
                  <Badge variant="outline" className="gap-1">
                    <Target className="h-3 w-3" />
                    Selective
                  </Badge>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-border">
              <h4 className="text-sm font-semibold mb-3">Data Management</h4>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export All Data
                </Button>
                <Button size="sm" variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Import Credentials
                </Button>
                <Button size="sm" variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
          <h4 className="text-sm font-semibold mb-2">🔐 Decentralized Identity</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Own and control your digital identity</li>
            <li>• Verifiable credentials stored on-chain</li>
            <li>• Selective disclosure - share only what's needed</li>
            <li>• Portable identity across platforms</li>
            <li>• Privacy-preserving verification</li>
            <li>• Build reputation and trust in Web3</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

