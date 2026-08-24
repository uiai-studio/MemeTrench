import { Token } from './types';
import { MEME_PRESET_LOGOS } from './utils/tokenLogos';

export const DEFAULT_TOKENS: Token[] = [
  // 1. BSC Token - $BABYBNB (PancakeSwap v2 Graduation Path)
  {
    mint: "0x892f392284102941094019482910481029482019",
    name: "Baby BNB Sovereign",
    symbol: "BABYBNB",
    description: "The #1 Omniguard v2.1 protected meme on BSC. 48h linear TWAR release, 0x000...dead PancakeSwap LP burn, BlockVision private relay, and 72h Soft-Landing vault.",
    image: MEME_PRESET_LOGOS[0].dataUrl,
    banner: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
    creator: "0x71C67Ed3E8243CC733544752E1812E793970F784",
    twitter: "https://x.com/babybnb_bsc",
    telegram: "https://t.me/babybnb_portal",
    website: "https://babybnb.memetrench.fun",
    createdAt: Date.now() - 1000 * 60 * 60 * 14,
    chain: 'bsc',
    virtualNativeReserve: 28.5, // 28.5 BNB
    virtualTokenReserve: 480_000_000,
    realNativeReserve: 22.5,
    realTokenReserve: 380_000_000,
    totalSupply: 1_000_000_000,
    priceNative: 0.00000005937,
    priceUsd: 0.00003504,
    marketCapUsd: 35040.0,
    nativePriceUsd: 590.25,
    volume24h: 420800.0,
    change24h: 46.2,
    trades24hCount: 2890,
    holdersCount: 940,
    devAllocationPercent: 1.1,
    devGoodFaithBondNative: 0.5,
    devMerkleRoot: "0x4b7c89f2a01948bc827103984719284719284719284719284719284719284719",
    devWallets: [
      { address: "0x918F3B9081290381093819038190381903819038", percentage: 0.55, lockedTokens: 5500000, unlockedTokens: 0, isMerkleVerified: true },
      { address: "0x827D391083910283910283910283910283910283", percentage: 0.55, lockedTokens: 5500000, unlockedTokens: 0, isMerkleVerified: true },
    ],
    milestones: {
      m1: { targetMC: 100000, unlockPct: 20, reached: false, label: "$100K Market Cap (20% Dev Unlock)", twapPriceUsd: 0.000035 },
      m2: { targetMC: 300000, unlockPct: 25, reached: false, label: "$300K PancakeSwap v2 LP Burn (25% Dev Unlock)", twapPriceUsd: 0.000035 },
      m3: { targetMC: 1000000, unlockPct: 25, reached: false, label: "$1,000,000 Milestone (25% Dev Unlock)", twapPriceUsd: 0.000035 },
      m4: { targetMC: 3000000, unlockPct: 30, reached: false, label: "$3,000,000 Final Milestone (30% Dev Unlock)", twapPriceUsd: 0.000035 },
    },
    insuranceVault: {
      balanceNative: 11.25, // BNB
      nativeCurrency: 'BNB',
      expiryTimestamp: Date.now() + 1000 * 60 * 60 * 58,
      dangerZoneTriggered: false,
      is24hExtended: false,
      status: 'Active',
      totalEscrowedNative: 11.25,
      totalBuyersProtected: 890,
      refundRatePerTokenNative: 0.00000001125,
      softLandingThresholdUsd: 80000,
      targetSuccessMcUsd: 100000,
      daoTreasuryShareNative: 5.625,
      proRataRefundShareNative: 5.625,
      communityYesVotes: 120,
      communityNoVotes: 8,
      votes: [
        { voterAddress: "0x12aF...9921", isSupportExtension: true, voteWeightNative: 2.1, timestamp: Date.now() - 3600000 }
      ]
    },
    daoOuster: {
      devLastActiveTimestamp: Date.now() - 1000 * 60 * 60 * 8,
      isDevInactive: false,
      proposalActive: false,
      yesVotes: 0,
      noVotes: 0,
      totalVotesNeeded: 660_000_000,
      isOusted: false,
      squadsMultisigAddress: "0x892aCommunityTimelockMultisigBSC"
    },
    cabalAudit: {
      riskScore: 6,
      riskLevel: 'SAFE',
      block0JitoBundled: false,
      bundleTxCount: 0,
      top10HolderConcentration: 4.1,
      devClusterWalletCount: 2,
      devClusterTotalSupplyPct: 1.1,
      mixerFundingDetected: false,
      transferHookVerified: true,
      permanentDelegateDisabled: true,
      metadataMutable: false,
      findings: [
        "BEP-20 Omniguard Transfer Hook verified on BscScan.",
        "BlockVision private mempool routing active (100% frontrun immune).",
        "Merkle tree declared wallet proof verified on-chain.",
        "PancakeSwap v2 auto-burn destination set to 0x000...dead.",
        "11.25 BNB held in 72h Soft-Landing Floor Vault (58h left)."
      ]
    },
    verifiableMetrics: {
      giniCoefficient: 0.32,
      giniRating: 'DECENTRALIZED',
      retentionRate7d: 84.6,
      volumeToLiquidityRatio24h: 4.8,
      devClusterConfidencePct: 95.0,
      devClusterTotalSupplyPct: 1.1,
      declaredDevWalletsCount: 2,
      undeclaredTradedDetected: false,
      merkleRootHex: "0x4b7c89f2a01948bc827103984719284719284719284719284719284719284719",
      antiSnipingBlocksEnforced: 5,
      twarMicroBatchRandomOffsetSec: 74,
    },
    dualOracle: {
      primaryOracleName: "Chainlink BNB/USD",
      secondaryOracleName: "RedStone BSC Feed",
      primaryPriceUsd: 0.00003504,
      secondaryPriceUsd: 0.00003512,
      twapPriceUsd: 0.00003508,
      divergencePct: 0.22,
      circuitBreakerActive: false,
      lastOracleUpdate: Date.now() - 45000,
      statusMessage: "Healthy (0.22% divergence within 2.0% threshold)"
    },
    auditTrail: [
      { id: "e1", timestamp: Date.now() - 3600000 * 14, type: 'MERKLE_ROOT_DECLARED', description: "Creator submitted Merkle root for 2 declared hardware wallets.", txHash: "0x9812a...741", actor: "0x71C...F784", chain: 'bsc', verifiedOnChain: true },
      { id: "e2", timestamp: Date.now() - 3600000 * 14, type: 'VAULT_ESCROW_FUNDED', description: "11.25 BNB escrowed in 72-Hour Soft-Landing Vault.", txHash: "0x8172b...990", actor: "FloorVault", chain: 'bsc', verifiedOnChain: true },
      { id: "e3", timestamp: Date.now() - 3600000 * 6, type: 'TWAR_MICRO_RELEASE', description: "Batch #12 TWAR linear tranche released to 140 early buyers.", txHash: "0x7162c...312", actor: "TWAR_Hook", chain: 'bsc', verifiedOnChain: true },
    ],
    isGraduated: false,
    graduationTargetNative: 28.0, // 28 BNB ($300k MC target)
    graduationProgressPct: 78.4,
    dexPairAddress: "0x10ED43C718714eb63d5aA57B78B54704E256024E",
    isLpBurnedDead: false,
    triVault: {
      devSalary: {
        accruedNative: 1.42, // 1.42 BNB ready to claim (~$838 USD)
        totalPaidNative: 4.26,
        lastClaimTimestamp: Date.now() - 1000 * 60 * 60 * 24 * 7,
        nextClaimTimestamp: Date.now() - 1000 * 60 * 15, // Claimable now!
        weeklyVolumeGeneratedUsd: 420800.0,
        devWalletAddress: "0x71C67Ed3E8243CC733544752E1812E793970F784",
        isClaimableNow: true,
        epochNumber: 4
      },
      holderYield: {
        totalPoolNative: 1.42,
        totalDistributedNative: 4.26,
        userClaimableNative: 0.038, // 0.038 BNB for user holding
        currentYieldApyPct: 164.2,
        activeHoldersEarning: 940,
        userClaimHistory: [
          { timestamp: Date.now() - 86400000 * 3, amountNative: 0.024, txHash: "0x9812f...441" }
        ],
        snapshotBlock: 42891024
      },
      cexEscrow: {
        lockedNative: 0.71, // 0.71 BNB
        lockedTokens: 15_000_000, // 1.5% locked for CEX MM
        targetCexName: 'MEXC & Gate.io',
        isReleased: false,
        releaseTxHash: null,
        verifiedDepositWallet: null,
        cexPairLiveUrl: null,
        daysInEscrow: 14,
        escrowMaturityTimestamp: Date.now() + 1000 * 60 * 60 * 24 * 46,
        verifiedListingProofUrl: null,
        burnFallbackDeadlineTimestamp: Date.now() + 1000 * 60 * 60 * 24 * 76,
        cexListingReadinessPct: 78.4
      }
    },
    devBadges: [
      {
        type: 'doxxed',
        label: 'CertiK KYC Doxxed Dev',
        shortLabel: 'KYC Doxxed',
        iconName: 'ShieldCheck',
        color: 'amber',
        description: 'Identity verified with on-chain cryptographic passport attestation.',
        proofUrl: 'https://certik.com',
        issuedAt: Date.now() - 86400000 * 30
      },
      {
        type: 'staker_5pct',
        label: '5% Timelocked Builder Staker',
        shortLabel: '5% Staker',
        iconName: 'Lock',
        color: 'emerald',
        description: 'Allocated 5% growth equity locked under 4-tranche TWAP milestone smart contract.',
        proofUrl: 'https://bscscan.com',
        issuedAt: Date.now() - 86400000 * 14
      },
      {
        type: 'multisig_safe',
        label: 'Gnosis Multisig Safe (3/5 Signers)',
        shortLabel: 'Multisig Safe',
        iconName: 'Layers',
        color: 'purple',
        description: 'All developer actions and treasury expenditures require 3-of-5 hardware key signatures.',
        proofUrl: 'https://safe.global',
        issuedAt: Date.now() - 86400000 * 14
      }
    ],
    candleHistory: [
      { time: Math.floor(Date.now() / 1000) - 3600 * 4, open: 0.000022, high: 0.000028, low: 0.000021, close: 0.000026, volume: 68000 },
      { time: Math.floor(Date.now() / 1000) - 3600 * 3, open: 0.000026, high: 0.000031, low: 0.000025, close: 0.000029, volume: 92000 },
      { time: Math.floor(Date.now() / 1000) - 3600 * 2, open: 0.000029, high: 0.000036, low: 0.000028, close: 0.000032, volume: 114000 },
      { time: Math.floor(Date.now() / 1000) - 3600 * 1, open: 0.000032, high: 0.000038, low: 0.000030, close: 0.00003504, volume: 146000 },
    ]
  },

  // 2. Solana Token - $SPEPE (Raydium CPMM & SPL Token-2022)
  {
    mint: "TRNCHPepeHook2022SafeLaunchMint111111111",
    name: "SafePepe Token-2022",
    symbol: "SPEPE",
    description: "The premier milestone-vested meme on Solana. Early buyers unlocked via 48h TWAR. 0% MEV sandwich attack vulnerability with Jito MEV Shield.",
    image: MEME_PRESET_LOGOS[1].dataUrl,
    banner: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
    creator: "SquadsHQMultisigSafe4r9d28s7h3k9f01ja8d2",
    twitter: "https://x.com/safepepe_sol",
    telegram: "https://t.me/safepepe_portal",
    website: "https://safepepe.memetrench.fun",
    createdAt: Date.now() - 1000 * 60 * 60 * 18,
    chain: 'solana',
    virtualNativeReserve: 54.8,
    virtualTokenReserve: 587_000_000,
    realNativeReserve: 44.8,
    realTokenReserve: 413_000_000,
    totalSupply: 1_000_000_000,
    priceNative: 0.00000009335,
    priceUsd: 0.00001666,
    marketCapUsd: 16663.0,
    nativePriceUsd: 178.50,
    volume24h: 382400.0,
    change24h: 34.8,
    trades24hCount: 1420,
    holdersCount: 512,
    devAllocationPercent: 1.2,
    devGoodFaithBondNative: 2.0,
    devMerkleRoot: "0x891ab01928401928401928401928401928401928401928401928401928401928",
    devWallets: [
      { address: "DevVault111111111111111111111111111111111", percentage: 0.4, lockedTokens: 4000000, unlockedTokens: 0, isMerkleVerified: true },
      { address: "DevVault222222222222222222222222222222222", percentage: 0.4, lockedTokens: 4000000, unlockedTokens: 0, isMerkleVerified: true },
      { address: "DevVault333333333333333333333333333333333", percentage: 0.4, lockedTokens: 4000000, unlockedTokens: 0, isMerkleVerified: true },
    ],
    milestones: {
      m1: { targetMC: 100000, unlockPct: 20, reached: false, label: "$100K Market Cap (20% Dev Unlock)", twapPriceUsd: 0.0000166 },
      m2: { targetMC: 300000, unlockPct: 25, reached: false, label: "$300K Raydium CPMM Graduation (25% Dev Unlock)", twapPriceUsd: 0.0000166 },
      m3: { targetMC: 1000000, unlockPct: 25, reached: false, label: "$1,000,000 Milestone (25% Dev Unlock)", twapPriceUsd: 0.0000166 },
      m4: { targetMC: 3000000, unlockPct: 30, reached: false, label: "$3,000,000 Final Milestone (30% Dev Unlock)", twapPriceUsd: 0.0000166 },
    },
    insuranceVault: {
      balanceNative: 18.4,
      nativeCurrency: 'SOL',
      expiryTimestamp: Date.now() + 1000 * 60 * 60 * 54,
      dangerZoneTriggered: false,
      is24hExtended: false,
      status: 'Active',
      totalEscrowedNative: 18.4,
      totalBuyersProtected: 490,
      refundRatePerTokenNative: 0.0000000184,
      softLandingThresholdUsd: 80000,
      targetSuccessMcUsd: 100000,
      daoTreasuryShareNative: 9.2,
      proRataRefundShareNative: 9.2,
      communityYesVotes: 85,
      communityNoVotes: 2,
      votes: []
    },
    daoOuster: {
      devLastActiveTimestamp: Date.now() - 1000 * 60 * 60 * 12,
      isDevInactive: false,
      proposalActive: false,
      yesVotes: 0,
      noVotes: 0,
      totalVotesNeeded: 660_000_000,
      isOusted: false,
      squadsMultisigAddress: "SQDpepeCommunityTakeoverMultiSigAddress111"
    },
    cabalAudit: {
      riskScore: 8,
      riskLevel: 'SAFE',
      block0JitoBundled: false,
      bundleTxCount: 0,
      top10HolderConcentration: 4.8,
      devClusterWalletCount: 3,
      devClusterTotalSupplyPct: 1.2,
      mixerFundingDetected: false,
      transferHookVerified: true,
      permanentDelegateDisabled: true,
      metadataMutable: false,
      findings: [
        "Verified SPL Token-2022 Transfer Hook extension active.",
        "Dev supply strictly capped at 1.2% across 3 distinct hardware wallets.",
        "2.0 SOL Good-Faith Bond staked in escrow vault.",
        "18.4 SOL Floor Insurance Escrow active (54 hours remaining).",
        "0 sniper bot bundle transactions detected in genesis block."
      ]
    },
    verifiableMetrics: {
      giniCoefficient: 0.29,
      giniRating: 'EXCELLENT',
      retentionRate7d: 89.2,
      volumeToLiquidityRatio24h: 3.9,
      devClusterConfidencePct: 95.0,
      devClusterTotalSupplyPct: 1.2,
      declaredDevWalletsCount: 3,
      undeclaredTradedDetected: false,
      merkleRootHex: "0x891ab01928401928401928401928401928401928401928401928401928401928",
      antiSnipingBlocksEnforced: 5,
      twarMicroBatchRandomOffsetSec: 42,
    },
    dualOracle: {
      primaryOracleName: "Pyth Network SOL/USD",
      secondaryOracleName: "Switchboard Custom TWAP",
      primaryPriceUsd: 0.00001666,
      secondaryPriceUsd: 0.00001670,
      twapPriceUsd: 0.00001668,
      divergencePct: 0.24,
      circuitBreakerActive: false,
      lastOracleUpdate: Date.now() - 30000,
      statusMessage: "Healthy (0.24% divergence within 2.0% threshold)"
    },
    auditTrail: [
      { id: "sol1", timestamp: Date.now() - 3600000 * 18, type: 'MERKLE_ROOT_DECLARED', description: "Dev submitted Merkle root for 3 hardware wallets.", txHash: "4x912a...781", actor: "SquadsHQ", chain: 'solana', verifiedOnChain: true },
      { id: "sol2", timestamp: Date.now() - 3600000 * 18, type: 'VAULT_ESCROW_FUNDED', description: "18.4 SOL locked in 72h Soft-Landing Floor Vault.", txHash: "3m192b...441", actor: "FloorVault", chain: 'solana', verifiedOnChain: true },
    ],
    isGraduated: false,
    graduationTargetNative: 85.0,
    graduationProgressPct: 52.7,
    isLpBurnedDead: false,
    triVault: {
      devSalary: {
        accruedNative: 3.84, // 3.84 SOL (~$685 USD)
        totalPaidNative: 11.52,
        lastClaimTimestamp: Date.now() - 1000 * 60 * 60 * 24 * 5,
        nextClaimTimestamp: Date.now() + 1000 * 60 * 60 * 48, // 48h until epoch
        weeklyVolumeGeneratedUsd: 382400.0,
        devWalletAddress: "SquadsHQMultisigSafe4r9d28s7h3k9f01ja8d2",
        isClaimableNow: false,
        epochNumber: 3
      },
      holderYield: {
        totalPoolNative: 3.84,
        totalDistributedNative: 11.52,
        userClaimableNative: 0.125, // 0.125 SOL claimable for user
        currentYieldApyPct: 188.5,
        activeHoldersEarning: 512,
        userClaimHistory: [
          { timestamp: Date.now() - 86400000 * 2, amountNative: 0.082, txHash: "4x812b...990" }
        ],
        snapshotBlock: 289104812
      },
      cexEscrow: {
        lockedNative: 1.92, // 1.92 SOL
        lockedTokens: 12_000_000, // 1.2%
        targetCexName: 'Bitget & Bybit',
        isReleased: false,
        releaseTxHash: null,
        verifiedDepositWallet: null,
        cexPairLiveUrl: null,
        daysInEscrow: 18,
        escrowMaturityTimestamp: Date.now() + 1000 * 60 * 60 * 24 * 42,
        verifiedListingProofUrl: null,
        burnFallbackDeadlineTimestamp: Date.now() + 1000 * 60 * 60 * 24 * 72,
        cexListingReadinessPct: 65.2
      }
    },
    devBadges: [
      {
        type: 'serial_builder',
        label: 'Top Verified Solana Builder (Rank #4)',
        shortLabel: 'Serial Builder',
        iconName: 'Zap',
        color: 'cyan',
        description: 'Successfully launched 3 previous tokens with 100% Raydium LP burn and zero rugs.',
        proofUrl: 'https://solscan.io',
        issuedAt: Date.now() - 86400000 * 60
      },
      {
        type: 'multisig_safe',
        label: 'Squads Protocol Multisig Verified',
        shortLabel: 'Squads Safe',
        iconName: 'ShieldCheck',
        color: 'purple',
        description: 'Developer growth pool locked in a 3/4 Squads v4 program on Solana mainnet.',
        proofUrl: 'https://squads.so',
        issuedAt: Date.now() - 86400000 * 20
      },
      {
        type: 'staker_5pct',
        label: '5% Milestone Locked Staker',
        shortLabel: '5% Staker',
        iconName: 'Lock',
        color: 'emerald',
        description: '50M $SPEPE tokens locked until $100K and $300K sustained Pyth TWAP benchmarks.',
        proofUrl: 'https://solana.fm',
        issuedAt: Date.now() - 86400000 * 20
      }
    ],
    candleHistory: [
      { time: Math.floor(Date.now() / 1000) - 3600 * 4, open: 0.000011, high: 0.000013, low: 0.0000105, close: 0.0000125, volume: 45000 },
      { time: Math.floor(Date.now() / 1000) - 3600 * 3, open: 0.0000125, high: 0.000014, low: 0.000012, close: 0.0000138, volume: 62000 },
      { time: Math.floor(Date.now() / 1000) - 3600 * 2, open: 0.0000138, high: 0.0000155, low: 0.0000135, close: 0.0000149, volume: 89000 },
      { time: Math.floor(Date.now() / 1000) - 3600 * 1, open: 0.0000149, high: 0.0000172, low: 0.0000145, close: 0.00001666, volume: 112000 },
    ]
  },

  // 3. Base Token - $OBASED (Aerodrome / Uniswap v3 on Coinbase L2)
  {
    mint: "0x4b9a102948102948102948102948102948102948",
    name: "OmniBased L2",
    symbol: "OBASED",
    description: "Sub-cent gas fees, instant fiat ramps, and mathematically guaranteed anti-cabal protection on Base with Aerodrome LP burn.",
    image: MEME_PRESET_LOGOS[2].dataUrl,
    banner: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
    creator: "0x38B12d4810294810294810294810294810294810",
    twitter: "https://x.com/omnibased_base",
    telegram: "https://t.me/omnibased",
    website: "https://omnibased.memetrench.fun",
    createdAt: Date.now() - 1000 * 60 * 60 * 28,
    chain: 'base',
    virtualNativeReserve: 12.8, // 12.8 ETH
    virtualTokenReserve: 340_000_000,
    realNativeReserve: 10.2,
    realTokenReserve: 260_000_000,
    totalSupply: 1_000_000_000,
    priceNative: 0.00000003764,
    priceUsd: 0.00010087,
    marketCapUsd: 100870.0, // Milestone 1 passed!
    nativePriceUsd: 2680.00,
    volume24h: 512000.0,
    change24h: 112.5,
    trades24hCount: 3840,
    holdersCount: 1420,
    devAllocationPercent: 1.0,
    devGoodFaithBondNative: 0.1,
    devMerkleRoot: "0x1928401928401928401928401928401928401928401928401928401928401928",
    devWallets: [
      { address: "0x44B1290381093819038190381903819038190381", percentage: 1.0, lockedTokens: 10000000, unlockedTokens: 2000000, isMerkleVerified: true },
    ],
    milestones: {
      m1: { targetMC: 100000, unlockPct: 20, reached: true, timestamp: Date.now() - 3600000 * 4, label: "$100K Market Cap (20% Dev Unlock Claimed)", twapPriceUsd: 0.0001008 },
      m2: { targetMC: 300000, unlockPct: 25, reached: false, label: "$300K Aerodrome Graduation & LP Burn (25% Dev Unlock)", twapPriceUsd: 0.0001008 },
      m3: { targetMC: 1000000, unlockPct: 25, reached: false, label: "$1,000,000 Milestone (25% Dev Unlock)", twapPriceUsd: 0.0001008 },
      m4: { targetMC: 3000000, unlockPct: 30, reached: false, label: "$3,000,000 Final Milestone (30% Dev Unlock)", twapPriceUsd: 0.0001008 },
    },
    insuranceVault: {
      balanceNative: 4.8,
      nativeCurrency: 'ETH',
      expiryTimestamp: Date.now() + 1000 * 60 * 60 * 44,
      dangerZoneTriggered: false,
      is24hExtended: false,
      status: 'Matured', // MC >= 100k
      totalEscrowedNative: 4.8,
      totalBuyersProtected: 1240,
      refundRatePerTokenNative: 0.0000000048,
      softLandingThresholdUsd: 80000,
      targetSuccessMcUsd: 100000,
      daoTreasuryShareNative: 2.4,
      proRataRefundShareNative: 2.4,
      communityYesVotes: 340,
      communityNoVotes: 4,
      votes: []
    },
    daoOuster: {
      devLastActiveTimestamp: Date.now() - 1000 * 60 * 60 * 1,
      isDevInactive: false,
      proposalActive: false,
      yesVotes: 0,
      noVotes: 0,
      totalVotesNeeded: 660_000_000,
      isOusted: false,
      squadsMultisigAddress: "0x38B1TakeoverBaseMultisig"
    },
    cabalAudit: {
      riskScore: 2,
      riskLevel: 'SAFE',
      block0JitoBundled: false,
      bundleTxCount: 0,
      top10HolderConcentration: 2.9,
      devClusterWalletCount: 1,
      devClusterTotalSupplyPct: 1.0,
      mixerFundingDetected: false,
      transferHookVerified: true,
      permanentDelegateDisabled: true,
      metadataMutable: false,
      findings: [
        "Milestone #1 ($100K TWAP) verified by Chainlink Base oracle.",
        "Flashbots Protect active on all buyer trades.",
        "Floor Vault matured successfully into project development grant."
      ]
    },
    verifiableMetrics: {
      giniCoefficient: 0.24,
      giniRating: 'EXCELLENT',
      retentionRate7d: 92.4,
      volumeToLiquidityRatio24h: 5.2,
      devClusterConfidencePct: 95.0,
      devClusterTotalSupplyPct: 1.0,
      declaredDevWalletsCount: 1,
      undeclaredTradedDetected: false,
      merkleRootHex: "0x1928401928401928401928401928401928401928401928401928401928401928",
      antiSnipingBlocksEnforced: 5,
      twarMicroBatchRandomOffsetSec: 110,
    },
    dualOracle: {
      primaryOracleName: "Chainlink ETH/USD (Base)",
      secondaryOracleName: "RedStone L2 Feed",
      primaryPriceUsd: 0.00010087,
      secondaryPriceUsd: 0.00010091,
      twapPriceUsd: 0.00010089,
      divergencePct: 0.04,
      circuitBreakerActive: false,
      lastOracleUpdate: Date.now() - 15000,
      statusMessage: "Healthy (0.04% divergence within 2.0% threshold)"
    },
    auditTrail: [
      { id: "base1", timestamp: Date.now() - 3600000 * 28, type: 'MERKLE_ROOT_DECLARED', description: "Dev submitted Merkle root for declared hardware wallet.", txHash: "0x44a1...991", actor: "0x38B...4810", chain: 'base', verifiedOnChain: true },
      { id: "base2", timestamp: Date.now() - 3600000 * 4, type: 'ORACLE_TWAP_TICK', description: "Milestone #1 reached: $100K TWAP verified by Chainlink. 20% dev unlocked.", txHash: "0x33b2...110", actor: "DualOracle", chain: 'base', verifiedOnChain: true },
    ],
    isGraduated: false,
    graduationTargetNative: 15.0,
    graduationProgressPct: 68.0,
    isLpBurnedDead: false,
    triVault: {
      devSalary: {
        accruedNative: 3.82, // 3.82 ETH (~$10,237 USD)
        totalPaidNative: 7.64,
        lastClaimTimestamp: Date.now() - 1000 * 60 * 60 * 24 * 7,
        nextClaimTimestamp: Date.now() - 1000 * 60 * 60, // Claimable now!
        weeklyVolumeGeneratedUsd: 512000.0,
        devWalletAddress: "0x38B12d4810294810294810294810294810294810",
        isClaimableNow: true,
        epochNumber: 5
      },
      holderYield: {
        totalPoolNative: 3.82,
        totalDistributedNative: 7.64,
        userClaimableNative: 0.084, // 0.084 ETH claimable (~$225 USD)
        currentYieldApyPct: 214.8,
        activeHoldersEarning: 1420,
        userClaimHistory: [
          { timestamp: Date.now() - 86400000 * 4, amountNative: 0.045, txHash: "0x22c1...881" }
        ],
        snapshotBlock: 18402914
      },
      cexEscrow: {
        lockedNative: 1.91, // 1.91 ETH
        lockedTokens: 10_000_000, // 1.0%
        targetCexName: 'Coinbase & Binance',
        isReleased: false,
        releaseTxHash: null,
        verifiedDepositWallet: null,
        cexPairLiveUrl: null,
        daysInEscrow: 28,
        escrowMaturityTimestamp: Date.now() + 1000 * 60 * 60 * 24 * 32,
        verifiedListingProofUrl: null,
        burnFallbackDeadlineTimestamp: Date.now() + 1000 * 60 * 60 * 24 * 62,
        cexListingReadinessPct: 91.5
      }
    },
    devBadges: [
      {
        type: 'graduated',
        label: 'Tier-1 Graduated Founder (Coinbase Base Ecosystem)',
        shortLabel: 'Graduated Dev',
        iconName: 'Award',
        color: 'cyan',
        description: 'Achieved verified Uniswap / Aerodrome v3 pool graduation with LP sent to 0x000...dead.',
        proofUrl: 'https://basescan.org',
        issuedAt: Date.now() - 86400000 * 45
      },
      {
        type: 'doxxed',
        label: 'Coinbase Verified Smart Contract Dev',
        shortLabel: 'KYC Doxxed',
        iconName: 'ShieldCheck',
        color: 'amber',
        description: 'KYC verified through Coinbase Developer Verification ID.',
        proofUrl: 'https://base.org',
        issuedAt: Date.now() - 86400000 * 45
      },
      {
        type: 'staker_5pct',
        label: '5% Timelocked Growth Staker',
        shortLabel: '5% Staker',
        iconName: 'Lock',
        color: 'emerald',
        description: 'Allocated 50M $OBASED locked with Chainlink price TWAP release.',
        proofUrl: 'https://basescan.org',
        issuedAt: Date.now() - 86400000 * 28
      }
    ],
    candleHistory: [
      { time: Math.floor(Date.now() / 1000) - 3600 * 4, open: 0.000065, high: 0.000080, low: 0.000062, close: 0.000078, volume: 95000 },
      { time: Math.floor(Date.now() / 1000) - 3600 * 3, open: 0.000078, high: 0.000092, low: 0.000075, close: 0.000088, volume: 130000 },
      { time: Math.floor(Date.now() / 1000) - 3600 * 2, open: 0.000088, high: 0.000105, low: 0.000085, close: 0.000096, volume: 180000 },
      { time: Math.floor(Date.now() / 1000) - 3600 * 1, open: 0.000096, high: 0.000115, low: 0.000094, close: 0.00010087, volume: 220000 },
    ]
  },

  // 4. TON Token - $TONDOG (DeDust / STON.fi TVM Architecture)
  {
    mint: "EQB_TONDiamondDogSovereignSafeMint777777777",
    name: "TON Diamond Dog",
    symbol: "TONDOG",
    description: "The premier Telegram-native viral meme token powered by DeDust / STON.fi liquidity lockers and 72h Soft-Landing Floor Vault.",
    image: MEME_PRESET_LOGOS[3].dataUrl,
    banner: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
    creator: "EQCD39N_TONDiamondFoundationCreatorWallet11",
    twitter: "https://x.com/tondog_meme",
    telegram: "https://t.me/tondog_official",
    website: "https://tondog.memetrench.fun",
    createdAt: Date.now() - 1000 * 60 * 60 * 10,
    chain: 'ton',
    virtualNativeReserve: 1250.0, // TON
    virtualTokenReserve: 450_000_000,
    realNativeReserve: 980.0,
    realTokenReserve: 350_000_000,
    totalSupply: 1_000_000_000,
    priceNative: 0.0000028,
    priceUsd: 0.0000182,
    marketCapUsd: 18200.0,
    nativePriceUsd: 6.50,
    volume24h: 195000.0,
    change24h: 58.4,
    trades24hCount: 1820,
    holdersCount: 780,
    devAllocationPercent: 1.0,
    devGoodFaithBondNative: 50.0,
    devMerkleRoot: "0x7719284019284019284019284019284019284019284019284019284019284019",
    devWallets: [
      { address: "EQCDevWallet11111111111111111111111111111111", percentage: 1.0, lockedTokens: 10000000, unlockedTokens: 0, isMerkleVerified: true },
    ],
    milestones: {
      m1: { targetMC: 100000, unlockPct: 20, reached: false, label: "$100K Market Cap (20% Dev Unlock)", twapPriceUsd: 0.0000182 },
      m2: { targetMC: 300000, unlockPct: 25, reached: false, label: "$300K DeDust LP Burn (25% Dev Unlock)", twapPriceUsd: 0.0000182 },
      m3: { targetMC: 1000000, unlockPct: 25, reached: false, label: "$1,000,000 Milestone (25% Dev Unlock)", twapPriceUsd: 0.0000182 },
      m4: { targetMC: 3000000, unlockPct: 30, reached: false, label: "$3,000,000 Final Milestone (30% Dev Unlock)", twapPriceUsd: 0.0000182 },
    },
    insuranceVault: {
      balanceNative: 490.0,
      nativeCurrency: 'TON',
      expiryTimestamp: Date.now() + 1000 * 60 * 60 * 62,
      dangerZoneTriggered: false,
      is24hExtended: false,
      status: 'Active',
      totalEscrowedNative: 490.0,
      totalBuyersProtected: 710,
      refundRatePerTokenNative: 0.00000049,
      softLandingThresholdUsd: 80000,
      targetSuccessMcUsd: 100000,
      daoTreasuryShareNative: 245.0,
      proRataRefundShareNative: 245.0,
      communityYesVotes: 95,
      communityNoVotes: 3,
      votes: []
    },
    daoOuster: {
      devLastActiveTimestamp: Date.now() - 1000 * 60 * 60 * 4,
      isDevInactive: false,
      proposalActive: false,
      yesVotes: 0,
      noVotes: 0,
      totalVotesNeeded: 660_000_000,
      isOusted: false,
      squadsMultisigAddress: "EQCTONTakeoverMultisigSafe111"
    },
    cabalAudit: {
      riskScore: 7,
      riskLevel: 'SAFE',
      block0JitoBundled: false,
      bundleTxCount: 0,
      top10HolderConcentration: 3.8,
      devClusterWalletCount: 1,
      devClusterTotalSupplyPct: 1.0,
      mixerFundingDetected: false,
      transferHookVerified: true,
      permanentDelegateDisabled: true,
      metadataMutable: false,
      findings: [
        "TON TVM smart contract audit passed with 0 critical issues.",
        "DeDust / STON.fi automated liquidity graduation locked.",
        "490 TON held in 72h Soft-Landing Floor Vault."
      ]
    },
    verifiableMetrics: {
      giniCoefficient: 0.27,
      giniRating: 'EXCELLENT',
      retentionRate7d: 88.0,
      volumeToLiquidityRatio24h: 3.5,
      devClusterConfidencePct: 95.0,
      devClusterTotalSupplyPct: 1.0,
      declaredDevWalletsCount: 1,
      undeclaredTradedDetected: false,
      merkleRootHex: "0x7719284019284019284019284019284019284019284019284019284019284019",
      antiSnipingBlocksEnforced: 5,
      twarMicroBatchRandomOffsetSec: 55,
    },
    dualOracle: {
      primaryOracleName: "RedStone TON/USD",
      secondaryOracleName: "Pyth TON Feed",
      primaryPriceUsd: 0.0000182,
      secondaryPriceUsd: 0.00001825,
      twapPriceUsd: 0.00001822,
      divergencePct: 0.15,
      circuitBreakerActive: false,
      lastOracleUpdate: Date.now() - 20000,
      statusMessage: "Healthy (0.15% divergence within 2.0% threshold)"
    },
    auditTrail: [
      { id: "ton1", timestamp: Date.now() - 3600000 * 10, type: 'VAULT_ESCROW_FUNDED', description: "490 TON locked in 72h Soft-Landing Floor Vault.", txHash: "EQC_tx9812", actor: "FloorVault", chain: 'ton', verifiedOnChain: true },
    ],
    isGraduated: false,
    graduationTargetNative: 2500.0,
    graduationProgressPct: 39.2,
    isLpBurnedDead: false,
    triVault: {
      devSalary: {
        accruedNative: 48.0,
        totalPaidNative: 144.0,
        lastClaimTimestamp: Date.now() - 1000 * 60 * 60 * 24 * 3,
        nextClaimTimestamp: Date.now() + 1000 * 60 * 60 * 48,
        weeklyVolumeGeneratedUsd: 195000.0,
        devWalletAddress: "EQCD39N_TONDiamondFoundationCreatorWallet11",
        isClaimableNow: false,
        epochNumber: 2
      },
      holderYield: {
        totalPoolNative: 48.0,
        totalDistributedNative: 144.0,
        userClaimableNative: 1.45,
        currentYieldApyPct: 172.0,
        activeHoldersEarning: 780,
        userClaimHistory: [],
        snapshotBlock: 39102840
      },
      cexEscrow: {
        lockedNative: 24.0,
        lockedTokens: 10_000_000,
        targetCexName: 'KuCoin & OKX',
        isReleased: false,
        releaseTxHash: null,
        verifiedDepositWallet: null,
        cexPairLiveUrl: null,
        daysInEscrow: 10,
        escrowMaturityTimestamp: Date.now() + 1000 * 60 * 60 * 24 * 50,
        verifiedListingProofUrl: null,
        burnFallbackDeadlineTimestamp: Date.now() + 1000 * 60 * 60 * 24 * 80,
        cexListingReadinessPct: 48.0
      }
    },
    devBadges: [
      {
        type: 'doxxed',
        label: 'TON Foundation Community Verified Dev',
        shortLabel: 'TON Verified',
        iconName: 'ShieldCheck',
        color: 'cyan',
        description: 'Verified Telegram MiniApp builder on TON blockchain.',
        proofUrl: 'https://tonviewer.com',
        issuedAt: Date.now() - 86400000 * 25
      }
    ],
    candleHistory: [
      { time: Math.floor(Date.now() / 1000) - 3600 * 4, open: 0.000012, high: 0.000015, low: 0.000011, close: 0.000014, volume: 32000 },
      { time: Math.floor(Date.now() / 1000) - 3600 * 3, open: 0.000014, high: 0.000017, low: 0.000013, close: 0.000016, volume: 48000 },
      { time: Math.floor(Date.now() / 1000) - 3600 * 2, open: 0.000016, high: 0.000019, low: 0.000015, close: 0.0000175, volume: 64000 },
      { time: Math.floor(Date.now() / 1000) - 3600 * 1, open: 0.0000175, high: 0.000021, low: 0.000017, close: 0.0000182, volume: 81000 },
    ]
  },

  // 5. Sui Token - $SUISHIBA (Cetus / Turbos Move Architecture)
  {
    mint: "0x89248a0192840192840192840192840192840192840192840192840192840192::suishiba::SUISHIBA",
    name: "Sui Ocean Shiba",
    symbol: "SUISHIBA",
    description: "Ultra-fast sub-second finality with Move object-centric security, Cetus CPMM graduation, and 48h linear TWAR unlock.",
    image: MEME_PRESET_LOGOS[4].dataUrl,
    banner: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
    creator: "0x44B1290381093819038190381903819038190381903819038190381903819038",
    twitter: "https://x.com/suishiba_move",
    telegram: "https://t.me/suishiba_portal",
    website: "https://suishiba.memetrench.fun",
    createdAt: Date.now() - 1000 * 60 * 60 * 16,
    chain: 'sui',
    virtualNativeReserve: 4200.0, // SUI
    virtualTokenReserve: 410_000_000,
    realNativeReserve: 3400.0,
    realTokenReserve: 310_000_000,
    totalSupply: 1_000_000_000,
    priceNative: 0.0000085,
    priceUsd: 0.00002805,
    marketCapUsd: 28050.0,
    nativePriceUsd: 3.30,
    volume24h: 310000.0,
    change24h: 82.5,
    trades24hCount: 2240,
    holdersCount: 890,
    devAllocationPercent: 1.1,
    devGoodFaithBondNative: 100.0,
    devMerkleRoot: "0x5519284019284019284019284019284019284019284019284019284019284019",
    devWallets: [
      { address: "0x55B1290381093819038190381903819038190381903819038190381903819038", percentage: 1.1, lockedTokens: 11000000, unlockedTokens: 0, isMerkleVerified: true },
    ],
    milestones: {
      m1: { targetMC: 100000, unlockPct: 20, reached: false, label: "$100K Market Cap (20% Dev Unlock)", twapPriceUsd: 0.000028 },
      m2: { targetMC: 300000, unlockPct: 25, reached: false, label: "$300K Cetus CPMM Graduation (25% Dev Unlock)", twapPriceUsd: 0.000028 },
      m3: { targetMC: 1000000, unlockPct: 25, reached: false, label: "$1,000,000 Milestone (25% Dev Unlock)", twapPriceUsd: 0.000028 },
      m4: { targetMC: 3000000, unlockPct: 30, reached: false, label: "$3,000,000 Final Milestone (30% Dev Unlock)", twapPriceUsd: 0.000028 },
    },
    insuranceVault: {
      balanceNative: 1700.0,
      nativeCurrency: 'SUI',
      expiryTimestamp: Date.now() + 1000 * 60 * 60 * 56,
      dangerZoneTriggered: false,
      is24hExtended: false,
      status: 'Active',
      totalEscrowedNative: 1700.0,
      totalBuyersProtected: 810,
      refundRatePerTokenNative: 0.0000017,
      softLandingThresholdUsd: 80000,
      targetSuccessMcUsd: 100000,
      daoTreasuryShareNative: 850.0,
      proRataRefundShareNative: 850.0,
      communityYesVotes: 110,
      communityNoVotes: 5,
      votes: []
    },
    daoOuster: {
      devLastActiveTimestamp: Date.now() - 1000 * 60 * 60 * 5,
      isDevInactive: false,
      proposalActive: false,
      yesVotes: 0,
      noVotes: 0,
      totalVotesNeeded: 660_000_000,
      isOusted: false,
      squadsMultisigAddress: "0xSuiCommunityMultisigSafe"
    },
    cabalAudit: {
      riskScore: 5,
      riskLevel: 'SAFE',
      block0JitoBundled: false,
      bundleTxCount: 0,
      top10HolderConcentration: 3.2,
      devClusterWalletCount: 1,
      devClusterTotalSupplyPct: 1.1,
      mixerFundingDetected: false,
      transferHookVerified: true,
      permanentDelegateDisabled: true,
      metadataMutable: false,
      findings: [
        "Move Bytecode verifier certified on Sui Mainnet.",
        "Cetus dynamic liquidity locker pre-approved.",
        "1700 SUI locked in 72h Soft-Landing Floor Vault."
      ]
    },
    verifiableMetrics: {
      giniCoefficient: 0.25,
      giniRating: 'EXCELLENT',
      retentionRate7d: 91.0,
      volumeToLiquidityRatio24h: 4.2,
      devClusterConfidencePct: 95.0,
      devClusterTotalSupplyPct: 1.1,
      declaredDevWalletsCount: 1,
      undeclaredTradedDetected: false,
      merkleRootHex: "0x5519284019284019284019284019284019284019284019284019284019284019",
      antiSnipingBlocksEnforced: 5,
      twarMicroBatchRandomOffsetSec: 62,
    },
    dualOracle: {
      primaryOracleName: "Pyth Network SUI/USD",
      secondaryOracleName: "Switchboard SUI TWAP",
      primaryPriceUsd: 0.00002805,
      secondaryPriceUsd: 0.00002810,
      twapPriceUsd: 0.00002807,
      divergencePct: 0.12,
      circuitBreakerActive: false,
      lastOracleUpdate: Date.now() - 10000,
      statusMessage: "Healthy (0.12% divergence within 2.0% threshold)"
    },
    auditTrail: [
      { id: "sui1", timestamp: Date.now() - 3600000 * 16, type: 'VAULT_ESCROW_FUNDED', description: "1700 SUI escrowed in 72h Soft-Landing Floor Vault.", txHash: "0xSuiTx991a", actor: "FloorVault", chain: 'sui', verifiedOnChain: true },
    ],
    isGraduated: false,
    graduationTargetNative: 8000.0,
    graduationProgressPct: 42.5,
    isLpBurnedDead: false,
    triVault: {
      devSalary: {
        accruedNative: 120.0,
        totalPaidNative: 360.0,
        lastClaimTimestamp: Date.now() - 1000 * 60 * 60 * 24 * 4,
        nextClaimTimestamp: Date.now() + 1000 * 60 * 60 * 24,
        weeklyVolumeGeneratedUsd: 310000.0,
        devWalletAddress: "0x44B1290381093819038190381903819038190381903819038190381903819038",
        isClaimableNow: false,
        epochNumber: 3
      },
      holderYield: {
        totalPoolNative: 120.0,
        totalDistributedNative: 360.0,
        userClaimableNative: 3.42,
        currentYieldApyPct: 195.0,
        activeHoldersEarning: 890,
        userClaimHistory: [],
        snapshotBlock: 89102840
      },
      cexEscrow: {
        lockedNative: 60.0,
        lockedTokens: 11_000_000,
        targetCexName: 'Bitget & Bybit',
        isReleased: false,
        releaseTxHash: null,
        verifiedDepositWallet: null,
        cexPairLiveUrl: null,
        daysInEscrow: 16,
        escrowMaturityTimestamp: Date.now() + 1000 * 60 * 60 * 24 * 44,
        verifiedListingProofUrl: null,
        burnFallbackDeadlineTimestamp: Date.now() + 1000 * 60 * 60 * 24 * 74,
        cexListingReadinessPct: 55.0
      }
    },
    devBadges: [
      {
        type: 'serial_builder',
        label: 'Top Verified Move Ecosystem Dev',
        shortLabel: 'Move Builder',
        iconName: 'Zap',
        color: 'cyan',
        description: 'Audited and verified Move smart contract architecture on Sui mainnet.',
        proofUrl: 'https://suiscan.xyz',
        issuedAt: Date.now() - 86400000 * 40
      }
    ],
    candleHistory: [
      { time: Math.floor(Date.now() / 1000) - 3600 * 4, open: 0.000018, high: 0.000022, low: 0.000017, close: 0.000021, volume: 55000 },
      { time: Math.floor(Date.now() / 1000) - 3600 * 3, open: 0.000021, high: 0.000026, low: 0.000020, close: 0.000024, volume: 78000 },
      { time: Math.floor(Date.now() / 1000) - 3600 * 2, open: 0.000024, high: 0.000030, low: 0.000023, close: 0.000027, volume: 102000 },
      { time: Math.floor(Date.now() / 1000) - 3600 * 1, open: 0.000027, high: 0.000032, low: 0.000026, close: 0.00002805, volume: 125000 },
    ]
  },

  // 6. Ethereum Mainnet Token - $ETHPEPE (Uniswap v3 / Flashbots Protected)
  {
    mint: "0x77A1928401928401928401928401928401928401",
    name: "Ethereum Sovereign Pepe",
    symbol: "ETHPEPE",
    description: "Uniswap v3 LP auto-burn with Flashbots Protect private RPC and 72h Soft-Landing insurance vault.",
    image: MEME_PRESET_LOGOS[5].dataUrl,
    banner: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
    creator: "0x11C67Ed3E8243CC733544752E1812E793970F784",
    twitter: "https://x.com/ethpepe_mainnet",
    telegram: "https://t.me/ethpepe_portal",
    website: "https://ethpepe.memetrench.fun",
    createdAt: Date.now() - 1000 * 60 * 60 * 36,
    chain: 'ethereum',
    virtualNativeReserve: 15.5, // ETH
    virtualTokenReserve: 310_000_000,
    realNativeReserve: 12.0,
    realTokenReserve: 240_000_000,
    totalSupply: 1_000_000_000,
    priceNative: 0.00000005,
    priceUsd: 0.000134,
    marketCapUsd: 134000.0,
    nativePriceUsd: 2680.00,
    volume24h: 680000.0,
    change24h: 124.0,
    trades24hCount: 4120,
    holdersCount: 1650,
    devAllocationPercent: 0.9,
    devGoodFaithBondNative: 0.5,
    devMerkleRoot: "0x9919284019284019284019284019284019284019284019284019284019284019",
    devWallets: [
      { address: "0x11B1290381093819038190381903819038190381", percentage: 0.9, lockedTokens: 9000000, unlockedTokens: 1800000, isMerkleVerified: true },
    ],
    milestones: {
      m1: { targetMC: 100000, unlockPct: 20, reached: true, timestamp: Date.now() - 3600000 * 12, label: "$100K Market Cap (20% Dev Unlock Claimed)", twapPriceUsd: 0.000134 },
      m2: { targetMC: 300000, unlockPct: 25, reached: false, label: "$300K Uniswap v3 Graduation & LP Burn (25% Dev Unlock)", twapPriceUsd: 0.000134 },
      m3: { targetMC: 1000000, unlockPct: 25, reached: false, label: "$1,000,000 Milestone (25% Dev Unlock)", twapPriceUsd: 0.000134 },
      m4: { targetMC: 3000000, unlockPct: 30, reached: false, label: "$3,000,000 Final Milestone (30% Dev Unlock)", twapPriceUsd: 0.000134 },
    },
    insuranceVault: {
      balanceNative: 6.0,
      nativeCurrency: 'ETH',
      expiryTimestamp: Date.now() + 1000 * 60 * 60 * 36,
      dangerZoneTriggered: false,
      is24hExtended: false,
      status: 'Matured',
      totalEscrowedNative: 6.0,
      totalBuyersProtected: 1510,
      refundRatePerTokenNative: 0.000000006,
      softLandingThresholdUsd: 80000,
      targetSuccessMcUsd: 100000,
      daoTreasuryShareNative: 3.0,
      proRataRefundShareNative: 3.0,
      communityYesVotes: 420,
      communityNoVotes: 2,
      votes: []
    },
    daoOuster: {
      devLastActiveTimestamp: Date.now() - 1000 * 60 * 60 * 2,
      isDevInactive: false,
      proposalActive: false,
      yesVotes: 0,
      noVotes: 0,
      totalVotesNeeded: 660_000_000,
      isOusted: false,
      squadsMultisigAddress: "0xETHTakeoverMultisigSafe"
    },
    cabalAudit: {
      riskScore: 2,
      riskLevel: 'SAFE',
      block0JitoBundled: false,
      bundleTxCount: 0,
      top10HolderConcentration: 2.5,
      devClusterWalletCount: 1,
      devClusterTotalSupplyPct: 0.9,
      mixerFundingDetected: false,
      transferHookVerified: true,
      permanentDelegateDisabled: true,
      metadataMutable: false,
      findings: [
        "Uniswap v3 non-fungible position token burned to 0x000...dead.",
        "Flashbots Protect private builder relay verified.",
        "Milestone #1 verified on Chainlink Mainnet feed."
      ]
    },
    verifiableMetrics: {
      giniCoefficient: 0.22,
      giniRating: 'EXCELLENT',
      retentionRate7d: 95.0,
      volumeToLiquidityRatio24h: 5.8,
      devClusterConfidencePct: 95.0,
      devClusterTotalSupplyPct: 0.9,
      declaredDevWalletsCount: 1,
      undeclaredTradedDetected: false,
      merkleRootHex: "0x9919284019284019284019284019284019284019284019284019284019284019",
      antiSnipingBlocksEnforced: 5,
      twarMicroBatchRandomOffsetSec: 88,
    },
    dualOracle: {
      primaryOracleName: "Chainlink ETH/USD",
      secondaryOracleName: "Uniswap v3 TWAP",
      primaryPriceUsd: 0.000134,
      secondaryPriceUsd: 0.0001342,
      twapPriceUsd: 0.0001341,
      divergencePct: 0.05,
      circuitBreakerActive: false,
      lastOracleUpdate: Date.now() - 5000,
      statusMessage: "Healthy (0.05% divergence within 2.0% threshold)"
    },
    auditTrail: [
      { id: "eth1", timestamp: Date.now() - 3600000 * 36, type: 'MERKLE_ROOT_DECLARED', description: "Dev submitted Merkle root for declared hardware wallet.", txHash: "0xETHtx8812", actor: "0x11C...F784", chain: 'ethereum', verifiedOnChain: true },
    ],
    isGraduated: false,
    graduationTargetNative: 20.0,
    graduationProgressPct: 77.5,
    isLpBurnedDead: false,
    triVault: {
      devSalary: {
        accruedNative: 4.5,
        totalPaidNative: 13.5,
        lastClaimTimestamp: Date.now() - 1000 * 60 * 60 * 24 * 7,
        nextClaimTimestamp: Date.now() - 1000 * 60 * 30,
        weeklyVolumeGeneratedUsd: 680000.0,
        devWalletAddress: "0x11C67Ed3E8243CC733544752E1812E793970F784",
        isClaimableNow: true,
        epochNumber: 6
      },
      holderYield: {
        totalPoolNative: 4.5,
        totalDistributedNative: 13.5,
        userClaimableNative: 0.098,
        currentYieldApyPct: 235.0,
        activeHoldersEarning: 1650,
        userClaimHistory: [],
        snapshotBlock: 20910284
      },
      cexEscrow: {
        lockedNative: 2.25,
        lockedTokens: 9_000_000,
        targetCexName: 'Binance & Kraken',
        isReleased: false,
        releaseTxHash: null,
        verifiedDepositWallet: null,
        cexPairLiveUrl: null,
        daysInEscrow: 36,
        escrowMaturityTimestamp: Date.now() + 1000 * 60 * 60 * 24 * 24,
        verifiedListingProofUrl: null,
        burnFallbackDeadlineTimestamp: Date.now() + 1000 * 60 * 60 * 24 * 54,
        cexListingReadinessPct: 95.0
      }
    },
    devBadges: [
      {
        type: 'doxxed',
        label: 'CertiK Ethereum Verified Builder',
        shortLabel: 'CertiK Doxxed',
        iconName: 'ShieldCheck',
        color: 'amber',
        description: 'CertiK cryptographic audit and KYC verification certified on Ethereum.',
        proofUrl: 'https://certik.com',
        issuedAt: Date.now() - 86400000 * 60
      },
      {
        type: 'staker_5pct',
        label: '5% Timelocked Growth Staker',
        shortLabel: '5% Staker',
        iconName: 'Lock',
        color: 'emerald',
        description: 'Allocated 50M $ETHPEPE locked with Chainlink price TWAP release.',
        proofUrl: 'https://etherscan.io',
        issuedAt: Date.now() - 86400000 * 36
      }
    ],
    candleHistory: [
      { time: Math.floor(Date.now() / 1000) - 3600 * 4, open: 0.000095, high: 0.000115, low: 0.000090, close: 0.000108, volume: 120000 },
      { time: Math.floor(Date.now() / 1000) - 3600 * 3, open: 0.000108, high: 0.000125, low: 0.000102, close: 0.000118, volume: 165000 },
      { time: Math.floor(Date.now() / 1000) - 3600 * 2, open: 0.000118, high: 0.000138, low: 0.000114, close: 0.000128, volume: 210000 },
      { time: Math.floor(Date.now() / 1000) - 3600 * 1, open: 0.000128, high: 0.000145, low: 0.000122, close: 0.000134, volume: 270000 },
    ]
  }
];

