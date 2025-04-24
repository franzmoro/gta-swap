import useTransactionSettings from './use-transaction-settings';
import useWeb3React from './use-web3-react';
import { ERC20_ABI } from '@/abis/Erc20';
import { V2_ROUTER_02_ABI } from '@/abis/V2Router02';
import { V2_ROUTER_CONTRACT_ADDRESS } from '@/constants/address';
import { prepareSwapArgs } from '@/lib/utils/swap';
import { SelectedTokens, SwapAmounts, SwapMode } from '@/types';
import { useMemo } from 'react';
import { encodeFunctionData, formatEther } from 'viem';
import { useEstimateGas, useGasPrice, useReadContract } from 'wagmi';

const useGetGasFees = (swapAmounts: SwapAmounts, tokens: SelectedTokens) => {
  const { address, isBaseSelected, isConnected } = useWeb3React();
  const { slippageFormatted: slippage, transactionDeadline } = useTransactionSettings();

  const swapArgs = useMemo(() => {
    if (
      !address ||
      (!isConnected && !isBaseSelected) ||
      !swapAmounts[SwapMode.BUY].rawValue ||
      !swapAmounts[SwapMode.SELL].rawValue
    ) {
      return undefined;
    }
    try {
      return prepareSwapArgs(swapAmounts, tokens, address, slippage, transactionDeadline);
    } catch (error) {
      console.error('Failed to prepare swap args:', error);
      return undefined;
    }
  }, [address, isBaseSelected, isConnected, slippage, swapAmounts, tokens, transactionDeadline]);

  const { args, functionName } = swapArgs || {};

  // Check token allowance (only for non-native token input)
  const tokenIn = tokens[SwapMode.SELL];
  const amountIn = swapAmounts[SwapMode.SELL].rawValue;
  const { data: allowance, isLoading: isAllowanceLoading } = useReadContract({
    abi: ERC20_ABI,
    address: tokenIn.isNative ? undefined : tokenIn.wrappedAddress,
    args: !address ? undefined : [address, V2_ROUTER_CONTRACT_ADDRESS],
    functionName: 'allowance',
    query: {
      enabled: !!address && !tokenIn.isNative && !!amountIn && isConnected && isBaseSelected,
    },
  });

  const needsApproval = useMemo(() => {
    if (tokenIn.isNative || !amountIn || !allowance) return false;
    return allowance < amountIn;
  }, [tokenIn.isNative, amountIn, allowance]);

  // Encode swap transaction data
  const encodedSwapData = useMemo(() => {
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
  const { data: swapGasEstimate, isLoading: isSwapGasEstimateLoading } = useEstimateGas({
    account: address as `0x${string}`,
    data: encodedSwapData,
    query: {
      enabled: !!swapArgs && !!args && !!address && !!functionName,
    },
    to: V2_ROUTER_CONTRACT_ADDRESS,
    value: args?.isETHIn && args?.amountIn ? args.amountIn : undefined,
  });

  // Encode approval transaction data
  const encodedApprovalData = useMemo(() => {
    if (!needsApproval || !amountIn) return undefined;
    return encodeFunctionData({
      abi: ERC20_ABI,
      args: [V2_ROUTER_CONTRACT_ADDRESS, amountIn],
      functionName: 'approve',
    });
  }, [needsApproval, amountIn]);

  // Estimate gas for the approval transaction
  const { data: approvalGasEstimate, isLoading: isApprovalGasEstimateLoading } = useEstimateGas({
    account: address as `0x${string}`,
    data: encodedApprovalData,
    query: {
      enabled: needsApproval && !!address && !!encodedApprovalData,
    },
    to: tokenIn.isNative ? undefined : tokenIn.wrappedAddress,
  });

  // Fetch current gas price
  const { data: gasPrice, isLoading: isGasPriceLoading } = useGasPrice({
    query: {
      enabled: !!address && isBaseSelected && isConnected,
    },
  });

  // Calculate total gas cost
  const totalGasEstimate = useMemo(() => {
    return needsApproval && approvalGasEstimate ?
        (swapGasEstimate || 0n) + approvalGasEstimate
      : swapGasEstimate || 0n;
  }, [swapGasEstimate, approvalGasEstimate, needsApproval]);

  const totalGasCost = useMemo(() => {
    if (!totalGasEstimate || !gasPrice) return '0';
    return formatEther(totalGasEstimate * gasPrice);
  }, [totalGasEstimate, gasPrice]);

  return {
    approvalGasEstimate,
    gasEstimate: swapGasEstimate,
    gasPrice,
    isLoading:
      isSwapGasEstimateLoading ||
      isGasPriceLoading ||
      isAllowanceLoading ||
      isApprovalGasEstimateLoading,
    needsApproval,
    totalGasCost,
    totalGasEstimate,
  };
};

export default useGetGasFees;
