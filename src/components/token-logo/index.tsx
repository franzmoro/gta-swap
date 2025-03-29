import BaseLogo from '@/assets/images/base-network-logo.svg';
import FallbackLogo from '@/assets/images/fallback.png';

export interface TokenLogoProps {
  className?: string;
  size?: number;
  tokenSrc?: string;
}

export const TokenLogo = ({ className = '', size = 40, tokenSrc }: TokenLogoProps) => {
  return (
    <div className={`relative inline-flex ${className}`} style={{ width: size, height: size }}>
      <img
        alt="Token logo"
        className="h-full w-full rounded-full object-cover"
        height={size}
        src={tokenSrc || FallbackLogo}
        width={size}
      />
      <div className="absolute -right-1 bottom-0 flex h-[50%] w-[50%] items-center justify-center overflow-hidden rounded-full border-2 border-background bg-background">
        <img
          alt={`base network`}
          className="h-full w-full object-contain"
          height={size * 0.45}
          src={BaseLogo || FallbackLogo}
          width={size * 0.45}
        />
      </div>
    </div>
  );
};
