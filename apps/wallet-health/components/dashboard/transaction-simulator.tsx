'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Zap, 
  AlertTriangle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  TrendingDown,
  Info,
  Play,
  RotateCcw
} from 'lucide-react';
import { useState } from 'react';

interface SimulationResult {
  success: boolean;
  gasEstimate: string;
  gasCostUSD: number;
  balanceChanges: Array<{
    token: string;
    change: number;
    direction: 'in' | 'out';
  }>;
  warnings: string[];
  approvals?: Array<{
    token: string;
    spender: string;
    amount: string;
  }>;
  riskLevel: 'safe' | 'warning' | 'critical';
  recommendations: string[];
}

interface TransactionSimulatorProps {
  walletAddress: string;
}

export function TransactionSimulator({ walletAddress }: TransactionSimulatorProps) {
  const [toAddress, setToAddress] = useState('');
  const [value, setValue] = useState('');
  const [data, setData] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);

  const handleSimulate = async () => {
    if (!toAddress) return;

    setIsSimulating(true);
    // Simulate transaction analysis
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock simulation result
    const mockResult: SimulationResult = {
      success: true,
      gasEstimate: '0.0034',
      gasCostUSD: 6.8,
      balanceChanges: [
        { token: 'ETH', change: -0.1, direction: 'out' },
        { token: 'USDT', change: 250, direction: 'in' },
      ],
      warnings: [
        'This transaction will grant unlimited token approval',
        'The receiving contract is not verified',
      ],
      approvals: [
        {
          token: 'USDT',
          spender: toAddress,
          amount: 'Unlimited',
        },
      ],
      riskLevel: 'warning',
      recommendations: [
        'Consider setting a limited approval amount instead of unlimited',
        'Verify the contract on Etherscan before proceeding',
        'Review the contract source code if available',
      ],
    };

    setResult(mockResult);
    setIsSimulating(false);
  };

  const handleReset = () => {
    setToAddress('');
    setValue('');
    setData('');
    setResult(null);
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'safe':
        return <Badge variant="success">Safe</Badge>;
      case 'warning':
        return <Badge variant="warning">Warning</Badge>;
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Transaction Simulator
        </CardTitle>
        <CardDescription>
          Preview transaction outcomes before executing
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Info Banner */}
        <div className="mb-6 p-4 rounded-lg border border-primary/20 bg-primary/5">
          <div className="flex items-start gap-2">
            <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-sm mb-1">How It Works</h4>
              <p className="text-xs text-muted-foreground">
                Simulate transactions before executing them to see potential outcomes, gas costs,
                balance changes, and security risks. This helps you avoid costly mistakes and
                protect your assets.
              </p>
            </div>
          </div>
        </div>

        {/* Input Form */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="text-sm font-medium mb-2 block">
              To Address <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="0x... (contract or wallet address)"
              value={toAddress}
              onChange={(e) => setToAddress(e.target.value)}
              disabled={isSimulating}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Value (ETH)
            </label>
            <Input
              type="number"
              placeholder="0.0"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              disabled={isSimulating}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Data (Optional)
            </label>
            <Input
              placeholder="0x... (transaction data / function call)"
              value={data}
              onChange={(e) => setData(e.target.value)}
              disabled={isSimulating}
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSimulate}
              disabled={!toAddress || isSimulating}
              className="flex-1"
            >
              {isSimulating ? (
                <>
                  <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
                  Simulating...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Simulate Transaction
                </>
              )}
            </Button>
            {result && (
              <Button onClick={handleReset} variant="outline">
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Simulation Result */}
        {result && (
          <div className="space-y-4">
            {/* Overall Status */}
            <div className={`p-4 rounded-lg border ${
              result.riskLevel === 'safe'
                ? 'border-green-500/30 bg-green-500/5'
                : result.riskLevel === 'warning'
                ? 'border-yellow-500/30 bg-yellow-500/5'
                : 'border-red-500/30 bg-red-500/5'
            }`}>
              <div className="flex items-start gap-3">
                {result.riskLevel === 'safe' ? (
                  <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                ) : result.riskLevel === 'warning' ? (
                  <AlertTriangle className="h-6 w-6 text-yellow-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">
                      {result.success ? 'Transaction Will Succeed' : 'Transaction Will Fail'}
                    </h3>
                    {getRiskBadge(result.riskLevel)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {result.riskLevel === 'safe'
                      ? 'This transaction appears safe to execute'
                      : result.riskLevel === 'warning'
                      ? 'Proceed with caution - review warnings below'
                      : 'HIGH RISK - Not recommended to proceed'}
                  </p>
                </div>
              </div>
            </div>

            {/* Gas Estimate */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border border-border bg-card">
                <p className="text-xs text-muted-foreground mb-1">Estimated Gas</p>
                <p className="text-2xl font-bold text-primary">{result.gasEstimate} ETH</p>
              </div>
              <div className="p-4 rounded-lg border border-border bg-card">
                <p className="text-xs text-muted-foreground mb-1">Gas Cost (USD)</p>
                <p className="text-2xl font-bold">${result.gasCostUSD.toFixed(2)}</p>
              </div>
            </div>

            {/* Balance Changes */}
            {result.balanceChanges.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-3">Expected Balance Changes</h4>
                <div className="space-y-2">
                  {result.balanceChanges.map((change, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg border border-border bg-card"
                    >
                      <div className="flex items-center gap-2">
                        {change.direction === 'in' ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        )}
                        <span className="font-medium">{change.token}</span>
                      </div>
                      <span className={`font-mono ${
                        change.direction === 'in' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {change.direction === 'in' ? '+' : '-'}{Math.abs(change.change)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Approvals */}
            {result.approvals && result.approvals.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-3">Token Approvals Required</h4>
                <div className="space-y-2">
                  {result.approvals.map((approval, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-lg border border-yellow-500/30 bg-yellow-500/5"
                    >
                      <div className="flex items-start gap-2 mb-1">
                        <AlertTriangle className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {approval.token} → {approval.spender.slice(0, 10)}...{approval.spender.slice(-8)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Amount: <span className="font-mono">{approval.amount}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Warnings */}
            {result.warnings.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-yellow-600">
                  <AlertTriangle className="h-4 w-4" />
                  Warnings
                </h4>
                <div className="space-y-2">
                  {result.warnings.map((warning, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-lg border border-yellow-500/30 bg-yellow-500/5"
                    >
                      <p className="text-sm">⚠️ {warning}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {result.recommendations.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-3">Recommendations</h4>
                <div className="space-y-2">
                  {result.recommendations.map((rec, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-lg border border-primary/20 bg-primary/5"
                    >
                      <p className="text-sm">💡 {rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4 border-t border-border">
              <Button
                variant={result.riskLevel === 'critical' ? 'destructive' : 'default'}
                className="flex-1"
                disabled={result.riskLevel === 'critical'}
              >
                {result.riskLevel === 'critical' ? 'Not Recommended' : 'Proceed with Transaction'}
              </Button>
              <Button variant="outline" onClick={handleReset}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Sample Transactions */}
        {!result && (
          <div className="mt-6 p-4 rounded-lg border border-border bg-card">
            <h4 className="text-sm font-semibold mb-3">Quick Simulations</h4>
            <div className="space-y-2">
              <Button
                size="sm"
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  setToAddress('0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D');
                  setValue('0.1');
                }}
              >
                Uniswap Swap (0.1 ETH)
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  setToAddress('0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9');
                  setValue('0.5');
                }}
              >
                Aave Deposit (0.5 ETH)
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

