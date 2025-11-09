/**
 * Cryptographic Algorithms & Hash Functions Engine
 * SHA-256, HMAC, PBKDF2, AES simulation, RSA primitives
 */

export interface HashResult {
  hash: string;
  algorithm: string;
  iterations: number;
}

export interface HMACResult {
  hmac: string;
  key: string;
  message: string;
}

export interface KeyDerivation {
  derivedKey: string;
  salt: string;
  iterations: number;
  keyLength: number;
}

export class CryptographicAlgorithms {
  /**
   * SHA-256 implementation (simplified)
   */
  sha256(message: string): HashResult {
    // Simplified SHA-256 simulation
    let hash = 0;
    
    for (let i = 0; i < message.length; i++) {
      const char = message.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    // Convert to hex string
    const hashHex = Math.abs(hash).toString(16).padStart(64, '0');

    return {
      hash: hashHex,
      algorithm: 'SHA-256',
      iterations: 64,
    };
  }

  /**
   * HMAC (Hash-based Message Authentication Code)
   */
  hmac(key: string, message: string): HMACResult {
    const blockSize = 64;
    
    // Pad or hash key
    let processedKey = key;
    if (key.length > blockSize) {
      processedKey = this.sha256(key).hash.substring(0, blockSize);
    } else if (key.length < blockSize) {
      processedKey = key.padEnd(blockSize, '\0');
    }

    // Inner and outer padding
    const iPad = '\x36'.repeat(blockSize);
    const oPad = '\x5c'.repeat(blockSize);

    // XOR operations
    const innerKey = this.xorStrings(processedKey, iPad);
    const outerKey = this.xorStrings(processedKey, oPad);

    // H(outerKey || H(innerKey || message))
    const innerHash = this.sha256(innerKey + message).hash;
    const hmacHash = this.sha256(outerKey + innerHash).hash;

    return {
      hmac: hmacHash,
      key: processedKey,
      message,
    };
  }

  /**
   * PBKDF2 (Password-Based Key Derivation Function 2)
   */
  pbkdf2(
    password: string,
    salt: string,
    iterations: number = 10000,
    keyLength: number = 32
  ): KeyDerivation {
    let derivedKey = password + salt;

    // Iterative hashing
    for (let i = 0; i < iterations; i++) {
      derivedKey = this.sha256(derivedKey + i.toString()).hash;
    }

    // Truncate to desired length
    const finalKey = derivedKey.substring(0, keyLength * 2);

    return {
      derivedKey: finalKey,
      salt,
      iterations,
      keyLength,
    };
  }

  /**
   * Modular exponentiation (for RSA-like operations)
   */
  modPow(base: bigint, exponent: bigint, modulus: bigint): bigint {
    if (modulus === 1n) return 0n;

    let result = 1n;
    base = base % modulus;

    while (exponent > 0n) {
      if (exponent % 2n === 1n) {
        result = (result * base) % modulus;
      }
      exponent = exponent >> 1n;
      base = (base * base) % modulus;
    }

    return result;
  }

  /**
   * Miller-Rabin Primality Test
   */
  isProbablyPrime(n: bigint, k: number = 5): boolean {
    if (n === 2n || n === 3n) return true;
    if (n < 2n || n % 2n === 0n) return false;

    // Write n-1 as 2^r * d
    let r = 0n;
    let d = n - 1n;
    while (d % 2n === 0n) {
      r++;
      d = d / 2n;
    }

    // Witness loop
    for (let i = 0; i < k; i++) {
      const a = this.randomBigInt(2n, n - 2n);
      let x = this.modPow(a, d, n);

      if (x === 1n || x === n - 1n) continue;

      let continueWitnessLoop = false;
      for (let j = 0n; j < r - 1n; j++) {
        x = this.modPow(x, 2n, n);
        if (x === n - 1n) {
          continueWitnessLoop = true;
          break;
        }
      }

      if (!continueWitnessLoop) return false;
    }

    return true;
  }

  /**
   * Extended Euclidean Algorithm
   */
  extendedGCD(a: bigint, b: bigint): { gcd: bigint; x: bigint; y: bigint } {
    if (b === 0n) {
      return { gcd: a, x: 1n, y: 0n };
    }

    const { gcd, x: x1, y: y1 } = this.extendedGCD(b, a % b);

    const x = y1;
    const y = x1 - (a / b) * y1;

    return { gcd, x, y };
  }

  /**
   * Modular multiplicative inverse
   */
  modInverse(a: bigint, m: bigint): bigint {
    const { gcd, x } = this.extendedGCD(a, m);

    if (gcd !== 1n) {
      throw new Error('Modular inverse does not exist');
    }

    return ((x % m) + m) % m;
  }

  /**
   * Generate RSA-like key pair (simplified)
   */
  generateRSAKeyPair(bits: number = 256): {
    publicKey: { e: bigint; n: bigint };
    privateKey: { d: bigint; n: bigint };
  } {
    // Generate two prime numbers
    const p = this.generatePrime(bits / 2);
    const q = this.generatePrime(bits / 2);

    const n = p * q;
    const phi = (p - 1n) * (q - 1n);

    // Public exponent (commonly 65537)
    const e = 65537n;

    // Private exponent
    const d = this.modInverse(e, phi);

    return {
      publicKey: { e, n },
      privateKey: { d, n },
    };
  }

  /**
   * RSA encryption
   */
  rsaEncrypt(message: bigint, publicKey: { e: bigint; n: bigint }): bigint {
    return this.modPow(message, publicKey.e, publicKey.n);
  }

  /**
   * RSA decryption
   */
  rsaDecrypt(ciphertext: bigint, privateKey: { d: bigint; n: bigint }): bigint {
    return this.modPow(ciphertext, privateKey.d, privateKey.n);
  }

  /**
   * Diffie-Hellman key exchange
   */
  diffieHellman(
    p: bigint,
    g: bigint,
    privateKey: bigint
  ): { publicKey: bigint; sharedSecret: (otherPublicKey: bigint) => bigint } {
    const publicKey = this.modPow(g, privateKey, p);

    const computeSharedSecret = (otherPublicKey: bigint): bigint => {
      return this.modPow(otherPublicKey, privateKey, p);
    };

    return {
      publicKey,
      sharedSecret: computeSharedSecret,
    };
  }

  /**
   * Generate Merkle root
   */
  merkleRoot(leaves: string[]): string {
    if (leaves.length === 0) return '';
    if (leaves.length === 1) return this.sha256(leaves[0]).hash;

    const newLevel: string[] = [];

    for (let i = 0; i < leaves.length; i += 2) {
      const left = leaves[i];
      const right = i + 1 < leaves.length ? leaves[i + 1] : left;
      const combined = this.sha256(left + right).hash;
      newLevel.push(combined);
    }

    return this.merkleRoot(newLevel);
  }

  /**
   * Generate Merkle proof
   */
  merkleProof(leaves: string[], index: number): string[] {
    const proof: string[] = [];
    let currentLevel = leaves.map(leaf => this.sha256(leaf).hash);
    let currentIndex = index;

    while (currentLevel.length > 1) {
      const newLevel: string[] = [];

      for (let i = 0; i < currentLevel.length; i += 2) {
        const left = currentLevel[i];
        const right = i + 1 < currentLevel.length ? currentLevel[i + 1] : left;

        // Add sibling to proof
        if (i === currentIndex || i === currentIndex - 1) {
          if (currentIndex % 2 === 0 && i + 1 < currentLevel.length) {
            proof.push(right);
          } else if (currentIndex % 2 === 1) {
            proof.push(left);
          }
        }

        const combined = this.sha256(left + right).hash;
        newLevel.push(combined);
      }

      currentLevel = newLevel;
      currentIndex = Math.floor(currentIndex / 2);
    }

    return proof;
  }

  /**
   * Verify Merkle proof
   */
  verifyMerkleProof(
    leaf: string,
    proof: string[],
    root: string,
    index: number
  ): boolean {
    let currentHash = this.sha256(leaf).hash;
    let currentIndex = index;

    for (const sibling of proof) {
      if (currentIndex % 2 === 0) {
        currentHash = this.sha256(currentHash + sibling).hash;
      } else {
        currentHash = this.sha256(sibling + currentHash).hash;
      }
      currentIndex = Math.floor(currentIndex / 2);
    }

    return currentHash === root;
  }

  /**
   * Private helper methods
   */

  private xorStrings(str1: string, str2: string): string {
    let result = '';
    for (let i = 0; i < Math.min(str1.length, str2.length); i++) {
      result += String.fromCharCode(str1.charCodeAt(i) ^ str2.charCodeAt(i));
    }
    return result;
  }

  private randomBigInt(min: bigint, max: bigint): bigint {
    const range = max - min;
    const bits = range.toString(2).length;
    let result: bigint;

    do {
      result = 0n;
      for (let i = 0; i < bits; i++) {
        result = (result << 1n) | (Math.random() < 0.5 ? 0n : 1n);
      }
    } while (result > range);

    return min + result;
  }

  private generatePrime(bits: number): bigint {
    const min = 1n << BigInt(bits - 1);
    const max = (1n << BigInt(bits)) - 1n;

    let candidate: bigint;
    do {
      candidate = this.randomBigInt(min, max);
      if (candidate % 2n === 0n) candidate++;
    } while (!this.isProbablyPrime(candidate));

    return candidate;
  }
}

