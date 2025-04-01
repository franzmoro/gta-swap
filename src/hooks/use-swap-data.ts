import useMaxBalance from './use-max-token-balance';
import useTokenBalance from './use-token-balance';
import { NATIVE_TOKEN } from '@/constants/tokens';
import { sanitizeNumber } from '@/lib/utils';
import { formatNumberOrString, NumberType } from '@/lib/utils/format-number';
import { SwapMode, Token } from '@/types';
import { useMemo, useState } from 'react';
import { formatEther } from 'viem/utils';

type SwapState = {
  [SwapMode.BUY]: {
    amount: string;
    token: null | Token;
  };
  [SwapMode.SELL]: {
    amount: string;
    token: null | Token;
  };
};

// TODO: implement chain static call
const getExactOutOnSwapInput = (amount: string) => {
  const sanitizedNumeric = parseFloat(sanitizeNumber(amount));
  if (!amount || !sanitizedNumeric) return undefined;
  return (sanitizedNumeric * 145.56).toString();
};

const getExactInOnSwapInput = (amount: string) => {
  const sanitizedNumeric = parseFloat(sanitizeNumber(amount));
  if (!amount || !sanitizedNumeric) return undefined;
  return (sanitizedNumeric / 145.56).toString();
};

const useSwapData = () => {
  const [swapUserInputState, setSwapUserInputState] = useState<SwapState>({
    [SwapMode.BUY]: {
      amount: '',
      token: null,
    },
    [SwapMode.SELL]: {
      amount: '',
      token: NATIVE_TOKEN,
    },
  });

  const [sellToken, buyToken] = [
    swapUserInputState[SwapMode.SELL].token,
    swapUserInputState[SwapMode.BUY].token,
  ];

  const { balance: sellTokenBalance } = useTokenBalance(sellToken);

  const maxUsableSellBalance = useMaxBalance(sellTokenBalance?.value, sellToken?.isNative);

  const [currentInputContext, setCurrentInputContext] = useState<SwapMode>(SwapMode.SELL);
  const [currentTokenSelectionContext, setCurrentTokenSelectionContext] = useState<SwapMode>(
    SwapMode.SELL
  );

  // Calculate the amount of tokens to swap everytime user input is changed or context is changed
  const [swapAmountIn, swapAmountOut] = useMemo(() => {
    if (currentInputContext === SwapMode.SELL) {
      const amountOut = getExactOutOnSwapInput(swapUserInputState[SwapMode.SELL].amount);
      return [
        swapUserInputState[SwapMode.SELL].amount,
        formatNumberOrString({
          input: buyToken ? amountOut : undefined,
          placeholder: '',
          type: NumberType.SwapTradeAmount,
        }),
      ];
    }

    const amountIn = getExactInOnSwapInput(swapUserInputState[SwapMode.BUY].amount);
    return [
      formatNumberOrString({
        input: sellToken ? amountIn : undefined,
        placeholder: '',
        type: NumberType.SwapTradeAmount,
      }),
      swapUserInputState[SwapMode.BUY].amount,
    ];
  }, [currentInputContext, buyToken, sellToken, swapUserInputState]);

  /** Actions */
  const onClickMax = () => {
    setSwapUserInputState((prev) => ({
      ...prev,
      [SwapMode.SELL]: {
        ...prev[SwapMode.SELL],
        amount: formatEther(maxUsableSellBalance ?? BigInt(0)),
      },
    }));
  };

  const onTokenSelect = (token: Token, mode: SwapMode) => {
    setCurrentTokenSelectionContext(mode);

    // Logic to avoid selecting the same token for buy and sell
    const [token0, token1] = [sellToken, buyToken];
    let updatedTokens: (null | Token)[] = [token0, token1];

    if (mode === SwapMode.SELL) {
      const newBuyToken =
        token.address.toLowerCase() === token1?.address.toLowerCase() ? token0 : token1;

      updatedTokens = [token, newBuyToken];
    } else {
      const newSellToken =
        token.address.toLowerCase() === token0?.address.toLowerCase() ? token1 : token0;
      updatedTokens = [newSellToken, token];
    }

    setSwapUserInputState((prev) => ({
      ...prev,
      [SwapMode.BUY]: {
        ...prev[SwapMode.BUY],
        token: updatedTokens[1],
      },
      [SwapMode.SELL]: {
        ...prev[SwapMode.SELL],
        token: updatedTokens[0],
      },
    }));
  };

  const onUserInput = (amount: string, mode: SwapMode) => {
    const sanitizedAmount = sanitizeNumber(amount);

    setCurrentInputContext(mode);
    setSwapUserInputState((prev) => ({
      ...prev,
      [mode]: { ...prev[mode], amount: sanitizedAmount },
    }));
  };

  const onSwitchToken = () => {
    setSwapUserInputState((prev) => ({
      ...prev,
      [SwapMode.BUY]: prev[SwapMode.SELL],
      [SwapMode.SELL]: prev[SwapMode.BUY],
    }));
    setCurrentInputContext((prev) => (prev === SwapMode.SELL ? SwapMode.BUY : SwapMode.SELL));
  };

  return {
    onClickMax,
    onSwitchToken,
    onTokenSelect,
    onUserInput,
    swapAmounts: {
      in: swapAmountIn,
      out: swapAmountOut,
    },
    swapState: swapUserInputState,
  };
};

export default useSwapData;
