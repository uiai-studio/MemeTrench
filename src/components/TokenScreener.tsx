import React, { useState, useMemo } from 'react';
import { Token, SupportedChainId, DevBadge, AdBanner } from '../types';
import { SUPPORTED_CHAINS } from '../data/chainConfig';
import { DevBadgeDisplay } from './DevBadgeDisplay';
import { AdBannerPlacement } from './AdBannerPlacement';
import { TokenAvatar } from './TokenAvatar';
import { 
  ShieldCheck, 
  Flame, 
  Rocket, 
  Lock, 
  Users, 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  Sparkles, 
  ChevronRight,
  ExternalLink,
  Layers,
  Zap,
  RefreshCw,
  Search,
  ArrowUpDown,
  Binary,
  Activity,
  Vote,
  Megaphone
} from 'lucide-react';

interface TokenScreenerProps {
  tokens: Token[];
  selectedToken: Token;
  onSelectToken: (token: Token) => void;
  onOpenSoftLanding: (token: Token) => void;
  onOpenOracleHealth: (token: Token) => void;
  onOpenForensics: (token: Token) => void;
  onOpenCampaignStudio: (token: Token) => void;
  onOpenBadgeModal?: (badge?: DevBadge) => void;
  onOpenAdAuctionModal?: () => void;
  banners?: AdBanner[];
}

export const TokenScreener: React.FC<TokenScreenerProps> = ({
  tokens,
  selectedToken,
  onSelectToken,
  onOpenSoftLanding,
  onOpenOracleHealth,
  onOpenForensics,
  onOpenCampaignStudio,
  onOpenBadgeModal,
  onOpenAdAuctionModal,
  banners = []
}) => {
  const [selectedChainFilter, setSelectedChainFilter] = useState<'ALL' | SupportedChainId>('ALL');
  const [activeTab, setActiveTab] = useState<'all' | 'trending' | 'bsc_dominance' | 'danger_zone' | 'graduating'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'volume' | 'marketCap' | 'graduation' | 'gini' | 'recent'>('volume');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  // High-Speed Filter & Sort Memoized Computation
  const processedTokens = useMemo(() => {
    let list = tokens.filter(token => {
      // Chain filter
      if (selectedChainFilter !== 'ALL' && token.chain !== selectedChainFilter) {
        return false;
      }

      // Search term filter
      if (searchTerm) {
        const q = searchTerm.toLowerCase().trim();
        const matches = 
          (token.name && token.name.toLowerCase().includes(q)) ||
          (token.symbol && token.symbol.toLowerCase().includes(q)) ||
          (token.mint && token.mint.toLowerCase().includes(q)) ||
          (token.chain && token.chain.toLowerCase().includes(q));
        if (!matches) return false;
      }

      // Tab filter
      if (activeTab === 'trending') return (token.volume24h || 0) > 40000;
      if (activeTab === 'bsc_dominance') return token.chain === 'bsc';
      if (activeTab === 'danger_zone') return (token.marketCapUsd || 0) >= 80000 && (token.marketCapUsd || 0) < 100000;
      if (activeTab === 'graduating') return (token.graduationProgressPct || 0) >= 40;
      return true;
    });

    list.sort((a, b) => {
      if (sortBy === 'volume') return (b.volume24h || 0) - (a.volume24h || 0);
      if (sortBy === 'marketCap') return (b.marketCapUsd || 0) - (a.marketCapUsd || 0);
      if (sortBy === 'graduation') return (b.graduationProgressPct || 0) - (a.graduationProgressPct || 0);
      if (sortBy === 'gini') return (a.verifiableMetrics?.giniCoefficient || 0) - (b.verifiableMetrics?.giniCoefficient || 0);
      return (b.createdAt || 0) - (a.createdAt || 0);
    });

    return list;
  }, [tokens, selectedChainFilter, activeTab, searchTerm, sortBy]);

  const totalPages = Math.ceil(processedTokens.length / pageSize) || 1;
  const paginatedTokens = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedTokens.slice(start, start + pageSize);
  }, [processedTokens, currentPage, pageSize]);

  const formatUsd = (num: number) => {
    if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(2)}M`;
    if (num >= 1_000) return `$${(num / 1_000).toFixed(1)}K`;
    return `$${num.toFixed(2)}`;
  };

  return (
    <div className="w-full space-y-4">
      {/* Search and Chain Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 rounded-2xl border border-neutral-800 bg-neutral-950/90 p-4 backdrop-blur-md">
        {/* Chain Selector Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedChainFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              selectedChainFilter === 'ALL'
                ? 'bg-amber-500 text-neutral-950 font-bold'
                : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            All Chains ({tokens.length})
          </button>
          {Object.values(SUPPORTED_CHAINS).map(c => {
            const count = tokens.filter(t => t.chain === c.id).length;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedChainFilter(c.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                  selectedChainFilter === c.id
                    ? `${c.badgeBg} ${c.badgeText} border ${c.badgeBorder} font-bold`
                    : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                <span>{c.icon}</span>
                <span>{c.symbol}</span>
                <span className="text-[10px] opacity-70">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-60">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search token, symbol, chain..."
              className="h-8 w-full rounded-xl border border-neutral-800 bg-neutral-900 pl-8 pr-3 text-xs text-white placeholder-neutral-500 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="h-8 rounded-xl border border-neutral-800 bg-neutral-900 px-2.5 text-xs text-neutral-300 focus:border-amber-500 focus:outline-none"
          >
            <option value="volume">Sort: 24h Volume</option>
            <option value="marketCap">Sort: Market Cap</option>
            <option value="graduation">Sort: DEX Progress</option>
            <option value="gini">Sort: Gini Index (Distribution)</option>
            <option value="recent">Sort: Recently Deployed</option>
          </select>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1 rounded-lg transition ${
            activeTab === 'all' ? 'bg-neutral-800 text-white font-bold' : 'text-neutral-400 hover:text-white'
          }`}
        >
          All Pools
        </button>
        <button
          onClick={() => setActiveTab('bsc_dominance')}
          className={`px-3 py-1 rounded-lg transition flex items-center gap-1 ${
            activeTab === 'bsc_dominance' ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Flame className="w-3 h-3 text-amber-400" />
          <span>BSC PancakeSwap Dominance</span>
        </button>
        <button
          onClick={() => setActiveTab('danger_zone')}
          className={`px-3 py-1 rounded-lg transition flex items-center gap-1 ${
            activeTab === 'danger_zone' ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Vote className="w-3 h-3 text-amber-400" />
          <span>Danger Zone Voting ($80K–$100K)</span>
        </button>
        <button
          onClick={() => setActiveTab('graduating')}
          className={`px-3 py-1 rounded-lg transition flex items-center gap-1 ${
            activeTab === 'graduating' ? 'bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Rocket className="w-3 h-3 text-purple-400" />
          <span>Near DEX Graduation</span>
        </button>
      </div>

      {/* Screener Featured Sponsored Spotlight Banner */}
      <AdBannerPlacement
        placement="screener_featured_spotlight"
        banners={banners}
        onOpenAdAuctionModal={onOpenAdAuctionModal || (() => {})}
        onSelectTokenByMint={(mint) => {
          const t = tokens.find(tok => tok.mint === mint);
          if (t) onSelectToken(t);
        }}
      />

      {/* Token Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginatedTokens.map((token) => {
          const chain = SUPPORTED_CHAINS[token.chain] || SUPPORTED_CHAINS['bsc'];
          const isSelected = selectedToken.mint === token.mint;
          const isDangerZone = token.marketCapUsd >= 80000 && token.marketCapUsd < 100000;

          return (
            <div
              key={token.mint}
              onClick={() => onSelectToken(token)}
              className={`relative p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between gap-4 ${
                isSelected
                  ? 'bg-neutral-900 border-amber-500 shadow-lg shadow-amber-500/10'
                  : 'bg-neutral-950/80 hover:bg-neutral-900 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <TokenAvatar
                    src={token.image}
                    symbol={token.symbol}
                    name={token.name}
                    chain={token.chain}
                    size="md"
                    className="ring-1 ring-neutral-800 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-white text-sm">{token.name}</span>
                      <span className="text-xs font-mono text-amber-400 font-semibold">${token.symbol}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[10px] px-1.5 py-0.2 rounded border ${chain.badgeBg} ${chain.badgeText} ${chain.badgeBorder} font-bold font-mono`}>
                        {chain.symbol}
                      </span>
                      <span className="text-[11px] font-mono text-neutral-400">
                        {formatUsd(token.marketCapUsd)} MC
                      </span>
                    </div>
                  </div>
                </div>

                <span className={`text-xs font-mono font-bold ${token.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {token.change24h >= 0 ? '+' : ''}{token.change24h}%
                </span>
              </div>

              {/* Dev Badges Row */}
              {token.devBadges && token.devBadges.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <DevBadgeDisplay 
                    badges={token.devBadges} 
                    onOpenBadgeModal={onOpenBadgeModal} 
                    size="sm"
                  />
                </div>
              )}

              {/* Invariant Status Badges */}
              <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
                {/* Gini */}
                <div 
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenForensics(token);
                  }}
                  className="p-1.5 bg-neutral-900/80 rounded-lg border border-neutral-800 hover:border-cyan-500/50 transition"
                  title="View Verifiable Supply Gini Index"
                >
                  <span className="text-neutral-500 block">Gini Index</span>
                  <span className="text-emerald-400 font-bold">{(token.verifiableMetrics?.giniCoefficient ?? 0.28).toFixed(2)}</span>
                </div>

                {/* Vol / Liq */}
                <div className="p-1.5 bg-neutral-900/80 rounded-lg border border-neutral-800">
                  <span className="text-neutral-500 block">Vol/Liq</span>
                  <span className="text-cyan-400 font-bold">{(token.verifiableMetrics?.volumeToLiquidityRatio24h ?? 3.5).toFixed(1)}x</span>
                </div>

                {/* Floor Vault */}
                <div 
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenSoftLanding(token);
                  }}
                  className={`p-1.5 rounded-lg border transition ${
                    isDangerZone
                      ? 'bg-amber-950/40 border-amber-500 text-amber-300 animate-pulse'
                      : 'bg-neutral-900/80 border-neutral-800 text-neutral-300 hover:border-emerald-500/50'
                  }`}
                  title="View 72h Soft-Landing Floor Vault"
                >
                  <span className="text-neutral-500 block">Floor Vault</span>
                  <span className="font-bold">{isDangerZone ? 'VOTE' : '72h Active'}</span>
                </div>
              </div>

              {/* Graduation Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-neutral-400">{chain.dexName} Target ($300K)</span>
                  <span className="text-amber-400 font-bold">{token.graduationProgressPct.toFixed(1)}%</span>
                </div>
                <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-yellow-400"
                    style={{ width: `${Math.min(100, token.graduationProgressPct)}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-4 rounded-xl border border-neutral-800 bg-neutral-950 text-xs font-mono text-neutral-400">
          <span>Showing {paginatedTokens.length} of {processedTokens.length} verified tokens</span>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="px-3 py-1 rounded bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 disabled:opacity-30"
            >
              Previous
            </button>
            <span>Page {currentPage} of {totalPages}</span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="px-3 py-1 rounded bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 disabled:opacity-30"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
