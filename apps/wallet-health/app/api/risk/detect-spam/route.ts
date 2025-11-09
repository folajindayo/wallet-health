import { NextRequest, NextResponse } from 'next/server';

// Common spam token indicators
const SPAM_KEYWORDS = [
  'visit',
  'claim',
  'airdrop',
  'free',
  'reward',
  'bonus',
  'gift',
  'eth',
  'prize',
  'win',
  'voucher',
  'www.',
  'http',
  '.com',
  '.org',
  '.net',
  'telegram',
  'discord',
];

function detectSpamFromName(name: string): boolean {
  const lowerName = name.toLowerCase();
  return SPAM_KEYWORDS.some(keyword => lowerName.includes(keyword));
}

function detectSpamFromSymbol(symbol: string): boolean {
  const lowerSymbol = symbol.toLowerCase();
  // Check for URLs or suspicious patterns in symbol
  return (
    lowerSymbol.includes('www') ||
    lowerSymbol.includes('http') ||
    lowerSymbol.includes('.com') ||
    lowerSymbol.length > 10 // Suspiciously long symbols
  );
}

export async function POST(request: NextRequest) {
  try {
    const { tokens } = await request.json();

    if (!tokens || !Array.isArray(tokens)) {
      return NextResponse.json(
        { error: 'Tokens array is required' },
        { status: 400 }
      );
    }

    // Analyze each token for spam indicators
    const analyzedTokens = tokens.map((token: any) => {
      const nameSpam = detectSpamFromName(token.name || '');
      const symbolSpam = detectSpamFromSymbol(token.symbol || '');
      const zeroValue = parseFloat(token.balance || '0') === 0;
      
      // Calculate spam probability
      let spamScore = 0;
      if (nameSpam) spamScore += 40;
      if (symbolSpam) spamScore += 30;
      if (zeroValue && !token.nativeToken) spamScore += 20;
      if (token.isVerified === false) spamScore += 10;

      const isSpam = spamScore >= 50 || token.isSpam === true;

      return {
        ...token,
        isSpam,
        spamScore,
        spamReasons: [
          nameSpam && 'Suspicious name',
          symbolSpam && 'Suspicious symbol',
          zeroValue && 'Zero balance',
          !token.isVerified && 'Unverified contract',
        ].filter(Boolean),
      };
    });

    // Count spam tokens
    const spamCount = analyzedTokens.filter((t: any) => t.isSpam).length;
    const totalCount = analyzedTokens.length;
    const spamPercentage = totalCount > 0 ? (spamCount / totalCount) * 100 : 0;

    return NextResponse.json({
      success: true,
      data: {
        tokens: analyzedTokens,
        summary: {
          total: totalCount,
          spam: spamCount,
          clean: totalCount - spamCount,
          spamPercentage: Math.round(spamPercentage),
        },
      },
    });
  } catch (error: any) {
    console.error('Error detecting spam:', error.message);
    return NextResponse.json(
      { 
        error: 'Failed to detect spam',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

