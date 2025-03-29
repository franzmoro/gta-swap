import { Button } from '../ui/button';

export const ConnectWalletButton = ({
  className,
  size = 'default',
}: {
  className?: string;
  size?: 'default' | 'lg' | 'sm';
}) => {
  return (
    <Button className={className} size={size} variant="outline">
      Connect Wallet
    </Button>
  );
};
