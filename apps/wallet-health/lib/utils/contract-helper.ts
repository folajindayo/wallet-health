/**
 * Contract Helper
 */

import { ethers } from 'ethers';

export async function callContractMethod(
  provider: ethers.BrowserProvider,
  contractAddress: string,
  abi: any[],
  method: string,
  params: any[]
) {
  const contract = new ethers.Contract(contractAddress, abi, provider);
  return await contract[method](...params);
}

export async function estimateGas(
  provider: ethers.BrowserProvider,
  contractAddress: string,
  abi: any[],
  method: string,
  params: any[]
): Promise<bigint> {
  const contract = new ethers.Contract(contractAddress, abi, provider);
  return await contract[method].estimateGas(...params);
}

