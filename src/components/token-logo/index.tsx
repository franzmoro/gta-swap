import BaseLogo from '@/assets/images/base-network-logo.svg';
import FallbackLogo from '@/assets/images/fallback.png';
import { mapSizeToTailwindClass } from '@/lib/utils';

export interface TokenLogoProps {
  className?: string;
  size?: number | SizeOption;
  tokenSrc?: string;
}

type SizeOption = { default: number; md?: number; sm?: number } | number;

const getSizeClass = (size: SizeOption = 40): string => {
  if (typeof size === 'number') {
    return mapSizeToTailwindClass(size);
  }

  const { default: defaultSize, md, sm } = size;
  let classes = mapSizeToTailwindClass(defaultSize);

  if (sm) classes += ` ${mapSizeToTailwindClass(sm, 'sm')}`;
  if (md) classes += ` ${mapSizeToTailwindClass(md, 'md')}`;

  return classes;
};

export const TokenLogo = ({ className = '', size = 40, tokenSrc }: TokenLogoProps) => {
  const sizeClass = getSizeClass(size);
  return (
    <div className={`relative ${className} ${sizeClass}`}>
      <img alt="Token logo" className="rounded-full object-cover" src={tokenSrc || FallbackLogo} />
      <div className="absolute -right-2 -bottom-0.5 flex h-[55%] w-[55%] items-center justify-center overflow-hidden rounded-full border-2 border-background bg-background">
        <img alt={`base network`} className="object-contain" src={BaseLogo || FallbackLogo} />
      </div>
    </div>
  );
};
