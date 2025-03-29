import AutoPercentageSwitch from './switch-button';
import InfoButton from '@/components/tooltip';
import { Input } from '@/components/ui/input';

const TransactionSettings = () => {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <p className="text-sm font-medium">Max. slippage</p>
          <InfoButton content="Your transaction will revert if the price changes more than the slippage percentage." />
        </div>
        <AutoPercentageSwitch />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <p className="text-sm font-medium">Tx. deadline</p>
          <InfoButton content="Your transaction will revert if it is pending for more than this period of time. (Maximum: 3 days)." />
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
