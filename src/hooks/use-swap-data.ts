import useDebounce from './use-debounce';
import useGetSwapQuote, { TradeState } from './use-get-swap-quote';
import useMaxBalance from './use-max-token-balance';
import { useSwap } from './use-swap';
import useTokenBalance from './use-token-balance';
import { GOATAI_TOKEN, NATIVE_TOKEN } from '@/constants/tokens';
import { sanitizeNumber } from '@/lib/utils';
import { formatNumberOrString, formatWithCommas, NumberType } from '@/lib/utils/format-number';
import { SelectedTokens, SwapAmounts, SwapMode, Token } from '@/types';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import { formatUnits, parseUnits } from 'viem/utils';

const useSwapData = () => {
  const queryClient = useQueryClient();
  const [swapUserInputAmount, setSwapUserInputAmount] = useState<string>('');
  const [selectedTokens, setSelectedTokens] = useState<SelectedTokens>({
    [SwapMode.BUY]: GOATAI_TOKEN,
    [SwapMode.SELL]: NATIVE_TOKEN,
  });
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);

  const [sellToken, buyToken] = [selectedTokens[SwapMode.SELL], selectedTokens[SwapMode.BUY]];

  const { balance: sellTokenBalance, refetchEthBalance } = useTokenBalance(sellToken);

  const maxUsableSellBalance = useMaxBalance(sellTokenBalance?.value, sellToken.isNative);

  const [currentInputContext, setCurrentInputContext] = useState<SwapMode>(SwapMode.SELL);

  const refetchDataOnSuccess = useCallback(() => {
    setIsReviewModalOpen(false);
    setSwapUserInputAmount('');
    // refetch token balance
    queryClient.invalidateQueries({ queryKey: ['token-balance'] });
    // fetch eth balance
    refetchEthBalance();
    //  read contracts: getReserves
    queryClient.invalidateQueries({ queryKey: ['readContract', { functionName: 'getReserves' }] });
  }, [queryClient, refetchEthBalance]);

  const { isApprovePending, isSwapPending, swap } = useSwap(selectedTokens, refetchDataOnSuccess);

  const debouncedUserInput = useDebounce(swapUserInputAmount.toString(), 500);

  const { amountOut, amountOutRaw, error, status } = useGetSwapQuote({
    amountIn: debouncedUserInput,
    buyToken,
    sellToken,
    shouldRefetch: !isReviewModalOpen && !isSwapPending,
    swapInputContext: currentInputContext,
  });

  // Calculate the amount of tokens to swap everytime user input is changed or context is changed
  const swapAmounts: SwapAmounts = useMemo(() => {
    if (currentInputContext === SwapMode.SELL) {
      return {
        [SwapMode.BUY]: {
          displayValue: formatNumberOrString({
            input: amountOut ?? undefined,
            placeholder: '',
            type: NumberType.SwapTradeAmount,
          }),
          rawValue: amountOutRaw,
        },
        [SwapMode.SELL]: {
          displayValue: formatWithCommas(swapUserInputAmount),
          rawValue: parseUnits(swapUserInputAmount, sellToken.decimals),
        },
      };
    }

    return {
      [SwapMode.BUY]: {
        displayValue: formatWithCommas(swapUserInputAmount),
        rawValue: parseUnits(swapUserInputAmount, buyToken.decimals),
      },
      [SwapMode.SELL]: {
        displayValue: formatNumberOrString({
          input: amountOut ?? undefined,
          placeholder: '',
          type: NumberType.SwapTradeAmount,
        }),
        rawValue: amountOutRaw,
      },
    };
  }, [currentInputContext, swapUserInputAmount, amountOut, amountOutRaw, buyToken, sellToken]);

  /** Actions */
  const onClickMax = () => {
    setCurrentInputContext(SwapMode.SELL);
    setSwapUserInputAmount(
      formatUnits(maxUsableSellBalance ?? BigInt(0), selectedTokens[SwapMode.SELL].decimals)
    );
  };

  const onTokenSelect = (token: Token, mode: SwapMode) => {
    // Logic to avoid selecting the same token for buy and sell
    const [token0, token1] = [sellToken, buyToken];
    let updatedTokens: Token[] = [token0, token1];

    if (mode === SwapMode.SELL) {
      const newBuyToken =
        token.address.toLowerCase() === token1?.address.toLowerCase() ? token0 : token1;

      updatedTokens = [token, newBuyToken];
    } else {
      const newSellToken =
        token.address.toLowerCase() === token0?.address.toLowerCase() ? token1 : token0;
      updatedTokens = [newSellToken, token];
    }

    setSelectedTokens({
      [SwapMode.BUY]: updatedTokens[1],
      [SwapMode.SELL]: updatedTokens[0],
    });
  };

  const onUserInput = (amount: string, mode: SwapMode) => {
    const token = selectedTokens[mode];
    const sanitizedAmount = sanitizeNumber(amount, token.decimals);

    setCurrentInputContext(mode);
    setSwapUserInputAmount(sanitizedAmount);
  };

  const onSwitchToken = () => {
    setSelectedTokens({
      [SwapMode.BUY]: selectedTokens[SwapMode.SELL],
      [SwapMode.SELL]: selectedTokens[SwapMode.BUY],
    });
    setCurrentInputContext((prev) => (prev === SwapMode.SELL ? SwapMode.BUY : SwapMode.SELL));
  };

  /**
   * Swap action button state
   * 1. Loading
   * 2. Token is not selected
   * 3. Amount is not entered
   * 4. Amount is greater than balance
   */

  const swapActionButtonState = useMemo(() => {
    if (isApprovePending) {
      return {
        disabled: true,
        isLoading: true,
        label: 'Waiting for approval',
      };
    }
    if (isSwapPending)
      return {
        disabled: true,
        isLoading: true,
        label: `Swapping ${formatNumberOrString({ input: formatUnits(swapAmounts[SwapMode.SELL].rawValue, selectedTokens[SwapMode.SELL].decimals), type: NumberType.TokenNonTx })} ${selectedTokens[SwapMode.SELL].symbol} for ${formatNumberOrString({ input: formatUnits(swapAmounts[SwapMode.BUY].rawValue, selectedTokens[SwapMode.BUY].decimals), type: NumberType.TokenNonTx })}  ${selectedTokens[SwapMode.BUY].symbol}`,
      };
    if (status === TradeState.LOADING || status === TradeState.REEFETCHING)
      return {
        disabled: true,
        isLoading: true,
        label: 'Finalizing quote...',
      };
    if (status === TradeState.INVALID && error)
      return {
        disabled: true,
        isLoading: false,
        label: error,
      };
    if (!sellToken || !buyToken)
      return {
        disabled: true,
        isLoading: false,
        label: 'Select a token',
      };
    if (!swapAmounts[SwapMode.SELL].rawValue || !swapAmounts[SwapMode.BUY].rawValue)
      return {
        disabled: true,
        isLoading: false,
        label: 'Enter an amount',
      };
    if (swapAmounts[SwapMode.SELL].rawValue > (maxUsableSellBalance ?? BigInt(0)))
      return {
        disabled: true,
        isLoading: false,
        label: `Insufficient ${sellToken?.symbol}`,
      };
    return {
      disabled: false,
      isLoading: false,
      label: isReviewModalOpen ? 'Swap' : 'Review',
    };
  }, [
    isApprovePending,
    isSwapPending,
    swapAmounts,
    selectedTokens,
    status,
    error,
    sellToken,
    buyToken,
    maxUsableSellBalance,
    isReviewModalOpen,
  ]);

  return {
    isReviewModalOpen,
    isSwapPending,
    onClickMax,
    onSwitchToken,
    onTokenSelect,
    onUserInput,
    selectedTokens,
    setIsReviewModalOpen,
    swap,
    swapActionButtonState,
    swapAmounts,
  };
};

export default useSwapData;
