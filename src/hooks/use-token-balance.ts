import useWeb3React from './use-web3-react';
import GtaErc20Abi from '@/abis/GtaERC20.json';
import { client } from '@/adapters/thirdweb';
import { BASE_CHAIN_CONFIG } from '@/constants/config';
import { tokens } from '@/constants/tokens';
import { Token } from '@/types';
import { useQueries } from '@tanstack/react-query';
import { useMemo } from 'react';
import { getContract } from 'thirdweb';
import { getBalance } from 'thirdweb/extensions/erc20';
import { useWalletBalance } from 'thirdweb/react';
import { Abi } from 'viem';

const getBalanceToken = async (address: string, token: string) => {
  if (!address) return;
  const contract = getContract({
    abi: GtaErc20Abi.abi as Abi,
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

const useTokenBalance = (token: null | Token) => {
  const { address } = useWeb3React();

  const { data, isError, isLoading } = useWalletBalance({
    address,
    chain: BASE_CHAIN_CONFIG,
    client: client,
    tokenAddress: token?.isNative ? undefined : token?.address,
  });

  return {
    balance: data,
    isError,
    isLoading,
  };
};

export default useTokenBalance;

export const useAllTokenBalance = () => {
  const { address } = useWeb3React();

  const { data, isError, isLoading } = useWalletBalance({
    address,
    chain: BASE_CHAIN_CONFIG,
    client: client,
  });

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
            queryFn: () => getBalanceToken(address, token.address),
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
