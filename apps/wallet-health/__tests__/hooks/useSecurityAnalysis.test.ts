/**
 * useSecurityAnalysis Hook Tests
 */

import { renderHook, waitFor } from '@testing-library/react';
import { useSecurityAnalysis } from '../../hooks/useSecurityAnalysis';

global.fetch = jest.fn();

describe('useSecurityAnalysis', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches analysis when address provided', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      json: async () => ({ score: 85, risks: [], recommendations: [] }),
    });

    const { result } = renderHook(() =>
      useSecurityAnalysis('0x123')
    );

    await waitFor(() => {
      expect(result.current.analysis).toBeTruthy();
    });

    expect(result.current.analysis?.score).toBe(85);
  });

  it('returns null for undefined address', () => {
    const { result } = renderHook(() =>
      useSecurityAnalysis(undefined)
    );

    expect(result.current.analysis).toBeNull();
  });
});

