import React, { useState } from 'react';
import { Token } from '../types';
import { useWallet } from '../context/WalletContext';
import { SUPPORTED_CHAINS } from '../data/chainConfig';
import confetti from 'canvas-confetti';
import { 
  Coins, 
  Sparkles, 
  Lock, 
  Building2, 
  CheckCircle2, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  HelpCircle
} from 'lucide-react';

interface TriVaultCardProps {
  token: Token;
  onOpenTriVaultModal: () => void;
  onTokenUpdated?: (updatedToken: Token) => void;
}

export const TriVaultCard: React.FC<TriVaultCardProps> = ({
  token,
  onOpenTriVaultModal,
  onTokenUpdated
}) => {
  const { publicKey, addNative, signAndSendTransaction } = useWallet();
  const [isClaimingHolder, setIsClaimingHolder] = useState(false);
  const [justClaimed, setJustClaimed] = useState(false);

  const chain = SUPPORTED_CHAINS[token.chain] || SUPPORTED_CHAINS['bsc'];
  const triVault = token.triVault || {
    devSalary: {
      accruedNative: 1.42,
      totalPaidNative: 4.26,
      lastClaimTimestamp: Date.now() - 86400000 * 7,
      nextClaimTimestamp: Date.now() - 1000 * 60,
      weeklyVolumeGeneratedUsd: token.volume24h * 7,
      devWalletAddress: token.creator,
      isClaimableNow: true,
      epochNumber: 4
    },
    holderYield: {
      totalPoolNative: 1.42,
      totalDistributedNative: 4.26,
      userClaimableNative: 0.045,
      currentYieldApyPct: 158.4,
      activeHoldersEarning: token.holdersCount || 850,
      userClaimHistory: [],
      snapshotBlock: 41920812
    },
    cexEscrow: {
      lockedNative: 0.71,
      lockedTokens: 15_000_000,
      targetCexName: 'MEXC & Gate.io',
      isReleased: false,
      releaseTxHash: null,
      verifiedDepositWallet: null,
      cexPairLiveUrl: null,
      daysInEscrow: 14,
      escrowMaturityTimestamp: Date.now() + 86400000 * 46,
      verifiedListingProofUrl: null,
      burnFallbackDeadlineTimestamp: Date.now() + 86400000 * 76,
      cexListingReadinessPct: 78.4
    }
  };

  const handleQuickClaimHolderDividend = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!publicKey || triVault.holderYield.userClaimableNative <= 0) return;

    setIsClaimingHolder(true);
    try {
      const claimAmount = triVault.holderYield.userClaimableNative;
      
      await signAndSendTransaction({
        to: '0xTriVaultHolderYieldDistributor',
        valueNative: 0.001,
        memo: `Claim Holder Yield: ${claimAmount.toFixed(4)} ${chain.nativeCurrency}`
      });

      addNative(claimAmount, token.chain);

      const updatedToken: Token = {
        ...token,
        triVault: {
          ...triVault,
          holderYield: {
            ...triVault.holderYield,
            totalDistributedNative: triVault.holderYield.totalDistributedNative + claimAmount,
            userClaimableNative: 0
          }
        }
      };

      if (onTokenUpdated) onTokenUpdated(updatedToken);

      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 }
      });

      setJustClaimed(true);
      setTimeout(() => setJustClaimed(false), 4000);
    } catch {
      // Handled in modal
    } finally {
      setIsClaimingHolder(false);
    }
  };

  return (
    <div 
      onClick={onOpenTriVaultModal}
      className="p-4 rounded-xl bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 border border-neutral-800 hover:border-amber-500/40 transition-all cursor-pointer group shadow-lg"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Coins className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white group-hover:text-amber-400 transition">
                2-2-1 Tri-Vault Revenue Engine
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                ACTIVE
              </span>
            </div>
            <p className="text-[10px] text-neutral-400">Dev Salary • Holder Real-Yield • CEX Escrow</p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-neutral-400 group-hover:text-white font-semibold">
          <span>Manage</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>

      {/* Mini 3-Pillar Grid */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        
        {/* 1. Dev Salary */}
        <div className="p-2 rounded-lg bg-neutral-950 border border-amber-500/20">
          <div className="text-[10px] text-neutral-400 font-semibold">2% Dev Salary</div>
          <div className="text-xs font-black text-amber-400 font-mono mt-0.5">
            {triVault.devSalary.accruedNative.toFixed(2)} {chain.nativeCurrency}
          </div>
          <div className="text-[9px] text-neutral-500">
            {triVault.devSalary.isClaimableNow ? 'Claimable' : 'In Epoch'}
          </div>
        </div>

        {/* 2. Holder Yield */}
        <div className="p-2 rounded-lg bg-neutral-950 border border-emerald-500/20">
          <div className="text-[10px] text-neutral-400 font-semibold">2% Holder Yield</div>
          <div className="text-xs font-black text-emerald-300 font-mono mt-0.5">
            {triVault.holderYield.userClaimableNative > 0 
              ? `${triVault.holderYield.userClaimableNative.toFixed(3)} ${chain.nativeCurrency}`
              : `${triVault.holderYield.currentYieldApyPct}% APY`}
          </div>
          <div className="text-[9px] text-emerald-400">
            {justClaimed ? 'Claimed!' : triVault.holderYield.userClaimableNative > 0 ? 'Click to Claim' : 'Earning'}
          </div>
        </div>

        {/* 3. CEX Escrow */}
        <div className="p-2 rounded-lg bg-neutral-950 border border-cyan-500/20">
          <div className="text-[10px] text-neutral-400 font-semibold">1% CEX Escrow</div>
          <div className="text-xs font-black text-cyan-300 font-mono mt-0.5">
            {(triVault.cexEscrow.lockedTokens / 1_000_000).toFixed(1)}M Tokens
          </div>
          <div className="text-[9px] text-neutral-500">
            {triVault.cexEscrow.isReleased ? 'Released' : 'Locked for CEX'}
          </div>
        </div>

      </div>

      {/* Quick Action Button if Holder Has Dividends */}
      {triVault.holderYield.userClaimableNative > 0 && !justClaimed && (
        <button
          onClick={handleQuickClaimHolderDividend}
          disabled={isClaimingHolder}
          className="mt-3 w-full py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition flex items-center justify-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Claim {triVault.holderYield.userClaimableNative.toFixed(4)} {chain.nativeCurrency} Holder Yield</span>
        </button>
      )}
    </div>
  );
};
