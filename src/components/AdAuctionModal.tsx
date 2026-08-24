import React, { useState } from 'react';
import { AdBanner, AdPlacementType, AdRevenueVaultState, SupportedChainId } from '../types';
import { useWallet } from '../context/WalletContext';
import { SUPPORTED_CHAINS } from '../data/chainConfig';
import confetti from 'canvas-confetti';
import { 
  Megaphone, 
  Sparkles, 
  TrendingUp, 
  DollarSign, 
  Flame, 
  Coins, 
  CheckCircle2, 
  X, 
  AlertCircle, 
  Layers, 
  Eye, 
  MousePointerClick,
  Percent,
  Sliders,
  ExternalLink
} from 'lucide-react';

interface AdAuctionModalProps {
  isOpen: boolean;
  onClose: () => void;
  banners: AdBanner[];
  adRevenueVault: AdRevenueVaultState;
  onAddBanner: (newBanner: AdBanner) => void;
}

export const AdAuctionModal: React.FC<AdAuctionModalProps> = ({
  isOpen,
  onClose,
  banners,
  adRevenueVault,
  onAddBanner
}) => {
  const { currentChain, publicKey, signAndSendTransaction } = useWallet();
  const [activeTab, setActiveTab] = useState<'create' | 'revenue_pool' | 'live_slots'>('create');
  
  // New Ad Form State
  const [placement, setPlacement] = useState<AdPlacementType>('top_ticker_banner');
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [ctaText, setCtaText] = useState('Trade Now');
  const [ctaLink, setCtaLink] = useState('');
  const [sponsorName, setSponsorName] = useState('');
  const [sponsorBadge, setSponsorBadge] = useState('Hot Sponsor');
  const [bidAmountNative, setBidAmountNative] = useState<number>(1.0);
  const [themeColor, setThemeColor] = useState<'amber' | 'emerald' | 'cyan' | 'purple'>('amber');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const chain = SUPPORTED_CHAINS[currentChain] || SUPPORTED_CHAINS['bsc'];
  const minPrice = adRevenueVault.slotPricing[placement] || 0.5;

  const handleCreateAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey) {
      setErrorMessage('Please connect your Web3 wallet to place an on-chain ad bid.');
      return;
    }

    if (!title || !tagline || !ctaLink) {
      setErrorMessage('Please fill in all required fields (Title, Tagline, and CTA Link).');
      return;
    }

    if (bidAmountNative < minPrice) {
      setErrorMessage(`Minimum bid for this placement is ${minPrice} ${chain.symbol}.`);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // Execute simulated on-chain payment
      await signAndSendTransaction({
        to: '0xOmniguardAdRevenueVaultEscrow',
        valueNative: bidAmountNative,
        memo: `Ad Placement Bid: ${placement}`
      });

      const newAd: AdBanner = {
        id: `ad-${Date.now()}`,
        placement,
        title,
        tagline,
        ctaText: ctaText || 'Explore',
        ctaLink,
        sponsorName: sponsorName || 'Verified Sponsor',
        sponsorBadge,
        chain: currentChain,
        bidAmountNative,
        impressionsCount: 0,
        clicksCount: 0,
        expiresAt: Date.now() + 86400000 * 7, // 7 days active
        isActive: true,
        themeColor
      };

      onAddBanner(newAd);

      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 }
      });

      setSuccessMessage(`Ad campaign "${title}" is now LIVE across Omniguard OS for 7 days!`);
      setActiveTab('live_slots');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit ad placement.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-3xl bg-neutral-900 border border-neutral-750 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-emerald-500 to-cyan-500 p-0.5 shadow-lg shadow-amber-500/20">
              <div className="w-full h-full bg-neutral-950 rounded-[10px] flex items-center justify-center text-amber-400">
                <Megaphone className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">Omniguard Protocol Ads & Banner Auction</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                  REVENUE SHARING 60-20-20
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Self-serve on-chain ad spots. 20% of all ad spend automatically rewards token holders & burns supply!
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-neutral-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center justify-between px-6 border-b border-neutral-800 bg-neutral-950/60 text-xs font-semibold">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('create')}
              className={`py-3 px-4 border-b-2 transition flex items-center gap-2 ${
                activeTab === 'create'
                  ? 'border-amber-400 text-amber-300 font-bold'
                  : 'border-transparent text-neutral-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Create / Bid Ad Banner</span>
            </button>

            <button
              onClick={() => setActiveTab('revenue_pool')}
              className={`py-3 px-4 border-b-2 transition flex items-center gap-2 ${
                activeTab === 'revenue_pool'
                  ? 'border-emerald-400 text-emerald-300 font-bold'
                  : 'border-transparent text-neutral-400 hover:text-white'
              }`}
            >
              <Coins className="w-4 h-4" />
              <span>Ad Revenue Sharing Pool</span>
            </button>

            <button
              onClick={() => setActiveTab('live_slots')}
              className={`py-3 px-4 border-b-2 transition flex items-center gap-2 ${
                activeTab === 'live_slots'
                  ? 'border-cyan-400 text-cyan-300 font-bold'
                  : 'border-transparent text-neutral-400 hover:text-white'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>Live Campaigns ({banners.length})</span>
            </button>
          </div>

          <span className="text-[11px] text-neutral-400 font-mono">
            Chain: <span className="text-amber-400 font-bold">{chain.name}</span>
          </span>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          
          {successMessage && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMessage}</span>
              </div>
              <button onClick={() => setSuccessMessage(null)} className="text-emerald-400 font-bold">✕</button>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-red-950/60 border border-red-500/50 rounded-xl text-red-300 text-xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
              <button onClick={() => setErrorMessage(null)} className="text-red-400 font-bold">✕</button>
            </div>
          )}

          {/* TAB 1: CREATE / BID AD BANNER */}
          {activeTab === 'create' && (
            <form onSubmit={handleCreateAd} className="space-y-4">
              
              {/* Placement Selector */}
              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-2">Select Placement Slot</label>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPlacement('top_ticker_banner')}
                    className={`p-3 rounded-xl border text-left transition ${
                      placement === 'top_ticker_banner'
                        ? 'border-amber-400 bg-amber-950/20 text-amber-300'
                        : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-bold">Top Ticker Header</div>
                    <div className="text-[10px] opacity-75 mt-0.5">Global sticky header banner</div>
                    <div className="text-[10px] font-mono text-amber-400 font-bold mt-1">
                      Min: {adRevenueVault.slotPricing.top_ticker_banner} {chain.symbol}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPlacement('terminal_sidebar_sponsor')}
                    className={`p-3 rounded-xl border text-left transition ${
                      placement === 'terminal_sidebar_sponsor'
                        ? 'border-cyan-400 bg-cyan-950/20 text-cyan-300'
                        : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-bold">Terminal Sidebar</div>
                    <div className="text-[10px] opacity-75 mt-0.5">High intent trader terminal</div>
                    <div className="text-[10px] font-mono text-cyan-400 font-bold mt-1">
                      Min: {adRevenueVault.slotPricing.terminal_sidebar_sponsor} {chain.symbol}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPlacement('screener_featured_spotlight')}
                    className={`p-3 rounded-xl border text-left transition ${
                      placement === 'screener_featured_spotlight'
                        ? 'border-emerald-400 bg-emerald-950/20 text-emerald-300'
                        : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-bold">Screener Spotlight</div>
                    <div className="text-[10px] opacity-75 mt-0.5">Featured on token search list</div>
                    <div className="text-[10px] font-mono text-emerald-400 font-bold mt-1">
                      Min: {adRevenueVault.slotPricing.screener_featured_spotlight} {chain.symbol}
                    </div>
                  </button>
                </div>
              </div>

              {/* Title & Tagline */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1">Headline / Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. ⚡ MEGA PEPE L2 MAINNET LIVE"
                    className="w-full bg-neutral-950 border border-neutral-750 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1">Sponsor Name & Badge</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={sponsorName}
                      onChange={(e) => setSponsorName(e.target.value)}
                      placeholder="e.g. MegaPepe DAO"
                      className="w-full bg-neutral-950 border border-neutral-750 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                    />
                    <input
                      type="text"
                      value={sponsorBadge}
                      onChange={(e) => setSponsorBadge(e.target.value)}
                      placeholder="e.g. Hot Sponsor"
                      className="w-full bg-neutral-950 border border-neutral-750 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1">Tagline / Value Proposition *</label>
                <input
                  type="text"
                  required
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g. 48h linear anti-dump TWAR with 2-2-1 Tri-Vault native BNB dividends."
                  className="w-full bg-neutral-950 border border-neutral-750 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* CTA Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1">CTA Button Text</label>
                  <input
                    type="text"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    placeholder="e.g. Trade on BSC / Explore"
                    className="w-full bg-neutral-950 border border-neutral-750 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1">Target CTA URL *</label>
                  <input
                    type="text"
                    required
                    value={ctaLink}
                    onChange={(e) => setCtaLink(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-neutral-950 border border-neutral-750 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Bid Amount & Color */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1">
                    Your Bid Amount ({chain.symbol}) (7-Day Duration)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min={minPrice}
                    value={bidAmountNative}
                    onChange={(e) => setBidAmountNative(parseFloat(e.target.value) || 0)}
                    className="w-full bg-neutral-950 border border-neutral-750 rounded-xl px-3 py-2 text-amber-400 font-mono font-bold text-xs focus:outline-none focus:border-amber-500"
                  />
                  <span className="text-[10px] text-neutral-500 mt-1 block">
                    Higher bids receive priority rotation & higher CTR impressions.
                  </span>
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1">Visual Theme Color</label>
                  <div className="flex items-center gap-2 pt-1">
                    {(['amber', 'emerald', 'cyan', 'purple'] as const).map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setThemeColor(color)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition border ${
                          themeColor === color
                            ? 'border-white bg-neutral-800 text-white'
                            : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Revenue Split Transparency Box */}
              <div className="p-3.5 bg-neutral-950 border border-neutral-800 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between text-neutral-300 font-bold">
                  <span className="flex items-center gap-1.5">
                    <Percent className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Automated Protocol Revenue Distribution:</span>
                  </span>
                  <span className="text-amber-400 font-mono">{bidAmountNative} {chain.symbol} Total</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[11px] font-mono">
                  <div className="p-2 rounded bg-neutral-900 border border-neutral-800">
                    <div className="text-neutral-400 text-[10px]">60% Platform Treasury</div>
                    <div className="text-white font-bold">{(bidAmountNative * 0.60).toFixed(3)} {chain.symbol}</div>
                  </div>
                  <div className="p-2 rounded bg-emerald-950/30 border border-emerald-500/30">
                    <div className="text-emerald-400 text-[10px]">20% Holder Dividends</div>
                    <div className="text-emerald-300 font-bold">{(bidAmountNative * 0.20).toFixed(3)} {chain.symbol}</div>
                  </div>
                  <div className="p-2 rounded bg-amber-950/30 border border-amber-500/30">
                    <div className="text-amber-400 text-[10px]">20% Buyback & Burn</div>
                    <div className="text-amber-300 font-bold">{(bidAmountNative * 0.20).toFixed(3)} {chain.symbol}</div>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-emerald-500 to-cyan-500 hover:from-amber-400 hover:to-cyan-400 text-neutral-950 font-black text-xs shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>Broadcasting On-Chain Bid...</span>
                  ) : (
                    <>
                      <Megaphone className="w-4 h-4" />
                      <span>Launch 7-Day Ad Campaign ({bidAmountNative} {chain.symbol})</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          )}

          {/* TAB 2: REVENUE SHARING POOL */}
          {activeTab === 'revenue_pool' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-1">
                  <div className="text-[10px] text-neutral-400 font-mono uppercase">Total Ads Revenue</div>
                  <div className="text-lg font-black text-amber-400 font-mono">
                    {adRevenueVault.totalAdRevenueNative.toFixed(2)} {chain.symbol}
                  </div>
                  <div className="text-[10px] text-neutral-500">Across 6 blockchain networks</div>
                </div>

                <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-xl space-y-1">
                  <div className="text-[10px] text-emerald-400 font-mono uppercase">Holder Dividends Pool (20%)</div>
                  <div className="text-lg font-black text-emerald-300 font-mono">
                    {adRevenueVault.holderDividendShareNative.toFixed(2)} {chain.symbol}
                  </div>
                  <div className="text-[10px] text-emerald-500">Distributed to diamond hands</div>
                </div>

                <div className="p-4 bg-amber-950/30 border border-amber-500/30 rounded-xl space-y-1">
                  <div className="text-[10px] text-amber-400 font-mono uppercase">Burn & Buybacks (20%)</div>
                  <div className="text-lg font-black text-amber-300 font-mono">
                    {adRevenueVault.buybackBurnShareNative.toFixed(2)} {chain.symbol}
                  </div>
                  <div className="text-[10px] text-amber-500">Sent to 0x000...dead</div>
                </div>
              </div>

              <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 space-y-3 text-xs">
                <h4 className="font-bold text-white flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>How Omniguard Ads Monetization Works</span>
                </h4>
                <p className="text-neutral-400 leading-relaxed">
                  Unlike traditional Web2 ad networks that extract 100% of profits, Omniguard OS recycles <strong className="text-white">40% of all ad revenues directly back to the ecosystem</strong>. Every time a new project or partner sponsors a top ticker slot, token holders earn passive dividend yield and deflationary tokens are permanently removed from circulation.
                </p>

                <div className="p-3 bg-neutral-900 rounded-lg border border-neutral-800 flex items-center justify-between text-neutral-300">
                  <span>Current Active Sponsored Slots:</span>
                  <span className="font-mono text-emerald-400 font-bold">{banners.length} Campaigns</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LIVE CAMPAIGNS */}
          {activeTab === 'live_slots' && (
            <div className="space-y-3">
              {banners.map((ad) => (
                <div 
                  key={ad.id}
                  className="p-3.5 bg-neutral-950 rounded-xl border border-neutral-800 flex items-center justify-between gap-4"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white truncate">{ad.title}</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        {ad.placement.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400 truncate">{ad.tagline}</p>
                    <div className="text-[10px] text-neutral-500 font-mono flex items-center gap-3">
                      <span>Bid: {ad.bidAmountNative} {chain.symbol}</span>
                      <span>•</span>
                      <span>Impressions: {ad.impressionsCount.toLocaleString()}</span>
                      <span>•</span>
                      <span>Clicks: {ad.clicksCount.toLocaleString()}</span>
                    </div>
                  </div>

                  <a
                    href={ad.ctaLink}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-750 text-neutral-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 transition"
                  >
                    <span>Visit</span>
                    <ExternalLink className="w-3 h-3 text-neutral-400" />
                  </a>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
