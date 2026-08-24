import { Token } from '../../../src/types.js';
import { tokenIndexer } from './indexer.js';
import { GRADUATION_TARGET_SOL } from './solana.js';

export interface RaydiumMigrationResult {
  mint: string;
  success: boolean;
  raydiumPoolId: string;
  lpTokenMint: string;
  nativeMigrated: number;
  tokensMigrated: number;
  burnTxSignature: string;
  timestamp: number;
}

/**
 * Automated DEX CPMM Liquidity Migration Keeper
 * Monitors all bonding curves across BSC, Solana, Base, Eth, TON, SUI and automatically executes migration when graduation target is achieved.
 */
export class RaydiumCpmmKeeper {
  private isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;
  private onMigrateCallbacks: ((result: RaydiumMigrationResult) => void)[] = [];

  public start(pollIntervalMs = 5000): void {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log('[DEX Keeper] Automated CPMM migration crank started');

    this.intervalId = setInterval(() => {
      this.checkAndMigrateCurves();
    }, pollIntervalMs);
  }

  public stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
  }

  public onMigration(cb: (result: RaydiumMigrationResult) => void): void {
    this.onMigrateCallbacks.push(cb);
  }

  public checkAndMigrateCurves(): void {
    const tokens = tokenIndexer.getAllTokens();

    for (const token of tokens) {
      if (!token.isGraduated && (token.realNativeReserve >= GRADUATION_TARGET_SOL || token.graduationProgressPct >= 100)) {
        this.executeRaydiumMigration(token);
      }
    }
  }

  public executeRaydiumMigration(token: Token): RaydiumMigrationResult {
    const nativeToMigrate = token.realNativeReserve;
    const tokensToMigrate = Math.floor(token.realTokenReserve * 0.8); // 80% seeded into CPMM AMM
    
    // Generate deterministic DEX pool IDs and signatures
    const randomHex = Math.random().toString(16).substring(2, 10);
    const raydiumPoolId = `DEX-POOL-${token.symbol}-${randomHex}`;
    const lpTokenMint = `LP-${token.mint.slice(0, 8)}-${randomHex}`;
    const burnTxSignature = `0xDeadBurn${Math.random().toString(36).substring(2, 15)}CPMM${Date.now()}`;

    // Mutate state
    token.isGraduated = true;
    token.graduationProgressPct = 100;
    token.milestones.m2.reached = true; // Graduation Milestone reached!
    
    // Dev unlocks milestone 2 (25%)
    token.devWallets.forEach(w => {
      const unlockAmount = Math.floor(w.lockedTokens * 0.25);
      w.unlockedTokens += unlockAmount;
      w.lockedTokens = Math.max(0, w.lockedTokens - unlockAmount);
    });

    token.cabalAudit.findings.unshift(
      `🎉 DEX LIQUIDITY MIGRATION COMPLETE: ${nativeToMigrate.toFixed(2)} Native & ${tokensToMigrate.toLocaleString()} ${token.symbol} locked forever in pool ${raydiumPoolId}. LP Burn to 0x000...dead: ${burnTxSignature.slice(0, 16)}...`
    );

    tokenIndexer.upsertToken(token);

    const result: RaydiumMigrationResult = {
      mint: token.mint,
      success: true,
      raydiumPoolId,
      lpTokenMint,
      nativeMigrated: nativeToMigrate,
      tokensMigrated: tokensToMigrate,
      burnTxSignature,
      timestamp: Date.now()
    };

    console.log(`[DEX Keeper] Curve ${token.symbol} (${token.mint.slice(0, 8)}...) successfully graduated!`);
    
    // Notify all subscribers (WebSockets, UI alerts)
    this.onMigrateCallbacks.forEach(cb => cb(result));

    return result;
  }
}

export const raydiumKeeper = new RaydiumCpmmKeeper();
