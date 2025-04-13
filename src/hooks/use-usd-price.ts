import { PRICING_API_URL } from '@/constants';
import { Token } from '@/types';
import { useQuery } from '@tanstack/react-query';

type TokenUsdPrice = {
  price: number;
  token: string;
};

async function getUSDPrice(token: string) {
  try {
    const response = await fetch(`${PRICING_API_URL}/token/price?token=${token}`);
    const data = (await response.json()) as TokenUsdPrice;
    return data.price;
  } catch (error) {
    console.error('Failed to fetch GOATAI price', error);
    return 0;
  }
}

export const useGetTokenUSDPrice = (token: Token) => {
  const { data: tokenPriceInUSD, isLoading } = useQuery({
    queryFn: () => getUSDPrice(token.wrappedAddress),
    queryKey: ['token-usd-price', token.wrappedAddress],
    refetchInterval: 15 * 1000,
    refetchOnMount: false,
    staleTime: Infinity,
  });

  return {
    isLoading,
    tokenPriceInUSD,
  };
};
