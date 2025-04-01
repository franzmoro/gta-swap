import { GTA_ERC20, USDC_ERC20 } from './address';
import { Token } from '@/types';
export const NATIVE_TOKEN: Token = {
  address: '0x0000000000000000000000000000000000000000',
  decimals: 18,
  isNative: true,
  logo: 'https://token-icons.s3.amazonaws.com/eth.png',
  name: 'Ethereum',
  symbol: 'ETH',
};

export const tokens: Token[] = [
  NATIVE_TOKEN,
  {
    address: GTA_ERC20,
    decimals: 18,
    logo: 'src/assets/images/fallback.png',
    name: 'G.O.A.T.AI',
    symbol: 'GOATAI',
  },
  {
    address: USDC_ERC20,
    decimals: 6,
    logo: 'https://coin-images.coingecko.com/coins/images/6319/large/usdc.png',
    name: 'USD Coin',
    symbol: 'USDC',
  },
];
