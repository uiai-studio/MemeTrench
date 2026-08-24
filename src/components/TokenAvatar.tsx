import React, { useState, useEffect } from 'react';
import { getFallbackMemeLogo } from '../utils/tokenLogos';

interface TokenAvatarProps {
  src?: string;
  alt?: string;
  symbol?: string;
  name?: string;
  chain?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  ring?: boolean;
}

const SIZE_CLASSES = {
  xs: 'w-6 h-6 rounded-lg text-[9px]',
  sm: 'w-8 h-8 rounded-xl text-xs',
  md: 'w-11 h-11 rounded-xl text-sm',
  lg: 'w-12 h-12 rounded-2xl text-base',
  xl: 'w-16 h-16 rounded-2xl text-lg',
  '2xl': 'w-20 h-20 rounded-3xl text-xl'
};

export const TokenAvatar: React.FC<TokenAvatarProps> = ({
  src,
  alt = 'Token Logo',
  symbol = 'MEME',
  name,
  chain = 'bsc',
  size = 'md',
  className = '',
  ring = true
}) => {
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>(src || '');

  useEffect(() => {
    setHasError(false);
    setCurrentSrc(src || '');
  }, [src]);

  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;
  const fallbackSrc = getFallbackMemeLogo(symbol, chain);
  const displaySrc = (!currentSrc || hasError) ? fallbackSrc : currentSrc;

  return (
    <div
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden bg-neutral-900 ${sizeClass} ${
        ring ? 'ring-1 ring-neutral-800 shadow-sm' : ''
      } ${className}`}
    >
      <img
        src={displaySrc}
        alt={alt || name || symbol}
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => {
          if (!hasError) {
            setHasError(true);
          }
        }}
        className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
      />
    </div>
  );
};
