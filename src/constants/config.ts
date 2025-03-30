import { base } from 'thirdweb/chains';

export const ACTIVE_CHAIN = base;
export const ACTIVE_CHAIN_ID = ACTIVE_CHAIN.id;

export const AUTO_SLIPPAGE_VALUE = 5;
export const DEFAULT_TRANSACTION_DEADLINE = 30;
export const MAX_TRANSACTION_DEADLINE = 4320; // 3 days
