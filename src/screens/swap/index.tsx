import CurrencyBox from '@/components/currency-box';
import TransactionSettings from '@/components/transaction-settings';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ConnectWalletButton } from '@/components/wallet-provider';
import { tokens } from '@/constants/tokens';
import { SwapMode, Token } from '@/types';
import { ArrowUpDown, Settings } from 'lucide-react';
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

const Swap = () => {
  // TODO: This is temporary. Move to context once integration starts
  const [swapState, setSwapState] = useState<SwapState>({
    [SwapMode.BUY]: {
      amount: '',
      token: tokens[0],
    },
    [SwapMode.SELL]: {
      amount: '',
      token: null,
    },
  });
  const onTokenSelect = (token: Token, mode: SwapMode) => {
    setSwapState((prev) => ({
      ...prev,
      [mode]: {
        ...prev[mode],
        token,
      },
    }));
  };

  return (
    <div className="mt-12 flex w-full max-w-2xl flex-col items-center justify-center gap-12">
      <h1 className="text-center text-5xl font-bold">GTA Swap</h1>
      <div className="flex w-full items-center justify-center">
        <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-6">
          {/* Card header */}
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

          {/* Card body */}

          <div className="flex flex-col items-center gap-4">
            <CurrencyBox
              mode={SwapMode.SELL}
              onChange={(value) => {
                setSwapState((prev) => ({
                  ...prev,
                  [SwapMode.SELL]: { ...prev[SwapMode.SELL], amount: value },
                }));
              }}
              onSelectToken={onTokenSelect}
              selectedToken={swapState[SwapMode.SELL].token}
              value={swapState[SwapMode.SELL].amount}
            />
            <div className="relative flex w-full items-center justify-center">
              <div className="absolute h-px w-full bg-foreground/40"></div>
              <Button
                className="z-10 rounded-full border-4 border-card"
                size="icon"
                variant="secondary"
              >
                <ArrowUpDown className="h-5 w-5" />
              </Button>
            </div>
            <CurrencyBox
              mode={SwapMode.BUY}
              onChange={(value) => {
                setSwapState((prev) => ({
                  ...prev,
                  [SwapMode.BUY]: { ...prev[SwapMode.BUY], amount: value },
                }));
              }}
              onSelectToken={onTokenSelect}
              selectedToken={swapState[SwapMode.BUY].token}
              value={swapState[SwapMode.BUY].amount}
            />
          </div>

          {/* Footer */}
          <div className="flex flex-col gap-4">
            {/* <ConnectWalletButton className="w-full" size="lg" /> */}
            <Button className="w-full text-lg" size="lg">
              Review
            </Button>
          </div>

          {/* <Button className="w-full">Lime Green Button</Button> */}
        </div>
      </div>
    </div>
  );
};

export default Swap;
