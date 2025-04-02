import CurrencyBox from '@/components/currency-box';
import SwapReviewModal from '@/components/swap-review-modal';
import TransactionSettings from '@/components/transaction-settings';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ConnectWalletButton } from '@/components/wallet-provider';
import { tokens } from '@/constants/tokens';
import useSwapData from '@/hooks/use-swap-data';
import { useAllTokenBalance } from '@/hooks/use-token-balance';
import { useGetTokenUSDPrice } from '@/hooks/use-usd-price';
import useWeb3React from '@/hooks/use-web3-react';
import { SwapMode } from '@/types';
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

const SwapSection = ({
  isBaseSelected,
  isConnected,
  setIsReviewModalOpen,
}: {
  isBaseSelected: boolean;
  isConnected: boolean;
  setIsReviewModalOpen: (open: boolean) => void;
}) => {
  const {
    onClickMax,
    onSwitchToken,
    onTokenSelect,
    onUserInput,
    swapActionButtonState,
    swapAmounts,
    swapState,
  } = useSwapData();

  useGetTokenUSDPrice(tokens[0]);

  return (
    <>
      <div className="flex flex-col items-center gap-4">
        <CurrencyBox
          mode={SwapMode.SELL}
          onChange={(value) => {
            onUserInput(value, SwapMode.SELL);
          }}
          onClickMax={onClickMax}
          onSelectToken={onTokenSelect}
          selectedToken={swapState[SwapMode.SELL].token}
          value={swapAmounts.in}
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
          onChange={(value) => {
            onUserInput(value, SwapMode.BUY);
          }}
          onSelectToken={onTokenSelect}
          selectedToken={swapState[SwapMode.BUY].token}
          value={swapAmounts.out}
        />
      </div>

      <div className="flex flex-col gap-4">
        {!isConnected || !isBaseSelected ?
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
    </>
  );
};

const SwapWidget = () => {
  const { isBaseSelected, isConnected } = useWeb3React();

  useAllTokenBalance();

  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);

  return (
    <div className="mt-12 flex w-full max-w-2xl flex-col items-center justify-center gap-12 px-4">
      <h1 className="text-center text-5xl font-bold">GTA Swap</h1>
      <div className="flex w-full items-center justify-center">
        <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-6">
          {/* Card header */}
          <SwapHeader />

          {/* Card body */}
          <SwapSection
            isBaseSelected={isBaseSelected}
            isConnected={isConnected}
            setIsReviewModalOpen={setIsReviewModalOpen}
          />
        </div>
      </div>

      {/* Review modal */}
      <SwapReviewModal isOpen={isReviewModalOpen} onOpenChange={setIsReviewModalOpen} />
    </div>
  );
};

export default SwapWidget;
