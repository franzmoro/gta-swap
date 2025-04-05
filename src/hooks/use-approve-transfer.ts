import useWeb3React from './use-web3-react';
import { ERC20_ABI } from '@/abis/Erc20';
import { V2_ROUTER_CONTRACT_ADDRESS } from '@/constants/address';
import { Token } from '@/types';
import { useCallback } from 'react';
import { useConfig, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { waitForTransactionReceipt } from 'wagmi/actions';

const useApproveTransfer = (token: Token) => {
  const { address: userAddress, isBaseSelected, isConnected } = useWeb3React();
  const { data: hash, error, isError, isPending, writeContractAsync } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const config = useConfig();

  const approveToken = useCallback(
    async (amount: bigint) => {
      if (!isBaseSelected && !isConnected)
        throw new Error('Wallet not connected or wrong network selected');
      if (!userAddress) throw new Error('Wallet not connected');

      try {
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
    [config, isBaseSelected, isConnected, token.wrappedAddress, userAddress, writeContractAsync]
  );

  return {
    approveToken,
    error,
    isApprovePending: isConfirming || isPending,
    isConfirmed,
    isError,
  };
};

export default useApproveTransfer;
