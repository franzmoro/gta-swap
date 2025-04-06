import useGetGasFees from './use-estimate-swap-gas';
import { useTokenPriceFromPool } from './use-get-token-price';
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

  const { totalGasCost: networkFee } = useGetGasFees(swapAmounts, selectedTokens);

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
    swapAmounts[SwapMode.SELL].rawValue ?
      parseFloat(swapAmounts[SwapMode.BUY].displayValue) /
      parseFloat(swapAmounts[SwapMode.SELL].displayValue)
    : 0;

  const { tokenAPrice } = useTokenPriceFromPool(
    selectedTokens[SwapMode.SELL],
    selectedTokens[SwapMode.BUY]
  );

  const priceImpact = ((tokenAPrice - rate) / tokenAPrice) * 100;

  return {
    networkFee,
    priceImpact,
    rate,
    slippage,
    taxOnToken,
    tradeFee,
  };
};

export default useTradeInfo;
