import {
  GOATAI_ERC20_CONTRACT_ADDRESS,
  USDC_ERC20_CONTRACT_ADDRESS,
  WETH_ERC20_CONTRACT_ADDRESS,
} from './address';
import { Token } from '@/types';
export const NATIVE_TOKEN: Token = {
  address: '0x0000000000000000000000000000000000000000',
  decimals: 18,
  isNative: true,
  logo: 'https://token-icons.s3.amazonaws.com/eth.png',
  name: 'Ethereum',
  symbol: 'ETH',
  wrappedAddress: WETH_ERC20_CONTRACT_ADDRESS,
};

export const GOATAI_TOKEN: Token = {
  address: GOATAI_ERC20_CONTRACT_ADDRESS,
  decimals: 18,
  isPlatformToken: true,
  logo: 'src/assets/images/goatai-logo.png',
  name: 'G.O.A.T.AI',
  symbol: 'GOATAI',
  wrappedAddress: GOATAI_ERC20_CONTRACT_ADDRESS,
};

export const tokens: Token[] = [
  NATIVE_TOKEN,
  GOATAI_TOKEN,
  {
    address: USDC_ERC20_CONTRACT_ADDRESS,
    decimals: 6,
    logo: 'https://coin-images.coingecko.com/coins/images/6319/large/usdc.png',
    name: 'USD Coin',
    symbol: 'USDC',
    wrappedAddress: USDC_ERC20_CONTRACT_ADDRESS,
  },
];
