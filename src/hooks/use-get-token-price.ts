import { PRICING_API_URL } from '@/constants';
import { GOATAI_ERC20_CONTRACT_ADDRESS, USDC_ERC20_CONTRACT_ADDRESS } from '@/constants/address';
import { NATIVE_TOKEN } from '@/constants/tokens';
import { Token } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { formatUnits } from 'viem';

type PoolInfoResponse = {
  reserves: [string, string];
  token0: `0x${string}`;
  token1: `0x${string}`;
};

type PricePair = 'ETH_GOATAI' | 'ETH_USDC';

type TokenPrice = {
  isError: boolean;
  loading: boolean;
  tokenAPrice: number; // Price of tokenA in terms of tokenB
  tokenBPrice: number; // Price of tokenB in terms of tokenA
};

const getReserves = async (pool: PricePair) => {
  try {
    const response = await fetch(`${PRICING_API_URL}/pool/${pool}`);
    const data = (await response.json()) as PoolInfoResponse;
    return {
      ...data,
      reserves: data.reserves.map((reserve) => BigInt(reserve)),
    };
  } catch (error) {
    console.error('Error fetching reserves', error);
    return null;
  }
};

export function useTokenPriceFromPool(tokenA: Token, tokenB: Token): TokenPrice {
  const involvesUSDC =
    tokenA.address.toLowerCase() === USDC_ERC20_CONTRACT_ADDRESS.toLowerCase() ||
    tokenB.address.toLowerCase() === USDC_ERC20_CONTRACT_ADDRESS.toLowerCase();

  const {
    data: gotaiEthPoolData,
    isError: error1,
    isLoading: loading1,
  } = useQuery({
    queryFn: () => getReserves('ETH_GOATAI'),
    queryKey: ['pool-reserves', 'ETH_GOATAI'],
  });

  const {
    data: ethUsdcPoolData,
    isError: error2,
    isLoading: loading2,
  } = useQuery({
    enabled: involvesUSDC,
    queryFn: () => getReserves('ETH_USDC'),
    queryKey: ['pool-reserves', 'ETH_USDC'],
  });

  const { tokenAPrice, tokenBPrice } = useMemo(() => {
    if (!tokenA || !tokenB) return { tokenAPrice: 0, tokenBPrice: 0 };

    // 2-hop pricing logic
    if (involvesUSDC && gotaiEthPoolData && ethUsdcPoolData) {
      if (
        tokenA.address?.toLowerCase() === USDC_ERC20_CONTRACT_ADDRESS.toLowerCase() &&
        tokenB.address?.toLowerCase() === GOATAI_ERC20_CONTRACT_ADDRESS.toLowerCase()
      ) {
        // Path: USDC -> ETH -> GOATAI

        // ETH_USDC pool: Determine token order
        const usdcIsToken0 =
          ethUsdcPoolData.token0?.toLowerCase() === USDC_ERC20_CONTRACT_ADDRESS.toLowerCase();
        const [usdcReserve, ethReserve] =
          usdcIsToken0 ?
            [ethUsdcPoolData.reserves[0], ethUsdcPoolData.reserves[1]]
          : [ethUsdcPoolData.reserves[1], ethUsdcPoolData.reserves[0]];
        const ethPerUsdc =
          Number(formatUnits(ethReserve, NATIVE_TOKEN.decimals)) /
          Number(formatUnits(usdcReserve, tokenA.decimals)); // ETH/USDC

        // ETH_GOATAI pool: Determine token order
        const ethIsToken0 =
          gotaiEthPoolData.token0?.toLowerCase() === NATIVE_TOKEN.wrappedAddress.toLowerCase();
        const [ethReserveGoatai, goataiReserve] =
          ethIsToken0 ?
            [gotaiEthPoolData.reserves[0], gotaiEthPoolData.reserves[1]]
          : [gotaiEthPoolData.reserves[1], gotaiEthPoolData.reserves[0]];
        const goataiPerEth =
          Number(formatUnits(goataiReserve, tokenB.decimals)) /
          Number(formatUnits(ethReserveGoatai, NATIVE_TOKEN.decimals)); // GOATAI/ETH

        const priceAinB = ethPerUsdc * goataiPerEth; // USDC -> GOATAI
        const priceBinA = priceAinB ? 1 / priceAinB : 0; // GOATAI -> USDC

        return { tokenAPrice: priceAinB, tokenBPrice: priceBinA };
      } else if (
        tokenB.address?.toLowerCase() === USDC_ERC20_CONTRACT_ADDRESS.toLowerCase() &&
        tokenA.address?.toLowerCase() === GOATAI_ERC20_CONTRACT_ADDRESS.toLowerCase()
      ) {
        // Path: GOATAI -> ETH -> USDC

        // ETH_GOATAI pool: Determine token order
        const ethIsToken0 =
          gotaiEthPoolData.token0?.toLowerCase() === NATIVE_TOKEN.wrappedAddress.toLowerCase();
        const [ethReserveGoatai, goataiReserve] =
          ethIsToken0 ?
            [gotaiEthPoolData.reserves[0], gotaiEthPoolData.reserves[1]]
          : [gotaiEthPoolData.reserves[1], gotaiEthPoolData.reserves[0]];

        const ethPerGoatai =
          Number(formatUnits(ethReserveGoatai, NATIVE_TOKEN.decimals)) /
          Number(formatUnits(goataiReserve, tokenA.decimals)); // ETH/GOATAI

        // ETH_USDC pool: Determine token order
        const usdcIsToken0 =
          ethUsdcPoolData.token0?.toLowerCase() === USDC_ERC20_CONTRACT_ADDRESS.toLowerCase();
        const [usdcReserve, ethReserve] =
          usdcIsToken0 ?
            [ethUsdcPoolData.reserves[0], ethUsdcPoolData.reserves[1]]
          : [ethUsdcPoolData.reserves[1], ethUsdcPoolData.reserves[0]];

        const usdcPerEth =
          Number(formatUnits(usdcReserve, tokenB.decimals)) /
          Number(formatUnits(ethReserve, NATIVE_TOKEN.decimals)); // USDC/ETH

        const priceAinB = ethPerGoatai * usdcPerEth; // GOATAI -> USDC
        const priceBinA = priceAinB ? 1 / priceAinB : 0; // USDC -> GOATAI        return { priceAinB, priceBinA };

        return { tokenAPrice: priceAinB, tokenBPrice: priceBinA };
      }
      return { tokenAPrice: 0, tokenBPrice: 0 };
    }

    // === 1-hop pricing logic ===
    if (!gotaiEthPoolData) return { tokenAPrice: 0, tokenBPrice: 0 };

    const { reserves: reservesData, token0 } = gotaiEthPoolData;

    const isTokenAFirst = tokenA.wrappedAddress?.toLowerCase() === token0?.toLowerCase();
    const reserveA = isTokenAFirst ? reservesData[0] : reservesData[1];
    const reserveB = isTokenAFirst ? reservesData[1] : reservesData[0];

    const formattedReserveA = Number(formatUnits(reserveA, tokenA.decimals));
    const formattedReserveB = Number(formatUnits(reserveB, tokenB.decimals));

    const tokenAPrice = formattedReserveB / formattedReserveA;
    const tokenBPrice = formattedReserveA / formattedReserveB;

    return { tokenAPrice, tokenBPrice };
  }, [tokenA, tokenB, involvesUSDC, gotaiEthPoolData, ethUsdcPoolData]);

  return {
    isError: error1 || error2,
    loading: loading1 || loading2,
    tokenAPrice,
    tokenBPrice,
  };
}
