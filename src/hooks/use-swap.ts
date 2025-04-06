import useRequestSpendingcap from './use-approve-transfer';
import { useTransactionToast } from './use-toast';
import useTransactionSettings from './use-transaction-settings';
import useWeb3React from './use-web3-react';
import { V2_ROUTER_02_ABI } from '@/abis/V2Router02';
import { V2_ROUTER_CONTRACT_ADDRESS } from '@/constants/address';
import { formatNumberOrString, NumberType } from '@/lib/utils/format-number';
import { TokenFeeMath } from '@/lib/utils/token-fee-math';
import { SelectedTokens, SwapAmounts, SwapMode } from '@/types';
import { useCallback, useEffect, useMemo } from 'react';
import { BaseError, ContractFunctionRevertedError } from 'viem';
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi';

const parseTxError = (error: unknown): string => {
  if (error instanceof BaseError) {
    if (error.shortMessage === 'User rejected the request.') {
      return 'Transaction rejected by user in wallet.';
    } else if (error instanceof ContractFunctionRevertedError) {
      return error.reason || 'Transaction reverted without a reason';
    }
    return error.shortMessage || error.message || 'An unknown error occurred';
  } else if (error instanceof Error) {
    return error.message || 'An unexpected error occurred';
  }
  return 'Unknown error occurred during transaction';
};

export const useSwap = (tokens: SelectedTokens, onSwapSuccess: () => void) => {
  const [tokenIn, tokenOut] = [tokens[SwapMode.SELL], tokens[SwapMode.BUY]];
  const { address: userAddress, isBaseSelected, isConnected } = useWeb3React();

  const { showError, showLoading, showSuccess } = useTransactionToast();

  const { slippageFormatted: slippage, transactionDeadline } = useTransactionSettings();
  const {
    data: hash,
    isPending,
    reset,
    writeContractAsync,
  } = useWriteContract({
    mutation: {
      onError: (e) => showError('Swap failed', parseTxError(e)),
      onSuccess: onSwapSuccess,
      retry: false,
    },
  });

  const {
    error: txnError,
    isError: isTxnError,
    isLoading: isConfirming,
    isSuccess: isConfirmed,
  } = useWaitForTransactionReceipt({
    hash,
    query: {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    },
    retryCount: 0,
  });

  useEffect(() => {
    if (txnError && isTxnError) showError('Swap failed', parseTxError(txnError));
    else if (isConfirmed) showSuccess('Swapped', 'Great deal bro');
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTxnError, isConfirmed]);

  const { isApprovePending, onRequestSpendingcap } = useRequestSpendingcap(tokenIn);

  const getDeadline = useCallback(() => {
    return BigInt(Math.floor(Date.now() / 1000) + transactionDeadline * 60);
  }, [transactionDeadline]);

  const swap = useCallback(
    async (swapAmounts: SwapAmounts) => {
      const [amountIn, amountOutExpected] = [
        swapAmounts[SwapMode.SELL].rawValue,
        swapAmounts[SwapMode.SELL].rawValue,
      ];
      if ((!isBaseSelected && !isConnected) || !userAddress)
        throw new Error('Wallet not connected / wrong network selected');

      if (!amountIn || !amountOutExpected) throw new Error('Invalid / no user input');

      const isETHIn = !!tokenIn.isNative;
      const isETHOut = !!tokenOut.isNative;

      const functionName =
        isETHIn ? 'swapExactETHForTokensSupportingFeeOnTransferTokens'
        : isETHOut ? 'swapExactTokensForETHSupportingFeeOnTransferTokens'
        : 'swapExactTokensForTokensSupportingFeeOnTransferTokens';

      try {
        showLoading(
          'Swapping',
          `Swapping ${formatNumberOrString({ input: swapAmounts[SwapMode.SELL].displayValue, type: NumberType.TokenNonTx })} ${tokenIn.symbol} for ${formatNumberOrString({ input: swapAmounts[SwapMode.BUY].displayValue, type: NumberType.TokenNonTx })}  ${tokenOut.symbol}`
        );
        if (!isETHIn) {
          await onRequestSpendingcap(amountIn);
        }

        const amountOutMin = TokenFeeMath.getMinAmountReceived(amountOutExpected, slippage);

        const args = {
          amountIn,
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
          ...(isETHIn && { value: args.amountIn }),
        });
      } catch (err) {
        showError('Swap failed', parseTxError(err));
        throw err;
      }
    },
    [
      isBaseSelected,
      isConnected,
      userAddress,
      tokenIn,
      tokenOut,
      showLoading,
      slippage,
      getDeadline,
      writeContractAsync,
      onRequestSpendingcap,
      showError,
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
