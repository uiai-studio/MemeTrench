import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Lock, 
  Scale, 
  AlertTriangle, 
  X, 
  CheckSquare, 
  Square, 
  ExternalLink 
} from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept?: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({
  isOpen,
  onClose,
  onAccept
}) => {
  const [hasAgreed, setHasAgreed] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800/80 bg-zinc-900/50">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Scale className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-100 font-mono">
                TrancheLaunch Protocol Terms & Risk Disclaimers
              </h2>
              <p className="text-[11px] text-zinc-400 font-mono">
                Cryptographic Invariants & Fair-Launch Agreement
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto text-xs text-zinc-300 font-mono leading-relaxed">
          {/* Notice Banner */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
            <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-amber-300">Decentralized Autonomous Protocol Notice</p>
              <p className="text-[11px] text-amber-200/80 leading-normal">
                TrancheLaunch OS executes non-custodial smart contracts on Solana. Memecoins are volatile digital assets with high risk of total loss. Never deposit funds you cannot afford to lose.
              </p>
            </div>
          </div>

          {/* Section 1 */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-cyan-400 flex items-center gap-1.5 uppercase">
              <Lock className="h-3.5 w-3.5" />
              1. Transfer Hook Milestone Vesting Invariants
            </h3>
            <p className="text-zinc-400 text-[11px]">
              All early buyers agree that tokens purchased during bonding curve phases are programmatically restricted to 20% immediate unlocks with linear 15-minute 20% tranche releases. Selling prematurely enforces an immutable 4% diamond-hand fee (2% redistributed to remaining holders, 2% burned permanently).
            </p>
          </div>

          {/* Section 2 */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase">
              <ShieldCheck className="h-3.5 w-3.5" />
              2. 72-Hour Downside Floor Insurance Vault
            </h3>
            <p className="text-zinc-400 text-[11px]">
              Floor insurance vaults are funded via token creation fees (0.25 SOL) and 0.25% trading volume fees. The insurance pool matures in 72 hours. Restitution claims are calculated pro-rata against the remaining vault balance and require burning user tokens.
            </p>
          </div>

          {/* Section 3 */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-purple-400 flex items-center gap-1.5 uppercase">
              <Scale className="h-3.5 w-3.5" />
              3. Dev Supply Hardcap & Staked Good-Faith Bond
            </h3>
            <p className="text-zinc-400 text-[11px]">
              Token creators are hard-capped at 1.5% maximum allocation and 0% liquid tokens at launch. Creators stake a 2.0 SOL Good-Faith Bond escrowed on-chain. If creator inactivity or malicious dumping is detected, community holders holding &gt;66% supply can execute an on-chain DAO ouster.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-zinc-800/80 bg-zinc-900/40 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setHasAgreed(!hasAgreed)}
            className="flex items-center gap-2 text-xs font-mono text-zinc-300 hover:text-white cursor-pointer"
          >
            {hasAgreed ? (
              <CheckSquare className="h-4 w-4 text-cyan-400" />
            ) : (
              <Square className="h-4 w-4 text-zinc-500" />
            )}
            <span>I acknowledge the on-chain protocol rules and risk disclosures</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-mono text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              Close
            </button>
            <button
              disabled={!hasAgreed}
              onClick={() => {
                if (onAccept) onAccept();
                onClose();
              }}
              className="flex-1 sm:flex-initial px-5 py-2 rounded-xl text-xs font-mono font-bold bg-gradient-to-r from-cyan-500 to-blue-500 text-zinc-950 disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-cyan-500/20 transition-all"
            >
              Accept & Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
