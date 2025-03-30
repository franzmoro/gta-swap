import SlippageSwitchButton from './slippage-switch-button';
import InfoButton from '@/components/tooltip';
import { Input } from '@/components/ui/input';
import { DEFAULT_TRANSACTION_DEADLINE, MAX_TRANSACTION_DEADLINE } from '@/constants/config';
import useTransactionSettings from '@/hooks/use-transaction-settings';
import { sanitizeNumber } from '@/lib/utils';

const TransactionSettings = () => {
  const { onUpdateTransactionDeadline, transactionDeadline } = useTransactionSettings();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === '-' || e.key === 'e') {
      e.preventDefault();
    }
  };

  const handleTransactionDeadlineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedValue = sanitizeNumber(e.target.value);
    const numericValue = parseFloat(sanitizedValue);

    // shouldn't let deadline more than 3 days (max value)
    if (numericValue > MAX_TRANSACTION_DEADLINE) {
      onUpdateTransactionDeadline(MAX_TRANSACTION_DEADLINE);
      return;
    }
    onUpdateTransactionDeadline(numericValue);
  };

  const onBlur = () => {
    if (Number.isNaN(transactionDeadline)) {
      onUpdateTransactionDeadline(DEFAULT_TRANSACTION_DEADLINE);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <p className="text-sm font-medium">Max. slippage</p>
          <InfoButton content="Your transaction will revert if the price changes more than the slippage percentage." />
        </div>
        <SlippageSwitchButton />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <p className="text-sm font-medium">Tx. deadline</p>
          <InfoButton content="Your transaction will revert if it is pending for more than this period of time. (Maximum: 3 days)." />
        </div>
        <div className={'flex items-center justify-center rounded-full border px-3 py-1.5'}>
          <Input
            className="h-auto w-10 border-none p-0 text-right focus-visible:ring-0 focus-visible:ring-offset-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            max="4320"
            min="0"
            onBlur={onBlur}
            onChange={handleTransactionDeadlineChange}
            onKeyDown={handleKeyDown}
            type="number"
            value={transactionDeadline}
          />
          <span className="ml-2 text-sm text-foreground/50">minutes</span>
        </div>
      </div>
    </div>
  );
};

export default TransactionSettings;
