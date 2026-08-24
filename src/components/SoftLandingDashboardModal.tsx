import React, { useState } from 'react';
import { Token } from '../types';
import { useWallet } from '../context/WalletContext';
import { SUPPORTED_CHAINS } from '../data/chainConfig';
import { ShieldCheck, AlertTriangle, Vote, Clock, CheckCircle2, RefreshCw, ArrowRight, X, ExternalLink, HelpCircle } from 'lucide-react';

interface SoftLandingDashboardModalProps {
  token: Token;
  isOpen: boolean;
  onClose: () => void;
  onVoteCast?: (isSupportExtension: boolean) => void;
}

export const SoftLandingDashboardModal: React.FC<SoftLandingDashboardModalProps> = ({
  token,
  isOpen,
  onClose,
  onVoteCast,
}) => {
  const { publicKey, connected, activeChain } = useWallet();
  const [hasVoted, setHasVoted] = useState<boolean>(false);
  const [voteType, setVoteType] = useState<'YES' | 'NO' | null>(null);
  const [isProcessingVote, setIsProcessingVote] = useState<boolean>(false);
  const [voteSuccessMessage, setVoteSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const chain = (token.chain && SUPPORTED_CHAINS[token.chain]) ? SUPPORTED_CHAINS[token.chain] : SUPPORTED_CHAINS['bsc'];
  const vault = token.insuranceVault || {
    balanceNative: 5.5,
    nativeCurrency: chain.nativeCurrency,
    expiryTimestamp: Date.now() + 1000 * 60 * 60 * 58,
    dangerZoneTriggered: false,
    is24hExtended: false,
    status: 'Active',
    totalEscrowedNative: 5.5,
    totalBuyersProtected: 42,
    refundRatePerTokenNative: 0.00000001,
    softLandingThresholdUsd: 80000,
    targetSuccessMcUsd: 100000,
    daoTreasuryShareNative: 2.75,
    proRataRefundShareNative: 2.75,
    communityYesVotes: 12,
    communityNoVotes: 1,
    votes: []
  };
  const mc = token.marketCapUsd;
  const isDangerZone = mc >= 80000 && mc < 100000;
  const isMatured = mc >= 100000;
  const isFailed = mc < 80000;

  const hoursRemaining = Math.max(0, Math.floor((vault.expiryTimestamp - Date.now()) / (1000 * 60 * 60)));
  const minutesRemaining = Math.max(0, Math.floor(((vault.expiryTimestamp - Date.now()) % (1000 * 60 * 60)) / (1000 * 60)));

  const handleVote = (support: boolean) => {
    if (!connected) return;
    setIsProcessingVote(true);
    setTimeout(() => {
      setHasVoted(true);
      setVoteType(support ? 'YES' : 'NO');
      setIsProcessingVote(false);
      setVoteSuccessMessage(
        support
          ? `Vote recorded: Supported 24h Buffer Extension with your verified ${chain.nativeCurrency} weighting.`
          : `Vote recorded: Supported Immediate 50% Pro-Rata Refund with your verified ${chain.nativeCurrency} weighting.`
      );
      if (onVoteCast) onVoteCast(support);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-750 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">Soft-Landing Floor Insurance</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${chain.badgeBg} ${chain.badgeText} ${chain.badgeBorder} font-semibold`}>
                  {chain.name}
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Mathematical 72h downside protection & DAO resolution for ${token.symbol}
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
          {/* Main Status Banner */}
          <div className={`p-4 rounded-xl border ${
            isMatured
              ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
              : isDangerZone
              ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
              : 'bg-blue-950/30 border-blue-500/30 text-blue-200'
          }`}>
            <div className="flex items-start gap-3">
              {isMatured ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : isDangerZone ? (
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              ) : (
                <Clock className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">
                    {isMatured
                      ? "Milestone Exceeded: Project Growth Mode Active"
                      : isDangerZone
                      ? "Danger Zone Triggered ($80K–$99.9K MC): 24h Community Buffer Vote Active"
                      : "72-Hour Downside Parachute Active"}
                  </span>
                </div>
                <p className="text-xs opacity-85 leading-relaxed">
                  {isMatured
                    ? "Market cap has sustainably exceeded $100K. The floor vault has matured and unlocked to fuel long-term ecosystem development."
                    : isDangerZone
                    ? "Market cap is in the $80K–$99.9K buffer zone. Holders are voting whether to grant a 24-hour extension or execute a 50% pro-rata refund + 50% DAO relaunch conversion."
                    : `If market cap remains below $80K at the 72h mark, buyers receive a guaranteed 50% pro-rata refund in ${chain.nativeCurrency}, dev tokens are burned, and 50% funds DAO relaunch.`}
                </p>
              </div>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-neutral-950/80 rounded-xl border border-neutral-800">
              <span className="text-[11px] text-neutral-400 uppercase tracking-wider block mb-1">Escrowed Balance</span>
              <span className="text-base font-bold text-white">
                {vault.balanceNative.toFixed(2)} {chain.nativeCurrency}
              </span>
              <span className="text-[10px] text-neutral-500 block mt-0.5">
                ≈ ${(vault.balanceNative * chain.nativePriceUsd).toLocaleString()}
              </span>
            </div>

            <div className="p-3 bg-neutral-950/80 rounded-xl border border-neutral-800">
              <span className="text-[11px] text-neutral-400 uppercase tracking-wider block mb-1">Time Remaining</span>
              <span className="text-base font-bold text-amber-400">
                {hoursRemaining}h {minutesRemaining}m
              </span>
              <span className="text-[10px] text-neutral-500 block mt-0.5">
                {vault.is24hExtended ? "+24h Extended" : "72h Base Window"}
              </span>
            </div>

            <div className="p-3 bg-neutral-950/80 rounded-xl border border-neutral-800">
              <span className="text-[11px] text-neutral-400 uppercase tracking-wider block mb-1">Current TWAP MC</span>
              <span className="text-base font-bold text-white">
                ${mc.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
              <span className={`text-[10px] block mt-0.5 font-medium ${mc >= 100000 ? 'text-emerald-400' : mc >= 80000 ? 'text-amber-400' : 'text-neutral-400'}`}>
                Target: $100,000
              </span>
            </div>

            <div className="p-3 bg-neutral-950/80 rounded-xl border border-neutral-800">
              <span className="text-[11px] text-neutral-400 uppercase tracking-wider block mb-1">Protected Buyers</span>
              <span className="text-base font-bold text-white">
                {vault.totalBuyersProtected.toLocaleString()}
              </span>
              <span className="text-[10px] text-emerald-400 block mt-0.5">
                100% Pro-Rata Share
              </span>
            </div>
          </div>

          {/* Mathematical Resolution Spectrum */}
          <div className="p-4 bg-neutral-950/90 rounded-xl border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-neutral-300">Mathematical Resolution Boundary</span>
              <span className="text-neutral-500 font-mono text-[11px]">Enforced via Smart Contract PDA</span>
            </div>

            {/* Progress Bar */}
            <div className="relative w-full h-3 bg-neutral-800 rounded-full overflow-hidden flex">
              <div
                className="bg-red-500/70 h-full transition-all"
                style={{ width: '40%' }}
                title="<$80K: 50% Refund + 50% DAO Conversion"
              />
              <div
                className="bg-amber-500/80 h-full transition-all"
                style={{ width: '20%' }}
                title="$80K–$100K: Danger Zone Community Vote"
              />
              <div
                className="bg-emerald-500 h-full transition-all"
                style={{ width: '40%' }}
                title=">=$100K: Full Project Growth Unlock"
              />
            </div>

            <div className="flex justify-between text-[11px] text-neutral-400">
              <div>
                <span className="text-red-400 font-semibold block">&lt; $80K</span>
                <span>50% Refund / 50% DAO</span>
              </div>
              <div className="text-center">
                <span className="text-amber-400 font-semibold block">$80K – $99.9K</span>
                <span>24h Buffer + DAO Vote</span>
              </div>
              <div className="text-right">
                <span className="text-emerald-400 font-semibold block">≥ $100K</span>
                <span>Matured & Growth</span>
              </div>
            </div>
          </div>

          {/* Live Community DAO Voting Section */}
          <div className="p-4 bg-neutral-950/90 rounded-xl border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Vote className="w-4 h-4 text-purple-400" />
                <h4 className="text-sm font-bold text-white">Community Extension & Resolution Voting</h4>
              </div>
              <span className="text-xs text-neutral-400">
                Quorum: 66% • Time-Weighted
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                disabled={hasVoted || isProcessingVote}
                onClick={() => handleVote(true)}
                className={`p-3 rounded-xl border text-left transition flex items-center justify-between ${
                  voteType === 'YES'
                    ? 'bg-emerald-950/40 border-emerald-500 text-white'
                    : 'bg-neutral-900 border-neutral-800 hover:border-emerald-500/50 text-neutral-300 hover:text-white'
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-emerald-400">Extend 24h Buffer</div>
                  <div className="text-[11px] text-neutral-400">Allow project more time to reach $100K</div>
                </div>
                <span className="text-sm font-bold text-emerald-400">{vault.communityYesVotes} votes</span>
              </button>

              <button
                disabled={hasVoted || isProcessingVote}
                onClick={() => handleVote(false)}
                className={`p-3 rounded-xl border text-left transition flex items-center justify-between ${
                  voteType === 'NO'
                    ? 'bg-amber-950/40 border-amber-500 text-white'
                    : 'bg-neutral-900 border-neutral-800 hover:border-amber-500/50 text-neutral-300 hover:text-white'
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-amber-400">Immediate 50% Refund</div>
                  <div className="text-[11px] text-neutral-400">Trigger pro-rata claim + DAO conversion</div>
                </div>
                <span className="text-sm font-bold text-amber-400">{vault.communityNoVotes} votes</span>
              </button>
            </div>

            {voteSuccessMessage && (
              <div className="p-2.5 bg-purple-950/40 border border-purple-500/40 rounded-lg text-purple-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                <span>{voteSuccessMessage}</span>
              </div>
            )}
          </div>

          {/* User Pro-Rata Refund Calculator */}
          <div className="p-4 bg-neutral-950/80 rounded-xl border border-neutral-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-neutral-300">
              <span className="font-semibold">Your Estimated Pro-Rata Floor Protection</span>
              <span className="font-mono text-emerald-400">50% Guaranteed Floor</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-neutral-900 rounded-lg border border-neutral-800 text-xs">
              <div className="text-neutral-400">
                If settlement triggers, your wallet can claim:
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-white">
                  {(vault.balanceNative * 0.045).toFixed(3)} {chain.nativeCurrency}
                </span>
                <span className="text-[10px] text-neutral-500 block">
                  ≈ ${((vault.balanceNative * 0.045) * chain.nativePriceUsd).toFixed(2)} USD
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between">
          <div className="text-xs text-neutral-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Parametric Smart Contract Security by Omniguard v2.1</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-semibold transition"
          >
            Close Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
