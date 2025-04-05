import useWeb3React from './use-web3-react';
import { ERC20_ABI } from '@/abis/Erc20';
import { client } from '@/adapters/thirdweb';
import { BASE_CHAIN_CONFIG } from '@/constants/config';
import { tokens } from '@/constants/tokens';
import { Token } from '@/types';
import { skipToken, useQueries, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { getContract } from 'thirdweb';
import { getBalance } from 'thirdweb/extensions/erc20';
import { useWalletBalance } from 'thirdweb/react';

export type TokenBalance = {
  displayValue: string;
  value: bigint;
};

const getTokenBalance = async (address: string, token: string) => {
  if (!address) return;
  const contract = getContract({
    abi: ERC20_ABI,
    address: token.toLowerCase(),
    chain: BASE_CHAIN_CONFIG,
    client: client,
  });

  const balance = await getBalance({
    address: address,
    contract: contract,
  });

  return balance;
};

export const useGetEthBalance = () => {
  const { address } = useWeb3React();

  return useWalletBalance({
    address,
    chain: BASE_CHAIN_CONFIG,
    client: client,
  });
};

const useTokenBalance = (token: Token) => {
  const { address } = useWeb3React();

  const {
    data: ethBalance,
    isLoading: isEthBalanceLoading,
    refetch: refetchEthBalance,
  } = useGetEthBalance();

  const { data, isLoading, refetch } = useQuery({
    queryFn: !token.isNative && address ? () => getTokenBalance(address, token.address) : skipToken,
    queryKey: ['token-balance', token.address, address],
  });

  return {
    balance: token.isNative ? ethBalance : data,
    isLoading: isEthBalanceLoading || isLoading,
    refetch: token.isNative ? refetchEthBalance : refetch,
    refetchEthBalance,
  };
};

export default useTokenBalance;

export const useAllTokenBalance = () => {
  const { address } = useWeb3React();

  const { data, isError, isLoading } = useGetEthBalance();

  const {
    data: allTokenBalance,
    isError: isErrorAllTokenBalance,
    isLoading: isLoadingAllTokenBalance,
  } = useQueries({
    combine: (results) => {
      return {
        data: results.map((result) => result.data),
        isError: results.some((result) => result.isError),
        isLoading: results.some((result) => result.isLoading),
      };
    },
    queries:
      address ?
        tokens
          .filter((token) => !token.isNative)
          .map((token) => ({
            queryFn: () => getTokenBalance(address, token.address),
            queryKey: ['token-balance', token.address, address],
          }))
      : [],
  });

  const allTokenBalanceCombined = useMemo(() => {
    if (data && allTokenBalance) {
      // As its just 3 tokens, we are manually combining the data, modify this if more tokens are added
      return {
        [tokens[0].address]: data,
        [tokens[1].address]: allTokenBalance[0],
        [tokens[2].address]: allTokenBalance[1],
      };
    }
    return {};
  }, [allTokenBalance, data]);

  return {
    data: allTokenBalanceCombined,
    isError: isErrorAllTokenBalance || isError,
    isLoading: isLoadingAllTokenBalance || isLoading,
  };
};
