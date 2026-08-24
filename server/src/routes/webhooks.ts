import { Router, Request, Response } from 'express';
import { tokenIndexer } from '../services/indexer.ts';

export const webhookRouter = Router();

/**
 * Real Helius Enhanced Webhook Ingestion Endpoint
 * Receives on-chain program transaction logs and syncs with TokenIndexer
 */
webhookRouter.post('/helius', (req: Request, res: Response) => {
  try {
    const webhookSecret = process.env.HELIUS_WEBHOOK_SECRET;
    const authHeader = req.headers['authorization'];

    // Verify secret if configured
    if (webhookSecret && authHeader !== webhookSecret) {
      return res.status(401).json({ error: 'Unauthorized webhook payload' });
    }

    const events = Array.isArray(req.body) ? req.body : [req.body];
    let syncedEvents = 0;

    for (const evt of events) {
      if (!evt) continue;

      // Handle Solana Token Transfers, Swaps, or Program Invocations
      if (evt.type === 'TRANSFER' || evt.type === 'SWAP' || evt.type === 'TOKEN_MINT') {
        const tokenTransfers = evt.tokenTransfers || [];
        for (const transfer of tokenTransfers) {
          const mint = transfer.mint;
          if (mint) {
            const existingToken = tokenIndexer.getByMint(mint);
            if (existingToken) {
              // Update real on-chain volume / trade count
              existingToken.volume24h += Number(transfer.tokenAmount || 0) * existingToken.priceUsd;
              existingToken.trades24hCount += 1;
              tokenIndexer.upsertToken(existingToken);
              syncedEvents++;
            }
          }
        }
      }
    }

    res.json({
      success: true,
      processedEvents: events.length,
      syncedTokens: syncedEvents,
      timestamp: Date.now()
    });
  } catch (error: any) {
    console.error('[Webhook] Helius payload parsing error:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
});

/**
 * Generic Solana Node Webhook Receiver
 */
webhookRouter.post('/solana', (req: Request, res: Response) => {
  res.json({ success: true, message: 'Solana RPC event stream acknowledged' });
});
