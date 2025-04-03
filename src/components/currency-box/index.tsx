import { Skeleton } from '../ui/skeleton';
import { TokenLogo } from '@/components/token-logo';
import TokenSelectModalContent from '@/components/token-select-modal';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogOverlay, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import useTokenBalance from '@/hooks/use-token-balance';
import { useGetTokenUSDPrice } from '@/hooks/use-usd-price';
import useWeb3React from '@/hooks/use-web3-react';
import { formatFiatPrice, NumberType } from '@/lib/utils/format-number';
import { formatNumberOrString } from '@/lib/utils/format-number';
import { SwapMode, Token } from '@/types';
import { ChevronDown } from 'lucide-react';
import { useMemo, useState } from 'react';

interface CurrencyBoxProps {
  mode: SwapMode;
  onChange: (value: string) => void;
  onClickMax?: () => void;
  onSelectToken: (token: Token, mode: SwapMode) => void;
  selectedToken: Token;
  value: string;
}

const CurrencyBox = ({
  mode,
  onChange,
  onClickMax,
  onSelectToken,
  selectedToken,
  value,
}: CurrencyBoxProps) => {
  const [open, setOpen] = useState<boolean>(false);
  const { isBaseSelected, isConnected } = useWeb3React();
  const { balance, isLoading } = useTokenBalance(selectedToken);

  const onTokenSelect = (token: Token) => {
    onSelectToken(token, mode);
    setOpen(false);
  };

  const { isLoading: isTokenPriceLoading, tokenPriceInUSD } = useGetTokenUSDPrice(selectedToken);

  const inputFiatValue = useMemo(() => {
    return formatFiatPrice({
      conversionRate: tokenPriceInUSD,
      price: value ? parseFloat(value) : 0,
    });
  }, [tokenPriceInUSD, value]);

  return (
    <div className="w-full rounded-lg bg-background p-4">
      <p className="mb-2 text-sm text-foreground/70 capitalize">{mode}</p>

      <div className="flex items-center justify-between gap-2">
        <div className="flex-1">
          <Input
            className="border-none bg-transparent p-0 !text-3xl font-semibold text-foreground shadow-none ring-0 ring-offset-0 outline-none hover:border-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
            inputMode="decimal"
            onChange={(e) => onChange(e.target.value)}
            pattern="^[0-9]*[.,]?[0-9]*$"
            placeholder="0"
            type="text"
            value={value}
          />
          {isTokenPriceLoading ?
            <Skeleton className="skeleton mt-2 h-3 w-[20px] rounded-sm" />
          : <p className="mt-1 text-sm text-foreground/50">{inputFiatValue}</p>}
        </div>

        <div className="flex flex-col items-end gap-2 self-baseline">
          <Dialog modal onOpenChange={setOpen} open={open}>
            <DialogOverlay />
            <DialogTrigger asChild>
              <Button
                className="flex items-center gap-0.5 rounded-full py-5"
                variant={selectedToken ? 'outline' : 'secondary'}
              >
                {selectedToken ?
                  <div className="flex items-center gap-2">
                    <TokenLogo size={30} tokenSrc={selectedToken.logo} />
                    <p className="text-base font-extrabold md:text-[20px]">
                      {selectedToken.symbol}
                    </p>
                  </div>
                : <p className="text-sm font-medium">Select Token</p>}
                <ChevronDown className="mt-1 size-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <TokenSelectModalContent onSelectToken={onTokenSelect} />
            </DialogContent>
          </Dialog>

          {(
            isConnected &&
            isBaseSelected &&
            selectedToken &&
            balance?.value &&
            balance.value > BigInt(0)
          ) ?
            <div className="flex w-full items-center justify-end">
              {isLoading ?
                <Skeleton className="skeleton h-3 w-[100px] rounded-sm" />
              : <>
                  <p className="text-sm text-foreground/70">
                    {formatNumberOrString({
                      input: balance?.displayValue,
                      suffix: selectedToken.symbol,
                      type: NumberType.TokenNonTx,
                    })}
                  </p>
                  {mode === SwapMode.SELL && (
                    <Button
                      className="mx-1 p-0 text-xs"
                      onClick={onClickMax}
                      size="sm"
                      variant="unstyled"
                    >
                      Max
                    </Button>
                  )}
                </>
              }
            </div>
          : null}
        </div>
      </div>
    </div>
  );
};

export default CurrencyBox;
