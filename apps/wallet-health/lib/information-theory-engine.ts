/**
 * Information Theory & Compression Engine
 * Shannon entropy, Huffman coding, LZW compression, mutual information
 */

export interface EntropyAnalysis {
  shannonEntropy: number;
  minEntropy: number;
  maxEntropy: number;
  redundancy: number;
  compressionRatio: number;
}

export interface HuffmanTree {
  char: string;
  freq: number;
  code: string;
  left?: HuffmanTree;
  right?: HuffmanTree;
}

export interface CompressionResult {
  compressed: string;
  original: string;
  compressionRatio: number;
  bitsOriginal: number;
  bitsCompressed: number;
  spaceSaved: number;
}

export interface MutualInformation {
  value: number;
  normalized: number;
  correlation: number;
}

export class InformationTheoryEngine {
  /**
   * Calculate Shannon Entropy
   * H(X) = -Σ p(x) log₂(p(x))
   */
  calculateShannonEntropy(data: string): number {
    const frequencies = this.getFrequencies(data);
    const n = data.length;
    
    let entropy = 0;
    for (const freq of Object.values(frequencies)) {
      const p = freq / n;
      entropy -= p * Math.log2(p);
    }
    
    return entropy;
  }

  /**
   * Comprehensive entropy analysis
   */
  analyzeEntropy(data: string): EntropyAnalysis {
    const frequencies = this.getFrequencies(data);
    const n = data.length;
    const uniqueChars = Object.keys(frequencies).length;
    
    // Shannon entropy
    const shannonEntropy = this.calculateShannonEntropy(data);
    
    // Min entropy (worst-case)
    const maxFreq = Math.max(...Object.values(frequencies));
    const minEntropy = -Math.log2(maxFreq / n);
    
    // Max possible entropy
    const maxEntropy = Math.log2(uniqueChars);
    
    // Redundancy
    const redundancy = 1 - (shannonEntropy / maxEntropy);
    
    // Theoretical compression ratio
    const compressionRatio = shannonEntropy / Math.log2(256);
    
    return {
      shannonEntropy,
      minEntropy,
      maxEntropy,
      redundancy,
      compressionRatio,
    };
  }

  /**
   * Build Huffman coding tree
   */
  buildHuffmanTree(data: string): HuffmanTree {
    const frequencies = this.getFrequencies(data);
    
    // Create leaf nodes
    const nodes: HuffmanTree[] = Object.entries(frequencies).map(([char, freq]) => ({
      char,
      freq,
      code: '',
    }));
    
    // Build tree bottom-up
    while (nodes.length > 1) {
      // Sort by frequency
      nodes.sort((a, b) => a.freq - b.freq);
      
      // Take two smallest nodes
      const left = nodes.shift()!;
      const right = nodes.shift()!;
      
      // Create parent node
      const parent: HuffmanTree = {
        char: left.char + right.char,
        freq: left.freq + right.freq,
        code: '',
        left,
        right,
      };
      
      nodes.push(parent);
    }
    
    // Assign codes
    this.assignHuffmanCodes(nodes[0], '');
    
    return nodes[0];
  }

  /**
   * Encode data using Huffman coding
   */
  huffmanEncode(data: string): CompressionResult {
    const tree = this.buildHuffmanTree(data);
    const codeMap = this.getHuffmanCodes(tree);
    
    // Encode data
    let compressed = '';
    for (const char of data) {
      compressed += codeMap[char] || '';
    }
    
    const bitsOriginal = data.length * 8;
    const bitsCompressed = compressed.length;
    const spaceSaved = ((bitsOriginal - bitsCompressed) / bitsOriginal) * 100;
    
    return {
      compressed,
      original: data,
      compressionRatio: bitsOriginal / bitsCompressed,
      bitsOriginal,
      bitsCompressed,
      spaceSaved,
    };
  }

  /**
   * LZW Compression Algorithm
   */
  lzwCompress(data: string): CompressionResult {
    const dictionary: { [key: string]: number } = {};
    let dictSize = 256;
    
    // Initialize dictionary with single characters
    for (let i = 0; i < 256; i++) {
      dictionary[String.fromCharCode(i)] = i;
    }
    
    let current = '';
    const result: number[] = [];
    
    for (const char of data) {
      const combined = current + char;
      
      if (dictionary[combined] !== undefined) {
        current = combined;
      } else {
        result.push(dictionary[current]);
        dictionary[combined] = dictSize++;
        current = char;
      }
    }
    
    if (current !== '') {
      result.push(dictionary[current]);
    }
    
    // Convert to binary string
    const compressed = result.map(n => n.toString(2).padStart(12, '0')).join('');
    
    const bitsOriginal = data.length * 8;
    const bitsCompressed = result.length * 12;
    const spaceSaved = ((bitsOriginal - bitsCompressed) / bitsOriginal) * 100;
    
    return {
      compressed: result.join(','),
      original: data,
      compressionRatio: bitsOriginal / bitsCompressed,
      bitsOriginal,
      bitsCompressed,
      spaceSaved,
    };
  }

  /**
   * Run-Length Encoding (RLE)
   */
  runLengthEncode(data: string): CompressionResult {
    let compressed = '';
    let count = 1;
    
    for (let i = 0; i < data.length; i++) {
      if (i < data.length - 1 && data[i] === data[i + 1]) {
        count++;
      } else {
        compressed += data[i] + (count > 1 ? count : '');
        count = 1;
      }
    }
    
    const bitsOriginal = data.length * 8;
    const bitsCompressed = compressed.length * 8;
    const spaceSaved = ((bitsOriginal - bitsCompressed) / bitsOriginal) * 100;
    
    return {
      compressed,
      original: data,
      compressionRatio: data.length / compressed.length,
      bitsOriginal,
      bitsCompressed,
      spaceSaved,
    };
  }

  /**
   * Calculate mutual information between two variables
   * I(X;Y) = H(X) + H(Y) - H(X,Y)
   */
  mutualInformation(dataX: string, dataY: string): MutualInformation {
    // Entropy of X
    const hx = this.calculateShannonEntropy(dataX);
    
    // Entropy of Y
    const hy = this.calculateShannonEntropy(dataY);
    
    // Joint entropy H(X,Y)
    const joint = dataX.split('').map((x, i) => x + (dataY[i] || '')).join('');
    const hxy = this.calculateShannonEntropy(joint);
    
    // Mutual information
    const mi = hx + hy - hxy;
    
    // Normalized mutual information
    const normalized = mi / Math.max(hx, hy);
    
    // Correlation estimate
    const correlation = mi / Math.sqrt(hx * hy);
    
    return {
      value: mi,
      normalized,
      correlation,
    };
  }

  /**
   * Kolmogorov Complexity estimate (via compression)
   */
  estimateKolmogorovComplexity(data: string): {
    estimated: number;
    compressionBased: number;
    ratio: number;
  } {
    const lzw = this.lzwCompress(data);
    const huffman = this.huffmanEncode(data);
    
    // Best compression achievable
    const bestCompression = Math.min(
      lzw.bitsCompressed,
      huffman.bitsCompressed
    );
    
    const estimated = bestCompression / 8; // Convert to bytes
    const ratio = estimated / data.length;
    
    return {
      estimated,
      compressionBased: bestCompression,
      ratio,
    };
  }

  /**
   * Calculate channel capacity (Shannon-Hartley theorem)
   * C = B * log₂(1 + SNR)
   */
  channelCapacity(bandwidth: number, snr: number): {
    capacity: number;
    unit: string;
    maxDataRate: number;
  } {
    const capacity = bandwidth * Math.log2(1 + snr);
    
    return {
      capacity,
      unit: 'bits/second',
      maxDataRate: capacity,
    };
  }

  /**
   * Calculate information gain (for decision trees)
   */
  informationGain(
    parent: string,
    childrenGroups: string[]
  ): number {
    const parentEntropy = this.calculateShannonEntropy(parent);
    
    let weightedChildEntropy = 0;
    const totalSize = parent.length;
    
    for (const child of childrenGroups) {
      const weight = child.length / totalSize;
      const childEntropy = this.calculateShannonEntropy(child);
      weightedChildEntropy += weight * childEntropy;
    }
    
    return parentEntropy - weightedChildEntropy;
  }

  /**
   * Conditional entropy H(Y|X)
   */
  conditionalEntropy(dataX: string, dataY: string): number {
    const joint = dataX.split('').map((x, i) => x + (dataY[i] || '')).join('');
    const hxy = this.calculateShannonEntropy(joint);
    const hx = this.calculateShannonEntropy(dataX);
    
    return hxy - hx;
  }

  /**
   * Calculate cross-entropy
   */
  crossEntropy(trueData: string, predictedData: string): number {
    const trueFreq = this.getFrequencies(trueData);
    const predFreq = this.getFrequencies(predictedData);
    
    const n = trueData.length;
    let crossEntropy = 0;
    
    for (const [char, freq] of Object.entries(trueFreq)) {
      const p = freq / n;
      const q = (predFreq[char] || 0.0001) / predictedData.length;
      crossEntropy -= p * Math.log2(q);
    }
    
    return crossEntropy;
  }

  /**
   * KL Divergence (Kullback-Leibler)
   */
  klDivergence(data1: string, data2: string): number {
    const freq1 = this.getFrequencies(data1);
    const freq2 = this.getFrequencies(data2);
    
    const n1 = data1.length;
    const n2 = data2.length;
    
    let kl = 0;
    
    for (const [char, f1] of Object.entries(freq1)) {
      const p = f1 / n1;
      const q = (freq2[char] || 0.0001) / n2;
      kl += p * Math.log2(p / q);
    }
    
    return kl;
  }

  /**
   * Private helper methods
   */

  private getFrequencies(data: string): { [key: string]: number } {
    const freq: { [key: string]: number } = {};
    
    for (const char of data) {
      freq[char] = (freq[char] || 0) + 1;
    }
    
    return freq;
  }

  private assignHuffmanCodes(node: HuffmanTree, code: string): void {
    if (!node) return;
    
    node.code = code;
    
    if (node.left) {
      this.assignHuffmanCodes(node.left, code + '0');
    }
    
    if (node.right) {
      this.assignHuffmanCodes(node.right, code + '1');
    }
  }

  private getHuffmanCodes(node: HuffmanTree): { [key: string]: string } {
    const codes: { [key: string]: string } = {};
    
    const traverse = (n: HuffmanTree) => {
      if (!n.left && !n.right && n.char.length === 1) {
        codes[n.char] = n.code;
      }
      
      if (n.left) traverse(n.left);
      if (n.right) traverse(n.right);
    };
    
    traverse(node);
    return codes;
  }
}

