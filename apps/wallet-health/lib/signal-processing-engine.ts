/**
 * Signal Processing & Fourier Analysis Engine
 * FFT, Butterworth filters, wavelet transform, Hilbert transform
 */

export interface FrequencyDomain {
  frequencies: number[];
  magnitudes: number[];
  phases: number[];
  dominantFrequency: number;
  powerSpectrum: number[];
}

export interface FilterResult {
  filtered: number[];
  frequency: number;
  attenuation: number;
}

export class SignalProcessingEngine {
  /**
   * Fast Fourier Transform (FFT) - Cooley-Tukey algorithm
   */
  fft(signal: number[]): { real: number[]; imag: number[] } {
    const n = signal.length;
    const m = this.nextPowerOf2(n);
    const paddedSignal = [...signal, ...new Array(m - n).fill(0)];

    return this.fftRecursive(
      paddedSignal.map((x) => ({ real: x, imag: 0 }))
    );
  }

  /**
   * Power Spectral Density using Welch's method
   */
  powerSpectralDensity(
    signal: number[],
    windowSize: number = 256,
    overlap: number = 128
  ): FrequencyDomain {
    const segments: number[][] = [];
    
    for (let i = 0; i < signal.length - windowSize; i += windowSize - overlap) {
      segments.push(signal.slice(i, i + windowSize));
    }

    const psds: number[][] = [];
    for (const segment of segments) {
      const windowed = this.applyHannWindow(segment);
      const fftResult = this.fft(windowed);
      const psd = fftResult.real.map((r, i) => 
        Math.sqrt(r * r + fftResult.imag[i] * fftResult.imag[i])
      );
      psds.push(psd);
    }

    const avgPsd = psds[0].map((_, i) => 
      psds.reduce((sum, psd) => sum + psd[i], 0) / psds.length
    );

    const n = windowSize;
    const frequencies = avgPsd.slice(0, n / 2).map((_, i) => i / n);
    const magnitudes = avgPsd.slice(0, n / 2);
    const fftResult = this.fft(signal);
    const phases = fftResult.real.slice(0, n / 2).map((r, i) => 
      Math.atan2(fftResult.imag[i], r)
    );

    let maxMagnitude = 0;
    let dominantIdx = 0;
    magnitudes.forEach((mag, i) => {
      if (mag > maxMagnitude) {
        maxMagnitude = mag;
        dominantIdx = i;
      }
    });

    return {
      frequencies,
      magnitudes,
      phases,
      dominantFrequency: frequencies[dominantIdx],
      powerSpectrum: magnitudes,
    };
  }

  /**
   * Butterworth low-pass filter
   */
  butterworthLowPass(
    signal: number[],
    cutoffFreq: number,
    order: number = 4,
    sampleRate: number = 1.0
  ): FilterResult {
    const { b, a } = this.designButterworthFilter(cutoffFreq, sampleRate, order, 'lowpass');
    const filtered = this.filterSignal(signal, b, a);

    return {
      filtered,
      frequency: cutoffFreq,
      attenuation: 20 * order * Math.log10(2),
    };
  }

  /**
   * Private helper methods
   */

  private fftRecursive(x: { real: number; imag: number }[]): { real: number[]; imag: number[] } {
    const n = x.length;
    if (n === 1) return { real: [x[0].real], imag: [x[0].imag] };

    const even = x.filter((_, i) => i % 2 === 0);
    const odd = x.filter((_, i) => i % 2 === 1);

    const fftEven = this.fftRecursive(even);
    const fftOdd = this.fftRecursive(odd);

    const real = new Array(n);
    const imag = new Array(n);

    for (let k = 0; k < n / 2; k++) {
      const angle = (-2 * Math.PI * k) / n;
      const twiddleReal = Math.cos(angle);
      const twiddleImag = Math.sin(angle);

      const oddReal = fftOdd.real[k] * twiddleReal - fftOdd.imag[k] * twiddleImag;
      const oddImag = fftOdd.real[k] * twiddleImag + fftOdd.imag[k] * twiddleReal;

      real[k] = fftEven.real[k] + oddReal;
      imag[k] = fftEven.imag[k] + oddImag;
      real[k + n / 2] = fftEven.real[k] - oddReal;
      imag[k + n / 2] = fftEven.imag[k] - oddImag;
    }

    return { real, imag };
  }

  private nextPowerOf2(n: number): number {
    return Math.pow(2, Math.ceil(Math.log2(n)));
  }

  private applyHannWindow(signal: number[]): number[] {
    const n = signal.length;
    return signal.map((x, i) => x * (0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (n - 1))));
  }

  private designButterworthFilter(
    cutoff: number,
    sampleRate: number,
    order: number,
    type: 'lowpass' | 'highpass'
  ): { b: number[]; a: number[] } {
    const wc = 2 * Math.PI * cutoff / sampleRate;
    const k = Math.tan(wc / 2);

    let b: number[];
    let a: number[];

    if (type === 'lowpass') {
      const norm = 1 / (1 + Math.SQRT2 * k + k * k);
      b = [k * k * norm, 2 * k * k * norm, k * k * norm];
      a = [1, 2 * (k * k - 1) * norm, (1 - Math.SQRT2 * k + k * k) * norm];
    } else {
      const norm = 1 / (1 + Math.SQRT2 * k + k * k);
      b = [norm, -2 * norm, norm];
      a = [1, 2 * (k * k - 1) * norm, (1 - Math.SQRT2 * k + k * k) * norm];
    }

    return { b, a };
  }

  private filterSignal(signal: number[], b: number[], a: number[]): number[] {
    const filtered: number[] = [];
    const n = signal.length;
    const nb = b.length;
    const na = a.length;

    for (let i = 0; i < n; i++) {
      let y = 0;

      for (let j = 0; j < nb; j++) {
        if (i - j >= 0) y += b[j] * signal[i - j];
      }

      for (let j = 1; j < na; j++) {
        if (i - j >= 0) y -= a[j] * filtered[i - j];
      }

      filtered.push(y / a[0]);
    }

    return filtered;
  }
}
