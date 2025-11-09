'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Activity,
  TrendingUp,
  Lock,
  Calculator,
  Zap,
  ChevronRight,
  Play,
  BarChart3,
} from 'lucide-react';
import { SignalProcessingEngine } from '@/lib/signal-processing-engine';
import { NumericalMethodsEngine } from '@/lib/numerical-methods-engine';
import { CryptographicAlgorithms } from '@/lib/cryptographic-algorithms';

export function AlgorithmVisualizer() {
  const [activeTab, setActiveTab] = useState<'signal' | 'numerical' | 'crypto'>('signal');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Signal Processing
  const [signalData, setSignalData] = useState('1,2,3,4,5,4,3,2,1,2,3,4,5');
  
  // Numerical Methods
  const [equation, setEquation] = useState('x^2 - 4');
  const [initialGuess, setInitialGuess] = useState('1');
  
  // Cryptography
  const [message, setMessage] = useState('Hello Web3');
  const [cryptoKey, setCryptoKey] = useState('secret-key-2024');

  const runSignalProcessing = () => {
    setLoading(true);
    try {
      const engine = new SignalProcessingEngine();
      const data = signalData.split(',').map(Number);
      
      // Run FFT
      const fftResult = engine.fft(data);
      
      // Calculate power spectrum
      const psd = engine.powerSpectralDensity(data, 8, 4);
      
      // Apply low-pass filter
      const filtered = engine.butterworthLowPass(data, 0.3, 2, 1.0);
      
      setResult({
        type: 'signal',
        fft: {
          real: fftResult.real.slice(0, 8).map(v => v.toFixed(2)),
          imag: fftResult.imag.slice(0, 8).map(v => v.toFixed(2)),
        },
        spectrum: {
          frequencies: psd.frequencies.slice(0, 4).map(f => f.toFixed(3)),
          magnitudes: psd.magnitudes.slice(0, 4).map(m => m.toFixed(2)),
          dominant: psd.dominantFrequency.toFixed(3),
        },
        filtered: filtered.filtered.slice(0, 8).map(v => v.toFixed(2)),
      });
    } catch (error) {
      console.error('Signal processing error:', error);
      setResult({ error: 'Failed to process signal' });
    } finally {
      setLoading(false);
    }
  };

  const runNumericalMethods = () => {
    setLoading(true);
    try {
      const engine = new NumericalMethodsEngine();
      
      // Define function: x^2 - 4
      const f = (x: number) => x * x - 4;
      const df = (x: number) => 2 * x;
      
      // Newton-Raphson
      const newton = engine.newtonRaphson(f, df, parseFloat(initialGuess), 1e-6, 50);
      
      // Bisection
      const bisect = engine.bisection(f, 0, 5, 1e-6, 50);
      
      // Integration: ∫x² dx from 0 to 2
      const integral = engine.simpsonsIntegration((x) => x * x, 0, 2, 100);
      
      // Gradient at point [2, 3]
      const grad = engine.gradient((x) => x[0] * x[0] + x[1] * x[1], [2, 3]);
      
      setResult({
        type: 'numerical',
        newton: {
          root: newton.root.toFixed(6),
          iterations: newton.iterations,
          converged: newton.converged,
        },
        bisection: {
          root: bisect.root.toFixed(6),
          iterations: bisect.iterations,
        },
        integration: {
          value: integral.value.toFixed(4),
          error: integral.error.toExponential(2),
        },
        gradient: grad.map(g => g.toFixed(3)),
      });
    } catch (error) {
      console.error('Numerical methods error:', error);
      setResult({ error: 'Failed to run numerical methods' });
    } finally {
      setLoading(false);
    }
  };

  const runCryptography = () => {
    setLoading(true);
    try {
      const crypto = new CryptographicAlgorithms();
      
      // SHA-256
      const hash = crypto.sha256(message);
      
      // HMAC
      const hmac = crypto.hmac(cryptoKey, message);
      
      // PBKDF2
      const derived = crypto.pbkdf2(message, 'salt123', 1000, 32);
      
      // Merkle tree
      const leaves = [message, 'leaf2', 'leaf3', 'leaf4'];
      const root = crypto.merkleRoot(leaves);
      const proof = crypto.merkleProof(leaves, 0);
      
      setResult({
        type: 'crypto',
        hash: {
          value: hash.hash.substring(0, 32) + '...',
          full: hash.hash,
        },
        hmac: {
          value: hmac.hmac.substring(0, 32) + '...',
        },
        pbkdf2: {
          key: derived.derivedKey.substring(0, 32) + '...',
          iterations: derived.iterations,
        },
        merkle: {
          root: root.substring(0, 32) + '...',
          proofLength: proof.length,
        },
      });
    } catch (error) {
      console.error('Cryptography error:', error);
      setResult({ error: 'Failed to run cryptography' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-emerald-500" />
          Advanced Algorithm Visualizer
        </CardTitle>
        <CardDescription>
          Interactive demonstrations of signal processing, numerical methods, and cryptography
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Tab Navigation */}
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'signal' ? 'default' : 'outline'}
            onClick={() => setActiveTab('signal')}
            className="flex-1"
          >
            <Activity className="h-4 w-4 mr-2" />
            Signal Processing
          </Button>
          <Button
            variant={activeTab === 'numerical' ? 'default' : 'outline'}
            onClick={() => setActiveTab('numerical')}
            className="flex-1"
          >
            <Calculator className="h-4 w-4 mr-2" />
            Numerical Methods
          </Button>
          <Button
            variant={activeTab === 'crypto' ? 'default' : 'outline'}
            onClick={() => setActiveTab('crypto')}
            className="flex-1"
          >
            <Lock className="h-4 w-4 mr-2" />
            Cryptography
          </Button>
        </div>

        {/* Signal Processing Tab */}
        {activeTab === 'signal' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Signal Data (comma-separated)</Label>
              <Input
                value={signalData}
                onChange={(e) => setSignalData(e.target.value)}
                placeholder="1,2,3,4,5,4,3,2,1"
              />
            </div>
            <Button onClick={runSignalProcessing} disabled={loading} className="w-full">
              <Play className="h-4 w-4 mr-2" />
              {loading ? 'Processing...' : 'Run FFT & Filtering'}
            </Button>
            
            {result?.type === 'signal' && (
              <div className="space-y-4 pt-4 border-t">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    FFT Results
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="p-3 bg-muted rounded">
                      <div className="text-muted-foreground mb-1">Real Part</div>
                      <div className="font-mono">[{result.fft.real.join(', ')}]</div>
                    </div>
                    <div className="p-3 bg-muted rounded">
                      <div className="text-muted-foreground mb-1">Imaginary Part</div>
                      <div className="font-mono">[{result.fft.imag.join(', ')}]</div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Power Spectrum
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-muted rounded">
                      <span className="text-sm text-muted-foreground">Dominant Frequency</span>
                      <Badge variant="default">{result.spectrum.dominant} Hz</Badge>
                    </div>
                    <div className="p-3 bg-muted rounded">
                      <div className="text-sm text-muted-foreground mb-1">Magnitudes</div>
                      <div className="font-mono text-sm">[{result.spectrum.magnitudes.join(', ')}]</div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Butterworth Filtered</h4>
                  <div className="p-3 bg-muted rounded">
                    <div className="font-mono text-sm">[{result.filtered.join(', ')}]</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Numerical Methods Tab */}
        {activeTab === 'numerical' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Equation (currently: x² - 4 = 0)</Label>
              <Input
                value={equation}
                onChange={(e) => setEquation(e.target.value)}
                placeholder="x^2 - 4"
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label>Initial Guess</Label>
              <Input
                type="number"
                value={initialGuess}
                onChange={(e) => setInitialGuess(e.target.value)}
                placeholder="1"
              />
            </div>
            <Button onClick={runNumericalMethods} disabled={loading} className="w-full">
              <Play className="h-4 w-4 mr-2" />
              {loading ? 'Computing...' : 'Solve & Integrate'}
            </Button>
            
            {result?.type === 'numerical' && (
              <div className="space-y-4 pt-4 border-t">
                <div>
                  <h4 className="font-semibold mb-2">Newton-Raphson Method</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="p-3 bg-muted rounded">
                      <div className="text-muted-foreground mb-1">Root</div>
                      <div className="font-mono font-semibold">{result.newton.root}</div>
                    </div>
                    <div className="p-3 bg-muted rounded">
                      <div className="text-muted-foreground mb-1">Iterations</div>
                      <Badge variant="secondary">{result.newton.iterations}</Badge>
                    </div>
                  </div>
                  <div className="mt-2">
                    <Badge variant={result.newton.converged ? 'default' : 'destructive'}>
                      {result.newton.converged ? '✓ Converged' : '✗ Not Converged'}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Bisection Method</h4>
                  <div className="flex gap-2">
                    <div className="flex-1 p-3 bg-muted rounded">
                      <div className="text-sm text-muted-foreground mb-1">Root</div>
                      <div className="font-mono">{result.bisection.root}</div>
                    </div>
                    <div className="flex-1 p-3 bg-muted rounded">
                      <div className="text-sm text-muted-foreground mb-1">Iterations</div>
                      <Badge>{result.bisection.iterations}</Badge>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Simpson's Integration (∫x² dx, 0→2)</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 bg-muted rounded">
                      <div className="text-sm text-muted-foreground mb-1">Value</div>
                      <div className="font-mono font-semibold text-lg">{result.integration.value}</div>
                    </div>
                    <div className="p-3 bg-muted rounded">
                      <div className="text-sm text-muted-foreground mb-1">Error</div>
                      <div className="font-mono text-sm">{result.integration.error}</div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Gradient at [2, 3]</h4>
                  <div className="p-3 bg-muted rounded">
                    <div className="font-mono">∇f = [{result.gradient.join(', ')}]</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Cryptography Tab */}
        {activeTab === 'crypto' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Message</Label>
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter message"
              />
            </div>
            <div className="space-y-2">
              <Label>Secret Key</Label>
              <Input
                type="password"
                value={cryptoKey}
                onChange={(e) => setCryptoKey(e.target.value)}
                placeholder="Enter secret key"
              />
            </div>
            <Button onClick={runCryptography} disabled={loading} className="w-full">
              <Play className="h-4 w-4 mr-2" />
              {loading ? 'Encrypting...' : 'Run Crypto Algorithms'}
            </Button>
            
            {result?.type === 'crypto' && (
              <div className="space-y-4 pt-4 border-t">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    SHA-256 Hash
                  </h4>
                  <div className="p-3 bg-muted rounded">
                    <div className="font-mono text-xs break-all">{result.hash.value}</div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2"
                      onClick={() => navigator.clipboard.writeText(result.hash.full)}
                    >
                      Copy Full Hash
                    </Button>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">HMAC</h4>
                  <div className="p-3 bg-muted rounded">
                    <div className="font-mono text-xs break-all">{result.hmac.value}</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">PBKDF2 Key Derivation</h4>
                  <div className="space-y-2">
                    <div className="p-3 bg-muted rounded">
                      <div className="text-sm text-muted-foreground mb-1">Derived Key</div>
                      <div className="font-mono text-xs break-all">{result.pbkdf2.key}</div>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="secondary">
                        {result.pbkdf2.iterations.toLocaleString()} iterations
                      </Badge>
                      <Badge variant="outline">256-bit</Badge>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Merkle Tree</h4>
                  <div className="space-y-2">
                    <div className="p-3 bg-muted rounded">
                      <div className="text-sm text-muted-foreground mb-1">Root Hash</div>
                      <div className="font-mono text-xs break-all">{result.merkle.root}</div>
                    </div>
                    <Badge variant="outline">Proof Length: {result.merkle.proofLength}</Badge>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Algorithm Stats */}
        <div className="pt-4 border-t">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <div className="text-2xl font-bold text-emerald-500">O(n log n)</div>
              <div className="text-xs text-muted-foreground">FFT Complexity</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-blue-500">1e-6</div>
              <div className="text-xs text-muted-foreground">Precision</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-purple-500">256-bit</div>
              <div className="text-xs text-muted-foreground">Crypto Strength</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

