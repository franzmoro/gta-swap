import { TokenLogo } from '@/components/token-logo';
import TokenSelectModalContent from '@/components/token-select-modal';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { SwapMode, Token } from '@/types';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface CurrencyBoxProps {
  mode: SwapMode;
  onChange: (value: string) => void;
  onSelectToken: (token: Token, mode: SwapMode) => void;
  selectedToken: null | Token;
  value: string;
}

const CurrencyBox = ({ mode, onChange, onSelectToken, selectedToken, value }: CurrencyBoxProps) => {
  const [open, setOpen] = useState<boolean>(false);

  const onTokenSelect = (token: Token) => {
    onSelectToken(token, mode);
    setOpen(false);
  };

  return (
    <div className="w-115 rounded-lg bg-background p-4">
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
          <p className="mt-1 text-sm text-foreground/50">$0</p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <Dialog modal onOpenChange={setOpen} open={open}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-0.5 rounded-full bg-primary hover:bg-primary/75">
                {selectedToken ?
                  <div className="flex items-center gap-2">
                    <TokenLogo size={28} tokenSrc={selectedToken.logo} />
                    <p className="text-lg">{selectedToken.symbol}</p>
                  </div>
                : <p className="text-base font-medium">Select Token</p>}
                <ChevronDown className="mt-1 size-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <TokenSelectModalContent onSelectToken={onTokenSelect} />
            </DialogContent>
          </Dialog>

          <div className="gap flex items-center">
            <p className="text-sm text-foreground/70">0.007 ETH</p>
            <Button onClick={() => {}} size="sm" variant="unstyled">
              Max
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrencyBox;
