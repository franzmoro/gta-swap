import { Input } from '@/components/ui/input';
import { AUTO_SLIPPAGE_VALUE } from '@/constants/config';
import useTransactionSettings from '@/hooks/use-transaction-settings';
import { cn, sanitizeNumber } from '@/lib/utils';
import { Slippage } from '@/types';
import { useEffect, useState } from 'react';

enum SlippageError {
  SLIPPAGE_EXCEEDED,
  SLIPPAGE_LOW,
}

interface AutoPercentageSwitchProps {
  className?: string;
  defaultValue?: number;
  onChange?: (value: { auto: boolean; percentage: number }) => void;
}

const SlippageSwitchButton = ({ className }: AutoPercentageSwitchProps) => {
  const { onUpdateSlippage, slippage } = useTransactionSettings();

  const [isCustomSlippage, setIsCustomSlippage] = useState<boolean>(false);

  const [localSlippage, setLocalSlippage] = useState<'' | number>(
    slippage === Slippage.AUTO || slippage === '' ? '' : slippage
  );
  const [, setSlippageError] = useState<null | SlippageError>(null);

  useEffect(() => {
    if (!slippage) {
      setLocalSlippage(AUTO_SLIPPAGE_VALUE);
      setIsCustomSlippage(false);
    } else {
      setLocalSlippage(slippage === Slippage.AUTO ? '' : slippage);
      setIsCustomSlippage(slippage !== Slippage.AUTO);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setIsCustomSlippage(slippage !== Slippage.AUTO);
  }, [slippage]);

  const onSwitchToggle = (switchTo: 'auto' | 'custom') => {
    if (switchTo === 'auto') {
      onUpdateSlippage(Slippage.AUTO);
      setIsCustomSlippage(false);
    } else setIsCustomSlippage(true);

    setLocalSlippage('');
  };

  const onChangeLocalSlippage = (value: string) => {
    setLocalSlippage(parseFloat(value));

    if (parseFloat(value) < 0) {
      setSlippageError(SlippageError.SLIPPAGE_LOW);
      return;
    }

    if (parseFloat(value) > AUTO_SLIPPAGE_VALUE) {
      setSlippageError(SlippageError.SLIPPAGE_EXCEEDED);
    }

    onUpdateSlippage(value);
    setSlippageError(null);
  };

  const handleSlippageChange = (value: string) => {
    // validate slippage
    const sanitizedValue = sanitizeNumber(value);

    const numericValue = parseFloat(sanitizedValue);

    if (Number.isNaN(numericValue)) {
      onChangeLocalSlippage('');
      return;
    }

    // shouldn't let slippage more than 100
    if (numericValue > 100) {
      return;
    }

    onChangeLocalSlippage(sanitizedValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === '-' || e.key === 'e') {
      e.preventDefault();
    }
  };

  const onBlur = () => {
    if (
      localSlippage === AUTO_SLIPPAGE_VALUE ||
      !localSlippage ||
      localSlippage === AUTO_SLIPPAGE_VALUE
    ) {
      setIsCustomSlippage(false);
      onUpdateSlippage(Slippage.AUTO);
    }
  };

  return (
    <div className={cn('flex items-center rounded-full border p-1 shadow-sm', className)}>
      <div
        className={cn(
          'flex items-center justify-center rounded-full px-4 py-1',
          !isCustomSlippage ?
            'bg-primary text-primary-foreground'
          : 'bg-transparent text-foreground/50'
        )}
      >
        <button
          className="cursor-pointer text-sm font-medium"
          onClick={() => onSwitchToggle('auto')}
        >
          Auto
        </button>
      </div>
      <div
        className={cn(
          'flex items-center justify-center rounded-full px-2 py-0.5',
          isCustomSlippage ?
            'bg-primary text-primary-foreground'
          : 'bg-transparent text-foreground/50'
        )}
      >
        <Input
          className="h-auto w-8 border-none p-0 text-right focus:placeholder:text-transparent focus-visible:ring-0 focus-visible:ring-offset-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          min="0"
          onBlur={onBlur}
          onChange={(e) => handleSlippageChange(e.target.value)}
          onClick={() => onSwitchToggle('custom')}
          onKeyDown={handleKeyDown}
          pattern="^[0-9]*[.,]?[0-9]*$"
          placeholder={AUTO_SLIPPAGE_VALUE.toString()}
          type="number"
          value={localSlippage}
        />
        <span className="ml-0.5">%</span>
      </div>
    </div>
  );
};

export default SlippageSwitchButton;
