import { NATIVE_TOKEN } from '@/constants/tokens';
import { SwapMode, Token } from '@/types';
import { useState } from 'react';

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

const useSwapData = () => {
  const [swapState, setSwapState] = useState<SwapState>({
    [SwapMode.BUY]: {
      amount: '',
      token: null,
    },
    [SwapMode.SELL]: {
      amount: '',
      token: NATIVE_TOKEN,
    },
  });

  const [currentInputContext, setCurrentInputContext] = useState<SwapMode>(SwapMode.SELL);

  const onTokenSelect = (token: Token, mode: SwapMode) => {
    setCurrentInputContext(mode);

    const [token0, token1] = [swapState[SwapMode.SELL].token, swapState[SwapMode.BUY].token];
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

    setSwapState((prev) => ({
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

  const onAmountChange = (amount: string, mode: SwapMode) => {
    setCurrentInputContext(mode);
    setSwapState((prev) => ({
      ...prev,
      [mode]: { ...prev[mode], amount },
    }));
  };

  const onSwitchToken = () => {
    setSwapState((prev) => ({
      ...prev,
      [SwapMode.BUY]: prev[SwapMode.SELL],
      [SwapMode.SELL]: prev[SwapMode.BUY],
    }));
  };

  return {
    onAmountChange,
    onSwitchToken,
    onTokenSelect,
    swapState,
  };
};

export default useSwapData;
