import { TokenFeeMath } from './token-fee-math';
import { SelectedTokens, SwapAmounts, SwapMode } from '@/types';

type FunctionName =
  | 'swapExactETHForTokensSupportingFeeOnTransferTokens'
  | 'swapExactTokensForETHSupportingFeeOnTransferTokens'
  | 'swapExactTokensForTokensSupportingFeeOnTransferTokens';

export const prepareSwapArgs = (
  swapAmounts: SwapAmounts,
  tokens: SelectedTokens,
  userAddress: string,
  slippage: number,
  transactionDeadline: number
) => {
  const [tokenIn, tokenOut] = [tokens[SwapMode.SELL], tokens[SwapMode.BUY]];
  const [amountIn, amountOutExpected] = [
    swapAmounts[SwapMode.SELL].rawValue,
    swapAmounts[SwapMode.BUY].rawValue,
  ];
  if (!amountIn || !amountOutExpected) throw new Error('Invalid / no user input');

  const isETHIn = !!tokenIn.isNative;
  const isETHOut = !!tokenOut.isNative;
  const functionName: FunctionName =
    isETHIn ? 'swapExactETHForTokensSupportingFeeOnTransferTokens'
    : isETHOut ? 'swapExactTokensForETHSupportingFeeOnTransferTokens'
    : 'swapExactTokensForTokensSupportingFeeOnTransferTokens';

  const amountOutMin = TokenFeeMath.getMinAmountReceived(amountOutExpected, slippage);

  const deadline = BigInt(Math.floor(Date.now() / 1000) + transactionDeadline * 60);

  const args = {
    amountIn,
    amountOutMin,
    deadline,
    isETHIn,
    path: [tokenIn.wrappedAddress, tokenOut.wrappedAddress],
    to: userAddress,
  };

  return {
    args,
    functionName,
  };
};
