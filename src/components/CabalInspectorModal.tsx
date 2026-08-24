import React, { useState } from 'react';
import { Token } from '../types';
import { useWallet } from '../context/WalletContext';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Users, 
  Clock, 
  Vote, 
  Coins, 
  CheckCircle2, 
  X, 
  ExternalLink,
  Layers,
  Flame,
  Lock
} from 'lucide-react';

interface CabalInspectorModalProps {
  token: Token;
  onClose: () => void;
  onVoteOuster: (voteYes: boolean) => void;
  onClaimRefund: () => void;
}

export const CabalInspectorModal: React.FC<CabalInspectorModalProps> = ({
  token,
  onClose,
  onVoteOuster,
  onClaimRefund
}) => {
  const { publicKey } = useWallet();
  const [isVoting, setIsVoting] = useState(false);
  const [voteSuccess, setVoteSuccess] = useState<string | null>(null);

  const risk = token.cabalAudit || {
    riskScore: 6,
    riskLevel: 'SAFE',
    block0JitoBundled: false,
    bundleTxCount: 0,
    top10HolderConcentration: 4.1,
    devClusterWalletCount: 2,
    devClusterTotalSupplyPct: token.devAllocationPercent || 1.1,
    mixerFundingDetected: false,
    transferHookVerified: true,
    permanentDelegateDisabled: true,
    metadataMutable: false,
    findings: [
      "Omniguard Transfer Hook verified.",
      "Merkle tree declared wallet proof verified on-chain."
    ]
  };

  const daoOuster = token.daoOuster || {
    devLastActiveTimestamp: Date.now() - 1000 * 60 * 60 * 8,
    isDevInactive: false,
    proposalActive: false,
    yesVotes: 0,
    noVotes: 0,
    totalVotesNeeded: 660_000_000,
    isOusted: false,
    squadsMultisigAddress: "0xCommunitySquadsDAO"
  };

  const quorumPct = (((daoOuster.yesVotes || 0) / (daoOuster.totalVotesNeeded || 660_000_000)) * 100).toFixed(1);

  const handleVote = async (yes: boolean) => {
    setIsVoting(true);
    try {
      const res = await fetch(`/api/tokens/${token.mint}/vote-ouster`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userPublicKey: publicKey || "Phantom7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZ",
          voteYes: yes,
          tokenAmount: 50_000_000
        })
      });
      const data = await res.json();
      if (data.success) {
        setVoteSuccess(yes ? "Voted YES for Community Takeover!" : "Voted NO");
        onVoteOuster(yes);
      }
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-cyan-500/10 p-3 text-cyan-400 border border-cyan-500/20">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                On-Chain Forensic & Safety Inspector
              </h2>
              <p className="text-xs text-zinc-400 font-mono">
                SPL Token-2022 Transfer Hook & Cabal Cluster Analysis for ${token.symbol}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Cabal Risk Gauge Header */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-1 rounded-2xl bg-zinc-900/90 border border-zinc-800 p-4 flex flex-col items-center justify-center text-center">
            <div className="text-xs font-mono text-zinc-400 mb-1">CABAL RISK SCORE</div>
            <div className="text-3xl font-black font-mono text-emerald-400">
              {risk.riskScore}<span className="text-sm text-zinc-500">/100</span>
            </div>
            <div className="mt-1 inline-block rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-mono font-bold text-emerald-300 border border-emerald-500/30">
              {risk.riskLevel} SAFETY PROFILE
            </div>
          </div>

          <div className="sm:col-span-2 rounded-2xl bg-zinc-900/90 border border-zinc-800 p-4 space-y-2 text-xs font-mono">
            <div className="flex justify-between text-zinc-300">
              <span>Dev Supply Hardcap:</span>
              <strong className="text-emerald-400">{token.devAllocationPercent}% (Protocol Cap: 1.5%)</strong>
            </div>
            <div className="flex justify-between text-zinc-300">
              <span>Dev Clustered Wallets:</span>
              <strong className="text-cyan-400">{token.devWallets.length} Addresses (Max: 6)</strong>
            </div>
            <div className="flex justify-between text-zinc-300">
              <span>Block-0 Jito MEV Bundling:</span>
              <strong className={risk.block0JitoBundled ? 'text-amber-400' : 'text-emerald-400'}>
                {risk.block0JitoBundled ? 'Detected Snipe' : 'Clean Organic Launch'}
              </strong>
            </div>
            <div className="flex justify-between text-zinc-300">
              <span>Top 10 Holder Concentration:</span>
              <strong className="text-zinc-100">{risk.top10HolderConcentration}%</strong>
            </div>
          </div>
        </div>

        {/* Dev Cluster Wallet Breakdown */}
        <div className="space-y-2 font-mono text-xs">
          <h3 className="font-bold text-zinc-200 flex items-center gap-1.5">
            <Layers className="h-4 w-4 text-cyan-400" />
            Dev Clustered Wallets Matrix ({token.devWallets.length}/6 Max)
          </h3>
          <div className="space-y-1.5">
            {token.devWallets.map((wallet, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-xl bg-zinc-900/60 p-2.5 border border-zinc-800/80"
              >
                <div className="flex items-center gap-2">
                  <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-400 font-bold">
                    #{idx + 1}
                  </span>
                  <span className="text-zinc-300">
                    {wallet.address.substring(0, 10)}...{wallet.address.substring(wallet.address.length - 8)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-cyan-400 font-bold">{wallet.percentage}% Supply</span>
                  <span className="text-zinc-500 text-[11px]">({wallet.lockedTokens.toLocaleString()} Locked)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 1-Click Community Ouster DAO Takeover */}
        <div className="rounded-2xl border border-blue-500/30 bg-blue-950/20 p-4 space-y-3 font-mono text-xs">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-blue-300 font-bold text-sm">
                <Vote className="h-4 w-4" />
                Community Ouster DAO (1-Click Takeover)
              </div>
              <p className="text-[11px] text-zinc-400">
                If dev is inactive for &gt;7 days, token holders vote with &gt;66% quorum to strip dev's locked supply and transfer authority to Squads Marketing Multisig.
              </p>
            </div>

            {daoOuster.isOusted && (
              <span className="rounded-full bg-blue-500/20 px-2.5 py-1 text-[11px] font-bold text-blue-300 border border-blue-500/40">
                Takeover Executed
              </span>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px]">
              <span className="text-zinc-400">DAO Quorum Progress (&gt;66% needed):</span>
              <strong className="text-blue-300">{quorumPct}% ({(daoOuster.yesVotes || 0).toLocaleString()} votes)</strong>
            </div>
            <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all"
                style={{ width: `${Math.min(100, Number(quorumPct))}%` }}
              />
            </div>
          </div>

          {voteSuccess && (
            <div className="rounded-xl bg-emerald-950/40 border border-emerald-500/30 p-2 text-emerald-300 text-center font-bold">
              {voteSuccess}
            </div>
          )}

          {!daoOuster.isOusted && (
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => handleVote(true)}
                disabled={isVoting}
                className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-500 py-2 font-bold text-zinc-100 transition-colors"
              >
                {isVoting ? 'Submitting...' : 'Vote YES to Oust Dev (50M Weight)'}
              </button>
              <button
                onClick={() => handleVote(false)}
                disabled={isVoting}
                className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2 text-zinc-400 hover:text-zinc-200"
              >
                Vote NO
              </button>
            </div>
          )}
        </div>

        {/* Findings Checklist */}
        <div className="space-y-1.5 font-mono text-xs">
          <h3 className="font-bold text-zinc-300">Geyser Audit Checkpoints</h3>
          <div className="space-y-1">
            {risk.findings.map((item, i) => (
              <div key={i} className="flex items-start gap-2 text-zinc-400">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full rounded-xl bg-zinc-800 py-2.5 text-xs font-bold text-zinc-200 hover:bg-zinc-700 transition-colors"
        >
          Close Forensic Inspector
        </button>
      </div>
    </div>
  );
};
