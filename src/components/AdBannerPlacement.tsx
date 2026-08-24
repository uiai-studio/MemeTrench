import React, { useState, useEffect } from 'react';
import { AdBanner, AdPlacementType, SupportedChainId } from '../types';
import { SUPPORTED_CHAINS } from '../data/chainConfig';
import { 
  Megaphone, 
  ExternalLink, 
  Sparkles, 
  TrendingUp, 
  ChevronRight, 
  ShieldCheck, 
  Flame,
  X
} from 'lucide-react';

interface AdBannerPlacementProps {
  placement: AdPlacementType;
  banners: AdBanner[];
  onOpenAdAuctionModal: () => void;
  onSelectTokenByMint?: (mint: string) => void;
  className?: string;
}

export const AdBannerPlacement: React.FC<AdBannerPlacementProps> = ({
  placement,
  banners,
  onOpenAdAuctionModal,
  onSelectTokenByMint,
  className = ''
}) => {
  const matchingBanners = banners.filter(b => b.placement === placement && b.isActive);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  // Rotate ads every 8 seconds if multiple exist
  useEffect(() => {
    if (matchingBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % matchingBanners.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [matchingBanners.length]);

  if (dismissed) return null;

  const currentAd = matchingBanners[currentIndex] || {
    id: 'default-fallback',
    placement,
    title: '📢 PROMOTE YOUR TOKEN TO 250,000+ TRADERS',
    tagline: 'Instant self-serve sponsored banner placement with automated protocol buyback & burn revenue split.',
    ctaText: 'Buy Ad Spot',
    ctaLink: '#',
    sponsorName: 'Omniguard Ads',
    sponsorBadge: 'Sponsor Spot',
    chain: 'bsc' as SupportedChainId,
    bidAmountNative: 0.8,
    impressionsCount: 54000,
    clicksCount: 1200,
    expiresAt: Date.now() + 86400000 * 7,
    isActive: true,
    themeColor: 'amber'
  };

  const chain = SUPPORTED_CHAINS[currentAd.chain] || SUPPORTED_CHAINS['bsc'];

  const getThemeClasses = (color: string) => {
    switch (color) {
      case 'emerald':
        return {
          border: 'border-emerald-500/40 hover:border-emerald-500/60',
          bg: 'bg-gradient-to-r from-emerald-950/40 via-neutral-950 to-neutral-950',
          badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
          btn: 'bg-emerald-500 hover:bg-emerald-400 text-neutral-950 shadow-emerald-500/20',
          accent: 'text-emerald-400'
        };
      case 'purple':
        return {
          border: 'border-purple-500/40 hover:border-purple-500/60',
          bg: 'bg-gradient-to-r from-purple-950/40 via-neutral-950 to-neutral-950',
          badge: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
          btn: 'bg-purple-500 hover:bg-purple-400 text-white shadow-purple-500/20',
          accent: 'text-purple-400'
        };
      case 'cyan':
        return {
          border: 'border-cyan-500/40 hover:border-cyan-500/60',
          bg: 'bg-gradient-to-r from-cyan-950/40 via-neutral-950 to-neutral-950',
          badge: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
          btn: 'bg-cyan-500 hover:bg-cyan-400 text-neutral-950 shadow-cyan-500/20',
          accent: 'text-cyan-400'
        };
      case 'amber':
      default:
        return {
          border: 'border-amber-500/40 hover:border-amber-500/60',
          bg: 'bg-gradient-to-r from-amber-950/40 via-neutral-950 to-neutral-950',
          badge: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
          btn: 'bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-amber-500/20',
          accent: 'text-amber-400'
        };
    }
  };

  const theme = getThemeClasses(currentAd.themeColor);

  const handleClick = (e: React.MouseEvent) => {
    if (currentAd.tokenMint && onSelectTokenByMint) {
      e.preventDefault();
      onSelectTokenByMint(currentAd.tokenMint);
    } else if (currentAd.ctaLink === '#' || currentAd.id === 'default-fallback') {
      e.preventDefault();
      onOpenAdAuctionModal();
    }
  };

  // 1. TOP TICKER BANNER
  if (placement === 'top_ticker_banner') {
    return (
      <div className={`w-full border-y ${theme.border} ${theme.bg} py-1.5 px-4 text-xs transition-all relative overflow-hidden ${className}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border ${theme.badge} uppercase`}>
                {currentAd.sponsorBadge || 'Sponsored'}
              </span>
              <span className="text-[11px] font-mono text-neutral-400 hidden md:inline">
                ({chain.name})
              </span>
            </div>

            <div className="flex items-center gap-2 truncate">
              <span className="font-bold text-white tracking-wide shrink-0">
                {currentAd.title}
              </span>
              <span className="text-neutral-400 hidden sm:inline truncate text-[11px]">
                — {currentAd.tagline}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {currentAd.tokenMint ? (
              <button
                onClick={handleClick}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 shadow-sm ${theme.btn}`}
              >
                <span>{currentAd.ctaText}</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            ) : currentAd.ctaLink && currentAd.ctaLink !== '#' ? (
              <a
                href={currentAd.ctaLink}
                target="_blank"
                rel="noreferrer"
                className={`px-3 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 shadow-sm ${theme.btn}`}
              >
                <span>{currentAd.ctaText}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            ) : (
              <button
                onClick={onOpenAdAuctionModal}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 shadow-sm ${theme.btn}`}
              >
                <span>{currentAd.ctaText}</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            )}

            <button
              onClick={onOpenAdAuctionModal}
              title="Promote Your Coin (Bid for this slot)"
              className="p-1 text-neutral-400 hover:text-amber-400 transition text-[10px] flex items-center gap-1 font-semibold"
            >
              <Megaphone className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Place Ad</span>
            </button>
          </div>

        </div>
      </div>
    );
  }

  // 2. TERMINAL SIDEBAR SPONSOR
  if (placement === 'terminal_sidebar_sponsor') {
    return (
      <div className={`p-4 rounded-xl border ${theme.border} ${theme.bg} shadow-lg space-y-2.5 transition-all relative ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Megaphone className={`w-3.5 h-3.5 ${theme.accent}`} />
            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${theme.badge}`}>
              {currentAd.sponsorBadge || 'SPONSORED SPOTLIGHT'}
            </span>
          </div>
          <button
            onClick={onOpenAdAuctionModal}
            className="text-[10px] text-neutral-400 hover:text-amber-400 transition font-mono underline"
          >
            Bid for Slot
          </button>
        </div>

        <div>
          <h4 className="text-xs font-bold text-white">{currentAd.title}</h4>
          <p className="text-[11px] text-neutral-400 mt-0.5 leading-relaxed">{currentAd.tagline}</p>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="text-[10px] text-neutral-500 font-mono">
            {currentAd.impressionsCount.toLocaleString()} views
          </div>
          <button
            onClick={handleClick}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-sm ${theme.btn}`}
          >
            <span>{currentAd.ctaText}</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }

  // 3. SCREENER FEATURED SPOTLIGHT
  return (
    <div className={`p-3.5 rounded-xl border ${theme.border} ${theme.bg} flex items-center justify-between gap-3 ${className}`}>
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg bg-neutral-900 border border-neutral-800 ${theme.accent}`}>
          <Flame className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white">{currentAd.title}</span>
            <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${theme.badge}`}>
              {currentAd.sponsorBadge || 'FEATURED'}
            </span>
          </div>
          <p className="text-[11px] text-neutral-400">{currentAd.tagline}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleClick}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${theme.btn}`}
        >
          <span>{currentAd.ctaText}</span>
        </button>
        <button
          onClick={onOpenAdAuctionModal}
          className="text-neutral-500 hover:text-neutral-300 p-1 text-[11px]"
          title="Buy this featured spotlight"
        >
          <Megaphone className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
