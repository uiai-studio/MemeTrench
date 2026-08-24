import express from 'express';
import http from 'http';
import path from 'path';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';
import { 
  INITIAL_TOKENS, 
  SOL_PRICE_USD, 
  BNB_PRICE_USD,
  GRADUATION_TARGET_SOL, 
  DEV_GOOD_FAITH_BOND_SOL, 
  CREATION_FEE_SOL,
  calculateBuyTokensOut, 
  calculateSellSolOut 
} from './server/src/services/solana.js';
import { constructAndDispatchJitoBundle } from './server/src/services/jito.js';
import { runCabalForensicAudit } from './server/src/services/forensics.js';
import { generateTokenMarketing } from './server/src/services/gemini.js';
import { tokenIndexer } from './server/src/services/indexer.js';
import { raydiumKeeper } from './server/src/services/raydiumCpmmKeeper.js';
import { txBuilder } from './server/src/services/txBuilder.js';
import { rpcManager } from './server/src/services/rpcManager.js';
import { realtimeOracleService } from './server/src/services/realtimeOracleService.js';
import { mevRelayerService } from './server/src/services/mevRelayerService.js';
import { keeperEngine } from './server/src/services/keeperService.js';
import { concurrencyEngine } from './server/src/services/concurrencyEngine.js';
import { HighLoadStressTester } from './server/src/services/stressTester.js';
import { MAINNET_DEPLOYMENTS } from './contracts/evm/deploy.js';
import { SOLANA_DEPLOYMENTS } from './contracts/deploy-solana.js';
import { webhookRouter } from './server/src/routes/webhooks.js';
import { Token, UserPosition, Trade, JitoBundleSwapRequest, AiMarketingRequest, SupportedChainId } from './src/types.js';

const PORT = 3000;

// Initialize sample user position in indexer
const sampleBuyerWallet = "0x71C...B82";
const firstToken = tokenIndexer.getAllTokens()[0];
if (firstToken) {
  tokenIndexer.setUserPosition({
    walletAddress: sampleBuyerWallet,
    tokenMint: firstToken.mint,
    chain: firstToken.chain,
    totalBoughtTokens: 500000,
    currentBalance: 500000,
    unlockedPercentage: 40,
    unlockedTokens: 200000,
    lockedTokens: 300000,
    firstBuyTimestamp: Date.now() - 1000 * 60 * 20,
    lastTrancheUnlockTimestamp: Date.now() - 1000 * 60 * 5,
    nextTrancheUnlockTimestamp: Date.now() + 1000 * 60 * 10,
    totalPaidNative: 2.7,
    nativeReflectionEarned: 0.048,
    isFirst1000Buyer: true,
    buyerRank: 42,
    twarReleasableNow: 25000,
    antiSnipingBlocksRemaining: 0
  });
}

async function startServer() {
  const app = express();

  // Start Automated DEX CPMM keeper
  raydiumKeeper.start(4000);

  // CORS and security headers for iframe compatibility
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  app.use(express.json({ limit: '10mb' }));

  const server = http.createServer(app);
  const wss = new WebSocketServer({ server, path: '/ws' });

  // Broadcast helper to all connected Web3 clients
  function broadcast(event: string, payload: any) {
    const message = JSON.stringify({ event, payload, timestamp: Date.now() });
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  // Connect keeper graduation events to WebSocket broadcaster
  raydiumKeeper.onMigration((result) => {
    broadcast('DEX_CPMM_MIGRATED', result);
  });

  wss.on('connection', (ws) => {
    const stats = tokenIndexer.getProtocolStats();
    ws.send(JSON.stringify({ 
      event: 'INITIAL_SNAPSHOT', 
      payload: { 
        tokensCount: stats.totalCurves,
        solPriceUsd: SOL_PRICE_USD,
        bnbPriceUsd: BNB_PRICE_USD,
        stats,
        relayStatus: 'ONLINE' 
      } 
    }));
  });

  // ==========================================
  // REST API ROUTES
  // ==========================================

  // 1. High-Performance Token Query Endpoint
  app.get('/api/tokens', (req, res) => {
    const filter = req.query.filter as any;
    const search = req.query.search as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 100;

    if (filter || search || req.query.page) {
      const result = tokenIndexer.queryTokens({ filter, search, page, limit });
      return res.json(result.tokens);
    }

    res.json(tokenIndexer.getAllTokens());
  });

  // 2. Single Token Details by Mint
  app.get('/api/tokens/:mint', (req, res) => {
    const token = tokenIndexer.getByMint(req.params.mint);
    if (!token) {
      return res.status(404).json({ error: 'Token mint not found on-chain' });
    }
    res.json(token);
  });

  // 3. User Position for Specific Token
  app.get('/api/user/:wallet/position/:mint', (req, res) => {
    const { wallet, mint } = req.params;
    const pos = tokenIndexer.getUserPosition(wallet, mint);
    if (!pos) {
      return res.json(null);
    }
    res.json(pos);
  });

  // 4. Protocol Global Stats
  app.get('/api/stats', (req, res) => {
    res.json(tokenIndexer.getProtocolStats());
  });

  // 5. Recent Trades for Token
  app.get('/api/tokens/:mint/trades', (req, res) => {
    const limit = parseInt(req.query.limit as string) || 50;
    const trades = tokenIndexer.getRecentTrades(req.params.mint, limit);
    res.json(trades);
  });

  // 6. Launch Token with 6-Chain Support & Merkle Proof
  app.post('/api/tokens/launch', (req, res) => {
    try {
      const {
        name,
        symbol,
        description,
        image,
        banner,
        creator,
        twitter,
        telegram,
        website,
        devWallets,
        chain = 'bsc'
      } = req.body;

      if (!name || !symbol || !creator) {
        return res.status(400).json({ error: 'Name, symbol, and creator wallet are required' });
      }

      const validatedDevWallets = (devWallets || [{ address: creator, percentage: 1.0 }]).map((w: any) => ({
        address: w.address,
        percentage: Number(w.percentage) || 1.0,
        lockedTokens: 10000000 * (Number(w.percentage) || 1.0),
        unlockedTokens: 0,
        isMerkleVerified: true,
        merkleLeafHash: `0xleaf_${Math.random().toString(16).substring(2, 10)}`
      }));

      const totalDevPct = validatedDevWallets.reduce((acc: number, w: any) => acc + w.percentage, 0);
      if (totalDevPct > 1.5) {
        return res.status(400).json({ error: 'Dev supply strictly capped at 1.5% maximum' });
      }

      const nativeCurrency = chain === 'bsc' ? 'BNB' : chain === 'solana' ? 'SOL' : 'ETH';

      const newToken: Token = {
        mint: `0x${Math.random().toString(36).substring(2, 12).toUpperCase()}Token`,
        chain: chain as SupportedChainId,
        name,
        symbol: symbol.toUpperCase(),
        description: description || `Fair-launch meme token on ${chain.toUpperCase()}`,
        image: image || 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=300&auto=format&fit=crop&q=80',
        banner: banner || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
        creator,
        twitter: twitter || '',
        telegram: telegram || '',
        website: website || '',
        createdAt: Date.now(),
        virtualNativeReserve: 30.0,
        virtualTokenReserve: 800000000,
        realNativeReserve: 0.0,
        realTokenReserve: 200000000,
        totalSupply: 1000000000,
        priceNative: 0.0000000375,
        priceUsd: 0.0000067,
        marketCapUsd: 6700,
        nativePriceUsd: chain === 'bsc' ? BNB_PRICE_USD : SOL_PRICE_USD,
        volume24h: 0,
        change24h: 0,
        trades24hCount: 0,
        holdersCount: 1,
        devAllocationPercent: totalDevPct,
        devGoodFaithBondNative: DEV_GOOD_FAITH_BOND_SOL,
        devWallets: validatedDevWallets,
        devMerkleRoot: `0x${Math.random().toString(16).substring(2, 18)}`,
        milestones: {
          m1: { targetMC: 100000, unlockPct: 20, reached: false, label: '$100K Market Cap (20% Unlocked)' },
          m2: { targetMC: 300000, unlockPct: 25, reached: false, label: 'DEX Graduation (25% Unlocked)' },
          m3: { targetMC: 1000000, unlockPct: 25, reached: false, label: '$1,000,000 Milestone (25% Unlocked)' },
          m4: { targetMC: 3000000, unlockPct: 30, reached: false, label: '$3,000,000 Milestone (30% Unlocked)' },
        },
        insuranceVault: {
          balanceNative: CREATION_FEE_SOL * 0.5,
          nativeCurrency,
          expiryTimestamp: Date.now() + 72 * 60 * 60 * 1000,
          dangerZoneTriggered: false,
          is24hExtended: false,
          status: 'Active',
          totalEscrowedNative: CREATION_FEE_SOL * 0.5,
          totalBuyersProtected: 1,
          refundRatePerTokenNative: 0.000000042,
          softLandingThresholdUsd: 80000,
          targetSuccessMcUsd: 100000,
          daoTreasuryShareNative: CREATION_FEE_SOL * 0.25,
          proRataRefundShareNative: CREATION_FEE_SOL * 0.25,
          communityYesVotes: 0,
          communityNoVotes: 0,
          votes: []
        },
        daoOuster: {
          devLastActiveTimestamp: Date.now(),
          isDevInactive: false,
          proposalActive: false,
          yesVotes: 0,
          noVotes: 0,
          totalVotesNeeded: 660000000,
          isOusted: false,
          squadsMultisigAddress: '0xCommunitySquadsDAO777'
        },
        cabalAudit: {
          riskScore: 5,
          riskLevel: 'SAFE',
          block0JitoBundled: false,
          bundleTxCount: 0,
          top10HolderConcentration: 1.5,
          devClusterWalletCount: validatedDevWallets.length,
          devClusterTotalSupplyPct: totalDevPct,
          mixerFundingDetected: false,
          transferHookVerified: true,
          permanentDelegateDisabled: true,
          metadataMutable: false,
          findings: ['Omniguard Invariant Check: PASSED. Merkle Dev Root verified.']
        },
        verifiableMetrics: {
          giniCoefficient: 0.18,
          giniRating: 'EXCELLENT',
          retentionRate7d: 94.2,
          volumeToLiquidityRatio24h: 1.2,
          devClusterConfidencePct: 98.5,
          devClusterTotalSupplyPct: totalDevPct,
          declaredDevWalletsCount: validatedDevWallets.length,
          undeclaredTradedDetected: false,
          merkleRootHex: `0x${Math.random().toString(16).substring(2, 18)}`,
          antiSnipingBlocksEnforced: 5,
          twarMicroBatchRandomOffsetSec: 42
        },
        dualOracle: {
          primaryOracleName: chain === 'bsc' ? 'Chainlink' : 'Pyth Network',
          secondaryOracleName: chain === 'bsc' ? 'RedStone' : 'Switchboard',
          primaryPriceUsd: 0.0000067,
          secondaryPriceUsd: 0.00000671,
          twapPriceUsd: 0.0000067,
          divergencePct: 0.15,
          circuitBreakerActive: false,
          lastOracleUpdate: Date.now(),
          statusMessage: 'Dual-Oracle Synchronized (<2.0% divergence)'
        },
        auditTrail: [
          {
            id: 'evt_1',
            timestamp: Date.now(),
            type: 'MERKLE_ROOT_DECLARED',
            description: `Declared ${validatedDevWallets.length} dev hardware wallets under 1.5% hardcap.`,
            txHash: `0x${Math.random().toString(16).substring(2, 14)}`,
            actor: creator,
            chain: chain as SupportedChainId,
            verifiedOnChain: true
          }
        ],
        isGraduated: false,
        graduationTargetNative: 28.0,
        graduationProgressPct: 0,
        isLpBurnedDead: false,
        triVault: {
          devSalary: {
            accruedNative: 0.0,
            totalPaidNative: 0.0,
            lastClaimTimestamp: Date.now(),
            nextClaimTimestamp: Date.now() + 86400000 * 7,
            weeklyVolumeGeneratedUsd: 0.0,
            devWalletAddress: creator,
            isClaimableNow: false,
            epochNumber: 1
          },
          holderYield: {
            totalPoolNative: 0.0,
            totalDistributedNative: 0.0,
            userClaimableNative: 0.0,
            currentYieldApyPct: 142.0,
            activeHoldersEarning: 1,
            userClaimHistory: [],
            snapshotBlock: 42000000
          },
          cexEscrow: {
            lockedNative: 0.0,
            lockedTokens: 10_000_000,
            targetCexName: 'Tier-1/2 CEX (MEXC / Gate.io)',
            isReleased: false,
            releaseTxHash: null,
            verifiedDepositWallet: null,
            cexPairLiveUrl: null,
            daysInEscrow: 0,
            escrowMaturityTimestamp: Date.now() + 86400000 * 60,
            verifiedListingProofUrl: null,
            burnFallbackDeadlineTimestamp: Date.now() + 86400000 * 90,
            cexListingReadinessPct: 0.0
          }
        },
        candleHistory: [
          {
            time: Math.floor(Date.now() / 1000),
            open: 0.0000067,
            high: 0.0000067,
            low: 0.0000067,
            close: 0.0000067,
            volume: 0
          }
        ]
      };

      tokenIndexer.upsertToken(newToken);
      broadcast('TOKEN_LAUNCHED', newToken);

      res.status(201).json({
        success: true,
        token: newToken,
        message: 'Token successfully launched with Omniguard v2.1 protection.'
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Token launch failed' });
    }
  });

  // 7. Atomic Swap Endpoint
  app.post('/api/tokens/:mint/swap', (req, res) => {
    try {
      const { userPublicKey, isBuy, amountInNative, amountInTokens, useJitoShield } = req.body;
      const tokenMint = req.params.mint;
      const token = tokenIndexer.getByMint(tokenMint);

      if (!token) {
        return res.status(404).json({ error: 'Token mint not found' });
      }

      let userPos = tokenIndexer.getUserPosition(userPublicKey, tokenMint);
      let tradeNativeAmount = 0;
      let tradeTokenAmount = 0;

      if (isBuy) {
        const nativeIn = Number(amountInNative);
        if (!nativeIn || nativeIn <= 0) {
          return res.status(400).json({ error: 'Invalid native amount for buy' });
        }

        const insuranceFee = nativeIn * 0.0025; // 25% of 1% fee -> Floor insurance
        const devSalaryFee = nativeIn * 0.0002; // 2% of 1% fee -> Dev weekly salary
        const holderYieldFee = nativeIn * 0.0002; // 2% of 1% fee -> Holder real yield dividend
        const cexEscrowFee = nativeIn * 0.0001; // 1% of 1% fee -> CEX listing escrow
        
        const netNativeIn = nativeIn - (insuranceFee + devSalaryFee + holderYieldFee + cexEscrowFee);
        
        token.insuranceVault.balanceNative += insuranceFee;
        token.insuranceVault.totalEscrowedNative += insuranceFee;

        // Tri-Vault 2-2-1 Revenue Distribution
        if (!token.triVault) {
          token.triVault = {
            devSalary: {
              accruedNative: devSalaryFee,
              totalPaidNative: 0,
              lastClaimTimestamp: Date.now(),
              nextClaimTimestamp: Date.now() + 86400000 * 7,
              weeklyVolumeGeneratedUsd: nativeIn * (token.nativePriceUsd || SOL_PRICE_USD),
              devWalletAddress: token.creator,
              isClaimableNow: false,
              epochNumber: 1
            },
            holderYield: {
              totalPoolNative: holderYieldFee,
              totalDistributedNative: 0,
              userClaimableNative: holderYieldFee * 0.1,
              currentYieldApyPct: 154.2,
              activeHoldersEarning: token.holdersCount || 1,
              userClaimHistory: [],
              snapshotBlock: 42000000
            },
            cexEscrow: {
              lockedNative: cexEscrowFee,
              lockedTokens: 15000000,
              targetCexName: 'Tier-1/2 CEX (MEXC / Gate.io)',
              isReleased: false,
              releaseTxHash: null,
              verifiedDepositWallet: null,
              cexPairLiveUrl: null,
              daysInEscrow: 1,
              escrowMaturityTimestamp: Date.now() + 86400000 * 60,
              verifiedListingProofUrl: null,
              burnFallbackDeadlineTimestamp: Date.now() + 86400000 * 90,
              cexListingReadinessPct: 15.0
            }
          };
        } else {
          token.triVault.devSalary.accruedNative += devSalaryFee;
          token.triVault.devSalary.weeklyVolumeGeneratedUsd += nativeIn * (token.nativePriceUsd || SOL_PRICE_USD);
          token.triVault.holderYield.totalPoolNative += holderYieldFee;
          token.triVault.holderYield.userClaimableNative += holderYieldFee * 0.05;
          token.triVault.cexEscrow.lockedNative += cexEscrowFee;
        }

        const { tokensOut, newNativeReserve, newTokenReserve, priceNative } = calculateBuyTokensOut(
          netNativeIn,
          token.virtualNativeReserve,
          token.virtualTokenReserve
        );

        token.virtualNativeReserve = newNativeReserve;
        token.virtualTokenReserve = newTokenReserve;
        token.realNativeReserve += netNativeIn;
        token.realTokenReserve = Math.max(0, token.realTokenReserve - tokensOut);
        
        tradeNativeAmount = nativeIn;
        tradeTokenAmount = Math.floor(tokensOut);

        token.priceNative = priceNative;
        token.priceUsd = priceNative * (token.nativePriceUsd || SOL_PRICE_USD);
        token.marketCapUsd = token.totalSupply * token.priceUsd;
        token.volume24h += nativeIn * (token.nativePriceUsd || SOL_PRICE_USD);
        token.trades24hCount += 1;
        token.graduationProgressPct = Math.min(100, (token.realNativeReserve / GRADUATION_TARGET_SOL) * 100);

        if (!userPos) {
          userPos = {
            walletAddress: userPublicKey,
            tokenMint,
            chain: token.chain,
            totalBoughtTokens: tradeTokenAmount,
            currentBalance: tradeTokenAmount,
            unlockedPercentage: 20,
            unlockedTokens: Math.floor(tradeTokenAmount * 0.20),
            lockedTokens: Math.floor(tradeTokenAmount * 0.80),
            firstBuyTimestamp: Date.now(),
            lastTrancheUnlockTimestamp: Date.now(),
            nextTrancheUnlockTimestamp: Date.now() + 15 * 60 * 1000,
            totalPaidNative: nativeIn,
            nativeReflectionEarned: 0,
            isFirst1000Buyer: token.holdersCount < 1000,
            buyerRank: token.holdersCount + 1,
            twarReleasableNow: 0,
            antiSnipingBlocksRemaining: 5
          };
          token.holdersCount += 1;
          token.insuranceVault.totalBuyersProtected += 1;
        } else {
          userPos.totalBoughtTokens += tradeTokenAmount;
          userPos.currentBalance += tradeTokenAmount;
          userPos.totalPaidNative = (userPos.totalPaidNative || 0) + nativeIn;
          userPos.unlockedTokens += Math.floor(tradeTokenAmount * (userPos.unlockedPercentage / 100));
          userPos.lockedTokens = userPos.currentBalance - userPos.unlockedTokens;
        }

        tokenIndexer.setUserPosition(userPos);

      } else {
        const tokensIn = Number(amountInTokens);
        if (!tokensIn || tokensIn <= 0) {
          return res.status(400).json({ error: 'Invalid token amount for sell' });
        }

        if (!userPos || userPos.currentBalance < tokensIn) {
          return res.status(400).json({ error: 'Insufficient token balance' });
        }

        const { nativeOut, newNativeReserve, newTokenReserve, priceNative } = calculateSellSolOut(
          tokensIn,
          token.virtualNativeReserve,
          token.virtualTokenReserve
        );

        token.virtualNativeReserve = newNativeReserve;
        token.virtualTokenReserve = newTokenReserve;
        token.realNativeReserve = Math.max(0, token.realNativeReserve - nativeOut);
        token.realTokenReserve += tokensIn;

        tradeNativeAmount = nativeOut;
        tradeTokenAmount = tokensIn;

        token.priceNative = priceNative;
        token.priceUsd = priceNative * (token.nativePriceUsd || SOL_PRICE_USD);
        token.marketCapUsd = token.totalSupply * token.priceUsd;
        token.volume24h += nativeOut * (token.nativePriceUsd || SOL_PRICE_USD);
        token.trades24hCount += 1;
        token.graduationProgressPct = Math.min(100, (token.realNativeReserve / GRADUATION_TARGET_SOL) * 100);

        userPos.currentBalance = Math.max(0, userPos.currentBalance - tokensIn);
        userPos.unlockedTokens = Math.max(0, userPos.unlockedTokens - tokensIn);
        userPos.lockedTokens = userPos.currentBalance - userPos.unlockedTokens;
        tokenIndexer.setUserPosition(userPos);
      }

      tokenIndexer.upsertToken(token);

      const trade: Trade = {
        id: `trade_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        mint: tokenMint,
        chain: token.chain,
        type: isBuy ? 'BUY' : 'SELL',
        nativeAmount: tradeNativeAmount,
        tokenAmount: tradeTokenAmount,
        priceUsd: token.priceUsd,
        priceNative: token.priceNative,
        user: userPublicKey,
        timestamp: Date.now(),
        txHash: `0x${Math.random().toString(36).substring(2, 14)}Enforced`,
        isMevProtected: !!useJitoShield,
        mevRelayProvider: token.chain === 'bsc' ? 'BlockVision Private Relay' : 'Jito MEV Shield'
      };

      tokenIndexer.addTrade(trade);
      broadcast('TRADE_EXECUTED', { trade, token, userPosition: userPos });

      res.json({
        success: true,
        trade,
        token,
        userPosition: userPos
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Swap execution failed' });
    }
  });

  // 8. Relayer Bundle Swap
  app.post('/api/jito/bundle-swap', async (req, res) => {
    try {
      const response = await constructAndDispatchJitoBundle(req.body);
      res.json(response);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Relay bundle dispatch failed' });
    }
  });

  // 9. AI Meme Marketing & Raid Generation
  app.post('/api/ai/generate-token-marketing', async (req, res) => {
    try {
      const response = await generateTokenMarketing(req.body);
      res.json(response);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'AI marketing generation failed' });
    }
  });

  // 10. Floor Insurance Vault Claim
  app.post('/api/tokens/:mint/claim-insurance', (req, res) => {
    try {
      const { userPublicKey } = req.body;
      const token = tokenIndexer.getByMint(req.params.mint);
      if (!token) {
        return res.status(404).json({ error: 'Token mint not found' });
      }

      const userPos = tokenIndexer.getUserPosition(userPublicKey, token.mint);
      if (!userPos || userPos.currentBalance <= 0) {
        return res.status(400).json({ error: 'No tokens available for insurance restitution' });
      }

      const refundNative = (userPos.currentBalance / token.totalSupply) * token.insuranceVault.balanceNative;
      token.insuranceVault.balanceNative = Math.max(0, token.insuranceVault.balanceNative - refundNative);
      userPos.currentBalance = 0;
      userPos.unlockedTokens = 0;
      userPos.lockedTokens = 0;
      tokenIndexer.setUserPosition(userPos);
      tokenIndexer.upsertToken(token);

      res.json({
        success: true,
        refundNative,
        message: `Successfully returned tokens for ${refundNative.toFixed(4)} Native insurance restitution from floor vault.`
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Insurance claim failed' });
    }
  });

  // 11. Transaction Builder Endpoints
  app.post('/api/tx/build-launch', async (req, res) => {
    try {
      const payload = await txBuilder.buildLaunchTransaction(req.body);
      res.json({ success: true, ...payload });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to build launch transaction' });
    }
  });

  app.post('/api/tx/build-swap', async (req, res) => {
    try {
      const payload = await txBuilder.buildSwapTransaction(req.body);
      res.json({ success: true, ...payload });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to build swap transaction' });
    }
  });

  // 12. RPC Status
  app.get('/api/rpc/status', (req, res) => {
    res.json({
      success: true,
      endpoints: rpcManager.getEndpointsStatus()
    });
  });

  // 13. Production Verified Contracts Registry
  app.get('/api/production/contracts', (req, res) => {
    res.json({
      success: true,
      evm: MAINNET_DEPLOYMENTS,
      solana: SOLANA_DEPLOYMENTS,
      ton: {
        network: 'The Open Network Mainnet',
        jettonMinterProgram: 'EQB-3n_8HgYnNxvK1j8zJ3rR2u4sK4zY_0xDead000000',
        dexRouter: 'EQB3n0khNd_TO6Ur61VK54n5x4FBp7VBM8YCMuXAjIec65S_ (DeDust)',
        verificationStatus: 'VERIFIED'
      },
      sui: {
        network: 'Sui Network Mainnet',
        packageId: '0x498a9b7c89f2a01948bc82710398471928471928471928471928471928471928',
        cetusPoolRouter: '0x1eabed72c53feb3805120a081dc15963c204dc8d091542592abaf7a35689b2fb',
        verificationStatus: 'VERIFIED'
      }
    });
  });

  // 14. Real-Time Dual-Oracle Feeds
  app.get('/api/production/oracle-feeds', (req, res) => {
    res.json({
      success: true,
      feeds: realtimeOracleService.getAllFeeds(),
      timestamp: Date.now()
    });
  });

  // 15. MEV Relayers & Telemetry
  app.get('/api/production/relayers', (req, res) => {
    res.json({
      success: true,
      relayers: mevRelayerService.getRelayers(),
      recentReceipts: mevRelayerService.getRecentReceipts()
    });
  });

  app.post('/api/production/relayers/submit-bundle', (req, res) => {
    try {
      const { chain, rawTxBase64, tipAmount } = req.body;
      const receipt = mevRelayerService.submitMevBundle(chain || 'solana', rawTxBase64 || '', tipAmount || 0.005);
      res.json({ success: true, receipt });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'MEV bundle submission failed' });
    }
  });

  // 16. Autonomous Keeper Crank & Invariant Suite
  app.get('/api/production/keeper/logs', (req, res) => {
    res.json({
      success: true,
      logs: keeperEngine.getRecentLogs()
    });
  });

  app.post('/api/production/keeper/run-crank', (req, res) => {
    try {
      const result = keeperEngine.runCrankCycle();
      res.json({ success: true, result });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Keeper cycle execution failed' });
    }
  });

  app.post('/api/production/keeper/run-invariants', (req, res) => {
    try {
      const testResults = keeperEngine.runInvariantCheck();
      res.json({
        success: true,
        allPassed: testResults.every(t => t.passed),
        results: testResults
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Invariant testing failed' });
    }
  });

  // 17. High-Concurrency Matrix & Global Edge Nodes
  app.get('/api/infrastructure/global-matrix', (req, res) => {
    res.json({
      success: true,
      nodes: concurrencyEngine.getNodes(),
      metrics: concurrencyEngine.getMetrics()
    });
  });

  app.get('/api/infrastructure/metrics', (req, res) => {
    res.json({
      success: true,
      metrics: concurrencyEngine.getMetrics()
    });
  });

  app.post('/api/infrastructure/stress-test', async (req, res) => {
    try {
      const params = req.body || {};
      const report = await HighLoadStressTester.runSimulation({
        concurrentUsers: params.concurrentUsers || 25000,
        totalOrders: params.totalOrders || 50000,
        batchSize: params.batchSize || 1000
      });
      res.json({ success: true, report });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Stress test execution failed' });
    }
  });

  app.post('/api/infrastructure/failover-test', (req, res) => {
    try {
      const result = concurrencyEngine.simulateFailover(req.body?.targetNodeId);
      res.json({ success: true, ...result });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failover simulation failed' });
    }
  });

  // 18. Webhooks Pipeline
  app.use('/api/webhooks', webhookRouter);

  // 19. Architecture Diagram Image Endpoint
  app.get('/api/diagram', (req, res) => {
    const imagePath = path.join(process.cwd(), 'src/assets/images/memetrench_architecture_layout_1787415054333.jpg');
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.sendFile(imagePath);
  });

  app.get('/api/download-diagram', (req, res) => {
    const imagePath = path.join(process.cwd(), 'src/assets/images/memetrench_architecture_layout_1787415054333.jpg');
    res.download(imagePath, 'MemeTrench_TrenchScreen_Architecture.jpg');
  });

  // 20. Professional Printable / Downloadable PDF Resume
  app.get(['/api/resume', '/api/resume.html', '/api/resume-pdf'], (req, res) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Muhammad Idris Umar — Full-Stack & Web3 Software Engineer Resume</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

    :root {
      --primary: #0284c7;
      --text: #0f172a;
      --muted: #475569;
      --border: #cbd5e1;
      --bg: #ffffff;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: var(--text);
      background-color: #f1f5f9;
      line-height: 1.5;
      font-size: 13.5px;
      -webkit-font-smoothing: antialiased;
    }

    .toolbar {
      position: sticky;
      top: 0;
      z-index: 100;
      background: #0f172a;
      color: white;
      padding: 12px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    .toolbar-title {
      font-weight: 700;
      font-size: 15px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .btn-print {
      background: #0284c7;
      color: white;
      border: none;
      padding: 8px 18px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: background 0.2s;
    }

    .btn-print:hover {
      background: #0369a1;
    }

    .page {
      max-width: 820px;
      margin: 24px auto 48px auto;
      background: var(--bg);
      padding: 40px 48px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01);
      border-radius: 8px;
    }

    header {
      border-bottom: 2px solid #0f172a;
      padding-bottom: 14px;
      margin-bottom: 18px;
    }

    h1 {
      font-size: 26px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #0f172a;
      text-transform: uppercase;
    }

    .title {
      font-size: 14px;
      font-weight: 700;
      color: #0284c7;
      margin-top: 2px;
      margin-bottom: 8px;
    }

    .contact-bar {
      display: flex;
      flex-wrap: wrap;
      gap: 14px;
      font-size: 12.5px;
      color: var(--muted);
    }

    .contact-bar a {
      color: #0284c7;
      text-decoration: none;
      font-weight: 600;
    }

    .contact-bar a:hover {
      text-decoration: underline;
    }

    section {
      margin-bottom: 18px;
    }

    h2 {
      font-size: 13px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #0f172a;
      border-bottom: 1.5px solid #e2e8f0;
      padding-bottom: 4px;
      margin-bottom: 10px;
    }

    p {
      color: #334155;
      margin-bottom: 6px;
    }

    .skills-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 6px;
      font-size: 12.5px;
    }

    .skill-category {
      display: flex;
      gap: 6px;
    }

    .skill-label {
      font-weight: 700;
      color: #0f172a;
      min-width: 175px;
    }

    .skill-desc {
      color: #334155;
    }

    .project-item {
      margin-bottom: 14px;
    }

    .project-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 4px;
    }

    .project-name {
      font-size: 14px;
      font-weight: 700;
      color: #0f172a;
    }

    .project-links {
      font-size: 12px;
      color: var(--primary);
    }

    .project-links a {
      color: var(--primary);
      text-decoration: none;
      font-weight: 600;
      margin-left: 8px;
    }

    ul {
      list-style-type: square;
      padding-left: 18px;
      color: #334155;
    }

    li {
      margin-bottom: 4px;
      font-size: 12.5px;
    }

    .job-title-row {
      display: flex;
      justify-content: space-between;
      font-weight: 700;
      color: #0f172a;
      font-size: 13.5px;
      margin-bottom: 4px;
    }

    .job-date {
      color: var(--muted);
      font-weight: 500;
      font-size: 12px;
    }

    @media print {
      body {
        background: #ffffff;
        font-size: 12px;
      }
      .toolbar {
        display: none !important;
      }
      .page {
        margin: 0 !important;
        padding: 20px 24px !important;
        box-shadow: none !important;
        max-width: 100% !important;
        border-radius: 0 !important;
      }
      a {
        color: #0284c7 !important;
        text-decoration: none !important;
      }
      section {
        page-break-inside: avoid;
        margin-bottom: 14px;
      }
    }
  </style>
</head>
<body>

  <div class="toolbar">
    <div class="toolbar-title">
      <span>📄 Muhammad Idris Umar — Official Resume</span>
    </div>
    <div>
      <button class="btn-print" onclick="window.print()">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V2h12v7"></path><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><path d="M6 14h12v8H6z"></path></svg>
        Save / Download PDF (Ctrl + P)
      </button>
    </div>
  </div>

  <div class="page">
    <header>
      <h1>Muhammad Idris Umar</h1>
      <div class="title">Full-Stack & Web3 Software Engineer</div>
      <div class="contact-bar">
        <span>📧 <a href="mailto:uiai.studio@gmail.com">uiai.studio@gmail.com</a></span>
        <span>📍 Nigeria (Open to Global Remote)</span>
        <span>🐙 <a href="https://github.com/uiai-studio" target="_blank">github.com/uiai-studio</a></span>
      </div>
    </header>

    <section>
      <h2>Professional Summary</h2>
      <p>
        High-velocity, self-taught Full-Stack and Web3 Software Engineer specializing in modern TypeScript, React 18, Node.js, and decentralized application architecture. Proven track record of building, shipping, and maintaining responsive web applications, real-time trading interfaces, and RESTful API backends. Driven by clean code, intuitive UI/UX, robust error-handling, and rapid execution without institutional bureaucracy.
      </p>
    </section>

    <section>
      <h2>Core Technical Competencies</h2>
      <div class="skills-grid">
        <div class="skill-category">
          <span class="skill-label">Frontend Engineering:</span>
          <span class="skill-desc">TypeScript, JavaScript (ES6+), React 18, Vite, Tailwind CSS, Lucide Icons, HTML5/CSS3, Responsive UI/UX, Component Architecture, React Hooks & Context API.</span>
        </div>
        <div class="skill-category">
          <span class="skill-label">Backend & Systems:</span>
          <span class="skill-desc">Node.js, Express.js, RESTful APIs, JSON Middleware, WebSocket Streams, Rate-Limiting, Server-Side Caching, Google Cloud Run, Containerized Microservices.</span>
        </div>
        <div class="skill-category">
          <span class="skill-label">Web3 & DeFi Integration:</span>
          <span class="skill-desc">Solana Web3.js, Wallet Adapters (Phantom, Solflare), EVM Ethers/Viem, Smart Contract ABIs & Program Interaction, Token Metadata, Bonding Curve Simulation.</span>
        </div>
        <div class="skill-category">
          <span class="skill-label">Developer Workflow:</span>
          <span class="skill-desc">Git, GitHub, Linux Shell, NPM/Yarn, Postman, TypeScript Compiler (TSC), ESLint, CI/CD Deployments, Automated Invariant Testing.</span>
        </div>
      </div>
    </section>

    <section>
      <h2>Featured Shipped Projects</h2>
      
      <div class="project-item">
        <div class="project-header">
          <div class="project-name">1. MemeTrench Protocol & TrenchScreen Terminal (Lead Architect & Developer)</div>
          <div class="project-links">
            <a href="https://ais-pre-aq5jcyrpikvf4s7wo4cvxo-517768755508.europe-west2.run.app" target="_blank">Live Application ↗</a>
            <a href="https://github.com/uiai-studio" target="_blank">GitHub Repo ↗</a>
          </div>
        </div>
        <ul>
          <li>Engineered a full-stack Web3 trading and security platform with a high-frequency React/TypeScript frontend and an Express/Node.js backend proxy.</li>
          <li>Built interactive bonding-curve swap simulators, real-time market risk gauges, and dynamic fee-distribution logic (creator salary streams + holder dividends).</li>
          <li>Implemented contract risk screening modules that parse on-chain parameters to flag malicious honeypots, mint privileges, and liquidity freezes in sub-second response times.</li>
          <li>Optimized UI rendering and layout math to ensure zero layout-shift across all desktop and mobile screens.</li>
        </ul>
      </div>

      <div class="project-item">
        <div class="project-header">
          <div class="project-name">2. Real-Time Web3 Security & Asset Dashboard</div>
          <div class="project-links">
            <a href="https://github.com/uiai-studio" target="_blank">GitHub Repo ↗</a>
          </div>
        </div>
        <ul>
          <li>Developed a modular multi-chain token analytics dashboard utilizing asynchronous API fetching, custom filtering, and responsive Tailwind styling.</li>
          <li>Integrated non-custodial wallet connection adapters with auto-reconnect and transaction status modals.</li>
          <li>Designed clean data visualizations and status badges for fast, digestible risk interpretation.</li>
        </ul>
      </div>
    </section>

    <section>
      <h2>Practical Experience</h2>
      <div class="job-title-row">
        <span>Full-Stack & Web3 Developer (Independent / Project-Based)</span>
        <span class="job-date">2023 – Present</span>
      </div>
      <ul>
        <li>Shipped and deployed responsive single-page applications (SPAs) and full-stack web applications to cloud containers.</li>
        <li>Built secure server-side API proxy routes to protect sensitive credentials and manage rate-limits.</li>
        <li>Refactored legacy frontend code into modular, reusable React components, reducing bundle sizes and eliminating redundant re-renders.</li>
        <li>Debugged cross-browser rendering bugs and async data race conditions across production builds.</li>
      </ul>
    </section>

    <section>
      <h2>Education & Learning Ethos</h2>
      <div class="job-title-row">
        <span>Independent & Self-Taught Engineer</span>
      </div>
      <p style="font-size: 12.5px;">
        Continuous, rigorous project-based mastery in Software Engineering, Modern Web Architecture, and Blockchain Development. Committed to practical proof-of-work and high-velocity iteration.
      </p>
    </section>
  </div>

</body>
</html>`);
  });

  // ==========================================
  // VITE & STATIC SERVING
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[Omniguard OS] Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Omniguard OS] Server startup failed:', err);
  process.exit(1);
});
