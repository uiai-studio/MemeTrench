import React, { useState, useEffect } from 'react';
import { WalletProvider, useWallet } from './context/WalletContext';
import { Navbar } from './components/Navbar';
import { TokenScreener } from './components/TokenScreener';
import { TradingTerminal } from './components/TradingTerminal';
import { SoftLandingDashboardModal } from './components/SoftLandingDashboardModal';
import { OracleHealthMonitorModal } from './components/OracleHealthMonitorModal';
import { VerifiableForensicsModal } from './components/VerifiableForensicsModal';
import { CampaignStudioModal } from './components/CampaignStudioModal';
import { BscHeatmapModal } from './components/BscHeatmapModal';
import { LaunchpadModal } from './components/LaunchpadModal';
import { ArchitectureModal } from './components/ArchitectureModal';
import { TermsModal } from './components/TermsModal';
import { MainnetHubModal } from './components/MainnetHubModal';
import { HighConcurrencyMatrixModal } from './components/HighConcurrencyMatrixModal';
import { TriVaultModal } from './components/TriVaultModal';
import { AdBannerPlacement } from './components/AdBannerPlacement';
import { AdAuctionModal } from './components/AdAuctionModal';
import { DevBadgeModal } from './components/DevBadgeModal';
import { ResumeModal } from './components/ResumeModal';
import { Token, UserPosition, Trade, AdBanner, AdRevenueVaultState, DevBadge } from './types';
import { DEFAULT_TOKENS } from './mockData';
import { INITIAL_AD_BANNERS, INITIAL_AD_REVENUE_VAULT } from './mockAds';
import { Sparkles, Radio, ShieldCheck, Zap, Layers, RefreshCw, Flame, Activity, Binary, Megaphone } from 'lucide-react';

function MainApp() {
  const { publicKey, activeChain } = useWallet();
  const [tokens, setTokens] = useState<Token[]>(DEFAULT_TOKENS);
  const [selectedToken, setSelectedToken] = useState<Token | null>(DEFAULT_TOKENS[0]);
  const [userPosition, setUserPosition] = useState<UserPosition | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeView, setActiveView] = useState<'screener' | 'terminal'>('terminal');

  // Ad Banner & Revenue State
  const [banners, setBanners] = useState<AdBanner[]>(INITIAL_AD_BANNERS);
  const [adRevenueVault, setAdRevenueVault] = useState<AdRevenueVaultState>(INITIAL_AD_REVENUE_VAULT);

  // Modals
  const [showLaunchModal, setShowLaunchModal] = useState(false);
  const [showArchModal, setShowArchModal] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [showMainnetHubModal, setShowMainnetHubModal] = useState(false);
  const [showConcurrencyModal, setShowConcurrencyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showSoftLandingModal, setShowSoftLandingModal] = useState(false);
  const [showOracleModal, setShowOracleModal] = useState(false);
  const [showForensicsModal, setShowForensicsModal] = useState(false);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [showBscHeatmapModal, setShowBscHeatmapModal] = useState(false);
  const [showTriVaultModal, setShowTriVaultModal] = useState(false);
  const [showAdAuctionModal, setShowAdAuctionModal] = useState(false);
  const [showDevBadgeModal, setShowDevBadgeModal] = useState(false);
  const [activeBadge, setActiveBadge] = useState<DevBadge | null>(null);
  const [modalToken, setModalToken] = useState<Token | null>(null);

  // Initial Fetch of Protected Tokens
  const fetchTokens = async () => {
    try {
      const res = await fetch('/api/tokens');
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setTokens(data);
        setSelectedToken(prev => {
          if (!prev) return data[0];
          return data.find(t => t.mint === prev.mint) || data[0];
        });
      }
    } catch {
      // Keep existing token state active without interrupting UI
    }
  };

  useEffect(() => {
    fetchTokens();
    const interval = setInterval(fetchTokens, 5000);
    return () => clearInterval(interval);
  }, []);

  // Fetch User Position when Selected Token or Wallet Changes
  useEffect(() => {
    if (!selectedToken || !publicKey) return;

    const fetchPosition = async () => {
      try {
        const res = await fetch(`/api/user/${publicKey}/position/${selectedToken.mint}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data && typeof data === 'object') {
          setUserPosition(data);
        }
      } catch {
        // Keep existing user position
      }
    };

    fetchPosition();
    const interval = setInterval(fetchPosition, 4000);
    return () => clearInterval(interval);
  }, [selectedToken, publicKey]);

  // Handle Token Selection
  const handleSelectToken = (token: Token) => {
    setSelectedToken(token);
    setActiveView('terminal');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectTokenByMint = (mint: string) => {
    if (!mint) return;
    const target = mint.toLowerCase().trim();
    const found = tokens.find(t => 
      (t.mint && t.mint.toLowerCase() === target) || 
      (t.symbol && t.symbol.toLowerCase() === target)
    );
    if (found) {
      handleSelectToken(found);
    }
  };

  // Handle Swap Success Callback
  const handleSwapSuccess = (trade: Trade, updatedToken: Token, updatedPos: UserPosition) => {
    setSelectedToken(updatedToken);
    setUserPosition(updatedPos);
    setTokens(prev => prev.map(t => t.mint === updatedToken.mint ? updatedToken : t));
  };

  // Total Escrowed SOL / Native across all Floor Insurance Vaults
  const totalEscrowedSol = tokens.reduce((acc, t) => acc + (t.insuranceVault?.balanceNative || 0), 0);

  // Filtered Tokens by Search
  const displayTokens = tokens.filter(t => {
    const q = (searchQuery || '').toLowerCase().trim();
    if (!q) return true;
    return (
      (t.name && t.name.toLowerCase().includes(q)) ||
      (t.symbol && t.symbol.toLowerCase().includes(q)) ||
      (t.mint && t.mint.toLowerCase().includes(q)) ||
      (t.chain && t.chain.toLowerCase().includes(q))
    );
  });

  const handleAddBanner = (newBanner: AdBanner) => {
    setBanners(prev => [newBanner, ...prev]);
    setAdRevenueVault(prev => {
      const addedRevenue = newBanner.bidAmountNative;
      const totalRev = prev.totalAdRevenueNative + addedRevenue;
      return {
        ...prev,
        totalAdRevenueNative: totalRev,
        platformShareNative: totalRev * 0.60,
        holderDividendShareNative: totalRev * 0.20,
        buybackBurnShareNative: totalRev * 0.20,
        activeBannersCount: prev.activeBannersCount + 1
      };
    });
  };

  const handleOpenBadgeModal = (badge?: DevBadge, targetToken?: Token) => {
    setActiveBadge(badge || null);
    setModalToken(targetToken || selectedToken || tokens[0]);
    setShowDevBadgeModal(true);
  };

  const activeModalTargetToken = modalToken || selectedToken || tokens[0];

  return (
    <div className="min-h-screen bg-[#07090e] text-neutral-100 selection:bg-amber-500 selection:text-neutral-950 font-sans antialiased">
      {/* Universal Top Sponsored Ticker Banner */}
      <AdBannerPlacement
        placement="top_ticker_banner"
        banners={banners}
        onOpenAdAuctionModal={() => setShowAdAuctionModal(true)}
        onSelectTokenByMint={handleSelectTokenByMint}
      />

      {/* Top Protocol Navbar */}
      <Navbar
        onOpenLaunchModal={() => setShowLaunchModal(true)}
        onOpenArchModal={() => setShowArchModal(true)}
        onOpenResumeModal={() => setShowResumeModal(true)}
        onOpenMainnetHub={() => setShowMainnetHubModal(true)}
        onOpenConcurrencyMatrix={() => setShowConcurrencyModal(true)}
        onOpenTermsModal={() => setShowTermsModal(true)}
        onOpenBscHeatmap={() => setShowBscHeatmapModal(true)}
        onOpenOracleHealth={() => {
          setModalToken(selectedToken);
          setShowOracleModal(true);
        }}
        onOpenSoftLanding={() => {
          setModalToken(selectedToken);
          setShowSoftLandingModal(true);
        }}
        onOpenCampaignStudio={() => {
          setModalToken(selectedToken);
          setShowCampaignModal(true);
        }}
        onOpenForensics={() => {
          setModalToken(selectedToken);
          setShowForensicsModal(true);
        }}
        onOpenTriVaultModal={() => {
          setModalToken(selectedToken);
          setShowTriVaultModal(true);
        }}
        onOpenAdAuctionModal={() => setShowAdAuctionModal(true)}
        onOpenBadgeModal={(badge) => handleOpenBadgeModal(badge, selectedToken || undefined)}
        onSelectTokenByMint={handleSelectTokenByMint}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        totalEscrowedSol={totalEscrowedSol}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* View Switcher Bar (Terminal vs Screener) */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveView('terminal')}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                activeView === 'terminal'
                  ? 'bg-neutral-800 text-amber-400 border border-amber-500/40 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Active Terminal {selectedToken ? `(${selectedToken.symbol || ''} • ${(selectedToken.chain || 'bsc').toUpperCase()})` : ''}
            </button>
            <button
              onClick={() => setActiveView('screener')}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                activeView === 'screener'
                  ? 'bg-neutral-800 text-amber-400 border border-amber-500/40 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Universal 6-Chain Screener ({tokens.length})
            </button>
          </div>

          {/* Quick Hub Badges */}
          <div className="hidden sm:flex items-center gap-3 text-xs font-mono text-neutral-400">
            <button
              onClick={() => setShowAdAuctionModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition"
              title="View Ad Placements & 20% Holder Revenue Distribution Pool"
            >
              <Megaphone className="w-3.5 h-3.5" />
              <span>Ad Revenue Pool</span>
            </button>

            <button
              onClick={() => setShowBscHeatmapModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition"
            >
              <Flame className="w-3.5 h-3.5" />
              <span>BSC Heatmap</span>
            </button>

            <button
              onClick={() => {
                setModalToken(selectedToken);
                setShowOracleModal(true);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 transition"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Dual-Oracle</span>
            </button>
          </div>
        </div>

        {/* View Render */}
        {activeView === 'terminal' && selectedToken ? (
          <TradingTerminal
            token={selectedToken}
            userPosition={userPosition}
            banners={banners}
            onSwapSuccess={handleSwapSuccess}
            onOpenSoftLanding={() => {
              setModalToken(selectedToken);
              setShowSoftLandingModal(true);
            }}
            onOpenOracleHealth={() => {
              setModalToken(selectedToken);
              setShowOracleModal(true);
            }}
            onOpenForensics={() => {
              setModalToken(selectedToken);
              setShowForensicsModal(true);
            }}
            onOpenCampaignStudio={() => {
              setModalToken(selectedToken);
              setShowCampaignModal(true);
            }}
            onOpenTriVaultModal={() => {
              setModalToken(selectedToken);
              setShowTriVaultModal(true);
            }}
            onOpenBadgeModal={(badge) => handleOpenBadgeModal(badge, selectedToken)}
            onOpenAdAuctionModal={() => setShowAdAuctionModal(true)}
            onTokenUpdated={(updated) => {
              setSelectedToken(updated);
              setTokens(prev => prev.map(t => t.mint === updated.mint ? updated : t));
            }}
            onClaimInsurance={async () => {
              try {
                const res = await fetch(`/api/tokens/${selectedToken.mint}/claim-insurance`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ userPublicKey: publicKey || "0x71C...B82" })
                });
                const d = await res.json();
                if (d.success) {
                  fetchTokens();
                }
              } catch (e) {
                console.error(e);
              }
            }}
          />
        ) : (
          <TokenScreener
            tokens={displayTokens}
            selectedToken={selectedToken || tokens[0]}
            banners={banners}
            onSelectToken={handleSelectToken}
            onOpenSoftLanding={(t) => {
              setModalToken(t);
              setShowSoftLandingModal(true);
            }}
            onOpenOracleHealth={(t) => {
              setModalToken(t);
              setShowOracleModal(true);
            }}
            onOpenForensics={(t) => {
              setModalToken(t);
              setShowForensicsModal(true);
            }}
            onOpenCampaignStudio={(t) => {
              setModalToken(t);
              setShowCampaignModal(true);
            }}
            onOpenBadgeModal={(badge) => handleOpenBadgeModal(badge)}
            onOpenAdAuctionModal={() => setShowAdAuctionModal(true)}
          />
        )}

        {/* Additional Screener Section under Terminal for fast multi-chain discovery */}
        {activeView === 'terminal' && (
          <div className="pt-8 border-t border-neutral-800 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-neutral-200 font-mono uppercase tracking-wider">
                Explore Multi-Chain Verified Curves
              </h2>
              <button
                onClick={() => setActiveView('screener')}
                className="text-xs font-mono text-amber-400 hover:text-amber-300"
              >
                View Full Universal Screener →
              </button>
            </div>

            <TokenScreener
              tokens={displayTokens.slice(0, 6)}
              selectedToken={selectedToken || tokens[0]}
              banners={banners}
              onSelectToken={handleSelectToken}
              onOpenSoftLanding={(t) => {
                setModalToken(t);
                setShowSoftLandingModal(true);
              }}
              onOpenOracleHealth={(t) => {
                setModalToken(t);
                setShowOracleModal(true);
              }}
              onOpenForensics={(t) => {
                setModalToken(t);
                setShowForensicsModal(true);
              }}
              onOpenCampaignStudio={(t) => {
                setModalToken(t);
                setShowCampaignModal(true);
              }}
              onOpenBadgeModal={(badge) => handleOpenBadgeModal(badge)}
              onOpenAdAuctionModal={() => setShowAdAuctionModal(true)}
            />
          </div>
        )}
      </main>

      {/* Modals */}
      {showLaunchModal && (
        <LaunchpadModal
          onClose={() => setShowLaunchModal(false)}
          onLaunchSuccess={(newToken) => {
            setTokens(prev => [newToken, ...prev]);
            setSelectedToken(newToken);
            setActiveView('terminal');
          }}
        />
      )}

      {showSoftLandingModal && activeModalTargetToken && (
        <SoftLandingDashboardModal
          token={activeModalTargetToken}
          isOpen={showSoftLandingModal}
          onClose={() => {
            setShowSoftLandingModal(false);
            setModalToken(null);
          }}
          onVoteCast={() => {
            fetchTokens();
          }}
        />
      )}

      {showOracleModal && activeModalTargetToken && (
        <OracleHealthMonitorModal
          token={activeModalTargetToken}
          isOpen={showOracleModal}
          onClose={() => {
            setShowOracleModal(false);
            setModalToken(null);
          }}
        />
      )}

      {showForensicsModal && activeModalTargetToken && (
        <VerifiableForensicsModal
          token={activeModalTargetToken}
          isOpen={showForensicsModal}
          onClose={() => {
            setShowForensicsModal(false);
            setModalToken(null);
          }}
        />
      )}

      {showCampaignModal && activeModalTargetToken && (
        <CampaignStudioModal
          token={activeModalTargetToken}
          isOpen={showCampaignModal}
          onClose={() => {
            setShowCampaignModal(false);
            setModalToken(null);
          }}
        />
      )}

      {showBscHeatmapModal && (
        <BscHeatmapModal
          tokens={tokens}
          isOpen={showBscHeatmapModal}
          onClose={() => setShowBscHeatmapModal(false)}
          onSelectToken={handleSelectToken}
        />
      )}

      {showArchModal && (
        <ArchitectureModal
          onClose={() => setShowArchModal(false)}
        />
      )}

      {showResumeModal && (
        <ResumeModal
          onClose={() => setShowResumeModal(false)}
        />
      )}

      {showMainnetHubModal && (
        <MainnetHubModal
          isOpen={showMainnetHubModal}
          onClose={() => setShowMainnetHubModal(false)}
        />
      )}

      {showConcurrencyModal && (
        <HighConcurrencyMatrixModal
          isOpen={showConcurrencyModal}
          onClose={() => setShowConcurrencyModal(false)}
        />
      )}

      {showTriVaultModal && activeModalTargetToken && (
        <TriVaultModal
          token={activeModalTargetToken}
          isOpen={showTriVaultModal}
          onClose={() => {
            setShowTriVaultModal(false);
            setModalToken(null);
          }}
          onTokenUpdated={(updated) => {
            setSelectedToken(updated);
            setTokens(prev => prev.map(t => t.mint === updated.mint ? updated : t));
          }}
        />
      )}

      {showAdAuctionModal && (
        <AdAuctionModal
          isOpen={showAdAuctionModal}
          onClose={() => setShowAdAuctionModal(false)}
          banners={banners}
          adRevenueVault={adRevenueVault}
          onAddBanner={handleAddBanner}
        />
      )}

      {showDevBadgeModal && activeModalTargetToken && (
        <DevBadgeModal
          isOpen={showDevBadgeModal}
          onClose={() => {
            setShowDevBadgeModal(false);
            setActiveBadge(null);
            setModalToken(null);
          }}
          token={activeModalTargetToken}
          activeBadge={activeBadge}
          onTokenUpdated={(updated) => {
            setSelectedToken(updated);
            setTokens(prev => prev.map(t => t.mint === updated.mint ? updated : t));
          }}
        />
      )}

      <TermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <WalletProvider>
      <MainApp />
    </WalletProvider>
  );
}
