import fs from 'fs';
import path from 'path';
import { Token, UserPosition, Trade } from '../../../src/types.ts';

export interface PersistentDataPayload {
  version: number;
  lastUpdated: number;
  tokens: Token[];
  userPositions: UserPosition[];
  trades: Trade[];
}

export class PersistentStorageEngine {
  private dataDir: string;
  private dbFilePath: string;
  private isSaving: boolean = false;
  private pendingSave: boolean = false;

  constructor() {
    this.dataDir = path.join(process.cwd(), '.data');
    this.dbFilePath = path.join(this.dataDir, 'tranche_launch_db.json');
    this.ensureDirectory();
  }

  private ensureDirectory() {
    try {
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true });
      }
    } catch (e) {
      console.warn('[PersistentStorage] Failed to create .data dir:', e);
    }
  }

  public load(): PersistentDataPayload | null {
    try {
      if (fs.existsSync(this.dbFilePath)) {
        const raw = fs.readFileSync(this.dbFilePath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.tokens)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('[PersistentStorage] Failed to read db file, starting fresh:', e);
    }
    return null;
  }

  public scheduleSave(tokens: Token[], userPositions: UserPosition[], trades: Trade[]) {
    if (this.isSaving) {
      this.pendingSave = true;
      return;
    }

    this.isSaving = true;
    setTimeout(() => {
      this.executeSave(tokens, userPositions, trades);
    }, 100);
  }

  private executeSave(tokens: Token[], userPositions: UserPosition[], trades: Trade[]) {
    try {
      const payload: PersistentDataPayload = {
        version: 1,
        lastUpdated: Date.now(),
        tokens: tokens.slice(0, 10000), // Cap disk dump to most active 10,000 for instant write I/O
        userPositions: userPositions.slice(0, 5000),
        trades: trades.slice(0, 2000)
      };

      const tempPath = `${this.dbFilePath}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(payload, null, 2), 'utf-8');
      fs.renameSync(tempPath, this.dbFilePath);
    } catch (err) {
      console.error('[PersistentStorage] Error writing snapshot to disk:', err);
    } finally {
      this.isSaving = false;
      if (this.pendingSave) {
        this.pendingSave = false;
        this.scheduleSave(tokens, userPositions, trades);
      }
    }
  }
}

export const persistentStorage = new PersistentStorageEngine();
