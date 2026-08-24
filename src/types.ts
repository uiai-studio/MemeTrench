export type SupportedChainId = 'solana' | 'bsc' | 'base' | 'ethereum' | 'ton' | 'sui';

export interface ChainConfig {
  id: SupportedChainId;
  name: string;
  symbol: string;
  nativeCurrency: string;
  nativePriceUsd: number;
  icon: string;
  color: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  explorerUrl: string;
  explorerTxUrl: string;
  dexName: string;
  dexRouterAddress: string;
  mevProtectionType: string;
  mevRelayProvider: string;
  oracleProvider: string;
  isEvm: boolean;
  chainIdNumber?: number;
  defaultRpc: string;
  dailyLaunchesEstimated: number;
  marketSharePct: number;
  tokenStandard?: string;
}

export interface DevWalletAllocation {
  address: string;
  percentage: number; // Max total across all <= 1.5%
  lockedTokens: number;
  unlockedTokens: number;
  merkleLeafHash?: string;
  isMerkleVerified: boolean;
}

export interface Milestone {
  targetMC: number;
  unlockPct: number;
  reached: boolean;
  timestamp?: number;
  label: string;
  twapPriceUsd?: number;
}

export interface MilestonesConfig {
  m1: Milestone; // $100k - 20%
  m2: Milestone; // $300k - DEX Grad & LP Burn - 25%
  m3: Milestone; // $1M - 25%
  m4: Milestone; // $3M - 30%
}

export interface SoftLandingVote {
  voterAddress: string;
  isSupportExtension: boolean;
  voteWeightNative: number;
  timestamp: number;
}

export interface FloorInsuranceVault {
  balanceNative: number; // in SOL, BNB, ETH, TON, SUI
  nativeCurrency: string;
  expiryTimestamp: number; // 72 hours from creation
  dangerZoneTriggered: boolean; // True if MC is between $80K - $99.9K at/near 72h
  is24hExtended: boolean;
  status: 'Active' | 'DangerZone_Voting' | 'RefundActive' | 'RefundClaimed' | 'Matured' | 'DAO_Converted';
  totalEscrowedNative: number;
  totalBuyersProtected: number;
  refundRatePerTokenNative: number;
  softLandingThresholdUsd: number; // $80,000
  targetSuccessMcUsd: number; // $100,000
  daoTreasuryShareNative: number; // 50% on failure
  proRataRefundShareNative: number; // 50% on failure
  communityYesVotes: number;
  communityNoVotes: number;
  votes: SoftLandingVote[];
}

export interface DaoOusterState {
  devLastActiveTimestamp: number;
  isDevInactive: boolean; // > 7 days
  proposalActive: boolean;
  proposalId?: string;
  yesVotes: number;
  noVotes: number;
  totalVotesNeeded: number; // 66% quorum
  votingDeadline?: number;
  isOusted: boolean;
  squadsMultisigAddress: string;
}

export interface VerifiableMetricsSuite {
  giniCoefficient: number; // 0.0 to 1.0 (supply concentration math)
  giniRating: 'EXCELLENT' | 'DECENTRALIZED' | 'MODERATE' | 'CONCENTRATED';
  retentionRate7d: number; // % of initial buyers still holding
  volumeToLiquidityRatio24h: number; // Healthy is 2.5x - 8.0x
  devClusterConfidencePct: number; // e.g. 95% Confidence Interval
  devClusterTotalSupplyPct: number; // <= 1.5% enforced
  declaredDevWalletsCount: number;
  undeclaredTradedDetected: boolean;
  merkleRootHex: string;
  antiSnipingBlocksEnforced: number;
  twarMicroBatchRandomOffsetSec: number;
}

export interface DualOracleStatus {
  primaryOracleName: string; // Pyth Network / Chainlink
  secondaryOracleName: string; // Switchboard / RedStone
  primaryPriceUsd: number;
  secondaryPriceUsd: number;
  twapPriceUsd: number;
  divergencePct: number;
  circuitBreakerActive: boolean; // Triggers if divergence > 2.0%
  lastOracleUpdate: number;
  statusMessage: string;
}

export interface AuditTrailEvent {
  id: string;
  timestamp: number;
  type: 'MERKLE_ROOT_DECLARED' | 'TWAR_MICRO_RELEASE' | 'VAULT_ESCROW_FUNDED' | 'ORACLE_TWAP_TICK' | 'DANGER_ZONE_EXTENDED' | 'REFUND_SETTLED' | 'LP_BURNED_DEAD';
  description: string;
  txHash: string;
  actor: string;
  chain: SupportedChainId;
  verifiedOnChain: boolean;
}

export interface CabalAuditReport {
  riskScore: number; // 0 - 100
  riskLevel: 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  block0JitoBundled: boolean;
  bundleTxCount: number;
  top10HolderConcentration: number; // percentage
  devClusterWalletCount: number;
  devClusterTotalSupplyPct: number;
  mixerFundingDetected: boolean;
  transferHookVerified: boolean;
  permanentDelegateDisabled: boolean;
  metadataMutable: boolean;
  findings: string[];
}

export interface DevSalaryVaultState {
  accruedNative: number; // 2% fee share currently in vault (in SOL/BNB/ETH)
  totalPaidNative: number; // lifetime claimed by dev
  lastClaimTimestamp: number;
  nextClaimTimestamp: number; // 7-day epoch countdown
  weeklyVolumeGeneratedUsd: number;
  devWalletAddress: string;
  isClaimableNow: boolean;
  epochNumber: number;
}

export interface HolderYieldVaultState {
  totalPoolNative: number; // 2% fee share pool for holders
  totalDistributedNative: number; // lifetime native SOL/BNB paid to diamond hands
  userClaimableNative: number; // current connected wallet's earned dividend
  currentYieldApyPct: number; // e.g. 148.5% APY based on 24h volume
  activeHoldersEarning: number;
  userClaimHistory: { timestamp: number; amountNative: number; txHash: string }[];
  snapshotBlock: number;
}

export interface CexListingEscrowState {
  lockedNative: number; // 1% fee share accumulated
  lockedTokens: number; // allocated token supply (e.g. 15,000,000 tokens for CEX Market Maker order books)
  targetCexName: string; // e.g. 'MEXC / Binance / Gate.io'
  isReleased: boolean;
  releaseTxHash: string | null;
  verifiedDepositWallet: string | null;
  cexPairLiveUrl: string | null;
  daysInEscrow: number;
  escrowMaturityTimestamp: number;
  verifiedListingProofUrl: string | null;
  burnFallbackDeadlineTimestamp: number;
  cexListingReadinessPct: number;
}

export interface TriVaultState {
  devSalary: DevSalaryVaultState;
  holderYield: HolderYieldVaultState;
  cexEscrow: CexListingEscrowState;
}

export type DevBadgeType = 'doxxed' | 'staker_5pct' | 'serial_builder' | 'graduated' | 'multisig_safe' | 'kyc_verified';

export interface DevBadge {
  type: DevBadgeType;
  label: string;
  shortLabel: string;
  iconName: string;
  color: string; // e.g. 'amber', 'emerald', 'cyan', 'purple'
  description: string;
  proofUrl?: string;
  issuedAt: number;
}

export type AdPlacementType = 'top_ticker_banner' | 'terminal_sidebar_sponsor' | 'screener_featured_spotlight' | 'floating_promo_bar';

export interface AdBanner {
  id: string;
  placement: AdPlacementType;
  title: string;
  tagline: string;
  ctaText: string;
  ctaLink: string;
  sponsorName: string;
  sponsorLogo?: string;
  sponsorBadge?: string;
  chain: SupportedChainId;
  tokenMint?: string; // If advertising a token on Omniguard
  bidAmountNative: number; // e.g. 1.5 SOL / 0.5 BNB
  impressionsCount: number;
  clicksCount: number;
  expiresAt: number;
  isActive: boolean;
  themeColor: string; // e.g. 'amber', 'emerald', 'cyan', 'purple', 'rose'
}

export interface AdRevenueVaultState {
  totalAdRevenueNative: number;
  platformShareNative: number; // 60%
  holderDividendShareNative: number; // 20% distributed to real-yield holders
  buybackBurnShareNative: number; // 20% automated buyback & burn
  activeBannersCount: number;
  slotPricing: {
    top_ticker_banner: number; // in native (e.g. 0.8 SOL / 0.2 BNB)
    terminal_sidebar_sponsor: number;
    screener_featured_spotlight: number;
    floating_promo_bar: number;
  };
}

export interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Token {
  mint: string;
  name: string;
  symbol: string;
  description: string;
  image: string;
  banner?: string;
  creator: string;
  twitter?: string;
  telegram?: string;
  website?: string;
  createdAt: number;
  chain: SupportedChainId;
  
  // AMM Virtual & Real Reserves (Constant Product x * y = k)
  virtualNativeReserve: number; // e.g. 30 SOL or 15 BNB
  virtualTokenReserve: number; // e.g. 1,073,000,000 tokens
  realNativeReserve: number;
  realTokenReserve: number;
  totalSupply: number; // 1,000,000,000
  
  // Market Metrics
  priceNative: number;
  priceUsd: number;
  marketCapUsd: number;
  nativePriceUsd: number;
  volume24h: number;
  change24h: number;
  trades24hCount: number;
  holdersCount: number;
  
  // Dev allocation rules
  devAllocationPercent: number; // <= 1.5%
  devGoodFaithBondNative: number; // 2 SOL / 0.5 BNB
  devWallets: DevWalletAllocation[];
  devMerkleRoot: string;
  
  // Invariants & Omniguard Protections
  milestones: MilestonesConfig;
  insuranceVault: FloorInsuranceVault;
  daoOuster: DaoOusterState;
  cabalAudit: CabalAuditReport;
  verifiableMetrics: VerifiableMetricsSuite;
  dualOracle: DualOracleStatus;
  auditTrail: AuditTrailEvent[];
  
  // DEX & LP Status
  isGraduated: boolean;
  graduationTargetNative: number; // 85 SOL / 28 BNB ($300k MC target)
  graduationProgressPct: number;
  dexPairAddress?: string;
  lpBurnTxHash?: string;
  isLpBurnedDead: boolean;

  // Tri-Vault 2-2-1 Sustainable Tokenomics Engine
  triVault?: TriVaultState;

  // Verified Developer Badges
  devBadges?: DevBadge[];
  
  candleHistory: CandleData[];
}

export interface UserPosition {
  walletAddress: string;
  tokenMint: string;
  chain: SupportedChainId;
  totalBoughtTokens: number;
  currentBalance: number;
  unlockedPercentage: number; // 20% immediate, continuous linear TWAR over 48h
  unlockedTokens: number;
  lockedTokens: number;
  firstBuyTimestamp: number;
  lastTrancheUnlockTimestamp: number;
  nextTrancheUnlockTimestamp: number;
  totalPaidNative: number;
  nativeReflectionEarned: number;
  isFirst1000Buyer: boolean;
  buyerRank: number;
  twarReleasableNow: number;
  antiSnipingBlocksRemaining: number;
  holderYieldClaimableNative?: number;
  holderYieldClaimedTotalNative?: number;
}

export interface Trade {
  id: string;
  mint: string;
  chain: SupportedChainId;
  type: 'BUY' | 'SELL';
  nativeAmount: number;
  tokenAmount: number;
  priceUsd: number;
  priceNative: number;
  user: string;
  timestamp: number;
  txHash: string;
  isMevProtected: boolean;
  mevRelayProvider: string; // Jito / BlockVision / Flashbots
  reflectionFeeNative?: number;
  burnedTokens?: number;
}

export interface JitoBundleSwapRequest {
  userPublicKey: string;
  tokenMint: string;
  chain: SupportedChainId;
  amountInNative?: number;
  amountInTokens?: number;
  isBuy: boolean;
  slippageTolerancePct: number;
  tipLamports: number;
}

export interface JitoBundleSwapResponse {
  success: boolean;
  bundleId: string;
  txSignature: string;
  mevSavedUsd: number;
  landedSlot: number;
  message: string;
  relayProvider: string;
}

export interface AiMarketingRequest {
  tokenName: string;
  symbol: string;
  description: string;
  chain: SupportedChainId;
  marketCapUsd: number;
  milestoneStage: string;
  customPrompt?: string;
}

export interface CompliantCampaignDraft {
  id: string;
  channel: 'TWITTER_THREAD' | 'TELEGRAM_BROADCAST' | 'REDDIT_POST';
  title: string;
  content: string;
  complianceChecked: boolean;
  passedGuardrails: boolean;
  flaggedRiskPhrases: string[];
  disclaimerText: string;
  status: 'PENDING_HUMAN_APPROVAL' | 'APPROVED' | 'REJECTED';
}

export interface AiMarketingResponse {
  tweetThread: string[];
  telegramAnnouncement: string;
  asciiMemeRaid: string;
  bulletPoints: string[];
  compliantCampaigns: CompliantCampaignDraft[];
  complianceLog: string;
}

