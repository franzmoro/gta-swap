import useApproveTransfer from './use-approve-transfer';
import useTransactionSettings from './use-transaction-settings';
import useWeb3React from './use-web3-react';
import { V2_ROUTER_02_ABI } from '@/abis/V2Router02';
import { V2_ROUTER_CONTRACT_ADDRESS } from '@/constants/address';
import { TokenFeeMath } from '@/lib/utils/token-fee-math';
import { SelectedTokens, SwapAmounts, SwapMode } from '@/types';
import { useCallback, useMemo } from 'react';
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi';

export const useSwap = (tokens: SelectedTokens, onSwapSuccess: () => void) => {
  const [tokenIn, tokenOut] = [tokens[SwapMode.SELL], tokens[SwapMode.BUY]];
  const { address: userAddress, isBaseSelected, isConnected } = useWeb3React();
  const { slippageFormatted: slippage, transactionDeadline } = useTransactionSettings();
  const {
    data: hash,
    error,
    isError,
    isPending,
    writeContractAsync,
  } = useWriteContract({
    mutation: {
      onSuccess: onSwapSuccess,
    },
  });
  const {
    error: rError,
    isError: riserror,
    isLoading: isConfirming,
    isSuccess: isConfirmed,
  } = useWaitForTransactionReceipt({
    hash,
  });

  const { approveToken, isApprovePending } = useApproveTransfer(tokenIn);

  const getDeadline = useCallback(() => {
    return BigInt(Math.floor(Date.now() / 1000) + transactionDeadline * 60);
  }, [transactionDeadline]);

  const swap = useCallback(
    async (swapAmounts: SwapAmounts) => {
      const [amountIn, amountOutExpected] = [
        swapAmounts[SwapMode.SELL].rawValue,
        swapAmounts[SwapMode.SELL].rawValue,
      ];
      if (!isBaseSelected && !isConnected)
        throw new Error('Wallet not connected or wrong network selected');

      if (!amountIn || !amountOutExpected) throw new Error('Invalid / no user input');

      const isETHIn = !!tokenIn.isNative;
      const isETHOut = !!tokenOut.isNative;

      const functionName =
        isETHIn ? 'swapExactETHForTokensSupportingFeeOnTransferTokens'
        : isETHOut ? 'swapExactTokensForETHSupportingFeeOnTransferTokens'
        : 'swapExactTokensForTokensSupportingFeeOnTransferTokens';

      try {
        if (!isETHIn) {
          await approveToken(amountIn);
        }

        const amountOutMin = TokenFeeMath.getMinAmountReceived(amountOutExpected, slippage);

        const args = {
          amountIn: isETHIn ? undefined : amountIn,
          amountOutMin: amountOutMin,
          deadline: getDeadline(),
          path: [tokenIn.wrappedAddress, tokenOut.wrappedAddress],
          to: userAddress,
        };

        return writeContractAsync({
          abi: V2_ROUTER_02_ABI,
          address: V2_ROUTER_CONTRACT_ADDRESS,
          args:
            isETHIn ?
              [args.amountOutMin, args.path, args.to, args.deadline]
            : [args.amountIn, args.amountOutMin, args.path, args.to, args.deadline],
          functionName,
          ...(isETHIn && { value: amountIn }),
        });
      } catch (err) {
        throw err;
      }
    },
    [
      isBaseSelected,
      isConnected,
      tokenIn,
      tokenOut,
      slippage,
      getDeadline,
      userAddress,
      writeContractAsync,
      approveToken,
    ]
  );

  return useMemo(
    () => ({
      hash,
      isApprovePending,
      isConfirmed,
      isSwapPending: isConfirming || isPending,
      swap,
    }),
    [hash, isConfirmed, isConfirming, isPending, isApprovePending, swap]
  );
};
