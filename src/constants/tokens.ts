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
    address: '0x678685765D6eDb6E08f4c7C32D4f71b54bdA0291',
    decimals: 18,
    logo: 'src/assets/images/fallback.png',
    name: 'GTA',
    symbol: 'GTA',
  },
  {
    address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    decimals: 6,
    logo: 'https://coin-images.coingecko.com/coins/images/6319/large/usdc.png',
    name: 'USD Coin',
    symbol: 'USDC',
  },
];
