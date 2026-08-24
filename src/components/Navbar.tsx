import React, { useState } from 'react';
import { useWallet, WalletType } from '../context/WalletContext';
import { SupportedChainId } from '../types';
import { SUPPORTED_CHAINS } from '../data/chainConfig';
import { 
  ShieldCheck, 
  Zap, 
  Search, 
  PlusCircle, 
  Wallet, 
  Sparkles, 
  BookOpen, 
  Radio, 
  ChevronDown, 
  ExternalLink,
  Lock,
  Coins,
  Activity,
  Flame,
  Binary,
  Layers,
  Globe2,
  Cpu,
  Megaphone,
  Award,
  Menu,
  X,
  Check,
  TrendingUp,
  ArrowRightLeft
} from 'lucide-react';

interface NavbarProps {
  onOpenLaunchModal: () => void;
  onOpenArchModal: () => void;
  onOpenResumeModal?: () => void;
  onOpenMainnetHub?: () => void;
  onOpenConcurrencyMatrix?: () => void;
  onOpenTermsModal?: () => void;
  onOpenBscHeatmap?: () => void;
  onOpenOracleHealth?: () => void;
  onOpenSoftLanding?: () => void;
  onOpenCampaignStudio?: () => void;
  onOpenForensics?: () => void;
  onOpenTriVaultModal?: () => void;
  onOpenAdAuctionModal?: () => void;
  onOpenBadgeModal?: () => void;
  onSelectTokenByMint: (mint: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  totalEscrowedSol: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenLaunchModal,
  onOpenArchModal,
  onOpenResumeModal,
  onOpenMainnetHub,
  onOpenConcurrencyMatrix,
  onOpenTermsModal,
  onOpenBscHeatmap,
  onOpenOracleHealth,
  onOpenSoftLanding,
  onOpenCampaignStudio,
  onOpenForensics,
  onOpenTriVaultModal,
  onOpenAdAuctionModal,
  onOpenBadgeModal,
  searchQuery,
  setSearchQuery,
  totalEscrowedSol
}) => {
  const { 
    connected, 
    publicKey, 
    activeChain, 
    currentNativeBalance, 
    walletName, 
    connect, 
    disconnect, 
    requestAirdrop, 
    cluster, 
    setCluster,
    setActiveChain
  } = useWallet();

  const [walletDropdownOpen, setWalletDropdownOpen] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [chainSelectorOpen, setChainSelectorOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeChainConfig = (activeChain && SUPPORTED_CHAINS[activeChain]) 
    ? SUPPORTED_CHAINS[activeChain] 
    : SUPPORTED_CHAINS['bsc'];

  const handleWalletSelect = (type: WalletType) => {
    connect(type);
    setWalletModalOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-800/80 bg-neutral-950/95 backdrop-blur-md">
      {/* Top Network Ticker Bar */}
      <div className="flex h-7 items-center justify-between border-b border-neutral-900 px-3 sm:px-4 text-xs font-mono text-neutral-400 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-3 sm:gap-5 whitespace-nowrap">
          {/* Active Chain Live Feed Status */}
          <div className="flex items-center gap-1.5 text-emerald-400">
            <Radio className="h-3 w-3 animate-pulse text-emerald-400 flex-shrink-0" />
            <span className="font-semibold text-[11px] sm:text-xs">{(activeChainConfig?.name || 'BNB Chain').toUpperCase()} FEED</span>
            <span className="text-neutral-500 text-[10px]">18ms</span>
          </div>

          {/* Native Token Price */}
          <div className="hidden items-center gap-1 sm:flex">
            <span className="text-neutral-500">{activeChainConfig?.nativeCurrency || 'BNB'}:</span>
            <span className="font-medium text-neutral-200">${(activeChainConfig?.nativePriceUsd || 590).toFixed(2)}</span>
            <span className="text-emerald-400 font-semibold">+3.8%</span>
          </div>

          {/* Floor Vault Escrow Metric */}
          <div 
            onClick={onOpenSoftLanding}
            className="hidden items-center gap-1.5 md:flex cursor-pointer hover:text-cyan-300 transition"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
            <span className="text-neutral-500">72H FLOOR ESCROW:</span>
            <span className="font-bold text-cyan-300">ACTIVE</span>
            <span className="text-[10px] text-neutral-500">(50% Parachute)</span>
          </div>

          {/* MEV Protection Status */}
          <div className="hidden items-center gap-1.5 lg:flex text-purple-400">
            <Zap className="h-3.5 w-3.5" />
            <span className="text-neutral-400">MEV SHIELD:</span>
            <span className="font-semibold text-purple-300">{activeChainConfig?.mevProtectionType || 'Private Mempool'}</span>
          </div>
        </div>

        {/* Top Right Quick Controls */}
        <div className="flex items-center gap-2 sm:gap-3 whitespace-nowrap">
          {onOpenResumeModal && (
            <button 
              onClick={onOpenResumeModal}
              className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-semibold transition-colors text-[11px] sm:text-xs"
              title="View & Download Muhammad Idris Umar's Builder Resume PDF"
            >
              <Award className="h-3 w-3 flex-shrink-0" />
              <span className="font-bold">Resume (PDF)</span>
            </button>
          )}

          {onOpenAdAuctionModal && (
            <button 
              onClick={onOpenAdAuctionModal}
              className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 transition-colors text-[11px] font-bold"
              title="Self-serve banner placements with 20% protocol revenue holder distribution"
            >
              <Megaphone className="h-3 w-3 text-emerald-400" />
              <span>Ads & Banners</span>
            </button>
          )}

          {onOpenBadgeModal && (
            <button 
              onClick={() => onOpenBadgeModal()}
              className="hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500/20 hover:text-purple-300 transition-colors text-[11px] font-bold"
              title="Verified Developer Trust Badges and Cryptographic Proofs"
            >
              <ShieldCheck className="h-3 w-3 text-purple-400" />
              <span>Dev Badges</span>
            </button>
          )}

          {onOpenTriVaultModal && (
            <button 
              onClick={onOpenTriVaultModal}
              className="hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 hover:text-amber-300 transition-colors text-[11px] font-bold"
            >
              <Coins className="h-3 w-3 text-amber-400" />
              <span>2-2-1 Tri-Vault</span>
            </button>
          )}

          {onOpenArchModal && (
            <button 
              onClick={onOpenArchModal}
              className="hidden lg:flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold transition-colors text-[11px]"
              title="View & Download Ecosystem Architecture Layout"
            >
              <BookOpen className="h-3 w-3" />
              <span>Architecture</span>
            </button>
          )}

          <div className="flex items-center gap-1 border-l border-neutral-800 pl-2 sm:pl-3">
            <span className="text-[10px] text-neutral-500 hidden sm:inline">NET:</span>
            <button 
              onClick={() => setCluster(cluster === 'mainnet' ? 'testnet' : 'mainnet')}
              className="rounded bg-neutral-900 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400 hover:bg-neutral-800 border border-emerald-500/30"
            >
              {(cluster || 'mainnet').toUpperCase()}
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="flex h-16 items-center justify-between px-3 sm:px-6 gap-2 sm:gap-4">
        {/* Brand Logo & Chain Selector */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative flex h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 via-purple-600 to-cyan-600 p-0.5 shadow-lg shadow-amber-500/20">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-neutral-950">
                <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-base sm:text-lg font-black tracking-wider text-white uppercase font-mono">
                  Meme<span className="text-amber-400">Trench</span><span className="text-neutral-400 text-xs font-normal lowercase hidden sm:inline">.com</span>
                </span>
                <span className="rounded-full bg-amber-500/10 px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-mono font-bold text-amber-400 border border-amber-500/30">
                  LAUNCHPAD
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-neutral-400 hidden md:block">
                Universal 6-Chain Memecoin Launchpad • Powered by Omniguard Protocol
              </p>
            </div>
          </div>
        </div>

        {/* Global Search Bar (Medium & Large screens) */}
        <div className="relative hidden md:flex flex-1 max-w-md items-center mx-2">
          <Search className="absolute left-3 h-4 w-4 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search verified token, contract address, or symbol..."
            className="h-9 w-full rounded-xl border border-neutral-800 bg-neutral-900/90 pl-9 pr-3 text-xs text-neutral-200 placeholder-neutral-500 transition-all focus:border-amber-500 focus:bg-neutral-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 text-xs text-neutral-500 hover:text-neutral-300"
            >
              ✕
            </button>
          )}
        </div>

        {/* Navigation CTAs & Wallet Connector */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* TrenchScreen.com Screener Hub Link */}
          <a
            href="https://trenchscreen.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden xl:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-semibold transition"
            title="Open TrenchScreen.com AI Agent Screener"
          >
            <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>TrenchScreen.com</span>
            <ExternalLink className="w-3 h-3 text-cyan-400" />
          </a>

          {/* Launch Token CTA */}
          <button
            onClick={onOpenLaunchModal}
            className="flex items-center gap-1 sm:gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 px-2.5 sm:px-3.5 py-2 text-xs font-black text-neutral-950 shadow-md shadow-amber-500/25 transition-all hover:brightness-110 active:scale-95 cursor-pointer"
          >
            <PlusCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
            <span>Launch Meme</span>
            <span className="hidden sm:inline font-mono">({activeChainConfig.symbol})</span>
          </button>

          {/* Multi-Chain Wallet Connector */}
          {connected ? (
            <div className="relative">
              <button
                onClick={() => setWalletDropdownOpen(!walletDropdownOpen)}
                className="flex items-center gap-1.5 sm:gap-2 rounded-xl border border-neutral-750 bg-neutral-900 px-2.5 sm:px-3 py-1.5 text-xs text-neutral-200 transition-colors hover:border-neutral-600 hover:bg-neutral-850 cursor-pointer"
              >
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-mono font-bold text-emerald-300 text-[11px] sm:text-xs">
                    {currentNativeBalance.toFixed(2)}
                  </span>
                </div>
                <span className="font-mono text-neutral-400 border-l border-neutral-800 pl-1.5 sm:pl-2 hidden xs:inline">
                  {publicKey?.substring(0, 3)}...{publicKey?.substring(publicKey.length - 3)}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-neutral-400" />
              </button>

              {walletDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl border border-neutral-800 bg-neutral-950 p-3 shadow-2xl z-50">
                  <div className="border-b border-neutral-850 pb-2 mb-2">
                    <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                      {walletName || "Connected Non-Custodial Wallet"}
                    </div>
                    <div className="font-mono text-xs text-white break-all mt-0.5">{publicKey}</div>
                    <div className="mt-2 flex items-center justify-between text-xs bg-neutral-900 p-2 rounded-lg border border-neutral-850">
                      <span className="text-neutral-400">{activeChainConfig.nativeCurrency} Balance:</span>
                      <span className="font-bold text-emerald-400 font-mono">
                        {currentNativeBalance.toFixed(4)} {activeChainConfig.nativeCurrency}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        requestAirdrop(2.0);
                        setWalletDropdownOpen(false);
                      }}
                      className="w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-amber-300 hover:bg-amber-950/50 transition-colors"
                    >
                      <span className="flex items-center gap-1.5">
                        <Coins className="h-3.5 w-3.5" />
                        <span>Claim 2.0 {activeChainConfig.nativeCurrency} Faucet</span>
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        disconnect();
                        setWalletDropdownOpen(false);
                      }}
                      className="w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-red-400 hover:bg-red-950/50 transition-colors"
                    >
                      <span>Disconnect Wallet</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setWalletModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-2.5 sm:px-3 py-2 text-xs font-bold text-amber-400 hover:bg-amber-500/20 hover:text-amber-300 transition-all cursor-pointer"
            >
              <Wallet className="h-3.5 w-3.5" />
              <span>Connect Wallet</span>
            </button>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white md:hidden"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* 🚀 EASILY ACCESSIBLE FAST CHAIN SWITCHER BUTTONS BAR (TOP) */}
      <div className="px-3 sm:px-6 py-2 bg-neutral-900/90 border-t border-neutral-800/80 flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1 text-[11px] font-mono text-neutral-400 mr-2 shrink-0">
          <ArrowRightLeft className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline font-bold text-neutral-300 uppercase tracking-wider">Switch Chain:</span>
        </div>

        {/* The 6 Chain Switcher Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none">
          {Object.values(SUPPORTED_CHAINS).map(c => {
            const isActive = activeChain === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setActiveChain(c.id)}
                className={`px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? `${c.badgeBg} ${c.badgeText} border ${c.badgeBorder} ring-2 ring-amber-500/40 shadow-lg shadow-amber-500/10 scale-105`
                    : 'bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700 hover:bg-neutral-900'
                }`}
                title={`Switch to ${c.name} (${c.dexName})`}
              >
                <span className="text-sm">{c.icon}</span>
                <span>{c.name}</span>
                <span className={`text-[10px] font-mono px-1 py-0.2 rounded ${isActive ? 'bg-black/30' : 'bg-neutral-900 text-neutral-500'}`}>
                  ${c.nativeCurrency}
                </span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
                )}
              </button>
            );
          })}
        </div>

        {/* Active Chain Metric Badge */}
        <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-neutral-800 shrink-0 text-xs font-mono">
          <span className="text-neutral-500">Graduation DEX:</span>
          <span className="text-amber-400 font-bold">{activeChainConfig.dexName}</span>
          <span className="text-neutral-500">({activeChainConfig.speedTps} TPS)</span>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="p-4 bg-neutral-950 border-t border-neutral-800 space-y-3 md:hidden">
          {/* Mobile Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search token, symbol, contract..."
              className="h-9 w-full rounded-xl border border-neutral-800 bg-neutral-900 pl-9 pr-3 text-xs text-neutral-200 placeholder-neutral-500"
            />
          </div>

          {/* Quick links in mobile */}
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
            {onOpenResumeModal && (
              <button
                onClick={() => {
                  onOpenResumeModal();
                  setMobileMenuOpen(false);
                }}
                className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center gap-1.5"
              >
                <Award className="w-4 h-4" />
                <span>Resume (PDF)</span>
              </button>
            )}

            {onOpenAdAuctionModal && (
              <button
                onClick={() => {
                  onOpenAdAuctionModal();
                  setMobileMenuOpen(false);
                }}
                className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center gap-1.5"
              >
                <Megaphone className="w-4 h-4" />
                <span>Ads & Banners</span>
              </button>
            )}

            {onOpenBadgeModal && (
              <button
                onClick={() => {
                  onOpenBadgeModal();
                  setMobileMenuOpen(false);
                }}
                className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Dev Badges</span>
              </button>
            )}

            {onOpenTriVaultModal && (
              <button
                onClick={() => {
                  onOpenTriVaultModal();
                  setMobileMenuOpen(false);
                }}
                className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center justify-center gap-1.5"
              >
                <Coins className="w-4 h-4" />
                <span>2-2-1 Tri-Vault</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Multi-Chain Wallet Selection Modal */}
      {walletModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-750 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Connect Web3 Wallet</h3>
              </div>
              <button onClick={() => setWalletModalOpen(false)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-neutral-400">
              Select your preferred non-custodial wallet for <strong className="text-amber-400">{activeChainConfig.name}</strong> or any supported chain:
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => handleWalletSelect('trustwallet')}
                className="p-3 bg-neutral-950 hover:bg-neutral-800 rounded-xl border border-neutral-800 hover:border-amber-500/50 text-left transition flex items-center gap-2.5 cursor-pointer"
              >
                <span className="text-lg">🛡️</span>
                <div>
                  <div className="text-xs font-bold text-white">Trust Wallet</div>
                  <div className="text-[10px] text-neutral-500">BSC / Multi-Chain</div>
                </div>
              </button>

              <button
                onClick={() => handleWalletSelect('binance')}
                className="p-3 bg-neutral-950 hover:bg-neutral-800 rounded-xl border border-neutral-800 hover:border-amber-500/50 text-left transition flex items-center gap-2.5 cursor-pointer"
              >
                <span className="text-lg">🟡</span>
                <div>
                  <div className="text-xs font-bold text-white">Binance Web3</div>
                  <div className="text-[10px] text-neutral-500">BNB Chain Native</div>
                </div>
              </button>

              <button
                onClick={() => handleWalletSelect('metamask')}
                className="p-3 bg-neutral-950 hover:bg-neutral-800 rounded-xl border border-neutral-800 hover:border-amber-500/50 text-left transition flex items-center gap-2.5 cursor-pointer"
              >
                <span className="text-lg">🦊</span>
                <div>
                  <div className="text-xs font-bold text-white">MetaMask</div>
                  <div className="text-[10px] text-neutral-500">EVM / Base / BSC</div>
                </div>
              </button>

              <button
                onClick={() => handleWalletSelect('phantom')}
                className="p-3 bg-neutral-950 hover:bg-neutral-800 rounded-xl border border-neutral-800 hover:border-purple-500/50 text-left transition flex items-center gap-2.5 cursor-pointer"
              >
                <span className="text-lg">👻</span>
                <div>
                  <div className="text-xs font-bold text-white">Phantom</div>
                  <div className="text-[10px] text-neutral-500">Solana Native</div>
                </div>
              </button>

              <button
                onClick={() => handleWalletSelect('tonkeeper')}
                className="p-3 bg-neutral-950 hover:bg-neutral-800 rounded-xl border border-neutral-800 hover:border-cyan-500/50 text-left transition flex items-center gap-2.5 cursor-pointer"
              >
                <span className="text-lg">💎</span>
                <div>
                  <div className="text-xs font-bold text-white">Tonkeeper</div>
                  <div className="text-[10px] text-neutral-500">TON Network</div>
                </div>
              </button>

              <button
                onClick={() => handleWalletSelect('suiwallet')}
                className="p-3 bg-neutral-950 hover:bg-neutral-800 rounded-xl border border-neutral-800 hover:border-sky-500/50 text-left transition flex items-center gap-2.5 cursor-pointer"
              >
                <span className="text-lg">🌊</span>
                <div>
                  <div className="text-xs font-bold text-white">Sui Wallet</div>
                  <div className="text-[10px] text-neutral-500">Sui Network</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
