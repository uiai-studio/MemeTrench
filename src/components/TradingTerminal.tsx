import React, { useState, useEffect } from 'react';
import { Token, UserPosition, Trade, DevBadge, AdBanner } from '../types';
import { useWallet } from '../context/WalletContext';
import { SUPPORTED_CHAINS } from '../data/chainConfig';
import { TriVaultCard } from './TriVaultCard';
import { DevBadgeDisplay } from './DevBadgeDisplay';
import { AdBannerPlacement } from './AdBannerPlacement';
import { TokenAvatar } from './TokenAvatar';
import confetti from 'canvas-confetti';
import { 
  ShieldCheck, 
  Zap, 
  ArrowDownUp, 
  Lock, 
  Unlock, 
  Clock, 
  TrendingUp, 
  Rocket, 
  Sparkles, 
  Flame, 
  AlertCircle, 
  CheckCircle2, 
  ExternalLink,
  Percent,
  Coins,
  Activity,
  Binary,
  Radio,
  Vote,
  Layers,
  HelpCircle,
  Megaphone
} from 'lucide-react';

interface TradingTerminalProps {
  token: Token;
  userPosition: UserPosition | null;
  onSwapSuccess: (trade: Trade, updatedToken: Token, updatedPos: UserPosition) => void;
  onOpenSoftLanding: () => void;
  onOpenOracleHealth: () => void;
  onOpenForensics: () => void;
  onOpenCampaignStudio: () => void;
  onClaimInsurance: () => void;
  onOpenTriVaultModal?: () => void;
  onOpenBadgeModal?: (badge?: DevBadge) => void;
  onOpenAdAuctionModal?: () => void;
  banners?: AdBanner[];
  onTokenUpdated?: (updatedToken: Token) => void;
}

export const TradingTerminal: React.FC<TradingTerminalProps> = ({
  token,
  userPosition,
  onSwapSuccess,
  onOpenSoftLanding,
  onOpenOracleHealth,
  onOpenForensics,
  onOpenCampaignStudio,
  onClaimInsurance,
  onOpenTriVaultModal,
  onOpenBadgeModal,
  onOpenAdAuctionModal,
  banners = [],
  onTokenUpdated
}) => {
  const { 
    publicKey, 
    activeChain, 
    currentNativeBalance, 
    deductNative, 
    addNative, 
    isRealExtension,
    signAndSendTransaction 
  } = useWallet();

  const chain = SUPPORTED_CHAINS[token.chain] || SUPPORTED_CHAINS['bsc'];

  // Swap State
  const [swapMode, setSwapMode] = useState<'BUY' | 'SELL'>('BUY');
  const [nativeAmount, setNativeAmount] = useState<string>(
    token.chain === 'bsc' ? '0.1' : token.chain === 'solana' ? '0.5' : '0.05'
  );
  const [tokenAmount, setTokenAmount] = useState<string>('');
  const [usePrivateMempool, setUsePrivateMempool] = useState<boolean>(true);
  const [isSwapping, setIsSwapping] = useState<boolean>(false);
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);
  const [swapError, setSwapError] = useState<string | null>(null);

  // Timeframe and Chart State
  const [timeframe, setTimeframe] = useState<'1m' | '5m' | '15m' | '1h' | '1D'>('15m');
  const [countdown, setCountdown] = useState<string>('');
  const [cooldownCountdown, setCooldownCountdown] = useState<string>('');

  // Live countdown timer for 48h TWAR continuous micro-batch unlock & Anti-Sniping 5-block cooldown
  useEffect(() => {
    const interval = setInterval(() => {
      if (userPosition && userPosition.nextTrancheUnlockTimestamp > 0) {
        const diff = userPosition.nextTrancheUnlockTimestamp - Date.now();
        if (diff > 0) {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const secs = Math.floor((diff % (1000 * 60)) / 1000);
          setCountdown(`${hours}h ${mins}m ${secs}s`);
        } else {
          setCountdown('100% Fully Liquid');
        }
      } else {
        setCountdown('Immediate 20% + Linear TWAR');
      }

      if (userPosition && userPosition.antiSnipingBlocksRemaining > 0) {
        setCooldownCountdown(`${userPosition.antiSnipingBlocksRemaining} blocks (~${userPosition.antiSnipingBlocksRemaining * 3}s)`);
      } else {
        setCooldownCountdown('Cooldown Expired');
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [userPosition]);

  // Dynamic token estimation for Buy/Sell
  const estimatedTokensOut = Number(nativeAmount) > 0
    ? Math.floor((Number(nativeAmount) / token.priceNative) * 0.995)
    : 0;

  const estimatedNativeOut = Number(tokenAmount) > 0
    ? (Number(tokenAmount) * token.priceNative * 0.96) // minus 4% early reflection if applicable
    : 0;

  const handleSwap = async () => {
    if (!publicKey) {
      setSwapError(`Please connect your ${chain.name} wallet first.`);
      return;
    }
    setSwapError(null);
    setIsSwapping(true);

    try {
      if (swapMode === 'BUY') {
        const natVal = Number(nativeAmount);
        if (natVal <= 0) throw new Error(`Enter a valid ${chain.nativeCurrency} amount`);
        if (natVal > currentNativeBalance) throw new Error(`Insufficient ${chain.nativeCurrency} balance in wallet`);

        // Request extension signature if hardware/extension is connected
        const sigResult = await signAndSendTransaction({
          to: '0x8e239Fa910C635B3F27eAb695A8D15c8B0192A4C',
          valueNative: natVal,
          tokenSymbol: token.symbol,
          memo: `Omniguard Buy: ${token.symbol}`
        });

        const res = await fetch('/api/tokens/swap', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userPublicKey: publicKey,
            tokenMint: token.mint,
            chain: token.chain,
            isBuy: true,
            amountInNative: natVal,
            usePrivateMempool,
            txHash: sigResult.txHash
          })
        });

        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Swap failed');

        deductNative(natVal, token.chain);
        setLastTxHash(sigResult.txHash || data.trade.txHash);
        onSwapSuccess(data.trade, data.token, data.userPosition);

        // Confetti on successful trade
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
      } else {
        const tokVal = Number(tokenAmount);
        if (tokVal <= 0) throw new Error('Enter a valid token amount');
        if (!userPosition || tokVal > userPosition.unlockedTokens) {
          throw new Error(`Only ${userPosition?.unlockedTokens.toLocaleString() || 0} unlocked tokens available for transfer.`);
        }
        if (userPosition.antiSnipingBlocksRemaining > 0) {
          throw new Error(`Anti-sniping protection active: cannot sell within 5 blocks of unlock (~${userPosition.antiSnipingBlocksRemaining * 3}s remaining).`);
        }

        const sigResult = await signAndSendTransaction({
          to: '0x8e239Fa910C635B3F27eAb695A8D15c8B0192A4C',
          valueNative: 0,
          tokenSymbol: token.symbol,
          memo: `Omniguard Sell: ${tokVal} ${token.symbol}`
        });

        const res = await fetch('/api/tokens/swap', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userPublicKey: publicKey,
            tokenMint: token.mint,
            chain: token.chain,
            isBuy: false,
            amountInTokens: tokVal,
            usePrivateMempool,
            txHash: sigResult.txHash
          })
        });

        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Sell failed');

        addNative(data.trade.nativeAmount, token.chain);
        setLastTxHash(sigResult.txHash || data.trade.txHash);
        onSwapSuccess(data.trade, data.token, data.userPosition);
      }
    } catch (err: any) {
      setSwapError(err.message || 'Transaction reverted');
    } finally {
      setIsSwapping(false);
    }
  };

  const mc = token.marketCapUsd;
  const isDangerZone = mc >= 80000 && mc < 100000;

  return (
    <div className="w-full space-y-4">
      {/* Top Token Overview Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-neutral-800 bg-neutral-950/90 p-4 backdrop-blur-md">
        <div className="flex items-center gap-3.5">
          <TokenAvatar
            src={token.image}
            symbol={token.symbol}
            name={token.name}
            chain={token.chain}
            size="lg"
            className="ring-2 ring-amber-500/30 shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white">{token.name}</h1>
              <span className="font-mono text-sm font-semibold text-amber-400">${token.symbol}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${chain.badgeBg} ${chain.badgeText} ${chain.badgeBorder} font-bold font-mono`}>
                {chain.name}
              </span>
              <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[11px] font-mono font-bold text-emerald-400 border border-emerald-500/30">
                TWAR 48h Linear Vesting Active
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono text-neutral-400 mt-0.5">
              <span>Contract: {token.mint.substring(0, 6)}...{token.mint.substring(token.mint.length - 4)}</span>
              <span>•</span>
              <span>Dev Supply: <strong className="text-purple-400">{token.devAllocationPercent}% (Max 1.5% Cap)</strong></span>
              <span>•</span>
              <span>DEX Target: <strong className="text-amber-400">{chain.dexName} ({token.graduationProgressPct.toFixed(1)}%)</strong></span>
            </div>

            {/* Developer Trust Badges */}
            <div className="flex items-center gap-2 mt-2 pt-1.5 border-t border-neutral-800/80">
              <span className="text-[11px] font-mono text-neutral-400">Dev Badges:</span>
              <DevBadgeDisplay 
                badges={token.devBadges} 
                onOpenBadgeModal={onOpenBadgeModal} 
                size="sm"
              />
              {onOpenBadgeModal && (
                <button
                  type="button"
                  onClick={() => onOpenBadgeModal()}
                  className="text-[10px] font-mono text-amber-400 hover:text-amber-300 underline font-semibold ml-1 cursor-pointer"
                >
                  + Attest Badge
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Quick Action Buttons for Unassailable Invariant Modals */}
        <div className="flex items-center gap-2">
          {/* Tri-Vault 2-2-1 Revenue Hub */}
          {onOpenTriVaultModal && (
            <button
              onClick={onOpenTriVaultModal}
              className="flex items-center gap-1.5 rounded-xl border border-amber-500/50 bg-amber-950/30 px-3 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-900/40 transition shadow-sm shadow-amber-500/10"
            >
              <Coins className="h-4 w-4 text-amber-400" />
              <span>2-2-1 Tri-Vault</span>
            </button>
          )}

          {/* Forensics */}
          <button
            onClick={onOpenForensics}
            className="flex items-center gap-1.5 rounded-xl border border-neutral-750 bg-neutral-900 px-3 py-2 text-xs font-semibold text-neutral-200 hover:border-cyan-500 hover:bg-neutral-850 transition"
          >
            <Binary className="h-4 w-4 text-cyan-400" />
            <span>Forensics (Gini {(token.verifiableMetrics?.giniCoefficient ?? 0.28).toFixed(2)})</span>
          </button>

          {/* Dual-Oracle */}
          <button
            onClick={onOpenOracleHealth}
            className="flex items-center gap-1.5 rounded-xl border border-neutral-750 bg-neutral-900 px-3 py-2 text-xs font-semibold text-neutral-200 hover:border-purple-500 hover:bg-neutral-850 transition"
          >
            <Activity className="h-4 w-4 text-purple-400" />
            <span>Oracle ({(token.dualOracle?.divergencePct ?? 0.2).toFixed(2)}% Div)</span>
          </button>

          {/* Soft-Landing */}
          <button
            onClick={onOpenSoftLanding}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
              isDangerZone
                ? 'border-amber-500 bg-amber-500/10 text-amber-300 animate-pulse'
                : 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300 hover:bg-emerald-900/40'
            }`}
          >
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Floor Vault {isDangerZone ? '(Vote Active)' : '(72h)'}</span>
          </button>

          {/* Campaign Studio */}
          <button
            onClick={onOpenCampaignStudio}
            className="flex items-center gap-1.5 rounded-xl border border-purple-500/40 bg-purple-950/30 px-3 py-2 text-xs font-semibold text-purple-300 hover:bg-purple-900/40 transition"
          >
            <Sparkles className="h-4 w-4 text-purple-400" />
            <span>Campaign Studio</span>
          </button>
        </div>
      </div>

      {/* Main Terminal Grid: Left (Chart & Invariants) + Right (Swap Box & Quota) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column (8 cols): Chart, Milestone Progress, Downside Insurance, Trades */}
        <div className="lg:col-span-8 space-y-4">
          {/* Candlestick Chart Card */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950/90 p-4 space-y-3">
            {/* Chart Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-4">
                <div>
                  <span className="font-mono text-2xl font-black text-white">
                    ${token.priceUsd.toFixed(8)}
                  </span>
                  <span className={`ml-2 text-xs font-mono font-bold ${token.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {token.change24h >= 0 ? '+' : ''}{token.change24h}%
                  </span>
                </div>
                <div className="text-xs font-mono text-neutral-400 hidden sm:block">
                  MC: <strong className="text-white">${token.marketCapUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong>
                </div>
              </div>

              {/* Timeframes */}
              <div className="flex items-center gap-1 rounded-xl bg-neutral-900 p-1 border border-neutral-800 text-xs font-mono">
                {(['1m', '5m', '15m', '1h', '1D'] as const).map(tf => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`rounded-lg px-2.5 py-1 transition-colors ${
                      timeframe === tf ? 'bg-amber-500 text-neutral-950 font-bold' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            {/* Canvas / Visual Candle Chart */}
            <div className="relative h-72 w-full rounded-xl bg-neutral-900/50 p-2 overflow-hidden border border-neutral-800/40">
              <svg className="w-full h-full" viewBox="0 0 800 260" preserveAspectRatio="none">
                {/* Background Grid Lines */}
                <line x1="0" y1="65" x2="800" y2="65" stroke="#27272a" strokeDasharray="3 3" />
                <line x1="0" y1="130" x2="800" y2="130" stroke="#27272a" strokeDasharray="3 3" />
                <line x1="0" y1="195" x2="800" y2="195" stroke="#27272a" strokeDasharray="3 3" />

                {/* Simulated Candlesticks */}
                {token.candleHistory.slice(-35).map((candle, idx) => {
                  const minPrice = Math.min(...token.candleHistory.map(c => c.low)) * 0.95;
                  const maxPrice = Math.max(...token.candleHistory.map(c => c.high)) * 1.05;
                  const range = maxPrice - minPrice || 1;

                  const x = 20 + idx * 22;
                  const openY = 240 - ((candle.open - minPrice) / range) * 220;
                  const closeY = 240 - ((candle.close - minPrice) / range) * 220;
                  const highY = 240 - ((candle.high - minPrice) / range) * 220;
                  const lowY = 240 - ((candle.low - minPrice) / range) * 220;
                  const isGreen = candle.close >= candle.open;

                  return (
                    <g key={idx}>
                      <line
                        x1={x + 5}
                        y1={highY}
                        x2={x + 5}
                        y2={lowY}
                        stroke={isGreen ? '#34d399' : '#f87171'}
                        strokeWidth="1.5"
                      />
                      <rect
                        x={x}
                        y={Math.min(openY, closeY)}
                        width="10"
                        height={Math.max(3, Math.abs(closeY - openY))}
                        fill={isGreen ? '#34d399' : '#f87171'}
                        rx="1"
                      />
                    </g>
                  );
                })}

                {/* EMA 20 Overlay Line */}
                <path
                  d="M 20 180 Q 200 150 400 130 T 780 70"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="2"
                  strokeDasharray="4 2"
                />
              </svg>

              {/* EMA Legend */}
              <div className="absolute bottom-2 left-3 flex items-center gap-3 text-[10px] font-mono">
                <span className="flex items-center gap-1 text-amber-400">
                  <span className="h-1.5 w-3 bg-amber-400 inline-block" /> EMA 20
                </span>
                <span className="flex items-center gap-1 text-purple-400">
                  <span className="h-1.5 w-3 bg-purple-400 inline-block" /> {chain.mevProtectionType}
                </span>
              </div>
            </div>
          </div>

          {/* Milestone Progress Matrix ($100k, $300k DEX, $1M, $3M) */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950/90 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Rocket className="h-4 w-4 text-amber-400" />
                <h2 className="text-sm font-bold text-white">Dual-Oracle Verified Milestone Unlocks</h2>
              </div>
              <span className="text-xs font-mono text-neutral-400">
                Dev Tokens Liquid: <strong className="text-emerald-400">{token.milestones?.m1?.reached ? '20%' : '0% (Locked)'}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 font-mono text-xs">
              {/* M1: $100k */}
              <div className={`rounded-xl p-3 border ${
                token.milestones?.m1?.reached ? 'border-emerald-500/40 bg-emerald-950/20' : 'border-neutral-800 bg-neutral-900/60'
              }`}>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-neutral-400">Milestone 1</span>
                  {token.milestones?.m1?.reached ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Lock className="h-3.5 w-3.5 text-neutral-500" />
                  )}
                </div>
                <div className="mt-1 font-bold text-white">$100K MC</div>
                <div className="text-[10px] text-emerald-400 font-semibold mt-1">20% Dev Unlocked</div>
              </div>

              {/* M2: $300k DEX Graduation */}
              <div className={`rounded-xl p-3 border ${
                token.milestones?.m2?.reached ? 'border-purple-500/40 bg-purple-950/20' : 'border-neutral-800 bg-neutral-900/60'
              }`}>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-neutral-400">M2 ({chain.dexName})</span>
                  {token.milestones?.m2?.reached ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-purple-400" />
                  ) : (
                    <Lock className="h-3.5 w-3.5 text-neutral-500" />
                  )}
                </div>
                <div className="mt-1 font-bold text-purple-300">$300K Grad</div>
                <div className="text-[10px] text-purple-400 font-semibold mt-1">25% Dev Unlocked + LP Burn</div>
              </div>

              {/* M3: $1M */}
              <div className={`rounded-xl p-3 border ${
                token.milestones?.m3?.reached ? 'border-blue-500/40 bg-blue-950/20' : 'border-neutral-800 bg-neutral-900/60'
              }`}>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-neutral-400">Milestone 3</span>
                  {token.milestones?.m3?.reached ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-blue-400" />
                  ) : (
                    <Lock className="h-3.5 w-3.5 text-neutral-500" />
                  )}
                </div>
                <div className="mt-1 font-bold text-white">$1,000,000 MC</div>
                <div className="text-[10px] text-blue-400 font-semibold mt-1">25% Dev Unlocked</div>
              </div>

              {/* M4: $3M */}
              <div className={`rounded-xl p-3 border ${
                token.milestones?.m4?.reached ? 'border-amber-500/40 bg-amber-950/20' : 'border-neutral-800 bg-neutral-900/60'
              }`}>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-neutral-400">Milestone 4</span>
                  {token.milestones?.m4?.reached ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-amber-400" />
                  ) : (
                    <Lock className="h-3.5 w-3.5 text-neutral-500" />
                  )}
                </div>
                <div className="mt-1 font-bold text-white">$3,000,000 MC</div>
                <div className="text-[10px] text-amber-400 font-semibold mt-1">30% Final Dev Unlock</div>
              </div>
            </div>
          </div>

          {/* Soft-Landing Floor Vault Invariant Banner */}
          <div 
            onClick={onOpenSoftLanding}
            className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/20 via-neutral-950/80 to-neutral-950 p-4 space-y-3 cursor-pointer hover:border-emerald-500/50 transition"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="rounded-xl bg-emerald-500/20 p-2 text-emerald-400">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-emerald-300">
                    72-Hour Soft-Landing Floor Vault Protection
                  </h3>
                  <p className="text-xs text-neutral-400">
                    If MC &lt; $80K at 72h: 50% pro-rata refund in {chain.nativeCurrency} + 50% DAO relaunch conversion.
                  </p>
                </div>
              </div>

              <div className="text-right font-mono">
                <div className="text-sm font-bold text-emerald-400">
                  {(token.insuranceVault?.balanceNative || 0).toFixed(2)} {chain.nativeCurrency} Escrowed
                </div>
                <div className="text-[11px] text-neutral-400">
                  {token.insuranceVault?.totalBuyersProtected || 0} Protected Wallets
                </div>
              </div>
            </div>

            {token.insuranceVault?.status === 'RefundActive' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClaimInsurance();
                }}
                className="w-full rounded-xl bg-emerald-500 py-2.5 text-xs font-bold text-neutral-950 hover:bg-emerald-400 shadow-md shadow-emerald-500/20 transition-all"
              >
                Claim Guaranteed 50% Pro-Rata {chain.nativeCurrency} Floor Refund
              </button>
            )}
          </div>
        </div>

        {/* Right Column (4 cols): Swap Box & TWAR Quota */}
        <div className="lg:col-span-4 space-y-4">
          {/* 2-2-1 Tri-Vault Revenue Engine Card */}
          <TriVaultCard 
            token={token} 
            onOpenTriVaultModal={onOpenTriVaultModal || (() => {})} 
            onTokenUpdated={onTokenUpdated}
          />

          <div className="rounded-2xl border border-neutral-800 bg-neutral-950/95 p-4 space-y-4 shadow-xl">
            {/* Buy / Sell Tabs */}
            <div className="grid grid-cols-2 gap-1 rounded-xl bg-neutral-900 p-1 border border-neutral-800">
              <button
                onClick={() => {
                  setSwapMode('BUY');
                  setSwapError(null);
                }}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  swapMode === 'BUY'
                    ? 'bg-amber-500 text-neutral-950 shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Buy ${token.symbol}
              </button>
              <button
                onClick={() => {
                  setSwapMode('SELL');
                  setSwapError(null);
                }}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  swapMode === 'SELL'
                    ? 'bg-red-500 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Sell ${token.symbol}
              </button>
            </div>

            {/* Invariant #1: TWAR 48h Linear Vesting & 5-Block Anti-Sniping Cooldown */}
            <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-3 space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between text-amber-300">
                <span className="flex items-center gap-1.5 font-bold">
                  <Lock className="h-3.5 w-3.5 text-amber-400" />
                  TWAR 48h Linear Unlocking
                </span>
                <span className="font-semibold text-[11px] bg-amber-500/20 px-1.5 py-0.5 rounded text-amber-300">
                  {userPosition ? `${userPosition.unlockedPercentage}% Liquid` : '20% On Swap'}
                </span>
              </div>

              {userPosition ? (
                <div className="space-y-1 text-neutral-300 text-[11px]">
                  <div className="flex justify-between">
                    <span>Unlocked for Sell:</span>
                    <strong className="text-emerald-400">{userPosition.unlockedTokens.toLocaleString()} tokens</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Vesting Over 48h:</span>
                    <strong className="text-neutral-400">{userPosition.lockedTokens.toLocaleString()} tokens</strong>
                  </div>
                  <div className="flex justify-between text-amber-300 font-semibold pt-1 border-t border-amber-500/20">
                    <span>Continuous Linear TWAR:</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {countdown}
                    </span>
                  </div>
                  {userPosition.antiSnipingBlocksRemaining > 0 && (
                    <div className="flex justify-between text-red-400 font-semibold">
                      <span>Anti-Sniping Cooldown:</span>
                      <span>{cooldownCountdown}</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  20% unlocked immediately on swap. The remaining 80% unlocks linearly over 48h with deterministic micro-batch offsets + 5-block anti-sniping cooldown.
                </p>
              )}
            </div>

            {/* Swap Input Form */}
            {swapMode === 'BUY' ? (
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono text-neutral-400">
                    <span>Amount in {chain.nativeCurrency}</span>
                    <span>Balance: {currentNativeBalance.toFixed(3)} {chain.nativeCurrency}</span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      value={nativeAmount}
                      onChange={(e) => setNativeAmount(e.target.value)}
                      placeholder="0.0"
                      className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2.5 text-base font-mono font-bold text-white focus:border-amber-500 focus:outline-none"
                    />
                    <button
                      onClick={() => setNativeAmount((currentNativeBalance * 0.95).toFixed(3))}
                      className="absolute right-2.5 top-2.5 rounded bg-neutral-800 px-2 py-0.5 text-[11px] font-mono text-amber-400 hover:bg-neutral-700"
                    >
                      MAX
                    </button>
                  </div>
                </div>

                {/* Quick Pick Native Buttons */}
                <div className="grid grid-cols-4 gap-1.5 font-mono text-xs">
                  {[
                    token.chain === 'bsc' ? '0.05' : '0.1',
                    token.chain === 'bsc' ? '0.1' : '0.5',
                    token.chain === 'bsc' ? '0.5' : '1.0',
                    token.chain === 'bsc' ? '2.0' : '5.0'
                  ].map(amt => (
                    <button
                      key={amt}
                      onClick={() => setNativeAmount(amt)}
                      className="rounded-lg border border-neutral-800 bg-neutral-900/80 py-1.5 text-neutral-300 hover:border-amber-500 hover:bg-neutral-800 transition-colors"
                    >
                      {amt} {chain.nativeCurrency}
                    </button>
                  ))}
                </div>

                {/* Estimated Output */}
                <div className="rounded-xl bg-neutral-900/60 p-2.5 border border-neutral-800 text-xs font-mono space-y-1">
                  <div className="flex justify-between text-neutral-400">
                    <span>You Receive (Est.):</span>
                    <strong className="text-white">~{estimatedTokensOut.toLocaleString()} ${token.symbol}</strong>
                  </div>
                  <div className="flex justify-between text-neutral-500 text-[11px]">
                    <span>0.25% Escrowed to Floor Vault:</span>
                    <span>{(Number(nativeAmount) * 0.0025).toFixed(4)} {chain.nativeCurrency}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono text-neutral-400">
                    <span>Tokens to Sell</span>
                    <span>Unlocked: {userPosition?.unlockedTokens.toLocaleString() || 0}</span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      value={tokenAmount}
                      onChange={(e) => setTokenAmount(e.target.value)}
                      placeholder="0"
                      className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2.5 text-base font-mono font-bold text-white focus:border-red-500 focus:outline-none"
                    />
                    <button
                      onClick={() => setTokenAmount(userPosition ? userPosition.unlockedTokens.toString() : '0')}
                      className="absolute right-2.5 top-2.5 rounded bg-neutral-800 px-2 py-0.5 text-[11px] font-mono text-red-400 hover:bg-neutral-700"
                    >
                      MAX
                    </button>
                  </div>
                </div>

                {/* Dynamic 4% Reflection Fee Notice */}
                {userPosition && userPosition.unlockedPercentage < 100 && (
                  <div className="rounded-xl bg-amber-950/30 border border-amber-500/30 p-2.5 text-[11px] font-mono text-amber-300 space-y-1">
                    <div className="font-bold flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
                      Early Exit Reflection (4%):
                    </div>
                    <p className="text-neutral-400">
                      Selling prior to full maturity triggers a 4% fee: 2% distributed in {chain.nativeCurrency} to diamond holders, 2% burned.
                    </p>
                  </div>
                )}

                {/* Estimated Native Return */}
                <div className="rounded-xl bg-neutral-900/60 p-2.5 border border-neutral-800 text-xs font-mono flex justify-between">
                  <span className="text-neutral-400">You Receive (Est.):</span>
                  <strong className="text-emerald-400">~{estimatedNativeOut.toFixed(4)} {chain.nativeCurrency}</strong>
                </div>
              </div>
            )}

            {/* Private Mempool Frontrun Shield Toggle */}
            <div className="flex items-center justify-between rounded-xl bg-purple-950/20 border border-purple-500/30 p-2.5 text-xs font-mono">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-purple-400" />
                <div>
                  <div className="font-bold text-purple-300">{chain.mevProtectionType} Active</div>
                  <div className="text-[10px] text-neutral-400">0% frontrun slippage on {chain.name}</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={usePrivateMempool}
                onChange={(e) => setUsePrivateMempool(e.target.checked)}
                className="h-4 w-4 rounded border-neutral-700 text-purple-600 focus:ring-purple-500"
              />
            </div>

            {/* Error / Feedback Message */}
            {swapError && (
              <div className="rounded-xl bg-red-950/40 border border-red-500/40 p-2.5 text-xs font-mono text-red-300">
                {swapError}
              </div>
            )}

            {/* Main Action Button */}
            <button
              onClick={handleSwap}
              disabled={isSwapping}
              className={`w-full rounded-xl py-3 text-sm font-black transition-all shadow-lg active:scale-95 disabled:opacity-50 ${
                swapMode === 'BUY'
                  ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-neutral-950 shadow-amber-500/20 hover:brightness-110'
                  : 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-red-500/20 hover:from-red-400 hover:to-rose-500'
              }`}
            >
              {isSwapping
                ? `Routing Private Bundle on ${chain.name}...`
                : swapMode === 'BUY'
                ? `Buy $${token.symbol} (20% Tranche + TWAR)`
                : `Sell $${token.symbol}`}
            </button>

            {/* Diamond Hand Native Rewards Earned */}
            {userPosition && userPosition.nativeReflectionEarned > 0 && (
              <div className="flex items-center justify-between rounded-xl bg-emerald-950/30 border border-emerald-500/20 p-2.5 text-xs font-mono text-emerald-300">
                <span className="flex items-center gap-1.5">
                  <Coins className="h-3.5 w-3.5" />
                  Diamond Reflection Earned:
                </span>
                <strong>+{userPosition.nativeReflectionEarned.toFixed(4)} {chain.nativeCurrency}</strong>
              </div>
            )}
          </div>

          {/* Sponsored Ad Banner Spot */}
          <AdBannerPlacement
            placement="terminal_sidebar_sponsor"
            banners={banners}
            onOpenAdAuctionModal={onOpenAdAuctionModal || (() => {})}
          />
        </div>
      </div>
    </div>
  );
};
