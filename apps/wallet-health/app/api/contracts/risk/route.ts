import { NextRequest, NextResponse } from 'next/server';
import { smartContractRiskAnalyzer } from '@/lib/smart-contract-risk-analyzer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, contractAddress, chainId, contractData, method, parameters, value, gasEstimate } = body;

    switch (action) {
      case 'analyze':
        if (!contractAddress || !chainId) {
          return NextResponse.json(
            { success: false, message: 'contractAddress and chainId are required' },
            { status: 400 }
          );
        }
        const risk = await smartContractRiskAnalyzer.analyzeContract({
          contractAddress,
          chainId,
          contractData,
        });
        return NextResponse.json({ success: true, data: risk });

      case 'analyze_interaction':
        if (!contractAddress || !method) {
          return NextResponse.json(
            { success: false, message: 'contractAddress and method are required' },
            { status: 400 }
          );
        }
        const interactionRisk = smartContractRiskAnalyzer.analyzeInteraction({
          contractAddress,
          method,
          parameters,
          value,
          gasEstimate,
        });
        return NextResponse.json({ success: true, data: interactionRisk });

      case 'mark_vulnerable':
        if (!contractAddress) {
          return NextResponse.json(
            { success: false, message: 'contractAddress is required' },
            { status: 400 }
          );
        }
        smartContractRiskAnalyzer.markVulnerable(contractAddress);
        return NextResponse.json({ success: true });

      case 'mark_safe':
        if (!contractAddress) {
          return NextResponse.json(
            { success: false, message: 'contractAddress is required' },
            { status: 400 }
          );
        }
        smartContractRiskAnalyzer.markSafe(contractAddress);
        return NextResponse.json({ success: true });

      default:
        return NextResponse.json(
          { success: false, message: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('Contract risk analysis error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

