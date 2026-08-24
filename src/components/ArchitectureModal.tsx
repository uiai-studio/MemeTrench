import React from 'react';
import { ShieldCheck, Lock, Zap, Users, Flame, Rocket, X, BookOpen, Layers, CheckCircle2, Activity, Binary, Vote, Radio, Download, ExternalLink } from 'lucide-react';
import { SUPPORTED_CHAINS } from '../data/chainConfig';

interface ArchitectureModalProps {
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ onClose }) => {
  const handleDownload = async () => {
    try {
      const response = await fetch('/api/diagram');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'MemeTrench_TrenchScreen_Architecture.jpg';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      window.open('/api/download-diagram', '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
      <div className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-neutral-750 bg-neutral-950 p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-amber-500/10 p-2.5 text-amber-400 border border-amber-500/20">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">
                  MemeTrench & TrenchScreen Ecosystem Architecture
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-semibold font-mono">
                  Universal 6-Chain
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Mathematical Invariants • TWAR Linear Vesting • Dual-Oracle Breakers • 72h Soft-Landing Buffer
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition"
              title="Download Architecture Diagram"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Diagram</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-xl p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Visual Architecture Infographic */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-neutral-200">
              <Layers className="h-4 w-4 text-cyan-400" />
              <span>System Flow & Visual Blueprint</span>
            </div>
            <button
              onClick={handleDownload}
              className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 font-mono"
            >
              <Download className="w-3 h-3" />
              Save High-Res (JPG/PNG)
            </button>
          </div>
          <div className="relative overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950/70 group">
            <img
              src="/api/diagram"
              alt="MemeTrench and TrenchScreen Architecture Diagram"
              className="w-full h-auto object-cover max-h-72 sm:max-h-96 rounded-lg"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4">
              <span className="text-xs text-neutral-300 font-medium">
                MemeTrench.com (Launchpad) ◄► TrenchScreen.com (AI Radar)
              </span>
              <button
                onClick={handleDownload}
                className="px-3 py-1.5 bg-emerald-500 text-black font-bold text-xs rounded-lg shadow-lg hover:bg-emerald-400 transition flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Download
              </button>
            </div>
          </div>
        </div>

        {/* Universal 6-Chain Matrix */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
            Phased Multi-Chain Architecture Matrix
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs">
            {Object.values(SUPPORTED_CHAINS).map(c => (
              <div key={c.id} className="p-3 bg-neutral-900/90 rounded-xl border border-neutral-800 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-white">
                  <span>{c.icon}</span>
                  <span>{c.name}</span>
                </div>
                <div className="text-[10px] text-amber-400 font-mono">{c.marketSharePct}% Memecoin Vol</div>
                <div className="text-[10px] text-neutral-400">DEX: {c.dexName}</div>
                <div className="text-[9px] text-neutral-500 font-mono">{c.tokenStandard}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 6 Unassailable Core Invariants */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
            Mathematically Enforced Security Invariants
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
            {/* 1. TWAR Continuous Linear Release */}
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <Lock className="h-4 w-4" />
                <span>1. Time-Weighted Average Release (TWAR)</span>
              </div>
              <p className="text-neutral-300 text-[11px] leading-relaxed">
                20% liquid immediately. Remaining 80% unlocks linearly over 48 hours with deterministic pseudo-random micro-batch offsets (0–119s) + 5-block anti-sniping cooldown to completely nullify bot synchronization attacks.
              </p>
            </div>

            {/* 2. Merkle Dev Hardcap */}
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 space-y-2">
              <div className="flex items-center gap-2 text-purple-400 font-bold">
                <ShieldCheck className="h-4 w-4" />
                <span>2. Merkle Tree KYC-Lite Hardcap (Max 1.5%)</span>
              </div>
              <p className="text-neutral-300 text-[11px] leading-relaxed">
                Dev team must declare up to 6 hardware wallets in an immutable Merkle root tree prior to bonding curve creation. Clustered allocations are hardcapped to 1.5% and locked until TWAP milestone verification.
              </p>
            </div>

            {/* 3. Dual-Oracle Circuit Breakers */}
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 font-bold">
                <Activity className="h-4 w-4" />
                <span>3. Dual-Oracle Circuit Breakers (2.0% Max Div)</span>
              </div>
              <p className="text-neutral-300 text-[11px] leading-relaxed">
                Pyth + Switchboard on Solana; Chainlink + RedStone on BSC & EVM. If feeds diverge by &gt;2.0%, milestone unlocks and parameter updates are instantaneously paused to block flash-loan price manipulation.
              </p>
            </div>

            {/* 4. Soft-Landing Floor Buffer */}
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <ShieldCheck className="h-4 w-4" />
                <span>4. 72h Soft-Landing Floor Insurance & Buffer Zone</span>
              </div>
              <p className="text-neutral-300 text-[11px] leading-relaxed">
                50% creation fee + 0.25% volume escrowed. If MC is in the Danger Zone ($80K–$99.9K) at 72h, community votes to extend 24h or execute a 50% pro-rata refund + 50% DAO conversion.
              </p>
            </div>

            {/* 5. BSC PancakeSwap v2 Auto-Burn */}
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <Flame className="h-4 w-4" />
                <span>5. PancakeSwap v2 LP Burn to 0x000...dead</span>
              </div>
              <p className="text-neutral-300 text-[11px] leading-relaxed">
                BSC bonding curve graduation automatically provisions PancakeSwap v2 liquidity pool and burns 100% of LP tokens to the dead address, ensuring zero rug-pull vector on the chain with 85.2% of market share.
              </p>
            </div>

            {/* 6. Verifiable Forensics & Zero False-Flags */}
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 font-bold">
                <Binary className="h-4 w-4" />
                <span>6. Verifiable Forensics (Gini & Vol/Liq)</span>
              </div>
              <p className="text-neutral-300 text-[11px] leading-relaxed">
                Replaces arbitrary scores with mathematical on-chain proofs: Supply Gini Coefficient (0.0–1.0), 24h Vol-to-Liq velocity ratio, and cryptographic block-explorer transaction audit trail.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-800 pt-4 flex items-center justify-between text-xs text-neutral-400">
          <span>Omniguard Protocol v2.1 (Production Standard)</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl font-semibold transition"
          >
            Close Specification
          </button>
        </div>
      </div>
    </div>
  );
};
