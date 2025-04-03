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
import { tokens } from '@/constants/tokens';
import { ArrowDown } from 'lucide-react';

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
        <TradeInfoSection isReviewModal />

        <Button className="w-full text-lg" size="lg">
          Swap
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default SwapReviewModal;
