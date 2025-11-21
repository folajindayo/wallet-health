/**
 * Security Scan Validators
 */

import { z } from 'zod';

export const walletAddressSchema = z.string().regex(/^0x[a-fA-F0-9]{40}$/, {
  message: "Invalid Ethereum address",
});

export const chainIdSchema = z.number().int().positive();

export const createScanSchema = z.object({
  walletAddress: walletAddressSchema,
  chainId: chainIdSchema,
});

export const threatSchema = z.object({
  type: z.string(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  description: z.string(),
});

export class SecurityScanValidator {
  static validateWalletAddress(address: unknown) {
    return walletAddressSchema.parse(address);
  }

  static validateCreateScan(data: unknown) {
    return createScanSchema.parse(data);
  }

  static validateThreat(data: unknown) {
    return threatSchema.parse(data);
  }
}

