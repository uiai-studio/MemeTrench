import { AdBanner, AdRevenueVaultState } from './types';

export const INITIAL_AD_BANNERS: AdBanner[] = [
  {
    id: 'ad-top-01',
    placement: 'top_ticker_banner',
    title: '⚡ PEPE UNCHAINED L2 IS LIVE',
    tagline: 'Bridging 0-tax layer 2 memecoin scaling. 100x lower gas on Ethereum.',
    ctaText: 'Explore Bridge',
    ctaLink: 'https://pepeunchained.io',
    sponsorName: 'Pepe Unchained Foundation',
    sponsorBadge: 'Verified Partner',
    chain: 'ethereum',
    bidAmountNative: 2.5,
    impressionsCount: 148200,
    clicksCount: 5210,
    expiresAt: Date.now() + 86400000 * 3,
    isActive: true,
    themeColor: 'emerald'
  },
  {
    id: 'ad-top-02',
    placement: 'top_ticker_banner',
    title: '🛡️ SQUADSHQ MULTISIG FOR MEMES',
    tagline: 'Secure your dev growth treasury with automated 4-tranche timelocks.',
    ctaText: 'Deploy Multisig',
    ctaLink: 'https://squads.so',
    sponsorName: 'Squads Protocol',
    sponsorBadge: 'Official Infrastructure',
    chain: 'solana',
    bidAmountNative: 1.8,
    impressionsCount: 92400,
    clicksCount: 3820,
    expiresAt: Date.now() + 86400000 * 5,
    isActive: true,
    themeColor: 'purple'
  },
  {
    id: 'ad-sidebar-01',
    placement: 'terminal_sidebar_sponsor',
    title: '🚀 BABY BNB SOVEREIGN',
    tagline: '48h linear anti-dump TWAR with 2-2-1 Tri-Vault native BNB dividends.',
    ctaText: 'Trade on BSC',
    ctaLink: '#',
    sponsorName: 'BabyBNB DAO',
    sponsorBadge: 'Featured Gem',
    chain: 'bsc',
    tokenMint: '0x892f392284102941094019482910481029482019',
    bidAmountNative: 1.2,
    impressionsCount: 68100,
    clicksCount: 2940,
    expiresAt: Date.now() + 86400000 * 2,
    isActive: true,
    themeColor: 'amber'
  },
  {
    id: 'ad-screener-01',
    placement: 'screener_featured_spotlight',
    title: '🔥 SOLANA QUANTUM DOGE',
    tagline: 'Dual-oracle Pyth circuit breakers enabled. 78% bonding curve filled.',
    ctaText: 'View Terminal',
    ctaLink: '#',
    sponsorName: 'Quantum Doge Core',
    sponsorBadge: 'Hot Spotlight',
    chain: 'solana',
    tokenMint: 'Dog3QuantUmSoL111111111111111111111111111111',
    bidAmountNative: 3.0,
    impressionsCount: 214500,
    clicksCount: 8430,
    expiresAt: Date.now() + 86400000 * 4,
    isActive: true,
    themeColor: 'cyan'
  }
];

export const INITIAL_AD_REVENUE_VAULT: AdRevenueVaultState = {
  totalAdRevenueNative: 8.5, // e.g. 8.5 SOL / equivalent in native
  platformShareNative: 5.1, // 60%
  holderDividendShareNative: 1.7, // 20% distributed to real-yield holders
  buybackBurnShareNative: 1.7, // 20% buyback & burn
  activeBannersCount: 4,
  slotPricing: {
    top_ticker_banner: 0.8, // in native gas tokens
    terminal_sidebar_sponsor: 0.5,
    screener_featured_spotlight: 1.2,
    floating_promo_bar: 0.4
  }
};
