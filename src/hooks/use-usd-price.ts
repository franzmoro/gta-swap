import { V2_PAIR_ABI } from '@/abis/V2Pair';
import {
  GOATAI_ERC20_CONTRACT_ADDRESS,
  GOATAI_WETH_POOL_CONTRACT_ADDRESS,
  USDC_ERC20_CONTRACT_ADDRESS,
  USDC_WETH_POOL_CONTRACT_ADDRESS,
} from '@/constants/address';
import { COINGECKO_ETH_PRICE_API_URL } from '@/constants/index';
import { NATIVE_TOKEN } from '@/constants/tokens';
import { Token } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { formatUnits } from 'viem';
import { useReadContract } from 'wagmi';

const TOKEN_PAIR_MAP = {
  [GOATAI_ERC20_CONTRACT_ADDRESS]: GOATAI_WETH_POOL_CONTRACT_ADDRESS,
  [USDC_ERC20_CONTRACT_ADDRESS]: USDC_WETH_POOL_CONTRACT_ADDRESS,
} as const;

async function getETHPrice(): Promise<number> {
  try {
    const response = await fetch(COINGECKO_ETH_PRICE_API_URL);
    const data = await response.json();
    return data.ethereum.usd;
  } catch (error) {
    console.error('Failed to fetch ETH price', error);
    return 0;
  }
}

export const useGetTokenUSDPrice = (token: Token) => {
  const pairAddress = TOKEN_PAIR_MAP[token.address as keyof typeof TOKEN_PAIR_MAP];

  const { data: ethPrice, isLoading: isEthPriceLoading } = useQuery({
    queryFn: getETHPrice,
    queryKey: ['ethPrice'],
    refetchInterval: 15 * 1000,
    refetchOnMount: false,
    staleTime: Infinity,
  });

  // Fetch reserves from Uniswap V2 Pair
  const { data: reserves, isLoading: isReservesLoading } = useReadContract({
    abi: V2_PAIR_ABI,
    address: pairAddress,
    functionName: 'getReserves',
    query: {
      enabled: !!pairAddress,
      refetchOnMount: false,
    },
  });

  // Fetch token0 to determine order
  const { data: token0, isLoading: isToken0Loading } = useReadContract({
    abi: V2_PAIR_ABI,
    address: pairAddress,
    functionName: 'token0',
    query: {
      enabled: !!pairAddress,
      refetchOnMount: false,
    },
  });

  return useMemo(() => {
    if (!token) {
      return { isLoading: false, tokenPriceInUSD: 0 };
    }

    if (isEthPriceLoading || isReservesLoading || isToken0Loading) {
      return { isLoading: true, tokenPriceInUSD: 0 };
    }

    if (token?.isNative) {
      return { isLoading: false, tokenPriceInUSD: ethPrice ?? 0 };
    }

    if (!reserves || !token0) {
      return { isLoading: false, tokenPriceInUSD: 0 };
    }

    // Extract reserves
    const [reserve0, reserve1] = reserves;
    const isToken0 = token0 === token.address;
    const tokenReserve = isToken0 ? reserve0 : reserve1;
    const wethReserve = isToken0 ? reserve1 : reserve0;

    const formattedTokenReserve = parseFloat(formatUnits(tokenReserve, token.decimals));
    const formattedWethReserve = parseFloat(formatUnits(wethReserve, NATIVE_TOKEN.decimals)); // WETH is always 18 decimals

    // Compute price in WETH
    const tokenPriceInWETH =
      formattedTokenReserve > 0 ? formattedWethReserve / formattedTokenReserve : 0;

    const tokenPriceInUSD = tokenPriceInWETH * (ethPrice ?? 0);

    return { isLoading: false, tokenPriceInUSD };
  }, [ethPrice, isEthPriceLoading, isReservesLoading, isToken0Loading, reserves, token, token0]);
};
