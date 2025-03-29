import InfoButton from '../tooltip';
import { TokenLogo } from '@/components/token-logo';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
} from '@/components/ui/dialog';
import { tokens } from '@/constants/tokens';
import { ArrowDown } from 'lucide-react';

const TransactionInfo = ({
  label,
  tooltipContent,
  value,
}: {
  label: string;
  tooltipContent?: string;
  value: string;
}) => {
  return (
    <div className="flex justify-between">
      <div className="flex items-center gap-1">
        <p className="text-sm text-foreground/60">{label}</p>
        {tooltipContent && <InfoButton content={tooltipContent} />}
      </div>
      <p className="text-sm text-foreground/80">{value}</p>
    </div>
  );
};

const SwapReviewModal = ({
  isOpen,
  onOpenChange,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
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
              <p className="text-2xl text-foreground">12.0 USDC</p>
              <p className="text-sm text-foreground/60">$12.00</p>
            </div>
            <TokenLogo tokenSrc={tokens[2].logo} />
          </div>
          <ArrowDown className="size-6 text-foreground/80" />
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-2">
              <p className="text-2xl text-foreground">0.00629 ETH</p>
              <p className="text-sm text-foreground/60">$11.71</p>
            </div>
            <TokenLogo tokenSrc={tokens[0].logo} />
          </div>
        </div>

        <hr className="my-4" />
        <div className="flex flex-col gap-3">
          <TransactionInfo
            label="Tax (10 %)"
            tooltipContent="Your transaction will revert if the price changes more than the slippage percentage."
            value="1 USDC"
          />
          <TransactionInfo
            label="Network cost"
            tooltipContent="This is the cost of the transaction on the network."
            value="0.001 ETH"
          />
          <TransactionInfo label="Rate" value="1 ETH = 1901.62 USDT ($1,851.02)" />
          <TransactionInfo
            label="Max. slippage"
            tooltipContent="Your transaction will revert if the price slips more than the slippage percentage."
            value="10%"
          />
          <TransactionInfo
            label="Price impact"
            tooltipContent="The impact your trade has on the market price of this pool"
            value="0.05%"
          />
        </div>

        <Button className="w-full text-lg" size="lg">
          Swap
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default SwapReviewModal;
