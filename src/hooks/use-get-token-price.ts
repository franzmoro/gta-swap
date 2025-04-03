import { V2_FACTORY_ABI } from '@/abis/V2Factory';
import { V2_PAIR_ABI } from '@/abis/V2Pair';
import { V2_FACTORY_CONTRACT_ADDRESS } from '@/constants/address';
import { Token } from '@/types';
import { useMemo } from 'react';
import { formatUnits } from 'viem';
import { useReadContract } from 'wagmi';

type TokenPrice = {
  isError: boolean;
  loading: boolean;
  pairAddress: null | string;
  tokenAPrice: number; // Price of tokenA in terms of tokenB
  tokenBPrice: number; // Price of tokenB in terms of tokenA
};

export function useTokenPriceFromPool(tokenA: Token, tokenB: Token): TokenPrice {
  // Get pair address from factory
  const { data: pairAddress, isLoading: isPairAddressLoading } = useReadContract({
    abi: V2_FACTORY_ABI,
    address: V2_FACTORY_CONTRACT_ADDRESS,
    args: [tokenB.wrappedAddress as `0x${string}`, tokenA.wrappedAddress as `0x${string}`],
    functionName: 'getPair',
  });

  // Get token0 address to determine the order
  const { data: token0Address, isLoading: isToken0AddressLoading } = useReadContract({
    abi: V2_PAIR_ABI,
    address: pairAddress as `0x${string}` | undefined,
    functionName: 'token0',
    query: {
      enabled: !!pairAddress,
    },
  });

  // Get reserves from pair
  const {
    data: reservesData,
    isError: isReservesError,
    isLoading: isReservesLoading,
  } = useReadContract({
    abi: V2_PAIR_ABI,
    address: pairAddress as `0x${string}` | undefined,
    functionName: 'getReserves',
    query: {
      enabled: !!(pairAddress && token0Address),
      refetchInterval: 15 * 1000,
    },
  });

  // Calculate prices from reserves
  const { tokenAPrice, tokenBPrice } = useMemo(() => {
    if (!tokenA || !tokenB || !reservesData || !token0Address) {
      return { tokenAPrice: 0, tokenBPrice: 0 };
    }

    const isTokenAFirst = tokenA.wrappedAddress.toLowerCase() === token0Address.toLowerCase();

    // Get reserves in the right order
    const reserveA = isTokenAFirst ? reservesData[0] : reservesData[1];
    const reserveB = isTokenAFirst ? reservesData[1] : reservesData[0];

    // Format reserves with correct decimals
    const formattedReserveA = Number(formatUnits(reserveA, tokenA.decimals));
    const formattedReserveB = Number(formatUnits(reserveB, tokenB.decimals));

    // Calculate prices
    const tokenAPrice = formattedReserveB / formattedReserveA; // Price of A in terms of B
    const tokenBPrice = formattedReserveA / formattedReserveB; // Price of B in terms of A

    return { tokenAPrice, tokenBPrice };
  }, [tokenA, tokenB, reservesData, token0Address]);

  // Update error state if reserves fetch fails

  return {
    isError: isReservesError,
    loading: isReservesLoading || isPairAddressLoading || isToken0AddressLoading,
    pairAddress: pairAddress || null,
    tokenAPrice,
    tokenBPrice,
  };
}
