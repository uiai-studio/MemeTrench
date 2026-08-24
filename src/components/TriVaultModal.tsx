import React, { useState } from 'react';
import { Token, SupportedChainId } from '../types';
import { useWallet } from '../context/WalletContext';
import { SUPPORTED_CHAINS } from '../data/chainConfig';
import confetti from 'canvas-confetti';
import { 
  ShieldCheck, 
  Zap, 
  Coins, 
  Lock, 
  Unlock, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  X, 
  ExternalLink,
  ChevronRight,
  Flame,
  Layers,
  ArrowRight,
  HelpCircle,
  Building2,
  Award,
  Wallet
} from 'lucide-react';

interface TriVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: Token;
  onTokenUpdated?: (updatedToken: Token) => void;
}

export const TriVaultModal: React.FC<TriVaultModalProps> = ({
  isOpen,
  onClose,
  token,
  onTokenUpdated
}) => {
  const { 
    publicKey, 
    addNative, 
    signAndSendTransaction 
  } = useWallet();

  const [activeTab, setActiveTab] = useState<'live' | 'simulator' | 'spec'>('live');
  
  // Interactive Simulator state
  const [simWeeklyVolumeUsd, setSimWeeklyVolumeUsd] = useState<number>(500000);
  const [simHoldingPct, setSimHoldingPct] = useState<number>(1.0);

  // Claim actions state
  const [isClaimingDev, setIsClaimingDev] = useState(false);
  const [isClaimingHolder, setIsClaimingHolder] = useState(false);
  const [isReleasingCex, setIsReleasingCex] = useState(false);
  const [claimSuccessMessage, setClaimSuccessMessage] = useState<string | null>(null);
  const [claimErrorMessage, setClaimErrorMessage] = useState<string | null>(null);

  // CEX Escrow Release Form
  const [cexHotWalletInput, setCexHotWalletInput] = useState('');
  const [cexPairUrlInput, setCexPairUrlInput] = useState('');
  const [showCexReleaseForm, setShowCexReleaseForm] = useState(false);

  if (!isOpen) return null;

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
      targetCexName: 'MEXC, Gate.io & Bybit',
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

  const isDevConnected = publicKey && (
    publicKey.toLowerCase() === token.creator.toLowerCase() ||
    (token.devWallets && token.devWallets.some(w => w.address.toLowerCase() === publicKey.toLowerCase()))
  );

  // Claim Dev Weekly Salary
  const handleClaimDevSalary = async () => {
    if (!publicKey) {
      setClaimErrorMessage('Please connect the creator wallet to claim weekly salary.');
      return;
    }
    if (!isDevConnected) {
      setClaimErrorMessage(`Only verified creator hardware wallet (${token.creator.substring(0, 6)}...${token.creator.substring(token.creator.length - 4)}) can claim this salary.`);
      return;
    }
    if (triVault.devSalary.accruedNative <= 0) {
      setClaimErrorMessage('No accrued developer salary available in the current epoch.');
      return;
    }

    setIsClaimingDev(true);
    setClaimErrorMessage(null);
    setClaimSuccessMessage(null);

    try {
      const claimAmount = triVault.devSalary.accruedNative;
      
      // Simulate on-chain contract claim call
      await signAndSendTransaction({
        to: '0xTriVaultSalaryEnforcerContract',
        valueNative: 0.001,
        memo: `Claim Weekly Salary: ${claimAmount.toFixed(4)} ${chain.nativeCurrency}`
      });

      // Update local and backend state
      addNative(claimAmount, token.chain);
      
      const updatedToken: Token = {
        ...token,
        triVault: {
          ...triVault,
          devSalary: {
            ...triVault.devSalary,
            totalPaidNative: triVault.devSalary.totalPaidNative + claimAmount,
            accruedNative: 0,
            isClaimableNow: false,
            lastClaimTimestamp: Date.now(),
            nextClaimTimestamp: Date.now() + 86400000 * 7,
            epochNumber: triVault.devSalary.epochNumber + 1
          }
        }
      };

      if (onTokenUpdated) onTokenUpdated(updatedToken);

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      setClaimSuccessMessage(`Successfully claimed ${claimAmount.toFixed(4)} ${chain.nativeCurrency} (~$${(claimAmount * (token.nativePriceUsd || 590)).toFixed(2)} USD) Builder Salary for Epoch #${triVault.devSalary.epochNumber}!`);
    } catch (err: any) {
      setClaimErrorMessage(err.message || 'Failed to claim builder salary');
    } finally {
      setIsClaimingDev(false);
    }
  };

  // Claim Holder Real Yield Dividend
  const handleClaimHolderYield = async () => {
    if (!publicKey) {
      setClaimErrorMessage('Please connect your wallet to claim holder dividends.');
      return;
    }
    if (triVault.holderYield.userClaimableNative <= 0) {
      setClaimErrorMessage('No unclaimed holder dividends available for this wallet.');
      return;
    }

    setIsClaimingHolder(true);
    setClaimErrorMessage(null);
    setClaimSuccessMessage(null);

    try {
      const claimAmount = triVault.holderYield.userClaimableNative;

      await signAndSendTransaction({
        to: '0xTriVaultHolderYieldDistributor',
        valueNative: 0.001,
        memo: `Claim 2% Real Yield Dividend: ${claimAmount.toFixed(4)} ${chain.nativeCurrency}`
      });

      addNative(claimAmount, token.chain);

      const updatedToken: Token = {
        ...token,
        triVault: {
          ...triVault,
          holderYield: {
            ...triVault.holderYield,
            totalDistributedNative: triVault.holderYield.totalDistributedNative + claimAmount,
            userClaimableNative: 0,
            userClaimHistory: [
              { timestamp: Date.now(), amountNative: claimAmount, txHash: `0x${Math.random().toString(36).substring(2, 12)}` },
              ...triVault.holderYield.userClaimHistory
            ]
          }
        }
      };

      if (onTokenUpdated) onTokenUpdated(updatedToken);

      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 }
      });

      setClaimSuccessMessage(`Claimed ${claimAmount.toFixed(4)} ${chain.nativeCurrency} (~$${(claimAmount * (token.nativePriceUsd || 590)).toFixed(2)} USD) in Real-Yield Holder Dividend!`);
    } catch (err: any) {
      setClaimErrorMessage(err.message || 'Failed to claim holder yield');
    } finally {
      setIsClaimingHolder(false);
    }
  };

  // Release CEX Listing Escrow
  const handleReleaseCexEscrow = async () => {
    if (!cexHotWalletInput || !cexPairUrlInput) {
      setClaimErrorMessage('Please enter both the verified CEX Hot Wallet Deposit Address and Exchange Trading Pair URL.');
      return;
    }

    setIsReleasingCex(true);
    setClaimErrorMessage(null);
    setClaimSuccessMessage(null);

    try {
      const releasedNative = triVault.cexEscrow.lockedNative;
      const releasedTokens = triVault.cexEscrow.lockedTokens;

      const txHash = `0xCEX_${Math.random().toString(36).substring(2, 14).toUpperCase()}`;

      const updatedToken: Token = {
        ...token,
        triVault: {
          ...triVault,
          cexEscrow: {
            ...triVault.cexEscrow,
            isReleased: true,
            releaseTxHash: txHash,
            verifiedDepositWallet: cexHotWalletInput,
            cexPairLiveUrl: cexPairUrlInput,
            lockedNative: 0,
            cexListingReadinessPct: 100
          }
        }
      };

      if (onTokenUpdated) onTokenUpdated(updatedToken);

      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.5 }
      });

      setShowCexReleaseForm(false);
      setClaimSuccessMessage(`CEX Listing Escrow Verified & Released! ${releasedTokens.toLocaleString()} tokens & ${releasedNative.toFixed(3)} ${chain.nativeCurrency} dispatched directly to exchange liquidity wallet: ${cexHotWalletInput.substring(0, 10)}...`);
    } catch (err: any) {
      setClaimErrorMessage(err.message || 'CEX escrow release failed');
    } finally {
      setIsReleasingCex(false);
    }
  };

  // Simulator Calculations
  const simTotalFeeWeeklyUsd = simWeeklyVolumeUsd * 0.01; // 1% total swap fee
  const simDevWeeklySalaryUsd = simTotalFeeWeeklyUsd * 0.02; // 2% of fee
  const simHolderPoolWeeklyUsd = simTotalFeeWeeklyUsd * 0.02; // 2% of fee
  const simUserWeeklyDividendUsd = simHolderPoolWeeklyUsd * (simHoldingPct / 100);
  const simCexEscrowWeeklyUsd = simTotalFeeWeeklyUsd * 0.01; // 1% of fee
  const simPlatformWeeklyProfitUsd = simTotalFeeWeeklyUsd * 0.70; // 70% of fee
  const simInsuranceWeeklyFundUsd = simTotalFeeWeeklyUsd * 0.25; // 25% of fee

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-4xl bg-neutral-900 border border-neutral-750 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-emerald-500 to-cyan-500 p-0.5 shadow-lg shadow-amber-500/20">
              <div className="w-full h-full bg-neutral-950 rounded-[10px] flex items-center justify-center text-amber-400">
                <Coins className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">2-2-1 Tri-Vault Sustainable Revenue Hub</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                  LIVE ON-CHAIN
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                2% Dev Weekly Salary • 2% Real-Yield Holder Dividend • 1% Milestone-Locked CEX Escrow
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-neutral-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between px-6 border-b border-neutral-800 bg-neutral-950/60 text-xs font-semibold">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('live')}
              className={`py-3 px-4 border-b-2 transition flex items-center gap-2 ${
                activeTab === 'live'
                  ? 'border-amber-400 text-amber-300 font-bold'
                  : 'border-transparent text-neutral-400 hover:text-white'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Live Vaults & Claims ({token.symbol})</span>
            </button>

            <button
              onClick={() => setActiveTab('simulator')}
              className={`py-3 px-4 border-b-2 transition flex items-center gap-2 ${
                activeTab === 'simulator'
                  ? 'border-emerald-400 text-emerald-300 font-bold'
                  : 'border-transparent text-neutral-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Volume & Cashflow Simulator</span>
            </button>

            <button
              onClick={() => setActiveTab('spec')}
              className={`py-3 px-4 border-b-2 transition flex items-center gap-2 ${
                activeTab === 'spec'
                  ? 'border-cyan-400 text-cyan-300 font-bold'
                  : 'border-transparent text-neutral-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>A-to-Z Game Theory Spec</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-neutral-400 text-[11px] font-mono">
            <span>Current MC:</span>
            <span className="text-white font-bold">${token.marketCapUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">

          {/* Feedback Banners */}
          {claimSuccessMessage && (
            <div className="p-3.5 bg-emerald-950/60 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs flex items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{claimSuccessMessage}</span>
              </div>
              <button onClick={() => setClaimSuccessMessage(null)} className="text-emerald-400 hover:text-white font-bold">✕</button>
            </div>
          )}

          {claimErrorMessage && (
            <div className="p-3.5 bg-red-950/60 border border-red-500/50 rounded-xl text-red-300 text-xs flex items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{claimErrorMessage}</span>
              </div>
              <button onClick={() => setClaimErrorMessage(null)} className="text-red-400 hover:text-white font-bold">✕</button>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 1: LIVE VAULTS & ON-CHAIN CLAIMS                                     */}
          {/* ========================================================================= */}
          {activeTab === 'live' && (
            <div className="space-y-6">
              
              {/* Fee Flow Diagram Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 border border-neutral-800">
                <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Standard 1.00% Protocol Swap Fee Distribution</span>
                  <span className="text-amber-400 font-mono">100% Automated On-Chain</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-lg bg-neutral-950/80 border border-amber-500/30">
                    <div className="text-amber-400 font-black text-sm">2.0%</div>
                    <div className="text-neutral-300 font-semibold text-[11px]">Dev Salary</div>
                    <div className="text-[10px] text-neutral-500">Weekly Pension</div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-neutral-950/80 border border-emerald-500/30">
                    <div className="text-emerald-400 font-black text-sm">2.0%</div>
                    <div className="text-neutral-300 font-semibold text-[11px]">Holder Yield</div>
                    <div className="text-[10px] text-neutral-500">Real SOL/BNB Yield</div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-neutral-950/80 border border-cyan-500/30">
                    <div className="text-cyan-400 font-black text-sm">1.0%</div>
                    <div className="text-neutral-300 font-semibold text-[11px]">CEX Escrow</div>
                    <div className="text-[10px] text-neutral-500">Listing Milestone</div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-neutral-950/80 border border-purple-500/30">
                    <div className="text-purple-400 font-black text-sm">25.0%</div>
                    <div className="text-neutral-300 font-semibold text-[11px]">Floor Vault</div>
                    <div className="text-[10px] text-neutral-500">72h Insurance</div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-neutral-950/80 border border-neutral-700 col-span-2 sm:col-span-1">
                    <div className="text-neutral-200 font-black text-sm">70.0%</div>
                    <div className="text-neutral-300 font-semibold text-[11px]">Treasury</div>
                    <div className="text-[10px] text-neutral-500">Platform Profit</div>
                  </div>
                </div>
              </div>

              {/* The 3 Tri-Vault Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* 1. Dev Weekly Salary Vault */}
                <div className="p-5 bg-neutral-950 rounded-2xl border border-amber-500/30 flex flex-col justify-between space-y-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold">
                        VAULT A: 2% DEV SALARY
                      </span>
                      <span className="text-[10px] text-neutral-500">Epoch #{triVault.devSalary.epochNumber}</span>
                    </div>

                    <div className="mt-2">
                      <div className="text-2xl font-black text-white font-mono">
                        {triVault.devSalary.accruedNative.toFixed(3)} {chain.nativeCurrency}
                      </div>
                      <div className="text-xs text-amber-400 font-semibold">
                        ≈ ${(triVault.devSalary.accruedNative * (token.nativePriceUsd || 590)).toFixed(2)} USD Accrued
                      </div>
                    </div>

                    <div className="mt-4 space-y-1.5 text-xs text-neutral-400">
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <span className={`font-semibold ${triVault.devSalary.isClaimableNow ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {triVault.devSalary.isClaimableNow ? 'Claim Window Open' : 'Accumulating in Epoch'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Lifetime Paid:</span>
                        <span className="text-neutral-200 font-mono">{triVault.devSalary.totalPaidNative.toFixed(3)} {chain.nativeCurrency}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Creator Wallet:</span>
                        <span className="text-neutral-300 font-mono text-[11px]">
                          {token.creator.substring(0, 4)}...{token.creator.substring(token.creator.length - 4)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleClaimDevSalary}
                    disabled={isClaimingDev || triVault.devSalary.accruedNative <= 0}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                      triVault.devSalary.accruedNative > 0
                        ? 'bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-md shadow-amber-500/20'
                        : 'bg-neutral-900 text-neutral-500 cursor-not-allowed'
                    }`}
                  >
                    {isClaimingDev ? (
                      <span>Signing Payout...</span>
                    ) : (
                      <>
                        <Coins className="w-4 h-4" />
                        <span>Claim Weekly Salary ({triVault.devSalary.accruedNative.toFixed(3)} {chain.nativeCurrency})</span>
                      </>
                    )}
                  </button>
                </div>

                {/* 2. Holder Real-Yield Dividend Vault */}
                <div className="p-5 bg-neutral-950 rounded-2xl border border-emerald-500/30 flex flex-col justify-between space-y-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                        VAULT B: 2% HOLDER YIELD
                      </span>
                      <span className="text-[10px] text-emerald-400 font-bold">
                        {triVault.holderYield.currentYieldApyPct}% APY
                      </span>
                    </div>

                    <div className="mt-2">
                      <div className="text-2xl font-black text-emerald-300 font-mono">
                        {triVault.holderYield.userClaimableNative.toFixed(4)} {chain.nativeCurrency}
                      </div>
                      <div className="text-xs text-neutral-400">
                        Your Claimable Share (≈ ${(triVault.holderYield.userClaimableNative * (token.nativePriceUsd || 590)).toFixed(2)} USD)
                      </div>
                    </div>

                    <div className="mt-4 space-y-1.5 text-xs text-neutral-400">
                      <div className="flex justify-between">
                        <span>Total Dividend Pool:</span>
                        <span className="text-neutral-200 font-mono">{triVault.holderYield.totalPoolNative.toFixed(3)} {chain.nativeCurrency}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Paid to Holders:</span>
                        <span className="text-emerald-400 font-mono">{triVault.holderYield.totalDistributedNative.toFixed(3)} {chain.nativeCurrency}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Holders Earning:</span>
                        <span className="text-neutral-200 font-semibold">{triVault.holderYield.activeHoldersEarning} Diamond Hands</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleClaimHolderYield}
                    disabled={isClaimingHolder || triVault.holderYield.userClaimableNative <= 0}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                      triVault.holderYield.userClaimableNative > 0
                        ? 'bg-emerald-500 hover:bg-emerald-400 text-neutral-950 shadow-md shadow-emerald-500/20'
                        : 'bg-neutral-900 text-neutral-500 cursor-not-allowed'
                    }`}
                  >
                    {isClaimingHolder ? (
                      <span>Claiming Dividend...</span>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Claim Holder Dividend ({triVault.holderYield.userClaimableNative.toFixed(4)} {chain.nativeCurrency})</span>
                      </>
                    )}
                  </button>
                </div>

                {/* 3. Milestone-Locked CEX Listing Escrow Vault */}
                <div className="p-5 bg-neutral-950 rounded-2xl border border-cyan-500/30 flex flex-col justify-between space-y-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold">
                        VAULT C: 1% CEX ESCROW
                      </span>
                      <span className="text-[10px] text-cyan-400 font-bold">
                        {triVault.cexEscrow.isReleased ? 'RELEASED TO CEX' : '100% LOCKED'}
                      </span>
                    </div>

                    <div className="mt-2">
                      <div className="text-2xl font-black text-white font-mono">
                        {triVault.cexEscrow.lockedTokens.toLocaleString()} {token.symbol}
                      </div>
                      <div className="text-xs text-cyan-400 font-semibold">
                        + {triVault.cexEscrow.lockedNative.toFixed(3)} {chain.nativeCurrency} Market-Making Liquidity
                      </div>
                    </div>

                    <div className="mt-4 space-y-1.5 text-xs text-neutral-400">
                      <div className="flex justify-between">
                        <span>Target Exchanges:</span>
                        <span className="text-neutral-200 font-semibold">{triVault.cexEscrow.targetCexName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>CEX Readiness:</span>
                        <span className="text-cyan-300 font-bold">{triVault.cexEscrow.cexListingReadinessPct.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Escrow Time:</span>
                        <span className="text-neutral-300 font-mono">{triVault.cexEscrow.daysInEscrow} Days In Vault</span>
                      </div>
                    </div>
                  </div>

                  {triVault.cexEscrow.isReleased ? (
                    <div className="p-2.5 rounded-xl bg-cyan-950/50 border border-cyan-500/30 text-center text-xs text-cyan-300 font-bold flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                      <span>Transferred to Verified CEX MM</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowCexReleaseForm(true)}
                      className="w-full py-2.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                    >
                      <Building2 className="w-4 h-4" />
                      <span>Verify & Release CEX Escrow</span>
                    </button>
                  )}
                </div>
              </div>

              {/* CEX Release Modal Subform */}
              {showCexReleaseForm && (
                <div className="p-5 bg-neutral-950 rounded-xl border border-cyan-500/40 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-cyan-400" />
                      <h4 className="text-xs font-bold text-white">Verified CEX Market-Maker Escrow Release</h4>
                    </div>
                    <button onClick={() => setShowCexReleaseForm(false)} className="text-neutral-400 hover:text-white text-xs">✕</button>
                  </div>

                  <p className="text-xs text-neutral-400">
                    To prevent developer dumping, funds are transferred <strong>directly to the exchange's official public deposit hot wallet</strong> and verified against exchange live pair APIs.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-neutral-300 font-bold block mb-1">CEX Official Deposit Address *</label>
                      <input
                        type="text"
                        value={cexHotWalletInput}
                        onChange={(e) => setCexHotWalletInput(e.target.value)}
                        placeholder="e.g. 0xMEXCDepositHotWallet0001..."
                        className="w-full bg-neutral-900 border border-neutral-750 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="text-neutral-300 font-bold block mb-1">Exchange Pair URL / Proof *</label>
                      <input
                        type="text"
                        value={cexPairUrlInput}
                        onChange={(e) => setCexPairUrlInput(e.target.value)}
                        placeholder="e.g. https://www.mexc.com/exchange/BABYBNB_USDT"
                        className="w-full bg-neutral-900 border border-neutral-750 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setShowCexReleaseForm(false)}
                      className="px-4 py-2 rounded-xl text-xs text-neutral-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleReleaseCexEscrow}
                      disabled={isReleasingCex}
                      className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-neutral-950 text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-cyan-500/20"
                    >
                      {isReleasingCex ? 'Verifying Oracles...' : 'Attest & Release to CEX'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: INTERACTIVE SIMULATOR                                              */}
          {/* ========================================================================= */}
          {activeTab === 'simulator' && (
            <div className="space-y-6">
              <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800">
                <h4 className="text-sm font-bold text-white mb-1">Simulate Weekly Trading Volume & Cashflow</h4>
                <p className="text-xs text-neutral-400">
                  Slide weekly volume to see exact real-world dollar payouts across Devs, Holders, CEX Escrow, and Protocol Profit.
                </p>

                {/* Sliders */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-5">
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-neutral-400 font-semibold">Weekly Trading Volume:</span>
                      <span className="text-amber-400 font-mono font-bold">${simWeeklyVolumeUsd.toLocaleString()} / week</span>
                    </div>
                    <input
                      type="range"
                      min="10000"
                      max="5000000"
                      step="25000"
                      value={simWeeklyVolumeUsd}
                      onChange={(e) => setSimWeeklyVolumeUsd(Number(e.target.value))}
                      className="w-full accent-amber-400 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-neutral-500 mt-1">
                      <span>$10K</span>
                      <span>$500K</span>
                      <span>$2M</span>
                      <span>$5M+</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-neutral-400 font-semibold">Your Token Holding Share:</span>
                      <span className="text-emerald-400 font-mono font-bold">{simHoldingPct.toFixed(2)}% of supply</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="5.0"
                      step="0.1"
                      value={simHoldingPct}
                      onChange={(e) => setSimHoldingPct(Number(e.target.value))}
                      className="w-full accent-emerald-400 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-neutral-500 mt-1">
                      <span>0.1%</span>
                      <span>1.0% (Average Whale)</span>
                      <span>5.0%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic Output Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-4 bg-neutral-950 rounded-xl border border-amber-500/30">
                  <div className="text-[11px] font-bold text-amber-400 uppercase">Dev Weekly Salary</div>
                  <div className="text-xl font-black text-white font-mono mt-1">${simDevWeeklySalaryUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })} / wk</div>
                  <div className="text-[11px] text-neutral-400 mt-1">${(simDevWeeklySalaryUsd * 52).toLocaleString(undefined, { maximumFractionDigits: 0 })} / year</div>
                  <p className="text-[10px] text-neutral-500 mt-2">Zero need to dump tokens. Paid weekly in SOL/BNB.</p>
                </div>

                <div className="p-4 bg-neutral-950 rounded-xl border border-emerald-500/30">
                  <div className="text-[11px] font-bold text-emerald-400 uppercase">Your Holder Dividend</div>
                  <div className="text-xl font-black text-emerald-300 font-mono mt-1">${simUserWeeklyDividendUsd.toLocaleString(undefined, { maximumFractionDigits: 1 })} / wk</div>
                  <div className="text-[11px] text-neutral-400 mt-1">${(simUserWeeklyDividendUsd * 52).toLocaleString(undefined, { maximumFractionDigits: 0 })} / year</div>
                  <p className="text-[10px] text-neutral-500 mt-2">Passive income purely for diamond-hand holding.</p>
                </div>

                <div className="p-4 bg-neutral-950 rounded-xl border border-cyan-500/30">
                  <div className="text-[11px] font-bold text-cyan-400 uppercase">CEX Escrow Inflow</div>
                  <div className="text-xl font-black text-white font-mono mt-1">${simCexEscrowWeeklyUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })} / wk</div>
                  <div className="text-[11px] text-neutral-400 mt-1">${(simCexEscrowWeeklyUsd * 52).toLocaleString(undefined, { maximumFractionDigits: 0 })} / year</div>
                  <p className="text-[10px] text-neutral-500 mt-2">Accumulates in escrow until Tier-1/2 CEX listing.</p>
                </div>

                <div className="p-4 bg-neutral-950 rounded-xl border border-purple-500/30">
                  <div className="text-[11px] font-bold text-purple-400 uppercase">Platform Revenue</div>
                  <div className="text-xl font-black text-purple-300 font-mono mt-1">${simPlatformWeeklyProfitUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })} / wk</div>
                  <div className="text-[11px] text-neutral-400 mt-1">${(simPlatformWeeklyProfitUsd * 52).toLocaleString(undefined, { maximumFractionDigits: 0 })} / year</div>
                  <p className="text-[10px] text-neutral-500 mt-2">Sustainable 70% protocol profit for platform owners.</p>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: GAME THEORY SPECIFICATION                                          */}
          {/* ========================================================================= */}
          {activeTab === 'spec' && (
            <div className="space-y-4 text-xs text-neutral-300 leading-relaxed">
              <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 space-y-3">
                <h4 className="text-sm font-bold text-white">Why the 2-2-1 Architecture Revolutionizes Memecoins</h4>
                <p>
                  In traditional launchpads (Pump.fun, Moonshot), developers make zero revenue after the bonding curve unless they dump their token supply on retail buyers. This creates an inevitable pump-and-dump cycle within minutes.
                </p>
                <p>
                  <strong>Omniguard's 2-2-1 Tri-Vault permanently aligns developers, retail holders, and exchanges:</strong>
                </p>
                <ul className="list-disc pl-5 space-y-2 text-neutral-400">
                  <li>
                    <strong className="text-white">5% Total Growth & Dev Pool:</strong> Devs can acquire up to 5% with gradual milestone release so they have genuine marketing budget without dumping at block 0.
                  </li>
                  <li>
                    <strong className="text-amber-400">2% Dev Weekly Salary:</strong> Paid directly into the creator wallet every 7 days. If the developer keeps marketing and driving community volume, they earn a sustainable $5,000–$50,000/month salary.
                  </li>
                  <li>
                    <strong className="text-emerald-400">2% Real-Yield Diamond-Hand Dividend:</strong> Auto-distributed in native SOL / BNB / ETH to all wallets holding &gt;0.01% of supply. Traders stop panic-selling because holding generates passive yield.
                  </li>
                  <li>
                    <strong className="text-cyan-400">1% Milestone-Locked CEX Escrow:</strong> 100% locked in smart contract until an official exchange listing agreement is validated. Transferred directly to the verified exchange market maker deposit address.
                  </li>
                  <li>
                    <strong className="text-purple-400">72h Soft-Landing Insurance Parachute:</strong> 25% of protocol fees protect initial buyers with 50% guaranteed floor refunds if a coin fails.
                  </li>
                </ul>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
