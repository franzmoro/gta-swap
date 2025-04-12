import useTransactionSettings from './use-transaction-settings';
import useWeb3React from './use-web3-react';
import { V2_ROUTER_02_ABI } from '@/abis/V2Router02';
import { V2_ROUTER_CONTRACT_ADDRESS } from '@/constants/address';
import { prepareSwapArgs } from '@/lib/utils/swap';
import { SelectedTokens, SwapAmounts, SwapMode } from '@/types';
import { useMemo } from 'react';
import { encodeFunctionData, formatEther } from 'viem';
import { useEstimateGas, useGasPrice } from 'wagmi';

const useGetGasFees = (swapAmounts: SwapAmounts, tokens: SelectedTokens) => {
  const { address, isBaseSelected, isConnected } = useWeb3React();
  const { slippageFormatted: slippage, transactionDeadline } = useTransactionSettings();

  const swapArgs = useMemo(() => {
    if (
      !address ||
      (!isConnected && !isBaseSelected) ||
      !swapAmounts[SwapMode.BUY].rawValue ||
      !swapAmounts[SwapMode.SELL].rawValue
    )
      return undefined;
    try {
      return prepareSwapArgs(swapAmounts, tokens, address, slippage, transactionDeadline);
    } catch (error) {
      console.error('Failed to prepare swap args:', error);
      return undefined;
    }
  }, [address, isBaseSelected, isConnected, slippage, swapAmounts, tokens, transactionDeadline]);

  const { args, functionName } = swapArgs || {};

  const encodedData = useMemo(() => {
    if (!args || !functionName) return undefined;
    return encodeFunctionData({
      abi: V2_ROUTER_02_ABI,
      args:
        args.isETHIn ?
          [args.amountOutMin, args.path, args.to, args.deadline]
        : [args.amountIn, args.amountOutMin, args.path, args.to, args.deadline],
      functionName,
    });
  }, [args, functionName]);
  // Estimate gas for the swap transaction
  const { data: gasEstimate, isLoading: isGasEstimateLoading } = useEstimateGas({
    account: address as `0x${string}`,
    data: encodedData,
    query: {
      enabled: !!swapArgs && !!args && !!address && !!functionName,
    },
    to: V2_ROUTER_CONTRACT_ADDRESS,
    value: args?.isETHIn && args?.amountIn ? args.amountIn : undefined,
  });

  // Fetch current gas price
  const { data: gasPrice, isLoading: isGasPriceLoading } = useGasPrice({
    query: {
      enabled: !!address && isBaseSelected && isConnected,
    },
  });

  // Calculate total gas cost
  const totalGasCost = useMemo(() => {
    if (!gasEstimate || !gasPrice) return '0';
    return formatEther(gasEstimate * gasPrice);
  }, [gasEstimate, gasPrice]);

  return {
    gasEstimate,
    gasPrice,
    isLoading: isGasEstimateLoading || isGasPriceLoading,
    totalGasCost, // in Eth
  };
};

export default useGetGasFees;
