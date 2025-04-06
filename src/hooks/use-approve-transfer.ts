import useWeb3React from './use-web3-react';
import { ERC20_ABI } from '@/abis/Erc20';
import { V2_ROUTER_CONTRACT_ADDRESS } from '@/constants/address';
import { Token } from '@/types';
import { useCallback } from 'react';
import { useConfig, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { readContract, waitForTransactionReceipt } from 'wagmi/actions';

const useRequestSpendingcap = (token: Token) => {
  const { address: userAddress, isBaseSelected, isConnected } = useWeb3React();
  const { data: hash, error, isError, isPending, writeContractAsync } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const config = useConfig();

  const onRequestSpendingcap = useCallback(
    async (amount: bigint) => {
      if (!isBaseSelected && !isConnected)
        throw new Error('Wallet not connected or wrong network selected');
      if (!userAddress) throw new Error('Wallet not connected');

      try {
        if (token.isNative) return;
        // check if user already approved allowance on the contract
        const allowance = await readContract(config, {
          abi: ERC20_ABI,
          address: token.wrappedAddress,
          args: [userAddress, V2_ROUTER_CONTRACT_ADDRESS],
          functionName: 'allowance',
        });

        // user already have allowance for the token
        if (amount <= allowance) return;
        const txhash = await writeContractAsync({
          abi: ERC20_ABI,
          address: token.wrappedAddress,
          args: [V2_ROUTER_CONTRACT_ADDRESS, amount],
          functionName: 'approve',
        });
        await waitForTransactionReceipt(config, { hash: txhash });
        return txhash;
      } catch (err) {
        throw err;
      }
    },
    [config, isBaseSelected, isConnected, token, userAddress, writeContractAsync]
  );

  return {
    error,
    isApprovePending: isConfirming || isPending,
    isConfirmed,
    isError,
    onRequestSpendingcap,
  };
};

export default useRequestSpendingcap;
