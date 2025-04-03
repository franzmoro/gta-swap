import { V2_ROUTER_02_ABI } from '@/abis/V2Router02';
import { V2_ROUTER_CONTRACT_ADDRESS } from '@/constants/address';
import { TokenFeeMath } from '@/lib/utils/token-fee-math';
import { SwapMode, Token } from '@/types';
import { useMemo } from 'react';
import { formatUnits, parseUnits } from 'viem';
import { useReadContract } from 'wagmi';

export enum TradeState {
  LOADING,
  INVALID,
  VALID,
  REEFETCHING,
}

type GetSwapQuoteProps = {
  amountIn: string;
  buyToken: Token;
  sellToken: Token;
  swapInputContext: SwapMode;
};

function calculateAmountWithTax(
  amount: bigint,
  isExactIn: boolean,
  isSellPlatformToken: boolean,
  isBuyPlatformToken: boolean
): bigint {
  /**
   * if(ExactIn)
   *    if sell token is platform token, get the amountOut for amountIn(platform token amount) - tax
   *    if buy token is platform token, get the amountOut(platform token amount) for amountIn and later subtract tax from the amountOut
   * else
   *    if buy token is platform token, get the amountIn for amountOut(platform token amount) + tax
   *    if sell token is platform token, get the amountIn(platform token amount) for amountOut and later add tax to the amountIn
   */
  if (isExactIn) {
    return isSellPlatformToken ? TokenFeeMath.getTokenAfterTax(amount) : amount;
  } else {
    return isBuyPlatformToken ? TokenFeeMath.getTokenWithTax(amount) : amount;
  }
}

function calculateFinalAmount(
  amount: bigint,
  isExactIn: boolean,
  isSellPlatformToken: boolean,
  isBuyPlatformToken: boolean
): bigint {
  if (isExactIn) {
    // ExactIn: adjust output amount if buying platform token
    return isBuyPlatformToken ? TokenFeeMath.getTokenAfterTax(amount) : amount;
  } else {
    // ExactOut: adjust input amount if selling platform token
    return isSellPlatformToken ? TokenFeeMath.getTokenWithTax(amount) : amount;
  }
}

const useGetSwapQuote = ({
  amountIn,
  buyToken,
  sellToken,
  swapInputContext,
}: GetSwapQuoteProps) => {
  /**
   * determine if users enter amount in sell token or buy token;
   * isExactIn = true if sell token, false if buy token
   */
  const isExactIn = swapInputContext === SwapMode.SELL;

  const amountInRaw =
    amountIn ? parseUnits(amountIn, isExactIn ? sellToken.decimals : buyToken.decimals) : 0n;

  const amountInRawWithTax = calculateAmountWithTax(
    amountInRaw,
    isExactIn,
    sellToken?.isPlatformToken ?? false,
    buyToken?.isPlatformToken ?? false
  );

  const functionName = isExactIn ? 'getAmountsOut' : 'getAmountsIn';
  const args = [
    amountInRawWithTax,
    [sellToken.wrappedAddress.toLowerCase(), buyToken.wrappedAddress.toLowerCase()],
  ] as const;

  const { data, error, isLoading, isRefetching } = useReadContract({
    abi: V2_ROUTER_02_ABI,
    address: V2_ROUTER_CONTRACT_ADDRESS,
    args,
    functionName,
    query: {
      enabled: !!amountInRaw,
      refetchInterval: 15 * 1000,
    },
  });

  return useMemo(() => {
    if (isLoading)
      return { amountOut: null, amountOutRaw: 0n, error: null, status: TradeState.LOADING };
    if (!amountInRaw)
      return { amountOut: null, amountOutRaw: 0n, error: null, status: TradeState.VALID };
    if (error || !data)
      return {
        amountOut: null,
        amountOutRaw: 0n,
        error: 'Insufficient reserves in pool',
        status: TradeState.INVALID,
      };

    const outputToken = isExactIn ? buyToken : sellToken;
    const amountOutRaw = isExactIn ? data[1] : data[0];
    const amountOut = calculateFinalAmount(
      amountOutRaw,
      isExactIn,
      sellToken?.isPlatformToken ?? false,
      buyToken?.isPlatformToken ?? false
    );

    return {
      amountOut: formatUnits(amountOut, outputToken.decimals),
      amountOutRaw: amountOut,
      error: null,
      status: isRefetching ? TradeState.REEFETCHING : TradeState.VALID,
    };
  }, [isRefetching, isLoading, amountInRaw, error, data, isExactIn, sellToken, buyToken]);
};

export default useGetSwapQuote;
