/**
 * ScanWalletSecurityUseCase Tests
 */

import { ScanWalletSecurityUseCase } from '../scan-wallet-security.use-case';

describe('ScanWalletSecurityUseCase', () => {
  let useCase: ScanWalletSecurityUseCase;
  let mockSecurityRepo: any;
  let mockWalletRepo: any;

  beforeEach(() => {
    mockSecurityRepo = {
      save: jest.fn(),
      findByWalletAddress: jest.fn(),
    };
    mockWalletRepo = {
      findByAddress: jest.fn(),
    };
    useCase = new ScanWalletSecurityUseCase(mockSecurityRepo, mockWalletRepo);
  });

  it('should scan wallet and return security report', async () => {
    const mockWallet = {
      address: '0x123',
      transactions: [],
    };
    mockWalletRepo.findByAddress.mockResolvedValue(mockWallet);

    const result = await useCase.execute({
      walletAddress: '0x123',
      chainId: 1,
    });

    expect(result).toHaveProperty('riskScore');
    expect(result).toHaveProperty('threats');
    expect(mockSecurityRepo.save).toHaveBeenCalled();
  });

  it('should throw error if wallet not found', async () => {
    mockWalletRepo.findByAddress.mockResolvedValue(null);

    await expect(
      useCase.execute({ walletAddress: '0x123', chainId: 1 })
    ).rejects.toThrow();
  });
});


