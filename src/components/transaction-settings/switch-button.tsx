import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type React from 'react';
import { useState } from 'react';

interface AutoPercentageSwitchProps {
  className?: string;
  defaultValue?: number;
  onChange?: (value: { auto: boolean; percentage: number }) => void;
}

const AutoPercentageSwitch = ({
  className,
  defaultValue = 5.5,
  onChange,
}: AutoPercentageSwitchProps) => {
  const [isAuto, setIsAuto] = useState(true);
  const [percentage, setPercentage] = useState(defaultValue);

  const handleSwitchChange = (checked: boolean) => {
    setIsAuto(checked);
    onChange?.({ auto: checked, percentage });
  };

  const handlePercentageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseFloat(e.target.value);
    if (!isNaN(value)) {
      setPercentage(value);
      onChange?.({ auto: isAuto, percentage: value });
    }
  };

  return (
    <div className={cn('flex items-center rounded-full border p-1 shadow-sm', className)}>
      <div
        className={cn(
          'flex items-center justify-center rounded-full px-4 py-1 transition-colors',
          isAuto ? 'bg-primary text-primary-foreground' : 'bg-transparent text-foreground/50'
        )}
      >
        <button className="text-sm font-medium" onClick={() => handleSwitchChange(true)}>
          Auto
        </button>
      </div>
      <div
        className={cn(
          'flex items-center justify-center rounded-full px-2 py-0.5 transition-colors',
          !isAuto ? 'bg-primary text-primary-foreground' : 'bg-transparent text-foreground/50'
        )}
      >
        <Input
          className="h-auto w-8 border-none p-0 text-right focus-visible:ring-0 focus-visible:ring-offset-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          onChange={handlePercentageChange}
          onClick={() => handleSwitchChange(false)}
          type="number"
          value={percentage}
        />
        <span className="ml-0.5">%</span>
      </div>
    </div>
  );
};

export default AutoPercentageSwitch;
