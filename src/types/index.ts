export enum Slippage {
  AUTO = 'Auto',
}

export enum SwapMode {
  BUY = 'buy',
  SELL = 'sell',
}

export type Token = {
  address: string;
  decimals: number;
  isNative?: boolean;
  logo?: string;
  name: string;
  symbol: string;
};
