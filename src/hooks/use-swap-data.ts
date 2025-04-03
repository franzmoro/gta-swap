import useGetSwapQuote, { TradeState } from './use-get-swap-quote';
import useMaxBalance from './use-max-token-balance';
import useTokenBalance from './use-token-balance';
import { GOATAI_TOKEN, NATIVE_TOKEN } from '@/constants/tokens';
import { sanitizeNumber } from '@/lib/utils';
import { formatNumberOrString, NumberType } from '@/lib/utils/format-number';
import { SelectedTokens, SwapAmounts, SwapMode, Token } from '@/types';
import { useMemo, useState } from 'react';
import { formatEther, parseUnits } from 'viem/utils';

const useSwapData = () => {
  const [swapUserInputAmount, setSwapUserInputAmount] = useState<string>('');
  const [selectedTokens, setSelectedTokens] = useState<SelectedTokens>({
    [SwapMode.BUY]: NATIVE_TOKEN,
    [SwapMode.SELL]: GOATAI_TOKEN,
  });

  const [sellToken, buyToken] = [selectedTokens[SwapMode.SELL], selectedTokens[SwapMode.BUY]];

  const { balance: sellTokenBalance } = useTokenBalance(sellToken);

  const maxUsableSellBalance = useMaxBalance(sellTokenBalance?.value, sellToken.isNative);

  const [currentInputContext, setCurrentInputContext] = useState<SwapMode>(SwapMode.SELL);

  const { amountOut, amountOutRaw, error, status } = useGetSwapQuote({
    amountIn: swapUserInputAmount,
    buyToken,
    sellToken,
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
          displayValue: swapUserInputAmount,
          rawValue: parseUnits(swapUserInputAmount, sellToken.decimals),
        },
      };
    }

    return {
      [SwapMode.BUY]: {
        displayValue: swapUserInputAmount,
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
    setSwapUserInputAmount(formatEther(maxUsableSellBalance ?? BigInt(0)));
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
      label: 'Review',
    };
  }, [status, error, sellToken, buyToken, swapAmounts, maxUsableSellBalance]);

  return {
    onClickMax,
    onSwitchToken,
    onTokenSelect,
    onUserInput,
    selectedTokens,
    swapActionButtonState,
    swapAmounts,
  };
};

export default useSwapData;
