'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Database,
  Zap,
  TrendingDown,
  Binary,
  Play,
  BarChart3,
  Percent,
  Lock,
} from 'lucide-react';
import { InformationTheoryEngine } from '@/lib/information-theory-engine';

export function InformationTheoryDashboard() {
  const [input, setInput] = useState('Hello World! This is a test of compression algorithms.');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeCompression, setActiveCompression] = useState<'huffman' | 'lzw' | 'rle'>('huffman');

  const runAnalysis = () => {
    setLoading(true);
    try {
      const engine = new InformationTheoryEngine();
      
      // Entropy analysis
      const entropy = engine.analyzeEntropy(input);
      
      // Compression
      const huffman = engine.huffmanEncode(input);
      const lzw = engine.lzwCompress(input);
      const rle = engine.runLengthEncode(input);
      
      // Kolmogorov complexity
      const complexity = engine.estimateKolmogorovComplexity(input);
      
      // Information metrics
      const shannonEntropy = engine.calculateShannonEntropy(input);
      
      setResult({
        entropy,
        huffman,
        lzw,
        rle,
        complexity,
        shannonEntropy,
      });
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCompressionData = () => {
    if (!result) return null;
    
    switch (activeCompression) {
      case 'huffman':
        return result.huffman;
      case 'lzw':
        return result.lzw;
      case 'rle':
        return result.rle;
      default:
        return result.huffman;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-blue-500" />
          Information Theory & Compression Dashboard
        </CardTitle>
        <CardDescription>
          Analyze entropy, compression ratios, and information content
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input Section */}
        <div className="space-y-2">
          <Label>Input Text</Label>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter text to analyze..."
            className="font-mono"
          />
          <div className="flex gap-2">
            <Button onClick={runAnalysis} disabled={loading || !input} className="flex-1">
              <Play className="h-4 w-4 mr-2" />
              {loading ? 'Analyzing...' : 'Analyze & Compress'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setInput('AAABBBCCCDDD')}
            >
              Sample 1
            </Button>
            <Button
              variant="outline"
              onClick={() => setInput('The quick brown fox jumps over the lazy dog')}
            >
              Sample 2
            </Button>
          </div>
        </div>

        {result && (
          <div className="space-y-6 pt-4 border-t">
            {/* Entropy Analysis */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Entropy Analysis
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-lg border border-blue-500/20">
                  <div className="text-sm text-muted-foreground mb-1">Shannon Entropy</div>
                  <div className="text-2xl font-bold">
                    {result.entropy.shannonEntropy.toFixed(3)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">bits/symbol</div>
                </div>
                
                <div className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-lg border border-purple-500/20">
                  <div className="text-sm text-muted-foreground mb-1">Min Entropy</div>
                  <div className="text-2xl font-bold">
                    {result.entropy.minEntropy.toFixed(3)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">worst-case</div>
                </div>
                
                <div className="p-4 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 rounded-lg border border-emerald-500/20">
                  <div className="text-sm text-muted-foreground mb-1">Redundancy</div>
                  <div className="text-2xl font-bold">
                    {(result.entropy.redundancy * 100).toFixed(1)}%
                  </div>
                  <Progress value={result.entropy.redundancy * 100} className="mt-2" />
                </div>
                
                <div className="p-4 bg-gradient-to-br from-orange-500/10 to-orange-500/5 rounded-lg border border-orange-500/20">
                  <div className="text-sm text-muted-foreground mb-1">Max Entropy</div>
                  <div className="text-2xl font-bold">
                    {result.entropy.maxEntropy.toFixed(3)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">possible</div>
                </div>
              </div>
            </div>

            {/* Compression Algorithms */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <TrendingDown className="h-4 w-4" />
                Compression Algorithms
              </h4>
              
              <div className="flex gap-2 mb-4">
                <Button
                  variant={activeCompression === 'huffman' ? 'default' : 'outline'}
                  onClick={() => setActiveCompression('huffman')}
                  size="sm"
                >
                  Huffman Coding
                </Button>
                <Button
                  variant={activeCompression === 'lzw' ? 'default' : 'outline'}
                  onClick={() => setActiveCompression('lzw')}
                  size="sm"
                >
                  LZW
                </Button>
                <Button
                  variant={activeCompression === 'rle' ? 'default' : 'outline'}
                  onClick={() => setActiveCompression('rle')}
                  size="sm"
                >
                  Run-Length
                </Button>
              </div>

              {getCompressionData() && (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="text-xs text-muted-foreground mb-1">Original</div>
                      <div className="font-semibold">{getCompressionData().bitsOriginal} bits</div>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="text-xs text-muted-foreground mb-1">Compressed</div>
                      <div className="font-semibold">{getCompressionData().bitsCompressed} bits</div>
                    </div>
                    <div className="p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                      <div className="text-xs text-muted-foreground mb-1">Space Saved</div>
                      <div className="font-semibold text-emerald-600">
                        {getCompressionData().spaceSaved.toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Compression Ratio</span>
                      <Badge variant="default">
                        {getCompressionData().compressionRatio.toFixed(2)}:1
                      </Badge>
                    </div>
                    <Progress 
                      value={(1 - (getCompressionData().bitsCompressed / getCompressionData().bitsOriginal)) * 100} 
                      className="h-2"
                    />
                  </div>

                  <div className="p-3 bg-muted rounded-lg">
                    <div className="text-xs text-muted-foreground mb-2">Compressed Output (first 100 chars)</div>
                    <div className="font-mono text-xs break-all">
                      {getCompressionData().compressed.substring(0, 100)}
                      {getCompressionData().compressed.length > 100 && '...'}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Compression Comparison */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Binary className="h-4 w-4" />
                Compression Comparison
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <Lock className="h-4 w-4 text-blue-500" />
                    <div>
                      <div className="font-medium">Huffman Coding</div>
                      <div className="text-xs text-muted-foreground">
                        Optimal prefix-free code
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{result.huffman.spaceSaved.toFixed(1)}%</div>
                    <Badge variant="outline" className="mt-1">
                      {result.huffman.compressionRatio.toFixed(2)}:1
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <Database className="h-4 w-4 text-purple-500" />
                    <div>
                      <div className="font-medium">LZW Compression</div>
                      <div className="text-xs text-muted-foreground">
                        Dictionary-based algorithm
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{result.lzw.spaceSaved.toFixed(1)}%</div>
                    <Badge variant="outline" className="mt-1">
                      {result.lzw.compressionRatio.toFixed(2)}:1
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <Zap className="h-4 w-4 text-orange-500" />
                    <div>
                      <div className="font-medium">Run-Length Encoding</div>
                      <div className="text-xs text-muted-foreground">
                        Simple repetition-based
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{result.rle.spaceSaved.toFixed(1)}%</div>
                    <Badge variant="outline" className="mt-1">
                      {result.rle.compressionRatio.toFixed(2)}:1
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Kolmogorov Complexity */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Percent className="h-4 w-4" />
                Kolmogorov Complexity Estimate
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Estimated Complexity</div>
                  <div className="text-xl font-bold">{result.complexity.estimated.toFixed(0)} bytes</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Shortest program length
                  </div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Compression Ratio</div>
                  <div className="text-xl font-bold">{(result.complexity.ratio * 100).toFixed(1)}%</div>
                  <Progress value={result.complexity.ratio * 100} className="mt-2" />
                </div>
              </div>
            </div>

            {/* Information Theory Facts */}
            <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/20">
              <h4 className="font-semibold mb-2">📚 Information Theory Principles</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  <span>
                    <strong>Shannon Entropy</strong> measures average information content (bits/symbol)
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-purple-500">•</span>
                  <span>
                    <strong>Huffman Coding</strong> is optimal for symbol-by-symbol encoding
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-500">•</span>
                  <span>
                    <strong>LZW</strong> exploits repeated patterns in data
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-orange-500">•</span>
                  <span>
                    <strong>Kolmogorov Complexity</strong> represents minimum description length
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="pt-4 border-t">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <div className="text-2xl font-bold text-blue-500">O(n log n)</div>
              <div className="text-xs text-muted-foreground">Huffman Build</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-purple-500">H(X)</div>
              <div className="text-xs text-muted-foreground">Shannon Formula</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-emerald-500">~50%</div>
              <div className="text-xs text-muted-foreground">Typical Compression</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

