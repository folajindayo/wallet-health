'use client';

import { useAccount, useChainId } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Shield, LogOut, Download, Copy, FileJson, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SecurityScoreCard } from '@/components/dashboard/security-score-card';
import { ApprovalList } from '@/components/dashboard/approval-list';
import { RiskAlerts } from '@/components/dashboard/risk-alerts';
import { TokenList } from '@/components/dashboard/token-list';
import { ChainSelector } from '@/components/dashboard/chain-selector';
import { Recommendations } from '@/components/dashboard/recommendations';
import { ScanHistory } from '@/components/dashboard/scan-history';
import { formatAddress } from '@/lib/utils';
import { useAppKit } from '@reown/appkit/react';
import axios from 'axios';
import { exportAsJSON, exportAsCSV, copyToClipboard } from '@/lib/export-report';
import { calculateRiskScore } from '@/lib/risk-scorer';
import type { WalletScanResult, TokenApproval, TokenInfo, RiskAlert } from '@wallet-health/types';

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const router = useRouter();
  const { open } = useAppKit();

  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<WalletScanResult | null>(null);
  const [scanHistory, setScanHistory] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Redirect to landing if not connected
  useEffect(() => {
    if (!isConnected) {
      router.push('/');
    }
  }, [isConnected, router]);

  // Perform initial scan on mount
  useEffect(() => {
    if (address && chainId) {
      performScan();
      fetchScanHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, chainId]);

  // Fetch scan history
  const fetchScanHistory = async () => {
    if (!address) return;
    
    try {
      const response = await axios.get(`/api/db/scan-history?walletAddress=${address}&limit=10`);
      if (response.data.success) {
        setScanHistory(response.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch scan history:', err);
    }
  };

  const performScan = async () => {
    if (!address) return;

    setIsScanning(true);
    setError(null);

    try {
      // Fetch approvals
      const approvalsRes = await axios.post('/api/scan/approvals', {
        walletAddress: address,
        chainId,
      });
      const approvals: TokenApproval[] = approvalsRes.data.data || [];

      // Fetch tokens
      const tokensRes = await axios.post('/api/scan/tokens', {
        walletAddress: address,
        chainId,
      });
      const tokens: TokenInfo[] = tokensRes.data.data || [];

      // Detect spam
      const spamRes = await axios.post('/api/risk/detect-spam', {
        tokens,
      });
      const analyzedTokens: TokenInfo[] = spamRes.data.data.tokens || tokens;

      // Calculate risk score
      const riskRes = await axios.post('/api/risk/calculate', {
        approvals,
        tokens: analyzedTokens,
        hasENS: false, // TODO: Check for ENS
      });
      const riskScore = riskRes.data.data;

      const result: WalletScanResult = {
        address,
        chainId,
        score: riskScore.score,
        riskLevel: riskScore.riskLevel,
        timestamp: Date.now(),
        approvals,
        tokens: analyzedTokens,
        alerts: riskScore.alerts,
      };

      setScanResult(result);

      // Save to database
      await axios.post('/api/db/save-scan', result);
      
      // Refresh scan history
      fetchScanHistory();
    } catch (err: any) {
      console.error('Scan error:', err);
      setError(err.response?.data?.message || 'Failed to scan wallet. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  if (!isConnected || !address) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Connecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">Wallet Health</span>
              </div>
              <div className="hidden sm:block">
                <span className="text-sm text-muted-foreground">
                  Connected: <span className="font-mono">{formatAddress(address)}</span>
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {scanResult && (
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowExportMenu(!showExportMenu)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  {showExportMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg py-1 z-20">
                      <button
                        className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                        onClick={() => {
                          exportAsJSON(scanResult);
                          setShowExportMenu(false);
                        }}
                      >
                        <FileJson className="h-4 w-4" />
                        Export as JSON
                      </button>
                      <button
                        className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                        onClick={() => {
                          exportAsCSV(scanResult);
                          setShowExportMenu(false);
                        }}
                      >
                        <FileSpreadsheet className="h-4 w-4" />
                        Export as CSV
                      </button>
                      <button
                        className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                        onClick={() => {
                          copyToClipboard(scanResult);
                          setShowExportMenu(false);
                        }}
                      >
                        <Copy className="h-4 w-4" />
                        Copy to Clipboard
                      </button>
                    </div>
                  )}
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => open()}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Disconnect
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive text-destructive">
            {error}
          </div>
        )}

        {isScanning && !scanResult && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4" />
              <p className="text-lg font-medium">Scanning your wallet...</p>
              <p className="text-sm text-muted-foreground mt-2">
                Analyzing approvals and tokens
              </p>
            </div>
          </div>
        )}

        {scanResult && (
          <div className="space-y-6">
            {/* Chain Selector */}
            <ChainSelector />

            {/* Security Score */}
            <SecurityScoreCard
              score={scanResult.score}
              riskLevel={scanResult.riskLevel}
              onScanAgain={performScan}
              isScanning={isScanning}
            />

            {/* Recommendations */}
            <Recommendations 
              riskScore={calculateRiskScore(scanResult.approvals, scanResult.tokens, false)} 
              chainId={chainId} 
            />

            {/* Two Column Layout */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Risk Alerts */}
              <RiskAlerts alerts={scanResult.alerts} />

              {/* Approvals List */}
              <ApprovalList approvals={scanResult.approvals} chainId={chainId} />
            </div>

            {/* Token List */}
            <TokenList tokens={scanResult.tokens} chainId={chainId} />

            {/* Scan History */}
            {scanHistory.length > 0 && (
              <ScanHistory scans={scanHistory} />
            )}

            {/* Info Footer */}
            <div className="text-center text-sm text-muted-foreground pt-8">
              <p>
                Scanned on{' '}
                {new Date(scanResult.timestamp).toLocaleString()}
              </p>
              <p className="mt-2">
                Data provided by GoldRush API • Non-custodial • Open Source
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

