/**
 * Security Validation Schemas
 */

import { z } from 'zod';

export const ScanWalletSchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  chainId: z.number().int().positive(),
});

export const ThreatReportSchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  chainId: z.number().int().positive(),
  fromDate: z.string().datetime().optional(),
  toDate: z.string().datetime().optional(),
});

export const RiskLevelSchema = z.enum(['low', 'medium', 'high', 'critical']);

export const ThreatSchema = z.object({
  type: z.string(),
  severity: RiskLevelSchema,
  description: z.string(),
  affectedAddresses: z.array(z.string()).optional(),
});

export type ScanWalletInput = z.infer<typeof ScanWalletSchema>;
export type ThreatReportInput = z.infer<typeof ThreatReportSchema>;
export type ThreatInput = z.infer<typeof ThreatSchema>;

