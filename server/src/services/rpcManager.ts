import { Connection, Commitment } from '@solana/web3.js';

export interface RpcEndpointConfig {
  name: string;
  url: string;
  weight: number;
  isHealthy: boolean;
  latencyMs: number;
  lastChecked: number;
}

export class MultiRpcManager {
  private endpoints: RpcEndpointConfig[] = [];
  private connections: Map<string, Connection> = new Map();
  private currentIndex: number = 0;
  private commitment: Commitment = 'confirmed';

  constructor() {
    this.initializeEndpoints();
    // Do health checks non-blockingly
    setTimeout(() => {
      this.checkHealth().catch(() => {});
      this.startHealthCheckLoop();
    }, 2000);
  }

  private initializeEndpoints() {
    const heliusUrl = process.env.HELIUS_RPC_URL;
    const defaultRpc = process.env.SOLANA_RPC_ENDPOINT || 'https://api.devnet.solana.com';
    const network = process.env.SOLANA_NETWORK || 'devnet';

    if (heliusUrl && heliusUrl.trim() !== '') {
      this.addEndpoint('Helius Dedicated RPC', heliusUrl, 10);
    }

    if (defaultRpc) {
      this.addEndpoint('Primary Configured RPC', defaultRpc, 8);
    }

    // Fallbacks
    if (network === 'devnet') {
      this.addEndpoint('Solana Public Devnet', 'https://api.devnet.solana.com', 5);
      this.addEndpoint('Ankr Public Devnet', 'https://rpc.ankr.com/solana_devnet', 4);
    } else {
      this.addEndpoint('Solana Public Mainnet', 'https://api.mainnet-beta.solana.com', 5);
      this.addEndpoint('Ankr Public Mainnet', 'https://rpc.ankr.com/solana', 4);
    }
  }

  public addEndpoint(name: string, url: string, weight: number = 5) {
    if (this.endpoints.some(e => e.url === url)) return;

    const endpoint: RpcEndpointConfig = {
      name,
      url,
      weight,
      isHealthy: true,
      latencyMs: 0,
      lastChecked: 0
    };

    this.endpoints.push(endpoint);
    try {
      this.connections.set(url, new Connection(url, { commitment: this.commitment }));
    } catch (e) {
      console.warn(`[RpcManager] Failed to init connection for ${url}:`, e);
    }
  }

  public getConnection(): Connection {
    const healthyEndpoints = this.endpoints.filter(e => e.isHealthy);
    if (healthyEndpoints.length === 0) {
      const first = this.endpoints[0];
      return this.connections.get(first?.url || '') || new Connection('https://api.devnet.solana.com');
    }

    this.currentIndex = (this.currentIndex + 1) % healthyEndpoints.length;
    const selected = healthyEndpoints[this.currentIndex];
    return this.connections.get(selected.url) || new Connection('https://api.devnet.solana.com');
  }

  public getEndpointsStatus(): RpcEndpointConfig[] {
    return [...this.endpoints];
  }

  public async checkHealth(): Promise<void> {
    for (const endpoint of this.endpoints) {
      const conn = this.connections.get(endpoint.url);
      if (!conn) continue;

      const start = Date.now();
      try {
        const slot = await Promise.race([
          conn.getSlot('processed'),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2500))
        ]);
        endpoint.latencyMs = Date.now() - start;
        endpoint.isHealthy = typeof slot === 'number';
        endpoint.lastChecked = Date.now();
      } catch {
        endpoint.isHealthy = false;
        endpoint.latencyMs = -1;
        endpoint.lastChecked = Date.now();
      }
    }
  }

  private startHealthCheckLoop() {
    setInterval(() => {
      this.checkHealth().catch(() => {});
    }, 45000);
  }
}

export const rpcManager = new MultiRpcManager();
