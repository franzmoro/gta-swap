import AutoPercentageSwitch from './switch-button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

const TransactionSettings = () => {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <p className="text-sm font-medium">Max. slippage</p>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 fill-foreground text-primary-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs border" side="bottom" sideOffset={10}>
                Your transaction will revert if the price changes more than the slippage percentage.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <AutoPercentageSwitch />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <p className="text-sm font-medium">Tx. deadline</p>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 fill-foreground text-primary-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs border" side="bottom" sideOffset={10}>
                Your transaction will revert if it is pending for more than this period of time.
                (Maximum: 3 days).
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className={'flex items-center justify-center rounded-full border px-3 py-1.5'}>
          <Input
            className="h-auto w-8 border-none p-0 text-right focus-visible:ring-0 focus-visible:ring-offset-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            // onChange={handlePercentageChange}
            type="number"
            value={30}
          />
          <span className="ml-2 text-sm text-foreground/50">minutes</span>
        </div>
      </div>
    </div>
  );
};

export default TransactionSettings;
