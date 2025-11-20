/**
 * GoldRush API Integration
 */

const BASE_URL = 'https://api.covalenthq.com/v1';

export async function fetchTokenBalances(chainName: string, address: string) {
  const response = await fetch(
    `${BASE_URL}/${chainName}/address/${address}/balances_v2/`,
    {
      headers: {
        'Authorization': `Bearer ${process.env.GOLDRUSH_API_KEY}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch token balances');
  }

  const data = await response.json();
  return data.data;
}

export async function fetchTokenApprovals(chainName: string, address: string) {
  const response = await fetch(
    `${BASE_URL}/${chainName}/approvals/${address}/`,
    {
      headers: {
        'Authorization': `Bearer ${process.env.GOLDRUSH_API_KEY}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch token approvals');
  }

  const data = await response.json();
  return data.data;
}

