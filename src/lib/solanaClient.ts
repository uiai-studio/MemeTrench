import { 
  Connection, 
  PublicKey, 
  Transaction, 
  SystemProgram, 
  LAMPORTS_PER_SOL,
  TransactionInstruction
} from '@solana/web3.js';
import { 
  TOKEN_2022_PROGRAM_ID, 
  createTransferCheckedInstruction,
  getAssociatedTokenAddressSync
} from '@solana/spl-token';

// Jito Tip Accounts on Solana Mainnet & Devnet
export const JITO_TIP_ACCOUNTS = [
  '96gYZGLnJYVFmbjzopPSU6QiEV5fGqZNyN9nmNhvrZU5',
  'HFqU5x63VTqvQss8hp11i4wVV8bD44PvwucfZ2bU7gRe',
  'Cw8CFyM9FkoMi7K7Crf6HNQqf4uEMzpKw6QNghXLvLkY',
  'ADaUMid9yfUytqMBgopwjb2DTLSokTSzL1zt6iGPaS49',
  'DfXygSm4jCyNCybVYYK6DwvWqjKee8pbDmJGcLWNDXjh',
  'ADuUkR4vqLUMWXxW9gh6D6L8pMSawimctcNZ5pGwDcEt',
  'DttWaMuVvTiduZRnguLF7jNxTgiMBZ1hyAumKUiL2KRL',
  '3AVi9Tg9Uo68tJfuvoKvqKNWKkC5wPdSSdeBnizKZ6jT'
];

export const TRANCHE_PROGRAM_ID = new PublicKey('TRNCH11111111111111111111111111111111111111');
export const TRANSFER_HOOK_PROGRAM_ID = new PublicKey('HOOK221111111111111111111111111111111111111');

export interface SolanaClusterConfig {
  name: 'mainnet-beta' | 'devnet' | 'localnet';
  rpcEndpoint: string;
  wsEndpoint: string;
}

export const CLUSTERS: Record<string, SolanaClusterConfig> = {
  devnet: {
    name: 'devnet',
    rpcEndpoint: 'https://api.devnet.solana.com',
    wsEndpoint: 'wss://api.devnet.solana.com'
  },
  mainnet: {
    name: 'mainnet-beta',
    rpcEndpoint: 'https://api.mainnet-beta.solana.com',
    wsEndpoint: 'wss://api.mainnet-beta.solana.com'
  }
};

/**
 * Solana Web3 & SPL Token-2022 Client for TrancheLaunch OS
 */
export class TrancheSolanaClient {
  private connection: Connection;

  constructor(cluster: 'devnet' | 'mainnet' = 'devnet') {
    this.connection = new Connection(CLUSTERS[cluster].rpcEndpoint, 'confirmed');
  }

  public getConnection(): Connection {
    return this.connection;
  }

  /**
   * Derive ExtraAccountMetaList PDA for SPL Token-2022 Transfer Hook
   */
  public deriveExtraAccountMetaListPDA(mint: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('extra-account-metas'), mint.toBuffer()],
      TRANSFER_HOOK_PROGRAM_ID
    );
  }

  /**
   * Construct Jito MEV Tip Instruction (0.005 - 0.05 SOL tip)
   */
  public createJitoTipInstruction(
    payer: PublicKey,
    tipSol: number = 0.005
  ): TransactionInstruction {
    const randomTipAccount = JITO_TIP_ACCOUNTS[Math.floor(Math.random() * JITO_TIP_ACCOUNTS.length)];
    const tipRecipient = new PublicKey(randomTipAccount);

    return SystemProgram.transfer({
      fromPubkey: payer,
      toPubkey: tipRecipient,
      lamports: Math.floor(tipSol * LAMPORTS_PER_SOL),
    });
  }

  /**
   * Build complete Transfer Checked transaction enforcing 20% tranche transfer hook
   */
  public async buildTransferHookTx(params: {
    payer: PublicKey;
    mint: PublicKey;
    destination: PublicKey;
    amount: bigint;
    decimals?: number;
  }): Promise<Transaction> {
    const { payer, mint, destination, amount, decimals = 6 } = params;

    const sourceAta = getAssociatedTokenAddressSync(mint, payer, false, TOKEN_2022_PROGRAM_ID);
    const destAta = getAssociatedTokenAddressSync(mint, destination, false, TOKEN_2022_PROGRAM_ID);

    const tx = new Transaction();

    // 1. SPL Token-2022 Transfer Checked
    const transferIx = createTransferCheckedInstruction(
      sourceAta,
      mint,
      destAta,
      payer,
      amount,
      decimals,
      [],
      TOKEN_2022_PROGRAM_ID
    );

    tx.add(transferIx);

    // 2. Add Jito MEV Tip for atomic private propagation
    const tipIx = this.createJitoTipInstruction(payer, 0.005);
    tx.add(tipIx);

    const { blockhash } = await this.connection.getLatestBlockhash('confirmed');
    tx.recentBlockhash = blockhash;
    tx.feePayer = payer;

    return tx;
  }
}

export const trancheSolanaClient = new TrancheSolanaClient('devnet');
