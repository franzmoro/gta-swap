import CurrencyBox from '@/components/currency-box';
import SwapReviewModal from '@/components/swap-review-modal';
import TradeInfoSection from '@/components/trade-info';
import TransactionSettings from '@/components/transaction-settings';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ConnectWalletButton } from '@/components/wallet-provider';
import { tokens } from '@/constants/tokens';
import useSwapData from '@/hooks/use-swap-data';
import { useAllTokenBalance } from '@/hooks/use-token-balance';
import { useGetTokenUSDPrice } from '@/hooks/use-usd-price';
import useWeb3React from '@/hooks/use-web3-react';
import { formatNumberOrString, NumberType } from '@/lib/utils/format-number';
import { SelectedTokens, SwapAmounts, SwapMode } from '@/types';
import { ArrowUpDown, Settings } from 'lucide-react';
import { useState } from 'react';

const SwapHeader = () => {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-semibold">Swap</h2>
      <div className="flex items-center gap-2">
        <ConnectWalletButton />
        <Popover>
          <PopoverTrigger asChild>
            <Button size="icon" variant="ghost">
              <Settings className="h-5 w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-xs">
            <TransactionSettings />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

const SwapRateDisplay = ({
  selectedTokens,
  swapAmounts,
}: {
  selectedTokens: SelectedTokens;
  swapAmounts: SwapAmounts;
}) => {
  const [isRateInversed, setIsRateInversed] = useState<boolean>(false);

  const { tokenPriceInUSD: buyTokenPriceInUSD } = useGetTokenUSDPrice(selectedTokens[SwapMode.BUY]);
  const { tokenPriceInUSD: sellTokenPriceInUSD } = useGetTokenUSDPrice(
    selectedTokens[SwapMode.SELL]
  );

  const rate =
    swapAmounts[SwapMode.SELL].rawValue ?
      parseFloat(swapAmounts[SwapMode.BUY].displayValue) /
      parseFloat(swapAmounts[SwapMode.SELL].displayValue)
    : 0;

  const baseToken = isRateInversed ? selectedTokens[SwapMode.BUY] : selectedTokens[SwapMode.SELL];
  const quoteToken = isRateInversed ? selectedTokens[SwapMode.SELL] : selectedTokens[SwapMode.BUY];
  const displayRate = isRateInversed ? 1 / rate : rate;
  const rateUsdPrice = isRateInversed ? sellTokenPriceInUSD : buyTokenPriceInUSD;

  return (
    <Button className="p-0" onClick={() => setIsRateInversed((prev) => !prev)} variant="unstyled">
      <p className="text-sm text-primary/90">
        {`1 ${baseToken.symbol} = ${formatNumberOrString({
          input: displayRate,
          suffix: quoteToken.symbol,
          type: NumberType.SwapPrice,
        })}`}{' '}
        <span className="text-primary/55">
          (
          {formatNumberOrString({
            conversionRate: rateUsdPrice,
            input: displayRate,
            placeholder: '',
            type: NumberType.FiatTokenPrice,
          })}
          )
        </span>
      </p>
    </Button>
  );
};

const SwapSection = ({
  isBaseSelected,
  isConnected,
}: {
  isBaseSelected: boolean;
  isConnected: boolean;
}) => {
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);

  const {
    onClickMax,
    onSwitchToken,
    onTokenSelect,
    onUserInput,
    selectedTokens,
    swapActionButtonState,
    swapAmounts,
  } = useSwapData();

  const notAllowedBuyTokenForSelection =
    selectedTokens[SwapMode.SELL].isPlatformToken ?
      []
    : tokens.filter(
        (token) =>
          !token.isPlatformToken &&
          token.address.toLowerCase() !== selectedTokens[SwapMode.SELL].address.toLowerCase()
      );

  const notAllowedSellTokenForSelection =
    selectedTokens[SwapMode.BUY].isPlatformToken ?
      []
    : tokens.filter(
        (token) =>
          !token.isPlatformToken &&
          token.address.toLowerCase() !== selectedTokens[SwapMode.BUY].address.toLowerCase()
      );

  return (
    <>
      <div className="flex flex-col items-center gap-4">
        <CurrencyBox
          mode={SwapMode.SELL}
          notAllowedTokens={notAllowedSellTokenForSelection}
          onChange={(value) => {
            onUserInput(value, SwapMode.SELL);
          }}
          onClickMax={onClickMax}
          onSelectToken={onTokenSelect}
          selectedToken={selectedTokens[SwapMode.SELL]}
          value={swapAmounts.sell.displayValue}
        />
        <div className="relative flex w-full items-center justify-center">
          <div className="absolute h-px w-full bg-foreground/40"></div>
          <Button
            className="z-10 rounded-full border-4 border-card"
            onClick={onSwitchToken}
            size="icon"
            variant="secondary"
          >
            <ArrowUpDown className="h-5 w-5" />
          </Button>
        </div>
        <CurrencyBox
          mode={SwapMode.BUY}
          notAllowedTokens={notAllowedBuyTokenForSelection}
          onChange={(value) => {
            onUserInput(value, SwapMode.BUY);
          }}
          onSelectToken={onTokenSelect}
          selectedToken={selectedTokens[SwapMode.BUY]}
          value={swapAmounts.buy.displayValue}
        />
      </div>

      <div className="flex flex-col gap-4">
        {(!isConnected || !isBaseSelected) && !swapActionButtonState.isLoading ?
          <ConnectWalletButton size="lg" />
        : <Button
            className="w-full text-[20px] font-extrabold"
            disabled={swapActionButtonState.disabled}
            onClick={() => setIsReviewModalOpen(true)}
            size="lg"
          >
            {swapActionButtonState.label}
          </Button>
        }
      </div>

      {swapAmounts[SwapMode.SELL].rawValue && swapAmounts[SwapMode.BUY].rawValue ?
        <div className="-my-4">
          <Accordion className="w-full" collapsible type="single">
            <AccordionItem value="item-1">
              <div className="flex flex-row items-center justify-between gap-2">
                <SwapRateDisplay selectedTokens={selectedTokens} swapAmounts={swapAmounts} />
                <AccordionTrigger className="cursor-pointer" />
              </div>
              <AccordionContent>
                <TradeInfoSection selectedTokens={selectedTokens} swapAmounts={swapAmounts} />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      : null}

      {/* Review modal */}
      <SwapReviewModal
        isOpen={isReviewModalOpen}
        onOpenChange={setIsReviewModalOpen}
        selectedTokens={selectedTokens}
        swapAmounts={swapAmounts}
      />
    </>
  );
};

const SwapWidget = () => {
  const { isBaseSelected, isConnected } = useWeb3React();

  useAllTokenBalance();

  return (
    <div className="mt-12 flex w-full max-w-2xl flex-col items-center justify-center gap-12 px-4 pb-7">
      <h1 className="text-center text-5xl font-bold">GTA Swap</h1>
      <div className="flex w-full items-center justify-center">
        <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-6">
          {/* Card header */}
          <SwapHeader />

          {/* Card body */}
          <SwapSection isBaseSelected={isBaseSelected} isConnected={isConnected} />
        </div>
      </div>
    </div>
  );
};

export default SwapWidget;
