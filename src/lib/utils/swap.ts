import { TokenFeeMath } from './token-fee-math';
import { USDC_ERC20_CONTRACT_ADDRESS } from '@/constants/address';
import { NATIVE_TOKEN } from '@/constants/tokens';
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

  const path =
    (
      tokenIn.wrappedAddress === USDC_ERC20_CONTRACT_ADDRESS ||
      tokenOut.address === USDC_ERC20_CONTRACT_ADDRESS
    ) ?
      [
        tokenIn.wrappedAddress.toLowerCase(),
        NATIVE_TOKEN.wrappedAddress,
        tokenOut.wrappedAddress.toLowerCase(),
      ]
    : [tokenIn.wrappedAddress.toLowerCase(), tokenOut.wrappedAddress.toLowerCase()];

  const args = {
    amountIn,
    amountOutMin,
    deadline,
    isETHIn,
    path,
    to: userAddress,
  };

  return {
    args,
    functionName,
  };
};
