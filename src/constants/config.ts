import { base, defineChain } from 'thirdweb/chains';
import { type Chain } from 'viem';
import { base as wagmiBase } from 'wagmi/chains';

export const ACTIVE_CHAIN = base;
export const BASE_CHAIN_ID = 8453;

export const AUTO_SLIPPAGE_VALUE = 5;
export const DEFAULT_TRANSACTION_DEADLINE = 30;
export const MAX_TRANSACTION_DEADLINE = 4320; // 3 days

// thirdweb
export const BASE_CHAIN_CONFIG = defineChain({
  ...base,
  rpc: 'http://127.0.0.1:8545',
});

// wagmi
export const baseChain = {
  ...wagmiBase,
  rpcUrls: {
    default: { http: ['http://127.0.0.1:8545'] },
  },
} as const satisfies Chain;
