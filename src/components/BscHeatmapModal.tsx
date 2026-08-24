import React from 'react';
import { Token } from '../types';
import { SUPPORTED_CHAINS } from '../data/chainConfig';
import { Flame, ShieldCheck, Zap, ExternalLink, X, TrendingUp, CheckCircle2, Lock, Radio } from 'lucide-react';

interface BscHeatmapModalProps {
  tokens: Token[];
  isOpen: boolean;
  onClose: () => void;
  onSelectToken: (token: Token) => void;
}

export const BscHeatmapModal: React.FC<BscHeatmapModalProps> = ({
  tokens,
  isOpen,
  onClose,
  onSelectToken,
}) => {
  if (!isOpen) return null;

  const bscTokens = tokens.filter(t => t.chain === 'bsc');
  const bscChain = SUPPORTED_CHAINS['bsc'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl bg-neutral-900 border border-neutral-750 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">BSC Market Heatmap & PancakeSwap Engine</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-semibold">
                  85.2% Memecoin Market Share
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                PancakeSwap v2 auto-migration, 0x000...dead LP burn & BlockVision private relay
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* BSC Dominance Stats Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 space-y-1">
              <span className="text-xs text-neutral-400">Daily Memecoin Launches</span>
              <div className="text-2xl font-bold text-amber-400 font-mono">748 / day</div>
              <span className="text-[11px] text-neutral-500 block">vs. 63 on Solana, 41 on Base</span>
            </div>

            <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 space-y-1">
              <span className="text-xs text-neutral-400">24h Memecoin DEX Volume</span>
              <div className="text-2xl font-bold text-white font-mono">$1.63 Billion</div>
              <span className="text-[11px] text-emerald-400 block">+18.4% 7d growth</span>
            </div>

            <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 space-y-1">
              <span className="text-xs text-neutral-400">BlockVision Private Mempool</span>
              <div className="text-2xl font-bold text-emerald-400 font-mono flex items-center gap-1.5">
                <ShieldCheck className="w-6 h-6" />
                <span>Active</span>
              </div>
              <span className="text-[11px] text-neutral-500 block">0% frontrun slippage on BSC</span>
            </div>
          </div>

          {/* PancakeSwap v2 Auto-Burn LP Invariant Card */}
          <div className="p-4 bg-amber-950/20 border border-amber-500/30 rounded-xl space-y-2 text-xs">
            <div className="flex items-center justify-between text-amber-300 font-bold">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" />
                <span>PancakeSwap v2 Immutable Liquidity Lock</span>
              </div>
              <span className="font-mono text-[11px] text-amber-400">Burn to: 0x000000000000000000000000000000000000dEaD</span>
            </div>
            <p className="text-neutral-300 leading-relaxed">
              When a BSC token graduates at $300K Market Cap (~28 BNB in bonding reserves), the contract automatically calls PancakeSwap v2 Router (<code className="text-amber-400 font-mono">0x10ED43C718714eb63d5aA57B78B54704E256024E</code>) and permanently burns 100% of the LP tokens to the burn address.
            </p>
          </div>

          {/* Top BSC Bonding Curves */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <span>Trending BSC Omniguard Bonding Curves</span>
              </h4>
              <span className="text-xs text-neutral-500">{bscTokens.length} Active Verified Pools</span>
            </div>

            <div className="space-y-2">
              {bscTokens.map(token => (
                <div
                  key={token.mint}
                  onClick={() => {
                    onSelectToken(token);
                    onClose();
                  }}
                  className="p-4 bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 hover:border-amber-500/50 rounded-xl transition cursor-pointer flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={token.image}
                      alt={token.name}
                      className="w-12 h-12 rounded-xl object-cover border border-neutral-800"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{token.name}</span>
                        <span className="text-xs font-mono text-amber-400 font-semibold">${token.symbol}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
                          BSC
                        </span>
                      </div>
                      <div className="text-xs text-neutral-400 mt-1 line-clamp-1">
                        {token.description}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-right">
                    <div>
                      <div className="text-xs text-neutral-400">Market Cap</div>
                      <div className="text-sm font-bold font-mono text-white">
                        ${token.marketCapUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-neutral-400">Graduation Progress</div>
                      <div className="text-sm font-bold font-mono text-amber-400">
                        {token.graduationProgressPct.toFixed(1)}%
                      </div>
                    </div>

                    <button className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-semibold transition">
                      Trade
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between">
          <span className="text-xs text-neutral-500 flex items-center gap-1">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>BscScan API & WebSocket Geyser Connected</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-semibold transition"
          >
            Close Heatmap
          </button>
        </div>
      </div>
    </div>
  );
};
