import { TokenLogo } from '@/components/token-logo';
import TradeInfoSection from '@/components/trade-info';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
} from '@/components/ui/dialog';
import { useGetTokenUSDPrice } from '@/hooks/use-usd-price';
import { formatNumberOrString, NumberType } from '@/lib/utils/format-number';
import { SelectedTokens, SwapAmounts, SwapMode } from '@/types';
import { ArrowDown, Loader2 } from 'lucide-react';
import { formatUnits } from 'viem';

const SwapReviewModal = ({
  isOpen,
  onOpenChange,
  onSwap,
  selectedTokens,
  swapActionButtonState,
  swapAmounts,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSwap: (amounts: SwapAmounts) => void;
  selectedTokens: SelectedTokens;
  swapActionButtonState: {
    disabled: boolean;
    isLoading: boolean;
    label: string;
  };
  swapAmounts: SwapAmounts;
}) => {
  const { tokenPriceInUSD: sellTokenUSDPrice } = useGetTokenUSDPrice(selectedTokens[SwapMode.SELL]);
  const { tokenPriceInUSD: buyTokenUSDPrice } = useGetTokenUSDPrice(selectedTokens[SwapMode.BUY]);

  return (
    <Dialog modal onOpenChange={onOpenChange} open={isOpen}>
      <DialogOverlay />
      <DialogContent className="w-115">
        <DialogHeader>
          <DialogTitle>You’re swapping</DialogTitle>
        </DialogHeader>

        <div className="mt-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-2">
              <p className="text-xl text-foreground md:text-2xl">
                {formatNumberOrString({
                  input: formatUnits(
                    swapAmounts[SwapMode.SELL].rawValue,
                    selectedTokens[SwapMode.SELL].decimals
                  ),
                  suffix: selectedTokens[SwapMode.SELL].symbol,
                  type: NumberType.TokenTx,
                })}
              </p>
              <p className="text-sm text-foreground/60">
                {formatNumberOrString({
                  conversionRate: sellTokenUSDPrice,
                  input: formatUnits(
                    swapAmounts[SwapMode.SELL].rawValue,
                    selectedTokens[SwapMode.SELL].decimals
                  ),
                  type: NumberType.FiatTokenPrice,
                })}
              </p>
            </div>
            <TokenLogo tokenSrc={selectedTokens[SwapMode.SELL].logo} />
          </div>
          <ArrowDown className="size-6 text-foreground/80" />
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-2">
              <p className="text-xl text-foreground md:text-2xl">
                {' '}
                {formatNumberOrString({
                  input: formatUnits(
                    swapAmounts[SwapMode.BUY].rawValue,
                    selectedTokens[SwapMode.BUY].decimals
                  ),
                  suffix: selectedTokens[SwapMode.BUY].symbol,
                  type: NumberType.TokenTx,
                })}
              </p>
              <p className="text-sm text-foreground/60">
                {formatNumberOrString({
                  conversionRate: buyTokenUSDPrice,
                  input: formatUnits(
                    swapAmounts[SwapMode.BUY].rawValue,
                    selectedTokens[SwapMode.BUY].decimals
                  ),
                  type: NumberType.FiatTokenPrice,
                })}
              </p>
            </div>
            <TokenLogo tokenSrc={selectedTokens[SwapMode.BUY].logo} />
          </div>
        </div>

        <hr className="my-4" />
        <TradeInfoSection isReviewModal selectedTokens={selectedTokens} swapAmounts={swapAmounts} />

        <Button
          className="w-full text-lg"
          disabled={swapActionButtonState.isLoading}
          onClick={() => onSwap(swapAmounts)}
          size="lg"
        >
          {swapActionButtonState.isLoading ?
            <>
              <Loader2 className="size-xl animate-spin" />
              <span className="md:hidden">Swapping</span>
              <span className="hidden md:inline">{swapActionButtonState.label}</span>
            </>
          : 'Swap'}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default SwapReviewModal;
