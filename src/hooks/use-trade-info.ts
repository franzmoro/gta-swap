import { slippageValueAtom } from '@/atom';
import { GOATAI_TOKEN } from '@/constants/tokens';
import { TokenFeeMath } from '@/lib/utils/token-fee-math';
import { SelectedTokens, SwapAmounts, SwapMode } from '@/types';
import { useAtomValue } from 'jotai';
import { formatUnits } from 'viem';

const useTradeInfo = ({
  selectedTokens,
  swapAmounts,
}: {
  selectedTokens: SelectedTokens;
  swapAmounts: SwapAmounts;
}) => {
  const slippage = useAtomValue(slippageValueAtom);

  const platformTokenAmount =
    selectedTokens[SwapMode.SELL].isPlatformToken ?
      swapAmounts[SwapMode.SELL].rawValue
    : swapAmounts[SwapMode.BUY].rawValue;
  const taxOnToken = formatUnits(
    TokenFeeMath.getTaxOnToken(platformTokenAmount, selectedTokens[SwapMode.SELL].isPlatformToken),
    GOATAI_TOKEN.decimals
  );

  const tradeFee = formatUnits(
    TokenFeeMath.calculateTradeFee(
      swapAmounts[SwapMode.SELL].rawValue,
      selectedTokens[SwapMode.SELL].isPlatformToken
    ),
    GOATAI_TOKEN.decimals
  );

  const rate =
    swapAmounts[SwapMode.BUY].rawValue ?
      parseFloat(swapAmounts[SwapMode.BUY].displayValue) /
      parseFloat(swapAmounts[SwapMode.SELL].displayValue)
    : 0;

  return {
    rate,
    slippage,
    taxOnToken,
    tradeFee,
  };
};

export default useTradeInfo;
