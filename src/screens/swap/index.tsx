import CurrencyBox from '@/components/currency-box';
import SwapReviewModal from '@/components/swap-review-modal';
import TradeInfoSection from '@/components/trade-info';
import TransactionSettings from '@/components/transaction-settings';
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
import { formatUnits } from 'viem';

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
    swapAmounts[SwapMode.SELL].rawValue && swapAmounts[SwapMode.SELL].rawValue ?
      parseFloat(
        formatUnits(swapAmounts[SwapMode.BUY].rawValue, selectedTokens[SwapMode.BUY].decimals)
      ) /
      parseFloat(
        formatUnits(swapAmounts[SwapMode.SELL].rawValue, selectedTokens[SwapMode.SELL].decimals)
      )
    : 0;

  const baseToken = isRateInversed ? selectedTokens[SwapMode.BUY] : selectedTokens[SwapMode.SELL];
  const quoteToken = isRateInversed ? selectedTokens[SwapMode.SELL] : selectedTokens[SwapMode.BUY];
  const displayRate = isRateInversed ? 1 / rate : rate;
  const rateUsdPrice = isRateInversed ? sellTokenPriceInUSD : buyTokenPriceInUSD;

  return (
    <Button className="p-0" onClick={() => setIsRateInversed((prev) => !prev)} variant="unstyled">
      <p className="text-xs text-primary/90 sm:text-sm">
        {`1 ${baseToken.symbol} = ${formatNumberOrString({
          input: displayRate,
          suffix: quoteToken.symbol,
          type: NumberType.TokenNonTx,
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
  const {
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
          disabled={isSwapPending}
          mode={SwapMode.SELL}
          notAllowedTokens={notAllowedSellTokenForSelection}
          onChange={(value) => {
            onUserInput(value, SwapMode.SELL);
          }}
          onClickMax={onClickMax}
          onSelectToken={onTokenSelect}
          selectedToken={selectedTokens[SwapMode.SELL]}
          swapAmount={swapAmounts[SwapMode.SELL]}
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
          disabled={isSwapPending}
          mode={SwapMode.BUY}
          notAllowedTokens={notAllowedBuyTokenForSelection}
          onChange={(value) => {
            onUserInput(value, SwapMode.BUY);
          }}
          onSelectToken={onTokenSelect}
          selectedToken={selectedTokens[SwapMode.BUY]}
          swapAmount={swapAmounts[SwapMode.BUY]}
        />
      </div>

      <div className="flex flex-col gap-4">
        {(!isConnected || !isBaseSelected) && !swapActionButtonState.isLoading ?
          <ConnectWalletButton size="lg" />
        : <Button
            className="w-full px-0 text-[18px] font-extrabold md:text-[20px]"
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
          <SwapRateDisplay selectedTokens={selectedTokens} swapAmounts={swapAmounts} />
          <TradeInfoSection selectedTokens={selectedTokens} swapAmounts={swapAmounts} />
        </div>
      : null}

      {/* Review modal */}
      <SwapReviewModal
        isOpen={isReviewModalOpen}
        onOpenChange={setIsReviewModalOpen}
        onSwap={swap}
        selectedTokens={selectedTokens}
        swapActionButtonState={swapActionButtonState}
        swapAmounts={swapAmounts}
      />
    </>
  );
};

const SwapWidget = () => {
  const { isBaseSelected, isConnected } = useWeb3React();

  useAllTokenBalance();

  return (
    <div className="flex w-full items-center justify-center">
      <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-6">
        {/* Card header */}
        <SwapHeader />

        {/* Card body */}
        <SwapSection isBaseSelected={isBaseSelected} isConnected={isConnected} />
      </div>
    </div>
  );
};

export default SwapWidget;
