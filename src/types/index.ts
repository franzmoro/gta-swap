export enum Slippage {
  AUTO = 'Auto',
}

export enum SwapMode {
  BUY = 'buy',
  SELL = 'sell',
}

export type SelectedTokens = {
  [SwapMode.BUY]: Token;
  [SwapMode.SELL]: Token;
};

export type SwapAmounts = {
  [SwapMode.BUY]: { displayValue: string; rawValue: bigint };
  [SwapMode.SELL]: { displayValue: string; rawValue: bigint };
};

export type Token = {
  address: string;
  decimals: number;
  isNative?: boolean;
  isPlatformToken?: boolean;
  logo?: string;
  name: string;
  symbol: string;
  wrappedAddress: string;
};
