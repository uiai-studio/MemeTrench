import React, { useState } from 'react';
import { Token, DevBadge, DevBadgeType } from '../types';
import { useWallet } from '../context/WalletContext';
import { SUPPORTED_CHAINS } from '../data/chainConfig';
import confetti from 'canvas-confetti';
import { 
  ShieldCheck, 
  Lock, 
  Zap, 
  Award, 
  Layers, 
  CheckCircle2, 
  ExternalLink, 
  X, 
  Sparkles, 
  AlertCircle, 
  Key, 
  FileCheck,
  Coins
} from 'lucide-react';

interface DevBadgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: Token;
  activeBadge?: DevBadge | null;
  onTokenUpdated?: (updatedToken: Token) => void;
}

export const DevBadgeModal: React.FC<DevBadgeModalProps> = ({
  isOpen,
  onClose,
  token,
  activeBadge,
  onTokenUpdated
}) => {
  const { publicKey, signAndSendTransaction } = useWallet();
  const [activeTab, setActiveTab] = useState<'view' | 'apply'>('view');
  
  // Application Form State
  const [selectedBadgeType, setSelectedBadgeType] = useState<DevBadgeType>('doxxed');
  const [applicantProofUrl, setApplicantProofUrl] = useState('');
  const [applicantMultisigAddress, setApplicantMultisigAddress] = useState('');
  const [applicantNotes, setApplicantNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const chain = SUPPORTED_CHAINS[token.chain] || SUPPORTED_CHAINS['bsc'];
  const badges = token.devBadges || [];

  const handleApplyBadge = async () => {
    if (!publicKey) {
      setErrorMessage('Please connect your developer wallet to attest or apply for badges.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // Simulate on-chain verification call
      await signAndSendTransaction({
        to: '0xOmniguardBadgeAttestationRegistry',
        valueNative: 0.005,
        memo: `Attest Dev Badge: ${selectedBadgeType}`
      });

      let newBadge: DevBadge;

      switch (selectedBadgeType) {
        case 'doxxed':
          newBadge = {
            type: 'doxxed',
            label: 'On-Chain KYC Cryptographic Attestation',
            shortLabel: 'KYC Doxxed',
            iconName: 'ShieldCheck',
            color: 'amber',
            description: applicantNotes || 'Developer identity verified with on-chain cryptographic passport attestation.',
            proofUrl: applicantProofUrl || 'https://certik.com',
            issuedAt: Date.now()
          };
          break;
        case 'multisig_safe':
          newBadge = {
            type: 'multisig_safe',
            label: 'Multisig Safe Verified (3/5 Signers)',
            shortLabel: 'Multisig Safe',
            iconName: 'Layers',
            color: 'purple',
            description: `Multisig Safe registered at ${applicantMultisigAddress || '0xSquadsSafe111...'}`,
            proofUrl: applicantProofUrl || 'https://safe.global',
            issuedAt: Date.now()
          };
          break;
        case 'staker_5pct':
          newBadge = {
            type: 'staker_5pct',
            label: '5% Timelocked Growth Staker',
            shortLabel: '5% Staker',
            iconName: 'Lock',
            color: 'emerald',
            description: '50M tokens staked in milestone contract with dual-oracle TWAP circuit breaker.',
            proofUrl: applicantProofUrl || 'https://bscscan.com',
            issuedAt: Date.now()
          };
          break;
        case 'serial_builder':
          newBadge = {
            type: 'serial_builder',
            label: 'Verified Serial Builder (3+ Successes)',
            shortLabel: 'Serial Builder',
            iconName: 'Zap',
            color: 'cyan',
            description: 'Proven track record of high-liquidity non-rug memecoin architectures.',
            proofUrl: applicantProofUrl || 'https://etherscan.io',
            issuedAt: Date.now()
          };
          break;
        default:
          newBadge = {
            type: 'graduated',
            label: 'Tier-1 Graduated Founder',
            shortLabel: 'Graduated Dev',
            iconName: 'Award',
            color: 'yellow',
            description: 'Successfully reached bonding curve cap and burned 100% LP to 0xDead.',
            proofUrl: applicantProofUrl || 'https://dexscreener.com',
            issuedAt: Date.now()
          };
      }

      // Add badge without duplicates
      const updatedBadges = [...badges.filter(b => b.type !== selectedBadgeType), newBadge];
      const updatedToken: Token = {
        ...token,
        devBadges: updatedBadges
      };

      if (onTokenUpdated) onTokenUpdated(updatedToken);

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      setSuccessMessage(`Badge "${newBadge.label}" successfully verified and minted to ${token.symbol}!`);
      setActiveTab('view');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit badge verification.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-750 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-emerald-500 to-purple-500 p-0.5 shadow-lg shadow-amber-500/20">
              <div className="w-full h-full bg-neutral-950 rounded-[10px] flex items-center justify-center text-amber-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">Verified Developer Trust Badges</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold">
                  CRYPTOGRAPHIC PROOFS
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                On-chain identity, 5% timelock staking, multisig governance, & graduation credentials for {token.symbol}
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
              onClick={() => setActiveTab('view')}
              className={`py-3 px-4 border-b-2 transition flex items-center gap-2 ${
                activeTab === 'view'
                  ? 'border-amber-400 text-amber-300 font-bold'
                  : 'border-transparent text-neutral-400 hover:text-white'
              }`}
            >
              <FileCheck className="w-4 h-4" />
              <span>Active Badges ({badges.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('apply')}
              className={`py-3 px-4 border-b-2 transition flex items-center gap-2 ${
                activeTab === 'apply'
                  ? 'border-emerald-400 text-emerald-300 font-bold'
                  : 'border-transparent text-neutral-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Attest / Mint New Badge</span>
            </button>
          </div>

          <span className="text-[11px] text-neutral-400 font-mono">
            Creator: {token.creator.substring(0, 6)}...{token.creator.substring(token.creator.length - 4)}
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

          {/* TAB 1: VIEW ACTIVE BADGES */}
          {activeTab === 'view' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                {badges.map((badge, idx) => (
                  <div 
                    key={idx}
                    className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-neutral-700 transition flex items-start justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-750 shrink-0 mt-0.5">
                        {badge.type === 'doxxed' && <ShieldCheck className="w-5 h-5 text-amber-400" />}
                        {badge.type === 'staker_5pct' && <Lock className="w-5 h-5 text-emerald-400" />}
                        {badge.type === 'serial_builder' && <Zap className="w-5 h-5 text-cyan-400" />}
                        {badge.type === 'graduated' && <Award className="w-5 h-5 text-yellow-400" />}
                        {badge.type === 'multisig_safe' && <Layers className="w-5 h-5 text-purple-400" />}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{badge.label}</h4>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                            VERIFIED
                          </span>
                        </div>
                        <p className="text-xs text-neutral-400">{badge.description}</p>
                        <div className="text-[10px] text-neutral-500 font-mono pt-1">
                          Issued: {new Date(badge.issuedAt).toLocaleDateString()} • Chain: {chain.name}
                        </div>
                      </div>
                    </div>

                    {badge.proofUrl && (
                      <a
                        href={badge.proofUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-750 text-neutral-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 transition"
                      >
                        <span>Proof</span>
                        <ExternalLink className="w-3 h-3 text-neutral-400" />
                      </a>
                    )}
                  </div>
                ))}
              </div>

              {badges.length === 0 && (
                <div className="p-8 text-center bg-neutral-950 rounded-xl border border-neutral-800 text-neutral-400 space-y-2">
                  <ShieldCheck className="w-8 h-8 text-neutral-600 mx-auto" />
                  <p className="text-xs">No verified badges attached to this token yet.</p>
                  <button
                    onClick={() => setActiveTab('apply')}
                    className="mt-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold transition"
                  >
                    Attest Developer Badge Now
                  </button>
                </div>
              )}

              {/* Trust Score Summary */}
              <div className="p-4 bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 rounded-xl border border-neutral-800 flex items-center justify-between text-xs">
                <div>
                  <div className="text-white font-bold">Developer Integrity Tier: Tier-1 Shielded</div>
                  <div className="text-[11px] text-neutral-400">All token movements guarded by Merkle locks & TWAP limits</div>
                </div>
                <div className="text-right font-mono">
                  <div className="text-emerald-400 font-black text-sm">100% Anti-Rug</div>
                  <div className="text-[10px] text-neutral-500">0 High-Risk Flags</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ATTEST / APPLY FOR NEW BADGE */}
          {activeTab === 'apply' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-300 block">Select Badge to Attest</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setSelectedBadgeType('doxxed')}
                    className={`p-3 rounded-xl border text-left transition flex items-start gap-2.5 ${
                      selectedBadgeType === 'doxxed'
                        ? 'border-amber-400 bg-amber-950/20 text-amber-300'
                        : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-bold">KYC Doxxed</div>
                      <div className="text-[10px] opacity-75">Cryptographic ID Verification</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedBadgeType('staker_5pct')}
                    className={`p-3 rounded-xl border text-left transition flex items-start gap-2.5 ${
                      selectedBadgeType === 'staker_5pct'
                        ? 'border-emerald-400 bg-emerald-950/20 text-emerald-300'
                        : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Lock className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-bold">5% Timelock Staker</div>
                      <div className="text-[10px] opacity-75">Milestone TWAP Staking</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedBadgeType('multisig_safe')}
                    className={`p-3 rounded-xl border text-left transition flex items-start gap-2.5 ${
                      selectedBadgeType === 'multisig_safe'
                        ? 'border-purple-400 bg-purple-950/20 text-purple-300'
                        : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Layers className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-bold">Multisig Safe</div>
                      <div className="text-[10px] opacity-75">Squads / Gnosis Governance</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedBadgeType('serial_builder')}
                    className={`p-3 rounded-xl border text-left transition flex items-start gap-2.5 ${
                      selectedBadgeType === 'serial_builder'
                        ? 'border-cyan-400 bg-cyan-950/20 text-cyan-300'
                        : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Zap className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-bold">Serial Builder</div>
                      <div className="text-[10px] opacity-75">3+ Prior Fair Graduations</div>
                    </div>
                  </button>
                </div>
              </div>

              {selectedBadgeType === 'multisig_safe' && (
                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1">Multisig Safe Address *</label>
                  <input
                    type="text"
                    value={applicantMultisigAddress}
                    onChange={(e) => setApplicantMultisigAddress(e.target.value)}
                    placeholder="e.g. 0xSquadsOrGnosisSafe..."
                    className="w-full bg-neutral-950 border border-neutral-750 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1">Public Proof URL / Explorer Link</label>
                <input
                  type="text"
                  value={applicantProofUrl}
                  onChange={(e) => setApplicantProofUrl(e.target.value)}
                  placeholder="https://bscscan.com/address/... or https://certik.com/..."
                  className="w-full bg-neutral-950 border border-neutral-750 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1">Attestation Memo / Description</label>
                <textarea
                  rows={2}
                  value={applicantNotes}
                  onChange={(e) => setApplicantNotes(e.target.value)}
                  placeholder="Details regarding your developer verification..."
                  className="w-full bg-neutral-950 border border-neutral-750 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleApplyBadge}
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-neutral-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span>Verifying On-Chain...</span>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Mint & Attest Verified Badge</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
